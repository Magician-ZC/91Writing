import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PromptService } from './prompt.service';
import { CreatePromptDto, UpdatePromptDto, QueryPromptDto, RatePromptDto } from '../../dto/prompt.dto';
import { JwtAuthGuard } from '@app/common/guards';

@ApiTags('提示词管理')
@Controller('prompts')
export class PromptController {
  constructor(private readonly promptService: PromptService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '创建提示词' })
  async create(@Req() req, @Body() dto: CreatePromptDto) {
    return this.promptService.create(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: '获取提示词列表' })
  async findAll(@Req() req, @Query() query: QueryPromptDto) {
    const userId = req.user?.userId;
    return this.promptService.findAll(userId, query);
  }

  @Get('categories')
  @ApiOperation({ summary: '获取提示词分类列表' })
  async getCategories(@Req() req) {
    const userId = req.user?.userId;
    return this.promptService.getCategories(userId);
  }

  @Get('tags')
  @ApiOperation({ summary: '获取提示词标签列表' })
  async getTags(@Req() req) {
    const userId = req.user?.userId;
    return this.promptService.getTags(userId);
  }

  @Get('popular')
  @ApiOperation({ summary: '获取热门提示词' })
  async getPopular(@Query('limit') limit?: number) {
    return this.promptService.getPopular(limit || 10);
  }

  @Get('recommended')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取推荐提示词' })
  async getRecommended(@Req() req, @Query('limit') limit?: number) {
    return this.promptService.getRecommended(req.user.userId, limit || 10);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取提示词详情' })
  async findOne(@Req() req, @Param('id') id: string) {
    const userId = req.user?.userId;
    return this.promptService.findOne(id, userId);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '更新提示词' })
  async update(@Req() req, @Param('id') id: string, @Body() dto: UpdatePromptDto) {
    return this.promptService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '删除提示词' })
  async remove(@Req() req, @Param('id') id: string) {
    return this.promptService.remove(id, req.user.userId);
  }

  @Post(':id/rate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '评分提示词' })
  async rate(@Req() req, @Param('id') id: string, @Body() dto: RatePromptDto) {
    return this.promptService.rate(id, req.user.userId, dto.rating);
  }
}
