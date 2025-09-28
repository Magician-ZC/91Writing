import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from '../../dto/create-subscription.dto';
import { UpdateSubscriptionDto } from '../../dto/update-subscription.dto';
import { JwtAuthGuard } from '@app/auth';
import { Request } from 'express';

@ApiTags('订阅管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @ApiOperation({ summary: '创建订阅' })
  @ApiResponse({ status: 201, description: '订阅创建成功' })
  create(@Body() createSubscriptionDto: CreateSubscriptionDto, @Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.subscriptionService.create(userId, createSubscriptionDto);
  }

  @Get('current')
  @ApiOperation({ summary: '获取当前用户订阅' })
  @ApiResponse({ status: 200, description: '用户订阅信息获取成功' })
  findCurrent(@Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.subscriptionService.findByUser(userId);
  }

  @Get('status')
  @ApiOperation({ summary: '检查订阅状态' })
  @ApiResponse({ status: 200, description: '订阅状态检查成功' })
  checkStatus(@Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.subscriptionService.checkStatus(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取订阅详情' })
  @ApiResponse({ status: 200, description: '订阅详情获取成功' })
  findOne(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.subscriptionService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新订阅' })
  @ApiResponse({ status: 200, description: '订阅更新成功' })
  update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).user.sub;
    return this.subscriptionService.update(id, userId, updateSubscriptionDto);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: '取消订阅' })
  @ApiResponse({ status: 200, description: '订阅取消成功' })
  cancel(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.subscriptionService.cancel(id, userId);
  }

  @Post(':id/renew')
  @ApiOperation({ summary: '续费订阅' })
  @ApiResponse({ status: 200, description: '订阅续费成功' })
  renew(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.subscriptionService.renew(id, userId);
  }
}
