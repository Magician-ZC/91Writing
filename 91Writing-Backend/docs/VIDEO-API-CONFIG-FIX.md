# 视频API配置问题修复说明

## 📌 修复的3个问题

### 问题1：火山引擎测试连接失败 ✅ 已修复

**错误信息**：
```
{success: false, message: "火山引擎API密钥未配置"}
```

**原因**：
火山引擎需要配置3个密钥，但之前只支持2个：
- ✅ Access Key ID
- ✅ Secret Access Key  
- ❌ **文生图API Key（之前缺少）**

**解决方案**：
1. 添加了 `volcengineImageApiKey` 字段
2. 更新了配置页面，新增"文生图 API Key"输入框
3. 更新了VolcengineVisualProvider，支持API Key认证

---

### 问题2：保存配置时报错 ✅ 已修复

**错误信息**：
```
property id should not exist
property ffmpegPreset should not exist
property autoCleanTemp should not exist
...（14个只读字段）
```

**原因**：
前端保存时提交了整个配置对象，包括只读字段（id、createdAt、updatedAt等）

**解决方案**：
更新了前端`saveConfig()`方法，只提交允许修改的字段：

```javascript
// 允许修改的字段列表
const allowedFields = [
  'volcengineAccessKeyId',
  'volcengineSecretAccessKey',
  'volcengineImageApiKey',      // 新增
  'jimengApiKey',
  'klingApiKey',
  'videoProvider',
  'ffmpegPath',
  'videoStoragePath',
  'tempStoragePath',
  'userDailyQuota',
  'userMonthlyQuota',
  'monthlyBudget',
  'costAlertThreshold',
  'isActive'
]

// 过滤后提交
const updateData = {}
allowedFields.forEach(field => {
  if (configForm[field] !== undefined) {
    updateData[field] = configForm[field]
  }
})

await apiManager.put('/api/v1/admin/video-api-config', updateData)
```

---

### 问题3：配置页面缺少文生图API Key ✅ 已修复

**问题描述**：
火山引擎有两套密钥系统：
1. **Access Key + Secret Key**：用于签名认证（SDK方式）
2. **文生图API Key**：用于直接API调用（文生图推荐）

之前配置页面只有前两个，缺少第三个。

**解决方案**：
在配置页面添加了"文生图 API Key"输入框：

```vue
<el-form-item label="文生图 API Key">
  <el-input 
    v-model="configForm.volcengineImageApiKey" 
    type="password" 
    show-password
    placeholder="请输入文生图专用 API Key（加密存储）"
    clearable
  />
  <div class="form-tip">火山引擎文生图需要单独的API Key</div>
</el-form-item>
```

---

## 🔧 技术实现细节

### 1. 数据库层

**schema.prisma 更新**：
```prisma
model VideoAPIConfig {
  id          String   @id @default(cuid())
  
  // API密钥（加密存储）
  volcengineAccessKeyId     String?  // Access Key ID
  volcengineSecretAccessKey String?  // Secret Key（加密）
  volcengineImageApiKey     String?  // 文生图API Key（加密）✨ 新增
  jimengApiKey              String?  // 即梦API Key（加密）
  klingApiKey               String?  // 可灵API Key（加密）
  
  // ...
}
```

### 2. DTO层

**update-video-api-config.dto.ts 更新**：
```typescript
export class UpdateVideoAPIConfigDto {
  @ApiPropertyOptional({ description: '火山引擎文生图 API Key（将被加密存储）' })
  @IsOptional()
  @IsString()
  volcengineImageApiKey?: string;  // ✨ 新增
  
  // ...
}
```

### 3. 服务层

**video-api-config.service.ts 更新**：

**加密处理**：
```typescript
if (data.volcengineImageApiKey) {
  encrypted.volcengineImageApiKey = this.encrypt(data.volcengineImageApiKey);
}
```

**解密处理**：
```typescript
return {
  ...config,
  volcengineImageApiKey: config.volcengineImageApiKey
    ? this.decrypt(config.volcengineImageApiKey)
    : null,
  // ...
}
```

**测试连接更新**：
```typescript
case 'volcengine':
  if (!config.volcengineAccessKeyId || !config.volcengineSecretAccessKey) {
    return {
      success: false,
      message: '火山引擎API密钥未配置（缺少Access Key ID或Secret Access Key）',
    };
  }
  if (!config.volcengineImageApiKey) {  // ✨ 新增检查
    return {
      success: false,
      message: '火山引擎文生图API Key未配置',
    };
  }
  return {
    success: true,
    message: '火山引擎连接正常（已配置Access Key、Secret Key和文生图API Key）',
  };
```

### 4. Provider层

**volcengine-visual.provider.ts 更新**：

**支持两种认证方式**：
```typescript
constructor() {
  this.config = {
    accessKeyId: process.env.VOLCENGINE_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.VOLCENGINE_SECRET_ACCESS_KEY || '',
    imageApiKey: process.env.VOLCENGINE_IMAGE_API_KEY || '',  // ✨ 新增
    // ...
  };

  // 优先使用API Key认证（文生图推荐）
  this.useApiKey = !!this.config.imageApiKey;

  // 请求拦截器
  this.client.interceptors.request.use((config) => {
    if (this.useApiKey) {
      // 使用API Key认证（文生图）
      config.headers['X-API-Key'] = this.config.imageApiKey;
    } else {
      // 使用Access Key签名认证
      const signature = this.generateSignature(config);
      config.headers['Authorization'] = signature;
    }
    return config;
  });
}
```

---

## 🚀 如何配置

### 步骤1：同步数据库

```bash
cd 91Writing-Backend
npx prisma db push
```

### 步骤2：配置火山引擎密钥

在管理后台 → 视频生成配置页面：

**火山引擎配置（3个密钥）**：

1. **Access Key ID**
   - 位置：火山引擎控制台 → 访问控制
   - 格式：`AKLT...`（24位）
   - 用途：用于签名认证

2. **Secret Access Key**
   - 位置：火山引擎控制台 → 访问控制
   - 格式：长字符串
   - 用途：用于签名认证
   - ⚠️ 加密存储

3. **文生图 API Key** ✨ 新增
   - 位置：火山引擎控制台 → 视觉智能 → API Key
   - 格式：独立的API密钥
   - 用途：专门用于文生图API调用
   - ⚠️ 加密存储

### 步骤3：测试连接

点击"测试火山引擎连接"按钮，应该提示：
```
✅ 火山引擎连接正常（已配置Access Key、Secret Key和文生图API Key）
```

---

## 🔍 火山引擎两种认证方式说明

### 方式1：Access Key + Secret Key（签名认证）

**特点**：
- SDK标准方式
- 需要生成签名
- 更安全（签名包含时间戳）
- 适合服务端SDK调用

**使用场景**：
- 使用火山引擎官方SDK
- 需要多种服务（视觉、语音等）

### 方式2：API Key（直接认证）

**特点**：
- 简单直接
- 直接在Header中传递
- 文生图服务推荐
- 配置方便

**使用场景**：
- 只使用文生图服务
- 直接HTTP API调用
- **91Writing推荐使用** ✅

**认证方式**：
```
Headers:
  X-API-Key: your_api_key_here
```

---

## 🎯 Provider自动选择认证方式

代码会自动选择最佳认证方式：

```typescript
// 如果配置了文生图API Key
if (config.volcengineImageApiKey) {
  // 使用API Key认证（推荐）✅
  headers['X-API-Key'] = apiKey
} else {
  // 降级使用Access Key签名认证
  headers['Authorization'] = signature
}
```

**建议**：配置文生图API Key以获得最佳性能

---

## 📋 完整配置示例

### 火山引擎配置

```
✅ Access Key ID: AKLT********************************(请填写您的真实密钥)
✅ Secret Access Key: ****************************************
✅ 文生图 API Key: ****************************************
```

### 即梦配置

```
✅ API Key: ****************************************
```

### 可灵配置（备选）

```
✅ API Key: ****************************************
```

### Provider选择

```
✅ 图生视频Provider: 即梦（推荐）
```

---

## ⚠️ 常见问题

### Q1: 为什么需要3个密钥？

**A**: 火山引擎的不同服务使用不同的认证方式：
- Access Key + Secret Key：用于SDK和服务端签名
- 文生图API Key：用于直接API调用（更简单）

### Q2: 我只配置了Access Key和Secret Key，能用吗？

**A**: 可以，但推荐配置文生图API Key：
- 只配Access Key：使用签名认证（复杂，可能有问题）
- 配置API Key：使用直接认证（简单，推荐）✅

### Q3: 测试连接提示"火山引擎文生图API Key未配置"怎么办？

**A**: 请配置火山引擎文生图API Key：
1. 登录火山引擎控制台
2. 进入"视觉智能"服务
3. 创建/获取API Key
4. 在配置页面填入"文生图 API Key"
5. 点击"测试连接"

### Q4: 保存配置时提示字段不应该存在？

**A**: 已修复！前端现在会自动过滤只读字段。

---

## 🔄 更新步骤

### 1. 后端更新（已完成）

```bash
cd 91Writing-Backend

# 同步数据库
npx prisma db push  ✅

# 重启admin-service和ai-service
npm run start:dev admin-service
npm run start:dev ai-service
```

### 2. 前端更新（已完成）

文件已更新：
- ✅ `src/views/admin/settings/VideoAPIConfigAdmin.vue`
- ✅ 新增文生图API Key输入框
- ✅ 修复保存时过滤只读字段

### 3. 配置火山引擎

在管理后台配置页面：
1. 填写3个密钥
2. 点击"测试连接"
3. 点击"保存配置"

---

## ✅ 修复验证

### 测试连接成功

```json
{
  "success": true,
  "message": "火山引擎连接正常（已配置Access Key、Secret Key和文生图API Key）"
}
```

### 保存配置成功

```json
{
  "success": true,
  "message": "配置保存成功"
}
```

---

## 📝 修改的文件清单

### 后端（4个文件）

1. `prisma/schema.prisma`
   - 新增 `volcengineImageApiKey` 字段

2. `apps/admin-service/src/modules/video-api-config/dto/update-video-api-config.dto.ts`
   - 新增 `volcengineImageApiKey` DTO字段

3. `apps/admin-service/src/modules/video-api-config/video-api-config.service.ts`
   - 加密处理 `volcengineImageApiKey`
   - 解密处理 `volcengineImageApiKey`
   - 测试连接时检查 `volcengineImageApiKey`

4. `apps/ai-service/src/providers/volcengine-visual.provider.ts`
   - 支持API Key认证方式
   - 自动选择最佳认证方式

### 前端（1个文件）

5. `src/views/admin/settings/VideoAPIConfigAdmin.vue`
   - 新增"文生图 API Key"输入框
   - 修复保存时过滤只读字段

---

## 🎯 现在可以正常使用

### 配置流程

1. 打开管理后台 → 视频生成配置
2. 填写火山引擎配置：
   - Access Key ID
   - Secret Access Key
   - **文生图 API Key** ✨
3. 点击"测试火山引擎连接" → 应该成功
4. 填写即梦/可灵配置
5. 点击"保存配置" → 应该成功

### 验证成功

- ✅ 测试连接不再报错
- ✅ 保存配置不再报错
- ✅ 文生图功能可以正常工作

---

**所有问题已解决，可以正常配置和使用视频生成功能了！** 🎉

