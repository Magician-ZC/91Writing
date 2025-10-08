<template>
  <div class="material-upload">
    <el-upload
      class="upload-area"
      drag
      :auto-upload="false"
      :on-change="handleFileChange"
      :file-list="fileList"
      :show-file-list="true"
      multiple
      :accept="acceptTypes"
    >
      <el-icon class="upload-icon"><upload-filled /></el-icon>
      <div class="upload-text">点击或拖拽文件到此区域上传</div>
      <div class="upload-hint">支持图片、文档、音视频等格式</div>
    </el-upload>

    <div v-if="uploadQueue.length > 0" class="upload-queue">
      <h4>待上传文件 ({{ uploadQueue.length }})</h4>
      <div class="queue-list">
        <div v-for="(item, index) in uploadQueue" :key="index" class="queue-item">
          <el-icon><document /></el-icon>
          <span class="file-name">{{ item.file.name }}</span>
          <span class="file-size">{{ formatSize(item.file.size) }}</span>
          <el-icon class="remove-icon" @click="removeFromQueue(index)"><close /></el-icon>
        </div>
      </div>
      <div class="upload-actions">
        <el-button @click="clearQueue">清空</el-button>
        <el-button type="primary" @click="startUpload" :loading="uploading">
          开始上传 ({{ uploadQueue.length }})
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled, Document, Close } from '@element-plus/icons-vue'
import materialService from '@/services/materialService'

const props = defineProps({
  accept: {
    type: String,
    default: 'image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.md'
  },
  category: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['upload-success', 'upload-complete'])

const fileList = ref([])
const uploadQueue = ref([])
const uploading = ref(false)

const acceptTypes = ref(props.accept)

/**
 * 处理文件变化
 */
const handleFileChange = (file) => {
  const isDuplicate = uploadQueue.value.some(item => 
    item.file.name === file.name && item.file.size === file.size
  )
  
  if (isDuplicate) {
    ElMessage.warning('文件已在上传队列中')
    return
  }

  uploadQueue.value.push({
    file: file.raw || file,
    name: file.name,
    category: props.category,
    tags: []
  })
}

/**
 * 从队列中移除文件
 */
const removeFromQueue = (index) => {
  uploadQueue.value.splice(index, 1)
}

/**
 * 清空队列
 */
const clearQueue = () => {
  uploadQueue.value = []
  fileList.value = []
}

/**
 * 开始上传
 */
const startUpload = async () => {
  if (uploadQueue.value.length === 0) {
    ElMessage.warning('请选择要上传的文件')
    return
  }

  uploading.value = true
  const successCount = ref(0)
  const failCount = ref(0)

  for (const item of uploadQueue.value) {
    try {
      // 上传文件并获取URL
      const uploadResult = await materialService.uploadFile(item.file)
      
      // 创建素材记录
      const materialType = materialService.getMaterialType(item.file.type)
      const materialData = {
        name: item.name,
        type: materialType,
        category: item.category || null,
        fileUrl: uploadResult.url,
        fileSize: uploadResult.size,
        description: '',
        tags: item.tags || []
      }

      const material = await materialService.createMaterial(materialData)
      successCount.value++
      emit('upload-success', material)
    } catch (error) {
      console.error('上传失败:', error)
      failCount.value++
    }
  }

  uploading.value = false

  if (successCount.value > 0) {
    ElMessage.success(`成功上传 ${successCount.value} 个文件`)
    clearQueue()
    emit('upload-complete', { success: successCount.value, fail: failCount.value })
  }

  if (failCount.value > 0) {
    ElMessage.error(`${failCount.value} 个文件上传失败`)
  }
}

/**
 * 格式化文件大小
 */
const formatSize = (bytes) => {
  return materialService.formatFileSize(bytes)
}
</script>

<style scoped>
.material-upload {
  width: 100%;
}

.upload-area {
  width: 100%;
}

.upload-area :deep(.el-upload-dragger) {
  padding: 40px;
  width: 100%;
}

.upload-icon {
  font-size: 67px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 16px;
  color: #606266;
  margin-bottom: 8px;
}

.upload-hint {
  font-size: 14px;
  color: #909399;
}

.upload-queue {
  margin-top: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.upload-queue h4 {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: #606266;
}

.queue-list {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 15px;
}

.queue-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 4px;
  margin-bottom: 8px;
}

.queue-item .el-icon {
  font-size: 18px;
  color: #409eff;
  margin-right: 10px;
}

.file-name {
  flex: 1;
  font-size: 14px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 12px;
  color: #909399;
  margin-right: 10px;
}

.remove-icon {
  color: #f56c6c;
  cursor: pointer;
  font-size: 16px;
}

.remove-icon:hover {
  opacity: 0.8;
}

.upload-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
