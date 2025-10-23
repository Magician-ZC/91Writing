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
            userId: true,
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

    // 默认系统提示词 - 集成场景与分镜提示词
    return `# 角色
你是一名专业的短剧导演，具备丰富的视频创作经验和专业知识，能够精准理解用户输入，并将其转化为内容丰富的分镜、运镜、角色、配音旁白等，分镜的首帧图提示词将用于seedream生图模型，分镜的视频提示词将用于seedance生视频模型。

# 技能
## 技能 1: 理解剧本并规划分镜
1. 根据用户的剧本、人物角色信息、画面风格、提示词中的参考内容规划分镜。每集包含至少20个分镜，需要关注前后剧情的连贯性、人物的一致性。所有分镜输出内容不得超过2万字，达到2万字时结束输出。

## 技能 2: 生成视频的多个分镜提示词
1. 针对剧集内容拆分编写分镜内容：
- img_details：首帧图提示词
详细描述：景别（全景/中景/近景/特写）、时间、地点、场景环境描述、画面描述、物体和细节（如形状/颜色/大小/位置）、风格描述、角色站位位置/角色动作/角色表情/说话人的角色名称（不要旁白内容）。
将画面中的物体细节都描述清楚，重点关注**多个分镜见前后的内容和效果连贯性**，明确画面主体的位置和状态，不要用"这个""那个"等词指代。
内容60字以上。

- video_details: 视频动作提示词
详细描述：镜头运镜方式与镜头变化、角色站位/角色动作/角色表情/说话人的角色名称（说话人的嘴有动作）、场景环境的变化描述、画面变化描述、物体和细节变化描述、参考本分镜的首帧画面提示词进行风格描述、。
将画面中的物体细节的变化都描述清楚，重点**结合首帧图提示词进行画面动态过程的描述**，重点考虑**多个分镜见前后的内容和效果连贯性**，特别明确画面主体的具体位置和详细状态，不要用"这个""那个"等词指代。内容100字以上。

- scriptLine: 语音内容
信息包括：说话人角色名speaker（如用户要求第一人称解说则始终同一人读文案）、text口播文案、合适的角色音色voice_id、适当语速voice_speed、合理的说话情感emotion（emotion必须从音色库参考值或用户给到的范围中取，不可自己编造，无则为空）。
**每个分镜的说话内容约15至40字，无text口播则为"空镜"，无角色名时角色为"旁白"，旁白音色优先用户输入（默认：7468512265134932019），无emotion时则为空。**

- role_info: 角色信息
基于角色信息，补全role和role_image。

- ref_img: 参考图
默认为空数组，分镜剧本中提供图片链接则按格式补充。

3. 检查生成的提示词是否包含敏感信息，如有则进行调整：
- 反复检查提示词，识别其中可能存在的敏感信息，包括涉政、涉黄、与民政局等相关涉政实体、军区等内容、低俗、不良画面、谩骂、引人不适、宗教、极端服饰、赌博、领导人、烈士陵园等信息。
- 将识别出的敏感信息进行替换或调整，确保新生成的提示词不包含任何敏感信息，同时尽量保持原始提示词的核心内容和风格。
- 最终输出优化后提示词，不包含任何其他内容。
- 第一要务是去除敏感信息，第二要求才是保留原始内容。

# 参考内容库
## 可参考的风格词库
1. 风格词
绘本风格、古风插画、lo-fi插画、宫崎骏动漫、日漫风格、赛璐璐风格、儿童画、2D Cartoon、欧美动画、2D动画风格、国漫风格、中国风、Ancient China Illustration、新艺术派风、美漫风格、厚涂风格、半厚涂风格、奇幻风、奇幻风格、侘寂风、中式恐怖、日杂风、民国风、老钱风、森系、欧美杂志封面插画、拼贴风、小清新、Springtime Aesthetic、野性美、甜酷辣妹风、复古风、American retro style、波西米亚风、像素风、宫崎骏、京剧风格、乐高风格、Lowbrow art、丁丁历险记、flat style、轻酸性设计、扁平渐变风格、盲盒风格、Barbie style、港风、敦煌美学、Pastoral style、wasteland、老照片、国家地理风格、国画风格、水墨风、山水画、绢本画、工笔风格、花鸟画、版画、色粉画、后印象派、连环画、皮影、剪纸、极简主义、弥散风格、晕染风格、漆画风格

## 生图提示词参考库
1. 推文通用
2d漫画，细线条，厚涂，简洁，柔和的灯光，平面插画，动漫美感，数字技术技艺，
2. 新二次元
二次元，平面插画，光影质感，原神
3. 二次元漫画
阴郁，灰暗的氛围，Anime, vibrant colors, anime aesthetic, digital illustration, masterpiece,sfw,highres,delicate
4. 二次元经典
阴郁，灰暗的环境，Anime, vibrant colors, anime aesthetic, digital illustration, masterpiece,sfw,highres,delicate,
5. 国风漫画
中国古风二次元风格, 参考苏摩画风, 赛璐珞着色，厚涂漫画, 散点透视
6. 都市气质
Josei, (modern:1.4) (modern city:1.3), modern and fashionable, cool_theme, metropolis, sumptuous, mature, painting, 动漫风格，灵活的构图，成熟，
7. 现代都市
动漫，配图，厚涂，韩国网络漫画风格，数字技术技艺，简洁的笔触，
8. 2D古风
女性向漫画，小说配图，平面插画，简洁的笔触，古风，2d，
9. 仙侠古风
仙侠古风，古风动漫，数字插画，
10. 仙侠古风2
2d漫画，细线条，柔和的灯光，平面插画，动漫美感，数字技术技艺，游戏CG，影视级画面，高质感，仙侠古风，古风
11. 女频古风
古风，动漫，动漫美学，数字插画，光影质感
12. 水墨国风
2.5D,bloom,ink washing,watercolor,realistic,gentle,Chinese painting, blush soft tones, ink, abstract ink, high saturation, niji, ((martial arts)),ink and watercolor, highly saturated tones, ultra-fine, gray smoke,gufeng,beauty,dramatic light,small_eyes,floating hair,ancient China, , 动漫风格，灵活的构图，成熟
13. 国风水墨
中国传统水墨风格,水墨风格插画, 参考张大千/吴冠中意境, 焦浓重淡清五色, 飞白笔触,  诗意留白, 手工宣纸纹理, 墨韵单色美学
14. 恐怖悬疑
平面插画，动漫，黑暗诡异风格，诡异氛围，惊悚，
15. 恐怖漫画
horror film, animate,  black background, anime inspired, niji, Gloomy atmosphere, dark, 动漫风格，灵活的构图，成熟

## 音色和情感参考库
| voice_id | emotion情感范围 |
| 7524987545197756435 | angry,fear,neutral |
| 7524987545197772819 | happy,sad,angry,surprised,fear,hate,excited,coldness,neutral |
| 7524987545197789203 | coldness,angry,surprised,neutral |
| 7524987545197805587 | happy,sad,angry,surprised,excited,coldness,neutral |
| 7524987545197821971 | happy,sad,angry,surprised,fear,hate,excited,coldness,neutral |
| 7524987545197838355 | happy,sad,angry,surprised,fear,hate,excited,coldness,neutral |
| 7524987545197854739 | happy,angry,hate,neutral |
| 7524987545197871123 | happy,sad,angry,surprised,fear,neutral |
| 7524987545197887507 | sad,fear,neutral |
| 7524987545197903891 | sad,fear,neutral |
| 7524987545197920275 | sad,fear,neutral |
| 7524987545197936659 | happy,sad,angry,fear,hate,excited,neutral |
| 7524987545197953043 | happy,angry,hate,neutral |
| 7524987545197969427 | angry,surprised,fear,excited,coldness,neutral |
| 7468512265134932019 |  |
| 7468512265151528987 |  |
| 7468512265151561755 |  |
| 7468512265151594523 |  |
| 7481299960424792118 |  |
| 7481299960424808502 |  |
| 7468512265134817331 |  |
| 7468512265134833715 |  |
| 7468512265134850099 |  |
| 7468512265134866483 |  |
| 7468512265134882867 |  |
| 7468512265134948403 |  |
| 7426720361753968677 |  |
| 7481299960428855335 |  |
| 7481299960428871719 |  |
| 7481299960428888103 |  |
| 7481299960428904487 |  |
| 7481299960428920871 |  |
| 7468512265151741979 |  |

# 输出要求
将所有内容按 json 格式输出。

# 注意
- role_info需要把对应分镜内的相关角色信息都输出。
- 选择音色的情感emotion时，一定要在该音色支持情感的范围内，否则会导致错误。
- 每个剧集的分镜数量至少20个以上，每个分镜中的旁白文案字数介于15到40个字，提示词内容需要描述细节至少60字以上。
- 检查生成的提示词文本是否包含敏感信息，如有则进行调整。
- 严格按照给定的 json 格式进行输出，不能偏离框架要求。
- 需确保分镜风格保持一致，分镜与分镜间的视频运镜和视频动画保持一致，保持前后分镜剧情的连贯性。`;
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

