import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 检查数据库连接状态
   */
  async checkDatabase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 检查用户服务特定功能
   */
  async checkUserService(): Promise<{
    canQuery: boolean;
    userCount: number;
    lastUserCreated?: Date;
  }> {
    try {
      // 测试基本查询功能
      const userCount = await this.prisma.user.count();
      
      // 获取最近创建的用户时间
      const lastUser = await this.prisma.user.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      });

      return {
        canQuery: true,
        userCount,
        lastUserCreated: lastUser?.createdAt,
      };
    } catch (error) {
      return {
        canQuery: false,
        userCount: 0,
      };
    }
  }

  /**
   * 获取服务性能指标
   */
  getPerformanceMetrics() {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        external: Math.round(memoryUsage.external / 1024 / 1024), // MB
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      uptime: Math.round(process.uptime()), // seconds
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 获取服务依赖状态
   */
  async getDependencyStatus() {
    const databaseStatus = await this.checkDatabase();
    const userServiceStatus = await this.checkUserService();

    return {
      database: {
        status: databaseStatus ? 'healthy' : 'unhealthy',
        canConnect: databaseStatus,
      },
      userService: {
        status: userServiceStatus.canQuery ? 'healthy' : 'unhealthy',
        ...userServiceStatus,
      },
    };
  }
}
