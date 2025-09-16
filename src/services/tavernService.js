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
   * 保存数据到localStorage
   */
  saveToStorage() {
    try {
      const discussionsData = Object.fromEntries(this.discussions)
      const historyData = Object.fromEntries(this.discussionHistory)
      
      console.log('正在保存数据到localStorage:')
      console.log('活跃讨论:', Object.keys(discussionsData).length, discussionsData)
      console.log('历史讨论:', Object.keys(historyData).length, historyData)
      
      localStorage.setItem('tavernDiscussions', JSON.stringify(discussionsData))
      localStorage.setItem('tavernHistory', JSON.stringify(historyData))
      
      console.log('数据已保存到localStorage')
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
      return
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
          discussion.messages.push({
            authorId: author.id,
            authorName: author.name,
            round: discussion.currentRound,
            content: message,
            timestamp: Date.now()
          })
          this.saveToStorage() // 保存每条消息
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
      setTimeout(() => this.conductRound(discussionId), 1000)
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
          contextInfo += `- ${key}：${typeof value === 'string' ? value.substring(0, 200) : JSON.stringify(value).substring(0, 200)}\n`
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
      
      return response
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

请以JSON格式返回方案列表：
[
  {
    "title": "方案标题",
    "core": "核心思路",
    "details": "具体内容",
    "advantages": "优势特点"
  }
]`

    try {
      const response = await apiService.generateText(prompt, {
        model: 'deepseek-chat',
        temperature: 0.3
      })

      const proposals = JSON.parse(response)
      discussion.proposals = Array.isArray(proposals) ? proposals : []
    } catch (error) {
      console.error('Failed to extract proposals:', error)
      // 备用方案：从消息中简单提取
      discussion.proposals = this.extractFallbackProposals(discussion)
    }
  }

  /**
   * 备用方案提取
   */
  extractFallbackProposals(discussion) {
    const messages = discussion.messages
    const proposals = []
    
    // 简单提取每个作者的主要观点
    const authorViewpoints = new Map()
    
    for (const msg of messages) {
      if (!authorViewpoints.has(msg.authorId)) {
        const author = discussion.authors.find(a => a.id === msg.authorId)
        proposals.push({
          title: `${author.name}的方案`,
          core: msg.content.substring(0, 50) + '...',
          details: msg.content,
          advantages: `体现了${author.style}的特色`
        })
        authorViewpoints.set(msg.authorId, true)
      }
    }
    
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
   * 获取活跃的讨论列表
   */
  getActiveDiscussions() {
    const allDiscussions = Array.from(this.discussions.values())
    const activeDiscussions = allDiscussions.filter(d => d.status !== 'completed')
    
    // 只在有讨论或第一次调用时输出日志，避免刷屏
    if (allDiscussions.length > 0 || !this._hasLoggedEmptyState) {
      console.log('🔍 getActiveDiscussions 调用:')
      console.log('- 总讨论数:', allDiscussions.length)
      console.log('- 活跃讨论数:', activeDiscussions.length)
      
      if (allDiscussions.length > 0) {
        console.log('- 所有讨论详情:', allDiscussions.map(d => ({
          id: d.id, 
          topic: d.topic, 
          status: d.status,
          authors: d.authors?.length || 0
        })))
        console.log('- 活跃讨论详情:', activeDiscussions.map(d => ({
          id: d.id, 
          topic: d.topic, 
          status: d.status,
          authors: d.authors?.length || 0
        })))
      }
      
      if (allDiscussions.length === 0) {
        this._hasLoggedEmptyState = true
      }
    }
    
    return activeDiscussions
  }

  /**
   * 获取所有讨论（包括历史讨论）
   */
  getAllDiscussions() {
    const activeDiscussions = Array.from(this.discussions.values())
    const historyDiscussions = Array.from(this.discussionHistory.values())
    const allDiscussions = [...activeDiscussions, ...historyDiscussions]
    console.log('tavernService getAllDiscussions:', {
      active: activeDiscussions.length,
      history: historyDiscussions.length,
      total: allDiscussions.length,
      discussions: allDiscussions
    })
    return allDiscussions
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
}

// 创建单例实例
export const tavernService = new TavernService()

// 定期清理
setInterval(() => {
  tavernService.cleanup()
}, 600000) // 每10分钟清理一次