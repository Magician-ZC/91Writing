import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '@app/database';
import { HealthModule } from './modules/health/health.module';
import { PackageModule } from './modules/package/package.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { PaymentModule } from './modules/payment/payment.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', '91writing_default_secret'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
    DatabaseModule,
    HealthModule,
    PackageModule,
    SubscriptionModule,
    PaymentModule,
  ],
  providers: [JwtStrategy],
})
export class AppModule {}
