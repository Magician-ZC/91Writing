<template>
  <div class="assistant-function-panel">
    <!-- 功能分类标签 -->
    <el-tabs v-model="activeTab" class="function-tabs">
      <el-tab-pane label="写作工具" name="writing">
        <div class="function-category">
          <div class="category-header">
            <h4>✍️ 写作创作工具</h4>
            <p>帮助您创作和续写内容</p>
          </div>
          
          <div class="function-list">
            <div 
              v-for="func in writingFunctions"
              :key="func.id"
              class="function-item"
              @click="useFunction(func)"
            >
              <div class="function-icon">{{ func.icon }}</div>
              <div class="function-info">
                <h5>{{ func.name }}</h5>
                <p>{{ func.description }}</p>
              </div>
              <el-icon class="function-arrow"><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="优化润色" name="optimization">
        <div class="function-category">
          <div class="category-header">
            <h4>✨ 优化润色工具</h4>
            <p>提升您文本的质量和表现力</p>
          </div>
          
          <div class="function-list">
            <div 
              v-for="func in optimizationFunctions"
              :key="func.id"
              class="function-item"
              @click="useFunction(func)"
            >
              <div class="function-icon">{{ func.icon }}</div>
              <div class="function-info">
                <h5>{{ func.name }}</h5>
                <p>{{ func.description }}</p>
              </div>
              <el-icon class="function-arrow"><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="分析咨询" name="analysis">
        <div class="function-category">
          <div class="category-header">
            <h4>📊 分析咨询工具</h4>
            <p>深入分析您的文本和创作</p>
          </div>
          
          <div class="function-list">
            <div 
              v-for="func in analysisFunctions"
              :key="func.id"
              class="function-item"
              @click="useFunction(func)"
            >
              <div class="function-icon">{{ func.icon }}</div>
              <div class="function-info">
                <h5>{{ func.name }}</h5>
                <p>{{ func.description }}</p>
              </div>
              <el-icon class="function-arrow"><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="创意灵感" name="inspiration">
        <div class="function-category">
          <div class="category-header">
            <h4>💡 创意灵感工具</h4>
            <p>激发您的创作灵感和想象力</p>
          </div>
          
          <div class="function-list">
            <div 
              v-for="func in inspirationFunctions"
              :key="func.id"
              class="function-item"
              @click="useFunction(func)"
            >
              <div class="function-icon">{{ func.icon }}</div>
              <div class="function-info">
                <h5>{{ func.name }}</h5>
                <p>{{ func.description }}</p>
              </div>
              <el-icon class="function-arrow"><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 自定义功能对话框 -->
    <el-dialog
      v-model="showCustomDialog"
      :title="selectedFunction?.name"
      width="500px"
      @close="closeCustomDialog"
    >
      <div v-if="selectedFunction" class="custom-function-form">
        <!-- 动态表单 -->
        <el-form :model="customForm" label-width="100px">
          <el-form-item 
            v-for="field in selectedFunction.fields"
            :key="field.key"
            :label="field.label"
          >
            <el-input
              v-if="field.type === 'text'"
              v-model="customForm[field.key]"
              :placeholder="field.placeholder"
            />
            <el-input
              v-else-if="field.type === 'textarea'"
              v-model="customForm[field.key]"
              type="textarea"
              :rows="3"
              :placeholder="field.placeholder"
            />
            <el-select
              v-else-if="field.type === 'select'"
              v-model="customForm[field.key]"
              :placeholder="field.placeholder"
            >
              <el-option
                v-for="option in field.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
            <el-slider
              v-else-if="field.type === 'slider'"
              v-model="customForm[field.key]"
              :min="field.min"
              :max="field.max"
              show-input
            />
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeCustomDialog">取消</el-button>
          <el-button type="primary" @click="executeCustomFunction">
            执行功能
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowRight } from '@element-plus/icons-vue'

// Emits
const emit = defineEmits(['use-function', 'close'])

// 响应式数据
const activeTab = ref('writing')
const showCustomDialog = ref(false)
const selectedFunction = ref(null)
const customForm = reactive({})

// 功能定义
const writingFunctions = ref([
  {
    id: 'continue_writing',
    name: '续写内容',
    description: '基于当前内容智能续写',
    icon: '✏️',
    prompt: '请帮我续写当前内容，保持风格一致'
  },
  {
    id: 'write_dialogue',
    name: '生成对话',
    description: '创作生动自然的对话',
    icon: '💬',
    prompt: '请帮我写一段对话，要生动自然'
  },
  {
    id: 'write_description',
    name: '环境描写',
    description: '创作详细的环境描述',
    icon: '🌅',
    prompt: '请帮我写一段环境描写，要富有画面感'
  },
  {
    id: 'write_action',
    name: '动作场景',
    description: '编写紧张刺激的动作场面',
    icon: '⚡',
    prompt: '请帮我写一个动作场面，要紧张刺激'
  },
  {
    id: 'write_emotion',
    name: '情感描写',
    description: '深入刻画角色内心情感',
    icon: '💭',
    prompt: '请帮我写一段情感描写，要细腻动人'
  },
  {
    id: 'write_opening',
    name: '章节开头',
    description: '创作引人入胜的章节开头',
    icon: '🎬',
    prompt: '请帮我写一个章节开头，要引人入胜'
  },
  {
    id: 'write_ending',
    name: '章节结尾',
    description: '编写令人回味的章节结尾',
    icon: '🎭',
    prompt: '请帮我写一个章节结尾，要令人回味'
  },
  {
    id: 'expand_scene',
    name: '展开场景',
    description: '将简单描述扩展为详细场景',
    icon: '🔍',
    prompt: '请帮我展开这个场景，增加更多细节'
  }
])

const optimizationFunctions = ref([
  {
    id: 'polish_language',
    name: '语言润色',
    description: '优化用词和表达方式',
    icon: '✨',
    prompt: '请帮我润色这段文字，让表达更优美'
  },
  {
    id: 'improve_readability',
    name: '可读性优化',
    description: '提高文本的可读性',
    icon: '👁️',
    prompt: '请帮我优化这段文字的可读性'
  },
  {
    id: 'enhance_emotion',
    name: '增强情感',
    description: '让文字更具情感表现力',
    icon: '💖',
    prompt: '请帮我增强这段文字的情感表现力'
  },
  {
    id: 'adjust_rhythm',
    name: '调整节奏',
    description: '优化文章的节奏感',
    icon: '🎵',
    prompt: '请帮我调整这段文字的节奏，让它更有韵律感'
  },
  {
    id: 'simplify_complex',
    name: '简化表达',
    description: '将复杂表达简化为通俗易懂',
    icon: '🎯',
    prompt: '请帮我简化这段复杂的表达'
  },
  {
    id: 'add_details',
    name: '丰富细节',
    description: '为文本添加生动的细节',
    icon: '🔬',
    prompt: '请帮我为这段文字添加更多生动的细节'
  },
  {
    id: 'fix_grammar',
    name: '语法校正',
    description: '检查和修正语法错误',
    icon: '📝',
    prompt: '请帮我检查并修正这段文字的语法问题'
  },
  {
    id: 'unify_style',
    name: '统一风格',
    description: '让文本风格保持一致',
    icon: '🎨',
    prompt: '请帮我统一这段文字的写作风格'
  }
])

const analysisFunctions = ref([
  {
    id: 'analyze_quality',
    name: '质量分析',
    description: '全面分析文本质量',
    icon: '📊',
    prompt: '请分析这段文字的整体质量，包括各个方面的表现'
  },
  {
    id: 'analyze_character',
    name: '角色分析',
    description: '分析角色塑造和发展',
    icon: '👥',
    prompt: '请分析这段文字中的角色塑造，给出改进建议'
  },
  {
    id: 'analyze_plot',
    name: '情节分析',
    description: '评估情节的合理性和吸引力',
    icon: '📖',
    prompt: '请分析这段情节的发展，评估其合理性和吸引力'
  },
  {
    id: 'analyze_structure',
    name: '结构分析',
    description: '检查文章的逻辑结构',
    icon: '🏗️',
    prompt: '请分析这段文字的结构布局，指出逻辑问题'
  },
  {
    id: 'find_issues',
    name: '问题诊断',
    description: '找出文本中的各种问题',
    icon: '🔍',
    prompt: '请帮我找出这段文字存在的问题并给出解决方案'
  },
  {
    id: 'compare_versions',
    name: '版本对比',
    description: '对比不同版本的文本',
    icon: '⚖️',
    custom: true,
    fields: [
      { key: 'version1', label: '版本一', type: 'textarea', placeholder: '输入第一个版本的文本' },
      { key: 'version2', label: '版本二', type: 'textarea', placeholder: '输入第二个版本的文本' }
    ]
  },
  {
    id: 'target_analysis',
    name: '读者分析',
    description: '分析文本对目标读者的适配性',
    icon: '🎯',
    custom: true,
    fields: [
      { 
        key: 'target_audience', 
        label: '目标读者', 
        type: 'select', 
        options: [
          { value: 'young', label: '年轻读者(18-25岁)' },
          { value: 'adult', label: '成年读者(25-35岁)' },
          { value: 'middle', label: '中年读者(35-45岁)' },
          { value: 'all', label: '全年龄段' }
        ]
      }
    ]
  }
])

const inspirationFunctions = ref([
  {
    id: 'brainstorm_plot',
    name: '情节脑洞',
    description: '生成创意情节发展方向',
    icon: '🧠',
    prompt: '请为我的故事生成一些创意情节发展方向'
  },
  {
    id: 'character_inspiration',
    name: '角色灵感',
    description: '激发角色设计的新想法',
    icon: '🎭',
    prompt: '请给我一些角色设计的创意灵感'
  },
  {
    id: 'scene_ideas',
    name: '场景创意',
    description: '提供有趣的场景设置想法',
    icon: '🎪',
    prompt: '请给我一些有趣的场景设置创意'
  },
  {
    id: 'conflict_generator',
    name: '冲突生成',
    description: '创造戏剧性的冲突设置',
    icon: '⚔️',
    prompt: '请帮我设计一些戏剧性的冲突情况'
  },
  {
    id: 'twist_ideas',
    name: '反转创意',
    description: '设计意想不到的剧情反转',
    icon: '🌪️',
    prompt: '请给我一些意想不到的剧情反转创意'
  },
  {
    id: 'world_building',
    name: '世界构建',
    description: '丰富小说的世界观设定',
    icon: '🌍',
    prompt: '请帮我丰富小说的世界观设定'
  },
  {
    id: 'title_generator',
    name: '标题生成',
    description: '为章节或作品生成吸引人的标题',
    icon: '🏷️',
    custom: true,
    fields: [
      { key: 'content_summary', label: '内容概要', type: 'textarea', placeholder: '简要描述章节或作品的主要内容' },
      { 
        key: 'title_style', 
        label: '标题风格', 
        type: 'select',
        options: [
          { value: 'dramatic', label: '戏剧性' },
          { value: 'mysterious', label: '神秘感' },
          { value: 'emotional', label: '情感化' },
          { value: 'direct', label: '直白型' },
          { value: 'artistic', label: '文艺型' }
        ]
      },
      { key: 'title_count', label: '生成数量', type: 'slider', min: 1, max: 10 }
    ]
  },
  {
    id: 'ending_variations',
    name: '结局变体',
    description: '探索不同的故事结局可能性',
    icon: '🎬',
    custom: true,
    fields: [
      { key: 'current_ending', label: '当前结局', type: 'textarea', placeholder: '描述当前的结局构想' },
      { 
        key: 'ending_tone', 
        label: '结局基调', 
        type: 'select',
        options: [
          { value: 'happy', label: '圆满结局' },
          { value: 'tragic', label: '悲剧结局' },
          { value: 'open', label: '开放结局' },
          { value: 'twist', label: '反转结局' },
          { value: 'bittersweet', label: '苦乐参半' }
        ]
      }
    ]
  }
])

// 方法
const useFunction = (func) => {
  if (func.custom) {
    openCustomDialog(func)
  } else {
    emit('use-function', {
      id: func.id,
      name: func.name,
      prompt: func.prompt
    })
  }
}

const openCustomDialog = (func) => {
  selectedFunction.value = func
  
  // 初始化表单
  Object.keys(customForm).forEach(key => {
    delete customForm[key]
  })
  
  func.fields.forEach(field => {
    customForm[field.key] = field.type === 'slider' ? field.min || 1 : ''
  })
  
  showCustomDialog.value = true
}

const closeCustomDialog = () => {
  showCustomDialog.value = false
  selectedFunction.value = null
}

const executeCustomFunction = () => {
  if (!selectedFunction.value) return
  
  // 验证必填字段
  const requiredFields = selectedFunction.value.fields.filter(f => f.required)
  const missingFields = requiredFields.filter(f => !customForm[f.key])
  
  if (missingFields.length > 0) {
    ElMessage.warning('请填写所有必填字段')
    return
  }
  
  // 构建自定义提示
  const prompt = buildCustomPrompt(selectedFunction.value, customForm)
  
  emit('use-function', {
    id: selectedFunction.value.id,
    name: selectedFunction.value.name,
    prompt,
    customData: { ...customForm }
  })
  
  closeCustomDialog()
}

const buildCustomPrompt = (func, formData) => {
  let prompt = ''
  
  switch (func.id) {
    case 'compare_versions':
      prompt = `请对比以下两个版本的文本，分析它们的差异和各自的优缺点：

版本一：
${formData.version1}

版本二：
${formData.version2}

请从可读性、表达力、逻辑性等角度进行详细对比。`
      break
      
    case 'target_analysis':
      const audienceMap = {
        young: '年轻读者(18-25岁)',
        adult: '成年读者(25-35岁)',
        middle: '中年读者(35-45岁)',
        all: '全年龄段读者'
      }
      prompt = `请分析这段文字对${audienceMap[formData.target_audience]}的适配性，评估语言风格、内容深度、兴趣点等是否符合目标读者的偏好。`
      break
      
    case 'title_generator':
      const styleMap = {
        dramatic: '戏剧性',
        mysterious: '神秘感',
        emotional: '情感化',
        direct: '直白型',
        artistic: '文艺型'
      }
      prompt = `请根据以下内容概要为我生成${formData.title_count}个${styleMap[formData.title_style]}风格的标题：

内容概要：${formData.content_summary}

要求标题具有强烈的${styleMap[formData.title_style]}特色，能够吸引读者注意。`
      break
      
    case 'ending_variations':
      const toneMap = {
        happy: '圆满',
        tragic: '悲剧',
        open: '开放',
        twist: '反转',
        bittersweet: '苦乐参半'
      }
      prompt = `请基于当前结局构想，为我设计一些${toneMap[formData.ending_tone]}风格的结局变体：

当前结局：${formData.current_ending}

请提供3-5个不同的${toneMap[formData.ending_tone]}结局方案，每个都要有独特的特色。`
      break
      
    default:
      prompt = '请执行相应的功能操作'
  }
  
  return prompt
}
</script>

<style scoped>
.assistant-function-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.function-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.function-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.function-category {
  padding: 20px;
}

.category-header {
  margin-bottom: 24px;
  text-align: center;
}

.category-header h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 18px;
}

.category-header p {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

.function-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.function-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.function-item:hover {
  background: #e3f2fd;
  border-color: #409eff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.function-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.function-info {
  flex: 1;
}

.function-info h5 {
  margin: 0 0 4px 0;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 600;
}

.function-info p {
  margin: 0;
  color: #7f8c8d;
  font-size: 12px;
  line-height: 1.4;
}

.function-arrow {
  color: #c0c4cc;
  font-size: 16px;
  flex-shrink: 0;
}

.function-item:hover .function-arrow {
  color: #409eff;
}

.custom-function-form {
  max-height: 400px;
  overflow-y: auto;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .function-category {
    padding: 16px 12px;
  }
  
  .function-item {
    padding: 12px;
    gap: 12px;
  }
  
  .function-icon {
    font-size: 20px;
  }
  
  .function-info h5 {
    font-size: 13px;
  }
  
  .function-info p {
    font-size: 11px;
  }
}

/* 标签页样式优化 */
.function-tabs :deep(.el-tabs__nav-wrap) {
  padding: 0 20px;
}

.function-tabs :deep(.el-tabs__item) {
  font-size: 14px;
  font-weight: 500;
}

/* 滚动条样式 */
.function-tabs :deep(.el-tabs__content)::-webkit-scrollbar,
.custom-function-form::-webkit-scrollbar {
  width: 6px;
}

.function-tabs :deep(.el-tabs__content)::-webkit-scrollbar-track,
.custom-function-form::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.function-tabs :deep(.el-tabs__content)::-webkit-scrollbar-thumb,
.custom-function-form::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.function-tabs :deep(.el-tabs__content)::-webkit-scrollbar-thumb:hover,
.custom-function-form::-webkit-scrollbar-thumb:hover {
  background: #a8abb2;
}
</style>
