import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import {
  IImageToVideoProvider,
  ImageToVideoRequest,
  ImageToVideoResponse,
  TaskStatusResponse,
} from './visual-generation.interface';

/**
 * 可灵(Kling)图生视频Provider
 * 
 * 可灵是快手推出的AI视频生成模型
 * 文档: https://docs.kuaishou.com/kling
 */
@Injectable()
export class KlingVideoProvider implements IImageToVideoProvider {
  private readonly logger = new Logger(KlingVideoProvider.name);
  private readonly client: AxiosInstance;
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor() {
    this.apiKey = process.env.KLING_API_KEY || '';
    this.apiUrl = process.env.KLING_API_URL || 'https://api.kuaishou.com/kling';

    this.client = axios.create({
      baseURL: this.apiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
    });
  }

  /**
   * 提交图生视频任务
   */
  async submitVideoTask(request: ImageToVideoRequest): Promise<ImageToVideoResponse> {
    try {
      this.logger.log(`可灵: 提交图生视频任务`);

      const requestBody = {
        image_url: request.imageUrl,
        prompt: request.motionPrompt,
        duration: request.duration,
        motion_level: this.mapMotionIntensity(request.motionIntensity),
        fps: request.fps || 24,
        resolution: request.resolution || '1024x576',
        // 可灵的人物一致性参数
        character_reference: request.characterId,
        seed: request.seed,
      };

      const response = await this.client.post('/v1/video/generate', requestBody);

      if (response.data && response.data.success) {
        const taskId = response.data.task_id;
        
        this.logger.log(`可灵: 任务已提交，ID: ${taskId}`);

        return {
          success: true,
          taskId: taskId,
          status: 'pending',
          metadata: {
            model: 'kling-v1',
            resolution: request.resolution || '1024x576',
            fps: request.fps || 24,
            duration: request.duration,
          },
        };
      } else {
        throw new Error(response.data?.error || '任务提交失败');
      }
    } catch (error) {
      this.logger.error(`可灵: 提交任务失败: ${error.message}`);

      return {
        success: false,
        status: 'failed',
        error: error.message,
      };
    }
  }

  /**
   * 查询任务状态
   */
  async queryTaskStatus(taskId: string): Promise<TaskStatusResponse> {
    try {
      const response = await this.client.get(`/v1/video/status/${taskId}`);

      if (response.data && response.data.success) {
        const data = response.data.data;
        
        return {
          taskId: taskId,
          status: this.mapStatus(data.status),
          progress: data.progress || 0,
          result: data.status === 'succeeded' ? {
            videoUrl: data.result.video_url,
          } : undefined,
          error: data.error_message,
          createdAt: new Date(data.created_time * 1000),
          updatedAt: new Date(data.updated_time * 1000),
          estimatedTimeRemaining: data.eta,
        };
      } else {
        throw new Error(response.data?.error || '查询失败');
      }
    } catch (error) {
      this.logger.error(`可灵: 查询任务状态失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 等待任务完成
   */
  async waitForTaskCompletion(
    taskId: string,
    timeout: number = 600000,
  ): Promise<ImageToVideoResponse> {
    const startTime = Date.now();
    const pollInterval = 5000;

    this.logger.log(`可灵: 开始等待任务完成，ID: ${taskId}`);

    while (Date.now() - startTime < timeout) {
      try {
        const status = await this.queryTaskStatus(taskId);

        if (status.status === 'completed') {
          this.logger.log(`可灵: 任务完成，ID: ${taskId}`);
          
          return {
            success: true,
            taskId: taskId,
            videoUrl: status.result?.videoUrl,
            status: 'completed',
            duration: (Date.now() - startTime) / 1000,
          };
        }

        if (status.status === 'failed') {
          this.logger.error(`可灵: 任务失败，ID: ${taskId}`);
          
          return {
            success: false,
            taskId: taskId,
            status: 'failed',
            error: status.error,
          };
        }

        this.logger.debug(`可灵: 任务处理中，进度: ${status.progress}%`);
        await this.delay(pollInterval);
      } catch (error) {
        this.logger.error(`可灵: 轮询出错: ${error.message}`);
        await this.delay(pollInterval);
      }
    }

    this.logger.warn(`可灵: 任务等待超时，ID: ${taskId}`);
    return {
      success: false,
      taskId: taskId,
      status: 'failed',
      error: '任务等待超时',
    };
  }

  /**
   * 取消任务
   */
  async cancelTask(taskId: string): Promise<boolean> {
    try {
      const response = await this.client.delete(`/v1/video/${taskId}`);
      
      if (response.data && response.data.success) {
        this.logger.log(`可灵: 任务已取消，ID: ${taskId}`);
        return true;
      }
      
      return false;
    } catch (error) {
      this.logger.error(`可灵: 取消任务失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 检查服务可用性
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.client.get('/v1/health');
      return response.status === 200 && response.data?.success;
    } catch (error) {
      this.logger.error(`可灵: 健康检查失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 映射运动强度
   */
  private mapMotionIntensity(intensity?: string): number {
    const intensityMap = {
      'low': 1,
      'medium': 2,
      'high': 3,
    };
    return intensityMap[intensity || 'medium'] || 2;
  }

  /**
   * 映射任务状态
   */
  private mapStatus(status: string): 'pending' | 'processing' | 'completed' | 'failed' {
    const statusMap = {
      'pending': 'pending',
      'submitted': 'pending',
      'processing': 'processing',
      'running': 'processing',
      'succeeded': 'completed',
      'completed': 'completed',
      'failed': 'failed',
      'error': 'failed',
      'cancelled': 'failed',
    };

    return statusMap[status.toLowerCase()] || 'pending';
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 下载视频
   */
  async downloadVideo(videoUrl: string, savePath: string): Promise<string> {
    try {
      const response = await axios.get(videoUrl, {
        responseType: 'stream',
      });

      const fs = require('fs');
      const path = require('path');

      const dir = path.dirname(savePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const writer = fs.createWriteStream(savePath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          this.logger.log(`可灵: 视频已下载到: ${savePath}`);
          resolve(savePath);
        });
        writer.on('error', reject);
      });
    } catch (error) {
      this.logger.error(`可灵: 视频下载失败: ${error.message}`);
      throw error;
    }
  }
}

