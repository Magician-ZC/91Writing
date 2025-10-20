import { IsString, IsOptional, IsInt, Min, Max, IsEnum, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * 视频生成请求DTO
 */
export class GenerateVideoDto {
  @ApiProperty({ description: '章节ID' })
  @IsString()
  chapterId: string;

  @ApiPropertyOptional({ description: '是否强制重新生成', default: false })
  @IsOptional()
  @IsBoolean()
  forceRegenerate?: boolean;

  @ApiPropertyOptional({ description: '分镜数量', minimum: 3, maximum: 10, default: 5 })
  @IsOptional()
  @IsInt()
  @Min(3)
  @Max(10)
  sceneCount?: number;

  @ApiPropertyOptional({ description: '视频时长(秒)', minimum: 5, maximum: 30, default: 15 })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(30)
  videoDuration?: number;

  @ApiPropertyOptional({ description: '视觉风格', enum: ['realistic', 'anime', 'fantasy', 'scifi'] })
  @IsOptional()
  @IsString()
  visualStyle?: string;
}

/**
 * 分镜场景DTO
 */
export class StoryboardSceneDto {
  @ApiProperty({ description: '场景编号' })
  @IsInt()
  sceneNumber: number;

  @ApiProperty({ description: '场景描述' })
  @IsString()
  description: string;

  @ApiProperty({ description: '出现的角色', type: [String] })
  @IsArray()
  @IsString({ each: true })
  characters: string[];

  @ApiProperty({ description: '环境/场景' })
  @IsString()
  environment: string;

  @ApiProperty({ description: '预计时长(秒)' })
  @IsInt()
  duration: number;

  @ApiProperty({ description: '关键情节点' })
  @IsString()
  keyMoment: string;

  @ApiProperty({ description: '镜头角度建议' })
  @IsString()
  cameraAngle: string;

  @ApiPropertyOptional({ description: '特殊效果' })
  @IsOptional()
  @IsString()
  specialEffects?: string;
}

/**
 * 分镜脚本生成响应DTO
 */
export class StoryboardScriptDto {
  @ApiProperty({ description: '分镜场景列表', type: [StoryboardSceneDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StoryboardSceneDto)
  scenes: StoryboardSceneDto[];

  @ApiProperty({ description: '总时长(秒)' })
  @IsInt()
  totalDuration: number;

  @ApiProperty({ description: '主要角色列表', type: [String] })
  @IsArray()
  @IsString({ each: true })
  mainCharacters: string[];

  @ApiProperty({ description: '场景总结' })
  @IsString()
  summary: string;
}

/**
 * 图片生成提示词DTO
 */
export class ImagePromptDto {
  @ApiProperty({ description: '场景编号' })
  @IsInt()
  sceneNumber: number;

  @ApiProperty({ description: '正向提示词' })
  @IsString()
  positivePrompt: string;

  @ApiProperty({ description: '负向提示词' })
  @IsOptional()
  @IsString()
  negativePrompt?: string;

  @ApiProperty({ description: '图片尺寸', example: '1024x576' })
  @IsString()
  size: string;

  @ApiProperty({ description: '种子值' })
  @IsOptional()
  @IsInt()
  seed?: number;

  @ApiProperty({ description: '一致性参考图URL' })
  @IsOptional()
  @IsString()
  referenceImageUrl?: string;
}

/**
 * 视频生成提示词DTO
 */
export class VideoPromptDto {
  @ApiProperty({ description: '场景编号' })
  @IsInt()
  sceneNumber: number;

  @ApiProperty({ description: '运动提示词' })
  @IsString()
  motionPrompt: string;

  @ApiProperty({ description: '视频时长(秒)' })
  @IsInt()
  duration: number;

  @ApiProperty({ description: '运动幅度', enum: ['low', 'medium', 'high'], default: 'medium' })
  @IsString()
  motionIntensity: string;

  @ApiProperty({ description: '人物一致性ID' })
  @IsOptional()
  @IsString()
  characterConsistencyId?: string;
}

/**
 * 视频生成状态查询响应DTO
 */
export class VideoGenerationStatusDto {
  @ApiProperty({ description: '章节ID' })
  chapterId: string;

  @ApiProperty({ description: '当前状态', enum: ['PENDING', 'GENERATING', 'COMPLETED', 'FAILED', 'CANCELLED'] })
  status: string;

  @ApiProperty({ description: '当前阶段', enum: ['SCRIPT', 'IMAGE', 'VIDEO', 'MERGE', 'UPLOAD', 'COMPLETED'] })
  stage: string;

  @ApiProperty({ description: '进度百分比', minimum: 0, maximum: 100 })
  progress: number;

  @ApiPropertyOptional({ description: '视频URL' })
  videoUrl?: string;

  @ApiPropertyOptional({ description: '错误信息' })
  errorMessage?: string;

  @ApiProperty({ description: '预计剩余时间(秒)' })
  @IsOptional()
  @IsInt()
  estimatedTimeRemaining?: number;

  @ApiProperty({ description: '已生成的图片URL列表', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  generatedImages?: string[];

  @ApiProperty({ description: '开始时间' })
  startedAt?: Date;

  @ApiPropertyOptional({ description: '完成时间' })
  completedAt?: Date;
}

/**
 * 视频生成结果DTO
 */
export class VideoGenerationResultDto {
  @ApiProperty({ description: '章节ID' })
  chapterId: string;

  @ApiProperty({ description: '视频URL' })
  videoUrl: string;

  @ApiProperty({ description: '视频元数据' })
  metadata: {
    duration: number; // 总时长(秒)
    resolution: string; // 分辨率
    fileSize: number; // 文件大小(字节)
    format: string; // 格式
    sceneCount: number; // 分镜数量
  };

  @ApiProperty({ description: '生成的图片URL列表', type: [String] })
  generatedImages: string[];

  @ApiProperty({ description: '分镜脚本' })
  storyboardScript: StoryboardScriptDto;

  @ApiProperty({ description: '总耗时(秒)' })
  totalDuration: number;

  @ApiProperty({ description: '完成时间' })
  completedAt: Date;
}

