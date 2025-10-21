import { backendApi } from './backendApi'

/**
 * 用户引导服务
 */
class OnboardingService {
  /**
   * 获取用户引导状态
   * @returns {Promise}
   */
  async getStatus() {
    return await backendApi.get('/api/v1/onboarding/status')
  }

  /**
   * 更新引导进度
   * @param {Object} progressData - 进度数据
   * @param {boolean} progressData.welcomeCompleted - 欢迎引导完成
   * @param {boolean} progressData.novelCreationCompleted - 小说创建引导完成
   * @param {boolean} progressData.editorTourCompleted - 编辑器引导完成
   * @param {boolean} progressData.aiFeatureCompleted - AI功能引导完成
   * @param {string[]} progressData.discoveredFeatures - 已发现功能
   * @param {string[]} progressData.completedTours - 已完成引导
   * @returns {Promise}
   */
  async updateProgress(progressData) {
    return await backendApi.patch('/api/v1/onboarding', progressData)
  }

  /**
   * 跳过所有引导
   * @returns {Promise}
   */
  async skip() {
    return await backendApi.post('/api/v1/onboarding/skip')
  }

  /**
   * 跟踪功能使用
   * @param {string} featureName - 功能名称
   * @param {string} category - 功能分类: core, advanced, ai, tool
   * @returns {Promise}
   */
  async trackFeature(featureName, category) {
    return await backendApi.post('/api/v1/features/track', {
      featureName,
      category
    })
  }

  /**
   * 获取功能推荐
   * @returns {Promise}
   */
  async getRecommendations() {
    return await backendApi.get('/api/v1/features/recommendations')
  }

  /**
   * 提交帮助反馈
   * @param {string} helpType - 帮助类型: guide, tooltip, tutorial, documentation
   * @param {string} helpId - 帮助内容ID
   * @param {boolean} isHelpful - 是否有帮助
   * @param {string} feedback - 反馈内容（可选）
   * @returns {Promise}
   */
  async submitFeedback(helpType, helpId, isHelpful, feedback = null) {
    return await backendApi.post('/api/v1/help/feedback', {
      helpType,
      helpId,
      isHelpful,
      feedback
    })
  }

  /**
   * 标记功能为已发现
   * @param {string} featureName - 功能名称
   * @returns {Promise}
   */
  async markFeatureDiscovered(featureName) {
    try {
      const status = await this.getStatus()
      const discovered = status.data.discoveredFeatures || []
      
      if (!discovered.includes(featureName)) {
        discovered.push(featureName)
        await this.updateProgress({ discoveredFeatures: discovered })
      }
    } catch (error) {
      console.error('标记功能失败:', error)
    }
  }

  /**
   * 完成引导
   * @param {string} tourId - 引导ID
   * @returns {Promise}
   */
  async completeTour(tourId) {
    try {
      const status = await this.getStatus()
      const completed = status.data.completedTours || []
      
      if (!completed.includes(tourId)) {
        completed.push(tourId)
        await this.updateProgress({ completedTours: completed })
      }
    } catch (error) {
      console.error('完成引导失败:', error)
    }
  }
}

export default new OnboardingService()

