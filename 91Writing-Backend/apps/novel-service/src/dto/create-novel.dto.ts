import { IsNotEmpty, IsOptional, IsString, IsEnum, IsObject, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NovelStatus } from '@prisma/client';

export class CreateNovelDto {
  @ApiProperty({
    description: '小说标题',
    example: '魔法学院编年史',
    maxLength: 200,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    description: '小说描述',
    example: '这是一个关于年轻魔法师在学院中成长、冒险，最终拯救世界的故事。主角艾莉亚从一个普通的村庄女孩，成长为强大的魔法师。',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: '小说类型/题材',
    example: '奇幻',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  genre?: string;

  @ApiPropertyOptional({
    description: '小说状态',
    enum: NovelStatus,
    example: NovelStatus.DRAFT,
    default: NovelStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(NovelStatus)
  status?: NovelStatus = NovelStatus.DRAFT;

  @ApiPropertyOptional({
    description: '封面图片URL',
    example: 'https://example.com/covers/novel-cover.jpg',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverUrl?: string;

  @ApiPropertyOptional({
    description: '小说设置(角色、世界观等JSON数据)',
    type: 'object',
    example: {
      characters: [
        {
          name: '艾莉亚',
          age: 18,
          personality: '勇敢、聪明、好奇心强',
          background: '来自北方小村庄的普通少女',
          abilities: ['火系魔法天赋', '剑术基础', '治愈魔法'],
          relationships: [
            { name: '萨姆', relation: '青梅竹马', description: '最信任的伙伴' }
          ]
        }
      ],
      worldview: {
        setting: '中世纪奇幻世界',
        continent: '阿尔卑斯大陆',
        kingdoms: ['北方王国', '南方帝国', '东方联邦'],
        magic_system: {
          types: ['元素魔法', '治愈魔法', '黑暗魔法', '时空魔法'],
          learning: '需要通过魔法学院系统学习',
          restrictions: '每人只能精通2-3种魔法类型'
        },
        important_locations: [
          '魔法学院：大陆最权威的魔法教育机构',
          '北方村庄：艾莉亚的故乡',
          '王都：政治中心',
          '古老遗迹：隐藏着古代魔法秘密'
        ]
      },
      plot_structure: {
        act1: '发现魔法天赋，进入学院',
        act2: '学习成长，结识伙伴，面对挑战',
        act3: '揭开身世秘密，对抗黑暗势力',
        climax: '最终决战，拯救世界'
      },
      themes: ['成长', '友谊', '责任', '选择与牺牲'],
      tone: '轻松幽默中带有深刻思考'
    }
  })
  @IsOptional()
  @IsObject()
  settings?: any; // JSON对象，包含角色、世界观等设置
}
