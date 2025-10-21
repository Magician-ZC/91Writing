# Phase 3 - 前端引导组件实现

**组件**: 用户引导系统  
**技术栈**: Vue3 + Element Plus Tour + Composables

---

## 🎨 核心组件

### 1. 欢迎向导

#### src/components/onboarding/WelcomeGuide.vue

```vue
<template>
  <el-dialog
    v-model="visible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    width="800px"
    class="welcome-guide-dialog"
  >
    <div class="welcome-guide">
      <!-- 进度指示器 -->
      <el-steps :active="currentStep" finish-status="success" align-center>
        <el-step title="欢迎" icon="Promotion" />
        <el-step title="核心功能" icon="Reading" />
        <el-step title="AI助手" icon="MagicStick" />
        <el-step title="开始创作" icon="Edit" />
      </el-steps>

      <!-- 内容区 -->
      <div class="guide-content">
        <!-- 步骤 0: 欢迎 -->
        <div v-if="currentStep === 0" class="step-content">
          <div class="welcome-hero">
            <el-icon size="80" color="#409eff"><Promotion /></el-icon>
            <h1>欢迎来到 91写作！</h1>
            <p class="subtitle">专业的AI小说创作平台，让创作更简单、更高效</p>
          </div>

          <el-row :gutter="20" class="features-preview">
            <el-col :span="12">
              <div class="feature-card">
                <el-icon size="40" color="#67c23a"><Edit /></el-icon>
                <h3>智能写作</h3>
                <p>AI辅助续写、润色，提升创作效率</p>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="feature-card">
                <el-icon size="40" color="#e6a23c"><Files /></el-icon>
                <h3>完整工具链</h3>
                <p>大纲、角色、世界观一站式管理</p>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 步骤 1: 核心功能 -->
        <div v-if="currentStep === 1" class="step-content">
          <h2>核心功能介绍</h2>
          
          <el-timeline>
            <el-timeline-item 
              v-for="feature in coreFeatures"
              :key="feature.id"
              :icon="feature.icon"
              :type="feature.type"
            >
              <div class="timeline-content">
                <h4>{{ feature.title }}</h4>
                <p>{{ feature.description }}</p>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>

        <!-- 步骤 2: AI助手 -->
        <div v-if="currentStep === 2" class="step-content">
          <h2>AI功能一览</h2>
          
          <el-row :gutter="20">
            <el-col :span="8" v-for="ai in aiFeatures" :key="ai.id">
              <el-card class="ai-feature-card" shadow="hover">
                <template #header>
                  <div class="card-header">
                    <span>{{ ai.icon }} {{ ai.title }}</span>
                  </div>
                </template>
                <p>{{ ai.description }}</p>
                <el-tag type="success" size="small">{{ ai.badge }}</el-tag>
              </el-card>
            </el-col>
          </el-row>

          <el-alert
            type="info"
            :closable="false"
            class="mt-3"
          >
            <template #title>
              💡 提示：使用AI功能需要先配置API密钥
            </template>
          </el-alert>
        </div>

        <!-- 步骤 3: 开始创作 -->
        <div v-if="currentStep === 3" class="step-content">
          <div class="start-creating">
            <el-icon size="80" color="#67c23a"><SuccessFilled /></el-icon>
            <h2>准备就绪！</h2>
            <p>现在你可以开始创作了</p>

            <div class="quick-actions">
              <el-button type="primary" size="large" @click="createFirstNovel">
                <el-icon><Plus /></el-icon>
                创建第一部小说
              </el-button>
              <el-button size="large" @click="exploreFeatures">
                <el-icon><Compass /></el-icon>
                探索更多功能
              </el-button>
            </div>

            <el-checkbox v-model="dontShowAgain" class="mt-3">
              不再显示此引导
            </el-checkbox>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="guide-footer">
        <el-button @click="handleSkip" text>
          跳过引导
        </el-button>

        <div class="navigation-buttons">
          <el-button
            v-if="currentStep > 0"
            @click="prevStep"
          >
            上一步
          </el-button>
          <el-button
            v-if="currentStep < 3"
            type="primary"
            @click="nextStep"
          >
            下一步
          </el-button>
          <el-button
            v-if="currentStep === 3"
            type="success"
            @click="finish"
          >
            开始创作
          </el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Promotion, Reading, MagicStick, Edit, Files,
  SuccessFilled, Plus, Compass
} from '@element-plus/icons-vue'
import onboardingService from '@/services/onboardingService'

const router = useRouter()
const visible = ref(false)
const currentStep = ref(0)
const dontShowAgain = ref(false)

// 核心功能列表
const coreFeatures = [
  {
    id: 1,
    icon: 'Edit',
    type: 'primary',
    title: '小说管理',
    description: '创建项目、管理章节、设置元数据'
  },
  {
    id: 2,
    icon: 'User',
    type: 'success',
    title: '角色管理',
    description: '角色设定、关系网络、一致性检测'
  },
  {
    id: 3,
    icon: 'Coordinate',
    type: 'warning',
    title: '世界观构建',
    description: '世界设定、规则管理、一致性验证'
  },
  {
    id: 4,
    icon: 'MagicStick',
    type: 'danger',
    title: 'AI辅助',
    description: 'AI续写、润色、多版本生成'
  }
]

// AI功能列表
const aiFeatures = [
  {
    id: 1,
    icon: '✍️',
    title: 'AI续写',
    description: '根据上文智能续写，保持风格一致',
    badge: '最常用'
  },
  {
    id: 2,
    icon: '✨',
    title: 'AI润色',
    description: '优化文字表达，提升内容质量',
    badge: '质量提升'
  },
  {
    id: 3,
    icon: '🎨',
    title: '多版本对比',
    description: '生成多个版本供选择',
    badge: '新功能'
  },
  {
    id: 4,
    icon: '🔍',
    title: '一致性检测',
    description: '智能检测世界观和角色一致性',
    badge: '专业版'
  },
  {
    id: 5,
    icon: '🌐',
    title: '世界观生成',
    description: 'AI生成完整的世界观设定',
    badge: '强大'
  },
  {
    id: 6,
    icon: '📊',
    title: '拆书分析',
    description: '学习优秀作品的写作技巧',
    badge: '学习'
  }
]

// 方法
const open = () => {
  visible.value = true
  currentStep.value = 0
}

const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const handleSkip = async () => {
  try {
    await onboardingService.skip()
    visible.value = false
    ElMessage.info('已跳过引导')
  } catch (error) {
    visible.value = false
  }
}

const finish = async () => {
  try {
    await onboardingService.updateProgress({
      welcomeCompleted: true,
      completedTours: ['welcome']
    })

    visible.value = false
    ElMessage.success('欢迎引导完成！')

    if (dontShowAgain.value) {
      localStorage.setItem('onboarding-completed', 'true')
    }
  } catch (error) {
    console.error('更新引导状态失败:', error)
  }
}

const createFirstNovel = () => {
  finish()
  router.push('/novels/create')
}

const exploreFeatures = () => {
  finish()
  router.push('/dashboard')
}

// 暴露方法
defineExpose({
  open
})
</script>

<style scoped>
.welcome-guide-dialog {
  border-radius: 12px;
}

.welcome-guide {
  padding: 20px;
}

.guide-content {
  min-height: 400px;
  margin: 40px 0;
}

.step-content {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.welcome-hero {
  text-align: center;
  padding: 40px 20px;
}

.welcome-hero h1 {
  font-size: 32px;
  margin: 20px 0 10px;
  color: #303133;
}

.subtitle {
  font-size: 16px;
  color: #606266;
}

.features-preview {
  margin-top: 40px;
}

.feature-card {
  text-align: center;
  padding: 30px 20px;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s;
}

.feature-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.feature-card h3 {
  margin: 16px 0 8px;
  color: #303133;
}

.feature-card p {
  color: #606266;
  font-size: 14px;
}

.timeline-content h4 {
  margin: 0 0 8px;
  color: #303133;
}

.timeline-content p {
  color: #606266;
  margin: 0;
}

.ai-feature-card {
  text-align: center;
  margin-bottom: 16px;
}

.card-header {
  font-weight: 600;
}

.start-creating {
  text-align: center;
  padding: 40px 20px;
}

.start-creating h2 {
  margin: 20px 0 10px;
  color: #303133;
}

.quick-actions {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.guide-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.navigation-buttons {
  display: flex;
  gap: 12px;
}

.mt-3 {
  margin-top: 16px;
}
</style>
```

---

### 2. 功能引导气泡

#### src/components/onboarding/FeatureTour.vue

```vue
<template>
  <div class="feature-tour">
    <!-- 使用 teleport 确保遮罩层在最上层 -->
    <teleport to="body">
      <div v-if="isActive" class="tour-overlay" @click="handleOverlayClick">
        <!-- 高亮区域 -->
        <div 
          class="highlight-box"
          :style="highlightStyle"
        ></div>

        <!-- 提示气泡 -->
        <div
          class="tour-popover"
          :style="popoverStyle"
        >
          <div class="popover-header">
            <span class="step-indicator">{{ currentStepIndex + 1 }} / {{ steps.length }}</span>
            <el-button
              type="text"
              :icon="Close"
              @click="closeTour"
            />
          </div>

          <div class="popover-content">
            <h3>{{ currentStep.title }}</h3>
            <p>{{ currentStep.content }}</p>
          </div>

          <div class="popover-footer">
            <el-button
              v-if="currentStepIndex > 0"
              size="small"
              @click="prevStep"
            >
              上一步
            </el-button>

            <el-button
              v-if="currentStepIndex < steps.length - 1"
              type="primary"
              size="small"
              @click="nextStep"
            >
              下一步
            </el-button>

            <el-button
              v-else
              type="success"
              size="small"
              @click="finishTour"
            >
              完成
            </el-button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { Close } from '@element-plus/icons-vue'
import onboardingService from '@/services/onboardingService'

const props = defineProps({
  steps: {
    type: Array,
    required: true
  },
  tourId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['finish', 'close'])

const isActive = ref(false)
const currentStepIndex = ref(0)
const highlightRect = ref(null)

const currentStep = computed(() => props.steps[currentStepIndex.value])

const highlightStyle = computed(() => {
  if (!highlightRect.value) return {}
  
  return {
    position: 'fixed',
    left: `${highlightRect.value.left - 8}px`,
    top: `${highlightRect.value.top - 8}px`,
    width: `${highlightRect.value.width + 16}px`,
    height: `${highlightRect.value.height + 16}px`,
    borderRadius: '8px',
    boxShadow: '0 0 0 2000px rgba(0, 0, 0, 0.5)',
    border: '2px solid #409eff',
    pointerEvents: 'none',
    zIndex: 9998,
  }
})

const popoverStyle = computed(() => {
  if (!highlightRect.value) return {}

  const placement = currentStep.value.placement || 'bottom'
  let left = 0
  let top = 0

  switch (placement) {
    case 'top':
      left = highlightRect.value.left
      top = highlightRect.value.top - 200
      break
    case 'bottom':
      left = highlightRect.value.left
      top = highlightRect.value.bottom + 16
      break
    case 'left':
      left = highlightRect.value.left - 320
      top = highlightRect.value.top
      break
    case 'right':
      left = highlightRect.value.right + 16
      top = highlightRect.value.top
      break
  }

  return {
    position: 'fixed',
    left: `${left}px`,
    top: `${top}px`,
    zIndex: 9999,
  }
})

const start = async () => {
  isActive.value = true
  currentStepIndex.value = 0
  await nextTick()
  updateHighlight()
}

const nextStep = async () => {
  if (currentStepIndex.value < props.steps.length - 1) {
    currentStepIndex.value++
    await nextTick()
    updateHighlight()
  }
}

const prevStep = async () => {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--
    await nextTick()
    updateHighlight()
  }
}

const closeTour = () => {
  isActive.value = false
  emit('close')
}

const finishTour = async () => {
  try {
    await onboardingService.updateProgress({
      completedTours: [props.tourId]
    })
  } catch (error) {
    console.error('更新引导状态失败:', error)
  }

  isActive.value = false
  emit('finish')
}

const handleOverlayClick = (e) => {
  // 点击遮罩层不关闭，必须点击按钮
  e.stopPropagation()
}

const updateHighlight = () => {
  const target = document.querySelector(currentStep.value.target)
  if (target) {
    highlightRect.value = target.getBoundingClientRect()
  }
}

// 监听窗口大小变化
const handleResize = () => {
  if (isActive.value) {
    updateHighlight()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

defineExpose({
  start
})
</script>

<style scoped>
.tour-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9997;
}

.highlight-box {
  transition: all 0.3s ease;
}

.tour-popover {
  width: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 0;
  transition: all 0.3s ease;
}

.popover-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
}

.step-indicator {
  font-size: 12px;
  color: #909399;
  font-weight: 600;
}

.popover-content {
  padding: 20px 16px;
}

.popover-content h3 {
  margin: 0 0 12px;
  font-size: 16px;
  color: #303133;
}

.popover-content p {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.popover-footer {
  padding: 12px 16px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
```

---

### 3. 上下文帮助组件

#### src/components/onboarding/HelpButton.vue

```vue
<template>
  <div class="help-button-wrapper">
    <el-popover
      placement="bottom-end"
      :width="300"
      trigger="click"
      v-model:visible="popoverVisible"
    >
      <template #reference>
        <el-button circle size="small" class="help-btn">
          <el-icon><QuestionFilled /></el-icon>
        </el-button>
      </template>

      <div class="help-content">
        <h4>{{ helpConfig.title }}</h4>
        <p>{{ helpConfig.description }}</p>

        <el-divider />

        <!-- 快速链接 -->
        <div class="quick-links">
          <el-link
            v-for="link in helpConfig.links"
            :key="link.id"
            :icon="link.icon"
            @click="handleLinkClick(link)"
          >
            {{ link.label }}
          </el-link>
        </div>

        <!-- 视频教程 -->
        <div v-if="helpConfig.videoUrl" class="video-section">
          <el-divider />
          <el-button
            type="primary"
            size="small"
            @click="openVideo"
            block
          >
            <el-icon><VideoPlay /></el-icon>
            观看视频教程
          </el-button>
        </div>

        <!-- 反馈 -->
        <el-divider />
        <div class="feedback-section">
          <el-text size="small">这些内容有帮助吗？</el-text>
          <div class="feedback-buttons">
            <el-button
              size="small"
              @click="submitFeedback(true)"
            >
              👍 有帮助
            </el-button>
            <el-button
              size="small"
              @click="submitFeedback(false)"
            >
              👎 没帮助
            </el-button>
          </div>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { QuestionFilled, VideoPlay } from '@element-plus/icons-vue'
import onboardingService from '@/services/onboardingService'

const props = defineProps({
  helpConfig: {
    type: Object,
    required: true
  },
  pageId: {
    type: String,
    required: true
  }
})

const popoverVisible = ref(false)

const handleLinkClick = (link) => {
  if (link.action) {
    link.action()
  }
  popoverVisible.value = false
}

const openVideo = () => {
  if (props.helpConfig.videoUrl) {
    window.open(props.helpConfig.videoUrl, '_blank')
  }
  popoverVisible.value = false
}

const submitFeedback = async (isHelpful) => {
  try {
    await onboardingService.submitFeedback(
      'tooltip',
      props.pageId,
      isHelpful,
      null
    )
    ElMessage.success('感谢你的反馈！')
    popoverVisible.value = false
  } catch (error) {
    console.error('提交反馈失败:', error)
  }
}
</script>

<style scoped>
.help-btn {
  position: fixed;
  right: 24px;
  top: 80px;
  z-index: 1000;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.help-content h4 {
  margin: 0 0 12px;
  font-size: 16px;
  color: #303133;
}

.help-content p {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.quick-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feedback-section {
  text-align: center;
}

.feedback-buttons {
  margin-top: 12px;
  display: flex;
  justify-content: center;
  gap: 12px;
}
</style>
```

---

### 4. 新功能提示徽章

#### src/components/onboarding/NewFeatureBadge.vue

```vue
<template>
  <el-badge
    v-if="isNew"
    value="新"
    type="danger"
    class="new-feature-badge"
  >
    <slot></slot>
  </el-badge>
  <slot v-else></slot>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  featureName: {
    type: String,
    required: true
  },
  introducedDate: {
    type: String,
    required: true
  }
})

const isNew = ref(false)

onMounted(() => {
  const introduced = new Date(props.introducedDate)
  const now = new Date()
  const daysDiff = (now - introduced) / (1000 * 60 * 60 * 24)

  // 30天内的功能显示"新"徽章
  isNew.value = daysDiff <= 30

  // 检查用户是否已使用过此功能
  const used = localStorage.getItem(`feature-used-${props.featureName}`)
  if (used) {
    isNew.value = false
  }
})

const markAsUsed = () => {
  localStorage.setItem(`feature-used-${props.featureName}`, 'true')
  isNew.value = false
}

defineExpose({
  markAsUsed
})
</script>

<style scoped>
.new-feature-badge {
  position: relative;
}
</style>
```

---

## 🔗 集成到应用

### src/App.vue (修改)

```vue
<template>
  <div id="app">
    <router-view />

    <!-- 欢迎向导（首次登录显示） -->
    <WelcomeGuide ref="welcomeGuide" />

    <!-- 功能引导 -->
    <FeatureTour ref="featureTour" :steps="currentTourSteps" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import WelcomeGuide from '@/components/onboarding/WelcomeGuide.vue'
import FeatureTour from '@/components/onboarding/FeatureTour.vue'
import onboardingService from '@/services/onboardingService'
import { onboardingSteps } from '@/config/onboarding'

const route = useRoute()
const authStore = useAuthStore()

const welcomeGuide = ref(null)
const featureTour = ref(null)
const currentTourSteps = ref([])

// 检查是否需要显示引导
const checkOnboarding = async () => {
  if (!authStore.isLoggedIn) return

  try {
    const response = await onboardingService.getStatus()
    const status = response.data

    // 新用户显示欢迎向导
    if (status.isNewUser && !status.welcomeCompleted) {
      setTimeout(() => {
        welcomeGuide.value?.open()
      }, 1000)
    }

    // 根据页面显示功能引导
    checkPageTour(status)
  } catch (error) {
    console.error('检查引导状态失败:', error)
  }
}

// 检查页面引导
const checkPageTour = (status) => {
  const routeName = route.name

  if (routeName === 'Writer' && !status.editorTourCompleted) {
    currentTourSteps.value = onboardingSteps.editor
    setTimeout(() => {
      featureTour.value?.start()
    }, 2000)
  }
}

// 监听路由变化
watch(() => route.name, () => {
  if (authStore.isLoggedIn) {
    checkOnboarding()
  }
})

// 监听登录状态
watch(() => authStore.isLoggedIn, (isLoggedIn) => {
  if (isLoggedIn) {
    checkOnboarding()
  }
})

onMounted(() => {
  checkOnboarding()
})
</script>
```

---

## 📋 使用示例

### 在页面中添加帮助按钮

```vue
<template>
  <div class="page-container">
    <!-- 页面内容 -->
    
    <!-- 添加帮助按钮 -->
    <HelpButton
      :help-config="pageHelpConfig"
      :page-id="'novel-management'"
    />
  </div>
</template>

<script setup>
import HelpButton from '@/components/onboarding/HelpButton.vue'

const pageHelpConfig = {
  title: '小说管理',
  description: '在这里可以创建和管理你的所有小说项目',
  links: [
    {
      id: 1,
      label: '如何创建小说？',
      icon: 'Document',
      action: () => showCreateGuide()
    },
    {
      id: 2,
      label: '如何导入导出？',
      icon: 'Download',
      action: () => showImportGuide()
    }
  ],
  videoUrl: 'https://example.com/tutorial'
}
</script>
```

### 在按钮上添加新功能徽章

```vue
<template>
  <NewFeatureBadge
    feature-name="multi-version"
    introduced-date="2025-10-01"
  >
    <el-button @click="openMultiVersion">
      多版本对比
    </el-button>
  </NewFeatureBadge>
</template>

<script setup>
import NewFeatureBadge from '@/components/onboarding/NewFeatureBadge.vue'
</script>
```

---

## 📋 接口规范检查

### ✅ 已遵循

- [x] Controller 使用 `@Controller()` 不带前缀
- [x] 所有接口添加 `@UseGuards(JwtAuthGuard)`
- [x] 所有接口添加 `@ApiBearerAuth('JWT-auth')`
- [x] DTO 完整验证装饰器
- [x] POST非创建添加 `@HttpCode(HttpStatus.OK)`
- [x] 完整 Swagger 文档

---

**状态**: ✅ 用户引导系统完成  
**下一步**: 部署简化方案

