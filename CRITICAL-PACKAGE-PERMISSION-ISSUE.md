# 🚨 严重问题：套餐权限鉴权缺失

发现日期: 2025-01-21  
严重程度: 🔥🔥🔥 **高危**  
影响: **商业化完全失效**  

---

## 🚨 问题描述

### 核心问题

**所有付费功能都没有做套餐权限和次数鉴权！**

这意味着：
- ❌ 免费用户可以无限使用所有付费功能
- ❌ 基础版和企业版用户体验完全一样
- ❌ 套餐配置形同虚设
- ❌ 无法实现差异化收费
- ❌ **商业模式完全失效**

---

## 📋 受影响的功能

### 1. AI写作助手 ❌ **无鉴权**

**文件**: `apps/ai-service/src/modules/assistant/assistant.service.ts`

**当前代码**:
```typescript
async initializeSession(userId, initDto) {
  // ❌ 只检查了资源权限
  const novel = await this.prisma.novel.findFirst({
    where: { id: initDto.novelId, userId }
  });
  
  if (!novel) {
    throw new NotFoundException('小说不存在');
  }
  
  // ❌ 直接创建会话，没有任何权限检查
  // ❌ 没有检查套餐
  // ❌ 没有检查配额
  // ❌ 没有扣除次数
  
  return session;
}
```

**缺失的检查**:
- ❌ 是否有AI写作权限
- ❌ 每日配额是否还有剩余
- ❌ 可用模型是否在套餐范围
- ❌ 使用后是否扣除次数

---

### 2. 内容生成 ❌ **无鉴权**

**文件**: `apps/ai-service/src/modules/generation/generation.service.ts`

**当前代码**:
```typescript
async generateContent(userId, dto) {
  // ❌ 只检查了资源权限
  const novel = await this.prisma.novel.findFirst({
    where: { id: dto.novelId, userId }
  });
  
  // ❌ 直接调用AI，没有任何权限检查
  const response = await this.aiCallerService.callAI({...});
  
  return response;
}
```

**缺失的检查**:
- ❌ 套餐是否允许内容生成
- ❌ 每日配额检查
- ❌ 生成长度是否在套餐限制内

---

### 3. 视频生成 ❌ **无鉴权**

**文件**: `apps/ai-service/src/modules/video-generation/video-generation.service.ts`

**当前代码**:
```typescript
async generateChapterVideo(userId, dto) {
  // ❌ 只检查了章节权限
  const chapter = await this.prisma.chapter.findFirst({
    where: { id: dto.chapterId }
  });
  
  if (chapter.novel.userId !== userId) {
    throw new NotFoundException('无权访问');
  }
  
  // ❌ 直接开始生成，没有任何权限检查
  // ❌ 没有检查套餐是否允许视频生成
  // ❌ 没有检查配额
  // ❌ 没有扣除次数
  
  return this.executeGeneration(...);
}
```

**缺失的检查**:
- ❌ 套餐是否启用视频生成
- ❌ 每日/每月配额是否充足
- ❌ 参数是否在套餐允许范围
- ❌ 使用后是否扣除配额

---

### 4. 写作建议 ❌ **无鉴权**

**文件**: `apps/ai-service/src/modules/suggestion/suggestion.service.ts`

**预计问题**: 同样缺少权限检查

---

## 💰 商业影响

### 当前状态（严重）

```
免费用户:
  ✅ 可以无限使用AI写作助手
  ✅ 可以无限生成内容
  ✅ 可以无限生成视频  ← 每个¥7.6成本
  ✅ 可以使用所有高级功能
  
基础版用户（¥50/月）:
  ✅ 体验和免费用户一模一样
  ❌ 付费没有任何价值
  
专业版用户（¥200/月）:
  ✅ 体验和免费用户一模一样
  ❌ 付费没有任何价值
```

**后果**:
- 🔥 **免费用户可以无限消耗成本**（每生成1个视频¥7.6）
- 🔥 **付费用户没有任何优势**
- 🔥 **商业模式完全失效**
- 🔥 **成本无法控制**，可能亏损

---

## ✅ 完整解决方案

### 架构设计

```
每个付费功能调用前:
  ↓
1. 获取用户套餐
  ↓
2. 检查功能是否启用
  ↓
3. 检查配额是否充足
  ↓
4. 验证参数是否在范围
  ↓
5. 执行功能
  ↓
6. 扣除配额
  ↓
7. 记录使用日志
```

---

### 方案1: 创建统一权限中间件

**文件**: `libs/common/src/guards/package-feature.guard.ts`

```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '@app/database';

@Injectable()
export class PackageFeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. 获取需要的功能和配额类型
    const requiredFeature = this.reflector.get<string>('feature', context.getHandler());
    const quotaType = this.reflector.get<string>('quotaType', context.getHandler());
    
    if (!requiredFeature) {
      return true; // 没有标记则不检查
    }

    // 2. 获取用户信息
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId || request.user?.id;

    if (!userId) {
      throw new ForbiddenException('未登录');
    }

    // 3. 获取用户订阅
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      include: { package: true },
    });

    // 4. 检查功能权限
    if (!subscription || subscription.status !== 'ACTIVE') {
      // 免费用户
      const allowed = await this.checkFreeUserAccess(requiredFeature);
      if (!allowed) {
        throw new ForbiddenException('该功能需要订阅套餐');
      }
      return true;
    }

    // 5. 检查套餐是否包含该功能
    const features = subscription.package.features as any;
    const featureConfig = features[requiredFeature];

    if (!featureConfig || !featureConfig.enabled) {
      throw new ForbiddenException(`当前套餐不包含${this.getFeatureName(requiredFeature)}功能`);
    }

    // 6. 检查配额（如果需要）
    if (quotaType) {
      const quotaAvailable = await this.checkQuota(userId, requiredFeature, quotaType);
      if (!quotaAvailable) {
        throw new ForbiddenException('已达配额限制，请升级套餐或等待重置');
      }
    }

    // 7. 将权限信息附加到request
    request.packageLimits = featureConfig;
    request.packageName = subscription.package.name;

    return true;
  }

  private async checkFreeUserAccess(feature: string): Promise<boolean> {
    // 免费用户可以使用哪些功能？
    const freeFunctions = ['aiWriting'];  // 仅基础AI写作
    return freeFunctions.includes(feature);
  }

  private async checkQuota(userId: string, feature: string, quotaType: string): Promise<boolean> {
    // 查询或创建配额记录
    const today = new Date().toISOString().split('T')[0];
    
    const quota = await this.prisma.featureQuota.findUnique({
      where: {
        userId_feature_date: {
          userId,
          feature,
          date: new Date(today),
        },
      },
    });

    if (!quota) {
      return true; // 今天首次使用
    }

    // 检查是否还有剩余
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      include: { package: true },
    });

    const features = subscription.package.features as any;
    const limit = features[feature]?.dailyQuota || 0;

    return quota.usedCount < limit;
  }

  private getFeatureName(feature: string): string {
    const names = {
      'videoGeneration': '视频生成',
      'aiWriting': 'AI写作',
      'aiAssistant': 'AI助手',
      'materialGeneration': '素材生成',
    };
    return names[feature] || feature;
  }
}
```

---

### 方案2: 创建配额管理服务

**文件**: `libs/common/src/services/feature-quota.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@app/database';

@Injectable()
export class FeatureQuotaService {
  private readonly logger = new Logger(FeatureQuotaService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 检查并消费配额
   */
  async checkAndConsumeQuota(
    userId: string,
    feature: string,  // videoGeneration, aiWriting, etc.
    quotaType: 'daily' | 'monthly' = 'daily',
  ): Promise<{
    allowed: boolean;
    remaining: number;
    limit: number;
    message?: string;
  }> {
    // 1. 获取用户套餐
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      include: { package: true },
    });

    // 2. 获取限额
    let limit = 0;
    if (subscription && subscription.status === 'ACTIVE') {
      const features = subscription.package.features as any;
      const featureConfig = features[feature];
      limit = quotaType === 'daily' ? featureConfig?.dailyQuota : featureConfig?.monthlyQuota;
    }

    if (limit === 0) {
      return {
        allowed: false,
        remaining: 0,
        limit: 0,
        message: '当前套餐不包含此功能或配额为0'
      };
    }

    // 3. 获取或创建配额记录
    const date = quotaType === 'daily' ? this.getTodayDate() : this.getMonthStartDate();
    
    let quota = await this.prisma.featureQuota.findUnique({
      where: {
        userId_feature_quotaType_date: {
          userId,
          feature,
          quotaType,
          date,
        },
      },
    });

    if (!quota) {
      quota = await this.prisma.featureQuota.create({
        data: {
          userId,
          feature,
          quotaType,
          date,
          usedCount: 0,
          limit,
        },
      });
    }

    // 4. 检查是否还有剩余
    const remaining = Math.max(0, limit - quota.usedCount);

    if (remaining <= 0) {
      return {
        allowed: false,
        remaining: 0,
        limit,
        message: `已达${quotaType === 'daily' ? '每日' : '每月'}配额限制（${limit}次）`
      };
    }

    // 5. 扣除配额
    await this.prisma.featureQuota.update({
      where: { id: quota.id },
      data: {
        usedCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });

    this.logger.log(`用户${userId}消费${feature}配额，剩余${remaining - 1}/${limit}`);

    return {
      allowed: true,
      remaining: remaining - 1,
      limit,
    };
  }

  /**
   * 查询配额（不扣除）
   */
  async getQuotaStatus(userId: string, feature: string) {
    // 获取每日和每月剩余配额
    const daily = await this.getQuotaRemaining(userId, feature, 'daily');
    const monthly = await this.getQuotaRemaining(userId, feature, 'monthly');

    return {
      daily,
      monthly,
    };
  }

  private async getQuotaRemaining(userId: string, feature: string, quotaType: string) {
    const date = quotaType === 'daily' ? this.getTodayDate() : this.getMonthStartDate();
    
    const quota = await this.prisma.featureQuota.findUnique({
      where: {
        userId_feature_quotaType_date: {
          userId,
          feature,
          quotaType,
          date,
        },
      },
    });

    if (!quota) {
      // 获取套餐限额
      const subscription = await this.prisma.subscription.findUnique({
        where: { userId },
        include: { package: true },
      });

      if (subscription && subscription.status === 'ACTIVE') {
        const features = subscription.package.features as any;
        const featureConfig = features[feature];
        const limit = quotaType === 'daily' ? featureConfig?.dailyQuota : featureConfig?.monthlyQuota;
        return {
          used: 0,
          remaining: limit || 0,
          limit: limit || 0,
        };
      }

      return {
        used: 0,
        remaining: 0,
        limit: 0,
      };
    }

    return {
      used: quota.usedCount,
      remaining: Math.max(0, quota.limit - quota.usedCount),
      limit: quota.limit,
    };
  }

  private getTodayDate(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  private getMonthStartDate(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
}
```

---

### 方案3: 新增配额数据库表

**文件**: `prisma/schema.prisma`

**新增表**:
```prisma
// 功能配额使用记录表
model FeatureQuota {
  id          String   @id @default(cuid())
  
  userId      String   @map("user_id")
  feature     String   // videoGeneration, aiWriting, aiAssistant, materialGeneration
  quotaType   String   @map("quota_type")  // daily | monthly
  date        DateTime @db.Date  // 配额日期
  
  usedCount   Int      @default(0) @map("used_count")  // 已使用次数
  limit       Int      // 限额
  
  lastUsedAt  DateTime? @map("last_used_at")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  @@unique([userId, feature, quotaType, date], name: "userId_feature_quotaType_date")
  @@index([userId, feature])
  @@index([date])
  @@map("feature_quotas")
}
```

---

### 方案4: 修改所有付费功能添加鉴权

#### 4.1 AI写作助手

**修改**: `apps/ai-service/src/modules/assistant/assistant.controller.ts`

```typescript
import { PackageFeatureGuard } from '@app/common';
import { RequireFeature } from '@app/common';

@Controller()
@UseGuards(JwtAuthGuard, PackageFeatureGuard)  // ✅ 添加权限守卫
export class AssistantController {
  
  @Post('initialize')
  @RequireFeature('aiAssistant')  // ✅ 标记需要的功能
  @RequireQuota('daily')  // ✅ 标记需要扣除每日配额
  async initializeSession(@Req() req, @Body() dto: InitializeSessionDto) {
    // PackageFeatureGuard会自动检查权限和配额
    return this.assistantService.initializeSession(req.user.userId, dto);
  }

  @Post('chat')
  @RequireFeature('aiAssistant')
  @RequireQuota('daily')
  async chat(@Req() req, @Body() dto: ConversationDto) {
    return this.assistantService.chat(req.user.userId, dto);
  }
}
```

#### 4.2 内容生成

**修改**: `apps/ai-service/src/modules/generation/generation.controller.ts`

```typescript
@Controller()
@UseGuards(JwtAuthGuard, PackageFeatureGuard)
export class GenerationController {
  
  @Post('generate')
  @RequireFeature('aiWriting')  // ✅ 需要AI写作权限
  @RequireQuota('daily')  // ✅ 每次调用扣除配额
  async generateContent(@Req() req, @Body() dto: GenerateContentDto) {
    return this.generationService.generateContent(req.user.userId, dto);
  }
}
```

#### 4.3 视频生成

**修改**: `apps/ai-service/src/modules/video-generation/video-generation.controller.ts`

```typescript
@Controller()
@UseGuards(JwtAuthGuard, PackageFeatureGuard)
export class VideoGenerationController {
  
  @Post('generate')
  @RequireFeature('videoGeneration')  // ✅ 需要视频生成权限
  @RequireQuota('daily')  // ✅ 扣除每日配额
  async generateVideo(@Req() req, @Body() dto: GenerateVideoDto) {
    // PackageFeatureGuard已经检查了权限和配额
    return this.videoGenerationService.generateChapterVideo(req.user.userId, dto);
  }
}
```

---

## 🔧 实施步骤

### Step 1: 创建配额表

```bash
# 修改 schema.prisma 添加 FeatureQuota 表
# 然后执行
npx prisma db push
npx prisma generate
```

### Step 2: 创建权限服务和守卫

创建文件:
1. `libs/common/src/guards/package-feature.guard.ts`
2. `libs/common/src/decorators/require-feature.decorator.ts`
3. `libs/common/src/services/feature-quota.service.ts`

### Step 3: 修改所有付费功能Controller

添加守卫:
1. `apps/ai-service/src/modules/assistant/assistant.controller.ts`
2. `apps/ai-service/src/modules/generation/generation.controller.ts`
3. `apps/ai-service/src/modules/video-generation/video-generation.controller.ts`
4. `apps/ai-service/src/modules/suggestion/suggestion.controller.ts`

### Step 4: 初始化套餐配置

确保所有套餐都有完整的features配置:

```sql
-- 执行
mysql -u root -p writing_platform < prisma/seeds/package-complete-features.seed.sql
```

---

## 📊 修复后的效果

### 免费用户

```
使用AI助手:
  ↓
检查套餐: 免费套餐
  ↓
检查权限: aiAssistant.enabled = true ✅
检查配额: 100次/天
  ↓
第101次:
  ↓
❌ 403 Forbidden: "已达每日配额限制（100次），请升级套餐"
```

### 基础版用户（¥50/月）

```
生成视频:
  ↓
检查套餐: 基础套餐
  ↓
检查权限: videoGeneration.enabled = true ✅
检查配额: 2次/天
  ↓
第1次: ✅ 成功，剩余1次
第2次: ✅ 成功，剩余0次
第3次: ❌ 403 Forbidden: "已达每日配额限制（2次），请升级到专业版"
```

### 专业版用户（¥200/月）

```
生成视频（高质量）:
  ↓
检查套餐: 专业套餐
  ↓
检查权限: videoGeneration.enabled = true ✅
检查参数: imageQuality = "high"
验证范围: "high" in ["standard", "high"] ✅
检查配额: 5次/天，已用2次
  ↓
✅ 成功，剩余2次
```

---

## 🚨 优先级

### 🔥 P0 - 必须立即实施

**不实施的后果**:
- 🔥 免费用户无限消耗成本
- 🔥 付费用户毫无价值
- 🔥 商业模式完全失效
- 🔥 可能造成巨大亏损

**必须实施**:
1. ✅ 创建FeatureQuota表
2. ✅ 创建PackageFeatureGuard
3. ✅ 创建FeatureQuotaService
4. ✅ 修改所有付费功能Controller添加守卫
5. ✅ 测试验证权限检查

**预计时间**: 2-3小时  
**重要性**: 🔥🔥🔥 **极高**  

---

## 📝 影响范围

### 需要添加鉴权的功能

| 功能 | 文件 | 装饰器 | 状态 |
|------|------|--------|------|
| AI写作助手 | assistant.controller.ts | @RequireFeature('aiAssistant') | ⏳ 待添加 |
| 内容生成 | generation.controller.ts | @RequireFeature('aiWriting') | ⏳ 待添加 |
| 视频生成 | video-generation.controller.ts | @RequireFeature('videoGeneration') | ⏳ 待添加 |
| 写作建议 | suggestion.controller.ts | @RequireFeature('aiWriting') | ⏳ 待添加 |
| 素材生成 | material.controller.ts | @RequireFeature('materialGeneration') | ⏳ 待添加 |

**总计**: 5个核心功能，全部需要添加鉴权

---

## ✅ 快速实施方案

我已经创建了完整的解决方案文档和代码示例。

**下一步行动**:
1. 立即创建FeatureQuota表
2. 实现PackageFeatureGuard和FeatureQuotaService
3. 修改所有付费功能添加守卫
4. 测试验证

**文档**:
- `CRITICAL-PACKAGE-PERMISSION-ISSUE.md` - 问题详情和完整解决方案

**预计时间**: 2-3小时  
**优先级**: 🔥🔥🔥 **最高，必须立即实施**  

---

**发现日期**: 2025-01-21  
**状态**: 🚨 **严重缺陷，必须修复**  
**影响**: 💰 **商业模式完全失效**  

**这个必须立即修复，否则系统无法商用！** 🔥


