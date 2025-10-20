import apiManager from './apiManager'

/**
 * 一致性配置服务
 */
class ConsistencyService {
  /**
   * 创建一致性配置
   * @param {Object} data 配置数据
   * @param {string} data.novelId 小说ID
   * @param {Array} data.characters 角色列表
   * @param {Array} data.environments 环境列表
   * @param {Array} data.objects 物品列表
   * @param {Object} data.visualStyle 视觉风格
   */
  async createProfile(data) {
    try {
      const response = await apiManager.post('/novel/consistency', data)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || '创建配置失败')
    }
  }

  /**
   * 获取一致性配置
   * @param {string} novelId 小说ID
   */
  async getProfile(novelId) {
    try {
      const response = await apiManager.get(`/novel/consistency/${novelId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取配置失败')
    }
  }

  /**
   * 更新一致性配置
   * @param {string} novelId 小说ID
   * @param {Object} data 配置数据
   */
  async updateProfile(novelId, data) {
    try {
      const response = await apiManager.put(`/novel/consistency/${novelId}`, data)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || '更新配置失败')
    }
  }

  /**
   * 自动提取一致性配置
   * @param {Object} params 提取参数
   * @param {string} params.novelId 小说ID
   * @param {number} params.startChapter 起始章节
   * @param {number} params.endChapter 结束章节
   * @param {boolean} params.overwrite 是否覆盖现有配置
   */
  async autoExtract(params) {
    try {
      const response = await apiManager.post('/novel/consistency/auto-extract', params)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || '自动提取失败')
    }
  }

  /**
   * 添加角色
   * @param {string} novelId 小说ID
   * @param {Object} character 角色数据
   */
  async addCharacter(novelId, character) {
    try {
      // 先获取现有配置
      const profile = await this.getProfile(novelId)
      
      // 添加新角色
      const characters = [...(profile.characters || []), character]
      
      // 更新配置
      return await this.updateProfile(novelId, { characters })
    } catch (error) {
      throw new Error('添加角色失败')
    }
  }

  /**
   * 更新角色
   * @param {string} novelId 小说ID
   * @param {string} characterName 角色名称
   * @param {Object} updates 更新数据
   */
  async updateCharacter(novelId, characterName, updates) {
    try {
      const profile = await this.getProfile(novelId)
      
      const characters = profile.characters.map(char => 
        char.name === characterName ? { ...char, ...updates } : char
      )
      
      return await this.updateProfile(novelId, { characters })
    } catch (error) {
      throw new Error('更新角色失败')
    }
  }

  /**
   * 删除角色
   * @param {string} novelId 小说ID
   * @param {string} characterName 角色名称
   */
  async deleteCharacter(novelId, characterName) {
    try {
      const profile = await this.getProfile(novelId)
      
      const characters = profile.characters.filter(char => char.name !== characterName)
      
      return await this.updateProfile(novelId, { characters })
    } catch (error) {
      throw new Error('删除角色失败')
    }
  }

  /**
   * 更新角色状态
   * @param {string} novelId 小说ID
   * @param {string} characterName 角色名称
   * @param {number} chapterNumber 章节号
   * @param {string} state 状态描述
   */
  async updateCharacterState(novelId, characterName, chapterNumber, state) {
    try {
      const profile = await this.getProfile(novelId)
      
      const characters = profile.characters.map(char => {
        if (char.name === characterName) {
          return {
            ...char,
            dynamicState: {
              ...(char.dynamicState || {}),
              [chapterNumber]: state
            }
          }
        }
        return char
      })
      
      return await this.updateProfile(novelId, { characters })
    } catch (error) {
      throw new Error('更新角色状态失败')
    }
  }

  /**
   * 验证配置完整性
   * @param {Object} profile 配置数据
   */
  validateProfile(profile) {
    const errors = []

    if (!profile.characters || profile.characters.length === 0) {
      errors.push('至少需要一个角色配置')
    }

    profile.characters?.forEach((char, index) => {
      if (!char.name) {
        errors.push(`角色 ${index + 1} 缺少名称`)
      }
      if (!char.baseAppearance) {
        errors.push(`角色 ${char.name} 缺少外貌描述`)
      }
      if (!char.keywords || char.keywords.length === 0) {
        errors.push(`角色 ${char.name} 缺少关键词`)
      }
    })

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * 生成默认配置
   * @param {string} novelId 小说ID
   */
  generateDefaultProfile(novelId) {
    return {
      novelId,
      characters: [],
      environments: [],
      objects: [],
      visualStyle: {
        overall: 'realistic',
        colorTone: 'natural',
        artStyle: 'cinematic',
        lighting: 'natural',
        additionalTags: []
      }
    }
  }

  /**
   * 导出配置
   * @param {Object} profile 配置数据
   * @param {string} format 格式 (json|yaml)
   */
  exportProfile(profile, format = 'json') {
    if (format === 'json') {
      const dataStr = JSON.stringify(profile, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `consistency-profile-${profile.novelId}.json`
      link.click()
      
      URL.revokeObjectURL(url)
    }
  }

  /**
   * 导入配置
   * @param {File} file 文件对象
   */
  async importProfile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const profile = JSON.parse(e.target.result)
          resolve(profile)
        } catch (error) {
          reject(new Error('文件格式错误'))
        }
      }
      
      reader.onerror = () => {
        reject(new Error('文件读取失败'))
      }
      
      reader.readAsText(file)
    })
  }
}

export const consistencyService = new ConsistencyService()
export default consistencyService

