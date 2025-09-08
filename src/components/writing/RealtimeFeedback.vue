<template>
  <div class="realtime-feedback">
    <!-- 实时质量指标条 -->
    <div class="quality-bar" :class="{ 'expanded': showDetails }">
      <div class="quality-indicators">
        <!-- 总体评分 -->
        <div class="indicator overall-score" @click="toggleDetails">
          <div class="indicator-icon">
            <el-progress 
              type="circle" 
              :percentage="overallScore" 
              :width="32"
              :stroke-width="3"
              :color="getScoreColor(overallScore)"
              :show-text="false"
            />
          </div>
          <div class="indicator-info">
            <span class="indicator-label">质量</span>
            <span class="indicator-value">{{ overallScore }}</span>
          </div>
        </div>

        <!-- 字数指标 -->
        <div class="indicator word-count">
          <div class="indicator-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="indicator-info">
            <span class="indicator-label">字数</span>
            <span class="indicator-value">{{ wordCount }}</span>
          </div>
        </div>

        <!-- 可读性指标 -->
        <div class="indicator readability">
          <div class="indicator-icon">
            <el-icon :color="getReadabilityColor(readability)"><View /></el-icon>
          </div>
          <div class="indicator-info">
            <span class="indicator-label">可读性</span>
            <span class="indicator-value">{{ readability }}%</span>
          </div>
        </div>

        <!-- 情感指标 -->
        <div class="indicator emotion">
          <div class="indicator-icon">
            <el-icon :color="getEmotionColor(emotion)"><Star /></el-icon>
          </div>
          <div class="indicator-info">
            <span class="indicator-label">情感</span>
            <span class="indicator-value">{{ getEmotionText(emotion) }}</span>
          </div>
        </div>

        <!-- 建议数量 -->
        <div class="indicator suggestions" v-if="suggestionCount > 0">
          <div class="indicator-icon">
            <el-badge :value="suggestionCount" :max="99">
              <el-icon><Sunny /></el-icon>
            </el-badge>
          </div>
          <div class="indicator-info">
            <span class="indicator-label">建议</span>
            <span class="indicator-value">{{ suggestionCount }}</span>
          </div>
        </div>
      </div>

      <!-- 展开详情按钮 -->
      <div class="expand-toggle" @click="toggleDetails">
        <el-icon>
          <component :is="showDetails ? 'ArrowUp' : 'ArrowDown'" />
        </el-icon>
      </div>
    </div>

    <!-- 详细信息面板 -->
    <transition name="slide-down">
      <div v-if="showDetails" class="details-panel">
        <!-- 质量分析详情 -->
        <div class="analysis-details">
          <h4>质量分析</h4>
          <div class="analysis-grid">
            <div class="analysis-item">
              <span class="analysis-label">可读性</span>
              <el-progress 
                :percentage="readability" 
                :stroke-width="6"
                :color="getReadabilityColor(readability)"
              />
            </div>
            <div class="analysis-item">
              <span class="analysis-label">结构</span>
              <el-progress 
                :percentage="structure" 
                :stroke-width="6"
                :color="getIndicatorColor(structure)"
              />
            </div>
            <div class="analysis-item">
              <span class="analysis-label">连贯性</span>
              <el-progress 
                :percentage="coherence" 
                :stroke-width="6"
                :color="getIndicatorColor(coherence)"
              />
            </div>
            <div class="analysis-item">
              <span class="analysis-label">节奏</span>
              <el-progress 
                :percentage="rhythm" 
                :stroke-width="6"
                :color="getIndicatorColor(rhythm)"
              />
            </div>
          </div>
        </div>

        <!-- 快速建议 -->
        <div class="quick-suggestions" v-if="quickSuggestions.length > 0">
          <h4>快速建议</h4>
          <div class="suggestion-chips">
            <div 
              v-for="suggestion in quickSuggestions" 
              :key="suggestion.id"
              class="suggestion-chip"
              @click="applySuggestion(suggestion)"
            >
              <span class="chip-icon">{{ suggestion.icon }}</span>
              <span class="chip-text">{{ suggestion.title }}</span>
            </div>
          </div>
        </div>

        <!-- 实时提示 -->
        <div class="realtime-tips" v-if="currentTip">
          <div class="tip-content">
            <el-icon class="tip-icon"><InfoFilled /></el-icon>
            <span class="tip-text">{{ currentTip }}</span>
          </div>
        </div>
      </div>
    </transition>

    <!-- 浮动建议提示 -->
    <transition name="fade">
      <div 
        v-if="floatingSuggestion" 
        class="floating-suggestion"
        @click="handleFloatingSuggestion"
      >
        <div class="floating-content">
          <span class="floating-icon">{{ floatingSuggestion.icon }}</span>
          <span class="floating-text">{{ floatingSuggestion.text }}</span>
        </div>
        <el-button size="small" type="primary" text class="floating-action">
          应用
        </el-button>
      </div>
    </transition>

    <!-- 写作状态指示器 -->
    <div class="writing-status" v-if="writingStatus">
      <div class="status-indicator" :class="writingStatus.type">
        <el-icon><component :is="getStatusIcon(writingStatus.type)" /></el-icon>
      </div>
      <span class="status-text">{{ writingStatus.text }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { 
  Document, View, Star, Sunny, ArrowUp, ArrowDown, 
  InfoFilled, Check, Warning, Loading 
} from '@element-plus/icons-vue'
import suggestionEngine from '@/services/suggestionEngine.js'
import analysisService from '@/services/analysisService.js'

const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  realtime: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['apply-suggestion', 'show-suggestions'])

// 响应式数据
const showDetails = ref(false)
const overallScore = ref(0)
const wordCount = ref(0)
const readability = ref(0)
const structure = ref(0)
const coherence = ref(0)
const rhythm = ref(0)
const emotion = ref('neutral')
const suggestionCount = ref(0)
const quickSuggestions = ref([])
const currentTip = ref('')
const floatingSuggestion = ref(null)
const writingStatus = ref(null)

// 实时分析定时器
let analysisTimer = null
let tipTimer = null

// 监听内容变化
watch(() => props.content, (newContent) => {
  if (props.realtime) {
    scheduleAnalysis(newContent)
  }
}, { immediate: true })

// 组件挂载和卸载
onMounted(() => {
  startRealtimeAnalysis()
})

onUnmounted(() => {
  stopRealtimeAnalysis()
})

// 方法
const scheduleAnalysis = (content) => {
  // 清除之前的定时器
  if (analysisTimer) {
    clearTimeout(analysisTimer)
  }
  
  // 设置新的分析定时器（防抖）
  analysisTimer = setTimeout(() => {
    performRealtimeAnalysis(content)
  }, 500)
}

const performRealtimeAnalysis = async (content) => {
  try {
    // 更新写作状态
    updateWritingStatus('analyzing', '分析中...')
    
    // 获取实时质量评估
    const assessment = await analysisService.realtimeQualityAssessment(content)
    
    // 更新指标
    overallScore.value = assessment.score
    wordCount.value = assessment.indicators.wordCount
    readability.value = assessment.indicators.readability || 0
    emotion.value = assessment.indicators.emotion
    
    // 模拟其他指标（实际应该从完整分析中获取）
    structure.value = Math.max(0, overallScore.value - 10 + Math.random() * 20)
    coherence.value = Math.max(0, overallScore.value - 15 + Math.random() * 30)
    rhythm.value = Math.max(0, overallScore.value - 5 + Math.random() * 15)
    
    // 获取快速建议
    const suggestions = await suggestionEngine.generateRealtimeSuggestions(content)
    quickSuggestions.value = suggestions.slice(0, 3) // 只显示前3个
    suggestionCount.value = suggestions.length
    
    // 生成实时提示
    generateRealtimeTip(assessment, suggestions)
    
    // 检查是否需要浮动建议
    checkFloatingSuggestion(suggestions)
    
    // 更新写作状态
    updateWritingStatus('completed', '分析完成')
    
  } catch (error) {
    console.error('实时分析失败:', error)
    updateWritingStatus('error', '分析失败')
  }
}

const generateRealtimeTip = (assessment, suggestions) => {
  if (suggestions.length > 0) {
    const highPrioritySuggestions = suggestions.filter(s => s.priority === 'high')
    if (highPrioritySuggestions.length > 0) {
      currentTip.value = `发现${highPrioritySuggestions.length}个重要建议，点击查看详情`
      return
    }
  }
  
  if (assessment.score < 60) {
    currentTip.value = '文章质量有提升空间，建议查看具体建议'
  } else if (assessment.score > 80) {
    currentTip.value = '写作质量良好，继续保持！'
  } else {
    currentTip.value = ''
  }
}

const checkFloatingSuggestion = (suggestions) => {
  // 检查是否有高优先级且可操作的建议
  const urgentSuggestion = suggestions.find(s => 
    s.priority === 'high' && s.actionable && !s.applied
  )
  
  if (urgentSuggestion && Math.random() > 0.7) { // 30%概率显示浮动建议
    floatingSuggestion.value = {
      id: urgentSuggestion.id,
      icon: urgentSuggestion.icon,
      text: urgentSuggestion.title,
      suggestion: urgentSuggestion
    }
    
    // 5秒后自动隐藏
    setTimeout(() => {
      floatingSuggestion.value = null
    }, 5000)
  }
}

const updateWritingStatus = (type, text) => {
  writingStatus.value = { type, text }
  
  // 状态自动清除
  if (type !== 'analyzing') {
    setTimeout(() => {
      writingStatus.value = null
    }, 2000)
  }
}

const startRealtimeAnalysis = () => {
  // 启动实时提示轮播
  tipTimer = setInterval(() => {
    rotateTips()
  }, 8000)
}

const stopRealtimeAnalysis = () => {
  if (analysisTimer) {
    clearTimeout(analysisTimer)
  }
  if (tipTimer) {
    clearInterval(tipTimer)
  }
}

const rotateTips = () => {
  const tips = [
    '保持段落简洁，便于阅读',
    '适当使用对话增强生动性',
    '注意情感表达的层次',
    '检查句子长短搭配'
  ]
  
  if (!currentTip.value || currentTip.value.includes('发现')) {
    return // 不覆盖重要提示
  }
  
  const randomTip = tips[Math.floor(Math.random() * tips.length)]
  currentTip.value = randomTip
}

const toggleDetails = () => {
  showDetails.value = !showDetails.value
}

const applySuggestion = (suggestion) => {
  emit('apply-suggestion', suggestion)
  
  // 从快速建议中移除
  const index = quickSuggestions.value.findIndex(s => s.id === suggestion.id)
  if (index > -1) {
    quickSuggestions.value.splice(index, 1)
    suggestionCount.value--
  }
}

const handleFloatingSuggestion = () => {
  if (floatingSuggestion.value) {
    emit('apply-suggestion', floatingSuggestion.value.suggestion)
    floatingSuggestion.value = null
  }
}

// 工具方法
const getScoreColor = (score) => {
  if (score >= 80) return '#67c23a'
  if (score >= 60) return '#e6a23c'
  if (score >= 40) return '#f56c6c'
  return '#909399'
}

const getIndicatorColor = (value) => {
  if (value >= 70) return '#67c23a'
  if (value >= 50) return '#e6a23c'
  return '#f56c6c'
}

const getReadabilityColor = (value) => {
  return getIndicatorColor(value)
}

const getEmotionColor = (emotion) => {
  switch (emotion) {
    case 'positive': return '#67c23a'
    case 'negative': return '#f56c6c'
    default: return '#909399'
  }
}

const getEmotionText = (emotion) => {
  switch (emotion) {
    case 'positive': return '积极'
    case 'negative': return '消极'
    default: return '中性'
  }
}

const getStatusIcon = (type) => {
  switch (type) {
    case 'analyzing': return 'Loading'
    case 'completed': return 'Check'
    case 'error': return 'Warning'
    default: return 'InfoFilled'
  }
}

// 暴露方法供父组件调用
defineExpose({
  toggleDetails,
  performRealtimeAnalysis
})
</script>

<style scoped>
.realtime-feedback {
  position: relative;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 质量指标条 */
.quality-bar {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e4e7ed;
  cursor: pointer;
  transition: all 0.3s;
}

.quality-bar:hover {
  background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
}

.quality-indicators {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
}

.indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.indicator:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.indicator-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.indicator-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.indicator-label {
  font-size: 10px;
  color: #909399;
  line-height: 1;
}

.indicator-value {
  font-size: 12px;
  font-weight: 600;
  color: #303133;
  line-height: 1;
}

.overall-score .indicator-info {
  min-width: 40px;
}

.expand-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: white;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s;
}

.expand-toggle:hover {
  background: #409eff;
  color: white;
}

/* 详细信息面板 */
.details-panel {
  padding: 20px;
  background: white;
}

.analysis-details h4,
.quick-suggestions h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #303133;
  font-weight: 600;
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.analysis-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.analysis-label {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.quick-suggestions {
  margin-bottom: 20px;
}

.suggestion-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.suggestion-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f0f9ff;
  border: 1px solid #b3e5fc;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 12px;
}

.suggestion-chip:hover {
  background: #e1f5fe;
  border-color: #81d4fa;
  transform: translateY(-1px);
}

.chip-icon {
  font-size: 14px;
}

.chip-text {
  color: #0288d1;
  font-weight: 500;
}

.realtime-tips {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 12px;
  border-left: 3px solid #409eff;
}

.tip-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tip-icon {
  color: #409eff;
  font-size: 16px;
}

.tip-text {
  color: #606266;
  font-size: 13px;
}

/* 浮动建议 */
.floating-suggestion {
  position: absolute;
  top: -50px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 24px;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  cursor: pointer;
  z-index: 100;
}

.floating-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.floating-icon {
  font-size: 16px;
}

.floating-text {
  font-size: 13px;
  font-weight: 500;
}

.floating-action {
  color: white;
  border-color: rgba(255, 255, 255, 0.3);
}

/* 写作状态指示器 */
.writing-status {
  position: absolute;
  bottom: -40px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 12px;
  z-index: 50;
}

.status-indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.status-indicator.analyzing {
  background: #e6a23c;
  color: white;
  animation: pulse 1.5s infinite;
}

.status-indicator.completed {
  background: #67c23a;
  color: white;
}

.status-indicator.error {
  background: #f56c6c;
  color: white;
}

.status-text {
  color: #606266;
  font-weight: 500;
}

/* 动画 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-20px);
}

.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 500px;
  opacity: 1;
  transform: translateY(0);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .quality-indicators {
    gap: 12px;
    flex-wrap: wrap;
  }
  
  .indicator {
    padding: 4px 8px;
    gap: 6px;
  }
  
  .indicator-info {
    gap: 1px;
  }
  
  .indicator-label {
    font-size: 9px;
  }
  
  .indicator-value {
    font-size: 11px;
  }
  
  .analysis-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .floating-suggestion {
    right: 10px;
    padding: 10px 14px;
  }
  
  .floating-text {
    font-size: 12px;
  }
}
</style>
