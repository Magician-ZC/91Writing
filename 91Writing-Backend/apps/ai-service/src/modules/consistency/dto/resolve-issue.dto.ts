import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, MaxLength } from 'class-validator';

export class ResolveIssueDto {
  @ApiProperty({ 
    description: '问题状态',
    enum: ['resolved', 'ignored', 'false_positive'],
    example: 'resolved'
  })
  @IsEnum(['resolved', 'ignored', 'false_positive'], {
    message: '状态必须是: resolved, ignored, false_positive'
  })
  status: string;

  @ApiPropertyOptional({ 
    description: '用户备注',
    maxLength: 500,
    example: '已修改章节内容，解决了此问题'
  })
  @IsOptional()
  @IsString({ message: '用户备注必须是字符串' })
  @MaxLength(500, { message: '用户备注不能超过500个字符' })
  userNote?: string;
}

