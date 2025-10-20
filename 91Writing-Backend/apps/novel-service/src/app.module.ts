import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DatabaseModule } from '@app/database';
import { NovelModule } from './modules/novel/novel.module';
import { ChapterModule } from './modules/chapter/chapter.module';
import { MemoryModule } from './modules/memory/memory.module';
import { SuggestionModule } from './modules/suggestion/suggestion.module';
import { CharacterModule } from './modules/character/character.module';
import { WorldModule } from './modules/world/world.module';
import { MaterialModule } from './modules/material/material.module';
import { MigrationModule } from './modules/migration/migration.module';
import { PromptModule } from './modules/prompt/prompt.module';
import { CollaborationModule } from './modules/collaboration/collaboration.module';
import { VersionModule } from './modules/version/version.module';
import { CommentModule } from './modules/comment/comment.module';
import { HealthModule } from './modules/health/health.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Passport 模块
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // JWT 模块
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', '91writing_default_secret'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d'),
        },
      }),
      inject: [ConfigService],
    }),

    // 数据库模块
    DatabaseModule,
    
    // 功能模块
    NovelModule,
    ChapterModule,
    MemoryModule,
    SuggestionModule,
    CharacterModule,
    WorldModule,
    MaterialModule,
    MigrationModule,
    PromptModule,
    CollaborationModule,
    VersionModule,
    CommentModule,
    HealthModule,
  ],
  providers: [
    JwtStrategy,
  ],
})
export class AppModule {}
