import { Controller, Post, Get, Body, Param, UseGuards, Req, HttpCode, HttpStatus, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard, PackageFeatureGuard, RequireFeature, RequireQuota } from '@app/common';
import { BatchVideoGenerationService } from '../../services/batch-video-generation.service';
import { LongVideoMergerService } from '../../services/long-video-merger.service';
import { 
  BatchGenerateByChaptersDto,
  SmartGenerateVideoDto,
  MergeBatchVideosDto,
} from '../../dto/batch-video-generation.dto';

/**
 * 批量视频生成控制器
 */
@ApiTags('批量视频生成')
@Controller('batch')
@UseGuards(JwtAuthGuard, PackageFeatureGuard)
@ApiBearerAuth('JWT-auth')
export class BatchVideoGenerationController {
  constructor(
    private readonly batchVideoService: BatchVideoGenerationService,
    private readonly videoMergerService: LongVideoMergerService,
  ) {}

  /**
   * 模式1：批量生成指定章节的视频
   */
  @Post('generate-by-chapters')
  @RequireFeature('videoGeneration')
  @RequireQuota('daily')
  @ApiOperation({ 
    summary: '批量生成指定章节的视频',
    description: '用户手动选择多个章节，系统批量生成视频并可选合并为长视频'
  })
  @ApiResponse({ 
    status: 200, 
    description: '批量任务已提交',
    schema: {
      example: {
        batchId: 'batch-xxx',
        totalChapters: 3,
        estimatedDuration: 45,
        estimatedScenes: 15,
        jobs: [
          { chapterId: 'ch-1', jobId: 'job-1' },
          { chapterId: 'ch-2', jobId: 'job-2' },
          { chapterId: 'ch-3', jobId: 'job-3' }
        ],
        message: '已提交3个章节的视频生成任务，预计总时长0.8分钟'
      }
    }
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 403, description: '无权限或配额不足' })
  @ApiResponse({ status: 404, description: '章节不存在' })
  async batchGenerateByChapters(
    @Req() req: any,
    @Body(ValidationPipe) dto: BatchGenerateByChaptersDto,
  ) {
    const userId = req.user.userId || req.user.id;
    
    return this.batchVideoService.batchGenerateByChapters(
      userId,
      dto.novelId,
      dto.chapterIds,
      dto.options,
    );
  }

  /**
   * 模式2：AI智能规划生成指定时长的视频
   */
  @Post('smart-generate')
  @RequireFeature('videoGeneration')
  @RequireQuota('daily')
  @ApiOperation({ 
    summary: 'AI智能规划生成目标时长视频',
    description: 'AI自动计算需要多少章节才能生成指定时长（如5-10分钟）的视频'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'AI规划任务已提交',
    schema: {
      example: {
        batchId: 'batch-xxx',
        recommendedChapters: [1, 2, 3, 4, 5],
        totalChapters: 5,
        estimatedDuration: 600,
        estimatedScenes: 25,
        breakdown: [
          {
            chapterNumber: 1,
            chapterTitle: '第一章 开端',
            wordCount: 2000,
            estimatedScenes: 5,
            estimatedDuration: 120,
            aiReasoning: '包含2个重要场景转换和1个对话场景'
          }
        ],
        reasoning: '根据智能分析，推荐使用第1-5章（共5章）生成视频...',
        jobs: []
      }
    }
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 403, description: '无权限或配额不足' })
  @ApiResponse({ status: 404, description: '章节不存在' })
  async smartGenerate(
    @Req() req: any,
    @Body(ValidationPipe) dto: SmartGenerateVideoDto,
  ) {
    const userId = req.user.userId || req.user.id;
    
    return this.batchVideoService.smartGenerateForTargetDuration(
      userId,
      dto.novelId,
      dto.startChapter,
      dto.targetDuration,
      dto.options,
    );
  }

  /**
   * 查询批量生成状态
   */
  @Get('status/:batchId')
  @ApiOperation({ summary: '查询批量生成状态' })
  @ApiParam({ name: 'batchId', description: '批次ID', example: 'batch-xxx' })
  @ApiResponse({ 
    status: 200, 
    description: '返回批量生成状态',
    schema: {
      example: {
        batchId: 'batch-xxx',
        status: 'PROCESSING',
        totalChapters: 5,
        completedChapters: 3,
        failedChapters: 0,
        processingChapters: 2,
        progress: 60,
        estimatedDuration: 600,
        actualDuration: 580,
        chapters: [
          {
            chapterId: 'ch-1',
            chapterNumber: 1,
            status: 'COMPLETED',
            videoUrl: 'https://cdn.example.com/ch-1.mp4'
          }
        ],
        mergedVideoUrl: 'https://cdn.example.com/merged-video.mp4'
      }
    }
  })
  @ApiResponse({ status: 404, description: '批次不存在' })
  async getBatchStatus(@Param('batchId') batchId: string) {
    return this.batchVideoService.getBatchStatus(batchId);
  }

  /**
   * 取消批量生成
   */
  @Post('cancel/:batchId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '取消批量生成任务' })
  @ApiParam({ name: 'batchId', description: '批次ID', example: 'batch-xxx' })
  @ApiResponse({ 
    status: 200, 
    description: '任务已取消',
    schema: {
      example: {
        message: '已取消批量任务，共取消3个待处理任务'
      }
    }
  })
  @ApiResponse({ status: 404, description: '批次不存在' })
  async cancelBatch(@Param('batchId') batchId: string) {
    return this.batchVideoService.cancelBatch(batchId);
  }

  /**
   * 合并视频为长视频
   */
  @Post('merge/:batchId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '合并批量生成的视频为一个长视频',
    description: '将多个章节的短视频合并为一个完整的长视频，可添加片头片尾和章节标题'
  })
  @ApiParam({ name: 'batchId', description: '批次ID', example: 'batch-xxx' })
  @ApiResponse({ 
    status: 200, 
    description: '视频合并成功',
    schema: {
      example: {
        mergedVideoUrl: 'https://cdn.example.com/merged-final.mp4',
        totalDuration: 620,
        fileSize: 125000000,
        resolution: '1920x1080',
        chapterCount: 5
      }
    }
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '批次不存在' })
  async mergeBatchVideos(
    @Param('batchId') batchId: string,
    @Body(ValidationPipe) dto: MergeBatchVideosDto,
  ) {
    return this.videoMergerService.mergeBatchVideos(batchId, dto.options);
  }

  /**
   * 查询长视频合成状态
   */
  @Get('merge/status/:batchId')
  @ApiOperation({ summary: '查询长视频合成状态' })
  @ApiParam({ name: 'batchId', description: '批次ID', example: 'batch-xxx' })
  @ApiResponse({ 
    status: 200, 
    description: '返回合成状态',
    schema: {
      example: {
        status: 'COMPLETED',
        progress: 100,
        mergedVideoUrl: 'https://cdn.example.com/merged-final.mp4'
      }
    }
  })
  @ApiResponse({ status: 404, description: '批次不存在' })
  async getMergeStatus(@Param('batchId') batchId: string) {
    return this.videoMergerService.getMergeStatus(batchId);
  }
}

