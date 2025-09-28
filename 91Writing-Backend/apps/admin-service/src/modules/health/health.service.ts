import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'admin-service',
      version: '1.0.0',
    };
  }

  async getDetailedHealth() {
    const startTime = Date.now();
    
    // 检查数据库连接
    let dbStatus = 'ok';
    let dbLatency = 0;
    
    try {
      const dbStart = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatency = Date.now() - dbStart;
    } catch (error) {
      dbStatus = 'error';
      console.error('数据库健康检查失败:', error);
    }

    const totalLatency = Date.now() - startTime;

    return {
      status: dbStatus === 'ok' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      service: 'admin-service',
      version: '1.0.0',
      checks: {
        database: {
          status: dbStatus,
          latency: `${dbLatency}ms`,
        },
      },
      latency: `${totalLatency}ms`,
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB',
      },
    };
  }
}