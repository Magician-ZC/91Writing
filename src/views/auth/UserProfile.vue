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
              <el-tag :type="getRoleType(userInfo.role)">
                {{ getRoleText(userInfo.role) }}
              </el-tag>
            </el-form-item>

            <el-form-item label="账户状态">
              <el-tag :type="getStatusType(userInfo.status)">
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { ElMessage } from 'element-plus'
import { UserFilled, Camera } from '@element-plus/icons-vue'
import { validatePassword } from '@/services/authService'

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

// 组件挂载时
onMounted(() => {
  loadUserInfo()
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
}
</style>
