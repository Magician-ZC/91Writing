/**
 * 酒馆模式服务
 * 管理作者agent讨论、投票、结果整合等功能
 */

import { getAuthorsByGenre, getAuthorById } from '@/data/authorsDatabase.js'
import apiService from './api.js'

export class TavernService {
  constructor() {
    this.discussions = new Map() // 存储进行中的讨论
    this.discussionHistory = new Map() // 存储历史讨论记录
    this.updateCallbacks = new Set() // 存储更新回调
    
    // 从localStorage恢复数据
    this.loadFromStorage()
  }

  /**
   * 从localStorage加载数据
   */
  loadFromStorage() {
    try {
      const savedDiscussions = localStorage.getItem('tavernDiscussions')
      const savedHistory = localStorage.getItem('tavernHistory')
      
      console.log('准备从localStorage恢复数据:')
      console.log('savedDiscussions:', savedDiscussions)
      console.log('savedHistory:', savedHistory)
      
      if (savedDiscussions) {
        const discussionsData = JSON.parse(savedDiscussions)
        console.log('解析的活跃讨论数据:', discussionsData)
        for (const [id, data] of Object.entries(discussionsData)) {
          this.discussions.set(id, data)
        }
      }
      
      if (savedHistory) {
        const historyData = JSON.parse(savedHistory)
        console.log('解析的历史讨论数据:', historyData)
        for (const [id, data] of Object.entries(historyData)) {
          this.discussionHistory.set(id, data)
        }
      }
      
      console.log('已从localStorage恢复讨论数据:', this.discussions.size, '个活跃讨论，', this.discussionHistory.size, '个历史讨论')
      console.log('恢复后的discussions:', Array.from(this.discussions.entries()))
      console.log('恢复后的history:', Array.from(this.discussionHistory.entries()))
    } catch (error) {
      console.error('恢复讨论数据失败:', error)
    }
  }

  /**
   * 保存数据到localStorage - 优化日志输出
   */
  saveToStorage() {
    try {
      const discussionsData = Object.fromEntries(this.discussions)
      const historyData = Object.fromEntries(this.discussionHistory)
      
      const activeCount = Object.keys(discussionsData).length
      const historyCount = Object.keys(historyData).length
      
      localStorage.setItem('tavernDiscussions', JSON.stringify(discussionsData))
      localStorage.setItem('tavernHistory', JSON.stringify(historyData))
      
      // 减少日志输出，只在有意义的变化时输出
      if (!this._lastSaveCount) {
        this._lastSaveCount = { active: 0, history: 0 }
      }
      
      if (activeCount !== this._lastSaveCount.active || historyCount !== this._lastSaveCount.history) {
        console.log('💾 数据已保存到localStorage:', { 活跃: activeCount, 历史: historyCount })
        this._lastSaveCount = { active: activeCount, history: historyCount }
      }
    } catch (error) {
      console.error('保存讨论数据失败:', error)
    }
  }

  /**
   * 根据小说类型获取推荐作者
   */
  getRecommendedAuthors(genre, count = null) {
    const authors = getAuthorsByGenre(genre)
    // 随机选择推荐作者，确保多样性
    const shuffled = authors.sort(() => 0.5 - Math.random())
    // 如果没有指定count，返回所有作者；否则返回指定数量
    return count ? shuffled.slice(0, Math.min(count, authors.length)) : shuffled
  }

  /**
   * 启动酒馆讨论
   */
  async startDiscussion(config) {
    console.log('🍺 tavernService.startDiscussion 被调用')
    console.log('📝 配置参数:', config)
    
    const {
      discussionId,
      topic,
      context,
      selectedAuthors,
      rounds = 3,
      backgroundInfo = {}
    } = config

    console.log('🔍 解构后的参数:')
    console.log('- discussionId:', discussionId)
    console.log('- topic:', topic)
    console.log('- context:', context)
    console.log('- selectedAuthors:', selectedAuthors)
    console.log('- rounds:', rounds)
    console.log('- backgroundInfo:', backgroundInfo)

    // 验证必要参数
    if (!discussionId) {
      console.error('❌ discussionId 缺失')
      throw new Error('discussionId 是必需的')
    }
    
    if (!selectedAuthors || selectedAuthors.length === 0) {
      console.error('❌ selectedAuthors 缺失或为空')
      throw new Error('selectedAuthors 是必需的且不能为空')
    }

    // 创建讨论实例
    const discussion = {
      id: discussionId,
      topic,
      context,
      authors: selectedAuthors.map(authorId => getAuthorById(authorId)),
      rounds,
      currentRound: 0,
      messages: [],
      proposals: [],
      votes: {},
      status: 'starting', // starting, discussing, voting, completed
      startTime: Date.now(),
      backgroundInfo
    }

    console.log('📋 创建的讨论实例:', discussion)
    console.log('👥 作者信息:', discussion.authors)

    this.discussions.set(discussionId, discussion)
    console.log('💾 讨论已保存到内存 Map，当前 discussions.size:', this.discussions.size)
    
    this.saveToStorage() // 保存到localStorage
    console.log('🗄️ 讨论已保存到 localStorage')

    // 开始第一轮讨论
    console.log('🚀 开始第一轮讨论...')
    await this.conductRound(discussionId)
    
    console.log('✅ startDiscussion 完成，返回讨论实例')
    return discussion
  }

  /**
   * 进行一轮讨论
   */
  async conductRound(discussionId) {
    console.log('🎯 conductRound 被调用, discussionId:', discussionId)
    
    const discussion = this.discussions.get(discussionId)
    if (!discussion) {
      console.error('❌ conductRound: 找不到讨论 ID:', discussionId)
      console.log('当前所有讨论 IDs:', Array.from(this.discussions.keys()))
      // 尝试从localStorage恢复
      this.loadFromStorage()
      const restoredDiscussion = this.discussions.get(discussionId)
      if (!restoredDiscussion) {
        console.error('❌ 恢复后仍找不到讨论，停止处理')
        return
      }
      console.log('✅ 从localStorage成功恢复讨论')
    }

    console.log('📋 找到讨论:', {
      id: discussion.id,
      topic: discussion.topic,
      status: discussion.status,
      currentRound: discussion.currentRound,
      authors: discussion.authors?.length || 0
    })

    discussion.status = 'discussing'
    discussion.currentRound++
    this.saveToStorage() // 保存轮次进度

    console.log(`✅ 讨论状态更新: status = ${discussion.status}, currentRound = ${discussion.currentRound}`)

    console.log(`🍺 开始第 ${discussion.currentRound} 轮讨论，主题：${discussion.topic}`)

    // 为每个作者生成发言
    for (const author of discussion.authors) {
      try {
        console.log(`🎭 ${author.name} 正在发言中...`)
        const message = await this.generateAuthorMessage(author, discussion)
        if (message) {
          const messageObj = {
            authorId: author.id,
            authorName: author.name,
            round: discussion.currentRound,
            content: typeof message === 'string' ? message : '消息内容解析错误', // 🔧 确保content是字符串
            timestamp: Date.now()
          }
          
          // 🔧 调试：检查消息对象
          if (typeof message !== 'string') {
            console.warn('⚠️ 消息不是字符串类型:', typeof message, message)
          }
          
          discussion.messages.push(messageObj)
          this.saveToStorage() // 保存每条消息
          
          // 触发自定义事件，通知界面更新
          this.notifyMessageUpdate(discussion.id)
          
          console.log(`💬 ${author.name}: ${message.substring(0, 50)}...`)
        }
        
        // 添加短暂延迟，让用户能看到讨论过程
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        console.error(`Author ${author.name} failed to generate message:`, error)
        // 生成备用回应
        discussion.messages.push({
          authorId: author.id,
          authorName: author.name,
          round: discussion.currentRound,
          content: `我需要更多时间思考这个问题...`,
          timestamp: Date.now()
        })
      }
    }

    console.log(`✅ 第 ${discussion.currentRound} 轮讨论完成`)

    // 检查是否需要继续讨论或进入投票
    if (discussion.currentRound >= discussion.rounds) {
      console.log('🗳️ 开始投票阶段...')
      await this.startVoting(discussionId)
    } else {
      // 继续下一轮讨论
      console.log(`⏱️ 准备开始第 ${discussion.currentRound + 1} 轮讨论...`)
      // 使用更安全的方式避免无限递归
      if (discussion.currentRound < 10) { // 最多10轮，防止无限循环
        setTimeout(() => this.conductRound(discussionId), 1000)
      } else {
        console.warn('⚠️ 讨论轮数过多，强制进入投票阶段')
        await this.startVoting(discussionId)
      }
    }
  }

  /**
   * 为指定作者生成发言内容
   */
  async generateAuthorMessage(author, discussion) {
    const { topic, context, messages, backgroundInfo } = discussion
    
    // 构建上下文信息
    let contextInfo = `讨论主题：${topic}\n`
    if (context) contextInfo += `背景信息：${context}\n`
    
    // 添加背景内容（如已生成的力量体系等）
    if (backgroundInfo && Object.keys(backgroundInfo).length > 0) {
      contextInfo += `相关背景：\n`
      for (const [key, value] of Object.entries(backgroundInfo)) {
        if (value) {
          // 🔧 修复：对于coreIdea等重要字段，不要截断，保持完整
          if (key === 'coreIdea' && typeof value === 'string') {
            contextInfo += `- ${key}：${value}\n` // 完整传递核心创意
          } else if (typeof value === 'string') {
            // 其他字段适当限制长度
            const truncated = value.length > 300 ? value.substring(0, 300) + '...' : value
            contextInfo += `- ${key}：${truncated}\n`
          } else {
            contextInfo += `- ${key}：${JSON.stringify(value).substring(0, 200)}\n`
          }
        }
      }
    }

    // 添加之前的讨论内容
    if (messages.length > 0) {
      contextInfo += `\n之前的讨论：\n`
      const recentMessages = messages.slice(-6) // 最近6条消息
      for (const msg of recentMessages) {
        contextInfo += `${msg.authorName}：${msg.content}\n`
      }
    }

    const prompt = `你是著名作家${author.name}，以下是你的写作特点：
- 擅长领域：${author.specialties.join('、')}
- 写作风格：${author.style}
- 代表作品：${author.masterworks.join('、')}
- 核心理念：${author.coreIdeas.join('、')}
- 个性特点：${author.personality}

现在请你作为${author.name}的身份，针对以下讨论发表看法：

${contextInfo}

请用你独特的风格和观点来回应，体现你的写作理念和专业见解。回应应该：
1. 体现你的个人风格和偏好
2. 提出具体的创意建议
3. 与之前的讨论形成有益的互动
4. 控制在150字以内

回应内容：`

    try {
      const response = await apiService.generateText(prompt, {
        model: 'deepseek-chat',
        temperature: 0.8 // 提高创造性
      })
      
      // 🔧 修复：确保返回字符串而不是对象
      if (typeof response === 'object') {
        console.warn('⚠️ API返回了对象而不是字符串:', response)
        return JSON.stringify(response)
      }
      return response || '我需要更多时间思考...'
    } catch (error) {
      console.error('Failed to generate author message:', error)
      // 返回基于作者特点的备用回应
      return this.generateFallbackMessage(author, discussion)
    }
  }

  /**
   * 生成备用回应（当API调用失败时）
   */
  generateFallbackMessage(author, discussion) {
    const fallbacks = [
      `基于我的${author.masterworks[0]}创作经验，我认为${discussion.topic}需要更多的${author.coreIdeas[0]}元素。`,
      `从${author.style}的角度看，这个设定可以加入更多${author.specialties[0]}的特色。`,
      `我的写作理念是${author.coreIdeas[0]}，建议在这个基础上发展。`
    ]
    
    return fallbacks[Math.floor(Math.random() * fallbacks.length)]
  }

  /**
   * 开始投票环节
   */
  async startVoting(discussionId) {
    const discussion = this.discussions.get(discussionId)
    if (!discussion) return

    discussion.status = 'voting'
    console.log('🗳️ 投票阶段开始')

    // 从讨论中提取方案
    console.log('📋 正在分析讨论内容，提取方案...')
    await this.extractProposals(discussionId)
    console.log(`📝 已提取 ${discussion.proposals.length} 个方案`)

    // 每个作者对所有方案投票
    for (const author of discussion.authors) {
      try {
        console.log(`🎯 ${author.name} 正在投票...`)
        const vote = await this.generateAuthorVote(author, discussion)
        if (vote) {
          discussion.votes[author.id] = vote
          console.log(`✅ ${author.name} 投票完成`)
        }
        
        // 添加延迟，让用户看到投票过程
        await new Promise(resolve => setTimeout(resolve, 300))
      } catch (error) {
        console.error(`Author ${author.name} failed to vote:`, error)
        // 随机投票作为备用
        discussion.votes[author.id] = {
          ranking: discussion.proposals.map((_, index) => index).sort(() => 0.5 - Math.random())
        }
        console.log(`⚠️ ${author.name} 投票失败，使用随机投票`)
      }
    }

    console.log('🏆 正在统计投票结果...')
    // 统计投票结果
    this.calculateVotingResults(discussionId)
    console.log('🎉 酒馆讨论全部完成！')
  }

  /**
   * 从讨论中提取具体方案
   */
  async extractProposals(discussionId) {
    const discussion = this.discussions.get(discussionId)
    if (!discussion) return

    const allMessages = discussion.messages.join('\n')
    
    const prompt = `请从以下讨论内容中提取3-5个具体的、可执行的方案：

讨论主题：${discussion.topic}
讨论内容：
${allMessages}

请提取出具体的方案，每个方案应该：
1. 有明确的核心思路
2. 包含具体的实现建议  
3. 体现不同的创意方向

特别说明：如果是世界构建讨论，请尝试针对不同方面（基本架构、历史背景、文化传统、地理环境）提供多元化的方案。

请以JSON格式返回方案列表：
[
  {
    "title": "方案标题",
    "core": "核心思路",
    "details": "具体内容",
    "advantages": "优势特点",
    "category": "方案类别（可选）"
  }
]

如果JSON格式有问题，也可以用以下格式：

方案1：[标题]
核心思路：[内容]
具体实现：[内容] 
优势特点：[内容]

方案2：[标题]
...`

    try {
      const response = await apiService.generateText(prompt, {
        model: 'deepseek-chat',
        temperature: 0.3
      })

      // 🔧 修复：智能解析AI返回的内容，支持多种格式
      let proposals = []
      try {
        // 尝试直接解析JSON
        proposals = JSON.parse(response)
      } catch (jsonError) {
        console.log('🔧 JSON解析失败，尝试智能提取方案...', jsonError.message)
        proposals = this.parseProposalsFromText(response)
      }
      
      discussion.proposals = Array.isArray(proposals) ? proposals : []
      console.log('📝 成功提取方案:', discussion.proposals.length, '个')
    } catch (error) {
      console.error('Failed to extract proposals:', error)
      // 备用方案：从消息中简单提取
      discussion.proposals = this.extractFallbackProposals(discussion)
    }
  }

  /**
   * 从文本中智能解析方案（当JSON解析失败时）
   */
  parseProposalsFromText(text) {
    const proposals = []
    
    try {
      // 尝试提取JSON部分
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const jsonStr = jsonMatch[0]
        return JSON.parse(jsonStr)
      }
      
      // 如果没有JSON，尝试智能解析
      const lines = text.split('\n').filter(line => line.trim())
      let currentProposal = null
      
      for (const line of lines) {
        const trimmed = line.trim()
        
        // 检测方案标题
        if (trimmed.includes('方案') || trimmed.includes('建议') || trimmed.includes('思路') || 
            trimmed.match(/^\d+[.\s]/)) {
          if (currentProposal) proposals.push(currentProposal)
          currentProposal = {
            title: trimmed.replace(/^\d+[.\s]*/, '').substring(0, 50),
            core: trimmed,
            details: '',
            advantages: ''
          }
        } else if (currentProposal && trimmed.length > 0) {
          // 补充详细内容
          if (currentProposal.details.length < 200) {
            currentProposal.details += (currentProposal.details ? ' ' : '') + trimmed
          } else if (!currentProposal.advantages) {
            currentProposal.advantages = trimmed.substring(0, 100)
          }
        }
      }
      
      if (currentProposal) proposals.push(currentProposal)
      
      // 如果还是没有有效方案，生成基础方案
      if (proposals.length === 0) {
        const sentences = text.split(/[。！？]/).filter(s => s.trim().length > 10)
        for (let i = 0; i < Math.min(sentences.length, 5); i++) { // 🔧 修复：增加到5个方案
          proposals.push({
            title: `讨论方案${i + 1}`,
            core: sentences[i].trim(),
            details: sentences[i].trim(),
            advantages: '基于讨论内容提取的观点'
          })
        }
      }
      
      // 🔧 修复：如果方案数量太少，生成更多方案
      while (proposals.length < 3 && proposals.length > 0) {
        const baseProposal = proposals[proposals.length - 1]
        proposals.push({
          title: `${baseProposal.title}的变体${proposals.length + 1}`,
          core: `${baseProposal.core}的另一种思路`,
          details: `基于${baseProposal.details}的扩展方案`,
          advantages: `结合${baseProposal.advantages}的优化版本`
        })
      }
      
      console.log('🎯 智能解析提取到方案:', proposals.length, '个')
      return proposals.slice(0, 5) // 最多5个方案
    } catch (error) {
      console.error('智能解析方案失败:', error)
      return [{
        title: '综合讨论方案',
        core: text.substring(0, 100),
        details: text.substring(0, 200),
        advantages: '从讨论中提取的综合观点'
      }]
    }
  }

  /**
   * 备用方案提取
   */
  extractFallbackProposals(discussion) {
    const messages = discussion.messages
    const proposals = []
    
    // 🔧 修复：简单提取每个作者的主要观点，确保至少3个方案
    const authorViewpoints = new Map()
    
    for (const msg of messages) {
      if (!authorViewpoints.has(msg.authorId)) {
        const author = discussion.authors.find(a => a.id === msg.authorId) || { name: '未知作者', style: '独特风格' }
        const content = typeof msg.content === 'string' ? msg.content : '讨论观点'
        
        proposals.push({
          title: `${author.name}的方案`,
          core: content.length > 50 ? content.substring(0, 50) + '...' : content,
          details: content.substring(0, 200),
          advantages: `体现了${author.style}的特色`
        })
        authorViewpoints.set(msg.authorId, true)
        
        // 确保有足够的方案数量
        if (proposals.length >= 5) break
      }
    }
    
    // 🔧 修复：如果方案不足，创建更多备用方案
    while (proposals.length < 3) {
      const baseIndex = proposals.length % Math.max(messages.length, 1)
      const baseMsg = messages[baseIndex] || { content: '基础讨论内容' }
      const content = typeof baseMsg.content === 'string' ? baseMsg.content : '讨论观点'
      
      proposals.push({
        title: `综合方案${proposals.length + 1}`,
        core: content.substring(0, 50) || '基于讨论的综合方案',
        details: content.substring(0, 200) || '综合多方观点的详细方案',
        advantages: '结合多位作者观点的综合优势'
      })
    }
    
    console.log('🔄 备用方案生成完成:', proposals.length, '个')
    return proposals.slice(0, 5)
  }

  /**
   * 生成作者投票
   */
  async generateAuthorVote(author, discussion) {
    const proposalsText = discussion.proposals.map((p, index) => 
      `方案${index + 1}：${p.title}\n核心：${p.core}\n详情：${p.details}\n优势：${p.advantages}`
    ).join('\n\n')

    const prompt = `你是${author.name}，请对以下方案进行投票排序：

${proposalsText}

基于你的写作风格"${author.style}"和核心理念"${author.coreIdeas.join('、')}"，请对这些方案进行排序（1为最佳）。

请回答排序数组，例如：[2, 1, 3, 4] 表示第2个方案最佳，第1个方案次佳，以此类推。`

    try {
      const response = await apiService.generateText(prompt, {
        model: 'deepseek-chat',
        temperature: 0.3
      })

      // 解析排序结果
      const content = response
      const match = content.match(/\[[\d,\s]+\]/)
      if (match) {
        const ranking = JSON.parse(match[0])
        return { ranking: ranking.map(r => r - 1) } // 转换为0-based索引
      }
    } catch (error) {
      console.error(`Failed to generate vote for ${author.name}:`, error)
    }

    return null
  }

  /**
   * 计算投票结果
   */
  calculateVotingResults(discussionId) {
    const discussion = this.discussions.get(discussionId)
    if (!discussion) return

    const scores = new Array(discussion.proposals.length).fill(0)
    const voteDetails = {}

    console.log('🏆 开始计算投票结果')
    console.log('参与投票的作者数量:', Object.keys(discussion.votes).length)
    console.log('方案数量:', discussion.proposals.length)
    console.log('所有投票详情:', discussion.votes)

    // 计算得分 (方案数量决定分值，第1名得最高分)
    for (const [authorId, vote] of Object.entries(discussion.votes)) {
      if (vote && vote.ranking) {
        voteDetails[authorId] = vote.ranking
        console.log(`${authorId} 的投票排序:`, vote.ranking)
        
        for (let i = 0; i < vote.ranking.length; i++) {
          const proposalIndex = vote.ranking[i]
          const score = discussion.proposals.length - i
          if (proposalIndex >= 0 && proposalIndex < scores.length) {
            scores[proposalIndex] += score
            console.log(`方案${proposalIndex}获得${score}分 (排在第${i+1}位)`)
          }
        }
      }
    }
    
    console.log('最终得分:', scores)

    // 按得分排序，获取前3名
    const rankedProposals = discussion.proposals
      .map((proposal, index) => ({
        ...proposal,
        index,
        score: scores[index],
        votes: this.getVoteDistribution(index, voteDetails)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)

    discussion.results = {
      topProposals: rankedProposals,
      voteDetails,
      totalVotes: Object.keys(discussion.votes).length
    }

    discussion.status = 'completed'
    discussion.endTime = Date.now()

    // 保存到历史记录
    this.discussionHistory.set(discussionId, { ...discussion })
    this.saveToStorage() // 保存到localStorage
  }

  /**
   * 获取投票分布详情
   */
  getVoteDistribution(proposalIndex, voteDetails) {
    const distribution = { first: 0, second: 0, third: 0 }
    
    for (const ranking of Object.values(voteDetails)) {
      const position = ranking.indexOf(proposalIndex)
      if (position === 0) distribution.first++
      else if (position === 1) distribution.second++
      else if (position === 2) distribution.third++
    }
    
    return distribution
  }

  /**
   * 获取讨论状态
   */
  getDiscussionStatus(discussionId) {
    return this.discussions.get(discussionId)
  }

  /**
   * 暂停讨论
   */
  pauseDiscussion(discussionId) {
    const discussion = this.discussions.get(discussionId)
    if (discussion && discussion.status === 'discussing') {
      discussion.status = 'paused'
      this.saveToStorage() // 保存状态
    }
  }

  /**
   * 恢复讨论
   */
  resumeDiscussion(discussionId) {
    const discussion = this.discussions.get(discussionId)
    if (discussion && discussion.status === 'paused') {
      discussion.status = 'discussing'
      this.saveToStorage() // 保存状态
      // 继续当前轮次
      setTimeout(() => this.conductRound(discussionId), 1000)
    }
  }

  /**
   * 结束讨论
   */
  endDiscussion(discussionId) {
    const discussion = this.discussions.get(discussionId)
    if (discussion && discussion.status !== 'completed') {
      // 直接进入投票环节
      this.startVoting(discussionId)
    }
  }

  /**
   * 获取讨论结果
   */
  getDiscussionResult(discussionId) {
    const discussion = this.discussions.get(discussionId) || this.discussionHistory.get(discussionId)
    return discussion ? discussion.results : null
  }

  /**
   * 清理完成的讨论
   */
  cleanup() {
    for (const [id, discussion] of this.discussions.entries()) {
      if (discussion.status === 'completed' && Date.now() - discussion.endTime > 3600000) { // 1小时后清理
        this.discussions.delete(id)
      }
    }
  }

  /**
   * 获取活跃的讨论列表 - 修复无限打印和性能问题
   */
  getActiveDiscussions() {
    try {
      const allDiscussions = Array.from(this.discussions.values())
      const activeDiscussions = allDiscussions.filter(d => d && d.status && d.status !== 'completed')
      
      // 减少日志输出频率，只在有意义的变化时输出
      const currentCount = activeDiscussions.length
      const totalCount = allDiscussions.length
      
      if (!this._lastActiveCount) {
        this._lastActiveCount = 0
        this._lastTotalCount = 0
      }
      
      // 只在数量有变化或首次有讨论时输出日志
      if ((currentCount !== this._lastActiveCount || totalCount !== this._lastTotalCount) && (currentCount > 0 || totalCount > 0)) {
        console.log('🔍 活跃讨论状态更新:', {
          活跃: currentCount,
          总数: totalCount,
          变化: currentCount !== this._lastActiveCount ? '活跃数变化' : '总数变化'
        })
        
        this._lastActiveCount = currentCount
        this._lastTotalCount = totalCount
      }
      
      return activeDiscussions
    } catch (error) {
      console.error('getActiveDiscussions error:', error)
      return []
    }
  }

  /**
   * 获取所有讨论（包括历史讨论）- 优化性能，减少重复日志
   */
  getAllDiscussions() {
    try {
      const activeDiscussions = Array.from(this.discussions.values())
      const historyDiscussions = Array.from(this.discussionHistory.values())
      const allDiscussions = [...activeDiscussions, ...historyDiscussions]
      
      // 只在开发环境且有意义的变化时输出日志
      if (process.env.NODE_ENV === 'development') {
        const totalCount = allDiscussions.length
        if (!this._lastAllCount || this._lastAllCount !== totalCount) {
          console.log('tavernService getAllDiscussions:', {
            active: activeDiscussions.length,
            history: historyDiscussions.length,
            total: totalCount
          })
          this._lastAllCount = totalCount
        }
      }
      
      return allDiscussions
    } catch (error) {
      console.error('getAllDiscussions error:', error)
      return []
    }
  }

  /**
   * 根据讨论ID获取讨论（从活跃和历史中查找）
   */
  getDiscussionById(discussionId) {
    return this.discussions.get(discussionId) || this.discussionHistory.get(discussionId)
  }

  /**
   * 根据前缀获取相关讨论（用于恢复步骤状态）
   */
  getDiscussionsByPrefix(prefix) {
    const allDiscussions = this.getAllDiscussions()
    return allDiscussions.filter(d => d.id.startsWith(prefix))
  }

  /**
   * 清理完成的讨论（超过24小时）
   */
  cleanup() {
    const now = Date.now()
    const dayInMs = 24 * 60 * 60 * 1000

    for (const [id, discussion] of this.discussions.entries()) {
      if (discussion.status === 'completed' && 
          discussion.endTime && 
          now - discussion.endTime > dayInMs) {
        this.discussions.delete(id)
      }
    }
    
    // 清理过期的历史记录（超过7天）
    const weekInMs = 7 * dayInMs
    for (const [id, discussion] of this.discussionHistory.entries()) {
      if (discussion.endTime && now - discussion.endTime > weekInMs) {
        this.discussionHistory.delete(id)
      }
    }
    
    // 保存清理后的状态
    this.saveToStorage()
  }

  /**
   * 清除项目相关缓存数据
   */
  clearProjectCache(genre) {
    // 清除包含特定类型的讨论
    for (const [id, discussion] of this.discussions.entries()) {
      if (discussion.backgroundInfo?.selectedGenre === genre || 
          discussion.topic.includes(genre) ||
          discussion.context.includes(genre)) {
        this.discussions.delete(id)
      }
    }
    
    for (const [id, discussion] of this.discussionHistory.entries()) {
      if (discussion.backgroundInfo?.selectedGenre === genre || 
          discussion.topic.includes(genre) ||
          discussion.context.includes(genre)) {
        this.discussionHistory.delete(id)
      }
    }
    
    this.saveToStorage()
    console.log(`已清除 ${genre} 相关的酒馆讨论缓存`)
  }

  /**
   * 清除所有缓存数据（用于调试或重置）
   */
  clearAllCache() {
    this.discussions.clear()
    this.discussionHistory.clear()
    localStorage.removeItem('tavernDiscussions')
    localStorage.removeItem('tavernHistory')
    console.log('已清除所有酒馆讨论缓存')
  }

  /**
   * 注册更新回调（用于实时通知界面更新）
   */
  onMessageUpdate(callback) {
    this.updateCallbacks.add(callback)
    
    // 返回取消函数
    return () => {
      this.updateCallbacks.delete(callback)
    }
  }

  /**
   * 通知消息更新
   */
  notifyMessageUpdate(discussionId) {
    for (const callback of this.updateCallbacks) {
      try {
        callback(discussionId)
      } catch (error) {
        console.error('更新回调执行失败:', error)
      }
    }
  }
}

// 创建单例实例
export const tavernService = new TavernService()

// 定期清理
setInterval(() => {
  tavernService.cleanup()
}, 600000) // 每10分钟清理一次