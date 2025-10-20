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

  // ===== 素材分析功能 =====
  
  /**
   * 分析素材风格
   */
  async analyzeMaterialStyle(userId: string, materialId: string, analysisType: string) {
    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
    });

    if (!material || material.userId !== userId) {
      throw new HttpException('素材不存在或无权访问', HttpStatus.NOT_FOUND);
    }

    // 如果素材是文本类型，提取内容进行分析
    if (material.type === 'TEXT' || material.type === 'DOCUMENT') {
      // 这里应该调用AI服务进行分析
      // 目前返回基础分析结果
      return {
        success: true,
        data: {
          materialId,
          materialName: material.name,
          analysisType,
          features: {
            narrative: '叙事视角特征...',
            dialogue: '对话风格特征...',
            description: '描写风格特征...',
            pacing: '节奏特点...'
          },
          summary: '该素材采用第三人称全知视角，叙事节奏较快...',
          recommendations: [
            '适合用于快节奏的动作场景',
            '对话简洁有力，适合紧张场面',
          ]
        }
      };
    }

    throw new HttpException('只能分析文本类型的素材', HttpStatus.BAD_REQUEST);
  }

  /**
   * 检测内容相似度
   */
  async checkSimilarity(userId: string, materialId: string, content: string, threshold: number = 0.7) {
    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
    });

    if (!material || material.userId !== userId) {
      throw new HttpException('素材不存在或无权访问', HttpStatus.NOT_FOUND);
    }

    // 简单的相似度计算（实际应该使用更复杂的算法或调用AI服务）
    // 这里仅作示例
    const similarity = this.calculateSimpleSimilarity(content, material.fileUrl || '');

    return {
      success: true,
      data: {
        materialId,
        similarity,
        isSimilar: similarity > threshold,
        threshold,
        warning: similarity > threshold ? '内容与素材相似度较高，建议修改' : null,
      }
    };
  }

  /**
   * 简单的相似度计算（仅用于演示）
   */
  private calculateSimpleSimilarity(text1: string, text2: string): number {
    // 实际应该使用更复杂的算法，如余弦相似度、编辑距离等
    // 这里仅作简单示例
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * 搜索适用于向导步骤的素材
   */
  async searchWizardMaterials(userId: string, stepType: string, keyword?: string, limit: number = 5) {
    try {
      // 根据步骤类型映射到素材类别
      const categoryMap: { [key: string]: string[] } = {
        outline: ['大纲', '结构', '情节'],
        character: ['角色', '人物', '角色设定'],
        worldview: ['世界观', '设定', '背景'],
        scene: ['场景', '描写', '环境'],
        dialogue: ['对话', '台词']
      };

      const categories = categoryMap[stepType] || [];
      
      const where: any = { userId };
      
      // 优先搜索文本类型的素材
      where.type = 'TEXT';
      
      // 如果有关键词，添加搜索条件
      if (keyword) {
        where.OR = [
          { name: { contains: keyword } },
          { description: { contains: keyword } },
          { category: { in: categories } }
        ];
      } else if (categories.length > 0) {
        where.category = { in: categories };
      }

      const materials = await this.prisma.material.findMany({
        where,
        take: limit,
        orderBy: [
          { usageCount: 'desc' }, // 优先使用次数多的
          { createdAt: 'desc' }
        ],
        select: {
          id: true,
          name: true,
          type: true,
          category: true,
          description: true,
          tags: true,
          usageCount: true,
          createdAt: true,
        }
      });

      return {
        success: true,
        data: {
          stepType,
          materials,
          total: materials.length,
        }
      };
    } catch (error) {
      console.error('搜索向导素材失败:', error);
      return {
        success: true,
        data: {
          stepType,
          materials: [],
          total: 0,
        }
      };
    }
  }

  /**
   * 删除素材引用记录
   */
  async deleteMaterialReference(userId: string, referenceId: string) {
    const reference = await this.prisma.materialReference.findUnique({
      where: { id: referenceId },
      include: { material: true }
    });

    if (!reference) {
      throw new HttpException('引用记录不存在', HttpStatus.NOT_FOUND);
    }

    if (reference.userId !== userId) {
      throw new HttpException('无权删除此引用记录', HttpStatus.FORBIDDEN);
    }

    // 删除引用记录
    await this.prisma.materialReference.delete({
      where: { id: referenceId }
    });

    // 更新素材使用次数
    if (reference.material && reference.material.usageCount > 0) {
      await this.prisma.material.update({
        where: { id: reference.materialId },
        data: {
          usageCount: {
            decrement: 1
          }
        }
      });
    }

    return {
      success: true,
      message: '引用记录已删除'
    };
  }

  /**
   * 获取推荐素材
   */
  async getRecommendedMaterials(userId: string, limit: number = 10) {
    try {
      // 获取最近使用的素材类型和分类
      const recentReferences = await this.prisma.materialReference.findMany({
        where: { userId },
        take: 20,
        orderBy: { createdAt: 'desc' },
        select: { materialId: true }
      });

      const recentMaterialIds = recentReferences.map(r => r.materialId);
      
      // 如果有最近使用的素材，获取它们的信息
      let recommendedCategories: string[] = [];
      if (recentMaterialIds.length > 0) {
        const recentMaterials = await this.prisma.material.findMany({
          where: {
            id: { in: recentMaterialIds },
            userId
          },
          select: { category: true }
        });
        
        recommendedCategories = recentMaterials
          .map(m => m.category)
          .filter((c): c is string => c !== null);
      }

      // 基于最近使用推荐相似素材
      const materials = await this.prisma.material.findMany({
        where: {
          userId,
          id: { notIn: recentMaterialIds }, // 排除已使用的
          ...(recommendedCategories.length > 0 ? {
            category: { in: recommendedCategories }
          } : {})
        },
        take: limit,
        orderBy: { createdAt: 'desc' }
      });

      return {
        success: true,
        data: materials
      };
    } catch (error) {
      console.error('获取推荐素材失败:', error);
      return {
        success: true,
        data: []
      };
    }
  }
}
