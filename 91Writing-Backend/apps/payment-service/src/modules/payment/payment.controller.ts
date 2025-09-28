import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreatePaymentOrderDto } from '../../dto/create-payment-order.dto';
import { QueryPaymentOrderDto } from '../../dto/query-payment-order.dto';
import { JwtAuthGuard } from '@app/common';
import { Request } from 'express';

@ApiTags('支付管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('orders')
  @ApiOperation({ summary: '创建支付订单' })
  @ApiResponse({ status: 201, description: '支付订单创建成功' })
  createOrder(@Body() createOrderDto: CreatePaymentOrderDto, @Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.paymentService.createOrder(userId, createOrderDto);
  }

  @Get('orders')
  @ApiOperation({ summary: '获取用户支付订单列表' })
  @ApiResponse({ status: 200, description: '支付订单列表获取成功' })
  getOrders(@Query() query: QueryPaymentOrderDto, @Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.paymentService.findUserOrders(userId, query);
  }

  @Get('orders/:orderNo')
  @ApiOperation({ summary: '获取支付订单详情' })
  @ApiResponse({ status: 200, description: '支付订单详情获取成功' })
  getOrder(@Param('orderNo') orderNo: string, @Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.paymentService.findOrder(orderNo, userId);
  }

  @Post('orders/:orderNo/pay')
  @ApiOperation({ summary: '发起支付' })
  @ApiResponse({ status: 200, description: '支付发起成功' })
  pay(@Param('orderNo') orderNo: string, @Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.paymentService.pay(orderNo, userId);
  }

  @Post('orders/:orderNo/cancel')
  @ApiOperation({ summary: '取消支付订单' })
  @ApiResponse({ status: 200, description: '支付订单取消成功' })
  cancel(@Param('orderNo') orderNo: string, @Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.paymentService.cancelOrder(orderNo, userId);
  }

  @Post('alipay/notify')
  @ApiOperation({ summary: '支付宝支付回调' })
  @ApiResponse({ status: 200, description: '回调处理成功' })
  alipayNotify(@Body() notifyData: any) {
    return this.paymentService.handleAlipayNotify(notifyData);
  }

  @Post('wechat/notify')
  @ApiOperation({ summary: '微信支付回调' })
  @ApiResponse({ status: 200, description: '回调处理成功' })
  wechatNotify(@Body() notifyData: any) {
    return this.paymentService.handleWechatNotify(notifyData);
  }
}
