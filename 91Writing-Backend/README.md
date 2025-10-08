# 91Writing Backend - NestJS 微服务架构

> **91Writing 商业化后端服务** - 企业级微服务架构  
> 基于 NestJS + TypeScript + Prisma + MySQL

## ⚠️ 开发者必读

**🔥 开发新功能前必看：** [微服务配置文档 MICROSERVICES-CONFIG.md](./MICROSERVICES-CONFIG.md)

**包含重要信息：**
- ✅ 所有微服务端口配置（避免端口配置错误）
- ✅ API路由规则和前缀处理
- ✅ 常见配置错误和解决方案
- ✅ 服务间通信规范

**快速检查服务状态：**
```bash
./scripts/check-services.sh
```

---

## 🚀 快速启动

### 环境要求
- Node.js >= 18.0.0
- MySQL >= 8.0
- Redis >= 7.0
- npm >= 8.0.0

### 开发环境启动

#### 快速启动 (推荐)
```bash
# Windows 用户
.\scripts\dev-setup.bat

# 或手动启动
```

#### 手动启动
```bash
# 1. 安装依赖
npm install

# 2. 启动数据库服务
docker-compose up -d mysql redis

# 3. 初始化数据库
npm run db:push          # 创建数据库表
npm run db:generate      # 生成 Prisma Client
npm run db:seed          # 初始化种子数据

# 4. 启动开发服务
npm run start:dev

# 5. 访问服务
# API网关: http://localhost:3000
# API文档: http://localhost:3000/api/docs
# 数据库管理: http://localhost:8080
# Redis管理: http://localhost:8081
```

#### 测试账号
- **邮箱**: test@91writing.com  
- **密码**: password123

## 📁 项目结构

```
91Writing-Backend/
├── apps/                           # 微服务应用
│   ├── api-gateway/                # API网关
│   │   ├── src/
│   │   │   ├── main.ts            # 入口文件
│   │   │   ├── app.module.ts      # 主模块
│   │   │   └── modules/           # 功能模块
│   │   │       ├── auth/          # 认证模块
│   │   │       ├── proxy/         # 代理模块
│   │   │       └── health/        # 健康检查
│   ├── user-service/               # 用户服务
│   ├── novel-service/              # 小说服务
│   ├── ai-service/                 # AI服务
│   └── payment-service/            # 支付服务
├── libs/                           # 共享库
│   ├── common/                     # 通用模块
│   ├── database/                   # 数据库模块
│   └── auth/                       # 认证模块
├── docker/                         # Docker配置
├── docs/                          # 文档
├── package.json                   # 项目配置
├── nest-cli.json                  # NestJS CLI配置
└── tsconfig.json                  # TypeScript配置
```

## 🛠️ 开发指南

### 📊 任务进度

#### ✅ 功能验证完成 (2024-12-19)
> **详细验证报告**: [VERIFICATION-REPORT.md](./VERIFICATION-REPORT.md)

- ✅ **NestJS项目结构**: 100% 验证通过
- ✅ **数据库设计**: 100% 验证通过  
- ✅ **API网关功能**: 95% 验证通过
- ✅ **构建系统**: 100% 正常

#### 🎯 开发进度
- [x] Task 1.1.1: NestJS后端项目初始化 ✅ **已验证**
- [x] Task 1.1.2: 数据库设计与Prisma配置 ✅ **已验证**
- [x] Task 1.1.3: 基础API框架搭建 ✅ **已完成**
- [x] Task 1.1.4: JWT认证系统实现 ✅ **已完成**

### 🎉 Week 1 里程碑达成
**后端基础架构 100% 完成！**
- ✅ 企业级NestJS微服务架构
- ✅ 完整的数据库设计和ORM集成
- ✅ 标准化API框架和文档
- ✅ 完整的JWT认证授权系统

### 🚀 下一步开发
**Week 2: 前端用户认证界面开发**
- 🎨 Vue3登录注册界面
- 🔗 认证API集成
- 🛡️ 路由权限控制
- 💾 用户状态管理

## 🔧 可用脚本

```bash
# 开发
npm run start:dev          # 启动开发服务器
npm run build              # 构建项目
npm run start:prod         # 启动生产服务器

# 测试
npm run test               # 运行单元测试
npm run test:e2e           # 运行E2E测试
npm run test:cov           # 运行测试覆盖率

# 代码质量
npm run lint               # ESLint检查
npm run format             # Prettier格式化
```

## 🌐 API 端点

### API网关 (Port: 3000)
- `GET /api/v1/health` - 健康检查
- `GET /api/v1/health/ready` - 就绪检查
- `GET /api/v1/health/live` - 存活检查
- `GET /api/docs` - Swagger API文档

### 微服务端口分配
- API Gateway: 3000
- User Service: 3001
- Novel Service: 3002
- AI Service: 3003
- Payment Service: 3004

## 📊 技术栈

- **框架**: NestJS 10.x
- **语言**: TypeScript 5.x
- **数据库**: MySQL 8.0 + Prisma ORM
- **缓存**: Redis 7.0
- **认证**: JWT + Passport
- **文档**: Swagger/OpenAPI
- **测试**: Jest + Supertest
- **容器**: Docker + Docker Compose

## 🔒 环境变量

创建 `.env` 文件并配置以下环境变量：

```bash
# 应用配置
NODE_ENV=development
PORT=3000

# 数据库配置
DATABASE_URL="mysql://root:password@localhost:3306/writing_platform"

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT配置
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# 更多配置项请参考 .env.example
```

## 📝 开发日志

### 2024-12-19 - Task 1.1.2 数据库设计与Prisma配置完成 ✅

**已完成功能:**
- ✅ 完整的Prisma数据库Schema设计
- ✅ 14个数据表结构定义 (用户、订阅、小说、支付等)
- ✅ 数据库服务层实现 (PrismaService)
- ✅ 种子数据初始化脚本
- ✅ Docker开发环境配置
- ✅ 数据库管理工具集成

**数据库架构:**
- **用户系统**: 用户表、用户资料、用户活动日志
- **商业系统**: 套餐、订阅、激活码、支付订单
- **创作系统**: 小说、章节、记忆系统
- **素材系统**: 素材库、提示词库
- **统计分析**: AI使用日志、系统配置

**技术特性:**
- 多租户架构支持
- 完整的枚举类型定义
- 数据库健康检查
- 自动数据清理机制
- 种子数据自动初始化
- Docker容器化部署

**下一步开发:**
Task 1.1.3: 基础API框架搭建

### 2024-12-19 - Task 1.1.1 项目初始化完成 ✅

**已完成功能:**
- ✅ NestJS Monorepo 架构搭建
- ✅ API网关基础结构创建
- ✅ 健康检查模块实现
- ✅ Swagger API文档集成
- ✅ 基础配置和环境设置

**项目结构:**
- API Gateway: 入口服务，提供统一API接口
- Health Module: 健康检查、就绪检查、存活检查
- Auth Module: 认证服务(基础框架)
- Proxy Module: 服务代理(基础框架)

**技术特性:**
- 全局验证管道
- 全局异常过滤
- 请求限流配置
- Redis缓存集成
- 跨域配置
- 安全头部配置

---

**开发团队:** 91Writing Team  
**技术栈:** NestJS + TypeScript + Prisma + MySQL  
**项目状态:** 🚧 开发中 - Phase 1.1 进行中
