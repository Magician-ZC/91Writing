import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsArray, IsString } from 'class-validator';

export class UpdateOnboardingDto {
  @ApiPropertyOptional({ 
    description: '欢迎引导是否完成',
    example: true
  })
  @IsOptional()
  @IsBoolean({ message: 'welcomeCompleted必须是布尔值' })
  welcomeCompleted?: boolean;

  @ApiPropertyOptional({ 
    description: '小说创建引导是否完成',
    example: true
  })
  @IsOptional()
  @IsBoolean({ message: 'novelCreationCompleted必须是布尔值' })
  novelCreationCompleted?: boolean;

  @ApiPropertyOptional({ 
    description: '编辑器引导是否完成',
    example: true
  })
  @IsOptional()
  @IsBoolean({ message: 'editorTourCompleted必须是布尔值' })
  editorTourCompleted?: boolean;

  @ApiPropertyOptional({ 
    description: 'AI功能引导是否完成',
    example: true
  })
  @IsOptional()
  @IsBoolean({ message: 'aiFeatureCompleted必须是布尔值' })
  aiFeatureCompleted?: boolean;

  @ApiPropertyOptional({ 
    description: '已发现的功能列表',
    type: [String],
    example: ['ai-writing', 'character-network']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  discoveredFeatures?: string[];

  @ApiPropertyOptional({ 
    description: '已完成的引导列表',
    type: [String],
    example: ['welcome-tour', 'editor-tour']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  completedTours?: string[];
}

