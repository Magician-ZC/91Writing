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
import { CommentService } from './comment.service';
import {
  CreateCommentDto,
  UpdateCommentDto,
  QueryCommentsDto,
  CommentStatusEnum,
} from '../../dto/comment.dto';
import { JwtAuthGuard } from '@app/common';

@ApiTags('Comments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @ApiOperation({ summary: '创建评论' })
  async createComment(@Body() dto: CreateCommentDto, @Request() req) {
    dto.userId = req.user.userId;
    return this.commentService.createComment(dto);
  }

  @Get('chapter/:chapterId')
  @ApiOperation({ summary: '获取章节评论列表' })
  async getChapterComments(
    @Param('chapterId') chapterId: string,
    @Query('status') status?: CommentStatusEnum,
    @Query('userId') userId?: string,
  ) {
    return this.commentService.getChapterComments({
      chapterId,
      status,
      userId,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个评论' })
  async getComment(@Param('id') id: string) {
    return this.commentService.getComment(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新评论' })
  async updateComment(
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
    @Request() req,
  ) {
    return this.commentService.updateComment(id, req.user.userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除评论' })
  async deleteComment(@Param('id') id: string, @Request() req) {
    return this.commentService.deleteComment(id, req.user.userId);
  }

  @Post(':id/resolve')
  @ApiOperation({ summary: '解决评论' })
  async resolveComment(@Param('id') id: string, @Request() req) {
    return this.commentService.resolveComment(id, req.user.userId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: '获取用户的评论列表' })
  async getUserComments(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.commentService.getUserComments(
      userId,
      limit ? parseInt(limit.toString()) : 50,
    );
  }

  @Get('chapter/:chapterId/stats')
  @ApiOperation({ summary: '获取评论统计' })
  async getCommentStats(@Param('chapterId') chapterId: string) {
    return this.commentService.getCommentStats(chapterId);
  }
}
