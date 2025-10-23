import { Injectable, Logger } from '@nestjs/common';
import { promisify } from 'util';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

/**
 * FFmpeg视频处理服务
 * 
 * 负责视频合成、转码、添加效果等操作
 */
@Injectable()
export class FFmpegService {
  private readonly logger = new Logger(FFmpegService.name);
  private readonly ffmpegPath: string;
  private readonly tempDir: string;

  constructor() {
    this.ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';
    this.tempDir = process.env.VIDEO_TEMP_DIR || '/tmp/video-generation';

    // 确保临时目录存在
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * 合并多个视频片段
   */
  async mergeVideos(videoPaths: string[], outputPath: string): Promise<string> {
    this.logger.log(`开始合并视频，数量: ${videoPaths.length}`);

    try {
      // 1. 创建视频列表文件
      const listFilePath = path.join(this.tempDir, `merge-list-${Date.now()}.txt`);
      const listContent = videoPaths.map(p => `file '${p}'`).join('\n');
      fs.writeFileSync(listFilePath, listContent);

      // 2. 执行FFmpeg合并命令
      const command = `${this.ffmpegPath} -f concat -safe 0 -i "${listFilePath}" -c copy "${outputPath}"`;
      
      const { stdout, stderr } = await execAsync(command);
      this.logger.debug(`FFmpeg输出: ${stderr}`);

      // 3. 清理临时文件
      fs.unlinkSync(listFilePath);

      // 4. 验证输出文件
      if (!fs.existsSync(outputPath)) {
        throw new Error('视频合并失败：输出文件不存在');
      }

      const stats = fs.statSync(outputPath);
      this.logger.log(`视频合并成功，文件大小: ${(stats.size / 1024 / 1024).toFixed(2)}MB`);

      return outputPath;
    } catch (error) {
      this.logger.error(`视频合并失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 合并视频并添加转场效果
   */
  async mergeVideosWithTransitions(
    videoPaths: string[],
    outputPath: string,
    transitionDuration: number = 0.5,
  ): Promise<string> {
    this.logger.log(`开始合并视频（带转场），数量: ${videoPaths.length}`);

    try {
      // 构建xfade转场滤镜
      let filterComplex = '';
      let currentLabel = '[0:v]';

      for (let i = 1; i < videoPaths.length; i++) {
        const nextLabel = i === videoPaths.length - 1 ? '[outv]' : `[v${i}]`;
        filterComplex += `${currentLabel}[${i}:v]xfade=transition=fade:duration=${transitionDuration}:offset=0${nextLabel};`;
        currentLabel = nextLabel;
      }

      // 构建输入参数
      const inputs = videoPaths.map(p => `-i "${p}"`).join(' ');

      // 执行FFmpeg命令
      const command = `${this.ffmpegPath} ${inputs} -filter_complex "${filterComplex}" -map "[outv]" "${outputPath}"`;
      
      const { stderr } = await execAsync(command, { maxBuffer: 10 * 1024 * 1024 });
      this.logger.debug(`FFmpeg输出: ${stderr}`);

      if (!fs.existsSync(outputPath)) {
        throw new Error('视频合并失败：输出文件不存在');
      }

      this.logger.log(`视频合并成功（带转场）`);
      return outputPath;
    } catch (error) {
      this.logger.error(`视频合并失败: ${error.message}`);
      // 降级为无转场合并
      this.logger.warn('降级为无转场合并');
      return this.mergeVideos(videoPaths, outputPath);
    }
  }

  /**
   * 添加章节标题帧
   */
  async addTitleFrame(
    videoPath: string,
    title: string,
    duration: number,
    outputPath: string,
  ): Promise<string> {
    this.logger.log(`添加标题帧: ${title}`);

    try {
      // 1. 创建标题图片
      const titleImagePath = await this.createTitleImage(title);

      // 2. 将标题图片转为视频
      const titleVideoPath = path.join(this.tempDir, `title-${Date.now()}.mp4`);
      await this.imageToVideo(titleImagePath, titleVideoPath, duration);

      // 3. 合并标题视频和原视频
      await this.mergeVideos([titleVideoPath, videoPath], outputPath);

      // 4. 清理临时文件
      fs.unlinkSync(titleImagePath);
      fs.unlinkSync(titleVideoPath);

      return outputPath;
    } catch (error) {
      this.logger.error(`添加标题帧失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 创建标题图片
   */
  private async createTitleImage(title: string): Promise<string> {
    const imagePath = path.join(this.tempDir, `title-${Date.now()}.png`);

    // 使用FFmpeg生成标题图片
    const command = `${this.ffmpegPath} -f lavfi -i color=c=black:s=1024x576:d=1 -vf "drawtext=text='${title}':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2" -frames:v 1 "${imagePath}"`;

    await execAsync(command);

    return imagePath;
  }

  /**
   * 图片转视频
   */
  private async imageToVideo(
    imagePath: string,
    videoPath: string,
    duration: number,
  ): Promise<string> {
    const command = `${this.ffmpegPath} -loop 1 -i "${imagePath}" -c:v libx264 -t ${duration} -pix_fmt yuv420p -vf "scale=1024:576" "${videoPath}"`;

    await execAsync(command);

    return videoPath;
  }

  /**
   * 压缩视频
   */
  async compressVideo(
    inputPath: string,
    outputPath: string,
    quality: 'high' | 'medium' | 'low' = 'medium',
  ): Promise<string> {
    this.logger.log(`压缩视频，质量: ${quality}`);

    const crfMap = {
      high: 18,
      medium: 23,
      low: 28,
    };

    const crf = crfMap[quality];

    try {
      const command = `${this.ffmpegPath} -i "${inputPath}" -c:v libx264 -crf ${crf} -preset medium -c:a aac -b:a 128k "${outputPath}"`;

      const { stderr } = await execAsync(command);
      this.logger.debug(`FFmpeg输出: ${stderr}`);

      const inputStats = fs.statSync(inputPath);
      const outputStats = fs.statSync(outputPath);
      const compressionRatio = ((1 - outputStats.size / inputStats.size) * 100).toFixed(2);

      this.logger.log(`视频压缩完成，压缩率: ${compressionRatio}%`);

      return outputPath;
    } catch (error) {
      this.logger.error(`视频压缩失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 统一视频分辨率
   */
  async normalizeResolution(
    inputPath: string,
    outputPath: string,
    width: number = 1024,
    height: number = 576,
  ): Promise<string> {
    this.logger.log(`统一视频分辨率: ${width}x${height}`);

    try {
      const command = `${this.ffmpegPath} -i "${inputPath}" -vf "scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2" -c:a copy "${outputPath}"`;

      await execAsync(command);

      return outputPath;
    } catch (error) {
      this.logger.error(`统一分辨率失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 添加淡入淡出效果
   */
  async addFadeEffect(
    inputPath: string,
    outputPath: string,
    fadeInDuration: number = 0.5,
    fadeOutDuration: number = 0.5,
  ): Promise<string> {
    this.logger.log(`添加淡入淡出效果`);

    try {
      // 获取视频时长
      const duration = await this.getVideoDuration(inputPath);
      const fadeOutStart = duration - fadeOutDuration;

      const command = `${this.ffmpegPath} -i "${inputPath}" -vf "fade=t=in:st=0:d=${fadeInDuration},fade=t=out:st=${fadeOutStart}:d=${fadeOutDuration}" -c:a copy "${outputPath}"`;

      await execAsync(command);

      return outputPath;
    } catch (error) {
      this.logger.error(`添加淡入淡出失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取视频时长
   */
  async getVideoDuration(videoPath: string): Promise<number> {
    try {
      const command = `${this.ffmpegPath} -i "${videoPath}" 2>&1 | grep "Duration"`;
      const { stdout } = await execAsync(command);

      const match = stdout.match(/Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})/);
      if (match) {
        const hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const seconds = parseFloat(match[3]);
        return hours * 3600 + minutes * 60 + seconds;
      }

      return 0;
    } catch (error) {
      this.logger.error(`获取视频时长失败: ${error.message}`);
      return 0;
    }
  }

  /**
   * 检查FFmpeg是否可用
   */
  async checkFFmpegAvailability(): Promise<boolean> {
    try {
      const { stdout } = await execAsync(`${this.ffmpegPath} -version`);
      this.logger.log(`FFmpeg版本: ${stdout.split('\n')[0]}`);
      return true;
    } catch (error) {
      this.logger.error(`FFmpeg不可用: ${error.message}`);
      return false;
    }
  }

  /**
   * 创建标题视频
   */
  async createTitleVideo(
    title: string,
    duration: number,
    outputPath: string,
    options?: {
      width?: number;
      height?: number;
      fontSize?: number;
      fontColor?: string;
      backgroundColor?: string;
    },
  ): Promise<string> {
    const width = options?.width || 1920;
    const height = options?.height || 1080;
    const fontSize = options?.fontSize || 60;
    const fontColor = options?.fontColor || 'white';
    const backgroundColor = options?.backgroundColor || 'black';

    this.logger.log(`创建标题视频: ${title}, 时长: ${duration}秒`);

    try {
      // 转义标题中的特殊字符
      const escapedTitle = title.replace(/'/g, "'\\''").replace(/:/g, '\\:');

      // 使用FFmpeg生成标题视频
      const command = `${this.ffmpegPath} -f lavfi -i color=c=${backgroundColor}:s=${width}x${height}:d=${duration} -vf "drawtext=text='${escapedTitle}':fontsize=${fontSize}:fontcolor=${fontColor}:x=(w-text_w)/2:y=(h-text_h)/2" -c:v libx264 -pix_fmt yuv420p "${outputPath}"`;

      await execAsync(command);

      if (!fs.existsSync(outputPath)) {
        throw new Error('标题视频创建失败');
      }

      this.logger.log(`标题视频创建成功: ${outputPath}`);
      return outputPath;
    } catch (error) {
      this.logger.error(`创建标题视频失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取视频的宽高
   */
  async getVideoMetadata(videoPath: string): Promise<{
    duration: number;
    width: number;
    height: number;
    fps: number;
    bitrate: number;
    resolution: string;
    fileSize: number;
    format: string;
  }> {
    try {
      const command = `${this.ffmpegPath} -i "${videoPath}" -f ffmetadata - 2>&1`;
      const { stdout, stderr } = await execAsync(command);

      const output = stderr + stdout;

      // 解析元数据
      const durationMatch = output.match(/Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})/);
      const resolutionMatch = output.match(/(\d{3,4})x(\d{3,4})/);
      const fpsMatch = output.match(/(\d+(?:\.\d+)?) fps/);
      const bitrateMatch = output.match(/bitrate: (\d+) kb\/s/);

      let duration = 0;
      if (durationMatch) {
        const hours = parseInt(durationMatch[1]);
        const minutes = parseInt(durationMatch[2]);
        const seconds = parseFloat(durationMatch[3]);
        duration = hours * 3600 + minutes * 60 + seconds;
      }

      const width = resolutionMatch ? parseInt(resolutionMatch[1]) : 0;
      const height = resolutionMatch ? parseInt(resolutionMatch[2]) : 0;

      return {
        duration,
        width,
        height,
        resolution: resolutionMatch ? `${resolutionMatch[1]}x${resolutionMatch[2]}` : 'unknown',
        fps: fpsMatch ? parseFloat(fpsMatch[1]) : 0,
        bitrate: bitrateMatch ? parseInt(bitrateMatch[1]) : 0,
        fileSize: fs.existsSync(videoPath) ? fs.statSync(videoPath).size : 0,
        format: path.extname(videoPath).slice(1),
      };
    } catch (error) {
      this.logger.error(`获取视频元数据失败: ${error.message}`);
      return {
        duration: 0,
        width: 0,
        height: 0,
        resolution: 'unknown',
        fps: 0,
        bitrate: 0,
        fileSize: 0,
        format: 'unknown',
      };
    }
  }
}

