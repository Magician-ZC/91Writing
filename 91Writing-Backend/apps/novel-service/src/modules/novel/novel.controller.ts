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
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '@app/common/guards';
import { NovelService } from './novel.service';
import { CreateNovelDto } from '../../dto/create-novel.dto';
import { UpdateNovelDto } from '../../dto/update-novel.dto';
import { NovelStatus } from '@prisma/client';

@Controller('novels')
@UseGuards(JwtAuthGuard)
export class NovelController {
  constructor(private readonly novelService: NovelService) {}

  @Post()
  async create(
    @Request() req,
    @Body(ValidationPipe) createNovelDto: CreateNovelDto,
  ) {
    return this.novelService.create(req.user.id, createNovelDto);
  }

  @Get()
  async findAll(
    @Request() req,
    @Query('status') status?: NovelStatus,
    @Query('genre') genre?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const options = {
      status,
      genre,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    };
    
    return this.novelService.findAll(req.user.id, options);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.novelService.findOne(id, req.user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body(ValidationPipe) updateNovelDto: UpdateNovelDto,
  ) {
    return this.novelService.update(id, req.user.id, updateNovelDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.novelService.remove(id, req.user.id);
  }

  @Post(':id/stats/update')
  async updateStats(@Param('id') id: string, @Request() req) {
    return this.novelService.updateStats(id, req.user.id);
  }

  @Get(':id/settings')
  async getSettings(@Param('id') id: string, @Request() req) {
    return this.novelService.getSettings(id, req.user.id);
  }

  @Patch(':id/settings')
  async updateSettings(
    @Param('id') id: string,
    @Request() req,
    @Body() settings: any,
  ) {
    return this.novelService.updateSettings(id, req.user.id, settings);
  }
}
