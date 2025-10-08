import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '@app/common/guards';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminAuthGuard } from '../admin/guards/admin-auth.guard';
import {
  BatchTrackDto,
  DateRangeDto,
  RetentionQueryDto,
} from './dto/analytics.dto';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('batch')
  @ApiOperation({ summary: '批量记录用户行为' })
  async batchTrack(@Body() dto: BatchTrackDto, @Req() req: any) {
    const ipAddress =
      req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    return this.analyticsService.batchTrackActivities(dto.events, ipAddress);
  }

  @Get('overview')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取概览统计' })
  async getOverview(@Query() query: DateRangeDto) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;
    return this.analyticsService.getOverviewStats(startDate, endDate);
  }

  @Get('user-growth')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户增长趋势' })
  async getUserGrowth(@Query('days') days: string = '30') {
    return this.analyticsService.getUserGrowthTrend(parseInt(days, 10));
  }

  @Get('feature-usage')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取功能使用统计' })
  async getFeatureUsage(@Query('limit') limit: string = '10') {
    return this.analyticsService.getFeatureUsageStats(parseInt(limit, 10));
  }

  @Get('ai-usage')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取AI使用统计' })
  async getAIUsage(@Query() query: DateRangeDto) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;
    return this.analyticsService.getAIUsageStats(startDate, endDate);
  }

  @Get('revenue')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取收入统计' })
  async getRevenue(@Query() query: DateRangeDto) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;
    return this.analyticsService.getRevenueStats(startDate, endDate);
  }

  @Get('retention')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户留存数据' })
  async getUserRetention(@Query() query: RetentionQueryDto) {
    const cohortDate = new Date(query.cohortDate);
    const days = query.days ? parseInt(query.days, 10) : 30;
    return this.analyticsService.getUserRetention(cohortDate, days);
  }

  @Get('export')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '导出分析报表' })
  async exportReport(@Query() query: DateRangeDto) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;
    return this.analyticsService.exportAnalyticsReport(startDate, endDate);
  }
}
