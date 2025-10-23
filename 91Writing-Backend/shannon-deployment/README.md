# Shannon 基础设施部署指南

> **Phase 1: 基础设施搭建**  
> **预计时间**: 3-4 周  
> **目标**: 建立完整的 Shannon 运行环境和监控体系

---

## 📋 目录

- [快速开始](#快速开始)
- [环境要求](#环境要求)
- [部署步骤](#部署步骤)
- [验证测试](#验证测试)
- [故障排查](#故障排查)
- [运维指南](#运维指南)

---

## 🚀 快速开始

### 一键启动（开发环境）

```bash
cd shannon-deployment

# 1. 复制环境变量配置
cp .env.example .env

# 2. 编辑配置文件（填入你的 API Keys）
nano .env

# 3. 启动所有服务
./scripts/start-all.sh

# 4. 验证服务状态
./scripts/health-check.sh
```

### 访问地址

| 服务 | 地址 | 用途 |
|------|------|------|
| **Shannon Orchestrator** | http://localhost:8080 | Shannon 核心服务 |
| **Grafana** | http://localhost:3000 | 监控面板（admin/admin） |
| **Prometheus** | http://localhost:9090 | 指标查询 |
| **Jaeger UI** | http://localhost:16686 | 分布式追踪 |
| **Qdrant Dashboard** | http://localhost:6333/dashboard | 向量数据库 |

---

## 💻 环境要求

### 硬件要求

| 环境 | CPU | 内存 | 磁盘 |
|------|-----|------|------|
| **开发环境** | 4 核+ | 8GB+ | 50GB+ |
| **测试环境** | 8 核+ | 16GB+ | 100GB+ |
| **生产环境** | 16 核+ | 32GB+ | 500GB+ |

### 软件要求

- **Docker**: >= 20.10
- **Docker Compose**: >= 2.0
- **Git**: >= 2.30
- **Node.js**: >= 18 (用于运行脚本)

### 网络要求

- 能够访问 GitHub（下载 Shannon）
- 能够访问 Docker Hub（拉取镜像）
- 如果使用云服务，需要开放以下端口：
  - 8080 (Shannon Orchestrator)
  - 3000 (Grafana)
  - 9090 (Prometheus)
  - 16686 (Jaeger)

---

## 📦 部署步骤

### Week 1-2: Shannon 核心部署

#### Step 1: 环境准备（Day 1）

```bash
# 创建工作目录
cd 91Writing-Backend
mkdir -p shannon-deployment
cd shannon-deployment

# 创建必要的子目录
mkdir -p {config,data,logs,scripts,monitoring}
mkdir -p data/{postgres,redis,qdrant}
mkdir -p logs/{shannon,monitoring}
mkdir -p monitoring/{prometheus,grafana,jaeger,loki}
```

#### Step 2: 配置文件准备（Day 1-2）

```bash
# 复制所有配置文件（已在本目录提供）
ls -la config/
# - shannon-config.yml
# - postgres.conf
# - redis.conf
# - qdrant-config.yml

ls -la monitoring/
# - prometheus.yml
# - grafana-datasources.yml
# - grafana-dashboards/
# - alertmanager.yml
```

#### Step 3: 启动 Shannon 核心服务（Day 2-3）

```bash
# 1. 启动数据存储层
docker-compose -f docker-compose.storage.yml up -d

# 等待服务就绪（约 30 秒）
docker-compose -f docker-compose.storage.yml ps

# 2. 初始化数据库
./scripts/init-database.sh

# 3. 启动 Shannon 服务
docker-compose -f docker-compose.shannon.yml up -d

# 4. 检查服务状态
docker-compose -f docker-compose.shannon.yml logs -f
```

#### Step 4: 启动监控体系（Day 3-5）

```bash
# 1. 启动 Prometheus + Grafana
docker-compose -f docker-compose.monitoring.yml up -d

# 2. 导入 Grafana 面板
./scripts/import-dashboards.sh

# 3. 配置告警规则
./scripts/setup-alerts.sh

# 4. 验证监控数据采集
curl http://localhost:9090/api/v1/targets
```

#### Step 5: 验证部署（Day 5）

```bash
# 运行完整健康检查
./scripts/health-check.sh

# 运行基础功能测试
./scripts/test-shannon.sh

# 查看监控面板
# 打开浏览器访问 http://localhost:3000
```

---

### Week 3-4: 系统集成

#### Step 6: API Gateway 集成（Day 6-9）

参考 `docs/API-GATEWAY-INTEGRATION.md`

主要任务：
- [ ] 在 API Gateway 添加 Shannon 路由规则
- [ ] 配置负载均衡策略
- [ ] 实现请求转换中间件
- [ ] 添加限流和熔断
- [ ] 集成测试

#### Step 7: 用户系统打通（Day 10-12）

参考 `docs/USER-SYSTEM-INTEGRATION.md`

主要任务：
- [ ] 创建用户同步服务
- [ ] 实现权限映射逻辑
- [ ] 配置预算策略
- [ ] 会话管理同步
- [ ] 集成测试

#### Step 8: 配置迁移（Day 13-15）

参考 `docs/CONFIG-MIGRATION.md`

主要任务：
- [ ] 迁移 AI 配置数据
- [ ] 迁移 Provider 配置
- [ ] 迁移模型参数
- [ ] 配置热更新机制
- [ ] 数据验证

---

## ✅ 验证测试

### 1. 服务健康检查

```bash
# 运行自动健康检查脚本
./scripts/health-check.sh

# 预期输出：
# ✓ PostgreSQL: Running (Port 5432)
# ✓ Redis: Running (Port 6379)
# ✓ Qdrant: Running (Port 6333)
# ✓ Shannon Orchestrator: Running (Port 8080)
# ✓ Shannon Agent Core: Running (Port 8081)
# ✓ Shannon LLM Service: Running (Port 8082)
# ✓ Prometheus: Running (Port 9090)
# ✓ Grafana: Running (Port 3000)
# ✓ Jaeger: Running (Port 16686)
```

### 2. 功能测试

```bash
# 测试 Shannon API
curl -X POST http://localhost:8080/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user",
    "type": "llm_completion",
    "config": {
      "messages": [
        {"role": "user", "content": "Hello, Shannon!"}
      ]
    }
  }'

# 预期输出：
# {
#   "taskId": "task_xxx",
#   "status": "pending",
#   "createdAt": "2025-10-23T..."
# }
```

### 3. 监控数据验证

```bash
# 检查 Prometheus 采集的指标
curl http://localhost:9090/api/v1/query?query=up

# 检查 Grafana 数据源
curl -u admin:admin http://localhost:3000/api/datasources

# 检查 Jaeger 追踪数据
curl http://localhost:16686/api/services
```

### 4. 压力测试

```bash
# 运行压力测试（目标：1000 QPS）
./scripts/load-test.sh --qps 1000 --duration 60s

# 预期结果：
# - 成功率 > 99%
# - P95 响应时间 < 500ms
# - 无内存泄漏
```

---

## 🐛 故障排查

### 常见问题

#### 1. Shannon 服务无法启动

**症状**：`docker-compose logs` 显示连接数据库失败

**解决方案**：
```bash
# 检查 PostgreSQL 是否就绪
docker-compose -f docker-compose.storage.yml ps

# 检查数据库连接
docker exec -it shannon-postgres psql -U shannon -d shannon_db -c "SELECT 1;"

# 重启 Shannon 服务
docker-compose -f docker-compose.shannon.yml restart
```

#### 2. Grafana 无数据

**症状**：Grafana 面板显示 "No Data"

**解决方案**：
```bash
# 检查 Prometheus 是否采集到数据
curl http://localhost:9090/api/v1/targets

# 检查 Grafana 数据源配置
docker exec -it shannon-grafana cat /etc/grafana/provisioning/datasources/datasource.yml

# 重新导入面板
./scripts/import-dashboards.sh --force
```

#### 3. 内存不足

**症状**：服务 OOM 或性能下降

**解决方案**：
```bash
# 检查资源使用情况
docker stats

# 调整内存限制（编辑 docker-compose.yml）
# services:
#   shannon-orchestrator:
#     mem_limit: 2g
#     mem_reservation: 1g

# 重启服务
docker-compose restart
```

#### 4. 端口冲突

**症状**：`Error: Bind for 0.0.0.0:8080 failed: port is already allocated`

**解决方案**：
```bash
# 查找占用端口的进程
netstat -ano | findstr :8080  # Windows
lsof -i :8080                 # Linux/Mac

# 修改端口配置（编辑 .env 文件）
SHANNON_ORCHESTRATOR_PORT=8081

# 重启服务
docker-compose up -d
```

---

## 🔧 运维指南

### 日常维护

#### 每日检查
```bash
# 自动健康检查（建议放入 cron）
./scripts/health-check.sh

# 检查日志是否有错误
./scripts/check-errors.sh

# 检查磁盘使用
df -h
```

#### 每周维护
```bash
# 清理旧日志（保留 7 天）
./scripts/cleanup-logs.sh --days 7

# 备份数据库
./scripts/backup-database.sh

# 检查更新
./scripts/check-updates.sh
```

#### 每月维护
```bash
# 系统性能分析
./scripts/performance-report.sh

# 成本分析报告
./scripts/cost-report.sh

# 容量规划评估
./scripts/capacity-planning.sh
```

### 备份与恢复

#### 备份
```bash
# 完整备份（数据库 + 配置）
./scripts/backup-all.sh

# 备份文件位置：
# - data/backups/postgres/shannon_db_YYYYMMDD.sql
# - data/backups/redis/dump_YYYYMMDD.rdb
# - data/backups/config/config_YYYYMMDD.tar.gz
```

#### 恢复
```bash
# 从备份恢复
./scripts/restore-from-backup.sh --date 20251023

# 验证恢复
./scripts/health-check.sh
```

### 扩容指南

#### 垂直扩容（增加资源）
```yaml
# 编辑 docker-compose.yml
services:
  shannon-orchestrator:
    deploy:
      resources:
        limits:
          cpus: '4'      # 从 2 增加到 4
          memory: 4G     # 从 2G 增加到 4G
```

#### 水平扩容（增加实例）
```bash
# 扩展 Shannon Orchestrator 到 3 个实例
docker-compose -f docker-compose.shannon.yml up -d --scale shannon-orchestrator=3

# 配置负载均衡（Nginx）
./scripts/setup-load-balancer.sh --replicas 3
```

### 安全加固

```bash
# 1. 修改默认密码
./scripts/change-passwords.sh

# 2. 启用 SSL/TLS
./scripts/enable-ssl.sh

# 3. 配置防火墙规则
./scripts/setup-firewall.sh

# 4. 启用审计日志
./scripts/enable-audit.sh
```

---

## 📊 监控面板

### Grafana 面板列表

1. **Shannon 总览**
   - 访问路径：Dashboards → Shannon → Overview
   - 包含：QPS、响应时间、错误率、资源使用

2. **AI 成本分析**
   - 访问路径：Dashboards → Shannon → Cost Analysis
   - 包含：Token 消耗、成本趋势、分用户统计

3. **工作流监控**
   - 访问路径：Dashboards → Shannon → Workflows
   - 包含：工作流执行、Agent 性能、任务队列

4. **系统资源**
   - 访问路径：Dashboards → System → Resources
   - 包含：CPU、内存、磁盘、网络

### 告警配置

编辑 `monitoring/prometheus/alerts.yml` 配置告警规则：

```yaml
groups:
  - name: shannon_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(shannon_errors_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Shannon 错误率过高"
          description: "错误率: {{ $value }}"
```

---

## 📚 相关文档

- [Shannon 官方文档](https://shannon.kocoro.dev)
- [API Gateway 集成指南](docs/API-GATEWAY-INTEGRATION.md)
- [用户系统集成指南](docs/USER-SYSTEM-INTEGRATION.md)
- [配置迁移指南](docs/CONFIG-MIGRATION.md)
- [性能调优指南](docs/PERFORMANCE-TUNING.md)
- [安全最佳实践](docs/SECURITY-BEST-PRACTICES.md)

---

## 🆘 获取帮助

### 问题反馈

1. 查看日志：`docker-compose logs -f [service_name]`
2. 运行诊断脚本：`./scripts/diagnose.sh`
3. 查看监控面板：确认是否有异常指标
4. 提交 Issue：包含日志、配置、错误信息

### 紧急联系

- **项目负责人**: [待填写]
- **技术负责人**: [待填写]
- **运维负责人**: [待填写]

### 社区支持

- Shannon Discord: [链接待补充]
- Shannon GitHub Issues: https://github.com/Kocoro-lab/Shannon/issues

---

**最后更新**: 2025-10-23  
**文档版本**: v1.0  
**维护人员**: [待填写]

