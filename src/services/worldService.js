/**
 * 世界观管理服务
 * 提供世界观设定的创建、管理、查询等功能
 */

import apiManager from './apiManager'
import { ElMessage } from 'element-plus'

class WorldService {
  /**
   * 获取小说的世界观设定列表
   * @param {string} novelId - 小说ID
   * @param {Object} params - 查询参数 { category, page, limit }
   */
  async getWorldSettings(novelId, params = {}) {
    try {
      const response = await apiManager.getWorldSettings(novelId, params)
      if (response.success) {
        return response.data
      }
      throw new Error(response.message || '获取世界观设定列表失败')
    } catch (error) {
      console.error('获取世界观设定列表失败:', error)
      ElMessage.error(error.message || '获取世界观设定列表失败')
      throw error
    }
  }

  /**
   * 获取世界观设定详情
   * @param {string} settingId - 设定ID
   */
  async getWorldSetting(settingId) {
    try {
      const response = await apiManager.getWorldSetting(settingId)
      if (response.success) {
        return response.data
      }
      throw new Error(response.message || '获取世界观设定详情失败')
    } catch (error) {
      console.error('获取世界观设定详情失败:', error)
      ElMessage.error(error.message || '获取世界观设定详情失败')
      throw error
    }
  }

  /**
   * 创建世界观设定
   * @param {Object} settingData - 设定数据
   */
  async createWorldSetting(settingData) {
    try {
      const response = await apiManager.createWorldSetting(settingData)
      if (response.success) {
        ElMessage.success('世界观设定创建成功')
        return response.data
      }
      throw new Error(response.message || '创建世界观设定失败')
    } catch (error) {
      console.error('创建世界观设定失败:', error)
      ElMessage.error(error.message || '创建世界观设定失败')
      throw error
    }
  }

  /**
   * 更新世界观设定
   * @param {string} settingId - 设定ID
   * @param {Object} updateData - 更新数据
   */
  async updateWorldSetting(settingId, updateData) {
    try {
      const response = await apiManager.updateWorldSetting(settingId, updateData)
      if (response.success) {
        ElMessage.success('世界观设定更新成功')
        return response.data
      }
      throw new Error(response.message || '更新世界观设定失败')
    } catch (error) {
      console.error('更新世界观设定失败:', error)
      ElMessage.error(error.message || '更新世界观设定失败')
      throw error
    }
  }

  /**
   * 删除世界观设定
   * @param {string} settingId - 设定ID
   */
  async deleteWorldSetting(settingId) {
    try {
      const response = await apiManager.deleteWorldSetting(settingId)
      if (response.success) {
        ElMessage.success('世界观设定删除成功')
        return response.data
      }
      throw new Error(response.message || '删除世界观设定失败')
    } catch (error) {
      console.error('删除世界观设定失败:', error)
      ElMessage.error(error.message || '删除世界观设定失败')
      throw error
    }
  }

  /**
   * 批量生成世界观设定（AI生成）
   * @param {string} novelId - 小说ID
   * @param {Object} config - 生成配置
   */
  async batchGenerateSettings(novelId, config = {}) {
    try {
      const settings = []
      const count = config.count || 1
      
      // 根据配置的类型生成不同类别的设定
      const categories = []
      if (config.includeGeography) categories.push('GEOGRAPHY')
      if (config.includeCulture) categories.push('CULTURE')
      if (config.includeHistory) categories.push('HISTORY')
      if (config.includeMagic) categories.push('MAGIC')
      if (config.includeTechnology) categories.push('TECHNOLOGY')
      if (config.includePolitics) categories.push('POLITICS')
      if (config.includeReligion) categories.push('RELIGION')
      if (config.includeEconomy) categories.push('ECONOMY')
      if (config.includeRaces) categories.push('RACES')
      if (config.includeLanguage) categories.push('LANGUAGE')
      
      // 如果没有选择类别，默认生成基础设定
      if (categories.length === 0) {
        categories.push('GEOGRAPHY', 'CULTURE', 'HISTORY')
      }
      
      for (let i = 0; i < Math.min(count, categories.length); i++) {
        const category = categories[i]
        const settingData = {
          novelId,
          category,
          title: config.titles?.[i] || `${this.getCategoryText(category)}设定`,
          description: config.descriptions?.[i] || '',
          details: config.details?.[i] || {},
          generated: true
        }
        
        const response = await this.createWorldSetting(settingData)
        settings.push(response)
      }
      
      return settings
    } catch (error) {
      console.error('批量生成世界观设定失败:', error)
      throw error
    }
  }

  /**
   * 格式化世界观设定用于显示
   * @param {Object} setting - 原始设定数据
   */
  formatWorldSetting(setting) {
    return {
      ...setting,
      categoryText: this.getCategoryText(setting.category)
    }
  }

  /**
   * 获取类别文本
   */
  getCategoryText(category) {
    const categoryMap = {
      'GEOGRAPHY': '地理环境',
      'CULTURE': '文化社会',
      'HISTORY': '历史背景',
      'MAGIC': '魔法体系',
      'TECHNOLOGY': '科技水平',
      'POLITICS': '政治势力',
      'RELIGION': '宗教信仰',
      'ECONOMY': '经济贸易',
      'RACES': '种族设定',
      'LANGUAGE': '语言文字',
      'LOCATION': '地点位置',
      'ORGANIZATION': '组织机构',
      'ITEM': '物品道具',
      'LAW': '规则法则',
      'OTHER': '其他设定'
    }
    return categoryMap[category] || '未知类别'
  }

  /**
   * 获取类别标签类型（用于Element Plus Tag组件）
   */
  getCategoryTagType(category) {
    const typeMap = {
      'GEOGRAPHY': 'primary',
      'CULTURE': 'success',
      'HISTORY': 'warning',
      'MAGIC': 'danger',
      'TECHNOLOGY': 'info',
      'POLITICS': 'warning',
      'RELIGION': 'primary',
      'ECONOMY': 'success',
      'RACES': 'danger',
      'LANGUAGE': 'info',
      'LOCATION': 'primary',
      'ORGANIZATION': 'warning',
      'ITEM': 'success',
      'LAW': 'danger',
      'OTHER': ''
    }
    return typeMap[category] || ''
  }

  /**
   * 验证世界观设定数据
   */
  validateSettingData(data) {
    const errors = []
    
    if (!data.title || data.title.trim() === '') {
      errors.push('设定标题不能为空')
    }
    
    if (!data.novelId) {
      errors.push('必须指定所属小说')
    }
    
    if (!data.category) {
      errors.push('必须选择设定类别')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * 获取所有可用类别
   */
  getAllCategories() {
    return [
      { value: 'GEOGRAPHY', label: '地理环境', icon: '🌍' },
      { value: 'CULTURE', label: '文化社会', icon: '🎭' },
      { value: 'HISTORY', label: '历史背景', icon: '📜' },
      { value: 'MAGIC', label: '魔法体系', icon: '✨' },
      { value: 'TECHNOLOGY', label: '科技水平', icon: '🔬' },
      { value: 'POLITICS', label: '政治势力', icon: '⚔️' },
      { value: 'RELIGION', label: '宗教信仰', icon: '🙏' },
      { value: 'ECONOMY', label: '经济贸易', icon: '💰' },
      { value: 'RACES', label: '种族设定', icon: '👥' },
      { value: 'LANGUAGE', label: '语言文字', icon: '📖' },
      { value: 'LOCATION', label: '地点位置', icon: '📍' },
      { value: 'ORGANIZATION', label: '组织机构', icon: '🏛️' },
      { value: 'ITEM', label: '物品道具', icon: '🎁' },
      { value: 'LAW', label: '规则法则', icon: '⚖️' },
      { value: 'OTHER', label: '其他设定', icon: '📝' }
    ]
  }
}

export default new WorldService()
