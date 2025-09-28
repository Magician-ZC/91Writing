import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ChapterService } from './chapter.service';
import { PrismaService } from '@app/database';
import { CreateChapterDto } from '../../dto/create-chapter.dto';
import { ChapterStatus } from '@prisma/client';

describe('ChapterService', () => {
  let service: ChapterService;
  let prisma: PrismaService;

  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    username: 'testuser',
  };

  const mockNovel = {
    id: 'test-novel-id',
    userId: 'test-user-id',
    title: '测试小说',
    chapterCount: 0,
    wordCount: 0,
  };

  const mockChapter = {
    id: 'test-chapter-id',
    novelId: 'test-novel-id',
    title: '第一章：开始',
    content: '这是第一章的内容...',
    wordCount: 50,
    chapterNumber: 1,
    status: ChapterStatus.DRAFT,
    createdAt: new Date(),
    updatedAt: new Date(),
    novel: mockNovel,
  };

  const mockPrismaService = {
    novel: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    chapter: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChapterService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ChapterService>(ChapterService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createChapterDto: CreateChapterDto = {
      title: '第二章：冒险开始',
      content: '艾莉亚踏出了村庄的边界，开始了她的冒险之旅...',
      chapterNumber: 2,
      status: ChapterStatus.DRAFT,
    };

    it('应该成功创建章节', async () => {
      // Arrange
      const expectedChapter = {
        ...mockChapter,
        ...createChapterDto,
        wordCount: 28, // 自动计算的字数
      };

      mockPrismaService.novel.findFirst.mockResolvedValue(mockNovel);
      mockPrismaService.chapter.create.mockResolvedValue(expectedChapter);

      // Act
      const result = await service.create('test-novel-id', 'test-user-id', createChapterDto);

      // Assert
      expect(prisma.novel.findFirst).toHaveBeenCalledWith({
        where: { id: 'test-novel-id', userId: 'test-user-id' },
      });
      expect(prisma.chapter.create).toHaveBeenCalledWith({
        data: {
          novelId: 'test-novel-id',
          ...createChapterDto,
          wordCount: expect.any(Number),
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
      expect(result).toEqual(expectedChapter);
    });

    it('当小说不存在或无权访问时应该抛出NotFoundException', async () => {
      // Arrange
      mockPrismaService.novel.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.create('non-existent-novel', 'test-user-id', createChapterDto)
      ).rejects.toThrow(NotFoundException);

      expect(prisma.chapter.create).not.toHaveBeenCalled();
    });

    it('应该自动计算字数（中英文混合）', async () => {
      // Arrange
      const mixedContentDto = {
        ...createChapterDto,
        content: 'Hello world, 这是中文内容！123 numbers.',
      };
      const expectedWordCount = 15; // 预期的字数统计

      mockPrismaService.novel.findFirst.mockResolvedValue(mockNovel);
      mockPrismaService.chapter.create.mockImplementation((args) => {
        expect(args.data.wordCount).toBeGreaterThan(10);
        return Promise.resolve({ ...mockChapter, wordCount: args.data.wordCount });
      });

      // Act
      await service.create('test-novel-id', 'test-user-id', mixedContentDto);

      // Assert
      expect(prisma.chapter.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            wordCount: expect.any(Number),
          }),
        })
      );
    });

    it('当章节序号重复时应该抛出错误', async () => {
      // Arrange
      mockPrismaService.novel.findFirst.mockResolvedValue(mockNovel);
      mockPrismaService.chapter.create.mockRejectedValue({
        code: 'P2002', // Prisma unique constraint error
        meta: { target: ['novelId', 'chapterNumber'] }
      });

      // Act & Assert
      await expect(
        service.create('test-novel-id', 'test-user-id', createChapterDto)
      ).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    const mockChapters = [
      { ...mockChapter, chapterNumber: 1 },
      { ...mockChapter, id: 'chapter-2', chapterNumber: 2, title: '第二章' },
      { ...mockChapter, id: 'chapter-3', chapterNumber: 3, title: '第三章' },
    ];

    it('应该返回小说的所有章节（按序号排序）', async () => {
      // Arrange
      mockPrismaService.novel.findFirst.mockResolvedValue(mockNovel);
      mockPrismaService.chapter.findMany.mockResolvedValue(mockChapters);

      // Act
      const result = await service.findAll('test-novel-id', 'test-user-id');

      // Assert
      expect(prisma.novel.findFirst).toHaveBeenCalledWith({
        where: { id: 'test-novel-id', userId: 'test-user-id' },
      });
      expect(prisma.chapter.findMany).toHaveBeenCalledWith({
        where: { novelId: 'test-novel-id' },
        orderBy: { chapterNumber: 'asc' },
        select: {
          id: true,
          title: true,
          chapterNumber: true,
          wordCount: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(mockChapters);
    });

    it('当小说不存在时应该抛出NotFoundException', async () => {
      // Arrange
      mockPrismaService.novel.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.findAll('non-existent-novel', 'test-user-id')
      ).rejects.toThrow(NotFoundException);

      expect(prisma.chapter.findMany).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('应该返回章节详情（包含小说信息）', async () => {
      // Arrange
      const detailedChapter = { ...mockChapter, novel: mockNovel };
      mockPrismaService.chapter.findFirst.mockResolvedValue(detailedChapter);

      // Act
      const result = await service.findOne('test-chapter-id', 'test-user-id');

      // Assert
      expect(prisma.chapter.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'test-chapter-id',
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
      expect(result).toEqual(detailedChapter);
    });

    it('当章节不存在或无权访问时应该抛出NotFoundException', async () => {
      // Arrange
      mockPrismaService.chapter.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.findOne('non-existent-chapter', 'test-user-id')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getContent', () => {
    it('应该返回章节内容', async () => {
      // Arrange
      const chapterWithContent = {
        id: 'test-chapter-id',
        content: '这是完整的章节内容...',
        title: '第一章',
        wordCount: 20,
      };
      mockPrismaService.chapter.findFirst.mockResolvedValue(chapterWithContent);

      // Act
      const result = await service.getContent('test-chapter-id', 'test-user-id');

      // Assert
      expect(prisma.chapter.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'test-chapter-id',
          novel: { userId: 'test-user-id' },
        },
        select: {
          id: true,
          title: true,
          content: true,
          wordCount: true,
        },
      });
      expect(result).toEqual(chapterWithContent);
    });
  });

  describe('update', () => {
    const updateData = {
      title: '第一章：新的开始',
      status: ChapterStatus.PUBLISHED,
    };

    it('应该成功更新章节', async () => {
      // Arrange
      const updatedChapter = { ...mockChapter, ...updateData };
      mockPrismaService.chapter.findFirst.mockResolvedValue(mockChapter);
      mockPrismaService.chapter.update.mockResolvedValue(updatedChapter);

      // Act
      const result = await service.update('test-chapter-id', 'test-user-id', updateData);

      // Assert
      expect(prisma.chapter.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'test-chapter-id',
          novel: { userId: 'test-user-id' },
        },
      });
      expect(prisma.chapter.update).toHaveBeenCalledWith({
        where: { id: 'test-chapter-id' },
        data: updateData,
      });
      expect(result).toEqual(updatedChapter);
    });

    it('当章节不存在时应该抛出NotFoundException', async () => {
      // Arrange
      mockPrismaService.chapter.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.update('non-existent-chapter', 'test-user-id', updateData)
      ).rejects.toThrow(NotFoundException);

      expect(prisma.chapter.update).not.toHaveBeenCalled();
    });
  });

  describe('updateContent', () => {
    const newContent = '这是更新后的章节内容，包含更多的情节发展...';

    it('应该更新内容并重新计算字数', async () => {
      // Arrange
      const updatedChapter = {
        ...mockChapter,
        content: newContent,
        wordCount: 28, // 重新计算的字数
      };

      mockPrismaService.chapter.findFirst.mockResolvedValue(mockChapter);
      mockPrismaService.chapter.update.mockResolvedValue(updatedChapter);

      // Act
      const result = await service.updateContent('test-chapter-id', 'test-user-id', newContent);

      // Assert
      expect(prisma.chapter.update).toHaveBeenCalledWith({
        where: { id: 'test-chapter-id' },
        data: {
          content: newContent,
          wordCount: expect.any(Number),
        },
        select: {
          id: true,
          title: true,
          content: true,
          wordCount: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(updatedChapter);
    });

    it('应该正确计算空内容的字数', async () => {
      // Arrange
      const emptyContent = '';
      mockPrismaService.chapter.findFirst.mockResolvedValue(mockChapter);
      mockPrismaService.chapter.update.mockImplementation((args) => {
        expect(args.data.wordCount).toBe(0);
        return Promise.resolve({ ...mockChapter, content: '', wordCount: 0 });
      });

      // Act
      await service.updateContent('test-chapter-id', 'test-user-id', emptyContent);

      // Assert
      expect(prisma.chapter.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            wordCount: 0,
          }),
        })
      );
    });
  });

  describe('remove', () => {
    it('应该成功删除章节', async () => {
      // Arrange
      mockPrismaService.chapter.findFirst.mockResolvedValue(mockChapter);
      mockPrismaService.chapter.delete.mockResolvedValue(mockChapter);

      // Act
      const result = await service.remove('test-chapter-id', 'test-user-id');

      // Assert
      expect(prisma.chapter.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'test-chapter-id',
          novel: { userId: 'test-user-id' },
        },
      });
      expect(prisma.chapter.delete).toHaveBeenCalledWith({
        where: { id: 'test-chapter-id' },
      });
      expect(result).toEqual({ message: '章节已删除' });
    });
  });

  describe('updateStatus', () => {
    const chapterIds = ['chapter-1', 'chapter-2'];
    const newStatus = ChapterStatus.PUBLISHED;

    it('应该批量更新章节状态', async () => {
      // Arrange
      const updatedChapters = [
        { ...mockChapter, id: 'chapter-1', status: newStatus },
        { ...mockChapter, id: 'chapter-2', status: newStatus },
      ];

      mockPrismaService.novel.findFirst.mockResolvedValue(mockNovel);
      mockPrismaService.chapter.updateMany.mockResolvedValue({ count: 2 });
      mockPrismaService.chapter.findMany.mockResolvedValue(updatedChapters);

      // Act
      const result = await service.updateStatus(
        'test-novel-id',
        'test-user-id',
        chapterIds,
        newStatus
      );

      // Assert
      expect(prisma.chapter.updateMany).toHaveBeenCalledWith({
        where: {
          id: { in: chapterIds },
          novelId: 'test-novel-id',
        },
        data: { status: newStatus },
      });
      expect(result).toEqual(updatedChapters);
    });

    it('当小说不存在时应该抛出NotFoundException', async () => {
      // Arrange
      mockPrismaService.novel.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateStatus('non-existent-novel', 'test-user-id', chapterIds, newStatus)
      ).rejects.toThrow(NotFoundException);

      expect(prisma.chapter.updateMany).not.toHaveBeenCalled();
    });
  });

  describe('reorder', () => {
    const chapterOrders = [
      { id: 'chapter-1', chapterNumber: 2 },
      { id: 'chapter-2', chapterNumber: 1 },
    ];

    it('应该在事务中重新排序章节', async () => {
      // Arrange
      const reorderedChapters = [
        { ...mockChapter, id: 'chapter-2', chapterNumber: 1 },
        { ...mockChapter, id: 'chapter-1', chapterNumber: 2 },
      ];

      mockPrismaService.novel.findFirst.mockResolvedValue(mockNovel);
      mockPrismaService.$transaction.mockImplementation(async (fn) => {
        return await fn({
          chapter: {
            update: jest.fn().mockResolvedValue({}),
            findMany: jest.fn().mockResolvedValue(reorderedChapters),
          },
        });
      });

      // Act
      const result = await service.reorder('test-novel-id', 'test-user-id', chapterOrders);

      // Assert
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual(reorderedChapters);
    });

    it('当章节序号重复时应该抛出错误', async () => {
      // Arrange
      const duplicateOrders = [
        { id: 'chapter-1', chapterNumber: 1 },
        { id: 'chapter-2', chapterNumber: 1 }, // 重复序号
      ];

      mockPrismaService.novel.findFirst.mockResolvedValue(mockNovel);

      // Act & Assert
      await expect(
        service.reorder('test-novel-id', 'test-user-id', duplicateOrders)
      ).rejects.toThrow(BadRequestException);

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('当章节序号不连续时应该抛出错误', async () => {
      // Arrange
      const nonContinuousOrders = [
        { id: 'chapter-1', chapterNumber: 1 },
        { id: 'chapter-2', chapterNumber: 3 }, // 跳过了2
      ];

      mockPrismaService.novel.findFirst.mockResolvedValue(mockNovel);

      // Act & Assert
      await expect(
        service.reorder('test-novel-id', 'test-user-id', nonContinuousOrders)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('字数统计算法测试', () => {
    it('应该正确统计中文字符', async () => {
      // 这个测试用例验证字数统计的准确性
      const testCases = [
        { content: '这是中文测试', expectedMin: 6, expectedMax: 8 },
        { content: 'Hello world', expectedMin: 10, expectedMax: 12 },
        { content: '中英文mixed内容123', expectedMin: 12, expectedMax: 16 },
        { content: '', expectedMin: 0, expectedMax: 0 },
        { content: '   ', expectedMin: 0, expectedMax: 2 }, // 空格处理
      ];

      mockPrismaService.novel.findFirst.mockResolvedValue(mockNovel);

      for (const testCase of testCases) {
        mockPrismaService.chapter.create.mockImplementation((args) => {
          const wordCount = args.data.wordCount;
          expect(wordCount).toBeGreaterThanOrEqual(testCase.expectedMin);
          expect(wordCount).toBeLessThanOrEqual(testCase.expectedMax);
          return Promise.resolve({ ...mockChapter, wordCount });
        });

        await service.create('test-novel-id', 'test-user-id', {
          title: '测试章节',
          content: testCase.content,
          chapterNumber: 1,
        });
      }
    });
  });
});
