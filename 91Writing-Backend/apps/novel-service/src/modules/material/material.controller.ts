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
  HttpException,
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
  AnalyzeMaterialDto,
  CheckSimilarityDto,
  SearchWizardMaterialsDto,
} from '../../dto/material.dto';

@ApiTags('素材管理')
@ApiBearerAuth('JWT-auth')
@Controller()
@UseGuards(JwtAuthGuard)
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  // ===== 具体路由（必须在参数化路由之前） =====
  
  @Get('materials')
  @ApiOperation({ summary: '获取素材列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMaterials(@Request() req, @Query(ValidationPipe) query: QueryMaterialsDto) {
    console.log('getMaterials called, user:', req.user, 'query:', query);
    if (!req.user || !req.user.id) {
      throw new HttpException('用户未认证', HttpStatus.UNAUTHORIZED);
    }
    return this.materialService.getMaterials(req.user.id, query);
  }

  @Get('materials/stats')
  @ApiOperation({ summary: '获取素材统计' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMaterialStats(@Request() req) {
    console.log('getMaterialStats called, user:', req.user);
    if (!req.user || !req.user.id) {
      throw new HttpException('用户未认证', HttpStatus.UNAUTHORIZED);
    }
    return this.materialService.getMaterialStats(req.user.id);
  }

  @Get('materials/categories')
  @ApiOperation({ summary: '获取素材分类列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMaterialCategories(@Request() req) {
    console.log('getMaterialCategories called, user:', req.user);
    if (!req.user || !req.user.id) {
      throw new HttpException('用户未认证', HttpStatus.UNAUTHORIZED);
    }
    return this.materialService.getMaterialCategories(req.user.id);
  }

  @Get('materials/tags')
  @ApiOperation({ summary: '获取素材标签列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMaterialTags(@Request() req) {
    console.log('getMaterialTags called, user:', req.user);
    if (!req.user || !req.user.id) {
      throw new HttpException('用户未认证', HttpStatus.UNAUTHORIZED);
    }
    return this.materialService.getMaterialTags(req.user.id);
  }

  @Get('materials/storage/quota')
  @ApiOperation({ summary: '获取存储配额信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getStorageQuota(@Request() req) {
    return this.materialService.getStorageQuota(req.user.id);
  }

  @Post('materials')
  @ApiOperation({ summary: '创建素材' })
  @ApiBody({ type: CreateMaterialDto })
  @ApiResponse({ status: 201, description: '创建成功' })
  async createMaterial(@Request() req, @Body(ValidationPipe) dto: CreateMaterialDto) {
    return this.materialService.createMaterial(req.user.id, dto);
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

  @Delete('materials/references/:referenceId')
  @ApiOperation({ summary: '删除素材引用记录' })
  @ApiParam({ name: 'referenceId', description: '引用记录ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @HttpCode(HttpStatus.OK)
  async deleteMaterialReference(@Request() req, @Param('referenceId') referenceId: string) {
    return this.materialService.deleteMaterialReference(req.user.id, referenceId);
  }

  // ===== 参数化路由（必须在具体路由之后） =====
  
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

  // ===== 素材分析功能 =====
  @Post('materials/:id/analyze/style')
  @ApiOperation({ summary: '分析素材写作风格' })
  @ApiParam({ name: 'id', description: '素材ID' })
  @ApiBody({ type: AnalyzeMaterialDto })
  @ApiResponse({ status: 200, description: '分析成功' })
  async analyzeMaterialStyle(
    @Request() req,
    @Param('id') id: string,
    @Body(ValidationPipe) dto: AnalyzeMaterialDto,
  ) {
    return this.materialService.analyzeMaterialStyle(req.user.id, id, dto.analysisType);
  }

  @Post('materials/:id/analyze/structure')
  @ApiOperation({ summary: '分析素材情节结构' })
  @ApiParam({ name: 'id', description: '素材ID' })
  @ApiBody({ type: AnalyzeMaterialDto })
  @ApiResponse({ status: 200, description: '分析成功' })
  async analyzeMaterialStructure(
    @Request() req,
    @Param('id') id: string,
    @Body(ValidationPipe) dto: AnalyzeMaterialDto,
  ) {
    return this.materialService.analyzeMaterialStyle(req.user.id, id, 'structure');
  }

  @Post('materials/:id/analyze/characters')
  @ApiOperation({ summary: '分析素材角色特征' })
  @ApiParam({ name: 'id', description: '素材ID' })
  @ApiBody({ type: AnalyzeMaterialDto })
  @ApiResponse({ status: 200, description: '分析成功' })
  async analyzeMaterialCharacters(
    @Request() req,
    @Param('id') id: string,
    @Body(ValidationPipe) dto: AnalyzeMaterialDto,
  ) {
    return this.materialService.analyzeMaterialStyle(req.user.id, id, 'characters');
  }

  @Post('materials/:id/check-similarity')
  @ApiOperation({ summary: '检测内容相似度' })
  @ApiParam({ name: 'id', description: '素材ID' })
  @ApiBody({ type: CheckSimilarityDto })
  @ApiResponse({ status: 200, description: '检测成功' })
  async checkSimilarity(
    @Request() req,
    @Param('id') id: string,
    @Body(ValidationPipe) dto: CheckSimilarityDto,
  ) {
    return this.materialService.checkSimilarity(
      req.user.id,
      id,
      dto.content,
      dto.threshold || 0.7,
    );
  }

  // ===== 素材推荐和搜索 =====
  @Get('materials/recommendations')
  @ApiOperation({ summary: '获取推荐素材' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getRecommendedMaterials(
    @Request() req,
    @Query('limit') limit?: number,
  ) {
    return this.materialService.getRecommendedMaterials(req.user.id, limit || 10);
  }

  @Get('materials/search-for-wizard')
  @ApiOperation({ summary: '搜索适用于向导的素材' })
  @ApiResponse({ status: 200, description: '搜索成功' })
  async searchWizardMaterials(
    @Request() req,
    @Query(ValidationPipe) query: SearchWizardMaterialsDto,
  ) {
    return this.materialService.searchWizardMaterials(
      req.user.id,
      query.stepType,
      query.keyword,
      query.limit || 5,
    );
  }
}
