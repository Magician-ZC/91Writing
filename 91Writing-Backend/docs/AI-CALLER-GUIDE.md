# AI调用开发指南

## 📌 核心原则

**所有新的AI功能都必须使用 `AICallerService`**

## ✅ 为什么使用 AICallerService

使用统一的 `AICallerService` 而不是直接创建 OpenAI/Claude 等实例的原因：

1. ✅ **支持用户自定义配置** - 用户可以在前端选择自己配置的AI模型
2. ✅ **多提供商支持** - 自动支持 OpenAI、Claude、DeepSeek、文心一言、通义千问等
3. ✅ **配置管理** - 自动处理配置加载、API Key 加密解密
4. ✅ **重试机制** - 失败自动重试，提高稳定性
5. ✅ **降级策略** - 主配置失败时自动切换备用配置
6. ✅ **统一日志** - 自动记录 token 使用、成本、响应时间等
7. ✅ **参数合并** - 智能合并系统默认参数和用户参数

---

## 🚀 快速开始

### 1. 在 Module 中注册服务

```typescript
import { Module } from '@nestjs/common';
import { YourService } from './your.service';
import { AICallerService } from '../../services/ai-caller.service';

@Module({
  providers: [
    YourService,
    AICallerService,  // ✅ 添加 AICallerService
  ],
})
export class YourModule {}
```

### 2. 在 Service 中注入

```typescript
import { Injectable } from '@nestjs/common';
import { AICallerService } from '../../services/ai-caller.service';
import { AIChatMessage } from '../../providers/base.provider';

@Injectable()
export class YourService {
  constructor(
    private readonly aiCallerService: AICallerService,  // ✅ 注入服务
  ) {}
}
```

### 3. 调用AI

```typescript
async yourMethod(userId: string, dto: YourDto) {
  // 1. 构建消息
  const messages: AIChatMessage[] = [
    {
      role: 'system',
      content: '你是专业的小说创作助手'
    },
    {
      role: 'user',
      content: dto.prompt
    }
  ];

  // 2. 调用AI
  const response = await this.aiCallerService.callAI({
    userId,                    // ✅ 必需：用户ID
    messages,                  // ✅ 必需：对话消息
    configId: dto.aiConfigId,  // ⭐ 可选：用户选择的配置ID
    parameters: {              // ⭐ 可选：覆盖参数
      temperature: 0.7,
      maxTokens: 4000,
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
```

---

## 📚 API 参考

### AICallRequest 接口

```typescript
interface AICallRequest {
  userId: string;           // ✅ 必需：用户ID，用于获取配置和记录日志
  messages: AIChatMessage[]; // ✅ 必需：对话消息数组
  configId?: string;        // ⭐ 可选：配置ID（格式：system:xxx 或 user:xxx）
  parameters?: {            // ⭐ 可选：AI参数（会覆盖配置中的默认值）
    temperature?: number;    // 温度 0-2
    maxTokens?: number;      // 最大token数
    topP?: number;           // Top-p采样
    frequencyPenalty?: number; // 频率惩罚
    presencePenalty?: number;  // 存在惩罚
  };
  stream?: boolean;         // ⭐ 可选：是否流式输出
}
```

### AICallResponse 接口

```typescript
interface AICallResponse {
  content: string;          // AI回复内容
  model: string;            // 使用的模型名称
  provider: string;         // AI提供商
  inputTokens: number;      // 输入token数
  outputTokens: number;     // 输出token数
  totalTokens: number;      // 总token数
}
```

### AIChatMessage 接口

```typescript
interface AIChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
```

---

## 🎯 使用场景示例

### 场景1：基础AI对话（让用户选择配置）

```typescript
async chat(userId: string, dto: ChatDto) {
  const messages: AIChatMessage[] = [
    { role: 'system', content: '你是写作助手' },
    { role: 'user', content: dto.message }
  ];

  const response = await this.aiCallerService.callAI({
    userId,
    messages,
    configId: dto.aiConfigId,  // ⭐ 用户在前端选择的配置
  });

  return { content: response.content };
}
```

### 场景2：使用默认系统配置

```typescript
async analyze(userId: string, text: string) {
  const messages: AIChatMessage[] = [
    { role: 'system', content: '你是文本分析专家' },
    { role: 'user', content: `分析这段文本：${text}` }
  ];

  const response = await this.aiCallerService.callAI({
    userId,
    messages,
    // ⭐ 不传 configId，自动使用用户的默认配置或系统配置
  });

  return JSON.parse(response.content);
}
```

### 场景3：覆盖温度等参数

```typescript
async generateCreative(userId: string, dto: GenerateDto) {
  const messages: AIChatMessage[] = [
    { role: 'system', content: '你是创意生成助手' },
    { role: 'user', content: dto.prompt }
  ];

  const response = await this.aiCallerService.callAI({
    userId,
    messages,
    configId: dto.aiConfigId,
    parameters: {
      temperature: dto.creativity === 'high' ? 1.2 : 0.7,  // ⭐ 动态调整参数
      maxTokens: dto.length === 'long' ? 8000 : 2000,
    },
  });

  return { content: response.content };
}
```

### 场景4：流式输出

```typescript
async *generateStream(userId: string, dto: GenerateDto): AsyncIterableIterator<string> {
  const messages: AIChatMessage[] = [
    { role: 'system', content: '你是内容生成助手' },
    { role: 'user', content: dto.prompt }
  ];

  // ⭐ 使用 callAIStream 方法
  for await (const chunk of this.aiCallerService.callAIStream({
    userId,
    messages,
    configId: dto.aiConfigId,
    parameters: {
      temperature: 0.8,
      maxTokens: 4000,
    },
    stream: true,  // ⭐ 必须设置为 true
  })) {
    yield chunk;
  }
}
```

### 场景5：多轮对话

```typescript
async continueConversation(userId: string, dto: ConversationDto) {
  // ⭐ 构建完整对话历史
  const messages: AIChatMessage[] = [
    { role: 'system', content: '你是写作助手' },
    ...dto.history.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    })),
    { role: 'user', content: dto.newMessage }
  ];

  const response = await this.aiCallerService.callAI({
    userId,
    messages,
    configId: dto.aiConfigId,
  });

  return {
    message: response.content,
    tokensUsed: response.totalTokens,
  };
}
```

---

## ⚠️ 错误的做法（不要这样做！）

### ❌ 错误示例1：直接创建 OpenAI 实例

```typescript
// ❌ 不要这样做！
import OpenAI from 'openai';

export class BadService {
  private openai: OpenAI;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  
  async doSomething() {
    const response = await this.openai.chat.completions.create({...});
  }
}
```

**问题：**
- ❌ 用户无法选择自己的AI配置
- ❌ 只支持 OpenAI，不支持其他提供商
- ❌ 没有重试机制
- ❌ 没有日志记录

### ❌ 错误示例2：不传 userId

```typescript
// ❌ 不要这样做！
const response = await this.aiCallerService.callAI({
  // userId 缺失！
  messages,
});
```

**问题：**
- ❌ 无法获取用户配置
- ❌ 无法记录使用日志
- ❌ 无法统计用户消费

---

## 📊 配置ID格式

### 系统配置
```typescript
configId: 'system:default'  // 系统默认配置
configId: 'system:xxx'      // 指定系统配置
```

### 用户配置
```typescript
configId: 'user:clxxx123'   // 用户自定义配置的ID
```

### 自动选择
```typescript
configId: undefined          // 自动选择（优先用户默认配置 → 系统默认配置）
```

---

## 🎨 前端集成

### 让用户选择AI配置

```typescript
// 前端代码示例
interface GenerateDto {
  prompt: string;
  aiConfigId?: string;  // ⭐ 允许用户选择配置
}

// 前端发送请求
const response = await fetch('/api/v1/ai/generate', {
  method: 'POST',
  body: JSON.stringify({
    prompt: '生成一个故事开头',
    aiConfigId: selectedConfig?.id,  // 用户在下拉框选择的配置
  }),
});
```

---

## 🔍 调试技巧

### 1. 查看使用的配置

```typescript
const response = await this.aiCallerService.callAI({
  userId,
  messages,
  configId: dto.aiConfigId,
});

console.log('使用的模型:', response.model);
console.log('提供商:', response.provider);
console.log('Token消耗:', response.totalTokens);
```

### 2. 测试不同配置

```typescript
// 测试系统默认配置
await this.aiCallerService.callAI({
  userId,
  messages,
  configId: 'system:default',
});

// 测试用户配置
await this.aiCallerService.callAI({
  userId,
  messages,
  configId: 'user:xxx',
});
```

---

## 📝 最佳实践

1. ✅ **始终传递 userId** - 即使是系统功能也要传
2. ✅ **让用户选择配置** - 在 DTO 中添加 `aiConfigId?: string` 字段
3. ✅ **合理设置 temperature** - 创意任务用 0.8-1.2，分析任务用 0.2-0.5
4. ✅ **限制 maxTokens** - 避免过度消耗，根据实际需求设置
5. ✅ **使用流式输出** - 对于长文本生成，提供更好的用户体验
6. ✅ **错误处理** - AICallerService 已有重试机制，但仍需要 try-catch
7. ✅ **记录关键信息** - 在日志中记录使用的模型、token消耗等

---

## 🔐 安全注意事项

1. ⚠️ **不要在客户端暴露 API Key** - 所有调用都在后端进行
2. ⚠️ **验证用户权限** - 确保用户有权使用 AI 功能
3. ⚠️ **检查配额** - 使用 `@RequireQuota` 装饰器限制使用
4. ⚠️ **过滤敏感信息** - 不要将用户隐私数据传给 AI
5. ⚠️ **内容审核** - 对 AI 生成的内容进行必要的审核

---

## 📋 Checklist

在开发新的AI功能时，确保：

- [ ] 在 Module 中注册了 `AICallerService`
- [ ] 在 Service 中正确注入了 `AICallerService`
- [ ] 使用 `callAI` 或 `callAIStream` 方法调用
- [ ] 传递了正确的 `userId`
- [ ] 在 DTO 中添加了 `aiConfigId?: string` 字段供用户选择
- [ ] 设置了合理的 `temperature` 和 `maxTokens`
- [ ] 添加了错误处理
- [ ] 添加了权限检查（`@RequireFeature`, `@RequireQuota`）
- [ ] 测试了不同的配置和参数组合

---

## 🆘 常见问题

### Q: 如何指定使用特定的模型？
A: 通过 `configId` 指定配置，配置中包含了模型信息。不要在代码中硬编码模型名称。

### Q: 如何调整 temperature？
A: 在 `parameters` 中传递，会覆盖配置中的默认值：
```typescript
parameters: { temperature: 1.2 }
```

### Q: 如何支持更多AI提供商？
A: AICallerService 已经支持多种提供商，只需在用户配置中添加即可，无需修改代码。

### Q: 流式输出如何使用？
A: 使用 `callAIStream` 方法，并设置 `stream: true`。

### Q: 如何记录AI使用日志？
A: AICallerService 会自动记录，无需手动处理。

---

## 📖 参考资料

- [AICallerService 源码](../apps/ai-service/src/services/ai-caller.service.ts)
- [使用示例 - AssistantService](../apps/ai-service/src/modules/assistant/assistant.service.ts)
- [使用示例 - GenerationService](../apps/ai-service/src/modules/generation/generation.service.ts)
- [AI配置管理文档](./MATERIAL-AI-INTEGRATION.md)

---

**记住：所有新的AI功能都必须使用 AICallerService！** ✅

