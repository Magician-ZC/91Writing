import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  private startTime = Date.now();

  getHealthStatus() {
    const now = Date.now();
    const uptime = Math.floor((now - this.startTime) / 1000);
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      service: 'api-gateway',
      memoryUsage: process.memoryUsage(),
    };
  }

  getReadinessStatus() {
    // 检查依赖服务是否就绪
    const checks = {
      database: true, // TODO: 实际检查数据库连接
      redis: true,    // TODO: 实际检查Redis连接
      services: {
        userService: true,
        novelService: true,
        aiService: true,
        paymentService: true,
      },
    };

    const allReady = Object.values(checks).every((check) => {
      if (typeof check === 'object') {
        return Object.values(check).every(Boolean);
      }
      return check;
    });

    return {
      status: allReady ? 'ready' : 'not_ready',
      checks,
      timestamp: new Date().toISOString(),
    };
  }

  getLivenessStatus() {
    // 简单的存活检查
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }
}
