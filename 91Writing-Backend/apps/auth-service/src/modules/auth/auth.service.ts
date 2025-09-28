import { 
  Injectable, 
  ConflictException, 
  UnauthorizedException, 
  BadRequestException,
  NotFoundException,
  Logger 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@app/database';
import { 
  RegisterDto, 
  LoginDto, 
  ChangePasswordDto, 
  ForgotPasswordDto, 
  ResetPasswordDto,
  RefreshTokenDto 
} from '../../dto/auth.dto';
import { 
  AuthUserDto, 
  TokensDto, 
  LoginResponseDto, 
  RegisterResponseDto,
  RefreshResponseDto 
} from '../../dto/auth-response.dto';
import { plainToClass } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { UserRole, UserStatus, SubscriptionStatus, InviteStatus, RewardStatus } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 用户注册
   */
  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    const { email, password, nickname, inviteCode, acceptTerms } = registerDto;

    // 检查邮箱是否已注册
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('该邮箱已被注册');
    }

    // 验证邀请码（如果提供）
    let inviterData = null;
    this.logger.log(`注册请求 - 邮箱: ${email}, 邀请码: "${inviteCode}", 类型: ${typeof inviteCode}, 长度: ${inviteCode ? inviteCode.length : 'N/A'}`);
    
    if (inviteCode && inviteCode.trim().length > 0) {
      this.logger.log(`开始验证用户邀请码: "${inviteCode}"`);
      inviterData = await this.validateInviteCode(inviteCode.trim());
    } else {
      this.logger.log(`跳过邀请码验证 - 邀请码为空或无效: "${inviteCode}"`);
    }

    // 生成密码哈希
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 生成用户专属邀请码
    const userInviteCode = await this.generateUniqueInviteCode();

    // 创建用户（使用事务确保数据一致性）
    const user = await this.prisma.$transaction(async (tx) => {
      // 创建用户
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          nickname: nickname || email.split('@')[0],
          role: UserRole.USER,
          status: UserStatus.ACTIVE,
          isActive: true,
          inviteCode: userInviteCode,
          invitedBy: inviterData?.id || null,
          // 创建用户配置
          profile: {
            create: {
              preferences: {
                theme: 'light',
                language: 'zh-CN',
                notifications: {
                  email: true,
                  push: false,
                },
              },
              writingStats: {
                totalWords: 0,
                totalChapters: 0,
                writingDays: 0,
              },
            },
          },
        },
        include: {
          profile: true,
        },
      });

      this.logger.log(`用户注册成功: ${email}, 专属邀请码: ${userInviteCode}`);

      return newUser;
    });

    // 如果使用了邀请码，创建邀请关系并发放奖励
    if (inviterData) {
      await this.createInviteRelation(inviterData.id, user.id);
    }

    // 生成邮箱验证令牌
    const verificationToken = this.generateVerificationToken();
    
    // 保存验证令牌（这里可以存储到数据库或缓存）
    // TODO: 实现邮箱验证令牌存储

    // 发送验证邮件
    // TODO: 实现邮件发送服务

    this.logger.log(`用户注册成功: ${email}`);

    return new RegisterResponseDto({
      user: plainToClass(AuthUserDto, user, { excludeExtraneousValues: true }),
      registeredAt: new Date().toISOString(),
      needEmailVerification: true,
      verificationMessage: '验证邮件已发送到您的邮箱，请查收并点击链接完成验证',
    });
  }

  /**
   * 用户登录
   */
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { email, password, rememberMe } = loginDto;

    // 验证用户凭据
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 更新最后登录时间
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 生成令牌
    const tokens = await this.generateTokens(user, rememberMe);

    // 获取用户订阅信息
    const userWithSubscription = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        profile: true,
        subscription: {
          include: {
            package: true,
          },
        },
      },
    });

    this.logger.log(`用户登录成功: ${email}`);

    return new LoginResponseDto({
      user: plainToClass(AuthUserDto, userWithSubscription, { excludeExtraneousValues: true }),
      tokens,
      loginAt: new Date().toISOString(),
      subscription: userWithSubscription.subscription ? {
        packageId: userWithSubscription.subscription.packageId.toString(),
        status: userWithSubscription.subscription.status,
        endDate: userWithSubscription.subscription.endDate,
      } : undefined,
    });
  }

  /**
   * 刷新令牌
   */
  async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<RefreshResponseDto> {
    const { refreshToken } = refreshTokenDto;

    try {
      // 验证刷新令牌
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.getRefreshTokenSecret(),
      });

      // 获取用户信息
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          isActive: true,
          tenantId: true,
        },
      });

      if (!user || user.status !== UserStatus.ACTIVE || !user.isActive) {
        throw new UnauthorizedException('无效的刷新令牌');
      }

      // 生成新的令牌对
      const tokens = await this.generateTokens(user);

      this.logger.log(`令牌刷新成功: ${user.email}`);

      return new RefreshResponseDto({
        tokens,
        refreshedAt: new Date().toISOString(),
      });
    } catch (error) {
      throw new UnauthorizedException('无效的刷新令牌');
    }
  }

  /**
   * 验证用户凭据
   */
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return null;
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    // 检查用户状态
    if (user.status !== UserStatus.ACTIVE || !user.isActive) {
      throw new UnauthorizedException('用户账号已被禁用');
    }

    // 返回用户信息（排除密码）
    const { passwordHash, ...result } = user;
    return result;
  }

  /**
   * 修改密码
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const { currentPassword, newPassword } = changePasswordDto;

    // 获取用户当前密码
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, passwordHash: true },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 验证当前密码
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('当前密码不正确');
    }

    // 检查新密码是否与当前密码相同
    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSamePassword) {
      throw new BadRequestException('新密码不能与当前密码相同');
    }

    // 生成新密码哈希
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // 更新密码
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      },
    });

    this.logger.log(`用户修改密码成功: ${user.email}`);
  }

  /**
   * 忘记密码
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<string> {
    const { email } = forgotPasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, status: true, isActive: true },
    });

    if (!user || user.status !== UserStatus.ACTIVE || !user.isActive) {
      // 为了安全考虑，即使用户不存在也返回成功消息
      return '如果该邮箱已注册，密码重置邮件将发送到该邮箱';
    }

    // 生成重置令牌
    const resetToken = this.generateResetToken();
    
    // 保存重置令牌（这里可以存储到数据库或缓存）
    // TODO: 实现密码重置令牌存储

    // 发送重置邮件
    // TODO: 实现邮件发送服务

    this.logger.log(`密码重置邮件已发送: ${email}`);

    return '密码重置邮件已发送到您的邮箱';
  }

  /**
   * 重置密码
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { token, newPassword } = resetPasswordDto;

    // 验证重置令牌
    // TODO: 实现令牌验证逻辑
    const userId = await this.validateResetToken(token);

    if (!userId) {
      throw new BadRequestException('无效或已过期的重置令牌');
    }

    // 生成新密码哈希
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // 更新密码
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      },
    });

    // 删除重置令牌
    // TODO: 清除已使用的重置令牌

    this.logger.log(`用户重置密码成功: ${userId}`);
  }

  /**
   * 生成JWT令牌对
   */
  private async generateTokens(user: any, rememberMe: boolean = false): Promise<TokensDto> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    // 访问令牌配置
    const accessTokenExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '7d');
    const refreshTokenExpiresIn = rememberMe ? '30d' : '7d';

    // 生成访问令牌
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: accessTokenExpiresIn,
    });

    // 生成刷新令牌
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.getRefreshTokenSecret(),
      expiresIn: refreshTokenExpiresIn,
    });

    return new TokensDto({
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.parseExpiresIn(accessTokenExpiresIn),
      refreshExpiresIn: this.parseExpiresIn(refreshTokenExpiresIn),
    });
  }

  /**
   * 获取刷新令牌密钥
   */
  private getRefreshTokenSecret(): string {
    return this.configService.get<string>('JWT_REFRESH_SECRET', 
      this.configService.get<string>('JWT_SECRET') + '_refresh'
    );
  }

  /**
   * 解析过期时间为秒数
   */
  private parseExpiresIn(expiresIn: string): number {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));
    
    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 604800; // 默认7天
    }
  }

  /**
   * 生成邮箱验证令牌
   */
  private generateVerificationToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * 生成密码重置令牌
   */
  private generateResetToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * 验证用户邀请码
   */
  private async validateInviteCode(inviteCode: string): Promise<any> {
    // 查找邀请用户
    const inviter = await this.prisma.user.findUnique({
      where: { inviteCode: inviteCode.trim() },
      select: { 
        id: true, 
        email: true, 
        nickname: true, 
        inviteCode: true,
        status: true,
        isActive: true
      }
    });

    if (!inviter) {
      throw new BadRequestException('邀请码不存在');
    }

    // 检查邀请者账户状态
    if (inviter.status !== UserStatus.ACTIVE || !inviter.isActive) {
      throw new BadRequestException('邀请者账户异常，无法使用此邀请码');
    }

    this.logger.log(`邀请码验证通过: ${inviteCode} - 邀请者: ${inviter.email}`);
    
    return inviter;
  }

  /**
   * 生成唯一的用户邀请码
   */
  private async generateUniqueInviteCode(): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      // 生成6位大写字母+数字的邀请码
      const code = this.generateRandomCode(6);
      
      // 检查是否已存在
      const existing = await this.prisma.user.findUnique({
        where: { inviteCode: code }
      });

      if (!existing) {
        return code;
      }
      
      attempts++;
    }

    throw new Error('生成邀请码失败，请重试');
  }

  /**
   * 生成随机代码
   */
  private generateRandomCode(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 创建邀请关系并发放奖励
   */
  private async createInviteRelation(inviterId: string, inviteeId: string): Promise<void> {
    // 创建邀请记录
    const invite = await this.prisma.userInvite.create({
      data: {
        inviterId,
        inviteeId,
        status: InviteStatus.ACCEPTED,
        rewardStatus: RewardStatus.PENDING
      }
    });

    // 更新邀请者的邀请统计
    await this.prisma.user.update({
      where: { id: inviterId },
      data: { 
        inviteCount: { increment: 1 }
      }
    });

    // 发放邀请奖励（示例：7天会员）
    await this.grantInviteReward(inviterId, invite.id);

    this.logger.log(`邀请关系创建成功: ${inviterId} -> ${inviteeId}`);
  }

  /**
   * 发放邀请奖励
   */
  private async grantInviteReward(userId: string, inviteId: string): Promise<void> {
    // 创建奖励记录
    await this.prisma.inviteReward.create({
      data: {
        userId,
        inviteId,
        rewardType: 'DAYS',
        amount: 7,
        description: '邀请好友注册奖励：7天会员',
        status: RewardStatus.GRANTED,
        grantedAt: new Date()
      }
    });

    // TODO: 这里可以实际执行奖励发放逻辑，比如：
    // - 延长用户订阅时间
    // - 增加用户积分
    // - 发送通知等

    this.logger.log(`邀请奖励发放成功: 用户 ${userId} 获得7天会员`);
  }

  /**
   * 验证重置令牌
   */
  private async validateResetToken(token: string): Promise<string | null> {
    // TODO: 实现重置令牌验证逻辑
    // 这里应该从数据库或缓存中验证令牌，并返回用户ID
    return null;
  }
}
