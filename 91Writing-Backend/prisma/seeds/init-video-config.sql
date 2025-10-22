-- 初始化视频API配置
INSERT INTO `video_api_configs` (
  `id`,
  `video_provider`,
  `ffmpeg_path`,
  `ffmpeg_preset`,
  `video_storage_path`,
  `temp_storage_path`,
  `auto_clean_temp`,
  `user_daily_quota`,
  `user_monthly_quota`,
  `monthly_budget`,
  `cost_alert_threshold`,
  `cost_per_image`,
  `cost_per_video`,
  `is_active`,
  `created_at`,
  `updated_at`
) VALUES (
  'default_config',
  'jimeng',
  '/usr/bin/ffmpeg',
  'medium',
  '/data/videos',
  '/tmp/video-generation',
  1,
  5,
  50,
  1000.0,
  800.0,
  0.02,
  1.5,
  1,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE
  `updated_at` = NOW();

