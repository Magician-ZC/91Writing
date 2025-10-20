import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsBoolean, IsObject, IsNotEmpty, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SuggestionType, SuggestionDimension } from '@prisma/client';
import { Type } from 'class-transformer';

/**
 * 创建建议DTO
 */
export class CreateSuggestionDto {
  @ApiProperty({
    description: '小说ID',
    example: 'cm1234567890'
  })
  @IsString({ message: '小说ID必须是字符串' })
  @IsNotEmpty({ message: '小说ID不能为空' })
  novelId: string;

  @ApiPropertyOptional({
    description: '章节ID（可选，为空表示针对整部小说）',
    example: 'cm1234567890'
  })
  @IsOptional()
  @IsString({ message: '章节ID必须是字符串' })
  chapterId?: string;

  @ApiProperty({
    description: '建议类型',
    enum: SuggestionType,
    example: 'REQUESTED'
  })
  @IsEnum(SuggestionType, { message: '建议类型无效' })
  suggestionType: SuggestionType;

  @ApiProperty({
    description: '建议维度',
    enum: SuggestionDimension,
    example: 'PLOT'
  })
  @IsEnum(SuggestionDimension, { message: '建议维度无效' })
  dimension: SuggestionDimension;

  @ApiProperty({
    description: '建议标题',
    example: '加强主线剧情冲突'
  })
  @IsString({ message: '标题必须是字符串' })
  @IsNotEmpty({ message: '标题不能为空' })
  title: string;

  @ApiProperty({
    description: '建议内容',
    example: '当前剧情发展较为平缓，建议在第5章引入更强烈的冲突...'
  })
  @IsString({ message: '内容必须是字符串' })
  @IsNotEmpty({ message: '内容不能为空' })
  content: string;

  @ApiPropertyOptional({
    description: '优先级（0-100）',
    example: 75,
    minimum: 0,
    maximum: 100
  })
  @IsOptional()
  @IsNumber({}, { message: '优先级必须是数字' })
  @Min(0, { message: '优先级不能小于0' })
  @Max(100, { message: '优先级不能大于100' })
  @Type(() => Number)
  priority?: number;

  @ApiPropertyOptional({
    description: '上下文信息（JSON格式）',
    example: {
      章节范围: '1-5',
      相关角色: ['主角', '反派']
    }
  })
  @IsOptional()
  @IsObject({ message: '上下文必须是对象' })
  context?: Record<string, any>;
}

/**
 * 请求AI生成建议DTO
 */
export class GenerateSuggestionsDto {
  @ApiProperty({
    description: '小说ID',
    example: 'cm1234567890'
  })
  @IsString({ message: '小说ID必须是字符串' })
  @IsNotEmpty({ message: '小说ID不能为空' })
  novelId: string;

  @ApiPropertyOptional({
    description: '章节ID列表（为空则分析整部小说）',
    example: ['cm111', 'cm222']
  })
  @IsOptional()
  @IsArray({ message: '章节ID必须是数组' })
  @IsString({ each: true, message: '每个章节ID必须是字符串' })
  chapterIds?: string[];

  @ApiProperty({
    description: '建议维度列表',
    enum: SuggestionDimension,
    isArray: true,
    example: ['PLOT', 'CHARACTER', 'PACING']
  })
  @IsArray({ message: '建议维度必须是数组' })
  @IsEnum(SuggestionDimension, { each: true, message: '建议维度无效' })
  dimensions: SuggestionDimension[];

  @ApiPropertyOptional({
    description: '生成建议数量',
    example: 5,
    minimum: 1,
    maximum: 20
  })
  @IsOptional()
  @IsNumber({}, { message: '数量必须是数字' })
  @Min(1, { message: '数量不能小于1' })
  @Max(20, { message: '数量不能大于20' })
  @Type(() => Number)
  count?: number;
}

/**
 * 查询建议DTO
 */
export class QuerySuggestionsDto {
  @ApiPropertyOptional({
    description: '建议类型筛选',
    enum: SuggestionType
  })
  @IsOptional()
  @IsEnum(SuggestionType, { message: '建议类型无效' })
  suggestionType?: SuggestionType;

  @ApiPropertyOptional({
    description: '建议维度筛选',
    enum: SuggestionDimension
  })
  @IsOptional()
  @IsEnum(SuggestionDimension, { message: '建议维度无效' })
  dimension?: SuggestionDimension;

  @ApiPropertyOptional({
    description: '是否只显示未采纳的建议',
    example: true
  })
  @IsOptional()
  @IsBoolean({ message: '必须是布尔值' })
  @Type(() => Boolean)
  onlyPending?: boolean;

  @ApiPropertyOptional({
    description: '最小优先级',
    minimum: 0,
    maximum: 100
  })
  @IsOptional()
  @IsNumber({}, { message: '优先级必须是数字' })
  @Min(0)
  @Max(100)
  @Type(() => Number)
  minPriority?: number;

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
 * 采纳建议DTO
 */
export class AdoptSuggestionDto {
  @ApiProperty({
    description: '建议ID',
    example: 'cm1234567890'
  })
  @IsString({ message: '建议ID必须是字符串' })
  @IsNotEmpty({ message: '建议ID不能为空' })
  suggestionId: string;

  @ApiPropertyOptional({
    description: '用户反馈',
    example: '这个建议很有帮助，已经按照建议修改了剧情'
  })
  @IsOptional()
  @IsString({ message: '反馈必须是字符串' })
  feedback?: string;

  @ApiPropertyOptional({
    description: '用户评分（1-5星）',
    example: 5,
    minimum: 1,
    maximum: 5
  })
  @IsOptional()
  @IsNumber({}, { message: '评分必须是数字' })
  @Min(1, { message: '评分不能小于1' })
  @Max(5, { message: '评分不能大于5' })
  @Type(() => Number)
  rating?: number;
}

/**
 * 评价建议DTO
 */
export class RateSuggestionDto {
  @ApiProperty({
    description: '建议ID',
    example: 'cm1234567890'
  })
  @IsString({ message: '建议ID必须是字符串' })
  @IsNotEmpty({ message: '建议ID不能为空' })
  suggestionId: string;

  @ApiProperty({
    description: '评分（1-5星）',
    example: 4,
    minimum: 1,
    maximum: 5
  })
  @IsNumber({}, { message: '评分必须是数字' })
  @Min(1, { message: '评分不能小于1' })
  @Max(5, { message: '评分不能大于5' })
  @Type(() => Number)
  rating: number;

  @ApiPropertyOptional({
    description: '评价反馈',
    example: '建议很有针对性，但实施难度较大'
  })
  @IsOptional()
  @IsString({ message: '反馈必须是字符串' })
  feedback?: string;
}

/**
 * 批量操作建议DTO
 */
export class BulkSuggestionDto {
  @ApiProperty({
    description: '建议ID列表',
    example: ['cm111', 'cm222', 'cm333']
  })
  @IsArray({ message: '建议ID必须是数组' })
  @IsString({ each: true, message: '每个建议ID必须是字符串' })
  @IsNotEmpty({ message: '建议ID列表不能为空' })
  suggestionIds: string[];
}

