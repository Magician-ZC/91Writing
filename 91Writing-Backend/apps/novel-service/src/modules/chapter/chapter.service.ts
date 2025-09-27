import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { CreateChapterDto } from '../../dto/create-chapter.dto';
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
}
