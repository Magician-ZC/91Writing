import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/common';
import { RoleGuard } from '../admin/guards/role.guard';
import { Roles } from '../admin/decorators/roles.decorator';
import { AgentConfigService } from './agent-config.service';
import {
  CreateAgentPromptConfigDto,
  UpdateAgentPromptConfigDto,
  AgentPromptConfigResponseDto,
  TestAgentPromptDto,
  TestAgentPromptResponseDto,
  AgentType,
} from '../../dto/agent-config.dto';

@ApiTags('Agent配置管理')
@Controller('agent-prompts')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('ADMIN')
@ApiBearerAuth('JWT-auth')
export class AgentConfigController {
  constructor(private readonly agentConfigService: AgentConfigService) {}

  @Post()
  @ApiOperation({ summary: '创建Agent配置' })
  @ApiResponse({ status: 201, description: '创建成功', type: AgentPromptConfigResponseDto })
  async create(
    @Body() dto: CreateAgentPromptConfigDto,
  ): Promise<AgentPromptConfigResponseDto> {
    return this.agentConfigService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '获取所有Agent配置' })
  @ApiResponse({ status: 200, description: '获取成功', type: [AgentPromptConfigResponseDto] })
  async findAll(
    @Query('agentType') agentType?: AgentType,
  ): Promise<AgentPromptConfigResponseDto[]> {
    if (agentType) {
      return this.agentConfigService.findByType(agentType);
    }
    return this.agentConfigService.findAll();
  }

  @Get('active/:agentType')
  @ApiOperation({ summary: '获取指定类型的激活配置' })
  @ApiResponse({ status: 200, description: '获取成功', type: AgentPromptConfigResponseDto })
  async findActive(
    @Param('agentType') agentType: AgentType,
  ): Promise<AgentPromptConfigResponseDto> {
    return this.agentConfigService.findActiveByType(agentType);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个配置详情' })
  @ApiResponse({ status: 200, description: '获取成功', type: AgentPromptConfigResponseDto })
  async findOne(@Param('id') id: string): Promise<AgentPromptConfigResponseDto> {
    return this.agentConfigService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新Agent配置' })
  @ApiResponse({ status: 200, description: '更新成功', type: AgentPromptConfigResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAgentPromptConfigDto,
  ): Promise<AgentPromptConfigResponseDto> {
    return this.agentConfigService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除Agent配置' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(@Param('id') id: string) {
    await this.agentConfigService.remove(id);
    return { message: 'Agent配置删除成功' };
  }

  @Post('test')
  @ApiOperation({ summary: '测试Agent配置' })
  @ApiResponse({ status: 200, description: '测试完成', type: TestAgentPromptResponseDto })
  async test(@Body() dto: TestAgentPromptDto): Promise<TestAgentPromptResponseDto> {
    return this.agentConfigService.test(dto);
  }
}

