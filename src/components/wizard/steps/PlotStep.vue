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
          <el-icon><Lightning /></el-icon>
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
import { Document, Lightning, Files, MagicStick, Check, Close } from '@element-plus/icons-vue'

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

const generateConflicts = async () => {
  generatingConflicts.value = true
  try {
    await emit('use-tool', 'conflict', {
      premise: localData.premise,
      mainConflict: localData.mainConflict,
      characters: props.wizardData.characterDesign,
      worldSetting: props.wizardData.worldBuilding
    })
    ElMessage.success('冲突体系生成完成')
  } catch (error) {
    ElMessage.error('生成失败')
  } finally {
    generatingConflicts.value = false
  }
}

const generateOutline = async () => {
  generatingOutline.value = true
  try {
    // 模拟生成细纲
    generatedOutline.value = [
      { title: '初遇', summary: '主角首次接触到神秘事件' },
      { title: '深入调查', summary: '主角开始深入调查，发现更多线索' },
      { title: '真相浮现', summary: '关键真相逐渐浮现，冲突激化' },
      { title: '最终对决', summary: '主角与反角的最终对决' },
      { title: '尘埃落定', summary: '事件得到解决，故事收尾' }
    ]
    
    localData.plotPoints = generatedOutline.value
    updateData('plotPoints', localData.plotPoints)
    ElMessage.success('章节细纲生成完成')
  } catch (error) {
    ElMessage.error('生成失败')
  } finally {
    generatingOutline.value = false
  }
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
