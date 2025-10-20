import { Controller, Post, Get, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/auth';
import { VideoGenerationService } from './video-generation.service';
import { GenerateVideoDto, VideoGenerationStatusDto } from '../../dto/video-generation.dto';

@ApiTags('视频生成')
@Controller('video-generation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VideoGenerationController {
  constructor(private readonly videoGenerationService: VideoGenerationService) {}

  @Post('generate')
  @ApiOperation({ summary: '生成章节视频' })
  @ApiResponse({ status: 200, description: '视频生成任务已提交', type: VideoGenerationStatusDto })
  @ApiResponse({ status: 404, description: '章节不存在' })
  async generateVideo(
    @Req() req: any,
    @Body() dto: GenerateVideoDto,
  ): Promise<VideoGenerationStatusDto> {
    const userId = req.user.userId;
    return this.videoGenerationService.generateChapterVideo(userId, dto);
  }

  @Get('status/:chapterId')
  @ApiOperation({ summary: '查询视频生成状态' })
  @ApiResponse({ status: 200, description: '返回生成状态', type: VideoGenerationStatusDto })
  @ApiResponse({ status: 404, description: '章节不存在' })
  async getStatus(
    @Param('chapterId') chapterId: string,
  ): Promise<VideoGenerationStatusDto> {
    return this.videoGenerationService.getVideoGenerationStatus(chapterId);
  }
}

