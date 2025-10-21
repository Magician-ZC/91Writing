import apiManager from './apiManager'

/**
 * Agent配置服务
 */
class AgentConfigService {
  /**
   * 获取所有Agent配置
   * @param {string} agentType 可选的Agent类型筛选
   */
  async getAllConfigs(agentType = null) {
    try {
      const params = agentType ? { agentType } : {}
      const response = await apiManager.get('/admin/agent-prompts', { params })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取Agent配置失败')
    }
  }

  /**
   * 获取指定类型的激活配置
   * @param {string} agentType Agent类型
   */
  async getActiveConfig(agentType) {
    try {
      const response = await apiManager.get(`/admin/agent-prompts/active/${agentType}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取激活配置失败')
    }
  }

  /**
   * 获取单个配置详情
   * @param {string} id 配置ID
   */
  async getConfig(id) {
    try {
      const response = await apiManager.get(`/admin/agent-prompts/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取配置详情失败')
    }
  }

  /**
   * 创建Agent配置
   * @param {Object} data 配置数据
   */
  async createConfig(data) {
    try {
      const response = await apiManager.post('/admin/agent-prompts', data)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || '创建配置失败')
    }
  }

  /**
   * 更新Agent配置
   * @param {string} id 配置ID
   * @param {Object} data 更新数据
   */
  async updateConfig(id, data) {
    try {
      const response = await apiManager.put(`/admin/agent-prompts/${id}`, data)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || '更新配置失败')
    }
  }

  /**
   * 删除Agent配置
   * @param {string} id 配置ID
   */
  async deleteConfig(id) {
    try {
      const response = await apiManager.delete(`/admin/agent-prompts/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || '删除配置失败')
    }
  }

  /**
   * 测试Agent配置
   * @param {Object} testData 测试数据
   */
  async testConfig(testData) {
    try {
      const response = await apiManager.post('/admin/agent-prompts/test', testData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || '测试失败')
    }
  }

  /**
   * 激活指定配置
   * @param {string} id 配置ID
   */
  async activateConfig(id) {
    try {
      const response = await apiManager.put(`/admin/agent-prompts/${id}`, {
        isActive: true
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || '激活配置失败')
    }
  }

  /**
   * 复制配置
   * @param {Object} config 原配置
   */
  duplicateConfig(config) {
    return {
      agentType: config.agentType,
      name: `${config.name} (副本)`,
      systemPrompt: config.systemPrompt,
      templatePrompt: config.templatePrompt,
      parameters: config.parameters || {},
      description: config.description,
      isActive: false
    }
  }

  /**
   * 导出配置
   * @param {Object} config 配置对象
   */
  exportConfig(config) {
    const dataStr = JSON.stringify(config, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `agent-config-${config.agentType}-v${config.version}.json`
    link.click()
    
    URL.revokeObjectURL(url)
  }

  /**
   * 导入配置
   * @param {File} file 文件对象
   */
  async importConfig(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target.result)
          resolve(config)
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

  /**
   * 获取默认测试输入
   * @param {string} agentType Agent类型
   */
  getDefaultTestInput(agentType) {
    const testInputs = {
      'SCRIPT_GENERATOR': `第一章：神秘的图书馆

李明是一位年轻的考古学家，这天他来到了传说中的古老图书馆。阳光透过彩色玻璃窗洒在书架上，空气中弥漫着古籍的味道。

他小心翼翼地翻开一本泛黄的书籍，突然发现了一张神秘的地图。地图上标记着一个失落已久的古城遗址。

就在这时，图书管理员王芳走了过来，她看起来有些紧张...`,
      
      'IMAGE_OPTIMIZER': `李明站在图书馆中央，周围是高耸的书架，阳光透过彩色玻璃窗照射进来，在地面上形成斑驳的光影。他手中拿着一本古老的书籍，表情专注。`,
      
      'VIDEO_OPTIMIZER': `李明缓缓转头，目光从书架扫向窗外。阳光在他的脸上移动，书页在风中轻轻翻动。`,
      
      'CONSISTENCY_KEEPER': `角色：李明
外貌：25岁男性，身高180cm，黑色短发，深邃的眼睛，轮廓分明
服饰：深蓝色考古服，棕色皮质背包，戴着考古手套`
    }
    return testInputs[agentType] || '测试内容...'
  }

  /**
   * 格式化Agent类型显示名称
   * @param {string} agentType Agent类型
   */
  getAgentTypeName(agentType) {
    const names = {
      'SCRIPT_GENERATOR': '分镜脚本生成Agent',
      'IMAGE_OPTIMIZER': '文生图优化Agent',
      'VIDEO_OPTIMIZER': '图生视频优化Agent',
      'CONSISTENCY_KEEPER': '一致性管理Agent'
    }
    return names[agentType] || agentType
  }

  /**
   * 获取Agent类型描述
   * @param {string} agentType Agent类型
   */
  getAgentTypeDescription(agentType) {
    const descriptions = {
      'SCRIPT_GENERATOR': '负责分析章节内容，生成3-8个分镜场景描述',
      'IMAGE_OPTIMIZER': '负责将分镜描述优化为专业的文生图提示词',
      'VIDEO_OPTIMIZER': '负责生成图生视频的运动提示词和参数',
      'CONSISTENCY_KEEPER': '负责管理角色、场景的视觉一致性'
    }
    return descriptions[agentType] || ''
  }
}

export const agentConfigService = new AgentConfigService()
export default agentConfigService

