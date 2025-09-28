import apiManager from './apiManager'

class AdminService {
  constructor() {
    this.baseURL = '/admin'
  }

  // ============= 仪表盘统计 =============
  
  /**
   * 获取仪表盘统计数据
   */
  async getDashboardStats(params = {}) {
    try {
      const response = await apiManager.request({
        method: 'GET',
        endpoint: `${this.baseURL}/dashboard/stats`,
        params
      })
      return response
    } catch (error) {
      console.error('获取仪表盘统计失败:', error)
      throw error
    }
  }

  /**
   * 获取图表数据
   */
  async getChartData(params = {}) {
    try {
      const response = await apiManager.request({
        method: 'GET',
        endpoint: `${this.baseURL}/dashboard/charts`,
        params
      })
      return response
    } catch (error) {
      console.error('获取图表数据失败:', error)
      throw error
    }
  }

  // ============= 用户管理 =============
  
  /**
   * 获取用户列表
   */
  async getUsers(params = {}) {
    try {
      const response = await apiManager.request({
        method: 'GET',
        endpoint: `${this.baseURL}/users`,
        params
      })
      return response
    } catch (error) {
      console.error('获取用户列表失败:', error)
      throw error
    }
  }

  /**
   * 获取用户详情
   */
  async getUserDetail(userId) {
    try {
      const response = await apiManager.request({
        method: 'GET',
        endpoint: `${this.baseURL}/users/${userId}`
      })
      return response
    } catch (error) {
      console.error('获取用户详情失败:', error)
      throw error
    }
  }

  /**
   * 更新用户信息
   */
  async updateUser(userId, userData) {
    try {
      const response = await apiManager.request({
        method: 'PUT',
        endpoint: `${this.baseURL}/users/${userId}`,
        data: userData
      })
      return response
    } catch (error) {
      console.error('更新用户信息失败:', error)
      throw error
    }
  }

  /**
   * 封禁用户
   */
  async banUser(userId, banData) {
    try {
      const response = await apiManager.request({
        method: 'POST',
        endpoint: `${this.baseURL}/users/${userId}/ban`,
        data: banData
      })
      return response
    } catch (error) {
      console.error('封禁用户失败:', error)
      throw error
    }
  }

  /**
   * 解封用户
   */
  async unbanUser(userId) {
    try {
      const response = await apiManager.request({
        method: 'POST',
        endpoint: `${this.baseURL}/users/${userId}/unban`
      })
      return response
    } catch (error) {
      console.error('解封用户失败:', error)
      throw error
    }
  }

  // ============= 订阅管理 =============
  
  /**
   * 获取订阅列表
   */
  async getSubscriptions(params = {}) {
    try {
      const response = await apiManager.request({
        method: 'GET',
        endpoint: `${this.baseURL}/subscriptions`,
        params
      })
      return response
    } catch (error) {
      console.error('获取订阅列表失败:', error)
      throw error
    }
  }

  /**
   * 获取订阅统计
   */
  async getSubscriptionStats(params = {}) {
    try {
      const response = await apiManager.request({
        method: 'GET',
        endpoint: `${this.baseURL}/subscriptions/stats`,
        params
      })
      return response
    } catch (error) {
      console.error('获取订阅统计失败:', error)
      throw error
    }
  }

  /**
   * 更新订阅信息
   */
  async updateSubscription(subscriptionId, updateData) {
    try {
      const response = await apiManager.request({
        method: 'PUT',
        endpoint: `${this.baseURL}/subscriptions/${subscriptionId}`,
        data: updateData
      })
      return response
    } catch (error) {
      console.error('更新订阅信息失败:', error)
      throw error
    }
  }

  /**
   * 延长订阅
   */
  async extendSubscription(subscriptionId, extendData) {
    try {
      const response = await apiManager.request({
        method: 'POST',
        endpoint: `${this.baseURL}/subscriptions/${subscriptionId}/extend`,
        data: extendData
      })
      return response
    } catch (error) {
      console.error('延长订阅失败:', error)
      throw error
    }
  }

  // ============= 支付订单管理 =============
  
  /**
   * 获取支付订单列表
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
      console.error('获取订单列表失败:', error)
      throw error
    }
  }

  /**
   * 获取支付统计
   */
  async getPaymentStats(params = {}) {
    try {
      const response = await apiManager.request({
        method: 'GET',
        endpoint: `${this.baseURL}/orders/stats`,
        params
      })
      return response
    } catch (error) {
      console.error('获取支付统计失败:', error)
      throw error
    }
  }

  /**
   * 处理退款
   */
  async processRefund(orderNo, refundData) {
    try {
      const response = await apiManager.request({
        method: 'POST',
        endpoint: `${this.baseURL}/orders/${orderNo}/refund`,
        data: refundData
      })
      return response
    } catch (error) {
      console.error('处理退款失败:', error)
      throw error
    }
  }

  // ============= 套餐管理 =============
  
  /**
   * 获取套餐列表
   */
  async getPackages() {
    try {
      const response = await apiManager.request({
        method: 'GET',
        endpoint: `${this.baseURL}/packages`
      })
      return response
    } catch (error) {
      console.error('获取套餐列表失败:', error)
      throw error
    }
  }

  /**
   * 创建套餐
   */
  async createPackage(packageData) {
    try {
      const response = await apiManager.request({
        method: 'POST',
        endpoint: `${this.baseURL}/packages`,
        data: packageData
      })
      return response
    } catch (error) {
      console.error('创建套餐失败:', error)
      throw error
    }
  }

  /**
   * 更新套餐
   */
  async updatePackage(packageId, updateData) {
    try {
      const response = await apiManager.request({
        method: 'PUT',
        endpoint: `${this.baseURL}/packages/${packageId}`,
        data: updateData
      })
      return response
    } catch (error) {
      console.error('更新套餐失败:', error)
      throw error
    }
  }

  /**
   * 删除套餐
   */
  async deletePackage(packageId) {
    try {
      const response = await apiManager.request({
        method: 'DELETE',
        endpoint: `${this.baseURL}/packages/${packageId}`
      })
      return response
    } catch (error) {
      console.error('删除套餐失败:', error)
      throw error
    }
  }

  // ============= 系统配置 =============
  
  /**
   * 获取系统配置
   */
  async getSystemConfig() {
    try {
      const response = await apiManager.request({
        method: 'GET',
        endpoint: `${this.baseURL}/system/config`
      })
      return response
    } catch (error) {
      console.error('获取系统配置失败:', error)
      throw error
    }
  }

  /**
   * 更新系统配置
   */
  async updateSystemConfig(configData) {
    try {
      const response = await apiManager.request({
        method: 'PUT',
        endpoint: `${this.baseURL}/system/config`,
        data: configData
      })
      return response
    } catch (error) {
      console.error('更新系统配置失败:', error)
      throw error
    }
  }

  /**
   * 获取系统日志
   */
  async getSystemLogs(params = {}) {
    try {
      const response = await apiManager.request({
        method: 'GET',
        endpoint: `${this.baseURL}/system/logs`,
        params
      })
      return response
    } catch (error) {
      console.error('获取系统日志失败:', error)
      throw error
    }
  }

  // ============= 工具方法 =============
  
  /**
   * 格式化用户角色
   */
  formatUserRole(role) {
    const roleMap = {
      'USER': '普通用户',
      'ADMIN': '管理员',
      'MODERATOR': '版主'
    }
    return roleMap[role] || role
  }

  /**
   * 格式化用户状态
   */
  formatUserStatus(status) {
    const statusMap = {
      'ACTIVE': '正常',
      'INACTIVE': '未激活',
      'BANNED': '已封禁'
    }
    return statusMap[status] || status
  }

  /**
   * 获取用户状态颜色
   */
  getUserStatusColor(status) {
    const colorMap = {
      'ACTIVE': 'success',
      'INACTIVE': 'warning',
      'BANNED': 'danger'
    }
    return colorMap[status] || 'info'
  }

  /**
   * 格式化订阅状态
   */
  formatSubscriptionStatus(status) {
    const statusMap = {
      'ACTIVE': '有效',
      'EXPIRED': '已过期',
      'CANCELLED': '已取消'
    }
    return statusMap[status] || status
  }

  /**
   * 获取订阅状态颜色
   */
  getSubscriptionStatusColor(status) {
    const colorMap = {
      'ACTIVE': 'success',
      'EXPIRED': 'warning',
      'CANCELLED': 'info'
    }
    return colorMap[status] || 'info'
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
    return statusMap[status] || status
  }

  /**
   * 获取支付状态颜色
   */
  getPaymentStatusColor(status) {
    const colorMap = {
      'PENDING': 'warning',
      'PAID': 'success',
      'FAILED': 'danger',
      'CANCELLED': 'info'
    }
    return colorMap[status] || 'info'
  }

  /**
   * 格式化金额
   */
  formatAmount(amount) {
    if (typeof amount !== 'number') return '¥0'
    return `¥${amount.toFixed(2)}`
  }

  /**
   * 格式化数量
   */
  formatCount(count) {
    if (count >= 10000) {
      return `${(count / 10000).toFixed(1)}万`
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }
}

export const adminService = new AdminService()