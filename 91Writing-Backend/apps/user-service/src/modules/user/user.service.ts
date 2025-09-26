import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UpdateUserDto, UpdatePasswordDto } from '../../dto/update-user.dto';
import { QueryUserDto, UserStatsDto } from '../../dto/query-user.dto';
import { UserResponseDto, UserListResponseDto, UserStatsResponseDto, UserProfileResponseDto } from '../../dto/user-response.dto';
import { plainToClass } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { UserRole, UserStatus } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建用户
   */
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // 检查邮箱是否已存在
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('该邮箱已被注册');
    }

    // 生成密码哈希
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(createUserDto.password, saltRounds);

    // 创建用户
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        passwordHash,
        nickname: createUserDto.nickname || createUserDto.email.split('@')[0],
        role: createUserDto.role || UserRole.USER,
        status: createUserDto.status || UserStatus.ACTIVE,
        isActive: true,
        tenantId: createUserDto.tenantId,
      },
      include: {
        profile: true,
      },
    });

    return plainToClass(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * 查询用户列表
   */
  async findMany(queryDto: QueryUserDto): Promise<UserListResponseDto> {
    const { page = 1, limit = 10, search, role, status, isActive, tenantId, sortBy = 'createdAt', sortOrder = 'desc' } = queryDto;
    
    const skip = (page - 1) * limit;
    
    // 构建查询条件
    const where: any = {};
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { nickname: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (role) where.role = role;
    if (status) where.status = status;
    if (typeof isActive === 'boolean') where.isActive = isActive;
    if (tenantId) where.tenantId = tenantId;

    // 执行查询
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          profile: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const userDtos = users.map(user => 
      plainToClass(UserResponseDto, user, {
        excludeExtraneousValues: true,
      })
    );

    const totalPages = Math.ceil(total / limit);

    return new UserListResponseDto(userDtos, {
      total,
      page,
      limit,
      totalPages,
    });
  }

  /**
   * 根据ID查询用户
   */
  async findOne(id: string): Promise<UserProfileResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        subscription: {
          include: {
            package: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return plainToClass(UserProfileResponseDto, {
      ...user,
      subscription: user.subscription ? {
        packageId: user.subscription.packageId,
        status: user.subscription.status,
        startDate: user.subscription.startDate,
        endDate: user.subscription.endDate,
      } : undefined,
    }, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * 根据邮箱查询用户
   */
  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return null;
    }

    return plainToClass(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * 更新用户信息
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    // 检查用户是否存在
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('用户不存在');
    }

    // 更新用户
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
        updatedAt: new Date(),
      },
      include: {
        profile: true,
      },
    });

    return plainToClass(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * 更新用户密码
   */
  async updatePassword(id: string, updatePasswordDto: UpdatePasswordDto): Promise<void> {
    // 检查用户是否存在
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 验证当前密码
    const isCurrentPasswordValid = await bcrypt.compare(
      updatePasswordDto.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('当前密码不正确');
    }

    // 生成新密码哈希
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(updatePasswordDto.newPassword, saltRounds);

    // 更新密码
    await this.prisma.user.update({
      where: { id },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * 删除用户（软删除）
   */
  async remove(id: string): Promise<void> {
    // 检查用户是否存在
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 软删除：设置为非活跃状态
    await this.prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        status: UserStatus.INACTIVE,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * 永久删除用户
   */
  async hardDelete(id: string): Promise<void> {
    // 检查用户是否存在
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 永久删除用户及其相关数据
    await this.prisma.user.delete({
      where: { id },
    });
  }

  /**
   * 获取用户统计信息
   */
  async getStats(statsDto: UserStatsDto): Promise<UserStatsResponseDto> {
    const { startDate, endDate, tenantId } = statsDto;
    
    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // 基础统计
    const [totalUsers, activeUsers, newUsers] = await Promise.all([
      this.prisma.user.count({ where: { ...where } }),
      this.prisma.user.count({ where: { ...where, isActive: true } }),
      this.prisma.user.count({ where }),
    ]);

    // 按角色统计
    const usersByRole = await this.prisma.user.groupBy({
      by: ['role'],
      where,
      _count: { role: true },
    });

    // 按状态统计
    const usersByStatus = await this.prisma.user.groupBy({
      by: ['status'],
      where,
      _count: { status: true },
    });

    // 格式化统计结果
    const roleStats = usersByRole.reduce((acc, item) => {
      acc[item.role] = item._count.role;
      return acc;
    }, {} as Record<UserRole, number>);

    const statusStats = usersByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<UserStatus, number>);

    return new UserStatsResponseDto({
      totalUsers,
      activeUsers,
      newUsers,
      usersByRole: roleStats,
      usersByStatus: statusStats,
    });
  }

  /**
   * 更新最后登录时间
   */
  async updateLastLogin(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }
}
