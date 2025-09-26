<template>
  <div class="register-container">
    <div class="register-card">
      <!-- Logo和标题 -->
      <div class="register-header">
        <div class="logo">
          <el-icon :size="48" color="#409EFF">
            <Edit />
          </el-icon>
        </div>
        <h2 class="title">加入91Writing</h2>
        <p class="subtitle">开启您的智能写作之旅</p>
      </div>

      <!-- 注册表单 -->
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        class="register-form"
        @submit.prevent="handleRegister"
      >
        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            type="email"
            placeholder="请输入邮箱地址"
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="nickname">
          <el-input
            v-model="registerForm.nickname"
            placeholder="请输入昵称（可选）"
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
          
          <!-- 密码强度指示器 -->
          <div v-if="registerForm.password" class="password-strength">
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

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请确认密码"
            size="large"
            show-password
            @keyup.enter="handleRegister"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="inviteCode">
          <el-input
            v-model="registerForm.inviteCode"
            placeholder="邀请码（可选）"
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon><Ticket /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="acceptTerms">
          <el-checkbox v-model="registerForm.acceptTerms">
            我已阅读并同意
            <el-link type="primary" @click="showTermsDialog = true">
              《服务条款》
            </el-link>
            和
            <el-link type="primary" @click="showPrivacyDialog = true">
              《隐私政策》
            </el-link>
          </el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="register-button"
            :loading="loading"
            @click="handleRegister"
          >
            {{ loading ? '注册中...' : '立即注册' }}
          </el-button>
        </el-form-item>

        <el-form-item>
          <div class="login-link">
            <span>已有账户？</span>
            <el-link type="primary" @click="$router.push('/auth/login')">
              立即登录
            </el-link>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <!-- 服务条款弹窗 -->
    <el-dialog
      v-model="showTermsDialog"
      title="服务条款"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="terms-content">
        <h3>91Writing 服务条款</h3>
        <p>感谢您选择91Writing智能写作平台。在使用我们的服务前，请仔细阅读以下条款：</p>
        
        <h4>1. 服务说明</h4>
        <p>91Writing是一个基于人工智能的写作辅助平台，为用户提供智能写作建议、内容生成、文本优化等功能。</p>
        
        <h4>2. 用户责任</h4>
        <p>用户承诺合法使用本平台，不得利用本平台从事违法活动或侵犯他人权益。</p>
        
        <h4>3. 内容版权</h4>
        <p>用户创作的内容版权归用户所有，但需确保内容不侵犯第三方权益。</p>
        
        <h4>4. 免责声明</h4>
        <p>本平台提供的AI建议仅供参考，用户需对最终内容负责。</p>
        
        <h4>5. 服务变更</h4>
        <p>我们保留随时修改或终止服务的权利，但会提前通知用户。</p>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showTermsDialog = false">我已了解</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 隐私政策弹窗 -->
    <el-dialog
      v-model="showPrivacyDialog"
      title="隐私政策"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="privacy-content">
        <h3>91Writing 隐私政策</h3>
        <p>我们重视您的隐私权，本政策说明我们如何收集、使用和保护您的个人信息。</p>
        
        <h4>1. 信息收集</h4>
        <p>我们收集您主动提供的信息（如注册信息）和自动收集的使用数据。</p>
        
        <h4>2. 信息使用</h4>
        <p>我们使用您的信息来提供和改善服务，个性化用户体验，以及与您沟通。</p>
        
        <h4>3. 信息保护</h4>
        <p>我们采用行业标准的安全措施保护您的个人信息。</p>
        
        <h4>4. 信息共享</h4>
        <p>除法律要求外，我们不会与第三方共享您的个人信息。</p>
        
        <h4>5. 用户权利</h4>
        <p>您有权访问、修改或删除您的个人信息。</p>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showPrivacyDialog = false">我已了解</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { Edit, Message, User, Lock, Ticket } from '@element-plus/icons-vue'
import { validateEmail, validatePassword } from '@/services/authService'

// 路由和状态管理
const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const registerFormRef = ref()
const showTermsDialog = ref(false)
const showPrivacyDialog = ref(false)

// 注册表单数据
const registerForm = reactive({
  email: '',
  nickname: '',
  password: '',
  confirmPassword: '',
  inviteCode: '',
  acceptTerms: false,
})

// 计算属性
const loading = computed(() => authStore.loading)

// 密码强度验证
const passwordStrength = computed(() => {
  return validatePassword(registerForm.password)
})

// 表单验证规则
const registerRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (!validateEmail(value)) {
          callback(new Error('请输入有效的邮箱地址'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    },
  ],
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
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, message: '密码至少8个字符', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        const validation = validatePassword(value)
        if (!validation.isValid) {
          callback(new Error('密码必须包含大小写字母和数字'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    },
  ],
  acceptTerms: [
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请阅读并同意服务条款和隐私政策'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    },
  ],
}

// 监听密码变化，重新验证确认密码
watch(() => registerForm.password, () => {
  if (registerFormRef.value && registerForm.confirmPassword) {
    registerFormRef.value.validateField('confirmPassword')
  }
})

// 获取密码强度宽度
const getStrengthWidth = () => {
  const strength = passwordStrength.value.strength
  switch (strength) {
    case 'weak': return '33%'
    case 'medium': return '66%'
    case 'strong': return '100%'
    default: return '0%'
  }
}

// 获取密码强度文本
const getStrengthText = () => {
  const strength = passwordStrength.value.strength
  switch (strength) {
    case 'weak': return '弱'
    case 'medium': return '中等'
    case 'strong': return '强'
    default: return ''
  }
}

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  try {
    const valid = await registerFormRef.value.validate()
    if (!valid) return
    
    const result = await authStore.register(registerForm)
    
    if (result.success) {
      // 注册成功，跳转到登录页面
      router.push({
        path: '/auth/login',
        query: { email: registerForm.email }
      })
    }
  } catch (error) {
    console.error('注册失败:', error)
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 480px;
  position: relative;
  overflow: hidden;
}

.register-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #409EFF, #67C23A, #E6A23C, #F56C6C);
}

.register-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  margin-bottom: 16px;
}

.title {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin: 0 0 8px 0;
}

.subtitle {
  color: #909399;
  font-size: 14px;
  margin: 0;
}

.register-form {
  margin-bottom: 24px;
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

.register-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
}

.login-link {
  text-align: center;
  font-size: 14px;
  color: #909399;
}

.login-link span {
  margin-right: 8px;
}

.terms-content,
.privacy-content {
  max-height: 400px;
  overflow-y: auto;
  padding: 16px;
  line-height: 1.6;
}

.terms-content h3,
.privacy-content h3 {
  color: #303133;
  margin-bottom: 16px;
}

.terms-content h4,
.privacy-content h4 {
  color: #606266;
  margin: 16px 0 8px 0;
}

.terms-content p,
.privacy-content p {
  color: #606266;
  margin-bottom: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .register-container {
    padding: 12px;
  }
  
  .register-card {
    padding: 24px;
  }
  
  .title {
    font-size: 24px;
  }
}

/* Element Plus组件样式调整 */
:deep(.el-input__wrapper) {
  border-radius: 8px;
}

:deep(.el-button) {
  border-radius: 8px;
}

:deep(.el-checkbox) {
  font-size: 14px;
  line-height: 1.5;
}

:deep(.el-checkbox__label) {
  line-height: 1.5;
}
</style>
