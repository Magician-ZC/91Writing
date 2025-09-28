import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { CommonModule } from '@app/common';
import { HealthModule } from './modules/health/health.module';
import { PackageModule } from './modules/package/package.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { PaymentModule } from './modules/payment/payment.module';

@Module({
  imports: [
    DatabaseModule,
    CommonModule,
    HealthModule,
    PackageModule,
    SubscriptionModule,
    PaymentModule,
  ],
})
export class AppModule {}
