import memoryService from './memoryService.js'

/**
 * 上下文服务
 * 负责智能构建AI生成所需的上下文，优化Token使用
 */
class ContextService {
  constructor() {
    // 上下文构建配置
    this.maxContextTokens = 3000
    this.coreMemoryTokens = 500
    this.summaryTokens = 1000
    this.recentContentTokens = 1200
    this.currentChapterTokens = 300
  }

  /**
   * 构建最优上下文
   */
  async buildOptimalContext(coreMemory, chapterSummaries, currentChapter, maxTokens = 3000) {
    try {
      this.maxContextTokens = maxTokens
      
      const context = {
        essential: this.buildEssentialContext(coreMemory),
        relevant: await this.selectRelevantSummaries(chapterSummaries, currentChapter),
        recent: this.getRecentContent(chapterSummaries, currentChapter),
        current: this.getCurrentChapterInfo(currentChapter),
        tokenUsage: {
          total: 0,
          essential: 0,
          relevant: 0,
          recent: 0,
          current: 0
        }
      }
      
      // 计算Token使用量
      context.tokenUsage.essential = this.calculateTokenUsage(context.essential)
      context.tokenUsage.relevant = this.calculateTokenUsage(context.relevant)
      context.tokenUsage.recent = this.calculateTokenUsage(context.recent)
      context.tokenUsage.current = this.calculateTokenUsage(context.current)
      context.tokenUsage.total = context.tokenUsage.essential + context.tokenUsage.relevant + 
                                 context.tokenUsage.recent + context.tokenUsage.current
      
      // 如果超出限制，进行优化
      if (context.tokenUsage.total > maxTokens) {
        context = this.optimizeContextTokenUsage(context, maxTokens)
      }
      
      return context
    } catch (error) {
      console.error('构建上下文失败:', error)
      return this.createEmptyContext()
    }
  }

  /**
   * 构建核心上下文（永久记忆）
   */
  buildEssentialContext(coreMemory) {
    if (!coreMemory) return {}
    
    return {
      characters: this.compactCharacters(coreMemory.characters || []),
      worldSetting: this.compactWorldSetting(coreMemory.worldSetting || {}),
      mainPlot: this.compactMainPlot(coreMemory.mainPlot || {})
    }
  }

  /**
   * 压缩角色信息
   */
  compactCharacters(characters) {
    return characters
      .sort((a, b) => (b.importance || 0) - (a.importance || 0))
      .slice(0, 6) // 最多6个主要角色
      .map(char => ({
        name: char.name,
        role: char.role,
        traits: char.keyTraits ? char.keyTraits.slice(0, 2) : [], // 最多2个特征
        status: char.currentStatus
      }))
  }

  /**
   * 压缩世界观信息
   */
  compactWorldSetting(worldSetting) {
    return {
      type: worldSetting.worldType || '',
      rules: worldSetting.coreRules ? worldSetting.coreRules.slice(0, 3) : [], // 最多3个核心规则
      power: worldSetting.powerSystem || '',
      society: worldSetting.socialStructure || ''
    }
  }

  /**
   * 压缩主线情节信息
   */
  compactMainPlot(mainPlot) {
    return {
      premise: mainPlot.premise || '',
      conflict: mainPlot.mainConflict || '',
      arc: mainPlot.currentArc || '',
      points: mainPlot.plotPoints ? mainPlot.plotPoints.slice(0, 4) : [] // 最多4个情节点
    }
  }

  /**
   * 选择相关章节摘要
   */
  async selectRelevantSummaries(chapterSummaries, currentChapter) {
    if (!chapterSummaries || chapterSummaries.length === 0) return []
    
    const currentChapterNum = typeof currentChapter === 'number' ? currentChapter : currentChapter?.chapterNumber || 0
    
    // 按相关性评分排序
    const scoredSummaries = chapterSummaries.map(summary => ({
      ...summary,
      relevanceScore: this.calculateRelevanceScore(summary, currentChapterNum)
    }))
    
    return scoredSummaries
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 8) // 最多8个相关章节
      .map(summary => ({
        chapter: summary.chapterNumber,
        title: summary.title,
        summary: summary.summary,
        events: summary.keyEvents ? summary.keyEvents.slice(0, 2) : [],
        importance: summary.importance || 0.5
      }))
  }

  /**
   * 计算章节相关性评分
   */
  calculateRelevanceScore(summary, currentChapterNum) {
    let score = summary.importance || 0.5
    
    // 距离因子：距离当前章节越近，相关性越高
    const distance = Math.abs(summary.chapterNumber - currentChapterNum)
    const distanceFactor = Math.max(0.1, 1 - distance * 0.1)
    score *= distanceFactor
    
    // 重要度因子
    score *= (summary.importance || 0.5)
    
    // 特殊章节加分
    if (summary.title && (
      summary.title.includes('初遇') || 
      summary.title.includes('决战') || 
      summary.title.includes('转折') ||
      summary.title.includes('秘密')
    )) {
      score += 0.2
    }
    
    // 关键事件加分
    if (summary.keyEvents && summary.keyEvents.length > 2) {
      score += 0.1
    }
    
    // 角色变化加分
    if (summary.characterChanges && summary.characterChanges.length > 0) {
      score += 0.15
    }
    
    return Math.min(1.0, score)
  }

  /**
   * 获取最近内容
   */
  getRecentContent(chapterSummaries, currentChapter) {
    if (!chapterSummaries || chapterSummaries.length === 0) return []
    
    const currentChapterNum = typeof currentChapter === 'number' ? currentChapter : currentChapter?.chapterNumber || 0
    
    // 获取最近3章的详细内容
    return chapterSummaries
      .filter(summary => summary.chapterNumber < currentChapterNum)
      .sort((a, b) => b.chapterNumber - a.chapterNumber)
      .slice(0, 3)
      .map(summary => ({
        chapter: summary.chapterNumber,
        summary: summary.summary,
        events: summary.keyEvents || [],
        changes: summary.characterChanges || [],
        progress: summary.plotProgress || ''
      }))
  }

  /**
   * 获取当前章节信息
   */
  getCurrentChapterInfo(currentChapter) {
    if (!currentChapter) return {}
    
    if (typeof currentChapter === 'number') {
      return { chapterNumber: currentChapter }
    }
    
    return {
      chapterNumber: currentChapter.chapterNumber || 0,
      title: currentChapter.title || '',
      outline: currentChapter.outline || '',
      notes: currentChapter.notes || ''
    }
  }

  /**
   * 计算Token使用量
   */
  calculateTokenUsage(contextPart) {
    if (!contextPart) return 0
    
    const text = typeof contextPart === 'string' ? 
      contextPart : 
      JSON.stringify(contextPart)
    
    return memoryService.estimateTokens(text)
  }

  /**
   * 优化上下文Token使用
   */
  optimizeContextTokenUsage(context, maxTokens) {
    const optimized = { ...context }
    let currentUsage = context.tokenUsage.total
    
    // 按优先级压缩
    if (currentUsage > maxTokens) {
      // 1. 压缩相关摘要
      if (optimized.relevant.length > 0) {
        const targetRelevantTokens = Math.floor(maxTokens * 0.3)
        optimized.relevant = this.compressRelevantSummaries(optimized.relevant, targetRelevantTokens)
        optimized.tokenUsage.relevant = this.calculateTokenUsage(optimized.relevant)
      }
      
      // 2. 压缩最近内容
      if (optimized.recent.length > 0) {
        const targetRecentTokens = Math.floor(maxTokens * 0.35)
        optimized.recent = this.compressRecentContent(optimized.recent, targetRecentTokens)
        optimized.tokenUsage.recent = this.calculateTokenUsage(optimized.recent)
      }
      
      // 3. 压缩核心记忆（最后手段）
      const remainingTokens = maxTokens - optimized.tokenUsage.relevant - 
                             optimized.tokenUsage.recent - optimized.tokenUsage.current
      
      if (remainingTokens < optimized.tokenUsage.essential) {
        optimized.essential = this.compressEssentialContext(optimized.essential, remainingTokens)
        optimized.tokenUsage.essential = this.calculateTokenUsage(optimized.essential)
      }
      
      // 重新计算总Token使用量
      optimized.tokenUsage.total = optimized.tokenUsage.essential + optimized.tokenUsage.relevant + 
                                  optimized.tokenUsage.recent + optimized.tokenUsage.current
    }
    
    return optimized
  }

  /**
   * 压缩相关摘要
   */
  compressRelevantSummaries(relevantSummaries, targetTokens) {
    if (!relevantSummaries || relevantSummaries.length === 0) return []
    
    // 按重要度排序，保留最重要的
    const sorted = relevantSummaries.sort((a, b) => (b.importance || 0) - (a.importance || 0))
    
    let currentTokens = 0
    const compressed = []
    
    for (const summary of sorted) {
      const summaryTokens = this.calculateTokenUsage(summary)
      
      if (currentTokens + summaryTokens <= targetTokens) {
        compressed.push(summary)
        currentTokens += summaryTokens
      } else if (compressed.length === 0) {
        // 至少保留一个，即使超出限制
        compressed.push({
          ...summary,
          summary: summary.summary.substring(0, 50) + '...',
          events: summary.events.slice(0, 1)
        })
        break
      } else {
        break
      }
    }
    
    return compressed
  }

  /**
   * 压缩最近内容
   */
  compressRecentContent(recentContent, targetTokens) {
    if (!recentContent || recentContent.length === 0) return []
    
    let currentTokens = 0
    const compressed = []
    
    for (const content of recentContent) {
      const compressedContent = {
        chapter: content.chapter,
        summary: content.summary.length > 60 ? content.summary.substring(0, 60) + '...' : content.summary,
        events: content.events.slice(0, 2), // 最多2个事件
        changes: content.changes.slice(0, 1), // 最多1个变化
        progress: content.progress.length > 30 ? content.progress.substring(0, 30) + '...' : content.progress
      }
      
      const contentTokens = this.calculateTokenUsage(compressedContent)
      
      if (currentTokens + contentTokens <= targetTokens) {
        compressed.push(compressedContent)
        currentTokens += contentTokens
      } else {
        break
      }
    }
    
    return compressed
  }

  /**
   * 压缩核心上下文
   */
  compressEssentialContext(essentialContext, targetTokens) {
    const compressed = {
      characters: essentialContext.characters.slice(0, 4).map(char => ({
        name: char.name,
        role: char.role,
        traits: char.traits.slice(0, 1) // 只保留1个特征
      })),
      worldSetting: {
        type: essentialContext.worldSetting.type,
        rules: essentialContext.worldSetting.rules.slice(0, 2), // 只保留2个规则
        power: essentialContext.worldSetting.power,
        society: '' // 移除社会结构
      },
      mainPlot: {
        conflict: essentialContext.mainPlot.conflict,
        arc: essentialContext.mainPlot.arc,
        points: essentialContext.mainPlot.points.slice(0, 2) // 只保留2个情节点
      }
    }
    
    return compressed
  }

  /**
   * 查找相关摘要
   */
  async findRelevantSummaries(chapterSummaries, currentContent, limit = 5) {
    if (!chapterSummaries || chapterSummaries.length === 0) return []
    
    try {
      // 提取当前内容的关键词
      const keywords = await this.extractContentKeywords(currentContent)
      
      // 基于关键词计算相似度
      const scoredSummaries = chapterSummaries.map(summary => ({
        ...summary,
        similarity: this.calculateContentSimilarity(summary, keywords)
      }))
      
      return scoredSummaries
        .filter(summary => summary.similarity > 0.1)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
    } catch (error) {
      console.error('查找相关摘要失败:', error)
      return chapterSummaries.slice(-limit) // 降级返回最近的摘要
    }
  }

  /**
   * 提取内容关键词
   */
  async extractContentKeywords(content) {
    // 简单的关键词提取（可以用AI优化）
    const keywords = memoryService.extractKeywords(content, 10)
    return keywords
  }

  /**
   * 计算内容相似度
   */
  calculateContentSimilarity(summary, keywords) {
    if (!summary.summary || keywords.length === 0) return 0
    
    let matchCount = 0
    const summaryText = summary.summary + ' ' + (summary.keyEvents || []).join(' ')
    
    keywords.forEach(keyword => {
      if (summaryText.includes(keyword)) {
        matchCount++
      }
    })
    
    // 基础相似度
    let similarity = matchCount / keywords.length
    
    // 考虑章节重要度
    similarity *= (summary.importance || 0.5)
    
    return similarity
  }

  /**
   * 格式化上下文为生成提示
   */
  formatContextForGeneration(context) {
    let prompt = ''
    
    // 核心设定
    if (context.essential) {
      prompt += '【核心设定】\n'
      
      if (context.essential.characters && context.essential.characters.length > 0) {
        prompt += '主要角色：\n'
        context.essential.characters.forEach(char => {
          prompt += `- ${char.name}（${char.role}）：${char.traits.join('、')} - ${char.status}\n`
        })
      }
      
      if (context.essential.worldSetting) {
        const world = context.essential.worldSetting
        if (world.type) prompt += `世界类型：${world.type}\n`
        if (world.power) prompt += `力量体系：${world.power}\n`
        if (world.rules && world.rules.length > 0) {
          prompt += `核心规则：${world.rules.join('、')}\n`
        }
      }
      
      if (context.essential.mainPlot) {
        const plot = context.essential.mainPlot
        if (plot.conflict) prompt += `主要冲突：${plot.conflict}\n`
        if (plot.arc) prompt += `当前故事弧：${plot.arc}\n`
      }
      
      prompt += '\n'
    }
    
    // 相关历史
    if (context.relevant && context.relevant.length > 0) {
      prompt += '【相关历史】\n'
      context.relevant.forEach(rel => {
        prompt += `第${rel.chapter}章：${rel.summary}\n`
        if (rel.events && rel.events.length > 0) {
          prompt += `关键事件：${rel.events.join('、')}\n`
        }
      })
      prompt += '\n'
    }
    
    // 最近内容
    if (context.recent && context.recent.length > 0) {
      prompt += '【最近情节】\n'
      context.recent.forEach(recent => {
        prompt += `第${recent.chapter}章：${recent.summary}\n`
        if (recent.progress) prompt += `情节推进：${recent.progress}\n`
      })
      prompt += '\n'
    }
    
    // 当前章节
    if (context.current && context.current.chapterNumber) {
      prompt += '【当前章节】\n'
      if (context.current.title) prompt += `标题：${context.current.title}\n`
      if (context.current.outline) prompt += `大纲：${context.current.outline}\n`
      if (context.current.notes) prompt += `创作笔记：${context.current.notes}\n`
    }
    
    return prompt
  }

  /**
   * 创建空上下文
   */
  createEmptyContext() {
    return {
      essential: {},
      relevant: [],
      recent: [],
      current: {},
      tokenUsage: {
        total: 0,
        essential: 0,
        relevant: 0,
        recent: 0,
        current: 0
      }
    }
  }

  /**
   * 验证上下文质量
   */
  validateContextQuality(context) {
    const metrics = {
      hasEssential: Object.keys(context.essential || {}).length > 0,
      hasRelevant: (context.relevant || []).length > 0,
      hasRecent: (context.recent || []).length > 0,
      tokenEfficiency: 0,
      qualityScore: 0
    }
    
    // 计算Token效率
    const totalTokens = context.tokenUsage?.total || 0
    const contentItems = (context.relevant?.length || 0) + (context.recent?.length || 0) + 
                        (Object.keys(context.essential || {}).length)
    
    metrics.tokenEfficiency = contentItems > 0 ? totalTokens / contentItems : 0
    
    // 计算质量分数
    let score = 0
    if (metrics.hasEssential) score += 0.4
    if (metrics.hasRelevant) score += 0.3
    if (metrics.hasRecent) score += 0.2
    if (totalTokens > 0 && totalTokens <= this.maxContextTokens) score += 0.1
    
    metrics.qualityScore = score
    
    return metrics
  }
}

export default new ContextService()
