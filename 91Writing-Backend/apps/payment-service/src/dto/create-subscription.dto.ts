import { IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateSubscriptionDto {
  @ApiProperty({ description: '套餐ID', example: 1 })
  @IsNumber()
  @Type(() => Number)
  packageId: number;

  @ApiProperty({ description: '是否自动续费', example: false, required: false })
  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;
}
