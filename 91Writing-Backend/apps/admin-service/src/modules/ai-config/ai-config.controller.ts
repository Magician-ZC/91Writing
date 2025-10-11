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

@ApiTags('管理员-AI配置')
@ApiBearerAuth()
@Controller('admin/ai-config')
@UseGuards(AdminAuthGuard, RoleGuard)
export class AIConfigController {
  constructor(private readonly aiConfigService: AIConfigService) {}

  @Get('system')
  @ApiOperation({ summary: '获取系统AI配置' })
  async getSystemConfig(): Promise<GetSystemAIConfigResponseDto> {
    return this.aiConfigService.getSystemConfig();
  }

  @Put('system')
  @ApiOperation({ summary: '更新系统AI配置' })
  async updateSystemConfig(
    @Body() dto: UpdateSystemAIConfigDto,
  ): Promise<GetSystemAIConfigResponseDto> {
    return this.aiConfigService.updateSystemConfig(dto);
  }

  @Post('test')
  @ApiOperation({ summary: '测试AI配置连接' })
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

