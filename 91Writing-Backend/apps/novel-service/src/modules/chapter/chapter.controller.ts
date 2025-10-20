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
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/common/guards';
import { ChapterService } from './chapter.service';
import { CreateChapterDto } from '../../dto/create-chapter.dto';
import { UpdateChapterWithConflictDto } from '../../dto/update-chapter-with-conflict.dto';
import { ChapterStatus } from '@prisma/client';

@ApiTags('chapters')
@ApiBearerAuth('JWT-auth')
@Controller('novels/:novelId/chapters')
@UseGuards(JwtAuthGuard)
export class ChapterController {
  constructor(private readonly chapterService: ChapterService) {}

  @Post()
  @ApiOperation({ 
    summary: '创建章节',
    description: '在指定小说中创建新的章节'
  })
  @ApiParam({ name: 'novelId', description: '小说ID' })
  @ApiResponse({
    status: 201,
    description: '章节创建成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'cm1234567890' },
            title: { type: 'string', example: '第一章：开端' },
            chapterNumber: { type: 'number', example: 1 },
            content: { type: 'string', example: '章节内容...' },
            wordCount: { type: 'number', example: 2500 },
            status: { type: 'string', enum: ['DRAFT', 'PUBLISHED'], example: 'DRAFT' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 404, description: '小说不存在' })
  async create(
    @Param('novelId') novelId: string,
    @Request() req,
    @Body(ValidationPipe) createChapterDto: CreateChapterDto,
  ) {
    return this.chapterService.create(novelId, req.user.id, createChapterDto);
  }

  @Get()
  @ApiOperation({ 
    summary: '获取章节列表',
    description: '获取指定小说的所有章节列表'
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
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              chapterNumber: { type: 'number' },
              wordCount: { type: 'number' },
              status: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }
  })
  async findAll(
    @Param('novelId') novelId: string,
    @Request() req,
  ) {
    return this.chapterService.findAll(novelId, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: '获取章节详情',
    description: '获取指定章节的详细信息'
  })
  @ApiParam({ name: 'novelId', description: '小说ID' })
  @ApiParam({ name: 'id', description: '章节ID' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
  })
  @ApiResponse({ status: 404, description: '章节不存在' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.chapterService.findOne(id, req.user.id);
  }

  @Get(':id/content')
  @ApiOperation({ 
    summary: '获取章节内容',
    description: '获取指定章节的完整内容'
  })
  @ApiParam({ name: 'novelId', description: '小说ID' })
  @ApiParam({ name: 'id', description: '章节ID' })
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
            content: { type: 'string', example: '章节完整内容...' },
            wordCount: { type: 'number' }
          }
        }
      }
    }
  })
  async getContent(@Param('id') id: string, @Request() req) {
    return this.chapterService.getContent(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: '更新章节信息',
    description: '更新章节的标题、状态等基本信息'
  })
  @ApiParam({ name: 'novelId', description: '小说ID' })
  @ApiParam({ name: 'id', description: '章节ID' })
  @ApiResponse({
    status: 200,
    description: '更新成功',
  })
  @ApiResponse({ status: 404, description: '章节不存在' })
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body(ValidationPipe) updateData: Partial<CreateChapterDto>,
  ) {
    return this.chapterService.update(id, req.user.id, updateData);
  }

  @Patch(':id/content')
  @ApiOperation({ 
    summary: '更新章节内容',
    description: '更新章节的正文内容，自动计算字数'
  })
  @ApiParam({ name: 'novelId', description: '小说ID' })
  @ApiParam({ name: 'id', description: '章节ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string', example: '更新后的章节内容...' }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: '内容更新成功',
  })
  async updateContent(
    @Param('id') id: string,
    @Request() req,
    @Body('content') content: string,
  ) {
    return this.chapterService.updateContent(id, req.user.id, content);
  }

  @Patch(':id/update-with-conflict-check')
  @ApiOperation({ 
    summary: '带冲突检测的章节更新',
    description: '更新章节时检测多设备数据冲突，支持冲突解决策略'
  })
  @ApiParam({ name: 'novelId', description: '小说ID' })
  @ApiParam({ name: 'id', description: '章节ID' })
  @ApiBody({ type: UpdateChapterWithConflictDto })
  @ApiResponse({
    status: 200,
    description: '更新成功或冲突已解决',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            resolved: { type: 'boolean', example: false, description: '是否解决了冲突' },
            strategy: { type: 'string', example: 'keep-client', description: '使用的冲突解决策略' },
            chapter: { 
              type: 'object',
              description: '更新后的章节' 
            },
            message: { type: 'string', example: '章节已更新' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: '检测到数据冲突',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        error: {
          type: 'object',
          properties: {
            hasConflict: { type: 'boolean', example: true },
            serverVersion: {
              type: 'object',
              properties: {
                updatedAt: { type: 'string', format: 'date-time' },
                title: { type: 'string' },
                content: { type: 'string' },
                wordCount: { type: 'number' }
              }
            },
            clientVersion: {
              type: 'object',
              properties: {
                updatedAt: { type: 'string', format: 'date-time' },
                title: { type: 'string' },
                content: { type: 'string' }
              }
            },
            message: { type: 'string', example: '检测到数据冲突' },
            suggestedActions: { 
              type: 'array', 
              items: { type: 'string' } 
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: '参数验证失败' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 404, description: '章节不存在' })
  @HttpCode(HttpStatus.OK)
  async updateWithConflictCheck(
    @Param('id') id: string,
    @Request() req,
    @Body(ValidationPipe) updateDto: UpdateChapterWithConflictDto,
  ) {
    return this.chapterService.updateWithConflictDetection(id, req.user.id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: '删除章节',
    description: '删除指定的章节'
  })
  @ApiParam({ name: 'novelId', description: '小说ID' })
  @ApiParam({ name: 'id', description: '章节ID' })
  @ApiResponse({
    status: 200,
    description: '删除成功',
  })
  @ApiResponse({ status: 404, description: '章节不存在' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.chapterService.remove(id, req.user.id);
  }

  @Patch('status')
  @ApiOperation({ 
    summary: '批量更新章节状态',
    description: '批量更新多个章节的状态'
  })
  @ApiParam({ name: 'novelId', description: '小说ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        chapterIds: { 
          type: 'array', 
          items: { type: 'string' },
          example: ['cm123', 'cm456']
        },
        status: { 
          type: 'string', 
          enum: ['DRAFT', 'PUBLISHED'],
          example: 'PUBLISHED'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: '状态更新成功',
  })
  async updateStatus(
    @Param('novelId') novelId: string,
    @Request() req,
    @Body() body: { chapterIds: string[]; status: ChapterStatus },
  ) {
    return this.chapterService.updateStatus(
      novelId,
      req.user.id,
      body.chapterIds,
      body.status,
    );
  }

  @Patch('reorder')
  @ApiOperation({ 
    summary: '重新排序章节',
    description: '调整章节的顺序编号'
  })
  @ApiParam({ name: 'novelId', description: '小说ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        chapterOrders: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'cm123' },
              chapterNumber: { type: 'number', example: 1 }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: '排序成功',
  })
  async reorder(
    @Param('novelId') novelId: string,
    @Request() req,
    @Body() body: { chapterOrders: Array<{ id: string; chapterNumber: number }> },
  ) {
    return this.chapterService.reorder(novelId, req.user.id, body.chapterOrders);
  }
}
