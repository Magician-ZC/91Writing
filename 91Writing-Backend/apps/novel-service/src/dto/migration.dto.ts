import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MigrationType } from '@prisma/client';

/**
 * 开始迁移DTO
 */
export class StartMigrationDto {
  @ApiProperty({
    description: '迁移类型',
    enum: MigrationType,
    example: 'NOVELS'
  })
  @IsEnum(MigrationType, { message: '迁移类型无效' })
  migrationType: MigrationType;

  @ApiProperty({
    description: '源数据',
    example: {
      novels: [
        { title: '测试小说', description: '测试描述', chapters: [] }
      ]
    }
  })
  @IsNotEmpty({ message: '源数据不能为空' })
  @IsObject({ message: '源数据必须是对象' })
  sourceData: Record<string, any>;

  @ApiPropertyOptional({
    description: '元数据',
    example: { source: 'localStorage', version: '1.0' }
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

/**
 * 批量导入小说DTO
 */
export class BatchImportNovelsDto {
  @ApiProperty({
    description: '小说数据列表',
    example: [
      {
        title: '小说标题',
        description: '小说简介',
        genre: '玄幻',
        chapters: [
          { title: '第一章', content: '章节内容' }
        ]
      }
    ]
  })
  @IsArray({ message: '小说数据必须是数组' })
  @IsNotEmpty({ message: '小说数据不能为空' })
  novels: Array<{
    title: string;
    description?: string;
    genre?: string;
    chapters?: Array<{
      title: string;
      content: string;
      chapterNumber?: number;
    }>;
  }>;
}

/**
 * 数据验证DTO
 */
export class ValidateMigrationDataDto {
  @ApiProperty({
    description: '迁移类型',
    enum: MigrationType
  })
  @IsEnum(MigrationType)
  migrationType: MigrationType;

  @ApiProperty({
    description: '待验证数据'
  })
  @IsNotEmpty()
  @IsObject()
  data: Record<string, any>;
}

/**
 * 回滚迁移DTO
 */
export class RollbackMigrationDto {
  @ApiProperty({
    description: '迁移ID'
  })
  @IsNotEmpty({ message: '迁移ID不能为空' })
  migrationId: string;
}

