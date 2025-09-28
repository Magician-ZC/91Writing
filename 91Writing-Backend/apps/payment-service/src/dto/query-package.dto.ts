import { IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PackageStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class QueryPackageDto {
  @ApiProperty({ description: '状态', enum: PackageStatus, required: false })
  @IsOptional()
  @IsEnum(PackageStatus)
  status?: PackageStatus;

  @ApiProperty({ description: '页码', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiProperty({ description: '每页数量', example: 10, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}
