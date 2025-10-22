# 视频生成功能配置指南

## 🎯 概述

91Writing 的视频生成功能采用**管理员统一配置**的模式，用户**无需自己配置文生图和图生视频的API密钥**。

---

## 📋 架构说明

### 配置方式对比

| 功能 | 配置方式 | 原因 |
|------|---------|------|
| **AI对话/生成** | 用户自定义配置 | 用户可能有自己的API Key，灵活性高 |
| **视频生成** | 管理员统一配置 | API成本高，需要统一管理和控制配额 |

---

## 🔧 管理员配置流程

### 1. 访问配置页面

登录管理员后台：
```
http://localhost:8080/admin/login
```

在侧边栏菜单中找到：
```
📹 视频API配置
```

### 2. 配置API密钥

#### Tab 1: API密钥配置

**火山引擎（文生图Provider）**
- `Access Key ID`: 火山引擎访问密钥ID
- `Secret Access Key`: 火山引擎密钥（AES-256加密存储）
- 点击"测试火山引擎连接"验证配置

**即梦（图生视频Provider - 推荐）**
- `API Key`: 即梦API密钥
- 点击"测试即梦连接"验证配置

**可灵（图生视频Provider - 备选）**
- `API Key`: 可灵API密钥
- 点击"测试可灵连接"验证配置

#### Tab 2: 文生图配置

```json
{
  "defaultResolution": "1024x576",      // 默认分辨率
  "quality": "standard",                // 图片质量
  "batchSize": 1,                       // 批次大小
  "samplingSteps": 30,                  // 采样步数
  "cfgScale": 7.5,                      // CFG Scale
  "defaultStyle": "realistic",          // 默认风格
  "globalNegativePrompt": "...",        // 全局负面提示词
  "enableConsistency": true,            // 启用一致性
  "timeout": 60                         // 超时时间（秒）
}
```

#### Tab 3: 图生视频配置

```json
{
  "defaultDuration": 5,                 // 默认时长（秒）
  "resolution": "1024x576",             // 分辨率
  "fps": 30,                            // 帧率
  "defaultMotionIntensity": "medium",   // 动作强度
  "quality": "high",                    // 视频质量
  "compressionLevel": "medium",         // 压缩级别
  "transitionEffect": "fade",           // 转场效果
  "transitionDuration": 0.5,            // 转场时长（秒）
  "timeout": 120,                       // 超时时间（秒）
  "maxRetries": 2,                      // 最大重试次数
  "enableCharacterConsistency": true    // 启用角色一致性
}
```

#### Tab 4: 用户默认配置

```json
{
  "defaultSceneCount": 5,               // 默认场景数
  "minSceneWords": 100,                 // 最小场景字数
  "defaultTotalDuration": 30,           // 默认总时长（秒）
  "addTitleFrame": true,                // 添加标题帧
  "titleFrameDuration": 2               // 标题帧时长（秒）
}
```

#### Tab 5: 系统配置

**Provider选择**
- `videoProvider`: "jimeng" 或 "kling"（选择图生视频供应商）

**路径配置**
- `ffmpegPath`: FFmpeg可执行文件路径
- `ffmpegPreset`: 编码预设（ultrafast/fast/medium/slow/veryslow）
- `videoStoragePath`: 视频存储路径
- `tempStoragePath`: 临时文件路径
- `autoCleanTemp`: 是否自动清理临时文件

**成本控制**
- `userDailyQuota`: 用户每日配额（默认：5）
- `userMonthlyQuota`: 用户每月配额（默认：50）
- `monthlyBudget`: 月度预算（默认：1000.0）
- `costAlertThreshold`: 成本警告阈值（默认：800.0）
- `costPerImage`: 单张图片成本（默认：0.02）
- `costPerVideo`: 单个视频成本（默认：1.5）

**性能配置**
```json
{
  "maxConcurrentTasks": 3,              // 最大并发任务数
  "imageGenConcurrency": 2,             // 文生图并发数
  "videoGenConcurrency": 1,             // 图生视频并发数
  "enableCache": false,                 // 启用缓存
  "enableQueue": true                   // 启用队列
}
```

### 3. 保存配置

点击"保存所有配置"按钮，配置会：
- ✅ 加密存储API密钥
- ✅ 立即生效
- ✅ 所有用户共享此配置

---

## 👥 用户使用流程

### 1. 用户无需配置

用户**不需要**：
- ❌ 配置火山引擎密钥
- ❌ 配置即梦/可灵密钥
- ❌ 关心技术细节

### 2. 直接使用

用户只需：
1. 打开章节
2. 点击"生成视频"按钮
3. 选择生成参数（可选）
4. 等待视频生成完成

### 3. 配额限制

根据用户套餐不同：
- 免费用户：每日 X 次
- 基础会员：每日 Y 次
- 高级会员：每日 Z 次

---

## 🔍 配置验证

### 测试连接

在配置页面点击"测试连接"按钮：
- ✅ 成功：显示绿色提示
- ❌ 失败：显示错误信息

### 查看统计

#### 成本统计
- 本月总成本
- 本月图片生成数量
- 本月视频生成数量
- 成本趋势图

#### 用户配额
- 查询任意用户的配额使用情况
- 每日已用/限额
- 每月已用/限额
- 总生成次数

---

## 📊 数据库结构

### VideoAPIConfig 表

```typescript
model VideoAPIConfig {
  id                        String @id @default(cuid())
  
  // API密钥（加密存储）
  volcengineAccessKeyId     String? @map("volcengine_access_key_id")
  volcengineSecretAccessKey String? @map("volcengine_secret_access_key")
  jimengApiKey              String? @map("jimeng_api_key")
  klingApiKey               String? @map("kling_api_key")
  
  // Provider配置
  videoProvider             String  @default("jimeng")
  
  // 路径配置
  ffmpegPath                String  @default("/usr/bin/ffmpeg")
  ffmpegPreset              String  @default("medium")
  videoStoragePath          String  @default("/data/videos")
  tempStoragePath           String  @default("/tmp/video-generation")
  autoCleanTemp             Boolean @default(true)
  
  // 配置JSON
  imageGenConfig            Json?   // 文生图配置
  videoGenConfig            Json?   // 图生视频配置
  defaultGenConfig          Json?   // 默认生成配置
  performanceConfig         Json?   // 性能配置
  
  // 成本控制
  userDailyQuota            Int     @default(5)
  userMonthlyQuota          Int     @default(50)
  monthlyBudget             Float   @default(1000.0)
  costAlertThreshold        Float   @default(800.0)
  costPerImage              Float   @default(0.02)
  costPerVideo              Float   @default(1.5)
  
  // 健康检查
  isActive                  Boolean @default(true)
  lastHealthCheck           DateTime?
  healthStatus              String?
  
  // 审计
  createdAt                 DateTime @default(now())
  updatedAt                 DateTime @updatedAt
  updatedBy                 String?
}
```

### UserVideoQuota 表

```typescript
model UserVideoQuota {
  id             String   @id @default(cuid())
  userId         String   @unique
  
  dailyUsed      Int      @default(0)
  dailyLimit     Int      @default(5)
  dailyResetAt   DateTime
  
  monthlyUsed    Int      @default(0)
  monthlyLimit   Int      @default(50)
  monthlyResetAt DateTime
  
  totalGenerated Int      @default(0)
  totalCost      Float    @default(0.0)
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

---

## 🔐 安全说明

### API密钥加密

所有API密钥使用 **AES-256-CBC** 加密：
- 加密密钥来自环境变量 `AI_CONFIG_ENCRYPTION_KEY`
- 密钥必须为32字节
- 前端永远不会接收到明文密钥

### 权限控制

只有 **ADMIN 角色** 可以：
- 查看视频API配置（密钥已脱敏）
- 修改视频API配置
- 查看成本统计
- 测试Provider连接
- 查看用户配额

---

## 📝 API 接口

### 后端API

```typescript
// 获取配置（密钥脱敏）
GET /api/v1/admin/video-api-config

// 更新配置
PUT /api/v1/admin/video-api-config

// 获取本月统计
GET /api/v1/admin/video-api-config/statistics

// 获取指定时间范围统计
GET /api/v1/admin/video-api-config/statistics/range?startDate=xxx&endDate=xxx

// 测试Provider连接
POST /api/v1/admin/video-api-config/test/:provider

// 查看用户配额
GET /api/v1/admin/video-api-config/quota/:userId
```

### 前端路由

```
/admin/video-api-config - 视频API配置页面
```

---

## 🎬 视频生成流程

### 完整流程

```
用户点击"生成视频"
    ↓
检查用户配额
    ↓
读取管理员配置的API密钥
    ↓
1. 使用火山引擎生成图片（文生图）
    ↓
2. 使用即梦/可灵生成视频（图生视频）
    ↓
3. 使用FFmpeg合成最终视频
    ↓
保存视频文件
    ↓
更新用户配额
    ↓
记录成本统计
    ↓
返回视频URL给用户
```

### 配额检查点

1. **请求前检查**
   - 每日配额是否足够
   - 每月配额是否足够

2. **生成后更新**
   - 增加 `dailyUsed`
   - 增加 `monthlyUsed`
   - 增加 `totalGenerated`
   - 累加 `totalCost`

3. **定时重置**
   - 每日00:00重置 `dailyUsed`
   - 每月1号重置 `monthlyUsed`

---

## ⚠️ 常见问题

### Q: 用户可以自己配置视频生成的API吗？
A: 不可以。视频生成API成本较高，必须由管理员统一配置和管理配额。

### Q: 如何调整用户配额？
A: 在套餐管理中配置不同套餐的视频生成配额，或者直接修改 `VideoAPIConfig` 中的 `userDailyQuota` 和 `userMonthlyQuota`。

### Q: 支持哪些视频Provider？
A: 目前支持：
- 火山引擎（文生图）
- 即梦（图生视频）
- 可灵（图生视频）

### Q: 如何切换视频Provider？
A: 在配置页面的"系统配置"标签中，修改 `videoProvider` 字段。

### Q: 视频存储在哪里？
A: 存储路径由 `videoStoragePath` 配置决定，默认为 `/data/videos`。

### Q: 如何控制成本？
A: 通过以下方式：
1. 设置用户每日/每月配额
2. 配置月度预算和警告阈值
3. 调整单次生成的成本参数
4. 监控成本统计数据

---

## 📖 相关文档

- [AI调用开发指南](./AI-CALLER-GUIDE.md)
- [视频生成技术文档](./MATERIAL-AI-INTEGRATION.md)
- [套餐功能配置](../apps/admin-service/src/modules/packages/)

---

**重要提醒：**
- ✅ 视频生成功能已经完整实现
- ✅ 管理员配置页面已添加到侧边栏菜单
- ✅ 用户无需任何配置即可使用
- ✅ 所有API密钥统一管理，安全加密存储

