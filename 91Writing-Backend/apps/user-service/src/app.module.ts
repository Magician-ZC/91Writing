import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@app/database';
import { UserModule } from './modules/user/user.module';
import { HealthModule } from './modules/health/health.module';
import { UserAIConfigModule } from './modules/ai-config/ai-config.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // 数据库模块
    DatabaseModule,

    // 功能模块
    UserModule,
    HealthModule,
    UserAIConfigModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
