/**
 * 世界观管理Store
 * 使用Pinia管理世界观设定数据状态
 */

import { defineStore } from 'pinia'
import worldService from '../services/worldService'

export const useWorldStore = defineStore('world', {
  state: () => ({
    // 当前小说的世界观设定列表
    settings: [],
    // 当前选中的设定
    currentSetting: null,
    // 加载状态
    loading: false,
    // 错误信息
    error: null,
    // 当前小说ID
    currentNovelId: null,
    // 分页信息
    pagination: {
      page: 1,
      limit: 100,
      total: 0
    },
    // 筛选条件
    filters: {
      category: null,
      search: ''
    }
  }),

  getters: {
    // 按类别分组
    settingsByCategory: (state) => {
      const groups = {}
      
      state.settings.forEach(setting => {
        const category = setting.category || 'OTHER'
        if (!groups[category]) {
          groups[category] = []
        }
        groups[category].push(setting)
      })
      
      return groups
    },

    // 筛选后的设定列表
    filteredSettings: (state) => {
      let filtered = [...state.settings]
      
      // 按类别筛选
      if (state.filters.category) {
        filtered = filtered.filter(setting => 
          setting.category === state.filters.category
        )
      }
      
      // 搜索过滤
      if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase()
        filtered = filtered.filter(setting =>
          setting.title?.toLowerCase().includes(searchLower) ||
          setting.description?.toLowerCase().includes(searchLower)
        )
      }
      
      return filtered
    },

    // 统计信息
    statistics: (state) => {
      const total = state.settings.length
      const byCategory = {}
      
      state.settings.forEach(setting => {
        const category = setting.category || 'OTHER'
        byCategory[category] = (byCategory[category] || 0) + 1
      })
      
      return {
        total,
        byCategory,
        categories: Object.keys(byCategory).length
      }
    },

    // 获取特定类别的设定
    getSettingsByCategory: (state) => (category) => {
      return state.settings.filter(setting => setting.category === category)
    }
  },

  actions: {
    /**
     * 加载小说的世界观设定列表
     */
    async loadSettings(novelId, params = {}) {
      if (!novelId) {
        console.warn('novelId is required')
        return
      }

      this.loading = true
      this.error = null
      this.currentNovelId = novelId

      try {
        const response = await worldService.getWorldSettings(novelId, {
          ...params,
          page: this.pagination.page,
          limit: this.pagination.limit
        })

        this.settings = response.items || response || []
        if (response.total !== undefined) {
          this.pagination.total = response.total
        }
      } catch (error) {
        this.error = error.message || '加载世界观设定失败'
        console.error('加载世界观设定失败:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * 创建世界观设定
     */
    async createSetting(settingData) {
      this.loading = true
      this.error = null

      try {
        // 确保包含novelId
        if (!settingData.novelId && this.currentNovelId) {
          settingData.novelId = this.currentNovelId
        }

        const newSetting = await worldService.createWorldSetting(settingData)
        this.settings.unshift(newSetting)
        return newSetting
      } catch (error) {
        this.error = error.message || '创建世界观设定失败'
        console.error('创建世界观设定失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 更新世界观设定
     */
    async updateSetting(settingId, updateData) {
      this.loading = true
      this.error = null

      try {
        const updatedSetting = await worldService.updateWorldSetting(settingId, updateData)
        
        const index = this.settings.findIndex(setting => setting.id === settingId)
        if (index !== -1) {
          this.settings[index] = updatedSetting
        }
        
        if (this.currentSetting?.id === settingId) {
          this.currentSetting = updatedSetting
        }
        
        return updatedSetting
      } catch (error) {
        this.error = error.message || '更新世界观设定失败'
        console.error('更新世界观设定失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 删除世界观设定
     */
    async deleteSetting(settingId) {
      this.loading = true
      this.error = null

      try {
        await worldService.deleteWorldSetting(settingId)
        
        this.settings = this.settings.filter(setting => setting.id !== settingId)
        
        if (this.currentSetting?.id === settingId) {
          this.currentSetting = null
        }
      } catch (error) {
        this.error = error.message || '删除世界观设定失败'
        console.error('删除世界观设定失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 批量生成世界观设定
     */
    async batchGenerateSettings(novelId, config) {
      this.loading = true
      this.error = null

      try {
        const newSettings = await worldService.batchGenerateSettings(novelId, config)
        this.settings.unshift(...newSettings)
        return newSettings
      } catch (error) {
        this.error = error.message || '批量生成世界观设定失败'
        console.error('批量生成世界观设定失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 设置当前设定
     */
    setCurrentSetting(setting) {
      this.currentSetting = setting
    },

    /**
     * 设置筛选条件
     */
    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
    },

    /**
     * 重置筛选条件
     */
    resetFilters() {
      this.filters = {
        category: null,
        search: ''
      }
    },

    /**
     * 清空数据
     */
    clearData() {
      this.settings = []
      this.currentSetting = null
      this.currentNovelId = null
      this.error = null
      this.resetFilters()
    }
  }
})
