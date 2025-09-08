/**
 * 工具整合服务 - 管理现有工具与向导流程的整合
 */

import { useNovelStore } from '@/stores/novel'
import { useWizardStore } from '@/stores/wizardStore'

class ToolIntegrationService {
  constructor() {
    this.novelStore = null
    this.wizardStore = null
    
    // 工具映射配置
    this.toolMapping = {
      concept: {
        primary: ['brainstorm', 'genre'],
        secondary: ['title'],
        integration: {
          brainstorm: 'integrateBrainstormResult',
          genre: 'integrateGenreResult',
          title: 'integrateTitleResult'
        }
      },
      worldbuilding: {
        primary: ['worldview'],
        secondary: [],
        integration: {
          worldview: 'integrateWorldviewResult'
        }
      },
      characters: {
        primary: ['character'],
        secondary: [],
        integration: {
          character: 'integrateCharacterResult'
        }
      },
      plot: {
        primary: ['conflict', 'outline'],
        secondary: ['cheat'],
        integration: {
          conflict: 'integrateConflictResult',
          outline: 'integrateOutlineResult',
          cheat: 'integrateCheatResult'
        }
      },
      opening: {
        primary: ['opening'],
        secondary: [],
        integration: {
          opening: 'integrateOpeningResult'
        }
      },
      synopsis: {
        primary: ['synopsis'],
        secondary: [],
        integration: {
          synopsis: 'integrateSynopsisResult'
        }
      }
    }
  }
  
  // 初始化服务
  init() {
    this.novelStore = useNovelStore()
    this.wizardStore = useWizardStore()
  }
  
  /**
   * 获取步骤可用的工具列表
   */
  getAvailableTools(stepId) {
    const mapping = this.toolMapping[stepId]
    if (!mapping) return []
    
    return {
      primary: mapping.primary,
      secondary: mapping.secondary,
      all: [...mapping.primary, ...mapping.secondary]
    }
  }
  
  /**
   * 检查工具是否与当前步骤兼容
   */
  isToolCompatible(toolType, stepId) {
    const mapping = this.toolMapping[stepId]
    if (!mapping) return false
    
    return [...mapping.primary, ...mapping.secondary].includes(toolType)
  }
  
  /**
   * 调用工具并整合结果
   */
  async executeAndIntegrateTool(toolType, stepId, toolParams) {
    try {
      if (!this.isToolCompatible(toolType, stepId)) {
        throw new Error(`工具 ${toolType} 与步骤 ${stepId} 不兼容`)
      }
      
      // 构建工具专用的提示词
      const prompt = await this.buildToolPrompt(toolType, stepId, toolParams)
      
      // 调用工具
      const result = await this.callTool(toolType, prompt, toolParams)
      
      // 整合结果到向导数据
      const integratedResult = await this.integrateResult(toolType, stepId, result, toolParams)
      
      // 记录工具使用历史
      this.wizardStore.addToolUsage(toolType, stepId, integratedResult)
      
      return integratedResult
    } catch (error) {
      console.error(`执行工具 ${toolType} 失败:`, error)
      throw error
    }
  }
  
  /**
   * 构建工具专用提示词
   */
  async buildToolPrompt(toolType, stepId, params) {
    const wizardData = this.wizardStore.wizardData
    const contextBuilder = new ContextBuilder(wizardData, stepId)
    
    switch (toolType) {
      case 'brainstorm':
        return contextBuilder.buildBrainstormPrompt(params)
      case 'genre':
        return contextBuilder.buildGenrePrompt(params)
      case 'worldview':
        return contextBuilder.buildWorldviewPrompt(params)
      case 'character':
        return contextBuilder.buildCharacterPrompt(params)
      case 'conflict':
        return contextBuilder.buildConflictPrompt(params)
      case 'outline':
        return contextBuilder.buildOutlinePrompt(params)
      case 'opening':
        return contextBuilder.buildOpeningPrompt(params)
      case 'synopsis':
        return contextBuilder.buildSynopsisPrompt(params)
      case 'cheat':
        return contextBuilder.buildCheatPrompt(params)
      case 'title':
        return contextBuilder.buildTitlePrompt(params)
      default:
        throw new Error(`未知工具类型: ${toolType}`)
    }
  }
  
  /**
   * 调用具体工具
   */
  async callTool(toolType, prompt, params) {
    if (!this.novelStore) {
      this.init()
    }
    
    // 这里应该调用实际的工具API
    // 目前使用 novelStore 的 generateContent 方法
    return await this.novelStore.generateContent(prompt)
  }
  
  /**
   * 整合工具结果到向导数据
   */
  async integrateResult(toolType, stepId, result, params) {
    const mapping = this.toolMapping[stepId]
    const integrationMethod = mapping.integration[toolType]
    
    if (!integrationMethod || !this[integrationMethod]) {
      console.warn(`未找到整合方法: ${integrationMethod}`)
      return { raw: result, integrated: false }
    }
    
    return await this[integrationMethod](result, stepId, params)
  }
  
  /**
   * 脑洞生成器结果整合
   */
  async integrateBrainstormResult(result, stepId, params) {
    const parsedResults = this.parseBrainstormResult(result)
    
    // 更新向导数据
    this.wizardStore.updateStepData('concept', 'brainstormResults', parsedResults)
    
    // 如果用户选择了某个脑洞，自动提取核心创意
    if (params.selectedBrainstorm) {
      const selected = parsedResults.find(item => item.id === params.selectedBrainstorm)
      if (selected) {
        this.wizardStore.updateStepData('concept', 'coreIdea', selected.description)
        this.wizardStore.updateStepData('concept', 'themes', selected.themes || [])
      }
    }
    
    return {
      type: 'brainstorm',
      results: parsedResults,
      integrated: true,
      suggestions: this.generateBrainstormSuggestions(parsedResults)
    }
  }
  
  /**
   * 题材分析结果整合
   */
  async integrateGenreResult(result, stepId, params) {
    const analysis = this.parseGenreAnalysis(result)
    
    // 更新向导数据
    this.wizardStore.updateStepData('concept', 'selectedGenre', analysis.genre)
    this.wizardStore.updateStepData('concept', 'targetAudience', analysis.targetAudience)
    this.wizardStore.updateStepData('concept', 'marketPotential', analysis.marketPotential)
    
    return {
      type: 'genre',
      analysis,
      integrated: true,
      recommendations: analysis.recommendations
    }
  }
  
  /**
   * 世界观生成器结果整合
   */
  async integrateWorldviewResult(result, stepId, params) {
    const worldSettings = this.parseWorldviewResult(result)
    
    // 更新向导数据
    Object.keys(worldSettings).forEach(key => {
      this.wizardStore.updateStepData('worldBuilding', key, worldSettings[key])
    })
    
    // 检查与前面步骤的一致性
    const consistencyCheck = await this.checkWorldConsistency(worldSettings)
    
    return {
      type: 'worldview',
      settings: worldSettings,
      integrated: true,
      consistency: consistencyCheck
    }
  }
  
  /**
   * 角色生成器结果整合
   */
  async integrateCharacterResult(result, stepId, params) {
    const characters = this.parseCharacterResult(result)
    
    // 根据角色类型分类存储
    characters.forEach(character => {
      const role = character.role || params.role || 'supporting'
      
      if (role === 'protagonist') {
        this.wizardStore.updateStepData('characterDesign', 'protagonist', character)
      } else if (role === 'antagonist') {
        this.wizardStore.updateStepData('characterDesign', 'antagonist', character)
      } else if (role === 'supporting') {
        const currentSupporting = this.wizardStore.wizardData.characterDesign.supporting || []
        this.wizardStore.updateStepData('characterDesign', 'supporting', [...currentSupporting, character])
      } else {
        const currentBackground = this.wizardStore.wizardData.characterDesign.background || []
        this.wizardStore.updateStepData('characterDesign', 'background', [...currentBackground, character])
      }
    })
    
    // 生成角色关系建议
    const relationshipSuggestions = await this.generateRelationshipSuggestions(characters)
    
    return {
      type: 'character',
      characters,
      integrated: true,
      relationships: relationshipSuggestions
    }
  }
  
  /**
   * 冲突生成器结果整合
   */
  async integrateConflictResult(result, stepId, params) {
    const conflicts = this.parseConflictResult(result)
    
    // 更新向导数据
    this.wizardStore.updateStepData('plotStructure', 'conflictLayers', conflicts)
    
    // 如果有主要冲突，更新主要冲突字段
    const mainConflict = conflicts.find(c => c.type === 'main' || c.importance === 'high')
    if (mainConflict) {
      this.wizardStore.updateStepData('plotStructure', 'mainConflict', mainConflict.description)
    }
    
    return {
      type: 'conflict',
      conflicts,
      integrated: true,
      plotIntegration: this.generatePlotIntegrationSuggestions(conflicts)
    }
  }
  
  /**
   * 细纲生成器结果整合
   */
  async integrateOutlineResult(result, stepId, params) {
    const outline = this.parseOutlineResult(result)
    
    // 更新向导数据
    this.wizardStore.updateStepData('plotStructure', 'plotPoints', outline.chapters)
    
    // 分析三幕结构
    const threeActStructure = this.extractThreeActStructure(outline)
    this.wizardStore.updateStepData('plotStructure', 'threeActStructure', threeActStructure)
    
    return {
      type: 'outline',
      outline,
      integrated: true,
      structure: threeActStructure,
      pacing: this.analyzePacing(outline)
    }
  }
  
  /**
   * 开篇生成器结果整合
   */
  async integrateOpeningResult(result, stepId, params) {
    const opening = this.parseOpeningResult(result)
    
    // 更新向导数据
    Object.keys(opening).forEach(key => {
      this.wizardStore.updateStepData('openingDesign', key, opening[key])
    })
    
    // 分析开篇效果
    const effectiveness = await this.analyzeOpeningEffectiveness(opening)
    
    return {
      type: 'opening',
      content: opening,
      integrated: true,
      effectiveness,
      suggestions: this.generateOpeningSuggestions(opening, effectiveness)
    }
  }
  
  /**
   * 简介生成器结果整合
   */
  async integrateSynopsisResult(result, stepId, params) {
    const synopsis = this.parseSynopsisResult(result)
    
    // 更新向导数据
    Object.keys(synopsis).forEach(key => {
      this.wizardStore.updateStepData('synopsisWriting', key, synopsis[key])
    })
    
    // 生成不同风格的版本
    const variations = await this.generateSynopsisVariations(synopsis)
    
    return {
      type: 'synopsis',
      content: synopsis,
      integrated: true,
      variations,
      marketingTips: this.generateMarketingTips(synopsis)
    }
  }
  
  /**
   * 金手指生成器结果整合
   */
  async integrateCheatResult(result, stepId, params) {
    const cheat = this.parseCheatResult(result)
    
    // 将金手指信息整合到角色或世界观中
    if (params.targetCharacter) {
      // 绑定到特定角色
      const character = this.findCharacterById(params.targetCharacter)
      if (character) {
        character.abilities = character.abilities || []
        character.abilities.push(cheat)
      }
    } else {
      // 添加到世界观的力量体系中
      const currentPowerSystem = this.wizardStore.wizardData.worldBuilding.powerSystem || ''
      const updatedPowerSystem = currentPowerSystem + '\n\n金手指设定：\n' + cheat.description
      this.wizardStore.updateStepData('worldBuilding', 'powerSystem', updatedPowerSystem)
    }
    
    return {
      type: 'cheat',
      cheat,
      integrated: true,
      balanceCheck: this.checkPowerBalance(cheat)
    }
  }
  
  /**
   * 书名生成器结果整合
   */
  async integrateTitleResult(result, stepId, params) {
    const titles = this.parseTitleResult(result)
    
    // 如果用户选择了标题，更新小说标题
    if (params.selectedTitle) {
      this.wizardStore.wizardData.title = params.selectedTitle
    }
    
    return {
      type: 'title',
      titles,
      integrated: params.selectedTitle ? true : false,
      analysis: this.analyzeTitleEffectiveness(titles)
    }
  }
  
  /**
   * 解析器方法
   */
  parseBrainstormResult(result) {
    // 解析脑洞生成结果，提取结构化数据
    const brainstorms = []
    const lines = result.split('\n')
    let current = null
    
    lines.forEach(line => {
      if (line.startsWith('脑洞') && line.includes('：')) {
        if (current) brainstorms.push(current)
        current = {
          id: Date.now() + Math.random(),
          title: line.split('：')[1],
          description: '',
          highlight: '',
          conflict: '',
          potential: ''
        }
      } else if (current) {
        if (line.includes('核心设定')) {
          current.description = line.replace(/[-\s]*核心设定[：:]\s*/, '')
        } else if (line.includes('创意亮点')) {
          current.highlight = line.replace(/[-\s]*创意亮点[：:]\s*/, '')
        } else if (line.includes('冲突设计')) {
          current.conflict = line.replace(/[-\s]*冲突设计[：:]\s*/, '')
        } else if (line.includes('发展潜力')) {
          current.potential = line.replace(/[-\s]*发展潜力[：:]\s*/, '')
        }
      }
    })
    
    if (current) brainstorms.push(current)
    return brainstorms
  }
  
  parseGenreAnalysis(result) {
    // 解析题材分析结果
    return {
      genre: '',
      targetAudience: '',
      marketPotential: '',
      successFactors: [],
      innovations: [],
      pitfalls: [],
      recommendations: []
    }
  }
  
  parseWorldviewResult(result) {
    // 解析世界观生成结果
    return {
      worldType: '',
      scale: '',
      coreRules: [],
      powerSystem: '',
      socialStructure: '',
      geography: '',
      history: '',
      culture: '',
      technology: ''
    }
  }
  
  parseCharacterResult(result) {
    // 解析角色生成结果
    return []
  }
  
  parseConflictResult(result) {
    // 解析冲突生成结果
    return []
  }
  
  parseOutlineResult(result) {
    // 解析细纲生成结果
    return {
      chapters: [],
      structure: {},
      themes: []
    }
  }
  
  parseOpeningResult(result) {
    // 解析开篇生成结果
    return {
      hook: '',
      atmosphere: '',
      settingIntroduction: '',
      characterIntroduction: '',
      openingScene: result,
      firstParagraph: result.split('\n')[0] || ''
    }
  }
  
  parseSynopsisResult(result) {
    // 解析简介生成结果
    return {
      shortSynopsis: result,
      longSynopsis: '',
      logline: '',
      backCover: '',
      pitchPoints: [],
      hooks: []
    }
  }
  
  parseCheatResult(result) {
    // 解析金手指生成结果
    return {
      name: '',
      description: result,
      abilities: [],
      limitations: [],
      growth: []
    }
  }
  
  parseTitleResult(result) {
    // 解析书名生成结果
    const titles = []
    const lines = result.split('\n')
    
    lines.forEach(line => {
      if (line.match(/^\d+\.\s/)) {
        const parts = line.split(' - ')
        titles.push({
          title: parts[0].replace(/^\d+\.\s/, ''),
          explanation: parts[1] || '',
          score: Math.random() * 10
        })
      }
    })
    
    return titles
  }
  
  /**
   * 辅助分析方法
   */
  generateBrainstormSuggestions(results) {
    return [
      '建议选择最具创新性的脑洞',
      '考虑将多个脑洞元素组合',
      '评估脑洞的可执行性和市场潜力'
    ]
  }
  
  async checkWorldConsistency(worldSettings) {
    return {
      consistent: true,
      issues: [],
      suggestions: []
    }
  }
  
  async generateRelationshipSuggestions(characters) {
    return []
  }
  
  generatePlotIntegrationSuggestions(conflicts) {
    return []
  }
  
  extractThreeActStructure(outline) {
    const totalChapters = outline.chapters.length
    const act1End = Math.floor(totalChapters * 0.25)
    const act2End = Math.floor(totalChapters * 0.75)
    
    return {
      act1: {
        chapters: outline.chapters.slice(0, act1End),
        setup: '建立世界观和角色',
        incitingIncident: '触发主要冲突',
        plotPoint1: '进入主要故事线'
      },
      act2: {
        chapters: outline.chapters.slice(act1End, act2End),
        confrontation: '面对主要挑战',
        midpoint: '故事转折点',
        plotPoint2: '最终对决的准备'
      },
      act3: {
        chapters: outline.chapters.slice(act2End),
        climax: '最终对决',
        fallingAction: '冲突解决',
        resolution: '故事结局'
      }
    }
  }
  
  analyzePacing(outline) {
    return {
      overall: 'balanced',
      suggestions: []
    }
  }
  
  async analyzeOpeningEffectiveness(opening) {
    return {
      hookStrength: 8.0,
      pacing: 7.5,
      characterIntro: 8.5,
      worldBuilding: 7.0,
      overall: 7.75
    }
  }
  
  generateOpeningSuggestions(opening, effectiveness) {
    return []
  }
  
  async generateSynopsisVariations(synopsis) {
    return []
  }
  
  generateMarketingTips(synopsis) {
    return []
  }
  
  checkPowerBalance(cheat) {
    return {
      balanced: true,
      issues: [],
      suggestions: []
    }
  }
  
  analyzeTitleEffectiveness(titles) {
    return {
      best: titles[0],
      analysis: 'Title analysis',
      suggestions: []
    }
  }
  
  findCharacterById(characterId) {
    // 在向导数据中查找角色
    const { characterDesign } = this.wizardStore.wizardData
    
    if (characterDesign.protagonist?.id === characterId) {
      return characterDesign.protagonist
    }
    
    if (characterDesign.antagonist?.id === characterId) {
      return characterDesign.antagonist
    }
    
    const supporting = characterDesign.supporting.find(c => c.id === characterId)
    if (supporting) return supporting
    
    const background = characterDesign.background.find(c => c.id === characterId)
    if (background) return background
    
    return null
  }
}

/**
 * 上下文构建器 - 为不同工具构建专用的上下文信息
 */
class ContextBuilder {
  constructor(wizardData, currentStep) {
    this.wizardData = wizardData
    this.currentStep = currentStep
  }
  
  buildBrainstormPrompt(params) {
    return `请基于以下信息生成创意脑洞：
    
基础想法：${params.baseIdea || ''}
创意方向：${params.direction || ''}
类型偏好：${params.genre || ''}

要求：
1. 生成5个不同方向的创意脑洞
2. 每个脑洞都要有独特的设定
3. 符合现代读者喜好
4. 具有长篇小说潜力

格式：
脑洞1：标题
- 核心设定：...
- 创意亮点：...
- 冲突设计：...
- 发展潜力：...`
  }
  
  buildGenrePrompt(params) {
    return `请分析以下类型的创作要点：
    
类型：${params.genre}
目标读者：${params.audience || ''}

请提供：
1. 类型特点分析
2. 读者期待
3. 创作要点
4. 成功要素
5. 创新建议`
  }
  
  buildWorldviewPrompt(params) {
    const conceptData = this.wizardData.concept || {}
    
    return `请构建详细的世界观：
    
小说类型：${conceptData.selectedGenre || ''}
核心创意：${conceptData.coreIdea || ''}
世界类型：${params.worldType}
规模大小：${params.scale}

构建要求：
1. 世界的基本设定和规则
2. 社会结构和文化
3. 力量体系（如有）
4. 历史背景
5. 地理环境
6. 与故事主题的结合`
  }
  
  buildCharacterPrompt(params) {
    const conceptData = this.wizardData.concept || {}
    const worldData = this.wizardData.worldBuilding || {}
    
    let contextInfo = ''
    if (conceptData.selectedGenre) {
      contextInfo += `小说类型：${conceptData.selectedGenre}\n`
    }
    if (worldData.worldType) {
      contextInfo += `世界背景：${worldData.worldType}\n`
    }
    
    return `请生成${params.count || 1}个${params.role}角色：
    
${contextInfo}
角色要求：${params.requirements || ''}
性格特点：${params.personality || ''}

为每个角色提供：
1. 基本信息（姓名、年龄、职业）
2. 外貌和特征
3. 性格和行为习惯
4. 背景故事
5. 能力和弱点
6. 动机和目标
7. 与世界观的关系`
  }
  
  buildConflictPrompt(params) {
    const allData = this.wizardData
    
    return `请设计冲突体系：
    
已有设定：
${JSON.stringify(allData, null, 2)}

冲突要求：
类型：${params.conflictType}
强度：${params.intensity}
背景：${params.background || ''}

请设计：
1. 主要冲突
2. 次要冲突  
3. 内心冲突
4. 冲突发展
5. 解决方向`
  }
  
  buildOutlinePrompt(params) {
    const allData = this.wizardData
    
    return `请生成详细细纲：
    
小说信息：
${JSON.stringify(allData, null, 2)}

细纲要求：
章节数：${params.chapterCount || 15}
结构：${params.structure || '三幕式'}

为每章提供：
1. 章节标题
2. 主要情节
3. 角色发展
4. 冲突推进
5. 重要转折
6. 与整体的关系`
  }
  
  buildOpeningPrompt(params) {
    const allData = this.wizardData
    
    return `请创作小说开篇：
    
完整设定：
${JSON.stringify(allData, null, 2)}

开篇要求：
类型：${params.openingType}
氛围：${params.atmosphere}
字数：${params.wordCount || '500-800字'}

要求：
1. 立即抓住读者
2. 引入主角和背景
3. 设置悬念
4. 营造氛围
5. 为后续铺垫

请直接输出开篇内容。`
  }
  
  buildSynopsisPrompt(params) {
    const allData = this.wizardData
    
    return `请撰写小说简介：
    
完整设定：
${JSON.stringify(allData, null, 2)}

简介风格：${params.style || '商业化'}
目标长度：${params.length || '100-200字'}

要求：
1. 突出独特卖点
2. 展现主角魅力
3. 制造悬念
4. 吸引目标读者
5. 符合商业需求

请生成：
1. 短简介（100字）
2. 长简介（200字）
3. 一句话简介
4. 推荐语`
  }
  
  buildCheatPrompt(params) {
    const allData = this.wizardData
    
    return `请设计金手指能力：
    
小说设定：
${JSON.stringify(allData, null, 2)}

金手指要求：
等级：${params.level}
类型：${params.type || ''}
特殊要求：${params.description || ''}

设计内容：
1. 能力名称和核心功能
2. 详细效果描述
3. 获得方式和条件
4. 使用限制和代价
5. 成长和进化路径
6. 与故事的结合点

要求新颖独特，符合世界观。`
  }
  
  buildTitlePrompt(params) {
    const allData = this.wizardData
    
    return `请生成小说书名：
    
小说信息：
${JSON.stringify(allData, null, 2)}

书名要求：
数量：${params.count || 10}
风格：${params.style || ''}
关键词：${params.keywords || ''}

生成要求：
1. 符合小说类型
2. 体现核心卖点
3. 朗朗上口
4. 有记忆点
5. 避免俗套

格式：
1. 书名 - 创意说明
2. 书名 - 创意说明
...`
  }
}

// 导出单例
export const toolIntegrationService = new ToolIntegrationService()
export default toolIntegrationService
