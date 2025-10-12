import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import {
  UpdateSystemAIConfigDto,
  TestAIConfigDto,
  SystemAIModelDto,
  GetSystemAIConfigResponseDto,
} from '@app/common/dto/ai-config.dto';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class AIConfigService {
  private readonly ENCRYPTION_KEY = process.env.AI_CONFIG_ENCRYPTION_KEY || 'your-32-character-encryption-key!!';
  private readonly ALGORITHM = 'aes-256-cbc';
  private readonly CONFIG_KEY = 'ai.global';

  constructor(private prisma: PrismaService) {}

  /**
   * 获取系统全局AI配置
   */
  async getSystemConfig(): Promise<GetSystemAIConfigResponseDto> {
    const config = await this.prisma.systemConfig.findUnique({
      where: { configKey: this.CONFIG_KEY },
    });

    if (!config) {
      // 返回默认配置
      return {
        models: [],
      };
    }

    const configValue = config.configValue as any;
    const models = configValue.models || [];

    // 解密API密钥
    const decryptedModels = models.map((model: any) => ({
      ...model,
      apiKey: this.decrypt(model.apiKey),
    }));

    return {
      models: decryptedModels,
    };
  }

  /**
   * 更新系统全局AI配置
   */
  async updateSystemConfig(dto: UpdateSystemAIConfigDto): Promise<GetSystemAIConfigResponseDto> {
    // 验证配置
    this.validateConfig(dto);

    // 加密API密钥
    const encryptedModels = dto.models.map((model) => ({
      ...model,
      apiKey: this.encrypt(model.apiKey),
    }));

    // 保存到数据库
    await this.prisma.systemConfig.upsert({
      where: { configKey: this.CONFIG_KEY },
      create: {
        configKey: this.CONFIG_KEY,
        configValue: JSON.parse(JSON.stringify({ models: encryptedModels })),
        description: '全局AI模型配置',
      },
      update: {
        configValue: JSON.parse(JSON.stringify({ models: encryptedModels })),
      },
    });

    return this.getSystemConfig();
  }

  /**
   * 测试AI配置连接
   */
  async testConfig(dto: TestAIConfigDto): Promise<{
    success: boolean;
    message: string;
    responseTime?: number;
  }> {
    const startTime = Date.now();

    try {
      // 构建测试请求
      const testMessage = {
        role: 'user',
        content: 'Hello, this is a test message.',
      };

      let response;
      
      switch (dto.provider) {
        case 'OPENAI':
          response = await this.testOpenAI(dto, testMessage);
          break;
        case 'CLAUDE':
          response = await this.testClaude(dto, testMessage);
          break;
        case 'WENXIN':
          response = await this.testWenxin(dto, testMessage);
          break;
        case 'QWEN':
          response = await this.testQwen(dto, testMessage);
          break;
        case 'ZHIPU':
          response = await this.testZhipu(dto, testMessage);
          break;
        default:
          throw new BadRequestException('不支持的AI服务商');
      }

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        message: '连接测试成功',
        responseTime,
      };
    } catch (error) {
      return {
        success: false,
        message: `连接测试失败: ${error.message}`,
      };
    }
  }

  /**
   * 测试OpenAI连接
   */
  private async testOpenAI(dto: TestAIConfigDto, message: any) {
    // 确保URL以http或https开头
    let baseUrl = dto.apiUrl;
    if (!baseUrl.startsWith('http')) {
      baseUrl = `https://${baseUrl}`;
    }
    
    // 移除末尾的斜杠
    baseUrl = baseUrl.replace(/\/+$/, '');
    
    // 如果URL不包含chat/completions，则添加它
    let url = baseUrl;
    if (!url.includes('/chat/completions')) {
      // 如果以/v1结尾，直接添加/chat/completions
      if (url.endsWith('/v1')) {
        url = `${url}/chat/completions`;
      } else if (!url.includes('/v1')) {
        // 如果不包含/v1，添加/v1/chat/completions
        url = `${url}/v1/chat/completions`;
      } else {
        // 其他情况（如已经包含/v1/但不以它结尾），添加chat/completions
        url = `${url}/chat/completions`;
      }
    }

    const response = await axios.post(
      url,
      {
        model: dto.model,
        messages: [message],
        max_tokens: 10,
        temperature: dto.parameters?.temperature || 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${dto.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      },
    );

    return response.data;
  }

  /**
   * 测试Claude连接
   */
  private async testClaude(dto: TestAIConfigDto, message: any) {
    // 确保URL以http或https开头
    let baseUrl = dto.apiUrl;
    if (!baseUrl.startsWith('http')) {
      baseUrl = `https://${baseUrl}`;
    }
    
    // 移除末尾的斜杠
    baseUrl = baseUrl.replace(/\/+$/, '');
    
    // Claude API的消息端点
    let url = baseUrl;
    if (!url.includes('/messages')) {
      // 如果以/v1结尾，直接添加/messages
      if (url.endsWith('/v1')) {
        url = `${url}/messages`;
      } else if (!url.includes('/v1')) {
        // 如果不包含/v1，添加/v1/messages
        url = `${url}/v1/messages`;
      } else {
        // 其他情况，添加messages
        url = `${url}/messages`;
      }
    }

    const response = await axios.post(
      url,
      {
        model: dto.model,
        messages: [message],
        max_tokens: 10,
        temperature: dto.parameters?.temperature || 0.7,
      },
      {
        headers: {
          'x-api-key': dto.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      },
    );

    return response.data;
  }

  /**
   * 测试文心一言连接
   */
  private async testWenxin(dto: TestAIConfigDto, message: any) {
    const url = dto.apiUrl.startsWith('http') 
      ? dto.apiUrl 
      : `https://${dto.apiUrl}`;

    const response = await axios.post(
      url,
      {
        messages: [message],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          access_token: dto.apiKey,
        },
        timeout: 10000,
      },
    );

    return response.data;
  }

  /**
   * 测试通义千问连接
   */
  private async testQwen(dto: TestAIConfigDto, message: any) {
    const url = dto.apiUrl.startsWith('http') 
      ? dto.apiUrl 
      : `https://${dto.apiUrl}`;

    const response = await axios.post(
      url,
      {
        model: dto.model,
        input: {
          messages: [message],
        },
        parameters: {
          result_format: 'message',
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${dto.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      },
    );

    return response.data;
  }

  /**
   * 测试智谱AI连接
   */
  private async testZhipu(dto: TestAIConfigDto, message: any) {
    const url = dto.apiUrl.startsWith('http') 
      ? dto.apiUrl 
      : `https://${dto.apiUrl}`;

    const response = await axios.post(
      url,
      {
        model: dto.model,
        messages: [message],
      },
      {
        headers: {
          'Authorization': dto.apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      },
    );

    return response.data;
  }

  /**
   * 验证配置
   */
  private validateConfig(dto: UpdateSystemAIConfigDto) {
    const { models } = dto;

    // 检查是否有重复的ID
    const ids = models.map((m) => m.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      throw new BadRequestException('模型ID不能重复');
    }

    // 检查默认模型
    const defaultModels = models.filter((m) => m.isDefault);
    if (defaultModels.length > 1) {
      throw new BadRequestException('只能有一个默认模型');
    }

    // 验证每个模型配置
    models.forEach((model) => {
      if (!model.name || !model.provider || !model.model || !model.apiUrl || !model.apiKey) {
        throw new BadRequestException(`模型 ${model.id} 配置不完整`);
      }
    });
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
      // 如果解密失败，可能是未加密的密钥，直接返回
      return text;
    }
  }
}

