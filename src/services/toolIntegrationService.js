/**
 * 工具整合服务 - 管理现有工具与向导流程的整合
 */

import { useNovelStore } from '@/stores/novel'
import { useWizardStore } from '@/stores/wizardStore'
import { unifiedAIService } from './unifiedAIService'

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
    
    try {
      // 优先使用unifiedAIService的预设场景方法
      const status = await unifiedAIService.checkStatus()
      if (status.available) {
        console.log('使用统一AI服务调用工具:', toolType)
        
        // 根据工具类型选择最佳的AI服务方法
        let result
        switch (toolType) {
          case 'brainstorm':
          case 'outline':
            // 使用大纲生成方法
            result = await unifiedAIService.generateOutline(prompt)
            break
            
          case 'character':
            // 如果有角色信息，使用角色生成方法
            if (params?.characterInfo) {
              result = await unifiedAIService.generateCharacter(params.characterInfo)
            } else {
              result = await unifiedAIService.chat([{ role: 'user', content: prompt }])
              result = result.content
            }
            break
            
          case 'opening':
            // 使用续写方法
            if (params?.context) {
              result = await unifiedAIService.continueWriting(params.context)
            } else {
              result = await unifiedAIService.chat([{ role: 'user', content: prompt }])
              result = result.content
            }
            break
            
          case 'synopsis':
            // 使用内容润色方法
            if (params?.rawContent) {
              result = await unifiedAIService.polishContent(params.rawContent)
            } else {
              result = await unifiedAIService.chat([{ role: 'user', content: prompt }])
              result = result.content
            }
            break
            
          case 'title':
            // 使用标题生成方法
            if (params?.content) {
              const titles = await unifiedAIService.generateTitles(params.content, params.count || 5)
              result = titles.join('\n')
            } else {
              result = await unifiedAIService.chat([{ role: 'user', content: prompt }])
              result = result.content
            }
            break
            
          default:
            // 其他工具使用通用聊天接口
            const response = await unifiedAIService.chat([{ role: 'user', content: prompt }])
            result = response.content
        }
        
        console.log('统一AI服务调用成功:', result ? result.substring(0, 100) + '...' : result)
        return result
      }
    } catch (error) {
      console.warn('统一AI服务调用失败，降级到novelStore:', error.message)
      // 降级到原来的方法
    }
    
    // 降级方案：使用 novelStore 的 generateContent 方法
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
      // 改进的解析逻辑：支持markdown格式的标题
      const sections = result.split(/(?=###?\s*\d+[.,。]?\s*)/i)
      
      // 如果markdown分割失败，尝试其他标题格式
      if (sections.length <= 1) {
        sections.push(...result.split(/(?=##?\s*[一二三四五六七八九十\d]+[、.。]?\s*[基本历史文化地理背景架构环境传统设定])/i))
      }
      
      sections.forEach(section => {
        const trimmedSection = section.trim()
        if (!trimmedSection) return
        
        // 基本架构/世界设定 - 扩展匹配规则
        if (trimmedSection.match(/(基本|世界|架构|设定|框架|规则|核心)/i)) {
          if (!worldview.basic) { // 避免重复赋值
            worldview.basic = this.extractSectionContent(trimmedSection)
          }
        }
        // 历史背景
        else if (trimmedSection.match(/(历史|背景|起源|发展|时代|纪元|过去)/i)) {
          worldview.history = this.extractSectionContent(trimmedSection)
        }
        // 文化传统/社会结构
        else if (trimmedSection.match(/(文化|传统|习俗|社会|结构|制度|组织)/i)) {
          worldview.culture = this.extractSectionContent(trimmedSection)
        }
        // 地理环境
        else if (trimmedSection.match(/(地理|环境|地形|气候|位置|地域|空间)/i)) {
          worldview.geography = this.extractSectionContent(trimmedSection)
        }
        // 力量体系也归入基本设定
        else if (trimmedSection.match(/(力量|体系|能力|系统|等级)/i) && !worldview.basic) {
          worldview.basic = this.extractSectionContent(trimmedSection)
        }
      })

      // 特殊处理：如果第一个sections包含完整内容但没有被正确分类
      if (sections.length > 0 && !worldview.basic && !worldview.history && !worldview.culture && !worldview.geography) {
        const fullContent = sections[0] || result
        
        // 尝试按内容章节进行更精确的分割
        const contentSections = this.parseDetailedWorldview(fullContent)
        if (contentSections.basic || contentSections.history || contentSections.culture || contentSections.geography) {
          return contentSections
        }
        
        // 如果仍然无法解析，按段落智能分配
        const paragraphs = fullContent.split(/\n\s*\n/).filter(p => p.trim())
        if (paragraphs.length >= 4) {
          const quarterPoint = Math.ceil(paragraphs.length / 4)
          worldview.basic = paragraphs.slice(0, quarterPoint).join('\n\n')
          worldview.history = paragraphs.slice(quarterPoint, quarterPoint * 2).join('\n\n')
          worldview.culture = paragraphs.slice(quarterPoint * 2, quarterPoint * 3).join('\n\n')
          worldview.geography = paragraphs.slice(quarterPoint * 3).join('\n\n')
        } else {
          // 内容较少时，分配到基本设定
          worldview.basic = fullContent
        }
      }

      // 设置默认内容（如果仍然为空）
      if (!worldview.basic) worldview.basic = result.substring(0, 500) + (result.length > 500 ? '...' : '')
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

  parseDetailedWorldview(content) {
    // 更精确地解析详细的世界观内容
    const worldview = {
      basic: '',
      history: '',
      culture: '',
      geography: ''
    }

    try {
      // 按具体标题内容进行匹配
      const sections = content.split(/(?=###?\s*\d+[.,。]?\s*)/i)
      
      sections.forEach(section => {
        const trimmedSection = section.trim()
        if (!trimmedSection) return
        
        const lowerSection = trimmedSection.toLowerCase()
        
        // 更精确的内容分类
        if (lowerSection.includes('世界的基本设定') || 
            lowerSection.includes('基本设定和规则') ||
            lowerSection.includes('力量体系') ||
            lowerSection.includes('核心规则')) {
          if (!worldview.basic) {
            worldview.basic = this.extractSectionContent(trimmedSection)
          } else {
            worldview.basic += '\n\n' + this.extractSectionContent(trimmedSection)
          }
        }
        else if (lowerSection.includes('历史背景') ||
                 lowerSection.includes('历史') ||
                 lowerSection.includes('起源') ||
                 lowerSection.includes('发展')) {
          worldview.history = this.extractSectionContent(trimmedSection)
        }
        else if (lowerSection.includes('社会结构') ||
                 lowerSection.includes('文化') ||
                 lowerSection.includes('社会形态') ||
                 lowerSection.includes('文化现象')) {
          worldview.culture = this.extractSectionContent(trimmedSection)
        }
        else if (lowerSection.includes('地理环境') ||
                 lowerSection.includes('地理') ||
                 lowerSection.includes('环境') ||
                 lowerSection.includes('地貌')) {
          worldview.geography = this.extractSectionContent(trimmedSection)
        }
      })

      // 如果某些字段仍然为空，尝试从完整内容中提取相关段落
      if (!worldview.history) {
        const historyMatch = content.match(/(?:历史背景|发展历程|时间线|过去的)([\s\S]*?)(?=###|\n\n---|\Z)/i)
        if (historyMatch) {
          worldview.history = historyMatch[1].trim()
        }
      }

      if (!worldview.culture) {
        const cultureMatch = content.match(/(?:社会结构|文化传统|社会形态|新文化)([\s\S]*?)(?=###|\n\n---|\Z)/i)
        if (cultureMatch) {
          worldview.culture = cultureMatch[1].trim()
        }
      }

      if (!worldview.geography) {
        const geoMatch = content.match(/(?:地理环境|地理|环境|地貌)([\s\S]*?)(?=###|\n\n---|\Z)/i)
        if (geoMatch) {
          worldview.geography = geoMatch[1].trim()
        }
      }

      return worldview
    } catch (error) {
      console.error('详细解析世界观时出错:', error)
      return { basic: '', history: '', culture: '', geography: '' }
    }
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
    if (typeof result !== 'string') {
      console.error('角色生成结果不是字符串:', result)
      return []
    }

    const characters = []
    
    try {
      // 尝试按角色分段解析
      const sections = result.split(/(?=##?\s*[角色人物]\d*[:：]?|角色\d+[:：]|人物\d+[:：])/i)
      
      sections.forEach(section => {
        const lines = section.trim().split('\n').filter(line => line.trim())
        if (lines.length === 0) return
        
        const character = {
          id: Date.now() + Math.random(),
          name: '',
          description: '',
          background: '',
          personality: '',
          motivation: '',
          skills: [],
          relationships: [],
          role: 'supporting'
        }
        
        let currentField = 'description'
        
        lines.forEach(line => {
          const trimmedLine = line.trim()
          
          // 提取角色名称
          const nameMatch = trimmedLine.match(/(?:角色|人物|姓名|名字)[:：]\s*(.+)/) || 
                           trimmedLine.match(/^##?\s*([^：:]+)/) ||
                           (lines[0] === trimmedLine && trimmedLine.match(/^([^：:，,。.！!？?]+)/))
          
          if (nameMatch && !character.name) {
            character.name = nameMatch[1].replace(/^[角色人物]\d*[:：]?\s*/, '').trim()
            return
          }
          
          // 识别不同字段
          if (trimmedLine.match(/(?:背景|出身|来历)[:：]/i)) {
            currentField = 'background'
            character.background = trimmedLine.replace(/(?:背景|出身|来历)[:：]\s*/i, '')
          } else if (trimmedLine.match(/(?:性格|个性|特点)[:：]/i)) {
            currentField = 'personality'
            character.personality = trimmedLine.replace(/(?:性格|个性|特点)[:：]\s*/i, '')
          } else if (trimmedLine.match(/(?:动机|目标|愿望)[:：]/i)) {
            currentField = 'motivation'
            character.motivation = trimmedLine.replace(/(?:动机|目标|愿望)[:：]\s*/i, '')
          } else if (trimmedLine.match(/(?:技能|能力|特长)[:：]/i)) {
            currentField = 'skills'
            const skillsText = trimmedLine.replace(/(?:技能|能力|特长)[:：]\s*/i, '')
            character.skills = skillsText.split(/[，,、]/).map(s => s.trim()).filter(s => s)
          } else if (trimmedLine.match(/(?:关系|人际|社交)[:：]/i)) {
            currentField = 'relationships'
            const relText = trimmedLine.replace(/(?:关系|人际|社交)[:：]\s*/i, '')
            character.relationships = relText.split(/[，,、]/).map(s => s.trim()).filter(s => s)
          } else if (trimmedLine && !trimmedLine.match(/^[#-*\d+.]/)) {
            // 继续添加到当前字段
            if (currentField === 'description') {
              character.description += (character.description ? '\n' : '') + trimmedLine
            } else if (currentField === 'background') {
              character.background += (character.background ? '\n' : '') + trimmedLine
            } else if (currentField === 'personality') {
              character.personality += (character.personality ? '\n' : '') + trimmedLine
            } else if (currentField === 'motivation') {
              character.motivation += (character.motivation ? '\n' : '') + trimmedLine
            }
          }
        })
        
        // 如果没有提取到名字，使用默认名
        if (!character.name) {
          character.name = `角色${characters.length + 1}`
        }
        
        // 确保至少有描述
        if (!character.description && !character.background && !character.personality) {
          character.description = section.trim()
        }
        
        characters.push(character)
      })
      
      // 如果没有成功解析出角色，创建一个默认角色
      if (characters.length === 0) {
        characters.push({
          id: Date.now(),
          name: '生成的角色',
          description: result.trim(),
          background: '',
          personality: '',
          motivation: '',
          skills: [],
          relationships: [],
          role: 'supporting'
        })
      }
      
      console.log('角色解析结果:', characters)
      return characters
      
    } catch (error) {
      console.error('角色解析失败:', error)
      return [{
        id: Date.now(),
        name: '生成的角色',
        description: result.trim(),
        background: '',
        personality: '',
        motivation: '',
        skills: [],
        relationships: [],
        role: 'supporting'
      }]
    }
  }
  
  parseConflictResult(result) {
    // 解析冲突生成结果
    if (typeof result !== 'string') {
      console.error('冲突生成结果不是字符串:', result)
      return []
    }

    const conflicts = []
    
    try {
      // 按冲突类型或编号分割
      const sections = result.split(/(?=##?\s*(?:冲突|矛盾)\d*[:：]?|(?:主要|次要|内部|外部)冲突)/i)
      
      sections.forEach(section => {
        const trimmed = section.trim()
        if (!trimmed) return
        
        const lines = trimmed.split('\n').filter(line => line.trim())
        const conflict = {
          id: Date.now() + Math.random(),
          type: 'external',
          description: '',
          participants: [],
          stakes: '',
          resolution: '',
          timeline: ''
        }
        
        // 识别冲突类型
        if (trimmed.match(/内部|内心|心理|道德/i)) {
          conflict.type = 'internal'
        } else if (trimmed.match(/社会|制度|体系/i)) {
          conflict.type = 'social'
        } else if (trimmed.match(/人际|关系|情感/i)) {
          conflict.type = 'interpersonal'
        }
        
        // 提取描述和其他信息
        lines.forEach(line => {
          const trimmedLine = line.trim()
          if (trimmedLine.match(/参与者|涉及|角色/i)) {
            conflict.participants = trimmedLine.replace(/(?:参与者|涉及|角色)[:：]\s*/i, '').split(/[，,、]/).map(p => p.trim())
          } else if (trimmedLine.match(/后果|结果|风险/i)) {
            conflict.stakes = trimmedLine.replace(/(?:后果|结果|风险)[:：]\s*/i, '')
          } else if (trimmedLine.match(/解决|化解|结局/i)) {
            conflict.resolution = trimmedLine.replace(/(?:解决|化解|结局)[:：]\s*/i, '')
          } else if (!trimmedLine.match(/^[#-*\d+.]/)) {
            conflict.description += (conflict.description ? '\n' : '') + trimmedLine
          }
        })
        
        if (conflict.description) {
          conflicts.push(conflict)
        }
      })
      
      return conflicts.length > 0 ? conflicts : [{
        id: Date.now(),
        type: 'external',
        description: result.trim(),
        participants: [],
        stakes: '',
        resolution: '',
        timeline: ''
      }]
      
    } catch (error) {
      console.error('冲突解析失败:', error)
      return [{
        id: Date.now(),
        type: 'external',
        description: result.trim(),
        participants: [],
        stakes: '',
        resolution: '',
        timeline: ''
      }]
    }
  }
  
  parseOutlineResult(result) {
    // 解析细纲生成结果
    if (typeof result !== 'string') {
      console.error('细纲生成结果不是字符串:', result)
      return {
        chapters: [],
        structure: {},
        themes: []
      }
    }

    const outline = {
      chapters: [],
      structure: {},
      themes: []
    }
    
    try {
      // 按章节分割
      const sections = result.split(/(?=##?\s*(?:第|章节?|Chapter)\s*[一二三四五六七八九十\d]+)/i)
      
      sections.forEach(section => {
        const trimmed = section.trim()
        if (!trimmed) return
        
        const lines = trimmed.split('\n').filter(line => line.trim())
        if (lines.length === 0) return
        
        const chapter = {
          id: Date.now() + Math.random(),
          title: '',
          summary: '',
          scenes: [],
          characters: [],
          plotPoints: [],
          themes: [],
          wordCount: 0
        }
        
        // 提取章节标题
        const titleLine = lines[0]
        const titleMatch = titleLine.match(/(?:第|章节?|Chapter)\s*([一二三四五六七八九十\d]+)[章节]?\s*[:：]?\s*(.*)/) ||
                          titleLine.match(/##?\s*(.+)/)
        
        if (titleMatch) {
          chapter.title = titleMatch[2] || titleMatch[1] || `第${outline.chapters.length + 1}章`
        } else {
          chapter.title = `第${outline.chapters.length + 1}章`
        }
        
        // 解析内容
        let currentField = 'summary'
        lines.slice(1).forEach(line => {
          const trimmedLine = line.trim()
          
          if (trimmedLine.match(/(?:场景|情节|剧情)[:：]/i)) {
            currentField = 'scenes'
          } else if (trimmedLine.match(/(?:角色|人物)[:：]/i)) {
            currentField = 'characters'
          } else if (trimmedLine.match(/(?:要点|重点|关键)[:：]/i)) {
            currentField = 'plotPoints'
          } else if (trimmedLine.match(/(?:主题|思想)[:：]/i)) {
            currentField = 'themes'
          } else if (trimmedLine && !trimmedLine.match(/^[#-*\d+.]/)) {
            if (currentField === 'summary') {
              chapter.summary += (chapter.summary ? '\n' : '') + trimmedLine
            } else if (currentField === 'scenes') {
              chapter.scenes.push(trimmedLine)
            } else if (currentField === 'characters') {
              chapter.characters = trimmedLine.split(/[，,、]/).map(c => c.trim())
            } else if (currentField === 'plotPoints') {
              chapter.plotPoints.push(trimmedLine)
            } else if (currentField === 'themes') {
              chapter.themes = trimmedLine.split(/[，,、]/).map(t => t.trim())
            }
          }
        })
        
        outline.chapters.push(chapter)
      })
      
      // 分析整体结构
      if (outline.chapters.length > 0) {
        outline.structure = {
          totalChapters: outline.chapters.length,
          act1: Math.floor(outline.chapters.length * 0.25),
          act2: Math.floor(outline.chapters.length * 0.5),
          act3: Math.ceil(outline.chapters.length * 0.25)
        }
      }
      
      console.log('细纲解析结果:', outline)
      return outline
      
    } catch (error) {
      console.error('细纲解析失败:', error)
      return {
        chapters: [{
          id: Date.now(),
          title: '第1章',
          summary: result.trim(),
          scenes: [],
          characters: [],
          plotPoints: [],
          themes: [],
          wordCount: 0
        }],
        structure: {},
        themes: []
      }
    }
  }
  
  parseOpeningResult(result) {
    // 解析开篇生成结果
    if (typeof result !== 'string') {
      console.error('开篇生成结果不是字符串:', result)
      return {
        hook: '',
        atmosphere: '',
        settingIntroduction: '',
        characterIntroduction: '',
        openingScene: result,
        firstParagraph: ''
      }
    }

    const opening = {
      hook: '',
      atmosphere: '',
      settingIntroduction: '',
      characterIntroduction: '',
      openingScene: result.trim(),
      firstParagraph: ''
    }
    
    try {
      const paragraphs = result.trim().split(/\n\s*\n/).filter(p => p.trim())
      
      if (paragraphs.length > 0) {
        opening.firstParagraph = paragraphs[0].trim()
        
        // 分析开头的不同元素
        paragraphs.forEach((paragraph, index) => {
          const trimmed = paragraph.trim()
          
          // 第一段通常是钩子
          if (index === 0) {
            opening.hook = trimmed
          }
          
          // 查找环境描述
          if (trimmed.match(/(?:天空|阳光|黑暗|房间|城市|森林|海洋|山脉|风景|环境|气氛)/)) {
            if (!opening.atmosphere) {
              opening.atmosphere = trimmed
            }
            if (!opening.settingIntroduction) {
              opening.settingIntroduction = trimmed
            }
          }
          
          // 查找角色介绍
          if (trimmed.match(/(?:他|她|我|男人|女人|少年|少女|老人|孩子|人影|身影|角色|主角|人物)/) && !opening.characterIntroduction) {
            opening.characterIntroduction = trimmed
          }
        })
      }
      
      console.log('开篇解析结果:', opening)
      return opening
      
    } catch (error) {
      console.error('开篇解析失败:', error)
      return {
        hook: result.split('\n')[0] || '',
        atmosphere: '',
        settingIntroduction: '',
        characterIntroduction: '',
        openingScene: result.trim(),
        firstParagraph: result.split('\n')[0] || ''
      }
    }
  }
  
  parseSynopsisResult(result) {
    // 解析简介生成结果
    if (typeof result !== 'string') {
      console.error('简介生成结果不是字符串:', result)
      return {
        shortSynopsis: '',
        longSynopsis: '',
        logline: '',
        backCover: '',
        pitchPoints: [],
        hooks: []
      }
    }

    const synopsis = {
      shortSynopsis: '',
      longSynopsis: '',
      logline: '',
      backCover: '',
      pitchPoints: [],
      hooks: [],
      variations: []
    }
    
    try {
      // 尝试识别不同版本的简介
      const sections = result.split(/(?=##?\s*(?:版本|简介|长版|短版|一句话|推广|宣传)\d*[:：]?)/i)
      
      sections.forEach(section => {
        const trimmed = section.trim()
        if (!trimmed) return
        
        const lines = trimmed.split('\n').filter(line => line.trim())
        const content = lines.slice(1).join('\n').trim() || lines[0]
        
        if (trimmed.match(/短版|简版|概述/i)) {
          synopsis.shortSynopsis = content
        } else if (trimmed.match(/长版|详细|完整/i)) {
          synopsis.longSynopsis = content
        } else if (trimmed.match(/一句话|标语|Logline/i)) {
          synopsis.logline = content
        } else if (trimmed.match(/推广|宣传|营销/i)) {
          synopsis.backCover = content
        } else if (trimmed.match(/要点|亮点|卖点/i)) {
          synopsis.pitchPoints = content.split(/[，,、\n]/).map(p => p.trim()).filter(p => p)
        } else if (trimmed.match(/钩子|吸引|悬念/i)) {
          synopsis.hooks = content.split(/[，,、\n]/).map(h => h.trim()).filter(h => h)
        } else {
          // 作为变体版本
          synopsis.variations.push({
            id: Date.now() + Math.random(),
            title: lines[0] || `版本${synopsis.variations.length + 1}`,
            content: content,
            length: content.length
          })
        }
      })
      
      // 如果没有识别到特定类型，将整体作为短版简介
      if (!synopsis.shortSynopsis && !synopsis.longSynopsis && synopsis.variations.length === 0) {
        const paragraphs = result.trim().split(/\n\s*\n/)
        
        if (paragraphs.length === 1) {
          synopsis.shortSynopsis = paragraphs[0]
        } else if (paragraphs.length >= 2) {
          synopsis.shortSynopsis = paragraphs[0]
          synopsis.longSynopsis = paragraphs.slice(1).join('\n\n')
        }
        
        // 创建默认变体
        synopsis.variations.push({
          id: Date.now(),
          title: '标准版本',
          content: result.trim(),
          length: result.length
        })
      }
      
      console.log('简介解析结果:', synopsis)
      return synopsis
      
    } catch (error) {
      console.error('简介解析失败:', error)
      return {
        shortSynopsis: result.trim(),
        longSynopsis: '',
        logline: '',
        backCover: '',
        pitchPoints: [],
        hooks: [],
        variations: [{
          id: Date.now(),
          title: '生成版本',
          content: result.trim(),
          length: result.length
        }]
      }
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
  
  // 生成创新元素的辅助方法
  generateInnovationSeeds() {
    const seeds = [
      '反转常见认知', '跨时代融合', '多重身份', '记忆操控', '时间异象',
      '意识共享', '情感具象化', '道德悖论', '现实重构', '能力代价',
      '身份迷失', '选择恐惧', '责任冲突', '信任危机', '成长代价',
      '科技伦理', '人性边界', '真实虚幻', '权力腐败', '孤独救赎'
    ]
    return this.getRandomElements(seeds, 3)
  }
  
  generateCrossGenreCombinations(primaryGenre) {
    const combinations = {
      '都市': ['奇幻元素', '科幻设定', '悬疑推理', '历史穿越'],
      '奇幻': ['科技融合', '现代背景', '心理悬疑', '社会讽刺'],
      '科幻': ['魔法世界', '古代设定', '日常生活', '浪漫情节'],
      '历史': ['超自然力量', '现代视角', '科技穿插', '幻想色彩'],
      '悬疑': ['超能力', '多元宇宙', '时间循环', '记忆重构'],
      '言情': ['末世背景', '超能设定', '时空错乱', '身份互换'],
      '武侠': ['现代科技', '外星文明', '虚拟世界', '心理操控']
    }
    return combinations[primaryGenre] || ['跨类型实验', '文类融合', '风格突破']
  }
  
  getCurrentTrends() {
    const trends = [
      'AI伦理探讨', '元宇宙概念', '环境危机', '社交媒体影响',
      '基因编辑', '量子理论', '区块链技术', '虚拟现实',
      '生物工程', '太空探索', '气候变化', '数字永生',
      '人工智能情感', '虚实边界', '算法偏见', '数据隐私'
    ]
    return this.getRandomElements(trends, 4)
  }
  
  generateUniqueAngles() {
    const angles = [
      '反派视角叙述', '非线性时间线', '多重现实层', '逆向因果',
      '群体意识', '记忆碎片', '感官置换', '身份流动',
      '道德相对论', '存在主义思考', '荒诞现实', '梦境与现实交织',
      '时间悖论', '平行自我', '意识上传', '情感数据化'
    ]
    return this.getRandomElements(angles, 3)
  }
  
  getRandomElements(array, count) {
    const shuffled = array.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }
  
  generateCulturalInnovations() {
    const innovations = [
      '情感经济体系', '记忆共享传统', '时间价值重构', '身份流动性',
      '集体决策机制', '虚拟现实融合', '生物改造文化', '能量意识形态',
      '跨物种交流', '死亡观念重塑', '知识继承方式', '责任分担制度',
      '创造力量化', '痛苦转化机制', '梦境社交网络', '直觉验证系统'
    ]
    return this.getRandomElements(innovations, 3)
  }
  
  generateSystemComplexities() {
    const complexities = [
      '多重权力制衡', '非线性因果关系', '动态平衡机制', '递归反馈系统',
      '边界模糊化', '循环依赖结构', '突现性特征', '自组织演化',
      '混沌中的秩序', '对称性破缺', '信息不对称', '时空扭曲效应',
      '量子叠加态', '熵增抗衡机制', '复杂适应性', '网络效应放大'
    ]
    return this.getRandomElements(complexities, 3)
  }
  
  generateConflictSources() {
    const sources = [
      '认知差异', '价值观冲突', '资源分配不均', '权力结构变迁',
      '技术鸿沟', '文化隔阂', '代际分歧', '信息不透明',
      '利益不一致', '道德边界争议', '生存压力', '身份认同危机',
      '时间紧迫性', '选择两难', '责任归属', '信任破裂'
    ]
    return this.getRandomElements(sources, 4)
  }
  
  generatePhilosophicalThemes() {
    const themes = [
      '存在的意义', '自由与宿命', '个体与集体', '真实与虚幻',
      '正义与效率', '传统与创新', '理性与感性', '知识与智慧',
      '爱与责任', '权力与腐败', '希望与绝望', '成长与代价',
      '孤独与连接', '选择与后果', '记忆与遗忘', '死亡与永恒'
    ]
    return this.getRandomElements(themes, 3)
  }
  
  generatePersonalityLayers() {
    const layers = [
      '表里不一', '情感抽离', '过度补偿', '自我欺骗',
      '情绪波动', '认知偏差', '社交面具', '防御机制',
      '内心矛盾', '价值冲突', '恐惧驱动', '渴望认同',
      '完美主义', '控制欲', '被动攻击', '情感依赖'
    ]
    return this.getRandomElements(layers, 4)
  }
  
  generateFlawSystems() {
    const flaws = [
      '过度自信', '偏执固执', '情感盲区', '道德盲点',
      '判断错误', '沟通障碍', '信任问题', '责任逃避',
      '冲动行为', '拖延症', '完美主义', '自我怀疑',
      '恐惧驱动', '愤怒管理', '边界模糊', '习惯依赖'
    ]
    return this.getRandomElements(flaws, 3)
  }
  
  generateMotivationComplexities() {
    const motivations = [
      '补偿心理', '证明价值', '寻求安全', '追求认同',
      '报复驱动', '愧疚弥补', '恐惧逃避', '控制欲望',
      '救赎渴望', '完整追求', '真相探寻', '正义执着',
      '自我实现', '爱的渴求', '权力野心', '自由向往'
    ]
    return this.getRandomElements(motivations, 3)
  }
  
  generateRelationshipDynamics() {
    const dynamics = [
      '权力失衡', '相互依赖', '情感勒索', '界限模糊',
      '竞争关系', '互补需求', '创伤共鸣', '价值冲突',
      '保护欲望', '嫉妒心理', '忠诚考验', '背叛创伤',
      '理想化期待', '失望循环', '成长催化', '治愈关系'
    ]
    return this.getRandomElements(dynamics, 3)
  }
  
  buildBrainstormPrompt(params) {
    // 增加创新性元素
    const innovationSeeds = this.generateInnovationSeeds()
    const crossGenreCombinations = this.generateCrossGenreCombinations(params.genre)
    const currentTrends = this.getCurrentTrends()
    const uniqueAngles = this.generateUniqueAngles()
    
    return `作为一名富有创造力的小说构思专家，请基于以下信息生成5个极具创新性和原创性的小说脑洞。

**基础信息：**
- 基础想法：${params.baseIdea || '开放性创作'}
- 创意方向：${params.direction || '不限'}
- 类型偏好：${params.genre || '混合类型'}

**创新性指导元素：**
- 创新触发词：${innovationSeeds.join('、')}
- 跨类型融合：${crossGenreCombinations.join('、')}
- 现代元素：${currentTrends.join('、')}
- 独特视角：${uniqueAngles.join('、')}

**核心创作要求：**
1. **避免套路**：彻底摆脱传统套路，每个脑洞都要有意外转折
2. **创新融合**：至少融合2-3个不同领域的元素
3. **情感深度**：每个设定都要触及深层人性问题
4. **逻辑自洽**：创新的同时确保内在逻辑合理
5. **现实关联**：与当代读者的现实体验产生共鸣
6. **长篇潜力**：具备复杂的世界观和多线程发展空间

**输出格式：**
脑洞1：[富有想象力且引人深思的标题]
- 核心设定：[融合多个创新元素的独特世界观，至少包含一个颠覆性概念]
- 创意亮点：[与众不同的创新点，说明为什么这个设定前所未有]
- 冲突层次：[多维度复合冲突，包括内在冲突、人际冲突、社会冲突的交织]
- 发展脉络：[展示故事的成长弧线和深层主题探索方向]
- 现实映射：[说明这个虚构设定反映的现实议题或人性思考]
- 创新指数：★★★★★（标注创新程度和原创性）

**特别提醒：**
- 每个脑洞都要经得起逻辑推敲，但要充满想象力
- 避免使用"天才少年"、"废材逆袭"等老套模式
- 重视角色的心理复杂性和成长变化
- 确保每个设定都有独特的价值观冲突`
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
    const culturalElements = this.generateCulturalInnovations()
    const systemComplexities = this.generateSystemComplexities()
    const conflictSources = this.generateConflictSources()
    const philosophicalThemes = this.generatePhilosophicalThemes()
    
    return `作为世界构建专家，请为小说创建一个逻辑严谨、富有创新性的世界观体系。

**基础设定：**
- 小说类型：${conceptData.selectedGenre || '待定'}
- 核心创意：${conceptData.coreIdea || '开放式设定'}
- 世界类型：${params.worldType || '混合世界'}
- 规模大小：${params.scale || '中等规模'}

**创新指导元素：**
- 文化创新点：${culturalElements.join('、')}
- 系统复杂性：${systemComplexities.join('、')}
- 冲突来源：${conflictSources.join('、')}
- 哲学主题：${philosophicalThemes.join('、')}

**详细构建要求：**

### 1. 世界的基本设定和规则
- 核心运作原理（避免简单的魔法/科技解释）
- 独特的物理/超自然法则
- 世界级的平衡机制和制约因素
- 普通人与特殊存在的关系

### 2. 社会结构和文化
- 权力分布的复杂性（避免单纯的阶级制）
- 文化多元性和文明冲突
- 社会变革的推动力和阻力
- 日常生活中的独特习俗和价值观

### 3. 力量体系（如适用）
- 力量获得的代价和条件
- 不同力量之间的相互制约
- 力量对个体和社会的深远影响
- 力量失衡带来的问题和危机

### 4. 历史背景
- 关键历史转折点及其深远影响
- 被遗忘或隐藏的历史真相
- 历史循环与当前时代的关联
- 不同群体对历史的不同认知

### 5. 地理环境
- 地理环境对文明发展的塑造作用
- 特殊地形/气候带来的生存挑战
- 资源分布引发的地缘政治
- 环境变化对社会结构的冲击

### 6. 与故事主题的深层结合
- 世界观如何反映和强化核心主题
- 环境设定对角色成长的催化作用
- 世界冲突与人物内心冲突的呼应
- 设定的象征意义和哲学思考

**创新性要求：**
- 避免纯粹模仿现有作品的设定
- 融合多个领域的知识创造独特概念  
- 每个设定都要有深层的逻辑支撑
- 注重细节的合理性和一致性
- 为读者带来新鲜的认知体验

**输出格式要求：**
请按照上述6个部分分别详细阐述，每个部分都要体现创新性和复杂性，确保整个世界观既令人惊叹又经得起逻辑推敲。`
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
    const personalityLayers = this.generatePersonalityLayers()
    const flawSystems = this.generateFlawSystems()
    const motivationComplexities = this.generateMotivationComplexities()
    const relationshipDynamics = this.generateRelationshipDynamics()
    
    let contextInfo = ''
    if (conceptData.selectedGenre) {
      contextInfo += `小说类型：${conceptData.selectedGenre}\n`
    }
    if (worldData.worldType) {
      contextInfo += `世界背景：${worldData.worldType}\n`
    }
    
    return `作为专业的角色设计师，请创造${params.count || 1}个极具深度和原创性的${params.role}角色。

**基础设定：**
${contextInfo}
- 角色类型：${params.role}
- 特殊要求：${params.requirements || '无特殊要求'}
- 性格倾向：${params.personality || '开放设计'}

**创新设计指导：**
- 性格层次：${personalityLayers.join('、')}
- 缺陷体系：${flawSystems.join('、')}
- 动机复杂性：${motivationComplexities.join('、')}
- 关系动力：${relationshipDynamics.join('、')}

**角色深度设计要求：**

### 1. 核心身份构建
- **姓名含义**：名字要与角色内在特质或命运有深层关联
- **多重身份**：社会身份、内心身份、他人眼中的身份的错位与冲突
- **身份演变**：角色在故事中身份认知的变化轨迹

### 2. 外貌与象征系统
- **外貌特征**：避免单纯的美化，要体现内在性格和经历痕迹  
- **习惯动作**：特定的肢体语言反映心理状态
- **象征元素**：服装、配饰、疤痕等的象征意义

### 3. 多层次性格结构
- **表层性格**：日常展现给他人的性格面具
- **深层性格**：内心真实的性格特征和价值观
- **隐藏面**：连角色自己都不完全了解的潜在特质
- **性格矛盾**：内在的冲突和矛盾，使角色更加立体

### 4. 复杂背景构建
- **成长环境**：如何塑造了角色的世界观和行为模式
- **关键转折**：改变角色人生轨迹的重要事件
- **未愈创伤**：影响当前行为的心理创伤或遗憾
- **隐藏秘密**：角色不愿让人知道的过去或现在

### 5. 能力与局限平衡
- **核心天赋**：角色擅长的能力，但要避免完美无缺
- **致命弱点**：不仅是能力上的不足，更是性格上的盲点
- **成长空间**：角色在故事中可能突破的局限
- **代价机制**：每项能力或优势所付出的代价

### 6. 动机驱动系统
- **表面目标**：角色声称或自认为的目标
- **深层需求**：真正驱动角色的内在需求（可能与表面目标冲突）
- **恐惧源泉**：角色最害怕失去或面对的东西
- **价值观冲突**：角色内在价值观的矛盾和挣扎

### 7. 关系生态系统
- **核心关系**：对角色成长最重要的人际关系
- **关系模式**：角色在不同关系中呈现的不同面貌
- **情感依附**：角色的依附模式和情感表达方式
- **冲突关系**：与其他角色的深层冲突及其根源

**创新性标准：**
- 避免脸谱化和套路化的角色设计
- 每个角色都要有独特的世界观和表达方式
- 角色的缺陷要成为故事推进的动力
- 确保角色行为的逻辑自洽性和情感真实性
- 角色要能够在不同情境下展现出不同侧面

**输出格式：**
请为每个角色提供上述7个方面的详细描述，确保角色既有鲜明的个性特色，又具备足够的成长空间和故事张力。`
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
