import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, IsDateString, IsObject } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class AdminStatsDto {
  @ApiPropertyOptional({
    description: '统计周期',
    enum: ['day', 'week', 'month', 'year'],
    default: 'month'
  })
  @IsOptional()
  @IsEnum(['day', 'week', 'month', 'year'])
  period?: string = 'month';

  @ApiPropertyOptional({
    description: '开始日期',
    example: '2024-01-01'
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: '结束日期',
    example: '2024-12-31'
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class UserManagementDto {
  @ApiPropertyOptional({
    description: '页码',
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({
    description: '每页数量',
    default: 20
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 20;

  @ApiPropertyOptional({
    description: '搜索关键词（邮箱或昵称）'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: '用户角色过滤',
    enum: ['USER', 'ADMIN', 'MODERATOR']
  })
  @IsOptional()
  @IsEnum(['USER', 'ADMIN', 'MODERATOR'])
  @Transform(({ value }) => value === '' ? undefined : value)
  role?: string;

  @ApiPropertyOptional({
    description: '用户状态过滤',
    enum: ['ACTIVE', 'INACTIVE', 'BANNED']
  })
  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'BANNED'])
  @Transform(({ value }) => value === '' ? undefined : value)
  status?: string;

  @ApiPropertyOptional({
    description: '排序字段',
    default: 'createdAt'
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: '排序方向',
    enum: ['asc', 'desc'],
    default: 'desc'
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: string = 'desc';
}

export class SubscriptionManagementDto {
  @ApiPropertyOptional({
    description: '页码',
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({
    description: '每页数量',
    default: 20
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 20;

  @ApiPropertyOptional({
    description: '订阅状态过滤',
    enum: ['ACTIVE', 'EXPIRED', 'CANCELLED']
  })
  @IsOptional()
  @IsEnum(['ACTIVE', 'EXPIRED', 'CANCELLED'])
  @Transform(({ value }) => value === '' ? undefined : value)
  status?: string;

  @ApiPropertyOptional({
    description: '套餐ID过滤'
  })
  @IsOptional()
  @IsString()
  packageId?: string;

  @ApiPropertyOptional({
    description: '用户ID过滤'
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: '是否自动续费',
    type: Boolean
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  autoRenew?: boolean;

  @ApiPropertyOptional({
    description: '排序字段',
    default: 'createdAt'
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: '排序方向',
    enum: ['asc', 'desc'],
    default: 'desc'
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: string = 'desc';
}

export class SystemConfigDto {
  @ApiPropertyOptional({
    description: '站点配置',
    example: {
      siteName: '91Writing',
      siteDescription: '智能写作平台',
      logo: 'https://example.com/logo.png',
      favicon: 'https://example.com/favicon.ico'
    }
  })
  @IsOptional()
  @IsObject()
  site?: Record<string, any>;

  @ApiPropertyOptional({
    description: '支付配置',
    example: {
      alipay: {
        enabled: true,
        appId: 'xxx',
        merchantPrivateKey: 'xxx'
      },
      wechat: {
        enabled: true,
        appId: 'xxx',
        mchId: 'xxx'
      }
    }
  })
  @IsOptional()
  @IsObject()
  payment?: Record<string, any>;

  @ApiPropertyOptional({
    description: '邮件配置',
    example: {
      smtp: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'user@gmail.com',
          pass: 'password'
        }
      }
    }
  })
  @IsOptional()
  @IsObject()
  email?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'AI服务配置',
    example: {
      openai: {
        apiKey: 'sk-xxx',
        model: 'gpt-3.5-turbo',
        maxTokens: 2000
      }
    }
  })
  @IsOptional()
  @IsObject()
  ai?: Record<string, any>;

  @ApiPropertyOptional({
    description: '安全配置',
    example: {
      jwt: {
        secret: 'your-secret-key',
        expiresIn: '7d'
      },
      bcrypt: {
        rounds: 12
      }
    }
  })
  @IsOptional()
  @IsObject()
  security?: Record<string, any>;

  @ApiPropertyOptional({
    description: '其他配置'
  })
  @IsOptional()
  @IsObject()
  others?: Record<string, any>;
}

export class OrderManagementDto {
  @ApiPropertyOptional({
    description: '页码',
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({
    description: '每页数量',
    default: 20
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 20;

  @ApiPropertyOptional({
    description: '订单状态过滤',
    enum: ['PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED']
  })
  @IsOptional()
  @IsEnum(['PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED'])
  @Transform(({ value }) => value === '' ? undefined : value)
  status?: string;

  @ApiPropertyOptional({
    description: '支付方式过滤',
    enum: ['ALIPAY', 'WECHAT', 'STRIPE', 'PAYPAL']
  })
  @IsOptional()
  @IsEnum(['ALIPAY', 'WECHAT', 'STRIPE', 'PAYPAL'])
  @Transform(({ value }) => value === '' ? undefined : value)
  paymentMethod?: string;

  @ApiPropertyOptional({
    description: '用户ID过滤'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value === '' ? undefined : value)
  userId?: string;

  @ApiPropertyOptional({
    description: '排序字段',
    default: 'createdAt'
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: '排序方向',
    enum: ['asc', 'desc'],
    default: 'desc'
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: string = 'desc';
}