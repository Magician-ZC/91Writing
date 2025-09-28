import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // 如果返回的数据已经是标准格式，直接返回
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // 包装为标准响应格式
        return {
          success: true,
          data,
          message: this.getSuccessMessage(context),
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }

  private getSuccessMessage(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const path = request.route?.path || request.url;

    // 根据请求方法和路径返回相应的成功消息
    if (method === 'POST') {
      if (path.includes('login')) return '登录成功';
      if (path.includes('logout')) return '登出成功';
      return '创建成功';
    }
    
    if (method === 'PUT' || method === 'PATCH') {
      return '更新成功';
    }
    
    if (method === 'DELETE') {
      return '删除成功';
    }
    
    // GET 请求通常不需要特殊消息
    return '';
  }
}