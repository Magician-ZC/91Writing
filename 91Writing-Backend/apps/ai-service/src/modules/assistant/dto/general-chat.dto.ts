import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class GeneralChatDto {
  @ApiProperty({
    description: '用户消息',
    example: '请帮我分析一下玄幻小说的市场潜力'
  })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiPropertyOptional({
    description: 'AI配置ID（格式：system:id 或 user:id，不提供则使用默认配置）',
    example: 'user:cm1234567890'
  })
  @IsOptional()
  @IsString()
  aiConfigId?: string;

  @ApiPropertyOptional({
    description: '额外参数',
    example: { temperature: 0.7, maxTokens: 4000 }
  })
  @IsOptional()
  @IsObject()
  parameters?: {
    temperature?: number;
    maxTokens?: number;
  };
}

