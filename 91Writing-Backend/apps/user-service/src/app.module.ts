import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DatabaseModule } from '@app/database';
import { UserModule } from './modules/user/user.module';
import { HealthModule } from './modules/health/health.module';
import { UserAIConfigModule } from './modules/ai-config/ai-config.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Passport 模块
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // JWT 模块
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', '91writing_default_secret'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d'),
        },
      }),
      inject: [ConfigService],
    }),

    // 数据库模块
    DatabaseModule,

    // 功能模块
    UserModule,
    HealthModule,
    UserAIConfigModule,
  ],
  controllers: [],
  providers: [
    JwtStrategy,
  ],
})
export class AppModule {}
