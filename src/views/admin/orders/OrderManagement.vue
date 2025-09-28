<template>
  <div class="order-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>订单管理</h1>
      <div class="header-actions">
        <el-button type="primary" @click="refreshData" :loading="loading">
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
              <div class="stat-icon total-icon">
                <el-icon><ShoppingCart /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.overview?.total || 0 }}</div>
                <div class="stat-label">总订单数</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon paid-icon">
                <el-icon><Check /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.overview?.paid || 0 }}</div>
                <div class="stat-label">已支付</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon failed-icon">
                <el-icon><Close /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.overview?.failed || 0 }}</div>
                <div class="stat-label">支付失败</div>
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
                <div class="stat-value">{{ formatAmount(stats.overview?.revenue || 0) }}</div>
                <div class="stat-label">总收入</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="search-card">
      <el-form :model="searchParams" inline @submit.prevent="searchOrders">
        <el-form-item label="订单状态">
          <el-select v-model="searchParams.status" placeholder="选择状态" clearable style="width: 150px;">
            <el-option label="待支付" value="PENDING" />
            <el-option label="已支付" value="PAID" />
            <el-option label="支付失败" value="FAILED" />
            <el-option label="已取消" value="CANCELLED" />
          </el-select>
        </el-form-item>

        <el-form-item label="支付方式">
          <el-select v-model="searchParams.paymentMethod" placeholder="选择支付方式" clearable style="width: 150px;">
            <el-option label="支付宝" value="ALIPAY" />
            <el-option label="微信支付" value="WECHAT" />
            <el-option label="邀请奖励" value="INVITE_REWARD" />
          </el-select>
        </el-form-item>

        <el-form-item label="用户ID">
          <el-input
            v-model="searchParams.userId"
            placeholder="输入用户ID"
            clearable
            style="width: 200px;"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="searchOrders">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 订单列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="table-header">
          <h3>订单列表</h3>
          <div class="table-actions">
            <el-text type="info">
              共 {{ pagination.total }} 个订单
            </el-text>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="orders"
        style="width: 100%"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="orderNo" label="订单号" min-width="200" />

        <el-table-column label="用户信息" min-width="180">
          <template #default="{ row }">
            <div class="user-info">
              <el-text>{{ row.user.email }}</el-text>
              <el-text type="info" size="small">{{ row.user.nickname || '未设置昵称' }}</el-text>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="package.name" label="套餐" min-width="120" />

        <el-table-column prop="amount" label="金额" width="100">
          <template #default="{ row }">
            <el-text type="primary">¥{{ row.amount }}</el-text>
          </template>
        </el-table-column>

        <el-table-column prop="paymentMethod" label="支付方式" width="120">
          <template #default="{ row }">
            {{ formatPaymentMethod(row.paymentMethod) }}
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getPaymentStatusColor(row.status)">
              {{ formatPaymentStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="创建时间" min-width="150" sortable="custom">
          <template #default="{ row }">
            <el-text type="info" size="small">
              {{ formatDate(row.createdAt) }}
            </el-text>
          </template>
        </el-table-column>

        <el-table-column prop="paidAt" label="支付时间" min-width="150">
          <template #default="{ row }">
            <el-text type="info" size="small">
              {{ row.paidAt ? formatDate(row.paidAt) : '-' }}
            </el-text>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button type="primary" size="small" @click="viewOrderDetail(row)">
                查看详情
              </el-button>
              
              <el-button
                v-if="row.status === 'PAID'"
                type="danger"
                size="small"
                @click="showRefundDialog(row)"
              >
                退款
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="loadOrders"
          @size-change="loadOrders"
        />
      </div>
    </el-card>

    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="订单详情"
      width="600px"
      @close="selectedOrder = null"
    >
      <div v-if="selectedOrder" class="order-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ selectedOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="用户邮箱">{{ selectedOrder.user.email }}</el-descriptions-item>
          <el-descriptions-item label="套餐名称">{{ selectedOrder.package.name }}</el-descriptions-item>
          <el-descriptions-item label="订单金额">¥{{ selectedOrder.amount }}</el-descriptions-item>
          <el-descriptions-item label="支付方式">{{ formatPaymentMethod(selectedOrder.paymentMethod) }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getPaymentStatusColor(selectedOrder.status)">
              {{ formatPaymentStatus(selectedOrder.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(selectedOrder.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="支付时间">{{ selectedOrder.paidAt ? formatDate(selectedOrder.paidAt) : '未支付' }}</el-descriptions-item>
          <el-descriptions-item label="过期时间">{{ formatDate(selectedOrder.expiresAt) }}</el-descriptions-item>
          <el-descriptions-item label="交易号">{{ selectedOrder.transactionId || '无' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showDetailDialog = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 退款对话框 -->
    <el-dialog
      v-model="showRefundDialogVisible"
      title="申请退款"
      width="500px"
      @close="refundForm = {}"
    >
      <el-form :model="refundForm" label-width="100px">
        <el-form-item label="订单号">
          <el-input v-model="refundForm.orderNo" disabled />
        </el-form-item>
        <el-form-item label="订单金额">
          <el-input v-model="refundForm.amount" disabled />
        </el-form-item>
        <el-form-item label="退款金额">
          <el-input-number
            v-model="refundForm.refundAmount"
            :min="0.01"
            :max="refundForm.amount"
            :precision="2"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="退款原因" required>
          <el-input
            v-model="refundForm.reason"
            type="textarea"
            rows="3"
            placeholder="请输入退款原因"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showRefundDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="processRefund" :loading="refunding">确定退款</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh,
  ShoppingCart,
  Check,
  Close,
  Money
} from '@element-plus/icons-vue'
import { adminService } from '@/services/adminService'

// 响应式数据
const loading = ref(false)
const refunding = ref(false)
const orders = ref([])

const stats = reactive({
  overview: {}
})

const searchParams = reactive({
  status: '',
  paymentMethod: '',
  userId: '',
  sortBy: 'createdAt',
  sortOrder: 'desc'
})

const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

// 对话框控制
const showDetailDialog = ref(false)
const showRefundDialogVisible = ref(false)

const selectedOrder = ref(null)
const refundForm = reactive({})

// 方法
const loadOrders = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...searchParams
    }

    const response = await adminService.getOrders(params)
    
    if (response.success) {
      orders.value = response.data.data
      pagination.total = response.data.pagination.total
    } else {
      ElMessage.error('获取订单列表失败')
    }
  } catch (error) {
    console.error('加载订单列表失败:', error)
    ElMessage.error('加载订单列表失败')
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const response = await adminService.getPaymentStats()
    if (response.success) {
      Object.assign(stats, response.data)
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const searchOrders = () => {
  pagination.page = 1
  loadOrders()
}

const resetSearch = () => {
  Object.assign(searchParams, {
    status: '',
    paymentMethod: '',
    userId: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  pagination.page = 1
  loadOrders()
}

const refreshData = async () => {
  await Promise.all([
    loadOrders(),
    loadStats()
  ])
}

const handleSortChange = ({ prop, order }) => {
  searchParams.sortBy = prop
  searchParams.sortOrder = order === 'ascending' ? 'asc' : 'desc'
  loadOrders()
}

const viewOrderDetail = (order) => {
  selectedOrder.value = order
  showDetailDialog.value = true
}

const showRefundDialog = (order) => {
  selectedOrder.value = order
  Object.assign(refundForm, {
    orderNo: order.orderNo,
    amount: order.amount,
    refundAmount: order.amount,
    reason: ''
  })
  showRefundDialogVisible.value = true
}

const processRefund = async () => {
  if (!refundForm.reason.trim()) {
    ElMessage.warning('请填写退款原因')
    return
  }
  
  refunding.value = true
  try {
    const response = await adminService.processRefund(refundForm.orderNo, {
      reason: refundForm.reason,
      amount: refundForm.refundAmount
    })
    
    if (response.success) {
      ElMessage.success('退款处理成功')
      showRefundDialogVisible.value = false
      loadOrders()
    } else {
      ElMessage.error('退款处理失败')
    }
  } catch (error) {
    console.error('退款处理失败:', error)
    ElMessage.error('退款处理失败')
  } finally {
    refunding.value = false
  }
}

// 格式化方法
const formatPaymentStatus = (status) => {
  return adminService.formatPaymentStatus(status)
}

const getPaymentStatusColor = (status) => {
  return adminService.getPaymentStatusColor(status)
}

const formatPaymentMethod = (method) => {
  const methodMap = {
    'ALIPAY': '支付宝',
    'WECHAT': '微信支付',
    'INVITE_REWARD': '邀请奖励'
  }
  return methodMap[method] || method
}

const formatAmount = (amount) => {
  return adminService.formatAmount(amount)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

// 生命周期
onMounted(async () => {
  await Promise.all([
    loadOrders(),
    loadStats()
  ])
})
</script>

<style scoped>
.order-management {
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

.total-icon {
  background: linear-gradient(135deg, #409EFF, #66B1FF);
}

.paid-icon {
  background: linear-gradient(135deg, #67C23A, #85CE61);
}

.failed-icon {
  background: linear-gradient(135deg, #F56C6C, #F78989);
}

.revenue-icon {
  background: linear-gradient(135deg, #E6A23C, #EEBE77);
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
}

.search-card {
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: none;
}

.table-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: none;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-header h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.order-detail {
  margin-bottom: 20px;
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .order-management {
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
  
  .search-card .el-form {
    flex-direction: column;
  }
  
  .search-card .el-form-item {
    width: 100%;
  }
  
  .action-buttons {
    flex-direction: column;
    width: 100%;
  }
}
</style>