import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@app/database';
import {
  CreateCollaborationDto,
  UpdateCollaborationDto,
  LockChapterDto,
  UnlockChapterDto,
  EditEventDto,
  CollaborationRole,
  CollaborationStatus,
} from '../../dto/collaboration.dto';

@Injectable()
export class CollaborationService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建协作邀请
   */
  async createCollaboration(dto: CreateCollaborationDto) {
    // 检查小说是否存在
    const novel = await this.prisma.novel.findUnique({
      where: { id: dto.novelId },
    });

    if (!novel) {
      throw new NotFoundException('小说不存在');
    }

    // 检查是否已存在协作关系
    const existing = await this.prisma.novelCollaboration.findFirst({
      where: {
        novelId: dto.novelId,
        userId: dto.userId,
        status: CollaborationStatus.ACTIVE,
      },
    });

    if (existing) {
      throw new ConflictException('该用户已是协作者');
    }

    // 创建协作记录
    return this.prisma.novelCollaboration.create({
      data: {
        novelId: dto.novelId,
        userId: dto.userId,
        role: dto.role,
        status: CollaborationStatus.PENDING,
        inviteMessage: dto.message,
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
  }

  /**
   * 获取小说的协作者列表
   */
  async getCollaborators(novelId: string) {
    return this.prisma.novelCollaboration.findMany({
      where: {
        novelId,
        status: CollaborationStatus.ACTIVE,
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
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 更新协作状态
   */
  async updateCollaboration(
    collaborationId: string,
    dto: UpdateCollaborationDto,
  ) {
    return this.prisma.novelCollaboration.update({
      where: { id: collaborationId },
      data: dto,
    });
  }

  /**
   * 接受协作邀请
   */
  async acceptCollaboration(collaborationId: string, userId: string) {
    const collaboration = await this.prisma.novelCollaboration.findUnique({
      where: { id: collaborationId },
    });

    if (!collaboration) {
      throw new NotFoundException('协作邀请不存在');
    }

    if (collaboration.userId !== userId) {
      throw new ForbiddenException('无权接受此邀请');
    }

    return this.prisma.novelCollaboration.update({
      where: { id: collaborationId },
      data: { status: CollaborationStatus.ACTIVE },
    });
  }

  /**
   * 拒绝或撤销协作
   */
  async revokeCollaboration(collaborationId: string, userId: string) {
    const collaboration = await this.prisma.novelCollaboration.findUnique({
      where: { id: collaborationId },
    });

    if (!collaboration) {
      throw new NotFoundException('协作记录不存在');
    }

    return this.prisma.novelCollaboration.update({
      where: { id: collaborationId },
      data: { status: CollaborationStatus.REVOKED },
    });
  }

  /**
   * 检查用户是否有协作权限
   */
  async checkCollaborationPermission(
    novelId: string,
    userId: string,
    requiredRole?: CollaborationRole,
  ): Promise<boolean> {
    // 检查是否是小说所有者
    const novel = await this.prisma.novel.findUnique({
      where: { id: novelId },
    });

    if (novel?.userId === userId) {
      return true;
    }

    // 检查协作权限
    const collaboration = await this.prisma.novelCollaboration.findFirst({
      where: {
        novelId,
        userId,
        status: CollaborationStatus.ACTIVE,
      },
    });

    if (!collaboration) {
      return false;
    }

    // 如果指定了所需角色，检查角色权限
    if (requiredRole) {
      const roleHierarchy = {
        [CollaborationRole.OWNER]: 4,
        [CollaborationRole.EDITOR]: 3,
        [CollaborationRole.COMMENTER]: 2,
        [CollaborationRole.VIEWER]: 1,
      };

      return (
        roleHierarchy[collaboration.role] >= roleHierarchy[requiredRole]
      );
    }

    return true;
  }

  /**
   * 锁定章节（编辑中）
   */
  async lockChapter(dto: LockChapterDto) {
    // 检查章节是否已被锁定
    const existingLock = await this.prisma.chapterLock.findFirst({
      where: {
        chapterId: dto.chapterId,
        isLocked: true,
      },
    });

    if (existingLock && existingLock.userId !== dto.userId) {
      // 检查锁定是否超时（超过30分钟自动解锁）
      const lockAge = Date.now() - existingLock.lockedAt.getTime();
      if (lockAge < 30 * 60 * 1000) {
        const user = await this.prisma.user.findUnique({
          where: { id: existingLock.userId },
          include: { profile: true },
        });
        throw new ConflictException(
          `章节正在被 ${user?.profile?.nickname || user?.email} 编辑中`,
        );
      }
    }

    // 创建或更新锁定记录
    return this.prisma.chapterLock.upsert({
      where: { chapterId: dto.chapterId },
      update: {
        userId: dto.userId,
        isLocked: true,
        lockedAt: new Date(),
      },
      create: {
        chapterId: dto.chapterId,
        userId: dto.userId,
        isLocked: true,
        lockedAt: new Date(),
      },
    });
  }

  /**
   * 解锁章节
   */
  async unlockChapter(dto: UnlockChapterDto) {
    const lock = await this.prisma.chapterLock.findFirst({
      where: {
        chapterId: dto.chapterId,
      },
    });

    if (!lock) {
      return null;
    }

    // 只有锁定者本人可以解锁
    if (lock.userId !== dto.userId) {
      throw new ForbiddenException('只有锁定者本人可以解锁');
    }

    return this.prisma.chapterLock.update({
      where: { chapterId: dto.chapterId },
      data: { isLocked: false },
    });
  }

  /**
   * 获取章节锁定状态
   */
  async getChapterLockStatus(chapterId: string) {
    const lock = await this.prisma.chapterLock.findFirst({
      where: {
        chapterId,
        isLocked: true,
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

    if (!lock) {
      return { isLocked: false, lockedBy: null };
    }

    // 检查是否超时
    const lockAge = Date.now() - lock.lockedAt.getTime();
    if (lockAge >= 30 * 60 * 1000) {
      // 自动解锁
      await this.prisma.chapterLock.update({
        where: { chapterId },
        data: { isLocked: false },
      });
      return { isLocked: false, lockedBy: null };
    }

    return {
      isLocked: true,
      lockedBy: {
        id: lock.user.id,
        email: lock.user.email,
        nickname: lock.user.profile?.nickname,
        avatar: lock.user.profile?.avatar,
      },
      lockedAt: lock.lockedAt,
    };
  }

  /**
   * 记录编辑事件（用于实时同步）
   */
  async recordEditEvent(dto: EditEventDto) {
    return this.prisma.chapterEditEvent.create({
      data: {
        chapterId: dto.chapterId,
        userId: dto.userId,
        eventType: dto.eventType,
        eventData: dto.data,
      },
    });
  }

  /**
   * 获取章节编辑历史
   */
  async getChapterEditHistory(
    chapterId: string,
    limit: number = 50,
    afterTimestamp?: Date,
  ) {
    return this.prisma.chapterEditEvent.findMany({
      where: {
        chapterId,
        ...(afterTimestamp && { createdAt: { gt: afterTimestamp } }),
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
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
