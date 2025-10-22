import { Module } from '@nestjs/common';
import { SuggestionService } from './suggestion.service';
import { SuggestionController } from './suggestion.controller';
import { FeatureQuotaService } from '@app/common';

@Module({
  controllers: [SuggestionController],
  providers: [SuggestionService, FeatureQuotaService],
  exports: [SuggestionService],
})
export class SuggestionModule {}
