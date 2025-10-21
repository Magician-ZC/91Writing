<template>
  <div class="agent-prompt-config">
    <el-card class="config-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">
            <el-icon><cpu /></el-icon>
            Agent提示词配置管理
          </span>
          <el-button type="primary" :icon="Plus" @click="showCreateDialog">
            创建新配置
          </el-button>
        </div>
      </template>

      <!-- Agent类型选择 -->
      <el-tabs v-model="selectedAgentType" @tab-change="loadConfigs">
        <el-tab-pane label="分镜脚本Agent" name="SCRIPT_GENERATOR">
          <template #label>
            <span class="tab-label">
              <el-icon><Film /></el-icon>
              分镜脚本Agent
            </span>
          </template>
        </el-tab-pane>
        
        <el-tab-pane label="文生图Agent" name="IMAGE_OPTIMIZER">
          <template #label>
            <span class="tab-label">
              <el-icon><Picture /></el-icon>
              文生图Agent
            </span>
          </template>
        </el-tab-pane>
        
        <el-tab-pane label="图生视频Agent" name="VIDEO_OPTIMIZER">
          <template #label>
            <span class="tab-label">
              <el-icon><VideoCamera /></el-icon>
              图生视频Agent
            </span>
          </template>
        </el-tab-pane>
        
        <el-tab-pane label="一致性Agent" name="CONSISTENCY_KEEPER">
          <template #label>
            <span class="tab-label">
              <el-icon><Connection /></el-icon>
              一致性Agent
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>

      <!-- 配置列表 -->
      <div class="configs-list" v-loading="loading">
        <el-empty v-if="configs.length === 0" description="暂无配置" />
        
        <el-collapse v-else v-model="activeConfigs" accordion>
          <el-collapse-item 
            v-for="config in configs" 
            :key="config.id" 
            :name="config.id"
          >
            <template #title>
              <div class="config-title">
                <div class="title-left">
                  <el-tag v-if="config.isActive" type="success" size="small">
                    <el-icon><Select /></el-icon>
                    当前激活
                  </el-tag>
                  <span class="config-name">{{ config.name }}</span>
                  <el-tag type="info" size="small">v{{ config.version }}</el-tag>
                </div>
                <div class="title-right">
                  <el-statistic 
                    :value="config.successRate" 
                    suffix="%" 
                    title="成功率"
                    :value-style="{ fontSize: '14px', color: config.successRate >= 90 ? '#67c23a' : '#e6a23c' }"
                  />
                  <el-statistic 
                    :value="config.usageCount" 
                    title="使用次数"
                    :value-style="{ fontSize: '14px' }"
                  />
                </div>
              </div>
            </template>

            <!-- 配置详情 -->
            <div class="config-detail">
              <!-- 系统提示词 -->
              <el-form label-width="120px">
                <el-form-item label="配置描述">
                  <div class="description-text">{{ config.description || '无描述' }}</div>
                </el-form-item>

                <el-form-item label="系统提示词">
                  <el-input
                    :model-value="config.systemPrompt"
                    type="textarea"
                    :rows="8"
                    readonly
                    class="readonly-textarea"
                  />
                </el-form-item>

                <el-form-item label="模板提示词">
                  <el-input
                    :model-value="config.templatePrompt"
                    type="textarea"
                    :rows="6"
                    readonly
                    class="readonly-textarea"
                  />
                </el-form-item>

                <el-form-item label="参数配置">
                  <el-input
                    :model-value="JSON.stringify(config.parameters, null, 2)"
                    type="textarea"
                    :rows="4"
                    readonly
                    class="readonly-textarea"
                  />
                </el-form-item>

                <el-form-item label="统计信息">
                  <el-row :gutter="20">
                    <el-col :span="6">
                      <el-statistic title="使用次数" :value="config.usageCount" />
                    </el-col>
                    <el-col :span="6">
                      <el-statistic title="成功次数" :value="config.successCount" />
                    </el-col>
                    <el-col :span="6">
                      <el-statistic title="失败次数" :value="config.failureCount" />
                    </el-col>
                    <el-col :span="6">
                      <el-statistic title="成功率" :value="config.successRate" suffix="%" />
                    </el-col>
                  </el-row>
                </el-form-item>

                <el-form-item label="时间信息">
                  <div class="time-info">
                    <span>创建时间: {{ formatDate(config.createdAt) }}</span>
                    <span>更新时间: {{ formatDate(config.updatedAt) }}</span>
                  </div>
                </el-form-item>
              </el-form>

              <!-- 操作按钮 -->
              <div class="config-actions">
                <el-button 
                  type="primary" 
                  :icon="Edit" 
                  @click="showEditDialog(config)"
                >
                  编辑配置
                </el-button>
                <el-button 
                  type="success" 
                  :icon="CircleCheck" 
                  @click="activateConfig(config)"
                  :disabled="config.isActive"
                >
                  {{ config.isActive ? '已激活' : '设为激活' }}
                </el-button>
                <el-button 
                  type="info" 
                  :icon="DocumentCopy" 
                  @click="duplicateConfig(config)"
                >
                  复制版本
                </el-button>
                <el-button 
                  type="warning" 
                  :icon="Testing" 
                  @click="showTestDialog(config)"
                >
                  测试效果
                </el-button>
                <el-button 
                  type="danger" 
                  :icon="Delete" 
                  @click="deleteConfig(config)"
                  :disabled="config.isActive"
                >
                  删除
                </el-button>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-card>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="showDialog"
      :title="dialogMode === 'create' ? '创建Agent配置' : '编辑Agent配置'"
      width="900px"
      :close-on-click-modal="false"
    >
      <el-form :model="configForm" :rules="formRules" ref="formRef" label-width="120px">
        <el-form-item label="Agent类型" prop="agentType">
          <el-select 
            v-model="configForm.agentType" 
            placeholder="选择Agent类型"
            :disabled="dialogMode === 'edit'"
            style="width: 100%"
          >
            <el-option label="分镜脚本生成Agent" value="SCRIPT_GENERATOR">
              <span class="option-item">
                <el-icon><Film /></el-icon>
                分镜脚本生成Agent
              </span>
            </el-option>
            <el-option label="文生图优化Agent" value="IMAGE_OPTIMIZER">
              <span class="option-item">
                <el-icon><Picture /></el-icon>
                文生图优化Agent
              </span>
            </el-option>
            <el-option label="图生视频优化Agent" value="VIDEO_OPTIMIZER">
              <span class="option-item">
                <el-icon><VideoCamera /></el-icon>
                图生视频优化Agent
              </span>
            </el-option>
            <el-option label="一致性管理Agent" value="CONSISTENCY_KEEPER">
              <span class="option-item">
                <el-icon><Connection /></el-icon>
                一致性管理Agent
              </span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="配置名称" prop="name">
          <el-input 
            v-model="configForm.name" 
            placeholder="例如: 优化的分镜生成v2"
          />
        </el-form-item>

        <el-form-item label="配置描述" prop="description">
          <el-input 
            v-model="configForm.description" 
            type="textarea"
            :rows="2"
            placeholder="简要描述此配置的特点和改进"
          />
        </el-form-item>

        <el-form-item label="系统提示词" prop="systemPrompt">
          <el-input
            v-model="configForm.systemPrompt"
            type="textarea"
            :rows="10"
            placeholder="Agent的角色定义和基本指令"
          />
          <div class="form-tip">定义Agent的角色、能力和行为准则</div>
        </el-form-item>

        <el-form-item label="模板提示词" prop="templatePrompt">
          <el-input
            v-model="configForm.templatePrompt"
            type="textarea"
            :rows="8"
            placeholder="具体任务的提示词模板，可使用变量如 {content}, {chapter}"
          />
          <div class="form-tip">具体任务的提示词模板，支持变量替换</div>
        </el-form-item>

        <el-form-item label="参数配置" prop="parameters">
          <el-input
            v-model="parametersJson"
            type="textarea"
            :rows="5"
            placeholder='{"temperature": 0.7, "maxTokens": 2000}'
          />
          <div class="form-tip">JSON格式的附加参数（temperature、maxTokens等）</div>
        </el-form-item>

        <el-form-item label="是否启用">
          <el-switch 
            v-model="configForm.isActive"
            active-text="启用"
            inactive-text="禁用"
          />
          <div class="form-tip">启用后将立即替换当前激活的配置</div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleSubmit"
          :loading="saving"
        >
          {{ dialogMode === 'create' ? '创建' : '保存' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 测试对话框 -->
    <el-dialog
      v-model="showTestDialog_"
      title="测试Agent效果"
      width="1000px"
      :close-on-click-modal="false"
    >
      <el-form label-width="120px">
        <el-form-item label="测试输入">
          <el-input
            v-model="testForm.testInput"
            type="textarea"
            :rows="8"
            placeholder="输入测试内容（如章节内容、场景描述等）"
          />
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            :icon="Testing" 
            @click="runTest"
            :loading="testing"
          >
            执行测试
          </el-button>
        </el-form-item>

        <!-- 测试结果 -->
        <el-divider v-if="testResult">测试结果</el-divider>
        
        <div v-if="testResult" class="test-result">
          <el-alert
            :title="testResult.success ? '测试成功' : '测试失败'"
            :type="testResult.success ? 'success' : 'error'"
            :closable="false"
            show-icon
          >
            <div>耗时: {{ testResult.duration }}ms</div>
            <div v-if="testResult.tokenUsage">
              Token使用: 
              输入{{ testResult.tokenUsage.input }} + 
              输出{{ testResult.tokenUsage.output }} = 
              总计{{ testResult.tokenUsage.total }}
            </div>
          </el-alert>

          <el-form-item label="生成结果" v-if="testResult.success">
            <el-input
              :model-value="JSON.stringify(testResult.result, null, 2)"
              type="textarea"
              :rows="15"
              readonly
              class="result-textarea"
            />
          </el-form-item>

          <el-form-item label="错误信息" v-if="!testResult.success">
            <el-alert type="error" :title="testResult.error" :closable="false" />
          </el-form-item>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Cpu, 
  Plus, 
  Edit, 
  Delete, 
  CircleCheck, 
  DocumentCopy, 
  Testing,
  Film,
  Picture,
  VideoCamera,
  Connection,
  Select
} from '@element-plus/icons-vue'
import apiManager from '@/services/apiManager'

// 状态
const loading = ref(false)
const saving = ref(false)
const testing = ref(false)
const selectedAgentType = ref('SCRIPT_GENERATOR')
const configs = ref([])
const activeConfigs = ref([])
const showDialog = ref(false)
const showTestDialog_ = ref(false)
const dialogMode = ref('create') // 'create' | 'edit'
const formRef = ref(null)

// 配置表单
const configForm = reactive({
  id: '',
  agentType: 'SCRIPT_GENERATOR',
  name: '',
  systemPrompt: '',
  templatePrompt: '',
  parameters: {},
  description: '',
  isActive: true
})

// 测试表单
const testForm = reactive({
  agentType: 'SCRIPT_GENERATOR',
  systemPrompt: '',
  templatePrompt: '',
  testInput: '',
  parameters: {}
})

const testResult = ref(null)

// 参数JSON字符串
const parametersJson = computed({
  get: () => JSON.stringify(configForm.parameters || {}, null, 2),
  set: (val) => {
    try {
      configForm.parameters = JSON.parse(val)
    } catch (e) {
      // 保持原值
    }
  }
})

// 表单验证规则
const formRules = {
  agentType: [
    { required: true, message: '请选择Agent类型', trigger: 'change' }
  ],
  name: [
    { required: true, message: '请输入配置名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  systemPrompt: [
    { required: true, message: '请输入系统提示词', trigger: 'blur' },
    { min: 10, message: '系统提示词至少10个字符', trigger: 'blur' }
  ],
  templatePrompt: [
    { required: true, message: '请输入模板提示词', trigger: 'blur' },
    { min: 10, message: '模板提示词至少10个字符', trigger: 'blur' }
  ]
}

// Agent类型信息
const agentTypeInfo = {
  'SCRIPT_GENERATOR': {
    icon: 'Film',
    name: '分镜脚本生成Agent',
    description: '负责分析章节内容，生成3-8个分镜场景描述'
  },
  'IMAGE_OPTIMIZER': {
    icon: 'Picture',
    name: '文生图优化Agent',
    description: '负责将分镜描述优化为文生图提示词'
  },
  'VIDEO_OPTIMIZER': {
    icon: 'VideoCamera',
    name: '图生视频优化Agent',
    description: '负责生成视频运动提示词'
  },
  'CONSISTENCY_KEEPER': {
    icon: 'Connection',
    name: '一致性管理Agent',
    description: '负责管理角色、场景的视觉一致性'
  }
}

// 方法
const loadConfigs = async () => {
  loading.value = true
  try {
    const response = await apiManager.get('/admin/agent-prompts', {
      params: { agentType: selectedAgentType.value }
    })
    configs.value = response.data
  } catch (error) {
    ElMessage.error(error.message || '加载配置失败')
  } finally {
    loading.value = false
  }
}

const showCreateDialog = () => {
  dialogMode.value = 'create'
  Object.assign(configForm, {
    id: '',
    agentType: selectedAgentType.value,
    name: '',
    systemPrompt: '',
    templatePrompt: '',
    parameters: {
      temperature: 0.7,
      maxTokens: 2000
    },
    description: '',
    isActive: true
  })
  showDialog.value = true
}

const showEditDialog = (config) => {
  dialogMode.value = 'edit'
  Object.assign(configForm, {
    id: config.id,
    agentType: config.agentType,
    name: config.name,
    systemPrompt: config.systemPrompt,
    templatePrompt: config.templatePrompt,
    parameters: config.parameters || {},
    description: config.description,
    isActive: config.isActive
  })
  showDialog.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    saving.value = true
    try {
      // 解析参数JSON
      let params = configForm.parameters
      if (typeof params === 'string') {
        params = JSON.parse(params)
      }

      const data = {
        ...configForm,
        parameters: params
      }
      delete data.id

      if (dialogMode.value === 'create') {
        await apiManager.post('/admin/agent-prompts', data)
        ElMessage.success('配置创建成功')
      } else {
        await apiManager.put(`/admin/agent-prompts/${configForm.id}`, data)
        ElMessage.success('配置更新成功')
      }

      showDialog.value = false
      await loadConfigs()
    } catch (error) {
      ElMessage.error(error.message || '操作失败')
    } finally {
      saving.value = false
    }
  })
}

const activateConfig = async (config) => {
  try {
    await ElMessageBox.confirm(
      `设为激活后，将立即应用此配置。是否继续？`,
      '确认激活',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await apiManager.put(`/admin/agent-prompts/${config.id}`, {
      isActive: true
    })
    ElMessage.success('配置已激活')
    await loadConfigs()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '激活失败')
    }
  }
}

const duplicateConfig = (config) => {
  dialogMode.value = 'create'
  Object.assign(configForm, {
    id: '',
    agentType: config.agentType,
    name: `${config.name} (副本)`,
    systemPrompt: config.systemPrompt,
    templatePrompt: config.templatePrompt,
    parameters: config.parameters || {},
    description: config.description,
    isActive: false
  })
  showDialog.value = true
}

const deleteConfig = async (config) => {
  try {
    await ElMessageBox.confirm(
      `确定删除配置"${config.name}"吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await apiManager.delete(`/admin/agent-prompts/${config.id}`)
    ElMessage.success('配置已删除')
    await loadConfigs()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const showTestDialog = (config) => {
  Object.assign(testForm, {
    agentType: config.agentType,
    systemPrompt: config.systemPrompt,
    templatePrompt: config.templatePrompt,
    parameters: config.parameters || {},
    testInput: getDefaultTestInput(config.agentType)
  })
  testResult.value = null
  showTestDialog_.value = true
}

const runTest = async () => {
  if (!testForm.testInput.trim()) {
    ElMessage.warning('请输入测试内容')
    return
  }

  testing.value = true
  try {
    const response = await apiManager.post('/admin/agent-prompts/test', testForm)
    testResult.value = response.data
    ElMessage.success('测试完成')
  } catch (error) {
    ElMessage.error(error.message || '测试失败')
  } finally {
    testing.value = false
  }
}

const getDefaultTestInput = (agentType) => {
  const testInputs = {
    'SCRIPT_GENERATOR': '李明走进了古老的图书馆，阳光透过彩色玻璃窗洒在书架上...',
    'IMAGE_OPTIMIZER': '李明站在图书馆中央，周围是高耸的书架',
    'VIDEO_OPTIMIZER': '李明缓缓转头，目光扫过书架上的古籍',
    'CONSISTENCY_KEEPER': '李明，25岁男性，黑色短发，深邃的眼睛'
  }
  return testInputs[agentType] || '测试内容...'
}

const formatDate = (date) => {
  return new Date(date).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadConfigs()
})
</script>

<style scoped lang="scss">
.agent-prompt-config {
  padding: 20px;

  .config-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 18px;
        font-weight: 500;
      }
    }
  }

  .tab-label {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .configs-list {
    margin-top: 20px;

    .config-title {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-right: 20px;

      .title-left {
        display: flex;
        align-items: center;
        gap: 12px;

        .config-name {
          font-size: 16px;
          font-weight: 500;
        }
      }

      .title-right {
        display: flex;
        gap: 30px;
      }
    }
  }

  .config-detail {
    padding: 20px;
    background: #f5f7fa;
    border-radius: 4px;

    .description-text {
      color: #606266;
      line-height: 1.6;
    }

    .readonly-textarea {
      :deep(.el-textarea__inner) {
        background: #fff;
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 13px;
      }
    }

    .time-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
      color: #606266;
      font-size: 14px;
    }

    .config-actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #dcdfe6;
      justify-content: center;
    }
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }

  .option-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .test-result {
    margin-top: 20px;

    .result-textarea {
      :deep(.el-textarea__inner) {
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 13px;
      }
    }
  }
}
</style>
