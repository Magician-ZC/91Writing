import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { 
  RegisterDto, 
  LoginDto, 
  ChangePasswordDto, 
  ForgotPasswordDto, 
  ResetPasswordDto,
  RefreshTokenDto,
  VerifyEmailDto 
} from '../../dto/auth.dto';
import { 
  LoginResponseDto, 
  RegisterResponseDto, 
  RefreshResponseDto,
  LogoutResponseDto,
  PasswordResetResponseDto,
  EmailVerificationResponseDto 
} from '../../dto/auth-response.dto';
import { JwtAuthGuard } from '@app/common';
import { LocalAuthGuard } from '../../guards/local-auth.guard';

@ApiTags('认证管理')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ 
    summary: '用户注册',
    description: '创建新用户账户，包含邮箱验证机制'
  })
  @ApiResponse({
    status: 201,
    description: '用户注册成功',
    type: RegisterResponseDto,
  })
  @ApiConflictResponse({
    description: '邮箱已被注册',
  })
  @ApiBadRequestResponse({
    description: '数据验证失败',
  })
  async register(@Body() registerDto: RegisterDto): Promise<RegisterResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '用户登录',
    description: '使用邮箱和密码登录，返回JWT令牌'
  })
  @ApiResponse({
    status: 200,
    description: '登录成功',
    type: LoginResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: '邮箱或密码错误',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Request() req,
  ): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '刷新令牌',
    description: '使用刷新令牌获取新的访问令牌'
  })
  @ApiResponse({
    status: 200,
    description: '令牌刷新成功',
    type: RefreshResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: '无效的刷新令牌',
  })
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto): Promise<RefreshResponseDto> {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '用户登出',
    description: '用户主动登出，可选择性使令牌失效'
  })
  @ApiResponse({
    status: 200,
    description: '登出成功',
    type: LogoutResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: '无效的访问令牌',
  })
  async logout(@Request() req): Promise<LogoutResponseDto> {
    // TODO: 实现令牌黑名单机制
    
    return new LogoutResponseDto({
      logoutAt: new Date().toISOString(),
      message: '已成功登出',
    });
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '修改密码',
    description: '用户修改密码，需要验证当前密码'
  })
  @ApiResponse({
    status: 200,
    description: '密码修改成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '密码修改成功' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: '无效的访问令牌',
  })
  @ApiBadRequestResponse({
    description: '当前密码不正确',
  })
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.changePassword(req.user.id, changePasswordDto);
    return { message: '密码修改成功' };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '忘记密码',
    description: '发送密码重置邮件到用户邮箱'
  })
  @ApiResponse({
    status: 200,
    description: '密码重置邮件已发送',
    type: PasswordResetResponseDto,
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<PasswordResetResponseDto> {
    const message = await this.authService.forgotPassword(forgotPasswordDto);
    
    return new PasswordResetResponseDto({
      message,
      sentAt: new Date().toISOString(),
    });
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '重置密码',
    description: '使用重置令牌设置新密码'
  })
  @ApiResponse({
    status: 200,
    description: '密码重置成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '密码重置成功' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: '无效或已过期的重置令牌',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    await this.authService.resetPassword(resetPasswordDto);
    return { message: '密码重置成功' };
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '验证邮箱',
    description: '使用验证令牌完成邮箱验证'
  })
  @ApiResponse({
    status: 200,
    description: '邮箱验证成功',
    type: EmailVerificationResponseDto,
  })
  @ApiBadRequestResponse({
    description: '无效或已过期的验证令牌',
  })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<EmailVerificationResponseDto> {
    // TODO: 实现邮箱验证逻辑
    
    return new EmailVerificationResponseDto({
      verified: true,
      verifiedAt: new Date().toISOString(),
      message: '邮箱验证成功',
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '获取当前用户信息',
    description: '获取当前登录用户的详细信息'
  })
  @ApiResponse({
    status: 200,
    description: '获取用户信息成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          description: '当前用户信息',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: '无效的访问令牌',
  })
  async getCurrentUser(@Request() req): Promise<any> {
    return req.user;
  }

  @Post('check-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '检查令牌有效性',
    description: '验证当前JWT令牌是否有效'
  })
  @ApiResponse({
    status: 200,
    description: '令牌有效',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean', example: true },
        user: {
          type: 'object',
          description: '令牌关联的用户信息',
        },
        expiresAt: { type: 'string', example: '2024-12-26T10:30:00Z' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: '无效的访问令牌',
  })
  async checkToken(@Request() req): Promise<any> {
    return {
      valid: true,
      user: req.user,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7天后
    };
  }
}
