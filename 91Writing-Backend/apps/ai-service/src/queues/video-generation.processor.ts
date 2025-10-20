import { Processor, Process, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { VideoGenerationService } from '../modules/video-generation/video-generation.service';

/**
 * 视频生成任务处理器
 */
@Processor('video-generation')
export class VideoGenerationProcessor {
  private readonly logger = new Logger(VideoGenerationProcessor.name);

  constructor(
    private readonly videoGenerationService: VideoGenerationService,
  ) {}

  @Process('generate-chapter-video')
  async handleVideoGeneration(job: Job): Promise<any> {
    this.logger.log(`开始处理视频生成任务: ${job.id}`);
    
    const { userId, chapterId, ...options } = job.data;

    try {
      // 更新进度: 0%
      await job.progress(0);

      // 调用视频生成服务
      const result = await this.videoGenerationService.generateChapterVideo(
        userId,
        { chapterId, ...options },
      );

      // 任务完成
      await job.progress(100);

      this.logger.log(`视频生成任务完成: ${job.id}`);
      return result;
    } catch (error) {
      this.logger.error(`视频生成任务失败: ${job.id}`, error.stack);
      throw error;
    }
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`任务开始执行: ${job.id}, 章节: ${job.data.chapterId}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.log(`任务执行完成: ${job.id}`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `任务执行失败: ${job.id}, 尝试次数: ${job.attemptsMade}/${job.opts.attempts}`,
      error.stack,
    );
  }
}

