import { Controller, Post, Body, UseGuards, Request, ValidationPipe } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard, PackageFeatureGuard, RequireFeature, RequireQuota } from '@app/common';
import { GenerationService } from './generation.service';
import { GenerateContentDto } from '../../dto/conversation.dto';
import {
  GenerateWithMaterialsDto,
  ExtractStyleDto,
  AnalyzePlotDto,
  AnalyzeCharacterDto,
  SimilarityCheckDto,
} from '../../dto/material-generation.dto';

@ApiTags('AI内容生成')
@ApiBearerAuth('JWT-auth')
@Controller()
@UseGuards(JwtAuthGuard, PackageFeatureGuard)
export class GenerationController {
  constructor(private readonly generationService: GenerationService) {}

  @Post('generation/content')
  @RequireFeature('aiWriting')
  @RequireQuota('daily')
  @ApiOperation({ 
    summary: 'AI内容生成',
    description: '使用AI生成小说内容，支持续写、场景、对话、描写、开头、结尾等多种内容类型'
  })
  @ApiBody({
    type: GenerateContentDto,
    description: '生成参数'
  })
  @ApiResponse({
    status: 200,
    description: 'AI生成成功',
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string', example: '主角终于走到了宫殿的大门前...' },
        metadata: {
          type: 'object',
          properties: {
            type: { type: 'string', example: 'continuation' },
            length: { type: 'string', example: 'medium' },
            style: { type: 'string', example: 'current' },
            wordCount: { type: 'number', example: 520 },
            model: { type: 'string', example: 'gpt-4' },
            provider: { type: 'string', example: 'OPENAI' },
            tokensUsed: { type: 'number', example: 1250 }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: '参数错误或AI服务异常',
  })
  @ApiResponse({
    status: 401,
    description: '未授权访问',
  })
  @ApiResponse({
    status: 404,
    description: '小说不存在或无权访问',
  })
  async generateContent(
    @Request() req,
    @Body(ValidationPipe) dto: GenerateContentDto,
  ) {
    return this.generationService.generateContent(req.user.id, dto);
  }

  // ===== 基于素材生成内容 =====
  @Post('generation/with-materials')
  @RequireFeature('materialGeneration')
  @RequireQuota('daily')
  @ApiOperation({ 
    summary: '基于素材生成内容',
    description: '使用素材库作为参考和灵感生成内容，支持风格、结构、角色、场景等多种引用方式'
  })
  @ApiBody({ type: GenerateWithMaterialsDto })
  @ApiResponse({ status: 200, description: '生成成功' })
  @ApiResponse({ status: 403, description: '无权限或配额不足' })
  async generateWithMaterials(
    @Request() req,
    @Body(ValidationPipe) dto: GenerateWithMaterialsDto,
  ) {
    return this.generationService.generateWithMaterials(req.user.id, dto);
  }

  @Post('generation/continue')
  @RequireFeature('aiWriting')
  @RequireQuota('daily')
  @ApiOperation({ summary: '续写内容' })
  @ApiBody({ type: GenerateContentDto })
  @ApiResponse({ status: 200, description: '续写成功' })
  @ApiResponse({ status: 403, description: '无权限或配额不足' })
  async continueContent(
    @Request() req,
    @Body(ValidationPipe) dto: GenerateContentDto,
  ) {
    return this.generationService.generateContent(req.user.id, { ...dto, type: 'continuation' });
  }

  @Post('generation/rewrite')
  @RequireFeature('aiWriting')
  @RequireQuota('daily')
  @ApiOperation({ summary: '改写内容' })
  @ApiBody({ type: GenerateContentDto })
  @ApiResponse({ status: 200, description: '改写成功' })
  @ApiResponse({ status: 403, description: '无权限或配额不足' })
  async rewriteContent(
    @Request() req,
    @Body(ValidationPipe) dto: GenerateContentDto,
  ) {
    return this.generationService.generateContent(req.user.id, { ...dto, type: 'rewrite' });
  }

  @Post('generation/expand')
  @RequireFeature('aiWriting')
  @RequireQuota('daily')
  @ApiOperation({ summary: '扩展内容' })
  @ApiBody({ type: GenerateContentDto })
  @ApiResponse({ status: 200, description: '扩展成功' })
  @ApiResponse({ status: 403, description: '无权限或配额不足' })
  async expandContent(
    @Request() req,
    @Body(ValidationPipe) dto: GenerateContentDto,
  ) {
    return this.generationService.generateContent(req.user.id, { ...dto, type: 'expansion' });
  }

  // ===== 素材分析接口 =====
  @Post('analysis/extract-style')
  @ApiOperation({ summary: '提取写作风格' })
  @ApiBody({ type: ExtractStyleDto })
  @ApiResponse({ status: 200, description: '提取成功' })
  async extractStyle(
    @Request() req,
    @Body(ValidationPipe) dto: ExtractStyleDto,
  ) {
    return this.generationService.extractStyle(dto);
  }

  @Post('analysis/plot-structure')
  @ApiOperation({ summary: '分析情节结构' })
  @ApiBody({ type: AnalyzePlotDto })
  @ApiResponse({ status: 200, description: '分析成功' })
  async analyzePlot(
    @Request() req,
    @Body(ValidationPipe) dto: AnalyzePlotDto,
  ) {
    return this.generationService.analyzePlot(dto);
  }

  @Post('analysis/character-traits')
  @ApiOperation({ summary: '分析角色特征' })
  @ApiBody({ type: AnalyzeCharacterDto })
  @ApiResponse({ status: 200, description: '分析成功' })
  async analyzeCharacter(
    @Request() req,
    @Body(ValidationPipe) dto: AnalyzeCharacterDto,
  ) {
    return this.generationService.analyzeCharacter(dto);
  }

  @Post('analysis/similarity')
  @ApiOperation({ summary: '检测内容相似度' })
  @ApiBody({ type: SimilarityCheckDto })
  @ApiResponse({ status: 200, description: '检测成功' })
  async checkSimilarity(
    @Request() req,
    @Body(ValidationPipe) dto: SimilarityCheckDto,
  ) {
    return this.generationService.checkSimilarity(dto);
  }
}
