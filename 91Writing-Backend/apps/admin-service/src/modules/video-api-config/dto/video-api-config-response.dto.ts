import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VideoAPIConfigResponseDto {
  @ApiProperty({ description: '配置ID' })
  id: string;

  @ApiPropertyOptional({ description: '火山引擎 Access Key ID' })
  volcengineAccessKeyId?: string;

  @ApiPropertyOptional({ description: '火山引擎 Secret Access Key（脱敏显示）' })
  volcengineSecretAccessKey?: string;

  @ApiPropertyOptional({ description: '即梦 API Key（脱敏显示）' })
  jimengApiKey?: string;

  @ApiPropertyOptional({ description: '可灵 API Key（脱敏显示）' })
  klingApiKey?: string;

  @ApiProperty({ description: '视频Provider', example: 'jimeng' })
  videoProvider: string;

  @ApiProperty({ description: 'FFmpeg路径' })
  ffmpegPath: string;

  @ApiProperty({ description: '视频存储路径' })
  videoStoragePath: string;

  @ApiProperty({ description: '临时文件路径' })
  tempStoragePath: string;

  @ApiProperty({ description: '用户每日配额' })
  userDailyQuota: number;

  @ApiProperty({ description: '用户每月配额' })
  userMonthlyQuota: number;

  @ApiProperty({ description: '月度预算（元）' })
  monthlyBudget: number;

  @ApiProperty({ description: '成本警报阈值（元）' })
  costAlertThreshold: number;

  @ApiProperty({ description: '是否启用' })
  isActive: boolean;

  @ApiPropertyOptional({ description: '最后健康检查时间' })
  lastHealthCheck?: Date;

  @ApiPropertyOptional({ description: '健康状态' })
  healthStatus?: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: '更新人ID' })
  updatedBy?: string;
}

export class CostStatisticsDto {
  @ApiProperty({ description: '总成本（元）' })
  totalCost: number;

  @ApiProperty({ description: '总请求数' })
  totalRequests: number;

  @ApiProperty({ description: '成功次数' })
  successCount: number;

  @ApiProperty({ description: '失败次数' })
  failureCount: number;

  @ApiProperty({ description: '成功率（%）' })
  successRate: number;

  @ApiProperty({ description: '月度预算' })
  monthlyBudget: number;

  @ApiProperty({ description: '剩余预算（元）' })
  remainingBudget: number;

  @ApiProperty({ description: '预算使用百分比' })
  budgetUsagePercentage: number;
}

export class UserQuotaDto {
  @ApiProperty({ description: '是否可用' })
  available: boolean;

  @ApiProperty({ description: '每日剩余配额' })
  dailyRemaining: number;

  @ApiProperty({ description: '每月剩余配额' })
  monthlyRemaining: number;

  @ApiProperty({ description: '每日限制' })
  dailyLimit: number;

  @ApiProperty({ description: '每月限制' })
  monthlyLimit: number;

  @ApiProperty({ description: '每日重置时间' })
  dailyResetAt: Date;

  @ApiProperty({ description: '每月重置时间' })
  monthlyResetAt: Date;
}

