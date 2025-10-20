import { IsNotEmpty, IsString, IsOptional, IsObject, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ConversationIntent {
  WRITING_REQUEST = 'writing_request',
  REVISION_REQUEST = 'revision_request',
  PLOT_CONSULTATION = 'plot_consultation',
  CHARACTER_CONSULTATION = 'character_consultation',
  TECHNIQUE_CONSULTATION = 'technique_consultation',
  ANALYSIS_REQUEST = 'analysis_request',
  GENERAL_CHAT = 'general_chat',
}

export class InitializeSessionDto {
  @IsNotEmpty()
  @IsString()
  novelId: string;

  @IsOptional()
  @IsString()
  currentChapter?: string;

  @IsOptional()
  @IsObject()
  writingGoals?: any[];

  @IsOptional()
  @IsObject()
  userPreferences?: any;
}

export class ConversationDto {
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  novelId?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsObject()
  context?: {
    selectedText?: string;
    currentParagraph?: string;
    recentContent?: string;
    currentChapter?: string;
  };
}

export class GenerateContentDto {
  @ApiProperty({
    description: '小说ID',
    example: 'cm1234567890'
  })
  @IsNotEmpty()
  @IsString()
  novelId: string;

  @ApiProperty({
    description: '生成内容的提示词/要求',
    example: '请续写一段主角和反派的对决场景'
  })
  @IsNotEmpty()
  @IsString()
  prompt: string;

  @ApiPropertyOptional({
    description: '内容类型',
    enum: ['continuation', 'scene', 'dialogue', 'description', 'opening', 'ending'],
    default: 'continuation',
    example: 'continuation'
  })
  @IsOptional()
  @IsEnum(['continuation', 'scene', 'dialogue', 'description', 'opening', 'ending'])
  contentType?: string = 'continuation';

  @ApiPropertyOptional({
    description: '内容长度',
    enum: ['short', 'medium', 'long'],
    default: 'medium',
    example: 'medium'
  })
  @IsOptional()
  @IsEnum(['short', 'medium', 'long'])
  length?: string = 'medium';

  @ApiPropertyOptional({
    description: '写作风格',
    enum: ['current', 'formal', 'casual', 'poetic'],
    default: 'current',
    example: 'current'
  })
  @IsOptional()
  @IsEnum(['current', 'formal', 'casual', 'poetic'])
  style?: string = 'current';

  @ApiPropertyOptional({
    description: 'AI配置ID（格式：system:id 或 user:id，不提供则使用默认配置）',
    example: 'user:cm1234567890'
  })
  @IsOptional()
  @IsString()
  aiConfigId?: string;

  @ApiPropertyOptional({
    description: '上下文信息（如当前章节内容、前文等）',
    type: 'string'
  })
  @IsOptional()
  @IsString()
  context?: string;
}
