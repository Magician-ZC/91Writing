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
import { MemoryService } from './memory.service';
import { CreateMemoryDto } from '../../dto/create-memory.dto';
import { MemoryType } from '@prisma/client';

@Controller('novels/:novelId/memories')
@UseGuards(JwtAuthGuard)
export class MemoryController {
  constructor(private readonly memoryService: MemoryService) {}

  @Post()
  async create(
    @Param('novelId') novelId: string,
    @Request() req,
    @Body(ValidationPipe) createMemoryDto: CreateMemoryDto,
  ) {
    return this.memoryService.create(novelId, req.user.id, createMemoryDto);
  }

  @Get()
  async findAll(
    @Param('novelId') novelId: string,
    @Request() req,
    @Query('type') memoryType?: MemoryType,
    @Query('limit') limit?: string,
    @Query('orderBy') orderBy?: 'importance' | 'created' | 'updated',
  ) {
    const options = {
      memoryType,
      limit: limit ? parseInt(limit, 10) : undefined,
      orderBy,
    };
    
    return this.memoryService.findAll(novelId, req.user.id, options);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.memoryService.findOne(id, req.user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body(ValidationPipe) updateData: Partial<CreateMemoryDto>,
  ) {
    return this.memoryService.update(id, req.user.id, updateData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.memoryService.remove(id, req.user.id);
  }

  @Post('initialize')
  async initializeMemory(
    @Param('novelId') novelId: string,
    @Request() req,
    @Body() basicInfo?: any,
  ) {
    return this.memoryService.initializeNovelMemory(novelId, req.user.id, basicInfo);
  }

  @Get('context/generation')
  async getGenerationContext(
    @Param('novelId') novelId: string,
    @Request() req,
    @Query('maxTokens') maxTokens?: string,
    @Query('chapterContext') chapterContext?: string,
    @Query('includeTypes') includeTypes?: string,
  ) {
    const options: any = {};
    
    if (maxTokens) options.maxTokens = parseInt(maxTokens, 10);
    if (chapterContext) options.chapterContext = chapterContext;
    if (includeTypes) {
      options.includeTypes = includeTypes.split(',') as MemoryType[];
    }
    
    return this.memoryService.getGenerationContext(novelId, req.user.id, options);
  }

  @Post('chapters/:chapterNumber/summary')
  async updateChapterSummary(
    @Param('novelId') novelId: string,
    @Param('chapterNumber') chapterNumber: string,
    @Request() req,
    @Body() body: { summary: string; keyEvents?: string[] },
  ) {
    return this.memoryService.updateChapterSummary(
      novelId,
      req.user.id,
      parseInt(chapterNumber, 10),
      body.summary,
      body.keyEvents,
    );
  }

  @Delete('batch')
  async removeMany(
    @Param('novelId') novelId: string,
    @Request() req,
    @Body() body: { memoryIds: string[] },
  ) {
    return this.memoryService.removeMany(novelId, req.user.id, body.memoryIds);
  }

  @Post('cleanup')
  async cleanup(
    @Param('novelId') novelId: string,
    @Request() req,
    @Body() options?: {
      minImportance?: number;
      maxAge?: number;
      preserveCore?: boolean;
    },
  ) {
    return this.memoryService.cleanupMemories(novelId, req.user.id, options);
  }
}
