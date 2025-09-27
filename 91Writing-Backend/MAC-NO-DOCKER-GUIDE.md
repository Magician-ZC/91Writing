# Mac无Docker版本启动指南

## 🚀 快速启动

### 方法1: 一键配置 (推荐)

```bash
cd 91Writing-Backend

# 1. 自动安装配置数据库
./setup-database-mac.sh

# 2. 启动后端服务
./START.sh
```

### 方法2: 手动配置

如果你已经有MySQL和Redis，只需要：

```bash
# 直接启动
./START.sh
```

## 📋 前置要求

### 必须安装的软件

- **Node.js** 18.0+
- **npm** 9.0+

### 数据库要求

- **MySQL** 8.0+ 
- **Redis** 6.0+

## 🔧 数据库配置详情

### MySQL配置
- 端口: `3306`
- 数据库: `writing_platform` 
- 用户: `writing`
- 密码: `writing123`

### Redis配置
- 端口: `6379`
- 密码: `redis123`

## 🛠️ 手动安装数据库 (如果setup脚本失败)

### 安装软件包
```bash
brew install mysql redis
```

### 启动服务
```bash
brew services start mysql
brew services start redis
```

### 配置MySQL
```bash
mysql -u root -p
```
```sql
CREATE DATABASE writing_platform;
CREATE USER 'writing'@'localhost' IDENTIFIED BY 'writing123';
GRANT ALL PRIVILEGES ON writing_platform.* TO 'writing'@'localhost';
FLUSH PRIVILEGES;
```

### 配置Redis
```bash
redis-cli
CONFIG SET requirepass redis123
```

## 🎯 服务端点

启动成功后可访问：

- 📡 **API网关**: http://localhost:3000
- 📖 **API文档**: http://localhost:3000/api/docs  
- 🔐 **认证服务**: http://localhost:3002
- 👤 **用户服务**: http://localhost:3001
- 📚 **小说服务**: http://localhost:3003
- 🤖 **AI服务**: http://localhost:3004

## ❓ 故障排除

### 数据库连接失败
1. 检查服务状态：`brew services list`
2. 重启服务：`brew services restart mysql redis`
3. 检查端口占用：`lsof -i :3306` 和 `lsof -i :6379`

### 端口占用
```bash
# 查找占用进程
lsof -i :3000

# 杀死进程 (替换PID)
kill -9 <PID>
```

### 权限问题
```bash
# 给脚本执行权限
chmod +x START.sh
chmod +x setup-database-mac.sh
```

## 🛑 停止服务

- **停止后端**: 按 `Ctrl+C`
- **停止数据库**: `brew services stop mysql redis`