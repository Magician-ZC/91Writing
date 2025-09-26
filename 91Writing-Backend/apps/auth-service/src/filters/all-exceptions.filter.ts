import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    path: string;
    method: string;
    requestId?: string;
  };
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.buildErrorResponse(exception, request);

    // 记录错误日志
    this.logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : JSON.stringify(exception),
    );

    response.status(errorResponse.error.code as any).json(errorResponse);
  }

  private buildErrorResponse(exception: unknown, request: Request): ErrorResponse {
    const timestamp = new Date().toISOString();
    const path = request.url;
    const method = request.method;
    const requestId = request.headers['x-request-id'] as string;

    // HTTP异常
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      
      return {
        success: false,
        error: {
          code: status.toString(),
          message: typeof response === 'string' ? response : (response as any).message || exception.message,
          details: typeof response === 'object' ? response : undefined,
          timestamp,
          path,
          method,
          requestId,
        },
      };
    }

    // Prisma数据库异常
    if (exception instanceof PrismaClientKnownRequestError) {
      const { code, message } = this.handlePrismaError(exception);
      return {
        success: false,
        error: {
          code,
          message,
          details: {
            prismaCode: exception.code,
            target: exception.meta?.target,
          },
          timestamp,
          path,
          method,
          requestId,
        },
      };
    }

    // 验证错误
    if (exception instanceof Error && exception.name === 'ValidationError') {
      return {
        success: false,
        error: {
          code: HttpStatus.BAD_REQUEST.toString(),
          message: '数据验证失败',
          details: exception.message,
          timestamp,
          path,
          method,
          requestId,
        },
      };
    }

    // 未知错误
    return {
      success: false,
      error: {
        code: HttpStatus.INTERNAL_SERVER_ERROR.toString(),
        message: '服务器内部错误',
        details: process.env.NODE_ENV === 'development' 
          ? {
              error: exception instanceof Error ? exception.message : String(exception),
              stack: exception instanceof Error ? exception.stack : undefined,
            }
          : undefined,
        timestamp,
        path,
        method,
        requestId,
      },
    };
  }

  private handlePrismaError(error: PrismaClientKnownRequestError): { code: string; message: string } {
    switch (error.code) {
      case 'P2002':
        return {
          code: HttpStatus.CONFLICT.toString(),
          message: '数据已存在，违反唯一性约束',
        };
      case 'P2025':
        return {
          code: HttpStatus.NOT_FOUND.toString(),
          message: '未找到相关记录',
        };
      case 'P2003':
        return {
          code: HttpStatus.BAD_REQUEST.toString(),
          message: '外键约束失败',
        };
      case 'P2011':
        return {
          code: HttpStatus.BAD_REQUEST.toString(),
          message: '空值约束失败',
        };
      case 'P2012':
        return {
          code: HttpStatus.BAD_REQUEST.toString(),
          message: '缺少必需值',
        };
      case 'P2014':
        return {
          code: HttpStatus.BAD_REQUEST.toString(),
          message: '数据关系无效',
        };
      default:
        return {
          code: HttpStatus.INTERNAL_SERVER_ERROR.toString(),
          message: '数据库操作失败',
        };
    }
  }
}
