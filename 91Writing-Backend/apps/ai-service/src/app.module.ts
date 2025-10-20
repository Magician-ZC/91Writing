import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DatabaseModule } from '@app/database';
import { AssistantModule } from './modules/assistant/assistant.module';
import { GenerationModule } from './modules/generation/generation.module';
import { SuggestionModule } from './modules/suggestion/suggestion.module';
import { WizardModule } from './modules/wizard/wizard.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    DatabaseModule,
    // 注册USER_SERVICE客户端
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.USER_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.USER_SERVICE_PORT) || 3004,
        },
      },
    ]),
    AssistantModule,
    GenerationModule,
    SuggestionModule,
    WizardModule,
    HealthModule,
  ],
  exports: [ClientsModule],
})
export class AppModule {}
