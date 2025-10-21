import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsEnum, IsOptional, MinLength, MaxLength } from 'class-validator';

export class SubmitHelpFeedbackDto {
  @ApiProperty({ 
    description: '帮助类型',
    enum: ['guide', 'tooltip', 'tutorial', 'documentation'],
    example: 'guide'
  })
  @IsEnum(['guide', 'tooltip', 'tutorial', 'documentation'], {
    message: '帮助类型必须是: guide, tooltip, tutorial, documentation'
  })
  helpType: string;

  @ApiProperty({ 
    description: '帮助内容ID',
    example: 'welcome-guide',
    maxLength: 100
  })
  @IsString({ message: '帮助内容ID必须是字符串' })
  @MinLength(1, { message: '帮助内容ID不能为空' })
  @MaxLength(100, { message: '帮助内容ID不能超过100个字符' })
  helpId: string;

  @ApiProperty({ 
    description: '是否有帮助',
    example: true
  })
  @IsBoolean({ message: 'isHelpful必须是布尔值' })
  isHelpful: boolean;

  @ApiPropertyOptional({ 
    description: '用户反馈',
    maxLength: 500,
    example: '内容很清楚，对我帮助很大'
  })
  @IsOptional()
  @IsString({ message: '反馈内容必须是字符串' })
  @MaxLength(500, { message: '反馈内容不能超过500个字符' })
  feedback?: string;
}

