import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('健康检查')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: '健康检查' })
  @ApiResponse({ status: 200, description: '服务正常运行' })
  getHealth() {
    return this.healthService.getHealth();
  }

  @Get('detailed')
  @ApiOperation({ summary: '详细健康检查' })
  @ApiResponse({ status: 200, description: '详细健康状态' })
  getDetailedHealth() {
    return this.healthService.getDetailedHealth();
  }
}