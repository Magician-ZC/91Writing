import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class CreateConsistencyCheckDto {
  @ApiProperty({ 
    description: '检测类型',
    enum: ['worldview', 'character', 'timeline', 'full'],
    example: 'worldview'
  })
  @IsEnum(['worldview', 'character', 'timeline', 'full'], {
    message: '检测类型必须是: worldview, character, timeline, full'
  })
  checkType: string;

  @ApiPropertyOptional({ 
    description: '检测的章节ID列表（为空则检测全部）',
    type: [String],
    example: ['chapter1', 'chapter2']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  chapterIds?: string[];

  @ApiPropertyOptional({ 
    description: '是否使用AI增强检测',
    default: true,
    example: true
  })
  @IsOptional()
  @IsBoolean()
  aiEnhanced?: boolean = true;
}

