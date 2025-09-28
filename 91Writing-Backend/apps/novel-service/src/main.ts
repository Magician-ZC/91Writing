import { config } from 'dotenv';
config(); // 加载环境变量

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { ResponseInterceptor } from './interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
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
  
  // CORS
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://91writing.com', 'https://www.91writing.com']
      : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:7520'],
    credentials: true,
  });
  
  const port = process.env.PORT || 3003;
  await app.listen(port);
  console.log(`Novel Service is running on: http://localhost:${port}`);
}
bootstrap();
