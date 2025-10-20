# 91Writing 集成测试指南

> **目标**: 确保Phase 1所有功能正常运行，提供高质量的创作工具MVP版本  
> **测试范围**: Week 4-10 所有核心功能  
> **更新日期**: 2025-01-20

---

## 📋 测试总览

### 测试类别

1. **API端到端测试** - 验证所有API端点正常工作
2. **用户流程测试** - 验证完整的用户使用场景
3. **数据一致性测试** - 验证多设备数据同步
4. **性能测试** - 验证系统响应速度
5. **安全测试** - 验证权限控制和数据隔离

---

## 🎯 核心功能测试清单

### 1. 用户系统 (Week 4-5) ✅

#### 注册登录流程
```bash
测试场景 1: 用户注册
├─ POST /auth/register
├─ 输入: email, password, username
├─ 预期: 返回用户信息和JWT token
└─ 验证: 用户数据已存入数据库

测试场景 2: 用户登录
├─ POST /auth/login
├─ 输入: email, password
├─ 预期: 返回JWT token
└─ 验证: token有效期7天

测试场景 3: 获取用户信息
├─ GET /auth/me
├─ Headers: Authorization: Bearer {token}
├─ 预期: 返回当前用户信息
└─ 验证: 用户ID匹配
```

#### 测试用例
```typescript
// 注册测试
POST /auth/register
Body: {
  "email": "test@example.com",
  "password": "Test123!@#",
  "username": "testuser"
}
Expected: 201 Created, { success: true, data: {...} }

// 登录测试
POST /auth/login
Body: {
  "email": "test@example.com",
  "password": "Test123!@#"
}
Expected: 200 OK, { success: true, data: { token: "..." } }
```

---

### 2. 小说管理系统 (Week 4-6) ✅

#### 小说CRUD测试
```bash
测试场景 1: 创建小说
├─ POST /novels
├─ 输入: title, description, genre
├─ 预期: 返回小说对象
└─ 验证: novelId生成，userId正确

测试场景 2: 获取小说列表
├─ GET /novels
├─ 预期: 返回当前用户的小说列表
└─ 验证: 只返回属于当前用户的小说

测试场景 3: 更新小说
├─ PUT /novels/:id
├─ 预期: 更新成功
└─ 验证: updatedAt时间戳更新

测试场景 4: 删除小说
├─ DELETE /novels/:id
├─ 预期: 删除成功
└─ 验证: 关联章节也被删除（级联删除）
```

#### 章节管理测试
```bash
测试场景 1: 创建章节
├─ POST /chapters
├─ 输入: novelId, title, content, chapterNumber
├─ 预期: 返回章节对象
└─ 验证: wordCount自动计算

测试场景 2: 更新章节
├─ PUT /chapters/:id
├─ 预期: 更新成功
└─ 验证: 版本号增加，旧版本已保存

测试场景 3: 章节版本控制
├─ GET /chapters/:id/versions
├─ 预期: 返回版本历史
└─ 验证: 版本按时间倒序排列

测试场景 4: 恢复历史版本
├─ POST /chapters/:id/versions/:versionId/restore
├─ 预期: 恢复成功
└─ 验证: 内容已恢复，创建新版本
```

---

### 3. AI写作功能 (Week 5-7) ✅

#### AI配置管理测试
```bash
测试场景 1: 创建AI配置
├─ POST /ai-configs
├─ 输入: name, provider, model, apiUrl, apiKey
├─ 预期: 配置创建成功
└─ 验证: apiKey已加密存储

测试场景 2: 获取AI配置列表
├─ GET /ai-configs
├─ 预期: 返回配置列表
└─ 验证: apiKey已脱敏显示

测试场景 3: 设置默认配置
├─ POST /ai-configs/:id/set-default
├─ 预期: 设置成功
└─ 验证: 其他配置isDefault=false
```

#### AI内容生成测试
```bash
测试场景 1: 续写内容
├─ POST /ai/generate
├─ 输入: prompt, configId, maxTokens
├─ 预期: 返回生成的内容
└─ 验证: 响应时间<30秒

测试场景 2: 重试机制测试
├─ 模拟API失败
├─ 预期: 自动重试3次
└─ 验证: 失败后切换到备用配置

测试场景 3: 智能上下文管理
├─ POST /ai/generate with novelId, chapterId
├─ 预期: 自动提取记忆和章节内容
└─ 验证: 生成内容与上下文相关
```

---

### 4. 记忆系统 (Week 7) ✅

#### 记忆CRUD测试
```bash
测试场景 1: 创建记忆
├─ POST /memories
├─ 输入: novelId, memoryType, content, importance
├─ 预期: 记忆创建成功
└─ 验证: importance默认值0.5

测试场景 2: 智能提取记忆
├─ POST /memories/extract
├─ 输入: chapterId, extractionType
├─ 预期: 自动提取关键信息
└─ 验证: 提取的记忆包含角色、情节等

测试场景 3: 搜索记忆
├─ GET /memories/novel/:novelId/search?keywords=关键词
├─ 预期: 返回相关记忆列表
└─ 验证: 结果按相关性排序
```

---

### 5. 写作建议系统 (Week 7) ✅

#### 建议生成测试
```bash
测试场景 1: AI生成建议
├─ POST /suggestions/generate
├─ 输入: novelId, chapterId, dimensions
├─ 预期: 生成多维度建议
└─ 验证: 每个维度至少1条建议

测试场景 2: 采纳建议
├─ POST /suggestions/adopt
├─ 输入: suggestionId, feedback
├─ 预期: 采纳成功
└─ 验证: isAdopted=true, adoptedAt已设置

测试场景 3: 评价建议
├─ POST /suggestions/rate
├─ 输入: suggestionId, rating(1-5)
├─ 预期: 评价成功
└─ 验证: rating值已保存
```

---

### 6. 角色和世界观系统 (Week 8) ✅

#### 角色管理测试
```bash
测试场景 1: 创建角色
├─ POST /characters
├─ 输入: novelId, name, role, 详细属性
├─ 预期: 角色创建成功
└─ 验证: 所有属性正确保存

测试场景 2: 角色关系管理
├─ POST /characters/:id/relationships
├─ 输入: toCharId, relationshipType, intimacy
├─ 预期: 关系创建成功
└─ 验证: 双向关系正确建立

测试场景 3: 角色出场记录
├─ POST /characters/:id/appearances
├─ 输入: chapterId, scenes, importance
├─ 预期: 记录成功
└─ 验证: appearanceCount自动增加
```

#### 世界观管理测试
```bash
测试场景 1: 创建世界观设定
├─ POST /world-settings
├─ 输入: novelId, category, name, details
├─ 预期: 设定创建成功
└─ 验证: category枚举值有效

测试场景 2: 按类别查询
├─ GET /world-settings/novel/:novelId?category=LOCATION
├─ 预期: 返回指定类别设定
└─ 验证: 所有结果category匹配
```

---

### 7. 数据迁移系统 (Week 9) ✅

#### 迁移功能测试
```bash
测试场景 1: 验证迁移数据
├─ POST /migrations/validate
├─ 输入: migrationType, data
├─ 预期: 返回验证结果
└─ 验证: 错误列表准确

测试场景 2: 批量导入小说
├─ POST /migrations/batch-import-novels
├─ 输入: novels数组（包含chapters）
├─ 预期: 导入成功
└─ 验证: 成功/失败统计准确

测试场景 3: 迁移回滚
├─ POST /migrations/:id/rollback
├─ 预期: 回滚成功
└─ 验证: 状态更新为ROLLED_BACK
```

---

### 8. 素材管理系统 (Week 9-10) ✅

#### 素材基础功能测试
```bash
测试场景 1: 上传素材
├─ POST /materials
├─ 输入: name, type, fileUrl, fileSize
├─ 预期: 素材创建成功
└─ 验证: 存储配额已更新

测试场景 2: 批量删除
├─ POST /materials/batch-delete
├─ 输入: materialIds数组
├─ 预期: 批量删除成功
└─ 验证: 配额正确减少

测试场景 3: 批量更新分类
├─ POST /materials/batch-update-category
├─ 输入: materialIds, category
├─ 预期: 批量更新成功
└─ 验证: 所有素材category已更新
```

#### 素材引用追踪测试
```bash
测试场景 1: 添加引用
├─ POST /materials/:id/references
├─ 输入: chapterId, novelId, context
├─ 预期: 引用记录创建成功
└─ 验证: usageCount增加

测试场景 2: 获取引用列表
├─ GET /materials/:id/references
├─ 预期: 返回所有引用记录
└─ 验证: 按时间倒序排列

测试场景 3: 删除引用
├─ DELETE /materials/references/:referenceId
├─ 预期: 删除成功
└─ 验证: usageCount减少
```

#### 存储配额测试
```bash
测试场景 1: 获取配额信息
├─ GET /materials/storage/quota
├─ 预期: 返回配额详情
└─ 验证: usagePercentage计算正确

测试场景 2: 配额限制测试
├─ 上传超过配额的素材
├─ 预期: 返回错误提示
└─ 验证: 提示剩余空间不足
```

---

## 🔄 完整用户流程测试

### 流程 1: 从注册到完成第一部小说

```bash
步骤 1: 用户注册
├─ POST /auth/register
└─ 获取JWT token

步骤 2: 创建小说
├─ POST /novels
├─ 输入: title="我的第一部小说", genre="玄幻"
└─ 获取novelId

步骤 3: 创建角色
├─ POST /characters
├─ 输入: novelId, name="张三", role="PROTAGONIST"
└─ 获取characterId

步骤 4: 创建世界观
├─ POST /world-settings
├─ 输入: novelId, category="LOCATION", name="修仙界"
└─ 获取worldSettingId

步骤 5: 创建第一章
├─ POST /chapters
├─ 输入: novelId, title="第一章", content="..."
└─ 获取chapterId

步骤 6: 使用AI续写
├─ POST /ai/generate
├─ 输入: novelId, chapterId, prompt="续写剧情"
└─ 获取生成内容

步骤 7: 添加记忆
├─ POST /memories
├─ 输入: novelId, memoryType="CORE", content="主角设定"
└─ 记忆已保存

步骤 8: 获取写作建议
├─ POST /suggestions/generate
├─ 输入: novelId, chapterId
└─ 获取建议列表

步骤 9: 上传角色立绘
├─ POST /materials
├─ 输入: name="主角立绘.png", type="IMAGE"
└─ 素材已保存

步骤 10: 添加素材引用
├─ POST /materials/:id/references
├─ 输入: chapterId, context="描述主角外貌"
└─ 引用已记录

验证: 整个流程无错误，数据一致性良好
```

---

### 流程 2: 数据迁移完整流程

```bash
步骤 1: 准备本地数据
├─ 从localStorage读取
└─ 格式: { novels: [...], materials: [...] }

步骤 2: 验证数据
├─ POST /migrations/validate
├─ 输入: migrationType="FULL", data
└─ 确认无错误

步骤 3: 开始迁移
├─ POST /migrations/start
├─ 输入: migrationType="FULL", sourceData
└─ 获取migrationId

步骤 4: 查看迁移进度
├─ GET /migrations/:id
└─ 验证: status, successItems, failedItems

步骤 5: 验证迁移结果
├─ GET /novels
├─ GET /materials
└─ 验证: 所有数据已迁移

步骤 6: (可选) 回滚测试
├─ POST /migrations/:id/rollback
└─ 验证: 状态已更新
```

---

## 🚀 性能测试

### 响应时间要求

| API类别 | 目标响应时间 | 最大可接受 |
|---------|-------------|-----------|
| 用户登录 | <500ms | <1s |
| 小说列表 | <200ms | <500ms |
| 章节列表 | <200ms | <500ms |
| 章节内容 | <300ms | <800ms |
| AI生成 | <10s | <30s |
| 搜索操作 | <500ms | <1s |
| 批量操作 | <2s | <5s |

### 性能测试工具

```bash
# 使用Apache Bench
ab -n 1000 -c 10 http://localhost:3001/novels

# 使用wrk
wrk -t12 -c400 -d30s http://localhost:3001/novels

# 使用Postman Collection Runner
# 创建性能测试集合，循环执行100次
```

---

## 🔒 安全测试

### 权限测试

```bash
测试场景 1: 未授权访问
├─ 不带token访问需要认证的API
├─ 预期: 401 Unauthorized
└─ 验证: 错误消息清晰

测试场景 2: 跨用户数据访问
├─ 用户A尝试访问用户B的小说
├─ 预期: 404 Not Found (不泄露数据存在性)
└─ 验证: 数据隔离正确

测试场景 3: Token过期
├─ 使用过期token访问
├─ 预期: 401 Unauthorized
└─ 验证: 提示token已过期

测试场景 4: 权限提升
├─ 普通用户访问管理员接口
├─ 预期: 403 Forbidden
└─ 验证: 权限检查正确
```

### 数据安全测试

```bash
测试场景 1: API Key加密
├─ 查看数据库中的apiKey字段
├─ 预期: 密文存储
└─ 验证: 无法直接读取原文

测试场景 2: SQL注入防护
├─ 输入: title="'; DROP TABLE novels;--"
├─ 预期: 正常处理（Prisma自动防护）
└─ 验证: 数据库完整

测试场景 3: XSS防护
├─ 输入: content="<script>alert('xss')</script>"
├─ 预期: 内容已转义
└─ 验证: 前端显示安全
```

---

## 📊 数据一致性测试

### 多设备同步测试

```bash
测试场景 1: 同一用户多设备登录
├─ 设备A和设备B使用同一账号
├─ 设备A创建小说
├─ 设备B获取小说列表
├─ 预期: 新小说立即可见
└─ 验证: 数据同步正确

测试场景 2: 并发编辑冲突
├─ 设备A和设备B同时编辑同一章节
├─ 设备A先提交
├─ 设备B后提交
├─ 预期: 检测到冲突，提供解决方案
└─ 验证: 数据未丢失
```

### 关联数据一致性测试

```bash
测试场景 1: 删除小说级联删除
├─ 创建小说和多个章节
├─ 删除小说
├─ 预期: 所有章节也被删除
└─ 验证: 数据库无孤儿记录

测试场景 2: 素材引用统计
├─ 创建素材并添加3个引用
├─ 验证: usageCount=3
├─ 删除1个引用
├─ 验证: usageCount=2
└─ 验证: 统计始终准确
```

---

## 🐛 错误处理测试

### 常见错误场景

```bash
测试场景 1: 参数验证错误
├─ POST /novels with invalid data
├─ 预期: 400 Bad Request
└─ 验证: 错误消息明确指出问题字段

测试场景 2: 资源不存在
├─ GET /novels/invalid-id
├─ 预期: 404 Not Found
└─ 验证: 错误消息友好

测试场景 3: 服务器错误
├─ 模拟数据库连接失败
├─ 预期: 500 Internal Server Error
└─ 验证: 错误已记录日志，用户看到友好提示

测试场景 4: 业务逻辑错误
├─ 尝试删除已发布的章节
├─ 预期: 400 Bad Request
└─ 验证: 错误消息说明业务规则
```

---

## ✅ 测试检查清单

### Phase 1 完整测试清单

- [ ] **用户系统**
  - [ ] 注册、登录、登出
  - [ ] JWT token有效性
  - [ ] 用户信息获取和更新
  
- [ ] **小说管理**
  - [ ] 小说CRUD完整流程
  - [ ] 章节CRUD完整流程
  - [ ] 版本控制和恢复
  - [ ] 数据冲突检测
  
- [ ] **AI功能**
  - [ ] AI配置管理
  - [ ] 内容生成
  - [ ] 智能上下文提取
  - [ ] 重试和降级策略
  
- [ ] **记忆系统**
  - [ ] 记忆CRUD
  - [ ] 智能提取
  - [ ] 相关性搜索
  - [ ] 重要性评分
  
- [ ] **建议系统**
  - [ ] AI生成建议
  - [ ] 多维度建议
  - [ ] 采纳追踪
  - [ ] 评分统计
  
- [ ] **角色系统**
  - [ ] 角色CRUD
  - [ ] 关系管理
  - [ ] 出场记录
  
- [ ] **世界观系统**
  - [ ] 世界观CRUD
  - [ ] 多类别管理
  - [ ] 详细设定
  
- [ ] **数据迁移**
  - [ ] 数据验证
  - [ ] 批量导入
  - [ ] 进度追踪
  - [ ] 回滚机制
  
- [ ] **素材管理**
  - [ ] 素材CRUD
  - [ ] 批量操作
  - [ ] 引用追踪
  - [ ] 存储配额管理

---

## 📝 测试报告模板

### 测试执行记录

```markdown
## 测试报告

**测试日期**: 2025-XX-XX
**测试人员**: XXX
**测试环境**: 开发/测试/生产
**测试版本**: Week 10

### 测试结果汇总

| 模块 | 测试用例数 | 通过 | 失败 | 跳过 | 通过率 |
|------|-----------|------|------|------|--------|
| 用户系统 | 15 | 15 | 0 | 0 | 100% |
| 小说管理 | 25 | 24 | 1 | 0 | 96% |
| AI功能 | 20 | 19 | 1 | 0 | 95% |
| 记忆系统 | 12 | 12 | 0 | 0 | 100% |
| 建议系统 | 15 | 15 | 0 | 0 | 100% |
| 角色系统 | 18 | 18 | 0 | 0 | 100% |
| 世界观系统 | 12 | 12 | 0 | 0 | 100% |
| 数据迁移 | 10 | 10 | 0 | 0 | 100% |
| 素材管理 | 22 | 22 | 0 | 0 | 100% |
| **总计** | **149** | **147** | **2** | **0** | **98.7%** |

### 发现的问题

1. **问题1**: 章节删除时级联删除失败
   - 严重程度: 高
   - 状态: 已修复
   - 修复人: XXX

2. **问题2**: AI生成偶尔超时
   - 严重程度: 中
   - 状态: 待优化
   - 备注: 已实现重试机制，但仍需优化

### 性能测试结果

- 平均响应时间: 245ms
- 95分位响应时间: 680ms
- 99分位响应时间: 1.2s
- 并发支持: 100用户 ✅

### 建议

1. 优化AI生成超时处理
2. 添加更多错误提示
3. 改进批量操作性能

### 总体评估

✅ **Phase 1核心功能完整，质量良好，可以发布MVP版本**
```

---

## 🎯 下一步

### 持续改进

1. **自动化测试**
   - 编写单元测试
   - 集成测试自动化
   - CI/CD流程集成

2. **性能优化**
   - 数据库查询优化
   - 缓存策略
   - CDN加速

3. **监控告警**
   - 错误监控
   - 性能监控
   - 用户行为分析

---

**文档维护**: 每次发布前更新  
**测试频率**: 每周至少一次完整测试  
**责任人**: 开发团队


