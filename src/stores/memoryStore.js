import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import memoryService from '../services/memoryService.js'
import compressionService from '../services/compressionService.js'
import contextService from '../services/contextService.js'
import { useNovelStore } from './novel.js'

export const useMemoryStore = defineStore('memory', () => {
  // 状态管理
  const novels = ref(new Map()) // 存储所有小说的记忆数据
  const currentNovelId = ref(null)
  const isInitialized = ref(false)
  
  // 获取当前小说的记忆数据
  const currentNovelMemory = computed(() => {
    if (!currentNovelId.value) return null
    return novels.value.get(currentNovelId.value) || null
  })
  
  // 获取核心记忆
  const coreMemory = computed(() => {
    return currentNovelMemory.value?.coreMemory || {
      characters: [],
      worldSetting: {},
      mainPlot: {}
    }
  })
  
  // 获取章节摘要
  const chapterSummaries = computed(() => {
    return currentNovelMemory.value?.chapterSummaries || []
  })
  
  // 获取上下文管理信息
  const contextManagement = computed(() => {
    return currentNovelMemory.value?.contextManagement || {
      recentChapters: [],
      currentChapterContext: {},
      relevantHistory: [],
      tokenBudget: {
        total: 3000,
        used: 0,
        remaining: 3000
      }
    }
  })
  
  // 获取一致性追踪信息
  const consistencyTracking = computed(() => {
    return currentNovelMemory.value?.consistencyTracking || {
      characterStates: {},
      worldRules: [],
      timeline: [],
      contradictions: []
    }
  })
  
  // 记忆统计信息
  const memoryStats = computed(() => {
    if (!currentNovelMemory.value) {
      return {
        totalMemorySize: 0,
        coreMemoryTokens: 0,
        summaryTokens: 0,
        contextTokens: 0,
        compressionRatio: 0,
        chaptersWithSummary: 0,
        totalChapters: 0
      }
    }
    
    const memory = currentNovelMemory.value
    const coreTokens = memoryService.estimateTokens(JSON.stringify(memory.coreMemory))
    const summaryTokens = memory.chapterSummaries.reduce((total, summary) => total + (summary.tokenCost || 0), 0)
    const contextTokens = memory.contextManagement.tokenBudget.used
    
    return {
      totalMemorySize: coreTokens + summaryTokens + contextTokens,
      coreMemoryTokens: coreTokens,
      summaryTokens: summaryTokens,
      contextTokens: contextTokens,
      compressionRatio: memory.chapterSummaries.length > 0 ? 
        (memory.chapterSummaries.reduce((total, s) => total + (s.originalLength || 0), 0) / summaryTokens) : 0,
      chaptersWithSummary: memory.chapterSummaries.length,
      totalChapters: memory.chapterSummaries.length
    }
  })
  
  /**
   * 初始化记忆系统
   */
  const initializeMemorySystem = async () => {
    try {
      // 从localStorage加载记忆数据
      const savedMemories = localStorage.getItem('novel_memories')
      if (savedMemories) {
        const memoriesData = JSON.parse(savedMemories)
        novels.value = new Map(memoriesData)
      }
      isInitialized.value = true
    } catch (error) {
      console.error('初始化记忆系统失败:', error)
      novels.value = new Map()
      isInitialized.value = true
    }
  }
  
  /**
   * 创建新的小说记忆
   */
  const createNovelMemory = async (novelId, basicInfo = {}) => {
    try {
      const novelMemory = memoryService.createEmptyMemory(novelId, basicInfo)
      novels.value.set(novelId, novelMemory)
      currentNovelId.value = novelId
      await saveMemoriesToStorage()
      return novelMemory
    } catch (error) {
      console.error('创建小说记忆失败:', error)
      throw error
    }
  }
  
  /**
   * 设置当前小说
   */
  const setCurrentNovel = (novelId) => {
    currentNovelId.value = novelId
    if (!novels.value.has(novelId)) {
      return createNovelMemory(novelId)
    }
  }
  
  /**
   * 更新核心记忆
   */
  const updateCoreMemory = async (updates) => {
    if (!currentNovelId.value) return
    
    try {
      const memory = novels.value.get(currentNovelId.value)
      if (memory) {
        memory.coreMemory = { ...memory.coreMemory, ...updates }
        memory.updatedAt = new Date().toISOString()
        novels.value.set(currentNovelId.value, memory)
        await saveMemoriesToStorage()
      }
    } catch (error) {
      console.error('更新核心记忆失败:', error)
      throw error
    }
  }
  
  /**
   * 添加章节摘要
   */
  const addChapterSummary = async (chapterData) => {
    if (!currentNovelId.value) return
    
    try {
      const memory = novels.value.get(currentNovelId.value)
      if (!memory) return
      
      // 生成章节摘要
      const summary = await compressionService.compressChapterToSummary(chapterData)
      
      // 检查是否已存在该章节摘要
      const existingIndex = memory.chapterSummaries.findIndex(
        s => s.chapterNumber === chapterData.chapterNumber
      )
      
      if (existingIndex >= 0) {
        // 更新现有摘要
        memory.chapterSummaries[existingIndex] = {
          ...memory.chapterSummaries[existingIndex],
          ...summary,
          updatedAt: new Date().toISOString()
        }
      } else {
        // 添加新摘要
        memory.chapterSummaries.push({
          ...summary,
          chapterNumber: chapterData.chapterNumber,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }
      
      memory.updatedAt = new Date().toISOString()
      novels.value.set(currentNovelId.value, memory)
      await saveMemoriesToStorage()
      
      return summary
    } catch (error) {
      console.error('添加章节摘要失败:', error)
      throw error
    }
  }
  
  /**
   * 获取生成上下文
   */
  const getGenerationContext = async (chapterNumber, maxTokens = 3000) => {
    if (!currentNovelId.value) return null
    
    try {
      const memory = novels.value.get(currentNovelId.value)
      if (!memory) return null
      
      const context = await contextService.buildOptimalContext(
        memory.coreMemory,
        memory.chapterSummaries,
        chapterNumber,
        maxTokens
      )
      
      // 更新上下文管理信息
      memory.contextManagement = {
        ...memory.contextManagement,
        currentChapterContext: context,
        tokenBudget: {
          total: maxTokens,
          used: contextService.calculateTokenUsage(context),
          remaining: maxTokens - contextService.calculateTokenUsage(context)
        },
        lastContextGenerated: new Date().toISOString()
      }
      
      novels.value.set(currentNovelId.value, memory)
      await saveMemoriesToStorage()
      
      return context
    } catch (error) {
      console.error('获取生成上下文失败:', error)
      throw error
    }
  }
  
  /**
   * 检查记忆一致性
   */
  const checkConsistency = async (newContent) => {
    if (!currentNovelId.value) return []
    
    try {
      const memory = novels.value.get(currentNovelId.value)
      if (!memory) return []
      
      const issues = await memoryService.checkConsistency(memory, newContent)
      
      // 更新一致性追踪
      if (issues.length > 0) {
        memory.consistencyTracking.contradictions.push({
          content: newContent,
          issues: issues,
          detectedAt: new Date().toISOString()
        })
        
        novels.value.set(currentNovelId.value, memory)
        await saveMemoriesToStorage()
      }
      
      return issues
    } catch (error) {
      console.error('检查一致性失败:', error)
      return []
    }
  }
  
  /**
   * 获取相关历史内容
   */
  const getRelevantHistory = async (currentContent, limit = 5) => {
    if (!currentNovelId.value) return []
    
    try {
      const memory = novels.value.get(currentNovelId.value)
      if (!memory) return []
      
      return await contextService.findRelevantSummaries(
        memory.chapterSummaries,
        currentContent,
        limit
      )
    } catch (error) {
      console.error('获取相关历史内容失败:', error)
      return []
    }
  }
  
  /**
   * 更新角色状态
   */
  const updateCharacterState = async (characterId, stateUpdate) => {
    if (!currentNovelId.value) return
    
    try {
      const memory = novels.value.get(currentNovelId.value)
      if (!memory) return
      
      if (!memory.consistencyTracking.characterStates[characterId]) {
        memory.consistencyTracking.characterStates[characterId] = []
      }
      
      memory.consistencyTracking.characterStates[characterId].push({
        ...stateUpdate,
        timestamp: new Date().toISOString()
      })
      
      novels.value.set(currentNovelId.value, memory)
      await saveMemoriesToStorage()
    } catch (error) {
      console.error('更新角色状态失败:', error)
      throw error
    }
  }
  
  /**
   * 压缩过时记忆
   */
  const compressOldMemories = async (retentionPolicy = {}) => {
    if (!currentNovelId.value) return
    
    try {
      const memory = novels.value.get(currentNovelId.value)
      if (!memory) return
      
      // 压缩策略：保留最近的章节详细摘要，压缩较老的章节
      const { keepRecentChapters = 10, maxSummaryAge = 30 } = retentionPolicy
      
      const currentTime = new Date()
      memory.chapterSummaries.forEach((summary, index) => {
        const summaryAge = (currentTime - new Date(summary.createdAt)) / (1000 * 60 * 60 * 24)
        const isOld = index < memory.chapterSummaries.length - keepRecentChapters || summaryAge > maxSummaryAge
        
        if (isOld && !summary.compressed) {
          // 进一步压缩摘要
          summary.summary = compressionService.furtherCompress(summary.summary)
          summary.compressed = true
          summary.compressionLevel = (summary.compressionLevel || 0) + 1
        }
      })
      
      novels.value.set(currentNovelId.value, memory)
      await saveMemoriesToStorage()
    } catch (error) {
      console.error('压缩过时记忆失败:', error)
      throw error
    }
  }
  
  /**
   * 保存记忆数据到存储
   */
  const saveMemoriesToStorage = async () => {
    try {
      const memoriesToSave = Array.from(novels.value.entries())
      localStorage.setItem('novel_memories', JSON.stringify(memoriesToSave))
    } catch (error) {
      console.error('保存记忆数据失败:', error)
      throw error
    }
  }
  
  /**
   * 删除小说记忆
   */
  const deleteNovelMemory = async (novelId) => {
    try {
      novels.value.delete(novelId)
      if (currentNovelId.value === novelId) {
        currentNovelId.value = null
      }
      await saveMemoriesToStorage()
    } catch (error) {
      console.error('删除小说记忆失败:', error)
      throw error
    }
  }
  
  /**
   * 导出记忆数据
   */
  const exportMemoryData = (novelId = null) => {
    try {
      const dataToExport = novelId ? 
        novels.value.get(novelId) : 
        Array.from(novels.value.entries())
      
      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        data: dataToExport
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `novel_memory_${novelId || 'all'}_${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('导出记忆数据失败:', error)
      throw error
    }
  }
  
  /**
   * 导入记忆数据
   */
  const importMemoryData = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const importData = JSON.parse(e.target.result)
          
          if (importData.version && importData.data) {
            if (Array.isArray(importData.data)) {
              // 导入多个小说的记忆
              importData.data.forEach(([novelId, memory]) => {
                novels.value.set(novelId, memory)
              })
            } else {
              // 导入单个小说的记忆
              const novelId = importData.data.novelId || `imported_${Date.now()}`
              novels.value.set(novelId, importData.data)
            }
            
            await saveMemoriesToStorage()
            resolve(importData)
          } else {
            reject(new Error('导入文件格式错误'))
          }
        } catch (error) {
          reject(new Error('导入文件解析失败：' + error.message))
        }
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsText(file)
    })
  }
  
  return {
    // 状态
    novels,
    currentNovelId,
    isInitialized,
    
    // 计算属性
    currentNovelMemory,
    coreMemory,
    chapterSummaries,
    contextManagement,
    consistencyTracking,
    memoryStats,
    
    // 方法
    initializeMemorySystem,
    createNovelMemory,
    setCurrentNovel,
    updateCoreMemory,
    addChapterSummary,
    getGenerationContext,
    checkConsistency,
    getRelevantHistory,
    updateCharacterState,
    compressOldMemories,
    deleteNovelMemory,
    exportMemoryData,
    importMemoryData,
    saveMemoriesToStorage
  }
})
