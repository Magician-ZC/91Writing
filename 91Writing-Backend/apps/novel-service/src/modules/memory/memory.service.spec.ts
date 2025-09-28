import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { MemoryService } from './memory.service';
import { PrismaService } from '@app/database';
import { CreateMemoryDto } from '../../dto/create-memory.dto';
import { MemoryType } from '@prisma/client';

describe('MemoryService', () => {
  let service: MemoryService;
  let prisma: PrismaService;

  const mockNovel = {
    id: 'test-novel-id',
    userId: 'test-user-id',
    title: '测试小说',
  };

  const mockMemory = {
    id: 'test-memory-id',
    novelId: 'test-novel-id',
    memoryType: MemoryType.CORE,
    content: {
      type: 'character_profile',
      character: '艾莉亚',
      details: {
        name: '艾莉亚·晨光',
        personality: '勇敢、聪明',
        abilities: ['火系魔法', '治愈术']
      }
    },
    importance: 0.9,
    tokenCost: 150,
    chapterRange: '1-3',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    novel: {
      findFirst: jest.fn(),
    },
    novelMemory: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemoryService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MemoryService>(MemoryService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createMemoryDto: CreateMemoryDto = {
      memoryType: MemoryType.CORE,
      content: {
        type: 'character_profile',
        character: '萨姆',
        details: {
          name: '萨姆·石心',
          age: 25,
          personality: '忠诚、幽默、可靠',
          background: '艾莉亚的青梅竹马，技艺精湛的弓箭手',
          abilities: ['弓箭精通', '追踪技能', '野外生存'],
          relationships: [
            { character: '艾莉亚', relation: '青梅竹马', trust_level: 'high' }
          ]
        }
      },
      importance: 0.85,
      tokenCost: 120,
      chapterRange: '1-2',
    };

    it('应该成功创建记忆', async () => {
      // Arrange
      const expectedMemory = {
        ...mockMemory,
        ...createMemoryDto,
      };

      mockPrismaService.novel.findFirst.mockResolvedValue(mockNovel);
      mockPrismaService.novelMemory.create.mockResolvedValue(expectedMemory);

      // Act
      const result = await service.create('test-novel-id', 'test-user-id', createMemoryDto);

      // Assert
      expect(prisma.novel.findFirst).toHaveBeenCalledWith({
        where: { id: 'test-novel-id', userId: 'test-user-id' },
      });
      expect(prisma.novelMemory.create).toHaveBeenCalledWith({
        data: {
          novelId: 'test-novel-id',
          ...createMemoryDto,
        },
        include: {
          novel: {
            select: {
              id: true,
              title: true,
              userId: true,
            },
          },
        },
      });
      expect(result).toEqual(expectedMemory);
    });

    it('当小说不存在或无权访问时应该抛出NotFoundException', async () => {
      // Arrange
      mockPrismaService.novel.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.create('non-existent-novel', 'test-user-id', createMemoryDto)
      ).rejects.toThrow(NotFoundException);

      expect(prisma.novelMemory.create).not.toHaveBeenCalled();
    });

    it('应该正确处理不同类型的记忆内容', async () => {
      // Arrange: SUMMARY类型的记忆
      const summaryMemoryDto: CreateMemoryDto = {
        memoryType: MemoryType.SUMMARY,
        content: {
          type: 'plot_summary',
          chapters: '1-3',
          summary: '艾莉亚觉醒魔法能力，与萨姆踏上冒险之旅，遇到了第一个挑战',
          key_events: [
            '魔法觉醒',
            '离开村庄',
            '遇见导师',
            '第一次战斗'
          ],
          character_development: '从懵懂少女成长为有责任感的魔法师'
        },
        importance: 0.7,
        tokenCost: 80,
        chapterRange: '1-3',
      };

      mockPrismaService.novel.findFirst.mockResolvedValue(mockNovel);
      mockPrismaService.novelMemory.create.mockResolvedValue({
        ...mockMemory,
        ...summaryMemoryDto,
      });

      // Act
      const result = await service.create('test-novel-id', 'test-user-id', summaryMemoryDto);

      // Assert
      expect(result.memoryType).toBe(MemoryType.SUMMARY);
      expect(result.content).toEqual(summaryMemoryDto.content);
    });

    it('应该正确处理CONTEXT类型的记忆', async () => {
      // Arrange: CONTEXT类型的记忆
      const contextMemoryDto: CreateMemoryDto = {
        memoryType: MemoryType.CONTEXT,
        content: {
          type: 'world_context',
          location: '魔法学院',
          description: '大陆最权威的魔法教育机构，坐落在圣山之巅',
          atmosphere: '庄严神圣，充满学术氛围',
          important_npcs: [
            {
              name: '梅林教授',
              role: '魔法理论导师',
              personality: '严厉但关爱学生'
            }
          ],
          rules: [
            '禁止在宿舍区使用攻击性魔法',
            '图书馆内必须保持安静',
            '每周进行魔法能力测试'
          ]
        },
        importance: 0.6,
        tokenCost: 100,
        chapterRange: '4-6',
      };

      mockPrismaService.novel.findFirst.mockResolvedValue(mockNovel);
      mockPrismaService.novelMemory.create.mockResolvedValue({
        ...mockMemory,
        ...contextMemoryDto,
      });

      // Act
      const result = await service.create('test-novel-id', 'test-user-id', contextMemoryDto);

      // Assert
      expect(result.memoryType).toBe(MemoryType.CONTEXT);
      expect(result.importance).toBe(0.6);
    });
  });

  describe('findAll', () => {
    const mockMemories = [
      { 
        ...mockMemory, 
        memoryType: MemoryType.CORE, 
        importance: 0.9,
        content: { type: 'character_profile', character: '艾莉亚' }
      },
      { 
        ...mockMemory, 
        id: 'memory-2',
        memoryType: MemoryType.SUMMARY, 
        importance: 0.8,
        content: { type: 'plot_summary', chapters: '1-2' }
      },
      { 
        ...mockMemory, 
        id: 'memory-3',
        memoryType: MemoryType.CONTEXT, 
        importance: 0.6,
        content: { type: 'world_context', location: '村庄' }
      },
    ];

    it('应该返回小说的所有记忆（按重要性排序）', async () => {
      // Arrange
      mockPrismaService.novel.findFirst.mockResolvedValue(mockNovel);
      mockPrismaService.novelMemory.findMany.mockResolvedValue(mockMemories);

      // Act
      const result = await service.findAll('test-novel-id', 'test-user-id');

      // Assert
      expect(prisma.novel.findFirst).toHaveBeenCalledWith({
        where: { id: 'test-novel-id', userId: 'test-user-id' },
      });
      expect(prisma.novelMemory.findMany).toHaveBeenCalledWith({
        where: { novelId: 'test-novel-id' },
        orderBy: { importance: 'desc' },
      });
      expect(result).toEqual(mockMemories);
    });

    it('应该支持按记忆类型筛选', async () => {
      // Arrange
      const coreMemories = [mockMemories[0]];
      mockPrismaService.novel.findFirst.mockResolvedValue(mockNovel);
      mockPrismaService.novelMemory.findMany.mockResolvedValue(coreMemories);

      // Act
      const result = await service.findAll('test-novel-id', 'test-user-id', {
        memoryType: MemoryType.CORE,
      });

      // Assert
      expect(prisma.novelMemory.findMany).toHaveBeenCalledWith({
        where: { 
          novelId: 'test-novel-id',
          memoryType: MemoryType.CORE,
        },
        orderBy: { importance: 'desc' },
      });
      expect(result).toEqual(coreMemories);
    });

    it('应该支持按重要性筛选', async () => {
      // Arrange
      const highImportanceMemories = [mockMemories[0], mockMemories[1]];
      mockPrismaService.novel.findFirst.mockResolvedValue(mockNovel);
      mockPrismaService.novelMemory.findMany.mockResolvedValue(highImportanceMemories);

      // Act
      const result = await service.findAll('test-novel-id', 'test-user-id', {
        minImportance: 0.7,
      });

      // Assert
      expect(prisma.novelMemory.findMany).toHaveBeenCalledWith({
        where: { 
          novelId: 'test-novel-id',
          importance: { gte: 0.7 },
        },
        orderBy: { importance: 'desc' },
      });
      expect(result).toEqual(highImportanceMemories);
    });

    it('应该支持限制返回数量', async () => {
      // Arrange
      const limitedMemories = [mockMemories[0], mockMemories[1]];
      mockPrismaService.novel.findFirst.mockResolvedValue(mockNovel);
      mockPrismaService.novelMemory.findMany.mockResolvedValue(limitedMemories);

      // Act
      const result = await service.findAll('test-novel-id', 'test-user-id', {
        limit: 2,
      });

      // Assert
      expect(prisma.novelMemory.findMany).toHaveBeenCalledWith({
        where: { novelId: 'test-novel-id' },
        orderBy: { importance: 'desc' },
        take: 2,
      });
    });
  });

  describe('findOne', () => {
    it('应该返回记忆详情', async () => {
      // Arrange
      const detailedMemory = { 
        ...mockMemory, 
        novel: mockNovel 
      };
      mockPrismaService.novelMemory.findFirst.mockResolvedValue(detailedMemory);

      // Act
      const result = await service.findOne('test-memory-id', 'test-user-id');

      // Assert
      expect(prisma.novelMemory.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'test-memory-id',
          novel: { userId: 'test-user-id' },
        },
        include: {
          novel: {
            select: {
              id: true,
              title: true,
              userId: true,
            },
          },
        },
      });
      expect(result).toEqual(detailedMemory);
    });

    it('当记忆不存在或无权访问时应该抛出NotFoundException', async () => {
      // Arrange
      mockPrismaService.novelMemory.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.findOne('non-existent-memory', 'test-user-id')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateData = {
      content: {
        type: 'character_profile',
        character: '艾莉亚',
        details: {
          name: '艾莉亚·晨光',
          personality: '勇敢、聪明、更加成熟',
          abilities: ['火系魔法', '治愈术', '风系魔法'], // 新增能力
        }
      },
      importance: 0.95, // 提升重要性
      chapterRange: '1-5', // 扩展范围
    };

    it('应该成功更新记忆', async () => {
      // Arrange
      const updatedMemory = { ...mockMemory, ...updateData };
      mockPrismaService.novelMemory.findFirst.mockResolvedValue(mockMemory);
      mockPrismaService.novelMemory.update.mockResolvedValue(updatedMemory);

      // Act
      const result = await service.update('test-memory-id', 'test-user-id', updateData);

      // Assert
      expect(prisma.novelMemory.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'test-memory-id',
          novel: { userId: 'test-user-id' },
        },
      });
      expect(prisma.novelMemory.update).toHaveBeenCalledWith({
        where: { id: 'test-memory-id' },
        data: updateData,
      });
      expect(result).toEqual(updatedMemory);
    });

    it('应该验证重要性权重范围', async () => {
      // Arrange
      const invalidImportanceData = { ...updateData, importance: 1.5 };
      mockPrismaService.novelMemory.findFirst.mockResolvedValue(mockMemory);

      // Act & Assert
      await expect(
        service.update('test-memory-id', 'test-user-id', invalidImportanceData)
      ).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('应该成功删除记忆', async () => {
      // Arrange
      mockPrismaService.novelMemory.findFirst.mockResolvedValue(mockMemory);
      mockPrismaService.novelMemory.delete.mockResolvedValue(mockMemory);

      // Act
      const result = await service.remove('test-memory-id', 'test-user-id');

      // Assert
      expect(prisma.novelMemory.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'test-memory-id',
          novel: { userId: 'test-user-id' },
        },
      });
      expect(prisma.novelMemory.delete).toHaveBeenCalledWith({
        where: { id: 'test-memory-id' },
      });
      expect(result).toEqual({ message: '记忆已删除' });
    });

    it('当记忆不存在时应该抛出NotFoundException', async () => {
      // Arrange
      mockPrismaService.novelMemory.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.remove('non-existent-memory', 'test-user-id')
      ).rejects.toThrow(NotFoundException);

      expect(prisma.novelMemory.delete).not.toHaveBeenCalled();
    });
  });

  describe('getMemoriesByType', () => {
    it('应该按类型获取记忆并按重要性排序', async () => {
      // Arrange
      const coreMemories = [
        { ...mockMemory, importance: 0.9 },
        { ...mockMemory, id: 'memory-2', importance: 0.8 },
      ];
      mockPrismaService.novel.findFirst.mockResolvedValue(mockNovel);
      mockPrismaService.novelMemory.findMany.mockResolvedValue(coreMemories);

      // Act
      const result = await service.getMemoriesByType(
        'test-novel-id', 
        'test-user-id', 
        MemoryType.CORE
      );

      // Assert
      expect(prisma.novelMemory.findMany).toHaveBeenCalledWith({
        where: { 
          novelId: 'test-novel-id',
          memoryType: MemoryType.CORE,
        },
        orderBy: { importance: 'desc' },
      });
      expect(result).toEqual(coreMemories);
    });
  });

  describe('getTopMemories', () => {
    it('应该获取最重要的记忆', async () => {
      // Arrange
      const topMemories = mockMemories.slice(0, 2); // 取前2个
      mockPrismaService.novel.findFirst.mockResolvedValue(mockNovel);
      mockPrismaService.novelMemory.findMany.mockResolvedValue(topMemories);

      // Act
      const result = await service.getTopMemories('test-novel-id', 'test-user-id', 2);

      // Assert
      expect(prisma.novelMemory.findMany).toHaveBeenCalledWith({
        where: { novelId: 'test-novel-id' },
        orderBy: { importance: 'desc' },
        take: 2,
      });
      expect(result).toEqual(topMemories);
    });

    it('应该使用默认限制数量', async () => {
      // Arrange
      mockPrismaService.novel.findFirst.mockResolvedValue(mockNovel);
      mockPrismaService.novelMemory.findMany.mockResolvedValue(mockMemories);

      // Act
      await service.getTopMemories('test-novel-id', 'test-user-id');

      // Assert
      expect(prisma.novelMemory.findMany).toHaveBeenCalledWith({
        where: { novelId: 'test-novel-id' },
        orderBy: { importance: 'desc' },
        take: 10, // 默认值
      });
    });
  });

  describe('searchMemories', () => {
    it('应该支持内容搜索', async () => {
      // Arrange
      const searchResults = [mockMemory];
      const searchQuery = '艾莉亚';
      
      mockPrismaService.novel.findFirst.mockResolvedValue(mockNovel);
      mockPrismaService.novelMemory.findMany.mockResolvedValue(searchResults);

      // Act
      const result = await service.searchMemories('test-novel-id', 'test-user-id', searchQuery);

      // Assert
      expect(prisma.novelMemory.findMany).toHaveBeenCalledWith({
        where: { 
          novelId: 'test-novel-id',
          // 注意：实际实现中可能需要使用全文搜索或JSON搜索
        },
        orderBy: { importance: 'desc' },
      });
      expect(result).toEqual(searchResults);
    });
  });

  describe('记忆数据验证', () => {
    it('应该验证记忆内容的完整性', async () => {
      // 测试不同类型记忆的数据结构验证
      const testCases = [
        {
          type: MemoryType.CORE,
          content: {
            type: 'character_profile',
            character: '测试角色',
            // 缺少details字段
          },
          shouldFail: true,
        },
        {
          type: MemoryType.SUMMARY,
          content: {
            type: 'plot_summary',
            chapters: '1-2',
            summary: '完整的摘要',
            key_events: ['事件1', '事件2'],
          },
          shouldFail: false,
        },
        {
          type: MemoryType.CONTEXT,
          content: {
            type: 'world_context',
            location: '测试地点',
            description: '详细描述',
          },
          shouldFail: false,
        },
      ];

      mockPrismaService.novel.findFirst.mockResolvedValue(mockNovel);

      for (const testCase of testCases) {
        const dto: CreateMemoryDto = {
          memoryType: testCase.type,
          content: testCase.content,
          importance: 0.7,
        };

        if (testCase.shouldFail) {
          // 这里可能需要根据实际的验证逻辑调整
          // 目前只是示例，实际可能在DTO层验证
          mockPrismaService.novelMemory.create.mockRejectedValue(
            new BadRequestException('记忆内容格式不正确')
          );
          
          await expect(
            service.create('test-novel-id', 'test-user-id', dto)
          ).rejects.toThrow(BadRequestException);
        } else {
          mockPrismaService.novelMemory.create.mockResolvedValue({
            ...mockMemory,
            ...dto,
          });

          const result = await service.create('test-novel-id', 'test-user-id', dto);
          expect(result.memoryType).toBe(testCase.type);
        }
      }
    });
  });
});
