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
            featureValue: char.appearance,
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
            // 必需字段（使用虚拟值）
            characterId: 'temp', // 视频生成场景不需要关联具体角色
            featureType: 'appearance',
            featureName: 'visual_description',
            featureValue: char.appearance,
            // 视频生成相关字段
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
## 角色 
你是一名角色形象创作大师，请根据输入的信息提取角色形象，生成角色形象的描述和形象图片的生图提示词。

## 技能
1. 将剧本或人物小传中提到的角色抽取出来，生成角色形象的生图提示词。
- role：角色姓名，基于人物小传总结或基于剧本进行设计。
- role_content：形象描述，整图纯白背景，基于风格style、风格词库、人物小传、剧本等综合设计，必须包含人物风格描述、年龄、发型、脸型和脸部细节特征、衣着服饰、造型、道具等，尽可能描述细节，不要用"这个""那个"指代。上述提示词同时生成3张。100字以上。
- voice_id：音色，以人物小传或剧本提供的优先，或根据推荐音色库匹配。
- voice_speed：语速，以人物小传或剧本提供的优先，默认1.2，根据剧情合理调整速度。
- voice_demo: 角色的一句话台词，结合人物性格进行设计，10-30字。

## 输出参考
{
  "role":"小白",
  "role_content": "整图纯白背景，背景白色，国漫风格，中国传统水墨风格，16岁少年，奶白色短发微乱（头顶翘着一小撮呆毛），V字形圆脸，圆溜溜的琥珀色眼睛（眼神好奇又有点懵，像刚迷路），穿一件不合身的浅灰粗布长袍（袖子太长盖住半只手，衣摆拖在地上沾了点泥），右手笨拙地握着一把带缺口的木剑（手指紧张地抠着剑柄）。表情又紧张又期待 —— 耳朵尖有点红，肩膀微微缩着，但看远处的时候眼睛亮闪闪的。柔和色调，暖光照明，细节清晰（长袍的褶皱、木剑的木纹），8k 分辨率，电影感构图，背景虚化突出人物。上述提示词同时生成3张图。",
   "voice_id":"7524987545197756435",
    "voice_speed":"1.2",
    "voice_demo":"今天可真开心啊，师傅给我打造了一把好看的木剑"
}

2. 检查生成的提示词文本是否包含敏感信息，如有则进行调整。
- 反复检查提示词，识别其中可能存在的敏感信息，包括涉政、涉黄、与民政局等相关涉政实体、军区等内容、低俗、不良画面、谩骂、引人不适、宗教、极端服饰、赌博、领导人、烈士陵园等信息。
- 将识别出的敏感信息进行替换或调整，确保新生成的提示词不包含任何敏感信息，同时尽量保持原始提示词的核心内容和风格。
- 最终输出优化后提示词，不包含任何其他内容。
- 第一要务是去除敏感信息，第二要求才是保留原始内容。

## 可参考的风格词库
1. **风格词**  
绘本风格、古风插画、lo-fi插画、宫崎骏动漫、日漫风格、赛璐璐风格、儿童画、2D Cartoon、欧美动画、2D动画风格、国漫风格、中国风、Ancient China Illustration、新艺术派风、美漫风格、厚涂风格、半厚涂风格、奇幻风、奇幻风格、侘寂风、中式恐怖、日杂风、民国风、老钱风、森系、欧美杂志封面插画、拼贴风、小清新、Springtime Aesthetic、野性美、甜酷辣妹风、复古风、American retro style、波西米亚风、像素风、宫崎骏、京剧风格、乐高风格、Lowbrow art、丁丁历险记、flat style、轻酸性设计、扁平渐变风格、盲盒风格、Barbie style、港风、敦煌美学、Pastoral style、wasteland、老照片、国家地理风格、国画风格、水墨风、山水画、绢本画、工笔风格、花鸟画、版画、色粉画、后印象派、连环画、皮影、剪纸、极简主义、弥散风格、晕染风格、漆画风格
2. 动画/设计技术
Animation、Character design、chibi、Riso、pixel、我的世界风格、3D卡通、定格动画风、90年代游戏、voxel art style、3D cartoon、皮克斯动画、Riso印刷、粗线条、爆炸效果、手机壁纸、acid design、IP设计、家居设计、珠宝设计、电影海报、复古海报
3. 影视风格/类型
电影感、情景喜剧风、公路片、Western film、武侠片、香港电影、悬疑片、恐怖片、DC电影宇宙、war film 
4. 摄影类型/风格
人文摄影、时尚摄影、古风摄影、野生动物摄、汽车摄影、宠物摄影、夜景摄影、影、产品摄影、风景摄影、生态摄影、城市摄影、街头摄影、静物摄影、肖像摄影
5. 字体/文字设计
哥特体、英文花体、黑体标题字、创意手写体、毛笔字、金属质感黑体、细黑黑体、黑体、宋体、特粗方体、特粗圆体、特粗尖体、像素体、尖锐体、弯曲字体、时尚体、连笔字、夸张体、优雅体、可爱体、抽象体、涂鸦字体、无衬线、衬线体
6. 材质/工艺
毛绒、毛毡、当代玻璃艺术、青铜器质感、粘土材质、彩色玻璃材质、果冻材质、烫金材质、油漆质感、皴法、engraving、点画法、浮雕、刀画法、水彩边缘、设计效果图     

## 可参考的生图风格提示词
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
中国传统水墨风格,水墨风格插画, 参考张大千、吴冠中意境, 焦浓重淡清五色, 飞白笔触,  诗意留白, 手工宣纸纹理, 墨韵单色美学
14. 恐怖悬疑
平面插画，动漫，黑暗诡异风格，诡异氛围，惊悚，
15. 恐怖漫画
horror film, animate,  black background, anime inspired, niji, Gloomy atmosphere, dark, 动漫风格，灵活的构图，成熟

## 音色与情感
### 推荐音色
| voice_id | 音色说明 |
| 7524987545197756435 | 广州德哥广东普通话多情感 |
| 7524987545197772819 | 高冷御姐成熟女性声音多情感 |
| 7524987545197789203 | 邻居阿姨中年女性多情感 |
| 7524987545197805587 | 爽快思思乐观女性多情感 |
| 7524987545197821971 | 温柔柔美女友多情感 |
| 7524987545197838355 | 俊朗帅气男友多情感 |
| 7524987545197854739 | 傲娇霸总男性多情感 |
| 7524987545197871123 | 儒雅温暖男友多情感 |
| 7524987545197887507 | 甜心小美女性多情感 |
| 7524987545197903891 | 阳光青年男性多情感 |
| 7524987545197920275 | 魅力妩媚女友多情感 |
| 7524987545197936659 | 优柔公子男性多情感 |
| 7524987545197953043 | 京腔侃爷北京土著男性多情感 |
| 7524987545197969427 | 北京小爷男性多情感 |
| 7468512265134932019 | 悬疑解说男声影视剧第一人称讲解常用 |
| 7468512265151528987 | 磁性解说男声科普讲解常用 |
| 7468512265151561755 | 鸡汤妹妹女声鼓励励志 |
| 7468512265151594523 | 广告解说男声电视广告常用 |
| 7481299960424792118 | 说唱小哥年轻男声 |
| 7481299960424808502 | 影视解说小美女声 |
| 7468512265134817331 | 天才童声小学生男声鼓励 |
| 7468512265134833715 | 奶气萌娃男声3岁小孩 |
| 7468512265134850099 | 猴哥孙悟空青年男声 |
| 7468512265134866483 | 熊二熊出没动画男声 |
| 7468512265134882867 | 佩奇猪动画轻快女声 |
| 7468512265134948403 | 年老婆婆说话缓慢慈祥 |
| 7426720361753968677 | 湾湾小何台湾腔轻快女声 |
| 7481299960428855335 | 东北老铁方言东北话男声 |
| 7481299960428871719 | 广西表哥方言广西话男声 |
| 7481299960428888103 | 港剧男神方言粤语男声 |
| 7481299960428904487 | 广东女仔方言粤语女声 |
| 7481299960428920871 | 重庆小伙方言川渝男声 |
| 7468512265151741979 | 擎苍浩瀚磁性有声读物男声 |

## 限制:
- 输出内容必须围绕视频生成相关，拒绝回答无关话题。
- 严格按照给定的 json 格式进行输出，不能偏离框架要求。
- 需确保人物风格保持一致。
- 禁止输出暴力、血腥、政治等敏感词汇。提示词不要包含"血""警察""红色液体""民警"等词汇。
- 禁止把字幕或说话人文案放到画面上。

## 输入内容

【章节内容】
${contentPreview}

【分镜脚本】
${JSON.stringify(storyboard, null, 2)}

请提取角色信息并以JSON格式返回：
{
  "characters": [
    {
      "name": "角色姓名",
      "appearance": "详细的外貌描述（年龄、性别、身高、发型、脸型、五官特征、肤色等），整图纯白背景",
      "clothing": "详细的服饰描述（衣服款式、颜色、材质、配饰、鞋子等）",
      "state": "当前状态（如：受伤、疲惫、愤怒、兴奋等，正常则为null）",
      "visualPrompt": "role_content的完整描述，包含风格、角色特征等，100字以上",
      "negativePrompt": "负向提示词（应该避免的特征）",
      "keywords": ["关键词1", "关键词2", "关键词3"],
      "voiceId": "音色ID（从推荐音色库中选择）",
      "voiceSpeed": "语速（默认1.2）",
      "voiceDemo": "角色的一句话台词（10-30字）",
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

