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
const auth_module_1 = __webpack_require__(15);
const invite_module_1 = __webpack_require__(40);
const health_module_1 = __webpack_require__(43);
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
            auth_module_1.AuthModule,
            invite_module_1.InviteModule,
            health_module_1.HealthModule,
        ],
        controllers: [],
        providers: [],
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
exports.AuthModule = void 0;
const common_1 = __webpack_require__(3);
const passport_1 = __webpack_require__(10);
const jwt_1 = __webpack_require__(9);
const config_1 = __webpack_require__(5);
const auth_controller_1 = __webpack_require__(16);
const auth_service_1 = __webpack_require__(17);
const jwt_strategy_1 = __webpack_require__(36);
const local_strategy_1 = __webpack_require__(38);
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
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
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [
            auth_service_1.AuthService,
            jwt_strategy_1.JwtStrategy,
            local_strategy_1.LocalStrategy,
        ],
        exports: [
            auth_service_1.AuthService,
            jwt_strategy_1.JwtStrategy,
            passport_1.PassportModule,
            jwt_1.JwtModule,
        ],
    })
], AuthModule);


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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(4);
const auth_service_1 = __webpack_require__(17);
const auth_dto_1 = __webpack_require__(22);
const auth_response_dto_1 = __webpack_require__(18);
const common_2 = __webpack_require__(24);
const local_auth_guard_1 = __webpack_require__(35);
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async register(registerDto) {
        return this.authService.register(registerDto);
    }
    async login(loginDto, req) {
        return this.authService.login(loginDto);
    }
    async refreshTokens(refreshTokenDto) {
        return this.authService.refreshTokens(refreshTokenDto);
    }
    async logout(req) {
        return new auth_response_dto_1.LogoutResponseDto({
            logoutAt: new Date().toISOString(),
            message: '已成功登出',
        });
    }
    async changePassword(req, changePasswordDto) {
        await this.authService.changePassword(req.user.id, changePasswordDto);
        return { message: '密码修改成功' };
    }
    async forgotPassword(forgotPasswordDto) {
        const message = await this.authService.forgotPassword(forgotPasswordDto);
        return new auth_response_dto_1.PasswordResetResponseDto({
            message,
            sentAt: new Date().toISOString(),
        });
    }
    async resetPassword(resetPasswordDto) {
        await this.authService.resetPassword(resetPasswordDto);
        return { message: '密码重置成功' };
    }
    async verifyEmail(verifyEmailDto) {
        return new auth_response_dto_1.EmailVerificationResponseDto({
            verified: true,
            verifiedAt: new Date().toISOString(),
            message: '邮箱验证成功',
        });
    }
    async getCurrentUser(req) {
        return req.user;
    }
    async checkToken(req) {
        return {
            valid: true,
            user: req.user,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({
        summary: '用户注册',
        description: '创建新用户账户，包含邮箱验证机制'
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: '用户注册成功',
        type: auth_response_dto_1.RegisterResponseDto,
    }),
    (0, swagger_1.ApiConflictResponse)({
        description: '邮箱已被注册',
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: '数据验证失败',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof auth_dto_1.RegisterDto !== "undefined" && auth_dto_1.RegisterDto) === "function" ? _b : Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.UseGuards)(local_auth_guard_1.LocalAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '用户登录',
        description: '使用邮箱和密码登录，返回JWT令牌'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '登录成功',
        type: auth_response_dto_1.LoginResponseDto,
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: '邮箱或密码错误',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof auth_dto_1.LoginDto !== "undefined" && auth_dto_1.LoginDto) === "function" ? _d : Object, Object]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '刷新令牌',
        description: '使用刷新令牌获取新的访问令牌'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '令牌刷新成功',
        type: auth_response_dto_1.RefreshResponseDto,
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: '无效的刷新令牌',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof auth_dto_1.RefreshTokenDto !== "undefined" && auth_dto_1.RefreshTokenDto) === "function" ? _f : Object]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], AuthController.prototype, "refreshTokens", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '用户登出',
        description: '用户主动登出，可选择性使令牌失效'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '登出成功',
        type: auth_response_dto_1.LogoutResponseDto,
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: '无效的访问令牌',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Patch)('change-password'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '修改密码',
        description: '用户修改密码，需要验证当前密码'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '密码修改成功',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: '密码修改成功' },
            },
        },
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: '无效的访问令牌',
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: '当前密码不正确',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_j = typeof auth_dto_1.ChangePasswordDto !== "undefined" && auth_dto_1.ChangePasswordDto) === "function" ? _j : Object]),
    __metadata("design:returntype", typeof (_k = typeof Promise !== "undefined" && Promise) === "function" ? _k : Object)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '忘记密码',
        description: '发送密码重置邮件到用户邮箱'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '密码重置邮件已发送',
        type: auth_response_dto_1.PasswordResetResponseDto,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_l = typeof auth_dto_1.ForgotPasswordDto !== "undefined" && auth_dto_1.ForgotPasswordDto) === "function" ? _l : Object]),
    __metadata("design:returntype", typeof (_m = typeof Promise !== "undefined" && Promise) === "function" ? _m : Object)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '重置密码',
        description: '使用重置令牌设置新密码'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '密码重置成功',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: '密码重置成功' },
            },
        },
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: '无效或已过期的重置令牌',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_o = typeof auth_dto_1.ResetPasswordDto !== "undefined" && auth_dto_1.ResetPasswordDto) === "function" ? _o : Object]),
    __metadata("design:returntype", typeof (_p = typeof Promise !== "undefined" && Promise) === "function" ? _p : Object)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('verify-email'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '验证邮箱',
        description: '使用验证令牌完成邮箱验证'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '邮箱验证成功',
        type: auth_response_dto_1.EmailVerificationResponseDto,
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: '无效或已过期的验证令牌',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_q = typeof auth_dto_1.VerifyEmailDto !== "undefined" && auth_dto_1.VerifyEmailDto) === "function" ? _q : Object]),
    __metadata("design:returntype", typeof (_r = typeof Promise !== "undefined" && Promise) === "function" ? _r : Object)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: '获取当前用户信息',
        description: '获取当前登录用户的详细信息'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取用户信息成功',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    description: '当前用户信息',
                },
            },
        },
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: '无效的访问令牌',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_s = typeof Promise !== "undefined" && Promise) === "function" ? _s : Object)
], AuthController.prototype, "getCurrentUser", null);
__decorate([
    (0, common_1.Post)('check-token'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '检查令牌有效性',
        description: '验证当前JWT令牌是否有效'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '令牌有效',
        schema: {
            type: 'object',
            properties: {
                valid: { type: 'boolean', example: true },
                user: {
                    type: 'object',
                    description: '令牌关联的用户信息',
                },
                expiresAt: { type: 'string', example: '2024-12-26T10:30:00Z' },
            },
        },
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: '无效的访问令牌',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_t = typeof Promise !== "undefined" && Promise) === "function" ? _t : Object)
], AuthController.prototype, "checkToken", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('认证管理'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object])
], AuthController);


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
var AuthService_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthService = void 0;
const common_1 = __webpack_require__(3);
const jwt_1 = __webpack_require__(9);
const config_1 = __webpack_require__(5);
const database_1 = __webpack_require__(11);
const auth_response_dto_1 = __webpack_require__(18);
const class_transformer_1 = __webpack_require__(19);
const bcrypt = __webpack_require__(20);
const client_1 = __webpack_require__(14);
const crypto_1 = __webpack_require__(21);
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async register(registerDto) {
        const { email, password, nickname, inviteCode, acceptTerms } = registerDto;
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('该邮箱已被注册');
        }
        let inviterData = null;
        this.logger.log(`注册请求 - 邮箱: ${email}, 邀请码: "${inviteCode}", 类型: ${typeof inviteCode}, 长度: ${inviteCode ? inviteCode.length : 'N/A'}`);
        if (inviteCode && inviteCode.trim().length > 0) {
            this.logger.log(`开始验证用户邀请码: "${inviteCode}"`);
            inviterData = await this.validateInviteCode(inviteCode.trim());
        }
        else {
            this.logger.log(`跳过邀请码验证 - 邀请码为空或无效: "${inviteCode}"`);
        }
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        const userInviteCode = await this.generateUniqueInviteCode();
        const user = await this.prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    email,
                    passwordHash,
                    nickname: nickname || email.split('@')[0],
                    role: client_1.UserRole.USER,
                    status: client_1.UserStatus.ACTIVE,
                    isActive: true,
                    inviteCode: userInviteCode,
                    invitedBy: inviterData?.id || null,
                    profile: {
                        create: {
                            preferences: {
                                theme: 'light',
                                language: 'zh-CN',
                                notifications: {
                                    email: true,
                                    push: false,
                                },
                            },
                            writingStats: {
                                totalWords: 0,
                                totalChapters: 0,
                                writingDays: 0,
                            },
                        },
                    },
                },
                include: {
                    profile: true,
                },
            });
            this.logger.log(`用户注册成功: ${email}, 专属邀请码: ${userInviteCode}`);
            return newUser;
        });
        if (inviterData) {
            await this.createInviteRelation(inviterData.id, user.id);
        }
        const verificationToken = this.generateVerificationToken();
        this.logger.log(`用户注册成功: ${email}`);
        return new auth_response_dto_1.RegisterResponseDto({
            user: (0, class_transformer_1.plainToClass)(auth_response_dto_1.AuthUserDto, user, { excludeExtraneousValues: true }),
            registeredAt: new Date().toISOString(),
            needEmailVerification: true,
            verificationMessage: '验证邮件已发送到您的邮箱，请查收并点击链接完成验证',
        });
    }
    async login(loginDto) {
        const { email, password, rememberMe } = loginDto;
        const user = await this.validateUser(email, password);
        if (!user) {
            throw new common_1.UnauthorizedException('邮箱或密码错误');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        const tokens = await this.generateTokens(user, rememberMe);
        const userWithSubscription = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: {
                profile: true,
                subscription: {
                    include: {
                        package: true,
                    },
                },
            },
        });
        this.logger.log(`用户登录成功: ${email}`);
        return new auth_response_dto_1.LoginResponseDto({
            user: (0, class_transformer_1.plainToClass)(auth_response_dto_1.AuthUserDto, userWithSubscription, { excludeExtraneousValues: true }),
            tokens,
            loginAt: new Date().toISOString(),
            subscription: userWithSubscription.subscription ? {
                packageId: userWithSubscription.subscription.packageId.toString(),
                status: userWithSubscription.subscription.status,
                endDate: userWithSubscription.subscription.endDate,
            } : undefined,
        });
    }
    async refreshTokens(refreshTokenDto) {
        const { refreshToken } = refreshTokenDto;
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.getRefreshTokenSecret(),
            });
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    status: true,
                    isActive: true,
                    tenantId: true,
                },
            });
            if (!user || user.status !== client_1.UserStatus.ACTIVE || !user.isActive) {
                throw new common_1.UnauthorizedException('无效的刷新令牌');
            }
            const tokens = await this.generateTokens(user);
            this.logger.log(`令牌刷新成功: ${user.email}`);
            return new auth_response_dto_1.RefreshResponseDto({
                tokens,
                refreshedAt: new Date().toISOString(),
            });
        }
        catch (error) {
            throw new common_1.UnauthorizedException('无效的刷新令牌');
        }
    }
    async validateUser(email, password) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: {
                profile: true,
            },
        });
        if (!user) {
            return null;
        }
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return null;
        }
        if (user.status !== client_1.UserStatus.ACTIVE || !user.isActive) {
            throw new common_1.UnauthorizedException('用户账号已被禁用');
        }
        const { passwordHash, ...result } = user;
        return result;
    }
    async changePassword(userId, changePasswordDto) {
        const { currentPassword, newPassword } = changePasswordDto;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, passwordHash: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isCurrentPasswordValid) {
            throw new common_1.BadRequestException('当前密码不正确');
        }
        const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
        if (isSamePassword) {
            throw new common_1.BadRequestException('新密码不能与当前密码相同');
        }
        const saltRounds = 12;
        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                passwordHash: newPasswordHash,
                updatedAt: new Date(),
            },
        });
        this.logger.log(`用户修改密码成功: ${user.email}`);
    }
    async forgotPassword(forgotPasswordDto) {
        const { email } = forgotPasswordDto;
        const user = await this.prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, status: true, isActive: true },
        });
        if (!user || user.status !== client_1.UserStatus.ACTIVE || !user.isActive) {
            return '如果该邮箱已注册，密码重置邮件将发送到该邮箱';
        }
        const resetToken = this.generateResetToken();
        this.logger.log(`密码重置邮件已发送: ${email}`);
        return '密码重置邮件已发送到您的邮箱';
    }
    async resetPassword(resetPasswordDto) {
        const { token, newPassword } = resetPasswordDto;
        const userId = await this.validateResetToken(token);
        if (!userId) {
            throw new common_1.BadRequestException('无效或已过期的重置令牌');
        }
        const saltRounds = 12;
        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                passwordHash: newPasswordHash,
                updatedAt: new Date(),
            },
        });
        this.logger.log(`用户重置密码成功: ${userId}`);
    }
    async generateTokens(user, rememberMe = false) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
        };
        const accessTokenExpiresIn = this.configService.get('JWT_EXPIRES_IN', '7d');
        const refreshTokenExpiresIn = rememberMe ? '30d' : '7d';
        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_SECRET'),
            expiresIn: accessTokenExpiresIn,
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.getRefreshTokenSecret(),
            expiresIn: refreshTokenExpiresIn,
        });
        return new auth_response_dto_1.TokensDto({
            accessToken,
            refreshToken,
            tokenType: 'Bearer',
            expiresIn: this.parseExpiresIn(accessTokenExpiresIn),
            refreshExpiresIn: this.parseExpiresIn(refreshTokenExpiresIn),
        });
    }
    getRefreshTokenSecret() {
        return this.configService.get('JWT_REFRESH_SECRET', this.configService.get('JWT_SECRET') + '_refresh');
    }
    parseExpiresIn(expiresIn) {
        const unit = expiresIn.slice(-1);
        const value = parseInt(expiresIn.slice(0, -1));
        switch (unit) {
            case 's': return value;
            case 'm': return value * 60;
            case 'h': return value * 3600;
            case 'd': return value * 86400;
            default: return 604800;
        }
    }
    generateVerificationToken() {
        return (0, crypto_1.randomBytes)(32).toString('hex');
    }
    generateResetToken() {
        return (0, crypto_1.randomBytes)(32).toString('hex');
    }
    async validateInviteCode(inviteCode) {
        const inviter = await this.prisma.user.findUnique({
            where: { inviteCode: inviteCode.trim() },
            select: {
                id: true,
                email: true,
                nickname: true,
                inviteCode: true,
                status: true,
                isActive: true
            }
        });
        if (!inviter) {
            throw new common_1.BadRequestException('邀请码不存在');
        }
        if (inviter.status !== client_1.UserStatus.ACTIVE || !inviter.isActive) {
            throw new common_1.BadRequestException('邀请者账户异常，无法使用此邀请码');
        }
        this.logger.log(`邀请码验证通过: ${inviteCode} - 邀请者: ${inviter.email}`);
        return inviter;
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
    async createInviteRelation(inviterId, inviteeId) {
        const invite = await this.prisma.userInvite.create({
            data: {
                inviterId,
                inviteeId,
                status: client_1.InviteStatus.ACCEPTED,
                rewardStatus: client_1.RewardStatus.PENDING
            }
        });
        await this.prisma.user.update({
            where: { id: inviterId },
            data: {
                inviteCount: { increment: 1 }
            }
        });
        await this.grantInviteReward(inviterId, invite.id);
        this.logger.log(`邀请关系创建成功: ${inviterId} -> ${inviteeId}`);
    }
    async grantInviteReward(userId, inviteId) {
        await this.prisma.inviteReward.create({
            data: {
                userId,
                inviteId,
                rewardType: 'DAYS',
                amount: 7,
                description: '邀请好友注册奖励：7天会员',
                status: client_1.RewardStatus.GRANTED,
                grantedAt: new Date()
            }
        });
        this.logger.log(`邀请奖励发放成功: 用户 ${userId} 获得7天会员`);
    }
    async validateResetToken(token) {
        return null;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _b : Object, typeof (_c = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _c : Object])
], AuthService);


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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EmailVerificationResponseDto = exports.PasswordResetResponseDto = exports.LogoutResponseDto = exports.RefreshResponseDto = exports.RegisterResponseDto = exports.LoginResponseDto = exports.TokensDto = exports.AuthUserDto = void 0;
const swagger_1 = __webpack_require__(4);
const class_transformer_1 = __webpack_require__(19);
const client_1 = __webpack_require__(14);
class AuthUserDto {
    constructor(partial) {
        Object.assign(this, partial);
    }
}
exports.AuthUserDto = AuthUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '用户ID',
        example: 'user_123456789'
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], AuthUserDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '用户邮箱',
        example: 'user@91writing.com'
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], AuthUserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '用户昵称',
        example: '写作爱好者'
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], AuthUserDto.prototype, "nickname", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '用户角色',
        enum: client_1.UserRole,
        example: client_1.UserRole.USER
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", typeof (_a = typeof client_1.UserRole !== "undefined" && client_1.UserRole) === "function" ? _a : Object)
], AuthUserDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '用户状态',
        enum: client_1.UserStatus,
        example: client_1.UserStatus.ACTIVE
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", typeof (_b = typeof client_1.UserStatus !== "undefined" && client_1.UserStatus) === "function" ? _b : Object)
], AuthUserDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '是否激活',
        example: true
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], AuthUserDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '租户ID',
        example: 'tenant_123'
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], AuthUserDto.prototype, "tenantId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '最后登录时间',
        example: '2024-12-19T10:30:00Z'
    }),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.toISOString()),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], AuthUserDto.prototype, "lastLoginAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '创建时间',
        example: '2024-12-19T10:30:00Z'
    }),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.toISOString()),
    __metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], AuthUserDto.prototype, "createdAt", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], AuthUserDto.prototype, "passwordHash", void 0);
class TokensDto {
    constructor(partial) {
        this.tokenType = 'Bearer';
        Object.assign(this, partial);
    }
}
exports.TokensDto = TokensDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '访问令牌',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], TokensDto.prototype, "accessToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '刷新令牌',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], TokensDto.prototype, "refreshToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '令牌类型',
        example: 'Bearer'
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], TokensDto.prototype, "tokenType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '访问令牌过期时间（秒）',
        example: 604800
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], TokensDto.prototype, "expiresIn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '刷新令牌过期时间（秒）',
        example: 2592000
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], TokensDto.prototype, "refreshExpiresIn", void 0);
class LoginResponseDto {
    constructor(partial) {
        Object.assign(this, partial);
    }
}
exports.LoginResponseDto = LoginResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '用户信息',
        type: AuthUserDto
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", AuthUserDto)
], LoginResponseDto.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '令牌信息',
        type: TokensDto
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", TokensDto)
], LoginResponseDto.prototype, "tokens", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '登录时间',
        example: '2024-12-19T10:30:00Z'
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], LoginResponseDto.prototype, "loginAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '订阅信息',
        example: {
            packageId: 'package_premium',
            status: 'ACTIVE',
            endDate: '2025-01-01T00:00:00Z'
        }
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], LoginResponseDto.prototype, "subscription", void 0);
class RegisterResponseDto {
    constructor(partial) {
        Object.assign(this, partial);
    }
}
exports.RegisterResponseDto = RegisterResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '用户信息',
        type: AuthUserDto
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", AuthUserDto)
], RegisterResponseDto.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '注册时间',
        example: '2024-12-19T10:30:00Z'
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], RegisterResponseDto.prototype, "registeredAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '是否需要邮箱验证',
        example: true
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], RegisterResponseDto.prototype, "needEmailVerification", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '验证邮件发送状态',
        example: '验证邮件已发送到您的邮箱'
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], RegisterResponseDto.prototype, "verificationMessage", void 0);
class RefreshResponseDto {
    constructor(partial) {
        Object.assign(this, partial);
    }
}
exports.RefreshResponseDto = RefreshResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '新的令牌信息',
        type: TokensDto
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", TokensDto)
], RefreshResponseDto.prototype, "tokens", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '刷新时间',
        example: '2024-12-19T10:30:00Z'
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], RefreshResponseDto.prototype, "refreshedAt", void 0);
class LogoutResponseDto {
    constructor(partial) {
        Object.assign(this, partial);
    }
}
exports.LogoutResponseDto = LogoutResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '登出时间',
        example: '2024-12-19T10:30:00Z'
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], LogoutResponseDto.prototype, "logoutAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '消息',
        example: '已成功登出'
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], LogoutResponseDto.prototype, "message", void 0);
class PasswordResetResponseDto {
    constructor(partial) {
        Object.assign(this, partial);
    }
}
exports.PasswordResetResponseDto = PasswordResetResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '重置邮件发送状态',
        example: '密码重置邮件已发送到您的邮箱'
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], PasswordResetResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '发送时间',
        example: '2024-12-19T10:30:00Z'
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], PasswordResetResponseDto.prototype, "sentAt", void 0);
class EmailVerificationResponseDto {
    constructor(partial) {
        Object.assign(this, partial);
    }
}
exports.EmailVerificationResponseDto = EmailVerificationResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '验证状态',
        example: true
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], EmailVerificationResponseDto.prototype, "verified", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '验证时间',
        example: '2024-12-19T10:30:00Z'
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], EmailVerificationResponseDto.prototype, "verifiedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '消息',
        example: '邮箱验证成功'
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], EmailVerificationResponseDto.prototype, "message", void 0);


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
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),
/* 22 */
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
exports.VerifyEmailDto = exports.ChangePasswordDto = exports.ResetPasswordDto = exports.ForgotPasswordDto = exports.RefreshTokenDto = exports.LoginDto = exports.RegisterDto = void 0;
const swagger_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(23);
class RegisterDto {
    constructor() {
        this.acceptTerms = true;
    }
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '用户邮箱地址',
        example: 'user@91writing.com',
        format: 'email'
    }),
    (0, class_validator_1.IsEmail)({}, { message: '请输入有效的邮箱地址' }),
    (0, class_validator_1.MaxLength)(100, { message: '邮箱地址不能超过100个字符' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
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
    (0, class_validator_1.Matches)(/^(?=.*[a-zA-Z])(?=.*\d)/, {
        message: '密码必须包含字母和数字'
    }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
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
], RegisterDto.prototype, "nickname", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '邀请码',
        example: 'INVITE123'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '邀请码必须是字符串' }),
    (0, class_validator_1.MaxLength)(20, { message: '邀请码不能超过20个字符' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "inviteCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '是否接受服务条款',
        default: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: '服务条款接受状态必须是布尔值' }),
    __metadata("design:type", Boolean)
], RegisterDto.prototype, "acceptTerms", void 0);
class LoginDto {
    constructor() {
        this.rememberMe = false;
    }
}
exports.LoginDto = LoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '用户邮箱地址',
        example: 'user@91writing.com'
    }),
    (0, class_validator_1.IsEmail)({}, { message: '请输入有效的邮箱地址' }),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '用户密码',
        example: 'password123'
    }),
    (0, class_validator_1.IsString)({ message: '密码必须是字符串' }),
    (0, class_validator_1.MinLength)(1, { message: '密码不能为空' }),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '是否记住登录状态',
        default: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: '记住登录状态必须是布尔值' }),
    __metadata("design:type", Boolean)
], LoginDto.prototype, "rememberMe", void 0);
class RefreshTokenDto {
}
exports.RefreshTokenDto = RefreshTokenDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '刷新令牌',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }),
    (0, class_validator_1.IsString)({ message: '刷新令牌必须是字符串' }),
    __metadata("design:type", String)
], RefreshTokenDto.prototype, "refreshToken", void 0);
class ForgotPasswordDto {
}
exports.ForgotPasswordDto = ForgotPasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '用户邮箱地址',
        example: 'user@91writing.com'
    }),
    (0, class_validator_1.IsEmail)({}, { message: '请输入有效的邮箱地址' }),
    __metadata("design:type", String)
], ForgotPasswordDto.prototype, "email", void 0);
class ResetPasswordDto {
}
exports.ResetPasswordDto = ResetPasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '重置令牌',
        example: 'reset_token_123456'
    }),
    (0, class_validator_1.IsString)({ message: '重置令牌必须是字符串' }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '新密码',
        example: 'newPassword123',
        minLength: 8,
        maxLength: 50
    }),
    (0, class_validator_1.IsString)({ message: '新密码必须是字符串' }),
    (0, class_validator_1.MinLength)(8, { message: '新密码至少需要8个字符' }),
    (0, class_validator_1.MaxLength)(50, { message: '新密码不能超过50个字符' }),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: '新密码必须包含大小写字母和数字'
    }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "newPassword", void 0);
class ChangePasswordDto {
}
exports.ChangePasswordDto = ChangePasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '当前密码',
        example: 'oldPassword123'
    }),
    (0, class_validator_1.IsString)({ message: '当前密码必须是字符串' }),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "currentPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '新密码',
        example: 'newPassword123',
        minLength: 8,
        maxLength: 50
    }),
    (0, class_validator_1.IsString)({ message: '新密码必须是字符串' }),
    (0, class_validator_1.MinLength)(8, { message: '新密码至少需要8个字符' }),
    (0, class_validator_1.MaxLength)(50, { message: '新密码不能超过50个字符' }),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: '新密码必须包含大小写字母和数字'
    }),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "newPassword", void 0);
class VerifyEmailDto {
}
exports.VerifyEmailDto = VerifyEmailDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '邮箱验证令牌',
        example: 'verify_token_123456'
    }),
    (0, class_validator_1.IsString)({ message: '验证令牌必须是字符串' }),
    __metadata("design:type", String)
], VerifyEmailDto.prototype, "token", void 0);


/***/ }),
/* 23 */
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),
/* 24 */
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
__exportStar(__webpack_require__(25), exports);
__exportStar(__webpack_require__(28), exports);
__exportStar(__webpack_require__(31), exports);
__exportStar(__webpack_require__(32), exports);
__exportStar(__webpack_require__(33), exports);
__exportStar(__webpack_require__(34), exports);


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
__exportStar(__webpack_require__(27), exports);


/***/ }),
/* 26 */
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
/* 27 */
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
/* 28 */
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
__exportStar(__webpack_require__(29), exports);
__exportStar(__webpack_require__(30), exports);


/***/ }),
/* 29 */
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
/* 30 */
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
/* 31 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


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
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LocalAuthGuard = void 0;
const common_1 = __webpack_require__(3);
const passport_1 = __webpack_require__(10);
let LocalAuthGuard = class LocalAuthGuard extends (0, passport_1.AuthGuard)('local') {
};
exports.LocalAuthGuard = LocalAuthGuard;
exports.LocalAuthGuard = LocalAuthGuard = __decorate([
    (0, common_1.Injectable)()
], LocalAuthGuard);


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
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtStrategy = void 0;
const common_1 = __webpack_require__(3);
const config_1 = __webpack_require__(5);
const passport_1 = __webpack_require__(10);
const passport_jwt_1 = __webpack_require__(37);
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
    async validateRefreshToken(payload) {
        const { sub } = payload;
        const user = await this.prisma.user.findUnique({
            where: { id: sub },
            select: {
                id: true,
                email: true,
                role: true,
                status: true,
                isActive: true,
                tenantId: true,
            },
        });
        if (!user || user.status !== 'ACTIVE' || !user.isActive) {
            throw new common_1.UnauthorizedException('无效的刷新令牌');
        }
        return user;
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _b : Object])
], JwtStrategy);


/***/ }),
/* 37 */
/***/ ((module) => {

module.exports = require("passport-jwt");

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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LocalStrategy = void 0;
const common_1 = __webpack_require__(3);
const passport_1 = __webpack_require__(10);
const passport_local_1 = __webpack_require__(39);
const auth_service_1 = __webpack_require__(17);
let LocalStrategy = class LocalStrategy extends (0, passport_1.PassportStrategy)(passport_local_1.Strategy) {
    constructor(authService) {
        super({
            usernameField: 'email',
            passwordField: 'password',
        });
        this.authService = authService;
    }
    async validate(email, password) {
        const user = await this.authService.validateUser(email, password);
        if (!user) {
            throw new common_1.UnauthorizedException('邮箱或密码错误');
        }
        return user;
    }
};
exports.LocalStrategy = LocalStrategy;
exports.LocalStrategy = LocalStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object])
], LocalStrategy);


/***/ }),
/* 39 */
/***/ ((module) => {

module.exports = require("passport-local");

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
exports.InviteModule = void 0;
const common_1 = __webpack_require__(3);
const invite_controller_1 = __webpack_require__(41);
const invite_service_1 = __webpack_require__(42);
const database_1 = __webpack_require__(11);
let InviteModule = class InviteModule {
};
exports.InviteModule = InviteModule;
exports.InviteModule = InviteModule = __decorate([
    (0, common_1.Module)({
        imports: [database_1.DatabaseModule],
        controllers: [invite_controller_1.InviteController],
        providers: [invite_service_1.InviteService],
        exports: [invite_service_1.InviteService],
    })
], InviteModule);


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
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InviteController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(4);
const invite_service_1 = __webpack_require__(42);
const common_2 = __webpack_require__(24);
let InviteController = class InviteController {
    constructor(inviteService) {
        this.inviteService = inviteService;
    }
    async getMyInviteCode(req) {
        return this.inviteService.getMyInviteCode(req.user.id);
    }
    async getInviteStats(req) {
        return this.inviteService.getInviteStats(req.user.id);
    }
    async getInviteRewards(req) {
        return this.inviteService.getInviteRewards(req.user.id);
    }
    async getInvitees(req) {
        return this.inviteService.getInvitees(req.user.id);
    }
    async claimReward(req, body) {
        return this.inviteService.claimReward(req.user.id, body.rewardId);
    }
};
exports.InviteController = InviteController;
__decorate([
    (0, common_1.Get)('my-code'),
    (0, swagger_1.ApiOperation)({
        summary: '获取我的邀请码',
        description: '获取当前用户的专属邀请码'
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
                        inviteCode: { type: 'string', example: 'ABC123' },
                        inviteCount: { type: 'number', example: 5 },
                        shareUrl: { type: 'string', example: 'https://91writing.com/register?invite=ABC123' }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: '无效的访问令牌',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], InviteController.prototype, "getMyInviteCode", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({
        summary: '获取邀请统计',
        description: '获取当前用户的邀请统计信息'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取成功',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], InviteController.prototype, "getInviteStats", null);
__decorate([
    (0, common_1.Get)('rewards'),
    (0, swagger_1.ApiOperation)({
        summary: '获取邀请奖励记录',
        description: '获取当前用户的邀请奖励记录'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取成功',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], InviteController.prototype, "getInviteRewards", null);
__decorate([
    (0, common_1.Get)('invitees'),
    (0, swagger_1.ApiOperation)({
        summary: '获取邀请的用户列表',
        description: '获取当前用户邀请的用户列表'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取成功',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], InviteController.prototype, "getInvitees", null);
__decorate([
    (0, common_1.Post)('claim-reward'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '领取邀请奖励',
        description: '手动领取待发放的邀请奖励'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '领取成功',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], InviteController.prototype, "claimReward", null);
exports.InviteController = InviteController = __decorate([
    (0, swagger_1.ApiTags)('邀请系统'),
    (0, common_1.Controller)('invite'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [typeof (_a = typeof invite_service_1.InviteService !== "undefined" && invite_service_1.InviteService) === "function" ? _a : Object])
], InviteController);


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
var InviteService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InviteService = void 0;
const common_1 = __webpack_require__(3);
const database_1 = __webpack_require__(11);
const client_1 = __webpack_require__(14);
let InviteService = InviteService_1 = class InviteService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(InviteService_1.name);
    }
    async getMyInviteCode(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                inviteCode: true,
                inviteCount: true,
            }
        });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:7520'}/auth/register?invite=${user.inviteCode}`;
        return {
            success: true,
            data: {
                inviteCode: user.inviteCode,
                inviteCount: user.inviteCount,
                shareUrl
            }
        };
    }
    async getInviteStats(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                inviteCount: true,
                inviteCode: true
            }
        });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        const inviteStats = await this.prisma.userInvite.groupBy({
            by: ['status'],
            where: { inviterId: userId },
            _count: true
        });
        const rewardStats = await this.prisma.inviteReward.groupBy({
            by: ['status', 'rewardType'],
            where: { userId },
            _count: true,
            _sum: { amount: true }
        });
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentInvites = await this.prisma.userInvite.findMany({
            where: {
                inviterId: userId,
                createdAt: { gte: thirtyDaysAgo }
            },
            orderBy: { createdAt: 'desc' },
            include: {
                invitee: {
                    select: {
                        email: true,
                        nickname: true,
                        createdAt: true
                    }
                }
            }
        });
        return {
            success: true,
            data: {
                totalInvites: user.inviteCount,
                inviteCode: user.inviteCode,
                invitesByStatus: inviteStats,
                rewardsByType: rewardStats,
                recentInvites: recentInvites.slice(0, 10)
            }
        };
    }
    async getInviteRewards(userId) {
        const rewards = await this.prisma.inviteReward.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                invite: {
                    include: {
                        invitee: {
                            select: {
                                email: true,
                                nickname: true
                            }
                        }
                    }
                }
            }
        });
        const totalRewards = await this.prisma.inviteReward.aggregate({
            where: {
                userId,
                status: client_1.RewardStatus.GRANTED
            },
            _sum: { amount: true },
            _count: true
        });
        return {
            success: true,
            data: {
                rewards,
                summary: {
                    totalCount: totalRewards._count,
                    totalAmount: totalRewards._sum.amount || 0
                }
            }
        };
    }
    async getInvitees(userId) {
        const invitees = await this.prisma.user.findMany({
            where: { invitedBy: userId },
            select: {
                id: true,
                email: true,
                nickname: true,
                createdAt: true,
                status: true,
                inviteCount: true,
            },
            orderBy: { createdAt: 'desc' }
        });
        return {
            success: true,
            data: {
                invitees,
                count: invitees.length
            }
        };
    }
    async claimReward(userId, rewardId) {
        const reward = await this.prisma.inviteReward.findFirst({
            where: {
                id: rewardId,
                userId,
                status: client_1.RewardStatus.PENDING
            }
        });
        if (!reward) {
            throw new common_1.BadRequestException('奖励不存在或已领取');
        }
        const updatedReward = await this.prisma.inviteReward.update({
            where: { id: rewardId },
            data: {
                status: client_1.RewardStatus.GRANTED,
                grantedAt: new Date()
            }
        });
        this.logger.log(`用户 ${userId} 领取奖励成功: ${rewardId}`);
        return {
            success: true,
            data: updatedReward,
            message: '奖励领取成功'
        };
    }
};
exports.InviteService = InviteService;
exports.InviteService = InviteService = InviteService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], InviteService);


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
exports.HealthModule = void 0;
const common_1 = __webpack_require__(3);
const terminus_1 = __webpack_require__(44);
const health_controller_1 = __webpack_require__(45);
const health_service_1 = __webpack_require__(46);
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
/* 44 */
/***/ ((module) => {

module.exports = require("@nestjs/terminus");

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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HealthController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(4);
const terminus_1 = __webpack_require__(44);
const database_1 = __webpack_require__(11);
let HealthController = class HealthController {
    constructor(health, prismaHealth, memory, prisma) {
        this.health = health;
        this.prismaHealth = prismaHealth;
        this.memory = memory;
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
        ]);
    }
    async detailed() {
        const basicHealth = await this.check();
        return {
            ...basicHealth,
            service: {
                name: '91Writing 认证服务',
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
            auth: {
                jwtEnabled: true,
                strategies: ['local', 'jwt'],
                endpoints: [
                    'POST /api/v1/auth/register',
                    'POST /api/v1/auth/login',
                    'POST /api/v1/auth/refresh',
                    'POST /api/v1/auth/logout',
                    'GET /api/v1/auth/me',
                ],
            },
        };
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: '基础健康检查',
        description: '检查认证服务的基本运行状态'
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
        description: '检查认证服务是否准备好接收请求'
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
        description: '检查认证服务是否仍在运行'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '服务存活',
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
        description: '获取认证服务的详细健康状态信息'
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
    __metadata("design:paramtypes", [typeof (_a = typeof terminus_1.HealthCheckService !== "undefined" && terminus_1.HealthCheckService) === "function" ? _a : Object, typeof (_b = typeof terminus_1.PrismaHealthIndicator !== "undefined" && terminus_1.PrismaHealthIndicator) === "function" ? _b : Object, typeof (_c = typeof terminus_1.MemoryHealthIndicator !== "undefined" && terminus_1.MemoryHealthIndicator) === "function" ? _c : Object, typeof (_d = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _d : Object])
], HealthController);


/***/ }),
/* 46 */
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
    async checkAuthService() {
        try {
            const userCount = await this.prisma.user.count();
            const lastUser = await this.prisma.user.findFirst({
                orderBy: { createdAt: 'desc' },
                select: { createdAt: true },
            });
            const lastLogin = await this.prisma.user.findFirst({
                where: { lastLoginAt: { not: null } },
                orderBy: { lastLoginAt: 'desc' },
                select: { lastLoginAt: true },
            });
            return {
                canQuery: true,
                userCount,
                lastUserRegistered: lastUser?.createdAt,
                lastUserLogin: lastLogin?.lastLoginAt,
            };
        }
        catch (error) {
            return {
                canQuery: false,
                userCount: 0,
            };
        }
    }
    getAuthPerformanceMetrics() {
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
        const authServiceStatus = await this.checkAuthService();
        return {
            database: {
                status: databaseStatus ? 'healthy' : 'unhealthy',
                canConnect: databaseStatus,
            },
            authService: {
                status: authServiceStatus.canQuery ? 'healthy' : 'unhealthy',
                ...authServiceStatus,
            },
            external: {
                jwt: {
                    status: 'healthy',
                    algorithm: 'HS256',
                },
                bcrypt: {
                    status: 'healthy',
                    rounds: 12,
                },
            },
        };
    }
    checkJwtService() {
        return {
            isEnabled: true,
            algorithm: 'HS256',
            defaultExpiration: process.env.JWT_EXPIRES_IN || '7d',
        };
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], HealthService);


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
            if (status === common_1.HttpStatus.BAD_REQUEST && typeof response === 'object') {
                const responseObj = response;
                this.logger.error(`Validation Error Details:`, JSON.stringify(responseObj, null, 2));
                return {
                    success: false,
                    error: {
                        code: status.toString(),
                        message: responseObj.message || 'Validation failed',
                        details: responseObj,
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
            if (request.url.includes('register')) {
                apiResponse.message = '注册成功';
            }
            else if (request.url.includes('login')) {
                apiResponse.message = '登录成功';
            }
            else if (request.url.includes('refresh')) {
                apiResponse.message = '令牌刷新成功';
            }
            else if (request.url.includes('logout')) {
                apiResponse.message = '登出成功';
            }
            else if (request.url.includes('change-password')) {
                apiResponse.message = '密码修改成功';
            }
            else if (request.url.includes('forgot-password')) {
                apiResponse.message = '密码重置邮件发送成功';
            }
            else if (request.url.includes('reset-password')) {
                apiResponse.message = '密码重置成功';
            }
            else if (request.url.includes('verify-email')) {
                apiResponse.message = '邮箱验证成功';
            }
            else if (request.method === 'GET') {
                apiResponse.message = '获取成功';
            }
            else if (request.method === 'POST') {
                apiResponse.message = '操作成功';
            }
            else if (request.method === 'PUT' || request.method === 'PATCH') {
                apiResponse.message = '更新成功';
            }
            else if (request.method === 'DELETE') {
                apiResponse.message = '删除成功';
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
    const logger = new common_2.Logger('AuthService');
    app.setGlobalPrefix('api/v1/auth');
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
            .setTitle('91Writing 认证服务 API')
            .setDescription('91Writing 用户认证和授权服务接口文档')
            .setVersion('1.0')
            .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
            in: 'header',
        }, 'JWT-auth')
            .addTag('认证管理', '用户注册、登录、Token管理')
            .addTag('权限控制', '角色权限、访问控制')
            .addTag('密码管理', '密码重置、密码修改')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs/auth', app, document, {
            swaggerOptions: {
                persistAuthorization: true,
            },
        });
    }
    const port = configService.get('AUTH_SERVICE_PORT', 3002);
    await app.listen(port);
    logger.log(`🔐 认证服务已启动: http://localhost:${port}`);
    logger.log(`📖 API文档地址: http://localhost:${port}/api/docs/auth`);
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