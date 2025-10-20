import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DatabaseModule } from '@app/database';
import { AssistantService } from './assistant.service';
import { AssistantController } from './assistant.controller';
import { AICallerService } from '../../services/ai-caller.service';
import { ContextManagerService } from '../../services/context-manager.service';
// 导入存在的AI提供商
import { ClaudeProvider } from '../../providers/claude.provider';
import { DeepSeekProvider } from '../../providers/deepseek.provider';
import { OpenAIProvider } from '../../providers/openai.provider';

@Module({
  imports: [
    DatabaseModule,
    // 导入USER_SERVICE客户端
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.USER_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.USER_SERVICE_PORT) || 3002,
        },
      },
    ]),
  ],
  controllers: [AssistantController],
  providers: [
    AssistantService,
    AICallerService,
    ContextManagerService,
    ClaudeProvider,
    DeepSeekProvider,
    OpenAIProvider,
  ],
  exports: [AssistantService],
})
export class AssistantModule {}
