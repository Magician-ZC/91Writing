<template>
  <div class="synopsis-step">
    <div class="step-header">
      <h2>步骤 6: 简介撰写</h2>
      <p>撰写吸引读者的小说简介</p>
    </div>
    
    <div class="step-content">
      <!-- 一句话简介 -->
      <div class="form-section">
        <h3>
          <el-icon><ChatLineRound /></el-icon>
          一句话简介 (Logline)
        </h3>
        <p class="section-desc">用一句话概括您的整个故事</p>
        
        <el-input
          v-model="localData.logline"
          placeholder="例如：一个能进入他人梦境的侦探，必须在虚假记忆中找到真正的杀手。"
          @input="updateData('logline', $event)"
        />
      </div>
      
      <!-- 短简介 -->
      <div class="form-section">
        <h3>
          <el-icon><Document /></el-icon>
          短简介
          <span class="required">*</span>
        </h3>
        <p class="section-desc">100字左右的简要介绍</p>
        
        <el-input
          v-model="localData.shortSynopsis"
          type="textarea"
          :rows="4"
          placeholder="撰写简洁有力的短简介，突出故事的核心卖点..."
          @input="updateData('shortSynopsis', $event)"
        />
        
        <div class="word-count">
          字数：{{ getWordCount(localData.shortSynopsis) }}/100
        </div>
      </div>
      
      <!-- 长简介 -->
      <div class="form-section">
        <h3>
          <el-icon><Files /></el-icon>
          长简介
        </h3>
        <p class="section-desc">200字左右的详细介绍</p>
        
        <el-input
          v-model="localData.longSynopsis"
          type="textarea"
          :rows="6"
          placeholder="详细描述故事背景、主要角色、核心冲突和独特卖点..."
          @input="updateData('longSynopsis', $event)"
        />
        
        <div class="word-count">
          字数：{{ getWordCount(localData.longSynopsis) }}/200
        </div>
      </div>
      
      <!-- 简介风格选择 -->
      <div class="form-section">
        <h3>
          <el-icon><Brush /></el-icon>
          简介风格
        </h3>
        <p class="section-desc">选择简介的写作风格</p>
        
        <div class="style-options">
          <el-radio-group v-model="selectedStyle" @change="onStyleChange">
            <el-radio value="suspense">悬疑吸引</el-radio>
            <el-radio value="emotional">情感共鸣</el-radio>
            <el-radio value="direct">直白介绍</el-radio>
            <el-radio value="commercial">商业化</el-radio>
          </el-radio-group>
        </div>
      </div>
      
      <!-- 生成的简介变体 -->
      <div class="form-section" v-if="synopsisVariations.length">
        <h3>
          <el-icon><MagicStick /></el-icon>
          AI生成的简介版本
        </h3>
        
        <div class="variations-list">
          <div 
            v-for="(variation, index) in synopsisVariations"
            :key="index"
            class="variation-item"
            :class="{ selected: selectedVariation === index }"
            @click="selectVariation(index)"
          >
            <div class="variation-header">
              <h4>{{ variation.style }}风格</h4>
              <el-tag size="small">{{ getWordCount(variation.content) }}字</el-tag>
            </div>
            <div class="variation-content">
              {{ variation.content }}
            </div>
          </div>
        </div>
        
        <div class="variation-actions">
          <el-button 
            type="primary" 
            @click="applySelectedVariation"
            :disabled="selectedVariation === null"
          >
            应用选中版本
          </el-button>
        </div>
      </div>
      
      <!-- 卖点分析 -->
      <div class="form-section">
        <h3>
          <el-icon><Star /></el-icon>
          故事卖点
        </h3>
        <p class="section-desc">列出您故事的主要卖点</p>
        
        <div class="selling-points">
          <div 
            v-for="(point, index) in localData.pitchPoints"
            :key="index"
            class="point-item"
          >
            <span class="point-text">{{ point }}</span>
            <el-button 
              size="small" 
              type="danger" 
              text
              @click="removePoint(index)"
            >
              删除
            </el-button>
          </div>
        </div>
        
        <el-input
          v-model="newPoint"
          placeholder="输入新的卖点"
          @keyup.enter="addPoint"
        >
          <template #append>
            <el-button @click="addPoint" :disabled="!newPoint.trim()">
              添加
            </el-button>
          </template>
        </el-input>
      </div>
    </div>
    
    <!-- 快速操作 -->
    <div class="quick-actions">
      <h3>简介生成工具</h3>
      <div class="action-buttons">
        <el-button 
          type="primary" 
          @click="generateSynopsis"
          :loading="generatingSynopsis"
        >
          生成多版本简介
        </el-button>
        
        <el-button 
          type="info" 
          @click="analyzeSynopsis"
          :loading="analyzingSynopsis"
          :disabled="!localData.shortSynopsis"
        >
          分析简介效果
        </el-button>
        
        <el-button 
          type="success" 
          @click="generateMarketingCopy"
          :loading="generatingMarketing"
        >
          生成推广文案
        </el-button>
      </div>
    </div>
    
    <!-- 简介分析结果 -->
    <div class="form-section" v-if="synopsisAnalysis">
      <h3>
        <el-icon><TrendCharts /></el-icon>
        简介效果分析
      </h3>
      
      <div class="analysis-grid">
        <div class="analysis-metric">
          <div class="metric-label">吸引力</div>
          <el-progress :percentage="synopsisAnalysis.attractiveness * 10" />
        </div>
        <div class="analysis-metric">
          <div class="metric-label">清晰度</div>
          <el-progress :percentage="synopsisAnalysis.clarity * 10" />
        </div>
        <div class="analysis-metric">
          <div class="metric-label">独特性</div>
          <el-progress :percentage="synopsisAnalysis.uniqueness * 10" />
        </div>
        <div class="analysis-metric">
          <div class="metric-label">市场吸引力</div>
          <el-progress :percentage="synopsisAnalysis.marketAppeal * 10" />
        </div>
      </div>
      
      <div class="analysis-suggestions" v-if="synopsisAnalysis.suggestions">
        <h4>改进建议</h4>
        <ul>
          <li v-for="suggestion in synopsisAnalysis.suggestions" :key="suggestion">
            {{ suggestion }}
          </li>
        </ul>
      </div>
    </div>
    
    <!-- 酒馆模式 -->
    <TavernManager
      ref="tavernManagerRef"
      :genre="props.wizardData.concept?.selectedGenre || '玄幻'"
      :enable-tavern-mode="isTavernMode"
      :current-step="'synopsis'"
      @mode-changed="onTavernModeChanged"
      @authors-changed="onAuthorsChanged"
      @discussion-started="onDiscussionStarted"
      @discussion-completed="onDiscussionCompleted"
      @proposal-selected="onProposalSelected"
    />
    
    <!-- 完成状态 -->
    <div class="completion-status">
      <div class="status-header">
        <h3>完成状态</h3>
        <el-progress :percentage="completionPercentage" />
      </div>
      
      <div class="required-items">
        <div class="required-item" :class="{ completed: localData.shortSynopsis }">
          <el-icon>
            <Check v-if="localData.shortSynopsis" />
            <Close v-else />
          </el-icon>
          短简介
        </div>
      </div>
      
      <div class="completion-tip" v-if="completionPercentage === 100">
        <el-icon><SuccessFilled /></el-icon>
        <span>恭喜！您已完成所有向导步骤，可以创建小说了！</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  ChatLineRound, 
  Document, 
  Files, 
  Brush, 
  MagicStick, 
  Star, 
  TrendCharts,
  Check, 
  Close,
  SuccessFilled
} from '@element-plus/icons-vue'
import TavernManager from '@/components/tavern/TavernManager.vue'

const props = defineProps({
  stepData: { type: Object, default: () => ({}) },
  wizardData: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update-data', 'use-tool'])

const localData = reactive({
  logline: '',
  shortSynopsis: '',
  longSynopsis: '',
  backCover: '',
  pitchPoints: [],
  hooks: [],
  ...props.stepData
})

const selectedStyle = ref('commercial')
const newPoint = ref('')
const generatingSynopsis = ref(false)
const analyzingSynopsis = ref(false)
const generatingMarketing = ref(false)
const synopsisVariations = ref([])
const selectedVariation = ref(null)
const synopsisAnalysis = ref(null)

// 酒馆模式相关
const tavernManagerRef = ref(null)
const isTavernMode = ref(false)
const selectedAuthors = ref([])
const currentDiscussions = ref([])

const completionPercentage = computed(() => {
  return localData.shortSynopsis?.trim() ? 100 : 0
})

const updateData = (field, value) => {
  localData[field] = value
  emit('update-data', 'synopsisWriting', field, value)
}

const getWordCount = (text) => {
  return text ? text.replace(/\s/g, '').length : 0
}

const onStyleChange = (style) => {
  selectedStyle.value = style
}

const addPoint = () => {
  const point = newPoint.value.trim()
  if (point && !localData.pitchPoints.includes(point)) {
    localData.pitchPoints.push(point)
    updateData('pitchPoints', localData.pitchPoints)
    newPoint.value = ''
    ElMessage.success('卖点已添加')
  }
}

const removePoint = (index) => {
  localData.pitchPoints.splice(index, 1)
  updateData('pitchPoints', localData.pitchPoints)
}

const selectVariation = (index) => {
  selectedVariation.value = index
}

const applySelectedVariation = () => {
  if (selectedVariation.value !== null) {
    const variation = synopsisVariations.value[selectedVariation.value]
    localData.shortSynopsis = variation.content
    updateData('shortSynopsis', variation.content)
    ElMessage.success('简介版本已应用')
  }
}

const generateSynopsis = () => {
  // 检查组件状态
  if (!props.wizardData || !emit) {
    ElMessage.error('组件未正确初始化，请刷新页面重试')
    return
  }
  
  generatingSynopsis.value = true
  
  // 使用callback处理异步结果
  emit('use-tool', 'synopsis', {
    style: selectedStyle.value,
    allData: props.wizardData
  }, (result, error) => {
    try {
      if (error) {
        console.error('工具调用异常:', error)
        throw error
      }
      
      console.log('简介生成结果:', result)
      
      if (result && Array.isArray(result.variations)) {
        synopsisVariations.value = result.variations
        ElMessage.success(`多版本简介生成完成，共生成 ${result.variations.length} 个版本`)
      } else if (Array.isArray(result)) {
        synopsisVariations.value = result
        ElMessage.success(`多版本简介生成完成，共生成 ${result.length} 个版本`)
      } else {
        throw new Error('未收到有效的生成结果')
      }
    } catch (err) {
      console.error('生成简介失败:', err)
      ElMessage.error('生成失败：' + (err.message || '未知错误'))
    } finally {
      generatingSynopsis.value = false
    }
  })
}

const analyzeSynopsis = () => {
  if (!localData.shortSynopsis?.trim()) {
    ElMessage.warning('请先填写短简介')
    return
  }
  
  // 检查组件状态
  if (!props.wizardData || !emit) {
    ElMessage.error('组件未正确初始化，请刷新页面重试')
    return
  }
  
  analyzingSynopsis.value = true
  
  // 使用callback处理异步结果
  emit('use-tool', 'analyze-synopsis', {
    synopsis: localData.shortSynopsis,
    logline: localData.logline,
    pitchPoints: localData.pitchPoints,
    allData: props.wizardData
  }, (result, error) => {
    try {
      if (error) {
        console.error('工具调用异常:', error)
        throw error
      }
      
      console.log('简介分析结果:', result)
      
      if (result && typeof result === 'object') {
        synopsisAnalysis.value = result
        ElMessage.success('简介效果分析完成')
      } else {
        throw new Error('未收到有效的分析结果')
      }
    } catch (err) {
      console.error('分析简介失败:', err)
      ElMessage.error('分析失败：' + (err.message || '未知错误'))
    } finally {
      analyzingSynopsis.value = false
    }
  })
}

const generateMarketingCopy = () => {
  if (!localData.shortSynopsis?.trim()) {
    ElMessage.warning('请先填写短简介')
    return
  }
  
  // 检查组件状态
  if (!props.wizardData || !emit) {
    ElMessage.error('组件未正确初始化，请刷新页面重试')
    return
  }
  
  generatingMarketing.value = true
  
  // 使用callback处理异步结果
  emit('use-tool', 'marketing-copy', {
    synopsis: localData.shortSynopsis,
    logline: localData.logline,
    pitchPoints: localData.pitchPoints,
    allData: props.wizardData
  }, (result, error) => {
    try {
      if (error) {
        console.error('工具调用异常:', error)
        throw error
      }
      
      console.log('推广文案生成结果:', result)
      
      if (result && typeof result === 'object') {
        if (result.backCover) {
          localData.backCover = result.backCover
          updateData('backCover', result.backCover)
        }
        
        ElMessage.success('推广文案生成完成')
      } else {
        throw new Error('未收到有效的生成结果')
      }
    } catch (err) {
      console.error('生成推广文案失败:', err)
      ElMessage.error('生成失败：' + (err.message || '未知错误'))
    } finally {
      generatingMarketing.value = false
    }
  })
}

// 🔧 缺失的酒馆讨论事件处理函数
const onTavernModeChanged = (enabled) => {
  console.log('简介撰写酒馆模式变化:', enabled)
}

const onAuthorsChanged = (authors) => {
  console.log('简介撰写选中的作者已更新:', authors)
}

const onDiscussionStarted = (config) => {
  console.log('简介撰写讨论开始:', config)
}

const onDiscussionCompleted = (result) => {
  console.log('简介撰写讨论完成:', result)
  if (result && result.topProposals && result.topProposals.length > 0) {
    const topResult = result.topProposals[0]
    
    // 应用简介撰写结果
    localData.shortSynopsis = topResult.core || topResult.title || '酒馆讨论生成的短简介'
    localData.longSynopsis = topResult.details || '经过多位作者讨论的详细简介'
    localData.logline = topResult.advantages || '讨论确定的卖点'
    
    // 更新界面数据
    updateData('shortSynopsis', localData.shortSynopsis)
    updateData('longSynopsis', localData.longSynopsis)
    updateData('logline', localData.logline)
    
    ElMessage.success('酒馆讨论简介撰写已生成')
  }
}

const onProposalSelected = (proposal) => {
  console.log('简介撰写收到选择的方案:', proposal)
  
  // 应用选中的简介方案
  localData.shortSynopsis = proposal.core || proposal.title
  localData.longSynopsis = proposal.details
  localData.logline = proposal.advantages
  
  updateData('shortSynopsis', localData.shortSynopsis)
  updateData('longSynopsis', localData.longSynopsis)
  updateData('logline', localData.logline)
  
  ElMessage.success(`已采用"${proposal.title}"简介方案！`)
}

watch(() => props.stepData, (newData) => {
  Object.assign(localData, newData)
}, { deep: true, immediate: true })
</script>

<style scoped>
.synopsis-step {
  max-width: 800px;
  margin: 0 auto;
}

.step-header {
  text-align: center;
  margin-bottom: 32px;
}

.form-section {
  margin-bottom: 32px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.form-section h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: #2c3e50;
}

.required {
  color: #f56c6c;
}

.section-desc {
  color: #7f8c8d;
  margin-bottom: 16px;
}

.word-count {
  text-align: right;
  color: #7f8c8d;
  font-size: 12px;
  margin-top: 8px;
}

.style-options {
  background: white;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.variations-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}

.variation-item {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 2px solid #e4e7ed;
  cursor: pointer;
  transition: all 0.3s ease;
}

.variation-item:hover {
  border-color: #409eff;
}

.variation-item.selected {
  border-color: #409eff;
  background: #e3f2fd;
}

.variation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.variation-header h4 {
  margin: 0;
  color: #2c3e50;
}

.variation-content {
  line-height: 1.8;
  color: #606266;
}

.variation-actions {
  text-align: center;
}

.selling-points {
  margin-bottom: 16px;
}

.point-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  margin-bottom: 8px;
}

.point-text {
  flex: 1;
  color: #606266;
}

.quick-actions {
  margin-bottom: 32px;
  padding: 24px;
  background: #f0f9ff;
  border-radius: 8px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.analysis-metric {
  background: white;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.metric-label {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 8px;
}

.analysis-suggestions {
  background: white;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.analysis-suggestions h4 {
  margin: 0 0 12px 0;
  color: #2c3e50;
}

.analysis-suggestions ul {
  margin: 0;
  padding-left: 20px;
}

.analysis-suggestions li {
  color: #606266;
  margin-bottom: 8px;
}

.completion-status {
  padding: 24px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.required-items {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.required-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
}

.required-item.completed {
  background: #f0f9ff;
  color: #67c23a;
}

.required-item:not(.completed) {
  background: #fef0f0;
  color: #f56c6c;
}

.completion-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f0f9ff;
  border-radius: 6px;
  color: #67c23a;
  font-weight: 500;
}
</style>
