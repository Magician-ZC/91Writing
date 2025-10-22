import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '@app/database';
import { VideoAPIConfigController } from './video-api-config.controller';
import { VideoAPIConfigService } from './video-api-config.service';

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
  controllers: [VideoAPIConfigController],
  providers: [VideoAPIConfigService],
  exports: [VideoAPIConfigService],
})
export class VideoAPIConfigModule {}

