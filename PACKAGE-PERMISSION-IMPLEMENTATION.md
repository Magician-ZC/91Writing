# 🔐 套餐权限鉴权系统 - 完整实施方案

创建日期: 2025-01-21  
优先级: 🔥🔥🔥 **P0 - 必须立即实施**  
状态: 📝 **实施中**  

---

## 🚨 问题严重性

### 当前状态

**所有付费功能都没有鉴权！**

```
免费用户 = 基础版用户 = 专业版用户 = 企业版用户
           ↓
      完全相同的体验
           ↓
     付费毫无意义 🔥
```

### 影响范围

| 功能 | 成本 | 无鉴权后果 |
|------|------|-----------|
| AI写作助手 | ¥0.01/次 | 免费用户无限使用 |
| 内容生成 | ¥0.02/次 | 免费用户无限使用 |
| 视频生成 | ¥7.6/次 | **免费用户每生成1个亏损¥7.6** 🔥 |
| 写作建议 | ¥0.01/次 | 免费用户无限使用 |
| 素材生成 | ¥0.05/次 | 免费用户无限使用 |

**潜在损失**: 假设10个免费用户每天各生成10个视频 = **¥760/天** 🔥

---

## ✅ 完整解决方案

### 架构设计

```
┌────────────────────────────────────────────────────────────┐
│              统一套餐权限鉴权系统                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  1. 数据库层                                                │
│     └── FeatureQuota表（统一管理所有功能配额）              │
│                                                            │
│  2. 服务层                                                  │
│     ├── PackagePermissionService（权限检查）                │
│     └── FeatureQuotaService（配额管理）                     │
│                                                            │
│  3. 守卫层                                                  │
│     └── PackageFeatureGuard（自动拦截和验证）               │
│                                                            │
│  4. 装饰器层                                                │
│     ├── @RequireFeature('功能名')                           │
│     └── @RequireQuota('daily'|'monthly')                   │
│                                                            │
│  5. Controller层                                            │
│     └── 所有付费功能添加守卫和装饰器                        │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 📋 实施清单（共7个任务）

### ✅ Task 1: 创建FeatureQuota表

**文件**: `91Writing-Backend/prisma/schema.prisma`

**状态**: ✅ 已完成

```prisma
model FeatureQuota {
  id          String   @id
  userId      String
  feature     String   // videoGeneration, aiWriting, aiAssistant
  quotaType   String   // daily, monthly
  date        DateTime @db.Date
  usedCount   Int      @default(0)
  limit       Int
  lastUsedAt  DateTime?
  
  @@unique([userId, feature, quotaType, date])
}
```

**执行**: `npx prisma db push` ✅ 已完成

---

### ⏳ Task 2: 创建FeatureQuotaService

**文件**: `libs/common/src/services/feature-quota.service.ts`

**代码**（约200行）见下方实施代码

---

### ⏳ Task 3: 创建PackageFeatureGuard

**文件**: `libs/common/src/guards/package-feature.guard.ts`

**代码**（约150行）见下方实施代码

---

### ⏳ Task 4: 创建装饰器

**文件**: `libs/common/src/decorators/require-feature.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';

export const FEATURE_KEY = 'feature';
export const QUOTA_TYPE_KEY = 'quotaType';

export const RequireFeature = (feature: string) => SetMetadata(FEATURE_KEY, feature);
export const RequireQuota = (quotaType: 'daily' | 'monthly' = 'daily') => 
  SetMetadata(QUOTA_TYPE_KEY, quotaType);
```

---

### ⏳ Task 5-7: 修改所有付费功能

#### Task 5: AI写作助手

**文件**: `apps/ai-service/src/modules/assistant/assistant.controller.ts`

```typescript
import { PackageFeatureGuard } from '@app/common';
import { RequireFeature, RequireQuota } from '@app/common';

@Controller()
@UseGuards(JwtAuthGuard, PackageFeatureGuard)  // ✅ 添加
export class AssistantController {
  
  @Post('initialize')
  @RequireFeature('aiAssistant')  // ✅ 添加
  @RequireQuota('daily')  // ✅ 添加
  async initializeSession(@Req() req, @Body() dto: InitializeSessionDto) {
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

#### Task 6: 内容生成

**文件**: `apps/ai-service/src/modules/generation/generation.controller.ts`

```typescript
@Controller()
@UseGuards(JwtAuthGuard, PackageFeatureGuard)
export class GenerationController {
  
  @Post('generate')
  @RequireFeature('aiWriting')
  @RequireQuota('daily')
  async generateContent(@Req() req, @Body() dto: GenerateContentDto) {
    return this.generationService.generateContent(req.user.userId, dto);
  }
}
```

#### Task 7: 视频生成

**文件**: `apps/ai-service/src/modules/video-generation/video-generation.controller.ts`

```typescript
@Controller()
@UseGuards(JwtAuthGuard, PackageFeatureGuard)
export class VideoGenerationController {
  
  @Post('generate')
  @RequireFeature('videoGeneration')
  @RequireQuota('daily')
  async generateVideo(@Req() req, @Body() dto: GenerateVideoDto) {
    return this.videoGenerationService.generateChapterVideo(req.user.userId, dto);
  }
}
```

---

## 🎯 实施后的效果

### 免费用户

```
调用AI助手API:
  ↓
PackageFeatureGuard拦截:
  1. 检查订阅: 无订阅 → 免费用户
  2. 检查权限: aiAssistant 免费可用 ✅
  3. 检查配额: 100次/天，已用98次
  4. 剩余: 2次 ✅
  ↓
放行: 执行AI助手
  ↓
扣除配额: 99/100
  ↓
返回结果

第101次调用:
  ↓
检查配额: 100/100
  ↓
❌ 403 Forbidden: "已达每日配额限制，请升级套餐或明天再试"
```

### 基础版用户

```
生成视频API:
  ↓
PackageFeatureGuard拦截:
  1. 检查订阅: 基础套餐 ✅
  2. 检查权限: videoGeneration.enabled = true ✅
  3. 检查配额: 2次/天，已用1次
  4. 剩余: 1次 ✅
  ↓
放行: 执行视频生成
  ↓
扣除配额: 2/2
  ↓
返回结果

第3次调用:
  ↓
检查配额: 2/2
  ↓
❌ 403 Forbidden: "已达每日配额限制（2次），请升级到专业版"
```

### 专业版用户

```
生成视频（高质量）:
  ↓
PackageFeatureGuard拦截:
  1. 检查订阅: 专业套餐 ✅
  2. 检查权限: videoGeneration.enabled = true ✅
  3. 检查参数: imageQuality = "high"
     验证: "high" in allowedQualities ✅
  4. 检查配额: 5次/天，已用2次
  5. 剩余: 3次 ✅
  ↓
放行: 执行高质量视频生成
  ↓
扣除配额: 3/5
  ↓
返回结果
```

---

## 📊 套餐配额配置

### 标准配置（建议）

```json
{
  "免费套餐": {
    "videoGeneration": {
      "enabled": false  // ❌ 不能生成视频
    },
    "aiWriting": {
      "enabled": true,
      "dailyQuota": 100  // ✅ 每天100次
    },
    "aiAssistant": {
      "enabled": true,
      "dailyQuota": 50   // ✅ 每天50次对话
    }
  },
  
  "基础套餐（¥50/月）": {
    "videoGeneration": {
      "enabled": true,
      "dailyQuota": 2,      // ✅ 每天2个视频
      "monthlyQuota": 10    // ✅ 每月10个
    },
    "aiWriting": {
      "enabled": true,
      "dailyQuota": 500     // ✅ 每天500次
    },
    "aiAssistant": {
      "enabled": true,
      "dailyQuota": 200     // ✅ 每天200次对话
    }
  },
  
  "专业套餐（¥200/月）": {
    "videoGeneration": {
      "enabled": true,
      "dailyQuota": 5,       // ✅ 每天5个
      "monthlyQuota": 50
    },
    "aiWriting": {
      "enabled": true,
      "dailyQuota": 2000     // ✅ 更多次数
    },
    "aiAssistant": {
      "enabled": true,
      "dailyQuota": -1       // ✅ 不限次数
    }
  },
  
  "企业套餐（¥500/月）": {
    "videoGeneration": {
      "enabled": true,
      "dailyQuota": 20,      // ✅ 每天20个
      "monthlyQuota": 200
    },
    "aiWriting": {
      "enabled": true,
      "dailyQuota": -1       // ✅ 不限
    },
    "aiAssistant": {
      "enabled": true,
      "dailyQuota": -1       // ✅ 不限
    }
  }
}
```

---

## 🔧 核心实施代码

由于代码量较大（约800行），我将创建独立的实施文件。

**关键文件**:
1. `libs/common/src/services/feature-quota.service.ts` (配额服务)
2. `libs/common/src/guards/package-feature.guard.ts` (权限守卫)
3. `libs/common/src/decorators/require-feature.decorator.ts` (装饰器)
4. 修改5个Controller文件

**预计时间**: 2-3小时  
**重要性**: 🔥🔥🔥 **极高，不实施无法商用**  

---

## 📊 实施优先级

### 🔥 P0 - 立即实施（视频生成）

**原因**: 成本最高（¥7.6/次），风险最大

**步骤**:
1. ✅ 创建FeatureQuota表
2. ⏳ 创建FeatureQuotaService
3. ⏳ 创建PackageFeatureGuard
4. ⏳ 修改video-generation.controller.ts
5. ⏳ 测试验证

**预计**: 1小时

---

### 🔥 P1 - 紧急实施（AI功能）

**步骤**:
1. ⏳ 修改assistant.controller.ts
2. ⏳ 修改generation.controller.ts
3. ⏳ 修改suggestion.controller.ts

**预计**: 1小时

---

### 📝 P2 - 补充实施（其他功能）

**步骤**:
1. ⏳ 修改material.controller.ts
2. ⏳ 添加配额查询接口
3. ⏳ 前端显示配额剩余

**预计**: 1小时

---

## ✅ 验证清单

### 功能验证

- [ ] 免费用户无法生成视频
- [ ] 基础版用户每日限制2次
- [ ] 专业版用户每日限制5次
- [ ] 企业版用户每日限制20次
- [ ] 超出配额返回403错误
- [ ] 错误提示包含升级引导
- [ ] 配额每日自动重置
- [ ] 配额每月自动重置

### 数据验证

```sql
-- 查看配额使用情况
SELECT userId, feature, quotaType, date, usedCount, limit
FROM feature_quotas
WHERE date >= CURDATE()
ORDER BY userId, feature;

-- 查看某用户的配额
SELECT * FROM feature_quotas 
WHERE userId = 'xxx' AND feature = 'videoGeneration';
```

---

## 📝 下一步行动

由于这个问题**非常严重**，建议：

1. **立即实施P0**（视频生成鉴权）
   - 防止免费用户消耗高成本

2. **紧急实施P1**（AI功能鉴权）
   - 实现基本的差异化

3. **补充实施P2**（完善鉴权）
   - 所有功能都有鉴权

**总耗时**: 预计3小时  
**收益**: 避免每天数百元的潜在损失  

---

**创建日期**: 2025-01-21  
**状态**: 🚨 **发现严重缺陷，正在实施**  
**优先级**: 🔥🔥🔥 **最高**  

**这个必须立即修复！** 🔥


