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
import { CharacterService } from './character.service';
import {
  CreateCharacterDto,
  UpdateCharacterDto,
  QueryCharactersDto,
} from '../../dto/character.dto';

@ApiTags('角色管理')
@ApiBearerAuth('JWT-auth')
@Controller()
@UseGuards(JwtAuthGuard)
export class CharacterController {
  constructor(private readonly characterService: CharacterService) {}

  @Post('characters')
  @ApiOperation({ summary: '创建角色' })
  @ApiBody({ type: CreateCharacterDto })
  @ApiResponse({ status: 201, description: '创建成功' })
  async createCharacter(@Request() req, @Body(ValidationPipe) dto: CreateCharacterDto) {
    return this.characterService.createCharacter(req.user.id, dto);
  }

  @Get('characters/novel/:novelId')
  @ApiOperation({ summary: '获取小说角色列表' })
  @ApiParam({ name: 'novelId', description: '小说ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCharacters(
    @Request() req,
    @Param('novelId') novelId: string,
    @Query(ValidationPipe) query: QueryCharactersDto,
  ) {
    return this.characterService.getCharacters(req.user.id, novelId, query);
  }

  @Get('characters/:id')
  @ApiOperation({ summary: '获取角色详情' })
  @ApiParam({ name: 'id', description: '角色ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCharacter(@Request() req, @Param('id') id: string) {
    return this.characterService.getCharacter(req.user.id, id);
  }

  @Put('characters/:id')
  @ApiOperation({ summary: '更新角色' })
  @ApiParam({ name: 'id', description: '角色ID' })
  @ApiBody({ type: UpdateCharacterDto })
  @ApiResponse({ status: 200, description: '更新成功' })
  @HttpCode(HttpStatus.OK)
  async updateCharacter(
    @Request() req,
    @Param('id') id: string,
    @Body(ValidationPipe) dto: UpdateCharacterDto,
  ) {
    return this.characterService.updateCharacter(req.user.id, id, dto);
  }

  @Delete('characters/:id')
  @ApiOperation({ summary: '删除角色' })
  @ApiParam({ name: 'id', description: '角色ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @HttpCode(HttpStatus.OK)
  async deleteCharacter(@Request() req, @Param('id') id: string) {
    return this.characterService.deleteCharacter(req.user.id, id);
  }
}

