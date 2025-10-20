# 素材库应用设计方案

## 1. 素材类型与用途

### 1.1 参考小说（完整作品）
**用途：**
- 学习写作风格和叙事技巧
- 提取情节结构模式
- 分析人物塑造方法

**AI使用方式：**
```typescript
// 风格学习
"请参考这部小说的写作风格，为我创作一个类似风格的开篇"

// 结构分析
"分析这部小说的情节结构，帮我设计一个三幕剧结构"
```

### 1.2 片段素材（经典段落）
**用途：**
- 场景描写参考
- 对话写作参考
- 心理描写参考

**AI使用方式：**
```typescript
// 技巧学习
"参考这个场景描写的手法，帮我描写一个雨夜场景"

// 不是直接复制，而是学习技巧后创作新内容
```

### 1.3 设定素材（世界观/角色）
**用途：**
- 存储自己创作的世界观设定
- 记录角色背景资料
- 保存情节大纲

**AI使用方式：**
```typescript
// 作为创作上下文
{
  worldSetting: "素材库中的世界观设定",
  characterProfiles: "素材库中的角色卡",
  plotOutline: "素材库中的大纲"
}
// AI基于这些设定进行创作，保持连贯性
```

## 2. 向导中的素材应用流程

### 2.1 创作准备阶段
```
步骤1: 选择参考素材
├── 选择风格参考小说
├── 选择类似题材作品
└── 选择喜欢的写作手法片段

步骤2: AI分析素材
├── 提取写作风格特征
├── 分析叙事结构
└── 总结创作技巧
```

### 2.2 创作过程中的应用
```typescript
// 在向导的每个步骤中
interface WizardStepWithMaterial {
  stepId: string;
  stepType: 'outline' | 'character' | 'scene' | 'content';
  
  // 可引用的素材
  referenceMaterials: {
    materialId: string;
    usageType: 'style' | 'structure' | 'technique';
    aiPrompt: string;  // 告诉AI如何使用这个素材
  }[];
  
  // AI生成参数
  generateWithMaterials: boolean;
}
```

### 示例：角色创建步骤
```typescript
// 用户操作
1. 输入角色基本信息（姓名、性别、年龄）
2. 从素材库选择"参考角色"
3. 点击"AI辅助完善"

// 后台处理
const aiPrompt = `
基于以下角色信息：${userInput}

参考以下角色的塑造手法（不要复制，学习手法）：
---
${referenceMaterialContent}
---

请帮助完善这个角色的：
1. 性格特征（5-8个关键词）
2. 背景故事（200字以内）
3. 核心动机
4. 角色弧光设计
`;
```

## 3. 素材引用追踪系统

### 3.1 引用记录
```typescript
interface MaterialUsageRecord {
  materialId: string;        // 素材ID
  chapterId: string;         // 使用在哪个章节
  usageType: string;         // 引用类型
  aiGenerated: boolean;      // 是否经过AI改写
  originalExcerpt?: string;  // 如果是片段引用，记录原文
  generatedContent: string;  // AI基于素材生成的内容
  similarity: number;        // 相似度（防止过度相似）
}
```

### 3.2 相似度检测（防抄袭）
```typescript
// 在保存章节时自动检测
if (similarity > 0.8) {
  警告("生成内容与参考素材过于相似，建议修改")
}
```

## 4. 具体实现步骤

### 4.1 前端改造

**MaterialManagement.vue 添加功能：**
```vue
<!-- 素材卡片添加"使用此素材"按钮 -->
<el-button @click="useMaterialAsReference(material)">
  作为参考素材
</el-button>

<!-- 素材详情添加"用途说明" -->
<el-select v-model="material.usageType">
  <el-option label="写作风格参考" value="style" />
  <el-option label="情节结构参考" value="plot" />
  <el-option label="人物设定参考" value="character" />
  <el-option label="场景描写参考" value="scene" />
</el-select>
```

**NovelWizard.vue 添加素材选择：**
```vue
<!-- 在每个步骤添加"选择参考素材"功能 -->
<MaterialSelector 
  :step-type="currentStep"
  @select="handleMaterialSelected"
/>
```

### 4.2 后端API设计

**新增接口：**
```typescript
// 1. 获取适用于当前步骤的素材
GET /api/v1/materials/for-wizard/:stepType

// 2. AI使用素材生成内容
POST /api/v1/ai/generate-with-materials
{
  prompt: string;
  materialIds: string[];
  usageType: 'style' | 'structure' | 'technique';
  targetLength: number;
}

// 3. 记录素材使用
POST /api/v1/materials/:id/references
{
  chapterId: string;
  usageType: string;
  generatedContent: string;
}
```

### 4.3 AI Service 改造

**generation.service.ts 添加素材上下文：**
```typescript
async generateWithMaterialReference(dto: GenerateWithMaterialDto) {
  // 1. 获取素材内容
  const materials = await this.getMaterials(dto.materialIds);
  
  // 2. 构建AI提示词
  const systemPrompt = this.buildMaterialContextPrompt(
    materials, 
    dto.usageType
  );
  
  // 3. 调用AI生成（包含素材上下文）
  const result = await this.aiProvider.generate({
    system: systemPrompt,
    user: dto.prompt,
    temperature: 0.8,  // 较高的随机性，避免直接复制
  });
  
  // 4. 检测相似度
  const similarity = await this.checkSimilarity(
    result.content,
    materials
  );
  
  if (similarity > 0.8) {
    // 要求AI重新生成，增加差异化
    return await this.regenerateWithMoreVariation(dto);
  }
  
  return result;
}
```

## 5. 用户体验流程

### 场景：创建角色

```
1. 用户点击"创建角色" → 进入角色向导

2. 填写基本信息
   └── 姓名、性别、年龄、职业

3. 点击"浏览参考素材"
   ├── 显示素材库中的"角色设定"类素材
   ├── 可以选择1-3个参考角色
   └── 标注参考维度（性格/背景/能力）

4. 点击"AI辅助完善"
   ├── AI读取参考素材
   ├── 学习角色塑造手法
   ├── 基于用户输入生成新角色
   └── 确保与参考角色有明显差异

5. 用户编辑和确认
   └── 可以继续修改AI生成的内容
```

## 6. 重要原则

### ✅ 应该
- 素材作为"灵感来源"
- AI学习"写作技巧"而非"内容本身"
- 鼓励创新和改编
- 记录所有引用，方便追溯

### ❌ 不应该
- 直接复制粘贴原文
- 整段引用不加修改
- 超过30%的内容相似度
- 不标注参考来源

## 7. 法律和道德考虑

1. **版权声明**：用户上传的素材应该是：
   - 自己创作的内容
   - 公版素材（版权过期）
   - 已获授权的内容

2. **相似度限制**：
   - 自动检测与素材的相似度
   - 超过阈值时提醒用户修改
   - 禁止完全复制的行为

3. **使用记录**：
   - 记录所有素材引用
   - 方便用户追溯创作来源
   - 必要时可以生成"参考文献列表"

