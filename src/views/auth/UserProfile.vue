<template>
  <div class="user-profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <h2>个人资料</h2>
          <el-button type="primary" @click="editMode = !editMode">
            {{ editMode ? '取消编辑' : '编辑资料' }}
          </el-button>
        </div>
      </template>

      <div class="profile-content">
        <!-- 头像区域 -->
        <div class="avatar-section">
          <el-avatar 
            :size="120" 
            :src="userInfo.avatar" 
            class="avatar"
          >
            <el-icon><UserFilled /></el-icon>
          </el-avatar>
          
          <div v-if="editMode" class="avatar-upload">
            <el-upload
              :action="uploadUrl"
              :headers="uploadHeaders"
              :before-upload="beforeAvatarUpload"
              :on-success="handleAvatarSuccess"
              :show-file-list="false"
              accept="image/*"
            >
              <el-button type="text" size="small">
                <el-icon><Camera /></el-icon>
                更换头像
              </el-button>
            </el-upload>
          </div>
        </div>

        <!-- 基本信息 -->
        <div class="info-section">
          <el-form
            ref="profileFormRef"
            :model="userInfo"
            :rules="profileRules"
            label-width="100px"
            class="profile-form"
          >
            <el-form-item label="邮箱地址" prop="email">
              <el-input
                v-model="userInfo.email"
                disabled
                placeholder="邮箱地址"
              >
                <template #suffix>
                  <el-tag 
                    :type="userInfo.emailVerified ? 'success' : 'warning'"
                    size="small"
                  >
                    {{ userInfo.emailVerified ? '已验证' : '未验证' }}
                  </el-tag>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="用户昵称" prop="nickname">
              <el-input
                v-model="userInfo.nickname"
                :disabled="!editMode"
                placeholder="请输入昵称"
                clearable
              />
            </el-form-item>

            <el-form-item label="个人简介" prop="bio">
              <el-input
                v-model="userInfo.bio"
                :disabled="!editMode"
                type="textarea"
                :rows="3"
                placeholder="介绍一下自己吧..."
                maxlength="200"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="用户角色">
              <el-tag :type="getRoleType(userInfo.role) || 'info'">
                {{ getRoleText(userInfo.role) }}
              </el-tag>
            </el-form-item>

            <el-form-item label="账户状态">
              <el-tag :type="getStatusType(userInfo.status) || 'info'">
                {{ getStatusText(userInfo.status) }}
              </el-tag>
            </el-form-item>

            <el-form-item label="注册时间">
              <span>{{ formatDate(userInfo.createdAt) }}</span>
            </el-form-item>

            <el-form-item label="最后登录">
              <span>{{ formatDate(userInfo.lastLoginAt) || '首次登录' }}</span>
            </el-form-item>

            <el-form-item v-if="editMode">
              <el-button 
                type="primary" 
                :loading="loading"
                @click="handleSaveProfile"
              >
                保存修改
              </el-button>
              <el-button @click="handleCancelEdit">
                取消
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-card>

    <!-- 修改密码卡片 -->
    <el-card class="password-card">
      <template #header>
        <h3>修改密码</h3>
      </template>

      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
        class="password-form"
      >
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input
            v-model="passwordForm.currentPassword"
            type="password"
            placeholder="请输入当前密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
          
          <!-- 密码强度指示器 -->
          <div v-if="passwordForm.newPassword" class="password-strength">
            <div class="strength-bar">
              <div 
                class="strength-fill" 
                :class="passwordStrength.strength"
                :style="{ width: getStrengthWidth() }"
              ></div>
            </div>
            <span class="strength-text" :class="passwordStrength.strength">
              {{ getStrengthText() }}
            </span>
          </div>
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请确认新密码"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            :loading="passwordLoading"
            @click="handleChangePassword"
          >
            修改密码
          </el-button>
          <el-button @click="resetPasswordForm">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 邀请码管理卡片 -->
    <el-card class="invite-card">
      <template #header>
        <div class="card-header">
          <h3>邀请码管理</h3>
          <el-button 
            type="primary" 
            size="small" 
            @click="refreshInviteData"
            :loading="inviteLoading"
          >
            刷新数据
          </el-button>
        </div>
      </template>

      <div class="invite-content">
        <!-- 我的邀请码 -->
        <div class="invite-code-section">
          <h4>我的专属邀请码</h4>
          <div class="invite-code-display">
            <div class="code-box">
              <span class="invite-code">{{ inviteInfo.inviteCode || '加载中...' }}</span>
              <el-button 
                type="primary" 
                size="small"
                :icon="CopyDocument"
                @click="copyInviteCode"
              >
                复制邀请码
              </el-button>
            </div>
            <div class="share-link">
              <el-input 
                v-model="shareUrl" 
                readonly 
                size="small"
                placeholder="邀请链接生成中..."
              >
                <template #suffix>
                  <el-button 
                    type="text" 
                    size="small"
                    :icon="Link"
                    @click="copyShareLink"
                  >
                    复制链接
                  </el-button>
                </template>
              </el-input>
            </div>
          </div>
        </div>

        <!-- 邀请统计 -->
        <div class="invite-stats-section">
          <h4>邀请统计</h4>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number">{{ inviteStats.totalInvites || 0 }}</div>
              <div class="stat-label">总邀请人数</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ inviteStats.successfulInvites || 0 }}</div>
              <div class="stat-label">成功注册</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ inviteStats.totalRewards || 0 }}</div>
              <div class="stat-label">累计奖励</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ inviteStats.pendingRewards || 0 }}</div>
              <div class="stat-label">待领取奖励</div>
            </div>
          </div>
        </div>

        <!-- 邀请的用户列表 -->
        <div class="invitees-section">
          <div class="section-header">
            <h4>邀请的用户</h4>
            <el-button 
              type="text" 
              size="small"
              @click="showInviteesDialog = true"
            >
              查看全部
            </el-button>
          </div>
          
          <div v-if="!Array.isArray(invitees) || invitees.length === 0" class="empty-state">
            <el-empty description="暂无邀请用户" :image-size="80" />
          </div>
          
          <div v-else class="invitees-preview">
            <div 
              v-for="invitee in (Array.isArray(invitees) ? invitees.slice(0, 3) : [])" 
              :key="invitee.id"
              class="invitee-item"
            >
              <el-avatar :size="32" :src="invitee.avatar">
                <el-icon><UserFilled /></el-icon>
              </el-avatar>
              <div class="invitee-info">
                <div class="invitee-name">{{ invitee.nickname || invitee.email }}</div>
                <div class="invitee-date">{{ formatDate(invitee.registeredAt) }}</div>
              </div>
              <el-tag 
                :type="invitee.status === 'ACTIVE' ? 'success' : 'warning'"
                size="small"
              >
                {{ invitee.status === 'ACTIVE' ? '已激活' : '未激活' }}
              </el-tag>
            </div>
            
            <div v-if="Array.isArray(invitees) && invitees.length > 3" class="more-indicator">
              还有 {{ invitees.length - 3 }} 个用户...
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 订阅信息卡片 -->
    <el-card class="subscription-card">
      <template #header>
        <div class="card-header">
          <h3>订阅信息</h3>
          <el-button 
            v-if="!subscription || subscription.status !== 'ACTIVE'"
            type="primary" 
            size="small"
            @click="$router.push('/pricing')"
          >
            升级套餐
          </el-button>
        </div>
      </template>

      <div v-if="subscription" class="subscription-info">
        <el-descriptions :column="2">
          <el-descriptions-item label="套餐类型">
            <el-tag type="primary">{{ getPackageName(subscription) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="订阅状态">
            <el-tag :type="getSubscriptionStatusType(subscription.status)">
              {{ formatSubscriptionStatus(subscription.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="开始时间">
            {{ formatDate(subscription.startDate) }}
          </el-descriptions-item>
          <el-descriptions-item label="到期时间">
            {{ formatDate(subscription.endDate) }}
            <el-tag 
              v-if="isExpiringSoon(subscription)" 
              type="warning" 
              size="small"
              style="margin-left: 8px;"
            >
              即将过期
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="剩余天数">
            <span :style="{ color: getRemainingDaysColor(subscription) }">
              {{ getRemainingDays(subscription) }} 天
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="自动续费">
            <el-tag :type="subscription.autoRenew ? 'success' : 'info'">
              {{ subscription.autoRenew ? '已开启' : '未开启' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 邀请奖励提示 -->
        <div v-if="isInviteRewardSubscription(subscription)" class="reward-notice">
          <el-alert
            type="success"
            :closable="false"
            show-icon
          >
            <template #title>
              <span>🎉 邀请奖励订阅</span>
            </template>
            <span>这是通过邀请码注册获得的奖励订阅！您获得了 {{ getRemainingDays(subscription) }} 天会员时长。</span>
          </el-alert>
        </div>
      </div>

      <div v-else class="no-subscription">
        <el-empty description="暂无订阅" :image-size="120">
          <template #description>
            <p>您目前还没有订阅任何套餐</p>
            <p class="tip">💡 小提示：邀请好友注册可获得免费会员时长！</p>
          </template>
          <el-button type="primary" @click="$router.push('/pricing')">
            查看套餐
          </el-button>
        </el-empty>
      </div>
    </el-card>

    <!-- 订单管理卡片 -->
    <el-card class="order-card">
      <template #header>
        <div class="card-header">
          <h3>我的订单</h3>
          <el-button 
            type="primary" 
            size="small" 
            @click="refreshOrders"
            :loading="ordersLoading"
          >
            刷新订单
          </el-button>
        </div>
      </template>

      <div class="order-content">
        <!-- 订单筛选 -->
        <div class="order-filters">
          <el-select 
            v-model="orderFilters.status" 
            placeholder="订单状态"
            clearable
            size="small"
            @change="loadOrders"
          >
            <el-option label="全部" value="" />
            <el-option label="待支付" value="PENDING" />
            <el-option label="已支付" value="PAID" />
            <el-option label="支付失败" value="FAILED" />
            <el-option label="已取消" value="CANCELLED" />
          </el-select>
          
          <el-select 
            v-model="orderFilters.paymentMethod" 
            placeholder="支付方式"
            clearable
            size="small"
            @change="loadOrders"
          >
            <el-option label="全部" value="" />
            <el-option label="支付宝" value="ALIPAY" />
            <el-option label="微信支付" value="WECHAT" />
          </el-select>

          <el-date-picker
            v-model="orderFilters.dateRange"
            type="daterange"
            size="small"
            placeholder="选择日期范围"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="loadOrders"
          />
        </div>

        <!-- 订单列表 -->
        <div v-if="ordersLoading" class="order-loading">
          <el-skeleton :rows="3" animated />
        </div>

        <div v-else-if="!orders.length" class="empty-state">
          <el-empty description="暂无订单记录" :image-size="80" />
        </div>

        <div v-else class="order-list">
          <div 
            v-for="order in orders" 
            :key="order.id"
            class="order-item"
          >
            <div class="order-header">
              <div class="order-info">
                <span class="order-no">订单号：{{ order.orderNo }}</span>
                <span class="order-date">{{ formatDate(order.createdAt) }}</span>
              </div>
              <el-tag 
                :type="getOrderStatusType(order.status)"
                size="small"
              >
                {{ formatOrderStatus(order.status) }}
              </el-tag>
            </div>

            <div class="order-body">
              <div class="order-package">
                <el-tag type="primary" size="small">{{ order.packageName }}</el-tag>
                <span class="package-duration">{{ order.packageDuration }}天</span>
              </div>
              
              <div class="order-payment">
                <div class="payment-method">
                  <el-icon><CreditCard /></el-icon>
                  {{ formatPaymentMethod(order.paymentMethod) }}
                </div>
                <div class="payment-amount">¥{{ order.amount }}</div>
              </div>
            </div>

            <div class="order-actions">
              <el-button 
                type="text" 
                size="small"
                @click="viewOrderDetail(order)"
              >
                查看详情
              </el-button>

              <el-button 
                v-if="order.status === 'PENDING' && !isOrderExpired(order)"
                type="primary" 
                size="small"
                @click="continuePayment(order)"
              >
                继续支付
              </el-button>

              <el-button 
                v-if="order.status === 'PENDING'"
                type="danger" 
                size="small"
                @click="cancelOrder(order)"
              >
                取消订单
              </el-button>
            </div>

            <!-- 过期提示 -->
            <div v-if="order.status === 'PENDING' && isOrderExpired(order)" class="order-expired">
              <el-alert
                title="订单已过期"
                type="warning"
                :closable="false"
                size="small"
              />
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="orderPagination.total > 0" class="order-pagination">
          <el-pagination
            v-model:current-page="orderPagination.page"
            v-model:page-size="orderPagination.pageSize"
            :total="orderPagination.total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="loadOrders"
            @size-change="loadOrders"
          />
        </div>
      </div>
    </el-card>

    <!-- 邀请用户详情对话框 -->
    <el-dialog
      v-model="showInviteesDialog"
      title="邀请用户详情"
      width="600px"
    >
      <div class="invitees-dialog">
        <div class="dialog-stats">
          <el-descriptions :column="3" size="small">
            <el-descriptions-item label="总邀请数">{{ invitees.length }}</el-descriptions-item>
            <el-descriptions-item label="成功注册">
              {{ invitees.filter(i => i.status === 'ACTIVE').length }}
            </el-descriptions-item>
            <el-descriptions-item label="待激活">
              {{ invitees.filter(i => i.status !== 'ACTIVE').length }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="invitees-list">
          <div 
            v-for="invitee in invitees" 
            :key="invitee.id"
            class="invitee-detail-item"
          >
            <el-avatar :size="40" :src="invitee.avatar">
              <el-icon><UserFilled /></el-icon>
            </el-avatar>
            <div class="invitee-detail-info">
              <div class="invitee-name">{{ invitee.nickname || invitee.email }}</div>
              <div class="invitee-email">{{ invitee.email }}</div>
              <div class="invitee-date">注册时间：{{ formatDate(invitee.registeredAt) }}</div>
            </div>
            <div class="invitee-status">
              <el-tag 
                :type="invitee.status === 'ACTIVE' ? 'success' : 'warning'"
              >
                {{ invitee.status === 'ACTIVE' ? '已激活' : '未激活' }}
              </el-tag>
              <div v-if="invitee.rewardStatus" class="reward-status">
                <el-tag 
                  :type="invitee.rewardStatus === 'GRANTED' ? 'success' : 'info'"
                  size="small"
                >
                  {{ invitee.rewardStatus === 'GRANTED' ? '已获得奖励' : '待发放奖励' }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UserFilled, Camera, CopyDocument, Link, CreditCard } from '@element-plus/icons-vue'
import { validatePassword } from '@/services/authService'
import { inviteService } from '@/services/inviteService'
import { paymentService } from '@/services/paymentService'

// 状态管理
const authStore = useAuthStore()

// 响应式数据
const profileFormRef = ref()
const passwordFormRef = ref()
const editMode = ref(false)
const loading = ref(false)
const passwordLoading = ref(false)

// 用户信息
const userInfo = reactive({
  email: '',
  nickname: '',
  bio: '',
  avatar: '',
  role: '',
  status: '',
  emailVerified: false,
  createdAt: '',
  lastLoginAt: '',
})

// 原始用户信息（用于取消编辑时恢复）
const originalUserInfo = reactive({})

// 密码表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// 订阅信息
const subscription = computed(() => authStore.subscription)

// 邀请码相关数据
const inviteLoading = ref(false)
const showInviteesDialog = ref(false)

const inviteInfo = reactive({
  inviteCode: '',
  inviteCount: 0,
  shareUrl: ''
})

const inviteStats = reactive({
  totalInvites: 0,
  successfulInvites: 0,
  totalRewards: 0,
  pendingRewards: 0
})

const invitees = ref([])
const shareUrl = computed(() => {
  if (inviteInfo.inviteCode) {
    return `${window.location.origin}/#/register?invite=${inviteInfo.inviteCode}`
  }
  return ''
})

// 订单管理相关数据
const ordersLoading = ref(false)
const orders = ref([])
const orderFilters = reactive({
  status: '',
  paymentMethod: '',
  dateRange: null
})
const orderPagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 上传配置
const uploadUrl = ref(`${import.meta.env.VITE_API_BASE_URL}/api/upload/avatar`)
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${authStore.accessToken}`
}))

// 密码强度验证
const passwordStrength = computed(() => {
  return validatePassword(passwordForm.newPassword)
})

// 表单验证规则
const profileRules = {
  nickname: [
    { min: 2, max: 20, message: '昵称长度为2-20个字符', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value && !/^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/.test(value)) {
          callback(new Error('昵称只能包含中英文、数字、下划线和连字符'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    },
  ],
  bio: [
    { max: 200, message: '个人简介不能超过200个字符', trigger: 'blur' },
  ],
}

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, message: '新密码至少8个字符', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        const validation = validatePassword(value)
        if (!validation.isValid) {
          callback(new Error('新密码必须包含大小写字母和数字'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    },
  ],
}

// 监听新密码变化，重新验证确认密码
watch(() => passwordForm.newPassword, () => {
  if (passwordFormRef.value && passwordForm.confirmPassword) {
    passwordFormRef.value.validateField('confirmPassword')
  }
})

// 工具函数
const getRoleType = (role) => {
  const typeMap = {
    USER: '',
    VIP: 'success',
    ADMIN: 'danger',
  }
  return typeMap[role] || ''
}

const getRoleText = (role) => {
  const textMap = {
    USER: '普通用户',
    VIP: 'VIP用户',
    ADMIN: '管理员',
  }
  return textMap[role] || role
}

const getStatusType = (status) => {
  const typeMap = {
    ACTIVE: 'success',
    INACTIVE: 'warning',
    BANNED: 'danger',
  }
  return typeMap[status] || ''
}

const getStatusText = (status) => {
  const textMap = {
    ACTIVE: '正常',
    INACTIVE: '未激活',
    BANNED: '已禁用',
  }
  return textMap[status] || status
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

const getStrengthWidth = () => {
  const strength = passwordStrength.value.strength
  switch (strength) {
    case 'weak': return '33%'
    case 'medium': return '66%'
    case 'strong': return '100%'
    default: return '0%'
  }
}

const getStrengthText = () => {
  const strength = passwordStrength.value.strength
  switch (strength) {
    case 'weak': return '弱'
    case 'medium': return '中等'
    case 'strong': return '强'
    default: return ''
  }
}

// 事件处理
const loadUserInfo = async () => {
  try {
    await authStore.fetchCurrentUser()
    const user = authStore.user
    
    Object.assign(userInfo, {
      email: user.email,
      nickname: user.nickname || '',
      bio: user.bio || '',
      avatar: user.avatar || '',
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified || false,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    })
    
    // 备份原始数据
    Object.assign(originalUserInfo, userInfo)
  } catch (error) {
    console.error('加载用户信息失败:', error)
    ElMessage.error('加载用户信息失败')
  }
}

const handleSaveProfile = async () => {
  if (!profileFormRef.value) return
  
  try {
    const valid = await profileFormRef.value.validate()
    if (!valid) return
    
    loading.value = true
    
    // TODO: 调用更新用户信息的API
    // const result = await authStore.updateProfile({
    //   nickname: userInfo.nickname,
    //   bio: userInfo.bio,
    // })
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新原始数据
    Object.assign(originalUserInfo, userInfo)
    editMode.value = false
    
    ElMessage.success('资料保存成功')
  } catch (error) {
    console.error('保存资料失败:', error)
    ElMessage.error('保存资料失败')
  } finally {
    loading.value = false
  }
}

const handleCancelEdit = () => {
  // 恢复原始数据
  Object.assign(userInfo, originalUserInfo)
  editMode.value = false
}

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return
  
  try {
    const valid = await passwordFormRef.value.validate()
    if (!valid) return
    
    passwordLoading.value = true
    
    const result = await authStore.changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    })
    
    if (result.success) {
      resetPasswordForm()
    }
  } catch (error) {
    console.error('修改密码失败:', error)
  } finally {
    passwordLoading.value = false
  }
}

const resetPasswordForm = () => {
  Object.assign(passwordForm, {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  
  if (passwordFormRef.value) {
    passwordFormRef.value.clearValidate()
  }
}

const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  
  if (!isImage) {
    ElMessage.error('头像必须是图片格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
    return false
  }
  return true
}

const handleAvatarSuccess = (response) => {
  if (response.success) {
    userInfo.avatar = response.data.url
    ElMessage.success('头像上传成功')
  } else {
    ElMessage.error('头像上传失败')
  }
}

// 邀请码相关方法
const loadInviteData = async () => {
  inviteLoading.value = true
  try {
    // 并行获取邀请码相关数据
    const [codeResult, statsResult, inviteesResult] = await Promise.all([
      inviteService.getMyInviteCode(),
      inviteService.getInviteStats(),
      inviteService.getInvitees()
    ])

    // 处理邀请码信息
    if (codeResult.success) {
      // 处理嵌套数据结构：codeResult.data.data
      const actualData = codeResult.data.data || codeResult.data
      Object.assign(inviteInfo, actualData)
      console.log('UserProfile邀请码数据:', actualData) // 调试日志
    }

    // 处理邀请统计
    if (statsResult.success) {
      // 处理嵌套数据结构：可能是 statsResult.data.data 或 statsResult.data
      const statsData = statsResult.data.data || statsResult.data
      Object.assign(inviteStats, statsData)
      console.log('UserProfile邀请统计数据:', statsData) // 调试日志
    }

  // 处理邀请用户列表
  if (inviteesResult.success) {
    // 处理嵌套数据结构：可能是 inviteesResult.data.data.invitees 或 inviteesResult.data.invitees
    const actualData = inviteesResult.data.data || inviteesResult.data
    const inviteesData = actualData.invitees || actualData
    invitees.value = Array.isArray(inviteesData) ? inviteesData : []
    console.log('UserProfile邀请用户数据:', inviteesData) // 调试日志
  } else {
    invitees.value = []
  }
  } catch (error) {
    console.error('加载邀请数据失败:', error)
    ElMessage.error('加载邀请数据失败')
  } finally {
    inviteLoading.value = false
  }
}

const refreshInviteData = async () => {
  await loadInviteData()
  ElMessage.success('邀请数据已刷新')
}

const copyInviteCode = async () => {
  if (!inviteInfo.inviteCode) {
    ElMessage.warning('邀请码还未加载完成')
    return
  }
  
  const result = await inviteService.copyInviteLink(inviteInfo.inviteCode)
  if (result.success) {
    ElMessage.success(result.message)
  } else {
    ElMessage.error(result.message)
  }
}

const copyShareLink = async () => {
  if (!shareUrl.value) {
    ElMessage.warning('分享链接还未生成')
    return
  }
  
  const result = await inviteService.copyInviteLink(inviteInfo.inviteCode)
  if (result.success) {
    ElMessage.success('分享链接已复制到剪贴板')
  } else {
    ElMessage.error(result.message)
  }
}

// 加载订阅信息
const loadSubscriptionInfo = async () => {
  try {
    // 从订阅服务获取当前订阅信息
    const { subscriptionService } = await import('@/services/subscriptionService')
    const response = await subscriptionService.getCurrentSubscription()
    console.log('订阅信息响应:', response)
    
    if (response.success) {
      // 处理嵌套数据结构
      const subscriptionData = response.data?.data || response.data
      console.log('解析后的订阅数据:', subscriptionData)
      
      // 更新authStore中的订阅信息
      if (subscriptionData) {
        authStore.subscription = subscriptionData
      } else {
        // 没有订阅时，清空订阅信息
        authStore.subscription = null
        console.log('当前用户暂无订阅')
      }
    }
  } catch (error) {
    console.error('加载订阅信息失败:', error)
    // 失败时也清空订阅信息
    authStore.subscription = null
  }
}

// 获取套餐名称
const getPackageName = (subscription) => {
  return subscription.package?.name || subscription.packageName || '未知套餐'
}

// 格式化订阅状态
const formatSubscriptionStatus = (status) => {
  const statusMap = {
    'ACTIVE': '有效',
    'EXPIRED': '已过期',
    'CANCELLED': '已取消',
    'PENDING': '待激活'
  }
  return statusMap[status] || status
}

// 获取订阅状态类型
const getSubscriptionStatusType = (status) => {
  const typeMap = {
    'ACTIVE': 'success',
    'EXPIRED': 'danger',
    'CANCELLED': 'info',
    'PENDING': 'warning'
  }
  return typeMap[status] || 'info'
}

// 计算剩余天数
const getRemainingDays = (subscription) => {
  if (!subscription?.endDate) return 0
  const now = new Date()
  const end = new Date(subscription.endDate)
  const diff = end - now
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return Math.max(0, days)
}

// 获取剩余天数颜色
const getRemainingDaysColor = (subscription) => {
  const days = getRemainingDays(subscription)
  if (days <= 3) return '#f56c6c' // 红色
  if (days <= 7) return '#e6a23c' // 橙色
  return '#67c23a' // 绿色
}

// 检查是否即将过期
const isExpiringSoon = (subscription) => {
  const days = getRemainingDays(subscription)
  return days > 0 && days <= 7
}

// 检查是否是邀请奖励订阅
const isInviteRewardSubscription = (subscription) => {
  // 如果订阅关联的package价格为0，或者持续时间为3天或7天（常见奖励时长），判断为奖励订阅
  if (!subscription) return false
  const duration = subscription.package?.durationDays
  const price = subscription.package?.price
  // 3天或7天的免费套餐视为奖励订阅
  return (duration === 3 || duration === 7) && (price === 0 || price === null)
}

// 订单管理相关方法
const loadOrders = async () => {
  ordersLoading.value = true
  try {
    const params = {
      page: orderPagination.page,
      limit: orderPagination.pageSize
    }

    // 只添加有效的status值
    if (orderFilters.status && orderFilters.status !== '') {
      params.status = orderFilters.status
    }

    const response = await paymentService.getOrders(params)
    
    if (response.success) {
      orders.value = response.data.data || []
      orderPagination.total = response.data.total || 0
    } else {
      ElMessage.error('获取订单列表失败')
    }
  } catch (error) {
    console.error('加载订单失败:', error)
    ElMessage.error('加载订单失败')
  } finally {
    ordersLoading.value = false
  }
}

const refreshOrders = async () => {
  orderPagination.page = 1
  await loadOrders()
  ElMessage.success('订单数据已刷新')
}

const viewOrderDetail = (order) => {
  // 可以跳转到订单详情页面或显示详情对话框
  ElMessage.info(`查看订单详情: ${order.orderNo}`)
  // this.$router.push(`/orders/${order.orderNo}`)
}

const continuePayment = async (order) => {
  try {
    const result = await paymentService.pay(order.orderNo)
    if (result.success) {
      // 根据支付方式处理支付逻辑
      if (order.paymentMethod === 'ALIPAY') {
        // 跳转到支付宝支付页面
        window.open(result.data.payUrl, '_blank')
      } else if (order.paymentMethod === 'WECHAT') {
        // 显示微信支付二维码
        ElMessage.info('请使用微信扫码支付')
      }
      
      // 启动支付状态轮询
      startPaymentPolling(order.orderNo)
    } else {
      ElMessage.error(result.message || '发起支付失败')
    }
  } catch (error) {
    console.error('继续支付失败:', error)
    ElMessage.error('发起支付失败')
  }
}

const cancelOrder = async (order) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消订单 ${order.orderNo} 吗？`,
      '取消订单',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const result = await paymentService.cancelOrder(order.orderNo)
    if (result.success) {
      ElMessage.success('订单已取消')
      await loadOrders() // 刷新订单列表
    } else {
      ElMessage.error(result.message || '取消订单失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消订单失败:', error)
      ElMessage.error('取消订单失败')
    }
  }
}

const startPaymentPolling = (orderNo) => {
  const stopPolling = paymentService.pollPaymentStatus(orderNo, {
    interval: 3000,
    maxAttempts: 100,
    onSuccess: (order) => {
      ElMessage.success('支付成功！')
      loadOrders() // 刷新订单列表
      loadSubscriptionInfo() // 刷新订阅信息
    },
    onFailed: (order) => {
      ElMessage.error('支付失败，请重试')
      loadOrders() // 刷新订单列表
    },
    onTimeout: () => {
      ElMessage.warning('支付超时，请手动刷新页面查看状态')
    }
  })

  // 可以在组件销毁时停止轮询
  return stopPolling
}

const isOrderExpired = (order) => {
  if (!order?.expiresAt) return false
  return new Date() > new Date(order.expiresAt)
}

const formatOrderStatus = (status) => {
  const statusMap = {
    'PENDING': '待支付',
    'PAID': '已支付',
    'FAILED': '支付失败',
    'CANCELLED': '已取消'
  }
  return statusMap[status] || '未知状态'
}

const getOrderStatusType = (status) => {
  const typeMap = {
    'PENDING': 'warning',
    'PAID': 'success',
    'FAILED': 'danger',
    'CANCELLED': 'info'
  }
  return typeMap[status] || 'info'
}

const formatPaymentMethod = (method) => {
  const methodMap = {
    'ALIPAY': '支付宝',
    'WECHAT': '微信支付',
    'INVITE_REWARD': '邀请奖励'
  }
  return methodMap[method] || method
}

// 组件挂载时
onMounted(() => {
  loadUserInfo()
  loadInviteData()
  loadSubscriptionInfo()
  loadOrders()
})
</script>

<style scoped>
.user-profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2,
.card-header h3 {
  margin: 0;
  color: #303133;
}

.profile-content {
  display: flex;
  gap: 40px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  min-width: 160px;
}

.avatar {
  border: 3px solid #f0f0f0;
}

.avatar-upload {
  text-align: center;
}

.info-section {
  flex: 1;
}

.profile-form {
  max-width: 500px;
}

.password-strength {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background-color: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 2px;
}

.strength-fill.weak {
  background-color: #f56c6c;
}

.strength-fill.medium {
  background-color: #e6a23c;
}

.strength-fill.strong {
  background-color: #67c23a;
}

.strength-text {
  font-size: 12px;
  font-weight: 500;
  min-width: 24px;
}

.strength-text.weak {
  color: #f56c6c;
}

.strength-text.medium {
  color: #e6a23c;
}

.strength-text.strong {
  color: #67c23a;
}

.password-card,
.subscription-card,
.order-card {
  margin-top: 0;
}

.subscription-info {
  padding: 16px 0;
}

.no-subscription {
  padding: 40px 20px;
  text-align: center;
}

.no-subscription .tip {
  font-size: 13px;
  color: #909399;
  margin-top: 8px;
}

.reward-notice {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
}

/* 邀请码相关样式 */
.invite-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.invite-content h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

/* 邀请码展示 */
.invite-code-section {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.invite-code-display {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.code-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.invite-code {
  font-size: 18px;
  font-weight: 600;
  color: #2c5aa0;
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
}

.share-link {
  margin-top: 8px;
}

/* 统计网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-top: 12px;
}

.stat-item {
  text-align: center;
  padding: 16px 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #2c5aa0;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
  line-height: 1.3;
}

/* 邀请用户列表 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.invitees-preview {
  margin-top: 12px;
}

.invitee-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 8px;
}

.invitee-info {
  flex: 1;
}

.invitee-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 2px;
}

.invitee-date {
  font-size: 12px;
  color: #909399;
}

.more-indicator {
  text-align: center;
  padding: 8px;
  font-size: 12px;
  color: #909399;
  background: #f5f7fa;
  border-radius: 4px;
  margin-top: 8px;
}

.empty-state {
  text-align: center;
  padding: 24px 12px;
}

/* 对话框样式 */
.invitees-dialog {
  max-height: 500px;
  overflow-y: auto;
}

.dialog-stats {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
}

.invitees-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.invitee-detail-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.invitee-detail-info {
  flex: 1;
}

.invitee-detail-info .invitee-name {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
}

.invitee-email {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.invitee-detail-info .invitee-date {
  font-size: 12px;
  color: #999;
}

.invitee-status {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.reward-status {
  margin-top: 4px;
}

/* 订单管理样式 */
.order-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.order-filters .el-select,
.order-filters .el-date-editor {
  min-width: 160px;
}

.order-loading {
  padding: 20px;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-item {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.order-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e9ecef;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-no {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.order-date {
  font-size: 12px;
  color: #909399;
}

.order-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.order-package {
  display: flex;
  align-items: center;
  gap: 8px;
}

.package-duration {
  font-size: 13px;
  color: #666;
}

.order-payment {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #666;
}

.payment-amount {
  font-size: 18px;
  font-weight: 700;
  color: #e6a23c;
}

.order-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.order-expired {
  margin-top: 12px;
}

.order-pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-profile-container {
    padding: 12px;
  }
  
  .profile-content {
    flex-direction: column;
    gap: 20px;
  }
  
  .avatar-section {
    align-self: center;
  }
  
  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .code-box {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .invitee-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .invitee-detail-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .invitee-status {
    align-items: flex-start;
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  /* 订单管理移动端样式 */
  .order-filters {
    flex-direction: column;
    gap: 8px;
  }
  
  .order-filters .el-select,
  .order-filters .el-date-editor {
    min-width: auto;
    width: 100%;
  }
  
  .order-body {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .order-payment {
    align-items: flex-start;
  }
  
  .order-actions {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}
</style>
