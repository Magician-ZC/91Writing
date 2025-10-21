import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@app/database';

/**
 * 套餐权限检查服务
 */
@Injectable()
export class PackagePermissionService {
  private readonly logger = new Logger(PackagePermissionService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 检查用户视频生成权限
   */
  async checkVideoGenerationPermission(userId: string): Promise<{
    allowed: boolean;
    limits: {
      dailyQuota: number;
      monthlyQuota: number;
      maxSceneCount: number;
      maxVideoDuration: number;
      allowedQualities: string[];
      allowedResolutions: string[];
      enableAdvancedParams: boolean;
      enableCustomPrompts: boolean;
      priority: string;
    };
    packageName?: string;
    message?: string;
  }> {
    // 1. 获取用户订阅
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      include: {
        package: true,
      },
    });

    // 2. 如果没有订阅或订阅已过期，使用免费套餐配置
    if (!subscription || subscription.status !== 'ACTIVE') {
      this.logger.log(`用户${userId}无有效订阅，使用免费限制`);
      return {
        allowed: false,
        limits: this.getFreeLimits(),
        packageName: '免费套餐',
        message: '请升级套餐以使用视频生成功能'
      };
    }

    // 3. 解析套餐features
    const features = subscription.package.features as any;
    const videoFeatures = features?.videoGeneration;

    if (!videoFeatures || !videoFeatures.enabled) {
      this.logger.log(`用户${userId}套餐不包含视频生成功能`);
      return {
        allowed: false,
        limits: this.getFreeLimits(),
        packageName: subscription.package.name,
        message: '当前套餐不包含视频生成功能'
      };
    }

    // 4. 返回权限限制
    this.logger.log(`用户${userId}套餐: ${subscription.package.name}, 视频配额: ${videoFeatures.dailyQuota}/${videoFeatures.monthlyQuota}`);
    
    return {
      allowed: true,
      limits: {
        dailyQuota: videoFeatures.dailyQuota || 5,
        monthlyQuota: videoFeatures.monthlyQuota || 50,
        maxSceneCount: videoFeatures.maxSceneCount || 5,
        maxVideoDuration: videoFeatures.maxVideoDuration || 30,
        allowedQualities: videoFeatures.allowedQualities || ['standard'],
        allowedResolutions: videoFeatures.allowedResolutions || ['1024x576'],
        enableAdvancedParams: videoFeatures.enableAdvancedParams || false,
        enableCustomPrompts: videoFeatures.enableCustomPrompts || false,
        priority: videoFeatures.priority || 'normal'
      },
      packageName: subscription.package.name
    };
  }

  /**
   * 验证用户参数是否在权限范围内
   */
  validateUserParams(userParams: any, limits: any): {
    valid: boolean;
    errors: string[];
  } {
    const errors = [];

    // 验证分镜数量
    if (userParams.sceneCount && userParams.sceneCount > limits.maxSceneCount) {
      errors.push(`分镜数量超出限制（最多${limits.maxSceneCount}个，请升级套餐）`);
    }

    // 验证视频时长
    const totalDuration = (userParams.sceneCount || 5) * (userParams.videoDuration || 5);
    if (totalDuration > limits.maxVideoDuration) {
      errors.push(`视频总时长超出限制（最多${limits.maxVideoDuration}秒，请升级套餐）`);
    }

    // 验证图片质量
    if (userParams.imageQuality && !limits.allowedQualities.includes(userParams.imageQuality)) {
      errors.push(`图片质量"${userParams.imageQuality}"不在允许范围内（允许：${limits.allowedQualities.join(', ')}），请升级套餐`);
    }

    // 验证分辨率
    if (userParams.imageResolution && !limits.allowedResolutions.includes(userParams.imageResolution)) {
      errors.push(`图片分辨率不在允许范围内（允许：${limits.allowedResolutions.join(', ')}），请升级套餐`);
    }

    // 验证高级参数
    if (!limits.enableAdvancedParams) {
      const advancedParams = ['samplingSteps', 'cfgScale', 'negativePrompt'];
      const usedAdvanced = advancedParams.filter(param => userParams[param] !== undefined);
      
      if (usedAdvanced.length > 0) {
        errors.push(`当前套餐不支持高级参数配置（${usedAdvanced.join(', ')}），请升级到专业版或企业版`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 免费用户限制
   */
  private getFreeLimits() {
    return {
      dailyQuota: 0,
      monthlyQuota: 0,
      maxSceneCount: 0,
      maxVideoDuration: 0,
      allowedQualities: [],
      allowedResolutions: [],
      enableAdvancedParams: false,
      enableCustomPrompts: false,
      priority: 'low'
    };
  }
}

