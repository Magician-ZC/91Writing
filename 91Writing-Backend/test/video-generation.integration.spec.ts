import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../apps/ai-service/src/app.module';
import { PrismaService } from '@app/database';

describe('Video Generation Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let testNovelId: string;
  let testChapterId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    // 准备测试数据
    await setupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  async function setupTestData() {
    // 创建测试用户
    const user = await prisma.user.create({
      data: {
        email: 'video-test@test.com',
        username: 'videotest',
        passwordHash: 'test',
        inviteCode: 'VTEST01',
      },
    });

    // 创建测试小说
    const novel = await prisma.novel.create({
      data: {
        userId: user.id,
        title: '测试小说',
        description: '用于视频生成测试',
        genre: 'fantasy',
      },
    });
    testNovelId = novel.id;

    // 创建测试章节
    const chapter = await prisma.chapter.create({
      data: {
        novelId: novel.id,
        title: '第一章 起源',
        content: `在一个遥远的王国，住着一位年轻的剑士。他有着黑色的长发和蓝色的眼睛，身穿黑色的战袍。

某天，他在森林中发现了一把神秘的宝剑。宝剑散发着淡蓝色的光芒，剑身刻着古老的符文。

他拿起宝剑，感受到一股强大的力量涌入体内。从此，他的命运被改变了。`,
        chapterNumber: 1,
        wordCount: 100,
      },
    });
    testChapterId = chapter.id;

    // 创建一致性配置
    await prisma.consistencyProfile.create({
      data: {
        novelId: novel.id,
        characters: {
          '主角剑士': {
            name: '主角剑士',
            baseAppearance: '黑发蓝眼，身穿黑色战袍的年轻剑士',
            keywords: ['black hair', 'blue eyes', 'black armor', 'young', 'swordsman'],
            dynamicState: {},
            importance: 100,
          },
        },
        environments: {},
        objects: {
          '神秘宝剑': {
            name: '神秘宝剑',
            description: '散发蓝光的神秘宝剑',
            appearance: '剑身刻有古老符文，发出淡蓝色光芒',
            keywords: ['blue glow', 'runes', 'mysterious sword'],
          },
        },
        visualStyle: {
          overall: 'fantasy',
          colorTone: 'cool',
          artStyle: 'cinematic',
          lighting: 'dramatic',
        },
      },
    });

    // 模拟登录获取token
    authToken = 'test-token';
  }

  async function cleanupTestData() {
    // 清理测试数据
    if (testChapterId) {
      await prisma.chapter.delete({ where: { id: testChapterId } }).catch(() => {});
    }
    if (testNovelId) {
      await prisma.novel.delete({ where: { id: testNovelId } }).catch(() => {});
    }
    await prisma.user.deleteMany({ where: { email: 'video-test@test.com' } });
  }

  describe('一致性配置管理', () => {
    it('应该成功获取一致性配置', async () => {
      const response = await request(app.getHttpServer())
        .get(`/consistency/${testNovelId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.novelId).toBe(testNovelId);
      expect(response.body.characters).toBeDefined();
    });

    it('应该成功更新一致性配置', async () => {
      const updateData = {
        characters: [
          {
            name: '主角剑士',
            baseAppearance: '更新后的外貌',
            keywords: ['updated'],
            dynamicState: {},
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .put(`/consistency/${testNovelId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
    });
  });

  describe('视频生成流程', () => {
    it('应该成功提交视频生成任务', async () => {
      const generateDto = {
        chapterId: testChapterId,
        sceneCount: 3,
        videoDuration: 10,
        forceRegenerate: false,
      };

      const response = await request(app.getHttpServer())
        .post('/video-generation/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(generateDto);

      expect(response.status).toBe(200);
      expect(response.body.chapterId).toBe(testChapterId);
      expect(response.body.status).toBe('GENERATING');
    });

    it('应该成功查询视频生成状态', async () => {
      const response = await request(app.getHttpServer())
        .get(`/video-generation/status/${testChapterId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.chapterId).toBe(testChapterId);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('stage');
      expect(response.body).toHaveProperty('progress');
    });
  });

  describe('Agent服务测试', () => {
    it('分镜脚本生成Agent应该正常工作', async () => {
      const storyboardAgent = app.get('StoryboardAgentService');
      const consistencyProfile = await prisma.consistencyProfile.findUnique({
        where: { novelId: testNovelId },
      });

      const storyboard = await storyboardAgent.generateStoryboard(
        testChapterId,
        consistencyProfile,
        { sceneCount: 3, totalDuration: 10 },
      );

      expect(storyboard).toBeDefined();
      expect(storyboard.scenes).toHaveLength(3);
      expect(storyboard.totalDuration).toBe(10);
    });

    it('文生图Agent应该生成提示词', async () => {
      const imageAgent = app.get('ImageGenerationAgentService');
      const consistencyProfile = await prisma.consistencyProfile.findUnique({
        where: { novelId: testNovelId },
      });

      const scene = {
        sceneNumber: 1,
        description: '剑士在森林中发现宝剑',
        characters: ['主角剑士'],
        environment: '神秘森林',
        duration: 5,
        keyMoment: '发现宝剑',
        cameraAngle: 'medium',
      };

      const prompt = await imageAgent.generateImagePrompt(
        scene,
        consistencyProfile,
        1,
      );

      expect(prompt).toBeDefined();
      expect(prompt.positivePrompt).toBeTruthy();
      expect(prompt.negativePrompt).toBeTruthy();
    });
  });

  describe('FFmpeg服务测试', () => {
    it('应该检测到FFmpeg可用', async () => {
      const ffmpegService = app.get('FFmpegService');
      const isAvailable = await ffmpegService.checkFFmpegAvailability();
      
      expect(isAvailable).toBe(true);
    });
  });
});

