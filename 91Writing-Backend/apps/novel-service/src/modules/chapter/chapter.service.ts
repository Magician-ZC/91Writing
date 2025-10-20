import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { CreateChapterDto } from '../../dto/create-chapter.dto';
import { UpdateChapterWithConflictDto, ConflictResponse } from '../../dto/update-chapter-with-conflict.dto';
import { ChapterStatus } from '@prisma/client';

@Injectable()
export class ChapterService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建新章节
   */
  async create(novelId: string, userId: string, createChapterDto: CreateChapterDto) {
    // 验证小说是否存在且属于当前用户
    const novel = await this.prisma.novel.findFirst({
      where: { id: novelId, userId },
    });

    if (!novel) {
      throw new NotFoundException('小说不存在或无权访问');
    }

    // 检查章节号是否已存在
    const existingChapter = await this.prisma.chapter.findUnique({
      where: {
        novelId_chapterNumber: {
          novelId,
          chapterNumber: createChapterDto.chapterNumber,
        },
      },
    });

    if (existingChapter) {
      throw new BadRequestException(`第${createChapterDto.chapterNumber}章已存在`);
    }

    // 计算字数
    const wordCount = this.calculateWordCount(createChapterDto.content);

    // 创建章节
    const chapter = await this.prisma.chapter.create({
      data: {
        novelId,
        ...createChapterDto,
        wordCount,
      },
      include: {
        novel: {
          select: {
            id: true,
            title: true,
            userId: true,
          },
        },
      },
    });

    // 更新小说统计信息
    await this.updateNovelStats(novelId);

    return chapter;
  }

  /**
   * 获取小说的章节列表
   */
  async findAll(novelId: string, userId: string) {
    // 验证权限
    const novel = await this.prisma.novel.findFirst({
      where: { id: novelId, userId },
    });

    if (!novel) {
      throw new NotFoundException('小说不存在或无权访问');
    }

    const chapters = await this.prisma.chapter.findMany({
      where: { novelId },
      orderBy: { chapterNumber: 'asc' },
      select: {
        id: true,
        title: true,
        chapterNumber: true,
        wordCount: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return chapters;
  }

  /**
   * 获取单个章节详情
   */
  async findOne(id: string, userId: string) {
    const chapter = await this.prisma.chapter.findFirst({
      where: {
        id,
        novel: { userId }, // 通过小说关联验证权限
      },
      include: {
        novel: {
          select: {
            id: true,
            title: true,
            userId: true,
          },
        },
      },
    });

    if (!chapter) {
      throw new NotFoundException('章节不存在或无权访问');
    }

    return chapter;
  }

  /**
   * 更新章节
   */
  async update(id: string, userId: string, updateData: Partial<CreateChapterDto>) {
    // 验证权限
    const chapter = await this.prisma.chapter.findFirst({
      where: {
        id,
        novel: { userId },
      },
    });

    if (!chapter) {
      throw new NotFoundException('章节不存在或无权访问');
    }

    // 如果更新了内容，重新计算字数
    let wordCount = chapter.wordCount;
    if (updateData.content !== undefined) {
      wordCount = this.calculateWordCount(updateData.content);
    }

    // 如果更新了章节号，检查是否冲突
    if (updateData.chapterNumber !== undefined && updateData.chapterNumber !== chapter.chapterNumber) {
      const existingChapter = await this.prisma.chapter.findUnique({
        where: {
          novelId_chapterNumber: {
            novelId: chapter.novelId,
            chapterNumber: updateData.chapterNumber,
          },
        },
      });

      if (existingChapter) {
        throw new BadRequestException(`第${updateData.chapterNumber}章已存在`);
      }
    }

    const updatedChapter = await this.prisma.chapter.update({
      where: { id },
      data: {
        ...updateData,
        wordCount,
      },
      include: {
        novel: {
          select: {
            id: true,
            title: true,
            userId: true,
          },
        },
      },
    });

    // 如果字数有变化，更新小说统计
    if (wordCount !== chapter.wordCount) {
      await this.updateNovelStats(chapter.novelId);
    }

    return updatedChapter;
  }

  /**
   * 带冲突检测的章节更新
   */
  async updateWithConflictDetection(
    id: string, 
    userId: string, 
    updateDto: UpdateChapterWithConflictDto
  ): Promise<any | ConflictResponse> {
    // 验证权限并获取当前章节
    const chapter = await this.prisma.chapter.findFirst({
      where: {
        id,
        novel: { userId },
      },
      include: {
        novel: {
          select: {
            id: true,
            title: true,
            userId: true,
          },
        },
      },
    });

    if (!chapter) {
      throw new NotFoundException('章节不存在或无权访问');
    }

    // 解析客户端提供的最后已知更新时间
    const clientLastKnownUpdate = new Date(updateDto.lastKnownUpdatedAt);
    const serverLastUpdate = new Date(chapter.updatedAt);

    // 检测冲突：服务器端的更新时间是否晚于客户端已知的时间
    const hasConflict = serverLastUpdate > clientLastKnownUpdate;

    // 如果有冲突且不是强制更新
    if (hasConflict && !updateDto.forceUpdate) {
      // 返回冲突信息
      const conflictResponse: ConflictResponse = {
        hasConflict: true,
        serverVersion: {
          updatedAt: serverLastUpdate,
          title: chapter.title,
          content: chapter.content,
          wordCount: chapter.wordCount,
        },
        clientVersion: {
          updatedAt: clientLastKnownUpdate,
          title: updateDto.title,
          content: updateDto.content,
        },
        message: '检测到数据冲突：服务器端的内容已被其他设备或用户修改',
        suggestedActions: [
          'keep-server: 放弃本地修改，使用服务器版本',
          'keep-client: 用本地版本覆盖服务器版本',
          'merge: 尝试合并两个版本（需手动处理）',
        ],
      };

      // 抛出冲突异常，包含冲突详情
      throw new ConflictException({
        ...conflictResponse,
        statusCode: 409,
      });
    }

    // 如果没有冲突，或者是强制更新，或者客户端选择了解决策略
    let finalData: any = {};

    if (updateDto.conflictStrategy) {
      // 根据冲突解决策略处理
      switch (updateDto.conflictStrategy) {
        case 'keep-server':
          // 不更新，返回服务器版本
          return {
            resolved: true,
            strategy: 'keep-server',
            chapter,
            message: '已保留服务器版本',
          };

        case 'keep-client':
          // 使用客户端版本覆盖
          finalData = {
            title: updateDto.title !== undefined ? updateDto.title : chapter.title,
            content: updateDto.content !== undefined ? updateDto.content : chapter.content,
            status: updateDto.status !== undefined ? updateDto.status : chapter.status,
          };
          break;

        case 'merge':
          // 合并策略（这里简单实现，实际可能需要更复杂的合并逻辑）
          finalData = {
            title: updateDto.title || chapter.title,
            content: this.mergeContent(chapter.content, updateDto.content || ''),
            status: updateDto.status || chapter.status,
          };
          break;
      }
    } else {
      // 正常更新
      finalData = {
        title: updateDto.title,
        content: updateDto.content,
        status: updateDto.status,
      };
    }

    // 计算字数
    let wordCount = chapter.wordCount;
    if (finalData.content !== undefined) {
      wordCount = this.calculateWordCount(finalData.content);
    }

    // 执行更新
    const updatedChapter = await this.prisma.chapter.update({
      where: { id },
      data: {
        ...finalData,
        wordCount,
      },
      include: {
        novel: {
          select: {
            id: true,
            title: true,
            userId: true,
          },
        },
      },
    });

    // 更新小说统计
    if (wordCount !== chapter.wordCount) {
      await this.updateNovelStats(chapter.novelId);
    }

    return {
      resolved: hasConflict,
      strategy: updateDto.conflictStrategy,
      chapter: updatedChapter,
      message: hasConflict ? '冲突已解决，章节已更新' : '章节已更新',
    };
  }

  /**
   * 简单的内容合并逻辑
   * 实际项目中可能需要更复杂的diff和merge算法
   */
  private mergeContent(serverContent: string, clientContent: string): string {
    // 这里使用一个简单的策略：如果客户端内容更长，使用客户端版本
    // 实际应用中应该使用更智能的合并算法
    if (clientContent.length > serverContent.length) {
      return clientContent;
    }
    return serverContent;
  }

  /**
   * 删除章节
   */
  async remove(id: string, userId: string) {
    // 验证权限
    const chapter = await this.prisma.chapter.findFirst({
      where: {
        id,
        novel: { userId },
      },
    });

    if (!chapter) {
      throw new NotFoundException('章节不存在或无权访问');
    }

    await this.prisma.chapter.delete({
      where: { id },
    });

    // 更新小说统计信息
    await this.updateNovelStats(chapter.novelId);

    return { message: '章节已删除' };
  }

  /**
   * 获取章节内容（流式返回大文本）
   */
  async getContent(id: string, userId: string) {
    const chapter = await this.prisma.chapter.findFirst({
      where: {
        id,
        novel: { userId },
      },
      select: {
        content: true,
      },
    });

    if (!chapter) {
      throw new NotFoundException('章节不存在或无权访问');
    }

    return { content: chapter.content };
  }

  /**
   * 更新章节内容
   */
  async updateContent(id: string, userId: string, content: string) {
    // 验证权限
    const chapter = await this.prisma.chapter.findFirst({
      where: {
        id,
        novel: { userId },
      },
    });

    if (!chapter) {
      throw new NotFoundException('章节不存在或无权访问');
    }

    const wordCount = this.calculateWordCount(content);

    const updatedChapter = await this.prisma.chapter.update({
      where: { id },
      data: {
        content,
        wordCount,
      },
      select: {
        id: true,
        title: true,
        wordCount: true,
        updatedAt: true,
      },
    });

    // 更新小说统计信息
    if (wordCount !== chapter.wordCount) {
      await this.updateNovelStats(chapter.novelId);
    }

    return updatedChapter;
  }

  /**
   * 批量更新章节状态
   */
  async updateStatus(novelId: string, userId: string, chapterIds: string[], status: ChapterStatus) {
    // 验证权限
    const novel = await this.prisma.novel.findFirst({
      where: { id: novelId, userId },
    });

    if (!novel) {
      throw new NotFoundException('小说不存在或无权访问');
    }

    // 批量更新
    const result = await this.prisma.chapter.updateMany({
      where: {
        id: { in: chapterIds },
        novelId,
      },
      data: { status },
    });

    return {
      updated: result.count,
      message: `已更新${result.count}个章节的状态为${status}`,
    };
  }

  /**
   * 重新排序章节
   */
  async reorder(novelId: string, userId: string, chapterOrders: Array<{ id: string; chapterNumber: number }>) {
    // 验证权限
    const novel = await this.prisma.novel.findFirst({
      where: { id: novelId, userId },
    });

    if (!novel) {
      throw new NotFoundException('小说不存在或无权访问');
    }

    // 使用事务批量更新
    await this.prisma.$transaction(
      chapterOrders.map(order =>
        this.prisma.chapter.update({
          where: { id: order.id },
          data: { chapterNumber: order.chapterNumber },
        })
      )
    );

    return { message: '章节顺序已更新' };
  }

  /**
   * 计算字数（中文字符 + 英文单词）
   */
  private calculateWordCount(content: string): number {
    if (!content) return 0;
    
    // 移除HTML标签和多余空白
    const cleanContent = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    
    // 中文字符
    const chineseMatches = cleanContent.match(/[\u4e00-\u9fa5]/g);
    const chineseCount = chineseMatches ? chineseMatches.length : 0;
    
    // 英文单词
    const englishMatches = cleanContent.match(/[a-zA-Z]+/g);
    const englishCount = englishMatches ? englishMatches.length : 0;
    
    return chineseCount + englishCount;
  }

  /**
   * 更新小说统计信息
   */
  private async updateNovelStats(novelId: string) {
    const stats = await this.prisma.chapter.aggregate({
      where: { novelId },
      _count: { id: true },
      _sum: { wordCount: true },
    });

    await this.prisma.novel.update({
      where: { id: novelId },
      data: {
        chapterCount: stats._count.id || 0,
        wordCount: stats._sum.wordCount || 0,
      },
    });
  }

  /**
   * 获取章节视频生成状态
   */
  async getVideoStatus(novelId: string, chapterId: string, userId: string) {
    // 验证章节权限
    const chapter = await this.prisma.chapter.findFirst({
      where: { 
        id: chapterId,
        novelId,
        novel: { userId }
      },
      select: {
        id: true,
        videoStatus: true,
        videoUrl: true,
      },
    });

    if (!chapter) {
      throw new NotFoundException('章节不存在或无权访问');
    }

    // 获取最新的生成日志
    const log = await this.prisma.videoGenerationLog.findFirst({
      where: { chapterId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      chapterId: chapter.id,
      status: chapter.videoStatus || 'PENDING',
      stage: log?.stage || 'SCRIPT',
      progress: log?.progress || 0,
      videoUrl: chapter.videoUrl || null,
      errorMessage: log?.errorMessage || null,
      startedAt: log?.startedAt || null,
      completedAt: log?.completedAt || null,
    };
  }

  /**
   * 删除章节视频
   */
  async deleteVideo(novelId: string, chapterId: string, userId: string) {
    // 验证章节权限
    const chapter = await this.prisma.chapter.findFirst({
      where: { 
        id: chapterId,
        novelId,
        novel: { userId }
      },
    });

    if (!chapter) {
      throw new NotFoundException('章节不存在或无权访问');
    }

    // 更新章节，清除视频相关信息
    await this.prisma.chapter.update({
      where: { id: chapterId },
      data: {
        videoStatus: null,
        videoUrl: null,
        videoMetadata: null,
        generatedImages: null,
      },
    });

    // TODO: 删除实际的视频文件和图片文件

    return {
      success: true,
      message: '视频已删除',
    };
  }
}
