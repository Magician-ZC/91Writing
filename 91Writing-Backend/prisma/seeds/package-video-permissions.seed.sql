-- =========================================
-- 套餐视频生成权限初始化
-- =========================================
-- 执行时间: 2025-01-21
-- 用途: 为现有套餐添加视频生成权限配置
-- =========================================

-- 更新现有套餐的features字段，添加视频生成权限

-- 1. 免费套餐（如果存在）
UPDATE packages 
SET features = JSON_OBJECT(
  'videoGeneration', JSON_OBJECT(
    'enabled', FALSE,
    'dailyQuota', 0,
    'monthlyQuota', 0,
    'maxSceneCount', 0,
    'maxVideoDuration', 0,
    'allowedQualities', JSON_ARRAY(),
    'allowedResolutions', JSON_ARRAY(),
    'enableAdvancedParams', FALSE,
    'enableCustomPrompts', FALSE,
    'priority', 'low'
  ),
  'aiWriting', JSON_OBJECT(
    'enabled', TRUE,
    'dailyQuota', 100,
    'models', JSON_ARRAY('gpt-3.5')
  ),
  'storage', JSON_OBJECT(
    'quotaGB', 5
  )
)
WHERE name = '免费套餐' OR price = 0;

-- 2. 基础套餐（¥50/月）
UPDATE packages 
SET features = JSON_OBJECT(
  'videoGeneration', JSON_OBJECT(
    'enabled', TRUE,
    'dailyQuota', 2,
    'monthlyQuota', 10,
    'maxSceneCount', 5,
    'maxVideoDuration', 30,
    'allowedQualities', JSON_ARRAY('standard'),
    'allowedResolutions', JSON_ARRAY('1024x576'),
    'enableAdvancedParams', FALSE,
    'enableCustomPrompts', FALSE,
    'priority', 'low'
  ),
  'aiWriting', JSON_OBJECT(
    'enabled', TRUE,
    'dailyQuota', 500,
    'models', JSON_ARRAY('gpt-3.5', 'gpt-4')
  ),
  'storage', JSON_OBJECT(
    'quotaGB', 10
  )
)
WHERE name LIKE '%基础%' OR (price >= 40 AND price <= 60);

-- 3. 专业套餐（¥200/月）
UPDATE packages 
SET features = JSON_OBJECT(
  'videoGeneration', JSON_OBJECT(
    'enabled', TRUE,
    'dailyQuota', 5,
    'monthlyQuota', 50,
    'maxSceneCount', 8,
    'maxVideoDuration', 60,
    'allowedQualities', JSON_ARRAY('standard', 'high'),
    'allowedResolutions', JSON_ARRAY('1024x576', '1280x720'),
    'enableAdvancedParams', TRUE,
    'enableCustomPrompts', FALSE,
    'priority', 'normal'
  ),
  'aiWriting', JSON_OBJECT(
    'enabled', TRUE,
    'dailyQuota', 2000,
    'models', JSON_ARRAY('gpt-3.5', 'gpt-4', 'claude-3')
  ),
  'storage', JSON_OBJECT(
    'quotaGB', 50
  )
)
WHERE name LIKE '%专业%' OR (price >= 180 AND price <= 220);

-- 4. 企业套餐（¥500/月）
UPDATE packages 
SET features = JSON_OBJECT(
  'videoGeneration', JSON_OBJECT(
    'enabled', TRUE,
    'dailyQuota', 20,
    'monthlyQuota', 200,
    'maxSceneCount', 10,
    'maxVideoDuration', 120,
    'allowedQualities', JSON_ARRAY('standard', 'high', 'ultra'),
    'allowedResolutions', JSON_ARRAY('1024x576', '1280x720', '1920x1080'),
    'enableAdvancedParams', TRUE,
    'enableCustomPrompts', TRUE,
    'priority', 'high'
  ),
  'aiWriting', JSON_OBJECT(
    'enabled', TRUE,
    'dailyQuota', -1,
    'models', JSON_ARRAY('gpt-3.5', 'gpt-4', 'claude-3', 'deepseek')
  ),
  'storage', JSON_OBJECT(
    'quotaGB', 200
  )
)
WHERE name LIKE '%企业%' OR (price >= 450 AND price <= 550);

-- 显示更新结果
SELECT '套餐视频生成权限已初始化' AS 'Status';
SELECT name, price, features->'$.videoGeneration.enabled' AS video_enabled, 
       features->'$.videoGeneration.dailyQuota' AS daily_quota,
       features->'$.videoGeneration.monthlyQuota' AS monthly_quota
FROM packages
ORDER BY price ASC;

