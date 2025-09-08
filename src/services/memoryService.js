import apiService from './api.js'

/**
 * 记忆系统核心服务
 * 负责长篇小说记忆的创建、管理和一致性检查
 */
class MemoryService {
  constructor() {
    // Token估算配置
    this.tokenRatio = 0.75 // 中文字符到token的转换比例
    this.maxCoreMemoryTokens = 500
    this.maxSummaryTokens = 1000
    this.maxContextTokens = 1500
  }

  /**
   * 创建空的小说记忆结构
   */
  createEmptyMemory(novelId, basicInfo = {}) {
    return {
      // 基本信息
      novelId,
      title: basicInfo.title || '未命名小说',
      genre: basicInfo.genre || '',
      theme: basicInfo.theme || '',
      intro: basicInfo.intro || '',
      
      // 核心设定层（永久记忆，~500 tokens）
      coreMemory: {
        // 主要角色（精简版）
        characters: [],
        
        // 世界观核心
        worldSetting: {
          worldType: '',
          coreRules: [],
          powerSystem: '',
          socialStructure: ''
        },
        
        // 主线情节
        mainPlot: {
          premise: '',
          mainConflict: '',
          plotPoints: [],
          currentArc: ''
        }
      },
      
      // 章节摘要层（中期记忆，~1000 tokens）
      chapterSummaries: [],
      
      // 上下文管理（短期记忆，~1500 tokens）
      contextManagement: {
        recentChapters: [],
        currentChapterContext: {},
        relevantHistory: [],
        tokenBudget: {
          total: 3000,
          used: 0,
          remaining: 3000
        }
      },
      
      // 一致性追踪
      consistencyTracking: {
        characterStates: {},
        worldRules: [],
        timeline: [],
        contradictions: []
      },
      
      // 元数据
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0'
    }
  }

  /**
   * 估算文本的Token数量
   */
  estimateTokens(text) {
    if (!text || typeof text !== 'string') return 0
    
    // 移除HTML标签
    const cleanText = text.replace(/<[^>]*>/g, '')
    
    // 中文字符计算
    const chineseChars = (cleanText.match(/[\u4e00-\u9fff]/g) || []).length
    const otherChars = cleanText.length - chineseChars
    
    // 中文字符按0.75个token计算，其他字符按4个字符1个token计算
    return Math.ceil(chineseChars * this.tokenRatio + otherChars / 4)
  }

  /**
   * 从现有角色数据创建核心记忆角色
   */
  createCoreCharacter(character) {
    return {
      id: character.id || Date.now(),
      name: character.name || '未命名角色',
      role: character.role || 'minor', // protagonist, supporting, antagonist, minor
      keyTraits: this.extractKeyTraits(character),
      currentStatus: character.currentStatus || '未知状态',
      relationships: character.relationships || [],
      importance: this.calculateCharacterImportance(character)
    }
  }

  /**
   * 提取角色关键特征
   */
  extractKeyTraits(character) {
    const traits = []
    
    if (character.personality) {
      // 从性格描述中提取关键词
      const keywords = this.extractKeywords(character.personality, 3)
      traits.push(...keywords)
    }
    
    if (character.traits && Array.isArray(character.traits)) {
      traits.push(...character.traits.slice(0, 3))
    }
    
    if (character.occupation) {
      traits.push(`职业：${character.occupation}`)
    }
    
    return traits.slice(0, 5) // 最多5个关键特征
  }

  /**
   * 计算角色重要度
   */
  calculateCharacterImportance(character) {
    let importance = 0.5 // 基础重要度
    
    // 根据角色类型调整
    const roleWeights = {
      protagonist: 1.0,
      supporting: 0.8,
      antagonist: 0.9,
      minor: 0.3
    }
    importance *= (roleWeights[character.role] || 0.5)
    
    // 根据描述长度调整
    const descLength = (character.personality || '').length + (character.background || '').length
    if (descLength > 200) importance += 0.2
    if (descLength > 500) importance += 0.1
    
    // 根据关系数量调整
    if (character.relationships && character.relationships.length > 0) {
      importance += character.relationships.length * 0.05
    }
    
    return Math.min(1.0, importance)
  }

  /**
   * 从文本中提取关键词
   */
  extractKeywords(text, limit = 5) {
    if (!text) return []
    
    // 简单的关键词提取（可以后续用AI优化）
    const words = text.split(/[，。！？；：、\s]+/)
      .filter(word => word.length >= 2 && word.length <= 6)
      .filter(word => !/^[的了在是有就都要能和与或但也还](.*)?$/.test(word))
    
    // 统计词频
    const frequency = {}
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1
    })
    
    // 按频率排序并返回前N个
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([word]) => word)
  }

  /**
   * 从世界观设定创建核心世界观
   */
  createCoreWorldSetting(worldSettings) {
    if (!worldSettings || worldSettings.length === 0) {
      return {
        worldType: '',
        coreRules: [],
        powerSystem: '',
        socialStructure: ''
      }
    }

    const coreRules = []
    let worldType = ''
    let powerSystem = ''
    let socialStructure = ''

    worldSettings.forEach(setting => {
      // 根据设定类型分类
      switch (setting.category) {
        case 'setting':
          if (!worldType) worldType = setting.title
          break
        case 'magic':
          if (!powerSystem) powerSystem = setting.title
          break
        case 'politics':
          if (!socialStructure) socialStructure = setting.title
          break
        default:
          if (setting.description && coreRules.length < 5) {
            coreRules.push(setting.title + '：' + setting.description.substring(0, 50))
          }
      }
    })

    return {
      worldType,
      coreRules,
      powerSystem,
      socialStructure
    }
  }

  /**
   * 优化核心记忆以控制Token使用
   */
  optimizeCoreMemory(coreMemory) {
    const optimized = { ...coreMemory }
    
    // 优化角色列表 - 按重要度排序，保留最重要的角色
    if (optimized.characters && optimized.characters.length > 0) {
      optimized.characters = optimized.characters
        .sort((a, b) => (b.importance || 0) - (a.importance || 0))
        .slice(0, 8) // 最多保留8个角色
        .map(char => ({
          ...char,
          keyTraits: char.keyTraits.slice(0, 3) // 每个角色最多3个特征
        }))
    }
    
    // 优化世界观规则
    if (optimized.worldSetting && optimized.worldSetting.coreRules) {
      optimized.worldSetting.coreRules = optimized.worldSetting.coreRules.slice(0, 5)
    }
    
    // 优化主线情节点
    if (optimized.mainPlot && optimized.mainPlot.plotPoints) {
      optimized.mainPlot.plotPoints = optimized.mainPlot.plotPoints.slice(0, 8)
    }
    
    return optimized
  }

  /**
   * 检查记忆一致性
   */
  async checkConsistency(novelMemory, newContent) {
    const issues = []
    
    try {
      // 角色一致性检查
      const characterIssues = await this.checkCharacterConsistency(novelMemory, newContent)
      issues.push(...characterIssues)
      
      // 世界观一致性检查
      const worldIssues = await this.checkWorldConsistency(novelMemory, newContent)
      issues.push(...worldIssues)
      
      // 情节一致性检查
      const plotIssues = await this.checkPlotConsistency(novelMemory, newContent)
      issues.push(...plotIssues)
      
    } catch (error) {
      console.error('一致性检查失败:', error)
    }
    
    return issues
  }

  /**
   * 检查角色一致性
   */
  async checkCharacterConsistency(novelMemory, newContent) {
    const issues = []
    
    if (!novelMemory.coreMemory.characters || novelMemory.coreMemory.characters.length === 0) {
      return issues
    }
    
    try {
      // 使用AI检查角色行为是否与设定一致
      const prompt = `扮演你觉得需要扮演的角色，现在，我想去除这篇文章的AI味，不改变文章的整体面貌，使得这篇文章更加自然流畅。文章如下：

请检查以下新内容中的角色行为是否与角色设定一致：

角色设定：
${novelMemory.coreMemory.characters.map(char => 
  `${char.name}：${char.keyTraits.join('、')} - ${char.currentStatus}`
).join('\n')}

新内容：
${newContent}

请指出任何角色行为与设定不一致的地方，以JSON格式返回：
{
  "issues": [
    {
      "type": "character_inconsistency",
      "character": "角色名",
      "description": "不一致描述",
      "severity": "high/medium/low"
    }
  ]
}
`

      const response = await apiService.generateText(prompt, {
        maxTokens: 500,
        temperature: 0.3,
        type: 'consistency_check'
      })
      
      const result = JSON.parse(response)
      if (result.issues && Array.isArray(result.issues)) {
        issues.push(...result.issues)
      }
    } catch (error) {
      console.error('角色一致性检查失败:', error)
    }
    
    return issues
  }

  /**
   * 检查世界观一致性
   */
  async checkWorldConsistency(novelMemory, newContent) {
    const issues = []
    
    if (!novelMemory.coreMemory.worldSetting.coreRules || 
        novelMemory.coreMemory.worldSetting.coreRules.length === 0) {
      return issues
    }
    
    try {
      const prompt = `扮演你觉得需要扮演的角色，现在，我想去除这篇文章的AI味，不改变文章的整体面貌，使得这篇文章更加自然流畅。文章如下：

请检查以下新内容是否违反了世界观设定：

世界观规则：
${novelMemory.coreMemory.worldSetting.coreRules.join('\n')}

力量体系：${novelMemory.coreMemory.worldSetting.powerSystem}
社会结构：${novelMemory.coreMemory.worldSetting.socialStructure}

新内容：
${newContent}

请指出任何违反世界观的地方，以JSON格式返回：
{
  "issues": [
    {
      "type": "world_inconsistency",
      "rule": "违反的规则",
      "description": "不一致描述",
      "severity": "high/medium/low"
    }
  ]
}
`

      const response = await apiService.generateText(prompt, {
        maxTokens: 500,
        temperature: 0.3,
        type: 'consistency_check'
      })
      
      const result = JSON.parse(response)
      if (result.issues && Array.isArray(result.issues)) {
        issues.push(...result.issues)
      }
    } catch (error) {
      console.error('世界观一致性检查失败:', error)
    }
    
    return issues
  }

  /**
   * 检查情节一致性
   */
  async checkPlotConsistency(novelMemory, newContent) {
    const issues = []
    
    if (!novelMemory.chapterSummaries || novelMemory.chapterSummaries.length === 0) {
      return issues
    }
    
    try {
      // 获取最近的章节摘要
      const recentSummaries = novelMemory.chapterSummaries
        .slice(-5) // 最近5章
        .map(s => `第${s.chapterNumber}章：${s.summary}`)
        .join('\n')
      
      const prompt = `扮演你觉得需要扮演的角色，现在，我想去除这篇文章的AI味，不改变文章的整体面貌，使得这篇文章更加自然流畅。文章如下：

请检查新内容的情节发展是否与前文逻辑一致：

前文情节：
${recentSummaries}

主线冲突：${novelMemory.coreMemory.mainPlot.mainConflict}

新内容：
${newContent}

请指出任何情节逻辑不一致的地方，以JSON格式返回：
{
  "issues": [
    {
      "type": "plot_inconsistency",
      "description": "不一致描述",
      "suggestion": "修改建议",
      "severity": "high/medium/low"
    }
  ]
}
`

      const response = await apiService.generateText(prompt, {
        maxTokens: 500,
        temperature: 0.3,
        type: 'consistency_check'
      })
      
      const result = JSON.parse(response)
      if (result.issues && Array.isArray(result.issues)) {
        issues.push(...result.issues)
      }
    } catch (error) {
      console.error('情节一致性检查失败:', error)
    }
    
    return issues
  }

  /**
   * 更新角色在记忆中的状态
   */
  updateCharacterInMemory(novelMemory, characterId, updates) {
    if (!novelMemory.coreMemory.characters) return
    
    const characterIndex = novelMemory.coreMemory.characters.findIndex(
      char => char.id === characterId
    )
    
    if (characterIndex >= 0) {
      novelMemory.coreMemory.characters[characterIndex] = {
        ...novelMemory.coreMemory.characters[characterIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      }
    }
  }

  /**
   * 从章节内容中自动提取关键信息
   */
  async extractKeyInformation(chapterContent) {
    try {
      const prompt = `扮演你觉得需要扮演的角色，现在，我想去除这篇文章的AI味，不改变文章的整体面貌，使得这篇文章更加自然流畅。文章如下：

请从以下章节内容中提取关键信息：

${chapterContent}

请以JSON格式返回：
{
  "keyEvents": ["关键事件1", "关键事件2"],
  "characterChanges": ["角色变化1", "角色变化2"],
  "newElements": ["新增元素1", "新增元素2"],
  "plotProgress": "情节推进描述",
  "importantDialogue": ["重要对话1", "重要对话2"]
}
`

      const response = await apiService.generateText(prompt, {
        maxTokens: 600,
        temperature: 0.3,
        type: 'information_extraction'
      })
      
      return JSON.parse(response)
    } catch (error) {
      console.error('提取关键信息失败:', error)
      return {
        keyEvents: [],
        characterChanges: [],
        newElements: [],
        plotProgress: '',
        importantDialogue: []
      }
    }
  }

  /**
   * 计算记忆重要度分数
   */
  calculateMemoryImportance(memoryItem, context = {}) {
    let importance = 0.5 // 基础重要度
    
    // 根据类型调整重要度
    if (memoryItem.type === 'character_intro') importance += 0.3
    if (memoryItem.type === 'plot_twist') importance += 0.4
    if (memoryItem.type === 'world_rule') importance += 0.2
    
    // 根据关联角色数量调整
    if (memoryItem.relatedCharacters && memoryItem.relatedCharacters.length > 0) {
      importance += memoryItem.relatedCharacters.length * 0.05
    }
    
    // 根据被引用次数调整
    if (memoryItem.referenceCount) {
      importance += Math.min(0.2, memoryItem.referenceCount * 0.02)
    }
    
    // 根据时间衰减调整
    if (memoryItem.createdAt) {
      const daysSinceCreated = (new Date() - new Date(memoryItem.createdAt)) / (1000 * 60 * 60 * 24)
      const timeDecay = Math.max(0.1, 1 - daysSinceCreated * 0.01)
      importance *= timeDecay
    }
    
    return Math.min(1.0, importance)
  }
}

export default new MemoryService()
