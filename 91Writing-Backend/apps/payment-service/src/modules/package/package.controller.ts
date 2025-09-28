import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PackageService } from './package.service';
import { CreatePackageDto } from '../../dto/create-package.dto';
import { UpdatePackageDto } from '../../dto/update-package.dto';
import { QueryPackageDto } from '../../dto/query-package.dto';
import { JwtAuthGuard } from '@app/auth';
import { Roles, RolesGuard } from '@app/auth';
import { UserRole } from '@prisma/client';

@ApiTags('套餐管理')
@ApiBearerAuth()
@Controller('packages')
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '创建套餐' })
  @ApiResponse({ status: 201, description: '套餐创建成功' })
  create(@Body() createPackageDto: CreatePackageDto) {
    return this.packageService.create(createPackageDto);
  }

  @Get()
  @ApiOperation({ summary: '获取套餐列表' })
  @ApiResponse({ status: 200, description: '套餐列表获取成功' })
  findAll(@Query() query: QueryPackageDto) {
    return this.packageService.findAll(query);
  }

  @Get('active')
  @ApiOperation({ summary: '获取可用套餐列表' })
  @ApiResponse({ status: 200, description: '可用套餐列表获取成功' })
  findActive() {
    return this.packageService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取套餐详情' })
  @ApiResponse({ status: 200, description: '套餐详情获取成功' })
  findOne(@Param('id') id: string) {
    return this.packageService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '更新套餐' })
  @ApiResponse({ status: 200, description: '套餐更新成功' })
  update(@Param('id') id: string, @Body() updatePackageDto: UpdatePackageDto) {
    return this.packageService.update(+id, updatePackageDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '删除套餐' })
  @ApiResponse({ status: 200, description: '套餐删除成功' })
  remove(@Param('id') id: string) {
    return this.packageService.remove(+id);
  }
}
