<template>
  <div class="character-step">
    <div class="step-header">
      <h2>步骤 3: 角色设计</h2>
      <p>创建主要角色和人物关系网络</p>
    </div>
    
    <div class="step-content">
      <!-- 主角设计 -->
      <div class="form-section">
        <h3>
          <el-icon><Avatar /></el-icon>
          主角设计
          <span class="required">*</span>
        </h3>
        <p class="section-desc">设计故事的主要角色</p>
        
        <div class="character-form" v-if="localData.protagonist">
          <el-form :model="localData.protagonist" label-width="100px">
            <el-form-item label="姓名">
              <el-input v-model="localData.protagonist.name" @input="updateProtagonist" />
            </el-form-item>
            <el-form-item label="年龄">
              <el-input v-model="localData.protagonist.age" @input="updateProtagonist" />
            </el-form-item>
            <el-form-item label="性格特点">
              <el-input 
                v-model="localData.protagonist.personality" 
                type="textarea" 
                :rows="3"
                @input="updateProtagonist"
              />
            </el-form-item>
          </el-form>
        </div>
        
        <el-button 
          v-else
          type="primary" 
          @click="enhancedGenerateProtagonist"
          :loading="generatingProtagonist"
        >
          <el-icon><MagicStick /></el-icon>
          {{ isTavernMode ? '酒馆讨论设计主角' : '生成主角' }}
        </el-button>
      </div>
      
      <!-- 配角列表 -->
      <div class="form-section">
        <h3>
          <el-icon><User /></el-icon>
          配角角色
        </h3>
        
        <div class="supporting-characters">
          <div 
            v-for="(character, index) in localData.supporting"
            :key="character.id"
            class="character-card"
          >
            <div class="character-info">
              <h4>{{ character.name || '未命名角色' }}</h4>
              <p>{{ character.personality || '暂无描述' }}</p>
            </div>
            <el-button 
              size="small" 
              type="danger" 
              @click="removeCharacter('supporting', index)"
            >
              删除
            </el-button>
          </div>
        </div>
        
        <el-button @click="generateSupportingCharacters">
          <el-icon><Plus /></el-icon>
          添加配角
        </el-button>
      </div>
    </div>
    
    <!-- 酒馆模式 -->
    <TavernManager
      ref="tavernManagerRef"
      :genre="props.wizardData.concept?.selectedGenre || '玄幻'"
      :enable-tavern-mode="isTavernMode"
      @mode-changed="onTavernModeChanged"
      @authors-changed="onAuthorsChanged"
      @discussion-started="onDiscussionStarted"
      @discussion-completed="onDiscussionCompleted"
      @proposal-selected="onProposalSelected"
    />
    
    <!-- 快速操作 -->
    <div class="quick-actions">
      <h3>角色创建工具</h3>
      <div class="action-buttons">
        <el-button 
          type="primary" 
          @click="enhancedGenerateProtagonist"
          :loading="generatingProtagonist"
        >
          {{ isTavernMode ? '酒馆讨论设计主角' : '生成主角' }}
        </el-button>
        
        <el-button 
          type="info" 
          @click="generateSupportingCharacters"
          :loading="generatingSupporting"
        >
          生成配角
        </el-button>
        
        <el-button 
          type="warning" 
          @click="generateAntagonist"
          :loading="generatingAntagonist"
        >
          生成反角
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
        <div class="required-item" :class="{ completed: localData.protagonist }">
          <el-icon>
            <Check v-if="localData.protagonist" />
            <Close v-else />
          </el-icon>
          主角设计
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Avatar, User, MagicStick, Plus, Check, Close } from '@element-plus/icons-vue'
import TavernManager from '@/components/tavern/TavernManager.vue'

const props = defineProps({
  stepData: { type: Object, default: () => ({}) },
  wizardData: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update-data', 'use-tool'])

const localData = reactive({
  protagonist: null,
  supporting: [],
  antagonist: null,
  background: [],
  relationships: [],
  characterArcs: [],
  ...props.stepData
})

const generatingProtagonist = ref(false)
const generatingSupporting = ref(false)
const generatingAntagonist = ref(false)

// 酒馆模式相关
const tavernManagerRef = ref(null)
const isTavernMode = ref(false)
const selectedAuthors = ref([])
const currentDiscussions = ref([])

const completionPercentage = computed(() => {
  return localData.protagonist ? 100 : 0
})

const updateData = (field, value) => {
  localData[field] = value
  emit('update-data', 'characterDesign', field, value)
}

const updateProtagonist = () => {
  updateData('protagonist', localData.protagonist)
}

const generateProtagonist = () => {
  // 检查组件状态
  if (!props.wizardData || !emit) {
    ElMessage.error('组件未正确初始化，请刷新页面重试')
    return
  }
  
  generatingProtagonist.value = true
  
  // 使用callback处理异步结果
  emit('use-tool', 'character', {
    role: 'protagonist',
    count: 1,
    contextData: props.wizardData
  }, (result, error) => {
    try {
      if (error) {
        console.error('工具调用异常:', error)
        throw error
      }
      
      console.log('主角生成结果:', result)
      
      if (result && typeof result === 'object') {
        localData.protagonist = {
          id: Date.now(),
          ...result
        }
        updateData('protagonist', localData.protagonist)
        ElMessage.success('主角生成完成')
      } else {
        throw new Error('未收到有效的生成结果')
      }
    } catch (err) {
      console.error('生成主角失败:', err)
      ElMessage.error('生成失败：' + (err.message || '未知错误'))
    } finally {
      generatingProtagonist.value = false
    }
  })
}

const generateSupportingCharacters = () => {
  // 检查组件状态
  if (!props.wizardData || !emit) {
    ElMessage.error('组件未正确初始化，请刷新页面重试')
    return
  }
  
  generatingSupporting.value = true
  
  // 使用callback处理异步结果
  emit('use-tool', 'character', {
    role: 'supporting',
    count: 1,
    contextData: props.wizardData,
    protagonist: localData.protagonist
  }, (result, error) => {
    try {
      if (error) {
        console.error('工具调用异常:', error)
        throw error
      }
      
      console.log('配角生成结果:', result)
      
      if (result && typeof result === 'object') {
        const newCharacter = {
          id: Date.now(),
          role: 'supporting',
          ...result
        }
        
        localData.supporting.push(newCharacter)
        updateData('supporting', localData.supporting)
        ElMessage.success('配角生成完成')
      } else {
        throw new Error('未收到有效的生成结果')
      }
    } catch (err) {
      console.error('生成配角失败:', err)
      ElMessage.error('生成失败：' + (err.message || '未知错误'))
    } finally {
      generatingSupporting.value = false
    }
  })
}

const generateAntagonist = () => {
  // 检查组件状态
  if (!props.wizardData || !emit) {
    ElMessage.error('组件未正确初始化，请刷新页面重试')
    return
  }
  
  generatingAntagonist.value = true
  
  // 使用callback处理异步结果
  emit('use-tool', 'character', {
    role: 'antagonist',
    count: 1,
    contextData: props.wizardData,
    protagonist: localData.protagonist
  }, (result, error) => {
    try {
      if (error) {
        console.error('工具调用异常:', error)
        throw error
      }
      
      console.log('反角生成结果:', result)
      
      if (result && typeof result === 'object') {
        localData.antagonist = {
          id: Date.now(),
          ...result
        }
        
        updateData('antagonist', localData.antagonist)
        ElMessage.success('反角生成完成')
      } else {
        throw new Error('未收到有效的生成结果')
      }
    } catch (err) {
      console.error('生成反角失败:', err)
      ElMessage.error('生成失败：' + (err.message || '未知错误'))
    } finally {
      generatingAntagonist.value = false
    }
  })
}

const removeCharacter = (type, index) => {
  localData[type].splice(index, 1)
  updateData(type, localData[type])
}

// 酒馆模式事件处理
const onTavernModeChanged = (enabled) => {
  isTavernMode.value = enabled
  console.log('角色设计酒馆模式状态:', enabled)
}

const onAuthorsChanged = (authors) => {
  if (JSON.stringify(authors) !== JSON.stringify(selectedAuthors.value)) {
    selectedAuthors.value = authors
    console.log('角色设计选中的作者已更新:', authors)
  }
}

const onDiscussionStarted = (config) => {
  console.log('角色设计讨论开始:', config)
}

const onDiscussionCompleted = (result) => {
  console.log('角色设计讨论完成:', result)
  if (result && result.topProposals && result.topProposals.length > 0) {
    const topResult = result.topProposals[0]
    
    // 根据讨论主题应用结果到角色设计
    try {
      const characterData = JSON.parse(topResult.details)
      if (characterData.protagonist) {
        localData.protagonist = characterData.protagonist
        updateData('protagonist', localData.protagonist)
      }
      ElMessage.success('酒馆讨论角色设计已生成')
    } catch (error) {
      // 如果不是JSON格式，作为文本处理
      const protagonist = {
        id: Date.now(),
        name: topResult.title || '主角',
        personality: topResult.core,
        background: topResult.details,
        age: '待设定'
      }
      localData.protagonist = protagonist
      updateData('protagonist', localData.protagonist)
      ElMessage.success('酒馆讨论角色设计已生成')
    }
  }
}

const onProposalSelected = (proposal) => {
  console.log('角色设计收到选择的方案:', proposal)
  
  // 应用选中的角色设计方案
  const protagonist = {
    id: Date.now(),
    name: proposal.title || '主角',
    personality: proposal.core,
    background: proposal.details,
    advantages: proposal.advantages,
    age: '待完善'
  }
  
  localData.protagonist = protagonist
  updateData('protagonist', localData.protagonist)
  ElMessage.success(`已采用"${proposal.title}"角色设计方案！`)
}

// 增强版主角生成（支持酒馆模式）
const enhancedGenerateProtagonist = async () => {
  // 检查是否启用酒馆模式
  if (isTavernMode.value && tavernManagerRef.value) {
    generatingProtagonist.value = true
    
    try {
      const conceptData = props.wizardData.concept || {}
      const worldData = props.wizardData.worldBuilding || {}
      
      const discussionConfig = {
        discussionId: 'character_protagonist_' + Date.now(),
        topic: `基于创意"${conceptData.coreIdea || '未设定创意'}"设计主角角色`,
        context: `
核心创意：${conceptData.coreIdea || '未设定'}
小说类型：${conceptData.selectedGenre || '玄幻'}
世界类型：${worldData.worldType || '未设定'}
世界规模：${worldData.scale || '未设定'}
力量体系：${worldData.powerSystem || '未设定'}

请各位作者基于以上背景信息，设计一个立体丰满的主角角色，包括：
1. 性格特点和内心动机
2. 背景故事和成长经历  
3. 能力特长和弱点缺陷
4. 人际关系和社会地位
5. 角色弧光和成长方向`,
        backgroundInfo: {
          conceptData,
          worldData,
          previousSteps: props.wizardData
        }
      }
      
      const result = await tavernManagerRef.value.startDiscussion(discussionConfig)
      if (!result) {
        // 用户选择了直接生成，回退到单模型模式
        generateProtagonist()
      }
    } catch (error) {
      console.error('酒馆模式生成主角失败:', error)
      ElMessage.error('酒馆模式生成失败，回退到单模型模式')
      generateProtagonist()
    } finally {
      generatingProtagonist.value = false
    }
  } else {
    // 单模型模式
    generateProtagonist()
  }
}

watch(() => props.stepData, (newData) => {
  Object.assign(localData, newData)
}, { deep: true, immediate: true })
</script>

<style scoped>
.character-step {
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

.character-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.supporting-characters {
  margin-bottom: 16px;
}

.character-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  margin-bottom: 12px;
}

.character-info h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.character-info p {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
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
