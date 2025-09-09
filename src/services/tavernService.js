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
  }

  /**
   * 根据小说类型获取推荐作者
   */
  getRecommendedAuthors(genre, count = 5) {
    const authors = getAuthorsByGenre(genre)
    // 随机选择推荐作者，确保多样性
    const shuffled = authors.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, Math.min(count, authors.length))
  }

  /**
   * 启动酒馆讨论
   */
  async startDiscussion(config) {
    const {
      discussionId,
      topic,
      context,
      selectedAuthors,
      rounds = 3,
      backgroundInfo = {}
    } = config

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

    this.discussions.set(discussionId, discussion)

    // 开始第一轮讨论
    await this.conductRound(discussionId)
    
    return discussion
  }

  /**
   * 进行一轮讨论
   */
  async conductRound(discussionId) {
    const discussion = this.discussions.get(discussionId)
    if (!discussion) return

    discussion.status = 'discussing'
    discussion.currentRound++

    // 为每个作者生成发言
    for (const author of discussion.authors) {
      try {
        const message = await this.generateAuthorMessage(author, discussion)
        if (message) {
          discussion.messages.push({
            authorId: author.id,
            authorName: author.name,
            round: discussion.currentRound,
            content: message,
            timestamp: Date.now()
          })
        }
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

    // 检查是否需要继续讨论或进入投票
    if (discussion.currentRound >= discussion.rounds) {
      await this.startVoting(discussionId)
    } else {
      // 继续下一轮讨论
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

    // 从讨论中提取方案
    await this.extractProposals(discussionId)

    // 每个作者对所有方案投票
    for (const author of discussion.authors) {
      try {
        const vote = await this.generateAuthorVote(author, discussion)
        if (vote) {
          discussion.votes[author.id] = vote
        }
      } catch (error) {
        console.error(`Author ${author.name} failed to vote:`, error)
        // 随机投票作为备用
        discussion.votes[author.id] = {
          ranking: discussion.proposals.map((_, index) => index).sort(() => 0.5 - Math.random())
        }
      }
    }

    // 统计投票结果
    this.calculateVotingResults(discussionId)
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

    // 计算得分 (第1名得5分，第2名得4分，依此类推)
    for (const [authorId, vote] of Object.entries(discussion.votes)) {
      if (vote && vote.ranking) {
        voteDetails[authorId] = vote.ranking
        for (let i = 0; i < vote.ranking.length; i++) {
          const proposalIndex = vote.ranking[i]
          const score = discussion.proposals.length - i
          if (proposalIndex >= 0 && proposalIndex < scores.length) {
            scores[proposalIndex] += score
          }
        }
      }
    }

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
    }
  }

  /**
   * 恢复讨论
   */
  resumeDiscussion(discussionId) {
    const discussion = this.discussions.get(discussionId)
    if (discussion && discussion.status === 'paused') {
      discussion.status = 'discussing'
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
    return Array.from(this.discussions.values()).filter(d => d.status !== 'completed')
  }
}

// 创建单例实例
export const tavernService = new TavernService()

// 定期清理
setInterval(() => {
  tavernService.cleanup()
}, 600000) // 每10分钟清理一次