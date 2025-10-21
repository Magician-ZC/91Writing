import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ExtractFeaturesDto } from './dto/extract-features.dto';

@Injectable()
export class CharacterConsistencyService {
  private openai: OpenAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
      baseURL: this.configService.get<string>('OPENAI_API_BASE_URL'),
    });
  }

  /**
   * 提取角色特征
   */
  async extractFeatures(
    userId: string,
    characterId: string,
    extractDto: ExtractFeaturesDto,
  ) {
    // 验证角色所有权
    const character = await this.validateCharacterOwnership(userId, characterId);

    // 获取章节内容
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: extractDto.chapterId },
    });

    if (!chapter) {
      throw new NotFoundException('章节不存在');
    }

    // AI提取特征
    const extractedFeatures = await this.aiExtractFeatures(
      character,
      chapter,
    );

    // 保存特征
    const savedFeatures = await Promise.all(
      extractedFeatures.map(feature =>
        this.prisma.characterFeature.create({
          data: {
            characterId,
            featureType: feature.type,
            featureName: feature.name,
            featureValue: feature.value,
            extractedFrom: 'ai_extracted',
            sourceChapterId: chapter.id,
            locationInText: feature.location,
            confidence: feature.confidence,
            isConfirmed: extractDto.autoConfirm,
          },
        })
      )
    );

    return savedFeatures;
  }

  /**
   * AI提取特征
   */
  private async aiExtractFeatures(character: any, chapter: any) {
    const prompt = `
请从以下文本中提取关于"${character.name}"的特征信息：

${chapter.content}

请提取以下类型的特征：
1. appearance (外貌特征): 如发色、眼睛颜色、身高、体型等
2. personality (性格特点): 如勇敢、温柔、狡猾等
3. behavior (行为习惯): 如口头禅、习惯动作等
4. speech (说话方式): 如语气、用词特点等

返回JSON格式：
{
  "features": [
    {
      "type": "appearance/personality/behavior/speech",
      "name": "特征名称（如：眼睛颜色）",
      "value": "特征值（如：蓝色）",
      "location": "提取自的文本片段（30字以内）",
      "confidence": 0.8
    }
  ]
}

只返回明确提到的特征，不要推测。
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.configService.get<string>('OPENAI_MODEL_NAME') || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: '你是专业的文本特征提取助手，只提取明确的信息。' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || '{"features":[]}');
      return result.features || [];
    } catch (error) {
      console.error('AI特征提取失败:', error);
      return [];
    }
  }

  /**
   * 获取角色特征列表
   */
  async getFeatures(userId: string, characterId: string) {
    // 验证所有权
    await this.validateCharacterOwnership(userId, characterId);

    return this.prisma.characterFeature.findMany({
      where: { characterId },
      include: {
        sourceChapter: {
          select: {
            id: true,
            chapterNumber: true,
            title: true,
          },
        },
      },
      orderBy: [
        { featureType: 'asc' },
        { firstMentioned: 'desc' },
      ],
    });
  }

  /**
   * 获取角色统计信息
   */
  async getStatistics(userId: string, characterId: string) {
    // 验证所有权
    const character = await this.validateCharacterOwnership(userId, characterId);

    // 获取出场记录
    const appearances = await this.prisma.characterAppearance.findMany({
      where: { characterId },
      include: {
        chapter: {
          select: {
            chapterNumber: true,
            title: true,
          },
        },
      },
      orderBy: { chapter: { chapterNumber: 'asc' } },
    });

    // 计算统计信息
    const totalAppearances = appearances.length;
    const totalMentions = appearances.reduce((sum, a) => sum + a.mentionCount, 0);
    const totalDialogues = appearances.reduce((sum, a) => sum + a.dialogueCount, 0);
    const totalActions = appearances.reduce((sum, a) => sum + a.actionCount, 0);

    // 获取总章节数
    const totalChapters = await this.prisma.chapter.count({
      where: { novelId: character.novelId },
    });

    return {
      characterId,
      characterName: character.name,
      totalAppearances,
      totalMentions,
      totalDialogues,
      totalActions,
      appearanceRate: totalChapters > 0 ? totalAppearances / totalChapters : 0,
      firstAppearance: appearances[0]?.chapter.chapterNumber,
      lastAppearance: appearances[appearances.length - 1]?.chapter.chapterNumber,
      appearanceChart: appearances.map(a => ({
        chapterNumber: a.chapter.chapterNumber,
        mentionCount: a.mentionCount,
        dialogueCount: a.dialogueCount,
        actionCount: a.actionCount,
      })),
    };
  }

  /**
   * 检查章节中的角色一致性
   */
  async checkConsistency(
    userId: string,
    chapterId: string,
  ) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        novel: true,
      },
    });

    if (!chapter) {
      throw new NotFoundException('章节不存在');
    }

    if (chapter.novel.userId !== userId) {
      throw new BadRequestException('无权限访问');
    }

    // 获取小说中的所有角色
    const characters = await this.prisma.character.findMany({
      where: { novelId: chapter.novelId },
    });

    const warnings = [];

    // 检查每个角色的一致性
    for (const character of characters) {
      if (!chapter.content.includes(character.name)) {
        continue; // 跳过未出现的角色
      }

      const characterWarnings = await this.checkCharacterInChapter(
        character,
        chapter,
      );

      warnings.push(...characterWarnings);
    }

    return warnings;
  }

  /**
   * 检查特定角色在章节中的一致性
   */
  private async checkCharacterInChapter(character: any, chapter: any) {
    const warnings = [];

    // 获取已有特征
    const existingFeatures = await this.prisma.characterFeature.findMany({
      where: { 
        characterId: character.id,
        isConfirmed: true,
      },
    });

    if (existingFeatures.length === 0) {
      return warnings; // 如果没有已确认的特征，跳过
    }

    // 提取当前章节的特征描述
    const currentFeatures = await this.aiExtractFeatures(character, chapter);

    // 对比检测
    for (const current of currentFeatures) {
      const existing = existingFeatures.find(
        f => f.featureType === current.type && f.featureName === current.name
      );

      if (existing) {
        // 检查特征值是否一致
        const similarity = this.calculateSimilarity(
          existing.featureValue,
          current.value
        );

        if (similarity < 0.7) {
          const warning = await this.prisma.characterConsistencyWarning.create({
            data: {
              characterId: character.id,
              warningType: `${current.type}_conflict`,
              severity: similarity < 0.3 ? 'high' : 'medium',
              description: `${current.name}描述不一致：之前是"${existing.featureValue}"，现在是"${current.value}"`,
              suggestion: '请确认是否是角色成长变化，或检查是否为笔误',
              chapterId: chapter.id,
              locationText: current.location,
              conflictWith: `来源: 第${existing.sourceChapter?.chapterNumber || '?'}章`,
              status: 'active',
            },
          });

          warnings.push(warning);
        }
      }
    }

    return warnings;
  }

  /**
   * 获取角色警告列表
   */
  async getWarnings(userId: string, characterId: string) {
    // 验证所有权
    await this.validateCharacterOwnership(userId, characterId);

    return this.prisma.characterConsistencyWarning.findMany({
      where: { characterId },
      include: {
        chapter: {
          select: {
            chapterNumber: true,
            title: true,
          },
        },
      },
      orderBy: [
        { severity: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * 记录角色出场
   */
  async recordAppearance(
    chapterId: string,
    characterId: string,
    counts: {
      mentionCount?: number;
      dialogueCount?: number;
      actionCount?: number;
    }
  ) {
    return this.prisma.characterAppearance.upsert({
      where: {
        characterId_chapterId: {
          characterId,
          chapterId,
        },
      },
      create: {
        characterId,
        chapterId,
        ...counts,
      },
      update: counts,
    });
  }

  // ========== 辅助方法 ==========

  private async validateCharacterOwnership(userId: string, characterId: string) {
    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
      include: { novel: true },
    });

    if (!character) {
      throw new NotFoundException('角色不存在');
    }

    if (character.novel.userId !== userId) {
      throw new BadRequestException('无权限访问');
    }

    return character;
  }

  private calculateSimilarity(text1: string, text2: string): number {
    // 简单的相似度计算
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }
}

