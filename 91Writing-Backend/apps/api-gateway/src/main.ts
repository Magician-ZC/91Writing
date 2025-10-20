import { config } from 'dotenv';
config(); // 加载环境变量

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as compression from 'compression';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    bodyParser: true,
  });

  // 增加请求体大小限制（支持大文件上传）
  const express = require('express');
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // 全局中间件
  app.use(helmet());
  app.use(compression());

  // 跨域配置
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://91writing.com', 'https://www.91writing.com']
      : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:7520'],
    credentials: true,
  });

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API版本前缀
  app.setGlobalPrefix('api/v1');

  // Swagger文档配置
  const config = new DocumentBuilder()
    .setTitle('91Writing API Gateway')
    .setDescription('91Writing 商业化平台API网关')
    .setVersion('1.0')
    .addTag('auth', '用户认证')
    .addTag('users', '用户管理')
    .addTag('novels', '小说管理')
    .addTag('ai', 'AI服务')
    .addTag('payments', '支付服务')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.API_GATEWAY_PORT || process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 API Gateway is running on: http://localhost:${port}`);
  console.log(`📖 Swagger docs available at: http://localhost:${port}/api/docs`);
}

bootstrap().catch((error) => {
  console.error('❌ Error starting API Gateway:', error);
  process.exit(1);
});
