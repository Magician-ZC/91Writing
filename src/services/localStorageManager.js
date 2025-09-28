/**
 * 本地存储管理器
 * 处理本地数据存储、缓存和离线功能
 */

class LocalStorageManager {
  constructor() {
    this.prefix = '91writing_'
    this.version = '1.0.0'
    this.maxCacheAge = 24 * 60 * 60 * 1000 // 24小时
    this.init()
  }

  /**
   * 初始化本地存储
   */
  init() {
    // 检查版本兼容性
    const storedVersion = localStorage.getItem(this.prefix + 'version')
    if (storedVersion && storedVersion !== this.version) {
      this.migrate(storedVersion, this.version)
    }
    localStorage.setItem(this.prefix + 'version', this.version)

    // 清理过期缓存
    this.cleanExpiredCache()
  }

  /**
   * 版本迁移
   */
  migrate(oldVersion, newVersion) {
    console.log(`正在从版本 ${oldVersion} 迁移到 ${newVersion}`)
    
    try {
      // 根据版本进行数据迁移
      if (oldVersion < '1.0.0') {
        this.migrateFromLegacy()
      }
    } catch (error) {
      console.error('数据迁移失败:', error)
    }
  }

  /**
   * 从旧版本迁移数据
   */
  migrateFromLegacy() {
    // 迁移旧版本的novels数据
    const oldNovels = localStorage.getItem('novels')
    if (oldNovels) {
      try {
        const novels = JSON.parse(oldNovels)
        this.setData('novels', novels)
        localStorage.removeItem('novels')
      } catch (error) {
        console.error('迁移novels数据失败:', error)
      }
    }

    // 迁移其他旧数据
    const legacyKeys = ['memories', 'prompts', 'settings']
    legacyKeys.forEach(key => {
      const data = localStorage.getItem(key)
      if (data) {
        try {
          this.setData(key, JSON.parse(data))
          localStorage.removeItem(key)
        } catch (error) {
          console.error(`迁移${key}数据失败:`, error)
        }
      }
    })
  }

  /**
   * 清理过期缓存
   */
  cleanExpiredCache() {
    const cacheKeys = this.getCacheKeys()
    const now = Date.now()
    
    cacheKeys.forEach(key => {
      const cacheItem = this.getCacheItem(key)
      if (cacheItem && cacheItem.expiresAt && cacheItem.expiresAt < now) {
        localStorage.removeItem(this.prefix + 'cache_' + key)
      }
    })
  }

  /**
   * 获取所有缓存键
   */
  getCacheKeys() {
    const keys = []
    const prefix = this.prefix + 'cache_'
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(prefix)) {
        keys.push(key.replace(prefix, ''))
      }
    }
    
    return keys
  }

  /**
   * 设置数据
   */
  setData(key, data) {
    try {
      const item = {
        data,
        timestamp: Date.now(),
        version: this.version
      }
      localStorage.setItem(this.prefix + key, JSON.stringify(item))
      return true
    } catch (error) {
      console.error('设置本地数据失败:', error)
      return false
    }
  }

  /**
   * 获取数据
   */
  getData(key) {
    try {
      const item = localStorage.getItem(this.prefix + key)
      if (!item) return null
      
      const parsed = JSON.parse(item)
      return parsed.data
    } catch (error) {
      console.error('获取本地数据失败:', error)
      return null
    }
  }

  /**
   * 删除数据
   */
  removeData(key) {
    localStorage.removeItem(this.prefix + key)
  }

  /**
   * 缓存API响应
   */
  cacheApiResponse(endpoint, data, ttl = this.maxCacheAge) {
    try {
      const cacheKey = this.getCacheKey(endpoint)
      const cacheItem = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl
      }
      
      localStorage.setItem(this.prefix + 'cache_' + cacheKey, JSON.stringify(cacheItem))
      return true
    } catch (error) {
      console.error('缓存API响应失败:', error)
      return false
    }
  }

  /**
   * 获取缓存的响应
   */
  getCachedResponse(endpoint) {
    try {
      const cacheKey = this.getCacheKey(endpoint)
      const cacheItem = this.getCacheItem(cacheKey)
      
      if (!cacheItem) return null
      
      // 检查是否过期
      if (cacheItem.expiresAt && cacheItem.expiresAt < Date.now()) {
        localStorage.removeItem(this.prefix + 'cache_' + cacheKey)
        return null
      }
      
      return cacheItem.data
    } catch (error) {
      console.error('获取缓存响应失败:', error)
      return null
    }
  }

  /**
   * 获取缓存项
   */
  getCacheItem(key) {
    try {
      const item = localStorage.getItem(this.prefix + 'cache_' + key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('获取缓存项失败:', error)
      return null
    }
  }

  /**
   * 生成缓存键
   */
  getCacheKey(endpoint) {
    return btoa(endpoint).replace(/[+/=]/g, '_')
  }

  /**
   * 添加待同步项
   */
  addPendingSync(endpoint, method, data) {
    const pendingSync = this.getData('pendingSync') || []
    const syncItem = {
      id: Date.now() + Math.random(),
      endpoint,
      method,
      data,
      timestamp: Date.now()
    }
    
    pendingSync.push(syncItem)
    this.setData('pendingSync', pendingSync)
    return syncItem.id
  }

  /**
   * 获取待同步项
   */
  getPendingSync() {
    return this.getData('pendingSync') || []
  }

  /**
   * 移除待同步项
   */
  removePendingSync(id) {
    const pendingSync = this.getData('pendingSync') || []
    const filtered = pendingSync.filter(item => item.id !== id)
    this.setData('pendingSync', filtered)
  }

  /**
   * 处理本地请求
   */
  async handleRequest(endpoint, method, data) {
    // 解析endpoint，路由到相应的处理函数
    const segments = endpoint.split('/')
    const apiVersion = segments[2] // v1
    const resource = segments[3] // novels, chapters, etc.
    
    switch (resource) {
      case 'novels':
        return this.handleNovelsRequest(segments, method, data)
      case 'chapters':
        return this.handleChaptersRequest(segments, method, data)
      case 'memories':
        return this.handleMemoriesRequest(segments, method, data)
      default:
        throw new Error(`不支持的本地资源: ${resource}`)
    }
  }

  /**
   * 处理小说相关请求
   */
  handleNovelsRequest(segments, method, data) {
    const novels = this.getData('novels') || []
    
    switch (method) {
      case 'GET':
        if (segments.length === 4) {
          // GET /api/v1/novels
          return novels
        } else if (segments.length === 5) {
          // GET /api/v1/novels/:id
          const id = segments[4]
          const novel = novels.find(n => n.id === id)
          if (!novel) {
            throw new Error('小说不存在')
          }
          return novel
        }
        break
        
      case 'POST':
        // POST /api/v1/novels
        const newNovel = {
          ...data,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        novels.push(newNovel)
        this.setData('novels', novels)
        
        // 添加到待同步队列
        this.addPendingSync('/api/v1/novels', 'POST', newNovel)
        return newNovel
        
      case 'PATCH':
        // PATCH /api/v1/novels/:id
        const updateId = segments[4]
        const novelIndex = novels.findIndex(n => n.id === updateId)
        if (novelIndex === -1) {
          throw new Error('小说不存在')
        }
        
        novels[novelIndex] = {
          ...novels[novelIndex],
          ...data,
          updatedAt: new Date().toISOString()
        }
        this.setData('novels', novels)
        
        // 添加到待同步队列
        this.addPendingSync(`/api/v1/novels/${updateId}`, 'PATCH', data)
        return novels[novelIndex]
        
      case 'DELETE':
        // DELETE /api/v1/novels/:id
        const deleteId = segments[4]
        const deleteIndex = novels.findIndex(n => n.id === deleteId)
        if (deleteIndex === -1) {
          throw new Error('小说不存在')
        }
        
        const deleted = novels.splice(deleteIndex, 1)[0]
        this.setData('novels', novels)
        
        // 添加到待同步队列
        this.addPendingSync(`/api/v1/novels/${deleteId}`, 'DELETE', null)
        return { success: true }
        
      default:
        throw new Error(`不支持的方法: ${method}`)
    }
  }

  /**
   * 处理章节相关请求
   */
  handleChaptersRequest(segments, method, data) {
    const chapters = this.getData('chapters') || []
    
    switch (method) {
      case 'GET':
        if (segments.length === 6 && segments[4] === 'chapters') {
          // GET /api/v1/novels/:novelId/chapters
          const novelId = segments[3]
          return chapters.filter(c => c.novelId === novelId)
        } else if (segments.length === 5) {
          // GET /api/v1/chapters/:id
          const id = segments[4]
          const chapter = chapters.find(c => c.id === id)
          if (!chapter) {
            throw new Error('章节不存在')
          }
          return chapter
        }
        break
        
      case 'POST':
        // POST /api/v1/novels/:novelId/chapters
        const novelId = segments[3]
        const newChapter = {
          ...data,
          id: Date.now().toString(),
          novelId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        chapters.push(newChapter)
        this.setData('chapters', chapters)
        
        // 添加到待同步队列
        this.addPendingSync(`/api/v1/novels/${novelId}/chapters`, 'POST', newChapter)
        return newChapter
        
      case 'PATCH':
        // PATCH /api/v1/chapters/:id
        const updateId = segments[4]
        const chapterIndex = chapters.findIndex(c => c.id === updateId)
        if (chapterIndex === -1) {
          throw new Error('章节不存在')
        }
        
        chapters[chapterIndex] = {
          ...chapters[chapterIndex],
          ...data,
          updatedAt: new Date().toISOString()
        }
        this.setData('chapters', chapters)
        
        // 添加到待同步队列
        this.addPendingSync(`/api/v1/chapters/${updateId}`, 'PATCH', data)
        return chapters[chapterIndex]
        
      case 'DELETE':
        // DELETE /api/v1/chapters/:id
        const deleteId = segments[4]
        const deleteIndex = chapters.findIndex(c => c.id === deleteId)
        if (deleteIndex === -1) {
          throw new Error('章节不存在')
        }
        
        chapters.splice(deleteIndex, 1)
        this.setData('chapters', chapters)
        
        // 添加到待同步队列
        this.addPendingSync(`/api/v1/chapters/${deleteId}`, 'DELETE', null)
        return { success: true }
        
      default:
        throw new Error(`不支持的方法: ${method}`)
    }
  }

  /**
   * 处理记忆相关请求
   */
  handleMemoriesRequest(segments, method, data) {
    const memories = this.getData('memories') || []
    
    switch (method) {
      case 'GET':
        if (segments.length === 6 && segments[4] === 'memories') {
          // GET /api/v1/novels/:novelId/memories
          const novelId = segments[3]
          return memories.filter(m => m.novelId === novelId)
        }
        break
        
      case 'POST':
        // POST /api/v1/novels/:novelId/memories
        const novelId = segments[3]
        const newMemory = {
          ...data,
          id: Date.now().toString(),
          novelId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        memories.push(newMemory)
        this.setData('memories', memories)
        
        // 添加到待同步队列
        this.addPendingSync(`/api/v1/novels/${novelId}/memories`, 'POST', newMemory)
        return newMemory
        
      case 'PATCH':
        // PATCH /api/v1/memories/:id
        const updateId = segments[4]
        const memoryIndex = memories.findIndex(m => m.id === updateId)
        if (memoryIndex === -1) {
          throw new Error('记忆不存在')
        }
        
        memories[memoryIndex] = {
          ...memories[memoryIndex],
          ...data,
          updatedAt: new Date().toISOString()
        }
        this.setData('memories', memories)
        
        // 添加到待同步队列
        this.addPendingSync(`/api/v1/memories/${updateId}`, 'PATCH', data)
        return memories[memoryIndex]
        
      case 'DELETE':
        // DELETE /api/v1/memories/:id
        const deleteId = segments[4]
        const deleteIndex = memories.findIndex(m => m.id === deleteId)
        if (deleteIndex === -1) {
          throw new Error('记忆不存在')
        }
        
        memories.splice(deleteIndex, 1)
        this.setData('memories', memories)
        
        // 添加到待同步队列
        this.addPendingSync(`/api/v1/memories/${deleteId}`, 'DELETE', null)
        return { success: true }
        
      default:
        throw new Error(`不支持的方法: ${method}`)
    }
  }

  /**
   * 导出所有数据
   */
  exportAllData() {
    const data = {
      version: this.version,
      timestamp: Date.now(),
      novels: this.getData('novels') || [],
      chapters: this.getData('chapters') || [],
      memories: this.getData('memories') || [],
      prompts: this.getData('prompts') || [],
      settings: this.getData('settings') || {}
    }
    
    return data
  }

  /**
   * 导入数据
   */
  importAllData(importData) {
    try {
      if (importData.novels) {
        this.setData('novels', importData.novels)
      }
      
      if (importData.chapters) {
        this.setData('chapters', importData.chapters)
      }
      
      if (importData.memories) {
        this.setData('memories', importData.memories)
      }
      
      if (importData.prompts) {
        this.setData('prompts', importData.prompts)
      }
      
      if (importData.settings) {
        this.setData('settings', importData.settings)
      }
      
      return true
    } catch (error) {
      console.error('导入数据失败:', error)
      return false
    }
  }

  /**
   * 清空所有数据
   */
  clearAllData() {
    const keys = ['novels', 'chapters', 'memories', 'prompts', 'settings', 'pendingSync']
    keys.forEach(key => this.removeData(key))
  }

  /**
   * 获取存储统计信息
   */
  getStats() {
    const novels = this.getData('novels') || []
    const chapters = this.getData('chapters') || []
    const memories = this.getData('memories') || []
    const pendingSync = this.getData('pendingSync') || []
    
    return {
      novels: novels.length,
      chapters: chapters.length,
      memories: memories.length,
      pendingSync: pendingSync.length,
      cacheKeys: this.getCacheKeys().length
    }
  }
}

// 创建单例实例
const localStorageManager = new LocalStorageManager()

export default localStorageManager
