import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { CreatePromptDto, UpdatePromptDto, QueryPromptDto } from '../../dto/prompt.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PromptService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建提示词
   */
  async create(userId: string, dto: CreatePromptDto) {
    const prompt = await this.prisma.prompt.create({
      data: {
        userId,
        title: dto.title,
        content: dto.content,
        category: dto.category,
        tags: dto.tags || [],
        isPublic: dto.isPublic || false,
      },
    });

    return prompt;
  }

  /**
   * 查询提示词列表
   */
  async findAll(userId: string | null, query: QueryPromptDto) {
    const { category, keyword, publicOnly, page = 1, pageSize = 20 } = query;

    const where: Prisma.PromptWhereInput = {
      ...(publicOnly 
        ? { isPublic: true }
        : userId 
          ? {
              OR: [
                { userId },
                { isPublic: true }
              ]
            }
          : { isPublic: true }
      ),
      ...(category && { category }),
      ...(keyword && {
        OR: [
          { title: { contains: keyword } },
          { content: { contains: keyword } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.prompt.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [
          { rating: 'desc' },
          { usageCount: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          user: {
            select: {
              id: true,
              username: true,
              nickname: true
            }
          }
        }
      }),
      this.prisma.prompt.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取提示词详情
   */
  async findOne(id: string, userId?: string) {
    const prompt = await this.prisma.prompt.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            nickname: true
          }
        }
      }
    });

    if (!prompt) {
      throw new NotFoundException('提示词不存在');
    }

    // 检查访问权限
    if (!prompt.isPublic && prompt.userId !== userId) {
      throw new ForbiddenException('无权访问此提示词');
    }

    // 增加使用次数
    await this.prisma.prompt.update({
      where: { id },
      data: { usageCount: { increment: 1 } },
    });

    return prompt;
  }

  /**
   * 更新提示词
   */
  async update(id: string, userId: string, dto: UpdatePromptDto) {
    const prompt = await this.prisma.prompt.findUnique({
      where: { id },
    });

    if (!prompt) {
      throw new NotFoundException('提示词不存在');
    }

    if (prompt.userId !== userId) {
      throw new ForbiddenException('无权修改此提示词');
    }

    const updated = await this.prisma.prompt.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.content && { content: dto.content }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.tags !== undefined && { tags: dto.tags }),
        ...(dto.isPublic !== undefined && { isPublic: dto.isPublic }),
      },
    });

    return updated;
  }

  /**
   * 删除提示词
   */
  async remove(id: string, userId: string) {
    const prompt = await this.prisma.prompt.findUnique({
      where: { id },
    });

    if (!prompt) {
      throw new NotFoundException('提示词不存在');
    }

    if (prompt.userId !== userId) {
      throw new ForbiddenException('无权删除此提示词');
    }

    await this.prisma.prompt.delete({
      where: { id },
    });

    return { message: '删除成功' };
  }

  /**
   * 评分提示词
   */
  async rate(id: string, userId: string, rating: number) {
    const prompt = await this.prisma.prompt.findUnique({
      where: { id },
    });

    if (!prompt) {
      throw new NotFoundException('提示词不存在');
    }

    // 计算新的平均评分 (简化版本，实际应该记录每个用户的评分)
    const newRating = (Number(prompt.rating) * prompt.usageCount + rating) / (prompt.usageCount + 1);

    const updated = await this.prisma.prompt.update({
      where: { id },
      data: {
        rating: newRating,
        usageCount: { increment: 1 }
      },
    });

    return updated;
  }

  /**
   * 获取提示词分类列表
   */
  async getCategories(userId?: string) {
    const where: Prisma.PromptWhereInput = userId
      ? {
          OR: [
            { userId },
            { isPublic: true }
          ]
        }
      : { isPublic: true };

    const prompts = await this.prisma.prompt.findMany({
      where,
      select: { category: true },
      distinct: ['category'],
    });

    const categories = prompts
      .map((p) => p.category)
      .filter((c) => c !== null && c !== '');

    return categories;
  }

  /**
   * 获取提示词标签列表
   */
  async getTags(userId?: string) {
    const where: Prisma.PromptWhereInput = userId
      ? {
          OR: [
            { userId },
            { isPublic: true }
          ]
        }
      : { isPublic: true };

    const prompts = await this.prisma.prompt.findMany({
      where,
      select: { tags: true },
    });

    const tagsSet = new Set<string>();
    prompts.forEach((p) => {
      if (Array.isArray(p.tags)) {
        (p.tags as string[]).forEach((tag) => tagsSet.add(tag));
      }
    });

    return Array.from(tagsSet);
  }

  /**
   * 获取热门提示词
   */
  async getPopular(limit: number = 10) {
    const prompts = await this.prisma.prompt.findMany({
      where: { isPublic: true },
      take: limit,
      orderBy: [
        { rating: 'desc' },
        { usageCount: 'desc' }
      ],
      include: {
        user: {
          select: {
            id: true,
            username: true,
            nickname: true
          }
        }
      }
    });

    return prompts;
  }

  /**
   * 获取推荐提示词
   */
  async getRecommended(userId: string, limit: number = 10) {
    // 简化版推荐：基于用户最近使用的分类
    const userPrompts = await this.prisma.prompt.findMany({
      where: { userId },
      select: { category: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const userCategories = [...new Set(userPrompts.map(p => p.category).filter(Boolean))];

    if (userCategories.length === 0) {
      return this.getPopular(limit);
    }

    const recommended = await this.prisma.prompt.findMany({
      where: {
        isPublic: true,
        userId: { not: userId },
        category: { in: userCategories }
      },
      take: limit,
      orderBy: [
        { rating: 'desc' },
        { usageCount: 'desc' }
      ],
      include: {
        user: {
          select: {
            id: true,
            username: true,
            nickname: true
          }
        }
      }
    });

    return recommended;
  }
}
