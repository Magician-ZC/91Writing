/**
 * 角色管理Store
 * 使用Pinia管理角色数据状态
 */

import { defineStore } from 'pinia'
import characterService from '../services/characterService'

export const useCharacterStore = defineStore('character', {
  state: () => ({
    // 当前小说的角色列表
    characters: [],
    // 当前选中的角色
    currentCharacter: null,
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
      role: null,
      importance: null,
      search: ''
    }
  }),

  getters: {
    // 按角色定位分组
    charactersByRole: (state) => {
      const groups = {
        PROTAGONIST: [],
        SUPPORTING: [],
        ANTAGONIST: [],
        MINOR: [],
        OTHER: []
      }
      
      state.characters.forEach(char => {
        if (groups[char.role]) {
          groups[char.role].push(char)
        } else {
          groups.OTHER.push(char)
        }
      })
      
      return groups
    },

    // 主要角色（重要性>=60）
    majorCharacters: (state) => {
      return state.characters.filter(char => 
        char.importance && char.importance >= 60
      )
    },

    // 筛选后的角色列表
    filteredCharacters: (state) => {
      let filtered = [...state.characters]
      
      // 按角色定位筛选
      if (state.filters.role) {
        filtered = filtered.filter(char => char.role === state.filters.role)
      }
      
      // 按重要性筛选
      if (state.filters.importance) {
        const minImportance = state.filters.importance
        filtered = filtered.filter(char => 
          char.importance && char.importance >= minImportance
        )
      }
      
      // 搜索过滤
      if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase()
        filtered = filtered.filter(char =>
          char.name?.toLowerCase().includes(searchLower) ||
          char.description?.toLowerCase().includes(searchLower) ||
          char.personality?.toLowerCase().includes(searchLower)
        )
      }
      
      return filtered
    },

    // 统计信息
    statistics: (state) => {
      const total = state.characters.length
      const byRole = {
        PROTAGONIST: 0,
        SUPPORTING: 0,
        ANTAGONIST: 0,
        MINOR: 0,
        OTHER: 0
      }
      
      state.characters.forEach(char => {
        if (byRole[char.role] !== undefined) {
          byRole[char.role]++
        } else {
          byRole.OTHER++
        }
      })
      
      return {
        total,
        byRole,
        averageImportance: total > 0
          ? state.characters.reduce((sum, char) => sum + (char.importance || 0), 0) / total
          : 0
      }
    }
  },

  actions: {
    /**
     * 加载小说的角色列表
     */
    async loadCharacters(novelId, params = {}) {
      if (!novelId) {
        console.warn('novelId is required')
        return
      }

      this.loading = true
      this.error = null
      this.currentNovelId = novelId

      try {
        const response = await characterService.getCharacters(novelId, {
          ...params,
          page: this.pagination.page,
          limit: this.pagination.limit
        })

        this.characters = response.items || response || []
        if (response.total !== undefined) {
          this.pagination.total = response.total
        }
      } catch (error) {
        this.error = error.message || '加载角色列表失败'
        console.error('加载角色列表失败:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * 创建角色
     */
    async createCharacter(characterData) {
      this.loading = true
      this.error = null

      try {
        // 确保包含novelId
        if (!characterData.novelId && this.currentNovelId) {
          characterData.novelId = this.currentNovelId
        }

        const newCharacter = await characterService.createCharacter(characterData)
        this.characters.unshift(newCharacter)
        return newCharacter
      } catch (error) {
        this.error = error.message || '创建角色失败'
        console.error('创建角色失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 更新角色
     */
    async updateCharacter(characterId, updateData) {
      this.loading = true
      this.error = null

      try {
        const updatedCharacter = await characterService.updateCharacter(characterId, updateData)
        
        const index = this.characters.findIndex(char => char.id === characterId)
        if (index !== -1) {
          this.characters[index] = updatedCharacter
        }
        
        if (this.currentCharacter?.id === characterId) {
          this.currentCharacter = updatedCharacter
        }
        
        return updatedCharacter
      } catch (error) {
        this.error = error.message || '更新角色失败'
        console.error('更新角色失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 删除角色
     */
    async deleteCharacter(characterId) {
      this.loading = true
      this.error = null

      try {
        await characterService.deleteCharacter(characterId)
        
        this.characters = this.characters.filter(char => char.id !== characterId)
        
        if (this.currentCharacter?.id === characterId) {
          this.currentCharacter = null
        }
      } catch (error) {
        this.error = error.message || '删除角色失败'
        console.error('删除角色失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 批量生成角色
     */
    async batchGenerateCharacters(novelId, config) {
      this.loading = true
      this.error = null

      try {
        const newCharacters = await characterService.batchGenerateCharacters(novelId, config)
        this.characters.unshift(...newCharacters)
        return newCharacters
      } catch (error) {
        this.error = error.message || '批量生成角色失败'
        console.error('批量生成角色失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 设置当前角色
     */
    setCurrentCharacter(character) {
      this.currentCharacter = character
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
        role: null,
        importance: null,
        search: ''
      }
    },

    /**
     * 清空数据
     */
    clearData() {
      this.characters = []
      this.currentCharacter = null
      this.currentNovelId = null
      this.error = null
      this.resetFilters()
    }
  }
})
