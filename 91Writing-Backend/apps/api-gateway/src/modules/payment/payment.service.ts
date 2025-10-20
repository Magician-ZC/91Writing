import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PaymentService {
  private readonly paymentServiceUrl = 'http://localhost:3005';

  async forwardRequest(path: string, method: string, data?: any, headers?: any) {
    try {
      // 构建请求配置
      const requestConfig: any = {
        method,
        url: `${this.paymentServiceUrl}${path}`,
        headers,
      };

      // 只有在非 GET/DELETE 请求时才添加 data
      if (method !== 'GET' && method !== 'DELETE' && data !== undefined) {
        requestConfig.data = data;
      }

      const response = await axios(requestConfig);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw new HttpException('Payment service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}