import { IsNotEmpty, IsOptional, IsString, IsEnum, IsObject, MaxLength } from 'class-validator';
import { NovelStatus } from '@prisma/client';

export class CreateNovelDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  genre?: string;

  @IsOptional()
  @IsEnum(NovelStatus)
  status?: NovelStatus = NovelStatus.DRAFT;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverUrl?: string;

  @IsOptional()
  @IsObject()
  settings?: any; // JSON对象，包含角色、世界观等设置
}
