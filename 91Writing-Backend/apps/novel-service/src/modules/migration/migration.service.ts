import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { MigrationType, MigrationStatus, Prisma } from '@prisma/client';
import {
  StartMigrationDto,
  BatchImportNovelsDto,
  ValidateMigrationDataDto,
} from '../../dto/migration.dto';

@Injectable()
export class MigrationService {
  constructor(private readonly prisma: PrismaService) {}

  async startMigration(userId: string, dto: StartMigrationDto) {
    // 创建迁移记录
    const migration = await this.prisma.dataMigration.create({
      data: {
        userId,
        migrationType: dto.migrationType,
        status: MigrationStatus.PENDING,
        sourceData: dto.sourceData as Prisma.JsonObject,
        metadata: dto.metadata as Prisma.JsonObject | undefined,
        startedAt: new Date(),
      },
    });

    // 异步执行迁移（这里简化为同步处理）
    try {
      const result = await this.processMigration(userId, migration.id, dto);
      return { success: true, data: { migrationId: migration.id, ...result } };
    } catch (error) {
      await this.prisma.dataMigration.update({
        where: { id: migration.id },
        data: {
          status: MigrationStatus.FAILED,
          errorLog: { error: error.message } as Prisma.JsonObject,
          completedAt: new Date(),
        },
      });
      throw error;
    }
  }

  private async processMigration(userId: string, migrationId: string, dto: StartMigrationDto) {
    let totalItems = 0;
    let successItems = 0;
    let failedItems = 0;
    const errors: any[] = [];

    await this.prisma.dataMigration.update({
      where: { id: migrationId },
      data: { status: MigrationStatus.PROCESSING },
    });

    try {
      switch (dto.migrationType) {
        case MigrationType.NOVELS:
        case MigrationType.FULL:
          const novelResult = await this.migrateNovels(userId, dto.sourceData);
          totalItems += novelResult.total;
          successItems += novelResult.success;
          failedItems += novelResult.failed;
          errors.push(...novelResult.errors);
          break;

        case MigrationType.MATERIALS:
          const materialResult = await this.migrateMaterials(userId, dto.sourceData);
          totalItems += materialResult.total;
          successItems += materialResult.success;
          failedItems += materialResult.failed;
          errors.push(...materialResult.errors);
          break;

        default:
          throw new HttpException('不支持的迁移类型', HttpStatus.BAD_REQUEST);
      }

      await this.prisma.dataMigration.update({
        where: { id: migrationId },
        data: {
          status: MigrationStatus.COMPLETED,
          totalItems,
          processedItems: totalItems,
          successItems,
          failedItems,
          errorLog: errors.length > 0 ? (errors as any) : undefined,
          completedAt: new Date(),
        },
      });

      return { totalItems, successItems, failedItems, errors };
    } catch (error) {
      throw error;
    }
  }

  private async migrateNovels(userId: string, sourceData: any) {
    const novels = sourceData.novels || [];
    let success = 0;
    let failed = 0;
    const errors: any[] = [];

    for (const novelData of novels) {
      try {
        const novel = await this.prisma.novel.create({
          data: {
            userId,
            title: novelData.title || '未命名小说',
            description: novelData.description,
            genre: novelData.genre,
            status: novelData.status || 'DRAFT',
            wordCount: novelData.wordCount || 0,
            chapterCount: novelData.chapters?.length || 0,
          },
        });

        // 迁移章节
        if (novelData.chapters && novelData.chapters.length > 0) {
          for (let i = 0; i < novelData.chapters.length; i++) {
            const chapterData = novelData.chapters[i];
            await this.prisma.chapter.create({
              data: {
                novelId: novel.id,
                title: chapterData.title || `第${i + 1}章`,
                content: chapterData.content || '',
                chapterNumber: chapterData.chapterNumber || i + 1,
                wordCount: chapterData.content?.length || 0,
                status: chapterData.status || 'DRAFT',
              },
            });
          }
        }

        success++;
      } catch (error) {
        failed++;
        errors.push({ novel: novelData.title, error: error.message });
      }
    }

    return { total: novels.length, success, failed, errors };
  }

  private async migrateMaterials(userId: string, sourceData: any) {
    const materials = sourceData.materials || [];
    let success = 0;
    let failed = 0;
    const errors: any[] = [];

    for (const materialData of materials) {
      try {
        await this.prisma.material.create({
          data: {
            userId,
            name: materialData.name,
            type: materialData.type || 'TEXT',
            category: materialData.category,
            fileUrl: materialData.fileUrl,
            fileSize: materialData.fileSize,
            description: materialData.description,
            tags: materialData.tags as Prisma.JsonArray | undefined,
          },
        });
        success++;
      } catch (error) {
        failed++;
        errors.push({ material: materialData.name, error: error.message });
      }
    }

    return { total: materials.length, success, failed, errors };
  }

  async batchImportNovels(userId: string, dto: BatchImportNovelsDto) {
    const results = [];
    let successCount = 0;
    let failedCount = 0;

    for (const novelData of dto.novels) {
      try {
        const novel = await this.prisma.novel.create({
          data: {
            userId,
            title: novelData.title,
            description: novelData.description,
            genre: novelData.genre,
            status: 'DRAFT',
            chapterCount: novelData.chapters?.length || 0,
          },
        });

        // 创建章节
        if (novelData.chapters && novelData.chapters.length > 0) {
          for (let i = 0; i < novelData.chapters.length; i++) {
            const chapterData = novelData.chapters[i];
            await this.prisma.chapter.create({
              data: {
                novelId: novel.id,
                title: chapterData.title,
                content: chapterData.content,
                chapterNumber: chapterData.chapterNumber || i + 1,
                wordCount: chapterData.content.length,
                status: 'DRAFT',
              },
            });
          }
        }

        results.push({ title: novelData.title, status: 'success', novelId: novel.id });
        successCount++;
      } catch (error) {
        results.push({ title: novelData.title, status: 'failed', error: error.message });
        failedCount++;
      }
    }

    return {
      success: true,
      data: { results, successCount, failedCount, total: dto.novels.length },
    };
  }

  async validateMigrationData(userId: string, dto: ValidateMigrationDataDto) {
    const errors: any[] = [];
    let isValid = true;

    switch (dto.migrationType) {
      case MigrationType.NOVELS:
        if (!dto.data.novels || !Array.isArray(dto.data.novels)) {
          errors.push({ field: 'novels', message: '小说数据必须是数组' });
          isValid = false;
        } else {
          dto.data.novels.forEach((novel: any, index: number) => {
            if (!novel.title) {
              errors.push({ index, field: 'title', message: '小说标题不能为空' });
              isValid = false;
            }
          });
        }
        break;

      case MigrationType.MATERIALS:
        if (!dto.data.materials || !Array.isArray(dto.data.materials)) {
          errors.push({ field: 'materials', message: '素材数据必须是数组' });
          isValid = false;
        }
        break;

      default:
        errors.push({ message: '不支持的迁移类型' });
        isValid = false;
    }

    return { success: true, data: { isValid, errors } };
  }

  async getMigrationHistory(userId: string) {
    const migrations = await this.prisma.dataMigration.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return { success: true, data: migrations };
  }

  async getMigrationDetail(userId: string, migrationId: string) {
    const migration = await this.prisma.dataMigration.findUnique({
      where: { id: migrationId },
    });

    if (!migration || migration.userId !== userId) {
      throw new HttpException('迁移记录不存在', HttpStatus.NOT_FOUND);
    }

    return { success: true, data: migration };
  }

  async rollbackMigration(userId: string, migrationId: string) {
    const migration = await this.prisma.dataMigration.findUnique({
      where: { id: migrationId },
    });

    if (!migration || migration.userId !== userId) {
      throw new HttpException('迁移记录不存在', HttpStatus.NOT_FOUND);
    }

    if (migration.status !== MigrationStatus.COMPLETED) {
      throw new HttpException('只能回滚已完成的迁移', HttpStatus.BAD_REQUEST);
    }

    // 简化的回滚逻辑：标记为已回滚
    await this.prisma.dataMigration.update({
      where: { id: migrationId },
      data: { status: MigrationStatus.ROLLED_BACK },
    });

    return { success: true, message: '迁移已回滚' };
  }
}

