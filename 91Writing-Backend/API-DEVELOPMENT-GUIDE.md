# 91Writing API 开发标准流程指南

## 🎯 核心原则

**所有前端请求必须通过API Gateway，不得直接访问微服务！**

这样可以统一处理：
- ✅ 认证与授权
- ✅ 请求限流
- ✅ 日志记录
- ✅ 错误处理
- ✅ CORS配置

---

## 📋 API开发流程

### 1️⃣ 后端开发 (微服务层)

#### Step 1: 创建 DTO (数据传输对象)

在对应微服务的 `dto` 文件夹中创建：

```typescript
// apps/admin-service/src/modules/analytics/dto/analytics.dto.ts
import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DateRangeDto {
  @ApiProperty({ required: false, description: '开始日期' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, description: '结束日期' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
```

#### Step 2: 在微服务中创建 Controller

```typescript
// apps/admin-service/src/modules/analytics/analytics.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/common/guards';

@ApiTags('Analytics')
@Controller('analytics')  // ⚠️ 注意：这里不需要 /api/v1 前缀
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取概览统计' })
  async getOverview(@Query() query: DateRangeDto) {
    return this.analyticsService.getOverviewStats(
      query.startDate ? new Date(query.startDate) : undefined,
      query.endDate ? new Date(query.endDate) : undefined
    );
  }
}
```

**重要规则：**
- ❌ 不要在微服务的 Controller 中添加 `/api/v1` 前缀
- ❌ 不要在微服务的 `main.ts` 中设置 `app.setGlobalPrefix()`
- ✅ 只设置业务路径，如 `@Controller('analytics')`

#### Step 3: 注册到模块

```typescript
// apps/admin-service/src/modules/analytics/analytics.module.ts
import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
```

#### Step 4: 注册到 AppModule

```typescript
// apps/admin-service/src/app.module.ts
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    // ...其他模块
    AnalyticsModule,  // ← 添加到这里
  ],
})
export class AppModule {}
```

---

### 2️⃣ API Gateway配置

#### Step 1: 确认代理配置

API Gateway 已经配置了通配符代理，会自动转发 `/api/v1/admin/*` 到 admin-service。

检查以下文件是否正确：

```typescript
// apps/api-gateway/src/modules/admin/admin.controller.ts
@Controller('admin')  // 匹配 /api/v1/admin/*
export class AdminController {
  @All('*')  // 代理所有子路径
  async proxyToAdminService(@Req() req: Request, @Res() res: Response) {
    return this.adminService.proxyRequest(req);
  }
}
```

```typescript
// apps/api-gateway/src/modules/admin/admin.service.ts
async proxyRequest(req: Request) {
  let targetPath = url;
  
  // 移除 /api/v1/admin 前缀
  const prefixes = ['/api/v1/admin', '/admin'];
  for (const prefix of prefixes) {
    if (targetPath.startsWith(prefix)) {
      targetPath = targetPath.substring(prefix.length);
      break;
    }
  }
  
  // 转发到 admin-service
  const targetUrl = `${this.adminServiceUrl}${targetPath}`;
  // http://localhost:3006/analytics/overview
}
```

#### Step 2: 环境变量配置

确保 `.env` 文件中有正确的服务地址：

```env
# API Gateway
API_GATEWAY_PORT=3000

# 微服务端口
AUTH_SERVICE_PORT=3002
USER_SERVICE_PORT=3001
NOVEL_SERVICE_PORT=3003
AI_SERVICE_PORT=3004
PAYMENT_SERVICE_PORT=3005
ADMIN_SERVICE_PORT=3006

# 微服务URL（用于API Gateway代理）
AUTH_SERVICE_URL=http://localhost:3002
USER_SERVICE_URL=http://localhost:3001
NOVEL_SERVICE_URL=http://localhost:3003
AI_SERVICE_URL=http://localhost:3004
PAYMENT_SERVICE_URL=http://localhost:3005
ADMIN_SERVICE_URL=http://localhost:3006
```

---

### 3️⃣ 前端开发

#### Step 1: 在 apiManager 中添加方法

```javascript
// src/services/apiManager.js

class ApiManager {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
    // ✅ 始终使用 API Gateway
  }

  // 添加新的API方法
  async getAnalyticsOverview(params = {}) {
    const query = new URLSearchParams(params).toString()
    const endpoint = `/api/v1/admin/analytics/overview${query ? '?' + query : ''}`
    return await this.request(endpoint, {
      method: 'GET',
      fallbackLocal: false
    })
  }
}
```

**重要规则：**
- ✅ 始终使用完整路径：`/api/v1/{service}/{module}/{action}`
- ✅ 所有请求都通过 `this.baseURL` (API Gateway)
- ❌ 不要使用 `this.services.admin` 等直接访问微服务

#### Step 2: 在 Vue 组件中调用

```vue
<script setup>
import { ref, onMounted } from 'vue'
import apiManager from '@/services/apiManager'

const overview = ref(null)

const loadOverview = async () => {
  try {
    const result = await apiManager.getAnalyticsOverview({
      startDate: '2025-01-01',
      endDate: '2025-01-31'
    })
    
    if (result.success) {
      overview.value = result.data
    }
  } catch (error) {
    console.error('加载概览数据失败:', error)
  }
}

onMounted(() => {
  loadOverview()
})
</script>
```

---

## 🔄 请求流程图

```
前端 (Vue)
    ↓ HTTP Request: /api/v1/admin/analytics/overview
API Gateway (3000端口)
    ↓ 匹配路由: /api/v1/admin/*
    ↓ 移除前缀: /api/v1/admin
    ↓ 转发请求: http://localhost:3006/analytics/overview
admin-service (3006端口)
    ↓ 匹配路由: @Controller('analytics') + @Get('overview')
    ↓ 执行业务逻辑
    ↓ 返回响应
API Gateway
    ↓ 转发响应
前端 (Vue)
    ↓ 处理数据
```

---

## 🐛 常见问题与解决方案

### ❌ 问题 1: 404 Not Found

**症状：**
```
Cannot GET /api/v1/admin/analytics/overview
```

**可能原因：**
1. ❌ 前端直接访问了微服务端口
2. ❌ 微服务 Controller 中添加了错误的路由前缀
3. ❌ API Gateway 没有正确配置代理

**解决方案：**
```javascript
// ❌ 错误：直接访问微服务
const url = 'http://localhost:3006/api/v1/admin/analytics/overview'

// ✅ 正确：通过API Gateway
const url = 'http://localhost:3000/api/v1/admin/analytics/overview'
```

### ❌ 问题 2: CORS 错误

**症状：**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**解决方案：**
- 确保前端通过 API Gateway 访问
- 检查 API Gateway 的 CORS 配置

```typescript
// apps/api-gateway/src/main.ts
app.enableCors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
});
```

### ❌ 问题 3: 认证失败

**症状：**
```
401 Unauthorized
```

**检查清单：**
1. ✅ Token 是否正确设置在 Authorization header
2. ✅ 微服务是否配置了 JWT 策略
3. ✅ JWT Secret 是否一致

---

## 📝 新API开发检查清单

开发新API时，按此清单检查：

### 后端
- [ ] 创建了 DTO 并添加验证装饰器
- [ ] Controller 路由不包含 `/api/v1` 前缀
- [ ] 微服务 main.ts 没有设置 globalPrefix
- [ ] 添加了适当的守卫 (JwtAuthGuard, AdminAuthGuard等)
- [ ] 模块已注册到 AppModule
- [ ] 添加了 Swagger 文档注解

### API Gateway
- [ ] 确认代理规则已配置
- [ ] 环境变量中有正确的服务URL
- [ ] CORS 配置包含前端域名

### 前端
- [ ] API 方法使用完整路径 `/api/v1/{service}/...`
- [ ] 使用 `this.baseURL` 而不是直接访问微服务
- [ ] 添加了错误处理
- [ ] 添加了 loading 状态

---

## 🚀 测试方法

### 1. 直接测试微服务（仅用于开发调试）

```bash
curl -X GET http://localhost:3006/analytics/overview \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. 通过API Gateway测试（生产方式）

```bash
curl -X GET http://localhost:3000/api/v1/admin/analytics/overview \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. 前端测试

在浏览器控制台：
```javascript
apiManager.getAnalyticsOverview({ startDate: '2025-01-01' })
  .then(console.log)
  .catch(console.error)
```

---

## 📚 路由映射参考

| 前端请求路径 | API Gateway | 转发到微服务 | 微服务Controller |
|-------------|-------------|-------------|-----------------|
| `/api/v1/auth/login` | ✅ 匹配 `/auth/*` | `http://localhost:3002/login` | `@Controller()` |
| `/api/v1/admin/users` | ✅ 匹配 `/admin/*` | `http://localhost:3006/users` | `@Controller('admin')` |
| `/api/v1/admin/analytics/overview` | ✅ 匹配 `/admin/*` | `http://localhost:3006/analytics/overview` | `@Controller('analytics')` |
| `/api/v1/novel/:id` | ✅ 匹配 `/novel/*` | `http://localhost:3003/novels/:id` | `@Controller('novels')` |

---

## 🔧 环境变量配置

### 前端 (.env)

```env
# API Gateway 地址（前端只需要这一个配置）
VITE_API_BASE_URL=http://localhost:3000
```

### 后端 (.env)

```env
# 数据库配置
DATABASE_URL=mysql://user:password@localhost:3306/writing_platform

# JWT配置
JWT_SECRET=91writing_jwt_secret_dev_2024
JWT_EXPIRES_IN=7d

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379

# 微服务端口
API_GATEWAY_PORT=3000
AUTH_SERVICE_PORT=3002
USER_SERVICE_PORT=3001
NOVEL_SERVICE_PORT=3003
AI_SERVICE_PORT=3004
PAYMENT_SERVICE_PORT=3005
ADMIN_SERVICE_PORT=3006

# API Gateway 使用的微服务地址
AUTH_SERVICE_URL=http://localhost:3002
USER_SERVICE_URL=http://localhost:3001
NOVEL_SERVICE_URL=http://localhost:3003
AI_SERVICE_URL=http://localhost:3004
PAYMENT_SERVICE_URL=http://localhost:3005
ADMIN_SERVICE_URL=http://localhost:3006
```

---

## 🎓 最佳实践

1. **统一入口**：所有前端请求必须通过 API Gateway
2. **路由规范**：微服务只设置业务路径，不包含版本前缀
3. **错误处理**：前端统一在 apiManager 中处理错误
4. **认证token**：使用拦截器自动添加 Authorization header
5. **文档注解**：所有API都要添加 Swagger 文档
6. **环境变量**：不要硬编码URL，使用环境变量配置

---

## 📞 问题排查

遇到问题时，按以下步骤排查：

1. **检查网络请求**
   - 打开浏览器开发者工具 → Network
   - 查看请求的完整URL
   - 确认是否访问的是 3000 端口（API Gateway）

2. **检查后端日志**
   - API Gateway 日志：是否收到请求
   - 微服务日志：是否收到转发的请求

3. **验证路由配置**
   - API Gateway Controller 的路由
   - 微服务 Controller 的路由
   - 代理逻辑的路径处理

4. **测试认证**
   - 检查 token 是否有效
   - 验证守卫配置是否正确

---

**记住：永远通过 API Gateway！**🚀
