import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { ResponseInterceptor } from './interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 全局管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS 配置
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://91writing.com', 'https://www.91writing.com']
      : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:7520', 'http://localhost:4173', 'http://localhost:8080'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // 全局过滤器
  app.useGlobalFilters(new AllExceptionsFilter());

  // 全局拦截器
  app.useGlobalInterceptors(new ResponseInterceptor());

  // API 文档配置
  const config = new DocumentBuilder()
    .setTitle('91Writing 管理后台 API')
    .setDescription('91Writing 管理后台服务接口文档')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: '请输入JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('管理员认证', '管理员登录、权限验证等')
    .addTag('用户管理', '用户增删改查、统计等')
    .addTag('订阅管理', '订阅数据管理、统计分析等')
    .addTag('系统配置', '系统参数配置管理')
    .addTag('健康检查', '服务健康状态检查')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = configService.get('ADMIN_SERVICE_PORT', 3006);
  await app.listen(port);

  console.log(`🚀 管理后台服务启动成功: http://localhost:${port}`);
  console.log(`📖 API文档地址: http://localhost:${port}/api-docs`);
}

bootstrap().catch((error) => {
  console.error('启动管理后台服务失败:', error);
  process.exit(1);
});