<template>
  <div class="system-settings">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>系统设置</h1>
      <div class="header-actions">
        <el-button type="primary" @click="saveAllSettings" :loading="saving">
          <el-icon><Check /></el-icon>
          保存设置
        </el-button>
        <el-button @click="refreshData" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 设置选项卡 -->
    <el-card class="settings-card">
      <el-tabs v-model="activeTab" class="settings-tabs">
        <!-- 站点配置 -->
        <el-tab-pane label="站点配置" name="site">
          <div class="setting-section">
            <el-form :model="settings.site" label-width="120px">
              <el-form-item label="站点名称">
                <el-input v-model="settings.site.siteName" placeholder="请输入站点名称" />
              </el-form-item>
              
              <el-form-item label="站点描述">
                <el-input
                  v-model="settings.site.siteDescription"
                  type="textarea"
                  rows="3"
                  placeholder="请输入站点描述"
                />
              </el-form-item>
              
              <el-form-item label="站点Logo">
                <el-input v-model="settings.site.logo" placeholder="Logo URL" />
              </el-form-item>
              
              <el-form-item label="站点图标">
                <el-input v-model="settings.site.favicon" placeholder="Favicon URL" />
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 支付配置 -->
        <el-tab-pane label="支付配置" name="payment">
          <div class="setting-section">
            <h3>支付宝配置</h3>
            <el-form :model="settings.payment.alipay" label-width="120px">
              <el-form-item label="启用支付宝">
                <el-switch v-model="settings.payment.alipay.enabled" />
              </el-form-item>
              
              <el-form-item label="沙箱模式">
                <el-switch v-model="settings.payment.alipay.sandbox" />
              </el-form-item>
              
              <el-form-item label="应用ID">
                <el-input v-model="settings.payment.alipay.appId" placeholder="支付宝应用ID" />
              </el-form-item>
            </el-form>

            <el-divider />

            <h3>微信支付配置</h3>
            <el-form :model="settings.payment.wechat" label-width="120px">
              <el-form-item label="启用微信支付">
                <el-switch v-model="settings.payment.wechat.enabled" />
              </el-form-item>
              
              <el-form-item label="沙箱模式">
                <el-switch v-model="settings.payment.wechat.sandbox" />
              </el-form-item>
              
              <el-form-item label="应用ID">
                <el-input v-model="settings.payment.wechat.appId" placeholder="微信应用ID" />
              </el-form-item>
              
              <el-form-item label="商户号">
                <el-input v-model="settings.payment.wechat.mchId" placeholder="微信商户号" />
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 邮件配置 -->
        <el-tab-pane label="邮件配置" name="email">
          <div class="setting-section">
            <el-form :model="settings.email" label-width="120px">
              <el-form-item label="启用邮件">
                <el-switch v-model="settings.email.enabled" />
              </el-form-item>
              
              <el-form-item label="邮件服务商">
                <el-select v-model="settings.email.provider" style="width: 100%;">
                  <el-option label="SMTP" value="smtp" />
                  <el-option label="阿里云邮推" value="aliyun" />
                  <el-option label="腾讯云邮件" value="tencent" />
                </el-select>
              </el-form-item>
              
              <template v-if="settings.email.provider === 'smtp'">
                <el-form-item label="SMTP服务器">
                  <el-input v-model="settings.email.smtp.host" placeholder="smtp.example.com" />
                </el-form-item>
                
                <el-form-item label="端口">
                  <el-input-number v-model="settings.email.smtp.port" :min="1" :max="65535" style="width: 100%;" />
                </el-form-item>
                
                <el-form-item label="安全连接">
                  <el-switch v-model="settings.email.smtp.secure" />
                </el-form-item>
                
                <el-form-item label="用户名">
                  <el-input v-model="settings.email.smtp.auth.user" placeholder="邮箱地址" />
                </el-form-item>
                
                <el-form-item label="密码">
                  <el-input v-model="settings.email.smtp.auth.pass" type="password" placeholder="邮箱密码或授权码" />
                </el-form-item>
              </template>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- AI配置 -->
        <el-tab-pane label="AI配置" name="ai">
          <div class="setting-section">
            <h3>OpenAI配置</h3>
            <el-form :model="settings.ai.openai" label-width="120px">
              <el-form-item label="启用OpenAI">
                <el-switch v-model="settings.ai.openai.enabled" />
              </el-form-item>
              
              <el-form-item label="API密钥">
                <el-input
                  v-model="settings.ai.openai.apiKey"
                  type="password"
                  placeholder="sk-..."
                  show-password
                />
              </el-form-item>
              
              <el-form-item label="默认模型">
                <el-select v-model="settings.ai.openai.model" style="width: 100%;">
                  <el-option label="GPT-3.5 Turbo" value="gpt-3.5-turbo" />
                  <el-option label="GPT-4" value="gpt-4" />
                  <el-option label="GPT-4 Turbo" value="gpt-4-turbo" />
                </el-select>
              </el-form-item>
              
              <el-form-item label="最大Token数">
                <el-input-number
                  v-model="settings.ai.openai.maxTokens"
                  :min="100"
                  :max="8000"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 安全配置 -->
        <el-tab-pane label="安全配置" name="security">
          <div class="setting-section">
            <h3>JWT配置</h3>
            <el-form :model="settings.security.jwt" label-width="120px">
              <el-form-item label="密钥">
                <el-input
                  v-model="settings.security.jwt.secret"
                  type="password"
                  placeholder="JWT密钥"
                  show-password
                />
              </el-form-item>
              
              <el-form-item label="过期时间">
                <el-input v-model="settings.security.jwt.expiresIn" placeholder="例如: 7d, 24h, 3600s" />
              </el-form-item>
            </el-form>

            <el-divider />

            <h3>密码加密</h3>
            <el-form :model="settings.security.bcrypt" label-width="120px">
              <el-form-item label="加密轮数">
                <el-input-number
                  v-model="settings.security.bcrypt.rounds"
                  :min="10"
                  :max="15"
                  style="width: 100%;"
                />
                <div class="form-tip">建议设置为12，数值越高越安全但性能越低</div>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 系统日志 -->
        <el-tab-pane label="系统日志" name="logs">
          <div class="setting-section">
            <div class="logs-header">
              <h3>系统日志</h3>
              <el-button type="primary" size="small" @click="refreshLogs" :loading="logsLoading">
                刷新日志
              </el-button>
            </div>
            
            <div class="logs-container">
              <el-table
                v-loading="logsLoading"
                :data="logs"
                style="width: 100%"
                max-height="400"
              >
                <el-table-column prop="timestamp" label="时间" width="180" />
                <el-table-column prop="level" label="级别" width="80">
                  <template #default="{ row }">
                    <el-tag :type="getLogLevelType(row.level)" size="small">
                      {{ row.level }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="message" label="消息" min-width="200" />
                <el-table-column prop="source" label="来源" width="120" />
              </el-table>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Check,
  Refresh
} from '@element-plus/icons-vue'
import { adminService } from '@/services/adminService'

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const logsLoading = ref(false)
const activeTab = ref('site')
const logs = ref([])

const settings = reactive({
  site: {
    siteName: '91Writing',
    siteDescription: '智能写作平台',
    logo: '/logo.png',
    favicon: '/favicon.ico'
  },
  payment: {
    alipay: {
      enabled: true,
      sandbox: true,
      appId: ''
    },
    wechat: {
      enabled: true,
      sandbox: true,
      appId: '',
      mchId: ''
    }
  },
  email: {
    enabled: true,
    provider: 'smtp',
    smtp: {
      host: '',
      port: 587,
      secure: false,
      auth: {
        user: '',
        pass: ''
      }
    }
  },
  ai: {
    openai: {
      enabled: true,
      apiKey: '',
      model: 'gpt-3.5-turbo',
      maxTokens: 2000
    }
  },
  security: {
    jwt: {
      secret: '',
      expiresIn: '7d'
    },
    bcrypt: {
      rounds: 12
    }
  }
})

// 方法
const loadSettings = async () => {
  loading.value = true
  try {
    const response = await adminService.getSystemConfig()
    
    if (response.success) {
      Object.assign(settings, response.data)
    } else {
      ElMessage.error('获取系统配置失败')
    }
  } catch (error) {
    console.error('加载系统配置失败:', error)
    ElMessage.error('加载系统配置失败')
  } finally {
    loading.value = false
  }
}

const saveAllSettings = async () => {
  saving.value = true
  try {
    const response = await adminService.updateSystemConfig(settings)
    
    if (response.success) {
      ElMessage.success('系统配置保存成功')
    } else {
      ElMessage.error('系统配置保存失败')
    }
  } catch (error) {
    console.error('保存系统配置失败:', error)
    ElMessage.error('保存系统配置失败')
  } finally {
    saving.value = false
  }
}

const refreshData = () => {
  loadSettings()
}

const refreshLogs = async () => {
  logsLoading.value = true
  try {
    const response = await adminService.getSystemLogs({
      page: 1,
      limit: 50
    })
    
    if (response.success) {
      logs.value = response.data.data || []
    }
  } catch (error) {
    console.error('获取系统日志失败:', error)
    ElMessage.error('获取系统日志失败')
  } finally {
    logsLoading.value = false
  }
}

const getLogLevelType = (level) => {
  const typeMap = {
    'ERROR': 'danger',
    'WARN': 'warning',
    'INFO': 'primary',
    'DEBUG': 'info'
  }
  return typeMap[level] || 'info'
}

// 生命周期
onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.system-settings {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.page-header h1 {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.settings-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: none;
}

.settings-tabs {
  min-height: 500px;
}

.setting-section {
  padding: 20px;
}

.setting-section h3 {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.logs-header h3 {
  margin: 0;
}

.logs-container {
  background: #f8f9fa;
  border-radius: 4px;
  padding: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .system-settings {
    padding: 12px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .setting-section {
    padding: 12px;
  }
  
  .logs-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>