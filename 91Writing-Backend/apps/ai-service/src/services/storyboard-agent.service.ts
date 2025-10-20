import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { AICallerService } from './ai-caller.service';
import { StoryboardSceneDto, StoryboardScriptDto } from '../dto/video-generation.dto';

/**
 * 分镜脚本生成Agent
 * 
 * 职责：
 * 1. 分析章节内容，提取关键情节
 * 2. 识别出现的角色、场景、物品
 * 3. 生成3-8个分镜描述
 * 4. 确保时间线连贯性
 */
@Injectable()
export class StoryboardAgentService {
  private readonly logger = new Logger(StoryboardAgentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiCaller: AICallerService,
  ) {}

  /**
   * 生成分镜脚本
   */
  async generateStoryboard(
    chapterId: string,
    consistencyProfile: any,
    options: {
      sceneCount?: number; // 分镜数量
      totalDuration?: number; // 总时长
    } = {},
  ): Promise<StoryboardScriptDto> {
    this.logger.log(`开始生成分镜脚本，章节ID: ${chapterId}`);

    // 1. 获取章节内容
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        novel: {
          select: {
            id: true,
            title: true,
            genre: true,
            settings: true,
          },
        },
      },
    });

    if (!chapter) {
      throw new Error('章节不存在');
    }

    // 2. 获取Agent提示词配置
    const agentConfig = await this.getAgentConfig('SCRIPT_GENERATOR');

    // 3. 构建提示词
    const systemPrompt = this.buildSystemPrompt(agentConfig);
    const userPrompt = this.buildUserPrompt(
      chapter,
      consistencyProfile,
      options,
    );

    // 4. 调用AI生成分镜脚本
    const response = await this.aiCaller.callAI({
      userId: chapter.novel.userId || 'system',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      parameters: {
        temperature: 0.7,
        maxTokens: 2000,
      },
    });

    // 5. 解析AI响应为结构化数据
    const storyboard = this.parseStoryboardResponse(response.content, options);

    // 6. 验证和优化分镜脚本
    const optimizedStoryboard = await this.optimizeStoryboard(
      storyboard,
      consistencyProfile,
    );

    this.logger.log(`分镜脚本生成完成，共${optimizedStoryboard.scenes.length}个场景`);

    return optimizedStoryboard;
  }

  /**
   * 构建系统提示词
   */
  private buildSystemPrompt(agentConfig: any): string {
    if (agentConfig && agentConfig.systemPrompt) {
      return agentConfig.systemPrompt;
    }

    // 默认系统提示词
    return `你是一个专业的视频分镜脚本编写助手。你的任务是将小说章节内容转化为适合视频化的分镜脚本。

你需要：
1. 提取章节中的关键情节点和视觉化元素
2. 识别出现的角色、场景和重要物品
3. 为每个分镜场景生成详细描述，包括：
   - 场景编号
   - 场景描述（视觉化描述）
   - 出现的角色列表
   - 环境/场景
   - 预计时长（秒）
   - 关键情节点
   - 镜头角度建议
4. 确保分镜之间的时间线和逻辑连贯性
5. 适当压缩和精炼，突出核心情节

输出格式为JSON，包含scenes数组和摘要信息。`;
  }

  /**
   * 构建用户提示词
   */
  private buildUserPrompt(
    chapter: any,
    consistencyProfile: any,
    options: any,
  ): string {
    const sceneCount = options.sceneCount || 5;
    const totalDuration = options.totalDuration || 15;
    const avgDuration = Math.floor(totalDuration / sceneCount);

    let prompt = `请为以下章节内容生成${sceneCount}个分镜场景，总时长约${totalDuration}秒。

【小说信息】
标题：${chapter.novel.title}
类型：${chapter.novel.genre || '未知'}

【章节信息】
章节号：第${chapter.chapterNumber}章
标题：${chapter.title}
内容：
${chapter.content}

【一致性要求】`;

    // 添加角色一致性信息
    if (consistencyProfile?.characters) {
      const characters = Object.values(consistencyProfile.characters) as any[];
      prompt += `\n\n已知角色特征：\n`;
      characters.forEach((char: any) => {
        prompt += `- ${char.name}: ${char.baseAppearance}\n`;
        // 检查动态状态
        const dynamicState = char.dynamicState?.[chapter.chapterNumber];
        if (dynamicState) {
          prompt += `  当前状态: ${dynamicState}\n`;
        }
      });
    }

    // 添加视觉风格要求
    if (consistencyProfile?.visualStyle) {
      const style = consistencyProfile.visualStyle;
      prompt += `\n\n视觉风格：\n`;
      prompt += `- 整体风格: ${style.overall}\n`;
      prompt += `- 色调: ${style.colorTone}\n`;
      prompt += `- 艺术风格: ${style.artStyle}\n`;
    }

    prompt += `\n\n请生成JSON格式的分镜脚本，每个场景平均${avgDuration}秒。确保：
1. 场景描述具体、视觉化，适合生成图片
2. 准确识别角色并应用一致性特征
3. 镜头角度多样化（特写、中景、全景等）
4. 情节连贯，时间分配合理

JSON格式示例：
{
  "scenes": [
    {
      "sceneNumber": 1,
      "description": "详细的视觉化场景描述",
      "characters": ["角色名"],
      "environment": "环境描述",
      "duration": ${avgDuration},
      "keyMoment": "关键情节点",
      "cameraAngle": "镜头角度"
    }
  ],
  "totalDuration": ${totalDuration},
  "mainCharacters": ["主要角色列表"],
  "summary": "整体摘要"
}`;

    return prompt;
  }

  /**
   * 解析AI响应
   */
  private parseStoryboardResponse(
    content: string,
    options: any,
  ): StoryboardScriptDto {
    try {
      // 尝试提取JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('无法从响应中提取JSON');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // 验证必要字段
      if (!parsed.scenes || !Array.isArray(parsed.scenes)) {
        throw new Error('响应格式错误：缺少scenes数组');
      }

      // 转换为DTO
      const scenes: StoryboardSceneDto[] = parsed.scenes.map((scene: any, index: number) => ({
        sceneNumber: scene.sceneNumber || index + 1,
        description: scene.description || '',
        characters: scene.characters || [],
        environment: scene.environment || '',
        duration: scene.duration || 3,
        keyMoment: scene.keyMoment || '',
        cameraAngle: scene.cameraAngle || 'medium',
        specialEffects: scene.specialEffects,
      }));

      return {
        scenes,
        totalDuration: parsed.totalDuration || scenes.reduce((sum, s) => sum + s.duration, 0),
        mainCharacters: parsed.mainCharacters || [],
        summary: parsed.summary || '',
      };
    } catch (error) {
      this.logger.error(`解析分镜脚本失败: ${error.message}`);
      
      // 返回默认分镜
      return this.generateFallbackStoryboard(options);
    }
  }

  /**
   * 优化分镜脚本
   */
  private async optimizeStoryboard(
    storyboard: StoryboardScriptDto,
    consistencyProfile: any,
  ): Promise<StoryboardScriptDto> {
    // 1. 验证角色存在性
    const knownCharacters = consistencyProfile?.characters
      ? Object.keys(consistencyProfile.characters)
      : [];

    storyboard.scenes.forEach((scene) => {
      scene.characters = scene.characters.filter((char) =>
        knownCharacters.includes(char),
      );
    });

    // 2. 调整时长分配
    const totalDuration = storyboard.totalDuration;
    let currentTotal = storyboard.scenes.reduce((sum, s) => sum + s.duration, 0);

    if (currentTotal !== totalDuration) {
      const ratio = totalDuration / currentTotal;
      storyboard.scenes.forEach((scene) => {
        scene.duration = Math.max(2, Math.round(scene.duration * ratio));
      });
    }

    // 3. 确保场景编号连续
    storyboard.scenes.forEach((scene, index) => {
      scene.sceneNumber = index + 1;
    });

    return storyboard;
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
   * 生成兜底分镜脚本
   */
  private generateFallbackStoryboard(options: any): StoryboardScriptDto {
    const sceneCount = options.sceneCount || 5;
    const totalDuration = options.totalDuration || 15;
    const sceneDuration = Math.floor(totalDuration / sceneCount);

    const scenes: StoryboardSceneDto[] = Array.from({ length: sceneCount }, (_, i) => ({
      sceneNumber: i + 1,
      description: `场景${i + 1}描述`,
      characters: [],
      environment: '默认环境',
      duration: sceneDuration,
      keyMoment: `关键情节${i + 1}`,
      cameraAngle: 'medium',
    }));

    return {
      scenes,
      totalDuration,
      mainCharacters: [],
      summary: '自动生成的兜底分镜脚本',
    };
  }
}

