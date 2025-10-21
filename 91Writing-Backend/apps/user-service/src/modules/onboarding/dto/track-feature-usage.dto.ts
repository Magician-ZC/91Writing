import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, MinLength, MaxLength } from 'class-validator';

export class TrackFeatureUsageDto {
  @ApiProperty({ 
    description: '功能名称',
    example: 'ai-writing',
    maxLength: 100
  })
  @IsString({ message: '功能名称必须是字符串' })
  @MinLength(1, { message: '功能名称不能为空' })
  @MaxLength(100, { message: '功能名称不能超过100个字符' })
  featureName: string;

  @ApiProperty({ 
    description: '功能分类',
    enum: ['core', 'advanced', 'ai', 'tool'],
    example: 'ai'
  })
  @IsEnum(['core', 'advanced', 'ai', 'tool'], {
    message: '功能分类必须是: core, advanced, ai, tool'
  })
  category: string;
}

