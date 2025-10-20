import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Delete,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { VersionService } from './version.service';
import {
  CreateVersionDto,
  CompareVersionsDto,
  RestoreVersionDto,
} from '../../dto/version.dto';
import { JwtAuthGuard } from '@app/common';

@ApiTags('章节版本控制')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller()  // ⚠️ 微服务不使用路径前缀
export class VersionController {
  constructor(private readonly versionService: VersionService) {}

  @Post('versions')
  @ApiOperation({ 
    summary: '创建章节版本快照',
    description: '为章节创建一个版本快照，用于后续回滚或对比'
  })
  @ApiBody({ type: CreateVersionDto })
  @ApiResponse({ 
    status: 201, 
    description: '版本创建成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'cm1234567890' },
            versionNumber: { type: 'number', example: 1 },
            title: { type: 'string', example: '第一章：开端' },
            wordCount: { type: 'number', example: 2500 },
            changeLog: { type: 'string', example: '修改了角色对话' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: '参数验证失败' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 404, description: '章节不存在' })
  async createVersion(
    @Request() req,
    @Body(ValidationPipe) dto: CreateVersionDto
  ) {
    // 从JWT获取userId，覆盖DTO中的userId
    dto.userId = req.user.id;
    return this.versionService.createVersion(dto);
  }

  @Get('versions/chapter/:chapterId/history')
  @ApiOperation({ 
    summary: '获取章节版本历史',
    description: '获取指定章节的所有版本历史记录'
  })
  @ApiParam({ name: 'chapterId', description: '章节ID' })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: '限制返回的版本数量',
    example: 50
  })
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
              versionNumber: { type: 'number' },
              title: { type: 'string' },
              wordCount: { type: 'number' },
              changeLog: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  profile: {
                    type: 'object',
                    properties: {
                      nickname: { type: 'string' },
                      avatar: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: '未授权访问' })
  async getChapterVersionHistory(
    @Param('chapterId') chapterId: string,
    @Query('limit') limit?: number,
    @Request() req?,
  ) {
    return this.versionService.getChapterVersionHistory(
      chapterId,
      limit ? parseInt(limit.toString()) : 50,
    );
  }

  @Get('versions/chapter/:chapterId/version/:versionNumber')
  @ApiOperation({ 
    summary: '获取特定版本',
    description: '获取指定版本号的完整版本内容'
  })
  @ApiParam({ name: 'chapterId', description: '章节ID' })
  @ApiParam({ name: 'versionNumber', description: '版本号' })
  @ApiResponse({ 
    status: 200, 
    description: '获取成功'
  })
  @ApiResponse({ status: 404, description: '版本不存在' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  async getVersion(
    @Param('chapterId') chapterId: string,
    @Param('versionNumber') versionNumber: string,
    @Request() req,
  ) {
    return this.versionService.getVersion(
      chapterId,
      parseInt(versionNumber),
    );
  }

  @Post('versions/compare')
  @ApiOperation({ 
    summary: '对比两个版本',
    description: '对比两个版本之间的差异，包括内容、字数等'
  })
  @ApiBody({ type: CompareVersionsDto })
  @ApiResponse({ 
    status: 200, 
    description: '对比成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            version1: { 
              type: 'object',
              properties: {
                versionNumber: { type: 'number' },
                title: { type: 'string' },
                wordCount: { type: 'number' },
                createdAt: { type: 'string', format: 'date-time' }
              }
            },
            version2: { 
              type: 'object',
              properties: {
                versionNumber: { type: 'number' },
                title: { type: 'string' },
                wordCount: { type: 'number' },
                createdAt: { type: 'string', format: 'date-time' }
              }
            },
            diff: {
              type: 'object',
              properties: {
                wordCountDiff: { type: 'number', example: 500 },
                contentLengthDiff: { type: 'number', example: 1500 },
                titleChanged: { type: 'boolean', example: false }
              }
            },
            content1: { type: 'string' },
            content2: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: '参数验证失败' })
  @ApiResponse({ status: 404, description: '版本不存在' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @HttpCode(HttpStatus.OK)
  async compareVersions(
    @Request() req,
    @Body(ValidationPipe) dto: CompareVersionsDto
  ) {
    return this.versionService.compareVersions(dto);
  }

  @Post('versions/restore')
  @ApiOperation({ 
    summary: '回滚到指定版本',
    description: '将章节内容回滚到指定的历史版本，并创建新的版本记录'
  })
  @ApiBody({ type: RestoreVersionDto })
  @ApiResponse({ 
    status: 200, 
    description: '回滚成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            chapter: { 
              type: 'object',
              description: '更新后的章节' 
            },
            newVersion: { 
              type: 'object',
              description: '回滚操作创建的新版本' 
            },
            restoredFrom: { 
              type: 'object',
              description: '回滚的源版本' 
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: '参数验证失败' })
  @ApiResponse({ status: 404, description: '版本不存在' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @HttpCode(HttpStatus.OK)
  async restoreVersion(
    @Request() req,
    @Body(ValidationPipe) dto: RestoreVersionDto
  ) {
    // 从JWT获取userId
    dto.userId = req.user.id;
    return this.versionService.restoreVersion(dto);
  }

  @Delete('versions/chapter/:chapterId/cleanup')
  @ApiOperation({ 
    summary: '清理旧版本',
    description: '清理章节的旧版本记录，保留指定数量的最新版本'
  })
  @ApiParam({ name: 'chapterId', description: '章节ID' })
  @ApiQuery({ 
    name: 'keepCount', 
    required: false, 
    type: Number,
    description: '保留的版本数量',
    example: 100
  })
  @ApiResponse({ 
    status: 200, 
    description: '清理成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            deleted: { type: 'number', example: 10 },
            message: { type: 'string', example: '清理了 10 个旧版本' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @HttpCode(HttpStatus.OK)  // ⚠️ DELETE必须添加HttpCode
  async cleanupOldVersions(
    @Param('chapterId') chapterId: string,
    @Query('keepCount') keepCount?: number,
    @Request() req?,
  ) {
    return this.versionService.cleanupOldVersions(
      chapterId,
      keepCount ? parseInt(keepCount.toString()) : 100,
    );
  }

  @Get('versions/chapter/:chapterId/stats')
  @ApiOperation({ 
    summary: '获取版本统计信息',
    description: '获取章节的版本数量、字数变化等统计信息'
  })
  @ApiParam({ name: 'chapterId', description: '章节ID' })
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
            totalVersions: { type: 'number', example: 15 },
            firstVersion: {
              type: 'object',
              properties: {
                versionNumber: { type: 'number', example: 1 },
                createdAt: { type: 'string', format: 'date-time' },
                wordCount: { type: 'number', example: 2000 }
              }
            },
            latestVersion: {
              type: 'object',
              properties: {
                versionNumber: { type: 'number', example: 15 },
                createdAt: { type: 'string', format: 'date-time' },
                wordCount: { type: 'number', example: 2500 }
              }
            },
            totalWordCountChange: { type: 'number', example: 500 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: '未授权访问' })
  async getVersionStats(
    @Param('chapterId') chapterId: string,
    @Request() req,
  ) {
    return this.versionService.getVersionStats(chapterId);
  }
}
