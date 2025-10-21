# Phase 2 部署指南

**功能**: 世界观一致性检测 + 角色一致性助手  
**部署时间**: 约30-60分钟  
**状态**: ✅ 代码已创建，准备部署

---

## 📦 已创建的文件清单

### 后端文件 (10个)

#### 数据库
- ✅ `91Writing-Backend/prisma/migrations/add_phase2_consistency_tables.sql`

#### 一致性检测模块 (ai-service)
- ✅ `apps/ai-service/src/modules/consistency/dto/create-consistency-check.dto.ts`
- ✅ `apps/ai-service/src/modules/consistency/dto/resolve-issue.dto.ts`
- ✅ `apps/ai-service/src/modules/consistency/consistency-check.service.ts`
- ✅ `apps/ai-service/src/modules/consistency/consistency-check.controller.ts`
- ✅ `apps/ai-service/src/modules/consistency/consistency.module.ts`

#### 角色一致性模块 (novel-service)
- ✅ `apps/novel-service/src/modules/character-consistency/dto/extract-features.dto.ts`
- ✅ `apps/novel-service/src/modules/character-consistency/character-consistency.service.ts`
- ✅ `apps/novel-service/src/modules/character-consistency/character-consistency.controller.ts`
- ✅ `apps/novel-service/src/modules/character-consistency/character-consistency.module.ts`

### 前端文件 (6个)

#### Service
- ✅ `src/services/consistencyService.js`
- ✅ `src/services/characterConsistencyService.js`

#### 组件
- ✅ `src/components/consistency/ConsistencyCheckPanel.vue`
- ✅ `src/components/consistency/IssueList.vue`
- ✅ `src/components/character-consistency/CharacterFeaturePanel.vue`
- ✅ `src/components/character-consistency/FeatureList.vue`
- ✅ `src/components/character-consistency/CharacterStatisticsPanel.vue`
- ✅ `src/components/character-consistency/CharacterHintWidget.vue`

**总计**: 16个文件已创建 ✅

---

## 🚀 部署步骤

### 第1步: 更新 Prisma Schema

修改 `91Writing-Backend/prisma/schema.prisma`，添加新的数据模型：

```prisma
// 在文件末尾添加以下模型

// =============================================
// Phase 2: 一致性检测和角色助手
// =============================================

// 一致性检测记录
model ConsistencyCheck {
  id          String   @id @default(uuid())
  novelId     String
  novel       Novel    @relation(fields: [novelId], references: [id], onDelete: Cascade)
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  checkType   String
  status      String   @default("pending")
  chapterIds  Json?
  
  totalIssues    Int   @default(0)
  criticalIssues Int   @default(0)
  warningIssues  Int   @default(0)
  
  issues      ConsistencyIssue[]
  
  startedAt   DateTime?
  completedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([novelId])
  @@index([userId])
  @@index([status])
}

// 一致性问题
model ConsistencyIssue {
  id          String   @id @default(uuid())
  checkId     String
  check       ConsistencyCheck @relation(fields: [checkId], references: [id], onDelete: Cascade)
  
  category    String
  severity    String
  title       String   @db.VarChar(200)
  description String   @db.Text
  
  chapterId   String?
  chapter     Chapter? @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  chapterNumber Int?
  locationText String?  @db.Text
  conflictWith String? @db.Text
  
  suggestions  Json?
  aiConfidence Float?
  
  status      String   @default("unresolved")
  userNote    String?  @db.Text
  resolvedAt  DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([checkId])
  @@index([category])
  @@index([severity])
  @@index([status])
}

// 世界观规则库
model WorldviewRule {
  id          String   @id @default(uuid())
  novelId     String
  novel       Novel    @relation(fields: [novelId], references: [id], onDelete: Cascade)
  
  ruleType    String
  ruleName    String   @db.VarChar(100)
  ruleContent String   @db.Text
  parameters  Json?
  
  extractedFrom String?
  sourceChapterId String?
  sourceChapter   Chapter? @relation(fields: [sourceChapterId], references: [id], onDelete: SetNull)
  
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([novelId])
  @@index([ruleType])
}

// 时间线事件
model TimelineEvent {
  id          String   @id @default(uuid())
  novelId     String
  novel       Novel    @relation(fields: [novelId], references: [id], onDelete: Cascade)
  
  eventName   String   @db.VarChar(200)
  description String?  @db.Text
  chapterNumber Int
  eventOrder  Int
  
  timeExpression String? @db.VarChar(500)
  estimatedDays Int?
  
  chapterId   String
  chapter     Chapter  @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  involvedCharacters Json?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([novelId])
  @@index([chapterId])
  @@unique([novelId, chapterNumber, eventOrder])
}

// 角色特征库
model CharacterFeature {
  id            String   @id @default(uuid())
  characterId   String
  character     Character @relation(fields: [characterId], references: [id], onDelete: Cascade)
  
  featureType   String
  featureName   String   @db.VarChar(100)
  featureValue  String   @db.Text
  
  extractedFrom String
  sourceChapterId String?
  sourceChapter   Chapter? @relation(fields: [sourceChapterId], references: [id], onDelete: SetNull)
  locationInText  String?  @db.Text
  
  confidence    Float    @default(1.0)
  isConfirmed   Boolean  @default(false)
  
  firstMentioned DateTime @default(now())
  lastUpdated    DateTime @updatedAt

  @@index([characterId])
  @@index([featureType])
}

// 角色出场记录
model CharacterAppearance {
  id            String   @id @default(uuid())
  characterId   String
  character     Character @relation(fields: [characterId], references: [id], onDelete: Cascade)
  
  chapterId     String
  chapter       Chapter  @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  
  mentionCount  Int      @default(0)
  dialogueCount Int      @default(0)
  actionCount   Int      @default(0)
  emotionalState String?
  majorActions   Json?
  
  createdAt     DateTime @default(now())

  @@index([characterId])
  @@index([chapterId])
  @@unique([characterId, chapterId])
}

// 角色一致性警告
model CharacterConsistencyWarning {
  id            String   @id @default(uuid())
  characterId   String
  character     Character @relation(fields: [characterId], references: [id], onDelete: Cascade)
  
  warningType   String
  severity      String
  description   String   @db.Text
  suggestion    String?  @db.Text
  
  chapterId     String
  chapter       Chapter  @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  locationText  String?  @db.Text
  conflictWith  String?  @db.Text
  
  status        String   @default("active")
  resolvedAt    DateTime?
  createdAt     DateTime @default(now())

  @@index([characterId])
  @@index([status])
}

// 在 Novel 模型中添加关系
model Novel {
  // ... 现有字段
  consistencyChecks ConsistencyCheck[]
  worldviewRules    WorldviewRule[]
  timelineEvents    TimelineEvent[]
}

// 在 Chapter 模型中添加关系
model Chapter {
  // ... 现有字段
  consistencyIssues          ConsistencyIssue[]
  worldviewRules             WorldviewRule[]
  timelineEvents             TimelineEvent[]
  characterFeatures          CharacterFeature[]
  characterAppearances       CharacterAppearance[]
  characterConsistencyWarnings CharacterConsistencyWarning[]
}

// 在 Character 模型中添加关系
model Character {
  // ... 现有字段
  features                   CharacterFeature[]
  appearances                CharacterAppearance[]
  consistencyWarnings        CharacterConsistencyWarning[]
}

// 在 User 模型中添加关系
model User {
  // ... 现有字段
  consistencyChecks ConsistencyCheck[]
}
```

### 第2步: 执行数据库迁移

```bash
cd 91Writing-Backend

# 生成 Prisma Client
npx prisma generate

# 执行迁移（开发环境）
npx prisma migrate dev --name add_phase2_consistency_features

# 或直接推送到数据库（生产环境）
npx prisma db push
```

### 第3步: 注册模块到 AppModule

#### ai-service 的 app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@app/database';
// ... 其他导入

import { ConsistencyModule } from './modules/consistency/consistency.module';  // 新增

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    // ... 其他模块
    ConsistencyModule,  // 新增
  ],
})
export class AppModule {}
```

#### novel-service 的 app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@app/database';
// ... 其他导入

import { CharacterConsistencyModule } from './modules/character-consistency/character-consistency.module';  // 新增

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    // ... 其他模块
    CharacterConsistencyModule,  // 新增
  ],
})
export class AppModule {}
```

### 第4步: 配置 API Gateway 路由

在 `91Writing-Backend/apps/api-gateway/src/modules/proxy/proxy.service.ts` 中，确保路由正确代理：

```typescript
// AI服务路由
if (path.startsWith('/consistency-checks') || 
    path.startsWith('/consistency-issues')) {
  return this.proxyToService('AI_SERVICE_URL', path, req);
}

// Novel服务路由
if (path.startsWith('/characters/') && 
    (path.includes('/features') || path.includes('/statistics') || path.includes('/warnings'))) {
  return this.proxyToService('NOVEL_SERVICE_URL', path, req);
}

if (path.startsWith('/chapters/') && path.includes('/check-consistency')) {
  return this.proxyToService('NOVEL_SERVICE_URL', path, req);
}
```

### 第5步: 配置前端路由

在 `src/router/index.js` 中添加路由：

```javascript
{
  path: '/novel/:novelId/consistency',
  name: 'ConsistencyCheck',
  component: () => import('@/views/NovelConsistencyCheck.vue'),
  meta: { requiresAuth: true }
},
{
  path: '/character/:characterId/analysis',
  name: 'CharacterAnalysis',
  component: () => import('@/views/CharacterAnalysis.vue'),
  meta: { requiresAuth: true }
}
```

### 第6步: 创建视图页面

#### src/views/NovelConsistencyCheck.vue

```vue
<template>
  <div class="consistency-check-view">
    <el-page-header @back="goBack" title="返回">
      <template #content>
        <span class="page-title">一致性检测</span>
      </template>
    </el-page-header>

    <ConsistencyCheckPanel
      :novel-id="novelId"
      :chapters="chapters"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ConsistencyCheckPanel from '@/components/consistency/ConsistencyCheckPanel.vue'

const route = useRoute()
const router = useRouter()
const novelId = route.params.novelId

const chapters = ref([])

const loadChapters = async () => {
  // 从你的 chapter service 加载章节列表
  // chapters.value = await chapterService.getList(novelId)
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  loadChapters()
})
</script>

<style scoped>
.consistency-check-view {
  padding: 20px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
}
</style>
```

### 第7步: 环境变量配置

确保 `.env` 文件包含必要的配置：

```env
# OpenAI API (用于AI检测和特征提取)
OPENAI_API_KEY=your-api-key-here
OPENAI_API_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL_NAME=gpt-3.5-turbo

# AI服务配置
AI_SERVICE_URL=http://localhost:3003
AI_SERVICE_PORT=3003

# Novel服务配置
NOVEL_SERVICE_URL=http://localhost:3002
NOVEL_SERVICE_PORT=3002

# 一致性检测配置
CONSISTENCY_CHECK_BATCH_SIZE=3
CONSISTENCY_CHECK_TIMEOUT=300000

# JWT配置（应该已有）
JWT_SECRET=your-jwt-secret-here
```

### 第8步: 重启服务

```bash
# 停止所有服务
cd 91Writing-Backend
npm run stop

# 重新编译
npm run build

# 启动所有服务
npm run start:all

# 或分别启动
npm run start:api-gateway
npm run start:ai-service
npm run start:novel-service
```

### 第9步: 启动前端

```bash
cd 91Writing
npm run dev
```

---

## 🧪 测试验证

### 1. 测试后端API

使用 Postman 或 cURL 测试：

```bash
# 获取 JWT Token
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@91writing.com","password":"password123"}'

# 设置 token
TOKEN="your-jwt-token-here"

# 测试一致性检测
curl -X POST http://localhost:3000/api/v1/novels/{novelId}/consistency-check \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "checkType": "worldview",
    "aiEnhanced": true
  }'

# 测试角色特征提取
curl -X POST http://localhost:3000/api/v1/characters/{characterId}/features/extract \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chapterId": "chapter123",
    "autoConfirm": false
  }'

# 获取角色统计
curl -X GET http://localhost:3000/api/v1/characters/{characterId}/statistics \
  -H "Authorization: Bearer $TOKEN"
```

### 2. 测试前端功能

#### 一致性检测测试
- [ ] 打开检测配置界面
- [ ] 选择检测类型
- [ ] 选择检测范围
- [ ] 启动检测
- [ ] 查看检测进度
- [ ] 查看检测结果
- [ ] 处理检测问题
- [ ] 查看历史记录

#### 角色特征测试
- [ ] 打开角色特征面板
- [ ] 提取角色特征
- [ ] 查看提取结果
- [ ] 确认特征
- [ ] 查看统计信息
- [ ] 查看一致性警告

### 3. 集成测试

创建测试小说进行完整流程测试：

1. 创建测试小说
2. 添加世界观设定（魔法体系、等级制度）
3. 创建角色
4. 写入多个章节（故意包含一些矛盾）
5. 运行一致性检测
6. 验证检测结果
7. 提取角色特征
8. 验证特征提示

---

## 📋 检查清单

### 后端检查

- [ ] Prisma Schema 更新正确
- [ ] 数据库迁移执行成功
- [ ] 所有模块正确注册
- [ ] API Gateway 路由配置正确
- [ ] 环境变量配置完整
- [ ] 所有服务启动成功
- [ ] API 接口可以正常访问
- [ ] JWT 认证工作正常

### 前端检查

- [ ] Service 文件导入正确
- [ ] 组件路径正确
- [ ] 路由配置正确
- [ ] 组件可以正常渲染
- [ ] API 调用成功
- [ ] 错误处理正常
- [ ] Loading 状态显示
- [ ] 用户提示友好

### 功能检查

- [ ] 一致性检测可以创建
- [ ] 检测进度实时更新
- [ ] 检测结果正确显示
- [ ] 问题可以标记解决
- [ ] 历史记录可以查看
- [ ] 角色特征可以提取
- [ ] 特征列表正确显示
- [ ] 统计图表正确渲染
- [ ] 警告提示正常工作

---

## ⚠️ 常见问题

### 问题1: 数据库迁移失败

**解决方案**:
```bash
# 检查 Prisma Schema 语法
npx prisma validate

# 强制重置数据库（仅开发环境！）
npx prisma migrate reset

# 重新生成
npx prisma generate
```

### 问题2: 模块导入错误

**解决方案**:
```bash
# 清理并重新编译
cd 91Writing-Backend
rm -rf dist/
npm run build
```

### 问题3: 前端组件找不到

**解决方案**:
```bash
# 检查组件路径
# 确保 import 路径正确
# 确保文件名大小写匹配
```

### 问题4: API 404错误

**解决方案**:
- 检查 API Gateway 路由配置
- 检查微服务是否启动
- 检查 Controller 路径是否正确（不应有前缀）
- 查看服务日志

### 问题5: API 401错误

**解决方案**:
- 检查是否添加了 `@UseGuards(JwtAuthGuard)`
- 检查前端是否发送了 Authorization 头
- 检查 JWT_SECRET 配置
- 验证 Token 是否有效

---

## 📊 性能监控

### 关键指标

| 指标 | 目标 | 监控方法 |
|------|------|----------|
| API响应时间 | < 500ms | 查看服务日志 |
| AI检测时间 | < 30s/章节 | 前端进度显示 |
| 特征提取时间 | < 10s | API响应时间 |
| 数据库查询 | < 100ms | Prisma日志 |

### 优化建议

如果性能不达标：

1. **添加缓存**
```typescript
// 使用 Redis 缓存检测结果
const cacheKey = `consistency:${novelId}:${checkType}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);
```

2. **批量处理优化**
```typescript
// 减少批量大小
const batchSize = 2; // 从3改为2

// 添加延迟避免API限流
await new Promise(resolve => setTimeout(resolve, 1000));
```

3. **数据库索引**
```sql
-- 添加复合索引
CREATE INDEX idx_consistency_novel_status ON ConsistencyCheck(novelId, status);
CREATE INDEX idx_issue_check_severity ON ConsistencyIssue(checkId, severity);
```

---

## 🎉 部署完成

### 验证清单

部署完成后，确认以下功能正常：

- [x] 可以创建一致性检测
- [x] 检测进度正确显示
- [x] 检测结果正确展示
- [x] 可以标记问题解决
- [x] 可以查看历史记录
- [x] 可以提取角色特征
- [x] 特征列表正确显示
- [x] 统计图表正确渲染
- [x] 警告提示正常工作

### 成功标志

✅ 所有API接口返回200  
✅ 前端组件正常渲染  
✅ AI功能正常工作  
✅ 数据正确保存和读取  

---

**部署完成后，Phase 2 功能即可使用！** 🚀✨

**问题反馈**: 如遇到问题，请查看 [接口错误排查指南](./91Writing-Backend/接口错误排查指南.md)

