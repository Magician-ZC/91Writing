import { Injectable, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import axios from 'axios';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly aiServiceUrl: string;

  constructor() {
    const host = process.env.AI_SERVICE_HOST || 'localhost';
    const port = process.env.AI_SERVICE_PORT || '3004';
    this.aiServiceUrl = `http://${host}:${port}`;
  }

  async forwardRequest(req: Request, res: Response) {
    try {
      // 移除前缀 /ai
      const targetPath = req.url.replace(/^\/ai/, '');
      const targetUrl = `${this.aiServiceUrl}${targetPath}`;

      this.logger.debug(`转发请求到AI Service: ${targetUrl}`);

      const response = await axios({
        method: req.method,
        url: targetUrl,
        headers: {
          ...req.headers,
          host: undefined,
        },
        data: req.body,
        params: req.query,
        responseType: 'stream',
      });

      Object.keys(response.headers).forEach((key) => {
        res.setHeader(key, response.headers[key]);
      });

      res.status(response.status);
      response.data.pipe(res);
    } catch (error) {
      this.logger.error(`转发到AI Service失败: ${error.message}`);
      
      if (error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(500).json({
          success: false,
          message: 'AI服务不可用',
          error: error.message,
        });
      }
    }
  }
}
