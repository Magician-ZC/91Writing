import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
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
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/common';
import { CharacterConsistencyService } from './character-consistency.service';
import { ExtractFeaturesDto } from './dto/extract-features.dto';

@ApiTags('角色一致性')
@Controller()  // ⚠️ 微服务不添加前缀
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CharacterConsistencyController {
  constructor(
    private readonly characterConsistencyService: CharacterConsistencyService
  ) {}

  @Post('characters/:characterId/features/extract')
  @ApiOperation({ summary: 'AI提取角色特征' })
  @ApiParam({ name: 'characterId', description: '角色ID' })
  @ApiResponse({ status: 201, description: '提取成功' })
  @ApiResponse({ status: 404, description: '角色或章节不存在' })
  @HttpCode(HttpStatus.CREATED)
  async extractFeatures(
    @Request() req,
    @Param('characterId') characterId: string,
    @Body(ValidationPipe) extractDto: ExtractFeaturesDto,
  ) {
    return this.characterConsistencyService.extractFeatures(
      req.user.id,
      characterId,
      extractDto,
    );
  }

  @Get('characters/:characterId/features')
  @ApiOperation({ summary: '获取角色特征列表' })
  @ApiParam({ name: 'characterId', description: '角色ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getFeatures(
    @Request() req,
    @Param('characterId') characterId: string,
  ) {
    return this.characterConsistencyService.getFeatures(req.user.id, characterId);
  }

  @Get('characters/:characterId/statistics')
  @ApiOperation({ summary: '获取角色统计信息' })
  @ApiParam({ name: 'characterId', description: '角色ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getStatistics(
    @Request() req,
    @Param('characterId') characterId: string,
  ) {
    return this.characterConsistencyService.getStatistics(req.user.id, characterId);
  }

  @Get('characters/:characterId/warnings')
  @ApiOperation({ summary: '获取角色一致性警告' })
  @ApiParam({ name: 'characterId', description: '角色ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getWarnings(
    @Request() req,
    @Param('characterId') characterId: string,
  ) {
    return this.characterConsistencyService.getWarnings(req.user.id, characterId);
  }

  @Post('chapters/:chapterId/check-consistency')
  @ApiOperation({ summary: '检查章节中的角色一致性' })
  @ApiParam({ name: 'chapterId', description: '章节ID' })
  @ApiResponse({ status: 201, description: '检查完成' })
  @HttpCode(HttpStatus.OK)
  async checkConsistency(
    @Request() req,
    @Param('chapterId') chapterId: string,
  ) {
    return this.characterConsistencyService.checkConsistency(req.user.id, chapterId);
  }
}

