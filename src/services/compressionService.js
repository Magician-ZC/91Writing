import apiService from './api.js'
import memoryService from './memoryService.js'

/**
 * 内容压缩服务
 * 负责将章节内容压缩为结构化摘要，实现高效的记忆管理
 */
class CompressionService {
  constructor() {
    // 压缩配置
    this.targetCompressionRatio = 10 // 目标压缩比 10:1
    this.maxSummaryLength = 150 // 摘要最大字符数
    this.minSummaryLength = 80 // 摘要最小字符数
  }

  /**
   * 将章节内容压缩为结构化摘要
   */
  async compressChapterToSummary(chapterData) {
    try {
      const { title, content, chapterNumber } = chapterData
      
      if (!content || content.length < 50) {
        return this.createEmptySummary(chapterNumber, title)
      }

      // 清理HTML标签
      const cleanContent = content.replace(/<[^>]*>/g, '')
      const originalLength = cleanContent.length

      // 生成AI摘要
      const aiSummary = await this.generateAISummary(cleanContent, title)
      
      // 提取关键信息
      const keyInfo = await this.extractKeyInformation(cleanContent)
      
      // 计算Token成本
      const tokenCost = memoryService.estimateTokens(JSON.stringify(aiSummary))
      
      // 计算重要度评分
      const importance = this.calculateChapterImportance(keyInfo, cleanContent)
      
      return {
        chapterNumber,
        title: title || `第${chapterNumber}章`,
        summary: aiSummary.summary,
        keyEvents: aiSummary.keyEvents || keyInfo.keyEvents,
        characterChanges: aiSummary.characterChanges || keyInfo.characterChanges,
        plotProgress: aiSummary.plotProgress || keyInfo.plotProgress,
        newElements: aiSummary.newElements || keyInfo.newElements,
        importantDialogue: keyInfo.importantDialogue || [],
        importance,
        tokenCost,
        originalLength,
        compressionRatio: Math.round(originalLength / tokenCost * 10) / 10,
        compressed: false,
        compressionLevel: 0
      }
    } catch (error) {
      console.error('章节压缩失败:', error)
      return this.createEmptySummary(chapterData.chapterNumber, chapterData.title)
    }
  }

  /**
   * 生成AI摘要
   */
  async generateAISummary(content, title = '') {
    const prompt = `
请将以下章节内容压缩为${this.minSummaryLength}-${this.maxSummaryLength}字的精要摘要：

章节标题：${title}
章节内容：
${content}

要求：
1. 保留关键情节推进
2. 记录重要角色变化  
3. 标记新增世界观元素
4. 省略细节描写和对话
5. 突出转折点和冲突

请以JSON格式返回：
{
  "summary": "摘要内容(${this.minSummaryLength}-${this.maxSummaryLength}字)",
  "keyEvents": ["事件1", "事件2", "事件3"],
  "characterChanges": ["变化1", "变化2"],
  "plotProgress": "情节推进描述",
  "newElements": ["新元素1", "新元素2"]
}
`

    try {
      const response = await apiService.generateText(prompt, {
        maxTokens: 800,
        temperature: 0.3,
        type: 'content_compression'
      })
      
      const result = JSON.parse(response)
      
      // 验证摘要长度
      if (result.summary && result.summary.length > this.maxSummaryLength) {
        result.summary = this.truncateSummary(result.summary, this.maxSummaryLength)
      }
      
      return result
    } catch (error) {
      console.error('AI摘要生成失败:', error)
      
      // 降级使用简单压缩
      return this.generateSimpleSummary(content, title)
    }
  }

  /**
   * 提取关键信息
   */
  async extractKeyInformation(content) {
    try {
      return await memoryService.extractKeyInformation(content)
    } catch (error) {
      console.error('关键信息提取失败:', error)
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
   * 计算章节重要度
   */
  calculateChapterImportance(keyInfo, content) {
    let importance = 0.5 // 基础重要度

    // 根据关键事件数量调整
    if (keyInfo.keyEvents && keyInfo.keyEvents.length > 0) {
      importance += keyInfo.keyEvents.length * 0.1
    }

    // 根据角色变化调整
    if (keyInfo.characterChanges && keyInfo.characterChanges.length > 0) {
      importance += keyInfo.characterChanges.length * 0.15
    }

    // 根据新元素调整
    if (keyInfo.newElements && keyInfo.newElements.length > 0) {
      importance += keyInfo.newElements.length * 0.1
    }

    // 根据对话数量调整（对话多说明互动丰富）
    const dialogueCount = (content.match(/[""]/g) || []).length / 2
    if (dialogueCount > 5) {
      importance += Math.min(0.2, dialogueCount * 0.02)
    }

    // 根据冲突关键词调整
    const conflictKeywords = ['冲突', '矛盾', '对立', '争执', '战斗', '决战', '危机', '转折']
    const conflictCount = conflictKeywords.reduce((count, keyword) => {
      return count + (content.split(keyword).length - 1)
    }, 0)
    
    if (conflictCount > 0) {
      importance += Math.min(0.3, conflictCount * 0.1)
    }

    // 根据情感关键词调整
    const emotionKeywords = ['爱', '恨', '恐惧', '愤怒', '悲伤', '喜悦', '震惊', '绝望']
    const emotionCount = emotionKeywords.reduce((count, keyword) => {
      return count + (content.split(keyword).length - 1)
    }, 0)
    
    if (emotionCount > 0) {
      importance += Math.min(0.2, emotionCount * 0.05)
    }

    return Math.min(1.0, importance)
  }

  /**
   * 生成简单摘要（降级方案）
   */
  generateSimpleSummary(content, title) {
    // 简单的文本摘要算法
    const sentences = content.split(/[。！？]/).filter(s => s.trim().length > 5)
    
    // 选择重要句子
    const importantSentences = sentences
      .filter(sentence => {
        // 过滤包含关键词的句子
        const keywords = ['突然', '忽然', '决定', '发现', '明白', '意识到', '终于', '却', '但是', '然而']
        return keywords.some(keyword => sentence.includes(keyword))
      })
      .slice(0, 3)

    const summary = importantSentences.length > 0 ? 
      importantSentences.join('。') + '。' : 
      sentences.slice(0, 2).join('。') + '。'

    return {
      summary: this.truncateSummary(summary, this.maxSummaryLength),
      keyEvents: this.extractSimpleEvents(content),
      characterChanges: [],
      plotProgress: '情节继续发展',
      newElements: []
    }
  }

  /**
   * 提取简单事件（降级方案）
   */
  extractSimpleEvents(content) {
    const events = []
    const eventKeywords = ['来到', '遇到', '发现', '决定', '开始', '结束', '获得', '失去']
    
    eventKeywords.forEach(keyword => {
      const matches = content.match(new RegExp(`[^。]*${keyword}[^。]*`, 'g'))
      if (matches) {
        events.push(...matches.slice(0, 1)) // 每个关键词最多一个事件
      }
    })
    
    return events.slice(0, 3).map(event => event.trim().substring(0, 30))
  }

  /**
   * 截断摘要到指定长度
   */
  truncateSummary(summary, maxLength) {
    if (summary.length <= maxLength) return summary
    
    // 在句号处截断
    const truncated = summary.substring(0, maxLength)
    const lastPeriod = Math.max(
      truncated.lastIndexOf('。'),
      truncated.lastIndexOf('！'),
      truncated.lastIndexOf('？')
    )
    
    if (lastPeriod > maxLength * 0.7) {
      return truncated.substring(0, lastPeriod + 1)
    }
    
    return truncated.substring(0, maxLength - 3) + '...'
  }

  /**
   * 进一步压缩摘要（用于旧记忆）
   */
  furtherCompress(summary) {
    if (!summary || summary.length <= 50) return summary
    
    // 移除修饰词和细节描述
    let compressed = summary
      .replace(/非常|十分|极其|相当|特别|格外/g, '')
      .replace(/，[^，。]{1,10}，/g, '，') // 移除短小的插入语
      .replace(/\s+/g, '') // 移除空白字符
    
    // 如果还是太长，进一步截断
    if (compressed.length > 80) {
      compressed = this.truncateSummary(compressed, 80)
    }
    
    return compressed
  }

  /**
   * 批量压缩多个章节
   */
  async compressMultipleChapters(chapters, onProgress = null) {
    const results = []
    
    for (let i = 0; i < chapters.length; i++) {
      try {
        const summary = await this.compressChapterToSummary(chapters[i])
        results.push(summary)
        
        if (onProgress) {
          onProgress(i + 1, chapters.length, summary)
        }
        
        // 添加延迟避免API限制
        if (i < chapters.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      } catch (error) {
        console.error(`压缩第${chapters[i].chapterNumber}章失败:`, error)
        results.push(this.createEmptySummary(chapters[i].chapterNumber, chapters[i].title))
      }
    }
    
    return results
  }

  /**
   * 创建空摘要结构
   */
  createEmptySummary(chapterNumber, title) {
    return {
      chapterNumber,
      title: title || `第${chapterNumber}章`,
      summary: '内容不足，无法生成摘要',
      keyEvents: [],
      characterChanges: [],
      plotProgress: '',
      newElements: [],
      importantDialogue: [],
      importance: 0.1,
      tokenCost: 10,
      originalLength: 0,
      compressionRatio: 0,
      compressed: false,
      compressionLevel: 0
    }
  }

  /**
   * 根据重要度智能调整压缩策略
   */
  getCompressionStrategy(importance) {
    if (importance >= 0.8) {
      return {
        maxSummaryLength: this.maxSummaryLength + 50, // 重要章节允许更长摘要
        includeDialogue: true,
        detailLevel: 'high'
      }
    } else if (importance >= 0.5) {
      return {
        maxSummaryLength: this.maxSummaryLength,
        includeDialogue: false,
        detailLevel: 'medium'
      }
    } else {
      return {
        maxSummaryLength: this.maxSummaryLength - 30, // 不重要章节压缩更多
        includeDialogue: false,
        detailLevel: 'low'
      }
    }
  }

  /**
   * 验证压缩质量
   */
  validateCompressionQuality(original, compressed) {
    const metrics = {
      compressionRatio: original.length / compressed.summary.length,
      informationDensity: (compressed.keyEvents.length + compressed.characterChanges.length) / compressed.summary.length,
      hasKeyElements: compressed.keyEvents.length > 0 || compressed.characterChanges.length > 0,
      qualityScore: 0
    }
    
    // 计算质量分数
    let score = 0.5
    
    if (metrics.compressionRatio >= 8 && metrics.compressionRatio <= 15) score += 0.2
    if (metrics.informationDensity > 0.02) score += 0.1
    if (metrics.hasKeyElements) score += 0.2
    if (compressed.summary.length >= this.minSummaryLength) score += 0.1
    
    metrics.qualityScore = Math.min(1.0, score)
    
    return metrics
  }

  /**
   * 动态调整压缩参数
   */
  adjustCompressionParameters(qualityMetrics) {
    if (qualityMetrics.qualityScore < 0.6) {
      // 质量不佳，调整参数
      if (qualityMetrics.compressionRatio > 15) {
        this.maxSummaryLength += 20 // 增加摘要长度
      }
      if (!qualityMetrics.hasKeyElements) {
        // 需要更好地提取关键元素
        return {
          needsBetterExtraction: true,
          suggestedPromptAdjustment: '更加注重关键事件和角色变化的提取'
        }
      }
    }
    
    return {
      needsBetterExtraction: false,
      currentSettings: {
        maxSummaryLength: this.maxSummaryLength,
        targetCompressionRatio: this.targetCompressionRatio
      }
    }
  }
}

export default new CompressionService()
