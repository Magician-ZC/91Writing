import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '@app/common/guards';
import { SuggestionService } from './suggestion.service';
import { GenerateSuggestionsDto, AnalyzeTextDto, ApplySuggestionDto } from '../../dto/suggestion.dto';

@Controller('suggestions')
@UseGuards(JwtAuthGuard)
export class SuggestionController {
  constructor(private readonly suggestionService: SuggestionService) {}

  @Post('generate')
  async generateSuggestions(
    @Request() req,
    @Body(ValidationPipe) dto: GenerateSuggestionsDto,
  ) {
    return this.suggestionService.generateRealtimeSuggestions(req.user.id, dto);
  }

  @Post('analyze')
  async analyzeText(
    @Request() req,
    @Body(ValidationPipe) dto: AnalyzeTextDto,
  ) {
    return this.suggestionService.analyzeText(req.user.id, dto);
  }

  @Post('apply')
  async applySuggestion(
    @Request() req,
    @Body(ValidationPipe) dto: ApplySuggestionDto,
  ) {
    return this.suggestionService.applySuggestion(req.user.id, dto);
  }

  @Get('stats')
  async getStats(@Request() req) {
    return this.suggestionService.getSuggestionStats(req.user.id);
  }
}
