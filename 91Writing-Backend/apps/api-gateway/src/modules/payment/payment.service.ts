import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PaymentService {
  private readonly paymentServiceUrl = 'http://localhost:3005';

  async forwardRequest(path: string, method: string, data?: any, headers?: any) {
    try {
      const response = await axios({
        method,
        url: `${this.paymentServiceUrl}${path}`,
        data,
        headers,
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw new HttpException('Payment service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}