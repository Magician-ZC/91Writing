<template>
  <div class="data-analytics">
    <!-- 页面标题和操作区 -->
    <div class="header">
      <h2>数据分析</h2>
      <div class="actions">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleDateChange"
        />
        <el-button type="primary" @click="loadData">刷新数据</el-button>
        <el-dropdown @command="handleExport">
          <el-button>
            导出报表<el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="json">导出为 JSON</el-dropdown-item>
              <el-dropdown-item command="csv">导出为 CSV</el-dropdown-item>
              <el-dropdown-item command="excel">导出为 Excel</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 数据展示 -->
    <div v-else class="analytics-content">
      <!-- 概览统计卡片 -->
      <div class="overview-cards">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon users">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">总用户数</div>
              <div class="stat-value">{{ overview.totalUsers || 0 }}</div>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon active">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">活跃用户</div>
              <div class="stat-value">{{ overview.activeUsers || 0 }}</div>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon novels">
              <el-icon><Reading /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">总小说数</div>
              <div class="stat-value">{{ overview.totalNovels || 0 }}</div>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon revenue">
              <el-icon><Wallet /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">总收入</div>
              <div class="stat-value">¥{{ formatMoney(overview.totalRevenue) }}</div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 图表区域 -->
      <el-row :gutter="20" class="chart-row">
        <!-- 用户增长趋势 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>用户增长趋势</span>
                <el-select v-model="userGrowthDays" @change="loadUserGrowth" size="small">
                  <el-option label="最近7天" :value="7" />
                  <el-option label="最近30天" :value="30" />
                  <el-option label="最近90天" :value="90" />
                </el-select>
              </div>
            </template>
            <div ref="userGrowthChart" class="chart-container"></div>
          </el-card>
        </el-col>

        <!-- 功能使用统计 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <span>功能使用统计</span>
            </template>
            <div ref="featureUsageChart" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="chart-row">
        <!-- AI使用统计 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <span>AI使用统计</span>
            </template>
            <div class="ai-stats">
              <div class="stat-item">
                <span class="label">总使用次数:</span>
                <span class="value">{{ aiUsage.totalUsage || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="label">总成本:</span>
                <span class="value">¥{{ formatMoney(aiUsage.totalCost) }}</span>
              </div>
              <div class="stat-item">
                <span class="label">平均响应时间:</span>
                <span class="value">{{ Math.round(aiUsage.avgResponseTime || 0) }}ms</span>
              </div>
            </div>
            <div ref="aiUsageChart" class="chart-container"></div>
          </el-card>
        </el-col>

        <!-- 收入统计 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <span>收入统计</span>
            </template>
            <div class="revenue-stats">
              <div class="stat-item">
                <span class="label">总收入:</span>
                <span class="value">¥{{ formatMoney(revenue.totalRevenue) }}</span>
              </div>
              <div class="stat-item">
                <span class="label">订单数:</span>
                <span class="value">{{ revenue.orderCount || 0 }}</span>
              </div>
            </div>
            <div ref="revenueChart" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { analyticsService } from '@/services/analyticsService'
import { exportAnalyticsReport, exportToJSON, exportToCSV } from '@/utils/exportUtil'
import { User, UserFilled, Reading, Wallet, ArrowDown } from '@element-plus/icons-vue'

// 数据
const loading = ref(false)
const dateRange = ref([])
const userGrowthDays = ref(30)

// 统计数据
const overview = ref({})
const userGrowth = ref([])
const featureUsage = ref([])
const aiUsage = ref({})
const revenue = ref({})

// 图表实例
const userGrowthChart = ref(null)
const featureUsageChart = ref(null)
const aiUsageChart = ref(null)
const revenueChart = ref(null)

let userGrowthChartInstance = null
let featureUsageChartInstance = null
let aiUsageChartInstance = null
let revenueChartInstance = null

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const dateParams = {}
    if (dateRange.value && dateRange.value.length === 2) {
      dateParams.startDate = dateRange.value[0]
      dateParams.endDate = dateRange.value[1]
    }

    // 并行加载所有数据
    const [overviewRes, userGrowthRes, featureUsageRes, aiUsageRes, revenueRes] = await Promise.all([
      analyticsService.getOverview(dateParams),
      analyticsService.getUserGrowth(userGrowthDays.value),
      analyticsService.getFeatureUsage(10),
      analyticsService.getAIUsage(dateParams),
      analyticsService.getRevenue(dateParams)
    ])

    overview.value = overviewRes.data || overviewRes
    userGrowth.value = userGrowthRes.data || userGrowthRes
    featureUsage.value = featureUsageRes.data || featureUsageRes
    aiUsage.value = aiUsageRes.data || aiUsageRes
    revenue.value = revenueRes.data || revenueRes

    // 渲染图表
    setTimeout(() => {
      renderCharts()
    }, 100)
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 加载用户增长数据
const loadUserGrowth = async () => {
  try {
    const res = await analyticsService.getUserGrowth(userGrowthDays.value)
    userGrowth.value = res.data || res
    renderUserGrowthChart()
  } catch (error) {
    console.error('加载用户增长数据失败:', error)
  }
}

// 渲染所有图表
const renderCharts = () => {
  renderUserGrowthChart()
  renderFeatureUsageChart()
  renderAIUsageChart()
  renderRevenueChart()
}

// 渲染用户增长图表
const renderUserGrowthChart = () => {
  if (!userGrowthChart.value) return

  if (!userGrowthChartInstance) {
    userGrowthChartInstance = echarts.init(userGrowthChart.value)
  }

  const dates = userGrowth.value.map(item => item.date)
  const counts = userGrowth.value.map(item => item.count)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      name: '新增用户',
      type: 'line',
      data: counts,
      smooth: true,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
          offset: 0,
          color: 'rgba(64, 158, 255, 0.5)'
        }, {
          offset: 1,
          color: 'rgba(64, 158, 255, 0.1)'
        }])
      }
    }]
  }

  userGrowthChartInstance.setOption(option)
}

// 渲染功能使用图表
const renderFeatureUsageChart = () => {
  if (!featureUsageChart.value) return

  if (!featureUsageChartInstance) {
    featureUsageChartInstance = echarts.init(featureUsageChart.value)
  }

  const features = featureUsage.value.map(item => item.feature)
  const counts = featureUsage.value.map(item => item.count)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: features,
      axisLabel: {
        rotate: 45,
        interval: 0
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      name: '使用次数',
      type: 'bar',
      data: counts,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
          offset: 0,
          color: '#83bff6'
        }, {
          offset: 0.5,
          color: '#188df0'
        }, {
          offset: 1,
          color: '#188df0'
        }])
      }
    }]
  }

  featureUsageChartInstance.setOption(option)
}

// 渲染AI使用图表
const renderAIUsageChart = () => {
  if (!aiUsageChart.value) return

  if (!aiUsageChartInstance) {
    aiUsageChartInstance = echarts.init(aiUsageChart.value)
  }

  const functions = (aiUsage.value.byFunction || []).map(item => item.function)
  const counts = (aiUsage.value.byFunction || []).map(item => item.count)

  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [{
      name: 'AI功能',
      type: 'pie',
      radius: '60%',
      data: functions.map((func, index) => ({
        name: func,
        value: counts[index]
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }

  aiUsageChartInstance.setOption(option)
}

// 渲染收入图表
const renderRevenueChart = () => {
  if (!revenueChart.value) return

  if (!revenueChartInstance) {
    revenueChartInstance = echarts.init(revenueChart.value)
  }

  const packages = (revenue.value.byPackage || []).map(item => item.packageName)
  const amounts = (revenue.value.byPackage || []).map(item => Number(item.revenue))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ¥{c}'
    },
    series: [{
      name: '收入',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}: ¥{c}'
      },
      data: packages.map((pkg, index) => ({
        name: pkg,
        value: amounts[index]
      }))
    }]
  }

  revenueChartInstance.setOption(option)
}

// 导出报表
const handleExport = async (format) => {
  try {
    const dateParams = {}
    if (dateRange.value && dateRange.value.length === 2) {
      dateParams.startDate = dateRange.value[0]
      dateParams.endDate = dateRange.value[1]
    }

    const res = await analyticsService.exportReport(dateParams)
    const reportData = res.data || res
    const filename = `analytics-report-${new Date().toISOString().split('T')[0]}`

    switch (format) {
      case 'json':
        exportToJSON(reportData, filename)
        break
      case 'csv':
        // 导出概览数据为CSV
        const csvData = [
          { 指标: '总用户数', 数值: reportData.overview?.totalUsers || 0 },
          { 指标: '活跃用户', 数值: reportData.overview?.activeUsers || 0 },
          { 指标: '总小说数', 数值: reportData.overview?.totalNovels || 0 },
          { 指标: '总收入', 数值: reportData.overview?.totalRevenue || 0 }
        ]
        exportToCSV(csvData, filename)
        break
      case 'excel':
        exportAnalyticsReport(reportData, filename)
        break
    }

    ElMessage.success(`报表已导出为 ${format.toUpperCase()} 格式`)
  } catch (error) {
    console.error('导出报表失败:', error)
    ElMessage.error('导出报表失败: ' + (error.message || '未知错误'))
  }
}

// 日期变化处理
const handleDateChange = () => {
  loadData()
}

// 格式化金额
const formatMoney = (value) => {
  if (!value) return '0.00'
  return Number(value).toFixed(2)
}

// 窗口大小调整处理
const handleResize = () => {
  userGrowthChartInstance?.resize()
  featureUsageChartInstance?.resize()
  aiUsageChartInstance?.resize()
  revenueChartInstance?.resize()
}

// 生命周期
onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  userGrowthChartInstance?.dispose()
  featureUsageChartInstance?.dispose()
  aiUsageChartInstance?.dispose()
  revenueChartInstance?.dispose()
})
</script>

<style scoped>
.data-analytics {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.actions {
  display: flex;
  gap: 10px;
}

.loading-container {
  padding: 20px;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-icon.users {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.active {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.novels {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.revenue {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 8px;
  height: 400px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 300px;
}

.ai-stats,
.revenue-stats {
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 12px;
}

.stat-item {
  display: inline-flex;
  align-items: center;
  margin-right: 24px;
  font-size: 14px;
}

.stat-item .label {
  color: #909399;
  margin-right: 8px;
}

.stat-item .value {
  color: #303133;
  font-weight: 600;
}

@media (max-width: 768px) {
  .overview-cards {
    grid-template-columns: 1fr;
  }
  
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .actions {
    width: 100%;
    flex-direction: column;
  }
}
</style>
