import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WechatService {
  private readonly logger = new Logger(WechatService.name);

  // 微信支付配置
  private readonly config = {
    appId: process.env.WECHAT_APP_ID || '',
    mchId: process.env.WECHAT_MCH_ID || '',
    key: process.env.WECHAT_KEY || '',
    certPath: process.env.WECHAT_CERT_PATH || '',
    keyPath: process.env.WECHAT_KEY_PATH || '',
    gateway: 'https://api.mch.weixin.qq.com',
  };

  async createPayment(params: {
    orderNo: string;
    amount: number;
    description: string;
  }) {
    const { orderNo, amount, description } = params;

    // 构造微信支付参数
    const paymentParams = {
      appid: this.config.appId,
      mch_id: this.config.mchId,
      nonce_str: this.generateNonceStr(),
      body: description,
      out_trade_no: orderNo,
      total_fee: Math.round(amount * 100), // 转换为分
      spbill_create_ip: '127.0.0.1',
      notify_url: `${process.env.API_BASE_URL}/api/payments/wechat/notify`,
      trade_type: 'NATIVE',
    };

    // 生成签名
    const sign = this.signMD5(paymentParams);
    const signedParams = { ...paymentParams, sign };

    return {
      method: 'POST',
      url: `${this.config.gateway}/pay/unifiedorder`,
      data: this.buildXML(signedParams),
    };
  }

  async verifyNotify(notifyData: any): Promise<boolean> {
    // 验证微信支付通知
    this.logger.log('Wechat notify received:', notifyData);
    
    try {
      const { sign, ...params } = notifyData;
      const calculatedSign = this.signMD5(params);
      
      return sign === calculatedSign;
    } catch (error) {
      this.logger.error('Verify wechat notify error:', error);
      return false;
    }
  }

  private generateNonceStr(): string {
    return Math.random().toString(36).substr(2, 15);
  }

  private signMD5(params: any): string {
    const sortedKeys = Object.keys(params).sort();
    const signString = sortedKeys
      .filter(key => params[key] !== '' && key !== 'sign')
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    const stringWithKey = `${signString}&key=${this.config.key}`;
    
    // 实际项目中使用 crypto 模块进行 MD5 签名
    // 这里返回模拟签名
    return 'mock_signature'.toUpperCase();
  }

  private buildXML(params: any): string {
    const elements = Object.keys(params).map(key => {
      const value = typeof params[key] === 'number' ? params[key] : `<![CDATA[${params[key]}]]>`;
      return `<${key}>${value}</${key}>`;
    });

    return `<xml>${elements.join('')}</xml>`;
  }
}
