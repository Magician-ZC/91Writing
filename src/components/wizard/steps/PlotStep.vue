<template>
  <div class="plot-step">
    <div class="step-header">
      <h2>步骤 4: 情节架构</h2>
      <p>设计故事结构和冲突体系</p>
    </div>
    
    <div class="step-content">
      <!-- 故事前提 -->
      <div class="form-section">
        <h3>
          <el-icon><Document /></el-icon>
          故事前提
          <span class="required">*</span>
        </h3>
        <p class="section-desc">用一句话概括您的故事核心</p>
        
        <el-input
          v-model="localData.premise"
          type="textarea"
          :rows="3"
          placeholder="例如：一个能进入他人梦境的侦探，必须在梦境与现实之间找到连环杀手的真相..."
          @input="updateData('premise', $event)"
        />
      </div>
      
      <!-- 主要冲突 -->
      <div class="form-section">
        <h3>
            <el-icon><Star /></el-icon>
          主要冲突
          <span class="required">*</span>
        </h3>
        <p class="section-desc">描述故事的核心矛盾</p>
        
        <el-input
          v-model="localData.mainConflict"
          type="textarea"
          :rows="3"
          placeholder="描述主角面对的主要挑战和阻碍..."
          @input="updateData('mainConflict', $event)"
        />
      </div>
      
      <!-- 三幕结构 -->
      <div class="form-section">
        <h3>
          <el-icon><Files /></el-icon>
          三幕结构
        </h3>
        <p class="section-desc">经典的故事结构框架</p>
        
        <el-tabs v-model="activeTab">
          <el-tab-pane label="第一幕：建立" name="act1">
            <div class="act-content">
              <el-form-item label="背景设定">
                <el-input 
                  v-model="localData.threeActStructure.act1.setup"
                  type="textarea"
                  :rows="2"
                  @input="updateThreeAct"
                />
              </el-form-item>
              <el-form-item label="激励事件">
                <el-input 
                  v-model="localData.threeActStructure.act1.incitingIncident"
                  type="textarea"
                  :rows="2"
                  @input="updateThreeAct"
                />
              </el-form-item>
              <el-form-item label="情节点1">
                <el-input 
                  v-model="localData.threeActStructure.act1.plotPoint1"
                  type="textarea"
                  :rows="2"
                  @input="updateThreeAct"
                />
              </el-form-item>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="第二幕：发展" name="act2">
            <div class="act-content">
              <el-form-item label="对抗发展">
                <el-input 
                  v-model="localData.threeActStructure.act2.confrontation"
                  type="textarea"
                  :rows="2"
                  @input="updateThreeAct"
                />
              </el-form-item>
              <el-form-item label="中点转折">
                <el-input 
                  v-model="localData.threeActStructure.act2.midpoint"
                  type="textarea"
                  :rows="2"
                  @input="updateThreeAct"
                />
              </el-form-item>
              <el-form-item label="情节点2">
                <el-input 
                  v-model="localData.threeActStructure.act2.plotPoint2"
                  type="textarea"
                  :rows="2"
                  @input="updateThreeAct"
                />
              </el-form-item>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="第三幕：解决" name="act3">
            <div class="act-content">
              <el-form-item label="高潮对决">
                <el-input 
                  v-model="localData.threeActStructure.act3.climax"
                  type="textarea"
                  :rows="2"
                  @input="updateThreeAct"
                />
              </el-form-item>
              <el-form-item label="下降动作">
                <el-input 
                  v-model="localData.threeActStructure.act3.fallingAction"
                  type="textarea"
                  :rows="2"
                  @input="updateThreeAct"
                />
              </el-form-item>
              <el-form-item label="结局">
                <el-input 
                  v-model="localData.threeActStructure.act3.resolution"
                  type="textarea"
                  :rows="2"
                  @input="updateThreeAct"
                />
              </el-form-item>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      
      <!-- 生成的细纲 -->
      <div class="form-section" v-if="generatedOutline.length">
        <h3>
          <el-icon><MagicStick /></el-icon>
          章节细纲
        </h3>
        
        <div class="outline-list">
          <div 
            v-for="(chapter, index) in generatedOutline"
            :key="index"
            class="chapter-item"
          >
            <div class="chapter-header">
              <h4>第{{ index + 1 }}章：{{ chapter.title }}</h4>
            </div>
            <div class="chapter-content">
              <p>{{ chapter.summary }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 快速操作 -->
    <div class="quick-actions">
      <h3>情节设计工具</h3>
      <div class="action-buttons">
        <el-button 
          type="primary" 
          @click="generateConflicts"
          :loading="generatingConflicts"
        >
          生成冲突体系
        </el-button>
        
        <el-button 
          type="info" 
          @click="generateOutline"
          :loading="generatingOutline"
          :disabled="!localData.premise || !localData.mainConflict"
        >
          生成章节细纲
        </el-button>
      </div>
    </div>
    
    <!-- 酒馆模式 -->
    <TavernManager
      ref="tavernManagerRef"
      :genre="props.wizardData.concept?.selectedGenre || '玄幻'"
      :enable-tavern-mode="isTavernMode"
      :current-step="'plot'"
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
        <div class="required-item" :class="{ completed: localData.premise }">
          <el-icon>
            <Check v-if="localData.premise" />
            <Close v-else />
          </el-icon>
          故事前提
        </div>
        <div class="required-item" :class="{ completed: localData.mainConflict }">
          <el-icon>
            <Check v-if="localData.mainConflict" />
            <Close v-else />
          </el-icon>
          主要冲突
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Star, Files, MagicStick, Check, Close } from '@element-plus/icons-vue'
import TavernManager from '@/components/tavern/TavernManager.vue'

const props = defineProps({
  stepData: { type: Object, default: () => ({}) },
  wizardData: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update-data', 'use-tool'])

const localData = reactive({
  premise: '',
  mainConflict: '',
  threeActStructure: {
    act1: { setup: '', incitingIncident: '', plotPoint1: '' },
    act2: { confrontation: '', midpoint: '', plotPoint2: '' },
    act3: { climax: '', fallingAction: '', resolution: '' }
  },
  plotPoints: [],
  conflictLayers: [],
  pacing: {},
  ...props.stepData
})

const activeTab = ref('act1')
const generatingConflicts = ref(false)
const generatingOutline = ref(false)
const generatedOutline = ref([])

// 酒馆模式相关
const tavernManagerRef = ref(null)
const isTavernMode = ref(false)
const selectedAuthors = ref([])
const currentDiscussions = ref([])

const completionPercentage = computed(() => {
  let completed = 0
  if (localData.premise?.trim()) completed += 50
  if (localData.mainConflict?.trim()) completed += 50
  return completed
})

const updateData = (field, value) => {
  localData[field] = value
  emit('update-data', 'plotStructure', field, value)
}

const updateThreeAct = () => {
  updateData('threeActStructure', localData.threeActStructure)
}

const generateConflicts = () => {
  if (!localData.premise?.trim() || !localData.mainConflict?.trim()) {
    ElMessage.warning('请先填写故事前提和主要冲突')
    return
  }
  
  // 检查组件状态
  if (!props.wizardData || !emit) {
    ElMessage.error('组件未正确初始化，请刷新页面重试')
    return
  }
  
  generatingConflicts.value = true
  
  // 使用callback处理异步结果
  emit('use-tool', 'conflict', {
    premise: localData.premise,
    mainConflict: localData.mainConflict,
    characters: props.wizardData.characterDesign,
    worldSetting: props.wizardData.worldBuilding
  }, (result, error) => {
    try {
      if (error) {
        console.error('工具调用异常:', error)
        throw error
      }
      
      console.log('冲突体系生成结果:', result)
      
      if (result) {
        // 处理冲突结果
        if (typeof result === 'object' && result.conflictLayers) {
          localData.conflictLayers = result.conflictLayers
          updateData('conflictLayers', localData.conflictLayers)
        }
        ElMessage.success('冲突体系生成完成')
      } else {
        throw new Error('未收到有效的生成结果')
      }
    } catch (err) {
      console.error('生成冲突体系失败:', err)
      ElMessage.error('生成失败：' + (err.message || '未知错误'))
    } finally {
      generatingConflicts.value = false
    }
  })
}

const generateOutline = () => {
  if (!localData.premise?.trim() || !localData.mainConflict?.trim()) {
    ElMessage.warning('请先填写故事前提和主要冲突')
    return
  }
  
  // 检查组件状态
  if (!props.wizardData || !emit) {
    ElMessage.error('组件未正确初始化，请刷新页面重试')
    return
  }
  
  generatingOutline.value = true
  
  // 使用callback处理异步结果
  emit('use-tool', 'outline', {
    premise: localData.premise,
    mainConflict: localData.mainConflict,
    threeActStructure: localData.threeActStructure,
    characters: props.wizardData.characterDesign,
    worldSetting: props.wizardData.worldBuilding,
    conflictLayers: localData.conflictLayers
  }, (result, error) => {
    try {
      if (error) {
        console.error('工具调用异常:', error)
        throw error
      }
      
      console.log('章节细纲生成结果:', result)
      
      if (result && Array.isArray(result.chapters)) {
        generatedOutline.value = result.chapters
        localData.plotPoints = generatedOutline.value
        updateData('plotPoints', localData.plotPoints)
        ElMessage.success(`章节细纲生成完成，共生成 ${generatedOutline.value.length} 章`)
      } else if (Array.isArray(result)) {
        generatedOutline.value = result
        localData.plotPoints = generatedOutline.value
        updateData('plotPoints', localData.plotPoints)
        ElMessage.success(`章节细纲生成完成，共生成 ${generatedOutline.value.length} 章`)
      } else {
        throw new Error('未收到有效的生成结果')
      }
    } catch (err) {
      console.error('生成章节细纲失败:', err)
      ElMessage.error('生成失败：' + (err.message || '未知错误'))
    } finally {
      generatingOutline.value = false
    }
  })
}

// 酒馆模式事件处理
const onTavernModeChanged = (enabled) => {
  isTavernMode.value = enabled
  console.log('情节架构酒馆模式状态:', enabled)
}

const onAuthorsChanged = (authors) => {
  if (JSON.stringify(authors) !== JSON.stringify(selectedAuthors.value)) {
    selectedAuthors.value = authors
    console.log('情节架构选中的作者已更新:', authors)
  }
}

const onDiscussionStarted = (config) => {
  console.log('情节架构讨论开始:', config)
}

const onDiscussionCompleted = (result) => {
  console.log('情节架构讨论完成:', result)
  if (result && result.topProposals && result.topProposals.length > 0) {
    const topResult = result.topProposals[0]
    
    // 应用情节架构结果
    localData.premise = topResult.core || topResult.title
    localData.mainConflict = topResult.details
    updateData('premise', localData.premise)
    updateData('mainConflict', localData.mainConflict)
    ElMessage.success('酒馆讨论情节架构已生成')
  }
}

const onProposalSelected = (proposal) => {
  console.log('情节架构收到选择的方案:', proposal)
  
  // 应用选中的情节架构方案
  localData.premise = proposal.core || proposal.title
  localData.mainConflict = proposal.details
  updateData('premise', localData.premise)
  updateData('mainConflict', localData.mainConflict)
  ElMessage.success(`已采用"${proposal.title}"情节架构方案！`)
}

watch(() => props.stepData, (newData) => {
  Object.assign(localData, newData)
}, { deep: true, immediate: true })
</script>

<style scoped>
.plot-step {
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

.act-content {
  padding: 16px 0;
}

.outline-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chapter-item {
  background: white;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.chapter-header h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.chapter-content p {
  margin: 0;
  color: #606266;
  line-height: 1.6;
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
