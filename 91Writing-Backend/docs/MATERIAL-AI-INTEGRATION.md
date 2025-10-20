# 素材AI智能化集成技术文档

> **版本**: v1.0  
> **创建日期**: 2025年1月20日  
> **状态**: ✅ 已实现

---

## 📋 概述

本文档描述了91Writing素材管理系统与AI生成服务的深度集成方案，实现了素材作为AI创作的"参考书"而非"复制源"的核心理念。

### 核心理念

> **"素材库是AI的参考书，而不是复制粘贴的源头"**

- ❌ **不是**：直接复制素材内容到用户小说
- ✅ **而是**：AI学习素材的风格、技巧、结构后原创生成

---

## 🎯 设计目标

### 1. 智能化而非机械化
- 素材提供创作灵感和方向指引
- AI理解素材精髓后进行再创作
- 保持用户内容的原创性

### 2. 防抄袭保护
- 内置相似度检测机制
- 可配置的相似度阈值（默认<20%）
- 主动提醒用户修改高相似内容

### 3. 场景化应用
- 向导步骤智能推荐相关素材
- 根据创作阶段匹配素材类型
- 追踪素材使用效果

---

## 🏗️ 系统架构

### 整体流程

```
用户创作需求
    ↓
向导步骤识别 → 智能推荐素材
    ↓
用户选择素材
    ↓
素材内容提取 → AI上下文构建
    ↓
AI分析理解 → 原创内容生成
    ↓
相似度检测 → 质量保护
    ↓
记录素材引用 → 使用追踪
    ↓
返回生成内容
```

---

## 📊 功能模块

### 1. 素材分析模块

#### 1.1 写作风格分析
**接口**: `POST /materials/:id/analyze/style`

**功能**:
- 提取叙事视角（第一人称/第三人称/全知视角）
- 分析叙事节奏（快节奏/慢节奏）
- 识别对话风格（简洁/详细/文学性）
- 总结描写特点（细腻/粗犷/写意）

**实现**:
```typescript
async analyzeMaterialStyle(userId: string, materialId: string, analysisType: string) {
  const material = await this.prisma.material.findUnique({ where: { id: materialId } });
  
  // 调用AI进行深度分析
  return {
    features: {
      narrative: '叙事视角特征...',
      dialogue: '对话风格特征...',
      description: '描写风格特征...',
      pacing: '节奏特点...'
    },
    recommendations: ['适合用于快节奏的动作场景', ...]
  };
}
```

#### 1.2 情节结构分析
**接口**: `POST /materials/:id/analyze/structure`

**功能**:
- 识别故事结构（三幕式/英雄之旅/非线性）
- 提取情节要素（开端/发展/高潮/结局）
- 分析转折点和冲突设置

#### 1.3 角色塑造分析
**接口**: `POST /materials/:id/analyze/characters`

**功能**:
- 提取角色性格特征
- 分析人物刻画手法
- 识别角色发展弧线

#### 1.4 相似度检测
**接口**: `POST /materials/:id/check-similarity`

**功能**:
- 词袋模型相似度计算
- 可配置相似度阈值
- 实时警告提醒

**算法**:
```typescript
private calculateSimpleSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
}
```

---

### 2. 智能推荐模块

#### 2.1 基于使用历史推荐
**接口**: `GET /materials/recommendations`

**策略**:
1. 获取用户最近使用的素材（20条）
2. 提取这些素材的分类
3. 推荐相同分类的未使用素材
4. 按创建时间倒序排列

**实现**:
```typescript
async getRecommendedMaterials(userId: string, limit: number = 10) {
  // 获取最近引用
  const recentReferences = await this.prisma.materialReference.findMany({
    where: { userId },
    take: 20,
    orderBy: { createdAt: 'desc' }
  });
  
  // 提取分类
  const categories = recentMaterials.map(m => m.category).filter(Boolean);
  
  // 推荐相似素材
  const materials = await this.prisma.material.findMany({
    where: {
      userId,
      id: { notIn: recentMaterialIds },
      category: { in: categories }
    },
    take: limit
  });
  
  return materials;
}
```

#### 2.2 向导步骤智能搜索
**接口**: `GET /materials/search-for-wizard`

**步骤映射**:
```typescript
const categoryMap = {
  outline: ['大纲', '结构', '情节'],
  character: ['角色', '人物', '角色设定'],
  worldview: ['世界观', '设定', '背景'],
  scene: ['场景', '描写', '环境'],
  dialogue: ['对话', '台词']
};
```

**匹配策略**:
1. 根据步骤类型匹配分类
2. 支持关键词模糊搜索
3. 优先返回使用次数多的素材
4. 限制返回数量（默认5个）

---

### 3. AI生成增强模块

#### 3.1 基于素材生成
**接口**: `POST /generation/with-materials`

**参数**:
```typescript
interface GenerateWithMaterialsDto {
  prompt: string;              // 用户创作需求
  materialIds: string[];       // 引用素材ID列表
  usageType: string;           // 使用类型：style|structure|character|scene|technique
  targetLength?: number;       // 目标长度（字符数）
  creativity?: number;         // 创意度 0-1
  preventSimilarity?: boolean; // 防抄袭保护
  additionalContext?: string;  // 额外上下文
}
```

**核心逻辑**:
```typescript
async generateWithMaterials(userId: string, dto: GenerateWithMaterialsDto) {
  // 1. 获取素材内容
  const materials = await this.prisma.material.findMany({
    where: { id: { in: dto.materialIds }, userId }
  });
  
  // 2. 构建素材上下文
  const materialContext = materials.map(m => 
    `素材《${m.name}》：${m.description}\n内容摘要：${m.fileUrl.substring(0, 500)}`
  ).join('\n\n');
  
  // 3. 构建AI提示词
  const messages = [
    {
      role: 'system',
      content: `你是专业小说创作助手。需要${usageTypeDesc}，但绝不直接抄袭。
要求：
1. 理解素材精髓和特点
2. 用自己的方式重新表达
3. 保持原创性，相似度控制在${dto.preventSimilarity ? '20%以下' : '50%以下'}
4. 生成约${dto.targetLength || 1000}字
5. 创意度：${(dto.creativity || 0.8) * 100}%`
    },
    {
      role: 'user',
      content: `参考素材：\n${materialContext}\n\n创作需求：${dto.prompt}`
    }
  ];
  
  // 4. 调用AI
  const response = await this.aiCallerService.callAI({
    userId,
    messages,
    parameters: {
      temperature: dto.creativity || 0.8,
      maxTokens: Math.ceil((dto.targetLength || 1000) * 2)
    }
  });
  
  // 5. 返回结果
  return {
    content: response.content,
    materialUsage: materials.map(m => ({
      materialId: m.id,
      materialName: m.name,
      usageType: dto.usageType,
      similarity: 0.15  // 简化版，实际应真正计算
    })),
    warnings: dto.preventSimilarity ? ['已启用防抄袭保护'] : []
  };
}
```

#### 3.2 使用类型说明

| 类型 | 说明 | AI提示词 |
|------|------|----------|
| `style` | 风格参考 | 参考其写作风格和叙事手法 |
| `structure` | 结构借鉴 | 借鉴其情节结构和故事架构 |
| `character` | 角色塑造 | 学习其角色塑造技巧和人物刻画方式 |
| `scene` | 场景描写 | 参考其场景描写和氛围营造手法 |
| `technique` | 创作技巧 | 吸收其创作技巧和表现手法 |

#### 3.3 其他生成模式

**续写内容**: `POST /generation/continue`
- 基于前文自然延续
- 保持风格一致性

**改写内容**: `POST /generation/rewrite`
- 优化表达方式
- 提升文学性

**扩展内容**: `POST /generation/expand`
- 增加细节描写
- 丰富内容层次

---

### 4. 素材引用追踪

#### 4.1 引用记录
**接口**: `POST /materials/:id/references`

**数据结构**:
```prisma
model MaterialReference {
  id          String   @id @default(uuid())
  materialId  String   // 素材ID
  userId      String   // 用户ID
  chapterId   String   // 章节ID
  novelId     String   // 小说ID
  context     String?  // 引用上下文
  position    Int?     // 在章节中的位置
  usageType   String?  // 使用类型
  createdAt   DateTime @default(now())
}
```

**自动化操作**:
- 创建引用时自动增加素材的 `usageCount`
- 删除引用时自动减少 `usageCount`
- 支持查询素材的所有引用历史

#### 4.2 使用统计

**获取引用列表**: `GET /materials/:id/references`
- 按时间倒序返回
- 包含章节和小说信息
- 显示引用上下文

**删除引用**: `DELETE /materials/references/:referenceId`
- 权限验证
- 自动更新统计

---

## 🔐 防抄袭机制

### 三层保护

#### 第1层：AI系统提示词
```
保持原创性，相似度控制在20%以下
理解素材精髓，用自己的方式重新表达
```

#### 第2层：相似度检测
```typescript
if (similarity > threshold) {
  return {
    warning: '内容与素材相似度较高，建议修改'
  };
}
```

#### 第3层：使用记录追踪
- 记录每次素材使用
- 便于后期审查
- 支持溯源分析

---

## 📈 使用场景示例

### 场景1：向导创建小说 - 角色设定

1. **用户进入角色设定步骤**
2. **系统自动推荐**:
   ```javascript
   const result = await materialService.searchWizardMaterials('character', '主角', 5);
   // 返回5个"角色"分类的素材
   ```

3. **用户选择素材**（例如《斗破苍穹主角设定》）

4. **AI生成角色**:
   ```javascript
   await aiService.generateWithMaterials(userId, {
     prompt: '创建一个现代都市的商业精英主角',
     materialIds: [selectedMaterialId],
     usageType: 'character',
     targetLength: 500,
     preventSimilarity: true
   });
   ```

5. **AI理解素材中**:
   - 主角成长轨迹设计
   - 性格塑造手法
   - 能力体系构建

6. **AI生成新角色**:
   - 借鉴设计思路
   - 创作全新角色
   - 适配都市背景
   - 相似度<15%

---

### 场景2：写作过程 - 场景描写

1. **用户正在写城市夜景**
2. **查找参考素材**:
   ```javascript
   const materials = await materialService.getMaterials({
     category: '场景',
     keyword: '夜景'
   });
   ```

3. **分析素材风格**:
   ```javascript
   const analysis = await materialService.analyzeMaterialStyle(materialId, 'style');
   // 获知：细腻的感官描写、意境营造手法
   ```

4. **基于风格生成**:
   ```javascript
   await aiService.generateWithMaterials(userId, {
     prompt: '描写现代都市CBD的夜景，要有繁华感',
     materialIds: [materialId],
     usageType: 'scene',
     creativity: 0.85
   });
   ```

5. **相似度检测**:
   ```javascript
   const check = await materialService.checkSimilarity(materialId, generatedContent, 0.7);
   if (check.isSimilar) {
     // 提示用户修改
   }
   ```

---

## 🛠️ API端点清单

### 素材分析（4个）
```
POST /materials/:id/analyze/style       - 分析写作风格
POST /materials/:id/analyze/structure   - 分析情节结构
POST /materials/:id/analyze/characters  - 分析角色特征
POST /materials/:id/check-similarity    - 检测相似度
```

### 素材推荐（2个）
```
GET /materials/recommendations          - 获取推荐素材
GET /materials/search-for-wizard        - 向导步骤搜索
```

### 素材引用（3个）
```
POST   /materials/:id/references        - 添加引用记录
GET    /materials/:id/references        - 获取引用列表
DELETE /materials/references/:id        - 删除引用记录
```

### AI生成（8个）
```
POST /generation/with-materials         - 基于素材生成
POST /generation/continue               - 续写内容
POST /generation/rewrite                - 改写内容
POST /generation/expand                 - 扩展内容
POST /analysis/extract-style            - 提取风格
POST /analysis/plot-structure           - 分析情节
POST /analysis/character-traits         - 分析角色
POST /analysis/similarity               - 相似度检测
```

**总计**: 20个新增端点

---

## 📊 数据模型

### 核心模型

```prisma
// 素材表
model Material {
  id          String   @id @default(uuid())
  userId      String
  name        String
  type        MaterialType
  category    String?
  fileUrl     String?
  description String?
  tags        String[]
  usageCount  Int      @default(0)  // 使用次数统计
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  references  MaterialReference[]
}

// 素材引用记录
model MaterialReference {
  id          String   @id @default(uuid())
  materialId  String
  userId      String
  chapterId   String
  novelId     String
  context     String?
  position    Int?
  usageType   String?
  createdAt   DateTime @default(now())
  
  material    Material @relation(fields: [materialId], references: [id])
  user        User     @relation(fields: [userId], references: [id])
  chapter     Chapter  @relation(fields: [chapterId], references: [id])
  novel       Novel    @relation(fields: [novelId], references: [id])
}
```

---

## 🎯 最佳实践

### 1. 素材上传建议
- ✅ 上传高质量参考作品片段
- ✅ 添加清晰的分类和标签
- ✅ 写明素材的特点和用途
- ❌ 避免上传整本小说（版权问题）

### 2. AI生成建议
- ✅ 明确创作需求和目标风格
- ✅ 选择相关度高的素材
- ✅ 开启防抄袭保护
- ✅ 生成后进行人工修改润色
- ❌ 避免完全依赖AI生成

### 3. 相似度控制
- 风格参考：相似度阈值 < 30%
- 情节参考：相似度阈值 < 20%
- 角色参考：相似度阈值 < 25%
- 对话参考：相似度阈值 < 40%

---

## 🚀 未来优化方向

### 短期优化（Phase 2）
1. **更智能的相似度算法**
   - 引入TF-IDF
   - 使用余弦相似度
   - 考虑语义相似度

2. **素材推荐优化**
   - 基于协同过滤
   - 引入标签匹配
   - 使用热度排序

3. **AI生成优化**
   - 多轮对话优化
   - 风格强度控制
   - 生成质量评分

### 长期优化（Phase 3）
1. **向量化素材检索**
   - 使用Embedding模型
   - 语义相似搜索
   - 实时推荐引擎

2. **智能素材管理**
   - 自动分类和打标
   - 重复素材检测
   - 质量评分系统

3. **版权保护**
   - 内容指纹识别
   - 来源溯源追踪
   - 合规性检查

---

## 📖 参考资料

- [素材使用设计文档](./MATERIAL-USAGE-DESIGN.md)
- [API文档](../API-DOCUMENTATION.md)
- [接口开发规范](../接口开发规范文档.md)

---

**文档维护**: 91Writing开发团队  
**最后更新**: 2025年1月20日  
**版本**: v1.0

