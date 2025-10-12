/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("@nestjs/swagger");

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),
/* 5 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const common_1 = __webpack_require__(2);
const config_1 = __webpack_require__(4);
const throttler_1 = __webpack_require__(6);
const cache_manager_1 = __webpack_require__(7);
const passport_1 = __webpack_require__(8);
const jwt_1 = __webpack_require__(9);
const database_1 = __webpack_require__(10);
const admin_module_1 = __webpack_require__(14);
const health_module_1 = __webpack_require__(24);
const analytics_module_1 = __webpack_require__(27);
const ai_config_module_1 = __webpack_require__(34);
const jwt_strategy_1 = __webpack_require__(40);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
            }),
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_SECRET', '91writing_default_secret'),
                    signOptions: {
                        expiresIn: configService.get('JWT_EXPIRES_IN', '7d'),
                    },
                }),
                inject: [config_1.ConfigService],
            }),
            throttler_1.ThrottlerModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => [
                    {
                        name: 'short',
                        ttl: 1000,
                        limit: 2,
                    },
                    {
                        name: 'medium',
                        ttl: 10000,
                        limit: 10,
                    },
                    {
                        name: 'long',
                        ttl: 60000,
                        limit: 30,
                    },
                ],
            }),
            cache_manager_1.CacheModule.registerAsync({
                isGlobal: true,
                inject: [config_1.ConfigService],
                useFactory: async (config) => ({
                    ttl: 600,
                    max: 500,
                }),
            }),
            database_1.DatabaseModule,
            admin_module_1.AdminModule,
            health_module_1.HealthModule,
            analytics_module_1.AnalyticsModule,
            ai_config_module_1.AIConfigModule,
        ],
        controllers: [],
        providers: [jwt_strategy_1.JwtStrategy],
    })
], AppModule);


/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("@nestjs/throttler");

/***/ }),
/* 7 */
/***/ ((module) => {

module.exports = require("@nestjs/cache-manager");

/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("@nestjs/passport");

/***/ }),
/* 9 */
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),
/* 10 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(11), exports);
__exportStar(__webpack_require__(12), exports);


/***/ }),
/* 11 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabaseModule = void 0;
const common_1 = __webpack_require__(2);
const config_1 = __webpack_require__(4);
const prisma_service_1 = __webpack_require__(12);
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [prisma_service_1.PrismaService],
        exports: [prisma_service_1.PrismaService],
    })
], DatabaseModule);


/***/ }),
/* 12 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PrismaService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PrismaService = void 0;
const common_1 = __webpack_require__(2);
const config_1 = __webpack_require__(4);
const client_1 = __webpack_require__(13);
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    constructor(configService) {
        super({
            datasources: {
                db: {
                    url: configService.get('DATABASE_URL', 'mysql://user:pass@localhost:3306/test'),
                },
            },
            log: ['info', 'warn', 'error'],
        });
        this.configService = configService;
        this.logger = new common_1.Logger(PrismaService_1.name);
    }
    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('数据库连接成功');
            await this.healthCheck();
        }
        catch (error) {
            this.logger.warn('数据库连接失败，应用将在无数据库模式下运行', error.message);
        }
    }
    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('数据库连接已断开');
    }
    async healthCheck() {
        try {
            await this.$queryRaw `SELECT 1`;
            return true;
        }
        catch (error) {
            this.logger.error('数据库健康检查失败', error);
            return false;
        }
    }
    async getDatabaseInfo() {
        try {
            const result = await this.$queryRaw `
        SELECT 
          VERSION() as version,
          DATABASE() as database_name,
          USER() as current_user,
          NOW() as current_time
      `;
            return result[0];
        }
        catch (error) {
            this.logger.error('获取数据库信息失败', error);
            throw error;
        }
    }
    async getTableStats() {
        try {
            const result = await this.$queryRaw `
        SELECT 
          table_name,
          table_rows,
          data_length,
          index_length,
          (data_length + index_length) as total_size
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()
        ORDER BY total_size DESC
      `;
            return result;
        }
        catch (error) {
            this.logger.error('获取表统计信息失败', error);
            throw error;
        }
    }
    async cleanupExpiredData() {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const deletedActivities = await this.userActivity.deleteMany({
                where: {
                    createdAt: {
                        lt: thirtyDaysAgo,
                    },
                },
            });
            const deletedAILogs = await this.aIUsageLog.deleteMany({
                where: {
                    createdAt: {
                        lt: thirtyDaysAgo,
                    },
                },
            });
            const expiredRewards = await this.inviteReward.updateMany({
                where: {
                    status: 'PENDING',
                    createdAt: {
                        lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    },
                },
                data: {
                    status: 'CANCELLED',
                },
            });
            this.logger.log(`数据清理完成: 
        - 用户活动日志: ${deletedActivities.count}条
        - AI使用日志: ${deletedAILogs.count}条  
        - 过期邀请奖励: ${expiredRewards.count}条`);
            return {
                deletedActivities: deletedActivities.count,
                deletedAILogs: deletedAILogs.count,
                expiredRewards: expiredRewards.count,
            };
        }
        catch (error) {
            this.logger.error('数据清理失败', error);
            throw error;
        }
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], PrismaService);


/***/ }),
/* 13 */
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),
/* 14 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminModule = void 0;
const common_1 = __webpack_require__(2);
const axios_1 = __webpack_require__(15);
const jwt_1 = __webpack_require__(9);
const config_1 = __webpack_require__(4);
const admin_controller_1 = __webpack_require__(16);
const admin_service_1 = __webpack_require__(17);
const admin_auth_guard_1 = __webpack_require__(18);
const role_guard_1 = __webpack_require__(19);
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule.register({
                timeout: 5000,
                maxRedirects: 5,
            }),
            jwt_1.JwtModule.registerAsync({
                inject: [config_1.ConfigService],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_SECRET'),
                    signOptions: {
                        expiresIn: configService.get('JWT_EXPIRES_IN', '7d'),
                    },
                }),
            }),
        ],
        controllers: [admin_controller_1.AdminController],
        providers: [admin_service_1.AdminService, admin_auth_guard_1.AdminAuthGuard, role_guard_1.RoleGuard],
        exports: [admin_service_1.AdminService, admin_auth_guard_1.AdminAuthGuard, role_guard_1.RoleGuard],
    })
], AdminModule);


/***/ }),
/* 15 */
/***/ ((module) => {

module.exports = require("@nestjs/axios");

/***/ }),
/* 16 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminController = void 0;
const common_1 = __webpack_require__(2);
const swagger_1 = __webpack_require__(3);
const admin_service_1 = __webpack_require__(17);
const admin_auth_guard_1 = __webpack_require__(18);
const role_guard_1 = __webpack_require__(19);
const roles_decorator_1 = __webpack_require__(20);
const admin_dto_1 = __webpack_require__(21);
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    async getDashboardStats(query) {
        return this.adminService.getDashboardStats(query);
    }
    async getChartData(query) {
        return this.adminService.getChartData(query);
    }
    async getUsers(query) {
        return this.adminService.getUsers(query);
    }
    async getUserDetail(id) {
        return this.adminService.getUserDetail(id);
    }
    async updateUser(id, updateData) {
        return this.adminService.updateUser(id, updateData);
    }
    async banUser(id, banData) {
        return this.adminService.banUser(id, banData);
    }
    async unbanUser(id) {
        return this.adminService.unbanUser(id);
    }
    async getSubscriptions(query) {
        return this.adminService.getSubscriptions(query);
    }
    async getSubscriptionStats(query) {
        return this.adminService.getSubscriptionStats(query);
    }
    async updateSubscription(id, updateData) {
        return this.adminService.updateSubscription(id, updateData);
    }
    async extendSubscription(id, extendData) {
        return this.adminService.extendSubscription(id, extendData);
    }
    async getOrders(query) {
        return this.adminService.getOrders(query);
    }
    async getPaymentStats(query) {
        return this.adminService.getPaymentStats(query);
    }
    async processRefund(orderNo, refundData) {
        return this.adminService.processRefund(orderNo, refundData);
    }
    async getSystemConfig() {
        return this.adminService.getSystemConfig();
    }
    async updateSystemConfig(configData) {
        return this.adminService.updateSystemConfig(configData);
    }
    async getSystemLogs(query) {
        return this.adminService.getSystemLogs(query);
    }
    async getPackages() {
        return this.adminService.getPackages();
    }
    async createPackage(packageData) {
        return this.adminService.createPackage(packageData);
    }
    async updatePackage(id, updateData) {
        return this.adminService.updatePackage(parseInt(id), updateData);
    }
    async deletePackage(id) {
        return this.adminService.deletePackage(parseInt(id));
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('dashboard/stats'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: '获取仪表盘统计数据' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '统计数据获取成功' }),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false, enum: ['day', 'week', 'month', 'year'], description: '统计周期' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof admin_dto_1.AdminStatsDto !== "undefined" && admin_dto_1.AdminStatsDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)('dashboard/charts'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: '获取图表数据' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '图表数据获取成功' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof admin_dto_1.AdminStatsDto !== "undefined" && admin_dto_1.AdminStatsDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getChartData", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: '获取用户列表' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '用户列表获取成功' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: '页码' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: '每页数量' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String, description: '搜索关键词' }),
    (0, swagger_1.ApiQuery)({ name: 'role', required: false, enum: ['USER', 'ADMIN', 'MODERATOR'], description: '角色过滤' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['ACTIVE', 'INACTIVE', 'BANNED'], description: '状态过滤' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof admin_dto_1.UserManagementDto !== "undefined" && admin_dto_1.UserManagementDto) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)('users/:id'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: '获取用户详情' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '用户ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '用户详情获取成功' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserDetail", null);
__decorate([
    (0, common_1.Put)('users/:id'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: '更新用户信息' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '用户ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '用户信息更新成功' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Post)('users/:id/ban'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: '封禁用户' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '用户ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '用户封禁成功' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "banUser", null);
__decorate([
    (0, common_1.Post)('users/:id/unban'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: '解封用户' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '用户ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '用户解封成功' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "unbanUser", null);
__decorate([
    (0, common_1.Get)('subscriptions'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: '获取订阅列表' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '订阅列表获取成功' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof admin_dto_1.SubscriptionManagementDto !== "undefined" && admin_dto_1.SubscriptionManagementDto) === "function" ? _e : Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSubscriptions", null);
__decorate([
    (0, common_1.Get)('subscriptions/stats'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: '获取订阅统计' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '订阅统计获取成功' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof admin_dto_1.AdminStatsDto !== "undefined" && admin_dto_1.AdminStatsDto) === "function" ? _f : Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSubscriptionStats", null);
__decorate([
    (0, common_1.Put)('subscriptions/:id'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: '更新订阅信息' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '订阅ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '订阅信息更新成功' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateSubscription", null);
__decorate([
    (0, common_1.Post)('subscriptions/:id/extend'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: '延长订阅' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '订阅ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '订阅延长成功' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "extendSubscription", null);
__decorate([
    (0, common_1.Get)('orders'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: '获取支付订单列表' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '订单列表获取成功' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: '页码' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: '每页数量' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED'], description: '订单状态过滤' }),
    (0, swagger_1.ApiQuery)({ name: 'paymentMethod', required: false, enum: ['ALIPAY', 'WECHAT', 'STRIPE', 'PAYPAL'], description: '支付方式过滤' }),
    (0, swagger_1.ApiQuery)({ name: 'userId', required: false, type: String, description: '用户ID过滤' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_g = typeof admin_dto_1.OrderManagementDto !== "undefined" && admin_dto_1.OrderManagementDto) === "function" ? _g : Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Get)('orders/stats'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: '获取支付统计' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '支付统计获取成功' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_h = typeof admin_dto_1.AdminStatsDto !== "undefined" && admin_dto_1.AdminStatsDto) === "function" ? _h : Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPaymentStats", null);
__decorate([
    (0, common_1.Post)('orders/:orderNo/refund'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: '处理退款' }),
    (0, swagger_1.ApiParam)({ name: 'orderNo', description: '订单号' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '退款处理成功' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('orderNo')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "processRefund", null);
__decorate([
    (0, common_1.Get)('system/config'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: '获取系统配置' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '系统配置获取成功' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSystemConfig", null);
__decorate([
    (0, common_1.Put)('system/config'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: '更新系统配置' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '系统配置更新成功' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_j = typeof admin_dto_1.SystemConfigDto !== "undefined" && admin_dto_1.SystemConfigDto) === "function" ? _j : Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateSystemConfig", null);
__decorate([
    (0, common_1.Get)('system/logs'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: '获取系统日志' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '系统日志获取成功' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSystemLogs", null);
__decorate([
    (0, common_1.Get)('packages'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: '获取套餐列表' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '套餐列表获取成功' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPackages", null);
__decorate([
    (0, common_1.Post)('packages'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: '创建套餐' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '套餐创建成功' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createPackage", null);
__decorate([
    (0, common_1.Put)('packages/:id'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: '更新套餐' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '套餐ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '套餐更新成功' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updatePackage", null);
__decorate([
    (0, common_1.Delete)('packages/:id'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: '删除套餐' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '套餐ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '套餐删除成功' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deletePackage", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('管理员功能'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard, role_guard_1.RoleGuard),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof admin_service_1.AdminService !== "undefined" && admin_service_1.AdminService) === "function" ? _a : Object])
], AdminController);


/***/ }),
/* 17 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminService = void 0;
const common_1 = __webpack_require__(2);
const config_1 = __webpack_require__(4);
const axios_1 = __webpack_require__(15);
const database_1 = __webpack_require__(10);
let AdminService = class AdminService {
    constructor(prisma, httpService, configService) {
        this.prisma = prisma;
        this.httpService = httpService;
        this.configService = configService;
    }
    async getDashboardStats(query) {
        const { period = 'month', startDate, endDate } = query;
        const now = new Date();
        let start;
        let end = endDate ? new Date(endDate) : now;
        if (startDate) {
            start = new Date(startDate);
        }
        else {
            switch (period) {
                case 'day':
                    start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    break;
                case 'week':
                    start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case 'year':
                    start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            }
        }
        const [totalUsers, newUsers, activeUsers, totalSubscriptions, activeSubscriptions, totalOrders, paidOrders, totalRevenue, usersByRole, usersByStatus,] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({
                where: { createdAt: { gte: start, lte: end } }
            }),
            this.prisma.user.count({
                where: {
                    lastLoginAt: {
                        gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                    }
                }
            }),
            this.prisma.subscription.count(),
            this.prisma.subscription.count({
                where: { status: 'ACTIVE' }
            }),
            this.prisma.paymentOrder.count(),
            this.prisma.paymentOrder.count({
                where: { status: 'PAID' }
            }),
            this.prisma.paymentOrder.aggregate({
                _sum: { amount: true },
                where: { status: 'PAID' }
            }),
            this.prisma.user.groupBy({
                by: ['role'],
                _count: { id: true }
            }),
            this.prisma.user.groupBy({
                by: ['status'],
                _count: { id: true }
            }),
        ]);
        return {
            overview: {
                totalUsers,
                newUsers,
                activeUsers,
                totalSubscriptions,
                activeSubscriptions,
                totalOrders,
                paidOrders,
                totalRevenue: totalRevenue._sum.amount || 0,
            },
            userDistribution: {
                byRole: usersByRole.reduce((acc, item) => {
                    acc[item.role] = item._count.id;
                    return acc;
                }, {}),
                byStatus: usersByStatus.reduce((acc, item) => {
                    acc[item.status] = item._count.id;
                    return acc;
                }, {}),
            },
            period: {
                start: start.toISOString(),
                end: end.toISOString(),
                period,
            },
        };
    }
    async getChartData(query) {
        const { period = 'month' } = query;
        const now = new Date();
        let dataPoints;
        let intervalHours;
        switch (period) {
            case 'day':
                dataPoints = 24;
                intervalHours = 1;
                break;
            case 'week':
                dataPoints = 7;
                intervalHours = 24;
                break;
            case 'month':
                dataPoints = 30;
                intervalHours = 24;
                break;
            case 'year':
                dataPoints = 12;
                intervalHours = 24 * 30;
                break;
            default:
                dataPoints = 30;
                intervalHours = 24;
        }
        const timePoints = Array.from({ length: dataPoints }, (_, i) => {
            const time = new Date(now.getTime() - (dataPoints - 1 - i) * intervalHours * 60 * 60 * 1000);
            return time;
        });
        const userRegistrations = await Promise.all(timePoints.map(async (time, index) => {
            const nextTime = index < timePoints.length - 1
                ? timePoints[index + 1]
                : new Date(time.getTime() + intervalHours * 60 * 60 * 1000);
            const count = await this.prisma.user.count({
                where: {
                    createdAt: {
                        gte: time,
                        lt: nextTime,
                    }
                }
            });
            return { time: time.toISOString(), count };
        }));
        const orderCounts = await Promise.all(timePoints.map(async (time, index) => {
            const nextTime = index < timePoints.length - 1
                ? timePoints[index + 1]
                : new Date(time.getTime() + intervalHours * 60 * 60 * 1000);
            const count = await this.prisma.paymentOrder.count({
                where: {
                    createdAt: {
                        gte: time,
                        lt: nextTime,
                    }
                }
            });
            return { time: time.toISOString(), count };
        }));
        const revenues = await Promise.all(timePoints.map(async (time, index) => {
            const nextTime = index < timePoints.length - 1
                ? timePoints[index + 1]
                : new Date(time.getTime() + intervalHours * 60 * 60 * 1000);
            const sum = await this.prisma.paymentOrder.aggregate({
                _sum: { amount: true },
                where: {
                    status: 'PAID',
                    createdAt: {
                        gte: time,
                        lt: nextTime,
                    }
                }
            });
            return { time: time.toISOString(), amount: sum._sum.amount || 0 };
        }));
        return {
            userRegistrations,
            orderCounts,
            revenues,
            period,
        };
    }
    async getUsers(query) {
        const { page = 1, limit = 20, search, role, status, sortBy = 'createdAt', sortOrder = 'desc' } = query;
        const where = {};
        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { nickname: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (role) {
            where.role = role;
        }
        if (status) {
            where.status = status;
        }
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                include: {
                    subscription: {
                        where: { status: 'ACTIVE' },
                        include: { package: true },
                    },
                },
                orderBy: { [sortBy]: sortOrder },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            data: users.map(user => ({
                id: user.id,
                email: user.email,
                nickname: user.nickname,
                role: user.role,
                status: user.status,
                isActive: user.isActive,
                lastLoginAt: user.lastLoginAt,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                currentSubscription: user.subscription || null,
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getUserDetail(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                subscription: {
                    include: { package: true },
                },
                paymentOrders: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                sentInvites: {
                    include: { invitee: true },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        return user;
    }
    async updateUser(id, updateData) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        return this.prisma.user.update({
            where: { id },
            data: updateData,
        });
    }
    async banUser(id, banData) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        if (user.status === 'BANNED') {
            throw new common_1.BadRequestException('用户已被封禁');
        }
        await this.prisma.user.update({
            where: { id },
            data: {
                status: 'BANNED',
                isActive: false,
            },
        });
        return { message: '用户封禁成功' };
    }
    async unbanUser(id) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        if (user.status !== 'BANNED') {
            throw new common_1.BadRequestException('用户未被封禁');
        }
        await this.prisma.user.update({
            where: { id },
            data: {
                status: 'ACTIVE',
                isActive: true,
            },
        });
        return { message: '用户解封成功' };
    }
    async getSubscriptions(query) {
        const { page = 1, limit = 20, status, packageId, userId, autoRenew, sortBy = 'createdAt', sortOrder = 'desc' } = query;
        const where = {};
        if (status)
            where.status = status;
        if (packageId)
            where.packageId = packageId;
        if (userId)
            where.userId = userId;
        if (autoRenew !== undefined)
            where.autoRenew = autoRenew;
        const [subscriptions, total] = await Promise.all([
            this.prisma.subscription.findMany({
                where,
                include: {
                    user: { select: { id: true, email: true, nickname: true } },
                    package: true,
                },
                orderBy: { [sortBy]: sortOrder },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.subscription.count({ where }),
        ]);
        return {
            data: subscriptions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getSubscriptionStats(query) {
        const { period = 'month' } = query;
        const [totalSubscriptions, activeSubscriptions, expiredSubscriptions, subscriptionsByPackage,] = await Promise.all([
            this.prisma.subscription.count(),
            this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
            this.prisma.subscription.count({ where: { status: 'EXPIRED' } }),
            this.prisma.subscription.groupBy({
                by: ['packageId'],
                _count: { id: true },
            }),
        ]);
        return {
            overview: {
                total: totalSubscriptions,
                active: activeSubscriptions,
                expired: expiredSubscriptions,
            },
            byPackage: subscriptionsByPackage,
        };
    }
    async updateSubscription(id, updateData) {
        const subscription = await this.prisma.subscription.findUnique({ where: { id } });
        if (!subscription) {
            throw new common_1.NotFoundException('订阅不存在');
        }
        return this.prisma.subscription.update({
            where: { id },
            data: updateData,
        });
    }
    async extendSubscription(id, extendData) {
        const subscription = await this.prisma.subscription.findUnique({ where: { id } });
        if (!subscription) {
            throw new common_1.NotFoundException('订阅不存在');
        }
        const newEndDate = new Date(subscription.endDate);
        newEndDate.setDate(newEndDate.getDate() + extendData.days);
        await this.prisma.subscription.update({
            where: { id },
            data: {
                endDate: newEndDate,
                status: 'ACTIVE',
            },
        });
        return { message: `订阅已延长 ${extendData.days} 天` };
    }
    async getOrders(query) {
        const { page = 1, limit = 20, status, paymentMethod, userId, sortBy = 'createdAt', sortOrder = 'desc' } = query;
        const where = {};
        if (status)
            where.status = status;
        if (paymentMethod)
            where.paymentMethod = paymentMethod;
        if (userId)
            where.userId = userId;
        const [orders, total] = await Promise.all([
            this.prisma.paymentOrder.findMany({
                where,
                include: {
                    user: { select: { id: true, email: true, nickname: true } },
                    package: true,
                },
                orderBy: { [sortBy]: sortOrder },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.paymentOrder.count({ where }),
        ]);
        return {
            data: orders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getPaymentStats(query) {
        const [totalOrders, paidOrders, failedOrders, totalRevenue, ordersByMethod,] = await Promise.all([
            this.prisma.paymentOrder.count(),
            this.prisma.paymentOrder.count({ where: { status: 'PAID' } }),
            this.prisma.paymentOrder.count({ where: { status: 'FAILED' } }),
            this.prisma.paymentOrder.aggregate({
                _sum: { amount: true },
                where: { status: 'PAID' }
            }),
            this.prisma.paymentOrder.groupBy({
                by: ['paymentMethod'],
                _count: { id: true },
                _sum: { amount: true },
                where: { status: 'PAID' }
            }),
        ]);
        return {
            overview: {
                total: totalOrders,
                paid: paidOrders,
                failed: failedOrders,
                revenue: totalRevenue._sum.amount || 0,
            },
            byMethod: ordersByMethod.reduce((acc, item) => {
                acc[item.paymentMethod] = {
                    count: item._count.id,
                    revenue: item._sum.amount || 0,
                };
                return acc;
            }, {}),
        };
    }
    async processRefund(orderNo, refundData) {
        const order = await this.prisma.paymentOrder.findUnique({
            where: { orderNo },
        });
        if (!order) {
            throw new common_1.NotFoundException('订单不存在');
        }
        if (order.status !== 'PAID') {
            throw new common_1.BadRequestException('只能退款已支付的订单');
        }
        await this.prisma.paymentOrder.update({
            where: { orderNo },
            data: {
                status: 'CANCELLED',
            },
        });
        return { message: '退款处理成功' };
    }
    async getSystemConfig() {
        return {
            site: {
                siteName: '91Writing',
                siteDescription: '智能写作平台',
                logo: '/logo.png',
                favicon: '/favicon.ico',
            },
            payment: {
                alipay: {
                    enabled: true,
                    sandbox: true,
                },
                wechat: {
                    enabled: true,
                    sandbox: true,
                },
            },
            email: {
                enabled: true,
                provider: 'smtp',
            },
            ai: {
                openai: {
                    enabled: true,
                    model: 'gpt-3.5-turbo',
                    maxTokens: 2000,
                },
            },
        };
    }
    async updateSystemConfig(configData) {
        console.log('更新系统配置:', configData);
        return { message: '系统配置更新成功' };
    }
    async getSystemLogs(query) {
        return {
            data: [],
            pagination: {
                page: 1,
                limit: 20,
                total: 0,
                totalPages: 0,
            },
        };
    }
    async getPackages() {
        return this.prisma.package.findMany({
            orderBy: { sortOrder: 'asc' },
        });
    }
    async createPackage(packageData) {
        return this.prisma.package.create({
            data: packageData,
        });
    }
    async updatePackage(id, updateData) {
        const pkg = await this.prisma.package.findUnique({ where: { id } });
        if (!pkg) {
            throw new common_1.NotFoundException('套餐不存在');
        }
        return this.prisma.package.update({
            where: { id },
            data: updateData,
        });
    }
    async deletePackage(id) {
        const pkg = await this.prisma.package.findUnique({ where: { id } });
        if (!pkg) {
            throw new common_1.NotFoundException('套餐不存在');
        }
        const activeSubscriptions = await this.prisma.subscription.count({
            where: {
                packageId: id,
                status: 'ACTIVE',
            },
        });
        if (activeSubscriptions > 0) {
            throw new common_1.BadRequestException('无法删除有活跃订阅的套餐');
        }
        await this.prisma.package.delete({ where: { id } });
        return { message: '套餐删除成功' };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _b : Object, typeof (_c = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _c : Object])
], AdminService);


/***/ }),
/* 18 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminAuthGuard = void 0;
const common_1 = __webpack_require__(2);
const config_1 = __webpack_require__(4);
const jwt_1 = __webpack_require__(9);
let AdminAuthGuard = class AdminAuthGuard {
    constructor(jwtService, configService) {
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new common_1.UnauthorizedException('访问令牌缺失');
        }
        try {
            const secret = this.configService.get('JWT_SECRET');
            const payload = await this.jwtService.verifyAsync(token, { secret });
            if (payload.role !== 'ADMIN') {
                throw new common_1.UnauthorizedException('权限不足，需要管理员权限');
            }
            request['user'] = payload;
            return true;
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.UnauthorizedException('无效的访问令牌');
        }
    }
    extractTokenFromHeader(request) {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
};
exports.AdminAuthGuard = AdminAuthGuard;
exports.AdminAuthGuard = AdminAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _a : Object, typeof (_b = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _b : Object])
], AdminAuthGuard);


/***/ }),
/* 19 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RoleGuard = void 0;
const common_1 = __webpack_require__(2);
const core_1 = __webpack_require__(1);
let RoleGuard = class RoleGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredRoles = this.reflector.get('roles', context.getHandler());
        if (!requiredRoles) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('用户信息缺失');
        }
        const hasRole = requiredRoles.includes(user.role);
        if (!hasRole) {
            throw new common_1.ForbiddenException(`需要以下角色之一: ${requiredRoles.join(', ')}`);
        }
        return true;
    }
};
exports.RoleGuard = RoleGuard;
exports.RoleGuard = RoleGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object])
], RoleGuard);


/***/ }),
/* 20 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Roles = void 0;
const common_1 = __webpack_require__(2);
const Roles = (...roles) => (0, common_1.SetMetadata)('roles', roles);
exports.Roles = Roles;


/***/ }),
/* 21 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OrderManagementDto = exports.SystemConfigDto = exports.SubscriptionManagementDto = exports.UserManagementDto = exports.AdminStatsDto = void 0;
const swagger_1 = __webpack_require__(3);
const class_validator_1 = __webpack_require__(22);
const class_transformer_1 = __webpack_require__(23);
class AdminStatsDto {
    constructor() {
        this.period = 'month';
    }
}
exports.AdminStatsDto = AdminStatsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '统计周期',
        enum: ['day', 'week', 'month', 'year'],
        default: 'month'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['day', 'week', 'month', 'year']),
    __metadata("design:type", String)
], AdminStatsDto.prototype, "period", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '开始日期',
        example: '2024-01-01'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AdminStatsDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '结束日期',
        example: '2024-12-31'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AdminStatsDto.prototype, "endDate", void 0);
class UserManagementDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
        this.sortBy = 'createdAt';
        this.sortOrder = 'desc';
    }
}
exports.UserManagementDto = UserManagementDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '页码',
        default: 1
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UserManagementDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '每页数量',
        default: 20
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UserManagementDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '搜索关键词（邮箱或昵称）'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserManagementDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '用户角色过滤',
        enum: ['USER', 'ADMIN', 'MODERATOR']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['USER', 'ADMIN', 'MODERATOR']),
    (0, class_transformer_1.Transform)(({ value }) => value === '' ? undefined : value),
    __metadata("design:type", String)
], UserManagementDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '用户状态过滤',
        enum: ['ACTIVE', 'INACTIVE', 'BANNED']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['ACTIVE', 'INACTIVE', 'BANNED']),
    (0, class_transformer_1.Transform)(({ value }) => value === '' ? undefined : value),
    __metadata("design:type", String)
], UserManagementDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '排序字段',
        default: 'createdAt'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserManagementDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '排序方向',
        enum: ['asc', 'desc'],
        default: 'desc'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['asc', 'desc']),
    __metadata("design:type", String)
], UserManagementDto.prototype, "sortOrder", void 0);
class SubscriptionManagementDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
        this.sortBy = 'createdAt';
        this.sortOrder = 'desc';
    }
}
exports.SubscriptionManagementDto = SubscriptionManagementDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '页码',
        default: 1
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SubscriptionManagementDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '每页数量',
        default: 20
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SubscriptionManagementDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '订阅状态过滤',
        enum: ['ACTIVE', 'EXPIRED', 'CANCELLED']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['ACTIVE', 'EXPIRED', 'CANCELLED']),
    (0, class_transformer_1.Transform)(({ value }) => value === '' ? undefined : value),
    __metadata("design:type", String)
], SubscriptionManagementDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '套餐ID过滤'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubscriptionManagementDto.prototype, "packageId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '用户ID过滤'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubscriptionManagementDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '是否自动续费',
        type: Boolean
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], SubscriptionManagementDto.prototype, "autoRenew", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '排序字段',
        default: 'createdAt'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubscriptionManagementDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '排序方向',
        enum: ['asc', 'desc'],
        default: 'desc'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['asc', 'desc']),
    __metadata("design:type", String)
], SubscriptionManagementDto.prototype, "sortOrder", void 0);
class SystemConfigDto {
}
exports.SystemConfigDto = SystemConfigDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '站点配置',
        example: {
            siteName: '91Writing',
            siteDescription: '智能写作平台',
            logo: 'https://example.com/logo.png',
            favicon: 'https://example.com/favicon.ico'
        }
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object)
], SystemConfigDto.prototype, "site", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '支付配置',
        example: {
            alipay: {
                enabled: true,
                appId: 'xxx',
                merchantPrivateKey: 'xxx'
            },
            wechat: {
                enabled: true,
                appId: 'xxx',
                mchId: 'xxx'
            }
        }
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_b = typeof Record !== "undefined" && Record) === "function" ? _b : Object)
], SystemConfigDto.prototype, "payment", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '邮件配置',
        example: {
            smtp: {
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: 'user@gmail.com',
                    pass: 'password'
                }
            }
        }
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_c = typeof Record !== "undefined" && Record) === "function" ? _c : Object)
], SystemConfigDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'AI服务配置',
        example: {
            openai: {
                apiKey: 'sk-xxx',
                model: 'gpt-3.5-turbo',
                maxTokens: 2000
            }
        }
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_d = typeof Record !== "undefined" && Record) === "function" ? _d : Object)
], SystemConfigDto.prototype, "ai", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '安全配置',
        example: {
            jwt: {
                secret: 'your-secret-key',
                expiresIn: '7d'
            },
            bcrypt: {
                rounds: 12
            }
        }
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_e = typeof Record !== "undefined" && Record) === "function" ? _e : Object)
], SystemConfigDto.prototype, "security", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '其他配置'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_f = typeof Record !== "undefined" && Record) === "function" ? _f : Object)
], SystemConfigDto.prototype, "others", void 0);
class OrderManagementDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
        this.sortBy = 'createdAt';
        this.sortOrder = 'desc';
    }
}
exports.OrderManagementDto = OrderManagementDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '页码',
        default: 1
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], OrderManagementDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '每页数量',
        default: 20
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], OrderManagementDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '订单状态过滤',
        enum: ['PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED']),
    (0, class_transformer_1.Transform)(({ value }) => value === '' ? undefined : value),
    __metadata("design:type", String)
], OrderManagementDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '支付方式过滤',
        enum: ['ALIPAY', 'WECHAT', 'STRIPE', 'PAYPAL']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['ALIPAY', 'WECHAT', 'STRIPE', 'PAYPAL']),
    (0, class_transformer_1.Transform)(({ value }) => value === '' ? undefined : value),
    __metadata("design:type", String)
], OrderManagementDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '用户ID过滤'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Transform)(({ value }) => value === '' ? undefined : value),
    __metadata("design:type", String)
], OrderManagementDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '排序字段',
        default: 'createdAt'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OrderManagementDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '排序方向',
        enum: ['asc', 'desc'],
        default: 'desc'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['asc', 'desc']),
    __metadata("design:type", String)
], OrderManagementDto.prototype, "sortOrder", void 0);


/***/ }),
/* 22 */
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),
/* 23 */
/***/ ((module) => {

module.exports = require("class-transformer");

/***/ }),
/* 24 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HealthModule = void 0;
const common_1 = __webpack_require__(2);
const health_controller_1 = __webpack_require__(25);
const health_service_1 = __webpack_require__(26);
let HealthModule = class HealthModule {
};
exports.HealthModule = HealthModule;
exports.HealthModule = HealthModule = __decorate([
    (0, common_1.Module)({
        controllers: [health_controller_1.HealthController],
        providers: [health_service_1.HealthService],
    })
], HealthModule);


/***/ }),
/* 25 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HealthController = void 0;
const common_1 = __webpack_require__(2);
const swagger_1 = __webpack_require__(3);
const health_service_1 = __webpack_require__(26);
let HealthController = class HealthController {
    constructor(healthService) {
        this.healthService = healthService;
    }
    getHealth() {
        return this.healthService.getHealth();
    }
    getDetailedHealth() {
        return this.healthService.getDetailedHealth();
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '健康检查' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '服务正常运行' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('detailed'),
    (0, swagger_1.ApiOperation)({ summary: '详细健康检查' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '详细健康状态' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getDetailedHealth", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('健康检查'),
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [typeof (_a = typeof health_service_1.HealthService !== "undefined" && health_service_1.HealthService) === "function" ? _a : Object])
], HealthController);


/***/ }),
/* 26 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HealthService = void 0;
const common_1 = __webpack_require__(2);
const database_1 = __webpack_require__(10);
let HealthService = class HealthService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getHealth() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'admin-service',
            version: '1.0.0',
        };
    }
    async getDetailedHealth() {
        const startTime = Date.now();
        let dbStatus = 'ok';
        let dbLatency = 0;
        try {
            const dbStart = Date.now();
            await this.prisma.$queryRaw `SELECT 1`;
            dbLatency = Date.now() - dbStart;
        }
        catch (error) {
            dbStatus = 'error';
            console.error('数据库健康检查失败:', error);
        }
        const totalLatency = Date.now() - startTime;
        return {
            status: dbStatus === 'ok' ? 'ok' : 'degraded',
            timestamp: new Date().toISOString(),
            service: 'admin-service',
            version: '1.0.0',
            checks: {
                database: {
                    status: dbStatus,
                    latency: `${dbLatency}ms`,
                },
            },
            latency: `${totalLatency}ms`,
            uptime: process.uptime(),
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                unit: 'MB',
            },
        };
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], HealthService);


/***/ }),
/* 27 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnalyticsModule = void 0;
const common_1 = __webpack_require__(2);
const jwt_1 = __webpack_require__(9);
const config_1 = __webpack_require__(4);
const analytics_controller_1 = __webpack_require__(28);
const analytics_service_1 = __webpack_require__(29);
const database_1 = __webpack_require__(10);
let AnalyticsModule = class AnalyticsModule {
};
exports.AnalyticsModule = AnalyticsModule;
exports.AnalyticsModule = AnalyticsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            database_1.DatabaseModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_SECRET', '91writing_default_secret'),
                    signOptions: {
                        expiresIn: configService.get('JWT_EXPIRES_IN', '7d'),
                    },
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        controllers: [analytics_controller_1.AnalyticsController],
        providers: [analytics_service_1.AnalyticsService],
        exports: [analytics_service_1.AnalyticsService],
    })
], AnalyticsModule);


/***/ }),
/* 28 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnalyticsController = void 0;
const common_1 = __webpack_require__(2);
const analytics_service_1 = __webpack_require__(29);
const guards_1 = __webpack_require__(30);
const swagger_1 = __webpack_require__(3);
const admin_auth_guard_1 = __webpack_require__(18);
const analytics_dto_1 = __webpack_require__(33);
let AnalyticsController = class AnalyticsController {
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async batchTrack(dto, req) {
        const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        return this.analyticsService.batchTrackActivities(dto.events, ipAddress);
    }
    async getOverview(query) {
        const startDate = query.startDate ? new Date(query.startDate) : undefined;
        const endDate = query.endDate ? new Date(query.endDate) : undefined;
        return this.analyticsService.getOverviewStats(startDate, endDate);
    }
    async getUserGrowth(days = '30') {
        return this.analyticsService.getUserGrowthTrend(parseInt(days, 10));
    }
    async getFeatureUsage(limit = '10') {
        return this.analyticsService.getFeatureUsageStats(parseInt(limit, 10));
    }
    async getAIUsage(query) {
        const startDate = query.startDate ? new Date(query.startDate) : undefined;
        const endDate = query.endDate ? new Date(query.endDate) : undefined;
        return this.analyticsService.getAIUsageStats(startDate, endDate);
    }
    async getRevenue(query) {
        const startDate = query.startDate ? new Date(query.startDate) : undefined;
        const endDate = query.endDate ? new Date(query.endDate) : undefined;
        return this.analyticsService.getRevenueStats(startDate, endDate);
    }
    async getUserRetention(query) {
        const cohortDate = new Date(query.cohortDate);
        const days = query.days ? parseInt(query.days, 10) : 30;
        return this.analyticsService.getUserRetention(cohortDate, days);
    }
    async exportReport(query) {
        const startDate = query.startDate ? new Date(query.startDate) : undefined;
        const endDate = query.endDate ? new Date(query.endDate) : undefined;
        return this.analyticsService.exportAnalyticsReport(startDate, endDate);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Post)('batch'),
    (0, swagger_1.ApiOperation)({ summary: '批量记录用户行为' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof analytics_dto_1.BatchTrackDto !== "undefined" && analytics_dto_1.BatchTrackDto) === "function" ? _b : Object, Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "batchTrack", null);
__decorate([
    (0, common_1.Get)('overview'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, admin_auth_guard_1.AdminAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取概览统计' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof analytics_dto_1.DateRangeDto !== "undefined" && analytics_dto_1.DateRangeDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getOverview", null);
__decorate([
    (0, common_1.Get)('user-growth'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, admin_auth_guard_1.AdminAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取用户增长趋势' }),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getUserGrowth", null);
__decorate([
    (0, common_1.Get)('feature-usage'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, admin_auth_guard_1.AdminAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取功能使用统计' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getFeatureUsage", null);
__decorate([
    (0, common_1.Get)('ai-usage'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, admin_auth_guard_1.AdminAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取AI使用统计' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof analytics_dto_1.DateRangeDto !== "undefined" && analytics_dto_1.DateRangeDto) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getAIUsage", null);
__decorate([
    (0, common_1.Get)('revenue'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, admin_auth_guard_1.AdminAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取收入统计' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof analytics_dto_1.DateRangeDto !== "undefined" && analytics_dto_1.DateRangeDto) === "function" ? _e : Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getRevenue", null);
__decorate([
    (0, common_1.Get)('retention'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, admin_auth_guard_1.AdminAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取用户留存数据' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof analytics_dto_1.RetentionQueryDto !== "undefined" && analytics_dto_1.RetentionQueryDto) === "function" ? _f : Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getUserRetention", null);
__decorate([
    (0, common_1.Get)('export'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, admin_auth_guard_1.AdminAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '导出分析报表' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_g = typeof analytics_dto_1.DateRangeDto !== "undefined" && analytics_dto_1.DateRangeDto) === "function" ? _g : Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "exportReport", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, swagger_1.ApiTags)('Analytics'),
    (0, common_1.Controller)('analytics'),
    __metadata("design:paramtypes", [typeof (_a = typeof analytics_service_1.AnalyticsService !== "undefined" && analytics_service_1.AnalyticsService) === "function" ? _a : Object])
], AnalyticsController);


/***/ }),
/* 29 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AnalyticsService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnalyticsService = void 0;
const common_1 = __webpack_require__(2);
const database_1 = __webpack_require__(10);
let AnalyticsService = AnalyticsService_1 = class AnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AnalyticsService_1.name);
    }
    async batchTrackActivities(events, ipAddress) {
        try {
            const activities = events.map((event) => ({
                userId: event.userId || null,
                action: event.action,
                targetType: event.details?.targetType || null,
                targetId: event.details?.targetId || null,
                details: event.details || {},
                ipAddress: ipAddress || event.ipAddress || null,
                userAgent: event.userAgent || null,
            }));
            await this.prisma.userActivity.createMany({
                data: activities,
                skipDuplicates: true,
            });
            return { success: true, count: activities.length };
        }
        catch (error) {
            this.logger.error('批量记录用户行为失败', error);
            throw error;
        }
    }
    async trackAIUsage(data) {
        try {
            return await this.prisma.aIUsageLog.create({
                data: {
                    userId: data.userId || null,
                    model: data.model,
                    functionType: data.functionType,
                    inputTokens: data.inputTokens || 0,
                    outputTokens: data.outputTokens || 0,
                    cost: data.cost || 0,
                    responseTime: data.responseTime || null,
                    success: data.success ?? true,
                },
            });
        }
        catch (error) {
            this.logger.error('记录AI使用失败', error);
            throw error;
        }
    }
    async getOverviewStats(startDate, endDate) {
        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate)
                dateFilter.createdAt.gte = startDate;
            if (endDate)
                dateFilter.createdAt.lte = endDate;
        }
        const [totalUsers, activeUsers, totalNovels, totalChapters, totalActivities, totalAIUsage, totalRevenue, activeSubscriptions,] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({
                where: {
                    activities: {
                        some: {
                            createdAt: {
                                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                            },
                        },
                    },
                },
            }),
            this.prisma.novel.count(),
            this.prisma.chapter.count(),
            this.prisma.userActivity.count({ where: dateFilter }),
            this.prisma.aIUsageLog.count({
                where: startDate || endDate
                    ? {
                        createdAt: {
                            ...(startDate && { gte: startDate }),
                            ...(endDate && { lte: endDate }),
                        },
                    }
                    : {},
            }),
            this.prisma.paymentOrder.aggregate({
                where: { status: 'PAID' },
                _sum: { amount: true },
            }),
            this.prisma.subscription.count({
                where: { status: 'ACTIVE' },
            }),
        ]);
        return {
            totalUsers,
            activeUsers,
            totalNovels,
            totalChapters,
            totalActivities,
            totalAIUsage,
            totalRevenue: totalRevenue._sum.amount || 0,
            activeSubscriptions,
        };
    }
    async getUserGrowthTrend(days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const users = await this.prisma.user.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                },
            },
            select: {
                createdAt: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
        const groupedByDate = users.reduce((acc, user) => {
            const date = user.createdAt.toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(groupedByDate).map(([date, count]) => ({
            date,
            count,
        }));
    }
    async getFeatureUsageStats(limit = 10) {
        const activities = await this.prisma.userActivity.groupBy({
            by: ['action'],
            _count: {
                action: true,
            },
            orderBy: {
                _count: {
                    action: 'desc',
                },
            },
            take: limit,
        });
        return activities.map((item) => ({
            feature: item.action,
            count: item._count.action,
        }));
    }
    async getAIUsageStats(startDate, endDate) {
        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate)
                dateFilter.createdAt.gte = startDate;
            if (endDate)
                dateFilter.createdAt.lte = endDate;
        }
        const [totalUsage, byFunction, byModel, totalCost, avgResponseTime] = await Promise.all([
            this.prisma.aIUsageLog.count({ where: dateFilter }),
            this.prisma.aIUsageLog.groupBy({
                by: ['functionType'],
                _count: { functionType: true },
                where: dateFilter,
                orderBy: { _count: { functionType: 'desc' } },
            }),
            this.prisma.aIUsageLog.groupBy({
                by: ['model'],
                _count: { model: true },
                where: dateFilter,
                orderBy: { _count: { model: 'desc' } },
            }),
            this.prisma.aIUsageLog.aggregate({
                where: dateFilter,
                _sum: { cost: true },
            }),
            this.prisma.aIUsageLog.aggregate({
                where: dateFilter,
                _avg: { responseTime: true },
            }),
        ]);
        return {
            totalUsage,
            byFunction: byFunction.map((item) => ({
                function: item.functionType,
                count: item._count.functionType,
            })),
            byModel: byModel.map((item) => ({
                model: item.model,
                count: item._count.model,
            })),
            totalCost: totalCost._sum.cost || 0,
            avgResponseTime: avgResponseTime._avg.responseTime || 0,
        };
    }
    async getRevenueStats(startDate, endDate) {
        const dateFilter = {
            status: 'PAID',
        };
        if (startDate || endDate) {
            dateFilter.paidAt = {};
            if (startDate)
                dateFilter.paidAt.gte = startDate;
            if (endDate)
                dateFilter.paidAt.lte = endDate;
        }
        const [totalRevenue, orderCount, byPackage, byPaymentMethod] = await Promise.all([
            this.prisma.paymentOrder.aggregate({
                where: dateFilter,
                _sum: { amount: true },
            }),
            this.prisma.paymentOrder.count({ where: dateFilter }),
            this.prisma.paymentOrder.groupBy({
                by: ['packageId'],
                _sum: { amount: true },
                _count: { packageId: true },
                where: dateFilter,
            }),
            this.prisma.paymentOrder.groupBy({
                by: ['paymentMethod'],
                _sum: { amount: true },
                _count: { paymentMethod: true },
                where: dateFilter,
            }),
        ]);
        const packages = await this.prisma.package.findMany({
            where: {
                id: { in: byPackage.map((item) => item.packageId) },
            },
        });
        const packageMap = new Map(packages.map((pkg) => [pkg.id, pkg]));
        return {
            totalRevenue: totalRevenue._sum.amount || 0,
            orderCount,
            byPackage: byPackage.map((item) => ({
                packageId: item.packageId,
                packageName: packageMap.get(item.packageId)?.name || 'Unknown',
                revenue: item._sum.amount || 0,
                count: item._count.packageId,
            })),
            byPaymentMethod: byPaymentMethod.map((item) => ({
                method: item.paymentMethod,
                revenue: item._sum.amount || 0,
                count: item._count.paymentMethod,
            })),
        };
    }
    async getUserRetention(cohortDate, days = 30) {
        const cohortUsers = await this.prisma.user.findMany({
            where: {
                createdAt: {
                    gte: cohortDate,
                    lt: new Date(cohortDate.getTime() + 24 * 60 * 60 * 1000),
                },
            },
            select: { id: true },
        });
        const cohortUserIds = cohortUsers.map((u) => u.id);
        const totalCohortUsers = cohortUserIds.length;
        if (totalCohortUsers === 0) {
            return { totalUsers: 0, retention: [] };
        }
        const retentionData = [];
        for (let day = 0; day <= days; day++) {
            const targetDate = new Date(cohortDate.getTime() + day * 24 * 60 * 60 * 1000);
            const nextDate = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);
            const activeUsers = await this.prisma.userActivity.groupBy({
                by: ['userId'],
                where: {
                    userId: { in: cohortUserIds },
                    createdAt: {
                        gte: targetDate,
                        lt: nextDate,
                    },
                },
            });
            const retentionRate = (activeUsers.length / totalCohortUsers) * 100;
            retentionData.push({
                day,
                date: targetDate.toISOString().split('T')[0],
                activeUsers: activeUsers.length,
                retentionRate: Math.round(retentionRate * 100) / 100,
            });
        }
        return {
            totalUsers: totalCohortUsers,
            retention: retentionData,
        };
    }
    async exportAnalyticsReport(startDate, endDate) {
        const [overview, userGrowth, featureUsage, aiUsage, revenue] = await Promise.all([
            this.getOverviewStats(startDate, endDate),
            this.getUserGrowthTrend(30),
            this.getFeatureUsageStats(20),
            this.getAIUsageStats(startDate, endDate),
            this.getRevenueStats(startDate, endDate),
        ]);
        return {
            generatedAt: new Date().toISOString(),
            period: {
                startDate: startDate?.toISOString(),
                endDate: endDate?.toISOString(),
            },
            overview,
            userGrowth,
            featureUsage,
            aiUsage,
            revenue,
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = AnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], AnalyticsService);


/***/ }),
/* 30 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(31), exports);
__exportStar(__webpack_require__(32), exports);


/***/ }),
/* 31 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtAuthGuard = void 0;
const common_1 = __webpack_require__(2);
const passport_1 = __webpack_require__(8);
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
    handleRequest(err, user, info) {
        if (err || !user) {
            throw err || new common_1.UnauthorizedException('Invalid token');
        }
        return user;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);


/***/ }),
/* 32 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TenantGuard = void 0;
const common_1 = __webpack_require__(2);
let TenantGuard = class TenantGuard {
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const tenantId = request.headers['x-tenant-id'] || request.user?.tenantId;
        if (!tenantId) {
            return true;
        }
        request.tenantId = tenantId;
        return true;
    }
};
exports.TenantGuard = TenantGuard;
exports.TenantGuard = TenantGuard = __decorate([
    (0, common_1.Injectable)()
], TenantGuard);


/***/ }),
/* 33 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RetentionQueryDto = exports.DateRangeDto = exports.BatchTrackDto = void 0;
const swagger_1 = __webpack_require__(3);
const class_validator_1 = __webpack_require__(22);
class BatchTrackDto {
}
exports.BatchTrackDto = BatchTrackDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '事件数组', type: [Object] }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], BatchTrackDto.prototype, "events", void 0);
class DateRangeDto {
}
exports.DateRangeDto = DateRangeDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '开始日期' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DateRangeDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '结束日期' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DateRangeDto.prototype, "endDate", void 0);
class RetentionQueryDto {
}
exports.RetentionQueryDto = RetentionQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '队列日期' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], RetentionQueryDto.prototype, "cohortDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '分析天数', default: '30' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RetentionQueryDto.prototype, "days", void 0);


/***/ }),
/* 34 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AIConfigModule = void 0;
const common_1 = __webpack_require__(2);
const jwt_1 = __webpack_require__(9);
const passport_1 = __webpack_require__(8);
const config_1 = __webpack_require__(4);
const ai_config_controller_1 = __webpack_require__(35);
const ai_config_service_1 = __webpack_require__(36);
const database_1 = __webpack_require__(10);
let AIConfigModule = class AIConfigModule {
};
exports.AIConfigModule = AIConfigModule;
exports.AIConfigModule = AIConfigModule = __decorate([
    (0, common_1.Module)({
        imports: [
            database_1.DatabaseModule,
            passport_1.PassportModule,
            config_1.ConfigModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_SECRET') || '91writing_jwt_secret_dev_2024',
                    signOptions: { expiresIn: '7d' },
                }),
            }),
        ],
        controllers: [ai_config_controller_1.AIConfigController],
        providers: [ai_config_service_1.AIConfigService],
        exports: [ai_config_service_1.AIConfigService],
    })
], AIConfigModule);


/***/ }),
/* 35 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AIConfigController = void 0;
const common_1 = __webpack_require__(2);
const swagger_1 = __webpack_require__(3);
const ai_config_service_1 = __webpack_require__(36);
const ai_config_dto_1 = __webpack_require__(39);
const admin_auth_guard_1 = __webpack_require__(18);
const role_guard_1 = __webpack_require__(19);
let AIConfigController = class AIConfigController {
    constructor(aiConfigService) {
        this.aiConfigService = aiConfigService;
    }
    async getSystemConfig() {
        return this.aiConfigService.getSystemConfig();
    }
    async updateSystemConfig(dto) {
        return this.aiConfigService.updateSystemConfig(dto);
    }
    async testConfig(dto) {
        return this.aiConfigService.testConfig(dto);
    }
};
exports.AIConfigController = AIConfigController;
__decorate([
    (0, common_1.Get)('system'),
    (0, swagger_1.ApiOperation)({ summary: '获取系统AI配置' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], AIConfigController.prototype, "getSystemConfig", null);
__decorate([
    (0, common_1.Put)('system'),
    (0, swagger_1.ApiOperation)({ summary: '更新系统AI配置' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof ai_config_dto_1.UpdateSystemAIConfigDto !== "undefined" && ai_config_dto_1.UpdateSystemAIConfigDto) === "function" ? _c : Object]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], AIConfigController.prototype, "updateSystemConfig", null);
__decorate([
    (0, common_1.Post)('test'),
    (0, swagger_1.ApiOperation)({ summary: '测试AI配置连接' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof ai_config_dto_1.TestAIConfigDto !== "undefined" && ai_config_dto_1.TestAIConfigDto) === "function" ? _e : Object]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], AIConfigController.prototype, "testConfig", null);
exports.AIConfigController = AIConfigController = __decorate([
    (0, swagger_1.ApiTags)('管理员-AI配置'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('ai-config'),
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard, role_guard_1.RoleGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof ai_config_service_1.AIConfigService !== "undefined" && ai_config_service_1.AIConfigService) === "function" ? _a : Object])
], AIConfigController);


/***/ }),
/* 36 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AIConfigService = void 0;
const common_1 = __webpack_require__(2);
const database_1 = __webpack_require__(10);
const crypto = __webpack_require__(37);
const axios_1 = __webpack_require__(38);
let AIConfigService = class AIConfigService {
    constructor(prisma) {
        this.prisma = prisma;
        this.ENCRYPTION_KEY = process.env.AI_CONFIG_ENCRYPTION_KEY || 'your-32-character-encryption-key!!';
        this.ALGORITHM = 'aes-256-cbc';
        this.CONFIG_KEY = 'ai.global';
    }
    async getSystemConfig() {
        const config = await this.prisma.systemConfig.findUnique({
            where: { configKey: this.CONFIG_KEY },
        });
        if (!config) {
            return {
                models: [],
            };
        }
        const configValue = config.configValue;
        const models = configValue.models || [];
        const decryptedModels = models.map((model) => ({
            ...model,
            apiKey: this.decrypt(model.apiKey),
        }));
        return {
            models: decryptedModels,
        };
    }
    async updateSystemConfig(dto) {
        this.validateConfig(dto);
        const encryptedModels = dto.models.map((model) => ({
            ...model,
            apiKey: this.encrypt(model.apiKey),
        }));
        await this.prisma.systemConfig.upsert({
            where: { configKey: this.CONFIG_KEY },
            create: {
                configKey: this.CONFIG_KEY,
                configValue: JSON.parse(JSON.stringify({ models: encryptedModels })),
                description: '全局AI模型配置',
            },
            update: {
                configValue: JSON.parse(JSON.stringify({ models: encryptedModels })),
            },
        });
        return this.getSystemConfig();
    }
    async testConfig(dto) {
        const startTime = Date.now();
        try {
            const testMessage = {
                role: 'user',
                content: 'Hello, this is a test message.',
            };
            let response;
            switch (dto.provider) {
                case 'OPENAI':
                    response = await this.testOpenAI(dto, testMessage);
                    break;
                case 'CLAUDE':
                    response = await this.testClaude(dto, testMessage);
                    break;
                case 'WENXIN':
                    response = await this.testWenxin(dto, testMessage);
                    break;
                case 'QWEN':
                    response = await this.testQwen(dto, testMessage);
                    break;
                case 'ZHIPU':
                    response = await this.testZhipu(dto, testMessage);
                    break;
                default:
                    throw new common_1.BadRequestException('不支持的AI服务商');
            }
            const responseTime = Date.now() - startTime;
            return {
                success: true,
                message: '连接测试成功',
                responseTime,
            };
        }
        catch (error) {
            return {
                success: false,
                message: `连接测试失败: ${error.message}`,
            };
        }
    }
    async testOpenAI(dto, message) {
        let baseUrl = dto.apiUrl;
        if (!baseUrl.startsWith('http')) {
            baseUrl = `https://${baseUrl}`;
        }
        baseUrl = baseUrl.replace(/\/+$/, '');
        let url = baseUrl;
        if (!url.includes('/chat/completions')) {
            if (url.endsWith('/v1')) {
                url = `${url}/chat/completions`;
            }
            else if (!url.includes('/v1')) {
                url = `${url}/v1/chat/completions`;
            }
            else {
                url = `${url}/chat/completions`;
            }
        }
        const response = await axios_1.default.post(url, {
            model: dto.model,
            messages: [message],
            max_tokens: 10,
            temperature: dto.parameters?.temperature || 0.7,
        }, {
            headers: {
                'Authorization': `Bearer ${dto.apiKey}`,
                'Content-Type': 'application/json',
            },
            timeout: 10000,
        });
        return response.data;
    }
    async testClaude(dto, message) {
        let baseUrl = dto.apiUrl;
        if (!baseUrl.startsWith('http')) {
            baseUrl = `https://${baseUrl}`;
        }
        baseUrl = baseUrl.replace(/\/+$/, '');
        let url = baseUrl;
        if (!url.includes('/messages')) {
            if (url.endsWith('/v1')) {
                url = `${url}/messages`;
            }
            else if (!url.includes('/v1')) {
                url = `${url}/v1/messages`;
            }
            else {
                url = `${url}/messages`;
            }
        }
        const response = await axios_1.default.post(url, {
            model: dto.model,
            messages: [message],
            max_tokens: 10,
            temperature: dto.parameters?.temperature || 0.7,
        }, {
            headers: {
                'x-api-key': dto.apiKey,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json',
            },
            timeout: 10000,
        });
        return response.data;
    }
    async testWenxin(dto, message) {
        const url = dto.apiUrl.startsWith('http')
            ? dto.apiUrl
            : `https://${dto.apiUrl}`;
        const response = await axios_1.default.post(url, {
            messages: [message],
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
            params: {
                access_token: dto.apiKey,
            },
            timeout: 10000,
        });
        return response.data;
    }
    async testQwen(dto, message) {
        const url = dto.apiUrl.startsWith('http')
            ? dto.apiUrl
            : `https://${dto.apiUrl}`;
        const response = await axios_1.default.post(url, {
            model: dto.model,
            input: {
                messages: [message],
            },
            parameters: {
                result_format: 'message',
            },
        }, {
            headers: {
                'Authorization': `Bearer ${dto.apiKey}`,
                'Content-Type': 'application/json',
            },
            timeout: 10000,
        });
        return response.data;
    }
    async testZhipu(dto, message) {
        const url = dto.apiUrl.startsWith('http')
            ? dto.apiUrl
            : `https://${dto.apiUrl}`;
        const response = await axios_1.default.post(url, {
            model: dto.model,
            messages: [message],
        }, {
            headers: {
                'Authorization': dto.apiKey,
                'Content-Type': 'application/json',
            },
            timeout: 10000,
        });
        return response.data;
    }
    validateConfig(dto) {
        const { models } = dto;
        const ids = models.map((m) => m.id);
        const uniqueIds = new Set(ids);
        if (ids.length !== uniqueIds.size) {
            throw new common_1.BadRequestException('模型ID不能重复');
        }
        const defaultModels = models.filter((m) => m.isDefault);
        if (defaultModels.length > 1) {
            throw new common_1.BadRequestException('只能有一个默认模型');
        }
        models.forEach((model) => {
            if (!model.name || !model.provider || !model.model || !model.apiUrl || !model.apiKey) {
                throw new common_1.BadRequestException(`模型 ${model.id} 配置不完整`);
            }
        });
    }
    encrypt(text) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.ALGORITHM, Buffer.from(this.ENCRYPTION_KEY.slice(0, 32)), iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return `${iv.toString('hex')}:${encrypted}`;
    }
    decrypt(text) {
        try {
            const parts = text.split(':');
            const iv = Buffer.from(parts[0], 'hex');
            const encryptedText = parts[1];
            const decipher = crypto.createDecipheriv(this.ALGORITHM, Buffer.from(this.ENCRYPTION_KEY.slice(0, 32)), iv);
            let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        }
        catch (error) {
            return text;
        }
    }
};
exports.AIConfigService = AIConfigService;
exports.AIConfigService = AIConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], AIConfigService);


/***/ }),
/* 37 */
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),
/* 38 */
/***/ ((module) => {

module.exports = require("axios");

/***/ }),
/* 39 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AIUsageStatsResponseDto = exports.AIChatResponseDto = exports.AIChatRequestDto = exports.AIChatMessageDto = exports.AvailableAIConfigsResponseDto = exports.UserAIConfigResponseDto = exports.UpdateUserAIConfigDto = exports.CreateUserAIConfigDto = exports.TestAIConfigDto = exports.UpdateSystemAIConfigDto = exports.GetSystemAIConfigResponseDto = exports.SystemAIModelDto = exports.AIModelLimitsDto = exports.AIModelParametersDto = exports.AITier = void 0;
const class_validator_1 = __webpack_require__(22);
const class_transformer_1 = __webpack_require__(23);
const client_1 = __webpack_require__(13);
var AITier;
(function (AITier) {
    AITier["FREE"] = "FREE";
    AITier["BASIC"] = "BASIC";
    AITier["PREMIUM"] = "PREMIUM";
    AITier["UNLIMITED"] = "UNLIMITED";
})(AITier || (exports.AITier = AITier = {}));
class AIModelParametersDto {
    constructor() {
        this.temperature = 0.7;
        this.topP = 1.0;
        this.frequencyPenalty = 0;
        this.presencePenalty = 0;
        this.timeout = 30;
        this.stream = true;
    }
}
exports.AIModelParametersDto = AIModelParametersDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(2),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], AIModelParametersDto.prototype, "temperature", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], AIModelParametersDto.prototype, "topP", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-2),
    (0, class_validator_1.Max)(2),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], AIModelParametersDto.prototype, "frequencyPenalty", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-2),
    (0, class_validator_1.Max)(2),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], AIModelParametersDto.prototype, "presencePenalty", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], AIModelParametersDto.prototype, "maxTokens", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(300),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], AIModelParametersDto.prototype, "timeout", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], AIModelParametersDto.prototype, "stream", void 0);
class AIModelLimitsDto {
}
exports.AIModelLimitsDto = AIModelLimitsDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], AIModelLimitsDto.prototype, "maxTokens", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], AIModelLimitsDto.prototype, "dailyLimit", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], AIModelLimitsDto.prototype, "monthlyLimit", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], AIModelLimitsDto.prototype, "concurrentLimit", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], AIModelLimitsDto.prototype, "rateLimit", void 0);
class SystemAIModelDto {
    constructor() {
        this.enabled = true;
        this.isDefault = false;
        this.tier = AITier.FREE;
    }
}
exports.SystemAIModelDto = SystemAIModelDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SystemAIModelDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SystemAIModelDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.AIProvider),
    __metadata("design:type", typeof (_a = typeof client_1.AIProvider !== "undefined" && client_1.AIProvider) === "function" ? _a : Object)
], SystemAIModelDto.prototype, "provider", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SystemAIModelDto.prototype, "model", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SystemAIModelDto.prototype, "apiUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SystemAIModelDto.prototype, "apiKey", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], SystemAIModelDto.prototype, "enabled", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], SystemAIModelDto.prototype, "isDefault", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(AITier),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SystemAIModelDto.prototype, "tier", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SystemAIModelDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AIModelLimitsDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", AIModelLimitsDto)
], SystemAIModelDto.prototype, "limits", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AIModelParametersDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", AIModelParametersDto)
], SystemAIModelDto.prototype, "parameters", void 0);
class GetSystemAIConfigResponseDto {
}
exports.GetSystemAIConfigResponseDto = GetSystemAIConfigResponseDto;
__decorate([
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SystemAIModelDto),
    __metadata("design:type", Array)
], GetSystemAIConfigResponseDto.prototype, "models", void 0);
class UpdateSystemAIConfigDto {
}
exports.UpdateSystemAIConfigDto = UpdateSystemAIConfigDto;
__decorate([
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SystemAIModelDto),
    __metadata("design:type", Array)
], UpdateSystemAIConfigDto.prototype, "models", void 0);
class TestAIConfigDto {
}
exports.TestAIConfigDto = TestAIConfigDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.AIProvider),
    __metadata("design:type", typeof (_b = typeof client_1.AIProvider !== "undefined" && client_1.AIProvider) === "function" ? _b : Object)
], TestAIConfigDto.prototype, "provider", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], TestAIConfigDto.prototype, "apiUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], TestAIConfigDto.prototype, "apiKey", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], TestAIConfigDto.prototype, "model", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AIModelParametersDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", AIModelParametersDto)
], TestAIConfigDto.prototype, "parameters", void 0);
class CreateUserAIConfigDto {
    constructor() {
        this.enabled = true;
        this.isDefault = false;
    }
}
exports.CreateUserAIConfigDto = CreateUserAIConfigDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateUserAIConfigDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.AIProvider),
    __metadata("design:type", typeof (_c = typeof client_1.AIProvider !== "undefined" && client_1.AIProvider) === "function" ? _c : Object)
], CreateUserAIConfigDto.prototype, "provider", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateUserAIConfigDto.prototype, "model", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateUserAIConfigDto.prototype, "apiUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateUserAIConfigDto.prototype, "apiKey", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateUserAIConfigDto.prototype, "enabled", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateUserAIConfigDto.prototype, "isDefault", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AIModelParametersDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", AIModelParametersDto)
], CreateUserAIConfigDto.prototype, "parameters", void 0);
class UpdateUserAIConfigDto {
}
exports.UpdateUserAIConfigDto = UpdateUserAIConfigDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateUserAIConfigDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.AIProvider),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", typeof (_d = typeof client_1.AIProvider !== "undefined" && client_1.AIProvider) === "function" ? _d : Object)
], UpdateUserAIConfigDto.prototype, "provider", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateUserAIConfigDto.prototype, "model", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateUserAIConfigDto.prototype, "apiUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateUserAIConfigDto.prototype, "apiKey", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateUserAIConfigDto.prototype, "enabled", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateUserAIConfigDto.prototype, "isDefault", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AIModelParametersDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", AIModelParametersDto)
], UpdateUserAIConfigDto.prototype, "parameters", void 0);
class UserAIConfigResponseDto {
}
exports.UserAIConfigResponseDto = UserAIConfigResponseDto;
class AvailableAIConfigsResponseDto {
}
exports.AvailableAIConfigsResponseDto = AvailableAIConfigsResponseDto;
class AIChatMessageDto {
}
exports.AIChatMessageDto = AIChatMessageDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AIChatMessageDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AIChatMessageDto.prototype, "content", void 0);
class AIChatRequestDto {
    constructor() {
        this.stream = false;
    }
}
exports.AIChatRequestDto = AIChatRequestDto;
__decorate([
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => AIChatMessageDto),
    __metadata("design:type", Array)
], AIChatRequestDto.prototype, "messages", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AIChatRequestDto.prototype, "configId", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], AIChatRequestDto.prototype, "stream", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AIModelParametersDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", AIModelParametersDto)
], AIChatRequestDto.prototype, "options", void 0);
class AIChatResponseDto {
}
exports.AIChatResponseDto = AIChatResponseDto;
class AIUsageStatsResponseDto {
}
exports.AIUsageStatsResponseDto = AIUsageStatsResponseDto;


/***/ }),
/* 40 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtStrategy = void 0;
const common_1 = __webpack_require__(2);
const config_1 = __webpack_require__(4);
const passport_1 = __webpack_require__(8);
const passport_jwt_1 = __webpack_require__(41);
const database_1 = __webpack_require__(10);
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(configService, prisma) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET', '91writing_default_secret'),
        });
        this.configService = configService;
        this.prisma = prisma;
    }
    async validate(payload) {
        const { sub, email, role } = payload;
        const user = await this.prisma.user.findUnique({
            where: { id: sub },
            include: {
                profile: true,
                subscription: {
                    include: {
                        package: true,
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('用户不存在');
        }
        if (user.status !== 'ACTIVE') {
            throw new common_1.UnauthorizedException('用户账号已被禁用');
        }
        return {
            id: user.id,
            email: user.email,
            nickname: user.nickname,
            role: user.role,
            status: user.status,
            isActive: user.isActive,
            tenantId: user.tenantId,
            profile: user.profile,
            subscription: user.subscription,
            lastLoginAt: user.lastLoginAt,
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _b : Object])
], JwtStrategy);


/***/ }),
/* 41 */
/***/ ((module) => {

module.exports = require("passport-jwt");

/***/ }),
/* 42 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AllExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AllExceptionsFilter = void 0;
const common_1 = __webpack_require__(2);
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    constructor() {
        this.logger = new common_1.Logger(AllExceptionsFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status;
        let message;
        let error;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                message = exceptionResponse.message || exception.message;
                error = exceptionResponse.error || 'Http Exception';
            }
            else {
                message = exceptionResponse;
                error = 'Http Exception';
            }
        }
        else {
            status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            message = '服务器内部错误';
            error = 'Internal Server Error';
        }
        const errorInfo = {
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            statusCode: status,
            error,
            message,
            userAgent: request.get('User-Agent'),
            ip: request.ip,
        };
        if (status >= 500) {
            this.logger.error('服务器错误', exception);
        }
        else if (status >= 400) {
            this.logger.warn('客户端错误', errorInfo);
        }
        response.status(status).json({
            success: false,
            error: {
                code: status,
                message,
                error,
                timestamp: errorInfo.timestamp,
                path: errorInfo.path,
            },
        });
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);


/***/ }),
/* 43 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ResponseInterceptor = void 0;
const common_1 = __webpack_require__(2);
const operators_1 = __webpack_require__(44);
let ResponseInterceptor = class ResponseInterceptor {
    intercept(context, next) {
        return next.handle().pipe((0, operators_1.map)((data) => {
            if (data && typeof data === 'object' && 'success' in data) {
                return data;
            }
            return {
                success: true,
                data,
                message: this.getSuccessMessage(context),
                timestamp: new Date().toISOString(),
            };
        }));
    }
    getSuccessMessage(context) {
        const request = context.switchToHttp().getRequest();
        const method = request.method;
        const path = request.route?.path || request.url;
        if (method === 'POST') {
            if (path.includes('login'))
                return '登录成功';
            if (path.includes('logout'))
                return '登出成功';
            return '创建成功';
        }
        if (method === 'PUT' || method === 'PATCH') {
            return '更新成功';
        }
        if (method === 'DELETE') {
            return '删除成功';
        }
        return '';
    }
};
exports.ResponseInterceptor = ResponseInterceptor;
exports.ResponseInterceptor = ResponseInterceptor = __decorate([
    (0, common_1.Injectable)()
], ResponseInterceptor);


/***/ }),
/* 44 */
/***/ ((module) => {

module.exports = require("rxjs/operators");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(1);
const common_1 = __webpack_require__(2);
const swagger_1 = __webpack_require__(3);
const config_1 = __webpack_require__(4);
const app_module_1 = __webpack_require__(5);
const all_exceptions_filter_1 = __webpack_require__(42);
const response_interceptor_1 = __webpack_require__(43);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.enableCors({
        origin: process.env.NODE_ENV === 'production'
            ? ['https://91writing.com', 'https://www.91writing.com']
            : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:7520', 'http://localhost:4173', 'http://localhost:8080'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    app.useGlobalInterceptors(new response_interceptor_1.ResponseInterceptor());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('91Writing 管理后台 API')
        .setDescription('91Writing 管理后台服务接口文档')
        .setVersion('1.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: '请输入JWT token',
        in: 'header',
    }, 'JWT-auth')
        .addTag('管理员认证', '管理员登录、权限验证等')
        .addTag('用户管理', '用户增删改查、统计等')
        .addTag('订阅管理', '订阅数据管理、统计分析等')
        .addTag('系统配置', '系统参数配置管理')
        .addTag('健康检查', '服务健康状态检查')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api-docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
    const port = configService.get('ADMIN_SERVICE_PORT', 3006);
    await app.listen(port);
    console.log(`🚀 管理后台服务启动成功: http://localhost:${port}`);
    console.log(`📖 API文档地址: http://localhost:${port}/api-docs`);
}
bootstrap().catch((error) => {
    console.error('启动管理后台服务失败:', error);
    process.exit(1);
});

})();

/******/ })()
;