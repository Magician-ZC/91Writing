import { IsString, IsBoolean, IsOptional, IsEnum, IsObject, IsNumber, Min, Max, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AIProvider, AITier } from '@prisma/client';

// ===== 系统AI配置相关DTO =====

/**
 * AI模型参数配置
 */
export class AIModelParametersDto {
  @IsNumber()
  @Min(0)
  @Max(2)
  @IsOptional()
  temperature?: number = 0.7;

  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  topP?: number = 1.0;

  @IsNumber()
  @Min(-2)
  @Max(2)
  @IsOptional()
  frequencyPenalty?: number = 0;

  @IsNumber()
  @Min(-2)
  @Max(2)
  @IsOptional()
  presencePenalty?: number = 0;

  @IsNumber()
  @Min(1)
  @IsOptional()
  maxTokens?: number;

  @IsNumber()
  @Min(1)
  @Max(300)
  @IsOptional()
  timeout?: number = 30;

  @IsBoolean()
  @IsOptional()
  stream?: boolean = true;
}

/**
 * AI模型限制配置
 */
export class AIModelLimitsDto {
  @IsNumber()
  @Min(1)
  @IsOptional()
  maxTokens?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  dailyLimit?: number; // 每日请求限制

  @IsNumber()
  @Min(1)
  @IsOptional()
  monthlyLimit?: number; // 每月请求限制

  @IsNumber()
  @Min(1)
  @IsOptional()
  concurrentLimit?: number; // 并发限制

  @IsNumber()
  @Min(0)
  @IsOptional()
  rateLimit?: number; // 速率限制（请求/秒）
}

/**
 * 系统AI模型配置
 */
export class SystemAIModelDto {
  @IsString()
  @IsNotEmpty()
  id: string; // 模型ID

  @IsString()
  @IsNotEmpty()
  name: string; // 模型名称

  @IsEnum(AIProvider)
  provider: AIProvider; // 服务商

  @IsString()
  @IsNotEmpty()
  model: string; // 模型名称（如gpt-4）

  @IsString()
  @IsNotEmpty()
  apiUrl: string; // API地址

  @IsString()
  @IsNotEmpty()
  apiKey: string; // API密钥

  @IsBoolean()
  @IsOptional()
  enabled?: boolean = true;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean = false;

  @IsEnum(AITier)
  @IsOptional()
  tier?: AITier = AITier.FREE;

  @IsString()
  @IsOptional()
  description?: string;

  @ValidateNested()
  @Type(() => AIModelLimitsDto)
  @IsOptional()
  limits?: AIModelLimitsDto;

  @ValidateNested()
  @Type(() => AIModelParametersDto)
  @IsOptional()
  parameters?: AIModelParametersDto;
}

/**
 * 获取系统AI配置响应
 */
export class GetSystemAIConfigResponseDto {
  @ValidateNested({ each: true })
  @Type(() => SystemAIModelDto)
  models: SystemAIModelDto[];
}

/**
 * 更新系统AI配置请求
 */
export class UpdateSystemAIConfigDto {
  @ValidateNested({ each: true })
  @Type(() => SystemAIModelDto)
  models: SystemAIModelDto[];
}

/**
 * 测试AI配置请求
 */
export class TestAIConfigDto {
  @IsEnum(AIProvider)
  provider: AIProvider;

  @IsString()
  @IsNotEmpty()
  apiUrl: string;

  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @ValidateNested()
  @Type(() => AIModelParametersDto)
  @IsOptional()
  parameters?: AIModelParametersDto;
}

// ===== 用户AI配置相关DTO =====

/**
 * 创建用户AI配置请求
 */
export class CreateUserAIConfigDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(AIProvider)
  provider: AIProvider;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsString()
  @IsNotEmpty()
  apiUrl: string;

  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean = true;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean = false;

  @ValidateNested()
  @Type(() => AIModelParametersDto)
  @IsOptional()
  parameters?: AIModelParametersDto;
}

/**
 * 更新用户AI配置请求
 */
export class UpdateUserAIConfigDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(AIProvider)
  @IsOptional()
  provider?: AIProvider;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  apiUrl?: string;

  @IsString()
  @IsOptional()
  apiKey?: string;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ValidateNested()
  @Type(() => AIModelParametersDto)
  @IsOptional()
  parameters?: AIModelParametersDto;
}

/**
 * 用户AI配置响应
 */
export class UserAIConfigResponseDto {
  id: string;
  userId: string;
  name: string;
  provider: AIProvider;
  model: string;
  apiUrl: string;
  enabled: boolean;
  isDefault: boolean;
  parameters: AIModelParametersDto;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 可用AI配置响应（全局+用户自定义）
 */
export class AvailableAIConfigsResponseDto {
  system: SystemAIModelDto[]; // 系统全局配置
  user: UserAIConfigResponseDto[]; // 用户自定义配置
  default: string; // 默认配置ID（格式：system:id 或 user:id）
}

// ===== AI调用相关DTO =====

/**
 * AI聊天消息
 */
export class AIChatMessageDto {
  @IsString()
  @IsNotEmpty()
  role: 'system' | 'user' | 'assistant';

  @IsString()
  @IsNotEmpty()
  content: string;
}

/**
 * AI聊天请求
 */
export class AIChatRequestDto {
  @ValidateNested({ each: true })
  @Type(() => AIChatMessageDto)
  messages: AIChatMessageDto[];

  @IsString()
  @IsOptional()
  configId?: string; // 配置ID，格式：system:id 或 user:id

  @IsBoolean()
  @IsOptional()
  stream?: boolean = false;

  @ValidateNested()
  @Type(() => AIModelParametersDto)
  @IsOptional()
  options?: AIModelParametersDto;
}

/**
 * AI聊天响应
 */
export class AIChatResponseDto {
  content: string;
  model: string;
  provider: AIProvider;
  tokensUsed: number;
  finishReason: string;
}

/**
 * AI使用统计响应
 */
export class AIUsageStatsResponseDto {
  date: string;
  provider: AIProvider;
  model: string;
  requestCount: number;
  tokensUsed: number;
  successCount: number;
  failureCount: number;
  totalCost: number;
}

