/**
 * 思维导图服务
 * 提供思维导图的保存、加载等功能
 */

import apiManager from './apiManager'
import { ElMessage } from 'element-plus'

class MindMapService {
  /**
   * 保存思维导图数据到小说设置
   */
  async saveMindMap(novelId, mindMapData) {
    try {
      // 获取当前小说设置
      const novel = await apiManager.getNovel(novelId)
      const settings = novel.data?.settings || {}

      // 更新思维导图数据
      settings.mindMap = mindMapData

      // 保存更新后的设置
      const response = await apiManager.updateNovelSettings(novelId, settings)
      if (response.success) {
        return response.data
      }
      throw new Error(response.message || '保存思维导图失败')
    } catch (error) {
      ElMessage.error(error.message || '保存思维导图失败')
      throw error
    }
  }

  /**
   * 加载思维导图数据
   */
  async loadMindMap(novelId) {
    try {
      const novel = await apiManager.getNovel(novelId)
      const settings = novel.data?.settings || {}
      return settings.mindMap || { nodes: [], edges: [] }
    } catch (error) {
      console.error('加载思维导图失败:', error)
      return { nodes: [], edges: [] }
    }
  }

  /**
   * 创建默认思维导图
   */
  createDefaultMindMap(novelTitle = '新小说') {
    return {
      nodes: [
        {
          id: 'root',
          label: novelTitle,
          type: 'main',
          color: '#409EFF',
          description: '主题'
        },
        {
          id: 'characters',
          label: '人物',
          type: 'branch',
          color: '#67C23A',
          description: '人物设定'
        },
        {
          id: 'worldview',
          label: '世界观',
          type: 'branch',
          color: '#E6A23C',
          description: '世界观设定'
        },
        {
          id: 'plot',
          label: '情节',
          type: 'branch',
          color: '#F56C6C',
          description: '情节大纲'
        }
      ],
      edges: [
        { from: 'root', to: 'characters' },
        { from: 'root', to: 'worldview' },
        { from: 'root', to: 'plot' }
      ]
    }
  }

  /**
   * 验证思维导图数据
   */
  validateMindMapData(data) {
    if (!data || typeof data !== 'object') {
      return false
    }

    if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
      return false
    }

    // 验证节点
    for (const node of data.nodes) {
      if (!node.id || !node.label) {
        return false
      }
    }

    // 验证边
    for (const edge of data.edges) {
      if (!edge.from || !edge.to) {
        return false
      }
    }

    return true
  }

  /**
   * 从文本大纲生成思维导图
   */
  generateFromOutline(outline, rootLabel = '主题') {
    const lines = outline.split('\n').filter(line => line.trim())
    const nodes = []
    const edges = []
    let nodeId = 0

    // 创建根节点
    const rootId = `node_${nodeId++}`
    nodes.push({
      id: rootId,
      label: rootLabel,
      type: 'main',
      color: '#409EFF',
      description: '根节点'
    })

    // 解析大纲
    const stack = [{ id: rootId, level: 0 }]

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      // 计算缩进级别
      const indent = line.search(/\S/)
      const level = Math.floor(indent / 2) + 1

      const label = trimmed.replace(/^[-*•]\s*/, '')
      const nodeIdStr = `node_${nodeId++}`

      // 确定节点类型
      let type = 'branch'
      if (level === 1) type = 'branch'
      else if (level === 2) type = 'leaf'
      else type = 'note'

      nodes.push({
        id: nodeIdStr,
        label,
        type,
        color: type === 'branch' ? '#67C23A' : type === 'leaf' ? '#E6A23C' : '#909399',
        description: label
      })

      // 找到父节点
      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop()
      }

      if (stack.length > 0) {
        edges.push({
          from: stack[stack.length - 1].id,
          to: nodeIdStr
        })
      }

      stack.push({ id: nodeIdStr, level })
    }

    return { nodes, edges }
  }

  /**
   * 导出为Markdown格式
   */
  exportToMarkdown(mindMapData) {
    const { nodes, edges } = mindMapData

    if (!nodes || nodes.length === 0) {
      return '# 空思维导图\n'
    }

    // 构建树结构
    const tree = this.buildTree(nodes, edges)
    
    // 转换为Markdown
    const markdown = this.treeToMarkdown(tree, nodes)
    
    return markdown
  }

  /**
   * 构建树结构
   */
  buildTree(nodes, edges) {
    const tree = {}
    const childrenMap = {}

    // 初始化
    edges.forEach(edge => {
      if (!childrenMap[edge.from]) {
        childrenMap[edge.from] = []
      }
      childrenMap[edge.from].push(edge.to)
    })

    // 找到根节点
    const rootNode = nodes.find(n => n.type === 'main') || nodes[0]
    
    if (!rootNode) return tree

    tree[rootNode.id] = {
      node: rootNode,
      children: childrenMap[rootNode.id] || []
    }

    // 递归构建
    const buildNode = (nodeId) => {
      const children = childrenMap[nodeId] || []
      return children.map(childId => {
        const childNode = nodes.find(n => n.id === childId)
        if (childNode) {
          return {
            node: childNode,
            children: buildNode(childId)
          }
        }
        return null
      }).filter(Boolean)
    }

    tree[rootNode.id].children = buildNode(rootNode.id)

    return tree[rootNode.id]
  }

  /**
   * 树转Markdown
   */
  treeToMarkdown(tree, nodes, level = 0) {
    if (!tree) return ''

    const indent = '  '.repeat(level)
    const prefix = level === 0 ? '# ' : '- '
    let markdown = `${indent}${prefix}${tree.node.label}\n`

    if (tree.node.description && tree.node.description !== tree.node.label) {
      markdown += `${indent}  > ${tree.node.description}\n`
    }

    if (tree.children && tree.children.length > 0) {
      tree.children.forEach(child => {
        markdown += this.treeToMarkdown(child, nodes, level + 1)
      })
    }

    return markdown
  }
}

export default new MindMapService()
