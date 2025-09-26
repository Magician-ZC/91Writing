// 认证服务测试脚本
const { spawn } = require('child_process');

console.log('🔐 测试认证服务启动...\n');

// 设置环境变量
process.env.NODE_ENV = 'development';
process.env.AUTH_SERVICE_PORT = '3002';
process.env.JWT_SECRET = 'test_jwt_secret_91writing_2024';
process.env.JWT_EXPIRES_IN = '7d';

// 启动认证服务
console.log('🚀 启动认证服务...');
const authService = spawn('node', ['dist/apps/auth-service/main.js'], {
  stdio: 'inherit',
  env: process.env
});

authService.on('error', (error) => {
  console.error('❌ 认证服务启动失败:', error);
  process.exit(1);
});

authService.on('close', (code) => {
  console.log(`\n📋 认证服务退出，代码: ${code}`);
});

// 监听中断信号
process.on('SIGINT', () => {
  console.log('\n🛑 收到中断信号，正在关闭认证服务...');
  authService.kill('SIGINT');
  setTimeout(() => process.exit(0), 1000);
});

console.log('💡 认证服务启动中...');
console.log('🌐 预期访问地址: http://localhost:3002');
console.log('📖 API文档地址: http://localhost:3002/api/docs/auth');
console.log('🔍 健康检查: http://localhost:3002/api/v1/auth/health');
console.log('\n🔑 可用的认证接口:');
console.log('  POST /api/v1/auth/register - 用户注册');
console.log('  POST /api/v1/auth/login - 用户登录');
console.log('  POST /api/v1/auth/refresh - 刷新令牌');
console.log('  GET /api/v1/auth/me - 获取当前用户');
console.log('\n按 Ctrl+C 停止服务\n');
