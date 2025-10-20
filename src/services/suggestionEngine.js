/**
 * 智能建议引擎
 * 模块3: 智能写作建议系统 - 个性化建议生成
 */

import analysisService from './analysisService.js'
import backendApi from './backendApi.js'
import apiManager from './apiManager.js'

class SuggestionEngine {
  constructor() {
    this.suggestionTemplates = this.initializeSuggestionTemplates()
    this.userInteractions = this.loadUserInteractions()
    
    // 云端建议配置 - 默认启用
    this.useCloudSuggestions = true
  }

  /**
   * 生成实时写作建议
   * @param {string} content - 当前文本内容
   * @param {Object} context - 写作上下文
   * @returns {Array} 建议列表
   */
  async generateRealtimeSuggestions(content, context = {}) {
    if (!content || content.trim().length < 5) {
      return this.getWelcomeSuggestions()
    }

    // 如果启用云端建议且有novelId，使用云端AI生成
    if (this.useCloudSuggestions && context.novelId) {
      try {
        const response = await apiManager.generateSuggestions({
          novelId: context.novelId,
          chapterId: context.chapterId,
          content: content,
          context: context
        })
        
        if (response.success && response.data.suggestions) {
          return response.data.suggestions
        }
      } catch (error) {
        console.error('云端建议生成失败，使用本地模式:', error)
        // 降级到本地生成
      }
    }

    // 本地生成模式（降级或未启用云端）
    // 获取实时分析结果
    const analysis = await analysisService.realtimeQualityAssessment(content)
    
    // 生成各类建议
    const suggestions = []
    
    // 基础写作建议
    const basicSuggestions = this.generateBasicSuggestions(content, analysis)
    suggestions.push(...basicSuggestions)
    
    // 质量改进建议
    const qualitySuggestions = this.generateQualitySuggestions(analysis)
    suggestions.push(...qualitySuggestions)
    
    // 风格建议
    const styleSuggestions = this.generateStyleSuggestions(content, context)
    suggestions.push(...styleSuggestions)
    
    // 个性化建议
    const personalizedSuggestions = this.generatePersonalizedSuggestions(content, context)
    suggestions.push(...personalizedSuggestions)
    
    // 智能优化建议
    const optimizationSuggestions = await this.generateOptimizationSuggestions(content)
    suggestions.push(...optimizationSuggestions)

    return this.rankAndFilterSuggestions(suggestions)
  }

  /**
   * 生成深度写作建议
   * @param {string} content - 文本内容
   * @param {Object} fullAnalysis - 完整分析结果
   * @returns {Array} 深度建议列表
   */
  async generateDeepSuggestions(content, fullAnalysis) {
    const suggestions = []
    
    // 结构优化建议
    const structureSuggestions = this.generateStructureSuggestions(fullAnalysis)
    suggestions.push(...structureSuggestions)
    
    // 语言表达建议
    const languageSuggestions = this.generateLanguageSuggestions(fullAnalysis)
    suggestions.push(...languageSuggestions)
    
    // 情节发展建议
    const plotSuggestions = this.generatePlotSuggestions(content, fullAnalysis)
    suggestions.push(...plotSuggestions)
    
    // 角色塑造建议
    const characterSuggestions = this.generateCharacterSuggestions(content)
    suggestions.push(...characterSuggestions)
    
    // 对话改进建议
    const dialogueSuggestions = this.generateDialogueSuggestions(content)
    suggestions.push(...dialogueSuggestions)

    return this.rankAndFilterSuggestions(suggestions, { maxCount: 15, includeComplex: true })
  }

  /**
   * 生成基础写作建议
   */
  generateBasicSuggestions(content, analysis) {
    const suggestions = []
    const wordCount = analysis.indicators.wordCount || 0

    // 字数相关建议
    if (wordCount < 50) {
      suggestions.push(this.createSuggestion({
        id: 'word_count_low',
        type: 'basic',
        priority: 'medium',
        title: '增加内容',
        content: '内容较少，可以增加更多细节描述、人物对话或环境描写',
        icon: '📝',
        actionable: true,
        actions: [
          { text: '添加描述', action: 'add_description' },
          { text: '扩展对话', action: 'expand_dialogue' }
        ]
      }))
    } else if (wordCount > 2000) {
      suggestions.push(this.createSuggestion({
        id: 'word_count_high',
        type: 'basic',
        priority: 'low',
        title: '考虑分段',
        content: '内容较长，建议分章节或段落，提高阅读体验',
        icon: '📄',
        actionable: true,
        actions: [
          { text: '插入分段', action: 'add_break' },
          { text: '添加小标题', action: 'add_subtitle' }
        ]
      }))
    }

    // 可读性建议
    if (analysis.indicators.readability < 60) {
      suggestions.push(this.createSuggestion({
        id: 'readability_improve',
        type: 'basic',
        priority: 'high',
        title: '提高可读性',
        content: '文章较难阅读，建议简化句子结构，使用更常见的词汇',
        icon: '👁️',
        actionable: true,
        actions: [
          { text: '简化句子', action: 'simplify_sentence' },
          { text: '替换词汇', action: 'replace_complex_words' }
        ]
      }))
    }

    return suggestions
  }

  /**
   * 生成质量改进建议
   */
  generateQualitySuggestions(analysis) {
    const suggestions = []
    
    if (analysis.score < 60) {
      suggestions.push(this.createSuggestion({
        id: 'quality_overall',
        type: 'quality',
        priority: 'high',
        title: '整体质量提升',
        content: '文章质量有提升空间，建议关注语言表达和逻辑结构',
        icon: '⭐',
        actionable: true,
        actions: [
          { text: '语言润色', action: 'polish_language' },
          { text: '结构调整', action: 'adjust_structure' }
        ]
      }))
    }

    // 情感表达建议
    if (analysis.indicators.emotion === 'neutral') {
      suggestions.push(this.createSuggestion({
        id: 'emotion_enhance',
        type: 'quality',
        priority: 'medium',
        title: '增强情感表达',
        content: '文章情感色彩较淡，可以增加更多情感词汇和表达技巧',
        icon: '💖',
        actionable: true,
        actions: [
          { text: '添加情感词', action: 'add_emotion_words' },
          { text: '调整语调', action: 'adjust_tone' }
        ]
      }))
    }

    return suggestions
  }

  /**
   * 生成风格建议
   */
  generateStyleSuggestions(content, context) {
    const suggestions = []
    
    // 检测对话
    const hasDialogue = /["'""''「」『』]/.test(content)
    if (!hasDialogue && content.length > 200) {
      suggestions.push(this.createSuggestion({
        id: 'add_dialogue',
        type: 'style',
        priority: 'medium',
        title: '增加对话',
        content: '文章缺少对话，适当的对话可以增强故事的生动性和可读性',
        icon: '💬',
        actionable: true,
        actions: [
          { text: '插入对话', action: 'add_dialogue' },
          { text: '对话模板', action: 'dialogue_template' }
        ]
      }))
    }

    // 检测描述
    const descriptiveWords = ['美丽', '巨大', '细小', '明亮', '昏暗', '温暖', '寒冷']
    const hasDescription = descriptiveWords.some(word => content.includes(word))
    if (!hasDescription && content.length > 100) {
      suggestions.push(this.createSuggestion({
        id: 'add_description',
        type: 'style',
        priority: 'medium',
        title: '丰富描写',
        content: '可以增加更多环境、人物或氛围的描写，让故事更加生动',
        icon: '🎨',
        actionable: true,
        actions: [
          { text: '环境描写', action: 'add_environment_desc' },
          { text: '人物描写', action: 'add_character_desc' }
        ]
      }))
    }

    return suggestions
  }

  /**
   * 生成个性化建议
   */
  generatePersonalizedSuggestions(content, context) {
    const suggestions = []
    const userProfile = analysisService.userProfile
    
    // 基于用户薄弱环节的建议
    if (userProfile.writingHabits.weaknesses.includes('readability')) {
      suggestions.push(this.createSuggestion({
        id: 'personal_readability',
        type: 'personal',
        priority: 'high',
        title: '专属建议：提升可读性',
        content: '根据您的写作特点，建议多使用短句和常见词汇',
        icon: '🎯',
        actionable: true,
        actions: [
          { text: '句子简化练习', action: 'practice_simple_sentences' }
        ]
      }))
    }

    if (userProfile.writingHabits.weaknesses.includes('emotion')) {
      suggestions.push(this.createSuggestion({
        id: 'personal_emotion',
        type: 'personal',
        priority: 'high',
        title: '专属建议：情感表达',
        content: '您可以尝试增加更多情感描写，让文章更有感染力',
        icon: '💝',
        actionable: true,
        actions: [
          { text: '情感词汇库', action: 'emotion_vocabulary' }
        ]
      }))
    }

    return suggestions
  }

  /**
   * 生成AI优化建议
   */
  async generateOptimizationSuggestions(content) {
    const suggestions = []
    
    // 检测常见问题
    const issues = this.detectCommonIssues(content)
    
    issues.forEach(issue => {
      suggestions.push(this.createSuggestion({
        id: `optimize_${issue.type}`,
        type: 'optimization',
        priority: issue.severity,
        title: issue.title,
        content: issue.description,
        icon: '🔧',
        actionable: true,
        actions: issue.actions || []
      }))
    })

    // 语言润色建议
    if (content.length > 100) {
      suggestions.push(this.createSuggestion({
        id: 'polish_language',
        type: 'optimization',
        priority: 'low',
        title: 'AI语言润色',
        content: '可以使用AI工具对语言进行润色，提升表达质量',
        icon: '✨',
        actionable: true,
        actions: [
          { text: 'AI润色', action: 'ai_polish' },
          { text: '语法检查', action: 'grammar_check' }
        ]
      }))
    }

    return suggestions
  }

  /**
   * 检测常见写作问题
   */
  detectCommonIssues(content) {
    const issues = []

    // 重复词汇检测
    const words = content.match(/[\u4e00-\u9fa5]{2,}/g) || []
    const wordCount = {}
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1
    })
    
    const repeatedWords = Object.entries(wordCount)
      .filter(([word, count]) => count > 3 && word.length > 2)
      .map(([word]) => word)
    
    if (repeatedWords.length > 0) {
      issues.push({
        type: 'repetition',
        severity: 'medium',
        title: '词汇重复',
        description: `检测到重复使用的词汇：${repeatedWords.slice(0, 3).join('、')}`,
        actions: [
          { text: '查看重复词', action: 'show_repeated_words' },
          { text: '同义词替换', action: 'replace_synonyms' }
        ]
      })
    }

    // 句子过长检测
    const sentences = content.split(/[。！？.!?]/).filter(s => s.trim().length > 0)
    const longSentences = sentences.filter(s => s.length > 50)
    
    if (longSentences.length > 0) {
      issues.push({
        type: 'long_sentence',
        severity: 'medium',
        title: '句子过长',
        description: `发现${longSentences.length}个过长的句子，建议拆分`,
        actions: [
          { text: '拆分长句', action: 'split_long_sentences' }
        ]
      })
    }

    // 标点符号检测
    const punctuationIssues = this.detectPunctuationIssues(content)
    if (punctuationIssues.length > 0) {
      issues.push({
        type: 'punctuation',
        severity: 'low',
        title: '标点符号',
        description: '检测到标点符号使用问题',
        actions: [
          { text: '修正标点', action: 'fix_punctuation' }
        ]
      })
    }

    return issues
  }

  /**
   * 检测标点符号问题
   */
  detectPunctuationIssues(content) {
    const issues = []
    
    // 检测连续标点
    if (/[，。！？]{2,}/.test(content)) {
      issues.push('连续标点符号')
    }
    
    // 检测缺少句号
    const sentences = content.split('\n').filter(s => s.trim().length > 10)
    const missingSentenceEnd = sentences.filter(s => !/[。！？.!?]$/.test(s.trim()))
    if (missingSentenceEnd.length > 0) {
      issues.push('缺少句号')
    }
    
    return issues
  }

  /**
   * 生成结构建议
   */
  generateStructureSuggestions(analysis) {
    const suggestions = []
    
    if (analysis.coherence.score < 60) {
      suggestions.push(this.createSuggestion({
        id: 'structure_coherence',
        type: 'structure',
        priority: 'high',
        title: '改善逻辑结构',
        content: '文章逻辑连贯性有待提升，建议增加过渡句和逻辑连接词',
        icon: '🏗️',
        actionable: true,
        actions: [
          { text: '添加过渡', action: 'add_transitions' },
          { text: '逻辑梳理', action: 'organize_logic' }
        ]
      }))
    }

    return suggestions
  }

  /**
   * 生成语言建议
   */
  generateLanguageSuggestions(analysis) {
    const suggestions = []
    
    if (analysis.style.consistency < 70) {
      suggestions.push(this.createSuggestion({
        id: 'language_consistency',
        type: 'language',
        priority: 'medium',
        title: '统一语言风格',
        content: '文章风格不够统一，建议保持一致的表达方式',
        icon: '📝',
        actionable: true,
        actions: [
          { text: '风格统一', action: 'unify_style' }
        ]
      }))
    }

    return suggestions
  }

  /**
   * 生成情节建议
   */
  generatePlotSuggestions(content, analysis) {
    const suggestions = []
    
    // 检测是否有情节发展
    const plotWords = ['然后', '接着', '后来', '突然', '忽然', '终于']
    const plotWordCount = plotWords.filter(word => content.includes(word)).length
    
    if (plotWordCount < 2 && content.length > 300) {
      suggestions.push(this.createSuggestion({
        id: 'plot_development',
        type: 'plot',
        priority: 'medium',
        title: '丰富情节发展',
        content: '可以增加更多情节转折和发展，让故事更加精彩',
        icon: '📖',
        actionable: true,
        actions: [
          { text: '添加转折', action: 'add_plot_twist' },
          { text: '情节模板', action: 'plot_template' }
        ]
      }))
    }

    return suggestions
  }

  /**
   * 生成角色建议
   */
  generateCharacterSuggestions(content) {
    const suggestions = []
    
    // 检测人物描写
    const characterWords = ['他', '她', '我', '你', '我们', '他们']
    const characterCount = characterWords.reduce((count, word) => {
      return count + (content.match(new RegExp(word, 'g')) || []).length
    }, 0)
    
    if (characterCount > 5 && content.length > 200) {
      // 有人物但可能缺少描写
      const descWords = ['外貌', '性格', '心情', '想法', '感受']
      const hasDescription = descWords.some(word => content.includes(word))
      
      if (!hasDescription) {
        suggestions.push(this.createSuggestion({
          id: 'character_description',
          type: 'character',
          priority: 'medium',
          title: '丰富人物描写',
          content: '可以增加人物的外貌、性格或心理描写，让角色更立体',
          icon: '👥',
          actionable: true,
          actions: [
            { text: '外貌描写', action: 'add_appearance' },
            { text: '心理描写', action: 'add_psychology' }
          ]
        }))
      }
    }

    return suggestions
  }

  /**
   * 生成对话建议
   */
  generateDialogueSuggestions(content) {
    const suggestions = []
    
    const dialogueMarkers = content.match(/["'""''「」『』]/g) || []
    
    if (dialogueMarkers.length > 0) {
      // 有对话，检查对话标签
      const hasDialogueTag = /[说道：]/.test(content)
      if (!hasDialogueTag && dialogueMarkers.length > 4) {
        suggestions.push(this.createSuggestion({
          id: 'dialogue_tags',
          type: 'dialogue',
          priority: 'low',
          title: '完善对话标签',
          content: '对话较多但缺少说话人标识，建议添加对话标签',
          icon: '💭',
          actionable: true,
          actions: [
            { text: '添加标签', action: 'add_dialogue_tags' }
          ]
        }))
      }
    }

    return suggestions
  }

  /**
   * 创建建议对象
   */
  createSuggestion(options) {
    return {
      id: options.id,
      type: options.type,
      priority: options.priority,
      title: options.title,
      content: options.content,
      icon: options.icon || '💡',
      actionable: options.actionable || false,
      actions: options.actions || [],
      timestamp: Date.now(),
      applied: false
    }
  }

  /**
   * 建议排序和过滤
   */
  rankAndFilterSuggestions(suggestions, options = {}) {
    const { maxCount = 8, includeComplex = false } = options
    
    // 按优先级排序
    const priority = { high: 3, medium: 2, low: 1 }
    
    let filtered = suggestions
      .filter(s => includeComplex || s.type !== 'complex')
      .sort((a, b) => {
        // 优先级排序
        const priorityDiff = priority[b.priority] - priority[a.priority]
        if (priorityDiff !== 0) return priorityDiff
        
        // 可操作性排序
        if (a.actionable && !b.actionable) return -1
        if (!a.actionable && b.actionable) return 1
        
        return 0
      })
    
    // 去重
    const seen = new Set()
    filtered = filtered.filter(suggestion => {
      if (seen.has(suggestion.id)) return false
      seen.add(suggestion.id)
      return true
    })
    
    return filtered.slice(0, maxCount)
  }

  /**
   * 获取欢迎建议
   */
  getWelcomeSuggestions() {
    return [
      this.createSuggestion({
        id: 'welcome_start',
        type: 'welcome',
        priority: 'medium',
        title: '开始写作',
        content: '开始输入您的文章内容，我将实时为您提供写作建议',
        icon: '🚀',
        actionable: false
      }),
      this.createSuggestion({
        id: 'welcome_tips',
        type: 'welcome',
        priority: 'low',
        title: '写作技巧',
        content: '保持段落简洁、句子清晰，适当使用描述和对话',
        icon: '💡',
        actionable: false
      })
    ]
  }

  /**
   * 应用建议
   */
  async applySuggestion(suggestionId, content, action) {
    // 记录用户交互
    this.recordUserInteraction(suggestionId, action, true)
    
    // 根据动作类型应用建议
    switch (action) {
      case 'add_description':
        return this.addDescription(content)
      case 'simplify_sentence':
        return this.simplifySentences(content)
      case 'add_dialogue':
        return this.addDialogue(content)
      case 'polish_language':
        return this.polishLanguage(content)
      default:
        return content
    }
  }

  /**
   * 记录用户交互
   */
  recordUserInteraction(suggestionId, action, applied) {
    this.userInteractions.push({
      suggestionId,
      action,
      applied,
      timestamp: Date.now()
    })
    
    // 只保留最近100次交互
    this.userInteractions = this.userInteractions.slice(-100)
    this.saveUserInteractions()
  }

  /**
   * 简单的内容修改方法
   */
  addDescription(content) {
    // 简单的描述增强
    return content + '\n\n[建议：在此处添加环境或人物描写]'
  }

  simplifySentences(content) {
    // 简单的句子简化提示
    return content.replace(/，(?=[^，]{20,})/g, '。')
  }

  addDialogue(content) {
    // 添加对话提示
    return content + '\n\n[建议：在此处添加对话内容]'
  }

  polishLanguage(content) {
    // 语言润色提示
    return `[AI润色建议]\n${content}\n[建议：使用AI工具进一步润色]`
  }

  /**
   * 加载用户交互历史
   */
  loadUserInteractions() {
    try {
      const saved = localStorage.getItem('suggestionInteractions')
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error('加载用户交互历史失败:', error)
      return []
    }
  }

  /**
   * 保存用户交互历史
   */
  saveUserInteractions() {
    try {
      localStorage.setItem('suggestionInteractions', JSON.stringify(this.userInteractions))
    } catch (error) {
      console.error('保存用户交互历史失败:', error)
    }
  }

  /**
   * 初始化建议模板
   */
  initializeSuggestionTemplates() {
    return {
      basic: {
        word_count: '根据字数提供相应建议',
        readability: '提供可读性改进建议',
        structure: '提供结构优化建议'
      },
      advanced: {
        style: '提供风格统一建议',
        emotion: '提供情感表达建议',
        plot: '提供情节发展建议'
      }
    }
  }

  /**
   * 获取建议统计
   */
  getSuggestionStats() {
    const stats = {
      totalSuggestions: this.userInteractions.length,
      appliedSuggestions: this.userInteractions.filter(i => i.applied).length,
      mostUsedActions: {},
      recentActivity: this.userInteractions.slice(-10)
    }

    // 统计最常用的动作
    this.userInteractions.forEach(interaction => {
      if (interaction.applied) {
        stats.mostUsedActions[interaction.action] = 
          (stats.mostUsedActions[interaction.action] || 0) + 1
      }
    })

    return stats
  }
}

// 创建单例实例
const suggestionEngine = new SuggestionEngine()

export default suggestionEngine
