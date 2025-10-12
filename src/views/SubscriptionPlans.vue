<template>
  <div class="subscription-plans">
    <div class="container">
      <!-- 页面头部 -->
      <div class="header-section">
        <h1 class="main-title">选择您的订阅套餐</h1>
        <p class="subtitle">解锁更多功能，提升写作体验</p>
      </div>

      <!-- 当前订阅状态 -->
      <div v-if="currentSubscription" class="current-subscription">
        <el-card class="status-card">
          <div class="status-content">
            <div class="status-info">
              <h3>当前订阅</h3>
              <p class="package-name">{{ currentSubscription.package.name }}</p>
              <p class="expire-date">
                到期时间: {{ formatDate(currentSubscription.endDate) }}
                <span v-if="daysLeft > 0" class="days-left">(剩余 {{ daysLeft }} 天)</span>
                <span v-else class="expired">(已过期)</span>
              </p>
            </div>
            <div class="status-actions">
              <el-button v-if="canRenew" type="primary" @click="renewSubscription">
                续费
              </el-button>
              <el-button v-if="canCancel" type="danger" plain @click="cancelSubscription">
                取消订阅
              </el-button>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 套餐列表 -->
      <div class="plans-section">
        <div class="plans-grid" v-loading="loading">
          <div
            v-for="plan in packages"
            :key="plan.id"
            class="plan-card"
            :class="{ 
              'popular': plan.name.toLowerCase().includes('premium'),
              'current': isCurrentPackage(plan.id)
            }"
          >
            <div v-if="plan.name.toLowerCase().includes('premium')" class="popular-badge">
              最受欢迎
            </div>

            <div class="plan-header">
              <h3 class="plan-name">{{ plan.name }}</h3>
              <p class="plan-description">{{ plan.description }}</p>
            </div>

            <div class="plan-pricing">
              <span class="price">¥{{ plan.price }}</span>
              <span class="period">/ {{ plan.durationDays }}天</span>
            </div>

            <div class="plan-features">
              <h4>功能特性</h4>
              <ul>
                <li v-for="(value, key) in plan.features" :key="key">
                  <el-icon><Check /></el-icon>
                  {{ getFeatureText(key, value) }}
                </li>
              </ul>
            </div>

            <div class="plan-actions">
              <el-button
                v-if="!isCurrentPackage(plan.id)"
                type="primary"
                size="large"
                :loading="purchaseLoading === plan.id"
                @click="selectPlan(plan)"
                class="select-button"
              >
                选择此套餐
              </el-button>
              <div v-else class="current-plan-badge">
                当前套餐
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 支付方式选择对话框 -->
      <el-dialog
        v-model="paymentDialogVisible"
        title="选择支付方式"
        width="500px"
        :close-on-click-modal="false"
      >
        <div class="payment-dialog-content">
          <div class="selected-plan-info">
            <h4>{{ selectedPlan?.name }}</h4>
            <p>{{ selectedPlan?.description }}</p>
            <div class="price-info">
              <span class="total">总价: ¥{{ selectedPlan?.price }}</span>
            </div>
          </div>

          <div class="payment-methods">
            <h4>支付方式</h4>
            <el-radio-group v-model="selectedPaymentMethod" size="large">
              <el-radio label="ALIPAY" class="payment-option">
                <div class="payment-item">
                  <img src="/alipay-icon.svg" alt="支付宝" class="payment-icon">
                  <span>支付宝</span>
                </div>
              </el-radio>
              <el-radio label="WECHAT" class="payment-option">
                <div class="payment-item">
                  <img src="/wechat-icon.svg" alt="微信支付" class="payment-icon">
                  <span>微信支付</span>
                </div>
              </el-radio>
            </el-radio-group>
          </div>
        </div>

        <template #footer>
          <div class="dialog-footer">
            <el-button @click="paymentDialogVisible = false">取消</el-button>
            <el-button
              type="primary"
              :loading="purchaseLoading"
              @click="confirmPurchase"
            >
              确认支付
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check } from '@element-plus/icons-vue'
import { subscriptionService } from '@/services/subscriptionService'
import { packageService } from '@/services/packageService'
import { paymentService } from '@/services/paymentService'

export default {
  name: 'SubscriptionPlans',
  components: {
    Check
  },
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const purchaseLoading = ref(null)
    const packages = ref([])
    const currentSubscription = ref(null)
    const paymentDialogVisible = ref(false)
    const selectedPlan = ref(null)
    const selectedPaymentMethod = ref('ALIPAY')

    // 计算当前订阅剩余天数
    const daysLeft = computed(() => {
      if (!currentSubscription.value) return 0
      const now = new Date()
      const endDate = new Date(currentSubscription.value.endDate)
      const diffTime = endDate - now
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return Math.max(0, diffDays)
    })

    // 是否可以续费
    const canRenew = computed(() => {
      return currentSubscription.value && 
             (currentSubscription.value.status === 'ACTIVE' || daysLeft.value <= 7)
    })

    // 是否可以取消
    const canCancel = computed(() => {
      return currentSubscription.value && 
             currentSubscription.value.status === 'ACTIVE' &&
             daysLeft.value > 0
    })

    // 加载套餐列表
    const loadPackages = async () => {
      try {
        loading.value = true
        const response = await packageService.getActivePackages()
        packages.value = response.data || []
      } catch (error) {
        console.error('加载套餐失败:', error)
        ElMessage.error('加载套餐列表失败')
      } finally {
        loading.value = false
      }
    }

    // 加载当前订阅
    const loadCurrentSubscription = async () => {
      try {
        const response = await subscriptionService.getCurrentSubscription()
        if (response.success && response.data) {
          currentSubscription.value = response.data
        }
      } catch (error) {
        console.error('加载当前订阅失败:', error)
      }
    }

    // 判断是否为当前套餐
    const isCurrentPackage = (packageId) => {
      return currentSubscription.value && 
             currentSubscription.value.packageId === packageId
    }

    // 选择套餐
    const selectPlan = (plan) => {
      if (isCurrentPackage(plan.id)) return
      
      selectedPlan.value = plan
      paymentDialogVisible.value = true
    }

    // 确认购买
    const confirmPurchase = async () => {
      if (!selectedPlan.value || !selectedPaymentMethod.value) return

      try {
        purchaseLoading.value = true

        // 创建支付订单
        const orderResponse = await paymentService.createOrder({
          packageId: selectedPlan.value.id,
          paymentMethod: selectedPaymentMethod.value
        })

        if (!orderResponse.success) {
          throw new Error(orderResponse.error?.message || '创建订单失败')
        }

        // 发起支付
        const paymentResponse = await paymentService.pay(orderResponse.data.orderNo)
        
        if (paymentResponse.success) {
          // 处理支付跳转
          handlePaymentRedirect(paymentResponse.data)
        } else {
          throw new Error(paymentResponse.error?.message || '支付失败')
        }

      } catch (error) {
        console.error('购买失败:', error)
        ElMessage.error(error.message || '购买失败，请重试')
      } finally {
        purchaseLoading.value = false
      }
    }

    // 处理支付跳转
    const handlePaymentRedirect = (paymentData) => {
      paymentDialogVisible.value = false
      
      if (paymentData.payment?.url) {
        // 跳转到支付页面
        window.open(paymentData.payment.url, '_blank')
        
        ElMessage.success('订单已创建，请在新窗口中完成支付')
        
        // 可以实现支付状态轮询
        pollPaymentStatus(paymentData.order.orderNo)
      }
    }

    // 轮询支付状态
    const pollPaymentStatus = (orderNo) => {
      const timer = setInterval(async () => {
        try {
          const response = await paymentService.getOrder(orderNo)
          if (response.success && response.data.status === 'PAID') {
            clearInterval(timer)
            ElMessage.success('支付成功！')
            
            // 重新加载订阅状态
            await loadCurrentSubscription()
          }
        } catch (error) {
          console.error('检查支付状态失败:', error)
        }
      }, 3000)

      // 5分钟后停止轮询
      setTimeout(() => {
        clearInterval(timer)
      }, 5 * 60 * 1000)
    }

    // 续费订阅
    const renewSubscription = async () => {
      if (!currentSubscription.value) return

      try {
        const result = await ElMessageBox.confirm(
          '确定要续费当前订阅吗？',
          '确认续费',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        if (result === 'confirm') {
          const response = await subscriptionService.renew(currentSubscription.value.id)
          if (response.success) {
            ElMessage.success('续费成功')
            await loadCurrentSubscription()
          }
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('续费失败:', error)
          ElMessage.error('续费失败，请重试')
        }
      }
    }

    // 取消订阅
    const cancelSubscription = async () => {
      if (!currentSubscription.value) return

      try {
        const result = await ElMessageBox.confirm(
          '确定要取消订阅吗？订阅将在到期后失效。',
          '确认取消',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        if (result === 'confirm') {
          const response = await subscriptionService.cancel(currentSubscription.value.id)
          if (response.success) {
            ElMessage.success('订阅已取消')
            await loadCurrentSubscription()
          }
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('取消订阅失败:', error)
          ElMessage.error('取消订阅失败，请重试')
        }
      }
    }

    // 格式化日期
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('zh-CN')
    }

    // 获取功能文本描述
    const getFeatureText = (key, value) => {
      const featureTexts = {
        // 小说相关
        maxNovels: value === -1 ? '小说数量不限' : `最多创建 ${value} 部小说`,
        maxChaptersPerNovel: value === -1 ? '章节数量不限' : `每部小说最多 ${value} 章`,
        
        // AI生成相关
        aiGenerationLimit: value === -1 ? 'AI生成次数不限' : `AI生成 ${value} 次/天`,
        aiTokenLimit: value === -1 ? 'AI Token 不限' : `AI Token 限额 ${formatNumber(value)}/月`,
        aiModelAccess: getAIModelAccessText(value),
        
        // 功能权限
        advancedFeatures: value ? '✓ 高级功能' : '基础功能',
        customPrompts: value ? '✓ 自定义提示词' : '标准提示词',
        materialUpload: value ? '✓ 素材上传' : '不支持素材上传',
        collaboration: value ? '✓ 多人协作' : '不支持协作',
        versionControl: value ? '✓ 版本控制' : '不支持版本控制',
        exportFormats: getExportFormatsText(value),
        
        // 服务相关
        prioritySupport: value ? '✓ 优先客服支持' : '标准客服支持',
        dataBackup: value ? '✓ 自动数据备份' : '基础数据存储',
        adFree: value ? '✓ 无广告体验' : '含广告',
        
        // 存储相关
        storageLimit: value === -1 ? '存储空间不限' : `${value}GB 存储空间`,
        
        // 其他
        concurrentEditing: value ? '✓ 多设备同步编辑' : '单设备编辑'
      }
      
      return featureTexts[key] || formatFeatureValue(key, value)
    }
    
    // 格式化数字
    const formatNumber = (num) => {
      if (num >= 1000000) {
        return (num / 1000000) + 'M'
      } else if (num >= 1000) {
        return (num / 1000) + 'K'
      }
      return num.toString()
    }
    
    // 获取AI模型访问权限文本
    const getAIModelAccessText = (value) => {
      if (typeof value === 'string') {
        const accessLevels = {
          FREE: '基础AI模型',
          BASIC: '✓ 标准AI模型',
          PREMIUM: '✓ 高级AI模型（含GPT-4）',
          UNLIMITED: '✓ 全部AI模型（含最新模型）'
        }
        return accessLevels[value] || value
      }
      return value ? '✓ 高级AI模型' : '基础AI模型'
    }
    
    // 获取导出格式文本
    const getExportFormatsText = (value) => {
      if (Array.isArray(value)) {
        const formats = {
          txt: 'TXT',
          docx: 'Word',
          pdf: 'PDF',
          epub: 'EPUB',
          mobi: 'MOBI'
        }
        return '✓ 导出格式：' + value.map(f => formats[f] || f).join('、')
      }
      return value ? '✓ 多格式导出' : '仅TXT导出'
    }
    
    // 格式化功能值（通用）
    const formatFeatureValue = (key, value) => {
      // 将驼峰命名转换为中文
      const keyMap = {
        maxNovels: '最大小说数',
        maxChapters: '最大章节数',
        aiGeneration: 'AI生成',
        customPrompt: '自定义提示词',
        priority: '优先级'
      }
      
      const displayKey = keyMap[key] || key
      
      if (typeof value === 'boolean') {
        return value ? `✓ ${displayKey}` : displayKey
      }
      return `${displayKey}: ${value}`
    }

    onMounted(() => {
      loadPackages()
      loadCurrentSubscription()
    })

    return {
      loading,
      purchaseLoading,
      packages,
      currentSubscription,
      paymentDialogVisible,
      selectedPlan,
      selectedPaymentMethod,
      daysLeft,
      canRenew,
      canCancel,
      selectPlan,
      confirmPurchase,
      renewSubscription,
      cancelSubscription,
      formatDate,
      getFeatureText,
      isCurrentPackage,
      formatNumber,
      getAIModelAccessText,
      getExportFormatsText,
      formatFeatureValue
    }
  }
}
</script>

<style scoped>
.subscription-plans {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.header-section {
  text-align: center;
  margin-bottom: 3rem;
}

.main-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.current-subscription {
  margin-bottom: 3rem;
}

.status-card {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.status-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-info h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.package-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #667eea;
  margin: 0 0 0.5rem 0;
}

.expire-date {
  color: #666;
  margin: 0;
}

.days-left {
  color: #67c23a;
  font-weight: 500;
}

.expired {
  color: #f56c6c;
  font-weight: 500;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
}

.plan-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
  transition: all 0.3s ease;
}

.plan-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
}

.plan-card.popular {
  border: 3px solid #667eea;
  transform: scale(1.05);
}

.plan-card.current {
  border: 3px solid #67c23a;
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: #667eea;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.plan-header {
  text-align: center;
  margin-bottom: 2rem;
}

.plan-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 1rem 0;
}

.plan-description {
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.plan-pricing {
  text-align: center;
  margin-bottom: 2rem;
}

.price {
  font-size: 3rem;
  font-weight: 700;
  color: #667eea;
}

.period {
  font-size: 1rem;
  color: #666;
  margin-left: 0.5rem;
}

.plan-features {
  margin-bottom: 2rem;
}

.plan-features h4 {
  margin: 0 0 1rem 0;
  color: #333;
  font-weight: 600;
}

.plan-features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.plan-features li {
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
  color: #555;
}

.plan-features .el-icon {
  color: #67c23a;
  margin-right: 0.5rem;
}

.plan-actions {
  text-align: center;
}

.select-button {
  width: 100%;
  height: 48px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 24px;
}

.current-plan-badge {
  display: inline-block;
  background: #67c23a;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 24px;
  font-weight: 600;
}

.payment-dialog-content {
  padding: 1rem 0;
}

.selected-plan-info {
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.selected-plan-info h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.selected-plan-info p {
  color: #666;
  margin: 0 0 1rem 0;
}

.price-info {
  text-align: right;
}

.total {
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
}

.payment-methods h4 {
  margin: 0 0 1rem 0;
  color: #333;
}

.payment-option {
  display: block;
  width: 100%;
  margin-bottom: 1rem;
}

.payment-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.payment-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .main-title {
    font-size: 2rem;
  }
  
  .plans-grid {
    grid-template-columns: 1fr;
  }
  
  .plan-card.popular {
    transform: none;
  }
  
  .status-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>
