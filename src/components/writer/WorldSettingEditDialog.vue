<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑世界观设定' : '新建世界观设定'"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="设定名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入设定名称" maxlength="100" show-word-limit />
      </el-form-item>

      <el-form-item label="类别" prop="category">
        <el-select v-model="form.category" placeholder="选择类别" style="width: 100%;">
          <el-option label="📍 地点位置" value="LOCATION" />
          <el-option label="🏛️ 组织机构" value="ORGANIZATION" />
          <el-option label="⚔️ 势力团体" value="FACTION" />
          <el-option label="✨ 魔法体系" value="MAGIC_SYSTEM" />
          <el-option label="🔮 修炼体系" value="CULTIVATION_SYSTEM" />
          <el-option label="🎁 物品道具" value="ITEM" />
          <el-option label="⚖️ 规则法则" value="LAW" />
          <el-option label="🌍 地理环境" value="GEOGRAPHY" />
          <el-option label="🎭 文化社会" value="CULTURE" />
          <el-option label="📜 历史背景" value="HISTORY" />
          <el-option label="👥 种族设定" value="RACE" />
          <el-option label="🔬 科技水平" value="TECHNOLOGY" />
          <el-option label="⚡ 能力设定" value="ABILITY" />
          <el-option label="🏰 建筑设施" value="BUILDING" />
          <el-option label="📝 其他设定" value="OTHER" />
        </el-select>
      </el-form-item>

      <el-form-item label="简介描述">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="简要描述这个设定..."
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <!-- 地点类特有字段 -->
      <template v-if="form.category === 'LOCATION' || form.category === 'GEOGRAPHY' || form.category === 'BUILDING'">
        <el-form-item label="位置信息">
          <el-input v-model="form.location" placeholder="如：位于大陆东部..." />
        </el-form-item>
      </template>

      <!-- 组织/势力类特有字段 -->
      <template v-if="form.category === 'ORGANIZATION' || form.category === 'FACTION'">
        <el-form-item label="领导层">
          <el-input v-model="form.leadership" placeholder="如：掌门人张三" />
        </el-form-item>
        
        <el-form-item label="势力强度">
          <el-slider v-model="form.power" :min="0" :max="100" show-input />
          <div class="form-hint">0-100，表示势力的强弱程度</div>
        </el-form-item>
      </template>

      <!-- 详细设定 -->
      <el-form-item label="详细设定">
        <div class="details-editor">
          <div v-for="(value, key, index) in form.details" :key="index" class="detail-row">
            <el-input
              v-model="detailKeys[index]"
              placeholder="属性名"
              style="width: 30%;"
              @input="updateDetailKey(index, $event)"
            />
            <el-input
              v-model="form.details[key]"
              placeholder="属性值"
              style="width: 60%; margin-left: 10px;"
            />
            <el-button
              type="danger"
              :icon="Delete"
              circle
              size="small"
              style="margin-left: 10px;"
              @click="removeDetail(key)"
            />
          </div>
          <el-button type="primary" text @click="addDetail">
            <el-icon><Plus /></el-icon>
            添加属性
          </el-button>
        </div>
        <div class="form-hint">添加结构化的详细设定，如"气候：四季分明"</div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">
        {{ isEdit ? '保存' : '创建' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import { useWorldStore } from '@/stores/worldStore'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  setting: {
    type: Object,
    default: null
  },
  novelId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const worldStore = useWorldStore()

const visible = ref(false)
const loading = ref(false)
const formRef = ref(null)
const isEdit = ref(false)

// 表单数据
const form = reactive({
  name: '',
  category: 'LOCATION',
  description: '',
  location: '',
  leadership: '',
  power: 50,
  details: {}
})

// 用于编辑details的辅助数组
const detailKeys = ref([])

// 验证规则
const rules = {
  name: [
    { required: true, message: '请输入设定名称', trigger: 'blur' },
    { min: 1, max: 100, message: '名称长度在1-100个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择设定类别', trigger: 'change' }
  ]
}

// 监听modelValue变化
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    initForm()
  }
})

// 监听visible变化
watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 初始化表单
const initForm = () => {
  isEdit.value = !!props.setting
  
  if (props.setting) {
    // 编辑模式 - 填充数据
    Object.assign(form, {
      name: props.setting.name || '',
      category: props.setting.category || 'LOCATION',
      description: props.setting.description || '',
      location: props.setting.location || '',
      leadership: props.setting.leadership || '',
      power: props.setting.power || 50,
      details: props.setting.details || {}
    })
    
    // 初始化detailKeys
    detailKeys.value = Object.keys(form.details)
  } else {
    // 新建模式 - 重置表单
    resetForm()
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    name: '',
    category: 'LOCATION',
    description: '',
    location: '',
    leadership: '',
    power: 50,
    details: {}
  })
  detailKeys.value = []
  formRef.value?.clearValidate()
}

// 添加详细设定项
const addDetail = () => {
  const newKey = `属性${Object.keys(form.details).length + 1}`
  form.details[newKey] = ''
  detailKeys.value.push(newKey)
}

// 删除详细设定项
const removeDetail = (key) => {
  delete form.details[key]
  const index = detailKeys.value.indexOf(key)
  if (index > -1) {
    detailKeys.value.splice(index, 1)
  }
}

// 更新详细设定的key
const updateDetailKey = (index, newKey) => {
  const oldKey = detailKeys.value[index]
  if (oldKey !== newKey && form.details[oldKey] !== undefined) {
    const value = form.details[oldKey]
    delete form.details[oldKey]
    form.details[newKey] = value
    detailKeys.value[index] = newKey
  }
}

// 提交
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      // 准备数据 - 严格按照后端DTO
      const data = {
        novelId: props.novelId,
        name: form.name,
        category: form.category,
        description: form.description || undefined,
        location: form.location || undefined,
        leadership: form.leadership || undefined,
        power: form.power || undefined,
        details: Object.keys(form.details).length > 0 ? form.details : undefined
      }

      if (isEdit.value) {
        // 更新设定
        await worldStore.updateSetting(props.setting.id, data)
      } else {
        // 创建设定
        await worldStore.createSetting(data)
      }

      emit('success')
      handleClose()
    } catch (error) {
      console.error('保存世界观设定失败:', error)
    } finally {
      loading.value = false
    }
  })
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
  resetForm()
}
</script>

<style scoped>
.form-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.details-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 12px;
  background: #f9f9f9;
}

.detail-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.detail-row:last-of-type {
  margin-bottom: 12px;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}

:deep(.el-slider) {
  margin-right: 12px;
}
</style>
