import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength } from 'class-validator';

export class ExtractFeaturesDto {
  @ApiProperty({ 
    description: '章节ID',
    example: 'chapter123'
  })
  @IsString({ message: '章节ID必须是字符串' })
  @MinLength(1, { message: '章节ID不能为空' })
  chapterId: string;

  @ApiPropertyOptional({ 
    description: '是否自动确认提取的特征',
    default: false,
    example: false
  })
  @IsOptional()
  autoConfirm?: boolean = false;
}

