<template>
  <div class="background-task-panel">
    <!-- 浮动按钮 -->
    <el-badge :value="stats.running" :hidden="stats.running === 0" class="task-badge">
      <el-button
        circle
        type="primary"
        @click="togglePanel"
        class="task-button"
        :class="{ 'has-tasks': stats.running > 0 }"
      >
        <el-icon :class="{ 'rotating': stats.running > 0 }">
          <component :is="stats.running > 0 ? Loading : List" />
        </el-icon>
      </el-button>
    </el-badge>

    <!-- 任务面板 -->
    <el-drawer
      v-model="panelVisible"
      title="后台任务"
      direction="rtl"
      size="400px"
    >
      <!-- 统计信息 -->
      <div class="task-stats">
        <el-tag type="info">总计: {{ stats.total }}</el-tag>
        <el-tag type="warning" v-if="stats.running > 0">
          运行中: {{ stats.running }}
        </el-tag>
        <el-tag type="success" v-if="stats.completed > 0">
          已完成: {{ stats.completed }}
        </el-tag>
        <el-tag type="danger" v-if="stats.failed > 0">
          失败: {{ stats.failed }}
        </el-tag>
      </div>

      <!-- 操作按钮 -->
      <div class="task-actions">
        <el-button size="small" @click="refreshTasks">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button size="small" @click="cleanupTasks">
          <el-icon><Delete /></el-icon>
          清理完成
        </el-button>
      </div>

      <!-- 任务列表 -->
      <div class="task-list">
        <div
          v-for="task in tasks"
          :key="task.id"
          class="task-item"
          :class="`task-${task.status}`"
        >
          <div class="task-header">
            <div class="task-info">
              <el-icon class="task-icon">
                <component :is="getTaskIcon(task.status)" />
              </el-icon>
              <span class="task-name">{{ task.name }}</span>
            </div>
            <el-tag :type="getTaskTagType(task.status)" size="small">
              {{ getTaskStatusText(task.status) }}
            </el-tag>
          </div>

          <!-- 进度条 -->
          <el-progress
            v-if="task.status === 'running'"
            :percentage="task.progress"
            :status="task.progress === 100 ? 'success' : undefined"
          />

          <!-- 流式输出内容预览 -->
          <div 
            v-if="task.streamContent && (task.status === 'running' || task.status === 'completed')"
            class="stream-content"
          >
            <div class="stream-header">
              <span class="stream-title">生成内容</span>
              <el-button
                text
                size="small"
                @click="toggleStreamExpand(task.id)"
              >
                {{ expandedTasks.has(task.id) ? '收起' : '展开' }}
              </el-button>
            </div>
            <div 
              class="stream-text"
              :class="{ expanded: expandedTasks.has(task.id) }"
            >
              {{ task.streamContent }}
              <span v-if="task.status === 'running'" class="typing-cursor">▊</span>
            </div>
            <div class="stream-stats">
              已生成 {{ task.streamContent.length }} 字
            </div>
          </div>

          <!-- 时间信息 -->
          <div class="task-time">
            <span>{{ formatTime(task.createdAt) }}</span>
            <span v-if="task.completedAt">
              - 用时 {{ calculateDuration(task.createdAt, task.completedAt) }}
            </span>
          </div>

          <!-- 错误信息 -->
          <div v-if="task.status === 'failed'" class="task-error">
            <el-alert
              :title="task.error"
              type="error"
              :closable="false"
              show-icon
            />
          </div>

          <!-- 操作按钮 -->
          <div class="task-operations">
            <el-button
              v-if="task.status === 'running' || task.status === 'pending'"
              size="small"
              type="danger"
              @click="cancelTask(task.id)"
            >
              取消
            </el-button>
            <el-button
              v-if="task.status === 'completed' && (task.result || task.streamContent)"
              size="small"
              type="primary"
              @click="viewResult(task)"
            >
              查看结果
            </el-button>
          </div>
        </div>

        <!-- 空状态 -->
        <el-empty
          v-if="tasks.length === 0"
          description="暂无任务"
          :image-size="100"
        />
      </div>
    </el-drawer>

    <!-- 结果查看对话框 -->
    <el-dialog
      v-model="resultDialogVisible"
      :title="currentResult?.taskName || '查看结果'"
      width="80%"
      top="5vh"
      destroy-on-close
    >
      <div class="result-viewer">
        <div class="result-header">
          <el-tag type="success">已完成</el-tag>
          <span class="ml-2">{{ currentResult?.completedTime }}</span>
          <span class="ml-2 text-gray-500">字数: {{ currentResult?.content?.length || 0 }}</span>
        </div>
        
        <div class="result-content">
          <pre class="result-text">{{ currentResult?.content }}</pre>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="copyResultContent">
          <el-icon><CopyDocument /></el-icon>
          复制内容
        </el-button>
        <el-button type="primary" @click="resultDialogVisible = false">
          关闭
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  Loading,
  List,
  Refresh,
  Delete,
  Clock,
  Check,
  Close,
  WarningFilled
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { backgroundTaskService } from '@/services/backgroundTaskService'

const panelVisible = ref(false)
const tasks = ref([])
const refreshInterval = ref(null)
const expandedTasks = ref(new Set()) // 展开的任务ID集合
const resultDialogVisible = ref(false) // 结果查看对话框
const currentResult = ref(null) // 当前查看的结果

// 统计信息
const stats = computed(() => backgroundTaskService.getStatistics())

// 切换面板显示
const togglePanel = () => {
  panelVisible.value = !panelVisible.value
}

// 刷新任务列表
const refreshTasks = () => {
  tasks.value = backgroundTaskService.getAllTasks()
}

// 清理已完成任务
const cleanupTasks = () => {
  backgroundTaskService.cleanupCompletedTasks(0) // 立即清理
  refreshTasks()
  ElMessage.success('已清理完成的任务')
}

// 取消任务
const cancelTask = (taskId) => {
  backgroundTaskService.cancelTask(taskId)
  refreshTasks()
}

// 查看任务结果
const viewResult = (task) => {
  currentResult.value = {
    taskName: task.name,
    completedTime: formatTime(task.completedAt),
    content: task.streamContent || JSON.stringify(task.result, null, 2)
  }
  resultDialogVisible.value = true
}

// 复制结果内容
const copyResultContent = async () => {
  try {
    await navigator.clipboard.writeText(currentResult.value.content)
    ElMessage.success('内容已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 切换流式内容展开/收起
const toggleStreamExpand = (taskId) => {
  if (expandedTasks.value.has(taskId)) {
    expandedTasks.value.delete(taskId)
  } else {
    expandedTasks.value.add(taskId)
  }
  // 触发响应式更新
  expandedTasks.value = new Set(expandedTasks.value)
}

// 获取任务图标
const getTaskIcon = (status) => {
  const iconMap = {
    pending: Clock,
    running: Loading,
    completed: Check,
    failed: Close,
    cancelled: WarningFilled
  }
  return iconMap[status] || Clock
}

// 获取任务标签类型
const getTaskTagType = (status) => {
  const typeMap = {
    pending: 'info',
    running: 'warning',
    completed: 'success',
    failed: 'danger',
    cancelled: 'info'
  }
  return typeMap[status] || 'info'
}

// 获取任务状态文本
const getTaskStatusText = (status) => {
  const textMap = {
    pending: '等待中',
    running: '运行中',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消'
  }
  return textMap[status] || '未知'
}

// 格式化时间
const formatTime = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
}

// 计算持续时间
const calculateDuration = (start, end) => {
  if (!start || !end) return ''
  const duration = new Date(end) - new Date(start)
  const seconds = Math.floor(duration / 1000)
  if (seconds < 60) return `${seconds}秒`
  const minutes = Math.floor(seconds / 60)
  return `${minutes}分${seconds % 60}秒`
}

// 生命周期
onMounted(() => {
  refreshTasks()
  // 每500ms刷新一次任务列表（更实时）
  refreshInterval.value = setInterval(refreshTasks, 500)
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})
</script>

<style scoped>
.background-task-panel {
  position: fixed;
  bottom: 80px;
  right: 20px;
  z-index: 1000;
}

.task-badge {
  display: block;
}

.task-button {
  width: 56px;
  height: 56px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
}

.task-button:hover {
  transform: scale(1.1);
}

.task-button.has-tasks {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  }
  50% {
    box-shadow: 0 2px 20px rgba(64, 158, 255, 0.5);
  }
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.task-stats {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.task-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #ddd;
  transition: all 0.3s;
}

.task-item:hover {
  background: #f0f2f5;
}

.task-item.task-running {
  border-left-color: #409eff;
  background: #ecf5ff;
}

.task-item.task-completed {
  border-left-color: #67c23a;
}

.task-item.task-failed {
  border-left-color: #f56c6c;
  background: #fef0f0;
}

.task-item.task-cancelled {
  border-left-color: #909399;
  opacity: 0.7;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.task-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-icon {
  font-size: 18px;
}

.task-name {
  font-weight: 500;
  color: #2c3e50;
}

.task-time {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.task-error {
  margin-top: 8px;
}

.task-operations {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.stream-content {
  margin-top: 12px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.stream-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.stream-title {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
}

.stream-text {
  font-size: 13px;
  line-height: 1.8;
  color: #303133;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 120px;
  overflow: hidden;
  position: relative;
  transition: max-height 0.3s;
}

.stream-text.expanded {
  max-height: none;
}

.stream-text:not(.expanded)::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(transparent, white);
}

.typing-cursor {
  display: inline-block;
  animation: blink 1s infinite;
  color: #409eff;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.stream-stats {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.result-viewer {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 70vh;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.result-content {
  flex: 1;
  overflow-y: auto;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.result-text {
  margin: 0;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 14px;
  line-height: 1.8;
  color: #2c3e50;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>

