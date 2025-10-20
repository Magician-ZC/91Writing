import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  ValidationPipe,
  HttpCode,
  HttpStatus,
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
import {
  CreateMemoryDto,
  UpdateMemoryDto,
  QueryMemoriesDto,
  ExtractMemoriesDto,
  ScoreMemoryDto,
} from '../../dto/memory.dto';

@ApiTags('记忆管理')
@ApiBearerAuth('JWT-auth')
@Controller()
@UseGuards(JwtAuthGuard)
export class MemoryController {
  constructor(private readonly memoryService: MemoryService) {}

  @Post('memories')
  @ApiOperation({
    summary: '创建记忆',
    description: '为小说创建新的记忆条目'
  })
  @ApiBody({ type: CreateMemoryDto })
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
            novelId: { type: 'string' },
            memoryType: { type: 'string', example: 'CORE' },
            content: { type: 'object' },
            importance: { type: 'number', example: 0.8 },
            chapterRange: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: '参数验证失败' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 404, description: '小说不存在' })
  async createMemory(
    @Request() req,
    @Body(ValidationPipe) dto: CreateMemoryDto
  ) {
    return this.memoryService.createMemory(req.user.id, dto);
  }

  @Get('memories/novel/:novelId')
  @ApiOperation({
    summary: '获取小说记忆列表',
    description: '获取指定小说的所有记忆，支持筛选和分页'
  })
  @ApiParam({ name: 'novelId', description: '小说ID' })
  @ApiQuery({ name: 'memoryType', required: false, description: '记忆类型' })
  @ApiQuery({ name: 'keyword', required: false, description: '关键词搜索' })
  @ApiQuery({ name: 'minImportance', required: false, description: '最小重要性' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object'
              }
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number' },
                pageSize: { type: 'number' },
                total: { type: 'number' },
                totalPages: { type: 'number' }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 404, description: '小说不存在' })
  async getMemories(
    @Request() req,
    @Param('novelId') novelId: string,
    @Query(ValidationPipe) query: QueryMemoriesDto
  ) {
    return this.memoryService.getMemories(req.user.id, novelId, query);
  }

  @Get('memories/:id')
  @ApiOperation({
    summary: '获取单个记忆',
    description: '获取指定ID的记忆详情'
  })
  @ApiParam({ name: 'id', description: '记忆ID' })
  @ApiResponse({
    status: 200,
    description: '获取成功'
  })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 403, description: '无权访问' })
  @ApiResponse({ status: 404, description: '记忆不存在' })
  async getMemory(
    @Request() req,
    @Param('id') id: string
  ) {
    return this.memoryService.getMemory(req.user.id, id);
  }

  @Put('memories/:id')
  @ApiOperation({
    summary: '更新记忆',
    description: '更新指定记忆的内容和属性'
  })
  @ApiParam({ name: 'id', description: '记忆ID' })
  @ApiBody({ type: UpdateMemoryDto })
  @ApiResponse({
    status: 200,
    description: '更新成功'
  })
  @ApiResponse({ status: 400, description: '参数验证失败' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 403, description: '无权修改' })
  @ApiResponse({ status: 404, description: '记忆不存在' })
  @HttpCode(HttpStatus.OK)
  async updateMemory(
    @Request() req,
    @Param('id') id: string,
    @Body(ValidationPipe) dto: UpdateMemoryDto
  ) {
    return this.memoryService.updateMemory(req.user.id, id, dto);
  }

  @Delete('memories/:id')
  @ApiOperation({
    summary: '删除记忆',
    description: '删除指定的记忆条目'
  })
  @ApiParam({ name: 'id', description: '记忆ID' })
  @ApiResponse({
    status: 200,
    description: '删除成功'
  })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 403, description: '无权删除' })
  @ApiResponse({ status: 404, description: '记忆不存在' })
  @HttpCode(HttpStatus.OK)
  async deleteMemory(
    @Request() req,
    @Param('id') id: string
  ) {
    return this.memoryService.deleteMemory(req.user.id, id);
  }

  @Post('memories/extract')
  @ApiOperation({
    summary: '智能提取记忆',
    description: '从指定章节中自动提取核心记忆'
  })
  @ApiBody({ type: ExtractMemoriesDto })
  @ApiResponse({
    status: 201,
    description: '提取成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            extracted: { type: 'number', example: 5 },
            memories: {
              type: 'array',
              items: { type: 'object' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: '参数验证失败' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 404, description: '小说或章节不存在' })
  async extractMemories(
    @Request() req,
    @Body(ValidationPipe) dto: ExtractMemoriesDto
  ) {
    return this.memoryService.extractMemories(req.user.id, dto);
  }

  @Post('memories/:id/score')
  @ApiOperation({
    summary: '更新记忆重要性',
    description: '更新记忆的重要性评分'
  })
  @ApiParam({ name: 'id', description: '记忆ID' })
  @ApiBody({ type: ScoreMemoryDto })
  @ApiResponse({
    status: 200,
    description: '评分更新成功'
  })
  @ApiResponse({ status: 400, description: '参数验证失败' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 404, description: '记忆不存在' })
  @HttpCode(HttpStatus.OK)
  async updateImportance(
    @Request() req,
    @Param('id') id: string,
    @Body(ValidationPipe) dto: ScoreMemoryDto
  ) {
    return this.memoryService.updateImportance(req.user.id, id, dto.importance);
  }

  @Get('memories/novel/:novelId/search')
  @ApiOperation({
    summary: '搜索相关记忆',
    description: '根据关键词搜索相关记忆，按相关性排序'
  })
  @ApiParam({ name: 'novelId', description: '小说ID' })
  @ApiQuery({
    name: 'keywords',
    required: true,
    description: '搜索关键词（逗号分隔）',
    example: '主角,背景,设定'
  })
  @ApiResponse({
    status: 200,
    description: '搜索成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              content: { type: 'object' },
              importance: { type: 'number' },
              relevanceScore: { type: 'number', example: 15.6 }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 404, description: '小说不存在' })
  async searchMemories(
    @Request() req,
    @Param('novelId') novelId: string,
    @Query('keywords') keywords: string
  ) {
    const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k);
    return this.memoryService.searchMemories(req.user.id, novelId, keywordArray);
  }

  @Get('memories/novel/:novelId/stats')
  @ApiOperation({
    summary: '获取记忆统计',
    description: '获取小说记忆的统计信息'
  })
  @ApiParam({ name: 'novelId', description: '小说ID' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 42 },
            byType: {
              type: 'object',
              properties: {
                CORE: { type: 'number' },
                SUMMARY: { type: 'number' },
                CONTEXT: { type: 'number' }
              }
            },
            averageImportance: { type: 'number', example: 0.73 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 404, description: '小说不存在' })
  async getMemoryStats(
    @Request() req,
    @Param('novelId') novelId: string
  ) {
    return this.memoryService.getMemoryStats(req.user.id, novelId);
  }
}
