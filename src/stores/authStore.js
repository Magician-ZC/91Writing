import { defineStore } from 'pinia'
import { authService } from '@/services/authService'
import { ElMessage } from 'element-plus'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // 用户认证状态
    isAuthenticated: false,
    user: null,
    tokens: null,
    
    // 加载状态
    loading: false,
    
    // 记住登录状态
    rememberMe: false,
    
    // 订阅信息
    subscription: null,
  }),

  getters: {
    // 获取访问令牌
    accessToken: (state) => state.tokens?.accessToken,
    
    // 获取用户角色
    userRole: (state) => state.user?.role,
    
    // 检查是否为管理员
    isAdmin: (state) => state.user?.role === 'ADMIN',
    
    // 检查用户状态
    isActive: (state) => state.user?.status === 'ACTIVE',
    
    // 获取用户昵称
    displayName: (state) => state.user?.nickname || state.user?.email?.split('@')[0] || '用户',
    
    // 检查是否有有效订阅
    hasActiveSubscription: (state) => state.subscription?.status === 'ACTIVE',
    
    // 检查令牌是否即将过期 (小于1小时)
    tokenExpiringSoon: (state) => {
      if (!state.tokens?.expiresIn) return false
      const expiryTime = Date.now() + (state.tokens.expiresIn * 1000)
      const oneHour = 60 * 60 * 1000
      return (expiryTime - Date.now()) < oneHour
    },
  },

  actions: {
    // 初始化认证状态
    async initAuth() {
      this.loading = true
      try {
        // 从localStorage获取保存的令牌
        const savedTokens = localStorage.getItem('auth-tokens')
        const savedUser = localStorage.getItem('auth-user')
        const rememberMe = localStorage.getItem('auth-remember') === 'true'
        
        if (savedTokens && savedUser) {
          this.tokens = JSON.parse(savedTokens)
          this.user = JSON.parse(savedUser)
          this.rememberMe = rememberMe
          
          // 验证令牌有效性
          const isValid = await this.validateToken()
          if (isValid) {
            this.isAuthenticated = true
            // 获取最新用户信息
            await this.fetchCurrentUser()
          } else {
            this.clearAuth()
          }
        }
      } catch (error) {
        console.error('认证初始化失败:', error)
        this.clearAuth()
      } finally {
        this.loading = false
      }
    },

    // 用户登录
    async login(credentials) {
      this.loading = true
      try {
        const response = await authService.login(credentials)
        
        if (response.success) {
          const { user, tokens, subscription } = response.data
          
          // 更新状态
          this.user = user
          this.tokens = tokens
          this.subscription = subscription
          this.isAuthenticated = true
          this.rememberMe = credentials.rememberMe || false
          
          // 保存到localStorage
          this.saveAuthData()
          
          ElMessage.success('登录成功')
          return { success: true }
        } else {
          throw new Error(response.message || '登录失败')
        }
      } catch (error) {
        console.error('登录失败:', error)
        ElMessage.error(error.message || '登录失败，请检查用户名和密码')
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    // 用户注册
    async register(userData) {
      this.loading = true
      try {
        const response = await authService.register(userData)
        
        if (response.success) {
          ElMessage.success('注册成功！请检查邮箱完成验证')
          return { success: true, data: response.data }
        } else {
          throw new Error(response.message || '注册失败')
        }
      } catch (error) {
        console.error('注册失败:', error)
        ElMessage.error(error.message || '注册失败')
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    // 用户登出
    async logout() {
      try {
        // 调用后端登出接口
        if (this.isAuthenticated) {
          await authService.logout()
        }
      } catch (error) {
        console.error('登出请求失败:', error)
      } finally {
        // 无论后端是否成功，都清除本地状态
        this.clearAuth()
        ElMessage.success('已成功登出')
      }
    },

    // 刷新令牌
    async refreshTokens() {
      if (!this.tokens?.refreshToken) {
        this.clearAuth()
        return false
      }

      try {
        const response = await authService.refreshTokens({
          refreshToken: this.tokens.refreshToken
        })
        
        if (response.success) {
          this.tokens = response.data.tokens
          this.saveAuthData()
          return true
        } else {
          throw new Error('令牌刷新失败')
        }
      } catch (error) {
        console.error('令牌刷新失败:', error)
        this.clearAuth()
        return false
      }
    },

    // 验证令牌有效性
    async validateToken() {
      if (!this.tokens?.accessToken) return false
      
      try {
        const response = await authService.checkToken()
        return response.success && response.data.valid
      } catch (error) {
        console.error('令牌验证失败:', error)
        return false
      }
    },

    // 获取当前用户信息
    async fetchCurrentUser() {
      try {
        const response = await authService.getCurrentUser()
        if (response.success) {
          this.user = response.data
          this.saveAuthData()
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    },

    // 修改密码
    async changePassword(passwordData) {
      this.loading = true
      try {
        const response = await authService.changePassword(passwordData)
        
        if (response.success) {
          ElMessage.success('密码修改成功')
          return { success: true }
        } else {
          throw new Error(response.message || '密码修改失败')
        }
      } catch (error) {
        console.error('密码修改失败:', error)
        ElMessage.error(error.message || '密码修改失败')
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    // 忘记密码
    async forgotPassword(email) {
      this.loading = true
      try {
        const response = await authService.forgotPassword({ email })
        
        if (response.success) {
          ElMessage.success('密码重置邮件已发送，请查收邮箱')
          return { success: true }
        } else {
          throw new Error(response.message || '发送失败')
        }
      } catch (error) {
        console.error('发送重置邮件失败:', error)
        ElMessage.error(error.message || '发送失败')
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    // 重置密码
    async resetPassword(resetData) {
      this.loading = true
      try {
        const response = await authService.resetPassword(resetData)
        
        if (response.success) {
          ElMessage.success('密码重置成功，请使用新密码登录')
          return { success: true }
        } else {
          throw new Error(response.message || '密码重置失败')
        }
      } catch (error) {
        console.error('密码重置失败:', error)
        ElMessage.error(error.message || '密码重置失败')
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    // 邮箱验证
    async verifyEmail(token) {
      this.loading = true
      try {
        const response = await authService.verifyEmail({ token })
        
        if (response.success) {
          ElMessage.success('邮箱验证成功')
          // 刷新用户信息
          await this.fetchCurrentUser()
          return { success: true }
        } else {
          throw new Error(response.message || '验证失败')
        }
      } catch (error) {
        console.error('邮箱验证失败:', error)
        ElMessage.error(error.message || '验证失败')
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    // 保存认证数据到localStorage
    saveAuthData() {
      if (this.rememberMe) {
        localStorage.setItem('auth-tokens', JSON.stringify(this.tokens))
        localStorage.setItem('auth-user', JSON.stringify(this.user))
        localStorage.setItem('auth-remember', 'true')
      } else {
        // 仅保存到sessionStorage
        sessionStorage.setItem('auth-tokens', JSON.stringify(this.tokens))
        sessionStorage.setItem('auth-user', JSON.stringify(this.user))
        localStorage.removeItem('auth-tokens')
        localStorage.removeItem('auth-user')
        localStorage.removeItem('auth-remember')
      }
    },

    // 清除认证状态
    clearAuth() {
      this.isAuthenticated = false
      this.user = null
      this.tokens = null
      this.subscription = null
      this.rememberMe = false
      
      // 清除存储
      localStorage.removeItem('auth-tokens')
      localStorage.removeItem('auth-user')
      localStorage.removeItem('auth-remember')
      sessionStorage.removeItem('auth-tokens')
      sessionStorage.removeItem('auth-user')
    },

    // 设置令牌拦截器
    setupTokenInterceptor() {
      // 自动刷新令牌
      setInterval(async () => {
        if (this.isAuthenticated && this.tokenExpiringSoon) {
          await this.refreshTokens()
        }
      }, 10 * 60 * 1000) // 每10分钟检查一次
    },
  },
})
