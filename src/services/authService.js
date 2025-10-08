import axios from 'axios'
import { ElMessage } from 'element-plus'

// 🔧 API基础URL配置 - 统一通过API Gateway访问
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const AUTH_API_URL = `${BASE_URL}/api/v1/auth`

// 创建axios实例
const authApi = axios.create({
  baseURL: AUTH_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加认证token
authApi.interceptors.request.use(
  (config) => {
    // 从localStorage或sessionStorage获取token
    const tokens = JSON.parse(localStorage.getItem('auth-tokens') || sessionStorage.getItem('auth-tokens') || '{}')
    
    if (tokens.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一处理错误和成功响应
authApi.interceptors.response.use(
  (response) => {
    // 后端统一返回格式处理
    const { data } = response
    
    // 如果后端直接返回数据（没有包装），则包装成统一格式
    if (!data.hasOwnProperty('success')) {
      return {
        success: true,
        data: data,
        message: '操作成功',
      }
    }
    
    return data
  },
  (error) => {
    console.error('API请求错误:', error)
    
    // 处理网络错误
    if (!error.response) {
      const networkError = {
        success: false,
        message: '网络连接失败，请检查网络设置',
        error: 'NETWORK_ERROR',
      }
      return Promise.reject(networkError)
    }
    
    const { status, data } = error.response
    
    // 统一错误处理
    let errorMessage = '请求失败'
    let errorCode = 'UNKNOWN_ERROR'
    
    switch (status) {
      case 400:
        errorMessage = data?.message || data?.error?.message || '请求参数错误'
        errorCode = 'BAD_REQUEST'
        break
      case 401:
        // 优先使用后端返回的具体错误信息
        errorMessage = data?.message || data?.error?.message || '认证失败，请重新登录'
        errorCode = 'UNAUTHORIZED'
        // 如果不是登录错误，才清除认证信息
        if (!data?.message?.includes('密码错误') && !data?.message?.includes('邮箱')) {
          localStorage.removeItem('auth-tokens')
          localStorage.removeItem('auth-user')
          sessionStorage.removeItem('auth-tokens')
          sessionStorage.removeItem('auth-user')
        }
        break
      case 403:
        errorMessage = '权限不足'
        errorCode = 'FORBIDDEN'
        break
      case 404:
        errorMessage = '请求的资源不存在'
        errorCode = 'NOT_FOUND'
        break
      case 409:
        errorMessage = data?.message || '数据冲突'
        errorCode = 'CONFLICT'
        break
      case 422:
        errorMessage = data?.message || '数据验证失败'
        errorCode = 'VALIDATION_ERROR'
        break
      case 429:
        errorMessage = '请求过于频繁，请稍后再试'
        errorCode = 'TOO_MANY_REQUESTS'
        break
      case 500:
        errorMessage = '服务器内部错误'
        errorCode = 'INTERNAL_ERROR'
        break
      default:
        errorMessage = data?.message || `请求失败 (${status})`
        errorCode = 'HTTP_ERROR'
    }
    
    const errorResponse = {
      success: false,
      message: errorMessage,
      error: errorCode,
      status,
      details: data?.details || null,
    }
    
    return Promise.reject(errorResponse)
  }
)

// 认证服务类
export const authService = {
  // 用户注册
  async register(userData) {
    try {
      const response = await authApi.post('/register', userData)
      return response
    } catch (error) {
      throw error
    }
  },

  // 用户登录
  async login(credentials) {
    try {
      const response = await authApi.post('/login', credentials)
      return response
    } catch (error) {
      throw error
    }
  },

  // 用户登出
  async logout() {
    try {
      const response = await authApi.post('/logout')
      return response
    } catch (error) {
      throw error
    }
  },

  // 刷新令牌
  async refreshTokens(refreshData) {
    try {
      const response = await authApi.post('/refresh', refreshData)
      return response
    } catch (error) {
      throw error
    }
  },

  // 检查令牌有效性
  async checkToken() {
    try {
      const response = await authApi.post('/check-token')
      return response
    } catch (error) {
      throw error
    }
  },

  // 获取当前用户信息
  async getCurrentUser() {
    try {
      const response = await authApi.get('/me')
      return response
    } catch (error) {
      throw error
    }
  },

  // 修改密码
  async changePassword(passwordData) {
    try {
      const response = await authApi.patch('/change-password', passwordData)
      return response
    } catch (error) {
      throw error
    }
  },

  // 忘记密码
  async forgotPassword(emailData) {
    try {
      const response = await authApi.post('/forgot-password', emailData)
      return response
    } catch (error) {
      throw error
    }
  },

  // 重置密码
  async resetPassword(resetData) {
    try {
      const response = await authApi.post('/reset-password', resetData)
      return response
    } catch (error) {
      throw error
    }
  },

  // 邮箱验证
  async verifyEmail(verifyData) {
    try {
      const response = await authApi.post('/verify-email', verifyData)
      return response
    } catch (error) {
      throw error
    }
  },
}

// 工具函数

// 验证邮箱格式
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 验证密码强度
export const validatePassword = (password) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }
  
  const passedChecks = Object.values(checks).filter(Boolean).length
  
  return {
    isValid: checks.length && (checks.uppercase || checks.lowercase) && checks.number,
    strength: passedChecks >= 4 ? 'strong' : passedChecks >= 3 ? 'medium' : 'weak',
    checks,
  }
}

// 格式化API错误消息
export const formatApiError = (error) => {
  if (typeof error === 'string') return error
  
  if (error.details && Array.isArray(error.details)) {
    return error.details.map(detail => detail.message).join('; ')
  }
  
  return error.message || '未知错误'
}

// 创建带重试的请求函数
export const createRetryRequest = (requestFn, maxRetries = 3) => {
  return async (...args) => {
    let lastError
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await requestFn(...args)
      } catch (error) {
        lastError = error
        
        // 如果是认证错误或客户端错误，不重试
        if (error.status && error.status < 500) {
          throw error
        }
        
        // 最后一次重试失败，抛出错误
        if (i === maxRetries) {
          throw error
        }
        
        // 等待一段时间后重试 (指数退避)
        const delay = Math.pow(2, i) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw lastError
  }
}

export default authService
