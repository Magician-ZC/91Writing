import { backendApi } from './backendApi'

/**
 * 一致性检测服务
 */
class ConsistencyService {
  /**
   * 创建一致性检测任务
   * @param {string} novelId - 小说ID
   * @param {Object} checkData - 检测配置
   * @param {string} checkData.checkType - 检测类型: worldview, character, timeline, full
   * @param {string[]} checkData.chapterIds - 章节ID列表（可选）
   * @param {boolean} checkData.aiEnhanced - 是否启用AI增强检测
   * @returns {Promise}
   */
  async createCheck(novelId, checkData) {
    return await backendApi.post(
      `/api/v1/novels/${novelId}/consistency-check`,
      checkData
    )
  }

  /**
   * 获取检测历史记录
   * @param {string} novelId - 小说ID
   * @returns {Promise}
   */
  async getHistory(novelId) {
    return await backendApi.get(
      `/api/v1/novels/${novelId}/consistency-checks`
    )
  }

  /**
   * 获取检测结果详情
   * @param {string} checkId - 检测记录ID
   * @returns {Promise}
   */
  async getCheckResult(checkId) {
    return await backendApi.get(
      `/api/v1/consistency-checks/${checkId}`
    )
  }

  /**
   * 解决/处理一致性问题
   * @param {string} issueId - 问题ID
   * @param {Object} resolveData - 处理数据
   * @param {string} resolveData.status - 状态: resolved, ignored, false_positive
   * @param {string} resolveData.userNote - 用户备注（可选）
   * @returns {Promise}
   */
  async resolveIssue(issueId, resolveData) {
    return await backendApi.patch(
      `/api/v1/consistency-issues/${issueId}/resolve`,
      resolveData
    )
  }

  /**
   * 批量解决问题
   * @param {string[]} issueIds - 问题ID列表
   * @param {string} status - 状态
   * @returns {Promise}
   */
  async batchResolve(issueIds, status) {
    const promises = issueIds.map(id => 
      this.resolveIssue(id, { status })
    )
    return await Promise.all(promises)
  }
}

export default new ConsistencyService()
