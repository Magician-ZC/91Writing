import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AIConfigController } from './ai-config.controller';
import { AIConfigService } from './ai-config.service';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || '91writing_jwt_secret_dev_2024',
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AIConfigController],
  providers: [AIConfigService],
  exports: [AIConfigService],
})
export class AIConfigModule {}

