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

const generateSynopsis = async () => {
  generatingSynopsis.value = true
  try {
    await emit('use-tool', 'synopsis', {
      style: selectedStyle.value,
      allData: props.wizardData
    })
    
    // 模拟生成的简介变体
    synopsisVariations.value = [
      {
        style: '悬疑版',
        content: '当梦境与现实的边界变得模糊，侦探林晓发现自己陷入了一场前所未有的追凶游戏。每一个夜晚，他都会进入受害者的梦境，寻找隐藏在潜意识深处的真相。然而，随着调查的深入，他开始怀疑：究竟是他在追捕杀手，还是杀手在等待着他？'
      },
      {
        style: '情感版',
        content: '林晓拥有一项特殊的能力——进入他人的梦境。这项天赋让他成为了城市中最出色的侦探，也让他承受着常人无法理解的孤独。当一系列神秘案件出现时，他必须在梦境与现实之间游走，不仅要面对罪犯的狡猾，更要直面自己内心深处的恐惧。'
      },
      {
        style: '商业版',
        content: '拥有梦境探索能力的侦探林晓，遇到了职业生涯中最大的挑战。连环杀手在梦境中留下线索，现实中却不留痕迹。为了破解这起案件，林晓必须深入最危险的梦境世界，在虚幻与真实之间寻找答案。一场跨越意识边界的较量即将开始...'
      }
    ]
    
    ElMessage.success('多版本简介生成完成')
  } catch (error) {
    ElMessage.error('生成失败')
  } finally {
    generatingSynopsis.value = false
  }
}

const analyzeSynopsis = async () => {
  analyzingSynopsis.value = true
  try {
    // 模拟简介分析
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    synopsisAnalysis.value = {
      attractiveness: 8.3,
      clarity: 8.7,
      uniqueness: 7.9,
      marketAppeal: 8.1,
      suggestions: [
        '突出独特的梦境设定',
        '增强紧张感和悬念',
        '更明确地描述主角的困境',
        '添加更多情感层面的描述'
      ]
    }
    
    ElMessage.success('简介效果分析完成')
  } catch (error) {
    ElMessage.error('分析失败')
  } finally {
    analyzingSynopsis.value = false
  }
}

const generateMarketingCopy = async () => {
  generatingMarketing.value = true
  try {
    // 模拟生成推广文案
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const marketingCopy = {
      tagline: '当梦境成为破案的钥匙',
      backCover: '一个拥有特殊能力的侦探，一系列无解的案件，一场跨越意识边界的较量...',
      socialMedia: '🔍 梦境侦探系列震撼来袭！ #悬疑小说 #梦境探索',
      bookstore: '现象级悬疑小说，开创梦境推理新流派'
    }
    
    localData.backCover = marketingCopy.backCover
    updateData('backCover', marketingCopy.backCover)
    
    ElMessage.success('推广文案生成完成')
  } catch (error) {
    ElMessage.error('生成失败')
  } finally {
    generatingMarketing.value = false
  }
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
