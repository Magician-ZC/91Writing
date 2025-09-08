/**
 * 向导服务 - 处理向导流程的核心逻辑
 */

import { useNovelStore } from '@/stores/novel'
import { useWizardStore } from '@/stores/wizardStore'

class WizardService {
  constructor() {
    this.novelStore = null
    this.wizardStore = null
  }
  
  // 初始化服务
  init() {
    this.novelStore = useNovelStore()
    this.wizardStore = useWizardStore()
  }
  
  /**
   * 步骤执行器 - 执行特定步骤的工具和逻辑
   */
  async executeStep(stepId, userInput = {}) {
    try {
      switch (stepId) {
        case 'concept':
          return await this.executeConceptStep(userInput)
        case 'worldbuilding':
          return await this.executeWorldBuildingStep(userInput)
        case 'characters':
          return await this.executeCharacterStep(userInput)
        case 'plot':
          return await this.executePlotStep(userInput)
        case 'opening':
          return await this.executeOpeningStep(userInput)
        case 'synopsis':
          return await this.executeSynopsisStep(userInput)
        default:
          throw new Error(`未知的步骤: ${stepId}`)
      }
    } catch (error) {
      console.error(`执行步骤 ${stepId} 失败:`, error)
      throw error
    }
  }
  
  /**
   * 步骤1: 创意构思
   */
  async executeConceptStep(userInput) {
    const results = {}
    
    // 如果用户提供了基础想法，先生成脑洞
    if (userInput.baseIdea) {
      const brainstormPrompt = this.buildBrainstormPrompt(userInput)
      results.brainstormResults = await this.callAITool('brainstorm', brainstormPrompt)
    }
    
    // 如果用户选择了类型，分析题材潜力
    if (userInput.preferredGenre) {
      const genrePrompt = this.buildGenreAnalysisPrompt(userInput)
      results.genreAnalysis = await this.callAITool('genre', genrePrompt)
    }
    
    // 市场潜力评估
    if (userInput.coreIdea && userInput.preferredGenre) {
      results.marketAnalysis = await this.analyzeMarketPotential(userInput.coreIdea, userInput.preferredGenre)
    }
    
    return results
  }
  
  /**
   * 步骤2: 世界构建
   */
  async executeWorldBuildingStep(userInput) {
    const conceptData = this.wizardStore.wizardData.concept
    
    const worldviewPrompt = this.buildWorldviewPrompt({
      ...userInput,
      genre: conceptData.selectedGenre,
      coreIdea: conceptData.coreIdea,
      themes: conceptData.themes
    })
    
    const worldSettings = await this.callAITool('worldview', worldviewPrompt)
    
    return {
      worldSettings,
      consistency: await this.checkWorldConsistency(worldSettings, conceptData)
    }
  }
  
  /**
   * 步骤3: 角色设计
   */
  async executeCharacterStep(userInput) {
    const conceptData = this.wizardStore.wizardData.concept
    const worldData = this.wizardStore.wizardData.worldBuilding
    
    const results = {}
    
    // 生成主角
    if (userInput.needProtagonist) {
      const protagonistPrompt = this.buildCharacterPrompt({
        role: 'protagonist',
        count: 1,
        worldContext: worldData,
        genreContext: conceptData.selectedGenre,
        plotContext: conceptData.coreIdea,
        ...userInput.protagonistRequirements
      })
      results.protagonist = await this.callAITool('character', protagonistPrompt)
    }
    
    // 生成配角
    if (userInput.supportingCount > 0) {
      const supportingPrompt = this.buildCharacterPrompt({
        role: 'supporting',
        count: userInput.supportingCount,
        worldContext: worldData,
        genreContext: conceptData.selectedGenre,
        ...userInput.supportingRequirements
      })
      results.supporting = await this.callAITool('character', supportingPrompt)
    }
    
    // 生成反角
    if (userInput.needAntagonist) {
      const antagonistPrompt = this.buildCharacterPrompt({
        role: 'antagonist',
        count: 1,
        worldContext: worldData,
        genreContext: conceptData.selectedGenre,
        conflictContext: userInput.mainConflict,
        ...userInput.antagonistRequirements
      })
      results.antagonist = await this.callAITool('character', antagonistPrompt)
    }
    
    // 分析角色关系
    if (results.protagonist || results.supporting || results.antagonist) {
      results.relationships = await this.analyzeCharacterRelationships(results)
    }
    
    return results
  }
  
  /**
   * 步骤4: 情节架构
   */
  async executePlotStep(userInput) {
    const conceptData = this.wizardStore.wizardData.concept
    const worldData = this.wizardStore.wizardData.worldBuilding
    const characterData = this.wizardStore.wizardData.characterDesign
    
    const results = {}
    
    // 生成冲突体系
    if (userInput.needConflictDesign) {
      const conflictPrompt = this.buildConflictPrompt({
        worldContext: worldData,
        characters: characterData,
        genre: conceptData.selectedGenre,
        themes: conceptData.themes,
        ...userInput.conflictRequirements
      })
      results.conflicts = await this.callAITool('conflict', conflictPrompt)
    }
    
    // 生成细纲
    if (userInput.needOutline) {
      const outlinePrompt = this.buildOutlinePrompt({
        premise: userInput.premise,
        mainConflict: userInput.mainConflict,
        worldContext: worldData,
        characters: characterData,
        conflicts: results.conflicts,
        chapterCount: userInput.chapterCount || 15
      })
      results.outline = await this.callAITool('outline', outlinePrompt)
    }
    
    // 分析三幕结构
    if (userInput.premise && userInput.mainConflict) {
      results.threeActStructure = await this.analyzeThreeActStructure({
        premise: userInput.premise,
        mainConflict: userInput.mainConflict,
        characters: characterData
      })
    }
    
    return results
  }
  
  /**
   * 步骤5: 开篇设计
   */
  async executeOpeningStep(userInput) {
    const allPreviousData = {
      concept: this.wizardStore.wizardData.concept,
      world: this.wizardStore.wizardData.worldBuilding,
      characters: this.wizardStore.wizardData.characterDesign,
      plot: this.wizardStore.wizardData.plotStructure
    }
    
    const openingPrompt = this.buildOpeningPrompt({
      ...userInput,
      context: allPreviousData
    })
    
    const openingContent = await this.callAITool('opening', openingPrompt)
    
    return {
      openingContent,
      analysis: await this.analyzeOpeningEffectiveness(openingContent)
    }
  }
  
  /**
   * 步骤6: 简介撰写
   */
  async executeSynopsisStep(userInput) {
    const allData = this.wizardStore.wizardData
    
    const synopsisPrompt = this.buildSynopsisPrompt({
      ...userInput,
      novelData: allData
    })
    
    const synopsis = await this.callAITool('synopsis', synopsisPrompt)
    
    return {
      synopsis,
      variations: await this.generateSynopsisVariations(synopsis, allData),
      effectiveness: await this.analyzeSynopsisEffectiveness(synopsis)
    }
  }
  
  /**
   * 提示词构建器
   */
  buildBrainstormPrompt(input) {
    return `请基于以下基础想法生成5个创意脑洞：

基础想法：${input.baseIdea}
期望类型：${input.preferredGenre || '不限'}
创意程度：${input.creativity || '新颖'}

要求：
1. 每个脑洞都要有独特的设定亮点
2. 符合现代读者的阅读偏好
3. 具有可扩展为长篇小说的潜力
4. 包含吸引点和冲突设计
5. 避免常见俗套

请按照以下格式输出：
脑洞1：标题
- 核心设定
- 创意亮点
- 冲突设计
- 发展潜力`
  }
  
  buildGenreAnalysisPrompt(input) {
    return `请分析以下小说类型的市场潜力和创作要点：

类型：${input.preferredGenre}
目标读者：${input.targetAudience || '全年龄'}
期望元素：${input.preferredElements || '无特殊要求'}

请提供：
1. 该类型的当前市场状况
2. 读者群体分析
3. 成功要素总结
4. 创新突破点建议
5. 常见误区提醒`
  }
  
  buildWorldviewPrompt(input) {
    return `请根据以下信息构建详细的世界观设定：

小说类型：${input.genre}
核心创意：${input.coreIdea}
世界类型：${input.worldType}
世界规模：${input.scale}
主题元素：${input.themes?.join('、') || ''}

请构建包含以下要素的世界观：
1. 世界的基本架构和物理规则
2. 社会制度和权力结构
3. 文化传统和价值观念
4. 科技/魔法/超能力体系
5. 历史背景和重要事件
6. 地理环境和重要地点
7. 经济体系和日常生活

要求：
- 设定合理，富有内在逻辑
- 与故事主题高度契合
- 为冲突和情节发展提供支撑
- 具有独特性和吸引力`
  }
  
  buildCharacterPrompt(input) {
    const contextInfo = input.worldContext ? `
世界背景：${JSON.stringify(input.worldContext, null, 2)}` : ''
    
    return `请生成${input.count}个${this.getRoleDisplayName(input.role)}角色：

角色定位：${input.role}
数量：${input.count}
小说类型：${input.genreContext}
${contextInfo}

要求：
1. 每个角色都要有独特的个性特征
2. 符合世界观设定
3. 与故事冲突和主题相关
4. 具有成长潜力和发展空间
5. 角色间要有差异化

请为每个角色提供：
- 基本信息（姓名、年龄、职业等）
- 外貌特征和穿着风格
- 性格特点和行为习惯
- 背景故事和成长经历
- 能力特长和弱点
- 内心动机和目标
- 与其他角色的潜在关系`
  }
  
  buildConflictPrompt(input) {
    return `请设计多层次的冲突体系：

世界背景：${JSON.stringify(input.worldContext, null, 2)}
主要角色：${JSON.stringify(input.characters, null, 2)}
小说类型：${input.genre}

请设计：
1. 主要冲突（故事核心矛盾）
2. 次要冲突（支线矛盾）
3. 内心冲突（角色内在矛盾）
4. 环境冲突（外在阻碍）
5. 人际冲突（角色间矛盾）

每个冲突都要包括：
- 冲突起因和背景
- 参与方和立场
- 发展过程和升级点
- 解决方向和影响`
  }
  
  buildOutlinePrompt(input) {
    return `请生成详细的章节细纲：

故事前提：${input.premise}
主要冲突：${input.mainConflict}
预计章节：${input.chapterCount}章
世界设定：${JSON.stringify(input.worldContext, null, 2)}
角色设定：${JSON.stringify(input.characters, null, 2)}

请为每章提供：
1. 章节标题和主要情节
2. POV角色和场景设置
3. 情节推进和转折点
4. 角色发展和关系变化
5. 伏笔埋设和悬念制造
6. 与整体结构的关系

要求：
- 遵循三幕式结构
- 保持合理的故事节奏
- 确保情节逻辑连贯
- 每章都有明确的故事功能`
  }
  
  buildOpeningPrompt(input) {
    const context = input.context
    return `请创作引人入胜的小说开篇：

开篇类型：${input.openingType}
氛围要求：${input.atmosphere}
字数要求：${input.wordCount || '500-800字'}

故事背景：
- 类型：${context.concept.selectedGenre}
- 世界：${context.world.worldType}
- 主角：${context.characters.protagonist?.name || '待定'}
- 主要冲突：${context.plot.premise}

开篇要求：
1. 立即抓住读者注意力
2. 巧妙引入主角和背景
3. 设置悬念或冲突点
4. 营造指定的氛围
5. 为后续发展做铺垫
6. 符合类型特色

请直接输出开篇内容，无需其他说明。`
  }
  
  buildSynopsisPrompt(input) {
    const novelData = input.novelData
    return `请撰写吸引人的小说简介：

小说标题：${novelData.title}
类型：${novelData.concept.selectedGenre}
主题：${novelData.concept.themes?.join('、')}

故事要素：
- 主角：${novelData.characterDesign.protagonist?.name}
- 世界：${novelData.worldBuilding.worldType}
- 冲突：${novelData.plotStructure.premise}

简介要求：
1. 突出故事独特卖点
2. 展现主角魅力
3. 营造悬念和期待
4. 控制在100-200字
5. 符合${input.style || '商业化'}风格

请生成：
1. 短简介（100字内）
2. 长简介（200字内）
3. 一句话简介（logline）
4. 推荐语（50字内）`
  }
  
  /**
   * 分析和辅助方法
   */
  async analyzeMarketPotential(coreIdea, genre) {
    // 模拟市场潜力分析
    const prompt = `请分析以下创意的市场潜力：
    
创意：${coreIdea}
类型：${genre}

请从以下维度分析：
1. 读者群体大小和特征
2. 市场竞争激烈程度
3. 商业化前景
4. 创新度评估
5. 风险因素
6. 建议优化方向

请给出1-10分的评分和详细说明。`
    
    return await this.callAITool('analysis', prompt)
  }
  
  async checkWorldConsistency(worldSettings, conceptData) {
    // 检查世界观与概念的一致性
    return {
      consistency: 0.9,
      issues: [],
      suggestions: []
    }
  }
  
  async analyzeCharacterRelationships(characters) {
    // 分析角色关系网络
    const relationships = []
    
    // 简单的关系分析逻辑
    if (characters.protagonist && characters.antagonist) {
      relationships.push({
        type: 'conflict',
        characters: [characters.protagonist.name, characters.antagonist.name],
        description: '主角与反角的核心对立关系'
      })
    }
    
    return relationships
  }
  
  async analyzeThreeActStructure(input) {
    // 分析并构建三幕结构
    return {
      act1: {
        setup: `建立${input.characters.protagonist?.name || '主角'}和基本世界观`,
        incitingIncident: '触发主要冲突的事件',
        plotPoint1: '主角做出重要决定，进入主要冲突'
      },
      act2: {
        confrontation: '主角面对各种挑战和阻碍',
        midpoint: '故事的重大转折点',
        plotPoint2: '最终对决前的关键事件'
      },
      act3: {
        climax: '主角与主要冲突的最终对决',
        fallingAction: '冲突解决后的后续处理',
        resolution: '故事的圆满结局'
      }
    }
  }
  
  async analyzeOpeningEffectiveness(openingContent) {
    // 分析开篇效果
    return {
      hookStrength: 8.5,
      pacing: 7.8,
      characterIntroduction: 8.2,
      worldBuilding: 7.5,
      overallScore: 8.0,
      suggestions: [
        '可以加强悬念制造',
        '角色引入自然流畅',
        '世界观展示合理'
      ]
    }
  }
  
  async generateSynopsisVariations(baseSynopsis, novelData) {
    // 生成简介的不同版本
    return [
      { style: '悬疑版', content: '强调悬念和神秘元素的版本' },
      { style: '情感版', content: '突出情感和人物关系的版本' },
      { style: '动作版', content: '强调动作和冒险的版本' }
    ]
  }
  
  async analyzeSynopsisEffectiveness(synopsis) {
    // 分析简介效果
    return {
      attractiveness: 8.3,
      clarity: 8.7,
      uniqueness: 7.9,
      marketAppeal: 8.1,
      suggestions: [
        '突出独特卖点',
        '增强情感共鸣',
        '优化节奏感'
      ]
    }
  }
  
  /**
   * AI工具调用
   */
  async callAITool(toolType, prompt) {
    try {
      if (!this.novelStore) {
        this.init()
      }
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
      
      // 这里应该调用实际的AI API
      // const result = await this.novelStore.generateContent(prompt)
      
      // 临时返回模拟数据
      return this.getMockToolResult(toolType, prompt)
    } catch (error) {
      console.error(`调用AI工具 ${toolType} 失败:`, error)
      throw error
    }
  }
  
  /**
   * 模拟工具结果（开发阶段使用）
   */
  getMockToolResult(toolType, prompt) {
    switch (toolType) {
      case 'brainstorm':
        return [
          {
            title: '未来科技侦探',
            setting: '2080年，AI侦探与人类搭档',
            highlight: '人工智能与人性的碰撞',
            conflict: 'AI是否能理解人类的情感动机',
            potential: '探讨科技与人性的永恒话题'
          }
        ]
      
      case 'genre':
        return {
          marketStatus: '科幻悬疑类型持续受欢迎',
          audience: '年轻都市读者群体',
          successFactors: ['新颖设定', '紧凑节奏', '深刻主题'],
          innovations: ['融合AI元素', '探讨伦理问题'],
          pitfalls: ['避免纯技术堆砌', '保持人文关怀']
        }
      
      case 'character':
        return {
          name: '林晓',
          age: 28,
          occupation: '刑警',
          appearance: '身材匀称，眼神锐利',
          personality: '理性冷静，但内心温暖',
          background: '警校毕业，有着强烈的正义感',
          abilities: '逻辑推理、观察细节',
          weaknesses: '有时过于相信理性',
          motivation: '守护城市的安全与和谐',
          relationships: []
        }
      
      default:
        return `基于提示词生成的${toolType}内容：\n\n${prompt.substring(0, 100)}...`
    }
  }
  
  /**
   * 辅助方法
   */
  getRoleDisplayName(role) {
    const roleMap = {
      protagonist: '主角',
      supporting: '配角',
      antagonist: '反角',
      background: '背景角色'
    }
    return roleMap[role] || role
  }
  
  /**
   * 数据验证
   */
  validateStepData(stepId, data) {
    const step = this.wizardStore.wizardSteps.find(s => s.id === stepId)
    if (!step) return { valid: false, errors: ['未知步骤'] }
    
    const errors = []
    
    step.required.forEach(field => {
      if (!data[field] || (Array.isArray(data[field]) && data[field].length === 0)) {
        errors.push(`${field} 是必填项`)
      }
    })
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// 导出单例
export const wizardService = new WizardService()
export default wizardService
