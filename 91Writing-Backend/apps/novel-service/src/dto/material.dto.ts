import { IsString, IsOptional, IsEnum, IsNumber, Min, IsNotEmpty, IsArray, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MaterialType } from '@prisma/client';
import { Type } from 'class-transformer';

/**
 * 创建素材DTO
 */
export class CreateMaterialDto {
  @ApiProperty({
    description: '素材名称',
    example: '主角立绘.png'
  })
  @IsString({ message: '名称必须是字符串' })
  @IsNotEmpty({ message: '名称不能为空' })
  name: string;

  @ApiProperty({
    description: '素材类型',
    enum: MaterialType,
    example: 'IMAGE'
  })
  @IsEnum(MaterialType, { message: '素材类型无效' })
  type: MaterialType;

  @ApiPropertyOptional({
    description: '分类',
    example: '角色设定'
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: '文件URL',
    example: 'https://example.com/file.png'
  })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiPropertyOptional({
    description: '文件大小（字节）',
    example: 102400
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  fileSize?: number;

  @ApiPropertyOptional({
    description: '描述'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: '标签列表',
    example: ['角色', '主角', '设定']
  })
  @IsOptional()
  @IsArray()
  tags?: string[];
}

/**
 * 更新素材DTO
 */
export class UpdateMaterialDto {
  @ApiPropertyOptional({ description: '素材名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '素材类型', enum: MaterialType })
  @IsOptional()
  @IsEnum(MaterialType)
  type?: MaterialType;

  @ApiPropertyOptional({ description: '分类' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: '文件URL' })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiPropertyOptional({ description: '文件大小' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  fileSize?: number;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '标签列表' })
  @IsOptional()
  @IsArray()
  tags?: string[];
}

/**
 * 查询素材DTO
 */
export class QueryMaterialsDto {
  @ApiPropertyOptional({
    description: '素材类型筛选',
    enum: MaterialType
  })
  @IsOptional()
  @IsEnum(MaterialType)
  type?: MaterialType;

  @ApiPropertyOptional({
    description: '分类筛选'
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: '关键词搜索'
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({
    description: '标签筛选（逗号分隔）',
    example: '角色,主角'
  })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({
    description: '页码',
    example: 1,
    minimum: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: '每页数量',
    example: 20,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  pageSize?: number = 20;
}

/**
 * 批量删除素材DTO
 */
export class BatchDeleteMaterialsDto {
  @ApiProperty({
    description: '素材ID列表',
    example: ['id1', 'id2', 'id3']
  })
  @IsArray({ message: 'materialIds必须是数组' })
  @IsNotEmpty({ message: 'materialIds不能为空' })
  materialIds: string[];
}

/**
 * 批量更新分类DTO
 */
export class BatchUpdateCategoryDto {
  @ApiProperty({
    description: '素材ID列表',
    example: ['id1', 'id2']
  })
  @IsArray()
  @IsNotEmpty()
  materialIds: string[];

  @ApiProperty({
    description: '新分类',
    example: '角色设定'
  })
  @IsString()
  @IsNotEmpty()
  category: string;
}

/**
 * 添加素材引用DTO
 */
export class AddMaterialReferenceDto {
  @ApiProperty({
    description: '章节ID',
    example: 'chapter_xxx'
  })
  @IsString({ message: '章节ID必须是字符串' })
  @IsNotEmpty({ message: '章节ID不能为空' })
  chapterId: string;

  @ApiProperty({
    description: '小说ID',
    example: 'novel_xxx'
  })
  @IsString({ message: '小说ID必须是字符串' })
  @IsNotEmpty({ message: '小说ID不能为空' })
  novelId: string;

  @ApiPropertyOptional({
    description: '引用上下文',
    example: '在第三章中描述主角外貌时使用'
  })
  @IsOptional()
  @IsString()
  context?: string;

  @ApiPropertyOptional({
    description: '在章节中的位置',
    example: 100
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  position?: number;
}

/**
 * 素材分析DTO
 */
export class AnalyzeMaterialDto {
  @ApiProperty({
    description: '分析类型',
    enum: ['style', 'structure', 'characters', 'themes'],
    example: 'style'
  })
  @IsEnum(['style', 'structure', 'characters', 'themes'], { message: '分析类型无效' })
  analysisType: 'style' | 'structure' | 'characters' | 'themes';

  @ApiPropertyOptional({
    description: '提取文本长度',
    example: 500,
    default: 500
  })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Type(() => Number)
  extractLength?: number;

  @ApiPropertyOptional({
    description: '目标用途',
    enum: ['reference', 'inspiration', 'template'],
    example: 'reference'
  })
  @IsOptional()
  @IsEnum(['reference', 'inspiration', 'template'])
  targetUse?: string;
}

/**
 * 相似度检测DTO
 */
export class CheckSimilarityDto {
  @ApiProperty({
    description: '待检测内容',
    example: '这是一段需要检测的文本...'
  })
  @IsString({ message: '内容必须是字符串' })
  @IsNotEmpty({ message: '内容不能为空' })
  content: string;

  @ApiPropertyOptional({
    description: '相似度阈值',
    example: 0.7,
    minimum: 0,
    maximum: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  threshold?: number;
}

/**
 * 搜索向导适用素材DTO
 */
export class SearchWizardMaterialsDto {
  @ApiProperty({
    description: '向导步骤类型',
    enum: ['outline', 'character', 'worldview', 'scene', 'dialogue'],
    example: 'character'
  })
  @IsEnum(['outline', 'character', 'worldview', 'scene', 'dialogue'], { message: '步骤类型无效' })
  stepType: string;

  @ApiPropertyOptional({
    description: '用户输入的关键词',
    example: '主角 性格'
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({
    description: '返回数量限制',
    example: 5,
    default: 5
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}