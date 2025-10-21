# Phase 3 - Week 9: 用户引导系统实施方案

**开发时间**: Week 9  
**功能**: 新手引导 + 功能提示 + 帮助系统  
**优先级**: ⭐⭐⭐ (中)

---

## 📋 功能概述

### 核心价值
- 降低新用户学习成本 50%
- 提高功能使用率 40%
- 减少客服压力 60%
- 提升用户转化率 15-20%

### 用户场景
1. 新用户首次登录 → 欢迎向导
2. 进入功能页面 → 功能引导气泡
3. 点击帮助按钮 → 上下文帮助
4. 发现新功能 → 新功能提示徽章

---

## 📊 数据库设计

### Prisma Schema

```prisma
// 91Writing-Backend/prisma/schema.prisma

// 用户引导进度
model UserOnboarding {
  id              String   @id @default(uuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // 引导完成状态
  welcomeCompleted       Boolean  @default(false)
  novelCreationCompleted Boolean  @default(false)
  editorTourCompleted    Boolean  @default(false)
  aiFeatureCompleted     Boolean  @default(false)
  
  // 功能发现记录
  discoveredFeatures     Json?    // ['feature1', 'feature2']
  completedTours         Json?    // ['tour1', 'tour2']
  
  // 跳过和完成时间
  skippedAt       DateTime?
  completedAt     DateTime?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId])
}

// 功能使用跟踪
model FeatureUsage {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  featureName String   @db.VarChar(100)
  category    String   @db.VarChar(50) // 'core', 'advanced', 'ai', 'tool'
  
  firstUsedAt DateTime @default(now())
  lastUsedAt  DateTime @updatedAt
  usageCount  Int      @default(1)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
  @@index([featureName])
  @@unique([userId, featureName])
}

// 帮助反馈
model HelpFeedback {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  helpType    String   // 'guide', 'tooltip', 'tutorial', 'documentation'
  helpId      String   // 对应的帮助内容ID
  
  isHelpful   Boolean
  feedback    String?  @db.Text
  
  createdAt   DateTime @default(now())

  @@index([userId])
  @@index([helpType])
}

// 引导配置（管理员配置）
model OnboardingConfig {
  id          String   @id @default(uuid())
  
  configKey   String   @unique @db.VarChar(100)
  configName  String   @db.VarChar(200)
  configValue Json     // 引导步骤、内容等
  
  isActive    Boolean  @default(true)
  priority    Int      @default(0)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([configKey])
}

// 在 User 模型中添加关系
model User {
  // ... 现有字段
  
  // Phase 3 新增关系
  onboarding    UserOnboarding?
  featureUsage  FeatureUsage[]
  helpFeedback  HelpFeedback[]
}
```

---

## 🔧 后端实现

### 文件结构

```
91Writing-Backend/
├── apps/user-service/src/modules/
│   └── onboarding/
│       ├── dto/
│       │   ├── update-onboarding.dto.ts
│       │   ├── track-feature-usage.dto.ts
│       │   ├── submit-help-feedback.dto.ts
│       │   └── onboarding-response.dto.ts
│       ├── onboarding.controller.ts
│       ├── onboarding.service.ts
│       └── onboarding.module.ts
```

### 1. DTO 定义

#### update-onboarding.dto.ts

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsArray, IsString } from 'class-validator';

export class UpdateOnboardingDto {
  @ApiPropertyOptional({ 
    description: '欢迎引导是否完成',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  welcomeCompleted?: boolean;

  @ApiPropertyOptional({ 
    description: '小说创建引导是否完成',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  novelCreationCompleted?: boolean;

  @ApiPropertyOptional({ 
    description: '编辑器引导是否完成',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  editorTourCompleted?: boolean;

  @ApiPropertyOptional({ 
    description: 'AI功能引导是否完成',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  aiFeatureCompleted?: boolean;

  @ApiPropertyOptional({ 
    description: '已发现的功能列表',
    type: [String],
    example: ['ai-writing', 'character-network']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  discoveredFeatures?: string[];

  @ApiPropertyOptional({ 
    description: '已完成的引导列表',
    type: [String],
    example: ['welcome-tour', 'editor-tour']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  completedTours?: string[];
}
```

#### track-feature-usage.dto.ts

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, MinLength, MaxLength } from 'class-validator';

export class TrackFeatureUsageDto {
  @ApiProperty({ 
    description: '功能名称',
    example: 'ai-writing',
    maxLength: 100
  })
  @IsString({ message: '功能名称必须是字符串' })
  @MinLength(1, { message: '功能名称不能为空' })
  @MaxLength(100, { message: '功能名称不能超过100个字符' })
  featureName: string;

  @ApiProperty({ 
    description: '功能分类',
    enum: ['core', 'advanced', 'ai', 'tool'],
    example: 'ai'
  })
  @IsEnum(['core', 'advanced', 'ai', 'tool'], {
    message: '功能分类必须是: core, advanced, ai, tool'
  })
  category: string;
}
```

#### submit-help-feedback.dto.ts

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsEnum, IsOptional, MinLength, MaxLength } from 'class-validator';

export class SubmitHelpFeedbackDto {
  @ApiProperty({ 
    description: '帮助类型',
    enum: ['guide', 'tooltip', 'tutorial', 'documentation'],
    example: 'guide'
  })
  @IsEnum(['guide', 'tooltip', 'tutorial', 'documentation'])
  helpType: string;

  @ApiProperty({ 
    description: '帮助内容ID',
    example: 'welcome-guide',
    maxLength: 100
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  helpId: string;

  @ApiProperty({ 
    description: '是否有帮助',
    example: true
  })
  @IsBoolean()
  isHelpful: boolean;

  @ApiPropertyOptional({ 
    description: '用户反馈',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  feedback?: string;
}
```

### 2. Service 实现

#### onboarding.service.ts

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
import { TrackFeatureUsageDto } from './dto/track-feature-usage.dto';
import { SubmitHelpFeedbackDto } from './dto/submit-help-feedback.dto';

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取用户引导状态
   */
  async getOnboardingStatus(userId: string) {
    let onboarding = await this.prisma.userOnboarding.findUnique({
      where: { userId },
    });

    // 如果不存在，创建默认记录
    if (!onboarding) {
      onboarding = await this.prisma.userOnboarding.create({
        data: { userId },
      });
    }

    // 获取功能使用统计
    const featureStats = await this.getFeatureUsageStats(userId);

    // 判断是否是新用户
    const isNewUser = !onboarding.welcomeCompleted;

    // 获取推荐的下一步
    const nextSteps = this.getRecommendedNextSteps(onboarding, featureStats);

    return {
      ...onboarding,
      isNewUser,
      featureStats,
      nextSteps,
    };
  }

  /**
   * 更新引导状态
   */
  async updateOnboarding(userId: string, updateDto: UpdateOnboardingDto) {
    // 确保记录存在
    await this.ensureOnboardingExists(userId);

    // 检查是否所有引导都完成
    const allCompleted = 
      (updateDto.welcomeCompleted ?? true) &&
      (updateDto.novelCreationCompleted ?? true) &&
      (updateDto.editorTourCompleted ?? true) &&
      (updateDto.aiFeatureCompleted ?? true);

    return this.prisma.userOnboarding.update({
      where: { userId },
      data: {
        ...updateDto,
        completedAt: allCompleted ? new Date() : undefined,
      },
    });
  }

  /**
   * 跳过引导
   */
  async skipOnboarding(userId: string) {
    await this.ensureOnboardingExists(userId);

    return this.prisma.userOnboarding.update({
      where: { userId },
      data: {
        welcomeCompleted: true,
        novelCreationCompleted: true,
        editorTourCompleted: true,
        aiFeatureCompleted: true,
        skippedAt: new Date(),
        completedAt: new Date(),
      },
    });
  }

  /**
   * 跟踪功能使用
   */
  async trackFeatureUsage(userId: string, trackDto: TrackFeatureUsageDto) {
    return this.prisma.featureUsage.upsert({
      where: {
        userId_featureName: {
          userId,
          featureName: trackDto.featureName,
        },
      },
      create: {
        userId,
        featureName: trackDto.featureName,
        category: trackDto.category,
        usageCount: 1,
      },
      update: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });
  }

  /**
   * 提交帮助反馈
   */
  async submitHelpFeedback(userId: string, feedbackDto: SubmitHelpFeedbackDto) {
    return this.prisma.helpFeedback.create({
      data: {
        userId,
        helpType: feedbackDto.helpType,
        helpId: feedbackDto.helpId,
        isHelpful: feedbackDto.isHelpful,
        feedback: feedbackDto.feedback,
      },
    });
  }

  /**
   * 获取功能推荐
   */
  async getFeatureRecommendations(userId: string) {
    // 获取用户已使用的功能
    const usedFeatures = await this.prisma.featureUsage.findMany({
      where: { userId },
      select: { featureName: true, category: true },
    });

    const usedFeatureNames = new Set(usedFeatures.map(f => f.featureName));

    // 所有可用功能
    const allFeatures = [
      { name: 'ai-writing', category: 'ai', label: 'AI续写', priority: 10 },
      { name: 'ai-polish', category: 'ai', label: 'AI润色', priority: 9 },
      { name: 'character-network', category: 'advanced', label: '角色关系图', priority: 8 },
      { name: 'consistency-check', category: 'advanced', label: '一致性检测', priority: 8 },
      { name: 'multi-version', category: 'ai', label: '多版本对比', priority: 7 },
      { name: 'book-analysis', category: 'tool', label: '拆书分析', priority: 6 },
      { name: 'writing-tools', category: 'tool', label: '写作工具库', priority: 6 },
      { name: 'mind-map', category: 'advanced', label: '思维导图', priority: 5 },
    ];

    // 推荐未使用的高优先级功能
    const recommendations = allFeatures
      .filter(f => !usedFeatureNames.has(f.name))
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3);

    return recommendations;
  }

  // ========== 辅助方法 ==========

  private async ensureOnboardingExists(userId: string) {
    const existing = await this.prisma.userOnboarding.findUnique({
      where: { userId },
    });

    if (!existing) {
      await this.prisma.userOnboarding.create({
        data: { userId },
      });
    }
  }

  private async getFeatureUsageStats(userId: string) {
    const features = await this.prisma.featureUsage.findMany({
      where: { userId },
      orderBy: { usageCount: 'desc' },
      take: 10,
    });

    return {
      totalFeaturesUsed: features.length,
      mostUsedFeature: features[0]?.featureName,
      recentFeatures: features.slice(0, 5).map(f => f.featureName),
    };
  }

  private getRecommendedNextSteps(onboarding: any, featureStats: any) {
    const steps = [];

    if (!onboarding.welcomeCompleted) {
      steps.push({
        id: 'complete-welcome',
        title: '完成欢迎引导',
        description: '了解91写作的核心功能',
        priority: 10,
      });
    }

    if (!onboarding.novelCreationCompleted) {
      steps.push({
        id: 'create-first-novel',
        title: '创建第一部小说',
        description: '开始你的创作之旅',
        priority: 9,
      });
    }

    if (!onboarding.editorTourCompleted && onboarding.novelCreationCompleted) {
      steps.push({
        id: 'explore-editor',
        title: '探索编辑器功能',
        description: '学习如何高效写作',
        priority: 8,
      });
    }

    if (!onboarding.aiFeatureCompleted && onboarding.editorTourCompleted) {
      steps.push({
        id: 'try-ai-features',
        title: '尝试AI功能',
        description: '体验AI辅助创作的魅力',
        priority: 7,
      });
    }

    if (featureStats.totalFeaturesUsed < 3) {
      steps.push({
        id: 'discover-more',
        title: '发现更多功能',
        description: '探索强大的创作工具',
        priority: 6,
      });
    }

    return steps.sort((a, b) => b.priority - a.priority).slice(0, 3);
  }
}
```

### 3. Controller 实现

#### onboarding.controller.ts

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  Request,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/common';
import { OnboardingService } from './onboarding.service';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
import { TrackFeatureUsageDto } from './dto/track-feature-usage.dto';
import { SubmitHelpFeedbackDto } from './dto/submit-help-feedback.dto';

@ApiTags('用户引导')
@Controller()  // ⚠️ 微服务不添加前缀
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get('onboarding/status')
  @ApiOperation({ summary: '获取用户引导状态' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getStatus(@Request() req) {
    return this.onboardingService.getOnboardingStatus(req.user.id);
  }

  @Patch('onboarding')
  @ApiOperation({ summary: '更新引导进度' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @HttpCode(HttpStatus.OK)
  async updateOnboarding(
    @Request() req,
    @Body(ValidationPipe) updateDto: UpdateOnboardingDto,
  ) {
    return this.onboardingService.updateOnboarding(req.user.id, updateDto);
  }

  @Post('onboarding/skip')
  @ApiOperation({ summary: '跳过所有引导' })
  @ApiResponse({ status: 200, description: '跳过成功' })
  @HttpCode(HttpStatus.OK)
  async skipOnboarding(@Request() req) {
    return this.onboardingService.skipOnboarding(req.user.id);
  }

  @Post('features/track')
  @ApiOperation({ summary: '跟踪功能使用' })
  @ApiResponse({ status: 201, description: '记录成功' })
  @HttpCode(HttpStatus.CREATED)
  async trackFeature(
    @Request() req,
    @Body(ValidationPipe) trackDto: TrackFeatureUsageDto,
  ) {
    return this.onboardingService.trackFeatureUsage(req.user.id, trackDto);
  }

  @Get('features/recommendations')
  @ApiOperation({ summary: '获取功能推荐' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getRecommendations(@Request() req) {
    return this.onboardingService.getFeatureRecommendations(req.user.id);
  }

  @Post('help/feedback')
  @ApiOperation({ summary: '提交帮助反馈' })
  @ApiResponse({ status: 201, description: '提交成功' })
  @HttpCode(HttpStatus.CREATED)
  async submitFeedback(
    @Request() req,
    @Body(ValidationPipe) feedbackDto: SubmitHelpFeedbackDto,
  ) {
    return this.onboardingService.submitHelpFeedback(req.user.id, feedbackDto);
  }
}
```

### 4. Module 配置

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DatabaseModule } from '@app/database';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { JwtStrategy } from '../../strategies/jwt.strategy';

@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    JwtModule,
  ],
  controllers: [OnboardingController],
  providers: [OnboardingService, JwtStrategy],
  exports: [OnboardingService],
})
export class OnboardingModule {}
```

---

## 🎨 前端实现

### Service 层

#### src/services/onboardingService.js

```javascript
import { backendApi } from './backendApi'

class OnboardingService {
  /**
   * 获取引导状态
   */
  async getStatus() {
    return await backendApi.get('/api/v1/onboarding/status')
  }

  /**
   * 更新引导进度
   */
  async updateProgress(progressData) {
    return await backendApi.patch('/api/v1/onboarding', progressData)
  }

  /**
   * 跳过引导
   */
  async skip() {
    return await backendApi.post('/api/v1/onboarding/skip')
  }

  /**
   * 跟踪功能使用
   */
  async trackFeature(featureName, category) {
    return await backendApi.post('/api/v1/features/track', {
      featureName,
      category
    })
  }

  /**
   * 获取功能推荐
   */
  async getRecommendations() {
    return await backendApi.get('/api/v1/features/recommendations')
  }

  /**
   * 提交帮助反馈
   */
  async submitFeedback(helpType, helpId, isHelpful, feedback) {
    return await backendApi.post('/api/v1/help/feedback', {
      helpType,
      helpId,
      isHelpful,
      feedback
    })
  }
}

export default new OnboardingService()
```

---

## 📋 引导配置

### 引导步骤配置

#### src/config/onboarding.js

```javascript
export const onboardingSteps = {
  // 欢迎引导
  welcome: [
    {
      target: '.logo',
      title: '欢迎来到 91写作！',
      content: '这是一个专业的AI小说创作平台，让我们快速了解核心功能。',
      placement: 'bottom'
    },
    {
      target: '.nav-novels',
      title: '小说管理',
      content: '在这里创建和管理你的小说项目。',
      placement: 'right'
    },
    {
      target: '.nav-writer',
      title: '写作编辑器',
      content: '强大的写作编辑器，支持AI辅助创作。',
      placement: 'right'
    },
    {
      target: '.nav-tools',
      title: '写作工具',
      content: '10+专业写作工具，助力你的创作。',
      placement: 'right'
    },
    {
      target: '.api-config-btn',
      title: 'API配置',
      content: '配置你的AI服务，开启智能创作之旅。',
      placement: 'bottom'
    }
  ],

  // 小说创建引导
  novelCreation: [
    {
      target: '.create-novel-btn',
      title: '创建你的第一部小说',
      content: '点击这里开始创建你的小说项目。',
      placement: 'bottom'
    },
    {
      target: '.novel-type-select',
      title: '选择小说类型',
      content: '选择适合你的小说类型，系统会提供对应的模板。',
      placement: 'top'
    },
    {
      target: '.novel-info-form',
      title: '填写小说信息',
      content: '输入小说标题、简介等基本信息。',
      placement: 'left'
    }
  ],

  // 编辑器引导
  editor: [
    {
      target: '.chapter-list',
      title: '章节列表',
      content: '在这里管理所有章节，点击章节开始编辑。',
      placement: 'right'
    },
    {
      target: '.editor-toolbar',
      title: '编辑器工具栏',
      content: '丰富的编辑工具，包括格式化、AI辅助等功能。',
      placement: 'bottom'
    },
    {
      target: '.ai-write-btn',
      title: 'AI续写',
      content: 'AI可以帮你续写内容，提升创作效率。',
      placement: 'bottom'
    },
    {
      target: '.character-panel',
      title: '角色管理',
      content: '管理你的角色设定，保持角色一致性。',
      placement: 'left'
    }
  ],

  // AI功能引导
  aiFeature: [
    {
      target: '.multi-version-btn',
      title: '多版本对比',
      content: 'AI可以生成多个版本供你选择，找到最满意的内容。',
      placement: 'bottom'
    },
    {
      target: '.consistency-check-btn',
      title: '一致性检测',
      content: '智能检测世界观和角色的一致性，提升作品质量。',
      placement: 'bottom'
    }
  ]
}

// 功能提示配置
export const featureTooltips = {
  'character-network': {
    title: '角色关系网络图',
    content: '可视化展示角色之间的关系，帮助你理清角色关系。',
    position: 'top'
  },
  'consistency-check': {
    title: '一致性检测',
    content: 'AI检测世界观、角色、时间线的一致性，避免逻辑错误。',
    position: 'top'
  },
  'multi-version': {
    title: '多版本对比',
    content: 'AI生成多个版本供对比选择，提升内容质量。',
    position: 'top'
  }
}
```

---

## 📋 接口规范检查

### ✅ 已遵循

- [x] Controller 使用 `@Controller()` 不带前缀
- [x] 所有接口添加 `@UseGuards(JwtAuthGuard)`
- [x] 所有接口添加 `@ApiBearerAuth('JWT-auth')`
- [x] DTO 完整验证装饰器
- [x] POST非创建操作添加 `@HttpCode(HttpStatus.OK)`
- [x] 完整 Swagger 文档
- [x] 从 `req.user.id` 获取用户信息

---

**状态**: 🚀 用户引导系统设计完成  
**下一步**: 前端引导组件实现

