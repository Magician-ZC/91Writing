<template>
  <div class="opening-step">
    <div class="step-header">
      <h2>步骤 5: 开篇设计</h2>
      <p>创造引人入胜的故事开头</p>
    </div>
    
    <div class="step-content">
      <!-- 开篇钩子 -->
      <div class="form-section">
        <h3>
          <el-icon><Pointer /></el-icon>
          开篇钩子
          <span class="required">*</span>
        </h3>
        <p class="section-desc">设计吸引读者的开头元素</p>
        
        <el-input
          v-model="localData.hook"
          type="textarea"
          :rows="3"
          placeholder="描述您想要使用的开篇钩子，如悬疑、动作、对话等..."
          @input="updateData('hook', $event)"
        />
      </div>
      
      <!-- 氛围设定 -->
      <div class="form-section">
        <h3>
          <el-icon><Sunny /></el-icon>
          氛围营造
        </h3>
        <p class="section-desc">选择开篇的整体氛围</p>
        
        <div class="atmosphere-grid">
          <div 
            v-for="atmosphere in atmosphereOptions"
            :key="atmosphere.value"
            class="atmosphere-card"
            :class="{ selected: localData.atmosphere === atmosphere.value }"
            @click="selectAtmosphere(atmosphere.value)"
          >
            <div class="atmosphere-icon">{{ atmosphere.icon }}</div>
            <div class="atmosphere-name">{{ atmosphere.label }}</div>
            <div class="atmosphere-desc">{{ atmosphere.description }}</div>
          </div>
        </div>
      </div>
      
      <!-- 开篇场景 -->
      <div class="form-section">
        <h3>
          <el-icon><Picture /></el-icon>
          开篇场景
          <span class="required">*</span>
        </h3>
        <p class="section-desc">描述故事开始的具体场景</p>
        
        <el-input
          v-model="localData.openingScene"
          type="textarea"
          :rows="4"
          placeholder="详细描述开篇场景的时间、地点、环境等..."
          @input="updateData('openingScene', $event)"
        />
      </div>
      
      <!-- 生成的开篇内容 -->
      <div class="form-section" v-if="generatedOpening">
        <h3>
          <el-icon><MagicStick /></el-icon>
          AI生成的开篇
        </h3>
        
        <div class="opening-content">
          <div class="opening-text">
            {{ generatedOpening }}
          </div>
          
          <div class="opening-actions">
            <el-button type="primary" @click="applyOpening">
              应用此开篇
            </el-button>
            <el-button @click="regenerateOpening" :loading="generatingOpening">
              重新生成
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 开篇分析 -->
      <div class="form-section" v-if="openingAnalysis">
        <h3>
          <el-icon><TrendCharts /></el-icon>
          开篇效果分析
        </h3>
        
        <div class="analysis-grid">
          <div class="analysis-item">
            <div class="analysis-label">钩子强度</div>
            <el-progress :percentage="openingAnalysis.hookStrength * 10" />
          </div>
          <div class="analysis-item">
            <div class="analysis-label">节奏感</div>
            <el-progress :percentage="openingAnalysis.pacing * 10" />
          </div>
          <div class="analysis-item">
            <div class="analysis-label">角色引入</div>
            <el-progress :percentage="openingAnalysis.characterIntro * 10" />
          </div>
          <div class="analysis-item">
            <div class="analysis-label">世界构建</div>
            <el-progress :percentage="openingAnalysis.worldBuilding * 10" />
          </div>
        </div>
      </div>
    </div>
    
    <!-- 快速操作 -->
    <div class="quick-actions">
      <h3>开篇创作工具</h3>
      <div class="action-buttons">
        <el-button 
          type="primary" 
          @click="generateOpening"
          :loading="generatingOpening"
          :disabled="!localData.hook || !localData.openingScene"
        >
          生成开篇内容
        </el-button>
        
        <el-button 
          type="info" 
          @click="analyzeOpening"
          :loading="analyzingOpening"
          :disabled="!generatedOpening"
        >
          分析开篇效果
        </el-button>
      </div>
    </div>
    
    <!-- 完成状态 -->
    <div class="completion-status">
      <div class="status-header">
        <h3>完成状态</h3>
        <el-progress :percentage="completionPercentage" />
      </div>
      
      <div class="required-items">
        <div class="required-item" :class="{ completed: localData.hook }">
          <el-icon>
            <Check v-if="localData.hook" />
            <Close v-else />
          </el-icon>
          开篇钩子
        </div>
        <div class="required-item" :class="{ completed: localData.openingScene }">
          <el-icon>
            <Check v-if="localData.openingScene" />
            <Close v-else />
          </el-icon>
          开篇场景
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Pointer, Sunny, Picture, MagicStick, TrendCharts, Check, Close } from '@element-plus/icons-vue'

const props = defineProps({
  stepData: { type: Object, default: () => ({}) },
  wizardData: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update-data', 'use-tool'])

const localData = reactive({
  hook: '',
  atmosphere: '',
  settingIntroduction: '',
  characterIntroduction: '',
  openingScene: '',
  firstParagraph: '',
  ...props.stepData
})

const generatingOpening = ref(false)
const analyzingOpening = ref(false)
const generatedOpening = ref('')
const openingAnalysis = ref(null)

const atmosphereOptions = [
  {
    value: 'tense',
    label: '紧张刺激',
    icon: '⚡',
    description: '高节奏，充满悬念'
  },
  {
    value: 'mysterious',
    label: '神秘悬疑',
    icon: '🌫️',
    description: '营造神秘氛围'
  },
  {
    value: 'warm',
    label: '温馨平和',
    icon: '☀️',
    description: '温暖舒适的感觉'
  },
  {
    value: 'dramatic',
    label: '戏剧冲突',
    icon: '🎭',
    description: '强烈的戏剧张力'
  }
]

const completionPercentage = computed(() => {
  let completed = 0
  if (localData.hook?.trim()) completed += 50
  if (localData.openingScene?.trim()) completed += 50
  return completed
})

const updateData = (field, value) => {
  localData[field] = value
  emit('update-data', 'openingDesign', field, value)
}

const selectAtmosphere = (atmosphere) => {
  localData.atmosphere = atmosphere
  updateData('atmosphere', atmosphere)
}

const generateOpening = async () => {
  if (!localData.hook || !localData.openingScene) {
    ElMessage.warning('请先完成钩子设计和场景描述')
    return
  }
  
  generatingOpening.value = true
  try {
    await emit('use-tool', 'opening', {
      hook: localData.hook,
      atmosphere: localData.atmosphere,
      scene: localData.openingScene,
      allData: props.wizardData
    })
    
    // 模拟生成的开篇
    generatedOpening.value = `夜色如墨，城市的霓虹灯在雨夜中闪烁着诡异的光芒。林晓站在犯罪现场外，雨水顺着他的风衣滴落，眼神凝重地注视着那扇紧闭的门。
    
"又是一起无解的案件。"他的搭档王小明走了过来，手中拿着初步的勘察报告。"受害者毫无外伤，但表情极度恐惧，就像见到了什么可怕的东西。"
    
林晓缓缓点头，心中涌起一股不安的预感。这已经是这个月第三起类似案件了，每一次都让他想起那个奇怪的梦境...`
    
    localData.firstParagraph = generatedOpening.value.split('\n')[0]
    updateData('firstParagraph', localData.firstParagraph)
    
    ElMessage.success('开篇内容生成完成')
  } catch (error) {
    ElMessage.error('生成失败')
  } finally {
    generatingOpening.value = false
  }
}

const applyOpening = () => {
  localData.firstParagraph = generatedOpening.value
  updateData('firstParagraph', generatedOpening.value)
  ElMessage.success('开篇内容已应用')
}

const regenerateOpening = () => {
  generateOpening()
}

const analyzeOpening = async () => {
  analyzingOpening.value = true
  try {
    // 模拟开篇分析
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    openingAnalysis.value = {
      hookStrength: 8.5,
      pacing: 7.8,
      characterIntro: 8.2,
      worldBuilding: 7.5,
      overallScore: 8.0
    }
    
    ElMessage.success('开篇效果分析完成')
  } catch (error) {
    ElMessage.error('分析失败')
  } finally {
    analyzingOpening.value = false
  }
}

watch(() => props.stepData, (newData) => {
  Object.assign(localData, newData)
}, { deep: true, immediate: true })
</script>

<style scoped>
.opening-step {
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

.atmosphere-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.atmosphere-card {
  padding: 20px;
  background: white;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.atmosphere-card:hover {
  border-color: #409eff;
  transform: translateY(-2px);
}

.atmosphere-card.selected {
  border-color: #409eff;
  background: #e3f2fd;
}

.atmosphere-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.atmosphere-name {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 8px;
}

.atmosphere-desc {
  font-size: 12px;
  color: #7f8c8d;
}

.opening-content {
  background: white;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  overflow: hidden;
}

.opening-text {
  padding: 20px;
  line-height: 1.8;
  color: #606266;
  white-space: pre-line;
  min-height: 200px;
}

.opening-actions {
  padding: 16px 20px;
  border-top: 1px solid #e4e7ed;
  background: #f8f9fa;
  display: flex;
  gap: 12px;
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.analysis-item {
  background: white;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.analysis-label {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 8px;
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
</style>
