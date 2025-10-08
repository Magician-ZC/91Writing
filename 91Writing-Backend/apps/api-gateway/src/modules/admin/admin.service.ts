import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  private readonly adminServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.adminServiceUrl = this.configService.get<string>(
      'ADMIN_SERVICE_URL',
      'http://localhost:3006',
    );
  }

  async proxyRequest(req: Request) {
    const { method, url, headers, body } = req;
    
    // 清理路径，移除 /admin 前缀
    const targetPath = url.replace(/^\/admin/, '') || '/';
    const targetUrl = `${this.adminServiceUrl}${targetPath}`;

    // 过滤和清理请求头
    const cleanHeaders = this.cleanHeaders(headers);

    // 记录请求日志
    this.logger.log(`代理请求: ${method} ${targetUrl}`);

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