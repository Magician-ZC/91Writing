-- =========================================
-- 视频API配置初始化种子数据
-- =========================================
-- 执行时间: 2025-01-21
-- 用途: 初始化视频生成系统的API配置
--
-- 使用方法:
-- 1. 先执行数据库迁移: npx prisma migrate dev --name add_video_api_config
-- 2. 然后执行此SQL: mysql -u root -p 91writing < prisma/seeds/video-api-config.seed.sql
-- =========================================

-- 插入默认视频API配置
INSERT INTO video_api_configs (
  id,
  volcengine_access_key_id,
  volcengine_secret_access_key,
  jimeng_api_key,
  kling_api_key,
  video_provider,
  ffmpeg_path,
  video_storage_path,
  temp_storage_path,
  user_daily_quota,
  user_monthly_quota,
  monthly_budget,
  cost_alert_threshold,
  is_active,
  health_status,
  created_at,
  updated_at
) VALUES (
  'default_config',
  NULL,  -- 需要在管理后台配置
  NULL,  -- 需要在管理后台配置（加密存储）
  NULL,  -- 需要在管理后台配置（加密存储）
  NULL,  -- 需要在管理后台配置（加密存储）
  'jimeng',
  '/usr/bin/ffmpeg',
  '/data/videos',
  '/tmp/video-generation',
  5,     -- 每日5个视频
  50,    -- 每月50个视频
  1000.0,  -- 月度预算1000元
  800.0,   -- 警报阈值800元
  TRUE,
  'healthy',
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE
  updated_at = NOW();

-- 显示插入结果
SELECT '默认视频API配置已初始化' AS 'Status';
SELECT * FROM video_api_configs WHERE id = 'default_config';

