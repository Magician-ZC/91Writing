# 🤝 章节视频生成系统 - 开发者贡献指南

## 欢迎贡献！

感谢您对91Writing章节视频生成系统的关注。本文档将指导您如何为项目做出贡献。

---

## 🎯 贡献方式

### 1. 代码贡献
- 添加新的Provider（API服务商）
- 优化Agent提示词
- 性能优化
- Bug修复
- 新功能开发

### 2. 文档贡献
- 完善现有文档
- 添加使用示例
- 翻译文档
- 制作教程

### 3. 测试贡献
- 编写测试用例
- 报告Bug
- 性能测试
- 用户体验反馈

---

## 🔧 开发环境设置

### 1. 克隆项目
```bash
git clone https://github.com/91writing/91Writing.git
cd 91Writing/91Writing-Backend
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境
```bash
cp .env.example .env
# 编辑.env配置API密钥
```

### 4. 数据库迁移
```bash
npx prisma migrate dev
npx prisma generate
npm run db:seed
```

### 5. 启动开发服务
```bash
npm run start:ai:dev
npm run start:novel:dev
npm run start:admin:dev
```

---

## 📝 代码规范

### TypeScript规范
```typescript
// 1. 使用明确的类型定义
interface VideoConfig {
  sceneCount: number;
  duration: number;
}

// 2. 使用async/await而非Promise链
async function generateVideo(config: VideoConfig) {
  const script = await generateScript();
  const images = await generateImages(script);
  return await generateVideoFromImages(images);
}

// 3. 适当的错误处理
try {
  const result = await someOperation();
} catch (error) {
  this.logger.error(`操作失败: ${error.message}`, error.stack);
  throw new HttpException('操作失败', HttpStatus.INTERNAL_SERVER_ERROR);
}

// 4. 使用依赖注入
@Injectable()
export class MyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
  ) {}
}
```

### Vue组件规范
```vue
<!-- 1. 使用Composition API -->
<script setup>
import { ref, computed, onMounted } from 'vue'

const data = ref([])
const filtered = computed(() => data.value.filter(item => item.active))

onMounted(() => {
  loadData()
})
</script>

<!-- 2. Props验证 -->
<script setup>
const props = defineProps({
  chapterId: {
    type: String,
    required: true
  },
  options: {
    type: Object,
    default: () => ({})
  }
})
</script>

<!-- 3. 事件定义 -->
<script setup>
const emit = defineEmits(['update', 'delete'])

const handleUpdate = () => {
  emit('update', data)
}
</script>
```

### 文件命名
- **Service**: `xxx.service.ts`
- **Controller**: `xxx.controller.ts`
- **DTO**: `xxx.dto.ts`
- **Provider**: `xxx.provider.ts`
- **Vue组件**: `XxxComponent.vue`（大驼峰）
- **Service**: `xxxService.js`（小驼峰）

---

## 🎨 添加新Provider

### 示例：添加新的文生图Provider

#### 1. 创建Provider类
```typescript
// apps/ai-service/src/providers/new-image.provider.ts
import { Injectable, Logger } from '@nestjs/common';
import { ITextToImageProvider, TextToImageRequest, TextToImageResponse } from './visual-generation.interface';

@Injectable()
export class NewImageProvider implements ITextToImageProvider {
  private readonly logger = new Logger(NewImageProvider.name);

  async generateImage(request: TextToImageRequest): Promise<TextToImageResponse> {
    // 实现您的API调用逻辑
    try {
      const response = await this.callExternalAPI(request);
      return {
        success: true,
        images: response.images,
        duration: response.duration,
      };
    } catch (error) {
      this.logger.error(`生成失败: ${error.message}`);
      return {
        success: false,
        images: [],
        error: error.message,
        duration: 0,
      };
    }
  }

  async checkHealth(): Promise<boolean> {
    // 实现健康检查
  }
}
```

#### 2. 注册Provider
```typescript
// apps/ai-service/src/modules/video-generation/video-generation.module.ts
import { NewImageProvider } from '../../providers/new-image.provider';

@Module({
  providers: [
    // ... 其他providers
    NewImageProvider,
  ],
})
export class VideoGenerationModule {}
```

#### 3. 在Service中使用
```typescript
// video-generation.service.ts
constructor(
  // ... 其他依赖
  private readonly newImageProvider: NewImageProvider,
) {
  // 根据配置选择Provider
  this.imageProvider = process.env.IMAGE_PROVIDER === 'new' 
    ? this.newImageProvider 
    : this.volcengineProvider;
}
```

#### 4. 添加环境配置
```env
# .env
IMAGE_PROVIDER=new
NEW_IMAGE_API_KEY=xxx
NEW_IMAGE_API_URL=https://api.example.com
```

#### 5. 更新文档
在`VIDEO-GENERATION-SETUP.md`中添加新Provider的说明

---

## 🤖 优化Agent配置

### 1. 通过管理后台优化
1. 登录管理后台 `/admin/agent-config`
2. 选择要优化的Agent类型
3. 编辑系统提示词和模板提示词
4. 使用测试工具验证效果
5. 保存并启用新配置

### 2. 通过代码优化
```typescript
// 在seed.ts中添加新版本配置
{
  agentType: 'IMAGE_OPTIMIZER',
  name: '文生图优化器 v2',
  systemPrompt: `优化后的系统提示词...`,
  templatePrompt: `优化后的模板...`,
  version: 2,
  isActive: true,
}
```

### 3. A/B测试
```typescript
// 测试不同版本的效果
const v1Result = await testAgent(v1Config, testData);
const v2Result = await testAgent(v2Config, testData);

// 对比质量
compareQuality(v1Result, v2Result);

// 选择更好的版本
activateVersion(betterVersion);
```

---

## 🧪 测试指南

### 1. 单元测试
```typescript
// xxx.service.spec.ts
describe('VideoGenerationService', () => {
  let service: VideoGenerationService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [VideoGenerationService],
    }).compile();

    service = module.get<VideoGenerationService>(VideoGenerationService);
  });

  it('should generate video', async () => {
    const result = await service.generateChapterVideo(userId, dto);
    expect(result).toBeDefined();
    expect(result.status).toBe('GENERATING');
  });
});
```

### 2. 集成测试
```typescript
// 测试完整流程
describe('Video Generation Flow', () => {
  it('should complete full generation process', async () => {
    const result = await testFullFlow(chapterId);
    expect(result.videoUrl).toBeDefined();
    expect(result.metadata.sceneCount).toBe(5);
  });
});
```

### 3. 性能测试
```bash
# 使用Artillery进行负载测试
artillery run test/video-generation-load.yml
```

---

## 📦 提交Pull Request

### 1. 创建分支
```bash
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/bug-description
```

### 2. 编写代码
- 遵循代码规范
- 添加必要的注释
- 编写测试用例

### 3. 提交代码
```bash
git add .
git commit -m "feat: 添加新功能描述"
# 提交信息格式：
# feat: 新功能
# fix: Bug修复
# docs: 文档更新
# style: 代码格式
# refactor: 重构
# test: 测试
# chore: 构建/工具
```

### 4. 推送并创建PR
```bash
git push origin feature/your-feature-name
# 然后在GitHub上创建Pull Request
```

### 5. PR描述模板
```markdown
## 变更类型
- [ ] 新功能
- [ ] Bug修复
- [ ] 性能优化
- [ ] 文档更新

## 变更说明
简要描述您的变更...

## 测试
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] 手动测试完成

## 截图/Demo
（如果是UI变更，请添加截图）

## 相关Issue
Closes #xxx
```

---

## 🐛 Bug报告模板

### 标题
`[Bug] 简短描述问题`

### 内容
```markdown
## 问题描述
清晰描述遇到的问题...

## 复现步骤
1. 进入xxx页面
2. 点击xxx按钮
3. 输入xxx
4. 看到错误

## 预期行为
应该...

## 实际行为
实际上...

## 环境信息
- 操作系统: macOS 12
- 浏览器: Chrome 120
- 版本: v1.6.0
- 套餐: 专业版

## 截图
（如果可能，请添加截图）

## 日志
```
粘贴相关日志...
```

## 补充信息
其他可能有用的信息...
```

---

## 💡 功能建议模板

### 标题
`[Feature] 功能名称`

### 内容
```markdown
## 功能描述
描述您希望添加的功能...

## 使用场景
什么情况下需要这个功能？
1. 场景1...
2. 场景2...

## 期望效果
希望达到什么效果？

## 参考案例
（如果有类似功能的参考）

## 优先级
- [ ] 高（紧急需要）
- [ ] 中（有需要）
- [ ] 低（可以等待）
```

---

## 📚 开发资源

### 官方文档
- [NestJS文档](https://docs.nestjs.com/)
- [Prisma文档](https://www.prisma.io/docs)
- [Vue 3文档](https://vuejs.org/)
- [Element Plus文档](https://element-plus.org/)

### API文档
- [火山引擎](https://www.volcengine.com/docs/visual)
- [即梦](https://www.jimeng.ai/developers)
- [可灵](https://docs.kuaishou.com/kling)

### 工具文档
- [FFmpeg](https://ffmpeg.org/documentation.html)
- [Bull](https://docs.bullmq.io/)
- [Axios](https://axios-http.com/)

### 项目文档
- [架构设计](VIDEO-GENERATION-SUMMARY.md)
- [API文档](VIDEO-GENERATION-SETUP.md)
- [优化指南](VIDEO-GENERATION-OPTIMIZATION.md)

---

## 🎓 学习路径

### 初级贡献者
1. 阅读 [用户手册](VIDEO-GENERATION-USER-GUIDE.md)
2. 了解 [系统架构](VIDEO-GENERATION-SUMMARY.md)
3. 修复简单Bug或更新文档

### 中级贡献者
1. 深入理解 [核心服务代码](91Writing-Backend/VIDEO-GENERATION-README.md)
2. 优化Agent提示词
3. 添加新功能或Provider

### 高级贡献者
1. 架构优化
2. 性能调优
3. 新模块开发
4. 技术选型

---

## 🏆 贡献者福利

### 贡献奖励
- 🌟 **代码贡献**: GitHub个人页展示
- 🎁 **功能采纳**: 免费企业版3个月
- 📝 **文档贡献**: 免费专业版1个月
- 🐛 **Bug修复**: 视频生成配额奖励

### 荣誉榜
优秀贡献者将被列入：
- 项目README贡献者名单
- 官网感谢页面
- 社区荣誉榜

---

## 📞 联系我们

### 开发者社区
- **Discord**: https://discord.gg/91writing
- **GitHub Discussions**: https://github.com/91writing/discussions
- **技术论坛**: https://community.91writing.com/dev

### 技术沟通
- **邮件**: dev@91writing.com
- **微信群**: 扫码加入开发者群
- **定期会议**: 每月第一个周五

---

## 📜 许可证

本项目采用 MIT 许可证。

---

**维护者**: 91Writing Dev Team  
**最后更新**: 2025年1月20日  
**版本**: v1.0

