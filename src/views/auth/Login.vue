<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Logo和标题 -->
      <div class="login-header">
        <div class="logo">
          <el-icon :size="48" color="#409EFF">
            <Edit />
          </el-icon>
        </div>
        <h2 class="title">91Writing</h2>
        <p class="subtitle">智能写作平台</p>
      </div>

      <!-- 登录表单 -->
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="email">
          <el-input
            v-model="loginForm.email"
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

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <div class="login-options">
            <el-checkbox v-model="loginForm.rememberMe">
              记住登录状态
            </el-checkbox>
            <el-link 
              type="primary" 
              class="forgot-password"
              @click="showForgotPassword = true"
            >
              忘记密码？
            </el-link>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-button"
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>

        <el-form-item>
          <div class="register-link">
            <span>还没有账户？</span>
            <el-link type="primary" @click="$router.push('/auth/register')">
              立即注册
            </el-link>
          </div>
        </el-form-item>
      </el-form>

      <!-- 快速体验 -->
      <div class="demo-section">
        <el-divider>或</el-divider>
        <el-button 
          type="info" 
          plain 
          size="large"
          class="demo-button"
          @click="handleDemoLogin"
        >
          <el-icon><User /></el-icon>
          体验演示账户
        </el-button>
      </div>
    </div>

    <!-- 忘记密码弹窗 -->
    <el-dialog
      v-model="showForgotPassword"
      title="重置密码"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="forgotPasswordFormRef"
        :model="forgotPasswordForm"
        :rules="forgotPasswordRules"
      >
        <el-form-item prop="email">
          <el-input
            v-model="forgotPasswordForm.email"
            type="email"
            placeholder="请输入注册邮箱"
            size="large"
          >
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showForgotPassword = false">取消</el-button>
          <el-button 
            type="primary" 
            :loading="forgotPasswordLoading"
            @click="handleForgotPassword"
          >
            发送重置邮件
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Message, Lock, User } from '@element-plus/icons-vue'
import { validateEmail } from '@/services/authService'

// 路由和状态管理
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 响应式数据
const loginFormRef = ref()
const forgotPasswordFormRef = ref()
const showForgotPassword = ref(false)
const forgotPasswordLoading = ref(false)

// 登录表单数据
const loginForm = reactive({
  email: '',
  password: '',
  rememberMe: false,
})

// 忘记密码表单数据
const forgotPasswordForm = reactive({
  email: '',
})

// 计算属性
const loading = computed(() => authStore.loading)

// 表单验证规则
const loginRules = {
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
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6个字符', trigger: 'blur' },
  ],
}

const forgotPasswordRules = {
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
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return
    
    const result = await authStore.login(loginForm)
    
    if (result.success) {
      // 登录成功，延迟跳转确保状态更新完成
      await nextTick()
      
      const redirect = route.query.redirect || '/home'
      console.log('登录成功，准备跳转到:', redirect)
      
      try {
        await router.push(redirect)
        console.log('路由跳转完成')
      } catch (routeError) {
        console.error('路由跳转失败:', routeError)
        // 回退到首页
        await router.push('/home')
      }
    }
  } catch (error) {
    console.error('登录失败:', error)
  }
}

// 处理演示登录
const handleDemoLogin = async () => {
  try {
    const confirmed = await ElMessageBox.confirm(
      '这将使用演示账户登录，所有数据仅供体验使用。是否继续？',
      '体验演示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      }
    )
    
    if (confirmed) {
      // 使用预设的演示账户
      loginForm.email = 'test@91writing.com'
      loginForm.password = 'password123'
      loginForm.rememberMe = false
      
      await handleLogin()
    }
  } catch (error) {
    // 用户取消操作
  }
}

// 处理忘记密码
const handleForgotPassword = async () => {
  if (!forgotPasswordFormRef.value) return
  
  try {
    const valid = await forgotPasswordFormRef.value.validate()
    if (!valid) return
    
    forgotPasswordLoading.value = true
    
    const result = await authStore.forgotPassword(forgotPasswordForm.email)
    
    if (result.success) {
      showForgotPassword.value = false
      forgotPasswordForm.email = ''
    }
  } catch (error) {
    console.error('发送重置邮件失败:', error)
  } finally {
    forgotPasswordLoading.value = false
  }
}

// 组件挂载时
onMounted(() => {
  // 如果已经登录，直接跳转
  if (authStore.isAuthenticated) {
    const redirect = route.query.redirect || '/home'
    router.push(redirect)
  }
  
  // 从URL参数中获取邮箱（如果有）
  if (route.query.email) {
    loginForm.email = route.query.email
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 420px;
  position: relative;
  overflow: hidden;
}

.login-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #409EFF, #67C23A, #E6A23C, #F56C6C);
}

.login-header {
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

.login-form {
  margin-bottom: 24px;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.forgot-password {
  font-size: 14px;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
}

.register-link {
  text-align: center;
  font-size: 14px;
  color: #909399;
}

.register-link span {
  margin-right: 8px;
}

.demo-section {
  margin-top: 24px;
}

.demo-button {
  width: 100%;
  height: 44px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-container {
    padding: 12px;
  }
  
  .login-card {
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
}

:deep(.el-divider__text) {
  color: #909399;
  font-size: 14px;
}
</style>
