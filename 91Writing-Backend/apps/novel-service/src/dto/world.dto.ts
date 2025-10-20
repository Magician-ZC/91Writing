import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsObject, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WorldCategory } from '@prisma/client';
import { Type } from 'class-transformer';

/**
 * 创建世界观设定DTO
 */
export class CreateWorldSettingDto {
  @ApiProperty({
    description: '小说ID',
    example: 'cm1234567890'
  })
  @IsString({ message: '小说ID必须是字符串' })
  @IsNotEmpty({ message: '小说ID不能为空' })
  novelId: string;

  @ApiProperty({
    description: '世界观类别',
    enum: WorldCategory,
    example: 'LOCATION'
  })
  @IsEnum(WorldCategory, { message: '世界观类别无效' })
  category: WorldCategory;

  @ApiProperty({
    description: '名称',
    example: '长安城'
  })
  @IsString({ message: '名称必须是字符串' })
  @IsNotEmpty({ message: '名称不能为空' })
  name: string;

  @ApiPropertyOptional({
    description: '描述'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: '详细设定（结构化数据）',
    example: {
      '气候': '四季分明',
      '人口': '百万',
      '特色': '繁华的都城'
    }
  })
  @IsOptional()
  @IsObject()
  details?: Record<string, any>;

  @ApiPropertyOptional({
    description: '位置信息（针对地点类）'
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: '坐标/位置关系'
  })
  @IsOptional()
  @IsObject()
  coordinates?: Record<string, any>;

  @ApiPropertyOptional({
    description: '领导层（针对组织/势力类）'
  })
  @IsOptional()
  @IsString()
  leadership?: string;

  @ApiPropertyOptional({
    description: '成员信息'
  })
  @IsOptional()
  @IsObject()
  members?: Record<string, any>;

  @ApiPropertyOptional({
    description: '势力强度（0-100）',
    minimum: 0,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  power?: number;

  @ApiPropertyOptional({
    description: '标签'
  })
  @IsOptional()
  @IsObject()
  tags?: Record<string, any>;

  @ApiPropertyOptional({
    description: '相关引用'
  })
  @IsOptional()
  @IsObject()
  references?: Record<string, any>;

  @ApiPropertyOptional({
    description: '自定义字段'
  })
  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;
}

/**
 * 更新世界观设定DTO
 */
export class UpdateWorldSettingDto {
  @ApiPropertyOptional({
    description: '世界观类别',
    enum: WorldCategory
  })
  @IsOptional()
  @IsEnum(WorldCategory)
  category?: WorldCategory;

  @ApiPropertyOptional({ description: '名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '详细设定' })
  @IsOptional()
  @IsObject()
  details?: Record<string, any>;

  @ApiPropertyOptional({ description: '位置信息' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: '坐标' })
  @IsOptional()
  @IsObject()
  coordinates?: Record<string, any>;

  @ApiPropertyOptional({ description: '领导层' })
  @IsOptional()
  @IsString()
  leadership?: string;

  @ApiPropertyOptional({ description: '成员信息' })
  @IsOptional()
  @IsObject()
  members?: Record<string, any>;

  @ApiPropertyOptional({ description: '势力强度' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  power?: number;

  @ApiPropertyOptional({ description: '标签' })
  @IsOptional()
  @IsObject()
  tags?: Record<string, any>;

  @ApiPropertyOptional({ description: '相关引用' })
  @IsOptional()
  @IsObject()
  references?: Record<string, any>;

  @ApiPropertyOptional({ description: '自定义字段' })
  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;
}

/**
 * 查询世界观设定DTO
 */
export class QueryWorldSettingsDto {
  @ApiPropertyOptional({
    description: '类别筛选',
    enum: WorldCategory
  })
  @IsOptional()
  @IsEnum(WorldCategory)
  category?: WorldCategory;

  @ApiPropertyOptional({
    description: '关键词搜索'
  })
  @IsOptional()
  @IsString()
  keyword?: string;

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

