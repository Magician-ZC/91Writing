const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CodeQualityChecker {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.suggestions = [];
    this.stats = {
      totalFiles: 0,
      linesOfCode: 0,
      testCoverage: 0,
      duplicateCode: 0,
    };
  }

  async runAllChecks() {
    console.log('🔍 开始代码质量检查...\n');

    // 1. 静态代码分析
    await this.runLintCheck();
    
    // 2. 代码结构分析
    await this.analyzeCodeStructure();
    
    // 3. 安全性检查
    await this.runSecurityCheck();
    
    // 4. 性能分析
    await this.analyzePerformance();
    
    // 5. 测试覆盖率检查
    await this.checkTestCoverage();
    
    // 6. 依赖分析
    await this.analyzeDependencies();
    
    // 7. 代码复杂度检查
    await this.checkComplexity();

    // 生成报告
    this.generateReport();
  }

  async runLintCheck() {
    console.log('📋 运行ESLint检查...');
    try {
      const result = execSync('npm run lint', { 
        encoding: 'utf8', 
        stdio: ['pipe', 'pipe', 'pipe'] 
      });
      console.log('✅ ESLint检查通过\n');
    } catch (error) {
      const errorOutput = error.stdout || error.stderr;
      if (errorOutput.includes('warning') || errorOutput.includes('error')) {
        this.issues.push({
          type: 'lint',
          severity: 'warning',
          message: 'ESLint发现代码规范问题',
          details: errorOutput.slice(0, 500) + '...',
        });
        console.log('⚠️  ESLint发现一些问题\n');
      }
    }
  }

  async analyzeCodeStructure() {
    console.log('🏗️  分析代码结构...');
    
    const srcDir = path.join(__dirname, '../apps');
    const issues = [];
    
    // 检查文件结构和命名规范
    const checkDirectory = (dir, depth = 0) => {
      if (depth > 5) return; // 避免过深递归
      
      const files = fs.readdirSync(dir, { withFileTypes: true });
      
      files.forEach(file => {
        const filePath = path.join(dir, file.name);
        
        if (file.isDirectory()) {
          checkDirectory(filePath, depth + 1);
        } else if (file.name.endsWith('.ts')) {
          this.stats.totalFiles++;
          
          // 检查文件大小
          const stats = fs.statSync(filePath);
          const content = fs.readFileSync(filePath, 'utf8');
          const lines = content.split('\n').length;
          this.stats.linesOfCode += lines;
          
          if (lines > 500) {
            issues.push(`文件过大: ${filePath} (${lines} 行)`);
          }
          
          // 检查命名规范
          if (!file.name.match(/^[a-z][a-z0-9-]*\.(service|controller|module|dto|entity|guard|interceptor|filter|pipe)\.ts$/)) {
            if (!file.name.includes('.spec.') && !file.name.includes('.test.')) {
              issues.push(`文件命名不规范: ${file.name}`);
            }
          }
          
          // 检查循环依赖（简单检查）
          const imports = content.match(/import.*from\s+['"][^'"]*['"]/g) || [];
          const relativePath = filePath.replace(__dirname, '').replace('../', '');
          
          imports.forEach(imp => {
            if (imp.includes('../') && imp.split('../').length > 3) {
              issues.push(`可能的深层依赖: ${relativePath} -> ${imp}`);
            }
          });
        }
      });
    };
    
    if (fs.existsSync(srcDir)) {
      checkDirectory(srcDir);
    }
    
    if (issues.length > 0) {
      this.warnings.push({
        type: 'structure',
        message: '代码结构问题',
        details: issues.slice(0, 10), // 只显示前10个问题
      });
    }
    
    console.log(`✅ 分析完成: ${this.stats.totalFiles} 文件, ${this.stats.linesOfCode} 行代码\n`);
  }

  async runSecurityCheck() {
    console.log('🔒 运行安全检查...');
    
    try {
      // 检查已知漏洞依赖
      const auditResult = execSync('npm audit --audit-level=moderate --json', {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      const audit = JSON.parse(auditResult);
      const vulnerabilities = audit.metadata?.vulnerabilities;
      
      if (vulnerabilities && Object.keys(vulnerabilities).length > 0) {
        this.issues.push({
          type: 'security',
          severity: 'high',
          message: '发现安全漏洞依赖',
          details: `漏洞数量: ${JSON.stringify(vulnerabilities)}`,
        });
      } else {
        console.log('✅ 安全检查通过\n');
      }
    } catch (error) {
      this.warnings.push({
        type: 'security',
        message: '安全检查无法完成',
        details: error.message.slice(0, 200),
      });
      console.log('⚠️  安全检查遇到问题\n');
    }
    
    // 检查敏感信息
    this.checkSensitiveData();
  }

  checkSensitiveData() {
    const sensitivePatterns = [
      /password\s*[:=]\s*["'](?!.*\$\{)[^"']{8,}/i,
      /api[_-]?key\s*[:=]\s*["'][^"']{16,}/i,
      /secret\s*[:=]\s*["'][^"']{16,}/i,
      /token\s*[:=]\s*["'][^"']{32,}/i,
    ];
    
    const checkFile = (filePath) => {
      if (filePath.includes('node_modules') || filePath.includes('.git')) return;
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        sensitivePatterns.forEach(pattern => {
          if (pattern.test(content)) {
            this.warnings.push({
              type: 'security',
              message: '可能包含敏感信息',
              details: `文件: ${filePath}`,
            });
          }
        });
      } catch (error) {
        // 忽略读取错误
      }
    };
    
    // 递归检查.ts文件
    const walkDir = (dir) => {
      try {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          
          if (stat.isDirectory()) {
            walkDir(filePath);
          } else if (file.endsWith('.ts') || file.endsWith('.js')) {
            checkFile(filePath);
          }
        });
      } catch (error) {
        // 忽略目录访问错误
      }
    };
    
    walkDir(path.join(__dirname, '../apps'));
    walkDir(path.join(__dirname, '../libs'));
  }

  async analyzePerformance() {
    console.log('⚡ 分析性能问题...');
    
    const performanceIssues = [];
    
    // 检查可能的性能问题
    const checkPerformancePatterns = (content, filePath) => {
      // 检查同步操作
      if (content.includes('fs.readFileSync') || content.includes('fs.writeFileSync')) {
        performanceIssues.push(`同步文件操作: ${filePath}`);
      }
      
      // 检查未优化的数据库查询
      if (content.includes('findMany()') && !content.includes('take') && !content.includes('limit')) {
        performanceIssues.push(`可能的大数据量查询: ${filePath}`);
      }
      
      // 检查循环中的数据库操作
      if (content.match(/for\s*\(.*\)\s*{[\s\S]*?prisma\./)) {
        performanceIssues.push(`循环中的数据库操作: ${filePath}`);
      }
      
      // 检查未使用的导入
      const imports = content.match(/import\s+{[^}]+}\s+from/g) || [];
      imports.forEach(imp => {
        const items = imp.match(/{([^}]+)}/)[1].split(',').map(s => s.trim());
        items.forEach(item => {
          if (!content.includes(item.replace(/\s+as\s+\w+/, '').trim())) {
            performanceIssues.push(`未使用的导入 ${item} in ${filePath}`);
          }
        });
      });
    };
    
    // 分析应用文件
    const analyzeDir = (dir) => {
      try {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        files.forEach(file => {
          const filePath = path.join(dir, file.name);
          if (file.isDirectory()) {
            analyzeDir(filePath);
          } else if (file.name.endsWith('.ts') && !file.name.includes('.spec.')) {
            const content = fs.readFileSync(filePath, 'utf8');
            checkPerformancePatterns(content, filePath);
          }
        });
      } catch (error) {
        // 忽略错误
      }
    };
    
    analyzeDir(path.join(__dirname, '../apps'));
    
    if (performanceIssues.length > 0) {
      this.warnings.push({
        type: 'performance',
        message: '发现性能问题',
        details: performanceIssues.slice(0, 8),
      });
    }
    
    console.log(`✅ 性能分析完成，发现 ${performanceIssues.length} 个潜在问题\n`);
  }

  async checkTestCoverage() {
    console.log('🧪 检查测试覆盖率...');
    
    try {
      // 统计测试文件
      let testFiles = 0;
      let sourceFiles = 0;
      
      const countFiles = (dir, isTest = false) => {
        try {
          const files = fs.readdirSync(dir, { withFileTypes: true });
          files.forEach(file => {
            const filePath = path.join(dir, file.name);
            if (file.isDirectory()) {
              countFiles(filePath, isTest);
            } else if (file.name.endsWith('.ts')) {
              if (file.name.includes('.spec.') || file.name.includes('.test.')) {
                testFiles++;
              } else if (!file.name.includes('.d.ts') && !file.name.includes('main.ts')) {
                sourceFiles++;
              }
            }
          });
        } catch (error) {
          // 忽略错误
        }
      };
      
      countFiles(path.join(__dirname, '../apps'));
      countFiles(path.join(__dirname, '../libs'));
      countFiles(path.join(__dirname, '../test'));
      
      const testCoverage = sourceFiles > 0 ? (testFiles / sourceFiles * 100) : 0;
      this.stats.testCoverage = testCoverage;
      
      if (testCoverage < 70) {
        this.warnings.push({
          type: 'testing',
          message: '测试覆盖率不足',
          details: `当前覆盖率: ${testCoverage.toFixed(1)}% (目标: 70%+)`,
        });
      }
      
      console.log(`✅ 测试文件: ${testFiles}, 源文件: ${sourceFiles}, 覆盖率: ${testCoverage.toFixed(1)}%\n`);
    } catch (error) {
      console.log('⚠️  测试覆盖率检查失败\n');
    }
  }

  async analyzeDependencies() {
    console.log('📦 分析依赖关系...');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      const issues = [];
      const outdated = [];
      
      // 检查常见问题依赖
      Object.keys(deps).forEach(dep => {
        // 检查过时的包
        if (dep === 'request' || dep === 'node-uuid' || dep === 'babel-core') {
          outdated.push(dep);
        }
        
        // 检查版本固定
        const version = deps[dep];
        if (!version.includes('^') && !version.includes('~') && !version.includes('>=')) {
          if (!version.includes('latest') && !version.includes('file:')) {
            issues.push(`版本固定过死: ${dep}@${version}`);
          }
        }
      });
      
      if (outdated.length > 0) {
        this.warnings.push({
          type: 'dependencies',
          message: '使用了过时的依赖',
          details: outdated,
        });
      }
      
      if (issues.length > 0) {
        this.suggestions.push({
          type: 'dependencies',
          message: '依赖管理建议',
          details: issues.slice(0, 5),
        });
      }
      
      console.log(`✅ 分析完成: ${Object.keys(deps).length} 个依赖\n`);
    } catch (error) {
      console.log('⚠️  依赖分析失败\n');
    }
  }

  async checkComplexity() {
    console.log('🧮 检查代码复杂度...');
    
    const complexityIssues = [];
    
    const checkFileComplexity = (filePath, content) => {
      // 检查函数长度
      const functionMatches = content.match(/(?:async\s+)?(?:function\s+\w+|(?:\w+\s*[:=]\s*)?(?:async\s+)?\([^)]*\)\s*=>)\s*{/g) || [];
      
      // 简单的复杂度检查
      const lines = content.split('\n');
      let currentFunctionStart = -1;
      let braceCount = 0;
      let functionName = '';
      
      lines.forEach((line, index) => {
        if (line.includes('function') || line.includes('=>') || line.includes('async')) {
          if (currentFunctionStart === -1) {
            currentFunctionStart = index;
            functionName = line.trim().split(/\s+/)[1] || 'anonymous';
          }
        }
        
        braceCount += (line.match(/{/g) || []).length;
        braceCount -= (line.match(/}/g) || []).length;
        
        if (currentFunctionStart !== -1 && braceCount === 0) {
          const functionLength = index - currentFunctionStart;
          if (functionLength > 50) {
            complexityIssues.push(`长函数 ${functionName} in ${filePath}: ${functionLength} 行`);
          }
          currentFunctionStart = -1;
        }
      });
      
      // 检查嵌套深度
      let maxNesting = 0;
      let currentNesting = 0;
      
      lines.forEach(line => {
        const ifCount = (line.match(/\bif\s*\(/g) || []).length;
        const forCount = (line.match(/\bfor\s*\(/g) || []).length;
        const whileCount = (line.match(/\bwhile\s*\(/g) || []).length;
        const tryCount = (line.match(/\btry\s*{/g) || []).length;
        
        currentNesting += ifCount + forCount + whileCount + tryCount;
        maxNesting = Math.max(maxNesting, currentNesting);
        
        const closeBraces = (line.match(/}/g) || []).length;
        currentNesting = Math.max(0, currentNesting - closeBraces);
      });
      
      if (maxNesting > 5) {
        complexityIssues.push(`过深嵌套 in ${filePath}: ${maxNesting} 层`);
      }
    };
    
    // 检查应用文件
    const checkDir = (dir) => {
      try {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        files.forEach(file => {
          const filePath = path.join(dir, file.name);
          if (file.isDirectory()) {
            checkDir(filePath);
          } else if (file.name.endsWith('.ts') && !file.name.includes('.spec.')) {
            const content = fs.readFileSync(filePath, 'utf8');
            checkFileComplexity(filePath, content);
          }
        });
      } catch (error) {
        // 忽略错误
      }
    };
    
    checkDir(path.join(__dirname, '../apps'));
    
    if (complexityIssues.length > 0) {
      this.warnings.push({
        type: 'complexity',
        message: '代码复杂度问题',
        details: complexityIssues.slice(0, 8),
      });
    }
    
    console.log(`✅ 复杂度检查完成，发现 ${complexityIssues.length} 个问题\n`);
  }

  generateReport() {
    console.log('📊 生成代码质量报告');
    console.log('='.repeat(60));
    console.log('');
    
    // 总体统计
    console.log('📈 项目统计:');
    console.log(`   文件总数: ${this.stats.totalFiles}`);
    console.log(`   代码行数: ${this.stats.linesOfCode}`);
    console.log(`   测试覆盖: ${this.stats.testCoverage.toFixed(1)}%`);
    console.log('');
    
    // 质量评分
    let score = 100;
    score -= this.issues.length * 10;
    score -= this.warnings.length * 5;
    score = Math.max(0, score);
    
    console.log(`🎯 质量评分: ${score}/100`);
    if (score >= 90) {
      console.log('   评级: ✅ 优秀');
    } else if (score >= 80) {
      console.log('   评级: ⭐ 良好');
    } else if (score >= 70) {
      console.log('   评级: ⚠️  可接受');
    } else {
      console.log('   评级: ❌ 需要改进');
    }
    console.log('');
    
    // 问题报告
    if (this.issues.length > 0) {
      console.log('🚨 严重问题:');
      this.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. [${issue.type.toUpperCase()}] ${issue.message}`);
        if (issue.details) {
          console.log(`      ${issue.details.toString().slice(0, 100)}...`);
        }
      });
      console.log('');
    }
    
    if (this.warnings.length > 0) {
      console.log('⚠️  警告:');
      this.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. [${warning.type.toUpperCase()}] ${warning.message}`);
        if (Array.isArray(warning.details)) {
          warning.details.slice(0, 3).forEach(detail => {
            console.log(`      - ${detail.toString().slice(0, 80)}...`);
          });
        } else if (warning.details) {
          console.log(`      ${warning.details.toString().slice(0, 80)}...`);
        }
      });
      console.log('');
    }
    
    if (this.suggestions.length > 0) {
      console.log('💡 建议:');
      this.suggestions.forEach((suggestion, index) => {
        console.log(`   ${index + 1}. [${suggestion.type.toUpperCase()}] ${suggestion.message}`);
        if (Array.isArray(suggestion.details)) {
          suggestion.details.slice(0, 3).forEach(detail => {
            console.log(`      - ${detail}`);
          });
        }
      });
      console.log('');
    }
    
    // 改进建议
    console.log('🔧 优化建议:');
    if (this.stats.testCoverage < 80) {
      console.log('   - 增加单元测试覆盖率，目标 80%+');
    }
    if (this.warnings.some(w => w.type === 'performance')) {
      console.log('   - 优化数据库查询，避免N+1问题');
      console.log('   - 考虑添加缓存机制');
    }
    if (this.warnings.some(w => w.type === 'complexity')) {
      console.log('   - 重构复杂函数，遵循单一职责原则');
      console.log('   - 减少代码嵌套深度');
    }
    if (this.warnings.some(w => w.type === 'dependencies')) {
      console.log('   - 更新过时的依赖包');
      console.log('   - 定期进行安全审计');
    }
    console.log('   - 建立代码审查流程');
    console.log('   - 配置持续集成检查');
    console.log('');
    
    console.log('✅ 代码质量检查完成！');
  }
}

// 运行检查
async function runCodeQualityCheck() {
  const checker = new CodeQualityChecker();
  await checker.runAllChecks();
}

if (require.main === module) {
  runCodeQualityCheck().catch(console.error);
}

module.exports = CodeQualityChecker;
