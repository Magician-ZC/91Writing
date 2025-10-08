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
import { MaterialService } from './material.service';
import { CreateMaterialDto, UpdateMaterialDto, QueryMaterialDto } from '../../dto/material.dto';
import { JwtAuthGuard } from '@app/common/guards';

@ApiTags('素材管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('materials')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Post()
  @ApiOperation({ summary: '创建素材' })
  async create(@Req() req, @Body() dto: CreateMaterialDto) {
    return this.materialService.create(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: '获取素材列表' })
  async findAll(@Req() req, @Query() query: QueryMaterialDto) {
    return this.materialService.findAll(req.user.userId, query);
  }

  @Get('categories')
  @ApiOperation({ summary: '获取素材分类列表' })
  async getCategories(@Req() req) {
    return this.materialService.getCategories(req.user.userId);
  }

  @Get('tags')
  @ApiOperation({ summary: '获取素材标签列表' })
  async getTags(@Req() req) {
    return this.materialService.getTags(req.user.userId);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取素材统计' })
  async getStats(@Req() req) {
    return this.materialService.getStats(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取素材详情' })
  async findOne(@Req() req, @Param('id') id: string) {
    return this.materialService.findOne(req.user.userId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新素材' })
  async update(@Req() req, @Param('id') id: string, @Body() dto: UpdateMaterialDto) {
    return this.materialService.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除素材' })
  async remove(@Req() req, @Param('id') id: string) {
    return this.materialService.remove(req.user.userId, id);
  }
}
