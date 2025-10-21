import { SetMetadata } from '@nestjs/common';

/**
 * 功能权限装饰器的元数据键
 */
export const FEATURE_KEY = 'feature';
export const QUOTA_TYPE_KEY = 'quotaType';

/**
 * 标记接口需要的功能权限
 * @param feature 功能名称（videoGeneration, aiWriting, aiAssistant, materialGeneration）
 */
export const RequireFeature = (feature: string) => SetMetadata(FEATURE_KEY, feature);

/**
 * 标记接口需要扣除的配额类型
 * @param quotaType 配额类型（daily 或 monthly）
 */
export const RequireQuota = (quotaType: 'daily' | 'monthly' = 'daily') => 
  SetMetadata(QUOTA_TYPE_KEY, quotaType);

