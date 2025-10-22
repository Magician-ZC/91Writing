<template>
  <div class="video-api-config-admin">
    <el-card class="config-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">
            <el-icon><Setting /></el-icon>
            视频生成API配置
          </span>
          <el-tag type="success">管理员配置</el-tag>
        </div>
      </template>

      <el-tabs v-model="activeTab" type="border-card">
        <!-- Tab 1: API密钥配置 -->
        <el-tab-pane label="API密钥配置" name="keys">
          <el-form :model="configForm" label-width="200px" style="max-width: 800px">
            <!-- 火山引擎配置 -->
            <el-divider content-position="left">
              <el-icon><Connection /></el-icon>
              火山引擎（文生图）
            </el-divider>
            
            <el-form-item label="Access Key ID">
              <el-input 
                v-model="configForm.volcengineAccessKeyId" 
                placeholder="请输入火山引擎 Access Key ID"
                clearable
              />
            </el-form-item>
            
            <el-form-item label="Secret Access Key">
              <el-input 
                v-model="configForm.volcengineSecretAccessKey" 
                type="password" 
                show-password
                placeholder="请输入 Secret Access Key（加密存储）"
                clearable
              />
              <div class="form-tip">注意：密钥将使用AES-256加密后存储</div>
            </el-form-item>

            <el-form-item>
              <el-button 
                type="primary" 
                :icon="Connection" 
                @click="testConnection('volcengine')"
                :loading="testingConnection === 'volcengine'"
              >
                测试火山引擎连接
              </el-button>
            </el-form-item>

            <!-- 即梦配置 -->
            <el-divider content-position="left">
              <el-icon><Connection /></el-icon>
              即梦（图生视频）
            </el-divider>
            
            <el-form-item label="API Key">
              <el-input 
                v-model="configForm.jimengApiKey" 
                type="password" 
                show-password
                placeholder="请输入即梦 API Key（加密存储）"
                clearable
              />
            </el-form-item>

            <el-form-item>
              <el-button 
                type="primary" 
                :icon="Connection" 
                @click="testConnection('jimeng')"
                :loading="testingConnection === 'jimeng'"
              >
                测试即梦连接
              </el-button>
            </el-form-item>

            <!-- 可灵配置 -->
            <el-divider content-position="left">
              <el-icon><Connection /></el-icon>
              可灵（图生视频备选）
            </el-divider>
            
            <el-form-item label="API Key">
              <el-input 
                v-model="configForm.klingApiKey" 
                type="password" 
                show-password
                placeholder="请输入可灵 API Key（加密存储）"
                clearable
              />
            </el-form-item>

            <el-form-item>
              <el-button 
                type="primary" 
                :icon="Connection" 
                @click="testConnection('kling')"
                :loading="testingConnection === 'kling'"
              >
                测试可灵连接
              </el-button>
            </el-form-item>

            <!-- Provider选择 -->
            <el-divider content-position="left">
              <el-icon><Select /></el-icon>
              Provider选择
            </el-divider>
            
            <el-form-item label="图生视频Provider">
              <el-radio-group v-model="configForm.videoProvider">
                <el-radio label="jimeng">即梦（推荐）</el-radio>
                <el-radio label="kling">可灵（备选）</el-radio>
              </el-radio-group>
              <div class="form-tip">选择默认使用的图生视频服务商</div>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- Tab 2: 路径配置 -->
        <el-tab-pane label="路径配置" name="paths">
          <el-form :model="configForm" label-width="200px" style="max-width: 800px">
            <el-form-item label="FFmpeg路径">
              <el-input 
                v-model="configForm.ffmpegPath" 
                placeholder="/usr/bin/ffmpeg"
              >
                <template #append>
                  <el-button :icon="Search" @click="detectFFmpeg">自动检测</el-button>
                </template>
              </el-input>
              <div class="form-tip">FFmpeg可执行文件的路径</div>
            </el-form-item>
            
            <el-form-item label="视频存储路径">
              <el-input 
                v-model="configForm.videoStoragePath" 
                placeholder="/data/videos"
              />
              <div class="form-tip">生成的视频文件存储路径</div>
            </el-form-item>
            
            <el-form-item label="临时文件路径">
              <el-input 
                v-model="configForm.tempStoragePath" 
                placeholder="/tmp/video-generation"
              />
              <div class="form-tip">临时文件存储路径（图片、视频片段等）</div>
            </el-form-item>

            <el-alert
              title="路径权限提示"
              type="warning"
              :closable="false"
              show-icon
            >
              <div>请确保服务器对以上路径有读写权限</div>
              <div>建议使用绝对路径</div>
            </el-alert>
          </el-form>
        </el-tab-pane>

        <!-- Tab 3: 成本控制 -->
        <el-tab-pane label="成本控制" name="cost">
          <el-form :model="configForm" label-width="200px" style="max-width: 800px">
            <el-form-item label="用户每日配额">
              <el-input-number 
                v-model="configForm.userDailyQuota" 
                :min="0" 
                :max="100"
              />
              <span class="unit-label">个视频/天</span>
              <div class="form-tip">每个用户每天可以生成的视频数量</div>
            </el-form-item>
            
            <el-form-item label="用户每月配额">
              <el-input-number 
                v-model="configForm.userMonthlyQuota" 
                :min="0" 
                :max="1000"
              />
              <span class="unit-label">个视频/月</span>
              <div class="form-tip">每个用户每月可以生成的视频数量</div>
            </el-form-item>
            
            <el-form-item label="月度预算">
              <el-input-number 
                v-model="configForm.monthlyBudget" 
                :min="0" 
                :precision="2"
                :step="100"
              />
              <span class="unit-label">元</span>
              <div class="form-tip">系统每月的视频生成总预算</div>
            </el-form-item>
            
            <el-form-item label="成本警报阈值">
              <el-input-number 
                v-model="configForm.costAlertThreshold" 
                :min="0" 
                :precision="2"
                :step="50"
              />
              <span class="unit-label">元</span>
              <div class="form-tip">达到此金额后发送警报通知</div>
            </el-form-item>
          </el-form>

          <!-- 实时成本统计 -->
          <el-divider content-position="left">
            <el-icon><DataAnalysis /></el-icon>
            本月成本统计
          </el-divider>
          
          <el-row :gutter="20" class="statistics-row">
            <el-col :span="6">
              <el-statistic title="已使用成本" :value="costStats.totalCost" suffix="元" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="剩余预算" :value="costStats.remainingBudget" suffix="元" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="成功请求" :value="costStats.successCount" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="失败请求" :value="costStats.failureCount" />
            </el-col>
          </el-row>

          <el-progress 
            :percentage="costStats.budgetUsagePercentage" 
            :color="progressColor"
            :stroke-width="20"
            class="budget-progress"
          >
            <template #default="{ percentage }">
              <span class="percentage-value">预算使用: {{ percentage }}%</span>
            </template>
          </el-progress>

          <el-alert
            v-if="costStats.budgetUsagePercentage >= 80"
            title="预算警告"
            type="warning"
            :closable="false"
            show-icon
            class="cost-alert"
          >
            <div>本月预算已使用 {{ costStats.budgetUsagePercentage.toFixed(1) }}%</div>
            <div>请注意控制成本或增加预算</div>
          </el-alert>
        </el-tab-pane>

        <!-- Tab 4: 使用统计 -->
        <el-tab-pane label="使用统计" name="logs">
          <div class="logs-container">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="loadStatistics"
              class="date-picker"
            />

            <el-table :data="usageLogs" style="width: 100%" v-loading="loadingLogs">
              <el-table-column prop="createdAt" label="时间" width="180">
                <template #default="{ row }">
                  {{ formatDate(row.createdAt) }}
                </template>
              </el-table-column>
              <el-table-column prop="userId" label="用户ID" width="200" />
              <el-table-column prop="provider" label="Provider" width="120" />
              <el-table-column prop="apiType" label="API类型" width="150" />
              <el-table-column prop="requestCost" label="成本" width="100">
                <template #default="{ row }">
                  ¥{{ row.requestCost.toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column prop="success" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.success ? 'success' : 'danger'">
                    {{ row.success ? '成功' : '失败' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="errorMessage" label="错误信息" show-overflow-tooltip />
            </el-table>

            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.limit"
              :page-sizes="[10, 20, 50, 100]"
              :total="pagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="loadLogs"
              @current-change="loadLogs"
              class="pagination"
            />
          </div>
        </el-tab-pane>
      </el-tabs>

      <!-- 保存按钮 -->
      <div class="action-buttons">
        <el-button 
          type="primary" 
          size="large" 
          :icon="Check" 
          @click="saveConfig"
          :loading="saving"
        >
          保存配置
        </el-button>
        <el-button 
          size="large" 
          :icon="Refresh" 
          @click="loadConfig"
        >
          重新加载
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Setting, 
  Connection, 
  Select, 
  Search, 
  DataAnalysis, 
  Check, 
  Refresh 
} from '@element-plus/icons-vue'
import apiManager from '@/services/apiManager'

// 状态
const activeTab = ref('keys')
const loading = ref(false)
const saving = ref(false)
const testingConnection = ref(null)
const loadingLogs = ref(false)
const dateRange = ref([])

// 配置表单
const configForm = reactive({
  volcengineAccessKeyId: '',
  volcengineSecretAccessKey: '',
  jimengApiKey: '',
  klingApiKey: '',
  videoProvider: 'jimeng',
  ffmpegPath: '/usr/bin/ffmpeg',
  videoStoragePath: '/data/videos',
  tempStoragePath: '/tmp/video-generation',
  userDailyQuota: 5,
  userMonthlyQuota: 50,
  monthlyBudget: 1000,
  costAlertThreshold: 800,
  isActive: true
})

// 成本统计
const costStats = reactive({
  totalCost: 0,
  totalRequests: 0,
  successCount: 0,
  failureCount: 0,
  successRate: 0,
  monthlyBudget: 1000,
  remainingBudget: 1000,
  budgetUsagePercentage: 0
})

// 使用日志
const usageLogs = ref([])
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

// 计算属性
const progressColor = computed(() => {
  const percentage = costStats.budgetUsagePercentage
  if (percentage >= 90) return '#f56c6c'
  if (percentage >= 80) return '#e6a23c'
  return '#67c23a'
})

// 方法
const loadConfig = async () => {
  loading.value = true
  try {
    const response = await apiManager.get('/api/v1/admin/video-api-config')
    Object.assign(configForm, response.data)
    ElMessage.success('配置加载成功')
  } catch (error) {
    ElMessage.error(error.message || '加载配置失败')
  } finally {
    loading.value = false
  }
}

const saveConfig = async () => {
  saving.value = true
  try {
    await apiManager.put('/api/v1/admin/video-api-config', configForm)
    ElMessage.success('配置保存成功')
    await loadConfig()
  } catch (error) {
    ElMessage.error(error.message || '保存配置失败')
  } finally {
    saving.value = false
  }
}

const loadStatistics = async () => {
  try {
    let url = '/api/v1/admin/video-api-config/statistics'
    if (dateRange.value && dateRange.value.length === 2) {
      const [start, end] = dateRange.value
      url = `/api/v1/admin/video-api-config/statistics/range?startDate=${start.toISOString()}&endDate=${end.toISOString()}`
    }
    
    const response = await apiManager.get(url)
    Object.assign(costStats, response.data)
  } catch (error) {
    ElMessage.error('加载统计数据失败')
  }
}

const loadLogs = async () => {
  loadingLogs.value = true
  try {
    // 这里应该调用实际的日志查询接口
    // const response = await apiManager.get('/admin/video-api-usage-logs', {
    //   params: {
    //     page: pagination.page,
    //     limit: pagination.limit,
    //   }
    // })
    // usageLogs.value = response.data.items
    // pagination.total = response.data.total
    
    // 模拟数据
    usageLogs.value = []
  } catch (error) {
    ElMessage.error('加载日志失败')
  } finally {
    loadingLogs.value = false
  }
}

const testConnection = async (provider) => {
  testingConnection.value = provider
  try {
    const response = await apiManager.post(`/api/v1/admin/video-api-config/test/${provider}`)
    if (response.data.success) {
      ElMessage.success(response.data.message)
    } else {
      ElMessage.warning(response.data.message)
    }
  } catch (error) {
    ElMessage.error(error.message || '连接测试失败')
  } finally {
    testingConnection.value = null
  }
}

const detectFFmpeg = async () => {
  try {
    // 这里应该调用后端API检测FFmpeg路径
    ElMessage.info('FFmpeg自动检测功能开发中...')
  } catch (error) {
    ElMessage.error('检测失败')
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadConfig()
  loadStatistics()
})
</script>

<style scoped lang="scss">
.video-api-config-admin {
  padding: 20px;

  .config-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 18px;
        font-weight: 500;
      }
    }
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }

  .unit-label {
    margin-left: 8px;
    color: #606266;
  }

  .statistics-row {
    margin: 20px 0;
  }

  .budget-progress {
    margin: 20px 0;

    .percentage-value {
      font-size: 14px;
      font-weight: 500;
    }
  }

  .cost-alert {
    margin-top: 20px;
  }

  .logs-container {
    .date-picker {
      margin-bottom: 20px;
    }

    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }

  .action-buttons {
    margin-top: 30px;
    display: flex;
    gap: 12px;
    justify-content: center;
    padding: 20px 0;
    border-top: 1px solid #ebeef5;
  }
}
</style>

