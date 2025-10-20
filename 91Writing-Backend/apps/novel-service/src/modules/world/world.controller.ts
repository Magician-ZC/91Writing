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
import { WorldService } from './world.service';
import {
  CreateWorldSettingDto,
  UpdateWorldSettingDto,
  QueryWorldSettingsDto,
} from '../../dto/world.dto';

@ApiTags('世界观管理')
@ApiBearerAuth('JWT-auth')
@Controller()
@UseGuards(JwtAuthGuard)
export class WorldController {
  constructor(private readonly worldService: WorldService) {}

  @Post('world-settings')
  @ApiOperation({ summary: '创建世界观设定' })
  @ApiBody({ type: CreateWorldSettingDto })
  @ApiResponse({ status: 201, description: '创建成功' })
  async createWorldSetting(@Request() req, @Body(ValidationPipe) dto: CreateWorldSettingDto) {
    return this.worldService.createWorldSetting(req.user.id, dto);
  }

  @Get('world-settings/novel/:novelId')
  @ApiOperation({ summary: '获取小说世界观设定列表' })
  @ApiParam({ name: 'novelId', description: '小说ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getWorldSettings(
    @Request() req,
    @Param('novelId') novelId: string,
    @Query(ValidationPipe) query: QueryWorldSettingsDto,
  ) {
    return this.worldService.getWorldSettings(req.user.id, novelId, query);
  }

  @Get('world-settings/:id')
  @ApiOperation({ summary: '获取世界观设定详情' })
  @ApiParam({ name: 'id', description: '设定ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getWorldSetting(@Request() req, @Param('id') id: string) {
    return this.worldService.getWorldSetting(req.user.id, id);
  }

  @Put('world-settings/:id')
  @ApiOperation({ summary: '更新世界观设定' })
  @ApiParam({ name: 'id', description: '设定ID' })
  @ApiBody({ type: UpdateWorldSettingDto })
  @ApiResponse({ status: 200, description: '更新成功' })
  @HttpCode(HttpStatus.OK)
  async updateWorldSetting(
    @Request() req,
    @Param('id') id: string,
    @Body(ValidationPipe) dto: UpdateWorldSettingDto,
  ) {
    return this.worldService.updateWorldSetting(req.user.id, id, dto);
  }

  @Delete('world-settings/:id')
  @ApiOperation({ summary: '删除世界观设定' })
  @ApiParam({ name: 'id', description: '设定ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @HttpCode(HttpStatus.OK)
  async deleteWorldSetting(@Request() req, @Param('id') id: string) {
    return this.worldService.deleteWorldSetting(req.user.id, id);
  }
}

