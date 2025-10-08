import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';

import { DatabaseModule } from '@app/database';
import { AdminModule } from './modules/admin/admin.module';
import { HealthModule } from './modules/health/health.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // 限流配置 (管理后台使用更严格的限流)
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          name: 'short',
          ttl: 1000,
          limit: 2, // 每秒最多2次请求
        },
        {
          name: 'medium',
          ttl: 10000,
          limit: 10, // 每10秒最多10次请求
        },
        {
          name: 'long',
          ttl: 60000,
          limit: 30, // 每分钟最多30次请求
        },
      ],
    }),

    // 缓存配置
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        ttl: 600, // 10分钟缓存
        max: 500, // 最大缓存数量
      }),
    }),

    // 功能模块
    DatabaseModule,
    AdminModule,
    HealthModule,
    AnalyticsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}