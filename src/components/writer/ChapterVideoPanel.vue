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
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="generateForm" label-width="120px">
        <el-form-item label="分镜数量">
          <el-slider 
            v-model="generateForm.sceneCount" 
            :min="3" 
            :max="10" 
            :marks="sceneMarks"
            show-stops
          />
          <div class="form-tip">建议3-8个场景，过多会增加生成时间和成本</div>
        </el-form-item>

        <el-form-item label="视频时长">
          <el-slider 
            v-model="generateForm.videoDuration" 
            :min="10" 
            :max="30" 
            :marks="durationMarks"
            show-stops
          />
          <div class="form-tip">建议15-30秒，保持短视频格式</div>
        </el-form-item>

        <el-form-item label="视觉风格">
          <el-select v-model="generateForm.visualStyle" placeholder="选择视觉风格">
            <el-option label="写实风格" value="realistic" />
            <el-option label="动漫风格" value="anime" />
            <el-option label="奇幻风格" value="fantasy" />
            <el-option label="科幻风格" value="scifi" />
          </el-select>
        </el-form-item>

        <el-form-item label="重新生成">
          <el-switch 
            v-model="generateForm.forceRegenerate" 
            active-text="强制重新生成"
            inactive-text="使用已有内容"
          />
        </el-form-item>

        <el-alert
          title="成本预估"
          type="warning"
          :closable="false"
          show-icon
        >
          <div>预计成本：¥{{ estimatedCost.toFixed(2) }}</div>
          <div class="tip">包含图片生成和视频生成费用</div>
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

// 生成配置
const generateForm = ref({
  sceneCount: 5,
  videoDuration: 15,
  visualStyle: 'realistic',
  forceRegenerate: false
})

// 滑块标记
const sceneMarks = {
  3: '3个',
  5: '5个',
  8: '8个',
  10: '10个'
}

const durationMarks = {
  10: '10秒',
  15: '15秒',
  20: '20秒',
  30: '30秒'
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
  // 成本计算：图片生成 + 视频生成
  const imageCost = 0.02 * generateForm.value.sceneCount
  const videoCost = 1.5 * generateForm.value.sceneCount
  return imageCost + videoCost
})

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

const handleGenerate = async () => {
  isGenerating.value = true
  try {
    await videoGenerationService.generateVideo({
      chapterId: props.chapterId,
      ...generateForm.value
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

