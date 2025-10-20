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
    try {
      // 将消息数组转换为单个提示词（简化处理）
      const prompt = messages.map(m => m.content).join('\n')
      
      // 直接使用apiService（它已经支持统一配置）
      const content = await apiService.generateText(prompt, {
        maxTokens: options.parameters?.maxTokens,
        temperature: options.parameters?.temperature,
        type: 'chat'
      })
      
      // 返回统一格式
      return {
        content: content,
        model: 'unified',
        provider: 'UNIFIED',
        tokensUsed: 0
      }
    } catch (error) {
      console.error('AI调用失败:', error)
      throw error
    }
  }

  /**
   * 流式调用AI聊天
   * @param {Array} messages - 消息数组
   * @param {Function} onChunk - 接收每个数据块的回调函数
   * @param {Object} options - 调用选项
   * @returns {Promise<void>}
   */
  async chatStream(messages, onChunk, options = {}) {
    try {
      const prompt = messages.map(m => m.content).join('\n')
      
      // 使用apiService的流式方法
      const content = await apiService.generateTextStream(prompt, {
        maxTokens: options.parameters?.maxTokens,
        temperature: options.parameters?.temperature,
        type: 'chat'
      }, (chunk, fullContent) => {
        if (onChunk) {
          onChunk(chunk, fullContent)
        }
      })
      
      return content
    } catch (error) {
      console.error('流式AI调用失败:', error)
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

