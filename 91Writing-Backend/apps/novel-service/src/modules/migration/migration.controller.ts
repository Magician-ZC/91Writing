import {
  Controller,
  Get,
  Post,
  Body,
  Param,
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
import { MigrationService } from './migration.service';
import {
  StartMigrationDto,
  BatchImportNovelsDto,
  ValidateMigrationDataDto,
} from '../../dto/migration.dto';

@ApiTags('数据迁移')
@ApiBearerAuth('JWT-auth')
@Controller()
@UseGuards(JwtAuthGuard)
export class MigrationController {
  constructor(private readonly migrationService: MigrationService) {}

  @Post('migrations/start')
  @ApiOperation({
    summary: '开始数据迁移',
    description: '从本地数据迁移到云端'
  })
  @ApiBody({ type: StartMigrationDto })
  @ApiResponse({ status: 201, description: '迁移开始' })
  async startMigration(@Request() req, @Body(ValidationPipe) dto: StartMigrationDto) {
    return this.migrationService.startMigration(req.user.id, dto);
  }

  @Post('migrations/batch-import-novels')
  @ApiOperation({
    summary: '批量导入小说',
    description: '一次性导入多部小说及其章节'
  })
  @ApiBody({ type: BatchImportNovelsDto })
  @ApiResponse({ status: 201, description: '导入成功' })
  async batchImportNovels(@Request() req, @Body(ValidationPipe) dto: BatchImportNovelsDto) {
    return this.migrationService.batchImportNovels(req.user.id, dto);
  }

  @Post('migrations/validate')
  @ApiOperation({
    summary: '验证迁移数据',
    description: '在迁移前验证数据格式和完整性'
  })
  @ApiBody({ type: ValidateMigrationDataDto })
  @ApiResponse({ status: 200, description: '验证完成' })
  @HttpCode(HttpStatus.OK)
  async validateData(@Request() req, @Body(ValidationPipe) dto: ValidateMigrationDataDto) {
    return this.migrationService.validateMigrationData(req.user.id, dto);
  }

  @Get('migrations/history')
  @ApiOperation({
    summary: '获取迁移历史',
    description: '查看历史迁移记录'
  })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMigrationHistory(@Request() req) {
    return this.migrationService.getMigrationHistory(req.user.id);
  }

  @Get('migrations/:id')
  @ApiOperation({
    summary: '获取迁移详情',
    description: '查看单次迁移的详细信息'
  })
  @ApiParam({ name: 'id', description: '迁移ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMigrationDetail(@Request() req, @Param('id') id: string) {
    return this.migrationService.getMigrationDetail(req.user.id, id);
  }

  @Post('migrations/:id/rollback')
  @ApiOperation({
    summary: '回滚迁移',
    description: '回滚指定的迁移操作'
  })
  @ApiParam({ name: 'id', description: '迁移ID' })
  @ApiResponse({ status: 200, description: '回滚成功' })
  @HttpCode(HttpStatus.OK)
  async rollbackMigration(@Request() req, @Param('id') id: string) {
    return this.migrationService.rollbackMigration(req.user.id, id);
  }
}

