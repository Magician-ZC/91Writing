import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsNumber, IsBoolean, IsOptional, Min, Max } from 'class-validator';

export class UpdateVideoAPIConfigDto {
  @ApiPropertyOptional({ description: '火山引擎 Access Key ID' })
  @IsOptional()
  @IsString()
  volcengineAccessKeyId?: string;

  @ApiPropertyOptional({ description: '火山引擎 Secret Access Key（将被加密存储）' })
  @IsOptional()
  @IsString()
  volcengineSecretAccessKey?: string;

  @ApiPropertyOptional({ description: '火山引擎文生图 API Key（将被加密存储）' })
  @IsOptional()
  @IsString()
  volcengineImageApiKey?: string;

  @ApiPropertyOptional({ description: '即梦 API Key（将被加密存储）' })
  @IsOptional()
  @IsString()
  jimengApiKey?: string;

  @ApiPropertyOptional({ description: '可灵 API Key（将被加密存储）' })
  @IsOptional()
  @IsString()
  klingApiKey?: string;

  @ApiPropertyOptional({ description: '视频Provider', enum: ['jimeng', 'kling'] })
  @IsOptional()
  @IsString()
  videoProvider?: string;

  @ApiPropertyOptional({ description: 'FFmpeg路径', example: '/usr/bin/ffmpeg' })
  @IsOptional()
  @IsString()
  ffmpegPath?: string;

  @ApiPropertyOptional({ description: '视频存储路径', example: '/data/videos' })
  @IsOptional()
  @IsString()
  videoStoragePath?: string;

  @ApiPropertyOptional({ description: '临时文件路径', example: '/tmp/video-generation' })
  @IsOptional()
  @IsString()
  tempStoragePath?: string;

  @ApiPropertyOptional({ description: '用户每日配额', example: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  userDailyQuota?: number;

  @ApiPropertyOptional({ description: '用户每月配额', example: 50 })
  @IsOptional()
  @IsInt()
  @Min(0)
  userMonthlyQuota?: number;

  @ApiPropertyOptional({ description: '月度预算（元）', example: 1000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyBudget?: number;

  @ApiPropertyOptional({ description: '成本警报阈值（元）', example: 800 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costAlertThreshold?: number;

  @ApiPropertyOptional({ description: '是否启用', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

