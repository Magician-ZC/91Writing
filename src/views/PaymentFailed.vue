<template>
  <div class="payment-result">
    <div class="container">
      <div class="result-card failed">
        <div class="result-icon">
          <el-icon size="64px"><CircleClose /></el-icon>
        </div>
        
        <h1 class="result-title">支付失败</h1>
        <p class="result-description">很抱歉，您的支付未能成功完成</p>
        
        <div v-if="errorMessage" class="error-message">
          <p>{{ errorMessage }}</p>
        </div>
        
        <div v-if="orderInfo" class="order-info">
          <div class="info-item">
            <span class="label">订单号：</span>
            <span class="value">{{ orderInfo.orderNo }}</span>
          </div>
          <div class="info-item">
            <span class="label">套餐名称：</span>
            <span class="value">{{ orderInfo.package?.name }}</span>
          </div>
          <div class="info-item">
            <span class="label">支付金额：</span>
            <span class="value price">¥{{ orderInfo.amount }}</span>
          </div>
          <div class="info-item">
            <span class="label">失败时间：</span>
            <span class="value">{{ formatDate(orderInfo.updatedAt) }}</span>
          </div>
        </div>
        
        <div class="failure-reasons">
          <h4>可能的原因：</h4>
          <ul>
            <li>账户余额不足</li>
            <li>银行卡信息有误</li>
            <li>网络连接不稳定</li>
            <li>支付密码错误</li>
          </ul>
        </div>
        
        <div class="result-actions">
          <el-button type="primary" size="large" @click="retryPayment">
            重新支付
          </el-button>
          <el-button size="large" @click="goToSubscription">
            选择其他套餐
          </el-button>
          <el-button size="large" plain @click="goToHome">
            返回首页
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { CircleClose } from '@element-plus/icons-vue'
import { paymentService } from '@/services/paymentService'

export default {
  name: 'PaymentFailed',
  components: {
    CircleClose
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const orderInfo = ref(null)
    const errorMessage = ref('')

    const loadOrderInfo = async () => {
      try {
        const orderNo = route.query.orderNo
        errorMessage.value = route.query.message || ''
        
        if (orderNo) {
          const response = await paymentService.getOrder(orderNo)
          if (response.success) {
            orderInfo.value = response.data
          }
        }
      } catch (error) {
        console.error('加载订单信息失败:', error)
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleString('zh-CN')
    }

    const retryPayment = async () => {
      if (!orderInfo.value) {
        ElMessage.error('订单信息不完整')
        return
      }

      try {
        // 检查订单是否仍然有效
        if (paymentService.isOrderExpired(orderInfo.value)) {
          ElMessage.warning('订单已过期，请重新创建订单')
          router.push('/subscription')
          return
        }

        // 重新发起支付
        const response = await paymentService.pay(orderInfo.value.orderNo)
        
        if (response.success && response.data.payment?.url) {
          window.open(response.data.payment.url, '_blank')
          ElMessage.info('请在新窗口中完成支付')
        } else {
          throw new Error('重新支付失败')
        }
      } catch (error) {
        console.error('重新支付失败:', error)
        ElMessage.error('重新支付失败，请稍后重试')
      }
    }

    const goToSubscription = () => {
      router.push('/subscription')
    }

    const goToHome = () => {
      router.push('/')
    }

    onMounted(() => {
      loadOrderInfo()
    })

    return {
      orderInfo,
      errorMessage,
      formatDate,
      retryPayment,
      goToSubscription,
      goToHome
    }
  }
}
</script>

<style scoped>
.payment-result {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.container {
  width: 100%;
  max-width: 500px;
}

.result-card {
  background: white;
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.1);
}

.result-card.failed {
  border-top: 4px solid #f56c6c;
}

.result-icon {
  margin-bottom: 2rem;
  color: #f56c6c;
}

.result-title {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 1rem 0;
}

.result-description {
  font-size: 1.1rem;
  color: #666;
  margin: 0 0 2rem 0;
}

.error-message {
  background: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  color: #f56c6c;
}

.order-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  color: #666;
  font-weight: 500;
}

.value {
  color: #333;
  font-weight: 600;
}

.price {
  color: #f56c6c;
  font-size: 1.2rem;
}

.failure-reasons {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
}

.failure-reasons h4 {
  margin: 0 0 1rem 0;
  color: #333;
}

.failure-reasons ul {
  margin: 0;
  padding-left: 1.5rem;
}

.failure-reasons li {
  color: #666;
  margin-bottom: 0.5rem;
}

.result-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.result-actions .el-button {
  min-width: 200px;
}

@media (max-width: 768px) {
  .payment-result {
    padding: 1rem;
  }
  
  .result-card {
    padding: 2rem 1rem;
  }
  
  .result-title {
    font-size: 1.5rem;
  }
  
  .result-actions .el-button {
    width: 100%;
    min-width: auto;
  }
}
</style>
