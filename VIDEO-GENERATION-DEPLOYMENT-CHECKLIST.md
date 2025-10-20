# 章节视频生成系统 - 部署检查清单

## 📋 部署前检查清单

### ✅ 环境准备

- [ ] **Node.js环境**
  - [ ] Node.js 18+ 已安装
  - [ ] npm 或 yarn 已安装
  - [ ] 版本检查: `node -v` && `npm -v`

- [ ] **FFmpeg安装**
  - [ ] FFmpeg已安装
  - [ ] 版本检查: `ffmpeg -version`
  - [ ] 路径配置正确

- [ ] **数据库准备**
  - [ ] MySQL 8.0+ 运行中
  - [ ] 数据库连接测试通过
  - [ ] 有足够的存储空间(建议100GB+)

- [ ] **Redis服务**（可选，用于Bull队列）
  - [ ] Redis 6+ 已安装并运行
  - [ ] 连接测试通过
  - [ ] 配置密码（生产环境）

### ✅ 代码部署

- [ ] **克隆代码**
  ```bash
  git pull origin dev
  cd 91Writing-Backend
  ```

- [ ] **安装依赖**
  ```bash
  npm install
  ```

- [ ] **数据库迁移**
  ```bash
  npx prisma migrate deploy
  npx prisma generate
  ```

- [ ] **运行Seed脚本**
  ```bash
  npm run db:seed
  ```

### ✅ 环境配置

- [ ] **创建.env文件**
  - [ ] 复制.env.example: `cp .env.example .env`
  - [ ] 配置数据库URL
  - [ ] 配置JWT密钥
  - [ ] 配置所有微服务端口

- [ ] **视频生成配置**
  - [ ] VOLCENGINE_ACCESS_KEY_ID
  - [ ] VOLCENGINE_SECRET_ACCESS_KEY
  - [ ] JIMENG_API_KEY 或 KLING_API_KEY
  - [ ] FFMPEG_PATH
  - [ ] VIDEO_STORAGE_PATH
  - [ ] VIDEO_CDN_URL

- [ ] **创建存储目录**
  ```bash
  mkdir -p /data/videos
  mkdir -p /tmp/video-generation
  chmod 755 /data/videos
  ```

### ✅ API密钥配置

- [ ] **火山引擎**
  - [ ] 注册火山引擎账号
  - [ ] 开通Visual API服务
  - [ ] 创建Access Key
  - [ ] 配置到.env

- [ ] **即梦/可灵**
  - [ ] 注册即梦或可灵账号
  - [ ] 获取API Key
  - [ ] 配置到.env
  - [ ] 确认账户余额充足

### ✅ 服务启动

- [ ] **启动数据库**
  ```bash
  # 检查MySQL状态
  systemctl status mysql
  # 或
  brew services list | grep mysql
  ```

- [ ] **启动Redis**（可选）
  ```bash
  redis-server
  # 或
  brew services start redis
  ```

- [ ] **启动所有微服务**
  ```bash
  npm run start:all
  # 或分别启动
  npm run start:gateway:dev
  npm run start:ai:dev
  npm run start:novel:dev
  npm run start:admin:dev
  ```

- [ ] **验证服务状态**
  ```bash
  ./scripts/check-services.sh
  ```

### ✅ 功能测试

- [ ] **健康检查**
  ```bash
  curl http://localhost:3000/api/health
  ```

- [ ] **登录测试**
  - [ ] 用户登录正常
  - [ ] Token获取成功
  - [ ] 权限验证正常

- [ ] **一致性配置测试**
  - [ ] 创建配置成功
  - [ ] 获取配置成功
  - [ ] 更新配置成功
  - [ ] 自动提取功能正常

- [ ] **视频生成测试**
  - [ ] 提交生成任务成功
  - [ ] 状态查询正常
  - [ ] 进度更新正常
  - [ ] 最终视频生成成功

- [ ] **Agent配置测试**
  - [ ] 管理员登录成功
  - [ ] 查看Agent配置
  - [ ] 编辑Agent配置
  - [ ] 测试Agent功能

### ✅ 性能测试

- [ ] **响应时间测试**
  - [ ] API响应 < 2秒
  - [ ] 分镜生成 < 15秒
  - [ ] 图片生成 < 30秒/批
  - [ ] 完整流程 < 10分钟

- [ ] **并发测试**
  - [ ] 3个并发任务正常
  - [ ] 队列管理正常
  - [ ] 无内存泄漏

- [ ] **负载测试**
  - [ ] 100个用户并发访问
  - [ ] 10个视频生成任务
  - [ ] 数据库连接池正常

### ✅ 安全检查

- [ ] **API安全**
  - [ ] JWT认证启用
  - [ ] 角色权限控制
  - [ ] 请求限流配置
  - [ ] CORS配置正确

- [ ] **数据安全**
  - [ ] API密钥加密存储
  - [ ] 敏感信息不在日志
  - [ ] 文件访问权限正确
  - [ ] SQL注入防护

- [ ] **成本控制**
  - [ ] 用户配额限制启用
  - [ ] 成本预估功能正常
  - [ ] 异常告警配置

### ✅ 监控配置

- [ ] **日志配置**
  - [ ] 日志级别设置
  - [ ] 日志文件轮转
  - [ ] 错误日志告警

- [ ] **性能监控**
  - [ ] 接口响应时间监控
  - [ ] 视频生成成功率
  - [ ] 队列长度监控
  - [ ] API调用统计

- [ ] **告警配置**
  - [ ] 失败率告警
  - [ ] 队列积压告警
  - [ ] 磁盘空间告警
  - [ ] API额度告警

## 🚀 部署步骤（完整流程）

### 第一步：准备工作（30分钟）
```bash
# 1. 更新代码
git pull origin dev

# 2. 安装依赖
cd 91Writing-Backend
npm install

# 3. 安装FFmpeg
# macOS
brew install ffmpeg
# Ubuntu
sudo apt-get install ffmpeg

# 4. 创建存储目录
mkdir -p /data/videos /tmp/video-generation
```

### 第二步：配置环境（15分钟）
```bash
# 1. 复制环境变量模板
cp .env.example .env

# 2. 编辑.env文件
nano .env

# 3. 配置API密钥
# - 火山引擎密钥
# - 即梦/可灵密钥
# - FFmpeg路径
# - 存储路径
```

### 第三步：数据库迁移（10分钟）
```bash
# 1. 运行迁移
npx prisma migrate deploy

# 2. 生成Prisma Client
npx prisma generate

# 3. 初始化种子数据
npm run db:seed
```

### 第四步：启动服务（5分钟）
```bash
# 1. 启动所有微服务
npm run start:all

# 2. 验证服务状态
./scripts/check-services.sh

# 3. 查看日志
tail -f *.log
```

### 第五步：功能测试（20分钟）
```bash
# 1. 运行测试脚本
./scripts/test-video-generation-api.sh

# 2. 手动测试
# - 登录系统
# - 创建一致性配置
# - 生成测试视频
# - 验证视频播放

# 3. 检查日志无错误
```

### 第六步：生产优化（可选）
```bash
# 1. 开启生产模式
NODE_ENV=production npm run start:prod

# 2. 配置Nginx反向代理
# 3. 配置SSL证书
# 4. 配置CDN加速
# 5. 配置监控告警
```

## 🎯 部署后验证

### 立即验证（必须）
1. ✅ 所有微服务正常运行
2. ✅ 数据库连接正常
3. ✅ API端点响应正常
4. ✅ 用户登录功能正常
5. ✅ 视频生成测试通过

### 24小时内验证
1. ✅ 无严重错误日志
2. ✅ 内存占用正常
3. ✅ 磁盘空间充足
4. ✅ 视频生成成功率>90%
5. ✅ API响应时间正常

### 一周内验证
1. ✅ 用户反馈良好
2. ✅ 无性能问题
3. ✅ 成本在预算内
4. ✅ 队列运行稳定
5. ✅ CDN流量正常

## ⚠️ 常见部署问题

### 问题1: Prisma迁移失败
```
错误: Error: P3009: migrate found failed migration
```

**解决方案**:
```bash
# 重置迁移
npx prisma migrate reset
# 重新迁移
npx prisma migrate deploy
```

### 问题2: FFmpeg未找到
```
错误: spawn ffmpeg ENOENT
```

**解决方案**:
```bash
# 查找FFmpeg路径
which ffmpeg

# 更新.env配置
FFMPEG_PATH=/usr/local/bin/ffmpeg
```

### 问题3: Redis连接失败
```
错误: Error: connect ECONNREFUSED 127.0.0.1:6379
```

**解决方案**:
```bash
# 启动Redis
redis-server

# 或使用systemd
sudo systemctl start redis
```

### 问题4: 视频生成失败
```
错误: 火山引擎API调用失败
```

**解决方案**:
1. 检查API密钥是否正确
2. 确认账户余额充足
3. 检查网络连接
4. 查看详细错误日志

## 📊 资源需求

### 最低配置
- **CPU**: 4核
- **内存**: 8GB
- **存储**: 100GB SSD
- **带宽**: 10Mbps

### 推荐配置
- **CPU**: 8核
- **内存**: 16GB
- **存储**: 500GB SSD
- **带宽**: 100Mbps

### 生产环境
- **CPU**: 16核
- **内存**: 32GB
- **存储**: 1TB SSD
- **带宽**: 1Gbps
- **CDN**: 必须
- **负载均衡**: 建议

## 🎉 部署完成

恭喜！章节视频生成系统已成功部署。

### 下一步行动
1. ✅ 监控系统运行状态
2. ✅ 收集用户反馈
3. ✅ 优化Agent提示词
4. ✅ 调整成本策略
5. ✅ 规划功能迭代

### 相关文档
- [配置指南](VIDEO-GENERATION-SETUP.md)
- [用户手册](VIDEO-GENERATION-USER-GUIDE.md)
- [优化指南](VIDEO-GENERATION-OPTIMIZATION.md)
- [最终报告](VIDEO-GENERATION-FINAL-REPORT.md)

---

**检查清单版本**: v1.0  
**最后更新**: 2025年1月20日  
**适用系统**: 91Writing视频生成系统

