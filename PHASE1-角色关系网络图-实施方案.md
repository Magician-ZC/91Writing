# Phase 1 - Week 1-2: 角色关系网络图功能实施方案

**开发时间**: Week 1-2  
**功能**: 角色关系网络图可视化  
**优先级**: ⭐⭐⭐⭐⭐ (极高)

---

## 📋 功能概述

### 核心价值
- 可视化展示角色之间的关系网络
- 支持多种关系类型（朋友、敌人、家人、恋人等）
- 动态管理和更新关系
- 集成到现有的角色管理系统

### 技术方案
- **后端**: NestJS + Prisma + MySQL
- **前端**: Vue3 + vis-network + Element Plus
- **接口规范**: 遵循项目统一开发规范

---

## 📊 数据库设计

### 1. Prisma Schema

```prisma
// 91Writing-Backend/prisma/schema.prisma

// 角色关系表
model CharacterRelationship {
  id                String    @id @default(uuid())
  novelId           String
  novel             Novel     @relation(fields: [novelId], references: [id], onDelete: Cascade)
  
  sourceCharacterId String
  sourceCharacter   Character @relation("SourceRelations", fields: [sourceCharacterId], references: [id], onDelete: Cascade)
  
  targetCharacterId String
  targetCharacter   Character @relation("TargetRelations", fields: [targetCharacterId], references: [id], onDelete: Cascade)
  
  relationType      String    // 'friend', 'enemy', 'family', 'lover', 'colleague', 'mentor', 'rival'
  strength          Int       @default(5) // 1-10，关系强度
  description       String?   @db.Text // 关系描述
  chapterIntroduced Int?      // 首次出现的章节
  status            String    @default("active") // 'active', 'broken', 'changed'
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@index([novelId])
  @@index([sourceCharacterId])
  @@index([targetCharacterId])
  @@unique([sourceCharacterId, targetCharacterId, relationType])
}

// Character 表需要添加关系
model Character {
  // ... 现有字段
  
  // 新增关系字段
  sourceRelations CharacterRelationship[] @relation("SourceRelations")
  targetRelations CharacterRelationship[] @relation("TargetRelations")
}
```

### 2. 数据库迁移

```bash
cd 91Writing-Backend
npx prisma migrate dev --name add_character_relationships
npx prisma generate
```

---

## 🔧 后端实现

### 文件结构

```
91Writing-Backend/
├── apps/novel-service/src/modules/
│   └── character-relationship/
│       ├── dto/
│       │   ├── create-character-relationship.dto.ts
│       │   ├── update-character-relationship.dto.ts
│       │   ├── query-character-relationship.dto.ts
│       │   └── character-relationship-response.dto.ts
│       ├── character-relationship.controller.ts
│       ├── character-relationship.service.ts
│       └── character-relationship.module.ts
```

### 1. DTO 定义

#### create-character-relationship.dto.ts

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, Max, MinLength, MaxLength, IsEnum, IsInt } from 'class-validator';

export class CreateCharacterRelationshipDto {
  @ApiProperty({ 
    description: '源角色ID',
    example: 'cm123abc'
  })
  @IsString({ message: '源角色ID必须是字符串' })
  @MinLength(1, { message: '源角色ID不能为空' })
  sourceCharacterId: string;

  @ApiProperty({ 
    description: '目标角色ID',
    example: 'cm456def'
  })
  @IsString({ message: '目标角色ID必须是字符串' })
  @MinLength(1, { message: '目标角色ID不能为空' })
  targetCharacterId: string;

  @ApiProperty({ 
    description: '关系类型',
    enum: ['friend', 'enemy', 'family', 'lover', 'colleague', 'mentor', 'rival'],
    example: 'friend'
  })
  @IsEnum(['friend', 'enemy', 'family', 'lover', 'colleague', 'mentor', 'rival'], {
    message: '无效的关系类型'
  })
  relationType: string;

  @ApiPropertyOptional({ 
    description: '关系强度（1-10）',
    minimum: 1,
    maximum: 10,
    default: 5,
    example: 7
  })
  @IsOptional()
  @IsInt({ message: '关系强度必须是整数' })
  @Min(1, { message: '关系强度最小为1' })
  @Max(10, { message: '关系强度最大为10' })
  strength?: number = 5;

  @ApiPropertyOptional({ 
    description: '关系描述',
    example: '青梅竹马，从小一起长大',
    maxLength: 500
  })
  @IsOptional()
  @IsString({ message: '关系描述必须是字符串' })
  @MaxLength(500, { message: '关系描述不能超过500个字符' })
  description?: string;

  @ApiPropertyOptional({ 
    description: '首次出现的章节',
    example: 1,
    minimum: 1
  })
  @IsOptional()
  @IsInt({ message: '章节必须是整数' })
  @Min(1, { message: '章节必须大于0' })
  chapterIntroduced?: number;

  @ApiPropertyOptional({ 
    description: '关系状态',
    enum: ['active', 'broken', 'changed'],
    default: 'active'
  })
  @IsOptional()
  @IsEnum(['active', 'broken', 'changed'], {
    message: '无效的关系状态'
  })
  status?: string = 'active';
}
```

#### update-character-relationship.dto.ts

```typescript
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, Max, MinLength, MaxLength, IsEnum, IsInt } from 'class-validator';

export class UpdateCharacterRelationshipDto {
  @ApiPropertyOptional({ 
    description: '关系类型',
    enum: ['friend', 'enemy', 'family', 'lover', 'colleague', 'mentor', 'rival']
  })
  @IsOptional()
  @IsEnum(['friend', 'enemy', 'family', 'lover', 'colleague', 'mentor', 'rival'])
  relationType?: string;

  @ApiPropertyOptional({ 
    description: '关系强度（1-10）',
    minimum: 1,
    maximum: 10
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  strength?: number;

  @ApiPropertyOptional({ 
    description: '关系描述',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ 
    description: '首次出现的章节',
    minimum: 1
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  chapterIntroduced?: number;

  @ApiPropertyOptional({ 
    description: '关系状态',
    enum: ['active', 'broken', 'changed']
  })
  @IsOptional()
  @IsEnum(['active', 'broken', 'changed'])
  status?: string;
}
```

#### query-character-relationship.dto.ts

```typescript
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryCharacterRelationshipDto {
  @ApiPropertyOptional({ 
    description: '关系类型过滤',
    enum: ['friend', 'enemy', 'family', 'lover', 'colleague', 'mentor', 'rival']
  })
  @IsOptional()
  @IsEnum(['friend', 'enemy', 'family', 'lover', 'colleague', 'mentor', 'rival'])
  relationType?: string;

  @ApiPropertyOptional({ 
    description: '关系状态过滤',
    enum: ['active', 'broken', 'changed']
  })
  @IsOptional()
  @IsEnum(['active', 'broken', 'changed'])
  status?: string;

  @ApiPropertyOptional({ 
    description: '特定角色ID（查询该角色的所有关系）'
  })
  @IsOptional()
  @IsString()
  characterId?: string;
}
```

### 2. Service 实现

#### character-relationship.service.ts

```typescript
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { CreateCharacterRelationshipDto } from './dto/create-character-relationship.dto';
import { UpdateCharacterRelationshipDto } from './dto/update-character-relationship.dto';
import { QueryCharacterRelationshipDto } from './dto/query-character-relationship.dto';

@Injectable()
export class CharacterRelationshipService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建角色关系
   */
  async create(userId: string, novelId: string, createDto: CreateCharacterRelationshipDto) {
    // 验证小说所有权
    await this.validateNovelOwnership(userId, novelId);

    // 验证角色存在性和所有权
    await this.validateCharacterOwnership(userId, novelId, createDto.sourceCharacterId);
    await this.validateCharacterOwnership(userId, novelId, createDto.targetCharacterId);

    // 防止自己和自己建立关系
    if (createDto.sourceCharacterId === createDto.targetCharacterId) {
      throw new BadRequestException('角色不能与自己建立关系');
    }

    // 创建关系
    return this.prisma.characterRelationship.create({
      data: {
        ...createDto,
        novelId,
      },
      include: {
        sourceCharacter: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
        targetCharacter: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * 获取小说的所有角色关系
   */
  async findAll(userId: string, novelId: string, queryDto: QueryCharacterRelationshipDto) {
    // 验证小说所有权
    await this.validateNovelOwnership(userId, novelId);

    const where: any = { novelId };

    // 应用过滤条件
    if (queryDto.relationType) {
      where.relationType = queryDto.relationType;
    }

    if (queryDto.status) {
      where.status = queryDto.status;
    }

    // 如果指定了角色ID，查询该角色的所有关系
    if (queryDto.characterId) {
      where.OR = [
        { sourceCharacterId: queryDto.characterId },
        { targetCharacterId: queryDto.characterId },
      ];
    }

    const relationships = await this.prisma.characterRelationship.findMany({
      where,
      include: {
        sourceCharacter: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
        targetCharacter: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return relationships;
  }

  /**
   * 获取关系网络图数据
   */
  async getNetworkData(userId: string, novelId: string) {
    // 验证小说所有权
    await this.validateNovelOwnership(userId, novelId);

    // 获取所有角色
    const characters = await this.prisma.character.findMany({
      where: { novelId },
      select: {
        id: true,
        name: true,
        avatar: true,
        role: true,
        gender: true,
      },
    });

    // 获取所有关系
    const relationships = await this.prisma.characterRelationship.findMany({
      where: { novelId, status: 'active' },
      select: {
        id: true,
        sourceCharacterId: true,
        targetCharacterId: true,
        relationType: true,
        strength: true,
        description: true,
      },
    });

    // 转换为网络图格式
    const nodes = characters.map(char => ({
      id: char.id,
      label: char.name,
      title: char.name, // 悬停提示
      shape: 'circularImage',
      image: char.avatar || '/default-avatar.png',
      role: char.role,
      gender: char.gender,
    }));

    const edges = relationships.map(rel => ({
      id: rel.id,
      from: rel.sourceCharacterId,
      to: rel.targetCharacterId,
      label: this.getRelationLabel(rel.relationType),
      title: rel.description || this.getRelationLabel(rel.relationType),
      color: this.getRelationColor(rel.relationType),
      width: Math.max(1, rel.strength / 2), // 1-5
      relationType: rel.relationType,
      strength: rel.strength,
    }));

    return {
      nodes,
      edges,
      statistics: {
        totalCharacters: characters.length,
        totalRelationships: relationships.length,
        relationshipTypes: this.getRelationshipStatistics(relationships),
      },
    };
  }

  /**
   * 获取单个关系详情
   */
  async findOne(userId: string, novelId: string, id: string) {
    const relationship = await this.prisma.characterRelationship.findFirst({
      where: {
        id,
        novelId,
      },
      include: {
        sourceCharacter: true,
        targetCharacter: true,
      },
    });

    if (!relationship) {
      throw new NotFoundException('关系不存在');
    }

    // 验证所有权
    await this.validateNovelOwnership(userId, novelId);

    return relationship;
  }

  /**
   * 更新角色关系
   */
  async update(userId: string, novelId: string, id: string, updateDto: UpdateCharacterRelationshipDto) {
    // 验证关系存在
    await this.findOne(userId, novelId, id);

    return this.prisma.characterRelationship.update({
      where: { id },
      data: updateDto,
      include: {
        sourceCharacter: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        targetCharacter: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  /**
   * 删除角色关系
   */
  async remove(userId: string, novelId: string, id: string) {
    // 验证关系存在
    await this.findOne(userId, novelId, id);

    await this.prisma.characterRelationship.delete({
      where: { id },
    });
  }

  /**
   * 批量创建关系
   */
  async createBatch(userId: string, novelId: string, relationships: CreateCharacterRelationshipDto[]) {
    // 验证小说所有权
    await this.validateNovelOwnership(userId, novelId);

    // 批量创建
    const created = await this.prisma.$transaction(
      relationships.map(dto =>
        this.prisma.characterRelationship.create({
          data: {
            ...dto,
            novelId,
          },
        })
      )
    );

    return created;
  }

  // ========== 辅助方法 ==========

  private async validateNovelOwnership(userId: string, novelId: string) {
    const novel = await this.prisma.novel.findFirst({
      where: { id: novelId, userId },
    });

    if (!novel) {
      throw new NotFoundException('小说不存在或无权访问');
    }

    return novel;
  }

  private async validateCharacterOwnership(userId: string, novelId: string, characterId: string) {
    const character = await this.prisma.character.findFirst({
      where: {
        id: characterId,
        novelId,
      },
    });

    if (!character) {
      throw new NotFoundException(`角色不存在: ${characterId}`);
    }

    return character;
  }

  private getRelationLabel(type: string): string {
    const labels = {
      friend: '朋友',
      enemy: '敌人',
      family: '家人',
      lover: '恋人',
      colleague: '同事',
      mentor: '师徒',
      rival: '对手',
    };
    return labels[type] || type;
  }

  private getRelationColor(type: string): string {
    const colors = {
      friend: '#67C23A', // 绿色
      enemy: '#F56C6C', // 红色
      family: '#409EFF', // 蓝色
      lover: '#E6A23C', // 橙色
      colleague: '#909399', // 灰色
      mentor: '#9B59B6', // 紫色
      rival: '#E74C3C', // 深红
    };
    return colors[type] || '#909399';
  }

  private getRelationshipStatistics(relationships: any[]) {
    const stats: Record<string, number> = {};
    
    relationships.forEach(rel => {
      stats[rel.relationType] = (stats[rel.relationType] || 0) + 1;
    });

    return stats;
  }
}
```

### 3. Controller 实现

#### character-relationship.controller.ts

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/common';
import { CharacterRelationshipService } from './character-relationship.service';
import { CreateCharacterRelationshipDto } from './dto/create-character-relationship.dto';
import { UpdateCharacterRelationshipDto } from './dto/update-character-relationship.dto';
import { QueryCharacterRelationshipDto } from './dto/query-character-relationship.dto';

@ApiTags('角色关系管理')
@Controller()  // ⚠️ 不添加前缀
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CharacterRelationshipController {
  constructor(
    private readonly relationshipService: CharacterRelationshipService
  ) {}

  @Post('novels/:novelId/character-relationships')
  @ApiOperation({ summary: '创建角色关系' })
  @ApiParam({ name: 'novelId', description: '小说ID' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '参数验证失败' })
  @ApiResponse({ status: 404, description: '小说或角色不存在' })
  async create(
    @Request() req,
    @Param('novelId') novelId: string,
    @Body(ValidationPipe) createDto: CreateCharacterRelationshipDto,
  ) {
    return this.relationshipService.create(req.user.id, novelId, createDto);
  }

  @Get('novels/:novelId/character-relationships')
  @ApiOperation({ summary: '获取角色关系列表' })
  @ApiParam({ name: 'novelId', description: '小说ID' })
  @ApiQuery({ name: 'relationType', required: false, enum: ['friend', 'enemy', 'family', 'lover', 'colleague', 'mentor', 'rival'] })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'broken', 'changed'] })
  @ApiQuery({ name: 'characterId', required: false, description: '特定角色ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(
    @Request() req,
    @Param('novelId') novelId: string,
    @Query() queryDto: QueryCharacterRelationshipDto,
  ) {
    return this.relationshipService.findAll(req.user.id, novelId, queryDto);
  }

  @Get('novels/:novelId/character-relationships/network')
  @ApiOperation({ summary: '获取角色关系网络图数据' })
  @ApiParam({ name: 'novelId', description: '小说ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getNetworkData(
    @Request() req,
    @Param('novelId') novelId: string,
  ) {
    return this.relationshipService.getNetworkData(req.user.id, novelId);
  }

  @Get('novels/:novelId/character-relationships/:id')
  @ApiOperation({ summary: '获取角色关系详情' })
  @ApiParam({ name: 'novelId', description: '小说ID' })
  @ApiParam({ name: 'id', description: '关系ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '关系不存在' })
  async findOne(
    @Request() req,
    @Param('novelId') novelId: string,
    @Param('id') id: string,
  ) {
    return this.relationshipService.findOne(req.user.id, novelId, id);
  }

  @Patch('novels/:novelId/character-relationships/:id')
  @ApiOperation({ summary: '更新角色关系' })
  @ApiParam({ name: 'novelId', description: '小说ID' })
  @ApiParam({ name: 'id', description: '关系ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(
    @Request() req,
    @Param('novelId') novelId: string,
    @Param('id') id: string,
    @Body(ValidationPipe) updateDto: UpdateCharacterRelationshipDto,
  ) {
    return this.relationshipService.update(req.user.id, novelId, id, updateDto);
  }

  @Delete('novels/:novelId/character-relationships/:id')
  @ApiOperation({ summary: '删除角色关系' })
  @ApiParam({ name: 'novelId', description: '小说ID' })
  @ApiParam({ name: 'id', description: '关系ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @HttpCode(HttpStatus.OK)  // ⚠️ 必须添加
  async remove(
    @Request() req,
    @Param('novelId') novelId: string,
    @Param('id') id: string,
  ) {
    await this.relationshipService.remove(req.user.id, novelId, id);
    return { message: '删除成功' };
  }

  @Post('novels/:novelId/character-relationships/batch')
  @ApiOperation({ summary: '批量创建角色关系' })
  @ApiParam({ name: 'novelId', description: '小说ID' })
  @ApiResponse({ status: 201, description: '批量创建成功' })
  @HttpCode(HttpStatus.CREATED)
  async createBatch(
    @Request() req,
    @Param('novelId') novelId: string,
    @Body(ValidationPipe) relationships: CreateCharacterRelationshipDto[],
  ) {
    return this.relationshipService.createBatch(req.user.id, novelId, relationships);
  }
}
```

### 4. Module 配置

#### character-relationship.module.ts

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DatabaseModule } from '@app/database';
import { CharacterRelationshipController } from './character-relationship.controller';
import { CharacterRelationshipService } from './character-relationship.service';
import { JwtStrategy } from '../../strategies/jwt.strategy';

@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    JwtModule,
  ],
  controllers: [CharacterRelationshipController],
  providers: [CharacterRelationshipService, JwtStrategy],
  exports: [CharacterRelationshipService],
})
export class CharacterRelationshipModule {}
```

---

## 🎨 前端实现

### 文件结构

```
src/
├── components/
│   └── character-network/
│       ├── CharacterNetworkGraph.vue (核心网络图组件)
│       ├── RelationshipEditDialog.vue (关系编辑对话框)
│       └── NetworkStatistics.vue (网络统计面板)
├── services/
│   └── characterRelationshipService.js
└── views/
    └── NovelCharacterNetwork.vue (完整页面)
```

### 实现代码见下一个文件...

---

## 📝 接口规范检查清单

### ✅ 已遵循的规范

- [x] Controller 使用 `@Controller()` 不带前缀
- [x] 所有接口添加 `@UseGuards(JwtAuthGuard)` 和 `@ApiBearerAuth('JWT-auth')`
- [x] DTO 所有字段都有验证装饰器
- [x] 所有方法添加 `@ApiOperation()` 和 `@ApiResponse()`
- [x] DELETE 请求添加 `@HttpCode(HttpStatus.OK)`
- [x] 路径参数使用 `@ApiParam()` 描述
- [x] 查询参数使用 `@ApiQuery()` 描述
- [x] 使用 `@Body(ValidationPipe)` 验证请求体
- [x] 从 `req.user.id` 获取当前用户ID
- [x] 完整的错误处理（NotFoundException, BadRequestException等）
- [x] Service 层验证所有权限

---

## 🧪 测试计划

### API 测试用例

```bash
# 1. 创建关系
POST /api/v1/novels/{novelId}/character-relationships
Authorization: Bearer <token>
{
  "sourceCharacterId": "char1",
  "targetCharacterId": "char2",
  "relationType": "friend",
  "strength": 8,
  "description": "青梅竹马"
}

# 2. 获取网络图数据
GET /api/v1/novels/{novelId}/character-relationships/network
Authorization: Bearer <token>

# 3. 更新关系
PATCH /api/v1/novels/{novelId}/character-relationships/{id}
Authorization: Bearer <token>
{
  "strength": 9,
  "status": "changed"
}

# 4. 删除关系
DELETE /api/v1/novels/{novelId}/character-relationships/{id}
Authorization: Bearer <token>
```

---

## 📊 下一步

1. ✅ 完成后端代码实现
2. ⏳ 实现前端可视化组件
3. ⏳ 集成到 WriterCharacterPanel
4. ⏳ 编写测试用例
5. ⏳ 文档和示例

---

**状态**: 🚀 后端实施方案完成，准备前端开发  
**预计完成时间**: Week 1-2  
**责任人**: 开发团队

