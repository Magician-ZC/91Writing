import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { RewardType, RewardStatus, SubscriptionStatus } from '@prisma/client';

@Injectable()
export class InviteRewardService {
  private readonly logger = new Logger(InviteRewardService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 奖励配置
   */
  private readonly rewardConfig = {
    // 邀请成功奖励
    inviteSuccess: {
      inviterRewards: [
        { type: RewardType.DAYS, amount: 7, description: '邀请奖励：7天会员' }
      ],
      inviteeRewards: [
        { type: RewardType.DAYS, amount: 3, description: '新用户奖励：3天会员' }
      ]
    },
    // 被邀请者订阅奖励
    inviteeSubscribe: {
      inviterRewards: [
        { type: RewardType.DAYS, amount: 15, description: '被邀请者订阅奖励：15天会员' }
      ]
    },
    // 里程碑奖励
    milestones: [
      { inviteCount: 5, rewards: [{ type: RewardType.DAYS, amount: 30, description: '邀请5人里程碑：30天会员' }] },
      { inviteCount: 10, rewards: [{ type: RewardType.DAYS, amount: 60, description: '邀请10人里程碑：60天会员' }] },
      { inviteCount: 20, rewards: [{ type: RewardType.DAYS, amount: 90, description: '邀请20人里程碑：90天会员' }] },
      { inviteCount: 50, rewards: [{ type: RewardType.DAYS, amount: 180, description: '邀请50人里程碑：180天会员' }] }
    ]
  };

  /**
   * 处理邀请成功奖励
   */
  async processInviteSuccessReward(inviterId: string, inviteeId: string, inviteId: string) {
    this.logger.log(`处理邀请成功奖励: ${inviterId} -> ${inviteeId}`);

    try {
      // 为邀请者发放奖励
      for (const reward of this.rewardConfig.inviteSuccess.inviterRewards) {
        await this.createReward(inviterId, inviteId, reward);
      }

      // 为被邀请者发放奖励
      for (const reward of this.rewardConfig.inviteSuccess.inviteeRewards) {
        await this.createReward(inviteeId, inviteId, reward);
      }

      // 检查里程碑奖励
      await this.checkMilestoneRewards(inviterId);

      this.logger.log(`邀请成功奖励处理完成: ${inviterId} -> ${inviteeId}`);
    } catch (error) {
      this.logger.error(`处理邀请成功奖励失败: ${error.message}`);
    }
  }

  /**
   * 处理被邀请者订阅奖励
   */
  async processInviteeSubscriptionReward(inviteeId: string) {
    this.logger.log(`处理被邀请者订阅奖励: ${inviteeId}`);

    try {
      // 查找邀请记录
      const inviteRecord = await this.prisma.userInvite.findFirst({
        where: { inviteeId },
        include: { inviter: true }
      });

      if (!inviteRecord) {
        this.logger.warn(`未找到邀请记录: ${inviteeId}`);
        return;
      }

      // 为邀请者发放订阅奖励
      for (const reward of this.rewardConfig.inviteeSubscribe.inviterRewards) {
        await this.createReward(inviteRecord.inviterId, inviteRecord.id, reward);
      }

      this.logger.log(`被邀请者订阅奖励处理完成: ${inviteeId}`);
    } catch (error) {
      this.logger.error(`处理被邀请者订阅奖励失败: ${error.message}`);
    }
  }

  /**
   * 检查里程碑奖励
   */
  private async checkMilestoneRewards(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { inviteCount: true }
    });

    if (!user) return;

    // 查找符合条件的里程碑
    const eligibleMilestones = this.rewardConfig.milestones.filter(
      milestone => milestone.inviteCount === user.inviteCount
    );

    // 为每个达到的里程碑发放奖励
    for (const milestone of eligibleMilestones) {
      for (const reward of milestone.rewards) {
        await this.createReward(userId, null, reward);
      }
      this.logger.log(`用户 ${userId} 达成邀请里程碑: ${milestone.inviteCount}人`);
    }
  }

  /**
   * 创建奖励记录
   */
  private async createReward(userId: string, inviteId: string | null, rewardConfig: any) {
    return this.prisma.inviteReward.create({
      data: {
        userId,
        inviteId,
        rewardType: rewardConfig.type,
        amount: rewardConfig.amount,
        description: rewardConfig.description,
        status: RewardStatus.PENDING
      }
    });
  }

  /**
   * 自动发放奖励
   */
  async processAutomaticRewards() {
    this.logger.log('开始处理自动奖励发放');

    const pendingRewards = await this.prisma.inviteReward.findMany({
      where: { status: RewardStatus.PENDING },
      include: { user: true }
    });

    for (const reward of pendingRewards) {
      try {
        await this.grantReward(reward.id, reward.userId, reward);
      } catch (error) {
        this.logger.error(`自动发放奖励失败 ${reward.id}: ${error.message}`);
      }
    }

    this.logger.log(`自动奖励发放完成，处理了 ${pendingRewards.length} 个奖励`);
  }

  /**
   * 发放奖励
   */
  async grantReward(rewardId: string, userId: string, reward: any) {
    this.logger.log(`发放奖励: ${rewardId} to ${userId}`);

    try {
      if (reward.rewardType === RewardType.DAYS) {
        await this.grantMembershipDays(userId, reward.amount);
      }

      // 更新奖励状态
      await this.prisma.inviteReward.update({
        where: { id: rewardId },
        data: {
          status: RewardStatus.GRANTED,
          grantedAt: new Date()
        }
      });

      this.logger.log(`奖励发放成功: ${rewardId}`);
    } catch (error) {
      // 标记为失败
      await this.prisma.inviteReward.update({
        where: { id: rewardId },
        data: { status: RewardStatus.FAILED }
      });
      throw error;
    }
  }

  /**
   * 发放会员天数奖励
   */
  private async grantMembershipDays(userId: string, days: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    const currentDate = new Date();

    if (user.subscription) {
      // 用户有订阅，延长订阅时间
      const currentEndDate = new Date(user.subscription.endDate);
      const extendToDate = currentDate > currentEndDate ? currentDate : currentEndDate;
      const newEndDate = new Date(extendToDate);
      newEndDate.setDate(newEndDate.getDate() + days);

      await this.prisma.subscription.update({
        where: { userId },
        data: {
          endDate: newEndDate,
          status: SubscriptionStatus.ACTIVE
        }
      });

      this.logger.log(`延长用户 ${userId} 订阅 ${days} 天，新到期日期: ${newEndDate}`);
    } else {
      // 用户没有订阅，需要创建临时订阅或积分余额
      // 这里可以创建一个免费套餐的订阅
      const freePackage = await this.prisma.package.findFirst({
        where: { name: { contains: '免费' } }
      });

      if (freePackage) {
        const endDate = new Date(currentDate);
        endDate.setDate(endDate.getDate() + days);

        await this.prisma.subscription.create({
          data: {
            userId,
            packageId: freePackage.id,
            status: SubscriptionStatus.ACTIVE,
            startDate: currentDate,
            endDate,
            autoRenew: false
          }
        });

        this.logger.log(`为用户 ${userId} 创建 ${days} 天免费订阅`);
      } else {
        // 如果没有免费套餐，记录为积分或其他形式
        this.logger.warn(`用户 ${userId} 没有订阅且没有免费套餐，奖励天数: ${days}`);
      }
    }
  }

  /**
   * 获取奖励规则配置
   */
  getRewardConfig() {
    return {
      success: true,
      data: this.rewardConfig
    };
  }

  /**
   * 计算预期奖励
   */
  async calculateExpectedRewards(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { inviteCount: true }
    });

    if (!user) return null;

    const nextMilestone = this.rewardConfig.milestones.find(
      milestone => milestone.inviteCount > user.inviteCount
    );

    return {
      currentInvites: user.inviteCount,
      nextMilestone: nextMilestone ? {
        inviteCount: nextMilestone.inviteCount,
        remaining: nextMilestone.inviteCount - user.inviteCount,
        rewards: nextMilestone.rewards
      } : null,
      inviteRewards: this.rewardConfig.inviteSuccess
    };
  }
}
