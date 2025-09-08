<template>
  <div class="conversation-analytics">
    <div class="analytics-header">
      <h3>
        <el-icon><TrendCharts /></el-icon>
        对话分析
      </h3>
      <p>了解您与AI助手的互动模式，优化写作协作体验</p>
    </div>

    <!-- 概览统计 -->
    <div class="overview-stats">
      <div class="stat-card">
        <div class="stat-icon">💬</div>
        <div class="stat-content">
          <div class="stat-number">{{ metrics.totalInteractions }}</div>
          <div class="stat-label">总对话次数</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">⚡</div>
        <div class="stat-content">
          <div class="stat-number">{{ formatResponseTime(metrics.averageResponseTime) }}</div>
          <div class="stat-label">平均响应时间</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <div class="stat-number">{{ successRate }}%</div>
          <div class="stat-label">成功率</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-content">
          <div class="stat-number">{{ weeklyGrowth }}%</div>
          <div class="stat-label">周增长率</div>
        </div>
      </div>
    </div>

    <!-- 使用趋势图表 -->
    <div class="analytics-section">
      <h4>使用趋势</h4>
      <div class="chart-container">
        <div class="usage-chart" ref="usageChartRef">
          <div 
            v-for="(day, index) in chartData"
            :key="index"
            class="chart-bar"
            :style="{ height: getBarHeight(day.interactions) + '%' }"
            :title="`${day.date}: ${day.interactions} 次交互`"
          >
            <div class="bar-value">{{ day.interactions }}</div>
          </div>
        </div>
        <div class="chart-labels">
          <span 
            v-for="(day, index) in chartData"
            :key="index"
            class="chart-label"
          >
            {{ formatChartDate(day.date) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 热门功能 -->
    <div class="analytics-section">
      <h4>最常用功能</h4>
      <div class="feature-usage-list">
        <div 
          v-for="(feature, index) in topFeatures"
          :key="feature.name"
          class="feature-item"
        >
          <div class="feature-rank">{{ index + 1 }}</div>
          <div class="feature-info">
            <div class="feature-name">{{ getFeatureName(feature.name) }}</div>
            <div class="feature-stats">
              使用 {{ feature.count }} 次 · 最近使用：{{ formatDate(feature.lastUsed) }}
            </div>
          </div>
          <div class="feature-usage-bar">
            <div 
              class="usage-fill"
              :style="{ width: getUsagePercentage(feature.count) + '%' }"
            ></div>
          </div>
        </div>
        
        <div v-if="topFeatures.length === 0" class="no-features">
          <el-icon><Warning /></el-icon>
          <span>暂无使用数据</span>
        </div>
      </div>
    </div>

    <!-- 对话模式分析 -->
    <div class="analytics-section">
      <h4>对话模式分析</h4>
      <div class="pattern-analysis">
        <div class="pattern-item">
          <div class="pattern-label">最活跃时段</div>
          <div class="pattern-value">{{ mostActiveHour }}</div>
        </div>
        
        <div class="pattern-item">
          <div class="pattern-label">平均对话长度</div>
          <div class="pattern-value">{{ averageConversationLength }} 轮</div>
        </div>
        
        <div class="pattern-item">
          <div class="pattern-label">主要请求类型</div>
          <div class="pattern-value">{{ primaryRequestType }}</div>
        </div>
        
        <div class="pattern-item">
          <div class="pattern-label">协作效率</div>
          <div class="pattern-value">
            <el-rate
              v-model="collaborationEfficiency"
              disabled
              show-score
              text-color="#ff9900"
              score-template="{value} 分"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 个性化洞察 */
    <div class="analytics-section">
      <h4>个性化洞察</h4>
      <div class="insights-container">
        <div 
          v-for="insight in personalizedInsights"
          :key="insight.id"
          class="insight-card"
          :class="insight.type"
        >
          <div class="insight-icon">{{ insight.icon }}</div>
          <div class="insight-content">
            <h5>{{ insight.title }}</h5>
            <p>{{ insight.description }}</p>
            <div v-if="insight.actions" class="insight-actions">
              <el-button
                v-for="action in insight.actions"
                :key="action.text"
                size="small"
                :type="action.type"
                @click="handleInsightAction(action)"
              >
                {{ action.text }}
              </el-button>
            </div>
          </div>
        </div>
        
        <div v-if="personalizedInsights.length === 0" class="no-insights">
          <el-icon><InfoFilled /></el-icon>
          <span>继续使用AI助手以获得个性化洞察</span>
        </div>
      </div>
    </div>

    <!-- 改进建议 */
    <div class="analytics-section">
      <h4>协作改进建议</h4>
      <div class="suggestions-container">
        <div 
          v-for="suggestion in improvementSuggestions"
          :key="suggestion.id"
          class="suggestion-item"
        >
          <div class="suggestion-header">
            <span class="suggestion-priority" :class="suggestion.priority">
              {{ getPriorityText(suggestion.priority) }}
            </span>
            <span class="suggestion-category">{{ suggestion.category }}</span>
          </div>
          <div class="suggestion-content">
            <h5>{{ suggestion.title }}</h5>
            <p>{{ suggestion.description }}</p>
            <div class="suggestion-impact">
              预期改善：{{ suggestion.expectedImprovement }}
            </div>
          </div>
          <div class="suggestion-actions">
            <el-button size="small" @click="applySuggestion(suggestion)">
              立即应用
            </el-button>
            <el-button size="small" text @click="dismissSuggestion(suggestion.id)">
              忽略
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 导出选项 -->
    <div class="analytics-actions">
      <el-button @click="exportAnalytics">
        <el-icon><Download /></el-icon>
        导出分析报告
      </el-button>
      <el-button @click="resetAnalytics">
        <el-icon><RefreshLeft /></el-icon>
        重置统计数据
      </el-button>
      <el-button type="primary" @click="optimizeSettings">
        <el-icon><Tools /></el-icon>
        优化助手设置
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  TrendCharts, Warning, InfoFilled, Download, 
  RefreshLeft, Tools 
} from '@element-plus/icons-vue'
import { useAssistantStore } from '@/stores/assistantStore.js'

// Store
const assistantStore = useAssistantStore()

// 响应式数据
const usageChartRef = ref(null)

// 计算属性
const metrics = computed(() => assistantStore.metrics)

const successRate = computed(() => assistantStore.successRate)

const chartData = computed(() => {
  // 获取最近7天的使用数据
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  
  const data = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(sevenDaysAgo)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    
    const usage = metrics.value.weeklyUsage.find(u => u.date === dateStr)
    data.push({
      date: dateStr,
      interactions: usage ? usage.interactions : 0
    })
  }
  
  return data
})

const weeklyGrowth = computed(() => {
  const thisWeek = chartData.value.slice(-7).reduce((sum, day) => sum + day.interactions, 0)
  const lastWeek = chartData.value.slice(-14, -7).reduce((sum, day) => sum + day.interactions, 0)
  
  if (lastWeek === 0) return thisWeek > 0 ? 100 : 0
  return Math.round(((thisWeek - lastWeek) / lastWeek) * 100)
})

const topFeatures = computed(() => {
  return [...metrics.value.mostUsedFeatures].slice(0, 5)
})

const mostActiveHour = computed(() => {
  // 分析对话历史中最活跃的时段
  const hourCounts = {}
  
  assistantStore.conversationHistory.forEach(msg => {
    if (msg.type === 'user') {
      const hour = new Date(msg.timestamp).getHours()
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    }
  })
  
  let maxHour = 9 // 默认值
  let maxCount = 0
  
  Object.entries(hourCounts).forEach(([hour, count]) => {
    if (count > maxCount) {
      maxCount = count
      maxHour = parseInt(hour)
    }
  })
  
  return `${maxHour}:00 - ${maxHour + 1}:00`
})

const averageConversationLength = computed(() => {
  if (assistantStore.conversationHistory.length === 0) return 0
  
  // 计算平均对话轮次
  let conversations = 0
  let currentLength = 0
  let totalLength = 0
  
  assistantStore.conversationHistory.forEach(msg => {
    if (msg.type === 'user') {
      if (currentLength > 0) {
        totalLength += currentLength
        conversations++
      }
      currentLength = 1
    } else if (msg.type === 'assistant' && currentLength > 0) {
      currentLength++
    }
  })
  
  if (currentLength > 0) {
    totalLength += currentLength
    conversations++
  }
  
  return conversations > 0 ? Math.round(totalLength / conversations) : 0
})

const primaryRequestType = computed(() => {
  const requestTypes = {
    writing: 0,
    revision: 0,
    analysis: 0,
    consultation: 0,
    other: 0
  }
  
  assistantStore.conversationHistory.forEach(msg => {
    if (msg.type === 'user') {
      const content = msg.content.toLowerCase()
      
      if (content.includes('写') || content.includes('续写') || content.includes('创作')) {
        requestTypes.writing++
      } else if (content.includes('修改') || content.includes('优化') || content.includes('润色')) {
        requestTypes.revision++
      } else if (content.includes('分析') || content.includes('检查') || content.includes('评估')) {
        requestTypes.analysis++
      } else if (content.includes('建议') || content.includes('如何') || content.includes('怎么')) {
        requestTypes.consultation++
      } else {
        requestTypes.other++
      }
    }
  })
  
  const typeNames = {
    writing: '创作协助',
    revision: '修改优化',
    analysis: '质量分析',
    consultation: '写作咨询',
    other: '其他类型'
  }
  
  let maxType = 'other'
  let maxCount = 0
  
  Object.entries(requestTypes).forEach(([type, count]) => {
    if (count > maxCount) {
      maxCount = count
      maxType = type
    }
  })
  
  return typeNames[maxType]
})

const collaborationEfficiency = computed(() => {
  // 基于成功率、响应时间等因素计算协作效率评分
  const successFactor = successRate.value / 100 * 2 // 0-2分
  const speedFactor = Math.max(0, 2 - (metrics.value.averageResponseTime / 1000 / 5)) // 0-2分，5秒以内满分
  const usageFactor = Math.min(1, metrics.value.totalInteractions / 50) // 0-1分，使用次数因子
  
  return Math.round((successFactor + speedFactor + usageFactor) * 10) / 10 // 保留一位小数
})

const personalizedInsights = computed(() => {
  const insights = []
  
  // 基于使用模式生成洞察
  if (metrics.value.totalInteractions > 20) {
    if (successRate.value > 90) {
      insights.push({
        id: 'high_success',
        type: 'positive',
        icon: '🎉',
        title: '协作默契度很高！',
        description: '您与AI助手的协作非常顺畅，成功率超过90%。继续保持这种良好的互动模式。',
        actions: [
          { text: '分享经验', type: 'primary', action: 'share_experience' }
        ]
      })
    }
    
    if (metrics.value.averageResponseTime > 5000) {
      insights.push({
        id: 'slow_response',
        type: 'warning',
        icon: '⏰',
        title: '响应速度可以优化',
        description: '平均响应时间较长，可能影响您的创作流畅度。建议调整请求方式或检查网络状况。',
        actions: [
          { text: '优化设置', type: 'primary', action: 'optimize_speed' },
          { text: '查看技巧', type: 'default', action: 'view_tips' }
        ]
      })
    }
  }
  
  if (topFeatures.value.length > 0) {
    const topFeature = topFeatures.value[0]
    if (topFeature.count > 10) {
      insights.push({
        id: 'feature_expert',
        type: 'info',
        icon: '🏆',
        title: `您是"${getFeatureName(topFeature.name)}"专家`,
        description: `您最常使用${getFeatureName(topFeature.name)}功能，已经使用${topFeature.count}次。不妨尝试其他功能来扩展创作可能性。`,
        actions: [
          { text: '探索新功能', type: 'primary', action: 'explore_features' }
        ]
      })
    }
  }
  
  return insights
})

const improvementSuggestions = computed(() => {
  const suggestions = []
  
  // 基于使用数据生成改进建议
  if (metrics.value.totalInteractions > 5) {
    if (successRate.value < 80) {
      suggestions.push({
        id: 'improve_success_rate',
        priority: 'high',
        category: '交互优化',
        title: '提高请求成功率',
        description: '您的请求成功率偏低，建议明确描述需求，提供更多上下文信息。',
        expectedImprovement: '成功率提升15-25%',
        action: 'show_request_tips'
      })
    }
    
    if (topFeatures.value.length < 3) {
      suggestions.push({
        id: 'explore_features',
        priority: 'medium',
        category: '功能探索',
        title: '扩展功能使用范围',
        description: '您只使用了少数几个功能，尝试更多功能可以提升创作效率。',
        expectedImprovement: '创作效率提升20-30%',
        action: 'feature_tutorial'
      })
    }
  }
  
  if (assistantStore.settings.personality === 'professional' && primaryRequestType.value === '创作协助') {
    suggestions.push({
      id: 'personality_adjustment',
      priority: 'low',
      category: '个性化配置',
      title: '调整助手个性',
      description: '您主要使用创作功能，建议切换到"创意伙伴"模式以获得更多灵感。',
      expectedImprovement: '创意产出提升10-20%',
      action: 'adjust_personality'
    })
  }
  
  return suggestions
})

// 方法
const formatResponseTime = (time) => {
  if (time < 1000) return `${time}ms`
  return `${(time / 1000).toFixed(1)}s`
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now - date
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays}天前`
  
  return date.toLocaleDateString()
}

const formatChartDate = (dateString) => {
  const date = new Date(dateString)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const getBarHeight = (interactions) => {
  const maxInteractions = Math.max(...chartData.value.map(d => d.interactions), 1)
  return Math.max((interactions / maxInteractions) * 100, 5) // 最小高度5%
}

const getUsagePercentage = (count) => {
  const maxCount = Math.max(...topFeatures.value.map(f => f.count), 1)
  return (count / maxCount) * 100
}

const getFeatureName = (featureKey) => {
  const featureNames = {
    continue_writing: '续写内容',
    polish_language: '语言润色',
    analyze_quality: '质量分析',
    generate_dialogue: '生成对话',
    improve_readability: '可读性优化',
    brainstorm_plot: '情节脑洞',
    character_development: '角色发展',
    scene_description: '场景描写'
  }
  
  return featureNames[featureKey] || featureKey
}

const getPriorityText = (priority) => {
  const priorityTexts = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级'
  }
  
  return priorityTexts[priority] || priority
}

const handleInsightAction = (action) => {
  switch (action.action) {
    case 'share_experience':
      ElMessage.success('分享功能即将上线！')
      break
    case 'optimize_speed':
      optimizeSettings()
      break
    case 'view_tips':
      showRequestTips()
      break
    case 'explore_features':
      exploreFeatures()
      break
  }
}

const applySuggestion = (suggestion) => {
  switch (suggestion.action) {
    case 'show_request_tips':
      showRequestTips()
      break
    case 'feature_tutorial':
      showFeatureTutorial()
      break
    case 'adjust_personality':
      adjustPersonality()
      break
  }
}

const dismissSuggestion = (suggestionId) => {
  ElMessage.info('建议已忽略')
}

const showRequestTips = () => {
  ElMessageBox.alert(
    `为了获得更好的AI助手响应，建议：
    
1. 明确描述您的需求
2. 提供足够的上下文信息
3. 一次只提出一个主要问题
4. 使用具体而非抽象的表达
5. 选择适当的文本进行操作`,
    '请求技巧',
    { type: 'info' }
  )
}

const showFeatureTutorial = () => {
  ElMessage.info('功能教程即将在新窗口中打开')
}

const adjustPersonality = () => {
  assistantStore.updateSettings({
    ...assistantStore.settings,
    personality: 'creative'
  })
  ElMessage.success('已切换到创意伙伴模式')
}

const exploreFeatures = () => {
  ElMessage.info('功能探索面板即将打开')
}

const exportAnalytics = () => {
  try {
    const analyticsData = {
      overview: {
        totalInteractions: metrics.value.totalInteractions,
        successRate: successRate.value,
        averageResponseTime: metrics.value.averageResponseTime,
        weeklyGrowth: weeklyGrowth.value
      },
      usage: chartData.value,
      features: topFeatures.value,
      patterns: {
        mostActiveHour: mostActiveHour.value,
        averageConversationLength: averageConversationLength.value,
        primaryRequestType: primaryRequestType.value,
        collaborationEfficiency: collaborationEfficiency.value
      },
      insights: personalizedInsights.value,
      suggestions: improvementSuggestions.value,
      exportDate: new Date().toISOString()
    }
    
    const dataStr = JSON.stringify(analyticsData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    
    const link = document.createElement('a')
    link.href = URL.createObjectURL(dataBlob)
    link.download = `ai-assistant-analytics-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    ElMessage.success('分析报告已导出')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

const resetAnalytics = () => {
  ElMessageBox.confirm(
    '确定要重置所有统计数据吗？此操作不可恢复。',
    '重置统计',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 重置指标
    Object.assign(assistantStore.metrics, {
      totalInteractions: 0,
      successfulInteractions: 0,
      averageResponseTime: 0,
      mostUsedFeatures: [],
      userSatisfaction: 0,
      weeklyUsage: []
    })
    
    assistantStore.saveMetrics()
    ElMessage.success('统计数据已重置')
  })
}

const optimizeSettings = () => {
  // 基于分析结果自动优化设置
  const optimizedSettings = { ...assistantStore.settings }
  
  // 根据主要请求类型调整个性
  if (primaryRequestType.value === '创作协助') {
    optimizedSettings.personality = 'creative'
  } else if (primaryRequestType.value === '质量分析') {
    optimizedSettings.personality = 'analytical'
  }
  
  // 根据成功率调整响应速度
  if (successRate.value < 80) {
    optimizedSettings.responseSpeed = 'thoughtful'
  } else if (metrics.value.averageResponseTime > 5000) {
    optimizedSettings.responseSpeed = 'fast'
  }
  
  assistantStore.updateSettings(optimizedSettings)
  ElMessage.success('助手设置已优化')
}

onMounted(() => {
  // 记录功能使用
  assistantStore.recordFeatureUsage('conversation_analytics')
})
</script>

<style scoped>
.conversation-analytics {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.analytics-header {
  text-align: center;
  margin-bottom: 32px;
}

.analytics-header h3 {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 24px;
}

.analytics-header p {
  color: #7f8c8d;
  margin: 0;
}

/* 概览统计 */
.overview-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #7f8c8d;
}

/* 分析区块 */
.analytics-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.analytics-section h4 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
}

/* 使用趋势图表 */
.chart-container {
  margin-top: 16px;
}

.usage-chart {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 120px;
  padding: 0 8px;
  margin-bottom: 8px;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(to top, #409eff, #66b3ff);
  border-radius: 4px 4px 0 0;
  position: relative;
  min-height: 4px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.chart-bar:hover {
  background: linear-gradient(to top, #337ecc, #5599dd);
}

.bar-value {
  color: white;
  font-size: 10px;
  font-weight: 600;
  margin-bottom: 4px;
}

.chart-labels {
  display: flex;
  gap: 8px;
  padding: 0 8px;
}

.chart-label {
  flex: 1;
  text-align: center;
  font-size: 12px;
  color: #7f8c8d;
}

/* 功能使用列表 */
.feature-usage-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.feature-rank {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #409eff;
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.feature-info {
  flex: 1;
}

.feature-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.feature-stats {
  font-size: 12px;
  color: #7f8c8d;
}

.feature-usage-bar {
  width: 100px;
  height: 8px;
  background: #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.usage-fill {
  height: 100%;
  background: linear-gradient(to right, #409eff, #66b3ff);
  transition: width 0.3s ease;
}

.no-features {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px;
  color: #909399;
  font-size: 14px;
}

/* 模式分析 */
.pattern-analysis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.pattern-item {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  text-align: center;
}

.pattern-label {
  font-size: 12px;
  color: #7f8c8d;
  margin-bottom: 8px;
}

.pattern-value {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

/* 洞察卡片 */
.insights-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.insight-card {
  display: flex;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
  border-left: 4px solid #409eff;
}

.insight-card.positive {
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
  border-left-color: #67c23a;
}

.insight-card.warning {
  background: linear-gradient(135deg, #fffbf0 0%, #fef7e6 100%);
  border-left-color: #e6a23c;
}

.insight-card.info {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  border-left-color: #909399;
}

.insight-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.insight-content {
  flex: 1;
}

.insight-content h5 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
}

.insight-content p {
  margin: 0 0 12px 0;
  color: #606266;
  line-height: 1.5;
}

.insight-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.no-insights {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px;
  color: #909399;
  font-size: 14px;
}

/* 改进建议 */
.suggestions-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.suggestion-item {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
}

.suggestion-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.suggestion-priority {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.suggestion-priority.high {
  background: #fef0f0;
  color: #f56c6c;
}

.suggestion-priority.medium {
  background: #fdf6ec;
  color: #e6a23c;
}

.suggestion-priority.low {
  background: #f4f4f5;
  color: #909399;
}

.suggestion-category {
  padding: 4px 8px;
  background: #e3f2fd;
  color: #409eff;
  border-radius: 4px;
  font-size: 12px;
}

.suggestion-content h5 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
}

.suggestion-content p {
  margin: 0 0 8px 0;
  color: #606266;
  line-height: 1.5;
}

.suggestion-impact {
  font-size: 12px;
  color: #67c23a;
  font-weight: 500;
  margin-bottom: 12px;
}

.suggestion-actions {
  display: flex;
  gap: 8px;
}

/* 操作按钮 */
.analytics-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .conversation-analytics {
    padding: 16px 12px;
  }
  
  .overview-stats {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .analytics-section {
    padding: 20px 16px;
  }
  
  .pattern-analysis {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .insight-card {
    flex-direction: column;
    gap: 12px;
  }
  
  .analytics-actions {
    flex-direction: column;
  }
}
</style>
