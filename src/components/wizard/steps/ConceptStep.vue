<template>
  <div class="concept-step">
    <div class="step-header">
      <h2>步骤 1: 创意构思</h2>
      <p>确定小说的核心概念、类型和创作方向</p>
    </div>
    
    <div class="step-content">
      <!-- 核心创意输入 -->
      <div class="form-section">
        <h3>
            <el-icon><Sunny /></el-icon>
          核心创意
          <span class="required">*</span>
        </h3>
        <p class="section-desc">描述您的小说核心想法，这将成为整个故事的基础</p>
        
        <el-input
          v-model="localData.coreIdea"
          type="textarea"
          :rows="4"
          placeholder="例如：一个能够进入他人梦境的侦探，利用这种能力破解现实中的案件..."
          @input="updateData('coreIdea', $event)"
        />
        
        <div class="idea-suggestions" v-if="ideaSuggestions.length">
          <div class="suggestions-title">💡 创意建议</div>
          <div class="suggestions-list">
            <el-tag 
              v-for="suggestion in ideaSuggestions" 
              :key="suggestion"
              @click="applySuggestion(suggestion)"
              class="suggestion-tag"
            >
              {{ suggestion }}
            </el-tag>
          </div>
        </div>
      </div>
      
      <!-- 小说类型选择 -->
      <div class="form-section">
        <h3>
          <el-icon><Collection /></el-icon>
          小说类型
          <span class="required">*</span>
        </h3>
        <p class="section-desc">选择最符合您创意的小说类型</p>
        
        <div class="genre-grid">
          <div 
            v-for="genre in availableGenres" 
            :key="genre.value"
            class="genre-card"
            :class="{ selected: localData.selectedGenre === genre.value }"
            @click="selectGenre(genre.value)"
          >
            <div class="genre-icon">{{ genre.icon }}</div>
            <div class="genre-name">{{ genre.label }}</div>
            <div class="genre-desc">{{ genre.description }}</div>
          </div>
        </div>
      </div>
      
      <!-- 目标读者群体 -->
      <div class="form-section">
        <h3>
          <el-icon><User /></el-icon>
          目标读者
        </h3>
        <p class="section-desc">确定您的主要读者群体</p>
        
        <el-select 
          v-model="localData.targetAudience" 
          placeholder="选择目标读者群体"
          @change="updateData('targetAudience', $event)"
          style="width: 100%"
        >
          <el-option
            v-for="audience in audienceOptions"
            :key="audience.value"
            :label="audience.label"
            :value="audience.value"
          >
            <div class="audience-option">
              <span class="audience-name">{{ audience.label }}</span>
              <span class="audience-desc">{{ audience.description }}</span>
            </div>
          </el-option>
        </el-select>
      </div>
      
      <!-- 主题元素 -->
      <div class="form-section">
        <h3>
          <el-icon><Flag /></el-icon>
          主题元素
        </h3>
        <p class="section-desc">选择您想要探讨的主题</p>
        
        <div class="themes-container">
          <el-tag
            v-for="theme in availableThemes"
            :key="theme"
            :type="localData.themes.includes(theme) ? 'primary' : 'info'"
            @click="toggleTheme(theme)"
            class="theme-tag"
          >
            {{ theme }}
          </el-tag>
        </div>
        
        <el-input
          v-model="customTheme"
          placeholder="或输入自定义主题"
          @keyup.enter="addCustomTheme"
          style="margin-top: 12px"
        >
          <template #append>
            <el-button @click="addCustomTheme" :disabled="!customTheme.trim()">
              添加
            </el-button>
          </template>
        </el-input>
      </div>
      
      <!-- 脑洞生成结果 -->
      <div class="form-section" v-if="brainstormResults.length">
        <h3>
          <el-icon><MagicStick /></el-icon>
          创意脑洞
        </h3>
        <p class="section-desc">AI生成的创意建议，点击采用</p>
        
        <div class="brainstorm-results">
          <div 
            v-for="(brainstorm, index) in brainstormResults" 
            :key="brainstorm.id"
            class="brainstorm-card"
            :class="{ selected: selectedBrainstorm === brainstorm.id }"
            @click="selectBrainstorm(brainstorm)"
          >
            <div class="brainstorm-header">
              <h4>{{ brainstorm.title }}</h4>
              <el-tag size="small" type="success">{{ index + 1 }}</el-tag>
            </div>
            <div class="brainstorm-content">
              <div class="brainstorm-item">
                <strong>核心设定：</strong>{{ brainstorm.description }}
              </div>
              <div class="brainstorm-item">
                <strong>创意亮点：</strong>{{ brainstorm.highlight }}
              </div>
              <div class="brainstorm-item">
                <strong>冲突设计：</strong>{{ brainstorm.conflict }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 市场潜力分析 -->
      <div class="form-section" v-if="marketAnalysis">
        <h3>
          <el-icon><TrendCharts /></el-icon>
          市场潜力分析
        </h3>
        
        <div class="analysis-card">
          <div class="analysis-score">
            <div class="score-value">{{ marketAnalysis.score || 8.5 }}/10</div>
            <div class="score-label">市场潜力评分</div>
          </div>
          <div class="analysis-content">
            <div class="analysis-item">
              <strong>读者群体：</strong>{{ marketAnalysis.audience || '年轻都市读者' }}
            </div>
            <div class="analysis-item">
              <strong>竞争程度：</strong>{{ marketAnalysis.competition || '中等' }}
            </div>
            <div class="analysis-item">
              <strong>创新度：</strong>{{ marketAnalysis.innovation || '较高' }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 酒馆模式 -->
    <TavernManager
      ref="tavernManagerRef"
      :genre="localData.selectedGenre || '玄幻'"
      :enable-tavern-mode="isTavernMode"
      :current-step="'concept'"
      @mode-changed="onTavernModeChanged"
      @authors-changed="onAuthorsChanged"
      @discussion-started="onDiscussionStarted"
      @discussion-completed="onDiscussionCompleted"
      @proposal-selected="onProposalSelected"
    />
    
    <!-- 快速操作区 -->
    <div class="quick-actions">
      <h3>快速工具</h3>
      <div class="action-buttons">
        <el-button 
          type="primary" 
          @click="enhancedGenerateBrainstorm"
          :loading="generatingBrainstorm"
          icon="MagicStick"
          size="large"
        >
          {{ isTavernMode ? '酒馆讨论生成脑洞' : '生成创意脑洞' }}
        </el-button>
        
        <!-- 暂时移除类型分析功能，直到API配置完善
        <el-button 
          type="info" 
          @click="analyzeGenre"
          :loading="analyzingGenre"
          icon="TrendCharts"
          :disabled="!localData.selectedGenre"
        >
          分析类型潜力
        </el-button>
        -->
        
        <!-- 暂时移除市场分析功能
        <el-button 
          type="success" 
          @click="analyzeMarket"
          :loading="analyzingMarket"
          icon="PieChart"
          :disabled="!localData.coreIdea || !localData.selectedGenre"
        >
          市场潜力评估
        </el-button>
        -->
      </div>
    </div>
    
    <!-- 完成状态提示 -->
    <div class="completion-status">
      <div class="status-header">
        <h3>完成状态</h3>
        <el-progress 
          :percentage="completionPercentage" 
          :stroke-width="6"
          :text-inside="false"
        />
      </div>
      
      <div class="required-items">
        <div 
          class="required-item"
          :class="{ completed: localData.coreIdea }"
        >
          <el-icon>
            <Check v-if="localData.coreIdea" />
            <Close v-else />
          </el-icon>
          核心创意
        </div>
        <div 
          class="required-item"
          :class="{ completed: localData.selectedGenre }"
        >
          <el-icon>
            <Check v-if="localData.selectedGenre" />
            <Close v-else />
          </el-icon>
          小说类型
        </div>
      </div>
      
      <div class="next-step-tip" v-if="completionPercentage === 100">
        <el-icon><InfoFilled /></el-icon>
        <span>恭喜！您已完成创意构思步骤，可以进入下一步了。</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Sunny,
  Collection,
  User,
  Flag,
  MagicStick,
  TrendCharts,
  PieChart,
  Check,
  Close,
  InfoFilled
} from '@element-plus/icons-vue'
import TavernManager from '@/components/tavern/TavernManager.vue'

// Props
const props = defineProps({
  stepData: {
    type: Object,
    default: () => ({})
  },
  wizardData: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['update-data', 'use-tool', 'next-step'])

// 本地数据
const localData = reactive({
  coreIdea: '',
  selectedGenre: '',
  targetAudience: '',
  themes: [],
  brainstormResults: [],
  marketPotential: '',
  ...props.stepData
})

// 响应式数据
const customTheme = ref('')
const selectedBrainstorm = ref(null)
const generatingBrainstorm = ref(false)
// const analyzingGenre = ref(false) // 暂时移除类型分析功能
// const analyzingMarket = ref(false) // 暂时移除市场分析功能

const brainstormResults = ref([])
const marketAnalysis = ref(null)

// 酒馆模式相关
const tavernManagerRef = ref(null)
const isTavernMode = ref(false)
const selectedAuthors = ref([])
const currentDiscussions = ref([])
const ideaSuggestions = ref([
  '穿越时空的恋爱故事',
  '未来世界的AI革命',
  '平行宇宙的冒险',
  '超能力觉醒之路',
  '古代文明的秘密'
])

// 类型选项
const availableGenres = [
  {
    value: 'urban',
    label: '都市',
    icon: '🏙️',
    description: '现代都市背景，贴近现实生活'
  },
  {
    value: 'fantasy',
    label: '玄幻',
    icon: '🐲',
    description: '东方玄幻，修仙武侠'
  },
  {
    value: 'scifi',
    label: '科幻',
    icon: '🚀',
    description: '未来科技，星际探索'
  },
  {
    value: 'romance',
    label: '言情',
    icon: '💕',
    description: '感情为主线的故事'
  },
  {
    value: 'mystery',
    label: '悬疑',
    icon: '🔍',
    description: '推理解谜，悬念重重'
  },
  {
    value: 'historical',
    label: '历史',
    icon: '📜',
    description: '历史背景，古代题材'
  },
  {
    value: 'wuxia',
    label: '武侠',
    icon: '⚔️',
    description: '江湖恩怨，武功传奇'
  },
  {
    value: 'gaming',
    label: '游戏',
    icon: '🎮',
    description: '虚拟世界，游戏元素'
  },
  {
    value: 'esports',
    label: '电竞',
    icon: '⚡',
    description: '电竞竞技，团队荣耀'
  },
  {
    value: 'business',
    label: '商战',
    icon: '📈',
    description: '商业竞争，智谋博弈'
  },
  {
    value: 'military',
    label: '军事',
    icon: '🪖',
    description: '战争题材，军人生活'
  },
  {
    value: 'apocalypse',
    label: '末世',
    icon: '🧟',
    description: '末日求生，人性考验'
  },
  {
    value: 'rebirth',
    label: '重生',
    icon: '🔄',
    description: '重生复仇，改变命运'
  },
  {
    value: 'system',
    label: '系统',
    icon: '💻',
    description: '系统流，数据面板'
  },
  {
    value: 'cultivation',
    label: '修真',
    icon: '⛰️',
    description: '修仙炼道，飞升成仙'
  },
  {
    value: 'horror',
    label: '恐怖',
    icon: '👻',
    description: '惊悚恐怖，诡异氛围'
  },
  {
    value: 'school',
    label: '校园',
    icon: '🎓',
    description: '校园生活，青春记忆'
  },
  {
    value: 'entertainment',
    label: '娱乐圈',
    icon: '🎬',
    description: '明星生活，演艺圈故事'
  }
]

// 读者群体选项
const audienceOptions = [
  {
    value: 'young',
    label: '年轻读者(18-25岁)',
    description: '大学生、初入职场'
  },
  {
    value: 'adult',
    label: '成年读者(25-35岁)',
    description: '职场人士、都市白领'
  },
  {
    value: 'middle',
    label: '中年读者(35-45岁)',
    description: '事业有成、生活稳定'
  },
  {
    value: 'all',
    label: '全年龄段',
    description: '适合各个年龄层阅读'
  }
]

// 主题选项
const availableThemes = [
  '成长与蜕变', '爱情与友情', '正义与邪恶', '梦想与现实',
  '科技与人性', '传统与创新', '家族与荣誉', '自由与责任',
  '冒险与探索', '命运与选择', '真相与谎言', '希望与绝望'
]

// 计算属性
const completionPercentage = computed(() => {
  let completed = 0
  let total = 2 // 必填项数量
  
  if (localData.coreIdea?.trim()) completed++
  if (localData.selectedGenre) completed++
  
  return Math.round((completed / total) * 100)
})

// 方法
const updateData = (field, value) => {
  localData[field] = value
  emit('update-data', 'concept', field, value)
}

const selectGenre = (genre) => {
  localData.selectedGenre = genre
  updateData('selectedGenre', genre)
  
  // 移除自动触发类型分析，让用户手动点击
  // 这样可以避免异步调用时状态不一致的问题
}

const toggleTheme = (theme) => {
  const index = localData.themes.indexOf(theme)
  if (index >= 0) {
    localData.themes.splice(index, 1)
  } else {
    localData.themes.push(theme)
  }
  updateData('themes', localData.themes)
}

const addCustomTheme = () => {
  const theme = customTheme.value.trim()
  if (theme && !localData.themes.includes(theme)) {
    localData.themes.push(theme)
    updateData('themes', localData.themes)
    customTheme.value = ''
    ElMessage.success('主题已添加')
  }
}

const applySuggestion = (suggestion) => {
  localData.coreIdea = suggestion
  updateData('coreIdea', suggestion)
  ElMessage.success('创意建议已应用')
}

const selectBrainstorm = (brainstorm) => {
  selectedBrainstorm.value = brainstorm.id
  
  // 应用脑洞到核心创意
  localData.coreIdea = brainstorm.description
  updateData('coreIdea', brainstorm.description)
  
  // 自动提取主题
  if (brainstorm.themes) {
    localData.themes = [...new Set([...localData.themes, ...brainstorm.themes])]
    updateData('themes', localData.themes)
  }
  
  ElMessage.success('创意脑洞已应用')
}

// 工具方法
// 酒馆模式事件处理
const onTavernModeChanged = (enabled) => {
  isTavernMode.value = enabled
  console.log('酒馆模式状态:', enabled)
}

const onAuthorsChanged = (authors) => {
  // 避免重复设置相同的值
  if (JSON.stringify(authors) !== JSON.stringify(selectedAuthors.value)) {
    selectedAuthors.value = authors
    console.log('选中的作者已更新:', authors)
  }
}

const onDiscussionStarted = (config) => {
  console.log('脑洞讨论开始:', config)
}

const onDiscussionCompleted = (result) => {
  if (result && result.topProposals && result.topProposals.length > 0) {
    const topResult = result.topProposals[0]
    
    // 将酒馆讨论结果转换为脑洞格式
    const brainstormFromTavern = [{
      id: Date.now(),
      title: topResult.title || '酒馆讨论精选创意',
      description: topResult.core || topResult.details,
      highlight: topResult.advantages || '经过多位大神作者讨论验证',
      conflict: '可根据讨论建议进一步完善',
      potential: '集体智慧，创意价值较高'
    }]
    
    brainstormResults.value = brainstormFromTavern
    updateData('brainstormResults', brainstormFromTavern)
    ElMessage.success('酒馆讨论结果已生成')
  }
}

const onProposalSelected = (proposal) => {
  console.log('ConceptStep 收到选择的方案:', proposal)
  
  // 更新核心创意为选中的方案
  const updatedIdea = `${proposal.core} ${proposal.details}`.trim()
  localData.coreIdea = updatedIdea
  updateData('coreIdea', updatedIdea)
  
  // 更新脑洞结果
  const enhancedBrainstorm = [{
    id: Date.now(),
    title: proposal.title || '酒馆讨论选定方案',
    description: proposal.core || proposal.details,
    highlight: proposal.advantages || '经过多位大神作者讨论验证',
    conflict: '可根据讨论建议进一步完善',
    potential: `获得${proposal.score}分，排名第${proposal.rank}位的优质创意`
  }]
  
  brainstormResults.value = enhancedBrainstorm
  updateData('brainstormResults', enhancedBrainstorm)
  
  ElMessage.success(`已采用"${proposal.title}"方案，创意已更新！`)
}

// 增强版脑洞生成（支持酒馆模式）
const enhancedGenerateBrainstorm = async () => {
  console.log('=== enhancedGenerateBrainstorm 被调用 ===')
  console.log('localData.coreIdea:', localData.coreIdea)
  console.log('localData.selectedGenre:', localData.selectedGenre)
  console.log('isTavernMode.value:', isTavernMode.value)
  console.log('tavernManagerRef.value:', tavernManagerRef.value)
  
  if (!localData.coreIdea?.trim()) {
    ElMessage.warning('请先输入基础创意')
    return
  }
  
  if (!localData.selectedGenre) {
    ElMessage.warning('请先选择小说类型')
    return
  }

  // 检查是否启用酒馆模式
  console.log('检查酒馆模式条件...')
  if (isTavernMode.value && tavernManagerRef.value) {
    console.log('✅ 酒馆模式已启用，开始酒馆讨论')
    generatingBrainstorm.value = true
    
    try {
      const discussionConfig = {
        discussionId: 'brainstorm_' + Date.now(),
        topic: `基于创意"${localData.coreIdea}"生成创新性的小说脑洞`,
        context: `小说类型：${localData.selectedGenre}
目标读者：${localData.targetAudience || '未指定'}
主题元素：${localData.themes.join('、') || '未指定'}

请各位作者针对这个基础创意，从各自的专业角度提出具有创新性的发展方向和独特设定。重点考虑：
1. 如何让这个创意更具吸引力
2. 可以添加什么独特的世界观元素
3. 主角的潜在特质和成长方向
4. 可能的冲突和悬念设置`,
        backgroundInfo: {
          coreIdea: localData.coreIdea,
          genre: localData.selectedGenre,
          audience: localData.targetAudience,
          themes: localData.themes
        }
      }

      console.log('开始调用 tavernManager.startDiscussion...')
      console.log('讨论配置:', discussionConfig)
      
      const result = await tavernManagerRef.value.startDiscussion(discussionConfig)
      
      console.log('startDiscussion 返回结果:', result)
      
      if (!result) {
        console.log('❌ startDiscussion 返回 null，回退到单模型模式')
        // 用户选择了直接生成，回退到单模型模式
        generateBrainstorm()
      } else {
        console.log('✅ 酒馆讨论启动成功')
        
        // 🔧 关键修复：处理讨论结果
        if (result && result.topProposals && result.topProposals.length > 0) {
          console.log('📝 开始处理酒馆讨论结果...')
          
          // 将所有方案转换为脑洞格式
          const brainstormFromTavern = result.topProposals.map((proposal, index) => ({
            id: Date.now() + index,
            title: proposal.title || `方案${index + 1}：酒馆讨论精选创意`,
            description: proposal.core || proposal.details || '创意内容',
            highlight: proposal.advantages || '经过多位大神作者讨论验证',
            conflict: '可根据讨论建议进一步完善',
            potential: `获得${proposal.score}分，${result.totalVotes}位作者投票`
          }))
          
          console.log('🎯 转换后的脑洞结果:', brainstormFromTavern)
          
          // 更新界面数据
          brainstormResults.value = brainstormFromTavern
          updateData('brainstormResults', brainstormFromTavern)
          
          // 自动选择得分最高的方案作为核心创意
          const topProposal = result.topProposals[0]
          if (topProposal) {
            const enhancedIdea = `${topProposal.core} ${topProposal.details}`.trim()
            localData.coreIdea = enhancedIdea
            updateData('coreIdea', enhancedIdea)
            console.log('🎯 核心创意已更新:', enhancedIdea)
          }
          
          ElMessage.success(`酒馆讨论完成！生成了${brainstormFromTavern.length}个优质创意方案`)
        } else {
          console.warn('⚠️ 讨论结果格式异常:', result)
        }
      }
    } catch (error) {
      console.error('酒馆模式生成失败:', error)
      ElMessage.error('酒馆模式生成失败，回退到单模型模式')
      generateBrainstorm()
    } finally {
      generatingBrainstorm.value = false
    }
  } else {
    console.log('❌ 酒馆模式条件不满足:')
    console.log('- isTavernMode.value:', isTavernMode.value)
    console.log('- tavernManagerRef.value:', tavernManagerRef.value)
    
    // 如果酒馆模式未开启，询问用户是否要开启
    if (!isTavernMode.value && tavernManagerRef.value) {
      console.log('💡 酒馆模式未开启，询问用户是否要启用...')
      try {
        const shouldEnableTavern = await ElMessageBox.confirm(
          '您可以选择使用酒馆模式让多位大神作者共同讨论生成更优质的创意，或者使用单模型快速生成。',
          '选择生成模式',
          {
            confirmButtonText: '使用酒馆模式 (推荐)',
            cancelButtonText: '使用单模型生成',
            type: 'info',
            dangerouslyUseHTMLString: true,
            message: `
              <div>
                <p><strong>🍺 酒馆模式：</strong>多位顶级作者共同讨论，质量更高但耗时稍长</p>
                <p><strong>⚡ 单模型：</strong>快速生成，适合快速迭代</p>
              </div>
            `
          }
        )
        
        if (shouldEnableTavern) {
          console.log('✅ 用户选择启用酒馆模式')
          // 自动启用酒馆模式
          isTavernMode.value = true
          // 等待组件更新
          await nextTick()
          // 递归调用，这次应该会进入酒馆模式分支
          return enhancedGenerateBrainstorm()
        } else {
          console.log('⚡ 用户选择单模型生成')
          generateBrainstorm()
        }
      } catch (error) {
        console.log('⚡ 用户取消选择，默认使用单模型')
        generateBrainstorm()
      }
    } else {
      console.log('回退到单模型模式')
      // 单模型模式
      generateBrainstorm()
    }
  }
}

// 原始的单模型脑洞生成
const generateBrainstorm = async () => {
  if (!localData.coreIdea?.trim()) {
    ElMessage.warning('请先输入基础创意')
    return
  }
  
  // 检查组件状态
  if (!props.wizardData || !emit) {
    ElMessage.error('组件未正确初始化，请刷新页面重试')
    return
  }
  
  generatingBrainstorm.value = true
  try {
    // 等待一小段时间确保父组件状态稳定
    await new Promise(resolve => setTimeout(resolve, 200))
    
    console.log('开始生成脑洞:', {
      baseIdea: localData.coreIdea,
      preferredGenre: localData.selectedGenre,
      wizardData: props.wizardData
    })
    
    // 使用回调方式处理工具调用 - 修复异步问题
    emit('use-tool', 'brainstorm', {
      baseIdea: localData.coreIdea,
      preferredGenre: localData.selectedGenre,
      creativity: 'novel'
    }, (result, error) => {
      // 这个回调将在API调用完成后被调用
      console.log('脑洞生成回调结果:', result, error)
      
      if (error) {
        console.error('工具调用异常:', error)
        ElMessage.error('生成失败：' + (error.message || '未知错误'))
        generatingBrainstorm.value = false
        return
      }
      
      // 处理成功结果
      if (result) {
        // 如果结果是数组，直接使用
        if (Array.isArray(result.results)) {
          brainstormResults.value = result.results
          // 同时更新到 wizardData 中
          updateData('brainstormResults', result.results)
        } else if (Array.isArray(result)) {
          brainstormResults.value = result
          updateData('brainstormResults', result)
        } else {
          // 如果是字符串，尝试解析
          console.warn('脑洞生成结果格式异常，尝试手动解析:', result)
          brainstormResults.value = [{
            id: Date.now(),
            title: '生成的创意脑洞',
            description: result.raw || result.content || result.toString(),
            highlight: '创意亮点待完善',
            conflict: '冲突设计待完善',
            potential: '发展潜力良好'
          }]
          updateData('brainstormResults', brainstormResults.value)
        }
        ElMessage.success(`创意脑洞生成完成，共生成 ${brainstormResults.value.length} 个创意`)
      } else {
        ElMessage.error('生成失败：未收到有效的生成结果')
      }
      
      generatingBrainstorm.value = false
    })
  } catch (error) {
    console.error('生成脑洞失败:', error)
    ElMessage.error('生成失败：' + (error.message || '未知错误'))
    generatingBrainstorm.value = false
  }
  
  // 注意：不要在这里设置 finally，因为 loading 状态由回调函数管理
}

// 暂时移除类型分析功能
// const analyzeGenre = async () => {
//   // 功能暂时禁用，等待API配置完善
//   ElMessage.warning('类型分析功能暂时不可用，请先配置API')
// }

// 暂时移除市场分析功能
// const analyzeMarket = async () => {
//   ElMessage.warning('市场分析功能暂时不可用，请先配置API')
// }

// 监听数据变化
watch(() => props.stepData, (newData) => {
  Object.assign(localData, newData)
}, { deep: true, immediate: true })

// 生命周期
onMounted(() => {
  // 如果有保存的数据，恢复状态
  if (props.stepData.brainstormResults) {
    brainstormResults.value = props.stepData.brainstormResults
  }
})

// 监听 wizardData 中的 brainstormResults 变化
watch(() => props.wizardData.concept?.brainstormResults, (newResults) => {
  if (newResults && Array.isArray(newResults)) {
    brainstormResults.value = newResults
  }
}, { deep: true, immediate: true })
</script>

<style scoped>
.concept-step {
  max-width: 800px;
  margin: 0 auto;
}

.step-header {
  text-align: center;
  margin-bottom: 32px;
}

.step-header h2 {
  color: #2c3e50;
  margin-bottom: 8px;
}

.step-header p {
  color: #7f8c8d;
  font-size: 16px;
}

.step-content {
  margin-bottom: 32px;
}

.form-section {
  margin-bottom: 32px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.form-section h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #2c3e50;
  font-size: 18px;
}

.required {
  color: #f56c6c;
}

.section-desc {
  color: #7f8c8d;
  font-size: 14px;
  margin-bottom: 16px;
}

.idea-suggestions {
  margin-top: 16px;
  padding: 16px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.suggestions-title {
  font-weight: 500;
  color: #409eff;
  margin-bottom: 12px;
}

.suggestions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-tag {
  cursor: pointer;
  transition: all 0.3s ease;
}

.suggestion-tag:hover {
  transform: translateY(-1px);
}

.genre-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.genre-card {
  padding: 20px;
  background: white;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.genre-card:hover {
  border-color: #409eff;
  transform: translateY(-2px);
}

.genre-card.selected {
  border-color: #409eff;
  background: #e3f2fd;
}

.genre-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.genre-name {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 8px;
}

.genre-desc {
  font-size: 12px;
  color: #7f8c8d;
}

.audience-option {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.audience-name {
  font-weight: 500;
}

.audience-desc {
  font-size: 12px;
  color: #7f8c8d;
}

.themes-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.theme-tag {
  cursor: pointer;
  transition: all 0.3s ease;
}

.theme-tag:hover {
  transform: scale(1.05);
}

.brainstorm-results {
  display: grid;
  gap: 16px;
}

.brainstorm-card {
  padding: 20px;
  background: white;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.brainstorm-card:hover {
  border-color: #409eff;
}

.brainstorm-card.selected {
  border-color: #67c23a;
  background: #f0f9ff;
}

.brainstorm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.brainstorm-header h4 {
  margin: 0;
  color: #2c3e50;
}

.brainstorm-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.brainstorm-item {
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
}

.analysis-card {
  display: flex;
  gap: 24px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.analysis-score {
  text-align: center;
  min-width: 100px;
}

.score-value {
  font-size: 32px;
  font-weight: bold;
  color: #67c23a;
}

.score-label {
  font-size: 12px;
  color: #7f8c8d;
}

.analysis-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.analysis-item {
  font-size: 14px;
  color: #606266;
}

.quick-actions {
  margin-bottom: 32px;
  padding: 24px;
  background: #f0f9ff;
  border-radius: 8px;
  border: 1px solid #b3d8ff;
}

.quick-actions h3 {
  margin-bottom: 16px;
  color: #2c3e50;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.completion-status {
  padding: 24px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.status-header h3 {
  margin: 0;
  color: #2c3e50;
}

.required-items {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.required-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.required-item.completed {
  background: #f0f9ff;
  color: #67c23a;
}

.required-item:not(.completed) {
  background: #fef0f0;
  color: #f56c6c;
}

.next-step-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f0f9ff;
  border-radius: 6px;
  color: #409eff;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .genre-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .required-items {
    flex-direction: column;
    gap: 8px;
  }
  
  .analysis-card {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
