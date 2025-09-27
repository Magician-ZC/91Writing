import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { CreateNovelDto } from '../../dto/create-novel.dto';
import { UpdateNovelDto } from '../../dto/update-novel.dto';
import { NovelStatus } from '@prisma/client';

@Injectable()
export class NovelService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建新小说
   */
  async create(userId: string, createNovelDto: CreateNovelDto) {
    // 检查用户是否存在
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 创建小说
    const novel = await this.prisma.novel.create({
      data: {
        userId,
        ...createNovelDto,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        _count: {
          select: {
            chapters: true,
            memories: true,
          },
        },
      },
    });

    return novel;
  }

  /**
   * 获取用户的小说列表
   */
  async findAll(userId: string, options?: {
    status?: NovelStatus;
    genre?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, genre, page = 1, limit = 20 } = options || {};
    
    const where: any = { userId };
    if (status) where.status = status;
    if (genre) where.genre = genre;

    const skip = (page - 1) * limit;

    const [novels, total] = await Promise.all([
      this.prisma.novel.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          _count: {
            select: {
              chapters: true,
              memories: true,
            },
          },
        },
      }),
      this.prisma.novel.count({ where }),
    ]);

    return {
      novels,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 获取单个小说详情
   */
  async findOne(id: string, userId: string) {
    const novel = await this.prisma.novel.findFirst({
      where: { 
        id,
        userId, // 确保只能访问自己的小说
      },
      include: {
        chapters: {
          orderBy: { chapterNumber: 'asc' },
          select: {
            id: true,
            title: true,
            chapterNumber: true,
            wordCount: true,
            status: true,
            updatedAt: true,
          },
        },
        memories: {
          orderBy: { importance: 'desc' },
          take: 10, // 只返回前10个最重要的记忆
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!novel) {
      throw new NotFoundException('小说不存在或无权访问');
    }

    return novel;
  }

  /**
   * 更新小说信息
   */
  async update(id: string, userId: string, updateNovelDto: UpdateNovelDto) {
    // 检查小说是否存在且属于当前用户
    const existingNovel = await this.prisma.novel.findFirst({
      where: { id, userId },
    });

    if (!existingNovel) {
      throw new NotFoundException('小说不存在或无权访问');
    }

    // 更新小说
    const novel = await this.prisma.novel.update({
      where: { id },
      data: updateNovelDto,
      include: {
        _count: {
          select: {
            chapters: true,
            memories: true,
          },
        },
      },
    });

    return novel;
  }

  /**
   * 删除小说
   */
  async remove(id: string, userId: string) {
    // 检查小说是否存在且属于当前用户
    const existingNovel = await this.prisma.novel.findFirst({
      where: { id, userId },
    });

    if (!existingNovel) {
      throw new NotFoundException('小说不存在或无权访问');
    }

    // 删除小说（级联删除章节和记忆）
    await this.prisma.novel.delete({
      where: { id },
    });

    return { message: '小说已删除' };
  }

  /**
   * 更新小说统计信息
   */
  async updateStats(novelId: string, userId: string) {
    // 验证权限
    const novel = await this.prisma.novel.findFirst({
      where: { id: novelId, userId },
    });

    if (!novel) {
      throw new NotFoundException('小说不存在或无权访问');
    }

    // 统计章节数和总字数
    const stats = await this.prisma.chapter.aggregate({
      where: { novelId },
      _count: { id: true },
      _sum: { wordCount: true },
    });

    const chapterCount = stats._count.id || 0;
    const wordCount = stats._sum.wordCount || 0;

    // 更新统计信息
    const updatedNovel = await this.prisma.novel.update({
      where: { id: novelId },
      data: {
        chapterCount,
        wordCount,
      },
    });

    return updatedNovel;
  }

  /**
   * 获取小说设置
   */
  async getSettings(novelId: string, userId: string) {
    const novel = await this.prisma.novel.findFirst({
      where: { id: novelId, userId },
      select: { settings: true },
    });

    if (!novel) {
      throw new NotFoundException('小说不存在或无权访问');
    }

    return novel.settings || {};
  }

  /**
   * 更新小说设置
   */
  async updateSettings(novelId: string, userId: string, settings: any) {
    // 验证权限
    const novel = await this.prisma.novel.findFirst({
      where: { id: novelId, userId },
    });

    if (!novel) {
      throw new NotFoundException('小说不存在或无权访问');
    }

    // 合并设置（不是完全覆盖）
    const currentSettings = novel.settings as any || {};
    const mergedSettings = { ...currentSettings, ...settings };

    const updatedNovel = await this.prisma.novel.update({
      where: { id: novelId },
      data: { settings: mergedSettings },
      select: { settings: true },
    });

    return updatedNovel.settings;
  }
}
