-- =========================================
-- 角色特征自动提取系统初始化
-- =========================================
-- 执行时间: 2025-01-21
-- 用途: 初始化角色特征自动提取系统
--
-- 使用方法:
-- 1. 先执行数据库迁移: npx prisma migrate dev --name add_character_feature
-- 2. 然后执行此SQL: mysql -u root -p 91writing < prisma/seeds/character-feature.seed.sql
-- =========================================

-- 更新现有的一致性配置，启用自动管理
UPDATE consistency_profiles 
SET 
  auto_extracted = FALSE,
  auto_update = TRUE,
  last_extracted_at = NULL,
  update_history = NULL
WHERE auto_extracted IS NULL;

-- 显示结果
SELECT '角色特征自动提取系统已初始化' AS 'Status';
SELECT COUNT(*) AS 'Updated Profiles' FROM consistency_profiles WHERE auto_update = TRUE;

