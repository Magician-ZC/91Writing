import { IsString, IsOptional, IsInt } from 'class-validator';

// 创建版本DTO
export class CreateVersionDto {
  @IsString()
  chapterId: string;

  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  changeLog?: string;
}

// 版本对比DTO
export class CompareVersionsDto {
  @IsString()
  chapterId: string;

  @IsInt()
  version1: number;

  @IsInt()
  version2: number;
}

// 回滚到版本DTO
export class RestoreVersionDto {
  @IsString()
  chapterId: string;

  @IsInt()
  versionNumber: number;

  @IsString()
  userId: string;
}
