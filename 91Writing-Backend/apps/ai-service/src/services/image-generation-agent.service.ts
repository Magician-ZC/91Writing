import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { AICallerService } from './ai-caller.service';
import { StoryboardSceneDto } from '../dto/video-generation.dto';
import { ImagePromptDto } from '../dto/video-generation.dto';

/**
 * 文生图优化Agent
 * 
 * 职责：
 * 1. 将分镜描述转化为详细的视觉提示词
 * 2. 注入角色一致性特征（外貌、服装、特征）
 * 3. 添加场景氛围、光影、风格描述
 * 4. 两次AI调用优化提示词质量
 */
@Injectable()
export class ImageGenerationAgentService {
  private readonly logger = new Logger(ImageGenerationAgentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiCaller: AICallerService,
  ) {}

  /**
   * 生成图片提示词
   */
  async generateImagePrompt(
    scene: StoryboardSceneDto,
    consistencyProfile: any,
    chapterNumber: number,
  ): Promise<ImagePromptDto> {
    this.logger.log(`生成图片提示词，场景: ${scene.sceneNumber}`);

    // 1. 第一次调用：生成基础提示词
    const basePrompt = await this.generateBasePrompt(scene, consistencyProfile, chapterNumber);

    // 2. 第二次调用：优化提示词
    const optimizedPrompt = await this.optimizePrompt(basePrompt, scene);

    // 3. 添加负向提示词
    const negativePrompt = this.buildNegativePrompt();

    // 4. 生成一致性参考
    const referenceImageUrl = await this.getConsistencyReference(
      scene.characters,
      consistencyProfile,
    );

    return {
      sceneNumber: scene.sceneNumber,
      positivePrompt: optimizedPrompt,
      negativePrompt,
      size: '1024x576', // 16:9 横屏
      seed: this.generateConsistentSeed(scene.sceneNumber),
      referenceImageUrl,
    };
  }

  /**
   * 批量生成图片提示词
   */
  async generateImagePromptBatch(
    scenes: StoryboardSceneDto[],
    consistencyProfile: any,
    chapterNumber: number,
  ): Promise<ImagePromptDto[]> {
    this.logger.log(`批量生成图片提示词，数量: ${scenes.length}`);

    const prompts: ImagePromptDto[] = [];

    for (const scene of scenes) {
      const prompt = await this.generateImagePrompt(
        scene,
        consistencyProfile,
        chapterNumber,
      );
      prompts.push(prompt);

      // 添加延迟避免API限流
      await this.delay(500);
    }

    return prompts;
  }

  /**
   * 生成基础提示词
   */
  private async generateBasePrompt(
    scene: StoryboardSceneDto,
    consistencyProfile: any,
    chapterNumber: number,
  ): Promise<string> {
    // 获取Agent配置
    const agentConfig = await this.getAgentConfig('IMAGE_OPTIMIZER');
    const systemPrompt = this.buildSystemPrompt(agentConfig);
    const userPrompt = this.buildUserPrompt(scene, consistencyProfile, chapterNumber);

    // 调用AI
    const response = await this.aiCaller.callAI({
      userId: 'system',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      parameters: {
        temperature: 0.8,
        maxTokens: 500,
      },
    });

    return response.content.trim();
  }

  /**
   * 优化提示词
   */
  private async optimizePrompt(basePrompt: string, scene: StoryboardSceneDto): Promise<string> {
    const systemPrompt = `你是一个AI绘图提示词优化专家。你的任务是优化现有提示词，使其更加精确、视觉化，适合Stable Diffusion等AI绘图模型。

优化要点：
1. 增强视觉细节描述
2. 添加艺术风格和质量标签
3. 优化描述顺序（主体→环境→风格→质量）
4. 使用英文关键词
5. 保持原意不变

输出优化后的提示词（英文），用逗号分隔关键词。`;

    const userPrompt = `请优化以下提示词：

${basePrompt}

场景描述：${scene.description}
镜头角度：${scene.cameraAngle}

请输出优化后的英文提示词。`;

    try {
      const response = await this.aiCaller.callAI({
        userId: 'system',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        parameters: {
          temperature: 0.7,
          maxTokens: 400,
        },
      });

      return response.content.trim();
    } catch (error) {
      this.logger.error(`优化提示词失败: ${error.message}`);
      // 返回基础提示词
      return basePrompt;
    }
  }

  /**
   * 构建系统提示词
   */
  private buildSystemPrompt(agentConfig: any): string {
    if (agentConfig && agentConfig.systemPrompt) {
      return agentConfig.systemPrompt;
    }

    return `你是一个专业的AI绘图提示词生成专家。你的任务是将场景描述转化为详细的视觉化提示词。

你需要：
1. 准确描述场景中的角色外貌和特征（确保一致性）
2. 详细描述环境、氛围、光线
3. 添加艺术风格、色调、质量标签
4. 根据镜头角度调整构图描述
5. 使用具体的视觉化词汇

输出英文提示词，用逗号分隔关键词。`;
  }

  /**
   * 构建用户提示词
   */
  private buildUserPrompt(
    scene: StoryboardSceneDto,
    consistencyProfile: any,
    chapterNumber: number,
  ): string {
    let prompt = `请为以下场景生成详细的AI绘图提示词：

【场景描述】
${scene.description}

【镜头角度】
${scene.cameraAngle}

【环境】
${scene.environment}`;

    // 添加角色一致性信息
    if (scene.characters.length > 0 && consistencyProfile?.characters) {
      prompt += `\n\n【角色信息（必须严格遵守）】`;
      scene.characters.forEach((charName) => {
        const char = consistencyProfile.characters[charName];
        if (char) {
          prompt += `\n\n角色: ${char.name}`;
          prompt += `\n基础外貌: ${char.baseAppearance}`;
          
          // 检查动态状态
          const dynamicState = char.dynamicState?.[chapterNumber];
          if (dynamicState) {
            prompt += `\n当前状态: ${dynamicState}`;
          }
          
          // 添加关键词
          if (char.keywords && char.keywords.length > 0) {
            prompt += `\n视觉关键词: ${char.keywords.join(', ')}`;
          }
        }
      });
    }

    // 添加视觉风格
    if (consistencyProfile?.visualStyle) {
      const style = consistencyProfile.visualStyle;
      prompt += `\n\n【视觉风格】`;
      prompt += `\n整体风格: ${style.overall}`;
      prompt += `\n色调: ${style.colorTone}`;
      prompt += `\n艺术风格: ${style.artStyle}`;
      prompt += `\n光照: ${style.lighting}`;
    }

    prompt += `\n\n请生成英文提示词，用逗号分隔。格式：角色描述, 环境描述, 氛围描述, 风格标签, 质量标签`;

    return prompt;
  }

  /**
   * 构建负向提示词
   */
  private buildNegativePrompt(): string {
    return `low quality, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, bad proportions, extra limbs, disfigured, deformed`;
  }

  /**
   * 获取一致性参考图
   */
  private async getConsistencyReference(
    characters: string[],
    consistencyProfile: any,
  ): Promise<string | undefined> {
    if (!characters.length || !consistencyProfile?.characters) {
      return undefined;
    }

    // 获取主要角色的参考图
    const mainCharName = characters[0];
    const char = consistencyProfile.characters[mainCharName];
    
    return char?.referenceImageUrl;
  }

  /**
   * 生成一致性种子
   */
  private generateConsistentSeed(sceneNumber: number): number {
    // 使用场景编号生成固定的种子值，确保重新生成时结果一致
    return 1000000 + sceneNumber * 1000;
  }

  /**
   * 获取Agent配置
   */
  private async getAgentConfig(agentType: string): Promise<any> {
    try {
      const config = await this.prisma.agentPromptConfig.findFirst({
        where: {
          agentType: agentType as any,
          isActive: true,
        },
        orderBy: {
          version: 'desc',
        },
      });

      return config;
    } catch (error) {
      this.logger.warn(`获取Agent配置失败: ${error.message}`);
      return null;
    }
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

