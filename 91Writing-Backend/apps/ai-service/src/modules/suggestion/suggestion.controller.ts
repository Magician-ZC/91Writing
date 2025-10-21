import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, PackageFeatureGuard, RequireFeature, RequireQuota } from '@app/common';
import { SuggestionService } from './suggestion.service';
import { GenerateSuggestionsDto, AnalyzeTextDto, ApplySuggestionDto } from '../../dto/suggestion.dto';

@ApiTags('写作建议')
@ApiBearerAuth('JWT-auth')
@Controller()
@UseGuards(JwtAuthGuard, PackageFeatureGuard)
export class SuggestionController {
  constructor(private readonly suggestionService: SuggestionService) {}

  @Post('suggestions/generate')
  @RequireFeature('aiWriting')
  @RequireQuota('daily')
  @ApiOperation({ summary: '生成写作建议' })
  @ApiResponse({ status: 200, description: '建议生成成功' })
  @ApiResponse({ status: 403, description: '无权限或配额不足' })
  async generateSuggestions(
    @Request() req,
    @Body(ValidationPipe) dto: GenerateSuggestionsDto,
  ) {
    return this.suggestionService.generateRealtimeSuggestions(req.user.id, dto);
  }

  @Post('suggestions/analyze')
  @RequireFeature('aiWriting')
  @ApiOperation({ summary: '分析文本' })
  @ApiResponse({ status: 200, description: '分析成功' })
  @ApiResponse({ status: 403, description: '无权限或配额不足' })
  async analyzeText(
    @Request() req,
    @Body(ValidationPipe) dto: AnalyzeTextDto,
  ) {
    return this.suggestionService.analyzeText(req.user.id, dto);
  }

  @Post('suggestions/apply')
  @ApiOperation({ summary: '应用建议' })
  @ApiResponse({ status: 200, description: '应用成功' })
  async applySuggestion(
    @Request() req,
    @Body(ValidationPipe) dto: ApplySuggestionDto,
  ) {
    return this.suggestionService.applySuggestion(req.user.id, dto);
  }

  @Get('suggestions/stats')
  @ApiOperation({ summary: '获取建议统计' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getStats(@Request() req) {
    return this.suggestionService.getSuggestionStats(req.user.id);
  }
}
