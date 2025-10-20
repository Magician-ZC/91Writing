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
}
