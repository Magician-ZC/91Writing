import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { StoryboardAgentService } from '../../services/storyboard-agent.service';
import { ImageGenerationAgentService } from '../../services/image-generation-agent.service';
import { VideoGenerationAgentService } from '../../services/video-generation-agent.service';
import { VolcengineVisualProvider } from '../../providers/volcengine-visual.provider';
import { JimengVideoProvider } from '../../providers/jimeng-video.provider';
import { KlingVideoProvider } from '../../providers/kling-video.provider';
import { FFmpegService } from '../../services/ffmpeg.service';
import { GenerateVideoDto, VideoGenerationStatusDto, VideoGenerationResultDto } from '../../dto/video-generation.dto';
import * as path from 'path';
import * as fs from 'fs';

/**
 * 视频生成主控服务
 * 
 * 负责协调整个视频生成流程：
 * 1. 分镜脚本生成
 * 2. 图片生成
 * 3. 视频生成
 * 4. 视频合成
 */
@Injectable()
export class VideoGenerationService {
  private readonly logger = new Logger(VideoGenerationService.name);
  private readonly videoStoragePath: string;
  private readonly videoProvider: 'jimeng' | 'kling';

  constructor(
    private readonly prisma: PrismaService,
    private readonly storyboardAgent: StoryboardAgentService,
    private readonly imageAgent: ImageGenerationAgentService,
    private readonly videoAgent: VideoGenerationAgentService,
    private readonly volcengineProvider: VolcengineVisualProvider,
    private readonly jimengProvider: JimengVideoProvider,
    private readonly klingProvider: KlingVideoProvider,
    private readonly ffmpegService: FFmpegService,
  ) {
    this.videoStoragePath = process.env.VIDEO_STORAGE_PATH || '/data/videos';
    this.videoProvider = (process.env.VIDEO_PROVIDER as any) || 'jimeng';

    // 确保存储目录存在
    if (!fs.existsSync(this.videoStoragePath)) {
      fs.mkdirSync(this.videoStoragePath, { recursive: true });
    }
  }

  /**
   * 生成章节视频（主流程）
   */
  async generateChapterVideo(
    userId: string,
    dto: GenerateVideoDto,
  ): Promise<VideoGenerationStatusDto> {
    this.logger.log(`开始生成章节视频，章节ID: ${dto.chapterId}`);

    // 1. 验证章节权限
    const chapter = await this.prisma.chapter.findFirst({
      where: { id: dto.chapterId },
      include: {
        novel: {
          select: {
            id: true,
            userId: true,
            title: true,
          },
        },
      },
    });

    if (!chapter) {
      throw new NotFoundException('章节不存在');
    }

    if (chapter.novel.userId !== userId) {
      throw new NotFoundException('无权访问该章节');
    }

    // 2. 检查是否已有视频（非强制重新生成）
    if (!dto.forceRegenerate && chapter.videoStatus === 'COMPLETED' && chapter.videoUrl) {
      return {
        chapterId: dto.chapterId,
        status: 'COMPLETED',
        stage: 'COMPLETED',
        progress: 100,
        videoUrl: chapter.videoUrl,
      };
    }

    // 3. 更新章节状态为生成中
    await this.prisma.chapter.update({
      where: { id: dto.chapterId },
      data: {
        videoStatus: 'GENERATING',
        storyboardScript: null,
        generatedImages: null,
        videoUrl: null,
      },
    });

    // 4. 创建生成日志
    const log = await this.prisma.videoGenerationLog.create({
      data: {
        chapterId: dto.chapterId,
        stage: 'SCRIPT',
        status: 'PROCESSING',
        startedAt: new Date(),
        progress: 0,
      },
    });

    // 5. 异步执行生成流程
    this.executeGenerationPipeline(
      chapter,
      dto,
      log.id,
    ).catch(error => {
      this.logger.error(`视频生成失败: ${error.message}`, error.stack);
    });

    // 6. 返回初始状态
    return {
      chapterId: dto.chapterId,
      status: 'GENERATING',
      stage: 'SCRIPT',
      progress: 0,
      startedAt: new Date(),
    };
  }

  /**
   * 执行生成流程
   */
  private async executeGenerationPipeline(
    chapter: any,
    dto: GenerateVideoDto,
    logId: string,
  ): Promise<void> {
    const startTime = Date.now();

    try {
      // ===== 阶段1: 分镜脚本生成 =====
      this.logger.log(`[阶段1] 开始生成分镜脚本`);
      await this.updateLog(logId, 'SCRIPT', 'PROCESSING', 10);

      const consistencyProfile = await this.getConsistencyProfile(chapter.novel.id);
      
      const storyboard = await this.storyboardAgent.generateStoryboard(
        chapter.id,
        consistencyProfile,
        {
          sceneCount: dto.sceneCount || 5,
          totalDuration: dto.videoDuration || 15,
        },
      );

      // 保存分镜脚本
      await this.prisma.chapter.update({
        where: { id: chapter.id },
        data: { storyboardScript: storyboard as any },
      });

      await this.updateLog(logId, 'SCRIPT', 'COMPLETED', 20, {
        sceneCount: storyboard.scenes.length,
      });

      // ===== 阶段2: 图片生成 =====
      this.logger.log(`[阶段2] 开始生成图片`);
      await this.updateLog(logId, 'IMAGE', 'PROCESSING', 30);

      const imagePrompts = await this.imageAgent.generateImagePromptBatch(
        storyboard.scenes,
        consistencyProfile,
        chapter.chapterNumber,
      );

      const imageUrls: string[] = [];
      for (let i = 0; i < imagePrompts.length; i++) {
        const prompt = imagePrompts[i];
        const result = await this.volcengineProvider.generateImage({
          prompt: prompt.positivePrompt,
          negativePrompt: prompt.negativePrompt,
          width: 1024,
          height: 576,
          seed: prompt.seed,
          referenceImage: prompt.referenceImageUrl,
        });

        if (result.success && result.images.length > 0) {
          // 下载图片到本地
          const imagePath = path.join(
            this.videoStoragePath,
            `${chapter.id}-scene-${i + 1}.png`,
          );
          await this.volcengineProvider.downloadImage(result.images[0], imagePath);
          imageUrls.push(imagePath);
        } else {
          throw new Error(`场景${i + 1}图片生成失败: ${result.error}`);
        }

        // 更新进度
        const progress = 30 + Math.floor((i + 1) / imagePrompts.length * 30);
        await this.updateLog(logId, 'IMAGE', 'PROCESSING', progress);
      }

      // 保存生成的图片URL
      await this.prisma.chapter.update({
        where: { id: chapter.id },
        data: { generatedImages: imageUrls as any },
      });

      await this.updateLog(logId, 'IMAGE', 'COMPLETED', 60, {
        imageCount: imageUrls.length,
      });

      // ===== 阶段3: 视频生成 =====
      this.logger.log(`[阶段3] 开始生成视频`);
      await this.updateLog(logId, 'VIDEO', 'PROCESSING', 65);

      const videoPrompts = await this.videoAgent.generateVideoPromptBatch(
        storyboard.scenes,
        imageUrls,
        consistencyProfile,
      );

      const videoUrls: string[] = [];
      const videoProvider = this.videoProvider === 'jimeng' 
        ? this.jimengProvider 
        : this.klingProvider;

      for (let i = 0; i < videoPrompts.length; i++) {
        const prompt = videoPrompts[i];
        const submitResult = await videoProvider.submitVideoTask({
          imageUrl: imageUrls[i],
          motionPrompt: prompt.motionPrompt,
          duration: prompt.duration,
          motionIntensity: prompt.motionIntensity,
          fps: 24,
          characterId: prompt.characterConsistencyId,
        });

        if (!submitResult.success || !submitResult.taskId) {
          throw new Error(`场景${i + 1}视频任务提交失败`);
        }

        // 等待视频生成完成
        const videoResult = await videoProvider.waitForTaskCompletion(submitResult.taskId, 600000);

        if (!videoResult.success || !videoResult.videoUrl) {
          throw new Error(`场景${i + 1}视频生成失败`);
        }

        // 下载视频到本地
        const videoPath = path.join(
          this.videoStoragePath,
          `${chapter.id}-scene-${i + 1}.mp4`,
        );
        await (videoProvider as any).downloadVideo(videoResult.videoUrl, videoPath);
        videoUrls.push(videoPath);

        // 更新进度
        const progress = 65 + Math.floor((i + 1) / videoPrompts.length * 20);
        await this.updateLog(logId, 'VIDEO', 'PROCESSING', progress);
      }

      await this.updateLog(logId, 'VIDEO', 'COMPLETED', 85, {
        videoCount: videoUrls.length,
      });

      // ===== 阶段4: 视频合成 =====
      this.logger.log(`[阶段4] 开始合成视频`);
      await this.updateLog(logId, 'MERGE', 'PROCESSING', 90);

      const finalVideoPath = path.join(
        this.videoStoragePath,
        `${chapter.id}-final.mp4`,
      );

      // 合并视频（带转场）
      await this.ffmpegService.mergeVideosWithTransitions(
        videoUrls,
        finalVideoPath,
        0.3,
      );

      // 添加标题帧
      const withTitlePath = path.join(
        this.videoStoragePath,
        `${chapter.id}-with-title.mp4`,
      );
      await this.ffmpegService.addTitleFrame(
        finalVideoPath,
        `第${chapter.chapterNumber}章 ${chapter.title}`,
        2,
        withTitlePath,
      );

      // 压缩优化
      const compressedPath = path.join(
        this.videoStoragePath,
        `${chapter.id}-compressed.mp4`,
      );
      await this.ffmpegService.compressVideo(
        withTitlePath,
        compressedPath,
        'medium',
      );

      // 获取视频元数据
      const metadata = await this.ffmpegService.getVideoMetadata(compressedPath);

      await this.updateLog(logId, 'MERGE', 'COMPLETED', 95);

      // ===== 阶段5: 上传与完成 =====
      this.logger.log(`[阶段5] 上传视频`);
      await this.updateLog(logId, 'UPLOAD', 'PROCESSING', 97);

      // TODO: 上传到CDN
      const videoUrl = this.getVideoUrl(compressedPath);

      // 更新章节记录
      await this.prisma.chapter.update({
        where: { id: chapter.id },
        data: {
          videoStatus: 'COMPLETED',
          videoUrl: videoUrl,
          videoMetadata: metadata as any,
        },
      });

      // 完成日志
      const duration = (Date.now() - startTime) / 1000;
      await this.updateLog(logId, 'COMPLETED', 'COMPLETED', 100, {
        finalVideoUrl: videoUrl,
        totalDuration: duration,
      });

      this.logger.log(`视频生成完成，总耗时: ${duration}秒`);

      // 清理临时文件
      this.cleanupTempFiles([...imageUrls, ...videoUrls, finalVideoPath, withTitlePath]);

    } catch (error) {
      this.logger.error(`视频生成失败: ${error.message}`, error.stack);

      // 更新失败状态
      await this.prisma.chapter.update({
        where: { id: chapter.id },
        data: {
          videoStatus: 'FAILED',
          videoGenerationLog: error.message,
        },
      });

      await this.updateLog(logId, 'COMPLETED', 'FAILED', 0, null, error.message);
    }
  }

  /**
   * 查询视频生成状态
   */
  async getVideoGenerationStatus(chapterId: string): Promise<VideoGenerationStatusDto> {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter) {
      throw new NotFoundException('章节不存在');
    }

    const log = await this.prisma.videoGenerationLog.findFirst({
      where: { chapterId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      chapterId,
      status: chapter.videoStatus || 'PENDING',
      stage: log?.stage || 'SCRIPT',
      progress: log?.progress || 0,
      videoUrl: chapter.videoUrl || undefined,
      errorMessage: log?.errorMessage || undefined,
      startedAt: log?.startedAt || undefined,
      completedAt: log?.completedAt || undefined,
      generatedImages: chapter.generatedImages as string[] || undefined,
    };
  }

  /**
   * 获取一致性配置
   */
  private async getConsistencyProfile(novelId: string): Promise<any> {
    const profile = await this.prisma.consistencyProfile.findUnique({
      where: { novelId },
    });

    if (!profile) {
      // 创建默认配置
      return await this.createDefaultConsistencyProfile(novelId);
    }

    return {
      characters: profile.characters,
      environments: profile.environments,
      objects: profile.objects,
      visualStyle: profile.visualStyle,
    };
  }

  /**
   * 创建默认一致性配置
   */
  private async createDefaultConsistencyProfile(novelId: string): Promise<any> {
    const defaultProfile = {
      characters: {},
      environments: {},
      objects: {},
      visualStyle: {
        overall: 'realistic',
        colorTone: 'natural',
        artStyle: 'cinematic',
        lighting: 'natural',
      },
    };

    await this.prisma.consistencyProfile.create({
      data: {
        novelId,
        characters: defaultProfile.characters as any,
        environments: defaultProfile.environments as any,
        objects: defaultProfile.objects as any,
        visualStyle: defaultProfile.visualStyle as any,
      },
    });

    return defaultProfile;
  }

  /**
   * 更新生成日志
   */
  private async updateLog(
    logId: string,
    stage: any,
    status: any,
    progress: number,
    details?: any,
    errorMessage?: string,
  ): Promise<void> {
    const updateData: any = {
      stage,
      status,
      progress,
      updatedAt: new Date(),
    };

    if (details) {
      updateData.details = details;
    }

    if (errorMessage) {
      updateData.errorMessage = errorMessage;
    }

    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
      const log = await this.prisma.videoGenerationLog.findUnique({
        where: { id: logId },
      });
      if (log?.startedAt) {
        updateData.duration = Math.floor((Date.now() - log.startedAt.getTime()) / 1000);
      }
    }

    await this.prisma.videoGenerationLog.update({
      where: { id: logId },
      data: updateData,
    });
  }

  /**
   * 获取视频URL
   */
  private getVideoUrl(localPath: string): string {
    const cdnUrl = process.env.VIDEO_CDN_URL || 'http://localhost:3000/videos';
    const filename = path.basename(localPath);
    return `${cdnUrl}/${filename}`;
  }

  /**
   * 清理临时文件
   */
  private cleanupTempFiles(files: string[]): void {
    files.forEach(file => {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
          this.logger.debug(`已删除临时文件: ${file}`);
        }
      } catch (error) {
        this.logger.warn(`删除临时文件失败: ${file}`, error.message);
      }
    });
  }
}

