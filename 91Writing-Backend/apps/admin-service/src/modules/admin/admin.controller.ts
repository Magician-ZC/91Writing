import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
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
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { RoleGuard } from './guards/role.guard';
import { Roles } from './decorators/roles.decorator';
import {
  AdminStatsDto,
  UserManagementDto,
  SubscriptionManagementDto,
  SystemConfigDto,
  OrderManagementDto,
} from './dto/admin.dto';

@ApiTags('管理员功能')
@ApiBearerAuth('JWT-auth')
@UseGuards(AdminAuthGuard, RoleGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ============= 仪表盘统计 =============
  @Get('dashboard/stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: '获取仪表盘统计数据' })
  @ApiResponse({ status: 200, description: '统计数据获取成功' })
  @ApiQuery({ name: 'period', required: false, enum: ['day', 'week', 'month', 'year'], description: '统计周期' })
  async getDashboardStats(@Query() query: AdminStatsDto) {
    return this.adminService.getDashboardStats(query);
  }

  @Get('dashboard/charts')
  @Roles('ADMIN')
  @ApiOperation({ summary: '获取图表数据' })
  @ApiResponse({ status: 200, description: '图表数据获取成功' })
  async getChartData(@Query() query: AdminStatsDto) {
    return this.adminService.getChartData(query);
  }

  // ============= 用户管理 =============
  @Get('users')
  @Roles('ADMIN')
  @ApiOperation({ summary: '获取用户列表' })
  @ApiResponse({ status: 200, description: '用户列表获取成功' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '每页数量' })
  @ApiQuery({ name: 'search', required: false, type: String, description: '搜索关键词' })
  @ApiQuery({ name: 'role', required: false, enum: ['USER', 'ADMIN', 'MODERATOR'], description: '角色过滤' })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'INACTIVE', 'BANNED'], description: '状态过滤' })
  async getUsers(@Query() query: UserManagementDto) {
    return this.adminService.getUsers(query);
  }

  @Get('users/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: '获取用户详情' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '用户详情获取成功' })
  async getUserDetail(@Param('id') id: string) {
    return this.adminService.getUserDetail(id);
  }

  @Put('users/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: '更新用户信息' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '用户信息更新成功' })
  async updateUser(@Param('id') id: string, @Body() updateData: any) {
    return this.adminService.updateUser(id, updateData);
  }

  @Post('users/:id/ban')
  @Roles('ADMIN')
  @ApiOperation({ summary: '封禁用户' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '用户封禁成功' })
  @HttpCode(HttpStatus.OK)
  async banUser(@Param('id') id: string, @Body() banData: { reason: string; duration?: number }) {
    return this.adminService.banUser(id, banData);
  }

  @Post('users/:id/unban')
  @Roles('ADMIN')
  @ApiOperation({ summary: '解封用户' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '用户解封成功' })
  @HttpCode(HttpStatus.OK)
  async unbanUser(@Param('id') id: string) {
    return this.adminService.unbanUser(id);
  }

  // ============= 订阅管理 =============
  @Get('subscriptions')
  @Roles('ADMIN')
  @ApiOperation({ summary: '获取订阅列表' })
  @ApiResponse({ status: 200, description: '订阅列表获取成功' })
  async getSubscriptions(@Query() query: SubscriptionManagementDto) {
    return this.adminService.getSubscriptions(query);
  }

  @Get('subscriptions/stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: '获取订阅统计' })
  @ApiResponse({ status: 200, description: '订阅统计获取成功' })
  async getSubscriptionStats(@Query() query: AdminStatsDto) {
    return this.adminService.getSubscriptionStats(query);
  }

  @Put('subscriptions/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: '更新订阅信息' })
  @ApiParam({ name: 'id', description: '订阅ID' })
  @ApiResponse({ status: 200, description: '订阅信息更新成功' })
  async updateSubscription(@Param('id') id: string, @Body() updateData: any) {
    return this.adminService.updateSubscription(id, updateData);
  }

  @Post('subscriptions/:id/extend')
  @Roles('ADMIN')
  @ApiOperation({ summary: '延长订阅' })
  @ApiParam({ name: 'id', description: '订阅ID' })
  @ApiResponse({ status: 200, description: '订阅延长成功' })
  @HttpCode(HttpStatus.OK)
  async extendSubscription(@Param('id') id: string, @Body() extendData: { days: number; reason: string }) {
    return this.adminService.extendSubscription(id, extendData);
  }

  // ============= 支付订单管理 =============
  @Get('orders')
  @Roles('ADMIN')
  @ApiOperation({ summary: '获取支付订单列表' })
  @ApiResponse({ status: 200, description: '订单列表获取成功' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '每页数量' })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED'], description: '订单状态过滤' })
  @ApiQuery({ name: 'paymentMethod', required: false, enum: ['ALIPAY', 'WECHAT', 'STRIPE', 'PAYPAL'], description: '支付方式过滤' })
  @ApiQuery({ name: 'userId', required: false, type: String, description: '用户ID过滤' })
  async getOrders(@Query() query: OrderManagementDto) {
    return this.adminService.getOrders(query);
  }

  @Get('orders/stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: '获取支付统计' })
  @ApiResponse({ status: 200, description: '支付统计获取成功' })
  async getPaymentStats(@Query() query: AdminStatsDto) {
    return this.adminService.getPaymentStats(query);
  }

  @Post('orders/:orderNo/refund')
  @Roles('ADMIN')
  @ApiOperation({ summary: '处理退款' })
  @ApiParam({ name: 'orderNo', description: '订单号' })
  @ApiResponse({ status: 200, description: '退款处理成功' })
  @HttpCode(HttpStatus.OK)
  async processRefund(@Param('orderNo') orderNo: string, @Body() refundData: { reason: string; amount?: number }) {
    return this.adminService.processRefund(orderNo, refundData);
  }

  // ============= 系统配置 =============
  @Get('system/config')
  @Roles('ADMIN')
  @ApiOperation({ summary: '获取系统配置' })
  @ApiResponse({ status: 200, description: '系统配置获取成功' })
  async getSystemConfig() {
    return this.adminService.getSystemConfig();
  }

  @Put('system/config')
  @Roles('ADMIN')
  @ApiOperation({ summary: '更新系统配置' })
  @ApiResponse({ status: 200, description: '系统配置更新成功' })
  async updateSystemConfig(@Body() configData: SystemConfigDto) {
    return this.adminService.updateSystemConfig(configData);
  }

  @Get('system/logs')
  @Roles('ADMIN')
  @ApiOperation({ summary: '获取系统日志' })
  @ApiResponse({ status: 200, description: '系统日志获取成功' })
  async getSystemLogs(@Query() query: any) {
    return this.adminService.getSystemLogs(query);
  }

  // ============= 套餐管理 =============
  @Get('packages')
  @Roles('ADMIN')
  @ApiOperation({ summary: '获取套餐列表' })
  @ApiResponse({ status: 200, description: '套餐列表获取成功' })
  async getPackages() {
    return this.adminService.getPackages();
  }

  @Post('packages')
  @Roles('ADMIN')
  @ApiOperation({ summary: '创建套餐' })
  @ApiResponse({ status: 201, description: '套餐创建成功' })
  async createPackage(@Body() packageData: any) {
    return this.adminService.createPackage(packageData);
  }

  @Put('packages/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: '更新套餐' })
  @ApiParam({ name: 'id', description: '套餐ID' })
  @ApiResponse({ status: 200, description: '套餐更新成功' })
  async updatePackage(@Param('id') id: string, @Body() updateData: any) {
    return this.adminService.updatePackage(parseInt(id), updateData);
  }

  @Delete('packages/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: '删除套餐' })
  @ApiParam({ name: 'id', description: '套餐ID' })
  @ApiResponse({ status: 200, description: '套餐删除成功' })
  @HttpCode(HttpStatus.OK)
  async deletePackage(@Param('id') id: string) {
    return this.adminService.deletePackage(parseInt(id));
  }
}