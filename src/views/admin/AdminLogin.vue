<template>
  <div class="admin-login-page">
    <div class="login-container">
      <div class="login-card">
        <!-- Logo和标题 -->
        <div class="login-header">
          <div class="logo">
            <el-icon :size="48" color="#409EFF">
              <Lock />
            </el-icon>
          </div>
          <h1>91Writing 管理后台</h1>
          <p class="subtitle">请使用管理员账号登录</p>
        </div>

        <!-- 登录表单 -->
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="email">
            <el-input
              v-model="loginForm.email"
              placeholder="管理员邮箱"
              size="large"
              :prefix-icon="User"
              clearable
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="密码"
              size="large"
              :prefix-icon="Key"
              show-password
              clearable
            />
          </el-form-item>

          <el-form-item>
            <el-checkbox v-model="loginForm.rememberMe">
              记住登录状态
            </el-checkbox>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              style="width: 100%"
              :loading="loading"
              @click="handleLogin"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 返回链接 -->
        <div class="footer-links">
          <router-link to="/auth/login" class="back-link">
            <el-icon><ArrowLeft /></el-icon>
            返回用户登录
          </router-link>
        </div>
      </div>
    </div>

    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock, User, Key, ArrowLeft } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

// 表单数据
const loginFormRef = ref()
const loading = ref(false)

const loginForm = reactive({
  email: '',
  password: '',
  rememberMe: false
})

// 验证规则
const loginRules = {
  email: [
    { required: true, message: '请输入管理员邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return

    loading.value = true

    // 调用登录
    const result = await authStore.login(loginForm)

    if (result.success) {
      // 验证管理员权限
      if (authStore.isAdmin) {
        ElMessage.success('登录成功')
        router.push('/admin/dashboard')
      } else {
        ElMessage.error('您没有管理员权限')
        await authStore.logout()
      }
    } else {
      ElMessage.error(result.error || '登录失败')
    }
  } catch (error) {
    console.error('登录错误:', error)
    ElMessage.error(error.message || '登录失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.admin-login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.background-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  overflow: hidden;
  z-index: 0;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 20s infinite ease-in-out;
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: 20%;
  right: 15%;
  animation-delay: 5s;
}

.circle-3 {
  width: 150px;
  height: 150px;
  top: 60%;
  left: 70%;
  animation-delay: 10s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-30px) rotate(180deg);
  }
}

.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 450px;
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 16px;
  padding: 48px 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.login-header h1 {
  margin: 0 0 12px 0;
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.subtitle {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.login-form {
  margin-top: 32px;
}

.footer-links {
  text-align: center;
  margin-top: 24px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #409EFF;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s;
}

.back-link:hover {
  color: #66B1FF;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-container {
    max-width: 100%;
    padding: 16px;
  }

  .login-card {
    padding: 32px 24px;
  }

  .login-header h1 {
    font-size: 24px;
  }

  .circle {
    display: none;
  }
}
</style>
