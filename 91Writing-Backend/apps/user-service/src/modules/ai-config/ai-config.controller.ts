import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UserAIConfigService } from './ai-config.service';
import {
  CreateUserAIConfigDto,
  UpdateUserAIConfigDto,
  UserAIConfigResponseDto,
  AvailableAIConfigsResponseDto,
} from '@app/common/dto/ai-config.dto';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';

@ApiTags('用户-AI配置')
@ApiBearerAuth()
@Controller('ai-config')
@UseGuards(JwtAuthGuard)
export class UserAIConfigController {
  constructor(private readonly aiConfigService: UserAIConfigService) {}

  @Get('available')
  @ApiOperation({ summary: '获取可用的AI配置（全局+自定义）' })
  async getAvailableConfigs(@Request() req): Promise<AvailableAIConfigsResponseDto> {
    return this.aiConfigService.getAvailableConfigs(req.user.userId);
  }

  @Get('custom')
  @ApiOperation({ summary: '获取用户自定义配置列表' })
  async getUserConfigs(@Request() req): Promise<UserAIConfigResponseDto[]> {
    return this.aiConfigService.getUserConfigs(req.user.userId);
  }

  @Post('custom')
  @ApiOperation({ summary: '创建用户自定义配置' })
  async createConfig(
    @Request() req,
    @Body() dto: CreateUserAIConfigDto,
  ): Promise<UserAIConfigResponseDto> {
    return this.aiConfigService.createConfig(req.user.userId, dto);
  }

  @Put('custom/:id')
  @ApiOperation({ summary: '更新用户自定义配置' })
  async updateConfig(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateUserAIConfigDto,
  ): Promise<UserAIConfigResponseDto> {
    return this.aiConfigService.updateConfig(req.user.userId, id, dto);
  }

  @Delete('custom/:id')
  @ApiOperation({ summary: '删除用户自定义配置' })
  @ApiParam({ name: 'id', description: '配置ID' })
  @HttpCode(HttpStatus.OK)
  async deleteConfig(@Request() req, @Param('id') id: string): Promise<{ message: string }> {
    await this.aiConfigService.deleteConfig(req.user.userId, id);
    return { message: '配置已删除' };
  }

  @Post('custom/:id/set-default')
  @ApiOperation({ summary: '设置默认配置' })
  @ApiParam({ name: 'id', description: '配置ID' })
  @HttpCode(HttpStatus.OK)
  async setDefaultConfig(@Request() req, @Param('id') id: string): Promise<{ message: string }> {
    await this.aiConfigService.setDefaultConfig(req.user.userId, id);
    return { message: '默认配置已设置' };
  }
}

