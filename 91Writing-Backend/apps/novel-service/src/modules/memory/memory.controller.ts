import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/common/guards';
import { MemoryService } from './memory.service';
import { CreateMemoryDto } from '../../dto/create-memory.dto';
import { MemoryType } from '@prisma/client';

@ApiTags('memories')
@ApiBearerAuth('JWT-auth')
@Controller('novels/:novelId/memories')
@UseGuards(JwtAuthGuard)
export class MemoryController {
  constructor(private readonly memoryService: MemoryService) {}

  @Post()
  @ApiOperation({ 
    summary: '创建记忆',
    description: '为小说创建新的记忆项，包括人物、场景、情节等'
  })
  @ApiParam({ name: 'novelId', description: '小说ID' })
  @ApiResponse({
    status: 201,
    description: '记忆创建成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            memoryType: { type: 'string', enum: ['CHARACTER', 'SCENE', 'PLOT', 'WORLDVIEW', 'RELATIONSHIP', 'EVENT', 'OTHER'] },
            title: { type: 'string' },
            content: { type: 'string' },
            importance: { type: 'number', example: 5 },
            tags: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  async create(
    @Param('novelId') novelId: string,
    @Request() req,
    @Body(ValidationPipe) createMemoryDto: CreateMemoryDto,
  ) {
    return this.memoryService.create(novelId, req.user.id, createMemoryDto);
  }

  @Get()
  @ApiOperation({ 
    summary: '获取记忆列表',
    description: '获取小说的所有记忆，支持按类型、重要性筛选和排序'
  })
  @ApiParam({ name: 'novelId', description: '小说ID' })
  @ApiQuery({ name: 'type', required: false, enum: ['CHARACTER', 'SCENE', 'PLOT', 'WORLDVIEW', 'RELATIONSHIP', 'EVENT', 'OTHER'], description: '记忆类型' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '返回数量限制' })
  @ApiQuery({ name: 'orderBy', required: false, enum: ['importance', 'created', 'updated'], description: '排序方式' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
  })
  async findAll(
    @Param('novelId') novelId: string,
    @Request() req,
    @Query('type') memoryType?: MemoryType,
    @Query('limit') limit?: string,
    @Query('orderBy') orderBy?: 'importance' | 'created' | 'updated',
  ) {
    const options = {
      memoryType,
      limit: limit ? parseInt(limit, 10) : undefined,
      orderBy,
    };
    
    return this.memoryService.findAll(novelId, req.user.id, options);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.memoryService.findOne(id, req.user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body(ValidationPipe) updateData: Partial<CreateMemoryDto>,
  ) {
    return this.memoryService.update(id, req.user.id, updateData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.memoryService.remove(id, req.user.id);
  }

  @Post('initialize')
  async initializeMemory(
    @Param('novelId') novelId: string,
    @Request() req,
    @Body() basicInfo?: any,
  ) {
    return this.memoryService.initializeNovelMemory(novelId, req.user.id, basicInfo);
  }

  @Get('context/generation')
  @ApiOperation({ 
    summary: '获取AI生成上下文',
    description: '获取用于AI生成的记忆上下文，智能筛选最相关的记忆'
  })
  @ApiParam({ name: 'novelId', description: '小说ID' })
  @ApiQuery({ name: 'maxTokens', required: false, type: Number, description: '最大token数' })
  @ApiQuery({ name: 'chapterContext', required: false, type: String, description: '当前章节上下文' })
  @ApiQuery({ name: 'includeTypes', required: false, type: String, description: '包含的记忆类型（逗号分隔）' })
  @ApiResponse({
    status: 200,
    description: '上下文获取成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            context: { type: 'string', description: '组合的上下文文本' },
            memories: { type: 'array', description: '使用的记忆列表' },
            tokenCount: { type: 'number', example: 1500 }
          }
        }
      }
    }
  })
  async getGenerationContext(
    @Param('novelId') novelId: string,
    @Request() req,
    @Query('maxTokens') maxTokens?: string,
    @Query('chapterContext') chapterContext?: string,
    @Query('includeTypes') includeTypes?: string,
  ) {
    const options: any = {};
    
    if (maxTokens) options.maxTokens = parseInt(maxTokens, 10);
    if (chapterContext) options.chapterContext = chapterContext;
    if (includeTypes) {
      options.includeTypes = includeTypes.split(',') as MemoryType[];
    }
    
    return this.memoryService.getGenerationContext(novelId, req.user.id, options);
  }

  @Post('chapters/:chapterNumber/summary')
  async updateChapterSummary(
    @Param('novelId') novelId: string,
    @Param('chapterNumber') chapterNumber: string,
    @Request() req,
    @Body() body: { summary: string; keyEvents?: string[] },
  ) {
    return this.memoryService.updateChapterSummary(
      novelId,
      req.user.id,
      parseInt(chapterNumber, 10),
      body.summary,
      body.keyEvents,
    );
  }

  @Delete('batch')
  async removeMany(
    @Param('novelId') novelId: string,
    @Request() req,
    @Body() body: { memoryIds: string[] },
  ) {
    return this.memoryService.removeMany(novelId, req.user.id, body.memoryIds);
  }

  @Post('cleanup')
  async cleanup(
    @Param('novelId') novelId: string,
    @Request() req,
    @Body() options?: {
      minImportance?: number;
      maxAge?: number;
      preserveCore?: boolean;
    },
  ) {
    return this.memoryService.cleanupMemories(novelId, req.user.id, options);
  }
}
