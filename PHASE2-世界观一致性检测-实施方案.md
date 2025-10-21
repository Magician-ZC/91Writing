# Phase 2 - Week 5-6: 世界观一致性检测功能实施方案

**开发时间**: Week 5-6  
**功能**: AI驱动的世界观一致性检测  
**优先级**: ⭐⭐⭐⭐ (高)

---

## 📋 功能概述

### 核心价值
- 自动检测小说中的世界观矛盾
- AI分析魔法体系、等级制度的逻辑一致性
- 时间线冲突检测
- 提供智能修复建议

### 用户场景
1. 用户完成多章节创作
2. 点击"一致性检查"
3. 系统分析所有章节内容
4. 标记出矛盾点和不一致之处
5. 提供修复建议

### 技术方案
- **分阶段实现**: 先规则检测，后AI增强
- **混合策略**: 规则引擎 + AI分析
- **增量检测**: 支持单章节和全文检测

---

## 📊 数据库设计

### Prisma Schema

```prisma
// 91Writing-Backend/prisma/schema.prisma

// 一致性检测记录
model ConsistencyCheck {
  id          String   @id @default(uuid())
  novelId     String
  novel       Novel    @relation(fields: [novelId], references: [id], onDelete: Cascade)
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  checkType   String   // 'worldview', 'character', 'timeline', 'full'
  status      String   @default("pending") // 'pending', 'processing', 'completed', 'failed'
  
  // 检测范围
  chapterIds  Json?    // 检测的章节ID列表
  
  // 检测结果
  totalIssues Int      @default(0)
  criticalIssues Int   @default(0)
  warningIssues Int    @default(0)
  
  // 检测详情
  issues      ConsistencyIssue[]
  
  startedAt   DateTime?
  completedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([novelId])
  @@index([userId])
  @@index([status])
}

// 一致性问题
model ConsistencyIssue {
  id          String   @id @default(uuid())
  checkId     String
  check       ConsistencyCheck @relation(fields: [checkId], references: [id], onDelete: Cascade)
  
  // 问题分类
  category    String   // 'worldview', 'character', 'timeline', 'logic', 'setting'
  severity    String   // 'critical', 'warning', 'info'
  
  // 问题描述
  title       String   @db.VarChar(200)
  description String   @db.Text
  
  // 问题位置
  chapterId   String?
  chapter     Chapter? @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  chapterNumber Int?
  locationText String?  @db.Text // 具体文本位置
  
  // 冲突信息
  conflictWith String? @db.Text // 与哪个设定/章节冲突
  
  // AI建议
  suggestions  Json?    // 修复建议列表
  aiConfidence Float?   // AI置信度 0-1
  
  // 用户操作
  status      String   @default("unresolved") // 'unresolved', 'resolved', 'ignored', 'false_positive'
  userNote    String?  @db.Text
  resolvedAt  DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([checkId])
  @@index([category])
  @@index([severity])
  @@index([status])
}

// 世界观规则库
model WorldviewRule {
  id          String   @id @default(uuid())
  novelId     String
  novel       Novel    @relation(fields: [novelId], references: [id], onDelete: Cascade)
  
  ruleType    String   // 'magic_system', 'power_level', 'geography', 'currency', 'custom'
  ruleName    String   @db.VarChar(100)
  ruleContent String   @db.Text
  
  // 规则参数（用于自动检测）
  parameters  Json?    // 如：等级数量、魔法类型等
  
  // 提取来源
  extractedFrom String? // 'manual', 'ai_extracted', 'world_setting'
  sourceChapterId String?
  sourceChapter   Chapter? @relation(fields: [sourceChapterId], references: [id], onDelete: SetNull)
  
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([novelId])
  @@index([ruleType])
}

// 时间线事件
model TimelineEvent {
  id          String   @id @default(uuid())
  novelId     String
  novel       Novel    @relation(fields: [novelId], references: [id], onDelete: Cascade)
  
  eventName   String   @db.VarChar(200)
  description String?  @db.Text
  
  // 时间信息
  chapterNumber Int
  eventOrder  Int      // 章节内的事件顺序
  
  // 时间描述（AI提取）
  timeExpression String? @db.VarChar(500) // "三天后"、"一个月前"等
  estimatedDays Int?    // 估算的天数
  
  // 关联
  chapterId   String
  chapter     Chapter  @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  
  // 涉及角色
  involvedCharacters Json? // 角色ID列表
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([novelId])
  @@index([chapterId])
  @@unique([novelId, chapterNumber, eventOrder])
}
```

---

## 🔧 后端实现

### 文件结构

```
91Writing-Backend/
├── apps/ai-service/src/modules/
│   └── consistency/
│       ├── dto/
│       │   ├── create-consistency-check.dto.ts
│       │   ├── consistency-check-response.dto.ts
│       │   ├── resolve-issue.dto.ts
│       │   └── worldview-rule.dto.ts
│       ├── consistency-check.controller.ts
│       ├── consistency-check.service.ts
│       ├── detectors/
│       │   ├── worldview.detector.ts
│       │   ├── timeline.detector.ts
│       │   ├── logic.detector.ts
│       │   └── base.detector.ts
│       └── consistency.module.ts
```

### 1. DTO 定义

#### create-consistency-check.dto.ts

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsArray } from 'class-validator';

export class CreateConsistencyCheckDto {
  @ApiProperty({ 
    description: '检测类型',
    enum: ['worldview', 'character', 'timeline', 'full'],
    example: 'worldview'
  })
  @IsEnum(['worldview', 'character', 'timeline', 'full'], {
    message: '检测类型必须是: worldview, character, timeline, full'
  })
  checkType: string;

  @ApiPropertyOptional({ 
    description: '检测的章节ID列表（为空则检测全部）',
    type: [String],
    example: ['chapter1', 'chapter2']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  chapterIds?: string[];

  @ApiPropertyOptional({ 
    description: '是否使用AI增强检测',
    default: true
  })
  @IsOptional()
  aiEnhanced?: boolean = true;
}
```

#### resolve-issue.dto.ts

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, MaxLength } from 'class-validator';

export class ResolveIssueDto {
  @ApiProperty({ 
    description: '问题状态',
    enum: ['resolved', 'ignored', 'false_positive'],
    example: 'resolved'
  })
  @IsEnum(['resolved', 'ignored', 'false_positive'])
  status: string;

  @ApiPropertyOptional({ 
    description: '用户备注',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  userNote?: string;
}
```

### 2. 检测器基类

#### detectors/base.detector.ts

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database';

export interface DetectionResult {
  category: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  chapterId?: string;
  chapterNumber?: number;
  locationText?: string;
  conflictWith?: string;
  suggestions?: any[];
  aiConfidence?: number;
}

@Injectable()
export abstract class BaseDetector {
  constructor(protected readonly prisma: PrismaService) {}

  /**
   * 执行检测
   */
  abstract detect(
    novelId: string,
    chapters: any[],
    settings: any[]
  ): Promise<DetectionResult[]>;

  /**
   * 获取检测器名称
   */
  abstract getName(): string;

  /**
   * 提取关键信息
   */
  protected extractKeyInfo(text: string, pattern: RegExp): string[] {
    const matches = text.match(pattern);
    return matches || [];
  }

  /**
   * 计算文本相似度
   */
  protected calculateSimilarity(text1: string, text2: string): number {
    // 简单的相似度计算
    const words1 = new Set(text1.split(/\s+/));
    const words2 = new Set(text2.split(/\s+/));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    return intersection.size / union.size;
  }
}
```

### 3. 世界观检测器

#### detectors/worldview.detector.ts

```typescript
import { Injectable } from '@nestjs/common';
import { BaseDetector, DetectionResult } from './base.detector';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WorldviewDetector extends BaseDetector {
  private openai: OpenAI;

  constructor(
    prisma: PrismaService,
    private configService: ConfigService
  ) {
    super(prisma);
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
      baseURL: this.configService.get<string>('OPENAI_API_BASE_URL'),
    });
  }

  getName(): string {
    return 'WorldviewDetector';
  }

  async detect(
    novelId: string,
    chapters: any[],
    settings: any[]
  ): Promise<DetectionResult[]> {
    const issues: DetectionResult[] = [];

    // 1. 规则检测：魔法体系一致性
    const magicIssues = await this.detectMagicSystemInconsistency(
      novelId,
      chapters,
      settings
    );
    issues.push(...magicIssues);

    // 2. 规则检测：等级制度一致性
    const levelIssues = await this.detectPowerLevelInconsistency(
      novelId,
      chapters,
      settings
    );
    issues.push(...levelIssues);

    // 3. AI检测：深度语义分析
    const aiIssues = await this.detectSemanticInconsistency(
      novelId,
      chapters,
      settings
    );
    issues.push(...aiIssues);

    return issues;
  }

  /**
   * 检测魔法体系一致性
   */
  private async detectMagicSystemInconsistency(
    novelId: string,
    chapters: any[],
    settings: any[]
  ): Promise<DetectionResult[]> {
    const issues: DetectionResult[] = [];

    // 提取魔法相关设定
    const magicSettings = settings.filter(s => 
      s.category === 'magic' || 
      s.title?.includes('魔法') ||
      s.title?.includes('法术')
    );

    if (magicSettings.length === 0) {
      return issues;
    }

    // 提取魔法体系规则
    const magicRules = await this.extractMagicRules(magicSettings);

    // 检查每个章节
    for (const chapter of chapters) {
      const violations = await this.checkMagicRulesInChapter(
        chapter,
        magicRules
      );
      issues.push(...violations);
    }

    return issues;
  }

  /**
   * 提取魔法规则
   */
  private async extractMagicRules(settings: any[]): Promise<any> {
    // 合并所有魔法设定
    const combinedSettings = settings
      .map(s => `${s.title}: ${s.description}`)
      .join('\n\n');

    // 使用AI提取结构化规则
    const prompt = `
请从以下魔法体系设定中提取关键规则：

${combinedSettings}

请提取以下信息（JSON格式）：
1. magic_types: 魔法的种类列表
2. power_levels: 等级列表（如果有）
3. limitations: 魔法的限制条件
4. requirements: 施法要求

返回JSON格式。
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.configService.get<string>('OPENAI_MODEL_NAME') || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: '你是一个专业的小说世界观分析助手。' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('提取魔法规则失败:', error);
      return {};
    }
  }

  /**
   * 检查章节中的魔法规则违反
   */
  private async checkMagicRulesInChapter(
    chapter: any,
    magicRules: any
  ): Promise<DetectionResult[]> {
    const issues: DetectionResult[] = [];

    if (!chapter.content || !magicRules.magic_types) {
      return issues;
    }

    // 检测是否出现了未定义的魔法类型
    const mentionedMagic = await this.extractMagicMentions(chapter.content);
    
    for (const mention of mentionedMagic) {
      const isDefined = magicRules.magic_types.some((type: string) =>
        mention.toLowerCase().includes(type.toLowerCase())
      );

      if (!isDefined && mention.length > 2) {
        issues.push({
          category: 'worldview',
          severity: 'warning',
          title: '未定义的魔法类型',
          description: `在章节中提到了"${mention}"，但在魔法体系设定中未找到定义。`,
          chapterId: chapter.id,
          chapterNumber: chapter.chapterNumber,
          locationText: this.getContextAroundText(chapter.content, mention),
          conflictWith: `魔法体系设定：${magicRules.magic_types.join(', ')}`,
          suggestions: [
            {
              type: 'add_to_setting',
              content: `将"${mention}"添加到魔法体系设定中`
            },
            {
              type: 'modify_text',
              content: `修改为已定义的魔法类型：${magicRules.magic_types[0]}`
            }
          ],
          aiConfidence: 0.7
        });
      }
    }

    return issues;
  }

  /**
   * 检测等级制度一致性
   */
  private async detectPowerLevelInconsistency(
    novelId: string,
    chapters: any[],
    settings: any[]
  ): Promise<DetectionResult[]> {
    const issues: DetectionResult[] = [];

    // 提取等级设定
    const levelSettings = settings.filter(s => 
      s.description?.includes('等级') ||
      s.description?.includes('境界') ||
      s.description?.includes('阶位')
    );

    if (levelSettings.length === 0) {
      return issues;
    }

    // 提取等级列表
    const levels = await this.extractPowerLevels(levelSettings);

    // 检查章节中的等级使用
    for (const chapter of chapters) {
      const levelViolations = await this.checkPowerLevelsInChapter(
        chapter,
        levels
      );
      issues.push(...levelViolations);
    }

    return issues;
  }

  /**
   * AI语义一致性检测
   */
  private async detectSemanticInconsistency(
    novelId: string,
    chapters: any[],
    settings: any[]
  ): Promise<DetectionResult[]> {
    const issues: DetectionResult[] = [];

    // 构建世界观上下文
    const worldviewContext = settings
      .map(s => `${s.category} - ${s.title}: ${s.description}`)
      .join('\n');

    // 批量检测章节（每次处理3-5章）
    const batchSize = 3;
    for (let i = 0; i < chapters.length; i += batchSize) {
      const batch = chapters.slice(i, i + batchSize);
      
      const batchIssues = await this.detectBatchSemanticIssues(
        batch,
        worldviewContext
      );
      
      issues.push(...batchIssues);
    }

    return issues;
  }

  /**
   * 批量检测语义问题
   */
  private async detectBatchSemanticIssues(
    chapters: any[],
    worldviewContext: string
  ): Promise<DetectionResult[]> {
    const chaptersText = chapters
      .map(c => `[第${c.chapterNumber}章 ${c.title}]\n${c.content}`)
      .join('\n\n---\n\n');

    const prompt = `
你是一个专业的小说一致性检查助手。

世界观设定：
${worldviewContext}

章节内容：
${chaptersText}

请检查以下内容是否与世界观设定一致：
1. 地理位置和距离描述
2. 社会制度和规则
3. 技术水平和物品使用
4. 特殊能力的表现

如果发现不一致，请返回JSON格式：
{
  "issues": [
    {
      "chapter_number": 章节号,
      "title": "问题标题",
      "description": "详细描述",
      "severity": "critical/warning/info",
      "location": "问题所在的文本片段",
      "conflict_with": "与哪个设定冲突",
      "suggestions": ["修复建议1", "修复建议2"]
    }
  ]
}

如果没有问题，返回 {"issues": []}
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.configService.get<string>('OPENAI_MODEL_NAME') || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: '你是专业的小说一致性检查助手。' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      });

      const result = JSON.parse(response.choices[0].message.content || '{"issues":[]}');
      
      return result.issues.map((issue: any) => ({
        category: 'worldview',
        severity: issue.severity || 'warning',
        title: issue.title,
        description: issue.description,
        chapterId: chapters.find(c => c.chapterNumber === issue.chapter_number)?.id,
        chapterNumber: issue.chapter_number,
        locationText: issue.location,
        conflictWith: issue.conflict_with,
        suggestions: issue.suggestions?.map((s: string) => ({
          type: 'ai_suggestion',
          content: s
        })),
        aiConfidence: 0.8
      }));
    } catch (error) {
      console.error('AI语义检测失败:', error);
      return [];
    }
  }

  // ========== 辅助方法 ==========

  private async extractMagicMentions(text: string): Promise<string[]> {
    // 简单的关键词提取（实际应该用NLP）
    const magicKeywords = [
      '魔法', '法术', '咒语', '魔力', '元素',
      '火系', '水系', '风系', '土系', '雷系',
      '禁咒', '高阶', '初级', '中级'
    ];

    const mentions: string[] = [];
    for (const keyword of magicKeywords) {
      if (text.includes(keyword)) {
        mentions.push(keyword);
      }
    }

    return [...new Set(mentions)];
  }

  private async extractPowerLevels(settings: any[]): Promise<string[]> {
    // 从设定中提取等级列表
    const levelPattern = /([一二三四五六七八九十百千万]+[阶级层重境界]|[初中高顶巅]级)/g;
    const levels: Set<string> = new Set();

    for (const setting of settings) {
      const matches = setting.description.match(levelPattern);
      if (matches) {
        matches.forEach((m: string) => levels.add(m));
      }
    }

    return Array.from(levels);
  }

  private async checkPowerLevelsInChapter(
    chapter: any,
    definedLevels: string[]
  ): Promise<DetectionResult[]> {
    // 检查章节中使用的等级是否都已定义
    const issues: DetectionResult[] = [];
    
    // 提取章节中的等级描述
    const levelPattern = /([一二三四五六七八九十百千万]+[阶级层重境界]|[初中高顶巅]级)/g;
    const mentionedLevels = chapter.content.match(levelPattern) || [];

    for (const level of mentionedLevels) {
      if (!definedLevels.includes(level)) {
        issues.push({
          category: 'worldview',
          severity: 'warning',
          title: '未定义的等级/境界',
          description: `章节中提到了"${level}"，但在等级设定中未定义。`,
          chapterId: chapter.id,
          chapterNumber: chapter.chapterNumber,
          locationText: this.getContextAroundText(chapter.content, level),
          conflictWith: `已定义等级：${definedLevels.join(', ')}`,
          suggestions: [
            {
              type: 'add_to_setting',
              content: `将"${level}"添加到等级设定中`
            }
          ],
          aiConfidence: 0.6
        });
      }
    }

    return issues;
  }

  private getContextAroundText(fullText: string, searchText: string, contextLength: number = 50): string {
    const index = fullText.indexOf(searchText);
    if (index === -1) return '';

    const start = Math.max(0, index - contextLength);
    const end = Math.min(fullText.length, index + searchText.length + contextLength);
    
    return '...' + fullText.substring(start, end) + '...';
  }
}
```

### 4. Service 实现

#### consistency-check.service.ts

```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { CreateConsistencyCheckDto } from './dto/create-consistency-check.dto';
import { ResolveIssueDto } from './dto/resolve-issue.dto';
import { WorldviewDetector } from './detectors/worldview.detector';
import { TimelineDetector } from './detectors/timeline.detector';

@Injectable()
export class ConsistencyCheckService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly worldviewDetector: WorldviewDetector,
    // 其他检测器...
  ) {}

  /**
   * 创建一致性检测
   */
  async createCheck(
    userId: string,
    novelId: string,
    createDto: CreateConsistencyCheckDto
  ) {
    // 验证小说所有权
    await this.validateNovelOwnership(userId, novelId);

    // 创建检测记录
    const check = await this.prisma.consistencyCheck.create({
      data: {
        novelId,
        userId,
        checkType: createDto.checkType,
        status: 'pending',
        chapterIds: createDto.chapterIds || null,
      },
    });

    // 异步执行检测
    this.executeCheck(check.id, createDto).catch(error => {
      console.error('检测执行失败:', error);
      this.prisma.consistencyCheck.update({
        where: { id: check.id },
        data: { status: 'failed' },
      });
    });

    return check;
  }

  /**
   * 执行检测
   */
  private async executeCheck(
    checkId: string,
    createDto: CreateConsistencyCheckDto
  ) {
    // 更新状态为处理中
    await this.prisma.consistencyCheck.update({
      where: { id: checkId },
      data: { 
        status: 'processing',
        startedAt: new Date()
      },
    });

    const check = await this.prisma.consistencyCheck.findUnique({
      where: { id: checkId },
    });

    if (!check) return;

    // 获取章节数据
    const chapters = await this.getChaptersForCheck(
      check.novelId,
      check.chapterIds as string[] | null
    );

    // 获取世界观设定
    const settings = await this.prisma.worldSetting.findMany({
      where: { novelId: check.novelId },
    });

    // 执行检测
    let allIssues: any[] = [];

    if (createDto.checkType === 'worldview' || createDto.checkType === 'full') {
      const worldviewIssues = await this.worldviewDetector.detect(
        check.novelId,
        chapters,
        settings
      );
      allIssues.push(...worldviewIssues);
    }

    // TODO: 添加其他类型的检测

    // 保存问题到数据库
    if (allIssues.length > 0) {
      await this.prisma.consistencyIssue.createMany({
        data: allIssues.map(issue => ({
          checkId: check.id,
          ...issue,
          suggestions: issue.suggestions || null,
        })),
      });
    }

    // 统计问题数量
    const criticalCount = allIssues.filter(i => i.severity === 'critical').length;
    const warningCount = allIssues.filter(i => i.severity === 'warning').length;

    // 更新检测记录
    await this.prisma.consistencyCheck.update({
      where: { id: checkId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        totalIssues: allIssues.length,
        criticalIssues: criticalCount,
        warningIssues: warningCount,
      },
    });
  }

  /**
   * 获取检测结果
   */
  async getCheckResult(userId: string, checkId: string) {
    const check = await this.prisma.consistencyCheck.findUnique({
      where: { id: checkId },
      include: {
        issues: {
          orderBy: [
            { severity: 'asc' },
            { createdAt: 'desc' }
          ],
        },
      },
    });

    if (!check) {
      throw new NotFoundException('检测记录不存在');
    }

    if (check.userId !== userId) {
      throw new BadRequestException('无权限访问');
    }

    return check;
  }

  /**
   * 获取检测历史
   */
  async getCheckHistory(userId: string, novelId: string) {
    await this.validateNovelOwnership(userId, novelId);

    return this.prisma.consistencyCheck.findMany({
      where: { novelId },
      include: {
        _count: {
          select: { issues: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  /**
   * 解决问题
   */
  async resolveIssue(
    userId: string,
    issueId: string,
    resolveDto: ResolveIssueDto
  ) {
    const issue = await this.prisma.consistencyIssue.findUnique({
      where: { id: issueId },
      include: { check: true },
    });

    if (!issue) {
      throw new NotFoundException('问题不存在');
    }

    if (issue.check.userId !== userId) {
      throw new BadRequestException('无权限操作');
    }

    return this.prisma.consistencyIssue.update({
      where: { id: issueId },
      data: {
        status: resolveDto.status,
        userNote: resolveDto.userNote,
        resolvedAt: new Date(),
      },
    });
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

  private async getChaptersForCheck(
    novelId: string,
    chapterIds: string[] | null
  ) {
    const where: any = { novelId };
    
    if (chapterIds && chapterIds.length > 0) {
      where.id = { in: chapterIds };
    }

    return this.prisma.chapter.findMany({
      where,
      orderBy: { chapterNumber: 'asc' },
      select: {
        id: true,
        chapterNumber: true,
        title: true,
        content: true,
      },
    });
  }
}
```

### 5. Controller 实现 - 见下一个文档...

---

## 🎨 前端实现 - 见下一个文档...

---

## 📋 接口规范检查清单

### ✅ 遵循规范

- [x] Controller 使用 `@Controller()` 不带前缀
- [x] 所有接口添加 `@UseGuards(JwtAuthGuard)`
- [x] 所有接口添加 `@ApiBearerAuth('JWT-auth')`
- [x] DTO 完整验证装饰器
- [x] 完整的 Swagger 文档
- [x] 权限验证
- [x] 错误处理

---

**状态**: 🚀 设计中  
**下一步**: Controller 和前端实现

