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
import { UserRole, UserStatus } from '@prisma/client';

export class CreateUserDto {
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
    description: '用户角色',
    enum: UserRole,
    default: UserRole.USER
  })
  @IsOptional()
  @IsEnum(UserRole, { message: '无效的用户角色' })
  role?: UserRole = UserRole.USER;

  @ApiPropertyOptional({
    description: '用户状态',
    enum: UserStatus,
    default: UserStatus.ACTIVE
  })
  @IsOptional()
  @IsEnum(UserStatus, { message: '无效的用户状态' })
  status?: UserStatus = UserStatus.ACTIVE;

  @ApiPropertyOptional({
    description: '租户ID (多租户使用)',
    example: 'tenant_123'
  })
  @IsOptional()
  @IsString({ message: '租户ID必须是字符串' })
  @MaxLength(50, { message: '租户ID不能超过50个字符' })
  tenantId?: string;

  @ApiPropertyOptional({
    description: '是否接受服务条款',
    default: true
  })
  @IsOptional()
  @IsBoolean({ message: '服务条款接受状态必须是布尔值' })
  acceptTerms?: boolean = true;
}
