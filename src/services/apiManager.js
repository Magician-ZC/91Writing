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
    
    // 🔧 所有请求统一通过API Gateway (baseURL)
    // API Gateway会负责路由到正确的微服务
    // 这样可以统一处理：认证、限流、日志、CORS等
    
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
   * 🔧 已废弃：不再需要直接访问微服务
   * 所有请求都通过API Gateway统一路由
   * 
   * API Gateway会根据路径前缀自动转发到对应的微服务：
   * - /api/v1/auth/*     → auth-service (3002)
   * - /api/v1/admin/*    → admin-service (3006)
   * - /api/v1/user/*     → user-service (3001)
   * - /api/v1/novel/*    → novel-service (3003)
   * - /api/v1/ai/*       → ai-service (3004)
   * - /api/v1/payment/*  → payment-service (3005)
   */

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
        // 🔧 修复：所有请求都通过API Gateway (baseURL)，不再直接访问微服务
        // 这样可以统一路由、认证、限流等功能
        const fullUrl = this.baseURL + endpoint
        
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
      fallbackLocal: false
    })
  }

  async updateProfile(profileData) {
    return await this.request('/api/v1/auth/profile', {
      method: 'PATCH',
      data: profileData,
      fallbackLocal: false
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
      fallbackLocal: false
    })
  }

  async getNovel(novelId) {
    return await this.request(`/api/v1/novels/${novelId}`, {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async createNovel(novelData) {
    return await this.request('/api/v1/novels', {
      method: 'POST',
      data: novelData,
      fallbackLocal: false
    })
  }

  async updateNovel(novelId, updateData) {
    return await this.request(`/api/v1/novels/${novelId}`, {
      method: 'PATCH',
      data: updateData,
      fallbackLocal: false
    })
  }

  async deleteNovel(novelId) {
    return await this.request(`/api/v1/novels/${novelId}`, {
      method: 'DELETE',
      fallbackLocal: false
    })
  }

  async getNovelSettings(novelId) {
    return await this.request(`/api/v1/novels/${novelId}/settings`, {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async updateNovelSettings(novelId, settings) {
    return await this.request(`/api/v1/novels/${novelId}/settings`, {
      method: 'PATCH',
      data: settings,
      fallbackLocal: false
    })
  }

  // ===== 章节管理API =====
  
  async getChapters(novelId) {
    return await this.request(`/api/v1/novels/${novelId}/chapters`, {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async getChapter(chapterId) {
    return await this.request(`/api/v1/chapters/${chapterId}`, {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async createChapter(novelId, chapterData) {
    return await this.request(`/api/v1/novels/${novelId}/chapters`, {
      method: 'POST',
      data: chapterData,
      fallbackLocal: false
    })
  }

  async updateChapter(chapterId, updateData) {
    return await this.request(`/api/v1/chapters/${chapterId}`, {
      method: 'PATCH',
      data: updateData,
      fallbackLocal: false
    })
  }

  async deleteChapter(chapterId) {
    return await this.request(`/api/v1/chapters/${chapterId}`, {
      method: 'DELETE',
      fallbackLocal: false
    })
  }

  // ===== 记忆系统API =====
  
  async getMemories(novelId, params = {}) {
    const query = new URLSearchParams(params).toString()
    const endpoint = `/api/v1/novels/${novelId}/memories${query ? '?' + query : ''}`
    return await this.request(endpoint, {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async createMemory(novelId, memoryData) {
    return await this.request(`/api/v1/novels/${novelId}/memories`, {
      method: 'POST',
      data: memoryData,
      fallbackLocal: false
    })
  }

  async updateMemory(memoryId, updateData) {
    return await this.request(`/api/v1/memories/${memoryId}`, {
      method: 'PATCH',
      data: updateData,
      fallbackLocal: false
    })
  }

  async deleteMemory(memoryId) {
    return await this.request(`/api/v1/memories/${memoryId}`, {
      method: 'DELETE',
      fallbackLocal: false
    })
  }

  // ===== 数据迁移API =====
  
  async exportData() {
    return await this.request('/api/v1/export', {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async importData(importData) {
    return await this.request('/api/v1/import', {
      method: 'POST',
      data: importData,
      fallbackLocal: false
    })
  }

  // ===== 素材管理API =====
  
  async getMaterials(params = {}) {
    const query = new URLSearchParams(params).toString()
    const endpoint = `/api/v1/materials${query ? '?' + query : ''}`
    return await this.request(endpoint, {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async getMaterial(materialId) {
    return await this.request(`/api/v1/materials/${materialId}`, {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async createMaterial(materialData) {
    return await this.request('/api/v1/materials', {
      method: 'POST',
      data: materialData,
      fallbackLocal: false
    })
  }

  async updateMaterial(materialId, updateData) {
    return await this.request(`/api/v1/materials/${materialId}`, {
      method: 'PUT',
      data: updateData,
      fallbackLocal: false
    })
  }

  async deleteMaterial(materialId) {
    return await this.request(`/api/v1/materials/${materialId}`, {
      method: 'DELETE',
      fallbackLocal: false
    })
  }

  async getMaterialCategories() {
    return await this.request('/api/v1/materials/categories', {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async getMaterialTags() {
    return await this.request('/api/v1/materials/tags', {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async getMaterialStats() {
    return await this.request('/api/v1/materials/stats', {
      method: 'GET',
      fallbackLocal: false
    })
  }

  // ===== 提示词管理API =====
  
  async getPrompts(params = {}) {
    const query = new URLSearchParams(params).toString()
    const endpoint = `/api/v1/prompts${query ? '?' + query : ''}`
    return await this.request(endpoint, {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async getPrompt(promptId) {
    return await this.request(`/api/v1/prompts/${promptId}`, {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async createPrompt(promptData) {
    return await this.request('/api/v1/prompts', {
      method: 'POST',
      data: promptData,
      fallbackLocal: false
    })
  }

  async updatePrompt(promptId, updateData) {
    return await this.request(`/api/v1/prompts/${promptId}`, {
      method: 'PUT',
      data: updateData,
      fallbackLocal: false
    })
  }

  async deletePrompt(promptId) {
    return await this.request(`/api/v1/prompts/${promptId}`, {
      method: 'DELETE',
      fallbackLocal: false
    })
  }

  async ratePrompt(promptId, rating) {
    return await this.request(`/api/v1/prompts/${promptId}/rate`, {
      method: 'POST',
      data: { rating },
      fallbackLocal: false
    })
  }

  async getPromptCategories() {
    return await this.request('/api/v1/prompts/categories', {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async getPromptTags() {
    return await this.request('/api/v1/prompts/tags', {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async getPopularPrompts(limit = 10) {
    return await this.request(`/api/v1/prompts/popular?limit=${limit}`, {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async getRecommendedPrompts(limit = 10) {
    return await this.request(`/api/v1/prompts/recommended?limit=${limit}`, {
      method: 'GET',
      fallbackLocal: false
    })
  }

  // ===== 数据分析API =====
  
  async batchTrackActivities(events) {
    return await this.request('/api/v1/admin/analytics/batch', {
      method: 'POST',
      data: { events },
      fallbackLocal: false // 埋点数据必须发送到云端
    })
  }

  async getAnalyticsOverview(params = {}) {
    const query = new URLSearchParams(params).toString()
    const endpoint = `/api/v1/admin/analytics/overview${query ? '?' + query : ''}`
    return await this.request(endpoint, {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async getUserGrowthTrend(days = 30) {
    return await this.request(`/api/v1/admin/analytics/user-growth?days=${days}`, {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async getFeatureUsageStats(limit = 10) {
    return await this.request(`/api/v1/admin/analytics/feature-usage?limit=${limit}`, {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async getAIUsageStats(params = {}) {
    const query = new URLSearchParams(params).toString()
    const endpoint = `/api/v1/admin/analytics/ai-usage${query ? '?' + query : ''}`
    return await this.request(endpoint, {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async getRevenueStats(params = {}) {
    const query = new URLSearchParams(params).toString()
    const endpoint = `/api/v1/admin/analytics/revenue${query ? '?' + query : ''}`
    return await this.request(endpoint, {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async getUserRetentionData(cohortDate, days = 30) {
    return await this.request(`/api/v1/admin/analytics/retention?cohortDate=${cohortDate}&days=${days}`, {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async exportAnalyticsReport(params = {}) {
    const query = new URLSearchParams(params).toString()
    const endpoint = `/api/v1/admin/analytics/export${query ? '?' + query : ''}`
    return await this.request(endpoint, {
      method: 'GET',
      fallbackLocal: false
    })
  }

  // ===== 管理后台API =====
  
  // ----- 仪表盘统计 -----
  async getDashboardStats(params = {}) {
    const query = new URLSearchParams(params).toString()
    const endpoint = `/api/v1/admin/dashboard/stats${query ? '?' + query : ''}`
    return await this.request(endpoint, {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async getChartData(params = {}) {
    const query = new URLSearchParams(params).toString()
    const endpoint = `/api/v1/admin/dashboard/charts${query ? '?' + query : ''}`
    return await this.request(endpoint, {
      method: 'GET',
      fallbackLocal: false
    })
  }

  // ----- 用户管理 -----
  async getAdminUsers(params = {}) {
    const query = new URLSearchParams(params).toString()
    const endpoint = `/api/v1/admin/users${query ? '?' + query : ''}`
    return await this.request(endpoint, {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async getAdminUserDetail(userId) {
    return await this.request(`/api/v1/admin/users/${userId}`, {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async updateAdminUser(userId, userData) {
    return await this.request(`/api/v1/admin/users/${userId}`, {
      method: 'PUT',
      data: userData,
      fallbackLocal: false
    })
  }

  async banAdminUser(userId, banData) {
    return await this.request(`/api/v1/admin/users/${userId}/ban`, {
      method: 'POST',
      data: banData,
      fallbackLocal: false
    })
  }

  async unbanAdminUser(userId) {
    return await this.request(`/api/v1/admin/users/${userId}/unban`, {
      method: 'POST',
      fallbackLocal: false
    })
  }

  // ----- 订阅管理 -----
  async getAdminSubscriptions(params = {}) {
    const query = new URLSearchParams(params).toString()
    const endpoint = `/api/v1/admin/subscriptions${query ? '?' + query : ''}`
    return await this.request(endpoint, {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async getAdminSubscriptionStats(params = {}) {
    const query = new URLSearchParams(params).toString()
    const endpoint = `/api/v1/admin/subscriptions/stats${query ? '?' + query : ''}`
    return await this.request(endpoint, {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async updateAdminSubscription(subscriptionId, updateData) {
    return await this.request(`/api/v1/admin/subscriptions/${subscriptionId}`, {
      method: 'PUT',
      data: updateData,
      fallbackLocal: false
    })
  }

  async extendAdminSubscription(subscriptionId, extendData) {
    return await this.request(`/api/v1/admin/subscriptions/${subscriptionId}/extend`, {
      method: 'POST',
      data: extendData,
      fallbackLocal: false
    })
  }

  // ----- 支付订单管理 -----
  async getAdminOrders(params = {}) {
    const query = new URLSearchParams(params).toString()
    const endpoint = `/api/v1/admin/orders${query ? '?' + query : ''}`
    return await this.request(endpoint, {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async getAdminPaymentStats(params = {}) {
    const query = new URLSearchParams(params).toString()
    const endpoint = `/api/v1/admin/orders/stats${query ? '?' + query : ''}`
    return await this.request(endpoint, {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async processAdminRefund(orderNo, refundData) {
    return await this.request(`/api/v1/admin/orders/${orderNo}/refund`, {
      method: 'POST',
      data: refundData,
      fallbackLocal: false
    })
  }

  // ----- 套餐管理 -----
  async getAdminPackages() {
    return await this.request('/api/v1/admin/packages', {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async createAdminPackage(packageData) {
    return await this.request('/api/v1/admin/packages', {
      method: 'POST',
      data: packageData,
      fallbackLocal: false
    })
  }

  async updateAdminPackage(packageId, updateData) {
    return await this.request(`/api/v1/admin/packages/${packageId}`, {
      method: 'PUT',
      data: updateData,
      fallbackLocal: false
    })
  }

  async deleteAdminPackage(packageId) {
    return await this.request(`/api/v1/admin/packages/${packageId}`, {
      method: 'DELETE',
      fallbackLocal: false
    })
  }

  // ----- 系统配置 -----
  async getAdminSystemConfig() {
    return await this.request('/api/v1/admin/system/config', {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async updateAdminSystemConfig(configData) {
    return await this.request('/api/v1/admin/system/config', {
      method: 'PUT',
      data: configData,
      fallbackLocal: false
    })
  }

  async getAdminSystemLogs(params = {}) {
    const query = new URLSearchParams(params).toString()
    const endpoint = `/api/v1/admin/system/logs${query ? '?' + query : ''}`
    return await this.request(endpoint, {
      method: 'GET',
      fallbackLocal: false
    })
  }

  // ===== 普通用户API（支付、订阅、套餐）=====
  
  // ----- 支付订单 -----
  async createPaymentOrder(orderData) {
    return await this.request('/api/v1/payments/orders', {
      method: 'POST',
      data: orderData,
      fallbackLocal: false
    })
  }

  async getUserPaymentOrders(params = {}) {
    const query = new URLSearchParams(params).toString()
    const endpoint = `/api/v1/payments/orders${query ? '?' + query : ''}`
    return await this.request(endpoint, {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async getPaymentOrder(orderNo) {
    return await this.request(`/api/v1/payments/orders/${orderNo}`, {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async payOrder(orderNo) {
    return await this.request(`/api/v1/payments/orders/${orderNo}/pay`, {
      method: 'POST',
      fallbackLocal: false
    })
  }

  async cancelPaymentOrder(orderNo) {
    return await this.request(`/api/v1/payments/orders/${orderNo}/cancel`, {
      method: 'POST',
      fallbackLocal: false
    })
  }

  async queryOrderPaymentStatus(orderNo) {
    return await this.request(`/api/v1/payments/orders/${orderNo}/status`, {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async getPaymentStatistics(params = {}) {
    const query = new URLSearchParams(params).toString()
    const endpoint = `/api/v1/payments/statistics${query ? '?' + query : ''}`
    return await this.request(endpoint, {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async requestOrderRefund(orderNo, reason) {
    return await this.request(`/api/v1/payments/orders/${orderNo}/refund`, {
      method: 'POST',
      data: { reason },
      fallbackLocal: false
    })
  }

  async getOrderInvoice(orderNo) {
    return await this.request(`/api/v1/payments/orders/${orderNo}/invoice`, {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async createOrderInvoice(orderNo, invoiceData) {
    return await this.request(`/api/v1/payments/orders/${orderNo}/invoice`, {
      method: 'POST',
      data: invoiceData,
      fallbackLocal: false
    })
  }

  // ----- 订阅管理 -----
  async getCurrentSubscription() {
    return await this.request('/api/v1/subscriptions/current', {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async checkSubscriptionStatus() {
    return await this.request('/api/v1/subscriptions/status', {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async createSubscription(subscriptionData) {
    return await this.request('/api/v1/subscriptions', {
      method: 'POST',
      data: subscriptionData,
      fallbackLocal: false
    })
  }

  async getSubscription(subscriptionId) {
    return await this.request(`/api/v1/subscriptions/${subscriptionId}`, {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async updateSubscription(subscriptionId, updateData) {
    return await this.request(`/api/v1/subscriptions/${subscriptionId}`, {
      method: 'PATCH',
      data: updateData,
      fallbackLocal: false
    })
  }

  async cancelSubscription(subscriptionId, reason) {
    return await this.request(`/api/v1/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      data: { reason },
      fallbackLocal: false
    })
  }

  async renewSubscription(subscriptionId) {
    return await this.request(`/api/v1/subscriptions/${subscriptionId}/renew`, {
      method: 'POST',
      fallbackLocal: false
    })
  }

  async enableSubscriptionAutoRenew(subscriptionId) {
    return await this.request(`/api/v1/subscriptions/${subscriptionId}/auto-renew`, {
      method: 'POST',
      fallbackLocal: false
    })
  }

  async disableSubscriptionAutoRenew(subscriptionId) {
    return await this.request(`/api/v1/subscriptions/${subscriptionId}/auto-renew`, {
      method: 'DELETE',
      fallbackLocal: false
    })
  }

  async getSubscriptionHistory(params = {}) {
    const query = new URLSearchParams(params).toString()
    const endpoint = `/api/v1/subscriptions/history${query ? '?' + query : ''}`
    return await this.request(endpoint, {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async previewSubscriptionUpgrade(currentSubscriptionId, targetPackageId) {
    return await this.request(`/api/v1/subscriptions/${currentSubscriptionId}/preview-upgrade`, {
      method: 'POST',
      data: { targetPackageId },
      fallbackLocal: false
    })
  }

  async upgradeSubscription(currentSubscriptionId, targetPackageId) {
    return await this.request(`/api/v1/subscriptions/${currentSubscriptionId}/upgrade`, {
      method: 'POST',
      data: { targetPackageId },
      fallbackLocal: false
    })
  }

  // ----- AI配置管理 -----
  async getAvailableAIConfigs() {
    return await this.request('/api/v1/users/v1/ai-config/available', {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async getUserAIConfigs() {
    return await this.request('/api/v1/users/v1/ai-config/custom', {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async createAIConfig(config) {
    return await this.request('/api/v1/users/v1/ai-config/custom', {
      method: 'POST',
      data: config,
      fallbackLocal: false
    })
  }

  async updateAIConfig(configId, config) {
    return await this.request(`/api/v1/users/v1/ai-config/custom/${configId}`, {
      method: 'PUT',
      data: config,
      fallbackLocal: false
    })
  }

  async deleteAIConfig(configId) {
    return await this.request(`/api/v1/users/v1/ai-config/custom/${configId}`, {
      method: 'DELETE',
      fallbackLocal: false
    })
  }

  async setDefaultAIConfig(configId) {
    return await this.request(`/api/v1/users/v1/ai-config/custom/${configId}/set-default`, {
      method: 'POST',
      fallbackLocal: false
    })
  }

  async testAIConfig(config) {
    return await this.request('/api/v1/admin/ai-config/test', {
      method: 'POST',
      data: config,
      fallbackLocal: false
    })
  }

  // ----- 套餐管理 -----
  async getPackages(params = {}) {
    const query = new URLSearchParams(params).toString()
    const endpoint = `/api/v1/packages${query ? '?' + query : ''}`
    return await this.request(endpoint, {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async getActivePackages() {
    return await this.request('/api/v1/packages/active', {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async getPackage(packageId) {
    return await this.request(`/api/v1/packages/${packageId}`, {
      method: 'GET',
      fallbackLocal: false
    })
  }

  // ----- 邀请管理 -----
  async getMyInviteCode() {
    return await this.request('/api/v1/auth/invite/my-code', {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async getInviteStats() {
    return await this.request('/api/v1/auth/invite/stats', {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async getInviteRewards() {
    return await this.request('/api/v1/auth/invite/rewards', {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async getInvitees(params = {}) {
    const query = new URLSearchParams(params).toString()
    const endpoint = `/api/v1/auth/invite/invitees${query ? '?' + query : ''}`
    return await this.request(endpoint, {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async claimInviteReward(rewardId) {
    return await this.request('/api/v1/auth/invite/claim-reward', {
      method: 'POST',
      data: { rewardId },
      fallbackLocal: false
    })
  }

  async getInviteRewardConfig() {
    return await this.request('/api/v1/auth/invite/reward-config', {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async getExpectedInviteRewards() {
    return await this.request('/api/v1/auth/invite/expected-rewards', {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async getInviteShareMaterials() {
    return await this.request('/api/v1/auth/invite/share-materials', {
      method: 'GET',
      fallbackLocal: false
    })
  }

  async validateInviteCode(inviteCode) {
    return await this.request(`/api/v1/auth/validate-invite/${inviteCode}`, {
      method: 'GET',
      fallbackLocal: false
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
