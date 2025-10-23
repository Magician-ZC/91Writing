import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '@app/database';
import { VideoDurationCalculatorService } from './video-duration-calculator.service';

/**
 * 批量视频生成服务
 * 
 * 职责：
 * 1. 批量提交章节视频生成任务
 * 2. 管理视频生成队列
 * 3. 协调多章节视频合成
 */
@Injectable()
export class BatchVideoGenerationService {
  private readonly logger = new Logger(BatchVideoGenerationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly durationCalculator: VideoDurationCalculatorService,
    @InjectQueue('video-generation') private readonly videoQueue: Queue,
  ) {}

  /**
   * 模式1：批量生成指定章节的视频
   */
  async batchGenerateByChapters(
    userId: string,
    novelId: string,
    chapterIds: string[],
    options?: {
      parallelTasks?: number;  // 并发任务数，默认2
      mergeIntoOne?: boolean;  // 是否合并成一个长视频
      videoSettings?: {
        sceneCount?: number;
        videoDuration?: number;
      };
    },
  ): Promise<{
    batchId: string;
    totalChapters: number;
    estimatedDuration: number;
    estimatedScenes: number;
    jobs: Array<{
      chapterId: string;
      jobId: string;
    }>;
    message: string;
  }> {
    this.logger.log(`批量生成视频，章节数: ${chapterIds.length}`);

    // 1. 验证权限
    await this.validateChapters(novelId, userId, chapterIds);

    // 2. 快速估算总时长和分镜数
    const estimation = await this.durationCalculator.quickEstimate(novelId, chapterIds);

    // 3. 创建批量任务记录
    const batch = await this.prisma.videoBatchGeneration.create({
      data: {
        novelId,
        userId,
        chapterIds,
        totalChapters: chapterIds.length,
        estimatedDuration: estimation.totalDuration,
        estimatedScenes: estimation.totalScenes,
        status: 'PENDING',
        mergeIntoOne: options?.mergeIntoOne || false,
        settings: options?.videoSettings as any || {},
      },
    });

    // 4. 提交任务到队列
    const jobs = [];
    const parallelTasks = options?.parallelTasks || 2;

    for (let i = 0; i < chapterIds.length; i++) {
      const chapterId = chapterIds[i];
      
      const job = await this.videoQueue.add(
        'generate-chapter-video',
        {
          userId,
          chapterId,
          batchId: batch.id,
          sceneCount: options?.videoSettings?.sceneCount,
          videoDuration: options?.videoSettings?.videoDuration,
        },
        {
          priority: i + 1, // 优先级：章节顺序
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          // 并发控制
          jobId: `batch-${batch.id}-chapter-${chapterId}`,
        },
      );

      jobs.push({
        chapterId,
        jobId: job.id.toString(),
      });

      // 添加延迟，避免瞬间提交太多任务
      if (i < chapterIds.length - 1) {
        await this.delay(100);
      }
    }

    // 5. 更新批次状态
    await this.prisma.videoBatchGeneration.update({
      where: { id: batch.id },
      data: {
        status: 'PROCESSING',
        startedAt: new Date(),
      },
    });

    return {
      batchId: batch.id,
      totalChapters: chapterIds.length,
      estimatedDuration: estimation.totalDuration,
      estimatedScenes: estimation.totalScenes,
      jobs,
      message: `已提交${chapterIds.length}个章节的视频生成任务，预计总时长${(estimation.totalDuration / 60).toFixed(1)}分钟`,
    };
  }

  /**
   * 模式2：AI智能规划 - 根据目标时长自动选择章节
   */
  async smartGenerateForTargetDuration(
    userId: string,
    novelId: string,
    startChapter: number,
    targetDuration: number, // 目标时长（秒）
    options?: {
      maxChapters?: number;
      autoMerge?: boolean;
      videoSettings?: any;
    },
  ): Promise<{
    batchId: string;
    recommendedChapters: number[];
    totalChapters: number;
    estimatedDuration: number;
    estimatedScenes: number;
    breakdown: any[];
    reasoning: string;
    jobs: Array<{
      chapterId: string;
      chapterNumber: number;
      jobId: string;
    }>;
  }> {
    this.logger.log(`智能规划视频生成，目标时长: ${targetDuration}秒`);

    // 1. 验证小说权限
    const novel = await this.prisma.novel.findFirst({
      where: { id: novelId, userId },
    });

    if (!novel) {
      throw new Error('小说不存在或无权访问');
    }

    // 2. AI智能计算需要多少章节
    const calculation = await this.durationCalculator.calculateChapterGroupForTargetDuration(
      novelId,
      startChapter,
      targetDuration,
      options?.maxChapters,
    );

    // 3. 获取章节IDs
    const chapters = await this.prisma.chapter.findMany({
      where: {
        novelId,
        chapterNumber: { in: calculation.recommendedChapters },
      },
      select: { id: true, chapterNumber: true },
      orderBy: { chapterNumber: 'asc' },
    });

    const chapterIds = chapters.map(c => c.id);

    // 4. 创建批量任务
    const batch = await this.prisma.videoBatchGeneration.create({
      data: {
        novelId,
        userId,
        chapterIds,
        totalChapters: chapters.length,
        estimatedDuration: calculation.totalDuration,
        estimatedScenes: calculation.totalScenes,
        status: 'PENDING',
        mergeIntoOne: options?.autoMerge !== false, // 默认合并
        settings: {
          ...options?.videoSettings,
          targetDuration,
          aiPlanned: true,
        } as any,
        aiReasoning: calculation.reasoning,
      },
    });

    // 5. 提交任务
    const jobs = [];
    for (const chapter of chapters) {
      const job = await this.videoQueue.add(
        'generate-chapter-video',
        {
          userId,
          chapterId: chapter.id,
          batchId: batch.id,
          ...options?.videoSettings,
        },
        {
          priority: chapter.chapterNumber,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          jobId: `smart-batch-${batch.id}-chapter-${chapter.id}`,
        },
      );

      jobs.push({
        chapterId: chapter.id,
        chapterNumber: chapter.chapterNumber,
        jobId: job.id.toString(),
      });
    }

    // 6. 更新批次状态
    await this.prisma.videoBatchGeneration.update({
      where: { id: batch.id },
      data: {
        status: 'PROCESSING',
        startedAt: new Date(),
      },
    });

    return {
      batchId: batch.id,
      recommendedChapters: calculation.recommendedChapters,
      totalChapters: chapters.length,
      estimatedDuration: calculation.totalDuration,
      estimatedScenes: calculation.totalScenes,
      breakdown: calculation.breakdown,
      reasoning: calculation.reasoning,
      jobs,
    };
  }

  /**
   * 查询批量生成状态
   */
  async getBatchStatus(batchId: string): Promise<{
    batchId: string;
    status: string;
    totalChapters: number;
    completedChapters: number;
    failedChapters: number;
    processingChapters: number;
    progress: number;
    estimatedDuration: number;
    actualDuration?: number;
    chapters: Array<{
      chapterId: string;
      chapterNumber: number;
      status: string;
      videoUrl?: string;
      errorMessage?: string;
    }>;
    mergedVideoUrl?: string;
  }> {
    const batch = await this.prisma.videoBatchGeneration.findUnique({
      where: { id: batchId },
      include: {
        novel: {
          include: {
            chapters: {
              where: {
                id: { in: [] }, // 动态填充
              },
              select: {
                id: true,
                chapterNumber: true,
                videoStatus: true,
                videoUrl: true,
              },
            },
          },
        },
      },
    });

    if (!batch) {
      throw new Error('批量任务不存在');
    }

    // 获取章节详情
    const chapters = await this.prisma.chapter.findMany({
      where: { id: { in: batch.chapterIds as string[] } },
      select: {
        id: true,
        chapterNumber: true,
        videoStatus: true,
        videoUrl: true,
        videoGenerationLog: true,
      },
      orderBy: { chapterNumber: 'asc' },
    });

    const chapterStatus = chapters.map(chapter => ({
      chapterId: chapter.id,
      chapterNumber: chapter.chapterNumber,
      status: chapter.videoStatus || 'PENDING',
      videoUrl: chapter.videoUrl || undefined,
      errorMessage: chapter.videoGenerationLog ? String(chapter.videoGenerationLog) : undefined,
    }));

    const completedChapters = chapterStatus.filter(c => c.status === 'COMPLETED').length;
    const failedChapters = chapterStatus.filter(c => c.status === 'FAILED').length;
    const processingChapters = chapterStatus.filter(c => c.status === 'GENERATING').length;
    const progress = Math.floor((completedChapters / batch.totalChapters) * 100);

    return {
      batchId: batch.id,
      status: batch.status,
      totalChapters: batch.totalChapters,
      completedChapters,
      failedChapters,
      processingChapters,
      progress,
      estimatedDuration: batch.estimatedDuration,
      actualDuration: batch.actualDuration || undefined,
      chapters: chapterStatus,
      mergedVideoUrl: batch.mergedVideoUrl || undefined,
    };
  }

  /**
   * 取消批量生成
   */
  async cancelBatch(batchId: string): Promise<{ message: string }> {
    // 1. 更新批次状态
    await this.prisma.videoBatchGeneration.update({
      where: { id: batchId },
      data: { status: 'CANCELLED' },
    });

    // 2. 取消队列中的任务
    const jobs = await this.videoQueue.getJobs(['waiting', 'delayed', 'active']);
    const batchJobs = jobs.filter(job => job.data.batchId === batchId);
    
    for (const job of batchJobs) {
      await job.remove();
    }

    return {
      message: `已取消批量任务，共取消${batchJobs.length}个待处理任务`,
    };
  }

  /**
   * 验证章节权限
   */
  private async validateChapters(novelId: string, userId: string, chapterIds: string[]): Promise<void> {
    const novel = await this.prisma.novel.findFirst({
      where: { id: novelId, userId },
    });

    if (!novel) {
      throw new Error('小说不存在或无权访问');
    }

    const chapters = await this.prisma.chapter.findMany({
      where: {
        id: { in: chapterIds },
        novelId,
      },
    });

    if (chapters.length !== chapterIds.length) {
      throw new Error('部分章节不存在或不属于该小说');
    }
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

