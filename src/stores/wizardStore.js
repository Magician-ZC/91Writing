import { defineStore } from 'pinia'
import { ref, reactive, computed, toRaw } from 'vue'

export const useWizardStore = defineStore('wizard', () => {
  // 当前向导状态
  const currentStep = ref(0)
  const isWizardActive = ref(false)
  
  const wizardData = reactive({
    novelId: null,
    title: '',
    
    // 步骤1: 创意构思
    concept: {
      brainstormResults: [],
      selectedGenre: '',
      targetAudience: '',
      marketPotential: '',
      coreIdea: '',
      themes: []
    },
    
    // 步骤2: 世界构建
    worldBuilding: {
      worldType: '',
      scale: '',
      coreRules: [],
      powerSystem: '',
      socialStructure: '',
      geography: '',
      history: '',
      culture: '',
      technology: ''
    },
    
    // 步骤3: 角色设计
    characterDesign: {
      protagonist: null,
      supporting: [],
      antagonist: null,
      background: [],
      relationships: [],
      characterArcs: []
    },
    
    // 步骤4: 情节架构
    plotStructure: {
      premise: '',
      mainConflict: '',
      threeActStructure: {
        act1: { setup: '', incitingIncident: '', plotPoint1: '' },
        act2: { confrontation: '', midpoint: '', plotPoint2: '' },
        act3: { climax: '', fallingAction: '', resolution: '' }
      },
      plotPoints: [],
      conflictLayers: [],
      pacing: {}
    },
    
    // 步骤5: 开篇设计
    openingDesign: {
      hook: '',
      atmosphere: '',
      settingIntroduction: '',
      characterIntroduction: '',
      openingScene: '',
      firstParagraph: ''
    },
    
    // 步骤6: 简介撰写
    synopsisWriting: {
      logline: '',
      shortSynopsis: '',
      longSynopsis: '',
      backCover: '',
      pitchPoints: [],
      hooks: []
    }
  })
  
  // 向导步骤配置（响应式数组）
  const wizardSteps = ref([
    {
      id: 'concept',
      title: '创意构思',
      description: '确定小说的核心概念和方向',
      tools: ['brainstorm', 'genre'],
      required: ['coreIdea', 'selectedGenre'],
      icon: '💡'
    },
    {
      id: 'worldbuilding',
      title: '世界构建',
      description: '构建小说的世界观和背景设定',
      tools: ['worldview'],
      required: ['worldType', 'coreRules'],
      icon: '🌍'
    },
    {
      id: 'characters',
      title: '角色设计',
      description: '创建主要角色和人物关系',
      tools: ['character'],
      required: ['protagonist'],
      icon: '👥'
    },
    {
      id: 'plot',
      title: '情节架构',
      description: '设计故事结构和冲突体系',
      tools: ['conflict', 'outline'],
      required: ['premise', 'mainConflict'],
      icon: '📖'
    },
    {
      id: 'opening',
      title: '开篇设计',
      description: '创造引人入胜的故事开头',
      tools: ['opening'],
      required: ['hook', 'openingScene'],
      icon: '🚀'
    },
    {
      id: 'synopsis',
      title: '简介撰写',
      description: '撰写吸引读者的小说简介',
      tools: ['synopsis'],
      required: ['shortSynopsis'],
      icon: '📝'
    }
  ])
  
  // 工具使用历史
  const toolUsageHistory = ref([])
  
  // 向导进度
  const wizardProgress = computed(() => {
    if (!wizardSteps.value.length) return 0
    return Math.round((currentStep.value / wizardSteps.value.length) * 100)
  })
  
  // 当前步骤信息
  const currentStepInfo = computed(() => {
    console.log('计算currentStepInfo:', { 
      currentStep: currentStep.value, 
      stepsLength: wizardSteps.value.length 
    })
    return wizardSteps.value[currentStep.value] || null;
  })
  
  // 检查步骤是否完成
  const isStepCompleted = (stepIndex) => {
    if (stepIndex >= wizardSteps.value.length) return false
    
    const step = wizardSteps.value[stepIndex]
    const stepData = wizardData[step.id]
    
    if (!stepData) return false
    
    return step.required.every(field => {
      const value = stepData[field]
      if (Array.isArray(value)) {
        return value.length > 0
      }
      return value && value.toString().trim() !== ''
    })
  }
  
  // 检查是否可以进入下一步
  const canProceedToNext = computed(() => {
    return isStepCompleted(currentStep.value)
  })
  
  // 检查是否可以完成向导
  const canCompleteWizard = computed(() => {
    return wizardSteps.value.every((_, index) => isStepCompleted(index))
  })
  
  // Actions
  const startWizard = (novelTitle = '') => {
    console.log('启动向导:', novelTitle)
    isWizardActive.value = true
    currentStep.value = 0
    wizardData.title = novelTitle
    wizardData.novelId = generateNovelId()
    
    // 清空之前的数据
    resetWizardData()
    
    // 确保步骤数据正确
    console.log('向导初始化完成:', {
      isActive: isWizardActive.value,
      currentStep: currentStep.value,
      stepsCount: wizardSteps.value.length,
      currentStepInfo: wizardSteps.value[currentStep.value]
    })
  }
  
  const resetWizardData = () => {
    Object.keys(wizardData).forEach(key => {
      if (key !== 'novelId' && key !== 'title') {
        const stepData = wizardData[key]
        if (typeof stepData === 'object' && stepData !== null) {
          Object.keys(stepData).forEach(subKey => {
            if (Array.isArray(stepData[subKey])) {
              stepData[subKey] = []
            } else if (typeof stepData[subKey] === 'object' && stepData[subKey] !== null) {
              // 递归重置嵌套对象
              const resetNestedObject = (obj) => {
                Object.keys(obj).forEach(nestedKey => {
                  if (Array.isArray(obj[nestedKey])) {
                    obj[nestedKey] = []
                  } else if (typeof obj[nestedKey] === 'object' && obj[nestedKey] !== null) {
                    resetNestedObject(obj[nestedKey])
                  } else {
                    obj[nestedKey] = ''
                  }
                })
              }
              resetNestedObject(stepData[subKey])
            } else {
              stepData[subKey] = ''
            }
          })
        }
      }
    })
  }
  
  const nextStep = () => {
    if (currentStep.value < wizardSteps.value.length - 1 && canProceedToNext.value) {
      currentStep.value++
    }
  }
  
  const previousStep = () => {
    if (currentStep.value > 0) {
      currentStep.value--
    }
  }
  
  const goToStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < wizardSteps.value.length) {
      currentStep.value = stepIndex
    }
  }
  
  const updateStepData = (stepId, field, value) => {
    console.log('更新步骤数据:', { stepId, field, value })
    
    // 确保步骤数据对象存在
    if (!wizardData[stepId]) {
      console.warn(`步骤数据 ${stepId} 不存在，正在创建...`)
      // 为concept步骤创建初始结构
      if (stepId === 'concept') {
        wizardData[stepId] = {
          coreIdea: '',
          selectedGenre: '',
          targetAudience: '',
          themes: [],
          brainstormResults: [],
          marketPotential: ''
        }
      } else {
        wizardData[stepId] = {}
      }
    }
    
    // 直接设置值
    wizardData[stepId][field] = value
    
    console.log('更新后的步骤数据:', wizardData[stepId])
    console.log('完整的wizardData:', Object.keys(wizardData).reduce((acc, key) => {
      acc[key] = Object.keys(wizardData[key] || {})
      return acc
    }, {}))
  }
  
  const addToolUsage = (toolType, stepId, result) => {
    toolUsageHistory.value.push({
      timestamp: Date.now(),
      toolType,
      stepId,
      result,
      id: generateId()
    })
  }
  
  const completeWizard = async () => {
    if (!canCompleteWizard.value) {
      throw new Error('向导流程未完成，请检查所有必填步骤')
    }
    
    try {
      // 将向导数据转换为小说数据结构
      const novelData = await convertWizardDataToNovel()
      
      // 保存到小说存储
      await saveNovelFromWizard(novelData)
      
      // 重置向导状态
      isWizardActive.value = false
      currentStep.value = 0
      
      return novelData
    } catch (error) {
      console.error('完成向导失败:', error)
      throw error
    }
  }
  
  const saveWizardProgress = () => {
    try {
      const progressData = {
        currentStep: currentStep.value,
        isWizardActive: isWizardActive.value,
        wizardData: toRaw(wizardData), // 确保序列化时去掉响应式包装
        toolUsageHistory: toolUsageHistory.value,
        timestamp: Date.now()
      }
      
      localStorage.setItem('wizardProgress', JSON.stringify(progressData))
      console.log('保存进度成功:', {
        currentStep: progressData.currentStep,
        isActive: progressData.isWizardActive,
        dataKeys: Object.keys(progressData.wizardData)
      })
    } catch (error) {
      console.error('保存向导进度失败:', error)
    }
  }
  
  const loadWizardProgress = () => {
    try {
      const saved = localStorage.getItem('wizardProgress')
      console.log('尝试从localStorage加载进度:', !!saved)
      
      if (saved) {
        const data = JSON.parse(saved)
        console.log('加载的进度数据:', {
          currentStep: data.currentStep,
          isWizardActive: data.isWizardActive,
          hasWizardData: !!data.wizardData,
          wizardDataKeys: data.wizardData ? Object.keys(data.wizardData) : []
        })
        
        // 恢复状态
        currentStep.value = data.currentStep || 0
        isWizardActive.value = data.isWizardActive || false
        
        // 恢复向导数据，保持响应性
        if (data.wizardData) {
          Object.keys(data.wizardData).forEach(key => {
            wizardData[key] = data.wizardData[key]
          })
        }
        
        // 恢复工具使用历史
        toolUsageHistory.value = data.toolUsageHistory || []
        
        console.log('进度加载完成:', {
          currentStep: currentStep.value,
          isActive: isWizardActive.value,
          dataKeys: Object.keys(wizardData)
        })
        
        return true
      }
      return false
    } catch (error) {
      console.error('加载向导进度失败:', error)
      return false
    }
  }
  
  // 将向导数据转换为小说数据结构
  const convertWizardDataToNovel = async () => {
    const { concept, worldBuilding, characterDesign, plotStructure, openingDesign, synopsisWriting } = wizardData
    
    return {
      id: wizardData.novelId,
      title: wizardData.title,
      
      // 基本信息
      genre: concept.selectedGenre,
      description: synopsisWriting.shortSynopsis,
      tags: concept.themes,
      targetAudience: concept.targetAudience,
      
      // 世界观设定
      worldSettings: [
        {
          id: generateId(),
          name: '世界类型',
          description: worldBuilding.worldType,
          category: 'basic'
        },
        {
          id: generateId(),
          name: '核心规则',
          description: worldBuilding.coreRules.join('; '),
          category: 'rules'
        },
        {
          id: generateId(),
          name: '力量体系',
          description: worldBuilding.powerSystem,
          category: 'power'
        },
        {
          id: generateId(),
          name: '社会结构',
          description: worldBuilding.socialStructure,
          category: 'society'
        }
      ].filter(setting => setting.description && setting.description.trim()),
      
      // 角色设定
      characters: [
        characterDesign.protagonist && {
          id: generateId(),
          ...characterDesign.protagonist,
          role: 'protagonist'
        },
        characterDesign.antagonist && {
          id: generateId(),
          ...characterDesign.antagonist,
          role: 'antagonist'
        },
        ...characterDesign.supporting.map(char => ({
          id: generateId(),
          ...char,
          role: 'supporting'
        })),
        ...characterDesign.background.map(char => ({
          id: generateId(),
          ...char,
          role: 'background'
        }))
      ].filter(Boolean),
      
      // 情节设定
      plotOutline: {
        premise: plotStructure.premise,
        mainConflict: plotStructure.mainConflict,
        structure: plotStructure.threeActStructure,
        plotPoints: plotStructure.plotPoints,
        conflicts: plotStructure.conflictLayers
      },
      
      // 开篇设计
      opening: {
        hook: openingDesign.hook,
        atmosphere: openingDesign.atmosphere,
        scene: openingDesign.openingScene,
        firstParagraph: openingDesign.firstParagraph
      },
      
      // 简介
      synopsis: {
        short: synopsisWriting.shortSynopsis,
        long: synopsisWriting.longSynopsis,
        logline: synopsisWriting.logline,
        backCover: synopsisWriting.backCover,
        hooks: synopsisWriting.hooks
      },
      
      // 创建时间
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      // 章节列表（初始为空）
      chapterList: [],
      
      // 工具使用历史
      toolHistory: toolUsageHistory.value,
      
      // 元数据
      metadata: {
        createdBy: 'wizard',
        wizardVersion: '1.0',
        completedSteps: wizardSteps.value.map((_, index) => isStepCompleted(index))
      }
    }
  }
  
  // 保存小说数据
  const saveNovelFromWizard = async (novelData) => {
    try {
      // 获取现有小说列表
      const existingNovels = JSON.parse(localStorage.getItem('novels') || '[]')
      
      // 检查是否已存在相同ID的小说
      const existingIndex = existingNovels.findIndex(novel => novel.id === novelData.id)
      
      if (existingIndex >= 0) {
        // 更新现有小说
        existingNovels[existingIndex] = novelData
      } else {
        // 添加新小说
        existingNovels.push(novelData)
      }
      
      // 保存到localStorage
      localStorage.setItem('novels', JSON.stringify(existingNovels))
      
      // 清理向导进度
      localStorage.removeItem('wizardProgress')
      
      return novelData
    } catch (error) {
      console.error('保存小说失败:', error)
      throw error
    }
  }
  
  // 辅助函数
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
  
  const generateNovelId = () => {
    return 'novel_' + generateId()
  }
  
  // 退出向导
  const exitWizard = () => {
    isWizardActive.value = false
    currentStep.value = 0
    // 可选择是否保存进度
  }
  
  // 获取步骤完成状态
  const getStepCompletionStatus = () => {
    return wizardSteps.value.map((_, index) => isStepCompleted(index))
  }
  
  return {
    // State
    currentStep,
    isWizardActive,
    wizardData,
    wizardSteps,
    toolUsageHistory,
    
    // Computed
    wizardProgress,
    currentStepInfo,
    canProceedToNext,
    canCompleteWizard,
    
    // Actions
    startWizard,
    resetWizardData,
    nextStep,
    previousStep,
    goToStep,
    updateStepData,
    addToolUsage,
    completeWizard,
    saveWizardProgress,
    loadWizardProgress,
    exitWizard,
    isStepCompleted,
    getStepCompletionStatus,
    
    // Utils
    generateId,
    generateNovelId
  }
})
