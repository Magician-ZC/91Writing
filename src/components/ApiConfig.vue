<template>
  <div class="api-config">
    <el-card class="config-card">
      <template #header>
        <div class="card-header">
          <span>AI模型配置</span>
          <el-tag :type="isApiConfigured ? 'success' : 'danger'" size="small">
            {{ isApiConfigured ? '已配置' : '未配置' }}
          </el-tag>
        </div>
      </template>
      
      <!-- 新功能引导 -->
      <div class="redirect-notice">
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
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Setting, Platform, Tools, Connection } from '@element-plus/icons-vue'
import { useNovelStore } from '../stores/novel.js'

const router = useRouter()
const store = useNovelStore()

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
</script>

<style scoped>
.api-config {
  padding: 20px;
  max-width: 100%;
}

.config-card {
  max-width: 1600px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

/* 响应式布局 */
@media (max-width: 768px) {
  .feature-highlights {
    padding: 15px;
  }
  
  .feature-card {
    margin-bottom: 15px;
  }
  
  .feature-icon {
    font-size: 36px;
  }
  
  .config-card {
    margin: 0 10px;
  }
}
</style>
