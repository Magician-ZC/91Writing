import { IsNotEmpty, IsEnum, IsObject, IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';
import { MemoryType } from '@prisma/client';

export class CreateMemoryDto {
  @IsNotEmpty()
  @IsEnum(MemoryType)
  memoryType: MemoryType;

  @IsNotEmpty()
  @IsObject()
  content: any; // JSON对象，存储记忆内容

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  importance?: number = 0.5;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tokenCost?: number = 0;

  @IsOptional()
  @IsString()
  chapterRange?: string; // 例如: "1-5" 或 "3"
}
