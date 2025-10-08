import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@app/database';
import {
  CreateVersionDto,
  CompareVersionsDto,
  RestoreVersionDto,
} from '../../dto/version.dto';

@Injectable()
export class VersionService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建章节版本快照
   */
  async createVersion(dto: CreateVersionDto) {
    // 获取章节当前内容
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: dto.chapterId },
    });

    if (!chapter) {
      throw new NotFoundException('章节不存在');
    }

    // 获取当前最大版本号
    const latestVersion = await this.prisma.chapterVersion.findFirst({
      where: { chapterId: dto.chapterId },
      orderBy: { versionNumber: 'desc' },
    });

    const nextVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    // 创建版本记录
    return this.prisma.chapterVersion.create({
      data: {
        chapterId: dto.chapterId,
        versionNumber: nextVersionNumber,
        title: chapter.title,
        content: chapter.content,
        wordCount: chapter.wordCount,
        userId: dto.userId,
        changeLog: dto.changeLog,
      },
    });
  }

  /**
   * 获取章节版本历史
   */
  async getChapterVersionHistory(chapterId: string, limit: number = 50) {
    return this.prisma.chapterVersion.findMany({
      where: { chapterId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                nickname: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: { versionNumber: 'desc' },
      take: limit,
    });
  }

  /**
   * 获取特定版本
   */
  async getVersion(chapterId: string, versionNumber: number) {
    const version = await this.prisma.chapterVersion.findUnique({
      where: {
        chapterId_versionNumber: {
          chapterId,
          versionNumber,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                nickname: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!version) {
      throw new NotFoundException('版本不存在');
    }

    return version;
  }

  /**
   * 对比两个版本
   */
  async compareVersions(dto: CompareVersionsDto) {
    const version1 = await this.getVersion(dto.chapterId, dto.version1);
    const version2 = await this.getVersion(dto.chapterId, dto.version2);

    // 计算差异统计
    const content1 = version1.content || '';
    const content2 = version2.content || '';
    
    const wordCountDiff = version2.wordCount - version1.wordCount;
    const contentLengthDiff = content2.length - content1.length;

    return {
      version1: {
        versionNumber: version1.versionNumber,
        title: version1.title,
        wordCount: version1.wordCount,
        createdAt: version1.createdAt,
        userId: version1.userId,
      },
      version2: {
        versionNumber: version2.versionNumber,
        title: version2.title,
        wordCount: version2.wordCount,
        createdAt: version2.createdAt,
        userId: version2.userId,
      },
      diff: {
        wordCountDiff,
        contentLengthDiff,
        titleChanged: version1.title !== version2.title,
      },
      // 返回完整内容用于前端详细对比
      content1,
      content2,
    };
  }

  /**
   * 回滚到指定版本
   */
  async restoreVersion(dto: RestoreVersionDto) {
    // 获取目标版本
    const version = await this.getVersion(dto.chapterId, dto.versionNumber);

    // 更新章节内容
    const updatedChapter = await this.prisma.chapter.update({
      where: { id: dto.chapterId },
      data: {
        title: version.title,
        content: version.content,
        wordCount: version.wordCount,
      },
    });

    // 创建新版本记录（回滚也是一个新版本）
    const newVersion = await this.createVersion({
      chapterId: dto.chapterId,
      userId: dto.userId,
      changeLog: `回滚到版本 ${dto.versionNumber}`,
    });

    return {
      chapter: updatedChapter,
      newVersion,
      restoredFrom: version,
    };
  }

  /**
   * 删除旧版本（清理策略）
   */
  async cleanupOldVersions(chapterId: string, keepCount: number = 100) {
    // 获取版本总数
    const totalCount = await this.prisma.chapterVersion.count({
      where: { chapterId },
    });

    if (totalCount <= keepCount) {
      return { deleted: 0, message: '无需清理' };
    }

    // 删除最旧的版本
    const versionsToDelete = await this.prisma.chapterVersion.findMany({
      where: { chapterId },
      orderBy: { versionNumber: 'asc' },
      take: totalCount - keepCount,
      select: { id: true },
    });

    const deleteResult = await this.prisma.chapterVersion.deleteMany({
      where: {
        id: {
          in: versionsToDelete.map(v => v.id),
        },
      },
    });

    return {
      deleted: deleteResult.count,
      message: `清理了 ${deleteResult.count} 个旧版本`,
    };
  }

  /**
   * 获取版本统计信息
   */
  async getVersionStats(chapterId: string) {
    const versions = await this.prisma.chapterVersion.findMany({
      where: { chapterId },
      orderBy: { versionNumber: 'asc' },
    });

    if (versions.length === 0) {
      return {
        totalVersions: 0,
        firstVersion: null,
        latestVersion: null,
        totalWordCountChange: 0,
      };
    }

    const firstVersion = versions[0];
    const latestVersion = versions[versions.length - 1];
    const totalWordCountChange = latestVersion.wordCount - firstVersion.wordCount;

    return {
      totalVersions: versions.length,
      firstVersion: {
        versionNumber: firstVersion.versionNumber,
        createdAt: firstVersion.createdAt,
        wordCount: firstVersion.wordCount,
      },
      latestVersion: {
        versionNumber: latestVersion.versionNumber,
        createdAt: latestVersion.createdAt,
        wordCount: latestVersion.wordCount,
      },
      totalWordCountChange,
    };
  }
}
