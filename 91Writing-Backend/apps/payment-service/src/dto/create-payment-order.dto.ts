import { IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreatePaymentOrderDto {
  @ApiProperty({ description: '套餐ID', example: 1 })
  @IsNumber()
  @Type(() => Number)
  packageId: number;

  @ApiProperty({ description: '支付方式', enum: PaymentMethod, example: PaymentMethod.ALIPAY })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
