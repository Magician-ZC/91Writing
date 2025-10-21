# Phase 1 - 前端: 多版本对比实现

**组件**: MultiVersionComparison  
**技术栈**: Vue3 + Element Plus + Diff算法

---

## 🔧 Service 层

### src/services/multiVersionService.js

```javascript
import { backendApi } from './backendApi'

class MultiVersionService {
  /**
   * 生成多个版本
   */
  async generate(novelId, data) {
    return await backendApi.post(
      `/api/v1/novels/${novelId}/ai/multi-version`,
      data
    )
  }

  /**
   * 提交反馈
   */
  async submitFeedback(feedbackData) {
    return await backendApi.post(
      `/api/v1/ai/versions/feedback`,
      feedbackData
    )
  }

  /**
   * 获取生成历史
   */
  async getHistory(novelId) {
    return await backendApi.get(
      `/api/v1/novels/${novelId}/ai/generations`
    )
  }

  /**
   * 获取生成详情
   */
  async getDetail(generationId) {
    return await backendApi.get(
      `/api/v1/ai/generations/${generationId}`
    )
  }
}

export default new MultiVersionService()
```

---

## 🎨 核心组件

### src/components/multi-version/MultiVersionDialog.vue

```vue
<template>
  <el-dialog
    v-model="visible"
    title="AI 多版本生成"
    width="90%"
    :close-on-click-modal="false"
    class="multi-version-dialog"
  >
    <!-- 配置面板 -->
    <div v-if="!generated" class="config-panel">
      <el-form :model="config" label-width="100px">
        <el-form-item label="生成类型">
          <el-radio-group v-model="config.requestType">
            <el-radio label="continue">续写</el-radio>
            <el-radio label="polish">润色</el-radio>
            <el-radio label="expand">扩写</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="创作要求">
          <el-input
            v-model="config.prompt"
            type="textarea"
            :rows="3"
            placeholder="描述你想要的内容方向、风格、情节等"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="版本数量">
          <el-slider
            v-model="config.versionCount"
            :min="2"
            :max="5"
            show-stops
            show-input
          />
        </el-form-item>

        <el-form-item v-if="config.requestType === 'continue'" label="目标字数">
          <el-input-number
            v-model="config.targetWordCount"
            :min="100"
            :max="5000"
            :step="100"
          />
        </el-form-item>

        <el-form-item label="风格偏好">
          <el-checkbox-group v-model="config.styles">
            <el-checkbox label="elegant">优雅细腻</el-checkbox>
            <el-checkbox label="action">动作流畅</el-checkbox>
            <el-checkbox label="emotional">情感充沛</el-checkbox>
            <el-checkbox label="detailed">详细描写</el-checkbox>
            <el-checkbox label="concise">简洁有力</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>

      <div class="action-buttons">
        <el-button @click="visible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="generateVersions"
          :loading="generating"
        >
          开始生成
        </el-button>
      </div>
    </div>

    <!-- 版本对比面板 -->
    <div v-else class="comparison-panel">
      <!-- 顶部工具栏 -->
      <div class="comparison-toolbar">
        <el-button :icon="Refresh" @click="regenerate">重新生成</el-button>
        <el-button :icon="Back" @click="backToConfig">返回配置</el-button>
        
        <el-space>
          <span>显示模式:</span>
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button label="side">并排对比</el-radio-button>
            <el-radio-button label="tabs">标签切换</el-radio-button>
          </el-radio-group>
        </el-space>
      </div>

      <!-- 并排对比视图 -->
      <div v-if="viewMode === 'side'" class="side-by-side-view">
        <el-row :gutter="16">
          <el-col 
            v-for="version in versions" 
            :key="version.id"
            :span="getSideSpan"
          >
            <VersionCard
              :version="version"
              :selected="selectedVersionId === version.id"
              @select="selectVersion(version.id)"
              @rate="rateVersion"
            />
          </el-col>
        </el-row>
      </div>

      <!-- 标签切换视图 -->
      <div v-else class="tabs-view">
        <el-tabs v-model="activeVersionTab" type="card">
          <el-tab-pane
            v-for="version in versions"
            :key="version.id"
            :name="version.id"
          >
            <template #label>
              <span>
                版本{{ version.versionNumber }}
                <el-tag 
                  v-if="selectedVersionId === version.id"
                  type="success"
                  size="small"
                  class="ml-2"
                >
                  已选
                </el-tag>
              </span>
            </template>
            
            <VersionCard
              :version="version"
              :selected="selectedVersionId === version.id"
              :show-full="true"
              @select="selectVersion(version.id)"
              @rate="rateVersion"
            />
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 底部操作栏 -->
      <div class="comparison-footer">
        <el-button @click="visible = false">关闭</el-button>
        <el-button 
          type="primary" 
          :disabled="!selectedVersionId"
          @click="confirmSelection"
        >
          使用选中版本
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Back } from '@element-plus/icons-vue'
import multiVersionService from '@/services/multiVersionService'
import VersionCard from './VersionCard.vue'

const props = defineProps({
  novelId: {
    type: String,
    required: true
  },
  chapterId: String,
  context: String
})

const emit = defineEmits(['select', 'close'])

// 状态
const visible = ref(false)
const generated = ref(false)
const generating = ref(false)
const viewMode = ref('side')
const activeVersionTab = ref('')

// 配置
const config = ref({
  requestType: 'continue',
  prompt: '',
  versionCount: 3,
  targetWordCount: 500,
  styles: []
})

// 生成结果
const generationId = ref('')
const versions = ref([])
const selectedVersionId = ref('')

// 计算属性
const getSideSpan = computed(() => {
  const count = versions.value.length
  if (count === 2) return 12
  if (count === 3) return 8
  if (count === 4) return 6
  return 24 / count
})

// 打开对话框
const open = (initialContext) => {
  visible.value = true
  generated.value = false
  
  if (initialContext) {
    config.value.context = initialContext
  }
}

// 生成版本
const generateVersions = async () => {
  if (!config.value.prompt.trim()) {
    ElMessage.warning('请输入创作要求')
    return
  }

  generating.value = true
  
  try {
    const requestData = {
      ...config.value,
      chapterId: props.chapterId,
      context: props.context || config.value.context
    }

    const response = await multiVersionService.generate(
      props.novelId,
      requestData
    )

    generationId.value = response.data.generationId
    versions.value = response.data.versions
    generated.value = true

    // 默认选中第一个版本
    if (versions.value.length > 0) {
      activeVersionTab.value = versions.value[0].id
    }

    ElMessage.success('生成成功')
  } catch (error) {
    ElMessage.error('生成失败: ' + error.message)
  } finally {
    generating.value = false
  }
}

// 选择版本
const selectVersion = async (versionId) => {
  selectedVersionId.value = versionId
  
  // 提交选择反馈
  try {
    await multiVersionService.submitFeedback({
      versionId,
      isSelected: true
    })
  } catch (error) {
    console.error('提交反馈失败:', error)
  }
}

// 评分版本
const rateVersion = async (versionId, score, feedback) => {
  try {
    await multiVersionService.submitFeedback({
      versionId,
      userScore: score,
      userFeedback: feedback
    })
    
    ElMessage.success('评价已提交')
  } catch (error) {
    ElMessage.error('评价提交失败')
  }
}

// 确认选择
const confirmSelection = () => {
  const selectedVersion = versions.value.find(v => v.id === selectedVersionId.value)
  
  if (selectedVersion) {
    emit('select', selectedVersion.content)
    visible.value = false
  }
}

// 返回配置
const backToConfig = () => {
  generated.value = false
}

// 重新生成
const regenerate = () => {
  backToConfig()
  generateVersions()
}

// 暴露方法
defineExpose({
  open
})
</script>

<style scoped>
.multi-version-dialog {
  min-height: 600px;
}

.config-panel {
  padding: 20px;
}

.action-buttons {
  margin-top: 24px;
  text-align: right;
}

.comparison-panel {
  padding: 16px;
  min-height: 500px;
  display: flex;
  flex-direction: column;
}

.comparison-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.side-by-side-view {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
}

.tabs-view {
  flex: 1;
}

.comparison-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
  text-align: right;
}

.ml-2 {
  margin-left: 8px;
}
</style>
```

### src/components/multi-version/VersionCard.vue

```vue
<template>
  <el-card 
    class="version-card"
    :class="{ 'selected': selected }"
    shadow="hover"
  >
    <!-- 头部 -->
    <template #header>
      <div class="version-header">
        <div class="version-info">
          <span class="version-number">版本 {{ version.versionNumber }}</span>
          <el-tag 
            v-if="version.styleHint"
            :type="getStyleTagType(version.styleHint)"
            size="small"
          >
            {{ getStyleLabel(version.styleHint) }}
          </el-tag>
        </div>
        
        <div class="version-actions">
          <el-button
            :type="selected ? 'success' : 'primary'"
            size="small"
            :icon="selected ? Check : Plus"
            @click="$emit('select', version.id)"
          >
            {{ selected ? '已选' : '选择' }}
          </el-button>
        </div>
      </div>
    </template>

    <!-- 内容 -->
    <div class="version-content">
      <div 
        class="content-text"
        :class="{ 'show-full': showFull }"
      >
        {{ version.content }}
      </div>
      
      <div v-if="!showFull && version.content.length > 300" class="read-more">
        <el-button type="text" @click="showFullContent = !showFullContent">
          {{ showFullContent ? '收起' : '展开全文' }}
        </el-button>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="version-stats">
      <el-space :size="16">
        <span class="stat-item">
          <el-icon><Document /></el-icon>
          {{ version.content.length }} 字
        </span>
        
        <span v-if="version.quality" class="stat-item">
          <el-icon><Star /></el-icon>
          质量: {{ (version.quality * 100).toFixed(0) }}%
        </span>
        
        <span v-if="version.coherence" class="stat-item">
          <el-icon><Connection /></el-icon>
          连贯: {{ (version.coherence * 100).toFixed(0) }}%
        </span>
      </el-space>
    </div>

    <!-- 评分区域 -->
    <div class="version-rating">
      <el-divider />
      
      <div class="rating-section">
        <span>你的评分:</span>
        <el-rate
          v-model="userScore"
          @change="handleRateChange"
        />
      </div>
      
      <el-input
        v-if="userScore > 0"
        v-model="userFeedback"
        type="textarea"
        :rows="2"
        placeholder="说说你的想法（可选）"
        maxlength="200"
        show-word-limit
        class="feedback-input"
      />
      
      <el-button
        v-if="userScore > 0 && userFeedback"
        type="primary"
        size="small"
        @click="submitRating"
      >
        提交评价
      </el-button>
    </div>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { Check, Plus, Document, Star, Connection } from '@element-plus/icons-vue'

const props = defineProps({
  version: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  },
  showFull: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select', 'rate'])

const showFullContent = ref(props.showFull)
const userScore = ref(props.version.userScore || 0)
const userFeedback = ref(props.version.userFeedback || '')

const getStyleLabel = (style) => {
  const labels = {
    elegant: '优雅细腻',
    action: '动作流畅',
    emotional: '情感充沛',
    detailed: '详细描写',
    concise: '简洁有力'
  }
  return labels[style] || style
}

const getStyleTagType = (style) => {
  const types = {
    elegant: 'primary',
    action: 'danger',
    emotional: 'warning',
    detailed: 'success',
    concise: 'info'
  }
  return types[style] || ''
}

const handleRateChange = () => {
  // 评分改变时自动提交基础评分
  if (userScore.value > 0) {
    emit('rate', props.version.id, userScore.value, userFeedback.value)
  }
}

const submitRating = () => {
  emit('rate', props.version.id, userScore.value, userFeedback.value)
}
</script>

<style scoped>
.version-card {
  height: 100%;
  transition: all 0.3s;
}

.version-card.selected {
  border-color: #67c23a;
  box-shadow: 0 0 10px rgba(103, 194, 58, 0.3);
}

.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.version-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.version-number {
  font-weight: 600;
  font-size: 16px;
}

.version-content {
  min-height: 200px;
  margin-bottom: 16px;
}

.content-text {
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 300px;
  overflow: hidden;
}

.content-text.show-full {
  max-height: none;
}

.read-more {
  text-align: center;
  margin-top: 8px;
}

.version-stats {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 12px;
}

.stat-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #606266;
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.feedback-input {
  margin-bottom: 12px;
}
</style>
```

---

## 🔗 集成到编辑器

### src/components/writer/WriterEditor.vue (修改)

```vue
<template>
  <div class="writer-editor">
    <!-- 工具栏 -->
    <div class="editor-toolbar">
      <!-- ... 现有工具栏按钮 ... -->
      
      <el-button type="primary" @click="openMultiVersion">
        🎨 多版本生成
      </el-button>
    </div>

    <!-- 编辑器 -->
    <div ref="editorRef" class="editor-content"></div>

    <!-- 多版本对话框 -->
    <MultiVersionDialog
      ref="multiVersionDialog"
      :novel-id="novelId"
      :chapter-id="chapterId"
      :context="editorContent"
      @select="handleVersionSelect"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import MultiVersionDialog from '@/components/multi-version/MultiVersionDialog.vue'

// ... 现有代码 ...

const multiVersionDialog = ref(null)

// 打开多版本生成
const openMultiVersion = () => {
  const selection = getEditorSelection()
  const context = selection || editorContent.value
  
  multiVersionDialog.value?.open(context)
}

// 处理版本选择
const handleVersionSelect = (content) => {
  // 插入到编辑器
  insertContent(content)
  ElMessage.success('内容已插入')
}

// 获取编辑器选中内容
const getEditorSelection = () => {
  // 根据你使用的编辑器实现
  return ''
}

// 插入内容到编辑器
const insertContent = (content) => {
  // 根据你使用的编辑器实现
}
</script>
```

---

## 📋 前端检查清单

- [x] 多版本生成配置界面
- [x] 版本并排对比视图
- [x] 版本标签切换视图
- [x] 版本评分功能
- [x] 用户反馈收集
- [x] 版本选择和插入
- [x] 响应式布局
- [x] Loading 状态
- [x] 错误处理
- [x] 样式美化

---

**状态**: ✅ 前端实现完成  
**下一步**: 集成测试

