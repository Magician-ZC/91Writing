# 多阶段构建 - API Gateway
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# 安装依赖
RUN npm ci --only=production && npm cache clean --force

# 复制源码
COPY . .

# 生成 Prisma Client
RUN npx prisma generate

# 构建应用
RUN npm run build

# 生产镜像
FROM node:18-alpine AS runner

# 安装 dumb-init 用于信号处理
RUN apk add --no-cache dumb-init

# 创建应用用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

WORKDIR /app

# 复制构建文件和依赖
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 切换到应用用户
USER nestjs

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "
    const http = require('http');
    const options = {
      hostname: 'localhost',
      port: process.env.PORT || 3000,
      path: '/api/v1/health',
      timeout: 2000,
    };
    const request = http.request(options, (res) => {
      if (res.statusCode === 200) process.exit(0);
      else process.exit(1);
    });
    request.on('error', () => process.exit(1));
    request.on('timeout', () => process.exit(1));
    request.end();
  "

EXPOSE $PORT

# 使用 dumb-init 启动应用
CMD ["dumb-init", "node", "dist/apps/api-gateway/main"]
