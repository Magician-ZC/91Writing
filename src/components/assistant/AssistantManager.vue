<template>
  <div class="assistant-manager">
    <!-- 浮动助手按钮 -->
    <el-button
      v-if="!isVisible"
      class="assistant-float-button"
      type="primary"
      circle
      size="large"
      @click="showAssistant"
    >
      <el-icon><Robot /></el-icon>
    </el-button>

    <!-- 助手面板 -->
    <el-drawer
      v-model="isVisible"
      :title="drawerTitle"
      direction="rtl"
      :size="drawerSize"
      :before-close="handleClose"
      class="assistant-drawer"
    >
      <template #header="{ titleId, titleClass }">
        <div class="drawer-header">
          <h4 :id="titleId" :class="titleClass">
            <el-icon><Robot /></el-icon>
            {{ drawerTitle }}
          </h4>
          <div class="header-controls">
            <el-button
              size="small"
              text
              @click="toggleSize"
              :title="isLargeSize ? '缩小' : '放大'"
            >
              <el-icon>
                <component :is="isLargeSize ? 'Minus' : 'Plus'" />
              </el-icon>
            </el-button>
            <el-button
              size="small"
              text
              @click="togglePin"
              :title="isPinned ? '取消固定' : '固定面板'"
            >
              <el-icon>
                <component :is="isPinned ? 'Unlock' : 'Lock'" />
              </el-icon>
            </el-button>
          </div>
        </div>
      </template>

      <AIWritingAssistant
        :height="assistantHeight"
        :context="assistantContext"
        @action-executed="handleAssistantAction"
        @context-changed="handleContextChange"
        ref="assistantRef"
      />
    </el-drawer>

    <!-- 快速操作悬浮球 -->
    <div
      v-if="isVisible && showQuickActions"
      class="quick-actions-float"
      :class="{ pinned: isPinned }"
    >
      <el-button-group direction="vertical">
        <el-button
          size="small"
          circle
          @click="quickContinueWriting"
          title="续写"
        >
          ✏️
        </el-button>
        <el-button
          size="small"
          circle
          @click="quickAnalyze"
          title="分析"
        >
          📊
        </el-button>
        <el-button
          size="small"
          circle
          @click="quickOptimize"
          title="优化"
        >
          ✨
        </el-button>
        <el-button
          size="small"
          circle
          @click="quickHelp"
          title="帮助"
        >
          ❓
        </el-button>
      </el-button-group>
    </div>

    <!-- 助手状态指示器 -->
    <div
      v-if="assistantStatus && !isVisible"
      class="assistant-status-indicator"
      @click="showAssistant"
    >
      <div class="status-dot" :class="assistantStatus.type"></div>
      <span class="status-text">{{ assistantStatus.text }}</span>
    </div>

    <!-- 智能提醒通知 -->
    <el-notification
      v-for="notification in activeNotifications"
      :key="notification.id"
      :title="notification.title"
      :message="notification.message"
      :type="notification.type"
      :duration="notification.duration"
      :position="notification.position"
      @close="dismissNotification(notification.id)"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import { Robot, Plus, Minus, Lock, Unlock } from '@element-plus/icons-vue'
import AIWritingAssistant from './AIWritingAssistant.vue'
import { useNovelStore } from '@/stores/novel.js'
import { useMemoryStore } from '@/stores/memoryStore.js'

// Props
const props = defineProps({
  autoShow: {
    type: Boolean,
    default: false
  },
  enableSmartReminders: {
    type: Boolean,
    default: true
  },
  enableQuickActions: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['assistant-action', 'visibility-changed'])

// Stores
const novelStore = useNovelStore()
const memoryStore = useMemoryStore()

// 响应式数据
const isVisible = ref(false)
const isPinned = ref(false)
const isLargeSize = ref(false)
const assistantRef = ref(null)
const assistantStatus = ref(null)
const activeNotifications = ref([])
const lastActivityTime = ref(Date.now())
const inactivityTimer = ref(null)

// 计算属性
const drawerSize = computed(() => {
  return isLargeSize.value ? '60%' : '450px'
})

const drawerTitle = computed(() => {
  if (assistantStatus.value) {
    return `AI写作助手 - ${assistantStatus.value.text}`
  }
  return 'AI写作助手'
})

const assistantHeight = computed(() => {
  return isLargeSize.value ? 700 : 600
})

const showQuickActions = computed(() => {
  return props.enableQuickActions && !isPinned.value
})

const assistantContext = computed(() => {
  return {
    novel: novelStore.currentNovel,
    currentChapter: novelStore.currentChapter,
    selectedText: getSelectedText(),
    recentContent: getRecentContent(),
    writingGoals: novelStore.writingGoals,
    userPreferences: getUserPreferences()
  }
})

// 生命周期
onMounted(() => {
  initializeAssistant()
  setupActivityTracking()
  setupSmartReminders()
  
  if (props.autoShow) {
    setTimeout(() => {
      showAssistant()
    }, 1000)
  }
})

onUnmounted(() => {
  cleanup()
})

// 监听器
watch(() => isVisible.value, (visible) => {
  emit('visibility-changed', visible)
  
  if (visible) {
    updateAssistantContext()
  }
})

watch(() => novelStore.currentNovel, () => {
  updateAssistantContext()
})

// 方法
const initializeAssistant = () => {
  // 恢复用户偏好设置
  const savedSettings = loadAssistantSettings()
  isPinned.value = savedSettings.isPinned || false
  isLargeSize.value = savedSettings.isLargeSize || false
  
  // 检查是否需要显示欢迎提示
  if (savedSettings.isFirstTime !== false) {
    showWelcomeNotification()
    saveAssistantSettings({ ...savedSettings, isFirstTime: false })
  }
}

const showAssistant = () => {
  isVisible.value = true
  updateActivity()
}

const hideAssistant = () => {
  if (!isPinned.value) {
    isVisible.value = false
  }
}

const handleClose = (done) => {
  if (isPinned.value) {
    ElMessage.warning('面板已固定，请先取消固定再关闭')
    return
  }
  done()
}

const toggleSize = () => {
  isLargeSize.value = !isLargeSize.value
  saveAssistantSettings({ isLargeSize: isLargeSize.value })
  ElMessage.success(isLargeSize.value ? '已放大面板' : '已缩小面板')
}

const togglePin = () => {
  isPinned.value = !isPinned.value
  saveAssistantSettings({ isPinned: isPinned.value })
  ElMessage.success(isPinned.value ? '面板已固定' : '面板已取消固定')
}

const updateActivity = () => {
  lastActivityTime.value = Date.now()
  
  // 重置非活跃计时器
  if (inactivityTimer.value) {
    clearTimeout(inactivityTimer.value)
  }
  
  inactivityTimer.value = setTimeout(() => {
    handleInactivity()
  }, 5 * 60 * 1000) // 5分钟无活动
}

const handleInactivity = () => {
  if (!isPinned.value && isVisible.value) {
    showInactivityReminder()
  }
}

const updateAssistantContext = () => {
  // 更新助手上下文信息
  const context = assistantContext.value
  
  if (assistantRef.value) {
    assistantRef.value.setContext(context)
  }
}

const handleAssistantAction = (action) => {
  updateActivity()
  
  switch (action.type) {
    case 'insert_text':
      insertTextToEditor(action.content)
      break
    case 'show_suggestions':
      showSuggestionsPanel(action.suggestions)
      break
    case 'show_revisions':
      showRevisionsPanel(action.revisions)
      break
    case 'show_analysis':
      showAnalysisPanel(action.analysis)
      break
    default:
      emit('assistant-action', action)
  }
}

const handleContextChange = (newContext) => {
  // 处理上下文变化
  emit('assistant-action', {
    type: 'context_changed',
    context: newContext
  })
}

// 快速操作方法
const quickContinueWriting = () => {
  const currentContent = getCurrentEditorContent()
  if (currentContent) {
    assistantRef.value?.sendMessage('请帮我续写当前内容，保持风格一致')
  } else {
    ElMessage.warning('请先在编辑器中输入一些内容')
  }
  updateActivity()
}

const quickAnalyze = () => {
  const selectedText = getSelectedText()
  if (selectedText) {
    assistantRef.value?.sendMessage('请分析选中的文本，给出详细的质量评估')
  } else {
    assistantRef.value?.sendMessage('请分析当前章节的写作质量')
  }
  updateActivity()
}

const quickOptimize = () => {
  const selectedText = getSelectedText()
  if (selectedText) {
    assistantRef.value?.sendMessage('请优化选中的文本，提升表达效果')
  } else {
    ElMessage.warning('请先选中需要优化的文本')
  }
  updateActivity()
}

const quickHelp = () => {
  assistantRef.value?.sendMessage('我在写作过程中遇到了困难，请给我一些建议')
  updateActivity()
}

// 智能提醒系统
const setupSmartReminders = () => {
  if (!props.enableSmartReminders) return
  
  // 写作进度提醒
  setInterval(() => {
    checkWritingProgress()
  }, 10 * 60 * 1000) // 每10分钟检查一次
  
  // 内容质量提醒
  setInterval(() => {
    checkContentQuality()
  }, 15 * 60 * 1000) // 每15分钟检查一次
}

const checkWritingProgress = () => {
  const novel = novelStore.currentNovel
  if (!novel) return
  
  const wordsToday = getWordsWrittenToday()
  const targetWords = novel.dailyWordTarget || 500
  
  if (wordsToday === 0 && isWritingTime()) {
    showNotification({
      title: '写作提醒',
      message: '今天还没有开始写作呢，要不要写几句？',
      type: 'info',
      duration: 8000,
      actions: ['start_writing']
    })
  } else if (wordsToday >= targetWords) {
    showNotification({
      title: '恭喜！',
      message: `今天已完成 ${wordsToday} 字，达成了目标！`,
      type: 'success',
      duration: 6000
    })
  }
}

const checkContentQuality = () => {
  const recentContent = getRecentContent()
  if (!recentContent || recentContent.length < 100) return
  
  // 简单的质量检查
  const issues = detectSimpleIssues(recentContent)
  if (issues.length > 0) {
    showNotification({
      title: '写作建议',
      message: `检测到 ${issues.length} 个可以改进的地方，需要AI助手帮助吗？`,
      type: 'warning',
      duration: 10000,
      actions: ['show_assistant', 'ignore']
    })
  }
}

const showNotification = (options) => {
  const notification = {
    id: Date.now(),
    title: options.title,
    message: options.message,
    type: options.type || 'info',
    duration: options.duration || 6000,
    position: 'bottom-right',
    actions: options.actions || []
  }
  
  activeNotifications.value.push(notification)
  
  // 自动移除通知
  setTimeout(() => {
    dismissNotification(notification.id)
  }, notification.duration)
}

const dismissNotification = (id) => {
  const index = activeNotifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    activeNotifications.value.splice(index, 1)
  }
}

const showWelcomeNotification = () => {
  showNotification({
    title: '欢迎使用AI写作助手！',
    message: '我可以帮助您创作、修改和优化文本。点击右下角按钮开始对话。',
    type: 'success',
    duration: 10000
  })
}

const showInactivityReminder = () => {
  showNotification({
    title: '继续写作吧！',
    message: '已经5分钟没有活动了，需要AI助手的帮助吗？',
    type: 'info',
    duration: 8000,
    actions: ['continue_writing', 'get_inspiration']
  })
}

// 活动追踪
const setupActivityTracking = () => {
  // 监听键盘和鼠标活动
  const events = ['keydown', 'mousedown', 'scroll']
  
  events.forEach(event => {
    document.addEventListener(event, updateActivity, { passive: true })
  })
}

const cleanup = () => {
  if (inactivityTimer.value) {
    clearTimeout(inactivityTimer.value)
  }
  
  // 清理事件监听器
  const events = ['keydown', 'mousedown', 'scroll']
  events.forEach(event => {
    document.removeEventListener(event, updateActivity)
  })
}

// 工具方法
const getSelectedText = () => {
  const selection = window.getSelection()
  return selection ? selection.toString().trim() : ''
}

const getCurrentEditorContent = () => {
  // 这里应该从编辑器获取当前内容
  // 具体实现取决于编辑器组件的API
  return novelStore.currentChapter?.content || ''
}

const getRecentContent = () => {
  const content = getCurrentEditorContent()
  // 返回最近500字的内容
  return content.length > 500 ? content.slice(-500) : content
}

const getUserPreferences = () => {
  return {
    writingStyle: 'balanced',
    formalityLevel: 'medium',
    creativityLevel: 'high'
  }
}

const getWordsWrittenToday = () => {
  // 计算今天写的字数
  const today = new Date().toDateString()
  const history = novelStore.currentNovel?.writingHistory || []
  
  return history
    .filter(entry => new Date(entry.date).toDateString() === today)
    .reduce((total, entry) => total + (entry.wordCount || 0), 0)
}

const isWritingTime = () => {
  const hour = new Date().getHours()
  return hour >= 9 && hour <= 22 // 9AM - 10PM
}

const detectSimpleIssues = (content) => {
  const issues = []
  
  // 检查重复词汇
  const words = content.match(/[\u4e00-\u9fa5]{2,}/g) || []
  const wordCount = {}
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1
  })
  
  const repeatedWords = Object.entries(wordCount)
    .filter(([word, count]) => count > 3 && word.length > 2)
  
  if (repeatedWords.length > 0) {
    issues.push('重复词汇')
  }
  
  // 检查句子长度
  const sentences = content.split(/[。！？]/).filter(s => s.trim().length > 0)
  const longSentences = sentences.filter(s => s.length > 50)
  
  if (longSentences.length > sentences.length * 0.3) {
    issues.push('句子过长')
  }
  
  return issues
}

const insertTextToEditor = (text) => {
  // 这里应该调用编辑器的插入文本方法
  console.log('插入文本:', text)
  emit('assistant-action', {
    type: 'insert_text',
    content: text
  })
}

const showSuggestionsPanel = (suggestions) => {
  emit('assistant-action', {
    type: 'show_suggestions',
    suggestions
  })
}

const showRevisionsPanel = (revisions) => {
  emit('assistant-action', {
    type: 'show_revisions',
    revisions
  })
}

const showAnalysisPanel = (analysis) => {
  emit('assistant-action', {
    type: 'show_analysis',
    analysis
  })
}

const loadAssistantSettings = () => {
  try {
    const saved = localStorage.getItem('assistantSettings')
    return saved ? JSON.parse(saved) : {}
  } catch (error) {
    console.error('加载助手设置失败:', error)
    return {}
  }
}

const saveAssistantSettings = (settings) => {
  try {
    const current = loadAssistantSettings()
    const updated = { ...current, ...settings }
    localStorage.setItem('assistantSettings', JSON.stringify(updated))
  } catch (error) {
    console.error('保存助手设置失败:', error)
  }
}

// 暴露方法供父组件调用
defineExpose({
  show: showAssistant,
  hide: hideAssistant,
  toggle: () => isVisible.value ? hideAssistant() : showAssistant(),
  sendMessage: (message) => assistantRef.value?.sendMessage(message),
  isVisible: () => isVisible.value
})
</script>

<style scoped>
.assistant-manager {
  position: relative;
}

/* 浮动助手按钮 */
.assistant-float-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 56px;
  height: 56px;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.3);
  z-index: 1000;
  transition: all 0.3s ease;
}

.assistant-float-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
}

/* 助手抽屉 */
.assistant-drawer {
  z-index: 2000;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.drawer-header h4 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2c3e50;
}

.header-controls {
  display: flex;
  gap: 8px;
}

/* 快速操作悬浮球 */
.quick-actions-float {
  position: fixed;
  bottom: 20px;
  right: 490px; /* 抽屉宽度 + 间距 */
  z-index: 1999;
  transition: all 0.3s ease;
}

.quick-actions-float.pinned {
  right: 520px; /* 固定时稍微远一点 */
}

.quick-actions-float .el-button-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-actions-float .el-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: white;
  border: 1px solid #e4e7ed;
}

.quick-actions-float .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 状态指示器 */
.assistant-status-indicator {
  position: fixed;
  bottom: 80px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 999;
}

.assistant-status-indicator:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-dot.thinking {
  background: #e6a23c;
}

.status-dot.ready {
  background: #67c23a;
}

.status-dot.busy {
  background: #f56c6c;
}

.status-text {
  font-size: 12px;
  color: #606266;
  white-space: nowrap;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .assistant-float-button {
    bottom: 16px;
    right: 16px;
    width: 48px;
    height: 48px;
  }
  
  .quick-actions-float {
    right: 16px;
    bottom: 80px;
  }
  
  .quick-actions-float.pinned {
    right: 16px;
  }
  
  .quick-actions-float .el-button {
    width: 36px;
    height: 36px;
  }
  
  .assistant-status-indicator {
    bottom: 70px;
    right: 16px;
    padding: 6px 10px;
  }
  
  .status-text {
    font-size: 11px;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .assistant-status-indicator {
    background: #2c3e50;
    color: white;
  }
  
  .quick-actions-float .el-button {
    background: #2c3e50;
    border-color: #4a5568;
    color: white;
  }
}
</style>
