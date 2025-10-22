import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { UpdateVideoAPIConfigDto } from './dto/update-video-api-config.dto';
import { VideoAPIConfigResponseDto, CostStatisticsDto, UserQuotaDto } from './dto/video-api-config-response.dto';

@Injectable()
export class VideoAPIConfigService {
  private readonly logger = new Logger(VideoAPIConfigService.name);
  private readonly encryptionKey: Buffer;
  private readonly algorithm = 'aes-256-cbc';

  constructor(private readonly prisma: PrismaService) {
    // 从环境变量获取加密密钥（32字节）
    const key = process.env.ENCRYPTION_KEY || 'default-32-char-encryption-key!!';
    this.encryptionKey = Buffer.from(key.padEnd(32, '0').slice(0, 32));
    
    this.logger.log('VideoAPIConfig Service initialized');
  }

  /**
   * 获取当前配置
   */
  async getCurrentConfig(): Promise<VideoAPIConfigResponseDto> {
    try {
      this.logger.log('===== 开始获取视频API配置 =====');
      this.logger.log('查询数据库...');
      
      let config = await this.prisma.videoAPIConfig.findFirst({
        where: { id: 'default_config' },
      });

      this.logger.log(`查询结果: ${config ? '找到配置' : '未找到配置'}`);

      if (!config) {
        // 创建默认配置
        this.logger.log('配置不存在，创建默认配置...');
        config = await this.prisma.videoAPIConfig.create({
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
        this.logger.log('✅ 默认视频API配置创建成功');
      }

      this.logger.log('开始处理返回数据...');
      this.logger.log(`配置ID: ${config.id}, Provider: ${config.videoProvider}`);
      
      // 解密敏感信息并脱敏显示
      const result = {
        ...config,
        volcengineSecretAccessKey: config.volcengineSecretAccessKey
          ? this.maskSensitiveData(this.decrypt(config.volcengineSecretAccessKey))
          : null,
        jimengApiKey: config.jimengApiKey ? this.maskSensitiveData(this.decrypt(config.jimengApiKey)) : null,
        klingApiKey: config.klingApiKey ? this.maskSensitiveData(this.decrypt(config.klingApiKey)) : null,
      };
      
      this.logger.log('===== 配置获取成功，准备返回 =====');
      return result;
    } catch (error) {
      this.logger.error('❌❌❌ 获取配置失败:', error.message);
      this.logger.error('错误栈:', error.stack);
      throw error;
    }
  }

  /**
   * 获取完整配置（不脱敏，用于内部服务）
   */
  async getFullConfig() {
    let config = await this.prisma.videoAPIConfig.findFirst({
      where: { id: 'default_config' },
    });

    if (!config) {
      config = await this.prisma.videoAPIConfig.create({
        data: {
          id: 'default_config',
          videoProvider: 'jimeng',
        },
      });
    }

    // 解密敏感信息
    return {
      ...config,
      volcengineSecretAccessKey: config.volcengineSecretAccessKey
        ? this.decrypt(config.volcengineSecretAccessKey)
        : null,
      jimengApiKey: config.jimengApiKey ? this.decrypt(config.jimengApiKey) : null,
      klingApiKey: config.klingApiKey ? this.decrypt(config.klingApiKey) : null,
    };
  }

  /**
   * 更新配置（管理员）
   */
  async updateConfig(adminId: string, data: UpdateVideoAPIConfigDto): Promise<VideoAPIConfigResponseDto> {
    // 加密敏感字段
    const encrypted: any = {
      ...data,
      updatedBy: adminId,
    };

    if (data.volcengineSecretAccessKey) {
      encrypted.volcengineSecretAccessKey = this.encrypt(data.volcengineSecretAccessKey);
    }
    if (data.jimengApiKey) {
      encrypted.jimengApiKey = this.encrypt(data.jimengApiKey);
    }
    if (data.klingApiKey) {
      encrypted.klingApiKey = this.encrypt(data.klingApiKey);
    }

    // 移除未定义的字段
    Object.keys(encrypted).forEach(key => encrypted[key] === undefined && delete encrypted[key]);

    const updated = await this.prisma.videoAPIConfig.update({
      where: { id: 'default_config' },
      data: encrypted,
    });

    this.logger.log(`Video API config updated by admin: ${adminId}`);

    return this.getCurrentConfig();
  }

  /**
   * 检查用户配额
   */
  async checkUserQuota(userId: string): Promise<UserQuotaDto> {
    const now = new Date();
    
    // 获取或创建用户配额记录
    let quota = await this.prisma.userVideoQuota.findUnique({
      where: { userId },
    });

    if (!quota) {
      const config = await this.getFullConfig();
      quota = await this.prisma.userVideoQuota.create({
        data: {
          userId,
          dailyLimit: config.userDailyQuota,
          dailyUsed: 0,
          dailyResetAt: this.getNextDayStart(),
          monthlyLimit: config.userMonthlyQuota,
          monthlyUsed: 0,
          monthlyResetAt: this.getNextMonthStart(),
        },
      });
    }

    // 检查是否需要重置
    if (now >= quota.dailyResetAt) {
      quota = await this.prisma.userVideoQuota.update({
        where: { userId },
        data: {
          dailyUsed: 0,
          dailyResetAt: this.getNextDayStart(),
        },
      });
    }

    if (now >= quota.monthlyResetAt) {
      quota = await this.prisma.userVideoQuota.update({
        where: { userId },
        data: {
          monthlyUsed: 0,
          monthlyResetAt: this.getNextMonthStart(),
        },
      });
    }

    // 检查配额
    const dailyAvailable = quota.dailyUsed < quota.dailyLimit;
    const monthlyAvailable = quota.monthlyUsed < quota.monthlyLimit;
    const available = dailyAvailable && monthlyAvailable;

    return {
      available,
      dailyRemaining: Math.max(0, quota.dailyLimit - quota.dailyUsed),
      monthlyRemaining: Math.max(0, quota.monthlyLimit - quota.monthlyUsed),
      dailyLimit: quota.dailyLimit,
      monthlyLimit: quota.monthlyLimit,
      dailyResetAt: quota.dailyResetAt,
      monthlyResetAt: quota.monthlyResetAt,
    };
  }

  /**
   * 消费配额
   */
  async consumeQuota(userId: string): Promise<void> {
    await this.prisma.userVideoQuota.update({
      where: { userId },
      data: {
        dailyUsed: { increment: 1 },
        monthlyUsed: { increment: 1 },
        totalGenerated: { increment: 1 },
      },
    });

    this.logger.log(`User ${userId} consumed video quota`);
  }

  /**
   * 记录API使用
   */
  async logApiUsage(log: {
    userId: string;
    chapterId: string;
    provider: string;
    apiType: string;
    requestCost: number;
    success: boolean;
    errorMessage?: string;
  }): Promise<void> {
    await this.prisma.videoAPIUsageLog.create({
      data: log,
    });

    // 更新用户总成本
    if (log.success) {
      await this.prisma.userVideoQuota.update({
        where: { userId: log.userId },
        data: {
          totalCost: { increment: log.requestCost },
        },
      });
    }

    this.logger.log(`API usage logged: ${log.provider} - ${log.apiType} - ${log.success ? 'Success' : 'Failed'}`);
  }

  /**
   * 获取成本统计
   */
  async getCostStatistics(startDate: Date, endDate: Date): Promise<CostStatisticsDto> {
    const logs = await this.prisma.videoAPIUsageLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalCost = logs.reduce((sum, log) => sum + log.requestCost, 0);
    const successCount = logs.filter(log => log.success).length;
    const failureCount = logs.length - successCount;
    const successRate = logs.length > 0 ? (successCount / logs.length) * 100 : 0;

    // 获取月度预算
    const config = await this.getFullConfig();
    const monthlyBudget = config.monthlyBudget;
    const remainingBudget = Math.max(0, monthlyBudget - totalCost);
    const budgetUsagePercentage = monthlyBudget > 0 ? (totalCost / monthlyBudget) * 100 : 0;

    return {
      totalCost,
      totalRequests: logs.length,
      successCount,
      failureCount,
      successRate: Math.round(successRate * 100) / 100,
      monthlyBudget,
      remainingBudget,
      budgetUsagePercentage: Math.round(budgetUsagePercentage * 100) / 100,
    };
  }

  /**
   * 测试Provider连接
   */
  async testProviderConnection(provider: 'volcengine' | 'jimeng' | 'kling'): Promise<{
    success: boolean;
    message: string;
  }> {
    const config = await this.getFullConfig();

    try {
      switch (provider) {
        case 'volcengine':
          if (!config.volcengineAccessKeyId || !config.volcengineSecretAccessKey) {
            return {
              success: false,
              message: '火山引擎API密钥未配置',
            };
          }
          // 这里应该调用实际的API健康检查
          return {
            success: true,
            message: '火山引擎连接正常（模拟）',
          };

        case 'jimeng':
          if (!config.jimengApiKey) {
            return {
              success: false,
              message: '即梦API密钥未配置',
            };
          }
          return {
            success: true,
            message: '即梦连接正常（模拟）',
          };

        case 'kling':
          if (!config.klingApiKey) {
            return {
              success: false,
              message: '可灵API密钥未配置',
            };
          }
          return {
            success: true,
            message: '可灵连接正常（模拟）',
          };

        default:
          return {
            success: false,
            message: '未知的Provider',
          };
      }
    } catch (error) {
      this.logger.error(`Test ${provider} connection failed:`, error);
      return {
        success: false,
        message: error.message || '连接测试失败',
      };
    }
  }

  /**
   * 加密
   */
  private encrypt(text: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * 解密
   */
  private decrypt(text: string): string {
    try {
      const parts = text.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      const decipher = createDecipheriv(this.algorithm, this.encryptionKey, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      this.logger.error('Decryption failed:', error);
      return '';
    }
  }

  /**
   * 脱敏显示敏感数据
   */
  private maskSensitiveData(data: string): string {
    if (!data || data.length < 8) {
      return '****';
    }
    const start = data.substring(0, 4);
    const end = data.substring(data.length - 4);
    return `${start}****${end}`;
  }

  /**
   * 获取下一天的开始时间
   */
  private getNextDayStart(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }

  /**
   * 获取下个月的开始时间
   */
  private getNextMonthStart(): Date {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    nextMonth.setHours(0, 0, 0, 0);
    return nextMonth;
  }
}

