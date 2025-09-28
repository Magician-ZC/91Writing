import { 
  Injectable, 
  BadRequestException,
  NotFoundException,
  Logger 
} from '@nestjs/common';
import { PrismaService } from '@app/database';
import { RewardStatus } from '@prisma/client';

@Injectable()
export class InviteService {
  private readonly logger = new Logger(InviteService.name);

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * 获取用户的邀请码信息
   */
  async getMyInviteCode(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        inviteCode: true,
        inviteCount: true,
      }
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:7520'}/auth/register?invite=${user.inviteCode}`;

    return {
      success: true,
      data: {
        inviteCode: user.inviteCode,
        inviteCount: user.inviteCount,
        shareUrl
      }
    };
  }

  /**
   * 获取邀请统计信息
   */
  async getInviteStats(userId: string): Promise<any> {
    // 获取基本统计
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        inviteCount: true,
        inviteCode: true
      }
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 获取邀请记录统计
    const inviteStats = await this.prisma.userInvite.groupBy({
      by: ['status'],
      where: { inviterId: userId },
      _count: true
    });

    // 获取奖励统计
    const rewardStats = await this.prisma.inviteReward.groupBy({
      by: ['status', 'rewardType'],
      where: { userId },
      _count: true,
      _sum: { amount: true }
    });

    // 获取最近30天的邀请趋势
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentInvites = await this.prisma.userInvite.findMany({
      where: {
        inviterId: userId,
        createdAt: { gte: thirtyDaysAgo }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        invitee: {
          select: {
            email: true,
            nickname: true,
            createdAt: true
          }
        }
      }
    });

    return {
      success: true,
      data: {
        totalInvites: user.inviteCount,
        inviteCode: user.inviteCode,
        invitesByStatus: inviteStats,
        rewardsByType: rewardStats,
        recentInvites: recentInvites.slice(0, 10) // 最近10个
      }
    };
  }

  /**
   * 获取邀请奖励记录
   */
  async getInviteRewards(userId: string): Promise<any> {
    const rewards = await this.prisma.inviteReward.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        invite: {
          include: {
            invitee: {
              select: {
                email: true,
                nickname: true
              }
            }
          }
        }
      }
    });

    const totalRewards = await this.prisma.inviteReward.aggregate({
      where: { 
        userId,
        status: RewardStatus.GRANTED
      },
      _sum: { amount: true },
      _count: true
    });

    return {
      success: true,
      data: {
        rewards,
        summary: {
          totalCount: totalRewards._count,
          totalAmount: totalRewards._sum.amount || 0
        }
      }
    };
  }

  /**
   * 获取邀请的用户列表
   */
  async getInvitees(userId: string): Promise<any> {
    const invitees = await this.prisma.user.findMany({
      where: { invitedBy: userId },
      select: {
        id: true,
        email: true,
        nickname: true,
        createdAt: true,
        status: true,
        inviteCount: true, // 查看被邀请者的邀请情况
      },
      orderBy: { createdAt: 'desc' }
    });

    return {
      success: true,
      data: {
        invitees,
        count: invitees.length
      }
    };
  }

  /**
   * 领取奖励（如果需要手动领取）
   */
  async claimReward(userId: string, rewardId: string): Promise<any> {
    const reward = await this.prisma.inviteReward.findFirst({
      where: {
        id: rewardId,
        userId,
        status: RewardStatus.PENDING
      }
    });

    if (!reward) {
      throw new BadRequestException('奖励不存在或已领取');
    }

    // 更新奖励状态
    const updatedReward = await this.prisma.inviteReward.update({
      where: { id: rewardId },
      data: {
        status: RewardStatus.GRANTED,
        grantedAt: new Date()
      }
    });

    // TODO: 在这里执行实际的奖励发放逻辑
    // 比如延长订阅、增加积分等

    this.logger.log(`用户 ${userId} 领取奖励成功: ${rewardId}`);

    return {
      success: true,
      data: updatedReward,
      message: '奖励领取成功'
    };
  }
}
