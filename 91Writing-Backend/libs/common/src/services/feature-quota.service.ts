import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@app/database';

/**
 * 功能配额管理服务
 * 统一管理所有付费功能的配额检查和扣除
 */
@Injectable()
export class FeatureQuotaService {
  private readonly logger = new Logger(FeatureQuotaService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 检查并消费配额
   */
  async checkAndConsumeQuota(
    userId: string,
    feature: string,  // videoGeneration, aiWriting, aiAssistant, materialGeneration
    quotaType: 'daily' | 'monthly' = 'daily',
  ): Promise<{
    allowed: boolean;
    remaining: number;
    limit: number;
    message?: string;
  }> {
    this.logger.log(`检查用户${userId}的${feature}配额（${quotaType}）`);

    // 1. 获取用户套餐
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      include: { package: true },
    });

    // 2. 获取限额
    let limit = 0;
    let packageName = '免费套餐';

    if (subscription && subscription.status === 'ACTIVE') {
      packageName = subscription.package.name;
      const features = subscription.package.features as any;
      const featureConfig = features?.[feature];
      
      if (featureConfig && featureConfig.enabled) {
        limit = quotaType === 'daily' ? (featureConfig.dailyQuota || 0) : (featureConfig.monthlyQuota || 0);
        
        // -1 表示不限制
        if (limit === -1) {
          this.logger.log(`用户${userId}套餐${packageName}的${feature}不限配额`);
          return {
            allowed: true,
            remaining: -1,
            limit: -1,
          };
        }
      }
    } else {
      // 免费用户，检查是否允许使用该功能
      const freeLimit = this.getFreeFunctionLimit(feature, quotaType);
      limit = freeLimit;
      
      if (limit === 0) {
        this.logger.log(`免费用户不允许使用${feature}`);
        return {
          allowed: false,
          remaining: 0,
          limit: 0,
          message: `${this.getFeatureName(feature)}功能需要订阅套餐，请升级`
        };
      }
    }

    // 3. 获取或创建配额记录
    const date = quotaType === 'daily' ? this.getTodayDate() : this.getMonthStartDate();
    
    let quota = await this.prisma.featureQuota.findUnique({
      where: {
        userId_feature_quotaType_date: {
          userId,
          feature,
          quotaType,
          date,
        },
      },
    });

    if (!quota) {
      quota = await this.prisma.featureQuota.create({
        data: {
          userId,
          feature,
          quotaType,
          date,
          usedCount: 0,
          limit,
        },
      });
    }

    // 4. 检查是否还有剩余
    const remaining = Math.max(0, limit - quota.usedCount);

    if (remaining <= 0) {
      this.logger.log(`用户${userId}的${feature}配额已用尽（${quota.usedCount}/${limit}）`);
      return {
        allowed: false,
        remaining: 0,
        limit,
        message: `已达${quotaType === 'daily' ? '每日' : '每月'}配额限制（${limit}次），请升级套餐`
      };
    }

    // 5. 扣除配额
    await this.prisma.featureQuota.update({
      where: { id: quota.id },
      data: {
        usedCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });

    this.logger.log(`用户${userId}消费${feature}配额，剩余${remaining - 1}/${limit}`);

    return {
      allowed: true,
      remaining: remaining - 1,
      limit,
    };
  }

  /**
   * 查询配额状态（不扣除）
   */
  async getQuotaStatus(userId: string, feature: string) {
    const daily = await this.getQuotaRemaining(userId, feature, 'daily');
    const monthly = await this.getQuotaRemaining(userId, feature, 'monthly');

    return {
      daily,
      monthly,
    };
  }

  /**
   * 获取配额剩余
   */
  private async getQuotaRemaining(userId: string, feature: string, quotaType: 'daily' | 'monthly') {
    const date = quotaType === 'daily' ? this.getTodayDate() : this.getMonthStartDate();
    
    const quota = await this.prisma.featureQuota.findUnique({
      where: {
        userId_feature_quotaType_date: {
          userId,
          feature,
          quotaType,
          date,
        },
      },
    });

    // 获取套餐限额
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      include: { package: true },
    });

    let limit = 0;
    if (subscription && subscription.status === 'ACTIVE') {
      const features = subscription.package.features as any;
      const featureConfig = features?.[feature];
      if (featureConfig && featureConfig.enabled) {
        limit = quotaType === 'daily' ? (featureConfig.dailyQuota || 0) : (featureConfig.monthlyQuota || 0);
      }
    } else {
      limit = this.getFreeFunctionLimit(feature, quotaType);
    }

    const usedCount = quota?.usedCount || 0;
    const remaining = limit === -1 ? -1 : Math.max(0, limit - usedCount);

    return {
      used: usedCount,
      remaining,
      limit,
    };
  }

  /**
   * 免费功能限制
   */
  private getFreeFunctionLimit(feature: string, quotaType: string): number {
    const freeLimits = {
      aiWriting: { daily: 100, monthly: 1000 },
      aiAssistant: { daily: 50, monthly: 500 },
      videoGeneration: { daily: 0, monthly: 0 },  // 免费用户不能生成视频
      materialGeneration: { daily: 10, monthly: 100 },
    };

    const featureLimits = freeLimits[feature];
    if (!featureLimits) {
      return 0;
    }

    return quotaType === 'daily' ? featureLimits.daily : featureLimits.monthly;
  }

  /**
   * 功能名称
   */
  private getFeatureName(feature: string): string {
    const names = {
      videoGeneration: '视频生成',
      aiWriting: 'AI写作',
      aiAssistant: 'AI写作助手',
      materialGeneration: '素材生成',
    };
    return names[feature] || feature;
  }

  private getTodayDate(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  private getMonthStartDate(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
}

