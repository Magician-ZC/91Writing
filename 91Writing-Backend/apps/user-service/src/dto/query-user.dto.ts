import { ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsOptional, 
  IsEnum, 
  IsString, 
  IsInt, 
  Min, 
  Max,
  IsBoolean,
  Transform
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole, UserStatus } from '@prisma/client';

export class QueryUserDto {
  @ApiPropertyOptional({
    description: '页码',
    example: 1,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码最小为1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: '每页数量',
    example: 10,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量最小为1' })
  @Max(100, { message: '每页数量最大为100' })
  limit?: number = 10;

  @ApiPropertyOptional({
    description: '搜索关键词（邮箱或昵称）',
    example: 'user@example.com'
  })
  @IsOptional()
  @IsString({ message: '搜索关键词必须是字符串' })
  search?: string;

  @ApiPropertyOptional({
    description: '用户角色过滤',
    enum: UserRole
  })
  @IsOptional()
  @IsEnum(UserRole, { message: '无效的用户角色' })
  role?: UserRole;

  @ApiPropertyOptional({
    description: '用户状态过滤',
    enum: UserStatus
  })
  @IsOptional()
  @IsEnum(UserStatus, { message: '无效的用户状态' })
  status?: UserStatus;

  @ApiPropertyOptional({
    description: '是否激活',
    example: true
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: '激活状态必须是布尔值' })
  isActive?: boolean;

  @ApiPropertyOptional({
    description: '租户ID过滤',
    example: 'tenant_123'
  })
  @IsOptional()
  @IsString({ message: '租户ID必须是字符串' })
  tenantId?: string;

  @ApiPropertyOptional({
    description: '排序字段',
    example: 'createdAt',
    enum: ['createdAt', 'updatedAt', 'lastLoginAt', 'email', 'nickname']
  })
  @IsOptional()
  @IsString({ message: '排序字段必须是字符串' })
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: '排序方向',
    example: 'desc',
    enum: ['asc', 'desc']
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'], { message: '排序方向必须是 asc 或 desc' })
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class UserStatsDto {
  @ApiPropertyOptional({
    description: '开始日期',
    example: '2024-01-01'
  })
  @IsOptional()
  @IsString({ message: '开始日期必须是字符串' })
  startDate?: string;

  @ApiPropertyOptional({
    description: '结束日期',
    example: '2024-12-31'
  })
  @IsOptional()
  @IsString({ message: '结束日期必须是字符串' })
  endDate?: string;

  @ApiPropertyOptional({
    description: '租户ID',
    example: 'tenant_123'
  })
  @IsOptional()
  @IsString({ message: '租户ID必须是字符串' })
  tenantId?: string;
}
