<template>
  <div class="character-hint-widget">
    <!-- 触发按钮 -->
    <el-popover
      placement="right"
      :width="350"
      trigger="click"
      v-model:visible="popoverVisible"
    >
      <template #reference>
        <el-badge :value="totalFeaturesCount" :hidden="totalFeaturesCount === 0">
          <el-button circle size="small" type="primary">
            <el-icon><User /></el-icon>
          </el-button>
        </el-badge>
      </template>

      <!-- 角色选择 -->
      <div class="hint-content">
        <el-select
          v-model="selectedCharacterId"
          placeholder="选择角色查看特征"
          style="width: 100%"
          @change="handleCharacterChange"
        >
          <el-option
            v-for="char in characters"
            :key="char.id"
            :label="char.name"
            :value="char.id"
          >
            <div class="character-option">
              <el-avatar :src="char.avatar" size="small" />
              <span>{{ char.name }}</span>
              <el-tag v-if="char.role" size="small" type="info">
                {{ getRoleLabel(char.role) }}
              </el-tag>
            </div>
          </el-option>
        </el-select>

        <!-- 角色特征卡片 -->
        <div v-if="currentCharacter && features.length > 0" class="feature-card">
          <el-divider>
            <el-icon><Star /></el-icon>
            角色特征
          </el-divider>

          <el-collapse accordion>
            <el-collapse-item 
              v-for="(group, type) in groupedFeatures" 
              :key="type"
              :title="getFeatureTypeLabel(type)"
              :name="type"
            >
              <div class="feature-group">
                <div 
                  v-for="feature in group"
                  :key="feature.id"
                  class="feature-row"
                >
                  <el-tag size="small" type="success" effect="plain">
                    {{ feature.featureName }}
                  </el-tag>
                  <span class="feature-value-text">{{ feature.featureValue }}</span>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>

        <!-- 一致性警告 -->
        <div v-if="warnings.length > 0" class="warnings-section">
          <el-divider>
            <el-icon><Warning /></el-icon>
            一致性警告
          </el-divider>

          <el-alert
            v-for="warning in warnings"
            :key="warning.id"
            :type="getWarningSeverityType(warning.severity)"
            :closable="false"
            class="warning-item"
          >
            <template #title>
              {{ warning.description }}
            </template>
            <div v-if="warning.suggestion" class="suggestion-text">
              💡 {{ warning.suggestion }}
            </div>
          </el-alert>
        </div>

        <!-- 快速操作 -->
        <div class="quick-actions">
          <el-button size="small" type="primary" @click="insertCharacterName">
            插入角色名
          </el-button>
          <el-button size="small" @click="viewFullProfile">
            查看完整信息
          </el-button>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Star, Warning } from '@element-plus/icons-vue'
import characterConsistencyService from '@/services/characterConsistencyService'

const props = defineProps({
  characters: {
    type: Array,
    default: () => []
  },
  currentChapterId: String
})

const emit = defineEmits(['insert-text', 'view-character'])

// 状态
const popoverVisible = ref(false)
const selectedCharacterId = ref('')
const features = ref([])
const warnings = ref([])
const loading = ref(false)

// 计算属性
const currentCharacter = computed(() => 
  props.characters.find(c => c.id === selectedCharacterId.value)
)

const totalFeaturesCount = computed(() => 
  props.characters.reduce((sum, char) => sum + (char.featureCount || 0), 0)
)

const groupedFeatures = computed(() => {
  const groups = {
    appearance: [],
    personality: [],
    behavior: [],
    speech: []
  }
  
  features.value.forEach(feature => {
    if (groups[feature.featureType]) {
      groups[feature.featureType].push(feature)
    }
  })
  
  return groups
})

// 处理角色变化
const handleCharacterChange = async (characterId) => {
  if (!characterId) return

  loading.value = true

  try {
    // 加载特征
    const featuresRes = await characterConsistencyService.getFeatures(characterId)
    features.value = featuresRes.data.filter(f => f.isConfirmed)

    // 加载警告
    const warningsRes = await characterConsistencyService.getWarnings(characterId)
    warnings.value = warningsRes.data.filter(w => w.status === 'active')
  } catch (error) {
    ElMessage.error('加载角色信息失败')
  } finally {
    loading.value = false
  }
}

// 插入角色名
const insertCharacterName = () => {
  if (currentCharacter.value) {
    emit('insert-text', currentCharacter.value.name)
    popoverVisible.value = false
    ElMessage.success('已插入角色名')
  }
}

// 查看完整信息
const viewFullProfile = () => {
  if (currentCharacter.value) {
    emit('view-character', currentCharacter.value)
    popoverVisible.value = false
  }
}

// 辅助方法
const getFeatureTypeLabel = (type) => {
  const labels = {
    appearance: '👤 外貌',
    personality: '💭 性格',
    behavior: '🎭 行为',
    speech: '💬 说话'
  }
  return labels[type] || type
}

const getRoleLabel = (role) => {
  const labels = {
    protagonist: '主角',
    supporting: '配角',
    antagonist: '反派',
    minor: '路人'
  }
  return labels[role] || role
}

const getWarningSeverityType = (severity) => {
  const types = {
    high: 'error',
    medium: 'warning',
    low: 'info'
  }
  return types[severity] || 'info'
}

// 监听章节变化，自动检查一致性
watch(() => props.currentChapterId, async (newChapterId) => {
  if (newChapterId && selectedCharacterId.value) {
    // 自动检查一致性
    try {
      await characterConsistencyService.checkConsistency(newChapterId)
    } catch (error) {
      console.error('自动检查一致性失败:', error)
    }
  }
})

// 暴露方法
defineExpose({
  selectCharacter: (characterId) => {
    selectedCharacterId.value = characterId
    handleCharacterChange(characterId)
    popoverVisible.value = true
  }
})
</script>

<style scoped>
.character-hint-widget {
  position: relative;
}

.hint-content {
  max-height: 600px;
  overflow-y: auto;
}

.character-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.feature-card {
  margin-top: 16px;
}

.feature-group {
  padding: 8px 0;
}

.feature-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  padding: 8px;
  background: #fafafa;
  border-radius: 4px;
}

.feature-value-text {
  flex: 1;
  font-size: 13px;
  color: #606266;
}

.warnings-section {
  margin-top: 16px;
}

.warning-item {
  margin-bottom: 8px;
}

.suggestion-text {
  margin-top: 8px;
  font-size: 12px;
  color: #409eff;
}

.quick-actions {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  gap: 8px;
}

.summary-stats {
  margin-bottom: 20px;
}

.stat-box {
  text-align: center;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  opacity: 0.9;
}

.chart-section {
  margin-top: 24px;
}

.chart-section h4 {
  margin-bottom: 12px;
  color: #303133;
}

.chart-container {
  height: 250px;
  width: 100%;
}
</style>

