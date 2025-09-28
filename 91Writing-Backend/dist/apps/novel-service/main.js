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
const database_1 = __webpack_require__(5);
const novel_module_1 = __webpack_require__(10);
const chapter_module_1 = __webpack_require__(21);
const memory_module_1 = __webpack_require__(25);
const health_module_1 = __webpack_require__(29);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            database_1.DatabaseModule,
            novel_module_1.NovelModule,
            chapter_module_1.ChapterModule,
            memory_module_1.MemoryModule,
            health_module_1.HealthModule,
        ],
    })
], AppModule);


/***/ }),
/* 5 */
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
__exportStar(__webpack_require__(6), exports);
__exportStar(__webpack_require__(8), exports);


/***/ }),
/* 6 */
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
const config_1 = __webpack_require__(7);
const prisma_service_1 = __webpack_require__(8);
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
/* 7 */
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),
/* 8 */
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
const config_1 = __webpack_require__(7);
const client_1 = __webpack_require__(9);
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
            const expiredCodes = await this.activationCode.deleteMany({
                where: {
                    expiresAt: {
                        lt: new Date(),
                    },
                    status: 'UNUSED',
                },
            });
            this.logger.log(`数据清理完成: 
        - 用户活动日志: ${deletedActivities.count}条
        - AI使用日志: ${deletedAILogs.count}条  
        - 过期激活码: ${expiredCodes.count}条`);
            return {
                deletedActivities: deletedActivities.count,
                deletedAILogs: deletedAILogs.count,
                expiredCodes: expiredCodes.count,
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
/* 9 */
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),
/* 10 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NovelModule = void 0;
const common_1 = __webpack_require__(3);
const novel_service_1 = __webpack_require__(11);
const novel_controller_1 = __webpack_require__(12);
let NovelModule = class NovelModule {
};
exports.NovelModule = NovelModule;
exports.NovelModule = NovelModule = __decorate([
    (0, common_1.Module)({
        controllers: [novel_controller_1.NovelController],
        providers: [novel_service_1.NovelService],
        exports: [novel_service_1.NovelService],
    })
], NovelModule);


/***/ }),
/* 11 */
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
exports.NovelService = void 0;
const common_1 = __webpack_require__(3);
const database_1 = __webpack_require__(5);
let NovelService = class NovelService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createNovelDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        const novel = await this.prisma.novel.create({
            data: {
                userId,
                ...createNovelDto,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        chapters: true,
                        memories: true,
                    },
                },
            },
        });
        return novel;
    }
    async findAll(userId, options) {
        const { status, genre, page = 1, limit = 20 } = options || {};
        const where = { userId };
        if (status)
            where.status = status;
        if (genre)
            where.genre = genre;
        const skip = (page - 1) * limit;
        const [novels, total] = await Promise.all([
            this.prisma.novel.findMany({
                where,
                skip,
                take: limit,
                orderBy: { updatedAt: 'desc' },
                include: {
                    _count: {
                        select: {
                            chapters: true,
                            memories: true,
                        },
                    },
                },
            }),
            this.prisma.novel.count({ where }),
        ]);
        return {
            novels,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id, userId) {
        const novel = await this.prisma.novel.findFirst({
            where: {
                id,
                userId,
            },
            include: {
                chapters: {
                    orderBy: { chapterNumber: 'asc' },
                    select: {
                        id: true,
                        title: true,
                        chapterNumber: true,
                        wordCount: true,
                        status: true,
                        updatedAt: true,
                    },
                },
                memories: {
                    orderBy: { importance: 'desc' },
                    take: 10,
                },
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
        });
        if (!novel) {
            throw new common_1.NotFoundException('小说不存在或无权访问');
        }
        return novel;
    }
    async update(id, userId, updateNovelDto) {
        const existingNovel = await this.prisma.novel.findFirst({
            where: { id, userId },
        });
        if (!existingNovel) {
            throw new common_1.NotFoundException('小说不存在或无权访问');
        }
        const novel = await this.prisma.novel.update({
            where: { id },
            data: updateNovelDto,
            include: {
                _count: {
                    select: {
                        chapters: true,
                        memories: true,
                    },
                },
            },
        });
        return novel;
    }
    async remove(id, userId) {
        const existingNovel = await this.prisma.novel.findFirst({
            where: { id, userId },
        });
        if (!existingNovel) {
            throw new common_1.NotFoundException('小说不存在或无权访问');
        }
        await this.prisma.novel.delete({
            where: { id },
        });
        return { message: '小说已删除' };
    }
    async updateStats(novelId, userId) {
        const novel = await this.prisma.novel.findFirst({
            where: { id: novelId, userId },
        });
        if (!novel) {
            throw new common_1.NotFoundException('小说不存在或无权访问');
        }
        const stats = await this.prisma.chapter.aggregate({
            where: { novelId },
            _count: { id: true },
            _sum: { wordCount: true },
        });
        const chapterCount = stats._count.id || 0;
        const wordCount = stats._sum.wordCount || 0;
        const updatedNovel = await this.prisma.novel.update({
            where: { id: novelId },
            data: {
                chapterCount,
                wordCount,
            },
        });
        return updatedNovel;
    }
    async getSettings(novelId, userId) {
        const novel = await this.prisma.novel.findFirst({
            where: { id: novelId, userId },
            select: { settings: true },
        });
        if (!novel) {
            throw new common_1.NotFoundException('小说不存在或无权访问');
        }
        return novel.settings || {};
    }
    async updateSettings(novelId, userId, settings) {
        const novel = await this.prisma.novel.findFirst({
            where: { id: novelId, userId },
        });
        if (!novel) {
            throw new common_1.NotFoundException('小说不存在或无权访问');
        }
        const currentSettings = novel.settings || {};
        const mergedSettings = { ...currentSettings, ...settings };
        const updatedNovel = await this.prisma.novel.update({
            where: { id: novelId },
            data: { settings: mergedSettings },
            select: { settings: true },
        });
        return updatedNovel.settings;
    }
};
exports.NovelService = NovelService;
exports.NovelService = NovelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], NovelService);


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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NovelController = void 0;
const common_1 = __webpack_require__(3);
const guards_1 = __webpack_require__(13);
const novel_service_1 = __webpack_require__(11);
const create_novel_dto_1 = __webpack_require__(17);
const update_novel_dto_1 = __webpack_require__(19);
const client_1 = __webpack_require__(9);
let NovelController = class NovelController {
    constructor(novelService) {
        this.novelService = novelService;
    }
    async create(req, createNovelDto) {
        return this.novelService.create(req.user.id, createNovelDto);
    }
    async findAll(req, status, genre, page, limit) {
        const options = {
            status,
            genre,
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
        };
        return this.novelService.findAll(req.user.id, options);
    }
    async findOne(id, req) {
        return this.novelService.findOne(id, req.user.id);
    }
    async update(id, req, updateNovelDto) {
        return this.novelService.update(id, req.user.id, updateNovelDto);
    }
    async remove(id, req) {
        return this.novelService.remove(id, req.user.id);
    }
    async updateStats(id, req) {
        return this.novelService.updateStats(id, req.user.id);
    }
    async getSettings(id, req) {
        return this.novelService.getSettings(id, req.user.id);
    }
    async updateSettings(id, req, settings) {
        return this.novelService.updateSettings(id, req.user.id, settings);
    }
};
exports.NovelController = NovelController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_b = typeof create_novel_dto_1.CreateNovelDto !== "undefined" && create_novel_dto_1.CreateNovelDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], NovelController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('genre')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_c = typeof client_1.NovelStatus !== "undefined" && client_1.NovelStatus) === "function" ? _c : Object, String, String, String]),
    __metadata("design:returntype", Promise)
], NovelController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NovelController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, typeof (_d = typeof update_novel_dto_1.UpdateNovelDto !== "undefined" && update_novel_dto_1.UpdateNovelDto) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], NovelController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NovelController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/stats/update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NovelController.prototype, "updateStats", null);
__decorate([
    (0, common_1.Get)(':id/settings'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NovelController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Patch)(':id/settings'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], NovelController.prototype, "updateSettings", null);
exports.NovelController = NovelController = __decorate([
    (0, common_1.Controller)('novels'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof novel_service_1.NovelService !== "undefined" && novel_service_1.NovelService) === "function" ? _a : Object])
], NovelController);


/***/ }),
/* 13 */
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
__exportStar(__webpack_require__(14), exports);
__exportStar(__webpack_require__(16), exports);


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
exports.JwtAuthGuard = void 0;
const common_1 = __webpack_require__(3);
const passport_1 = __webpack_require__(15);
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
/* 15 */
/***/ ((module) => {

module.exports = require("@nestjs/passport");

/***/ }),
/* 16 */
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
exports.CreateNovelDto = void 0;
const class_validator_1 = __webpack_require__(18);
const client_1 = __webpack_require__(9);
class CreateNovelDto {
    constructor() {
        this.status = client_1.NovelStatus.DRAFT;
    }
}
exports.CreateNovelDto = CreateNovelDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateNovelDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNovelDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateNovelDto.prototype, "genre", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.NovelStatus),
    __metadata("design:type", typeof (_a = typeof client_1.NovelStatus !== "undefined" && client_1.NovelStatus) === "function" ? _a : Object)
], CreateNovelDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateNovelDto.prototype, "coverUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateNovelDto.prototype, "settings", void 0);


/***/ }),
/* 18 */
/***/ ((module) => {

module.exports = require("class-validator");

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateNovelDto = void 0;
const mapped_types_1 = __webpack_require__(20);
const class_validator_1 = __webpack_require__(18);
const create_novel_dto_1 = __webpack_require__(17);
class UpdateNovelDto extends (0, mapped_types_1.PartialType)(create_novel_dto_1.CreateNovelDto) {
}
exports.UpdateNovelDto = UpdateNovelDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateNovelDto.prototype, "wordCount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateNovelDto.prototype, "chapterCount", void 0);


/***/ }),
/* 20 */
/***/ ((module) => {

module.exports = require("@nestjs/mapped-types");

/***/ }),
/* 21 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ChapterModule = void 0;
const common_1 = __webpack_require__(3);
const chapter_service_1 = __webpack_require__(22);
const chapter_controller_1 = __webpack_require__(23);
let ChapterModule = class ChapterModule {
};
exports.ChapterModule = ChapterModule;
exports.ChapterModule = ChapterModule = __decorate([
    (0, common_1.Module)({
        controllers: [chapter_controller_1.ChapterController],
        providers: [chapter_service_1.ChapterService],
        exports: [chapter_service_1.ChapterService],
    })
], ChapterModule);


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
exports.ChapterService = void 0;
const common_1 = __webpack_require__(3);
const database_1 = __webpack_require__(5);
let ChapterService = class ChapterService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(novelId, userId, createChapterDto) {
        const novel = await this.prisma.novel.findFirst({
            where: { id: novelId, userId },
        });
        if (!novel) {
            throw new common_1.NotFoundException('小说不存在或无权访问');
        }
        const existingChapter = await this.prisma.chapter.findUnique({
            where: {
                novelId_chapterNumber: {
                    novelId,
                    chapterNumber: createChapterDto.chapterNumber,
                },
            },
        });
        if (existingChapter) {
            throw new common_1.BadRequestException(`第${createChapterDto.chapterNumber}章已存在`);
        }
        const wordCount = this.calculateWordCount(createChapterDto.content);
        const chapter = await this.prisma.chapter.create({
            data: {
                novelId,
                ...createChapterDto,
                wordCount,
            },
            include: {
                novel: {
                    select: {
                        id: true,
                        title: true,
                        userId: true,
                    },
                },
            },
        });
        await this.updateNovelStats(novelId);
        return chapter;
    }
    async findAll(novelId, userId) {
        const novel = await this.prisma.novel.findFirst({
            where: { id: novelId, userId },
        });
        if (!novel) {
            throw new common_1.NotFoundException('小说不存在或无权访问');
        }
        const chapters = await this.prisma.chapter.findMany({
            where: { novelId },
            orderBy: { chapterNumber: 'asc' },
            select: {
                id: true,
                title: true,
                chapterNumber: true,
                wordCount: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return chapters;
    }
    async findOne(id, userId) {
        const chapter = await this.prisma.chapter.findFirst({
            where: {
                id,
                novel: { userId },
            },
            include: {
                novel: {
                    select: {
                        id: true,
                        title: true,
                        userId: true,
                    },
                },
            },
        });
        if (!chapter) {
            throw new common_1.NotFoundException('章节不存在或无权访问');
        }
        return chapter;
    }
    async update(id, userId, updateData) {
        const chapter = await this.prisma.chapter.findFirst({
            where: {
                id,
                novel: { userId },
            },
        });
        if (!chapter) {
            throw new common_1.NotFoundException('章节不存在或无权访问');
        }
        let wordCount = chapter.wordCount;
        if (updateData.content !== undefined) {
            wordCount = this.calculateWordCount(updateData.content);
        }
        if (updateData.chapterNumber !== undefined && updateData.chapterNumber !== chapter.chapterNumber) {
            const existingChapter = await this.prisma.chapter.findUnique({
                where: {
                    novelId_chapterNumber: {
                        novelId: chapter.novelId,
                        chapterNumber: updateData.chapterNumber,
                    },
                },
            });
            if (existingChapter) {
                throw new common_1.BadRequestException(`第${updateData.chapterNumber}章已存在`);
            }
        }
        const updatedChapter = await this.prisma.chapter.update({
            where: { id },
            data: {
                ...updateData,
                wordCount,
            },
            include: {
                novel: {
                    select: {
                        id: true,
                        title: true,
                        userId: true,
                    },
                },
            },
        });
        if (wordCount !== chapter.wordCount) {
            await this.updateNovelStats(chapter.novelId);
        }
        return updatedChapter;
    }
    async remove(id, userId) {
        const chapter = await this.prisma.chapter.findFirst({
            where: {
                id,
                novel: { userId },
            },
        });
        if (!chapter) {
            throw new common_1.NotFoundException('章节不存在或无权访问');
        }
        await this.prisma.chapter.delete({
            where: { id },
        });
        await this.updateNovelStats(chapter.novelId);
        return { message: '章节已删除' };
    }
    async getContent(id, userId) {
        const chapter = await this.prisma.chapter.findFirst({
            where: {
                id,
                novel: { userId },
            },
            select: {
                content: true,
            },
        });
        if (!chapter) {
            throw new common_1.NotFoundException('章节不存在或无权访问');
        }
        return { content: chapter.content };
    }
    async updateContent(id, userId, content) {
        const chapter = await this.prisma.chapter.findFirst({
            where: {
                id,
                novel: { userId },
            },
        });
        if (!chapter) {
            throw new common_1.NotFoundException('章节不存在或无权访问');
        }
        const wordCount = this.calculateWordCount(content);
        const updatedChapter = await this.prisma.chapter.update({
            where: { id },
            data: {
                content,
                wordCount,
            },
            select: {
                id: true,
                title: true,
                wordCount: true,
                updatedAt: true,
            },
        });
        if (wordCount !== chapter.wordCount) {
            await this.updateNovelStats(chapter.novelId);
        }
        return updatedChapter;
    }
    async updateStatus(novelId, userId, chapterIds, status) {
        const novel = await this.prisma.novel.findFirst({
            where: { id: novelId, userId },
        });
        if (!novel) {
            throw new common_1.NotFoundException('小说不存在或无权访问');
        }
        const result = await this.prisma.chapter.updateMany({
            where: {
                id: { in: chapterIds },
                novelId,
            },
            data: { status },
        });
        return {
            updated: result.count,
            message: `已更新${result.count}个章节的状态为${status}`,
        };
    }
    async reorder(novelId, userId, chapterOrders) {
        const novel = await this.prisma.novel.findFirst({
            where: { id: novelId, userId },
        });
        if (!novel) {
            throw new common_1.NotFoundException('小说不存在或无权访问');
        }
        await this.prisma.$transaction(chapterOrders.map(order => this.prisma.chapter.update({
            where: { id: order.id },
            data: { chapterNumber: order.chapterNumber },
        })));
        return { message: '章节顺序已更新' };
    }
    calculateWordCount(content) {
        if (!content)
            return 0;
        const cleanContent = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        const chineseMatches = cleanContent.match(/[\u4e00-\u9fa5]/g);
        const chineseCount = chineseMatches ? chineseMatches.length : 0;
        const englishMatches = cleanContent.match(/[a-zA-Z]+/g);
        const englishCount = englishMatches ? englishMatches.length : 0;
        return chineseCount + englishCount;
    }
    async updateNovelStats(novelId) {
        const stats = await this.prisma.chapter.aggregate({
            where: { novelId },
            _count: { id: true },
            _sum: { wordCount: true },
        });
        await this.prisma.novel.update({
            where: { id: novelId },
            data: {
                chapterCount: stats._count.id || 0,
                wordCount: stats._sum.wordCount || 0,
            },
        });
    }
};
exports.ChapterService = ChapterService;
exports.ChapterService = ChapterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], ChapterService);


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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ChapterController = void 0;
const common_1 = __webpack_require__(3);
const guards_1 = __webpack_require__(13);
const chapter_service_1 = __webpack_require__(22);
const create_chapter_dto_1 = __webpack_require__(24);
let ChapterController = class ChapterController {
    constructor(chapterService) {
        this.chapterService = chapterService;
    }
    async create(novelId, req, createChapterDto) {
        return this.chapterService.create(novelId, req.user.id, createChapterDto);
    }
    async findAll(novelId, req) {
        return this.chapterService.findAll(novelId, req.user.id);
    }
    async findOne(id, req) {
        return this.chapterService.findOne(id, req.user.id);
    }
    async getContent(id, req) {
        return this.chapterService.getContent(id, req.user.id);
    }
    async update(id, req, updateData) {
        return this.chapterService.update(id, req.user.id, updateData);
    }
    async updateContent(id, req, content) {
        return this.chapterService.updateContent(id, req.user.id, content);
    }
    async remove(id, req) {
        return this.chapterService.remove(id, req.user.id);
    }
    async updateStatus(novelId, req, body) {
        return this.chapterService.updateStatus(novelId, req.user.id, body.chapterIds, body.status);
    }
    async reorder(novelId, req, body) {
        return this.chapterService.reorder(novelId, req.user.id, body.chapterOrders);
    }
};
exports.ChapterController = ChapterController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('novelId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, typeof (_b = typeof create_chapter_dto_1.CreateChapterDto !== "undefined" && create_chapter_dto_1.CreateChapterDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], ChapterController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('novelId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChapterController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChapterController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/content'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChapterController.prototype, "getContent", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, typeof (_c = typeof Partial !== "undefined" && Partial) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], ChapterController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/content'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)('content')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], ChapterController.prototype, "updateContent", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChapterController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)('status'),
    __param(0, (0, common_1.Param)('novelId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ChapterController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)('reorder'),
    __param(0, (0, common_1.Param)('novelId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ChapterController.prototype, "reorder", null);
exports.ChapterController = ChapterController = __decorate([
    (0, common_1.Controller)('novels/:novelId/chapters'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof chapter_service_1.ChapterService !== "undefined" && chapter_service_1.ChapterService) === "function" ? _a : Object])
], ChapterController);


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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateChapterDto = void 0;
const class_validator_1 = __webpack_require__(18);
const client_1 = __webpack_require__(9);
class CreateChapterDto {
    constructor() {
        this.status = client_1.ChapterStatus.DRAFT;
    }
}
exports.CreateChapterDto = CreateChapterDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateChapterDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChapterDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateChapterDto.prototype, "chapterNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ChapterStatus),
    __metadata("design:type", typeof (_a = typeof client_1.ChapterStatus !== "undefined" && client_1.ChapterStatus) === "function" ? _a : Object)
], CreateChapterDto.prototype, "status", void 0);


/***/ }),
/* 25 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MemoryModule = void 0;
const common_1 = __webpack_require__(3);
const memory_service_1 = __webpack_require__(26);
const memory_controller_1 = __webpack_require__(27);
let MemoryModule = class MemoryModule {
};
exports.MemoryModule = MemoryModule;
exports.MemoryModule = MemoryModule = __decorate([
    (0, common_1.Module)({
        controllers: [memory_controller_1.MemoryController],
        providers: [memory_service_1.MemoryService],
        exports: [memory_service_1.MemoryService],
    })
], MemoryModule);


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
exports.MemoryService = void 0;
const common_1 = __webpack_require__(3);
const database_1 = __webpack_require__(5);
const client_1 = __webpack_require__(9);
let MemoryService = class MemoryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(novelId, userId, createMemoryDto) {
        const novel = await this.prisma.novel.findFirst({
            where: { id: novelId, userId },
        });
        if (!novel) {
            throw new common_1.NotFoundException('小说不存在或无权访问');
        }
        const memory = await this.prisma.novelMemory.create({
            data: {
                novelId,
                ...createMemoryDto,
            },
        });
        return memory;
    }
    async findAll(novelId, userId, options) {
        const novel = await this.prisma.novel.findFirst({
            where: { id: novelId, userId },
        });
        if (!novel) {
            throw new common_1.NotFoundException('小说不存在或无权访问');
        }
        const { memoryType, limit = 50, orderBy = 'importance' } = options || {};
        const where = { novelId };
        if (memoryType)
            where.memoryType = memoryType;
        let orderByClause;
        switch (orderBy) {
            case 'importance':
                orderByClause = { importance: 'desc' };
                break;
            case 'created':
                orderByClause = { createdAt: 'desc' };
                break;
            case 'updated':
                orderByClause = { updatedAt: 'desc' };
                break;
            default:
                orderByClause = { importance: 'desc' };
        }
        const memories = await this.prisma.novelMemory.findMany({
            where,
            orderBy: orderByClause,
            take: limit,
        });
        return memories;
    }
    async findOne(id, userId) {
        const memory = await this.prisma.novelMemory.findFirst({
            where: {
                id,
                novel: { userId },
            },
            include: {
                novel: {
                    select: {
                        id: true,
                        title: true,
                        userId: true,
                    },
                },
            },
        });
        if (!memory) {
            throw new common_1.NotFoundException('记忆不存在或无权访问');
        }
        return memory;
    }
    async update(id, userId, updateData) {
        const memory = await this.prisma.novelMemory.findFirst({
            where: {
                id,
                novel: { userId },
            },
        });
        if (!memory) {
            throw new common_1.NotFoundException('记忆不存在或无权访问');
        }
        const updatedMemory = await this.prisma.novelMemory.update({
            where: { id },
            data: updateData,
        });
        return updatedMemory;
    }
    async remove(id, userId) {
        const memory = await this.prisma.novelMemory.findFirst({
            where: {
                id,
                novel: { userId },
            },
        });
        if (!memory) {
            throw new common_1.NotFoundException('记忆不存在或无权访问');
        }
        await this.prisma.novelMemory.delete({
            where: { id },
        });
        return { message: '记忆已删除' };
    }
    async initializeNovelMemory(novelId, userId, basicInfo = {}) {
        const novel = await this.prisma.novel.findFirst({
            where: { id: novelId, userId },
        });
        if (!novel) {
            throw new common_1.NotFoundException('小说不存在或无权访问');
        }
        const existingMemories = await this.prisma.novelMemory.findMany({
            where: { novelId },
        });
        if (existingMemories.length > 0) {
            throw new common_1.BadRequestException('记忆系统已经初始化');
        }
        const coreMemory = {
            novelId,
            title: basicInfo.title || novel.title,
            genre: basicInfo.genre || novel.genre || '',
            theme: basicInfo.theme || '',
            intro: basicInfo.intro || novel.description || '',
            coreMemory: {
                characters: [],
                worldSetting: {
                    worldType: '',
                    coreRules: [],
                    powerSystem: '',
                    socialStructure: ''
                },
                mainPlot: {
                    premise: '',
                    mainConflict: '',
                    plotPoints: [],
                    currentArc: ''
                }
            },
            version: '1.0'
        };
        await this.prisma.novelMemory.create({
            data: {
                novelId,
                memoryType: client_1.MemoryType.CORE,
                content: coreMemory,
                importance: 1.0,
                chapterRange: 'all',
            },
        });
        const contextMemory = {
            recentChapters: [],
            currentChapterContext: {},
            relevantHistory: [],
            tokenBudget: {
                total: 3000,
                used: 0,
                remaining: 3000
            }
        };
        await this.prisma.novelMemory.create({
            data: {
                novelId,
                memoryType: client_1.MemoryType.CONTEXT,
                content: contextMemory,
                importance: 0.8,
            },
        });
        return { message: '记忆系统初始化完成' };
    }
    async getGenerationContext(novelId, userId, options = {}) {
        const novel = await this.prisma.novel.findFirst({
            where: { id: novelId, userId },
        });
        if (!novel) {
            throw new common_1.NotFoundException('小说不存在或无权访问');
        }
        const { maxTokens = 2000, includeTypes = [client_1.MemoryType.CORE, client_1.MemoryType.SUMMARY, client_1.MemoryType.CONTEXT] } = options;
        const memories = await this.prisma.novelMemory.findMany({
            where: {
                novelId,
                memoryType: { in: includeTypes },
            },
            orderBy: { importance: 'desc' },
            take: 20,
        });
        let formattedContext = '';
        let usedTokens = 0;
        for (const memory of memories) {
            const memoryText = this.formatMemoryForContext(memory);
            const estimatedTokens = this.estimateTokens(memoryText);
            if (usedTokens + estimatedTokens <= maxTokens) {
                formattedContext += memoryText + '\n\n';
                usedTokens += estimatedTokens;
            }
            else {
                break;
            }
        }
        return {
            formattedContext,
            usedTokens,
            memoryCount: memories.length,
            novelInfo: {
                id: novel.id,
                title: novel.title,
                genre: novel.genre,
                wordCount: novel.wordCount,
                chapterCount: novel.chapterCount,
            },
        };
    }
    async updateChapterSummary(novelId, userId, chapterNumber, summary, keyEvents = []) {
        const novel = await this.prisma.novel.findFirst({
            where: { id: novelId, userId },
        });
        if (!novel) {
            throw new common_1.NotFoundException('小说不存在或无权访问');
        }
        let summaryMemory = await this.prisma.novelMemory.findFirst({
            where: {
                novelId,
                memoryType: client_1.MemoryType.SUMMARY,
                chapterRange: chapterNumber.toString(),
            },
        });
        const summaryContent = {
            chapterNumber,
            summary,
            keyEvents,
            wordCount: this.estimateTokens(summary),
            updatedAt: new Date().toISOString(),
        };
        if (summaryMemory) {
            summaryMemory = await this.prisma.novelMemory.update({
                where: { id: summaryMemory.id },
                data: {
                    content: summaryContent,
                    tokenCost: this.estimateTokens(summary),
                    importance: this.calculateSummaryImportance(chapterNumber, keyEvents),
                },
            });
        }
        else {
            summaryMemory = await this.prisma.novelMemory.create({
                data: {
                    novelId,
                    memoryType: client_1.MemoryType.SUMMARY,
                    content: summaryContent,
                    chapterRange: chapterNumber.toString(),
                    tokenCost: this.estimateTokens(summary),
                    importance: this.calculateSummaryImportance(chapterNumber, keyEvents),
                },
            });
        }
        return summaryMemory;
    }
    async removeMany(novelId, userId, memoryIds) {
        const novel = await this.prisma.novel.findFirst({
            where: { id: novelId, userId },
        });
        if (!novel) {
            throw new common_1.NotFoundException('小说不存在或无权访问');
        }
        const result = await this.prisma.novelMemory.deleteMany({
            where: {
                id: { in: memoryIds },
                novelId,
            },
        });
        return {
            deleted: result.count,
            message: `已删除${result.count}个记忆项`,
        };
    }
    async cleanupMemories(novelId, userId, options = {}) {
        const novel = await this.prisma.novel.findFirst({
            where: { id: novelId, userId },
        });
        if (!novel) {
            throw new common_1.NotFoundException('小说不存在或无权访问');
        }
        const { minImportance = 0.1, maxAge = 30, preserveCore = true } = options;
        const where = { novelId };
        const conditions = [];
        if (minImportance > 0) {
            conditions.push({ importance: { lt: minImportance } });
        }
        if (maxAge > 0) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - maxAge);
            conditions.push({ createdAt: { lt: cutoffDate } });
        }
        if (preserveCore) {
            where.memoryType = { not: client_1.MemoryType.CORE };
        }
        if (conditions.length > 0) {
            where.OR = conditions;
        }
        const result = await this.prisma.novelMemory.deleteMany({ where });
        return {
            cleaned: result.count,
            message: `已清理${result.count}个记忆项`,
        };
    }
    formatMemoryForContext(memory) {
        let formatted = `[${memory.memoryType}记忆]`;
        if (memory.chapterRange) {
            formatted += ` (章节${memory.chapterRange})`;
        }
        formatted += '\n';
        try {
            const content = memory.content;
            switch (memory.memoryType) {
                case client_1.MemoryType.CORE:
                    if (content.coreMemory) {
                        if (content.coreMemory.characters && content.coreMemory.characters.length > 0) {
                            formatted += '主要角色：\n';
                            content.coreMemory.characters.forEach((char) => {
                                formatted += `- ${char.name}：${char.keyTraits?.join('、') || ''}\n`;
                            });
                        }
                        if (content.coreMemory.mainPlot) {
                            formatted += `主线情节：${content.coreMemory.mainPlot.premise || ''}\n`;
                        }
                        if (content.coreMemory.worldSetting?.coreRules?.length > 0) {
                            formatted += `世界规则：${content.coreMemory.worldSetting.coreRules.join('；')}\n`;
                        }
                    }
                    break;
                case client_1.MemoryType.SUMMARY:
                    if (content.summary) {
                        formatted += `摘要：${content.summary}\n`;
                    }
                    if (content.keyEvents && content.keyEvents.length > 0) {
                        formatted += `关键事件：${content.keyEvents.join('；')}\n`;
                    }
                    break;
                case client_1.MemoryType.CONTEXT:
                    if (content.recentChapters && content.recentChapters.length > 0) {
                        formatted += '近期章节：\n';
                        content.recentChapters.forEach((chapter) => {
                            formatted += `- 第${chapter.chapterNumber}章：${chapter.summary || ''}\n`;
                        });
                    }
                    break;
                default:
                    formatted += JSON.stringify(content, null, 2);
            }
        }
        catch (error) {
            formatted += '记忆格式错误';
        }
        return formatted;
    }
    estimateTokens(text) {
        if (!text || typeof text !== 'string')
            return 0;
        const cleanText = text.replace(/<[^>]*>/g, '');
        const chineseChars = (cleanText.match(/[\u4e00-\u9fff]/g) || []).length;
        const otherChars = cleanText.length - chineseChars;
        return Math.ceil(chineseChars * 0.75 + otherChars / 4);
    }
    calculateSummaryImportance(chapterNumber, keyEvents) {
        let importance = 0.5;
        if (chapterNumber <= 3)
            importance += 0.2;
        else if (chapterNumber <= 10)
            importance += 0.1;
        importance += Math.min(0.3, keyEvents.length * 0.05);
        return Math.min(1.0, importance);
    }
};
exports.MemoryService = MemoryService;
exports.MemoryService = MemoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], MemoryService);


/***/ }),
/* 27 */
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
exports.MemoryController = void 0;
const common_1 = __webpack_require__(3);
const guards_1 = __webpack_require__(13);
const memory_service_1 = __webpack_require__(26);
const create_memory_dto_1 = __webpack_require__(28);
const client_1 = __webpack_require__(9);
let MemoryController = class MemoryController {
    constructor(memoryService) {
        this.memoryService = memoryService;
    }
    async create(novelId, req, createMemoryDto) {
        return this.memoryService.create(novelId, req.user.id, createMemoryDto);
    }
    async findAll(novelId, req, memoryType, limit, orderBy) {
        const options = {
            memoryType,
            limit: limit ? parseInt(limit, 10) : undefined,
            orderBy,
        };
        return this.memoryService.findAll(novelId, req.user.id, options);
    }
    async findOne(id, req) {
        return this.memoryService.findOne(id, req.user.id);
    }
    async update(id, req, updateData) {
        return this.memoryService.update(id, req.user.id, updateData);
    }
    async remove(id, req) {
        return this.memoryService.remove(id, req.user.id);
    }
    async initializeMemory(novelId, req, basicInfo) {
        return this.memoryService.initializeNovelMemory(novelId, req.user.id, basicInfo);
    }
    async getGenerationContext(novelId, req, maxTokens, chapterContext, includeTypes) {
        const options = {};
        if (maxTokens)
            options.maxTokens = parseInt(maxTokens, 10);
        if (chapterContext)
            options.chapterContext = chapterContext;
        if (includeTypes) {
            options.includeTypes = includeTypes.split(',');
        }
        return this.memoryService.getGenerationContext(novelId, req.user.id, options);
    }
    async updateChapterSummary(novelId, chapterNumber, req, body) {
        return this.memoryService.updateChapterSummary(novelId, req.user.id, parseInt(chapterNumber, 10), body.summary, body.keyEvents);
    }
    async removeMany(novelId, req, body) {
        return this.memoryService.removeMany(novelId, req.user.id, body.memoryIds);
    }
    async cleanup(novelId, req, options) {
        return this.memoryService.cleanupMemories(novelId, req.user.id, options);
    }
};
exports.MemoryController = MemoryController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('novelId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, typeof (_b = typeof create_memory_dto_1.CreateMemoryDto !== "undefined" && create_memory_dto_1.CreateMemoryDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('novelId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('orderBy')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, typeof (_c = typeof client_1.MemoryType !== "undefined" && client_1.MemoryType) === "function" ? _c : Object, String, String]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, typeof (_d = typeof Partial !== "undefined" && Partial) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('initialize'),
    __param(0, (0, common_1.Param)('novelId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "initializeMemory", null);
__decorate([
    (0, common_1.Get)('context/generation'),
    __param(0, (0, common_1.Param)('novelId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Query)('maxTokens')),
    __param(3, (0, common_1.Query)('chapterContext')),
    __param(4, (0, common_1.Query)('includeTypes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String, String]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "getGenerationContext", null);
__decorate([
    (0, common_1.Post)('chapters/:chapterNumber/summary'),
    __param(0, (0, common_1.Param)('novelId')),
    __param(1, (0, common_1.Param)('chapterNumber')),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "updateChapterSummary", null);
__decorate([
    (0, common_1.Delete)('batch'),
    __param(0, (0, common_1.Param)('novelId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "removeMany", null);
__decorate([
    (0, common_1.Post)('cleanup'),
    __param(0, (0, common_1.Param)('novelId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "cleanup", null);
exports.MemoryController = MemoryController = __decorate([
    (0, common_1.Controller)('novels/:novelId/memories'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof memory_service_1.MemoryService !== "undefined" && memory_service_1.MemoryService) === "function" ? _a : Object])
], MemoryController);


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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateMemoryDto = void 0;
const class_validator_1 = __webpack_require__(18);
const client_1 = __webpack_require__(9);
class CreateMemoryDto {
    constructor() {
        this.importance = 0.5;
        this.tokenCost = 0;
    }
}
exports.CreateMemoryDto = CreateMemoryDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(client_1.MemoryType),
    __metadata("design:type", typeof (_a = typeof client_1.MemoryType !== "undefined" && client_1.MemoryType) === "function" ? _a : Object)
], CreateMemoryDto.prototype, "memoryType", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateMemoryDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], CreateMemoryDto.prototype, "importance", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateMemoryDto.prototype, "tokenCost", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMemoryDto.prototype, "chapterRange", void 0);


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
exports.HealthModule = void 0;
const common_1 = __webpack_require__(3);
const health_controller_1 = __webpack_require__(30);
const health_service_1 = __webpack_require__(31);
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
/* 30 */
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
const common_1 = __webpack_require__(3);
const health_service_1 = __webpack_require__(31);
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
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "check", null);
exports.HealthController = HealthController = __decorate([
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [typeof (_a = typeof health_service_1.HealthService !== "undefined" && health_service_1.HealthService) === "function" ? _a : Object])
], HealthController);


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
exports.HealthService = void 0;
const common_1 = __webpack_require__(3);
let HealthService = class HealthService {
    check() {
        return {
            status: 'ok',
            service: 'novel-service',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
        };
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = __decorate([
    (0, common_1.Injectable)()
], HealthService);


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
exports.AllExceptionsFilter = void 0;
const common_1 = __webpack_require__(3);
let AllExceptionsFilter = class AllExceptionsFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let error = 'Internal Server Error';
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                message = exceptionResponse.message || exception.message;
                error = exceptionResponse.error || exception.name;
            }
            else {
                message = exceptionResponse;
                error = exception.name;
            }
        }
        else if (exception instanceof Error) {
            message = exception.message;
            error = exception.name;
        }
        console.error('Exception caught:', {
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            status,
            error,
            message,
            stack: exception instanceof Error ? exception.stack : undefined,
        });
        response.status(status).json({
            success: false,
            statusCode: status,
            error,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);


/***/ }),
/* 33 */
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
const operators_1 = __webpack_require__(34);
let ResponseInterceptor = class ResponseInterceptor {
    intercept(context, next) {
        return next.handle().pipe((0, operators_1.map)((data) => {
            if (data && typeof data === 'object' && 'success' in data) {
                return data;
            }
            return {
                success: true,
                data,
                message: 'Success',
                timestamp: new Date().toISOString(),
            };
        }));
    }
};
exports.ResponseInterceptor = ResponseInterceptor;
exports.ResponseInterceptor = ResponseInterceptor = __decorate([
    (0, common_1.Injectable)()
], ResponseInterceptor);


/***/ }),
/* 34 */
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
const app_module_1 = __webpack_require__(4);
const all_exceptions_filter_1 = __webpack_require__(32);
const response_interceptor_1 = __webpack_require__(33);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    app.useGlobalInterceptors(new response_interceptor_1.ResponseInterceptor());
    app.enableCors({
        origin: process.env.NODE_ENV === 'production'
            ? ['https://91writing.com', 'https://www.91writing.com']
            : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:7520'],
        credentials: true,
    });
    const port = process.env.PORT || 3003;
    await app.listen(port);
    console.log(`Novel Service is running on: http://localhost:${port}`);
}
bootstrap();

})();

/******/ })()
;