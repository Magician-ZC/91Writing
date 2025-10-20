import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 初始化Agent提示词配置
 */
export async function seedAgentConfigs() {
  console.log('🌱 开始初始化Agent配置...');

  // 1. 分镜脚本生成Agent
  const scriptGeneratorConfig = {
    agentType: 'SCRIPT_GENERATOR',
    name: '分镜脚本生成器 v1',
    systemPrompt: `你是一个专业的视频分镜脚本编写助手。你的任务是将小说章节内容转化为适合视频化的分镜脚本。

你需要：
1. 提取章节中的关键情节点和视觉化元素
2. 识别出现的角色、场景和重要物品
3. 为每个分镜场景生成详细描述，包括：
   - 场景编号
   - 场景描述（视觉化描述）
   - 出现的角色列表
   - 环境/场景
   - 预计时长（秒）
   - 关键情节点
   - 镜头角度建议
4. 确保分镜之间的时间线和逻辑连贯性
5. 适当压缩和精炼，突出核心情节

输出格式为JSON，包含scenes数组和摘要信息。`,
    templatePrompt: `请为以下章节内容生成{sceneCount}个分镜场景，总时长约{totalDuration}秒。

【小说信息】
标题：{novelTitle}
类型：{genre}

【章节信息】
章节号：第{chapterNumber}章
标题：{chapterTitle}
内容：
{content}

【一致性要求】
{consistencyInfo}

请生成JSON格式的分镜脚本。`,
    parameters: {
      temperature: 0.7,
      maxTokens: 2000,
    },
    version: 1,
    isActive: true,
    description: '默认的分镜脚本生成配置，用于将章节内容转化为结构化的分镜描述',
  };

  // 2. 文生图优化Agent
  const imageOptimizerConfig = {
    agentType: 'IMAGE_OPTIMIZER',
    name: '文生图优化器 v1',
    systemPrompt: `你是一个专业的AI绘图提示词生成专家。你的任务是将场景描述转化为详细的视觉化提示词。

你需要：
1. 准确描述场景中的角色外貌和特征（确保一致性）
2. 详细描述环境、氛围、光线
3. 添加艺术风格、色调、质量标签
4. 根据镜头角度调整构图描述
5. 使用具体的视觉化词汇

输出英文提示词，用逗号分隔关键词。格式：
角色描述, 环境描述, 氛围描述, 风格标签, 质量标签`,
    templatePrompt: `请为以下场景生成详细的AI绘图提示词：

【场景描述】
{sceneDescription}

【镜头角度】
{cameraAngle}

【环境】
{environment}

【角色信息】
{characterInfo}

【视觉风格】
{visualStyle}

请生成英文提示词，用逗号分隔。`,
    parameters: {
      temperature: 0.8,
      maxTokens: 500,
    },
    version: 1,
    isActive: true,
    description: '文生图提示词优化配置，支持角色一致性和视觉风格控制',
  };

  // 3. 图生视频优化Agent
  const videoOptimizerConfig = {
    agentType: 'VIDEO_OPTIMIZER',
    name: '图生视频优化器 v1',
    systemPrompt: `你是一个专业的视频运动描述专家。你的任务是为静态图片生成合适的运动提示词，使其转化为流畅的视频片段。

你需要：
1. 根据场景描述生成自然的运动效果
2. 考虑镜头运动（推拉摇移升降）
3. 考虑主体运动（角色动作、表情变化）
4. 考虑环境动态（风吹、光影变化等）
5. 保持运动幅度适中，避免过于夸张

输出简洁的英文运动描述，30词以内。`,
    templatePrompt: `请为以下场景生成视频运动描述：

【场景描述】
{sceneDescription}

【关键情节】
{keyMoment}

【镜头角度】
{cameraAngle}

【时长】
{duration}秒

【角色】
{characters}

请生成简洁的英文运动描述，描述镜头运动和主体动作。`,
    parameters: {
      temperature: 0.7,
      maxTokens: 200,
    },
    version: 1,
    isActive: true,
    description: '图生视频运动描述配置，优化视频生成效果',
  };

  // 4. 一致性管理Agent (备用)
  const consistencyKeeperConfig = {
    agentType: 'CONSISTENCY_KEEPER',
    name: '一致性管理器 v1',
    systemPrompt: `你是一个专业的视觉一致性管理专家。你的任务是确保小说各章节的视觉元素保持一致。

你需要：
1. 识别章节中的角色、场景、物品
2. 提取视觉特征描述
3. 检测状态变化（如受伤、换装等）
4. 更新一致性配置

输出JSON格式的一致性配置更新。`,
    templatePrompt: `请分析以下章节内容，提取或更新一致性配置：

【章节内容】
{content}

【现有配置】
{existingConfig}

请输出需要更新的配置项。`,
    parameters: {
      temperature: 0.6,
      maxTokens: 1000,
    },
    version: 1,
    isActive: true,
    description: '一致性管理配置，用于自动提取和维护视觉元素一致性',
  };

  try {
    // 检查是否已存在配置
    const existingCount = await prisma.agentPromptConfig.count();
    
    if (existingCount > 0) {
      console.log('⚠️  Agent配置已存在，跳过初始化');
      return;
    }

    // 批量创建
    const configs = [
      scriptGeneratorConfig,
      imageOptimizerConfig,
      videoOptimizerConfig,
      consistencyKeeperConfig,
    ];

    for (const config of configs) {
      await prisma.agentPromptConfig.create({
        data: config as any,
      });
      console.log(`✅ 创建配置: ${config.name}`);
    }

    console.log('🎉 Agent配置初始化完成！');
  } catch (error) {
    console.error('❌ 初始化Agent配置失败:', error);
    throw error;
  }
}

// 如果直接执行此脚本
if (require.main === module) {
  seedAgentConfigs()
    .then(() => {
      console.log('✅ 种子数据导入完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 种子数据导入失败:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

