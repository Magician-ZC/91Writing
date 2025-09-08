/**
 * 智能写作分析服务
 * 模块3: 智能写作建议系统 - 核心分析引擎
 */

class AnalysisService {
  constructor() {
    this.userProfile = this.loadUserProfile()
    this.analysisHistory = this.loadAnalysisHistory()
  }

  /**
   * 文本质量分析
   * @param {string} content - 待分析的文本内容
   * @param {Object} options - 分析选项
   * @returns {Object} 分析结果
   */
  async analyzeTextQuality(content, options = {}) {
    if (!content || content.trim().length === 0) {
      return this.getEmptyAnalysis()
    }

    const analysis = {
      // 基础指标
      basic: this.analyzeBasicMetrics(content),
      // 可读性分析
      readability: this.analyzeReadability(content),
      // 文风分析
      style: this.analyzeWritingStyle(content),
      // 节奏分析
      rhythm: this.analyzeRhythm(content),
      // 情感分析
      emotion: this.analyzeEmotion(content),
      // 逻辑连贯性
      coherence: this.analyzeCoherence(content),
      // 综合评分
      overallScore: 0,
      // 分析时间
      timestamp: new Date().toISOString()
    }

    // 计算综合评分
    analysis.overallScore = this.calculateOverallScore(analysis)

    // 保存分析历史
    this.saveAnalysisHistory(analysis)

    return analysis
  }

  /**
   * 基础指标分析
   */
  analyzeBasicMetrics(content) {
    const sentences = this.splitIntoSentences(content)
    const paragraphs = this.splitIntoParagraphs(content)
    const words = this.extractWords(content)

    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      avgWordsPerSentence: words.length / sentences.length || 0,
      avgSentencesPerParagraph: sentences.length / paragraphs.length || 0,
      chineseCharCount: (content.match(/[\u4e00-\u9fa5]/g) || []).length,
      punctuationCount: (content.match(/[，。！？；：""''（）]/g) || []).length
    }
  }

  /**
   * 可读性分析
   */
  analyzeReadability(content) {
    const sentences = this.splitIntoSentences(content)
    const words = this.extractWords(content)
    const complexWords = this.findComplexWords(content)
    
    // 计算平均句长
    const avgSentenceLength = words.length / sentences.length || 0
    
    // 计算复杂词汇比例
    const complexWordRatio = complexWords.length / words.length || 0
    
    // 简化版可读性评分 (类似Flesch Reading Ease)
    let readabilityScore = 100 - (avgSentenceLength * 1.5) - (complexWordRatio * 100)
    readabilityScore = Math.max(0, Math.min(100, readabilityScore))
    
    return {
      score: Math.round(readabilityScore),
      level: this.getReadabilityLevel(readabilityScore),
      avgSentenceLength,
      complexWordRatio: Math.round(complexWordRatio * 100),
      complexWords: complexWords.slice(0, 10), // 前10个复杂词汇
      suggestions: this.getReadabilitySuggestions(readabilityScore, avgSentenceLength, complexWordRatio)
    }
  }

  /**
   * 文风分析
   */
  analyzeWritingStyle(content) {
    const styles = {
      narrative: this.analyzeNarrativeStyle(content),    // 叙述性
      descriptive: this.analyzeDescriptiveStyle(content), // 描述性
      dialogue: this.analyzeDialogueStyle(content),      // 对话性
      emotional: this.analyzeEmotionalStyle(content),    // 情感性
      formal: this.analyzeFormalStyle(content)           // 正式性
    }

    // 找出主要文风
    const dominantStyle = Object.entries(styles)
      .sort(([,a], [,b]) => b.score - a.score)[0]

    return {
      styles,
      dominantStyle: {
        type: dominantStyle[0],
        ...dominantStyle[1]
      },
      consistency: this.calculateStyleConsistency(styles),
      suggestions: this.getStyleSuggestions(styles)
    }
  }

  /**
   * 节奏分析
   */
  analyzeRhythm(content) {
    const sentences = this.splitIntoSentences(content)
    const sentenceLengths = sentences.map(s => this.extractWords(s).length)
    
    // 计算节奏变化
    const rhythmVariation = this.calculateVariation(sentenceLengths)
    
    // 检测节奏模式
    const patterns = this.detectRhythmPatterns(sentenceLengths)
    
    return {
      score: Math.round((100 - rhythmVariation * 20)), // 转换为0-100分
      variation: Math.round(rhythmVariation * 100) / 100,
      patterns,
      sentenceLengths,
      suggestions: this.getRhythmSuggestions(rhythmVariation, patterns)
    }
  }

  /**
   * 情感分析
   */
  analyzeEmotion(content) {
    const emotionWords = {
      positive: ['快乐', '幸福', '美好', '成功', '胜利', '爱', '喜欢', '开心', '满意', '温暖', '光明', '希望', '舒适', '安全', '自由'],
      negative: ['悲伤', '痛苦', '失败', '死亡', '恐惧', '愤怒', '绝望', '孤独', '冷漠', '失望', '黑暗', '危险', '痛苦', '折磨', '哭泣'],
      neutral: ['普通', '一般', '平常', '正常', '简单', '清楚', '明白', '知道', '看见', '听见', '想到', '认为', '觉得', '可能', '也许']
    }

    let scores = { positive: 0, negative: 0, neutral: 0 }
    let foundWords = { positive: [], negative: [], neutral: [] }

    // 统计情感词汇
    Object.entries(emotionWords).forEach(([emotion, words]) => {
      words.forEach(word => {
        const matches = (content.match(new RegExp(word, 'g')) || [])
        scores[emotion] += matches.length
        if (matches.length > 0) {
          foundWords[emotion].push({ word, count: matches.length })
        }
      })
    })

    const total = scores.positive + scores.negative + scores.neutral
    const percentages = total > 0 ? {
      positive: Math.round((scores.positive / total) * 100),
      negative: Math.round((scores.negative / total) * 100),
      neutral: Math.round((scores.neutral / total) * 100)
    } : { positive: 33, negative: 33, neutral: 34 }

    // 确定主要情感倾向
    const dominantEmotion = Object.entries(percentages)
      .sort(([,a], [,b]) => b - a)[0][0]

    return {
      scores: percentages,
      dominantEmotion,
      intensity: Math.max(...Object.values(percentages)),
      foundWords,
      suggestions: this.getEmotionSuggestions(percentages, dominantEmotion)
    }
  }

  /**
   * 逻辑连贯性分析
   */
  analyzeCoherence(content) {
    const paragraphs = this.splitIntoParagraphs(content)
    const sentences = this.splitIntoSentences(content)
    
    // 连接词分析
    const connectors = this.analyzeConnectors(content)
    
    // 主题一致性
    const themeConsistency = this.analyzeThemeConsistency(paragraphs)
    
    // 时间逻辑
    const timeLogic = this.analyzeTimeLogic(content)
    
    const coherenceScore = Math.round(
      (connectors.score + themeConsistency.score + timeLogic.score) / 3
    )

    return {
      score: coherenceScore,
      connectors,
      themeConsistency,
      timeLogic,
      suggestions: this.getCoherenceSuggestions(connectors, themeConsistency, timeLogic)
    }
  }

  /**
   * 个性化建议生成
   * @param {Object} analysis - 文本分析结果
   * @param {Object} context - 上下文信息
   * @returns {Array} 个性化建议列表
   */
  generatePersonalizedSuggestions(analysis, context = {}) {
    const suggestions = []

    // 更新用户画像
    this.updateUserProfile(analysis)

    // 基于用户历史的建议
    const historySuggestions = this.generateHistoryBasedSuggestions()
    suggestions.push(...historySuggestions)

    // 基于当前分析的建议
    const analysisSuggestions = this.generateAnalysisBasedSuggestions(analysis)
    suggestions.push(...analysisSuggestions)

    // 基于薄弱环节的建议
    const weaknessSuggestions = this.generateWeaknessSuggestions()
    suggestions.push(...weaknessSuggestions)

    // 按优先级排序
    return this.prioritizeSuggestions(suggestions)
  }

  /**
   * 实时质量评估
   * @param {string} content - 文本内容
   * @returns {Object} 实时评估结果
   */
  async realtimeQualityAssessment(content) {
    if (!content || content.trim().length < 10) {
      return { score: 0, suggestions: [], indicators: {} }
    }

    // 轻量级分析
    const basic = this.analyzeBasicMetrics(content)
    const readability = this.analyzeReadability(content)
    const emotion = this.analyzeEmotion(content)

    // 计算实时评分
    const score = Math.round(
      (readability.score * 0.4 + emotion.intensity * 0.3 + Math.min(basic.wordCount / 100 * 10, 30)) 
    )

    // 生成快速建议
    const suggestions = this.generateQuickSuggestions(basic, readability, emotion)

    return {
      score: Math.min(score, 100),
      suggestions,
      indicators: {
        wordCount: basic.wordCount,
        readability: readability.score,
        emotion: emotion.dominantEmotion
      }
    }
  }

  // ====== 辅助方法 ======

  splitIntoSentences(content) {
    return content.split(/[。！？.!?]/).filter(s => s.trim().length > 0)
  }

  splitIntoParagraphs(content) {
    return content.split(/\n\s*\n/).filter(p => p.trim().length > 0)
  }

  extractWords(content) {
    // 提取中文词汇和英文单词
    const chineseWords = content.match(/[\u4e00-\u9fa5]+/g) || []
    const englishWords = content.match(/[a-zA-Z]+/g) || []
    return [...chineseWords, ...englishWords]
  }

  findComplexWords(content) {
    const complexPatterns = [
      /[\u4e00-\u9fa5]{4,}/g, // 4字以上的中文词汇
      /[a-zA-Z]{8,}/g        // 8字母以上的英文单词
    ]
    
    let complexWords = []
    complexPatterns.forEach(pattern => {
      const matches = content.match(pattern) || []
      complexWords.push(...matches)
    })
    
    return [...new Set(complexWords)] // 去重
  }

  getReadabilityLevel(score) {
    if (score >= 80) return '非常易读'
    if (score >= 60) return '较易读'
    if (score >= 40) return '一般'
    if (score >= 20) return '较难读'
    return '很难读'
  }

  getReadabilitySuggestions(score, avgLength, complexRatio) {
    const suggestions = []
    
    if (score < 50) {
      if (avgLength > 20) {
        suggestions.push('建议缩短句子长度，提高可读性')
      }
      if (complexRatio > 0.3) {
        suggestions.push('建议减少复杂词汇的使用')
      }
    }
    
    return suggestions
  }

  analyzeNarrativeStyle(content) {
    const narrativeWords = ['然后', '接着', '后来', '于是', '突然', '忽然', '刚刚', '正在', '已经']
    const count = this.countWordsInContent(content, narrativeWords)
    const score = Math.min(count * 5, 100)
    
    return { score, indicators: narrativeWords.filter(w => content.includes(w)) }
  }

  analyzeDescriptiveStyle(content) {
    const descriptiveWords = ['美丽', '巨大', '细小', '明亮', '昏暗', '温暖', '寒冷', '柔软', '坚硬', '清香']
    const count = this.countWordsInContent(content, descriptiveWords)
    const score = Math.min(count * 3, 100)
    
    return { score, indicators: descriptiveWords.filter(w => content.includes(w)) }
  }

  analyzeDialogueStyle(content) {
    const dialogueMarkers = content.match(/["'""''「」『』]/g) || []
    const score = Math.min(dialogueMarkers.length * 2, 100)
    
    return { score, indicators: [`对话标记: ${dialogueMarkers.length}个`] }
  }

  analyzeEmotionalStyle(content) {
    const emotionalWords = ['激动', '兴奋', '愤怒', '悲伤', '快乐', '紧张', '放松', '焦虑', '平静', '热情']
    const count = this.countWordsInContent(content, emotionalWords)
    const score = Math.min(count * 4, 100)
    
    return { score, indicators: emotionalWords.filter(w => content.includes(w)) }
  }

  analyzeFormalStyle(content) {
    const formalWords = ['因此', '然而', '此外', '综上所述', '总而言之', '具体而言', '例如', '比如说', '换言之', '也就是说']
    const count = this.countWordsInContent(content, formalWords)
    const score = Math.min(count * 6, 100)
    
    return { score, indicators: formalWords.filter(w => content.includes(w)) }
  }

  countWordsInContent(content, words) {
    return words.reduce((count, word) => {
      const matches = content.match(new RegExp(word, 'g')) || []
      return count + matches.length
    }, 0)
  }

  calculateStyleConsistency(styles) {
    const scores = Object.values(styles).map(s => s.score)
    const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / scores.length
    return Math.max(0, 100 - Math.sqrt(variance))
  }

  getStyleSuggestions(styles) {
    const suggestions = []
    const sortedStyles = Object.entries(styles).sort(([,a], [,b]) => b.score - a.score)
    
    if (sortedStyles[0][1].score < 30) {
      suggestions.push('建议增强文章的表达风格，可以尝试更多的描述性语言')
    }
    
    return suggestions
  }

  calculateVariation(values) {
    if (values.length < 2) return 0
    
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length
    return Math.sqrt(variance) / avg
  }

  detectRhythmPatterns(lengths) {
    // 简单的节奏模式检测
    const patterns = []
    
    // 检测渐进模式
    let increasing = 0, decreasing = 0
    for (let i = 1; i < lengths.length; i++) {
      if (lengths[i] > lengths[i-1]) increasing++
      else if (lengths[i] < lengths[i-1]) decreasing++
    }
    
    if (increasing > lengths.length * 0.7) patterns.push('递增节奏')
    if (decreasing > lengths.length * 0.7) patterns.push('递减节奏')
    if (patterns.length === 0) patterns.push('变化节奏')
    
    return patterns
  }

  getRhythmSuggestions(variation, patterns) {
    const suggestions = []
    
    if (variation < 0.1) {
      suggestions.push('句子长度过于单调，建议增加节奏变化')
    } else if (variation > 0.8) {
      suggestions.push('句子长度变化过大，建议保持相对稳定的节奏')
    }
    
    return suggestions
  }

  getEmotionSuggestions(percentages, dominantEmotion) {
    const suggestions = []
    
    if (percentages.neutral > 70) {
      suggestions.push('文章情感色彩较淡，可以增加更多情感表达')
    }
    
    if (dominantEmotion === 'negative' && percentages.negative > 80) {
      suggestions.push('负面情感较重，可以适当平衡情感表达')
    }
    
    return suggestions
  }

  analyzeConnectors(content) {
    const connectors = ['因此', '然而', '但是', '而且', '此外', '另外', '首先', '其次', '最后', '总之']
    const found = connectors.filter(c => content.includes(c))
    const score = Math.min(found.length * 10, 100)
    
    return { score, found, suggestions: score < 30 ? ['建议增加逻辑连接词'] : [] }
  }

  analyzeThemeConsistency(paragraphs) {
    // 简化的主题一致性分析
    const score = paragraphs.length > 1 ? 
      Math.max(60, 100 - (paragraphs.length - 1) * 5) : 80
    
    return { 
      score, 
      suggestions: score < 60 ? ['注意保持段落间的主题连贯性'] : [] 
    }
  }

  analyzeTimeLogic(content) {
    const timeWords = ['之前', '之后', '同时', '然后', '接着', '最后', '开始', '结束']
    const found = timeWords.filter(w => content.includes(w))
    const score = Math.min(found.length * 15, 100)
    
    return { 
      score, 
      found, 
      suggestions: score < 40 ? ['建议增加时间逻辑词汇'] : [] 
    }
  }

  getCoherenceSuggestions(connectors, theme, time) {
    const suggestions = []
    
    if (connectors.score < 30) suggestions.push(...connectors.suggestions)
    if (theme.score < 60) suggestions.push(...theme.suggestions)
    if (time.score < 40) suggestions.push(...time.suggestions)
    
    return suggestions
  }

  calculateOverallScore(analysis) {
    const weights = {
      readability: 0.25,
      style: 0.20,
      rhythm: 0.15,
      emotion: 0.20,
      coherence: 0.20
    }
    
    let totalScore = 0
    totalScore += analysis.readability.score * weights.readability
    totalScore += analysis.style.dominantStyle.score * weights.style
    totalScore += analysis.rhythm.score * weights.rhythm
    totalScore += analysis.emotion.intensity * weights.emotion
    totalScore += analysis.coherence.score * weights.coherence
    
    return Math.round(totalScore)
  }

  getEmptyAnalysis() {
    return {
      basic: { wordCount: 0, sentenceCount: 0, paragraphCount: 0 },
      readability: { score: 0, level: '无内容', suggestions: [] },
      style: { dominantStyle: { type: 'none', score: 0 }, suggestions: [] },
      rhythm: { score: 0, suggestions: [] },
      emotion: { dominantEmotion: 'neutral', intensity: 0, suggestions: [] },
      coherence: { score: 0, suggestions: [] },
      overallScore: 0,
      timestamp: new Date().toISOString()
    }
  }

  // 用户画像相关方法
  loadUserProfile() {
    try {
      const saved = localStorage.getItem('userWritingProfile')
      return saved ? JSON.parse(saved) : this.getDefaultUserProfile()
    } catch (error) {
      console.error('加载用户画像失败:', error)
      return this.getDefaultUserProfile()
    }
  }

  getDefaultUserProfile() {
    return {
      writingHabits: {
        avgWordCount: 0,
        preferredStyle: 'mixed',
        weaknesses: [],
        strengths: []
      },
      preferences: {
        formalityLevel: 'medium',
        emotionalIntensity: 'medium',
        complexityLevel: 'medium'
      },
      improvementAreas: [],
      lastUpdated: new Date().toISOString()
    }
  }

  updateUserProfile(analysis) {
    // 更新写作习惯统计
    this.userProfile.writingHabits.avgWordCount = 
      (this.userProfile.writingHabits.avgWordCount + analysis.basic.wordCount) / 2

    // 识别薄弱环节
    this.identifyWeaknesses(analysis)

    // 保存更新的画像
    this.saveUserProfile()
  }

  identifyWeaknesses(analysis) {
    const weaknesses = []
    
    if (analysis.readability.score < 50) weaknesses.push('readability')
    if (analysis.rhythm.score < 50) weaknesses.push('rhythm')
    if (analysis.coherence.score < 50) weaknesses.push('coherence')
    if (analysis.emotion.intensity < 30) weaknesses.push('emotion')
    
    this.userProfile.writingHabits.weaknesses = [...new Set([
      ...this.userProfile.writingHabits.weaknesses,
      ...weaknesses
    ])]
  }

  saveUserProfile() {
    try {
      localStorage.setItem('userWritingProfile', JSON.stringify(this.userProfile))
    } catch (error) {
      console.error('保存用户画像失败:', error)
    }
  }

  // 分析历史相关方法
  loadAnalysisHistory() {
    try {
      const saved = localStorage.getItem('analysisHistory')
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error('加载分析历史失败:', error)
      return []
    }
  }

  saveAnalysisHistory(analysis) {
    this.analysisHistory.unshift(analysis)
    // 只保留最近50次分析
    this.analysisHistory = this.analysisHistory.slice(0, 50)
    
    try {
      localStorage.setItem('analysisHistory', JSON.stringify(this.analysisHistory))
    } catch (error) {
      console.error('保存分析历史失败:', error)
    }
  }

  generateHistoryBasedSuggestions() {
    const suggestions = []
    
    if (this.analysisHistory.length < 3) {
      return suggestions
    }

    // 分析最近几次的趋势
    const recentAnalyses = this.analysisHistory.slice(0, 5)
    const avgScore = recentAnalyses.reduce((sum, a) => sum + a.overallScore, 0) / recentAnalyses.length
    
    if (avgScore < 60) {
      suggestions.push({
        type: 'improvement',
        priority: 'high',
        title: '写作水平提升建议',
        content: '根据您最近的写作分析，建议重点关注文章结构和语言表达',
        actionable: true
      })
    }
    
    return suggestions
  }

  generateAnalysisBasedSuggestions(analysis) {
    const suggestions = []
    
    // 基于各项分析结果生成建议
    if (analysis.readability.score < 60) {
      suggestions.push({
        type: 'readability',
        priority: 'medium',
        title: '提高可读性',
        content: '建议简化句子结构，减少复杂词汇的使用',
        actionable: true
      })
    }
    
    if (analysis.emotion.intensity < 40) {
      suggestions.push({
        type: 'emotion',
        priority: 'medium',
        title: '增强情感表达',
        content: '文章情感色彩较淡，可以增加更多情感词汇和表达',
        actionable: true
      })
    }
    
    return suggestions
  }

  generateWeaknessSuggestions() {
    const suggestions = []
    const weaknesses = this.userProfile.writingHabits.weaknesses
    
    weaknesses.forEach(weakness => {
      switch (weakness) {
        case 'readability':
          suggestions.push({
            type: 'weakness',
            priority: 'high',
            title: '改善可读性',
            content: '这是您的薄弱环节。建议多练习简洁明了的表达方式',
            actionable: true
          })
          break
        case 'rhythm':
          suggestions.push({
            type: 'weakness',
            priority: 'medium',
            title: '提升写作节奏',
            content: '注意句子长短搭配，创造更好的阅读节奏',
            actionable: true
          })
          break
      }
    })
    
    return suggestions
  }

  prioritizeSuggestions(suggestions) {
    const priority = { high: 3, medium: 2, low: 1 }
    
    return suggestions.sort((a, b) => {
      return priority[b.priority] - priority[a.priority]
    }).slice(0, 10) // 最多返回10条建议
  }

  generateQuickSuggestions(basic, readability, emotion) {
    const suggestions = []
    
    if (basic.wordCount < 50) {
      suggestions.push('内容较短，可以增加更多细节描述')
    }
    
    if (readability.score < 50) {
      suggestions.push('建议简化语言表达，提高可读性')
    }
    
    if (emotion.intensity < 30) {
      suggestions.push('可以增加更多情感色彩')
    }
    
    return suggestions
  }
}

// 创建单例实例
const analysisService = new AnalysisService()

export default analysisService
