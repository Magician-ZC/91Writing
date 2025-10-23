-- 批量视频生成迁移脚本
-- 创建时间: 2025-10-23

-- 创建批量视频生成状态枚举（如果不存在）
-- 注意：MySQL不支持ENUM类型的ALTER，需要在应用层处理

-- 创建批量视频生成表
CREATE TABLE IF NOT EXISTS `video_batch_generations` (
  `id` VARCHAR(191) NOT NULL,
  `novel_id` VARCHAR(191) NOT NULL,
  `user_id` VARCHAR(191) NOT NULL,
  `chapter_ids` JSON NOT NULL COMMENT '章节ID数组',
  `total_chapters` INT NOT NULL COMMENT '总章节数',
  `estimated_duration` INT NOT NULL COMMENT '预估总时长(秒)',
  `estimated_scenes` INT NOT NULL COMMENT '预估总分镜数',
  `actual_duration` INT NULL COMMENT '实际总时长(秒)',
  `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING' COMMENT '批量生成状态',
  `merge_into_one` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否合并为一个长视频',
  `merged_video_url` VARCHAR(500) NULL COMMENT '合并后的视频URL',
  `settings` JSON NULL COMMENT '视频生成设置',
  `ai_reasoning` TEXT NULL COMMENT 'AI规划说明',
  `started_at` DATETIME(3) NULL COMMENT '开始时间',
  `completed_at` DATETIME(3) NULL COMMENT '完成时间',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  
  PRIMARY KEY (`id`),
  INDEX `idx_novel_id` (`novel_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`),
  
  CONSTRAINT `fk_video_batch_novel` FOREIGN KEY (`novel_id`) REFERENCES `novels`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_video_batch_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='批量视频生成记录表';

-- 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS `idx_novel_user` ON `video_batch_generations`(`novel_id`, `user_id`);
CREATE INDEX IF NOT EXISTS `idx_status_created` ON `video_batch_generations`(`status`, `created_at`);

