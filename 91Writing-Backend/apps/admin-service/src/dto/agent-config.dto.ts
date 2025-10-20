import { IsString, IsOptional, IsInt, IsBoolean, IsObject, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Agent类型枚举
 */
export enum AgentType {
  SCRIPT_GENERATOR = 'SCRIPT_GENERATOR', // 分镜脚本生成
  IMAGE_OPTIMIZER = 'IMAGE_OPTIMIZER', // 文生图优化
  VIDEO_OPTIMIZER = 'VIDEO_OPTIMIZER', // 图生视频优化
  CONSISTENCY_KEEPER = 'CONSISTENCY_KEEPER', // 一致性管理
}

/**
 * Agent提示词配置创建DTO
 */
export class CreateAgentPromptConfigDto {
  @ApiProperty({ description: 'Agent类型', enum: AgentType })
  @IsEnum(AgentType)
  agentType: AgentType;

  @ApiProperty({ description: '配置名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '系统提示词' })
  @IsString()
  systemPrompt: string;

  @ApiProperty({ description: '模板提示词' })
  @IsString()
  templatePrompt: string;

  @ApiPropertyOptional({ description: '附加参数配置' })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;

  @ApiPropertyOptional({ description: '配置描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '是否启用', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/**
 * Agent提示词配置更新DTO
 */
export class UpdateAgentPromptConfigDto {
  @ApiPropertyOptional({ description: '配置名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '系统提示词' })
  @IsOptional()
  @IsString()
  systemPrompt?: string;

  @ApiPropertyOptional({ description: '模板提示词' })
  @IsOptional()
  @IsString()
  templatePrompt?: string;

  @ApiPropertyOptional({ description: '附加参数配置' })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;

  @ApiPropertyOptional({ description: '配置描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '是否启用' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/**
 * Agent提示词配置响应DTO
 */
export class AgentPromptConfigResponseDto {
  @ApiProperty({ description: '配置ID' })
  id: string;

  @ApiProperty({ description: 'Agent类型', enum: AgentType })
  agentType: AgentType;

  @ApiProperty({ description: '配置名称' })
  name: string;

  @ApiProperty({ description: '系统提示词' })
  systemPrompt: string;

  @ApiProperty({ description: '模板提示词' })
  templatePrompt: string;

  @ApiPropertyOptional({ description: '附加参数配置' })
  parameters?: Record<string, any>;

  @ApiProperty({ description: '版本号' })
  version: number;

  @ApiProperty({ description: '是否启用' })
  isActive: boolean;

  @ApiPropertyOptional({ description: '配置描述' })
  description?: string;

  @ApiProperty({ description: '使用次数' })
  usageCount: number;

  @ApiProperty({ description: '成功次数' })
  successCount: number;

  @ApiProperty({ description: '失败次数' })
  failureCount: number;

  @ApiProperty({ description: '成功率(%)' })
  successRate: number;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}

/**
 * Agent提示词测试请求DTO
 */
export class TestAgentPromptDto {
  @ApiProperty({ description: 'Agent类型', enum: AgentType })
  @IsEnum(AgentType)
  agentType: AgentType;

  @ApiProperty({ description: '系统提示词' })
  @IsString()
  systemPrompt: string;

  @ApiProperty({ description: '模板提示词' })
  @IsString()
  templatePrompt: string;

  @ApiProperty({ description: '测试输入内容' })
  @IsString()
  testInput: string;

  @ApiPropertyOptional({ description: '附加参数' })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;
}

/**
 * Agent提示词测试响应DTO
 */
export class TestAgentPromptResponseDto {
  @ApiProperty({ description: '测试是否成功' })
  success: boolean;

  @ApiProperty({ description: '生成结果' })
  result: any;

  @ApiProperty({ description: '耗时(毫秒)' })
  duration: number;

  @ApiPropertyOptional({ description: 'Token使用情况' })
  tokenUsage?: {
    input: number;
    output: number;
    total: number;
  };

  @ApiPropertyOptional({ description: '错误信息' })
  error?: string;

  @ApiProperty({ description: '执行时间' })
  timestamp: Date;
}

