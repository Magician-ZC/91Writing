import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { CreateMemoryDto } from '../../dto/create-memory.dto';
import { MemoryType } from '@prisma/client';

@Injectable()
export class MemoryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建记忆
   */
  async create(novelId: string, userId: string, createMemoryDto: CreateMemoryDto) {
    // 验证小说权限
    const novel = await this.prisma.novel.findFirst({
      where: { id: novelId, userId },
    });

    if (!novel) {
      throw new NotFoundException('小说不存在或无权访问');
    }

    const memory = await this.prisma.novelMemory.create({
      data: {
        novelId,
        ...createMemoryDto,
      },
    });

    return memory;
  }

  /**
   * 获取小说的记忆列表
   */
  async findAll(novelId: string, userId: string, options?: {
    memoryType?: MemoryType;
    limit?: number;
    orderBy?: 'importance' | 'created' | 'updated';
  }) {
    // 验证权限
    const novel = await this.prisma.novel.findFirst({
      where: { id: novelId, userId },
    });

    if (!novel) {
      throw new NotFoundException('小说不存在或无权访问');
    }

    const { memoryType, limit = 50, orderBy = 'importance' } = options || {};
    
    const where: any = { novelId };
    if (memoryType) where.memoryType = memoryType;

    let orderByClause: any;
    switch (orderBy) {
      case 'importance':
        orderByClause = { importance: 'desc' };
        break;
      case 'created':
        orderByClause = { createdAt: 'desc' };
        break;
      case 'updated':
        orderByClause = { updatedAt: 'desc' };
        break;
      default:
        orderByClause = { importance: 'desc' };
    }

    const memories = await this.prisma.novelMemory.findMany({
      where,
      orderBy: orderByClause,
      take: limit,
    });

    return memories;
  }

  /**
   * 获取单个记忆
   */
  async findOne(id: string, userId: string) {
    const memory = await this.prisma.novelMemory.findFirst({
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

    if (!memory) {
      throw new NotFoundException('记忆不存在或无权访问');
    }

    return memory;
  }

  /**
   * 更新记忆
   */
  async update(id: string, userId: string, updateData: Partial<CreateMemoryDto>) {
    // 验证权限
    const memory = await this.prisma.novelMemory.findFirst({
      where: {
        id,
        novel: { userId },
      },
    });

    if (!memory) {
      throw new NotFoundException('记忆不存在或无权访问');
    }

    const updatedMemory = await this.prisma.novelMemory.update({
      where: { id },
      data: updateData,
    });

    return updatedMemory;
  }

  /**
   * 删除记忆
   */
  async remove(id: string, userId: string) {
    // 验证权限
    const memory = await this.prisma.novelMemory.findFirst({
      where: {
        id,
        novel: { userId },
      },
    });

    if (!memory) {
      throw new NotFoundException('记忆不存在或无权访问');
    }

    await this.prisma.novelMemory.delete({
      where: { id },
    });

    return { message: '记忆已删除' };
  }

  /**
   * 初始化小说记忆结构
   */
  async initializeNovelMemory(novelId: string, userId: string, basicInfo: any = {}) {
    // 验证权限
    const novel = await this.prisma.novel.findFirst({
      where: { id: novelId, userId },
    });

    if (!novel) {
      throw new NotFoundException('小说不存在或无权访问');
    }

    // 检查是否已经初始化
    const existingMemories = await this.prisma.novelMemory.findMany({
      where: { novelId },
    });

    if (existingMemories.length > 0) {
      throw new BadRequestException('记忆系统已经初始化');
    }

    // 创建基础记忆结构
    const coreMemory = {
      // 基本信息
      novelId,
      title: basicInfo.title || novel.title,
      genre: basicInfo.genre || novel.genre || '',
      theme: basicInfo.theme || '',
      intro: basicInfo.intro || novel.description || '',
      
      // 核心设定层
      coreMemory: {
        characters: [],
        worldSetting: {
          worldType: '',
          coreRules: [],
          powerSystem: '',
          socialStructure: ''
        },
        mainPlot: {
          premise: '',
          mainConflict: '',
          plotPoints: [],
          currentArc: ''
        }
      },
      
      // 元数据
      version: '1.0'
    };

    // 创建核心记忆
    await this.prisma.novelMemory.create({
      data: {
        novelId,
        memoryType: MemoryType.CORE,
        content: coreMemory,
        importance: 1.0,
        chapterRange: 'all',
      },
    });

    // 创建初始上下文管理记忆
    const contextMemory = {
      recentChapters: [],
      currentChapterContext: {},
      relevantHistory: [],
      tokenBudget: {
        total: 3000,
        used: 0,
        remaining: 3000
      }
    };

    await this.prisma.novelMemory.create({
      data: {
        novelId,
        memoryType: MemoryType.CONTEXT,
        content: contextMemory,
        importance: 0.8,
      },
    });

    return { message: '记忆系统初始化完成' };
  }

  /**
   * 获取生成上下文（用于AI生成）
   */
  async getGenerationContext(novelId: string, userId: string, options: {
    maxTokens?: number;
    chapterContext?: string;
    includeTypes?: MemoryType[];
  } = {}) {
    // 验证权限
    const novel = await this.prisma.novel.findFirst({
      where: { id: novelId, userId },
    });

    if (!novel) {
      throw new NotFoundException('小说不存在或无权访问');
    }

    const { maxTokens = 2000, includeTypes = [MemoryType.CORE, MemoryType.SUMMARY, MemoryType.CONTEXT] } = options;

    // 获取相关记忆
    const memories = await this.prisma.novelMemory.findMany({
      where: {
        novelId,
        memoryType: { in: includeTypes },
      },
      orderBy: { importance: 'desc' },
      take: 20, // 最多20个记忆项
    });

    // 构建格式化上下文
    let formattedContext = '';
    let usedTokens = 0;

    for (const memory of memories) {
      const memoryText = this.formatMemoryForContext(memory);
      const estimatedTokens = this.estimateTokens(memoryText);

      if (usedTokens + estimatedTokens <= maxTokens) {
        formattedContext += memoryText + '\n\n';
        usedTokens += estimatedTokens;
      } else {
        break;
      }
    }

    return {
      formattedContext,
      usedTokens,
      memoryCount: memories.length,
      novelInfo: {
        id: novel.id,
        title: novel.title,
        genre: novel.genre,
        wordCount: novel.wordCount,
        chapterCount: novel.chapterCount,
      },
    };
  }

  /**
   * 更新章节摘要
   */
  async updateChapterSummary(novelId: string, userId: string, chapterNumber: number, summary: string, keyEvents: string[] = []) {
    // 验证权限
    const novel = await this.prisma.novel.findFirst({
      where: { id: novelId, userId },
    });

    if (!novel) {
      throw new NotFoundException('小说不存在或无权访问');
    }

    // 查找或创建章节摘要记忆
    let summaryMemory = await this.prisma.novelMemory.findFirst({
      where: {
        novelId,
        memoryType: MemoryType.SUMMARY,
        chapterRange: chapterNumber.toString(),
      },
    });

    const summaryContent = {
      chapterNumber,
      summary,
      keyEvents,
      wordCount: this.estimateTokens(summary),
      updatedAt: new Date().toISOString(),
    };

    if (summaryMemory) {
      // 更新现有摘要
      summaryMemory = await this.prisma.novelMemory.update({
        where: { id: summaryMemory.id },
        data: {
          content: summaryContent,
          tokenCost: this.estimateTokens(summary),
          importance: this.calculateSummaryImportance(chapterNumber, keyEvents),
        },
      });
    } else {
      // 创建新摘要
      summaryMemory = await this.prisma.novelMemory.create({
        data: {
          novelId,
          memoryType: MemoryType.SUMMARY,
          content: summaryContent,
          chapterRange: chapterNumber.toString(),
          tokenCost: this.estimateTokens(summary),
          importance: this.calculateSummaryImportance(chapterNumber, keyEvents),
        },
      });
    }

    return summaryMemory;
  }

  /**
   * 批量删除记忆
   */
  async removeMany(novelId: string, userId: string, memoryIds: string[]) {
    // 验证权限
    const novel = await this.prisma.novel.findFirst({
      where: { id: novelId, userId },
    });

    if (!novel) {
      throw new NotFoundException('小说不存在或无权访问');
    }

    const result = await this.prisma.novelMemory.deleteMany({
      where: {
        id: { in: memoryIds },
        novelId,
      },
    });

    return {
      deleted: result.count,
      message: `已删除${result.count}个记忆项`,
    };
  }

  /**
   * 清理过期或低重要度记忆
   */
  async cleanupMemories(novelId: string, userId: string, options: {
    minImportance?: number;
    maxAge?: number; // 天数
    preserveCore?: boolean;
  } = {}) {
    // 验证权限
    const novel = await this.prisma.novel.findFirst({
      where: { id: novelId, userId },
    });

    if (!novel) {
      throw new NotFoundException('小说不存在或无权访问');
    }

    const { minImportance = 0.1, maxAge = 30, preserveCore = true } = options;
    
    const where: any = { novelId };
    
    // 构建删除条件
    const conditions = [];
    
    if (minImportance > 0) {
      conditions.push({ importance: { lt: minImportance } });
    }
    
    if (maxAge > 0) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAge);
      conditions.push({ createdAt: { lt: cutoffDate } });
    }
    
    if (preserveCore) {
      where.memoryType = { not: MemoryType.CORE };
    }
    
    if (conditions.length > 0) {
      where.OR = conditions;
    }

    const result = await this.prisma.novelMemory.deleteMany({ where });

    return {
      cleaned: result.count,
      message: `已清理${result.count}个记忆项`,
    };
  }

  /**
   * 格式化记忆用于上下文生成
   */
  private formatMemoryForContext(memory: any): string {
    let formatted = `[${memory.memoryType}记忆]`;
    
    if (memory.chapterRange) {
      formatted += ` (章节${memory.chapterRange})`;
    }
    
    formatted += '\n';
    
    try {
      const content = memory.content;
      
      switch (memory.memoryType) {
        case MemoryType.CORE:
          if (content.coreMemory) {
            if (content.coreMemory.characters && content.coreMemory.characters.length > 0) {
              formatted += '主要角色：\n';
              content.coreMemory.characters.forEach((char: any) => {
                formatted += `- ${char.name}：${char.keyTraits?.join('、') || ''}\n`;
              });
            }
            
            if (content.coreMemory.mainPlot) {
              formatted += `主线情节：${content.coreMemory.mainPlot.premise || ''}\n`;
            }
            
            if (content.coreMemory.worldSetting?.coreRules?.length > 0) {
              formatted += `世界规则：${content.coreMemory.worldSetting.coreRules.join('；')}\n`;
            }
          }
          break;
          
        case MemoryType.SUMMARY:
          if (content.summary) {
            formatted += `摘要：${content.summary}\n`;
          }
          if (content.keyEvents && content.keyEvents.length > 0) {
            formatted += `关键事件：${content.keyEvents.join('；')}\n`;
          }
          break;
          
        case MemoryType.CONTEXT:
          if (content.recentChapters && content.recentChapters.length > 0) {
            formatted += '近期章节：\n';
            content.recentChapters.forEach((chapter: any) => {
              formatted += `- 第${chapter.chapterNumber}章：${chapter.summary || ''}\n`;
            });
          }
          break;
          
        default:
          formatted += JSON.stringify(content, null, 2);
      }
    } catch (error) {
      formatted += '记忆格式错误';
    }
    
    return formatted;
  }

  /**
   * 估算Token数量
   */
  private estimateTokens(text: string): number {
    if (!text || typeof text !== 'string') return 0;
    
    // 移除HTML标签
    const cleanText = text.replace(/<[^>]*>/g, '');
    
    // 中文字符计算
    const chineseChars = (cleanText.match(/[\u4e00-\u9fff]/g) || []).length;
    const otherChars = cleanText.length - chineseChars;
    
    // 中文字符按0.75个token计算，其他字符按4个字符1个token计算
    return Math.ceil(chineseChars * 0.75 + otherChars / 4);
  }

  /**
   * 计算摘要重要度
   */
  private calculateSummaryImportance(chapterNumber: number, keyEvents: string[]): number {
    let importance = 0.5; // 基础重要度
    
    // 早期章节更重要
    if (chapterNumber <= 3) importance += 0.2;
    else if (chapterNumber <= 10) importance += 0.1;
    
    // 关键事件数量影响重要度
    importance += Math.min(0.3, keyEvents.length * 0.05);
    
    return Math.min(1.0, importance);
  }
}
