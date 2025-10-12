import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly userServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.userServiceUrl = this.configService.get<string>(
      'USER_SERVICE_URL',
      'http://localhost:3001',
    );
  }

  async proxyRequest(req: Request) {
    const { method, url, headers, body } = req;
    
    // 从URL中提取路径，移除/api/v1/users前缀
    let targetPath = url;
    const prefixes = ['/api/v1/users', '/users'];
    for (const prefix of prefixes) {
      if (targetPath.startsWith(prefix)) {
        targetPath = targetPath.substring(prefix.length);
        break;
      }
    }
    
    // 确保路径以/开头
    if (!targetPath.startsWith('/')) {
      targetPath = '/' + targetPath;
    }
    
    const targetUrl = `${this.userServiceUrl}/api/v1/users${targetPath}`;

    // 过滤和清理请求头
    const cleanHeaders = this.cleanHeaders(headers);

    // 记录请求日志
    this.logger.log(`代理请求: ${method} ${targetUrl} (原始URL: ${url})`);

    try {
      const response = await firstValueFrom(
        this.httpService.request({
          method: method as any,
          url: targetUrl,
          headers: cleanHeaders,
          data: body,
          timeout: 30000, // 30秒超时
          validateStatus: () => true, // 接受所有状态码
        }),
      );

      return response;
    } catch (error) {
      this.logger.error(`代理请求失败: ${method} ${targetUrl}`, error);
      throw error;
    }
  }

  private cleanHeaders(headers: Record<string, any>): Record<string, any> {
    const cleanHeaders = { ...headers };
    
    // 移除不应该转发的头
    const headersToRemove = [
      'host',
      'connection',
      'content-length',
      'transfer-encoding',
      'x-forwarded-for',
      'x-forwarded-proto',
      'x-forwarded-host',
    ];

    headersToRemove.forEach(header => {
      delete cleanHeaders[header];
      delete cleanHeaders[header.toLowerCase()];
    });

    // 设置代理标识
    cleanHeaders['x-forwarded-by'] = 'api-gateway';
    cleanHeaders['x-original-host'] = headers.host;

    return cleanHeaders;
  }
}
