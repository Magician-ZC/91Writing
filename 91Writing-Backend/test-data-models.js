const { PrismaClient } = require('@prisma/client');

async function testDataModels() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🚀 开始测试数据模型...\n');
    
    // 1. 测试用户创建
    console.log('1. 测试用户创建');
    const testUser = await prisma.user.create({
      data: {
        email: `test_${Date.now()}@example.com`,
        username: `testuser_${Date.now()}`,
        passwordHash: 'test_hash',
        profile: {
          create: {
            nickname: '测试用户',
            bio: '这是一个测试用户',
            preferences: {
              theme: 'dark',
              autoSave: true
            },
            writingStats: {
              totalWords: 0,
              totalChapters: 0
            }
          }
        }
      },
      include: {
        profile: true
      }
    });
    console.log('✅ 用户创建成功:', { id: testUser.id, email: testUser.email });
    
    // 2. 测试小说创建
    console.log('\n2. 测试小说创建');
    const testNovel = await prisma.novel.create({
      data: {
        userId: testUser.id,
        title: '测试小说',
        description: '这是一本测试小说',
        genre: '奇幻',
        status: 'DRAFT',
        settings: {
          characters: [
            {
              name: '主角',
              description: '故事的主人公',
              personality: '勇敢、善良'
            }
          ],
          worldview: {
            setting: '古代王国',
            magic: true,
            technology: 'medieval'
          }
        }
      }
    });
    console.log('✅ 小说创建成功:', { id: testNovel.id, title: testNovel.title });
    
    // 3. 测试章节创建
    console.log('\n3. 测试章节创建');
    const testChapters = [];
    for (let i = 1; i <= 3; i++) {
      const chapter = await prisma.chapter.create({
        data: {
          novelId: testNovel.id,
          title: `第${i}章 测试章节`,
          content: `这是第${i}章的内容。`.repeat(100), // 生成一些内容
          chapterNumber: i,
          wordCount: 100,
          status: 'DRAFT'
        }
      });
      testChapters.push(chapter);
      console.log(`✅ 第${i}章创建成功:`, { id: chapter.id, title: chapter.title });
    }
    
    // 4. 测试记忆系统
    console.log('\n4. 测试记忆系统');
    const testMemory = await prisma.novelMemory.create({
      data: {
        novelId: testNovel.id,
        memoryType: 'CORE',
        content: {
          type: 'character_introduction',
          character: '主角',
          description: '主角是一个年轻的战士',
          importance: 'high'
        },
        importance: 0.9,
        tokenCost: 50,
        chapterRange: '1-3'
      }
    });
    console.log('✅ 记忆创建成功:', { id: testMemory.id, type: testMemory.memoryType });
    
    // 5. 测试数据查询
    console.log('\n5. 测试数据查询');
    const novelWithDetails = await prisma.novel.findUnique({
      where: { id: testNovel.id },
      include: {
        user: {
          select: { id: true, username: true, email: true }
        },
        chapters: {
          orderBy: { chapterNumber: 'asc' },
          select: {
            id: true,
            title: true,
            chapterNumber: true,
            wordCount: true,
            status: true
          }
        },
        memories: {
          orderBy: { importance: 'desc' }
        },
        _count: {
          select: {
            chapters: true,
            memories: true
          }
        }
      }
    });
    console.log('✅ 小说详情查询成功:', {
      title: novelWithDetails.title,
      chaptersCount: novelWithDetails._count.chapters,
      memoriesCount: novelWithDetails._count.memories,
      author: novelWithDetails.user.username
    });
    
    // 6. 测试更新操作
    console.log('\n6. 测试更新操作');
    
    // 更新小说统计
    const chapterStats = await prisma.chapter.aggregate({
      where: { novelId: testNovel.id },
      _count: { id: true },
      _sum: { wordCount: true }
    });
    
    const updatedNovel = await prisma.novel.update({
      where: { id: testNovel.id },
      data: {
        chapterCount: chapterStats._count.id,
        wordCount: chapterStats._sum.wordCount,
        status: 'WRITING'
      }
    });
    console.log('✅ 小说统计更新成功:', {
      chapterCount: updatedNovel.chapterCount,
      wordCount: updatedNovel.wordCount,
      status: updatedNovel.status
    });
    
    // 7. 测试关联查询
    console.log('\n7. 测试关联查询');
    const userWithNovels = await prisma.user.findUnique({
      where: { id: testUser.id },
      include: {
        novels: {
          include: {
            _count: {
              select: { chapters: true }
            }
          }
        },
        profile: true
      }
    });
    console.log('✅ 用户关联查询成功:', {
      username: userWithNovels.username,
      novelsCount: userWithNovels.novels.length,
      profile: !!userWithNovels.profile
    });
    
    // 8. 测试枚举值
    console.log('\n8. 测试枚举值');
    const statusCounts = await Promise.all([
      prisma.novel.count({ where: { status: 'DRAFT' } }),
      prisma.novel.count({ where: { status: 'WRITING' } }),
      prisma.novel.count({ where: { status: 'COMPLETED' } }),
      prisma.novel.count({ where: { status: 'PUBLISHED' } })
    ]);
    console.log('✅ 枚举统计成功:', {
      DRAFT: statusCounts[0],
      WRITING: statusCounts[1],
      COMPLETED: statusCounts[2],
      PUBLISHED: statusCounts[3]
    });
    
    console.log('\n🎉 所有数据模型测试通过！');
    
    // 清理测试数据
    console.log('\n🧹 清理测试数据...');
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    console.log('✅ 测试数据清理完成');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('详细错误:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 运行测试
testDataModels();
