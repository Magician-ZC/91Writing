# Phase 2 快速开始指南

**5分钟快速部署 Phase 2 功能**

---

## ⚡ 快速部署（推荐）

### Windows 用户

```bash
# 1. 运行部署脚本
cd scripts
.\deploy-phase2.bat

# 2. 根据提示完成部署
# 脚本会自动：
#   - 检查环境
#   - 生成 Prisma Client
#   - 执行数据库迁移
#   - 编译后端代码
```

### Linux/Mac 用户

```bash
# 1. 添加执行权限
cd scripts
chmod +x deploy-phase2.sh

# 2. 运行部署脚本
./deploy-phase2.sh

# 3. 根据提示完成部署
```

---

## 📋 部署后的配置

### 1. 更新 Prisma Schema

**重要**: 需要手动将以下内容添加到 `91Writing-Backend/prisma/schema.prisma`

在文件末尾添加（完整代码见 [PHASE2-部署指南.md](./PHASE2-部署指南.md)）：

```prisma
// Phase 2 Models
model ConsistencyCheck { ... }
model ConsistencyIssue { ... }
model WorldviewRule { ... }
model TimelineEvent { ... }
model CharacterFeature { ... }
model CharacterAppearance { ... }
model CharacterConsistencyWarning { ... }
```

### 2. 注册模块

#### ai-service/src/app.module.ts

```typescript
import { ConsistencyModule } from './modules/consistency/consistency.module';

@Module({
  imports: [
    // ... 其他模块
    ConsistencyModule,  // 新增
  ],
})
export class AppModule {}
```

#### novel-service/src/app.module.ts

```typescript
import { CharacterConsistencyModule } from './modules/character-consistency/character-consistency.module';

@Module({
  imports: [
    // ... 其他模块
    CharacterConsistencyModule,  // 新增
  ],
})
export class AppModule {}
```

### 3. 配置路由（可选）

如果需要独立页面，在 `src/router/index.js` 添加：

```javascript
{
  path: '/novel/:novelId/consistency',
  name: 'ConsistencyCheck',
  component: () => import('@/views/NovelConsistencyCheck.vue'),
  meta: { requiresAuth: true }
}
```

---

## 🚀 启动服务

```bash
# 后端
cd 91Writing-Backend
npm run start:dev

# 前端（新终端）
cd 91Writing
npm run dev
```

---

## 🧪 快速测试

### 1. 测试一致性检测

```bash
# 1. 登录获取token
# 2. 创建检测任务

curl -X POST http://localhost:3000/api/v1/novels/{novelId}/consistency-check \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "checkType": "worldview",
    "aiEnhanced": true
  }'

# 3. 查看结果（使用返回的checkId）
curl -X GET http://localhost:3000/api/v1/consistency-checks/{checkId} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. 测试角色特征

```bash
# 提取特征
curl -X POST http://localhost:3000/api/v1/characters/{characterId}/features/extract \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chapterId": "chapter123",
    "autoConfirm": false
  }'

# 查看统计
curl -X GET http://localhost:3000/api/v1/characters/{characterId}/statistics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 功能访问

### 在编辑器中使用

#### 方式1: 集成到现有组件

在 `WriterCharacterPanel.vue` 中添加：

```vue
<el-tab-pane label="特征管理" name="features">
  <CharacterFeaturePanel
    :character-id="currentCharacter.id"
    :character-name="currentCharacter.name"
    :chapters="chapters"
  />
</el-tab-pane>

<el-tab-pane label="统计分析" name="statistics">
  <CharacterStatisticsPanel
    :character-id="currentCharacter.id"
  />
</el-tab-pane>
```

#### 方式2: 在工具栏添加按钮

在 Writer 页面工具栏添加：

```vue
<el-button @click="openConsistencyCheck">
  <el-icon><DocumentChecked /></el-icon>
  一致性检测
</el-button>
```

---

## ✅ 验证清单

### 后端验证

- [ ] 数据库表创建成功
- [ ] Prisma Client 生成成功
- [ ] 服务正常启动
- [ ] API 接口可访问
- [ ] Swagger 文档显示正常
- [ ] JWT 认证工作正常

### 前端验证

- [ ] 组件可以正常导入
- [ ] 页面可以正常渲染
- [ ] API 调用成功
- [ ] 数据正确显示
- [ ] 交互功能正常

### 功能验证

- [ ] 可以创建检测任务
- [ ] 检测进度正确显示
- [ ] 检测结果正确展示
- [ ] 可以提取角色特征
- [ ] 统计图表正确显示

---

## 🎯 快速使用

### 场景1: 检测世界观一致性

1. 进入小说详情页
2. 点击"一致性检测"按钮
3. 选择"世界观检测"
4. 点击"开始检测"
5. 等待1-2分钟
6. 查看检测结果
7. 处理发现的问题

### 场景2: 管理角色特征

1. 进入角色管理页面
2. 选择一个角色
3. 切换到"特征管理"标签
4. 点击"AI提取特征"
5. 选择一个章节
6. 查看提取的特征
7. 确认或删除特征

### 场景3: 查看角色统计

1. 进入角色管理页面
2. 选择一个角色
3. 切换到"统计分析"标签
4. 查看出场次数、对话占比
5. 查看出场趋势图表

---

## 📞 需要帮助？

### 文档

- **部署问题**: [PHASE2-部署指南.md](./PHASE2-部署指南.md)
- **接口问题**: [接口错误排查指南](./91Writing-Backend/接口错误排查指南.md)
- **功能说明**: [PHASE2-完整实施总结.md](./PHASE2-完整实施总结.md)

### 常见问题

**Q: 部署后API返回404？**  
A: 检查 AppModule 是否正确导入了新模块

**Q: 检测一直显示"处理中"？**  
A: 检查 OpenAI API Key 配置，查看后端日志

**Q: 组件找不到？**  
A: 确认文件路径和导入路径正确

---

**Phase 2 快速开始指南** - 让部署更简单！ 🚀

