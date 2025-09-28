import { Controller, All, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { PaymentService } from './payment.service';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @All('*')
  async forwardToPaymentService(@Req() req: Request, @Res() res: Response) {
    try {
      const path = req.path.replace('/api/v1/payment', '');
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