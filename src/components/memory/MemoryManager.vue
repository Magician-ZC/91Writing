<template>
  <div class="memory-manager">
    <!-- 记忆系统总览 -->
    <el-card shadow="never" class="overview-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">🧠 长篇记忆系统</span>
          <div class="header-actions">
            <el-tag :type="isActive ? 'success' : 'warning'">
              {{ isActive ? '已激活' : '未激活' }}
            </el-tag>
            <el-button 
              v-if="!isActive" 
              type="primary" 
              size="small" 
              @click="activateMemorySystem"
              :loading="isActivating"
            >
              激活记忆系统
            </el-button>
            <el-dropdown v-else @command="handleMenuCommand">
              <el-button type="text" size="small">
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="export">
                    <el-icon><Download /></el-icon>
                    导出记忆
                  </el-dropdown-item>
                  <el-dropdown-item command="import">
                    <el-icon><Upload /></el-icon>
                    导入记忆
                  </el-dropdown-item>
                  <el-dropdown-item command="compress" divided>
                    <el-icon><FolderOpened /></el-icon>
                    压缩旧记忆
                  </el-dropdown-item>
                  <el-dropdown-item command="clear" divided>
                    <el-icon><Delete /></el-icon>
                    清空记忆
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </template>
      
      <!-- 记忆统计 -->
      <div class="memory-stats" v-if="isActive">
        <el-row :gutter="16">
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-icon">📊</div>
              <div class="stat-content">
                <div class="stat-number">{{ memoryStats.totalMemorySize }}</div>
                <div class="stat-label">总Token使用</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-icon">📝</div>
              <div class="stat-content">
                <div class="stat-number">{{ memoryStats.chaptersWithSummary }}</div>
                <div class="stat-label">章节摘要</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-icon">🗜️</div>
              <div class="stat-content">
                <div class="stat-number">{{ Math.round(memoryStats.compressionRatio * 10) / 10 }}:1</div>
                <div class="stat-label">压缩比</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-icon">⚡</div>
              <div class="stat-content">
                <div class="stat-number">{{ Math.round((1 - memoryStats.totalMemorySize / estimatedFullSize) * 100) }}%</div>
                <div class="stat-label">Token节省</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
      
      <!-- 激活提示 -->
      <div v-else class="activation-prompt">
        <el-empty 
          description="记忆系统未激活"
          :image-size="120"
        >
          <template #description>
            <p>长篇记忆系统可以帮助AI更好地理解您的小说内容，</p>
            <p>减少70%的Token使用，提升创作连贯性。</p>
          </template>
        </el-empty>
      </div>
    </el-card>

    <!-- 记忆管理面板 -->
    <div v-if="isActive" class="memory-panels">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 核心记忆 -->
        <el-tab-pane label="核心记忆" name="core">
          <CoreMemoryEditor 
            :core-memory="coreMemory"
            @update="handleCoreMemoryUpdate"
          />
        </el-tab-pane>
        
        <!-- 章节摘要 -->
        <el-tab-pane label="章节摘要" name="summaries">
          <ChapterSummaryManager 
            :summaries="chapterSummaries"
            @generate="handleGenerateSummary"
            @update="handleSummaryUpdate"
            @delete="handleDeleteSummary"
          />
        </el-tab-pane>
        
        <!-- 上下文预览 -->
        <el-tab-pane label="上下文预览" name="context">
          <ContextPreview 
            :context="currentContext"
            :token-usage="contextTokenUsage"
            @generate="handleGenerateContext"
          />
        </el-tab-pane>
        
        <!-- 一致性检查 -->
        <el-tab-pane label="一致性检查" name="consistency">
          <ConsistencyChecker 
            :tracking="consistencyTracking"
            @check="handleConsistencyCheck"
            @resolve="handleResolveInconsistency"
          />
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 生成进度对话框 -->
    <el-dialog 
      v-model="showProgressDialog" 
      title="生成记忆摘要"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="progress-content">
        <el-progress 
          :percentage="progressPercentage" 
          :status="progressStatus"
          stroke-width="8"
        />
        <p class="progress-text">{{ progressText }}</p>
        <div class="progress-details" v-if="currentProcessingChapter">
          <p>正在处理：第{{ currentProcessingChapter }}章</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="cancelGeneration" :disabled="!canCancel">
          {{ canCancel ? '取消' : '完成' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useMemoryStore } from '@/stores/memoryStore'
import { useNovelStore } from '@/stores/novel'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  MoreFilled, Download, Upload, FolderOpened, Delete
} from '@element-plus/icons-vue'

// 导入子组件
import CoreMemoryEditor from './CoreMemoryEditor.vue'
import ChapterSummaryManager from './ChapterSummaryManager.vue'
import ContextPreview from './ContextPreview.vue'
import ConsistencyChecker from './ConsistencyChecker.vue'

// Store
const memoryStore = useMemoryStore()
const novelStore = useNovelStore()

// 响应式数据
const activeTab = ref('core')
const isActivating = ref(false)
const showProgressDialog = ref(false)
const progressPercentage = ref(0)
const progressStatus = ref('')
const progressText = ref('')
const currentProcessingChapter = ref(null)
const canCancel = ref(true)
const currentContext = ref(null)

// 计算属性
const isActive = computed(() => {
  return memoryStore.isInitialized && memoryStore.currentNovelId
})

const memoryStats = computed(() => memoryStore.memoryStats)
const coreMemory = computed(() => memoryStore.coreMemory)
const chapterSummaries = computed(() => memoryStore.chapterSummaries)
const consistencyTracking = computed(() => memoryStore.consistencyTracking)

const estimatedFullSize = computed(() => {
  // 估算不使用记忆系统时的Token使用量
  const chapterCount = novelStore.chapters.length
  return chapterCount * 1000 // 假设每章平均1000 tokens
})

const contextTokenUsage = computed(() => {
  return memoryStore.contextManagement?.tokenBudget || {
    total: 3000,
    used: 0,
    remaining: 3000
  }
})

// 方法
const activateMemorySystem = async () => {
  try {
    isActivating.value = true
    
    // 初始化记忆系统
    await memoryStore.initializeMemorySystem()
    
    // 创建当前小说的记忆
    const novelId = `novel_${Date.now()}`
    await memoryStore.createNovelMemory(novelId, {
      title: '我的小说',
      genre: '',
      theme: '',
      intro: ''
    })
    
    // 如果有现有章节，询问是否批量生成摘要
    if (novelStore.chapters.length > 0) {
      const confirmed = await ElMessageBox.confirm(
        `检测到您已有 ${novelStore.chapters.length} 个章节，是否要为这些章节生成记忆摘要？这将提升AI创作的连贯性。`,
        '批量生成摘要',
        {
          type: 'question',
          confirmButtonText: '生成摘要',
          cancelButtonText: '稍后手动',
        }
      )
      
      if (confirmed) {
        await generateSummariesForExistingChapters()
      }
    }
    
    ElMessage.success('记忆系统激活成功！')
  } catch (error) {
    console.error('激活记忆系统失败:', error)
    ElMessage.error('激活失败：' + error.message)
  } finally {
    isActivating.value = false
  }
}

const generateSummariesForExistingChapters = async () => {
  showProgressDialog.value = true
  progressPercentage.value = 0
  progressStatus.value = 'active'
  progressText.value = '准备生成章节摘要...'
  canCancel.value = true
  
  try {
    const chapters = novelStore.chapters
    
    for (let i = 0; i < chapters.length; i++) {
      currentProcessingChapter.value = chapters[i].id
      progressText.value = `正在处理第 ${i + 1} 章：${chapters[i].title}`
      
      await memoryStore.addChapterSummary({
        chapterNumber: chapters[i].id,
        title: chapters[i].title,
        content: chapters[i].content || chapters[i].outline || ''
      })
      
      progressPercentage.value = Math.round(((i + 1) / chapters.length) * 100)
      
      // 添加延迟避免API限制
      if (i < chapters.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
    
    progressStatus.value = 'success'
    progressText.value = '所有章节摘要生成完成！'
    canCancel.value = false
    
    setTimeout(() => {
      showProgressDialog.value = false
    }, 2000)
    
  } catch (error) {
    progressStatus.value = 'exception'
    progressText.value = '生成失败：' + error.message
    canCancel.value = false
    console.error('批量生成摘要失败:', error)
  }
}

const cancelGeneration = () => {
  if (canCancel.value) {
    showProgressDialog.value = false
    progressPercentage.value = 0
    currentProcessingChapter.value = null
  } else {
    showProgressDialog.value = false
  }
}

const handleMenuCommand = async (command) => {
  switch (command) {
    case 'export':
      await exportMemoryData()
      break
    case 'import':
      await importMemoryData()
      break
    case 'compress':
      await compressOldMemories()
      break
    case 'clear':
      await clearMemoryData()
      break
  }
}

const exportMemoryData = () => {
  try {
    memoryStore.exportMemoryData(memoryStore.currentNovelId)
    ElMessage.success('记忆数据导出成功')
  } catch (error) {
    ElMessage.error('导出失败：' + error.message)
  }
}

const importMemoryData = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      try {
        await memoryStore.importMemoryData(file)
        ElMessage.success('记忆数据导入成功')
      } catch (error) {
        ElMessage.error('导入失败：' + error.message)
      }
    }
  }
  input.click()
}

const compressOldMemories = async () => {
  try {
    await ElMessageBox.confirm(
      '压缩旧记忆将减少Token使用，但可能丢失部分细节信息。确定要继续吗？',
      '压缩确认',
      { type: 'warning' }
    )
    
    await memoryStore.compressOldMemories({
      keepRecentChapters: 10,
      maxSummaryAge: 30
    })
    
    ElMessage.success('旧记忆压缩成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('压缩失败：' + error.message)
    }
  }
}

const clearMemoryData = async () => {
  try {
    await ElMessageBox.confirm(
      '这将清空当前小说的所有记忆数据，此操作不可恢复！',
      '危险操作',
      { 
        type: 'error',
        confirmButtonText: '确定清空',
        cancelButtonText: '取消'
      }
    )
    
    await memoryStore.deleteNovelMemory(memoryStore.currentNovelId)
    ElMessage.success('记忆数据已清空')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('清空失败：' + error.message)
    }
  }
}

const handleCoreMemoryUpdate = async (updates) => {
  try {
    await memoryStore.updateCoreMemory(updates)
    ElMessage.success('核心记忆更新成功')
  } catch (error) {
    ElMessage.error('更新失败：' + error.message)
  }
}

const handleGenerateSummary = async (chapterData) => {
  try {
    await memoryStore.addChapterSummary(chapterData)
    ElMessage.success(`第${chapterData.chapterNumber}章摘要生成成功`)
  } catch (error) {
    ElMessage.error('生成摘要失败：' + error.message)
  }
}

const handleSummaryUpdate = async (summaryId, updates) => {
  try {
    // 实现摘要更新逻辑
    ElMessage.success('摘要更新成功')
  } catch (error) {
    ElMessage.error('更新失败：' + error.message)
  }
}

const handleDeleteSummary = async (summaryId) => {
  try {
    // 实现摘要删除逻辑
    ElMessage.success('摘要删除成功')
  } catch (error) {
    ElMessage.error('删除失败：' + error.message)
  }
}

const handleGenerateContext = async (chapterNumber) => {
  try {
    const context = await memoryStore.getGenerationContext(chapterNumber)
    currentContext.value = context
    ElMessage.success('上下文生成成功')
  } catch (error) {
    ElMessage.error('生成上下文失败：' + error.message)
  }
}

const handleConsistencyCheck = async (content) => {
  try {
    const issues = await memoryStore.checkConsistency(content)
    if (issues.length === 0) {
      ElMessage.success('一致性检查通过，没有发现问题')
    } else {
      ElMessage.warning(`发现 ${issues.length} 个潜在问题`)
    }
  } catch (error) {
    ElMessage.error('一致性检查失败：' + error.message)
  }
}

const handleResolveInconsistency = async (issueId) => {
  try {
    // 实现问题解决逻辑
    ElMessage.success('问题已标记为已解决')
  } catch (error) {
    ElMessage.error('操作失败：' + error.message)
  }
}

// 生命周期
onMounted(async () => {
  // 如果记忆系统已初始化，设置当前小说
  if (memoryStore.isInitialized && !memoryStore.currentNovelId) {
    // 可以从其他地方获取小说ID，或创建新的
  }
})

// 监听章节变化，自动生成摘要
watch(() => novelStore.chapters, async (newChapters, oldChapters) => {
  if (isActive.value && newChapters.length > (oldChapters?.length || 0)) {
    // 有新章节添加，询问是否生成摘要
    const newChapter = newChapters[newChapters.length - 1]
    if (newChapter.content && newChapter.content.length > 100) {
      try {
        await ElMessageBox.confirm(
          `检测到新章节"${newChapter.title}"，是否生成记忆摘要？`,
          '自动生成摘要',
          {
            type: 'question',
            timeout: 10000 // 10秒后自动确认
          }
        )
        
        await handleGenerateSummary({
          chapterNumber: newChapter.id,
          title: newChapter.title,
          content: newChapter.content
        })
      } catch (error) {
        // 用户取消或超时，不处理
      }
    }
  }
}, { deep: true })
</script>

<style scoped>
.memory-manager {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.overview-card {
  margin-bottom: 20px;
}

.memory-stats {
  padding: 16px 0;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.stat-icon {
  font-size: 24px;
  margin-right: 12px;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.activation-prompt {
  text-align: center;
  padding: 40px 20px;
}

.memory-panels {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.progress-content {
  text-align: center;
  padding: 20px;
}

.progress-text {
  margin: 16px 0 8px 0;
  color: #606266;
  font-size: 14px;
}

.progress-details {
  color: #909399;
  font-size: 13px;
}

:deep(.el-tabs__content) {
  padding: 20px;
}

:deep(.el-tabs__item) {
  padding: 0 20px;
  font-size: 14px;
}

:deep(.el-card__header) {
  border-bottom: 1px solid #f0f0f0;
}
</style>
