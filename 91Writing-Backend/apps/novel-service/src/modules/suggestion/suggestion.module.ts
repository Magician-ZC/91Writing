import { Module } from '@nestjs/common';
import { SuggestionController } from './suggestion.controller';
import { SuggestionService } from './suggestion.service';
import { FeatureQuotaService } from '@app/common';

@Module({
  controllers: [SuggestionController],
  providers: [SuggestionService, FeatureQuotaService],
  exports: [SuggestionService],
})
export class SuggestionModule {}

