import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsInt, Min } from 'class-validator';
import { CreateNovelDto } from './create-novel.dto';

export class UpdateNovelDto extends PartialType(CreateNovelDto) {
  @IsOptional()
  @IsInt()
  @Min(0)
  wordCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  chapterCount?: number;
}
