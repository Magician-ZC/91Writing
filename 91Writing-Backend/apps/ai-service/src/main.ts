import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局验证管道
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // CORS配置
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:7520',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Swagger API文档
  const config = new DocumentBuilder()
    .setTitle('91Writing AI服务API')
    .setDescription('91Writing AI服务API文档')
    .setVersion('1.0')
    .addTag('ai', 'AI服务')
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
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs/ai', app, document);

  const port = process.env.AI_SERVICE_PORT || 3004;
  await app.listen(port);

  console.log(`🤖 AI服务运行在: http://localhost:${port}`);
  console.log(`📖 API文档地址: http://localhost:${port}/api/docs/ai`);
}

bootstrap();