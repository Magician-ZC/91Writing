import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { AICallerService } from './ai-caller.service';
import { StoryboardSceneDto, VideoPromptDto } from '../dto/video-generation.dto';

/**
 * 图生视频优化Agent
 * 
 * 职责：
 * 1. 根据分镜描述生成运动提示词
 * 2. 配置视频时长、运动幅度
 * 3. 设置人物一致性参数
 * 4. 优化镜头运动描述
 */
@Injectable()
export class VideoGenerationAgentService {
  private readonly logger = new Logger(VideoGenerationAgentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiCaller: AICallerService,
  ) {}

  /**
   * 生成视频提示词
   */
  async generateVideoPrompt(
    scene: StoryboardSceneDto,
    imageUrl: string,
    consistencyProfile: any,
  ): Promise<VideoPromptDto> {
    this.logger.log(`生成视频提示词，场景: ${scene.sceneNumber}`);

    // 1. 生成运动提示词
    const motionPrompt = await this.generateMotionPrompt(scene, consistencyProfile);

    // 2. 确定运动幅度
    const motionIntensity = this.determineMotionIntensity(scene);

    // 3. 获取人物一致性ID
    const characterConsistencyId = await this.getCharacterConsistencyId(
      scene.characters,
      consistencyProfile,
    );

    return {
      sceneNumber: scene.sceneNumber,
      motionPrompt,
      duration: scene.duration,
      motionIntensity,
      characterConsistencyId,
    };
  }

  /**
   * 批量生成视频提示词
   */
  async generateVideoPromptBatch(
    scenes: StoryboardSceneDto[],
    imageUrls: string[],
    consistencyProfile: any,
  ): Promise<VideoPromptDto[]> {
    this.logger.log(`批量生成视频提示词，数量: ${scenes.length}`);

    const prompts: VideoPromptDto[] = [];

    for (let i = 0; i < scenes.length; i++) {
      const prompt = await this.generateVideoPrompt(
        scenes[i],
        imageUrls[i],
        consistencyProfile,
      );
      prompts.push(prompt);
    }

    return prompts;
  }

  /**
   * 生成运动提示词
   */
  private async generateMotionPrompt(
    scene: StoryboardSceneDto,
    consistencyProfile: any,
  ): Promise<string> {
    // 获取Agent配置
    const agentConfig = await this.getAgentConfig('VIDEO_OPTIMIZER');
    const systemPrompt = this.buildSystemPrompt(agentConfig);
    const userPrompt = this.buildUserPrompt(scene, consistencyProfile);

    try {
      const response = await this.aiCaller.callAI({
        userId: 'system',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        parameters: {
          temperature: 0.7,
          maxTokens: 200,
        },
      });

      return response.content.trim();
    } catch (error) {
      this.logger.error(`生成运动提示词失败: ${error.message}`);
      // 返回默认运动描述
      return this.generateFallbackMotionPrompt(scene);
    }
  }

  /**
   * 构建系统提示词
   */
  private buildSystemPrompt(agentConfig: any): string {
    if (agentConfig && agentConfig.systemPrompt) {
      return agentConfig.systemPrompt;
    }

    return `你是一个专业的视频运动描述专家。你的任务是为静态图片生成合适的运动提示词，使其转化为流畅的视频片段，用于seedance生视频模型。

# 技能要求
1. 视频动作提示词详细描述：
   - 镜头运镜方式与镜头变化
   - 角色站位/角色动作/角色表情
   - 说话人的角色名称（说话人的嘴有动作）
   - 场景环境的变化描述
   - 画面变化描述
   - 物体和细节变化描述
   - 参考首帧画面提示词进行风格描述

2. 根据场景描述生成自然的运动效果
3. 考虑镜头运动（推拉摇移升降）
4. 考虑主体运动（角色动作、表情变化）
5. 考虑环境动态（风吹、光影变化等）
6. 保持运动幅度适中，避免过于夸张

# 注意事项
- 将画面中的物体细节的变化都描述清楚
- 重点结合首帧图提示词进行画面动态过程的描述
- 重点考虑多个分镜间前后的内容和效果连贯性
- 特别明确画面主体的具体位置和详细状态
- 不要用"这个""那个"等词指代
- 内容100字以上
- 检查并移除敏感词汇

输出中文运动描述，详细且具体，至少100字。`;
  }

  /**
   * 构建用户提示词
   */
  private buildUserPrompt(
    scene: StoryboardSceneDto,
    consistencyProfile: any,
  ): string {
    let prompt = `请为以下场景生成详细的视频运动描述：

【场景描述】
${scene.description}

【关键情节】
${scene.keyMoment}

【镜头角度】
${scene.cameraAngle}

【环境】
${scene.environment}

【时长】
${scene.duration}秒`;

    // 添加角色信息
    if (scene.characters.length > 0) {
      prompt += `\n\n【角色】\n${scene.characters.join(', ')}`;
      
      // 添加角色详细信息
      if (consistencyProfile?.characters) {
        prompt += `\n\n【角色详细信息】`;
        scene.characters.forEach((charName) => {
          const char = consistencyProfile.characters[charName];
          if (char) {
            prompt += `\n- ${char.name}: ${char.baseAppearance}`;
          }
        });
      }
    }

    // 添加特殊效果
    if (scene.specialEffects) {
      prompt += `\n\n【特殊效果】\n${scene.specialEffects}`;
    }

    prompt += `\n\n请生成详细的中文运动描述，确保：
- 描述镜头运镜方式与镜头变化
- 描述角色站位、角色动作、角色表情
- 如有说话人，明确说话人的嘴部动作
- 描述场景环境的变化
- 描述画面整体变化和物体细节变化
- 结合首帧画面提示词进行风格描述
- 内容至少100字
- 不使用指代词，明确具体位置和状态`;

    return prompt;
  }

  /**
   * 确定运动幅度
   */
  private determineMotionIntensity(scene: StoryboardSceneDto): 'low' | 'medium' | 'high' {
    // 根据场景描述和关键词判断运动幅度
    const description = scene.description.toLowerCase() + ' ' + scene.keyMoment.toLowerCase();

    // 高强度关键词
    const highIntensityKeywords = ['战斗', '爆炸', '追逐', 'fight', 'explosion', 'chase', 'run', 'jump'];
    // 低强度关键词
    const lowIntensityKeywords = ['静坐', '思考', '对话', 'sit', 'think', 'dialogue', 'talk', 'calm'];

    if (highIntensityKeywords.some(keyword => description.includes(keyword))) {
      return 'high';
    }

    if (lowIntensityKeywords.some(keyword => description.includes(keyword))) {
      return 'low';
    }

    return 'medium';
  }

  /**
   * 获取人物一致性ID
   */
  private async getCharacterConsistencyId(
    characters: string[],
    consistencyProfile: any,
  ): Promise<string | undefined> {
    if (!characters.length || !consistencyProfile?.characters) {
      return undefined;
    }

    // 返回主要角色的一致性ID
    const mainCharName = characters[0];
    const char = consistencyProfile.characters[mainCharName];
    
    // 这里可以根据实际API的要求生成或获取一致性ID
    // 暂时返回角色名作为ID
    return char ? mainCharName : undefined;
  }

  /**
   * 生成兜底运动提示词
   */
  private generateFallbackMotionPrompt(scene: StoryboardSceneDto): string {
    const cameraMotions = {
      'close-up': 'slow zoom in, subtle movement',
      'medium': 'gentle camera pan, natural motion',
      'wide': 'slow camera dolly, establishing shot',
      'full': 'smooth tracking shot, wide angle',
    };

    const cameraAngle = scene.cameraAngle.toLowerCase();
    return cameraMotions[cameraAngle] || 'smooth camera movement, natural motion';
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
}

