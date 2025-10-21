-- =========================================
-- 更新现有套餐为新的features格式
-- =========================================
-- 执行时间: 2025-01-21
-- 用途: 将旧的字符串标签格式转为结构化JSON格式
--
-- 使用方法:
-- mysql -u root -p writing_platform < prisma/seeds/update-packages-to-new-format.sql
-- =========================================

-- 更新基础版套餐（如果存在）
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
    'monthlyQuota', 5000,
    'maxWordsPerRequest', 2000,
    'models', JSON_ARRAY('gpt-3.5', 'gpt-4')
  ),
  'aiAssistant', JSON_OBJECT(
    'enabled', TRUE,
    'dailyQuota', 200,
    'monthlyQuota', 2000,
    'maxConcurrentSessions', 5,
    'historyRetentionDays', 30
  ),
  'materialGeneration', JSON_OBJECT(
    'enabled', TRUE,
    'dailyQuota', 50,
    'monthlyQuota', 500,
    'allowedTypes', JSON_ARRAY('character', 'scene', 'plot')
  ),
  'storage', JSON_OBJECT(
    'quotaGB', 20,
    'maxFileSizeMB', 50,
    'allowedFileTypes', JSON_ARRAY('image', 'document')
  ),
  'collaboration', JSON_OBJECT(
    'enabled', TRUE,
    'maxCollaborators', 3,
    'allowedRoles', JSON_ARRAY('VIEWER', 'COMMENTER')
  ),
  'other', JSON_OBJECT(
    'enableExport', TRUE,
    'enableBackup', FALSE,
    'enableAPI', FALSE,
    'prioritySupport', FALSE
  )
)
WHERE name = '基础版' OR name LIKE '%基础%' OR (price >= 35 AND price <= 60);

-- 更新专业版套餐
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
    'monthlyQuota', 20000,
    'maxWordsPerRequest', 3000,
    'models', JSON_ARRAY('gpt-3.5', 'gpt-4', 'claude-3')
  ),
  'aiAssistant', JSON_OBJECT(
    'enabled', TRUE,
    'dailyQuota', -1,
    'monthlyQuota', -1,
    'maxConcurrentSessions', 10,
    'historyRetentionDays', 90
  ),
  'materialGeneration', JSON_OBJECT(
    'enabled', TRUE,
    'dailyQuota', 200,
    'monthlyQuota', 2000,
    'allowedTypes', JSON_ARRAY('character', 'scene', 'plot', 'dialogue')
  ),
  'storage', JSON_OBJECT(
    'quotaGB', 100,
    'maxFileSizeMB', 100,
    'allowedFileTypes', JSON_ARRAY('image', 'document', 'audio')
  ),
  'collaboration', JSON_OBJECT(
    'enabled', TRUE,
    'maxCollaborators', 10,
    'allowedRoles', JSON_ARRAY('VIEWER', 'COMMENTER', 'EDITOR')
  ),
  'other', JSON_OBJECT(
    'enableExport', TRUE,
    'enableBackup', TRUE,
    'enableAPI', FALSE,
    'prioritySupport', TRUE
  )
)
WHERE name = '专业版' OR name LIKE '%专业%' OR (price >= 35 AND price <= 60);

-- 更新创作家版/企业版套餐
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
    'monthlyQuota', -1,
    'maxWordsPerRequest', 5000,
    'models', JSON_ARRAY('gpt-3.5', 'gpt-4', 'claude-3', 'deepseek')
  ),
  'aiAssistant', JSON_OBJECT(
    'enabled', TRUE,
    'dailyQuota', -1,
    'monthlyQuota', -1,
    'maxConcurrentSessions', 20,
    'historyRetentionDays', 365
  ),
  'materialGeneration', JSON_OBJECT(
    'enabled', TRUE,
    'dailyQuota', -1,
    'monthlyQuota', -1,
    'allowedTypes', JSON_ARRAY('character', 'scene', 'plot', 'dialogue')
  ),
  'storage', JSON_OBJECT(
    'quotaGB', 500,
    'maxFileSizeMB', 500,
    'allowedFileTypes', JSON_ARRAY('image', 'document', 'audio', 'video')
  ),
  'collaboration', JSON_OBJECT(
    'enabled', TRUE,
    'maxCollaborators', 50,
    'allowedRoles', JSON_ARRAY('VIEWER', 'COMMENTER', 'EDITOR')
  ),
  'other', JSON_OBJECT(
    'enableExport', TRUE,
    'enableBackup', TRUE,
    'enableAPI', TRUE,
    'prioritySupport', TRUE
  )
)
WHERE name LIKE '%创作%' OR name LIKE '%企业%' OR price >= 90;

-- 更新免费版套餐（如果存在）
UPDATE packages 
SET features = JSON_OBJECT(
  'videoGeneration', JSON_OBJECT(
    'enabled', FALSE,
    'dailyQuota', 0,
    'monthlyQuota', 0
  ),
  'aiWriting', JSON_OBJECT(
    'enabled', TRUE,
    'dailyQuota', 100,
    'monthlyQuota', 1000,
    'maxWordsPerRequest', 1000,
    'models', JSON_ARRAY('gpt-3.5')
  ),
  'aiAssistant', JSON_OBJECT(
    'enabled', TRUE,
    'dailyQuota', 50,
    'monthlyQuota', 500,
    'maxConcurrentSessions', 2,
    'historyRetentionDays', 7
  ),
  'materialGeneration', JSON_OBJECT(
    'enabled', TRUE,
    'dailyQuota', 10,
    'monthlyQuota', 100,
    'allowedTypes', JSON_ARRAY('character')
  ),
  'storage', JSON_OBJECT(
    'quotaGB', 5,
    'maxFileSizeMB', 10,
    'allowedFileTypes', JSON_ARRAY('image')
  ),
  'collaboration', JSON_OBJECT(
    'enabled', FALSE,
    'maxCollaborators', 0,
    'allowedRoles', JSON_ARRAY()
  ),
  'other', JSON_OBJECT(
    'enableExport', FALSE,
    'enableBackup', FALSE,
    'enableAPI', FALSE,
    'prioritySupport', FALSE
  )
)
WHERE name = '免费版' OR name LIKE '%免费%' OR price = 0;

-- 显示更新结果
SELECT '套餐features已更新为新格式' AS 'Status';
SELECT name, price, 
       JSON_EXTRACT(features, '$.videoGeneration.enabled') AS video_enabled,
       JSON_EXTRACT(features, '$.videoGeneration.dailyQuota') AS video_daily,
       JSON_EXTRACT(features, '$.aiWriting.dailyQuota') AS ai_writing_daily
FROM packages
ORDER BY price ASC;

