/**
 * 用户引导配置
 */

// 欢迎引导步骤
export const onboardingSteps = {
  // 欢迎引导
  welcome: [
    {
      target: '.logo',
      title: '欢迎来到 91写作！',
      content: '这是一个专业的AI小说创作平台，让我们快速了解核心功能。',
      placement: 'bottom'
    },
    {
      target: '.nav-novels',
      title: '小说管理',
      content: '在这里创建和管理你的小说项目。',
      placement: 'right'
    },
    {
      target: '.nav-writer',
      title: '写作编辑器',
      content: '强大的写作编辑器，支持AI辅助创作。',
      placement: 'right'
    },
    {
      target: '.nav-tools',
      title: '写作工具',
      content: '10+专业写作工具，助力你的创作。',
      placement: 'right'
    },
    {
      target: '.api-config-btn',
      title: 'API配置',
      content: '配置你的AI服务，开启智能创作之旅。',
      placement: 'bottom'
    }
  ],

  // 小说创建引导
  novelCreation: [
    {
      target: '.create-novel-btn',
      title: '创建你的第一部小说',
      content: '点击这里开始创建你的小说项目。',
      placement: 'bottom'
    },
    {
      target: '.novel-type-select',
      title: '选择小说类型',
      content: '选择适合你的小说类型，系统会提供对应的模板和提示词。',
      placement: 'top'
    },
    {
      target: '.novel-info-form',
      title: '填写小说信息',
      content: '输入小说标题、简介等基本信息。AI可以帮你生成简介哦！',
      placement: 'left'
    }
  ],

  // 编辑器引导
  editor: [
    {
      target: '.chapter-list',
      title: '章节列表',
      content: '在这里管理所有章节，点击章节开始编辑。',
      placement: 'right'
    },
    {
      target: '.editor-toolbar',
      title: '编辑器工具栏',
      content: '丰富的编辑工具，包括格式化、AI辅助等功能。',
      placement: 'bottom'
    },
    {
      target: '.ai-write-btn',
      title: 'AI续写',
      content: 'AI可以帮你续写内容，只需设定方向和字数。',
      placement: 'bottom'
    },
    {
      target: '.ai-polish-btn',
      title: 'AI润色',
      content: '选中文本后，AI可以帮你优化表达、提升质量。',
      placement: 'bottom'
    },
    {
      target: '.character-panel',
      title: '角色管理',
      content: '管理你的角色设定，AI可以批量生成角色。',
      placement: 'left'
    },
    {
      target: '.worldview-panel',
      title: '世界观设定',
      content: '构建完整的世界观，AI可以生成宏大的世界设定。',
      placement: 'left'
    }
  ],

  // AI功能引导
  aiFeature: [
    {
      target: '.multi-version-btn',
      title: '多版本对比 (新功能)',
      content: 'AI可以生成多个版本供你选择，找到最满意的内容。',
      placement: 'bottom'
    },
    {
      target: '.consistency-check-btn',
      title: '一致性检测 (新功能)',
      content: '智能检测世界观和角色的一致性，避免逻辑错误。',
      placement: 'bottom'
    },
    {
      target: '.character-network-btn',
      title: '角色关系图 (新功能)',
      content: '可视化展示角色之间的关系网络。',
      placement: 'bottom'
    }
  ]
}

// 功能提示配置
export const featureTooltips = {
  'character-network': {
    title: '角色关系网络图',
    content: '可视化展示角色之间的关系，帮助你理清角色关系。支持7种关系类型，可以设置关系强度。',
    videoUrl: null,
    links: [
      { label: '如何创建关系？', action: 'show-create-guide' },
      { label: '查看示例', action: 'show-example' }
    ]
  },
  'consistency-check': {
    title: '一致性检测',
    content: 'AI检测世界观、角色、时间线的一致性，避免逻辑错误。支持规则检测和AI深度分析两种模式。',
    videoUrl: null,
    links: [
      { label: '如何使用？', action: 'show-usage-guide' },
      { label: '检测规则说明', action: 'show-rules' }
    ]
  },
  'multi-version': {
    title: '多版本对比',
    content: 'AI生成多个版本供对比选择，提升内容质量。可以生成2-5个版本，支持不同风格。',
    videoUrl: null,
    links: [
      { label: '如何选择版本？', action: 'show-selection-guide' },
      { label: '风格说明', action: 'show-styles' }
    ]
  },
  'ai-writing': {
    title: 'AI续写',
    content: '根据上文内容智能续写，保持风格一致。可以设定续写方向和字数要求。',
    videoUrl: 'https://www.bilibili.com/video/BV1keKgzaER2',
    links: [
      { label: '续写技巧', action: 'show-tips' },
      { label: '常见问题', action: 'show-faq' }
    ]
  },
  'ai-polish': {
    title: 'AI润色',
    content: '优化文字表达，提升内容质量。支持多种润色类型：语法、文风、情感、逻辑等。',
    videoUrl: null,
    links: [
      { label: '润色类型说明', action: 'show-polish-types' },
      { label: '使用示例', action: 'show-examples' }
    ]
  },
  'book-analysis': {
    title: '拆书分析',
    content: '上传小说文件，AI深度分析写作技法。支持5种分析维度：综合、结构、人物、语言、情节。',
    videoUrl: null,
    links: [
      { label: '如何上传？', action: 'show-upload-guide' },
      { label: '分析说明', action: 'show-analysis' }
    ]
  },
  'writing-tools': {
    title: '写作工具库',
    content: '10+专业写作工具：细纲生成、角色生成、脑洞生成、爆款书名等。',
    videoUrl: null,
    links: [
      { label: '工具列表', action: 'show-tools' },
      { label: '使用技巧', action: 'show-tool-tips' }
    ]
  }
}

// 新功能配置（用于显示"新"徽章）
export const newFeatures = [
  {
    id: 'character-network',
    name: '角色关系网络图',
    introducedDate: '2025-10-21',
    category: 'advanced'
  },
  {
    id: 'multi-version',
    name: '多版本对比',
    introducedDate: '2025-10-21',
    category: 'ai'
  },
  {
    id: 'consistency-check',
    name: '一致性检测',
    introducedDate: '2025-10-21',
    category: 'advanced'
  },
  {
    id: 'character-statistics',
    name: '角色统计分析',
    introducedDate: '2025-10-21',
    category: 'advanced'
  }
]

// 页面帮助配置
export const pageHelpConfigs = {
  dashboard: {
    title: '仪表盘',
    description: '查看你的创作概览、写作目标和统计数据',
    links: [
      { id: 1, label: '如何设置写作目标？', icon: 'Target' },
      { id: 2, label: '如何查看统计？', icon: 'DataAnalysis' }
    ]
  },
  novels: {
    title: '小说管理',
    description: '创建和管理你的所有小说项目',
    links: [
      { id: 1, label: '如何创建小说？', icon: 'Document' },
      { id: 2, label: '如何导入导出？', icon: 'Download' },
      { id: 3, label: '小说状态说明', icon: 'InfoFilled' }
    ],
    videoUrl: 'https://www.bilibili.com/video/BV1AYKgzAEne'
  },
  writer: {
    title: '写作编辑器',
    description: '强大的写作环境，支持AI辅助创作',
    links: [
      { id: 1, label: '编辑器快捷键', icon: 'Keyboard' },
      { id: 2, label: 'AI功能说明', icon: 'MagicStick' },
      { id: 3, label: '章节管理', icon: 'Files' }
    ],
    videoUrl: 'https://www.bilibili.com/video/BV1keKgzaER2'
  },
  tools: {
    title: '写作工具库',
    description: '10+专业写作工具，辅助你的创作',
    links: [
      { id: 1, label: '工具使用教程', icon: 'Reading' },
      { id: 2, label: '推荐工具', icon: 'Star' }
    ]
  },
  analysis: {
    title: '拆书分析',
    description: '学习优秀作品的写作技巧',
    links: [
      { id: 1, label: '如何上传文件？', icon: 'Upload' },
      { id: 2, label: '分析结果说明', icon: 'DataAnalysis' }
    ]
  }
}

