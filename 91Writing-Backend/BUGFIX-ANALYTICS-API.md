# Analytics API 404错误修复报告

**修复日期**: 2025年1月8日  
**问题类型**: 路由配置错误 + JWT认证缺失  
**严重程度**: 🔴 高（阻止管理后台数据分析功能）

---

## 问题概述

### 问题表现
管理员登录后访问数据分析页面，所有analytics API返回404错误：
```
Cannot GET /api/v1/admin/analytics/user-growth?days=30
Cannot GET /api/v1/admin/analytics/overview
Cannot GET /api/v1/admin/analytics/feature-usage?limit=10
Cannot GET /api/v1/admin/analytics/ai-usage
Cannot GET /api/v1/admin/analytics/revenue
```

### 根本原因

1. **API Gateway URL处理不正确**
   - 前端调用：`/api/v1/admin/analytics/*`
   - API Gateway未正确去除路由前缀
   - 导致转发到Admin Service时路径错误

2. **Admin Service缺少JWT认证配置**
   - Admin Service未导入PassportModule
   - 未配置JwtStrategy
   - 导致所有需要认证的endpoint返回500错误

---

## 解决方案

### 修复1: 更新API Gateway代理逻辑

**文件**: `apps/api-gateway/src/modules/admin/admin.service.ts`

**修改内容**:
```typescript
// 修改前
const targetPath = url.replace(/^\/admin/, '') || '/';

// 修改后
let targetPath = url.replace(/^\/api\/v1\/admin/, '').replace(/^\/admin/, '') || '/';
```

**说明**: 同时处理带全局前缀和不带全局前缀的URL

---

### 修复2: 添加Admin Service JWT认证

#### 2.1 创建JWT策略

**新建文件**: `apps/admin-service/src/strategies/jwt.strategy.ts`

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '@app/database';

export interface JwtPayload {
  sub: string; // 用户ID
  email: string;
  role: string;
  tenantId?: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', '91writing_default_secret'),
    });
  }

  async validate(payload: JwtPayload) {
    const { sub, email, role } = payload;

    const user = await this.prisma.user.findUnique({
      where: { id: sub },
      include: {
        profile: true,
        subscription: {
          include: {
            package: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('用户账号已被禁用');
    }

    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
      status: user.status,
      isActive: user.isActive,
      tenantId: user.tenantId,
      profile: user.profile,
      subscription: user.subscription,
      lastLoginAt: user.lastLoginAt,
    };
  }
}
```

#### 2.2 更新AppModule配置

**文件**: `apps/admin-service/src/app.module.ts`

**添加导入**:
```typescript
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
```

**添加模块**:
```typescript
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    
    // 添加 Passport 模块
    PassportModule.register({ defaultStrategy: 'jwt' }),
    
    // 添加 JWT 模块
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
    
    // ...其他模块
  ],
  providers: [JwtStrategy], // 添加JwtStrategy
})
```

---

## 验证步骤

### 1. 重新构建服务
```bash
cd /Users/zc/Desktop/py_project/91Writing/91Writing-Backend

# 构建API Gateway
npx nest build api-gateway --webpack

# 构建Admin Service
npx nest build admin-service --webpack
```

### 2. 重启服务
```bash
# 停止所有服务
./STOP.sh

# 启动所有服务
npm run start:all > /tmp/91writing.log 2>&1 &

# 等待30秒
sleep 30

# 检查服务状态
npm run check:services
```

### 3. 测试Analytics API

#### 通过API Gateway测试（推荐）
```bash
# 1. 获取管理员token
TOKEN=$(curl -s -X POST http://localhost:3002/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@91writing.com","password":"admin123456"}' \
  | jq -r '.data.accessToken')

# 2. 测试analytics API
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/v1/admin/analytics/overview" | jq .
```

#### 直接测试Admin Service
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3006/analytics/overview" | jq .
```

**预期响应**:
```json
{
  "success": true,
  "data": {
    "totalUsers": 2,
    "totalNovels": 0,
    "totalRevenue": 0,
    "activeUsers": 0
  }
}
```

---

## 前端测试

### 操作步骤
1. 打开前端应用: `http://localhost:7520`
2. 使用管理员账号登录:
   - 邮箱: `admin@91writing.com`
   - 密码: `admin123456`
3. 进入管理后台 → 数据分析页面
4. 刷新页面（Ctrl/Cmd + R）
5. 检查是否还有404错误

### 预期结果
- ✅ 用户增长趋势图正常显示
- ✅ 概览统计数据正常显示
- ✅ 功能使用统计正常显示
- ✅ AI使用统计正常显示
- ✅ 收入统计正常显示
- ✅ 控制台无404错误

---

## 影响文件清单

### 修改文件
1. `apps/api-gateway/src/modules/admin/admin.service.ts`
   - 更新URL路径处理逻辑

2. `apps/admin-service/src/app.module.ts`
   - 添加PassportModule和JwtModule
   - 注册JwtStrategy

### 新增文件
1. `apps/admin-service/src/strategies/jwt.strategy.ts`
   - JWT认证策略实现

---

## 技术要点

### 1. NestJS路由处理

**全局前缀的影响**:
- API Gateway设置了全局前缀 `api/v1`
- 所有路由自动加上这个前缀
- 代理时需要正确处理URL

**正确的URL转换**:
```
前端请求: /api/v1/admin/analytics/overview
↓ (API Gateway)
去掉全局前缀: /admin/analytics/overview
↓ (AdminController匹配 /admin/*)
去掉/admin: /analytics/overview
↓ (转发到Admin Service)
Admin Service路由: /analytics/overview
✅ 匹配AnalyticsController
```

### 2. Passport JWT认证

**认证流程**:
1. 前端发送请求，Header中包含JWT token
2. `JwtStrategy`提取并验证token
3. 从token payload中获取用户ID
4. 查询数据库验证用户状态
5. 将用户信息注入到request对象
6. Controller中可通过`@Req()`获取用户信息

**必需组件**:
- `PassportModule` - Passport核心模块
- `JwtModule` - JWT处理模块
- `JwtStrategy` - JWT验证策略
- `JwtAuthGuard` - 路由守卫（在Controller中使用）

---

## 预防措施

### 1. 新服务开发检查清单

创建新的NestJS微服务时，确保：
- [ ] 配置PassportModule和JwtModule
- [ ] 实现JwtStrategy
- [ ] 测试JWT认证是否正常工作
- [ ] 检查全局前缀配置
- [ ] 测试API Gateway代理

### 2. 路由测试

每个API endpoint发布前：
- [ ] 直接访问服务测试
- [ ] 通过API Gateway测试
- [ ] 测试带认证的请求
- [ ] 测试错误处理

### 3. 文档更新

- [ ] 更新API文档（Swagger）
- [ ] 更新路由配置文档
- [ ] 更新服务间调用文档

---

## 相关文档

- [MICROSERVICES-CONFIG.md](./MICROSERVICES-CONFIG.md) - 微服务配置规范
- [BUGFIX-FRONTEND-AND-ENV.md](./BUGFIX-FRONTEND-AND-ENV.md) - 前端和环境变量修复
- [服务管理指南.md](./服务管理指南.md) - 服务管理操作指南

---

## 总结

✅ **已解决问题**:
1. API Gateway URL代理错误 - 修复路径处理逻辑
2. Admin Service缺少JWT认证 - 添加完整的Passport+JWT配置

✅ **验证通过**:
- Admin Service可以正确处理JWT认证
- Analytics API路由正常匹配
- 通过API Gateway可以正确访问analytics endpoints

✅ **后续改进**:
- 添加API集成测试
- 完善错误日志
- 添加性能监控

---

**修复人员**: AI Assistant  
**审核状态**: ✅ 待前端测试验证  
**文档版本**: v1.0
