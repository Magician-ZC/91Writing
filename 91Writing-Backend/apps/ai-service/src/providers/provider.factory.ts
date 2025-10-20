import { AIProvider } from '@prisma/client';
import { BaseAIProvider } from './base.provider';
import { OpenAIProvider } from './openai.provider';
import { ClaudeProvider } from './claude.provider';
import { DeepSeekProvider } from './deepseek.provider';
import { GenericProvider } from './generic.provider';

/**
 * AI提供商工厂
 * 根据提供商类型创建对应的AI提供商实例
 */
export class AIProviderFactory {
  private static providerInstances: Map<AIProvider, BaseAIProvider> = new Map();

  /**
   * 获取AI提供商实例
   */
  static getProvider(provider: AIProvider): BaseAIProvider {
    // 使用单例模式，避免重复创建实例
    if (!this.providerInstances.has(provider)) {
      let instance: BaseAIProvider;

      switch (provider) {
        case AIProvider.OPENAI:
          instance = new OpenAIProvider();
          break;

        case AIProvider.CLAUDE:
          instance = new ClaudeProvider();
          break;

        case AIProvider.DEEPSEEK:
          instance = new DeepSeekProvider();
          break;

        case AIProvider.WENXIN:
        case AIProvider.QWEN:
        case AIProvider.ZHIPU:
        case AIProvider.CUSTOM:
          instance = new GenericProvider(provider);
          break;

        default:
          throw new Error(`不支持的AI提供商: ${provider}`);
      }

      this.providerInstances.set(provider, instance);
    }

    return this.providerInstances.get(provider)!;
  }

  /**
   * 清除缓存的提供商实例（用于测试或重置）
   */
  static clearCache(): void {
    this.providerInstances.clear();
  }
}

