# 📹 91Writing 章节视频生成系统

> 将小说章节自动转化为精美视频短剧的AI驱动系统

## 🌟 功能特色

- 🎬 **智能分镜** - AI自动分析章节生成分镜脚本
- 🎨 **视觉一致性** - 角色、场景、物品全程保持统一
- 🤖 **多Agent优化** - 三个专业Agent协作提升质量
- ⚡ **异步处理** - Bull队列+进度追踪
- 📊 **实时监控** - 完整的日志和状态管理

## 🚀 快速开始

### 1. 环境准备
```bash
# 安装FFmpeg
brew install ffmpeg  # macOS
# 或
sudo apt-get install ffmpeg  # Ubuntu

# 验证安装
ffmpeg -version
```

### 2. 数据库迁移
```bash
cd 91Writing-Backend
npx prisma migrate dev --name add_video_generation_tables
npx prisma generate
npm run db:seed
```

### 3. 配置API密钥
在`.env`文件中添加：
```env
# 火山引擎
VOLCENGINE_ACCESS_KEY_ID=xxx
VOLCENGINE_SECRET_ACCESS_KEY=xxx

# 即梦/可灵
JIMENG_API_KEY=xxx
VIDEO_PROVIDER=jimeng

# FFmpeg
FFMPEG_PATH=/usr/bin/ffmpeg
VIDEO_STORAGE_PATH=/data/videos
```

### 4. 启动服务
```bash
npm run start:all
```

### 5. 测试API
```bash
./scripts/test-video-generation-api.sh
```

## 📖 文档导航

### 🔧 开发文档
- [**配置指南**](../VIDEO-GENERATION-SETUP.md) - 环境配置和API密钥设置
- [**开发总结**](../VIDEO-GENERATION-SUMMARY.md) - 技术架构和实现细节
- [**最终报告**](../VIDEO-GENERATION-FINAL-REPORT.md) - 完整功能说明

### 🎯 运维文档
- [**优化指南**](../VIDEO-GENERATION-OPTIMIZATION.md) - 性能优化和最佳实践
- [**部署清单**](../VIDEO-GENERATION-DEPLOYMENT-CHECKLIST.md) - 部署步骤检查

### 👥 用户文档
- [**用户手册**](../VIDEO-GENERATION-USER-GUIDE.md) - 功能使用指南
- [**进度报告**](../VIDEO-GENERATION-PROGRESS.md) - 开发进度追踪

### 🎊 总结文档
- [**完成报告**](../VIDEO-GENERATION-COMPLETION-REPORT.md) - 项目完成总结

## 🏗️ 系统架构

### 核心模块
```
AI Service (3004)
├── VideoGenerationModule      # 视频生成主模块
│   ├── VideoGenerationService # 主控服务
│   ├── VideoGenerationQueue   # Bull队列
│   └── VideoGenerationProcessor # 任务处理器
├── Agents                     # Agent系统
│   ├── StoryboardAgent       # 分镜脚本
│   ├── ImageGenerationAgent  # 文生图优化
│   └── VideoGenerationAgent  # 图生视频优化
├── Providers                  # 外部API
│   ├── VolcengineVisualProvider
│   ├── JimengVideoProvider
│   └── KlingVideoProvider
└── Services
    └── FFmpegService         # 视频合成

Novel Service (3003)
└── ConsistencyModule          # 一致性管理
    ├── ConsistencyService
    └── ConsistencyController

Admin Service (3006)
└── AgentConfigModule          # Agent配置管理
    ├── AgentConfigService
    └── AgentConfigController
```

### 数据流
```
用户请求
    ↓
API Gateway → AI Service
    ↓
1. 获取章节内容 + 一致性配置
2. StoryboardAgent → 生成分镜脚本
3. ImageGenerationAgent → 生成图片提示词
4. VolcengineProvider → 生成图片
5. VideoGenerationAgent → 生成视频提示词
6. JimengProvider → 生成视频片段
7. FFmpegService → 合成最终视频
8. 更新章节记录 → 返回结果
```

## 🔌 API端点

### 视频生成
```
POST   /api/ai/video-generation/generate
GET    /api/ai/video-generation/status/:chapterId
```

### 一致性配置
```
POST   /api/novel/consistency
GET    /api/novel/consistency/:novelId
PUT    /api/novel/consistency/:novelId
POST   /api/novel/consistency/auto-extract
```

### Agent配置（管理员）
```
GET    /api/admin/agent-prompts
POST   /api/admin/agent-prompts
PUT    /api/admin/agent-prompts/:id
POST   /api/admin/agent-prompts/test
```

### 章节视频
```
GET    /api/novel/novels/:novelId/chapters/:id/video-status
DELETE /api/novel/novels/:novelId/chapters/:id/video
```

## 💻 技术栈

### 后端
- **框架**: NestJS 10
- **ORM**: Prisma 5
- **队列**: Bull 4
- **数据库**: MySQL 8
- **缓存**: Redis 7

### 外部服务
- **文生图**: 火山引擎 Visual API
- **图生视频**: 即梦/可灵 API
- **视频处理**: FFmpeg

### 前端
- **框架**: Vue 3
- **UI库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router 4

## 📊 性能指标

| 指标 | 数值 | 说明 |
|------|------|------|
| 生成速度 | 5-8分钟 | 5场景视频 |
| 成功率 | 95%+ | 整体成功率 |
| 并发能力 | 3任务 | 同时处理 |
| 成本 | ¥7.6/视频 | 5场景 |
| 存储 | 10-50MB | 单个视频 |

## 🔍 故障排查

### 常见问题

**1. 视频生成失败**
```bash
# 查看日志
tail -f ai-service.log

# 检查API密钥
echo $JIMENG_API_KEY

# 测试API连接
curl -H "Authorization: Bearer $JIMENG_API_KEY" https://api.jimeng.ai/v1/health
```

**2. FFmpeg错误**
```bash
# 检查FFmpeg
ffmpeg -version

# 更新配置
export FFMPEG_PATH=/usr/bin/ffmpeg
```

**3. 数据库错误**
```bash
# 重新生成Prisma Client
npx prisma generate

# 检查迁移状态
npx prisma migrate status
```

## 🎯 最佳实践

### 1. 成本控制
- 设置用户配额限制
- 启用预览功能
- 实现缓存机制
- 批量生成折扣

### 2. 性能优化
- 并发控制(3任务)
- Agent配置缓存
- 临时文件清理
- CDN加速

### 3. 质量保证
- 完善一致性配置
- 优化Agent提示词
- A/B测试效果
- 收集用户反馈

## 📦 版本历史

### v1.0.0 (2025-01-20)
- ✅ 初始版本发布
- ✅ 完整的视频生成流程
- ✅ 三Agent系统
- ✅ 一致性管理
- ✅ Bull队列集成
- ✅ 前端界面完整

## 🤝 贡献指南

### 添加新Provider
1. 实现`ITextToImageProvider`或`IImageToVideoProvider`接口
2. 在`video-generation.module.ts`中注册
3. 添加配置到`.env`
4. 更新文档

### 优化Agent
1. 访问管理后台 `/admin/agent-config`
2. 编辑提示词配置
3. 使用测试工具验证
4. 启用新版本

### 报告问题
- GitHub Issues
- 邮件: support@91writing.com

## 📄 许可证

MIT License - Copyright (c) 2025 91Writing

---

**维护者**: 91Writing Team  
**最后更新**: 2025年1月20日  
**版本**: v1.0.0  
**状态**: ✅ 生产就绪

