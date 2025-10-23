import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsBoolean,
  IsEnum,
  Min,
  Max,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 视频设置DTO
 */
export class VideoSettingsDto {
  @ApiPropertyOptional({ 
    description: '每章分镜数',
    example: 5,
    minimum: 3,
    maximum: 8,
    default: 5
  })
  @IsOptional()
  @IsNumber({}, { message: '分镜数必须是数字' })
  @Min(3, { message: '分镜数最少3个' })
  @Max(8, { message: '分镜数最多8个' })
  @Type(() => Number)
  sceneCount?: number;

  @ApiPropertyOptional({ 
    description: '每章预期时长(秒)',
    example: 15,
    minimum: 5,
    maximum: 30,
    default: 15
  })
  @IsOptional()
  @IsNumber({}, { message: '时长必须是数字' })
  @Min(5, { message: '时长最少5秒' })
  @Max(30, { message: '时长最多30秒' })
  @Type(() => Number)
  videoDuration?: number;
}

/**
 * 批量生成选项DTO
 */
export class BatchGenerationOptionsDto {
  @ApiPropertyOptional({ 
    description: '并发任务数',
    example: 2,
    minimum: 1,
    maximum: 5,
    default: 2
  })
  @IsOptional()
  @IsNumber({}, { message: '并发数必须是数字' })
  @Min(1, { message: '并发数最少1个' })
  @Max(5, { message: '并发数最多5个' })
  @Type(() => Number)
  parallelTasks?: number;

  @ApiPropertyOptional({ 
    description: '是否合并为一个长视频',
    example: true,
    default: false
  })
  @IsOptional()
  @IsBoolean({ message: '合并选项必须是布尔值' })
  mergeIntoOne?: boolean;

  @ApiPropertyOptional({ 
    description: '视频生成设置',
    type: VideoSettingsDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => VideoSettingsDto)
  videoSettings?: VideoSettingsDto;
}

/**
 * 批量生成请求DTO（手动选择章节）
 */
export class BatchGenerateByChaptersDto {
  @ApiProperty({ 
    description: '小说ID',
    example: 'clxxxxx'
  })
  @IsString({ message: '小说ID必须是字符串' })
  novelId: string;

  @ApiProperty({ 
    description: '章节ID数组',
    example: ['ch-1', 'ch-2', 'ch-3'],
    type: [String]
  })
  @IsArray({ message: '章节ID必须是数组' })
  @ArrayMinSize(1, { message: '至少选择1个章节' })
  @IsString({ each: true, message: '章节ID必须是字符串' })
  chapterIds: string[];

  @ApiPropertyOptional({ 
    description: '批量生成选项',
    type: BatchGenerationOptionsDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BatchGenerationOptionsDto)
  options?: BatchGenerationOptionsDto;
}

/**
 * AI智能规划选项DTO
 */
export class SmartGenerationOptionsDto {
  @ApiPropertyOptional({ 
    description: '最多使用多少章节',
    example: 10,
    minimum: 1,
    maximum: 20,
    default: 10
  })
  @IsOptional()
  @IsNumber({}, { message: '最大章节数必须是数字' })
  @Min(1, { message: '最少1个章节' })
  @Max(20, { message: '最多20个章节' })
  @Type(() => Number)
  maxChapters?: number;

  @ApiPropertyOptional({ 
    description: '是否自动合并为长视频',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean({ message: '自动合并选项必须是布尔值' })
  autoMerge?: boolean;

  @ApiPropertyOptional({ 
    description: '视频生成设置',
    type: VideoSettingsDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => VideoSettingsDto)
  videoSettings?: VideoSettingsDto;
}

/**
 * AI智能规划生成请求DTO
 */
export class SmartGenerateVideoDto {
  @ApiProperty({ 
    description: '小说ID',
    example: 'clxxxxx'
  })
  @IsString({ message: '小说ID必须是字符串' })
  novelId: string;

  @ApiProperty({ 
    description: '起始章节号',
    example: 1,
    minimum: 1
  })
  @IsNumber({}, { message: '起始章节号必须是数字' })
  @Min(1, { message: '起始章节号最少为1' })
  @Type(() => Number)
  startChapter: number;

  @ApiProperty({ 
    description: '目标视频时长(秒)',
    example: 600,
    minimum: 60,
    maximum: 1800
  })
  @IsNumber({}, { message: '目标时长必须是数字' })
  @Min(60, { message: '目标时长最少60秒(1分钟)' })
  @Max(1800, { message: '目标时长最多1800秒(30分钟)' })
  @Type(() => Number)
  targetDuration: number;

  @ApiPropertyOptional({ 
    description: 'AI智能规划选项',
    type: SmartGenerationOptionsDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SmartGenerationOptionsDto)
  options?: SmartGenerationOptionsDto;
}

/**
 * 视频合并选项DTO
 */
export class VideoMergeOptionsDto {
  @ApiPropertyOptional({ 
    description: '是否添加章节标题',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean({ message: '章节标题选项必须是布尔值' })
  addChapterTitles?: boolean;

  @ApiPropertyOptional({ 
    description: '是否添加片头',
    example: true,
    default: false
  })
  @IsOptional()
  @IsBoolean({ message: '片头选项必须是布尔值' })
  addOpening?: boolean;

  @ApiPropertyOptional({ 
    description: '是否添加片尾',
    example: true,
    default: false
  })
  @IsOptional()
  @IsBoolean({ message: '片尾选项必须是布尔值' })
  addEnding?: boolean;

  @ApiPropertyOptional({ 
    description: '章节标题显示时长(秒)',
    example: 2,
    minimum: 1,
    maximum: 5,
    default: 2
  })
  @IsOptional()
  @IsNumber({}, { message: '标题时长必须是数字' })
  @Min(1, { message: '标题时长最少1秒' })
  @Max(5, { message: '标题时长最多5秒' })
  @Type(() => Number)
  titleDuration?: number;

  @ApiPropertyOptional({ 
    description: '转场时长(秒)',
    example: 0.3,
    minimum: 0.1,
    maximum: 2,
    default: 0.3
  })
  @IsOptional()
  @IsNumber({}, { message: '转场时长必须是数字' })
  @Min(0.1, { message: '转场时长最少0.1秒' })
  @Max(2, { message: '转场时长最多2秒' })
  @Type(() => Number)
  transitionDuration?: number;

  @ApiPropertyOptional({ 
    description: '压缩质量',
    example: 'medium',
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high'], { message: '质量必须是 low, medium 或 high' })
  quality?: 'low' | 'medium' | 'high';
}

/**
 * 合并视频请求DTO
 */
export class MergeBatchVideosDto {
  @ApiPropertyOptional({ 
    description: '视频合并选项',
    type: VideoMergeOptionsDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => VideoMergeOptionsDto)
  options?: VideoMergeOptionsDto;
}

