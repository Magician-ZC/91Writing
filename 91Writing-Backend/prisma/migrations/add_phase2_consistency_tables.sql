-- Phase 2: 世界观一致性检测和角色一致性助手
-- 创建时间: 2025-10-21

-- =============================================
-- 1. 一致性检测记录表
-- =============================================
CREATE TABLE `ConsistencyCheck` (
  `id` VARCHAR(191) NOT NULL,
  `novelId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `checkType` VARCHAR(50) NOT NULL COMMENT 'worldview, character, timeline, full',
  `status` VARCHAR(50) NOT NULL DEFAULT 'pending' COMMENT 'pending, processing, completed, failed',
  `chapterIds` JSON NULL COMMENT '检测的章节ID列表',
  `totalIssues` INT NOT NULL DEFAULT 0,
  `criticalIssues` INT NOT NULL DEFAULT 0,
  `warningIssues` INT NOT NULL DEFAULT 0,
  `startedAt` DATETIME(3) NULL,
  `completedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  
  PRIMARY KEY (`id`),
  INDEX `ConsistencyCheck_novelId_idx` (`novelId`),
  INDEX `ConsistencyCheck_userId_idx` (`userId`),
  INDEX `ConsistencyCheck_status_idx` (`status`),
  
  CONSTRAINT `ConsistencyCheck_novelId_fkey` FOREIGN KEY (`novelId`) 
    REFERENCES `Novel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ConsistencyCheck_userId_fkey` FOREIGN KEY (`userId`) 
    REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 2. 一致性问题表
-- =============================================
CREATE TABLE `ConsistencyIssue` (
  `id` VARCHAR(191) NOT NULL,
  `checkId` VARCHAR(191) NOT NULL,
  `category` VARCHAR(50) NOT NULL COMMENT 'worldview, character, timeline, logic, setting',
  `severity` VARCHAR(20) NOT NULL COMMENT 'critical, warning, info',
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NOT NULL,
  `chapterId` VARCHAR(191) NULL,
  `chapterNumber` INT NULL,
  `locationText` TEXT NULL COMMENT '具体文本位置',
  `conflictWith` TEXT NULL COMMENT '与哪个设定/章节冲突',
  `suggestions` JSON NULL COMMENT '修复建议列表',
  `aiConfidence` DECIMAL(3,2) NULL COMMENT 'AI置信度 0-1',
  `status` VARCHAR(50) NOT NULL DEFAULT 'unresolved' COMMENT 'unresolved, resolved, ignored, false_positive',
  `userNote` TEXT NULL,
  `resolvedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  
  PRIMARY KEY (`id`),
  INDEX `ConsistencyIssue_checkId_idx` (`checkId`),
  INDEX `ConsistencyIssue_category_idx` (`category`),
  INDEX `ConsistencyIssue_severity_idx` (`severity`),
  INDEX `ConsistencyIssue_status_idx` (`status`),
  INDEX `ConsistencyIssue_chapterId_idx` (`chapterId`),
  
  CONSTRAINT `ConsistencyIssue_checkId_fkey` FOREIGN KEY (`checkId`) 
    REFERENCES `ConsistencyCheck`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ConsistencyIssue_chapterId_fkey` FOREIGN KEY (`chapterId`) 
    REFERENCES `Chapter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 3. 世界观规则库表
-- =============================================
CREATE TABLE `WorldviewRule` (
  `id` VARCHAR(191) NOT NULL,
  `novelId` VARCHAR(191) NOT NULL,
  `ruleType` VARCHAR(50) NOT NULL COMMENT 'magic_system, power_level, geography, currency, custom',
  `ruleName` VARCHAR(100) NOT NULL,
  `ruleContent` TEXT NOT NULL,
  `parameters` JSON NULL COMMENT '规则参数',
  `extractedFrom` VARCHAR(50) NULL COMMENT 'manual, ai_extracted, world_setting',
  `sourceChapterId` VARCHAR(191) NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  
  PRIMARY KEY (`id`),
  INDEX `WorldviewRule_novelId_idx` (`novelId`),
  INDEX `WorldviewRule_ruleType_idx` (`ruleType`),
  INDEX `WorldviewRule_sourceChapterId_idx` (`sourceChapterId`),
  
  CONSTRAINT `WorldviewRule_novelId_fkey` FOREIGN KEY (`novelId`) 
    REFERENCES `Novel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `WorldviewRule_sourceChapterId_fkey` FOREIGN KEY (`sourceChapterId`) 
    REFERENCES `Chapter`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 4. 时间线事件表
-- =============================================
CREATE TABLE `TimelineEvent` (
  `id` VARCHAR(191) NOT NULL,
  `novelId` VARCHAR(191) NOT NULL,
  `eventName` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `chapterNumber` INT NOT NULL,
  `eventOrder` INT NOT NULL COMMENT '章节内的事件顺序',
  `timeExpression` VARCHAR(500) NULL COMMENT '时间描述',
  `estimatedDays` INT NULL COMMENT '估算的天数',
  `chapterId` VARCHAR(191) NOT NULL,
  `involvedCharacters` JSON NULL COMMENT '涉及角色ID列表',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  
  PRIMARY KEY (`id`),
  INDEX `TimelineEvent_novelId_idx` (`novelId`),
  INDEX `TimelineEvent_chapterId_idx` (`chapterId`),
  UNIQUE INDEX `TimelineEvent_novelId_chapterNumber_eventOrder_key` (`novelId`, `chapterNumber`, `eventOrder`),
  
  CONSTRAINT `TimelineEvent_novelId_fkey` FOREIGN KEY (`novelId`) 
    REFERENCES `Novel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `TimelineEvent_chapterId_fkey` FOREIGN KEY (`chapterId`) 
    REFERENCES `Chapter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 5. 角色特征库表
-- =============================================
CREATE TABLE `CharacterFeature` (
  `id` VARCHAR(191) NOT NULL,
  `characterId` VARCHAR(191) NOT NULL,
  `featureType` VARCHAR(50) NOT NULL COMMENT 'appearance, personality, behavior, speech, relationship',
  `featureName` VARCHAR(100) NOT NULL,
  `featureValue` TEXT NOT NULL,
  `extractedFrom` VARCHAR(50) NOT NULL COMMENT 'manual, ai_extracted',
  `sourceChapterId` VARCHAR(191) NULL,
  `locationInText` TEXT NULL,
  `confidence` DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  `isConfirmed` BOOLEAN NOT NULL DEFAULT FALSE,
  `firstMentioned` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `lastUpdated` DATETIME(3) NOT NULL,
  
  PRIMARY KEY (`id`),
  INDEX `CharacterFeature_characterId_idx` (`characterId`),
  INDEX `CharacterFeature_featureType_idx` (`featureType`),
  INDEX `CharacterFeature_sourceChapterId_idx` (`sourceChapterId`),
  
  CONSTRAINT `CharacterFeature_characterId_fkey` FOREIGN KEY (`characterId`) 
    REFERENCES `Character`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `CharacterFeature_sourceChapterId_fkey` FOREIGN KEY (`sourceChapterId`) 
    REFERENCES `Chapter`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 6. 角色出场记录表
-- =============================================
CREATE TABLE `CharacterAppearance` (
  `id` VARCHAR(191) NOT NULL,
  `characterId` VARCHAR(191) NOT NULL,
  `chapterId` VARCHAR(191) NOT NULL,
  `mentionCount` INT NOT NULL DEFAULT 0,
  `dialogueCount` INT NOT NULL DEFAULT 0,
  `actionCount` INT NOT NULL DEFAULT 0,
  `emotionalState` VARCHAR(50) NULL COMMENT 'happy, angry, sad, neutral',
  `majorActions` JSON NULL COMMENT '主要行动列表',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  
  PRIMARY KEY (`id`),
  INDEX `CharacterAppearance_characterId_idx` (`characterId`),
  INDEX `CharacterAppearance_chapterId_idx` (`chapterId`),
  UNIQUE INDEX `CharacterAppearance_characterId_chapterId_key` (`characterId`, `chapterId`),
  
  CONSTRAINT `CharacterAppearance_characterId_fkey` FOREIGN KEY (`characterId`) 
    REFERENCES `Character`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `CharacterAppearance_chapterId_fkey` FOREIGN KEY (`chapterId`) 
    REFERENCES `Chapter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 7. 角色一致性警告表
-- =============================================
CREATE TABLE `CharacterConsistencyWarning` (
  `id` VARCHAR(191) NOT NULL,
  `characterId` VARCHAR(191) NOT NULL,
  `warningType` VARCHAR(50) NOT NULL COMMENT 'appearance_change, personality_conflict, behavior_inconsistent',
  `severity` VARCHAR(20) NOT NULL COMMENT 'high, medium, low',
  `description` TEXT NOT NULL,
  `suggestion` TEXT NULL,
  `chapterId` VARCHAR(191) NOT NULL,
  `locationText` TEXT NULL,
  `conflictWith` TEXT NULL COMMENT '与哪个特征冲突',
  `status` VARCHAR(50) NOT NULL DEFAULT 'active' COMMENT 'active, resolved, ignored',
  `resolvedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  
  PRIMARY KEY (`id`),
  INDEX `CharacterConsistencyWarning_characterId_idx` (`characterId`),
  INDEX `CharacterConsistencyWarning_status_idx` (`status`),
  INDEX `CharacterConsistencyWarning_chapterId_idx` (`chapterId`),
  
  CONSTRAINT `CharacterConsistencyWarning_characterId_fkey` FOREIGN KEY (`characterId`) 
    REFERENCES `Character`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `CharacterConsistencyWarning_chapterId_fkey` FOREIGN KEY (`chapterId`) 
    REFERENCES `Chapter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 添加说明注释
-- =============================================
-- Phase 2 包含 7 个新表:
-- 1. ConsistencyCheck - 一致性检测记录
-- 2. ConsistencyIssue - 检测到的问题
-- 3. WorldviewRule - 世界观规则库
-- 4. TimelineEvent - 时间线事件
-- 5. CharacterFeature - 角色特征库
-- 6. CharacterAppearance - 角色出场记录
-- 7. CharacterConsistencyWarning - 角色一致性警告

-- 索引说明:
-- - 所有表都有主键索引
-- - 外键字段都有索引
-- - 查询频繁的字段添加了索引
-- - 组合唯一索引确保数据唯一性

