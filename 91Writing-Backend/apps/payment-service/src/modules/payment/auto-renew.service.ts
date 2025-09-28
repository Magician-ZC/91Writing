import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@app/database';
import { PaymentService } from './payment.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { SubscriptionStatus, PaymentMethod } from '@prisma/client';

@Injectable()
export class AutoRenewService {
  private readonly logger = new Logger(AutoRenewService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async processAutoRenewals() {
    this.logger.log('开始处理自动续费任务');

    try {
      // 查找需要自动续费的订阅
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const expiringSubscriptions = await this.prisma.subscription.findMany({
        where: {
          status: SubscriptionStatus.ACTIVE,
          autoRenew: true,
          endDate: { lte: tomorrow },
        },
        include: {
          package: true,
          user: true,
        },
      });

      this.logger.log(`找到 ${expiringSubscriptions.length} 个需要续费的订阅`);

      for (const subscription of expiringSubscriptions) {
        try {
          await this.processAutoRenewal(subscription);
        } catch (error) {
          this.logger.error(
            `处理订阅 ${subscription.id} 自动续费失败:`,
            error,
          );
        }
      }
    } catch (error) {
      this.logger.error('自动续费任务执行失败:', error);
    }
  }

  private async processAutoRenewal(subscription: any) {
    const { id, userId, packageId, user, package: pkg } = subscription;

    this.logger.log(
      `处理用户 ${user.email} 的订阅 ${id} 自动续费`,
    );

    try {
      // 创建续费订单
      const order = await this.paymentService.createOrder(userId, {
        packageId,
        paymentMethod: PaymentMethod.ALIPAY, // 默认使用支付宝
      });

      // 尝试自动支付（需要用户之前绑定的支付方式）
      // 这里简化处理，实际项目中可能需要调用免密支付接口
      const autoPayResult = await this.attemptAutoPayment(order, user);

      if (autoPayResult.success) {
        // 支付成功，完成续费
        await this.paymentService.completePayment(
          order.orderNo,
          autoPayResult.transactionId,
        );

        this.logger.log(
          `用户 ${user.email} 自动续费成功，订单号: ${order.orderNo}`,
        );

        // 发送续费成功通知
        await this.sendRenewalNotification(user, pkg, 'success');
      } else {
        // 自动支付失败，发送提醒通知
        this.logger.warn(
          `用户 ${user.email} 自动续费失败: ${autoPayResult.error}`,
        );

        // 关闭自动续费
        await this.prisma.subscription.update({
          where: { id },
          data: { autoRenew: false },
        });

        // 发送续费失败通知
        await this.sendRenewalNotification(user, pkg, 'failed', autoPayResult.error);
      }
    } catch (error) {
      this.logger.error(`自动续费处理失败:`, error);

      // 发送系统错误通知
      await this.sendRenewalNotification(user, pkg, 'error', error.message);
    }
  }

  private async attemptAutoPayment(order: any, user: any) {
    // 模拟自动支付逻辑
    // 实际项目中需要调用支付平台的免密支付或代扣接口
    
    // 这里简化为随机成功/失败
    const success = Math.random() > 0.2; // 80% 成功率

    if (success) {
      return {
        success: true,
        transactionId: `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
    } else {
      return {
        success: false,
        error: '银行卡余额不足或支付失败',
      };
    }
  }

  private async sendRenewalNotification(
    user: any,
    pkg: any,
    type: 'success' | 'failed' | 'error',
    errorMessage?: string,
  ) {
    // 实际项目中集成邮件服务或短信服务
    const messages = {
      success: `恭喜！您的 ${pkg.name} 订阅已成功续费`,
      failed: `抱歉，您的 ${pkg.name} 订阅自动续费失败：${errorMessage}`,
      error: `系统错误，${pkg.name} 订阅续费处理异常：${errorMessage}`,
    };

    this.logger.log(
      `发送续费通知给用户 ${user.email}: ${messages[type]}`,
    );

    // 这里可以集成邮件服务、短信服务或站内消息系统
    // await this.emailService.sendRenewalNotification(user.email, messages[type]);
    // await this.smsService.sendRenewalAlert(user.phone, messages[type]);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processExpiredSubscriptions() {
    this.logger.log('检查过期订阅');
    
    const result = await this.subscriptionService.checkExpiredSubscriptions();
    this.logger.log(`处理了 ${result.expired} 个过期订阅`);
  }

  @Cron(CronExpression.EVERY_HOUR)
  async processExpiredOrders() {
    this.logger.log('检查过期订单');
    
    const result = await this.paymentService.processExpiredOrders();
    this.logger.log(`处理了 ${result.expired} 个过期订单`);
  }
}
