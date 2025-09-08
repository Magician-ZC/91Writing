<template>
  <div class="chapter-summary-manager">
    <div class="manager-header">
      <h3>📝 章节摘要管理</h3>
      <div class="header-actions">
        <el-button 
          type="primary" 
          size="small" 
          @click="showBatchGenerateDialog = true"
          :disabled="availableChapters.length === 0"
        >
          批量生成
        </el-button>
        <el-button 
          size="small" 
          @click="refreshSummaries"
        >
          刷新列表
        </el-button>
      </div>
    </div>

    <!-- 摘要统计 -->
    <div class="summary-stats">
      <el-row :gutter="16">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <div class="stat-number">{{ summaries.length }}</div>
              <div class="stat-label">总摘要数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon">🗜️</div>
            <div class="stat-content">
              <div class="stat-number">{{ averageCompressionRatio }}:1</div>
              <div class="stat-label">平均压缩比</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon">⚡</div>
            <div class="stat-content">
              <div class="stat-number">{{ totalTokensSaved }}</div>
              <div class="stat-label">节省Token</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-content">
              <div class="stat-number">{{ averageImportance }}%</div>
              <div class="stat-label">平均重要度</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 摘要列表 -->
    <div class="summaries-container">
      <div class="list-header">
        <div class="list-controls">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索章节摘要..."
            prefix-icon="Search"
            size="small"
            style="width: 300px;"
            clearable
          />
          <el-select 
            v-model="sortBy" 
            placeholder="排序方式" 
            size="small"
            style="width: 150px; margin-left: 12px;"
          >
            <el-option label="章节顺序" value="chapter" />
            <el-option label="重要度" value="importance" />
            <el-option label="创建时间" value="created" />
            <el-option label="Token使用" value="tokens" />
          </el-select>
          <el-button 
            size="small" 
            @click="sortReverse = !sortReverse"
            :icon="sortReverse ? 'SortDown' : 'SortUp'"
          />
        </div>
      </div>

      <div class="summaries-list">
        <div v-if="filteredSummaries.length === 0" class="empty-state">
          <el-empty description="暂无章节摘要">
            <el-button type="primary" @click="showBatchGenerateDialog = true">
              开始生成摘要
            </el-button>
          </el-empty>
        </div>
        
        <div 
          v-for="summary in filteredSummaries" 
          :key="summary.chapterNumber"
          class="summary-item"
          :class="{ 'selected': selectedSummary?.chapterNumber === summary.chapterNumber }"
          @click="selectSummary(summary)"
        >
          <div class="summary-header">
            <div class="chapter-info">
              <span class="chapter-number">第{{ summary.chapterNumber }}章</span>
              <h4 class="chapter-title">{{ summary.title }}</h4>
            </div>
            <div class="summary-meta">
              <el-tag 
                :type="getImportanceType(summary.importance)" 
                size="small"
              >
                重要度 {{ Math.round((summary.importance || 0) * 100) }}%
              </el-tag>
              <el-tag v-if="summary.compressed" type="warning" size="small">
                已压缩{{ summary.compressionLevel }}次
              </el-tag>
              <el-dropdown @command="(cmd) => handleSummaryAction(cmd, summary)">
                <el-button size="small" type="text">
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="regenerate">
                      <el-icon><Refresh /></el-icon>
                      重新生成
                    </el-dropdown-item>
                    <el-dropdown-item command="edit">
                      <el-icon><Edit /></el-icon>
                      编辑摘要
                    </el-dropdown-item>
                    <el-dropdown-item command="view-original">
                      <el-icon><Document /></el-icon>
                      查看原文
                    </el-dropdown-item>
                    <el-dropdown-item command="compress" divided>
                      <el-icon><FolderOpened /></el-icon>
                      进一步压缩
                    </el-dropdown-item>
                    <el-dropdown-item command="delete" divided>
                      <el-icon><Delete /></el-icon>
                      删除摘要
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          
          <div class="summary-content">
            <p class="summary-text">{{ summary.summary }}</p>
            
            <div class="summary-details" v-if="summary.keyEvents || summary.characterChanges">
              <div v-if="summary.keyEvents && summary.keyEvents.length > 0" class="detail-section">
                <span class="detail-label">关键事件：</span>
                <el-tag 
                  v-for="event in summary.keyEvents.slice(0, 3)" 
                  :key="event"
                  size="small"
                  type="info"
                  style="margin-right: 4px; margin-bottom: 4px;"
                >
                  {{ event }}
                </el-tag>
                <span v-if="summary.keyEvents.length > 3" class="more-count">
                  +{{ summary.keyEvents.length - 3 }}
                </span>
              </div>
              
              <div v-if="summary.characterChanges && summary.characterChanges.length > 0" class="detail-section">
                <span class="detail-label">角色变化：</span>
                <el-tag 
                  v-for="change in summary.characterChanges.slice(0, 2)" 
                  :key="change"
                  size="small"
                  type="success"
                  style="margin-right: 4px; margin-bottom: 4px;"
                >
                  {{ change }}
                </el-tag>
                <span v-if="summary.characterChanges.length > 2" class="more-count">
                  +{{ summary.characterChanges.length - 2 }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="summary-footer">
            <div class="token-info">
              <span class="token-usage">{{ summary.tokenCost || 0 }} tokens</span>
              <span class="compression-ratio" v-if="summary.compressionRatio">
                ({{ summary.compressionRatio }}:1)
              </span>
            </div>
            <div class="time-info">
              <span class="created-time">{{ formatDate(summary.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 摘要详情面板 -->
    <el-drawer
      v-model="showDetailDrawer"
      title="摘要详情"
      size="50%"
      direction="rtl"
    >
      <div v-if="selectedSummary" class="summary-detail">
        <div class="detail-header">
          <h3>第{{ selectedSummary.chapterNumber }}章：{{ selectedSummary.title }}</h3>
          <div class="detail-actions">
            <el-button size="small" @click="editSummary(selectedSummary)">
              编辑摘要
            </el-button>
            <el-button 
              type="primary" 
              size="small" 
              @click="regenerateSummary(selectedSummary)"
            >
              重新生成
            </el-button>
          </div>
        </div>
        
        <el-descriptions :column="2" border>
          <el-descriptions-item label="重要度">
            <el-progress 
              :percentage="Math.round((selectedSummary.importance || 0) * 100)"
              :color="getProgressColor(selectedSummary.importance || 0)"
              style="width: 200px;"
            />
          </el-descriptions-item>
          <el-descriptions-item label="Token使用">
            {{ selectedSummary.tokenCost || 0 }} tokens
          </el-descriptions-item>
          <el-descriptions-item label="压缩比">
            {{ selectedSummary.compressionRatio || 0 }}:1
          </el-descriptions-item>
          <el-descriptions-item label="压缩级别">
            {{ selectedSummary.compressionLevel || 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDateTime(selectedSummary.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ formatDateTime(selectedSummary.updatedAt) }}
          </el-descriptions-item>
        </el-descriptions>
        
        <div class="detail-content">
          <h4>摘要内容</h4>
          <p class="full-summary">{{ selectedSummary.summary }}</p>
          
          <h4 v-if="selectedSummary.keyEvents && selectedSummary.keyEvents.length > 0">
            关键事件
          </h4>
          <ul v-if="selectedSummary.keyEvents && selectedSummary.keyEvents.length > 0">
            <li v-for="event in selectedSummary.keyEvents" :key="event">{{ event }}</li>
          </ul>
          
          <h4 v-if="selectedSummary.characterChanges && selectedSummary.characterChanges.length > 0">
            角色变化
          </h4>
          <ul v-if="selectedSummary.characterChanges && selectedSummary.characterChanges.length > 0">
            <li v-for="change in selectedSummary.characterChanges" :key="change">{{ change }}</li>
          </ul>
          
          <h4 v-if="selectedSummary.plotProgress">情节推进</h4>
          <p v-if="selectedSummary.plotProgress">{{ selectedSummary.plotProgress }}</p>
          
          <h4 v-if="selectedSummary.newElements && selectedSummary.newElements.length > 0">
            新增元素
          </h4>
          <ul v-if="selectedSummary.newElements && selectedSummary.newElements.length > 0">
            <li v-for="element in selectedSummary.newElements" :key="element">{{ element }}</li>
          </ul>
        </div>
      </div>
    </el-drawer>

    <!-- 批量生成对话框 -->
    <el-dialog
      v-model="showBatchGenerateDialog"
      title="批量生成摘要"
      width="600px"
    >
      <div class="batch-generate-content">
        <p>选择要生成摘要的章节：</p>
        <el-checkbox 
          v-model="selectAllChapters" 
          @change="handleSelectAll"
          style="margin-bottom: 16px;"
        >
          全选 ({{ availableChapters.length }} 个章节)
        </el-checkbox>
        
        <div class="chapters-selection">
          <el-checkbox-group v-model="selectedChapters">
            <div 
              v-for="chapter in availableChapters" 
              :key="chapter.id"
              class="chapter-checkbox"
            >
              <el-checkbox :value="chapter.id">
                第{{ chapter.id }}章：{{ chapter.title }}
                <span class="chapter-info">
                  ({{ (chapter.content || '').length }} 字)
                </span>
              </el-checkbox>
            </div>
          </el-checkbox-group>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="showBatchGenerateDialog = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="startBatchGenerate"
          :disabled="selectedChapters.length === 0"
        >
          开始生成 ({{ selectedChapters.length }} 个)
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑摘要对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑摘要"
      width="700px"
    >
      <el-form v-if="editingSummary" :model="editingSummary" label-width="100px">
        <el-form-item label="摘要内容">
          <el-input
            v-model="editingSummary.summary"
            type="textarea"
            :rows="4"
            placeholder="请输入摘要内容"
          />
        </el-form-item>
        
        <el-form-item label="重要度">
          <el-slider
            v-model="editingSummary.importance"
            :min="0"
            :max="1"
            :step="0.1"
            show-input
            :show-input-controls="false"
          />
        </el-form-item>
        
        <el-form-item label="关键事件">
          <el-select
            v-model="editingSummary.keyEvents"
            multiple
            filterable
            allow-create
            placeholder="添加关键事件"
            style="width: 100%"
          >
            <el-option
              v-for="event in editingSummary.keyEvents"
              :key="event"
              :value="event"
              :label="event"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="角色变化">
          <el-select
            v-model="editingSummary.characterChanges"
            multiple
            filterable
            allow-create
            placeholder="添加角色变化"
            style="width: 100%"
          >
            <el-option
              v-for="change in editingSummary.characterChanges"
              :key="change"
              :value="change"
              :label="change"
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveEditedSummary">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useNovelStore } from '@/stores/novel'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  MoreFilled, Refresh, Edit, Document, FolderOpened, Delete
} from '@element-plus/icons-vue'

// Props
const props = defineProps({
  summaries: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['generate', 'update', 'delete'])

// Store
const novelStore = useNovelStore()

// 响应式数据
const searchKeyword = ref('')
const sortBy = ref('chapter')
const sortReverse = ref(false)
const selectedSummary = ref(null)
const showDetailDrawer = ref(false)
const showBatchGenerateDialog = ref(false)
const showEditDialog = ref(false)
const editingSummary = ref(null)
const selectAllChapters = ref(false)
const selectedChapters = ref([])

// 计算属性
const availableChapters = computed(() => {
  return novelStore.chapters.filter(chapter => {
    // 只显示还没有摘要的章节
    return !props.summaries.some(summary => summary.chapterNumber === chapter.id)
  })
})

const filteredSummaries = computed(() => {
  let filtered = props.summaries.filter(summary => {
    if (!searchKeyword.value) return true
    
    const keyword = searchKeyword.value.toLowerCase()
    return (
      summary.title.toLowerCase().includes(keyword) ||
      summary.summary.toLowerCase().includes(keyword) ||
      (summary.keyEvents && summary.keyEvents.some(event => 
        event.toLowerCase().includes(keyword)
      ))
    )
  })
  
  // 排序
  filtered.sort((a, b) => {
    let comparison = 0
    
    switch (sortBy.value) {
      case 'chapter':
        comparison = a.chapterNumber - b.chapterNumber
        break
      case 'importance':
        comparison = (b.importance || 0) - (a.importance || 0)
        break
      case 'created':
        comparison = new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        break
      case 'tokens':
        comparison = (b.tokenCost || 0) - (a.tokenCost || 0)
        break
    }
    
    return sortReverse.value ? -comparison : comparison
  })
  
  return filtered
})

const averageCompressionRatio = computed(() => {
  if (props.summaries.length === 0) return 0
  
  const total = props.summaries.reduce((sum, summary) => {
    return sum + (summary.compressionRatio || 0)
  }, 0)
  
  return Math.round((total / props.summaries.length) * 10) / 10
})

const totalTokensSaved = computed(() => {
  return props.summaries.reduce((total, summary) => {
    const original = summary.originalLength || 0
    const compressed = summary.tokenCost || 0
    return total + Math.max(0, original - compressed)
  }, 0)
})

const averageImportance = computed(() => {
  if (props.summaries.length === 0) return 0
  
  const total = props.summaries.reduce((sum, summary) => {
    return sum + (summary.importance || 0)
  }, 0)
  
  return Math.round((total / props.summaries.length) * 100)
})

// 方法
const selectSummary = (summary) => {
  selectedSummary.value = summary
  showDetailDrawer.value = true
}

const getImportanceType = (importance) => {
  if (importance >= 0.8) return 'danger'
  if (importance >= 0.6) return 'warning'
  if (importance >= 0.4) return 'primary'
  return 'info'
}

const getProgressColor = (importance) => {
  if (importance >= 0.8) return '#f56c6c'
  if (importance >= 0.6) return '#e6a23c'
  if (importance >= 0.4) return '#409eff'
  return '#67c23a'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString()
}

const handleSummaryAction = async (command, summary) => {
  switch (command) {
    case 'regenerate':
      await regenerateSummary(summary)
      break
    case 'edit':
      editSummary(summary)
      break
    case 'view-original':
      viewOriginalChapter(summary)
      break
    case 'compress':
      await compressSummary(summary)
      break
    case 'delete':
      await deleteSummary(summary)
      break
  }
}

const regenerateSummary = async (summary) => {
  try {
    await ElMessageBox.confirm(
      `确定要重新生成第${summary.chapterNumber}章的摘要吗？`,
      '确认重新生成',
      { type: 'question' }
    )
    
    // 找到对应的章节内容
    const chapter = novelStore.chapters.find(c => c.id === summary.chapterNumber)
    if (chapter) {
      emit('generate', {
        chapterNumber: summary.chapterNumber,
        title: summary.title,
        content: chapter.content || chapter.outline || ''
      })
    } else {
      ElMessage.error('找不到对应的章节内容')
    }
  } catch (error) {
    // 用户取消
  }
}

const editSummary = (summary) => {
  editingSummary.value = { ...summary }
  showEditDialog.value = true
}

const saveEditedSummary = async () => {
  try {
    emit('update', editingSummary.value.chapterNumber, editingSummary.value)
    showEditDialog.value = false
    ElMessage.success('摘要更新成功')
  } catch (error) {
    ElMessage.error('更新失败：' + error.message)
  }
}

const viewOriginalChapter = (summary) => {
  const chapter = novelStore.chapters.find(c => c.id === summary.chapterNumber)
  if (chapter) {
    // 这里可以打开一个对话框显示原始内容，或者跳转到编辑器
    ElMessage.info('查看原文功能开发中...')
  } else {
    ElMessage.error('找不到对应的章节内容')
  }
}

const compressSummary = async (summary) => {
  try {
    await ElMessageBox.confirm(
      '进一步压缩将减少Token使用，但可能丢失部分信息。确定要继续吗？',
      '压缩确认',
      { type: 'warning' }
    )
    
    // 实现压缩逻辑
    ElMessage.info('压缩功能开发中...')
  } catch (error) {
    // 用户取消
  }
}

const deleteSummary = async (summary) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除第${summary.chapterNumber}章的摘要吗？此操作不可恢复。`,
      '确认删除',
      { type: 'error' }
    )
    
    emit('delete', summary.chapterNumber)
  } catch (error) {
    // 用户取消
  }
}

const handleSelectAll = (checked) => {
  if (checked) {
    selectedChapters.value = availableChapters.value.map(chapter => chapter.id)
  } else {
    selectedChapters.value = []
  }
}

const startBatchGenerate = async () => {
  showBatchGenerateDialog.value = false
  
  for (const chapterId of selectedChapters.value) {
    const chapter = novelStore.chapters.find(c => c.id === chapterId)
    if (chapter) {
      try {
        emit('generate', {
          chapterNumber: chapter.id,
          title: chapter.title,
          content: chapter.content || chapter.outline || ''
        })
        
        // 添加延迟避免API限制
        await new Promise(resolve => setTimeout(resolve, 2000))
      } catch (error) {
        console.error(`生成第${chapterId}章摘要失败:`, error)
      }
    }
  }
  
  selectedChapters.value = []
  selectAllChapters.value = false
}

const refreshSummaries = () => {
  ElMessage.success('摘要列表已刷新')
}

// 监听选中章节变化
watch(selectedChapters, (newVal) => {
  selectAllChapters.value = newVal.length === availableChapters.value.length && availableChapters.value.length > 0
})
</script>

<style scoped>
.chapter-summary-manager {
  padding: 20px;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.manager-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.summary-stats {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.stat-icon {
  font-size: 24px;
  margin-right: 12px;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.summaries-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.list-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;
}

.list-controls {
  display: flex;
  align-items: center;
}

.summaries-list {
  max-height: 600px;
  overflow-y: auto;
}

.summary-item {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.summary-item:hover {
  background: #f8f9fa;
}

.summary-item.selected {
  background: #e6f7ff;
  border-left: 4px solid #409eff;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.chapter-info {
  flex: 1;
}

.chapter-number {
  font-size: 12px;
  color: #909399;
  background: #f4f4f5;
  padding: 2px 8px;
  border-radius: 4px;
  margin-right: 8px;
}

.chapter-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 8px 0 0 0;
}

.summary-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-content {
  margin-bottom: 12px;
}

.summary-text {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 12px;
}

.summary-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-section {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.detail-label {
  font-size: 13px;
  color: #909399;
  margin-right: 8px;
  min-width: 80px;
}

.more-count {
  font-size: 12px;
  color: #909399;
  margin-left: 4px;
}

.summary-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #909399;
}

.token-usage {
  font-weight: 500;
  color: #409eff;
}

.compression-ratio {
  margin-left: 4px;
  color: #67c23a;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.summary-detail {
  padding: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.detail-header h3 {
  margin: 0;
  color: #303133;
}

.detail-actions {
  display: flex;
  gap: 8px;
}

.detail-content {
  margin-top: 20px;
}

.detail-content h4 {
  color: #303133;
  margin: 20px 0 8px 0;
  font-size: 16px;
}

.full-summary {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  line-height: 1.6;
  color: #606266;
}

.detail-content ul {
  margin: 8px 0;
  padding-left: 20px;
}

.detail-content li {
  margin-bottom: 4px;
  color: #606266;
}

.batch-generate-content {
  max-height: 400px;
  overflow-y: auto;
}

.chapters-selection {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.chapter-checkbox {
  margin-bottom: 12px;
  padding: 8px;
  border-radius: 4px;
  transition: background 0.3s;
}

.chapter-checkbox:hover {
  background: #f8f9fa;
}

.chapter-info {
  color: #909399;
  font-size: 12px;
  margin-left: 8px;
}

:deep(.el-drawer__body) {
  padding: 0;
}

:deep(.el-descriptions__body) {
  background: #fafafa;
}
</style>
