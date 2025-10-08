/**
 * 数据分析服务
 * 提供数据统计和分析功能
 */

import apiManager from './apiManager'

export const analyticsService = {
  /**
   * 批量记录用户行为
   */
  async batchTrack(events) {
    try {
      return await apiManager.batchTrackActivities(events)
    } catch (error) {
      console.error('批量记录用户行为失败:', error)
      throw error
    }
  },

  /**
   * 获取概览统计
   */
  async getOverview(dateRange = {}) {
    try {
      return await apiManager.getAnalyticsOverview(dateRange)
    } catch (error) {
      console.error('获取概览统计失败:', error)
      throw error
    }
  },

  /**
   * 获取用户增长趋势
   */
  async getUserGrowth(days = 30) {
    try {
      return await apiManager.getUserGrowthTrend(days)
    } catch (error) {
      console.error('获取用户增长趋势失败:', error)
      throw error
    }
  },

  /**
   * 获取功能使用统计
   */
  async getFeatureUsage(limit = 10) {
    try {
      return await apiManager.getFeatureUsageStats(limit)
    } catch (error) {
      console.error('获取功能使用统计失败:', error)
      throw error
    }
  },

  /**
   * 获取AI使用统计
   */
  async getAIUsage(dateRange = {}) {
    try {
      return await apiManager.getAIUsageStats(dateRange)
    } catch (error) {
      console.error('获取AI使用统计失败:', error)
      throw error
    }
  },

  /**
   * 获取收入统计
   */
  async getRevenue(dateRange = {}) {
    try {
      return await apiManager.getRevenueStats(dateRange)
    } catch (error) {
      console.error('获取收入统计失败:', error)
      throw error
    }
  },

  /**
   * 获取用户留存数据
   */
  async getUserRetention(cohortDate, days = 30) {
    try {
      return await apiManager.getUserRetentionData(cohortDate, days)
    } catch (error) {
      console.error('获取用户留存数据失败:', error)
      throw error
    }
  },

  /**
   * 导出分析报表
   */
  async exportReport(dateRange = {}) {
    try {
      return await apiManager.exportAnalyticsReport(dateRange)
    } catch (error) {
      console.error('导出分析报表失败:', error)
      throw error
    }
  },
}
