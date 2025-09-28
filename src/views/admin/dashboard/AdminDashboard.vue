<template>
  <div class="admin-dashboard">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>管理后台仪表盘</h1>
      <div class="header-actions">
        <el-select v-model="statsParams.period" size="small" @change="loadStats">
          <el-option label="今日" value="day" />
          <el-option label="本周" value="week" />
          <el-option label="本月" value="month" />
          <el-option label="本年" value="year" />
        </el-select>
        <el-button type="primary" size="small" @click="refreshData" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon user-icon">
                <el-icon><User /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ formatCount(stats.overview?.totalUsers || 0) }}</div>
                <div class="stat-label">总用户数</div>
                <div class="stat-trend">
                  <span class="trend-text">新增: {{ stats.overview?.newUsers || 0 }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon subscription-icon">
                <el-icon><Medal /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ formatCount(stats.overview?.activeSubscriptions || 0) }}</div>
                <div class="stat-label">活跃订阅</div>
                <div class="stat-trend">
                  <span class="trend-text">总数: {{ stats.overview?.totalSubscriptions || 0 }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon order-icon">
                <el-icon><ShoppingCart /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ formatCount(stats.overview?.paidOrders || 0) }}</div>
                <div class="stat-label">成功订单</div>
                <div class="stat-trend">
                  <span class="trend-text">总数: {{ stats.overview?.totalOrders || 0 }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon revenue-icon">
                <el-icon><Money /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ formatAmount(stats.overview?.totalRevenue || 0) }}</div>
                <div class="stat-label">总收入</div>
                <div class="stat-trend">
                  <span class="trend-text">{{ statsParams.period === 'day' ? '今日' : statsParams.period === 'week' ? '本周' : statsParams.period === 'month' ? '本月' : '本年' }}统计</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <!-- 用户注册趋势 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <h3>用户注册趋势</h3>
                <el-tag size="small" type="info">{{ getPeriodLabel() }}</el-tag>
              </div>
            </template>
            <div class="chart-container" ref="userChartRef" style="height: 300px;"></div>
          </el-card>
        </el-col>

        <!-- 收入趋势 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <h3>收入趋势</h3>
                <el-tag size="small" type="success">{{ getPeriodLabel() }}</el-tag>
              </div>
            </template>
            <div class="chart-container" ref="revenueChartRef" style="height: 300px;"></div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <!-- 用户分布 -->
        <el-col :span="8">
          <el-card class="chart-card">
            <template #header>
              <h3>用户角色分布</h3>
            </template>
            <div class="chart-container" ref="roleChartRef" style="height: 250px;"></div>
          </el-card>
        </el-col>

        <!-- 用户状态分布 -->
        <el-col :span="8">
          <el-card class="chart-card">
            <template #header>
              <h3>用户状态分布</h3>
            </template>
            <div class="chart-container" ref="statusChartRef" style="height: 250px;"></div>
          </el-card>
        </el-col>

        <!-- 订单状态分布 -->
        <el-col :span="8">
          <el-card class="chart-card">
            <template #header>
              <h3>订单趋势</h3>
            </template>
            <div class="chart-container" ref="orderChartRef" style="height: 250px;"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 快速操作 -->
    <div class="quick-actions">
      <el-card>
        <template #header>
          <h3>快速操作</h3>
        </template>
        <div class="action-buttons">
          <el-button type="primary" @click="$router.push('/admin/users')">
            <el-icon><User /></el-icon>
            用户管理
          </el-button>
          <el-button type="success" @click="$router.push('/admin/subscriptions')">
            <el-icon><Medal /></el-icon>
            订阅管理
          </el-button>
          <el-button type="warning" @click="$router.push('/admin/orders')">
            <el-icon><ShoppingCart /></el-icon>
            订单管理
          </el-button>
          <el-button type="info" @click="$router.push('/admin/packages')">
            <el-icon><Box /></el-icon>
            套餐管理
          </el-button>
          <el-button @click="$router.push('/admin/settings')">
            <el-icon><Setting /></el-icon>
            系统设置
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  User,
  Medal,
  ShoppingCart,
  Money,
  Refresh,
  Box,
  Setting
} from '@element-plus/icons-vue'
import { adminService } from '@/services/adminService'
import * as echarts from 'echarts'

// 响应式数据
const loading = ref(false)
const stats = reactive({
  overview: {},
  userDistribution: {},
  period: {}
})

const chartData = reactive({
  userRegistrations: [],
  orderCounts: [],
  revenues: []
})

const statsParams = reactive({
  period: 'month'
})

// 图表引用
const userChartRef = ref()
const revenueChartRef = ref()
const roleChartRef = ref()
const statusChartRef = ref()
const orderChartRef = ref()

// 图表实例
let userChart = null
let revenueChart = null
let roleChart = null
let statusChart = null
let orderChart = null

// 方法
const loadStats = async () => {
  loading.value = true
  try {
    const [statsResponse, chartResponse] = await Promise.all([
      adminService.getDashboardStats(statsParams),
      adminService.getChartData(statsParams)
    ])

    if (statsResponse.success) {
      Object.assign(stats, statsResponse.data)
    }

    if (chartResponse.success) {
      Object.assign(chartData, chartResponse.data)
      await nextTick()
      initCharts()
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadStats()
}

const formatCount = (count) => {
  return adminService.formatCount(count)
}

const formatAmount = (amount) => {
  return adminService.formatAmount(amount)
}

const getPeriodLabel = () => {
  const labels = {
    day: '24小时',
    week: '7天',
    month: '30天',
    year: '12个月'
  }
  return labels[statsParams.period] || '30天'
}

// 初始化图表
const initCharts = () => {
  initUserChart()
  initRevenueChart()
  initRoleChart()
  initStatusChart()
  initOrderChart()
}

const initUserChart = () => {
  if (userChart) {
    userChart.dispose()
  }
  
  userChart = echarts.init(userChartRef.value)
  
  const option = {
    title: {
      text: '',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    xAxis: {
      type: 'category',
      data: chartData.userRegistrations.map(item => {
        const date = new Date(item.time)
        if (statsParams.period === 'day') {
          return date.getHours() + ':00'
        } else if (statsParams.period === 'year') {
          return (date.getMonth() + 1) + '月'
        } else {
          return (date.getMonth() + 1) + '/' + date.getDate()
        }
      })
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      name: '新增用户',
      type: 'line',
      smooth: true,
      data: chartData.userRegistrations.map(item => item.count),
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
          { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
        ])
      },
      itemStyle: {
        color: '#409EFF'
      }
    }]
  }
  
  userChart.setOption(option)
}

const initRevenueChart = () => {
  if (revenueChart) {
    revenueChart.dispose()
  }
  
  revenueChart = echarts.init(revenueChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        return params.map(param => {
          return `${param.seriesName}: ¥${param.value}`
        }).join('<br/>')
      }
    },
    xAxis: {
      type: 'category',
      data: chartData.revenues.map(item => {
        const date = new Date(item.time)
        if (statsParams.period === 'day') {
          return date.getHours() + ':00'
        } else if (statsParams.period === 'year') {
          return (date.getMonth() + 1) + '月'
        } else {
          return (date.getMonth() + 1) + '/' + date.getDate()
        }
      })
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value) => '¥' + value
      }
    },
    series: [{
      name: '收入',
      type: 'bar',
      data: chartData.revenues.map(item => item.amount),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#67C23A' },
          { offset: 1, color: '#85CE61' }
        ])
      }
    }]
  }
  
  revenueChart.setOption(option)
}

const initRoleChart = () => {
  if (roleChart) {
    roleChart.dispose()
  }
  
  roleChart = echarts.init(roleChartRef.value)
  
  const roleData = Object.entries(stats.userDistribution.byRole || {}).map(([role, count]) => ({
    name: adminService.formatUserRole(role),
    value: count
  }))
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [{
      type: 'pie',
      radius: '70%',
      data: roleData,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }
  
  roleChart.setOption(option)
}

const initStatusChart = () => {
  if (statusChart) {
    statusChart.dispose()
  }
  
  statusChart = echarts.init(statusChartRef.value)
  
  const statusData = Object.entries(stats.userDistribution.byStatus || {}).map(([status, count]) => ({
    name: adminService.formatUserStatus(status),
    value: count
  }))
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [{
      type: 'pie',
      radius: '70%',
      data: statusData,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }
  
  statusChart.setOption(option)
}

const initOrderChart = () => {
  if (orderChart) {
    orderChart.dispose()
  }
  
  orderChart = echarts.init(orderChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: chartData.orderCounts.map(item => {
        const date = new Date(item.time)
        if (statsParams.period === 'day') {
          return date.getHours() + ':00'
        } else if (statsParams.period === 'year') {
          return (date.getMonth() + 1) + '月'
        } else {
          return (date.getMonth() + 1) + '/' + date.getDate()
        }
      })
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      name: '订单数',
      type: 'line',
      smooth: true,
      data: chartData.orderCounts.map(item => item.count),
      itemStyle: {
        color: '#E6A23C'
      }
    }]
  }
  
  orderChart.setOption(option)
}

// 监听窗口大小变化
const handleResize = () => {
  userChart?.resize()
  revenueChart?.resize()
  roleChart?.resize()
  statusChart?.resize()
  orderChart?.resize()
}

// 生命周期
onMounted(async () => {
  await loadStats()
  window.addEventListener('resize', handleResize)
})

// 清理
// onUnmounted(() => {
//   window.removeEventListener('resize', handleResize)
//   userChart?.dispose()
//   revenueChart?.dispose()
//   roleChart?.dispose()
//   statusChart?.dispose()
//   orderChart?.dispose()
// })
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.page-header h1 {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: none;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.user-icon {
  background: linear-gradient(135deg, #409EFF, #66B1FF);
}

.subscription-icon {
  background: linear-gradient(135deg, #67C23A, #85CE61);
}

.order-icon {
  background: linear-gradient(135deg, #E6A23C, #EEBE77);
}

.revenue-icon {
  background: linear-gradient(135deg, #F56C6C, #F78989);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-trend {
  font-size: 12px;
}

.trend-text {
  color: #67C23A;
}

.charts-section {
  margin-bottom: 20px;
}

.chart-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.chart-container {
  width: 100%;
}

.quick-actions .action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.quick-actions .el-button {
  flex: 1;
  min-width: 120px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .stats-cards .el-col {
    margin-bottom: 20px;
  }
  
  .charts-section .el-col {
    margin-bottom: 20px;
  }
}

@media (max-width: 768px) {
  .admin-dashboard {
    padding: 12px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .quick-actions .action-buttons {
    flex-direction: column;
  }
  
  .quick-actions .el-button {
    min-width: auto;
  }
}
</style>