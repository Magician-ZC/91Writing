import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NovelService {
  private novelServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.novelServiceUrl = this.configService.get<string>(
      'NOVEL_SERVICE_URL',
      'http://localhost:3003',
    );
  }

  async proxyRequest(path: string, method: string, headers: any, body?: any, query?: any) {
    const url = `${this.novelServiceUrl}${path}`;
    
    try {
      // 构建请求配置
      const requestConfig: any = {
        url,
        method,
        headers: {
          ...headers,
          host: undefined, // 移除host header避免冲突
          // 移除缓存相关的头，防止304响应
          'if-none-match': undefined,
          'if-modified-since': undefined,
        },
        params: query,
        // 配置axios接受所有状态码，包括304
        validateStatus: (status) => status >= 200 && status < 500,
      };

      // 只有在非 GET/DELETE 请求时才添加 body
      if (method !== 'GET' && method !== 'DELETE' && body !== undefined) {
        requestConfig.data = body;
      }

      const response = await firstValueFrom(
        this.httpService.request(requestConfig),
      );
      
      // 处理304响应 - 返回空数据但标记成功
      if (response.status === 304) {
        return {
          success: true,
          data: null,
          message: 'Not Modified',
          cached: true,
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Novel service request failed:', {
        url,
        method,
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      if (error.response) {
        throw error.response.data;
      }
      throw error;
    }
  }
}
