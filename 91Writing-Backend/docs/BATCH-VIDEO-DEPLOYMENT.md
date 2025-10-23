# 批量视频生成功能部署指南

## 🚀 部署步骤

### 第1步：数据库迁移

#### 方式A：自动迁移（推荐）

```bash
cd 91Writing-Backend

# 确保数据库连接正确
# 检查 .env 文件中的 DATABASE_URL

# 执行迁移
npx prisma migrate deploy
```

#### 方式B：手动执行SQL

```bash
# 连接数据库
mysql -u root -p

# 选择数据库
use 91writing;

# 执行迁移脚本
source prisma/migrations/add_batch_video_generation.sql;

# 验证表创建成功
SHOW TABLES LIKE 'video_batch_generations';
DESC video_batch_generations;
```

### 第2步：安装依赖（如果还没有）

```bash
# 确保安装了Bull队列依赖
npm install @nestjs/bull bull
npm install @types/bull --save-dev

# 确保安装了Redis客户端
npm install ioredis
```

### 第3步：配置环境变量

在 `.env` 文件中添加或确认以下配置：

```bash
# Redis配置（用于任务队列）
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# 视频存储路径
VIDEO_STORAGE_PATH=./data/videos
VIDEO_TEMP_DIR=./data/temp

# 视频CDN地址
VIDEO_CDN_URL=http://localhost:3000/videos

# 视频Provider选择（jimeng 或 kling）
VIDEO_PROVIDER=jimeng

# FFmpeg路径（通常系统已安装）
FFMPEG_PATH=ffmpeg

# 即梦API配置
JIMENG_API_KEY=your_jimeng_api_key
JIMENG_API_URL=https://api.jimeng.ai

# 可灵API配置
KLING_API_KEY=your_kling_api_key
KLING_API_URL=https://api.kuaishou.com/kling

# 火山引擎API配置（图片生成）
VOLCENGINE_ACCESS_KEY=your_access_key
VOLCENGINE_SECRET_KEY=your_secret_key
```

### 第4步：启动Redis服务

```bash
# Windows
# 使用Redis Desktop Manager 或下载Redis for Windows

# Linux/Mac
redis-server

# Docker
docker run -d -p 6379:6379 redis:latest
```

### 第5步：重启AI服务

```bash
# 开发环境
npm run start:dev ai-service

# 生产环境
npm run build
npm run start:prod ai-service
```

### 第6步：验证功能

```bash
# 检查服务健康状态
curl http://localhost:3003/health

# 检查视频生成权限
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3003/video-generation/permissions

# 测试批量生成（需要有效的token和章节ID）
curl -X POST http://localhost:3003/video-generation/batch/generate-by-chapters \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "novelId": "your-novel-id",
    "chapterIds": ["chapter-id-1", "chapter-id-2"],
    "options": {
      "parallelTasks": 2,
      "mergeIntoOne": true
    }
  }'
```

---

## 📋 部署检查清单

### 部署前检查

- [ ] 数据库连接正常
- [ ] Redis服务运行中
- [ ] FFmpeg已安装并可用
- [ ] 视频存储目录有写入权限
- [ ] 即梦/可灵API密钥已配置
- [ ] 环境变量已设置

### 部署后验证

- [ ] 数据库表创建成功
- [ ] Prisma Client已生成
- [ ] AI服务启动成功
- [ ] 批量生成接口可访问
- [ ] Redis队列正常工作
- [ ] 视频生成功能测试通过

---

## 🔧 故障排查

### 问题1：迁移失败

**错误**：`Prisma migrate failed`

**解决方案**：
1. 检查数据库连接
2. 确认数据库用户有足够权限
3. 手动执行SQL文件

### 问题2：队列不工作

**错误**：任务提交后无响应

**解决方案**：
1. 检查Redis服务是否运行：`redis-cli ping`
2. 检查Redis连接配置
3. 查看AI服务日志

### 问题3：FFmpeg不可用

**错误**：`FFmpeg not found`

**解决方案**：
```bash
# Ubuntu/Debian
sudo apt-get install ffmpeg

# CentOS/RHEL
sudo yum install ffmpeg

# macOS
brew install ffmpeg

# Windows
# 下载FFmpeg并添加到PATH
# 或设置 FFMPEG_PATH 环境变量
```

### 问题4：视频生成失败

**错误**：`Video generation failed`

**解决方案**：
1. 检查API密钥是否正确
2. 查看视频provider日志
3. 验证图片URL可访问
4. 检查API配额是否充足

---

## 🔄 迁移回滚

如需回滚本次迁移：

```sql
-- 连接数据库
mysql -u root -p

-- 删除表
DROP TABLE IF EXISTS video_batch_generations;
```

**警告**：回滚将永久删除所有批量任务数据！

---

## 📊 性能优化建议

### 1. Redis优化

```bash
# Redis配置优化
redis-cli CONFIG SET maxmemory 2gb
redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

### 2. 数据库优化

```sql
-- 定期清理历史数据（保留最近30天）
DELETE FROM video_batch_generations 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY) 
  AND status IN ('COMPLETED', 'FAILED', 'CANCELLED');

-- 优化表
OPTIMIZE TABLE video_batch_generations;
```

### 3. 磁盘空间管理

```bash
# 定期清理临时视频文件
find ./data/temp -type f -mtime +7 -delete

# 监控磁盘使用
df -h ./data/videos
```

---

## 🔐 安全注意事项

1. **API密钥保护**：不要将API密钥提交到Git
2. **权限控制**：确保用户只能访问自己的批量任务
3. **配额限制**：合理设置每日生成配额
4. **资源限制**：限制单次批量任务的章节数量

---

## 📝 相关文档

- [批量视频生成使用指南](./BATCH-VIDEO-GENERATION-GUIDE.md)
- [实施总结](./BATCH-VIDEO-IMPLEMENTATION-SUMMARY.md)
- [即梦API文档](https://www.jimeng.ai/developers)
- [可灵API文档](https://docs.kuaishou.com/kling)

---

**部署完成后，请测试完整的工作流以确保所有功能正常！** ✅

