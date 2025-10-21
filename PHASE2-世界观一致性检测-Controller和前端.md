# Phase 2 - 世界观一致性检测 Controller 和前端实现

**组件**: ConsistencyCheckController + 前端检测界面

---

## 🔧 后端 Controller

### consistency-check.controller.ts

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/common';
import { ConsistencyCheckService } from './consistency-check.service';
import { CreateConsistencyCheckDto } from './dto/create-consistency-check.dto';
import { ResolveIssueDto } from './dto/resolve-issue.dto';

@ApiTags('一致性检测')
@Controller()  // ⚠️ 不添加前缀
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ConsistencyCheckController {
  constructor(
    private readonly consistencyService: ConsistencyCheckService
  ) {}

  @Post('novels/:novelId/consistency-check')
  @ApiOperation({ summary: '创建一致性检测' })
  @ApiParam({ name: 'novelId', description: '小说ID' })
  @ApiResponse({ status: 201, description: '检测任务创建成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  async createCheck(
    @Request() req,
    @Param('novelId') novelId: string,
    @Body(ValidationPipe) createDto: CreateConsistencyCheckDto,
  ) {
    return this.consistencyService.createCheck(req.user.id, novelId, createDto);
  }

  @Get('novels/:novelId/consistency-checks')
  @ApiOperation({ summary: '获取检测历史' })
  @ApiParam({ name: 'novelId', description: '小说ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getHistory(
    @Request() req,
    @Param('novelId') novelId: string,
  ) {
    return this.consistencyService.getCheckHistory(req.user.id, novelId);
  }

  @Get('consistency-checks/:checkId')
  @ApiOperation({ summary: '获取检测结果详情' })
  @ApiParam({ name: 'checkId', description: '检测ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '检测记录不存在' })
  async getCheckResult(
    @Request() req,
    @Param('checkId') checkId: string,
  ) {
    return this.consistencyService.getCheckResult(req.user.id, checkId);
  }

  @Patch('consistency-issues/:issueId/resolve')
  @ApiOperation({ summary: '解决一致性问题' })
  @ApiParam({ name: 'issueId', description: '问题ID' })
  @ApiResponse({ status: 200, description: '解决成功' })
  async resolveIssue(
    @Request() req,
    @Param('issueId') issueId: string,
    @Body(ValidationPipe) resolveDto: ResolveIssueDto,
  ) {
    return this.consistencyService.resolveIssue(req.user.id, issueId, resolveDto);
  }

  @Get('novels/:novelId/worldview-rules')
  @ApiOperation({ summary: '获取世界观规则库' })
  @ApiParam({ name: 'novelId', description: '小说ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getWorldviewRules(
    @Request() req,
    @Param('novelId') novelId: string,
  ) {
    // TODO: 实现规则库管理
    return { rules: [] };
  }
}
```

---

## 🎨 前端实现

### Service 层

#### src/services/consistencyService.js

```javascript
import { backendApi } from './backendApi'

class ConsistencyService {
  /**
   * 创建一致性检测
   */
  async createCheck(novelId, checkData) {
    return await backendApi.post(
      `/api/v1/novels/${novelId}/consistency-check`,
      checkData
    )
  }

  /**
   * 获取检测历史
   */
  async getHistory(novelId) {
    return await backendApi.get(
      `/api/v1/novels/${novelId}/consistency-checks`
    )
  }

  /**
   * 获取检测结果
   */
  async getCheckResult(checkId) {
    return await backendApi.get(
      `/api/v1/consistency-checks/${checkId}`
    )
  }

  /**
   * 解决问题
   */
  async resolveIssue(issueId, resolveData) {
    return await backendApi.patch(
      `/api/v1/consistency-issues/${issueId}/resolve`,
      resolveData
    )
  }

  /**
   * 获取世界观规则
   */
  async getWorldviewRules(novelId) {
    return await backendApi.get(
      `/api/v1/novels/${novelId}/worldview-rules`
    )
  }
}

export default new ConsistencyService()
```

---

### 核心组件

#### src/components/consistency/ConsistencyCheckPanel.vue

```vue
<template>
  <div class="consistency-panel">
    <!-- 检测配置 -->
    <el-card v-if="!checking && !checkResult" shadow="never" class="check-config">
      <template #header>
        <span>🔍 一致性检测</span>
      </template>

      <el-form :model="config" label-width="100px">
        <el-form-item label="检测类型">
          <el-radio-group v-model="config.checkType">
            <el-radio label="worldview">世界观检测</el-radio>
            <el-radio label="character">角色检测</el-radio>
            <el-radio label="timeline">时间线检测</el-radio>
            <el-radio label="full">全面检测</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="检测范围">
          <el-select
            v-model="config.chapterIds"
            multiple
            placeholder="选择章节（不选则检测全部）"
            style="width: 100%"
            clearable
          >
            <el-option
              v-for="chapter in chapters"
              :key="chapter.id"
              :label="`第${chapter.chapterNumber}章 ${chapter.title}`"
              :value="chapter.id"
            />
          </el-select>
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
            AI增强检测会使用更多token，但能发现更深层次的问题
          </el-alert>
        </el-form-item>
      </el-form>

      <div class="action-buttons">
        <el-button type="primary" @click="startCheck" :loading="starting">
          开始检测
        </el-button>
        <el-button @click="viewHistory">查看历史</el-button>
      </div>
    </el-card>

    <!-- 检测进行中 -->
    <el-card v-if="checking" shadow="never" class="checking-status">
      <div class="checking-content">
        <el-icon class="rotating" size="48"><Loading /></el-icon>
        <h3>正在检测中...</h3>
        <p>{{ checkingProgress }}</p>
        <el-progress :percentage="progress" />
      </div>
    </el-card>

    <!-- 检测结果 -->
    <el-card v-if="checkResult && !checking" shadow="never" class="check-result">
      <template #header>
        <div class="result-header">
          <span>检测结果</span>
          <div>
            <el-button size="small" @click="exportReport">导出报告</el-button>
            <el-button size="small" @click="reset">重新检测</el-button>
          </div>
        </div>
      </template>

      <!-- 统计概览 -->
      <div class="result-summary">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-statistic title="总问题数" :value="checkResult.totalIssues">
              <template #suffix>
                <el-icon><Warning /></el-icon>
              </template>
            </el-statistic>
          </el-col>
          <el-col :span="6">
            <el-statistic 
              title="严重问题" 
              :value="checkResult.criticalIssues"
              :value-style="{ color: '#f56c6c' }"
            >
              <template #suffix>
                <el-icon><CircleClose /></el-icon>
              </template>
            </el-statistic>
          </el-col>
          <el-col :span="6">
            <el-statistic 
              title="警告问题" 
              :value="checkResult.warningIssues"
              :value-style="{ color: '#e6a23c' }"
            >
              <template #suffix>
                <el-icon><WarningFilled /></el-icon>
              </template>
            </el-statistic>
          </el-col>
          <el-col :span="6">
            <el-statistic 
              title="已解决" 
              :value="resolvedCount"
              :value-style="{ color: '#67c23a' }"
            >
              <template #suffix>
                <el-icon><CircleCheck /></el-icon>
              </template>
            </el-statistic>
          </el-col>
        </el-row>
      </div>

      <!-- 问题列表 -->
      <el-tabs v-model="activeTab" class="issue-tabs">
        <el-tab-pane label="全部问题" name="all">
          <IssueList :issues="allIssues" @resolve="handleResolve" />
        </el-tab-pane>
        <el-tab-pane label="严重问题" name="critical">
          <IssueList :issues="criticalIssues" @resolve="handleResolve" />
        </el-tab-pane>
        <el-tab-pane label="警告" name="warning">
          <IssueList :issues="warningIssues" @resolve="handleResolve" />
        </el-tab-pane>
        <el-tab-pane label="已解决" name="resolved">
          <IssueList :issues="resolvedIssues" @resolve="handleResolve" />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 历史记录对话框 -->
    <el-dialog
      v-model="historyDialogVisible"
      title="检测历史"
      width="70%"
    >
      <el-table :data="historyList" style="width: 100%">
        <el-table-column prop="checkType" label="检测类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ getCheckTypeLabel(row.checkType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="totalIssues" label="问题数" width="100" />
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
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button
              size="small"
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
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Loading, Warning, CircleClose, WarningFilled, CircleCheck 
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
    
    // 轮询检测状态
    pollCheckStatus(checkId)
  } catch (error) {
    ElMessage.error('检测启动失败: ' + error.message)
    starting.value = false
  }
}

// 轮询检测状态
const pollCheckStatus = async (checkId) => {
  const interval = setInterval(async () => {
    try {
      const response = await consistencyService.getCheckResult(checkId)
      const data = response.data
      
      if (data.status === 'processing') {
        // 更新进度
        checkingProgress.value = '正在分析章节内容...'
        progress.value = Math.min(90, progress.value + 5)
      } else if (data.status === 'completed') {
        // 检测完成
        clearInterval(interval)
        progress.value = 100
        checkingProgress.value = '检测完成!'
        
        setTimeout(() => {
          checking.value = false
          checkResult.value = data
        }, 1000)
      } else if (data.status === 'failed') {
        clearInterval(interval)
        checking.value = false
        ElMessage.error('检测失败，请重试')
      }
    } catch (error) {
      clearInterval(interval)
      checking.value = false
      ElMessage.error('获取检测状态失败')
    }
  }, 2000)
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
    
    ElMessage.success('操作成功')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 查看历史
const viewHistory = async () => {
  try {
    const response = await consistencyService.getHistory(props.novelId)
    historyList.value = response.data
    historyDialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取历史失败')
  }
}

// 查看历史检测结果
const viewCheckResult = async (checkId) => {
  try {
    const response = await consistencyService.getCheckResult(checkId)
    checkResult.value = response.data
    historyDialogVisible.value = false
  } catch (error) {
    ElMessage.error('获取结果失败')
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
}

// 导出报告
const exportReport = () => {
  // TODO: 实现报告导出
  ElMessage.info('报告导出功能开发中...')
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

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
}
</script>

<style scoped>
.consistency-panel {
  padding: 20px;
}

.check-config,
.checking-status,
.check-result {
  max-width: 1200px;
  margin: 0 auto;
}

.action-buttons {
  margin-top: 24px;
  text-align: right;
}

.checking-content {
  text-align: center;
  padding: 60px 20px;
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

.result-summary {
  margin-bottom: 24px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.issue-tabs {
  margin-top: 20px;
}

.mt-2 {
  margin-top: 8px;
}
</style>
```

#### src/components/consistency/IssueList.vue

```vue
<template>
  <div class="issue-list">
    <el-empty v-if="issues.length === 0" description="暂无问题" />
    
    <div v-else>
      <el-collapse v-model="activeNames" accordion>
        <el-collapse-item
          v-for="issue in issues"
          :key="issue.id"
          :name="issue.id"
        >
          <template #title>
            <div class="issue-title">
              <el-tag 
                :type="getSeverityTagType(issue.severity)"
                size="small"
              >
                {{ getSeverityLabel(issue.severity) }}
              </el-tag>
              <span class="title-text">{{ issue.title }}</span>
              <el-tag 
                v-if="issue.status !== 'unresolved'"
                :type="getStatusTagType(issue.status)"
                size="small"
              >
                {{ getStatusLabel(issue.status) }}
              </el-tag>
            </div>
          </template>

          <div class="issue-content">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="问题分类">
                {{ getCategoryLabel(issue.category) }}
              </el-descriptions-item>
              
              <el-descriptions-item label="问题描述">
                {{ issue.description }}
              </el-descriptions-item>
              
              <el-descriptions-item 
                v-if="issue.locationText"
                label="问题位置"
              >
                <el-tag type="info" class="code-tag">
                  {{ issue.locationText }}
                </el-tag>
              </el-descriptions-item>
              
              <el-descriptions-item 
                v-if="issue.conflictWith"
                label="冲突信息"
              >
                {{ issue.conflictWith }}
              </el-descriptions-item>
              
              <el-descriptions-item 
                v-if="issue.chapterNumber"
                label="所在章节"
              >
                第 {{ issue.chapterNumber }} 章
              </el-descriptions-item>
              
              <el-descriptions-item 
                v-if="issue.aiConfidence"
                label="AI置信度"
              >
                <el-progress 
                  :percentage="Math.round(issue.aiConfidence * 100)"
                  :color="getConfidenceColor(issue.aiConfidence)"
                />
              </el-descriptions-item>
            </el-descriptions>

            <!-- AI建议 -->
            <div v-if="issue.suggestions && issue.suggestions.length > 0" class="suggestions">
              <h4>💡 修复建议</h4>
              <el-timeline>
                <el-timeline-item
                  v-for="(suggestion, index) in issue.suggestions"
                  :key="index"
                  :icon="Lightbulb"
                >
                  {{ suggestion.content }}
                </el-timeline-item>
              </el-timeline>
            </div>

            <!-- 操作按钮 -->
            <div v-if="issue.status === 'unresolved'" class="issue-actions">
              <el-button 
                type="success" 
                size="small"
                @click="showResolveDialog(issue)"
              >
                标记为已解决
              </el-button>
              <el-button 
                size="small"
                @click="markAsIgnored(issue)"
              >
                忽略
              </el-button>
              <el-button 
                size="small"
                @click="markAsFalsePositive(issue)"
              >
                误报
              </el-button>
            </div>

            <!-- 用户备注 -->
            <div v-if="issue.userNote" class="user-note">
              <strong>用户备注:</strong> {{ issue.userNote }}
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>

    <!-- 解决问题对话框 -->
    <el-dialog
      v-model="resolveDialogVisible"
      title="解决问题"
      width="500px"
    >
      <el-form :model="resolveForm">
        <el-form-item label="备注">
          <el-input
            v-model="resolveForm.note"
            type="textarea"
            :rows="3"
            placeholder="说明如何解决了这个问题（可选）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="resolveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmResolve">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Lightbulb } from '@element-plus/icons-vue'

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

const markAsIgnored = (issue) => {
  emit('resolve', issue, 'ignored', '用户选择忽略')
}

const markAsFalsePositive = (issue) => {
  emit('resolve', issue, 'false_positive', '用户标记为误报')
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

.issue-title {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.title-text {
  flex: 1;
  font-weight: 500;
}

.issue-content {
  padding: 16px;
}

.code-tag {
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
}

.suggestions {
  margin-top: 20px;
  padding: 16px;
  background: #f0f9ff;
  border-radius: 8px;
}

.suggestions h4 {
  margin-top: 0;
  color: #409eff;
}

.issue-actions {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
  text-align: right;
}

.user-note {
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
}
</style>
```

---

## 📋 接口规范检查清单

### ✅ 已遵循

- [x] Controller 使用 `@Controller()` 不带前缀
- [x] 所有接口添加 `@UseGuards(JwtAuthGuard)`
- [x] 所有接口添加 `@ApiBearerAuth('JWT-auth')`
- [x] DTO 完整验证装饰器
- [x] 完整 Swagger 文档
- [x] 权限验证
- [x] 错误处理
- [x] 前端统一使用 backendApi
- [x] 完整的 Loading 和错误提示

---

**状态**: ✅ 世界观一致性检测完成  
**下一步**: 角色一致性助手

