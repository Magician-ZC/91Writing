import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { AICallerService } from './ai-caller.service';

/**
 * 视频时长智能计算服务
 * 
 * 职责：
 * 1. 根据章节内容智能计算所需分镜数
 * 2. 预测视频总时长
 * 3. 智能分组章节以达到目标时长
 */
@Injectable()
export class VideoDurationCalculatorService {
  private readonly logger = new Logger(VideoDurationCalculatorService.name);

  // 配置参数
  private readonly AVG_WORDS_PER_SECOND = 4; // 平均每秒4个字
  private readonly AVG_SCENE_DURATION = 3; // 平均每个分镜3秒
  private readonly MIN_SCENES_PER_CHAPTER = 3; // 每章最少3个分镜
  private readonly MAX_SCENES_PER_CHAPTER = 8; // 每章最多8个分镜

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiCaller: AICallerService,
  ) {}

  /**
   * 智能计算需要多少章节才能达到目标视频时长
   */
  async calculateChapterGroupForTargetDuration(
    novelId: string,
    startChapter: number,
    targetDuration: number, // 目标时长（秒），如300秒=5分钟
    maxChapters?: number, // 最多使用多少章节，默认10
  ): Promise<{
    recommendedChapters: number[];
    totalDuration: number;
    totalScenes: number;
    breakdown: Array<{
      chapterNumber: number;
      chapterTitle: string;
      wordCount: number;
      estimatedScenes: number;
      estimatedDuration: number;
    }>;
    reasoning: string;
  }> {
    this.logger.log(`计算视频时长，小说ID: ${novelId}, 目标时长: ${targetDuration}秒`);

    const maxChaptersToCheck = maxChapters || 10;
    
    // 1. 获取从startChapter开始的章节列表
    const chapters = await this.prisma.chapter.findMany({
      where: {
        novelId,
        chapterNumber: {
          gte: startChapter,
          lte: startChapter + maxChaptersToCheck - 1,
        },
      },
      orderBy: { chapterNumber: 'asc' },
      select: {
        id: true,
        chapterNumber: true,
        title: true,
        content: true,
        wordCount: true,
      },
    });

    if (chapters.length === 0) {
      throw new Error('没有找到可用的章节');
    }

    // 2. 为每个章节预估分镜数和时长
    const breakdown = [];
    let accumulatedDuration = 0;
    let selectedChapters = [];

    for (const chapter of chapters) {
      // 2.1 根据字数粗略估算分镜数
      const estimatedScenesByWords = Math.ceil(
        chapter.wordCount / (this.AVG_WORDS_PER_SECOND * this.AVG_SCENE_DURATION * 50)
      );
      
      // 2.2 AI智能分析章节内容，给出更准确的分镜数
      const aiEstimation = await this.analyzeChapterForSceneCount(chapter.content);
      
      // 2.3 综合两种方法，取平均值并限制在合理范围
      const estimatedScenes = Math.max(
        this.MIN_SCENES_PER_CHAPTER,
        Math.min(
          this.MAX_SCENES_PER_CHAPTER,
          Math.round((estimatedScenesByWords + aiEstimation.sceneCount) / 2)
        )
      );

      const estimatedDuration = estimatedScenes * this.AVG_SCENE_DURATION;

      breakdown.push({
        chapterNumber: chapter.chapterNumber,
        chapterTitle: chapter.title,
        wordCount: chapter.wordCount,
        estimatedScenes,
        estimatedDuration,
        aiReasoning: aiEstimation.reasoning,
      });

      // 3. 累加时长，判断是否达到目标
      accumulatedDuration += estimatedDuration;
      selectedChapters.push(chapter.chapterNumber);

      // 如果已经达到目标时长，停止
      if (accumulatedDuration >= targetDuration) {
        break;
      }
    }

    // 4. 生成推荐说明
    const reasoning = this.generateReasoning(
      selectedChapters,
      accumulatedDuration,
      targetDuration,
      breakdown
    );

    return {
      recommendedChapters: selectedChapters,
      totalDuration: accumulatedDuration,
      totalScenes: breakdown.reduce((sum, b) => sum + b.estimatedScenes, 0),
      breakdown,
      reasoning,
    };
  }

  /**
   * AI分析章节内容，估算分镜数
   */
  private async analyzeChapterForSceneCount(content: string): Promise<{
    sceneCount: number;
    reasoning: string;
  }> {
    // 截取内容（避免过长）
    const contentPreview = content.length > 2000 
      ? content.substring(0, 2000) + '...' 
      : content;

    const prompt = `
请分析以下章节内容，估算需要多少个分镜场景才能完整呈现这个章节。

【章节内容】
${contentPreview}

【评估标准】
- 每个关键场景转换需要1个分镜
- 每个主要情节点需要1个分镜
- 重要的对话场景需要1个分镜
- 动作场景可能需要2-3个分镜
- 环境描写需要1个分镜

【限制】
- 最少3个分镜
- 最多8个分镜
- 优先选择最关键、最有视觉冲击力的场景

请以JSON格式返回：
{
  "sceneCount": 5,
  "reasoning": "简要说明为什么需要这么多分镜"
}
`;

    try {
      const response = await this.aiCaller.callAI({
        userId: 'system',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的视频分镜规划专家，擅长分析文本内容并规划视频分镜。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        parameters: {
          temperature: 0.3,
          maxTokens: 500,
        },
      });

      // 解析AI响应
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          sceneCount: Math.max(this.MIN_SCENES_PER_CHAPTER, Math.min(this.MAX_SCENES_PER_CHAPTER, result.sceneCount)),
          reasoning: result.reasoning || '基于AI分析',
        };
      }
    } catch (error) {
      this.logger.warn(`AI分析章节分镜数失败: ${error.message}`);
    }

    // 兜底方案：基于字数估算
    return {
      sceneCount: this.MIN_SCENES_PER_CHAPTER,
      reasoning: '使用默认估算',
    };
  }

  /**
   * 生成推荐说明
   */
  private generateReasoning(
    selectedChapters: number[],
    totalDuration: number,
    targetDuration: number,
    breakdown: any[]
  ): string {
    const chapterCount = selectedChapters.length;
    const totalScenes = breakdown.reduce((sum, b) => sum + b.estimatedScenes, 0);
    const avgScenesPerChapter = (totalScenes / chapterCount).toFixed(1);

    let reasoning = `根据智能分析，推荐使用第${selectedChapters[0]}-${selectedChapters[selectedChapters.length - 1]}章（共${chapterCount}章）生成视频。\n\n`;
    reasoning += `预估信息：\n`;
    reasoning += `- 总分镜数：${totalScenes}个\n`;
    reasoning += `- 预估总时长：${totalDuration}秒（约${(totalDuration / 60).toFixed(1)}分钟）\n`;
    reasoning += `- 平均每章：${avgScenesPerChapter}个分镜\n\n`;

    if (totalDuration < targetDuration * 0.8) {
      reasoning += `⚠️ 注意：预估时长略低于目标时长${(targetDuration / 60).toFixed(1)}分钟，但已达到${(totalDuration / targetDuration * 100).toFixed(0)}%。\n`;
    } else if (totalDuration > targetDuration * 1.2) {
      reasoning += `⚠️ 注意：预估时长略高于目标时长${(targetDuration / 60).toFixed(1)}分钟，达到${(totalDuration / targetDuration * 100).toFixed(0)}%。\n`;
    } else {
      reasoning += `✅ 预估时长符合目标（目标：${(targetDuration / 60).toFixed(1)}分钟）。\n`;
    }

    return reasoning;
  }

  /**
   * 简单估算（不调用AI，基于字数快速计算）
   */
  async quickEstimate(
    novelId: string,
    chapterIds: string[],
  ): Promise<{
    totalDuration: number;
    totalScenes: number;
    perChapter: Array<{
      chapterId: string;
      chapterNumber: number;
      estimatedScenes: number;
      estimatedDuration: number;
    }>;
  }> {
    const chapters = await this.prisma.chapter.findMany({
      where: { id: { in: chapterIds } },
      select: {
        id: true,
        chapterNumber: true,
        wordCount: true,
      },
    });

    const perChapter = chapters.map(chapter => {
      // 基于字数快速估算
      const estimatedScenes = Math.max(
        this.MIN_SCENES_PER_CHAPTER,
        Math.min(
          this.MAX_SCENES_PER_CHAPTER,
          Math.ceil(chapter.wordCount / 600) // 每600字约1个分镜
        )
      );

      return {
        chapterId: chapter.id,
        chapterNumber: chapter.chapterNumber,
        estimatedScenes,
        estimatedDuration: estimatedScenes * this.AVG_SCENE_DURATION,
      };
    });

    return {
      totalDuration: perChapter.reduce((sum, c) => sum + c.estimatedDuration, 0),
      totalScenes: perChapter.reduce((sum, c) => sum + c.estimatedScenes, 0),
      perChapter,
    };
  }

  /**
   * 计算多个章节合成后的视频时长
   */
  calculateMergedVideoDuration(chapterVideos: Array<{ duration: number }>): number {
    // 每个视频之间的转场时长
    const transitionDuration = 0.3;
    
    const totalContentDuration = chapterVideos.reduce((sum, v) => sum + v.duration, 0);
    const totalTransitionDuration = (chapterVideos.length - 1) * transitionDuration;
    
    // 标题帧时长
    const titleDuration = 2;
    
    return totalContentDuration + totalTransitionDuration + titleDuration;
  }
}

