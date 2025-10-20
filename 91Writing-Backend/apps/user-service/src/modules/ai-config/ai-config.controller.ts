import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, HttpCode, HttpStatus, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UserAIConfigService } from './ai-config.service';
import {
  CreateUserAIConfigDto,
  UpdateUserAIConfigDto,
  UserAIConfigResponseDto,
  AvailableAIConfigsResponseDto,
} from '@app/common/dto/ai-config.dto';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';

@ApiTags('AI配置管理')
@ApiBearerAuth('JWT-auth')
@Controller()  // ⚠️ 微服务不使用路径前缀
@UseGuards(JwtAuthGuard)
export class UserAIConfigController {
  constructor(private readonly aiConfigService: UserAIConfigService) {}

  @Get('ai-config/available')
  @ApiOperation({ 
    summary: '获取可用的AI配置',
    description: '获取用户可用的所有AI配置，包括系统全局配置和用户自定义配置'
  })
  @ApiResponse({ 
    status: 200, 
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            system: { 
              type: 'array',
              description: '系统全局配置',
              items: { type: 'object' }
            },
            user: { 
              type: 'array',
              description: '用户自定义配置',
              items: { type: 'object' }
            },
            default: { type: 'string', example: 'system:1', description: '默认配置ID' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: '未授权访问' })
  async getAvailableConfigs(@Request() req): Promise<AvailableAIConfigsResponseDto> {
    return this.aiConfigService.getAvailableConfigs(req.user.id);
  }

  @Get('ai-config/custom')
  @ApiOperation({ 
    summary: '获取用户自定义配置列表',
    description: '获取当前用户创建的所有自定义AI配置'
  })
  @ApiResponse({ 
    status: 200, 
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string', example: '我的OpenAI配置' },
              provider: { type: 'string', example: 'OPENAI' },
              model: { type: 'string', example: 'gpt-4' },
              apiUrl: { type: 'string' },
              enabled: { type: 'boolean' },
              isDefault: { type: 'boolean' },
              parameters: { type: 'object' },
              createdAt: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: '未授权访问' })
  async getUserConfigs(@Request() req): Promise<UserAIConfigResponseDto[]> {
    return this.aiConfigService.getUserConfigs(req.user.id);
  }

  @Post('ai-config/custom')
  @ApiOperation({ 
    summary: '创建用户自定义配置',
    description: '创建新的AI配置，可以配置自己的API Key和参数'
  })
  @ApiBody({ type: CreateUserAIConfigDto })
  @ApiResponse({ 
    status: 201, 
    description: '创建成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            provider: { type: 'string' },
            model: { type: 'string' },
            enabled: { type: 'boolean' },
            isDefault: { type: 'boolean' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: '参数验证失败' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  async createConfig(
    @Request() req,
    @Body(ValidationPipe) dto: CreateUserAIConfigDto,
  ): Promise<UserAIConfigResponseDto> {
    return this.aiConfigService.createConfig(req.user.id, dto);
  }

  @Put('ai-config/custom/:id')
  @ApiOperation({ 
    summary: '更新用户自定义配置',
    description: '更新已有的自定义AI配置'
  })
  @ApiParam({ name: 'id', description: '配置ID' })
  @ApiBody({ type: UpdateUserAIConfigDto })
  @ApiResponse({ 
    status: 200, 
    description: '更新成功'
  })
  @ApiResponse({ status: 400, description: '参数验证失败' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 404, description: '配置不存在' })
  @HttpCode(HttpStatus.OK)
  async updateConfig(
    @Request() req,
    @Param('id') id: string,
    @Body(ValidationPipe) dto: UpdateUserAIConfigDto,
  ): Promise<UserAIConfigResponseDto> {
    return this.aiConfigService.updateConfig(req.user.id, id, dto);
  }

  @Delete('ai-config/custom/:id')
  @ApiOperation({ 
    summary: '删除用户自定义配置',
    description: '删除指定的自定义AI配置'
  })
  @ApiParam({ name: 'id', description: '配置ID' })
  @ApiResponse({ 
    status: 200, 
    description: '删除成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            message: { type: 'string', example: '配置已删除' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 404, description: '配置不存在' })
  @HttpCode(HttpStatus.OK)  // ⚠️ DELETE必须添加HttpCode
  async deleteConfig(@Request() req, @Param('id') id: string): Promise<{ message: string }> {
    await this.aiConfigService.deleteConfig(req.user.id, id);
    return { message: '配置已删除' };
  }

  @Post('ai-config/custom/:id/set-default')
  @ApiOperation({ 
    summary: '设置默认配置',
    description: '将指定的配置设置为默认AI配置'
  })
  @ApiParam({ name: 'id', description: '配置ID' })
  @ApiResponse({ 
    status: 200, 
    description: '设置成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            message: { type: 'string', example: '默认配置已设置' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 404, description: '配置不存在' })
  @HttpCode(HttpStatus.OK)
  async setDefaultConfig(@Request() req, @Param('id') id: string): Promise<{ message: string }> {
    await this.aiConfigService.setDefaultConfig(req.user.id, id);
    return { message: '默认配置已设置' };
  }
}

