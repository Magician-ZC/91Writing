import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  getStatus() {
    return {
      status: 'active',
      service: 'auth',
      timestamp: new Date().toISOString(),
      message: '认证服务运行正常',
    };
  }
}
