<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑角色' : '新建角色'"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="角色名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入角色名称" maxlength="50" show-word-limit />
      </el-form-item>

      <el-form-item label="角色定位" prop="role">
        <el-select v-model="form.role" placeholder="选择角色定位" style="width: 100%;">
          <el-option label="主角" value="PROTAGONIST" />
          <el-option label="配角" value="SUPPORTING" />
          <el-option label="反派" value="ANTAGONIST" />
          <el-option label="龙套" value="MINOR" />
          <el-option label="其他" value="OTHER" />
        </el-select>
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="年龄">
            <el-input v-model="form.age" placeholder="如：25岁" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="性别">
            <el-input v-model="form.gender" placeholder="如：男" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="重要性">
            <el-input-number v-model="form.importance" :min="0" :max="100" style="width: 100%;" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="职业">
        <el-input v-model="form.occupation" placeholder="请输入职业" />
      </el-form-item>

      <el-form-item label="别名/称号">
        <el-select
          v-model="form.aliases"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="输入后按回车添加"
          style="width: 100%;"
        >
        </el-select>
        <div class="form-hint">可以添加多个别名或称号</div>
      </el-form-item>

      <el-form-item label="外貌描写">
        <el-input
          v-model="form.appearance"
          type="textarea"
          :rows="3"
          placeholder="描述角色的外貌特征..."
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="性格描写">
        <el-input
          v-model="form.personality"
          type="textarea"
          :rows="3"
          placeholder="描述角色的性格特点..."
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="性格特质">
        <el-select
          v-model="form.personalityTraits"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="输入后按回车添加"
          style="width: 100%;"
        >
        </el-select>
        <div class="form-hint">添加性格特质标签，如：勇敢、智慧、正义</div>
      </el-form-item>

      <el-form-item label="背景故事">
        <el-input
          v-model="form.background"
          type="textarea"
          :rows="4"
          placeholder="描述角色的背景经历..."
          maxlength="1000"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="能力/技能">
        <el-input
          v-model="form.abilities"
          type="textarea"
          :rows="3"
          placeholder="描述角色的特殊能力或技能..."
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="目标/动机">
        <el-input
          v-model="form.goals"
          type="textarea"
          :rows="2"
          placeholder="角色的目标和行为动机..."
          maxlength="300"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="弱点/缺陷">
        <el-input
          v-model="form.weaknesses"
          type="textarea"
          :rows="2"
          placeholder="角色的弱点或性格缺陷..."
          maxlength="300"
          show-word-limit
        />
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
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useCharacterStore } from '@/stores/characterStore'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  character: {
    type: Object,
    default: null
  },
  novelId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const characterStore = useCharacterStore()

const visible = ref(false)
const loading = ref(false)
const formRef = ref(null)
const isEdit = ref(false)

// 表单数据
const form = reactive({
  name: '',
  role: 'SUPPORTING',
  age: '',
  gender: '',
  importance: 50,
  occupation: '',
  aliases: [],
  appearance: '',
  personality: '',
  personalityTraits: [],
  background: '',
  abilities: '',
  goals: '',
  weaknesses: ''
})

// 验证规则
const rules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 1, max: 50, message: '名称长度在1-50个字符', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色定位', trigger: 'change' }
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
  isEdit.value = !!props.character
  
  if (props.character) {
    // 编辑模式 - 填充数据
    Object.assign(form, {
      name: props.character.name || '',
      role: props.character.role || 'SUPPORTING',
      age: props.character.age || '',
      gender: props.character.gender || '',
      importance: props.character.importance || 50,
      occupation: props.character.occupation || '',
      aliases: props.character.aliases || [],
      appearance: props.character.appearance || '',
      personality: props.character.personality || '',
      personalityTraits: props.character.personalityTraits || [],
      background: props.character.background || '',
      abilities: props.character.abilities || '',
      goals: props.character.goals || '',
      weaknesses: props.character.weaknesses || ''
    })
  } else {
    // 新建模式 - 重置表单
    resetForm()
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    name: '',
    role: 'SUPPORTING',
    age: '',
    gender: '',
    importance: 50,
    occupation: '',
    aliases: [],
    appearance: '',
    personality: '',
    personalityTraits: [],
    background: '',
    abilities: '',
    goals: '',
    weaknesses: ''
  })
  formRef.value?.clearValidate()
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
        role: form.role,
        aliases: form.aliases.length > 0 ? form.aliases : undefined,
        importance: form.importance || undefined,
        age: form.age || undefined,
        gender: form.gender || undefined,
        occupation: form.occupation || undefined,
        appearance: form.appearance || undefined,
        personality: form.personality || undefined,
        personalityTraits: form.personalityTraits.length > 0 ? form.personalityTraits : undefined,
        background: form.background || undefined,
        abilities: form.abilities || undefined,
        goals: form.goals || undefined,
        weaknesses: form.weaknesses || undefined
      }

      if (isEdit.value) {
        // 更新角色
        await characterStore.updateCharacter(props.character.id, data)
      } else {
        // 创建角色
        await characterStore.createCharacter(data)
      }

      emit('success')
      handleClose()
    } catch (error) {
      console.error('保存角色失败:', error)
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

:deep(.el-form-item) {
  margin-bottom: 18px;
}

:deep(.el-input-number) {
  width: 100%;
}
</style>
