import apiManager from './apiManager'

class InviteService {
  /**
   * 获取我的邀请码
   */
  async getMyInviteCode() {
    try {
      const response = await apiManager.request('/api/v1/auth/invite/my-code', {
        method: 'GET'
      })
      
      if (response.success) {
        // 处理嵌套的data结构
        const actualData = response.data?.data || response.data
        return {
          success: true,
          data: actualData
        }
      } else {
        throw new Error(response.message || '获取邀请码失败')
      }
    } catch (error) {
      console.error('获取邀请码失败:', error)
      return {
        success: false,
        message: error.message || '获取邀请码失败'
      }
    }
  }

  /**
   * 获取邀请统计
   */
  async getInviteStats() {
    try {
      const response = await apiManager.request('/api/v1/auth/invite/stats', {
        method: 'GET'
      })
      
      if (response.success) {
        // 处理嵌套的data结构
        const actualData = response.data?.data || response.data
        return {
          success: true,
          data: actualData
        }
      } else {
        throw new Error(response.message || '获取邀请统计失败')
      }
    } catch (error) {
      console.error('获取邀请统计失败:', error)
      return {
        success: false,
        message: error.message || '获取邀请统计失败'
      }
    }
  }

  /**
   * 获取邀请的用户列表
   */
  async getInvitees() {
    try {
      const response = await apiManager.request('/api/v1/auth/invite/invitees', {
        method: 'GET'
      })
      
      if (response.success) {
        // 处理嵌套的data结构，邀请用户在 data.data.invitees 中
        const actualData = response.data?.data || response.data
        const invitees = actualData?.invitees || actualData
        return {
          success: true,
          data: Array.isArray(invitees) ? invitees : []
        }
      } else {
        throw new Error(response.message || '获取邀请用户列表失败')
      }
    } catch (error) {
      console.error('获取邀请用户列表失败:', error)
      return {
        success: false,
        message: error.message || '获取邀请用户列表失败'
      }
    }
  }

  /**
   * 获取邀请奖励记录
   */
  async getInviteRewards() {
    try {
      const response = await apiManager.request('/api/v1/auth/invite/rewards', {
        method: 'GET'
      })
      
      if (response.success) {
        // 处理嵌套的data结构
        const actualData = response.data?.data || response.data
        return {
          success: true,
          data: actualData
        }
      } else {
        throw new Error(response.message || '获取邀请奖励记录失败')
      }
    } catch (error) {
      console.error('获取邀请奖励记录失败:', error)
      return {
        success: false,
        message: error.message || '获取邀请奖励记录失败'
      }
    }
  }

  /**
   * 领取奖励
   */
  async claimReward(rewardId) {
    try {
      const response = await apiManager.request('/api/v1/auth/invite/claim-reward', {
        method: 'POST',
        data: { rewardId }
      })
      
      if (response.success) {
        // 处理嵌套的data结构
        const actualData = response.data?.data || response.data
        return {
          success: true,
          data: actualData
        }
      } else {
        throw new Error(response.message || '领取奖励失败')
      }
    } catch (error) {
      console.error('领取奖励失败:', error)
      return {
        success: false,
        message: error.message || '领取奖励失败'
      }
    }
  }

  /**
   * 复制邀请链接到剪贴板
   */
  async copyInviteLink(inviteCode) {
    const shareUrl = `${window.location.origin}/#/register?invite=${inviteCode}`
    
    try {
      await navigator.clipboard.writeText(shareUrl)
      return {
        success: true,
        message: '邀请链接已复制到剪贴板'
      }
    } catch (error) {
      console.error('复制失败:', error)
      // 降级处理：使用传统方法
      try {
        const textArea = document.createElement('textarea')
        textArea.value = shareUrl
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        
        return {
          success: true,
          message: '邀请链接已复制到剪贴板'
        }
      } catch (fallbackError) {
        return {
          success: false,
          message: '复制失败，请手动复制链接'
        }
      }
    }
  }
}

export default new InviteService()
