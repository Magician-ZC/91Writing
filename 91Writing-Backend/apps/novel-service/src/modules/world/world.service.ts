import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { Prisma } from '@prisma/client';
import {
  CreateWorldSettingDto,
  UpdateWorldSettingDto,
  QueryWorldSettingsDto,
} from '../../dto/world.dto';

@Injectable()
export class WorldService {
  constructor(private readonly prisma: PrismaService) {}

  async createWorldSetting(userId: string, dto: CreateWorldSettingDto) {
    await this.validateNovelAccess(userId, dto.novelId);

    const setting = await this.prisma.worldSetting.create({
      data: {
        novelId: dto.novelId,
        category: dto.category,
        name: dto.name,
        description: dto.description,
        details: dto.details as Prisma.JsonObject | undefined,
        location: dto.location,
        coordinates: dto.coordinates as Prisma.JsonObject | undefined,
        leadership: dto.leadership,
        members: dto.members as Prisma.JsonObject | undefined,
        power: dto.power,
        tags: dto.tags as Prisma.JsonObject | undefined,
        references: dto.references as Prisma.JsonObject | undefined,
        customFields: dto.customFields as Prisma.JsonObject | undefined,
      },
    });

    return { success: true, data: setting };
  }

  async getWorldSettings(userId: string, novelId: string, query: QueryWorldSettingsDto) {
    await this.validateNovelAccess(userId, novelId);

    const where: Prisma.WorldSettingWhereInput = { novelId };
    if (query.category) where.category = query.category;
    if (query.keyword) {
      where.OR = [
        { name: { contains: query.keyword } },
        { description: { contains: query.keyword } },
      ];
    }

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const [settings, total] = await Promise.all([
      this.prisma.worldSetting.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.worldSetting.count({ where }),
    ]);

    return {
      success: true,
      data: {
        items: settings,
        pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
      },
    };
  }

  async getWorldSetting(userId: string, settingId: string) {
    const setting = await this.prisma.worldSetting.findUnique({
      where: { id: settingId },
      include: { novel: { select: { userId: true } } },
    });

    if (!setting || setting.novel.userId !== userId) {
      throw new HttpException('世界观设定不存在或无权访问', HttpStatus.NOT_FOUND);
    }

    return { success: true, data: setting };
  }

  async updateWorldSetting(userId: string, settingId: string, dto: UpdateWorldSettingDto) {
    const existing = await this.prisma.worldSetting.findUnique({
      where: { id: settingId },
      include: { novel: { select: { userId: true } } },
    });

    if (!existing || existing.novel.userId !== userId) {
      throw new HttpException('世界观设定不存在或无权访问', HttpStatus.NOT_FOUND);
    }

    const setting = await this.prisma.worldSetting.update({
      where: { id: settingId },
      data: {
        category: dto.category,
        name: dto.name,
        description: dto.description,
        details: dto.details as Prisma.JsonObject | undefined,
        location: dto.location,
        coordinates: dto.coordinates as Prisma.JsonObject | undefined,
        leadership: dto.leadership,
        members: dto.members as Prisma.JsonObject | undefined,
        power: dto.power,
        tags: dto.tags as Prisma.JsonObject | undefined,
        references: dto.references as Prisma.JsonObject | undefined,
        customFields: dto.customFields as Prisma.JsonObject | undefined,
      },
    });

    return { success: true, data: setting };
  }

  async deleteWorldSetting(userId: string, settingId: string) {
    const existing = await this.prisma.worldSetting.findUnique({
      where: { id: settingId },
      include: { novel: { select: { userId: true } } },
    });

    if (!existing || existing.novel.userId !== userId) {
      throw new HttpException('世界观设定不存在或无权访问', HttpStatus.NOT_FOUND);
    }

    await this.prisma.worldSetting.delete({ where: { id: settingId } });
    return { success: true, message: '世界观设定已删除' };
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

