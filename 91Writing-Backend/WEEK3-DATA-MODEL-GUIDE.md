# Week 3.1 数据模型测试指南

> **项目**: 91Writing 商业化升级  
> **阶段**: Phase 1 - Week 3.1  
> **完成状态**: ✅ 已完成  
> **测试日期**: 2024年12月19日

## 📋 目录

- [数据模型概述](#数据模型概述)
- [核心数据结构](#核心数据结构)
- [API接口说明](#API接口说明)
- [测试方法](#测试方法)
- [测试用例](#测试用例)
- [常见问题](#常见问题)

---

## 🏗️ 数据模型概述

Week 3.1 实现的数据模型是91Writing平台的**核心创作系统**，包括三个主要实体：

### 1. **Novel (小说)** - 创作项目的主体
- **作用**: 代表用户创建的小说项目
- **核心功能**: 存储小说基本信息、设置、统计数据
- **关联**: 连接用户、章节、记忆系统

### 2. **Chapter (章节)** - 创作内容的基本单元
- **作用**: 存储具体的创作内容
- **核心功能**: 章节内容管理、排序、状态控制
- **关联**: 属于特定小说，支持级联删除

### 3. **NovelMemory (记忆系统)** - AI辅助创作的核心
- **作用**: 存储小说相关的上下文信息
- **核心功能**: 支持AI记忆管理、重要性权重
- **类型**: 核心记忆(CORE)、摘要(SUMMARY)、上下文(CONTEXT)

---

## 📊 核心数据结构

### Novel 小说实体
```prisma
model Novel {
  id           String      @id @default(cuid())
  userId       String      // 所属用户ID
  title        String      // 小说标题 (最长200字符)
  description  String?     // 小说描述
  genre        String?     // 类型/题材
  status       NovelStatus // 状态: DRAFT/WRITING/COMPLETED/PUBLISHED
  coverUrl     String?     // 封面图片URL
  wordCount    Int         // 总字数 (自动计算)
  chapterCount Int         // 章节数 (自动计算)
  settings     Json?       // 小说设置 (角色、世界观等)
  
  // 关联
  user         User        
  chapters     Chapter[]
  memories     NovelMemory[]
  
  // 时间戳
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
}
```

### Chapter 章节实体
```prisma
model Chapter {
  id            String        @id @default(cuid())
  novelId       String        // 所属小说ID
  title         String        // 章节标题
  content       String        // 章节内容 (LONGTEXT)
  wordCount     Int           // 字数统计
  chapterNumber Int           // 章节序号
  status        ChapterStatus // 状态: DRAFT/PUBLISHED
  
  // 关联
  novel         Novel
  
  // 时间戳
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  
  // 约束
  @@unique([novelId, chapterNumber]) // 同小说内章节序号唯一
}
```

### NovelMemory 记忆实体
```prisma
model NovelMemory {
  id           String     @id @default(cuid())
  novelId      String     // 所属小说ID
  memoryType   MemoryType // 记忆类型: CORE/SUMMARY/CONTEXT
  content      Json       // 记忆内容 (JSON格式)
  importance   Decimal    // 重要性权重 (0.0-1.0)
  tokenCost    Int        // Token消耗量
  chapterRange String?    // 相关章节范围 (如: "1-5")
  
  // 关联
  novel        Novel
  
  // 时间戳
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}
```

---

## 🔌 API接口说明

### 小说管理接口 (Novel APIs)

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/novels` | 创建小说 |
| `GET` | `/novels` | 获取小说列表 (支持筛选、分页) |
| `GET` | `/novels/:id` | 获取小说详情 |
| `PATCH` | `/novels/:id` | 更新小说信息 |
| `DELETE` | `/novels/:id` | 删除小说 (级联删除章节、记忆) |
| `POST` | `/novels/:id/stats/update` | 更新统计信息 |
| `GET` | `/novels/:id/settings` | 获取小说设置 |
| `PATCH` | `/novels/:id/settings` | 更新小说设置 |

### 章节管理接口 (Chapter APIs)

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/novels/:novelId/chapters` | 创建章节 |
| `GET` | `/novels/:novelId/chapters` | 获取章节列表 |
| `GET` | `/novels/:novelId/chapters/:id` | 获取章节详情 |
| `GET` | `/novels/:novelId/chapters/:id/content` | 获取章节内容 |
| `PATCH` | `/novels/:novelId/chapters/:id` | 更新章节信息 |
| `PATCH` | `/novels/:novelId/chapters/:id/content` | 更新章节内容 |
| `DELETE` | `/novels/:novelId/chapters/:id` | 删除章节 |
| `PATCH` | `/novels/:novelId/chapters/status` | 批量更新状态 |
| `PATCH` | `/novels/:novelId/chapters/reorder` | 章节重排序 |

### 记忆管理接口 (Memory APIs)

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/novels/:novelId/memories` | 创建记忆 |
| `GET` | `/novels/:novelId/memories` | 获取记忆列表 |
| `GET` | `/memories/:id` | 获取记忆详情 |
| `PATCH` | `/memories/:id` | 更新记忆 |
| `DELETE` | `/memories/:id` | 删除记忆 |

---

## 🧪 测试方法

### 1. 环境准备

```bash
# 进入后端目录
cd 91Writing-Backend

# 生成Prisma客户端
npx prisma generate

# 同步数据库结构
npx prisma db push

# 启动服务
npm run start:dev
```

### 2. 数据模型基础测试

运行我们准备的测试脚本：

```bash
# 测试数据模型CRUD操作
node test-data-models.js
```

**测试内容包括**:
- ✅ 用户和Profile关联创建
- ✅ 小说创建和设置管理
- ✅ 章节创建和内容管理
- ✅ 记忆系统功能验证
- ✅ 关联查询测试
- ✅ 统计计算验证
- ✅ 枚举值功能测试

### 3. API接口测试

使用提供的HTTP测试文件：

```bash
# 使用VS Code REST Client插件
# 打开 test-apis.http 文件执行测试
```

**或者使用 Postman/Thunder Client** 导入接口进行测试。

### 4. 权限安全测试

验证以下安全机制：
- ✅ JWT认证保护
- ✅ 用户数据隔离
- ✅ 跨用户访问阻止
- ✅ 参数验证机制

---

## 📝 测试用例

### 用例1: 创建完整的小说项目

```http
POST /novels
{
  "title": "魔法学院编年史",
  "description": "一个关于年轻魔法师成长的故事",
  "genre": "奇幻",
  "settings": {
    "characters": [
      {
        "name": "艾莉亚",
        "role": "主角",
        "personality": "勇敢、好学"
      }
    ],
    "worldview": {
      "setting": "中世纪奇幻世界",
      "magic_system": "元素魔法"
    }
  }
}
```

**预期结果**: 
- 小说创建成功
- 自动生成ID和时间戳
- wordCount和chapterCount初始为0
- status默认为DRAFT

### 用例2: 添加章节并自动更新统计

```http
# 1. 创建章节
POST /novels/{novelId}/chapters
{
  "title": "第一章：入学",
  "content": "艾莉亚站在魔法学院的大门前...",
  "chapterNumber": 1,
  "wordCount": 1200
}

# 2. 更新小说统计
POST /novels/{novelId}/stats/update
```

**预期结果**:
- 章节创建成功
- 小说的chapterCount自动+1
- wordCount自动累加

### 用例3: 记忆系统管理

```http
# 创建核心记忆
POST /novels/{novelId}/memories
{
  "memoryType": "CORE",
  "content": {
    "type": "character_profile",
    "character": "艾莉亚",
    "details": {
      "personality": "勇敢、聪明",
      "abilities": ["火系魔法", "剑术"]
    }
  },
  "importance": 0.9,
  "chapterRange": "1-3"
}
```

**预期结果**:
- 记忆创建成功
- 可以按importance排序查询
- 支持按memoryType筛选

### 用例4: 数据级联删除测试

```http
# 删除小说
DELETE /novels/{novelId}
```

**预期结果**:
- 小说删除成功
- 所属章节自动删除
- 相关记忆自动删除
- 用户数据保持完整

---

## ❓ 常见问题

### Q1: 为什么使用JSON字段存储settings？
**A**: settings字段需要存储复杂的嵌套数据(角色信息、世界观设置等)，JSON格式提供了足够的灵活性，同时MySQL 8.0对JSON有良好的查询支持。

### Q2: chapterNumber和自动排序如何工作？
**A**: 
- chapterNumber是用户指定的章节序号
- 系统通过unique约束确保同一小说内序号不重复
- 提供reorder接口支持章节重新排序
- 查询时默认按chapterNumber升序排列

### Q3: 记忆系统的importance字段如何使用？
**A**:
- importance范围: 0.0-1.0
- 0.9+: 核心记忆 (主要角色、关键情节)
- 0.6-0.8: 重要记忆 (次要角色、背景设定)
- 0.5以下: 一般记忆 (细节描述、临时信息)

### Q4: 如何处理大量章节内容的性能问题？
**A**:
- content字段使用LONGTEXT，支持大文本
- 提供单独的/content接口，按需加载
- 列表查询时排除content字段
- 考虑后续添加内容分页机制

### Q5: 数据迁移和备份如何处理？
**A**:
- Prisma提供schema版本管理
- 支持数据库迁移脚本
- 级联删除确保数据一致性
- 建议定期备份重要数据

---

## 🎯 下一步计划 (Week 4)

基于完成的数据模型，Week 4将专注于：

1. **API文档生成** - 使用Swagger/OpenAPI
2. **单元测试** - 覆盖所有数据操作
3. **性能测试** - 验证大数据量场景
4. **代码优化** - 提升查询效率和代码质量

---

**测试完成标志** ✅  
- [ ] 所有CRUD操作正常
- [ ] 权限控制有效
- [ ] 关联查询准确
- [ ] 统计计算正确
- [ ] 级联操作安全
- [ ] API响应格式标准

**测试负责人**: AI Assistant  
**验证人**: 项目开发者  
**文档版本**: v1.0
