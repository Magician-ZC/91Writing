import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import {
  CreateConsistencyProfileDto,
  UpdateConsistencyProfileDto,
  ConsistencyProfileResponseDto,
  AutoExtractConsistencyDto,
  CharacterProfileDto,
} from '../../dto/consistency.dto';

/**
 * 一致性管理服务
 * 
 * 负责管理小说的视觉一致性配置：
 * 1. 角色特征管理
 * 2. 环境场景管理
 * 3. 物品特征管理
 * 4. 自动特征提取
 */
@Injectable()
export class ConsistencyService {
  private readonly logger = new Logger(ConsistencyService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建一致性配置
   */
  async create(dto: CreateConsistencyProfileDto, userId: string): Promise<ConsistencyProfileResponseDto> {
    this.logger.log(`创建一致性配置，小说ID: ${dto.novelId}`);

    // 验证小说所有权
    const novel = await this.prisma.novel.findFirst({
      where: { id: dto.novelId, userId },
    });

    if (!novel) {
      throw new NotFoundException('小说不存在或无权访问');
    }

    // 检查是否已存在配置
    const existing = await this.prisma.consistencyProfile.findUnique({
      where: { novelId: dto.novelId },
    });

    if (existing) {
      throw new Error('该小说已存在一致性配置，请使用更新接口');
    }

    // 转换数据格式
    const charactersMap = this.convertCharactersToMap(dto.characters);
    const environmentsMap = this.convertEnvironmentsToMap(dto.environments || []);
    const objectsMap = this.convertObjectsToMap(dto.objects || []);

    // 创建配置
    const profile = await this.prisma.consistencyProfile.create({
      data: {
        novelId: dto.novelId,
        characters: charactersMap as any,
        environments: environmentsMap as any,
        objects: objectsMap as any,
        visualStyle: dto.visualStyle as any,
      },
    });

    return this.formatResponse(profile);
  }

  /**
   * 获取一致性配置
   */
  async findOne(novelId: string, userId: string): Promise<ConsistencyProfileResponseDto> {
    // 验证小说所有权
    const novel = await this.prisma.novel.findFirst({
      where: { id: novelId, userId },
    });

    if (!novel) {
      throw new NotFoundException('小说不存在或无权访问');
    }

    const profile = await this.prisma.consistencyProfile.findUnique({
      where: { novelId },
    });

    if (!profile) {
      throw new NotFoundException('一致性配置不存在');
    }

    return this.formatResponse(profile);
  }

  /**
   * 更新一致性配置
   */
  async update(
    novelId: string,
    dto: UpdateConsistencyProfileDto,
    userId: string,
  ): Promise<ConsistencyProfileResponseDto> {
    this.logger.log(`更新一致性配置，小说ID: ${novelId}`);

    // 验证小说所有权
    const novel = await this.prisma.novel.findFirst({
      where: { id: novelId, userId },
    });

    if (!novel) {
      throw new NotFoundException('小说不存在或无权访问');
    }

    // 获取现有配置
    const existing = await this.prisma.consistencyProfile.findUnique({
      where: { novelId },
    });

    if (!existing) {
      throw new NotFoundException('一致性配置不存在');
    }

    // 合并更新
    const updateData: any = {};

    if (dto.characters) {
      updateData.characters = this.convertCharactersToMap(dto.characters);
    }

    if (dto.environments) {
      updateData.environments = this.convertEnvironmentsToMap(dto.environments);
    }

    if (dto.objects) {
      updateData.objects = this.convertObjectsToMap(dto.objects);
    }

    if (dto.visualStyle) {
      updateData.visualStyle = dto.visualStyle;
    }

    updateData.version = existing.version + 1;

    const profile = await this.prisma.consistencyProfile.update({
      where: { novelId },
      data: updateData,
    });

    return this.formatResponse(profile);
  }

  /**
   * 自动提取一致性配置
   */
  async autoExtract(dto: AutoExtractConsistencyDto, userId: string): Promise<ConsistencyProfileResponseDto> {
    this.logger.log(`自动提取一致性配置，小说ID: ${dto.novelId}`);

    // 验证小说所有权
    const novel = await this.prisma.novel.findFirst({
      where: { id: dto.novelId, userId },
    });

    if (!novel) {
      throw new NotFoundException('小说不存在或无权访问');
    }

    // 获取指定范围的章节
    const chapters = await this.prisma.chapter.findMany({
      where: {
        novelId: dto.novelId,
        chapterNumber: {
          gte: dto.startChapter || 1,
          lte: dto.endChapter || 3,
        },
        isDeleted: false,
      },
      orderBy: { chapterNumber: 'asc' },
    });

    if (chapters.length === 0) {
      throw new NotFoundException('未找到可用的章节进行提取');
    }

    // 从章节内容中提取角色特征
    const characters = await this.extractCharactersFromChapters(chapters);

    // 检查是否已存在配置
    const existing = await this.prisma.consistencyProfile.findUnique({
      where: { novelId: dto.novelId },
    });

    const charactersMap = this.convertCharactersToMap(characters);

    if (existing) {
      // 更新现有配置
      if (dto.overwrite) {
        const profile = await this.prisma.consistencyProfile.update({
          where: { novelId: dto.novelId },
          data: {
            characters: charactersMap as any,
            version: existing.version + 1,
          },
        });
        return this.formatResponse(profile);
      } else {
        // 合并配置
        const mergedCharacters = {
          ...(existing.characters as any),
          ...charactersMap,
        };
        const profile = await this.prisma.consistencyProfile.update({
          where: { novelId: dto.novelId },
          data: {
            characters: mergedCharacters as any,
            version: existing.version + 1,
          },
        });
        return this.formatResponse(profile);
      }
    } else {
      // 创建新配置
      const profile = await this.prisma.consistencyProfile.create({
        data: {
          novelId: dto.novelId,
          characters: charactersMap as any,
          environments: {},
          objects: {},
          visualStyle: {
            overall: 'realistic',
            colorTone: 'natural',
            artStyle: 'cinematic',
            lighting: 'natural',
          },
        },
      });
      return this.formatResponse(profile);
    }
  }

  /**
   * 从章节中提取角色特征
   */
  private async extractCharactersFromChapters(chapters: any[]): Promise<CharacterProfileDto[]> {
    // 这里可以使用AI来分析章节内容，提取角色特征
    // 暂时返回一个简单的实现

    const characters: CharacterProfileDto[] = [];
    
    // TODO: 调用AI服务分析章节内容
    // 1. 识别出现的角色名称
    // 2. 提取角色外貌描述
    // 3. 提取关键词
    
    // 临时实现：从小说的characters表中获取
    const novelId = chapters[0].novelId;
    const novelCharacters = await this.prisma.character.findMany({
      where: { novelId },
      orderBy: { importance: 'desc' },
      take: 10, // 最多提取10个主要角色
    });

    for (const char of novelCharacters) {
      characters.push({
        name: char.name,
        baseAppearance: char.appearance || '默认外貌',
        dynamicState: {},
        keywords: this.extractKeywordsFromAppearance(char.appearance || ''),
        importance: char.importance,
        firstAppearance: 1,
      });
    }

    return characters;
  }

  /**
   * 从外貌描述中提取关键词
   */
  private extractKeywordsFromAppearance(appearance: string): string[] {
    // 简单的关键词提取
    const keywords: string[] = [];
    
    // 匹配常见特征词
    const patterns = [
      /黑发|白发|金发|红发|棕发/g,
      /蓝眼|绿眼|黑眼|棕眼/g,
      /高挑|矮小|魁梧|纤细/g,
      /长袍|盔甲|西装|便装/g,
    ];

    patterns.forEach(pattern => {
      const matches = appearance.match(pattern);
      if (matches) {
        keywords.push(...matches);
      }
    });

    return Array.from(new Set(keywords)); // 去重
  }

  /**
   * 转换角色列表为Map格式
   */
  private convertCharactersToMap(characters: CharacterProfileDto[]): Record<string, any> {
    const map: Record<string, any> = {};
    characters.forEach(char => {
      map[char.name] = {
        name: char.name,
        baseAppearance: char.baseAppearance,
        dynamicState: char.dynamicState || {},
        keywords: char.keywords,
        referenceImageUrl: char.referenceImageUrl,
        importance: char.importance,
        firstAppearance: char.firstAppearance,
      };
    });
    return map;
  }

  /**
   * 转换环境列表为Map格式
   */
  private convertEnvironmentsToMap(environments: any[]): Record<string, any> {
    const map: Record<string, any> = {};
    environments.forEach(env => {
      map[env.name] = {
        name: env.name,
        description: env.description,
        visualStyle: env.visualStyle,
        keywords: env.keywords,
        referenceImageUrl: env.referenceImageUrl,
      };
    });
    return map;
  }

  /**
   * 转换物品列表为Map格式
   */
  private convertObjectsToMap(objects: any[]): Record<string, any> {
    const map: Record<string, any> = {};
    objects.forEach(obj => {
      map[obj.name] = {
        name: obj.name,
        description: obj.description,
        appearance: obj.appearance,
        keywords: obj.keywords,
      };
    });
    return map;
  }

  /**
   * 格式化响应
   */
  private formatResponse(profile: any): ConsistencyProfileResponseDto {
    // 转换Map格式回数组格式
    const characters = Object.values(profile.characters || {});
    const environments = Object.values(profile.environments || {});
    const objects = Object.values(profile.objects || {});

    return {
      id: profile.id,
      novelId: profile.novelId,
      characters: characters as any,
      environments: environments as any,
      objects: objects as any,
      visualStyle: profile.visualStyle,
      version: profile.version,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}

