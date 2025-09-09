<template>
  <div class="tavern-manager">
    <!-- 酒馆模式开关 -->
    <div class="tavern-toggle-section">
      <div class="toggle-header">
        <el-switch
          v-model="isTavernMode"
          size="large"
          :active-icon="ChatLineRound"
          :inactive-icon="User"
          active-text="酒馆模式"
          inactive-text="单模型模式"
          @change="handleModeChange"
        />
        <el-tooltip 
          content="开启酒馆模式后，将由多位大神作者讨论生成内容，而非单一AI模型" 
          placement="top"
        >
          <el-icon class="help-icon"><QuestionFilled /></el-icon>
        </el-tooltip>
      </div>
      <p class="toggle-description" v-if="isTavernMode">
        已启用酒馆模式，将由专业作者团队为您生成内容
      </p>
    </div>

    <!-- 酒馆模式配置 -->
    <div v-if="isTavernMode" class="tavern-config">
      <!-- 作者选择 -->
      <TavernAuthorSelector
        :authors="availableAuthors"
        v-model="selectedAuthors"
        :max-selection="maxAuthors"
        @update:model-value="onAuthorsChanged"
      />

      <!-- 生成选项 -->
      <div class="generation-options">
        <div class="options-header">
          <h4>
            <el-icon><Setting /></el-icon>
            生成选项
          </h4>
        </div>
        
        <div class="options-grid">
          <div class="option-item">
            <label>讨论轮数：</label>
            <el-input-number
              v-model="discussionRounds"
              :min="2"
              :max="5"
              size="small"
            />
          </div>
          
          <div class="option-item">
            <label>是否显示讨论过程：</label>
            <el-switch
              v-model="showDiscussionProcess"
              size="small"
            />
          </div>
          
          <div class="option-item">
            <label>简单问题直接确认：</label>
            <el-switch
              v-model="skipSimpleQuestions"
              size="small"
            />
          </div>
        </div>
      </div>
      
      <!-- 当前讨论状态 -->
      <div v-if="activeDiscussions.length > 0" class="active-discussions">
        <div class="discussions-header">
          <h4>
            <el-icon><ChatDotRound /></el-icon>
            进行中的讨论 ({{ activeDiscussions.length }})
          </h4>
          <el-button 
            type="primary" 
            size="small"
            @click="showDiscussionWindow = true"
          >
            查看详情
          </el-button>
        </div>
        
        <div class="discussions-summary">
          <el-tag 
            v-for="discussion in activeDiscussions" 
            :key="discussion.id"
            :type="getDiscussionTagType(discussion.status)"
            class="discussion-tag"
          >
            {{ discussion.topic }} - {{ getStatusText(discussion.status) }}
          </el-tag>
        </div>
      </div>
    </div>

    <!-- 讨论浮窗 -->
    <TavernDiscussionWindow
      v-model="showDiscussionWindow"
      :discussions="activeDiscussions"
      @pause-discussion="pauseDiscussion"
      @resume-discussion="resumeDiscussion"
      @end-discussion="endDiscussion"
      @close="onDiscussionWindowClose"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { 
  ChatLineRound, 
  User, 
  QuestionFilled, 
  Setting,
  ChatDotRound
} from '@element-plus/icons-vue'
import { tavernService } from '@/services/tavernService.js'
import { getAuthorsByGenre } from '@/data/authorsDatabase.js'
import TavernAuthorSelector from './TavernAuthorSelector.vue'
import TavernDiscussionWindow from './TavernDiscussionWindow.vue'

const props = defineProps({
  genre: {
    type: String,
    required: true
  },
  enableTavernMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'mode-changed',
  'authors-changed',
  'discussion-started',
  'discussion-completed'
])

// 响应式数据
const isTavernMode = ref(props.enableTavernMode)
const selectedAuthors = ref([])
const discussionRounds = ref(3)
const showDiscussionProcess = ref(true)
const skipSimpleQuestions = ref(true)
const maxAuthors = ref(8)
const showDiscussionWindow = ref(false)

// 计算属性
const availableAuthors = computed(() => {
  return getAuthorsByGenre(props.genre)
})

const activeDiscussions = computed(() => {
  return tavernService.getActiveDiscussions()
})

// 监听器
watch(isTavernMode, (newVal) => {
  emit('mode-changed', newVal)
  if (newVal && selectedAuthors.value.length === 0) {
    // 自动选择推荐作者
    autoSelectRecommendedAuthors()
  }
})

watch(() => props.genre, () => {
  // 类型变化时重新选择推荐作者
  if (isTavernMode.value) {
    autoSelectRecommendedAuthors()
  }
})

watch(selectedAuthors, (newVal) => {
  emit('authors-changed', newVal)
}, { deep: true })

// 定时器用于更新讨论状态
let discussionUpdateTimer = null

// 方法
function handleModeChange(enabled) {
  if (enabled && selectedAuthors.value.length === 0) {
    autoSelectRecommendedAuthors()
  }
}

function autoSelectRecommendedAuthors() {
  const recommended = tavernService.getRecommendedAuthors(props.genre, 5)
  selectedAuthors.value = recommended.map(author => author.id)
}

function onAuthorsChanged(newAuthors) {
  selectedAuthors.value = newAuthors
}

function getDiscussionTagType(status) {
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

function pauseDiscussion(discussionId) {
  tavernService.pauseDiscussion(discussionId)
}

function resumeDiscussion(discussionId) {
  tavernService.resumeDiscussion(discussionId)
}

function endDiscussion(discussionId) {
  tavernService.endDiscussion(discussionId)
}

function onDiscussionWindowClose() {
  showDiscussionWindow.value = false
}

/**
 * 启动讨论
 */
async function startDiscussion(config) {
  if (!isTavernMode.value) {
    throw new Error('酒馆模式未启用')
  }
  
  if (selectedAuthors.value.length === 0) {
    ElMessage.warning('请至少选择一位作者参与讨论')
    return null
  }

  // 检查是否为简单问题
  if (skipSimpleQuestions.value && isSimpleQuestion(config.topic)) {
    const confirmed = await ElMessageBox.confirm(
      '检测到这是一个相对简单的问题，是否直接使用单模型生成？',
      '简单问题提示',
      {
        confirmButtonText: '直接生成',
        cancelButtonText: '使用酒馆讨论',
        type: 'info'
      }
    ).catch(() => false)
    
    if (confirmed) {
      return null // 返回null表示使用单模型
    }
  }

  const discussionConfig = {
    ...config,
    selectedAuthors: selectedAuthors.value,
    rounds: discussionRounds.value
  }

  emit('discussion-started', discussionConfig)
  
  try {
    const discussion = await tavernService.startDiscussion(discussionConfig)
    
    if (showDiscussionProcess.value) {
      showDiscussionWindow.value = true
    }
    
    // 等待讨论完成
    await waitForDiscussionCompletion(discussion.id)
    
    const result = tavernService.getDiscussionResult(discussion.id)
    emit('discussion-completed', result)
    
    return result
  } catch (error) {
    ElMessage.error('讨论启动失败: ' + error.message)
    return null
  }
}

/**
 * 判断是否为简单问题
 */
function isSimpleQuestion(topic) {
  const simplePatterns = [
    /^.{1,20}$/,  // 长度小于20的问题
    /^(姓名|名字|年龄|性别|职业)$/,  // 基本信息
    /^简单.+/,  // 以"简单"开头
    /^(是否|要不要|需要吗)/  // 是非问题
  ]
  
  return simplePatterns.some(pattern => pattern.test(topic))
}

/**
 * 等待讨论完成
 */
function waitForDiscussionCompletion(discussionId) {
  return new Promise((resolve) => {
    const checkStatus = () => {
      const discussion = tavernService.getDiscussionStatus(discussionId)
      if (!discussion || discussion.status === 'completed') {
        resolve()
      } else {
        setTimeout(checkStatus, 1000)
      }
    }
    checkStatus()
  })
}

/**
 * 获取酒馆模式配置
 */
function getTavernConfig() {
  return {
    enabled: isTavernMode.value,
    selectedAuthors: selectedAuthors.value,
    discussionRounds: discussionRounds.value,
    showProcess: showDiscussionProcess.value,
    skipSimple: skipSimpleQuestions.value
  }
}

// 生命周期
onMounted(() => {
  // 启动定时更新
  discussionUpdateTimer = setInterval(() => {
    // 强制更新讨论状态
    activeDiscussions.value.forEach(discussion => {
      // 这里可以添加更多的状态检查逻辑
    })
  }, 2000)

  // 初始化推荐作者
  if (isTavernMode.value && availableAuthors.value.length > 0) {
    autoSelectRecommendedAuthors()
  }
})

onUnmounted(() => {
  if (discussionUpdateTimer) {
    clearInterval(discussionUpdateTimer)
  }
})

// 暴露方法给父组件
defineExpose({
  startDiscussion,
  getTavernConfig,
  isTavernMode: computed(() => isTavernMode.value),
  selectedAuthors: computed(() => selectedAuthors.value),
  activeDiscussions
})
</script>

<style scoped>
.tavern-manager {
  margin: 20px 0;
}

.tavern-toggle-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.toggle-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.help-icon {
  color: #909399;
  cursor: help;
}

.toggle-description {
  margin: 8px 0 0 0;
  color: #67c23a;
  font-size: 14px;
}

.tavern-config {
  margin-top: 20px;
}

.generation-options {
  margin: 20px 0;
  padding: 16px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.options-header h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px 0;
  color: #303133;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.option-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.option-item label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.active-discussions {
  margin-top: 20px;
  padding: 16px;
  background: #e8f4fd;
  border: 1px solid #b3d8ff;
  border-radius: 8px;
}

.discussions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.discussions-header h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: #409eff;
}

.discussions-summary {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.discussion-tag {
  margin: 2px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .options-grid {
    grid-template-columns: 1fr;
  }
  
  .option-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .discussions-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
}
</style>