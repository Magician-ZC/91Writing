/**
 * 提示词管理服务
 * 提供提示词的创建、管理、搜索、评分等功能
 */

import apiManager from './apiManager'
import { ElMessage } from 'element-plus'

class PromptService {
  /**
   * 获取提示词列表
   */
  async getPrompts(params = {}) {
    try {
      const response = await apiManager.getPrompts(params)
      if (response.success) {
        return response.data
      }
      throw new Error(response.message || '获取提示词列表失败')
    } catch (error) {
      ElMessage.error(error.message || '获取提示词列表失败')
      throw error
    }
  }

  /**
   * 获取提示词详情
   */
  async getPrompt(promptId) {
    try {
      const response = await apiManager.getPrompt(promptId)
      if (response.success) {
        return response.data
      }
      throw new Error(response.message || '获取提示词详情失败')
    } catch (error) {
      ElMessage.error(error.message || '获取提示词详情失败')
      throw error
    }
  }

  /**
   * 创建提示词
   */
  async createPrompt(promptData) {
    try {
      const response = await apiManager.createPrompt(promptData)
      if (response.success) {
        ElMessage.success('提示词创建成功')
        return response.data
      }
      throw new Error(response.message || '创建提示词失败')
    } catch (error) {
      ElMessage.error(error.message || '创建提示词失败')
      throw error
    }
  }

  /**
   * 更新提示词
   */
  async updatePrompt(promptId, updateData) {
    try {
      const response = await apiManager.updatePrompt(promptId, updateData)
      if (response.success) {
        ElMessage.success('提示词更新成功')
        return response.data
      }
      throw new Error(response.message || '更新提示词失败')
    } catch (error) {
      ElMessage.error(error.message || '更新提示词失败')
      throw error
    }
  }

  /**
   * 删除提示词
   */
  async deletePrompt(promptId) {
    try {
      const response = await apiManager.deletePrompt(promptId)
      if (response.success) {
        ElMessage.success('提示词删除成功')
        return response.data
      }
      throw new Error(response.message || '删除提示词失败')
    } catch (error) {
      ElMessage.error(error.message || '删除提示词失败')
      throw error
    }
  }

  /**
   * 评分提示词
   */
  async ratePrompt(promptId, rating) {
    try {
      const response = await apiManager.ratePrompt(promptId, rating)
      if (response.success) {
        ElMessage.success('评分成功')
        return response.data
      }
      throw new Error(response.message || '评分失败')
    } catch (error) {
      ElMessage.error(error.message || '评分失败')
      throw error
    }
  }

  /**
   * 获取提示词分类列表
   */
  async getCategories() {
    try {
      const response = await apiManager.getPromptCategories()
      if (response.success) {
        return response.data || []
      }
      return []
    } catch (error) {
      console.error('获取提示词分类失败:', error)
      return []
    }
  }

  /**
   * 获取提示词标签列表
   */
  async getTags() {
    try {
      const response = await apiManager.getPromptTags()
      if (response.success) {
        return response.data || []
      }
      return []
    } catch (error) {
      console.error('获取提示词标签失败:', error)
      return []
    }
  }

  /**
   * 获取热门提示词
   */
  async getPopular(limit = 10) {
    try {
      const response = await apiManager.getPopularPrompts(limit)
      if (response.success) {
        return response.data || []
      }
      return []
    } catch (error) {
      console.error('获取热门提示词失败:', error)
      return []
    }
  }

  /**
   * 获取推荐提示词
   */
  async getRecommended(limit = 10) {
    try {
      const response = await apiManager.getRecommendedPrompts(limit)
      if (response.success) {
        return response.data || []
      }
      return []
    } catch (error) {
      console.error('获取推荐提示词失败:', error)
      return []
    }
  }
}

export default new PromptService()
