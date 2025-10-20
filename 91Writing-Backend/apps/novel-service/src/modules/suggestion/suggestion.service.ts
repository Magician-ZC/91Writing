import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { SuggestionType, SuggestionDimension, Prisma } from '@prisma/client';
import {
  CreateSuggestionDto,
  GenerateSuggestionsDto,
  QuerySuggestionsDto,
  AdoptSuggestionDto,
  RateSuggestionDto,
} from '../../dto/suggestion.dto';

/**
 * 写作建议服务
 * 负责建议的生成、管理、采纳反馈等
 */
@Injectable()
export class SuggestionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建建议
   */
  async createSuggestion(userId: string, dto: CreateSuggestionDto) {
    // 验证小说权限
    await this.validateNovelAccess(userId, dto.novelId);

    // 如果指定了章节，验证章节权限
    if (dto.chapterId) {
      await this.validateChapterAccess(userId, dto.chapterId, dto.novelId);
    }

    // 创建建议
    const suggestion = await this.prisma.writingSuggestion.create({
      data: {
        novelId: dto.novelId,
        chapterId: dto.chapterId,
        userId,
        suggestionType: dto.suggestionType,
        dimension: dto.dimension,
        title: dto.title,
        content: dto.content,
        priority: dto.priority || 50,
        context: dto.context as Prisma.JsonObject | undefined,
      },
    });

    return {
      success: true,
      data: this.formatSuggestion(suggestion),
    };
  }

  /**
   * AI生成建议
   */
  async generateSuggestions(userId: string, dto: GenerateSuggestionsDto) {
    // 验证小说权限
    const novel = await this.validateNovelAccess(userId, dto.novelId);

    // 获取章节内容
    let chapters = [];
    if (dto.chapterIds && dto.chapterIds.length > 0) {
      chapters = await this.prisma.chapter.findMany({
        where: {
          id: { in: dto.chapterIds },
          novelId: dto.novelId,
          isDeleted: false,
        },
        select: {
          id: true,
          title: true,
          content: true,
          wordCount: true,
          chapterNumber: true,
        },
        orderBy: {
          chapterNumber: 'asc',
        },
      });
    } else {
      // 获取最近的章节
      chapters = await this.prisma.chapter.findMany({
        where: {
          novelId: dto.novelId,
          isDeleted: false,
        },
        select: {
          id: true,
          title: true,
          content: true,
          wordCount: true,
          chapterNumber: true,
        },
        orderBy: {
          chapterNumber: 'desc',
        },
        take: 5,
      });
    }

    // 生成建议（简单实现，实际应该调用AI服务）
    const generatedSuggestions = await this.generateSuggestionsForNovel(
      novel,
      chapters,
      dto.dimensions,
      dto.count || 5,
    );

    // 批量保存建议
    const savedSuggestions = await Promise.all(
      generatedSuggestions.map(suggestion =>
        this.prisma.writingSuggestion.create({
          data: {
            novelId: dto.novelId,
            userId,
            suggestionType: SuggestionType.AUTO,
            dimension: suggestion.dimension,
            title: suggestion.title,
            content: suggestion.content,
            priority: suggestion.priority,
            context: suggestion.context as Prisma.JsonObject | undefined,
            aiModel: 'analysis-engine-v1',
          },
        }),
      ),
    );

    return {
      success: true,
      data: {
        generated: savedSuggestions.length,
        suggestions: savedSuggestions.map(s => this.formatSuggestion(s)),
      },
    };
  }

  /**
   * 获取建议列表
   */
  async getSuggestions(userId: string, novelId: string, query: QuerySuggestionsDto) {
    // 验证权限
    await this.validateNovelAccess(userId, novelId);

    // 构建查询条件
    const where: Prisma.WritingSuggestionWhereInput = {
      novelId,
      userId,
    };

    if (query.suggestionType) {
      where.suggestionType = query.suggestionType;
    }

    if (query.dimension) {
      where.dimension = query.dimension;
    }

    if (query.onlyPending) {
      where.isAdopted = false;
    }

    if (query.minPriority !== undefined) {
      where.priority = {
        gte: query.minPriority,
      };
    }

    // 分页
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    // 查询
    const [suggestions, total] = await Promise.all([
      this.prisma.writingSuggestion.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
        include: {
          chapter: {
            select: {
              id: true,
              title: true,
              chapterNumber: true,
            },
          },
        },
      }),
      this.prisma.writingSuggestion.count({ where }),
    ]);

    return {
      success: true,
      data: {
        items: suggestions.map(s => this.formatSuggestion(s)),
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
   * 获取单个建议
   */
  async getSuggestion(userId: string, suggestionId: string) {
    const suggestion = await this.prisma.writingSuggestion.findUnique({
      where: { id: suggestionId },
      include: {
        novel: {
          select: {
            id: true,
            title: true,
            userId: true,
          },
        },
        chapter: {
          select: {
            id: true,
            title: true,
            chapterNumber: true,
          },
        },
      },
    });

    if (!suggestion) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: '建议不存在',
          error: 'SUGGESTION_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // 验证权限
    if (suggestion.novel.userId !== userId) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: '无权访问此建议',
          error: 'FORBIDDEN',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    return {
      success: true,
      data: this.formatSuggestion(suggestion),
    };
  }

  /**
   * 采纳建议
   */
  async adoptSuggestion(userId: string, dto: AdoptSuggestionDto) {
    // 验证权限
    const suggestion = await this.prisma.writingSuggestion.findUnique({
      where: { id: dto.suggestionId },
      include: {
        novel: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!suggestion) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: '建议不存在',
          error: 'SUGGESTION_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (suggestion.novel.userId !== userId) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: '无权操作此建议',
          error: 'FORBIDDEN',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // 更新建议状态
    const updated = await this.prisma.writingSuggestion.update({
      where: { id: dto.suggestionId },
      data: {
        isAdopted: true,
        adoptedAt: new Date(),
        feedback: dto.feedback,
        rating: dto.rating,
      },
    });

    return {
      success: true,
      data: this.formatSuggestion(updated),
      message: '建议已采纳',
    };
  }

  /**
   * 评价建议
   */
  async rateSuggestion(userId: string, dto: RateSuggestionDto) {
    // 验证权限
    const suggestion = await this.prisma.writingSuggestion.findUnique({
      where: { id: dto.suggestionId },
      include: {
        novel: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!suggestion) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: '建议不存在',
          error: 'SUGGESTION_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (suggestion.novel.userId !== userId) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: '无权操作此建议',
          error: 'FORBIDDEN',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // 更新评分
    const updated = await this.prisma.writingSuggestion.update({
      where: { id: dto.suggestionId },
      data: {
        rating: dto.rating,
        feedback: dto.feedback,
      },
    });

    return {
      success: true,
      data: this.formatSuggestion(updated),
      message: '评价已保存',
    };
  }

  /**
   * 删除建议
   */
  async deleteSuggestion(userId: string, suggestionId: string) {
    // 验证权限
    const suggestion = await this.prisma.writingSuggestion.findUnique({
      where: { id: suggestionId },
      include: {
        novel: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!suggestion) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: '建议不存在',
          error: 'SUGGESTION_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (suggestion.novel.userId !== userId) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: '无权删除此建议',
          error: 'FORBIDDEN',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // 删除
    await this.prisma.writingSuggestion.delete({
      where: { id: suggestionId },
    });

    return {
      success: true,
      message: '建议已删除',
    };
  }

  /**
   * 批量删除建议
   */
  async bulkDeleteSuggestions(userId: string, novelId: string, suggestionIds: string[]) {
    // 验证权限
    await this.validateNovelAccess(userId, novelId);

    // 批量删除
    const result = await this.prisma.writingSuggestion.deleteMany({
      where: {
        id: { in: suggestionIds },
        novelId,
        userId,
      },
    });

    return {
      success: true,
      data: {
        deleted: result.count,
      },
      message: `成功删除${result.count}条建议`,
    };
  }

  /**
   * 获取建议统计
   */
  async getSuggestionStats(userId: string, novelId: string) {
    await this.validateNovelAccess(userId, novelId);

    const [total, adopted, byDimension, avgRating] = await Promise.all([
      this.prisma.writingSuggestion.count({
        where: { novelId, userId },
      }),
      this.prisma.writingSuggestion.count({
        where: { novelId, userId, isAdopted: true },
      }),
      this.prisma.writingSuggestion.groupBy({
        by: ['dimension'],
        where: { novelId, userId },
        _count: true,
      }),
      this.prisma.writingSuggestion.aggregate({
        where: { novelId, userId, rating: { not: null } },
        _avg: {
          rating: true,
        },
      }),
    ]);

    return {
      success: true,
      data: {
        total,
        adopted,
        pending: total - adopted,
        adoptionRate: total > 0 ? ((adopted / total) * 100).toFixed(2) + '%' : '0%',
        byDimension: byDimension.reduce((acc, item) => {
          acc[item.dimension] = item._count;
          return acc;
        }, {}),
        averageRating: avgRating._avg.rating || 0,
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
   * 验证章节访问权限
   */
  private async validateChapterAccess(userId: string, chapterId: string, novelId: string) {
    const chapter = await this.prisma.chapter.findFirst({
      where: {
        id: chapterId,
        novelId,
        novel: {
          userId,
        },
      },
    });

    if (!chapter) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: '章节不存在或无权访问',
          error: 'CHAPTER_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return chapter;
  }

  /**
   * 为小说生成建议（简单实现）
   */
  private async generateSuggestionsForNovel(
    novel: any,
    chapters: any[],
    dimensions: SuggestionDimension[],
    count: number,
  ): Promise<any[]> {
    const suggestions: any[] = [];

    // 基于维度生成建议
    for (const dimension of dimensions) {
      const dimensionSuggestions = await this.generateSuggestionsByDimension(
        novel,
        chapters,
        dimension,
      );
      suggestions.push(...dimensionSuggestions);

      if (suggestions.length >= count) {
        break;
      }
    }

    return suggestions.slice(0, count);
  }

  /**
   * 按维度生成建议
   */
  private async generateSuggestionsByDimension(
    novel: any,
    chapters: any[],
    dimension: SuggestionDimension,
  ): Promise<any[]> {
    const suggestions: any[] = [];

    switch (dimension) {
      case SuggestionDimension.PLOT:
        suggestions.push({
          dimension,
          title: '加强故事主线',
          content: '建议在当前章节中明确故事的核心冲突，增强主线的吸引力。可以考虑引入一个关键的转折点或揭示重要信息。',
          priority: 80,
          context: {
            分析范围: `前${chapters.length}章`,
            当前字数: novel.wordCount,
          },
        });
        break;

      case SuggestionDimension.CHARACTER:
        suggestions.push({
          dimension,
          title: '深化角色塑造',
          content: '主要角色的性格特征可以更加立体。建议通过具体的行为、对话和内心独白来展现角色的复杂性，避免脸谱化。',
          priority: 75,
          context: {
            建议章节: chapters.map(c => c.title).join('、'),
          },
        });
        break;

      case SuggestionDimension.PACING:
        suggestions.push({
          dimension,
          title: '调整叙事节奏',
          content: '当前章节的叙事节奏可能略显平缓。建议在关键情节点加快节奏，在情感场景适当放慢，形成张弛有度的节奏感。',
          priority: 70,
          context: {
            分析章节数: chapters.length,
          },
        });
        break;

      case SuggestionDimension.DIALOGUE:
        suggestions.push({
          dimension,
          title: '优化对话质量',
          content: '对话可以更加生动自然。建议每个角色的说话方式都要有各自的特点，避免所有角色用同一种语气说话。',
          priority: 65,
          context: {},
        });
        break;

      case SuggestionDimension.SCENE:
        suggestions.push({
          dimension,
          title: '丰富场景描写',
          content: '场景描写可以更具画面感。建议运用五感描写（视觉、听觉、触觉、嗅觉、味觉）来增强场景的真实性和代入感。',
          priority: 60,
          context: {},
        });
        break;

      default:
        suggestions.push({
          dimension,
          title: `${dimension}相关建议`,
          content: '建议关注这个维度的表现，可以进一步优化和提升。',
          priority: 50,
          context: {},
        });
    }

    return suggestions;
  }

  /**
   * 格式化建议数据
   */
  private formatSuggestion(suggestion: any) {
    return {
      id: suggestion.id,
      novelId: suggestion.novelId,
      chapterId: suggestion.chapterId,
      userId: suggestion.userId,
      suggestionType: suggestion.suggestionType,
      dimension: suggestion.dimension,
      title: suggestion.title,
      content: suggestion.content,
      priority: suggestion.priority,
      context: suggestion.context,
      aiModel: suggestion.aiModel,
      isAdopted: suggestion.isAdopted,
      adoptedAt: suggestion.adoptedAt,
      feedback: suggestion.feedback,
      rating: suggestion.rating,
      chapter: suggestion.chapter,
      createdAt: suggestion.createdAt,
      updatedAt: suggestion.updatedAt,
    };
  }
}

