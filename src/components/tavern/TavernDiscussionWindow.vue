<template>
  <el-dialog
    v-model="isVisible"
    title="酒馆讨论"
    :width="'80%'"
    :before-close="handleClose"
    class="tavern-discussion-dialog"
    append-to-body
  >
    <div class="discussion-window">
      <!-- Tab 切换 -->
      <el-tabs 
        v-model="activeTab" 
        type="card" 
        @tab-click="handleTabClick"
        class="discussion-tabs"
      >
        <el-tab-pane 
          v-for="discussion in discussions" 
          :key="discussion.id"
          :name="discussion.id"
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
          <div class="discussion-content">
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
            <div class="messages-container">
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
                <div class="message-content">{{ message.content }}</div>
              </div>
              
              <!-- 无消息状态 -->
              <div v-if="discussion.messages.length === 0" class="empty-messages">
                <el-icon><ChatDotRound /></el-icon>
                <p>讨论即将开始...</p>
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
            />
          </div>
        </el-tab-pane>
      </el-tabs>
      
      <!-- 空状态 -->
      <div v-if="discussions.length === 0" class="empty-discussions">
        <el-icon><ChatLineRound /></el-icon>
        <p>暂无进行中的讨论</p>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <div class="footer-info">
          共 {{ discussions.length }} 个讨论进行中
        </div>
        <el-button @click="handleClose">关闭窗口</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { 
  VideoPause, 
  VideoPlay, 
  CircleCloseFilled, 
  ChatDotRound, 
  ChatLineRound,
  Select
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
  'close'
])

const isVisible = ref(props.modelValue)
const activeTab = ref('')

// 监听显示状态
watch(() => props.modelValue, (newVal) => {
  isVisible.value = newVal
  if (newVal && props.discussions.length > 0) {
    // 自动选择第一个tab
    activeTab.value = props.discussions[0].id
  }
})

watch(isVisible, (newVal) => {
  emit('update:modelValue', newVal)
})

// 监听讨论列表变化
watch(() => props.discussions, (newDiscussions) => {
  if (newDiscussions.length > 0 && !activeTab.value) {
    activeTab.value = newDiscussions[0].id
  }
}, { immediate: true, deep: true })

function handleTabClick(tab) {
  activeTab.value = tab.name
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
</script>

<style scoped>
.tavern-discussion-dialog {
  --el-dialog-margin-top: 5vh;
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
</style>