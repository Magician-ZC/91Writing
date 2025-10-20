import { IsString, IsOptional, IsBoolean, IsDateString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChapterStatus } from '@prisma/client';

/**
 * 带冲突检测的章节更新 DTO
 */
export class UpdateChapterWithConflictDto {
  @ApiPropertyOptional({ 
    description: '章节标题',
    example: '第一章：新的开始',
    maxLength: 200
  })
  @IsOptional()
  @IsString({ message: '标题必须是字符串' })
  @MinLength(1, { message: '标题不能为空' })
  @MaxLength(200, { message: '标题不能超过200个字符' })
  title?: string;

  @ApiPropertyOptional({ 
    description: '章节内容',
    example: '章节正文内容...'
  })
  @IsOptional()
  @IsString({ message: '内容必须是字符串' })
  content?: string;

  @ApiPropertyOptional({ 
    description: '章节状态',
    enum: ['DRAFT', 'PUBLISHED'],
    example: 'DRAFT'
  })
  @IsOptional()
  status?: ChapterStatus;

  @ApiProperty({ 
    description: '客户端最后已知的更新时间（用于冲突检测）',
    example: '2025-01-08T10:30:00.000Z',
    type: String,
    format: 'date-time'
  })
  @IsDateString({}, { message: '最后更新时间格式不正确' })
  lastKnownUpdatedAt: string;

  @ApiPropertyOptional({ 
    description: '是否强制更新（忽略冲突）',
    default: false,
    type: Boolean
  })
  @IsOptional()
  @IsBoolean({ message: '强制更新标志必须是布尔值' })
  forceUpdate?: boolean = false;

  @ApiPropertyOptional({ 
    description: '冲突解决策略：keep-server(保留服务器)、keep-client(保留客户端)、merge(合并)',
    enum: ['keep-server', 'keep-client', 'merge'],
    example: 'keep-client'
  })
  @IsOptional()
  @IsString()
  conflictStrategy?: 'keep-server' | 'keep-client' | 'merge';
}

/**
 * 冲突响应 DTO
 */
export interface ConflictResponse {
  hasConflict: true;
  serverVersion: {
    updatedAt: Date;
    title: string;
    content: string;
    wordCount: number;
    updatedBy?: string;
  };
  clientVersion: {
    updatedAt: Date;
    title?: string;
    content?: string;
  };
  message: string;
  suggestedActions: string[];
}

