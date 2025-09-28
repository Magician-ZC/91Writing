<template>
  <div class="user-detail-dialog">
    <el-tabs v-model="activeTab" class="detail-tabs">
      <!-- 基本信息 -->
      <el-tab-pane label="基本信息" name="basic">
        <div class="basic-info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="用户ID">{{ user.id }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ user.email }}</el-descriptions-item>
            <el-descriptions-item label="昵称">{{ user.nickname || '未设置' }}</el-descriptions-item>
            <el-descriptions-item label="用户角色">
              <el-tag :type="getRoleType(user.role)">
                {{ formatUserRole(user.role) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="用户状态">
              <el-tag :type="getUserStatusColor(user.status)">
                {{ formatUserStatus(user.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="是否激活">
              <el-tag :type="user.isActive ? 'success' : 'warning'">
                {{ user.isActive ? '已激活' : '未激活' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="注册时间">{{ formatDate(user.createdAt) }}</el-descriptions-item>
            <el-descriptions-item label="最后登录">{{ user.lastLoginAt ? formatDate(user.lastLoginAt) : '从未登录' }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ formatDate(user.updatedAt) }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </el-tab-pane>

      <!-- 订阅记录 -->
      <el-tab-pane label="订阅记录" name="subscriptions">
        <div class="subscriptions-info">
          <div v-if="!user.subscriptions?.length" class="empty-state">
            <el-empty description="暂无订阅记录" :image-size="80" />
          </div>
          <div v-else>
            <el-table :data="user.subscriptions" style="width: 100%">
              <el-table-column prop="package.name" label="套餐名称" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getSubscriptionStatusColor(row.status)">
                    {{ formatSubscriptionStatus(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="startDate" label="开始时间" width="150">
                <template #default="{ row }">
                  {{ formatDate(row.startDate) }}
                </template>
              </el-table-column>
              <el-table-column prop="endDate" label="结束时间" width="150">
                <template #default="{ row }">
                  {{ formatDate(row.endDate) }}
                </template>
              </el-table-column>
              <el-table-column prop="autoRenew" label="自动续费" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.autoRenew ? 'success' : 'info'" size="small">
                    {{ row.autoRenew ? '已开启' : '未开启' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" label="创建时间" width="150">
                <template #default="{ row }">
                  {{ formatDate(row.createdAt) }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-tab-pane>

      <!-- 支付记录 -->
      <el-tab-pane label="支付记录" name="orders">
        <div class="orders-info">
          <div v-if="!user.paymentOrders?.length" class="empty-state">
            <el-empty description="暂无支付记录" :image-size="80" />
          </div>
          <div v-else>
            <el-table :data="user.paymentOrders" style="width: 100%">
              <el-table-column prop="orderNo" label="订单号" width="200" />
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
              <el-table-column prop="createdAt" label="创建时间" width="150">
                <template #default="{ row }">
                  {{ formatDate(row.createdAt) }}
                </template>
              </el-table-column>
              <el-table-column prop="paidAt" label="支付时间" width="150">
                <template #default="{ row }">
                  {{ row.paidAt ? formatDate(row.paidAt) : '-' }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-tab-pane>

      <!-- 邀请记录 -->
      <el-tab-pane label="邀请记录" name="invites">
        <div class="invites-info">
          <div v-if="!user.sentInvites?.length" class="empty-state">
            <el-empty description="暂无邀请记录" :image-size="80" />
          </div>
          <div v-else>
            <el-table :data="user.sentInvites" style="width: 100%">
              <el-table-column label="被邀请用户" width="200">
                <template #default="{ row }">
                  <div class="invite-user">
                    <el-text>{{ row.invitee.email }}</el-text>
                    <el-text type="info" size="small">{{ row.invitee.nickname || '未设置昵称' }}</el-text>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="邀请状态" width="120">
                <template #default="{ row }">
                  <el-tag :type="getInviteStatusColor(row.status)">
                    {{ formatInviteStatus(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="rewardStatus" label="奖励状态" width="120">
                <template #default="{ row }">
                  <el-tag :type="getRewardStatusColor(row.rewardStatus)" size="small">
                    {{ formatRewardStatus(row.rewardStatus) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" label="邀请时间" width="150">
                <template #default="{ row }">
                  {{ formatDate(row.createdAt) }}
                </template>
              </el-table-column>
              <el-table-column prop="updatedAt" label="更新时间" width="150">
                <template #default="{ row }">
                  {{ formatDate(row.updatedAt) }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <div class="dialog-actions">
      <el-button @click="$emit('close')">关闭</el-button>
      <el-button type="primary" @click="$emit('refresh')">刷新数据</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { adminService } from '@/services/adminService'

// Props
const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['refresh', 'close'])

// 响应式数据
const activeTab = ref('basic')

// 方法
const formatUserRole = (role) => {
  return adminService.formatUserRole(role)
}

const formatUserStatus = (status) => {
  return adminService.formatUserStatus(status)
}

const getUserStatusColor = (status) => {
  return adminService.getUserStatusColor(status)
}

const getRoleType = (role) => {
  const typeMap = {
    'USER': '',
    'ADMIN': 'danger',
    'MODERATOR': 'warning'
  }
  return typeMap[role] || ''
}

const formatSubscriptionStatus = (status) => {
  return adminService.formatSubscriptionStatus(status)
}

const getSubscriptionStatusColor = (status) => {
  return adminService.getSubscriptionStatusColor(status)
}

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

const formatInviteStatus = (status) => {
  const statusMap = {
    'PENDING': '待确认',
    'COMPLETED': '已完成',
    'CANCELLED': '已取消'
  }
  return statusMap[status] || status
}

const getInviteStatusColor = (status) => {
  const colorMap = {
    'PENDING': 'warning',
    'COMPLETED': 'success',
    'CANCELLED': 'info'
  }
  return colorMap[status] || 'info'
}

const formatRewardStatus = (status) => {
  const statusMap = {
    'PENDING': '待发放',
    'GRANTED': '已发放',
    'CANCELLED': '已取消'
  }
  return statusMap[status] || status
}

const getRewardStatusColor = (status) => {
  const colorMap = {
    'PENDING': 'warning',
    'GRANTED': 'success',
    'CANCELLED': 'info'
  }
  return colorMap[status] || 'info'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}
</script>

<style scoped>
.user-detail-dialog {
  min-height: 400px;
}

.detail-tabs {
  margin-bottom: 20px;
}

.basic-info {
  margin-bottom: 20px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.invite-user {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

/* 表格样式优化 */
.subscriptions-info .el-table,
.orders-info .el-table,
.invites-info .el-table {
  margin-top: 10px;
}

.subscriptions-info .el-table th,
.orders-info .el-table th,
.invites-info .el-table th {
  background-color: #f5f7fa;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dialog-actions {
    flex-direction: column;
  }
  
  .dialog-actions .el-button {
    width: 100%;
  }
}
</style>