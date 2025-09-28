import { SetMetadata } from '@nestjs/common';
import { SubscriptionRequirement } from '../guards/subscription.guard';

export const SUBSCRIPTION_KEY = 'subscription';

export const RequireSubscription = (requirement: SubscriptionRequirement) =>
  SetMetadata(SUBSCRIPTION_KEY, requirement);

export const RequireFeature = (feature: string) =>
  RequireSubscription({ feature, requireActive: true });

export const RequireLevel = (level: 'basic' | 'premium' | 'pro') =>
  RequireSubscription({ level, requireActive: true });

export const RequireActiveSubscription = () =>
  RequireSubscription({ requireActive: true });
