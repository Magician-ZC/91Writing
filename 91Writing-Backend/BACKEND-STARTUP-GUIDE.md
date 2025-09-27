# 91Writing 后端启动指南

## 📋 系统要求

- **Node.js**: 18.0+ 
- **npm**: 9.0+ 或 **pnpm**: 8.0+
- **Docker**: 20.0+ (用于数据库和缓存服务)
- **Docker Compose**: 2.0+

## 🚀 快速启动 (推荐)

### 方法1: 自动化脚本启动

```bash
# Windows
cd 91Writing-Backend
scripts\dev-setup.bat

# Linux/macOS  
cd 91Writing-Backend
bash scripts/dev-setup.sh
```

这个脚本会自动完成以下操作：
- ✅ 检查环境依赖
- ✅ 安装项目依赖
- ✅ 启动数据库服务 (MySQL + Redis)
- ✅ 初始化数据库
- ✅ 启动所有微服务

### 方法2: 手动步骤启动

#### 第1步: 安装依赖

```bash
cd 91Writing-Backend
npm install
# 或使用 pnpm install
```

#### 第2步: 启动基础服务

```bash
# 启动数据库和缓存服务
docker-compose up -d mysql redis

# 查看服务状态
docker-compose ps
```

#### 第3步: 数据库初始化

```bash
# 生成 Prisma Client
npm run db:generate

# 同步数据库结构
npm run db:push

# 插入种子数据
npm run db:seed
```

#### 第4步: 启动微服务

**选项A: 启动所有服务**
```bash
npm run start:all
```

**选项B: 单独启动各服务**
```bash
# 在不同终端窗口中运行
npm run start:gateway    # API网关 (端口: 3000)
npm run start:auth      # 认证服务 (端口: 3001)
npm run start:user      # 用户服务 (端口: 3002)
npm run start:novel     # 小说服务 (端口: 3003)
npm run start:ai        # AI服务 (端口: 3004)
```

## 🔧 环境配置

### 数据库配置

默认配置 (docker-compose.yml):
- **MySQL**: 
  - 端口: 3306
  - 数据库: `writing_platform`
  - 用户: `writing` / 密码: `writing123`
- **Redis**: 
  - 端口: 6379
  - 密码: `redis123`

### 环境变量

创建 `.env` 文件 (可选):
```env
# 数据库配置
DATABASE_URL="mysql://writing:writing123@localhost:3306/writing_platform"

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis123

# JWT配置
JWT_SECRET=91writing_jwt_secret_dev_2024
JWT_EXPIRES_IN=7d

# 端口配置
API_GATEWAY_PORT=3000
AUTH_SERVICE_PORT=3001
USER_SERVICE_PORT=3002
NOVEL_SERVICE_PORT=3003
AI_SERVICE_PORT=3004
```

## 🌐 服务端点

启动成功后，可以访问以下端点：

| 服务 | 端口 | 描述 | API文档 |
|------|------|------|---------|
| API网关 | 3000 | 统一入口 | http://localhost:3000/api/docs |
| 认证服务 | 3001 | 用户认证 | http://localhost:3001/api/docs |
| 用户服务 | 3002 | 用户管理 | http://localhost:3002/api/docs |
| 小说服务 | 3003 | 小说管理 | http://localhost:3003/api/docs |
| AI服务 | 3004 | AI功能 | http://localhost:3004/api/docs |

### 管理工具

| 工具 | 端口 | 描述 |
|------|------|------|
| Adminer | 8080 | 数据库管理 |
| Redis Commander | 8081 | Redis管理 |
| Prisma Studio | 5555 | 数据模型可视化 |

## 🧪 测试和验证

### 健康检查
```bash
# 检查API网关
curl http://localhost:3000/health

# 检查各微服务
curl http://localhost:3001/health  # 认证服务
curl http://localhost:3002/health  # 用户服务
curl http://localhost:3003/health  # 小说服务
curl http://localhost:3004/health  # AI服务
```

### 测试账号
```
邮箱: test@91writing.com
密码: password123
```

### API测试示例

**用户注册**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "password": "password123",
    "nickname": "测试用户"
  }'
```

**用户登录**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com", 
    "password": "password123"
  }'
```

## 📱 生产环境部署

### 构建项目
```bash
npm run build
```

### 启动生产服务
```bash
# 启动所有生产服务
npm run start:gateway:prod &
npm run start:auth:prod &
npm run start:user:prod &
npm run start:novel:prod &
npm run start:ai:prod &
```

### Docker部署
```bash
# 构建并启动所有服务
docker-compose up --build -d

# 查看日志
docker-compose logs -f
```

## 🔍 故障排除

### 常见问题

**1. 端口占用**
```bash
# 查找占用端口的进程
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # macOS/Linux

# 杀死进程
taskkill /PID <PID> /F        # Windows
kill -9 <PID>                 # macOS/Linux
```

**2. 数据库连接失败**
```bash
# 检查数据库状态
docker-compose ps mysql

# 查看数据库日志
docker-compose logs mysql

# 重启数据库
docker-compose restart mysql
```

**3. Redis连接失败**
```bash
# 检查Redis状态
docker-compose ps redis

# 测试Redis连接
docker exec -it 91writing-redis redis-cli -a redis123 ping
```

**4. 依赖安装失败**
```bash
# 清除缓存
npm cache clean --force

# 删除node_modules重新安装
rm -rf node_modules package-lock.json
npm install
```

### 日志查看

**开发模式日志**
- 各服务会在控制台输出详细日志
- 包含请求/响应信息和错误堆栈

**生产模式日志**
- 日志会保存到 `logs/` 目录
- 按服务和日期分类存储

### 性能监控

**数据库性能**
```bash
# 启动Prisma Studio
npm run db:studio
```

**Redis性能**
```bash
# 启动Redis Commander
docker-compose up -d redis-commander
# 访问 http://localhost:8081
```

## 📚 开发指南

### 添加新的微服务

1. 使用NestJS CLI生成新应用
2. 配置数据库连接
3. 添加健康检查端点
4. 更新docker-compose.yml
5. 在package.json中添加启动脚本

### 数据库迁移

```bash
# 创建迁移文件
npm run db:migrate:dev

# 部署迁移
npm run db:migrate

# 重置数据库
npm run db:migrate:reset
```

### API文档更新

每个服务都集成了Swagger，访问各服务的 `/api/docs` 端点查看API文档。

## 🤝 获取帮助

- 查看错误日志获取详细信息
- 检查 [TASK-WEEK3-COMPLETION-REPORT.md](./TASK-WEEK3-COMPLETION-REPORT.md) 了解最新架构
- 参考 [91Writing-Implementation-Roadmap.md](../91Writing-Implementation-Roadmap.md) 了解整体规划

---

**快速启动总结**：
```bash
cd 91Writing-Backend
scripts\dev-setup.bat  # Windows 
# 或
bash scripts/dev-setup.sh  # Linux/macOS
```

启动完成后访问 http://localhost:3000/api/docs 查看API文档！ 🎉
