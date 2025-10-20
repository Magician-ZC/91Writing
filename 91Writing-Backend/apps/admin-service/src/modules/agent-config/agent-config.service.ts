import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import {
  CreateAgentPromptConfigDto,
  UpdateAgentPromptConfigDto,
  AgentPromptConfigResponseDto,
  TestAgentPromptDto,
  TestAgentPromptResponseDto,
  AgentType,
} from '../../dto/agent-config.dto';

/**
 * Agent提示词配置服务
 */
@Injectable()
export class AgentConfigService {
  private readonly logger = new Logger(AgentConfigService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建Agent配置
   */
  async create(dto: CreateAgentPromptConfigDto): Promise<AgentPromptConfigResponseDto> {
    this.logger.log(`创建Agent配置: ${dto.agentType}`);

    // 获取当前类型的最高版本号
    const latestVersion = await this.prisma.agentPromptConfig.findFirst({
      where: { agentType: dto.agentType },
      orderBy: { version: 'desc' },
      select: { version: true },
    });

    const nextVersion = (latestVersion?.version || 0) + 1;

    const config = await this.prisma.agentPromptConfig.create({
      data: {
        agentType: dto.agentType,
        name: dto.name,
        systemPrompt: dto.systemPrompt,
        templatePrompt: dto.templatePrompt,
        parameters: dto.parameters as any,
        description: dto.description,
        isActive: dto.isActive ?? true,
        version: nextVersion,
      },
    });

    return this.formatResponse(config);
  }

  /**
   * 获取所有配置
   */
  async findAll(): Promise<AgentPromptConfigResponseDto[]> {
    const configs = await this.prisma.agentPromptConfig.findMany({
      orderBy: [
        { agentType: 'asc' },
        { version: 'desc' },
      ],
    });

    return configs.map(config => this.formatResponse(config));
  }

  /**
   * 获取指定类型的配置
   */
  async findByType(agentType: AgentType): Promise<AgentPromptConfigResponseDto[]> {
    const configs = await this.prisma.agentPromptConfig.findMany({
      where: { agentType },
      orderBy: { version: 'desc' },
    });

    return configs.map(config => this.formatResponse(config));
  }

  /**
   * 获取单个配置
   */
  async findOne(id: string): Promise<AgentPromptConfigResponseDto> {
    const config = await this.prisma.agentPromptConfig.findUnique({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException('配置不存在');
    }

    return this.formatResponse(config);
  }

  /**
   * 获取激活的配置
   */
  async findActiveByType(agentType: AgentType): Promise<AgentPromptConfigResponseDto> {
    const config = await this.prisma.agentPromptConfig.findFirst({
      where: {
        agentType,
        isActive: true,
      },
      orderBy: { version: 'desc' },
    });

    if (!config) {
      throw new NotFoundException(`没有激活的${agentType}配置`);
    }

    return this.formatResponse(config);
  }

  /**
   * 更新配置
   */
  async update(
    id: string,
    dto: UpdateAgentPromptConfigDto,
  ): Promise<AgentPromptConfigResponseDto> {
    this.logger.log(`更新Agent配置: ${id}`);

    const existing = await this.prisma.agentPromptConfig.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('配置不存在');
    }

    const config = await this.prisma.agentPromptConfig.update({
      where: { id },
      data: {
        name: dto.name,
        systemPrompt: dto.systemPrompt,
        templatePrompt: dto.templatePrompt,
        parameters: dto.parameters as any,
        description: dto.description,
        isActive: dto.isActive,
      },
    });

    return this.formatResponse(config);
  }

  /**
   * 删除配置
   */
  async remove(id: string): Promise<void> {
    const config = await this.prisma.agentPromptConfig.findUnique({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException('配置不存在');
    }

    await this.prisma.agentPromptConfig.delete({
      where: { id },
    });

    this.logger.log(`已删除Agent配置: ${id}`);
  }

  /**
   * 测试配置
   */
  async test(dto: TestAgentPromptDto): Promise<TestAgentPromptResponseDto> {
    const startTime = Date.now();

    try {
      // TODO: 调用AI服务测试提示词
      // 这里需要集成实际的AI调用逻辑
      
      this.logger.log(`测试Agent配置: ${dto.agentType}`);

      // 模拟测试结果
      const result = {
        message: '测试成功',
        agentType: dto.agentType,
        input: dto.testInput,
      };

      const duration = Date.now() - startTime;

      return {
        success: true,
        result,
        duration,
        tokenUsage: {
          input: 100,
          output: 200,
          total: 300,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`测试失败: ${error.message}`);

      return {
        success: false,
        result: null,
        duration,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  /**
   * 格式化响应
   */
  private formatResponse(config: any): AgentPromptConfigResponseDto {
    return {
      id: config.id,
      agentType: config.agentType,
      name: config.name,
      systemPrompt: config.systemPrompt,
      templatePrompt: config.templatePrompt,
      parameters: config.parameters,
      version: config.version,
      isActive: config.isActive,
      description: config.description,
      usageCount: config.usageCount,
      successCount: config.successCount,
      failureCount: config.failureCount,
      successRate: config.usageCount > 0
        ? Math.round((config.successCount / config.usageCount) * 100)
        : 0,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }
}

