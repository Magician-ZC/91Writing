import axios, { AxiosInstance } from 'axios';
import { AIProvider } from '@prisma/client';
import {
  BaseAIProvider,
  AIChatMessage,
  AICallConfig,
  AICallResponse,
} from './base.provider';

/**
 * Anthropic Claude API提供商
 * 支持 Claude 3 系列模型
 */
export class ClaudeProvider extends BaseAIProvider {
  readonly provider = AIProvider.CLAUDE;
  private httpClient: AxiosInstance;

  constructor() {
    super();
    this.httpClient = axios.create({
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
    });
  }

  /**
   * 转换消息格式为Claude格式
   */
  private convertMessages(messages: AIChatMessage[]): {
    system?: string;
    messages: Array<{ role: string; content: string }>;
  } {
    // Claude要求第一条消息不能是system，需要单独提取
    const systemMessage = messages.find(msg => msg.role === 'system');
    const userMessages = messages.filter(msg => msg.role !== 'system');

    return {
      system: systemMessage?.content,
      messages: userMessages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      })),
    };
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
      const { system, messages: claudeMessages } = this.convertMessages(messages);

      const requestBody: any = {
        model: config.model,
        messages: claudeMessages,
        max_tokens: parameters.maxTokens || 2000,
        temperature: parameters.temperature,
        top_p: parameters.topP,
        stream: false,
      };

      if (system) {
        requestBody.system = system;
      }

      const response = await this.httpClient.post(
        `${config.apiUrl}/messages`,
        requestBody,
        {
          headers: {
            'x-api-key': config.apiKey,
          },
          timeout: (parameters.timeout || 30) * 1000,
        },
      );

      const data = response.data;
      const usage = data.usage || {};

      return {
        content: data.content[0]?.text || '',
        model: data.model,
        provider: this.provider,
        inputTokens: usage.input_tokens || 0,
        outputTokens: usage.output_tokens || 0,
        totalTokens: (usage.input_tokens || 0) + (usage.output_tokens || 0),
        finishReason: data.stop_reason || 'end_turn',
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
      const { system, messages: claudeMessages } = this.convertMessages(messages);

      const requestBody: any = {
        model: config.model,
        messages: claudeMessages,
        max_tokens: parameters.maxTokens || 2000,
        temperature: parameters.temperature,
        top_p: parameters.topP,
        stream: true,
      };

      if (system) {
        requestBody.system = system;
      }

      const response = await this.httpClient.post(
        `${config.apiUrl}/messages`,
        requestBody,
        {
          headers: {
            'x-api-key': config.apiKey,
          },
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
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'content_block_delta') {
                const content = parsed.delta?.text;
                if (content) {
                  yield content;
                }
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
      console.error('[Claude] Connection test failed:', error);
      return false;
    }
  }
}

