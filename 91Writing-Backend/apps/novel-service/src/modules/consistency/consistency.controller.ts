import { Controller, Get, Post, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/common';
import { ConsistencyService } from './consistency.service';
import {
  CreateConsistencyProfileDto,
  UpdateConsistencyProfileDto,
  ConsistencyProfileResponseDto,
  AutoExtractConsistencyDto,
} from '../../dto/consistency.dto';

@ApiTags('一致性配置')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ConsistencyController {
  constructor(private readonly consistencyService: ConsistencyService) {}

  @Post()
  @ApiOperation({ summary: '创建一致性配置' })
  @ApiResponse({ status: 201, description: '创建成功', type: ConsistencyProfileResponseDto })
  async create(
    @Req() req: any,
    @Body() dto: CreateConsistencyProfileDto,
  ): Promise<ConsistencyProfileResponseDto> {
    const userId = req.user.userId;
    return this.consistencyService.create(dto, userId);
  }

  @Get(':novelId')
  @ApiOperation({ summary: '获取一致性配置' })
  @ApiResponse({ status: 200, description: '获取成功', type: ConsistencyProfileResponseDto })
  async findOne(
    @Req() req: any,
    @Param('novelId') novelId: string,
  ): Promise<ConsistencyProfileResponseDto> {
    const userId = req.user.userId;
    return this.consistencyService.findOne(novelId, userId);
  }

  @Put(':novelId')
  @ApiOperation({ summary: '更新一致性配置' })
  @ApiResponse({ status: 200, description: '更新成功', type: ConsistencyProfileResponseDto })
  async update(
    @Req() req: any,
    @Param('novelId') novelId: string,
    @Body() dto: UpdateConsistencyProfileDto,
  ): Promise<ConsistencyProfileResponseDto> {
    const userId = req.user.userId;
    return this.consistencyService.update(novelId, dto, userId);
  }

  @Post('auto-extract')
  @ApiOperation({ summary: '自动提取一致性配置' })
  @ApiResponse({ status: 200, description: '提取成功', type: ConsistencyProfileResponseDto })
  async autoExtract(
    @Req() req: any,
    @Body() dto: AutoExtractConsistencyDto,
  ): Promise<ConsistencyProfileResponseDto> {
    const userId = req.user.userId;
    return this.consistencyService.autoExtract(dto, userId);
  }
}

