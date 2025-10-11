<template>
  <div class="ai-config-manager">
    <!-- 页面标题 -->
    <el-alert
      type="info"
      :closable="false"
      class="mb-4"
    >
      <template #title>
        <div class="flex items-center justify-between">
          <span>AI模型配置</span>
          <el-button
            v-if="hasLocalConfigs"
            type="warning"
            size="small"
            @click="migrateConfigs"
          >
            <el-icon><Upload /></el-icon>
            迁移本地配置
          </el-button>
        </div>
      </template>
      <p class="text-sm">配置AI模型以启用智能创作功能。系统提供免费模型，会员可添加自定义配置。</p>
    </el-alert>

    <!-- 系统配置 -->
    <el-card class="mb-4" shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold">
            <el-icon><Platform /></el-icon>
            系统提供的AI模型
          </span>
          <el-tag size="small" type="success">免费使用</el-tag>
        </div>
      </template>

      <div v-if="loading" class="text-center py-8">
        <el-icon class="is-loading" size="32"><Loading /></el-icon>
        <p class="mt-2 text-gray-500">加载中...</p>
      </div>

      <el-empty
        v-else-if="systemConfigs.length === 0"
        description="暂无系统配置，请联系管理员"
      />

      <div v-else class="space-y-3">
        <div
          v-for="config in systemConfigs"
          :key="config.id"
          class="config-item"
          :class="{ 'is-default': defaultConfigId === `system:${config.id}` }"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <el-tag :type="getProviderTagType(config.provider)">
                  {{ getProviderName(config.provider) }}
                </el-tag>
                <span class="font-medium">{{ config.name }}</span>
                <el-tag v-if="config.isDefault" type="success" size="small">推荐</el-tag>
                <el-tag v-if="!config.enabled" type="info" size="small">已停用</el-tag>
              </div>
              <div class="text-sm text-gray-600">
                <p>模型: {{ config.model }}</p>
                <p v-if="config.description">{{ config.description }}</p>
                <p v-if="config.limits" class="text-xs text-gray-500 mt-1">
                  限制: 每日{{ config.limits.dailyLimit }}次 | 最大{{ config.limits.maxTokens }}tokens
                </p>
              </div>
            </div>
            <div class="flex gap-2">
              <el-button
                v-if="config.enabled && defaultConfigId !== `system:${config.id}`"
                type="primary"
                size="small"
                @click="useSystemConfig(`system:${config.id}`)"
              >
                使用此配置
              </el-button>
              <el-tag v-else-if="defaultConfigId === `system:${config.id}`" type="success">
                当前使用
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 用户自定义配置 -->
    <el-card shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold">
            <el-icon><Setting /></el-icon>
            我的自定义配置
          </span>
          <el-button type="primary" size="small" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            添加配置
          </el-button>
        </div>
      </template>

      <el-empty
        v-if="userConfigs.length === 0"
        description="暂无自定义配置"
      >
        <el-button type="primary" @click="showCreateDialog = true">添加第一个配置</el-button>
      </el-empty>

      <div v-else class="space-y-3">
        <div
          v-for="config in userConfigs"
          :key="config.id"
          class="config-item"
          :class="{ 'is-default': defaultConfigId === `user:${config.id}` }"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <el-tag :type="getProviderTagType(config.provider)">
                  {{ getProviderName(config.provider) }}
                </el-tag>
                <span class="font-medium">{{ config.name }}</span>
                <el-tag v-if="config.isDefault" type="success" size="small">默认</el-tag>
                <el-tag v-if="!config.enabled" type="info" size="small">已停用</el-tag>
              </div>
              <div class="text-sm text-gray-600">
                <p>模型: {{ config.model }}</p>
                <p>URL: {{ config.apiUrl }}</p>
              </div>
            </div>
            <div class="flex gap-2">
              <el-button
                v-if="config.enabled && !config.isDefault"
                type="primary"
                size="small"
                @click="setAsDefault(config.id)"
              >
                设为默认
              </el-button>
              <el-button
                size="small"
                @click="editConfig(config)"
              >
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="deleteConfig(config.id)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 创建/编辑配置对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingConfig ? '编辑配置' : '添加AI配置'"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="配置名称" prop="name">
          <el-input
            v-model="form.name"
            placeholder="例如：我的GPT-4"
          />
        </el-form-item>

        <el-form-item label="服务商" prop="provider">
          <el-select v-model="form.provider" placeholder="选择AI服务商" class="w-full">
            <el-option label="OpenAI" value="OPENAI" />
            <el-option label="Claude (Anthropic)" value="CLAUDE" />
            <el-option label="文心一言" value="WENXIN" />
            <el-option label="通义千问" value="QWEN" />
            <el-option label="智谱AI" value="ZHIPU" />
            <el-option label="自定义" value="CUSTOM" />
          </el-select>
        </el-form-item>

        <el-form-item label="模型名称" prop="model">
          <el-input
            v-model="form.model"
            placeholder="例如：gpt-4, claude-3-opus"
          />
        </el-form-item>

        <el-form-item label="API地址" prop="apiUrl">
          <el-input
            v-model="form.apiUrl"
            placeholder="https://api.openai.com/v1/chat/completions"
          />
        </el-form-item>

        <el-form-item label="API密钥" prop="apiKey">
          <el-input
            v-model="form.apiKey"
            type="password"
            show-password
            placeholder="输入API密钥"
          />
        </el-form-item>

        <el-form-item label="启用">
          <el-switch v-model="form.enabled" />
        </el-form-item>

        <el-form-item label="设为默认">
          <el-switch v-model="form.isDefault" />
        </el-form-item>

        <el-divider>高级参数</el-divider>

        <el-form-item label="温度">
          <el-slider
            v-model="form.parameters.temperature"
            :min="0"
            :max="2"
            :step="0.1"
            show-input
          />
          <span class="text-xs text-gray-500">控制输出的随机性，值越大越随机</span>
        </el-form-item>

        <el-form-item label="最大Tokens">
          <el-input-number
            v-model="form.parameters.maxTokens"
            :min="100"
            :max="8000"
            :step="100"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="flex justify-between">
          <el-button @click="testConnection" :loading="testing">
            <el-icon><Connection /></el-icon>
            测试连接
          </el-button>
          <div>
            <el-button @click="showCreateDialog = false">取消</el-button>
            <el-button type="primary" @click="submitForm" :loading="submitting">
              {{ editingConfig ? '保存' : '创建' }}
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Platform,
  Setting,
  Plus,
  Edit,
  Delete,
  Loading,
  Upload,
  Connection
} from '@element-plus/icons-vue'
import { aiConfigService } from '@/services/aiConfigService'

// 状态
const loading = ref(false)
const testing = ref(false)
const submitting = ref(false)
const systemConfigs = ref([])
const userConfigs = ref([])
const defaultConfigId = ref('')
const showCreateDialog = ref(false)
const editingConfig = ref(null)
const formRef = ref(null)

// 表单数据
const form = reactive({
  name: '',
  provider: 'OPENAI',
  model: '',
  apiUrl: '',
  apiKey: '',
  enabled: true,
  isDefault: false,
  parameters: {
    temperature: 0.7,
    maxTokens: 2000,
    topP: 1.0,
    frequencyPenalty: 0,
    presencePenalty: 0
  }
})

// 表单验证
const rules = {
  name: [{ required: true, message: '请输入配置名称', trigger: 'blur' }],
  provider: [{ required: true, message: '请选择服务商', trigger: 'change' }],
  model: [{ required: true, message: '请输入模型名称', trigger: 'blur' }],
  apiUrl: [{ required: true, message: '请输入API地址', trigger: 'blur' }],
  apiKey: [{ required: true, message: '请输入API密钥', trigger: 'blur' }]
}

// 检查是否有本地配置
const hasLocalConfigs = computed(() => {
  try {
    const local = localStorage.getItem('aiApiConfigs')
    return local && JSON.parse(local).length > 0
  } catch {
    return false
  }
})

// 加载配置
const loadConfigs = async () => {
  loading.value = true
  try {
    const configs = await aiConfigService.getAvailableConfigs()
    systemConfigs.value = configs.system
    userConfigs.value = configs.user
    defaultConfigId.value = configs.default
  } catch (error) {
    console.error('加载配置失败:', error)
    ElMessage.error('加载配置失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 使用系统配置
const useSystemConfig = (configId) => {
  defaultConfigId.value = configId
  ElMessage.success('已切换到系统配置')
}

// 设为默认
const setAsDefault = async (configId) => {
  try {
    await aiConfigService.setDefaultConfig(configId)
    defaultConfigId.value = `user:${configId}`
    await loadConfigs()
    ElMessage.success('默认配置已更新')
  } catch (error) {
    ElMessage.error('设置失败：' + error.message)
  }
}

// 编辑配置
const editConfig = (config) => {
  editingConfig.value = config
  Object.assign(form, {
    name: config.name,
    provider: config.provider,
    model: config.model,
    apiUrl: config.apiUrl,
    apiKey: '', // 不显示原密钥
    enabled: config.enabled,
    isDefault: config.isDefault,
    parameters: { ...config.parameters }
  })
  showCreateDialog.value = true
}

// 删除配置
const deleteConfig = async (configId) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除此配置吗？此操作不可恢复。',
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await aiConfigService.deleteConfig(configId)
    await loadConfigs()
    ElMessage.success('配置已删除')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败：' + error.message)
    }
  }
}

// 测试连接
const testConnection = async () => {
  if (!form.apiUrl || !form.apiKey) {
    ElMessage.warning('请先填写API地址和密钥')
    return
  }

  testing.value = true
  try {
    const result = await aiConfigService.testConfig({
      provider: form.provider,
      apiUrl: form.apiUrl,
      apiKey: form.apiKey,
      model: form.model,
      parameters: form.parameters
    })

    if (result.success) {
      ElMessage.success(`连接成功！响应时间: ${result.responseTime}ms`)
    } else {
      ElMessage.error('连接失败：' + result.message)
    }
  } catch (error) {
    ElMessage.error('测试失败：' + error.message)
  } finally {
    testing.value = false
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    submitting.value = true

    if (editingConfig.value) {
      // 更新配置
      const updateData = { ...form }
      if (!updateData.apiKey) {
        delete updateData.apiKey // 如果没有输入新密钥，不更新
      }
      await aiConfigService.updateConfig(editingConfig.value.id, updateData)
      ElMessage.success('配置已更新')
    } else {
      // 创建配置
      await aiConfigService.createConfig(form)
      ElMessage.success('配置已创建')
    }

    showCreateDialog.value = false
    await loadConfigs()
  } catch (error) {
    if (error !== false) { // 表单验证失败
      ElMessage.error('操作失败：' + error.message)
    }
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  editingConfig.value = null
  Object.assign(form, {
    name: '',
    provider: 'OPENAI',
    model: '',
    apiUrl: '',
    apiKey: '',
    enabled: true,
    isDefault: false,
    parameters: {
      temperature: 0.7,
      maxTokens: 2000,
      topP: 1.0,
      frequencyPenalty: 0,
      presencePenalty: 0
    }
  })
  formRef.value?.clearValidate()
}

// 迁移配置
const migrateConfigs = async () => {
  try {
    await ElMessageBox.confirm(
      '这将把您的本地配置迁移到云端，迁移后本地配置将被备份并清除。是否继续？',
      '配置迁移',
      {
        confirmButtonText: '开始迁移',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const result = await aiConfigService.migrateLocalConfigs()
    if (result.success) {
      ElMessage.success(`成功迁移 ${result.migrated} 个配置`)
      await loadConfigs()
    } else {
      ElMessage.error('迁移失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('迁移失败：' + error.message)
    }
  }
}

// 获取服务商名称
const getProviderName = (provider) => {
  const names = {
    OPENAI: 'OpenAI',
    CLAUDE: 'Claude',
    WENXIN: '文心一言',
    QWEN: '通义千问',
    ZHIPU: '智谱AI',
    CUSTOM: '自定义'
  }
  return names[provider] || provider
}

// 获取服务商标签类型
const getProviderTagType = (provider) => {
  const types = {
    OPENAI: 'success',
    CLAUDE: 'warning',
    WENXIN: 'danger',
    QWEN: 'info',
    ZHIPU: 'primary',
    CUSTOM: ''
  }
  return types[provider] || ''
}

// 初始化
onMounted(() => {
  loadConfigs()
})
</script>

<style scoped>
.ai-config-manager {
  max-width: 1200px;
  margin: 0 auto;
}

.config-item {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.3s;
}

.config-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.config-item.is-default {
  border-color: #10b981;
  background-color: #f0fdf4;
}

.space-y-3 > * + * {
  margin-top: 12px;
}

.mb-4 {
  margin-bottom: 16px;
}

.w-full {
  width: 100%;
}
</style>

