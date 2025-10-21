# 套餐与视频生成集成方案

创建日期: 2025-01-21  
问题: 套餐管理没有集成视频生成权限  
状态: 📝 实施方案  

---

## 📋 问题分析

### 当前问题

1. **套餐features字段**只是字符串数组
   ```json
   {
     "features": ["AI写作助手", "无限章节"]
   }
   ```

2. **没有权限控制**
   - 免费用户可以生成视频
   - 付费用户和免费用户体验一样
   - 没有限制次数、质量等

3. **用户参数无法自定义**
   - 只能使用系统默认值
   - 无法在生成时调整参数

---

## ✅ 完整解决方案

### 方案架构

```
用户 → 前端GenerateDialog → 后端VideoGenerationService
  ↓                            ↓
选择参数                  1. 获取用户套餐
  ↓                        2. 检查权限（次数、质量等）
传递到后端                 3. 合并参数（用户参数优先）
  ↓                        4. 验证参数范围
后端返回结果               5. 生成视频
  ↓                        6. 扣除配额
前端显示进度
```

---

## 🔧 实施步骤

### Step 1: 扩展Package模型的features字段

**数据库Schema不变**（features已经是Json类型）

**features字段新结构**:
```json
{
  "videoGeneration": {
    "enabled": true,                    // 是否启用视频生成
    "dailyQuota": 10,                   // 每日配额
    "monthlyQuota": 100,                // 每月配额
    "maxSceneCount": 8,                 // 最大分镜数量
    "maxVideoDuration": 60,             // 最大视频时长
    "allowedQualities": ["standard", "high"],  // 允许的质量级别
    "allowedResolutions": ["1024x576", "1280x720"],  // 允许的分辨率
    "enableAdvancedParams": true,       // 是否允许高级参数
    "enableCustomPrompts": false,       // 是否允许自定义提示词
    "priority": "normal"                // 队列优先级（low/normal/high）
  },
  "aiWriting": {
    "enabled": true,
    "dailyQuota": 1000,
    "models": ["gpt-4", "claude-3"]
  },
  "storage": {
    "quota": 10737418240  // 10GB
  }
}
```

---

### Step 2: 创建权限检查服务

**文件**: `libs/common/src/services/package-permission.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database';

@Injectable()
export class PackagePermissionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 检查用户视频生成权限
   */
  async checkVideoGenerationPermission(userId: string): Promise<{
    allowed: boolean;
    limits: {
      dailyQuota: number;
      monthlyQuota: number;
      maxSceneCount: number;
      maxVideoDuration: number;
      allowedQualities: string[];
      allowedResolutions: string[];
      enableAdvancedParams: boolean;
      priority: string;
    };
    message?: string;
  }> {
    // 1. 获取用户订阅
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      include: {
        package: true,
      },
    });

    // 2. 如果没有订阅，使用免费套餐配置
    if (!subscription || subscription.status !== 'ACTIVE') {
      return {
        allowed: true,
        limits: this.getFreeLimits(),
        message: '免费用户限制'
      };
    }

    // 3. 解析套餐features
    const features = subscription.package.features as any;
    const videoFeatures = features?.videoGeneration;

    if (!videoFeatures || !videoFeatures.enabled) {
      return {
        allowed: false,
        limits: null,
        message: '当前套餐不包含视频生成功能'
      };
    }

    // 4. 返回权限限制
    return {
      allowed: true,
      limits: {
        dailyQuota: videoFeatures.dailyQuota || 5,
        monthlyQuota: videoFeatures.monthlyQuota || 50,
        maxSceneCount: videoFeatures.maxSceneCount || 8,
        maxVideoDuration: videoFeatures.maxVideoDuration || 60,
        allowedQualities: videoFeatures.allowedQualities || ['standard'],
        allowedResolutions: videoFeatures.allowedResolutions || ['1024x576'],
        enableAdvancedParams: videoFeatures.enableAdvancedParams || false,
        priority: videoFeatures.priority || 'normal'
      }
    };
  }

  /**
   * 验证用户参数是否在权限范围内
   */
  validateUserParams(userParams: any, limits: any): {
    valid: boolean;
    errors: string[];
  } {
    const errors = [];

    // 验证分镜数量
    if (userParams.sceneCount && userParams.sceneCount > limits.maxSceneCount) {
      errors.push(`分镜数量超出限制（最多${limits.maxSceneCount}个）`);
    }

    // 验证视频时长
    if (userParams.videoDuration && userParams.videoDuration > limits.maxVideoDuration) {
      errors.push(`视频时长超出限制（最多${limits.maxVideoDuration}秒）`);
    }

    // 验证图片质量
    if (userParams.imageQuality && !limits.allowedQualities.includes(userParams.imageQuality)) {
      errors.push(`图片质量不在允许范围内（允许：${limits.allowedQualities.join(', ')}）`);
    }

    // 验证分辨率
    if (userParams.imageResolution && !limits.allowedResolutions.includes(userParams.imageResolution)) {
      errors.push(`图片分辨率不在允许范围内（允许：${limits.allowedResolutions.join(', ')}）`);
    }

    // 验证高级参数
    if (!limits.enableAdvancedParams) {
      if (userParams.samplingSteps || userParams.cfgScale || userParams.negativePrompt) {
        errors.push('当前套餐不支持高级参数配置');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 免费用户限制
   */
  private getFreeLimits() {
    return {
      dailyQuota: 0,           // 免费用户不能生成视频
      monthlyQuota: 0,
      maxSceneCount: 0,
      maxVideoDuration: 0,
      allowedQualities: [],
      allowedResolutions: [],
      enableAdvancedParams: false,
      priority: 'low'
    };
  }
}
```

---

### Step 3: 修改VideoGenerationService

**文件**: `apps/ai-service/src/modules/video-generation/video-generation.service.ts`

**关键修改**:

```typescript
import { PackagePermissionService } from '@app/common';

@Injectable()
export class VideoGenerationService {
  constructor(
    // ... 现有依赖
    private readonly permissionService: PackagePermissionService,  // ✅ 新增
    private readonly videoConfigService: VideoAPIConfigService,
  ) {}

  async generateChapterVideo(
    userId: string,
    dto: GenerateVideoDto,
  ): Promise<VideoGenerationStatusDto> {
    
    // ========== 1. 权限检查 ==========
    const permission = await this.permissionService.checkVideoGenerationPermission(userId);
    
    if (!permission.allowed) {
      throw new ForbiddenException(permission.message || '无视频生成权限');
    }

    // ========== 2. 配额检查 ==========
    const quota = await this.videoConfigService.checkUserQuota(userId);
    
    const dailyRemaining = Math.min(quota.dailyRemaining, permission.limits.dailyQuota);
    const monthlyRemaining = Math.min(quota.monthlyRemaining, permission.limits.monthlyQuota);
    
    if (dailyRemaining <= 0 || monthlyRemaining <= 0) {
      throw new ForbiddenException(
        `已达配额限制。每日剩余: ${dailyRemaining}, 每月剩余: ${monthlyRemaining}`
      );
    }

    // ========== 3. 获取配置（系统默认） ==========
    const systemConfig = await this.videoConfigService.getFullConfig();
    const imageConfig = systemConfig.imageGenConfig || {};
    const videoConfig = systemConfig.videoGenConfig || {};
    const defaultConfig = systemConfig.defaultGenConfig || {};

    // ========== 4. 合并参数（用户参数优先） ==========
    const finalParams = {
      // 基础参数
      sceneCount: dto.sceneCount || defaultConfig.defaultSceneCount || 5,
      videoDuration: dto.videoDuration || videoConfig.defaultDuration || 5,
      
      // 文生图参数
      imageResolution: dto.imageResolution || imageConfig.defaultResolution || '1024x576',
      imageQuality: dto.imageQuality || imageConfig.quality || 'standard',
      samplingSteps: dto.samplingSteps || imageConfig.samplingSteps || 30,
      cfgScale: dto.cfgScale || imageConfig.cfgScale || 7.5,
      negativePrompt: dto.negativePrompt || imageConfig.globalNegativePrompt,
      
      // 图生视频参数
      videoResolution: dto.videoResolution || videoConfig.resolution || '1024x576',
      fps: dto.fps || videoConfig.fps || 30,
      motionIntensity: dto.motionIntensity || videoConfig.defaultMotionIntensity || 'medium',
      videoQuality: dto.videoQuality || videoConfig.quality || 'high',
      compressionLevel: dto.compressionLevel || videoConfig.compressionLevel || 'medium',
      transitionEffect: dto.transitionEffect || videoConfig.transitionEffect || 'fade',
      addTitleFrame: dto.addTitleFrame ?? defaultConfig.addTitleFrame ?? true,
    };

    // ========== 5. 验证参数是否在权限范围内 ==========
    const validation = this.permissionService.validateUserParams(finalParams, permission.limits);
    
    if (!validation.valid) {
      throw new BadRequestException({
        message: '参数超出权限范围',
        errors: validation.errors
      });
    }

    // ========== 6. 使用最终参数生成视频 ==========
    this.logger.log(`开始生成视频，参数:`, finalParams);
    
    // ... 继续原有流程，使用 finalParams
  }
}
```

---

### Step 4: 更新套餐管理界面

**文件**: `src/views/admin/packages/PackageManagement.vue`

**修改表单**:

```vue
<el-form-item label="功能配置">
  <el-tabs type="border-card">
    <!-- Tab 1: 视频生成权限 -->
    <el-tab-pane label="视频生成">
      <el-form label-width="150px">
        <el-form-item label="启用视频生成">
          <el-switch v-model="packageForm.videoGeneration.enabled" />
        </el-form-item>

        <el-form-item label="每日配额" v-if="packageForm.videoGeneration.enabled">
          <el-input-number v-model="packageForm.videoGeneration.dailyQuota" :min="0" />
          <span class="unit">个视频/天</span>
        </el-form-item>

        <el-form-item label="每月配额">
          <el-input-number v-model="packageForm.videoGeneration.monthlyQuota" :min="0" />
          <span class="unit">个视频/月</span>
        </el-form-item>

        <el-form-item label="最大分镜数">
          <el-slider v-model="packageForm.videoGeneration.maxSceneCount" :min="3" :max="10" />
        </el-form-item>

        <el-form-item label="允许的质量">
          <el-checkbox-group v-model="packageForm.videoGeneration.allowedQualities">
            <el-checkbox label="standard">标准质量</el-checkbox>
            <el-checkbox label="high">高质量</el-checkbox>
            <el-checkbox label="ultra">超高质量（仅企业版）</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="允许的分辨率">
          <el-checkbox-group v-model="packageForm.videoGeneration.allowedResolutions">
            <el-checkbox label="1024x576">1024x576 (标准)</el-checkbox>
            <el-checkbox label="1280x720">1280x720 (HD)</el-checkbox>
            <el-checkbox label="1920x1080">1920x1080 (Full HD)</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="高级参数">
          <el-switch 
            v-model="packageForm.videoGeneration.enableAdvancedParams"
            active-text="允许"
            inactive-text="不允许"
          />
          <div class="tip">高级参数包括：采样步数、CFG Scale、自定义负向提示词等</div>
        </el-form-item>

        <el-form-item label="队列优先级">
          <el-select v-model="packageForm.videoGeneration.priority">
            <el-option label="低优先级" value="low" />
            <el-option label="普通优先级" value="normal" />
            <el-option label="高优先级" value="high" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-tab-pane>

    <!-- Tab 2: AI写作权限 -->
    <el-tab-pane label="AI写作">
      <!-- 原有AI写作配置 -->
    </el-tab-pane>

    <!-- Tab 3: 存储空间 -->
    <el-tab-pane label="存储空间">
      <!-- 原有存储配置 -->
    </el-tab-pane>
  </el-tabs>
</el-form-item>
```

---

### Step 5: 标准套餐配置示例

#### 免费套餐
```json
{
  "name": "免费套餐",
  "price": 0,
  "features": {
    "videoGeneration": {
      "enabled": false,  // ❌ 不能生成视频
      "dailyQuota": 0,
      "monthlyQuota": 0
    },
    "aiWriting": {
      "enabled": true,
      "dailyQuota": 100
    }
  }
}
```

#### 基础套餐（¥50/月）
```json
{
  "name": "基础套餐",
  "price": 50,
  "features": {
    "videoGeneration": {
      "enabled": true,  // ✅ 可以生成
      "dailyQuota": 2,
      "monthlyQuota": 10,
      "maxSceneCount": 5,
      "maxVideoDuration": 30,
      "allowedQualities": ["standard"],  // 只能用标准质量
      "allowedResolutions": ["1024x576"],  // 只能用标准分辨率
      "enableAdvancedParams": false,  // 不能自定义高级参数
      "priority": "low"
    }
  }
}
```

#### 专业套餐（¥200/月）
```json
{
  "name": "专业套餐",
  "price": 200,
  "features": {
    "videoGeneration": {
      "enabled": true,
      "dailyQuota": 5,
      "monthlyQuota": 50,
      "maxSceneCount": 8,
      "maxVideoDuration": 60,
      "allowedQualities": ["standard", "high"],  // ✅ 可用高质量
      "allowedResolutions": ["1024x576", "1280x720"],  // ✅ 可用HD
      "enableAdvancedParams": true,  // ✅ 可自定义参数
      "priority": "normal"
    }
  }
}
```

#### 企业套餐（¥500/月）
```json
{
  "name": "企业套餐",
  "price": 500,
  "features": {
    "videoGeneration": {
      "enabled": true,
      "dailyQuota": 20,
      "monthlyQuota": 200,
      "maxSceneCount": 10,  // ✅ 最多10个分镜
      "maxVideoDuration": 120,  // ✅ 最长120秒
      "allowedQualities": ["standard", "high", "ultra"],  // ✅ 所有质量
      "allowedResolutions": ["1024x576", "1280x720", "1920x1080"],  // ✅ 所有分辨率
      "enableAdvancedParams": true,  // ✅ 完全自定义
      "enableCustomPrompts": true,  // ✅ 自定义提示词
      "priority": "high"  // ✅ 高优先级队列
    }
  }
}
```

---

### Step 6: 前端生成对话框增强

**文件**: `src/components/writer/ChapterVideoPanel.vue`

**修改生成配置表单**:

```vue
<el-dialog v-model="showGenerateDialog" title="生成章节视频" width="700px">
  <el-form :model="generateForm" label-width="120px">
    <!-- 基础配置 -->
    <el-form-item label="分镜数量">
      <el-slider 
        v-model="generateForm.sceneCount" 
        :min="3" 
        :max="userLimits.maxSceneCount"
        :marks="sceneMarks"
        show-stops
      />
      <div class="form-tip">
        您的套餐最多支持{{ userLimits.maxSceneCount }}个分镜
      </div>
    </el-form-item>

    <el-form-item label="视频时长">
      <el-slider 
        v-model="generateForm.videoDuration" 
        :min="3" 
        :max="Math.min(userLimits.maxVideoDuration, 60)"
        :marks="durationMarks"
        show-stops
      />
    </el-form-item>

    <!-- 视觉风格 -->
    <el-form-item label="视觉风格">
      <el-select v-model="generateForm.visualStyle">
        <el-option label="写实风格" value="realistic" />
        <el-option label="动漫风格" value="anime" />
        <el-option label="奇幻风格" value="fantasy" />
        <el-option label="科幻风格" value="scifi" />
      </el-select>
    </el-form-item>

    <!-- 图片质量（根据套餐限制） -->
    <el-form-item label="图片质量">
      <el-radio-group v-model="generateForm.imageQuality">
        <el-radio 
          label="standard" 
          :disabled="!userLimits.allowedQualities.includes('standard')"
        >
          标准质量
        </el-radio>
        <el-radio 
          label="high" 
          :disabled="!userLimits.allowedQualities.includes('high')"
        >
          高质量
          <el-tag v-if="!userLimits.allowedQualities.includes('high')" type="warning" size="small">
            需升级
          </el-tag>
        </el-radio>
        <el-radio 
          label="ultra" 
          :disabled="!userLimits.allowedQualities.includes('ultra')"
        >
          超高质量
          <el-tag v-if="!userLimits.allowedQualities.includes('ultra')" type="danger" size="small">
            仅企业版
          </el-tag>
        </el-radio>
      </el-radio-group>
    </el-form-item>

    <!-- 高级参数（需要权限） -->
    <el-collapse v-if="userLimits.enableAdvancedParams">
      <el-collapse-item title="高级参数" name="advanced">
        <el-form-item label="采样步数">
          <el-slider v-model="generateForm.samplingSteps" :min="20" :max="50" show-input />
          <div class="tip">步数越多质量越好，但耗时越长</div>
        </el-form-item>

        <el-form-item label="CFG Scale">
          <el-slider v-model="generateForm.cfgScale" :min="1" :max="20" :step="0.5" show-input />
          <div class="tip">提示词引导强度</div>
        </el-form-item>

        <el-form-item label="负向提示词">
          <el-input 
            v-model="generateForm.negativePrompt" 
            type="textarea"
            :rows="3"
            placeholder="自定义负向提示词（可选）"
          />
        </el-form-item>
      </el-collapse-item>
    </el-collapse>

    <!-- 升级提示 -->
    <el-alert
      v-if="!userLimits.enableAdvancedParams"
      title="高级参数需要升级套餐"
      type="warning"
      :closable="false"
      show-icon
    >
      <div>升级到专业版或企业版即可使用高级参数配置</div>
      <el-button type="text" @click="goToUpgrade">立即升级 →</el-button>
    </el-alert>

    <!-- 成本预估 -->
    <el-alert title="成本预估" type="info" :closable="false" show-icon>
      <div>预计成本：¥{{ estimatedCost.toFixed(2) }}</div>
      <div class="tip">
        图片生成：¥{{ (systemConfig.costPerImage * generateForm.sceneCount).toFixed(2) }}
        + 视频生成：¥{{ (systemConfig.costPerVideo * generateForm.sceneCount).toFixed(2) }}
      </div>
      <div class="quota-info">
        剩余配额：每日{{ dailyRemaining }}/{{ userLimits.dailyQuota }}，
        每月{{ monthlyRemaining }}/{{ userLimits.monthlyQuota }}
      </div>
    </el-alert>
  </el-form>

  <template #footer>
    <el-button @click="showGenerateDialog = false">取消</el-button>
    <el-button 
      type="primary" 
      @click="handleGenerate"
      :loading="isGenerating"
    >
      开始生成
    </el-button>
  </template>
</el-dialog>
```

**新增方法**:

```javascript
// 加载用户权限限制
const loadUserLimits = async () => {
  try {
    const response = await apiManager.get('/ai/video-generation/permissions')
    userLimits.value = response.data.limits
  } catch (error) {
    console.error('获取权限失败:', error)
  }
}

// 提交生成（包含用户参数）
const handleGenerate = async () => {
  isGenerating.value = true
  try {
    // 包含所有用户自定义参数
    await videoGenerationService.generateVideo({
      chapterId: props.chapterId,
      sceneCount: generateForm.value.sceneCount,
      videoDuration: generateForm.value.videoDuration,
      visualStyle: generateForm.value.visualStyle,
      // 文生图参数
      imageResolution: generateForm.value.imageResolution,
      imageQuality: generateForm.value.imageQuality,
      samplingSteps: generateForm.value.samplingSteps,
      cfgScale: generateForm.value.cfgScale,
      negativePrompt: generateForm.value.negativePrompt,
      // 图生视频参数
      fps: generateForm.value.fps,
      motionIntensity: generateForm.value.motionIntensity,
      videoQuality: generateForm.value.videoQuality,
      compressionLevel: generateForm.value.compressionLevel,
      transitionEffect: generateForm.value.transitionEffect,
      addTitleFrame: generateForm.value.addTitleFrame,
    })

    ElMessage.success('视频生成任务已提交')
    showGenerateDialog.value = false
    startPolling()
  } catch (error) {
    ElMessage.error(error.message || '生成失败')
  } finally {
    isGenerating.value = false
  }
}
```

---

### Step 7: 后端添加权限查询接口

**文件**: `apps/ai-service/src/modules/video-generation/video-generation.controller.ts`

**新增接口**:

```typescript
@Get('permissions')
@ApiOperation({ summary: '获取当前用户的视频生成权限' })
@ApiResponse({ status: 200, description: '返回权限信息' })
async getPermissions(@Req() req: any) {
  const userId = req.user.userId;
  return this.videoGenerationService.getUserPermissions(userId);
}
```

**VideoGenerationService新增方法**:

```typescript
async getUserPermissions(userId: string) {
  const permission = await this.permissionService.checkVideoGenerationPermission(userId);
  
  if (!permission.allowed) {
    return {
      allowed: false,
      limits: {
        dailyQuota: 0,
        monthlyQuota: 0,
        maxSceneCount: 0,
        maxVideoDuration: 0,
        allowedQualities: [],
        allowedResolutions: [],
        enableAdvancedParams: false
      },
      message: '请升级套餐以使用视频生成功能'
    };
  }

  // 获取实际剩余配额
  const quota = await this.videoConfigService.checkUserQuota(userId);
  
  return {
    allowed: true,
    limits: {
      ...permission.limits,
      dailyRemaining: Math.min(quota.dailyRemaining, permission.limits.dailyQuota),
      monthlyRemaining: Math.min(quota.monthlyRemaining, permission.limits.monthlyQuota)
    }
  };
}
```

---

## 📊 套餐对比表

| 功能 | 免费版 | 基础版(¥50) | 专业版(¥200) | 企业版(¥500) |
|------|--------|-------------|--------------|--------------|
| **视频生成** | ❌ 不可用 | ✅ 可用 | ✅ 可用 | ✅ 可用 |
| **每日配额** | 0 | 2个 | 5个 | 20个 |
| **每月配额** | 0 | 10个 | 50个 | 200个 |
| **最大分镜数** | - | 5个 | 8个 | 10个 |
| **最大时长** | - | 30秒 | 60秒 | 120秒 |
| **图片质量** | - | 标准 | 标准+高 | 全部 |
| **分辨率** | - | 1024x576 | +1280x720 | +1920x1080 |
| **高级参数** | - | ❌ | ✅ | ✅ |
| **自定义提示词** | - | ❌ | ❌ | ✅ |
| **队列优先级** | - | 低 | 普通 | 高 |

---

## 🎯 用户体验差异化

### 免费用户
```
打开章节 → 点击"生成视频" 
  ↓
❌ 提示：请升级套餐以使用视频生成功能
  ↓
显示升级引导
```

### 基础版用户
```
打开章节 → 点击"生成视频"
  ↓
配置界面:
  - 分镜数量: 3-5个 ✅
  - 视频时长: 5-30秒 ✅
  - 图片质量: ● 标准 ○高（灰色）
  - 分辨率: ● 1024x576
  - 高级参数: 🔒 需升级
  ↓
生成: 标准质量，低优先级队列
```

### 专业版用户
```
打开章节 → 点击"生成视频"
  ↓
配置界面:
  - 分镜数量: 3-8个 ✅
  - 视频时长: 5-60秒 ✅
  - 图片质量: ● 标准 ● 高 ✅
  - 分辨率: ● 1024x576 ● 1280x720 ✅
  - 高级参数展开:
    - 采样步数: 20-50 ✅
    - CFG Scale: 1-20 ✅
    - 负向提示词: ✅
  ↓
生成: 高质量，普通优先级
```

### 企业版用户
```
打开章节 → 点击"生成视频"
  ↓
配置界面:
  - 分镜数量: 3-10个 ✅
  - 视频时长: 5-120秒 ✅
  - 图片质量: ● 标准 ● 高 ● 超高 ✅
  - 分辨率: 全部可选 ✅
  - 高级参数: 完全自定义 ✅
  - 自定义提示词: ✅
  ↓
生成: 超高质量，高优先级队列 ⚡
```

---

## 🔧 实施文件清单

### 需要创建的文件

1. ✅ `libs/common/src/services/package-permission.service.ts` (权限检查服务)
2. ✅ `PACKAGE-VIDEO-INTEGRATION-SOLUTION.md` (本文档)

### 需要修改的文件

1. ✅ `apps/ai-service/src/dto/video-generation.dto.ts` (已扩展)
2. ⏳ `apps/ai-service/src/modules/video-generation/video-generation.service.ts` (添加权限检查)
3. ⏳ `apps/ai-service/src/modules/video-generation/video-generation.controller.ts` (添加权限接口)
4. ⏳ `src/components/writer/ChapterVideoPanel.vue` (增强生成对话框)
5. ⏳ `src/views/admin/packages/PackageManagement.vue` (添加视频生成权限配置)

---

## 📝 后续TODO

- [ ] 创建PackagePermissionService
- [ ] 修改VideoGenerationService集成权限检查
- [ ] 添加权限查询接口
- [ ] 修改前端生成对话框支持高级参数
- [ ] 修改套餐管理界面支持结构化features
- [ ] 初始化标准套餐配置

**预计时间**: 2-3小时

---

**创建日期**: 2025-01-21  
**状态**: 📝 实施方案已完成  
**下一步**: 逐步实施


