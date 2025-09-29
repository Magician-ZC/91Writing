import { PrismaClient, PackageStatus, UserStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始数据库种子数据初始化...');

  // 1. 创建系统配置
  await createSystemConfigs();

  // 2. 创建套餐配置
  await createPackages();

  // 3. 创建系统默认提示词
  await createSystemPrompts();

  // 4. 创建测试用户 (仅在开发环境)
  if (process.env.NODE_ENV === 'development') {
    await createTestUser();
    await createAdminUser();
  }

  console.log('🎉 数据库种子数据初始化完成!');
}

async function createSystemConfigs() {
  console.log('📝 创建系统配置...');

  const configs = [
    {
      configKey: 'site_name',
      configValue: { value: '91Writing' },
      description: '网站名称',
    },
    {
      configKey: 'site_description',
      configValue: { value: '91Writing - 专业的AI写作平台' },
      description: '网站描述',
    },
    {
      configKey: 'default_ai_model',
      configValue: { value: 'gpt-3.5-turbo' },
      description: '默认AI模型',
    },
    {
      configKey: 'max_novel_count',
      configValue: { 
        free: 3,
        basic: 10,
        premium: 50,
        unlimited: -1
      },
      description: '用户最大小说数量限制',
    },
    {
      configKey: 'ai_call_limits',
      configValue: {
        free: 100,
        basic: 1000,
        premium: 5000,
        unlimited: -1
      },
      description: 'AI调用次数限制',
    },
    {
      configKey: 'feature_flags',
      configValue: {
        enable_registration: true,
        enable_ai_writing: true,
        enable_memory_system: true,
        enable_material_system: true,
        maintenance_mode: false
      },
      description: '功能开关配置',
    },
  ];

  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { configKey: config.configKey },
      update: {
        configValue: config.configValue,
        description: config.description,
      },
      create: config,
    });
  }

  console.log(`✅ 创建了 ${configs.length} 个系统配置`);
}

async function createPackages() {
  console.log('💎 创建套餐配置...');

  const packages = [
    {
      name: '基础版',
      description: '适合个人创作者的基础功能',
      price: 0,
      durationDays: 30,
      features: {
        aiCalls: 100,
        novels: 3,
        chapters: 50,
        memory: true,
        assistant: 'basic',
        materials: 100,
        prompts: 50,
        analysis: false,
        export: 'txt',
        priority: 'low'
      },
      sortOrder: 1,
      status: PackageStatus.ACTIVE,
    },
    {
      name: '专业版',
      description: '专业作家的完整创作工具包',
      price: 29.9,
      durationDays: 30,
      features: {
        aiCalls: 1000,
        novels: 10,
        chapters: 200,
        memory: true,
        assistant: 'advanced',
        materials: 500,
        prompts: 200,
        analysis: true,
        export: 'all',
        priority: 'medium',
        mindmap: true,
        collaboration: false
      },
      sortOrder: 2,
      status: PackageStatus.ACTIVE,
    },
    {
      name: '创作家版',
      description: '顶级创作者的无限创作空间',
      price: 99.9,
      durationDays: 30,
      features: {
        aiCalls: -1,
        novels: -1,
        chapters: -1,
        memory: true,
        assistant: 'premium',
        materials: -1,
        prompts: -1,
        analysis: true,
        export: 'all',
        priority: 'high',
        mindmap: true,
        collaboration: true,
        customAI: true,
        api: true
      },
      sortOrder: 3,
      status: PackageStatus.ACTIVE,
    },
  ];

  for (const pkg of packages) {
    await prisma.package.upsert({
      where: { name: pkg.name },
      update: {
        description: pkg.description,
        price: pkg.price,
        durationDays: pkg.durationDays,
        features: pkg.features,
        sortOrder: pkg.sortOrder,
        status: pkg.status,
      },
      create: pkg,
    });
  }

  console.log(`✅ 创建了 ${packages.length} 个套餐配置`);
}

async function createSystemPrompts() {
  console.log('🤖 创建系统默认提示词...');

  const systemPrompts = [
    {
      title: '小说续写通用模板',
      content: `扮演一位专业的小说作家，请基于以下信息继续创作小说内容：

背景设定：{worldSetting}
人物信息：{characters} 
当前情节：{currentPlot}
写作要求：{requirements}

请继续创作约500字的内容，保持：
1. 人物性格一致
2. 情节逻辑合理  
3. 文风统一
4. 节奏适中

创作内容：`,
      category: '小说创作',
      tags: ['续写', '通用', '小说'],
      isPublic: true,
      usageCount: 0,
      rating: 4.5,
    },
    {
      title: '角色对话生成',
      content: `请为以下场景生成真实自然的人物对话：

场景描述：{scene}
参与角色：{characters}
对话目的：{purpose}
情感氛围：{mood}

生成要求：
1. 符合角色性格特征
2. 推进剧情发展
3. 语言生动自然
4. 包含适当的动作描写

对话内容：`,
      category: '对话创作',
      tags: ['对话', '角色', '场景'],
      isPublic: true,
      usageCount: 0,
      rating: 4.3,
    },
    {
      title: '环境场景描写',
      content: `请详细描写以下环境场景：

场景类型：{sceneType}
时间背景：{timeBackground}
氛围要求：{atmosphere}
重要元素：{keyElements}

描写要求：
1. 运用五感描写
2. 营造恰当氛围
3. 突出重要细节
4. 为情节服务

场景描写：`,
      category: '场景描写',
      tags: ['环境', '场景', '描写'],
      isPublic: true,
      usageCount: 0,
      rating: 4.2,
    },
    {
      title: '情节分析与建议',
      content: `请分析以下情节并提供改进建议：

现有情节：{currentPlot}
目标效果：{targetEffect}
读者反馈：{readerFeedback}

分析维度：
1. 逻辑合理性
2. 冲突张力
3. 节奏控制
4. 情感共鸣

分析结果与建议：`,
      category: '情节分析',
      tags: ['分析', '情节', '建议'],
      isPublic: true,
      usageCount: 0,
      rating: 4.4,
    },
    {
      title: '文章润色优化',
      content: `请对以下文本进行润色优化：

原文内容：{originalText}
优化方向：{optimizeDirection}
目标读者：{targetAudience}

润色要求：
1. 提升语言表达
2. 增强文字感染力
3. 保持原意不变
4. 符合文体特征

优化后内容：`,
      category: '文本优化',
      tags: ['润色', '优化', '语言'],
      isPublic: true,
      usageCount: 0,
      rating: 4.1,
    },
  ];

  for (const prompt of systemPrompts) {
    // 先尝试查找现有的系统提示词
    const existingPrompt = await prisma.prompt.findFirst({
      where: { 
        title: prompt.title,
        userId: null,
      },
    });

    if (existingPrompt) {
      // 更新现有提示词
      await prisma.prompt.update({
        where: { id: existingPrompt.id },
        data: {
          content: prompt.content,
          category: prompt.category,
          tags: prompt.tags,
          isPublic: prompt.isPublic,
          rating: prompt.rating,
        },
      });
    } else {
      // 创建新提示词
      await prisma.prompt.create({
        data: {
          ...prompt,
          userId: null, // 系统提示词
        },
      });
    }
  }

  console.log(`✅ 创建了 ${systemPrompts.length} 个系统提示词`);
}

async function createTestUser() {
  console.log('👤 创建测试用户...');

  const testUser = {
    email: 'test@91writing.com',
    username: 'testuser',
    passwordHash: await bcrypt.hash('password123', 10),
    status: UserStatus.ACTIVE,
    emailVerified: true,
    inviteCode: 'TEST01',
    profile: {
      create: {
        nickname: '测试用户',
        bio: '这是一个测试用户账号',
        preferences: {
          theme: 'light',
          language: 'zh-CN',
          autoSave: true,
          fontSize: 14,
        },
        writingStats: {
          totalWords: 0,
          todayWords: 0,
          weekWords: 0,
          monthWords: 0,
          writingDays: 0,
        },
      },
    },
  };

  const user = await prisma.user.upsert({
    where: { email: testUser.email },
    update: {},
    create: testUser,
  });

  // 为测试用户创建基础版订阅
  const basicPackage = await prisma.package.findFirst({
    where: { name: '基础版' },
  });

  if (basicPackage) {
    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        packageId: basicPackage.id,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
        autoRenew: false,
      },
    });
  }

  console.log('✅ 创建测试用户成功');
  console.log('📧 邮箱: test@91writing.com');
  console.log('🔑 密码: password123');
}

async function createAdminUser() {
  console.log('👑 创建管理员用户...');

  const adminUser = {
    email: 'admin@91writing.com',
    username: 'admin',
    passwordHash: await bcrypt.hash('admin123456', 10),
    role: UserRole.ADMIN, // 设置为管理员角色
    status: UserStatus.ACTIVE,
    emailVerified: true,
    inviteCode: 'ADMIN01',
    profile: {
      create: {
        nickname: '系统管理员',
        bio: '91Writing系统管理员账号',
        preferences: {
          theme: 'light',
          language: 'zh-CN',
          autoSave: true,
          fontSize: 14,
        },
        writingStats: {
          totalWords: 0,
          todayWords: 0,
          weekWords: 0,
          monthWords: 0,
          writingDays: 0,
        },
      },
    },
  };

  const admin = await prisma.user.upsert({
    where: { email: adminUser.email },
    update: {
      role: UserRole.ADMIN, // 确保更新时也设置为管理员
      status: UserStatus.ACTIVE,
    },
    create: adminUser,
  });

  // 为管理员创建创作家版订阅（最高级别）
  const premiumPackage = await prisma.package.findFirst({
    where: { name: '创作家版' },
  });

  if (premiumPackage) {
    await prisma.subscription.upsert({
      where: { userId: admin.id },
      update: {},
      create: {
        userId: admin.id,
        packageId: premiumPackage.id,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 365天后
        autoRenew: false,
      },
    });
  }

  console.log('✅ 创建管理员用户成功');
  console.log('📧 邮箱: admin@91writing.com');
  console.log('🔑 密码: admin123456');
  console.log('👑 角色: 系统管理员');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ 种子数据初始化失败:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
