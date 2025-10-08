import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsDateString } from 'class-validator';

export class BatchTrackDto {
  @ApiProperty({ description: '事件数组', type: [Object] })
  @IsArray()
  events: any[];
}

export class DateRangeDto {
  @ApiPropertyOptional({ description: '开始日期' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class RetentionQueryDto {
  @ApiProperty({ description: '队列日期' })
  @IsDateString()
  cohortDate: string;

  @ApiPropertyOptional({ description: '分析天数', default: '30' })
  @IsOptional()
  @IsString()
  days?: string;
}
