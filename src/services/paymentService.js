import apiManager from './apiManager'

class PaymentService {
  constructor() {
    this.baseURL = '/payments'
  }

  /**
   * 创建支付订单
   */
  async createOrder(data) {
    try {
      const response = await apiManager.request({
        method: 'POST',
        endpoint: `${this.baseURL}/orders`,
        data
      })
      return response
    } catch (error) {
      console.error('创建支付订单失败:', error)
      throw error
    }
  }

  /**
   * 获取用户支付订单列表
   */
  async getOrders(params = {}) {
    try {
      const response = await apiManager.request({
        method: 'GET',
        endpoint: `${this.baseURL}/orders`,
        params
      })
      return response
    } catch (error) {
      console.error('获取支付订单列表失败:', error)
      throw error
    }
  }

  /**
   * 获取支付订单详情
   */
  async getOrder(orderNo) {
    try {
      const response = await apiManager.request({
        method: 'GET',
        endpoint: `${this.baseURL}/orders/${orderNo}`
      })
      return response
    } catch (error) {
      console.error('获取支付订单详情失败:', error)
      throw error
    }
  }

  /**
   * 发起支付
   */
  async pay(orderNo) {
    try {
      const response = await apiManager.request({
        method: 'POST',
        endpoint: `${this.baseURL}/orders/${orderNo}/pay`
      })
      return response
    } catch (error) {
      console.error('发起支付失败:', error)
      throw error
    }
  }

  /**
   * 取消支付订单
   */
  async cancelOrder(orderNo) {
    try {
      const response = await apiManager.request({
        method: 'POST',
        endpoint: `${this.baseURL}/orders/${orderNo}/cancel`
      })
      return response
    } catch (error) {
      console.error('取消支付订单失败:', error)
      throw error
    }
  }

  /**
   * 查询支付状态
   */
  async queryPaymentStatus(orderNo) {
    try {
      const response = await apiManager.request({
        method: 'GET',
        endpoint: `${this.baseURL}/orders/${orderNo}/status`
      })
      return response
    } catch (error) {
      console.error('查询支付状态失败:', error)
      throw error
    }
  }

  /**
   * 获取支付方式列表
   */
  getPaymentMethods() {
    return [
      {
        key: 'ALIPAY',
        name: '支付宝',
        icon: '/alipay-icon.png',
        description: '支持花呗、余额、银行卡'
      },
      {
        key: 'WECHAT',
        name: '微信支付',
        icon: '/wechat-icon.png',
        description: '支持微信钱包、银行卡'
      }
    ]
  }

  /**
   * 格式化支付状态
   */
  formatPaymentStatus(status) {
    const statusMap = {
      'PENDING': '待支付',
      'PAID': '已支付',
      'FAILED': '支付失败',
      'CANCELLED': '已取消'
    }
    return statusMap[status] || '未知状态'
  }

  /**
   * 获取支付状态颜色
   */
  getPaymentStatusColor(status) {
    const colorMap = {
      'PENDING': '#e6a23c',
      'PAID': '#67c23a',
      'FAILED': '#f56c6c',
      'CANCELLED': '#909399'
    }
    return colorMap[status] || '#909399'
  }

  /**
   * 格式化支付方式
   */
  formatPaymentMethod(method) {
    const methodMap = {
      'ALIPAY': '支付宝',
      'WECHAT': '微信支付',
      'BANK_CARD': '银行卡',
      'BALANCE': '余额支付'
    }
    return methodMap[method] || '其他'
  }

  /**
   * 生成订单号
   */
  generateOrderNo() {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `91W${timestamp}${random}`
  }

  /**
   * 检查订单是否过期
   */
  isOrderExpired(order) {
    if (!order?.expiresAt) return false
    return new Date() > new Date(order.expiresAt)
  }

  /**
   * 计算订单剩余时间
   */
  getOrderRemainingTime(order) {
    if (!order?.expiresAt) return 0
    
    const now = new Date()
    const expiresAt = new Date(order.expiresAt)
    const diffTime = expiresAt - now
    
    return Math.max(0, Math.floor(diffTime / 1000)) // 返回秒数
  }

  /**
   * 格式化剩余时间
   */
  formatRemainingTime(seconds) {
    if (seconds <= 0) return '已过期'
    
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  /**
   * 处理支付回调
   */
  async handlePaymentCallback(callbackData) {
    try {
      // 这里可以处理支付成功后的逻辑
      console.log('支付回调数据:', callbackData)
      
      // 通知订阅状态更新
      const event = new CustomEvent('paymentSuccess', { detail: callbackData })
      window.dispatchEvent(event)
      
      return true
    } catch (error) {
      console.error('处理支付回调失败:', error)
      return false
    }
  }

  /**
   * 轮询支付状态
   */
  pollPaymentStatus(orderNo, options = {}) {
    const {
      interval = 3000,
      maxAttempts = 100,
      onStatusChange = null,
      onSuccess = null,
      onFailed = null,
      onTimeout = null
    } = options

    let attempts = 0
    
    const timer = setInterval(async () => {
      attempts++
      
      try {
        const response = await this.getOrder(orderNo)
        const order = response.data
        
        if (onStatusChange) {
          onStatusChange(order.status, order)
        }
        
        // 支付成功
        if (order.status === 'PAID') {
          clearInterval(timer)
          if (onSuccess) {
            onSuccess(order)
          }
          return
        }
        
        // 支付失败或取消
        if (order.status === 'FAILED' || order.status === 'CANCELLED') {
          clearInterval(timer)
          if (onFailed) {
            onFailed(order)
          }
          return
        }
        
        // 达到最大尝试次数
        if (attempts >= maxAttempts) {
          clearInterval(timer)
          if (onTimeout) {
            onTimeout()
          }
          return
        }
        
        // 订单过期
        if (this.isOrderExpired(order)) {
          clearInterval(timer)
          if (onTimeout) {
            onTimeout()
          }
          return
        }
        
      } catch (error) {
        console.error('轮询支付状态失败:', error)
        
        // 连续失败多次后停止轮询
        if (attempts >= 5) {
          clearInterval(timer)
          if (onFailed) {
            onFailed(null, error)
          }
        }
      }
    }, interval)

    // 返回停止函数
    return () => clearInterval(timer)
  }

  /**
   * 获取支付统计信息
   */
  async getPaymentStatistics(params = {}) {
    try {
      const response = await apiManager.request({
        method: 'GET',
        endpoint: `${this.baseURL}/statistics`,
        params
      })
      return response
    } catch (error) {
      console.error('获取支付统计失败:', error)
      throw error
    }
  }

  /**
   * 申请退款
   */
  async requestRefund(orderNo, reason) {
    try {
      const response = await apiManager.request({
        method: 'POST',
        endpoint: `${this.baseURL}/orders/${orderNo}/refund`,
        data: { reason }
      })
      return response
    } catch (error) {
      console.error('申请退款失败:', error)
      throw error
    }
  }

  /**
   * 获取发票信息
   */
  async getInvoice(orderNo) {
    try {
      const response = await apiManager.request({
        method: 'GET',
        endpoint: `${this.baseURL}/orders/${orderNo}/invoice`
      })
      return response
    } catch (error) {
      console.error('获取发票信息失败:', error)
      throw error
    }
  }

  /**
   * 创建发票
   */
  async createInvoice(orderNo, invoiceData) {
    try {
      const response = await apiManager.request({
        method: 'POST',
        endpoint: `${this.baseURL}/orders/${orderNo}/invoice`,
        data: invoiceData
      })
      return response
    } catch (error) {
      console.error('创建发票失败:', error)
      throw error
    }
  }
}

export const paymentService = new PaymentService()
