<template>
  <div class="writing-suggestion-panel">
    <!-- 质量指标卡片 -->
    <div class="quality-indicator-card">
      <div class="quality-header">
        <h3 class="quality-title">
          <el-icon><TrendCharts /></el-icon>
          写作质量
        </h3>
        <div class="quality-score">
          <el-progress 
            type="circle" 
            :percentage="qualityScore" 
            :width="60"
            :stroke-width="6"
            :color="getScoreColor(qualityScore)"
          />
          <span class="score-text">{{ qualityScore }}/100</span>
        </div>
      </div>
      
      <div class="quality-indicators">
        <div class="indicator-item">
          <span class="indicator-label">可读性</span>
          <el-progress 
            :percentage="indicators.readability" 
            :stroke-width="4"
            :show-text="false"
            :color="getIndicatorColor(indicators.readability)"
          />
          <span class="indicator-value">{{ indicators.readability }}%</span>
        </div>
        <div class="indicator-item">
          <span class="indicator-label">字数</span>
          <span class="indicator-value">{{ indicators.wordCount }}</span>
        </div>
        <div class="indicator-item">
          <span class="indicator-label">情感</span>
          <el-tag 
            :type="getEmotionType(indicators.emotion)" 
            size="small"
          >
            {{ getEmotionText(indicators.emotion) }}
          </el-tag>
        </div>
      </div>
    </div>

    <!-- 实时建议列表 -->
    <div class="suggestions-container">
      <div class="suggestions-header">
        <h3 class="suggestions-title">
          <el-icon><Lightbulb /></el-icon>
          智能建议
          <el-badge :value="activeSuggestions.length" class="suggestion-count" />
        </h3>
        <div class="suggestions-actions">
          <el-button 
            size="small" 
            text 
            @click="refreshSuggestions"
            :loading="refreshing"
          >
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
          <el-dropdown @command="handleFilterCommand">
            <el-button size="small" text>
              <el-icon><Filter /></el-icon>
              筛选
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="all">全部建议</el-dropdown-item>
                <el-dropdown-item command="high">高优先级</el-dropdown-item>
                <el-dropdown-item command="actionable">可操作</el-dropdown-item>
                <el-dropdown-item command="personal">个性化</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <div class="suggestions-list" v-if="filteredSuggestions.length > 0">
        <div 
          v-for="suggestion in filteredSuggestions" 
          :key="suggestion.id"
          class="suggestion-item"
          :class="[
            `priority-${suggestion.priority}`,
            { 'actionable': suggestion.actionable },
            { 'applied': suggestion.applied }
          ]"
        >
          <div class="suggestion-content">
            <div class="suggestion-header">
              <span class="suggestion-icon">{{ suggestion.icon }}</span>
              <span class="suggestion-title">{{ suggestion.title }}</span>
              <el-tag 
                :type="getPriorityType(suggestion.priority)" 
                size="small"
                class="priority-tag"
              >
                {{ getPriorityText(suggestion.priority) }}
              </el-tag>
            </div>
            
            <div class="suggestion-description">
              {{ suggestion.content }}
            </div>
            
            <div v-if="suggestion.actionable && suggestion.actions.length > 0" class="suggestion-actions">
              <el-button 
                v-for="action in suggestion.actions"
                :key="action.action"
                size="small"
                type="primary"
                text
                @click="applySuggestion(suggestion, action)"
                :loading="applyingActions.has(action.action)"
              >
                <el-icon><Magic /></el-icon>
                {{ action.text }}
              </el-button>
            </div>
          </div>
          
          <div class="suggestion-controls">
            <el-button 
              size="small" 
              text 
              @click="dismissSuggestion(suggestion.id)"
              class="dismiss-btn"
            >
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <div v-else class="no-suggestions">
        <el-icon class="no-suggestions-icon"><Star /></el-icon>
        <p>{{ getSuggestionsEmptyText() }}</p>
      </div>
    </div>

    <!-- 深度分析按钮 -->
    <div class="deep-analysis-section">
      <el-button 
        type="primary" 
        @click="performDeepAnalysis"
        :loading="deepAnalyzing"
        block
      >
        <el-icon><DataAnalysis /></el-icon>
        {{ deepAnalyzing ? '深度分析中...' : '深度分析' }}
      </el-button>
    </div>

    <!-- 用户画像卡片 -->
    <div class="user-profile-card" v-if="showUserProfile">
      <div class="profile-header">
        <h4>
          <el-icon><User /></el-icon>
          写作画像
        </h4>
        <el-button size="small" text @click="showUserProfile = false">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
      
      <div class="profile-content">
        <div class="profile-item">
          <span class="profile-label">平均字数</span>
          <span class="profile-value">{{ Math.round(userProfile.avgWordCount) }}</span>
        </div>
        <div class="profile-item">
          <span class="profile-label">偏好风格</span>
          <span class="profile-value">{{ getStyleText(userProfile.preferredStyle) }}</span>
        </div>
        <div class="profile-item" v-if="userProfile.weaknesses.length > 0">
          <span class="profile-label">待改进</span>
          <div class="weakness-tags">
            <el-tag 
              v-for="weakness in userProfile.weaknesses.slice(0, 3)"
              :key="weakness"
              size="small"
              type="warning"
            >
              {{ getWeaknessText(weakness) }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  TrendCharts, Lightbulb, Refresh, Filter, Magic, Close, 
  Star, DataAnalysis, User 
} from '@element-plus/icons-vue'
import suggestionEngine from '@/services/suggestionEngine.js'
import analysisService from '@/services/analysisService.js'

const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  autoRefresh: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['apply-suggestion', 'deep-analysis'])

// 响应式数据
const qualityScore = ref(0)
const indicators = ref({
  readability: 0,
  wordCount: 0,
  emotion: 'neutral'
})

const activeSuggestions = ref([])
const filteredSuggestions = ref([])
const currentFilter = ref('all')
const refreshing = ref(false)
const deepAnalyzing = ref(false)
const applyingActions = ref(new Set())
const showUserProfile = ref(false)

// 用户画像
const userProfile = computed(() => ({
  avgWordCount: analysisService.userProfile.writingHabits.avgWordCount || 0,
  preferredStyle: analysisService.userProfile.writingHabits.preferredStyle || 'mixed',
  weaknesses: analysisService.userProfile.writingHabits.weaknesses || []
}))

// 监听内容变化
watch(() => props.content, async (newContent) => {
  if (props.autoRefresh) {
    await updateSuggestions(newContent)
  }
}, { debounce: 1000 })

// 组件挂载时初始化
onMounted(async () => {
  await updateSuggestions(props.content)
})

// 方法
const updateSuggestions = async (content) => {
  try {
    // 获取实时质量评估
    const assessment = await analysisService.realtimeQualityAssessment(content)
    qualityScore.value = assessment.score
    indicators.value = assessment.indicators

    // 获取实时建议
    const suggestions = await suggestionEngine.generateRealtimeSuggestions(content)
    activeSuggestions.value = suggestions
    
    // 应用当前筛选
    applyFilter(currentFilter.value)
  } catch (error) {
    console.error('更新建议失败:', error)
    ElMessage.error('获取写作建议失败')
  }
}

const refreshSuggestions = async () => {
  refreshing.value = true
  try {
    await updateSuggestions(props.content)
    ElMessage.success('建议已刷新')
  } finally {
    refreshing.value = false
  }
}

const handleFilterCommand = (command) => {
  currentFilter.value = command
  applyFilter(command)
}

const applyFilter = (filter) => {
  switch (filter) {
    case 'high':
      filteredSuggestions.value = activeSuggestions.value.filter(s => s.priority === 'high')
      break
    case 'actionable':
      filteredSuggestions.value = activeSuggestions.value.filter(s => s.actionable)
      break
    case 'personal':
      filteredSuggestions.value = activeSuggestions.value.filter(s => s.type === 'personal')
      break
    default:
      filteredSuggestions.value = activeSuggestions.value
  }
}

const applySuggestion = async (suggestion, action) => {
  applyingActions.value.add(action.action)
  
  try {
    const result = await suggestionEngine.applySuggestion(
      suggestion.id, 
      props.content, 
      action.action
    )
    
    // 标记建议为已应用
    suggestion.applied = true
    
    // 触发事件让父组件更新内容
    emit('apply-suggestion', {
      suggestion,
      action,
      result
    })
    
    ElMessage.success(`已应用建议：${action.text}`)
  } catch (error) {
    console.error('应用建议失败:', error)
    ElMessage.error('应用建议失败')
  } finally {
    applyingActions.value.delete(action.action)
  }
}

const dismissSuggestion = (suggestionId) => {
  const index = activeSuggestions.value.findIndex(s => s.id === suggestionId)
  if (index > -1) {
    activeSuggestions.value.splice(index, 1)
    applyFilter(currentFilter.value)
  }
}

const performDeepAnalysis = async () => {
  if (!props.content || props.content.trim().length < 50) {
    ElMessage.warning('内容太少，无法进行深度分析')
    return
  }

  deepAnalyzing.value = true
  try {
    // 进行完整分析
    const fullAnalysis = await analysisService.analyzeTextQuality(props.content)
    
    // 获取深度建议
    const deepSuggestions = await suggestionEngine.generateDeepSuggestions(
      props.content, 
      fullAnalysis
    )
    
    // 触发事件
    emit('deep-analysis', {
      analysis: fullAnalysis,
      suggestions: deepSuggestions
    })
    
    ElMessage.success('深度分析完成')
  } catch (error) {
    console.error('深度分析失败:', error)
    ElMessage.error('深度分析失败')
  } finally {
    deepAnalyzing.value = false
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

const getEmotionType = (emotion) => {
  switch (emotion) {
    case 'positive': return 'success'
    case 'negative': return 'danger'
    default: return 'info'
  }
}

const getEmotionText = (emotion) => {
  switch (emotion) {
    case 'positive': return '积极'
    case 'negative': return '消极'
    default: return '中性'
  }
}

const getPriorityType = (priority) => {
  switch (priority) {
    case 'high': return 'danger'
    case 'medium': return 'warning'
    default: return 'info'
  }
}

const getPriorityText = (priority) => {
  switch (priority) {
    case 'high': return '高'
    case 'medium': return '中'
    default: return '低'
  }
}

const getSuggestionsEmptyText = () => {
  if (!props.content || props.content.trim().length === 0) {
    return '开始写作，我将为您提供智能建议'
  }
  return '暂无建议，您的写作很棒！'
}

const getStyleText = (style) => {
  switch (style) {
    case 'narrative': return '叙述型'
    case 'descriptive': return '描述型'
    case 'dialogue': return '对话型'
    case 'formal': return '正式型'
    default: return '混合型'
  }
}

const getWeaknessText = (weakness) => {
  switch (weakness) {
    case 'readability': return '可读性'
    case 'emotion': return '情感表达'
    case 'rhythm': return '写作节奏'
    case 'coherence': return '逻辑连贯'
    default: return weakness
  }
}

// 暴露方法供父组件调用
defineExpose({
  refreshSuggestions,
  performDeepAnalysis,
  showUserProfile: () => { showUserProfile.value = true }
})
</script>

<style scoped>
.writing-suggestion-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  overflow-y: auto;
  padding: 16px;
  background: #f8f9fa;
}

/* 质量指标卡片 */
.quality-indicator-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.quality-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.quality-title {
  margin: 0;
  font-size: 16px;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.quality-score {
  display: flex;
  align-items: center;
  gap: 12px;
}

.score-text {
  font-size: 14px;
  font-weight: 600;
  color: #606266;
}

.quality-indicators {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.indicator-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.indicator-label {
  min-width: 60px;
  font-size: 14px;
  color: #909399;
}

.indicator-value {
  min-width: 40px;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  text-align: right;
}

/* 建议容器 */
.suggestions-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.suggestions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.suggestions-title {
  margin: 0;
  font-size: 16px;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.suggestion-count {
  margin-left: 8px;
}

.suggestions-actions {
  display: flex;
  gap: 8px;
}

.suggestions-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 建议项 */
.suggestion-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s;
  background: #fafbfc;
}

.suggestion-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.suggestion-item.priority-high {
  border-left: 4px solid #f56c6c;
}

.suggestion-item.priority-medium {
  border-left: 4px solid #e6a23c;
}

.suggestion-item.priority-low {
  border-left: 4px solid #909399;
}

.suggestion-item.actionable {
  background: #f0f9ff;
}

.suggestion-item.applied {
  opacity: 0.6;
  background: #f5f7fa;
}

.suggestion-content {
  flex: 1;
}

.suggestion-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.suggestion-icon {
  font-size: 18px;
}

.suggestion-title {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.priority-tag {
  margin-left: auto;
}

.suggestion-description {
  color: #606266;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 12px;
}

.suggestion-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.suggestion-controls {
  display: flex;
  align-items: flex-start;
}

.dismiss-btn {
  color: #c0c4cc;
}

/* 无建议状态 */
.no-suggestions {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #909399;
  padding: 40px 20px;
}

.no-suggestions-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

/* 深度分析区域 */
.deep-analysis-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 用户画像卡片 */
.user-profile-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.profile-header h4 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.profile-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-label {
  opacity: 0.9;
  font-size: 14px;
}

.profile-value {
  font-weight: 600;
  font-size: 14px;
}

.weakness-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .writing-suggestion-panel {
    padding: 12px;
    gap: 16px;
  }
  
  .quality-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .suggestions-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .suggestion-item {
    padding: 12px;
  }
  
  .suggestion-actions {
    flex-direction: column;
  }
}

/* 滚动条样式 */
.suggestions-list::-webkit-scrollbar {
  width: 6px;
}

.suggestions-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.suggestions-list::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.suggestions-list::-webkit-scrollbar-thumb:hover {
  background: #a8abb2;
}
</style>
