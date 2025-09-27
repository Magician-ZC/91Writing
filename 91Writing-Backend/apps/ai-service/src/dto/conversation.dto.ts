import { IsNotEmpty, IsString, IsOptional, IsObject, IsEnum } from 'class-validator';

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
  @IsNotEmpty()
  @IsString()
  novelId: string;

  @IsNotEmpty()
  @IsString()
  prompt: string;

  @IsOptional()
  @IsEnum(['continuation', 'scene', 'dialogue', 'description', 'opening', 'ending'])
  contentType?: string = 'continuation';

  @IsOptional()
  @IsEnum(['short', 'medium', 'long'])
  length?: string = 'medium';

  @IsOptional()
  @IsEnum(['current', 'formal', 'casual', 'dramatic', 'humorous'])
  style?: string = 'current';

  @IsOptional()
  @IsObject()
  context?: any;
}
