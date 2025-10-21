# P2任务实施方案 - 人物一致性自动化

实施日期: 2025-01-21  
任务优先级: P2 (中优先级)  
预计时间: 2-3小时  

---

## 📋 任务概览

将手动配置的人物一致性系统改为AI自动管理，大幅提升用户体验。

---

## ✅ 已完成部分

### 1. 数据库模型 (100% ✅)

#### CharacterFeature 表
```prisma
model CharacterFeature {
  id          String   @id @default(cuid())
  
  novelId     String   // 小说ID
  chapterNumber Int    // 章节号
  characterName String // 角色名称
  
  // 自动提取的特征
  appearance  String   @db.Text  // 外貌描述（AI生成）
  clothing    String   @db.Text  // 服饰描述（AI生成）
  state       String?  @db.Text  // 状态描述
  
  // 视觉化提示词
  visualPrompt   String  @db.Text
  negativePrompt String? @db.Text
  keywords       Json?
  
  // 一致性参考
  referenceImageUrl String?  // 参考图
  referenceId       String?  // Provider ID
  
  // 元数据
  extractedBy String  // 提取来源
  confidence  Float   @default(0.8)
  
  createdAt   DateTime @default(now())
  
  @@unique([novelId, chapterNumber, characterName])
  @@index([novelId, characterName])
}
```

#### ConsistencyProfile 增强
新增字段：
- `autoExtracted` - 是否自动提取
- `lastExtractedAt` - 最后提取时间
- `autoUpdate` - 是否自动更新
- `updateHistory` - 更新历史

### 2. 种子数据 (100% ✅)
- ✅ `character-feature.seed.sql` 已创建

---

## 🔧 实施步骤

### Step 1: 增强 StoryboardAgentService

在分镜生成时自动提取角色特征。

**文件**: `apps/ai-service/src/services/storyboard-agent.service.ts`

**新增方法**:

```typescript
/**
 * 自动提取角色特征
 */
private async extractCharacterFeatures(
  chapterContent: string,
  storyboard: StoryboardScriptDto,
  novelId: string,
  chapterNumber: number,
): Promise<any[]> {
  this.logger.log(`开始提取章节${chapterNumber}的角色特征`);

  const prompt = `
你是一个角色特征提取专家。分析以下章节内容和分镜脚本，提取所有出现的角色特征。

章节内容：
${chapterContent.substring(0, 2000)}

分镜脚本：
${JSON.stringify(storyboard, null, 2)}

请提取以下信息（JSON格式）：
{
  "characters": [
    {
      "name": "角色姓名",
      "appearance": "详细的外貌描述（年龄、性别、身高、发型、脸型、五官特征等）",
      "clothing": "详细的服饰描述（衣服款式、颜色、材质、配饰等）",
      "state": "当前状态（如：受伤、疲惫、愤怒等，正常则为null）",
      "visualPrompt": "适合文生图的英文提示词（Midjourney风格）",
      "negativePrompt": "负向提示词（应该避免的特征）",
      "keywords": ["关键词1", "关键词2", "关键词3"],
      "confidence": 0.95
    }
  ]
}

要求：
1. 外貌描述要具体、可视化，便于AI生成图片
2. 服饰要符合章节时代背景和角色身份
3. visualPrompt要专业（参考Stable Diffusion/Midjourney提示词格式）
4. 只提取明确出现的主要角色（最多5个）
5. confidence表示提取的置信度（0-1）
`;

  try {
    const response = await this.aiCaller.callAI({
      userId: 'system',
      messages: [{ role: 'user', content: prompt }],
      parameters: {
        temperature: 0.3,  // 低温度保证稳定性
        maxTokens: 2000,
      },
    });

    // 解析JSON响应
    const result = JSON.parse(response.content);
    return result.characters || [];
  } catch (error) {
    this.logger.error('提取角色特征失败:', error);
    return [];
  }
}

/**
 * 保存角色特征到数据库
 */
private async saveCharacterFeatures(
  novelId: string,
  chapterNumber: number,
  extractedCharacters: any[],
): Promise<void> {
  for (const char of extractedCharacters) {
    try {
      await this.prisma.characterFeature.upsert({
        where: {
          novelId_chapterNumber_characterName: {
            novelId,
            chapterNumber,
            characterName: char.name,
          },
        },
        update: {
          appearance: char.appearance,
          clothing: char.clothing,
          state: char.state || null,
          visualPrompt: char.visualPrompt,
          negativePrompt: char.negativePrompt || null,
          keywords: char.keywords,
          confidence: char.confidence || 0.8,
          extractedBy: 'storyboard-agent',
        },
        create: {
          novelId,
          chapterNumber,
          characterName: char.name,
          appearance: char.appearance,
          clothing: char.clothing,
          state: char.state || null,
          visualPrompt: char.visualPrompt,
          negativePrompt: char.negativePrompt || null,
          keywords: char.keywords,
          confidence: char.confidence || 0.8,
          extractedBy: 'storyboard-agent',
        },
      });

      this.logger.log(`已保存角色特征: ${char.name}`);
    } catch (error) {
      this.logger.error(`保存角色特征失败 (${char.name}):`, error);
    }
  }
}

/**
 * 自动创建或更新 ConsistencyProfile
 */
private async autoManageConsistencyProfile(
  novelId: string,
  chapterNumber: number,
  extractedCharacters: any[],
): Promise<void> {
  // 检查是否已有配置
  let profile = await this.prisma.consistencyProfile.findUnique({
    where: { novelId },
  });

  if (!profile) {
    // 创建新配置
    const characters = extractedCharacters.map(char => ({
      name: char.name,
      baseAppearance: char.appearance,
      keywords: char.keywords,
      referenceImages: [],
      dynamicState: {
        [chapterNumber]: char.state || '正常'
      }
    }));

    profile = await this.prisma.consistencyProfile.create({
      data: {
        novelId,
        characters: { characters },
        autoExtracted: true,
        lastExtractedAt: new Date(),
        autoUpdate: true,
        visualStyle: {
          overall: 'realistic',
          colorTone: 'natural',
          artStyle: 'cinematic',
          lighting: 'natural',
        },
      },
    });

    this.logger.log(`已创建自动一致性配置: ${novelId}`);
  } else if (profile.autoUpdate) {
    // 更新现有配置
    const existingChars = (profile.characters as any).characters || [];
    const updatedChars = [...existingChars];

    for (const extracted of extractedCharacters) {
      const existingIndex = updatedChars.findIndex(c => c.name === extracted.name);

      if (existingIndex === -1) {
        // 新角色，添加
        updatedChars.push({
          name: extracted.name,
          baseAppearance: extracted.appearance,
          keywords: extracted.keywords,
          referenceImages: [],
          dynamicState: {
            [chapterNumber]: extracted.state || '正常'
          }
        });
      } else {
        // 已有角色，更新动态状态
        const existing = updatedChars[existingIndex];
        existing.dynamicState = {
          ...existing.dynamicState,
          [chapterNumber]: extracted.state || '正常'
        };

        // 如果外貌有明显变化，合并更新
        if (this.shouldUpdateAppearance(existing.baseAppearance, extracted.appearance)) {
          existing.baseAppearance = this.mergeAppearance(
            existing.baseAppearance,
            extracted.appearance
          );
        }
      }
    }

    // 保存更新
    await this.prisma.consistencyProfile.update({
      where: { novelId },
      data: {
        characters: { characters: updatedChars },
        lastExtractedAt: new Date(),
        updateHistory: {
          ...((profile.updateHistory as any) || {}),
          [chapterNumber]: {
            timestamp: new Date(),
            changes: extractedCharacters.map(c => c.name),
          }
        },
      },
    });

    this.logger.log(`已更新自动一致性配置: ${novelId}`);
  }
}

/**
 * 判断是否需要更新外貌
 */
private shouldUpdateAppearance(existing: string, extracted: string): boolean {
  // 简单判断：如果新描述更详细（字数更多），则更新
  return extracted.length > existing.length * 1.2;
}

/**
 * 合并外貌描述
 */
private mergeAppearance(existing: string, extracted: string): string {
  // 优先使用更详细的描述
  return extracted.length > existing.length ? extracted : existing;
}
```

**修改主方法**:

```typescript
async generateStoryboard(
  chapterId: string,
  consistencyProfile: any,
  options = {},
): Promise<StoryboardScriptDto> {
  // ... 现有代码 ...

  // 生成分镜脚本
  const storyboard = await this.callAI(...);

  // ✅ 新增：自动提取角色特征
  const chapter = await this.prisma.chapter.findUnique({
    where: { id: chapterId },
    include: { novel: true },
  });

  if (chapter) {
    const extractedCharacters = await this.extractCharacterFeatures(
      chapter.content,
      storyboard,
      chapter.novel.id,
      chapter.chapterNumber,
    );

    // 保存到数据库
    await this.saveCharacterFeatures(
      chapter.novel.id,
      chapter.chapterNumber,
      extractedCharacters,
    );

    // 自动管理一致性配置
    await this.autoManageConsistencyProfile(
      chapter.novel.id,
      chapter.chapterNumber,
      extractedCharacters,
    );
  }

  return storyboard;
}
```

---

### Step 2: 增强 ImageGenerationAgentService

使用自动提取的角色特征优化提示词。

**文件**: `apps/ai-service/src/services/image-generation-agent.service.ts`

**新增方法**:

```typescript
/**
 * 获取角色特征（优先使用最新章节）
 */
private async getCharacterFeatures(
  novelId: string,
  chapterNumber: number,
  characterNames: string[],
): Promise<any[]> {
  if (!novelId || !characterNames.length) {
    return [];
  }

  // 先尝试当前章节
  let features = await this.prisma.characterFeature.findMany({
    where: {
      novelId,
      chapterNumber,
      characterName: { in: characterNames },
    },
  });

  // 如果当前章节没有，回退到最近的章节
  if (features.length < characterNames.length && chapterNumber > 1) {
    const missingNames = characterNames.filter(
      name => !features.some(f => f.characterName === name)
    );

    const previousFeatures = await this.prisma.characterFeature.findMany({
      where: {
        novelId,
        chapterNumber: { lt: chapterNumber },
        characterName: { in: missingNames },
      },
      orderBy: { chapterNumber: 'desc' },
      distinct: ['characterName'],
    });

    features = [...features, ...previousFeatures];
  }

  return features;
}

/**
 * 识别场景中的角色
 */
private identifyCharactersInScene(sceneDescription: string): string[] {
  // 简单的名称匹配（实际可以用NER）
  const commonNames = ['李明', '王芳', '张伟', '刘强'];  // 示例
  return commonNames.filter(name => sceneDescription.includes(name));
}

/**
 * 合并角色特征到场景描述
 */
private mergeCharacterFeatures(
  sceneDescription: string,
  features: any[],
): string {
  if (!features.length) {
    return sceneDescription;
  }

  let enhanced = sceneDescription;

  for (const feature of features) {
    // 替换角色名为详细描述
    const pattern = new RegExp(feature.characterName, 'g');
    const replacement = `${feature.characterName}（${feature.appearance}，${feature.clothing}${feature.state ? `，${feature.state}` : ''}）`;
    enhanced = enhanced.replace(pattern, replacement);
  }

  return enhanced;
}
```

**修改优化方法**:

```typescript
async optimizePrompt(
  sceneDescription: string,
  sceneIndex: number,
  totalScenes: number,
  consistencyProfile: any,
  chapterNumber: number,
): Promise<OptimizedPrompt> {
  // ✅ 1. 识别场景中的角色
  const characters = this.identifyCharactersInScene(sceneDescription);

  // ✅ 2. 获取角色的视觉化特征（自动从数据库）
  const characterFeatures = await this.getCharacterFeatures(
    consistencyProfile?.novelId,
    chapterNumber,
    characters,
  );

  // ✅ 3. 合并特征到提示词
  const enhancedDescription = this.mergeCharacterFeatures(
    sceneDescription,
    characterFeatures,
  );

  // 4. 继续现有的优化流程
  return this.generateOptimizedPrompt(enhancedDescription, consistencyProfile);
}
```

---

### Step 3: 视频生成后存储参考图

**文件**: `apps/ai-service/src/modules/video-generation/video-generation.service.ts`

**新增方法**:

```typescript
/**
 * 提取并存储人物参考图
 */
private async extractAndStoreCharacterReferences(
  chapterId: string,
  images: any[],
  storyboard: any,
  novelId: string,
  chapterNumber: number,
): Promise<void> {
  for (let i = 0; i < images.length; i++) {
    const scene = storyboard.scenes[i];
    const image = images[i];

    // 识别场景中的主要角色
    const mainCharacter = this.identifyMainCharacter(scene.description);

    if (mainCharacter) {
      // 检查是否已有参考图
      const existing = await this.prisma.characterFeature.findUnique({
        where: {
          novelId_chapterNumber_characterName: {
            novelId,
            chapterNumber,
            characterName: mainCharacter,
          },
        },
      });

      // 如果没有参考图，存储当前图片
      if (existing && !existing.referenceImageUrl) {
        await this.prisma.characterFeature.update({
          where: { id: existing.id },
          data: {
            referenceImageUrl: image.url,
            referenceId: image.providerId,  // Provider的一致性ID
          },
        });

        this.logger.log(`存储角色 ${mainCharacter} 的参考图`);
      }
    }
  }
}

/**
 * 识别主要角色
 */
private identifyMainCharacter(sceneDescription: string): string | null {
  // 简化实现：返回第一个出现的名字
  const namePattern = /([李王张刘陈杨黄赵吴周徐孙马朱胡郭何高林罗郑梁]\w{1,2})/g;
  const match = sceneDescription.match(namePattern);
  return match ? match[0] : null;
}
```

**在生成流程中调用**:

```typescript
async executeVideoGeneration(...) {
  // ... 图片生成 ...

  // ✅ 新增：提取并存储人物参考图
  await this.extractAndStoreCharacterReferences(
    chapterId,
    images,
    storyboard,
    chapter.novel.id,
    chapter.chapterNumber,
  );

  // ... 继续视频生成 ...
}
```

---

### Step 4: 前端界面 - NovelConsistencySettings.vue

**文件**: `src/views/NovelConsistencySettings.vue`

功能：
- 查看自动提取的角色列表
- 查看各章节的动态状态
- 微调（可选）
- 导出/导入配置

由于篇幅限制，完整代码见下一部分。

---

## 🎯 实施效果

### 用户体验对比

#### 之前（手动配置）❌
```
1. 用户需要手动描述每个角色
2. 首次生成就需要配置
3. 后续章节需要手动更新
4. 描述不专业影响质量
```

#### 之后（自动管理）✅
```
1. 系统自动提取角色特征
2. 首次生成无需任何配置
3. 后续章节自动更新
4. AI生成专业描述
5. 用户只需"查看和微调"（可选）
```

---

## 📊 数据流程

```
第1章生成:
用户点击"生成视频"
  ↓
StoryboardAgent生成分镜
  ↓
自动提取角色特征（AI分析）
  ↓
存储到CharacterFeature表
  ↓
自动创建ConsistencyProfile
  ↓
ImageAgent使用特征生成图片
  ↓
提取第一张参考图
  ↓
存储referenceImageUrl

第2-N章生成:
用户点击"生成视频"
  ↓
StoryboardAgent生成分镜
  ↓
自动提取本章角色特征
  ↓
更新CharacterFeature表
  ↓
自动更新ConsistencyProfile动态状态
  ↓
ImageAgent读取特征（基础+动态）
  ↓
使用参考图保持一致性
  ↓
生成视频
```

---

## ⚠️ 注意事项

1. **AI调用成本**
   - 每章额外1次AI调用（提取角色）
   - 成本: ~¥0.01-0.02/章
   - 可通过缓存优化

2. **角色识别准确性**
   - 依赖AI理解能力
   - confidence字段记录置信度
   - 用户可在界面微调

3. **性能影响**
   - 异步提取，不阻塞主流程
   - 数据库索引优化查询
   - 预计增加<1秒处理时间

4. **数据一致性**
   - 使用upsert保证唯一性
   - autoUpdate标记控制是否自动更新
   - updateHistory记录变更历史

---

## 🧪 测试清单

- [ ] 第1章生成自动提取角色
- [ ] CharacterFeature表正确存储
- [ ] ConsistencyProfile自动创建
- [ ] 第2章自动更新动态状态
- [ ] ImageAgent正确使用特征
- [ ] 参考图正确存储
- [ ] 前端界面显示正常
- [ ] 手动微调功能工作
- [ ] autoUpdate开关生效

---

## 📝 下一步

1. ✅ 完成数据库模型
2. ⏳ 实现StoryboardAgent增强
3. ⏳ 实现ImageAgent增强
4. ⏳ 实现VideoGenerationService增强
5. ⏳ 创建前端界面

**预计剩余时间**: 2-3小时

---

**状态**: 🔨 实施中  
**完成度**: 20%  
**下一步**: 实现自动提取逻辑


