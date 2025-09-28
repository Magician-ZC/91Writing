import { IsNotEmpty, IsEnum, IsObject, IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MemoryType } from '@prisma/client';

export class CreateMemoryDto {
  @ApiProperty({
    description: '记忆类型',
    enum: MemoryType,
    example: MemoryType.CORE,
    enumName: 'MemoryType'
  })
  @IsNotEmpty()
  @IsEnum(MemoryType)
  memoryType: MemoryType;

  @ApiProperty({
    description: '记忆内容(JSON对象，根据类型存储不同结构的数据)',
    type: 'object',
    examples: {
      core_character: {
        summary: '核心角色记忆示例',
        value: {
          type: 'character_profile',
          character: '艾莉亚',
          details: {
            name: '艾莉亚·晨光',
            age: 18,
            appearance: '长发飘逸，眼神坚定，身材修长',
            personality: '勇敢、好奇心强、有强烈的正义感',
            background: '北方小村庄的普通少女，在18岁时觉醒了强大的魔法能力',
            abilities: ['火系魔法', '治愈术', '敏锐的直觉'],
            relationships: {
              '萨姆': '青梅竹马，最信任的伙伴',
              '梅林教授': '魔法导师，亦师亦父'
            },
            goals: ['掌握自己的魔法力量', '保护所爱的人', '寻找生命的真谛'],
            fears: ['失控的力量伤害他人', '辜负大家的期望']
          }
        }
      },
      summary_plot: {
        summary: '情节摘要记忆示例',
        value: {
          type: 'plot_summary',
          chapters: '1-3',
          summary: '艾莉亚觉醒魔法能力后进入学院学习，结识了室友莉娜和导师梅林教授，在第一次魔法课上展现出惊人天赋，但也引起了同学的嫉妒',
          key_events: [
            '魔法觉醒',
            '进入魔法学院',
            '遇见室友莉娜',
            '梅林教授的第一课',
            '展现魔法天赋'
          ],
          character_development: '从紧张不安到逐渐适应学院生活',
          conflicts: ['同学的嫉妒和排斥', '对自己力量的恐惧'],
          resolutions: ['通过努力获得认可', '学会控制魔法力量']
        }
      },
      context_world: {
        summary: '世界观上下文记忆示例',
        value: {
          type: 'world_context',
          location: '魔法学院',
          description: '大陆最权威的魔法教育机构，坐落在圣山之巅，建筑宏伟，充满魔法气息',
          atmosphere: '庄严神圣，但又充满活力和希望',
          important_npcs: [
            {
              name: '梅林教授',
              role: '魔法基础理论教师',
              personality: '慈祥睿智，对学生要求严格但关爱有加'
            },
            {
              name: '院长',
              role: '学院最高管理者',
              mystery: '传说中的大魔法师，很少露面'
            }
          ],
          rules_and_customs: [
            '学院内禁止私斗',
            '每周进行魔法测试',
            '优秀学生可获得特殊指导'
          ],
          secrets: '学院地下隐藏着古代魔法遗迹'
        }
      }
    }
  })
  @IsNotEmpty()
  @IsObject()
  content: any; // JSON对象，存储记忆内容

  @ApiPropertyOptional({
    description: '记忆重要性权重(0.0-1.0，越高越重要)',
    example: 0.8,
    minimum: 0,
    maximum: 1,
    default: 0.5
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  importance?: number = 0.5;

  @ApiPropertyOptional({
    description: 'AI处理此记忆消耗的Token数量',
    example: 150,
    minimum: 0,
    default: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tokenCost?: number = 0;

  @ApiPropertyOptional({
    description: '相关章节范围',
    example: '1-5',
    examples: {
      single: { value: '3', summary: '单个章节' },
      range: { value: '1-5', summary: '章节范围' },
      multiple: { value: '1,3,5', summary: '多个章节' }
    }
  })
  @IsOptional()
  @IsString()
  chapterRange?: string; // 例如: "1-5" 或 "3"
}
