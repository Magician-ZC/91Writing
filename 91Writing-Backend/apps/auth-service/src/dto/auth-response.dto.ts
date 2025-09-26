import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { UserRole, UserStatus } from '@prisma/client';

export class AuthUserDto {
  @ApiProperty({
    description: '用户ID',
    example: 'user_123456789'
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: '用户邮箱',
    example: 'user@91writing.com'
  })
  @Expose()
  email: string;

  @ApiPropertyOptional({
    description: '用户昵称',
    example: '写作爱好者'
  })
  @Expose()
  nickname?: string;

  @ApiProperty({
    description: '用户角色',
    enum: UserRole,
    example: UserRole.USER
  })
  @Expose()
  role: UserRole;

  @ApiProperty({
    description: '用户状态',
    enum: UserStatus,
    example: UserStatus.ACTIVE
  })
  @Expose()
  status: UserStatus;

  @ApiProperty({
    description: '是否激活',
    example: true
  })
  @Expose()
  isActive: boolean;

  @ApiPropertyOptional({
    description: '租户ID',
    example: 'tenant_123'
  })
  @Expose()
  tenantId?: string;

  @ApiPropertyOptional({
    description: '最后登录时间',
    example: '2024-12-19T10:30:00Z'
  })
  @Expose()
  @Transform(({ value }) => value?.toISOString())
  lastLoginAt?: Date;

  @ApiProperty({
    description: '创建时间',
    example: '2024-12-19T10:30:00Z'
  })
  @Expose()
  @Transform(({ value }) => value?.toISOString())
  createdAt: Date;

  // 排除敏感字段
  @Exclude()
  passwordHash: string;

  constructor(partial: Partial<AuthUserDto>) {
    Object.assign(this, partial);
  }
}

export class TokensDto {
  @ApiProperty({
    description: '访问令牌',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  @Expose()
  accessToken: string;

  @ApiProperty({
    description: '刷新令牌',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  @Expose()
  refreshToken: string;

  @ApiProperty({
    description: '令牌类型',
    example: 'Bearer'
  })
  @Expose()
  tokenType: string = 'Bearer';

  @ApiProperty({
    description: '访问令牌过期时间（秒）',
    example: 604800
  })
  @Expose()
  expiresIn: number;

  @ApiProperty({
    description: '刷新令牌过期时间（秒）',
    example: 2592000
  })
  @Expose()
  refreshExpiresIn: number;

  constructor(partial: Partial<TokensDto>) {
    Object.assign(this, partial);
  }
}

export class LoginResponseDto {
  @ApiProperty({
    description: '用户信息',
    type: AuthUserDto
  })
  @Expose()
  user: AuthUserDto;

  @ApiProperty({
    description: '令牌信息',
    type: TokensDto
  })
  @Expose()
  tokens: TokensDto;

  @ApiProperty({
    description: '登录时间',
    example: '2024-12-19T10:30:00Z'
  })
  @Expose()
  loginAt: string;

  @ApiPropertyOptional({
    description: '订阅信息',
    example: {
      packageId: 'package_premium',
      status: 'ACTIVE',
      endDate: '2025-01-01T00:00:00Z'
    }
  })
  @Expose()
  subscription?: {
    packageId: string;
    status: string;
    endDate: Date;
  };

  constructor(partial: Partial<LoginResponseDto>) {
    Object.assign(this, partial);
  }
}

export class RegisterResponseDto {
  @ApiProperty({
    description: '用户信息',
    type: AuthUserDto
  })
  @Expose()
  user: AuthUserDto;

  @ApiProperty({
    description: '注册时间',
    example: '2024-12-19T10:30:00Z'
  })
  @Expose()
  registeredAt: string;

  @ApiProperty({
    description: '是否需要邮箱验证',
    example: true
  })
  @Expose()
  needEmailVerification: boolean;

  @ApiPropertyOptional({
    description: '验证邮件发送状态',
    example: '验证邮件已发送到您的邮箱'
  })
  @Expose()
  verificationMessage?: string;

  constructor(partial: Partial<RegisterResponseDto>) {
    Object.assign(this, partial);
  }
}

export class RefreshResponseDto {
  @ApiProperty({
    description: '新的令牌信息',
    type: TokensDto
  })
  @Expose()
  tokens: TokensDto;

  @ApiProperty({
    description: '刷新时间',
    example: '2024-12-19T10:30:00Z'
  })
  @Expose()
  refreshedAt: string;

  constructor(partial: Partial<RefreshResponseDto>) {
    Object.assign(this, partial);
  }
}

export class LogoutResponseDto {
  @ApiProperty({
    description: '登出时间',
    example: '2024-12-19T10:30:00Z'
  })
  @Expose()
  logoutAt: string;

  @ApiProperty({
    description: '消息',
    example: '已成功登出'
  })
  @Expose()
  message: string;

  constructor(partial: Partial<LogoutResponseDto>) {
    Object.assign(this, partial);
  }
}

export class PasswordResetResponseDto {
  @ApiProperty({
    description: '重置邮件发送状态',
    example: '密码重置邮件已发送到您的邮箱'
  })
  @Expose()
  message: string;

  @ApiProperty({
    description: '发送时间',
    example: '2024-12-19T10:30:00Z'
  })
  @Expose()
  sentAt: string;

  constructor(partial: Partial<PasswordResetResponseDto>) {
    Object.assign(this, partial);
  }
}

export class EmailVerificationResponseDto {
  @ApiProperty({
    description: '验证状态',
    example: true
  })
  @Expose()
  verified: boolean;

  @ApiProperty({
    description: '验证时间',
    example: '2024-12-19T10:30:00Z'
  })
  @Expose()
  verifiedAt: string;

  @ApiProperty({
    description: '消息',
    example: '邮箱验证成功'
  })
  @Expose()
  message: string;

  constructor(partial: Partial<EmailVerificationResponseDto>) {
    Object.assign(this, partial);
  }
}
