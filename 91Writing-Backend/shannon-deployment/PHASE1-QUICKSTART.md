# Phase 1 快速开始指南

> 从零开始部署 Shannon 基础设施（10 分钟）

---

## 🎯 准备工作

### 1. 环境要求检查

```bash
# 检查 Docker
docker --version
# 需要: >= 20.10

# 检查 Docker Compose  
docker-compose --version
# 需要: >= 2.0

# 检查系统资源
free -h  # Linux/Mac
# 建议: 8GB+ 内存

df -h
# 建议: 50GB+ 可用磁盘空间
```

### 2. 获取 API Keys

在开始部署前，请准备以下 API Keys：

- **OpenAI API Key**: https://platform.openai.com/api-keys
- **Anthropic API Key**: https://console.anthropic.com/
- **DeepSeek API Key** (可选): https://www.deepseek.com/

---

## 🚀 快速部署（3 步）

### Step 1: 配置环境变量（2 分钟）

```bash
cd 91Writing-Backend/shannon-deployment

# 复制环境变量模板
cp env.example .env

# 编辑配置文件
nano .env  # 或使用你喜欢的编辑器
```

**必须修改的配置**：
```bash
# 将以下值替换为你的实际 API Keys
OPENAI_API_KEY=sk-your-real-openai-key-here
ANTHROPIC_API_KEY=sk-ant-your-real-anthropic-key-here

# 修改默认密码（生产环境必须修改）
POSTGRES_PASSWORD=your_strong_password
REDIS_PASSWORD=your_strong_password
GRAFANA_ADMIN_PASSWORD=your_strong_password
```

### Step 2: 启动所有服务（5 分钟）

```bash
# 给脚本执行权限
chmod +x scripts/*.sh

# 一键启动所有服务
./scripts/start-all.sh
```

**预期输出**：
```
[INFO] 检查环境要求...
[SUCCESS] 环境检查通过
[INFO] 创建数据和日志目录...
[SUCCESS] 目录创建完成
[INFO] 创建 Docker 网络...
[SUCCESS] Docker 网络创建完成
[INFO] 启动数据存储层服务...
[SUCCESS] 数据存储层启动成功
[INFO] 初始化数据库...
[SUCCESS] PostgreSQL 就绪
[INFO] 启动 Shannon 核心服务...
[SUCCESS] Shannon 核心服务启动成功
[INFO] 启动监控服务...
[SUCCESS] 监控服务启动成功

==========================================
  Shannon 服务启动完成！
==========================================
```

### Step 3: 验证部署（3 分钟）

```bash
# 运行健康检查
./scripts/health-check.sh
```

**预期输出**：
```
==========================================
  Shannon 健康检查
==========================================

数据存储层:
----------------------------------------
检查 shannon-postgres         ✓ Running
检查 shannon-redis            ✓ Running
检查 shannon-qdrant           ✓ Running

Shannon 核心服务:
----------------------------------------
检查 Shannon Orchestrator     ✓ Running (Port 8080)
检查 Shannon Agent Core       ✓ Running (Port 8081)
检查 Shannon LLM Service      ✓ Running (Port 8082)

监控服务:
----------------------------------------
检查 Prometheus               ✓ Running (Port 9090)
检查 Grafana                  ✓ Running (Port 3000)
检查 Jaeger                   ✓ Running (Port 16686)

==========================================
总计: 9 | 通过: 9 | 失败: 0
==========================================

所有服务运行正常！
```

---

## 🎨 访问服务

### Shannon 核心服务

| 服务 | 地址 | 说明 |
|------|------|------|
| Shannon Orchestrator | http://localhost:8080 | 核心编排服务 |
| Shannon Agent Core | http://localhost:8081 | Agent 执行引擎 |
| Shannon LLM Service | http://localhost:8082 | LLM 调用服务 |

### 监控面板

| 服务 | 地址 | 登录 |
|------|------|------|
| **Grafana** | http://localhost:3000 | admin / admin |
| **Prometheus** | http://localhost:9090 | 无需登录 |
| **Jaeger UI** | http://localhost:16686 | 无需登录 |

### 数据库

| 服务 | 地址 | 凭证 |
|------|------|------|
| PostgreSQL | localhost:5432 | shannon / (你的密码) |
| Redis | localhost:6379 | - / (你的密码) |
| Qdrant | http://localhost:6333 | 无需认证 |

---

## ✅ 快速测试

### 测试 Shannon API

```bash
# 测试简单的 AI 调用
curl -X POST http://localhost:8080/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_shannon_api_token" \
  -d '{
    "userId": "test_user",
    "type": "llm_completion",
    "config": {
      "messages": [
        {
          "role": "user",
          "content": "Say hello in Chinese"
        }
      ],
      "provider": "openai",
      "model": "gpt-3.5-turbo"
    }
  }'
```

**预期响应**：
```json
{
  "taskId": "task_abc123",
  "status": "pending",
  "createdAt": "2025-10-23T10:30:00Z"
}
```

### 查询任务状态

```bash
curl http://localhost:8080/api/v1/tasks/task_abc123 \
  -H "Authorization: Bearer your_shannon_api_token"
```

### 查看监控数据

```bash
# 访问 Grafana
open http://localhost:3000

# 默认登录：admin / admin
# 进入后会提示修改密码

# 导航到: Dashboards → Shannon → Overview
# 你应该能看到实时的监控数据
```

---

## 🐛 常见问题

### Q1: 端口被占用

**错误信息**：
```
Error: Bind for 0.0.0.0:8080 failed: port is already allocated
```

**解决方案**：
```bash
# 查找占用端口的进程
# Windows:
netstat -ano | findstr :8080

# Linux/Mac:
lsof -i :8080

# 修改配置文件中的端口
nano .env
# 修改 SHANNON_ORCHESTRATOR_PORT=8081

# 重启服务
./scripts/start-all.sh
```

### Q2: 内存不足

**症状**：服务频繁重启或 OOM

**解决方案**：
```bash
# 1. 检查可用内存
free -h

# 2. 如果内存不足，调整 Docker 资源限制
nano docker-compose.shannon.yml

# 找到并修改：
# deploy:
#   resources:
#     limits:
#       memory: 2G  # 从 4G 降低到 2G

# 3. 重启服务
docker-compose -f docker-compose.shannon.yml up -d
```

### Q3: API Key 无效

**错误信息**：Shannon LLM Service 日志显示 401 Unauthorized

**解决方案**：
```bash
# 1. 检查 API Key 是否正确
cat .env | grep API_KEY

# 2. 重新配置
nano .env
# 确保 API Key 正确且没有多余的空格

# 3. 重启 LLM Service
docker-compose -f docker-compose.shannon.yml restart shannon-llm-service

# 4. 查看日志确认
docker-compose -f docker-compose.shannon.yml logs -f shannon-llm-service
```

### Q4: Grafana 没有数据

**症状**：Grafana 面板显示 "No Data"

**解决方案**：
```bash
# 1. 检查 Prometheus 是否采集到数据
curl http://localhost:9090/api/v1/targets

# 2. 重启监控服务
docker-compose -f docker-compose.monitoring.yml restart

# 3. 等待 1-2 分钟让数据采集生效
```

---

## 🔧 常用命令

### 查看服务状态

```bash
# 查看所有服务
docker-compose -f docker-compose.*.yml ps

# 查看特定服务
docker ps --filter name=shannon
```

### 查看日志

```bash
# 查看所有日志
docker-compose -f docker-compose.*.yml logs -f

# 查看特定服务日志
docker-compose -f docker-compose.shannon.yml logs -f shannon-orchestrator

# 查看最近 100 行日志
docker logs shannon-orchestrator --tail 100
```

### 重启服务

```bash
# 重启特定服务
docker-compose -f docker-compose.shannon.yml restart shannon-orchestrator

# 重启所有服务
docker-compose -f docker-compose.*.yml restart
```

### 停止服务

```bash
# 停止所有服务
docker-compose -f docker-compose.*.yml down

# 停止并删除数据（谨慎使用）
docker-compose -f docker-compose.*.yml down -v
```

### 清理和重置

```bash
# 完全清理（包括数据）
docker-compose -f docker-compose.*.yml down -v
rm -rf data/*
rm -rf logs/*

# 重新启动
./scripts/start-all.sh
```

---

## 📊 监控面板使用

### Grafana 使用指南

1. **访问 Grafana**
   - URL: http://localhost:3000
   - 登录: admin / admin
   - 首次登录后修改密码

2. **查看预制面板**
   - Shannon Overview: 核心指标总览
   - AI Cost Analysis: 成本分析
   - Workflow Monitoring: 工作流监控
   - System Resources: 系统资源

3. **创建自定义面板**
   - 点击 "+" → Dashboard
   - 添加 Panel
   - 选择 Prometheus 数据源
   - 编写 PromQL 查询

---

## 📖 下一步

完成 Phase 1 基础设施部署后，你可以：

1. **Week 3-4**: 进行 API Gateway 集成
   - 参考: `docs/API-GATEWAY-INTEGRATION.md`

2. **Week 3-4**: 打通用户系统
   - 参考: `docs/USER-SYSTEM-INTEGRATION.md`

3. **Week 3-4**: 迁移配置管理
   - 参考: `docs/CONFIG-MIGRATION.md`

4. **测试**: 运行压力测试
   - 参考: `docs/LOAD-TESTING.md`

---

## 🆘 获取帮助

如果遇到问题：

1. 查看完整文档: `README.md`
2. 运行诊断脚本: `./scripts/diagnose.sh`
3. 查看故障排查: `README.md#故障排查`
4. 联系技术团队: [待填写]

---

**部署时间**: 约 10 分钟  
**文档版本**: v1.0  
**最后更新**: 2025-10-23

