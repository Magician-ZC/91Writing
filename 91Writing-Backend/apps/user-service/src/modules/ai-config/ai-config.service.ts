import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import {
  CreateUserAIConfigDto,
  UpdateUserAIConfigDto,
  UserAIConfigResponseDto,
  AvailableAIConfigsResponseDto,
  SystemAIModelDto,
  AITier,
} from '@app/common/dto/ai-config.dto';
import * as crypto from 'crypto';

@Injectable()
export class UserAIConfigService {
  private readonly ENCRYPTION_KEY = process.env.AI_CONFIG_ENCRYPTION_KEY || 'your-32-character-encryption-key!!';
  private readonly ALGORITHM = 'aes-256-cbc';

  constructor(private prisma: PrismaService) {}

  /**
   * 获取用户可用的所有AI配置（全局+自定义）
   */
  async getAvailableConfigs(userId: string): Promise<AvailableAIConfigsResponseDto> {
    // 1. 获取用户信息（会员等级）
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 2. 获取系统全局配置
    const systemConfig = await this.prisma.systemConfig.findUnique({
      where: { configKey: 'ai.global' },
    });

    let systemModels: SystemAIModelDto[] = [];
    if (systemConfig) {
      const configValue = systemConfig.configValue as any;
      systemModels = (configValue.models || []).filter((model: any) => {
        // 根据用户会员等级过滤可用模型
        return this.checkModelAccess(model, user);
      });

      // 解密API密钥（用户不应看到完整密钥）
      systemModels = systemModels.map((model) => ({
        ...model,
        apiKey: this.maskApiKey(this.decrypt(model.apiKey)),
      }));
    }

    // 3. 获取用户自定义配置
    const userConfigs = await this.prisma.userAIConfig.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const userConfigsDto: UserAIConfigResponseDto[] = userConfigs.map((config) => ({
      id: config.id,
      userId: config.userId,
      name: config.name,
      provider: config.provider,
      model: config.model,
      apiUrl: config.apiUrl,
      enabled: config.enabled,
      isDefault: config.isDefault,
      parameters: config.parameters as any,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    }));

    // 4. 确定默认配置
    let defaultConfigId = '';
    const userDefaultConfig = userConfigs.find((c) => c.isDefault);
    if (userDefaultConfig) {
      defaultConfigId = `user:${userDefaultConfig.id}`;
    } else {
      const systemDefaultModel = systemModels.find((m) => m.isDefault);
      if (systemDefaultModel) {
        defaultConfigId = `system:${systemDefaultModel.id}`;
      } else if (systemModels.length > 0) {
        defaultConfigId = `system:${systemModels[0].id}`;
      } else if (userConfigsDto.length > 0) {
        defaultConfigId = `user:${userConfigsDto[0].id}`;
      }
    }

    return {
      system: systemModels,
      user: userConfigsDto,
      default: defaultConfigId,
    };
  }

  /**
   * 获取用户自定义配置列表
   */
  async getUserConfigs(userId: string): Promise<UserAIConfigResponseDto[]> {
    const configs = await this.prisma.userAIConfig.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return configs.map((config) => ({
      id: config.id,
      userId: config.userId,
      name: config.name,
      provider: config.provider,
      model: config.model,
      apiUrl: config.apiUrl,
      enabled: config.enabled,
      isDefault: config.isDefault,
      parameters: config.parameters as any,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    }));
  }

  /**
   * 创建用户自定义配置
   */
  async createConfig(userId: string, dto: CreateUserAIConfigDto): Promise<UserAIConfigResponseDto> {
    // 检查用户权限（可能需要会员才能添加自定义配置）
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // TODO: 根据会员等级限制配置数量
    // if (!user.subscription || user.subscription.status !== 'ACTIVE') {
    //   throw new ForbiddenException('需要会员权限才能添加自定义配置');
    // }

    // 如果设为默认，取消其他默认配置
    if (dto.isDefault) {
      await this.prisma.userAIConfig.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // 加密API密钥
    const encryptedApiKey = this.encrypt(dto.apiKey);

    // 创建配置
    const config = await this.prisma.userAIConfig.create({
      data: {
        userId,
        name: dto.name,
        provider: dto.provider,
        model: dto.model,
        apiUrl: dto.apiUrl,
        apiKey: encryptedApiKey,
        enabled: dto.enabled ?? true,
        isDefault: dto.isDefault ?? false,
        parameters: dto.parameters ? JSON.parse(JSON.stringify(dto.parameters)) : {},
      },
    });

    return {
      id: config.id,
      userId: config.userId,
      name: config.name,
      provider: config.provider,
      model: config.model,
      apiUrl: config.apiUrl,
      enabled: config.enabled,
      isDefault: config.isDefault,
      parameters: config.parameters as any,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }

  /**
   * 更新用户自定义配置
   */
  async updateConfig(
    userId: string,
    configId: string,
    dto: UpdateUserAIConfigDto,
  ): Promise<UserAIConfigResponseDto> {
    // 检查配置是否存在且属于当前用户
    const existingConfig = await this.prisma.userAIConfig.findFirst({
      where: { id: configId, userId },
    });

    if (!existingConfig) {
      throw new NotFoundException('配置不存在');
    }

    // 如果设为默认，取消其他默认配置
    if (dto.isDefault) {
      await this.prisma.userAIConfig.updateMany({
        where: { userId, isDefault: true, id: { not: configId } },
        data: { isDefault: false },
      });
    }

    // 准备更新数据
    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.provider !== undefined) updateData.provider = dto.provider;
    if (dto.model !== undefined) updateData.model = dto.model;
    if (dto.apiUrl !== undefined) updateData.apiUrl = dto.apiUrl;
    if (dto.apiKey !== undefined) updateData.apiKey = this.encrypt(dto.apiKey);
    if (dto.enabled !== undefined) updateData.enabled = dto.enabled;
    if (dto.isDefault !== undefined) updateData.isDefault = dto.isDefault;
    if (dto.parameters !== undefined) updateData.parameters = JSON.parse(JSON.stringify(dto.parameters));

    // 更新配置
    const config = await this.prisma.userAIConfig.update({
      where: { id: configId },
      data: updateData,
    });

    return {
      id: config.id,
      userId: config.userId,
      name: config.name,
      provider: config.provider,
      model: config.model,
      apiUrl: config.apiUrl,
      enabled: config.enabled,
      isDefault: config.isDefault,
      parameters: config.parameters as any,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }

  /**
   * 删除用户自定义配置
   */
  async deleteConfig(userId: string, configId: string): Promise<void> {
    const config = await this.prisma.userAIConfig.findFirst({
      where: { id: configId, userId },
    });

    if (!config) {
      throw new NotFoundException('配置不存在');
    }

    await this.prisma.userAIConfig.delete({
      where: { id: configId },
    });
  }

  /**
   * 设置默认配置
   */
  async setDefaultConfig(userId: string, configId: string): Promise<void> {
    const config = await this.prisma.userAIConfig.findFirst({
      where: { id: configId, userId },
    });

    if (!config) {
      throw new NotFoundException('配置不存在');
    }

    // 取消其他默认配置
    await this.prisma.userAIConfig.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    // 设置新的默认配置
    await this.prisma.userAIConfig.update({
      where: { id: configId },
      data: { isDefault: true },
    });
  }

  /**
   * 检查用户是否有权限访问模型
   */
  private checkModelAccess(model: any, user: any): boolean {
    const tier = model.tier as AITier;

    // 免费用户只能使用FREE层级的模型
    if (!user.subscription || user.subscription.status !== 'ACTIVE') {
      return tier === AITier.FREE;
    }

    // 根据会员套餐判断权限
    // TODO: 完善会员权限逻辑
    return true;
  }

  /**
   * 脱敏API密钥
   */
  private maskApiKey(apiKey: string): string {
    if (apiKey.length <= 8) {
      return '****';
    }
    return apiKey.substring(0, 4) + '****' + apiKey.substring(apiKey.length - 4);
  }

  /**
   * 加密API密钥
   */
  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      this.ALGORITHM,
      Buffer.from(this.ENCRYPTION_KEY.slice(0, 32)),
      iv,
    );
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  /**
   * 解密API密钥
   */
  private decrypt(text: string): string {
    try {
      const parts = text.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const encryptedText = parts[1];
      const decipher = crypto.createDecipheriv(
        this.ALGORITHM,
        Buffer.from(this.ENCRYPTION_KEY.slice(0, 32)),
        iv,
      );
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      return text;
    }
  }
}

