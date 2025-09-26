import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '@app/database';

@ApiTags('健康检查')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ 
    summary: '基础健康检查',
    description: '检查用户服务的基本运行状态'
  })
  @ApiResponse({
    status: 200,
    description: '服务健康',
    schema: {
      example: {
        status: 'ok',
        info: {
          database: { status: 'up' },
          memory: { status: 'up' }
        },
        error: {},
        details: {
          database: { status: 'up' },
          memory: { status: 'up' }
        }
      }
    }
  })
  @HealthCheck()
  async check() {
    return this.health.check([
      // 数据库健康检查
      () => this.prismaHealth.pingCheck('database', this.prisma),
      
      // 内存使用检查 (最大1GB)
      () => this.memory.checkHeap('memory_heap', 1024 * 1024 * 1024),
      
      // RSS内存检查 (最大1.5GB)
      () => this.memory.checkRSS('memory_rss', 1536 * 1024 * 1024),
    ]);
  }

  @Get('ready')
  @ApiOperation({ 
    summary: '就绪检查',
    description: '检查用户服务是否准备好接收请求'
  })
  @ApiResponse({
    status: 200,
    description: '服务就绪',
  })
  @HealthCheck()
  async ready() {
    return this.health.check([
      // 检查数据库连接
      () => this.prismaHealth.pingCheck('database', this.prisma),
    ]);
  }

  @Get('live')
  @ApiOperation({ 
    summary: '存活检查',
    description: '检查用户服务是否仍在运行'
  })
  @ApiResponse({
    status: 200,
    description: '服务存活',
    schema: {
      example: {
        status: 'ok',
        info: {
          memory: { status: 'up' },
          storage: { status: 'up' }
        },
        error: {},
        details: {
          memory: { status: 'up' },
          storage: { status: 'up' }
        }
      }
    }
  })
  @HealthCheck()
  async live() {
    return this.health.check([
      // 内存检查
      () => this.memory.checkHeap('memory_heap', 1024 * 1024 * 1024),
      
      // 磁盘空间检查 (最少保留1GB可用空间)
      () => this.disk.checkStorage('storage', { 
        path: '/', 
        thresholdPercent: 0.9 
      }),
    ]);
  }

  @Get('detailed')
  @ApiOperation({ 
    summary: '详细健康检查',
    description: '获取用户服务的详细健康状态信息'
  })
  @ApiResponse({
    status: 200,
    description: '详细健康信息',
  })
  async detailed() {
    const basicHealth = await this.check();
    
    return {
      ...basicHealth,
      service: {
        name: '91Writing 用户服务',
        version: '1.0.0',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
      },
      metrics: {
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
      },
    };
  }
}
