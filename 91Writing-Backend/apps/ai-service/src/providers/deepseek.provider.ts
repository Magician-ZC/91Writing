import axios, { AxiosInstance } from 'axios';
import { AIProvider } from '@prisma/client';
import {
  BaseAIProvider,
  AIChatMessage,
  AICallConfig,
  AICallResponse,
} from './base.provider';

/**
 * DeepSeek API提供商
 * 支持 DeepSeek-Chat, DeepSeek-Coder 等模型
 * API格式兼容 OpenAI
 */
export class DeepSeekProvider extends BaseAIProvider {
  readonly provider = AIProvider.DEEPSEEK;
  private httpClient: AxiosInstance;

  constructor() {
    super();
    this.httpClient = axios.create({
      timeout: 60000, // 连接timeout 60秒
      maxContentLength: Infinity, // 流式响应可能很大
      maxBodyLength: Infinity,
      headers: {
        'Content-Type': 'application/json',
      },
      validateStatus: (status) => status >= 200 && status < 300,
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

      console.log('[DEEPSEEK] 发送请求到:', `${config.apiUrl}/chat/completions`)
      console.log('[DEEPSEEK] 请求参数:', { model: requestBody.model, max_tokens: requestBody.max_tokens })
      
      const response = await this.httpClient.post(
        `${config.apiUrl}/chat/completions`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
          },
          timeout: 60000, // 首次连接60秒足够，流式输出会持续接收
        },
      )
      
      console.log('[DEEPSEEK] 响应状态:', response.status)
      console.log('[DEEPSEEK] 内容长度:', response.data?.choices?.[0]?.message?.content?.length || 0);

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

      console.log('[DEEPSEEK] 发送流式请求到:', `${config.apiUrl}/chat/completions`)
      
      const response = await this.httpClient.post(
        `${config.apiUrl}/chat/completions`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
          },
          timeout: 0, // 流式请求不设timeout，持续接收数据
          responseType: 'stream',
        },
      )
      
      console.log('[DEEPSEEK] 流式响应开始，逐字符接收...');

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
      console.error('[DeepSeek] Connection test failed:', error);
      return false;
    }
  }
}

