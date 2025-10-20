# 91Writing API 文档总览

> **最后更新**: 2025年1月8日  
> **API版本**: v1.0  
> **文档状态**: ✅ 已完善

## 📖 访问 Swagger 文档

启动项目后，访问以下地址查看完整的交互式 API 文档：

```
http://localhost:3000/api/docs
```

## 🎯 API 模块总览

### 1. 认证服务 (Auth Service)
**端口**: 3001  
**标签**: `认证管理`

| 接口 | 方法 | 路径 | 描述 |
|------|------|------|------|
| 用户注册 | POST | `/register` | 创建新用户账户 |
| 用户登录 | POST | `/login` | 邮箱密码登录 |
| 刷新令牌 | POST | `/refresh` | 刷新访问令牌 |
| 用户登出 | POST | `/logout` | 用户登出 |
| 修改密码 | PATCH | `/change-password` | 修改当前密码 |
| 忘记密码 | POST | `/forgot-password` | 发送重置邮件 |
| 重置密码 | POST | `/reset-password` | 重置密码 |
| 验证邮箱 | POST | `/verify-email` | 邮箱验证 |
| 获取当前用户 | GET | `/me` | 获取登录用户信息 |
| 检查令牌 | POST | `/check-token` | 验证令牌有效性 |

**认证方式**: JWT Bearer Token

---

### 2. 用户服务 (User Service)
**端口**: 3002  
**标签**: `用户管理`

| 接口 | 方法 | 路径 | 描述 |
|------|------|------|------|
| 创建用户 | POST | `/` | 创建新用户 |
| 获取用户列表 | GET | `/` | 分页查询用户 |
| 获取统计信息 | GET | `/stats` | 用户统计数据 |
| 根据邮箱查询 | GET | `/email/:email` | 邮箱查询用户 |
| 获取用户详情 | GET | `/:id` | 用户详细信息 |
| 更新用户信息 | PATCH | `/:id` | 更新基本信息 |
| 更新密码 | PATCH | `/:id/password` | 修改密码 |
| 更新登录时间 | PATCH | `/:id/last-login` | 更新最后登录 |
| 软删除用户 | DELETE | `/:id` | 标记为非活跃 |
| 永久删除用户 | DELETE | `/:id/hard` | 物理删除 |

**查询参数支持**:
- 分页: `page`, `limit`
- 搜索: `search` (邮箱/昵称)
- 过滤: `role`, `status`, `isActive`, `tenantId`
- 排序: `sortBy`, `sortOrder`

---

### 3. 小说服务 (Novel Service)
**端口**: 3003  
**标签**: `novels`, `chapters`, `memories`

#### 3.1 小说管理 (Novels)

| 接口 | 方法 | 路径 | 描述 |
|------|------|------|------|
| 创建小说 | POST | `/novels` | 创建新小说项目 |
| 获取小说列表 | GET | `/novels` | 获取用户的所有小说 |
| 获取小说详情 | GET | `/novels/:id` | 小说详细信息 |
| 更新小说 | PATCH | `/novels/:id` | 更新小说信息 |
| 删除小说 | DELETE | `/novels/:id` | 删除小说 |
| 更新统计 | POST | `/novels/:id/stats/update` | 更新字数统计 |
| 获取设置 | GET | `/novels/:id/settings` | 获取小说设置 |
| 更新设置 | PATCH | `/novels/:id/settings` | 更新小说设置 |

**查询参数**:
- `status`: 按状态筛选 (DRAFT, WRITING, COMPLETED, PUBLISHED)
- `genre`: 按类型筛选
- `page`, `limit`: 分页参数

#### 3.2 章节管理 (Chapters)

| 接口 | 方法 | 路径 | 描述 |
|------|------|------|------|
| 创建章节 | POST | `/novels/:novelId/chapters` | 创建新章节 |
| 获取章节列表 | GET | `/novels/:novelId/chapters` | 获取所有章节 |
| 获取章节详情 | GET | `/novels/:novelId/chapters/:id` | 章节详细信息 |
| 获取章节内容 | GET | `/novels/:novelId/chapters/:id/content` | 章节完整内容 |
| 更新章节信息 | PATCH | `/novels/:novelId/chapters/:id` | 更新基本信息 |
| 更新章节内容 | PATCH | `/novels/:novelId/chapters/:id/content` | 更新正文内容 |
| 删除章节 | DELETE | `/novels/:novelId/chapters/:id` | 删除章节 |
| 批量更新状态 | PATCH | `/novels/:novelId/chapters/status` | 批量改状态 |
| 重新排序 | PATCH | `/novels/:novelId/chapters/reorder` | 调整章节顺序 |

#### 3.3 记忆系统 (Memories)

| 接口 | 方法 | 路径 | 描述 |
|------|------|------|------|
| 创建记忆 | POST | `/novels/:novelId/memories` | 创建新记忆 |
| 获取记忆列表 | GET | `/novels/:novelId/memories` | 获取所有记忆 |
| 获取记忆详情 | GET | `/novels/:novelId/memories/:id` | 记忆详情 |
| 更新记忆 | PATCH | `/novels/:novelId/memories/:id` | 更新记忆内容 |
| 删除记忆 | DELETE | `/novels/:novelId/memories/:id` | 删除记忆 |
| 初始化记忆 | POST | `/novels/:novelId/memories/initialize` | 初始化小说记忆 |
| 获取生成上下文 | GET | `/novels/:novelId/memories/context/generation` | AI生成上下文 |
| 更新章节摘要 | POST | `/novels/:novelId/memories/chapters/:chapterNumber/summary` | 章节摘要 |
| 批量删除记忆 | DELETE | `/novels/:novelId/memories/batch` | 批量删除 |
| 清理记忆 | POST | `/novels/:novelId/memories/cleanup` | 清理过期记忆 |

**记忆类型**: CHARACTER, SCENE, PLOT, WORLDVIEW, RELATIONSHIP, EVENT, OTHER

**查询参数**:
- `type`: 记忆类型过滤
- `limit`: 返回数量限制
- `orderBy`: 排序方式 (importance, created, updated)
- `maxTokens`: 上下文最大token数
- `includeTypes`: 包含的记忆类型

---

### 4. AI 服务 (AI Service)
**端口**: 3004  
**标签**: `ai-generation`

| 接口 | 方法 | 路径 | 描述 |
|------|------|------|------|
| AI内容生成 | POST | `/generation/content` | 生成小说内容 |

**生成参数**:
```json
{
  "novelId": "小说ID",
  "prompt": "生成提示词",
  "context": "前文上下文",
  "mode": "continue/rewrite/expand",
  "temperature": 0.7,
  "maxTokens": 1000
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "content": "生成的内容...",
    "usage": {
      "promptTokens": 150,
      "completionTokens": 800,
      "totalTokens": 950
    },
    "model": "gpt-4"
  }
}
```

---

### 5. 支付服务 (Payment Service)
**端口**: 3005  
**标签**: `支付管理`

| 接口 | 方法 | 路径 | 描述 |
|------|------|------|------|
| 创建支付订单 | POST | `/payments/orders` | 创建新订单 |
| 获取订单列表 | GET | `/payments/orders` | 用户订单列表 |
| 获取订单详情 | GET | `/payments/orders/:orderNo` | 订单详情 |
| 发起支付 | POST | `/payments/orders/:orderNo/pay` | 发起支付 |
| 取消订单 | POST | `/payments/orders/:orderNo/cancel` | 取消订单 |
| 支付宝回调 | POST | `/payments/alipay/notify` | 支付宝通知 |
| 微信回调 | POST | `/payments/wechat/notify` | 微信通知 |

---

### 6. 管理服务 (Admin Service)
**端口**: 3006  
**标签**: `管理后台`

| 接口 | 方法 | 路径 | 描述 |
|------|------|------|------|
| 管理员仪表板 | GET | `/admin/dashboard` | 关键指标 |
| 用户管理 | GET/PATCH/DELETE | `/admin/users/*` | 用户管理 |
| AI配置管理 | GET/POST/PUT/DELETE | `/admin/ai-config/*` | AI配置 |
| 数据分析 | GET | `/admin/analytics/*` | 数据统计 |

---

## 🔐 认证机制

### JWT Token 认证

1. **获取 Token**
   ```bash
   POST /api/v1/login
   Content-Type: application/json
   
   {
     "email": "user@example.com",
     "password": "password123"
   }
   ```

2. **使用 Token**
   ```bash
   GET /api/v1/novels
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **刷新 Token**
   ```bash
   POST /api/v1/refresh
   Content-Type: application/json
   
   {
     "refreshToken": "refresh_token_here"
   }
   ```

### Token 有效期
- Access Token: 7天
- Refresh Token: 30天

---

## 📝 通用响应格式

### 成功响应
```json
{
  "success": true,
  "data": {
    // 响应数据
  }
}
```

### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": {} // 可选的详细信息
  }
}
```

### 分页响应
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

---

## 🚀 快速开始

### 1. 启动服务
```bash
cd 91Writing-Backend
npm install
npm run start:gateway:dev
```

### 2. 访问 Swagger 文档
```
http://localhost:3000/api/docs
```

### 3. 测试 API
使用 Swagger UI 的 "Try it out" 功能直接测试 API

---

## 🔗 相关文档

- [后端项目README](./README.md)
- [开发文档索引](./开发文档索引.md)
- [接口开发规范](./接口开发规范文档.md)
- [错误排查指南](./接口错误排查指南.md)

---

## ✅ API 文档完成状态

| 服务 | 控制器完成度 | Swagger装饰器 | 示例完整性 |
|------|-------------|--------------|-----------|
| Auth Service | ✅ 100% | ✅ 完整 | ✅ 完整 |
| User Service | ✅ 100% | ✅ 完整 | ✅ 完整 |
| Novel Service - Novels | ✅ 100% | ✅ 完整 | ✅ 完整 |
| Novel Service - Chapters | ✅ 100% | ✅ 完整 | ✅ 完整 |
| Novel Service - Memories | ✅ 100% | ✅ 完整 | ✅ 完整 |
| AI Service | ✅ 100% | ✅ 完整 | ✅ 完整 |
| Payment Service | ✅ 100% | ✅ 完整 | ⚠️ 基础 |
| Admin Service | ✅ 100% | ✅ 完整 | ⚠️ 基础 |

**总体完成度**: 95%

---

**维护**: 91Writing 开发团队  
**联系**: 项目内部沟通

