# AI 配置删除问题修复说明

## 问题描述

删除 AI 配置时出现 400 错误：
```
message: "Unexpected token 'n', \"null\" is not valid JSON"
error: "Bad Request"
statusCode: 400
```

## 根本原因

DELETE 请求不应该有请求体（body），但代码中：
1. **前端 API Manager**：在所有请求中都设置了 `Content-Type: application/json` 和 `data` 字段
2. **API Gateway 代理服务**：在转发所有请求时都包含了 `body`
3. **后端 Controller**：DELETE 接口缺少 `@HttpCode(HttpStatus.OK)` 装饰器

当 `data` 为 `null` 时，可能被转换为字符串 `"null"`，导致 NestJS 的 JSON 解析器尝试解析时失败。

## 修复内容

### 1. 前端修复 (`src/services/apiManager.js`)

**修改位置**：第 230-253 行

**修复内容**：
- 构建请求配置时，只在非 GET/DELETE 请求且有数据时才添加 `data` 和 `Content-Type`
- DELETE 和 GET 请求不再发送 body

```javascript
// 构建请求配置
const requestConfig = {
  url: fullUrl,
  method,
  params,
  headers: {
    'Authorization': this.getAuthToken() ? `Bearer ${this.getAuthToken()}` : undefined,
  }
}

// 只有在有 data 且不是 GET/DELETE 请求时才添加 data 和 Content-Type
if (data && method !== 'GET' && method !== 'DELETE') {
  requestConfig.data = data
  requestConfig.headers['Content-Type'] = 'application/json'
}
```

### 2. 后端修复 - User Service Controller

**文件**：`91Writing-Backend/apps/user-service/src/modules/ai-config/ai-config.controller.ts`

**修复内容**：
1. 导入必要的装饰器：`HttpCode`, `HttpStatus`, `ApiParam`
2. DELETE 接口添加 `@HttpCode(HttpStatus.OK)` 装饰器
3. 添加 `@ApiParam` 装饰器完善 API 文档

```typescript
@Delete('custom/:id')
@ApiOperation({ summary: '删除用户自定义配置' })
@ApiParam({ name: 'id', description: '配置ID' })
@HttpCode(HttpStatus.OK)  // ⚠️ 必须添加！确保返回 200 而不是 204
async deleteConfig(@Request() req, @Param('id') id: string): Promise<{ message: string }> {
  await this.aiConfigService.deleteConfig(req.user.userId, id);
  return { message: '配置已删除' };
}
```

### 3. API Gateway 修复

修复了所有 Gateway 代理服务，确保 DELETE 和 GET 请求不发送 body：

#### 3.1 Users Service
**文件**：`91Writing-Backend/apps/api-gateway/src/modules/users/users.service.ts`

#### 3.2 Auth Service  
**文件**：`91Writing-Backend/apps/api-gateway/src/modules/auth/auth.service.ts`

#### 3.3 Admin Service
**文件**：`91Writing-Backend/apps/api-gateway/src/modules/admin/admin.service.ts`

#### 3.4 Novel Service
**文件**：`91Writing-Backend/apps/api-gateway/src/modules/novel/novel.service.ts`

#### 3.5 Payment Service
**文件**：`91Writing-Backend/apps/api-gateway/src/modules/payment/payment.service.ts`

**统一修复内容**：
```typescript
// 构建请求配置
const requestConfig: any = {
  method: method as any,
  url: targetUrl,
  headers: cleanHeaders,
  timeout: 30000,
  validateStatus: () => true,
};

// 只有在非 GET/DELETE 请求时才添加 body
if (method !== 'GET' && method !== 'DELETE' && body !== undefined) {
  requestConfig.data = body;
}

const response = await firstValueFrom(
  this.httpService.request(requestConfig),
);
```

## 技术要点

### 为什么 DELETE 请求不应该有 body？

1. **HTTP 规范**：虽然 HTTP 规范没有明确禁止 DELETE 带 body，但这不是标准做法
2. **最佳实践**：RESTful API 设计中，DELETE 通过 URL 参数（如 `:id`）指定要删除的资源
3. **框架兼容性**：很多框架和中间件对 DELETE 请求的 body 处理不一致，容易出问题

### 为什么要添加 @HttpCode(HttpStatus.OK)？

根据文档《接口开发快速参考.md》第 215 行：

> ⚠️ DELETE 操作默认返回 204 No Content，但我们需要返回消息体，所以必须使用 `@HttpCode(HttpStatus.OK)` 设置为 200

**原因**：
- NestJS 默认情况下，DELETE 请求成功返回 `204 No Content`（无响应体）
- 但我们的接口需要返回 `{ message: '配置已删除' }` 这样的响应体
- 必须显式设置为 `200 OK` 才能正确返回响应体

## 测试验证

修复后，删除 AI 配置应该：
1. ✅ 返回 200 状态码（而不是 204）
2. ✅ 返回 JSON 响应：`{ message: '配置已删除' }`
3. ✅ 不再出现 400 JSON 解析错误
4. ✅ 前端正确显示删除成功消息

## 相关文档参考

- `91Writing-Backend/接口开发快速参考.md` - 第 215 行：DELETE 接口开发规范
- `91Writing-Backend/接口错误排查指南.md` - 400/404 错误排查指南

## 举一反三

此次修复暴露的通用问题：
1. **所有 DELETE 接口都应该添加 `@HttpCode(HttpStatus.OK)`**
2. **HTTP 客户端应该区别对待不同方法，GET/DELETE 不发送 body**
3. **代理服务转发时要注意过滤不必要的请求体**

建议：
- 检查其他 DELETE 接口是否也缺少 `@HttpCode` 装饰器
- 统一 HTTP 请求的处理逻辑，避免类似问题

---

**修复日期**：2025-01-20  
**修复人**：AI Assistant  
**影响范围**：前端 API Manager + 后端所有 Gateway 代理服务 + User Service

