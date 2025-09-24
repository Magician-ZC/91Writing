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
            <el-icon><Location /></el-icon>
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
        
        <div class="section-actions">
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
          
          <el-button 
            type="primary" 
            @click="generateCoreRules"
            :loading="generatingRules"
            icon="MagicStick"
            :disabled="!localData.worldType"
          >
            AI生成核心规则
          </el-button>
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
                <el-icon><Star /></el-icon>
          力量体系
        </h3>
        <p class="section-desc">描述世界中的力量系统（如魔法、武功、科技等）</p>
        
        <div class="section-actions">
          <el-input
            v-model="localData.powerSystem"
            type="textarea"
            :rows="4"
            placeholder="详细描述力量体系的运作方式、等级划分、获得方法等..."
            @input="updateData('powerSystem', $event)"
          />
          
          <el-button 
            type="primary" 
            @click="generatePowerSystem"
            :loading="generatingPower"
            icon="MagicStick"
            :disabled="!localData.worldType"
            size="small"
            style="align-self: flex-start; margin-top: 8px;"
          >
            AI生成力量体系
          </el-button>
        </div>
      </div>
      
      <!-- 社会结构 -->
      <div class="form-section">
        <h3>
            <el-icon><OfficeBuilding /></el-icon>
          社会结构
        </h3>
        <p class="section-desc">描述社会的政治体制、阶层划分等</p>
        
        <div class="section-actions">
          <el-input
            v-model="localData.socialStructure"
            type="textarea"
            :rows="3"
            placeholder="描述政治体制、社会阶层、权力分配等..."
            @input="updateData('socialStructure', $event)"
          />
          
          <el-button 
            type="primary" 
            @click="generateSocialStructure"
            :loading="generatingSocial"
            icon="MagicStick"
            :disabled="!localData.worldType"
            size="small"
            style="align-self: flex-start; margin-top: 8px;"
          >
            AI生成社会结构
          </el-button>
        </div>
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
    
    <!-- 酒馆模式 -->
    <TavernManager
      ref="tavernManagerRef"
      :genre="props.wizardData.concept?.selectedGenre || '玄幻'"
      :enable-tavern-mode="isTavernMode"
      :current-step="'worldbuilding'"
      @mode-changed="onTavernModeChanged"
      @authors-changed="onAuthorsChanged"
      @discussion-started="onDiscussionStarted"
      @discussion-completed="onDiscussionCompleted"
      @proposal-selected="onProposalSelected"
    />
    
    <!-- 快速操作区 -->
    <div class="quick-actions">
      <h3>
        <el-icon><MagicStick /></el-icon>
        世界构建工具
      </h3>
      <p class="tools-desc">使用AI工具快速完善您的世界设定</p>
      
      <div class="action-buttons">
        <div class="action-item">
          <el-button 
            type="primary" 
            @click="enhancedGenerateWorldview"
            :loading="generatingWorld"
            icon="MagicStick"
            :disabled="!localData.worldType"
            size="large"
          >
            {{ isTavernMode ? '酒馆讨论生成世界观' : '生成详细世界观' }}
          </el-button>
          <p class="action-desc">基于已有设定，AI自动生成完整的世界观背景，包括历史、文化、地理等详细信息</p>
        </div>
        
        <div class="action-item">
          <el-button 
            type="info" 
            @click="analyzeConsistency"
            :loading="analyzingConsistency"
            icon="Checked"
            size="large"
          >
            检查设定一致性
          </el-button>
          <p class="action-desc">AI检查您的世界设定是否存在逻辑冲突，确保世界观的内在一致性和合理性</p>
        </div>
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
  Location,
  Expand,
  Document,
  Star,
  OfficeBuilding,
  MagicStick,
  Checked,
  Check,
  Close
} from '@element-plus/icons-vue'
import TavernManager from '@/components/tavern/TavernManager.vue'

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
const generatingRules = ref(false)
const generatingPower = ref(false)
const generatingSocial = ref(false)
const generatedWorldview = ref(null)
const activeWorldTab = ref('basic')

// 酒馆模式相关
const tavernManagerRef = ref(null)
const isTavernMode = ref(false)
const selectedAuthors = ref([])
const currentDiscussions = ref([])

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

const generateWorldview = () => {
  if (!localData.worldType) {
    ElMessage.warning('请先选择世界类型')
    return
  }
  
  // 检查组件状态
  if (!props.wizardData || !emit) {
    ElMessage.error('组件未正确初始化，请刷新页面重试')
    return
  }
  
  generatingWorld.value = true
  
  // 使用callback处理异步结果
  emit('use-tool', 'worldview', {
    worldType: localData.worldType,
    scale: localData.scale,
    coreRules: localData.coreRules,
    powerSystem: localData.powerSystem,
    conceptData: props.wizardData.concept
  }, (result, error) => {
    try {
      if (error) {
        console.error('工具调用异常:', error)
        throw error
      }
      
      console.log('世界观生成结果:', result)
      
      if (result && typeof result === 'object') {
        generatedWorldview.value = result
        ElMessage.success('世界观生成完成')
      } else {
        throw new Error('未收到有效的生成结果')
      }
    } catch (err) {
      console.error('生成世界观失败:', err)
      ElMessage.error('生成失败：' + (err.message || '未知错误'))
    } finally {
      generatingWorld.value = false
    }
  })
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

const generateCoreRules = () => {
  if (!localData.worldType) {
    ElMessage.warning('请先选择世界类型')
    return
  }
  
  generatingRules.value = true
  
  // 使用callback处理异步结果
  emit('use-tool', 'coreRules', {
    worldType: localData.worldType,
    scale: localData.scale,
    existingRules: localData.coreRules,
    conceptData: props.wizardData.concept
  }, (result, error) => {
    try {
      if (error) {
        throw error
      }
      
      if (result && result.rules) {
        // 添加生成的规则到现有规则中
        result.rules.forEach(rule => {
          if (!localData.coreRules.includes(rule)) {
            localData.coreRules.push(rule)
          }
        })
        updateData('coreRules', localData.coreRules)
        ElMessage.success(`成功生成 ${result.rules.length} 条核心规则`)
      } else {
        throw new Error('未收到有效的规则生成结果')
      }
    } catch (err) {
      console.error('生成核心规则失败:', err)
      ElMessage.error('生成失败：' + (err.message || '未知错误'))
    } finally {
      generatingRules.value = false
    }
  })
}

const generatePowerSystem = () => {
  if (!localData.worldType) {
    ElMessage.warning('请先选择世界类型')
    return
  }
  
  generatingPower.value = true
  
  // 使用callback处理异步结果
  emit('use-tool', 'powerSystem', {
    worldType: localData.worldType,
    scale: localData.scale,
    coreRules: localData.coreRules,
    conceptData: props.wizardData.concept
  }, (result, error) => {
    try {
      if (error) {
        throw error
      }
      
      if (result && result.description) {
        localData.powerSystem = result.description
        updateData('powerSystem', result.description)
        ElMessage.success('力量体系生成完成')
      } else {
        throw new Error('未收到有效的力量体系生成结果')
      }
    } catch (err) {
      console.error('生成力量体系失败:', err)
      ElMessage.error('生成失败：' + (err.message || '未知错误'))
    } finally {
      generatingPower.value = false
    }
  })
}

const generateSocialStructure = () => {
  if (!localData.worldType) {
    ElMessage.warning('请先选择世界类型')
    return
  }
  
  generatingSocial.value = true
  
  // 使用callback处理异步结果
  emit('use-tool', 'socialStructure', {
    worldType: localData.worldType,
    scale: localData.scale,
    coreRules: localData.coreRules,
    powerSystem: localData.powerSystem,
    conceptData: props.wizardData.concept
  }, (result, error) => {
    try {
      if (error) {
        throw error
      }
      
      if (result && result.description) {
        localData.socialStructure = result.description
        updateData('socialStructure', result.description)
        ElMessage.success('社会结构生成完成')
      } else {
        throw new Error('未收到有效的社会结构生成结果')
      }
    } catch (err) {
      console.error('生成社会结构失败:', err)
      ElMessage.error('生成失败：' + (err.message || '未知错误'))
    } finally {
      generatingSocial.value = false
    }
  })
}

const analyzeConsistency = () => {
  // 检查是否有足够的世界设定数据
  if (!localData.worldType || localData.coreRules.length === 0) {
    ElMessage.warning('请先完成基本的世界设定')
    return
  }
  
  analyzingConsistency.value = true
  
  // 使用callback处理异步结果
  emit('use-tool', 'consistency', {
    worldType: localData.worldType,
    coreRules: localData.coreRules,
    powerSystem: localData.powerSystem,
    socialStructure: localData.socialStructure,
    allWizardData: props.wizardData
  }, (result, error) => {
    try {
      if (error) {
        console.error('工具调用异常:', error)
        throw error
      }
      
      if (result) {
        ElMessage.success('设定一致性检查完成')
      } else {
        throw new Error('一致性检查失败')
      }
    } catch (err) {
      console.error('检查失败:', err)
      ElMessage.error('检查失败：' + (err.message || '未知错误'))
    } finally {
      analyzingConsistency.value = false
    }
  })
}

// 酒馆模式事件处理
const onTavernModeChanged = (enabled) => {
  isTavernMode.value = enabled
  console.log('酒馆模式状态:', enabled)
}

const onAuthorsChanged = (authors) => {
  selectedAuthors.value = authors
  console.log('选中的作者:', authors)
}

const onDiscussionStarted = (config) => {
  console.log('讨论开始:', config)
}

const onDiscussionCompleted = (result) => {
  console.log('世界构建讨论完成（事件监听）:', result)
  if (result && result.topProposals && result.topProposals.length > 0) {
    // 🔧 修复2：事件监听也使用智能分配逻辑
    const proposals = result.topProposals.slice(0, 4) // 取前4个方案
    
    if (result.topic.includes('世界观') || result.topic.includes('worldview')) {
      // 智能分配方案到世界观的4个部分
      const worldviewParts = {
        basic: '',
        history: '',
        culture: '',
        geography: ''
      }
      
      if (proposals.length >= 4) {
        // 如果有4个或更多方案，每个部分分配一个
        worldviewParts.basic = `${proposals[0].title || '基础世界架构'}\n\n${proposals[0].core || proposals[0].details}`
        worldviewParts.history = `${proposals[1].title || '历史发展脉络'}\n\n${proposals[1].core || proposals[1].details}`
        worldviewParts.culture = `${proposals[2].title || '文化传统体系'}\n\n${proposals[2].core || proposals[2].details}`
        worldviewParts.geography = `${proposals[3].title || '地理环境设定'}\n\n${proposals[3].core || proposals[3].details}`
      } else {
        // 如果方案少于4个，智能分配和扩展
        const topResult = proposals[0]
        const baseContent = topResult.core || topResult.details || '经过作者们深入讨论的世界设定'
        const title = topResult.title || '讨论生成的世界观'
        
        worldviewParts.basic = `${title} - 基本架构\n\n${baseContent}\n\n这个世界的基础运行机制和核心设定。`
        worldviewParts.history = `${title} - 历史沿革\n\n基于核心设定：${baseContent}\n\n历史的变迁塑造了当前世界的格局。`
        worldviewParts.culture = `${title} - 文化特色\n\n文化体系：${baseContent}\n\n独特的文化传统影响着人物的价值观。`
        worldviewParts.geography = `${title} - 环境地理\n\n地理环境：${baseContent}\n\n为故事发展提供了丰富的场景。`
        
        // 如果有更多方案，用来丰富内容
        if (proposals.length > 1) {
          worldviewParts.history += `\n\n补充历史：${proposals[1].core || proposals[1].details}`
          if (proposals.length > 2) {
            worldviewParts.culture += `\n\n文化细节：${proposals[2].core || proposals[2].details}`
          }
        }
      }
      
      // 更新生成的世界观
      generatedWorldview.value = {
        basic: worldviewParts.basic,
        history: worldviewParts.history,
        culture: worldviewParts.culture,
        geography: worldviewParts.geography
      }
      
      console.log('🎯 事件监听：世界观四个部分生成完成')
      ElMessage.success('酒馆讨论世界观已生成！每个部分都有独特内容')
    }
  }
}

const onProposalSelected = (proposal) => {
  console.log('WorldBuildingStep 收到选择的方案:', proposal)
  
  // 🔧 修复：应用选中的方案时，智能分配到4个不同部分
  const baseContent = proposal.core || proposal.details || proposal.title
  const title = proposal.title || '选中的世界观方案'
  
  generatedWorldview.value = {
    basic: `${title} - 基本架构\n\n${baseContent}\n\n这个世界的基础运行机制和核心设定为整个故事提供了坚实的基础。`,
    history: `${title} - 历史沿革\n\n基于核心设定发展而来的历史脉络：${baseContent}\n\n历史的变迁塑造了当前世界的格局和矛盾，为角色提供了深厚的背景。`,
    culture: `${title} - 文化特色\n\n在这样的世界背景下形成的文化体系：${baseContent}\n\n独特的文化传统影响着人物的行为和价值观，塑造了社会的运行方式。`,
    geography: `${title} - 环境地理\n\n与世界设定相匹配的地理环境：${baseContent}\n\n地理环境为故事发展提供了丰富的场景和可能性，影响着文明的发展。`
  }
  
  // 如果方案有额外的详细信息，添加到相应部分
  if (proposal.advantages) {
    generatedWorldview.value.culture += `\n\n${proposal.advantages}`
  }
  
  updateData('generatedWorldview', generatedWorldview.value)
  console.log('🎯 已智能分配选中方案到4个世界观部分')
  ElMessage.success(`已采用"${proposal.title}"世界观方案！每个部分都有独特内容`)
}

// 修改现有的生成方法以支持酒馆模式
const enhancedGenerateWorldview = async () => {
  if (!localData.worldType) {
    ElMessage.warning('请先选择世界类型')
    return
  }

  // 检查是否启用酒馆模式
  if (isTavernMode.value && tavernManagerRef.value) {
    generatingWorld.value = true
    
    try {
      const conceptData = props.wizardData.concept || {}
      
      // 🔧 修复1：确保核心创意完整传递，避免截断
      const coreIdeaFull = conceptData.coreIdea || '未设定创意'
      const coreIdeaPreview = coreIdeaFull.length > 100 ? coreIdeaFull.substring(0, 100) + '...' : coreIdeaFull
      
      const discussionConfig = {
        discussionId: `worldview-${Date.now()}`,
        topic: `基于创意"${coreIdeaPreview}"设计${localData.worldType}类型世界观`,
        context: `请各位作者基于以下完整信息，设计一个多层次的世界观体系：

【核心创意】
${coreIdeaFull}

【基础设定】
- 小说类型：${conceptData.selectedGenre || '玄幻'}
- 世界类型：${localData.worldType}
- 世界规模：${localData.scale || '中等'}
- 核心规则：${localData.coreRules.join('、') || '无'}
- 力量体系：${localData.powerSystem || '未设定'}

【创作要求】
请各位作者分工合作，分别从不同角度设计世界观：

第1位作者重点讨论：基本架构
- 世界的基础设定和运行机制
- 核心规则和力量体系
- 世界的基本运行逻辑

第2位作者重点讨论：历史背景  
- 重要的历史事件和时代变迁
- 影响世界格局的关键节点
- 当前时代的历史成因

第3位作者重点讨论：文化传统
- 社会文化、风俗习惯、价值观念
- 不同种族/地区的文化特色
- 宗教信仰和社会制度

第4位作者重点讨论：地理环境
- 地形地貌、气候环境、重要地点
- 地理对文明发展的影响
- 关键场景和地标建筑

请每位作者基于自己的专长领域，提出独特而详细的设定方案！`,
        backgroundInfo: {
          // 🔧 修复1：传递完整数据，不截断
          coreIdea: coreIdeaFull, // 完整的核心创意
          selectedGenre: conceptData.selectedGenre,
          brainstormResults: conceptData.brainstormResults,
          themes: conceptData.themes,
          targetAudience: conceptData.targetAudience,
          worldType: localData.worldType,
          scale: localData.scale,
          coreRules: localData.coreRules,
          powerSystem: localData.powerSystem,
          conceptData: conceptData
        }
      }
      
      const result = await tavernManagerRef.value.startDiscussion(discussionConfig)
      if (!result) {
        // 用户选择了直接生成，回退到单模型模式
        generateWorldview()
      } else {
        console.log('✅ 世界构建酒馆讨论启动成功')
        
        // 🔧 关键修复：处理讨论结果，智能分配到4个世界观部分
        if (result && result.topProposals && result.topProposals.length > 0) {
          console.log('📝 开始处理世界构建讨论结果...')
          
          // 🔧 修复2：使用所有方案，智能分配到不同部分
          const proposals = result.topProposals.slice(0, 4) // 取前4个方案
          
          // 智能分配方案到世界观的4个部分
          const worldviewParts = {
            basic: '',
            history: '',
            culture: '',
            geography: ''
          }
          
          if (proposals.length >= 4) {
            // 如果有4个或更多方案，每个部分分配一个
            worldviewParts.basic = `${proposals[0].title || '基础世界架构'}\n\n${proposals[0].core || proposals[0].details}`
            worldviewParts.history = `${proposals[1].title || '历史发展脉络'}\n\n${proposals[1].core || proposals[1].details}`
            worldviewParts.culture = `${proposals[2].title || '文化传统体系'}\n\n${proposals[2].core || proposals[2].details}`
            worldviewParts.geography = `${proposals[3].title || '地理环境设定'}\n\n${proposals[3].core || proposals[3].details}`
          } else {
            // 如果方案少于4个，智能分配和扩展
            const topResult = proposals[0]
            const baseContent = topResult.core || topResult.details || '经过作者们深入讨论的世界设定'
            const title = topResult.title || '讨论生成的世界观'
            
            worldviewParts.basic = `${title} - 基本架构\n\n${baseContent}\n\n这个世界的基础运行机制和核心设定为整个故事提供了坚实的基础。`
            worldviewParts.history = `${title} - 历史沿革\n\n基于核心设定发展而来的历史脉络：${baseContent}\n\n历史的变迁塑造了当前世界的格局和矛盾。`
            worldviewParts.culture = `${title} - 文化特色\n\n在这样的世界背景下形成的文化体系：${baseContent}\n\n独特的文化传统影响着人物的行为和价值观。`
            worldviewParts.geography = `${title} - 环境地理\n\n与世界设定相匹配的地理环境：${baseContent}\n\n地理环境为故事发展提供了丰富的场景和可能性。`
            
            // 如果有更多方案，用来丰富内容
            if (proposals.length > 1) {
              worldviewParts.history += `\n\n补充历史要素：${proposals[1].core || proposals[1].details}`
              if (proposals.length > 2) {
                worldviewParts.culture += `\n\n文化细节：${proposals[2].core || proposals[2].details}`
              }
            }
          }
          
          // 🔧 修复2：更新生成的世界观数据结构
          generatedWorldview.value = {
            basic: worldviewParts.basic,
            history: worldviewParts.history,
            culture: worldviewParts.culture,
            geography: worldviewParts.geography
          }
          
          // 同时更新基础字段
          localData.worldType = proposals[0].title || '讨论确定的世界类型'
          localData.powerSystem = proposals[0].core || '讨论生成的力量体系'
          localData.socialStructure = proposals[0].advantages || '经过作者们讨论的社会结构'
          
          // 更新界面数据
          updateData('worldType', localData.worldType)
          updateData('powerSystem', localData.powerSystem) 
          updateData('socialStructure', localData.socialStructure)
          
          console.log('🎯 世界观四个部分生成完成:', generatedWorldview.value)
          ElMessage.success(`世界构建讨论完成！生成了完整的"${localData.worldType}"世界观体系`)
        } else {
          console.warn('⚠️ 世界构建讨论结果格式异常:', result)
        }
      }
    } catch (error) {
      console.error('酒馆模式生成失败:', error)
      ElMessage.error('酒馆模式生成失败，回退到单模型模式')
      generateWorldview()
    } finally {
      generatingWorld.value = false
    }
  } else {
    generateWorldview()
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

.section-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rules-input {
  margin-bottom: 0;
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
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #2c3e50;
}

.tools-desc {
  color: #7f8c8d;
  font-size: 14px;
  margin-bottom: 20px;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.action-desc {
  color: #7f8c8d;
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
  max-width: 500px;
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
