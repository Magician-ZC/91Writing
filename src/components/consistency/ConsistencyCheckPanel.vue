<template>
  <div class="consistency-panel">
    <!-- 检测配置 -->
    <el-card v-if="!checking && !checkResult" shadow="never" class="check-config">
      <template #header>
        <div class="card-header">
          <span>🔍 一致性检测</span>
          <el-tag type="info">AI驱动的智能检测</el-tag>
        </div>
      </template>

      <el-form :model="config" label-width="100px" class="config-form">
        <el-form-item label="检测类型">
          <el-radio-group v-model="config.checkType">
            <el-radio label="worldview">
              <span class="radio-label">
                🌍 世界观检测
                <el-text size="small" type="info">检测魔法、等级、设定矛盾</el-text>
              </span>
            </el-radio>
            <el-radio label="character">
              <span class="radio-label">
                👤 角色检测
                <el-text size="small" type="info">检测角色特征一致性</el-text>
              </span>
            </el-radio>
            <el-radio label="timeline">
              <span class="radio-label">
                ⏰ 时间线检测
                <el-text size="small" type="info">检测时间逻辑冲突</el-text>
              </span>
            </el-radio>
            <el-radio label="full">
              <span class="radio-label">
                🎯 全面检测
                <el-text size="small" type="info">执行所有检测（推荐）</el-text>
              </span>
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="检测范围">
          <el-select
            v-model="config.chapterIds"
            multiple
            placeholder="选择章节（不选则检测全部章节）"
            style="width: 100%"
            clearable
            filterable
          >
            <el-option
              v-for="chapter in chapters"
              :key="chapter.id"
              :label="`第${chapter.chapterNumber}章 ${chapter.title}`"
              :value="chapter.id"
            />
          </el-select>
          <el-text size="small" type="info" class="mt-1">
            {{ config.chapterIds.length === 0 ? '将检测全部章节' : `已选择 ${config.chapterIds.length} 个章节` }}
          </el-text>
        </el-form-item>

        <el-form-item label="AI增强">
          <el-switch
            v-model="config.aiEnhanced"
            active-text="启用AI深度分析"
            inactive-text="仅规则检测"
          />
          <el-alert
            v-if="config.aiEnhanced"
            type="info"
            :closable="false"
            class="mt-2"
          >
            <template #title>
              AI增强检测会使用更多token，但能发现更深层次的语义问题
            </template>
          </el-alert>
          <el-alert
            v-else
            type="warning"
            :closable="false"
            class="mt-2"
          >
            <template #title>
              仅规则检测速度快、成本低，但可能遗漏一些深层问题
            </template>
          </el-alert>
        </el-form-item>
      </el-form>

      <div class="action-buttons">
        <el-button type="primary" size="large" @click="startCheck" :loading="starting">
          <el-icon><Search /></el-icon>
          开始检测
        </el-button>
        <el-button size="large" @click="viewHistory">
          <el-icon><Clock /></el-icon>
          查看历史
        </el-button>
      </div>
    </el-card>

    <!-- 检测进行中 -->
    <el-card v-if="checking" shadow="never" class="checking-status">
      <div class="checking-content">
        <el-icon class="rotating" size="64" color="#409eff">
          <Loading />
        </el-icon>
        <h2>正在检测中...</h2>
        <p class="progress-text">{{ checkingProgress }}</p>
        <el-progress 
          :percentage="progress" 
          :color="progressColor"
          :stroke-width="8"
        />
        <el-text size="small" type="info" class="mt-3">
          这可能需要几分钟时间，请耐心等待
        </el-text>
      </div>
    </el-card>

    <!-- 检测结果 -->
    <el-card v-if="checkResult && !checking" shadow="never" class="check-result">
      <template #header>
        <div class="result-header">
          <span>
            <el-icon><DocumentChecked /></el-icon>
            检测结果
          </span>
          <div class="header-actions">
            <el-button size="small" @click="exportReport">
              <el-icon><Download /></el-icon>
              导出报告
            </el-button>
            <el-button size="small" @click="reset">
              <el-icon><Refresh /></el-icon>
              重新检测
            </el-button>
          </div>
        </div>
      </template>

      <!-- 统计概览 -->
      <div class="result-summary">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon total">
                <el-icon size="32"><Warning /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ checkResult.totalIssues }}</div>
                <div class="stat-label">总问题数</div>
              </div>
            </div>
          </el-col>
          
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon critical">
                <el-icon size="32"><CircleClose /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value critical-text">{{ checkResult.criticalIssues }}</div>
                <div class="stat-label">严重问题</div>
              </div>
            </div>
          </el-col>
          
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon warning">
                <el-icon size="32"><WarningFilled /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value warning-text">{{ checkResult.warningIssues }}</div>
                <div class="stat-label">警告问题</div>
              </div>
            </div>
          </el-col>
          
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon resolved">
                <el-icon size="32"><CircleCheck /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value resolved-text">{{ resolvedCount }}</div>
                <div class="stat-label">已解决</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 问题列表 -->
      <el-tabs v-model="activeTab" class="issue-tabs">
        <el-tab-pane name="all">
          <template #label>
            <span>
              <el-icon><List /></el-icon>
              全部问题 ({{ allIssues.length }})
            </span>
          </template>
          <IssueList :issues="allIssues" @resolve="handleResolve" />
        </el-tab-pane>
        
        <el-tab-pane name="critical">
          <template #label>
            <span>
              <el-icon><CircleClose /></el-icon>
              严重 ({{ criticalIssues.length }})
            </span>
          </template>
          <IssueList :issues="criticalIssues" @resolve="handleResolve" />
        </el-tab-pane>
        
        <el-tab-pane name="warning">
          <template #label>
            <span>
              <el-icon><Warning /></el-icon>
              警告 ({{ warningIssues.length }})
            </span>
          </template>
          <IssueList :issues="warningIssues" @resolve="handleResolve" />
        </el-tab-pane>
        
        <el-tab-pane name="resolved">
          <template #label>
            <span>
              <el-icon><CircleCheck /></el-icon>
              已解决 ({{ resolvedCount }})
            </span>
          </template>
          <IssueList :issues="resolvedIssues" @resolve="handleResolve" />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 历史记录对话框 -->
    <el-dialog
      v-model="historyDialogVisible"
      title="检测历史记录"
      width="80%"
    >
      <el-table :data="historyList" style="width: 100%" stripe>
        <el-table-column prop="checkType" label="检测类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getCheckTypeTagType(row.checkType)">
              {{ getCheckTypeLabel(row.checkType) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="totalIssues" label="问题数" width="100">
          <template #default="{ row }">
            <el-badge :value="row.totalIssues" :type="row.totalIssues > 0 ? 'danger' : 'success'">
              {{ row.totalIssues }}
            </el-badge>
          </template>
        </el-table-column>
        
        <el-table-column prop="criticalIssues" label="严重" width="80">
          <template #default="{ row }">
            <span class="critical-text">{{ row.criticalIssues }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="warningIssues" label="警告" width="80">
          <template #default="{ row }">
            <span class="warning-text">{{ row.warningIssues }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="createdAt" label="检测时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" fixed="right" width="120">
          <template #default="{ row }">
            <el-button
              size="small"
              type="primary"
              @click="viewCheckResult(row.id)"
              :disabled="row.status !== 'completed'"
            >
              查看结果
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Loading, Warning, CircleClose, WarningFilled, CircleCheck,
  Search, Clock, DocumentChecked, Download, Refresh, List
} from '@element-plus/icons-vue'
import consistencyService from '@/services/consistencyService'
import IssueList from './IssueList.vue'

const props = defineProps({
  novelId: {
    type: String,
    required: true
  },
  chapters: {
    type: Array,
    default: () => []
  }
})

// 配置
const config = ref({
  checkType: 'worldview',
  chapterIds: [],
  aiEnhanced: true
})

// 状态
const checking = ref(false)
const starting = ref(false)
const checkingProgress = ref('准备中...')
const progress = ref(0)
const checkResult = ref(null)
const activeTab = ref('all')
const historyDialogVisible = ref(false)
const historyList = ref([])

// 计算属性
const allIssues = computed(() => checkResult.value?.issues || [])
const criticalIssues = computed(() => 
  allIssues.value.filter(i => i.severity === 'critical' && i.status === 'unresolved')
)
const warningIssues = computed(() => 
  allIssues.value.filter(i => i.severity === 'warning' && i.status === 'unresolved')
)
const resolvedIssues = computed(() => 
  allIssues.value.filter(i => i.status !== 'unresolved')
)
const resolvedCount = computed(() => resolvedIssues.value.length)

const progressColor = computed(() => {
  if (progress.value < 30) return '#409eff'
  if (progress.value < 70) return '#e6a23c'
  return '#67c23a'
})

// 开始检测
const startCheck = async () => {
  starting.value = true
  
  try {
    const response = await consistencyService.createCheck(
      props.novelId,
      config.value
    )
    
    const checkId = response.data.id
    
    checking.value = true
    starting.value = false
    progress.value = 0
    checkingProgress.value = '检测任务已创建，开始分析...'
    
    // 轮询检测状态
    pollCheckStatus(checkId)
  } catch (error) {
    ElMessage.error('检测启动失败: ' + (error.message || '未知错误'))
    starting.value = false
  }
}

// 轮询检测状态
const pollCheckStatus = async (checkId) => {
  const maxAttempts = 60 // 最多轮询60次（2分钟）
  let attempts = 0
  
  const interval = setInterval(async () => {
    attempts++
    
    if (attempts > maxAttempts) {
      clearInterval(interval)
      checking.value = false
      ElMessage.warning('检测超时，请查看历史记录')
      return
    }
    
    try {
      const response = await consistencyService.getCheckResult(checkId)
      const data = response.data
      
      if (data.status === 'processing') {
        // 更新进度
        checkingProgress.value = '正在分析章节内容和世界观设定...'
        progress.value = Math.min(90, 20 + attempts * 3)
      } else if (data.status === 'completed') {
        // 检测完成
        clearInterval(interval)
        progress.value = 100
        checkingProgress.value = '检测完成!'
        
        setTimeout(() => {
          checking.value = false
          checkResult.value = data
          
          // 显示结果提示
          if (data.totalIssues === 0) {
            ElMessage.success('恭喜！未发现一致性问题')
          } else if (data.criticalIssues > 0) {
            ElMessage.warning(`发现 ${data.criticalIssues} 个严重问题，请及时处理`)
          } else {
            ElMessage.info(`发现 ${data.totalIssues} 个问题，建议查看`)
          }
        }, 500)
      } else if (data.status === 'failed') {
        clearInterval(interval)
        checking.value = false
        ElMessage.error('检测失败，请重试')
      }
    } catch (error) {
      console.error('获取检测状态失败:', error)
    }
  }, 2000) // 每2秒轮询一次
}

// 处理问题解决
const handleResolve = async (issue, status, note) => {
  try {
    await consistencyService.resolveIssue(issue.id, {
      status,
      userNote: note
    })
    
    // 更新本地状态
    issue.status = status
    issue.userNote = note
    issue.resolvedAt = new Date().toISOString()
    
    ElMessage.success('操作成功')
  } catch (error) {
    ElMessage.error('操作失败: ' + (error.message || '未知错误'))
  }
}

// 查看历史
const viewHistory = async () => {
  try {
    const response = await consistencyService.getHistory(props.novelId)
    historyList.value = response.data
    historyDialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取历史失败: ' + (error.message || '未知错误'))
  }
}

// 查看历史检测结果
const viewCheckResult = async (checkId) => {
  try {
    const response = await consistencyService.getCheckResult(checkId)
    checkResult.value = response.data
    historyDialogVisible.value = false
    activeTab.value = 'all'
  } catch (error) {
    ElMessage.error('获取结果失败: ' + (error.message || '未知错误'))
  }
}

// 重置
const reset = () => {
  checkResult.value = null
  config.value = {
    checkType: 'worldview',
    chapterIds: [],
    aiEnhanced: true
  }
  progress.value = 0
  activeTab.value = 'all'
}

// 导出报告
const exportReport = () => {
  if (!checkResult.value) return
  
  // 生成报告内容
  const report = {
    检测类型: getCheckTypeLabel(checkResult.value.checkType),
    检测时间: formatDate(checkResult.value.createdAt),
    总问题数: checkResult.value.totalIssues,
    严重问题: checkResult.value.criticalIssues,
    警告问题: checkResult.value.warningIssues,
    已解决: resolvedCount.value,
    问题列表: checkResult.value.issues.map(issue => ({
      严重程度: getSeverityLabel(issue.severity),
      标题: issue.title,
      描述: issue.description,
      章节: issue.chapterNumber ? `第${issue.chapterNumber}章` : '-',
      状态: getIssueStatusLabel(issue.status),
    }))
  }
  
  // 下载JSON文件
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `一致性检测报告_${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  ElMessage.success('报告已导出')
}

// 辅助方法
const getCheckTypeLabel = (type) => {
  const labels = {
    worldview: '世界观',
    character: '角色',
    timeline: '时间线',
    full: '全面'
  }
  return labels[type] || type
}

const getCheckTypeTagType = (type) => {
  const types = {
    worldview: 'primary',
    character: 'success',
    timeline: 'warning',
    full: 'danger'
  }
  return types[type] || ''
}

const getStatusLabel = (status) => {
  const labels = {
    pending: '等待中',
    processing: '检测中',
    completed: '已完成',
    failed: '失败'
  }
  return labels[status] || status
}

const getStatusTagType = (status) => {
  const types = {
    pending: 'info',
    processing: 'warning',
    completed: 'success',
    failed: 'danger'
  }
  return types[status] || ''
}

const getSeverityLabel = (severity) => {
  const labels = {
    critical: '严重',
    warning: '警告',
    info: '提示'
  }
  return labels[severity] || severity
}

const getIssueStatusLabel = (status) => {
  const labels = {
    unresolved: '未解决',
    resolved: '已解决',
    ignored: '已忽略',
    false_positive: '误报'
  }
  return labels[status] || status
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

// 暴露方法
defineExpose({
  startCheck,
  reset
})
</script>

<style scoped>
.consistency-panel {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.check-config,
.checking-status,
.check-result {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.config-form {
  padding: 20px 0;
}

.radio-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mt-1 {
  margin-top: 4px;
  display: block;
}

.mt-2 {
  margin-top: 8px;
}

.mt-3 {
  margin-top: 12px;
}

.action-buttons {
  margin-top: 32px;
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
}

.checking-content {
  text-align: center;
  padding: 80px 20px;
}

.checking-content h2 {
  margin: 24px 0 12px;
  color: #303133;
}

.progress-text {
  color: #606266;
  margin-bottom: 24px;
  font-size: 14px;
}

.rotating {
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.result-summary {
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-icon.critical {
  background: linear-gradient(135deg, #f56c6c 0%, #e74c3c 100%);
  color: white;
}

.stat-icon.warning {
  background: linear-gradient(135deg, #e6a23c 0%, #f39c12 100%);
  color: white;
}

.stat-icon.resolved {
  background: linear-gradient(135deg, #67c23a 0%, #27ae60 100%);
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
}

.stat-value.critical-text {
  color: #f56c6c;
}

.stat-value.warning-text {
  color: #e6a23c;
}

.stat-value.resolved-text {
  color: #67c23a;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.issue-tabs {
  margin-top: 20px;
}

.critical-text {
  color: #f56c6c;
  font-weight: 600;
}

.warning-text {
  color: #e6a23c;
  font-weight: 600;
}
</style>

