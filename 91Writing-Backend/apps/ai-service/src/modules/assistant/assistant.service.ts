import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { InitializeSessionDto, ConversationDto, ConversationIntent } from '../../dto/conversation.dto';

@Injectable()
export class AssistantService {
  private activeSessions = new Map<string, any>();
  
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 初始化写作助手会话
   */
  async initializeSession(userId: string, initDto: InitializeSessionDto) {
    // 验证小说权限
    const novel = await this.prisma.novel.findFirst({
      where: { 
        id: initDto.novelId, 
        userId 
      },
      include: {
        chapters: {
          orderBy: { chapterNumber: 'asc' },
          select: {
            id: true,
            title: true,
            chapterNumber: true,
            wordCount: true,
            status: true,
            updatedAt: true,
          },
        },
        memories: {
          orderBy: { importance: 'desc' },
          take: 10,
        },
      },
    });

    if (!novel) {
      throw new NotFoundException('小说不存在或无权访问');
    }

    // 创建会话
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session = {
      sessionId,
      userId,
      novelId: initDto.novelId,
      novel,
      currentContext: {
        novel: novel,
        currentChapter: initDto.currentChapter,
        writingGoals: initDto.writingGoals || [],
        userPreferences: initDto.userPreferences || {},
      },
      conversationHistory: [],
      createdAt: new Date(),
      lastActivity: new Date(),
    };

    this.activeSessions.set(sessionId, session);

    // 分析当前写作状态
    const currentStatus = this.analyzeWritingStatus(novel);
    
    // 生成个性化欢迎消息
    const welcomeMessage = this.generateWelcomeMessage(novel, currentStatus);
    
    // 添加欢迎消息到历史
    this.addToHistory(sessionId, {
      type: 'assistant',
      content: welcomeMessage,
      timestamp: new Date().toISOString(),
      metadata: { event: 'session_start', status: currentStatus }
    });

    return {
      sessionId,
      welcome: welcomeMessage,
      status: currentStatus,
      suggestions: this.getInitialSuggestions(currentStatus),
      novelInfo: {
        id: novel.id,
        title: novel.title,
        genre: novel.genre,
        wordCount: novel.wordCount,
        chapterCount: novel.chapterCount,
      },
    };
  }

  /**
   * 处理对话
   */
  async handleConversation(userId: string, conversationDto: ConversationDto) {
    let session;
    
    if (conversationDto.sessionId) {
      session = this.activeSessions.get(conversationDto.sessionId);
      if (!session || session.userId !== userId) {
        throw new NotFoundException('会话不存在或无权访问');
      }
    } else if (conversationDto.novelId) {
      // 创建临时会话
      const sessionResult = await this.initializeSession(userId, {
        novelId: conversationDto.novelId,
      });
      session = this.activeSessions.get(sessionResult.sessionId);
    } else {
      throw new BadRequestException('需要提供会话ID或小说ID');
    }

    // 更新最后活动时间
    session.lastActivity = new Date();

    // 添加用户消息到历史
    this.addToHistory(session.sessionId, {
      type: 'user',
      content: conversationDto.message,
      timestamp: new Date().toISOString(),
      context: conversationDto.context || {}
    });

    // 分析用户意图
    const intent = this.analyzeUserIntent(conversationDto.message, conversationDto.context);
    
    // 根据意图生成回应
    const response = await this.generateResponse(session, intent, conversationDto.message, conversationDto.context);
    
    // 添加助手回应到历史
    this.addToHistory(session.sessionId, {
      type: 'assistant',
      content: response.message,
      timestamp: new Date().toISOString(),
      metadata: { intent, actions: response.actions }
    });

    // 记录AI使用统计
    await this.logAIUsage(userId, 'conversation', {
      intent: intent.intent,
      inputLength: conversationDto.message.length,
      outputLength: response.message.length,
    });

    return {
      sessionId: session.sessionId,
      ...response
    };
  }

  /**
   * 获取会话历史
   */
  async getConversationHistory(userId: string, sessionId: string) {
    const session = this.activeSessions.get(sessionId);
    
    if (!session || session.userId !== userId) {
      throw new NotFoundException('会话不存在或无权访问');
    }

    return {
      sessionId,
      conversationHistory: session.conversationHistory,
      novelInfo: {
        id: session.novel.id,
        title: session.novel.title,
      },
    };
  }

  /**
   * 清理过期会话
   */
  cleanupSessions() {
    const now = new Date();
    const sessionTimeout = 2 * 60 * 60 * 1000; // 2小时

    for (const [sessionId, session] of this.activeSessions) {
      if (now.getTime() - session.lastActivity.getTime() > sessionTimeout) {
        this.activeSessions.delete(sessionId);
      }
    }
  }

  /**
   * 分析用户意图
   */
  private analyzeUserIntent(message: string, context: any = {}) {
    const intents = {
      writing_request: [
        '帮我写', '续写', '完成', '生成', '创作',
        '写一段', '写几句', '写个开头', '写个结尾'
      ],
      revision_request: [
        '修改', '润色', '优化', '改进', '完善',
        '重写', '调整', '美化', '精简'
      ],
      plot_consultation: [
        '情节', '剧情', '故事', '发展', '转折',
        '冲突', '高潮', '结局', '接下来怎么写'
      ],
      character_consultation: [
        '角色', '人物', '性格', '对话', '行为',
        '主角', '配角', '反派', '人物关系'
      ],
      technique_consultation: [
        '技巧', '方法', '怎么写', '如何', '建议',
        '风格', '节奏', '描写', '叙述'
      ],
      analysis_request: [
        '分析', '评价', '看看', '检查', '评估',
        '怎么样', '问题', '不足', '优缺点'
      ]
    };

    let detectedIntent = ConversationIntent.GENERAL_CHAT;
    let confidence = 0;

    for (const [intent, keywords] of Object.entries(intents)) {
      const matches = keywords.filter(keyword => 
        message.toLowerCase().includes(keyword)
      ).length;
      
      const currentConfidence = matches / keywords.length;
      if (currentConfidence > confidence) {
        confidence = currentConfidence;
        detectedIntent = intent as ConversationIntent;
      }
    }

    return {
      intent: detectedIntent,
      confidence,
      keywords: this.extractKeywords(message),
      entities: this.extractEntities(message, context)
    };
  }

  /**
   * 生成回应
   */
  private async generateResponse(session: any, intent: any, userMessage: string, context: any = {}) {
    try {
      switch (intent.intent) {
        case ConversationIntent.WRITING_REQUEST:
          return await this.handleWritingRequest(session, intent, userMessage, context);
        case ConversationIntent.REVISION_REQUEST:
          return await this.handleRevisionRequest(session, intent, userMessage, context);
        case ConversationIntent.PLOT_CONSULTATION:
          return await this.handlePlotConsultation(session, intent, userMessage, context);
        case ConversationIntent.CHARACTER_CONSULTATION:
          return await this.handleCharacterConsultation(session, intent, userMessage, context);
        case ConversationIntent.TECHNIQUE_CONSULTATION:
          return await this.handleTechniqueConsultation(session, intent, userMessage, context);
        case ConversationIntent.ANALYSIS_REQUEST:
          return await this.handleAnalysisRequest(session, intent, userMessage, context);
        default:
          return await this.handleGeneralChat(session, intent, userMessage, context);
      }
    } catch (error) {
      console.error('Generate response error:', error);
      return this.handleError('处理失败，请重新描述您的需求', error);
    }
  }

  /**
   * 处理写作请求
   */
  private async handleWritingRequest(session: any, intent: any, userMessage: string, context: any) {
    // 解析写作需求
    const requirement = this.parseWritingRequirement(userMessage);
    
    // 构建上下文（这里应该调用实际的AI API）
    const mockContent = this.generateMockContent(requirement, session.novel);
    
    return {
      message: `为您生成了以下内容：\n\n${mockContent}\n\n💡 建议：可以根据需要进一步调整内容的风格和长度。`,
      actions: [
        { type: 'insert_content', content: mockContent },
        { type: 'show_suggestions', suggestions: ['增加细节描写', '调整段落结构', '润色语言表达'] }
      ],
      metadata: { type: 'writing_assistance', requirement }
    };
  }

  /**
   * 处理修改建议请求
   */
  private async handleRevisionRequest(session: any, intent: any, userMessage: string, context: any) {
    const targetText = context.selectedText || context.currentParagraph || '';
    
    if (!targetText) {
      return {
        message: '请选择需要修改的文本，或者告诉我您想要优化的具体内容。',
        actions: [{ type: 'request_text_selection' }]
      };
    }

    // 这里应该调用实际的文本分析和修改建议生成
    const mockRevisions = this.generateMockRevisions(targetText);

    return {
      message: this.formatRevisionResponse(mockRevisions),
      actions: [
        { type: 'show_revisions', revisions: mockRevisions },
        { type: 'highlight_issues', issues: [] }
      ],
      metadata: { type: 'revision_assistance', originalText: targetText }
    };
  }

  /**
   * 处理情节咨询
   */
  private async handlePlotConsultation(session: any, intent: any, userMessage: string, context: any) {
    const advice = `基于您的小说《${session.novel.title}》当前发展，我建议：

1. 考虑在当前章节引入新的冲突点，推动情节发展
2. 可以通过角色的内心独白来展现其成长变化
3. 适当设置悬念，为下一章节做好铺垫

您希望我针对哪个具体方面提供更详细的建议？`;

    return {
      message: advice,
      actions: [
        { type: 'show_plot_suggestions', suggestions: ['冲突升级', '角色发展', '悬念设置'] }
      ],
      metadata: { type: 'plot_consultation' }
    };
  }

  /**
   * 处理角色咨询
   */
  private async handleCharacterConsultation(session: any, intent: any, userMessage: string, context: any) {
    const advice = `关于角色塑造，我有以下建议：

1. **性格一致性**：确保角色的行为符合其设定的性格特点
2. **成长弧线**：让角色在故事中有所成长和变化
3. **对话个性**：每个角色都应该有独特的说话方式
4. **动机清晰**：角色的每个行动都应该有明确的动机

您想要讨论哪个角色的具体问题？`;

    return {
      message: advice,
      actions: [
        { type: 'show_character_suggestions', suggestions: ['性格分析', '对话优化', '关系梳理'] }
      ],
      metadata: { type: 'character_consultation' }
    };
  }

  /**
   * 处理技巧咨询
   */
  private async handleTechniqueConsultation(session: any, intent: any, userMessage: string, context: any) {
    const advice = `关于写作技巧，我来为您详细解答：

**叙述技巧**：
- 合理运用第一人称和第三人称视角
- 通过细节描写来营造氛围
- 使用对话推进情节发展

**节奏控制**：
- 适当的快慢节奏交替
- 重要情节前的铺垫和悬念
- 适时的留白让读者思考

有什么具体的写作困惑吗？`;

    return {
      message: advice,
      actions: [
        { type: 'show_examples', examples: ['叙述示例', '对话技巧', '描写方法'] },
        { type: 'suggest_exercises', exercises: ['练习题1', '练习题2'] }
      ],
      metadata: { type: 'technique_consultation' }
    };
  }

  /**
   * 处理分析请求
   */
  private async handleAnalysisRequest(session: any, intent: any, userMessage: string, context: any) {
    const targetText = context.selectedText || context.currentChapter || '';
    
    if (!targetText) {
      return {
        message: '请提供需要分析的文本内容。',
        actions: [{ type: 'request_text_input' }]
      };
    }

    // 模拟文本分析
    const analysis = this.generateMockAnalysis(targetText);

    return {
      message: this.formatAnalysisResponse(analysis),
      actions: [
        { type: 'show_detailed_analysis', analysis },
        { type: 'show_improvement_plan', plan: analysis.improvementPlan || [] }
      ],
      metadata: { type: 'text_analysis', analysis }
    };
  }

  /**
   * 处理一般对话
   */
  private async handleGeneralChat(session: any, intent: any, userMessage: string, context: any) {
    return {
      message: '我理解您的问题。作为您的写作助手，我可以帮助您进行内容创作、文本润色、情节规划、角色设计等各种写作相关的工作。请告诉我您需要什么帮助？',
      actions: [],
      metadata: { type: 'general_chat' }
    };
  }

  /**
   * 工具方法
   */
  private analyzeWritingStatus(novel: any) {
    return {
      hasProject: true,
      novel,
      wordCount: novel.wordCount || 0,
      chaptersCount: novel.chapters?.length || 0,
      lastModified: novel.updatedAt,
      completionRate: this.calculateCompletionRate(novel),
      currentPhase: this.identifyWritingPhase(novel),
      momentum: 'medium', // 简化的动力评估
    };
  }

  private generateWelcomeMessage(novel: any, status: any) {
    let greeting = `欢迎回来！很高兴继续与您一起创作《${novel.title}》。\n\n`;
    greeting += `📖 当前状态：${this.getPhaseDescription(status.currentPhase)}\n`;
    greeting += `📝 已完成：${status.wordCount} 字\n`;
    greeting += `📚 章节数：${status.chaptersCount} 章\n\n`;
    greeting += `我可以帮助您：续写情节、完善角色、润色文本、解决写作难题。有什么需要协助的吗？`;
    
    return greeting;
  }

  private getInitialSuggestions(status: any) {
    const suggestions = [
      { text: '继续创作', action: 'continue_writing' },
      { text: '分析文本质量', action: 'analyze_quality' },
      { text: '获取写作建议', action: 'get_suggestions' }
    ];
    
    return suggestions.slice(0, 3);
  }

  private addToHistory(sessionId: string, message: any) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.conversationHistory.push(message);
      // 保持历史记录在合理范围内
      if (session.conversationHistory.length > 100) {
        session.conversationHistory = session.conversationHistory.slice(-50);
      }
    }
  }

  private extractKeywords(text: string): string[] {
    const keywords = text.match(/[\u4e00-\u9fa5]{2,}|[a-zA-Z]{3,}/g) || [];
    return [...new Set(keywords)].slice(0, 10);
  }

  private extractEntities(text: string, context: any): any[] {
    return [];
  }

  private parseWritingRequirement(message: string) {
    const requirement = {
      type: 'continuation',
      length: 'medium', 
      style: 'current',
      focus: 'story',
    };

    if (/对话|说话|谈话/.test(message)) requirement.type = 'dialogue';
    if (/描写|描述|环境|场景/.test(message)) requirement.type = 'description';
    if (/开头|开始/.test(message)) requirement.type = 'opening';
    if (/结尾|结束|收尾/.test(message)) requirement.type = 'ending';

    if (/简短|几句|一点/.test(message)) requirement.length = 'short';
    if (/详细|长一点|多写/.test(message)) requirement.length = 'long';

    return requirement;
  }

  private generateMockContent(requirement: any, novel: any): string {
    const contentTypes = {
      continuation: `她缓缓推开门，房间里的一切都和记忆中的一样。阳光透过窗棂洒在地板上，形成斑驳的光影。这个地方承载着太多的回忆，每一件物品都在诉说着过往的故事。`,
      dialogue: `"你真的决定了吗？"他的声音有些颤抖。\n\n"是的，我想了很久。"她回答得很轻，但语气中透着坚定。\n\n"那我尊重你的选择。"`,
      description: `古老的图书馆笼罩在朦胧的光晕中，书架高耸入云，仿佛直达天穹。空气中弥漫着纸张和墨水的清香，偶尔传来翻书的沙沙声。`,
      opening: `那是一个平凡无奇的星期二早晨，直到那封意料之外的信件改变了一切。`,
      ending: `当最后一缕阳光消失在地平线上时，她知道这段旅程终于结束了。但另一段新的故事，正在悄悄开始。`
    };

    return contentTypes[requirement.type] || contentTypes.continuation;
  }

  private generateMockRevisions(text: string) {
    return [
      {
        type: 'readability',
        issue: '可读性可以提升',
        suggestion: '建议简化部分句子结构',
        example: '优化后的文本示例...'
      },
      {
        type: 'style',
        issue: '语言风格可以更统一',
        suggestion: '保持一致的叙述风格',
        example: '统一风格后的文本...'
      }
    ];
  }

  private generateMockAnalysis(text: string) {
    return {
      overallScore: 78,
      readability: { score: 75 },
      style: { consistency: 80 },
      emotion: { intensity: 65 },
      coherence: { score: 82 },
      keyFindings: [
        '整体质量良好',
        '情感表达可以加强',
        '逻辑结构清晰'
      ],
      improvementPlan: [
        '增加情感词汇',
        '调整段落结构',
        '优化语言表达'
      ]
    };
  }

  private formatRevisionResponse(revisions: any[]): string {
    let response = `我分析了您的文本，发现以下可以改进的地方：\n\n`;
    
    revisions.forEach((revision, index) => {
      response += `${index + 1}. **${revision.issue}**\n`;
      response += `   ${revision.suggestion}\n\n`;
    });

    return response;
  }

  private formatAnalysisResponse(analysis: any): string {
    let response = `📊 文本分析结果：\n\n`;
    response += `总体评分：${analysis.overallScore}/100\n\n`;
    response += `各项指标：\n`;
    response += `• 可读性：${analysis.readability.score}分\n`;
    response += `• 风格一致性：${analysis.style.consistency}分\n`;
    response += `• 情感强度：${analysis.emotion.intensity}分\n`;
    response += `• 逻辑连贯性：${analysis.coherence.score}分\n\n`;

    if (analysis.keyFindings) {
      response += `🔍 主要发现：\n`;
      analysis.keyFindings.forEach(finding => {
        response += `• ${finding}\n`;
      });
    }

    return response;
  }

  private calculateCompletionRate(novel: any): number {
    // 简化的完成度计算
    return Math.min(Math.round((novel.wordCount || 0) / 50000 * 100), 100);
  }

  private identifyWritingPhase(novel: any): string {
    const wordCount = novel.wordCount || 0;
    const chapterCount = novel.chapters?.length || 0;

    if (wordCount > 40000) return 'revision';
    if (chapterCount > 0) return 'writing';
    return 'planning';
  }

  private getPhaseDescription(phase: string): string {
    const descriptions = {
      planning: '规划阶段',
      writing: '创作阶段', 
      revision: '修改阶段'
    };
    return descriptions[phase] || '未知阶段';
  }

  private handleError(message: string, error: any) {
    console.error('AI Assistant Error:', error);
    return {
      message: `抱歉，${message}。请稍后重试或重新表达您的需求。`,
      actions: [],
      metadata: { type: 'error', error: error.message }
    };
  }

  private async logAIUsage(userId: string, functionType: string, details: any) {
    try {
      await this.prisma.aIUsageLog.create({
        data: {
          userId,
          model: 'assistant-service',
          functionType,
          inputTokens: Math.ceil((details.inputLength || 0) / 4),
          outputTokens: Math.ceil((details.outputLength || 0) / 4),
          cost: 0,
          success: true,
        },
      });
    } catch (error) {
      console.error('Log AI usage error:', error);
    }
  }
}
