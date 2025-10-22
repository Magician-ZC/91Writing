// 初始化视频API配置
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function initVideoConfig() {
  try {
    console.log('检查视频API配置...');
    
    const existing = await prisma.videoAPIConfig.findFirst({
      where: { id: 'default_config' }
    });

    if (existing) {
      console.log('✅ 配置已存在，无需初始化');
      return;
    }

    console.log('创建默认视频API配置...');
    
    const config = await prisma.videoAPIConfig.create({
      data: {
        id: 'default_config',
        videoProvider: 'jimeng',
        ffmpegPath: '/usr/bin/ffmpeg',
        ffmpegPreset: 'medium',
        videoStoragePath: '/data/videos',
        tempStoragePath: '/tmp/video-generation',
        autoCleanTemp: true,
        userDailyQuota: 5,
        userMonthlyQuota: 50,
        monthlyBudget: 1000.0,
        costAlertThreshold: 800.0,
        costPerImage: 0.02,
        costPerVideo: 1.5,
        isActive: true,
      }
    });

    console.log('✅ 默认配置创建成功:', config.id);
  } catch (error) {
    console.error('❌ 初始化失败:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

initVideoConfig();

