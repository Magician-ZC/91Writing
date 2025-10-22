// 直接测试 Service 方法
const { PrismaClient } = require('@prisma/client');
const { createCipheriv, createDecipheriv, randomBytes } = require('crypto');

const prisma = new PrismaClient();

// 模拟 Service
class TestVideoAPIConfigService {
  constructor() {
    const key = process.env.ENCRYPTION_KEY || 'default-32-char-encryption-key!!';
    this.encryptionKey = Buffer.from(key.padEnd(32, '0').slice(0, 32));
    this.algorithm = 'aes-256-cbc';
  }

  async getCurrentConfig() {
    try {
      console.log('开始查询配置...');
      let config = await prisma.videoAPIConfig.findFirst({
        where: { id: 'default_config' },
      });

      console.log('查询结果:', config ? '找到' : '未找到');

      if (!config) {
        console.log('配置不存在，创建默认配置...');
        config = await prisma.videoAPIConfig.create({
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
          },
        });
        console.log('✅ 默认配置创建成功');
      }

      console.log('开始处理返回数据...');
      // 解密敏感信息并脱敏显示
      const result = {
        ...config,
        volcengineSecretAccessKey: config.volcengineSecretAccessKey
          ? this.maskSensitiveData(this.decrypt(config.volcengineSecretAccessKey))
          : null,
        jimengApiKey: config.jimengApiKey ? this.maskSensitiveData(this.decrypt(config.jimengApiKey)) : null,
        klingApiKey: config.klingApiKey ? this.maskSensitiveData(this.decrypt(config.klingApiKey)) : null,
      };
      
      console.log('✅ 成功返回配置');
      return result;
    } catch (error) {
      console.error('❌ 获取配置失败:', error.message);
      console.error('   错误栈:', error.stack);
      throw error;
    }
  }

  decrypt(text) {
    try {
      const parts = text.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      const decipher = createDecipheriv(this.algorithm, this.encryptionKey, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('解密失败:', error.message);
      return '';
    }
  }

  maskSensitiveData(data) {
    if (!data || data.length < 8) {
      return '****';
    }
    const start = data.substring(0, 4);
    const end = data.substring(data.length - 4);
    return `${start}****${end}`;
  }
}

async function test() {
  const service = new TestVideoAPIConfigService();
  try {
    const result = await service.getCurrentConfig();
    console.log('\n✅ 测试成功！');
    console.log('返回的配置:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();

