<template>
  <div class="consistency-checker">
    <div class="checker-header">
      <h3>🔍 一致性检查</h3>
      <div class="header-actions">
        <el-button 
          type="primary" 
          size="small" 
          @click="startFullCheck"
          :loading="isChecking"
        >
          全面检查
        </el-button>
        <el-button 
          size="small" 
          @click="showCheckDialog = true"
        >
          检查新内容
        </el-button>
        <el-button 
          size="small" 
          @click="clearHistory"
          :disabled="tracking.contradictions.length === 0"
        >
          清空历史
        </el-button>
      </div>
    </div>

    <!-- 检查统计 -->
    <div class="check-stats">
      <el-row :gutter="16">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon">🔍</div>
            <div class="stat-content">
              <div class="stat-number">{{ totalChecks }}</div>
              <div class="stat-label">总检查次数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon">⚠️</div>
            <div class="stat-content">
              <div class="stat-number">{{ unresolved }}</div>
              <div class="stat-label">未解决问题</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <div class="stat-number">{{ resolved }}</div>
              <div class="stat-label">已解决</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <div class="stat-number">{{ consistencyRate }}%</div>
              <div class="stat-label">一致性评分</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 问题分类标签 -->
    <div class="issue-filters">
      <el-tag 
        v-for="category in issueCategories"
        :key="category.type"
        :type="category.type === selectedCategory ? 'primary' : 'info'"
        :effect="category.type === selectedCategory ? 'dark' : 'light'"
        @click="selectedCategory = category.type"
        style="margin-right: 8px; cursor: pointer;"
      >
        {{ category.label }} ({{ getIssueCount(category.type) }})
      </el-tag>
    </div>

    <!-- 问题列表 -->
    <div class="issues-container">
      <div v-if="filteredIssues.length === 0" class="empty-state">
        <el-empty 
          :description="selectedCategory === 'all' ? '暂无一致性问题' : `暂无${getCategoryLabel(selectedCategory)}问题`"
          :image-size="100"
        >
          <el-button type="primary" @click="startFullCheck">开始检查</el-button>
        </el-empty>
      </div>
      
      <div v-else class="issues-list">
        <div 
          v-for="issue in filteredIssues" 
          :key="issue.id"
          class="issue-item"
          :class="{ 'resolved': issue.resolved }"
        >
          <div class="issue-header">
            <div class="issue-info">
              <el-tag 
                :type="getSeverityType(issue.severity)"
                size="small"
              >
                {{ getSeverityText(issue.severity) }}
              </el-tag>
              <el-tag 
                :type="getIssueTypeColor(issue.type)"
                size="small"
                style="margin-left: 8px;"
              >
                {{ getIssueTypeText(issue.type) }}
              </el-tag>
              <span class="issue-time">{{ formatDate(issue.detectedAt) }}</span>
            </div>
            <div class="issue-actions">
              <el-button 
                v-if="!issue.resolved"
                size="small" 
                type="success"
                @click="resolveIssue(issue)"
              >
                标记已解决
              </el-button>
              <el-button 
                v-if="issue.resolved"
                size="small" 
                type="warning"
                @click="unresolveIssue(issue)"
              >
                重新打开
              </el-button>
              <el-dropdown @command="(cmd) => handleIssueAction(cmd, issue)">
                <el-button size="small" type="text">
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="details">
                      <el-icon><View /></el-icon>
                      查看详情
                    </el-dropdown-item>
                    <el-dropdown-item command="suggestion">
                      <el-icon><Message /></el-icon>
                      获取建议
                    </el-dropdown-item>
                    <el-dropdown-item command="ignore" divided>
                      <el-icon><Hide /></el-icon>
                      忽略此问题
                    </el-dropdown-item>
                    <el-dropdown-item command="delete" divided>
                      <el-icon><Delete /></el-icon>
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          
          <div class="issue-content">
            <div class="issue-description">{{ issue.description }}</div>
            
            <div v-if="issue.relatedContent" class="related-content">
              <details>
                <summary>相关内容</summary>
                <div class="content-preview">{{ issue.relatedContent.substring(0, 200) }}...</div>
              </details>
            </div>
            
            <div v-if="issue.suggestion" class="issue-suggestion">
              <div class="suggestion-label">💡 修改建议：</div>
              <div class="suggestion-content">{{ issue.suggestion }}</div>
            </div>
            
            <div v-if="issue.resolution" class="issue-resolution">
              <div class="resolution-label">✅ 解决方案：</div>
              <div class="resolution-content">{{ issue.resolution }}</div>
              <div class="resolution-time">解决时间：{{ formatDate(issue.resolvedAt) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 检查新内容对话框 -->
    <el-dialog
      v-model="showCheckDialog"
      title="检查内容一致性"
      width="600px"
    >
      <el-form :model="checkForm" label-width="100px">
        <el-form-item label="检查内容">
          <el-input
            v-model="checkForm.content"
            type="textarea"
            :rows="8"
            placeholder="输入要检查的文本内容"
          />
        </el-form-item>
        
        <el-form-item label="检查类型">
          <el-checkbox-group v-model="checkForm.types">
            <el-checkbox value="character">角色一致性</el-checkbox>
            <el-checkbox value="world">世界观一致性</el-checkbox>
            <el-checkbox value="plot">情节一致性</el-checkbox>
            <el-checkbox value="timeline">时间线检查</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showCheckDialog = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="checkContent"
          :loading="isChecking"
          :disabled="!checkForm.content.trim()"
        >
          开始检查
        </el-button>
      </template>
    </el-dialog>

    <!-- 问题详情对话框 -->
    <el-dialog
      v-model="showDetailsDialog"
      title="问题详情"
      width="700px"
    >
      <div v-if="selectedIssue" class="issue-details">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="问题类型">
            <el-tag :type="getIssueTypeColor(selectedIssue.type)">
              {{ getIssueTypeText(selectedIssue.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="严重程度">
            <el-tag :type="getSeverityType(selectedIssue.severity)">
              {{ getSeverityText(selectedIssue.severity) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="检测时间">
            {{ formatDateTime(selectedIssue.detectedAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="selectedIssue.resolved ? 'success' : 'warning'">
              {{ selectedIssue.resolved ? '已解决' : '待解决' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
        
        <div class="details-content">
          <h4>问题描述</h4>
          <p>{{ selectedIssue.description }}</p>
          
          <h4 v-if="selectedIssue.relatedContent">相关内容</h4>
          <div v-if="selectedIssue.relatedContent" class="related-content-full">
            {{ selectedIssue.relatedContent }}
          </div>
          
          <h4 v-if="selectedIssue.suggestion">修改建议</h4>
          <p v-if="selectedIssue.suggestion">{{ selectedIssue.suggestion }}</p>
          
          <h4 v-if="selectedIssue.resolution">解决方案</h4>
          <p v-if="selectedIssue.resolution">{{ selectedIssue.resolution }}</p>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="showDetailsDialog = false">关闭</el-button>
        <el-button 
          v-if="selectedIssue && !selectedIssue.resolved"
          type="success" 
          @click="resolveIssue(selectedIssue); showDetailsDialog = false"
        >
          标记已解决
        </el-button>
      </template>
    </el-dialog>

    <!-- 修改建议对话框 -->
    <el-dialog
      v-model="showSuggestionDialog"
      title="AI修改建议"
      width="600px"
    >
      <div v-if="aiSuggestion" class="ai-suggestion">
        <div class="suggestion-content">{{ aiSuggestion.content }}</div>
        <div class="suggestion-actions">
          <el-button @click="applySuggestion">应用建议</el-button>
          <el-button @click="showSuggestionDialog = false">稍后处理</el-button>
        </div>
      </div>
      <div v-else class="loading-suggestion">
        <el-skeleton :rows="4" animated />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  MoreFilled, View, Message, Hide, Delete
} from '@element-plus/icons-vue'

// Props
const props = defineProps({
  tracking: {
    type: Object,
    default: () => ({
      characterStates: {},
      worldRules: [],
      timeline: [],
      contradictions: []
    })
  }
})

// Emits
const emit = defineEmits(['check', 'resolve'])

// 响应式数据
const selectedCategory = ref('all')
const isChecking = ref(false)
const showCheckDialog = ref(false)
const showDetailsDialog = ref(false)
const showSuggestionDialog = ref(false)
const selectedIssue = ref(null)
const aiSuggestion = ref(null)

const checkForm = ref({
  content: '',
  types: ['character', 'world', 'plot']
})

const issueCategories = [
  { type: 'all', label: '全部' },
  { type: 'character_inconsistency', label: '角色问题' },
  { type: 'world_inconsistency', label: '世界观问题' },
  { type: 'plot_inconsistency', label: '情节问题' },
  { type: 'timeline_error', label: '时间线问题' }
]

// 计算属性
const allIssues = computed(() => {
  const issues = []
  
  // 从contradictions中提取问题
  props.tracking.contradictions.forEach((contradiction, index) => {
    if (contradiction.issues && Array.isArray(contradiction.issues)) {
      contradiction.issues.forEach((issue, issueIndex) => {
        issues.push({
          id: `${index}-${issueIndex}`,
          ...issue,
          relatedContent: contradiction.content,
          detectedAt: contradiction.detectedAt,
          resolved: issue.resolved || false
        })
      })
    }
  })
  
  return issues.sort((a, b) => new Date(b.detectedAt) - new Date(a.detectedAt))
})

const filteredIssues = computed(() => {
  if (selectedCategory.value === 'all') {
    return allIssues.value
  }
  return allIssues.value.filter(issue => issue.type === selectedCategory.value)
})

const totalChecks = computed(() => {
  return props.tracking.contradictions.length
})

const unresolved = computed(() => {
  return allIssues.value.filter(issue => !issue.resolved).length
})

const resolved = computed(() => {
  return allIssues.value.filter(issue => issue.resolved).length
})

const consistencyRate = computed(() => {
  if (allIssues.value.length === 0) return 100
  return Math.round((resolved.value / allIssues.value.length) * 100)
})

// 方法
const getIssueCount = (category) => {
  if (category === 'all') return allIssues.value.length
  return allIssues.value.filter(issue => issue.type === category).length
}

const getCategoryLabel = (category) => {
  const cat = issueCategories.find(c => c.type === category)
  return cat ? cat.label : '未知'
}

const getSeverityType = (severity) => {
  const types = {
    'high': 'danger',
    'medium': 'warning',
    'low': 'info'
  }
  return types[severity] || 'info'
}

const getSeverityText = (severity) => {
  const texts = {
    'high': '高',
    'medium': '中',
    'low': '低'
  }
  return texts[severity] || '未知'
}

const getIssueTypeColor = (type) => {
  const colors = {
    'character_inconsistency': 'danger',
    'world_inconsistency': 'warning',
    'plot_inconsistency': 'primary',
    'timeline_error': 'info'
  }
  return colors[type] || 'info'
}

const getIssueTypeText = (type) => {
  const texts = {
    'character_inconsistency': '角色不一致',
    'world_inconsistency': '世界观冲突',
    'plot_inconsistency': '情节矛盾',
    'timeline_error': '时间线错误'
  }
  return texts[type] || '未知类型'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString()
}

const startFullCheck = async () => {
  try {
    isChecking.value = true
    
    // 模拟全面检查
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    ElMessage.success('全面检查完成')
    emit('check', '')
  } catch (error) {
    ElMessage.error('检查失败：' + error.message)
  } finally {
    isChecking.value = false
  }
}

const checkContent = async () => {
  try {
    isChecking.value = true
    emit('check', checkForm.value.content)
    showCheckDialog.value = false
    
    // 重置表单
    checkForm.value = {
      content: '',
      types: ['character', 'world', 'plot']
    }
    
    ElMessage.success('内容检查完成')
  } catch (error) {
    ElMessage.error('检查失败：' + error.message)
  } finally {
    isChecking.value = false
  }
}

const resolveIssue = async (issue) => {
  try {
    const resolution = await ElMessageBox.prompt(
      '请输入解决方案说明：',
      '标记为已解决',
      {
        inputPlaceholder: '描述如何解决了这个问题...',
        inputType: 'textarea'
      }
    )
    
    issue.resolved = true
    issue.resolution = resolution.value
    issue.resolvedAt = new Date().toISOString()
    
    emit('resolve', issue.id)
    ElMessage.success('问题已标记为已解决')
  } catch (error) {
    // 用户取消
  }
}

const unresolveIssue = (issue) => {
  issue.resolved = false
  delete issue.resolution
  delete issue.resolvedAt
  ElMessage.info('问题已重新打开')
}

const handleIssueAction = async (command, issue) => {
  switch (command) {
    case 'details':
      selectedIssue.value = issue
      showDetailsDialog.value = true
      break
    case 'suggestion':
      await getSuggestion(issue)
      break
    case 'ignore':
      await ignoreIssue(issue)
      break
    case 'delete':
      await deleteIssue(issue)
      break
  }
}

const getSuggestion = async (issue) => {
  try {
    selectedIssue.value = issue
    showSuggestionDialog.value = true
    aiSuggestion.value = null
    
    // 模拟AI建议生成
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    aiSuggestion.value = {
      content: `针对"${issue.description}"的修改建议：\n\n1. 检查角色的性格设定是否与行为一致\n2. 确认世界观规则的应用是否正确\n3. 调整情节发展以符合逻辑\n4. 考虑添加过渡性描述来缓解突兀感`,
      issueId: issue.id
    }
  } catch (error) {
    ElMessage.error('获取建议失败：' + error.message)
    showSuggestionDialog.value = false
  }
}

const applySuggestion = () => {
  ElMessage.success('建议已应用，请在编辑器中手动修改内容')
  showSuggestionDialog.value = false
}

const ignoreIssue = async (issue) => {
  try {
    await ElMessageBox.confirm(
      '忽略后此问题将不再显示，确定要继续吗？',
      '确认忽略',
      { type: 'warning' }
    )
    
    issue.ignored = true
    ElMessage.success('问题已忽略')
  } catch (error) {
    // 用户取消
  }
}

const deleteIssue = async (issue) => {
  try {
    await ElMessageBox.confirm(
      '删除后此问题将永久移除，确定要继续吗？',
      '确认删除',
      { type: 'error' }
    )
    
    // 从数据中移除
    ElMessage.success('问题已删除')
  } catch (error) {
    // 用户取消
  }
}

const clearHistory = async () => {
  try {
    await ElMessageBox.confirm(
      '这将清空所有历史检查记录，确定要继续吗？',
      '清空确认',
      { type: 'warning' }
    )
    
    ElMessage.success('历史记录已清空')
  } catch (error) {
    // 用户取消
  }
}

// 生命周期
onMounted(() => {
  // 初始化
})
</script>

<style scoped>
.consistency-checker {
  padding: 20px;
}

.checker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.checker-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.check-stats {
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

.issue-filters {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.issues-container {
  background: white;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  overflow: hidden;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.issues-list {
  max-height: 600px;
  overflow-y: auto;
}

.issue-item {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.issue-item:hover {
  background: #f8f9fa;
}

.issue-item.resolved {
  opacity: 0.7;
  background: #f0f9ff;
}

.issue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.issue-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.issue-time {
  font-size: 13px;
  color: #909399;
  margin-left: 8px;
}

.issue-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.issue-content {
  margin-bottom: 8px;
}

.issue-description {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 12px;
}

.related-content {
  margin-bottom: 12px;
}

.related-content details {
  cursor: pointer;
}

.related-content summary {
  font-size: 13px;
  color: #909399;
  outline: none;
  user-select: none;
}

.content-preview {
  margin-top: 8px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 13px;
  color: #606266;
}

.issue-suggestion,
.issue-resolution {
  margin-top: 12px;
  padding: 12px;
  border-radius: 6px;
}

.issue-suggestion {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
}

.issue-resolution {
  background: #d1edff;
  border-left: 4px solid #409eff;
}

.suggestion-label,
.resolution-label {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.suggestion-content,
.resolution-content {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
}

.resolution-time {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.issue-details {
  padding: 20px;
}

.details-content {
  margin-top: 20px;
}

.details-content h4 {
  color: #303133;
  margin: 20px 0 8px 0;
  font-size: 16px;
}

.related-content-full {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  line-height: 1.6;
  color: #606266;
  max-height: 200px;
  overflow-y: auto;
}

.ai-suggestion {
  padding: 20px;
}

.suggestion-content {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  line-height: 1.6;
  color: #606266;
  margin-bottom: 16px;
  white-space: pre-line;
}

.suggestion-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.loading-suggestion {
  padding: 20px;
}

:deep(.el-descriptions__body) {
  background: #fafafa;
}
</style>
