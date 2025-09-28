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
import { NovelService } from './novel.service';
import { CreateNovelDto } from '../../dto/create-novel.dto';
import { UpdateNovelDto } from '../../dto/update-novel.dto';
import { NovelStatus } from '@prisma/client';

@ApiTags('novels')
@ApiBearerAuth('JWT-auth')
@Controller('novels')
@UseGuards(JwtAuthGuard)
export class NovelController {
  constructor(private readonly novelService: NovelService) {}

  @ApiOperation({ 
    summary: '创建小说',
    description: '创建一个新的小说项目，支持设置标题、描述、类型、状态和复杂的世界观设置'
  })
  @ApiResponse({
    status: 201,
    description: '小说创建成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'cm1234567890' },
            title: { type: 'string', example: '魔法学院编年史' },
            description: { type: 'string' },
            genre: { type: 'string', example: '奇幻' },
            status: { type: 'string', enum: ['DRAFT', 'WRITING', 'COMPLETED', 'PUBLISHED'] },
            wordCount: { type: 'number', example: 0 },
            chapterCount: { type: 'number', example: 0 },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                username: { type: 'string' },
                email: { type: 'string' }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: '请求参数错误',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        error: {
          type: 'object',
          properties: {
            code: { type: 'string', example: 'VALIDATION_ERROR' },
            message: { type: 'string', example: '参数验证失败' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: '未授权访问'
  })
  @Post()
  async create(
    @Request() req,
    @Body(ValidationPipe) createNovelDto: CreateNovelDto,
  ) {
    return this.novelService.create(req.user.id, createNovelDto);
  }

  @ApiOperation({
    summary: '获取小说列表',
    description: '获取当前用户的所有小说，支持按状态、类型筛选和分页'
  })
  @ApiQuery({ name: 'status', required: false, enum: NovelStatus, description: '按状态筛选' })
  @ApiQuery({ name: 'genre', required: false, type: String, description: '按类型筛选' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '页码，默认1' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '每页数量，默认20' })
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
            novels: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  genre: { type: 'string' },
                  status: { type: 'string' },
                  wordCount: { type: 'number' },
                  chapterCount: { type: 'number' },
                  updatedAt: { type: 'string', format: 'date-time' }
                }
              }
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number' },
                limit: { type: 'number' },
                total: { type: 'number' },
                totalPages: { type: 'number' }
              }
            }
          }
        }
      }
    }
  })
  @Get()
  async findAll(
    @Request() req,
    @Query('status') status?: NovelStatus,
    @Query('genre') genre?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const options = {
      status,
      genre,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    };
    
    return this.novelService.findAll(req.user.id, options);
  }

  @ApiOperation({
    summary: '获取小说详情',
    description: '获取指定小说的详细信息，包括章节列表和记忆数据'
  })
  @ApiParam({ name: 'id', description: '小说ID' })
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
            id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            settings: { type: 'object' },
            chapters: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  chapterNumber: { type: 'number' },
                  wordCount: { type: 'number' },
                  status: { type: 'string' }
                }
              }
            },
            memories: {
              type: 'array',
              description: '前10个最重要的记忆'
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: '小说不存在或无权访问' })
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.novelService.findOne(id, req.user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body(ValidationPipe) updateNovelDto: UpdateNovelDto,
  ) {
    return this.novelService.update(id, req.user.id, updateNovelDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.novelService.remove(id, req.user.id);
  }

  @Post(':id/stats/update')
  async updateStats(@Param('id') id: string, @Request() req) {
    return this.novelService.updateStats(id, req.user.id);
  }

  @Get(':id/settings')
  async getSettings(@Param('id') id: string, @Request() req) {
    return this.novelService.getSettings(id, req.user.id);
  }

  @Patch(':id/settings')
  async updateSettings(
    @Param('id') id: string,
    @Request() req,
    @Body() settings: any,
  ) {
    return this.novelService.updateSettings(id, req.user.id, settings);
  }
}
