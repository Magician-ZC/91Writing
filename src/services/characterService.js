/**
 * 角色管理服务
 * 提供角色的创建、管理、查询等功能
 */

import apiManager from './apiManager'
import { ElMessage } from 'element-plus'

class CharacterService {
  /**
   * 获取小说的角色列表
   * @param {string} novelId - 小说ID
   * @param {Object} params - 查询参数 { role, importance, page, limit }
   */
  async getCharacters(novelId, params = {}) {
    try {
      const response = await apiManager.getCharacters(novelId, params)
      if (response.success) {
        return response.data
      }
      throw new Error(response.message || '获取角色列表失败')
    } catch (error) {
      console.error('获取角色列表失败:', error)
      ElMessage.error(error.message || '获取角色列表失败')
      throw error
    }
  }

  /**
   * 获取角色详情
   * @param {string} characterId - 角色ID
   */
  async getCharacter(characterId) {
    try {
      const response = await apiManager.getCharacter(characterId)
      if (response.success) {
        return response.data
      }
      throw new Error(response.message || '获取角色详情失败')
    } catch (error) {
      console.error('获取角色详情失败:', error)
      ElMessage.error(error.message || '获取角色详情失败')
      throw error
    }
  }

  /**
   * 创建角色
   * @param {Object} characterData - 角色数据
   */
  async createCharacter(characterData) {
    try {
      const response = await apiManager.createCharacter(characterData)
      if (response.success) {
        ElMessage.success('角色创建成功')
        return response.data
      }
      throw new Error(response.message || '创建角色失败')
    } catch (error) {
      console.error('创建角色失败:', error)
      ElMessage.error(error.message || '创建角色失败')
      throw error
    }
  }

  /**
   * 更新角色
   * @param {string} characterId - 角色ID
   * @param {Object} updateData - 更新数据
   */
  async updateCharacter(characterId, updateData) {
    try {
      const response = await apiManager.updateCharacter(characterId, updateData)
      if (response.success) {
        ElMessage.success('角色更新成功')
        return response.data
      }
      throw new Error(response.message || '更新角色失败')
    } catch (error) {
      console.error('更新角色失败:', error)
      ElMessage.error(error.message || '更新角色失败')
      throw error
    }
  }

  /**
   * 删除角色
   * @param {string} characterId - 角色ID
   */
  async deleteCharacter(characterId) {
    try {
      const response = await apiManager.deleteCharacter(characterId)
      if (response.success) {
        ElMessage.success('角色删除成功')
        return response.data
      }
      throw new Error(response.message || '删除角色失败')
    } catch (error) {
      console.error('删除角色失败:', error)
      ElMessage.error(error.message || '删除角色失败')
      throw error
    }
  }

  /**
   * 批量创建角色（AI生成）
   * @param {string} novelId - 小说ID
   * @param {Object} config - 生成配置
   */
  async batchGenerateCharacters(novelId, config = {}) {
    try {
      const characters = []
      const count = config.count || 1
      
      for (let i = 0; i < count; i++) {
        const characterData = {
          novelId,
          name: config.names?.[i] || `角色${i + 1}`,
          role: config.role || 'SUPPORTING',
          description: config.descriptions?.[i] || '',
          personality: config.personalities?.[i] || '',
          background: config.backgrounds?.[i] || '',
          generated: true
        }
        
        const response = await this.createCharacter(characterData)
        characters.push(response)
      }
      
      return characters
    } catch (error) {
      console.error('批量生成角色失败:', error)
      throw error
    }
  }

  /**
   * 格式化角色数据用于显示
   * @param {Object} character - 原始角色数据
   */
  formatCharacter(character) {
    return {
      ...character,
      roleText: this.getRoleText(character.role),
      genderText: this.getGenderText(character.gender),
      importanceLevel: this.getImportanceLevel(character.importance)
    }
  }

  /**
   * 获取角色定位文本
   */
  getRoleText(role) {
    const roleMap = {
      'PROTAGONIST': '主角',
      'SUPPORTING': '配角',
      'ANTAGONIST': '反派',
      'MINOR': '龙套',
      'OTHER': '其他'
    }
    return roleMap[role] || '未知'
  }

  /**
   * 获取性别文本
   */
  getGenderText(gender) {
    const genderMap = {
      'MALE': '男',
      'FEMALE': '女',
      'OTHER': '其他',
      'UNKNOWN': '未知'
    }
    return genderMap[gender] || '未知'
  }

  /**
   * 获取重要性级别
   */
  getImportanceLevel(importance) {
    if (!importance) return '未设置'
    if (importance >= 80) return '核心'
    if (importance >= 60) return '重要'
    if (importance >= 40) return '一般'
    return '次要'
  }

  /**
   * 验证角色数据
   */
  validateCharacterData(data) {
    const errors = []
    
    if (!data.name || data.name.trim() === '') {
      errors.push('角色名称不能为空')
    }
    
    if (!data.novelId) {
      errors.push('必须指定所属小说')
    }
    
    if (!data.role) {
      errors.push('必须选择角色定位')
    }
    
    if (data.importance !== undefined) {
      if (data.importance < 0 || data.importance > 100) {
        errors.push('重要性评分必须在0-100之间')
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
}

export default new CharacterService()
