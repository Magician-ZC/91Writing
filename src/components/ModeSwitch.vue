<template>
  <div class="mode-switch">
    <el-tooltip
      :content="tooltipContent"
      placement="bottom"
      :show-after="500"
    >
      <div class="switch-container" @click="showModeDialog = true">
        <el-icon class="mode-icon" :class="modeClass">
          <component :is="modeIcon" />
        </el-icon>
        <span class="mode-text">{{ modeText }}</span>
        <el-badge 
          v-if="pendingSyncCount > 0" 
          :value="pendingSyncCount" 
          :max="99"
          class="sync-badge"
        />
      </div>
    </el-tooltip>

    <!-- 模式切换对话框 -->
    <el-dialog
      v-model="showModeDialog"
      title="运行模式切换"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="mode-dialog-content">
        <el-alert
          title="选择适合您的运行模式"
          type="info"
          :closable="false"
          style="margin-bottom: 20px;"
        />

        <div class="mode-options">
          <div 
            class="mode-option" 
            :class="{ active: selectedMode === 'cloud' }"
            @click="selectedMode = 'cloud'"
          >
            <div class="option-header">
              <el-icon size="20" class="option-icon"><Cloudy /></el-icon>
              <div class="header-content">
                <div class="header-top">
                  <span class="option-title">云端模式</span>
                  <el-tag v-if="!isOnline" type="danger" size="small">需要网络</el-tag>
                </div>
                <p class="option-desc">数据保存在云端，支持多设备同步，需要网络连接</p>
              </div>
              <el-radio 
                v-model="selectedMode" 
                label="cloud"
                class="option-radio"
              />
            </div>
            <div class="option-features">
              <div class="feature-item">
                <el-icon class="feature-icon success"><Check /></el-icon>
                <span>多设备同步</span>
              </div>
              <div class="feature-item">
                <el-icon class="feature-icon success"><Check /></el-icon>
                <span>数据备份</span>
              </div>
              <div class="feature-item">
                <el-icon class="feature-icon error"><Close /></el-icon>
                <span>离线可用</span>
              </div>
            </div>
          </div>

          <div 
            class="mode-option" 
            :class="{ active: selectedMode === 'local' }"
            @click="selectedMode = 'local'"
          >
            <div class="option-header">
              <el-icon size="20" class="option-icon"><Monitor /></el-icon>
              <div class="header-content">
                <div class="header-top">
                  <span class="option-title">本地模式</span>
                  <el-tag type="success" size="small">无需网络</el-tag>
                </div>
                <p class="option-desc">数据保存在本地浏览器，完全离线可用</p>
              </div>
              <el-radio 
                v-model="selectedMode" 
                label="local"
                class="option-radio"
              />
            </div>
            <div class="option-features">
              <div class="feature-item">
                <el-icon class="feature-icon error"><Close /></el-icon>
                <span>多设备同步</span>
              </div>
              <div class="feature-item">
                <el-icon class="feature-icon error"><Close /></el-icon>
                <span>数据备份</span>
              </div>
              <div class="feature-item">
                <el-icon class="feature-icon success"><Check /></el-icon>
                <span>离线可用</span>
              </div>
            </div>
          </div>

          <div 
            class="mode-option" 
            :class="{ active: selectedMode === 'hybrid' }"
            @click="selectedMode = 'hybrid'"
          >
            <div class="option-header">
              <el-icon size="20" class="option-icon"><Switch /></el-icon>
              <div class="header-content">
                <div class="header-top">
                  <span class="option-title">混合模式</span>
                  <el-tag type="primary" size="small">推荐</el-tag>
                </div>
                <p class="option-desc">智能切换：在线时使用云端，离线时使用本地</p>
              </div>
              <el-radio 
                v-model="selectedMode" 
                label="hybrid"
                class="option-radio"
              />
            </div>
            <div class="option-features">
              <div class="feature-item">
                <el-icon class="feature-icon success"><Check /></el-icon>
                <span>多设备同步</span>
              </div>
              <div class="feature-item">
                <el-icon class="feature-icon success"><Check /></el-icon>
                <span>数据备份</span>
              </div>
              <div class="feature-item">
                <el-icon class="feature-icon success"><Check /></el-icon>
                <span>离线可用</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 当前状态信息 -->
        <div class="current-status">
          <h4>当前状态</h4>
          <el-descriptions :column="1" size="small" border>
            <el-descriptions-item label="网络状态">
              <el-tag :type="isOnline ? 'success' : 'danger'">
                {{ isOnline ? '在线' : '离线' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="待同步项">
              <el-tag :type="pendingSyncCount > 0 ? 'warning' : 'success'">
                {{ pendingSyncCount }} 项
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="本地数据">
              {{ localStats.novels }} 个小说，{{ localStats.chapters }} 个章节
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showModeDialog = false">取消</el-button>
          <el-button 
            type="primary" 
            :disabled="selectedMode === currentMode"
            @click="handleModeChange"
          >
            切换模式
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 同步状态提示 -->
    <el-dialog
      v-model="showSyncDialog"
      title="数据同步"
      width="400px"
      :close-on-click-modal="false"
      :show-close="false"
    >
      <div class="sync-dialog-content">
        <div class="sync-status">
          <el-icon class="sync-icon rotating"><Loading /></el-icon>
          <p>正在同步数据，请稍候...</p>
          <el-progress :percentage="syncProgress" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Cloudy,
  Monitor,
  Switch,
  Check,
  Close,
  Loading
} from '@element-plus/icons-vue'

import apiManager from '@/services/apiManager'
import dataSyncService from '@/services/dataSync'
import localStorageManager from '@/services/localStorageManager'

// 响应式数据
const showModeDialog = ref(false)
const showSyncDialog = ref(false)
const syncProgress = ref(0)
const currentMode = ref('hybrid')
const selectedMode = ref('hybrid')
const isOnline = ref(navigator.onLine)
const pendingSyncCount = ref(0)
const localStats = ref({
  novels: 0,
  chapters: 0
})

// 定时器
let statusUpdateTimer = null

// 计算属性
const modeIcon = computed(() => {
  const iconMap = {
    cloud: Cloudy,
    local: Monitor,
    hybrid: Switch
  }
  return iconMap[currentMode.value] || Switch
})

const modeText = computed(() => {
  const textMap = {
    cloud: '云端',
    local: '本地',
    hybrid: '混合'
  }
  return textMap[currentMode.value] || '未知'
})

const modeClass = computed(() => {
  const classMap = {
    cloud: 'cloud-mode',
    local: 'local-mode',
    hybrid: 'hybrid-mode'
  }
  return classMap[currentMode.value] || ''
})

const tooltipContent = computed(() => {
  let content = `当前模式: ${modeText.value}`
  
  if (!isOnline.value && currentMode.value === 'cloud') {
    content += '\n⚠️ 网络断开，功能受限'
  }
  
  if (pendingSyncCount.value > 0) {
    content += `\n🔄 ${pendingSyncCount.value} 项待同步`
  }
  
  return content
})

// 方法
const updateStatus = () => {
  currentMode.value = apiManager.getMode()
  selectedMode.value = currentMode.value
  isOnline.value = navigator.onLine
  
  const syncStatus = dataSyncService.getSyncStatus()
  pendingSyncCount.value = syncStatus.pendingSync
  
  const stats = localStorageManager.getStats()
  localStats.value = {
    novels: stats.novels,
    chapters: stats.chapters
  }
}

const handleModeChange = async () => {
  try {
    const oldMode = currentMode.value
    
    // 如果从其他模式切换到云端模式且有网络，询问是否同步
    if (selectedMode.value === 'cloud' && oldMode !== 'cloud' && isOnline.value) {
      showModeDialog.value = false
      showSyncDialog.value = true
      
      // 模拟同步进度
      let progress = 0
      const progressTimer = setInterval(() => {
        progress += Math.random() * 30
        if (progress > 90) progress = 90
        syncProgress.value = Math.floor(progress)
      }, 300)
      
      try {
        // 切换模式
        apiManager.setMode(selectedMode.value)
        currentMode.value = selectedMode.value
        
        // 执行数据同步
        await dataSyncService.manualSync()
        
        // 完成进度
        syncProgress.value = 100
        
        setTimeout(() => {
          showSyncDialog.value = false
          syncProgress.value = 0
          ElMessage.success(`已切换到${modeText.value}模式并完成数据同步`)
        }, 500)
      } catch (error) {
        console.error('模式切换失败:', error)
        syncProgress.value = 0
        showSyncDialog.value = false
        ElMessage.error('模式切换失败: ' + error.message)
      } finally {
        clearInterval(progressTimer)
      }
    } else {
      // 直接切换模式
      apiManager.setMode(selectedMode.value)
      currentMode.value = selectedMode.value
      showModeDialog.value = false
      ElMessage.success(`已切换到${modeText.value}模式`)
    }
    
    updateStatus()
  } catch (error) {
    console.error('模式切换失败:', error)
    ElMessage.error('模式切换失败')
  }
}

const handleOnlineStatusChange = () => {
  updateStatus()
  
  // 如果是混合模式且刚刚联网，自动同步
  if (currentMode.value === 'hybrid' && isOnline.value) {
    setTimeout(() => {
      dataSyncService.autoSync()
    }, 1000)
  }
}

// 生命周期
onMounted(() => {
  updateStatus()
  
  // 监听在线状态变化
  window.addEventListener('online', handleOnlineStatusChange)
  window.addEventListener('offline', handleOnlineStatusChange)
  
  // 定时更新状态
  statusUpdateTimer = setInterval(updateStatus, 10000) // 每10秒更新一次
})

onUnmounted(() => {
  if (statusUpdateTimer) {
    clearInterval(statusUpdateTimer)
  }
  
  window.removeEventListener('online', handleOnlineStatusChange)
  window.removeEventListener('offline', handleOnlineStatusChange)
})
</script>

<style scoped>
.mode-switch {
  position: relative;
}

.switch-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
}

.switch-container:hover {
  background: #ecf5ff;
  border-color: #b3d8ff;
}

.mode-icon {
  font-size: 16px;
  transition: color 0.3s ease;
}

.mode-icon.cloud-mode {
  color: #409eff;
}

.mode-icon.local-mode {
  color: #67c23a;
}

.mode-icon.hybrid-mode {
  color: #e6a23c;
}

.mode-text {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.sync-badge {
  position: absolute;
  top: -5px;
  right: -5px;
}

.mode-dialog-content {
  padding: 0;
}

.mode-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 20px 0;
}

.mode-option {
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
  background: #fff;
}

.mode-option:hover {
  border-color: #c0c4cc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mode-option.active {
  border-color: #409eff;
  background: #f0f7ff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.option-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.option-icon {
  margin-top: 2px;
  color: #409eff;
  flex-shrink: 0;
}

.header-content {
  flex: 1;
  min-width: 0;
}

.header-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.option-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.option-desc {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.option-radio {
  flex-shrink: 0;
  margin-top: 2px;
}

.option-features {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding-left: 36px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
}

.feature-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.feature-icon.success {
  color: #67c23a;
}

.feature-icon.error {
  color: #f56c6c;
}

.current-status {
  margin-top: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.current-status h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.sync-dialog-content {
  text-align: center;
  padding: 20px;
}

.sync-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.sync-icon {
  font-size: 32px;
  color: #409eff;
}

.rotating {
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.sync-status p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

/* Element Plus组件样式调整 */
.option-radio :deep(.el-radio__label) {
  display: none;
}

.option-radio :deep(.el-radio__input) {
  margin: 0;
}

:deep(.el-progress-bar__outer) {
  background-color: #f0f0f0;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .mode-dialog-content {
    padding: 0 12px;
  }
  
  .mode-option {
    padding: 16px;
  }
  
  .option-header {
    gap: 12px;
  }
  
  .option-features {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding-left: 28px;
  }
  
  .feature-item {
    gap: 8px;
  }
  
  .current-status {
    padding: 12px;
  }
}
</style>
