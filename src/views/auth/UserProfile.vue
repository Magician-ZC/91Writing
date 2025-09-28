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
    <el-card v-if="subscription" class="subscription-card">
      <template #header>
        <h3>订阅信息</h3>
      </template>

      <div class="subscription-info">
        <el-descriptions :column="2">
          <el-descriptions-item label="套餐类型">
            <el-tag type="primary">{{ subscription.packageName }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="订阅状态">
            <el-tag :type="subscription.status === 'ACTIVE' ? 'success' : 'warning'">
              {{ subscription.status === 'ACTIVE' ? '有效' : '已过期' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="开始时间">
            {{ formatDate(subscription.startDate) }}
          </el-descriptions-item>
          <el-descriptions-item label="到期时间">
            {{ formatDate(subscription.endDate) }}
          </el-descriptions-item>
          <el-descriptions-item label="自动续费">
            <el-tag :type="subscription.autoRenew ? 'success' : 'info'">
              {{ subscription.autoRenew ? '已开启' : '未开启' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
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
import { ElMessage } from 'element-plus'
import { UserFilled, Camera, CopyDocument, Link } from '@element-plus/icons-vue'
import { validatePassword } from '@/services/authService'
import inviteService from '@/services/inviteService'

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
      Object.assign(inviteInfo, codeResult.data)
    }

    // 处理邀请统计
    if (statsResult.success) {
      Object.assign(inviteStats, statsResult.data)
    }

  // 处理邀请用户列表
  if (inviteesResult.success) {
    invitees.value = Array.isArray(inviteesResult.data) ? inviteesResult.data : []
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

// 组件挂载时
onMounted(() => {
  loadUserInfo()
  loadInviteData()
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
.subscription-card {
  margin-top: 0;
}

.subscription-info {
  padding: 16px 0;
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
}
</style>
