import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { NovelModule } from './modules/novel/novel.module';
import { ChapterModule } from './modules/chapter/chapter.module';
import { MemoryModule } from './modules/memory/memory.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    DatabaseModule,
    NovelModule,
    ChapterModule,
    MemoryModule,
    HealthModule,
  ],
})
export class AppModule {}
