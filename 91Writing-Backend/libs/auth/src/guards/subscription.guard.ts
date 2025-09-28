import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '@app/database';
import { SubscriptionStatus } from '@prisma/client';

export interface SubscriptionRequirement {
  feature?: string;
  level?: 'basic' | 'premium' | 'pro';
  requireActive?: boolean;
}

export const SUBSCRIPTION_KEY = 'subscription';
export const RequireSubscription = (requirement: SubscriptionRequirement) =>
  Reflector.createDecorator<SubscriptionRequirement>({ ...requirement, requireActive: true });

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requirement = this.reflector.getAllAndOverride<SubscriptionRequirement>(
      SUBSCRIPTION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requirement) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.sub;

    if (!userId) {
      throw new ForbiddenException('用户未登录');
    }

    // 检查用户订阅状态
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      include: { package: true },
    });

    if (!subscription) {
      throw new ForbiddenException('需要订阅才能使用此功能');
    }

    // 检查订阅是否活跃
    if (requirement.requireActive) {
      const now = new Date();
      const isActive = subscription.status === SubscriptionStatus.ACTIVE && 
                      now <= subscription.endDate;
      
      if (!isActive) {
        throw new ForbiddenException('订阅已过期，请续费后继续使用');
      }
    }

    // 检查功能权限
    if (requirement.feature) {
      const packageFeatures = subscription.package.features as any;
      
      if (!packageFeatures || !packageFeatures[requirement.feature]) {
        throw new ForbiddenException(`当前套餐不支持${requirement.feature}功能`);
      }
    }

    // 检查套餐级别
    if (requirement.level) {
      const packageLevel = this.getPackageLevel(subscription.package.name);
      const requiredLevel = this.getLevelRank(requirement.level);
      const currentLevel = this.getLevelRank(packageLevel);
      
      if (currentLevel < requiredLevel) {
        throw new ForbiddenException(`需要${requirement.level}或更高级别的订阅`);
      }
    }

    // 将订阅信息添加到请求对象中
    request.subscription = subscription;

    return true;
  }

  private getPackageLevel(packageName: string): 'basic' | 'premium' | 'pro' {
    if (packageName.toLowerCase().includes('pro')) return 'pro';
    if (packageName.toLowerCase().includes('premium')) return 'premium';
    return 'basic';
  }

  private getLevelRank(level: string): number {
    const ranks = { basic: 1, premium: 2, pro: 3 };
    return ranks[level] || 0;
  }
}
