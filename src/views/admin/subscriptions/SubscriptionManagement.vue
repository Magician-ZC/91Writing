<template>
  <div class="subscription-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>订阅管理</h1>
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
        <el-col :span="8">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon active-icon">
                <el-icon><Star /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.overview?.active || 0 }}</div>
                <div class="stat-label">活跃订阅</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon expired-icon">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.overview?.expired || 0 }}</div>
                <div class="stat-label">已过期</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon total-icon">
                <el-icon><DataBoard /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.overview?.total || 0 }}</div>
                <div class="stat-label">总订阅数</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="search-card">
      <el-form :model="searchParams" inline @submit.prevent="searchSubscriptions">
        <el-form-item label="订阅状态">
          <el-select v-model="searchParams.status" placeholder="选择状态" clearable style="width: 150px;">
            <el-option label="有效" value="ACTIVE" />
            <el-option label="已过期" value="EXPIRED" />
            <el-option label="已取消" value="CANCELLED" />
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

        <el-form-item label="套餐">
          <el-select v-model="searchParams.packageId" placeholder="选择套餐" clearable style="width: 150px;">
            <el-option
              v-for="pkg in packages"
              :key="pkg.id"
              :label="pkg.name"
              :value="pkg.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="自动续费">
          <el-select v-model="searchParams.autoRenew" placeholder="选择续费状态" clearable style="width: 120px;">
            <el-option label="已开启" :value="true" />
            <el-option label="未开启" :value="false" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="searchSubscriptions">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 订阅列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="table-header">
          <h3>订阅列表</h3>
          <div class="table-actions">
            <el-text type="info">
              共 {{ pagination.total }} 个订阅
            </el-text>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="subscriptions"
        style="width: 100%"
        @sort-change="handleSortChange"
      >
        <el-table-column label="用户信息" min-width="200">
          <template #default="{ row }">
            <div class="user-info">
              <el-text>{{ row.user.email }}</el-text>
              <el-text type="info" size="small">{{ row.user.nickname || '未设置昵称' }}</el-text>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="package.name" label="套餐" min-width="120" />

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getSubscriptionStatusColor(row.status)">
              {{ formatSubscriptionStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="startDate" label="开始时间" min-width="150" sortable="custom">
          <template #default="{ row }">
            <el-text type="info" size="small">
              {{ formatDate(row.startDate) }}
            </el-text>
          </template>
        </el-table-column>

        <el-table-column prop="endDate" label="结束时间" min-width="150" sortable="custom">
          <template #default="{ row }">
            <el-text
              :type="isExpired(row.endDate) ? 'danger' : 'info'"
              size="small"
            >
              {{ formatDate(row.endDate) }}
            </el-text>
          </template>
        </el-table-column>

        <el-table-column prop="autoRenew" label="自动续费" width="100">
          <template #default="{ row }">
            <el-tag :type="row.autoRenew ? 'success' : 'info'" size="small">
              {{ row.autoRenew ? '已开启' : '未开启' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="剩余时间" width="100">
          <template #default="{ row }">
            <el-text
              :type="getRemainingTimeType(row.endDate)"
              size="small"
            >
              {{ getRemainingTime(row.endDate) }}
            </el-text>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="创建时间" min-width="150" sortable="custom">
          <template #default="{ row }">
            <el-text type="info" size="small">
              {{ formatDate(row.createdAt) }}
            </el-text>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button type="primary" size="small" @click="editSubscription(row)">
                编辑
              </el-button>
              
              <el-dropdown @command="(command) => handleAction(command, row)">
                <el-button size="small">
                  更多
                  <el-icon><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="extend">延长订阅</el-dropdown-item>
                    <el-dropdown-item command="cancel" divided>取消订阅</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
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
          @current-change="loadSubscriptions"
          @size-change="loadSubscriptions"
        />
      </div>
    </el-card>

    <!-- 编辑订阅对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑订阅"
      width="600px"
      @close="editForm = {}"
    >
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="用户邮箱">
          <el-input v-model="editForm.userEmail" disabled />
        </el-form-item>
        <el-form-item label="套餐">
          <el-select v-model="editForm.packageId" style="width: 100%;">
            <el-option
              v-for="pkg in packages"
              :key="pkg.id"
              :label="pkg.name"
              :value="pkg.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="editForm.status" style="width: 100%;">
            <el-option label="有效" value="ACTIVE" />
            <el-option label="已过期" value="EXPIRED" />
            <el-option label="已取消" value="CANCELLED" />
          </el-select>
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker
            v-model="editForm.endDate"
            type="datetime"
            placeholder="选择结束时间"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="自动续费">
          <el-switch v-model="editForm.autoRenew" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showEditDialog = false">取消</el-button>
          <el-button type="primary" @click="updateSubscription" :loading="updating">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 延长订阅对话框 -->
    <el-dialog
      v-model="showExtendDialog"
      title="延长订阅"
      width="500px"
      @close="extendForm = {}"
    >
      <el-form :model="extendForm" label-width="100px">
        <el-form-item label="延长天数" required>
          <el-input-number
            v-model="extendForm.days"
            :min="1"
            :max="365"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="延长原因" required>
          <el-input
            v-model="extendForm.reason"
            type="textarea"
            rows="3"
            placeholder="请输入延长原因"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showExtendDialog = false">取消</el-button>
          <el-button type="primary" @click="extendSubscription" :loading="extending">确定延长</el-button>
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
  Star,
  Warning,
  DataBoard,
  ArrowDown
} from '@element-plus/icons-vue'
import { adminService } from '@/services/adminService'

// 响应式数据
const loading = ref(false)
const updating = ref(false)
const extending = ref(false)
const subscriptions = ref([])
const packages = ref([])

const stats = reactive({
  overview: {}
})

const searchParams = reactive({
  status: '',
  userId: '',
  packageId: '',
  autoRenew: '',
  sortBy: 'createdAt',
  sortOrder: 'desc'
})

const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

// 对话框控制
const showEditDialog = ref(false)
const showExtendDialog = ref(false)

const selectedSubscription = ref(null)
const editForm = reactive({})
const extendForm = reactive({})

// 方法
const loadSubscriptions = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...searchParams
    }

    const response = await adminService.getSubscriptions(params)
    
    if (response.success) {
      subscriptions.value = response.data.data
      pagination.total = response.data.pagination.total
    } else {
      ElMessage.error('获取订阅列表失败')
    }
  } catch (error) {
    console.error('加载订阅列表失败:', error)
    ElMessage.error('加载订阅列表失败')
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const response = await adminService.getSubscriptionStats()
    if (response.success) {
      Object.assign(stats, response.data)
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const loadPackages = async () => {
  try {
    const response = await adminService.getPackages()
    if (response.success) {
      packages.value = response.data
    }
  } catch (error) {
    console.error('加载套餐列表失败:', error)
  }
}

const searchSubscriptions = () => {
  pagination.page = 1
  loadSubscriptions()
}

const resetSearch = () => {
  Object.assign(searchParams, {
    status: '',
    userId: '',
    packageId: '',
    autoRenew: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  pagination.page = 1
  loadSubscriptions()
}

const refreshData = async () => {
  await Promise.all([
    loadSubscriptions(),
    loadStats()
  ])
}

const handleSortChange = ({ prop, order }) => {
  searchParams.sortBy = prop
  searchParams.sortOrder = order === 'ascending' ? 'asc' : 'desc'
  loadSubscriptions()
}

const editSubscription = (subscription) => {
  selectedSubscription.value = subscription
  Object.assign(editForm, {
    id: subscription.id,
    userEmail: subscription.user.email,
    packageId: subscription.packageId,
    status: subscription.status,
    endDate: new Date(subscription.endDate),
    autoRenew: subscription.autoRenew
  })
  showEditDialog.value = true
}

const updateSubscription = async () => {
  if (!editForm.id) return
  
  updating.value = true
  try {
    const updateData = {
      packageId: editForm.packageId,
      status: editForm.status,
      endDate: editForm.endDate,
      autoRenew: editForm.autoRenew
    }
    
    const response = await adminService.updateSubscription(editForm.id, updateData)
    
    if (response.success) {
      ElMessage.success('订阅信息更新成功')
      showEditDialog.value = false
      loadSubscriptions()
    } else {
      ElMessage.error('更新订阅信息失败')
    }
  } catch (error) {
    console.error('更新订阅信息失败:', error)
    ElMessage.error('更新订阅信息失败')
  } finally {
    updating.value = false
  }
}

const handleAction = (command, subscription) => {
  selectedSubscription.value = subscription
  
  switch (command) {
    case 'extend':
      extendForm.days = 30
      extendForm.reason = ''
      showExtendDialog.value = true
      break
    
    case 'cancel':
      cancelSubscription(subscription)
      break
  }
}

const extendSubscription = async () => {
  if (!selectedSubscription.value || !extendForm.days || !extendForm.reason.trim()) {
    ElMessage.warning('请填写延长天数和原因')
    return
  }
  
  extending.value = true
  try {
    const response = await adminService.extendSubscription(selectedSubscription.value.id, {
      days: extendForm.days,
      reason: extendForm.reason
    })
    
    if (response.success) {
      ElMessage.success('订阅延长成功')
      showExtendDialog.value = false
      loadSubscriptions()
    } else {
      ElMessage.error('延长订阅失败')
    }
  } catch (error) {
    console.error('延长订阅失败:', error)
    ElMessage.error('延长订阅失败')
  } finally {
    extending.value = false
  }
}

const cancelSubscription = async (subscription) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消用户 ${subscription.user.email} 的订阅吗？`,
      '取消订阅',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const response = await adminService.updateSubscription(subscription.id, {
      status: 'CANCELLED'
    })
    
    if (response.success) {
      ElMessage.success('订阅取消成功')
      loadSubscriptions()
    } else {
      ElMessage.error('取消订阅失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消订阅失败:', error)
      ElMessage.error('取消订阅失败')
    }
  }
}

// 格式化方法
const formatSubscriptionStatus = (status) => {
  return adminService.formatSubscriptionStatus(status)
}

const getSubscriptionStatusColor = (status) => {
  return adminService.getSubscriptionStatusColor(status)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

const isExpired = (endDate) => {
  return new Date(endDate) < new Date()
}

const getRemainingTime = (endDate) => {
  const now = new Date()
  const end = new Date(endDate)
  const diff = end - now
  
  if (diff <= 0) {
    return '已过期'
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days > 0) {
    return `${days}天`
  } else {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    return `${hours}小时`
  }
}

const getRemainingTimeType = (endDate) => {
  const now = new Date()
  const end = new Date(endDate)
  const diff = end - now
  
  if (diff <= 0) return 'danger'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days <= 3) return 'warning'
  if (days <= 7) return 'primary'
  return 'success'
}

// 生命周期
onMounted(async () => {
  await Promise.all([
    loadSubscriptions(),
    loadStats(),
    loadPackages()
  ])
})
</script>

<style scoped>
.subscription-management {
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

.active-icon {
  background: linear-gradient(135deg, #67C23A, #85CE61);
}

.expired-icon {
  background: linear-gradient(135deg, #F56C6C, #F78989);
}

.total-icon {
  background: linear-gradient(135deg, #409EFF, #66B1FF);
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

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .subscription-management {
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