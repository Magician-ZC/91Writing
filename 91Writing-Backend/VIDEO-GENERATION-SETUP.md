# 章节视频生成系统配置指南

## 概述

本文档说明如何配置和使用章节视频生成系统。该系统能够自动将小说章节内容转化为视频短剧。

## 环境变量配置

请在 `.env` 文件中添加以下配置：

```env
# ===== 视频生成系统配置 =====

# 火山引擎文生图配置
VOLCENGINE_ACCESS_KEY_ID=your_access_key_id
VOLCENGINE_SECRET_ACCESS_KEY=your_secret_access_key
VOLCENGINE_VISUAL_REGION=cn-beijing
VOLCENGINE_VISUAL_ENDPOINT=https://visual.volcengineapi.com
VOLCENGINE_VISUAL_MODEL=general-v2

# 即梦图生视频配置（优先）
JIMENG_API_KEY=your_jimeng_api_key
JIMENG_API_URL=https://api.jimeng.ai

# 可灵图生视频配置（备选）
KLING_API_KEY=your_kling_api_key
KLING_API_URL=https://api.kuaishou.com/kling

# 视频提供商选择: jimeng 或 kling
VIDEO_PROVIDER=jimeng

# FFmpeg配置
FFMPEG_PATH=/usr/bin/ffmpeg

# 视频存储配置
VIDEO_STORAGE_PATH=/data/videos
VIDEO_TEMP_DIR=/tmp/video-generation
VIDEO_CDN_URL=https://cdn.91writing.com/videos

# 视频生成默认配置
DEFAULT_SCENE_COUNT=5
DEFAULT_VIDEO_DURATION=15
DEFAULT_VIDEO_QUALITY=medium
```

## 依赖安装

### 1. 安装Node.js依赖

```bash
cd 91Writing-Backend
npm install axios
```

### 2. 安装FFmpeg

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

**验证安装:**
```bash
ffmpeg -version
```

## 数据库迁移

运行Prisma迁移以创建新的数据表：

```bash
cd 91Writing-Backend
npx prisma migrate dev --name add_video_generation_tables
npx prisma generate
```

## 初始化Agent提示词配置

系统需要管理员创建初始的Agent提示词配置。可以通过以下SQL脚本初始化：

```sql
-- 分镜脚本生成Agent配置
INSERT INTO agent_prompt_configs (id, agent_type, name, system_prompt, template_prompt, version, is_active, description, created_at, updated_at)
VALUES (
  'agent_script_gen_v1',
  'SCRIPT_GENERATOR',
  '分镜脚本生成器 v1',
  '你是一个专业的视频分镜脚本编写助手。你的任务是将小说章节内容转化为适合视频化的分镜脚本。',
  '请为章节内容生成{sceneCount}个分镜场景，总时长约{totalDuration}秒。',
  1,
  true,
  '默认的分镜脚本生成配置',
  NOW(),
  NOW()
);

-- 文生图优化Agent配置
INSERT INTO agent_prompt_configs (id, agent_type, name, system_prompt, template_prompt, version, is_active, description, created_at, updated_at)
VALUES (
  'agent_image_opt_v1',
  'IMAGE_OPTIMIZER',
  '文生图优化器 v1',
  '你是一个专业的AI绘图提示词生成专家。',
  '请为场景生成详细的AI绘图提示词。',
  1,
  true,
  '默认的图片生成提示词配置',
  NOW(),
  NOW()
);

-- 图生视频优化Agent配置
INSERT INTO agent_prompt_configs (id, agent_type, name, system_prompt, template_prompt, version, is_active, description, created_at, updated_at)
VALUES (
  'agent_video_opt_v1',
  'VIDEO_OPTIMIZER',
  '图生视频优化器 v1',
  '你是一个专业的视频运动描述专家。',
  '请为场景生成简洁的运动描述。',
  1,
  true,
  '默认的视频生成提示词配置',
  NOW(),
  NOW()
);
```

## API使用示例

### 1. 创建一致性配置

```bash
curl -X POST http://localhost:3000/api/novel/consistency \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "novelId": "novel_id",
    "characters": [
      {
        "name": "主角",
        "baseAppearance": "黑发蓝眼，身穿黑色长袍的年轻男子",
        "keywords": ["黑发", "蓝眼", "黑袍"],
        "dynamicState": {}
      }
    ],
    "visualStyle": {
      "overall": "realistic",
      "colorTone": "warm",
      "artStyle": "cinematic",
      "lighting": "natural"
    }
  }'
```

### 2. 自动提取一致性配置

```bash
curl -X POST http://localhost:3000/api/novel/consistency/auto-extract \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "novelId": "novel_id",
    "startChapter": 1,
    "endChapter": 3,
    "overwrite": false
  }'
```

### 3. 生成章节视频

```bash
curl -X POST http://localhost:3000/api/ai/video-generation/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chapterId": "chapter_id",
    "sceneCount": 5,
    "videoDuration": 15,
    "forceRegenerate": false
  }'
```

### 4. 查询视频生成状态

```bash
curl -X GET http://localhost:3000/api/ai/video-generation/status/chapter_id \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 生成流程说明

视频生成流程分为5个阶段：

1. **SCRIPT (分镜脚本生成)** - 分析章节内容，生成分镜描述
2. **IMAGE (图片生成)** - 根据分镜描述生成场景图片
3. **VIDEO (视频生成)** - 将图片转化为视频片段
4. **MERGE (视频合成)** - 合并所有片段为完整视频
5. **UPLOAD (上传完成)** - 上传到CDN并完成

每个阶段的进度会实时更新到数据库，可以通过状态查询API获取。

## 性能优化建议

1. **分镜数量**: 建议3-8个场景，过多会增加生成时间
2. **视频时长**: 建议15-30秒，保持短视频格式
3. **并发控制**: 建议同时最多处理3个视频生成任务
4. **缓存策略**: 已生成的视频会缓存，避免重复生成

## 故障排查

### 问题1: FFmpeg not found

**解决方案**: 确保FFmpeg已正确安装，并在环境变量中配置了路径

```bash
which ffmpeg  # 查看FFmpeg路径
```

### 问题2: 视频生成超时

**解决方案**: 
- 检查API密钥是否正确
- 增加超时时间配置
- 检查网络连接

### 问题3: 人物一致性差

**解决方案**:
- 完善一致性配置中的角色描述
- 添加参考图片URL
- 优化关键词描述

## 成本估算

基于火山引擎和即梦的API定价（仅供参考）：

- **文生图**: 约0.02元/张
- **图生视频**: 约0.5元/段(5秒)
- **每章节成本**: 5场景 × (0.02 + 1.5) = 约7.6元

建议：
- 为VIP用户提供视频生成功能
- 设置每日/每月生成次数限制
- 提供预览功能，满意后再正式生成

## 下一步开发

- [ ] 集成Bull队列处理长任务
- [ ] 添加视频水印功能
- [ ] 支持自定义配乐
- [ ] 实现批量章节视频生成
- [ ] 添加视频编辑功能

## 联系支持

如有问题，请查阅：
- [火山引擎文档](https://www.volcengine.com/docs/visual)
- [即梦API文档](https://www.jimeng.ai/developers)
- [FFmpeg文档](https://ffmpeg.org/documentation.html)

