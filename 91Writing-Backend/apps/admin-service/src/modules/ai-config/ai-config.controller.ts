import { Controller, Get, Put, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AIConfigService } from './ai-config.service';
import {
  GetSystemAIConfigResponseDto,
  UpdateSystemAIConfigDto,
  TestAIConfigDto,
} from '@app/common/dto/ai-config.dto';
import { AdminAuthGuard } from '../admin/guards/admin-auth.guard';
import { RoleGuard } from '../admin/guards/role.guard';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';

@ApiTags('AI配置')
@ApiBearerAuth()
@Controller('ai-config')
export class AIConfigController {
  constructor(private readonly aiConfigService: AIConfigService) {}

  @Get('system')
  @UseGuards(AdminAuthGuard, RoleGuard)
  @ApiOperation({ summary: '获取系统AI配置（管理员）' })
  async getSystemConfig(): Promise<GetSystemAIConfigResponseDto> {
    return this.aiConfigService.getSystemConfig();
  }

  @Put('system')
  @UseGuards(AdminAuthGuard, RoleGuard)
  @ApiOperation({ summary: '更新系统AI配置（管理员）' })
  async updateSystemConfig(
    @Body() dto: UpdateSystemAIConfigDto,
  ): Promise<GetSystemAIConfigResponseDto> {
    return this.aiConfigService.updateSystemConfig(dto);
  }

  @Post('test')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '测试AI配置连接（用户）' })
  async testConfig(
    @Body() dto: TestAIConfigDto,
  ): Promise<{
    success: boolean;
    message: string;
    responseTime?: number;
  }> {
    return this.aiConfigService.testConfig(dto);
  }
}

