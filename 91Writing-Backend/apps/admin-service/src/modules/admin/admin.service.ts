import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '@app/database';
import { firstValueFrom } from 'rxjs';
import {
  AdminStatsDto,
  UserManagementDto,
  SubscriptionManagementDto,
  SystemConfigDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  // ============= 仪表盘统计 =============
  async getDashboardStats(query: AdminStatsDto) {
    const { period = 'month', startDate, endDate } = query;
    
    // 计算时间范围
    const now = new Date();
    let start: Date;
    let end: Date = endDate ? new Date(endDate) : now;

    if (startDate) {
      start = new Date(startDate);
    } else {
      switch (period) {
        case 'day':
          start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
    }

    // 并行查询各种统计数据
    const [
      totalUsers,
      newUsers,
      activeUsers,
      totalSubscriptions,
      activeSubscriptions,
      totalOrders,
      paidOrders,
      totalRevenue,
      usersByRole,
      usersByStatus,
    ] = await Promise.all([
      // 总用户数
      this.prisma.user.count(),
      
      // 新用户数
      this.prisma.user.count({
        where: { createdAt: { gte: start, lte: end } }
      }),
      
      // 活跃用户数（最近7天有登录）
      this.prisma.user.count({
        where: {
          lastLoginAt: {
            gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // 总订阅数
      this.prisma.subscription.count(),
      
      // 活跃订阅数
      this.prisma.subscription.count({
        where: { status: 'ACTIVE' }
      }),
      
      // 总订单数
      this.prisma.paymentOrder.count(),
      
      // 已支付订单数
      this.prisma.paymentOrder.count({
        where: { status: 'PAID' }
      }),
      
      // 总收入
      this.prisma.paymentOrder.aggregate({
        _sum: { amount: true },
        where: { status: 'PAID' }
      }),
      
      // 按角色分组的用户数
      this.prisma.user.groupBy({
        by: ['role'],
        _count: { id: true }
      }),
      
      // 按状态分组的用户数
      this.prisma.user.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
    ]);

    return {
      overview: {
        totalUsers,
        newUsers,
        activeUsers,
        totalSubscriptions,
        activeSubscriptions,
        totalOrders,
        paidOrders,
        totalRevenue: totalRevenue._sum.amount || 0,
      },
      userDistribution: {
        byRole: usersByRole.reduce((acc, item) => {
          acc[item.role] = item._count.id;
          return acc;
        }, {}),
        byStatus: usersByStatus.reduce((acc, item) => {
          acc[item.status] = item._count.id;
          return acc;
        }, {}),
      },
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
        period,
      },
    };
  }

  async getChartData(query: AdminStatsDto) {
    const { period = 'month' } = query;
    const now = new Date();
    
    // 根据周期确定数据点数量和时间间隔
    let dataPoints: number;
    let intervalHours: number;
    
    switch (period) {
      case 'day':
        dataPoints = 24;
        intervalHours = 1;
        break;
      case 'week':
        dataPoints = 7;
        intervalHours = 24;
        break;
      case 'month':
        dataPoints = 30;
        intervalHours = 24;
        break;
      case 'year':
        dataPoints = 12;
        intervalHours = 24 * 30;
        break;
      default:
        dataPoints = 30;
        intervalHours = 24;
    }

    // 生成时间点数组
    const timePoints = Array.from({ length: dataPoints }, (_, i) => {
      const time = new Date(now.getTime() - (dataPoints - 1 - i) * intervalHours * 60 * 60 * 1000);
      return time;
    });

    // 查询每个时间点的数据
    const userRegistrations = await Promise.all(
      timePoints.map(async (time, index) => {
        const nextTime = index < timePoints.length - 1 
          ? timePoints[index + 1] 
          : new Date(time.getTime() + intervalHours * 60 * 60 * 1000);
        
        const count = await this.prisma.user.count({
          where: {
            createdAt: {
              gte: time,
              lt: nextTime,
            }
          }
        });
        
        return { time: time.toISOString(), count };
      })
    );

    const orderCounts = await Promise.all(
      timePoints.map(async (time, index) => {
        const nextTime = index < timePoints.length - 1 
          ? timePoints[index + 1] 
          : new Date(time.getTime() + intervalHours * 60 * 60 * 1000);
        
        const count = await this.prisma.paymentOrder.count({
          where: {
            createdAt: {
              gte: time,
              lt: nextTime,
            }
          }
        });
        
        return { time: time.toISOString(), count };
      })
    );

    const revenues = await Promise.all(
      timePoints.map(async (time, index) => {
        const nextTime = index < timePoints.length - 1 
          ? timePoints[index + 1] 
          : new Date(time.getTime() + intervalHours * 60 * 60 * 1000);
        
        const sum = await this.prisma.paymentOrder.aggregate({
          _sum: { amount: true },
          where: {
            status: 'PAID',
            createdAt: {
              gte: time,
              lt: nextTime,
            }
          }
        });
        
        return { time: time.toISOString(), amount: sum._sum.amount || 0 };
      })
    );

    return {
      userRegistrations,
      orderCounts,
      revenues,
      period,
    };
  }

  // ============= 用户管理 =============
  async getUsers(query: UserManagementDto) {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { nickname: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          subscriptions: {
            where: { status: 'ACTIVE' },
            include: { package: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map(user => ({
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
        status: user.status,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        currentSubscription: user.subscriptions[0] || null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserDetail(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        subscriptions: {
          include: { package: true },
          orderBy: { createdAt: 'desc' },
        },
        paymentOrders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        sentInvites: {
          include: { invitee: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user;
  }

  async updateUser(id: string, updateData: any) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async banUser(id: string, banData: { reason: string; duration?: number }) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (user.status === 'BANNED') {
      throw new BadRequestException('用户已被封禁');
    }

    // 更新用户状态为封禁
    await this.prisma.user.update({
      where: { id },
      data: {
        status: 'BANNED',
        isActive: false,
      },
    });

    // 记录封禁日志（如果有日志表的话）
    // await this.prisma.adminLog.create({
    //   data: {
    //     action: 'BAN_USER',
    //     targetId: id,
    //     reason: banData.reason,
    //     duration: banData.duration,
    //   },
    // });

    return { message: '用户封禁成功' };
  }

  async unbanUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (user.status !== 'BANNED') {
      throw new BadRequestException('用户未被封禁');
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        isActive: true,
      },
    });

    return { message: '用户解封成功' };
  }

  // ============= 订阅管理 =============
  async getSubscriptions(query: SubscriptionManagementDto) {
    const {
      page = 1,
      limit = 20,
      status,
      packageId,
      userId,
      autoRenew,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;

    const where: any = {};

    if (status) where.status = status;
    if (packageId) where.packageId = packageId;
    if (userId) where.userId = userId;
    if (autoRenew !== undefined) where.autoRenew = autoRenew;

    const [subscriptions, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, nickname: true } },
          package: true,
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.subscription.count({ where }),
    ]);

    return {
      data: subscriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSubscriptionStats(query: AdminStatsDto) {
    const { period = 'month' } = query;
    
    const [
      totalSubscriptions,
      activeSubscriptions,
      expiredSubscriptions,
      subscriptionsByPackage,
    ] = await Promise.all([
      this.prisma.subscription.count(),
      this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      this.prisma.subscription.count({ where: { status: 'EXPIRED' } }),
      this.prisma.subscription.groupBy({
        by: ['packageId'],
        _count: { id: true },
        include: { package: { select: { name: true } } },
      }),
    ]);

    return {
      overview: {
        total: totalSubscriptions,
        active: activeSubscriptions,
        expired: expiredSubscriptions,
      },
      byPackage: subscriptionsByPackage,
    };
  }

  async updateSubscription(id: string, updateData: any) {
    const subscription = await this.prisma.subscription.findUnique({ where: { id } });
    
    if (!subscription) {
      throw new NotFoundException('订阅不存在');
    }

    return this.prisma.subscription.update({
      where: { id },
      data: updateData,
    });
  }

  async extendSubscription(id: string, extendData: { days: number; reason: string }) {
    const subscription = await this.prisma.subscription.findUnique({ where: { id } });
    
    if (!subscription) {
      throw new NotFoundException('订阅不存在');
    }

    const newEndDate = new Date(subscription.endDate);
    newEndDate.setDate(newEndDate.getDate() + extendData.days);

    await this.prisma.subscription.update({
      where: { id },
      data: {
        endDate: newEndDate,
        status: 'ACTIVE', // 延长时激活订阅
      },
    });

    return { message: `订阅已延长 ${extendData.days} 天` };
  }

  // ============= 支付订单管理 =============
  async getOrders(query: any) {
    const {
      page = 1,
      limit = 20,
      status,
      paymentMethod,
      userId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;

    const where: any = {};

    if (status) where.status = status;
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (userId) where.userId = userId;

    const [orders, total] = await Promise.all([
      this.prisma.paymentOrder.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, nickname: true } },
          package: true,
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.paymentOrder.count({ where }),
    ]);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPaymentStats(query: AdminStatsDto) {
    const [
      totalOrders,
      paidOrders,
      failedOrders,
      totalRevenue,
      ordersByMethod,
    ] = await Promise.all([
      this.prisma.paymentOrder.count(),
      this.prisma.paymentOrder.count({ where: { status: 'PAID' } }),
      this.prisma.paymentOrder.count({ where: { status: 'FAILED' } }),
      this.prisma.paymentOrder.aggregate({
        _sum: { amount: true },
        where: { status: 'PAID' }
      }),
      this.prisma.paymentOrder.groupBy({
        by: ['paymentMethod'],
        _count: { id: true },
        _sum: { amount: true },
        where: { status: 'PAID' }
      }),
    ]);

    return {
      overview: {
        total: totalOrders,
        paid: paidOrders,
        failed: failedOrders,
        revenue: totalRevenue._sum.amount || 0,
      },
      byMethod: ordersByMethod.reduce((acc, item) => {
        acc[item.paymentMethod] = {
          count: item._count.id,
          revenue: item._sum.amount || 0,
        };
        return acc;
      }, {}),
    };
  }

  async processRefund(orderNo: string, refundData: { reason: string; amount?: number }) {
    const order = await this.prisma.paymentOrder.findUnique({
      where: { orderNo },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== 'PAID') {
      throw new BadRequestException('只能退款已支付的订单');
    }

    // 这里应该调用具体的支付平台退款接口
    // 目前先模拟处理
    
    await this.prisma.paymentOrder.update({
      where: { orderNo },
      data: {
        status: 'CANCELLED', // 或者新增 REFUNDED 状态
        // refundReason: refundData.reason,
        // refundAmount: refundData.amount || order.amount,
        // refundAt: new Date(),
      },
    });

    return { message: '退款处理成功' };
  }

  // ============= 系统配置 =============
  async getSystemConfig() {
    // 从数据库或配置文件获取系统配置
    // 这里模拟返回配置数据
    return {
      site: {
        siteName: '91Writing',
        siteDescription: '智能写作平台',
        logo: '/logo.png',
        favicon: '/favicon.ico',
      },
      payment: {
        alipay: {
          enabled: true,
          sandbox: true,
        },
        wechat: {
          enabled: true,
          sandbox: true,
        },
      },
      email: {
        enabled: true,
        provider: 'smtp',
      },
      ai: {
        openai: {
          enabled: true,
          model: 'gpt-3.5-turbo',
          maxTokens: 2000,
        },
      },
    };
  }

  async updateSystemConfig(configData: SystemConfigDto) {
    // 这里应该将配置保存到数据库或配置文件
    // 目前先模拟处理
    console.log('更新系统配置:', configData);
    
    return { message: '系统配置更新成功' };
  }

  async getSystemLogs(query: any) {
    // 这里应该从日志系统获取日志数据
    // 目前先模拟返回
    return {
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    };
  }

  // ============= 套餐管理 =============
  async getPackages() {
    return this.prisma.package.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createPackage(packageData: any) {
    return this.prisma.package.create({
      data: packageData,
    });
  }

  async updatePackage(id: string, updateData: any) {
    const pkg = await this.prisma.package.findUnique({ where: { id } });
    
    if (!pkg) {
      throw new NotFoundException('套餐不存在');
    }

    return this.prisma.package.update({
      where: { id },
      data: updateData,
    });
  }

  async deletePackage(id: string) {
    const pkg = await this.prisma.package.findUnique({ where: { id } });
    
    if (!pkg) {
      throw new NotFoundException('套餐不存在');
    }

    // 检查是否有活跃订阅使用此套餐
    const activeSubscriptions = await this.prisma.subscription.count({
      where: {
        packageId: id,
        status: 'ACTIVE',
      },
    });

    if (activeSubscriptions > 0) {
      throw new BadRequestException('无法删除有活跃订阅的套餐');
    }

    await this.prisma.package.delete({ where: { id } });
    
    return { message: '套餐删除成功' };
  }
}