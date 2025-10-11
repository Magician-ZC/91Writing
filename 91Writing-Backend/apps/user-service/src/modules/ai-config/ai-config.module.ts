import { Module } from '@nestjs/common';
import { UserAIConfigController } from './ai-config.controller';
import { UserAIConfigService } from './ai-config.service';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [DatabaseModule],
  controllers: [UserAIConfigController],
  providers: [UserAIConfigService],
  exports: [UserAIConfigService],
})
export class UserAIConfigModule {}

