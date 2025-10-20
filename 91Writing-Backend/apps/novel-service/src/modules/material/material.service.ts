import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { Prisma } from '@prisma/client';
import {
  CreateMaterialDto,
  UpdateMaterialDto,
  QueryMaterialsDto,
  BatchDeleteMaterialsDto,
  BatchUpdateCategoryDto,
  AddMaterialReferenceDto,
} from '../../dto/material.dto';

@Injectable()
export class MaterialService {
  constructor(private readonly prisma: PrismaService) {}

  async createMaterial(userId: string, dto: CreateMaterialDto) {
    const material = await this.prisma.material.create({
      data: {
        userId,
        name: dto.name,
        type: dto.type,
        category: dto.category,
        fileUrl: dto.fileUrl,
        fileSize: dto.fileSize,
        description: dto.description,
        tags: dto.tags as Prisma.JsonArray | undefined,
      },
    });

    // 更新存储配额
    await this.updateStorageQuota(userId, dto.fileSize || 0, 1);

    return { success: true, data: material };
  }

  async getMaterials(userId: string, query: QueryMaterialsDto) {
    try {
      const where: Prisma.MaterialWhereInput = { userId };
      
      if (query.type) where.type = query.type;
      if (query.category) where.category = query.category;
      if (query.keyword) {
        where.OR = [
          { name: { contains: query.keyword } },
          { description: { contains: query.keyword } },
        ];
      }
      // 注意：tags查询暂不支持，因为Prisma的JSON数组查询复杂
      // if (query.tags) {
      //   const tagArray = query.tags.split(',').map(t => t.trim());
      //   // JSON数组查询需要特殊处理
      // }

      const page = query.page || 1;
      const pageSize = query.pageSize || 20;
      const skip = (page - 1) * pageSize;

      const [materials, total] = await Promise.all([
        this.prisma.material.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.material.count({ where }),
      ]);

      return {
        success: true,
        data: {
          items: materials,
          pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
        },
      };
    } catch (error) {
      console.error('获取素材列表失败:', error);
      throw new HttpException(
        `获取素材列表失败: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getMaterial(userId: string, materialId: string) {
    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
    });

    if (!material || material.userId !== userId) {
      throw new HttpException('素材不存在或无权访问', HttpStatus.NOT_FOUND);
    }

    return { success: true, data: material };
  }

  async updateMaterial(userId: string, materialId: string, dto: UpdateMaterialDto) {
    const existing = await this.prisma.material.findUnique({
      where: { id: materialId },
    });

    if (!existing || existing.userId !== userId) {
      throw new HttpException('素材不存在或无权访问', HttpStatus.NOT_FOUND);
    }

    const material = await this.prisma.material.update({
      where: { id: materialId },
      data: {
        name: dto.name,
        type: dto.type,
        category: dto.category,
        fileUrl: dto.fileUrl,
        fileSize: dto.fileSize,
        description: dto.description,
        tags: dto.tags as Prisma.JsonArray | undefined,
      },
    });

    return { success: true, data: material };
  }

  async deleteMaterial(userId: string, materialId: string) {
    const existing = await this.prisma.material.findUnique({
      where: { id: materialId },
    });

    if (!existing || existing.userId !== userId) {
      throw new HttpException('素材不存在或无权访问', HttpStatus.NOT_FOUND);
    }

    await this.prisma.material.delete({ where: { id: materialId } });

    // 更新存储配额
    await this.updateStorageQuota(userId, -(existing.fileSize || 0), -1);

    return { success: true, message: '素材已删除' };
  }

  async getMaterialStats(userId: string) {
    try {
      const [total, byType, totalSize] = await Promise.all([
        this.prisma.material.count({ where: { userId } }),
        this.prisma.material.groupBy({
          by: ['type'],
          where: { userId },
          _count: true,
        }),
        this.prisma.material.aggregate({
          where: { userId },
          _sum: { fileSize: true },
        }),
      ]);

      return {
        success: true,
        data: {
          total,
          byType: byType.map(item => ({
            type: item.type,
            count: item._count,
          })),
          totalSize: totalSize._sum.fileSize || 0,
        },
      };
    } catch (error) {
      console.error('获取素材统计失败:', error);
      return {
        success: true,
        data: {
          total: 0,
          byType: [],
          totalSize: 0,
        },
      };
    }
  }

  /**
   * 获取素材分类列表
   */
  async getMaterialCategories(userId: string) {
    try {
      const materials = await this.prisma.material.findMany({
        where: { userId },
        select: { category: true },
        distinct: ['category'],
      });

      const categories = materials
        .map(m => m.category)
        .filter(c => c && c.trim() !== '')
        .sort();

      return {
        success: true,
        data: categories,
      };
    } catch (error) {
      console.error('获取素材分类失败:', error);
      return {
        success: true,
        data: [],
      };
    }
  }

  /**
   * 获取素材标签列表
   */
  async getMaterialTags(userId: string) {
    try {
      const materials = await this.prisma.material.findMany({
        where: { userId },
        select: { tags: true },
      });

      const tagsSet = new Set<string>();
      materials.forEach(m => {
        if (m.tags) {
          const tagArray = Array.isArray(m.tags) ? m.tags : [];
          tagArray.forEach((tag: any) => {
            if (tag && typeof tag === 'string' && tag.trim() !== '') {
              tagsSet.add(tag);
            }
          });
        }
      });

      const tags = Array.from(tagsSet).sort();

      return {
        success: true,
        data: tags,
      };
    } catch (error) {
      console.error('获取素材标签失败:', error);
      return {
        success: true,
        data: [],
      };
    }
  }

  // ===== 批量操作 =====
  async batchDeleteMaterials(userId: string, dto: BatchDeleteMaterialsDto) {
    // 验证所有素材都属于当前用户
    const materials = await this.prisma.material.findMany({
      where: {
        id: { in: dto.materialIds },
        userId,
      },
    });

    if (materials.length !== dto.materialIds.length) {
      throw new HttpException('部分素材不存在或无权访问', HttpStatus.BAD_REQUEST);
    }

    // 批量删除
    const result = await this.prisma.material.deleteMany({
      where: {
        id: { in: dto.materialIds },
        userId,
      },
    });

    // 更新存储配额
    const totalSize = materials.reduce((sum, m) => sum + (m.fileSize || 0), 0);
    await this.updateStorageQuota(userId, -totalSize, -materials.length);

    return {
      success: true,
      message: `成功删除${result.count}个素材`,
      data: { deletedCount: result.count },
    };
  }

  async batchUpdateCategory(userId: string, dto: BatchUpdateCategoryDto) {
    // 验证所有素材都属于当前用户
    const count = await this.prisma.material.count({
      where: {
        id: { in: dto.materialIds },
        userId,
      },
    });

    if (count !== dto.materialIds.length) {
      throw new HttpException('部分素材不存在或无权访问', HttpStatus.BAD_REQUEST);
    }

    // 批量更新分类
    const result = await this.prisma.material.updateMany({
      where: {
        id: { in: dto.materialIds },
        userId,
      },
      data: {
        category: dto.category,
      },
    });

    return {
      success: true,
      message: `成功更新${result.count}个素材的分类`,
      data: { updatedCount: result.count },
    };
  }

  // ===== 素材引用追踪 =====
  async addMaterialReference(userId: string, materialId: string, dto: AddMaterialReferenceDto) {
    // 验证素材存在且属于当前用户
    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
    });

    if (!material || material.userId !== userId) {
      throw new HttpException('素材不存在或无权访问', HttpStatus.NOT_FOUND);
    }

    // 创建引用记录
    const reference = await this.prisma.materialReference.create({
      data: {
        materialId,
        chapterId: dto.chapterId,
        novelId: dto.novelId,
        userId,
        context: dto.context,
        position: dto.position,
      },
    });

    // 更新素材使用次数
    await this.prisma.material.update({
      where: { id: materialId },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    });

    return { success: true, data: reference };
  }

  async getMaterialReferences(userId: string, materialId: string) {
    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
    });

    if (!material || material.userId !== userId) {
      throw new HttpException('素材不存在或无权访问', HttpStatus.NOT_FOUND);
    }

    const references = await this.prisma.materialReference.findMany({
      where: { materialId, userId },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: references };
  }

  async deleteMaterialReference(userId: string, referenceId: string) {
    const reference = await this.prisma.materialReference.findUnique({
      where: { id: referenceId },
    });

    if (!reference || reference.userId !== userId) {
      throw new HttpException('引用记录不存在或无权访问', HttpStatus.NOT_FOUND);
    }

    await this.prisma.materialReference.delete({
      where: { id: referenceId },
    });

    // 减少素材使用次数
    await this.prisma.material.update({
      where: { id: reference.materialId },
      data: {
        usageCount: {
          decrement: 1,
        },
      },
    });

    return { success: true, message: '引用记录已删除' };
  }

  // ===== 存储配额管理 =====
  async getStorageQuota(userId: string) {
    let quota = await this.prisma.userStorageQuota.findUnique({
      where: { userId },
    });

    // 如果不存在，创建默认配额
    if (!quota) {
      quota = await this.prisma.userStorageQuota.create({
        data: {
          userId,
          totalQuota: 1073741824, // 1GB
          usedSpace: 0,
          materialCount: 0,
        },
      });
    }

    // 实时计算当前使用量
    const stats = await this.prisma.material.aggregate({
      where: { userId },
      _sum: { fileSize: true },
      _count: true,
    });

    const actualUsedSpace = BigInt(stats._sum.fileSize || 0);
    const actualMaterialCount = stats._count;

    // 更新配额记录
    if (quota.usedSpace !== actualUsedSpace || quota.materialCount !== actualMaterialCount) {
      quota = await this.prisma.userStorageQuota.update({
        where: { userId },
        data: {
          usedSpace: actualUsedSpace,
          materialCount: actualMaterialCount,
        },
      });
    }

    return {
      success: true,
      data: {
        ...quota,
        usagePercentage: ((Number(quota.usedSpace) / Number(quota.totalQuota)) * 100).toFixed(2),
        remainingSpace: Number(quota.totalQuota) - Number(quota.usedSpace),
      },
    };
  }

  private async updateStorageQuota(userId: string, sizeDelta: number, countDelta: number) {
    const quota = await this.prisma.userStorageQuota.findUnique({
      where: { userId },
    });

    if (!quota) {
      await this.prisma.userStorageQuota.create({
        data: {
          userId,
          usedSpace: Math.max(0, sizeDelta),
          materialCount: Math.max(0, countDelta),
        },
      });
    } else {
      await this.prisma.userStorageQuota.update({
        where: { userId },
        data: {
          usedSpace: Math.max(0, Number(quota.usedSpace) + sizeDelta),
          materialCount: Math.max(0, quota.materialCount + countDelta),
        },
      });
    }
  }
}
