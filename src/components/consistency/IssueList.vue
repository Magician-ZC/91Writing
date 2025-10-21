<template>
  <div class="issue-list">
    <el-empty v-if="issues.length === 0" description="暂无问题">
      <template #image>
        <el-icon size="100" color="#67c23a"><CircleCheck /></el-icon>
      </template>
      <template #description>
        <span>太棒了！没有发现一致性问题</span>
      </template>
    </el-empty>
    
    <div v-else class="issues-container">
      <el-collapse v-model="activeNames">
        <el-collapse-item
          v-for="issue in issues"
          :key="issue.id"
          :name="issue.id"
          :class="['issue-item', `severity-${issue.severity}`]"
        >
          <template #title>
            <div class="issue-title">
              <div class="title-left">
                <el-tag 
                  :type="getSeverityTagType(issue.severity)"
                  size="large"
                  effect="dark"
                >
                  {{ getSeverityLabel(issue.severity) }}
                </el-tag>
                <span class="title-text">{{ issue.title }}</span>
              </div>
              
              <div class="title-right">
                <el-tag 
                  v-if="issue.chapterNumber"
                  type="info"
                  size="small"
                >
                  第{{ issue.chapterNumber }}章
                </el-tag>
                <el-tag 
                  v-if="issue.status !== 'unresolved'"
                  :type="getStatusTagType(issue.status)"
                  size="small"
                >
                  {{ getStatusLabel(issue.status) }}
                </el-tag>
              </div>
            </div>
          </template>

          <div class="issue-content">
            <!-- 问题详情 -->
            <el-descriptions :column="1" border size="default">
              <el-descriptions-item label="问题分类">
                <el-tag>{{ getCategoryLabel(issue.category) }}</el-tag>
              </el-descriptions-item>
              
              <el-descriptions-item label="问题描述">
                <div class="description-text">{{ issue.description }}</div>
              </el-descriptions-item>
              
              <el-descriptions-item 
                v-if="issue.locationText"
                label="问题位置"
              >
                <el-tag type="warning" class="location-tag">
                  {{ issue.locationText }}
                </el-tag>
              </el-descriptions-item>
              
              <el-descriptions-item 
                v-if="issue.conflictWith"
                label="冲突信息"
              >
                <div class="conflict-info">{{ issue.conflictWith }}</div>
              </el-descriptions-item>
              
              <el-descriptions-item 
                v-if="issue.aiConfidence"
                label="AI置信度"
              >
                <el-progress 
                  :percentage="Math.round(issue.aiConfidence * 100)"
                  :color="getConfidenceColor(issue.aiConfidence)"
                  :stroke-width="12"
                >
                  <span class="percentage-label">
                    {{ Math.round(issue.aiConfidence * 100) }}%
                  </span>
                </el-progress>
              </el-descriptions-item>
            </el-descriptions>

            <!-- AI修复建议 -->
            <div v-if="issue.suggestions && issue.suggestions.length > 0" class="suggestions-section">
              <h4>
                <el-icon><Lightbulb /></el-icon>
                AI修复建议
              </h4>
              <el-timeline>
                <el-timeline-item
                  v-for="(suggestion, index) in issue.suggestions"
                  :key="index"
                  :icon="Star"
                  color="#409eff"
                >
                  <div class="suggestion-item">
                    <el-tag size="small" type="info">{{ suggestion.type }}</el-tag>
                    <span class="suggestion-content">{{ suggestion.content }}</span>
                  </div>
                </el-timeline-item>
              </el-timeline>
            </div>

            <!-- 用户备注 -->
            <div v-if="issue.userNote" class="user-note">
              <el-alert
                type="success"
                :closable="false"
              >
                <template #title>
                  <strong>处理说明:</strong> {{ issue.userNote }}
                </template>
              </el-alert>
            </div>

            <!-- 操作按钮 -->
            <div v-if="issue.status === 'unresolved'" class="issue-actions">
              <el-space wrap>
                <el-button 
                  type="success" 
                  size="default"
                  @click="showResolveDialog(issue)"
                >
                  <el-icon><Check /></el-icon>
                  标记为已解决
                </el-button>
                <el-button 
                  type="warning"
                  size="default"
                  @click="markAsIgnored(issue)"
                >
                  <el-icon><Hide /></el-icon>
                  忽略此问题
                </el-button>
                <el-button 
                  type="info"
                  size="default"
                  @click="markAsFalsePositive(issue)"
                >
                  <el-icon><Close /></el-icon>
                  标记为误报
                </el-button>
              </el-space>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>

    <!-- 解决问题对话框 -->
    <el-dialog
      v-model="resolveDialogVisible"
      title="标记问题为已解决"
      width="500px"
    >
      <el-form :model="resolveForm" label-width="80px">
        <el-form-item label="问题">
          <el-text>{{ currentIssue?.title }}</el-text>
        </el-form-item>
        
        <el-form-item label="处理说明">
          <el-input
            v-model="resolveForm.note"
            type="textarea"
            :rows="4"
            placeholder="请说明如何解决了这个问题（可选）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="resolveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmResolve">
          确认解决
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { 
  Lightbulb, Star, Check, Hide, Close, CircleCheck 
} from '@element-plus/icons-vue'

const props = defineProps({
  issues: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['resolve'])

const activeNames = ref([])
const resolveDialogVisible = ref(false)
const resolveForm = ref({
  note: ''
})
const currentIssue = ref(null)

const showResolveDialog = (issue) => {
  currentIssue.value = issue
  resolveForm.value.note = ''
  resolveDialogVisible.value = true
}

const confirmResolve = () => {
  emit('resolve', currentIssue.value, 'resolved', resolveForm.value.note)
  resolveDialogVisible.value = false
}

const markAsIgnored = async (issue) => {
  try {
    await ElMessageBox.confirm(
      '确定要忽略这个问题吗？',
      '确认忽略',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    emit('resolve', issue, 'ignored', '用户选择忽略')
  } catch {
    // 用户取消
  }
}

const markAsFalsePositive = async (issue) => {
  try {
    await ElMessageBox.confirm(
      '确定这是误报吗？标记为误报可以帮助改进检测算法。',
      '确认标记为误报',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      }
    )
    emit('resolve', issue, 'false_positive', '用户标记为误报')
  } catch {
    // 用户取消
  }
}

// 辅助方法
const getSeverityLabel = (severity) => {
  const labels = {
    critical: '严重',
    warning: '警告',
    info: '提示'
  }
  return labels[severity] || severity
}

const getSeverityTagType = (severity) => {
  const types = {
    critical: 'danger',
    warning: 'warning',
    info: 'info'
  }
  return types[severity] || ''
}

const getStatusLabel = (status) => {
  const labels = {
    resolved: '已解决',
    ignored: '已忽略',
    false_positive: '误报'
  }
  return labels[status] || status
}

const getStatusTagType = (status) => {
  const types = {
    resolved: 'success',
    ignored: 'info',
    false_positive: 'warning'
  }
  return types[status] || ''
}

const getCategoryLabel = (category) => {
  const labels = {
    worldview: '世界观',
    character: '角色',
    timeline: '时间线',
    logic: '逻辑',
    setting: '设定'
  }
  return labels[category] || category
}

const getConfidenceColor = (confidence) => {
  if (confidence > 0.8) return '#67c23a'
  if (confidence > 0.6) return '#e6a23c'
  return '#f56c6c'
}
</script>

<style scoped>
.issue-list {
  padding: 16px 0;
}

.issues-container {
  max-height: 800px;
  overflow-y: auto;
}

.issue-item {
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;
}

.issue-item.severity-critical {
  border-left: 4px solid #f56c6c;
}

.issue-item.severity-warning {
  border-left: 4px solid #e6a23c;
}

.issue-item.severity-info {
  border-left: 4px solid #409eff;
}

.issue-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-right: 16px;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.title-text {
  font-weight: 500;
  font-size: 15px;
  color: #303133;
}

.title-right {
  display: flex;
  gap: 8px;
}

.issue-content {
  padding: 20px;
  background: #fafafa;
}

.description-text {
  line-height: 1.6;
  color: #606266;
}

.location-tag {
  font-family: 'Consolas', 'Monaco', monospace;
  white-space: pre-wrap;
  word-break: break-all;
  display: inline-block;
  max-width: 100%;
}

.conflict-info {
  color: #f56c6c;
  font-weight: 500;
  line-height: 1.6;
}

.suggestions-section {
  margin-top: 24px;
  padding: 20px;
  background: #ecf5ff;
  border-radius: 8px;
  border: 1px solid #b3d8ff;
}

.suggestions-section h4 {
  margin: 0 0 16px;
  color: #409eff;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.suggestion-content {
  color: #606266;
  line-height: 1.6;
}

.user-note {
  margin-top: 20px;
}

.issue-actions {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
  text-align: right;
}

.percentage-label {
  font-size: 12px;
  font-weight: 600;
}
</style>

