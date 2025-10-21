import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { CreateConsistencyCheckDto } from './dto/create-consistency-check.dto';
import { ResolveIssueDto } from './dto/resolve-issue.dto';

interface DetectionResult {
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
export class ConsistencyCheckService {
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
   * 创建一致性检测
   */
  async createCheck(
    userId: string,
    novelId: string,
    createDto: CreateConsistencyCheckDto,
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
      }).catch(err => console.error('更新状态失败:', err));
    });

    return check;
  }

  /**
   * 执行检测（异步）
   */
  private async executeCheck(
    checkId: string,
    createDto: CreateConsistencyCheckDto,
  ) {
    try {
      // 更新状态为处理中
      await this.prisma.consistencyCheck.update({
        where: { id: checkId },
        data: { 
          status: 'processing',
          startedAt: new Date(),
        },
      });

      const check = await this.prisma.consistencyCheck.findUnique({
        where: { id: checkId },
      });

      if (!check) return;

      // 获取章节数据
      const chapters = await this.getChaptersForCheck(
        check.novelId,
        check.chapterIds as string[] | null,
      );

      // 获取世界观设定
      const settings = await this.getWorldSettings(check.novelId);

      // 执行检测
      let allIssues: DetectionResult[] = [];

      if (createDto.checkType === 'worldview' || createDto.checkType === 'full') {
        const worldviewIssues = await this.detectWorldviewIssues(
          check.novelId,
          chapters,
          settings,
          createDto.aiEnhanced,
        );
        allIssues.push(...worldviewIssues);
      }

      if (createDto.checkType === 'timeline' || createDto.checkType === 'full') {
        const timelineIssues = await this.detectTimelineIssues(
          check.novelId,
          chapters,
        );
        allIssues.push(...timelineIssues);
      }

      // 保存问题到数据库
      if (allIssues.length > 0) {
        await this.prisma.consistencyIssue.createMany({
          data: allIssues.map(issue => ({
            checkId: check.id,
            category: issue.category,
            severity: issue.severity,
            title: issue.title,
            description: issue.description,
            chapterId: issue.chapterId,
            chapterNumber: issue.chapterNumber,
            locationText: issue.locationText,
            conflictWith: issue.conflictWith,
            suggestions: issue.suggestions || null,
            aiConfidence: issue.aiConfidence,
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
    } catch (error) {
      console.error('检测过程出错:', error);
      await this.prisma.consistencyCheck.update({
        where: { id: checkId },
        data: { status: 'failed' },
      });
    }
  }

  /**
   * 检测世界观问题
   */
  private async detectWorldviewIssues(
    novelId: string,
    chapters: any[],
    settings: any[],
    aiEnhanced: boolean,
  ): Promise<DetectionResult[]> {
    const issues: DetectionResult[] = [];

    // 1. 规则检测：魔法体系
    const magicSettings = settings.filter(s => 
      s.category === 'magic' || 
      s.title?.includes('魔法') ||
      s.title?.includes('法术')
    );

    if (magicSettings.length > 0) {
      for (const chapter of chapters) {
        const magicIssues = await this.checkMagicSystem(
          chapter,
          magicSettings,
        );
        issues.push(...magicIssues);
      }
    }

    // 2. 规则检测：等级制度
    const levelSettings = settings.filter(s =>
      s.description?.includes('等级') ||
      s.description?.includes('境界') ||
      s.description?.includes('阶位')
    );

    if (levelSettings.length > 0) {
      for (const chapter of chapters) {
        const levelIssues = await this.checkPowerLevels(
          chapter,
          levelSettings,
        );
        issues.push(...levelIssues);
      }
    }

    // 3. AI增强检测
    if (aiEnhanced && settings.length > 0) {
      const aiIssues = await this.detectSemanticIssues(
        chapters,
        settings,
      );
      issues.push(...aiIssues);
    }

    return issues;
  }

  /**
   * 检查魔法体系
   */
  private async checkMagicSystem(
    chapter: any,
    magicSettings: any[],
  ): Promise<DetectionResult[]> {
    const issues: DetectionResult[] = [];

    // 简单的关键词检测
    const magicKeywords = ['魔法', '法术', '咒语', '魔力', '元素'];
    const definedTypes = magicSettings
      .flatMap(s => s.description.match(/([火水风土雷冰光暗]+系|[初中高顶巅]+级)/g) || []);

    for (const keyword of magicKeywords) {
      if (chapter.content.includes(keyword)) {
        // 提取使用的魔法类型
        const pattern = new RegExp(`(${keyword}[^。，！？]{0,20})`, 'g');
        const matches = chapter.content.match(pattern) || [];

        for (const match of matches) {
          // 检查是否在定义范围内
          const isDefined = definedTypes.some(type => match.includes(type));
          
          if (!isDefined && matches.length > 0) {
            issues.push({
              category: 'worldview',
              severity: 'warning',
              title: '可能存在未定义的魔法描述',
              description: `在第${chapter.chapterNumber}章中提到了"${match}"，请确认是否符合魔法体系设定。`,
              chapterId: chapter.id,
              chapterNumber: chapter.chapterNumber,
              locationText: this.getContext(chapter.content, match),
              conflictWith: `已定义魔法类型：${definedTypes.slice(0, 5).join(', ')}`,
              suggestions: [
                {
                  type: 'verify',
                  content: '请检查魔法描述是否符合设定'
                },
                {
                  type: 'add_setting',
                  content: '如果是新魔法类型，请添加到世界观设定中'
                }
              ],
              aiConfidence: 0.6,
            });
            break; // 每章只报告一次
          }
        }
      }
    }

    return issues;
  }

  /**
   * 检查等级制度
   */
  private async checkPowerLevels(
    chapter: any,
    levelSettings: any[],
  ): Promise<DetectionResult[]> {
    const issues: DetectionResult[] = [];

    // 提取已定义的等级
    const levelPattern = /([一二三四五六七八九十百千万]+[阶级层重境界]|[初中高顶巅]+级)/g;
    const definedLevels = new Set<string>();
    
    levelSettings.forEach(s => {
      const matches = s.description.match(levelPattern) || [];
      matches.forEach(m => definedLevels.add(m));
    });

    if (definedLevels.size === 0) {
      return issues;
    }

    // 检查章节中的等级使用
    const mentionedLevels = chapter.content.match(levelPattern) || [];
    
    for (const level of mentionedLevels) {
      if (!definedLevels.has(level)) {
        issues.push({
          category: 'worldview',
          severity: 'warning',
          title: '未定义的等级/境界',
          description: `第${chapter.chapterNumber}章提到了"${level}"，但在等级设定中未定义。`,
          chapterId: chapter.id,
          chapterNumber: chapter.chapterNumber,
          locationText: this.getContext(chapter.content, level),
          conflictWith: `已定义等级：${Array.from(definedLevels).join(', ')}`,
          suggestions: [
            {
              type: 'add_to_setting',
              content: `将"${level}"添加到等级设定中`
            },
            {
              type: 'modify_text',
              content: `修改为已定义的等级`
            }
          ],
          aiConfidence: 0.7,
        });
        break; // 每章只报告一次
      }
    }

    return issues;
  }

  /**
   * AI语义一致性检测
   */
  private async detectSemanticIssues(
    chapters: any[],
    settings: any[],
  ): Promise<DetectionResult[]> {
    const issues: DetectionResult[] = [];

    // 构建世界观上下文
    const worldviewContext = settings
      .map(s => `${s.category} - ${s.title}: ${s.description}`)
      .join('\n');

    // 批量检测（每次3章）
    const batchSize = 3;
    for (let i = 0; i < chapters.length; i += batchSize) {
      const batch = chapters.slice(i, i + batchSize);
      
      try {
        const batchIssues = await this.aiDetectBatch(batch, worldviewContext);
        issues.push(...batchIssues);
      } catch (error) {
        console.error('AI检测批次失败:', error);
      }
    }

    return issues;
  }

  /**
   * AI批量检测
   */
  private async aiDetectBatch(
    chapters: any[],
    worldviewContext: string,
  ): Promise<DetectionResult[]> {
    const chaptersText = chapters
      .map(c => `[第${c.chapterNumber}章 ${c.title}]\n${c.content.substring(0, 2000)}...`)
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
      "location": "问题所在的文本片段(30字以内)",
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
          { role: 'system', content: '你是专业的小说一致性检查助手，返回JSON格式结果。' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      });

      const result = JSON.parse(response.choices[0].message.content || '{"issues":[]}');
      
      return result.issues.map((issue: any) => {
        const chapter = chapters.find(c => c.chapterNumber === issue.chapter_number);
        return {
          category: 'worldview',
          severity: issue.severity || 'warning',
          title: issue.title,
          description: issue.description,
          chapterId: chapter?.id,
          chapterNumber: issue.chapter_number,
          locationText: issue.location,
          conflictWith: issue.conflict_with,
          suggestions: issue.suggestions?.map((s: string) => ({
            type: 'ai_suggestion',
            content: s
          })),
          aiConfidence: 0.8,
        };
      });
    } catch (error) {
      console.error('AI语义检测失败:', error);
      return [];
    }
  }

  /**
   * 检测时间线问题
   */
  private async detectTimelineIssues(
    novelId: string,
    chapters: any[],
  ): Promise<DetectionResult[]> {
    const issues: DetectionResult[] = [];

    // 提取时间表达式
    const timePattern = /([一二三四五六七八九十百千万]+[天月年]|几天|数月|多年)[后前]/g;

    for (let i = 1; i < chapters.length; i++) {
      const prevChapter = chapters[i - 1];
      const currChapter = chapters[i];

      const prevTimes = prevChapter.content.match(timePattern) || [];
      const currTimes = currChapter.content.match(timePattern) || [];

      // 简单的时间连续性检查
      if (prevTimes.length > 0 || currTimes.length > 0) {
        // 这里可以添加更复杂的时间逻辑检查
        // 暂时只做简单提示
        if (prevTimes.join('').includes('数年后') && currTimes.join('').includes('昨天')) {
          issues.push({
            category: 'timeline',
            severity: 'warning',
            title: '时间线可能存在问题',
            description: `第${prevChapter.chapterNumber}章提到"数年后"，但第${currChapter.chapterNumber}章又提到"昨天"，请确认时间连续性。`,
            chapterId: currChapter.id,
            chapterNumber: currChapter.chapterNumber,
            locationText: `前章：${prevTimes.slice(0, 2).join(', ')} | 本章：${currTimes.slice(0, 2).join(', ')}`,
            suggestions: [
              {
                type: 'verify',
                content: '请确认章节之间的时间跨度'
              }
            ],
            aiConfidence: 0.5,
          });
        }
      }
    }

    return issues;
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
    resolveDto: ResolveIssueDto,
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
    chapterIds: string[] | null,
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

  private async getWorldSettings(novelId: string) {
    return this.prisma.worldSetting.findMany({
      where: { novelId },
      select: {
        id: true,
        category: true,
        title: true,
        description: true,
      },
    });
  }

  private getContext(fullText: string, searchText: string, contextLength: number = 30): string {
    const index = fullText.indexOf(searchText);
    if (index === -1) return searchText;

    const start = Math.max(0, index - contextLength);
    const end = Math.min(fullText.length, index + searchText.length + contextLength);
    
    return '...' + fullText.substring(start, end) + '...';
  }
}

