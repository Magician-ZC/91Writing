import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { Prisma } from '@prisma/client';
import {
  CreateCharacterDto,
  UpdateCharacterDto,
  QueryCharactersDto,
} from '../../dto/character.dto';

@Injectable()
export class CharacterService {
  constructor(private readonly prisma: PrismaService) {}

  async createCharacter(userId: string, dto: CreateCharacterDto) {
    await this.validateNovelAccess(userId, dto.novelId);

    const character = await this.prisma.character.create({
      data: {
        novelId: dto.novelId,
        name: dto.name,
        aliases: dto.aliases as Prisma.JsonArray | undefined,
        role: dto.role,
        importance: dto.importance || 50,
        age: dto.age,
        gender: dto.gender,
        occupation: dto.occupation,
        appearance: dto.appearance,
        personality: dto.personality,
        traits: dto.traits as Prisma.JsonArray | undefined,
        strengths: dto.strengths as Prisma.JsonArray | undefined,
        weaknesses: dto.weaknesses as Prisma.JsonArray | undefined,
        background: dto.background,
        motivation: dto.motivation,
        arc: dto.arc,
        abilities: dto.abilities as Prisma.JsonArray | undefined,
        equipment: dto.equipment as Prisma.JsonArray | undefined,
        customFields: dto.customFields as Prisma.JsonObject | undefined,
      },
    });

    return { success: true, data: character };
  }

  async getCharacters(userId: string, novelId: string, query: QueryCharactersDto) {
    await this.validateNovelAccess(userId, novelId);

    const where: Prisma.CharacterWhereInput = { novelId };
    if (query.role) where.role = query.role;
    if (query.minImportance !== undefined) where.importance = { gte: query.minImportance };
    if (query.keyword) {
      where.OR = [
        { name: { contains: query.keyword } },
      ];
    }

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const [characters, total] = await Promise.all([
      this.prisma.character.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ importance: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.character.count({ where }),
    ]);

    return {
      success: true,
      data: {
        items: characters,
        pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
      },
    };
  }

  async getCharacter(userId: string, characterId: string) {
    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
      include: { novel: { select: { userId: true } } },
    });

    if (!character || character.novel.userId !== userId) {
      throw new HttpException('角色不存在或无权访问', HttpStatus.NOT_FOUND);
    }

    return { success: true, data: character };
  }

  async updateCharacter(userId: string, characterId: string, dto: UpdateCharacterDto) {
    const existing = await this.prisma.character.findUnique({
      where: { id: characterId },
      include: { novel: { select: { userId: true } } },
    });

    if (!existing || existing.novel.userId !== userId) {
      throw new HttpException('角色不存在或无权访问', HttpStatus.NOT_FOUND);
    }

    const character = await this.prisma.character.update({
      where: { id: characterId },
      data: {
        name: dto.name,
        aliases: dto.aliases as Prisma.JsonArray | undefined,
        role: dto.role,
        importance: dto.importance,
        age: dto.age,
        gender: dto.gender,
        occupation: dto.occupation,
        appearance: dto.appearance,
        personality: dto.personality,
        traits: dto.traits as Prisma.JsonArray | undefined,
        strengths: dto.strengths as Prisma.JsonArray | undefined,
        weaknesses: dto.weaknesses as Prisma.JsonArray | undefined,
        background: dto.background,
        motivation: dto.motivation,
        arc: dto.arc,
        abilities: dto.abilities as Prisma.JsonArray | undefined,
        equipment: dto.equipment as Prisma.JsonArray | undefined,
        customFields: dto.customFields as Prisma.JsonObject | undefined,
      },
    });

    return { success: true, data: character };
  }

  async deleteCharacter(userId: string, characterId: string) {
    const existing = await this.prisma.character.findUnique({
      where: { id: characterId },
      include: { novel: { select: { userId: true } } },
    });

    if (!existing || existing.novel.userId !== userId) {
      throw new HttpException('角色不存在或无权访问', HttpStatus.NOT_FOUND);
    }

    await this.prisma.character.delete({ where: { id: characterId } });
    return { success: true, message: '角色已删除' };
  }

  private async validateNovelAccess(userId: string, novelId: string) {
    const novel = await this.prisma.novel.findFirst({
      where: { id: novelId, userId },
    });

    if (!novel) {
      throw new HttpException('小说不存在或无权访问', HttpStatus.NOT_FOUND);
    }

    return novel;
  }
}

