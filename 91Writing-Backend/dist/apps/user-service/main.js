/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("dotenv");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("@nestjs/swagger");

/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("helmet");

/***/ }),
/* 7 */
/***/ ((module) => {

module.exports = require("compression");

/***/ }),
/* 8 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const common_1 = __webpack_require__(3);
const config_1 = __webpack_require__(5);
const jwt_1 = __webpack_require__(9);
const passport_1 = __webpack_require__(10);
const database_1 = __webpack_require__(11);
const user_module_1 = __webpack_require__(15);
const health_module_1 = __webpack_require__(36);
const ai_config_module_1 = __webpack_require__(40);
const jwt_strategy_1 = __webpack_require__(45);
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
            database_1.DatabaseModule,
            user_module_1.UserModule,
            health_module_1.HealthModule,
            ai_config_module_1.UserAIConfigModule,
        ],
        controllers: [],
        providers: [
            jwt_strategy_1.JwtStrategy,
        ],
    })
], AppModule);


/***/ }),
/* 9 */
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("@nestjs/passport");

/***/ }),
/* 11 */
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
__exportStar(__webpack_require__(12), exports);
__exportStar(__webpack_require__(13), exports);


/***/ }),
/* 12 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabaseModule = void 0;
const common_1 = __webpack_require__(3);
const config_1 = __webpack_require__(5);
const prisma_service_1 = __webpack_require__(13);
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
/* 13 */
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
const common_1 = __webpack_require__(3);
const config_1 = __webpack_require__(5);
const client_1 = __webpack_require__(14);
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
/* 14 */
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),
/* 15 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserModule = void 0;
const common_1 = __webpack_require__(3);
const user_controller_1 = __webpack_require__(16);
const user_service_1 = __webpack_require__(17);
let UserModule = class UserModule {
};
exports.UserModule = UserModule;
exports.UserModule = UserModule = __decorate([
    (0, common_1.Module)({
        controllers: [user_controller_1.UserController],
        providers: [user_service_1.UserService],
        exports: [user_service_1.UserService],
    })
], UserModule);


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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(4);
const user_service_1 = __webpack_require__(17);
const create_user_dto_1 = __webpack_require__(21);
const update_user_dto_1 = __webpack_require__(23);
const query_user_dto_1 = __webpack_require__(24);
const user_response_dto_1 = __webpack_require__(18);
const common_2 = __webpack_require__(25);
let UserController = class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    async create(createUserDto) {
        return this.userService.create(createUserDto);
    }
    async findAll(queryDto) {
        return this.userService.findMany(queryDto);
    }
    async getStats(statsDto) {
        return this.userService.getStats(statsDto);
    }
    async findByEmail(email) {
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new Error('用户不存在');
        }
        return user;
    }
    async findOne(id) {
        return this.userService.findOne(id);
    }
    async update(id, updateUserDto) {
        return this.userService.update(id, updateUserDto);
    }
    async updatePassword(id, updatePasswordDto) {
        await this.userService.updatePassword(id, updatePasswordDto);
        return { message: '密码更新成功' };
    }
    async updateLastLogin(id) {
        await this.userService.updateLastLogin(id);
        return { message: '最后登录时间更新成功' };
    }
    async remove(id) {
        await this.userService.remove(id);
        return { message: '用户删除成功' };
    }
    async hardDelete(id) {
        await this.userService.hardDelete(id);
        return { message: '用户永久删除成功' };
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: '创建用户',
        description: '创建新用户账户，包含基本信息验证和密码哈希处理'
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: '用户创建成功',
        type: user_response_dto_1.UserResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: '邮箱已被注册',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '数据验证失败',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof create_user_dto_1.CreateUserDto !== "undefined" && create_user_dto_1.CreateUserDto) === "function" ? _b : Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], UserController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: '获取用户列表',
        description: '分页查询用户列表，支持搜索、过滤和排序'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '用户列表查询成功',
        type: user_response_dto_1.UserListResponseDto,
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: '页码，默认为1' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: '每页数量，默认为10' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String, description: '搜索关键词（邮箱或昵称）' }),
    (0, swagger_1.ApiQuery)({ name: 'role', required: false, enum: ['USER', 'ADMIN', 'MODERATOR'], description: '用户角色过滤' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['ACTIVE', 'INACTIVE', 'BANNED'], description: '用户状态过滤' }),
    (0, swagger_1.ApiQuery)({ name: 'isActive', required: false, type: Boolean, description: '是否激活' }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', required: false, type: String, description: '租户ID过滤' }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', required: false, type: String, description: '排序字段' }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: '排序方向' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof query_user_dto_1.QueryUserDto !== "undefined" && query_user_dto_1.QueryUserDto) === "function" ? _d : Object]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], UserController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: '获取用户统计信息',
        description: '获取用户总数、活跃用户数、新用户数等统计信息'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '统计信息获取成功',
        type: user_response_dto_1.UserStatsResponseDto,
    }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String, description: '开始日期' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String, description: '结束日期' }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', required: false, type: String, description: '租户ID' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof query_user_dto_1.UserStatsDto !== "undefined" && query_user_dto_1.UserStatsDto) === "function" ? _f : Object]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], UserController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('email/:email'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: '根据邮箱查询用户',
        description: '通过邮箱地址查询用户信息'
    }),
    (0, swagger_1.ApiParam)({ name: 'email', description: '用户邮箱地址' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '用户信息获取成功',
        type: user_response_dto_1.UserResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: '用户不存在',
    }),
    __param(0, (0, common_1.Param)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], UserController.prototype, "findByEmail", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: '获取用户详情',
        description: '根据用户ID获取用户详细信息，包含配置和订阅信息'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '用户ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '用户详情获取成功',
        type: user_response_dto_1.UserProfileResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: '用户不存在',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], UserController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: '更新用户信息',
        description: '更新用户基本信息，不包括密码和邮箱'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '用户ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '用户信息更新成功',
        type: user_response_dto_1.UserResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: '用户不存在',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_k = typeof update_user_dto_1.UpdateUserDto !== "undefined" && update_user_dto_1.UpdateUserDto) === "function" ? _k : Object]),
    __metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], UserController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/password'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: '更新用户密码',
        description: '更新用户密码，需要验证当前密码'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '用户ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '密码更新成功',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '当前密码不正确',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: '用户不存在',
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_m = typeof update_user_dto_1.UpdatePasswordDto !== "undefined" && update_user_dto_1.UpdatePasswordDto) === "function" ? _m : Object]),
    __metadata("design:returntype", typeof (_o = typeof Promise !== "undefined" && Promise) === "function" ? _o : Object)
], UserController.prototype, "updatePassword", null);
__decorate([
    (0, common_1.Patch)(':id/last-login'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: '更新最后登录时间',
        description: '更新用户的最后登录时间戳'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '用户ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '最后登录时间更新成功',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: '用户不存在',
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_p = typeof Promise !== "undefined" && Promise) === "function" ? _p : Object)
], UserController.prototype, "updateLastLogin", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: '软删除用户',
        description: '软删除用户，将用户状态设置为非活跃'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '用户ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '用户删除成功',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: '用户不存在',
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_q = typeof Promise !== "undefined" && Promise) === "function" ? _q : Object)
], UserController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)(':id/hard'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: '永久删除用户',
        description: '永久删除用户及其所有相关数据，此操作不可恢复'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '用户ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '用户永久删除成功',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: '用户不存在',
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_r = typeof Promise !== "undefined" && Promise) === "function" ? _r : Object)
], UserController.prototype, "hardDelete", null);
exports.UserController = UserController = __decorate([
    (0, swagger_1.ApiTags)('用户管理'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof user_service_1.UserService !== "undefined" && user_service_1.UserService) === "function" ? _a : Object])
], UserController);


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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserService = void 0;
const common_1 = __webpack_require__(3);
const database_1 = __webpack_require__(11);
const user_response_dto_1 = __webpack_require__(18);
const class_transformer_1 = __webpack_require__(19);
const bcrypt = __webpack_require__(20);
const client_1 = __webpack_require__(14);
let UserService = class UserService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateUniqueInviteCode() {
        let attempts = 0;
        const maxAttempts = 10;
        while (attempts < maxAttempts) {
            const code = this.generateRandomCode(6);
            const existing = await this.prisma.user.findUnique({
                where: { inviteCode: code }
            });
            if (!existing) {
                return code;
            }
            attempts++;
        }
        throw new Error('生成邀请码失败，请重试');
    }
    generateRandomCode(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    async create(createUserDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createUserDto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('该邮箱已被注册');
        }
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(createUserDto.password, saltRounds);
        const inviteCode = await this.generateUniqueInviteCode();
        const user = await this.prisma.user.create({
            data: {
                email: createUserDto.email,
                passwordHash,
                nickname: createUserDto.nickname || createUserDto.email.split('@')[0],
                role: createUserDto.role || client_1.UserRole.USER,
                status: createUserDto.status || client_1.UserStatus.ACTIVE,
                isActive: true,
                tenantId: createUserDto.tenantId,
                inviteCode,
            },
            include: {
                profile: true,
            },
        });
        return (0, class_transformer_1.plainToClass)(user_response_dto_1.UserResponseDto, user, {
            excludeExtraneousValues: true,
        });
    }
    async findMany(queryDto) {
        const { page = 1, limit = 10, search, role, status, isActive, tenantId, sortBy = 'createdAt', sortOrder = 'desc' } = queryDto;
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { nickname: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (role)
            where.role = role;
        if (status)
            where.status = status;
        if (typeof isActive === 'boolean')
            where.isActive = isActive;
        if (tenantId)
            where.tenantId = tenantId;
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    profile: true,
                },
            }),
            this.prisma.user.count({ where }),
        ]);
        const userDtos = users.map(user => (0, class_transformer_1.plainToClass)(user_response_dto_1.UserResponseDto, user, {
            excludeExtraneousValues: true,
        }));
        const totalPages = Math.ceil(total / limit);
        return new user_response_dto_1.UserListResponseDto(userDtos, {
            total,
            page,
            limit,
            totalPages,
        });
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
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
            throw new common_1.NotFoundException('用户不存在');
        }
        return (0, class_transformer_1.plainToClass)(user_response_dto_1.UserProfileResponseDto, {
            ...user,
            subscription: user.subscription ? {
                packageId: user.subscription.packageId,
                status: user.subscription.status,
                startDate: user.subscription.startDate,
                endDate: user.subscription.endDate,
            } : undefined,
        }, {
            excludeExtraneousValues: true,
        });
    }
    async findByEmail(email) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: {
                profile: true,
            },
        });
        if (!user) {
            return null;
        }
        return (0, class_transformer_1.plainToClass)(user_response_dto_1.UserResponseDto, user, {
            excludeExtraneousValues: true,
        });
    }
    async update(id, updateUserDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!existingUser) {
            throw new common_1.NotFoundException('用户不存在');
        }
        const user = await this.prisma.user.update({
            where: { id },
            data: {
                ...updateUserDto,
                updatedAt: new Date(),
            },
            include: {
                profile: true,
            },
        });
        return (0, class_transformer_1.plainToClass)(user_response_dto_1.UserResponseDto, user, {
            excludeExtraneousValues: true,
        });
    }
    async updatePassword(id, updatePasswordDto) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        const isCurrentPasswordValid = await bcrypt.compare(updatePasswordDto.currentPassword, user.passwordHash);
        if (!isCurrentPasswordValid) {
            throw new common_1.BadRequestException('当前密码不正确');
        }
        const saltRounds = 12;
        const newPasswordHash = await bcrypt.hash(updatePasswordDto.newPassword, saltRounds);
        await this.prisma.user.update({
            where: { id },
            data: {
                passwordHash: newPasswordHash,
                updatedAt: new Date(),
            },
        });
    }
    async remove(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        await this.prisma.user.update({
            where: { id },
            data: {
                isActive: false,
                status: client_1.UserStatus.INACTIVE,
                updatedAt: new Date(),
            },
        });
    }
    async hardDelete(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        await this.prisma.user.delete({
            where: { id },
        });
    }
    async getStats(statsDto) {
        const { startDate, endDate, tenantId } = statsDto;
        const where = {};
        if (tenantId)
            where.tenantId = tenantId;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = new Date(startDate);
            if (endDate)
                where.createdAt.lte = new Date(endDate);
        }
        const [totalUsers, activeUsers, newUsers] = await Promise.all([
            this.prisma.user.count({ where: { ...where } }),
            this.prisma.user.count({ where: { ...where, isActive: true } }),
            this.prisma.user.count({ where }),
        ]);
        const usersByRole = await this.prisma.user.groupBy({
            by: ['role'],
            where,
            _count: { role: true },
        });
        const usersByStatus = await this.prisma.user.groupBy({
            by: ['status'],
            where,
            _count: { status: true },
        });
        const roleStats = usersByRole.reduce((acc, item) => {
            acc[item.role] = item._count.role;
            return acc;
        }, {});
        const statusStats = usersByStatus.reduce((acc, item) => {
            acc[item.status] = item._count.status;
            return acc;
        }, {});
        return new user_response_dto_1.UserStatsResponseDto({
            totalUsers,
            activeUsers,
            newUsers,
            usersByRole: roleStats,
            usersByStatus: statusStats,
        });
    }
    async updateLastLogin(id) {
        await this.prisma.user.update({
            where: { id },
            data: {
                lastLoginAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], UserService);


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
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserStatsResponseDto = exports.UserListResponseDto = exports.UserProfileResponseDto = exports.UserResponseDto = void 0;
const swagger_1 = __webpack_require__(4);
const class_transformer_1 = __webpack_require__(19);
const client_1 = __webpack_require__(14);
class UserResponseDto {
    constructor(partial) {
        Object.assign(this, partial);
    }
}
exports.UserResponseDto = UserResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '用户ID',
        example: 'user_123456789'
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '用户邮箱',
        example: 'user@91writing.com'
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '用户昵称',
        example: '写作爱好者'
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "nickname", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '用户角色',
        enum: client_1.UserRole,
        example: client_1.UserRole.USER
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", typeof (_a = typeof client_1.UserRole !== "undefined" && client_1.UserRole) === "function" ? _a : Object)
], UserResponseDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '用户状态',
        enum: client_1.UserStatus,
        example: client_1.UserStatus.ACTIVE
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", typeof (_b = typeof client_1.UserStatus !== "undefined" && client_1.UserStatus) === "function" ? _b : Object)
], UserResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '是否激活',
        example: true
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], UserResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '租户ID',
        example: 'tenant_123'
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "tenantId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '最后登录时间',
        example: '2024-12-19T10:30:00Z'
    }),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.toISOString()),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], UserResponseDto.prototype, "lastLoginAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '创建时间',
        example: '2024-12-19T10:30:00Z'
    }),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.toISOString()),
    __metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], UserResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '更新时间',
        example: '2024-12-19T10:30:00Z'
    }),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.toISOString()),
    __metadata("design:type", typeof (_e = typeof Date !== "undefined" && Date) === "function" ? _e : Object)
], UserResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "password", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "passwordHash", void 0);
class UserProfileResponseDto extends UserResponseDto {
}
exports.UserProfileResponseDto = UserProfileResponseDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '用户配置',
        example: {
            avatar: 'https://example.com/avatar.jpg',
            bio: '热爱写作的用户',
            preferences: {
                theme: 'light',
                language: 'zh-CN'
            }
        }
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], UserProfileResponseDto.prototype, "profile", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '订阅信息',
        example: {
            packageId: 'package_premium',
            status: 'ACTIVE',
            startDate: '2024-01-01T00:00:00Z',
            endDate: '2025-01-01T00:00:00Z'
        }
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], UserProfileResponseDto.prototype, "subscription", void 0);
class UserListResponseDto {
    constructor(users, pagination) {
        this.users = users;
        this.pagination = pagination;
    }
}
exports.UserListResponseDto = UserListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '用户列表',
        type: [UserResponseDto]
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Array)
], UserListResponseDto.prototype, "users", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '分页信息',
        example: {
            total: 100,
            page: 1,
            limit: 10,
            totalPages: 10
        }
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], UserListResponseDto.prototype, "pagination", void 0);
class UserStatsResponseDto {
    constructor(partial) {
        Object.assign(this, partial);
    }
}
exports.UserStatsResponseDto = UserStatsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '总用户数',
        example: 1000
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], UserStatsResponseDto.prototype, "totalUsers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '活跃用户数',
        example: 800
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], UserStatsResponseDto.prototype, "activeUsers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '新注册用户数',
        example: 50
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], UserStatsResponseDto.prototype, "newUsers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '按角色分组的统计',
        example: {
            USER: 900,
            ADMIN: 5,
            MODERATOR: 10
        }
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", typeof (_f = typeof Record !== "undefined" && Record) === "function" ? _f : Object)
], UserStatsResponseDto.prototype, "usersByRole", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '按状态分组的统计',
        example: {
            ACTIVE: 800,
            INACTIVE: 150,
            BANNED: 50
        }
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", typeof (_g = typeof Record !== "undefined" && Record) === "function" ? _g : Object)
], UserStatsResponseDto.prototype, "usersByStatus", void 0);


/***/ }),
/* 19 */
/***/ ((module) => {

module.exports = require("class-transformer");

/***/ }),
/* 20 */
/***/ ((module) => {

module.exports = require("bcrypt");

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
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateUserDto = void 0;
const swagger_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(22);
const client_1 = __webpack_require__(14);
class CreateUserDto {
    constructor() {
        this.role = client_1.UserRole.USER;
        this.status = client_1.UserStatus.ACTIVE;
        this.acceptTerms = true;
    }
}
exports.CreateUserDto = CreateUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '用户邮箱地址',
        example: 'user@91writing.com',
        format: 'email'
    }),
    (0, class_validator_1.IsEmail)({}, { message: '请输入有效的邮箱地址' }),
    (0, class_validator_1.MaxLength)(100, { message: '邮箱地址不能超过100个字符' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '用户密码',
        example: 'password123',
        minLength: 8,
        maxLength: 50
    }),
    (0, class_validator_1.IsString)({ message: '密码必须是字符串' }),
    (0, class_validator_1.MinLength)(8, { message: '密码至少需要8个字符' }),
    (0, class_validator_1.MaxLength)(50, { message: '密码不能超过50个字符' }),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: '密码必须包含大小写字母和数字'
    }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '用户昵称',
        example: '写作爱好者',
        maxLength: 50
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '昵称必须是字符串' }),
    (0, class_validator_1.MaxLength)(50, { message: '昵称不能超过50个字符' }),
    (0, class_validator_1.Matches)(/^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/, {
        message: '昵称只能包含中英文、数字、下划线和连字符'
    }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "nickname", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '用户角色',
        enum: client_1.UserRole,
        default: client_1.UserRole.USER
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.UserRole, { message: '无效的用户角色' }),
    __metadata("design:type", typeof (_a = typeof client_1.UserRole !== "undefined" && client_1.UserRole) === "function" ? _a : Object)
], CreateUserDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '用户状态',
        enum: client_1.UserStatus,
        default: client_1.UserStatus.ACTIVE
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.UserStatus, { message: '无效的用户状态' }),
    __metadata("design:type", typeof (_b = typeof client_1.UserStatus !== "undefined" && client_1.UserStatus) === "function" ? _b : Object)
], CreateUserDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '租户ID (多租户使用)',
        example: 'tenant_123'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '租户ID必须是字符串' }),
    (0, class_validator_1.MaxLength)(50, { message: '租户ID不能超过50个字符' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "tenantId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '是否接受服务条款',
        default: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: '服务条款接受状态必须是布尔值' }),
    __metadata("design:type", Boolean)
], CreateUserDto.prototype, "acceptTerms", void 0);


/***/ }),
/* 22 */
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),
/* 23 */
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
exports.UpdatePasswordDto = exports.UpdateUserDto = void 0;
const swagger_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(22);
const client_1 = __webpack_require__(14);
const create_user_dto_1 = __webpack_require__(21);
class UpdateUserDto extends (0, swagger_1.PartialType)((0, swagger_1.OmitType)(create_user_dto_1.CreateUserDto, ['email', 'password', 'tenantId'])) {
}
exports.UpdateUserDto = UpdateUserDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '用户昵称',
        example: '新昵称',
        maxLength: 50
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '昵称必须是字符串' }),
    (0, class_validator_1.MaxLength)(50, { message: '昵称不能超过50个字符' }),
    (0, class_validator_1.Matches)(/^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/, {
        message: '昵称只能包含中英文、数字、下划线和连字符'
    }),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "nickname", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '用户角色',
        enum: client_1.UserRole
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.UserRole, { message: '无效的用户角色' }),
    __metadata("design:type", typeof (_a = typeof client_1.UserRole !== "undefined" && client_1.UserRole) === "function" ? _a : Object)
], UpdateUserDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '用户状态',
        enum: client_1.UserStatus
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.UserStatus, { message: '无效的用户状态' }),
    __metadata("design:type", typeof (_b = typeof client_1.UserStatus !== "undefined" && client_1.UserStatus) === "function" ? _b : Object)
], UpdateUserDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '是否激活',
        example: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: '激活状态必须是布尔值' }),
    __metadata("design:type", Boolean)
], UpdateUserDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '最后登录时间',
        example: '2024-12-19T10:30:00Z'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: '请输入有效的日期时间格式' }),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "lastLoginAt", void 0);
class UpdatePasswordDto {
}
exports.UpdatePasswordDto = UpdatePasswordDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '当前密码',
        example: 'oldPassword123'
    }),
    (0, class_validator_1.IsString)({ message: '当前密码必须是字符串' }),
    __metadata("design:type", String)
], UpdatePasswordDto.prototype, "currentPassword", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '新密码',
        example: 'newPassword123',
        minLength: 8,
        maxLength: 50
    }),
    (0, class_validator_1.IsString)({ message: '新密码必须是字符串' }),
    (0, class_validator_1.MaxLength)(50, { message: '新密码不能超过50个字符' }),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: '新密码必须包含大小写字母和数字'
    }),
    __metadata("design:type", String)
], UpdatePasswordDto.prototype, "newPassword", void 0);


/***/ }),
/* 24 */
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
exports.UserStatsDto = exports.QueryUserDto = void 0;
const swagger_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(22);
const class_transformer_1 = __webpack_require__(19);
const client_1 = __webpack_require__(14);
class QueryUserDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
        this.sortBy = 'createdAt';
        this.sortOrder = 'desc';
    }
}
exports.QueryUserDto = QueryUserDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '页码',
        example: 1,
        minimum: 1
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: '页码必须是整数' }),
    (0, class_validator_1.Min)(1, { message: '页码最小为1' }),
    __metadata("design:type", Number)
], QueryUserDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '每页数量',
        example: 10,
        minimum: 1,
        maximum: 100
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: '每页数量必须是整数' }),
    (0, class_validator_1.Min)(1, { message: '每页数量最小为1' }),
    (0, class_validator_1.Max)(100, { message: '每页数量最大为100' }),
    __metadata("design:type", Number)
], QueryUserDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '搜索关键词（邮箱或昵称）',
        example: 'user@example.com'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '搜索关键词必须是字符串' }),
    __metadata("design:type", String)
], QueryUserDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '用户角色过滤',
        enum: client_1.UserRole
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.UserRole, { message: '无效的用户角色' }),
    __metadata("design:type", typeof (_a = typeof client_1.UserRole !== "undefined" && client_1.UserRole) === "function" ? _a : Object)
], QueryUserDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '用户状态过滤',
        enum: client_1.UserStatus
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.UserStatus, { message: '无效的用户状态' }),
    __metadata("design:type", typeof (_b = typeof client_1.UserStatus !== "undefined" && client_1.UserStatus) === "function" ? _b : Object)
], QueryUserDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '是否激活',
        example: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return value;
    }),
    (0, class_validator_1.IsBoolean)({ message: '激活状态必须是布尔值' }),
    __metadata("design:type", Boolean)
], QueryUserDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '租户ID过滤',
        example: 'tenant_123'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '租户ID必须是字符串' }),
    __metadata("design:type", String)
], QueryUserDto.prototype, "tenantId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '排序字段',
        example: 'createdAt',
        enum: ['createdAt', 'updatedAt', 'lastLoginAt', 'email', 'nickname']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '排序字段必须是字符串' }),
    __metadata("design:type", String)
], QueryUserDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '排序方向',
        example: 'desc',
        enum: ['asc', 'desc']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['asc', 'desc'], { message: '排序方向必须是 asc 或 desc' }),
    __metadata("design:type", String)
], QueryUserDto.prototype, "sortOrder", void 0);
class UserStatsDto {
}
exports.UserStatsDto = UserStatsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '开始日期',
        example: '2024-01-01'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '开始日期必须是字符串' }),
    __metadata("design:type", String)
], UserStatsDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '结束日期',
        example: '2024-12-31'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '结束日期必须是字符串' }),
    __metadata("design:type", String)
], UserStatsDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '租户ID',
        example: 'tenant_123'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '租户ID必须是字符串' }),
    __metadata("design:type", String)
], UserStatsDto.prototype, "tenantId", void 0);


/***/ }),
/* 25 */
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
__exportStar(__webpack_require__(26), exports);
__exportStar(__webpack_require__(29), exports);
__exportStar(__webpack_require__(32), exports);
__exportStar(__webpack_require__(33), exports);
__exportStar(__webpack_require__(34), exports);
__exportStar(__webpack_require__(35), exports);


/***/ }),
/* 26 */
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
__exportStar(__webpack_require__(27), exports);
__exportStar(__webpack_require__(28), exports);


/***/ }),
/* 27 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TenantId = exports.Tenant = void 0;
const common_1 = __webpack_require__(3);
exports.Tenant = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantId || request.headers['x-tenant-id'];
});
exports.TenantId = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.tenantId || request.headers['x-tenant-id'];
});


/***/ }),
/* 28 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CurrentUser = exports.User = void 0;
const common_1 = __webpack_require__(3);
exports.User = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
});
exports.CurrentUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
});


/***/ }),
/* 29 */
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
__exportStar(__webpack_require__(30), exports);
__exportStar(__webpack_require__(31), exports);


/***/ }),
/* 30 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtAuthGuard = void 0;
const common_1 = __webpack_require__(3);
const passport_1 = __webpack_require__(10);
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
/* 31 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TenantGuard = void 0;
const common_1 = __webpack_require__(3);
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
/* 32 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 33 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 34 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 35 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 36 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HealthModule = void 0;
const common_1 = __webpack_require__(3);
const terminus_1 = __webpack_require__(37);
const health_controller_1 = __webpack_require__(38);
const health_service_1 = __webpack_require__(39);
let HealthModule = class HealthModule {
};
exports.HealthModule = HealthModule;
exports.HealthModule = HealthModule = __decorate([
    (0, common_1.Module)({
        imports: [terminus_1.TerminusModule],
        controllers: [health_controller_1.HealthController],
        providers: [health_service_1.HealthService],
    })
], HealthModule);


/***/ }),
/* 37 */
/***/ ((module) => {

module.exports = require("@nestjs/terminus");

/***/ }),
/* 38 */
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
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HealthController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(4);
const terminus_1 = __webpack_require__(37);
const database_1 = __webpack_require__(11);
let HealthController = class HealthController {
    constructor(health, prismaHealth, memory, disk, prisma) {
        this.health = health;
        this.prismaHealth = prismaHealth;
        this.memory = memory;
        this.disk = disk;
        this.prisma = prisma;
    }
    async check() {
        return this.health.check([
            () => this.prismaHealth.pingCheck('database', this.prisma),
            () => this.memory.checkHeap('memory_heap', 1024 * 1024 * 1024),
            () => this.memory.checkRSS('memory_rss', 1536 * 1024 * 1024),
        ]);
    }
    async ready() {
        return this.health.check([
            () => this.prismaHealth.pingCheck('database', this.prisma),
        ]);
    }
    async live() {
        return this.health.check([
            () => this.memory.checkHeap('memory_heap', 1024 * 1024 * 1024),
            () => this.disk.checkStorage('storage', {
                path: '/',
                thresholdPercent: 0.9
            }),
        ]);
    }
    async detailed() {
        const basicHealth = await this.check();
        return {
            ...basicHealth,
            service: {
                name: '91Writing 用户服务',
                version: '1.0.0',
                uptime: process.uptime(),
                timestamp: new Date().toISOString(),
                nodeVersion: process.version,
                environment: process.env.NODE_ENV || 'development',
            },
            metrics: {
                memoryUsage: process.memoryUsage(),
                cpuUsage: process.cpuUsage(),
            },
        };
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: '基础健康检查',
        description: '检查用户服务的基本运行状态'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '服务健康',
        schema: {
            example: {
                status: 'ok',
                info: {
                    database: { status: 'up' },
                    memory: { status: 'up' }
                },
                error: {},
                details: {
                    database: { status: 'up' },
                    memory: { status: 'up' }
                }
            }
        }
    }),
    (0, terminus_1.HealthCheck)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "check", null);
__decorate([
    (0, common_1.Get)('ready'),
    (0, swagger_1.ApiOperation)({
        summary: '就绪检查',
        description: '检查用户服务是否准备好接收请求'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '服务就绪',
    }),
    (0, terminus_1.HealthCheck)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "ready", null);
__decorate([
    (0, common_1.Get)('live'),
    (0, swagger_1.ApiOperation)({
        summary: '存活检查',
        description: '检查用户服务是否仍在运行'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '服务存活',
        schema: {
            example: {
                status: 'ok',
                info: {
                    memory: { status: 'up' },
                    storage: { status: 'up' }
                },
                error: {},
                details: {
                    memory: { status: 'up' },
                    storage: { status: 'up' }
                }
            }
        }
    }),
    (0, terminus_1.HealthCheck)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "live", null);
__decorate([
    (0, common_1.Get)('detailed'),
    (0, swagger_1.ApiOperation)({
        summary: '详细健康检查',
        description: '获取用户服务的详细健康状态信息'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '详细健康信息',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "detailed", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('健康检查'),
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [typeof (_a = typeof terminus_1.HealthCheckService !== "undefined" && terminus_1.HealthCheckService) === "function" ? _a : Object, typeof (_b = typeof terminus_1.PrismaHealthIndicator !== "undefined" && terminus_1.PrismaHealthIndicator) === "function" ? _b : Object, typeof (_c = typeof terminus_1.MemoryHealthIndicator !== "undefined" && terminus_1.MemoryHealthIndicator) === "function" ? _c : Object, typeof (_d = typeof terminus_1.DiskHealthIndicator !== "undefined" && terminus_1.DiskHealthIndicator) === "function" ? _d : Object, typeof (_e = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _e : Object])
], HealthController);


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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HealthService = void 0;
const common_1 = __webpack_require__(3);
const database_1 = __webpack_require__(11);
let HealthService = class HealthService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async checkDatabase() {
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async checkUserService() {
        try {
            const userCount = await this.prisma.user.count();
            const lastUser = await this.prisma.user.findFirst({
                orderBy: { createdAt: 'desc' },
                select: { createdAt: true },
            });
            return {
                canQuery: true,
                userCount,
                lastUserCreated: lastUser?.createdAt,
            };
        }
        catch (error) {
            return {
                canQuery: false,
                userCount: 0,
            };
        }
    }
    getPerformanceMetrics() {
        const memoryUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        return {
            memory: {
                rss: Math.round(memoryUsage.rss / 1024 / 1024),
                heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
                heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                external: Math.round(memoryUsage.external / 1024 / 1024),
            },
            cpu: {
                user: cpuUsage.user,
                system: cpuUsage.system,
            },
            uptime: Math.round(process.uptime()),
            timestamp: new Date().toISOString(),
        };
    }
    async getDependencyStatus() {
        const databaseStatus = await this.checkDatabase();
        const userServiceStatus = await this.checkUserService();
        return {
            database: {
                status: databaseStatus ? 'healthy' : 'unhealthy',
                canConnect: databaseStatus,
            },
            userService: {
                status: userServiceStatus.canQuery ? 'healthy' : 'unhealthy',
                ...userServiceStatus,
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
/* 40 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserAIConfigModule = void 0;
const common_1 = __webpack_require__(3);
const ai_config_controller_1 = __webpack_require__(41);
const ai_config_service_1 = __webpack_require__(42);
const database_1 = __webpack_require__(11);
let UserAIConfigModule = class UserAIConfigModule {
};
exports.UserAIConfigModule = UserAIConfigModule;
exports.UserAIConfigModule = UserAIConfigModule = __decorate([
    (0, common_1.Module)({
        imports: [database_1.DatabaseModule],
        controllers: [ai_config_controller_1.UserAIConfigController],
        providers: [ai_config_service_1.UserAIConfigService],
        exports: [ai_config_service_1.UserAIConfigService],
    })
], UserAIConfigModule);


/***/ }),
/* 41 */
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
exports.UserAIConfigController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(4);
const ai_config_service_1 = __webpack_require__(42);
const ai_config_dto_1 = __webpack_require__(43);
const jwt_auth_guard_1 = __webpack_require__(30);
let UserAIConfigController = class UserAIConfigController {
    constructor(aiConfigService) {
        this.aiConfigService = aiConfigService;
    }
    async getAvailableConfigs(req) {
        return this.aiConfigService.getAvailableConfigs(req.user.id);
    }
    async getUserConfigs(req) {
        return this.aiConfigService.getUserConfigs(req.user.id);
    }
    async createConfig(req, dto) {
        return this.aiConfigService.createConfig(req.user.id, dto);
    }
    async updateConfig(req, id, dto) {
        return this.aiConfigService.updateConfig(req.user.id, id, dto);
    }
    async deleteConfig(req, id) {
        await this.aiConfigService.deleteConfig(req.user.id, id);
        return { message: '配置已删除' };
    }
    async setDefaultConfig(req, id) {
        await this.aiConfigService.setDefaultConfig(req.user.id, id);
        return { message: '默认配置已设置' };
    }
};
exports.UserAIConfigController = UserAIConfigController;
__decorate([
    (0, common_1.Get)('ai-config/available'),
    (0, swagger_1.ApiOperation)({
        summary: '获取可用的AI配置',
        description: '获取用户可用的所有AI配置，包括系统全局配置和用户自定义配置'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取成功',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        system: {
                            type: 'array',
                            description: '系统全局配置',
                            items: { type: 'object' }
                        },
                        user: {
                            type: 'array',
                            description: '用户自定义配置',
                            items: { type: 'object' }
                        },
                        default: { type: 'string', example: 'system:1', description: '默认配置ID' }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '未授权访问' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], UserAIConfigController.prototype, "getAvailableConfigs", null);
__decorate([
    (0, common_1.Get)('ai-config/custom'),
    (0, swagger_1.ApiOperation)({
        summary: '获取用户自定义配置列表',
        description: '获取当前用户创建的所有自定义AI配置'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取成功',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            name: { type: 'string', example: '我的OpenAI配置' },
                            provider: { type: 'string', example: 'OPENAI' },
                            model: { type: 'string', example: 'gpt-4' },
                            apiUrl: { type: 'string' },
                            enabled: { type: 'boolean' },
                            isDefault: { type: 'boolean' },
                            parameters: { type: 'object' },
                            createdAt: { type: 'string', format: 'date-time' }
                        }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '未授权访问' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], UserAIConfigController.prototype, "getUserConfigs", null);
__decorate([
    (0, common_1.Post)('ai-config/custom'),
    (0, swagger_1.ApiOperation)({
        summary: '创建用户自定义配置',
        description: '创建新的AI配置，可以配置自己的API Key和参数'
    }),
    (0, swagger_1.ApiBody)({ type: ai_config_dto_1.CreateUserAIConfigDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: '创建成功',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        provider: { type: 'string' },
                        model: { type: 'string' },
                        enabled: { type: 'boolean' },
                        isDefault: { type: 'boolean' }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '参数验证失败' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '未授权访问' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_d = typeof ai_config_dto_1.CreateUserAIConfigDto !== "undefined" && ai_config_dto_1.CreateUserAIConfigDto) === "function" ? _d : Object]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], UserAIConfigController.prototype, "createConfig", null);
__decorate([
    (0, common_1.Put)('ai-config/custom/:id'),
    (0, swagger_1.ApiOperation)({
        summary: '更新用户自定义配置',
        description: '更新已有的自定义AI配置'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '配置ID' }),
    (0, swagger_1.ApiBody)({ type: ai_config_dto_1.UpdateUserAIConfigDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '更新成功'
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '参数验证失败' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '未授权访问' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '配置不存在' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, typeof (_f = typeof ai_config_dto_1.UpdateUserAIConfigDto !== "undefined" && ai_config_dto_1.UpdateUserAIConfigDto) === "function" ? _f : Object]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], UserAIConfigController.prototype, "updateConfig", null);
__decorate([
    (0, common_1.Delete)('ai-config/custom/:id'),
    (0, swagger_1.ApiOperation)({
        summary: '删除用户自定义配置',
        description: '删除指定的自定义AI配置'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '配置ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '删除成功',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: '配置已删除' }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '未授权访问' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '配置不存在' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], UserAIConfigController.prototype, "deleteConfig", null);
__decorate([
    (0, common_1.Post)('ai-config/custom/:id/set-default'),
    (0, swagger_1.ApiOperation)({
        summary: '设置默认配置',
        description: '将指定的配置设置为默认AI配置'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '配置ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '设置成功',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: '默认配置已设置' }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '未授权访问' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '配置不存在' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], UserAIConfigController.prototype, "setDefaultConfig", null);
exports.UserAIConfigController = UserAIConfigController = __decorate([
    (0, swagger_1.ApiTags)('AI配置管理'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof ai_config_service_1.UserAIConfigService !== "undefined" && ai_config_service_1.UserAIConfigService) === "function" ? _a : Object])
], UserAIConfigController);


/***/ }),
/* 42 */
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
exports.UserAIConfigService = void 0;
const common_1 = __webpack_require__(3);
const database_1 = __webpack_require__(11);
const ai_config_dto_1 = __webpack_require__(43);
const crypto = __webpack_require__(44);
let UserAIConfigService = class UserAIConfigService {
    constructor(prisma) {
        this.prisma = prisma;
        this.ENCRYPTION_KEY = process.env.AI_CONFIG_ENCRYPTION_KEY || 'your-32-character-encryption-key!!';
        this.ALGORITHM = 'aes-256-cbc';
    }
    async getAvailableConfigs(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                subscription: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        const systemConfig = await this.prisma.systemConfig.findUnique({
            where: { configKey: 'ai.global' },
        });
        let systemModels = [];
        if (systemConfig) {
            const configValue = systemConfig.configValue;
            systemModels = (configValue.models || []).filter((model) => {
                return this.checkModelAccess(model, user);
            });
            systemModels = systemModels.map((model) => ({
                ...model,
                apiKey: this.maskApiKey(this.decrypt(model.apiKey)),
            }));
        }
        const userConfigs = await this.prisma.userAIConfig.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        const userConfigsDto = userConfigs.map((config) => ({
            id: config.id,
            userId: config.userId,
            name: config.name,
            provider: config.provider,
            model: config.model,
            apiUrl: config.apiUrl,
            enabled: config.enabled,
            isDefault: config.isDefault,
            parameters: config.parameters,
            createdAt: config.createdAt,
            updatedAt: config.updatedAt,
        }));
        let defaultConfigId = '';
        const userDefaultConfig = userConfigs.find((c) => c.isDefault);
        if (userDefaultConfig) {
            defaultConfigId = `user:${userDefaultConfig.id}`;
        }
        else {
            const systemDefaultModel = systemModels.find((m) => m.isDefault);
            if (systemDefaultModel) {
                defaultConfigId = `system:${systemDefaultModel.id}`;
            }
            else if (systemModels.length > 0) {
                defaultConfigId = `system:${systemModels[0].id}`;
            }
            else if (userConfigsDto.length > 0) {
                defaultConfigId = `user:${userConfigsDto[0].id}`;
            }
        }
        return {
            system: systemModels,
            user: userConfigsDto,
            default: defaultConfigId,
        };
    }
    async getUserConfigs(userId) {
        const configs = await this.prisma.userAIConfig.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return configs.map((config) => ({
            id: config.id,
            userId: config.userId,
            name: config.name,
            provider: config.provider,
            model: config.model,
            apiUrl: config.apiUrl,
            enabled: config.enabled,
            isDefault: config.isDefault,
            parameters: config.parameters,
            createdAt: config.createdAt,
            updatedAt: config.updatedAt,
        }));
    }
    async createConfig(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { subscription: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        if (dto.isDefault) {
            await this.prisma.userAIConfig.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
        }
        const encryptedApiKey = this.encrypt(dto.apiKey);
        const config = await this.prisma.userAIConfig.create({
            data: {
                userId,
                name: dto.name,
                provider: dto.provider,
                model: dto.model,
                apiUrl: dto.apiUrl,
                apiKey: encryptedApiKey,
                enabled: dto.enabled ?? true,
                isDefault: dto.isDefault ?? false,
                parameters: dto.parameters ? JSON.parse(JSON.stringify(dto.parameters)) : {},
            },
        });
        return {
            id: config.id,
            userId: config.userId,
            name: config.name,
            provider: config.provider,
            model: config.model,
            apiUrl: config.apiUrl,
            enabled: config.enabled,
            isDefault: config.isDefault,
            parameters: config.parameters,
            createdAt: config.createdAt,
            updatedAt: config.updatedAt,
        };
    }
    async updateConfig(userId, configId, dto) {
        const existingConfig = await this.prisma.userAIConfig.findFirst({
            where: { id: configId, userId },
        });
        if (!existingConfig) {
            throw new common_1.NotFoundException('配置不存在');
        }
        if (dto.isDefault) {
            await this.prisma.userAIConfig.updateMany({
                where: { userId, isDefault: true, id: { not: configId } },
                data: { isDefault: false },
            });
        }
        const updateData = {};
        if (dto.name !== undefined)
            updateData.name = dto.name;
        if (dto.provider !== undefined)
            updateData.provider = dto.provider;
        if (dto.model !== undefined)
            updateData.model = dto.model;
        if (dto.apiUrl !== undefined)
            updateData.apiUrl = dto.apiUrl;
        if (dto.apiKey !== undefined)
            updateData.apiKey = this.encrypt(dto.apiKey);
        if (dto.enabled !== undefined)
            updateData.enabled = dto.enabled;
        if (dto.isDefault !== undefined)
            updateData.isDefault = dto.isDefault;
        if (dto.parameters !== undefined)
            updateData.parameters = JSON.parse(JSON.stringify(dto.parameters));
        const config = await this.prisma.userAIConfig.update({
            where: { id: configId },
            data: updateData,
        });
        return {
            id: config.id,
            userId: config.userId,
            name: config.name,
            provider: config.provider,
            model: config.model,
            apiUrl: config.apiUrl,
            enabled: config.enabled,
            isDefault: config.isDefault,
            parameters: config.parameters,
            createdAt: config.createdAt,
            updatedAt: config.updatedAt,
        };
    }
    async deleteConfig(userId, configId) {
        const config = await this.prisma.userAIConfig.findFirst({
            where: { id: configId, userId },
        });
        if (!config) {
            throw new common_1.NotFoundException('配置不存在');
        }
        await this.prisma.userAIConfig.delete({
            where: { id: configId },
        });
    }
    async setDefaultConfig(userId, configId) {
        const config = await this.prisma.userAIConfig.findFirst({
            where: { id: configId, userId },
        });
        if (!config) {
            throw new common_1.NotFoundException('配置不存在');
        }
        await this.prisma.userAIConfig.updateMany({
            where: { userId, isDefault: true },
            data: { isDefault: false },
        });
        await this.prisma.userAIConfig.update({
            where: { id: configId },
            data: { isDefault: true },
        });
    }
    checkModelAccess(model, user) {
        const tier = model.tier;
        if (!user.subscription || user.subscription.status !== 'ACTIVE') {
            return tier === ai_config_dto_1.AITier.FREE;
        }
        return true;
    }
    maskApiKey(apiKey) {
        if (apiKey.length <= 8) {
            return '****';
        }
        return apiKey.substring(0, 4) + '****' + apiKey.substring(apiKey.length - 4);
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
exports.UserAIConfigService = UserAIConfigService;
exports.UserAIConfigService = UserAIConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], UserAIConfigService);


/***/ }),
/* 43 */
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
const class_transformer_1 = __webpack_require__(19);
const client_1 = __webpack_require__(14);
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
/* 44 */
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),
/* 45 */
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
const common_1 = __webpack_require__(3);
const config_1 = __webpack_require__(5);
const passport_1 = __webpack_require__(10);
const passport_jwt_1 = __webpack_require__(46);
const database_1 = __webpack_require__(11);
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
            userId: user.id,
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
/* 46 */
/***/ ((module) => {

module.exports = require("passport-jwt");

/***/ }),
/* 47 */
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
const common_1 = __webpack_require__(3);
const library_1 = __webpack_require__(48);
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    constructor() {
        this.logger = new common_1.Logger(AllExceptionsFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const errorResponse = this.buildErrorResponse(exception, request);
        this.logger.error(`${request.method} ${request.url}`, exception instanceof Error ? exception.stack : JSON.stringify(exception));
        response.status(errorResponse.error.code).json(errorResponse);
    }
    buildErrorResponse(exception, request) {
        const timestamp = new Date().toISOString();
        const path = request.url;
        const method = request.method;
        const requestId = request.headers['x-request-id'];
        if (exception instanceof common_1.HttpException) {
            const status = exception.getStatus();
            const response = exception.getResponse();
            return {
                success: false,
                error: {
                    code: status.toString(),
                    message: typeof response === 'string' ? response : response.message || exception.message,
                    details: typeof response === 'object' ? response : undefined,
                    timestamp,
                    path,
                    method,
                    requestId,
                },
            };
        }
        if (exception instanceof library_1.PrismaClientKnownRequestError) {
            const { code, message } = this.handlePrismaError(exception);
            return {
                success: false,
                error: {
                    code,
                    message,
                    details: {
                        prismaCode: exception.code,
                        target: exception.meta?.target,
                    },
                    timestamp,
                    path,
                    method,
                    requestId,
                },
            };
        }
        if (exception instanceof Error && exception.name === 'ValidationError') {
            return {
                success: false,
                error: {
                    code: common_1.HttpStatus.BAD_REQUEST.toString(),
                    message: '数据验证失败',
                    details: exception.message,
                    timestamp,
                    path,
                    method,
                    requestId,
                },
            };
        }
        return {
            success: false,
            error: {
                code: common_1.HttpStatus.INTERNAL_SERVER_ERROR.toString(),
                message: '服务器内部错误',
                details: process.env.NODE_ENV === 'development'
                    ? {
                        error: exception instanceof Error ? exception.message : String(exception),
                        stack: exception instanceof Error ? exception.stack : undefined,
                    }
                    : undefined,
                timestamp,
                path,
                method,
                requestId,
            },
        };
    }
    handlePrismaError(error) {
        switch (error.code) {
            case 'P2002':
                return {
                    code: common_1.HttpStatus.CONFLICT.toString(),
                    message: '数据已存在，违反唯一性约束',
                };
            case 'P2025':
                return {
                    code: common_1.HttpStatus.NOT_FOUND.toString(),
                    message: '未找到相关记录',
                };
            case 'P2003':
                return {
                    code: common_1.HttpStatus.BAD_REQUEST.toString(),
                    message: '外键约束失败',
                };
            case 'P2011':
                return {
                    code: common_1.HttpStatus.BAD_REQUEST.toString(),
                    message: '空值约束失败',
                };
            case 'P2012':
                return {
                    code: common_1.HttpStatus.BAD_REQUEST.toString(),
                    message: '缺少必需值',
                };
            case 'P2014':
                return {
                    code: common_1.HttpStatus.BAD_REQUEST.toString(),
                    message: '数据关系无效',
                };
            default:
                return {
                    code: common_1.HttpStatus.INTERNAL_SERVER_ERROR.toString(),
                    message: '数据库操作失败',
                };
        }
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);


/***/ }),
/* 48 */
/***/ ((module) => {

module.exports = require("@prisma/client/runtime/library");

/***/ }),
/* 49 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ResponseInterceptor = void 0;
const common_1 = __webpack_require__(3);
const operators_1 = __webpack_require__(50);
let ResponseInterceptor = class ResponseInterceptor {
    intercept(context, next) {
        const startTime = Date.now();
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();
        return next.handle().pipe((0, operators_1.map)((data) => {
            const endTime = Date.now();
            const duration = endTime - startTime;
            response.setHeader('X-Response-Time', `${duration}ms`);
            if (request.headers['x-request-id']) {
                response.setHeader('X-Request-ID', request.headers['x-request-id']);
            }
            const apiResponse = {
                success: true,
                data,
                meta: {
                    timestamp: new Date().toISOString(),
                    path: request.url,
                    method: request.method,
                    requestId: request.headers['x-request-id'],
                    duration,
                },
            };
            if (request.method === 'POST') {
                apiResponse.message = '创建成功';
            }
            else if (request.method === 'PUT' || request.method === 'PATCH') {
                apiResponse.message = '更新成功';
            }
            else if (request.method === 'DELETE') {
                apiResponse.message = '删除成功';
            }
            else if (request.method === 'GET') {
                if (Array.isArray(data)) {
                    apiResponse.message = '查询成功';
                }
                else if (data && typeof data === 'object' && 'users' in data) {
                    apiResponse.message = '用户列表查询成功';
                }
                else {
                    apiResponse.message = '获取成功';
                }
            }
            return apiResponse;
        }));
    }
};
exports.ResponseInterceptor = ResponseInterceptor;
exports.ResponseInterceptor = ResponseInterceptor = __decorate([
    (0, common_1.Injectable)()
], ResponseInterceptor);


/***/ }),
/* 50 */
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
const dotenv_1 = __webpack_require__(1);
(0, dotenv_1.config)();
const core_1 = __webpack_require__(2);
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(4);
const config_1 = __webpack_require__(5);
const helmet_1 = __webpack_require__(6);
const compression = __webpack_require__(7);
const app_module_1 = __webpack_require__(8);
const all_exceptions_filter_1 = __webpack_require__(47);
const response_interceptor_1 = __webpack_require__(49);
const common_2 = __webpack_require__(3);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const logger = new common_2.Logger('UserService');
    app.setGlobalPrefix('api/v1/users');
    app.use((0, helmet_1.default)());
    app.use(compression());
    app.enableCors({
        origin: process.env.NODE_ENV === 'production'
            ? ['https://91writing.com', 'https://www.91writing.com']
            : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:7520'],
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    app.useGlobalInterceptors(new response_interceptor_1.ResponseInterceptor());
    if (process.env.NODE_ENV !== 'production') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('91Writing 用户服务 API')
            .setDescription('91Writing 用户管理服务接口文档')
            .setVersion('1.0')
            .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
            in: 'header',
        }, 'JWT-auth')
            .addTag('用户管理', '用户注册、登录、个人信息管理')
            .addTag('用户配置', '用户偏好设置、订阅管理')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs/users', app, document, {
            swaggerOptions: {
                persistAuthorization: true,
            },
        });
    }
    const port = configService.get('USER_SERVICE_PORT', 3001);
    await app.listen(port);
    logger.log(`🚀 用户服务已启动: http://localhost:${port}`);
    logger.log(`📖 API文档地址: http://localhost:${port}/api/docs/users`);
}
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
bootstrap();

})();

/******/ })()
;