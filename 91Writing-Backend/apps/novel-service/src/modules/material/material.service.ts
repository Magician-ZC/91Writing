import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { CreateMaterialDto, UpdateMaterialDto, QueryMaterialDto } from '../../dto/material.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class MaterialService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建素材
   */
  async create(userId: string, dto: CreateMaterialDto) {
    const material = await this.prisma.material.create({
      data: {
        userId,
        name: dto.name,
        type: dto.type,
        category: dto.category,
        fileUrl: dto.fileUrl,
        fileSize: dto.fileSize,
        description: dto.description,
        tags: dto.tags || [],
      },
    });

    return material;
  }

  /**
   * 查询用户素材列表
   */
  async findAll(userId: string, query: QueryMaterialDto) {
    const { type, category, keyword, tags, page = 1, pageSize = 20 } = query;

    const where: Prisma.MaterialWhereInput = {
      userId,
      ...(type && { type }),
      ...(category && { category }),
      ...(keyword && {
        OR: [
          { name: { contains: keyword } },
          { description: { contains: keyword } },
        ],
      }),
    };

    // 先查询数据
    const [allItems, total] = await Promise.all([
      this.prisma.material.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize * 2, // 获取更多数据用于过滤
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.material.count({ where }),
    ]);

    // 如果有tags筛选，在内存中过滤
    let items = allItems;
    let filteredTotal = total;
    
    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim());
      items = allItems.filter(item => {
        if (!item.tags || !Array.isArray(item.tags)) return false;
        return tagArray.some(tag => (item.tags as string[]).includes(tag));
      });
      // 限制返回数量
      items = items.slice(0, pageSize);
      filteredTotal = items.length;
    }

    return {
      items,
      total: filteredTotal,
      page,
      pageSize,
      totalPages: Math.ceil(filteredTotal / pageSize),
    };
  }

  /**
   * 获取素材详情
   */
  async findOne(userId: string, id: string) {
    const material = await this.prisma.material.findUnique({
      where: { id },
    });

    if (!material) {
      throw new NotFoundException('素材不存在');
    }

    if (material.userId !== userId) {
      throw new ForbiddenException('无权访问此素材');
    }

    // 增加使用次数
    await this.prisma.material.update({
      where: { id },
      data: { usageCount: { increment: 1 } },
    });

    return material;
  }

  /**
   * 更新素材
   */
  async update(userId: string, id: string, dto: UpdateMaterialDto) {
    const material = await this.prisma.material.findUnique({
      where: { id },
    });

    if (!material) {
      throw new NotFoundException('素材不存在');
    }

    if (material.userId !== userId) {
      throw new ForbiddenException('无权修改此素材');
    }

    const updated = await this.prisma.material.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.tags !== undefined && { tags: dto.tags }),
      },
    });

    return updated;
  }

  /**
   * 删除素材
   */
  async remove(userId: string, id: string) {
    const material = await this.prisma.material.findUnique({
      where: { id },
    });

    if (!material) {
      throw new NotFoundException('素材不存在');
    }

    if (material.userId !== userId) {
      throw new ForbiddenException('无权删除此素材');
    }

    await this.prisma.material.delete({
      where: { id },
    });

    return { message: '删除成功' };
  }

  /**
   * 获取素材分类列表
   */
  async getCategories(userId: string) {
    const materials = await this.prisma.material.findMany({
      where: { userId },
      select: { category: true },
      distinct: ['category'],
    });

    const categories = materials
      .map((m) => m.category)
      .filter((c) => c !== null && c !== '');

    return categories;
  }

  /**
   * 获取素材标签列表
   */
  async getTags(userId: string) {
    const materials = await this.prisma.material.findMany({
      where: { userId },
      select: { tags: true },
    });

    const tagsSet = new Set<string>();
    materials.forEach((m) => {
      if (Array.isArray(m.tags)) {
        (m.tags as string[]).forEach((tag) => tagsSet.add(tag));
      }
    });

    return Array.from(tagsSet);
  }

  /**
   * 获取素材统计信息
   */
  async getStats(userId: string) {
    const stats = await this.prisma.material.groupBy({
      by: ['type'],
      where: { userId },
      _count: { id: true },
      _sum: { fileSize: true },
    });

    const total = await this.prisma.material.count({ where: { userId } });

    return {
      total,
      byType: stats.map((s) => ({
        type: s.type,
        count: s._count.id,
        totalSize: s._sum.fileSize || 0,
      })),
    };
  }
}
