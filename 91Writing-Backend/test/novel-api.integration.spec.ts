import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../apps/novel-service/src/app.module';
import { PrismaService } from '@app/database';
import { JwtAuthGuard } from '@app/common/guards';
import { NovelStatus, ChapterStatus, MemoryType } from '@prisma/client';

describe('Novel API Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  
  // 测试数据
  let testUser: any;
  let testNovel: any;
  let testChapter: any;
  let testMemory: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({
      canActivate: (context) => {
        const request = context.switchToHttp().getRequest();
        request.user = { id: 'test-user-id', email: 'test@example.com' };
        return true;
      },
    })
    .compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    
    // 配置全局管道
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    
    await app.init();
    
    // 准备测试数据
    await setupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  beforeEach(async () => {
    // 每个测试前确保数据一致性
    authToken = 'mock-jwt-token';
  });

  const setupTestData = async () => {
    // 清理可能存在的测试数据
    await cleanupTestData();
    
    // 创建测试用户
    testUser = await prisma.user.create({
      data: {
        id: 'test-user-id',
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: 'hashedpassword',
        profile: {
          create: {
            nickname: '测试用户',
            bio: '集成测试专用用户',
          }
        }
      }
    });
  };

  const cleanupTestData = async () => {
    // 按依赖关系清理数据
    await prisma.novelMemory.deleteMany({ where: { novel: { userId: 'test-user-id' } } });
    await prisma.chapter.deleteMany({ where: { novel: { userId: 'test-user-id' } } });
    await prisma.novel.deleteMany({ where: { userId: 'test-user-id' } });
    await prisma.userProfile.deleteMany({ where: { userId: 'test-user-id' } });
    await prisma.user.deleteMany({ where: { id: 'test-user-id' } });
  };

  describe('Novel Management', () => {
    describe('POST /novels', () => {
      it('应该成功创建小说', async () => {
        const novelData = {
          title: '魔法学院编年史',
          description: '一个关于年轻魔法师在学院中成长冒险的故事',
          genre: '奇幻',
          status: NovelStatus.DRAFT,
          settings: {
            characters: [
              {
                name: '艾莉亚',
                age: 18,
                personality: '勇敢、聪明、好奇心强',
                abilities: ['火系魔法', '治愈术']
              }
            ],
            worldview: {
              setting: '中世纪奇幻世界',
              magic_system: {
                types: ['元素魔法', '治愈魔法', '黑暗魔法'],
                learning: '通过魔法学院系统学习'
              }
            }
          }
        };

        const response = await request(app.getHttpServer())
          .post('/novels')
          .set('Authorization', `Bearer ${authToken}`)
          .send(novelData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toMatchObject({
          title: novelData.title,
          description: novelData.description,
          genre: novelData.genre,
          status: novelData.status,
          wordCount: 0,
          chapterCount: 0,
          userId: 'test-user-id'
        });
        expect(response.body.data.settings).toEqual(novelData.settings);
        expect(response.body.data.id).toBeDefined();
        expect(response.body.data.createdAt).toBeDefined();

        // 保存测试小说ID
        testNovel = response.body.data;
      });

      it('应该验证必填字段', async () => {
        const invalidData = {
          // 缺少 title 字段
          description: '测试描述',
        };

        await request(app.getHttpServer())
          .post('/novels')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidData)
          .expect(400);
      });

      it('应该验证标题长度限制', async () => {
        const longTitleData = {
          title: 'x'.repeat(201), // 超过200字符限制
          description: '测试描述',
        };

        await request(app.getHttpServer())
          .post('/novels')
          .set('Authorization', `Bearer ${authToken}`)
          .send(longTitleData)
          .expect(400);
      });

      it('应该验证状态枚举值', async () => {
        const invalidStatusData = {
          title: '测试标题',
          status: 'INVALID_STATUS', // 无效状态
        };

        await request(app.getHttpServer())
          .post('/novels')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidStatusData)
          .expect(400);
      });
    });

    describe('GET /novels', () => {
      beforeEach(async () => {
        // 确保有测试小说存在
        if (!testNovel) {
          testNovel = await prisma.novel.create({
            data: {
              userId: 'test-user-id',
              title: '测试小说',
              description: '测试描述',
              genre: '奇幻',
              status: NovelStatus.DRAFT,
            }
          });
        }
      });

      it('应该返回用户的小说列表', async () => {
        const response = await request(app.getHttpServer())
          .get('/novels')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.novels).toBeDefined();
        expect(Array.isArray(response.body.data.novels)).toBe(true);
        expect(response.body.data.pagination).toMatchObject({
          page: 1,
          limit: 20,
          total: expect.any(Number),
          totalPages: expect.any(Number)
        });
      });

      it('应该支持状态筛选', async () => {
        const response = await request(app.getHttpServer())
          .get('/novels')
          .query({ status: NovelStatus.DRAFT })
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.novels.every((novel: any) => 
          novel.status === NovelStatus.DRAFT
        )).toBe(true);
      });

      it('应该支持类型筛选', async () => {
        const response = await request(app.getHttpServer())
          .get('/novels')
          .query({ genre: '奇幻' })
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.novels.every((novel: any) => 
          novel.genre === '奇幻'
        )).toBe(true);
      });

      it('应该支持分页', async () => {
        const response = await request(app.getHttpServer())
          .get('/novels')
          .query({ page: 1, limit: 5 })
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.data.pagination.page).toBe(1);
        expect(response.body.data.pagination.limit).toBe(5);
      });
    });

    describe('GET /novels/:id', () => {
      beforeEach(async () => {
        if (!testNovel) {
          testNovel = await prisma.novel.create({
            data: {
              userId: 'test-user-id',
              title: '详情测试小说',
              description: '用于测试详情接口的小说',
              genre: '科幻',
              status: NovelStatus.WRITING,
              settings: {
                characters: [{ name: '主角', age: 25 }]
              }
            }
          });
        }
      });

      it('应该返回小说详情', async () => {
        const response = await request(app.getHttpServer())
          .get(`/novels/${testNovel.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toMatchObject({
          id: testNovel.id,
          title: testNovel.title,
          description: testNovel.description,
          genre: testNovel.genre,
          status: testNovel.status,
        });
        expect(response.body.data.chapters).toBeDefined();
        expect(response.body.data.memories).toBeDefined();
        expect(response.body.data.user).toBeDefined();
      });

      it('当小说不存在时应该返回404', async () => {
        await request(app.getHttpServer())
          .get('/novels/non-existent-id')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);
      });
    });

    describe('PATCH /novels/:id', () => {
      beforeEach(async () => {
        if (!testNovel) {
          testNovel = await prisma.novel.create({
            data: {
              userId: 'test-user-id',
              title: '待更新小说',
              description: '原始描述',
              status: NovelStatus.DRAFT,
            }
          });
        }
      });

      it('应该成功更新小说', async () => {
        const updateData = {
          title: '更新后的标题',
          description: '更新后的描述',
          status: NovelStatus.WRITING,
        };

        const response = await request(app.getHttpServer())
          .patch(`/novels/${testNovel.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toMatchObject(updateData);
      });

      it('应该验证更新数据', async () => {
        const invalidUpdateData = {
          title: '', // 空标题
        };

        await request(app.getHttpServer())
          .patch(`/novels/${testNovel.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidUpdateData)
          .expect(400);
      });
    });

    describe('DELETE /novels/:id', () => {
      it('应该成功删除小说', async () => {
        // 创建一个专用于删除测试的小说
        const novelToDelete = await prisma.novel.create({
          data: {
            userId: 'test-user-id',
            title: '待删除小说',
            description: '这个小说将被删除',
          }
        });

        const response = await request(app.getHttpServer())
          .delete(`/novels/${novelToDelete.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.message).toBe('小说已删除');

        // 验证小说确实被删除
        const deletedNovel = await prisma.novel.findUnique({
          where: { id: novelToDelete.id }
        });
        expect(deletedNovel).toBeNull();
      });
    });

    describe('POST /novels/:id/stats/update', () => {
      beforeEach(async () => {
        if (!testNovel) {
          testNovel = await prisma.novel.create({
            data: {
              userId: 'test-user-id',
              title: '统计测试小说',
              wordCount: 0,
              chapterCount: 0,
            }
          });
        }

        // 创建测试章节
        await prisma.chapter.createMany({
          data: [
            {
              novelId: testNovel.id,
              title: '第一章',
              content: '第一章的内容',
              chapterNumber: 1,
              wordCount: 100,
            },
            {
              novelId: testNovel.id,
              title: '第二章',
              content: '第二章的内容',
              chapterNumber: 2,
              wordCount: 150,
            },
          ]
        });
      });

      it('应该正确更新小说统计信息', async () => {
        const response = await request(app.getHttpServer())
          .post(`/novels/${testNovel.id}/stats/update`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.chapterCount).toBe(2);
        expect(response.body.data.wordCount).toBe(250);
      });
    });
  });

  describe('Chapter Management', () => {
    beforeEach(async () => {
      // 确保有测试小说
      if (!testNovel) {
        testNovel = await prisma.novel.create({
          data: {
            userId: 'test-user-id',
            title: '章节测试小说',
            description: '用于测试章节功能的小说',
          }
        });
      }
    });

    describe('POST /novels/:novelId/chapters', () => {
      it('应该成功创建章节', async () => {
        const chapterData = {
          title: '第一章：新的开始',
          content: `夜幕降临，艾莉亚站在宿舍窗前，望着远方闪烁的星辰。今天是她进入魔法学院的第一天，心中既兴奋又忐忑。

"艾莉亚，你还不睡吗？"室友莉娜从床上探出头来。

"我有些睡不着。"艾莉亚轻声回答，"总觉得有什么大事要发生。"

就在这时，她的手突然发出微弱的蓝光...`,
          chapterNumber: 1,
          status: ChapterStatus.DRAFT,
        };

        const response = await request(app.getHttpServer())
          .post(`/novels/${testNovel.id}/chapters`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(chapterData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toMatchObject({
          title: chapterData.title,
          content: chapterData.content,
          chapterNumber: chapterData.chapterNumber,
          status: chapterData.status,
          novelId: testNovel.id,
        });
        expect(response.body.data.wordCount).toBeGreaterThan(0);

        testChapter = response.body.data;
      });

      it('应该验证章节序号唯一性', async () => {
        // 先创建一个章节
        await prisma.chapter.create({
          data: {
            novelId: testNovel.id,
            title: '第一章',
            content: '内容',
            chapterNumber: 1,
          }
        });

        // 尝试创建相同序号的章节
        const duplicateChapterData = {
          title: '第一章重复',
          content: '重复内容',
          chapterNumber: 1, // 重复序号
        };

        await request(app.getHttpServer())
          .post(`/novels/${testNovel.id}/chapters`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(duplicateChapterData)
          .expect(400);
      });
    });

    describe('GET /novels/:novelId/chapters', () => {
      beforeEach(async () => {
        // 创建测试章节
        await prisma.chapter.createMany({
          data: [
            {
              novelId: testNovel.id,
              title: '第一章',
              content: '第一章内容',
              chapterNumber: 1,
              wordCount: 100,
            },
            {
              novelId: testNovel.id,
              title: '第二章',
              content: '第二章内容',
              chapterNumber: 2,
              wordCount: 120,
            },
            {
              novelId: testNovel.id,
              title: '第三章',
              content: '第三章内容',
              chapterNumber: 3,
              wordCount: 80,
            },
          ]
        });
      });

      it('应该返回小说的所有章节', async () => {
        const response = await request(app.getHttpServer())
          .get(`/novels/${testNovel.id}/chapters`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data).toHaveLength(3);
        
        // 验证章节按序号排序
        const chapters = response.body.data;
        expect(chapters[0].chapterNumber).toBe(1);
        expect(chapters[1].chapterNumber).toBe(2);
        expect(chapters[2].chapterNumber).toBe(3);
      });
    });
  });

  describe('Memory Management', () => {
    beforeEach(async () => {
      // 确保有测试小说
      if (!testNovel) {
        testNovel = await prisma.novel.create({
          data: {
            userId: 'test-user-id',
            title: '记忆测试小说',
            description: '用于测试记忆功能的小说',
          }
        });
      }
    });

    describe('POST /novels/:novelId/memories', () => {
      it('应该成功创建CORE类型记忆', async () => {
        const memoryData = {
          memoryType: MemoryType.CORE,
          content: {
            type: 'character_profile',
            character: '艾莉亚',
            details: {
              name: '艾莉亚·晨光',
              age: 18,
              personality: '勇敢、聪明、好奇心强',
              background: '来自北方小村庄的普通少女，觉醒了强大的魔法能力',
              abilities: ['火系魔法', '治愈术', '敏锐的直觉'],
              relationships: {
                '萨姆': '青梅竹马，最信任的伙伴',
                '梅林教授': '魔法导师，亦师亦父'
              }
            }
          },
          importance: 0.9,
          tokenCost: 150,
          chapterRange: '1-3',
        };

        const response = await request(app.getHttpServer())
          .post(`/novels/${testNovel.id}/memories`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(memoryData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toMatchObject({
          memoryType: memoryData.memoryType,
          content: memoryData.content,
          importance: memoryData.importance,
          tokenCost: memoryData.tokenCost,
          chapterRange: memoryData.chapterRange,
          novelId: testNovel.id,
        });

        testMemory = response.body.data;
      });

      it('应该成功创建SUMMARY类型记忆', async () => {
        const summaryMemoryData = {
          memoryType: MemoryType.SUMMARY,
          content: {
            type: 'plot_summary',
            chapters: '1-2',
            summary: '艾莉亚进入魔法学院，遇见室友莉娜，在第一堂魔法课上展现出惊人天赋',
            key_events: [
              '进入魔法学院',
              '结识室友莉娜',
              '参加第一堂魔法课',
              '展现魔法天赋'
            ],
            character_development: '从紧张不安的新生逐渐适应学院生活'
          },
          importance: 0.7,
          tokenCost: 100,
          chapterRange: '1-2',
        };

        const response = await request(app.getHttpServer())
          .post(`/novels/${testNovel.id}/memories`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(summaryMemoryData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.memoryType).toBe(MemoryType.SUMMARY);
        expect(response.body.data.content.type).toBe('plot_summary');
      });

      it('应该验证重要性权重范围', async () => {
        const invalidMemoryData = {
          memoryType: MemoryType.CORE,
          content: { type: 'test', data: 'test' },
          importance: 1.5, // 超出范围
        };

        await request(app.getHttpServer())
          .post(`/novels/${testNovel.id}/memories`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidMemoryData)
          .expect(400);
      });
    });

    describe('GET /novels/:novelId/memories', () => {
      beforeEach(async () => {
        // 创建测试记忆
        await prisma.novelMemory.createMany({
          data: [
            {
              novelId: testNovel.id,
              memoryType: MemoryType.CORE,
              content: { type: 'character', name: '主角' },
              importance: 0.9,
              tokenCost: 100,
            },
            {
              novelId: testNovel.id,
              memoryType: MemoryType.SUMMARY,
              content: { type: 'plot', summary: '故事摘要' },
              importance: 0.7,
              tokenCost: 80,
            },
            {
              novelId: testNovel.id,
              memoryType: MemoryType.CONTEXT,
              content: { type: 'world', location: '魔法学院' },
              importance: 0.6,
              tokenCost: 60,
            },
          ]
        });
      });

      it('应该返回小说的所有记忆', async () => {
        const response = await request(app.getHttpServer())
          .get(`/novels/${testNovel.id}/memories`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data).toHaveLength(3);
        
        // 验证记忆按重要性排序
        const memories = response.body.data;
        expect(memories[0].importance).toBeGreaterThanOrEqual(memories[1].importance);
        expect(memories[1].importance).toBeGreaterThanOrEqual(memories[2].importance);
      });
    });
  });

  describe('Authentication & Authorization', () => {
    it('应该拒绝无认证的请求', async () => {
      await request(app.getHttpServer())
        .get('/novels')
        .expect(401);
    });

    it('应该阻止访问其他用户的数据', async () => {
      // 创建另一个用户的小说
      const otherUser = await prisma.user.create({
        data: {
          id: 'other-user-id',
          email: 'other@example.com',
          username: 'otheruser',
          passwordHash: 'hashedpassword',
        }
      });

      const otherUserNovel = await prisma.novel.create({
        data: {
          userId: 'other-user-id',
          title: '其他用户的小说',
          description: '无权访问的小说',
        }
      });

      // 尝试访问其他用户的小说
      await request(app.getHttpServer())
        .get(`/novels/${otherUserNovel.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404); // 应该返回404而不是403，保护隐私

      // 清理
      await prisma.novel.delete({ where: { id: otherUserNovel.id } });
      await prisma.user.delete({ where: { id: 'other-user-id' } });
    });
  });

  describe('Error Handling', () => {
    it('应该正确处理数据验证错误', async () => {
      const invalidData = {
        title: '', // 空标题
        description: 'x'.repeat(10000), // 过长描述
        genre: 'x'.repeat(100), // 过长类型
      };

      const response = await request(app.getHttpServer())
        .post('/novels')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('应该正确处理资源不存在错误', async () => {
      const response = await request(app.getHttpServer())
        .get('/novels/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('应该正确处理服务器内部错误', async () => {
      // 模拟数据库连接失败等内部错误
      jest.spyOn(prisma.novel, 'findMany').mockRejectedValueOnce(
        new Error('Database connection failed')
      );

      const response = await request(app.getHttpServer())
        .get('/novels')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();

      // 恢复mock
      jest.restoreAllMocks();
    });
  });

  describe('Performance & Limits', () => {
    it('应该处理大量数据查询', async () => {
      // 创建多个小说测试分页性能
      const novelsData = Array.from({ length: 50 }, (_, i) => ({
        userId: 'test-user-id',
        title: `性能测试小说 ${i + 1}`,
        description: `第${i + 1}个性能测试小说的描述`,
        genre: i % 2 === 0 ? '奇幻' : '科幻',
        status: NovelStatus.DRAFT,
      }));

      await prisma.novel.createMany({ data: novelsData });

      const startTime = Date.now();
      const response = await request(app.getHttpServer())
        .get('/novels')
        .query({ limit: 20, page: 1 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      const endTime = Date.now();

      expect(response.body.data.novels).toHaveLength(20);
      expect(response.body.data.pagination.total).toBeGreaterThanOrEqual(50);
      
      // 响应时间应该在合理范围内（1秒内）
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('应该限制单次查询数量', async () => {
      const response = await request(app.getHttpServer())
        .get('/novels')
        .query({ limit: 1000 }) // 超大查询限制
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // 系统应该限制返回数量，不允许无限制查询
      expect(response.body.data.novels.length).toBeLessThanOrEqual(100);
    });
  });
});
