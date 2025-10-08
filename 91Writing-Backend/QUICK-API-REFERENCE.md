# 🚀 API 开发快速参考卡

## 一句话总结
**所有前端请求必须通过 API Gateway (3000端口)，不得直接访问微服务！**

---

## 📍 URL 规则

### ✅ 正确
```javascript
// 前端
const baseURL = 'http://localhost:3000'  // API Gateway
const url = baseURL + '/api/v1/admin/analytics/overview'
// → http://localhost:3000/api/v1/admin/analytics/overview
```

### ❌ 错误
```javascript
// 前端
const url = 'http://localhost:3006/api/v1/admin/analytics/overview'
// ❌ 直接访问微服务会导致404！
```

---

## 🏗️ Controller 路由规则

### ✅ 正确（微服务）
```typescript
@Controller('analytics')  // 不包含 /api/v1
export class AnalyticsController {
  @Get('overview')  // 路由: /analytics/overview
  async getOverview() {}
}
```

### ❌ 错误（微服务）
```typescript
@Controller('api/v1/analytics')  // ❌ 不要加前缀！
export class AnalyticsController {}
```

---

## 🔄 请求流程

```
前端
 ↓ /api/v1/admin/analytics/overview
API Gateway (3000)
 ↓ 移除 /api/v1/admin
 ↓ /analytics/overview  
admin-service (3006)
 ↓ @Controller('analytics') + @Get('overview')
 ✅ 匹配成功
```

---

## 📝 开发新API的5个步骤

### 1️⃣ 创建DTO
```typescript
export class QueryDto {
  @IsOptional()
  @IsString()
  keyword?: string;
}
```

### 2️⃣ 创建Controller (微服务)
```typescript
@Controller('analytics')  // ← 业务路径，不含/api/v1
export class AnalyticsController {
  @Get('overview')
  @UseGuards(JwtAuthGuard)
  async getOverview(@Query() query: QueryDto) {
    return this.service.getData(query);
  }
}
```

### 3️⃣ 注册模块
```typescript
@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
```

### 4️⃣ 前端调用
```javascript
// src/services/apiManager.js
async getAnalyticsOverview(params) {
  return await this.request('/api/v1/admin/analytics/overview', {
    method: 'GET',
    params
  })
}
```

### 5️⃣ Vue组件使用
```vue
<script setup>
const data = await apiManager.getAnalyticsOverview({ keyword: 'test' })
</script>
```

---

## 🐛 常见错误速查

| 错误现象 | 原因 | 解决方案 |
|---------|------|---------|
| 404 Not Found | 前端直接访问微服务 | 改为通过API Gateway (3000端口) |
| 404 Not Found | 微服务路由包含/api/v1 | 移除Controller中的前缀 |
| CORS错误 | 直接访问微服务 | 通过API Gateway访问 |
| 401 Unauthorized | Token未正确传递 | 检查拦截器配置 |

---

## 🔍 快速排查

### 1. 检查前端URL
```javascript
// ✅ 正确
console.log(url) // http://localhost:3000/api/v1/...

// ❌ 错误
console.log(url) // http://localhost:3006/api/v1/...
```

### 2. 检查后端路由
```typescript
// ✅ 正确
@Controller('analytics')

// ❌ 错误
@Controller('api/v1/analytics')
@Controller('/api/v1/analytics')
```

### 3. 检查日志
```
✅ [API Gateway] 代理请求: GET http://localhost:3006/analytics/overview
❌ [admin-service] 404: Cannot GET /api/v1/admin/analytics/overview
```

---

## 📊 端口分配表

| 服务 | 端口 | 访问方式 |
|-----|------|---------|
| API Gateway | 3000 | ✅ 前端访问这个 |
| user-service | 3001 | ❌ 不直接访问 |
| auth-service | 3002 | ❌ 不直接访问 |
| novel-service | 3003 | ❌ 不直接访问 |
| ai-service | 3004 | ❌ 不直接访问 |
| payment-service | 3005 | ❌ 不直接访问 |
| admin-service | 3006 | ❌ 不直接访问 |

---

## 🎯 记住这三条

1. **前端只访问 3000 端口** (API Gateway)
2. **微服务路由不含 /api/v1 前缀**
3. **遇到404先检查URL是否访问了3000端口**

---

## 🔗 详细文档

- 📖 完整开发指南: [API-DEVELOPMENT-GUIDE.md](./API-DEVELOPMENT-GUIDE.md)
- 🔧 404错误修复: [404-ERROR-FIX-SUMMARY.md](./404-ERROR-FIX-SUMMARY.md)
- 🏗️ 架构说明: [MICROSERVICES-CONFIG.md](./MICROSERVICES-CONFIG.md)

---

**保存此文档，每次开发新API时参考！** 🌟
