import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import {
  IImageToVideoProvider,
  ImageToVideoRequest,
  ImageToVideoResponse,
  TaskStatusResponse,
} from './visual-generation.interface';

/**
 * 即梦图生视频Provider
 * 
 * 即梦(Jimeng)是字节跳动旗下的AI视频生成平台
 * 文档: https://www.jimeng.ai/developers
 */
@Injectable()
export class JimengVideoProvider implements IImageToVideoProvider {
  private readonly logger = new Logger(JimengVideoProvider.name);
  private readonly client: AxiosInstance;
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor() {
    this.apiKey = process.env.JIMENG_API_KEY || '';
    this.apiUrl = process.env.JIMENG_API_URL || 'https://api.jimeng.ai';

    this.client = axios.create({
      baseURL: this.apiUrl,
      timeout: 30000, // 30秒超时
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });
  }

  /**
   * 提交图生视频任务
   */
  async submitVideoTask(request: ImageToVideoRequest): Promise<ImageToVideoResponse> {
    try {
      this.logger.log(`提交图生视频任务，图片: ${request.imageUrl}`);

      const requestBody = {
        image_url: request.imageUrl,
        motion_prompt: request.motionPrompt,
        duration: request.duration,
        motion_intensity: request.motionIntensity || 'medium',
        fps: request.fps || 24,
        resolution: request.resolution || '1024x576',
        seed: request.seed,
        // 人物一致性参数
        character_id: request.characterId,
      };

      const response = await this.client.post('/v1/image-to-video', requestBody);

      if (response.data && response.data.code === 200) {
        const taskId = response.data.data.task_id;
        
        this.logger.log(`视频生成任务已提交，任务ID: ${taskId}`);

        return {
          success: true,
          taskId: taskId,
          status: 'pending',
          metadata: {
            model: 'jimeng-v1',
            resolution: request.resolution || '1024x576',
            fps: request.fps || 24,
            duration: request.duration,
          },
        };
      } else {
        throw new Error(response.data?.message || '任务提交失败');
      }
    } catch (error) {
      this.logger.error(`提交视频任务失败: ${error.message}`, error.stack);

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
      const response = await this.client.get(`/v1/tasks/${taskId}`);

      if (response.data && response.data.code === 200) {
        const data = response.data.data;
        
        return {
          taskId: taskId,
          status: this.mapStatus(data.status),
          progress: data.progress || 0,
          result: data.status === 'completed' ? {
            videoUrl: data.video_url,
          } : undefined,
          error: data.error,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
          estimatedTimeRemaining: data.estimated_time_remaining,
        };
      } else {
        throw new Error(response.data?.message || '查询任务状态失败');
      }
    } catch (error) {
      this.logger.error(`查询任务状态失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 等待任务完成(轮询)
   */
  async waitForTaskCompletion(
    taskId: string,
    timeout: number = 600000, // 默认10分钟超时
  ): Promise<ImageToVideoResponse> {
    const startTime = Date.now();
    const pollInterval = 5000; // 5秒轮询一次

    this.logger.log(`开始等待任务完成，任务ID: ${taskId}`);

    while (Date.now() - startTime < timeout) {
      try {
        const status = await this.queryTaskStatus(taskId);

        if (status.status === 'completed') {
          this.logger.log(`任务完成，任务ID: ${taskId}`);
          
          return {
            success: true,
            taskId: taskId,
            videoUrl: status.result?.videoUrl,
            status: 'completed',
            duration: (Date.now() - startTime) / 1000,
          };
        }

        if (status.status === 'failed') {
          this.logger.error(`任务失败，任务ID: ${taskId}，错误: ${status.error}`);
          
          return {
            success: false,
            taskId: taskId,
            status: 'failed',
            error: status.error,
          };
        }

        // 任务仍在处理中，等待后继续轮询
        this.logger.debug(`任务处理中，进度: ${status.progress}%`);
        await this.delay(pollInterval);
      } catch (error) {
        this.logger.error(`轮询任务状态出错: ${error.message}`);
        // 继续轮询
        await this.delay(pollInterval);
      }
    }

    // 超时
    this.logger.warn(`任务等待超时，任务ID: ${taskId}`);
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
      const response = await this.client.post(`/v1/tasks/${taskId}/cancel`);
      
      if (response.data && response.data.code === 200) {
        this.logger.log(`任务已取消，任务ID: ${taskId}`);
        return true;
      }
      
      return false;
    } catch (error) {
      this.logger.error(`取消任务失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 检查服务可用性
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.client.get('/v1/health');
      return response.status === 200;
    } catch (error) {
      this.logger.error(`健康检查失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 映射任务状态
   */
  private mapStatus(status: string): 'pending' | 'processing' | 'completed' | 'failed' {
    const statusMap = {
      'pending': 'pending',
      'queued': 'pending',
      'processing': 'processing',
      'running': 'processing',
      'completed': 'completed',
      'success': 'completed',
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
   * 下载视频到本地
   */
  async downloadVideo(videoUrl: string, savePath: string): Promise<string> {
    try {
      const response = await axios.get(videoUrl, {
        responseType: 'stream',
      });

      const fs = require('fs');
      const path = require('path');

      // 确保目录存在
      const dir = path.dirname(savePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // 保存文件
      const writer = fs.createWriteStream(savePath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          this.logger.log(`视频已下载到: ${savePath}`);
          resolve(savePath);
        });
        writer.on('error', reject);
      });
    } catch (error) {
      this.logger.error(`视频下载失败: ${error.message}`);
      throw error;
    }
  }
}

