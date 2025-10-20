import axios, { AxiosInstance } from 'axios';
import { AIProvider } from '@prisma/client';
import {
  BaseAIProvider,
  AIChatMessage,
  AICallConfig,
  AICallResponse,
} from './base.provider';

/**
 * 通用AI提供商
 * 支持兼容OpenAI格式的API：
 * - 百度文心一言
 * - 阿里通义千问
 * - 智谱AI
 * - 其他自定义提供商
 */
export class GenericProvider extends BaseAIProvider {
  readonly provider: AIProvider;
  private httpClient: AxiosInstance;

  constructor(provider: AIProvider) {
    super();
    this.provider = provider;
    this.httpClient = axios.create({
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * 发送聊天请求
   */
  async chat(
    messages: AIChatMessage[],
    config: AICallConfig,
  ): Promise<AICallResponse> {
    try {
      const parameters = this.mergeParameters(config.parameters);
      
      const requestBody = {
        model: config.model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: parameters.temperature,
        top_p: parameters.topP,
        max_tokens: parameters.maxTokens,
        stream: false,
      };

      // 某些国内提供商可能需要特殊的认证头
      const headers: any = {};
      if (this.provider === AIProvider.WENXIN) {
        // 文心一言使用access_token
        headers['Authorization'] = `Bearer ${config.apiKey}`;
      } else if (this.provider === AIProvider.QWEN) {
        // 通义千问使用API-Key
        headers['Authorization'] = `Bearer ${config.apiKey}`;
      } else if (this.provider === AIProvider.ZHIPU) {
        // 智谱AI使用Bearer token
        headers['Authorization'] = `Bearer ${config.apiKey}`;
      } else {
        // 自定义提供商默认使用Bearer token
        headers['Authorization'] = `Bearer ${config.apiKey}`;
      }

      const response = await this.httpClient.post(
        `${config.apiUrl}/chat/completions`,
        requestBody,
        {
          headers,
          timeout: (parameters.timeout || 30) * 1000,
        },
      );

      const data = response.data;
      const choice = data.choices[0];
      const usage = data.usage || {};

      return {
        content: choice.message?.content || choice.text || '',
        model: data.model || config.model,
        provider: this.provider,
        inputTokens: usage.prompt_tokens || 0,
        outputTokens: usage.completion_tokens || 0,
        totalTokens: usage.total_tokens || 0,
        finishReason: choice.finish_reason || 'stop',
      };
    } catch (error) {
      this.handleAPIError(error, this.provider);
    }
  }

  /**
   * 流式聊天请求
   */
  async *chatStream(
    messages: AIChatMessage[],
    config: AICallConfig,
  ): AsyncIterableIterator<string> {
    try {
      const parameters = this.mergeParameters(config.parameters);
      
      const requestBody = {
        model: config.model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: parameters.temperature,
        top_p: parameters.topP,
        max_tokens: parameters.maxTokens,
        stream: true,
      };

      const headers: any = {};
      if (this.provider === AIProvider.WENXIN) {
        headers['Authorization'] = `Bearer ${config.apiKey}`;
      } else if (this.provider === AIProvider.QWEN) {
        headers['Authorization'] = `Bearer ${config.apiKey}`;
      } else if (this.provider === AIProvider.ZHIPU) {
        headers['Authorization'] = `Bearer ${config.apiKey}`;
      } else {
        headers['Authorization'] = `Bearer ${config.apiKey}`;
      }

      const response = await this.httpClient.post(
        `${config.apiUrl}/chat/completions`,
        requestBody,
        {
          headers,
          timeout: (parameters.timeout || 30) * 1000,
          responseType: 'stream',
        },
      );

      // 处理流式响应
      for await (const chunk of response.data) {
        const lines = chunk.toString().split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              return;
            }
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || parsed.choices[0]?.text;
              if (content) {
                yield content;
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      this.handleAPIError(error, this.provider);
    }
  }

  /**
   * 测试连接
   */
  async testConnection(config: AICallConfig): Promise<boolean> {
    try {
      const testMessages: AIChatMessage[] = [
        { role: 'user', content: 'Hello' },
      ];

      await this.chat(testMessages, {
        ...config,
        parameters: {
          ...config.parameters,
          maxTokens: 10,
        },
      });

      return true;
    } catch (error) {
      console.error(`[${this.provider}] Connection test failed:`, error);
      return false;
    }
  }
}

