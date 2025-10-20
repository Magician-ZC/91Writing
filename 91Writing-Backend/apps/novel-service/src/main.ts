import { config } from 'dotenv';
config(); // 加载环境变量

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { ResponseInterceptor } from './interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
  });
  
  // 增加请求体大小限制（支持大文件上传）
  const express = require('express');
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  
  // 全局管道
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // 全局过滤器
  app.useGlobalFilters(new AllExceptionsFilter());
  
  // 全局拦截器
  app.useGlobalInterceptors(new ResponseInterceptor());
  
  // 全局前缀
  app.setGlobalPrefix('api/v1');
  
  // CORS
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://91writing.com', 'https://www.91writing.com']
      : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:7520'],
    credentials: true,
  });
  
  // Swagger API文档配置
  const config = new DocumentBuilder()
    .setTitle('91Writing Novel Service API')
    .setDescription(`
      91Writing 小说服务API文档
      
      ## 功能模块
      
      ### 🔐 认证说明
      - 所有API都需要JWT认证
      - 请在请求头中添加: Authorization: Bearer <token>
      - 用户只能操作自己的数据
      
      ### 📚 小说管理
      - 创建、编辑、删除小说
      - 小说设置管理(角色、世界观等)
      - 统计信息自动计算
      
      ### 📝 章节管理  
      - 章节内容的CRUD操作
      - 章节排序和状态管理
      - 大文本内容优化处理
      
      ### 🧠 记忆系统
      - AI辅助创作的上下文管理
      - 按重要性分级存储
      - 支持多种记忆类型
      
      ## 数据模型
      - Novel: 小说主体信息
      - Chapter: 章节内容
      - NovelMemory: 记忆数据
      
      ## 版本信息
      - 服务版本: v1.0
      - API版本: v1
      - 更新时间: 2024年12月
    `)
    .setVersion('1.0')
    .addTag('novels', '小说管理')
    .addTag('chapters', '章节管理')
    .addTag('memories', '记忆系统')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:3003', '开发环境')
    .addServer('https://api.91writing.com', '生产环境')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customfavIcon: 'https://91writing.com/favicon.ico',
    customSiteTitle: '91Writing API文档',
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .info h1 { color: #2c5aa0; }
    `,
  });
  
  const port = process.env.NOVEL_SERVICE_PORT || process.env.PORT || 3003;
  await app.listen(port);
  console.log(`Novel Service is running on: http://localhost:${port}`);
  console.log(`API Documentation: http://localhost:${port}/api-docs`);
}
bootstrap();
