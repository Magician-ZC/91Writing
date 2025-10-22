const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testService() {
  try {
    console.log('=== 测试 VideoAPIConfig Service ===\n');
    
    // 1. 检查配置是否存在
    const config = await prisma.videoAPIConfig.findFirst({
      where: { id: 'default_config' }
    });
    
    console.log('1. 数据库中的配置:');
    console.log('   - ID:', config?.id);
    console.log('   - Provider:', config?.videoProvider);
    console.log('   - 创建时间:', config?.createdAt);
    console.log('');
    
    if (!config) {
      console.log('❌ 配置不存在，创建中...');
      const newConfig = await prisma.videoAPIConfig.create({
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
      console.log('✅ 配置创建成功:', newConfig.id);
    } else {
      console.log('✅ 配置已存在');
    }
    
    // 2. 测试查询
    console.log('\n2. 测试查询:');
    const all = await prisma.videoAPIConfig.findMany();
    console.log('   - 总记录数:', all.length);
    console.log('   - 所有ID:', all.map(c => c.id));
    
  } catch (error) {
    console.error('\n❌ 测试失败:');
    console.error('   错误消息:', error.message);
    console.error('   错误代码:', error.code);
    if (error.meta) {
      console.error('   详细信息:', error.meta);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testService();

