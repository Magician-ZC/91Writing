import {
  Controller,
  All,
  Req,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { UsersService } from './users.service';

@ApiTags('用户服务代理')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @All('*')
  @ApiExcludeEndpoint()
  async proxyToUserService(@Req() req: Request, @Res() res: Response) {
    try {
      const response = await this.usersService.proxyRequest(req);
      
      // 设置响应头
      Object.keys(response.headers).forEach(key => {
        if (key.toLowerCase() !== 'content-encoding') {
          res.set(key, response.headers[key]);
        }
      });
      
      // 设置状态码并返回数据
      res.status(response.status).send(response.data);
    } catch (error) {
      console.error('用户服务代理错误:', error);
      
      if (error.response) {
        // 转发后端服务的错误响应
        res.status(error.response.status).json(error.response.data);
      } else {
        // 处理网络错误或其他错误
        throw new HttpException(
          {
            message: '用户服务暂时不可用',
            error: 'User Service Unavailable',
          },
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
    }
  }
}
