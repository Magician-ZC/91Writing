import apiManager from './apiManager'

class InviteService {
  constructor() {
    this.baseURL = '/api/v1/auth/invite'
  }

  /**
   * 获取我的邀请码
   */
  async getMyInviteCode() {
    try {
      const response = await apiManager.request(`${this.baseURL}/my-code`, {
        method: 'GET'
      })
      return response
    } catch (error) {
      console.error('获取邀请码失败:', error)
      throw error
    }
  }

  /**
   * 获取邀请统计信息
   */
  async getInviteStats() {
    try {
      const response = await apiManager.request(`${this.baseURL}/stats`, {
        method: 'GET'
      })
      return response
    } catch (error) {
      console.error('获取邀请统计失败:', error)
      throw error
    }
  }

  /**
   * 获取邀请奖励记录
   */
  async getInviteRewards() {
    try {
      const response = await apiManager.request(`${this.baseURL}/rewards`, {
        method: 'GET'
      })
      return response
    } catch (error) {
      console.error('获取邀请奖励记录失败:', error)
      throw error
    }
  }

  /**
   * 获取邀请的用户列表
   */
  async getInvitees() {
    try {
      const response = await apiManager.request(`${this.baseURL}/invitees`, {
        method: 'GET'
      })
      return response
    } catch (error) {
      console.error('获取邀请用户列表失败:', error)
      throw error
    }
  }

  /**
   * 领取邀请奖励
   */
  async claimReward(rewardId) {
    try {
      const response = await apiManager.request(`${this.baseURL}/claim-reward`, {
        method: 'POST',
        data: { rewardId }
      })
      return response
    } catch (error) {
      console.error('领取邀请奖励失败:', error)
      throw error
    }
  }

  /**
   * 获取奖励配置
   */
  async getRewardConfig() {
    try {
      const response = await apiManager.request(`${this.baseURL}/reward-config`, {
        method: 'GET'
      })
      return response
    } catch (error) {
      console.error('获取奖励配置失败:', error)
      throw error
    }
  }

  /**
   * 获取预期奖励
   */
  async getExpectedRewards() {
    try {
      const response = await apiManager.request(`${this.baseURL}/expected-rewards`, {
        method: 'GET'
      })
      return response
    } catch (error) {
      console.error('获取预期奖励失败:', error)
      throw error
    }
  }

  /**
   * 生成分享素材
   */
  async getShareMaterials() {
    try {
      const response = await apiManager.request(`${this.baseURL}/share-materials`, {
        method: 'GET'
      })
      return response
    } catch (error) {
      console.error('获取分享素材失败:', error)
      throw error
    }
  }

  /**
   * 检查邀请码有效性
   */
  async validateInviteCode(inviteCode) {
    try {
      // 这个接口可能需要在后端添加
      const response = await apiManager.request(`/api/v1/auth/validate-invite/${inviteCode}`, {
        method: 'GET'
      })
      return response
    } catch (error) {
      console.error('验证邀请码失败:', error)
      throw error
    }
  }

  /**
   * 生成邀请链接
   */
  generateInviteLink(inviteCode, baseUrl = window.location.origin) {
    return `${baseUrl}/#/register?invite=${inviteCode}`
  }

  /**
   * 生成二维码链接
   */
  generateQRCode(url, size = '200x200') {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}&data=${encodeURIComponent(url)}`
  }

  /**
   * 格式化奖励类型
   */
  formatRewardType(type) {
    const typeMap = {
      'DAYS': '天数',
      'CREDITS': '积分',
      'FEATURES': '功能',
      'CASH': '现金'
    }
    return typeMap[type] || '未知'
  }

  /**
   * 格式化奖励状态
   */
  formatRewardStatus(status) {
    const statusMap = {
      'PENDING': '待发放',
      'GRANTED': '已发放',
      'FAILED': '发放失败',
      'CANCELLED': '已取消'
    }
    return statusMap[status] || '未知'
  }

  /**
   * 获取奖励状态颜色
   */
  getRewardStatusColor(status) {
    const colorMap = {
      'PENDING': '#e6a23c',
      'GRANTED': '#67c23a',
      'FAILED': '#f56c6c',
      'CANCELLED': '#909399'
    }
    return colorMap[status] || '#909399'
  }

  /**
   * 计算邀请转化率
   */
  calculateConversionRate(inviteStats) {
    if (!inviteStats || !inviteStats.invitesByStatus) return 0
    
    const total = inviteStats.totalInvites || 0
    const accepted = inviteStats.invitesByStatus.find(s => s.status === 'ACCEPTED')?._count || 0
    
    return total > 0 ? Math.round((accepted / total) * 100) : 0
  }

  /**
   * 获取里程碑进度
   */
  getMilestoneProgress(currentInvites, milestones) {
    if (!milestones || milestones.length === 0) return null
    
    // 找到下一个里程碑
    const nextMilestone = milestones.find(m => m.inviteCount > currentInvites)
    if (!nextMilestone) {
      // 已经达到最高里程碑
      const lastMilestone = milestones[milestones.length - 1]
      return {
        current: currentInvites,
        target: lastMilestone.inviteCount,
        progress: 100,
        isCompleted: true,
        rewards: lastMilestone.rewards
      }
    }

    const progress = Math.round((currentInvites / nextMilestone.inviteCount) * 100)
    
    return {
      current: currentInvites,
      target: nextMilestone.inviteCount,
      progress,
      remaining: nextMilestone.inviteCount - currentInvites,
      isCompleted: false,
      rewards: nextMilestone.rewards
    }
  }

  /**
   * 生成分享文案
   */
  generateShareTexts(inviteCode, userName) {
    const baseUrl = window.location.origin
    const shareUrl = this.generateInviteLink(inviteCode, baseUrl)
    
    return [
      `${userName}邀请你加入91Writing智能写作平台！注册即可获得3天免费会员：${shareUrl}`,
      `发现了一个很好用的AI写作工具，推荐给你！新用户注册送会员：${shareUrl}`,
      `91Writing让AI帮你写小说，提高创作效率！快来体验：${shareUrl}`,
      `智能写作神器91Writing，已经帮我写了很多优秀内容！注册链接：${shareUrl}`
    ]
  }

  /**
   * 获取社交媒体分享链接
   */
  getSocialShareLinks(shareUrl, title = '91Writing智能写作平台', description = '让AI帮你创作更好的内容') {
    return {
      qq: `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`,
      weibo: `https://service.weibo.com/share/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(description)}`,
      wechat: shareUrl, // 微信通过二维码分享
      douban: `https://www.douban.com/recommend/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(description)}`,
      zhihu: shareUrl // 知乎暂时只能复制链接
    }
  }

  /**
   * 本地存储邀请数据
   */
  saveInviteDataToLocal(data) {
    try {
      localStorage.setItem('invite_data', JSON.stringify(data))
    } catch (error) {
      console.error('保存邀请数据失败:', error)
    }
  }

  /**
   * 从本地获取邀请数据
   */
  getInviteDataFromLocal() {
    try {
      const data = localStorage.getItem('invite_data')
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('获取本地邀请数据失败:', error)
      return null
    }
  }

  /**
   * 清除本地邀请数据
   */
  clearLocalInviteData() {
    try {
      localStorage.removeItem('invite_data')
    } catch (error) {
      console.error('清除本地邀请数据失败:', error)
    }
  }

  /**
   * 复制邀请链接到剪贴板
   */
  async copyInviteLink(inviteCode) {
    try {
      const shareUrl = this.generateInviteLink(inviteCode)
      
      if (navigator.clipboard && window.isSecureContext) {
        // 使用现代 Clipboard API
        await navigator.clipboard.writeText(shareUrl)
        return { success: true, message: '邀请链接已复制到剪贴板' }
      } else {
        // 兼容性方案
        const textArea = document.createElement('textarea')
        textArea.value = shareUrl
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        const success = document.execCommand('copy')
        document.body.removeChild(textArea)
        
        if (success) {
          return { success: true, message: '邀请链接已复制到剪贴板' }
        } else {
          return { success: false, message: '复制失败，请手动复制链接' }
        }
      }
    } catch (error) {
      console.error('复制邀请链接失败:', error)
      return { success: false, message: '复制失败，请手动复制链接' }
    }
  }
}

export const inviteService = new InviteService()