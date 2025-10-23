import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { DatabaseModule } from '@app/database';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { VideoGenerationController } from './video-generation.controller';
import { BatchVideoGenerationController } from './batch-video-generation.controller';
import { VideoGenerationService } from './video-generation.service';
import { StoryboardAgentService } from '../../services/storyboard-agent.service';
import { ImageGenerationAgentService } from '../../services/image-generation-agent.service';
import { VideoGenerationAgentService } from '../../services/video-generation-agent.service';
import { BatchVideoGenerationService } from '../../services/batch-video-generation.service';
import { VideoDurationCalculatorService } from '../../services/video-duration-calculator.service';
import { LongVideoMergerService } from '../../services/long-video-merger.service';
import { VolcengineVisualProvider } from '../../providers/volcengine-visual.provider';
import { JimengVideoProvider } from '../../providers/jimeng-video.provider';
import { KlingVideoProvider } from '../../providers/kling-video.provider';
import { FFmpegService } from '../../services/ffmpeg.service';
import { AICallerService } from '../../services/ai-caller.service';
import { VideoGenerationQueue } from '../../queues/video-generation.queue';
import { VideoGenerationProcessor } from '../../queues/video-generation.processor';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { FeatureQuotaService } from '@app/common';

@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
    // Bull队列配置
    BullModule.registerQueue({
      name: 'video-generation',
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
      },
      defaultJobOptions: {
        removeOnComplete: 100, // 保留最近100个已完成任务
        removeOnFail: 50, // 保留最近50个失败任务
      },
    }),
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.USER_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.USER_SERVICE_PORT || '3001'),
        },
      },
    ]),
  ],
  controllers: [
    VideoGenerationController,
    BatchVideoGenerationController,
  ],
  providers: [
    VideoGenerationService,
    VideoGenerationQueue,
    VideoGenerationProcessor,
    StoryboardAgentService,
    ImageGenerationAgentService,
    VideoGenerationAgentService,
    // 新增批量视频生成服务
    BatchVideoGenerationService,
    VideoDurationCalculatorService,
    LongVideoMergerService,
    // Provider
    VolcengineVisualProvider,
    JimengVideoProvider,
    KlingVideoProvider,
    FFmpegService,
    AICallerService,
    FeatureQuotaService,
  ],
  exports: [
    VideoGenerationService,
    VideoGenerationQueue,
    BatchVideoGenerationService,
    LongVideoMergerService,
  ],
})
export class VideoGenerationModule {}

