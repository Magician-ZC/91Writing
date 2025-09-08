<template>
  <div class="concept-step">
    <div class="step-header">
      <h2>步骤 1: 创意构思</h2>
      <p>确定小说的核心概念、类型和创作方向</p>
    </div>
    
    <div class="step-content">
      <!-- 核心创意输入 -->
      <div class="form-section">
        <h3>
          <el-icon><Lightbulb /></el-icon>
          核心创意
          <span class="required">*</span>
        </h3>
        <p class="section-desc">描述您的小说核心想法，这将成为整个故事的基础</p>
        
        <el-input
          v-model="localData.coreIdea"
          type="textarea"
          :rows="4"
          placeholder="例如：一个能够进入他人梦境的侦探，利用这种能力破解现实中的案件..."
          @input="updateData('coreIdea', $event)"
        />
        
        <div class="idea-suggestions" v-if="ideaSuggestions.length">
          <div class="suggestions-title">💡 创意建议</div>
          <div class="suggestions-list">
            <el-tag 
              v-for="suggestion in ideaSuggestions" 
              :key="suggestion"
              @click="applySuggestion(suggestion)"
              class="suggestion-tag"
            >
              {{ suggestion }}
            </el-tag>
          </div>
        </div>
      </div>
      
      <!-- 小说类型选择 -->
      <div class="form-section">
        <h3>
          <el-icon><Collection /></el-icon>
          小说类型
          <span class="required">*</span>
        </h3>
        <p class="section-desc">选择最符合您创意的小说类型</p>
        
        <div class="genre-grid">
          <div 
            v-for="genre in availableGenres" 
            :key="genre.value"
            class="genre-card"
            :class="{ selected: localData.selectedGenre === genre.value }"
            @click="selectGenre(genre.value)"
          >
            <div class="genre-icon">{{ genre.icon }}</div>
            <div class="genre-name">{{ genre.label }}</div>
            <div class="genre-desc">{{ genre.description }}</div>
          </div>
        </div>
      </div>
      
      <!-- 目标读者群体 -->
      <div class="form-section">
        <h3>
          <el-icon><User /></el-icon>
          目标读者
        </h3>
        <p class="section-desc">确定您的主要读者群体</p>
        
        <el-select 
          v-model="localData.targetAudience" 
          placeholder="选择目标读者群体"
          @change="updateData('targetAudience', $event)"
          style="width: 100%"
        >
          <el-option
            v-for="audience in audienceOptions"
            :key="audience.value"
            :label="audience.label"
            :value="audience.value"
          >
            <div class="audience-option">
              <span class="audience-name">{{ audience.label }}</span>
              <span class="audience-desc">{{ audience.description }}</span>
            </div>
          </el-option>
        </el-select>
      </div>
      
      <!-- 主题元素 -->
      <div class="form-section">
        <h3>
          <el-icon><Flag /></el-icon>
          主题元素
        </h3>
        <p class="section-desc">选择您想要探讨的主题</p>
        
        <div class="themes-container">
          <el-tag
            v-for="theme in availableThemes"
            :key="theme"
            :type="localData.themes.includes(theme) ? 'primary' : 'info'"
            @click="toggleTheme(theme)"
            class="theme-tag"
          >
            {{ theme }}
          </el-tag>
        </div>
        
        <el-input
          v-model="customTheme"
          placeholder="或输入自定义主题"
          @keyup.enter="addCustomTheme"
          style="margin-top: 12px"
        >
          <template #append>
            <el-button @click="addCustomTheme" :disabled="!customTheme.trim()">
              添加
            </el-button>
          </template>
        </el-input>
      </div>
      
      <!-- 脑洞生成结果 -->
      <div class="form-section" v-if="brainstormResults.length">
        <h3>
          <el-icon><MagicStick /></el-icon>
          创意脑洞
        </h3>
        <p class="section-desc">AI生成的创意建议，点击采用</p>
        
        <div class="brainstorm-results">
          <div 
            v-for="(brainstorm, index) in brainstormResults" 
            :key="brainstorm.id"
            class="brainstorm-card"
            :class="{ selected: selectedBrainstorm === brainstorm.id }"
            @click="selectBrainstorm(brainstorm)"
          >
            <div class="brainstorm-header">
              <h4>{{ brainstorm.title }}</h4>
              <el-tag size="small" type="success">{{ index + 1 }}</el-tag>
            </div>
            <div class="brainstorm-content">
              <div class="brainstorm-item">
                <strong>核心设定：</strong>{{ brainstorm.description }}
              </div>
              <div class="brainstorm-item">
                <strong>创意亮点：</strong>{{ brainstorm.highlight }}
              </div>
              <div class="brainstorm-item">
                <strong>冲突设计：</strong>{{ brainstorm.conflict }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 市场潜力分析 -->
      <div class="form-section" v-if="marketAnalysis">
        <h3>
          <el-icon><TrendCharts /></el-icon>
          市场潜力分析
        </h3>
        
        <div class="analysis-card">
          <div class="analysis-score">
            <div class="score-value">{{ marketAnalysis.score || 8.5 }}/10</div>
            <div class="score-label">市场潜力评分</div>
          </div>
          <div class="analysis-content">
            <div class="analysis-item">
              <strong>读者群体：</strong>{{ marketAnalysis.audience || '年轻都市读者' }}
            </div>
            <div class="analysis-item">
              <strong>竞争程度：</strong>{{ marketAnalysis.competition || '中等' }}
            </div>
            <div class="analysis-item">
              <strong>创新度：</strong>{{ marketAnalysis.innovation || '较高' }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 快速操作区 -->
    <div class="quick-actions">
      <h3>快速工具</h3>
      <div class="action-buttons">
        <el-button 
          type="primary" 
          @click="generateBrainstorm"
          :loading="generatingBrainstorm"
          icon="MagicStick"
        >
          生成创意脑洞
        </el-button>
        
        <el-button 
          type="info" 
          @click="analyzeGenre"
          :loading="analyzingGenre"
          icon="TrendCharts"
          :disabled="!localData.selectedGenre"
        >
          分析类型潜力
        </el-button>
        
        <el-button 
          type="success" 
          @click="analyzeMarket"
          :loading="analyzingMarket"
          icon="PieChart"
          :disabled="!localData.coreIdea || !localData.selectedGenre"
        >
          市场潜力评估
        </el-button>
      </div>
    </div>
    
    <!-- 完成状态提示 -->
    <div class="completion-status">
      <div class="status-header">
        <h3>完成状态</h3>
        <el-progress 
          :percentage="completionPercentage" 
          :stroke-width="6"
          :text-inside="false"
        />
      </div>
      
      <div class="required-items">
        <div 
          class="required-item"
          :class="{ completed: localData.coreIdea }"
        >
          <el-icon>
            <Check v-if="localData.coreIdea" />
            <Close v-else />
          </el-icon>
          核心创意
        </div>
        <div 
          class="required-item"
          :class="{ completed: localData.selectedGenre }"
        >
          <el-icon>
            <Check v-if="localData.selectedGenre" />
            <Close v-else />
          </el-icon>
          小说类型
        </div>
      </div>
      
      <div class="next-step-tip" v-if="completionPercentage === 100">
        <el-icon><InfoFilled /></el-icon>
        <span>恭喜！您已完成创意构思步骤，可以进入下一步了。</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Lightbulb,
  Collection,
  User,
  Flag,
  MagicStick,
  TrendCharts,
  PieChart,
  Check,
  Close,
  InfoFilled
} from '@element-plus/icons-vue'

// Props
const props = defineProps({
  stepData: {
    type: Object,
    default: () => ({})
  },
  wizardData: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['update-data', 'use-tool', 'next-step'])

// 本地数据
const localData = reactive({
  coreIdea: '',
  selectedGenre: '',
  targetAudience: '',
  themes: [],
  brainstormResults: [],
  marketPotential: '',
  ...props.stepData
})

// 响应式数据
const customTheme = ref('')
const selectedBrainstorm = ref(null)
const generatingBrainstorm = ref(false)
const analyzingGenre = ref(false)
const analyzingMarket = ref(false)

const brainstormResults = ref([])
const marketAnalysis = ref(null)
const ideaSuggestions = ref([
  '穿越时空的恋爱故事',
  '未来世界的AI革命',
  '平行宇宙的冒险',
  '超能力觉醒之路',
  '古代文明的秘密'
])

// 类型选项
const availableGenres = [
  {
    value: 'urban',
    label: '都市',
    icon: '🏙️',
    description: '现代都市背景，贴近现实生活'
  },
  {
    value: 'fantasy',
    label: '玄幻',
    icon: '🐲',
    description: '东方玄幻，修仙武侠'
  },
  {
    value: 'scifi',
    label: '科幻',
    icon: '🚀',
    description: '未来科技，星际探索'
  },
  {
    value: 'romance',
    label: '言情',
    icon: '💕',
    description: '感情为主线的故事'
  },
  {
    value: 'mystery',
    label: '悬疑',
    icon: '🔍',
    description: '推理解谜，悬念重重'
  },
  {
    value: 'historical',
    label: '历史',
    icon: '📜',
    description: '历史背景，古代题材'
  }
]

// 读者群体选项
const audienceOptions = [
  {
    value: 'young',
    label: '年轻读者(18-25岁)',
    description: '大学生、初入职场'
  },
  {
    value: 'adult',
    label: '成年读者(25-35岁)',
    description: '职场人士、都市白领'
  },
  {
    value: 'middle',
    label: '中年读者(35-45岁)',
    description: '事业有成、生活稳定'
  },
  {
    value: 'all',
    label: '全年龄段',
    description: '适合各个年龄层阅读'
  }
]

// 主题选项
const availableThemes = [
  '成长与蜕变', '爱情与友情', '正义与邪恶', '梦想与现实',
  '科技与人性', '传统与创新', '家族与荣誉', '自由与责任',
  '冒险与探索', '命运与选择', '真相与谎言', '希望与绝望'
]

// 计算属性
const completionPercentage = computed(() => {
  let completed = 0
  let total = 2 // 必填项数量
  
  if (localData.coreIdea?.trim()) completed++
  if (localData.selectedGenre) completed++
  
  return Math.round((completed / total) * 100)
})

// 方法
const updateData = (field, value) => {
  localData[field] = value
  emit('update-data', 'concept', field, value)
}

const selectGenre = (genre) => {
  localData.selectedGenre = genre
  updateData('selectedGenre', genre)
  
  // 自动触发类型分析
  if (localData.coreIdea) {
    setTimeout(() => {
      analyzeGenre()
    }, 500)
  }
}

const toggleTheme = (theme) => {
  const index = localData.themes.indexOf(theme)
  if (index >= 0) {
    localData.themes.splice(index, 1)
  } else {
    localData.themes.push(theme)
  }
  updateData('themes', localData.themes)
}

const addCustomTheme = () => {
  const theme = customTheme.value.trim()
  if (theme && !localData.themes.includes(theme)) {
    localData.themes.push(theme)
    updateData('themes', localData.themes)
    customTheme.value = ''
    ElMessage.success('主题已添加')
  }
}

const applySuggestion = (suggestion) => {
  localData.coreIdea = suggestion
  updateData('coreIdea', suggestion)
  ElMessage.success('创意建议已应用')
}

const selectBrainstorm = (brainstorm) => {
  selectedBrainstorm.value = brainstorm.id
  
  // 应用脑洞到核心创意
  localData.coreIdea = brainstorm.description
  updateData('coreIdea', brainstorm.description)
  
  // 自动提取主题
  if (brainstorm.themes) {
    localData.themes = [...new Set([...localData.themes, ...brainstorm.themes])]
    updateData('themes', localData.themes)
  }
  
  ElMessage.success('创意脑洞已应用')
}

// 工具方法
const generateBrainstorm = async () => {
  if (!localData.coreIdea?.trim()) {
    ElMessage.warning('请先输入基础创意')
    return
  }
  
  generatingBrainstorm.value = true
  try {
    const result = await emit('use-tool', 'brainstorm', {
      baseIdea: localData.coreIdea,
      preferredGenre: localData.selectedGenre,
      creativity: 'novel'
    })
    
    if (result && result.results) {
      brainstormResults.value = result.results
      ElMessage.success('创意脑洞生成完成')
    }
  } catch (error) {
    console.error('生成脑洞失败:', error)
    ElMessage.error('生成失败')
  } finally {
    generatingBrainstorm.value = false
  }
}

const analyzeGenre = async () => {
  if (!localData.selectedGenre) {
    ElMessage.warning('请先选择小说类型')
    return
  }
  
  analyzingGenre.value = true
  try {
    const result = await emit('use-tool', 'genre', {
      genre: localData.selectedGenre,
      targetAudience: localData.targetAudience
    })
    
    if (result) {
      ElMessage.success('类型分析完成')
    }
  } catch (error) {
    console.error('分析类型失败:', error)
    ElMessage.error('分析失败')
  } finally {
    analyzingGenre.value = false
  }
}

const analyzeMarket = async () => {
  if (!localData.coreIdea || !localData.selectedGenre) {
    ElMessage.warning('请先完成核心创意和类型选择')
    return
  }
  
  analyzingMarket.value = true
  try {
    // 模拟市场分析
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    marketAnalysis.value = {
      score: 8.2,
      audience: '年轻都市读者',
      competition: '中等',
      innovation: '较高',
      suggestions: [
        '突出独特设定',
        '加强角色魅力',
        '优化节奏感'
      ]
    }
    
    updateData('marketPotential', '高')
    ElMessage.success('市场潜力评估完成')
  } catch (error) {
    console.error('市场分析失败:', error)
    ElMessage.error('分析失败')
  } finally {
    analyzingMarket.value = false
  }
}

// 监听数据变化
watch(() => props.stepData, (newData) => {
  Object.assign(localData, newData)
}, { deep: true, immediate: true })

// 生命周期
onMounted(() => {
  // 如果有保存的数据，恢复状态
  if (props.stepData.brainstormResults) {
    brainstormResults.value = props.stepData.brainstormResults
  }
})
</script>

<style scoped>
.concept-step {
  max-width: 800px;
  margin: 0 auto;
}

.step-header {
  text-align: center;
  margin-bottom: 32px;
}

.step-header h2 {
  color: #2c3e50;
  margin-bottom: 8px;
}

.step-header p {
  color: #7f8c8d;
  font-size: 16px;
}

.step-content {
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
  margin-bottom: 8px;
  color: #2c3e50;
  font-size: 18px;
}

.required {
  color: #f56c6c;
}

.section-desc {
  color: #7f8c8d;
  font-size: 14px;
  margin-bottom: 16px;
}

.idea-suggestions {
  margin-top: 16px;
  padding: 16px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.suggestions-title {
  font-weight: 500;
  color: #409eff;
  margin-bottom: 12px;
}

.suggestions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-tag {
  cursor: pointer;
  transition: all 0.3s ease;
}

.suggestion-tag:hover {
  transform: translateY(-1px);
}

.genre-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.genre-card {
  padding: 20px;
  background: white;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.genre-card:hover {
  border-color: #409eff;
  transform: translateY(-2px);
}

.genre-card.selected {
  border-color: #409eff;
  background: #e3f2fd;
}

.genre-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.genre-name {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 8px;
}

.genre-desc {
  font-size: 12px;
  color: #7f8c8d;
}

.audience-option {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.audience-name {
  font-weight: 500;
}

.audience-desc {
  font-size: 12px;
  color: #7f8c8d;
}

.themes-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.theme-tag {
  cursor: pointer;
  transition: all 0.3s ease;
}

.theme-tag:hover {
  transform: scale(1.05);
}

.brainstorm-results {
  display: grid;
  gap: 16px;
}

.brainstorm-card {
  padding: 20px;
  background: white;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.brainstorm-card:hover {
  border-color: #409eff;
}

.brainstorm-card.selected {
  border-color: #67c23a;
  background: #f0f9ff;
}

.brainstorm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.brainstorm-header h4 {
  margin: 0;
  color: #2c3e50;
}

.brainstorm-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.brainstorm-item {
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
}

.analysis-card {
  display: flex;
  gap: 24px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.analysis-score {
  text-align: center;
  min-width: 100px;
}

.score-value {
  font-size: 32px;
  font-weight: bold;
  color: #67c23a;
}

.score-label {
  font-size: 12px;
  color: #7f8c8d;
}

.analysis-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.analysis-item {
  font-size: 14px;
  color: #606266;
}

.quick-actions {
  margin-bottom: 32px;
  padding: 24px;
  background: #f0f9ff;
  border-radius: 8px;
  border: 1px solid #b3d8ff;
}

.quick-actions h3 {
  margin-bottom: 16px;
  color: #2c3e50;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
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

.status-header h3 {
  margin: 0;
  color: #2c3e50;
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
  transition: all 0.3s ease;
}

.required-item.completed {
  background: #f0f9ff;
  color: #67c23a;
}

.required-item:not(.completed) {
  background: #fef0f0;
  color: #f56c6c;
}

.next-step-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f0f9ff;
  border-radius: 6px;
  color: #409eff;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .genre-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .required-items {
    flex-direction: column;
    gap: 8px;
  }
  
  .analysis-card {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
