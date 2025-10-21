<template>
  <div class="chapter-video-panel">
    <!-- 视频状态卡片 -->
    <el-card class="status-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">
            <el-icon><VideoCamera /></el-icon>
            章节视频
          </span>
          <el-tag v-if="videoStatus" :type="statusType">{{ statusText }}</el-tag>
        </div>
      </template>

      <!-- 视频已生成 -->
      <div v-if="videoStatus?.status === 'COMPLETED' && videoStatus?.videoUrl" class="video-container">
        <video 
          :src="videoStatus.videoUrl" 
          controls 
          class="video-player"
          @error="handleVideoError"
        >
          您的浏览器不支持视频播放
        </video>

        <div class="video-actions">
          <el-button 
            type="primary" 
            :icon="Download" 
            @click="downloadVideo"
          >
            下载视频
          </el-button>
          <el-button 
            type="warning" 
            :icon="Refresh" 
            @click="regenerateVideo"
          >
            重新生成
          </el-button>
          <el-button 
            type="danger" 
            :icon="Delete" 
            @click="deleteVideo"
          >
            删除视频
          </el-button>
        </div>
      </div>

      <!-- 生成中 -->
      <div v-else-if="videoStatus?.status === 'GENERATING'" class="generating-container">
        <el-progress 
          :percentage="videoStatus.progress" 
          :status="videoStatus.progress === 100 ? 'success' : ''"
          :stroke-width="20"
        >
          <template #default="{ percentage }">
            <span class="percentage-value">{{ percentage }}%</span>
          </template>
        </el-progress>

        <div class="stage-info">
          <el-tag type="info">{{ stageText }}</el-tag>
          <span class="stage-desc">{{ stageDescription }}</span>
        </div>

        <!-- 已生成的图片预览 -->
        <div v-if="videoStatus.generatedImages && videoStatus.generatedImages.length" class="images-preview">
          <div class="preview-title">已生成的场景图片：</div>
          <el-scrollbar height="200px">
            <div class="images-grid">
              <el-image 
                v-for="(img, index) in videoStatus.generatedImages" 
                :key="index"
                :src="img"
                :preview-src-list="videoStatus.generatedImages"
                :initial-index="index"
                fit="cover"
                class="preview-image"
              >
                <template #error>
                  <div class="image-error">加载失败</div>
                </template>
              </el-image>
            </div>
          </el-scrollbar>
        </div>

        <el-alert
          title="视频生成中，请稍候..."
          type="info"
          :closable="false"
          show-icon
          class="generating-alert"
        >
          <template #default>
            <div>预计还需 {{ estimatedTime }} 分钟</div>
            <div class="tip">您可以先去做其他事情，生成完成后会通知您</div>
          </template>
        </el-alert>
      </div>

      <!-- 生成失败 -->
      <div v-else-if="videoStatus?.status === 'FAILED'" class="error-container">
        <el-result icon="error" title="视频生成失败">
          <template #sub-title>
            <div class="error-message">{{ videoStatus.errorMessage || '未知错误' }}</div>
          </template>
          <template #extra>
            <el-button type="primary" @click="regenerateVideo">重新生成</el-button>
          </template>
        </el-result>
      </div>

      <!-- 未生成 -->
      <div v-else class="empty-container">
        <el-empty description="尚未生成视频">
          <el-button 
            type="primary" 
            :icon="VideoCamera" 
            @click="showGenerateDialog = true"
            :loading="isGenerating"
          >
            生成章节视频
          </el-button>
        </el-empty>
      </div>
    </el-card>

    <!-- 生成配置对话框 -->
    <el-dialog
      v-model="showGenerateDialog"
      title="生成章节视频"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-alert
        v-if="userLimits && !userLimits.allowed"
        title="需要升级套餐"
        type="warning"
        :closable="false"
        show-icon
        class="upgrade-alert"
      >
        <div>{{ userLimits.message }}</div>
        <el-button type="primary" size="small" @click="goToUpgrade">立即升级</el-button>
      </el-alert>

      <el-form v-else :model="generateForm" label-width="130px">
        <!-- 基础配置 -->
        <el-divider content-position="left">基础配置</el-divider>

        <el-form-item label="分镜数量">
          <el-slider 
            v-model="generateForm.sceneCount" 
            :min="3" 
            :max="userLimits?.limits?.maxSceneCount || 10" 
            :marks="sceneMarks"
            show-stops
          />
          <div class="form-tip">
            您的套餐最多支持{{ userLimits?.limits?.maxSceneCount || 10 }}个分镜
          </div>
        </el-form-item>

        <el-form-item label="单场景时长">
          <el-slider 
            v-model="generateForm.videoDuration" 
            :min="3" 
            :max="15" 
            :marks="durationMarks"
            show-stops
          />
          <div class="form-tip">每个场景的视频时长（秒）</div>
        </el-form-item>

        <el-form-item label="视觉风格">
          <el-select v-model="generateForm.visualStyle" placeholder="选择视觉风格">
            <el-option label="写实风格" value="realistic" />
            <el-option label="动漫风格" value="anime" />
            <el-option label="奇幻风格" value="fantasy" />
            <el-option label="科幻风格" value="scifi" />
          </el-select>
        </el-form-item>

        <!-- 图片质量（根据套餐） -->
        <el-divider content-position="left">图片质量</el-divider>

        <el-form-item label="质量级别">
          <el-radio-group v-model="generateForm.imageQuality">
            <el-radio 
              label="standard" 
              :disabled="!isQualityAllowed('standard')"
            >
              标准质量
            </el-radio>
            <el-radio 
              label="high" 
              :disabled="!isQualityAllowed('high')"
            >
              高质量
              <el-tag v-if="!isQualityAllowed('high')" type="warning" size="small">
                需升级
              </el-tag>
            </el-radio>
            <el-radio 
              label="ultra" 
              :disabled="!isQualityAllowed('ultra')"
            >
              超高质量
              <el-tag v-if="!isQualityAllowed('ultra')" type="danger" size="small">
                仅企业版
              </el-tag>
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="分辨率">
          <el-select v-model="generateForm.imageResolution">
            <el-option 
              label="1024x576 (16:9推荐)" 
              value="1024x576"
              :disabled="!isResolutionAllowed('1024x576')"
            />
            <el-option 
              label="1280x720 (HD)" 
              value="1280x720"
              :disabled="!isResolutionAllowed('1280x720')"
            >
              <span>1280x720 (HD)</span>
              <el-tag v-if="!isResolutionAllowed('1280x720')" type="warning" size="small">需升级</el-tag>
            </el-option>
            <el-option 
              label="1920x1080 (Full HD)" 
              value="1920x1080"
              :disabled="!isResolutionAllowed('1920x1080')"
            >
              <span>1920x1080 (Full HD)</span>
              <el-tag v-if="!isResolutionAllowed('1920x1080')" type="danger" size="small">仅企业版</el-tag>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- 高级参数（专业版及以上） -->
        <el-collapse v-if="userLimits?.limits?.enableAdvancedParams" style="margin-bottom: 16px">
          <el-collapse-item title="🔧 高级参数配置" name="advanced">
            <el-form-item label="采样步数">
              <el-slider 
                v-model="generateForm.samplingSteps" 
                :min="20" 
                :max="50" 
                show-input
              />
              <div class="form-tip">步数越多质量越好，但耗时越长（推荐30）</div>
            </el-form-item>

            <el-form-item label="CFG Scale">
              <el-slider 
                v-model="generateForm.cfgScale" 
                :min="1" 
                :max="20" 
                :step="0.5" 
                show-input
              />
              <div class="form-tip">提示词引导强度（推荐7-12）</div>
            </el-form-item>

            <el-form-item label="图生视频FPS">
              <el-radio-group v-model="generateForm.fps">
                <el-radio :label="24">24 FPS（电影）</el-radio>
                <el-radio :label="30">30 FPS（推荐）</el-radio>
                <el-radio :label="60">60 FPS（高流畅）</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="运动幅度">
              <el-radio-group v-model="generateForm.motionIntensity">
                <el-radio label="low">低（静态）</el-radio>
                <el-radio label="medium">中（推荐）</el-radio>
                <el-radio label="high">高（动作）</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="转场效果">
              <el-select v-model="generateForm.transitionEffect">
                <el-option label="淡入淡出（推荐）" value="fade" />
                <el-option label="交叉溶解" value="crossfade" />
                <el-option label="滑动" value="slide" />
                <el-option label="无转场" value="none" />
              </el-select>
            </el-form-item>
          </el-collapse-item>
        </el-collapse>

        <!-- 升级提示 -->
        <el-alert
          v-if="!userLimits?.limits?.enableAdvancedParams"
          title="高级参数需要升级套餐"
          type="info"
          :closable="false"
          show-icon
        >
          <div>升级到<el-text type="primary">专业版</el-text>或<el-text type="primary">企业版</el-text>即可使用高级参数配置</div>
          <el-button type="text" size="small" @click="goToUpgrade">立即升级 →</el-button>
        </el-alert>

        <el-form-item label="重新生成">
          <el-switch 
            v-model="generateForm.forceRegenerate" 
            active-text="强制重新生成"
            inactive-text="使用已有内容"
          />
        </el-form-item>

        <!-- 配额和成本信息 -->
        <el-card shadow="never" class="info-card">
          <div class="info-row">
            <div class="info-item">
              <span class="label">剩余配额:</span>
              <span class="value">
                每日 {{ userLimits?.limits?.dailyRemaining || 0 }}/{{ userLimits?.limits?.dailyQuota || 0 }}，
                每月 {{ userLimits?.limits?.monthlyRemaining || 0 }}/{{ userLimits?.limits?.monthlyQuota || 0 }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">预计成本:</span>
              <span class="value primary">¥{{ estimatedCost.toFixed(2) }}</span>
            </div>
            <div class="info-item">
              <span class="label">预计时长:</span>
              <span class="value">{{ estimatedTime }}分钟</span>
            </div>
          </div>
        </el-card>
      </el-form>

      <template #footer>
        <el-button @click="showGenerateDialog = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleGenerate"
          :loading="isGenerating"
          :disabled="!userLimits?.allowed"
        >
          开始生成
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  VideoCamera, 
  Download, 
  Refresh, 
  Delete 
} from '@element-plus/icons-vue'
import { videoGenerationService } from '@/services/videoGenerationService'

const props = defineProps({
  chapterId: {
    type: String,
    required: true
  },
  novelId: {
    type: String,
    required: true
  }
})

// 状态
const videoStatus = ref(null)
const showGenerateDialog = ref(false)
const isGenerating = ref(false)
const pollingTimer = ref(null)
const userLimits = ref(null)

// 生成配置（包含所有用户可自定义的参数）
const generateForm = ref({
  // 基础参数
  sceneCount: 5,
  videoDuration: 5,
  visualStyle: 'realistic',
  forceRegenerate: false,
  
  // 文生图参数
  imageResolution: '1024x576',
  imageQuality: 'standard',
  samplingSteps: 30,
  cfgScale: 7.5,
  negativePrompt: '',
  
  // 图生视频参数
  videoResolution: '1024x576',
  fps: 30,
  motionIntensity: 'medium',
  videoQuality: 'high',
  compressionLevel: 'medium',
  transitionEffect: 'fade',
  addTitleFrame: true
})

// 滑块标记
const sceneMarks = {
  3: '3个',
  5: '5个',
  8: '8个',
  10: '10个'
}

const durationMarks = {
  3: '3秒',
  5: '5秒',
  10: '10秒',
  15: '15秒'
}

// 计算属性
const statusType = computed(() => {
  const statusMap = {
    'PENDING': 'info',
    'GENERATING': 'warning',
    'COMPLETED': 'success',
    'FAILED': 'danger',
    'CANCELLED': 'info'
  }
  return statusMap[videoStatus.value?.status] || 'info'
})

const statusText = computed(() => {
  const textMap = {
    'PENDING': '待生成',
    'GENERATING': '生成中',
    'COMPLETED': '已完成',
    'FAILED': '失败',
    'CANCELLED': '已取消'
  }
  return textMap[videoStatus.value?.status] || '未知'
})

const stageText = computed(() => {
  const stageMap = {
    'SCRIPT': '分镜脚本生成',
    'IMAGE': '场景图片生成',
    'VIDEO': '视频片段生成',
    'MERGE': '视频合成',
    'UPLOAD': '上传完成',
    'COMPLETED': '全部完成'
  }
  return stageMap[videoStatus.value?.stage] || '准备中'
})

const stageDescription = computed(() => {
  const descMap = {
    'SCRIPT': '正在分析章节内容，生成分镜脚本...',
    'IMAGE': '正在根据分镜描述生成场景图片...',
    'VIDEO': '正在将图片转化为视频片段...',
    'MERGE': '正在合成完整视频...',
    'UPLOAD': '正在上传视频...',
    'COMPLETED': '视频生成完成！'
  }
  return descMap[videoStatus.value?.stage] || ''
})

const estimatedTime = computed(() => {
  if (!videoStatus.value) return 0
  const progress = videoStatus.value.progress || 0
  const totalTime = 8 // 预计总时长8分钟
  const remaining = ((100 - progress) / 100) * totalTime
  return Math.ceil(remaining)
})

const estimatedCost = computed(() => {
  // 成本计算：图片生成 + 视频生成（根据质量调整）
  const sceneCount = generateForm.value.sceneCount || 5
  
  // 图片成本（质量系数）
  const qualityMultiplier = {
    'standard': 1.0,
    'high': 1.5,
    'ultra': 2.0
  }
  const imageCost = 0.02 * sceneCount * (qualityMultiplier[generateForm.value.imageQuality] || 1.0)
  
  // 视频成本
  const videoCost = 1.5 * sceneCount
  
  return imageCost + videoCost
})

const estimatedTime = computed(() => {
  // 预计时间（分钟）
  const sceneCount = generateForm.value.sceneCount || 5
  const baseTime = 3 // 基础时间3分钟
  const sceneTime = sceneCount * 1 // 每个场景1分钟
  return baseTime + sceneTime
})

// 权限检查辅助函数
const isQualityAllowed = (quality) => {
  return userLimits.value?.limits?.allowedQualities?.includes(quality) || false
}

const isResolutionAllowed = (resolution) => {
  return userLimits.value?.limits?.allowedResolutions?.includes(resolution) || false
}

// 方法
const loadVideoStatus = async () => {
  try {
    const status = await videoGenerationService.getVideoStatus(props.chapterId)
    videoStatus.value = status

    // 如果正在生成，启动轮询
    if (status.status === 'GENERATING') {
      startPolling()
    }
  } catch (error) {
    console.error('获取视频状态失败:', error)
  }
}

const loadUserLimits = async () => {
  try {
    const response = await videoGenerationService.getUserPermissions()
    userLimits.value = response
    
    // 根据权限设置默认值
    if (response.allowed && response.limits) {
      generateForm.value.imageQuality = response.limits.allowedQualities[0] || 'standard'
      generateForm.value.imageResolution = response.limits.allowedResolutions[0] || '1024x576'
    }
  } catch (error) {
    console.error('获取权限失败:', error)
    userLimits.value = {
      allowed: false,
      message: '获取权限失败，请刷新重试'
    }
  }
}

const handleGenerate = async () => {
  // 检查权限
  if (!userLimits.value?.allowed) {
    ElMessage.warning('您没有视频生成权限，请升级套餐')
    return
  }

  isGenerating.value = true
  try {
    // 提交所有参数到后端
    await videoGenerationService.generateVideo({
      chapterId: props.chapterId,
      // 基础参数
      sceneCount: generateForm.value.sceneCount,
      videoDuration: generateForm.value.videoDuration,
      visualStyle: generateForm.value.visualStyle,
      forceRegenerate: generateForm.value.forceRegenerate,
      // 文生图参数
      imageResolution: generateForm.value.imageResolution,
      imageQuality: generateForm.value.imageQuality,
      samplingSteps: generateForm.value.samplingSteps,
      cfgScale: generateForm.value.cfgScale,
      negativePrompt: generateForm.value.negativePrompt,
      // 图生视频参数
      videoResolution: generateForm.value.videoResolution,
      fps: generateForm.value.fps,
      motionIntensity: generateForm.value.motionIntensity,
      videoQuality: generateForm.value.videoQuality,
      compressionLevel: generateForm.value.compressionLevel,
      transitionEffect: generateForm.value.transitionEffect,
      addTitleFrame: generateForm.value.addTitleFrame
    })

    ElMessage.success('视频生成任务已提交，请稍候...')
    showGenerateDialog.value = false

    // 开始轮询状态
    await loadVideoStatus()
    startPolling()
  } catch (error) {
    ElMessage.error(error.message || '生成失败')
  } finally {
    isGenerating.value = false
  }
}

const goToUpgrade = () => {
  // 跳转到套餐购买页面
  window.open('/subscription', '_blank')
}

const regenerateVideo = async () => {
  try {
    await ElMessageBox.confirm(
      '重新生成将覆盖当前视频，是否继续？',
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    generateForm.value.forceRegenerate = true
    showGenerateDialog.value = true
  } catch {
    // 用户取消
  }
}

const deleteVideo = async () => {
  try {
    await ElMessageBox.confirm(
      '删除后可以重新生成，是否继续？',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await videoGenerationService.deleteVideo(props.chapterId)
    ElMessage.success('视频已删除')
    await loadVideoStatus()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const downloadVideo = () => {
  if (videoStatus.value?.videoUrl) {
    const link = document.createElement('a')
    link.href = videoStatus.value.videoUrl
    link.download = `chapter-${props.chapterId}-video.mp4`
    link.click()
  }
}

const handleVideoError = () => {
  ElMessage.error('视频加载失败')
}

const startPolling = () => {
  if (pollingTimer.value) return

  pollingTimer.value = setInterval(async () => {
    await loadVideoStatus()

    // 如果已完成或失败，停止轮询
    if (videoStatus.value?.status !== 'GENERATING') {
      stopPolling()

      if (videoStatus.value?.status === 'COMPLETED') {
        ElMessage.success('视频生成完成！')
      } else if (videoStatus.value?.status === 'FAILED') {
        ElMessage.error('视频生成失败')
      }
    }
  }, 5000) // 5秒轮询一次
}

const stopPolling = () => {
  if (pollingTimer.value) {
    clearInterval(pollingTimer.value)
    pollingTimer.value = null
  }
}

// 生命周期
onMounted(() => {
  loadVideoStatus()
  loadUserLimits()
})

onUnmounted(() => {
  stopPolling()
})
</script>

<style scoped lang="scss">
.chapter-video-panel {
  .status-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 500;
      }
    }
  }

  .video-container {
    .video-player {
      width: 100%;
      max-height: 400px;
      border-radius: 8px;
      background: #000;
    }

    .video-actions {
      display: flex;
      gap: 10px;
      margin-top: 16px;
      justify-content: center;
    }
  }

  .generating-container {
    .stage-info {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 20px 0;

      .stage-desc {
        color: #606266;
        font-size: 14px;
      }
    }

    .images-preview {
      margin: 20px 0;

      .preview-title {
        font-size: 14px;
        color: #606266;
        margin-bottom: 12px;
      }

      .images-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 12px;
        padding: 8px;

        .preview-image {
          width: 100%;
          height: 120px;
          border-radius: 4px;
          cursor: pointer;

          .image-error {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            background: #f5f7fa;
            color: #909399;
          }
        }
      }
    }

    .generating-alert {
      margin-top: 16px;

      .tip {
        margin-top: 8px;
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .error-container {
    .error-message {
      color: #f56c6c;
      font-size: 14px;
      margin: 12px 0;
    }
  }

  .empty-container {
    padding: 40px 0;
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 8px;
  }

  .percentage-value {
    font-size: 16px;
    font-weight: 500;
  }
}
</style>

