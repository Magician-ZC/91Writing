import apiConfig from '../config/api.json'
import billingService from './billing.js'

class APIService {
  constructor() {
    this.config = { ...apiConfig.openai }
    this.proxyConfig = apiConfig.proxy
    // 尝试从localStorage加载用户配置
    this.loadUserConfig()
  }
  
  // 加载用户配置
  loadUserConfig() {
    try {
      const saved = localStorage.getItem('apiConfig')
      if (saved) {
        const userConfig = JSON.parse(saved)
        this.config = { ...this.config, ...userConfig }
      }
    } catch (error) {
      console.error('加载用户API配置失败:', error)
    }
  }

  // 获取API配置
  getConfig() {
    return this.config
  }

  // 更新API配置
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig }
    // 保存到localStorage
    try {
      localStorage.setItem('apiConfig', JSON.stringify(this.config))
    } catch (error) {
      console.error('保存API配置失败:', error)
    }
  }

  // 构建请求URL
  buildURL(endpoint) {
    return `${this.config.baseURL}${endpoint}`
  }

  // 构建请求头
  buildHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`
    }
  }

  // 通用API请求方法
  async makeRequest(endpoint, options = {}) {
    const url = this.buildURL(endpoint)
    const headers = this.buildHeaders()
    
    const requestOptions = {
      method: 'POST',
      headers,
      ...options
    }

    try {
      const response = await fetch(url, requestOptions)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`API请求失败: ${response.status} - ${errorData.error?.message || '未知错误'}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('API请求错误:', error)
      throw error
    }
  }

  // 生成文本内容
  async generateText(prompt, options = {}) {
    const model = options.model || this.config.selectedModel || this.config.defaultModel || 'gpt-3.5-turbo'
    
    if (!this.config.apiKey) {
      throw new Error('API密钥未配置，请前往设置页面配置您的API密钥')
    }
    
    // 估算输入token数量（用于记录，无需检查余额）
    const estimatedInputTokens = billingService.estimateTokens(prompt)

    const requestBody = {
      model: model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: options.maxTokens || this.config.maxTokens,
      temperature: options.temperature || this.config.temperature,
      stream: false
    }

    try {
      const response = await this.makeRequest('/chat/completions', {
        body: JSON.stringify(requestBody)
      })

      const content = response.choices[0]?.message?.content || ''
      const usage = response.usage
      
      // 记录实际的token使用情况
      if (usage) {
        billingService.recordAPICall({
          type: options.type || 'generation',
          model: model,
          content: prompt,
          response: content,
          inputTokens: usage.prompt_tokens || 0,
          outputTokens: usage.completion_tokens || 0,
          status: 'success'
        })
      } else {
        // 如果API没有返回usage信息，使用估算值
        const outputTokens = billingService.estimateTokens(content)
        billingService.recordAPICall({
          type: options.type || 'generation',
          model: model,
          content: prompt,
          response: content,
          inputTokens: estimatedInputTokens,
          outputTokens: outputTokens,
          status: 'success'
        })
      }

      return content
    } catch (error) {
      // 记录失败的API调用
      billingService.recordAPICall({
        type: options.type || 'generation',
        model: model,
        content: prompt,
        response: '',
        inputTokens: estimatedInputTokens,
        outputTokens: 0,
        status: 'failed'
      })
      
      // 提供更详细的错误信息
      let errorMessage = 'API调用失败'
      if (error.message.includes('Failed to fetch')) {
        errorMessage = `网络连接失败：无法连接到API服务器 (${this.config.baseURL})。请检查网络连接或API服务器状态。`
      } else if (error.message.includes('401')) {
        errorMessage = 'API密钥无效，请检查您的API密钥是否正确'
      } else if (error.message.includes('403')) {
        errorMessage = 'API访问被拒绝，请检查您的API密钥权限'
      } else if (error.message.includes('429')) {
        errorMessage = 'API调用频率超限，请稍后再试'
      } else if (error.message.includes('500')) {
        errorMessage = 'API服务器内部错误，请稍后再试'
      } else {
        errorMessage = `API调用失败：${error.message}`
      }
      
      throw new Error(errorMessage)
    }
  }

  // 流式生成文本内容
  async generateTextStream(prompt, options = {}, onChunk = null) {
    console.log('开始流式生成，prompt:', prompt.substring(0, 100) + '...') // 调试日志
    
    const model = options.model || this.config.selectedModel || this.config.defaultModel || 'gpt-3.5-turbo'
    
    if (!this.config.apiKey) {
      throw new Error('API密钥未配置，请前往设置页面配置您的API密钥')
    }
    
    // 估算输入token数量（用于记录，无需检查余额）
    const estimatedInputTokens = billingService.estimateTokens(prompt)
    
    const requestBody = {
      model: model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: options.maxTokens || this.config.maxTokens,
      temperature: options.temperature || this.config.temperature,
      stream: true
    }

    console.log('请求体:', requestBody) // 调试日志
    
    const url = this.buildURL('/chat/completions')
    const headers = this.buildHeaders()
    
    let fullContent = ''
    let hasError = false
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      })
      
      console.log('API响应状态:', response.status) // 调试日志

      if (!response.ok) {
        const errorData = await response.json()
        hasError = true
        throw new Error(`API请求失败: ${response.status} - ${errorData.error?.message || '未知错误'}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            const trimmedLine = line.trim()
            if (trimmedLine.startsWith('data: ')) {
              const data = trimmedLine.slice(6).trim()
              
              if (data === '[DONE]') {
                console.log('流式生成完成，总内容长度:', fullContent.length) // 调试日志
                break
              }
              
              // 跳过空数据
              if (!data || data === '') {
                continue
              }
              
              try {
                const parsed = JSON.parse(data)
                const content = parsed.choices?.[0]?.delta?.content || ''
                if (content) {
                  fullContent += content
                  console.log('接收到内容片段:', content) // 调试日志
                  if (onChunk) {
                    onChunk(content, fullContent)
                  }
                }
              } catch (e) {
                console.log('解析数据失败，原始数据:', JSON.stringify(data), '错误:', e.message) // 调试日志
                // 继续处理其他数据，不中断流式处理
              }
            }
          }
        }
      } catch (streamError) {
        console.error('流式读取错误:', streamError)
        hasError = true
        throw streamError
      } finally {
        reader.releaseLock()
      }

      // 流式生成成功，记录token使用
      const outputTokens = billingService.estimateTokens(fullContent)
      billingService.recordAPICall({
        type: options.type || 'generation',
        model: model,
        content: prompt,
        response: fullContent,
        inputTokens: estimatedInputTokens,
        outputTokens: outputTokens,
        status: 'success'
      })

      return fullContent
    } catch (error) {
      // 只有在发生错误时才记录失败调用
      if (hasError) {
        billingService.recordAPICall({
          type: options.type || 'generation',
          model: model,
          content: prompt,
          response: fullContent,
          inputTokens: estimatedInputTokens,
          outputTokens: billingService.estimateTokens(fullContent),
          status: 'failed'
        })
      }
      
      // 提供更详细的错误信息
      let errorMessage = 'API调用失败'
      if (error.message.includes('Failed to fetch')) {
        errorMessage = `网络连接失败：无法连接到API服务器 (${this.config.baseURL})。请检查网络连接或API服务器状态。`
      } else if (error.message.includes('401')) {
        errorMessage = 'API密钥无效，请检查您的API密钥是否正确'
      } else if (error.message.includes('403')) {
        errorMessage = 'API访问被拒绝，请检查您的API密钥权限'
      } else if (error.message.includes('429')) {
        errorMessage = 'API调用频率超限，请稍后再试'
      } else if (error.message.includes('500')) {
        errorMessage = 'API服务器内部错误，请稍后再试'
      } else {
        errorMessage = `流式API调用失败：${error.message}`
      }
      
      throw new Error(errorMessage)
    }
  }

  // 生成小说大纲
  async generateOutline(theme, keywords, template) {
    const templateInfo = template ? `\n参考模板：${template.name} - ${template.description}` : ''
    const keywordList = keywords ? `\n关键词：${keywords}` : ''
    
    const prompt = `请为以下主题生成一个详细的小说大纲：
主题：${theme}${templateInfo}${keywordList}

要求：
1. 生成5-8个章节
2. 每个章节用 ### 开头，后跟章节标题
3. 每个章节下面写2-3句话描述该章节的主要内容
4. 整体结构要完整，有开头、发展、高潮、结局
5. 符合所选模板的风格特点

请直接输出大纲内容：`

    return await this.generateText(prompt)
  }

  // 流式生成小说大纲
  async generateOutlineStream(theme, keywords, template, onChunk = null) {
    const templateInfo = template ? `\n参考模板：${template.name} - ${template.description}` : ''
    const keywordList = keywords ? `\n关键词：${keywords}` : ''
    
    const prompt = `请为以下主题生成一个详细的小说大纲：
主题：${theme}${templateInfo}${keywordList}

要求：
1. 生成5-8个章节
2. 每个章节用 ### 开头，后跟章节标题
3. 每个章节下面写2-3句话描述该章节的主要内容
4. 整体结构要完整，有开头、发展、高潮、结局
5. 符合所选模板的风格特点

请直接输出大纲内容：`

    return await this.generateTextStream(prompt, {}, onChunk)
  }

  // 验证API密钥
  async validateAPIKey() {
    try {
      const url = this.buildURL('/models')
      const headers = this.buildHeaders()
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      })
      
      return response.ok
    } catch (error) {
      console.error('API密钥验证失败:', error)
      return false
    }
  }
}

export default new APIService()
