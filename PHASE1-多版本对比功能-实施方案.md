# Phase 1 - Week 3-4: 多版本对比功能实施方案

**开发时间**: Week 3-4  
**功能**: AI 多版本生成与对比  
**优先级**: ⭐⭐⭐⭐ (高)

---

## 📋 功能概述

### 核心价值
- AI 续写/润色时生成多个版本供选择
- 并排对比不同版本的差异
- 版本评分和用户反馈学习
- 智能合并不同版本的段落

### 用户场景
1. 用户请求 AI 续写
2. 系统生成 2-5 个不同风格的版本
3. 用户对比查看，选择最佳版本
4. 或从不同版本中选择段落组合

---

## 📊 数据库设计

### Prisma Schema

```prisma
// 91Writing-Backend/prisma/schema.prisma

// AI生成版本记录
model AIGenerationVersion {
  id          String   @id @default(uuid())
  novelId     String
  novel       Novel    @relation(fields: [novelId], references: [id], onDelete: Cascade)
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  chapterId   String?   // 关联的章节
  chapter     Chapter?  @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  
  requestType String    // 'continue' (续写), 'polish' (润色), 'expand' (扩写)
  prompt      String    @db.Text // 用户的提示词/要求
  context     String?   @db.Text // 上下文内容
  
  // 生成的多个版本
  versions    AIVersionContent[]
  
  // 用户选择的版本
  selectedVersionId String?
  selectedVersion   AIVersionContent? @relation("SelectedVersion", fields: [selectedVersionId], references: [id])
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([novelId])
  @@index([userId])
  @@index([chapterId])
}

// 版本内容
model AIVersionContent {
  id               String   @id @default(uuid())
  generationId     String
  generation       AIGenerationVersion @relation(fields: [generationId], references: [id], onDelete: Cascade)
  
  versionNumber    Int      // 版本号 (1, 2, 3...)
  content          String   @db.Text // 生成的内容
  
  // 风格标签
  styleHint        String?  // 'elegant', 'action', 'emotional', 'detailed'
  temperature      Float    @default(0.7) // 生成温度
  
  // 用户反馈
  userScore        Int?     // 1-5 星评分
  isSelected       Boolean  @default(false)
  userFeedback     String?  @db.Text
  
  // AI 自评
  quality          Float?   // AI 对质量的自我评估
  coherence        Float?   // 连贯性评分
  creativity       Float?   // 创造性评分
  
  createdAt        DateTime @default(now())
  
  selectedBy       AIGenerationVersion[] @relation("SelectedVersion")

  @@index([generationId])
  @@unique([generationId, versionNumber])
}

// 用户偏好学习
model UserStylePreference {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  // 偏好的风格
  preferredStyles     Json     // { elegant: 0.8, action: 0.6, emotional: 0.4 }
  
  // 偏好的参数
  preferredTemperature Float   @default(0.7)
  preferredLength      Int?    // 偏好的内容长度
  
  // 学习次数
  learnCount          Int     @default(0)
  lastUpdated         DateTime @updatedAt
  
  createdAt           DateTime @default(now())

  @@unique([userId])
}
```

---

## 🔧 后端实现

### 文件结构

```
91Writing-Backend/
├── apps/ai-service/src/modules/
│   └── multi-version/
│       ├── dto/
│       │   ├── generate-multi-version.dto.ts
│       │   ├── submit-feedback.dto.ts
│       │   └── version-response.dto.ts
│       ├── multi-version.controller.ts
│       ├── multi-version.service.ts
│       └── multi-version.module.ts
```

### 1. DTO 定义

#### generate-multi-version.dto.ts

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, IsInt, Min, Max, MinLength, MaxLength } from 'class-validator';

export class GenerateMultiVersionDto {
  @ApiProperty({ 
    description: '生成类型',
    enum: ['continue', 'polish', 'expand'],
    example: 'continue'
  })
  @IsEnum(['continue', 'polish', 'expand'], {
    message: '生成类型必须是: continue, polish, expand'
  })
  requestType: string;

  @ApiProperty({ 
    description: '用户提示词/要求',
    example: '请继续写主角与反派的对决场景，要有紧张感',
    maxLength: 1000
  })
  @IsString({ message: '提示词必须是字符串' })
  @MinLength(1, { message: '提示词不能为空' })
  @MaxLength(1000, { message: '提示词不能超过1000个字符' })
  prompt: string;

  @ApiPropertyOptional({ 
    description: '上下文内容',
    example: '前文内容...'
  })
  @IsOptional()
  @IsString()
  context?: string;

  @ApiPropertyOptional({ 
    description: '章节ID',
    example: 'cm123abc'
  })
  @IsOptional()
  @IsString()
  chapterId?: string;

  @ApiPropertyOptional({ 
    description: '生成版本数量',
    minimum: 2,
    maximum: 5,
    default: 3,
    example: 3
  })
  @IsOptional()
  @IsInt({ message: '版本数量必须是整数' })
  @Min(2, { message: '至少生成2个版本' })
  @Max(5, { message: '最多生成5个版本' })
  versionCount?: number = 3;

  @ApiPropertyOptional({ 
    description: '目标字数（仅续写时）',
    minimum: 100,
    maximum: 5000,
    example: 500
  })
  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(5000)
  targetWordCount?: number;

  @ApiPropertyOptional({ 
    description: '指定风格（可选）',
    example: ['elegant', 'action']
  })
  @IsOptional()
  @IsString({ each: true })
  styles?: string[];
}
```

#### submit-feedback.dto.ts

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, Max, IsBoolean } from 'class-validator';

export class SubmitFeedbackDto {
  @ApiProperty({ 
    description: '版本ID',
    example: 'version123'
  })
  @IsString({ message: '版本ID必须是字符串' })
  versionId: string;

  @ApiPropertyOptional({ 
    description: '用户评分 (1-5星)',
    minimum: 1,
    maximum: 5,
    example: 4
  })
  @IsOptional()
  @IsNumber({}, { message: '评分必须是数字' })
  @Min(1, { message: '评分最少1星' })
  @Max(5, { message: '评分最多5星' })
  userScore?: number;

  @ApiPropertyOptional({ 
    description: '是否选择此版本',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  isSelected?: boolean;

  @ApiPropertyOptional({ 
    description: '用户反馈',
    example: '这个版本的节奏更好',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  userFeedback?: string;
}
```

### 2. Service 实现

#### multi-version.service.ts

```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { GenerateMultiVersionDto } from './dto/generate-multi-version.dto';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';

@Injectable()
export class MultiVersionService {
  private openai: OpenAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
      baseURL: this.configService.get<string>('OPENAI_API_BASE_URL'),
    });
  }

  /**
   * 生成多个版本
   */
  async generateMultiVersion(userId: string, novelId: string, generateDto: GenerateMultiVersionDto) {
    // 验证小说所有权
    await this.validateNovelOwnership(userId, novelId);

    // 获取用户偏好
    const userPreference = await this.getUserPreference(userId);

    // 创建生成记录
    const generation = await this.prisma.aIGenerationVersion.create({
      data: {
        novelId,
        userId,
        chapterId: generateDto.chapterId,
        requestType: generateDto.requestType,
        prompt: generateDto.prompt,
        context: generateDto.context,
      },
    });

    // 生成多个版本
    const versions = await this.generateVersions(
      generateDto,
      generation.id,
      userPreference
    );

    // 保存版本到数据库
    const savedVersions = await this.prisma.$transaction(
      versions.map((version, index) =>
        this.prisma.aIVersionContent.create({
          data: {
            generationId: generation.id,
            versionNumber: index + 1,
            content: version.content,
            styleHint: version.styleHint,
            temperature: version.temperature,
            quality: version.quality,
            coherence: version.coherence,
            creativity: version.creativity,
          },
        })
      )
    );

    return {
      generationId: generation.id,
      versions: savedVersions,
    };
  }

  /**
   * 生成版本的核心逻辑
   */
  private async generateVersions(
    generateDto: GenerateMultiVersionDto,
    generationId: string,
    userPreference: any
  ) {
    const versionCount = generateDto.versionCount || 3;
    const versions = [];

    // 定义不同的风格配置
    const styleConfigs = [
      { hint: 'elegant', temp: 0.6, prompt: '优雅细腻的文风，注重细节描写' },
      { hint: 'action', temp: 0.8, prompt: '动作流畅，节奏紧凑' },
      { hint: 'emotional', temp: 0.7, prompt: '情感充沛，注重内心刻画' },
      { hint: 'detailed', temp: 0.65, prompt: '详细描写，场景感强' },
      { hint: 'concise', temp: 0.75, prompt: '简洁有力，重点突出' },
    ];

    // 如果用户指定了风格，使用指定的风格
    let selectedStyles = styleConfigs;
    if (generateDto.styles && generateDto.styles.length > 0) {
      selectedStyles = styleConfigs.filter(s => 
        generateDto.styles.includes(s.hint)
      );
    }

    // 根据用户偏好排序
    if (userPreference) {
      selectedStyles = this.sortByPreference(selectedStyles, userPreference);
    }

    // 生成指定数量的版本
    for (let i = 0; i < versionCount && i < selectedStyles.length; i++) {
      const config = selectedStyles[i];
      
      try {
        const content = await this.generateSingleVersion(
          generateDto,
          config
        );

        // AI 自评
        const evaluation = await this.evaluateVersion(content);

        versions.push({
          content,
          styleHint: config.hint,
          temperature: config.temp,
          quality: evaluation.quality,
          coherence: evaluation.coherence,
          creativity: evaluation.creativity,
        });
      } catch (error) {
        console.error(`生成版本 ${i + 1} 失败:`, error);
        // 继续生成其他版本
      }
    }

    // 如果生成的版本不够，使用默认配置补充
    while (versions.length < versionCount) {
      try {
        const config = styleConfigs[versions.length % styleConfigs.length];
        const content = await this.generateSingleVersion(generateDto, config);
        const evaluation = await this.evaluateVersion(content);

        versions.push({
          content,
          styleHint: config.hint,
          temperature: config.temp,
          quality: evaluation.quality,
          coherence: evaluation.coherence,
          creativity: evaluation.creativity,
        });
      } catch (error) {
        break;
      }
    }

    return versions;
  }

  /**
   * 生成单个版本
   */
  private async generateSingleVersion(
    generateDto: GenerateMultiVersionDto,
    styleConfig: any
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(generateDto.requestType, styleConfig);
    const userPrompt = this.buildUserPrompt(generateDto);

    const response = await this.openai.chat.completions.create({
      model: this.configService.get<string>('OPENAI_MODEL_NAME') || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: styleConfig.temp,
      max_tokens: generateDto.targetWordCount 
        ? Math.min(generateDto.targetWordCount * 2, 4000)
        : 2000,
    });

    return response.choices[0].message.content || '';
  }

  /**
   * 评估版本质量
   */
  private async evaluateVersion(content: string) {
    // 简单的质量评估逻辑
    // 实际项目中可以使用更复杂的 NLP 分析
    
    const wordCount = content.length;
    const sentenceCount = content.split(/[。！？]/).length;
    const avgSentenceLength = wordCount / sentenceCount;

    return {
      quality: Math.min(0.9, 0.5 + wordCount / 2000), // 基于长度
      coherence: Math.min(0.9, avgSentenceLength / 50), // 基于句子长度
      creativity: 0.5 + Math.random() * 0.4, // 随机生成（实际应该用AI评估）
    };
  }

  /**
   * 提交用户反馈
   */
  async submitFeedback(userId: string, feedbackDto: SubmitFeedbackDto) {
    // 验证版本存在
    const version = await this.prisma.aIVersionContent.findUnique({
      where: { id: feedbackDto.versionId },
      include: { generation: true },
    });

    if (!version) {
      throw new NotFoundException('版本不存在');
    }

    // 验证所有权
    if (version.generation.userId !== userId) {
      throw new BadRequestException('无权限操作此版本');
    }

    // 更新版本反馈
    await this.prisma.aIVersionContent.update({
      where: { id: feedbackDto.versionId },
      data: {
        userScore: feedbackDto.userScore,
        isSelected: feedbackDto.isSelected,
        userFeedback: feedbackDto.userFeedback,
      },
    });

    // 如果选择了此版本，更新生成记录
    if (feedbackDto.isSelected) {
      await this.prisma.aIGenerationVersion.update({
        where: { id: version.generationId },
        data: { selectedVersionId: feedbackDto.versionId },
      });
    }

    // 学习用户偏好
    await this.learnUserPreference(userId, version, feedbackDto);

    return { message: '反馈提交成功' };
  }

  /**
   * 获取生成历史
   */
  async getGenerationHistory(userId: string, novelId: string) {
    await this.validateNovelOwnership(userId, novelId);

    return this.prisma.aIGenerationVersion.findMany({
      where: { novelId },
      include: {
        versions: {
          orderBy: { versionNumber: 'asc' },
        },
        selectedVersion: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  /**
   * 获取单次生成的详情
   */
  async getGenerationDetail(userId: string, generationId: string) {
    const generation = await this.prisma.aIGenerationVersion.findUnique({
      where: { id: generationId },
      include: {
        versions: {
          orderBy: { versionNumber: 'asc' },
        },
        selectedVersion: true,
      },
    });

    if (!generation) {
      throw new NotFoundException('生成记录不存在');
    }

    if (generation.userId !== userId) {
      throw new BadRequestException('无权限访问');
    }

    return generation;
  }

  // ========== 辅助方法 ==========

  private async validateNovelOwnership(userId: string, novelId: string) {
    const novel = await this.prisma.novel.findFirst({
      where: { id: novelId, userId },
    });

    if (!novel) {
      throw new NotFoundException('小说不存在或无权访问');
    }

    return novel;
  }

  private async getUserPreference(userId: string) {
    return this.prisma.userStylePreference.findUnique({
      where: { userId },
    });
  }

  private sortByPreference(styles: any[], preference: any) {
    if (!preference || !preference.preferredStyles) {
      return styles;
    }

    return styles.sort((a, b) => {
      const scoreA = preference.preferredStyles[a.hint] || 0;
      const scoreB = preference.preferredStyles[b.hint] || 0;
      return scoreB - scoreA;
    });
  }

  private async learnUserPreference(userId: string, version: any, feedback: SubmitFeedbackDto) {
    // 获取或创建用户偏好
    let preference = await this.prisma.userStylePreference.findUnique({
      where: { userId },
    });

    if (!preference) {
      preference = await this.prisma.userStylePreference.create({
        data: {
          userId,
          preferredStyles: {},
          preferredTemperature: 0.7,
        },
      });
    }

    // 更新偏好分数
    const styles = preference.preferredStyles as any || {};
    const styleHint = version.styleHint;

    if (feedback.isSelected || (feedback.userScore && feedback.userScore >= 4)) {
      styles[styleHint] = Math.min(1.0, (styles[styleHint] || 0.5) + 0.1);
    } else if (feedback.userScore && feedback.userScore <= 2) {
      styles[styleHint] = Math.max(0, (styles[styleHint] || 0.5) - 0.1);
    }

    // 保存更新
    await this.prisma.userStylePreference.update({
      where: { userId },
      data: {
        preferredStyles: styles,
        learnCount: { increment: 1 },
      },
    });
  }

  private buildSystemPrompt(requestType: string, styleConfig: any): string {
    const basePrompt = '你是一个专业的小说创作助手。';
    
    const typePrompts = {
      continue: '请根据上文内容继续创作，保持风格一致。',
      polish: '请对以下内容进行润色优化，提升文字质量。',
      expand: '请对以下内容进行扩写，增加细节描写。',
    };

    return `${basePrompt}\n${typePrompts[requestType]}\n风格要求：${styleConfig.prompt}`;
  }

  private buildUserPrompt(generateDto: GenerateMultiVersionDto): string {
    let prompt = `用户要求：${generateDto.prompt}\n\n`;
    
    if (generateDto.context) {
      prompt += `上文内容：\n${generateDto.context}\n\n`;
    }

    if (generateDto.targetWordCount) {
      prompt += `目标字数：约${generateDto.targetWordCount}字`;
    }

    return prompt;
  }
}
```

### 3. Controller 实现

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/common';
import { MultiVersionService } from './multi-version.service';
import { GenerateMultiVersionDto } from './dto/generate-multi-version.dto';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';

@ApiTags('AI 多版本生成')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MultiVersionController {
  constructor(private readonly multiVersionService: MultiVersionService) {}

  @Post('novels/:novelId/ai/multi-version')
  @ApiOperation({ summary: '生成多个AI版本' })
  @ApiParam({ name: 'novelId', description: '小说ID' })
  @ApiResponse({ status: 201, description: '生成成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  async generate(
    @Request() req,
    @Param('novelId') novelId: string,
    @Body(ValidationPipe) generateDto: GenerateMultiVersionDto,
  ) {
    return this.multiVersionService.generateMultiVersion(
      req.user.id,
      novelId,
      generateDto
    );
  }

  @Post('ai/versions/feedback')
  @ApiOperation({ summary: '提交版本反馈' })
  @ApiResponse({ status: 200, description: '反馈成功' })
  @HttpCode(HttpStatus.OK)
  async submitFeedback(
    @Request() req,
    @Body(ValidationPipe) feedbackDto: SubmitFeedbackDto,
  ) {
    return this.multiVersionService.submitFeedback(req.user.id, feedbackDto);
  }

  @Get('novels/:novelId/ai/generations')
  @ApiOperation({ summary: '获取生成历史' })
  @ApiParam({ name: 'novelId', description: '小说ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getHistory(
    @Request() req,
    @Param('novelId') novelId: string,
  ) {
    return this.multiVersionService.getGenerationHistory(req.user.id, novelId);
  }

  @Get('ai/generations/:id')
  @ApiOperation({ summary: '获取生成详情' })
  @ApiParam({ name: 'id', description: '生成记录ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getDetail(
    @Request() req,
    @Param('id') generationId: string,
  ) {
    return this.multiVersionService.getGenerationDetail(req.user.id, generationId);
  }
}
```

---

## 🎨 前端实现见下一个文件...

---

**状态**: ✅ 后端实施方案完成  
**下一步**: 前端对比UI开发

