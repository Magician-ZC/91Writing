import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { CreateSubscriptionDto } from '../../dto/create-subscription.dto';
import { UpdateSubscriptionDto } from '../../dto/update-subscription.dto';
import { SubscriptionStatus } from '@prisma/client';
import { PackageService } from '../package/package.service';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly packageService: PackageService,
  ) {}

  async create(userId: string, createSubscriptionDto: CreateSubscriptionDto) {
    const { packageId } = createSubscriptionDto;

    // 检查套餐是否存在且可用
    const package_ = await this.packageService.findOne(packageId);
    if (package_.status !== 'ACTIVE') {
      throw new BadRequestException('该套餐不可用');
    }

    // 检查用户是否已有活跃订阅
    const existingSubscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (existingSubscription && existingSubscription.status === SubscriptionStatus.ACTIVE) {
      // 如果有活跃订阅，需要先取消或等待过期
      if (new Date() < existingSubscription.endDate) {
        throw new ConflictException('您已有活跃订阅，请等待当前订阅结束后再订阅');
      }
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + package_.durationDays);

    const subscriptionData = {
      userId,
      packageId,
      startDate,
      endDate,
      status: SubscriptionStatus.PENDING,
      ...createSubscriptionDto,
    };

    // 如果存在订阅记录，更新；否则创建新的
    if (existingSubscription) {
      return this.prisma.subscription.update({
        where: { userId },
        data: subscriptionData,
        include: { package: true },
      });
    } else {
      return this.prisma.subscription.create({
        data: subscriptionData,
        include: { package: true },
      });
    }
  }

  async findByUser(userId: string) {
    return this.prisma.subscription.findUnique({
      where: { userId },
      include: { 
        package: true,
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            nickname: true,
          }
        }
      },
    });
  }

  async findOne(id: string, userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { id, userId },
      include: { package: true },
    });

    if (!subscription) {
      throw new NotFoundException('订阅不存在');
    }

    return subscription;
  }

  async update(id: string, userId: string, updateSubscriptionDto: UpdateSubscriptionDto) {
    await this.findOne(id, userId);

    return this.prisma.subscription.update({
      where: { id },
      data: updateSubscriptionDto,
      include: { package: true },
    });
  }

  async cancel(id: string, userId: string) {
    const subscription = await this.findOne(id, userId);

    if (subscription.status === SubscriptionStatus.CANCELLED) {
      throw new BadRequestException('订阅已取消');
    }

    return this.prisma.subscription.update({
      where: { id },
      data: { 
        status: SubscriptionStatus.CANCELLED,
        autoRenew: false,
      },
      include: { package: true },
    });
  }

  async renew(id: string, userId: string) {
    const subscription = await this.findOne(id, userId);
    
    if (subscription.status === SubscriptionStatus.ACTIVE && new Date() < subscription.endDate) {
      throw new BadRequestException('订阅仍然有效，无需续费');
    }

    const package_ = await this.packageService.findOne(subscription.packageId);
    
    const newStartDate = new Date();
    const newEndDate = new Date();
    newEndDate.setDate(newStartDate.getDate() + package_.durationDays);

    return this.prisma.subscription.update({
      where: { id },
      data: {
        startDate: newStartDate,
        endDate: newEndDate,
        status: SubscriptionStatus.PENDING, // 等待支付
      },
      include: { package: true },
    });
  }

  async checkStatus(userId: string) {
    const subscription = await this.findByUser(userId);
    
    if (!subscription) {
      return {
        hasSubscription: false,
        isActive: false,
        status: null,
        expiredAt: null,
        daysLeft: 0,
      };
    }

    const now = new Date();
    const isActive = subscription.status === SubscriptionStatus.ACTIVE && now < subscription.endDate;
    const daysLeft = isActive 
      ? Math.ceil((subscription.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      hasSubscription: true,
      isActive,
      status: subscription.status,
      expiredAt: subscription.endDate,
      daysLeft,
      package: subscription.package,
    };
  }

  async activate(subscriptionId: string) {
    return this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: SubscriptionStatus.ACTIVE },
      include: { package: true },
    });
  }

  // 定时任务：检查过期订阅
  async checkExpiredSubscriptions() {
    const expiredSubscriptions = await this.prisma.subscription.findMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: { lt: new Date() },
      },
    });

    if (expiredSubscriptions.length > 0) {
      await this.prisma.subscription.updateMany({
        where: {
          id: { in: expiredSubscriptions.map(s => s.id) },
        },
        data: { status: SubscriptionStatus.EXPIRED },
      });
    }

    return { expired: expiredSubscriptions.length };
  }
}
