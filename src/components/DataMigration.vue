<template>
  <div class="data-migration">
    <el-card class="migration-card">
      <template #header>
        <div class="card-header">
          <h3>数据迁移工具</h3>
          <el-tag :type="getStatusType()" size="small">
            {{ getStatusText() }}
          </el-tag>
        </div>
      </template>

      <div class="migration-content">
        <!-- 运行模式选择 -->
        <el-alert
          title="选择运行模式"
          type="info"
          :closable="false"
          class="mode-alert"
        >
          <template #default>
            <p>91Writing 支持三种运行模式：</p>
            <ul>
              <li><strong>云端模式</strong>：数据保存在云端，需要网络连接</li>
              <li><strong>本地模式</strong>：数据保存在本地，无需网络</li>
              <li><strong>混合模式</strong>：智能切换，在线时同步云端，离线时使用本地</li>
            </ul>
          </template>
        </el-alert>

        <el-form :model="migrationForm" label-width="120px" class="migration-form">
          <el-form-item label="运行模式">
            <el-radio-group v-model="migrationForm.mode" @change="handleModeChange">
              <el-radio label="cloud">
                <el-icon><Cloudy /></el-icon>
                云端模式
              </el-radio>
              <el-radio label="local">
                <el-icon><Monitor /></el-icon>
                本地模式
              </el-radio>
              <el-radio label="hybrid">
                <el-icon><Switch /></el-icon>
                混合模式 (推荐)
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="同步设置" v-if="migrationForm.mode !== 'local'">
            <el-checkbox v-model="migrationForm.autoSync">
              自动同步 (联网时自动同步数据)
            </el-checkbox>
          </el-form-item>

          <el-form-item label="冲突解决" v-if="migrationForm.mode !== 'local'">
            <el-select v-model="migrationForm.conflictResolution" placeholder="选择冲突解决策略">
              <el-option
                label="询问用户 (推荐)"
                value="ask"
              />
              <el-option
                label="优先本地版本"
                value="local"
              />
              <el-option
                label="优先云端版本"
                value="cloud"
              />
            </el-select>
          </el-form-item>
        </el-form>

        <!-- 数据状态 -->
        <div class="data-status">
          <h4>数据状态</h4>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-statistic
                title="本地小说"
                :value="localStats.novels"
                prefix="📚"
              />
            </el-col>
            <el-col :span="8">
              <el-statistic
                title="本地章节"
                :value="localStats.chapters"
                prefix="📄"
              />
            </el-col>
            <el-col :span="8">
              <el-statistic
                title="待同步项"
                :value="syncStatus.pendingSync"
                prefix="🔄"
              />
            </el-col>
          </el-row>
        </div>

        <!-- 同步状态 -->
        <div class="sync-status" v-if="migrationForm.mode !== 'local'">
          <h4>同步状态</h4>
          <div class="sync-info">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="网络状态">
                <el-tag :type="syncStatus.isOnline ? 'success' : 'danger'">
                  {{ syncStatus.isOnline ? '在线' : '离线' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="最后同步">
                {{ formatSyncTime(syncStatus.lastSyncTime) }}
              </el-descriptions-item>
              <el-descriptions-item label="同步状态">
                <el-tag :type="syncStatus.issyncing ? 'warning' : 'info'">
                  {{ syncStatus.issyncing ? '同步中' : '空闲' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="冲突策略">
                {{ getConflictResolutionText(syncStatus.conflictResolution) }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="migration-actions">
          <h4>数据操作</h4>
          <el-button-group>
            <el-button
              type="primary"
              :loading="syncStatus.issyncing"
              :disabled="migrationForm.mode === 'local' || !syncStatus.isOnline"
              @click="handleManualSync"
            >
              <el-icon><Refresh /></el-icon>
              手动同步
            </el-button>
            
            <el-button
              type="success"
              @click="handleExportData"
            >
              <el-icon><Download /></el-icon>
              导出数据
            </el-button>
            
            <el-button
              type="warning"
              @click="handleImportData"
            >
              <el-icon><Upload /></el-icon>
              导入数据
            </el-button>
          </el-button-group>

          <div class="advanced-actions" style="margin-top: 16px;">
            <el-button
              type="info"
              plain
              @click="showAdvancedOptions = !showAdvancedOptions"
            >
              <el-icon><Tools /></el-icon>
              {{ showAdvancedOptions ? '隐藏' : '显示' }}高级选项
            </el-button>
          </div>

          <!-- 高级选项 -->
          <div v-show="showAdvancedOptions" class="advanced-options">
            <el-divider>高级选项</el-divider>
            
            <el-button-group size="small">
              <el-button
                type="danger"
                plain
                @click="handleResetSync"
              >
                <el-icon><Delete /></el-icon>
                重置同步状态
              </el-button>
              
              <el-button
                type="danger"
                plain
                @click="handleClearLocalData"
              >
                <el-icon><DeleteFilled /></el-icon>
                清空本地数据
              </el-button>
            </el-button-group>
            
            <div class="warning-text">
              <el-alert
                title="警告：高级操作可能导致数据丢失，请谨慎使用！"
                type="warning"
                :closable="false"
                show-icon
                style="margin-top: 12px;"
              />
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 导入文件选择 -->
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      style="display: none"
      @change="handleFileSelected"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Cloudy,
  Monitor,
  Switch,
  Refresh,
  Download,
  Upload,
  Tools,
  Delete,
  DeleteFilled
} from '@element-plus/icons-vue'

import apiManager from '@/services/apiManager'
import dataSyncService from '@/services/dataSync'
import localStorageManager from '@/services/localStorageManager'

// 响应式数据
const fileInput = ref()
const showAdvancedOptions = ref(false)

// 迁移表单数据
const migrationForm = reactive({
  mode: 'hybrid',
  autoSync: true,
  conflictResolution: 'ask',
})

// 本地数据统计
const localStats = ref({
  novels: 0,
  chapters: 0,
  memories: 0,
})

// 同步状态
const syncStatus = ref({
  issyncing: false,
  lastSyncTime: null,
  pendingSync: 0,
  conflictResolution: 'ask',
  isOnline: navigator.onLine
})

// 计算属性
const getStatusType = () => {
  if (migrationForm.mode === 'local') return 'info'
  if (!syncStatus.value.isOnline) return 'warning'
  if (syncStatus.value.pendingSync > 0) return 'warning'
  return 'success'
}

const getStatusText = () => {
  if (migrationForm.mode === 'local') return '本地模式'
  if (!syncStatus.value.isOnline) return '离线状态'
  if (syncStatus.value.pendingSync > 0) return `${syncStatus.value.pendingSync}项待同步`
  return '数据已同步'
}

// 定时器
let statusUpdateTimer = null

// 方法
const updateStats = () => {
  const stats = localStorageManager.getStats()
  localStats.value = {
    novels: stats.novels,
    chapters: stats.chapters,
    memories: stats.memories,
  }
}

const updateSyncStatus = () => {
  const status = dataSyncService.getSyncStatus()
  syncStatus.value = {
    ...status,
    isOnline: navigator.onLine
  }
}

const formatSyncTime = (time) => {
  if (!time) return '从未同步'
  return new Date(time).toLocaleString('zh-CN')
}

const getConflictResolutionText = (resolution) => {
  const textMap = {
    ask: '询问用户',
    local: '优先本地',
    cloud: '优先云端'
  }
  return textMap[resolution] || resolution
}

const handleModeChange = (mode) => {
  apiManager.setMode(mode)
  
  if (mode !== 'local') {
    dataSyncService.setConflictResolution(migrationForm.conflictResolution)
  }
  
  ElMessage.success(`已切换到${mode === 'cloud' ? '云端' : mode === 'local' ? '本地' : '混合'}模式`)
}

const handleManualSync = async () => {
  try {
    await dataSyncService.manualSync()
    updateSyncStatus()
  } catch (error) {
    console.error('手动同步失败:', error)
  }
}

const handleExportData = async () => {
  try {
    await dataSyncService.exportData()
  } catch (error) {
    console.error('导出数据失败:', error)
  }
}

const handleImportData = () => {
  fileInput.value.click()
}

const handleFileSelected = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  try {
    await dataSyncService.importData(file)
    updateStats()
    updateSyncStatus()
  } catch (error) {
    console.error('导入数据失败:', error)
  } finally {
    // 清空文件选择
    event.target.value = ''
  }
}

const handleResetSync = async () => {
  try {
    const confirmed = await ElMessageBox.confirm(
      '这将重置所有同步状态和待同步项，确定要继续吗？',
      '重置同步状态',
      {
        confirmButtonText: '确定重置',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    if (confirmed) {
      dataSyncService.resetSync()
      updateSyncStatus()
    }
  } catch (error) {
    // 用户取消
  }
}

const handleClearLocalData = async () => {
  try {
    const confirmed = await ElMessageBox.confirm(
      '这将清空所有本地数据，包括小说、章节、记忆等，此操作不可恢复！确定要继续吗？',
      '清空本地数据',
      {
        confirmButtonText: '确定清空',
        cancelButtonText: '取消',
        type: 'error',
      }
    )
    
    if (confirmed) {
      localStorageManager.clearAllData()
      updateStats()
      updateSyncStatus()
      ElMessage.success('本地数据已清空')
    }
  } catch (error) {
    // 用户取消
  }
}

// 生命周期
onMounted(() => {
  // 初始化表单数据
  migrationForm.mode = apiManager.getMode()
  const syncStatusData = dataSyncService.getSyncStatus()
  migrationForm.conflictResolution = syncStatusData.conflictResolution
  
  // 更新统计信息
  updateStats()
  updateSyncStatus()
  
  // 设置定时更新
  statusUpdateTimer = setInterval(() => {
    updateSyncStatus()
  }, 5000) // 每5秒更新一次状态
  
  // 监听在线状态变化
  window.addEventListener('online', updateSyncStatus)
  window.addEventListener('offline', updateSyncStatus)
})

onUnmounted(() => {
  if (statusUpdateTimer) {
    clearInterval(statusUpdateTimer)
  }
  
  window.removeEventListener('online', updateSyncStatus)
  window.removeEventListener('offline', updateSyncStatus)
})
</script>

<style scoped>
.data-migration {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.migration-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  color: #303133;
}

.migration-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.mode-alert {
  margin-bottom: 0;
}

.mode-alert ul {
  margin: 12px 0 0 0;
  padding-left: 20px;
}

.mode-alert li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.migration-form {
  background: #fafafa;
  padding: 20px;
  border-radius: 8px;
}

.data-status,
.sync-status {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.data-status h4,
.sync-status h4,
.migration-actions h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-weight: 500;
}

.sync-info {
  margin-top: 16px;
}

.migration-actions {
  background: #fff;
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.advanced-options {
  margin-top: 16px;
  padding: 16px;
  background: #fef0f0;
  border-radius: 8px;
  border: 1px solid #fbc4c4;
}

.warning-text {
  margin-top: 12px;
}

/* Element Plus组件样式调整 */
:deep(.el-radio) {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  margin-right: 0;
  width: 100%;
}

:deep(.el-radio__label) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-statistic__head) {
  color: #606266;
  font-size: 14px;
}

:deep(.el-statistic__content) {
  color: #303133;
  font-weight: 600;
}

:deep(.el-button-group .el-button) {
  margin-right: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .data-migration {
    padding: 12px;
  }
  
  .migration-form {
    padding: 16px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  :deep(.el-descriptions) {
    font-size: 14px;
  }
  
  :deep(.el-col) {
    margin-bottom: 16px;
  }
}
</style>
