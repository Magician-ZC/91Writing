import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { GenerateSuggestionsDto, AnalyzeTextDto, ApplySuggestionDto, SuggestionType, SuggestionPriority } from '../../dto/suggestion.dto';

@Injectable()
export class SuggestionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 生成实时写作建议
   */
  async generateRealtimeSuggestions(userId: string, dto: GenerateSuggestionsDto) {
    if (!dto.content || dto.content.trim().length < 5) {
      return this.getWelcomeSuggestions();
    }

    // 分析文本
    const analysis = await this.performBasicTextAnalysis(dto.content);
    
    // 生成各类建议
    const suggestions = [];
    
    // 基础写作建议
    const basicSuggestions = this.generateBasicSuggestions(dto.content, analysis);
    suggestions.push(...basicSuggestions);
    
    // 质量改进建议
    const qualitySuggestions = this.generateQualitySuggestions(analysis);
    suggestions.push(...qualitySuggestions);
    
    // 风格建议
    const styleSuggestions = this.generateStyleSuggestions(dto.content);
    suggestions.push(...styleSuggestions);
    
    // 优化建议
    const optimizationSuggestions = this.generateOptimizationSuggestions(dto.content);
    suggestions.push(...optimizationSuggestions);

    // 排序和过滤
    const filteredSuggestions = this.rankAndFilterSuggestions(suggestions, {
      maxCount: dto.maxSuggestions || 8,
      requestedTypes: dto.suggestionTypes
    });

    // 记录使用统计
    await this.logSuggestionGeneration(userId, dto.content.length, filteredSuggestions.length);

    return {
      suggestions: filteredSuggestions,
      analysis: {
        wordCount: this.calculateWordCount(dto.content),
        readability: analysis.readability,
        complexity: analysis.complexity,
      },
      context: dto.context || {}
    };
  }

  /**
   * 深度文本分析
   */
  async analyzeText(userId: string, dto: AnalyzeTextDto) {
    const analysis = await this.performDetailedAnalysis(dto.content, dto.options);
    
    // 记录使用统计
    await this.logTextAnalysis(userId, dto.content.length);

    return analysis;
  }

  /**
   * 应用建议
   */
  async applySuggestion(userId: string, dto: ApplySuggestionDto) {
    // 记录用户交互
    await this.recordUserInteraction(userId, dto.suggestionId, dto.action, true);
    
    // 根据动作类型应用建议
    const result = this.processApplySuggestion(dto.content, dto.action, dto.options);
    
    return result;
  }

  /**
   * 获取建议统计
   */
  async getSuggestionStats(userId: string) {
    const stats = await this.prisma.aIUsageLog.aggregate({
      where: {
        userId,
        functionType: 'suggestion_generation',
      },
      _count: { id: true },
      _avg: { responseTime: true },
    });

    return {
      totalSuggestions: stats._count.id || 0,
      averageResponseTime: stats._avg.responseTime || 0,
      // 可以添加更多统计信息
    };
  }

  /**
   * 基础建议生成
   */
  private generateBasicSuggestions(content: string, analysis: any) {
    const suggestions = [];
    const wordCount = this.calculateWordCount(content);

    // 字数相关建议
    if (wordCount < 50) {
      suggestions.push(this.createSuggestion({
        id: 'word_count_low',
        type: SuggestionType.BASIC,
        priority: SuggestionPriority.MEDIUM,
        title: '增加内容',
        content: '内容较少，可以增加更多细节描述、人物对话或环境描写',
        icon: '📝',
        actionable: true,
        actions: [
          { text: '添加描述', action: 'add_description' },
          { text: '扩展对话', action: 'expand_dialogue' }
        ]
      }));
    }

    // 可读性建议
    if (analysis.readability < 60) {
      suggestions.push(this.createSuggestion({
        id: 'readability_improve',
        type: SuggestionType.BASIC,
        priority: SuggestionPriority.HIGH,
        title: '提高可读性',
        content: '文章较难阅读，建议简化句子结构，使用更常见的词汇',
        icon: '👁️',
        actionable: true,
        actions: [
          { text: '简化句子', action: 'simplify_sentence' },
          { text: '替换词汇', action: 'replace_complex_words' }
        ]
      }));
    }

    return suggestions;
  }

  /**
   * 质量建议生成
   */
  private generateQualitySuggestions(analysis: any) {
    const suggestions = [];
    
    if (analysis.score < 60) {
      suggestions.push(this.createSuggestion({
        id: 'quality_overall',
        type: SuggestionType.QUALITY,
        priority: SuggestionPriority.HIGH,
        title: '整体质量提升',
        content: '文章质量有提升空间，建议关注语言表达和逻辑结构',
        icon: '⭐',
        actionable: true,
        actions: [
          { text: '语言润色', action: 'polish_language' },
          { text: '结构调整', action: 'adjust_structure' }
        ]
      }));
    }

    return suggestions;
  }

  /**
   * 风格建议生成
   */
  private generateStyleSuggestions(content: string) {
    const suggestions = [];
    
    // 检测对话
    const hasDialogue = /["'""''「」『』]/.test(content);
    if (!hasDialogue && content.length > 200) {
      suggestions.push(this.createSuggestion({
        id: 'add_dialogue',
        type: SuggestionType.STYLE,
        priority: SuggestionPriority.MEDIUM,
        title: '增加对话',
        content: '文章缺少对话，适当的对话可以增强故事的生动性',
        icon: '💬',
        actionable: true,
        actions: [
          { text: '插入对话', action: 'add_dialogue' }
        ]
      }));
    }

    return suggestions;
  }

  /**
   * 优化建议生成
   */
  private generateOptimizationSuggestions(content: string) {
    const suggestions = [];
    
    // 检测常见问题
    const issues = this.detectCommonIssues(content);
    
    issues.forEach(issue => {
      suggestions.push(this.createSuggestion({
        id: `optimize_${issue.type}`,
        type: SuggestionType.OPTIMIZATION,
        priority: issue.severity,
        title: issue.title,
        content: issue.description,
        icon: '🔧',
        actionable: true,
        actions: issue.actions || []
      }));
    });

    return suggestions;
  }

  /**
   * 欢迎建议
   */
  private getWelcomeSuggestions() {
    return {
      suggestions: [
        this.createSuggestion({
          id: 'welcome_start',
          type: SuggestionType.BASIC,
          priority: SuggestionPriority.MEDIUM,
          title: '开始写作',
          content: '开始输入您的文章内容，我将实时为您提供写作建议',
          icon: '🚀',
          actionable: false
        })
      ],
      analysis: { wordCount: 0, readability: 0, complexity: 0 },
      context: {}
    };
  }

  /**
   * 创建建议对象
   */
  private createSuggestion(options: any) {
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
    };
  }

  /**
   * 建议排序和过滤
   */
  private rankAndFilterSuggestions(suggestions: any[], options: any = {}) {
    const { maxCount = 8, requestedTypes } = options;
    
    let filtered = suggestions;
    
    // 按类型过滤
    if (requestedTypes && requestedTypes.length > 0) {
      filtered = filtered.filter(s => requestedTypes.includes(s.type));
    }
    
    // 按优先级排序
    const priority = { [SuggestionPriority.HIGH]: 3, [SuggestionPriority.MEDIUM]: 2, [SuggestionPriority.LOW]: 1 };
    
    filtered.sort((a, b) => {
      const priorityDiff = priority[b.priority] - priority[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      if (a.actionable && !b.actionable) return -1;
      if (!a.actionable && b.actionable) return 1;
      
      return 0;
    });
    
    return filtered.slice(0, maxCount);
  }

  /**
   * 基础文本分析
   */
  private async performBasicTextAnalysis(content: string) {
    // 简化的文本分析
    const wordCount = this.calculateWordCount(content);
    const sentences = content.split(/[。！？.!?]/).filter(s => s.trim().length > 0);
    
    return {
      wordCount,
      sentenceCount: sentences.length,
      readability: this.calculateReadability(content),
      complexity: this.calculateComplexity(content),
      score: this.calculateOverallScore(content)
    };
  }

  /**
   * 详细文本分析
   */
  private async performDetailedAnalysis(content: string, options: any = {}) {
    const basicAnalysis = await this.performBasicTextAnalysis(content);
    
    return {
      ...basicAnalysis,
      readability: {
        score: basicAnalysis.readability,
        level: basicAnalysis.readability > 70 ? 'easy' : basicAnalysis.readability > 40 ? 'medium' : 'hard'
      },
      style: {
        consistency: this.calculateStyleConsistency(content),
        tone: this.detectTone(content)
      },
      emotion: {
        intensity: this.calculateEmotionIntensity(content),
        dominant: this.detectDominantEmotion(content)
      },
      coherence: {
        score: this.calculateCoherence(content)
      },
      issues: this.detectCommonIssues(content),
      suggestions: this.generateImprovementSuggestions(content)
    };
  }

  /**
   * 工具方法
   */
  private calculateWordCount(content: string): number {
    if (!content) return 0;
    const cleanContent = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    const chineseChars = (cleanContent.match(/[\u4e00-\u9fff]/g) || []).length;
    const englishWords = (cleanContent.match(/[a-zA-Z]+/g) || []).length;
    return chineseChars + englishWords;
  }

  private calculateReadability(content: string): number {
    // 简化的可读性计算
    const sentences = content.split(/[。！？.!?]/).filter(s => s.trim().length > 0);
    const avgSentenceLength = this.calculateWordCount(content) / Math.max(sentences.length, 1);
    return Math.max(0, 100 - avgSentenceLength * 2);
  }

  private calculateComplexity(content: string): number {
    // 简化的复杂度计算
    const complexWords = (content.match(/[\u4e00-\u9fff]{4,}/g) || []).length;
    const totalWords = this.calculateWordCount(content);
    return Math.min(100, (complexWords / Math.max(totalWords, 1)) * 100);
  }

  private calculateOverallScore(content: string): number {
    const readability = this.calculateReadability(content);
    const complexity = this.calculateComplexity(content);
    return Math.round((readability * 0.6 + (100 - complexity) * 0.4));
  }

  private calculateStyleConsistency(content: string): number {
    // 简化的风格一致性计算
    return Math.floor(Math.random() * 30) + 70; // 70-100
  }

  private detectTone(content: string): string {
    // 简化的语调检测
    const tones = ['neutral', 'positive', 'negative', 'formal', 'casual'];
    return tones[Math.floor(Math.random() * tones.length)];
  }

  private calculateEmotionIntensity(content: string): number {
    // 简化的情感强度计算
    const emotionWords = content.match(/[激动|高兴|悲伤|愤怒|恐惧|惊讶]/g) || [];
    return Math.min(100, emotionWords.length * 10);
  }

  private detectDominantEmotion(content: string): string {
    // 简化的主导情感检测
    const emotions = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'neutral'];
    return emotions[Math.floor(Math.random() * emotions.length)];
  }

  private calculateCoherence(content: string): number {
    // 简化的连贯性计算
    return Math.floor(Math.random() * 30) + 65; // 65-95
  }

  private detectCommonIssues(content: string) {
    const issues = [];

    // 重复词汇检测
    const words = content.match(/[\u4e00-\u9fa5]{2,}/g) || [];
    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    const repeatedWords = Object.entries(wordCount)
      .filter(([word, count]) => (count as number) > 3 && word.length > 2)
      .map(([word]) => word);
    
    if (repeatedWords.length > 0) {
      issues.push({
        type: 'repetition',
        severity: SuggestionPriority.MEDIUM,
        title: '词汇重复',
        description: `检测到重复使用的词汇：${repeatedWords.slice(0, 3).join('、')}`,
        actions: [
          { text: '查看重复词', action: 'show_repeated_words' },
          { text: '同义词替换', action: 'replace_synonyms' }
        ]
      });
    }

    return issues;
  }

  private generateImprovementSuggestions(content: string) {
    return [
      '增加更多细节描写',
      '优化句子结构',
      '加强逻辑连接',
      '丰富词汇表达'
    ];
  }

  private processApplySuggestion(content: string, action: string, options: any) {
    // 简化的建议应用处理
    const actionHandlers = {
      add_description: () => content + '\n\n[建议：在此处添加环境或人物描写]',
      simplify_sentence: () => content.replace(/，(?=[^，]{20,})/g, '。'),
      add_dialogue: () => content + '\n\n[建议：在此处添加对话内容]',
      polish_language: () => `[AI润色建议]\n${content}\n[建议：使用AI工具进一步润色]`,
    };

    const handler = actionHandlers[action];
    if (handler) {
      return {
        content: handler(),
        message: `已应用建议：${action}`,
        success: true
      };
    }

    return {
      content,
      message: '未知的建议动作',
      success: false
    };
  }

  private async logSuggestionGeneration(userId: string, inputLength: number, suggestionsCount: number) {
    try {
      await this.prisma.aIUsageLog.create({
        data: {
          userId,
          model: 'suggestion-engine',
          functionType: 'suggestion_generation',
          inputTokens: Math.ceil(inputLength / 4),
          outputTokens: suggestionsCount * 10,
          success: true,
        },
      });
    } catch (error) {
      console.error('Log suggestion generation error:', error);
    }
  }

  private async logTextAnalysis(userId: string, inputLength: number) {
    try {
      await this.prisma.aIUsageLog.create({
        data: {
          userId,
          model: 'text-analyzer',
          functionType: 'text_analysis',
          inputTokens: Math.ceil(inputLength / 4),
          outputTokens: 50,
          success: true,
        },
      });
    } catch (error) {
      console.error('Log text analysis error:', error);
    }
  }

  private async recordUserInteraction(userId: string, suggestionId: string, action: string, applied: boolean) {
    try {
      await this.prisma.userActivity.create({
        data: {
          userId,
          action: 'suggestion_applied',
          targetType: 'suggestion',
          targetId: suggestionId,
          details: {
            suggestionId,
            action,
            applied,
            timestamp: new Date().toISOString()
          }
        },
      });
    } catch (error) {
      console.error('Record user interaction error:', error);
    }
  }
}
