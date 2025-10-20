/**
 * 小说云端管理 Store
 * 负责小说和章节的云端CRUD操作
 * Week 5 - 小说管理云端化
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiManager from '@/services/apiManager'
import { ElMessage, ElMessageBox } from 'element-plus'

export const useNovelCloudStore = defineStore('novelCloud', () => {
  // ========== 状态 ==========
  
  // 小说列表
  const novels = ref([])
  const currentNovel = ref(null)
  const loading = ref(false)
  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  
  // 章节相关
  const chapters = ref([])
  const currentChapter = ref(null)
  const chapterLoading = ref(false)
  
  // 筛选和排序
  const filters = ref({
    status: null,  // DRAFT, WRITING, COMPLETED, PUBLISHED
    genre: null,
    searchKeyword: ''
  })
  
  // 自动保存相关
  const autoSaveTimer = ref(null)
  const lastSaveTime = ref(null)
  const hasUnsavedChanges = ref(false)
  
  // ========== 计算属性 ==========
  
  // 过滤后的小说列表
  const filteredNovels = computed(() => {
    let result = novels.value
    
    // 按状态筛选
    if (filters.value.status) {
      result = result.filter(n => n.status === filters.value.status)
    }
    
    // 按类型筛选
    if (filters.value.genre) {
      result = result.filter(n => n.genre === filters.value.genre)
    }
    
    // 按关键词搜索
    if (filters.value.searchKeyword) {
      const keyword = filters.value.searchKeyword.toLowerCase()
      result = result.filter(n => 
        n.title.toLowerCase().includes(keyword) ||
        (n.description && n.description.toLowerCase().includes(keyword))
      )
    }
    
    return result
  })
  
  // 当前小说的章节数
  const chapterCount = computed(() => {
    return chapters.value.length
  })
  
  // 当前小说的总字数
  const totalWordCount = computed(() => {
    return chapters.value.reduce((sum, chapter) => sum + (chapter.wordCount || 0), 0)
  })
  
  // ========== 小说CRUD操作 ==========
  
  /**
   * 获取小说列表
   */
  async function fetchNovels(options = {}) {
    loading.value = true
    try {
      const params = {
        page: options.page || pagination.value.page,
        limit: options.limit || pagination.value.limit,
        status: filters.value.status,
        genre: filters.value.genre,
      }
      
      const response = await apiManager.getNovels(params)
      
      if (response.success) {
        novels.value = response.data.novels || []
        pagination.value = response.data.pagination || pagination.value
        
        console.log(`✓ 成功加载 ${novels.value.length} 部小说`)
        return true
      } else {
        throw new Error(response.message || '获取小说列表失败')
      }
    } catch (error) {
      console.error('获取小说列表失败:', error)
      ElMessage.error(error.message || '获取小说列表失败')
      return false
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 获取单个小说详情
   */
  async function fetchNovel(novelId) {
    loading.value = true
    try {
      const response = await apiManager.getNovel(novelId)
      
      if (response.success) {
        currentNovel.value = response.data
        
        // 同时加载章节列表
        await fetchChapters(novelId)
        
        console.log(`✓ 成功加载小说: ${response.data.title}`)
        return response.data
      } else {
        throw new Error(response.message || '获取小说详情失败')
      }
    } catch (error) {
      console.error('获取小说详情失败:', error)
      ElMessage.error(error.message || '获取小说详情失败')
      return null
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 创建新小说
   */
  async function createNovel(novelData) {
    loading.value = true
    try {
      // 验证必填字段
      if (!novelData.title || !novelData.title.trim()) {
        throw new Error('小说标题不能为空')
      }
      
      const response = await apiManager.createNovel(novelData)
      
      if (response.success) {
        const newNovel = response.data
        
        // 添加到列表开头
        novels.value.unshift(newNovel)
        
        // 设置为当前小说
        currentNovel.value = newNovel
        
        ElMessage.success('小说创建成功')
        console.log(`✓ 创建小说成功: ${newNovel.title}`)
        
        return newNovel
      } else {
        throw new Error(response.message || '创建小说失败')
      }
    } catch (error) {
      console.error('创建小说失败:', error)
      ElMessage.error(error.message || '创建小说失败')
      return null
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 更新小说信息
   */
  async function updateNovel(novelId, updateData) {
    loading.value = true
    try {
      const response = await apiManager.updateNovel(novelId, updateData)
      
      if (response.success) {
        const updatedNovel = response.data
        
        // 更新列表中的小说
        const index = novels.value.findIndex(n => n.id === novelId)
        if (index !== -1) {
          novels.value[index] = updatedNovel
        }
        
        // 如果是当前小说，也更新
        if (currentNovel.value?.id === novelId) {
          currentNovel.value = updatedNovel
        }
        
        // 清除未保存标记
        hasUnsavedChanges.value = false
        lastSaveTime.value = new Date()
        
        console.log(`✓ 更新小说成功: ${updatedNovel.title}`)
        return updatedNovel
      } else {
        throw new Error(response.message || '更新小说失败')
      }
    } catch (error) {
      console.error('更新小说失败:', error)
      ElMessage.error(error.message || '更新小说失败')
      return null
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 删除小说
   */
  async function deleteNovel(novelId) {
    try {
      // 确认删除
      await ElMessageBox.confirm(
        '删除后将无法恢复，确定要删除这部小说吗？',
        '确认删除',
        {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
      
      loading.value = true
      const response = await apiManager.deleteNovel(novelId)
      
      if (response.success) {
        // 从列表中移除
        novels.value = novels.value.filter(n => n.id !== novelId)
        
        // 如果删除的是当前小说，清空当前小说
        if (currentNovel.value?.id === novelId) {
          currentNovel.value = null
          chapters.value = []
        }
        
        ElMessage.success('小说已删除')
        console.log(`✓ 删除小说成功: ${novelId}`)
        return true
      } else {
        throw new Error(response.message || '删除小说失败')
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除小说失败:', error)
        ElMessage.error(error.message || '删除小说失败')
      }
      return false
    } finally {
      loading.value = false
    }
  }
  
  // ========== 章节CRUD操作 ==========
  
  /**
   * 获取章节列表
   */
  async function fetchChapters(novelId) {
    chapterLoading.value = true
    try {
      const response = await apiManager.getChapters(novelId)
      
      if (response.success) {
        chapters.value = response.data || []
        console.log(`✓ 成功加载 ${chapters.value.length} 个章节`)
        return chapters.value
      } else {
        throw new Error(response.message || '获取章节列表失败')
      }
    } catch (error) {
      console.error('获取章节列表失败:', error)
      ElMessage.error(error.message || '获取章节列表失败')
      return []
    } finally {
      chapterLoading.value = false
    }
  }
  
  /**
   * 获取单个章节详情
   */
  async function fetchChapter(novelId, chapterId) {
    chapterLoading.value = true
    try {
      const response = await apiManager.getChapter(novelId, chapterId)
      
      if (response.success) {
        currentChapter.value = response.data
        console.log(`✓ 成功加载章节: ${response.data.title}`)
        return response.data
      } else {
        throw new Error(response.message || '获取章节详情失败')
      }
    } catch (error) {
      console.error('获取章节详情失败:', error)
      ElMessage.error(error.message || '获取章节详情失败')
      return null
    } finally {
      chapterLoading.value = false
    }
  }
  
  /**
   * 创建新章节
   */
  async function createChapter(novelId, chapterData) {
    chapterLoading.value = true
    try {
      // 验证必填字段
      if (!chapterData.title || !chapterData.title.trim()) {
        throw new Error('章节标题不能为空')
      }
      
      // 如果没有指定章节号，自动设置为最后一章+1
      if (!chapterData.chapterNumber) {
        const maxChapterNumber = chapters.value.reduce(
          (max, ch) => Math.max(max, ch.chapterNumber || 0), 
          0
        )
        chapterData.chapterNumber = maxChapterNumber + 1
      }
      
      const response = await apiManager.createChapter(novelId, chapterData)
      
      if (response.success) {
        const newChapter = response.data
        
        // 添加到章节列表
        chapters.value.push(newChapter)
        
        // 按章节号排序
        chapters.value.sort((a, b) => a.chapterNumber - b.chapterNumber)
        
        // 设置为当前章节
        currentChapter.value = newChapter
        
        ElMessage.success('章节创建成功')
        console.log(`✓ 创建章节成功: ${newChapter.title}`)
        
        return newChapter
      } else {
        throw new Error(response.message || '创建章节失败')
      }
    } catch (error) {
      console.error('创建章节失败:', error)
      ElMessage.error(error.message || '创建章节失败')
      return null
    } finally {
      chapterLoading.value = false
    }
  }
  
  /**
   * 更新章节信息
   */
  async function updateChapter(novelId, chapterId, updateData) {
    try {
      const response = await apiManager.updateChapter(novelId, chapterId, updateData)
      
      if (response.success) {
        const updatedChapter = response.data
        
        // 更新章节列表
        const index = chapters.value.findIndex(ch => ch.id === chapterId)
        if (index !== -1) {
          chapters.value[index] = updatedChapter
        }
        
        // 如果是当前章节，也更新
        if (currentChapter.value?.id === chapterId) {
          currentChapter.value = updatedChapter
        }
        
        // 清除未保存标记
        hasUnsavedChanges.value = false
        lastSaveTime.value = new Date()
        
        console.log(`✓ 更新章节成功: ${updatedChapter.title}`)
        return updatedChapter
      } else {
        throw new Error(response.message || '更新章节失败')
      }
    } catch (error) {
      console.error('更新章节失败:', error)
      ElMessage.error(error.message || '更新章节失败')
      return null
    }
  }
  
  /**
   * 删除章节
   */
  async function deleteChapter(novelId, chapterId) {
    try {
      await ElMessageBox.confirm(
        '删除后将无法恢复，确定要删除这个章节吗？',
        '确认删除',
        {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
      
      chapterLoading.value = true
      const response = await apiManager.deleteChapter(novelId, chapterId)
      
      if (response.success) {
        // 从列表中移除
        chapters.value = chapters.value.filter(ch => ch.id !== chapterId)
        
        // 如果删除的是当前章节，清空当前章节
        if (currentChapter.value?.id === chapterId) {
          currentChapter.value = null
        }
        
        ElMessage.success('章节已删除')
        console.log(`✓ 删除章节成功: ${chapterId}`)
        return true
      } else {
        throw new Error(response.message || '删除章节失败')
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除章节失败:', error)
        ElMessage.error(error.message || '删除章节失败')
      }
      return false
    } finally {
      chapterLoading.value = false
    }
  }
  
  // ========== 自动保存功能 ==========
  
  /**
   * 启用自动保存（用于章节内容编辑）
   */
  function enableAutoSave(novelId, chapterId, getContentFn, interval = 30000) {
    // 清除旧的定时器
    if (autoSaveTimer.value) {
      clearInterval(autoSaveTimer.value)
    }
    
    // 设置新的自动保存定时器
    autoSaveTimer.value = setInterval(async () => {
      if (hasUnsavedChanges.value && novelId && chapterId) {
        const content = getContentFn()
        await autoSaveChapterContent(novelId, chapterId, content)
      }
    }, interval)
    
    console.log(`✓ 已启用自动保存 (间隔: ${interval/1000}秒)`)
  }
  
  /**
   * 禁用自动保存
   */
  function disableAutoSave() {
    if (autoSaveTimer.value) {
      clearInterval(autoSaveTimer.value)
      autoSaveTimer.value = null
      console.log('✓ 已禁用自动保存')
    }
  }
  
  /**
   * 自动保存章节内容
   */
  async function autoSaveChapterContent(novelId, chapterId, content) {
    try {
      const response = await apiManager.updateChapter(novelId, chapterId, { content })
      
      if (response.success) {
        hasUnsavedChanges.value = false
        lastSaveTime.value = new Date()
        console.log(`✓ 自动保存成功: ${new Date().toLocaleTimeString()}`)
        return true
      }
    } catch (error) {
      console.error('自动保存失败:', error)
      // 自动保存失败不显示错误消息，避免打扰用户
      return false
    }
  }
  
  /**
   * 手动保存章节内容
   */
  async function saveChapterContent(novelId, chapterId, content) {
    try {
      const response = await apiManager.updateChapter(novelId, chapterId, { content })
      
      if (response.success) {
        hasUnsavedChanges.value = false
        lastSaveTime.value = new Date()
        
        // 更新章节列表中的字数
        const updatedChapter = response.data
        const index = chapters.value.findIndex(ch => ch.id === chapterId)
        if (index !== -1) {
          chapters.value[index].wordCount = updatedChapter.wordCount
        }
        
        ElMessage.success('保存成功')
        return true
      } else {
        throw new Error(response.message || '保存失败')
      }
    } catch (error) {
      console.error('保存章节内容失败:', error)
      ElMessage.error(error.message || '保存失败')
      return false
    }
  }
  
  /**
   * 标记内容已修改
   */
  function markAsChanged() {
    hasUnsavedChanges.value = true
  }
  
  // ========== 小说设置管理 ==========
  
  /**
   * 获取小说设置
   */
  async function fetchNovelSettings(novelId) {
    try {
      const response = await apiManager.getNovelSettings(novelId)
      
      if (response.success) {
        return response.data
      } else {
        throw new Error(response.message || '获取小说设置失败')
      }
    } catch (error) {
      console.error('获取小说设置失败:', error)
      return null
    }
  }
  
  /**
   * 更新小说设置
   */
  async function updateNovelSettings(novelId, settings) {
    try {
      const response = await apiManager.updateNovelSettings(novelId, settings)
      
      if (response.success) {
        ElMessage.success('设置已保存')
        return response.data
      } else {
        throw new Error(response.message || '保存设置失败')
      }
    } catch (error) {
      console.error('保存小说设置失败:', error)
      ElMessage.error(error.message || '保存设置失败')
      return null
    }
  }
  
  // ========== 工具方法 ==========
  
  /**
   * 设置筛选条件
   */
  function setFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
  }
  
  /**
   * 重置筛选
   */
  function resetFilters() {
    filters.value = {
      status: null,
      genre: null,
      searchKeyword: ''
    }
  }
  
  /**
   * 清空当前小说和章节
   */
  function clearCurrent() {
    currentNovel.value = null
    currentChapter.value = null
    chapters.value = []
    hasUnsavedChanges.value = false
    disableAutoSave()
  }
  
  /**
   * 获取小说统计信息
   */
  function getNovelStats(novelId) {
    const novel = novels.value.find(n => n.id === novelId)
    if (!novel) return null
    
    return {
      chapterCount: novel.chapterCount || 0,
      wordCount: novel.wordCount || 0,
      status: novel.status,
      lastUpdated: novel.updatedAt
    }
  }
  
  // ========== 返回 ==========
  
  return {
    // 状态
    novels,
    currentNovel,
    loading,
    pagination,
    chapters,
    currentChapter,
    chapterLoading,
    filters,
    hasUnsavedChanges,
    lastSaveTime,
    
    // 计算属性
    filteredNovels,
    chapterCount,
    totalWordCount,
    
    // 小说操作
    fetchNovels,
    fetchNovel,
    createNovel,
    updateNovel,
    deleteNovel,
    
    // 章节操作
    fetchChapters,
    fetchChapter,
    createChapter,
    updateChapter,
    deleteChapter,
    
    // 自动保存
    enableAutoSave,
    disableAutoSave,
    saveChapterContent,
    markAsChanged,
    
    // 设置管理
    fetchNovelSettings,
    updateNovelSettings,
    
    // 工具方法
    setFilters,
    resetFilters,
    clearCurrent,
    getNovelStats,
  }
})

