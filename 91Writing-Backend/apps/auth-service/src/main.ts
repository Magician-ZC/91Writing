import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('AuthService');

  // 全局前缀
  app.setGlobalPrefix('api/v1/auth');

  // API版本控制
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // 安全中间件
  app.use(helmet());
  app.use(compression());

  // CORS配置
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://91writing.com', 'https://www.91writing.com']
      : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  });

  // 全局管道 - 数据验证
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 全局异常过滤器
  app.useGlobalFilters(new AllExceptionsFilter());

  // 全局响应拦截器
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Swagger API文档
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('91Writing 认证服务 API')
      .setDescription('91Writing 用户认证和授权服务接口文档')
      .setVersion('1.0')
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
      .addTag('认证管理', '用户注册、登录、Token管理')
      .addTag('权限控制', '角色权限、访问控制')
      .addTag('密码管理', '密码重置、密码修改')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs/auth', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  // 启动服务
  const port = configService.get('AUTH_SERVICE_PORT', 3002);
  await app.listen(port);

  logger.log(`🔐 认证服务已启动: http://localhost:${port}`);
  logger.log(`📖 API文档地址: http://localhost:${port}/api/docs/auth`);
}

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

bootstrap();
