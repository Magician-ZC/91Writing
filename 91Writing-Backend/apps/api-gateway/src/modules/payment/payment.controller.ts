import { Controller, All, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { PaymentService } from './payment.service';

// 支付订单控制器
@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentService: PaymentService) {}

  @All('*')
  async forwardRequest(@Req() req: Request, @Res() res: Response) {
    try {
      const path = req.path;  // 保留完整路径，包括 /api/v1
      const result = await this.paymentService.forwardRequest(
        path, 
        req.method, 
        req.body, 
        req.headers
      );
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json(error.response || { message: 'Internal server error' });
    }
  }
}

// 订阅控制器
@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly paymentService: PaymentService) {}

  @All('*')
  async forwardRequest(@Req() req: Request, @Res() res: Response) {
    try {
      const path = req.path;  // 保留完整路径，包括 /api/v1
      const result = await this.paymentService.forwardRequest(
        path, 
        req.method, 
        req.body, 
        req.headers
      );
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json(error.response || { message: 'Internal server error' });
    }
  }
}

// 套餐控制器
@ApiTags('packages')
@Controller('packages')
export class PackagesController {
  constructor(private readonly paymentService: PaymentService) {}

  @All('*')
  async forwardRequest(@Req() req: Request, @Res() res: Response) {
    try {
      const path = req.path;  // 保留完整路径，包括 /api/v1
      const result = await this.paymentService.forwardRequest(
        path, 
        req.method, 
        req.body, 
        req.headers
      );
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json(error.response || { message: 'Internal server error' });
    }
  }
}

// 保留兼容性
export class PaymentController extends PaymentsController {}