import { IsString, IsUUID, IsOptional, IsEnum, IsObject } from 'class-validator';

// 协作权限枚举
export enum CollaborationRole {
  OWNER = 'OWNER',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
  COMMENTER = 'COMMENTER',
}

// 协作状态枚举
export enum CollaborationStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  REVOKED = 'REVOKED',
}

// 创建协作DTO
export class CreateCollaborationDto {
  @IsString()
  novelId: string;

  @IsString()
  userId: string;

  @IsEnum(CollaborationRole)
  role: CollaborationRole;

  @IsOptional()
  @IsString()
  message?: string;
}

// 更新协作DTO
export class UpdateCollaborationDto {
  @IsOptional()
  @IsEnum(CollaborationRole)
  role?: CollaborationRole;

  @IsOptional()
  @IsEnum(CollaborationStatus)
  status?: CollaborationStatus;
}

// 章节锁定DTO
export class LockChapterDto {
  @IsString()
  chapterId: string;

  @IsString()
  userId: string;
}

// 章节解锁DTO
export class UnlockChapterDto {
  @IsString()
  chapterId: string;

  @IsString()
  userId: string;
}

// 实时编辑事件DTO
export class EditEventDto {
  @IsString()
  chapterId: string;

  @IsString()
  userId: string;

  @IsString()
  eventType: string; // 'insert', 'delete', 'replace'

  @IsObject()
  data: any; // 编辑内容数据
}
