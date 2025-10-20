import { IsString, IsOptional, IsInt, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// 创建版本DTO
export class CreateVersionDto {
  @ApiProperty({ 
    description: '章节ID',
    example: 'cm1234567890'
  })
  @IsString({ message: '章节ID必须是字符串' })
  chapterId: string;

  @ApiProperty({ 
    description: '用户ID',
    example: 'cm0987654321'
  })
  @IsString({ message: '用户ID必须是字符串' })
  userId: string;

  @ApiPropertyOptional({ 
    description: '版本变更说明',
    example: '修改了角色对话，调整了故事节奏',
    maxLength: 500
  })
  @IsOptional()
  @IsString({ message: '变更说明必须是字符串' })
  @MaxLength(500, { message: '变更说明不能超过500个字符' })
  changeLog?: string;
}

// 版本对比DTO
export class CompareVersionsDto {
  @ApiProperty({ 
    description: '章节ID',
    example: 'cm1234567890'
  })
  @IsString({ message: '章节ID必须是字符串' })
  chapterId: string;

  @ApiProperty({ 
    description: '第一个版本号',
    example: 1,
    minimum: 1
  })
  @Type(() => Number)
  @IsInt({ message: '版本号必须是整数' })
  version1: number;

  @ApiProperty({ 
    description: '第二个版本号',
    example: 2,
    minimum: 1
  })
  @Type(() => Number)
  @IsInt({ message: '版本号必须是整数' })
  version2: number;
}

// 回滚到版本DTO
export class RestoreVersionDto {
  @ApiProperty({ 
    description: '章节ID',
    example: 'cm1234567890'
  })
  @IsString({ message: '章节ID必须是字符串' })
  chapterId: string;

  @ApiProperty({ 
    description: '要回滚到的版本号',
    example: 5,
    minimum: 1
  })
  @Type(() => Number)
  @IsInt({ message: '版本号必须是整数' })
  versionNumber: number;

  @ApiProperty({ 
    description: '用户ID',
    example: 'cm0987654321'
  })
  @IsString({ message: '用户ID必须是字符串' })
  userId: string;
}
