import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PackageModule } from '../package/package.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { AlipayService } from './alipay.service';
import { WechatService } from './wechat.service';

@Module({
  imports: [PackageModule, SubscriptionModule],
  controllers: [PaymentController],
  providers: [PaymentService, AlipayService, WechatService],
  exports: [PaymentService],
})
export class PaymentModule {}
