import { IsNotEmpty, IsString, IsOptional, IsObject, IsEnum, IsArray, IsNumber, Min, Max } from 'class-validator';

export enum SuggestionType {
  BASIC = 'basic',
  QUALITY = 'quality',
  STYLE = 'style',
  PERSONAL = 'personal',
  OPTIMIZATION = 'optimization',
  STRUCTURE = 'structure',
  LANGUAGE = 'language',
  PLOT = 'plot',
  CHARACTER = 'character',
  DIALOGUE = 'dialogue',
}

export enum SuggestionPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export class GenerateSuggestionsDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  novelId?: string;

  @IsOptional()
  @IsObject()
  context?: {
    currentChapter?: string;
    writingStyle?: string;
    targetAudience?: string;
    genre?: string;
  };

  @IsOptional()
  @IsArray()
  @IsEnum(SuggestionType, { each: true })
  suggestionTypes?: SuggestionType[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  maxSuggestions?: number = 8;
}

export class AnalyzeTextDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  novelId?: string;

  @IsOptional()
  @IsObject()
  options?: {
    includeDetailedFeedback?: boolean;
    checkReadability?: boolean;
    checkStyle?: boolean;
    checkEmotion?: boolean;
    checkCoherence?: boolean;
  };
}

export class ApplySuggestionDto {
  @IsNotEmpty()
  @IsString()
  suggestionId: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsString()
  action: string;

  @IsOptional()
  @IsObject()
  options?: any;
}
