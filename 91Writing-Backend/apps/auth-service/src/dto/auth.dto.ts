import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsEmail, 
  IsString, 
  MinLength, 
  MaxLength, 
  IsOptional, 
  IsEnum,
  Matches,
  IsBoolean
} from 'class-validator';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({
    description: '用户邮箱地址',
    example: 'user@91writing.com',
    format: 'email'
  })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  @MaxLength(100, { message: '邮箱地址不能超过100个字符' })
  email: string;

  @ApiProperty({
    description: '用户密码',
    example: 'password123',
    minLength: 8,
    maxLength: 50
  })
  @IsString({ message: '密码必须是字符串' })
  @MinLength(8, { message: '密码至少需要8个字符' })
  @MaxLength(50, { message: '密码不能超过50个字符' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: '密码必须包含大小写字母和数字'
  })
  password: string;

  @ApiPropertyOptional({
    description: '用户昵称',
    example: '写作爱好者',
    maxLength: 50
  })
  @IsOptional()
  @IsString({ message: '昵称必须是字符串' })
  @MaxLength(50, { message: '昵称不能超过50个字符' })
  @Matches(/^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/, {
    message: '昵称只能包含中英文、数字、下划线和连字符'
  })
  nickname?: string;

  @ApiPropertyOptional({
    description: '邀请码',
    example: 'INVITE123'
  })
  @IsOptional()
  @IsString({ message: '邀请码必须是字符串' })
  @MaxLength(20, { message: '邀请码不能超过20个字符' })
  inviteCode?: string;

  @ApiPropertyOptional({
    description: '是否接受服务条款',
    default: true
  })
  @IsOptional()
  @IsBoolean({ message: '服务条款接受状态必须是布尔值' })
  acceptTerms?: boolean = true;
}

export class LoginDto {
  @ApiProperty({
    description: '用户邮箱地址',
    example: 'user@91writing.com'
  })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string;

  @ApiProperty({
    description: '用户密码',
    example: 'password123'
  })
  @IsString({ message: '密码必须是字符串' })
  @MinLength(1, { message: '密码不能为空' })
  password: string;

  @ApiPropertyOptional({
    description: '是否记住登录状态',
    default: false
  })
  @IsOptional()
  @IsBoolean({ message: '记住登录状态必须是布尔值' })
  rememberMe?: boolean = false;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: '刷新令牌',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  @IsString({ message: '刷新令牌必须是字符串' })
  refreshToken: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    description: '用户邮箱地址',
    example: 'user@91writing.com'
  })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: '重置令牌',
    example: 'reset_token_123456'
  })
  @IsString({ message: '重置令牌必须是字符串' })
  token: string;

  @ApiProperty({
    description: '新密码',
    example: 'newPassword123',
    minLength: 8,
    maxLength: 50
  })
  @IsString({ message: '新密码必须是字符串' })
  @MinLength(8, { message: '新密码至少需要8个字符' })
  @MaxLength(50, { message: '新密码不能超过50个字符' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: '新密码必须包含大小写字母和数字'
  })
  newPassword: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    description: '当前密码',
    example: 'oldPassword123'
  })
  @IsString({ message: '当前密码必须是字符串' })
  currentPassword: string;

  @ApiProperty({
    description: '新密码',
    example: 'newPassword123',
    minLength: 8,
    maxLength: 50
  })
  @IsString({ message: '新密码必须是字符串' })
  @MinLength(8, { message: '新密码至少需要8个字符' })
  @MaxLength(50, { message: '新密码不能超过50个字符' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: '新密码必须包含大小写字母和数字'
  })
  newPassword: string;
}

export class VerifyEmailDto {
  @ApiProperty({
    description: '邮箱验证令牌',
    example: 'verify_token_123456'
  })
  @IsString({ message: '验证令牌必须是字符串' })
  token: string;
}
