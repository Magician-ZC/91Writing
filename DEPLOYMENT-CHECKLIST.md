# 📋 视频生成系统 - 部署检查清单

**使用说明**: 按照此清单逐项检查，确保系统正确部署。

---

## ✅ 部署前准备

### 环境检查

- [ ] Node.js >= 16.0.0
- [ ] MySQL >= 8.0
- [ ] FFmpeg 已安装
- [ ] 磁盘空间 >= 50GB
- [ ] 内存 >= 8GB

### 依赖安装

```bash
cd 91Writing-Backend
npm install
```

- [ ] 依赖安装成功
- [ ] 无错误信息

---

## ✅ 数据库配置

### 1. 创建数据库

```sql
CREATE DATABASE IF NOT EXISTS 91writing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

- [ ] 数据库创建成功

### 2. 配置连接

```env
DATABASE_URL="mysql://root:password@localhost:3306/91writing"
```

- [ ] `.env` 文件已配置
- [ ] 数据库连接正常

### 3. 执行迁移

```bash
npx prisma migrate dev --name add_video_complete_features
npx prisma generate
```

- [ ] 迁移执行成功
- [ ] Prisma Client生成成功
- [ ] 验证表已创建:
  - [ ] video_api_configs
  - [ ] video_api_usage_logs
  - [ ] user_video_quotas
  - [ ] character_features
  - [ ] consistency_profiles (字段增强)

### 4. 初始化种子数据

```bash
mysql -u root -p 91writing < prisma/seeds/video-api-config.seed.sql
mysql -u root -p 91writing < prisma/seeds/character-feature.seed.sql
```

- [ ] 种子数据插入成功
- [ ] 验证默认配置存在:

```sql
SELECT * FROM video_api_configs WHERE id = 'default_config';
```

---

## ✅ 环境变量配置

### 必须配置

在 `.env` 文件中添加：

```env
# 1. 加密密钥（32字符）⚠️ 必须
ENCRYPTION_KEY=your-random-32-character-key-here!!

# 生成方法：
# openssl rand -base64 32
# node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

- [ ] ENCRYPTION_KEY 已配置
- [ ] 密钥长度 = 32字符

### 可选配置（后备）

```env
# 如果数据库配置失败，将使用这些后备配置
VOLCENGINE_ACCESS_KEY_ID=xxx
VOLCENGINE_SECRET_ACCESS_KEY=xxx
JIMENG_API_KEY=xxx
KLING_API_KEY=xxx
VIDEO_PROVIDER=jimeng
FFMPEG_PATH=/usr/bin/ffmpeg
VIDEO_STORAGE_PATH=/data/videos
```

- [ ] 后备配置已设置（可选）

---

## ✅ 服务启动

### 1. 编译服务

```bash
cd 91Writing-Backend
npm run build
```

- [ ] 编译成功
- [ ] 无TypeScript错误
- [ ] dist/ 目录已生成

### 2. 启动服务

```bash
# 方法1: 启动所有服务
npm run start:all

# 方法2: 使用脚本
./START.sh   # Linux/Mac
START.bat    # Windows
```

- [ ] admin-service 启动成功 (端口3003)
- [ ] ai-service 启动成功 (端口3002)
- [ ] novel-service 启动成功 (端口3004)
- [ ] api-gateway 启动成功 (端口3000)

### 3. 健康检查

```bash
# 检查各服务健康状态
curl http://localhost:3003/health  # admin-service
curl http://localhost:3002/health  # ai-service
curl http://localhost:3004/health  # novel-service
curl http://localhost:3000/health  # api-gateway
```

- [ ] 所有服务健康检查通过

---

## ✅ API密钥配置

### 1. 访问管理后台

访问: `http://localhost:3000/admin/settings/video-api-config`

- [ ] 页面正常打开
- [ ] 无控制台错误

### 2. 配置火山引擎

- [ ] 输入 Access Key ID
- [ ] 输入 Secret Access Key
- [ ] 点击"测试火山引擎连接"
- [ ] 测试通过 ✅

### 3. 配置即梦

- [ ] 输入 API Key
- [ ] 点击"测试即梦连接"
- [ ] 测试通过 ✅

### 4. 配置可灵（可选）

- [ ] 输入 API Key
- [ ] 点击"测试可灵连接"
- [ ] 测试通过 ✅

### 5. 保存配置

- [ ] 点击"保存配置"
- [ ] 收到成功提示
- [ ] 刷新页面，配置保留

---

## ✅ 路径配置

### 1. FFmpeg检测

```bash
# 检测FFmpeg路径
which ffmpeg    # Linux/Mac
where ffmpeg    # Windows
```

- [ ] FFmpeg已安装
- [ ] 在管理后台设置正确路径

### 2. 存储路径

```bash
# 创建存储目录
mkdir -p /data/videos
mkdir -p /tmp/video-generation

# 设置权限
chmod 755 /data/videos
chmod 755 /tmp/video-generation
```

- [ ] 视频存储路径已创建
- [ ] 临时文件路径已创建
- [ ] 权限设置正确

---

## ✅ 成本控制配置

### 1. 配额设置

在管理后台"成本控制"Tab:

- [ ] 用户每日配额: 5 （根据需求调整）
- [ ] 用户每月配额: 50
- [ ] 月度预算: 1000元
- [ ] 成本警报阈值: 800元

### 2. 验证配额

```bash
# 查询配额配置
SELECT * FROM video_api_configs WHERE id = 'default_config';
```

- [ ] 配额设置已保存

---

## ✅ 功能测试

### 1. 管理后台测试

**VideoAPIConfigAdmin**:
- [ ] API密钥配置界面正常
- [ ] 路径配置界面正常
- [ ] 成本统计显示正常
- [ ] 连接测试功能工作

**AgentPromptConfig**:
- [ ] Agent列表加载正常
- [ ] 编辑配置功能正常
- [ ] 激活配置功能正常
- [ ] 测试功能工作

### 2. 用户界面测试

**ChapterVideoPanel**:
- [ ] 组件加载正常
- [ ] 生成按钮显示
- [ ] 配置对话框打开

**NovelConsistencySettings**:
- [ ] 页面加载正常
- [ ] 角色列表显示（如有）
- [ ] 视觉风格配置正常

### 3. 视频生成测试

创建测试章节:

```
标题: 测试章节
内容: 
李明是一位年轻的考古学家，这天他来到了传说中的古老图书馆。
阳光透过彩色玻璃窗洒在书架上，空气中弥漫着古籍的味道。
他小心翼翼地翻开一本泛黄的书籍，突然发现了一张神秘的地图...
```

**执行生成**:
- [ ] 点击"生成视频"
- [ ] 提交成功，返回任务ID
- [ ] 进度显示正常（0-100%）
- [ ] 阶段提示正常（分镜→图片→视频→合成）
- [ ] 5-8分钟后完成
- [ ] 视频URL返回
- [ ] 视频可播放

**验证数据库**:
```sql
-- 检查章节状态
SELECT id, videoStatus, videoUrl FROM chapters WHERE id = 'your-chapter-id';

-- 检查角色提取
SELECT * FROM character_features WHERE chapterId = 'your-chapter-id';

-- 检查一致性配置
SELECT * FROM consistency_profiles WHERE novelId = 'your-novel-id';

-- 检查使用日志
SELECT * FROM video_api_usage_logs ORDER BY created_at DESC LIMIT 10;

-- 检查配额消费
SELECT * FROM user_video_quotas WHERE userId = 'your-user-id';
```

- [ ] videoStatus = 'COMPLETED'
- [ ] videoUrl 不为空
- [ ] 角色特征已提取
- [ ] 一致性配置已创建
- [ ] 使用日志已记录
- [ ] 配额已扣除

---

## ✅ 性能验证

### 响应时间

- [ ] 配置查询 < 10ms
- [ ] 配额检查 < 20ms
- [ ] 角色提取 < 3s
- [ ] 成本统计 < 100ms
- [ ] 单个场景图片生成 < 30s
- [ ] 单个视频片段生成 < 60s
- [ ] 完整视频生成 < 8分钟

### 并发测试

```bash
# 同时提交3个生成任务
for i in {1..3}; do
  curl -X POST http://localhost:3000/api/ai/generate \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d "{\"chapterId\":\"chapter-$i\",\"sceneCount\":3}" &
done
```

- [ ] 3个任务都正常执行
- [ ] 无资源耗尽错误
- [ ] 无内存泄漏

---

## ✅ 安全验证

### 加密

```bash
# 验证密钥已加密
SELECT volcengine_secret_access_key FROM video_api_configs WHERE id = 'default_config';
# 应该看到加密后的字符串，格式: "abc123:xyz789..."
```

- [ ] 密钥已加密存储
- [ ] 前端显示已脱敏（****）

### 权限

```bash
# 测试无token访问（应该失败）
curl http://localhost:3000/api/admin/video-api-config

# 测试普通用户token（应该失败）
curl http://localhost:3000/api/admin/video-api-config \
  -H "Authorization: Bearer <user-token>"

# 测试管理员token（应该成功）
curl http://localhost:3000/api/admin/video-api-config \
  -H "Authorization: Bearer <admin-token>"
```

- [ ] 未认证返回401
- [ ] 普通用户返回403
- [ ] 管理员正常访问

---

## ✅ 监控设置

### 日志监控

- [ ] 设置日志轮转
- [ ] 配置日志级别
- [ ] 错误日志告警

### 成本监控

- [ ] 每日成本报表
- [ ] 预算警报（80%触发）
- [ ] 异常使用检测

### 性能监控

- [ ] 响应时间监控
- [ ] 错误率监控
- [ ] 资源使用监控

---

## 🎯 上线标准

### 必须达标（100%）

- [ ] ✅ 所有服务启动正常
- [ ] ✅ 数据库迁移完成
- [ ] ✅ API密钥配置完成
- [ ] ✅ 测试生成视频成功
- [ ] ✅ 配额管理生效
- [ ] ✅ 成本统计正常
- [ ] ✅ 安全验证通过

### 建议达标（80%+）

- [ ] 性能测试通过
- [ ] 并发测试通过
- [ ] 日志监控设置
- [ ] 成本监控设置
- [ ] 错误告警设置
- [ ] 文档完善

---

## 🚦 上线决策

### ✅ 可以上线（绿灯）

所有"必须达标"项都已完成

### ⚠️ 谨慎上线（黄灯）

- "必须达标"完成 >= 90%
- "建议达标"完成 >= 60%
- 存在已知问题但有规避方案

### ❌ 不可上线（红灯）

- "必须达标"完成 < 90%
- 存在严重安全问题
- 存在数据丢失风险

---

## 📞 紧急联系

### 技术支持

- 📖 查看文档: `VIDEO-GENERATION-COMPLETE-SUMMARY.md`
- 🔍 故障排查: `VIDEO-GENERATION-AUDIT-REPORT.md`
- 💬 提交Issue: GitHub Issues

### 回滚方案

```bash
# 数据库回滚
npx prisma migrate resolve --rolled-back <migration-name>

# 代码回滚
git checkout <previous-commit>

# 服务重启
npm run start:all
```

---

**检查日期**: __________  
**检查人员**: __________  
**上线决策**: [ ] 绿灯 [ ] 黄灯 [ ] 红灯  
**备注**: ______________________________


