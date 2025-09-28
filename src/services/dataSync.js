/**
 * 数据同步服务
 * 处理本地数据和云端数据的双向同步
 */

import { ElMessage, ElMessageBox } from 'element-plus'
import apiManager from './apiManager'
import localStorageManager from './localStorageManager'

class DataSyncService {
  constructor() {
    this.issyncing = false
    this.lastSyncTime = null
    this.conflictResolution = 'ask' // 'ask', 'local', 'cloud'
    this.init()
  }

  /**
   * 初始化同步服务
   */
  init() {
    this.lastSyncTime = localStorage.getItem('91writing_lastSync')
    this.conflictResolution = localStorage.getItem('91writing_conflictResolution') || 'ask'
    
    // 监听在线状态变化
    window.addEventListener('online', () => {
      setTimeout(() => this.autoSync(), 1000)
    })
  }

  /**
   * 设置冲突解决策略
   */
  setConflictResolution(strategy) {
    this.conflictResolution = strategy
    localStorage.setItem('91writing_conflictResolution', strategy)
  }

  /**
   * 自动同步
   */
  async autoSync() {
    if (!navigator.onLine || this.issyncing) return
    
    try {
      await this.syncToCloud()
      await this.syncFromCloud()
    } catch (error) {
      console.error('自动同步失败:', error)
    }
  }

  /**
   * 手动同步
   */
  async manualSync() {
    if (this.issyncing) {
      ElMessage.warning('正在同步中，请稍候...')
      return
    }

    try {
      this.issyncing = true
      ElMessage.info('开始同步数据...')
      
      // 先同步到云端
      await this.syncToCloud()
      
      // 再从云端同步
      await this.syncFromCloud()
      
      this.lastSyncTime = Date.now()
      localStorage.setItem('91writing_lastSync', this.lastSyncTime.toString())
      
      ElMessage.success('数据同步完成')
    } catch (error) {
      console.error('手动同步失败:', error)
      ElMessage.error('数据同步失败: ' + error.message)
    } finally {
      this.issyncing = false
    }
  }

  /**
   * 同步到云端
   */
  async syncToCloud() {
    const pendingSync = localStorageManager.getPendingSync()
    
    if (pendingSync.length === 0) return
    
    for (const item of pendingSync) {
      try {
        await apiManager.api({
          url: item.endpoint,
          method: item.method,
          data: item.data,
        })
        
        // 同步成功，移除待同步项
        localStorageManager.removePendingSync(item.id)
      } catch (error) {
        console.error('同步到云端失败:', item, error)
        throw error
      }
    }
  }

  /**
   * 从云端同步
   */
  async syncFromCloud() {
    try {
      // 获取云端数据
      const cloudData = await this.getCloudData()
      
      // 获取本地数据
      const localData = this.getLocalData()
      
      // 检测冲突并合并数据
      const mergedData = await this.mergeData(localData, cloudData)
      
      // 更新本地数据
      this.updateLocalData(mergedData)
      
    } catch (error) {
      console.error('从云端同步失败:', error)
      throw error
    }
  }

  /**
   * 获取云端数据
   */
  async getCloudData() {
    const [novels, chapters, memories] = await Promise.all([
      apiManager.getNovels().catch(() => ({ data: [] })),
      this.getAllChapters().catch(() => []),
      this.getAllMemories().catch(() => [])
    ])

    return {
      novels: novels.data || [],
      chapters,
      memories
    }
  }

  /**
   * 获取所有章节（跨小说）
   */
  async getAllChapters() {
    try {
      const response = await apiManager.getNovels()
      const allChapters = []
      
      // 确保数据结构正确
      const novels = response?.data || response || []
      if (!Array.isArray(novels)) {
        console.warn('getNovels返回的数据不是数组:', novels)
        return []
      }
      
      for (const novel of novels) {
        try {
          const chaptersResponse = await apiManager.getChapters(novel.id)
          const chapters = chaptersResponse?.data || chaptersResponse || []
          if (Array.isArray(chapters)) {
            allChapters.push(...chapters)
          }
        } catch (chapterError) {
          console.warn(`获取小说${novel.id}的章节失败:`, chapterError)
        }
      }
      
      return allChapters
    } catch (error) {
      console.error('获取所有章节失败:', error)
      return []
    }
  }

  /**
   * 获取所有记忆（跨小说）
   */
  async getAllMemories() {
    try {
      const response = await apiManager.getNovels()
      const allMemories = []
      
      // 确保数据结构正确
      const novels = response?.data || response || []
      if (!Array.isArray(novels)) {
        console.warn('getNovels返回的数据不是数组:', novels)
        return []
      }
      
      for (const novel of novels) {
        try {
          const memoriesResponse = await apiManager.getMemories(novel.id)
          const memories = memoriesResponse?.data || memoriesResponse || []
          if (Array.isArray(memories)) {
            allMemories.push(...memories)
          }
        } catch (memoryError) {
          console.warn(`获取小说${novel.id}的记忆失败:`, memoryError)
        }
      }
      
      return allMemories
    } catch (error) {
      console.error('获取所有记忆失败:', error)
      return []
    }
  }

  /**
   * 获取本地数据
   */
  getLocalData() {
    return {
      novels: localStorageManager.getData('novels') || [],
      chapters: localStorageManager.getData('chapters') || [],
      memories: localStorageManager.getData('memories') || []
    }
  }

  /**
   * 合并数据
   */
  async mergeData(localData, cloudData) {
    const mergedData = {
      novels: await this.mergeArray(localData.novels, cloudData.novels, 'id'),
      chapters: await this.mergeArray(localData.chapters, cloudData.chapters, 'id'),
      memories: await this.mergeArray(localData.memories, cloudData.memories, 'id')
    }
    
    return mergedData
  }

  /**
   * 合并数组数据
   */
  async mergeArray(localArray, cloudArray, keyField) {
    // 确保输入都是数组
    const safeLocalArray = Array.isArray(localArray) ? localArray : []
    const safeCloudArray = Array.isArray(cloudArray) ? cloudArray : []
    
    const localMap = new Map(safeLocalArray.map(item => [item[keyField], item]))
    const cloudMap = new Map(safeCloudArray.map(item => [item[keyField], item]))
    const merged = new Map()
    
    // 处理云端数据
    for (const [key, cloudItem] of cloudMap) {
      const localItem = localMap.get(key)
      
      if (!localItem) {
        // 只在云端存在
        merged.set(key, cloudItem)
      } else {
        // 两边都存在，检查冲突
        const resolvedItem = await this.resolveConflict(localItem, cloudItem, key)
        merged.set(key, resolvedItem)
      }
    }
    
    // 处理只在本地存在的数据
    for (const [key, localItem] of localMap) {
      if (!cloudMap.has(key)) {
        merged.set(key, localItem)
      }
    }
    
    return Array.from(merged.values())
  }

  /**
   * 解决冲突
   */
  async resolveConflict(localItem, cloudItem, key) {
    const localTime = new Date(localItem.updatedAt || localItem.createdAt).getTime()
    const cloudTime = new Date(cloudItem.updatedAt || cloudItem.createdAt).getTime()
    
    // 如果时间戳相同或差异很小（1秒内），认为是同一版本
    if (Math.abs(localTime - cloudTime) < 1000) {
      return cloudItem // 优先使用云端版本
    }
    
    // 根据策略解决冲突
    switch (this.conflictResolution) {
      case 'local':
        return localItem
        
      case 'cloud':
        return cloudItem
        
      case 'ask':
      default:
        return await this.askUserForConflictResolution(localItem, cloudItem, key)
    }
  }

  /**
   * 询问用户如何解决冲突
   */
  async askUserForConflictResolution(localItem, cloudItem, key) {
    try {
      const result = await ElMessageBox.confirm(
        `检测到数据冲突:\n\n本地版本: ${new Date(localItem.updatedAt || localItem.createdAt).toLocaleString()}\n云端版本: ${new Date(cloudItem.updatedAt || cloudItem.createdAt).toLocaleString()}\n\n请选择要保留的版本:`,
        '数据冲突',
        {
          distinguishCancelAndClose: true,
          confirmButtonText: '保留云端版本',
          cancelButtonText: '保留本地版本',
          type: 'warning',
        }
      )
      
      return result ? cloudItem : localItem
    } catch (action) {
      if (action === 'cancel') {
        return localItem
      }
      // 用户关闭了对话框，默认使用云端版本
      return cloudItem
    }
  }

  /**
   * 更新本地数据
   */
  updateLocalData(mergedData) {
    localStorageManager.setData('novels', mergedData.novels)
    localStorageManager.setData('chapters', mergedData.chapters)
    localStorageManager.setData('memories', mergedData.memories)
  }

  /**
   * 导出数据
   */
  async exportData() {
    try {
      const data = localStorageManager.exportAllData()
      
      // 创建下载链接
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      })
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `91writing_backup_${new Date().toISOString().slice(0, 10)}.json`
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
      
      ElMessage.success('数据导出完成')
    } catch (error) {
      console.error('导出数据失败:', error)
      ElMessage.error('数据导出失败')
    }
  }

  /**
   * 导入数据
   */
  async importData(file) {
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      
      // 验证数据格式
      if (!this.validateImportData(data)) {
        throw new Error('导入文件格式不正确')
      }
      
      // 确认导入
      const confirmed = await ElMessageBox.confirm(
        '导入数据将覆盖当前的本地数据，确定要继续吗？',
        '确认导入',
        {
          confirmButtonText: '确定导入',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
      
      if (!confirmed) return
      
      // 执行导入
      const success = localStorageManager.importAllData(data)
      
      if (success) {
        ElMessage.success('数据导入完成')
        
        // 如果在线，将导入的数据同步到云端
        if (navigator.onLine) {
          await this.syncToCloud()
        }
      } else {
        throw new Error('数据导入失败')
      }
      
    } catch (error) {
      console.error('导入数据失败:', error)
      ElMessage.error('数据导入失败: ' + error.message)
    }
  }

  /**
   * 验证导入数据格式
   */
  validateImportData(data) {
    if (!data || typeof data !== 'object') return false
    
    // 检查必需字段
    const requiredFields = ['version', 'timestamp']
    for (const field of requiredFields) {
      if (!(field in data)) return false
    }
    
    // 检查数据数组
    const dataArrays = ['novels', 'chapters', 'memories']
    for (const arrayName of dataArrays) {
      if (data[arrayName] && !Array.isArray(data[arrayName])) {
        return false
      }
    }
    
    return true
  }

  /**
   * 获取同步状态
   */
  getSyncStatus() {
    const stats = localStorageManager.getStats()
    
    return {
      issyncing: this.issyncing,
      lastSyncTime: this.lastSyncTime ? new Date(parseInt(this.lastSyncTime)) : null,
      pendingSync: stats.pendingSync,
      conflictResolution: this.conflictResolution,
      isOnline: navigator.onLine
    }
  }

  /**
   * 重置同步状态
   */
  resetSync() {
    localStorage.removeItem('91writing_lastSync')
    localStorage.removeItem('91writing_conflictResolution')
    localStorageManager.setData('pendingSync', [])
    
    this.lastSyncTime = null
    this.conflictResolution = 'ask'
    
    ElMessage.success('同步状态已重置')
  }
}

// 创建单例实例
const dataSyncService = new DataSyncService()

export default dataSyncService
