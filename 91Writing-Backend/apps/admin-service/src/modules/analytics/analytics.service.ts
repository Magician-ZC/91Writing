import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { Prisma } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 批量记录用户行为
   */
  async batchTrackActivities(events: any[], ipAddress?: string) {
    try {
      const activities = events.map((event) => ({
        userId: event.userId || null,
        action: event.action,
        targetType: event.details?.targetType || null,
        targetId: event.details?.targetId || null,
        details: event.details || {},
        ipAddress: ipAddress || event.ipAddress || null,
        userAgent: event.userAgent || null,
      }));

      await this.prisma.userActivity.createMany({
        data: activities,
        skipDuplicates: true,
      });

      return { success: true, count: activities.length };
    } catch (error) {
      this.logger.error('批量记录用户行为失败', error);
      throw error;
    }
  }

  /**
   * 记录AI使用日志
   */
  async trackAIUsage(data: {
    userId?: string;
    model: string;
    functionType: string;
    inputTokens?: number;
    outputTokens?: number;
    cost?: number;
    responseTime?: number;
    success?: boolean;
  }) {
    try {
      return await this.prisma.aIUsageLog.create({
        data: {
          userId: data.userId || null,
          model: data.model,
          functionType: data.functionType,
          inputTokens: data.inputTokens || 0,
          outputTokens: data.outputTokens || 0,
          cost: data.cost || 0,
          responseTime: data.responseTime || null,
          success: data.success ?? true,
        },
      });
    } catch (error) {
      this.logger.error('记录AI使用失败', error);
      throw error;
    }
  }

  /**
   * 获取概览统计数据
   */
  async getOverviewStats(startDate?: Date, endDate?: Date) {
    const dateFilter: Prisma.UserActivityWhereInput = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = startDate;
      if (endDate) dateFilter.createdAt.lte = endDate;
    }

    const [
      totalUsers,
      activeUsers,
      totalNovels,
      totalChapters,
      totalActivities,
      totalAIUsage,
      totalRevenue,
      activeSubscriptions,
    ] = await Promise.all([
      // 总用户数
      this.prisma.user.count(),
      // 活跃用户数（最近30天有活动）
      this.prisma.user.count({
        where: {
          activities: {
            some: {
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
            },
          },
        },
      }),
      // 总小说数
      this.prisma.novel.count(),
      // 总章节数
      this.prisma.chapter.count(),
      // 用户活动总数
      this.prisma.userActivity.count({ where: dateFilter }),
      // AI使用总次数
      this.prisma.aIUsageLog.count({
        where: startDate || endDate
          ? {
              createdAt: {
                ...(startDate && { gte: startDate }),
                ...(endDate && { lte: endDate }),
              },
            }
          : {},
      }),
      // 总收入
      this.prisma.paymentOrder.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
      }),
      // 活跃订阅数
      this.prisma.subscription.count({
        where: { status: 'ACTIVE' },
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      totalNovels,
      totalChapters,
      totalActivities,
      totalAIUsage,
      totalRevenue: totalRevenue._sum.amount || 0,
      activeSubscriptions,
    };
  }

  /**
   * 获取用户增长趋势
   */
  async getUserGrowthTrend(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const users = await this.prisma.user.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // 按日期分组统计
    const groupedByDate = users.reduce((acc, user) => {
      const date = user.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(groupedByDate).map(([date, count]) => ({
      date,
      count,
    }));
  }

  /**
   * 获取热门功能使用统计
   */
  async getFeatureUsageStats(limit: number = 10) {
    const activities = await this.prisma.userActivity.groupBy({
      by: ['action'],
      _count: {
        action: true,
      },
      orderBy: {
        _count: {
          action: 'desc',
        },
      },
      take: limit,
    });

    return activities.map((item) => ({
      feature: item.action,
      count: item._count.action,
    }));
  }

  /**
   * 获取AI使用统计
   */
  async getAIUsageStats(startDate?: Date, endDate?: Date) {
    const dateFilter: Prisma.AIUsageLogWhereInput = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = startDate;
      if (endDate) dateFilter.createdAt.lte = endDate;
    }

    const [totalUsage, byFunction, byModel, totalCost, avgResponseTime] =
      await Promise.all([
        // 总使用次数
        this.prisma.aIUsageLog.count({ where: dateFilter }),
        // 按功能统计
        this.prisma.aIUsageLog.groupBy({
          by: ['functionType'],
          _count: { functionType: true },
          where: dateFilter,
          orderBy: { _count: { functionType: 'desc' } },
        }),
        // 按模型统计
        this.prisma.aIUsageLog.groupBy({
          by: ['model'],
          _count: { model: true },
          where: dateFilter,
          orderBy: { _count: { model: 'desc' } },
        }),
        // 总成本
        this.prisma.aIUsageLog.aggregate({
          where: dateFilter,
          _sum: { cost: true },
        }),
        // 平均响应时间
        this.prisma.aIUsageLog.aggregate({
          where: dateFilter,
          _avg: { responseTime: true },
        }),
      ]);

    return {
      totalUsage,
      byFunction: byFunction.map((item) => ({
        function: item.functionType,
        count: item._count.functionType,
      })),
      byModel: byModel.map((item) => ({
        model: item.model,
        count: item._count.model,
      })),
      totalCost: totalCost._sum.cost || 0,
      avgResponseTime: avgResponseTime._avg.responseTime || 0,
    };
  }

  /**
   * 获取收入统计
   */
  async getRevenueStats(startDate?: Date, endDate?: Date) {
    const dateFilter: Prisma.PaymentOrderWhereInput = {
      status: 'PAID',
    };
    if (startDate || endDate) {
      dateFilter.paidAt = {};
      if (startDate) dateFilter.paidAt.gte = startDate;
      if (endDate) dateFilter.paidAt.lte = endDate;
    }

    const [totalRevenue, orderCount, byPackage, byPaymentMethod] =
      await Promise.all([
        // 总收入
        this.prisma.paymentOrder.aggregate({
          where: dateFilter,
          _sum: { amount: true },
        }),
        // 订单数量
        this.prisma.paymentOrder.count({ where: dateFilter }),
        // 按套餐统计
        this.prisma.paymentOrder.groupBy({
          by: ['packageId'],
          _sum: { amount: true },
          _count: { packageId: true },
          where: dateFilter,
        }),
        // 按支付方式统计
        this.prisma.paymentOrder.groupBy({
          by: ['paymentMethod'],
          _sum: { amount: true },
          _count: { paymentMethod: true },
          where: dateFilter,
        }),
      ]);

    // 获取套餐详情
    const packages = await this.prisma.package.findMany({
      where: {
        id: { in: byPackage.map((item) => item.packageId) },
      },
    });

    const packageMap = new Map(packages.map((pkg) => [pkg.id, pkg]));

    return {
      totalRevenue: totalRevenue._sum.amount || 0,
      orderCount,
      byPackage: byPackage.map((item) => ({
        packageId: item.packageId,
        packageName: packageMap.get(item.packageId)?.name || 'Unknown',
        revenue: item._sum.amount || 0,
        count: item._count.packageId,
      })),
      byPaymentMethod: byPaymentMethod.map((item) => ({
        method: item.paymentMethod,
        revenue: item._sum.amount || 0,
        count: item._count.paymentMethod,
      })),
    };
  }

  /**
   * 获取用户留存数据
   */
  async getUserRetention(cohortDate: Date, days: number = 30) {
    // 获取该日期注册的用户
    const cohortUsers = await this.prisma.user.findMany({
      where: {
        createdAt: {
          gte: cohortDate,
          lt: new Date(cohortDate.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      select: { id: true },
    });

    const cohortUserIds = cohortUsers.map((u) => u.id);
    const totalCohortUsers = cohortUserIds.length;

    if (totalCohortUsers === 0) {
      return { totalUsers: 0, retention: [] };
    }

    // 计算每一天的留存
    const retentionData = [];
    for (let day = 0; day <= days; day++) {
      const targetDate = new Date(cohortDate.getTime() + day * 24 * 60 * 60 * 1000);
      const nextDate = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);

      const activeUsers = await this.prisma.userActivity.groupBy({
        by: ['userId'],
        where: {
          userId: { in: cohortUserIds },
          createdAt: {
            gte: targetDate,
            lt: nextDate,
          },
        },
      });

      const retentionRate = (activeUsers.length / totalCohortUsers) * 100;

      retentionData.push({
        day,
        date: targetDate.toISOString().split('T')[0],
        activeUsers: activeUsers.length,
        retentionRate: Math.round(retentionRate * 100) / 100,
      });
    }

    return {
      totalUsers: totalCohortUsers,
      retention: retentionData,
    };
  }

  /**
   * 导出分析报表数据
   */
  async exportAnalyticsReport(startDate?: Date, endDate?: Date) {
    const [overview, userGrowth, featureUsage, aiUsage, revenue] =
      await Promise.all([
        this.getOverviewStats(startDate, endDate),
        this.getUserGrowthTrend(30),
        this.getFeatureUsageStats(20),
        this.getAIUsageStats(startDate, endDate),
        this.getRevenueStats(startDate, endDate),
      ]);

    return {
      generatedAt: new Date().toISOString(),
      period: {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      },
      overview,
      userGrowth,
      featureUsage,
      aiUsage,
      revenue,
    };
  }
}
