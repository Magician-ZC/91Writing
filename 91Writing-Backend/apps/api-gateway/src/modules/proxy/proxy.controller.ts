import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProxyService } from './proxy.service';

@ApiTags('proxy')
@Controller('proxy')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get('status')
  @ApiOperation({ summary: '代理服务状态' })
  getProxyStatus() {
    return this.proxyService.getStatus();
  }
}
