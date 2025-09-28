const http = require('http');
const { performance } = require('perf_hooks');

// 简单的性能测试脚本
class QuickPerformanceTest {
  constructor(options = {}) {
    this.host = options.host || 'localhost';
    this.port = options.port || 3003;
    this.concurrent = options.concurrent || 10;
    this.duration = options.duration || 30; // 秒
    this.results = {
      requests: 0,
      responses: 0,
      errors: 0,
      timeouts: 0,
      responseTimes: [],
      startTime: 0,
      endTime: 0,
    };
  }

  async makeRequest(path = '/novels', method = 'GET', data = null) {
    return new Promise((resolve) => {
      const startTime = performance.now();
      
      const options = {
        hostname: this.host,
        port: this.port,
        path,
        method,
        headers: {
          'Authorization': 'Bearer mock-jwt-token',
          'Content-Type': 'application/json',
          'User-Agent': 'QuickTest/1.0'
        },
        timeout: 5000, // 5秒超时
      };

      const req = http.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          const endTime = performance.now();
          const responseTime = endTime - startTime;
          
          this.results.responses++;
          this.results.responseTimes.push(responseTime);
          
          resolve({
            statusCode: res.statusCode,
            responseTime,
            success: res.statusCode >= 200 && res.statusCode < 400,
            data: responseData,
          });
        });
      });

      req.on('error', (err) => {
        this.results.errors++;
        resolve({
          statusCode: 0,
          responseTime: performance.now() - startTime,
          success: false,
          error: err.message,
        });
      });

      req.on('timeout', () => {
        this.results.timeouts++;
        req.destroy();
        resolve({
          statusCode: 0,
          responseTime: 5000,
          success: false,
          error: 'Request timeout',
        });
      });

      this.results.requests++;

      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  async runTest() {
    console.log(`🚀 开始性能测试...`);
    console.log(`📊 配置: ${this.concurrent} 并发, ${this.duration} 秒`);
    console.log(`🎯 目标: http://${this.host}:${this.port}`);
    console.log('');

    this.results.startTime = performance.now();
    const endTime = this.results.startTime + (this.duration * 1000);
    const workers = [];

    // 启动并发worker
    for (let i = 0; i < this.concurrent; i++) {
      workers.push(this.runWorker(endTime, i));
    }

    // 等待所有worker完成
    await Promise.all(workers);
    
    this.results.endTime = performance.now();
    this.generateReport();
  }

  async runWorker(endTime, workerId) {
    const testScenarios = [
      // 读取小说列表
      () => this.makeRequest('/novels?page=1&limit=10'),
      
      // 创建小说
      () => this.makeRequest('/novels', 'POST', {
        title: `性能测试小说-${workerId}-${Date.now()}`,
        description: '这是一个性能测试创建的小说',
        genre: '奇幻',
        status: 'DRAFT',
      }),
      
      // 读取小说详情 (模拟)
      () => this.makeRequest('/novels/test-novel-id').catch(() => ({})),
      
      // 筛选查询
      () => this.makeRequest('/novels?status=DRAFT&genre=奇幻'),
    ];

    while (performance.now() < endTime) {
      // 随机选择测试场景
      const scenario = testScenarios[Math.floor(Math.random() * testScenarios.length)];
      await scenario();
      
      // 短暂间隔
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
    }
  }

  generateReport() {
    const totalTime = (this.results.endTime - this.results.startTime) / 1000;
    const rps = this.results.responses / totalTime;
    const successRate = ((this.results.responses - this.results.errors - this.results.timeouts) / this.results.responses * 100);

    // 响应时间统计
    const sortedTimes = this.results.responseTimes.sort((a, b) => a - b);
    const mean = sortedTimes.reduce((a, b) => a + b, 0) / sortedTimes.length;
    const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)];
    const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
    const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];
    const max = Math.max(...sortedTimes);
    const min = Math.min(...sortedTimes);

    console.log('');
    console.log('📈 性能测试结果报告');
    console.log('='.repeat(50));
    console.log(`⏱️  测试时长: ${totalTime.toFixed(2)} 秒`);
    console.log(`📤 发送请求: ${this.results.requests} 个`);
    console.log(`📥 接收响应: ${this.results.responses} 个`);
    console.log(`❌ 错误请求: ${this.results.errors} 个`);
    console.log(`⏰ 超时请求: ${this.results.timeouts} 个`);
    console.log(`✅ 成功率: ${successRate.toFixed(2)}%`);
    console.log(`🚄 RPS (每秒请求): ${rps.toFixed(2)}`);
    console.log('');
    console.log('📊 响应时间统计 (毫秒):');
    console.log(`   最小值: ${min.toFixed(2)} ms`);
    console.log(`   平均值: ${mean.toFixed(2)} ms`);
    console.log(`   中位数: ${p50.toFixed(2)} ms`);
    console.log(`   95分位: ${p95.toFixed(2)} ms`);
    console.log(`   99分位: ${p99.toFixed(2)} ms`);
    console.log(`   最大值: ${max.toFixed(2)} ms`);
    console.log('');

    // 性能评估
    console.log('🎯 性能评估:');
    if (mean < 200) {
      console.log('   响应时间: ✅ 优秀 (< 200ms)');
    } else if (mean < 500) {
      console.log('   响应时间: ⚠️  良好 (200-500ms)');
    } else if (mean < 1000) {
      console.log('   响应时间: ⚠️  可接受 (500ms-1s)');
    } else {
      console.log('   响应时间: ❌ 需要优化 (> 1s)');
    }

    if (successRate > 99) {
      console.log('   成功率: ✅ 优秀 (> 99%)');
    } else if (successRate > 95) {
      console.log('   成功率: ⚠️  良好 (95-99%)');
    } else if (successRate > 90) {
      console.log('   成功率: ⚠️  可接受 (90-95%)');
    } else {
      console.log('   成功率: ❌ 需要改进 (< 90%)');
    }

    if (rps > 100) {
      console.log('   吞吐量: ✅ 优秀 (> 100 RPS)');
    } else if (rps > 50) {
      console.log('   吞吐量: ⚠️  良好 (50-100 RPS)');
    } else if (rps > 20) {
      console.log('   吞吐量: ⚠️  可接受 (20-50 RPS)');
    } else {
      console.log('   吞吐量: ❌ 需要优化 (< 20 RPS)');
    }

    console.log('');
    console.log('🔧 建议:');
    if (mean > 500) {
      console.log('   - 考虑添加数据库索引优化查询性能');
      console.log('   - 实现Redis缓存减少数据库访问');
      console.log('   - 优化SQL查询，避免N+1问题');
    }
    if (successRate < 95) {
      console.log('   - 检查错误处理机制');
      console.log('   - 增加服务稳定性监控');
      console.log('   - 考虑实现请求重试机制');
    }
    if (rps < 50) {
      console.log('   - 考虑启用HTTP Keep-Alive');
      console.log('   - 优化应用程序池配置');
      console.log('   - 考虑使用负载均衡');
    }
  }
}

// 运行测试
async function runQuickTest() {
  const args = process.argv.slice(2);
  const options = {};

  // 解析命令行参数
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    
    if (key === 'concurrent' || key === 'duration' || key === 'port') {
      options[key] = parseInt(value);
    } else {
      options[key] = value;
    }
  }

  const tester = new QuickPerformanceTest(options);
  await tester.runTest();
}

// 如果直接运行此脚本
if (require.main === module) {
  runQuickTest().catch(console.error);
}

module.exports = QuickPerformanceTest;
