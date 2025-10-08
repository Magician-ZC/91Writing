# 91Writing 后端服务问题修复记录

> **修复日期**: 2025年1月8日  
> **问题类型**: 依赖注入错误 + 端口配置  
> **影响范围**: Admin Service + 所有微服务端口配置

---

## 🐛 问题描述

### 问题1: Admin Service 依赖注入错误
**错误信息:**
```
Error: Nest can't resolve dependencies of the AdminAuthGuard (?, ConfigService). 
Please make sure that the argument JwtService at index [0] is available in the AnalyticsModule context.
```

**原因分析:**
- AnalyticsModule中使用了AdminAuthGuard
- AdminAuthGuard需要JwtService依赖
- AnalyticsModule没有导入JwtModule，导致依赖注入失败

### 问题2: 端口配置优化
**问题:**
- 各服务都已配置独立的端口环境变量
- START.sh脚本未设置这些环境变量
- 需要统一配置以确保端口分配正确

---

## ✅ 解决方案

### 修复1: AnalyticsModule添加JwtModule依赖

**修改文件:** `91Writing-Backend/apps/admin-service/src/modules/analytics/analytics.module.ts`

**修改内容:**
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', '91writing_default_secret'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
```

### 修复2: START.sh添加端口环境变量

**修改文件:** `91Writing-Backend/START.sh`

**添加内容:**
```bash
# 微服务端口配置（按照MICROSERVICES-CONFIG.md规范）
export API_GATEWAY_PORT=3000
export USER_SERVICE_PORT=3001
export AUTH_SERVICE_PORT=3002
export NOVEL_SERVICE_PORT=3003
export AI_SERVICE_PORT=3004
export PAYMENT_SERVICE_PORT=3005
export ADMIN_SERVICE_PORT=3006

# 微服务URL配置（API Gateway使用）
export AUTH_SERVICE_URL="http://localhost:3002"
export USER_SERVICE_URL="http://localhost:3001"
export NOVEL_SERVICE_URL="http://localhost:3003"
export AI_SERVICE_URL="http://localhost:3004"
export PAYMENT_SERVICE_URL="http://localhost:3005"
export ADMIN_SERVICE_URL="http://localhost:3006"
```

### 修复3: 优化服务端口配置

**修改文件:**
- `apps/api-gateway/src/main.ts`
- `apps/novel-service/src/main.ts`

**修改内容:**
```typescript
// API Gateway
const port = process.env.API_GATEWAY_PORT || process.env.PORT || 3000;

// Novel Service
const port = process.env.NOVEL_SERVICE_PORT || process.env.PORT || 3003;
```

**其他服务已正确配置:**
- ✅ auth-service: 使用 `AUTH_SERVICE_PORT`
- ✅ user-service: 使用 `USER_SERVICE_PORT`
- ✅ ai-service: 使用 `AI_SERVICE_PORT`
- ✅ payment-service: 使用 `PAYMENT_SERVICE_PORT`
- ✅ admin-service: 使用 `ADMIN_SERVICE_PORT`

---

## 🆕 新增工具

### STOP.sh - 服务停止脚本

**文件:** `91Writing-Backend/STOP.sh`

**功能:**
- 停止所有运行中的服务进程
- 释放所有端口（3000-3006）
- 检查并强制关闭占用端口的进程

**使用方法:**
```bash
./STOP.sh
```

---

## 📊 验证结果

### 服务状态检查
```bash
npm run check:services
```

**结果:**
```
======================================
   91Writing 微服务状态检查
======================================

✅ API Gateway     - http://localhost:3000 - 运行中
✅ User Service    - http://localhost:3001 - 运行中
✅ Auth Service    - http://localhost:3002 - 运行中
✅ Novel Service   - http://localhost:3003 - 运行中
✅ AI Service      - http://localhost:3004 - 运行中
✅ Payment Service - http://localhost:3005 - 运行中
✅ Admin Service   - http://localhost:3006 - 运行中

======================================
🎉 所有服务运行正常！
```

---

## 🔧 相关文档

- [微服务配置文档](./MICROSERVICES-CONFIG.md)
- [后端启动指南](./BACKEND-STARTUP-GUIDE.md)
- [端口配置参考](./PORT-REFERENCE.txt)

---

## 📝 经验教训

1. **模块依赖管理**
   - 使用Guard时，确保其依赖的Service在模块中可用
   - 建议在Guard所在模块中导入必要的依赖

2. **端口配置规范**
   - 每个服务使用独立的端口环境变量
   - 启动脚本统一设置所有端口
   - 遵循MICROSERVICES-CONFIG.md规范

3. **故障排查步骤**
   - 检查错误日志，定位问题模块
   - 查看依赖注入链路
   - 验证环境变量配置
   - 使用端口检查工具

---

**修复状态:** ✅ 已完成  
**测试状态:** ✅ 通过  
**文档更新:** ✅ 已更新
