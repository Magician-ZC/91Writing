import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { AuthModule } from '@app/auth';
import { AgentConfigController } from './agent-config.controller';
import { AgentConfigService } from './agent-config.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [AgentConfigController],
  providers: [AgentConfigService],
  exports: [AgentConfigService],
})
export class AgentConfigModule {}

