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
const config_1 = __webpack_require__(5);
const passport_1 = __webpack_require__(6);
const jwt_1 = __webpack_require__(7);
const database_1 = __webpack_require__(8);
const health_module_1 = __webpack_require__(12);
const package_module_1 = __webpack_require__(15);
const subscription_module_1 = __webpack_require__(34);
const payment_module_1 = __webpack_require__(40);
const jwt_strategy_1 = __webpack_require__(47);
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
            passport_1.PassportModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'your-secret-key',
                signOptions: { expiresIn: '24h' },
            }),
            database_1.DatabaseModule,
            health_module_1.HealthModule,
            package_module_1.PackageModule,
            subscription_module_1.SubscriptionModule,
            payment_module_1.PaymentModule,
        ],
        providers: [jwt_strategy_1.JwtStrategy],
    })
], AppModule);


/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("@nestjs/passport");

/***/ }),
/* 7 */
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),
/* 8 */
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
__exportStar(__webpack_require__(9), exports);
__exportStar(__webpack_require__(10), exports);


/***/ }),
/* 9 */
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
const config_1 = __webpack_require__(5);
const prisma_service_1 = __webpack_require__(10);
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
/* 10 */
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
const config_1 = __webpack_require__(5);
const client_1 = __webpack_require__(11);
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
/* 11 */
/***/ ((module) => {

module.exports = require("@prisma/client");

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
exports.HealthModule = void 0;
const common_1 = __webpack_require__(2);
const health_controller_1 = __webpack_require__(13);
const health_service_1 = __webpack_require__(14);
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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HealthController = void 0;
const common_1 = __webpack_require__(2);
const swagger_1 = __webpack_require__(3);
const health_service_1 = __webpack_require__(14);
let HealthController = class HealthController {
    constructor(healthService) {
        this.healthService = healthService;
    }
    check() {
        return this.healthService.check();
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '健康检查' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "check", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('健康检查'),
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [typeof (_a = typeof health_service_1.HealthService !== "undefined" && health_service_1.HealthService) === "function" ? _a : Object])
], HealthController);


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
exports.HealthService = void 0;
const common_1 = __webpack_require__(2);
let HealthService = class HealthService {
    check() {
        return {
            status: 'ok',
            service: 'payment-service',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        };
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = __decorate([
    (0, common_1.Injectable)()
], HealthService);


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
exports.PackageModule = void 0;
const common_1 = __webpack_require__(2);
const package_controller_1 = __webpack_require__(16);
const package_service_1 = __webpack_require__(17);
let PackageModule = class PackageModule {
};
exports.PackageModule = PackageModule;
exports.PackageModule = PackageModule = __decorate([
    (0, common_1.Module)({
        controllers: [package_controller_1.PackageController],
        providers: [package_service_1.PackageService],
        exports: [package_service_1.PackageService],
    })
], PackageModule);


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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PackageController = void 0;
const common_1 = __webpack_require__(2);
const swagger_1 = __webpack_require__(3);
const package_service_1 = __webpack_require__(17);
const create_package_dto_1 = __webpack_require__(18);
const update_package_dto_1 = __webpack_require__(21);
const query_package_dto_1 = __webpack_require__(22);
const common_2 = __webpack_require__(23);
let PackageController = class PackageController {
    constructor(packageService) {
        this.packageService = packageService;
    }
    create(createPackageDto) {
        return this.packageService.create(createPackageDto);
    }
    findAll(query) {
        return this.packageService.findAll(query);
    }
    findActive() {
        return this.packageService.findActive();
    }
    findOne(id) {
        return this.packageService.findOne(+id);
    }
    update(id, updatePackageDto) {
        return this.packageService.update(+id, updatePackageDto);
    }
    remove(id) {
        return this.packageService.remove(+id);
    }
};
exports.PackageController = PackageController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: '创建套餐' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '套餐创建成功' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof create_package_dto_1.CreatePackageDto !== "undefined" && create_package_dto_1.CreatePackageDto) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], PackageController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '获取套餐列表' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '套餐列表获取成功' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof query_package_dto_1.QueryPackageDto !== "undefined" && query_package_dto_1.QueryPackageDto) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], PackageController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('active'),
    (0, swagger_1.ApiOperation)({ summary: '获取可用套餐列表' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '可用套餐列表获取成功' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PackageController.prototype, "findActive", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '获取套餐详情' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '套餐详情获取成功' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PackageController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: '更新套餐' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '套餐更新成功' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_d = typeof update_package_dto_1.UpdatePackageDto !== "undefined" && update_package_dto_1.UpdatePackageDto) === "function" ? _d : Object]),
    __metadata("design:returntype", void 0)
], PackageController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: '删除套餐' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '套餐删除成功' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PackageController.prototype, "remove", null);
exports.PackageController = PackageController = __decorate([
    (0, swagger_1.ApiTags)('套餐管理'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('packages'),
    __metadata("design:paramtypes", [typeof (_a = typeof package_service_1.PackageService !== "undefined" && package_service_1.PackageService) === "function" ? _a : Object])
], PackageController);


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
exports.PackageService = void 0;
const common_1 = __webpack_require__(2);
const database_1 = __webpack_require__(8);
const client_1 = __webpack_require__(11);
let PackageService = class PackageService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createPackageDto) {
        const existingPackage = await this.prisma.package.findUnique({
            where: { name: createPackageDto.name },
        });
        if (existingPackage) {
            throw new common_1.BadRequestException('套餐名称已存在');
        }
        return this.prisma.package.create({
            data: createPackageDto,
        });
    }
    async findAll(query) {
        const { status, page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;
        const where = status ? { status } : {};
        const [packages, total] = await Promise.all([
            this.prisma.package.findMany({
                where,
                skip,
                take: limit,
                orderBy: [
                    { sortOrder: 'asc' },
                    { createdAt: 'desc' },
                ],
            }),
            this.prisma.package.count({ where }),
        ]);
        return {
            packages,
            pagination: {
                current: page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async findActive() {
        return this.prisma.package.findMany({
            where: { status: client_1.PackageStatus.ACTIVE },
            orderBy: [
                { sortOrder: 'asc' },
                { price: 'asc' },
            ],
        });
    }
    async findOne(id) {
        const package_ = await this.prisma.package.findUnique({
            where: { id },
        });
        if (!package_) {
            throw new common_1.NotFoundException('套餐不存在');
        }
        return package_;
    }
    async update(id, updatePackageDto) {
        await this.findOne(id);
        if (updatePackageDto.name) {
            const existingPackage = await this.prisma.package.findUnique({
                where: { name: updatePackageDto.name },
            });
            if (existingPackage && existingPackage.id !== id) {
                throw new common_1.BadRequestException('套餐名称已存在');
            }
        }
        return this.prisma.package.update({
            where: { id },
            data: updatePackageDto,
        });
    }
    async remove(id) {
        await this.findOne(id);
        const activeSubscriptions = await this.prisma.subscription.count({
            where: {
                packageId: id,
                status: { in: ['ACTIVE', 'PENDING'] },
            },
        });
        if (activeSubscriptions > 0) {
            throw new common_1.BadRequestException('该套餐有活跃订阅，无法删除');
        }
        return this.prisma.package.delete({
            where: { id },
        });
    }
};
exports.PackageService = PackageService;
exports.PackageService = PackageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], PackageService);


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
exports.CreatePackageDto = void 0;
const class_validator_1 = __webpack_require__(19);
const swagger_1 = __webpack_require__(3);
const client_1 = __webpack_require__(11);
const class_transformer_1 = __webpack_require__(20);
class CreatePackageDto {
}
exports.CreatePackageDto = CreatePackageDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '套餐名称', example: 'VIP会员' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePackageDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '套餐描述', example: '享受所有高级功能', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePackageDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '价格', example: 99.00 }),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreatePackageDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '持续天数', example: 30 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreatePackageDto.prototype, "durationDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '功能配置',
        example: {
            maxNovels: 10,
            maxChaptersPerNovel: 100,
            aiGenerationLimit: 1000,
            advancedFeatures: true
        }
    }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object)
], CreatePackageDto.prototype, "features", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '排序顺序', example: 1, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreatePackageDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '状态', enum: client_1.PackageStatus, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.PackageStatus),
    __metadata("design:type", typeof (_b = typeof client_1.PackageStatus !== "undefined" && client_1.PackageStatus) === "function" ? _b : Object)
], CreatePackageDto.prototype, "status", void 0);


/***/ }),
/* 19 */
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),
/* 20 */
/***/ ((module) => {

module.exports = require("class-transformer");

/***/ }),
/* 21 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdatePackageDto = void 0;
const swagger_1 = __webpack_require__(3);
const create_package_dto_1 = __webpack_require__(18);
class UpdatePackageDto extends (0, swagger_1.PartialType)(create_package_dto_1.CreatePackageDto) {
}
exports.UpdatePackageDto = UpdatePackageDto;


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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QueryPackageDto = void 0;
const class_validator_1 = __webpack_require__(19);
const swagger_1 = __webpack_require__(3);
const client_1 = __webpack_require__(11);
const class_transformer_1 = __webpack_require__(20);
class QueryPackageDto {
}
exports.QueryPackageDto = QueryPackageDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '状态', enum: client_1.PackageStatus, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.PackageStatus),
    __metadata("design:type", typeof (_a = typeof client_1.PackageStatus !== "undefined" && client_1.PackageStatus) === "function" ? _a : Object)
], QueryPackageDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '页码', example: 1, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryPackageDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '每页数量', example: 10, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryPackageDto.prototype, "limit", void 0);


/***/ }),
/* 23 */
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
__exportStar(__webpack_require__(24), exports);
__exportStar(__webpack_require__(27), exports);
__exportStar(__webpack_require__(30), exports);
__exportStar(__webpack_require__(31), exports);
__exportStar(__webpack_require__(32), exports);
__exportStar(__webpack_require__(33), exports);


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
__exportStar(__webpack_require__(26), exports);


/***/ }),
/* 25 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TenantId = exports.Tenant = void 0;
const common_1 = __webpack_require__(2);
exports.Tenant = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantId || request.headers['x-tenant-id'];
});
exports.TenantId = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.tenantId || request.headers['x-tenant-id'];
});


/***/ }),
/* 26 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CurrentUser = exports.User = void 0;
const common_1 = __webpack_require__(2);
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
/* 27 */
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
__exportStar(__webpack_require__(28), exports);
__exportStar(__webpack_require__(29), exports);


/***/ }),
/* 28 */
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
const passport_1 = __webpack_require__(6);
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
/* 29 */
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
/* 30 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


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
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SubscriptionModule = void 0;
const common_1 = __webpack_require__(2);
const subscription_controller_1 = __webpack_require__(35);
const subscription_service_1 = __webpack_require__(36);
const package_module_1 = __webpack_require__(15);
let SubscriptionModule = class SubscriptionModule {
};
exports.SubscriptionModule = SubscriptionModule;
exports.SubscriptionModule = SubscriptionModule = __decorate([
    (0, common_1.Module)({
        imports: [package_module_1.PackageModule],
        controllers: [subscription_controller_1.SubscriptionController],
        providers: [subscription_service_1.SubscriptionService],
        exports: [subscription_service_1.SubscriptionService],
    })
], SubscriptionModule);


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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SubscriptionController = void 0;
const common_1 = __webpack_require__(2);
const swagger_1 = __webpack_require__(3);
const subscription_service_1 = __webpack_require__(36);
const create_subscription_dto_1 = __webpack_require__(37);
const update_subscription_dto_1 = __webpack_require__(38);
const common_2 = __webpack_require__(23);
const express_1 = __webpack_require__(39);
let SubscriptionController = class SubscriptionController {
    constructor(subscriptionService) {
        this.subscriptionService = subscriptionService;
    }
    create(createSubscriptionDto, req) {
        const userId = req.user.sub;
        return this.subscriptionService.create(userId, createSubscriptionDto);
    }
    findCurrent(req) {
        const userId = req.user.sub;
        return this.subscriptionService.findByUser(userId);
    }
    checkStatus(req) {
        const userId = req.user.sub;
        return this.subscriptionService.checkStatus(userId);
    }
    findOne(id, req) {
        const userId = req.user.sub;
        return this.subscriptionService.findOne(id, userId);
    }
    update(id, updateSubscriptionDto, req) {
        const userId = req.user.sub;
        return this.subscriptionService.update(id, userId, updateSubscriptionDto);
    }
    cancel(id, req) {
        const userId = req.user.sub;
        return this.subscriptionService.cancel(id, userId);
    }
    renew(id, req) {
        const userId = req.user.sub;
        return this.subscriptionService.renew(id, userId);
    }
};
exports.SubscriptionController = SubscriptionController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '创建订阅' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '订阅创建成功' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof create_subscription_dto_1.CreateSubscriptionDto !== "undefined" && create_subscription_dto_1.CreateSubscriptionDto) === "function" ? _b : Object, typeof (_c = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], SubscriptionController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('current'),
    (0, swagger_1.ApiOperation)({ summary: '获取当前用户订阅' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '用户订阅信息获取成功' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _d : Object]),
    __metadata("design:returntype", void 0)
], SubscriptionController.prototype, "findCurrent", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({ summary: '检查订阅状态' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '订阅状态检查成功' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _e : Object]),
    __metadata("design:returntype", void 0)
], SubscriptionController.prototype, "checkStatus", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '获取订阅详情' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '订阅详情获取成功' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_f = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _f : Object]),
    __metadata("design:returntype", void 0)
], SubscriptionController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '更新订阅' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '订阅更新成功' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_g = typeof update_subscription_dto_1.UpdateSubscriptionDto !== "undefined" && update_subscription_dto_1.UpdateSubscriptionDto) === "function" ? _g : Object, typeof (_h = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _h : Object]),
    __metadata("design:returntype", void 0)
], SubscriptionController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: '取消订阅' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '订阅取消成功' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_j = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _j : Object]),
    __metadata("design:returntype", void 0)
], SubscriptionController.prototype, "cancel", null);
__decorate([
    (0, common_1.Post)(':id/renew'),
    (0, swagger_1.ApiOperation)({ summary: '续费订阅' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '订阅续费成功' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_k = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _k : Object]),
    __metadata("design:returntype", void 0)
], SubscriptionController.prototype, "renew", null);
exports.SubscriptionController = SubscriptionController = __decorate([
    (0, swagger_1.ApiTags)('订阅管理'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, common_1.Controller)('subscriptions'),
    __metadata("design:paramtypes", [typeof (_a = typeof subscription_service_1.SubscriptionService !== "undefined" && subscription_service_1.SubscriptionService) === "function" ? _a : Object])
], SubscriptionController);


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
exports.SubscriptionService = void 0;
const common_1 = __webpack_require__(2);
const database_1 = __webpack_require__(8);
const client_1 = __webpack_require__(11);
const package_service_1 = __webpack_require__(17);
let SubscriptionService = class SubscriptionService {
    constructor(prisma, packageService) {
        this.prisma = prisma;
        this.packageService = packageService;
    }
    async create(userId, createSubscriptionDto) {
        const { packageId } = createSubscriptionDto;
        const package_ = await this.packageService.findOne(packageId);
        if (package_.status !== 'ACTIVE') {
            throw new common_1.BadRequestException('该套餐不可用');
        }
        const existingSubscription = await this.prisma.subscription.findUnique({
            where: { userId },
        });
        if (existingSubscription && existingSubscription.status === client_1.SubscriptionStatus.ACTIVE) {
            if (new Date() < existingSubscription.endDate) {
                throw new common_1.ConflictException('您已有活跃订阅，请等待当前订阅结束后再订阅');
            }
        }
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + package_.durationDays);
        const subscriptionData = {
            userId,
            packageId,
            startDate,
            endDate,
            status: client_1.SubscriptionStatus.PENDING,
            ...createSubscriptionDto,
        };
        if (existingSubscription) {
            return this.prisma.subscription.update({
                where: { userId },
                data: subscriptionData,
                include: { package: true },
            });
        }
        else {
            return this.prisma.subscription.create({
                data: subscriptionData,
                include: { package: true },
            });
        }
    }
    async findByUser(userId) {
        return this.prisma.subscription.findFirst({
            where: { userId },
            include: {
                package: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        nickname: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, userId) {
        const subscription = await this.prisma.subscription.findFirst({
            where: { id, userId },
            include: { package: true },
        });
        if (!subscription) {
            throw new common_1.NotFoundException('订阅不存在');
        }
        return subscription;
    }
    async update(id, userId, updateSubscriptionDto) {
        await this.findOne(id, userId);
        return this.prisma.subscription.update({
            where: { id },
            data: updateSubscriptionDto,
            include: { package: true },
        });
    }
    async cancel(id, userId) {
        const subscription = await this.findOne(id, userId);
        if (subscription.status === client_1.SubscriptionStatus.CANCELLED) {
            throw new common_1.BadRequestException('订阅已取消');
        }
        return this.prisma.subscription.update({
            where: { id },
            data: {
                status: client_1.SubscriptionStatus.CANCELLED,
                autoRenew: false,
            },
            include: { package: true },
        });
    }
    async renew(id, userId) {
        const subscription = await this.findOne(id, userId);
        if (subscription.status === client_1.SubscriptionStatus.ACTIVE && new Date() < subscription.endDate) {
            throw new common_1.BadRequestException('订阅仍然有效，无需续费');
        }
        const package_ = await this.packageService.findOne(subscription.packageId);
        const newStartDate = new Date();
        const newEndDate = new Date();
        newEndDate.setDate(newStartDate.getDate() + package_.durationDays);
        return this.prisma.subscription.update({
            where: { id },
            data: {
                startDate: newStartDate,
                endDate: newEndDate,
                status: client_1.SubscriptionStatus.PENDING,
            },
            include: { package: true },
        });
    }
    async checkStatus(userId) {
        const subscription = await this.findByUser(userId);
        if (!subscription) {
            return {
                hasSubscription: false,
                isActive: false,
                status: null,
                expiredAt: null,
                daysLeft: 0,
            };
        }
        const now = new Date();
        const isActive = subscription.status === client_1.SubscriptionStatus.ACTIVE && now < subscription.endDate;
        const daysLeft = isActive
            ? Math.ceil((subscription.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            : 0;
        return {
            hasSubscription: true,
            isActive,
            status: subscription.status,
            expiredAt: subscription.endDate,
            daysLeft,
            package: subscription.package,
        };
    }
    async activate(subscriptionId) {
        return this.prisma.subscription.update({
            where: { id: subscriptionId },
            data: { status: client_1.SubscriptionStatus.ACTIVE },
            include: { package: true },
        });
    }
    async checkExpiredSubscriptions() {
        const expiredSubscriptions = await this.prisma.subscription.findMany({
            where: {
                status: client_1.SubscriptionStatus.ACTIVE,
                endDate: { lt: new Date() },
            },
        });
        if (expiredSubscriptions.length > 0) {
            await this.prisma.subscription.updateMany({
                where: {
                    id: { in: expiredSubscriptions.map(s => s.id) },
                },
                data: { status: client_1.SubscriptionStatus.EXPIRED },
            });
        }
        return { expired: expiredSubscriptions.length };
    }
};
exports.SubscriptionService = SubscriptionService;
exports.SubscriptionService = SubscriptionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof package_service_1.PackageService !== "undefined" && package_service_1.PackageService) === "function" ? _b : Object])
], SubscriptionService);


/***/ }),
/* 37 */
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
exports.CreateSubscriptionDto = void 0;
const class_validator_1 = __webpack_require__(19);
const swagger_1 = __webpack_require__(3);
const class_transformer_1 = __webpack_require__(20);
class CreateSubscriptionDto {
}
exports.CreateSubscriptionDto = CreateSubscriptionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '套餐ID', example: 1 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateSubscriptionDto.prototype, "packageId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否自动续费', example: false, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSubscriptionDto.prototype, "autoRenew", void 0);


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
exports.UpdateSubscriptionDto = void 0;
const class_validator_1 = __webpack_require__(19);
const swagger_1 = __webpack_require__(3);
const client_1 = __webpack_require__(11);
class UpdateSubscriptionDto {
}
exports.UpdateSubscriptionDto = UpdateSubscriptionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否自动续费', example: false, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSubscriptionDto.prototype, "autoRenew", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '订阅状态', enum: client_1.SubscriptionStatus, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.SubscriptionStatus),
    __metadata("design:type", typeof (_a = typeof client_1.SubscriptionStatus !== "undefined" && client_1.SubscriptionStatus) === "function" ? _a : Object)
], UpdateSubscriptionDto.prototype, "status", void 0);


/***/ }),
/* 39 */
/***/ ((module) => {

module.exports = require("express");

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
exports.PaymentModule = void 0;
const common_1 = __webpack_require__(2);
const payment_controller_1 = __webpack_require__(41);
const payment_service_1 = __webpack_require__(42);
const package_module_1 = __webpack_require__(15);
const subscription_module_1 = __webpack_require__(34);
const alipay_service_1 = __webpack_require__(43);
const wechat_service_1 = __webpack_require__(44);
let PaymentModule = class PaymentModule {
};
exports.PaymentModule = PaymentModule;
exports.PaymentModule = PaymentModule = __decorate([
    (0, common_1.Module)({
        imports: [package_module_1.PackageModule, subscription_module_1.SubscriptionModule],
        controllers: [payment_controller_1.PaymentController],
        providers: [payment_service_1.PaymentService, alipay_service_1.AlipayService, wechat_service_1.WechatService],
        exports: [payment_service_1.PaymentService],
    })
], PaymentModule);


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
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PaymentController = void 0;
const common_1 = __webpack_require__(2);
const swagger_1 = __webpack_require__(3);
const payment_service_1 = __webpack_require__(42);
const create_payment_order_dto_1 = __webpack_require__(45);
const query_payment_order_dto_1 = __webpack_require__(46);
const common_2 = __webpack_require__(23);
const express_1 = __webpack_require__(39);
let PaymentController = class PaymentController {
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    createOrder(createOrderDto, req) {
        const userId = req.user.sub;
        return this.paymentService.createOrder(userId, createOrderDto);
    }
    getOrders(query, req) {
        const userId = req.user.sub;
        return this.paymentService.findUserOrders(userId, query);
    }
    getOrder(orderNo, req) {
        const userId = req.user.sub;
        return this.paymentService.findOrder(orderNo, userId);
    }
    pay(orderNo, req) {
        const userId = req.user.sub;
        return this.paymentService.pay(orderNo, userId);
    }
    cancel(orderNo, req) {
        const userId = req.user.sub;
        return this.paymentService.cancelOrder(orderNo, userId);
    }
    alipayNotify(notifyData) {
        return this.paymentService.handleAlipayNotify(notifyData);
    }
    wechatNotify(notifyData) {
        return this.paymentService.handleWechatNotify(notifyData);
    }
};
exports.PaymentController = PaymentController;
__decorate([
    (0, common_1.Post)('orders'),
    (0, swagger_1.ApiOperation)({ summary: '创建支付订单' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '支付订单创建成功' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof create_payment_order_dto_1.CreatePaymentOrderDto !== "undefined" && create_payment_order_dto_1.CreatePaymentOrderDto) === "function" ? _b : Object, typeof (_c = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], PaymentController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Get)('orders'),
    (0, swagger_1.ApiOperation)({ summary: '获取用户支付订单列表' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '支付订单列表获取成功' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof query_payment_order_dto_1.QueryPaymentOrderDto !== "undefined" && query_payment_order_dto_1.QueryPaymentOrderDto) === "function" ? _d : Object, typeof (_e = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _e : Object]),
    __metadata("design:returntype", void 0)
], PaymentController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Get)('orders/:orderNo'),
    (0, swagger_1.ApiOperation)({ summary: '获取支付订单详情' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '支付订单详情获取成功' }),
    __param(0, (0, common_1.Param)('orderNo')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_f = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _f : Object]),
    __metadata("design:returntype", void 0)
], PaymentController.prototype, "getOrder", null);
__decorate([
    (0, common_1.Post)('orders/:orderNo/pay'),
    (0, swagger_1.ApiOperation)({ summary: '发起支付' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '支付发起成功' }),
    __param(0, (0, common_1.Param)('orderNo')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_g = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _g : Object]),
    __metadata("design:returntype", void 0)
], PaymentController.prototype, "pay", null);
__decorate([
    (0, common_1.Post)('orders/:orderNo/cancel'),
    (0, swagger_1.ApiOperation)({ summary: '取消支付订单' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '支付订单取消成功' }),
    __param(0, (0, common_1.Param)('orderNo')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_h = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _h : Object]),
    __metadata("design:returntype", void 0)
], PaymentController.prototype, "cancel", null);
__decorate([
    (0, common_1.Post)('alipay/notify'),
    (0, swagger_1.ApiOperation)({ summary: '支付宝支付回调' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '回调处理成功' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentController.prototype, "alipayNotify", null);
__decorate([
    (0, common_1.Post)('wechat/notify'),
    (0, swagger_1.ApiOperation)({ summary: '微信支付回调' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '回调处理成功' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentController.prototype, "wechatNotify", null);
exports.PaymentController = PaymentController = __decorate([
    (0, swagger_1.ApiTags)('支付管理'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [typeof (_a = typeof payment_service_1.PaymentService !== "undefined" && payment_service_1.PaymentService) === "function" ? _a : Object])
], PaymentController);


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
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PaymentService = void 0;
const common_1 = __webpack_require__(2);
const database_1 = __webpack_require__(8);
const client_1 = __webpack_require__(11);
const package_service_1 = __webpack_require__(17);
const subscription_service_1 = __webpack_require__(36);
const alipay_service_1 = __webpack_require__(43);
const wechat_service_1 = __webpack_require__(44);
let PaymentService = class PaymentService {
    constructor(prisma, packageService, subscriptionService, alipayService, wechatService) {
        this.prisma = prisma;
        this.packageService = packageService;
        this.subscriptionService = subscriptionService;
        this.alipayService = alipayService;
        this.wechatService = wechatService;
    }
    async createOrder(userId, createOrderDto) {
        const { packageId, paymentMethod } = createOrderDto;
        const package_ = await this.packageService.findOne(packageId);
        const orderNo = this.generateOrderNo();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);
        const order = await this.prisma.paymentOrder.create({
            data: {
                orderNo,
                userId,
                packageId,
                amount: package_.price,
                paymentMethod,
                status: client_1.PaymentStatus.PENDING,
                expiresAt,
            },
            include: {
                package: true,
                user: {
                    select: { id: true, email: true, username: true, nickname: true },
                },
            },
        });
        return order;
    }
    async findUserOrders(userId, query) {
        const { status, page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;
        const where = { userId, ...(status && { status }) };
        const [orders, total] = await Promise.all([
            this.prisma.paymentOrder.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    package: true,
                    user: {
                        select: { id: true, email: true, username: true, nickname: true },
                    },
                },
            }),
            this.prisma.paymentOrder.count({ where }),
        ]);
        return {
            orders,
            pagination: {
                current: page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async findOrder(orderNo, userId) {
        const order = await this.prisma.paymentOrder.findUnique({
            where: { orderNo },
            include: {
                package: true,
                user: {
                    select: { id: true, email: true, username: true, nickname: true },
                },
            },
        });
        if (!order) {
            throw new common_1.NotFoundException('订单不存在');
        }
        if (userId && order.userId !== userId) {
            throw new common_1.NotFoundException('订单不存在');
        }
        return order;
    }
    async pay(orderNo, userId) {
        const order = await this.findOrder(orderNo, userId);
        if (order.status !== client_1.PaymentStatus.PENDING) {
            throw new common_1.BadRequestException('订单状态不正确');
        }
        if (new Date() > order.expiresAt) {
            throw new common_1.BadRequestException('订单已过期');
        }
        let paymentResult;
        switch (order.paymentMethod) {
            case client_1.PaymentMethod.ALIPAY:
                paymentResult = await this.alipayService.createPayment({
                    orderNo: order.orderNo,
                    amount: order.amount.toNumber(),
                    subject: `${order.package.name} - 91Writing`,
                });
                break;
            case client_1.PaymentMethod.WECHAT:
                paymentResult = await this.wechatService.createPayment({
                    orderNo: order.orderNo,
                    amount: order.amount.toNumber(),
                    description: `${order.package.name} - 91Writing`,
                });
                break;
            default:
                throw new common_1.BadRequestException('不支持的支付方式');
        }
        return {
            order,
            payment: paymentResult,
        };
    }
    async handleAlipayNotify(notifyData) {
        const isValid = await this.alipayService.verifyNotify(notifyData);
        if (!isValid) {
            throw new common_1.BadRequestException('Invalid notification');
        }
        const { out_trade_no: orderNo, trade_status } = notifyData;
        if (trade_status === 'TRADE_SUCCESS') {
            await this.completePayment(orderNo, notifyData.trade_no);
        }
        return 'success';
    }
    async handleWechatNotify(notifyData) {
        const isValid = await this.wechatService.verifyNotify(notifyData);
        if (!isValid) {
            throw new common_1.BadRequestException('Invalid notification');
        }
        const { out_trade_no: orderNo, transaction_id } = notifyData;
        if (notifyData.trade_state === 'SUCCESS') {
            await this.completePayment(orderNo, transaction_id);
        }
        return { code: 'SUCCESS', message: '成功' };
    }
    async completePayment(orderNo, transactionId) {
        const order = await this.findOrder(orderNo);
        if (order.status === client_1.PaymentStatus.PAID) {
            return order;
        }
        const updatedOrder = await this.prisma.paymentOrder.update({
            where: { orderNo },
            data: {
                status: client_1.PaymentStatus.PAID,
                paidAt: new Date(),
                transactionId,
            },
            include: {
                package: true,
                user: true,
            },
        });
        await this.subscriptionService.create(order.userId, {
            packageId: order.packageId,
        });
        const subscription = await this.subscriptionService.findByUser(order.userId);
        if (subscription) {
            await this.subscriptionService.activate(subscription.id);
        }
        return updatedOrder;
    }
    async cancelOrder(orderNo, userId) {
        const order = await this.findOrder(orderNo, userId);
        if (order.status !== client_1.PaymentStatus.PENDING) {
            throw new common_1.BadRequestException('订单状态不正确');
        }
        return this.prisma.paymentOrder.update({
            where: { orderNo },
            data: { status: client_1.PaymentStatus.CANCELLED },
            include: { package: true },
        });
    }
    generateOrderNo() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `91W${timestamp}${random}`;
    }
    async processExpiredOrders() {
        const expiredOrders = await this.prisma.paymentOrder.findMany({
            where: {
                status: client_1.PaymentStatus.PENDING,
                expiresAt: { lt: new Date() },
            },
        });
        if (expiredOrders.length > 0) {
            await this.prisma.paymentOrder.updateMany({
                where: {
                    id: { in: expiredOrders.map(o => o.id) },
                },
                data: { status: client_1.PaymentStatus.CANCELLED },
            });
        }
        return { expired: expiredOrders.length };
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof package_service_1.PackageService !== "undefined" && package_service_1.PackageService) === "function" ? _b : Object, typeof (_c = typeof subscription_service_1.SubscriptionService !== "undefined" && subscription_service_1.SubscriptionService) === "function" ? _c : Object, typeof (_d = typeof alipay_service_1.AlipayService !== "undefined" && alipay_service_1.AlipayService) === "function" ? _d : Object, typeof (_e = typeof wechat_service_1.WechatService !== "undefined" && wechat_service_1.WechatService) === "function" ? _e : Object])
], PaymentService);


/***/ }),
/* 43 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AlipayService_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AlipayService = void 0;
const common_1 = __webpack_require__(2);
let AlipayService = AlipayService_1 = class AlipayService {
    constructor() {
        this.logger = new common_1.Logger(AlipayService_1.name);
        this.config = {
            appId: process.env.ALIPAY_APP_ID || '',
            privateKey: process.env.ALIPAY_PRIVATE_KEY || '',
            publicKey: process.env.ALIPAY_PUBLIC_KEY || '',
            gateway: process.env.ALIPAY_GATEWAY || 'https://openapi.alipay.com/gateway.do',
        };
    }
    async createPayment(params) {
        const { orderNo, amount, subject } = params;
        const bizContent = {
            out_trade_no: orderNo,
            product_code: 'FAST_INSTANT_TRADE_PAY',
            total_amount: amount.toFixed(2),
            subject,
            body: subject,
        };
        const paymentParams = {
            method: 'alipay.trade.page.pay',
            app_id: this.config.appId,
            charset: 'UTF-8',
            sign_type: 'RSA2',
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
            version: '1.0',
            notify_url: `${process.env.API_BASE_URL}/api/payments/alipay/notify`,
            return_url: `${process.env.FRONTEND_URL}/payment/success`,
            biz_content: JSON.stringify(bizContent),
        };
        const signedParams = this.signParams(paymentParams);
        return {
            method: 'GET',
            url: `${this.config.gateway}?${signedParams}`,
            params: paymentParams,
        };
    }
    async verifyNotify(notifyData) {
        this.logger.log('Alipay notify received:', notifyData);
        try {
            const { sign, sign_type, ...params } = notifyData;
            if (sign_type !== 'RSA2') {
                return false;
            }
            const signString = this.buildSignString(params);
            const isValid = this.verifyRSA2(signString, sign, this.config.publicKey);
            return isValid;
        }
        catch (error) {
            this.logger.error('Verify alipay notify error:', error);
            return false;
        }
    }
    signParams(params) {
        const sortedKeys = Object.keys(params).sort();
        const signString = sortedKeys
            .map(key => `${key}=${params[key]}`)
            .join('&');
        const sign = this.signRSA2(signString, this.config.privateKey);
        return sortedKeys
            .map(key => `${key}=${encodeURIComponent(params[key])}`)
            .concat([`sign=${encodeURIComponent(sign)}`])
            .join('&');
    }
    buildSignString(params) {
        const sortedKeys = Object.keys(params).sort();
        return sortedKeys
            .filter(key => params[key] !== '' && key !== 'sign' && key !== 'sign_type')
            .map(key => `${key}=${params[key]}`)
            .join('&');
    }
    signRSA2(data, privateKey) {
        return 'mock_signature';
    }
    verifyRSA2(data, signature, publicKey) {
        return true;
    }
};
exports.AlipayService = AlipayService;
exports.AlipayService = AlipayService = AlipayService_1 = __decorate([
    (0, common_1.Injectable)()
], AlipayService);


/***/ }),
/* 44 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var WechatService_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WechatService = void 0;
const common_1 = __webpack_require__(2);
let WechatService = WechatService_1 = class WechatService {
    constructor() {
        this.logger = new common_1.Logger(WechatService_1.name);
        this.config = {
            appId: process.env.WECHAT_APP_ID || '',
            mchId: process.env.WECHAT_MCH_ID || '',
            key: process.env.WECHAT_KEY || '',
            certPath: process.env.WECHAT_CERT_PATH || '',
            keyPath: process.env.WECHAT_KEY_PATH || '',
            gateway: 'https://api.mch.weixin.qq.com',
        };
    }
    async createPayment(params) {
        const { orderNo, amount, description } = params;
        const paymentParams = {
            appid: this.config.appId,
            mch_id: this.config.mchId,
            nonce_str: this.generateNonceStr(),
            body: description,
            out_trade_no: orderNo,
            total_fee: Math.round(amount * 100),
            spbill_create_ip: '127.0.0.1',
            notify_url: `${process.env.API_BASE_URL}/api/payments/wechat/notify`,
            trade_type: 'NATIVE',
        };
        const sign = this.signMD5(paymentParams);
        const signedParams = { ...paymentParams, sign };
        return {
            method: 'POST',
            url: `${this.config.gateway}/pay/unifiedorder`,
            data: this.buildXML(signedParams),
        };
    }
    async verifyNotify(notifyData) {
        this.logger.log('Wechat notify received:', notifyData);
        try {
            const { sign, ...params } = notifyData;
            const calculatedSign = this.signMD5(params);
            return sign === calculatedSign;
        }
        catch (error) {
            this.logger.error('Verify wechat notify error:', error);
            return false;
        }
    }
    generateNonceStr() {
        return Math.random().toString(36).substr(2, 15);
    }
    signMD5(params) {
        const sortedKeys = Object.keys(params).sort();
        const signString = sortedKeys
            .filter(key => params[key] !== '' && key !== 'sign')
            .map(key => `${key}=${params[key]}`)
            .join('&');
        const stringWithKey = `${signString}&key=${this.config.key}`;
        return 'mock_signature'.toUpperCase();
    }
    buildXML(params) {
        const elements = Object.keys(params).map(key => {
            const value = typeof params[key] === 'number' ? params[key] : `<![CDATA[${params[key]}]]>`;
            return `<${key}>${value}</${key}>`;
        });
        return `<xml>${elements.join('')}</xml>`;
    }
};
exports.WechatService = WechatService;
exports.WechatService = WechatService = WechatService_1 = __decorate([
    (0, common_1.Injectable)()
], WechatService);


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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreatePaymentOrderDto = void 0;
const class_validator_1 = __webpack_require__(19);
const swagger_1 = __webpack_require__(3);
const client_1 = __webpack_require__(11);
const class_transformer_1 = __webpack_require__(20);
class CreatePaymentOrderDto {
}
exports.CreatePaymentOrderDto = CreatePaymentOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '套餐ID', example: 1 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreatePaymentOrderDto.prototype, "packageId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '支付方式', enum: client_1.PaymentMethod, example: client_1.PaymentMethod.ALIPAY }),
    (0, class_validator_1.IsEnum)(client_1.PaymentMethod),
    __metadata("design:type", typeof (_a = typeof client_1.PaymentMethod !== "undefined" && client_1.PaymentMethod) === "function" ? _a : Object)
], CreatePaymentOrderDto.prototype, "paymentMethod", void 0);


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
exports.QueryPaymentOrderDto = void 0;
const class_validator_1 = __webpack_require__(19);
const swagger_1 = __webpack_require__(3);
const client_1 = __webpack_require__(11);
const class_transformer_1 = __webpack_require__(20);
class QueryPaymentOrderDto {
}
exports.QueryPaymentOrderDto = QueryPaymentOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '支付状态', enum: client_1.PaymentStatus, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.PaymentStatus),
    __metadata("design:type", typeof (_a = typeof client_1.PaymentStatus !== "undefined" && client_1.PaymentStatus) === "function" ? _a : Object)
], QueryPaymentOrderDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '页码', example: 1, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryPaymentOrderDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '每页数量', example: 10, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryPaymentOrderDto.prototype, "limit", void 0);


/***/ }),
/* 47 */
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
exports.JwtStrategy = void 0;
const common_1 = __webpack_require__(2);
const passport_1 = __webpack_require__(6);
const passport_jwt_1 = __webpack_require__(48);
const config_1 = __webpack_require__(5);
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(configService) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET') || 'your-secret-key',
        });
        this.configService = configService;
    }
    async validate(payload) {
        return {
            userId: payload.sub,
            email: payload.email,
            role: payload.role,
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], JwtStrategy);


/***/ }),
/* 48 */
/***/ ((module) => {

module.exports = require("passport-jwt");

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
const common_1 = __webpack_require__(2);
const operators_1 = __webpack_require__(50);
let ResponseInterceptor = class ResponseInterceptor {
    intercept(context, next) {
        return next.handle().pipe((0, operators_1.map)((data) => ({
            success: true,
            data,
            message: 'Success',
            timestamp: new Date().toISOString(),
        })));
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

/***/ }),
/* 51 */
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
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            message = typeof exceptionResponse === 'string'
                ? exceptionResponse
                : exceptionResponse.message || message;
        }
        const errorResponse = {
            success: false,
            error: {
                statusCode: status,
                message,
                timestamp: new Date().toISOString(),
                path: request.url,
            },
        };
        this.logger.error(`HTTP ${status} Error: ${message}`, exception instanceof Error ? exception.stack : 'Unknown error');
        response.status(status).json(errorResponse);
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);


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
const app_module_1 = __webpack_require__(4);
const response_interceptor_1 = __webpack_require__(49);
const all_exceptions_filter_1 = __webpack_require__(51);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
    }));
    app.useGlobalInterceptors(new response_interceptor_1.ResponseInterceptor());
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('91Writing Payment Service API')
        .setDescription('91写作平台支付服务API文档')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    });
    const port = process.env.PAYMENT_SERVICE_PORT || 3005;
    await app.listen(port);
    console.log(`Payment Service running on port ${port}`);
}
bootstrap();

})();

/******/ })()
;