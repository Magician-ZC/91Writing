# 91Writing 微服务配置文档（开发者必读）⚠️

> **重要提示**: 每次开发新功能前，请务必阅读本文档，避免端口配置错误！

---

## 📋 目录

- [微服务端口配置](#微服务端口配置)
- [API路由规则](#api路由规则)
- [服务间通信](#服务间通信)
- [常见配置错误](#常见配置错误)
- [开发流程检查清单](#开发流程检查清单)

---

## 🔌 微服务端口配置

### 端口分配表

| 服务名称 | 端口 | 说明 | 健康检查URL |
|---------|------|------|------------|
| **API Gateway** | `3000` | 统一入口，代理所有请求 | http://localhost:3000/api/v1/health |
| **User Service** | `3001` | 用户管理服务 | http://localhost:3001/api/v1/users/health |
| **Auth Service** | `3002` | 认证服务 | http://localhost:3002/api/v1/auth/health |
| **Novel Service** | `3003` | 小说管理服务 | http://localhost:3003/health |
| **AI Service** | `3004` | AI功能服务 | http://localhost:3004/health |
| **Payment Service** | `3005` | 支付服务 | http://localhost:3005/health |
| **Admin Service** | `3006` | 管理后台服务 | http://localhost:3006/health |

### 环境变量配置

```bash
# 数据库配置
DATABASE_URL="mysql://writing:writing123@localhost:3306/writing_platform"

# Redis配置
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD="redis123"

# JWT配置
JWT_SECRET="91writing_jwt_secret_dev_2024"

# 微服务URL配置（API Gateway使用）
AUTH_SERVICE_URL="http://localhost:3002"
USER_SERVICE_URL="http://localhost:3001"
NOVEL_SERVICE_URL="http://localhost:3003"
AI_SERVICE_URL="http://localhost:3004"
PAYMENT_SERVICE_URL="http://localhost:3005"
ADMIN_SERVICE_URL="http://localhost:3006"  # ⚠️ 注意：不是3004！

# 服务端口配置（各服务使用）
PORT=3000                    # API Gateway
USER_SERVICE_PORT=3001
AUTH_SERVICE_PORT=3002
NOVEL_SERVICE_PORT=3003
AI_SERVICE_PORT=3004
PAYMENT_SERVICE_PORT=3005
ADMIN_SERVICE_PORT=3006
```

---

## 🛣️ API路由规则

### 前端访问路径

所有前端请求都通过 **API Gateway (3000端口)** 统一入口：

```
前端请求 → API Gateway (3000) → 对应的微服务
```

### 路由映射规则

#### 1. 认证相关
```
前端: /api/v1/auth/*
  ↓
API Gateway: /api/v1/auth/*
  ↓
Auth Service (3002): /api/v1/auth/*
```

**示例：**
- 登录: `POST http://localhost:3000/api/v1/auth/login`
- 注册: `POST http://localhost:3000/api/v1/auth/register`
- 邀请: `POST http://localhost:3000/api/v1/invite/*`

#### 2. 用户管理
```
前端: /api/v1/users/*
  ↓
API Gateway: /api/v1/users/*
  ↓
User Service (3001): /api/v1/users/*
```

#### 3. 小说管理
```
前端: /api/v1/novels/*
前端: /api/v1/chapters/*
前端: /api/v1/memories/*
  ↓
API Gateway: /api/v1/novels/* | /api/v1/chapters/* | /api/v1/memories/*
  ↓
Novel Service (3003): /api/v1/novels/* | /api/v1/chapters/* | /api/v1/memories/*
```

#### 4. AI服务
```
前端: /api/v1/ai/*
  ↓
API Gateway: /api/v1/ai/*
  ↓
AI Service (3004): /api/v1/ai/*
```

#### 5. 支付服务
```
前端: /api/v1/payment/*
前端: /api/v1/packages/*
前端: /api/v1/subscriptions/*
  ↓
API Gateway: /api/v1/payment/* | /api/v1/packages/* | /api/v1/subscriptions/*
  ↓
Payment Service (3005): /api/v1/payment/* | /api/v1/packages/* | /api/v1/subscriptions/*
```

#### 6. 管理后台（⚠️ 重点）
```
前端: /api/v1/admin/*
  ↓
API Gateway: /api/v1/admin/*
  ↓ (代理时移除 /admin 前缀)
Admin Service (3006): /*
```

**特别注意：**
- Admin Service的端口是 **3006**（不是3004）
- API Gateway代理时会移除路径中的 `/admin` 前缀
- Admin Service内部路由不需要 `/admin` 前缀

**示例：**
```javascript
// ❌ 错误配置
ADMIN_SERVICE_URL="http://localhost:3004"  // 这是AI Service的端口！

// ✅ 正确配置
ADMIN_SERVICE_URL="http://localhost:3006"
```

**前端调用示例：**
```javascript
// 前端调用数据分析API
GET http://localhost:3000/api/v1/admin/analytics/overview

// API Gateway处理流程：
// 1. 接收请求: /api/v1/admin/analytics/overview
// 2. 移除 /admin 前缀
// 3. 转发到: http://localhost:3006/analytics/overview
```

---

## 🔄 服务间通信

### 通信方式

1. **HTTP REST API** (主要方式)
   - 通过API Gateway代理
   - 直接服务间调用（需配置服务URL）

2. **共享数据库** (Prisma ORM)
   - 所有服务连接同一个MySQL数据库
   - 通过 `@app/database` 共享库访问

### 服务依赖关系

```
API Gateway (3000)
├── Auth Service (3002)
│   └── 依赖: database, redis
├── User Service (3001)
│   └── 依赖: database
├── Novel Service (3003)
│   └── 依赖: database
├── AI Service (3004)
│   └── 依赖: database, 外部AI API
├── Payment Service (3005)
│   └── 依赖: database, 支付宝SDK, 微信SDK
└── Admin Service (3006)
    └── 依赖: database, 其他所有服务（通过API）
```

---

## ⚠️ 常见配置错误

### 错误1: Admin Service端口配置错误 ❌

**错误示例：**
```typescript
// api-gateway/src/modules/admin/admin.service.ts
this.adminServiceUrl = this.configService.get<string>(
  'ADMIN_SERVICE_URL',
  'http://localhost:3004',  // ❌ 错误！这是AI Service的端口
);
```

**正确配置：**
```typescript
this.adminServiceUrl = this.configService.get<string>(
  'ADMIN_SERVICE_URL',
  'http://localhost:3006',  // ✅ 正确
);
```

### 错误2: 路径导入错误 ❌

**错误示例：**
```typescript
// admin-service内部模块导入
import { AdminAuthGuard } from '../../guards/admin-auth.guard';  // ❌ 路径错误
```

**正确配置：**
```typescript
import { AdminAuthGuard } from '../admin/guards/admin-auth.guard';  // ✅ 正确
```

### 错误3: API路由前缀配置不一致 ❌

**错误示例：**
```typescript
// Admin Service的Controller
@Controller('admin/analytics')  // ❌ 错误！会导致路径重复
export class AnalyticsController {}
```

**正确配置：**
```typescript
@Controller('analytics')  // ✅ 正确，因为API Gateway已经处理了/admin前缀
export class AnalyticsController {}
```

### 错误4: 类型定义不匹配 ❌

**错误示例：**
```typescript
// 使用UserActivity的类型过滤器用于AIUsageLog
const dateFilter: Prisma.UserActivityWhereInput = {};
await this.prisma.aIUsageLog.count({ where: dateFilter });  // ❌ 类型不匹配
```

**正确配置：**
```typescript
// 为每个模型使用正确的类型
const aiDateFilter: Prisma.AIUsageLogWhereInput = {
  createdAt: {
    ...(startDate && { gte: startDate }),
    ...(endDate && { lte: endDate }),
  }
};
await this.prisma.aIUsageLog.count({ where: aiDateFilter });  // ✅ 正确
```

---

## 📝 开发流程检查清单

### 开发新功能前必查 ✅

- [ ] 确认功能属于哪个微服务
- [ ] 检查该服务的端口配置（参考端口分配表）
- [ ] 确认API路由规则和前缀
- [ ] 检查是否需要在API Gateway添加代理
- [ ] 验证服务间通信路径

### 添加新API接口 ✅

- [ ] 在对应的Service中实现业务逻辑
- [ ] 在对应的Controller中定义路由
- [ ] 确认路由前缀是否正确（不要重复添加）
- [ ] 在前端apiManager中添加对应方法
- [ ] 测试API调用是否正常

### 添加新的微服务代理 ✅

- [ ] 在API Gateway的对应module中添加代理逻辑
- [ ] 配置正确的服务URL和端口
- [ ] 处理路径前缀（是否需要移除/添加）
- [ ] 测试代理转发是否正常
- [ ] 更新本文档的路由映射规则

### 修改现有API ✅

- [ ] 确认API的完整调用链（前端→Gateway→Service）
- [ ] 修改时保持路由一致性
- [ ] 更新相关的DTO和类型定义
- [ ] 测试修改后的API
- [ ] 更新API文档（Swagger）

---

## 🔧 调试技巧

### 检查服务是否运行

```bash
# 检查所有服务
curl http://localhost:3000/api/v1/health  # API Gateway
curl http://localhost:3001/api/v1/users/health  # User Service
curl http://localhost:3002/api/v1/auth/health  # Auth Service
curl http://localhost:3003/health  # Novel Service
curl http://localhost:3004/health  # AI Service
curl http://localhost:3005/health  # Payment Service
curl http://localhost:3006/health  # Admin Service

# 或使用一键检查脚本
./scripts/check-services.sh
```

### 检查端口占用

```bash
# Mac/Linux
lsof -i :3000  # 检查3000端口
lsof -i :3001-3006  # 检查3001-3006端口

# 查看所有Node进程
ps aux | grep node
```

### 查看服务日志

```bash
# 如果使用npm run start:all
# 日志会输出到终端

# 如果使用PM2
pm2 logs api-gateway
pm2 logs admin-service
```

### API调用测试

```bash
# 测试管理后台分析API（需要token）
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/admin/analytics/overview

# 测试用户注册
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 📚 相关文档

- [后端启动指南](./BACKEND-STARTUP-GUIDE.md)
- [Docker设置指南](./DOCKER-SETUP-GUIDE.md)
- [API文档](http://localhost:3000/api/docs)
- [数据模型指南](./WEEK3-DATA-MODEL-GUIDE.md)

---

## 🆘 常见问题解决

### Q1: API返回404错误？

**可能原因：**
1. 服务未启动
2. 端口配置错误
3. 路由路径不正确

**解决方案：**
1. 检查所有服务是否运行
2. 核对端口配置（参考本文档）
3. 检查API路径是否正确

### Q2: 服务无法连接数据库？

**解决方案：**
1. 确认MySQL服务运行: `brew services list`
2. 检查数据库连接字符串
3. 运行: `npm run db:push`

### Q3: 新添加的API调用失败？

**检查步骤：**
1. 确认Service层实现正确
2. 确认Controller路由配置正确
3. 确认API Gateway代理配置（如果需要）
4. 确认前端apiManager配置
5. 检查网络请求（浏览器开发者工具）

---

## 🔄 文档维护

**更新时机：**
- 添加新的微服务
- 修改端口配置
- 更改路由规则
- 发现新的常见错误

**更新负责人：** 开发团队所有成员

**最后更新：** 2025年1月8日

---

**⚠️ 重要提醒：每次开发新功能前，请务必查看本文档的最新版本！**
