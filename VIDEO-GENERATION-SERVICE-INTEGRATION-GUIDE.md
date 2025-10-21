# 视频生成服务集成指南 - 使用数据库配置

本指南说明如何修改现有的视频生成服务，使其从数据库读取配置而不是环境变量。

---

## 问题分析

当前情况：
- `VideoAPIConfigService` 在 `admin-service` 中
- `VideoGenerationService` 在 `ai-service` 中
- 需要跨服务共享配置服务

---

## 解决方案

### 方案1: 将VideoAPIConfigService移到共享库 (推荐) ⭐

#### 步骤1: 创建共享库模块

创建 `91Writing-Backend/libs/video-config/`：

```bash
cd 91Writing-Backend
mkdir -p libs/video-config/src
```

#### 步骤2: 移动VideoAPIConfigService到共享库

**创建** `libs/video-config/src/video-api-config.service.ts`：

```typescript
// 将 apps/admin-service/src/modules/video-api-config/video-api-config.service.ts
// 的内容复制到这里
```

**创建** `libs/video-config/src/video-api-config.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { VideoAPIConfigService } from './video-api-config.service';

@Module({
  imports: [DatabaseModule],
  providers: [VideoAPIConfigService],
  exports: [VideoAPIConfigService],
})
export class VideoAPIConfigModule {}
```

**创建** `libs/video-config/src/index.ts`:

```typescript
export * from './video-api-config.service';
export * from './video-api-config.module';
```

**创建** `libs/video-config/tsconfig.lib.json`:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "declaration": true,
    "outDir": "../../dist/libs/video-config"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test", "**/*spec.ts"]
}
```

#### 步骤3: 修改package.json和tsconfig

**修改** `91Writing-Backend/package.json`:

```json
{
  "dependencies": {
    ...
  },
  "_moduleAliases": {
    "@app/video-config": "dist/libs/video-config"
  }
}
```

**修改** `91Writing-Backend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      ...
      "@app/video-config": ["libs/video-config/src"],
      "@app/video-config/*": ["libs/video-config/src/*"]
    }
  }
}
```

#### 步骤4: 在admin-service中使用共享模块

**修改** `apps/admin-service/src/app.module.ts`:

```typescript
import { VideoAPIConfigModule } from '@app/video-config';

@Module({
  imports: [
    ...
    VideoAPIConfigModule,  // 从共享库导入
  ],
})
export class AppModule {}
```

#### 步骤5: 在ai-service中使用共享模块

**修改** `apps/ai-service/src/modules/video-generation/video-generation.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { VideoAPIConfigModule } from '@app/video-config';  // 导入共享模块
import { VideoGenerationController } from './video-generation.controller';
import { VideoGenerationService } from './video-generation.service';
// ... 其他导入

@Module({
  imports: [
    DatabaseModule,
    VideoAPIConfigModule,  // ✅ 添加这行
    // ... 其他模块
  ],
  controllers: [VideoGenerationController],
  providers: [
    VideoGenerationService,
    // ... 其他provider
  ],
})
export class VideoGenerationModule {}
```

#### 步骤6: 修改VideoGenerationService使用数据库配置

**修改** `apps/ai-service/src/modules/video-generation/video-generation.service.ts`:

```typescript
import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { VideoAPIConfigService } from '@app/video-config';  // ✅ 导入
import { StoryboardAgentService } from '../../services/storyboard-agent.service';
import { ImageGenerationAgentService } from '../../services/image-generation-agent.service';
import { VideoGenerationAgentService } from '../../services/video-generation-agent.service';
import { VolcengineVisualProvider } from '../../providers/volcengine-visual.provider';
import { JimengVideoProvider } from '../../providers/jimeng-video.provider';
import { KlingVideoProvider } from '../../providers/kling-video.provider';
import { FFmpegService } from '../../services/ffmpeg.service';
import { GenerateVideoDto, VideoGenerationStatusDto } from '../../dto/video-generation.dto';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class VideoGenerationService {
  private readonly logger = new Logger(VideoGenerationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly videoConfigService: VideoAPIConfigService,  // ✅ 注入
    private readonly storyboardAgent: StoryboardAgentService,
    private readonly imageAgent: ImageGenerationAgentService,
    private readonly videoAgent: VideoGenerationAgentService,
    private readonly volcengineProvider: VolcengineVisualProvider,
    private readonly jimengProvider: JimengVideoProvider,
    private readonly klingProvider: KlingVideoProvider,
    private readonly ffmpegService: FFmpegService,
  ) {
    // ❌ 移除这些行：
    // this.videoStoragePath = process.env.VIDEO_STORAGE_PATH || '/data/videos';
    // this.videoProvider = (process.env.VIDEO_PROVIDER as any) || 'jimeng';
  }

  /**
   * 生成章节视频（主流程）
   */
  async generateChapterVideo(
    userId: string,
    dto: GenerateVideoDto,
  ): Promise<VideoGenerationStatusDto> {
    this.logger.log(`开始生成章节视频，章节ID: ${dto.chapterId}`);

    // ✅ 1. 检查配额
    const quota = await this.videoConfigService.checkUserQuota(userId);
    if (!quota.available) {
      throw new ForbiddenException(
        `已达配额限制。每日剩余: ${quota.dailyRemaining}, 每月剩余: ${quota.monthlyRemaining}`
      );
    }

    // ✅ 2. 获取配置
    const config = await this.videoConfigService.getFullConfig();
    const videoStoragePath = config.videoStoragePath;
    
    // 确保存储目录存在
    if (!fs.existsSync(videoStoragePath)) {
      fs.mkdirSync(videoStoragePath, { recursive: true });
    }

    // 3. 验证章节权限
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

    // 4. 检查是否已有视频（非强制重新生成）
    if (!dto.forceRegenerate && chapter.videoStatus === 'COMPLETED' && chapter.videoUrl) {
      return {
        chapterId: dto.chapterId,
        status: 'COMPLETED',
        stage: 'COMPLETED',
        progress: 100,
        videoUrl: chapter.videoUrl,
      };
    }

    // 5. 更新章节状态为生成中
    await this.prisma.chapter.update({
      where: { id: dto.chapterId },
      data: {
        videoStatus: 'GENERATING',
        storyboardScript: null,
        generatedImages: null,
        videoUrl: null,
      },
    });

    // 6. 异步执行生成流程
    this.executeVideoGeneration(userId, dto.chapterId, chapter, config).catch(async (error) => {
      this.logger.error(`视频生成失败: ${error.message}`, error.stack);
      await this.prisma.chapter.update({
        where: { id: dto.chapterId },
        data: {
          videoStatus: 'FAILED',
          videoGenerationLog: error.message,
        },
      });
    });

    return {
      chapterId: dto.chapterId,
      status: 'GENERATING',
      stage: 'SCRIPT',
      progress: 0,
    };
  }

  /**
   * 执行视频生成流程（异步）
   */
  private async executeVideoGeneration(
    userId: string,
    chapterId: string,
    chapter: any,
    config: any,  // ✅ 传入配置
  ): Promise<void> {
    const novelId = chapter.novel.id;
    const chapterTitle = chapter.title;
    const chapterContent = chapter.content;

    try {
      // ===== 阶段1: 分镜脚本生成 (10-20%) =====
      this.logger.log(`[${chapterId}] 阶段1: 生成分镜脚本`);
      await this.updateProgress(chapterId, 'SCRIPT', 10);

      const consistency = await this.prisma.consistencyProfile.findUnique({
        where: { novelId },
      });

      const storyboard = await this.storyboardAgent.generateStoryboard(
        chapterContent,
        consistency,
        chapter.chapterNumber,
      );

      await this.prisma.chapter.update({
        where: { id: chapterId },
        data: { storyboardScript: storyboard as any },
      });

      await this.updateProgress(chapterId, 'SCRIPT', 20);

      // ===== 阶段2: 图片生成 (20-60%) =====
      this.logger.log(`[${chapterId}] 阶段2: 生成场景图片`);
      await this.updateProgress(chapterId, 'IMAGE', 25);

      const images: any[] = [];
      const imageProgressStep = 35 / storyboard.scenes.length;

      for (let i = 0; i < storyboard.scenes.length; i++) {
        const scene = storyboard.scenes[i];
        
        // 优化提示词
        const optimizedPrompt = await this.imageAgent.optimizePrompt(
          scene.description,
          i,
          storyboard.scenes.length,
          consistency,
          chapter.chapterNumber,
        );

        // ✅ 记录API使用 - 文生图
        const imageStartTime = Date.now();
        try {
          // 生成图片
          const imageResult = await this.volcengineProvider.generateImage({
            prompt: optimizedPrompt.prompt,
            negativePrompt: optimizedPrompt.negativePrompt,
            width: 1024,
            height: 576,
            batchSize: 1,
          });

          if (imageResult.images && imageResult.images.length > 0) {
            images.push({
              sceneIndex: i,
              description: scene.description,
              imageUrl: imageResult.images[0].url,
              prompt: optimizedPrompt.prompt,
            });
          }

          // ✅ 记录成功
          await this.videoConfigService.logApiUsage({
            userId,
            chapterId,
            provider: 'volcengine',
            apiType: 'text-to-image',
            requestCost: 0.02,  // 单张图片成本
            success: true,
          });

        } catch (error) {
          // ✅ 记录失败
          await this.videoConfigService.logApiUsage({
            userId,
            chapterId,
            provider: 'volcengine',
            apiType: 'text-to-image',
            requestCost: 0,
            success: false,
            errorMessage: error.message,
          });
          throw error;
        }

        // 更新进度
        await this.updateProgress(
          chapterId,
          'IMAGE',
          25 + (i + 1) * imageProgressStep,
        );
      }

      await this.prisma.chapter.update({
        where: { id: chapterId },
        data: { generatedImages: images.map(img => img.imageUrl) as any },
      });

      // ===== 阶段3: 视频生成 (60-85%) =====
      this.logger.log(`[${chapterId}] 阶段3: 生成视频片段`);
      await this.updateProgress(chapterId, 'VIDEO', 65);

      // ✅ 使用配置中的Provider
      const videoProvider = config.videoProvider === 'jimeng' 
        ? this.jimengProvider 
        : this.klingProvider;

      const videoClips: string[] = [];
      const videoProgressStep = 20 / images.length;

      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        
        // 生成运动提示词
        const motionPrompt = await this.videoAgent.generateMotionPrompt(
          storyboard.scenes[i].description,
          i,
          storyboard.scenes.length,
        );

        // ✅ 记录API使用 - 图生视频
        try {
          // 提交视频生成任务
          const videoTask = await videoProvider.submitTask({
            imageUrl: image.imageUrl,
            prompt: motionPrompt.prompt,
            duration: 5,
            motion: motionPrompt.motion,
          });

          // 等待视频生成完成
          const videoResult = await videoProvider.waitForCompletion(videoTask.taskId);
          
          if (videoResult.videoUrl) {
            // 下载视频到本地
            const videoPath = path.join(
              config.videoStoragePath,  // ✅ 使用配置路径
              `temp_${chapterId}_${i}.mp4`,
            );
            await videoProvider.downloadVideo(videoResult.videoUrl, videoPath);
            videoClips.push(videoPath);
          }

          // ✅ 记录成功
          await this.videoConfigService.logApiUsage({
            userId,
            chapterId,
            provider: config.videoProvider,
            apiType: 'image-to-video',
            requestCost: 1.5,  // 单个视频成本
            success: true,
          });

        } catch (error) {
          // ✅ 记录失败
          await this.videoConfigService.logApiUsage({
            userId,
            chapterId,
            provider: config.videoProvider,
            apiType: 'image-to-video',
            requestCost: 0,
            success: false,
            errorMessage: error.message,
          });
          throw error;
        }

        await this.updateProgress(
          chapterId,
          'VIDEO',
          65 + (i + 1) * videoProgressStep,
        );
      }

      // ===== 阶段4: 视频合成 (85-95%) =====
      this.logger.log(`[${chapterId}] 阶段4: 合成最终视频`);
      await this.updateProgress(chapterId, 'MERGE', 90);

      // 添加标题帧
      const titleFramePath = path.join(
        config.tempStoragePath,  // ✅ 使用配置路径
        `title_${chapterId}.mp4`,
      );
      await this.ffmpegService.addTitleFrame(
        chapterTitle,
        2,
        titleFramePath,
      );

      // 合并所有视频片段
      const finalVideoPath = path.join(
        config.videoStoragePath,  // ✅ 使用配置路径
        `${chapterId}_final.mp4`,
      );
      
      await this.ffmpegService.mergeVideosWithTransitions(
        [titleFramePath, ...videoClips],
        finalVideoPath,
        'fade',
      );

      // 压缩视频
      const compressedVideoPath = path.join(
        config.videoStoragePath,  // ✅ 使用配置路径
        `${chapterId}.mp4`,
      );
      await this.ffmpegService.compressVideo(
        finalVideoPath,
        compressedVideoPath,
        'medium',
      );

      // ===== 阶段5: 完成 (95-100%) =====
      this.logger.log(`[${chapterId}] 阶段5: 上传和清理`);
      await this.updateProgress(chapterId, 'UPLOAD', 95);

      // 获取视频元数据
      const metadata = await this.ffmpegService.getVideoMetadata(compressedVideoPath);

      // 更新章节
      const videoUrl = `/videos/${chapterId}.mp4`; // 实际应该上传到CDN
      await this.prisma.chapter.update({
        where: { id: chapterId },
        data: {
          videoStatus: 'COMPLETED',
          videoUrl,
          videoMetadata: metadata as any,
        },
      });

      // ✅ 消费用户配额
      await this.videoConfigService.consumeQuota(userId);

      // 清理临时文件
      const tempFiles = [titleFramePath, finalVideoPath, ...videoClips];
      for (const file of tempFiles) {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      }

      await this.updateProgress(chapterId, 'COMPLETED', 100);
      this.logger.log(`[${chapterId}] 视频生成完成！`);

    } catch (error) {
      this.logger.error(`[${chapterId}] 视频生成失败:`, error);
      throw error;
    }
  }

  /**
   * 更新生成进度
   */
  private async updateProgress(
    chapterId: string,
    stage: any,
    progress: number,
  ): Promise<void> {
    await this.prisma.chapter.update({
      where: { id: chapterId },
      data: {
        videoStatus: 'GENERATING',
        videoGenerationLog: JSON.stringify({
          stage,
          progress,
          timestamp: new Date(),
        }),
      },
    });
  }

  /**
   * 查询视频生成状态
   */
  async getVideoGenerationStatus(chapterId: string): Promise<VideoGenerationStatusDto> {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      select: {
        id: true,
        videoStatus: true,
        videoUrl: true,
        videoGenerationLog: true,
        generatedImages: true,
      },
    });

    if (!chapter) {
      throw new NotFoundException('章节不存在');
    }

    let stage = 'SCRIPT';
    let progress = 0;
    let errorMessage = null;

    if (chapter.videoGenerationLog) {
      try {
        const log = JSON.parse(chapter.videoGenerationLog as string);
        stage = log.stage || stage;
        progress = log.progress || progress;
        errorMessage = log.error || null;
      } catch (e) {
        // ignore
      }
    }

    return {
      chapterId: chapter.id,
      status: chapter.videoStatus as any,
      stage: stage as any,
      progress,
      videoUrl: chapter.videoUrl,
      generatedImages: (chapter.generatedImages as any) || [],
      errorMessage,
    };
  }
}
```

---

### 方案2: HTTP调用 (备选方案)

如果不想移动服务到共享库，可以通过HTTP调用admin-service的API：

**修改** `apps/ai-service/src/modules/video-generation/video-generation.service.ts`:

```typescript
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class VideoGenerationService {
  constructor(
    private readonly httpService: HttpService,  // ✅ 注入
    // ... 其他依赖
  ) {}

  private async getVideoConfig() {
    const response = await firstValueFrom(
      this.httpService.get('http://localhost:3003/admin/video-api-config', {
        headers: {
          Authorization: `Bearer ${process.env.ADMIN_API_TOKEN}`,
        },
      })
    );
    return response.data;
  }

  private async checkUserQuota(userId: string) {
    const response = await firstValueFrom(
      this.httpService.get(`http://localhost:3003/admin/video-api-config/quota/${userId}`, {
        headers: {
          Authorization: `Bearer ${process.env.ADMIN_API_TOKEN}`,
        },
      })
    );
    return response.data;
  }

  // 然后在generateChapterVideo中使用
  async generateChapterVideo(userId: string, dto: GenerateVideoDto) {
    // 检查配额
    const quota = await this.checkUserQuota(userId);
    if (!quota.available) {
      throw new ForbiddenException('已达配额限制');
    }

    // 获取配置
    const config = await this.getVideoConfig();
    
    // ... 使用config
  }
}
```

---

## 测试步骤

1. **迁移数据库**
   ```bash
   cd 91Writing-Backend
   npx prisma migrate dev --name add_video_api_config_tables
   npx prisma generate
   ```

2. **配置环境变量**
   ```env
   ENCRYPTION_KEY=your-32-character-key-here!!
   ```

3. **初始化种子数据**
   ```bash
   mysql -u root -p 91writing < prisma/seeds/video-api-config.seed.sql
   ```

4. **重启服务**
   ```bash
   npm run start:dev
   ```

5. **配置API密钥**
   - 访问管理后台: `http://localhost:3000/admin/settings/video-api-config`
   - 配置火山引擎/即梦/可灵的API密钥
   - 测试连接
   - 保存配置

6. **测试视频生成**
   - 生成一个视频
   - 检查是否使用数据库配置
   - 检查配额是否正确扣除
   - 检查使用日志是否记录

---

## 预期效果

### 之前:
```typescript
// 从环境变量读取
const videoProvider = process.env.VIDEO_PROVIDER || 'jimeng';
const apiKey = process.env.JIMENG_API_KEY;
```

### 之后:
```typescript
// 从数据库读取
const config = await this.videoConfigService.getFullConfig();
const videoProvider = config.videoProvider;  // 从数据库
const apiKey = config.jimengApiKey;  // 已解密
```

---

## 注意事项

1. ⚠️ **服务启动顺序**: 确保数据库已迁移
2. ⚠️ **配置初始化**: 首次启动时会自动创建默认配置
3. ⚠️ **加密密钥**: 必须配置ENCRYPTION_KEY环境变量
4. ⚠️ **权限控制**: 只有管理员可以修改配置
5. ⚠️ **配额重置**: 每日/每月自动重置配额

---

## 下一步

完成此集成后，系统将实现：

✅ API密钥动态配置（无需重启）  
✅ 用户配额自动管理  
✅ 成本实时统计  
✅ 使用日志审计  
✅ 配置安全加密  

**状态**: 📝 待实施  
**预计时间**: 2-3小时  
**优先级**: P1 (高优先级)


