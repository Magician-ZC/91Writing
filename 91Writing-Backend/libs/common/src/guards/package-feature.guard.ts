import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '@app/database';
import { FeatureQuotaService } from '../services/feature-quota.service';

/**
 * 套餐功能权限守卫
 * 自动检查用户套餐权限和配额
 */
@Injectable()
export class PackageFeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    private featureQuotaService: FeatureQuotaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. 获取装饰器标记的功能和配额类型
    const requiredFeature = this.reflector.get<string>('feature', context.getHandler());
    const quotaType = this.reflector.get<'daily' | 'monthly'>('quotaType', context.getHandler()) || 'daily';
    
    // 如果没有标记功能，则不检查权限
    if (!requiredFeature) {
      return true;
    }

    // 2. 获取用户信息
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId || request.user?.id;

    if (!userId) {
      throw new ForbiddenException('未登录或token无效');
    }

    // 3. 获取用户订阅
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      include: { package: true },
    });

    // 4. 检查功能权限
    let featureConfig = null;
    let packageName = '免费套餐';

    if (subscription && subscription.status === 'ACTIVE') {
      packageName = subscription.package.name;
      const features = subscription.package.features as any;
      featureConfig = features?.[requiredFeature];

      // 检查功能是否启用
      if (!featureConfig || !featureConfig.enabled) {
        throw new ForbiddenException({
          message: `当前套餐（${packageName}）不包含${this.getFeatureName(requiredFeature)}功能`,
          feature: requiredFeature,
          packageName,
          upgradeRequired: true,
        });
      }
    } else {
      // 免费用户，检查是否允许使用该功能
      const allowed = await this.checkFreeUserAccess(requiredFeature);
      if (!allowed) {
        throw new ForbiddenException({
          message: `${this.getFeatureName(requiredFeature)}功能需要订阅套餐，请升级`,
          feature: requiredFeature,
          packageName: '免费套餐',
          upgradeRequired: true,
        });
      }
    }

    // 5. 检查并消费配额
    const quotaResult = await this.featureQuotaService.checkAndConsumeQuota(
      userId,
      requiredFeature,
      quotaType,
    );

    if (!quotaResult.allowed) {
      throw new ForbiddenException({
        message: quotaResult.message,
        feature: requiredFeature,
        packageName,
        quotaType,
        used: quotaResult.limit,
        limit: quotaResult.limit,
        upgradeRequired: quotaResult.limit > 0,  // 如果有限制，建议升级
      });
    }

    // 6. 将权限信息附加到request，供后续使用
    request.packageLimits = featureConfig;
    request.packageName = packageName;
    request.quotaRemaining = {
      [quotaType]: quotaResult.remaining,
    };

    return true;
  }

  /**
   * 检查免费用户是否可以使用该功能
   */
  private async checkFreeUserAccess(feature: string): Promise<boolean> {
    // 免费用户可以使用的功能列表
    const freeFunctions = ['aiWriting', 'aiAssistant', 'materialGeneration'];
    return freeFunctions.includes(feature);
  }

  /**
   * 获取功能中文名称
   */
  private getFeatureName(feature: string): string {
    const names = {
      videoGeneration: '视频生成',
      aiWriting: 'AI写作',
      aiAssistant: 'AI写作助手',
      materialGeneration: '素材生成',
      suggestion: '写作建议',
    };
    return names[feature] || feature;
  }
}

