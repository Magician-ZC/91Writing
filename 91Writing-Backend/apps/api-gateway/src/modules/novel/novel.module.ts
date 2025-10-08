import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { NovelController } from './novel.controller';
import { NovelService } from './novel.service';

@Module({
  imports: [HttpModule],
  controllers: [NovelController],
  providers: [NovelService],
})
export class NovelModule {}
