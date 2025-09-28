import { 
  Injectable, 
  BadRequestException,
  NotFoundException,
  Logger 
} from '@nestjs/common';
import { PrismaService } from '@app/database';
import { RewardStatus } from '@prisma/client';
import { InviteRewardService } from './invite-reward.service';

@Injectable()
export class InviteService {
  private readonly logger = new Logger(InviteService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly inviteRewardService: InviteRewardService,
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

  /**
   * 获取奖励配置
   */
  async getRewardConfig(): Promise<any> {
    return this.inviteRewardService.getRewardConfig();
  }

  /**
   * 计算预期奖励
   */
  async getExpectedRewards(userId: string): Promise<any> {
    const expectedRewards = await this.inviteRewardService.calculateExpectedRewards(userId);
    
    return {
      success: true,
      data: expectedRewards
    };
  }

  /**
   * 生成分享素材
   */
  async generateShareMaterials(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        inviteCode: true,
        inviteCount: true,
        nickname: true,
        email: true
      }
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:7520';
    const shareUrl = `${baseUrl}/register?invite=${user.inviteCode}`;
    
    // 生成不同的分享文案
    const shareTexts = [
      `我在使用91Writing智能写作平台，功能很棒！推荐给你，注册即可获得3天免费会员：${shareUrl}`,
      `发现了一个很好用的AI写作工具91Writing，帮你快速创作小说，点击链接注册体验：${shareUrl}`,
      `91Writing - 让AI帮你写小说，提高创作效率！新用户注册送会员，快来试试：${shareUrl}`,
      `推荐一个智能写作神器91Writing，已经帮我写了好多章节了！注册链接：${shareUrl}`
    ];

    // 生成社交媒体分享链接
    const socialShares = {
      qq: `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent('91Writing智能写作平台')}&summary=${encodeURIComponent(shareTexts[0])}`,
      weibo: `https://service.weibo.com/share/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTexts[0])}`,
      wechat: shareUrl, // 微信需要通过二维码分享
    };

    return {
      success: true,
      data: {
        inviteCode: user.inviteCode,
        shareUrl,
        shareTexts,
        socialShares,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`,
        statistics: {
          totalInvites: user.inviteCount,
          userName: user.nickname || user.email
        }
      }
    };
  }
}
