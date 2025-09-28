import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 全局管道
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  
  // 全局拦截器
  app.useGlobalInterceptors(new ResponseInterceptor());
  
  // 全局异常过滤器
  app.useGlobalFilters(new AllExceptionsFilter());
  
  // Swagger文档
  const config = new DocumentBuilder()
    .setTitle('91Writing Payment Service API')
    .setDescription('91写作平台支付服务API文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  // CORS配置
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });
  
  const port = process.env.PAYMENT_SERVICE_PORT || 3005;
  await app.listen(port);
  console.log(`Payment Service running on port ${port}`);
}

bootstrap();
