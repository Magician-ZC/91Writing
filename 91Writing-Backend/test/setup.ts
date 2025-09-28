import { config } from 'dotenv';

// 加载测试环境变量
config({ path: '.env.test' });

// 设置测试环境
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'mysql://root:root123@localhost:3306/writing_platform_test';

// 全局测试超时设置
jest.setTimeout(30000);

// 测试数据库清理函数
global.cleanupDatabase = async (prisma: any) => {
  // 按依赖关系顺序清理数据
  await prisma.novelMemory.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.novel.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();
};

// Mock 认证中间件
global.mockAuthGuard = {
  canActivate: jest.fn(() => true),
};

// Mock JWT策略
global.mockJwtStrategy = {
  validate: jest.fn((payload) => ({ id: 'test-user-id', ...payload })),
};

// 控制台日志抑制（测试时减少噪音）
if (process.env.SUPPRESS_LOGS === 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}
