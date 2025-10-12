/**
 * AI配置服务
 * 统一管理AI配置的获取和管理
 */

import apiManager from './apiManager'

class AIConfigService {
  /**
   * 获取所有可用的AI配置（全局+自定义）
   * @returns {Promise<{system: Array, user: Array, default: string}>}
   */
  async getAvailableConfigs() {
    try {
      return await apiManager.getAvailableAIConfigs()
    } catch (error) {
      console.error('获取可用AI配置失败:', error)
      // 降级到localStorage
      return this.getFallbackConfigs()
    }
  }

  /**
   * 获取用户自定义配置列表
   * @returns {Promise<Array>}
   */
  async getUserConfigs() {
    try {
      return await apiManager.getUserAIConfigs()
    } catch (error) {
      console.error('获取用户配置失败:', error)
      return []
    }
  }

  /**
   * 创建用户自定义配置
   * @param {Object} config - 配置对象
   * @returns {Promise<Object>}
   */
  async createConfig(config) {
    try {
      return await apiManager.createAIConfig(config)
    } catch (error) {
      console.error('创建配置失败:', error)
      throw error
    }
  }

  /**
   * 更新用户自定义配置
   * @param {string} configId - 配置ID
   * @param {Object} config - 配置对象
   * @returns {Promise<Object>}
   */
  async updateConfig(configId, config) {
    try {
      return await apiManager.updateAIConfig(configId, config)
    } catch (error) {
      console.error('更新配置失败:', error)
      throw error
    }
  }

  /**
   * 删除用户自定义配置
   * @param {string} configId - 配置ID
   * @returns {Promise<void>}
   */
  async deleteConfig(configId) {
    try {
      return await apiManager.deleteAIConfig(configId)
    } catch (error) {
      console.error('删除配置失败:', error)
      throw error
    }
  }

  /**
   * 设置默认配置
   * @param {string} configId - 配置ID
   * @returns {Promise<void>}
   */
  async setDefaultConfig(configId) {
    try {
      return await apiManager.setDefaultAIConfig(configId)
    } catch (error) {
      console.error('设置默认配置失败:', error)
      throw error
    }
  }

  /**
   * 根据配置ID获取配置对象
   * @param {string} configId - 格式: "system:id" 或 "user:id"
   * @returns {Promise<Object|null>}
   */
  async getConfigById(configId) {
    if (!configId) return null

    const available = await this.getAvailableConfigs()
    const [type, id] = configId.split(':')

    if (type === 'system') {
      return available.system.find(c => c.id === id) || null
    } else if (type === 'user') {
      return available.user.find(c => c.id === id) || null
    }

    return null
  }

  /**
   * 获取默认配置
   * @returns {Promise<Object|null>}
   */
  async getDefaultConfig() {
    try {
      const available = await this.getAvailableConfigs()
      return this.getConfigById(available.default)
    } catch (error) {
      console.error('获取默认配置失败:', error)
      return this.getFallbackDefaultConfig()
    }
  }

  /**
   * 降级方案：从localStorage获取配置
   * @private
   */
  getFallbackConfigs() {
    try {
      const configs = JSON.parse(localStorage.getItem('aiApiConfigs') || '[]')
      return {
        system: [],
        user: configs.map(c => ({
          id: c.id,
          name: c.name,
          provider: c.type?.toUpperCase() || 'CUSTOM',
          model: c.model,
          enabled: c.enabled,
          isDefault: c.isDefault
        })),
        default: configs.find(c => c.isDefault)?.id ? `user:${configs.find(c => c.isDefault).id}` : ''
      }
    } catch (error) {
      console.error('降级配置获取失败:', error)
      return { system: [], user: [], default: '' }
    }
  }

  /**
   * 降级方案：获取默认配置
   * @private
   */
  getFallbackDefaultConfig() {
    try {
      const configs = JSON.parse(localStorage.getItem('aiApiConfigs') || '[]')
      return configs.find(c => c.isDefault) || configs[0] || null
    } catch (error) {
      return null
    }
  }

  /**
   * 测试配置连接
   * @param {Object} config - 配置对象
   * @returns {Promise<{success: boolean, message: string, responseTime?: number}>}
   */
  async testConfig(config) {
    try {
      return await apiManager.testAIConfig(config)
    } catch (error) {
      return {
        success: false,
        message: error.message || '连接测试失败'
      }
    }
  }

  /**
   * 迁移localStorage配置到云端
   * @returns {Promise<{success: boolean, migrated: number}>}
   */
  async migrateLocalConfigs() {
    try {
      const localConfigs = JSON.parse(localStorage.getItem('aiApiConfigs') || '[]')
      let migrated = 0

      for (const config of localConfigs) {
        try {
          await this.createConfig({
            name: config.name,
            provider: config.type?.toUpperCase() || 'CUSTOM',
            model: config.model,
            apiUrl: config.apiUrl,
            apiKey: config.apiKey,
            enabled: config.enabled,
            isDefault: config.isDefault,
            parameters: {
              temperature: config.temperature,
              maxTokens: config.maxTokens,
              topP: config.topP,
              frequencyPenalty: config.frequencyPenalty,
              presencePenalty: config.presencePenalty
            }
          })
          migrated++
        } catch (error) {
          console.error(`迁移配置 ${config.name} 失败:`, error)
        }
      }

      // 迁移成功后备份原配置
      if (migrated > 0) {
        localStorage.setItem('aiApiConfigs.backup', localStorage.getItem('aiApiConfigs'))
        localStorage.removeItem('aiApiConfigs')
      }

      return { success: true, migrated }
    } catch (error) {
      console.error('迁移配置失败:', error)
      return { success: false, migrated: 0 }
    }
  }
}

export const aiConfigService = new AIConfigService()
export default aiConfigService

