<template>
  <div class="agent-config">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="title">
            <el-icon><Setting /></el-icon>
            Agent提示词配置
          </span>
          <el-button type="primary" :icon="Plus" @click="createNew">
            创建新配置
          </el-button>
        </div>
      </template>

      <!-- Agent类型过滤 -->
      <el-radio-group v-model="filterAgentType" class="filter-group">
        <el-radio-button label="all">全部</el-radio-button>
        <el-radio-button label="SCRIPT_GENERATOR">分镜脚本</el-radio-button>
        <el-radio-button label="IMAGE_OPTIMIZER">文生图</el-radio-button>
        <el-radio-button label="VIDEO_OPTIMIZER">图生视频</el-radio-button>
        <el-radio-button label="CONSISTENCY_KEEPER">一致性</el-radio-button>
      </el-radio-group>

      <!-- 配置列表 -->
      <el-table 
        :data="filteredConfigs" 
        v-loading="loading"
        class="config-table"
      >
        <el-table-column prop="name" label="配置名称" min-width="200" />
        <el-table-column prop="agentType" label="Agent类型" width="150">
          <template #default="{ row }">
            <el-tag :type="agentTypeColor(row.agentType)">
              {{ agentTypeName(row.agentType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="version" label="版本" width="80" />
        <el-table-column prop="isActive" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'" size="small">
              {{ row.isActive ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="使用统计" width="180">
          <template #default="{ row }">
            <div class="stats">
              <span>总计: {{ row.usageCount }}</span>
              <el-tag type="success" size="small">成功: {{ row.successCount }}</el-tag>
              <el-tag type="danger" size="small">失败: {{ row.failureCount }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="successRate" label="成功率" width="100">
          <template #default="{ row }">
            <span :class="{ 'high-rate': row.successRate >= 90 }">
              {{ row.successRate }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewConfig(row)">查看</el-button>
            <el-button size="small" type="primary" @click="editConfig(row)">编辑</el-button>
            <el-button size="small" type="warning" @click="testConfig(row)">测试</el-button>
            <el-button 
              size="small" 
              :type="row.isActive ? 'info' : 'success'"
              @click="toggleActive(row)"
            >
              {{ row.isActive ? '停用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="showEditDialog"
      :title="editMode === 'create' ? '创建Agent配置' : '编辑Agent配置'"
      width="900px"
      :close-on-click-modal="false"
    >
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="Agent类型">
          <el-select v-model="editForm.agentType" :disabled="editMode === 'edit'">
            <el-option label="分镜脚本生成" value="SCRIPT_GENERATOR" />
            <el-option label="文生图优化" value="IMAGE_OPTIMIZER" />
            <el-option label="图生视频优化" value="VIDEO_OPTIMIZER" />
            <el-option label="一致性管理" value="CONSISTENCY_KEEPER" />
          </el-select>
        </el-form-item>

        <el-form-item label="配置名称">
          <el-input v-model="editForm.name" placeholder="例如：分镜脚本生成器 v2" />
        </el-form-item>

        <el-form-item label="系统提示词">
          <el-input
            v-model="editForm.systemPrompt"
            type="textarea"
            :rows="8"
            placeholder="输入系统提示词..."
            class="monospace-input"
          />
          <div class="form-tip">
            系统提示词定义了Agent的角色和基本能力
          </div>
        </el-form-item>

        <el-form-item label="模板提示词">
          <el-input
            v-model="editForm.templatePrompt"
            type="textarea"
            :rows="6"
            placeholder="输入模板提示词，支持变量..."
            class="monospace-input"
          />
          <div class="form-tip">
            模板提示词支持变量替换，如 {sceneCount}, {totalDuration}
          </div>
        </el-form-item>

        <el-form-item label="附加参数">
          <el-input
            v-model="editForm.parametersJson"
            type="textarea"
            :rows="3"
            placeholder='{"temperature": 0.7, "maxTokens": 2000}'
            class="monospace-input"
          />
          <div class="form-tip">
            JSON格式的附加参数配置
          </div>
        </el-form-item>

        <el-form-item label="配置描述">
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="2"
            placeholder="简要描述这个配置的用途和特点"
          />
        </el-form-item>

        <el-form-item label="启用状态">
          <el-switch v-model="editForm.isActive" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveEdit" :loading="saving">
          保存
        </el-button>
      </template>
    </el-dialog>

    <!-- 查看对话框 -->
    <el-dialog
      v-model="showViewDialog"
      title="配置详情"
      width="900px"
    >
      <el-descriptions :column="2" border v-if="viewingConfig">
        <el-descriptions-item label="配置ID">{{ viewingConfig.id }}</el-descriptions-item>
        <el-descriptions-item label="Agent类型">
          <el-tag :type="agentTypeColor(viewingConfig.agentType)">
            {{ agentTypeName(viewingConfig.agentType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="配置名称" :span="2">{{ viewingConfig.name }}</el-descriptions-item>
        <el-descriptions-item label="版本">v{{ viewingConfig.version }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="viewingConfig.isActive ? 'success' : 'info'">
            {{ viewingConfig.isActive ? '启用' : '停用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">
          {{ formatDate(viewingConfig.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间" :span="2">
          {{ formatDate(viewingConfig.updatedAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="系统提示词" :span="2">
          <pre class="prompt-display">{{ viewingConfig.systemPrompt }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="模板提示词" :span="2">
          <pre class="prompt-display">{{ viewingConfig.templatePrompt }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="附加参数" :span="2" v-if="viewingConfig.parameters">
          <pre class="prompt-display">{{ JSON.stringify(viewingConfig.parameters, null, 2) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="描述" :span="2" v-if="viewingConfig.description">
          {{ viewingConfig.description }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 测试对话框 -->
    <el-dialog
      v-model="showTestDialog"
      title="测试Agent配置"
      width="900px"
    >
      <el-form label-width="120px">
        <el-form-item label="测试输入">
          <el-input
            v-model="testInput"
            type="textarea"
            :rows="8"
            placeholder="输入测试内容..."
          />
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            @click="runTest"
            :loading="testing"
          >
            执行测试
          </el-button>
        </el-form-item>

        <el-divider v-if="testResult" />

        <el-form-item label="测试结果" v-if="testResult">
          <el-alert
            :title="testResult.success ? '测试成功' : '测试失败'"
            :type="testResult.success ? 'success' : 'error'"
            :closable="false"
            show-icon
          >
            <div v-if="testResult.success">
              <div>耗时: {{ testResult.duration }}ms</div>
              <div v-if="testResult.tokenUsage">
                Token使用: 输入{{ testResult.tokenUsage.input }} + 
                输出{{ testResult.tokenUsage.output }} = 
                总计{{ testResult.tokenUsage.total }}
              </div>
            </div>
            <div v-else>
              {{ testResult.error }}
            </div>
          </el-alert>

          <pre v-if="testResult.result" class="test-result">{{ JSON.stringify(testResult.result, null, 2) }}</pre>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Setting, Plus } from '@element-plus/icons-vue'
import apiManager from '@/services/apiManager'

// 状态
const loading = ref(false)
const saving = ref(false)
const testing = ref(false)
const configs = ref([])
const filterAgentType = ref('all')
const showEditDialog = ref(false)
const showViewDialog = ref(false)
const showTestDialog = ref(false)
const editMode = ref('create')
const viewingConfig = ref(null)
const testingConfig = ref(null)
const testInput = ref('')
const testResult = ref(null)

// 编辑表单
const editForm = ref({
  agentType: 'SCRIPT_GENERATOR',
  name: '',
  systemPrompt: '',
  templatePrompt: '',
  parametersJson: '{}',
  description: '',
  isActive: true
})

// 计算属性
const filteredConfigs = computed(() => {
  if (filterAgentType.value === 'all') {
    return configs.value
  }
  return configs.value.filter(c => c.agentType === filterAgentType.value)
})

// 方法
const loadConfigs = async () => {
  loading.value = true
  try {
    const response = await apiManager.get('/admin/agent-prompts')
    configs.value = response.data.map(config => ({
      ...config,
      successRate: config.usageCount > 0 
        ? Math.round((config.successCount / config.usageCount) * 100)
        : 0
    }))
  } catch (error) {
    ElMessage.error('加载配置失败')
  } finally {
    loading.value = false
  }
}

const createNew = () => {
  editMode.value = 'create'
  editForm.value = {
    agentType: 'SCRIPT_GENERATOR',
    name: '',
    systemPrompt: '',
    templatePrompt: '',
    parametersJson: '{}',
    description: '',
    isActive: true
  }
  showEditDialog.value = true
}

const editConfig = (config) => {
  editMode.value = 'edit'
  editForm.value = {
    id: config.id,
    agentType: config.agentType,
    name: config.name,
    systemPrompt: config.systemPrompt,
    templatePrompt: config.templatePrompt,
    parametersJson: JSON.stringify(config.parameters || {}, null, 2),
    description: config.description || '',
    isActive: config.isActive
  }
  showEditDialog.value = true
}

const viewConfig = (config) => {
  viewingConfig.value = config
  showViewDialog.value = true
}

const testConfig = (config) => {
  testingConfig.value = config
  testInput.value = ''
  testResult.value = null
  showTestDialog.value = true
}

const saveEdit = async () => {
  // 验证参数JSON
  let parameters = {}
  try {
    parameters = JSON.parse(editForm.value.parametersJson)
  } catch (error) {
    ElMessage.error('附加参数格式错误，请检查JSON格式')
    return
  }

  saving.value = true
  try {
    const data = {
      ...editForm.value,
      parameters
    }
    delete data.parametersJson

    if (editMode.value === 'create') {
      await apiManager.post('/admin/agent-prompts', data)
      ElMessage.success('创建成功')
    } else {
      await apiManager.put(`/admin/agent-prompts/${data.id}`, data)
      ElMessage.success('更新成功')
    }

    showEditDialog.value = false
    await loadConfigs()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const toggleActive = async (config) => {
  try {
    await apiManager.put(`/admin/agent-prompts/${config.id}`, {
      isActive: !config.isActive
    })
    config.isActive = !config.isActive
    ElMessage.success(config.isActive ? '已启用' : '已停用')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const runTest = async () => {
  if (!testInput.value.trim()) {
    ElMessage.warning('请输入测试内容')
    return
  }

  testing.value = true
  testResult.value = null

  try {
    const response = await apiManager.post('/admin/agent-prompts/test', {
      agentType: testingConfig.value.agentType,
      systemPrompt: testingConfig.value.systemPrompt,
      templatePrompt: testingConfig.value.templatePrompt,
      testInput: testInput.value,
      parameters: testingConfig.value.parameters
    })

    testResult.value = response.data
    ElMessage.success('测试完成')
  } catch (error) {
    testResult.value = {
      success: false,
      error: error.response?.data?.message || '测试失败'
    }
  } finally {
    testing.value = false
  }
}

const agentTypeName = (type) => {
  const names = {
    'SCRIPT_GENERATOR': '分镜脚本',
    'IMAGE_OPTIMIZER': '文生图优化',
    'VIDEO_OPTIMIZER': '图生视频',
    'CONSISTENCY_KEEPER': '一致性管理'
  }
  return names[type] || type
}

const agentTypeColor = (type) => {
  const colors = {
    'SCRIPT_GENERATOR': 'primary',
    'IMAGE_OPTIMIZER': 'success',
    'VIDEO_OPTIMIZER': 'warning',
    'CONSISTENCY_KEEPER': 'info'
  }
  return colors[type] || ''
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadConfigs()
})
</script>

<style scoped lang="scss">
.agent-config {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 500;
    }
  }

  .filter-group {
    margin-bottom: 20px;
  }

  .config-table {
    .stats {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 12px;
    }

    .high-rate {
      color: #67c23a;
      font-weight: 500;
    }
  }

  .monospace-input {
    :deep(textarea) {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 13px;
    }
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }

  .prompt-display {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 13px;
    background: #f5f7fa;
    padding: 12px;
    border-radius: 4px;
    max-height: 300px;
    overflow-y: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .test-result {
    margin-top: 12px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 13px;
    background: #f5f7fa;
    padding: 12px;
    border-radius: 4px;
    max-height: 400px;
    overflow-y: auto;
  }
}
</style>

