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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VersionService } from './version.service';
import {
  CreateVersionDto,
  CompareVersionsDto,
  RestoreVersionDto,
} from '../../dto/version.dto';
import { JwtAuthGuard } from '@app/common';

@ApiTags('Version Control')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('versions')
export class VersionController {
  constructor(private readonly versionService: VersionService) {}

  @Post()
  @ApiOperation({ summary: '创建章节版本快照' })
  async createVersion(@Body() dto: CreateVersionDto) {
    return this.versionService.createVersion(dto);
  }

  @Get('chapter/:chapterId/history')
  @ApiOperation({ summary: '获取章节版本历史' })
  async getChapterVersionHistory(
    @Param('chapterId') chapterId: string,
    @Query('limit') limit?: number,
  ) {
    return this.versionService.getChapterVersionHistory(
      chapterId,
      limit ? parseInt(limit.toString()) : 50,
    );
  }

  @Get('chapter/:chapterId/version/:versionNumber')
  @ApiOperation({ summary: '获取特定版本' })
  async getVersion(
    @Param('chapterId') chapterId: string,
    @Param('versionNumber') versionNumber: string,
  ) {
    return this.versionService.getVersion(
      chapterId,
      parseInt(versionNumber),
    );
  }

  @Post('compare')
  @ApiOperation({ summary: '对比两个版本' })
  async compareVersions(@Body() dto: CompareVersionsDto) {
    return this.versionService.compareVersions(dto);
  }

  @Post('restore')
  @ApiOperation({ summary: '回滚到指定版本' })
  async restoreVersion(@Body() dto: RestoreVersionDto) {
    return this.versionService.restoreVersion(dto);
  }

  @Delete('chapter/:chapterId/cleanup')
  @ApiOperation({ summary: '清理旧版本' })
  async cleanupOldVersions(
    @Param('chapterId') chapterId: string,
    @Query('keepCount') keepCount?: number,
  ) {
    return this.versionService.cleanupOldVersions(
      chapterId,
      keepCount ? parseInt(keepCount.toString()) : 100,
    );
  }

  @Get('chapter/:chapterId/stats')
  @ApiOperation({ summary: '获取版本统计信息' })
  async getVersionStats(@Param('chapterId') chapterId: string) {
    return this.versionService.getVersionStats(chapterId);
  }
}
