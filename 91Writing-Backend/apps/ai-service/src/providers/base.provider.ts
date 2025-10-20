import { AIProvider } from '@prisma/client';
import { AIModelParametersDto } from '@app/common/dto/ai-config.dto';

/**
 * AI聊天消息
 */
export interface AIChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * AI调用配置
 */
export interface AICallConfig {
  provider: AIProvider;
  model: string;
  apiUrl: string;
  apiKey: string;
  parameters?: AIModelParametersDto;
}

/**
 * AI调用响应
 */
export interface AICallResponse {
  content: string;
  model: string;
  provider: AIProvider;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  finishReason: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * AI提供商基类
 */
export abstract class BaseAIProvider {
  abstract readonly provider: AIProvider;

  /**
   * 发送聊天请求
   */
  abstract chat(
    messages: AIChatMessage[],
    config: AICallConfig,
  ): Promise<AICallResponse>;

  /**
   * 流式聊天请求
   */
  abstract chatStream(
    messages: AIChatMessage[],
    config: AICallConfig,
  ): AsyncIterableIterator<string>;

  /**
   * 测试连接
   */
  abstract testConnection(config: AICallConfig): Promise<boolean>;

  /**
   * 获取默认参数
   */
  protected getDefaultParameters(): AIModelParametersDto {
    return {
      temperature: 0.7,
      topP: 1.0,
      frequencyPenalty: 0,
      presencePenalty: 0,
      maxTokens: 2000,
      timeout: 30,
      stream: false,
    };
  }

  /**
   * 合并参数
   */
  protected mergeParameters(
    userParams?: AIModelParametersDto,
  ): AIModelParametersDto {
    return {
      ...this.getDefaultParameters(),
      ...userParams,
    };
  }

  /**
   * 处理HTTP请求错误
   */
  protected handleAPIError(error: any, provider: AIProvider): never {
    console.error(`[${provider}] API Error:`, error);

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401) {
        throw new Error(`[${provider}] API密钥无效或已过期`);
      } else if (status === 429) {
        throw new Error(`[${provider}] 请求频率超限，请稍后重试`);
      } else if (status === 500) {
        throw new Error(`[${provider}] 服务器内部错误`);
      } else if (status === 503) {
        throw new Error(`[${provider}] 服务暂时不可用`);
      } else {
        throw new Error(
          `[${provider}] API调用失败: ${data?.error?.message || data?.message || '未知错误'}`,
        );
      }
    } else if (error.request) {
      throw new Error(`[${provider}] 网络请求失败，请检查API地址和网络连接`);
    } else {
      throw new Error(`[${provider}] 请求配置错误: ${error.message}`);
    }
  }
}

