import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';
import {
  ITextToImageProvider,
  TextToImageRequest,
  TextToImageResponse,
} from './visual-generation.interface';

/**
 * 火山引擎Visual API配置
 */
interface VolcengineVisualConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  endpoint?: string;
  model?: string; // general-v2, anime-v1等
}

/**
 * 火山引擎文生图Provider
 * 
 * 注意：这是一个基础实现框架，实际使用时需要根据火山引擎的具体API文档调整
 */
@Injectable()
export class VolcengineVisualProvider implements ITextToImageProvider {
  private readonly logger = new Logger(VolcengineVisualProvider.name);
  private readonly client: AxiosInstance;
  private readonly config: VolcengineVisualConfig;

  constructor() {
    this.config = {
      accessKeyId: process.env.VOLCENGINE_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.VOLCENGINE_SECRET_ACCESS_KEY || '',
      region: process.env.VOLCENGINE_VISUAL_REGION || 'cn-beijing',
      endpoint: process.env.VOLCENGINE_VISUAL_ENDPOINT || 'https://visual.volcengineapi.com',
      model: process.env.VOLCENGINE_VISUAL_MODEL || 'general-v2',
    };

    this.client = axios.create({
      baseURL: this.config.endpoint,
      timeout: 120000, // 120秒超时
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 添加请求拦截器用于签名
    this.client.interceptors.request.use((config) => {
      const signature = this.generateSignature(config);
      config.headers['Authorization'] = signature;
      config.headers['X-Date'] = new Date().toISOString();
      return config;
    });
  }

  /**
   * 生成火山引擎API签名
   * 注意：这是一个简化版本，实际需要根据火山引擎的签名算法实现
   */
  private generateSignature(config: any): string {
    // 火山引擎使用HMAC-SHA256签名
    // 具体实现需要参考火山引擎官方文档
    const stringToSign = `${config.method}\n${config.url}\n${JSON.stringify(config.data || {})}`;
    const signature = crypto
      .createHmac('sha256', this.config.secretAccessKey)
      .update(stringToSign)
      .digest('hex');
    
    return `HMAC-SHA256 Credential=${this.config.accessKeyId}, Signature=${signature}`;
  }

  /**
   * 生成图片
   */
  async generateImage(request: TextToImageRequest): Promise<TextToImageResponse> {
    const startTime = Date.now();
    
    try {
      this.logger.log(`开始生成图片，提示词: ${request.prompt.substring(0, 50)}...`);

      // 构建请求参数
      const requestBody = {
        model: this.config.model,
        prompt: request.prompt,
        negative_prompt: request.negativePrompt,
        width: request.width || 1024,
        height: request.height || 576,
        seed: request.seed || Math.floor(Math.random() * 1000000),
        steps: request.steps || 20,
        cfg_scale: request.cfgScale || 7.5,
        sampler: request.sampler || 'euler_a',
        num_images: request.batchSize || 1,
      };

      // 如果有参考图，添加参考图参数
      if (request.referenceImage) {
        requestBody['reference_image'] = request.referenceImage;
        requestBody['reference_weight'] = request.referenceWeight || 0.5;
      }

      // 调用火山引擎API
      const response = await this.client.post('/api/v1/text2img', requestBody);

      const duration = (Date.now() - startTime) / 1000;

      if (response.data && response.data.code === 0) {
        const images = response.data.data.images || [];
        
        this.logger.log(`图片生成成功，耗时: ${duration}秒，生成数量: ${images.length}`);

        return {
          success: true,
          images: images,
          seed: response.data.data.seed,
          duration,
          metadata: {
            model: this.config.model,
            resolution: `${requestBody.width}x${requestBody.height}`,
            steps: requestBody.steps,
          },
        };
      } else {
        throw new Error(response.data?.message || '图片生成失败');
      }
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      this.logger.error(`图片生成失败: ${error.message}`, error.stack);

      return {
        success: false,
        images: [],
        duration,
        error: error.message,
      };
    }
  }

  /**
   * 批量生成图片
   */
  async generateImageBatch(requests: TextToImageRequest[]): Promise<TextToImageResponse[]> {
    this.logger.log(`开始批量生成图片，数量: ${requests.length}`);

    // 并发控制：一次最多3个并发请求
    const concurrency = 3;
    const results: TextToImageResponse[] = [];

    for (let i = 0; i < requests.length; i += concurrency) {
      const batch = requests.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map((req) => this.generateImage(req))
      );
      results.push(...batchResults);

      // 添加延迟避免请求过快
      if (i + concurrency < requests.length) {
        await this.delay(1000); // 1秒延迟
      }
    }

    this.logger.log(`批量生成完成，成功: ${results.filter(r => r.success).length}/${requests.length}`);

    return results;
  }

  /**
   * 检查服务可用性
   */
  async checkHealth(): Promise<boolean> {
    try {
      // 发送一个简单的测试请求
      const testPrompt = 'test';
      const response = await this.client.post('/api/v1/text2img', {
        model: this.config.model,
        prompt: testPrompt,
        width: 256,
        height: 256,
        steps: 1,
      });

      return response.status === 200;
    } catch (error) {
      this.logger.error(`健康检查失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 下载图片到本地
   */
  async downloadImage(imageUrl: string, savePath: string): Promise<string> {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
      });

      const fs = require('fs');
      const path = require('path');

      // 确保目录存在
      const dir = path.dirname(savePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // 保存文件
      fs.writeFileSync(savePath, response.data);

      this.logger.log(`图片已下载到: ${savePath}`);
      return savePath;
    } catch (error) {
      this.logger.error(`图片下载失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

