-- =========================================
-- 视频生成完整配置初始化
-- =========================================
-- 执行时间: 2025-01-21
-- 用途: 初始化视频生成系统的完整配置参数
--
-- 使用方法:
-- mysql -u root -p writing_platform < prisma/seeds/video-complete-config.seed.sql
-- =========================================

-- 更新video_api_configs表，添加完整的配置参数
UPDATE video_api_configs 
SET 
  -- 文生图配置
  image_gen_config = JSON_OBJECT(
    'defaultResolution', '1024x576',
    'quality', 'standard',
    'batchSize', 1,
    'samplingSteps', 30,
    'cfgScale', 7.5,
    'defaultStyle', 'realistic',
    'globalNegativePrompt', 'blurry, low quality, distorted, deformed, disfigured, ugly, bad anatomy, bad proportions, duplicate, watermark, signature, text',
    'enableConsistency', TRUE,
    'randomSeed', TRUE,
    'seedValue', 42,
    'timeout', 60
  ),
  
  -- 图生视频配置
  video_gen_config = JSON_OBJECT(
    'defaultDuration', 5,
    'resolution', '1024x576',
    'fps', 30,
    'defaultMotionIntensity', 'medium',
    'quality', 'high',
    'compressionLevel', 'medium',
    'transitionEffect', 'fade',
    'transitionDuration', 0.5,
    'timeout', 120,
    'maxRetries', 2,
    'enableCharacterConsistency', TRUE
  ),
  
  -- 默认生成配置
  default_gen_config = JSON_OBJECT(
    'defaultSceneCount', 5,
    'minSceneWords', 100,
    'defaultTotalDuration', 30,
    'addTitleFrame', TRUE,
    'titleFrameDuration', 2,
    'enableBackgroundMusic', FALSE,
    'musicType', 'light',
    'musicVolume', 30
  ),
  
  -- 性能配置
  performance_config = JSON_OBJECT(
    'maxConcurrentTasks', 3,
    'imageGenConcurrency', 2,
    'videoGenConcurrency', 1,
    'enableCache', FALSE,
    'cacheExpiration', 24,
    'enableQueue', TRUE,
    'queuePriority', 'fifo'
  ),
  
  -- 成本配置
  cost_per_image = 0.02,
  cost_per_video = 1.5,
  
  -- FFmpeg配置
  ffmpeg_preset = 'medium',
  auto_clean_temp = TRUE,
  
  -- 更新时间
  updated_at = NOW()

WHERE id = 'default_config';

-- 如果default_config不存在，创建它
INSERT INTO video_api_configs (
  id,
  video_provider,
  ffmpeg_path,
  ffmpeg_preset,
  video_storage_path,
  temp_storage_path,
  auto_clean_temp,
  user_daily_quota,
  user_monthly_quota,
  monthly_budget,
  cost_alert_threshold,
  cost_per_image,
  cost_per_video,
  image_gen_config,
  video_gen_config,
  default_gen_config,
  performance_config,
  is_active,
  health_status,
  created_at,
  updated_at
)
SELECT
  'default_config',
  'jimeng',
  '/usr/bin/ffmpeg',
  'medium',
  '/data/videos',
  '/tmp/video-generation',
  TRUE,
  5,
  50,
  1000.0,
  800.0,
  0.02,
  1.5,
  JSON_OBJECT(
    'defaultResolution', '1024x576',
    'quality', 'standard',
    'batchSize', 1,
    'samplingSteps', 30,
    'cfgScale', 7.5,
    'defaultStyle', 'realistic',
    'globalNegativePrompt', 'blurry, low quality, distorted',
    'enableConsistency', TRUE,
    'timeout', 60
  ),
  JSON_OBJECT(
    'defaultDuration', 5,
    'resolution', '1024x576',
    'fps', 30,
    'defaultMotionIntensity', 'medium',
    'quality', 'high',
    'compressionLevel', 'medium',
    'transitionEffect', 'fade',
    'enableCharacterConsistency', TRUE
  ),
  JSON_OBJECT(
    'defaultSceneCount', 5,
    'defaultTotalDuration', 30,
    'addTitleFrame', TRUE
  ),
  JSON_OBJECT(
    'maxConcurrentTasks', 3,
    'imageGenConcurrency', 2,
    'videoGenConcurrency', 1,
    'enableQueue', TRUE
  ),
  TRUE,
  'healthy',
  NOW(),
  NOW()
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM video_api_configs WHERE id = 'default_config'
);

-- 显示结果
SELECT '视频生成完整配置已初始化' AS 'Status';
SELECT * FROM video_api_configs WHERE id = 'default_config' \G

