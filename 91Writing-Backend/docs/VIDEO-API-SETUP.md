# 视频API配置完整指南

## 🎯 问题分析

### 原始问题
1. ❌ 管理员后台**看不到**视频API配置入口
2. ❌ 点击配置页面后报错：`apiManager.get is not a function`

### 根本原因
1. 侧边栏菜单缺少"视频API配置"菜单项
2. `apiManager` 缺少便捷方法（get、post、put等）

---

## ✅ 已完成的修复

### 1. 添加侧边栏菜单项

**文件：** `src/views/admin/AdminLayout.vue`

```vue
<el-menu-item index="/admin/video-api-config">
  <el-icon><VideoCamera /></el-icon>
  <template #title>视频API配置</template>
</el-menu-item>
```

**位置：** 数据分析和系统设置之间

### 2. 添加 apiManager 便捷方法

**文件：** `src/services/apiManager.js`

```javascript
// 新增5个便捷方法
async get(endpoint, params = null) { ... }
async post(endpoint, data = null) { ... }
async put(endpoint, data = null) { ... }
async patch(endpoint, data = null) { ... }
async delete(endpoint) { ... }
```

---

## 🚀 现在可以使用了！

### 访问配置页面

1. 登录管理员后台：
   ```
   http://localhost:8080/admin/login
   ```

2. 在侧边栏找到：
   ```
   📹 视频API配置
   ```

3. 配置内容包括：

#### Tab 1: API密钥配置
- **🔥 火山引擎**（文生图Provider）
  - Access Key ID
  - Secret Access Key
  - 测试连接按钮

- **🎥 即梦**（图生视频Provider - 推荐）
  - API Key
  - 测试连接按钮

- **🎬 可灵**（图生视频Provider - 备选）
  - API Key
  - 测试连接按钮

#### Tab 2: 文生图配置
```json
{
  "defaultResolution": "1024x576",    // 默认分辨率
  "quality": "standard",              // 图片质量
  "batchSize": 1,                     // 批次大小
  "samplingSteps": 30,                // 采样步数
  "cfgScale": 7.5,                    // CFG Scale
  "defaultStyle": "realistic",        // 默认风格
  "globalNegativePrompt": "...",      // 全局负面提示词
  "enableConsistency": true,          // 启用一致性
  "timeout": 60                       // 超时时间（秒）
}
```

#### Tab 3: 图生视频配置
```json
{
  "defaultDuration": 5,               // 默认时长
  "resolution": "1024x576",           // 分辨率
  "fps": 30,                          // 帧率
  "defaultMotionIntensity": "medium", // 动作强度
  "quality": "high",                  // 视频质量
  "compressionLevel": "medium",       // 压缩级别
  "transitionEffect": "fade",         // 转场效果
  "transitionDuration": 0.5,          // 转场时长
  "timeout": 120,                     // 超时时间
  "maxRetries": 2,                    // 最大重试次数
  "enableCharacterConsistency": true  // 启用角色一致性
}
```

#### Tab 4: 用户默认配置
```json
{
  "defaultSceneCount": 5,             // 默认场景数
  "minSceneWords": 100,               // 最小场景字数
  "defaultTotalDuration": 30,         // 默认总时长
  "addTitleFrame": true,              // 添加标题帧
  "titleFrameDuration": 2             // 标题帧时长
}
```

#### Tab 5: 系统配置
- **Provider选择**：jimeng / kling
- **FFmpeg配置**
  - FFmpeg路径
  - 编码预设
  - 视频存储路径
  - 临时文件路径
  - 自动清理临时文件

- **成本控制**
  - 用户每日配额：5次
  - 用户每月配额：50次
  - 月度预算：1000元
  - 成本警告阈值：800元
  - 单张图片成本：0.02元
  - 单个视频成本：1.5元

- **性能配置**
  ```json
  {
    "maxConcurrentTasks": 3,
    "imageGenConcurrency": 2,
    "videoGenConcurrency": 1,
    "enableCache": false,
    "enableQueue": true
  }
  ```

#### Tab 6: 成本监控
- 本月总成本
- 图片生成数量
- 视频生成数量
- 预算使用百分比
- 成本趋势图

#### Tab 7: 用户配额查询
- 输入用户ID
- 查看该用户的：
  - 每日已用/限额
  - 每月已用/限额
  - 总生成次数
  - 总成本

---

## 🔧 后端API支持

所有API接口已经实现：

```typescript
// 获取配置（密钥已脱敏）
GET /api/v1/admin/video-api-config

// 更新配置
PUT /api/v1/admin/video-api-config

// 获取本月统计
GET /api/v1/admin/video-api-config/statistics

// 获取指定时间范围统计
GET /api/v1/admin/video-api-config/statistics/range?startDate=xxx&endDate=xxx

// 测试Provider连接
POST /api/v1/admin/video-api-config/test/:provider
  // provider: volcengine | jimeng | kling

// 查看用户配额
GET /api/v1/admin/video-api-config/quota/:userId
```

---

## 👥 用户使用流程

### 管理员配置后，用户无需任何设置：

1. ✅ 用户打开章节编辑器
2. ✅ 点击"生成视频"按钮
3. ✅ 选择生成参数（可选）
4. ✅ 系统自动使用管理员配置的API
5. ✅ 生成完成，视频自动保存

### 配额自动管理

- ✅ 生成前检查配额
- ✅ 生成后扣除配额
- ✅ 每日00:00自动重置每日配额
- ✅ 每月1号自动重置每月配额
- ✅ 套餐不同，配额不同

---

## 🔐 安全性

### API密钥加密
- ✅ 所有密钥使用 **AES-256-CBC** 加密存储
- ✅ 加密密钥来自环境变量：`AI_CONFIG_ENCRYPTION_KEY`
- ✅ 前端永远不会接收到明文密钥
- ✅ 配置显示时，密钥已脱敏（显示为 `***...***`）

### 权限控制
- ✅ 只有 **ADMIN** 角色可以访问配置页面
- ✅ 所有API都需要管理员权限验证
- ✅ 配置修改会记录操作日志

---

## 📊 架构对比

### AI对话/内容生成
```
用户 → 选择自己的AI配置 → 调用 → 使用用户配置的API
```
**优点：** 用户可以使用自己的API Key，灵活控制

### 视频生成
```
用户 → 点击生成视频 → 调用 → 使用管理员配置的API
```
**优点：** 
- 用户无需配置，降低使用门槛
- 管理员统一管理，控制成本
- 便于配额分配和成本核算

---

## 🎬 视频生成技术栈

```
章节文本
    ↓
1. AI提取分镜脚本（StoryboardAgent）
    ↓
2. 优化文生图提示词（ImageGenerationAgent）
    ↓
3. 调用火山引擎生成图片
    ↓
4. 优化图生视频提示词（VideoGenerationAgent）
    ↓
5. 调用即梦/可灵生成视频片段
    ↓
6. 使用FFmpeg合成最终视频
    ↓
7. 保存并返回视频URL
```

---

## 📝 配置步骤（首次使用）

### Step 1: 获取API密钥

#### 火山引擎（文生图）
1. 访问：https://console.volcengine.com/
2. 开通"视觉智能"服务
3. 创建访问密钥
4. 复制 Access Key ID 和 Secret Access Key

#### 即梦（图生视频）
1. 访问：https://jimeng.jianying.com/
2. 注册账号并实名认证
3. 获取API Key
4. 充值账户余额

#### 可灵（备选）
1. 访问可灵AI官网
2. 注册开发者账号
3. 获取API Key

### Step 2: 配置环境变量

确保 `.env` 文件中有：
```env
# API密钥加密密钥（32字节）
AI_CONFIG_ENCRYPTION_KEY=91writing-ai-encryption-key-32c
```

### Step 3: 管理员后台配置

1. 登录管理员后台
2. 点击侧边栏"📹 视频API配置"
3. 输入API密钥
4. 点击"测试连接"验证
5. 配置生成参数
6. 保存配置

### Step 4: 测试

1. 以普通用户登录
2. 创建小说和章节
3. 在章节编辑器中点击"生成视频"
4. 等待生成完成
5. 查看配额消耗情况

---

## 🔍 排查问题

### 如果前端报错

#### 1. `apiManager.get is not a function`
✅ 已修复：添加了 get、post、put 等便捷方法

#### 2. `401 Unauthorized`
- 检查是否以管理员身份登录
- 检查token是否过期

#### 3. `404 Not Found`
- 检查后端服务是否启动
- 检查API路由是否正确注册

### 如果后端报错

#### 1. 数据库连接失败
```bash
# 检查 MySQL 是否运行
netstat -ano | findstr "3306"
```

#### 2. API调用失败
- 检查API密钥是否正确
- 检查网络连接
- 查看后端日志

#### 3. 加密密钥警告
```bash
# 确保 .env 中的密钥正好32字节
AI_CONFIG_ENCRYPTION_KEY=91writing-ai-encryption-key-32c
```

---

## 📈 监控和维护

### 查看成本统计

在"成本监控"标签页可以看到：
- 📊 本月总成本
- 📊 图片/视频生成数量
- 📊 预算使用百分比
- 📊 成本趋势图

### 设置预算警告

当成本达到警告阈值时：
- ⚠️ 管理员会收到通知
- ⚠️ 可以考虑调整用户配额
- ⚠️ 或者增加月度预算

### 用户配额管理

在"用户配额查询"中：
- 🔍 输入用户ID
- 📊 查看详细使用情况
- ⚙️ 可以在套餐管理中调整配额策略

---

## 🎁 功能特性

### 管理员视角
- ✅ 统一配置所有视频生成API
- ✅ 实时成本监控
- ✅ 灵活的配额管理
- ✅ 连接测试功能
- ✅ 详细的使用统计

### 用户视角
- ✅ 零配置，开箱即用
- ✅ 一键生成视频
- ✅ 实时查看生成进度
- ✅ 自动配额管理
- ✅ 清晰的配额提示

---

## 📦 相关文件

### 后端
- `apps/admin-service/src/modules/video-api-config/`
  - `video-api-config.controller.ts` - API控制器
  - `video-api-config.service.ts` - 业务逻辑
  - `dto/` - 数据传输对象

- `libs/video-config/` - 共享库
  - `video-api-config.service.ts` - 核心服务
  - `video-api-config.module.ts` - 模块定义

### 前端
- `src/views/admin/settings/VideoGenerationConfig.vue` - 配置页面
- `src/services/apiManager.js` - API客户端
- `src/router/index.js` - 路由配置

### 数据库
- `prisma/schema.prisma`
  - `VideoAPIConfig` - 配置表
  - `UserVideoQuota` - 用户配额表
  - `VideoAPIUsageLog` - 使用日志表

---

## 🎓 总结

### 修复前
```
管理员后台侧边栏
├─ 仪表盘
├─ 用户管理
├─ 订阅管理
├─ 订单管理
├─ 套餐管理
├─ 数据分析
└─ 系统设置
    ❌ 没有视频API配置入口
```

### 修复后
```
管理员后台侧边栏
├─ 仪表盘
├─ 用户管理
├─ 订阅管理
├─ 订单管理
├─ 套餐管理
├─ 数据分析
├─ 📹 视频API配置  ← ✅ 新增
└─ 系统设置
```

### API Manager 修复
```javascript
// 修复前
apiManager.get(...)  // ❌ 不存在
apiManager.post(...) // ❌ 不存在

// 修复后
apiManager.get(...)  // ✅ 可用
apiManager.post(...) // ✅ 可用
apiManager.put(...)  // ✅ 可用
apiManager.patch(...) // ✅ 可用
apiManager.delete(...) // ✅ 可用
```

---

## 💡 重要提示

1. **API密钥安全**
   - 所有密钥加密存储
   - 前端只能看到脱敏版本
   - 不要在代码中硬编码密钥

2. **成本控制**
   - 定期查看成本统计
   - 根据实际情况调整配额
   - 设置合理的预算警告阈值

3. **用户体验**
   - 用户完全无感知配置过程
   - 一键生成视频
   - 清晰的配额提示

4. **扩展性**
   - 可以轻松添加新的视频Provider
   - 可以调整各种生成参数
   - 可以根据套餐设置不同配额

---

**🎉 现在视频生成功能已完全可用！**

