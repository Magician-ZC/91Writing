import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { FFmpegService } from './ffmpeg.service';
import * as path from 'path';
import * as fs from 'fs';

/**
 * 长视频合成服务
 * 
 * 职责：
 * 1. 合并多个章节的短视频为一个长视频
 * 2. 添加章节分隔标题
 * 3. 添加片头片尾
 * 4. 优化长视频质量
 */
@Injectable()
export class LongVideoMergerService {
  private readonly logger = new Logger(LongVideoMergerService.name);
  private readonly videoStoragePath: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly ffmpegService: FFmpegService,
  ) {
    this.videoStoragePath = process.env.VIDEO_STORAGE_PATH || '/data/videos';
    
    if (!fs.existsSync(this.videoStoragePath)) {
      fs.mkdirSync(this.videoStoragePath, { recursive: true });
    }
  }

  /**
   * 合并批量生成的章节视频为一个长视频
   */
  async mergeBatchVideos(
    batchId: string,
    options?: {
      addChapterTitles?: boolean;  // 是否添加章节标题
      addOpening?: boolean;         // 是否添加片头
      addEnding?: boolean;          // 是否添加片尾
      titleDuration?: number;       // 章节标题显示时长（秒）
      transitionDuration?: number;  // 转场时长（秒）
      quality?: 'low' | 'medium' | 'high'; // 压缩质量
    },
  ): Promise<{
    mergedVideoUrl: string;
    totalDuration: number;
    fileSize: number;
    resolution: string;
    chapterCount: number;
  }> {
    this.logger.log(`开始合并批量视频，批次ID: ${batchId}`);

    // 1. 获取批次信息
    const batch = await this.prisma.videoBatchGeneration.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      throw new Error('批量任务不存在');
    }

    if (batch.status !== 'COMPLETED' && batch.status !== 'PROCESSING') {
      throw new Error(`批量任务状态为${batch.status}，无法合并视频`);
    }

    // 2. 获取所有已完成的章节视频
    const chapters = await this.prisma.chapter.findMany({
      where: {
        id: { in: batch.chapterIds as string[] },
        videoStatus: 'COMPLETED',
      },
      select: {
        id: true,
        chapterNumber: true,
        title: true,
        videoUrl: true,
        videoMetadata: true,
      },
      orderBy: { chapterNumber: 'asc' },
    });

    if (chapters.length === 0) {
      throw new Error('没有已完成的章节视频');
    }

    this.logger.log(`找到${chapters.length}个已完成的章节视频`);

    // 3. 准备视频片段
    const videoSegments: Array<{
      type: 'chapter-title' | 'video' | 'transition';
      path?: string;
      title?: string;
      duration?: number;
    }> = [];

    const defaultTitleDuration = options?.titleDuration || 2;
    const defaultTransitionDuration = options?.transitionDuration || 0.3;

    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];

      // 添加章节标题（可选）
      if (options?.addChapterTitles !== false) {
        videoSegments.push({
          type: 'chapter-title',
          title: `第${chapter.chapterNumber}章 ${chapter.title}`,
          duration: defaultTitleDuration,
        });
      }

      // 添加章节视频
      const videoPath = this.convertUrlToPath(chapter.videoUrl);
      if (!fs.existsSync(videoPath)) {
        this.logger.warn(`章节${chapter.chapterNumber}的视频文件不存在: ${videoPath}`);
        continue;
      }

      videoSegments.push({
        type: 'video',
        path: videoPath,
      });

      // 添加转场（最后一个视频后不添加）
      if (i < chapters.length - 1) {
        videoSegments.push({
          type: 'transition',
          duration: defaultTransitionDuration,
        });
      }
    }

    // 4. 生成临时视频文件
    const tempVideos: string[] = [];

    for (let i = 0; i < videoSegments.length; i++) {
      const segment = videoSegments[i];

      if (segment.type === 'chapter-title') {
        // 生成标题帧视频
        const titleVideoPath = path.join(
          this.videoStoragePath,
          `${batchId}-title-${i}.mp4`,
        );
        
        await this.ffmpegService.createTitleVideo(
          segment.title!,
          segment.duration!,
          titleVideoPath,
          { width: 1920, height: 1080 },
        );

        tempVideos.push(titleVideoPath);
      } else if (segment.type === 'video') {
        tempVideos.push(segment.path!);
      }
      // transition由FFmpeg自动处理
    }

    // 5. 合并所有视频
    const mergedPath = path.join(
      this.videoStoragePath,
      `${batchId}-merged.mp4`,
    );

    await this.ffmpegService.mergeVideosWithTransitions(
      tempVideos,
      mergedPath,
      options?.transitionDuration || 0.3,
    );

    // 6. 添加片头（可选）
    let finalPath = mergedPath;
    if (options?.addOpening) {
      const withOpeningPath = path.join(
        this.videoStoragePath,
        `${batchId}-with-opening.mp4`,
      );

      await this.addOpening(mergedPath, withOpeningPath, batch.novelId);
      finalPath = withOpeningPath;
    }

    // 7. 添加片尾（可选）
    if (options?.addEnding) {
      const withEndingPath = path.join(
        this.videoStoragePath,
        `${batchId}-with-ending.mp4`,
      );

      await this.addEnding(finalPath, withEndingPath);
      finalPath = withEndingPath;
    }

    // 8. 压缩优化
    const compressedPath = path.join(
      this.videoStoragePath,
      `${batchId}-final.mp4`,
    );

    await this.ffmpegService.compressVideo(
      finalPath,
      compressedPath,
      options?.quality || 'medium',
    );

    // 9. 获取视频元数据
    const metadata = await this.ffmpegService.getVideoMetadata(compressedPath);

    // 10. 上传到CDN（TODO）
    const videoUrl = this.getVideoUrl(compressedPath);

    // 11. 获取文件大小
    const fileStats = fs.statSync(compressedPath);
    const fileSize = fileStats.size;

    // 12. 更新批次记录
    await this.prisma.videoBatchGeneration.update({
      where: { id: batchId },
      data: {
        status: 'COMPLETED',
        mergedVideoUrl: videoUrl,
        actualDuration: metadata.duration,
        completedAt: new Date(),
      },
    });

    // 13. 清理临时文件
    this.cleanupTempFiles([
      ...tempVideos.filter(p => p.includes(batchId)), // 只删除临时生成的
      mergedPath,
      ...(options?.addOpening ? [finalPath] : []),
    ]);

    this.logger.log(`长视频合成完成: ${videoUrl}, 时长: ${metadata.duration}秒`);

    return {
      mergedVideoUrl: videoUrl,
      totalDuration: metadata.duration,
      fileSize,
      resolution: `${metadata.width}x${metadata.height}`,
      chapterCount: chapters.length,
    };
  }

  /**
   * 添加片头
   */
  private async addOpening(
    inputPath: string,
    outputPath: string,
    novelId: string,
  ): Promise<void> {
    // 获取小说信息
    const novel = await this.prisma.novel.findUnique({
      where: { id: novelId },
      select: { title: true, description: true },
    });

    // 生成片头视频（5秒）
    const openingPath = path.join(
      this.videoStoragePath,
      `opening-${novelId}.mp4`,
    );

    const openingText = `
《${novel?.title || '未知小说'}》

${novel?.description?.substring(0, 100) || ''}

————————————————
`;

    await this.ffmpegService.createTitleVideo(
      openingText,
      5,
      openingPath,
      { width: 1920, height: 1080, fontSize: 48 },
    );

    // 合并片头和正片
    await this.ffmpegService.mergeVideosWithTransitions(
      [openingPath, inputPath],
      outputPath,
      0.5,
    );

    // 删除临时片头
    if (fs.existsSync(openingPath)) {
      fs.unlinkSync(openingPath);
    }
  }

  /**
   * 添加片尾
   */
  private async addEnding(
    inputPath: string,
    outputPath: string,
  ): Promise<void> {
    // 生成片尾视频（3秒）
    const endingPath = path.join(
      this.videoStoragePath,
      `ending-${Date.now()}.mp4`,
    );

    const endingText = `
————————————————

感谢观看

更多精彩内容，敬请期待
`;

    await this.ffmpegService.createTitleVideo(
      endingText,
      3,
      endingPath,
      { width: 1920, height: 1080, fontSize: 40 },
    );

    // 合并正片和片尾
    await this.ffmpegService.mergeVideosWithTransitions(
      [inputPath, endingPath],
      outputPath,
      0.5,
    );

    // 删除临时片尾
    if (fs.existsSync(endingPath)) {
      fs.unlinkSync(endingPath);
    }
  }

  /**
   * URL转本地路径
   */
  private convertUrlToPath(url: string): string {
    // 如果是CDN URL，需要下载到本地
    // 这里简化处理，假设videoUrl就是本地路径或可以直接转换
    const filename = path.basename(url);
    return path.join(this.videoStoragePath, filename);
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

  /**
   * 查询长视频合成状态
   */
  async getMergeStatus(batchId: string): Promise<{
    status: string;
    progress: number;
    mergedVideoUrl?: string;
    error?: string;
  }> {
    const batch = await this.prisma.videoBatchGeneration.findUnique({
      where: { id: batchId },
      select: {
        status: true,
        mergedVideoUrl: true,
      },
    });

    if (!batch) {
      throw new Error('批量任务不存在');
    }

    // 根据状态判断进度
    let progress = 0;
    if (batch.status === 'COMPLETED') progress = 100;
    else if (batch.status === 'PROCESSING') progress = 50;
    else if (batch.status === 'FAILED') progress = 0;

    return {
      status: batch.status,
      progress,
      mergedVideoUrl: batch.mergedVideoUrl || undefined,
    };
  }
}

