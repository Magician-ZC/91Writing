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
        
        <div class="option-item">
          <label>测试对话框：</label>
          <el-button 
            size="small" 
            type="warning"
            @click="showDiscussionWindow = true"
          >
            强制显示对话框
          </el-button>
        </div>
        
        <div class="option-item">
          <label>缓存管理：</label>
          <el-button 
            size="small" 
            type="success"
            @click="checkStorage"
          >
            检查缓存
          </el-button>
          <el-button 
            size="small" 
            type="info"
            @click="forceRefreshDiscussions"
          >
            刷新讨论
          </el-button>
          <el-button 
            size="small" 
            type="warning"
            @click="clearCurrentProjectCache"
          >
            清除当前项目
          </el-button>
          <el-button 
            size="small" 
            type="danger"
            @click="clearDiscussionCache"
          >
            清除全部缓存
          </el-button>
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
      @select-proposal="handleSelectProposal"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
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
  },
  currentStep: {
    type: String,
    default: '',
    // 可选值：'concept', 'worldbuilding', 'characters', 'plot', 'opening', 'synopsis'
  }
})

const emit = defineEmits([
  'mode-changed',
  'authors-changed',
  'discussion-started',
  'discussion-completed',
  'proposal-selected'
])

// 响应式数据
const isTavernMode = ref(props.enableTavernMode)
const selectedAuthors = ref([])
const discussionRounds = ref(3)
const showDiscussionProcess = ref(true)
const skipSimpleQuestions = ref(true)
const maxAuthors = ref(8)
const showDiscussionWindow = ref(false)

// 为了解决 tavernService 不是响应式的问题，添加一个响应式触发器
const discussionsUpdateTrigger = ref(0)

// 计算属性
const availableAuthors = computed(() => {
  return getAuthorsByGenre(props.genre)
})

const activeDiscussions = computed(() => {
  try {
    // 通过访问触发器来确保响应式更新
    discussionsUpdateTrigger.value // 触发响应式依赖
    
    // 检查是否是新创作场景
    const isNewCreation = !props.wizardData || Object.keys(props.wizardData).length === 0
    
    let discussions = []
    
    if (isNewCreation) {
      // 新创作场景：显示所有讨论（包括刚完成的），让用户能查看讨论历史
      const activeDiscussions = tavernService.getActiveDiscussions() || []
      const recentCompletedDiscussions = tavernService.getAllDiscussions()
        .filter(d => d.status === 'completed' && d.endTime && (Date.now() - d.endTime < 3600000)) // 1小时内完成的
      
      // 合并活跃讨论和最近完成的讨论
      discussions = [...activeDiscussions, ...recentCompletedDiscussions]
      
      // 去重（以防万一）
      const uniqueDiscussions = new Map()
      discussions.forEach(d => uniqueDiscussions.set(d.id, d))
      discussions = Array.from(uniqueDiscussions.values())
    } else {
      // 已有数据的情况下显示所有相关讨论
      discussions = tavernService.getAllDiscussions() || []
    }
    
    // 🔧 新增：根据当前步骤过滤讨论
    if (props.currentStep) {
      discussions = filterDiscussionsByStep(discussions, props.currentStep)
      console.log(`🎯 已过滤为当前步骤 "${props.currentStep}" 的讨论:`, discussions.length, '个')
    }
    
    // 只在有变化或开发环境时输出日志，减少控制台刷屏
    if (process.env.NODE_ENV === 'development' && discussions.length > 0) {
      console.log(`🔍 TavernManager activeDiscussions (${isNewCreation ? '新创作' : '已有数据'}):`, discussions.length, discussions)
    }
    
    return discussions
  } catch (error) {
    console.error('activeDiscussions computed error:', error)
    return []
  }
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

// 移除这个watch，避免循环依赖
// watch(selectedAuthors, (newVal) => {
//   emit('authors-changed', newVal)
// }, { deep: true })

// 定时器用于更新讨论状态 - 修复无限循环问题
let discussionUpdateTimer = null
let lastDiscussionCount = 0 // 记录上次讨论数量，避免重复日志
let messageUpdateUnsubscribe = null // 消息更新取消函数

// 方法
function handleModeChange(enabled) {
  if (enabled && selectedAuthors.value.length === 0) {
    autoSelectRecommendedAuthors()
  }
}

function autoSelectRecommendedAuthors() {
  try {
    const recommended = tavernService.getRecommendedAuthors(props.genre)
    const newSelection = recommended.map(author => author.id).slice(0, 5)
    
    // 避免重复设置相同的值，防止无限循环
    if (JSON.stringify(selectedAuthors.value) !== JSON.stringify(newSelection)) {
      selectedAuthors.value = newSelection
      console.log('自动选择推荐作者:', newSelection.length, '个')
    }
  } catch (error) {
    console.error('自动选择作者失败:', error)
  }
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

function handleSelectProposal(proposal) {
  console.log('TavernManager 收到选择的方案:', proposal)
  emit('proposal-selected', proposal)
}

/**
 * 启动讨论
 */
async function startDiscussion(config) {
  console.log('=== TavernManager.startDiscussion 被调用 ===')
  console.log('config:', config)
  console.log('isTavernMode.value:', isTavernMode.value)
  console.log('selectedAuthors.value:', selectedAuthors.value)
  console.log('selectedAuthors.value.length:', selectedAuthors.value.length)
  
  if (!isTavernMode.value) {
    console.error('❌ 酒馆模式未启用')
    throw new Error('酒馆模式未启用')
  }
  
  if (selectedAuthors.value.length === 0) {
    console.warn('❌ 未选择任何作者，开始自动选择推荐作者')
    // 自动选择推荐作者
    autoSelectRecommendedAuthors()
    
    // 等待一下让响应式更新完成
    await nextTick()
    
    if (selectedAuthors.value.length === 0) {
      console.error('❌ 自动选择作者也失败了')
      ElMessage.warning('无法找到合适的作者参与讨论，请检查作者数据库')
      return null
    } else {
      console.log('✅ 自动选择了作者:', selectedAuthors.value)
      ElMessage.info(`已自动选择 ${selectedAuthors.value.length} 位作者参与讨论`)
    }
  }

  // 检查是否为简单问题
  console.log('检查简单问题...')
  console.log('skipSimpleQuestions.value:', skipSimpleQuestions.value)
  console.log('isSimpleQuestion(config.topic):', isSimpleQuestion(config.topic))
  
  if (skipSimpleQuestions.value && isSimpleQuestion(config.topic)) {
    console.log('📝 检测到简单问题，询问用户选择...')
    const confirmed = await ElMessageBox.confirm(
      '检测到这是一个相对简单的问题，是否直接使用单模型生成？',
      '简单问题提示',
      {
        confirmButtonText: '直接生成',
        cancelButtonText: '使用酒馆讨论',
        type: 'info'
      }
    ).catch(() => false)
    
    console.log('用户选择:', confirmed ? '直接生成' : '使用酒馆讨论')
    
    if (confirmed) {
      console.log('❌ 用户选择直接生成，返回 null')
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
    console.log('🚀 开始调用 tavernService.startDiscussion...')
    
    // 在开始讨论前先触发一次更新
    discussionsUpdateTrigger.value++
    
    const discussion = await tavernService.startDiscussion(discussionConfig)
    
    console.log('✅ 讨论已创建:', discussion?.id, discussion?.status)
    
    // 检查讨论是否真的存在于服务中
    const serviceDiscussions = tavernService.getActiveDiscussions()
    const serviceAllDiscussions = tavernService.getAllDiscussions()
    console.log('🔍 服务中的活跃讨论:', serviceDiscussions.length)
    console.log('🔍 服务中的所有讨论:', serviceAllDiscussions.length)
    
    // 检查讨论是否真的存在
    if (!discussion || !discussion.id) {
      console.error('❌ 讨论创建失败，返回的数据无效:', discussion)
      ElMessage.error('讨论创建失败')
      return null
    }
    
    console.log('🎬 讨论创建成功，准备显示对话框...')
    console.log('discussion.id:', discussion.id)
    console.log('discussion.status:', discussion.status)
    console.log('当前 showDiscussionWindow.value:', showDiscussionWindow.value)
    
    // 使用nextTick避免响应式循环更新
    await nextTick()
    
    // 强制显示讨论窗口，让用户能看到讨论过程
    console.log('⚡ 设置 showDiscussionWindow = true')
    showDiscussionWindow.value = true
    
    console.log('✅ 当前活跃讨论数量:', activeDiscussions.value.length)
    
    // 等待一小段时间，让computed属性更新
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // 强制触发响应式更新
    discussionsUpdateTrigger.value++
    console.log('触发响应式更新，当前触发器值:', discussionsUpdateTrigger.value)
    
    // 再次等待，确保响应式更新生效
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // 再次触发更新，确保数据同步
    discussionsUpdateTrigger.value++
    console.log('✅ 最新活跃讨论数量:', activeDiscussions.value.length)
    
    // 显示启动成功消息
    ElMessage.success('酒馆讨论已开始，请查看讨论窗口了解进度')
    
    // 等待讨论完成
    await waitForDiscussionCompletion(discussion.id)
    
    const result = tavernService.getDiscussionResult(discussion.id)
    emit('discussion-completed', result)
    
    // 讨论完成后立即触发更新，让用户能看到完成的讨论
    discussionsUpdateTrigger.value++
    console.log('✅ 讨论完成，触发响应式更新，显示完成的讨论')
    
    // 显示完成消息
    ElMessage.success('酒馆讨论已完成！请查看讨论结果')
    
    // 保持窗口打开，让用户能查看结果
    // showDiscussionWindow.value = true // 不自动关闭，让用户查看
    
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

/**
 * 根据当前步骤过滤讨论
 */
function filterDiscussionsByStep(discussions, currentStep) {
  // 定义各步骤对应的讨论ID前缀
  const stepPrefixMap = {
    'concept': ['brainstorm_'],
    'worldbuilding': ['worldview-', 'worldview_'],
    'characters': ['character_', 'protagonist_', 'antagonist_'],
    'plot': ['plot_', 'conflict_', 'outline_'],
    'opening': ['opening_', 'hook_'],
    'synopsis': ['synopsis_', 'logline_', 'marketing_']
  }
  
  const prefixes = stepPrefixMap[currentStep]
  if (!prefixes) {
    console.warn(`⚠️ 未知的步骤: ${currentStep}，显示所有讨论`)
    return discussions
  }
  
  // 过滤出匹配当前步骤的讨论
  const filtered = discussions.filter(discussion => {
    if (!discussion || !discussion.id) return false
    
    return prefixes.some(prefix => discussion.id.startsWith(prefix))
  })
  
  console.log(`🎯 步骤 "${currentStep}" 的讨论过滤:`, {
    原始数量: discussions.length,
    过滤后数量: filtered.length,
    匹配前缀: prefixes,
    过滤结果: filtered.map(d => d.id)
  })
  
  return filtered
}

// 生命周期
onMounted(() => {
  // 优化定时更新 - 仅在有讨论时才进行检查，减少无意义的计算
  discussionUpdateTimer = setInterval(() => {
    const discussions = tavernService.getActiveDiscussions() || []
    const currentCount = discussions.length
    
    // 只在数量变化或有讨论时才输出日志
    if (currentCount !== lastDiscussionCount) {
      lastDiscussionCount = currentCount
      // 触发响应式更新
      discussionsUpdateTrigger.value++
      if (currentCount > 0) {
        console.log('当前活跃讨论数量更新:', currentCount)
      }
    }
  }, 3000) // 降低频率到3秒，减少CPU消耗

  // 初始化推荐作者
  if (isTavernMode.value && availableAuthors.value.length > 0) {
    autoSelectRecommendedAuthors()
  }

  // 检查是否有历史讨论需要恢复
  restoreDiscussionState()
  
  // 初始化时触发一次响应式更新，确保计算属性正确响应
  discussionsUpdateTrigger.value++
  
  // 注册消息实时更新回调
  messageUpdateUnsubscribe = tavernService.onMessageUpdate((discussionId) => {
    console.log('💬 收到消息更新通知:', discussionId)
    // 触发响应式更新
    discussionsUpdateTrigger.value++
  })
})

// 恢复讨论状态
function restoreDiscussionState() {
  // 检查是否是新创作场景
  const isNewCreation = !props.wizardData || Object.keys(props.wizardData).length === 0
  
  if (isNewCreation) {
    console.log('检测到新创作场景，不恢复历史讨论')
    return
  }
  
  // 添加小延时确保tavernService初始化完成
  setTimeout(() => {
    console.log('开始恢复讨论状态...')
    const allDiscussions = tavernService.getAllDiscussions()
    const hasCompletedDiscussions = allDiscussions.some(d => d.status === 'completed')
    
    console.log('检查历史讨论:', allDiscussions.length, '个讨论，其中已完成:', hasCompletedDiscussions)
    console.log('全部讨论详情:', allDiscussions)
    console.log('当前向导数据:', props.wizardData)
    
    // 只有在有向导数据的情况下才恢复讨论
    if (hasCompletedDiscussions && allDiscussions.length > 0 && props.wizardData && Object.keys(props.wizardData).length > 0) {
      console.log('发现已完成的讨论，自动打开讨论窗口')
      showDiscussionWindow.value = true
    }
  }, 100)
}

// 检查localStorage缓存
function checkStorage() {
  console.log('=== 检查localStorage缓存 ===')
  
  const tavernDiscussions = localStorage.getItem('tavernDiscussions')
  const tavernHistory = localStorage.getItem('tavernHistory')
  
  console.log('localStorage内容:')
  console.log('tavernDiscussions:', tavernDiscussions)
  console.log('tavernHistory:', tavernHistory)
  
  const allDiscussions = tavernService.getAllDiscussions()
  console.log('tavernService中的讨论:', allDiscussions.length, allDiscussions)
  
  const activeDiscussionsLength = activeDiscussions.value.length
  console.log('computed activeDiscussions长度:', activeDiscussionsLength)
  
  ElMessage.info(`缓存检查完成，详情查看控制台。当前讨论数量: ${activeDiscussionsLength}`)
}

// 强制刷新讨论数据
function forceRefreshDiscussions() {
  console.log('强制刷新讨论数据...')
  // 重新加载localStorage数据
  tavernService.loadFromStorage()
  // 触发响应式更新
  ElMessage.success('讨论数据已刷新')
  console.log('刷新后的讨论数量:', tavernService.getAllDiscussions().length)
}

// 清除当前项目的讨论缓存
function clearCurrentProjectCache() {
  ElMessageBox.confirm(
    '这将清除当前项目相关的酒馆讨论缓存，但保留其他项目的讨论记录。确认清除？',
    '清除当前项目缓存',
    {
      confirmButtonText: '确认清除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 清除当前场景相关的讨论
    const currentGenre = props.genre
    tavernService.clearProjectCache(currentGenre)
    ElMessage.success('当前项目讨论缓存已清除')
  }).catch(() => {
    ElMessage.info('已取消清除操作')
  })
}

// 清除所有讨论缓存
function clearDiscussionCache() {
  ElMessageBox.confirm(
    '这将清除所有酒馆讨论的缓存数据，包括历史讨论结果。确认清除？',
    '清除全部缓存确认',
    {
      confirmButtonText: '确认清除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    tavernService.clearAllCache()
    ElMessage.success('所有讨论缓存已清除')
  }).catch(() => {
    ElMessage.info('已取消清除操作')
  })
}

onUnmounted(() => {
  if (discussionUpdateTimer) {
    clearInterval(discussionUpdateTimer)
  }
  
  // 取消消息更新监听
  if (messageUpdateUnsubscribe) {
    messageUpdateUnsubscribe()
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