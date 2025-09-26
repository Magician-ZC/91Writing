import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get('DATABASE_URL', 'mysql://user:pass@localhost:3306/test'),
        },
      },
      log: ['info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('数据库连接成功');
      
      // 运行健康检查
      await this.healthCheck();
    } catch (error) {
      this.logger.warn('数据库连接失败，应用将在无数据库模式下运行', error.message);
      // 不抛出错误，允许应用继续启动
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('数据库连接已断开');
  }

  /**
   * 数据库健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('数据库健康检查失败', error);
      return false;
    }
  }

  /**
   * 获取数据库连接信息
   */
  async getDatabaseInfo() {
    try {
      const result = await this.$queryRaw`
        SELECT 
          VERSION() as version,
          DATABASE() as database_name,
          USER() as current_user,
          NOW() as current_time
      ` as any[];

      return result[0];
    } catch (error) {
      this.logger.error('获取数据库信息失败', error);
      throw error;
    }
  }

  /**
   * 获取表统计信息
   */
  async getTableStats() {
    try {
      const result = await this.$queryRaw`
        SELECT 
          table_name,
          table_rows,
          data_length,
          index_length,
          (data_length + index_length) as total_size
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()
        ORDER BY total_size DESC
      ` as any[];

      return result;
    } catch (error) {
      this.logger.error('获取表统计信息失败', error);
      throw error;
    }
  }

  /**
   * 清理过期数据
   */
  async cleanupExpiredData() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // 清理过期的用户活动日志 (保留30天)
      const deletedActivities = await this.userActivity.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo,
          },
        },
      });

      // 清理过期的AI使用日志 (保留30天)
      const deletedAILogs = await this.aIUsageLog.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo,
          },
        },
      });

      // 清理过期的激活码
      const expiredCodes = await this.activationCode.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
          status: 'UNUSED',
        },
      });

      this.logger.log(`数据清理完成: 
        - 用户活动日志: ${deletedActivities.count}条
        - AI使用日志: ${deletedAILogs.count}条  
        - 过期激活码: ${expiredCodes.count}条`);

      return {
        deletedActivities: deletedActivities.count,
        deletedAILogs: deletedAILogs.count,
        expiredCodes: expiredCodes.count,
      };
    } catch (error) {
      this.logger.error('数据清理失败', error);
      throw error;
    }
  }
}
