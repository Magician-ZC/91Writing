import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DatabaseModule } from '@app/database';
import { AssistantModule } from './modules/assistant/assistant.module';
import { GenerationModule } from './modules/generation/generation.module';
import { SuggestionModule } from './modules/suggestion/suggestion.module';
import { WizardModule } from './modules/wizard/wizard.module';
import { HealthModule } from './modules/health/health.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    
    // JWT认证模块
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '7d',
        },
      }),
      inject: [ConfigService],
    }),
    
    DatabaseModule,
    // 注册USER_SERVICE客户端
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.USER_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.USER_SERVICE_PORT) || 3004,
        },
      },
    ]),
    AssistantModule,
    GenerationModule,
    SuggestionModule,
    WizardModule,
    HealthModule,
  ],
  providers: [JwtStrategy],
  exports: [ClientsModule, JwtStrategy, PassportModule],
})
export class AppModule {}
