/**
 * AI写作助手状态管理
 * 管理助手的全局状态、设置和交互历史
 */

import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'
import aiWritingAssistant from '@/services/aiWritingAssistant.js'

export const useAssistantStore = defineStore('assistant', () => {
  // 状态
  const isActive = ref(false)
  const isVisible = ref(false)
  const currentSession = ref(null)
  const conversationHistory = ref([])
  const settings = reactive({
    personality: 'professional',
    responseSpeed: 'balanced',
    autoShow: false,
    writingStyle: 'balanced',
    creativityLevel: 7,
    detailLevel: 6,
    targetAudience: 'general',
    smartReminders: true,
    realtimeSuggestions: true,
    quickActions: true,
    contextMemory: true,
    learningMode: true,
    notifications: {
      writing: ['daily_goal', 'quality_check'],
      timeRange: ['09:00', '22:00'],
      frequency: 'medium'
    },
    dataRetention: {
      conversationHistory: 100,
      usageStats: true
    }
  })

  const status = ref({
    type: 'ready', // ready, thinking, busy, error
    text: '准备就绪',
    lastActivity: null
  })

  const metrics = reactive({
    totalInteractions: 0,
    successfulInteractions: 0,
    averageResponseTime: 0,
    mostUsedFeatures: [],
    userSatisfaction: 0,
    weeklyUsage: []
  })

  const context = reactive({
    currentNovel: null,
    currentChapter: null,
    selectedText: '',
    recentContent: '',
    writingGoals: [],
    userPreferences: {}
  })

  // 计算属性
  const isOnline = computed(() => {
    return status.value.type !== 'error'
  })

  const hasActiveSession = computed(() => {
    return currentSession.value !== null
  })

  const recentConversations = computed(() => {
    return conversationHistory.value.slice(-10)
  })

  const successRate = computed(() => {
    if (metrics.totalInteractions === 0) return 100
    return Math.round((metrics.successfulInteractions / metrics.totalInteractions) * 100)
  })

  const isInQuietHours = computed(() => {
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    const [startTime, endTime] = settings.notifications.timeRange
    
    return currentTime < startTime || currentTime > endTime
  })

  // Actions
  const initializeAssistant = async (novelData, options = {}) => {
    try {
      updateStatus('thinking', '正在初始化...')
      
      // 更新上下文
      updateContext({
        currentNovel: novelData,
        currentChapter: options.currentChapter,
        writingGoals: options.writingGoals,
        userPreferences: options.userPreferences
      })

      // 初始化AI助手
      const session = await aiWritingAssistant.initializeSession(novelData, options)
      
      currentSession.value = session
      isActive.value = true
      
      // 添加欢迎消息
      if (session.welcome) {
        addMessage({
          type: 'assistant',
          content: session.welcome,
          timestamp: new Date().toISOString(),
          metadata: { event: 'session_start' }
        })
      }

      updateStatus('ready', '准备就绪')
      
      return session
    } catch (error) {
      console.error('助手初始化失败:', error)
      updateStatus('error', '初始化失败')
      throw error
    }
  }

  const sendMessage = async (message, contextData = {}) => {
    if (!isActive.value) {
      throw new Error('助手未激活')
    }

    try {
      updateStatus('thinking', '正在思考...')
      
      // 记录用户消息
      addMessage({
        type: 'user',
        content: message,
        timestamp: new Date().toISOString(),
        context: contextData
      })

      // 更新指标
      metrics.totalInteractions++
      
      const startTime = Date.now()
      
      // 调用AI助手
      const response = await aiWritingAssistant.handleConversation(
        message, 
        { ...context, ...contextData }
      )
      
      const responseTime = Date.now() - startTime
      updateMetrics(responseTime, true)
      
      // 记录助手回应
      addMessage({
        type: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
        metadata: response.metadata
      })

      updateStatus('ready', '准备就绪')
      
      return response
    } catch (error) {
      console.error('发送消息失败:', error)
      updateStatus('error', '处理失败')
      updateMetrics(0, false)
      throw error
    }
  }

  const updateSettings = (newSettings) => {
    Object.assign(settings, newSettings)
    
    // 应用设置到AI助手
    if (aiWritingAssistant.assistantPersonality !== newSettings.personality) {
      aiWritingAssistant.assistantPersonality = newSettings.personality
    }
    
    // 保存设置
    saveSettings()
  }

  const updateContext = (newContext) => {
    Object.assign(context, newContext)
  }

  const updateStatus = (type, text) => {
    status.value = {
      type,
      text,
      lastActivity: new Date().toISOString()
    }
  }

  const addMessage = (message) => {
    conversationHistory.value.push(message)
    
    // 限制历史记录数量
    const maxHistory = settings.dataRetention.conversationHistory
    if (conversationHistory.value.length > maxHistory) {
      conversationHistory.value = conversationHistory.value.slice(-maxHistory)
    }
    
    saveConversationHistory()
  }

  const clearConversation = () => {
    conversationHistory.value = []
    aiWritingAssistant.conversationHistory = []
    saveConversationHistory()
  }

  const updateMetrics = (responseTime, success) => {
    if (success) {
      metrics.successfulInteractions++
    }
    
    // 更新平均响应时间
    if (responseTime > 0) {
      metrics.averageResponseTime = Math.round(
        (metrics.averageResponseTime + responseTime) / 2
      )
    }
    
    saveMetrics()
  }

  const recordFeatureUsage = (feature) => {
    const existingFeature = metrics.mostUsedFeatures.find(f => f.name === feature)
    
    if (existingFeature) {
      existingFeature.count++
      existingFeature.lastUsed = new Date().toISOString()
    } else {
      metrics.mostUsedFeatures.push({
        name: feature,
        count: 1,
        lastUsed: new Date().toISOString()
      })
    }
    
    // 按使用次数排序，只保留前10个
    metrics.mostUsedFeatures.sort((a, b) => b.count - a.count)
    metrics.mostUsedFeatures = metrics.mostUsedFeatures.slice(0, 10)
    
    saveMetrics()
  }

  const recordWeeklyUsage = () => {
    const today = new Date().toISOString().split('T')[0]
    const existingEntry = metrics.weeklyUsage.find(entry => entry.date === today)
    
    if (existingEntry) {
      existingEntry.interactions++
    } else {
      metrics.weeklyUsage.push({
        date: today,
        interactions: 1
      })
    }
    
    // 只保留最近30天的数据
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    metrics.weeklyUsage = metrics.weeklyUsage.filter(entry => {
      return new Date(entry.date) >= thirtyDaysAgo
    })
    
    saveMetrics()
  }

  const show = () => {
    isVisible.value = true
  }

  const hide = () => {
    isVisible.value = false
  }

  const toggle = () => {
    isVisible.value = !isVisible.value
  }

  const activate = async (novelData, options = {}) => {
    if (!isActive.value) {
      await initializeAssistant(novelData, options)
    }
    show()
  }

  const deactivate = () => {
    isActive.value = false
    currentSession.value = null
    hide()
  }

  const shouldShowSmartReminder = (type) => {
    if (!settings.smartReminders) return false
    if (isInQuietHours.value) return false
    if (settings.notifications.frequency === 'none') return false
    
    const frequency = settings.notifications.frequency
    const lastActivity = status.value.lastActivity
    
    if (!lastActivity) return true
    
    const timeSinceLastActivity = Date.now() - new Date(lastActivity).getTime()
    const thresholds = {
      high: 5 * 60 * 1000,    // 5分钟
      medium: 15 * 60 * 1000, // 15分钟
      low: 30 * 60 * 1000     // 30分钟
    }
    
    return timeSinceLastActivity > (thresholds[frequency] || thresholds.medium)
  }

  const getPersonalizedGreeting = () => {
    const hour = new Date().getHours()
    let timeGreeting = ''
    
    if (hour < 12) {
      timeGreeting = '早上好'
    } else if (hour < 18) {
      timeGreeting = '下午好'
    } else {
      timeGreeting = '晚上好'
    }
    
    const personalityGreetings = {
      professional: `${timeGreeting}！我是您的专业写作助手，准备为您提供帮助。`,
      creative: `${timeGreeting}！让我们一起创造精彩的故事吧！`,
      analytical: `${timeGreeting}！我已准备好为您分析文本和提供改进建议。`,
      friendly: `${timeGreeting}！很高兴再次见到您，今天想写什么呢？`
    }
    
    return personalityGreetings[settings.personality] || personalityGreetings.professional
  }

  // 数据持久化
  const saveSettings = () => {
    try {
      localStorage.setItem('assistantSettings', JSON.stringify(settings))
    } catch (error) {
      console.error('保存助手设置失败:', error)
    }
  }

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('assistantSettings')
      if (saved) {
        const savedSettings = JSON.parse(saved)
        Object.assign(settings, savedSettings)
      }
    } catch (error) {
      console.error('加载助手设置失败:', error)
    }
  }

  const saveConversationHistory = () => {
    if (!settings.contextMemory) return
    
    try {
      const dataToSave = conversationHistory.value.slice(-settings.dataRetention.conversationHistory)
      localStorage.setItem('assistantConversationHistory', JSON.stringify(dataToSave))
    } catch (error) {
      console.error('保存对话历史失败:', error)
    }
  }

  const loadConversationHistory = () => {
    if (!settings.contextMemory) return
    
    try {
      const saved = localStorage.getItem('assistantConversationHistory')
      if (saved) {
        conversationHistory.value = JSON.parse(saved)
      }
    } catch (error) {
      console.error('加载对话历史失败:', error)
    }
  }

  const saveMetrics = () => {
    if (!settings.dataRetention.usageStats) return
    
    try {
      localStorage.setItem('assistantMetrics', JSON.stringify(metrics))
    } catch (error) {
      console.error('保存使用指标失败:', error)
    }
  }

  const loadMetrics = () => {
    if (!settings.dataRetention.usageStats) return
    
    try {
      const saved = localStorage.getItem('assistantMetrics')
      if (saved) {
        const savedMetrics = JSON.parse(saved)
        Object.assign(metrics, savedMetrics)
      }
    } catch (error) {
      console.error('加载使用指标失败:', error)
    }
  }

  const exportData = () => {
    const data = {
      settings,
      conversationHistory: conversationHistory.value,
      metrics,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }
    
    return JSON.stringify(data, null, 2)
  }

  const importData = (dataString) => {
    try {
      const data = JSON.parse(dataString)
      
      if (data.settings) {
        Object.assign(settings, data.settings)
        saveSettings()
      }
      
      if (data.conversationHistory) {
        conversationHistory.value = data.conversationHistory
        saveConversationHistory()
      }
      
      if (data.metrics) {
        Object.assign(metrics, data.metrics)
        saveMetrics()
      }
      
      return true
    } catch (error) {
      console.error('导入数据失败:', error)
      return false
    }
  }

  const resetToDefaults = () => {
    // 重置设置
    Object.assign(settings, {
      personality: 'professional',
      responseSpeed: 'balanced',
      autoShow: false,
      writingStyle: 'balanced',
      creativityLevel: 7,
      detailLevel: 6,
      targetAudience: 'general',
      smartReminders: true,
      realtimeSuggestions: true,
      quickActions: true,
      contextMemory: true,
      learningMode: true,
      notifications: {
        writing: ['daily_goal', 'quality_check'],
        timeRange: ['09:00', '22:00'],
        frequency: 'medium'
      },
      dataRetention: {
        conversationHistory: 100,
        usageStats: true
      }
    })
    
    // 清空历史和指标
    conversationHistory.value = []
    Object.assign(metrics, {
      totalInteractions: 0,
      successfulInteractions: 0,
      averageResponseTime: 0,
      mostUsedFeatures: [],
      userSatisfaction: 0,
      weeklyUsage: []
    })
    
    // 保存
    saveSettings()
    saveConversationHistory()
    saveMetrics()
  }

  // 初始化时加载数据
  loadSettings()
  loadConversationHistory()
  loadMetrics()

  return {
    // 状态
    isActive,
    isVisible,
    currentSession,
    conversationHistory,
    settings,
    status,
    metrics,
    context,
    
    // 计算属性
    isOnline,
    hasActiveSession,
    recentConversations,
    successRate,
    isInQuietHours,
    
    // 方法
    initializeAssistant,
    sendMessage,
    updateSettings,
    updateContext,
    updateStatus,
    addMessage,
    clearConversation,
    updateMetrics,
    recordFeatureUsage,
    recordWeeklyUsage,
    show,
    hide,
    toggle,
    activate,
    deactivate,
    shouldShowSmartReminder,
    getPersonalizedGreeting,
    
    // 数据管理
    saveSettings,
    loadSettings,
    exportData,
    importData,
    resetToDefaults
  }
})
