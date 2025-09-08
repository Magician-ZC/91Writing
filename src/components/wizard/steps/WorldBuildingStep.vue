<template>
  <div class="worldbuilding-step">
    <div class="step-header">
      <h2>步骤 2: 世界构建</h2>
      <p>构建小说的世界观和背景设定</p>
    </div>
    
    <div class="step-content">
      <!-- 世界类型选择 -->
      <div class="form-section">
        <h3>
          <el-icon><Globe /></el-icon>
          世界类型
          <span class="required">*</span>
        </h3>
        <p class="section-desc">选择您小说的世界背景类型</p>
        
        <div class="world-type-grid">
          <div 
            v-for="type in worldTypes" 
            :key="type.value"
            class="world-type-card"
            :class="{ selected: localData.worldType === type.value }"
            @click="selectWorldType(type.value)"
          >
            <div class="type-icon">{{ type.icon }}</div>
            <div class="type-name">{{ type.label }}</div>
            <div class="type-desc">{{ type.description }}</div>
          </div>
        </div>
      </div>
      
      <!-- 世界规模 -->
      <div class="form-section">
        <h3>
          <el-icon><Expand /></el-icon>
          世界规模
        </h3>
        <p class="section-desc">确定故事发生的地理范围</p>
        
        <el-select 
          v-model="localData.scale" 
          placeholder="选择世界规模"
          @change="updateData('scale', $event)"
          style="width: 100%"
        >
          <el-option
            v-for="scale in scaleOptions"
            :key="scale.value"
            :label="scale.label"
            :value="scale.value"
          >
            <div class="scale-option">
              <span class="scale-name">{{ scale.label }}</span>
              <span class="scale-desc">{{ scale.description }}</span>
            </div>
          </el-option>
        </el-select>
      </div>
      
      <!-- 核心规则 -->
      <div class="form-section">
        <h3>
          <el-icon><Document /></el-icon>
          核心规则
          <span class="required">*</span>
        </h3>
        <p class="section-desc">定义这个世界的基本运行规则</p>
        
        <div class="rules-input">
          <el-input
            v-model="newRule"
            placeholder="输入世界规则，例如：魔法需要消耗生命力"
            @keyup.enter="addRule"
          >
            <template #append>
              <el-button @click="addRule" :disabled="!newRule.trim()">
                添加
              </el-button>
            </template>
          </el-input>
        </div>
        
        <div class="rules-list" v-if="localData.coreRules.length">
          <div 
            v-for="(rule, index) in localData.coreRules"
            :key="index"
            class="rule-item"
          >
            <span class="rule-text">{{ rule }}</span>
            <el-button 
              size="small" 
              type="danger" 
              text
              @click="removeRule(index)"
            >
              删除
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 力量体系 -->
      <div class="form-section">
        <h3>
          <el-icon><Lightning /></el-icon>
          力量体系
        </h3>
        <p class="section-desc">描述世界中的力量系统（如魔法、武功、科技等）</p>
        
        <el-input
          v-model="localData.powerSystem"
          type="textarea"
          :rows="4"
          placeholder="详细描述力量体系的运作方式、等级划分、获得方法等..."
          @input="updateData('powerSystem', $event)"
        />
      </div>
      
      <!-- 社会结构 -->
      <div class="form-section">
        <h3>
          <el-icon><Office /></el-icon>
          社会结构
        </h3>
        <p class="section-desc">描述社会的政治体制、阶层划分等</p>
        
        <el-input
          v-model="localData.socialStructure"
          type="textarea"
          :rows="3"
          placeholder="描述政治体制、社会阶层、权力分配等..."
          @input="updateData('socialStructure', $event)"
        />
      </div>
      
      <!-- AI生成的世界观 -->
      <div class="form-section" v-if="generatedWorldview">
        <h3>
          <el-icon><MagicStick /></el-icon>
          AI生成的世界观
        </h3>
        <p class="section-desc">基于您的设定生成的详细世界观</p>
        
        <div class="generated-worldview">
          <el-tabs v-model="activeWorldTab">
            <el-tab-pane label="基本架构" name="basic">
              <div class="worldview-content">{{ generatedWorldview.basic }}</div>
            </el-tab-pane>
            <el-tab-pane label="历史背景" name="history">
              <div class="worldview-content">{{ generatedWorldview.history }}</div>
            </el-tab-pane>
            <el-tab-pane label="文化传统" name="culture">
              <div class="worldview-content">{{ generatedWorldview.culture }}</div>
            </el-tab-pane>
            <el-tab-pane label="地理环境" name="geography">
              <div class="worldview-content">{{ generatedWorldview.geography }}</div>
            </el-tab-pane>
          </el-tabs>
          
          <div class="worldview-actions">
            <el-button type="primary" @click="applyWorldview">
              应用此世界观
            </el-button>
            <el-button @click="regenerateWorldview" :loading="generatingWorld">
              重新生成
            </el-button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 快速操作区 -->
    <div class="quick-actions">
      <h3>世界构建工具</h3>
      <div class="action-buttons">
        <el-button 
          type="primary" 
          @click="generateWorldview"
          :loading="generatingWorld"
          icon="MagicStick"
          :disabled="!localData.worldType"
        >
          生成详细世界观
        </el-button>
        
        <el-button 
          type="info" 
          @click="analyzeConsistency"
          :loading="analyzingConsistency"
          icon="DocumentChecked"
        >
          检查设定一致性
        </el-button>
      </div>
    </div>
    
    <!-- 完成状态 -->
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
          :class="{ completed: localData.worldType }"
        >
          <el-icon>
            <Check v-if="localData.worldType" />
            <Close v-else />
          </el-icon>
          世界类型
        </div>
        <div 
          class="required-item"
          :class="{ completed: localData.coreRules.length > 0 }"
        >
          <el-icon>
            <Check v-if="localData.coreRules.length > 0" />
            <Close v-else />
          </el-icon>
          核心规则
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Globe,
  Expand,
  Document,
  Lightning,
  Office,
  MagicStick,
  DocumentChecked,
  Check,
  Close
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
const emit = defineEmits(['update-data', 'use-tool'])

// 本地数据
const localData = reactive({
  worldType: '',
  scale: '',
  coreRules: [],
  powerSystem: '',
  socialStructure: '',
  geography: '',
  history: '',
  culture: '',
  technology: '',
  ...props.stepData
})

// 响应式数据
const newRule = ref('')
const generatingWorld = ref(false)
const analyzingConsistency = ref(false)
const generatedWorldview = ref(null)
const activeWorldTab = ref('basic')

// 世界类型选项
const worldTypes = [
  {
    value: 'fantasy',
    label: '奇幻世界',
    icon: '🏰',
    description: '魔法、龙、精灵等奇幻元素'
  },
  {
    value: 'scifi',
    label: '科幻未来',
    icon: '🚀',
    description: '高科技、太空、AI等科幻元素'
  },
  {
    value: 'modern',
    label: '现代都市',
    icon: '🏙️',
    description: '当代背景，现实世界设定'
  },
  {
    value: 'historical',
    label: '历史古代',
    icon: '🏛️',
    description: '古代历史背景'
  },
  {
    value: 'apocalypse',
    label: '末世废土',
    icon: '☢️',
    description: '末日后的世界'
  },
  {
    value: 'parallel',
    label: '平行世界',
    icon: '🌌',
    description: '与现实相似但有差异的世界'
  }
]

// 规模选项
const scaleOptions = [
  {
    value: 'city',
    label: '单一城市',
    description: '故事发生在一个城市范围内'
  },
  {
    value: 'region',
    label: '地区范围',
    description: '涵盖一个地区或省份'
  },
  {
    value: 'continent',
    label: '大陆级别',
    description: '整个大陆或国家'
  },
  {
    value: 'planet',
    label: '星球范围',
    description: '整个星球或多个星球'
  },
  {
    value: 'universe',
    label: '宇宙级别',
    description: '多元宇宙或无限空间'
  }
]

// 计算属性
const completionPercentage = computed(() => {
  let completed = 0
  let total = 2
  
  if (localData.worldType) completed++
  if (localData.coreRules.length > 0) completed++
  
  return Math.round((completed / total) * 100)
})

// 方法
const updateData = (field, value) => {
  localData[field] = value
  emit('update-data', 'worldBuilding', field, value)
}

const selectWorldType = (type) => {
  localData.worldType = type
  updateData('worldType', type)
}

const addRule = () => {
  const rule = newRule.value.trim()
  if (rule && !localData.coreRules.includes(rule)) {
    localData.coreRules.push(rule)
    updateData('coreRules', localData.coreRules)
    newRule.value = ''
    ElMessage.success('规则已添加')
  }
}

const removeRule = (index) => {
  localData.coreRules.splice(index, 1)
  updateData('coreRules', localData.coreRules)
}

const generateWorldview = async () => {
  if (!localData.worldType) {
    ElMessage.warning('请先选择世界类型')
    return
  }
  
  generatingWorld.value = true
  try {
    const result = await emit('use-tool', 'worldview', {
      worldType: localData.worldType,
      scale: localData.scale,
      coreRules: localData.coreRules,
      powerSystem: localData.powerSystem,
      conceptData: props.wizardData.concept
    })
    
    // 模拟生成的世界观数据
    generatedWorldview.value = {
      basic: '这是一个魔法与科技并存的世界，古老的魔法传统与现代科技发生激烈碰撞...',
      history: '千年前，第一批魔法师发现了魔法能量的存在，从此改变了整个世界的发展轨迹...',
      culture: '社会分为魔法师阶层和普通人阶层，两个群体之间存在复杂的关系...',
      geography: '世界由七大大陆组成，每个大陆都有独特的地理环境和魔法特性...'
    }
    
    ElMessage.success('世界观生成完成')
  } catch (error) {
    console.error('生成世界观失败:', error)
    ElMessage.error('生成失败')
  } finally {
    generatingWorld.value = false
  }
}

const applyWorldview = () => {
  if (!generatedWorldview.value) return
  
  // 应用生成的世界观到本地数据
  Object.keys(generatedWorldview.value).forEach(key => {
    if (localData.hasOwnProperty(key)) {
      localData[key] = generatedWorldview.value[key]
      updateData(key, generatedWorldview.value[key])
    }
  })
  
  ElMessage.success('世界观已应用')
}

const regenerateWorldview = () => {
  generateWorldview()
}

const analyzeConsistency = async () => {
  analyzingConsistency.value = true
  try {
    // 模拟一致性检查
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('设定一致性检查完成，未发现冲突')
  } catch (error) {
    ElMessage.error('检查失败')
  } finally {
    analyzingConsistency.value = false
  }
}

// 监听数据变化
watch(() => props.stepData, (newData) => {
  Object.assign(localData, newData)
}, { deep: true, immediate: true })
</script>

<style scoped>
.worldbuilding-step {
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

.world-type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.world-type-card {
  padding: 20px;
  background: white;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.world-type-card:hover {
  border-color: #409eff;
  transform: translateY(-2px);
}

.world-type-card.selected {
  border-color: #409eff;
  background: #e3f2fd;
}

.type-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.type-name {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 8px;
}

.type-desc {
  font-size: 12px;
  color: #7f8c8d;
}

.scale-option {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.scale-name {
  font-weight: 500;
}

.scale-desc {
  font-size: 12px;
  color: #7f8c8d;
}

.rules-input {
  margin-bottom: 16px;
}

.rules-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rule-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.rule-text {
  flex: 1;
  color: #606266;
}

.generated-worldview {
  background: white;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  overflow: hidden;
}

.worldview-content {
  padding: 20px;
  min-height: 200px;
  line-height: 1.8;
  color: #606266;
}

.worldview-actions {
  padding: 16px 20px;
  border-top: 1px solid #e4e7ed;
  background: #f8f9fa;
  display: flex;
  gap: 12px;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .world-type-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .required-items {
    flex-direction: column;
    gap: 8px;
  }
  
  .worldview-actions {
    flex-direction: column;
  }
}
</style>
