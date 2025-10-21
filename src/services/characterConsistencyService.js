import { backendApi } from './backendApi'

/**
 * 角色一致性服务
 */
class CharacterConsistencyService {
  /**
   * AI提取角色特征
   * @param {string} characterId - 角色ID
   * @param {Object} extractData - 提取配置
   * @param {string} extractData.chapterId - 章节ID
   * @param {boolean} extractData.autoConfirm - 是否自动确认
   * @returns {Promise}
   */
  async extractFeatures(characterId, extractData) {
    return await backendApi.post(
      `/api/v1/characters/${characterId}/features/extract`,
      extractData
    )
  }

  /**
   * 获取角色特征列表
   * @param {string} characterId - 角色ID
   * @returns {Promise}
   */
  async getFeatures(characterId) {
    return await backendApi.get(
      `/api/v1/characters/${characterId}/features`
    )
  }

  /**
   * 获取角色统计信息
   * @param {string} characterId - 角色ID
   * @returns {Promise}
   */
  async getStatistics(characterId) {
    return await backendApi.get(
      `/api/v1/characters/${characterId}/statistics`
    )
  }

  /**
   * 获取角色一致性警告
   * @param {string} characterId - 角色ID
   * @returns {Promise}
   */
  async getWarnings(characterId) {
    return await backendApi.get(
      `/api/v1/characters/${characterId}/warnings`
    )
  }

  /**
   * 检查章节中的角色一致性
   * @param {string} chapterId - 章节ID
   * @returns {Promise}
   */
  async checkConsistency(chapterId) {
    return await backendApi.post(
      `/api/v1/chapters/${chapterId}/check-consistency`
    )
  }
}

export default new CharacterConsistencyService()

