import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '@app/database';

export interface JwtPayload {
  sub: string; // 用户ID
  email: string;
  role: string;
  tenantId?: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', '91writing_default_secret'),
    });
  }

  /**
   * 验证JWT载荷并返回用户信息
   */
  async validate(payload: JwtPayload) {
    const { sub, email, role } = payload;

    // 验证用户是否存在且状态正常
    const user = await this.prisma.user.findUnique({
      where: { id: sub },
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
      throw new UnauthorizedException('用户不存在');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('用户账号已被禁用');
    }

    // 返回用户信息供后续中间件使用
    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
      status: user.status,
      isActive: user.isActive,
      tenantId: user.tenantId,
      profile: user.profile,
      subscription: user.subscription,
      lastLoginAt: user.lastLoginAt,
    };
  }

  /**
   * 验证刷新令牌
   */
  async validateRefreshToken(payload: JwtPayload) {
    const { sub } = payload;

    const user = await this.prisma.user.findUnique({
      where: { id: sub },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        isActive: true,
        tenantId: true,
      },
    });

    if (!user || user.status !== 'ACTIVE' || !user.isActive) {
      throw new UnauthorizedException('无效的刷新令牌');
    }

    return user;
  }
}
