/**
 * 后台任务管理服务
 * 用于处理耗时的AI生成任务，避免阻塞UI
 */

import { reactive, ref } from 'vue'
import { ElNotification } from 'element-plus'

class BackgroundTaskService {
  constructor() {
    // 任务队列
    this.tasks = reactive(new Map())
    
    // 任务ID计数器
    this.taskIdCounter = 0
    
    // 最大并发任务数
    this.maxConcurrentTasks = 3
    
    // 当前运行的任务数
    this.runningTasksCount = ref(0)
    
    // 从localStorage恢复任务
    this.loadTasksFromStorage()
    
    // 自动保存任务到localStorage
    this.setupAutoSave()
  }
  
  /**
   * 创建后台任务
   * @param {Object} options - 任务选项
   * @param {string} options.name - 任务名称
   * @param {string} options.type - 任务类型
   * @param {Function} options.executor - 执行函数
   * @param {Function} options.onProgress - 进度回调
   * @param {Function} options.onComplete - 完成回调
   * @param {Function} options.onError - 错误回调
   * @returns {string} 任务ID
   */
  createTask(options) {
    const {
      name,
      type,
      executor,
      onProgress,
      onComplete,
      onError
    } = options
    
    // 生成任务ID
    const taskId = `task_${++this.taskIdCounter}_${Date.now()}`
    
    // 创建任务对象
    const task = reactive({
      id: taskId,
      name: name || '未命名任务',
      type: type || 'default',
      status: 'pending', // pending, running, completed, failed, cancelled
      progress: 0,
      result: null,
      streamContent: '', // 流式输出的实时内容
      error: null,
      createdAt: new Date(),
      startedAt: null,
      completedAt: null,
      executor,
      onProgress,
      onComplete,
      onError
    })
    
    // 添加到任务队列
    this.tasks.set(taskId, task)
    
    console.log('📋 [后台任务] 创建任务:', taskId, name)
    
    // 尝试执行任务
    this.executeNextTask()
    
    return taskId
  }
  
  /**
   * 执行下一个待处理任务
   */
  async executeNextTask() {
    // 检查是否超过最大并发数
    if (this.runningTasksCount.value >= this.maxConcurrentTasks) {
      console.log('⏸️ [后台任务] 已达到最大并发数，等待任务完成')
      return
    }
    
    // 查找待执行的任务
    const pendingTask = Array.from(this.tasks.values()).find(
      task => task.status === 'pending'
    )
    
    if (!pendingTask) {
      return
    }
    
    // 执行任务
    await this.executeTask(pendingTask.id)
  }
  
  /**
   * 执行指定任务
   * @param {string} taskId - 任务ID
   */
  async executeTask(taskId) {
    const task = this.tasks.get(taskId)
    if (!task) {
      console.error('❌ [后台任务] 任务不存在:', taskId)
      return
    }
    
    // 更新任务状态
    task.status = 'running'
    task.startedAt = new Date()
    this.runningTasksCount.value++
    
    console.log(`🚀 [后台任务] 开始执行: ${task.name} (${taskId})`)
    
    // 显示通知
    ElNotification({
      title: '任务开始',
      message: `正在执行: ${task.name}`,
      type: 'info',
      duration: 2000
    })
    
    try {
      // 执行任务，传入进度更新函数
      const result = await task.executor((progress) => {
        this.updateTaskProgress(taskId, progress)
      })
      
      // 任务完成
      task.status = 'completed'
      task.completedAt = new Date()
      task.result = result
      task.progress = 100
      
      console.log(`✅ [后台任务] 完成: ${task.name}`)
      
      // 立即保存到localStorage
      this.saveTasksToStorage()
      
      // 显示完成通知
      ElNotification({
        title: '任务完成',
        message: `${task.name} 已完成`,
        type: 'success',
        duration: 3000
      })
      
      // 调用完成回调
      if (task.onComplete) {
        task.onComplete(result)
      }
      
    } catch (error) {
      // 任务失败
      task.status = 'failed'
      task.completedAt = new Date()
      task.error = error.message || '任务执行失败'
      
      console.error(`❌ [后台任务] 失败: ${task.name}`, error)
      
      // 立即保存到localStorage
      this.saveTasksToStorage()
      
      // 显示错误通知
      ElNotification({
        title: '任务失败',
        message: `${task.name}: ${task.error}`,
        type: 'error',
        duration: 5000
      })
      
      // 调用错误回调
      if (task.onError) {
        task.onError(error)
      }
      
    } finally {
      // 减少运行任务计数
      this.runningTasksCount.value--
      
      // 执行下一个任务
      this.executeNextTask()
    }
  }
  
  /**
   * 更新任务进度
   * @param {string} taskId - 任务ID
   * @param {number} progress - 进度（0-100）
   * @param {string} streamContent - 流式输出的内容（可选）
   */
  updateTaskProgress(taskId, progress, streamContent) {
    const task = this.tasks.get(taskId)
    if (task) {
      task.progress = Math.min(100, Math.max(0, progress))
      
      // 更新流式内容
      if (streamContent !== undefined) {
        task.streamContent = streamContent
      }
      
      // 调用进度回调
      if (task.onProgress) {
        task.onProgress(task.progress, streamContent)
      }
    }
  }
  
  /**
   * 追加流式内容
   * @param {string} taskId - 任务ID
   * @param {string} chunk - 新增的内容片段
   */
  appendStreamContent(taskId, chunk) {
    const task = this.tasks.get(taskId)
    if (task) {
      task.streamContent += chunk
      
      // 根据内容长度自动更新进度（估算）
      // 假设最终内容约2000字符
      const estimatedProgress = Math.min(95, (task.streamContent.length / 2000) * 100)
      task.progress = Math.max(task.progress, estimatedProgress)
    }
  }
  
  /**
   * 取消任务
   * @param {string} taskId - 任务ID
   */
  cancelTask(taskId) {
    const task = this.tasks.get(taskId)
    if (task && (task.status === 'pending' || task.status === 'running')) {
      task.status = 'cancelled'
      task.completedAt = new Date()
      
      console.log(`🚫 [后台任务] 取消: ${task.name}`)
      
      // 保存状态
      this.saveTasksToStorage()
      
      ElNotification({
        title: '任务已取消',
        message: task.name,
        type: 'warning',
        duration: 2000
      })
    }
  }
  
  /**
   * 获取任务信息
   * @param {string} taskId - 任务ID
   * @returns {Object|null}
   */
  getTask(taskId) {
    return this.tasks.get(taskId) || null
  }
  
  /**
   * 获取所有任务
   * @param {Object} filter - 过滤条件
   * @returns {Array}
   */
  getAllTasks(filter = {}) {
    let tasks = Array.from(this.tasks.values())
    
    // 按类型过滤
    if (filter.type) {
      tasks = tasks.filter(task => task.type === filter.type)
    }
    
    // 按状态过滤
    if (filter.status) {
      tasks = tasks.filter(task => task.status === filter.status)
    }
    
    // 按时间排序（最新的在前）
    tasks.sort((a, b) => b.createdAt - a.createdAt)
    
    return tasks
  }
  
  /**
   * 清理已完成的任务
   * @param {number} keepDays - 保留天数
   */
  cleanupCompletedTasks(keepDays = 1) {
    const cutoffTime = Date.now() - (keepDays * 24 * 60 * 60 * 1000)
    
    let cleaned = 0
    for (const [taskId, task] of this.tasks.entries()) {
      if (
        (task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled') &&
        task.completedAt &&
        task.completedAt.getTime() < cutoffTime
      ) {
        this.tasks.delete(taskId)
        cleaned++
        console.log(`🗑️ [后台任务] 清理任务: ${task.name}`)
      }
    }
    
    // 清理后保存
    if (cleaned > 0) {
      this.saveTasksToStorage()
    }
  }
  
  /**
   * 获取任务统计
   * @returns {Object}
   */
  getStatistics() {
    const tasks = Array.from(this.tasks.values())
    
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      running: tasks.filter(t => t.status === 'running').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length,
      cancelled: tasks.filter(t => t.status === 'cancelled').length
    }
  }
  
  /**
   * 从localStorage加载任务
   */
  loadTasksFromStorage() {
    try {
      const savedTasks = localStorage.getItem('background_tasks')
      if (savedTasks) {
        const tasksData = JSON.parse(savedTasks)
        tasksData.forEach(taskData => {
          // 只恢复已完成或失败的任务（不恢复运行中的）
          if (taskData.status === 'completed' || taskData.status === 'failed' || taskData.status === 'cancelled') {
            const task = reactive({
              ...taskData,
              createdAt: new Date(taskData.createdAt),
              startedAt: taskData.startedAt ? new Date(taskData.startedAt) : null,
              completedAt: taskData.completedAt ? new Date(taskData.completedAt) : null,
              executor: null,
              onProgress: null,
              onComplete: null,
              onError: null
            })
            this.tasks.set(task.id, task)
          }
        })
        console.log(`📋 [后台任务] 从localStorage恢复了 ${this.tasks.size} 个任务`)
      }
    } catch (error) {
      console.error('恢复任务失败:', error)
    }
  }
  
  /**
   * 保存任务到localStorage
   */
  saveTasksToStorage() {
    try {
      const tasksData = Array.from(this.tasks.values()).map(task => ({
        id: task.id,
        name: task.name,
        type: task.type,
        status: task.status,
        progress: task.progress,
        result: task.result,
        streamContent: task.streamContent,
        error: task.error,
        createdAt: task.createdAt,
        startedAt: task.startedAt,
        completedAt: task.completedAt
      }))
      localStorage.setItem('background_tasks', JSON.stringify(tasksData))
    } catch (error) {
      console.error('保存任务失败:', error)
    }
  }
  
  /**
   * 设置自动保存
   */
  setupAutoSave() {
    // 每5秒自动保存一次
    setInterval(() => {
      this.saveTasksToStorage()
    }, 5000)
  }
}

// 导出单例
export const backgroundTaskService = new BackgroundTaskService()
export default backgroundTaskService

