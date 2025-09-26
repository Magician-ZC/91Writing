import { ApiPropertyOptional, PartialType, OmitType } from '@nestjs/swagger';
import { 
  IsString, 
  MaxLength, 
  IsOptional, 
  IsEnum,
  Matches,
  IsBoolean,
  IsDateString
} from 'class-validator';
import { UserRole, UserStatus } from '@prisma/client';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['email', 'password', 'tenantId'] as const)
) {
  @ApiPropertyOptional({
    description: '用户昵称',
    example: '新昵称',
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
    enum: UserRole
  })
  @IsOptional()
  @IsEnum(UserRole, { message: '无效的用户角色' })
  role?: UserRole;

  @ApiPropertyOptional({
    description: '用户状态',
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
  @IsBoolean({ message: '激活状态必须是布尔值' })
  isActive?: boolean;

  @ApiPropertyOptional({
    description: '最后登录时间',
    example: '2024-12-19T10:30:00Z'
  })
  @IsOptional()
  @IsDateString({}, { message: '请输入有效的日期时间格式' })
  lastLoginAt?: string;
}

export class UpdatePasswordDto {
  @ApiPropertyOptional({
    description: '当前密码',
    example: 'oldPassword123'
  })
  @IsString({ message: '当前密码必须是字符串' })
  currentPassword: string;

  @ApiPropertyOptional({
    description: '新密码',
    example: 'newPassword123',
    minLength: 8,
    maxLength: 50
  })
  @IsString({ message: '新密码必须是字符串' })
  @MaxLength(50, { message: '新密码不能超过50个字符' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: '新密码必须包含大小写字母和数字'
  })
  newPassword: string;
}
