/**
 * 统一AI调用服务
 * 自动选择合适的AI配置并调用
 */

import { aiConfigService } from './aiConfigService'
import apiManager from './apiManager'
import apiService from './api.js'

class UnifiedAIService {
  constructor() {
    // 添加缓存以避免重复调用
    this.statusCache = null
    this.statusCacheTime = 0
    this.CACHE_DURATION = 30000 // 30秒缓存
    
    // 添加请求防抖
    this.pendingRequests = new Map() // 存储进行中的请求
    this.requestCount = 0 // 请求计数器，用于调试
  }
  
  /**
   * 调用AI聊天
   * @param {Array} messages - 消息数组 [{role: 'user', content: '...'}]
   * @param {Object} options - 调用选项
   * @param {string} options.configId - 指定配置ID (可选)
   * @param {boolean} options.stream - 是否流式输出 (可选)
   * @param {Object} options.parameters - 自定义参数 (可选)
   * @returns {Promise<{content: string, model: string, provider: string, tokensUsed: number}>}
   */
  async chat(messages, options = {}) {
    // 请求计数器递增
    this.requestCount++
    const requestId = this.requestCount
    
    // 防止同时发起过多请求
    if (this.requestCount > 50) {
      console.error('❌ [UnifiedAI] 检测到异常请求循环，请求数:', this.requestCount)
      this.requestCount = 0 // 重置计数器
      throw new Error('检测到异常请求循环，已终止')
    }
    
    try {
      // 将消息数组转换为单个提示词（简化处理）
      const prompt = messages.map(m => m.content).join('\n')
      
      // 生成请求标识
      const requestKey = `chat_${prompt.substring(0, 100)}`
      
      // 检查是否有相同的请求正在进行
      if (this.pendingRequests.has(requestKey)) {
        console.warn('⚠️ [UnifiedAI] 检测到重复请求，等待现有请求完成...')
        return await this.pendingRequests.get(requestKey)
      }
      
      console.log(`🌐 [UnifiedAI #${requestId}] 开始AI请求`)
      console.log(`📤 [UnifiedAI #${requestId}] 提示词长度:`, prompt.length)
      console.log(`⚙️ [UnifiedAI #${requestId}] 参数:`, options.parameters)
      
      // 创建请求Promise
      const requestPromise = (async () => {
        try {
          // 获取默认AI配置
          const config = await aiConfigService.getDefaultConfig()
          
          if (!config) {
            throw new Error('未找到默认AI配置，请前往设置页面配置 AI 模型')
          }
          
          console.log(`🔧 [UnifiedAI #${requestId}] 使用配置:`, config.name || config.provider)
          
          // 调用后端的通用AI对话接口（后端会使用用户配置的deepseek）
          const AI_SERVICE_URL = 'http://localhost:3004'
          const token = localStorage.getItem('auth-tokens') || sessionStorage.getItem('auth-tokens')
          const tokens = token ? JSON.parse(token) : {}
          
          const response = await fetch(`${AI_SERVICE_URL}/assistant/general`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${tokens.accessToken || ''}`
            },
            body: JSON.stringify({
              message: prompt,
              aiConfigId: `${config.userId ? 'user' : 'system'}:${config.id}`,
              parameters: {
                temperature: options.parameters?.temperature || 0.7,
                maxTokens: options.parameters?.maxTokens || 4000
              }
            })
          })
          
          if (!response.ok) {
            const errorText = await response.text()
            console.error(`❌ [UnifiedAI #${requestId}] 后端错误:`, errorText)
            let errorMessage = errorText
            try {
              const errorJson = JSON.parse(errorText)
              errorMessage = errorJson.message || errorJson.error?.message || errorText
            } catch (e) {}
            throw new Error(errorMessage)
          }
          
          const result = await response.json()
          console.log(`📦 [UnifiedAI #${requestId}] 后端响应:`, result)
          
          // 提取内容
          const content = result?.data?.content || result?.content || ''
          
          console.log(`✅ [UnifiedAI #${requestId}] AI响应成功，内容长度:`, content.length)
          
          // 返回统一格式
          return {
            content: content,
            model: result?.data?.model || result?.model || config.model || 'unified',
            provider: result?.data?.provider || result?.provider || config.provider || 'UNIFIED',
            tokensUsed: result?.data?.tokensUsed || result?.tokensUsed || 0
          }
        } finally {
          // 请求完成后从pending列表中移除
          this.pendingRequests.delete(requestKey)
        }
      })()
      
      // 将请求加入pending列表
      this.pendingRequests.set(requestKey, requestPromise)
      
      return await requestPromise
    } catch (error) {
      console.error(`❌ [UnifiedAI #${requestId}] AI调用失败:`, error)
      throw error
    }
  }

  /**
   * 流式调用AI聊天
   * @param {Array} messages - 消息数组
   * @param {Function} onChunk - 接收每个数据块的回调函数 (chunk, fullContent)
   * @param {Object} options - 调用选项
   * @returns {Promise<string>} 返回完整内容
   */
  async chatStream(messages, onChunk, options = {}) {
    const requestId = ++this.requestCount
    
    try {
      const prompt = messages.map(m => m.content).join('\n')
      
      console.log(`🌊 [UnifiedAI #${requestId}] 开始流式AI请求`)
      console.log(`📤 [UnifiedAI #${requestId}] 提示词长度:`, prompt.length)
      
      // 获取配置
      const config = await aiConfigService.getDefaultConfig()
      
      if (!config) {
        throw new Error('未找到默认AI配置')
      }
      
      console.log(`🔧 [UnifiedAI #${requestId}] 使用配置:`, config.name)
      
      // 调用后端的真正流式接口
      const AI_SERVICE_URL = 'http://localhost:3004'
      const token = localStorage.getItem('auth-tokens') || sessionStorage.getItem('auth-tokens')
      const tokens = token ? JSON.parse(token) : {}
      
      const response = await fetch(`${AI_SERVICE_URL}/assistant/general/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.accessToken || ''}`
        },
        body: JSON.stringify({
          message: prompt,
          aiConfigId: `${config.userId ? 'user' : 'system'}:${config.id}`,
          parameters: {
            temperature: options.parameters?.temperature || 0.7,
            maxTokens: options.parameters?.maxTokens || 4000
          }
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`后端调用失败 (${response.status}): ${errorText}`)
      }
      
      console.log(`📦 [UnifiedAI #${requestId}] 开始接收流式响应...`)
      
      // 真正的流式处理：逐块接收
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''
      
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const text = decoder.decode(value, { stream: true })
          fullContent += text
          
          // 立即调用回调，实时推送
          if (onChunk && text) {
            onChunk(text, fullContent)
          }
        }
      } finally {
        reader.releaseLock()
      }
      
      console.log(`✅ [UnifiedAI #${requestId}] 流式接收完成，总长度:`, fullContent.length)
      
      return fullContent
    } catch (error) {
      console.error(`❌ [UnifiedAI #${requestId}] 流式AI调用失败:`, error)
      throw error
    }
  }

  /**
   * 文本补全（用于写作续写等场景）
   * @param {string} prompt - 提示文本
   * @param {Object} options - 调用选项
   * @returns {Promise<string>}
   */
  async complete(prompt, options = {}) {
    const messages = [
      { role: 'user', content: prompt }
    ]

    const result = await this.chat(messages, options)
    return result.content
  }

  /**
   * 获取AI配置
   * @private
   * @param {string} configId - 配置ID (可选)
   * @returns {Promise<Object|null>}
   */
  async getConfig(configId) {
    if (configId) {
      // 使用指定配置
      return await aiConfigService.getConfigById(configId)
    } else {
      // 使用默认配置
      return await aiConfigService.getDefaultConfig()
    }
  }

  /**
   * 格式化配置ID
   * @private
   * @param {Object} config - 配置对象
   * @returns {string}
   */
  formatConfigId(config) {
    // 判断是系统配置还是用户配置
    if (config.userId) {
      return `user:${config.id}`
    } else {
      return `system:${config.id}`
    }
  }

  /**
   * 预设场景调用 - 大纲生成
   * @param {string} idea - 创意描述
   * @param {Object} options - 选项
   * @returns {Promise<string>}
   */
  async generateOutline(idea, options = {}) {
    const prompt = `作为一个专业的小说策划师，请根据以下创意生成详细的小说大纲：

创意描述：${idea}

请生成包含以下内容的大纲：
1. 故事背景和世界观
2. 主要人物关系
3. 核心冲突
4. 情节发展路线
5. 高潮和结局设想

要求：逻辑清晰、情节紧凑、人物立体。`

    return await this.complete(prompt, {
      ...options,
      parameters: {
        temperature: 0.8,
        maxTokens: 2000,
        ...options.parameters
      }
    })
  }

  /**
   * 预设场景调用 - 角色生成
   * @param {Object} character - 角色基本信息
   * @param {Object} options - 选项
   * @returns {Promise<string>}
   */
  async generateCharacter(character, options = {}) {
    const { name, type, background } = character
    const prompt = `作为一个专业的角色设计师，请详细设计以下小说角色：

角色名称：${name}
角色类型：${type}
背景信息：${background || '待设计'}

请生成包含以下内容的角色档案：
1. 外貌特征
2. 性格特点
3. 成长经历
4. 核心动机
5. 能力特长
6. 弱点缺陷
7. 人际关系

要求：人物立体、个性鲜明、有成长空间。`

    return await this.complete(prompt, {
      ...options,
      parameters: {
        temperature: 0.8,
        maxTokens: 1500,
        ...options.parameters
      }
    })
  }

  /**
   * 预设场景调用 - 内容续写
   * @param {string} context - 上文内容
   * @param {Object} options - 选项
   * @returns {Promise<string>}
   */
  async continueWriting(context, options = {}) {
    const prompt = `请续写以下内容，保持风格一致，情节自然流畅：

${context}

续写内容：`

    return await this.complete(prompt, {
      ...options,
      parameters: {
        temperature: 0.7,
        maxTokens: 1000,
        ...options.parameters
      }
    })
  }

  /**
   * 预设场景调用 - 内容润色
   * @param {string} content - 原始内容
   * @param {Object} options - 选项
   * @returns {Promise<string>}
   */
  async polishContent(content, options = {}) {
    const prompt = `请对以下内容进行润色，使其更加生动、优美、流畅：

原文：
${content}

润色后的内容：`

    return await this.complete(prompt, {
      ...options,
      parameters: {
        temperature: 0.6,
        maxTokens: Math.min(content.length * 2, 2000),
        ...options.parameters
      }
    })
  }

  /**
   * 预设场景调用 - 情节扩写
   * @param {string} brief - 简要情节
   * @param {Object} options - 选项
   * @returns {Promise<string>}
   */
  async expandPlot(brief, options = {}) {
    const prompt = `请将以下简要情节扩写成详细的场景描写：

简要情节：${brief}

要求：
1. 添加具体的场景描写
2. 丰富人物动作和对话
3. 增加细节和情感
4. 保持情节连贯

详细内容：`

    return await this.complete(prompt, {
      ...options,
      parameters: {
        temperature: 0.75,
        maxTokens: 1500,
        ...options.parameters
      }
    })
  }

  /**
   * 预设场景调用 - 标题生成
   * @param {string} content - 内容摘要
   * @param {number} count - 生成数量
   * @param {Object} options - 选项
   * @returns {Promise<Array<string>>}
   */
  async generateTitles(content, count = 5, options = {}) {
    const prompt = `请根据以下内容，生成${count}个吸引人的标题：

内容摘要：${content}

要求：标题简洁有力、引人入胜、符合内容主题。
每行一个标题，格式如：1. 标题内容

标题列表：`

    const result = await this.complete(prompt, {
      ...options,
      parameters: {
        temperature: 0.9,
        maxTokens: 500,
        ...options.parameters
      }
    })

    // 解析标题列表
    return result
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(title => title.length > 0)
      .slice(0, count)
  }

  /**
   * 预设场景调用 - 情节建议
   * @param {string} situation - 当前情节
   * @param {Object} options - 选项
   * @returns {Promise<Array<string>>}
   */
  async suggestPlots(situation, options = {}) {
    const prompt = `基于以下情节发展，提供3-5个可能的后续发展方向：

当前情节：${situation}

要求：
1. 提供多样化的发展方向
2. 考虑冲突升级和人物成长
3. 保持逻辑合理性

发展建议：`

    const result = await this.complete(prompt, {
      ...options,
      parameters: {
        temperature: 0.85,
        maxTokens: 1000,
        ...options.parameters
      }
    })

    // 解析建议列表
    return result
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(suggestion => suggestion.length > 0)
  }

  /**
   * 检查AI服务状态（带缓存）
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   * @returns {Promise<{available: boolean, configCount: number, defaultConfig: Object|null}>}
   */
  async checkStatus(forceRefresh = false) {
    try {
      // 检查缓存是否有效
      const now = Date.now()
      if (!forceRefresh && this.statusCache && (now - this.statusCacheTime) < this.CACHE_DURATION) {
        // 移除console.log避免无限循环
        // console.log('使用缓存的AI状态')
        return this.statusCache
      }
      
      // 调用API获取最新状态
      const available = await aiConfigService.getAvailableConfigs()
      const defaultConfig = await aiConfigService.getDefaultConfig()

      const status = {
        available: (available.system.length + available.user.length) > 0,
        configCount: available.system.length + available.user.length,
        defaultConfig
      }
      
      // 更新缓存
      this.statusCache = status
      this.statusCacheTime = now
      
      return status
    } catch (error) {
      // console.error('检查AI状态失败:', error)
      
      // 如果有缓存，即使过期也返回缓存
      if (this.statusCache) {
        // console.log('API调用失败，使用缓存的AI状态')
        return this.statusCache
      }
      
      // 否则返回默认值
      return {
        available: false,
        configCount: 0,
        defaultConfig: null
      }
    }
  }
  
  /**
   * 清除状态缓存
   */
  clearStatusCache() {
    this.statusCache = null
    this.statusCacheTime = 0
  }
}

export const unifiedAIService = new UnifiedAIService()
export default unifiedAIService

