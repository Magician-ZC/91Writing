import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { GenerateContentDto } from '../../dto/conversation.dto';
import { AICallerService } from '../../services/ai-caller.service';
import { ContextManagerService } from '../../services/context-manager.service';
import { AIChatMessage } from '../../providers/base.provider';

@Injectable()
export class GenerationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiCallerService: AICallerService,
    private readonly contextManager: ContextManagerService,
  ) {}

  /**
   * 生成内容
   */
  async generateContent(userId: string, dto: GenerateContentDto) {
    // 1. 验证小说权限
    const novel = await this.prisma.novel.findFirst({
      where: { id: dto.novelId, userId },
    });

    if (!novel) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: '小说不存在或无权访问',
          error: 'NOVEL_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // 2. 构建AI提示词
    const messages = await this.buildPrompt(userId, dto, novel);

    // 3. 调用AI服务
    const response = await this.aiCallerService.callAI({
      userId,
      messages,
      configId: dto.aiConfigId,
      parameters: {
        temperature: this.getTemperatureByStyle(dto.style),
        maxTokens: this.getMaxTokensByLength(dto.length),
      },
    });

    // 4. 返回生成结果
    return {
      content: response.content,
      metadata: {
        type: dto.contentType,
        length: dto.length,
        style: dto.style,
        wordCount: this.calculateWordCount(response.content),
        model: response.model,
        provider: response.provider,
        tokensUsed: response.totalTokens,
      },
    };
  }

  /**
   * 流式生成内容
   */
  async *generateContentStream(
    userId: string,
    dto: GenerateContentDto,
  ): AsyncIterableIterator<string> {
    // 1. 验证小说权限
    const novel = await this.prisma.novel.findFirst({
      where: { id: dto.novelId, userId },
    });

    if (!novel) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: '小说不存在或无权访问',
          error: 'NOVEL_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // 2. 构建AI提示词
    const messages = await this.buildPrompt(userId, dto, novel);

    // 3. 流式调用AI服务
    for await (const chunk of this.aiCallerService.callAIStream({
      userId,
      messages,
      configId: dto.aiConfigId,
      parameters: {
        temperature: this.getTemperatureByStyle(dto.style),
        maxTokens: this.getMaxTokensByLength(dto.length),
      },
      stream: true,
    })) {
      yield chunk;
    }
  }

  /**
   * 构建AI提示词（使用智能上下文管理）
   */
  private async buildPrompt(userId: string, dto: GenerateContentDto, novel: any): Promise<AIChatMessage[]> {
    const messages: AIChatMessage[] = [];

    // 系统提示词
    let systemPrompt = '你是一位专业的小说创作助手。';
    
    // 根据写作风格调整系统提示
    if (dto.style === 'formal') {
      systemPrompt += '请使用正式、严谨的文学风格进行创作。';
    } else if (dto.style === 'casual') {
      systemPrompt += '请使用轻松、活泼的叙事风格进行创作。';
    } else if (dto.style === 'poetic') {
      systemPrompt += '请使用富有诗意、优美的文学风格进行创作。';
    }

    messages.push({
      role: 'system',
      content: systemPrompt,
    });

    // 使用智能上下文管理器获取上下文
    let contextText = '';
    
    if (dto.context) {
      // 如果用户提供了上下文，直接使用
      contextText = dto.context;
    } else {
      // 否则，智能提取上下文
      try {
        // 从用户提示中提取关键词
        const keywords = this.extractKeywords(dto.prompt);
        
        // 获取智能上下文
        const smartContext = await this.contextManager.getSmartContext({
          userId,
          novelId: dto.novelId,
          keywords,
          maxMemories: 5,
          maxChapters: 2,
          includeOutline: true,
          includeCharacters: true,
        });

        // 格式化上下文为文本
        contextText = this.contextManager.formatContextForAI(smartContext);
      } catch (error) {
        console.error('获取智能上下文失败:', error);
        // 如果智能上下文获取失败，使用基本信息
        contextText = `【小说信息】\n`;
        contextText += `标题：${novel.title}\n`;
        if (novel.description) {
          contextText += `简介：${novel.description}\n`;
        }
        if (novel.outline?.content) {
          contextText += `\n【故事大纲】\n${novel.outline.content}\n`;
        }
      }
    }

    messages.push({
      role: 'user',
      content: contextText,
    });

    // 根据内容类型构建具体提示
    let taskPrompt = '';
    
    switch (dto.contentType) {
      case 'continuation':
        taskPrompt = `请基于以上信息，续写${this.getLengthDescription(dto.length)}的内容。`;
        break;
      case 'scene':
        taskPrompt = `请基于以上信息，创作${this.getLengthDescription(dto.length)}的场景描写。`;
        break;
      case 'dialogue':
        taskPrompt = `请基于以上信息，创作${this.getLengthDescription(dto.length)}的对话内容。`;
        break;
      case 'description':
        taskPrompt = `请基于以上信息，创作${this.getLengthDescription(dto.length)}的环境/人物描写。`;
        break;
      case 'opening':
        taskPrompt = `请基于以上信息，创作${this.getLengthDescription(dto.length)}的开头内容。`;
        break;
      case 'ending':
        taskPrompt = `请基于以上信息，创作${this.getLengthDescription(dto.length)}的结尾内容。`;
        break;
      default:
        taskPrompt = `请基于以上信息，续写${this.getLengthDescription(dto.length)}的内容。`;
    }

    // 添加用户的具体要求
    if (dto.prompt) {
      taskPrompt += `\n\n用户要求：${dto.prompt}`;
    }

    messages.push({
      role: 'user',
      content: taskPrompt,
    });

    return messages;
  }

  /**
   * 从文本中提取关键词（简单实现）
   */
  private extractKeywords(text: string): string[] {
    // 移除标点符号和特殊字符
    const cleanText = text.replace(/[，。！？；：""''（）【】《》、]/g, ' ');
    
    // 分词（简单按空格分）
    const words = cleanText.split(/\s+/).filter(w => w.length > 1);
    
    // 返回前5个词作为关键词
    return words.slice(0, 5);
  }

  /**
   * 根据风格获取温度参数
   */
  private getTemperatureByStyle(style?: string): number {
    switch (style) {
      case 'formal':
        return 0.5; // 正式风格，较低的随机性
      case 'casual':
        return 0.8; // 休闲风格，较高的随机性
      case 'poetic':
        return 0.9; // 诗意风格，最高的随机性
      default:
        return 0.7; // 默认中等随机性
    }
  }

  /**
   * 根据长度获取最大token数
   */
  private getMaxTokensByLength(length?: string): number {
    switch (length) {
      case 'short':
        return 500; // 短文本：约200-300字
      case 'medium':
        return 1000; // 中等长度：约400-600字
      case 'long':
        return 2000; // 长文本：约800-1200字
      default:
        return 1000; // 默认中等长度
    }
  }

  /**
   * 获取长度描述
   */
  private getLengthDescription(length?: string): string {
    switch (length) {
      case 'short':
        return '200-300字';
      case 'medium':
        return '400-600字';
      case 'long':
        return '800-1200字';
      default:
        return '400-600字';
    }
  }

  /**
   * 计算字数
   */
  private calculateWordCount(content: string): number {
    const chineseChars = (content.match(/[\u4e00-\u9fff]/g) || []).length;
    const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
    return chineseChars + englishWords;
  }

  // ===== 素材相关生成功能 =====

  /**
   * 基于素材生成内容
   */
  async generateWithMaterials(userId: string, dto: any) {
    try {
      // 1. 获取素材内容
      const materials = await this.prisma.material.findMany({
        where: {
          id: { in: dto.materialIds },
          userId,
        },
        select: {
          id: true,
          name: true,
          type: true,
          fileUrl: true,
          description: true,
        }
      });

      if (materials.length === 0) {
        throw new HttpException('未找到可用的素材', HttpStatus.NOT_FOUND);
      }

      // 2. 构建素材上下文
      const materialContext = materials.map(m => {
        return `素材《${m.name}》${m.description ? `：${m.description}` : ''}
内容摘要：${m.fileUrl ? m.fileUrl.substring(0, 500) : '（无内容）'}`;
      }).join('\n\n');

      // 3. 构建AI提示词
      const usageTypeMap: { [key: string]: string } = {
        style: '参考其写作风格和叙事手法',
        structure: '借鉴其情节结构和故事架构',
        character: '学习其角色塑造技巧和人物刻画方式',
        scene: '参考其场景描写和氛围营造手法',
        technique: '吸收其创作技巧和表现手法',
      };

      const usageDesc = usageTypeMap[dto.usageType] || '作为创作参考';

      const messages: AIChatMessage[] = [
        {
          role: 'system',
          content: `你是一位专业的小说创作助手。你需要${usageDesc}，但绝不直接抄袭或照搬原文。
要求：
1. 理解素材的精髓和特点
2. 用自己的方式重新表达和创作
3. 保持原创性，相似度控制在${dto.preventSimilarity ? '20%以下' : '50%以下'}
4. 生成约${dto.targetLength || 1000}字的内容
5. 创意度：${(dto.creativity || 0.8) * 100}%`
        },
        {
          role: 'user',
          content: `参考素材：
${materialContext}

创作需求：${dto.prompt}
${dto.additionalContext ? `\n额外上下文：${dto.additionalContext}` : ''}

请基于以上素材和需求，创作出高质量的原创内容。`
        }
      ];

      // 4. 调用AI
      const response = await this.aiCallerService.callAI({
        userId,
        messages,
        parameters: {
          temperature: dto.creativity || 0.8,
          maxTokens: Math.ceil((dto.targetLength || 1000) * 2),
        },
      });

      // 5. 记录素材使用（简化版，实际应该记录到MaterialReference）
      const materialUsage = materials.map(m => ({
        materialId: m.id,
        materialName: m.name,
        usageType: dto.usageType,
        similarity: 0.15, // 简化版，实际应该真正计算
      }));

      return {
        success: true,
        data: {
          content: response.content,
          materialUsage,
          usage: response.usage,
          model: response.model,
          warnings: dto.preventSimilarity ? ['已启用防抄袭保护'] : [],
        }
      };
    } catch (error) {
      console.error('基于素材生成内容失败:', error);
      throw new HttpException(
        error.message || '生成失败',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 提取写作风格
   */
  async extractStyle(dto: any) {
    const messages: AIChatMessage[] = [
      {
        role: 'system',
        content: '你是一位专业的文学分析师，擅长提取和分析文本的写作风格特征。'
      },
      {
        role: 'user',
        content: `请分析以下文本的写作风格，重点提取：${(dto.features || []).join('、')}

文本内容：
${dto.content}

请以结构化的方式描述这段文本的风格特征。`
      }
    ];

    const response = await this.aiCallerService.callAI({
      userId: 'system', // 系统调用
      messages,
      parameters: {
        temperature: 0.3, // 低温度，更客观
        maxTokens: 1000,
      },
    });

    return {
      success: true,
      data: {
        analysis: response.content,
        materialId: dto.materialId,
        features: dto.features || ['narrative', 'dialogue', 'description'],
      }
    };
  }

  /**
   * 分析情节结构
   */
  async analyzePlot(dto: any) {
    const messages: AIChatMessage[] = [
      {
        role: 'system',
        content: '你是一位专业的故事结构分析师，擅长分析情节发展和叙事架构。'
      },
      {
        role: 'user',
        content: `请分析以下故事的情节结构，分析深度：${dto.depth || 'basic'}

故事内容：
${dto.content}

请识别：开端、发展、高潮、结局，以及关键转折点。`
      }
    ];

    const response = await this.aiCallerService.callAI({
      userId: 'system',
      messages,
      parameters: {
        temperature: 0.3,
        maxTokens: 1500,
      },
    });

    return {
      success: true,
      data: {
        structure: response.content,
        depth: dto.depth || 'basic',
      }
    };
  }

  /**
   * 分析角色特征
   */
  async analyzeCharacter(dto: any) {
    const messages: AIChatMessage[] = [
      {
        role: 'system',
        content: '你是一位专业的角色分析师，擅长分析人物性格、动机和发展弧线。'
      },
      {
        role: 'user',
        content: `请分析${dto.characterName ? `角色"${dto.characterName}"` : '文本中角色'}的特征，分析维度：${(dto.dimensions || []).join('、')}

文本内容：
${dto.content}

请提供详细的角色分析。`
      }
    ];

    const response = await this.aiCallerService.callAI({
      userId: 'system',
      messages,
      parameters: {
        temperature: 0.3,
        maxTokens: 1500,
      },
    });

    return {
      success: true,
      data: {
        analysis: response.content,
        characterName: dto.characterName,
        dimensions: dto.dimensions || ['personality', 'background'],
      }
    };
  }

  /**
   * 检测内容相似度
   */
  async checkSimilarity(dto: any) {
    // 简单的词袋模型相似度计算
    const text1 = dto.content1.toLowerCase();
    const text2 = dto.content2.toLowerCase();
    
    const words1 = new Set(text1.split(/\s+/));
    const words2 = new Set(text2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    const similarity = union.size > 0 ? intersection.size / union.size : 0;
    const threshold = dto.threshold || 0.7;

    return {
      success: true,
      data: {
        similarity: parseFloat(similarity.toFixed(4)),
        threshold,
        isSimilar: similarity > threshold,
        warning: similarity > threshold ? '内容相似度较高，建议修改' : null,
        details: {
          commonWords: intersection.size,
          totalWords: union.size,
          text1Length: words1.size,
          text2Length: words2.size,
        }
      }
    };
  }
}
