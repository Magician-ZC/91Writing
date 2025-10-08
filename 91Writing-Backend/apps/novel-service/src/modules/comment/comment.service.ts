import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@app/database';
import {
  CreateCommentDto,
  UpdateCommentDto,
  QueryCommentsDto,
  CommentStatusEnum,
} from '../../dto/comment.dto';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建评论
   */
  async createComment(dto: CreateCommentDto) {
    // 验证章节存在
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: dto.chapterId },
    });

    if (!chapter) {
      throw new NotFoundException('章节不存在');
    }

    // 如果是回复，验证父评论存在
    if (dto.parentId) {
      const parentComment = await this.prisma.chapterComment.findUnique({
        where: { id: dto.parentId },
      });

      if (!parentComment) {
        throw new NotFoundException('父评论不存在');
      }

      if (parentComment.chapterId !== dto.chapterId) {
        throw new ForbiddenException('父评论不属于该章节');
      }
    }

    return this.prisma.chapterComment.create({
      data: {
        chapterId: dto.chapterId,
        userId: dto.userId,
        content: dto.content,
        position: dto.position,
        parentId: dto.parentId,
        status: CommentStatusEnum.ACTIVE,
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
   * 获取章节评论列表
   */
  async getChapterComments(dto: QueryCommentsDto) {
    const where: any = {
      chapterId: dto.chapterId,
    };

    if (dto.status) {
      where.status = dto.status;
    }

    if (dto.userId) {
      where.userId = dto.userId;
    }

    // 只获取顶级评论（没有父评论的）
    where.parentId = null;

    return this.prisma.chapterComment.findMany({
      where,
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
        replies: {
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
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 获取单个评论
   */
  async getComment(commentId: string) {
    const comment = await this.prisma.chapterComment.findUnique({
      where: { id: commentId },
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
        replies: {
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
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    return comment;
  }

  /**
   * 更新评论
   */
  async updateComment(
    commentId: string,
    userId: string,
    dto: UpdateCommentDto,
  ) {
    const comment = await this.prisma.chapterComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('无权修改此评论');
    }

    return this.prisma.chapterComment.update({
      where: { id: commentId },
      data: dto,
    });
  }

  /**
   * 删除评论
   */
  async deleteComment(commentId: string, userId: string) {
    const comment = await this.prisma.chapterComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('无权删除此评论');
    }

    // 软删除：将状态设为DELETED
    return this.prisma.chapterComment.update({
      where: { id: commentId },
      data: { status: CommentStatusEnum.DELETED },
    });
  }

  /**
   * 解决评论（标记为已解决）
   */
  async resolveComment(commentId: string, userId: string) {
    const comment = await this.prisma.chapterComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    return this.prisma.chapterComment.update({
      where: { id: commentId },
      data: { status: CommentStatusEnum.RESOLVED },
    });
  }

  /**
   * 获取用户的评论列表
   */
  async getUserComments(userId: string, limit: number = 50) {
    return this.prisma.chapterComment.findMany({
      where: {
        userId,
        status: { not: CommentStatusEnum.DELETED },
      },
      include: {
        chapter: {
          select: {
            id: true,
            title: true,
            novel: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
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

  /**
   * 获取评论统计
   */
  async getCommentStats(chapterId: string) {
    const total = await this.prisma.chapterComment.count({
      where: { chapterId },
    });

    const active = await this.prisma.chapterComment.count({
      where: {
        chapterId,
        status: CommentStatusEnum.ACTIVE,
      },
    });

    const resolved = await this.prisma.chapterComment.count({
      where: {
        chapterId,
        status: CommentStatusEnum.RESOLVED,
      },
    });

    return {
      total,
      active,
      resolved,
      deleted: total - active - resolved,
    };
  }
}
