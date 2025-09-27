/**
 * 后端API服务
 * 处理与91Writing后端服务的通信
 */

class BackendApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
    this.authToken = localStorage.getItem('auth-token')
  }

  /**
   * 设置认证令牌
   */
  setAuthToken(token) {
    this.authToken = token
    if (token) {
      localStorage.setItem('auth-token', token)
    } else {
      localStorage.removeItem('auth-token')
    }
  }

  /**
   * 获取认证令牌
   */
  getAuthToken() {
    return this.authToken || localStorage.getItem('auth-token')
  }

  /**
   * 构建请求头
   */
  buildHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    }
    
    if (includeAuth && this.getAuthToken()) {
      headers['Authorization'] = `Bearer ${this.getAuthToken()}`
    }
    
    return headers
  }

  /**
   * 通用API请求方法
   */
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const headers = this.buildHeaders(options.auth !== false)
    
    const requestOptions = {
      method: 'GET',
      headers,
      ...options,
      headers: { ...headers, ...options.headers }
    }

    try {
      const response = await fetch(url, requestOptions)
      
      // 如果是401错误，清除token并提示重新登录
      if (response.status === 401) {
        this.setAuthToken(null)
        throw new Error('认证失效，请重新登录')
      }
      
      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch {
          errorData = { message: `HTTP ${response.status}` }
        }
        throw new Error(errorData.message || `请求失败: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error(`API请求失败 [${endpoint}]:`, error)
      throw error
    }
  }

  // ===== 认证相关 =====

  /**
   * 用户登录
   */
  async login(credentials) {
    const response = await this.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      auth: false
    })
    
    if (response.success && response.data.token) {
      this.setAuthToken(response.data.token)
    }
    
    return response
  }

  /**
   * 用户注册
   */
  async register(userData) {
    return await this.makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      auth: false
    })
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser() {
    return await this.makeRequest('/api/auth/profile')
  }

  /**
   * 用户登出
   */
  async logout() {
    try {
      await this.makeRequest('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.warn('登出请求失败:', error)
    } finally {
      this.setAuthToken(null)
    }
  }

  // ===== 小说管理 =====

  /**
   * 获取用户的小说列表
   */
  async getNovels(options = {}) {
    const params = new URLSearchParams()
    if (options.status) params.append('status', options.status)
    if (options.genre) params.append('genre', options.genre)
    if (options.page) params.append('page', options.page.toString())
    if (options.limit) params.append('limit', options.limit.toString())
    
    const queryString = params.toString()
    const endpoint = `/api/novels${queryString ? '?' + queryString : ''}`
    
    return await this.makeRequest(endpoint)
  }

  /**
   * 获取单个小说详情
   */
  async getNovel(novelId) {
    return await this.makeRequest(`/api/novels/${novelId}`)
  }

  /**
   * 创建新小说
   */
  async createNovel(novelData) {
    return await this.makeRequest('/api/novels', {
      method: 'POST',
      body: JSON.stringify(novelData)
    })
  }

  /**
   * 更新小说信息
   */
  async updateNovel(novelId, updateData) {
    return await this.makeRequest(`/api/novels/${novelId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    })
  }

  /**
   * 删除小说
   */
  async deleteNovel(novelId) {
    return await this.makeRequest(`/api/novels/${novelId}`, {
      method: 'DELETE'
    })
  }

  /**
   * 获取小说设置
   */
  async getNovelSettings(novelId) {
    return await this.makeRequest(`/api/novels/${novelId}/settings`)
  }

  /**
   * 更新小说设置
   */
  async updateNovelSettings(novelId, settings) {
    return await this.makeRequest(`/api/novels/${novelId}/settings`, {
      method: 'PATCH',
      body: JSON.stringify(settings)
    })
  }

  // ===== 章节管理 =====

  /**
   * 获取小说的章节列表
   */
  async getChapters(novelId) {
    return await this.makeRequest(`/api/novels/${novelId}/chapters`)
  }

  /**
   * 获取单个章节详情
   */
  async getChapter(chapterId) {
    return await this.makeRequest(`/api/chapters/${chapterId}`)
  }

  /**
   * 获取章节内容
   */
  async getChapterContent(chapterId) {
    return await this.makeRequest(`/api/chapters/${chapterId}/content`)
  }

  /**
   * 创建新章节
   */
  async createChapter(novelId, chapterData) {
    return await this.makeRequest(`/api/novels/${novelId}/chapters`, {
      method: 'POST',
      body: JSON.stringify(chapterData)
    })
  }

  /**
   * 更新章节
   */
  async updateChapter(chapterId, updateData) {
    return await this.makeRequest(`/api/chapters/${chapterId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    })
  }

  /**
   * 更新章节内容
   */
  async updateChapterContent(chapterId, content) {
    return await this.makeRequest(`/api/chapters/${chapterId}/content`, {
      method: 'PATCH',
      body: JSON.stringify({ content })
    })
  }

  /**
   * 删除章节
   */
  async deleteChapter(chapterId) {
    return await this.makeRequest(`/api/chapters/${chapterId}`, {
      method: 'DELETE'
    })
  }

  // ===== 记忆系统 =====

  /**
   * 获取小说记忆列表
   */
  async getNovelMemories(novelId, options = {}) {
    const params = new URLSearchParams()
    if (options.type) params.append('type', options.type)
    if (options.limit) params.append('limit', options.limit.toString())
    if (options.orderBy) params.append('orderBy', options.orderBy)
    
    const queryString = params.toString()
    const endpoint = `/api/novels/${novelId}/memories${queryString ? '?' + queryString : ''}`
    
    return await this.makeRequest(endpoint)
  }

  /**
   * 创建记忆
   */
  async createMemory(novelId, memoryData) {
    return await this.makeRequest(`/api/novels/${novelId}/memories`, {
      method: 'POST',
      body: JSON.stringify(memoryData)
    })
  }

  /**
   * 更新记忆
   */
  async updateMemory(memoryId, updateData) {
    return await this.makeRequest(`/api/memories/${memoryId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    })
  }

  /**
   * 删除记忆
   */
  async deleteMemory(memoryId) {
    return await this.makeRequest(`/api/memories/${memoryId}`, {
      method: 'DELETE'
    })
  }

  /**
   * 初始化小说记忆系统
   */
  async initializeNovelMemory(novelId, basicInfo = {}) {
    return await this.makeRequest(`/api/novels/${novelId}/memories/initialize`, {
      method: 'POST',
      body: JSON.stringify(basicInfo)
    })
  }

  /**
   * 获取生成上下文
   */
  async getGenerationContext(novelId, options = {}) {
    const params = new URLSearchParams()
    if (options.maxTokens) params.append('maxTokens', options.maxTokens.toString())
    if (options.chapterContext) params.append('chapterContext', options.chapterContext)
    if (options.includeTypes) params.append('includeTypes', options.includeTypes.join(','))
    
    const queryString = params.toString()
    const endpoint = `/api/novels/${novelId}/memories/context/generation${queryString ? '?' + queryString : ''}`
    
    return await this.makeRequest(endpoint)
  }

  /**
   * 更新章节摘要
   */
  async updateChapterSummary(novelId, chapterNumber, summary, keyEvents = []) {
    return await this.makeRequest(`/api/novels/${novelId}/memories/chapters/${chapterNumber}/summary`, {
      method: 'POST',
      body: JSON.stringify({ summary, keyEvents })
    })
  }

  // ===== AI助手 =====

  /**
   * 初始化AI助手会话
   */
  async initializeAssistantSession(sessionData) {
    return await this.makeRequest('/api/assistant/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData)
    })
  }

  /**
   * 与AI助手对话
   */
  async chatWithAssistant(conversationData) {
    return await this.makeRequest('/api/assistant/chat', {
      method: 'POST',
      body: JSON.stringify(conversationData)
    })
  }

  /**
   * 获取对话历史
   */
  async getConversationHistory(sessionId) {
    return await this.makeRequest(`/api/assistant/sessions/${sessionId}/history`)
  }

  // ===== 写作建议 =====

  /**
   * 生成写作建议
   */
  async generateSuggestions(requestData) {
    return await this.makeRequest('/api/suggestions/generate', {
      method: 'POST',
      body: JSON.stringify(requestData)
    })
  }

  /**
   * 分析文本质量
   */
  async analyzeText(analysisData) {
    return await this.makeRequest('/api/suggestions/analyze', {
      method: 'POST',
      body: JSON.stringify(analysisData)
    })
  }

  /**
   * 应用写作建议
   */
  async applySuggestion(suggestionData) {
    return await this.makeRequest('/api/suggestions/apply', {
      method: 'POST',
      body: JSON.stringify(suggestionData)
    })
  }

  /**
   * 获取建议统计
   */
  async getSuggestionStats() {
    return await this.makeRequest('/api/suggestions/stats')
  }

  // ===== 内容生成 =====

  /**
   * 生成内容
   */
  async generateContent(contentData) {
    return await this.makeRequest('/api/generation/content', {
      method: 'POST',
      body: JSON.stringify(contentData)
    })
  }

  // ===== 工具方法 =====

  /**
   * 检查认证状态
   */
  isAuthenticated() {
    return !!this.getAuthToken()
  }

  /**
   * 清除认证信息
   */
  clearAuth() {
    this.setAuthToken(null)
  }
}

export default new BackendApiService()
