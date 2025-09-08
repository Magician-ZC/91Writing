<template>
  <div class="context-preview">
    <div class="preview-header">
      <h3>🔍 上下文预览</h3>
      <div class="header-actions">
        <el-select 
          v-model="selectedChapter" 
          placeholder="选择章节"
          size="small"
          style="width: 200px;"
          @change="handleChapterChange"
        >
          <el-option 
            v-for="chapter in availableChapters"
            :key="chapter.id"
            :label="`第${chapter.id}章：${chapter.title}`"
            :value="chapter.id"
          />
        </el-select>
        <el-button 
          type="primary" 
          size="small" 
          @click="generateContext"
          :loading="isGenerating"
          :disabled="!selectedChapter"
        >
          生成上下文
        </el-button>
        <el-button 
          size="small" 
          @click="copyContextToClipboard"
          :disabled="!formattedContext"
        >
          复制上下文
        </el-button>
      </div>
    </div>

    <!-- Token使用统计 -->
    <div class="token-usage-panel">
      <h4>📊 Token使用分析</h4>
      <div class="usage-chart">
        <el-row :gutter="16">
          <el-col :span="6">
            <div class="usage-item">
              <div class="usage-label">核心记忆</div>
              <div class="usage-bar">
                <el-progress 
                  :percentage="getUsagePercentage('essential')"
                  :color="getUsageColor('essential')"
                  :show-text="false"
                />
              </div>
              <div class="usage-value">{{ tokenUsage.essential || 0 }} tokens</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="usage-item">
              <div class="usage-label">相关历史</div>
              <div class="usage-bar">
                <el-progress 
                  :percentage="getUsagePercentage('relevant')"
                  :color="getUsageColor('relevant')"
                  :show-text="false"
                />
              </div>
              <div class="usage-value">{{ tokenUsage.relevant || 0 }} tokens</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="usage-item">
              <div class="usage-label">最近内容</div>
              <div class="usage-bar">
                <el-progress 
                  :percentage="getUsagePercentage('recent')"
                  :color="getUsageColor('recent')"
                  :show-text="false"
                />
              </div>
              <div class="usage-value">{{ tokenUsage.recent || 0 }} tokens</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="usage-item">
              <div class="usage-label">当前章节</div>
              <div class="usage-bar">
                <el-progress 
                  :percentage="getUsagePercentage('current')"
                  :color="getUsageColor('current')"
                  :show-text="false"
                />
              </div>
              <div class="usage-value">{{ tokenUsage.current || 0 }} tokens</div>
            </div>
          </el-col>
        </el-row>
        
        <div class="total-usage">
          <div class="total-label">总Token使用量</div>
          <el-progress 
            :percentage="Math.round((tokenUsage.total || 0) / maxTokens * 100)"
            :color="getTotalUsageColor()"
            :stroke-width="8"
          />
          <div class="total-text">
            {{ tokenUsage.total || 0 }} / {{ maxTokens }} tokens 
            ({{ Math.round((tokenUsage.total || 0) / maxTokens * 100) }}%)
          </div>
        </div>
      </div>
    </div>

    <!-- 上下文内容预览 -->
    <div v-if="context" class="context-content">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 核心设定 -->
        <el-tab-pane label="核心设定" name="essential">
          <div class="context-section">
            <div v-if="context.essential && Object.keys(context.essential).length > 0">
              <!-- 角色信息 -->
              <div v-if="context.essential.characters && context.essential.characters.length > 0" class="subsection">
                <h5>👥 主要角色</h5>
                <div class="characters-grid">
                  <div 
                    v-for="character in context.essential.characters" 
                    :key="character.name"
                    class="character-card"
                  >
                    <div class="character-header">
                      <span class="character-name">{{ character.name }}</span>
                      <el-tag :type="getRoleType(character.role)" size="small">
                        {{ getRoleText(character.role) }}
                      </el-tag>
                    </div>
                    <div class="character-traits">
                      <el-tag 
                        v-for="trait in character.traits" 
                        :key="trait"
                        size="small"
                        type="info"
                      >
                        {{ trait }}
                      </el-tag>
                    </div>
                    <div class="character-status">{{ character.status }}</div>
                  </div>
                </div>
              </div>
              
              <!-- 世界观信息 -->
              <div v-if="context.essential.worldSetting" class="subsection">
                <h5>🌍 世界观设定</h5>
                <el-descriptions :column="2" size="small" border>
                  <el-descriptions-item label="世界类型" v-if="context.essential.worldSetting.type">
                    {{ context.essential.worldSetting.type }}
                  </el-descriptions-item>
                  <el-descriptions-item label="力量体系" v-if="context.essential.worldSetting.power">
                    {{ context.essential.worldSetting.power }}
                  </el-descriptions-item>
                  <el-descriptions-item label="社会结构" v-if="context.essential.worldSetting.society">
                    {{ context.essential.worldSetting.society }}
                  </el-descriptions-item>
                  <el-descriptions-item 
                    label="核心规则" 
                    v-if="context.essential.worldSetting.rules && context.essential.worldSetting.rules.length > 0"
                  >
                    <ul class="rules-list">
                      <li v-for="rule in context.essential.worldSetting.rules" :key="rule">{{ rule }}</li>
                    </ul>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
              
              <!-- 主线情节 -->
              <div v-if="context.essential.mainPlot" class="subsection">
                <h5>📖 主线情节</h5>
                <el-descriptions :column="1" size="small" border>
                  <el-descriptions-item label="主要冲突" v-if="context.essential.mainPlot.conflict">
                    {{ context.essential.mainPlot.conflict }}
                  </el-descriptions-item>
                  <el-descriptions-item label="当前故事弧" v-if="context.essential.mainPlot.arc">
                    {{ context.essential.mainPlot.arc }}
                  </el-descriptions-item>
                  <el-descriptions-item 
                    label="关键情节点" 
                    v-if="context.essential.mainPlot.points && context.essential.mainPlot.points.length > 0"
                  >
                    <div class="plot-points">
                      <el-tag 
                        v-for="point in context.essential.mainPlot.points" 
                        :key="point"
                        type="warning"
                        style="margin-right: 8px; margin-bottom: 4px;"
                      >
                        {{ point }}
                      </el-tag>
                    </div>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </div>
            <div v-else class="empty-content">
              <el-empty description="暂无核心设定信息" :image-size="80" />
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 相关历史 -->
        <el-tab-pane label="相关历史" name="relevant">
          <div class="context-section">
            <div v-if="context.relevant && context.relevant.length > 0">
              <div 
                v-for="item in context.relevant" 
                :key="item.chapter"
                class="history-item"
              >
                <div class="history-header">
                  <span class="chapter-badge">第{{ item.chapter }}章</span>
                  <span class="chapter-title">{{ item.title }}</span>
                  <div class="importance-indicator">
                    <el-rate 
                      v-model="item.importance" 
                      :max="1" 
                      :show-score="false"
                      disabled
                      score-template="{value}"
                    />
                    <span class="importance-score">{{ Math.round((item.importance || 0) * 100) }}%</span>
                  </div>
                </div>
                <div class="history-summary">{{ item.summary }}</div>
                <div v-if="item.events && item.events.length > 0" class="history-events">
                  <span class="events-label">关键事件：</span>
                  <el-tag 
                    v-for="event in item.events" 
                    :key="event"
                    size="small"
                    type="success"
                    style="margin-right: 4px;"
                  >
                    {{ event }}
                  </el-tag>
                </div>
              </div>
            </div>
            <div v-else class="empty-content">
              <el-empty description="暂无相关历史信息" :image-size="80" />
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 最近内容 -->
        <el-tab-pane label="最近内容" name="recent">
          <div class="context-section">
            <div v-if="context.recent && context.recent.length > 0">
              <div 
                v-for="item in context.recent" 
                :key="item.chapter"
                class="recent-item"
              >
                <div class="recent-header">
                  <span class="chapter-badge recent">第{{ item.chapter }}章</span>
                </div>
                <div class="recent-summary">{{ item.summary }}</div>
                <div class="recent-details">
                  <div v-if="item.events && item.events.length > 0" class="detail-row">
                    <span class="detail-label">事件：</span>
                    <span class="detail-content">{{ item.events.join('、') }}</span>
                  </div>
                  <div v-if="item.changes && item.changes.length > 0" class="detail-row">
                    <span class="detail-label">变化：</span>
                    <span class="detail-content">{{ item.changes.join('、') }}</span>
                  </div>
                  <div v-if="item.progress" class="detail-row">
                    <span class="detail-label">推进：</span>
                    <span class="detail-content">{{ item.progress }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-content">
              <el-empty description="暂无最近内容信息" :image-size="80" />
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 格式化输出 -->
        <el-tab-pane label="格式化输出" name="formatted">
          <div class="formatted-context">
            <div class="format-actions">
              <el-button size="small" @click="copyFormattedContext">
                复制格式化文本
              </el-button>
              <el-button size="small" @click="exportContext">
                导出为文件
              </el-button>
            </div>
            <el-input 
              v-model="formattedContext"
              type="textarea" 
              :rows="20"
              readonly
              placeholder="选择章节并生成上下文后，这里将显示格式化的提示词"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    
    <!-- 空状态 -->
    <div v-else class="empty-context">
      <el-empty description="选择章节并生成上下文开始预览">
        <template #description>
          <p>上下文预览可以帮助您：</p>
          <ul class="benefits-list">
            <li>查看AI生成时将使用的记忆信息</li>
            <li>优化Token使用，控制生成成本</li>
            <li>确保上下文的完整性和相关性</li>
            <li>调整记忆重要度和内容筛选</li>
          </ul>
        </template>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useNovelStore } from '@/stores/novel'
import { ElMessage } from 'element-plus'
import contextService from '@/services/contextService'

// Props
const props = defineProps({
  context: {
    type: Object,
    default: null
  },
  tokenUsage: {
    type: Object,
    default: () => ({
      total: 0,
      essential: 0,
      relevant: 0,
      recent: 0,
      current: 0
    })
  }
})

// Emits
const emit = defineEmits(['generate'])

// Store
const novelStore = useNovelStore()

// 响应式数据
const selectedChapter = ref(null)
const activeTab = ref('essential')
const isGenerating = ref(false)
const formattedContext = ref('')
const maxTokens = ref(3000)

// 计算属性
const availableChapters = computed(() => {
  return novelStore.chapters.filter(chapter => chapter.content || chapter.outline)
})

const context = computed(() => props.context)
const tokenUsage = computed(() => props.tokenUsage)

// 方法
const handleChapterChange = (chapterNumber) => {
  selectedChapter.value = chapterNumber
}

const generateContext = async () => {
  if (!selectedChapter.value) {
    ElMessage.warning('请先选择一个章节')
    return
  }
  
  isGenerating.value = true
  try {
    emit('generate', selectedChapter.value)
    ElMessage.success('上下文生成成功')
  } catch (error) {
    ElMessage.error('生成上下文失败：' + error.message)
  } finally {
    isGenerating.value = false
  }
}

const getUsagePercentage = (type) => {
  const value = tokenUsage.value[type] || 0
  const max = getMaxTokensForType(type)
  return Math.round((value / max) * 100)
}

const getMaxTokensForType = (type) => {
  const ratios = {
    essential: 0.17,  // 500/3000
    relevant: 0.33,   // 1000/3000
    recent: 0.4,      // 1200/3000
    current: 0.1      // 300/3000
  }
  return Math.round(maxTokens.value * ratios[type])
}

const getUsageColor = (type) => {
  const percentage = getUsagePercentage(type) / 100
  if (percentage < 0.7) return '#67c23a'
  if (percentage < 0.9) return '#e6a23c'
  return '#f56c6c'
}

const getTotalUsageColor = () => {
  const percentage = (tokenUsage.value.total || 0) / maxTokens.value
  if (percentage < 0.7) return '#67c23a'
  if (percentage < 0.9) return '#e6a23c'
  return '#f56c6c'
}

const getRoleType = (role) => {
  const roleTypes = {
    'protagonist': 'danger',
    'supporting': 'success',
    'antagonist': 'warning',
    'minor': 'info'
  }
  return roleTypes[role] || 'info'
}

const getRoleText = (role) => {
  const roleTexts = {
    'protagonist': '主角',
    'supporting': '配角',
    'antagonist': '反派',
    'minor': '路人'
  }
  return roleTexts[role] || role
}

const copyContextToClipboard = async () => {
  if (!formattedContext.value) {
    ElMessage.warning('没有可复制的上下文内容')
    return
  }
  
  try {
    await navigator.clipboard.writeText(formattedContext.value)
    ElMessage.success('上下文已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败：' + error.message)
  }
}

const copyFormattedContext = async () => {
  await copyContextToClipboard()
}

const exportContext = () => {
  if (!formattedContext.value) {
    ElMessage.warning('没有可导出的上下文内容')
    return
  }
  
  const blob = new Blob([formattedContext.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `context_chapter_${selectedChapter.value}_${new Date().toISOString().split('T')[0]}.txt`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('上下文导出成功')
}

// 监听上下文变化，更新格式化文本
watch(context, (newContext) => {
  if (newContext) {
    formattedContext.value = contextService.formatContextForGeneration(newContext)
  } else {
    formattedContext.value = ''
  }
}, { deep: true, immediate: true })
</script>

<style scoped>
.context-preview {
  padding: 20px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.preview-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.token-usage-panel {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  margin-bottom: 20px;
}

.token-usage-panel h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
}

.usage-chart {
  margin-bottom: 16px;
}

.usage-item {
  text-align: center;
}

.usage-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.usage-bar {
  margin-bottom: 8px;
}

.usage-value {
  font-size: 13px;
  color: #909399;
}

.total-usage {
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
  text-align: center;
}

.total-label {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 12px;
}

.total-text {
  margin-top: 8px;
  font-size: 14px;
  color: #606266;
}

.context-content {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e4e7ed;
}

.context-section {
  padding: 20px;
  max-height: 600px;
  overflow-y: auto;
}

.subsection {
  margin-bottom: 24px;
}

.subsection h5 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
}

.characters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.character-card {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 12px;
  background: #fafafa;
}

.character-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.character-name {
  font-weight: 600;
  color: #303133;
}

.character-traits {
  margin-bottom: 8px;
}

.character-traits .el-tag {
  margin-right: 4px;
  margin-bottom: 4px;
}

.character-status {
  font-size: 13px;
  color: #606266;
}

.rules-list {
  margin: 0;
  padding-left: 20px;
}

.rules-list li {
  margin-bottom: 4px;
  color: #606266;
}

.plot-points {
  line-height: 1.8;
}

.history-item,
.recent-item {
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  margin-bottom: 16px;
  background: #fafafa;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.chapter-badge {
  background: #409eff;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.chapter-badge.recent {
  background: #67c23a;
}

.chapter-title {
  font-weight: 500;
  color: #303133;
  margin-left: 8px;
}

.importance-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
}

.importance-score {
  font-size: 12px;
  color: #909399;
}

.history-summary,
.recent-summary {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 8px;
}

.history-events {
  margin-top: 8px;
}

.events-label {
  font-size: 13px;
  color: #909399;
  margin-right: 8px;
}

.recent-details {
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid #e4e7ed;
}

.detail-row {
  display: flex;
  margin-bottom: 4px;
  font-size: 13px;
}

.detail-label {
  color: #909399;
  min-width: 40px;
  margin-right: 8px;
}

.detail-content {
  color: #606266;
  flex: 1;
}

.formatted-context {
  padding: 20px;
}

.format-actions {
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
}

.empty-content,
.empty-context {
  padding: 40px 20px;
  text-align: center;
}

.benefits-list {
  text-align: left;
  margin: 16px auto 0;
  max-width: 400px;
  color: #606266;
  font-size: 14px;
}

.benefits-list li {
  margin-bottom: 8px;
}

:deep(.el-tabs__content) {
  padding: 0;
}

:deep(.el-descriptions__body) {
  background: #fafafa;
}

:deep(.el-progress-bar__outer) {
  background-color: #f0f0f0;
}

:deep(.el-rate) {
  height: auto;
}

:deep(.el-rate__item) {
  margin-right: 2px;
}

:deep(.el-textarea__inner) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
}
</style>
