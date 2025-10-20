import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { MemoryType, Prisma } from '@prisma/client';
import {
  CreateMemoryDto,
  UpdateMemoryDto,
  QueryMemoriesDto,
  ExtractMemoriesDto,
} from '../../dto/memory.dto';

/**
 * 记忆管理服务
 * 负责小说记忆的CRUD、智能提取、重要性评分等
 */
@Injectable()
export class MemoryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建记忆
   */
  async createMemory(userId: string, dto: CreateMemoryDto) {
    // 验证小说权限
    const novel = await this.prisma.novel.findFirst({
      where: {
        id: dto.novelId,
        userId,
      },
    });

    if (!novel) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: '小说不存在或无权访问',
          error: 'NOVEL_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // 创建记忆
    const memory = await this.prisma.novelMemory.create({
      data: {
        novelId: dto.novelId,
        memoryType: dto.memoryType,
        content: dto.content as Prisma.JsonObject,
        importance: dto.importance !== undefined ? dto.importance : 0.5,
        chapterRange: dto.chapterRange,
      },
    });

    return {
      success: true,
      data: this.formatMemory(memory),
    };
  }

  /**
   * 获取记忆列表
   */
  async getMemories(userId: string, novelId: string, query: QueryMemoriesDto) {
    // 验证小说权限
    await this.validateNovelAccess(userId, novelId);

    // 构建查询条件
    const where: Prisma.NovelMemoryWhereInput = {
      novelId,
    };

    if (query.memoryType) {
      where.memoryType = query.memoryType;
    }

    if (query.minImportance !== undefined) {
      where.importance = {
        gte: query.minImportance,
      };
    }

    // 关键词搜索
    if (query.keyword) {
      // 使用JSON路径搜索（注意：这在不同数据库中实现不同）
      where.OR = [
        {
          content: {
            path: ['title'],
            string_contains: query.keyword,
          },
        },
        {
          content: {
            path: ['description'],
            string_contains: query.keyword,
          },
        },
      ];
    }

    // 计算分页
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    // 查询数据
    const [memories, total] = await Promise.all([
      this.prisma.novelMemory.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [
          { importance: 'desc' },
          { updatedAt: 'desc' },
        ],
      }),
      this.prisma.novelMemory.count({ where }),
    ]);

    return {
      success: true,
      data: {
        items: memories.map(m => this.formatMemory(m)),
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    };
  }

  /**
   * 获取单个记忆
   */
  async getMemory(userId: string, memoryId: string) {
    const memory = await this.prisma.novelMemory.findUnique({
      where: { id: memoryId },
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

    if (!memory) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: '记忆不存在',
          error: 'MEMORY_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // 验证权限
    if (memory.novel.userId !== userId) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: '无权访问此记忆',
          error: 'FORBIDDEN',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    return {
      success: true,
      data: this.formatMemory(memory),
    };
  }

  /**
   * 更新记忆
   */
  async updateMemory(userId: string, memoryId: string, dto: UpdateMemoryDto) {
    // 验证记忆存在和权限
    const existing = await this.prisma.novelMemory.findUnique({
      where: { id: memoryId },
      include: {
        novel: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!existing) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: '记忆不存在',
          error: 'MEMORY_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (existing.novel.userId !== userId) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: '无权修改此记忆',
          error: 'FORBIDDEN',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // 更新记忆
    const memory = await this.prisma.novelMemory.update({
      where: { id: memoryId },
      data: {
        memoryType: dto.memoryType,
        content: dto.content as Prisma.JsonObject | undefined,
        importance: dto.importance,
        chapterRange: dto.chapterRange,
      },
    });

    return {
      success: true,
      data: this.formatMemory(memory),
    };
  }

  /**
   * 删除记忆
   */
  async deleteMemory(userId: string, memoryId: string) {
    // 验证权限
    const existing = await this.prisma.novelMemory.findUnique({
      where: { id: memoryId },
      include: {
        novel: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!existing) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: '记忆不存在',
          error: 'MEMORY_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (existing.novel.userId !== userId) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: '无权删除此记忆',
          error: 'FORBIDDEN',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // 删除记忆
    await this.prisma.novelMemory.delete({
      where: { id: memoryId },
    });

    return {
      success: true,
      message: '记忆已删除',
    };
  }

  /**
   * 智能提取记忆
   * 从指定章节中自动提取核心记忆
   */
  async extractMemories(userId: string, dto: ExtractMemoriesDto) {
    // 验证小说权限
    await this.validateNovelAccess(userId, dto.novelId);

    // 获取章节内容
    const chapters = await this.prisma.chapter.findMany({
      where: {
        id: {
          in: dto.chapterIds,
        },
        novelId: dto.novelId,
        isDeleted: false,
      },
      select: {
        id: true,
        title: true,
        content: true,
        orderNum: true,
      },
      orderBy: {
        orderNum: 'asc',
      },
    });

    if (chapters.length === 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: '未找到指定的章节',
          error: 'CHAPTERS_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // 使用AI提取记忆（简单实现，可以后续接入AI服务）
    const extractedMemories = await this.extractMemoriesFromChapters(
      chapters,
      dto.extractType || MemoryType.CORE,
    );

    // 保存提取的记忆
    const createdMemories = await Promise.all(
      extractedMemories.map(memory =>
        this.prisma.novelMemory.create({
          data: {
            novelId: dto.novelId,
            memoryType: memory.memoryType,
            content: memory.content as Prisma.JsonObject,
            importance: memory.importance,
            chapterRange: memory.chapterRange,
          },
        }),
      ),
    );

    return {
      success: true,
      data: {
        extracted: createdMemories.length,
        memories: createdMemories.map(m => this.formatMemory(m)),
      },
    };
  }

  /**
   * 更新记忆重要性评分
   */
  async updateImportance(userId: string, memoryId: string, importance: number) {
    // 验证权限
    const existing = await this.prisma.novelMemory.findUnique({
      where: { id: memoryId },
      include: {
        novel: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!existing) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: '记忆不存在',
          error: 'MEMORY_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (existing.novel.userId !== userId) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: '无权修改此记忆',
          error: 'FORBIDDEN',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // 更新重要性
    const memory = await this.prisma.novelMemory.update({
      where: { id: memoryId },
      data: {
        importance,
      },
    });

    return {
      success: true,
      data: this.formatMemory(memory),
    };
  }

  /**
   * 搜索相关记忆
   * 根据关键词或内容查找相关记忆
   */
  async searchMemories(userId: string, novelId: string, keywords: string[]) {
    await this.validateNovelAccess(userId, novelId);

    const memories = await this.prisma.novelMemory.findMany({
      where: {
        novelId,
      },
      orderBy: [
        { importance: 'desc' },
        { updatedAt: 'desc' },
      ],
    });

    // 计算相关性评分
    const scoredMemories = memories.map(memory => {
      const score = this.calculateRelevanceScore(memory, keywords);
      return {
        ...this.formatMemory(memory),
        relevanceScore: score,
      };
    });

    // 按相关性排序并返回
    scoredMemories.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return {
      success: true,
      data: scoredMemories.filter(m => m.relevanceScore > 0),
    };
  }

  /**
   * 获取记忆统计
   */
  async getMemoryStats(userId: string, novelId: string) {
    await this.validateNovelAccess(userId, novelId);

    const [total, byType, avgImportance] = await Promise.all([
      this.prisma.novelMemory.count({
        where: { novelId },
      }),
      this.prisma.novelMemory.groupBy({
        by: ['memoryType'],
        where: { novelId },
        _count: true,
      }),
      this.prisma.novelMemory.aggregate({
        where: { novelId },
        _avg: {
          importance: true,
        },
      }),
    ]);

    return {
      success: true,
      data: {
        total,
        byType: byType.reduce((acc, item) => {
          acc[item.memoryType] = item._count;
          return acc;
        }, {}),
        averageImportance: avgImportance._avg.importance || 0,
      },
    };
  }

  /**
   * 验证小说访问权限
   */
  private async validateNovelAccess(userId: string, novelId: string) {
    const novel = await this.prisma.novel.findFirst({
      where: {
        id: novelId,
        userId,
      },
    });

    if (!novel) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: '小说不存在或无权访问',
          error: 'NOVEL_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return novel;
  }

  /**
   * 从章节内容中提取记忆
   */
  private async extractMemoriesFromChapters(
    chapters: any[],
    extractType: MemoryType,
  ): Promise<any[]> {
    const memories: any[] = [];

    // 简单实现：基于章节内容提取关键信息
    for (const chapter of chapters) {
      const content = chapter.content || '';
      
      // 提取前500字作为摘要
      const summary = content.slice(0, 500);

      // 简单的关键词提取（实际应该用NLP或AI）
      const keywords = this.extractKeywords(content);

      memories.push({
        memoryType: extractType,
        content: {
          title: `${chapter.title} - 核心记忆`,
          description: summary,
          keywords,
          source: chapter.title,
        },
        importance: 0.7, // 自动提取的记忆默认重要性为0.7
        chapterRange: chapter.orderNum.toString(),
      });
    }

    return memories;
  }

  /**
   * 提取关键词（简单实现）
   */
  private extractKeywords(text: string): string[] {
    // 移除标点符号
    const cleanText = text.replace(/[，。！？；：""''（）【】《》、]/g, ' ');
    
    // 分词
    const words = cleanText.split(/\s+/).filter(w => w.length > 1);
    
    // 统计词频
    const wordCount = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});

    // 返回频率最高的10个词
    return Object.entries(wordCount)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * 计算记忆相关性评分
   */
  private calculateRelevanceScore(memory: any, keywords: string[]): number {
    if (!keywords || keywords.length === 0) {
      return 0;
    }

    const content = JSON.stringify(memory.content).toLowerCase();
    let score = 0;

    for (const keyword of keywords) {
      const lowerKeyword = keyword.toLowerCase();
      const occurrences = (content.match(new RegExp(lowerKeyword, 'g')) || []).length;
      score += occurrences;
    }

    // 考虑记忆的重要性
    const importanceWeight = parseFloat(memory.importance.toString());
    score = score * (1 + importanceWeight);

    return score;
  }

  /**
   * 格式化记忆数据
   */
  private formatMemory(memory: any) {
    return {
      id: memory.id,
      novelId: memory.novelId,
      memoryType: memory.memoryType,
      content: memory.content,
      importance: parseFloat(memory.importance.toString()),
      chapterRange: memory.chapterRange,
      tokenCost: memory.tokenCost,
      createdAt: memory.createdAt,
      updatedAt: memory.updatedAt,
    };
  }
}
