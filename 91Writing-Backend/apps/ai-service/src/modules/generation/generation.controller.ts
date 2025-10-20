import { Controller, Post, Body, UseGuards, Request, ValidationPipe } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/common/guards';
import { GenerationService } from './generation.service';
import { GenerateContentDto } from '../../dto/conversation.dto';

@ApiTags('AI内容生成')
@ApiBearerAuth('JWT-auth')
@Controller()
@UseGuards(JwtAuthGuard)
export class GenerationController {
  constructor(private readonly generationService: GenerationService) {}

  @Post('generation/content')
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
}
