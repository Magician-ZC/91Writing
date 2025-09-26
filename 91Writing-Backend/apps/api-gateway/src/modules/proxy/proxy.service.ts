import { Injectable } from '@nestjs/common';

@Injectable()
export class ProxyService {
  getStatus() {
    return {
      status: 'active',
      service: 'proxy',
      timestamp: new Date().toISOString(),
      message: '代理服务运行正常',
      services: {
        userService: 'http://localhost:3001',
        novelService: 'http://localhost:3002', 
        aiService: 'http://localhost:3003',
        paymentService: 'http://localhost:3004',
      },
    };
  }
}
