import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '@app/common/guards';
import { ChapterService } from './chapter.service';
import { CreateChapterDto } from '../../dto/create-chapter.dto';
import { ChapterStatus } from '@prisma/client';

@Controller('novels/:novelId/chapters')
@UseGuards(JwtAuthGuard)
export class ChapterController {
  constructor(private readonly chapterService: ChapterService) {}

  @Post()
  async create(
    @Param('novelId') novelId: string,
    @Request() req,
    @Body(ValidationPipe) createChapterDto: CreateChapterDto,
  ) {
    return this.chapterService.create(novelId, req.user.id, createChapterDto);
  }

  @Get()
  async findAll(
    @Param('novelId') novelId: string,
    @Request() req,
  ) {
    return this.chapterService.findAll(novelId, req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.chapterService.findOne(id, req.user.id);
  }

  @Get(':id/content')
  async getContent(@Param('id') id: string, @Request() req) {
    return this.chapterService.getContent(id, req.user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body(ValidationPipe) updateData: Partial<CreateChapterDto>,
  ) {
    return this.chapterService.update(id, req.user.id, updateData);
  }

  @Patch(':id/content')
  async updateContent(
    @Param('id') id: string,
    @Request() req,
    @Body('content') content: string,
  ) {
    return this.chapterService.updateContent(id, req.user.id, content);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.chapterService.remove(id, req.user.id);
  }

  @Patch('status')
  async updateStatus(
    @Param('novelId') novelId: string,
    @Request() req,
    @Body() body: { chapterIds: string[]; status: ChapterStatus },
  ) {
    return this.chapterService.updateStatus(
      novelId,
      req.user.id,
      body.chapterIds,
      body.status,
    );
  }

  @Patch('reorder')
  async reorder(
    @Param('novelId') novelId: string,
    @Request() req,
    @Body() body: { chapterOrders: Array<{ id: string; chapterNumber: number }> },
  ) {
    return this.chapterService.reorder(novelId, req.user.id, body.chapterOrders);
  }
}
