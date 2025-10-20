import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '@app/database';

/**
 * 上下文请求参数
 */
export interface ContextRequest {
  userId: string;
  novelId: string;
  chapterId?: string;
  keywords?: string[];
  maxMemories?: number;
  maxChapters?: number;
  includeOutline?: boolean;
  includeCharacters?: boolean;
}

/**
 * 上下文响应
 */
export interface ContextResponse {
  novel: {
    title: string;
    description?: string;
    genre?: string;
  };
  outline?: {
    content: string;
  };
  characters?: Array<{
    name: string;
    description?: string;
    personality?: string;
  }>;
  memories?: Array<{
    title: string;
    content: string;
    relevance: number;
  }>;
  chapters?: Array<{
    title: string;
    content: string;
    summary?: string;
  }>;
  currentChapter?: {
    title: string;
    content: string;
  };
}

/**
 * 智能上下文管理服务
 * 负责自动提取和组织小说相关的上下文信息
 */
@Injectable()
export class ContextManagerService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取智能上下文
   */
  async getSmartContext(request: ContextRequest): Promise<ContextResponse> {
    // 1. 验证小说权限
    const novel = await this.prisma.novel.findFirst({
      where: {
        id: request.novelId,
        userId: request.userId,
      },
      include: {
        outline: true,
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

    const context: ContextResponse = {
      novel: {
        title: novel.title,
        description: novel.description || undefined,
        genre: novel.genre || undefined,
      },
    };

    // 2. 获取大纲（如果需要）
    if (request.includeOutline && novel.outline) {
      context.outline = {
        content: novel.outline.content,
      };
    }

    // 3. 获取角色信息（如果需要）
    if (request.includeCharacters) {
      context.characters = await this.getRelevantCharacters(
        request.novelId,
        request.keywords,
      );
    }

    // 4. 获取相关记忆
    if (request.maxMemories && request.maxMemories > 0) {
      context.memories = await this.getRelevantMemories(
        request.novelId,
        request.keywords,
        request.maxMemories,
      );
    }

    // 5. 获取相关章节
    if (request.maxChapters && request.maxChapters > 0) {
      context.chapters = await this.getRelevantChapters(
        request.novelId,
        request.chapterId,
        request.keywords,
        request.maxChapters,
      );
    }

    // 6. 获取当前章节（如果指定）
    if (request.chapterId) {
      context.currentChapter = await this.getCurrentChapter(
        request.chapterId,
        request.userId,
      );
    }

    return context;
  }

  /**
   * 获取相关角色
   */
  private async getRelevantCharacters(
    novelId: string,
    keywords?: string[],
  ): Promise<Array<{ name: string; description?: string; personality?: string }>> {
    const characters = await this.prisma.character.findMany({
      where: {
        novelId,
        isDeleted: false,
      },
      select: {
        name: true,
        description: true,
        personality: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: 10, // 最多返回10个角色
    });

    // 如果有关键词，进行相关性过滤
    if (keywords && keywords.length > 0) {
      return characters
        .map(char => ({
          ...char,
          relevance: this.calculateRelevance(
            char.name + ' ' + (char.description || ''),
            keywords,
          ),
        }))
        .filter(char => char.relevance > 0)
        .sort((a, b) => b.relevance - a.relevance)
        .map(({ relevance, ...char }) => char);
    }

    return characters;
  }

  /**
   * 获取相关记忆
   */
  private async getRelevantMemories(
    novelId: string,
    keywords?: string[],
    maxCount: number = 5,
  ): Promise<Array<{ title: string; content: string; relevance: number }>> {
    const memories = await this.prisma.memory.findMany({
      where: {
        novelId,
      },
      select: {
        title: true,
        content: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: maxCount * 3, // 获取更多，然后过滤
    });

    // 计算相关性
    const memoriesWithRelevance = memories.map(memory => ({
      ...memory,
      relevance: keywords && keywords.length > 0
        ? this.calculateRelevance(memory.title + ' ' + memory.content, keywords)
        : 1, // 如果没有关键词，使用最新的记忆
    }));

    // 排序并返回最相关的记忆
    return memoriesWithRelevance
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, maxCount);
  }

  /**
   * 获取相关章节
   */
  private async getRelevantChapters(
    novelId: string,
    currentChapterId?: string,
    keywords?: string[],
    maxCount: number = 3,
  ): Promise<Array<{ title: string; content: string; summary?: string }>> {
    // 如果指定了当前章节，获取前几章
    if (currentChapterId) {
      const currentChapter = await this.prisma.chapter.findUnique({
        where: { id: currentChapterId },
        select: { orderNum: true },
      });

      if (currentChapter) {
        const previousChapters = await this.prisma.chapter.findMany({
          where: {
            novelId,
            orderNum: {
              lt: currentChapter.orderNum,
            },
            isDeleted: false,
          },
          select: {
            title: true,
            content: true,
            summary: true,
          },
          orderBy: {
            orderNum: 'desc',
          },
          take: maxCount,
        });

        return previousChapters.reverse(); // 按顺序返回
      }
    }

    // 如果没有指定当前章节，获取最新的几章
    const recentChapters = await this.prisma.chapter.findMany({
      where: {
        novelId,
        isDeleted: false,
      },
      select: {
        title: true,
        content: true,
        summary: true,
      },
      orderBy: {
        orderNum: 'desc',
      },
      take: maxCount,
    });

    return recentChapters.reverse();
  }

  /**
   * 获取当前章节
   */
  private async getCurrentChapter(
    chapterId: string,
    userId: string,
  ): Promise<{ title: string; content: string } | undefined> {
    const chapter = await this.prisma.chapter.findFirst({
      where: {
        id: chapterId,
        novel: {
          userId,
        },
        isDeleted: false,
      },
      select: {
        title: true,
        content: true,
      },
    });

    if (!chapter) {
      return undefined;
    }

    return {
      title: chapter.title,
      content: chapter.content || '',
    };
  }

  /**
   * 计算相关性评分
   * 简单的关键词匹配算法
   */
  private calculateRelevance(text: string, keywords: string[]): number {
    if (!text || !keywords || keywords.length === 0) {
      return 0;
    }

    const lowerText = text.toLowerCase();
    let score = 0;

    for (const keyword of keywords) {
      const lowerKeyword = keyword.toLowerCase();
      const occurrences = (lowerText.match(new RegExp(lowerKeyword, 'g')) || []).length;
      score += occurrences;
    }

    return score;
  }

  /**
   * 构建上下文文本
   * 将上下文对象转换为适合AI的文本格式
   */
  formatContextForAI(context: ContextResponse): string {
    let text = '';

    // 小说基本信息
    text += `【小说信息】\n`;
    text += `标题：${context.novel.title}\n`;
    if (context.novel.description) {
      text += `简介：${context.novel.description}\n`;
    }
    if (context.novel.genre) {
      text += `类型：${context.novel.genre}\n`;
    }
    text += '\n';

    // 大纲
    if (context.outline) {
      text += `【故事大纲】\n${context.outline.content}\n\n`;
    }

    // 角色信息
    if (context.characters && context.characters.length > 0) {
      text += `【主要角色】\n`;
      for (const char of context.characters) {
        text += `- ${char.name}`;
        if (char.description) {
          text += `：${char.description}`;
        }
        if (char.personality) {
          text += `（性格：${char.personality}）`;
        }
        text += '\n';
      }
      text += '\n';
    }

    // 相关记忆
    if (context.memories && context.memories.length > 0) {
      text += `【相关设定】\n`;
      for (const memory of context.memories) {
        text += `- ${memory.title}：${memory.content}\n`;
      }
      text += '\n';
    }

    // 相关章节
    if (context.chapters && context.chapters.length > 0) {
      text += `【前文内容】\n`;
      for (const chapter of context.chapters) {
        text += `《${chapter.title}》\n`;
        if (chapter.summary) {
          text += `概要：${chapter.summary}\n`;
        } else {
          // 如果没有摘要，截取前200字作为概要
          const preview = chapter.content.slice(0, 200);
          text += `${preview}${chapter.content.length > 200 ? '...' : ''}\n`;
        }
        text += '\n';
      }
    }

    // 当前章节
    if (context.currentChapter) {
      text += `【当前章节】\n`;
      text += `《${context.currentChapter.title}》\n`;
      text += `${context.currentChapter.content}\n`;
    }

    return text;
  }
}

