<template>
  <div class="ai-writing-assistant">
    <!-- 助手头部 -->
    <div class="assistant-header">
      <div class="assistant-info">
        <div class="assistant-avatar">
          <el-icon class="avatar-icon"><User /></el-icon>
        </div>
        <div class="assistant-details">
          <h3 class="assistant-name">AI写作助手</h3>
          <p class="assistant-status">{{ assistantStatus }}</p>
        </div>
      </div>
      
      <div class="assistant-controls">
        <el-dropdown @command="handlePersonalityChange">
          <el-button size="small" text>
            <el-icon><Setting /></el-icon>
            {{ getPersonalityText(currentPersonality) }}
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="professional">专业模式</el-dropdown-item>
              <el-dropdown-item command="creative">创意模式</el-dropdown-item>
              <el-dropdown-item command="analytical">分析模式</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        
        <el-button 
          size="small" 
          text 
          @click="clearConversation"
          :disabled="conversationHistory.length === 0"
        >
          <el-icon><Delete /></el-icon>
          清空对话
        </el-button>
      </div>
    </div>

    <!-- 对话区域 -->
    <div class="conversation-area" ref="conversationRef">
      <div class="conversation-scroll" :style="{ height: conversationHeight + 'px' }">
        <!-- 欢迎消息 -->
        <div v-if="conversationHistory.length === 0" class="welcome-section">
          <div class="welcome-message">
            <h4>👋 欢迎使用AI写作助手！</h4>
            <p>我是您的专业写作伙伴，可以帮助您：</p>
            <ul>
              <li>📝 创作和续写内容</li>
              <li>✨ 优化和润色文本</li>
              <li>🎯 提供情节和角色建议</li>
              <li>📊 分析写作质量</li>
              <li>💡 解答写作技巧问题</li>
            </ul>
          </div>
          
          <div class="quick-actions" v-if="initialSuggestions.length">
            <h5>快速开始：</h5>
            <div class="suggestion-buttons">
              <el-button 
                v-for="suggestion in initialSuggestions"
                :key="suggestion.text"
                size="small"
                @click="handleQuickAction(suggestion)"
              >
                {{ suggestion.text }}
              </el-button>
            </div>
          </div>
        </div>

        <!-- 对话消息列表 -->
        <div v-else class="messages-list">
          <div 
            v-for="(message, index) in conversationHistory"
            :key="index"
            class="message-item"
            :class="message.type"
          >
            <div class="message-avatar">
              <el-icon v-if="message.type === 'user'"><User /></el-icon>
              <el-icon v-else><User /></el-icon>
            </div>
            
            <div class="message-content">
              <div class="message-text" v-html="formatMessage(message.content)"></div>
              
              <!-- 消息操作按钮 -->
              <div v-if="message.metadata && message.metadata.actions" class="message-actions">
                <el-button 
                  v-for="action in message.metadata.actions"
                  :key="action.type"
                  size="small"
                  type="primary"
                  text
                  @click="handleMessageAction(action, message)"
                >
                  {{ getActionText(action.type) }}
                </el-button>
              </div>
              
              <!-- 时间戳 -->
              <div class="message-timestamp">
                {{ formatTimestamp(message.timestamp) }}
              </div>
            </div>
          </div>
        </div>

        <!-- 正在输入指示器 -->
        <div v-if="isAssistantTyping" class="typing-indicator">
          <div class="message-item assistant">
            <div class="message-avatar">
              <el-icon><User /></el-icon>
            </div>
            <div class="message-content">
              <div class="typing-animation">
                <span></span>
                <span></span>
                <span></span>
                AI助手正在思考中...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <!-- 上下文信息栏 -->
      <div v-if="contextInfo" class="context-bar">
        <div class="context-info">
          <el-icon><InfoFilled /></el-icon>
          <span>{{ contextInfo }}</span>
        </div>
        <el-button size="small" text @click="clearContext">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>

      <!-- 快速建议 -->
      <div v-if="quickSuggestions.length && !userInput" class="quick-suggestions">
        <div class="suggestions-label">💡 试试这些问题：</div>
        <div class="suggestions-list">
          <el-tag 
            v-for="suggestion in quickSuggestions"
            :key="suggestion"
            @click="setUserInput(suggestion)"
            class="suggestion-tag"
          >
            {{ suggestion }}
          </el-tag>
        </div>
      </div>

      <!-- 输入框 -->
      <div class="input-controls">
        <el-input
          v-model="userInput"
          type="textarea"
          :rows="inputRows"
          placeholder="输入您的问题或需求，比如：帮我续写这一段、这个角色应该怎么发展、如何让对话更生动..."
          @keydown="handleKeyDown"
          @input="handleInputChange"
          :disabled="isAssistantTyping"
          ref="inputRef"
        />
        
        <div class="input-toolbar">
          <!-- 附加功能按钮 -->
          <div class="input-tools">
            <el-button 
              size="small" 
              text 
              @click="attachCurrentSelection"
              :disabled="!hasSelection"
            >
              <el-icon><Paperclip /></el-icon>
              附加选中文本
            </el-button>
            
            <el-button 
              size="small" 
              text 
              @click="attachCurrentChapter"
              :disabled="!hasCurrentChapter"
            >
              <el-icon><Document /></el-icon>
              附加当前章节
            </el-button>
          </div>

          <!-- 发送按钮 -->
          <el-button 
            type="primary" 
            @click="sendMessage"
            :disabled="!userInput.trim() || isAssistantTyping"
            :loading="isAssistantTyping"
          >
            <el-icon><Promotion /></el-icon>
            发送
          </el-button>
        </div>
      </div>
    </div>

    <!-- 功能面板 -->
    <el-drawer
      v-model="showFunctionPanel"
      title="AI助手功能"
      direction="rtl"
      size="400px"
    >
      <AssistantFunctionPanel 
        @use-function="handleFunctionUse"
        @close="showFunctionPanel = false"
      />
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  User, Setting, Delete, InfoFilled, Close, 
  Paperclip, Document, Promotion 
} from '@element-plus/icons-vue'
import aiWritingAssistant from '@/services/aiWritingAssistant.js'
import AssistantFunctionPanel from './AssistantFunctionPanel.vue'

// Props
const props = defineProps({
  height: {
    type: Number,
    default: 600
  },
  context: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['action-executed', 'context-changed'])

// 响应式数据
const conversationRef = ref(null)
const inputRef = ref(null)
const userInput = ref('')
const conversationHistory = ref([])
const isAssistantTyping = ref(false)
const currentPersonality = ref('professional')
const showFunctionPanel = ref(false)
const contextInfo = ref('')
const initialSuggestions = ref([])
const quickSuggestions = ref([
  '帮我续写当前段落',
  '分析这段文字的问题',
  '这个角色接下来该怎么发展？',
  '如何让对话更生动？',
  '检查文本的逻辑性'
])

// 计算属性
const conversationHeight = computed(() => {
  return props.height - 200 // 减去头部和输入区域的高度
})

const inputRows = computed(() => {
  const lines = userInput.value.split('\n').length
  return Math.min(Math.max(lines, 1), 4)
})

const assistantStatus = computed(() => {
  if (isAssistantTyping.value) return '正在思考中...'
  if (conversationHistory.value.length === 0) return '等待您的问题'
  return '准备就绪'
})

const hasSelection = computed(() => {
  return props.context.selectedText && props.context.selectedText.trim().length > 0
})

const hasCurrentChapter = computed(() => {
  return props.context.currentChapter && props.context.currentChapter.content
})

// 生命周期
onMounted(async () => {
  await initializeAssistant()
  scrollToBottom()
})

onUnmounted(() => {
  // 清理工作
})

// 监听对话历史变化，自动滚动到底部
watch(() => conversationHistory.value.length, () => {
  nextTick(() => {
    scrollToBottom()
  })
})

// 方法
const initializeAssistant = async () => {
  try {
    const session = await aiWritingAssistant.initializeSession(
      props.context.novel,
      {
        currentChapter: props.context.currentChapter,
        writingGoals: props.context.writingGoals,
        userPreferences: props.context.userPreferences
      }
    )

    if (session.welcome) {
      conversationHistory.value.push({
        type: 'assistant',
        content: session.welcome,
        timestamp: new Date().toISOString(),
        metadata: { event: 'session_start' }
      })
    }

    initialSuggestions.value = session.suggestions || []
  } catch (error) {
    console.error('初始化助手失败:', error)
    ElMessage.error('AI助手初始化失败')
  }
}

const sendMessage = async () => {
  if (!userInput.value.trim() || isAssistantTyping.value) return

  const message = userInput.value.trim()
  const context = {
    selectedText: props.context.selectedText,
    currentChapter: props.context.currentChapter,
    recentContent: props.context.recentContent,
    ...props.context
  }

  // 添加用户消息
  conversationHistory.value.push({
    type: 'user',
    content: message,
    timestamp: new Date().toISOString(),
    context: contextInfo.value
  })

  // 清空输入
  userInput.value = ''
  clearContext()

  // 显示打字指示器
  isAssistantTyping.value = true

  try {
    // 调用AI助手
    const response = await aiWritingAssistant.handleConversation(message, context)
    
    // 添加助手回应
    conversationHistory.value.push({
      type: 'assistant',
      content: response.message,
      timestamp: new Date().toISOString(),
      metadata: response.metadata
    })

    // 执行相关操作
    if (response.actions && response.actions.length > 0) {
      handleResponseActions(response.actions)
    }

  } catch (error) {
    console.error('AI助手响应失败:', error)
    conversationHistory.value.push({
      type: 'assistant',
      content: '抱歉，我遇到了一些问题。请稍后重试或重新表达您的需求。',
      timestamp: new Date().toISOString(),
      metadata: { type: 'error' }
    })
  } finally {
    isAssistantTyping.value = false
  }
}

const handleKeyDown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

const handleInputChange = () => {
  // 可以添加输入预处理逻辑
}

const attachCurrentSelection = () => {
  if (hasSelection.value) {
    contextInfo.value = `已附加选中文本 (${props.context.selectedText.length} 字)`
  }
}

const attachCurrentChapter = () => {
  if (hasCurrentChapter.value) {
    contextInfo.value = `已附加当前章节：${props.context.currentChapter.title || '未命名章节'}`
  }
}

const clearContext = () => {
  contextInfo.value = ''
}

const setUserInput = (text) => {
  userInput.value = text
  nextTick(() => {
    inputRef.value?.focus()
  })
}

const handleQuickAction = async (suggestion) => {
  if (suggestion.action) {
    emit('action-executed', suggestion.action)
  } else {
    setUserInput(suggestion.text)
  }
}

const handleMessageAction = async (action, message) => {
  try {
    switch (action.type) {
      case 'insert_content':
        emit('action-executed', {
          type: 'insert_text',
          content: action.content
        })
        ElMessage.success('内容已插入')
        break
        
      case 'show_suggestions':
        emit('action-executed', {
          type: 'show_suggestions',
          suggestions: action.suggestions
        })
        break
        
      case 'show_revisions':
        emit('action-executed', {
          type: 'show_revisions',
          revisions: action.revisions
        })
        break
        
      case 'show_detailed_analysis':
        emit('action-executed', {
          type: 'show_analysis',
          analysis: action.analysis
        })
        break
        
      default:
        console.log('未知操作类型:', action.type)
    }
  } catch (error) {
    console.error('执行操作失败:', error)
    ElMessage.error('操作执行失败')
  }
}

const handleResponseActions = (actions) => {
  actions.forEach(action => {
    // 自动执行某些操作
    if (action.type === 'request_text_selection') {
      ElMessage.info('请选择需要处理的文本')
    }
  })
}

const handlePersonalityChange = (personality) => {
  currentPersonality.value = personality
  aiWritingAssistant.assistantPersonality = personality
  ElMessage.success(`已切换到${getPersonalityText(personality)}`)
}

const clearConversation = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有对话记录吗？',
      '清空对话',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    conversationHistory.value = []
    aiWritingAssistant.conversationHistory = []
    ElMessage.success('对话已清空')
    
    // 重新初始化
    await initializeAssistant()
  } catch {
    // 用户取消
  }
}

const handleFunctionUse = (functionData) => {
  // 处理功能面板中的功能使用
  setUserInput(functionData.prompt)
  showFunctionPanel.value = false
}

const scrollToBottom = () => {
  nextTick(() => {
    const scrollContainer = conversationRef.value?.querySelector('.conversation-scroll')
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight
    }
  })
}

const formatMessage = (content) => {
  // 处理消息格式化
  return content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
}

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMinutes = Math.floor((now - date) / (1000 * 60))
  
  if (diffMinutes < 1) return '刚刚'
  if (diffMinutes < 60) return `${diffMinutes}分钟前`
  
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}小时前`
  
  return date.toLocaleDateString()
}

const getPersonalityText = (personality) => {
  const texts = {
    professional: '专业模式',
    creative: '创意模式',
    analytical: '分析模式'
  }
  return texts[personality] || texts.professional
}

const getActionText = (actionType) => {
  const texts = {
    insert_content: '插入内容',
    show_suggestions: '查看建议',
    show_revisions: '查看修改',
    show_detailed_analysis: '查看分析',
    request_text_selection: '选择文本',
    show_plot_suggestions: '查看情节建议',
    show_character_suggestions: '查看角色建议'
  }
  return texts[actionType] || '执行操作'
}

// 暴露方法供父组件调用
defineExpose({
  sendMessage: (message) => {
    userInput.value = message
    sendMessage()
  },
  clearConversation,
  setContext: (newContext) => {
    emit('context-changed', newContext)
  }
})
</script>

<style scoped>
.ai-writing-assistant {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 助手头部 */
.assistant-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.assistant-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.assistant-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.avatar-icon {
  font-size: 20px;
}

.assistant-details h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
}

.assistant-details p {
  margin: 0;
  font-size: 12px;
  opacity: 0.9;
}

.assistant-controls {
  display: flex;
  gap: 8px;
}

.assistant-controls .el-button {
  color: white;
  border-color: rgba(255, 255, 255, 0.3);
}

/* 对话区域 */
.conversation-area {
  flex: 1;
  overflow: hidden;
}

.conversation-scroll {
  overflow-y: auto;
  padding: 20px;
}

/* 欢迎区域 */
.welcome-section {
  text-align: center;
  padding: 40px 20px;
}

.welcome-message {
  margin-bottom: 32px;
}

.welcome-message h4 {
  color: #2c3e50;
  margin-bottom: 16px;
  font-size: 18px;
}

.welcome-message p {
  color: #7f8c8d;
  margin-bottom: 16px;
}

.welcome-message ul {
  text-align: left;
  max-width: 300px;
  margin: 0 auto;
  color: #606266;
}

.welcome-message li {
  margin-bottom: 8px;
}

.quick-actions h5 {
  color: #2c3e50;
  margin-bottom: 16px;
}

.suggestion-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

/* 消息列表 */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.message-item.user {
  flex-direction: row-reverse;
}

.message-item.user .message-content {
  background: #409eff;
  color: white;
  text-align: right;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
  flex-shrink: 0;
}

.message-item.user .message-avatar {
  background: #409eff;
  color: white;
}

.message-item.assistant .message-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.message-content {
  flex: 1;
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 12px;
  max-width: 80%;
}

.message-text {
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.message-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.message-timestamp {
  margin-top: 8px;
  font-size: 11px;
  opacity: 0.6;
}

/* 正在输入动画 */
.typing-indicator {
  opacity: 0.8;
}

.typing-animation {
  display: flex;
  align-items: center;
  gap: 8px;
  font-style: italic;
  color: #7f8c8d;
}

.typing-animation span {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-animation span:nth-child(1) { animation-delay: -0.32s; }
.typing-animation span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 输入区域 */
.input-area {
  border-top: 1px solid #e4e7ed;
  background: #fafbfc;
}

.context-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #e3f2fd;
  border-bottom: 1px solid #bbdefb;
}

.context-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #1976d2;
  font-size: 12px;
}

.quick-suggestions {
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
}

.suggestions-label {
  font-size: 12px;
  color: #7f8c8d;
  margin-bottom: 8px;
}

.suggestions-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.suggestion-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.suggestion-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.input-controls {
  padding: 16px;
}

.input-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.input-tools {
  display: flex;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .assistant-header {
    padding: 12px 16px;
  }
  
  .assistant-controls {
    flex-direction: column;
    gap: 4px;
  }
  
  .conversation-scroll {
    padding: 16px 12px;
  }
  
  .message-content {
    max-width: 90%;
  }
  
  .input-controls {
    padding: 12px;
  }
  
  .input-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .input-tools {
    justify-content: center;
  }
}

/* 滚动条样式 */
.conversation-scroll::-webkit-scrollbar {
  width: 6px;
}

.conversation-scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.conversation-scroll::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.conversation-scroll::-webkit-scrollbar-thumb:hover {
  background: #a8abb2;
}
</style>
