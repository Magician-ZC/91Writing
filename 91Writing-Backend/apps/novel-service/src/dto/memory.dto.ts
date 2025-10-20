import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsObject, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MemoryType } from '@prisma/client';
import { Type } from 'class-transformer';

/**
 * 创建记忆DTO
 */
export class CreateMemoryDto {
  @ApiProperty({
    description: '小说ID',
    example: 'cm1234567890'
  })
  @IsString({ message: '小说ID必须是字符串' })
  @IsNotEmpty({ message: '小说ID不能为空' })
  novelId: string;

  @ApiProperty({
    description: '记忆类型',
    enum: MemoryType,
    example: 'CORE'
  })
  @IsEnum(MemoryType, { message: '记忆类型无效' })
  memoryType: MemoryType;

  @ApiProperty({
    description: '记忆内容（JSON格式）',
    example: {
      title: '主角背景设定',
      description: '主角出生在一个小村庄...',
      tags: ['主角', '背景']
    }
  })
  @IsObject({ message: '内容必须是对象' })
  content: Record<string, any>;

  @ApiPropertyOptional({
    description: '重要性评分（0-1）',
    example: 0.8,
    minimum: 0,
    maximum: 1
  })
  @IsOptional()
  @IsNumber({}, { message: '重要性必须是数字' })
  @Min(0, { message: '重要性不能小于0' })
  @Max(1, { message: '重要性不能大于1' })
  @Type(() => Number)
  importance?: number;

  @ApiPropertyOptional({
    description: '章节范围（如：1-5）',
    example: '1-5'
  })
  @IsOptional()
  @IsString({ message: '章节范围必须是字符串' })
  chapterRange?: string;
}

/**
 * 更新记忆DTO
 */
export class UpdateMemoryDto {
  @ApiPropertyOptional({
    description: '记忆类型',
    enum: MemoryType
  })
  @IsOptional()
  @IsEnum(MemoryType, { message: '记忆类型无效' })
  memoryType?: MemoryType;

  @ApiPropertyOptional({
    description: '记忆内容（JSON格式）'
  })
  @IsOptional()
  @IsObject({ message: '内容必须是对象' })
  content?: Record<string, any>;

  @ApiPropertyOptional({
    description: '重要性评分（0-1）',
    minimum: 0,
    maximum: 1
  })
  @IsOptional()
  @IsNumber({}, { message: '重要性必须是数字' })
  @Min(0, { message: '重要性不能小于0' })
  @Max(1, { message: '重要性不能大于1' })
  @Type(() => Number)
  importance?: number;

  @ApiPropertyOptional({
    description: '章节范围'
  })
  @IsOptional()
  @IsString({ message: '章节范围必须是字符串' })
  chapterRange?: string;
}

/**
 * 查询记忆DTO
 */
export class QueryMemoriesDto {
  @ApiPropertyOptional({
    description: '记忆类型筛选',
    enum: MemoryType
  })
  @IsOptional()
  @IsEnum(MemoryType, { message: '记忆类型无效' })
  memoryType?: MemoryType;

  @ApiPropertyOptional({
    description: '关键词搜索'
  })
  @IsOptional()
  @IsString({ message: '关键词必须是字符串' })
  keyword?: string;

  @ApiPropertyOptional({
    description: '最小重要性',
    minimum: 0,
    maximum: 1
  })
  @IsOptional()
  @IsNumber({}, { message: '最小重要性必须是数字' })
  @Min(0)
  @Max(1)
  @Type(() => Number)
  minImportance?: number;

  @ApiPropertyOptional({
    description: '页码',
    example: 1,
    minimum: 1
  })
  @IsOptional()
  @IsNumber({}, { message: '页码必须是数字' })
  @Min(1, { message: '页码不能小于1' })
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: '每页数量',
    example: 20,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @IsNumber({}, { message: '每页数量必须是数字' })
  @Min(1, { message: '每页数量不能小于1' })
  @Max(100, { message: '每页数量不能大于100' })
  @Type(() => Number)
  pageSize?: number = 20;
}

/**
 * 智能提取记忆DTO
 */
export class ExtractMemoriesDto {
  @ApiProperty({
    description: '小说ID',
    example: 'cm1234567890'
  })
  @IsString({ message: '小说ID必须是字符串' })
  @IsNotEmpty({ message: '小说ID不能为空' })
  novelId: string;

  @ApiProperty({
    description: '章节ID列表',
    example: ['cm111', 'cm222']
  })
  @IsString({ each: true, message: '章节ID必须是字符串' })
  @IsNotEmpty({ message: '章节ID列表不能为空' })
  chapterIds: string[];

  @ApiPropertyOptional({
    description: '提取类型',
    enum: MemoryType
  })
  @IsOptional()
  @IsEnum(MemoryType)
  extractType?: MemoryType;
}

/**
 * 记忆评分DTO
 */
export class ScoreMemoryDto {
  @ApiProperty({
    description: '记忆ID',
    example: 'cm1234567890'
  })
  @IsString({ message: '记忆ID必须是字符串' })
  @IsNotEmpty({ message: '记忆ID不能为空' })
  memoryId: string;

  @ApiProperty({
    description: '新的重要性评分',
    example: 0.9,
    minimum: 0,
    maximum: 1
  })
  @IsNumber({}, { message: '评分必须是数字' })
  @Min(0, { message: '评分不能小于0' })
  @Max(1, { message: '评分不能大于1' })
  @Type(() => Number)
  importance: number;
}

