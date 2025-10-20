import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { AIProvider } from '@prisma/client';
import { AIProviderFactory } from '../providers/provider.factory';
import {
  AIChatMessage,
  AICallConfig,
  AICallResponse,
} from '../providers/base.provider';
import { AIModelParametersDto } from '@app/common/dto/ai-config.dto';
import * as crypto from 'crypto';

/**
 * AI调用请求
 */
export interface AICallRequest {
  userId: string;
  messages: AIChatMessage[];
  configId?: string; // 格式: system:id 或 user:id
  parameters?: AIModelParametersDto;
  stream?: boolean;
}

/**
 * AI调用器服务
 * 负责管理AI配置和调用AI提供商
 */
@Injectable()
export class AICallerService {
  // 加密密钥（应该从环境变量读取）
  private readonly encryptionKey: string;
  private readonly algorithm = 'aes-256-cbc';

  constructor(
    private readonly prisma: PrismaService,
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
  ) {
    // 从环境变量读取加密密钥，如果没有则使用默认值（生产环境必须配置）
    this.encryptionKey =
      process.env.ENCRYPTION_KEY || '91writing-ai-config-encryption-key-32';
    
    // 确保密钥长度为32字节
    if (Buffer.from(this.encryptionKey).length !== 32) {
      console.warn('⚠️  ENCRYPTION_KEY长度不是32字节，将进行填充/截断');
      this.encryptionKey = this.encryptionKey.padEnd(32, '0').slice(0, 32);
    }
  }

  /**
   * 调用AI服务（带重试和降级）
   */
  async callAI(request: AICallRequest): Promise<AICallResponse> {
    const maxRetries = 3; // 最大重试次数
    const baseDelay = 1000; // 基础延迟（毫秒）
    
    let lastError: any;
    let attempt = 0;

    // 重试循环
    while (attempt < maxRetries) {
      try {
        attempt++;
        
        // 1. 获取AI配置
        const config = await this.getAIConfig(request.userId, request.configId);

        // 2. 合并参数
        const finalParameters = {
          ...config.parameters,
          ...request.parameters,
          stream: request.stream || false,
        };

        const callConfig: AICallConfig = {
          provider: config.provider,
          model: config.model,
          apiUrl: config.apiUrl,
          apiKey: config.apiKey,
          parameters: finalParameters,
        };

        // 3. 获取对应的AI提供商
        const provider = AIProviderFactory.getProvider(config.provider);

        // 4. 调用AI服务
        const startTime = Date.now();
        const response = await provider.chat(request.messages, callConfig);
        
        // 5. 记录使用日志
        await this.logAIUsage(
          request.userId,
          config.model,
          response.inputTokens,
          response.outputTokens,
          true,
          Date.now() - startTime,
        );

        return response;
      } catch (error) {
        lastError = error;
        
        console.error(`[AI调用] 第${attempt}次尝试失败:`, error.message);

        // 如果还有重试机会，等待后重试
        if (attempt < maxRetries) {
          // 指数退避策略
          const delay = baseDelay * Math.pow(2, attempt - 1);
          console.log(`[AI调用] 等待${delay}ms后重试...`);
          await this.sleep(delay);
          continue;
        }

        // 如果重试次数用完，尝试降级策略
        if (attempt >= maxRetries) {
          console.log('[AI调用] 重试次数用完，尝试降级策略...');
          
          try {
            const fallbackResponse = await this.tryFallbackStrategy(
              request.userId,
              request.messages,
            );
            
            if (fallbackResponse) {
              return fallbackResponse;
            }
          } catch (fallbackError) {
            console.error('[AI调用] 降级策略也失败:', fallbackError.message);
          }
        }
      }
    }

    // 所有尝试都失败，记录日志并抛出异常
    await this.logAIUsage(
      request.userId,
      'unknown',
      0,
      0,
      false,
      0,
      lastError?.message || '未知错误',
    );

    throw new HttpException(
      {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: `AI调用失败，已重试${maxRetries}次: ${lastError?.message || '未知错误'}`,
        error: 'AI_SERVICE_UNAVAILABLE',
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }

  /**
   * 尝试降级策略
   * 切换到备用模型
   */
  private async tryFallbackStrategy(
    userId: string,
    messages: AIChatMessage[],
  ): Promise<AICallResponse | null> {
    // 获取所有可用的AI配置
    const availableConfigs = await this.getAllAvailableConfigs(userId);
    
    if (availableConfigs.length === 0) {
      return null;
    }

    // 尝试使用第一个可用的配置
    for (const config of availableConfigs) {
      try {
        console.log(`[降级策略] 尝试使用备用配置: ${config.provider}/${config.model}`);
        
        const callConfig: AICallConfig = {
          provider: config.provider,
          model: config.model,
          apiUrl: config.apiUrl,
          apiKey: config.apiKey,
          parameters: config.parameters,
        };

        const provider = AIProviderFactory.getProvider(config.provider);
        const startTime = Date.now();
        const response = await provider.chat(messages, callConfig);
        
        // 记录降级使用日志
        await this.logAIUsage(
          userId,
          config.model,
          response.inputTokens,
          response.outputTokens,
          true,
          Date.now() - startTime,
        );

        console.log(`[降级策略] 成功使用备用配置: ${config.provider}/${config.model}`);
        return response;
      } catch (error) {
        console.error(`[降级策略] 备用配置失败: ${error.message}`);
        continue;
      }
    }

    return null;
  }

  /**
   * 获取所有可用的AI配置（用于降级）
   */
  private async getAllAvailableConfigs(userId: string): Promise<any[]> {
    const configs: any[] = [];

    // 获取用户的所有启用配置
    const userConfigs = await this.prisma.userAIConfig.findMany({
      where: {
        userId,
        enabled: true,
      },
      orderBy: {
        isDefault: 'desc', // 默认配置优先
      },
    });

    for (const config of userConfigs) {
      configs.push({
        provider: config.provider,
        model: config.model,
        apiUrl: config.apiUrl,
        apiKey: this.decrypt(config.apiKey),
        parameters: config.parameters as AIModelParametersDto,
      });
    }

    // 获取系统配置
    try {
      const systemConfigRecord = await this.prisma.systemConfig.findFirst({
        where: {
          configKey: 'ai_models',
        },
      });

      if (systemConfigRecord) {
        const models = systemConfigRecord.configValue as any[];
        for (const model of models) {
          if (model.enabled) {
            configs.push({
              provider: model.provider,
              model: model.model,
              apiUrl: model.apiUrl,
              apiKey: model.apiKey,
              parameters: model.parameters || {},
            });
          }
        }
      }
    } catch (error) {
      console.error('获取系统配置失败:', error);
    }

    return configs;
  }

  /**
   * 延迟函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 流式调用AI服务
   */
  async *callAIStream(request: AICallRequest): AsyncIterableIterator<string> {
    // 1. 获取AI配置
    const config = await this.getAIConfig(request.userId, request.configId);

    // 2. 合并参数
    const finalParameters = {
      ...config.parameters,
      ...request.parameters,
      stream: true,
    };

    const callConfig: AICallConfig = {
      provider: config.provider,
      model: config.model,
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      parameters: finalParameters,
    };

    // 3. 获取对应的AI提供商
    const provider = AIProviderFactory.getProvider(config.provider);

    // 4. 流式调用
    const startTime = Date.now();
    let success = true;
    let errorMessage: string | undefined;

    try {
      for await (const chunk of provider.chatStream(request.messages, callConfig)) {
        yield chunk;
      }
    } catch (error) {
      success = false;
      errorMessage = error.message;
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `AI流式调用失败: ${error.message}`,
          error: 'AI_STREAM_CALL_FAILED',
        },
        HttpStatus.BAD_REQUEST,
      );
    } finally {
      // 记录日志（流式调用无法获取准确的token数量）
      await this.logAIUsage(
        request.userId,
        config.model,
        0,
        0,
        success,
        Date.now() - startTime,
        errorMessage,
      );
    }
  }

  /**
   * 测试AI配置
   */
  async testAIConfig(
    provider: AIProvider,
    model: string,
    apiUrl: string,
    apiKey: string,
    parameters?: AIModelParametersDto,
  ): Promise<boolean> {
    const config: AICallConfig = {
      provider,
      model,
      apiUrl,
      apiKey,
      parameters,
    };

    const providerInstance = AIProviderFactory.getProvider(provider);
    return providerInstance.testConnection(config);
  }

  /**
   * 获取AI配置
   */
  private async getAIConfig(
    userId: string,
    configId?: string,
  ): Promise<{
    provider: AIProvider;
    model: string;
    apiUrl: string;
    apiKey: string;
    parameters: AIModelParametersDto;
  }> {
    // 如果没有指定配置ID，则使用默认配置
    if (!configId) {
      return this.getDefaultConfig(userId);
    }

    // 解析配置ID
    const [type, id] = configId.split(':');

    if (type === 'user') {
      // 用户自定义配置
      return this.getUserConfig(userId, id);
    } else if (type === 'system') {
      // 系统全局配置
      return this.getSystemConfig(id);
    } else {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: '无效的配置ID格式',
          error: 'INVALID_CONFIG_ID',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * 获取默认配置
   */
  private async getDefaultConfig(userId: string): Promise<any> {
    // 先查找用户的默认配置
    const userConfig = await this.prisma.userAIConfig.findFirst({
      where: {
        userId,
        enabled: true,
        isDefault: true,
      },
    });

    if (userConfig) {
      return {
        provider: userConfig.provider,
        model: userConfig.model,
        apiUrl: userConfig.apiUrl,
        apiKey: this.decrypt(userConfig.apiKey),
        parameters: userConfig.parameters as AIModelParametersDto,
      };
    }

    // 如果没有用户默认配置，使用系统默认配置
    const systemConfig = await this.getSystemDefaultConfig();
    if (systemConfig) {
      return systemConfig;
    }

    throw new HttpException(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: '未找到可用的AI配置，请先配置AI服务',
        error: 'NO_AI_CONFIG_AVAILABLE',
      },
      HttpStatus.NOT_FOUND,
    );
  }

  /**
   * 获取用户配置
   */
  private async getUserConfig(userId: string, configId: string): Promise<any> {
    const config = await this.prisma.userAIConfig.findFirst({
      where: {
        id: configId,
        userId,
        enabled: true,
      },
    });

    if (!config) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: '未找到指定的AI配置或配置已禁用',
          error: 'CONFIG_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      provider: config.provider,
      model: config.model,
      apiUrl: config.apiUrl,
      apiKey: this.decrypt(config.apiKey),
      parameters: config.parameters as AIModelParametersDto,
    };
  }

  /**
   * 获取系统配置
   */
  private async getSystemConfig(configId: string): Promise<any> {
    // 从系统配置表读取
    const systemConfigRecord = await this.prisma.systemConfig.findFirst({
      where: {
        configKey: 'ai_models',
      },
    });

    if (!systemConfigRecord) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: '系统AI配置不存在',
          error: 'SYSTEM_CONFIG_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const models = systemConfigRecord.configValue as any[];
    const config = models.find(m => m.id === configId && m.enabled);

    if (!config) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: '未找到指定的系统AI配置或配置已禁用',
          error: 'SYSTEM_CONFIG_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      provider: config.provider,
      model: config.model,
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      parameters: config.parameters || {},
    };
  }

  /**
   * 获取系统默认配置
   */
  private async getSystemDefaultConfig(): Promise<any | null> {
    const systemConfigRecord = await this.prisma.systemConfig.findFirst({
      where: {
        configKey: 'ai_models',
      },
    });

    if (!systemConfigRecord) {
      return null;
    }

    const models = systemConfigRecord.configValue as any[];
    const defaultConfig = models.find(m => m.enabled && m.isDefault);

    if (!defaultConfig) {
      return null;
    }

    return {
      provider: defaultConfig.provider,
      model: defaultConfig.model,
      apiUrl: defaultConfig.apiUrl,
      apiKey: defaultConfig.apiKey,
      parameters: defaultConfig.parameters || {},
    };
  }

  /**
   * 记录AI使用日志
   */
  private async logAIUsage(
    userId: string,
    model: string,
    inputTokens: number,
    outputTokens: number,
    success: boolean,
    responseTime: number,
    errorMessage?: string,
  ): Promise<void> {
    try {
      await this.prisma.aIUsageLog.create({
        data: {
          userId,
          model,
          functionType: 'content_generation',
          inputTokens,
          outputTokens,
          success,
          responseTime,
        },
      });
    } catch (error) {
      console.error('记录AI使用日志失败:', error);
    }
  }

  /**
   * 解密API密钥
   */
  private decrypt(encryptedText: string): string {
    try {
      const [ivHex, encryptedHex] = encryptedText.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const encrypted = Buffer.from(encryptedHex, 'hex');
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        Buffer.from(this.encryptionKey),
        iv,
      );
      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString();
    } catch (error) {
      console.error('解密API密钥失败:', error);
      throw new Error('API密钥解密失败');
    }
  }
}

