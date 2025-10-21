import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { VideoAPIConfigService } from './video-api-config.service';

@Module({
  imports: [DatabaseModule],
  providers: [VideoAPIConfigService],
  exports: [VideoAPIConfigService],
})
export class VideoAPIConfigModule {}

