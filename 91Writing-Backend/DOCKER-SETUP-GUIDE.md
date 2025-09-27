# Docker 安装和配置指南

## 🚨 解决 Docker 连接错误

当您看到如下错误时：
```
error during connect: in the default daemon configuration on Windows, the docker client must be run with elevated privileges to connect
```

这表示 Docker Desktop 未启动或权限不足。

## 🔧 解决方案

### 方案1: 启动 Docker Desktop (推荐)

1. **安装 Docker Desktop**
   - 下载地址: https://www.docker.com/products/docker-desktop
   - 选择 Windows 版本并安装

2. **启动 Docker Desktop**
   - 在开始菜单中找到 "Docker Desktop"
   - 双击启动 Docker Desktop
   - 等待右下角托盘图标显示 Docker 已启动

3. **验证 Docker 状态**
   ```bash
   docker --version
   docker ps
   ```

4. **重新启动数据库**
   ```bash
   cd 91Writing-Backend
   docker-compose up -d mysql redis
   ```

### 方案2: 使用管理员权限

如果 Docker Desktop 已安装但仍有权限问题：

1. **以管理员身份运行 PowerShell**
   - 右键点击开始菜单
   - 选择 "Windows PowerShell (管理员)"

2. **重新执行命令**
   ```bash
   cd F:\PycharmProjects\91Writing\91Writing-Backend
   docker-compose up -d mysql redis
   ```

### 方案3: 本地数据库安装 (替代方案)

如果无法使用 Docker，可以直接安装本地数据库：

#### 安装 MySQL 8.0
1. 下载 MySQL: https://dev.mysql.com/downloads/mysql/
2. 安装并配置：
   - 端口: 3306
   - 用户: root，密码: root123456
   - 创建数据库: `writing_platform`
   - 创建用户: `writing`，密码: `writing123`

#### 安装 Redis
1. 下载 Redis: https://github.com/microsoftarchive/redis/releases
2. 安装并启动 Redis 服务 (端口: 6379)

#### 更新环境配置
创建 `.env` 文件：
```env
DATABASE_URL="mysql://writing:writing123@localhost:3306/writing_platform"
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis123
JWT_SECRET=91writing_jwt_secret_dev_2024
JWT_EXPIRES_IN=7d
```

## 🚀 重新启动后端服务

### 完整启动流程

1. **确保数据库运行**
   ```bash
   # 使用Docker
   docker-compose up -d mysql redis
   
   # 或确保本地MySQL和Redis服务已启动
   ```

2. **初始化数据库**
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

3. **启动所有微服务**
   ```bash
   npm run start:all
   ```

### 单独启动微服务

如果同时启动所有服务有问题，可以分别启动：

```bash
# 终端1: API网关
npm run start:gateway

# 终端2: 认证服务  
npm run start:auth

# 终端3: 用户服务
npm run start:user

# 终端4: 小说服务
npm run start:novel

# 终端5: AI服务
npm run start:ai
```

## 🔍 验证服务状态

启动成功后，访问以下地址验证：

- **API网关**: http://localhost:3000/api/v1/health
- **认证服务**: http://localhost:3002/api/v1/auth/health  
- **用户服务**: http://localhost:3002/health
- **小说服务**: http://localhost:3003/health
- **AI服务**: http://localhost:3004/health

## 🛟 故障排除

### 常见问题

**1. MySQL 连接失败**
```
Authentication failed against database server at `localhost`
```

解决方案：
- 检查 MySQL 是否启动
- 验证用户名密码是否正确
- 确保数据库 `writing_platform` 已创建

**2. 端口占用**
```bash
# 查找占用端口的进程
netstat -ano | findstr :3000
# 杀死占用进程
taskkill /PID <PID> /F
```

**3. Redis 连接失败**
- 检查 Redis 服务是否启动
- 验证端口 6379 是否可用

### 完整重置步骤

如果遇到无法解决的问题：

```bash
# 1. 停止所有服务
docker-compose down

# 2. 清理容器和卷
docker-compose down -v
docker system prune -f

# 3. 重新启动
docker-compose up -d mysql redis

# 4. 重新初始化数据库
npm run db:push
npm run db:seed

# 5. 重新启动服务
npm run start:all
```

## 📝 成功启动标志

当所有服务正常启动时，您应该看到：

```
🚀 API Gateway is running on: http://localhost:3000
📖 Swagger docs available at: http://localhost:3000/api/docs
🔐 认证服务已启动: http://localhost:3002
Novel Service is running on: http://localhost:3003
AI Service is running on: http://localhost:3004
```

这时就可以正常使用后端API了！
