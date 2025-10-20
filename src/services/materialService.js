/**
 * 素材管理服务
 * 提供素材的上传、管理、搜索等功能
 */

import apiManager from './apiManager'
import { ElMessage } from 'element-plus'

class MaterialService {
  /**
   * 获取素材列表
   */
  async getMaterials(params = {}) {
    try {
      const response = await apiManager.getMaterials(params)
      if (response.success) {
        return response.data
      }
      throw new Error(response.message || '获取素材列表失败')
    } catch (error) {
      ElMessage.error(error.message || '获取素材列表失败')
      throw error
    }
  }

  /**
   * 获取素材详情
   */
  async getMaterial(materialId) {
    try {
      const response = await apiManager.getMaterial(materialId)
      if (response.success) {
        return response.data
      }
      throw new Error(response.message || '获取素材详情失败')
    } catch (error) {
      ElMessage.error(error.message || '获取素材详情失败')
      throw error
    }
  }

  /**
   * 创建素材
   */
  async createMaterial(materialData) {
    try {
      const response = await apiManager.createMaterial(materialData)
      if (response.success) {
        ElMessage.success('素材创建成功')
        return response.data
      }
      throw new Error(response.message || '创建素材失败')
    } catch (error) {
      ElMessage.error(error.message || '创建素材失败')
      throw error
    }
  }

  /**
   * 更新素材
   */
  async updateMaterial(materialId, updateData) {
    try {
      const response = await apiManager.updateMaterial(materialId, updateData)
      if (response.success) {
        ElMessage.success('素材更新成功')
        return response.data
      }
      throw new Error(response.message || '更新素材失败')
    } catch (error) {
      ElMessage.error(error.message || '更新素材失败')
      throw error
    }
  }

  /**
   * 删除素材
   */
  async deleteMaterial(materialId) {
    try {
      const response = await apiManager.deleteMaterial(materialId)
      if (response.success) {
        ElMessage.success('素材删除成功')
        return response.data
      }
      throw new Error(response.message || '删除素材失败')
    } catch (error) {
      ElMessage.error(error.message || '删除素材失败')
      throw error
    }
  }

  /**
   * 获取素材分类列表
   */
  async getCategories() {
    try {
      const response = await apiManager.getMaterialCategories()
      if (response.success) {
        return response.data || []
      }
      return []
    } catch (error) {
      console.error('获取素材分类失败:', error)
      return []
    }
  }

  /**
   * 获取素材标签列表
   */
  async getTags() {
    try {
      const response = await apiManager.getMaterialTags()
      if (response.success) {
        return response.data || []
      }
      return []
    } catch (error) {
      console.error('获取素材标签失败:', error)
      return []
    }
  }

  /**
   * 获取素材统计信息
   */
  async getStats() {
    try {
      const response = await apiManager.getMaterialStats()
      if (response.success) {
        return response.data
      }
      return { total: 0, byType: [] }
    } catch (error) {
      console.error('获取素材统计失败:', error)
      return { total: 0, byType: [] }
    }
  }

  /**
   * 上传文件到云存储(暂时使用base64编码)
   * TODO: 后续集成OSS云存储
   */
  async uploadFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const fileUrl = e.target.result
        resolve({
          url: fileUrl,
          size: file.size,
          name: file.name,
          type: file.type
        })
      }
      
      reader.onerror = (error) => {
        reject(error)
      }
      
      reader.readAsDataURL(file)
    })
  }

  /**
   * 根据文件类型获取素材类型
   */
  getMaterialType(fileType) {
    if (fileType.startsWith('image/')) {
      return 'IMAGE'
    } else if (fileType.startsWith('video/')) {
      return 'VIDEO'
    } else if (fileType.startsWith('audio/')) {
      return 'AUDIO'
    } else if (
      fileType.includes('pdf') ||
      fileType.includes('doc') ||
      fileType.includes('txt') ||
      fileType.includes('markdown')
    ) {
      return 'DOCUMENT'
    } else {
      return 'TEXT'
    }
  }

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  // ===== 素材引用功能 =====

  /**
   * 添加素材引用记录
   */
  async addMaterialReference(materialId, referenceData) {
    try {
      const response = await apiManager.request({
        method: 'POST',
        url: `/materials/${materialId}/references`,
        data: referenceData
      })
      if (response.success) {
        ElMessage.success('引用记录添加成功')
        return response.data
      }
      throw new Error(response.message || '添加引用记录失败')
    } catch (error) {
      ElMessage.error(error.message || '添加引用记录失败')
      throw error
    }
  }

  /**
   * 获取素材引用列表
   */
  async getMaterialReferences(materialId) {
    try {
      const response = await apiManager.request({
        method: 'GET',
        url: `/materials/${materialId}/references`
      })
      if (response.success) {
        return response.data || []
      }
      throw new Error(response.message || '获取引用列表失败')
    } catch (error) {
      console.error('获取引用列表失败:', error)
      return []
    }
  }

  /**
   * 删除引用记录
   */
  async deleteMaterialReference(referenceId) {
    try {
      const response = await apiManager.request({
        method: 'DELETE',
        url: `/materials/references/${referenceId}`
      })
      if (response.success) {
        ElMessage.success('引用记录删除成功')
        return true
      }
      throw new Error(response.message || '删除引用记录失败')
    } catch (error) {
      ElMessage.error(error.message || '删除引用记录失败')
      throw error
    }
  }

  // ===== 素材分析功能 =====

  /**
   * 分析素材风格
   */
  async analyzeMaterialStyle(materialId, analysisType = 'style') {
    try {
      const response = await apiManager.request({
        method: 'POST',
        url: `/materials/${materialId}/analyze/style`,
        data: { analysisType }
      })
      if (response.success) {
        return response.data
      }
      throw new Error(response.message || '分析失败')
    } catch (error) {
      ElMessage.error(error.message || '分析失败')
      throw error
    }
  }

  /**
   * 检测内容相似度
   */
  async checkSimilarity(materialId, content, threshold = 0.7) {
    try {
      const response = await apiManager.request({
        method: 'POST',
        url: `/materials/${materialId}/check-similarity`,
        data: { content, threshold }
      })
      if (response.success) {
        return response.data
      }
      throw new Error(response.message || '相似度检测失败')
    } catch (error) {
      ElMessage.error(error.message || '相似度检测失败')
      throw error
    }
  }

  // ===== 素材推荐和搜索 =====

  /**
   * 获取推荐素材
   */
  async getRecommendedMaterials(limit = 10) {
    try {
      const response = await apiManager.request({
        method: 'GET',
        url: '/materials/recommendations',
        params: { limit }
      })
      if (response.success) {
        return response.data || []
      }
      throw new Error(response.message || '获取推荐失败')
    } catch (error) {
      console.error('获取推荐素材失败:', error)
      return []
    }
  }

  /**
   * 搜索适用于向导的素材
   */
  async searchWizardMaterials(stepType, keyword, limit = 5) {
    try {
      const response = await apiManager.request({
        method: 'GET',
        url: '/materials/search-for-wizard',
        params: { stepType, keyword, limit }
      })
      if (response.success) {
        return response.data
      }
      throw new Error(response.message || '搜索失败')
    } catch (error) {
      console.error('搜索向导素材失败:', error)
      return { materials: [], total: 0 }
    }
  }
}

export default new MaterialService()
