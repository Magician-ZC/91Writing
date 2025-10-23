#!/bin/bash

# Shannon 一键启动脚本
# 按顺序启动所有服务

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查环境
check_prerequisites() {
    log_info "检查环境要求..."
    
    # 检查 Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    # 检查 Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    # 检查 .env 文件
    if [ ! -f .env ]; then
        log_warning ".env 文件不存在，使用默认配置"
        if [ -f env.example ]; then
            cp env.example .env
            log_info "已从 env.example 创建 .env 文件"
            log_warning "请编辑 .env 文件填入实际配置"
            exit 1
        fi
    fi
    
    log_success "环境检查通过"
}

# 创建必要的目录
create_directories() {
    log_info "创建数据和日志目录..."
    
    mkdir -p data/{postgres,redis,qdrant,prometheus,grafana,jaeger,loki,alertmanager}
    mkdir -p logs/shannon
    mkdir -p monitoring/{prometheus,grafana,jaeger,loki,promtail,alertmanager}
    mkdir -p config
    
    # 设置权限
    chmod -R 755 data logs
    
    log_success "目录创建完成"
}

# 创建 Docker 网络
create_network() {
    log_info "创建 Docker 网络..."
    
    if ! docker network inspect shannon-network &> /dev/null; then
        docker network create shannon-network
        log_success "Docker 网络创建完成"
    else
        log_info "Docker 网络已存在"
    fi
}

# 启动数据存储层
start_storage() {
    log_info "启动数据存储层服务..."
    
    docker-compose -f docker-compose.storage.yml up -d
    
    log_info "等待服务就绪..."
    sleep 10
    
    # 检查服务状态
    if docker-compose -f docker-compose.storage.yml ps | grep -q "Up"; then
        log_success "数据存储层启动成功"
    else
        log_error "数据存储层启动失败"
        docker-compose -f docker-compose.storage.yml logs
        exit 1
    fi
}

# 初始化数据库
init_database() {
    log_info "初始化数据库..."
    
    # 等待 PostgreSQL 完全就绪
    for i in {1..30}; do
        if docker exec shannon-postgres pg_isready -U shannon &> /dev/null; then
            log_success "PostgreSQL 就绪"
            break
        fi
        if [ $i -eq 30 ]; then
            log_error "PostgreSQL 启动超时"
            exit 1
        fi
        sleep 2
    done
    
    # 运行初始化脚本（如果存在）
    if [ -f scripts/init-database.sh ]; then
        bash scripts/init-database.sh
    fi
}

# 启动 Shannon 服务
start_shannon() {
    log_info "启动 Shannon 核心服务..."
    
    docker-compose -f docker-compose.shannon.yml up -d
    
    log_info "等待 Shannon 服务就绪..."
    sleep 15
    
    # 检查健康状态
    for i in {1..30}; do
        if curl -sf http://localhost:8080/health &> /dev/null; then
            log_success "Shannon Orchestrator 就绪"
            break
        fi
        if [ $i -eq 30 ]; then
            log_warning "Shannon Orchestrator 健康检查超时，请查看日志"
        fi
        sleep 2
    done
    
    log_success "Shannon 核心服务启动成功"
}

# 启动监控服务
start_monitoring() {
    log_info "启动监控服务..."
    
    docker-compose -f docker-compose.monitoring.yml up -d
    
    log_info "等待监控服务就绪..."
    sleep 10
    
    # 检查 Grafana
    for i in {1..30}; do
        if curl -sf http://localhost:3000/api/health &> /dev/null; then
            log_success "Grafana 就绪"
            break
        fi
        if [ $i -eq 30 ]; then
            log_warning "Grafana 健康检查超时"
        fi
        sleep 2
    done
    
    log_success "监控服务启动成功"
}

# 显示服务信息
show_services() {
    echo ""
    echo "=========================================="
    echo "  Shannon 服务启动完成！"
    echo "=========================================="
    echo ""
    echo "核心服务："
    echo "  • Shannon Orchestrator: http://localhost:8080"
    echo "  • Shannon Agent Core:   http://localhost:8081"
    echo "  • Shannon LLM Service:  http://localhost:8082"
    echo ""
    echo "数据存储："
    echo "  • PostgreSQL:  localhost:5432"
    echo "  • Redis:       localhost:6379"
    echo "  • Qdrant:      http://localhost:6333"
    echo ""
    echo "监控服务："
    echo "  • Grafana:     http://localhost:3000 (admin/admin)"
    echo "  • Prometheus:  http://localhost:9090"
    echo "  • Jaeger UI:   http://localhost:16686"
    echo ""
    echo "=========================================="
    echo ""
    echo "快速命令："
    echo "  查看所有服务:  docker-compose -f docker-compose.*.yml ps"
    echo "  查看日志:      docker-compose -f docker-compose.*.yml logs -f"
    echo "  停止服务:      ./scripts/stop-all.sh"
    echo "  健康检查:      ./scripts/health-check.sh"
    echo ""
}

# 主函数
main() {
    echo ""
    echo "=========================================="
    echo "  Shannon 部署脚本"
    echo "=========================================="
    echo ""
    
    # 检查是否在正确的目录
    if [ ! -f "docker-compose.storage.yml" ]; then
        log_error "请在 shannon-deployment 目录下运行此脚本"
        exit 1
    fi
    
    # 执行部署步骤
    check_prerequisites
    create_directories
    create_network
    start_storage
    init_database
    start_shannon
    start_monitoring
    show_services
    
    log_success "所有服务启动完成！"
}

# 执行主函数
main

