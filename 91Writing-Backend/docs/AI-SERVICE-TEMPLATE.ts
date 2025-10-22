/**
 * AI功能开发模板
 * 
 * 使用方法：
 * 1. 复制此模板到你的新服务文件
 * 2. 修改类名、方法名和业务逻辑
 * 3. 确保遵循 AICallerService 调用规范
 */

import { Injectable } from '@nestjs/common';
import { AICallerService } from '../../services/ai-caller.service';
import { AIChatMessage } from '../../providers/base.provider';

// DTO 定义
export class YourAIDto {
  prompt: string;                  // 用户输入
  aiConfigId?: string;             // ⭐ 重要：让用户选择AI配置
  parameters?: {
    temperature?: number;
    maxTokens?: number;
  };
}

@Injectable()
export class YourAIService {
  constructor(
    private readonly aiCallerService: AICallerService,  // ✅ 注入 AICallerService
  ) {}

  /**
   * 示例1：基础AI调用
   */
  async basicAICall(userId: string, dto: YourAIDto) {
    // 1. 构建消息
    const messages: AIChatMessage[] = [
      {
        role: 'system',
        content: '你是专业的小说创作助手，擅长XXX'  // ⭐ 修改为你的系统提示词
      },
      {
        role: 'user',
        content: dto.prompt
      }
    ];

    // 2. 调用AI
    const response = await this.aiCallerService.callAI({
      userId,                    // ✅ 必需
      messages,                  // ✅ 必需
      configId: dto.aiConfigId,  // ⭐ 让用户选择配置
      parameters: {
        temperature: dto.parameters?.temperature || 0.7,
        maxTokens: dto.parameters?.maxTokens || 4000,
      },
    });

    // 3. 返回结果
    return {
      content: response.content,
      model: response.model,
      provider: response.provider,
      tokensUsed: response.totalTokens,
    };
  }

  /**
   * 示例2：流式输出（适合长文本生成）
   */
  async *streamAICall(userId: string, dto: YourAIDto): AsyncIterableIterator<string> {
    const messages: AIChatMessage[] = [
      {
        role: 'system',
        content: '你是专业的内容生成助手'
      },
      {
        role: 'user',
        content: dto.prompt
      }
    ];

    // ⭐ 使用 callAIStream
    for await (const chunk of this.aiCallerService.callAIStream({
      userId,
      messages,
      configId: dto.aiConfigId,
      parameters: {
        temperature: 0.8,
        maxTokens: 4000,
      },
      stream: true,  // ⭐ 必须设置
    })) {
      yield chunk;
    }
  }

  /**
   * 示例3：结构化输出（JSON）
   */
  async structuredAICall(userId: string, dto: YourAIDto) {
    const messages: AIChatMessage[] = [
      {
        role: 'system',
        content: '你是分析助手，只返回JSON格式结果。'
      },
      {
        role: 'user',
        content: `
分析以下内容：${dto.prompt}

返回JSON格式：
{
  "analysis": "分析结果",
  "score": 85,
  "suggestions": ["建议1", "建议2"]
}
        `.trim()
      }
    ];

    const response = await this.aiCallerService.callAI({
      userId,
      messages,
      configId: dto.aiConfigId,
      parameters: {
        temperature: 0.2,  // ⭐ 分析任务用低温度
        maxTokens: 2000,
      },
    });

    try {
      return JSON.parse(response.content);
    } catch (error) {
      console.error('JSON解析失败:', error);
      return {
        analysis: response.content,
        score: 0,
        suggestions: [],
      };
    }
  }

  /**
   * 示例4：多轮对话
   */
  async conversationAICall(
    userId: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
    newMessage: string,
    configId?: string
  ) {
    const messages: AIChatMessage[] = [
      {
        role: 'system',
        content: '你是智能写作助手'
      },
      // ⭐ 添加对话历史
      ...history.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: newMessage
      }
    ];

    const response = await this.aiCallerService.callAI({
      userId,
      messages,
      configId,
    });

    return {
      content: response.content,
      tokensUsed: response.totalTokens,
    };
  }

  /**
   * 示例5：根据不同场景动态调整参数
   */
  async adaptiveAICall(
    userId: string,
    prompt: string,
    mode: 'creative' | 'precise' | 'balanced',
    configId?: string
  ) {
    // ⭐ 根据模式调整参数
    const parametersByMode = {
      creative: { temperature: 1.2, maxTokens: 6000 },
      precise: { temperature: 0.2, maxTokens: 2000 },
      balanced: { temperature: 0.7, maxTokens: 4000 },
    };

    const messages: AIChatMessage[] = [
      {
        role: 'system',
        content: this.getSystemPromptByMode(mode)
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await this.aiCallerService.callAI({
      userId,
      messages,
      configId,
      parameters: parametersByMode[mode],
    });

    return {
      content: response.content,
      mode,
      model: response.model,
    };
  }

  /**
   * 辅助方法：根据模式获取系统提示词
   */
  private getSystemPromptByMode(mode: 'creative' | 'precise' | 'balanced'): string {
    const prompts = {
      creative: '你是富有创造力的写作助手，善于天马行空的创意构思。',
      precise: '你是严谨的写作助手，注重逻辑性和准确性。',
      balanced: '你是专业的写作助手，兼顾创意和逻辑。',
    };
    return prompts[mode];
  }

  /**
   * 示例6：批量处理（注意速率限制）
   */
  async batchAICall(
    userId: string,
    items: string[],
    configId?: string
  ) {
    const results = [];

    // ⭐ 逐个处理，避免并发过多
    for (const item of items) {
      const messages: AIChatMessage[] = [
        {
          role: 'system',
          content: '你是文本处理助手'
        },
        {
          role: 'user',
          content: `处理：${item}`
        }
      ];

      try {
        const response = await this.aiCallerService.callAI({
          userId,
          messages,
          configId,
          parameters: {
            temperature: 0.5,
            maxTokens: 1000,
          },
        });

        results.push({
          input: item,
          output: response.content,
          success: true,
        });
      } catch (error) {
        results.push({
          input: item,
          output: null,
          success: false,
          error: error.message,
        });
      }

      // ⭐ 添加延迟，避免速率限制
      await this.delay(1000);
    }

    return results;
  }

  /**
   * 辅助方法：延迟
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Controller 示例
 */
/*
import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard, PackageFeatureGuard, RequireFeature, RequireQuota } from '@app/common';
import { YourAIService, YourAIDto } from './your-ai.service';

@Controller('your-ai')
@UseGuards(JwtAuthGuard, PackageFeatureGuard)
export class YourAIController {
  constructor(private readonly yourAIService: YourAIService) {}

  @Post('generate')
  @RequireFeature('aiWriting')         // ⭐ 检查功能权限
  @RequireQuota('daily')               // ⭐ 检查配额
  async generate(@Request() req, @Body() dto: YourAIDto) {
    return this.yourAIService.basicAICall(req.user.id, dto);
  }

  @Post('stream')
  @RequireFeature('aiWriting')
  @RequireQuota('daily')
  async stream(@Request() req, @Body() dto: YourAIDto) {
    // 流式输出需要特殊处理
    return this.yourAIService.streamAICall(req.user.id, dto);
  }
}
*/

/**
 * Module 注册示例
 */
/*
import { Module } from '@nestjs/common';
import { YourAIController } from './your-ai.controller';
import { YourAIService } from './your-ai.service';
import { AICallerService } from '../../services/ai-caller.service';
import { FeatureQuotaService } from '@app/common';

@Module({
  controllers: [YourAIController],
  providers: [
    YourAIService,
    AICallerService,        // ⭐ 必需
    FeatureQuotaService,    // ⭐ 如果使用 PackageFeatureGuard
  ],
  exports: [YourAIService],
})
export class YourAIModule {}
*/

