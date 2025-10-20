import { IsString, IsOptional, IsObject, IsArray, ValidateNested, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * 角色特征DTO
 */
export class CharacterProfileDto {
  @ApiProperty({ description: '角色名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '基础外貌描述(不变)' })
  @IsString()
  baseAppearance: string;

  @ApiProperty({ description: '动态状态(按章节)' })
  @IsOptional()
  @IsObject()
  dynamicState?: Record<number, string>; // {chapterNumber: stateDescription}

  @ApiProperty({ description: '视觉关键词', type: [String] })
  @IsArray()
  @IsString({ each: true })
  keywords: string[];

  @ApiPropertyOptional({ description: '参考图URL' })
  @IsOptional()
  @IsString()
  referenceImageUrl?: string;

  @ApiPropertyOptional({ description: '角色重要性', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsInt()
  importance?: number;

  @ApiPropertyOptional({ description: '首次出场章节' })
  @IsOptional()
  @IsInt()
  firstAppearance?: number;
}

/**
 * 环境场景DTO
 */
export class EnvironmentProfileDto {
  @ApiProperty({ description: '场景名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '场景描述' })
  @IsString()
  description: string;

  @ApiProperty({ description: '视觉风格' })
  @IsString()
  visualStyle: string;

  @ApiProperty({ description: '关键词', type: [String] })
  @IsArray()
  @IsString({ each: true })
  keywords: string[];

  @ApiPropertyOptional({ description: '参考图URL' })
  @IsOptional()
  @IsString()
  referenceImageUrl?: string;
}

/**
 * 物品特征DTO
 */
export class ObjectProfileDto {
  @ApiProperty({ description: '物品名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '物品描述' })
  @IsString()
  description: string;

  @ApiProperty({ description: '外观描述' })
  @IsString()
  appearance: string;

  @ApiProperty({ description: '关键词', type: [String] })
  @IsArray()
  @IsString({ each: true })
  keywords: string[];
}

/**
 * 视觉风格配置DTO
 */
export class VisualStyleConfigDto {
  @ApiProperty({ description: '整体风格', example: 'realistic' })
  @IsString()
  overall: string;

  @ApiProperty({ description: '色调', example: 'warm' })
  @IsString()
  colorTone: string;

  @ApiProperty({ description: '艺术风格', example: 'cinematic' })
  @IsString()
  artStyle: string;

  @ApiProperty({ description: '光照风格', example: 'natural' })
  @IsString()
  lighting: string;

  @ApiPropertyOptional({ description: '附加风格标签', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  additionalTags?: string[];
}

/**
 * 一致性配置创建/更新DTO
 */
export class CreateConsistencyProfileDto {
  @ApiProperty({ description: '小说ID' })
  @IsString()
  novelId: string;

  @ApiProperty({ description: '角色特征配置', type: [CharacterProfileDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CharacterProfileDto)
  characters: CharacterProfileDto[];

  @ApiPropertyOptional({ description: '环境场景配置', type: [EnvironmentProfileDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EnvironmentProfileDto)
  environments?: EnvironmentProfileDto[];

  @ApiPropertyOptional({ description: '物品配置', type: [ObjectProfileDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ObjectProfileDto)
  objects?: ObjectProfileDto[];

  @ApiPropertyOptional({ description: '视觉风格配置' })
  @IsOptional()
  @ValidateNested()
  @Type(() => VisualStyleConfigDto)
  visualStyle?: VisualStyleConfigDto;
}

/**
 * 一致性配置更新DTO
 */
export class UpdateConsistencyProfileDto {
  @ApiPropertyOptional({ description: '角色特征配置', type: [CharacterProfileDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CharacterProfileDto)
  characters?: CharacterProfileDto[];

  @ApiPropertyOptional({ description: '环境场景配置', type: [EnvironmentProfileDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EnvironmentProfileDto)
  environments?: EnvironmentProfileDto[];

  @ApiPropertyOptional({ description: '物品配置', type: [ObjectProfileDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ObjectProfileDto)
  objects?: ObjectProfileDto[];

  @ApiPropertyOptional({ description: '视觉风格配置' })
  @IsOptional()
  @ValidateNested()
  @Type(() => VisualStyleConfigDto)
  visualStyle?: VisualStyleConfigDto;
}

/**
 * 一致性配置响应DTO
 */
export class ConsistencyProfileResponseDto {
  @ApiProperty({ description: '配置ID' })
  id: string;

  @ApiProperty({ description: '小说ID' })
  novelId: string;

  @ApiProperty({ description: '角色特征配置', type: [CharacterProfileDto] })
  characters: CharacterProfileDto[];

  @ApiPropertyOptional({ description: '环境场景配置', type: [EnvironmentProfileDto] })
  environments?: EnvironmentProfileDto[];

  @ApiPropertyOptional({ description: '物品配置', type: [ObjectProfileDto] })
  objects?: ObjectProfileDto[];

  @ApiPropertyOptional({ description: '视觉风格配置' })
  visualStyle?: VisualStyleConfigDto;

  @ApiProperty({ description: '配置版本号' })
  version: number;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}

/**
 * 自动提取一致性配置请求DTO
 */
export class AutoExtractConsistencyDto {
  @ApiProperty({ description: '小说ID' })
  @IsString()
  novelId: string;

  @ApiPropertyOptional({ description: '提取起始章节', minimum: 1, default: 1 })
  @IsOptional()
  @IsInt()
  startChapter?: number;

  @ApiPropertyOptional({ description: '提取结束章节', minimum: 1, default: 3 })
  @IsOptional()
  @IsInt()
  endChapter?: number;

  @ApiPropertyOptional({ description: '是否覆盖现有配置', default: false })
  @IsOptional()
  @IsString()
  overwrite?: boolean;
}

