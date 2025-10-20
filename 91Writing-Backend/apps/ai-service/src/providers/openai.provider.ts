import axios, { AxiosInstance } from 'axios';
import { AIProvider } from '@prisma/client';
import {
  BaseAIProvider,
  AIChatMessage,
  AICallConfig,
  AICallResponse,
} from './base.provider';

/**
 * OpenAI API提供商
 * 支持 GPT-3.5, GPT-4 等模型
 */
export class OpenAIProvider extends BaseAIProvider {
  readonly provider = AIProvider.OPENAI;
  private httpClient: AxiosInstance;

  constructor() {
    super();
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
        frequency_penalty: parameters.frequencyPenalty,
        presence_penalty: parameters.presencePenalty,
        max_tokens: parameters.maxTokens,
        stream: false,
      };

      const response = await this.httpClient.post(
        `${config.apiUrl}/chat/completions`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
          },
          timeout: (parameters.timeout || 30) * 1000,
        },
      );

      const data = response.data;
      const choice = data.choices[0];
      const usage = data.usage || {};

      return {
        content: choice.message.content,
        model: data.model,
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
        frequency_penalty: parameters.frequencyPenalty,
        presence_penalty: parameters.presencePenalty,
        max_tokens: parameters.maxTokens,
        stream: true,
      };

      const response = await this.httpClient.post(
        `${config.apiUrl}/chat/completions`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
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
            if (data === '[DONE]') {
              return;
            }
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
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
      console.error('[OpenAI] Connection test failed:', error);
      return false;
    }
  }
}

