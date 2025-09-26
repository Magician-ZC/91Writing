import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { UserRole, UserStatus } from '@prisma/client';

export class UserResponseDto {
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

  @ApiProperty({
    description: '更新时间',
    example: '2024-12-19T10:30:00Z'
  })
  @Expose()
  @Transform(({ value }) => value?.toISOString())
  updatedAt: Date;

  // 排除敏感字段
  @Exclude()
  password: string;

  @Exclude()
  passwordHash: string;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}

export class UserProfileResponseDto extends UserResponseDto {
  @ApiPropertyOptional({
    description: '用户配置',
    example: {
      avatar: 'https://example.com/avatar.jpg',
      bio: '热爱写作的用户',
      preferences: {
        theme: 'light',
        language: 'zh-CN'
      }
    }
  })
  @Expose()
  profile?: {
    avatar?: string;
    bio?: string;
    preferences?: Record<string, any>;
  };

  @ApiPropertyOptional({
    description: '订阅信息',
    example: {
      packageId: 'package_premium',
      status: 'ACTIVE',
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2025-01-01T00:00:00Z'
    }
  })
  @Expose()
  subscription?: {
    packageId: string;
    status: string;
    startDate: Date;
    endDate: Date;
  };
}

export class UserListResponseDto {
  @ApiProperty({
    description: '用户列表',
    type: [UserResponseDto]
  })
  @Expose()
  users: UserResponseDto[];

  @ApiProperty({
    description: '分页信息',
    example: {
      total: 100,
      page: 1,
      limit: 10,
      totalPages: 10
    }
  })
  @Expose()
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  constructor(users: UserResponseDto[], pagination: any) {
    this.users = users;
    this.pagination = pagination;
  }
}

export class UserStatsResponseDto {
  @ApiProperty({
    description: '总用户数',
    example: 1000
  })
  @Expose()
  totalUsers: number;

  @ApiProperty({
    description: '活跃用户数',
    example: 800
  })
  @Expose()
  activeUsers: number;

  @ApiProperty({
    description: '新注册用户数',
    example: 50
  })
  @Expose()
  newUsers: number;

  @ApiProperty({
    description: '按角色分组的统计',
    example: {
      USER: 900,
      ADMIN: 5,
      MODERATOR: 10
    }
  })
  @Expose()
  usersByRole: Record<UserRole, number>;

  @ApiProperty({
    description: '按状态分组的统计',
    example: {
      ACTIVE: 800,
      INACTIVE: 150,
      BANNED: 50
    }
  })
  @Expose()
  usersByStatus: Record<UserStatus, number>;

  constructor(partial: Partial<UserStatsResponseDto>) {
    Object.assign(this, partial);
  }
}
