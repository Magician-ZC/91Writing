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
        primary: ['worldview', 'coreRules', 'powerSystem', 'socialStructure'],
        secondary: ['consistency'],
        integration: {
          worldview: 'integrateWorldviewResult',
          coreRules: 'integrateCoreRulesResult',
          powerSystem: 'integratePowerSystemResult',
          socialStructure: 'integrateSocialStructureResult',
          consistency: 'integrateConsistencyResult'
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
      case 'coreRules':
        return contextBuilder.buildCoreRulesPrompt(params)
      case 'powerSystem':
        return contextBuilder.buildPowerSystemPrompt(params)
      case 'socialStructure':
        return contextBuilder.buildSocialStructurePrompt(params)
      case 'consistency':
        return contextBuilder.buildConsistencyPrompt(params)
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
    
    console.log('callTool 被调用:', { toolType, prompt: prompt.substring(0, 100) + '...', params })
    
    // 这里应该调用实际的工具API
    // 目前使用 novelStore 的 generateContent 方法
    try {
      const result = await this.novelStore.generateContent(prompt)
      console.log('callTool 返回结果:', result ? result.substring(0, 100) + '...' : result)
      return result
    } catch (error) {
      console.error('callTool 调用失败:', error)
      throw error
    }
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
    
    console.log('世界观整合结果:', worldSettings)
    
    // 更新向导数据 - 但不更新到store，因为这是生成的内容，用户可能不采用
    // Object.keys(worldSettings).forEach(key => {
    //   this.wizardStore.updateStepData('worldBuilding', key, worldSettings[key])
    // })
    
    // 检查与前面步骤的一致性
    // const consistencyCheck = await this.checkWorldConsistency(worldSettings)
    
    // 直接返回解析好的世界观数据，供模板显示
    return {
      type: 'worldview', 
      ...worldSettings,  // 展开worldSettings，这样模板可以直接访问basic, history, culture, geography
      integrated: true,
      // consistency: consistencyCheck
    }
  }

  /**
   * 核心规则生成结果整合
   */
  async integrateCoreRulesResult(result, stepId, params) {
    const rules = this.parseCoreRulesResult(result)
    
    return {
      type: 'coreRules',
      rules,
      integrated: true,
      suggestions: ['建议验证规则之间的一致性', '考虑规则对故事发展的影响']
    }
  }

  /**
   * 力量体系生成结果整合
   */
  async integratePowerSystemResult(result, stepId, params) {
    const powerSystemData = this.parsePowerSystemResult(result)
    
    return {
      type: 'powerSystem',
      description: powerSystemData.description,
      details: powerSystemData.details,
      integrated: true,
      suggestions: ['检查与核心规则的契合度', '考虑力量体系的平衡性']
    }
  }

  /**
   * 社会结构生成结果整合
   */
  async integrateSocialStructureResult(result, stepId, params) {
    const socialData = this.parseSocialStructureResult(result)
    
    return {
      type: 'socialStructure',
      description: socialData.description,
      details: socialData.details,
      integrated: true,
      suggestions: ['验证与力量体系的关系', '检查社会矛盾的合理性']
    }
  }

  /**
   * 一致性检查结果整合
   */
  async integrateConsistencyResult(result, stepId, params) {
    const consistencyAnalysis = this.parseConsistencyResult(result)
    
    return {
      type: 'consistency',
      analysis: consistencyAnalysis,
      integrated: true,
      actionItems: consistencyAnalysis.issues || []
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
    
    if (typeof result !== 'string') {
      console.error('脑洞生成结果不是字符串:', result)
      return brainstorms
    }
    
    console.log('原始脑洞数据长度:', result.length)
    console.log('原始脑洞数据预览:', result.substring(0, 500) + '...')
    
    // 首先尝试找到真正的脑洞内容开始位置，过滤掉提示词
    let contentStart = result.indexOf('**脑洞1：')
    if (contentStart === -1) {
      contentStart = result.indexOf('**脑洞一：')
      if (contentStart === -1) {
        contentStart = result.indexOf('### 脑洞1')
        if (contentStart === -1) {
          contentStart = result.indexOf('脑洞1：')
          if (contentStart === -1) {
            contentStart = result.indexOf('---') // 寻找分隔线
            if (contentStart !== -1) {
              contentStart = result.indexOf('\n', contentStart) + 1
            } else {
              contentStart = 0
            }
          }
        }
      }
    }
    
    // 只处理真正的脑洞内容部分
    const cleanResult = contentStart > 0 ? result.substring(contentStart).trim() : result.trim()
    console.log('清理后的脑洞数据预览:', cleanResult.substring(0, 300) + '...')
    
    // 先尝试按不同的分隔符分割成多个部分
    let sections = []
    
    // 方法1: 按标准格式分割（### 脑洞一、脑洞1、创意1等）
    if (cleanResult.match(/###\s*脑洞[一二三四五六七八九十\d]/i)) {
      sections = cleanResult.split(/(?=###\s*脑洞[一二三四五六七八九十\d])/i).filter(s => s.trim())
      console.log('使用### 脑洞格式分割')
    }
    else if (cleanResult.match(/\*\*脑洞[一二三四五六七八九十\d]+[：:]/i)) {
      // 匹配 **脑洞1： 或 **脑洞一： 格式
      sections = cleanResult.split(/(?=\*\*脑洞[一二三四五六七八九十\d]+[：:])/i).filter(s => s.trim())
      console.log('使用**脑洞格式分割')
    }
    else if (cleanResult.match(/脑洞\s*[一二三四五六七八九十\d]/i) || cleanResult.match(/创意\s*[1-9\d]/i) || cleanResult.match(/想法\s*[1-9\d]/i)) {
      sections = cleanResult.split(/(?=(?:^|\n)脑洞\s*[一二三四五六七八九十\d]|创意\s*[1-9\d]|想法\s*[1-9\d])/i).filter(s => s.trim())
      console.log('使用脑洞/创意格式分割')
    }
    // 方法2: 按数字编号分割（1. 2. 3. 或 1、2、3、）  
    else if (cleanResult.match(/[1-9\d][.、]\s*[^\d]/)) {
      sections = cleanResult.split(/(?=[1-9\d][.、]\s*[^\d])/).filter(s => s.trim())
      console.log('使用数字编号分割')
    }
    // 方法3: 按双换行分割
    else if (cleanResult.includes('\n\n')) {
      sections = cleanResult.split(/\n\s*\n/).filter(s => s.trim())
      console.log('使用双换行分割')
    }
    // 方法4: 按内容长度智能分割（每200-300字一段）
    else if (cleanResult.length > 400) {
      const sentences = cleanResult.split(/[。！？.!?]/).filter(s => s.trim())
      let currentSection = ''
      sentences.forEach(sentence => {
        currentSection += sentence + '。'
        if (currentSection.length > 200) {
          sections.push(currentSection.trim())
          currentSection = ''
        }
      })
      if (currentSection.trim()) sections.push(currentSection.trim())
      console.log('使用长度智能分割')
    }
    // 方法5: 作为单个脑洞处理
    else {
      sections = [cleanResult.trim()]
      console.log('作为单个脑洞处理')
    }
    
    console.log('分割后的章节数量:', sections.length)
    sections.forEach((section, i) => {
      console.log(`章节${i+1}预览:`, section.substring(0, 100) + '...')
    })
    
    // 解析每个章节
    sections.forEach((section, index) => {
      if (!section.trim()) return
      
      // 提取标题 - 重新优化逻辑
      let title = `创意脑洞 ${index + 1}`
      const lines = section.split('\n').map(line => line.trim()).filter(line => line)
      const firstLine = lines[0] || ''
      
      console.log(`脑洞${index + 1} - 首行内容:`, firstLine)
      
      // 尝试从第一行提取标题
      if (firstLine.match(/^\*\*脑洞[一二三四五六七八九十\d]+[：:]/i)) {
        // 处理 "**脑洞一：标题：《血月法则》**" 格式
        let titleLine = firstLine.replace(/^\*\*脑洞[一二三四五六七八九十\d]+[：:]\s*/, '').replace(/\*\*$/, '').trim()
        console.log(`脑洞${index + 1} - 标题行处理:`, titleLine)
        
        // 进一步提取标题部分（如果有"标题："前缀）
        if (titleLine.match(/^标题[：:]/i)) {
          titleLine = titleLine.replace(/^标题[：:]\s*/, '')
          // 去掉书名号
          if (titleLine.match(/^《(.+?)》/)) {
            titleLine = titleLine.replace(/^《(.+?)》/, '$1')
          }
          title = titleLine || title
        } else if (titleLine.length > 0 && titleLine.length < 100) {
          // 如果没有"标题："前缀，但内容合理，直接使用
          title = titleLine
        }
        console.log(`脑洞${index + 1} - 最终标题:`, title)
        
      } else if (firstLine.match(/^###\s*脑洞[一二三四五六七八九十\d]*\s*[：:]/i)) {
        // 处理 "### 脑洞一: 血色天赋·力物解析" 格式
        const titlePart = firstLine.replace(/^###\s*/, '').split(/[：:]/)[1]?.trim()
        title = titlePart || firstLine.replace(/^###\s*/, '').trim()
        
      } else if (firstLine.match(/^(脑洞|创意|想法)[一二三四五六七八九十\d]*\s*[：:]/i)) {
        title = firstLine.split(/[：:]/)[1]?.trim() || 
               firstLine.split(/[：:]/)[0]?.trim() || title
        
      } else if (firstLine.match(/^[1-9\d][.、]/)) {
        const cleanTitle = firstLine.replace(/^[1-9\d][.、]\s*/, '')
        // 如果首行看起来像标题（短且不是明显的描述文字）
        if (cleanTitle.length < 50 && !cleanTitle.includes('核心设定') && !cleanTitle.includes('创意亮点')) {
          title = cleanTitle
        }
        
      } else if (firstLine.length > 0 && firstLine.length < 50 && !firstLine.includes('核心设定') && !firstLine.includes('创意亮点')) {
        title = firstLine
      }
      
      // 提取各个部分
      let description = ''
      let highlight = ''
      let conflict = ''
      let potential = ''
      
      const fullText = section
      
      // 尝试按关键词提取各个字段
      const coreMatch = fullText.match(/[-·]?\s*核心设定[：:]?\s*([^-·\n]*?)(?=\n[-·]?\s*(创意亮点|冲突设计|发展潜力)|$)/is)
      const highlightMatch = fullText.match(/[-·]?\s*创意亮点[：:]?\s*([^-·\n]*?)(?=\n[-·]?\s*(核心设定|冲突设计|发展潜力)|$)/is)
      const conflictMatch = fullText.match(/[-·]?\s*冲突设计[：:]?\s*([^-·\n]*?)(?=\n[-·]?\s*(核心设定|创意亮点|发展潜力)|$)/is)
      const potentialMatch = fullText.match(/[-·]?\s*发展潜力[：:]?\s*([^-·\n]*?)(?=\n[-·]?\s*(核心设定|创意亮点|冲突设计)|$)/is)
      
      description = coreMatch ? coreMatch[1].trim() : ''
      highlight = highlightMatch ? highlightMatch[1].trim() : ''
      conflict = conflictMatch ? conflictMatch[1].trim() : ''
      potential = potentialMatch ? potentialMatch[1].trim() : ''
      
      // 如果没有找到特定字段，使用整段作为描述
      if (!description && !highlight && !conflict && !potential) {
        // 清理格式化标记后作为描述
        description = fullText
          .replace(/^\*\*脑洞[一二三四五六七八九十\d]+[：:].*?\*\*/i, '')
          .replace(/^###\s*(脑洞|创意|想法)[一二三四五六七八九十\d]*\s*[：:]/i, '')
          .replace(/^(脑洞|创意|想法)\s*[一二三四五六七八九十\d]*\s*[：:]/i, '')
          .replace(/^[1-9\d][.、]\s*/, '')
          .trim()
      }
      
      // 设置默认值
      if (!description) description = '精彩的创意构思'
      if (!highlight) highlight = '具有独特的创意价值'
      if (!conflict) conflict = '包含丰富的戏剧冲突'
      if (!potential) potential = '具有很好的发展潜力'
      
      console.log(`脑洞${index + 1} - 解析结果:`, {
        title,
        description: description.substring(0, 50) + '...',
        highlight: highlight.substring(0, 30) + '...',
        conflict: conflict.substring(0, 30) + '...',
        potential: potential.substring(0, 30) + '...'
      })
      
      brainstorms.push({
        id: Date.now() + Math.random() * 1000 + index,
        title: title,
        description: description,
        highlight: highlight,
        conflict: conflict, 
        potential: potential
      })
    })
    
    // 如果仍然没有解析出结果，创建一个默认的脑洞
    if (brainstorms.length === 0 && result.trim()) {
      brainstorms.push({
        id: Date.now(),
        title: '生成的创意脑洞',
        description: result.substring(0, 200) + (result.length > 200 ? '...' : ''),
        highlight: '具有独特的创意价值',
        conflict: '包含丰富的戏剧冲突',
        potential: '具有很好的发展潜力'
      })
    }
    
    console.log('解析脑洞结果:', brainstorms)
    return brainstorms.filter(item => item.title || item.description)
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
    if (typeof result !== 'string') {
      console.error('世界观生成结果不是字符串:', result)
      return {
        basic: '解析失败，请重新生成',
        history: '解析失败，请重新生成', 
        culture: '解析失败，请重新生成',
        geography: '解析失败，请重新生成'
      }
    }

    console.log('原始世界观生成结果:', result)
    
    const worldview = {
      basic: '',
      history: '',
      culture: '',
      geography: ''
    }

    try {
      // 尝试按标题分割内容
      const sections = result.split(/(?=##?\s*[一二三四五六七八九十\d]+[、.。]?\s*[基本历史文化地理背景架构环境传统设定])/i)
      
      sections.forEach(section => {
        const trimmedSection = section.trim()
        if (!trimmedSection) return
        
        // 基本架构/世界设定
        if (trimmedSection.match(/[基本世界架构设定框架]/i)) {
          worldview.basic = this.extractSectionContent(trimmedSection)
        }
        // 历史背景
        else if (trimmedSection.match(/历史|背景|起源|发展/i)) {
          worldview.history = this.extractSectionContent(trimmedSection)
        }
        // 文化传统
        else if (trimmedSection.match(/文化|传统|习俗|社会/i)) {
          worldview.culture = this.extractSectionContent(trimmedSection)
        }
        // 地理环境
        else if (trimmedSection.match(/地理|环境|地形|气候|位置/i)) {
          worldview.geography = this.extractSectionContent(trimmedSection)
        }
      })

      // 如果按标题分割失败，尝试其他方法
      if (!worldview.basic && !worldview.history && !worldview.culture && !worldview.geography) {
        // 按段落分割，前1/4作为基本设定，其余平分
        const paragraphs = result.split(/\n\s*\n/).filter(p => p.trim())
        const quarterPoint = Math.ceil(paragraphs.length / 4)
        
        worldview.basic = paragraphs.slice(0, quarterPoint).join('\n\n')
        worldview.history = paragraphs.slice(quarterPoint, quarterPoint * 2).join('\n\n')
        worldview.culture = paragraphs.slice(quarterPoint * 2, quarterPoint * 3).join('\n\n')
        worldview.geography = paragraphs.slice(quarterPoint * 3).join('\n\n')
      }

      // 设置默认内容（如果仍然为空）
      if (!worldview.basic) worldview.basic = result.substring(0, 200) + '...'
      if (!worldview.history) worldview.history = '暂未生成历史背景信息'
      if (!worldview.culture) worldview.culture = '暂未生成文化传统信息'  
      if (!worldview.geography) worldview.geography = '暂未生成地理环境信息'

      console.log('解析后的世界观:', worldview)
      return worldview

    } catch (error) {
      console.error('解析世界观结果时出错:', error)
      return {
        basic: result.substring(0, 500) + (result.length > 500 ? '...' : ''),
        history: '解析失败，完整内容请查看基本架构',
        culture: '解析失败，完整内容请查看基本架构',
        geography: '解析失败，完整内容请查看基本架构'
      }
    }
  }

  // 提取章节内容的辅助方法
  extractSectionContent(section) {
    // 移除标题行，保留内容
    const lines = section.split('\n')
    return lines.slice(1).join('\n').trim() || section.trim()
  }

  parseCoreRulesResult(result) {
    // 解析核心规则生成结果
    if (typeof result !== 'string') {
      return []
    }
    
    // 按行分割，过滤空行和非规则内容
    const lines = result.split('\n').map(line => line.trim()).filter(line => line)
    const rules = []
    
    lines.forEach(line => {
      // 去除编号和格式符号
      let cleanRule = line.replace(/^\d+[.、]\s*/, '').replace(/^[-*]\s*/, '').trim()
      if (cleanRule && cleanRule.length > 10 && cleanRule.length < 200) {
        rules.push(cleanRule)
      }
    })
    
    return rules.length > 0 ? rules : [result.trim()]
  }

  parsePowerSystemResult(result) {
    // 解析力量体系生成结果
    return {
      description: typeof result === 'string' ? result.trim() : '',
      details: {
        source: '',
        acquisition: '',
        levels: '',
        limitations: '',
        socialRole: ''
      }
    }
  }

  parseSocialStructureResult(result) {
    // 解析社会结构生成结果
    return {
      description: typeof result === 'string' ? result.trim() : '',
      details: {
        government: '',
        hierarchy: '',
        economy: '',
        law: '',
        conflicts: ''
      }
    }
  }

  parseConsistencyResult(result) {
    // 解析一致性检查结果
    return {
      overall: 'analyzed',
      issues: [],
      suggestions: [],
      strengths: [],
      analysis: typeof result === 'string' ? result.trim() : ''
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
    return `扮演你觉得需要扮演的角色，现在，我想去除这篇文章的AI味，不改变文章的整体面貌，使得这篇文章更加自然流畅。文章如下：

请基于以下信息生成创意脑洞：
    
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
    return `扮演你觉得需要扮演的角色，现在，我想去除这篇文章的AI味，不改变文章的整体面貌，使得这篇文章更加自然流畅。文章如下：

请分析以下类型的创作要点：
    
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

  buildCoreRulesPrompt(params) {
    const conceptData = this.wizardData.concept || {}
    const existingRules = params.existingRules || []
    
    return `请为以下世界生成核心运行规则：

小说类型：${conceptData.selectedGenre || ''}
核心创意：${conceptData.coreIdea || ''}
世界类型：${params.worldType}
规模大小：${params.scale || ''}
已有规则：${existingRules.join('; ') || '无'}

要求：
1. 生成3-5条世界的基本运行规则
2. 规则要符合世界类型和故事设定
3. 规则之间要保持逻辑一致性
4. 避免与已有规则重复
5. 规则要为故事发展提供支撑

格式：每条规则单独一行，简洁明了`
  }

  buildPowerSystemPrompt(params) {
    const conceptData = this.wizardData.concept || {}
    const coreRules = params.coreRules || []
    
    return `请为以下世界设计力量体系：

小说类型：${conceptData.selectedGenre || ''}
核心创意：${conceptData.coreIdea || ''}
世界类型：${params.worldType}
规模大小：${params.scale || ''}
核心规则：${coreRules.join('; ') || '无'}

设计要求：
1. 力量的来源和本质
2. 获得力量的方式和条件
3. 力量的等级划分体系
4. 力量的使用限制和代价
5. 力量在社会中的作用和地位
6. 与核心规则的契合性

请以详细的段落形式描述，包含具体的运作机制和限制条件。`
  }

  buildSocialStructurePrompt(params) {
    const conceptData = this.wizardData.concept || {}
    const coreRules = params.coreRules || []
    const powerSystem = params.powerSystem || ''
    
    return `请为以下世界设计社会结构：

小说类型：${conceptData.selectedGenre || ''}
核心创意：${conceptData.coreIdea || ''}
世界类型：${params.worldType}
规模大小：${params.scale || ''}
核心规则：${coreRules.join('; ') || '无'}
力量体系：${powerSystem || '无'}

设计要求：
1. 政治体制和统治结构
2. 社会阶层和地位划分
3. 权力分配和制衡机制
4. 经济体系和资源分配
5. 法律制度和社会秩序
6. 与力量体系的关系
7. 社会矛盾和冲突点

请以详细的段落形式描述，突出社会结构的特色和内在逻辑。`
  }

  buildConsistencyPrompt(params) {
    const allData = params.allWizardData || this.wizardData
    
    return `请检查以下世界设定的一致性：

完整设定信息：
${JSON.stringify(allData, null, 2)}

检查要点：
1. 世界规则之间是否存在逻辑冲突
2. 力量体系与社会结构是否匹配
3. 设定是否支持故事主题发展
4. 角色设定与世界观是否协调
5. 时间线和历史背景是否合理

请指出发现的问题并提供修改建议。如果设定一致，请说明优点和可能的扩展方向。`
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
    
    return `扮演你觉得需要扮演的角色，现在，我想去除这篇文章的AI味，不改变文章的整体面貌，使得这篇文章更加自然流畅。文章如下：

请生成${params.count || 1}个${params.role}角色：
    
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
    
    return `扮演你觉得需要扮演的角色，现在，我想去除这篇文章的AI味，不改变文章的整体面貌，使得这篇文章更加自然流畅。文章如下：

请设计冲突体系：
    
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
    
    return `扮演你觉得需要扮演的角色，现在，我想去除这篇文章的AI味，不改变文章的整体面貌，使得这篇文章更加自然流畅。文章如下：

请生成详细细纲：
    
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
    
    return `扮演你觉得需要扮演的角色，现在，我想去除这篇文章的AI味，不改变文章的整体面貌，使得这篇文章更加自然流畅。文章如下：

请创作小说开篇：
    
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
    
    return `扮演你觉得需要扮演的角色，现在，我想去除这篇文章的AI味，不改变文章的整体面貌，使得这篇文章更加自然流畅。文章如下：

请撰写小说简介：
    
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
