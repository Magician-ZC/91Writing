<template>
  <div class="core-memory-editor">
    <div class="editor-header">
      <h3>🎯 核心记忆设定</h3>
      <div class="header-actions">
        <el-button 
          type="primary" 
          size="small" 
          @click="saveAllChanges"
          :loading="isSaving"
          :disabled="!hasChanges"
        >
          保存所有更改
        </el-button>
        <el-button 
          size="small" 
          @click="resetChanges"
          :disabled="!hasChanges"
        >
          重置更改
        </el-button>
      </div>
    </div>

    <div class="memory-sections">
      <!-- 主要角色管理 -->
      <el-card shadow="hover" class="memory-section">
        <template #header>
          <div class="section-header">
            <span class="section-title">👥 主要角色</span>
            <div class="section-actions">
              <el-tag size="small" type="info">{{ characters.length }}/8 个角色</el-tag>
              <el-button 
                size="small" 
                type="primary" 
                @click="addNewCharacter"
                :disabled="characters.length >= 8"
              >
                添加角色
              </el-button>
            </div>
          </div>
        </template>
        
        <div class="characters-list">
          <div 
            v-for="(character, index) in characters" 
            :key="character.id || index"
            class="character-item"
          >
            <div class="character-form">
              <el-row :gutter="16">
                <el-col :span="6">
                  <el-form-item label="角色名称">
                    <el-input 
                      v-model="character.name" 
                      placeholder="输入角色名称"
                      @input="markAsChanged"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-form-item label="角色类型">
                    <el-select v-model="character.role" @change="markAsChanged">
                      <el-option label="主角" value="protagonist" />
                      <el-option label="配角" value="supporting" />
                      <el-option label="反派" value="antagonist" />
                      <el-option label="路人" value="minor" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="关键特征">
                    <el-input 
                      v-model="character.traitsText" 
                      placeholder="用逗号分隔特征"
                      @input="updateCharacterTraits(character); markAsChanged()"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="当前状态">
                    <el-input 
                      v-model="character.currentStatus" 
                      placeholder="角色当前状态"
                      @input="markAsChanged"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="2">
                  <el-form-item label=" ">
                    <el-button 
                      type="danger" 
                      size="small" 
                      @click="removeCharacter(index)"
                      :icon="Delete"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              
              <div class="character-importance">
                <span class="importance-label">重要度：</span>
                <el-slider 
                  v-model="character.importance" 
                  :min="0" 
                  :max="1" 
                  :step="0.1"
                  :show-tooltip="false"
                  @input="markAsChanged"
                  style="width: 200px; margin-left: 8px;"
                />
                <span class="importance-value">{{ Math.round((character.importance || 0.5) * 100) }}%</span>
              </div>
            </div>
          </div>
          
          <div v-if="characters.length === 0" class="empty-state">
            <p>暂无角色设定，点击"添加角色"开始创建</p>
          </div>
        </div>
      </el-card>

      <!-- 世界观设定 -->
      <el-card shadow="hover" class="memory-section">
        <template #header>
          <div class="section-header">
            <span class="section-title">🌍 世界观设定</span>
            <div class="section-actions">
              <el-button size="small" @click="generateWorldSetting">
                🤖 AI生成
              </el-button>
            </div>
          </div>
        </template>
        
        <el-form :model="worldSetting" label-width="100px">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="世界类型">
                <el-input 
                  v-model="worldSetting.worldType" 
                  placeholder="如：现代都市、异世大陆、未来科幻"
                  @input="markAsChanged"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="力量体系">
                <el-input 
                  v-model="worldSetting.powerSystem" 
                  placeholder="如：修仙体系、魔法体系、科技体系"
                  @input="markAsChanged"
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item label="社会结构">
            <el-input 
              v-model="worldSetting.socialStructure" 
              placeholder="描述社会组织、政治体系等"
              @input="markAsChanged"
            />
          </el-form-item>
          
          <el-form-item label="核心规则">
            <div class="rules-editor">
              <div 
                v-for="(rule, index) in worldSetting.coreRules" 
                :key="index"
                class="rule-item"
              >
                <el-input 
                  v-model="worldSetting.coreRules[index]" 
                  placeholder="输入世界观规则"
                  @input="markAsChanged"
                />
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="removeRule(index)"
                  :icon="Delete"
                />
              </div>
              <el-button 
                v-if="worldSetting.coreRules.length < 5" 
                type="dashed" 
                @click="addRule"
                style="width: 100%; margin-top: 8px;"
              >
                添加规则 ({{ worldSetting.coreRules.length }}/5)
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 主线情节 -->
      <el-card shadow="hover" class="memory-section">
        <template #header>
          <div class="section-header">
            <span class="section-title">📖 主线情节</span>
            <div class="section-actions">
              <el-button size="small" @click="generatePlotStructure">
                🤖 AI生成
              </el-button>
            </div>
          </div>
        </template>
        
        <el-form :model="mainPlot" label-width="100px">
          <el-form-item label="故事前提">
            <el-input 
              v-model="mainPlot.premise" 
              type="textarea" 
              :rows="2"
              placeholder="故事的基本设定和背景"
              @input="markAsChanged"
            />
          </el-form-item>
          
          <el-form-item label="主要冲突">
            <el-input 
              v-model="mainPlot.mainConflict" 
              type="textarea" 
              :rows="2"
              placeholder="推动故事发展的核心矛盾"
              @input="markAsChanged"
            />
          </el-form-item>
          
          <el-form-item label="当前故事弧">
            <el-input 
              v-model="mainPlot.currentArc" 
              placeholder="当前正在发展的故事线"
              @input="markAsChanged"
            />
          </el-form-item>
          
          <el-form-item label="关键情节点">
            <div class="plot-points-editor">
              <div 
                v-for="(point, index) in mainPlot.plotPoints" 
                :key="index"
                class="plot-point-item"
              >
                <el-input 
                  v-model="mainPlot.plotPoints[index]" 
                  placeholder="输入关键情节点"
                  @input="markAsChanged"
                />
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="removePlotPoint(index)"
                  :icon="Delete"
                />
              </div>
              <el-button 
                v-if="mainPlot.plotPoints.length < 8" 
                type="dashed" 
                @click="addPlotPoint"
                style="width: 100%; margin-top: 8px;"
              >
                添加情节点 ({{ mainPlot.plotPoints.length }}/8)
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- Token使用统计 -->
    <el-card shadow="never" class="token-stats">
      <template #header>
        <span>📊 Token使用统计</span>
      </template>
      
      <el-row :gutter="16">
        <el-col :span="8">
          <div class="token-item">
            <span class="token-label">角色记忆：</span>
            <span class="token-value">{{ charactersTokens }} tokens</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="token-item">
            <span class="token-label">世界观记忆：</span>
            <span class="token-value">{{ worldTokens }} tokens</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="token-item">
            <span class="token-label">情节记忆：</span>
            <span class="token-value">{{ plotTokens }} tokens</span>
          </div>
        </el-col>
      </el-row>
      
      <div class="total-usage">
        <el-progress 
          :percentage="Math.round((totalTokens / 500) * 100)"
          :color="getProgressColor(totalTokens / 500)"
          :show-text="false"
        />
        <span class="usage-text">
          总计：{{ totalTokens }}/500 tokens ({{ Math.round((totalTokens / 500) * 100) }}%)
        </span>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useNovelStore } from '@/stores/novel'
import { ElMessage } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import memoryService from '@/services/memoryService'

// Props
const props = defineProps({
  coreMemory: {
    type: Object,
    default: () => ({
      characters: [],
      worldSetting: {
        worldType: '',
        coreRules: [],
        powerSystem: '',
        socialStructure: ''
      },
      mainPlot: {
        premise: '',
        mainConflict: '',
        plotPoints: [],
        currentArc: ''
      }
    })
  }
})

// Emits
const emit = defineEmits(['update'])

// Store
const novelStore = useNovelStore()

// 响应式数据
const characters = ref([])
const worldSetting = ref({
  worldType: '',
  coreRules: [],
  powerSystem: '',
  socialStructure: ''
})
const mainPlot = ref({
  premise: '',
  mainConflict: '',
  plotPoints: [],
  currentArc: ''
})

const hasChanges = ref(false)
const isSaving = ref(false)

// 初始化数据
const initializeData = () => {
  characters.value = props.coreMemory.characters?.map(char => ({
    ...char,
    traitsText: char.keyTraits ? char.keyTraits.join(', ') : ''
  })) || []
  
  worldSetting.value = {
    ...props.coreMemory.worldSetting,
    coreRules: props.coreMemory.worldSetting?.coreRules || []
  }
  
  mainPlot.value = {
    ...props.coreMemory.mainPlot,
    plotPoints: props.coreMemory.mainPlot?.plotPoints || []
  }
  
  hasChanges.value = false
}

// 计算属性
const charactersTokens = computed(() => {
  return memoryService.estimateTokens(JSON.stringify(characters.value))
})

const worldTokens = computed(() => {
  return memoryService.estimateTokens(JSON.stringify(worldSetting.value))
})

const plotTokens = computed(() => {
  return memoryService.estimateTokens(JSON.stringify(mainPlot.value))
})

const totalTokens = computed(() => {
  return charactersTokens.value + worldTokens.value + plotTokens.value
})

// 方法
const markAsChanged = () => {
  hasChanges.value = true
}

const getProgressColor = (ratio) => {
  if (ratio < 0.7) return '#67c23a'
  if (ratio < 0.9) return '#e6a23c'
  return '#f56c6c'
}

const addNewCharacter = () => {
  characters.value.push({
    id: Date.now(),
    name: '',
    role: 'minor',
    traitsText: '',
    keyTraits: [],
    currentStatus: '',
    importance: 0.5
  })
  markAsChanged()
}

const removeCharacter = (index) => {
  characters.value.splice(index, 1)
  markAsChanged()
}

const updateCharacterTraits = (character) => {
  character.keyTraits = character.traitsText
    .split(',')
    .map(trait => trait.trim())
    .filter(trait => trait)
}

const addRule = () => {
  worldSetting.value.coreRules.push('')
  markAsChanged()
}

const removeRule = (index) => {
  worldSetting.value.coreRules.splice(index, 1)
  markAsChanged()
}

const addPlotPoint = () => {
  mainPlot.value.plotPoints.push('')
  markAsChanged()
}

const removePlotPoint = (index) => {
  mainPlot.value.plotPoints.splice(index, 1)
  markAsChanged()
}

const generateWorldSetting = async () => {
  try {
    ElMessage.info('AI世界观生成功能开发中...')
    // TODO: 实现AI生成世界观
  } catch (error) {
    ElMessage.error('生成失败：' + error.message)
  }
}

const generatePlotStructure = async () => {
  try {
    ElMessage.info('AI情节生成功能开发中...')
    // TODO: 实现AI生成情节结构
  } catch (error) {
    ElMessage.error('生成失败：' + error.message)
  }
}

const saveAllChanges = async () => {
  try {
    isSaving.value = true
    
    // 处理角色数据
    const processedCharacters = characters.value.map(char => {
      updateCharacterTraits(char)
      return {
        id: char.id,
        name: char.name,
        role: char.role,
        keyTraits: char.keyTraits,
        currentStatus: char.currentStatus,
        importance: char.importance || 0.5
      }
    })
    
    // 过滤空的规则和情节点
    const processedWorldSetting = {
      ...worldSetting.value,
      coreRules: worldSetting.value.coreRules.filter(rule => rule.trim())
    }
    
    const processedMainPlot = {
      ...mainPlot.value,
      plotPoints: mainPlot.value.plotPoints.filter(point => point.trim())
    }
    
    const updates = {
      characters: processedCharacters,
      worldSetting: processedWorldSetting,
      mainPlot: processedMainPlot
    }
    
    emit('update', updates)
    hasChanges.value = false
    
  } catch (error) {
    ElMessage.error('保存失败：' + error.message)
  } finally {
    isSaving.value = false
  }
}

const resetChanges = () => {
  initializeData()
  ElMessage.info('已重置所有更改')
}

// 监听props变化
watch(() => props.coreMemory, initializeData, { immediate: true, deep: true })

// 初始化
initializeData()
</script>

<style scoped>
.core-memory-editor {
  padding: 20px;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.editor-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.memory-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.memory-section {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.characters-list {
  max-height: 600px;
  overflow-y: auto;
}

.character-item {
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  margin-bottom: 16px;
  background: #fafafa;
}

.character-form {
  width: 100%;
}

.character-importance {
  display: flex;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e4e7ed;
}

.importance-label {
  font-size: 14px;
  color: #606266;
  min-width: 60px;
}

.importance-value {
  font-size: 14px;
  color: #409eff;
  font-weight: 500;
  margin-left: 8px;
  min-width: 40px;
}

.rules-editor,
.plot-points-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rule-item,
.plot-point-item {
  display: flex;
  gap: 8px;
  align-items: center;
}

.rule-item .el-input,
.plot-point-item .el-input {
  flex: 1;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #909399;
}

.token-stats {
  margin-top: 20px;
}

.token-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.token-label {
  font-size: 14px;
  color: #606266;
}

.token-value {
  font-size: 14px;
  font-weight: 500;
  color: #409eff;
}

.total-usage {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}

.usage-text {
  margin-top: 8px;
  font-size: 14px;
  color: #606266;
  display: block;
  text-align: center;
}

:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-form-item) {
  margin-bottom: 16px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-slider__runway) {
  height: 6px;
}

:deep(.el-slider__button) {
  width: 16px;
  height: 16px;
}
</style>
