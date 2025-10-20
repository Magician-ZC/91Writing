import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsNotEmpty, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * 基于素材生成内容DTO
 */
export class GenerateWithMaterialsDto {
  @ApiProperty({
    description: '用户创作需求/提示词',
    example: '创作一个主角登场的场景，要有气势'
  })
  @IsString({ message: '提示词必须是字符串' })
  @IsNotEmpty({ message: '提示词不能为空' })
  prompt: string;

  @ApiProperty({
    description: '引用的素材ID列表',
    example: ['material_id_1', 'material_id_2']
  })
  @IsArray({ message: 'materialIds必须是数组' })
  @IsNotEmpty({ message: 'materialIds不能为空' })
  materialIds: string[];

  @ApiProperty({
    description: '素材使用类型',
    enum: ['style', 'structure', 'character', 'scene', 'technique'],
    example: 'style'
  })
  @IsEnum(['style', 'structure', 'character', 'scene', 'technique'], { message: '使用类型无效' })
  usageType: string;

  @ApiPropertyOptional({
    description: '目标生成长度（字符数）',
    example: 1000,
    minimum: 100,
    maximum: 5000
  })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(5000)
  @Type(() => Number)
  targetLength?: number;

  @ApiPropertyOptional({
    description: '创意度（0-1，越高越有创新性）',
    example: 0.8,
    minimum: 0,
    maximum: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  creativity?: number;

  @ApiPropertyOptional({
    description: '是否开启防抄袭保护',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  preventSimilarity?: boolean;

  @ApiPropertyOptional({
    description: '额外上下文信息',
    example: '这是一部现代都市小说，主角是商业精英'
  })
  @IsOptional()
  @IsString()
  additionalContext?: string;
}

/**
 * 提取写作风格DTO
 */
export class ExtractStyleDto {
  @ApiProperty({
    description: '文本内容（用于提取风格）',
    example: '这是一段示例文本...'
  })
  @IsString({ message: '内容必须是字符串' })
  @IsNotEmpty({ message: '内容不能为空' })
  content: string;

  @ApiPropertyOptional({
    description: '素材ID（如果是从素材提取）'
  })
  @IsOptional()
  @IsString()
  materialId?: string;

  @ApiPropertyOptional({
    description: '要提取的风格特征',
    example: ['narrative', 'dialogue', 'description', 'pacing'],
    default: ['narrative', 'dialogue', 'description']
  })
  @IsOptional()
  @IsArray()
  features?: string[];
}

/**
 * 分析情节结构DTO
 */
export class AnalyzePlotDto {
  @ApiProperty({
    description: '故事文本',
    example: '完整的故事或章节内容...'
  })
  @IsString({ message: '内容必须是字符串' })
  @IsNotEmpty({ message: '内容不能为空' })
  content: string;

  @ApiPropertyOptional({
    description: '分析深度',
    enum: ['basic', 'detailed', 'comprehensive'],
    example: 'basic'
  })
  @IsOptional()
  @IsEnum(['basic', 'detailed', 'comprehensive'])
  depth?: string;
}

/**
 * 角色特征分析DTO
 */
export class AnalyzeCharacterDto {
  @ApiProperty({
    description: '包含角色的文本片段',
    example: '主角李明是一个...'
  })
  @IsString({ message: '内容必须是字符串' })
  @IsNotEmpty({ message: '内容不能为空' })
  content: string;

  @ApiPropertyOptional({
    description: '角色名称（可选，用于精准提取）',
    example: '李明'
  })
  @IsOptional()
  @IsString()
  characterName?: string;

  @ApiPropertyOptional({
    description: '提取维度',
    example: ['personality', 'background', 'motivation', 'arc'],
    default: ['personality', 'background']
  })
  @IsOptional()
  @IsArray()
  dimensions?: string[];
}

/**
 * 相似度检测DTO
 */
export class SimilarityCheckDto {
  @ApiProperty({
    description: '待检测文本1',
    example: '这是第一段文本...'
  })
  @IsString({ message: '文本1必须是字符串' })
  @IsNotEmpty({ message: '文本1不能为空' })
  content1: string;

  @ApiProperty({
    description: '参考文本2',
    example: '这是第二段文本...'
  })
  @IsString({ message: '文本2必须是字符串' })
  @IsNotEmpty({ message: '文本2不能为空' })
  content2: string;

  @ApiPropertyOptional({
    description: '相似度阈值（0-1）',
    example: 0.7,
    minimum: 0,
    maximum: 1,
    default: 0.7
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  threshold?: number;
}

/**
 * 素材使用记录（响应数据）
 */
export interface MaterialUsageRecord {
  materialId: string;
  materialName: string;
  usageType: string;
  similarity: number;
  extractedFeatures?: any;
}

/**
 * 基于素材生成的响应数据
 */
export interface GenerateWithMaterialsResponse {
  content: string;
  materialUsage: MaterialUsageRecord[];
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  warnings?: string[];
}

