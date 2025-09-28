<template>
  <div class="payment-result">
    <div class="container">
      <div class="result-card success">
        <div class="result-icon">
          <el-icon size="64px"><CircleCheck /></el-icon>
        </div>
        
        <h1 class="result-title">支付成功！</h1>
        <p class="result-description">恭喜您，订阅已成功激活</p>
        
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
            <span class="label">支付时间：</span>
            <span class="value">{{ formatDate(orderInfo.paidAt) }}</span>
          </div>
        </div>
        
        <div class="result-actions">
          <el-button type="primary" size="large" @click="goToHome">
            返回首页
          </el-button>
          <el-button size="large" @click="viewSubscription">
            查看订阅
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CircleCheck } from '@element-plus/icons-vue'
import { paymentService } from '@/services/paymentService'

export default {
  name: 'PaymentSuccess',
  components: {
    CircleCheck
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const orderInfo = ref(null)

    const loadOrderInfo = async () => {
      try {
        const orderNo = route.query.orderNo
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

    const goToHome = () => {
      router.push('/')
    }

    const viewSubscription = () => {
      router.push('/subscription')
    }

    onMounted(() => {
      loadOrderInfo()
    })

    return {
      orderInfo,
      formatDate,
      goToHome,
      viewSubscription
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

.result-card.success {
  border-top: 4px solid #67c23a;
}

.result-icon {
  margin-bottom: 2rem;
  color: #67c23a;
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
  color: #67c23a;
  font-size: 1.2rem;
}

.result-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
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
  
  .result-actions {
    flex-direction: column;
  }
  
  .result-actions .el-button {
    width: 100%;
  }
}
</style>
