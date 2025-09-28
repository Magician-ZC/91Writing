import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { NovelService } from './novel.service';
import { PrismaService } from '@app/database';
import { CreateNovelDto } from '../../dto/create-novel.dto';
import { UpdateNovelDto } from '../../dto/update-novel.dto';
import { NovelStatus } from '@prisma/client';

describe('NovelService', () => {
  let service: NovelService;
  let prisma: PrismaService;

  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    username: 'testuser',
    passwordHash: 'hashedpassword',
  };

  const mockNovel = {
    id: 'test-novel-id',
    userId: 'test-user-id',
    title: '测试小说',
    description: '这是一个测试小说',
    genre: '奇幻',
    status: NovelStatus.DRAFT,
    coverUrl: null,
    wordCount: 0,
    chapterCount: 0,
    settings: {
      characters: [
        {
          name: '主角',
          personality: '勇敢'
        }
      ]
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    novel: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    chapter: {
      aggregate: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NovelService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<NovelService>(NovelService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createNovelDto: CreateNovelDto = {
      title: '魔法学院编年史',
      description: '一个关于年轻魔法师的故事',
      genre: '奇幻',
      settings: {
        characters: [
          {
            name: '艾莉亚',
            age: 18,
            personality: '勇敢、聪明'
          }
        ]
      }
    };

    it('应该成功创建小说', async () => {
      // Arrange
      const expectedNovel = {
        ...mockNovel,
        ...createNovelDto,
        user: mockUser,
        _count: {
          chapters: 0,
          memories: 0,
        },
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.novel.create.mockResolvedValue(expectedNovel);

      // Act
      const result = await service.create('test-user-id', createNovelDto);

      // Assert
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-user-id' },
      });
      expect(prisma.novel.create).toHaveBeenCalledWith({
        data: {
          userId: 'test-user-id',
          ...createNovelDto,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          _count: {
            select: {
              chapters: true,
              memories: true,
            },
          },
        },
      });
      expect(result).toEqual(expectedNovel);
    });

    it('当用户不存在时应该抛出NotFoundException', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.create('non-existent-user', createNovelDto)
      ).rejects.toThrow(NotFoundException);
      
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-user' },
      });
      expect(prisma.novel.create).not.toHaveBeenCalled();
    });

    it('应该正确处理空的设置对象', async () => {
      // Arrange
      const dtoWithoutSettings = { ...createNovelDto, settings: undefined };
      const expectedNovel = {
        ...mockNovel,
        ...dtoWithoutSettings,
        settings: null,
        user: mockUser,
        _count: { chapters: 0, memories: 0 },
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.novel.create.mockResolvedValue(expectedNovel);

      // Act
      const result = await service.create('test-user-id', dtoWithoutSettings);

      // Assert
      expect(result).toEqual(expectedNovel);
    });
  });

  describe('findAll', () => {
    const mockNovels = [
      { ...mockNovel, _count: { chapters: 3, memories: 5 } },
      { ...mockNovel, id: 'novel-2', title: '另一个小说', _count: { chapters: 1, memories: 2 } }
    ];

    it('应该返回用户的所有小说（无筛选）', async () => {
      // Arrange
      mockPrismaService.novel.findMany.mockResolvedValue(mockNovels);
      mockPrismaService.novel.count.mockResolvedValue(2);

      // Act
      const result = await service.findAll('test-user-id');

      // Assert
      expect(prisma.novel.findMany).toHaveBeenCalledWith({
        where: { userId: 'test-user-id' },
        skip: 0,
        take: 20,
        orderBy: { updatedAt: 'desc' },
        include: {
          _count: {
            select: {
              chapters: true,
              memories: true,
            },
          },
        },
      });
      expect(result).toEqual({
        novels: mockNovels,
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
        },
      });
    });

    it('应该支持按状态筛选', async () => {
      // Arrange
      const filteredNovels = [mockNovels[0]];
      mockPrismaService.novel.findMany.mockResolvedValue(filteredNovels);
      mockPrismaService.novel.count.mockResolvedValue(1);

      // Act
      const result = await service.findAll('test-user-id', {
        status: NovelStatus.DRAFT,
        page: 1,
        limit: 10,
      });

      // Assert
      expect(prisma.novel.findMany).toHaveBeenCalledWith({
        where: { 
          userId: 'test-user-id',
          status: NovelStatus.DRAFT,
        },
        skip: 0,
        take: 10,
        orderBy: { updatedAt: 'desc' },
        include: {
          _count: {
            select: {
              chapters: true,
              memories: true,
            },
          },
        },
      });
    });

    it('应该支持按类型筛选', async () => {
      // Arrange
      mockPrismaService.novel.findMany.mockResolvedValue(mockNovels);
      mockPrismaService.novel.count.mockResolvedValue(2);

      // Act
      await service.findAll('test-user-id', { genre: '奇幻' });

      // Assert
      expect(prisma.novel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { 
            userId: 'test-user-id',
            genre: '奇幻',
          },
        })
      );
    });

    it('应该支持分页', async () => {
      // Arrange
      mockPrismaService.novel.findMany.mockResolvedValue([]);
      mockPrismaService.novel.count.mockResolvedValue(0);

      // Act
      await service.findAll('test-user-id', { page: 2, limit: 5 });

      // Assert
      expect(prisma.novel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5, // (page - 1) * limit = (2 - 1) * 5
          take: 5,
        })
      );
    });
  });

  describe('findOne', () => {
    const mockDetailedNovel = {
      ...mockNovel,
      chapters: [
        {
          id: 'chapter-1',
          title: '第一章',
          chapterNumber: 1,
          wordCount: 1000,
          status: 'DRAFT',
          updatedAt: new Date(),
        },
      ],
      memories: [
        {
          id: 'memory-1',
          memoryType: 'CORE',
          content: { type: 'character', name: '主角' },
          importance: 0.9,
        },
      ],
      user: mockUser,
    };

    it('应该返回小说详情（包含章节和记忆）', async () => {
      // Arrange
      mockPrismaService.novel.findFirst.mockResolvedValue(mockDetailedNovel);

      // Act
      const result = await service.findOne('test-novel-id', 'test-user-id');

      // Assert
      expect(prisma.novel.findFirst).toHaveBeenCalledWith({
        where: { 
          id: 'test-novel-id',
          userId: 'test-user-id',
        },
        include: {
          chapters: {
            orderBy: { chapterNumber: 'asc' },
            select: {
              id: true,
              title: true,
              chapterNumber: true,
              wordCount: true,
              status: true,
              updatedAt: true,
            },
          },
          memories: {
            orderBy: { importance: 'desc' },
            take: 10,
          },
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      });
      expect(result).toEqual(mockDetailedNovel);
    });

    it('当小说不存在或无权访问时应该抛出NotFoundException', async () => {
      // Arrange
      mockPrismaService.novel.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.findOne('non-existent-novel', 'test-user-id')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateNovelDto: UpdateNovelDto = {
      title: '更新后的标题',
      status: NovelStatus.WRITING,
    };

    it('应该成功更新小说', async () => {
      // Arrange
      const updatedNovel = {
        ...mockNovel,
        ...updateNovelDto,
        _count: { chapters: 3, memories: 2 },
      };

      mockPrismaService.novel.findFirst.mockResolvedValue(mockNovel);
      mockPrismaService.novel.update.mockResolvedValue(updatedNovel);

      // Act
      const result = await service.update('test-novel-id', 'test-user-id', updateNovelDto);

      // Assert
      expect(prisma.novel.findFirst).toHaveBeenCalledWith({
        where: { id: 'test-novel-id', userId: 'test-user-id' },
      });
      expect(prisma.novel.update).toHaveBeenCalledWith({
        where: { id: 'test-novel-id' },
        data: updateNovelDto,
        include: {
          _count: {
            select: {
              chapters: true,
              memories: true,
            },
          },
        },
      });
      expect(result).toEqual(updatedNovel);
    });

    it('当小说不存在时应该抛出NotFoundException', async () => {
      // Arrange
      mockPrismaService.novel.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.update('non-existent-novel', 'test-user-id', updateNovelDto)
      ).rejects.toThrow(NotFoundException);

      expect(prisma.novel.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('应该成功删除小说', async () => {
      // Arrange
      mockPrismaService.novel.findFirst.mockResolvedValue(mockNovel);
      mockPrismaService.novel.delete.mockResolvedValue(mockNovel);

      // Act
      const result = await service.remove('test-novel-id', 'test-user-id');

      // Assert
      expect(prisma.novel.findFirst).toHaveBeenCalledWith({
        where: { id: 'test-novel-id', userId: 'test-user-id' },
      });
      expect(prisma.novel.delete).toHaveBeenCalledWith({
        where: { id: 'test-novel-id' },
      });
      expect(result).toEqual({ message: '小说已删除' });
    });

    it('当小说不存在时应该抛出NotFoundException', async () => {
      // Arrange
      mockPrismaService.novel.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.remove('non-existent-novel', 'test-user-id')
      ).rejects.toThrow(NotFoundException);

      expect(prisma.novel.delete).not.toHaveBeenCalled();
    });
  });

  describe('updateStats', () => {
    it('应该正确计算和更新统计信息', async () => {
      // Arrange
      const statsResult = {
        _count: { id: 5 },
        _sum: { wordCount: 15000 },
      };
      const updatedNovel = {
        ...mockNovel,
        chapterCount: 5,
        wordCount: 15000,
      };

      mockPrismaService.novel.findFirst.mockResolvedValue(mockNovel);
      mockPrismaService.chapter.aggregate.mockResolvedValue(statsResult);
      mockPrismaService.novel.update.mockResolvedValue(updatedNovel);

      // Act
      const result = await service.updateStats('test-novel-id', 'test-user-id');

      // Assert
      expect(prisma.chapter.aggregate).toHaveBeenCalledWith({
        where: { novelId: 'test-novel-id' },
        _count: { id: true },
        _sum: { wordCount: true },
      });
      expect(prisma.novel.update).toHaveBeenCalledWith({
        where: { id: 'test-novel-id' },
        data: {
          chapterCount: 5,
          wordCount: 15000,
        },
      });
      expect(result).toEqual(updatedNovel);
    });

    it('应该处理没有章节的情况', async () => {
      // Arrange
      const statsResult = {
        _count: { id: 0 },
        _sum: { wordCount: null },
      };
      const updatedNovel = {
        ...mockNovel,
        chapterCount: 0,
        wordCount: 0,
      };

      mockPrismaService.novel.findFirst.mockResolvedValue(mockNovel);
      mockPrismaService.chapter.aggregate.mockResolvedValue(statsResult);
      mockPrismaService.novel.update.mockResolvedValue(updatedNovel);

      // Act
      const result = await service.updateStats('test-novel-id', 'test-user-id');

      // Assert
      expect(prisma.novel.update).toHaveBeenCalledWith({
        where: { id: 'test-novel-id' },
        data: {
          chapterCount: 0,
          wordCount: 0,
        },
      });
    });
  });

  describe('getSettings', () => {
    it('应该返回小说设置', async () => {
      // Arrange
      const novelWithSettings = {
        settings: {
          characters: [{ name: '主角', age: 20 }],
          worldview: { setting: '奇幻世界' },
        },
      };
      mockPrismaService.novel.findFirst.mockResolvedValue(novelWithSettings);

      // Act
      const result = await service.getSettings('test-novel-id', 'test-user-id');

      // Assert
      expect(result).toEqual(novelWithSettings.settings);
    });

    it('当设置为空时应该返回空对象', async () => {
      // Arrange
      mockPrismaService.novel.findFirst.mockResolvedValue({ settings: null });

      // Act
      const result = await service.getSettings('test-novel-id', 'test-user-id');

      // Assert
      expect(result).toEqual({});
    });
  });

  describe('updateSettings', () => {
    it('应该合并并更新设置', async () => {
      // Arrange
      const existingSettings = {
        characters: [{ name: '老角色' }],
        worldview: { setting: '旧世界' },
      };
      const newSettings = {
        characters: [{ name: '新角色' }],
        theme: '新主题',
      };
      const expectedMergedSettings = {
        characters: [{ name: '新角色' }],
        worldview: { setting: '旧世界' },
        theme: '新主题',
      };

      mockPrismaService.novel.findFirst.mockResolvedValue({ 
        settings: existingSettings 
      });
      mockPrismaService.novel.update.mockResolvedValue({
        settings: expectedMergedSettings,
      });

      // Act
      const result = await service.updateSettings('test-novel-id', 'test-user-id', newSettings);

      // Assert
      expect(prisma.novel.update).toHaveBeenCalledWith({
        where: { id: 'test-novel-id' },
        data: { settings: expectedMergedSettings },
        select: { settings: true },
      });
      expect(result).toEqual(expectedMergedSettings);
    });
  });
});
