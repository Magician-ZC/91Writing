# 批量视频生成API路由说明

## 🌐 路由架构

91Writing使用微服务架构，API Gateway自动代理所有请求到相应的服务。

```
用户请求 → API Gateway (3000) → AI Service (3004)
                                    ↓
                              批量视频生成控制器
```

---

## 📍 完整路由路径

### 基础路径

- **API Gateway Base URL**: `http://localhost:3000`
- **AI Service Base URL**: `http://localhost:3004`
- **视频生成模块路径**: `/video-generation`
- **批量生成模块路径**: `/video-generation/batch`

### 完整URL示例

通过API Gateway访问（推荐）：
```
POST http://localhost:3000/ai/video-generation/batch/generate-by-chapters
POST http://localhost:3000/ai/video-generation/batch/smart-generate
GET  http://localhost:3000/ai/video-generation/batch/status/:batchId
POST http://localhost:3000/ai/video-generation/batch/cancel/:batchId
POST http://localhost:3000/ai/video-generation/batch/merge/:batchId
GET  http://localhost:3000/ai/video-generation/batch/merge/status/:batchId
```

直接访问AI Service（开发调试）：
```
POST http://localhost:3004/video-generation/batch/generate-by-chapters
POST http://localhost:3004/video-generation/batch/smart-generate
GET  http://localhost:3004/video-generation/batch/status/:batchId
POST http://localhost:3004/video-generation/batch/cancel/:batchId
POST http://localhost:3004/video-generation/batch/merge/:batchId
GET  http://localhost:3004/video-generation/batch/merge/status/:batchId
```

---

## 📋 路由清单

### 1. 批量生成（手动选择）

**路由**：`POST /ai/video-generation/batch/generate-by-chapters`

**功能**：批量生成用户选择的多个章节的视频

**请求示例**：
```bash
curl -X POST http://localhost:3000/ai/video-generation/batch/generate-by-chapters \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "novelId": "novel-123",
    "chapterIds": ["ch-1", "ch-2", "ch-3"],
    "options": {
      "parallelTasks": 2,
      "mergeIntoOne": true,
      "videoSettings": {
        "sceneCount": 5,
        "videoDuration": 15
      }
    }
  }'
```

---

### 2. AI智能规划生成

**路由**：`POST /ai/video-generation/batch/smart-generate`

**功能**：AI自动计算需要多少章节才能达到目标时长

**请求示例**：
```bash
curl -X POST http://localhost:3000/ai/video-generation/batch/smart-generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "novelId": "novel-123",
    "startChapter": 1,
    "targetDuration": 600,
    "options": {
      "maxChapters": 10,
      "autoMerge": true
    }
  }'
```

---

### 3. 查询批量生成状态

**路由**：`GET /ai/video-generation/batch/status/:batchId`

**功能**：查询批量任务的执行状态和进度

**请求示例**：
```bash
curl http://localhost:3000/ai/video-generation/batch/status/batch-xxx \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 4. 取消批量生成

**路由**：`POST /ai/video-generation/batch/cancel/:batchId`

**功能**：取消正在执行的批量任务

**请求示例**：
```bash
curl -X POST http://localhost:3000/ai/video-generation/batch/cancel/batch-xxx \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 5. 合并为长视频

**路由**：`POST /ai/video-generation/batch/merge/:batchId`

**功能**：将多个章节视频合并为一个长视频

**请求示例**：
```bash
curl -X POST http://localhost:3000/ai/video-generation/batch/merge/batch-xxx \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "options": {
      "addChapterTitles": true,
      "addOpening": true,
      "addEnding": true,
      "titleDuration": 2,
      "transitionDuration": 0.3,
      "quality": "medium"
    }
  }'
```

---

### 6. 查询合并状态

**路由**：`GET /ai/video-generation/batch/merge/status/:batchId`

**功能**：查询长视频合成的状态

**请求示例**：
```bash
curl http://localhost:3000/ai/video-generation/batch/merge/status/batch-xxx \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔧 路由配置说明

### AI Service中的路由结构

```typescript
// video-generation.module.ts
@Module({
  controllers: [
    VideoGenerationController,        // 处理 /video-generation/*
    BatchVideoGenerationController,   // 处理 /video-generation/batch/*
  ],
  ...
})

// batch-video-generation.controller.ts
@Controller('batch')                  // 相对路径 'batch'
export class BatchVideoGenerationController {
  
  @Post('generate-by-chapters')       // 完整路径: /video-generation/batch/generate-by-chapters
  async batchGenerateByChapters(...) { ... }
  
  @Post('smart-generate')             // 完整路径: /video-generation/batch/smart-generate
  async smartGenerate(...) { ... }
}
```

### API Gateway中的路由映射

```typescript
// API Gateway自动代理
/ai/*  →  转发到 AI Service

// 示例映射：
/ai/video-generation/batch/smart-generate 
  → http://localhost:3004/video-generation/batch/smart-generate
```

---

## 🧪 测试路由

### Postman集合

创建Postman集合包含以下请求：

**Collection: 91Writing - 批量视频生成**

1. **批量生成-手动选择**
   - POST `/ai/video-generation/batch/generate-by-chapters`
   - Headers: `Authorization: Bearer {{token}}`
   - Body: 见上述示例

2. **批量生成-AI智能**
   - POST `/ai/video-generation/batch/smart-generate`
   - Headers: `Authorization: Bearer {{token}}`
   - Body: 见上述示例

3. **查询状态**
   - GET `/ai/video-generation/batch/status/{{batchId}}`
   - Headers: `Authorization: Bearer {{token}}`

4. **合并视频**
   - POST `/ai/video-generation/batch/merge/{{batchId}}`
   - Headers: `Authorization: Bearer {{token}}`
   - Body: 见上述示例

5. **查询合并状态**
   - GET `/ai/video-generation/batch/merge/status/{{batchId}}`
   - Headers: `Authorization: Bearer {{token}}`

### cURL测试脚本

```bash
#!/bin/bash

# 配置
API_URL="http://localhost:3000"
TOKEN="your_jwt_token_here"
NOVEL_ID="your_novel_id"

# 1. AI智能生成10分钟视频
echo "提交AI智能生成任务..."
BATCH_RESPONSE=$(curl -s -X POST "$API_URL/ai/video-generation/batch/smart-generate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"novelId\": \"$NOVEL_ID\",
    \"startChapter\": 1,
    \"targetDuration\": 600,
    \"options\": {
      \"maxChapters\": 10,
      \"autoMerge\": true
    }
  }")

echo "$BATCH_RESPONSE" | jq '.'

# 提取batchId
BATCH_ID=$(echo "$BATCH_RESPONSE" | jq -r '.batchId')
echo "批次ID: $BATCH_ID"

# 2. 轮询查询状态
echo "等待视频生成..."
while true; do
  STATUS=$(curl -s "$API_URL/ai/video-generation/batch/status/$BATCH_ID" \
    -H "Authorization: Bearer $TOKEN")
  
  PROGRESS=$(echo "$STATUS" | jq -r '.progress')
  STATUS_VALUE=$(echo "$STATUS" | jq -r '.status')
  
  echo "进度: $PROGRESS% - 状态: $STATUS_VALUE"
  
  if [ "$STATUS_VALUE" = "COMPLETED" ]; then
    echo "✅ 视频生成完成！"
    echo "$STATUS" | jq '.'
    break
  elif [ "$STATUS_VALUE" = "FAILED" ]; then
    echo "❌ 视频生成失败！"
    break
  fi
  
  sleep 10
done
```

---

## 🔑 认证说明

所有批量视频生成接口都需要JWT认证：

```typescript
// 请求头必须包含
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// JWT Token包含的信息
{
  "userId": "user-id",
  "email": "user@example.com",
  // ...
}
```

---

## 📊 Swagger文档

服务启动后，可以通过以下地址查看完整的API文档：

- **API Gateway Swagger**: `http://localhost:3000/api-docs`
- **AI Service Swagger**: `http://localhost:3004/api-docs`

批量视频生成的接口会自动出现在"批量视频生成"标签下。

---

## 🚦 路由状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未认证（缺少或无效的Token） |
| 403 | 无权限或配额不足 |
| 404 | 资源不存在（小说或章节） |
| 409 | 冲突（如重复提交） |
| 500 | 服务器错误 |

---

## 🎯 路由总结

所有批量视频生成的路由都已自动配置完成：

✅ **API Gateway** → 自动代理 `/ai/*` 到AI Service
✅ **AI Service** → BatchVideoGenerationController处理 `/video-generation/batch/*`
✅ **认证** → JwtAuthGuard自动验证
✅ **权限** → PackageFeatureGuard自动检查套餐权限
✅ **文档** → Swagger自动生成

**无需手动配置路由！** 只要服务启动，路由就会自动生效。

---

## 📝 相关文档

- [批量视频生成使用指南](./BATCH-VIDEO-GENERATION-GUIDE.md)
- [部署指南](./BATCH-VIDEO-DEPLOYMENT.md)
- [实施总结](./BATCH-VIDEO-IMPLEMENTATION-SUMMARY.md)

