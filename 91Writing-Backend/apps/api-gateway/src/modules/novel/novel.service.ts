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
        },
        params: query,
      };

      // 只有在非 GET/DELETE 请求时才添加 body
      if (method !== 'GET' && method !== 'DELETE' && body !== undefined) {
        requestConfig.data = body;
      }

      const response = await firstValueFrom(
        this.httpService.request(requestConfig),
      );
      
      return response.data;
    } catch (error) {
      if (error.response) {
        throw error.response.data;
      }
      throw error;
    }
  }
}
