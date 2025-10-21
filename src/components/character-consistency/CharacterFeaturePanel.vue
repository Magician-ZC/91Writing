<template>
  <div class="feature-panel">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>✨ 角色特征库</span>
          <el-space>
            <el-button 
              size="small" 
              type="primary"
              @click="showExtractDialog"
            >
              <el-icon><MagicStick /></el-icon>
              AI提取特征
            </el-button>
            <el-button 
              size="small"
              @click="loadFeatures"
            >
              <el-icon><Refresh /></el-icon>
            </el-button>
          </el-space>
        </div>
      </template>

      <!-- 特征分类显示 -->
      <el-tabs v-model="activeTab" class="feature-tabs">
        <el-tab-pane label="外貌特征" name="appearance">
          <FeatureList 
            :features="appearanceFeatures"
            feature-type="appearance"
            @confirm="confirmFeature"
            @delete="deleteFeature"
          />
        </el-tab-pane>

        <el-tab-pane label="性格特点" name="personality">
          <FeatureList 
            :features="personalityFeatures"
            feature-type="personality"
            @confirm="confirmFeature"
            @delete="deleteFeature"
          />
        </el-tab-pane>

        <el-tab-pane label="行为习惯" name="behavior">
          <FeatureList 
            :features="behaviorFeatures"
            feature-type="behavior"
            @confirm="confirmFeature"
            @delete="deleteFeature"
          />
        </el-tab-pane>

        <el-tab-pane label="说话方式" name="speech">
          <FeatureList 
            :features="speechFeatures"
            feature-type="speech"
            @confirm="confirmFeature"
            @delete="deleteFeature"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 提取特征对话框 -->
    <el-dialog
      v-model="extractDialogVisible"
      title="AI提取角色特征"
      width="600px"
    >
      <el-form :model="extractForm" label-width="100px">
        <el-form-item label="选择章节">
          <el-select
            v-model="extractForm.chapterId"
            placeholder="选择要分析的章节"
            style="width: 100%"
          >
            <el-option
              v-for="chapter in chapters"
              :key="chapter.id"
              :label="`第${chapter.chapterNumber}章 ${chapter.title}`"
              :value="chapter.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="自动确认">
          <el-switch
            v-model="extractForm.autoConfirm"
            active-text="提取后自动确认"
            inactive-text="提取后需手动确认"
          />
        </el-form-item>

        <el-alert
          type="info"
          :closable="false"
          show-icon
        >
          <template #title>
            AI将分析章节内容，提取关于{{ characterName }}的特征信息
          </template>
        </el-alert>
      </el-form>

      <template #footer>
        <el-button @click="extractDialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleExtract"
          :loading="extracting"
        >
          开始提取
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { MagicStick, Refresh } from '@element-plus/icons-vue'
import characterConsistencyService from '@/services/characterConsistencyService'
import FeatureList from './FeatureList.vue'

const props = defineProps({
  characterId: {
    type: String,
    required: true
  },
  characterName: {
    type: String,
    required: true
  },
  chapters: {
    type: Array,
    default: () => []
  }
})

// 数据
const features = ref([])
const activeTab = ref('appearance')
const extractDialogVisible = ref(false)
const extracting = ref(false)

const extractForm = ref({
  chapterId: '',
  autoConfirm: false
})

// 计算属性 - 按类型分组
const appearanceFeatures = computed(() => 
  features.value.filter(f => f.featureType === 'appearance')
)
const personalityFeatures = computed(() => 
  features.value.filter(f => f.featureType === 'personality')
)
const behaviorFeatures = computed(() => 
  features.value.filter(f => f.featureType === 'behavior')
)
const speechFeatures = computed(() => 
  features.value.filter(f => f.featureType === 'speech')
)

// 加载特征
const loadFeatures = async () => {
  try {
    const response = await characterConsistencyService.getFeatures(props.characterId)
    features.value = response.data
  } catch (error) {
    ElMessage.error('加载特征失败')
  }
}

// 显示提取对话框
const showExtractDialog = () => {
  if (props.chapters.length === 0) {
    ElMessage.warning('请先创建章节')
    return
  }
  extractForm.value.chapterId = ''
  extractDialogVisible.value = true
}

// 提取特征
const handleExtract = async () => {
  if (!extractForm.value.chapterId) {
    ElMessage.warning('请选择章节')
    return
  }

  extracting.value = true

  try {
    const response = await characterConsistencyService.extractFeatures(
      props.characterId,
      extractForm.value
    )

    const newFeatures = response.data
    ElMessage.success(`成功提取 ${newFeatures.length} 个特征`)

    extractDialogVisible.value = false
    await loadFeatures()
  } catch (error) {
    ElMessage.error('提取失败: ' + (error.message || '未知错误'))
  } finally {
    extracting.value = false
  }
}

// 确认特征
const confirmFeature = async (featureId) => {
  // TODO: 实现确认特征的API
  ElMessage.success('特征已确认')
}

// 删除特征
const deleteFeature = async (featureId) => {
  // TODO: 实现删除特征的API
  ElMessage.success('特征已删除')
}

// 生命周期
onMounted(() => {
  loadFeatures()
})

// 暴露方法
defineExpose({
  loadFeatures
})
</script>

<style scoped>
.feature-panel {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.feature-tabs {
  min-height: 400px;
}
</style>

