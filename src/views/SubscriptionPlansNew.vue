<template>
  <div class="subscription-plans-new">
    <!-- 页面头部 -->
    <div class="header-section">
      <div class="container">
        <h1 class="main-title">选择适合您的创作套餐</h1>
        <p class="subtitle">解锁强大功能，开启AI智能创作之旅</p>
      </div>
    </div>

    <div class="container">
      <!-- 当前订阅状态 -->
      <div v-if="currentSubscription" class="current-subscription">
        <el-card class="status-card">
          <div class="status-header">
            <el-icon class="status-icon"><TrophyBase /></el-icon>
            <h3>当前套餐</h3>
          </div>
          <div class="status-content">
            <div class="status-info">
              <p class="package-name">{{ currentSubscription.package.name }}</p>
              <p class="price-info">¥{{ currentSubscription.package.price }} / 月</p>
              <p class="expire-info">
                <el-icon><Calendar /></el-icon>
                到期时间: {{ formatDate(currentSubscription.endDate) }}
                <el-tag v-if="daysLeft > 7" type="success" size="small" class="days-tag">
                  剩余 {{ daysLeft }} 天
                </el-tag>
                <el-tag v-else-if="daysLeft > 0" type="warning" size="small" class="days-tag">
                  剩余 {{ daysLeft }} 天
                </el-tag>
                <el-tag v-else type="danger" size="small" class="days-tag">
                  已过期
                </el-tag>
              </p>
            </div>
            <div class="status-actions">
              <el-button v-if="canRenew" type="primary" :icon="Refresh" @click="renewSubscription">
                续费
              </el-button>
              <el-button v-if="canCancel" type="warning" plain :icon="Close" @click="cancelSubscription">
                取消自动续费
              </el-button>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 套餐对比卡片 -->
      <div class="plans-section">
        <div class="plans-grid" v-loading="loading">
          <div
            v-for="pkg in packages"
            :key="pkg.id"
            class="plan-card"
            :class="{ 
              'recommended': isRecommended(pkg),
              'current': isCurrentPackage(pkg.id)
            }"
          >
            <!-- 推荐标签 -->
            <div v-if="isRecommended(pkg)" class="recommended-badge">
              <el-icon><Star /></el-icon>
              最受欢迎
            </div>

            <!-- 当前套餐标签 -->
            <div v-if="isCurrentPackage(pkg.id)" class="current-badge">
              <el-icon><Check /></el-icon>
              当前套餐
            </div>

            <!-- 套餐头部 -->
            <div class="plan-header">
              <h3 class="plan-name">{{ pkg.name }}</h3>
              <p class="plan-description">{{ pkg.description || getPackageDescription(pkg) }}</p>
            </div>

            <!-- 价格 -->
            <div class="plan-pricing">
              <div class="price-wrapper">
                <span class="currency">¥</span>
                <span class="price">{{ pkg.price }}</span>
                <span class="period">/ 月</span>
              </div>
              <p class="price-note" v-if="pkg.price > 0">
                {{ pkg.durationDays }}天有效期
              </p>
            </div>

            <!-- 功能列表 -->
            <div class="plan-features">
              <div class="features-title">
                <el-icon><List /></el-icon>
                套餐功能
              </div>

              <!-- 视频生成功能 -->
              <div class="feature-group" v-if="getFeatures(pkg).videoGeneration">
                <div class="feature-group-title">
                  <el-icon class="feature-icon video"><VideoCamera /></el-icon>
                  视频生成
                </div>
                <ul class="feature-list">
                  <li v-if="getFeatures(pkg).videoGeneration.enabled">
                    <el-icon class="check-icon"><Check /></el-icon>
                    <span class="feature-text">
                      每天 <strong>{{ formatQuota(getFeatures(pkg).videoGeneration.dailyQuota) }}</strong>个视频
                    </span>
                  </li>
                  <li v-else class="disabled-feature">
                    <el-icon class="close-icon"><Close /></el-icon>
                    <span class="feature-text">不包含视频生成</span>
                  </li>
                  
                  <li v-if="getFeatures(pkg).videoGeneration.enabled">
                    <el-icon class="check-icon"><Check /></el-icon>
                    <span class="feature-text">
                      最多 {{ getFeatures(pkg).videoGeneration.maxSceneCount }} 个分镜
                    </span>
                  </li>
                  
                  <li v-if="getFeatures(pkg).videoGeneration.enabled">
                    <el-icon class="check-icon"><Check /></el-icon>
                    <span class="feature-text">
                      {{ getQualityText(getFeatures(pkg).videoGeneration.allowedQualities) }}
                    </span>
                  </li>
                  
                  <li v-if="getFeatures(pkg).videoGeneration.enableAdvancedParams">
                    <el-icon class="check-icon"><Check /></el-icon>
                    <span class="feature-text highlight">高级参数自定义</span>
                  </li>
                </ul>
              </div>

              <!-- AI写作功能 -->
              <div class="feature-group" v-if="getFeatures(pkg).aiWriting">
                <div class="feature-group-title">
                  <el-icon class="feature-icon writing"><EditPen /></el-icon>
                  AI写作
                </div>
                <ul class="feature-list">
                  <li v-if="getFeatures(pkg).aiWriting.enabled">
                    <el-icon class="check-icon"><Check /></el-icon>
                    <span class="feature-text">
                      每天 <strong>{{ formatQuota(getFeatures(pkg).aiWriting.dailyQuota) }}</strong>次AI生成
                    </span>
                  </li>
                  
                  <li v-if="getFeatures(pkg).aiWriting.models && getFeatures(pkg).aiWriting.models.length">
                    <el-icon class="check-icon"><Check /></el-icon>
                    <span class="feature-text">
                      {{ getModelsText(getFeatures(pkg).aiWriting.models) }}
                    </span>
                  </li>
                  
                  <li v-if="getFeatures(pkg).aiWriting.maxWordsPerRequest">
                    <el-icon class="check-icon"><Check /></el-icon>
                    <span class="feature-text">
                      单次最多 {{ getFeatures(pkg).aiWriting.maxWordsPerRequest }} 字
                    </span>
                  </li>
                </ul>
              </div>

              <!-- AI助手功能 -->
              <div class="feature-group" v-if="getFeatures(pkg).aiAssistant">
                <div class="feature-group-title">
                  <el-icon class="feature-icon assistant"><ChatDotRound /></el-icon>
                  AI写作助手
                </div>
                <ul class="feature-list">
                  <li v-if="getFeatures(pkg).aiAssistant.enabled">
                    <el-icon class="check-icon"><Check /></el-icon>
                    <span class="feature-text">
                      每天 <strong>{{ formatQuota(getFeatures(pkg).aiAssistant.dailyQuota) }}</strong>次对话
                    </span>
                  </li>
                  
                  <li v-if="getFeatures(pkg).aiAssistant.maxConcurrentSessions">
                    <el-icon class="check-icon"><Check /></el-icon>
                    <span class="feature-text">
                      同时 {{ getFeatures(pkg).aiAssistant.maxConcurrentSessions }} 个会话
                    </span>
                  </li>
                </ul>
              </div>

              <!-- 存储空间 -->
              <div class="feature-group" v-if="getFeatures(pkg).storage">
                <div class="feature-group-title">
                  <el-icon class="feature-icon storage"><FolderOpened /></el-icon>
                  存储空间
                </div>
                <ul class="feature-list">
                  <li>
                    <el-icon class="check-icon"><Check /></el-icon>
                    <span class="feature-text">
                      <strong>{{ getFeatures(pkg).storage.quotaGB || 10 }}GB</strong> 云存储空间
                    </span>
                  </li>
                  
                  <li v-if="getFeatures(pkg).storage.allowedFileTypes">
                    <el-icon class="check-icon"><Check /></el-icon>
                    <span class="feature-text">
                      支持 {{ getFileTypesText(getFeatures(pkg).storage.allowedFileTypes) }}
                    </span>
                  </li>
                </ul>
              </div>

              <!-- 协作功能 -->
              <div class="feature-group" v-if="getFeatures(pkg).collaboration && getFeatures(pkg).collaboration.enabled">
                <div class="feature-group-title">
                  <el-icon class="feature-icon collab"><UserFilled /></el-icon>
                  团队协作
                </div>
                <ul class="feature-list">
                  <li>
                    <el-icon class="check-icon"><Check /></el-icon>
                    <span class="feature-text">
                      邀请 {{ getFeatures(pkg).collaboration.maxCollaborators }} 位协作者
                    </span>
                  </li>
                </ul>
              </div>

              <!-- 其他特权 -->
              <div class="feature-group" v-if="getFeatures(pkg).other">
                <div class="feature-group-title">
                  <el-icon class="feature-icon other"><Star /></el-icon>
                  特权服务
                </div>
                <ul class="feature-list">
                  <li v-if="getFeatures(pkg).other.enableExport">
                    <el-icon class="check-icon"><Check /></el-icon>
                    <span class="feature-text">数据导出</span>
                  </li>
                  
                  <li v-if="getFeatures(pkg).other.enableBackup">
                    <el-icon class="check-icon"><Check /></el-icon>
                    <span class="feature-text">自动备份</span>
                  </li>
                  
                  <li v-if="getFeatures(pkg).other.prioritySupport">
                    <el-icon class="check-icon"><Check /></el-icon>
                    <span class="feature-text highlight">优先客服支持</span>
                  </li>
                  
                  <li v-if="getFeatures(pkg).other.enableAPI">
                    <el-icon class="check-icon"><Check /></el-icon>
                    <span class="feature-text highlight">API接口访问</span>
                  </li>
                </ul>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="plan-actions">
              <el-button
                v-if="!isCurrentPackage(pkg.id)"
                type="primary"
                size="large"
                :loading="purchaseLoading === pkg.id"
                @click="selectPlan(pkg)"
                class="select-button"
              >
                <el-icon><ShoppingCart /></el-icon>
                {{ pkg.price === 0 ? '免费使用' : '立即订阅' }}
              </el-button>
              <div v-else class="current-plan-tag">
                <el-icon><CircleCheck /></el-icon>
                当前套餐
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 功能对比表格 -->
      <div class="comparison-section">
        <el-card class="comparison-card">
          <template #header>
            <div class="comparison-header">
              <h2>套餐功能详细对比</h2>
              <p>选择最适合您的创作需求</p>
            </div>
          </template>

          <el-table :data="comparisonData" style="width: 100%" :show-header="true">
            <el-table-column label="功能项" width="200" fixed>
              <template #default="{ row }">
                <div class="feature-name">
                  <el-icon :class="row.iconClass">
                    <component :is="row.icon" />
                  </el-icon>
                  {{ row.name }}
                </div>
              </template>
            </el-table-column>
            
            <el-table-column 
              v-for="pkg in packages" 
              :key="pkg.id"
              :label="pkg.name"
              align="center"
            >
              <template #default="{ row }">
                <div class="comparison-cell">
                  {{ getComparisonValue(pkg, row.key) }}
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>

      <!-- FAQ部分 -->
      <div class="faq-section">
        <h2 class="section-title">常见问题</h2>
        <el-collapse class="faq-collapse">
          <el-collapse-item title="如何选择合适的套餐？" name="1">
            <p>• 如果您刚开始创作，推荐<strong>基础套餐</strong>，可以体验视频生成等核心功能</p>
            <p>• 如果您是专业创作者，推荐<strong>专业套餐</strong>，享受高质量视频和不限AI助手</p>
            <p>• 如果您是团队或工作室，推荐<strong>企业套餐</strong>，获得最高配额和VIP服务</p>
          </el-collapse-item>
          
          <el-collapse-item title="视频生成功能如何计费？" name="2">
            <p>• 视频生成按套餐的每日/每月配额计费</p>
            <p>• 基础套餐：每天2个视频，每月10个</p>
            <p>• 专业套餐：每天5个视频，每月50个</p>
            <p>• 企业套餐：每天20个视频，每月200个</p>
            <p>• 配额每日凌晨自动重置</p>
          </el-collapse-item>
          
          <el-collapse-item title="可以随时升级或降级套餐吗？" name="3">
            <p>• 可以随时升级到更高级别的套餐</p>
            <p>• 降级将在当前订阅期结束后生效</p>
            <p>• 升级后立即享受新套餐的所有权限</p>
          </el-collapse-item>

          <el-collapse-item title="支持哪些支付方式？" name="4">
            <p>• 支付宝</p>
            <p>• 微信支付</p>
            <p>• 支付安全由第三方支付平台保障</p>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>

    <!-- 支付对话框 -->
    <el-dialog
      v-model="paymentDialogVisible"
      title="确认订阅"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="payment-dialog">
        <!-- 套餐信息 -->
        <div class="selected-plan-info">
          <h3>{{ selectedPlan?.name }}</h3>
          <p class="plan-desc">{{ selectedPlan?.description || getPackageDescription(selectedPlan) }}</p>
          
          <!-- 核心功能展示 -->
          <div class="key-features">
            <div class="key-feature-item" v-if="getFeatures(selectedPlan).videoGeneration?.enabled">
              <el-icon class="feature-icon"><VideoCamera /></el-icon>
              <div>
                <strong>视频生成</strong>
                <p>{{ formatQuota(getFeatures(selectedPlan).videoGeneration.dailyQuota) }}/天</p>
              </div>
            </div>
            
            <div class="key-feature-item" v-if="getFeatures(selectedPlan).aiWriting?.enabled">
              <el-icon class="feature-icon"><EditPen /></el-icon>
              <div>
                <strong>AI写作</strong>
                <p>{{ formatQuota(getFeatures(selectedPlan).aiWriting.dailyQuota) }}/天</p>
              </div>
            </div>
            
            <div class="key-feature-item">
              <el-icon class="feature-icon"><FolderOpened /></el-icon>
              <div>
                <strong>存储空间</strong>
                <p>{{ getFeatures(selectedPlan).storage?.quotaGB || 10 }}GB</p>
              </div>
            </div>
          </div>
          
          <!-- 价格信息 -->
          <div class="price-summary">
            <div class="price-row">
              <span>套餐价格</span>
              <span class="price-value">¥{{ selectedPlan?.price }}</span>
            </div>
            <div class="price-row total">
              <span>应付金额</span>
              <span class="price-value">¥{{ selectedPlan?.price }}</span>
            </div>
          </div>
        </div>

        <!-- 支付方式 -->
        <div class="payment-methods">
          <h4>选择支付方式</h4>
          <el-radio-group v-model="selectedPaymentMethod" size="large" class="payment-radio-group">
            <el-radio label="ALIPAY" class="payment-radio">
              <div class="payment-option">
                <img src="/alipay-icon.svg" alt="支付宝" class="payment-logo">
                <div class="payment-info">
                  <strong>支付宝</strong>
                  <p>安全快捷</p>
                </div>
              </div>
            </el-radio>
            
            <el-radio label="WECHAT" class="payment-radio">
              <div class="payment-option">
                <img src="/wechat-icon.svg" alt="微信支付" class="payment-logo">
                <div class="payment-info">
                  <strong>微信支付</strong>
                  <p>便捷支付</p>
                </div>
              </div>
            </el-radio>
          </el-radio-group>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button size="large" @click="paymentDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            size="large"
            :loading="purchaseLoading"
            @click="confirmPurchase"
            :icon="CreditCard"
          >
            确认支付 ¥{{ selectedPlan?.price }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Calendar, Refresh, Close, Star, Check, List, VideoCamera,
  Edit as EditPen, ChatDotRound, FolderOpened, User as UserFilled, ShoppingCart,
  CircleCheck, CreditCard, TrophyBase, Avatar
} from '@element-plus/icons-vue'
import { subscriptionService } from '@/services/subscriptionService'
import { packageService } from '@/services/packageService'
import { paymentService } from '@/services/paymentService'

// 状态
const loading = ref(false)
const purchaseLoading = ref(null)
const packages = ref([])
const currentSubscription = ref(null)
const paymentDialogVisible = ref(false)
const selectedPlan = ref(null)
const selectedPaymentMethod = ref('ALIPAY')

// 计算属性
const daysLeft = computed(() => {
  if (!currentSubscription.value) return 0
  const now = new Date()
  const endDate = new Date(currentSubscription.value.endDate)
  const diffTime = endDate - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
})

const canRenew = computed(() => {
  return currentSubscription.value && 
         (currentSubscription.value.status === 'ACTIVE' || daysLeft.value <= 7)
})

const canCancel = computed(() => {
  return currentSubscription.value && 
         currentSubscription.value.status === 'ACTIVE' &&
         daysLeft.value > 0
})

// 对比表格数据
const comparisonData = computed(() => [
  { name: '视频生成', key: 'videoGeneration.dailyQuota', icon: VideoCamera, iconClass: 'video' },
  { name: '视频质量', key: 'videoGeneration.quality', icon: VideoCamera, iconClass: 'video' },
  { name: 'AI写作', key: 'aiWriting.dailyQuota', icon: EditPen, iconClass: 'writing' },
  { name: 'AI助手', key: 'aiAssistant.dailyQuota', icon: ChatDotRound, iconClass: 'assistant' },
  { name: '存储空间', key: 'storage.quotaGB', icon: FolderOpened, iconClass: 'storage' },
  { name: '高级参数', key: 'videoGeneration.enableAdvancedParams', icon: Star, iconClass: 'premium' },
  { name: '优先支持', key: 'other.prioritySupport', icon: Star, iconClass: 'premium' },
])

// 方法
const loadPackages = async () => {
  loading.value = true
  try {
    const response = await packageService.getActivePackages()
    packages.value = response.data || []
  } catch (error) {
    ElMessage.error('加载套餐失败')
  } finally {
    loading.value = false
  }
}

const loadCurrentSubscription = async () => {
  try {
    const response = await subscriptionService.getCurrentSubscription()
    if (response.success && response.data) {
      currentSubscription.value = response.data
    }
  } catch (error) {
    console.error('加载订阅失败:', error)
  }
}

const isCurrentPackage = (packageId) => {
  return currentSubscription.value && 
         currentSubscription.value.packageId === packageId
}

const isRecommended = (pkg) => {
  // 专业版标记为推荐
  return pkg.name.includes('专业') || pkg.price === 200
}

const selectPlan = (plan) => {
  if (isCurrentPackage(plan.id)) return
  selectedPlan.value = plan
  paymentDialogVisible.value = true
}

const confirmPurchase = async () => {
  if (!selectedPlan.value) return

  try {
    purchaseLoading.value = true

    const orderResponse = await paymentService.createOrder({
      packageId: selectedPlan.value.id,
      paymentMethod: selectedPaymentMethod.value
    })

    if (!orderResponse.success) {
      throw new Error(orderResponse.error?.message || '创建订单失败')
    }

    const paymentResponse = await paymentService.pay(orderResponse.data.orderNo)
    
    if (paymentResponse.success) {
      handlePaymentRedirect(paymentResponse.data)
    }
  } catch (error) {
    ElMessage.error(error.message || '购买失败')
  } finally {
    purchaseLoading.value = false
  }
}

const handlePaymentRedirect = (paymentData) => {
  paymentDialogVisible.value = false
  
  if (paymentData.payment?.url) {
    window.open(paymentData.payment.url, '_blank')
    ElMessage.success('订单已创建，请在新窗口中完成支付')
    
    pollPaymentStatus(paymentData.order.orderNo)
  }
}

const pollPaymentStatus = (orderNo) => {
  const timer = setInterval(async () => {
    try {
      const response = await paymentService.getOrder(orderNo)
      if (response.success && response.data.status === 'PAID') {
        clearInterval(timer)
        ElMessage.success('支付成功！订阅已激活')
        await loadCurrentSubscription()
      }
    } catch (error) {
      console.error('检查支付状态失败:', error)
    }
  }, 3000)

  setTimeout(() => clearInterval(timer), 5 * 60 * 1000)
}

const renewSubscription = async () => {
  try {
    await ElMessageBox.confirm('确定要续费当前订阅吗？', '确认续费', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await subscriptionService.renew(currentSubscription.value.id)
    if (response.success) {
      ElMessage.success('续费成功')
      await loadCurrentSubscription()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('续费失败')
    }
  }
}

const cancelSubscription = async () => {
  try {
    await ElMessageBox.confirm(
      '取消后订阅将在到期后失效，确定要取消吗？', 
      '确认取消', 
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await subscriptionService.cancel(currentSubscription.value.id)
    if (response.success) {
      ElMessage.success('订阅已取消')
      await loadCurrentSubscription()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('取消失败')
    }
  }
}

// 辅助函数
const getFeatures = (pkg) => {
  if (!pkg || !pkg.features) return {
    videoGeneration: { enabled: false },
    aiWriting: { enabled: true, dailyQuota: 100 },
    aiAssistant: { enabled: true, dailyQuota: 50 },
    storage: { quotaGB: 10 }
  }
  
  const features = typeof pkg.features === 'string' ? JSON.parse(pkg.features) : pkg.features
  
  // 兼容旧格式，转换为新格式
  if (!features.videoGeneration && !features.aiWriting) {
    // 旧格式，转换为新格式
    return {
      videoGeneration: { 
        enabled: features.videoGeneration !== false,
        dailyQuota: features.videosPerDay || 0,
        monthlyQuota: features.videosPerMonth || 0
      },
      aiWriting: {
        enabled: true,
        dailyQuota: features.aiCalls || features.aiGenerationLimit || 100,
        models: features.aiModelAccess ? [features.aiModelAccess] : ['gpt-3.5']
      },
      aiAssistant: {
        enabled: true,
        dailyQuota: features.assistant === 'basic' ? 50 : -1
      },
      materialGeneration: {
        enabled: true,
        dailyQuota: features.materials || 100
      },
      storage: {
        quotaGB: features.storageLimit || 10
      },
      collaboration: {
        enabled: features.collaboration || false,
        maxCollaborators: features.maxCollaborators || 0
      },
      other: {
        enableExport: features.export || false,
        enableBackup: features.dataBackup || false,
        prioritySupport: features.prioritySupport || false
      }
    }
  }
  
  return features
}

const formatQuota = (quota) => {
  if (quota === -1 || quota === 0) return '不限'
  return quota
}

const getQualityText = (qualities) => {
  if (!qualities || qualities.length === 0) return '标准质量'
  const qualityMap = {
    'standard': '标准',
    'high': '高清',
    'ultra': '超高清'
  }
  return qualities.map(q => qualityMap[q] || q).join('、') + '质量'
}

const getModelsText = (models) => {
  if (!models || models.length === 0) return '基础AI模型'
  const modelMap = {
    'gpt-3.5': 'GPT-3.5',
    'gpt-4': 'GPT-4',
    'claude-3': 'Claude-3',
    'deepseek': 'DeepSeek'
  }
  return '支持 ' + models.map(m => modelMap[m] || m).join('、')
}

const getFileTypesText = (types) => {
  if (!types || types.length === 0) return '基础文件'
  const typeMap = {
    'image': '图片',
    'document': '文档',
    'audio': '音频',
    'video': '视频'
  }
  return types.map(t => typeMap[t] || t).join('、')
}

const getPackageDescription = (pkg) => {
  const price = pkg.price
  if (price === 0) return '体验核心功能，开启创作之旅'
  if (price <= 100) return '解锁视频生成，提升创作效率'
  if (price <= 300) return '专业创作者首选，高质量AI助手'
  return '团队协作，VIP服务，无限制创作'
}

const getComparisonValue = (pkg, key) => {
  const features = getFeatures(pkg)
  const keys = key.split('.')
  let value = features
  
  for (const k of keys) {
    value = value?.[k]
  }

  if (key.includes('dailyQuota')) {
    return formatQuota(value)
  }
  if (key.includes('quotaGB')) {
    return (value || 10) + 'GB'
  }
  if (key === 'videoGeneration.quality') {
    return getQualityText(features.videoGeneration?.allowedQualities)
  }
  if (typeof value === 'boolean') {
    return value ? '✓' : '×'
  }
  
  return value || '×'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadPackages()
  loadCurrentSubscription()
})
</script>

<style scoped lang="scss">
.subscription-plans-new {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 4rem;
}

.header-section {
  text-align: center;
  padding: 4rem 0 3rem;
  color: white;

  .main-title {
    font-size: 3rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .subtitle {
    font-size: 1.3rem;
    opacity: 0.95;
    margin: 0;
  }
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.current-subscription {
  margin-bottom: 3rem;

  .status-card {
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .status-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;

    .status-icon {
      font-size: 24px;
      color: #f59e0b;
    }

    h3 {
      margin: 0;
      font-size: 18px;
    }
  }

  .status-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
  }

  .package-name {
    font-size: 24px;
    font-weight: 700;
    color: #667eea;
    margin: 0 0 8px 0;
  }

  .price-info {
    font-size: 16px;
    color: #666;
    margin: 0 0 8px 0;
  }

  .expire-info {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #666;
    margin: 0;

    .days-tag {
      margin-left: 8px;
    }
  }

  .status-actions {
    display: flex;
    gap: 12px;
  }
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.plan-card {
  background: white;
  border-radius: 20px;
  padding: 2.5rem 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 3px solid transparent;

  &:hover {
    transform: translateY(-12px);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  }

  &.recommended {
    border-color: #667eea;
    box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);

    &:hover {
      box-shadow: 0 20px 60px rgba(102, 126, 234, 0.4);
    }
  }

  &.current {
    border-color: #67c23a;
  }
}

.recommended-badge {
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  display: flex;
  align-items: center;
  gap: 4px;
}

.current-badge {
  position: absolute;
  top: -14px;
  right: 20px;
  background: #67c23a;
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.plan-header {
  text-align: center;
  margin-bottom: 1.5rem;

  .plan-name {
    font-size: 2rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 0.75rem 0;
  }

  .plan-description {
    color: #6b7280;
    font-size: 15px;
    line-height: 1.6;
    margin: 0;
  }
}

.plan-pricing {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #f3f4f6;

  .price-wrapper {
    display: flex;
    align-items: baseline;
    justify-content: center;
  }

  .currency {
    font-size: 1.5rem;
    font-weight: 600;
    color: #667eea;
    margin-right: 4px;
  }

  .price {
    font-size: 3.5rem;
    font-weight: 800;
    color: #667eea;
    line-height: 1;
  }

  .period {
    font-size: 1.1rem;
    color: #6b7280;
    margin-left: 4px;
  }

  .price-note {
    margin-top: 8px;
    color: #9ca3af;
    font-size: 14px;
  }
}

.plan-features {
  margin-bottom: 2rem;

  .features-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 16px;
  }
}

.feature-group {
  margin-bottom: 20px;

  .feature-group-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 600;
    color: #4b5563;
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e5e7eb;

    .feature-icon {
      font-size: 18px;
      
      &.video { color: #ef4444; }
      &.writing { color: #3b82f6; }
      &.assistant { color: #8b5cf6; }
      &.storage { color: #10b981; }
      &.collab { color: #f59e0b; }
      &.other { color: #6b7280; }
    }
  }

  .feature-list {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 6px 0;
      color: #4b5563;
      font-size: 14px;
      line-height: 1.6;

      .check-icon {
        color: #10b981;
        font-size: 16px;
        flex-shrink: 0;
        margin-top: 2px;
      }

      .close-icon {
        color: #d1d5db;
        font-size: 16px;
        flex-shrink: 0;
      }

      &.disabled-feature {
        opacity: 0.5;
      }

      strong {
        color: #667eea;
        font-weight: 600;
      }

      .highlight {
        color: #ef4444;
        font-weight: 500;
      }
    }
  }
}

.plan-actions {
  text-align: center;

  .select-button {
    width: 100%;
    height: 52px;
    font-size: 1.1rem;
    font-weight: 600;
    border-radius: 26px;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    transition: all 0.3s;

    &:hover {
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
      transform: translateY(-2px);
    }
  }

  .current-plan-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #ecfdf5;
    color: #10b981;
    padding: 12px 24px;
    border-radius: 26px;
    font-weight: 600;
    font-size: 16px;
  }
}

.comparison-section {
  margin-top: 4rem;

  .comparison-card {
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .comparison-header {
    text-align: center;

    h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      color: #1f2937;
    }

    p {
      margin: 0;
      color: #6b7280;
    }
  }

  .feature-name {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;

    .el-icon {
      font-size: 18px;

      &.video { color: #ef4444; }
      &.writing { color: #3b82f6; }
      &.assistant { color: #8b5cf6; }
      &.storage { color: #10b981; }
      &.premium { color: #f59e0b; }
    }
  }

  .comparison-cell {
    font-weight: 500;
    color: #374151;
  }
}

.faq-section {
  margin-top: 4rem;

  .section-title {
    text-align: center;
    font-size: 2rem;
    font-weight: 700;
    color: white;
    margin-bottom: 2rem;
  }

  .faq-collapse {
    background: white;
    border-radius: 16px;
    padding: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);

    p {
      margin: 8px 0;
      line-height: 1.8;
      color: #4b5563;

      strong {
        color: #667eea;
      }
    }
  }
}

.payment-dialog {
  .selected-plan-info {
    margin-bottom: 24px;

    h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
      color: #1f2937;
    }

    .plan-desc {
      color: #6b7280;
      margin: 0 0 16px 0;
    }
  }

  .key-features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
    margin-bottom: 20px;

    .key-feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f9fafb;
      border-radius: 8px;

      .feature-icon {
        font-size: 24px;
        color: #667eea;
      }

      strong {
        display: block;
        font-size: 14px;
        color: #1f2937;
        margin-bottom: 2px;
      }

      p {
        margin: 0;
        font-size: 13px;
        color: #6b7280;
      }
    }
  }

  .price-summary {
    background: #f9fafb;
    border-radius: 12px;
    padding: 16px;
    margin-top: 20px;

    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      color: #4b5563;

      &.total {
        border-top: 2px solid #e5e7eb;
        margin-top: 8px;
        padding-top: 16px;
        font-weight: 600;
        font-size: 18px;

        .price-value {
          color: #ef4444;
          font-size: 24px;
        }
      }

      .price-value {
        font-weight: 600;
        color: #667eea;
      }
    }
  }

  .payment-methods {
    margin-top: 24px;

    h4 {
      margin: 0 0 16px 0;
      color: #1f2937;
    }

    .payment-radio-group {
      width: 100%;

      .payment-radio {
        width: 100%;
        margin-bottom: 12px;
        padding: 16px;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        transition: all 0.3s;

        &:hover {
          border-color: #667eea;
          background: #f9fafb;
        }

        :deep(.el-radio__input.is-checked + .el-radio__label) {
          color: #667eea;
        }

        :deep(.el-radio__input.is-checked) {
          .el-radio__inner {
            background: #667eea;
            border-color: #667eea;
          }
        }
      }

      .payment-option {
        display: flex;
        align-items: center;
        gap: 16px;

        .payment-logo {
          width: 40px;
          height: 40px;
          object-fit: contain;
        }

        .payment-info {
          strong {
            display: block;
            font-size: 16px;
            color: #1f2937;
            margin-bottom: 2px;
          }

          p {
            margin: 0;
            font-size: 13px;
            color: #6b7280;
          }
        }
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式 */
@media (max-width: 768px) {
  .header-section .main-title {
    font-size: 2rem;
  }

  .plans-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .plan-card.recommended {
    transform: none;
  }

  .current-subscription .status-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .payment-dialog .key-features {
    grid-template-columns: 1fr;
  }
}
</style>

