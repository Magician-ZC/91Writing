import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CollaborationService } from './collaboration.service';
import {
  CreateCollaborationDto,
  UpdateCollaborationDto,
  LockChapterDto,
  UnlockChapterDto,
  EditEventDto,
} from '../../dto/collaboration.dto';
import { JwtAuthGuard } from '@app/common';

@ApiTags('Collaboration')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('collaboration')
export class CollaborationController {
  constructor(private readonly collaborationService: CollaborationService) {}

  @Post()
  @ApiOperation({ summary: '创建协作邀请' })
  async createCollaboration(@Body() dto: CreateCollaborationDto) {
    return this.collaborationService.createCollaboration(dto);
  }

  @Get('novel/:novelId')
  @ApiOperation({ summary: '获取小说的协作者列表' })
  async getCollaborators(@Param('novelId') novelId: string) {
    return this.collaborationService.getCollaborators(novelId);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新协作状态' })
  async updateCollaboration(
    @Param('id') id: string,
    @Body() dto: UpdateCollaborationDto,
  ) {
    return this.collaborationService.updateCollaboration(id, dto);
  }

  @Post(':id/accept')
  @ApiOperation({ summary: '接受协作邀请' })
  async acceptCollaboration(@Param('id') id: string, @Request() req) {
    return this.collaborationService.acceptCollaboration(id, req.user.userId);
  }

  @Post(':id/revoke')
  @ApiOperation({ summary: '撤销协作' })
  async revokeCollaboration(@Param('id') id: string, @Request() req) {
    return this.collaborationService.revokeCollaboration(id, req.user.userId);
  }

  @Get('novel/:novelId/permission/:userId')
  @ApiOperation({ summary: '检查用户协作权限' })
  async checkPermission(
    @Param('novelId') novelId: string,
    @Param('userId') userId: string,
    @Query('role') role?: string,
  ) {
    const hasPermission =
      await this.collaborationService.checkCollaborationPermission(
        novelId,
        userId,
        role as any,
      );
    return { hasPermission };
  }

  @Post('chapter/lock')
  @ApiOperation({ summary: '锁定章节（开始编辑）' })
  async lockChapter(@Body() dto: LockChapterDto) {
    return this.collaborationService.lockChapter(dto);
  }

  @Post('chapter/unlock')
  @ApiOperation({ summary: '解锁章节（结束编辑）' })
  async unlockChapter(@Body() dto: UnlockChapterDto) {
    return this.collaborationService.unlockChapter(dto);
  }

  @Get('chapter/:chapterId/lock-status')
  @ApiOperation({ summary: '获取章节锁定状态' })
  async getChapterLockStatus(@Param('chapterId') chapterId: string) {
    return this.collaborationService.getChapterLockStatus(chapterId);
  }

  @Post('edit-event')
  @ApiOperation({ summary: '记录编辑事件' })
  async recordEditEvent(@Body() dto: EditEventDto) {
    return this.collaborationService.recordEditEvent(dto);
  }

  @Get('chapter/:chapterId/edit-history')
  @ApiOperation({ summary: '获取章节编辑历史' })
  async getChapterEditHistory(
    @Param('chapterId') chapterId: string,
    @Query('limit') limit?: number,
    @Query('after') after?: string,
  ) {
    return this.collaborationService.getChapterEditHistory(
      chapterId,
      limit ? parseInt(limit.toString()) : 50,
      after ? new Date(after) : undefined,
    );
  }
}
