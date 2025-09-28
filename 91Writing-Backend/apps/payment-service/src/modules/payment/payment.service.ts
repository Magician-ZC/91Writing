import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { CreatePaymentOrderDto } from '../../dto/create-payment-order.dto';
import { QueryPaymentOrderDto } from '../../dto/query-payment-order.dto';
import { PaymentStatus, PaymentMethod } from '@prisma/client';
import { PackageService } from '../package/package.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { AlipayService } from './alipay.service';
import { WechatService } from './wechat.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly packageService: PackageService,
    private readonly subscriptionService: SubscriptionService,
    private readonly alipayService: AlipayService,
    private readonly wechatService: WechatService,
  ) {}

  async createOrder(userId: string, createOrderDto: CreatePaymentOrderDto) {
    const { packageId, paymentMethod } = createOrderDto;

    // 检查套餐
    const package_ = await this.packageService.findOne(packageId);

    // 生成订单号
    const orderNo = this.generateOrderNo();

    // 设置过期时间（15分钟）
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    const order = await this.prisma.paymentOrder.create({
      data: {
        orderNo,
        userId,
        packageId,
        amount: package_.price,
        paymentMethod,
        status: PaymentStatus.PENDING,
        expiresAt,
      },
      include: {
        package: true,
        user: {
          select: { id: true, email: true, username: true, nickname: true },
        },
      },
    });

    return order;
  }

  async findUserOrders(userId: string, query: QueryPaymentOrderDto) {
    const { status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where = { userId, ...(status && { status }) };

    const [orders, total] = await Promise.all([
      this.prisma.paymentOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          package: true,
          user: {
            select: { id: true, email: true, username: true, nickname: true },
          },
        },
      }),
      this.prisma.paymentOrder.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        current: page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOrder(orderNo: string, userId?: string) {
    const order = await this.prisma.paymentOrder.findUnique({
      where: { orderNo },
      include: {
        package: true,
        user: {
          select: { id: true, email: true, username: true, nickname: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (userId && order.userId !== userId) {
      throw new NotFoundException('订单不存在');
    }

    return order;
  }

  async pay(orderNo: string, userId: string) {
    const order = await this.findOrder(orderNo, userId);

    if (order.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('订单状态不正确');
    }

    if (new Date() > order.expiresAt) {
      throw new BadRequestException('订单已过期');
    }

    // 根据支付方式调用不同的支付服务
    let paymentResult;
    switch (order.paymentMethod) {
      case PaymentMethod.ALIPAY:
        paymentResult = await this.alipayService.createPayment({
          orderNo: order.orderNo,
          amount: order.amount.toNumber(),
          subject: `${order.package.name} - 91Writing`,
        });
        break;
      case PaymentMethod.WECHAT:
        paymentResult = await this.wechatService.createPayment({
          orderNo: order.orderNo,
          amount: order.amount.toNumber(),
          description: `${order.package.name} - 91Writing`,
        });
        break;
      default:
        throw new BadRequestException('不支持的支付方式');
    }

    return {
      order,
      payment: paymentResult,
    };
  }

  async handleAlipayNotify(notifyData: any) {
    // 验证通知签名
    const isValid = await this.alipayService.verifyNotify(notifyData);
    if (!isValid) {
      throw new BadRequestException('Invalid notification');
    }

    const { out_trade_no: orderNo, trade_status } = notifyData;
    
    if (trade_status === 'TRADE_SUCCESS') {
      await this.completePayment(orderNo, notifyData.trade_no);
    }

    return 'success';
  }

  async handleWechatNotify(notifyData: any) {
    // 验证微信通知
    const isValid = await this.wechatService.verifyNotify(notifyData);
    if (!isValid) {
      throw new BadRequestException('Invalid notification');
    }

    const { out_trade_no: orderNo, transaction_id } = notifyData;
    
    if (notifyData.trade_state === 'SUCCESS') {
      await this.completePayment(orderNo, transaction_id);
    }

    return { code: 'SUCCESS', message: '成功' };
  }

  async completePayment(orderNo: string, transactionId: string) {
    const order = await this.findOrder(orderNo);

    if (order.status === PaymentStatus.PAID) {
      return order; // 已经处理过了
    }

    // 更新订单状态
    const updatedOrder = await this.prisma.paymentOrder.update({
      where: { orderNo },
      data: {
        status: PaymentStatus.PAID,
        paidAt: new Date(),
        transactionId,
      },
      include: {
        package: true,
        user: true,
      },
    });

    // 创建或更新订阅
    await this.subscriptionService.create(order.userId, {
      packageId: order.packageId,
    });

    // 激活订阅
    const subscription = await this.subscriptionService.findByUser(order.userId);
    if (subscription) {
      await this.subscriptionService.activate(subscription.id);
    }

    return updatedOrder;
  }

  async cancelOrder(orderNo: string, userId: string) {
    const order = await this.findOrder(orderNo, userId);

    if (order.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('订单状态不正确');
    }

    return this.prisma.paymentOrder.update({
      where: { orderNo },
      data: { status: PaymentStatus.CANCELLED },
      include: { package: true },
    });
  }

  private generateOrderNo(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `91W${timestamp}${random}`;
  }

  // 定时任务：处理过期订单
  async processExpiredOrders() {
    const expiredOrders = await this.prisma.paymentOrder.findMany({
      where: {
        status: PaymentStatus.PENDING,
        expiresAt: { lt: new Date() },
      },
    });

    if (expiredOrders.length > 0) {
      await this.prisma.paymentOrder.updateMany({
        where: {
          id: { in: expiredOrders.map(o => o.id) },
        },
        data: { status: PaymentStatus.CANCELLED },
      });
    }

    return { expired: expiredOrders.length };
  }
}
