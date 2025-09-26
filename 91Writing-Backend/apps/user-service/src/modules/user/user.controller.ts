import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UpdateUserDto, UpdatePasswordDto } from '../../dto/update-user.dto';
import { QueryUserDto, UserStatsDto } from '../../dto/query-user.dto';
import { 
  UserResponseDto, 
  UserListResponseDto, 
  UserStatsResponseDto,
  UserProfileResponseDto 
} from '../../dto/user-response.dto';
import { JwtAuthGuard } from '@app/common';

@ApiTags('用户管理')
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ 
    summary: '创建用户',
    description: '创建新用户账户，包含基本信息验证和密码哈希处理'
  })
  @ApiResponse({
    status: 201,
    description: '用户创建成功',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: '邮箱已被注册',
  })
  @ApiResponse({
    status: 400,
    description: '数据验证失败',
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '获取用户列表',
    description: '分页查询用户列表，支持搜索、过滤和排序'
  })
  @ApiResponse({
    status: 200,
    description: '用户列表查询成功',
    type: UserListResponseDto,
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '页码，默认为1' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '每页数量，默认为10' })
  @ApiQuery({ name: 'search', required: false, type: String, description: '搜索关键词（邮箱或昵称）' })
  @ApiQuery({ name: 'role', required: false, enum: ['USER', 'ADMIN', 'MODERATOR'], description: '用户角色过滤' })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'INACTIVE', 'BANNED'], description: '用户状态过滤' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: '是否激活' })
  @ApiQuery({ name: 'tenantId', required: false, type: String, description: '租户ID过滤' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: '排序字段' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: '排序方向' })
  async findAll(@Query() queryDto: QueryUserDto): Promise<UserListResponseDto> {
    return this.userService.findMany(queryDto);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '获取用户统计信息',
    description: '获取用户总数、活跃用户数、新用户数等统计信息'
  })
  @ApiResponse({
    status: 200,
    description: '统计信息获取成功',
    type: UserStatsResponseDto,
  })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: '结束日期' })
  @ApiQuery({ name: 'tenantId', required: false, type: String, description: '租户ID' })
  async getStats(@Query() statsDto: UserStatsDto): Promise<UserStatsResponseDto> {
    return this.userService.getStats(statsDto);
  }

  @Get('email/:email')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '根据邮箱查询用户',
    description: '通过邮箱地址查询用户信息'
  })
  @ApiParam({ name: 'email', description: '用户邮箱地址' })
  @ApiResponse({
    status: 200,
    description: '用户信息获取成功',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '用户不存在',
  })
  async findByEmail(@Param('email') email: string): Promise<UserResponseDto> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new Error('用户不存在');
    }
    return user;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '获取用户详情',
    description: '根据用户ID获取用户详细信息，包含配置和订阅信息'
  })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({
    status: 200,
    description: '用户详情获取成功',
    type: UserProfileResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '用户不存在',
  })
  async findOne(@Param('id') id: string): Promise<UserProfileResponseDto> {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '更新用户信息',
    description: '更新用户基本信息，不包括密码和邮箱'
  })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({
    status: 200,
    description: '用户信息更新成功',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '用户不存在',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(id, updateUserDto);
  }

  @Patch(':id/password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '更新用户密码',
    description: '更新用户密码，需要验证当前密码'
  })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({
    status: 200,
    description: '密码更新成功',
  })
  @ApiResponse({
    status: 400,
    description: '当前密码不正确',
  })
  @ApiResponse({
    status: 404,
    description: '用户不存在',
  })
  @HttpCode(HttpStatus.OK)
  async updatePassword(
    @Param('id') id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<{ message: string }> {
    await this.userService.updatePassword(id, updatePasswordDto);
    return { message: '密码更新成功' };
  }

  @Patch(':id/last-login')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '更新最后登录时间',
    description: '更新用户的最后登录时间戳'
  })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({
    status: 200,
    description: '最后登录时间更新成功',
  })
  @ApiResponse({
    status: 404,
    description: '用户不存在',
  })
  @HttpCode(HttpStatus.OK)
  async updateLastLogin(@Param('id') id: string): Promise<{ message: string }> {
    await this.userService.updateLastLogin(id);
    return { message: '最后登录时间更新成功' };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '软删除用户',
    description: '软删除用户，将用户状态设置为非活跃'
  })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({
    status: 200,
    description: '用户删除成功',
  })
  @ApiResponse({
    status: 404,
    description: '用户不存在',
  })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.userService.remove(id);
    return { message: '用户删除成功' };
  }

  @Delete(':id/hard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '永久删除用户',
    description: '永久删除用户及其所有相关数据，此操作不可恢复'
  })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({
    status: 200,
    description: '用户永久删除成功',
  })
  @ApiResponse({
    status: 404,
    description: '用户不存在',
  })
  @HttpCode(HttpStatus.OK)
  async hardDelete(@Param('id') id: string): Promise<{ message: string }> {
    await this.userService.hardDelete(id);
    return { message: '用户永久删除成功' };
  }
}
