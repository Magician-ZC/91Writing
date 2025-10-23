#!/bin/bash

# Shannon 服务健康检查脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 检查计数器
TOTAL=0
PASSED=0
FAILED=0

# 检查函数
check_service() {
    local service_name=$1
    local check_command=$2
    local port=$3
    
    TOTAL=$((TOTAL + 1))
    
    printf "检查 %-25s" "$service_name..."
    
    if eval "$check_command" &> /dev/null; then
        printf "${GREEN}✓ Running${NC}"
        if [ ! -z "$port" ]; then
            printf " (Port $port)"
        fi
        printf "\n"
        PASSED=$((PASSED + 1))
        return 0
    else
        printf "${RED}✗ Failed${NC}\n"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# 检查 Docker 容器
check_container() {
    local container_name=$1
    check_service "$container_name" "docker inspect -f '{{.State.Running}}' $container_name | grep -q true"
}

# 检查 HTTP 端点
check_http() {
    local service_name=$1
    local url=$2
    local port=$3
    check_service "$service_name" "curl -sf $url" "$port"
}

# 主检查流程
main() {
    echo ""
    echo "=========================================="
    echo "  Shannon 健康检查"
    echo "=========================================="
    echo ""
    
    echo "数据存储层:"
    echo "----------------------------------------"
    check_container "shannon-postgres"
    check_container "shannon-redis"
    check_container "shannon-qdrant"
    echo ""
    
    echo "Shannon 核心服务:"
    echo "----------------------------------------"
    check_http "Shannon Orchestrator" "http://localhost:8080/health" "8080"
    check_http "Shannon Agent Core" "http://localhost:8081/health" "8081"
    check_http "Shannon LLM Service" "http://localhost:8082/health" "8082"
    echo ""
    
    echo "监控服务:"
    echo "----------------------------------------"
    check_http "Prometheus" "http://localhost:9090/-/healthy" "9090"
    check_http "Grafana" "http://localhost:3000/api/health" "3000"
    check_http "Jaeger" "http://localhost:16686/" "16686"
    check_http "Loki" "http://localhost:3100/ready" "3100"
    echo ""
    
    echo "=========================================="
    printf "总计: $TOTAL | ${GREEN}通过: $PASSED${NC} | ${RED}失败: $FAILED${NC}\n"
    echo "=========================================="
    echo ""
    
    if [ $FAILED -gt 0 ]; then
        echo "${RED}部分服务异常，请检查日志${NC}"
        echo "查看日志命令: docker-compose logs [service_name]"
        exit 1
    else
        echo "${GREEN}所有服务运行正常！${NC}"
        exit 0
    fi
}

main

