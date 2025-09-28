import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AlipayService {
  private readonly logger = new Logger(AlipayService.name);

  // 支付宝配置
  private readonly config = {
    appId: process.env.ALIPAY_APP_ID || '',
    privateKey: process.env.ALIPAY_PRIVATE_KEY || '',
    publicKey: process.env.ALIPAY_PUBLIC_KEY || '',
    gateway: process.env.ALIPAY_GATEWAY || 'https://openapi.alipay.com/gateway.do',
  };

  async createPayment(params: {
    orderNo: string;
    amount: number;
    subject: string;
  }) {
    const { orderNo, amount, subject } = params;

    // 构造支付宝支付参数
    const bizContent = {
      out_trade_no: orderNo,
      product_code: 'FAST_INSTANT_TRADE_PAY',
      total_amount: amount.toFixed(2),
      subject,
      body: subject,
    };

    const paymentParams = {
      method: 'alipay.trade.page.pay',
      app_id: this.config.appId,
      charset: 'UTF-8',
      sign_type: 'RSA2',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      version: '1.0',
      notify_url: `${process.env.API_BASE_URL}/api/payments/alipay/notify`,
      return_url: `${process.env.FRONTEND_URL}/payment/success`,
      biz_content: JSON.stringify(bizContent),
    };

    // 生成签名
    const signedParams = this.signParams(paymentParams);

    return {
      method: 'GET',
      url: `${this.config.gateway}?${signedParams}`,
      params: paymentParams,
    };
  }

  async verifyNotify(notifyData: any): Promise<boolean> {
    // 实际项目中需要验证支付宝的通知签名
    // 这里简化处理，返回 true
    this.logger.log('Alipay notify received:', notifyData);
    
    try {
      // 提取签名和参数
      const { sign, sign_type, ...params } = notifyData;
      
      if (sign_type !== 'RSA2') {
        return false;
      }

      // 验证签名
      const signString = this.buildSignString(params);
      const isValid = this.verifyRSA2(signString, sign, this.config.publicKey);
      
      return isValid;
    } catch (error) {
      this.logger.error('Verify alipay notify error:', error);
      return false;
    }
  }

  private signParams(params: any): string {
    const sortedKeys = Object.keys(params).sort();
    const signString = sortedKeys
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    const sign = this.signRSA2(signString, this.config.privateKey);
    
    return sortedKeys
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .concat([`sign=${encodeURIComponent(sign)}`])
      .join('&');
  }

  private buildSignString(params: any): string {
    const sortedKeys = Object.keys(params).sort();
    return sortedKeys
      .filter(key => params[key] !== '' && key !== 'sign' && key !== 'sign_type')
      .map(key => `${key}=${params[key]}`)
      .join('&');
  }

  private signRSA2(data: string, privateKey: string): string {
    // 实际项目中使用 crypto 模块进行 RSA2 签名
    // 这里返回模拟签名
    return 'mock_signature';
  }

  private verifyRSA2(data: string, signature: string, publicKey: string): boolean {
    // 实际项目中使用 crypto 模块验证 RSA2 签名
    // 这里返回 true（开发环境）
    return true;
  }
}
