# 批量视频生成数据库迁移

## 概述

本次迁移添加了批量视频生成功能所需的数据库表和枚举类型。

## 新增内容

### 1. 新增表：video_batch_generations

存储批量视频生成任务的信息。

**字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(191) | 主键 |
| novel_id | VARCHAR(191) | 小说ID |
| user_id | VARCHAR(191) | 用户ID |
| chapter_ids | JSON | 章节ID数组 |
| total_chapters | INT | 总章节数 |
| estimated_duration | INT | 预估总时长(秒) |
| estimated_scenes | INT | 预估总分镜数 |
| actual_duration | INT | 实际总时长(秒) |
| status | ENUM | 批量生成状态 |
| merge_into_one | BOOLEAN | 是否合并为长视频 |
| merged_video_url | VARCHAR(500) | 合并后的视频URL |
| settings | JSON | 视频生成设置 |
| ai_reasoning | TEXT | AI规划说明 |
| started_at | DATETIME | 开始时间 |
| completed_at | DATETIME | 完成时间 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### 2. 新增枚举：BatchVideoStatus

批量视频生成状态：
- `PENDING` - 待处理
- `PROCESSING` - 处理中
- `COMPLETED` - 已完成
- `FAILED` - 失败
- `CANCELLED` - 已取消

### 3. 索引

为提升查询性能，创建了以下索引：
- `idx_novel_id` - 按小说ID查询
- `idx_user_id` - 按用户ID查询
- `idx_status` - 按状态查询
- `idx_created_at` - 按创建时间查询
- `idx_novel_user` - 组合索引（小说+用户）
- `idx_status_created` - 组合索引（状态+时间）

## 执行迁移

### 方式1：使用Prisma CLI（推荐）

```bash
# 1. 确保数据库连接正确
# 检查 .env 文件中的 DATABASE_URL

# 2. 生成Prisma Client
npx prisma generate

# 3. 执行迁移
npx prisma migrate deploy
```

### 方式2：手动执行SQL

如果Prisma迁移失败，可以手动执行：

```bash
# 连接数据库
mysql -u your_username -p your_database

# 执行SQL文件
source prisma/migrations/add_batch_video_generation.sql;
```

### 方式3：使用数据库工具

使用 Navicat、DBeaver 等工具，直接执行 `add_batch_video_generation.sql` 文件。

## 验证迁移

执行迁移后，验证表是否创建成功：

```sql
-- 检查表是否存在
SHOW TABLES LIKE 'video_batch_generations';

-- 查看表结构
DESC video_batch_generations;

-- 检查索引
SHOW INDEX FROM video_batch_generations;
```

## 回滚迁移

如需回滚：

```sql
-- 删除表
DROP TABLE IF EXISTS video_batch_generations;
```

**警告**：回滚将删除所有批量生成任务数据！

## 数据兼容性

### 向后兼容

✅ 本次迁移不影响现有功能
✅ 现有的单章节视频生成功能继续正常工作
✅ 新增的批量功能是独立的增强功能

### 依赖关系

本迁移依赖以下表：
- `novels` - 小说表（外键）
- `users` - 用户表（外键）
- `chapters` - 章节表（业务逻辑依赖）

## 注意事项

1. **数据库字符集**：确保使用 `utf8mb4` 以支持中文
2. **JSON字段**：MySQL 5.7.8+ 才支持JSON类型
3. **外键约束**：设置了级联删除，删除小说或用户时会自动清理相关批量任务
4. **枚举类型**：MySQL的ENUM类型有限制，建议使用VARCHAR并在应用层验证

## 性能建议

1. **定期清理**：定期清理超过30天的已完成任务
2. **索引优化**：根据实际查询模式调整索引
3. **分区**：数据量大时可以考虑按时间分区

## 相关文档

- [批量视频生成使用指南](../../docs/BATCH-VIDEO-GENERATION-GUIDE.md)
- [实施总结](../../docs/BATCH-VIDEO-IMPLEMENTATION-SUMMARY.md)

---

**创建时间**：2025-10-23
**版本**：1.0.0

