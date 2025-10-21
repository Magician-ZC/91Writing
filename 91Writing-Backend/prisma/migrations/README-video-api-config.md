# 视频API配置数据库迁移指南

## 执行步骤

### 1. 生成并执行迁移

```bash
cd 91Writing-Backend

# 生成迁移文件
npx prisma migrate dev --name add_video_api_config_tables

# 生成 Prisma Client
npx prisma generate
```

### 2. 执行种子数据

```bash
# 方法1: 使用MySQL命令行
mysql -u root -p 91writing < prisma/seeds/video-api-config.seed.sql

# 方法2: 使用Prisma Studio手动创建
npx prisma studio
# 在 VideoAPIConfig 表中手动创建一条 id='default_config' 的记录
```

### 3. 验证迁移

```bash
# 方法1: 使用Prisma Studio查看
npx prisma studio

# 方法2: 使用MySQL命令行查看
mysql -u root -p 91writing
```

```sql
-- 验证表是否创建
SHOW TABLES LIKE 'video%';

-- 查看默认配置
SELECT * FROM video_api_configs;

-- 查看表结构
DESCRIBE video_api_configs;
DESCRIBE video_api_usage_logs;
DESCRIBE user_video_quotas;
```

## 表说明

### video_api_configs (API配置表)
- 存储视频生成相关的API密钥和配置
- 敏感字段（API Key）需要加密存储
- 只应该有一条记录（id='default_config'）

### video_api_usage_logs (使用日志表)
- 记录每次API调用的成本和结果
- 用于成本统计和审计

### user_video_quotas (用户配额表)
- 每个用户一条记录
- 自动管理每日/每月配额
- 按时间自动重置

## 回滚迁移

如果需要回滚：

```bash
# 查看迁移历史
npx prisma migrate status

# 回滚最后一次迁移（谨慎使用）
npx prisma migrate resolve --rolled-back <migration-name>
```

或手动删除表：

```sql
DROP TABLE IF EXISTS user_video_quotas;
DROP TABLE IF EXISTS video_api_usage_logs;
DROP TABLE IF EXISTS video_api_configs;
```

## 注意事项

1. ⚠️ **备份数据库**: 执行迁移前务必备份
2. ⚠️ **加密密钥**: 需要设置环境变量 `ENCRYPTION_KEY`（32字符）
3. ⚠️ **API密钥**: 初始为NULL，需要在管理后台配置
4. ⚠️ **存储路径**: 确保服务器有对应目录的写权限

## 环境变量

在 `.env` 文件中添加：

```env
# 加密密钥（32字符，用于加密API密钥）
ENCRYPTION_KEY=your-32-character-encryption-key-here

# 数据库连接（如果还没有）
DATABASE_URL="mysql://root:password@localhost:3306/91writing"
```

