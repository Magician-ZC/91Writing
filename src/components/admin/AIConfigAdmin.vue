<template>
  <div class="ai-config-admin">
    <el-alert type="info" :closable="false" class="mb-4">
      <template #title>全局AI配置</template>
      <p>配置系统提供的AI模型，供所有用户使用。可设置不同会员等级的访问权限和使用限制。</p>
    </el-alert>

    <!-- 模型列表 -->
    <div class="mb-4">
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        添加AI模型
      </el-button>
      <el-button @click="loadConfigs" :loading="loading">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="models"
      border
      style="width: 100%"
    >
      <el-table-column prop="name" label="模型名称" width="180">
        <template #default="{ row }">
          <div class="flex items-center gap-2">
            <el-tag :type="getProviderTagType(row.provider)" size="small">
              {{ getProviderName(row.provider) }}
            </el-tag>
            <span>{{ row.name }}</span>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column prop="model" label="模型ID" width="150" />
      
      <el-table-column label="会员等级" width="100">
        <template #default="{ row }">
          <el-tag :type="getTierTagType(row.tier)" size="small">
            {{ getTierName(row.tier) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column label="限制" width="200">
        <template #default="{ row }">
          <div v-if="row.limits" class="text-xs">
            <div>每日: {{ row.limits.dailyLimit || '-' }}次</div>
            <div>最大: {{ row.limits.maxTokens || '-' }} tokens</div>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-switch
            v-model="row.enabled"
            @change="toggleEnabled(row)"
          />
          <el-tag v-if="row.isDefault" type="success" size="small" class="ml-2">
            默认
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="testModel(row)">
            <el-icon><Connection /></el-icon>
            测试
          </el-button>
          <el-button size="small" @click="editModel(row)">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button
            v-if="!row.isDefault"
            size="small"
            type="primary"
            @click="setAsDefault(row)"
          >
            设为默认
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="deleteModel(row)"
          >
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingModel ? '编辑AI模型' : '添加AI模型'"
      width="700px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="模型名称" prop="name">
          <el-input v-model="form.name" placeholder="例如：GPT-4 Turbo" />
        </el-form-item>

        <el-form-item label="AI服务商" prop="provider">
          <el-select v-model="form.provider" class="w-full">
            <el-option label="OpenAI" value="OPENAI" />
            <el-option label="Claude (Anthropic)" value="CLAUDE" />
            <el-option label="DeepSeek" value="DEEPSEEK" />
            <el-option label="文心一言" value="WENXIN" />
            <el-option label="通义千问" value="QWEN" />
            <el-option label="智谱AI" value="ZHIPU" />
            <el-option label="自定义" value="CUSTOM" />
          </el-select>
        </el-form-item>

        <el-form-item label="模型ID" prop="model">
          <el-input v-model="form.model" placeholder="gpt-4-turbo, claude-3-opus" />
        </el-form-item>

        <el-form-item label="API地址" prop="apiUrl">
          <el-input v-model="form.apiUrl" placeholder="https://api.openai.com/v1/chat/completions" />
        </el-form-item>

        <el-form-item label="API密钥" prop="apiKey">
          <el-input
            v-model="form.apiKey"
            type="password"
            show-password
            placeholder="输入API密钥"
          />
        </el-form-item>

        <el-form-item label="会员等级" prop="tier">
          <el-select v-model="form.tier" class="w-full">
            <el-option label="免费用户" value="FREE" />
            <el-option label="基础会员" value="BASIC" />
            <el-option label="高级会员" value="PREMIUM" />
            <el-option label="无限制" value="UNLIMITED" />
          </el-select>
        </el-form-item>

        <el-form-item label="模型描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="2"
            placeholder="模型说明（可选）"
          />
        </el-form-item>

        <el-divider>使用限制</el-divider>

        <el-form-item label="每日限制">
          <el-input-number
            v-model="form.limits.dailyLimit"
            :min="0"
            placeholder="每日最多请求次数"
          />
          <span class="text-xs text-gray-500 ml-2">0表示不限制</span>
        </el-form-item>

        <el-form-item label="最大Tokens">
          <el-input-number
            v-model="form.limits.maxTokens"
            :min="100"
            :max="32000"
            :step="100"
          />
        </el-form-item>

        <el-form-item label="并发限制">
          <el-input-number
            v-model="form.limits.concurrentLimit"
            :min="1"
            :max="100"
          />
        </el-form-item>

        <el-divider>默认参数</el-divider>

        <el-form-item label="温度">
          <el-slider
            v-model="form.parameters.temperature"
            :min="0"
            :max="2"
            :step="0.1"
            show-input
          />
        </el-form-item>

        <el-form-item label="最大输出">
          <el-input-number
            v-model="form.parameters.maxTokens"
            :min="100"
            :max="8000"
            :step="100"
          />
        </el-form-item>

        <el-form-item label="启用">
          <el-switch v-model="form.enabled" />
        </el-form-item>

        <el-form-item label="设为默认">
          <el-switch v-model="form.isDefault" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="flex justify-between">
          <el-button @click="testConnection" :loading="testing">
            <el-icon><Connection /></el-icon>
            测试连接
          </el-button>
          <div>
            <el-button @click="showAddDialog = false">取消</el-button>
            <el-button type="primary" @click="submitForm" :loading="submitting">
              {{ editingModel ? '保存' : '添加' }}
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Refresh,
  Edit,
  Delete,
  Connection
} from '@element-plus/icons-vue'
import apiManager from '@/services/apiManager'

// 状态
const loading = ref(false)
const testing = ref(false)
const submitting = ref(false)
const models = ref([])
const showAddDialog = ref(false)
const editingModel = ref(null)
const formRef = ref(null)

// 表单数据
const form = reactive({
  id: '',
  name: '',
  provider: 'OPENAI',
  model: '',
  apiUrl: '',
  apiKey: '',
  tier: 'FREE',
  description: '',
  enabled: true,
  isDefault: false,
  limits: {
    dailyLimit: 100,
    maxTokens: 4000,
    concurrentLimit: 5
  },
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
  name: [{ required: true, message: '请输入模型名称', trigger: 'blur' }],
  provider: [{ required: true, message: '请选择服务商', trigger: 'change' }],
  model: [{ required: true, message: '请输入模型ID', trigger: 'blur' }],
  apiUrl: [{ required: true, message: '请输入API地址', trigger: 'blur' }],
  apiKey: [{ required: true, message: '请输入API密钥', trigger: 'blur' }],
  tier: [{ required: true, message: '请选择会员等级', trigger: 'change' }]
}

// 加载配置
const loadConfigs = async () => {
  loading.value = true
  try {
    const response = await apiManager.request('/api/v1/admin/ai-config/system', { method: 'GET' })
    models.value = response.data?.models || []
  } catch (error) {
    console.error('加载配置失败:', error)
    ElMessage.error('加载配置失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 切换启用状态
const toggleEnabled = async (model) => {
  try {
    await saveConfigs()
    ElMessage.success(model.enabled ? '已启用' : '已停用')
  } catch (error) {
    model.enabled = !model.enabled // 恢复状态
    ElMessage.error('操作失败：' + error.message)
  }
}

// 测试模型
const testModel = async (model) => {
  testing.value = true
  try {
    const response = await apiManager.request('/api/v1/admin/ai-config/test', {
      method: 'POST',
      data: {
        provider: model.provider,
        apiUrl: model.apiUrl,
        apiKey: model.apiKey,
        model: model.model,
        parameters: model.parameters
      }
    })

    if (response.data.success) {
      ElMessage.success(`连接成功！响应时间: ${response.data.responseTime}ms`)
    } else {
      ElMessage.error('连接失败：' + response.data.message)
    }
  } catch (error) {
    ElMessage.error('测试失败：' + error.message)
  } finally {
    testing.value = false
  }
}

// 编辑模型
const editModel = (model) => {
  editingModel.value = model
  Object.assign(form, {
    ...model,
    apiKey: '' // 不显示原密钥
  })
  showAddDialog.value = true
}

// 设为默认
const setAsDefault = async (model) => {
  models.value.forEach(m => {
    m.isDefault = m.id === model.id
  })
  await saveConfigs()
  ElMessage.success('默认模型已更新')
}

// 删除模型
const deleteModel = async (model) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除此模型配置吗？',
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const index = models.value.findIndex(m => m.id === model.id)
    if (index > -1) {
      models.value.splice(index, 1)
      await saveConfigs()
      ElMessage.success('模型已删除')
    }
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
    const response = await apiManager.request('/api/v1/admin/ai-config/test', {
      method: 'POST',
      data: {
        provider: form.provider,
        apiUrl: form.apiUrl,
        apiKey: form.apiKey,
        model: form.model,
        parameters: form.parameters
      }
    })

    if (response.data.success) {
      ElMessage.success(`连接成功！响应时间: ${response.data.responseTime}ms`)
    } else {
      ElMessage.error('连接失败：' + response.data.message)
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

    if (editingModel.value) {
      // 更新模型
      const index = models.value.findIndex(m => m.id === editingModel.value.id)
      if (index > -1) {
        const updateData = { ...form }
        if (!updateData.apiKey) {
          updateData.apiKey = editingModel.value.apiKey // 保持原密钥
        }
        models.value[index] = updateData
      }
    } else {
      // 添加模型
      const newModel = {
        ...form,
        id: `model-${Date.now()}`
      }
      models.value.push(newModel)
    }

    await saveConfigs()
    showAddDialog.value = false
    ElMessage.success(editingModel.value ? '模型已更新' : '模型已添加')
  } catch (error) {
    if (error !== false) {
      ElMessage.error('操作失败：' + error.message)
    }
  } finally {
    submitting.value = false
  }
}

// 保存配置到后端
const saveConfigs = async () => {
  try {
    await apiManager.request('/api/v1/admin/ai-config/system', {
      method: 'PUT',
      data: {
        models: models.value
      }
    })
  } catch (error) {
    throw new Error('保存失败：' + error.message)
  }
}

// 重置表单
const resetForm = () => {
  editingModel.value = null
  Object.assign(form, {
    id: '',
    name: '',
    provider: 'OPENAI',
    model: '',
    apiUrl: '',
    apiKey: '',
    tier: 'FREE',
    description: '',
    enabled: true,
    isDefault: false,
    limits: {
      dailyLimit: 100,
      maxTokens: 4000,
      concurrentLimit: 5
    },
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

// 辅助函数
const getProviderName = (provider) => {
  const names = {
    OPENAI: 'OpenAI',
    CLAUDE: 'Claude',
    DEEPSEEK: 'DeepSeek',
    WENXIN: '文心',
    QWEN: '千问',
    ZHIPU: '智谱',
    CUSTOM: '自定义'
  }
  return names[provider] || provider
}

const getProviderTagType = (provider) => {
  const types = {
    OPENAI: 'success',
    CLAUDE: 'warning',
    DEEPSEEK: 'primary',
    WENXIN: 'danger',
    QWEN: 'info',
    ZHIPU: 'primary',
    CUSTOM: ''
  }
  return types[provider] || ''
}

const getTierName = (tier) => {
  const names = {
    FREE: '免费',
    BASIC: '基础',
    PREMIUM: '高级',
    UNLIMITED: '无限'
  }
  return names[tier] || tier
}

const getTierTagType = (tier) => {
  const types = {
    FREE: 'info',
    BASIC: 'success',
    PREMIUM: 'warning',
    UNLIMITED: 'danger'
  }
  return types[tier] || ''
}

// 初始化
onMounted(() => {
  loadConfigs()
})
</script>

<style scoped>
.ai-config-admin {
  padding: 20px;
}

.mb-4 {
  margin-bottom: 16px;
}

.w-full {
  width: 100%;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.gap-2 {
  gap: 8px;
}

.justify-between {
  justify-content: space-between;
}

.ml-2 {
  margin-left: 8px;
}
</style>

