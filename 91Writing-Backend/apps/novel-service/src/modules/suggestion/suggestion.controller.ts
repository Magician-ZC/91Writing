import {
  Controller,
  Get,
  Post,
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
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/common/guards';
import { SuggestionService } from './suggestion.service';
import {
  CreateSuggestionDto,
  GenerateSuggestionsDto,
  QuerySuggestionsDto,
  AdoptSuggestionDto,
  RateSuggestionDto,
  BulkSuggestionDto,
} from '../../dto/suggestion.dto';

@ApiTags('写作建议')
@ApiBearerAuth('JWT-auth')
@Controller()
@UseGuards(JwtAuthGuard)
export class SuggestionController {
  constructor(private readonly suggestionService: SuggestionService) {}

  @Post('suggestions')
  @ApiOperation({
    summary: '创建写作建议',
    description: '手动创建一条写作建议'
  })
  @ApiBody({ type: CreateSuggestionDto })
  @ApiResponse({
    status: 201,
    description: '建议创建成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            content: { type: 'string' },
            dimension: { type: 'string', example: 'PLOT' },
            priority: { type: 'number', example: 75 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: '参数验证失败' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 404, description: '小说不存在' })
  async createSuggestion(
    @Request() req,
    @Body(ValidationPipe) dto: CreateSuggestionDto
  ) {
    return this.suggestionService.createSuggestion(req.user.id, dto);
  }

  @Post('suggestions/generate')
  @ApiOperation({
    summary: 'AI生成写作建议',
    description: '使用AI分析小说内容并生成多维度的写作建议'
  })
  @ApiBody({ type: GenerateSuggestionsDto })
  @ApiResponse({
    status: 201,
    description: '建议生成成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            generated: { type: 'number', example: 5 },
            suggestions: {
              type: 'array',
              items: { type: 'object' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: '参数验证失败' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 404, description: '小说不存在' })
  async generateSuggestions(
    @Request() req,
    @Body(ValidationPipe) dto: GenerateSuggestionsDto
  ) {
    return this.suggestionService.generateSuggestions(req.user.id, dto);
  }

  @Get('suggestions/novel/:novelId')
  @ApiOperation({
    summary: '获取小说的建议列表',
    description: '获取指定小说的所有写作建议，支持筛选和分页'
  })
  @ApiParam({ name: 'novelId', description: '小说ID' })
  @ApiQuery({ name: 'suggestionType', required: false, description: '建议类型' })
  @ApiQuery({ name: 'dimension', required: false, description: '建议维度' })
  @ApiQuery({ name: 'onlyPending', required: false, description: '只显示未采纳' })
  @ApiQuery({ name: 'minPriority', required: false, description: '最小优先级' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { type: 'object' }
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number' },
                pageSize: { type: 'number' },
                total: { type: 'number' },
                totalPages: { type: 'number' }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 404, description: '小说不存在' })
  async getSuggestions(
    @Request() req,
    @Param('novelId') novelId: string,
    @Query(ValidationPipe) query: QuerySuggestionsDto
  ) {
    return this.suggestionService.getSuggestions(req.user.id, novelId, query);
  }

  @Get('suggestions/:id')
  @ApiOperation({
    summary: '获取单个建议',
    description: '获取指定ID的建议详情'
  })
  @ApiParam({ name: 'id', description: '建议ID' })
  @ApiResponse({
    status: 200,
    description: '获取成功'
  })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 403, description: '无权访问' })
  @ApiResponse({ status: 404, description: '建议不存在' })
  async getSuggestion(
    @Request() req,
    @Param('id') id: string
  ) {
    return this.suggestionService.getSuggestion(req.user.id, id);
  }

  @Post('suggestions/adopt')
  @ApiOperation({
    summary: '采纳建议',
    description: '标记建议为已采纳，并可以提供反馈和评分'
  })
  @ApiBody({ type: AdoptSuggestionDto })
  @ApiResponse({
    status: 200,
    description: '采纳成功'
  })
  @ApiResponse({ status: 400, description: '参数验证失败' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 404, description: '建议不存在' })
  @HttpCode(HttpStatus.OK)
  async adoptSuggestion(
    @Request() req,
    @Body(ValidationPipe) dto: AdoptSuggestionDto
  ) {
    return this.suggestionService.adoptSuggestion(req.user.id, dto);
  }

  @Post('suggestions/rate')
  @ApiOperation({
    summary: '评价建议',
    description: '对建议进行评分和反馈'
  })
  @ApiBody({ type: RateSuggestionDto })
  @ApiResponse({
    status: 200,
    description: '评价成功'
  })
  @ApiResponse({ status: 400, description: '参数验证失败' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 404, description: '建议不存在' })
  @HttpCode(HttpStatus.OK)
  async rateSuggestion(
    @Request() req,
    @Body(ValidationPipe) dto: RateSuggestionDto
  ) {
    return this.suggestionService.rateSuggestion(req.user.id, dto);
  }

  @Delete('suggestions/:id')
  @ApiOperation({
    summary: '删除建议',
    description: '删除指定的建议'
  })
  @ApiParam({ name: 'id', description: '建议ID' })
  @ApiResponse({
    status: 200,
    description: '删除成功'
  })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 403, description: '无权删除' })
  @ApiResponse({ status: 404, description: '建议不存在' })
  @HttpCode(HttpStatus.OK)
  async deleteSuggestion(
    @Request() req,
    @Param('id') id: string
  ) {
    return this.suggestionService.deleteSuggestion(req.user.id, id);
  }

  @Post('suggestions/novel/:novelId/bulk-delete')
  @ApiOperation({
    summary: '批量删除建议',
    description: '批量删除指定小说的多条建议'
  })
  @ApiParam({ name: 'novelId', description: '小说ID' })
  @ApiBody({ type: BulkSuggestionDto })
  @ApiResponse({
    status: 200,
    description: '批量删除成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            deleted: { type: 'number', example: 5 }
          }
        },
        message: { type: 'string', example: '成功删除5条建议' }
      }
    }
  })
  @ApiResponse({ status: 400, description: '参数验证失败' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 404, description: '小说不存在' })
  @HttpCode(HttpStatus.OK)
  async bulkDeleteSuggestions(
    @Request() req,
    @Param('novelId') novelId: string,
    @Body(ValidationPipe) dto: BulkSuggestionDto
  ) {
    return this.suggestionService.bulkDeleteSuggestions(
      req.user.id,
      novelId,
      dto.suggestionIds,
    );
  }

  @Get('suggestions/novel/:novelId/stats')
  @ApiOperation({
    summary: '获取建议统计',
    description: '获取小说建议的统计信息'
  })
  @ApiParam({ name: 'novelId', description: '小说ID' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 42 },
            adopted: { type: 'number', example: 15 },
            pending: { type: 'number', example: 27 },
            adoptionRate: { type: 'string', example: '35.71%' },
            byDimension: {
              type: 'object',
              properties: {
                PLOT: { type: 'number' },
                CHARACTER: { type: 'number' },
                PACING: { type: 'number' }
              }
            },
            averageRating: { type: 'number', example: 4.2 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 404, description: '小说不存在' })
  async getSuggestionStats(
    @Request() req,
    @Param('novelId') novelId: string
  ) {
    return this.suggestionService.getSuggestionStats(req.user.id, novelId);
  }
}

