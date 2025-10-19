import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiService from '../services/api.js'
import aiConfigService from '../services/aiConfigService.js'

export const useNovelStore = defineStore('novel', () => {
  // 状态
  const currentNovel = ref('')
  const generatedContent = ref('')
  const outline = ref('')
  const isGeneratingOutline = ref(false)
  const chapters = ref([])
  const selectedChapter = ref(null)
  const isGeneratingChapter = ref(false)
  const aiChatHistory = ref([])
  const currentChatInput = ref('')
  const isAiChatting = ref(false)
  const templates = ref([])
  const selectedTemplate = ref(null)
  const keywords = ref('')
  const isGenerating = ref(false)
  const corpus = ref([])
  

  
  // 写作工具数据
  const characters = ref([])
  const worldSettings = ref([])
  
  // API配置 - 分离官方和自定义配置
  const officialApiConfig = ref({
    apiKey: '',
    baseURL: 'https://ai.91hub.vip/v1',
    selectedModel: 'claude-4-sonnet',
    maxTokens: 2000000,
    unlimitedTokens: false,
    temperature: 0.7
  })
  
  const customApiConfig = ref({
    apiKey: '',
    baseURL: 'https://api.openai.com/v1',
    selectedModel: 'gpt-3.5-turbo',
    maxTokens: 2000000,
    unlimitedTokens: false,
    temperature: 0.7
  })
  
  const currentConfigType = ref('official') // 'official' 或 'custom'
  const isApiConfigured = ref(false)
  
  // 获取当前活动的API配置
  const getCurrentApiConfig = () => {
    return currentConfigType.value === 'official' ? officialApiConfig.value : customApiConfig.value
  }
  
  // 初始化时检查API配置
  const initializeApiConfig = () => {
    try {
      // 加载配置类型
      const savedType = localStorage.getItem('apiConfigType') || 'official'
      currentConfigType.value = savedType
      
      // 加载官方配置
      const savedOfficial = localStorage.getItem('officialApiConfig')
      if (savedOfficial) {
        const config = JSON.parse(savedOfficial)
        // 官方配置只允许覆盖API密钥等参数，baseURL始终保持固定
        officialApiConfig.value = {
          ...officialApiConfig.value,
          ...config,
          baseURL: 'https://ai.91hub.vip/v1' // 强制保持官方地址
        }
      }
      
      // 加载自定义配置
      const savedCustom = localStorage.getItem('customApiConfig')
      if (savedCustom) {
        const config = JSON.parse(savedCustom)
        customApiConfig.value = { ...customApiConfig.value, ...config }
      }
      
      // 使用当前配置类型的配置
      const currentConfig = getCurrentApiConfig()
      // 更严格的检查：apiKey 必须存在且不为空白字符串
      const hasValidKey = !!(currentConfig.apiKey && currentConfig.apiKey.trim())
      isApiConfigured.value = hasValidKey
      
      // 清理所有可能的旧配置键（如果配置无效）
      if (!hasValidKey) {
        console.log('检测到无效配置，开始清理...')
        
        // 清理当前配置类型的数据
        if (savedType === 'official' && savedOfficial) {
          const config = JSON.parse(savedOfficial)
          if (!config.apiKey || !config.apiKey.trim()) {
            localStorage.removeItem('officialApiConfig')
            console.log('✓ 已清除无效的官方配置')
          }
        }
        
        if (savedType === 'custom' && savedCustom) {
          const config = JSON.parse(savedCustom)
          if (!config.apiKey || !config.apiKey.trim()) {
            localStorage.removeItem('customApiConfig')
            console.log('✓ 已清除无效的自定义配置')
          }
        }
        
        // 清理其他可能的旧配置键
        const oldConfigKeys = ['apiConfig', 'api-config', 'aiApiConfigs']
        let cleaned = false
        oldConfigKeys.forEach(key => {
          if (localStorage.getItem(key)) {
            try {
              const oldConfig = JSON.parse(localStorage.getItem(key))
              // 检查是否是无效配置
              if (!oldConfig || (Array.isArray(oldConfig) && oldConfig.length === 0) || 
                  (!Array.isArray(oldConfig) && (!oldConfig.apiKey || !oldConfig.apiKey.trim()))) {
                localStorage.removeItem(key)
                console.log(`✓ 已清除旧配置键: ${key}`)
                cleaned = true
              }
            } catch (e) {
              // 如果解析失败，也清除
              localStorage.removeItem(key)
              console.log(`✓ 已清除无效配置键: ${key}`)
              cleaned = true
            }
          }
        })
        
        if (cleaned) {
          console.log('✓ 配置清理完成')
        }
      }
      
      apiService.updateConfig(currentConfig)
      
      // 如果旧配置无效，异步检查新的AI配置系统
      if (!hasValidKey) {
        checkNewAIConfigAsync()
      }
      
    } catch (error) {
      console.error('初始化API配置失败:', error)
    }
  }
  
  // 异步检查新的AI配置系统
  const checkNewAIConfigAsync = async () => {
    try {
      const configs = await aiConfigService.getAvailableConfigs()
      console.log('检查AI配置:', configs)
      
      // 检查用户是否有启用的自定义配置
      const hasUserConfig = configs?.user?.some(c => c.enabled) || false
      // 检查是否有默认配置（系统或用户）
      const hasDefault = !!configs?.default
      
      // 更新状态
      isApiConfigured.value = hasUserConfig || hasDefault
      
      if (isApiConfigured.value) {
        console.log('✓ 检测到新的AI配置系统中有可用配置')
      } else {
        console.log('✗ 未检测到可用的AI配置')
      }
    } catch (error) {
      console.error('检查新AI配置失败:', error)
      isApiConfigured.value = false
    }
  }
  
  // 重置API配置状态
  const resetApiConfigStatus = () => {
    isApiConfigured.value = false
    console.log('✓ 已重置API配置状态')
  }
  
  // 立即执行初始化
  initializeApiConfig()
  
  // 摘要功能
  const articleSummary = ref('')
  const isGeneratingSummary = ref(false)
  
  // 写作建议
  const writingAdvice = ref('')
  const isGeneratingAdvice = ref(false)
  
  // 文章统计信息
  const articleStats = ref({
    wordCount: 0,
    readingTime: 0,
    sentiment: '',
    tags: [],
    category: '',
    score: 0
  })

  // 计算属性
  const wordCount = computed(() => {
    // 去除HTML标签，计算纯文本字数，与文章统计保持一致
    return currentNovel.value.replace(/<[^>]*>/g, '').length
  })

  const readingTime = computed(() => {
    // 按照每分钟200字的阅读速度计算
    return Math.ceil(wordCount.value / 200)
  })

  // 方法
  const setCurrentNovel = async (content) => {
    currentNovel.value = content
    await updateStats()
  }

  const setGeneratedContent = (content) => {
    generatedContent.value = content
  }

  const addToNovel = async () => {
    if (generatedContent.value) {
      // 如果当前内容为空，直接设置
      if (!currentNovel.value || currentNovel.value === '<p><br></p>') {
        currentNovel.value = `<p>${generatedContent.value}</p>`
      } else {
        // 如果有内容，添加新段落
        currentNovel.value += `<p><br></p><p>${generatedContent.value}</p>`
      }
      await updateStats()
    }
  }

  const clearNovel = async () => {
    currentNovel.value = ''
    await updateStats()
  }

  const setOutline = (content) => {
    outline.value = content
  }

  const setGeneratingOutline = (status) => {
    isGeneratingOutline.value = status
  }

  const clearOutline = () => {
    outline.value = ''
    chapters.value = []
  }

  // 章节管理方法
  const parseOutlineToChapters = () => {
    const outlineText = outline.value
    const chapterRegex = /###\s*(.+?)\n([\s\S]*?)(?=###|$)/g
    const newChapters = []
    let match
    let index = 1
    
    while ((match = chapterRegex.exec(outlineText)) !== null) {
      newChapters.push({
        id: index++,
        title: match[1].trim(),
        content: match[2].trim(),
        generatedText: '',
        isCompleted: false
      })
    }
    
    chapters.value = newChapters
  }

  const setSelectedChapter = (chapter) => {
    selectedChapter.value = chapter
  }

  const updateChapterContent = (chapterId, content) => {
    const chapter = chapters.value.find(c => c.id === chapterId)
    if (chapter) {
      chapter.content = content
    }
  }

  const setChapterGenerated = (chapterId, text) => {
    const chapter = chapters.value.find(c => c.id === chapterId)
    if (chapter) {
      chapter.generatedText = text
      chapter.isCompleted = true
    }
  }

  const setGeneratingChapter = (status) => {
    isGeneratingChapter.value = status
  }

  // AI对话功能
  const addChatMessage = (message, isUser = true) => {
    // 生成唯一ID，避免快速操作时ID重复
    const generateUniqueId = () => {
      const timestamp = Date.now()
      const random = Math.floor(Math.random() * 10000)
      return timestamp + random
    }
    
    aiChatHistory.value.push({
      id: generateUniqueId(),
      content: message,
      isUser,
      timestamp: new Date().toLocaleTimeString()
    })
  }

  const setChatInput = (input) => {
    currentChatInput.value = input
  }

  const setAiChatting = (status) => {
    isAiChatting.value = status
  }

  const clearChatHistory = () => {
    aiChatHistory.value = []
  }

  const setTemplate = (template) => {
    selectedTemplate.value = template
  }

  const setKeywords = (kw) => {
    keywords.value = kw
  }

  const setGenerating = (status) => {
    isGenerating.value = status
  }

  const addCorpus = (text) => {
    // 生成唯一ID，避免快速操作时ID重复
    const generateUniqueId = () => {
      const timestamp = Date.now()
      const random = Math.floor(Math.random() * 10000)
      return timestamp + random
    }
    
    corpus.value.push({
      id: generateUniqueId(),
      content: text,
      createdAt: new Date().toISOString()
    })
  }

  const removeCorpus = (id) => {
    const index = corpus.value.findIndex(item => item.id === id)
    if (index > -1) {
      corpus.value.splice(index, 1)
    }
  }

  const updateStats = async () => {
    // 从HTML中提取纯文本进行统计
    const content = currentNovel.value.replace(/<[^>]*>/g, '')
    
    // 基础统计（立即更新）
    articleStats.value = {
      wordCount: content.length,
      readingTime: Math.ceil(content.length / 200),
      sentiment: analyzeSentiment(content),
      tags: generateTags(content),
      category: categorizeContent(content),
      score: calculateScore(content)
    }
    
    // 如果配置了API且内容足够长，使用AI进行深度分析
    if (isApiConfigured.value && content.length > 100) {
      try {
        await updateStatsWithAI(content)
      } catch (error) {
        console.log('AI分析失败，使用本地分析结果:', error.message)
      }
    }
  }
  
  // 使用AI进行深度文章分析
  const updateStatsWithAI = async (content) => {
    try {
      const analysis = await apiService.analyzeArticle(content)
      
      // 更新AI分析结果
      articleStats.value = {
        ...articleStats.value,
        sentiment: analysis.sentiment || articleStats.value.sentiment,
        tags: analysis.tags || articleStats.value.tags,
        category: analysis.category || articleStats.value.category,
        score: analysis.score || articleStats.value.score,
        aiAnalysis: analysis // 保存完整的AI分析结果
      }
    } catch (error) {
      console.error('AI文章分析失败:', error)
      throw error
    }
  }

  // API配置方法
  const updateApiConfig = (config, configType = null) => {
    // 如果没有指定类型，使用当前配置类型
    const targetType = configType || currentConfigType.value
    
    if (targetType === 'official') {
      // 官方配置：强制保持官方API地址
      officialApiConfig.value = { 
        ...officialApiConfig.value, 
        ...config,
        baseURL: 'https://ai.91hub.vip/v1'
      }
    } else {
      // 自定义配置：允许所有参数更新
      customApiConfig.value = { ...customApiConfig.value, ...config }
    }
    
    // 更新apiService配置为当前活动配置
    const currentConfig = getCurrentApiConfig()
    apiService.updateConfig(currentConfig)
    // 更严格的检查：apiKey 必须存在且不为空白字符串
    isApiConfigured.value = !!(currentConfig.apiKey && currentConfig.apiKey.trim())
  }
  
  // 切换配置类型
  const switchConfigType = (type) => {
    currentConfigType.value = type
    localStorage.setItem('apiConfigType', type)
    
    // 更新apiService配置
    const currentConfig = getCurrentApiConfig()
    apiService.updateConfig(currentConfig)
    // 更严格的检查：apiKey 必须存在且不为空白字符串
    isApiConfigured.value = !!(currentConfig.apiKey && currentConfig.apiKey.trim())
  }

  const validateApiKey = async () => {
    try {
      const isValid = await apiService.validateAPIKey()
      isApiConfigured.value = isValid
      return isValid
    } catch (error) {
      console.error('API密钥验证失败:', error)
      isApiConfigured.value = false
      return false
    }
  }

  // 清除所有API配置
  const clearAllApiConfigs = () => {
    try {
      console.log('开始清除所有API配置...')
      
      // 清除配置数据
      localStorage.removeItem('officialApiConfig')
      localStorage.removeItem('customApiConfig')
      localStorage.removeItem('apiConfigType')
      
      // 清除旧版本的配置键
      localStorage.removeItem('apiConfig')
      localStorage.removeItem('api-config')
      localStorage.removeItem('aiApiConfigs')
      localStorage.removeItem('aiApiConfigs.backup')
      
      // 重置为默认值
      officialApiConfig.value = {
        apiKey: '',
        baseURL: 'https://ai.91hub.vip/v1',
        selectedModel: 'claude-4-sonnet',
        maxTokens: 2000000,
        unlimitedTokens: false,
        temperature: 0.7
      }
      
      customApiConfig.value = {
        apiKey: '',
        baseURL: 'https://api.openai.com/v1',
        selectedModel: 'gpt-3.5-turbo',
        maxTokens: 2000000,
        unlimitedTokens: false,
        temperature: 0.7
      }
      
      currentConfigType.value = 'official'
      isApiConfigured.value = false
      
      apiService.updateConfig(officialApiConfig.value)
      
      console.log('✓ 所有API配置已清除')
      return true
    } catch (error) {
      console.error('清除API配置失败:', error)
      return false
    }
  }

  // 使用真实API生成大纲
  const generateOutlineWithAPI = async (theme) => {
    if (!isApiConfigured.value) {
      throw new Error('请先配置API密钥')
    }
    
    setGeneratingOutline(true)
    try {
      const result = await apiService.generateOutline(theme, keywords.value, selectedTemplate.value)
      setOutline(result)
      parseOutlineToChapters()
      return result
    } catch (error) {
      console.error('生成大纲失败:', error)
      throw error
    } finally {
      setGeneratingOutline(false)
    }
  }

  // 流式生成大纲
  const generateOutlineWithAPIStream = async (theme, onChunk = null) => {
    if (!isApiConfigured.value) {
      throw new Error('请先配置API密钥')
    }
    
    setGeneratingOutline(true)
    setOutline('')
    
    try {
      const result = await apiService.generateOutlineStream(theme, keywords.value, selectedTemplate.value, (chunk, fullContent) => {
        setOutline(fullContent)
        if (onChunk) onChunk(chunk, fullContent)
      })
      parseOutlineToChapters()
      return result
    } catch (error) {
      console.error('生成大纲失败:', error)
      throw error
    } finally {
      setGeneratingOutline(false)
    }
  }

  // 使用真实API生成章节内容
  const generateChapterWithAPI = async (chapter, novelInfo = null) => {
    if (!isApiConfigured.value) {
      throw new Error('请先配置API密钥')
    }
    
    setGeneratingChapter(true)
    try {
      const previousContent = currentNovel.value.replace(/<[^>]*>/g, '')
      const result = await apiService.generateChapterContent(
        chapter.title,
        chapter.content,
        previousContent,
        selectedTemplate.value,
        characters.value,
        worldSettings.value,
        novelInfo || {}
      )
      setChapterGenerated(chapter.id, result)
      setGeneratedContent(result)
      return result
    } catch (error) {
      console.error('生成章节内容失败:', error)
      throw error
    } finally {
      setGeneratingChapter(false)
    }
  }

  // AI对话功能
  const sendChatMessageWithAPI = async (message) => {
    if (!isApiConfigured.value) {
      throw new Error('请先配置API密钥')
    }
    
    setAiChatting(true)
    
    try {
      const response = await apiService.chatWithAI(message, aiChatHistory.value)
      addChatMessage(response, false)
      return response
    } catch (error) {
      console.error('AI对话失败:', error)
      addChatMessage('抱歉，AI暂时无法回应，请稍后再试。', false)
      throw error
    } finally {
      setAiChatting(false)
    }
  }

  // 摘要相关方法
  const setGeneratingSummary = (status) => {
    isGeneratingSummary.value = status
  }

  const setArticleSummary = (summary) => {
    articleSummary.value = summary
  }

  // 生成文章摘要
  const generateSummaryWithAPI = async (options = {}) => {
    if (!isApiConfigured.value) {
      throw new Error('请先配置API密钥')
    }
    
    if (!currentNovel.value) {
      throw new Error('请先输入文章内容')
    }
    
    isGeneratingSummary.value = true
    try {
      const content = currentNovel.value.replace(/<[^>]*>/g, '')
      const summary = await apiService.generateSummary(content, options)
      articleSummary.value = summary
      return summary
    } catch (error) {
      console.error('生成摘要失败:', error)
      throw error
    } finally {
      isGeneratingSummary.value = false
    }
  }

  // 获取写作建议
  const getWritingAdviceWithAPI = async () => {
    if (!isApiConfigured.value) {
      throw new Error('请先配置API密钥')
    }
    
    if (!currentNovel.value) {
      throw new Error('请先输入文章内容')
    }
    
    isGeneratingAdvice.value = true
    try {
      const content = currentNovel.value.replace(/<[^>]*>/g, '')
      const advice = await apiService.getWritingAdvice(content)
      writingAdvice.value = advice
      return advice
    } catch (error) {
      console.error('获取写作建议失败:', error)
      throw error
    } finally {
      isGeneratingAdvice.value = false
    }
  }

  // 基于语料库生成个性化内容
  const generatePersonalizedContent = async (prompt) => {
    if (!isApiConfigured.value) {
      throw new Error('请先配置API密钥')
    }
    
    if (corpus.value.length === 0) {
      throw new Error('请先添加语料库内容')
    }
    
    setGenerating(true)
    try {
      const result = await apiService.generatePersonalizedContent(prompt, corpus.value)
      setGeneratedContent(result)
      return result
    } catch (error) {
      console.error('生成个性化内容失败:', error)
      throw error
    } finally {
      setGenerating(false)
    }
  }

  // 使用真实API生成通用内容
  const generateContentWithAPI = async (keywords, template, outline, wordLimit) => {
    if (!isApiConfigured.value) {
      throw new Error('请先配置API密钥')
    }
    
    try {
      const result = await apiService.generateGeneralContent(keywords, template, outline, wordLimit)
      setGeneratedContent(result)
      return result
    } catch (error) {
      console.error('生成内容失败:', error)
      throw error
    }
  }

  // 流式生成内容
  const generateContentWithAPIStream = async (keywords, template, outline, wordLimit, onChunk = null) => {
    if (!isApiConfigured.value) {
      throw new Error('请先配置API密钥')
    }
    
    setGenerating(true)
    setGeneratedContent('') // 清空之前的内容
    
    try {
      const result = await apiService.generateGeneralContentStream(keywords, template, outline, wordLimit, (chunk, fullContent) => {
        // 实时更新生成的内容
        setGeneratedContent(fullContent)
        console.log('流式内容更新:', chunk) // 添加调试日志
        if (onChunk) onChunk(chunk, fullContent)
      })
      console.log('流式生成完成:', result) // 添加调试日志
      return result
    } catch (error) {
      console.error('生成内容失败:', error)
      throw error
    } finally {
      setGenerating(false)
    }
  }

  // 语料库管理
  const addCorpusFromFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target.result
        addCorpus(content)
        resolve(content)
      }
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  const exportCorpus = () => {
    const data = JSON.stringify(corpus.value, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'corpus.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importCorpus = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          corpus.value = data
          resolve(data)
        } catch (error) {
          reject(new Error('语料库文件格式错误'))
        }
      }
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  // 简单的情感分析
  const analyzeSentiment = (content) => {
    const positiveWords = ['快乐', '幸福', '美好', '成功', '胜利', '爱', '喜欢']
    const negativeWords = ['悲伤', '痛苦', '失败', '死亡', '恐惧', '愤怒', '绝望']
    
    let positiveCount = 0
    let negativeCount = 0
    
    positiveWords.forEach(word => {
      positiveCount += (content.match(new RegExp(word, 'g')) || []).length
    })
    
    negativeWords.forEach(word => {
      negativeCount += (content.match(new RegExp(word, 'g')) || []).length
    })
    
    if (positiveCount > negativeCount) return '积极'
    if (negativeCount > positiveCount) return '消极'
    return '中性'
  }

  // 生成标签
  const generateTags = (content) => {
    const tags = []
    if (content.includes('修仙') || content.includes('仙人')) tags.push('修仙')
    if (content.includes('爱情') || content.includes('恋人')) tags.push('爱情')
    if (content.includes('悬疑') || content.includes('推理')) tags.push('悬疑')
    if (content.includes('科幻') || content.includes('未来')) tags.push('科幻')
    if (content.includes('古代') || content.includes('穿越')) tags.push('古代')
    return tags
  }

  // 内容分类
  const categorizeContent = (content) => {
    if (content.includes('修仙') || content.includes('异世界')) return '玄幻'
    if (content.includes('都市') || content.includes('现代')) return '都市'
    if (content.includes('悬疑') || content.includes('推理')) return '悬疑'
    if (content.includes('科幻') || content.includes('未来')) return '科幻'
    if (content.includes('古代') || content.includes('历史')) return '历史'
    return '其他'
  }

  // 计算文章评分
  const calculateScore = (content) => {
    let score = 50 // 基础分
    
    // 根据字数调整分数
    if (content.length > 1000) score += 10
    if (content.length > 3000) score += 10
    if (content.length > 5000) score += 10
    
    // 根据段落数调整分数
    const paragraphs = content.split('\n\n').filter(p => p.trim())
    if (paragraphs.length > 3) score += 5
    if (paragraphs.length > 6) score += 5
    
    // 根据对话调整分数
    const dialogues = (content.match(/[""]/g) || []).length
    if (dialogues > 4) score += 5
    
    return Math.min(100, score)
  }

  // 人物管理方法
  const addCharacter = (character) => {
    characters.value.push({
      id: Date.now(),
      ...character,
      traits: character.traitsInput ? character.traitsInput.split(',').map(t => t.trim()).filter(t => t) : []
    })
  }
  
  const removeCharacter = (id) => {
    characters.value = characters.value.filter(char => char.id !== id)
  }
  
  // 世界观设定管理方法
  const addWorldSetting = (setting) => {
    // 生成唯一ID，避免快速操作时ID重复
    const generateUniqueId = () => {
      const timestamp = Date.now()
      const random = Math.floor(Math.random() * 10000)
      return timestamp + random
    }
    
    worldSettings.value.push({
      id: generateUniqueId(),
      ...setting
    })
  }
  
  const removeWorldSetting = (id) => {
    worldSettings.value = worldSettings.value.filter(setting => setting.id !== id)
  }

  const updateWorldSetting = (id, updatedSetting) => {
    const index = worldSettings.value.findIndex(setting => setting.id === id)
    if (index > -1) {
      worldSettings.value[index] = { ...worldSettings.value[index], ...updatedSetting }
    }
  }



  // 通用内容生成方法
  const generateContent = async (prompt, onChunk = null) => {
    console.log('generateContent 被调用:', { 
      prompt: prompt ? prompt.substring(0, 100) + '...' : prompt,
      isApiConfigured: isApiConfigured.value,
      currentConfigType: currentConfigType.value
    })
    
    if (!isApiConfigured.value) {
      throw new Error('API未配置：请前往设置页面配置您的API密钥后再使用此功能')
    }
    
    try {
      isGenerating.value = true
      
      console.log('开始调用 API 生成内容...')
      
      // 如果提供了onChunk回调，使用流式API
      if (onChunk) {
        const result = await apiService.generateTextStream(prompt, {
          type: 'content_generation'
        }, (chunk, fullContent) => {
          onChunk(chunk)
        })
        
        console.log('流式API返回结果 (带回调):', result ? result.substring(0, 200) + '...' : result)
        return result
      } else {
        // 否则使用非流式API获取结果
        const result = await apiService.generateText(prompt, {
          type: 'content_generation'
        })
        
        console.log('非流式API返回结果:', result ? result.substring(0, 200) + '...' : result)
        return result
      }
    } catch (error) {
      console.error('生成内容失败:', error)
      throw error
    } finally {
      isGenerating.value = false
    }
  }

  return {
    // 状态
    currentNovel,
    generatedContent,
    outline,
    isGeneratingOutline,
    chapters,
    selectedChapter,
    isGeneratingChapter,
    aiChatHistory,
    currentChatInput,
    isAiChatting,
    templates,
    selectedTemplate,
    keywords,
    isGenerating,
    corpus,
    characters,
    worldSettings,
    articleStats,
    officialApiConfig,
    customApiConfig,
    currentConfigType,
    isApiConfigured,
    articleSummary,
    isGeneratingSummary,
    writingAdvice,
    isGeneratingAdvice,
    
    // 计算属性
    wordCount,
    readingTime,
    
    // 方法
    setCurrentNovel,
    setGeneratedContent,
    addToNovel,
    clearNovel,
    setOutline,
    setGeneratingOutline,
    clearOutline,
    parseOutlineToChapters,
    setSelectedChapter,
    updateChapterContent,
    setChapterGenerated,
    setGeneratingChapter,
    addChatMessage,
    setChatInput,
    setAiChatting,
    clearChatHistory,
    setTemplate,
    setKeywords,
    setGenerating,
    addCorpus,
    removeCorpus,
    addCharacter,
    removeCharacter,
    addWorldSetting,
    removeWorldSetting,
    updateWorldSetting,
    updateStats,
    
    // API相关方法
    updateApiConfig,
    switchConfigType,
    getCurrentApiConfig,
    validateApiKey,
    clearAllApiConfigs,
    checkNewAIConfigAsync,
    resetApiConfigStatus,
    generateOutlineWithAPI,
    generateOutlineWithAPIStream,
    generateChapterWithAPI,
    sendChatMessageWithAPI,
    generateSummaryWithAPI,
    getWritingAdviceWithAPI,
    generatePersonalizedContent,
    generateContentWithAPI,
    generateContentWithAPIStream,
    addCorpusFromFile,
    exportCorpus,
    importCorpus,
    setGeneratingSummary,
    setArticleSummary,
    generateContent
  }
})