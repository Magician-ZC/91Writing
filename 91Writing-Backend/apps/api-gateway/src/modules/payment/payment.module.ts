import { Module } from '@nestjs/common';
import { PaymentsController, SubscriptionsController, PackagesController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  controllers: [PaymentsController, SubscriptionsController, PackagesController],
  providers: [PaymentService],
})
export class PaymentModule {}