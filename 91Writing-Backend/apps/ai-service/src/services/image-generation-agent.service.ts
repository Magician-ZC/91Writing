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
    const systemPrompt = `你是一个AI绘图提示词优化专家。你的任务是优化现有提示词，使其更加精确、视觉化，适合seedream等AI绘图模型。

优化要点：
1. 增强视觉细节描述（景别、环境、物体细节）
2. 添加艺术风格和质量标签
3. 优化描述顺序（景别→场景→角色→动作→环境→风格→质量）
4. 确保描述具体，不使用指代词
5. 保持原意不变
6. 检查并移除敏感词汇

输出优化后的提示词（中文），详细且具体，至少60字。`;

    const userPrompt = `请优化以下提示词：

${basePrompt}

场景描述：${scene.description}
镜头角度：${scene.cameraAngle}
环境：${scene.environment}

请输出优化后的中文提示词，确保：
- 明确描述景别（全景/中景/近景/特写）
- 详细描述场景环境
- 清晰描述角色站位、动作、表情
- 包含风格描述
- 至少60字`;

    try {
      const response = await this.aiCaller.callAI({
        userId: 'system',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        parameters: {
          temperature: 0.7,
          maxTokens: 500,
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

    return `你是一个专业的AI绘图提示词生成专家。你的任务是将场景描述转化为详细的视觉化提示词，用于seedream生图模型。

# 技能要求
1. 详细描述场景要素：
   - 景别（全景/中景/近景/特写）
   - 时间、地点
   - 场景环境描述
   - 画面描述
   - 物体和细节（如形状/颜色/大小/位置）
   - 风格描述
   - 角色站位位置/角色动作/角色表情

2. 准确描述角色外貌和特征（确保一致性）
3. 详细描述环境、氛围、光线
4. 添加艺术风格、色调、质量标签
5. 根据镜头角度调整构图描述
6. 使用具体的视觉化词汇

# 风格词库参考
绘本风格、古风插画、lo-fi插画、宫崎骏动漫、日漫风格、赛璐璐风格、儿童画、2D Cartoon、欧美动画、2D动画风格、国漫风格、中国风、Ancient China Illustration、新艺术派风、美漫风格、厚涂风格、半厚涂风格、奇幻风、奇幻风格、侘寂风、中式恐怖、日杂风、民国风、老钱风、森系、欧美杂志封面插画、拼贴风、小清新、Springtime Aesthetic、野性美、甜酷辣妹风、复古风、American retro style、波西米亚风、像素风、宫崎骏、京剧风格、乐高风格、Lowbrow art、丁丁历险记、flat style、轻酸性设计、扁平渐变风格、盲盒风格、Barbie style、港风、敦煌美学、Pastoral style、wasteland、老照片、国家地理风格、国画风格、水墨风、山水画、绢本画、工笔风格、花鸟画、版画、色粉画、后印象派、连环画、皮影、剪纸、极简主义、弥散风格、晕染风格、漆画风格

# 生图提示词参考
1. 推文通用: 2d漫画，细线条，厚涂，简洁，柔和的灯光，平面插画，动漫美感，数字技术技艺
2. 新二次元: 二次元，平面插画，光影质感，原神
3. 国风漫画: 中国古风二次元风格, 参考苏摩画风, 赛璐珞着色，厚涂漫画, 散点透视
4. 都市气质: Josei, modern, modern city, modern and fashionable, cool_theme, metropolis, sumptuous, mature, painting, 动漫风格，灵活的构图，成熟
5. 仙侠古风: 2d漫画，细线条，柔和的灯光，平面插画，动漫美感，数字技术技艺，游戏CG，影视级画面，高质感，仙侠古风，古风
6. 水墨国风: 2.5D,bloom,ink washing,watercolor,realistic,gentle,Chinese painting, blush soft tones, ink, abstract ink, high saturation, niji, martial arts,ink and watercolor, highly saturated tones, ultra-fine, gray smoke,gufeng,beauty,dramatic light,small_eyes,floating hair,ancient China, 动漫风格，灵活的构图，成熟
7. 恐怖悬疑: 平面插画，动漫，黑暗诡异风格，诡异氛围，惊悚

# 注意事项
- 将画面中的物体细节都描述清楚
- 重点关注多个分镜间前后的内容和效果连贯性
- 明确画面主体的位置和状态，不要用"这个""那个"等词指代
- 内容60字以上
- 检查并移除敏感词汇（涉政、涉黄、暴力、血腥等）
- 输出中文描述，详细且具体`;
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

