import { Controller, Post, Get, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, PackageFeatureGuard, RequireFeature, RequireQuota } from '@app/common';
import { VideoGenerationService } from './video-generation.service';
import { GenerateVideoDto, VideoGenerationStatusDto } from '../../dto/video-generation.dto';

@ApiTags('视频生成')
@Controller()
@UseGuards(JwtAuthGuard, PackageFeatureGuard)
@ApiBearerAuth('JWT-auth')
export class VideoGenerationController {
  constructor(private readonly videoGenerationService: VideoGenerationService) {}

  @Post('generate')
  @RequireFeature('videoGeneration')
  @RequireQuota('daily')
  @ApiOperation({ summary: '生成章节视频' })
  @ApiResponse({ status: 200, description: '视频生成任务已提交', type: VideoGenerationStatusDto })
  @ApiResponse({ status: 403, description: '无权限或配额不足' })
  @ApiResponse({ status: 404, description: '章节不存在' })
  async generateVideo(
    @Req() req: any,
    @Body() dto: GenerateVideoDto,
  ): Promise<VideoGenerationStatusDto> {
    const userId = req.user.userId || req.user.id;
    return this.videoGenerationService.generateChapterVideo(userId, dto);
  }

  @Get('permissions')
  @ApiOperation({ summary: '获取当前用户的视频生成权限' })
  @ApiResponse({ status: 200, description: '返回权限信息' })
  async getPermissions(@Req() req: any) {
    const userId = req.user.userId || req.user.id;
    
    // 获取套餐权限
    const subscription = await this.videoGenerationService['prisma'].subscription.findUnique({
      where: { userId },
      include: { package: true },
    });

    if (!subscription || subscription.status !== 'ACTIVE') {
      return {
        allowed: false,
        limits: {
          dailyQuota: 0,
          monthlyQuota: 0,
          maxSceneCount: 0,
          allowedQualities: [],
          allowedResolutions: [],
          enableAdvancedParams: false
        },
        message: '请订阅套餐以使用视频生成功能'
      };
    }

    const features = subscription.package.features as any;
    const videoFeatures = features?.videoGeneration;

    if (!videoFeatures || !videoFeatures.enabled) {
      return {
        allowed: false,
        limits: {},
        message: '当前套餐不包含视频生成功能'
      };
    }

    return {
      allowed: true,
      limits: videoFeatures,
      packageName: subscription.package.name
    };
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

