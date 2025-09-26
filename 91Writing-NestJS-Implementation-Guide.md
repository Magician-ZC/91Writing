# 91Writing NestJS后端架构实施指南

> **架构确认**: Node.js + NestJS 企业级微服务  
> **文档版本**: v1.0  
> **创建日期**: 2024年12月19日  
> **技术栈**: TypeScript + NestJS + Prisma + MySQL

## 🎯 NestJS架构优势

### 为什么选择NestJS？
```typescript
// NestJS的核心优势
const nestjsAdvantages = {
  企业级框架: "Spring Boot风格的TypeScript框架",
  装饰器驱动: "简洁优雅的API设计",
  依赖注入: "解耦合，便于测试",
  模块化设计: "清晰的代码组织结构", 
  内置功能: "认证、验证、缓存、队列等开箱即用",
  微服务支持: "原生支持微服务架构",
  生态完整: "丰富的第三方库支持",
  类型安全: "完整的TypeScript支持"
}
```

## 🏗️ 项目架构设计

### 整体项目结构
```
91Writing-Backend/
├── apps/                           # 微服务应用
│   ├── api-gateway/                # API网关
│   │   ├── src/
│   │   │   ├── app.module.ts
│   │   │   ├── main.ts
│   │   │   └── modules/
│   │   │       ├── auth/           # 认证模块
│   │   │       ├── proxy/          # 代理模块
│   │   │       └── middleware/     # 中间件
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── user-service/               # 用户服务
│   │   ├── src/
│   │   │   ├── app.module.ts
│   │   │   ├── main.ts
│   │   │   ├── modules/
│   │   │   │   ├── users/          # 用户管理
│   │   │   │   ├── auth/           # 认证
│   │   │   │   └── profiles/       # 用户资料
│   │   │   ├── database/           # 数据库
│   │   │   └── common/             # 通用模块
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── novel-service/              # 小说服务
│   ├── ai-service/                 # AI服务
│   ├── payment-service/            # 支付服务
│   └── notification-service/       # 通知服务
├── libs/                           # 共享库
│   ├── common/                     # 通用模块
│   │   ├── src/
│   │   │   ├── decorators/         # 装饰器
│   │   │   ├── guards/             # 守卫
│   │   │   ├── interceptors/       # 拦截器
│   │   │   ├── pipes/              # 管道
│   │   │   ├── filters/            # 异常过滤器
│   │   │   └── utils/              # 工具函数
│   │   └── package.json
│   ├── database/                   # 数据库模块
│   └── auth/                       # 认证模块
├── tools/                          # 工具脚本
├── docker/                         # Docker配置
├── docs/                          # 文档
├── nest-cli.json                  # NestJS CLI配置
├── package.json                   # 根package.json
├── tsconfig.json                  # TypeScript配置
├── docker-compose.yml             # 容器编排
└── README.md
```

## 🚀 核心技术实施

### 1. 项目初始化

#### 创建NestJS Monorepo
```bash
# 安装NestJS CLI
npm install -g @nestjs/cli

# 创建项目
nest new 91writing-backend --package-manager npm
cd 91writing-backend

# 转换为monorepo结构
nest generate app api-gateway
nest generate app user-service
nest generate app novel-service
nest generate app ai-service
nest generate app payment-service

# 创建共享库
nest generate library common
nest generate library database
nest generate library auth
```

#### 核心依赖安装
```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/swagger": "^7.0.0",
    "@nestjs/bull": "^10.0.0",
    "@nestjs/microservices": "^10.0.0",
    "@prisma/client": "^5.0.0",
    "prisma": "^5.0.0",
    "bull": "^4.11.0",
    "redis": "^4.6.0",
    "mysql2": "^3.6.0",
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.0",
    "passport-local": "^1.0.0",
    "bcrypt": "^5.1.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "helmet": "^7.0.0",
    "compression": "^1.7.4"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/express": "^4.17.17",
    "@types/jest": "^29.5.2",
    "@types/node": "^20.3.1",
    "@types/passport-jwt": "^3.0.9",
    "@types/passport-local": "^1.0.35",
    "@types/bcrypt": "^5.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.42.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.0",
    "jest": "^29.5.0",
    "prettier": "^3.0.0",
    "supertest": "^6.3.3",
    "ts-jest": "^29.1.0",
    "ts-loader": "^9.4.3",
    "ts-node": "^10.9.1",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.1.3"
  }
}
```

### 2. 多租户架构实现

#### 租户上下文装饰器
```typescript
// libs/common/src/decorators/tenant.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Tenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantId || request.headers['x-tenant-id'];
  },
);

export const TenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.tenantId || request.headers['x-tenant-id'];
  },
);
```

#### 租户守卫
```typescript
// libs/common/src/guards/tenant.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { TenantService } from '../services/tenant.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly tenantService: TenantService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id'] || request.user?.tenantId;
    
    if (!tenantId) {
      throw new UnauthorizedException('Tenant ID is required');
    }

    // 验证租户是否存在且有效
    const tenant = await this.tenantService.validateTenant(tenantId);
    if (!tenant) {
      throw new UnauthorizedException('Invalid tenant');
    }

    request.tenantId = tenantId;
    request.tenant = tenant;
    
    return true;
  }
}
```

#### Prisma多租户配置
```typescript
// libs/database/src/prisma.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private tenantDatabases = new Map<string, PrismaClient>();

  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get('DATABASE_URL'),
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  // 获取租户专用数据库连接
  getTenantDatabase(tenantId: string): PrismaClient {
    if (!this.tenantDatabases.has(tenantId)) {
      const tenantDb = new PrismaClient({
        datasources: {
          db: {
            url: this.getTenantDatabaseUrl(tenantId),
          },
        },
      });
      this.tenantDatabases.set(tenantId, tenantDb);
    }
    return this.tenantDatabases.get(tenantId)!;
  }

  private getTenantDatabaseUrl(tenantId: string): string {
    const baseUrl = this.configService.get('DATABASE_URL');
    // 可以根据tenantId生成不同的数据库连接
    // 方案1: 不同数据库 - database_tenant1, database_tenant2
    // 方案2: 相同数据库，通过where条件过滤
    return baseUrl.replace('/91writing', `/91writing_${tenantId}`);
  }
}
```

### 3. 用户服务实现

#### 用户模块结构
```typescript
// apps/user-service/src/modules/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DatabaseModule } from '@app/database';
import { AuthModule } from '@app/auth';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

#### 用户控制器
```typescript
// apps/user-service/src/modules/users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto';
import { JwtAuthGuard, TenantGuard } from '@app/common';
import { Tenant, User } from '@app/common/decorators';
import { CacheInterceptor } from '@nestjs/cache-manager';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: '创建用户' })
  @ApiResponse({ status: 201, description: '用户创建成功', type: UserResponseDto })
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Tenant() tenantId: string,
  ): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto, tenantId);
  }

  @Get()
  @ApiOperation({ summary: '获取用户列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @UseInterceptors(CacheInterceptor)
  async getUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Tenant() tenantId: string,
  ) {
    return this.usersService.findAll(tenantId, { page, limit });
  }

  @Get('profile')
  @ApiOperation({ summary: '获取当前用户资料' })
  async getProfile(@User() user: any) {
    return this.usersService.getProfile(user.id, user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新用户' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Tenant() tenantId: string,
    @User() currentUser: any,
  ) {
    return this.usersService.update(id, updateUserDto, tenantId, currentUser);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  async deleteUser(
    @Param('id') id: string,
    @Tenant() tenantId: string,
    @User() currentUser: any,
  ) {
    return this.usersService.remove(id, tenantId, currentUser);
  }
}
```

#### 用户服务
```typescript
// apps/user-service/src/modules/users/users.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { CreateUserDto, UpdateUserDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto, tenantId: string) {
    const { password, ...userData } = createUserDto;
    
    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 使用租户数据库
    const tenantDb = this.prisma.getTenantDatabase(tenantId);
    
    const user = await tenantDb.user.create({
      data: {
        ...userData,
        passwordHash: hashedPassword,
        tenantId,
        profile: {
          create: {
            nickname: userData.email.split('@')[0], // 默认昵称
          }
        }
      },
      include: {
        profile: true,
        subscription: true,
      },
    });

    // 不返回密码哈希
    const { passwordHash, ...result } = user;
    return result;
  }

  async findAll(tenantId: string, query: { page: number; limit: number }) {
    const tenantDb = this.prisma.getTenantDatabase(tenantId);
    const { page, limit } = query;
    const offset = (page - 1) * limit;

    const [users, total] = await Promise.all([
      tenantDb.user.findMany({
        where: { tenantId },
        skip: offset,
        take: limit,
        include: {
          profile: true,
          subscription: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      tenantDb.user.count({ where: { tenantId } }),
    ]);

    return {
      data: users.map(({ passwordHash, ...user }) => user),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, tenantId: string) {
    const tenantDb = this.prisma.getTenantDatabase(tenantId);
    
    const user = await tenantDb.user.findFirst({
      where: { id, tenantId },
      include: {
        profile: true,
        subscription: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  async update(id: string, updateUserDto: UpdateUserDto, tenantId: string, currentUser: any) {
    // 权限检查：只能更新自己的信息或管理员权限
    if (currentUser.id !== id && !currentUser.roles.includes('admin')) {
      throw new ForbiddenException('Permission denied');
    }

    const tenantDb = this.prisma.getTenantDatabase(tenantId);
    
    const updateData: any = { ...updateUserDto };
    
    // 如果更新密码，需要加密
    if (updateUserDto.password) {
      updateData.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
      delete updateData.password;
    }

    const user = await tenantDb.user.update({
      where: { id, tenantId },
      data: updateData,
      include: {
        profile: true,
        subscription: true,
      },
    });

    const { passwordHash, ...result } = user;
    return result;
  }

  async remove(id: string, tenantId: string, currentUser: any) {
    // 权限检查
    if (!currentUser.roles.includes('admin')) {
      throw new ForbiddenException('Permission denied');
    }

    const tenantDb = this.prisma.getTenantDatabase(tenantId);
    
    await tenantDb.user.delete({
      where: { id, tenantId },
    });

    return { message: 'User deleted successfully' };
  }

  async getProfile(userId: string, tenantId: string) {
    return this.findById(userId, tenantId);
  }
}
```

### 4. API网关实现

#### 网关主模块
```typescript
// apps/api-gateway/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProxyModule } from './modules/proxy/proxy.module';
import { AuthModule } from './modules/auth/auth.module';
import { MiddlewareModule } from './modules/middleware/middleware.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    
    // 限流配置
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: config.get('THROTTLE_TTL', 60),
        limit: config.get('THROTTLE_LIMIT', 100),
      }),
    }),
    
    // 缓存配置
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        store: redisStore,
        host: config.get('REDIS_HOST'),
        port: config.get('REDIS_PORT'),
        ttl: 300, // 5分钟缓存
      }),
    }),
    
    AuthModule,
    ProxyModule,
    MiddlewareModule,
  ],
})
export class AppModule {}
```

#### 服务代理模块
```typescript
// apps/api-gateway/src/modules/proxy/proxy.controller.ts
import { Controller, All, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from './proxy.service';
import { JwtAuthGuard, TenantGuard } from '@app/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller()
@UseGuards(ThrottlerGuard, JwtAuthGuard, TenantGuard)
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @All('api/users/*')
  async proxyToUserService(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.proxyRequest('user-service', req, res);
  }

  @All('api/novels/*')
  async proxyToNovelService(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.proxyRequest('novel-service', req, res);
  }

  @All('api/ai/*')
  async proxyToAIService(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.proxyRequest('ai-service', req, res);
  }

  @All('api/payments/*')
  async proxyToPaymentService(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.proxyRequest('payment-service', req, res);
  }
}
```

### 5. 数据库Schema设计

#### Prisma Schema
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// 用户表
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  username     String?  @unique
  passwordHash String   @map("password_hash")
  status       UserStatus @default(ACTIVE)
  emailVerified Boolean @default(false) @map("email_verified")
  lastLoginAt  DateTime? @map("last_login_at")
  
  // 多租户字段
  tenantId     String   @map("tenant_id")
  
  // 关联
  profile      UserProfile?
  subscription Subscription?
  novels       Novel[]
  activities   UserActivity[]
  
  // 时间戳
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  
  @@map("users")
  @@index([tenantId])
  @@index([email, tenantId])
}

// 用户资料表
model UserProfile {
  userId      String  @id @map("user_id")
  nickname    String?
  avatar      String?
  bio         String? @db.Text
  preferences Json?   // 用户偏好设置
  writingStats Json?  @map("writing_stats") // 写作统计
  
  // 关联
  user        User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("user_profiles")
}

// 套餐表
model Package {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  description String?  @db.Text
  price       Decimal  @db.Decimal(10, 2)
  durationDays Int     @map("duration_days")
  features    Json     // 功能配置
  sortOrder   Int      @default(0) @map("sort_order")
  status      PackageStatus @default(ACTIVE)
  
  // 关联
  subscriptions Subscription[]
  activationCodes ActivationCode[]
  
  // 时间戳
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  @@map("packages")
}

// 订阅表
model Subscription {
  id          String   @id @default(cuid())
  userId      String   @unique @map("user_id")
  packageId   Int      @map("package_id")
  status      SubscriptionStatus @default(ACTIVE)
  startDate   DateTime @map("start_date") @db.Date
  endDate     DateTime @map("end_date") @db.Date
  autoRenew   Boolean  @default(false) @map("auto_renew")
  
  // 多租户
  tenantId    String   @map("tenant_id")
  
  // 关联
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  package     Package  @relation(fields: [packageId], references: [id])
  
  // 时间戳
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  @@map("subscriptions")
  @@index([tenantId])
}

// 小说表
model Novel {
  id          String   @id @default(cuid())
  userId      String   @map("user_id")
  title       String
  description String?  @db.Text
  genre       String?
  status      NovelStatus @default(DRAFT)
  coverUrl    String?  @map("cover_url")
  wordCount   Int      @default(0) @map("word_count")
  chapterCount Int     @default(0) @map("chapter_count")
  settings    Json?    // 小说设置(角色、世界观等)
  
  // 多租户
  tenantId    String   @map("tenant_id")
  
  // 关联
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  chapters    Chapter[]
  memories    NovelMemory[]
  
  // 时间戳
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  @@map("novels")
  @@index([userId, tenantId])
}

// 章节表
model Chapter {
  id            String   @id @default(cuid())
  novelId       String   @map("novel_id")
  title         String
  content       String   @db.LongText
  wordCount     Int      @default(0) @map("word_count")
  chapterNumber Int      @map("chapter_number")
  status        ChapterStatus @default(DRAFT)
  
  // 关联
  novel         Novel    @relation(fields: [novelId], references: [id], onDelete: Cascade)
  
  // 时间戳
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  
  @@map("chapters")
  @@unique([novelId, chapterNumber])
}

// 记忆系统表
model NovelMemory {
  id           String   @id @default(cuid())
  novelId      String   @map("novel_id")
  memoryType   MemoryType @map("memory_type")
  content      Json
  importance   Decimal  @db.Decimal(3, 2) @default(0.5)
  tokenCost    Int      @default(0) @map("token_cost")
  chapterRange String?  @map("chapter_range")
  
  // 关联
  novel        Novel    @relation(fields: [novelId], references: [id], onDelete: Cascade)
  
  // 时间戳
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  
  @@map("novel_memories")
  @@index([novelId, memoryType])
}

// 枚举定义
enum UserStatus {
  ACTIVE
  INACTIVE 
  BANNED
}

enum PackageStatus {
  ACTIVE
  INACTIVE
}

enum SubscriptionStatus {
  ACTIVE
  EXPIRED
  CANCELLED
  PENDING
}

enum NovelStatus {
  DRAFT
  WRITING
  COMPLETED
  PUBLISHED
}

enum ChapterStatus {
  DRAFT
  PUBLISHED
}

enum MemoryType {
  CORE
  SUMMARY
  CONTEXT
}
```

## 📦 容器化部署

### Docker配置
```dockerfile
# Dockerfile (用户服务示例)
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./

RUN npm ci --only=production && npm cache clean --force

COPY . .
RUN npm run build user-service

FROM node:18-alpine AS runner

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3001

CMD ["node", "dist/apps/user-service/main"]
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root123
      MYSQL_DATABASE: writing_platform
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  api-gateway:
    build:
      context: .
      dockerfile: apps/api-gateway/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=mysql://root:root123@mysql:3306/writing_platform
      - REDIS_HOST=redis
      - JWT_SECRET=your-jwt-secret
    depends_on:
      - mysql
      - redis

  user-service:
    build:
      context: .
      dockerfile: apps/user-service/Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=mysql://root:root123@mysql:3306/writing_platform
      - REDIS_HOST=redis
    depends_on:
      - mysql
      - redis

  novel-service:
    build:
      context: .
      dockerfile: apps/novel-service/Dockerfile
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=mysql://root:root123@mysql:3306/writing_platform
      - REDIS_HOST=redis
    depends_on:
      - mysql
      - redis

volumes:
  mysql_data:
  redis_data:
```

## 🚀 开发工作流

### 第一周开发任务
```bash
# Day 1-2: 项目搭建
nest new 91writing-backend
cd 91writing-backend

# 转换为monorepo并创建服务
nest generate app api-gateway
nest generate app user-service
nest generate library common
nest generate library database

# Day 3-4: 用户服务开发
nest generate module users apps/user-service/src/modules/users
nest generate controller users apps/user-service/src/modules/users
nest generate service users apps/user-service/src/modules/users

# Day 5-7: API网关和认证
nest generate module auth apps/api-gateway/src/modules/auth
nest generate module proxy apps/api-gateway/src/modules/proxy
```

## ✅ 开发检查清单

### 基础架构
- [ ] NestJS项目初始化完成
- [ ] Monorepo结构搭建
- [ ] TypeScript配置
- [ ] Prisma数据库配置
- [ ] Redis缓存配置
- [ ] Docker容器配置

### 核心功能
- [ ] 多租户架构实现
- [ ] JWT认证系统
- [ ] API网关配置
- [ ] 用户管理服务
- [ ] Swagger文档生成
- [ ] 单元测试框架

### 生产就绪
- [ ] 错误处理机制
- [ ] 日志记录系统
- [ ] 监控指标收集
- [ ] 安全防护配置
- [ ] 性能优化设置
- [ ] 部署脚本准备

## 🎯 下一步行动

1. **立即开始**: 创建NestJS项目并搭建基础架构
2. **第一周目标**: 完成用户服务和API网关的基础实现
3. **测试验证**: 确保多租户架构和认证系统正常工作
4. **持续迭代**: 按照微服务架构逐步完善各个服务模块

这个NestJS架构将为您的91Writing SaaS平台提供坚实的技术基础！🚀
