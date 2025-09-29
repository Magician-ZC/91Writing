/**
 * API管理器 - 统一的API服务层
 * 整合云端API和本地存储，支持双模式运行
 */

import axios from 'axios'
import { ElMessage } from 'element-plus'
import localStorageManager from './localStorageManager'

class ApiManager {
  constructor() {
    this.mode = 'hybrid' // 'cloud', 'local', 'hybrid'
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
    this.isOnline = navigator.onLine
    
    // 微服务端点配置
    this.services = {
      auth: 'http://localhost:3002',
      user: 'http://localhost:3001', 
      novel: 'http://localhost:3003',
      ai: 'http://localhost:3004',
      payment: 'http://localhost:3005',
      admin: 'http://localhost:3006',
      gateway: 'http://localhost:3000'
    }
    
    this.setupAxios()
    this.setupOnlineListener()
  }

  /**
   * 配置Axios实例
   */
  setupAxios() {
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // 请求拦截器
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.api.interceptors.response.use(
      (response) => {
        const { data } = response
        
        // 统一响应格式处理
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
        return this.handleApiError(error)
      }
    )
  }

  /**
   * 设置在线状态监听
   */
  setupOnlineListener() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.syncLocalData()
    })
    
    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  /**
   * 获取认证令牌
   */
  getAuthToken() {
    const tokens = JSON.parse(
      localStorage.getItem('auth-tokens') || 
      sessionStorage.getItem('auth-tokens') || 
      '{}'
    )
    return tokens.accessToken
  }

  /**
   * 处理API错误
   */
  handleApiError(error) {
    console.error('API请求错误:', error)
    
    // 网络错误 - 切换到本地模式
    if (!error.response) {
      this.isOnline = false
      return Promise.reject({
        success: false,
        message: '网络连接失败，已切换到离线模式',
        error: 'NETWORK_ERROR',
        useLocal: true
      })
    }
    
    const { status, data } = error.response
    
    // 统一错误处理
    let errorMessage = '请求失败'
    let errorCode = 'UNKNOWN_ERROR'
    
    switch (status) {
      case 401:
        // 优先使用后端返回的具体错误信息
        errorMessage = data?.message || data?.error?.message || '认证失败，请重新登录'
        errorCode = 'UNAUTHORIZED'
        // 只有在非登录错误时才清除认证数据
        if (!data?.message?.includes('邮箱') && !data?.message?.includes('密码')) {
          this.clearAuthData()
        }
        break
      case 403:
        errorMessage = data?.message || data?.error?.message || '权限不足'
        errorCode = 'FORBIDDEN'
        break
      case 404:
        errorMessage = data?.message || data?.error?.message || '请求的资源不存在'
        errorCode = 'NOT_FOUND'
        break
      case 500:
        errorMessage = data?.message || data?.error?.message || '服务器内部错误'
        errorCode = 'INTERNAL_ERROR'
        break
      default:
        errorMessage = data?.message || data?.error?.message || `请求失败 (${status})`
        errorCode = 'HTTP_ERROR'
    }
    
    return Promise.reject({
      success: false,
      message: errorMessage,
      error: errorCode,
      status,
      details: data?.details || null,
    })
  }

  /**
   * 清除认证数据
   */
  clearAuthData() {
    localStorage.removeItem('auth-tokens')
    localStorage.removeItem('auth-user')
    sessionStorage.removeItem('auth-tokens')
    sessionStorage.removeItem('auth-user')
  }

  /**
   * 获取服务端点URL
   */
  getServiceUrl(endpoint) {
    // 根据端点路径确定使用哪个微服务
    if (endpoint.includes('/auth/') || endpoint.includes('/invite/')) {
      return 'http://localhost:3002'
    } else if (endpoint.includes('/admin/')) {
      return 'http://localhost:3006'
    } else if (endpoint.includes('/user')) {
      return 'http://localhost:3001'
    } else if (endpoint.includes('/novel') || endpoint.includes('/chapter') || endpoint.includes('/memor')) {
      return 'http://localhost:3003'
    } else if (endpoint.includes('/ai/')) {
      return 'http://localhost:3004'
    } else if (endpoint.includes('/payment') || endpoint.includes('/package') || endpoint.includes('/subscription')) {
      return 'http://localhost:3005'
    } else {
      return 'http://localhost:3000'
    }
  }

  /**
   * 设置运行模式
   */
  setMode(mode) {
    this.mode = mode
    localStorage.setItem('api-mode', mode)
  }

  /**
   * 获取运行模式
   */
  getMode() {
    return localStorage.getItem('api-mode') || this.mode
  }

  /**
   * 检查是否应该使用云端API
   */
  shouldUseCloud() {
    const mode = this.getMode()
    return mode === 'cloud' || (mode === 'hybrid' && this.isOnline)
  }

  /**
   * 通用请求方法 - 支持自动降级到本地存储
   */
  async request(endpointOrConfig, options = {}) {
    // 支持两种调用方式：
    // 1. request('/api/endpoint', { method: 'GET', data: {} })
    // 2. request({ endpoint: '/api/endpoint', method: 'GET', data: {} })
    let endpoint, method, data, params, fallbackLocal
    
    if (typeof endpointOrConfig === 'string') {
      // 第一种调用方式
      endpoint = endpointOrConfig
      const config = options
      method = config.method || 'GET'
      data = config.data || null
      params = config.params || null
      fallbackLocal = config.fallbackLocal !== false
    } else {
      // 第二种调用方式
      const config = endpointOrConfig
      endpoint = config.endpoint
      method = config.method || 'GET'
      data = config.data || null
      params = config.params || null
      fallbackLocal = config.fallbackLocal !== false
    }
    
    // 优先尝试云端API
    if (this.shouldUseCloud()) {
      try {
        // 获取正确的服务URL
        const serviceUrl = this.getServiceUrl(endpoint)
        const fullUrl = serviceUrl + endpoint
        
        const response = await axios({
          url: fullUrl,
          method,
          data,
          params,
          headers: {
            'Authorization': this.getAuthToken() ? `Bearer ${this.getAuthToken()}` : undefined,
            'Content-Type': 'application/json'
          }
        })
        
        // 处理响应数据
        const responseData = response.data
        
        // 成功响应，缓存到本地
        if (responseData.success && method === 'GET' && fallbackLocal) {
          localStorageManager.cacheApiResponse(endpoint, responseData.data)
        }
        
        return responseData
      } catch (error) {
        // 如果是网络错误且允许本地回退，尝试本地数据
        if (error.useLocal && fallbackLocal) {
          const localData = localStorageManager.getCachedResponse(endpoint)
          if (localData) {
            return {
              success: true,
              data: localData,
              message: '从本地缓存加载数据',
              isLocal: true
            }
          }
        }
        throw error
      }
    }
    
    // 本地模式或云端不可用时，使用本地数据
    if (fallbackLocal) {
      return this.handleLocalRequest(endpoint, method, data)
    }
    
    throw new Error('云端服务不可用，且不支持本地模式')
  }

  /**
   * 处理本地请求
   */
  async handleLocalRequest(endpoint, method, data) {
    try {
      // 根据endpoint和method路由到相应的本地处理函数
      const result = await localStorageManager.handleRequest(endpoint, method, data)
      
      return {
        success: true,
        data: result,
        message: '使用本地数据',
        isLocal: true
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || '本地操作失败',
        error: 'LOCAL_ERROR'
      }
    }
  }

  /**
   * 同步本地数据到云端
   */
  async syncLocalData() {
    if (!this.shouldUseCloud()) return
    
    try {
      const pendingSync = localStorageManager.getPendingSync()
      
      for (const item of pendingSync) {
        try {
          await this.api({
            url: item.endpoint,
            method: item.method,
            data: item.data,
          })
          
          // 同步成功，移除待同步项
          localStorageManager.removePendingSync(item.id)
        } catch (error) {
          console.error('同步失败:', item, error)
        }
      }
      
      ElMessage.success('数据同步完成')
    } catch (error) {
      console.error('数据同步失败:', error)
    }
  }

  // ===== 认证相关API =====
  
  async login(credentials) {
    return await this.request('/api/v1/auth/login', {
      method: 'POST',
      data: credentials,
      fallbackLocal: false // 登录必须使用云端
    })
  }

  async register(userData) {
    return await this.request('/api/v1/auth/register', {
      method: 'POST',
      data: userData,
      fallbackLocal: false // 注册必须使用云端
    })
  }

  async getCurrentUser() {
    return await this.request('/api/v1/auth/me', {
      method: 'GET',
      fallbackLocal: true
    })
  }

  async updateProfile(profileData) {
    return await this.request('/api/v1/auth/profile', {
      method: 'PATCH',
      data: profileData,
      fallbackLocal: true
    })
  }

  async changePassword(passwordData) {
    return await this.request('/api/v1/auth/change-password', {
      method: 'PATCH',
      data: passwordData,
      fallbackLocal: false // 密码修改必须使用云端
    })
  }

  // ===== 小说管理API =====
  
  async getNovels(params = {}) {
    const query = new URLSearchParams(params).toString()
    const endpoint = `/api/v1/novels${query ? '?' + query : ''}`
    return await this.request(endpoint, {
      method: 'GET',
      fallbackLocal: true
    })
  }

  async getNovel(novelId) {
    return await this.request(`/api/v1/novels/${novelId}`, {
      method: 'GET',
      fallbackLocal: true
    })
  }

  async createNovel(novelData) {
    return await this.request('/api/v1/novels', {
      method: 'POST',
      data: novelData,
      fallbackLocal: true
    })
  }

  async updateNovel(novelId, updateData) {
    return await this.request(`/api/v1/novels/${novelId}`, {
      method: 'PATCH',
      data: updateData,
      fallbackLocal: true
    })
  }

  async deleteNovel(novelId) {
    return await this.request(`/api/v1/novels/${novelId}`, {
      method: 'DELETE',
      fallbackLocal: true
    })
  }

  // ===== 章节管理API =====
  
  async getChapters(novelId) {
    return await this.request(`/api/v1/novels/${novelId}/chapters`, {
      method: 'GET',
      fallbackLocal: true
    })
  }

  async getChapter(chapterId) {
    return await this.request(`/api/v1/chapters/${chapterId}`, {
      method: 'GET',
      fallbackLocal: true
    })
  }

  async createChapter(novelId, chapterData) {
    return await this.request(`/api/v1/novels/${novelId}/chapters`, {
      method: 'POST',
      data: chapterData,
      fallbackLocal: true
    })
  }

  async updateChapter(chapterId, updateData) {
    return await this.request(`/api/v1/chapters/${chapterId}`, {
      method: 'PATCH',
      data: updateData,
      fallbackLocal: true
    })
  }

  async deleteChapter(chapterId) {
    return await this.request(`/api/v1/chapters/${chapterId}`, {
      method: 'DELETE',
      fallbackLocal: true
    })
  }

  // ===== 记忆系统API =====
  
  async getMemories(novelId, params = {}) {
    const query = new URLSearchParams(params).toString()
    const endpoint = `/api/v1/novels/${novelId}/memories${query ? '?' + query : ''}`
    return await this.request(endpoint, {
      method: 'GET',
      fallbackLocal: true
    })
  }

  async createMemory(novelId, memoryData) {
    return await this.request(`/api/v1/novels/${novelId}/memories`, {
      method: 'POST',
      data: memoryData,
      fallbackLocal: true
    })
  }

  async updateMemory(memoryId, updateData) {
    return await this.request(`/api/v1/memories/${memoryId}`, {
      method: 'PATCH',
      data: updateData,
      fallbackLocal: true
    })
  }

  async deleteMemory(memoryId) {
    return await this.request(`/api/v1/memories/${memoryId}`, {
      method: 'DELETE',
      fallbackLocal: true
    })
  }

  // ===== 数据迁移API =====
  
  async exportData() {
    return await this.request('/api/v1/export', {
      method: 'GET',
      fallbackLocal: true
    })
  }

  async importData(importData) {
    return await this.request('/api/v1/import', {
      method: 'POST',
      data: importData,
      fallbackLocal: true
    })
  }

  // ===== 工具方法 =====
  
  /**
   * 检查云端连接状态
   */
  async checkCloudConnection() {
    try {
      const response = await this.api.get('/api/v1/health')
      return response.success
    } catch (error) {
      return false
    }
  }

  /**
   * 获取API统计信息
   */
  getApiStats() {
    return {
      mode: this.getMode(),
      isOnline: this.isOnline,
      baseURL: this.baseURL,
      pendingSyncCount: localStorageManager.getPendingSync().length
    }
  }
}

// 创建单例实例
const apiManager = new ApiManager()

export default apiManager
