# 📝 视频生成系统 - 快速参考卡

## 🚀 一键部署

```bash
cd 91Writing-Backend
npx prisma migrate dev --name add_video_generation_tables
npx prisma generate && npm run db:seed
npm run start:all
```

## 🔑 必需配置

```env
# .env 必填项
VOLCENGINE_ACCESS_KEY_ID=xxx
VOLCENGINE_SECRET_ACCESS_KEY=xxx
JIMENG_API_KEY=xxx
FFMPEG_PATH=/usr/bin/ffmpeg
VIDEO_STORAGE_PATH=/data/videos
```

## 📡 关键API

### 生成视频
```bash
POST /api/ai/video-generation/generate
{
  "chapterId": "xxx",
  "sceneCount": 5,
  "videoDuration": 15
}
```

### 查询状态
```bash
GET /api/ai/video-generation/status/{chapterId}
```

### 一致性配置
```bash
# 创建
POST /api/novel/consistency

# 获取
GET /api/novel/consistency/{novelId}

# 自动提取
POST /api/novel/consistency/auto-extract
```

## 🗂️ 文件位置

### 后端核心
```
apps/ai-service/src/
├── modules/video-generation/  # 主模块
├── services/                   # Agent系统
├── providers/                  # API集成
└── queues/                     # Bull队列

apps/novel-service/src/
└── modules/consistency/        # 一致性管理

apps/admin-service/src/
└── modules/agent-config/       # Agent配置
```

### 前端界面
```
src/
├── components/writer/ChapterVideoPanel.vue
├── views/NovelConsistencySettings.vue
└── views/admin/settings/AgentPromptConfig.vue
```

## 🎯 生成流程

```
章节内容 
  → 分镜脚本(10秒)
  → 图片生成(2分钟)
  → 视频生成(4分钟)
  → 视频合成(30秒)
  → 完成(总计6分钟)
```

## 💰 成本速查

| 项目 | 单价 | 数量 | 小计 |
|------|------|------|------|
| 分镜AI | ¥0.01 | 1 | ¥0.01 |
| 提示词AI | ¥0.01 | 10 | ¥0.10 |
| 文生图 | ¥0.02 | 5 | ¥0.10 |
| 图生视频 | ¥1.5 | 5 | ¥7.50 |
| **总计** | - | - | **¥7.71** |

## 🔧 常用命令

### 数据库
```bash
npx prisma migrate dev        # 开发迁移
npx prisma migrate deploy     # 生产迁移
npx prisma generate           # 生成Client
npm run db:seed               # 初始化数据
```

### 服务
```bash
npm run start:ai:dev          # AI服务
npm run start:novel:dev       # Novel服务
npm run start:admin:dev       # Admin服务
npm run start:all             # 所有服务
```

### 测试
```bash
npm run test                  # 单元测试
npm run test:integration      # 集成测试
./scripts/test-video-generation-api.sh  # API测试
```

## 🐛 故障速查

### FFmpeg not found
```bash
# 安装
brew install ffmpeg  # macOS
sudo apt-get install ffmpeg  # Ubuntu

# 配置路径
export FFMPEG_PATH=/usr/bin/ffmpeg
```

### API调用失败
```bash
# 检查密钥
echo $JIMENG_API_KEY

# 测试连接
curl -H "Authorization: Bearer $JIMENG_API_KEY" \
  https://api.jimeng.ai/v1/health
```

### 数据库错误
```bash
# 重置
npx prisma migrate reset

# 重新迁移
npx prisma migrate dev
```

### 队列不工作
```bash
# 检查Redis
redis-cli ping

# 启动Redis
redis-server
```

## 📊 监控指标

### 关键指标
- **成功率**: >90% 正常
- **平均耗时**: <10分钟 正常
- **队列长度**: <10 正常
- **失败率**: <10% 正常

### 告警阈值
- **成功率 < 80%**: 🔴 严重
- **队列 > 20**: 🟡 警告
- **耗时 > 15分钟**: 🟡 警告
- **失败率 > 20%**: 🔴 严重

## 📚 文档快速链接

| 文档 | 用途 | 链接 |
|------|------|------|
| 配置指南 | 环境设置 | [SETUP.md](VIDEO-GENERATION-SETUP.md) |
| 用户手册 | 功能使用 | [USER-GUIDE.md](VIDEO-GENERATION-USER-GUIDE.md) |
| 部署清单 | 部署步骤 | [CHECKLIST.md](VIDEO-GENERATION-DEPLOYMENT-CHECKLIST.md) |
| 优化指南 | 性能优化 | [OPTIMIZATION.md](VIDEO-GENERATION-OPTIMIZATION.md) |
| 完成报告 | 项目总结 | [COMPLETION.md](VIDEO-GENERATION-COMPLETION-REPORT.md) |

## 🎬 示例代码

### 前端调用
```javascript
import { videoGenerationService } from '@/services/videoGenerationService'

// 生成视频
await videoGenerationService.generateVideo({
  chapterId: 'xxx',
  sceneCount: 5,
  videoDuration: 15
})

// 查询状态
const status = await videoGenerationService.getVideoStatus('xxx')
```

### 后端服务
```typescript
import { VideoGenerationService } from './video-generation.service'

// 生成视频
const result = await this.videoGenerationService.generateChapterVideo(
  userId,
  { chapterId, sceneCount: 5, videoDuration: 15 }
)

// 查询状态
const status = await this.videoGenerationService.getVideoGenerationStatus(chapterId)
```

## 🎨 Agent配置示例

### 分镜Agent
```json
{
  "agentType": "SCRIPT_GENERATOR",
  "systemPrompt": "你是专业的分镜编剧...",
  "templatePrompt": "生成{sceneCount}个分镜...",
  "parameters": {
    "temperature": 0.7,
    "maxTokens": 2000
  }
}
```

### 文生图Agent
```json
{
  "agentType": "IMAGE_OPTIMIZER",
  "systemPrompt": "你是AI绘图专家...",
  "templatePrompt": "生成详细提示词...",
  "parameters": {
    "temperature": 0.8,
    "maxTokens": 500
  }
}
```

## 📞 紧急联系

- **技术支持**: support@91writing.com
- **紧急热线**: 400-XXX-XXXX
- **在线文档**: https://docs.91writing.com

---

**版本**: v1.0  
**更新**: 2025-01-20  
**打印**: 建议打印此卡片放在手边 📌

