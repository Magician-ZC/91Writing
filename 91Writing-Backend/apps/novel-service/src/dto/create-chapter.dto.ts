import { IsNotEmpty, IsString, IsInt, IsEnum, IsOptional, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChapterStatus } from '@prisma/client';

export class CreateChapterDto {
  @ApiProperty({
    description: '章节标题',
    example: '第一章：魔法的觉醒',
    maxLength: 200,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: '章节内容',
    example: `夜幕降临，艾莉亚站在宿舍窗前，望着远方闪烁的星辰。今天是她进入魔法学院的第一天，心中既兴奋又忐忑。

"艾莉亚，你还不睡吗？"室友莉娜从床上探出头来，"明天还有早课呢。"

"我有些睡不着。"艾莉亚轻声回答，"总觉得有什么大事要发生。"

就在这时，她的手突然发出微弱的蓝光。艾莉亚吓了一跳，连忙握紧双手。

"这是什么？"她心中暗想，"难道这就是传说中的魔法力量觉醒？"

第二天一早，艾莉亚怀着忐忑的心情来到了第一堂课——魔法基础理论。老师是一位慈祥的老魔法师，名叫梅林教授。

"同学们，魔法不仅仅是力量，更是责任。"梅林教授的话语深深印在了艾莉亚心中，"每一位魔法师都肩负着保护这个世界的使命。"

课后，艾莉亚独自留在教室里练习基础法术。突然，门外传来急促的脚步声...`,
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    description: '章节序号',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  chapterNumber: number;

  @ApiPropertyOptional({
    description: '章节状态',
    enum: ChapterStatus,
    example: ChapterStatus.DRAFT,
    default: ChapterStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(ChapterStatus)
  status?: ChapterStatus = ChapterStatus.DRAFT;
}
