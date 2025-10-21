import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { VideoAPIConfigModule as SharedVideoAPIConfigModule } from '@app/video-config';
import { VideoAPIConfigController } from './video-api-config.controller';

@Module({
  imports: [
    SharedVideoAPIConfigModule,  // 使用共享库
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [VideoAPIConfigController],
})
export class VideoAPIConfigModule {}

