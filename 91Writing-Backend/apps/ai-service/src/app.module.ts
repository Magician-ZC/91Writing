import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { AssistantModule } from './modules/assistant/assistant.module';
import { GenerationModule } from './modules/generation/generation.module';
import { SuggestionModule } from './modules/suggestion/suggestion.module';
import { WizardModule } from './modules/wizard/wizard.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    DatabaseModule,
    AssistantModule,
    GenerationModule,
    SuggestionModule,
    WizardModule,
    HealthModule,
  ],
})
export class AppModule {}
