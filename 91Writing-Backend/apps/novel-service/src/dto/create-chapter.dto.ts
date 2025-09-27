import { IsNotEmpty, IsString, IsInt, IsEnum, IsOptional, MaxLength, Min } from 'class-validator';
import { ChapterStatus } from '@prisma/client';

export class CreateChapterDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsInt()
  @Min(1)
  chapterNumber: number;

  @IsOptional()
  @IsEnum(ChapterStatus)
  status?: ChapterStatus = ChapterStatus.DRAFT;
}
