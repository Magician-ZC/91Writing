<template>
  <div class="novel-wizard">
    <!-- 向导头部 -->
    <div class="wizard-header">
      <div class="wizard-title">
        <h1>{{ wizardData.title || '新小说创作向导' }}</h1>
        <p class="wizard-subtitle">跟随向导完成完整的小说创建流程</p>
      </div>
      
      <!-- 进度指示器 -->
      <div class="progress-section">
        <el-progress 
          :percentage="wizardProgress" 
          :stroke-width="8"
          :text-inside="false"
          color="#409eff"
        />
        <span class="progress-text">{{ currentStep + 1 }} / {{ wizardSteps?.length || 0 }}</span>
      </div>
    </div>
    
    <!-- 步骤导航 -->
    <div class="steps-navigation">
      <div 
        v-for="(step, index) in (wizardSteps || [])" 
        :key="step.id"
        class="step-item"
        :class="{ 
          active: index === currentStep, 
          completed: isStepCompleted && isStepCompleted(index),
          accessible: index <= (currentStep || 0) 
        }"
        @click="goToStep(index)"
      >
        <div class="step-icon">
          <span v-if="isStepCompleted && isStepCompleted(index)" class="completed-icon">✓</span>
          <span v-else>{{ step.icon }}</span>
        </div>
        <div class="step-content">
          <div class="step-title">{{ step.title }}</div>
          <div class="step-description">{{ step.description }}</div>
        </div>
      </div>
    </div>
    
    <!-- 主要内容区 -->
    <div class="wizard-content">
      <!-- 步骤内容 -->
      <div class="step-content-area">
        <transition name="slide-fade" mode="out-in">
          <component 
            :is="currentStepComponent" 
            :key="currentStep"
            :step-data="currentStepData"
            :wizard-data="wizardData"
            @update-data="(stepId, field, value) => updateStepData(stepId, field, value)"
            @next-step="handleNextStep"
            @previous-step="previousStep"
            @use-tool="handleToolUsage"
          />
        </transition>
      </div>
      
      <!-- 工具侧边栏 -->
      <div class="tools-sidebar" v-if="currentStepInfo?.tools && Array.isArray(currentStepInfo.tools) && currentStepInfo.tools.length > 0">
        <div class="sidebar-header">
          <h3>可用工具</h3>
          <p>使用AI工具辅助创作</p>
        </div>
        
        <div class="tools-list">
          <div 
            v-for="toolType in (currentStepInfo?.tools || [])" 
            :key="toolType"
            class="tool-item"
            @click="openTool(toolType)"
          >
            <div class="tool-icon">{{ getToolIcon(toolType) }}</div>
            <div class="tool-info">
              <div class="tool-name">{{ getToolName(toolType) }}</div>
              <div class="tool-desc">{{ getToolDescription(toolType) }}</div>
            </div>
          </div>
        </div>
        
        <!-- 工具使用历史 -->
        <div class="tool-history" v-if="currentStepToolHistory?.length">
          <h4>本步骤工具历史</h4>
          <div class="history-list">
            <div 
              v-for="usage in (currentStepToolHistory || [])" 
              :key="usage.id"
              class="history-item"
              @click="reviewToolResult(usage)"
            >
              <span class="history-tool">{{ getToolName(usage.toolType) }}</span>
              <span class="history-time">{{ formatTime(usage.timestamp) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 底部操作栏 -->
    <div class="wizard-footer">
      <div class="footer-left">
        <el-button 
          @click="saveProgress"
          :loading="saving"
          type="info"
          plain
        >
          <el-icon><DocumentAdd /></el-icon>
          保存进度
        </el-button>
        
        <el-dropdown @command="handleProgressCommand">
          <el-button plain>
            进度管理
            <el-icon><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="view">查看进度详情</el-dropdown-item>
              <el-dropdown-item command="clear">清空保存的进度</el-dropdown-item>
              <el-dropdown-item command="reload">重新加载进度</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        
        <el-button 
          @click="showExitDialog = true"
          type="warning"
          plain
        >
          <el-icon><Close /></el-icon>
          退出向导
        </el-button>
      </div>
      
      <div class="footer-right">
        <el-button 
          @click="previousStep"
          :disabled="currentStep === 0"
          plain
        >
          <el-icon><ArrowLeft /></el-icon>
          上一步
        </el-button>
        

        <el-button 
          v-if="currentStep < (wizardSteps?.length || 0) - 1"
          @click="handleNextStep"
          :disabled="!canProceedToNext"
          type="primary"
        >
          下一步
          <el-icon><ArrowRight /></el-icon>
        </el-button>
        
        <el-button 
          v-else
          @click="completeWizard"
          :disabled="!canCompleteWizard || canCompleteWizard === false"
          :loading="completing"
          type="success"
        >
          <el-icon><Check /></el-icon>
          完成创建
        </el-button>
      </div>
    </div>
    
    <!-- 工具对话框 -->
    <el-dialog
      v-model="showToolDialog"
      :title="currentTool.title"
      width="900px"
      :close-on-click-modal="false"
    >
      <ToolInterface
        v-if="showToolDialog"
        :tool-type="currentToolType"
        :step-context="currentStepInfo"
        :wizard-data="wizardData"
        @tool-result="handleToolResult"
        @close="showToolDialog = false"
      />
    </el-dialog>
    
    <!-- 退出确认对话框 -->
    <el-dialog
      v-model="showExitDialog"
      title="退出向导"
      width="400px"
    >
      <p>您确定要退出向导吗？</p>
      <p class="exit-warning">未保存的进度将会丢失！</p>
      
      <template #footer>
        <el-button @click="showExitDialog = false">取消</el-button>
        <el-button @click="saveAndExit" type="primary">保存并退出</el-button>
        <el-button @click="exitWithoutSave" type="danger">直接退出</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { storeToRefs } from 'pinia'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Close,
  DocumentAdd,
  ArrowDown
} from '@element-plus/icons-vue'

import { useWizardStore } from '@/stores/wizardStore'
import { toolIntegrationService } from '@/services/toolIntegrationService'

// 导入步骤组件
import ConceptStep from './steps/ConceptStep.vue'
import WorldBuildingStep from './steps/WorldBuildingStep.vue'
import CharacterStep from './steps/CharacterStep.vue'
import PlotStep from './steps/PlotStep.vue'
import OpeningStep from './steps/OpeningStep.vue'
import SynopsisStep from './steps/SynopsisStep.vue'
import ToolInterface from './components/ToolInterface.vue'

// Props
const props = defineProps({
  initialTitle: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['wizard-completed', 'wizard-exited'])

// Store
const wizardStore = useWizardStore()

// 使用 storeToRefs 保持响应性
const {
  currentStep,
  wizardData,
  wizardSteps,
  wizardProgress,
  currentStepInfo,
  canProceedToNext,
  canCompleteWizard,
  toolUsageHistory
} = storeToRefs(wizardStore)

// 响应式数据
const showToolDialog = ref(false)
const showExitDialog = ref(false)
const currentToolType = ref('')
const saving = ref(false)
const completing = ref(false)

// 当前步骤组件
const currentStepComponent = computed(() => {
  const componentMap = {
    concept: ConceptStep,
    worldbuilding: WorldBuildingStep,
    characters: CharacterStep,
    plot: PlotStep,
    opening: OpeningStep,
    synopsis: SynopsisStep
  }
  
  const stepId = currentStepInfo.value?.id
  return componentMap[stepId] || ConceptStep
})

// 当前步骤数据
const currentStepData = computed(() => {
  const stepId = currentStepInfo.value?.id
  if (!stepId) return {}
  
  // 确保步骤数据存在
  if (!wizardData.value[stepId]) {
    console.warn(`步骤数据 ${stepId} 不存在，自动创建...`)
    if (stepId === 'concept') {
      wizardData.value[stepId] = {
        coreIdea: '',
        selectedGenre: '',
        targetAudience: '',
        themes: [],
        brainstormResults: [],
        marketPotential: ''
      }
    } else {
      wizardData.value[stepId] = {}
    }
  }
  
  return wizardData.value[stepId] || {}
})

// 当前步骤的工具使用历史
const currentStepToolHistory = computed(() => {
  const stepId = currentStepInfo.value?.id
  if (!stepId || !toolUsageHistory.value || !Array.isArray(toolUsageHistory.value)) {
    return []
  }
  return toolUsageHistory.value.filter(usage => usage.stepId === stepId)
})

// 当前工具信息
const currentTool = computed(() => {
  return getToolConfig(currentToolType.value)
})

// 获取store的方法（这些不需要 storeToRefs）
const { 
  nextStep, 
  previousStep, 
  goToStep, 
  updateStepData, 
  isStepCompleted,
  saveWizardProgress,
  completeWizard: completeWizardStore,
  exitWizard
} = wizardStore

// 检查向导是否已完成
const isWizardCompleted = (progressData) => {
  if (!progressData || !progressData.wizardData) return false
  
  // 检查是否到达最后一步并且有完成标记
  const isAtLastStep = progressData.currentStep >= (wizardSteps.value?.length - 1 || 5)
  const hasCompleteFlag = progressData.wizardData._completed === true
  
  // 检查关键步骤是否都有数据
  const hasBasicData = !!(
    progressData.wizardData.concept?.coreIdea &&
    progressData.wizardData.concept?.selectedGenre &&
    progressData.wizardData.synopsisWriting?.shortSynopsis
  )
  
  return hasCompleteFlag || (isAtLastStep && hasBasicData)
}

// 显示进度选择对话框
const showProgressChoiceDialog = async (progressData) => {
  const isCompleted = isWizardCompleted(progressData)
  const progressInfo = `当前进度：第 ${progressData.currentStep + 1} 步，共 ${wizardSteps.value?.length || 6} 步`
  const timeInfo = `保存时间：${new Date(progressData.timestamp).toLocaleString()}`
  
  let message = `发现上次未完成的创作进度\n\n${progressInfo}\n${timeInfo}`
  let title = '恢复创作进度'
  
  if (isCompleted) {
    message = `发现上次已完成的创作记录\n\n${timeInfo}\n\n上次创作已完成，建议重新开始新的创作`
    title = '创作记录'
  }
  
  try {
    const action = await ElMessageBox.confirm(
      message,
      title,
      {
        confirmButtonText: isCompleted ? '重新开始' : '继续创作',
        cancelButtonText: isCompleted ? '查看记录' : '重新开始',
        type: 'info',
        center: true,
        customClass: 'progress-choice-dialog'
      }
    )
    
    return isCompleted ? 'restart' : 'continue'
  } catch (dismiss) {
    return isCompleted ? 'view' : 'restart'
  }
}

// 初始化向导
const initializeWizard = async () => {
  console.log('=== 向导初始化开始 ===')
  console.log('Store状态检查:', {
    wizardSteps: wizardStore.wizardSteps,
    wizardStepsLength: wizardStore.wizardSteps?.length || 0,
    storeRef_wizardSteps: wizardSteps.value,
    storeRef_wizardStepsLength: wizardSteps.value?.length || 0
  })
  
  // 确保 wizardSteps 数组存在
  if (!wizardStore.wizardSteps || wizardStore.wizardSteps.length === 0) {
    console.error('❌ wizardSteps 数组为空！这是严重问题')
    ElMessage.error('向导数据异常，请刷新页面重试')
    return
  }
  
  // 检查是否有保存的进度
  console.log('检查保存的进度...')
  try {
    const saved = localStorage.getItem('wizardProgress')
    
    if (saved) {
      const progressData = JSON.parse(saved)
      console.log('发现保存的进度:', {
        currentStep: progressData.currentStep,
        isActive: progressData.isWizardActive,
        timestamp: new Date(progressData.timestamp).toLocaleString(),
        isCompleted: isWizardCompleted(progressData)
      })
      
      // 显示选择对话框
      const userChoice = await showProgressChoiceDialog(progressData)
      
      switch (userChoice) {
        case 'continue':
          // 继续上次进度
          const hasProgress = wizardStore.loadWizardProgress()
          if (hasProgress && wizardStore.isWizardActive) {
            ElMessage.success('已恢复上次的创作进度')
          } else {
            throw new Error('恢复进度失败')
          }
          break
          
        case 'restart':
          // 重新开始，清除旧进度
          localStorage.removeItem('wizardProgress')
          wizardStore.startWizard(props.initialTitle || '新小说')
          ElMessage.success('开始新的创作')
          break
          
        case 'view':
          // 查看记录（已完成的情况下）
          wizardStore.loadWizardProgress()
          ElMessage.info('已加载创作记录，您可以查看详情')
          break
          
        default:
          // 默认重新开始
          wizardStore.startWizard(props.initialTitle || '新小说')
          break
      }
    } else {
      // 没有保存的进度，启动新向导
      console.log('没有保存的进度，启动新向导')
      wizardStore.startWizard(props.initialTitle || '新小说')
    }
  } catch (error) {
    console.error('处理进度失败:', error)
    // 出错时启动新向导
    wizardStore.startWizard(props.initialTitle || '新小说')
    ElMessage.warning('进度处理异常，已开始新的创作')
  }
  
  // 初始化工具整合服务
  toolIntegrationService.init()
  
  console.log('向导初始化完成:', {
    currentStep: currentStep.value,
    wizardStepsLength: wizardSteps.value?.length || 0,
    canProceedToNext: canProceedToNext.value,
    hasRestoredData: Object.keys(wizardData.value).length > 2
  })
}

// 处理下一步
const handleNextStep = async () => {
  try {
    // 验证当前步骤数据
    const stepId = currentStepInfo.value.id
    const validation = validateCurrentStep()
    
    if (!validation.valid) {
      ElMessage.warning(validation.message)
      return
    }
    
    // 自动保存进度
    await saveProgress()
    
    // 进入下一步
    nextStep()
    
    ElMessage.success('已进入下一步')
  } catch (error) {
    console.error('进入下一步失败:', error)
    ElMessage.error('进入下一步失败：' + error.message)
  }
}

// 验证当前步骤
const validateCurrentStep = () => {
  const stepId = currentStepInfo.value?.id
  const stepData = currentStepData.value
  const requiredFields = currentStepInfo.value?.required || []
  
  console.log('验证步骤数据:', { stepId, hasData: !!stepData, requiredFields })
  
  if (!stepData) {
    return {
      valid: false,
      message: '步骤数据未初始化，请刷新页面重试'
    }
  }
  
  for (const field of requiredFields) {
    const value = stepData[field]
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return {
        valid: false,
        message: `请完成必填项：${field}`
      }
    }
  }
  
  return { valid: true }
}

// 处理工具使用
const handleToolUsage = async (toolType, params, callback) => {
  try {
    // 等待一小段时间确保组件完全初始化
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // 检查向导状态
    if (!wizardStore.isWizardActive) {
      console.log('向导未激活，正在重新初始化...')
      wizardStore.startWizard(wizardData.title || '新小说')
    }
    
    // 检查 currentStepInfo 是否存在
    if (!currentStepInfo.value || !currentStepInfo.value.id) {
      throw new Error(`向导步骤配置错误：无法获取步骤信息。请检查向导是否正确初始化。`)
    }
    
    const stepId = currentStepInfo.value.id
    
    console.log('执行工具:', { toolType, stepId, params })
    
    const result = await toolIntegrationService.executeAndIntegrateTool(
      toolType, 
      stepId, 
      params
    )
    
    console.log('工具执行结果:', result)
    ElMessage.success('工具执行成功')
    
    // 如果有回调函数，调用它
    if (callback && typeof callback === 'function') {
      callback(result)
    }
    
    return result
  } catch (error) {
    console.error('工具使用失败:', error)
    ElMessage.error('工具使用失败：' + error.message)
    
    // 如果有回调函数，传递错误
    if (callback && typeof callback === 'function') {
      callback(null, error)
    }
    
    throw error
  }
}

// 打开工具
const openTool = (toolType) => {
  currentToolType.value = toolType
  showToolDialog.value = true
}

// 处理工具结果
const handleToolResult = (result) => {
  // 工具结果已经在 toolIntegrationService 中处理了
  showToolDialog.value = false
  ElMessage.success('工具结果已应用')
}

// 保存进度
const saveProgress = async () => {
  saving.value = true
  try {
    wizardStore.saveWizardProgress()
    ElMessage.success('进度已保存')
  } catch (error) {
    console.error('保存进度失败:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 完成向导
const completeWizard = async () => {
  completing.value = true
  try {
    await ElMessageBox.confirm(
      '确定完成向导并创建小说吗？',
      '完成创建',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 标记为已完成
    wizardData.value._completed = true
    wizardData.value._completedAt = Date.now()
    
    // 保存完成状态
    wizardStore.saveWizardProgress()
    
    const novelData = await completeWizardStore()
    ElMessage.success('小说创建完成！')
    emit('wizard-completed', novelData)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('完成向导失败:', error)
      ElMessage.error('创建失败：' + error.message)
    }
  } finally {
    completing.value = false
  }
}

// 保存并退出
const saveAndExit = async () => {
  await saveProgress()
  exitWizard()
  showExitDialog.value = false
  emit('wizard-exited', { saved: true })
}

// 直接退出
const exitWithoutSave = () => {
  exitWizard()
  showExitDialog.value = false
  emit('wizard-exited', { saved: false })
}

// 工具配置
const getToolConfig = (toolType) => {
  const toolConfigs = {
    brainstorm: { title: '脑洞生成器', icon: '🧠' },
    genre: { title: '题材分析器', icon: '🎯' },
    worldview: { title: '世界观生成器', icon: '🌍' },
    character: { title: '角色生成器', icon: '👤' },
    conflict: { title: '冲突生成器', icon: '⚡' },
    outline: { title: '细纲生成器', icon: '📝' },
    opening: { title: '开篇生成器', icon: '🚀' },
    synopsis: { title: '简介生成器', icon: '📋' },
    cheat: { title: '金手指生成器', icon: '✨' },
    title: { title: '书名生成器', icon: '💎' }
  }
  
  return toolConfigs[toolType] || { title: toolType, icon: '🔧' }
}

const getToolIcon = (toolType) => getToolConfig(toolType).icon
const getToolName = (toolType) => getToolConfig(toolType).title

const getToolDescription = (toolType) => {
  const descriptions = {
    brainstorm: '生成创意灵感和脑洞',
    genre: '分析题材潜力和特点',
    worldview: '构建完整世界观设定',
    character: '创建角色档案',
    conflict: '设计故事冲突',
    outline: '生成章节细纲',
    opening: '创作精彩开篇',
    synopsis: '撰写吸引人的简介',
    cheat: '设计特殊能力',
    title: '生成吸引人的书名'
  }
  
  return descriptions[toolType] || '辅助创作工具'
}

// 查看工具结果
const reviewToolResult = (usage) => {
  // TODO: 实现工具结果回顾功能
  console.log('查看工具结果:', usage)
}

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString()
}

// 自动保存
let autoSaveInterval = null

const startAutoSave = () => {
  autoSaveInterval = setInterval(() => {
    saveProgress()
  }, 30000) // 每30秒自动保存
}

const stopAutoSave = () => {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval)
    autoSaveInterval = null
  }
}

// 进度管理命令处理
const handleProgressCommand = (command) => {
  switch (command) {
    case 'view':
      viewProgressDetails()
      break
    case 'clear':
      clearProgress()
      break
    case 'reload':
      reloadProgress()
      break
  }
}

const viewProgressDetails = () => {
  const saved = localStorage.getItem('wizardProgress')
  if (saved) {
    const data = JSON.parse(saved)
    const details = `
当前步骤: ${data.currentStep + 1}/6
向导状态: ${data.isWizardActive ? '激活' : '未激活'}
保存时间: ${new Date(data.timestamp).toLocaleString()}
数据概况: ${Object.keys(data.wizardData || {}).length} 个步骤有数据
    `
    ElMessageBox.alert(details, '进度详情', {
      confirmButtonText: '确定'
    })
  } else {
    ElMessage.info('暂无保存的进度')
  }
}

const clearProgress = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空保存的进度吗？此操作不可恢复。',
      '清空进度',
      {
        type: 'warning',
        confirmButtonText: '确定清空',
        cancelButtonText: '取消'
      }
    )
    
    localStorage.removeItem('wizardProgress')
    ElMessage.success('已清空保存的进度')
  } catch {
    // 用户取消
  }
}

const reloadProgress = () => {
  try {
    const hasProgress = wizardStore.loadWizardProgress()
    if (hasProgress) {
      ElMessage.success('进度已重新加载')
    } else {
      ElMessage.info('暂无保存的进度')
    }
  } catch (error) {
    ElMessage.error('加载进度失败：' + error.message)
  }
}

// 生命周期
onMounted(() => {
  initializeWizard()
  startAutoSave()
})

onUnmounted(() => {
  stopAutoSave()
})
</script>

<style scoped>
.novel-wizard {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.wizard-header {
  background: white;
  padding: 24px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.wizard-title h1 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 24px;
}

.wizard-subtitle {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 200px;
}

.progress-text {
  color: #606266;
  font-size: 14px;
  white-space: nowrap;
}

.steps-navigation {
  background: white;
  padding: 16px 24px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  gap: 8px;
  overflow-x: auto;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
  border: 1px solid #e4e7ed;
}

.step-item:hover {
  background: #f8f9fa;
}

.step-item.active {
  background: #e3f2fd;
  border-color: #409eff;
}

.step-item.completed {
  background: #f0f9ff;
  border-color: #67c23a;
}

.step-item:not(.accessible) {
  opacity: 0.5;
  cursor: not-allowed;
}

.step-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  font-size: 16px;
}

.step-item.active .step-icon {
  background: #409eff;
  color: white;
}

.step-item.completed .step-icon {
  background: #67c23a;
  color: white;
}

.completed-icon {
  font-weight: bold;
}

.step-content {
  flex: 1;
}

.step-title {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 4px;
}

.step-description {
  font-size: 12px;
  color: #7f8c8d;
  line-height: 1.4;
}

.wizard-content {
  flex: 1;
  display: flex;
  gap: 24px;
  padding: 24px;
}

.step-content-area {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.tools-sidebar {
  width: 300px;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.sidebar-header h3 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.sidebar-header p {
  margin: 0 0 20px 0;
  color: #7f8c8d;
  font-size: 14px;
}

.tools-list {
  margin-bottom: 24px;
}

.tool-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
  margin-bottom: 8px;
}

.tool-item:hover {
  background: #f8f9fa;
}

.tool-icon {
  font-size: 20px;
}

.tool-info {
  flex: 1;
}

.tool-name {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 2px;
}

.tool-desc {
  font-size: 12px;
  color: #7f8c8d;
}

.tool-history h4 {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 14px;
}

.history-list {
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-bottom: 4px;
}

.history-item:hover {
  background: #f8f9fa;
}

.history-tool {
  color: #2c3e50;
}

.history-time {
  color: #7f8c8d;
}

.wizard-footer {
  background: white;
  padding: 16px 24px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-left, .footer-right {
  display: flex;
  gap: 12px;
}

.exit-warning {
  color: #f56c6c;
  font-size: 14px;
  margin: 8px 0;
}

/* 动画效果 */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .wizard-content {
    flex-direction: column;
  }
  
  .tools-sidebar {
    width: 100%;
    order: -1;
  }
}

@media (max-width: 768px) {
  .wizard-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .steps-navigation {
    padding: 12px;
  }
  
  .step-item {
    min-width: 160px;
  }
  
  .wizard-content {
    padding: 16px;
  }
  
  .wizard-footer {
    flex-direction: column;
    gap: 12px;
  }
  
  .footer-left, .footer-right {
    width: 100%;
    justify-content: center;
  }
}

/* 进度选择对话框样式 */
:deep(.progress-choice-dialog) {
  .el-message-box__header {
    padding: 20px 24px 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 8px 8px 0 0;
  }
  
  .el-message-box__title {
    color: white;
    font-weight: 600;
  }
  
  .el-message-box__content {
    padding: 24px;
    line-height: 1.6;
    white-space: pre-line;
  }
  
  .el-message-box__message {
    font-size: 14px;
    color: #606266;
  }
  
  .el-message-box__btns {
    padding: 16px 24px 24px;
    
    .el-button {
      margin-left: 12px;
      min-width: 88px;
      border-radius: 6px;
      
      &--primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        
        &:hover {
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6);
          transform: translateY(-1px);
        }
      }
      
      &--default {
        border-color: #d9d9d9;
        
        &:hover {
          border-color: #667eea;
          color: #667eea;
        }
      }
    }
  }
}
</style>
