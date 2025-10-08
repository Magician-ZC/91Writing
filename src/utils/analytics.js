/**
 * 91Writing 用户行为分析工具
 * 负责收集用户行为数据并发送到后端进行分析
 */

import apiManager from '@/services/apiManager'

class AnalyticsTracker {
  constructor() {
    this.events = []
    this.sessionId = this.generateSessionId()
    this.isEnabled = true
    this.batchSize = 10 // 批量发送阈值
    this.flushInterval = 30000 // 30秒自动发送一次
    
    // 启动定时发送
    this.startAutoFlush()
    
    // 监听页面卸载，发送剩余数据
    window.addEventListener('beforeunload', () => {
      this.flush(true)
    })
  }

  /**
   * 生成会话ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 获取当前用户ID
   */
  getCurrentUserId() {
    const authStore = JSON.parse(localStorage.getItem('auth') || '{}')
    return authStore.user?.id || null
  }

  /**
   * 记录事件
   */
  track(event, properties = {}) {
    if (!this.isEnabled) return

    const trackingData = {
      action: event,
      details: {
        ...properties,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        url: window.location.href,
        referrer: document.referrer
      },
      userId: this.getCurrentUserId(),
      ipAddress: null, // 由后端获取
      userAgent: navigator.userAgent
    }

    this.events.push(trackingData)

    // 达到批量阈值时发送
    if (this.events.length >= this.batchSize) {
      this.flush()
    }
  }

  /**
   * 页面访问跟踪
   */
  trackPageView(page, properties = {}) {
    this.track('page_view', {
      page,
      title: document.title,
      ...properties
    })
  }

  /**
   * 功能使用跟踪
   */
  trackFeatureUsage(feature, details = {}) {
    this.track('feature_usage', {
      feature,
      ...details
    })
  }

  /**
   * 按钮点击跟踪
   */
  trackClick(elementName, properties = {}) {
    this.track('click', {
      element: elementName,
      ...properties
    })
  }

  /**
   * AI功能使用跟踪
   */
  trackAIUsage(functionType, details = {}) {
    this.track('ai_usage', {
      functionType,
      ...details
    })
  }

  /**
   * 写作行为跟踪
   */
  trackWriting(action, details = {}) {
    this.track('writing', {
      action,
      ...details
    })
  }

  /**
   * 商业行为跟踪
   */
  trackCommerce(action, details = {}) {
    this.track('commerce', {
      action,
      ...details
    })
  }

  /**
   * 错误跟踪
   */
  trackError(error, context = {}) {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      context
    })
  }

  /**
   * 性能跟踪
   */
  trackPerformance(metric, value, details = {}) {
    this.track('performance', {
      metric,
      value,
      ...details
    })
  }

  /**
   * 发送数据到后端
   */
  async flush(isBeforeUnload = false) {
    if (this.events.length === 0) return

    const eventsToSend = [...this.events]
    this.events = []

    try {
      if (isBeforeUnload) {
        // 页面卸载时使用 sendBeacon，不等待响应
        const blob = new Blob([JSON.stringify({ events: eventsToSend })], {
          type: 'application/json'
        })
        navigator.sendBeacon('/api/analytics/batch', blob)
      } else {
        // 正常发送
        await apiManager.batchTrackActivities(eventsToSend)
      }
    } catch (error) {
      console.error('Analytics tracking failed:', error)
      // 发送失败时，将数据重新加入队列
      this.events.unshift(...eventsToSend)
    }
  }

  /**
   * 启动自动发送定时器
   */
  startAutoFlush() {
    setInterval(() => {
      this.flush()
    }, this.flushInterval)
  }

  /**
   * 启用/禁用跟踪
   */
  setEnabled(enabled) {
    this.isEnabled = enabled
  }

  /**
   * 清空缓存的事件
   */
  clear() {
    this.events = []
  }
}

// 创建全局实例
const analytics = new AnalyticsTracker()

// 自动跟踪页面性能
if (window.performance && window.performance.timing) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const timing = window.performance.timing
      const loadTime = timing.loadEventEnd - timing.navigationStart
      const domReady = timing.domContentLoadedEventEnd - timing.navigationStart
      const firstPaint = timing.responseEnd - timing.fetchStart

      analytics.trackPerformance('page_load', loadTime, {
        domReady,
        firstPaint,
        page: window.location.pathname
      })
    }, 0)
  })
}

// 自动跟踪未捕获的错误
window.addEventListener('error', (event) => {
  analytics.trackError(event.error || new Error(event.message), {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  })
})

// 自动跟踪未处理的Promise拒绝
window.addEventListener('unhandledrejection', (event) => {
  analytics.trackError(event.reason || new Error('Unhandled Promise Rejection'), {
    type: 'promise_rejection'
  })
})

export default analytics
