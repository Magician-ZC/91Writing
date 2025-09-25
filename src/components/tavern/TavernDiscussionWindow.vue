<template>
  <el-dialog
    v-model="isVisible"
    title="酒馆讨论"
    :width="'80%'"
    :before-close="handleClose"
    class="tavern-discussion-dialog"
    append-to-body
    :z-index="3000"
    :modal="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <div class="discussion-window">
      <!-- Tab 切换 -->
      <el-tabs 
        v-model="activeTab" 
        type="card" 
        @tab-click="handleTabClick"
        class="discussion-tabs"
        @update:model-value="onTabChange"
      >
        <el-tab-pane 
          v-for="discussion in discussions" 
          :key="discussion.id"
          :name="discussion.id"
          :label="discussion.topic"
        >
          <template #label>
            <span class="tab-label">
              <span class="tab-title">{{ discussion.topic }}</span>
              <el-tag 
                :type="getStatusTagType(discussion.status)"
                size="small"
                class="tab-status"
              >
                {{ getStatusText(discussion.status) }}
              </el-tag>
            </span>
          </template>
          
          <!-- 讨论内容 -->
          <div v-if="activeTab === discussion.id" class="discussion-content">
            <!-- 讨论信息头部 -->
            <div class="discussion-header">
              <div class="discussion-info">
                <h4>{{ discussion.topic }}</h4>
                <p v-if="discussion.context">{{ discussion.context }}</p>
                <div class="participants">
                  参与作者：
                  <el-tag 
                    v-for="author in discussion.authors" 
                    :key="author.id"
                    size="small"
                    class="author-tag"
                  >
                    {{ author.avatar }} {{ author.name }}
                  </el-tag>
                </div>
              </div>
              
              <!-- 控制按钮 -->
              <div class="discussion-controls">
                <el-button 
                  v-if="discussion.status === 'discussing'"
                  type="warning"
                  size="small"
                  @click="pauseDiscussion(discussion.id)"
                >
                  <el-icon><VideoPause /></el-icon>
                  暂停
                </el-button>
                <el-button 
                  v-if="discussion.status === 'paused'"
                  type="primary"
                  size="small"
                  @click="resumeDiscussion(discussion.id)"
                >
                  <el-icon><VideoPlay /></el-icon>
                  继续
                </el-button>
                <el-button 
                  v-if="['discussing', 'paused'].includes(discussion.status)"
                  type="danger"
                  size="small"
                  @click="endDiscussion(discussion.id)"
                >
                  <el-icon><CircleCloseFilled /></el-icon>
                  结束讨论
                </el-button>
              </div>
            </div>

            <!-- 进度条 -->
            <div class="discussion-progress" v-if="discussion.status !== 'completed'">
              <div class="progress-info">
                <span>第 {{ discussion.currentRound || 0 }} / {{ discussion.rounds }} 轮</span>
                <span v-if="discussion.status === 'discussing'">
                  讨论进行中...
                </span>
              </div>
              <el-progress 
                :percentage="getDiscussionProgress(discussion)" 
                :status="getProgressStatus(discussion.status)"
                :show-text="false"
              />
            </div>

            <!-- 消息列表 -->
            <div class="messages-container" ref="messagesContainer">
              <div 
                v-for="message in discussion.messages" 
                :key="`${message.authorId}-${message.timestamp}`"
                class="message-item"
              >
                <div class="message-header">
                  <div class="message-author">
                    <span class="author-avatar">{{ getAuthorAvatar(message.authorId, discussion.authors) }}</span>
                    <span class="author-name">{{ message.authorName }}</span>
                    <el-tag size="small" type="info">第{{ message.round }}轮</el-tag>
                  </div>
                  <div class="message-time">{{ formatTime(message.timestamp) }}</div>
                </div>
                <div class="message-content">{{ 
                  typeof message.content === 'object' 
                    ? JSON.stringify(message.content, null, 2) 
                    : message.content 
                }}</div>
              </div>
              
              <!-- 无消息状态 -->
              <div v-if="discussion.messages.length === 0" class="empty-messages">
                <el-icon><ChatDotRound /></el-icon>
                <p v-if="discussion.status === 'starting'">讨论即将开始...</p>
                <p v-else-if="discussion.status === 'discussing'">作者们正在热烈讨论中...</p>
                <p v-else>等待讨论内容...</p>
              </div>
            </div>

            <!-- 投票阶段 -->
            <div v-if="discussion.status === 'voting'" class="voting-section">
              <h5>
                <el-icon><Select /></el-icon>
                投票进行中
              </h5>
              <p>作者们正在对讨论方案进行投票...</p>
              <el-progress :percentage="getVotingProgress(discussion)" />
            </div>

            <!-- 结果展示 -->
            <TavernVotingResults 
              v-if="discussion.status === 'completed' && discussion.results"
              :results="discussion.results"
              :topic="discussion.topic"
              @select-proposal="handleSelectProposal"
            />
            
            <!-- 已完成讨论的提示 -->
            <div v-if="discussion.status === 'completed' && !discussion.results" class="completion-notice">
              <el-icon><CircleCheckFilled /></el-icon>
              <h5>讨论已完成</h5>
              <p>此讨论已圆满结束，请查看上方的讨论内容和投票结果</p>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
      
          <!-- 空状态 -->
          <div v-if="discussions.length === 0" class="empty-discussions">
            <el-icon><ChatLineRound /></el-icon>
            <h3>暂无进行中的讨论</h3>
            <p>当前没有活跃的酒馆讨论，请先启动一个讨论</p>
            <el-button type="primary" @click="handleClose">
              关闭窗口
            </el-button>
          </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <div class="footer-info">
          共 {{ discussions.length }} 个讨论进行中
          <!-- 调试按钮 -->
          <div v-if="discussions.length > 1" style="margin-left: 10px; display: inline-block;">
            <el-button 
              v-for="(discussion, index) in discussions" 
              :key="discussion.id"
              size="small"
              :type="activeTab === discussion.id ? 'primary' : 'default'"
              @click="switchToTab(discussion.id)"
              style="margin-left: 5px;"
            >
              切换到{{ index + 1 }}
            </el-button>
          </div>
        </div>
        <el-button @click="handleClose">关闭窗口</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { 
  VideoPause, 
  VideoPlay, 
  CircleCloseFilled, 
  ChatDotRound, 
  ChatLineRound,
  Select,
  CircleCheckFilled
} from '@element-plus/icons-vue'
import TavernVotingResults from './TavernVotingResults.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  discussions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'update:modelValue',
  'pause-discussion',
  'resume-discussion', 
  'end-discussion',
  'close',
  'select-proposal'
])

const isVisible = ref(props.modelValue)
const activeTab = ref('')
const messagesContainer = ref(null)
let updateTimer = null

// 安全访问 localStorage 的计算属性
const localStorageDiscussions = computed(() => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem('tavernDiscussions')
  }
  return null
})

const localStorageHistory = computed(() => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem('tavernHistory')
  }
  return null
})

const localStorageDiscussionsPreview = computed(() => {
  const data = localStorageDiscussions.value
  return data ? data.substring(0, 200) : '无数据'
})

const localStorageHistoryPreview = computed(() => {
  const data = localStorageHistory.value
  return data ? data.substring(0, 200) : '无数据'
})

// 监听 activeTab 变化
watch(activeTab, (newTab, oldTab) => {
  console.log('activeTab 变化:', { 
    oldTab, 
    newTab, 
    discussionCount: props.discussions.length,
    discussionIds: props.discussions.map(d => d.id)
  })
}, { immediate: true })

// 监听显示状态 - 修复对话框不显示的问题
watch(() => props.modelValue, (newVal) => {
  console.log('🪟 TavernDiscussionWindow 对话框', newVal ? '打开' : '关闭')
  console.log('📊 当前讨论数量:', props.discussions.length)
  
  // 强制更新显示状态
  isVisible.value = newVal
  
  if (newVal) {
    // 确保有讨论数据时自动选择第一个tab
    if (props.discussions.length > 0) {
      const firstDiscussion = props.discussions[0]
      if (firstDiscussion && firstDiscussion.id && activeTab.value !== firstDiscussion.id) {
        activeTab.value = firstDiscussion.id
        console.log('✅ 对话框打开时设置活跃tab:', activeTab.value)
      }
    } else {
      console.log('⚠️ 对话框打开但没有讨论内容，等待讨论数据更新...')
    }
    // 开始定时更新
    startUpdateTimer()
  } else {
    // 停止定时更新
    stopUpdateTimer()
  }
}, { immediate: true })

watch(isVisible, (newVal) => {
  console.log('TavernDiscussionWindow isVisible 变化:', newVal)
  emit('update:modelValue', newVal)
  if (!newVal) {
    stopUpdateTimer()
  }
})

// 监听讨论列表变化 - 修复无限循环和响应式问题
watch(() => props.discussions, (newDiscussions, oldDiscussions) => {
  // 检查是否有新的消息或讨论变化
  let hasChanges = false
  
  if (newDiscussions?.length !== oldDiscussions?.length) {
    hasChanges = true
  } else if (newDiscussions && oldDiscussions) {
    // 检查消息数量是否发生变化
    for (let i = 0; i < newDiscussions.length; i++) {
      const newD = newDiscussions[i]
      const oldD = oldDiscussions[i]
      if (newD && oldD && newD.messages?.length !== oldD.messages?.length) {
        hasChanges = true
        console.log('💬 讨论', newD.id, '消息更新:', newD.messages?.length, '条消息')
        break
      }
    }
  }
  
  if (hasChanges && process.env.NODE_ENV === 'development') {
    console.log('🔄 TavernDiscussionWindow 讨论数据变化:', {
      newCount: newDiscussions?.length || 0,
      oldCount: oldDiscussions?.length || 0,
      currentTab: activeTab.value
    })
  }
  
  if (newDiscussions && newDiscussions.length > 0) {
    // 检查当前选中的标签是否仍然存在
    const currentTabExists = newDiscussions.some(d => d.id === activeTab.value)
    
    if (!activeTab.value || !currentTabExists) {
      // 如果没有选中标签或当前标签不存在，选择第一个
      const firstDiscussion = newDiscussions[0]
      if (firstDiscussion && firstDiscussion.id && activeTab.value !== firstDiscussion.id) {
        activeTab.value = firstDiscussion.id
        console.log('自动选择第一个讨论标签:', activeTab.value)
      }
    }
  } else {
    // 如果没有讨论，清空activeTab
    if (activeTab.value !== '') {
      activeTab.value = ''
    }
  }
  
  // 当有变化时立即滚动到最新消息
  if (hasChanges) {
    nextTick(() => {
      scrollToLatestMessage()
    })
  }
}, { immediate: true, deep: true })

// 定时更新机制 - 优化性能，现在主要用于滚动保障
function startUpdateTimer() {
  if (updateTimer) return
  
  // 简化定时器逻辑，主要用于保障滚动位置
  updateTimer = setInterval(() => {
    // 只在有消息时滚动
    if (document.querySelector('.messages-container') && props.discussions.length > 0) {
      scrollToLatestMessage()
    }
  }, 5000) // 进一步降低频率，因为现在有实时更新
}

function stopUpdateTimer() {
  if (updateTimer) {
    clearInterval(updateTimer)
    updateTimer = null
  }
}

// 滚动到最新消息 - 优化滚动逻辑
function scrollToLatestMessage() {
  const container = document.querySelector('.messages-container') || messagesContainer.value
  if (container) {
    container.scrollTop = container.scrollHeight
    if (process.env.NODE_ENV === 'development') {
      console.log('📜 滚动到最新消息，容器高度:', container.scrollHeight)
    }
  }
}

function handleClose() {
  isVisible.value = false
  emit('close')
}

function pauseDiscussion(discussionId) {
  emit('pause-discussion', discussionId)
}

function resumeDiscussion(discussionId) {
  emit('resume-discussion', discussionId)
}

function endDiscussion(discussionId) {
  emit('end-discussion', discussionId)
}

function handleSelectProposal(proposal) {
  console.log('用户选择了方案:', proposal)
  emit('select-proposal', proposal)
  // 选择方案后关闭窗口
  isVisible.value = false
}

function handleTabClick(tab) {
  // Element Plus tabs 的 tab-click 事件传递的参数格式可能不同
  const tabName = tab.props?.name || tab.name
  console.log('handleTabClick 被调用:', {
    tabName,
    tabObject: tab,
    currentActiveTab: activeTab.value,
    discussionsLength: props.discussions.length
  })
  
  if (tabName && tabName !== activeTab.value) {
    activeTab.value = tabName
    console.log('activeTab 已更新为:', activeTab.value)
    
    // 滚动到最新消息
    nextTick(() => {
      scrollToLatestMessage()
      console.log('滚动完成，当前 activeTab:', activeTab.value)
    })
  } else {
    console.log('标签页无需切换或 tabName 无效')
  }
}

function switchToTab(discussionId) {
  console.log('手动切换到标签页:', discussionId, '当前标签:', activeTab.value)
  
  if (discussionId && discussionId !== activeTab.value) {
    activeTab.value = discussionId
    console.log('手动切换完成，新标签:', activeTab.value)
    
    // 滚动到最新消息
    nextTick(() => {
      scrollToLatestMessage()
    })
  }
}

function onTabChange(newTabValue) {
  console.log('v-model 触发 tab 变化:', newTabValue, '原值:', activeTab.value)
  
  // v-model 会自动更新 activeTab.value，这里只需要处理副作用
  if (newTabValue) {
    nextTick(() => {
      scrollToLatestMessage()
      console.log('v-model 更新完成，当前标签:', activeTab.value)
    })
  }
}

// 调试函数（仅在开发环境使用）
function debugRefreshTabs() {
  if (process.env.NODE_ENV === 'development') {
    console.log('=== 调试：强制刷新标签页 ===')
    console.log('当前 discussions:', props.discussions)
    console.log('当前 activeTab:', activeTab.value)
    
    if (props.discussions && props.discussions.length > 0) {
      const firstTab = props.discussions[0].id
      console.log('强制设置为第一个标签:', firstTab)
      activeTab.value = firstTab
    }
  }
}

function debugSetFirstTab() {
  if (process.env.NODE_ENV === 'development') {
    console.log('=== 调试：设置第一个标签 ===')
    if (props.discussions && props.discussions.length > 0) {
      const firstDiscussion = props.discussions[0]
      console.log('第一个讨论:', firstDiscussion)
      activeTab.value = firstDiscussion.id
      console.log('设置完成，activeTab:', activeTab.value)
    }
  }
}

function getStatusTagType(status) {
  const typeMap = {
    'starting': 'info',
    'discussing': 'primary',
    'paused': 'warning',
    'voting': 'success',
    'completed': 'success'
  }
  return typeMap[status] || 'info'
}

function getStatusText(status) {
  const textMap = {
    'starting': '准备中',
    'discussing': '讨论中',
    'paused': '已暂停',
    'voting': '投票中',
    'completed': '已完成'
  }
  return textMap[status] || status
}

function getDiscussionProgress(discussion) {
  if (!discussion.rounds) return 0
  return Math.round((discussion.currentRound || 0) / discussion.rounds * 100)
}

function getProgressStatus(status) {
  if (status === 'paused') return 'warning'
  if (status === 'completed') return 'success'
  return ''
}

function getVotingProgress(discussion) {
  const totalAuthors = discussion.authors?.length || 1
  const votedAuthors = Object.keys(discussion.votes || {}).length
  return Math.round(votedAuthors / totalAuthors * 100)
}

function getAuthorAvatar(authorId, authors) {
  const author = authors.find(a => a.id === authorId)
  return author ? author.avatar : '👤'
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 生命周期管理
onMounted(() => {
  // 如果对话框是打开状态，启动更新定时器
  if (isVisible.value && props.discussions.length > 0) {
    startUpdateTimer()
  }
})

onUnmounted(() => {
  // 清理定时器
  stopUpdateTimer()
})
</script>

<style scoped>
.tavern-discussion-dialog {
  --el-dialog-margin-top: 5vh;
  z-index: 3000 !important;
}

/* 确保对话框在最顶层 */
:deep(.el-dialog) {
  z-index: 3000 !important;
}

:deep(.el-overlay) {
  z-index: 2999 !important;
}

.discussion-window {
  max-height: 70vh;
  overflow: hidden;
}

.discussion-tabs {
  height: 100%;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-title {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.discussion-content {
  height: 60vh;
  overflow-y: auto;
  padding: 16px 0;
}

.discussion-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.discussion-info h4 {
  margin: 0 0 8px 0;
  color: #303133;
}

.discussion-info p {
  margin: 0 0 12px 0;
  color: #606266;
  font-size: 14px;
}

.participants {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 14px;
  color: #606266;
}

.author-tag {
  margin: 2px;
}

.discussion-controls {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.discussion-progress {
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.messages-container {
  min-height: 200px;
}

.message-item {
  margin-bottom: 16px;
  padding: 12px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.message-author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-avatar {
  font-size: 18px;
}

.author-name {
  font-weight: 600;
  color: #303133;
}

.message-time {
  font-size: 12px;
  color: #909399;
}

.message-content {
  color: #606266;
  line-height: 1.6;
  font-size: 14px;
}

.empty-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #909399;
}

.empty-messages .el-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.voting-section {
  margin-top: 20px;
  padding: 16px;
  background: #f0f9ff;
  border-radius: 8px;
  border: 1px solid #b3d8ff;
}

.voting-section h5 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 8px 0;
  color: #409eff;
}

.voting-section p {
  margin: 0 0 12px 0;
  color: #606266;
}

.empty-discussions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: #909399;
}

.empty-discussions .el-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-info {
  color: #606266;
  font-size: 14px;
}

/* 滚动条样式 */
.discussion-content::-webkit-scrollbar {
  width: 6px;
}

.discussion-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.discussion-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.discussion-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tavern-discussion-dialog {
    --el-dialog-margin-top: 2vh;
  }
  
  .discussion-window {
    max-height: 80vh;
  }
  
  .discussion-content {
    height: 50vh;
  }
  
  .discussion-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .tab-title {
    max-width: 80px;
  }
}

/* 标签页样式修复 */
.discussion-tabs :deep(.el-tab-pane) {
  display: block !important;
}

.discussion-tabs :deep(.el-tabs__content) {
  overflow: visible !important;
  height: auto !important;
}

.discussion-tabs :deep(.el-tabs__nav-wrap) {
  margin-bottom: 16px;
}

/* 调试用的标签页高亮 */
.discussion-tabs :deep(.el-tabs__item.is-active) {
  background-color: #409eff !important;
  color: white !important;
}

/* 讨论内容样式 */
.discussion-content {
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  min-height: 300px;
  max-height: 500px;
  overflow-y: auto;
}

.completion-notice {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  margin: 20px 0;
  background: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 8px;
  color: #409eff;
}

.completion-notice .el-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.8;
}

.completion-notice h5 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
}

.completion-notice p {
  margin: 0;
  color: #606266;
  text-align: center;
}
</style>