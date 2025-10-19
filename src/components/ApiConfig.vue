<template>
  <div class="api-config">
    <!-- 有配置时显示配置卡片 -->
    <div v-if="isApiConfigured && userConfigs.length > 0">
      <!-- 操作按钮 -->
      <div class="action-bar">
        <el-button type="primary" @click="goToAIConfig" round size="large">
          <el-icon><Setting /></el-icon>
          管理配置
        </el-button>
      </div>

      <!-- 配置卡片网格 -->
      <div class="configs-grid">
          <div 
            v-for="config in userConfigs" 
            :key="config.id"
            class="config-card"
            :class="{ 
              'is-default': defaultConfigId === `user:${config.id}`,
              'is-disabled': !config.enabled 
            }"
          >
            <!-- 卡片头部 -->
            <div class="card-header">
              <div class="provider-badge" :class="`provider-${config.provider.toLowerCase()}`">
                <div class="provider-icon">
                  <el-icon v-if="config.provider === 'OPENAI'"><Platform /></el-icon>
                  <el-icon v-else-if="config.provider === 'CLAUDE'"><Platform /></el-icon>
                  <el-icon v-else-if="config.provider === 'DEEPSEEK'"><Platform /></el-icon>
                  <el-icon v-else><Tools /></el-icon>
                </div>
              </div>
              <div class="status-badges">
                <el-tag 
                  v-if="defaultConfigId === `user:${config.id}`" 
                  effect="dark" 
                  type="success" 
                  size="small"
                  round
                >
                  ⭐ 默认
                </el-tag>
                <el-tag 
                  v-if="!config.enabled" 
                  effect="plain" 
                  type="info" 
                  size="small"
                  round
                >
                  已禁用
                </el-tag>
              </div>
            </div>

            <!-- 卡片内容 -->
            <div class="card-body">
              <div class="config-name">{{ config.name }}</div>
              <div class="config-provider">{{ getProviderName(config.provider) }}</div>
              
              <div class="config-model">
                <el-icon class="model-icon"><Connection /></el-icon>
                <span>{{ config.model }}</span>
              </div>
              
              <div class="config-params">
                <div class="param-item">
                  <span class="param-label">温度</span>
                  <span class="param-value">{{ config.parameters?.temperature || 0.7 }}</span>
                </div>
                <div class="param-item">
                  <span class="param-label">最大tokens</span>
                  <span class="param-value">{{ config.parameters?.maxTokens || 2000 }}</span>
                </div>
              </div>
            </div>

            <!-- 卡片底部装饰 -->
            <div class="card-footer">
              <div class="footer-pattern"></div>
            </div>
          </div>
      </div>
    </div>

    <!-- 无配置时显示引导 -->
    <div v-else class="redirect-notice">
        <el-result
          icon="info"
          title="请使用新的AI配置管理"
          sub-title="我们提供了更强大的AI配置管理功能，支持系统模型和自定义模型"
        >
          <template #extra>
            <el-button type="primary" size="large" @click="goToAIConfig">
              <el-icon><Setting /></el-icon>
              前往 AI 配置管理
            </el-button>
          </template>
        </el-result>

        <div class="feature-highlights">
          <h4>✨ 新功能特性</h4>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="feature-card">
                <el-icon class="feature-icon" color="#409eff"><Platform /></el-icon>
                <h5>系统模型</h5>
                <p>使用管理员配置的AI模型<br>无需自己配置，开箱即用</p>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="feature-card">
                <el-icon class="feature-icon" color="#67c23a"><Tools /></el-icon>
                <h5>自定义配置</h5>
                <p>添加您自己的API配置<br>支持多种AI服务商</p>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="feature-card">
                <el-icon class="feature-icon" color="#e6a23c"><Connection /></el-icon>
                <h5>连接测试</h5>
                <p>配置前可测试连接<br>确保配置正确可用</p>
              </div>
            </el-col>
          </el-row>
        </div>

        <el-divider />

        <div class="additional-info">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="📚 使用教程">
              <a href="https://www.bilibili.com/video/BV1keKgzaER2" target="_blank" style="margin-right: 16px;">API配置教程</a>
              <a href="https://www.bilibili.com/video/BV1AYKgzAEne" target="_blank">本地部署及线上部署教程</a>
            </el-descriptions-item>
            <el-descriptions-item label="💡 功能说明">
              在新的AI配置页面，您可以查看系统提供的模型，也可以添加您自己的自定义配置，支持OpenAI格式的所有大模型
            </el-descriptions-item>
            <el-descriptions-item label="✨ 主要优势">
              统一管理、配置测试、会员权限控制、更好的用户体验
            </el-descriptions-item>
          </el-descriptions>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Setting, Platform, Tools, Connection } from '@element-plus/icons-vue'
import { useNovelStore } from '../stores/novel.js'
import { aiConfigService } from '@/services/aiConfigService'

const router = useRouter()
const store = useNovelStore()

// 状态
const loading = ref(false)
const userConfigs = ref([])
const defaultConfigId = ref('')

// 定义emit
const emit = defineEmits(['close'])

// 跳转到新的AI配置页面
const goToAIConfig = () => {
  router.push('/settings')
  // 如果在对话框中，触发关闭事件
  emit('close')
}

// 检查是否已配置API
const isApiConfigured = computed(() => store.isApiConfigured)

// 加载配置
const loadConfigs = async () => {
  loading.value = true
  try {
    const configs = await aiConfigService.getAvailableConfigs()
    userConfigs.value = configs?.user || []
    defaultConfigId.value = configs?.default || ''
  } catch (error) {
    console.error('加载配置失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取服务商名称
const getProviderName = (provider) => {
  const names = {
    OPENAI: 'OpenAI',
    CLAUDE: 'Claude',
    DEEPSEEK: 'DeepSeek',
    WENXIN: '文心一言',
    QWEN: '通义千问',
    ZHIPU: '智谱AI',
    CUSTOM: '自定义'
  }
  return names[provider] || provider
}

// 初始化
onMounted(() => {
  loadConfigs()
})
</script>

<style scoped>
.api-config {
  padding: 24px;
  max-width: 100%;
  min-height: 400px;
}

/* 操作按钮栏 */
.action-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 24px;
}

/* 新的引导界面样式 */
.redirect-notice {
  padding: 20px;
}

.feature-highlights {
  margin: 30px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.feature-highlights h4 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #303133;
  font-size: 18px;
}

.feature-card {
  text-align: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.feature-card h5 {
  margin: 10px 0;
  font-size: 16px;
  color: #303133;
}

.feature-card p {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.additional-info {
  margin-top: 20px;
}

:deep(.el-descriptions__label) {
  font-weight: 600;
  width: 120px;
}

:deep(.el-result) {
  padding: 30px 20px;
}

:deep(.el-result__icon svg) {
  width: 80px;
  height: 80px;
}

:deep(.el-result__title) {
  font-size: 24px;
  font-weight: 600;
  margin-top: 20px;
}

:deep(.el-result__subtitle) {
  margin-top: 10px;
  margin-bottom: 20px;
}

/* 配置卡片网格 */
.configs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

/* 配置卡片 */
.config-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  cursor: pointer;
}

.config-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.config-card.is-default {
  box-shadow: 0 4px 20px rgba(103, 194, 58, 0.3);
}

.config-card.is-default::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #67c23a 0%, #85ce61 100%);
}

.config-card.is-disabled {
  opacity: 0.6;
}

/* 卡片头部 */
.card-header {
  padding: 20px 20px 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf0 100%);
}

.provider-badge {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.config-card:hover .provider-badge {
  transform: scale(1.05) rotate(5deg);
}

.provider-badge.provider-openai {
  background: linear-gradient(135deg, #10a37f 0%, #1a7f64 100%);
}

.provider-badge.provider-claude {
  background: linear-gradient(135deg, #d97757 0%, #c75a3f 100%);
}

.provider-badge.provider-deepseek {
  background: linear-gradient(135deg, #409eff 0%, #1c6ce3 100%);
}

.provider-badge.provider-wenxin {
  background: linear-gradient(135deg, #f56c6c 0%, #e03a3a 100%);
}

.provider-badge.provider-qwen {
  background: linear-gradient(135deg, #909399 0%, #73767a 100%);
}

.provider-badge.provider-zhipu {
  background: linear-gradient(135deg, #409eff 0%, #1c6ce3 100%);
}

.provider-badge.provider-custom {
  background: linear-gradient(135deg, #e6a23c 0%, #cf8b2a 100%);
}

.provider-icon {
  font-size: 28px;
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.status-badges {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
}

/* 卡片主体 */
.card-body {
  padding: 20px;
}

.config-name {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
  line-height: 1.4;
}

.config-provider {
  font-size: 14px;
  color: #909399;
  margin-bottom: 16px;
  font-weight: 500;
}

.config-model {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #f0f2f5;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #606266;
}

.model-icon {
  font-size: 16px;
  color: #409eff;
}

.config-params {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.param-item {
  padding: 10px;
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.param-label {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
}

.param-value {
  font-size: 16px;
  font-weight: 600;
  color: #409eff;
}

/* 卡片底部装饰 */
.card-footer {
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.footer-pattern {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}


/* 响应式布局 */
@media (max-width: 768px) {
  .api-config {
    padding: 16px;
  }

  .action-bar {
    margin-bottom: 16px;
  }
  
  .feature-highlights {
    padding: 15px;
  }
  
  .feature-card {
    margin-bottom: 15px;
  }
  
  .feature-icon {
    font-size: 36px;
  }
  
  .configs-grid {
    grid-template-columns: 1fr;
  }
  
  .provider-badge {
    width: 48px;
    height: 48px;
  }
  
  .provider-icon {
    font-size: 24px;
  }
  
  .card-body {
    padding: 16px;
  }
  
  .config-name {
    font-size: 18px;
  }
  
  .config-params {
    grid-template-columns: 1fr;
  }
}
</style>
