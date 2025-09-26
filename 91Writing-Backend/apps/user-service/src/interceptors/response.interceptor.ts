import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';

export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    timestamp: string;
    path: string;
    method: string;
    requestId?: string;
    duration?: number;
  };
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const startTime = Date.now();
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        // 设置响应头
        response.setHeader('X-Response-Time', `${duration}ms`);
        if (request.headers['x-request-id']) {
          response.setHeader('X-Request-ID', request.headers['x-request-id']);
        }

        // 构建统一响应格式
        const apiResponse: ApiResponse<T> = {
          success: true,
          data,
          meta: {
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            requestId: request.headers['x-request-id'] as string,
            duration,
          },
        };

        // 根据不同的响应类型添加不同的消息
        if (request.method === 'POST') {
          apiResponse.message = '创建成功';
        } else if (request.method === 'PUT' || request.method === 'PATCH') {
          apiResponse.message = '更新成功';
        } else if (request.method === 'DELETE') {
          apiResponse.message = '删除成功';
        } else if (request.method === 'GET') {
          if (Array.isArray(data)) {
            apiResponse.message = '查询成功';
          } else if (data && typeof data === 'object' && 'users' in data) {
            apiResponse.message = '用户列表查询成功';
          } else {
            apiResponse.message = '获取成功';
          }
        }

        return apiResponse;
      }),
    );
  }
}
