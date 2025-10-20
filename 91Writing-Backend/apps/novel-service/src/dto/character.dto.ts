import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsObject, IsNotEmpty, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CharacterRole } from '@prisma/client';
import { Type } from 'class-transformer';

/**
 * 创建角色DTO
 */
export class CreateCharacterDto {
  @ApiProperty({
    description: '小说ID',
    example: 'cm1234567890'
  })
  @IsString({ message: '小说ID必须是字符串' })
  @IsNotEmpty({ message: '小说ID不能为空' })
  novelId: string;

  @ApiProperty({
    description: '角色名称',
    example: '张三'
  })
  @IsString({ message: '角色名称必须是字符串' })
  @IsNotEmpty({ message: '角色名称不能为空' })
  name: string;

  @ApiPropertyOptional({
    description: '别名/称号列表',
    example: ['小三', '三哥']
  })
  @IsOptional()
  @IsArray({ message: '别名必须是数组' })
  @IsString({ each: true, message: '每个别名必须是字符串' })
  aliases?: string[];

  @ApiProperty({
    description: '角色定位',
    enum: CharacterRole,
    example: 'PROTAGONIST'
  })
  @IsEnum(CharacterRole, { message: '角色定位无效' })
  role: CharacterRole;

  @ApiPropertyOptional({
    description: '重要性评分（0-100）',
    example: 90,
    minimum: 0,
    maximum: 100
  })
  @IsOptional()
  @IsNumber({}, { message: '重要性必须是数字' })
  @Min(0)
  @Max(100)
  @Type(() => Number)
  importance?: number;

  @ApiPropertyOptional({
    description: '年龄',
    example: '25岁'
  })
  @IsOptional()
  @IsString()
  age?: string;

  @ApiPropertyOptional({
    description: '性别',
    example: '男'
  })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({
    description: '职业',
    example: '剑客'
  })
  @IsOptional()
  @IsString()
  occupation?: string;

  @ApiPropertyOptional({
    description: '外貌描写',
    example: '身材高大，剑眉星目...'
  })
  @IsOptional()
  @IsString()
  appearance?: string;

  @ApiPropertyOptional({
    description: '性格描写',
    example: '沉稳冷静，深思熟虑...'
  })
  @IsOptional()
  @IsString()
  personality?: string;

  @ApiPropertyOptional({
    description: '性格特质标签',
    example: ['勇敢', '智慧', '正义']
  })
  @IsOptional()
  @IsArray()
  traits?: string[];

  @ApiPropertyOptional({
    description: '优点列表',
    example: ['忠诚', '坚韧']
  })
  @IsOptional()
  @IsArray()
  strengths?: string[];

  @ApiPropertyOptional({
    description: '缺点列表',
    example: ['固执', '过于理想化']
  })
  @IsOptional()
  @IsArray()
  weaknesses?: string[];

  @ApiPropertyOptional({
    description: '背景故事'
  })
  @IsOptional()
  @IsString()
  background?: string;

  @ApiPropertyOptional({
    description: '动机目标'
  })
  @IsOptional()
  @IsString()
  motivation?: string;

  @ApiPropertyOptional({
    description: '角色弧光'
  })
  @IsOptional()
  @IsString()
  arc?: string;

  @ApiPropertyOptional({
    description: '能力/技能',
    example: ['剑术', '轻功']
  })
  @IsOptional()
  @IsArray()
  abilities?: string[];

  @ApiPropertyOptional({
    description: '装备/道具',
    example: ['青锋剑', '护心镜']
  })
  @IsOptional()
  @IsArray()
  equipment?: string[];

  @ApiPropertyOptional({
    description: '自定义字段'
  })
  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;
}

/**
 * 更新角色DTO
 */
export class UpdateCharacterDto {
  @ApiPropertyOptional({
    description: '角色名称'
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: '别名/称号列表'
  })
  @IsOptional()
  @IsArray()
  aliases?: string[];

  @ApiPropertyOptional({
    description: '角色定位',
    enum: CharacterRole
  })
  @IsOptional()
  @IsEnum(CharacterRole)
  role?: CharacterRole;

  @ApiPropertyOptional({
    description: '重要性评分（0-100）',
    minimum: 0,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  importance?: number;

  @ApiPropertyOptional({ description: '年龄' })
  @IsOptional()
  @IsString()
  age?: string;

  @ApiPropertyOptional({ description: '性别' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ description: '职业' })
  @IsOptional()
  @IsString()
  occupation?: string;

  @ApiPropertyOptional({ description: '外貌描写' })
  @IsOptional()
  @IsString()
  appearance?: string;

  @ApiPropertyOptional({ description: '性格描写' })
  @IsOptional()
  @IsString()
  personality?: string;

  @ApiPropertyOptional({ description: '性格特质标签' })
  @IsOptional()
  @IsArray()
  traits?: string[];

  @ApiPropertyOptional({ description: '优点列表' })
  @IsOptional()
  @IsArray()
  strengths?: string[];

  @ApiPropertyOptional({ description: '缺点列表' })
  @IsOptional()
  @IsArray()
  weaknesses?: string[];

  @ApiPropertyOptional({ description: '背景故事' })
  @IsOptional()
  @IsString()
  background?: string;

  @ApiPropertyOptional({ description: '动机目标' })
  @IsOptional()
  @IsString()
  motivation?: string;

  @ApiPropertyOptional({ description: '角色弧光' })
  @IsOptional()
  @IsString()
  arc?: string;

  @ApiPropertyOptional({ description: '能力/技能' })
  @IsOptional()
  @IsArray()
  abilities?: string[];

  @ApiPropertyOptional({ description: '装备/道具' })
  @IsOptional()
  @IsArray()
  equipment?: string[];

  @ApiPropertyOptional({ description: '自定义字段' })
  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;
}

/**
 * 查询角色DTO
 */
export class QueryCharactersDto {
  @ApiPropertyOptional({
    description: '角色定位筛选',
    enum: CharacterRole
  })
  @IsOptional()
  @IsEnum(CharacterRole)
  role?: CharacterRole;

  @ApiPropertyOptional({
    description: '关键词搜索（搜索名称、别名）'
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({
    description: '最小重要性',
    minimum: 0,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  minImportance?: number;

  @ApiPropertyOptional({
    description: '页码',
    example: 1,
    minimum: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: '每页数量',
    example: 20,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  pageSize?: number = 20;
}

