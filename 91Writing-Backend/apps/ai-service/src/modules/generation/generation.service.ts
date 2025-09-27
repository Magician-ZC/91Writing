import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { GenerateContentDto } from '../../dto/conversation.dto';

@Injectable()
export class GenerationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 生成内容
   */
  async generateContent(userId: string, dto: GenerateContentDto) {
    // 验证小说权限
    const novel = await this.prisma.novel.findFirst({
      where: { id: dto.novelId, userId },
    });

    if (!novel) {
      throw new Error('小说不存在或无权访问');
    }

    // 这里应该调用实际的AI生成API
    const mockContent = this.generateMockContent(dto);

    // 记录使用统计
    await this.logContentGeneration(userId, dto.prompt.length, mockContent.length);

    return {
      content: mockContent,
      metadata: {
        type: dto.contentType,
        length: dto.length,
        style: dto.style,
        wordCount: this.calculateWordCount(mockContent),
      }
    };
  }

  private generateMockContent(dto: GenerateContentDto): string {
    // 基于内容类型生成模拟内容
    const templates = {
      continuation: '故事继续发展，主角面临了新的挑战...',
      scene: '场景描写：阳光透过窗棂洒在房间里...',
      dialogue: '"这真的是你想要的结果吗？"她轻声问道。',
      description: '环境描写：古老的城堡在月光下显得格外神秘...',
      opening: '开头：那是一个改变一切的夜晚...',
      ending: '结尾：当一切尘埃落定，他们终于明白了真相...',
    };

    return templates[dto.contentType] || templates.continuation;
  }

  private calculateWordCount(content: string): number {
    const chineseChars = (content.match(/[\u4e00-\u9fff]/g) || []).length;
    const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
    return chineseChars + englishWords;
  }

  private async logContentGeneration(userId: string, inputLength: number, outputLength: number) {
    try {
      await this.prisma.aIUsageLog.create({
        data: {
          userId,
          model: 'content-generator',
          functionType: 'content_generation',
          inputTokens: Math.ceil(inputLength / 4),
          outputTokens: Math.ceil(outputLength / 4),
          success: true,
        },
      });
    } catch (error) {
      console.error('Log content generation error:', error);
    }
  }
}
