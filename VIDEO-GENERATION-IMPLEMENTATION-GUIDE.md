# 章节视频生成系统 - 快速实施指南

根据审计报告，本指南提供按优先级实施的详细步骤。

---

## ✅ 已完成（P0 - 立即修复）

### 1. 接口规范问题修复 ✅

**修改内容**:

1. **video-generation.controller.ts** ✅
   ```typescript
   // ❌ 之前
   @Controller('video-generation')
   @ApiBearerAuth()
   
   // ✅ 修改后
   @Controller()
   @ApiBearerAuth('JWT-auth')
   ```

2. **consistency.controller.ts** ✅
   ```typescript
   // ❌ 之前
   @Controller('consistency')
   @ApiBearerAuth()
   
   // ✅ 修改后
   @Controller()
   @ApiBearerAuth('JWT-auth')
   ```

3. **chapter.controller.ts** (DELETE接口) ✅
   ```typescript
   // ❌ 之前
   @HttpCode(HttpStatus.NO_CONTENT)
   async deleteVideo(...) {
     return this.chapterService.deleteVideo(novelId, id, req.user.id);
   }
   
   // ✅ 修改后
   @HttpCode(HttpStatus.OK)
   async deleteVideo(...) {
     await this.chapterService.deleteVideo(novelId, id, req.user.id);
     return { message: '视频删除成功' };
   }
   ```

4. **novel.controller.ts** (API Gateway) ✅
   ```typescript
   // 新增 consistency 路由
   @All('consistency*')
   async proxyConsistency(@Req() req: Request, @Res() res: Response) {
     return this.proxyToNovelService(req, res);
   }
   ```

**测试方法**:
```bash
# 1. 重启服务
cd 91Writing-Backend
npm run start:dev

# 2. 测试视频生成接口
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"chapterId":"xxx","sceneCount":5}'

# 3. 测试一致性接口
curl -X GET http://localhost:3000/api/novel/consistency/novelId \
  -H "Authorization: Bearer <token>"

# 4. 测试DELETE接口
curl -X DELETE http://localhost:3000/api/novel/novels/xxx/chapters/xxx/video \
  -H "Authorization: Bearer <token>"
```

---

## 🔧 待实施（P1 - 高优先级）

### 2. API密钥配置管理（预计1天）

#### 2.1 创建数据库模型

**文件**: `91Writing-Backend/prisma/schema.prisma`

```prisma
// 视频API配置表
model VideoAPIConfig {
  id          String   @id @default(cuid())
  
  // API密钥（加密存储）
  volcengineAccessKeyId     String?  @db.Text
  volcengineSecretAccessKey String?  @db.Text  // 加密
  jimengApiKey              String?  @db.Text  // 加密
  klingApiKey               String?  @db.Text  // 加密
  
  // Provider配置
  videoProvider      String  @default("jimeng")  // jimeng | kling
  
  // 路径配置
  ffmpegPath         String  @default("/usr/bin/ffmpeg")
  videoStoragePath   String  @default("/data/videos")
  tempStoragePath    String  @default("/tmp/video-generation")
  
  // 成本控制
  userDailyQuota     Int     @default(5)        // 用户每日配额
  userMonthlyQuota   Int     @default(50)       // 用户每月配额
  monthlyBudget      Float   @default(1000.0)   // 月度预算（元）
  costAlertThreshold Float   @default(800.0)    // 成本警报阈值
  
  // 健康检查
  isActive           Boolean @default(true)
  lastHealthCheck    DateTime?
  healthStatus       String? // healthy | degraded | unhealthy
  
  // 审计信息
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  updatedBy   String?  // 管理员ID
  
  @@map("video_api_configs")
}

// API使用日志表
model VideoAPIUsageLog {
  id          String   @id @default(cuid())
  
  userId      String
  chapterId   String
  
  provider    String   // volcengine | jimeng | kling
  apiType     String   // text-to-image | image-to-video
  
  requestCost Float    // 请求成本
  success     Boolean  // 是否成功
  errorMessage String? @db.Text
  
  createdAt   DateTime @default(now())
  
  @@map("video_api_usage_logs")
  @@index([userId, createdAt])
  @@index([provider, createdAt])
}

// 用户视频配额表
model UserVideoQuota {
  id          String   @id @default(cuid())
  
  userId      String   @unique
  
  dailyUsed   Int      @default(0)
  dailyLimit  Int      @default(5)
  dailyResetAt DateTime
  
  monthlyUsed Int      @default(0)
  monthlyLimit Int     @default(50)
  monthlyResetAt DateTime
  
  totalGenerated Int   @default(0)
  totalCost   Float   @default(0.0)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("user_video_quotas")
}
```

**执行迁移**:
```bash
cd 91Writing-Backend
npx prisma migrate dev --name add_video_api_config_tables
npx prisma generate
```

**初始化种子数据**:
```sql
INSERT INTO video_api_configs (
  id,
  videoProvider,
  ffmpegPath,
  videoStoragePath,
  tempStoragePath,
  userDailyQuota,
  userMonthlyQuota,
  monthlyBudget,
  costAlertThreshold,
  isActive,
  createdAt,
  updatedAt
) VALUES (
  'default_config',
  'jimeng',
  '/usr/bin/ffmpeg',
  '/data/videos',
  '/tmp/video-generation',
  5,
  50,
  1000.0,
  800.0,
  true,
  NOW(),
  NOW()
);
```

#### 2.2 创建后端服务

**文件**: `91Writing-Backend/apps/admin-service/src/modules/video-api-config/`

**目录结构**:
```
video-api-config/
├── video-api-config.controller.ts
├── video-api-config.service.ts
├── video-api-config.module.ts
└── dto/
    ├── update-video-api-config.dto.ts
    └── video-api-config-response.dto.ts
```

**video-api-config.service.ts**:
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

@Injectable()
export class VideoAPIConfigService {
  private readonly logger = new Logger(VideoAPIConfigService.name);
  private readonly encryptionKey: Buffer;
  private readonly algorithm = 'aes-256-cbc';

  constructor(private readonly prisma: PrismaService) {
    // 从环境变量获取加密密钥（32字节）
    const key = process.env.ENCRYPTION_KEY || 'default-32-char-encryption-key';
    this.encryptionKey = Buffer.from(key.padEnd(32, '0').slice(0, 32));
  }

  /**
   * 获取当前配置
   */
  async getCurrentConfig() {
    let config = await this.prisma.videoAPIConfig.findFirst({
      where: { id: 'default_config' },
    });

    if (!config) {
      // 创建默认配置
      config = await this.prisma.videoAPIConfig.create({
        data: {
          id: 'default_config',
          videoProvider: 'jimeng',
        },
      });
    }

    // 解密敏感信息
    return {
      ...config,
      volcengineSecretAccessKey: config.volcengineSecretAccessKey
        ? this.decrypt(config.volcengineSecretAccessKey)
        : null,
      jimengApiKey: config.jimengApiKey ? this.decrypt(config.jimengApiKey) : null,
      klingApiKey: config.klingApiKey ? this.decrypt(config.klingApiKey) : null,
    };
  }

  /**
   * 更新配置（管理员）
   */
  async updateConfig(adminId: string, data: any) {
    // 加密敏感字段
    const encrypted = {
      ...data,
      volcengineSecretAccessKey: data.volcengineSecretAccessKey
        ? this.encrypt(data.volcengineSecretAccessKey)
        : undefined,
      jimengApiKey: data.jimengApiKey ? this.encrypt(data.jimengApiKey) : undefined,
      klingApiKey: data.klingApiKey ? this.encrypt(data.klingApiKey) : undefined,
      updatedBy: adminId,
    };

    return this.prisma.videoAPIConfig.update({
      where: { id: 'default_config' },
      data: encrypted,
    });
  }

  /**
   * 检查用户配额
   */
  async checkUserQuota(userId: string): Promise<{
    available: boolean;
    dailyRemaining: number;
    monthlyRemaining: number;
  }> {
    const now = new Date();
    
    // 获取或创建用户配额记录
    let quota = await this.prisma.userVideoQuota.findUnique({
      where: { userId },
    });

    if (!quota) {
      const config = await this.getCurrentConfig();
      quota = await this.prisma.userVideoQuota.create({
        data: {
          userId,
          dailyLimit: config.userDailyQuota,
          dailyUsed: 0,
          dailyResetAt: this.getNextDayStart(),
          monthlyLimit: config.userMonthlyQuota,
          monthlyUsed: 0,
          monthlyResetAt: this.getNextMonthStart(),
        },
      });
    }

    // 检查是否需要重置
    if (now >= quota.dailyResetAt) {
      quota = await this.prisma.userVideoQuota.update({
        where: { userId },
        data: {
          dailyUsed: 0,
          dailyResetAt: this.getNextDayStart(),
        },
      });
    }

    if (now >= quota.monthlyResetAt) {
      quota = await this.prisma.userVideoQuota.update({
        where: { userId },
        data: {
          monthlyUsed: 0,
          monthlyResetAt: this.getNextMonthStart(),
        },
      });
    }

    // 检查配额
    const dailyAvailable = quota.dailyUsed < quota.dailyLimit;
    const monthlyAvailable = quota.monthlyUsed < quota.monthlyLimit;
    const available = dailyAvailable && monthlyAvailable;

    return {
      available,
      dailyRemaining: Math.max(0, quota.dailyLimit - quota.dailyUsed),
      monthlyRemaining: Math.max(0, quota.monthlyLimit - quota.monthlyUsed),
    };
  }

  /**
   * 消费配额
   */
  async consumeQuota(userId: string) {
    await this.prisma.userVideoQuota.update({
      where: { userId },
      data: {
        dailyUsed: { increment: 1 },
        monthlyUsed: { increment: 1 },
        totalGenerated: { increment: 1 },
      },
    });
  }

  /**
   * 记录API使用
   */
  async logApiUsage(log: {
    userId: string;
    chapterId: string;
    provider: string;
    apiType: string;
    requestCost: number;
    success: boolean;
    errorMessage?: string;
  }) {
    await this.prisma.videoAPIUsageLog.create({
      data: log,
    });

    // 更新用户总成本
    await this.prisma.userVideoQuota.update({
      where: { userId: log.userId },
      data: {
        totalCost: { increment: log.requestCost },
      },
    });
  }

  /**
   * 获取成本统计
   */
  async getCostStatistics(startDate: Date, endDate: Date) {
    const logs = await this.prisma.videoAPIUsageLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalCost = logs.reduce((sum, log) => sum + log.requestCost, 0);
    const successCount = logs.filter(log => log.success).length;
    const failureCount = logs.length - successCount;

    return {
      totalCost,
      totalRequests: logs.length,
      successCount,
      failureCount,
      successRate: logs.length > 0 ? (successCount / logs.length) * 100 : 0,
    };
  }

  /**
   * 加密
   */
  private encrypt(text: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * 解密
   */
  private decrypt(text: string): string {
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = createDecipheriv(this.algorithm, this.encryptionKey, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  private getNextDayStart(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }

  private getNextMonthStart(): Date {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    nextMonth.setHours(0, 0, 0, 0);
    return nextMonth;
  }
}
```

**video-api-config.controller.ts**:
```typescript
import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminAuthGuard, RoleGuard, Roles } from '@app/common';
import { VideoAPIConfigService } from './video-api-config.service';

@ApiTags('视频API配置')
@Controller()
@UseGuards(AdminAuthGuard, RoleGuard)
@ApiBearerAuth('JWT-auth')
export class VideoAPIConfigController {
  constructor(private readonly configService: VideoAPIConfigService) {}

  @Get('video-api-config')
  @Roles('ADMIN')
  @ApiOperation({ summary: '获取视频API配置' })
  @ApiResponse({ status: 200, description: '返回配置' })
  async getConfig() {
    return this.configService.getCurrentConfig();
  }

  @Put('video-api-config')
  @Roles('ADMIN')
  @ApiOperation({ summary: '更新视频API配置' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateConfig(@Body() updateDto: any, @Req() req: any) {
    return this.configService.updateConfig(req.user.id, updateDto);
  }

  @Get('video-api-config/statistics')
  @Roles('ADMIN')
  @ApiOperation({ summary: '获取成本统计' })
  async getStatistics() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return this.configService.getCostStatistics(startOfMonth, now);
  }
}
```

#### 2.3 修改现有服务使用配置

**video-generation.service.ts** (关键修改):
```typescript
export class VideoGenerationService {
  constructor(
    // ... 现有依赖
    private readonly videoConfigService: VideoAPIConfigService,
  ) {}

  async generateChapterVideo(userId: string, dto: GenerateVideoDto) {
    // 1. 检查配额
    const quota = await this.videoConfigService.checkUserQuota(userId);
    if (!quota.available) {
      throw new ForbiddenException(
        `已达配额限制。每日剩余: ${quota.dailyRemaining}, 每月剩余: ${quota.monthlyRemaining}`
      );
    }

    // 2. 获取配置
    const config = await this.videoConfigService.getCurrentConfig();

    // 3. 使用配置中的Provider
    const videoProvider = config.videoProvider === 'jimeng' 
      ? this.jimengProvider 
      : this.klingProvider;

    try {
      // ... 生成流程 ...

      // 4. 记录成功的API使用
      await this.videoConfigService.logApiUsage({
        userId,
        chapterId: dto.chapterId,
        provider: 'volcengine',
        apiType: 'text-to-image',
        requestCost: 0.1,
        success: true,
      });

      // 5. 消费配额
      await this.videoConfigService.consumeQuota(userId);

    } catch (error) {
      // 记录失败
      await this.videoConfigService.logApiUsage({
        userId,
        chapterId: dto.chapterId,
        provider: config.videoProvider,
        apiType: 'video-generation',
        requestCost: 0,
        success: false,
        errorMessage: error.message,
      });
      throw error;
    }
  }
}
```

#### 2.4 创建前端管理界面

**文件**: `src/views/admin/settings/VideoAPIConfigAdmin.vue`

**完整代码**: 见审计报告第3.4节

---

## 🎯 待实施（P2 - 中优先级）

### 3. 人物一致性自动化（预计2-3天）

详见审计报告第4节。

核心改动：
1. 新增 `CharacterFeature` 数据库表
2. 修改 `StoryboardAgentService` 添加自动提取
3. 修改 `ImageGenerationAgentService` 使用自动特征
4. 修改 `VideoGenerationService` 存储参考图
5. 创建 `NovelConsistencySettings.vue` 查看界面

---

## 📝 总结

### 已完成
- ✅ P0: 接口规范问题修复（3个文件）
- ✅ API Gateway路由配置

### 待完成（按优先级）
1. 🔥 P1: API密钥配置管理系统（1天）
2. ⚠️ P2: 人物一致性自动化（2-3天）
3. 📝 P3: Agent配置管理界面（1天）

### 下一步行动
1. 执行数据库迁移（添加VideoAPIConfig表）
2. 创建VideoAPIConfigService
3. 创建管理界面
4. 测试完整流程

---

**文档版本**: v1.0  
**更新日期**: 2025-01-21  
**负责人**: 开发团队


