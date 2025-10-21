import { Injectable, Logger } from '@nestjs/common';
import { Queue, Job } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { GenerateVideoDto } from '../dto/video-generation.dto';

/**
 * 视频生成任务队列处理器
 */
@Injectable()
export class VideoGenerationQueue {
  private readonly logger = new Logger(VideoGenerationQueue.name);

  constructor(
    @InjectQueue('video-generation')
    private readonly videoQueue: Queue,
  ) {}

  /**
   * 添加视频生成任务到队列
   */
  async addVideoGenerationJob(
    userId: string,
    dto: GenerateVideoDto,
    priority: number = 0,
  ): Promise<Job> {
    this.logger.log(`添加视频生成任务到队列: ${dto.chapterId}`);

    const job = await this.videoQueue.add(
      'generate-chapter-video',
      {
        userId,
        ...dto,
      },
      {
        priority,
        attempts: 3, // 最多重试3次
        backoff: {
          type: 'exponential',
          delay: 60000, // 首次重试延迟1分钟
        },
        removeOnComplete: false, // 保留完成的任务
        removeOnFail: false, // 保留失败的任务
        timeout: 600000, // 10分钟超时
      },
    );

    this.logger.log(`任务已添加，Job ID: ${job.id}`);
    return job;
  }

  /**
   * 获取任务状态
   */
  async getJobStatus(jobId: string): Promise<any> {
    const job = await this.videoQueue.getJob(jobId);
    
    if (!job) {
      return null;
    }

    const state = await job.getState();
    const progress = job.progress();

    return {
      id: job.id,
      state,
      progress,
      data: job.data,
      returnValue: job.returnvalue,
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
    };
  }

  /**
   * 取消任务
   */
  async cancelJob(jobId: string): Promise<boolean> {
    try {
      const job = await this.videoQueue.getJob(jobId);
      
      if (!job) {
        return false;
      }

      await job.remove();
      this.logger.log(`任务已取消: ${jobId}`);
      return true;
    } catch (error) {
      this.logger.error(`取消任务失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 获取队列统计信息
   */
  async getQueueStats(): Promise<any> {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.videoQueue.getWaitingCount(),
      this.videoQueue.getActiveCount(),
      this.videoQueue.getCompletedCount(),
      this.videoQueue.getFailedCount(),
      this.videoQueue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  }

  /**
   * 清理已完成的旧任务
   */
  async cleanOldJobs(ageInHours: number = 24): Promise<number> {
    this.logger.log(`清理${ageInHours}小时前的已完成任务...`);

    const jobs = await this.videoQueue.getCompleted();
    const now = Date.now();
    const cutoffTime = now - ageInHours * 60 * 60 * 1000;

    let cleanedCount = 0;

    for (const job of jobs) {
      if (job.finishedOn && job.finishedOn < cutoffTime) {
        await job.remove();
        cleanedCount++;
      }
    }

    this.logger.log(`清理完成，共清理${cleanedCount}个任务`);
    return cleanedCount;
  }

  /**
   * 暂停队列
   */
  async pauseQueue(): Promise<void> {
    await this.videoQueue.pause();
    this.logger.log('队列已暂停');
  }

  /**
   * 恢复队列
   */
  async resumeQueue(): Promise<void> {
    await this.videoQueue.resume();
    this.logger.log('队列已恢复');
  }
}

