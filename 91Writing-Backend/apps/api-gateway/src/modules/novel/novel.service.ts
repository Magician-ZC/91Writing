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
      const response = await firstValueFrom(
        this.httpService.request({
          url,
          method,
          headers: {
            ...headers,
            host: undefined, // 移除host header避免冲突
          },
          data: body,
          params: query,
        }),
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
