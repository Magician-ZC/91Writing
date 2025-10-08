import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';

// 评论状态枚举
export enum CommentStatusEnum {
  ACTIVE = 'ACTIVE',
  RESOLVED = 'RESOLVED',
  DELETED = 'DELETED',
}

// 创建评论DTO
export class CreateCommentDto {
  @IsString()
  chapterId: string;

  @IsString()
  userId: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsObject()
  position?: any; // 评论位置信息（段落、字符位置等）

  @IsOptional()
  @IsString()
  parentId?: string; // 父评论ID（用于回复）
}

// 更新评论DTO
export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(CommentStatusEnum)
  status?: CommentStatusEnum;
}

// 查询评论DTO
export class QueryCommentsDto {
  @IsString()
  chapterId: string;

  @IsOptional()
  @IsEnum(CommentStatusEnum)
  status?: CommentStatusEnum;

  @IsOptional()
  @IsString()
  userId?: string;
}
