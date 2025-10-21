import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { AICallerService } from './ai-caller.service';

/**
 * 角色特征自动提取服务
 * 
 * 职责：
 * 1. 从章节内容自动提取角色特征
 * 2. 生成专业的视觉化描述
 * 3. 管理角色一致性配置
 */
@Injectable()
export class CharacterExtractionService {
  private readonly logger = new Logger(CharacterExtractionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiCaller: AICallerService,
  ) {}

  /**
   * 从章节内容和分镜自动提取角色特征
   */
  async extractCharacterFeatures(
    chapterContent: string,
    storyboard: any,
    novelId: string,
    chapterNumber: number,
  ): Promise<any[]> {
    this.logger.log(`开始提取章节${chapterNumber}的角色特征`);

    const prompt = this.buildExtractionPrompt(chapterContent, storyboard);

    try {
      const response = await this.aiCaller.callAI({
        userId: 'system',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的角色特征提取专家，擅长从文学作品中提取角色的视觉特征并转化为AI绘图提示词。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        parameters: {
          temperature: 0.3,  // 低温度保证稳定性和准确性
          maxTokens: 3000,
        },
      });

      // 解析JSON响应
      const result = this.parseExtractionResult(response.content);
      
      this.logger.log(`成功提取${result.length}个角色特征`);
      return result;
      
    } catch (error) {
      this.logger.error('提取角色特征失败:', error);
      return [];
    }
  }

  /**
   * 保存角色特征到数据库
   */
  async saveCharacterFeatures(
    novelId: string,
    chapterNumber: number,
    extractedCharacters: any[],
  ): Promise<void> {
    for (const char of extractedCharacters) {
      try {
        await this.prisma.characterFeature.upsert({
          where: {
            novelId_chapterNumber_characterName: {
              novelId,
              chapterNumber,
              characterName: char.name,
            },
          },
          update: {
            appearance: char.appearance,
            clothing: char.clothing,
            state: char.state || null,
            visualPrompt: char.visualPrompt,
            negativePrompt: char.negativePrompt || null,
            keywords: char.keywords,
            confidence: char.confidence || 0.8,
            extractedBy: 'storyboard-agent',
          },
          create: {
            novelId,
            chapterNumber,
            characterName: char.name,
            appearance: char.appearance,
            clothing: char.clothing,
            state: char.state || null,
            visualPrompt: char.visualPrompt,
            negativePrompt: char.negativePrompt || null,
            keywords: char.keywords,
            confidence: char.confidence || 0.8,
            extractedBy: 'storyboard-agent',
          },
        });

        this.logger.log(`已保存角色特征: ${char.name} (置信度: ${char.confidence})`);
      } catch (error) {
        this.logger.error(`保存角色特征失败 (${char.name}):`, error);
      }
    }
  }

  /**
   * 自动创建或更新 ConsistencyProfile
   */
  async autoManageConsistencyProfile(
    novelId: string,
    chapterNumber: number,
    extractedCharacters: any[],
  ): Promise<void> {
    // 检查是否已有配置
    let profile = await this.prisma.consistencyProfile.findUnique({
      where: { novelId },
    });

    if (!profile) {
      // 第一次：创建新配置
      profile = await this.createInitialProfile(novelId, chapterNumber, extractedCharacters);
    } else if (profile.autoUpdate) {
      // 后续章节：自动更新
      await this.updateProfileWithNewChapter(profile, chapterNumber, extractedCharacters);
    }
  }

  /**
   * 创建初始一致性配置
   */
  private async createInitialProfile(
    novelId: string,
    chapterNumber: number,
    extractedCharacters: any[],
  ) {
    const characters = extractedCharacters.map(char => ({
      name: char.name,
      baseAppearance: char.appearance,
      keywords: char.keywords,
      referenceImages: [],
      dynamicState: {
        [chapterNumber]: char.state || '正常'
      }
    }));

    const profile = await this.prisma.consistencyProfile.create({
      data: {
        novelId,
        characters: { characters },
        autoExtracted: true,
        lastExtractedAt: new Date(),
        autoUpdate: true,
        visualStyle: {
          overall: 'realistic',
          colorTone: 'natural',
          artStyle: 'cinematic',
          lighting: 'natural',
          additionalTags: []
        },
      },
    });

    this.logger.log(`已创建自动一致性配置: ${novelId}, 角色数: ${characters.length}`);
    return profile;
  }

  /**
   * 更新一致性配置（新章节）
   */
  private async updateProfileWithNewChapter(
    profile: any,
    chapterNumber: number,
    extractedCharacters: any[],
  ) {
    const existingChars = (profile.characters as any).characters || [];
    const updatedChars = [...existingChars];

    for (const extracted of extractedCharacters) {
      const existingIndex = updatedChars.findIndex(c => c.name === extracted.name);

      if (existingIndex === -1) {
        // 新角色，添加
        updatedChars.push({
          name: extracted.name,
          baseAppearance: extracted.appearance,
          keywords: extracted.keywords,
          referenceImages: [],
          dynamicState: {
            [chapterNumber]: extracted.state || '正常'
          }
        });
        this.logger.log(`新增角色: ${extracted.name}`);
      } else {
        // 已有角色，更新动态状态
        const existing = updatedChars[existingIndex];
        existing.dynamicState = {
          ...existing.dynamicState,
          [chapterNumber]: extracted.state || '正常'
        };

        // 如果外貌有明显变化，智能合并
        if (this.shouldUpdateAppearance(existing.baseAppearance, extracted.appearance)) {
          const mergedAppearance = this.mergeAppearance(
            existing.baseAppearance,
            extracted.appearance
          );
          existing.baseAppearance = mergedAppearance;
          this.logger.log(`更新角色外貌: ${extracted.name}`);
        }
      }
    }

    // 保存更新
    await this.prisma.consistencyProfile.update({
      where: { novelId: profile.novelId },
      data: {
        characters: { characters: updatedChars },
        lastExtractedAt: new Date(),
        updateHistory: {
          ...((profile.updateHistory as any) || {}),
          [chapterNumber]: {
            timestamp: new Date(),
            changes: extractedCharacters.map(c => c.name),
            changeCount: extractedCharacters.length,
          }
        },
      },
    });

    this.logger.log(`已更新一致性配置: ${profile.novelId}, 章节: ${chapterNumber}`);
  }

  /**
   * 获取角色特征（用于图片生成）
   */
  async getCharacterFeatures(
    novelId: string,
    chapterNumber: number,
    characterNames: string[],
  ): Promise<any[]> {
    if (!novelId || !characterNames.length) {
      return [];
    }

    // 先尝试当前章节
    let features = await this.prisma.characterFeature.findMany({
      where: {
        novelId,
        chapterNumber,
        characterName: { in: characterNames },
      },
    });

    // 如果当前章节没有，回退到最近的章节
    if (features.length < characterNames.length && chapterNumber > 1) {
      const missingNames = characterNames.filter(
        name => !features.some(f => f.characterName === name)
      );

      const previousFeatures = await this.prisma.characterFeature.findMany({
        where: {
          novelId,
          chapterNumber: { lt: chapterNumber },
          characterName: { in: missingNames },
        },
        orderBy: { chapterNumber: 'desc' },
        distinct: ['characterName'],
      });

      features = [...features, ...previousFeatures];
      this.logger.log(`使用前序章节特征，补充${previousFeatures.length}个角色`);
    }

    return features;
  }

  /**
   * 存储角色参考图
   */
  async storeCharacterReference(
    novelId: string,
    chapterNumber: number,
    characterName: string,
    imageUrl: string,
    providerId?: string,
  ): Promise<void> {
    const feature = await this.prisma.characterFeature.findUnique({
      where: {
        novelId_chapterNumber_characterName: {
          novelId,
          chapterNumber,
          characterName,
        },
      },
    });

    if (feature && !feature.referenceImageUrl) {
      await this.prisma.characterFeature.update({
        where: { id: feature.id },
        data: {
          referenceImageUrl: imageUrl,
          referenceId: providerId,
        },
      });

      this.logger.log(`已存储角色参考图: ${characterName}`);

      // 同时更新ConsistencyProfile
      await this.updateProfileReferenceImage(novelId, characterName, imageUrl);
    }
  }

  /**
   * 更新ConsistencyProfile中的参考图
   */
  private async updateProfileReferenceImage(
    novelId: string,
    characterName: string,
    imageUrl: string,
  ): Promise<void> {
    const profile = await this.prisma.consistencyProfile.findUnique({
      where: { novelId },
    });

    if (profile) {
      const characters = (profile.characters as any).characters || [];
      const updated = characters.map(char => {
        if (char.name === characterName) {
          return {
            ...char,
            referenceImages: [imageUrl, ...(char.referenceImages || [])]
          };
        }
        return char;
      });

      await this.prisma.consistencyProfile.update({
        where: { novelId },
        data: {
          characters: { characters: updated },
        },
      });
    }
  }

  /**
   * 构建提取提示词
   */
  private buildExtractionPrompt(chapterContent: string, storyboard: any): string {
    // 截取内容（避免过长）
    const contentPreview = chapterContent.length > 3000 
      ? chapterContent.substring(0, 3000) + '...' 
      : chapterContent;

    return `
分析以下章节内容和分镜脚本，提取所有出现的主要角色特征。

【章节内容】
${contentPreview}

【分镜脚本】
${JSON.stringify(storyboard, null, 2)}

请提取角色信息并以JSON格式返回：
{
  "characters": [
    {
      "name": "角色姓名",
      "appearance": "详细的外貌描述（年龄、性别、身高、发型、脸型、五官特征、肤色等）",
      "clothing": "详细的服饰描述（衣服款式、颜色、材质、配饰、鞋子等）",
      "state": "当前状态（如：受伤、疲惫、愤怒、兴奋等，正常则为null）",
      "visualPrompt": "适合Stable Diffusion的英文提示词（professional, detailed, high quality）",
      "negativePrompt": "负向提示词（应该避免的特征，如：blurry, low quality, distorted）",
      "keywords": ["关键词1", "关键词2", "关键词3"],
      "confidence": 0.95
    }
  ]
}

提取要求：
1. 只提取明确出现的主要角色（最多5个）
2. 外貌描述要具体、可视化，便于AI绘图
3. 服饰要符合时代背景和角色身份
4. visualPrompt要专业（Midjourney/Stable Diffusion风格）
5. 使用英文关键词，确保AI理解准确
6. confidence表示提取的置信度（0-1），基于文本明确程度

示例输出：
{
  "characters": [
    {
      "name": "李明",
      "appearance": "25岁中国男性，身高180cm，黑色短发，深邃的双眼，轮廓分明的脸庞，剑眉星目",
      "clothing": "深蓝色考古工作服，棕色皮质背包，米色休闲裤，黑色登山靴，戴着考古手套",
      "state": "专注认真",
      "visualPrompt": "a 25-year-old Chinese male archaeologist, 180cm tall, short black hair, deep eyes, defined facial features, wearing dark blue archaeological work clothes, brown leather backpack, beige casual pants, black hiking boots, wearing archaeological gloves, professional, detailed, high quality, cinematic lighting",
      "negativePrompt": "blurry, low quality, distorted, deformed, disfigured, ugly, bad anatomy, bad proportions",
      "keywords": ["考古学家", "专业", "年轻", "帅气", "认真"],
      "confidence": 0.95
    }
  ]
}

请严格按照JSON格式返回，不要添加任何其他内容。
`;
  }

  /**
   * 解析提取结果
   */
  private parseExtractionResult(content: string): any[] {
    try {
      // 提取JSON内容
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        this.logger.warn('未找到JSON格式的响应');
        return [];
      }

      const result = JSON.parse(jsonMatch[0]);
      return result.characters || [];
    } catch (error) {
      this.logger.error('解析提取结果失败:', error);
      
      // 尝试修复常见的JSON错误
      try {
        const cleaned = content
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
        const result = JSON.parse(cleaned);
        return result.characters || [];
      } catch (e) {
        this.logger.error('修复解析失败:', e);
        return [];
      }
    }
  }

  /**
   * 判断是否需要更新外貌
   */
  private shouldUpdateAppearance(existing: string, extracted: string): boolean {
    // 如果新描述更详细（字数多20%以上），则更新
    return extracted.length > existing.length * 1.2;
  }

  /**
   * 合并外貌描述
   */
  private mergeAppearance(existing: string, extracted: string): string {
    // 简单策略：优先使用更详细的描述
    if (extracted.length > existing.length) {
      return extracted;
    }
    
    // TODO: 可以实现更智能的合并算法
    // 例如：提取关键特征词，去重后组合
    
    return existing;
  }

  /**
   * 识别场景中的角色
   */
  identifyCharactersInScene(sceneDescription: string, knownCharacters: string[] = []): string[] {
    const identified = [];

    // 方法1: 匹配已知角色名
    for (const charName of knownCharacters) {
      if (sceneDescription.includes(charName)) {
        identified.push(charName);
      }
    }

    // 方法2: 简单的中文姓名识别
    if (identified.length === 0) {
      const namePattern = /([李王张刘陈杨黄赵吴周徐孙马朱胡郭何高林罗郑梁]\w{1,2})/g;
      const matches = sceneDescription.match(namePattern);
      if (matches) {
        identified.push(...new Set(matches));
      }
    }

    return identified;
  }

  /**
   * 识别主要角色
   */
  identifyMainCharacter(sceneDescription: string, knownCharacters: string[] = []): string | null {
    const identified = this.identifyCharactersInScene(sceneDescription, knownCharacters);
    return identified.length > 0 ? identified[0] : null;
  }

  /**
   * 获取角色的完整特征（基础+动态）
   */
  async getCharacterFullFeature(
    novelId: string,
    chapterNumber: number,
    characterName: string,
  ): Promise<{
    appearance: string;
    clothing: string;
    state: string;
    visualPrompt: string;
    negativePrompt: string;
  } | null> {
    // 先查找当前章节
    let feature = await this.prisma.characterFeature.findUnique({
      where: {
        novelId_chapterNumber_characterName: {
          novelId,
          chapterNumber,
          characterName,
        },
      },
    });

    // 如果没有，查找最近的章节
    if (!feature && chapterNumber > 1) {
      feature = await this.prisma.characterFeature.findFirst({
        where: {
          novelId,
          chapterNumber: { lt: chapterNumber },
          characterName,
        },
        orderBy: { chapterNumber: 'desc' },
      });
    }

    if (!feature) {
      return null;
    }

    return {
      appearance: feature.appearance,
      clothing: feature.clothing,
      state: feature.state || '正常',
      visualPrompt: feature.visualPrompt,
      negativePrompt: feature.negativePrompt || '',
    };
  }
}

