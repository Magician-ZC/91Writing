<template>
  <div class="tool-interface">
    <div class="tool-header">
      <div class="tool-info">
        <h3>{{ toolConfig.title }}</h3>
        <p>{{ toolConfig.description }}</p>
      </div>
      <div class="tool-icon">{{ toolConfig.icon }}</div>
    </div>
    
    <div class="tool-content">
      <!-- 工具参数表单 -->
      <div class="tool-form">
        <el-form :model="toolParams" label-width="120px" @submit.prevent="executeTool">
          <!-- 动态生成的表单字段 -->
          <template v-for="field in toolConfig.fields" :key="field.key">
            <!-- 文本输入 -->
            <el-form-item 
              v-if="field.type === 'input'"
              :label="field.label"
              :required="field.required"
            >
              <el-input
                v-model="toolParams[field.key]"
                :placeholder="field.placeholder"
                :type="field.inputType || 'text'"
              />
            </el-form-item>
            
            <!-- 文本域 -->
            <el-form-item 
              v-else-if="field.type === 'textarea'"
              :label="field.label"
              :required="field.required"
            >
              <el-input
                v-model="toolParams[field.key]"
                type="textarea"
                :rows="field.rows || 3"
                :placeholder="field.placeholder"
              />
            </el-form-item>
            
            <!-- 选择器 -->
            <el-form-item 
              v-else-if="field.type === 'select'"
              :label="field.label"
              :required="field.required"
            >
              <el-select
                v-model="toolParams[field.key]"
                :placeholder="field.placeholder"
                style="width: 100%"
              >
                <el-option
                  v-for="option in field.options"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
            
            <!-- 多选框 -->
            <el-form-item 
              v-else-if="field.type === 'checkbox'"
              :label="field.label"
            >
              <el-checkbox-group v-model="toolParams[field.key]">
                <el-checkbox
                  v-for="option in field.options"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            
            <!-- 数字输入 -->
            <el-form-item 
              v-else-if="field.type === 'number'"
              :label="field.label"
              :required="field.required"
            >
              <el-input-number
                v-model="toolParams[field.key]"
                :min="field.min || 1"
                :max="field.max || 100"
                :placeholder="field.placeholder"
              />
            </el-form-item>
          </template>
        </el-form>
      </div>
      
      <!-- 上下文信息显示 -->
      <div class="context-info" v-if="contextInfo">
        <h4>当前上下文</h4>
        <div class="context-content">
          <div class="context-item" v-if="contextInfo.concept">
            <strong>创意概念：</strong>{{ contextInfo.concept }}
          </div>
          <div class="context-item" v-if="contextInfo.genre">
            <strong>小说类型：</strong>{{ contextInfo.genre }}
          </div>
          <div class="context-item" v-if="contextInfo.worldType">
            <strong>世界类型：</strong>{{ contextInfo.worldType }}
          </div>
          <div class="context-item" v-if="contextInfo.protagonist">
            <strong>主角：</strong>{{ contextInfo.protagonist }}
          </div>
        </div>
      </div>
      
      <!-- 执行按钮 -->
      <div class="tool-actions">
        <el-button 
          type="primary" 
          @click="executeTool"
          :loading="executing"
          :disabled="!canExecute"
          size="large"
        >
          <el-icon><MagicStick /></el-icon>
          {{ executing ? '生成中...' : '执行工具' }}
        </el-button>
        
        <el-button @click="resetParams" :disabled="executing">
          重置参数
        </el-button>
      </div>
      
      <!-- 执行进度 -->
      <div class="execution-progress" v-if="executing">
        <el-progress :percentage="progress" />
        <div class="progress-text">{{ progressText }}</div>
      </div>
      
      <!-- 结果显示 -->
      <div class="tool-result" v-if="result">
        <h4>生成结果</h4>
        <div class="result-content">
          <!-- 文本结果 -->
          <div v-if="result.type === 'text'" class="text-result">
            <el-input
              v-model="result.content"
              type="textarea"
              :rows="10"
              readonly
              class="result-textarea"
            />
          </div>
          
          <!-- 列表结果 -->
          <div v-else-if="result.type === 'list'" class="list-result">
            <div 
              v-for="(item, index) in result.items"
              :key="index"
              class="list-item"
            >
              <div class="item-header">
                <h5>{{ item.title || `项目 ${index + 1}` }}</h5>
                <el-tag v-if="item.score" size="small">
                  评分: {{ item.score }}
                </el-tag>
              </div>
              <div class="item-content">{{ item.content }}</div>
            </div>
          </div>
          
          <!-- 结构化结果 -->
          <div v-else-if="result.type === 'structured'" class="structured-result">
            <el-tabs v-model="activeResultTab">
              <el-tab-pane
                v-for="(section, key) in result.sections"
                :key="key"
                :label="section.title"
                :name="key"
              >
                <div class="section-content">{{ section.content }}</div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
        
        <!-- 结果操作 -->
        <div class="result-actions">
          <el-button type="success" @click="applyResult">
            <el-icon><Check /></el-icon>
            应用结果
          </el-button>
          
          <el-button @click="copyResult">
            <el-icon><CopyDocument /></el-icon>
            复制内容
          </el-button>
          
          <el-button @click="regenerate" :loading="executing">
            <el-icon><Refresh /></el-icon>
            重新生成
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  MagicStick,
  Check,
  CopyDocument,
  Refresh
} from '@element-plus/icons-vue'
import { toolIntegrationService } from '@/services/toolIntegrationService'

// Props
const props = defineProps({
  toolType: {
    type: String,
    required: true
  },
  stepContext: {
    type: Object,
    default: () => ({})
  },
  wizardData: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['tool-result', 'close'])

// 响应式数据
const toolParams = reactive({})
const executing = ref(false)
const progress = ref(0)
const progressText = ref('')
const result = ref(null)
const activeResultTab = ref('')

// 工具配置
const toolConfigs = {
  brainstorm: {
    title: '脑洞生成器',
    description: '生成创意灵感和故事构思',
    icon: '🧠',
    fields: [
      {
        key: 'baseIdea',
        label: '基础想法',
        type: 'textarea',
        placeholder: '输入您的基础创意...',
        required: true
      },
      {
        key: 'count',
        label: '生成数量',
        type: 'select',
        options: [
          { label: '3个', value: 3 },
          { label: '5个', value: 5 },
          { label: '8个', value: 8 }
        ],
        required: true
      },
      {
        key: 'creativity',
        label: '创意程度',
        type: 'select',
        options: [
          { label: '常规', value: 'normal' },
          { label: '新颖', value: 'novel' },
          { label: '天马行空', value: 'wild' }
        ]
      }
    ]
  },
  
  character: {
    title: '角色生成器',
    description: '创建详细的角色档案',
    icon: '👤',
    fields: [
      {
        key: 'role',
        label: '角色类型',
        type: 'select',
        options: [
          { label: '主角', value: 'protagonist' },
          { label: '配角', value: 'supporting' },
          { label: '反角', value: 'antagonist' }
        ],
        required: true
      },
      {
        key: 'count',
        label: '生成数量',
        type: 'number',
        min: 1,
        max: 5,
        required: true
      },
      {
        key: 'personality',
        label: '性格要求',
        type: 'textarea',
        placeholder: '描述期望的性格特点...'
      }
    ]
  },
  
  worldview: {
    title: '世界观生成器',
    description: '构建详细的世界观设定',
    icon: '🌍',
    fields: [
      {
        key: 'worldType',
        label: '世界类型',
        type: 'select',
        options: [
          { label: '奇幻世界', value: 'fantasy' },
          { label: '科幻未来', value: 'scifi' },
          { label: '现代都市', value: 'modern' },
          { label: '历史古代', value: 'historical' }
        ],
        required: true
      },
      {
        key: 'scale',
        label: '世界规模',
        type: 'select',
        options: [
          { label: '单一城市', value: 'city' },
          { label: '国家大陆', value: 'continent' },
          { label: '多个星球', value: 'planets' }
        ]
      }
    ]
  },
  
  conflict: {
    title: '冲突生成器',
    description: '设计故事冲突体系',
    icon: '⚡',
    fields: [
      {
        key: 'conflictType',
        label: '冲突类型',
        type: 'select',
        options: [
          { label: '人物冲突', value: 'character' },
          { label: '社会冲突', value: 'social' },
          { label: '内心冲突', value: 'internal' },
          { label: '环境冲突', value: 'environment' }
        ],
        required: true
      },
      {
        key: 'intensity',
        label: '冲突强度',
        type: 'select',
        options: [
          { label: '轻微', value: 'mild' },
          { label: '中等', value: 'moderate' },
          { label: '激烈', value: 'intense' }
        ]
      }
    ]
  },
  
  opening: {
    title: '开篇生成器',
    description: '创作精彩的故事开头',
    icon: '🚀',
    fields: [
      {
        key: 'openingType',
        label: '开篇类型',
        type: 'select',
        options: [
          { label: '动作开篇', value: 'action' },
          { label: '对话开篇', value: 'dialogue' },
          { label: '描述开篇', value: 'description' },
          { label: '悬疑开篇', value: 'mystery' }
        ],
        required: true
      },
      {
        key: 'atmosphere',
        label: '氛围',
        type: 'select',
        options: [
          { label: '紧张', value: 'tense' },
          { label: '神秘', value: 'mysterious' },
          { label: '温馨', value: 'warm' },
          { label: '激烈', value: 'intense' }
        ]
      },
      {
        key: 'wordCount',
        label: '字数',
        type: 'number',
        min: 200,
        max: 1000,
        placeholder: '500'
      }
    ]
  },
  
  synopsis: {
    title: '简介生成器',
    description: '撰写吸引人的小说简介',
    icon: '📋',
    fields: [
      {
        key: 'style',
        label: '简介风格',
        type: 'select',
        options: [
          { label: '悬疑吸引', value: 'suspense' },
          { label: '情感共鸣', value: 'emotional' },
          { label: '直白介绍', value: 'direct' },
          { label: '商业化', value: 'commercial' }
        ],
        required: true
      },
      {
        key: 'length',
        label: '长度类型',
        type: 'select',
        options: [
          { label: '短简介(100字)', value: 'short' },
          { label: '长简介(200字)', value: 'long' },
          { label: '全套简介', value: 'full' }
        ]
      }
    ]
  },
  
  genre: {
    title: '题材分析器',
    description: '分析题材潜力和特点',
    icon: '🎯',
    fields: [
      {
        key: 'genreType',
        label: '题材类型',
        type: 'select',
        options: [
          { label: '玄幻奇幻', value: 'fantasy' },
          { label: '都市现代', value: 'urban' },
          { label: '科幻未来', value: 'scifi' },
          { label: '历史架空', value: 'historical' },
          { label: '武侠仙侠', value: 'wuxia' },
          { label: '言情浪漫', value: 'romance' }
        ],
        required: true
      },
      {
        key: 'analysisDepth',
        label: '分析深度',
        type: 'select',
        options: [
          { label: '简要分析', value: 'brief' },
          { label: '详细分析', value: 'detailed' },
          { label: '市场分析', value: 'market' }
        ]
      }
    ]
  },
  
  outline: {
    title: '细纲生成器',
    description: '生成详细的章节细纲',
    icon: '📝',
    fields: [
      {
        key: 'chapterCount',
        label: '章节数量',
        type: 'number',
        min: 1,
        max: 50,
        placeholder: '10',
        required: true
      },
      {
        key: 'detailLevel',
        label: '细节程度',
        type: 'select',
        options: [
          { label: '简略大纲', value: 'brief' },
          { label: '详细大纲', value: 'detailed' },
          { label: '超详细大纲', value: 'comprehensive' }
        ],
        required: true
      },
      {
        key: 'focusAreas',
        label: '重点区域',
        type: 'checkbox',
        options: [
          { label: '开篇', value: 'opening' },
          { label: '高潮', value: 'climax' },
          { label: '结局', value: 'ending' }
        ]
      }
    ]
  },
  
  cheat: {
    title: '金手指生成器',
    description: '设计主角的特殊能力',
    icon: '✨',
    fields: [
      {
        key: 'cheatType',
        label: '金手指类型',
        type: 'select',
        options: [
          { label: '系统类', value: 'system' },
          { label: '空间类', value: 'space' },
          { label: '重生类', value: 'rebirth' },
          { label: '穿越类', value: 'transmigration' },
          { label: '异能类', value: 'power' },
          { label: '宝物类', value: 'treasure' }
        ],
        required: true
      },
      {
        key: 'powerLevel',
        label: '能力强度',
        type: 'select',
        options: [
          { label: '弱开高走', value: 'weak_to_strong' },
          { label: '中等稳定', value: 'moderate' },
          { label: '强力开局', value: 'strong_start' }
        ]
      },
      {
        key: 'limitations',
        label: '限制条件',
        type: 'textarea',
        placeholder: '描述金手指的使用限制和代价...',
        rows: 3
      }
    ]
  },
  
  title: {
    title: '书名生成器',
    description: '生成吸引人的书名',
    icon: '💎',
    fields: [
      {
        key: 'count',
        label: '生成数量',
        type: 'select',
        options: [
          { label: '5个', value: 5 },
          { label: '10个', value: 10 },
          { label: '15个', value: 15 }
        ],
        required: true
      },
      {
        key: 'style',
        label: '书名风格',
        type: 'select',
        options: [
          { label: '简洁大气', value: 'concise' },
          { label: '悬疑吸引', value: 'mysterious' },
          { label: '霸气侧漏', value: 'domineering' },
          { label: '文艺清新', value: 'literary' }
        ]
      },
      {
        key: 'keywords',
        label: '关键词',
        type: 'input',
        placeholder: '输入希望包含的关键词（可选）'
      }
    ]
  }
}

// 计算属性
const toolConfig = computed(() => {
  return toolConfigs[props.toolType] || {
    title: '未知工具',
    description: '',
    icon: '🔧',
    fields: []
  }
})

const contextInfo = computed(() => {
  const wizard = props.wizardData
  return {
    concept: wizard.concept?.coreIdea,
    genre: wizard.concept?.selectedGenre,
    worldType: wizard.worldBuilding?.worldType,
    protagonist: wizard.characterDesign?.protagonist?.name
  }
})

const canExecute = computed(() => {
  const requiredFields = toolConfig.value.fields.filter(field => field.required)
  return requiredFields.every(field => {
    const value = toolParams[field.key]
    return value !== undefined && value !== null && value !== ''
  })
})

// 方法
const initializeParams = () => {
  // 初始化参数默认值
  toolConfig.value.fields.forEach(field => {
    if (field.type === 'checkbox') {
      toolParams[field.key] = []
    } else if (field.type === 'number') {
      toolParams[field.key] = field.min || 1
    } else {
      toolParams[field.key] = ''
    }
  })
  
  // 从上下文自动填充一些参数
  autoFillFromContext()
}

const autoFillFromContext = () => {
  const wizard = props.wizardData
  
  // 根据工具类型自动填充参数
  switch (props.toolType) {
    case 'brainstorm':
      if (wizard.concept?.coreIdea) {
        toolParams.baseIdea = wizard.concept.coreIdea
      }
      toolParams.count = 5
      toolParams.creativity = 'novel'
      break
      
    case 'character':
      toolParams.count = 1
      if (wizard.concept?.selectedGenre) {
        // 可以根据类型设置默认性格要求
      }
      break
      
    case 'worldview':
      if (wizard.concept?.selectedGenre) {
        // 根据类型设置默认世界类型
        const genreMap = {
          'fantasy': 'fantasy',
          'scifi': 'scifi',
          'urban': 'modern',
          'historical': 'historical'
        }
        toolParams.worldType = genreMap[wizard.concept.selectedGenre] || 'modern'
      }
      toolParams.scale = 'continent'
      break
  }
}

const executeTool = async () => {
  if (!canExecute.value) {
    ElMessage.warning('请填写所有必填参数')
    return
  }
  
  executing.value = true
  progress.value = 0
  progressText.value = '准备执行工具...'
  
  let progressInterval = null
  
  try {
    // 模拟进度更新
    progressInterval = setInterval(() => {
      if (progress.value < 90) {
        progress.value += Math.random() * 15
        updateProgressText()
      }
    }, 500)
    
    // 执行工具
    const toolResult = await toolIntegrationService.executeAndIntegrateTool(
      props.toolType,
      props.stepContext.id,
      toolParams
    )
    
    // 清除进度定时器（关键修复！）
    if (progressInterval) {
      clearInterval(progressInterval)
      progressInterval = null
    }
    
    progress.value = 100
    progressText.value = '执行完成'
    
    // 处理结果
    result.value = formatResult(toolResult)
    
    ElMessage.success('工具执行完成')
  } catch (error) {
    console.error('工具执行失败:', error)
    ElMessage.error('工具执行失败：' + error.message)
  } finally {
    // 确保清除定时器（防止内存泄漏）
    if (progressInterval) {
      clearInterval(progressInterval)
      progressInterval = null
    }
    
    executing.value = false
    // 延迟清除进度条，让用户看到100%
    setTimeout(() => {
      progress.value = 0
      progressText.value = ''
    }, 1000)
  }
}

const updateProgressText = () => {
  const texts = [
    '正在分析参数...',
    '正在构建提示词...',
    '正在调用AI服务...',
    '正在处理结果...',
    '正在整合数据...'
  ]
  
  const index = Math.floor(progress.value / 20)
  progressText.value = texts[Math.min(index, texts.length - 1)]
}

const formatResult = (toolResult) => {
  // 根据工具类型格式化结果
  switch (props.toolType) {
    case 'brainstorm':
      return {
        type: 'list',
        items: toolResult.results || []
      }
      
    case 'character':
      return {
        type: 'structured',
        sections: {
          basic: {
            title: '基本信息',
            content: formatCharacterBasic(toolResult.characters)
          },
          personality: {
            title: '性格特点',
            content: formatCharacterPersonality(toolResult.characters)
          },
          background: {
            title: '背景故事',
            content: formatCharacterBackground(toolResult.characters)
          }
        }
      }
      
    case 'worldview':
      return {
        type: 'structured',
        sections: {
          basic: {
            title: '基本架构',
            content: toolResult.settings?.basic || '世界基本设定...'
          },
          rules: {
            title: '核心规则',
            content: toolResult.settings?.rules || '世界运行规则...'
          },
          culture: {
            title: '文化背景',
            content: toolResult.settings?.culture || '文化传统设定...'
          }
        }
      }
      
    case 'genre':
      return {
        type: 'structured',
        sections: {
          potential: {
            title: '题材潜力',
            content: toolResult.potential || '题材潜力分析...'
          },
          advantages: {
            title: '优势特点',
            content: toolResult.advantages || '题材优势...'
          },
          suggestions: {
            title: '创作建议',
            content: toolResult.suggestions || '创作建议...'
          }
        }
      }
      
    case 'outline':
      return {
        type: 'list',
        items: toolResult.chapters || []
      }
      
    case 'cheat':
      return {
        type: 'structured',
        sections: {
          description: {
            title: '金手指描述',
            content: toolResult.description || '金手指能力描述...'
          },
          abilities: {
            title: '核心能力',
            content: toolResult.abilities || '能力清单...'
          },
          limitations: {
            title: '限制条件',
            content: toolResult.limitations || '使用限制...'
          }
        }
      }
      
    case 'title':
      return {
        type: 'list',
        items: toolResult.titles || []
      }
      
    default:
      return {
        type: 'text',
        content: typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult, null, 2)
      }
  }
}

const formatCharacterBasic = (characters) => {
  if (!characters || !Array.isArray(characters)) return '暂无角色数据'
  
  return characters.map(char => `
姓名：${char.name || '未命名'}
年龄：${char.age || '未知'}
职业：${char.occupation || '未知'}
  `).join('\n\n')
}

const formatCharacterPersonality = (characters) => {
  if (!characters || !Array.isArray(characters)) return '暂无性格数据'
  
  return characters.map(char => `
${char.name || '角色'}的性格特点：
${char.personality || '暂无描述'}
  `).join('\n\n')
}

const formatCharacterBackground = (characters) => {
  if (!characters || !Array.isArray(characters)) return '暂无背景数据'
  
  return characters.map(char => `
${char.name || '角色'}的背景故事：
${char.background || '暂无背景'}
  `).join('\n\n')
}

const resetParams = () => {
  Object.keys(toolParams).forEach(key => {
    const field = toolConfig.value.fields.find(f => f.key === key)
    if (field) {
      if (field.type === 'checkbox') {
        toolParams[key] = []
      } else if (field.type === 'number') {
        toolParams[key] = field.min || 1
      } else {
        toolParams[key] = ''
      }
    }
  })
  
  result.value = null
  autoFillFromContext()
}

const applyResult = () => {
  emit('tool-result', result.value)
  ElMessage.success('结果已应用到向导中')
}

const copyResult = async () => {
  try {
    let textToCopy = ''
    
    if (result.value.type === 'text') {
      textToCopy = result.value.content
    } else if (result.value.type === 'list') {
      textToCopy = result.value.items.map(item => 
        `${item.title}\n${item.content}`
      ).join('\n\n')
    } else if (result.value.type === 'structured') {
      textToCopy = Object.values(result.value.sections).map(section =>
        `${section.title}\n${section.content}`
      ).join('\n\n')
    }
    
    await navigator.clipboard.writeText(textToCopy)
    ElMessage.success('内容已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const regenerate = () => {
  executeTool()
}

// 生命周期
onMounted(() => {
  initializeParams()
})

// 监听工具类型变化
watch(() => props.toolType, () => {
  initializeParams()
})
</script>

<style scoped>
.tool-interface {
  max-width: 800px;
  margin: 0 auto;
}

.tool-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.tool-info h3 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.tool-info p {
  margin: 0;
  color: #7f8c8d;
}

.tool-icon {
  font-size: 32px;
}

.tool-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.tool-form {
  background: white;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.context-info {
  background: #f0f9ff;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #b3d8ff;
}

.context-info h4 {
  margin: 0 0 12px 0;
  color: #2c3e50;
}

.context-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.context-item {
  font-size: 14px;
  color: #606266;
}

.tool-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.execution-progress {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.progress-text {
  margin-top: 8px;
  color: #606266;
  font-size: 14px;
}

.tool-result {
  background: white;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  overflow: hidden;
}

.tool-result h4 {
  margin: 0;
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
  color: #2c3e50;
}

.result-content {
  padding: 20px;
}

.result-textarea {
  width: 100%;
}

.result-textarea :deep(.el-textarea__inner) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
}

.list-result {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.list-item {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.item-header h5 {
  margin: 0;
  color: #2c3e50;
}

.item-content {
  color: #606266;
  line-height: 1.6;
}

.structured-result {
  min-height: 300px;
}

.section-content {
  padding: 16px 0;
  line-height: 1.8;
  color: #606266;
  white-space: pre-line;
}

.result-actions {
  padding: 16px 20px;
  border-top: 1px solid #e4e7ed;
  background: #f8f9fa;
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tool-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .tool-actions,
  .result-actions {
    flex-direction: column;
  }
  
  .context-content {
    font-size: 13px;
  }
}
</style>
