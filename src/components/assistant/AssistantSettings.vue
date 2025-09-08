<template>
  <div class="assistant-settings">
    <div class="settings-header">
      <h3>
        <el-icon><Setting /></el-icon>
        AI助手设置
      </h3>
      <p>个性化您的AI写作助手体验</p>
    </div>

    <el-form :model="settings" label-width="120px" class="settings-form">
      <!-- 基础设置 -->
      <div class="settings-section">
        <h4 class="section-title">基础设置</h4>
        
        <el-form-item label="助手个性">
          <el-select v-model="settings.personality" @change="onPersonalityChange">
            <el-option
              v-for="personality in personalityOptions"
              :key="personality.value"
              :label="personality.label"
              :value="personality.value"
            >
              <div class="personality-option">
                <span class="personality-icon">{{ personality.icon }}</span>
                <div class="personality-info">
                  <div class="personality-name">{{ personality.label }}</div>
                  <div class="personality-desc">{{ personality.description }}</div>
                </div>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="响应速度">
          <el-radio-group v-model="settings.responseSpeed">
            <el-radio value="fast">快速响应</el-radio>
            <el-radio value="balanced">平衡模式</el-radio>
            <el-radio value="thoughtful">深度思考</el-radio>
          </el-radio-group>
          <div class="form-item-tip">
            深度思考模式会提供更详细的分析，但响应时间较长
          </div>
        </el-form-item>

        <el-form-item label="自动显示">
          <el-switch 
            v-model="settings.autoShow"
            active-text="自动显示助手"
            inactive-text="手动唤起"
          />
          <div class="form-item-tip">
            开启后，助手会在检测到写作活动时自动显示
          </div>
        </el-form-item>
      </div>

      <!-- 写作偏好 -->
      <div class="settings-section">
        <h4 class="section-title">写作偏好</h4>
        
        <el-form-item label="写作风格">
          <el-select v-model="settings.writingStyle">
            <el-option label="严肃正式" value="formal" />
            <el-option label="轻松随意" value="casual" />
            <el-option label="文艺优雅" value="elegant" />
            <el-option label="生动活泼" value="vivid" />
            <el-option label="平衡中性" value="balanced" />
          </el-select>
        </el-form-item>

        <el-form-item label="创意程度">
          <el-slider
            v-model="settings.creativityLevel"
            :min="1"
            :max="10"
            show-input
            :marks="creativityMarks"
          />
          <div class="form-item-tip">
            数值越高，AI生成的内容越富有创意和想象力
          </div>
        </el-form-item>

        <el-form-item label="详细程度">
          <el-slider
            v-model="settings.detailLevel"
            :min="1"
            :max="10"
            show-input
            :marks="detailMarks"
          />
          <div class="form-item-tip">
            控制AI回复的详细程度和深度
          </div>
        </el-form-item>

        <el-form-item label="目标读者">
          <el-select v-model="settings.targetAudience">
            <el-option label="青少年读者" value="young" />
            <el-option label="成年读者" value="adult" />
            <el-option label="资深读者" value="experienced" />
            <el-option label="专业作者" value="professional" />
            <el-option label="通用读者" value="general" />
          </el-select>
        </el-form-item>
      </div>

      <!-- 功能开关 -->
      <div class="settings-section">
        <h4 class="section-title">功能开关</h4>
        
        <el-form-item label="智能提醒">
          <el-switch 
            v-model="settings.smartReminders"
            active-text="开启"
            inactive-text="关闭"
          />
          <div class="form-item-tip">
            AI会根据您的写作习惯提供智能提醒
          </div>
        </el-form-item>

        <el-form-item label="实时建议">
          <el-switch 
            v-model="settings.realtimeSuggestions"
            active-text="开启"
            inactive-text="关闭"
          />
          <div class="form-item-tip">
            在您写作时实时提供改进建议
          </div>
        </el-form-item>

        <el-form-item label="快速操作">
          <el-switch 
            v-model="settings.quickActions"
            active-text="显示"
            inactive-text="隐藏"
          />
          <div class="form-item-tip">
            显示快速操作悬浮按钮
          </div>
        </el-form-item>

        <el-form-item label="上下文记忆">
          <el-switch 
            v-model="settings.contextMemory"
            active-text="开启"
            inactive-text="关闭"
          />
          <div class="form-item-tip">
            AI会记住对话上下文，提供更连贯的帮助
          </div>
        </el-form-item>

        <el-form-item label="学习用户习惯">
          <el-switch 
            v-model="settings.learningMode"
            active-text="开启"
            inactive-text="关闭"
          />
          <div class="form-item-tip">
            AI会学习您的写作习惯，提供个性化建议
          </div>
        </el-form-item>
      </div>

      <!-- 通知设置 -->
      <div class="settings-section">
        <h4 class="section-title">通知设置</h4>
        
        <el-form-item label="写作提醒">
          <el-checkbox-group v-model="settings.notifications.writing">
            <el-checkbox value="daily_goal">每日目标提醒</el-checkbox>
            <el-checkbox value="inactivity">长时间未写作提醒</el-checkbox>
            <el-checkbox value="quality_check">内容质量检查提醒</el-checkbox>
            <el-checkbox value="progress_milestone">进度里程碑通知</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="提醒时段">
          <el-time-picker
            v-model="settings.notifications.timeRange"
            is-range
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="HH:mm"
            value-format="HH:mm"
          />
          <div class="form-item-tip">
            只在此时间段内发送提醒通知
          </div>
        </el-form-item>

        <el-form-item label="通知频率">
          <el-select v-model="settings.notifications.frequency">
            <el-option label="高频率（积极提醒）" value="high" />
            <el-option label="中频率（适度提醒）" value="medium" />
            <el-option label="低频率（仅重要提醒）" value="low" />
            <el-option label="关闭所有通知" value="none" />
          </el-select>
        </el-form-item>
      </div>

      <!-- 数据和隐私 -->
      <div class="settings-section">
        <h4 class="section-title">数据和隐私</h4>
        
        <el-form-item label="对话历史">
          <div class="data-item">
            <span>保存最近 {{ settings.dataRetention.conversationHistory }} 条对话记录</span>
            <el-button size="small" @click="clearConversationHistory">清空历史</el-button>
          </div>
        </el-form-item>

        <el-form-item label="使用统计">
          <el-switch 
            v-model="settings.dataRetention.usageStats"
            active-text="允许收集"
            inactive-text="不收集"
          />
          <div class="form-item-tip">
            收集使用统计有助于改进AI助手的性能
          </div>
        </el-form-item>

        <el-form-item label="数据导出">
          <div class="data-actions">
            <el-button @click="exportSettings">导出设置</el-button>
            <el-button @click="importSettings">导入设置</el-button>
            <el-button type="danger" @click="resetToDefault">恢复默认</el-button>
          </div>
        </el-form-item>
      </div>
    </el-form>

    <!-- 操作按钮 -->
    <div class="settings-actions">
      <el-button type="primary" @click="saveSettings">保存设置</el-button>
      <el-button @click="resetSettings">重置</el-button>
      <el-button @click="testAssistant">测试助手</el-button>
    </div>

    <!-- 导入文件对话框 -->
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      style="display: none"
      @change="handleFileImport"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Setting } from '@element-plus/icons-vue'
import aiWritingAssistant from '@/services/aiWritingAssistant.js'

// Emits
const emit = defineEmits(['settings-changed', 'test-assistant'])

// 响应式数据
const fileInput = ref(null)
const settings = reactive({
  personality: 'professional',
  responseSpeed: 'balanced',
  autoShow: false,
  writingStyle: 'balanced',
  creativityLevel: 7,
  detailLevel: 6,
  targetAudience: 'general',
  smartReminders: true,
  realtimeSuggestions: true,
  quickActions: true,
  contextMemory: true,
  learningMode: true,
  notifications: {
    writing: ['daily_goal', 'quality_check'],
    timeRange: ['09:00', '22:00'],
    frequency: 'medium'
  },
  dataRetention: {
    conversationHistory: 100,
    usageStats: true
  }
})

// 选项配置
const personalityOptions = ref([
  {
    value: 'professional',
    label: '专业助手',
    icon: '👔',
    description: '严谨专业，提供精准的写作指导'
  },
  {
    value: 'creative',
    label: '创意伙伴',
    icon: '🎨',
    description: '富有想象力，激发创作灵感'
  },
  {
    value: 'analytical',
    label: '分析专家',
    icon: '🔍',
    description: '逻辑严密，深度分析文本'
  },
  {
    value: 'friendly',
    label: '友好导师',
    icon: '😊',
    description: '温和耐心，循循善诱'
  }
])

const creativityMarks = {
  1: '保守',
  5: '平衡',
  10: '创新'
}

const detailMarks = {
  1: '简洁',
  5: '适中',
  10: '详尽'
}

// 生命周期
onMounted(() => {
  loadSettings()
})

// 监听设置变化
watch(settings, (newSettings) => {
  emit('settings-changed', newSettings)
}, { deep: true })

// 方法
const loadSettings = () => {
  try {
    const saved = localStorage.getItem('assistantSettings')
    if (saved) {
      const savedSettings = JSON.parse(saved)
      Object.assign(settings, savedSettings)
    }
  } catch (error) {
    console.error('加载设置失败:', error)
    ElMessage.error('加载设置失败')
  }
}

const saveSettings = () => {
  try {
    localStorage.setItem('assistantSettings', JSON.stringify(settings))
    
    // 更新AI助手的设置
    updateAssistantSettings()
    
    ElMessage.success('设置已保存')
  } catch (error) {
    console.error('保存设置失败:', error)
    ElMessage.error('保存设置失败')
  }
}

const resetSettings = () => {
  ElMessageBox.confirm(
    '确定要重置所有设置吗？这将恢复到默认配置。',
    '重置设置',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    resetToDefault()
  })
}

const resetToDefault = () => {
  const defaultSettings = {
    personality: 'professional',
    responseSpeed: 'balanced',
    autoShow: false,
    writingStyle: 'balanced',
    creativityLevel: 7,
    detailLevel: 6,
    targetAudience: 'general',
    smartReminders: true,
    realtimeSuggestions: true,
    quickActions: true,
    contextMemory: true,
    learningMode: true,
    notifications: {
      writing: ['daily_goal', 'quality_check'],
      timeRange: ['09:00', '22:00'],
      frequency: 'medium'
    },
    dataRetention: {
      conversationHistory: 100,
      usageStats: true
    }
  }
  
  Object.assign(settings, defaultSettings)
  saveSettings()
  ElMessage.success('已恢复默认设置')
}

const updateAssistantSettings = () => {
  // 更新AI助手的配置
  aiWritingAssistant.assistantPersonality = settings.personality
  
  // 可以添加更多设置的应用逻辑
}

const onPersonalityChange = (personality) => {
  const selectedPersonality = personalityOptions.value.find(p => p.value === personality)
  if (selectedPersonality) {
    ElMessage.success(`已切换到${selectedPersonality.label}模式`)
  }
}

const clearConversationHistory = () => {
  ElMessageBox.confirm(
    '确定要清空所有对话历史吗？此操作不可恢复。',
    '清空历史',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    aiWritingAssistant.conversationHistory = []
    aiWritingAssistant.saveAssistantData()
    ElMessage.success('对话历史已清空')
  })
}

const exportSettings = () => {
  try {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    
    const link = document.createElement('a')
    link.href = URL.createObjectURL(dataBlob)
    link.download = `ai-assistant-settings-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    ElMessage.success('设置已导出')
  } catch (error) {
    console.error('导出设置失败:', error)
    ElMessage.error('导出失败')
  }
}

const importSettings = () => {
  fileInput.value?.click()
}

const handleFileImport = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const importedSettings = JSON.parse(e.target.result)
      
      ElMessageBox.confirm(
        '确定要导入这些设置吗？当前设置将被覆盖。',
        '导入设置',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        Object.assign(settings, importedSettings)
        saveSettings()
        ElMessage.success('设置已导入')
      })
    } catch (error) {
      console.error('导入设置失败:', error)
      ElMessage.error('文件格式错误')
    }
  }
  
  reader.readAsText(file)
  
  // 清空input值，允许重复选择同一文件
  event.target.value = ''
}

const testAssistant = () => {
  emit('test-assistant', settings)
  ElMessage.info('正在测试AI助手...')
}
</script>

<style scoped>
.assistant-settings {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.settings-header {
  text-align: center;
  margin-bottom: 32px;
}

.settings-header h3 {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 24px;
}

.settings-header p {
  color: #7f8c8d;
  margin: 0;
}

.settings-form {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.settings-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e4e7ed;
}

.settings-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 20px 0;
  color: #409eff;
  font-size: 16px;
  font-weight: 600;
}

.personality-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.personality-icon {
  font-size: 20px;
}

.personality-info {
  flex: 1;
}

.personality-name {
  font-weight: 500;
  color: #2c3e50;
}

.personality-desc {
  font-size: 12px;
  color: #7f8c8d;
  margin-top: 2px;
}

.form-item-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
  line-height: 1.4;
}

.data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}

.data-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.settings-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
}

/* 自定义滑块样式 */
.settings-form :deep(.el-slider) {
  margin: 20px 0;
}

.settings-form :deep(.el-slider__marks-text) {
  font-size: 12px;
  color: #909399;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .assistant-settings {
    padding: 16px 12px;
  }
  
  .settings-form {
    padding: 20px 16px;
  }
  
  .settings-form :deep(.el-form-item__label) {
    width: 100px !important;
    font-size: 14px;
  }
  
  .personality-option {
    gap: 8px;
  }
  
  .personality-icon {
    font-size: 18px;
  }
  
  .personality-name {
    font-size: 14px;
  }
  
  .personality-desc {
    font-size: 11px;
  }
  
  .data-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .data-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .settings-actions {
    flex-direction: column;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .settings-form {
    background: #2c3e50;
    color: white;
  }
  
  .section-title {
    color: #66b3ff;
  }
  
  .personality-name {
    color: white;
  }
  
  .form-item-tip {
    color: #bdc3c7;
  }
}
</style>
