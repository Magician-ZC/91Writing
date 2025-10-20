import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/common/guards';
import { MaterialService } from './material.service';
import {
  CreateMaterialDto,
  UpdateMaterialDto,
  QueryMaterialsDto,
  BatchDeleteMaterialsDto,
  BatchUpdateCategoryDto,
  AddMaterialReferenceDto,
} from '../../dto/material.dto';

@ApiTags('素材管理')
@ApiBearerAuth('JWT-auth')
@Controller()
@UseGuards(JwtAuthGuard)
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Post('materials')
  @ApiOperation({ summary: '创建素材' })
  @ApiBody({ type: CreateMaterialDto })
  @ApiResponse({ status: 201, description: '创建成功' })
  async createMaterial(@Request() req, @Body(ValidationPipe) dto: CreateMaterialDto) {
    return this.materialService.createMaterial(req.user.id, dto);
  }

  @Get('materials')
  @ApiOperation({ summary: '获取素材列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMaterials(@Request() req, @Query(ValidationPipe) query: QueryMaterialsDto) {
    return this.materialService.getMaterials(req.user.id, query);
  }

  @Get('materials/:id')
  @ApiOperation({ summary: '获取素材详情' })
  @ApiParam({ name: 'id', description: '素材ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMaterial(@Request() req, @Param('id') id: string) {
    return this.materialService.getMaterial(req.user.id, id);
  }

  @Put('materials/:id')
  @ApiOperation({ summary: '更新素材' })
  @ApiParam({ name: 'id', description: '素材ID' })
  @ApiBody({ type: UpdateMaterialDto })
  @ApiResponse({ status: 200, description: '更新成功' })
  @HttpCode(HttpStatus.OK)
  async updateMaterial(
    @Request() req,
    @Param('id') id: string,
    @Body(ValidationPipe) dto: UpdateMaterialDto,
  ) {
    return this.materialService.updateMaterial(req.user.id, id, dto);
  }

  @Delete('materials/:id')
  @ApiOperation({ summary: '删除素材' })
  @ApiParam({ name: 'id', description: '素材ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @HttpCode(HttpStatus.OK)
  async deleteMaterial(@Request() req, @Param('id') id: string) {
    return this.materialService.deleteMaterial(req.user.id, id);
  }

  @Get('materials/stats/summary')
  @ApiOperation({ summary: '获取素材统计' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMaterialStats(@Request() req) {
    return this.materialService.getMaterialStats(req.user.id);
  }

  // ===== 批量操作 =====
  @Post('materials/batch-delete')
  @ApiOperation({ summary: '批量删除素材' })
  @ApiBody({ type: BatchDeleteMaterialsDto })
  @ApiResponse({ status: 200, description: '批量删除成功' })
  @HttpCode(HttpStatus.OK)
  async batchDeleteMaterials(@Request() req, @Body(ValidationPipe) dto: BatchDeleteMaterialsDto) {
    return this.materialService.batchDeleteMaterials(req.user.id, dto);
  }

  @Post('materials/batch-update-category')
  @ApiOperation({ summary: '批量更新素材分类' })
  @ApiBody({ type: BatchUpdateCategoryDto })
  @ApiResponse({ status: 200, description: '批量更新成功' })
  @HttpCode(HttpStatus.OK)
  async batchUpdateCategory(@Request() req, @Body(ValidationPipe) dto: BatchUpdateCategoryDto) {
    return this.materialService.batchUpdateCategory(req.user.id, dto);
  }

  // ===== 素材引用追踪 =====
  @Post('materials/:id/references')
  @ApiOperation({ summary: '添加素材引用记录' })
  @ApiParam({ name: 'id', description: '素材ID' })
  @ApiBody({ type: AddMaterialReferenceDto })
  @ApiResponse({ status: 201, description: '添加成功' })
  async addMaterialReference(
    @Request() req,
    @Param('id') id: string,
    @Body(ValidationPipe) dto: AddMaterialReferenceDto,
  ) {
    return this.materialService.addMaterialReference(req.user.id, id, dto);
  }

  @Get('materials/:id/references')
  @ApiOperation({ summary: '获取素材引用列表' })
  @ApiParam({ name: 'id', description: '素材ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMaterialReferences(@Request() req, @Param('id') id: string) {
    return this.materialService.getMaterialReferences(req.user.id, id);
  }

  @Delete('materials/references/:referenceId')
  @ApiOperation({ summary: '删除素材引用记录' })
  @ApiParam({ name: 'referenceId', description: '引用记录ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @HttpCode(HttpStatus.OK)
  async deleteMaterialReference(@Request() req, @Param('referenceId') referenceId: string) {
    return this.materialService.deleteMaterialReference(req.user.id, referenceId);
  }

  // ===== 存储配额管理 =====
  @Get('materials/storage/quota')
  @ApiOperation({ summary: '获取存储配额信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getStorageQuota(@Request() req) {
    return this.materialService.getStorageQuota(req.user.id);
  }
}
