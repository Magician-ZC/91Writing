import { Controller, Get, Put, Body, UseGuards, Req, Post, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminAuthGuard } from '../admin/guards/admin-auth.guard';
import { RoleGuard } from '../admin/guards/role.guard';
import { Roles } from '../admin/decorators/roles.decorator';
import { VideoAPIConfigService } from '@app/video-config';
import { UpdateVideoAPIConfigDto } from './dto/update-video-api-config.dto';
import { VideoAPIConfigResponseDto, CostStatisticsDto, UserQuotaDto } from './dto/video-api-config-response.dto';

@ApiTags('视频API配置管理')
@Controller()
@UseGuards(AdminAuthGuard, RoleGuard)
@ApiBearerAuth('JWT-auth')
export class VideoAPIConfigController {
  constructor(private readonly configService: VideoAPIConfigService) {}

  @Get('video-api-config')
  @Roles('ADMIN')
  @ApiOperation({ summary: '获取视频API配置' })
  @ApiResponse({ status: 200, description: '返回配置（敏感信息已脱敏）', type: VideoAPIConfigResponseDto })
  async getConfig(): Promise<VideoAPIConfigResponseDto> {
    return this.configService.getCurrentConfig();
  }

  @Put('video-api-config')
  @Roles('ADMIN')
  @ApiOperation({ summary: '更新视频API配置' })
  @ApiResponse({ status: 200, description: '更新成功', type: VideoAPIConfigResponseDto })
  async updateConfig(
    @Body() updateDto: UpdateVideoAPIConfigDto,
    @Req() req: any
  ): Promise<VideoAPIConfigResponseDto> {
    return this.configService.updateConfig(req.user.id, updateDto);
  }

  @Get('video-api-config/statistics')
  @Roles('ADMIN')
  @ApiOperation({ summary: '获取本月成本统计' })
  @ApiResponse({ status: 200, description: '返回成本统计', type: CostStatisticsDto })
  async getStatistics(): Promise<CostStatisticsDto> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return this.configService.getCostStatistics(startOfMonth, now);
  }

  @Get('video-api-config/statistics/range')
  @Roles('ADMIN')
  @ApiOperation({ summary: '获取指定时间范围的成本统计' })
  @ApiResponse({ status: 200, description: '返回成本统计', type: CostStatisticsDto })
  async getStatisticsRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ): Promise<CostStatisticsDto> {
    return this.configService.getCostStatistics(
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Post('video-api-config/test/:provider')
  @Roles('ADMIN')
  @ApiOperation({ summary: '测试Provider连接' })
  @ApiResponse({ status: 200, description: '返回测试结果' })
  async testProvider(
    @Param('provider') provider: 'volcengine' | 'jimeng' | 'kling'
  ): Promise<{ success: boolean; message: string }> {
    return this.configService.testProviderConnection(provider);
  }

  @Get('video-api-config/quota/:userId')
  @Roles('ADMIN')
  @ApiOperation({ summary: '查看用户配额' })
  @ApiResponse({ status: 200, description: '返回用户配额信息', type: UserQuotaDto })
  async getUserQuota(@Param('userId') userId: string): Promise<UserQuotaDto> {
    return this.configService.checkUserQuota(userId);
  }
}

