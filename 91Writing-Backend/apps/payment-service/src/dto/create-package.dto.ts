import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsObject, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PackageStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreatePackageDto {
  @ApiProperty({ description: '套餐名称', example: 'VIP会员' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '套餐描述', example: '享受所有高级功能', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '价格', example: 99.00 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiProperty({ description: '持续天数', example: 30 })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  durationDays: number;

  @ApiProperty({ 
    description: '功能配置', 
    example: {
      maxNovels: 10,
      maxChaptersPerNovel: 100,
      aiGenerationLimit: 1000,
      advancedFeatures: true
    }
  })
  @IsObject()
  features: Record<string, any>;

  @ApiProperty({ description: '排序顺序', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sortOrder?: number;

  @ApiProperty({ description: '状态', enum: PackageStatus, required: false })
  @IsOptional()
  @IsEnum(PackageStatus)
  status?: PackageStatus;
}
