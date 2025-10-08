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
const config_1 = __webpack_require__(6);
const jwt_1 = __webpack_require__(7);
const passport_1 = __webpack_require__(8);
const database_1 = __webpack_require__(9);
const novel_module_1 = __webpack_require__(13);
const chapter_module_1 = __webpack_require__(23);
const memory_module_1 = __webpack_require__(27);
const material_module_1 = __webpack_require__(31);
const prompt_module_1 = __webpack_require__(36);
const collaboration_module_1 = __webpack_require__(40);
const version_module_1 = __webpack_require__(52);
const comment_module_1 = __webpack_require__(56);
const health_module_1 = __webpack_require__(60);
const jwt_strategy_1 = __webpack_require__(63);
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
            novel_module_1.NovelModule,
            chapter_module_1.ChapterModule,
            memory_module_1.MemoryModule,
            material_module_1.MaterialModule,
            prompt_module_1.PromptModule,
            collaboration_module_1.CollaborationModule,
            version_module_1.VersionModule,
            comment_module_1.CommentModule,
            health_module_1.HealthModule,
        ],
        providers: [
            jwt_strategy_1.JwtStrategy,
        ],
    })
], AppModule);


/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),
/* 7 */
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("@nestjs/passport");

/***/ }),
/* 9 */
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
__exportStar(__webpack_require__(10), exports);
__exportStar(__webpack_require__(11), exports);


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
exports.DatabaseModule = void 0;
const common_1 = __webpack_require__(3);
const config_1 = __webpack_require__(6);
const prisma_service_1 = __webpack_require__(11);
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
var PrismaService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PrismaService = void 0;
const common_1 = __webpack_require__(3);
const config_1 = __webpack_require__(6);
const client_1 = __webpack_require__(12);
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
/* 12 */
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),
/* 13 */
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
const novel_service_1 = __webpack_require__(14);
const novel_controller_1 = __webpack_require__(15);
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
/* 14 */
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
const database_1 = __webpack_require__(9);
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
/* 15 */
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
const swagger_1 = __webpack_require__(4);
const guards_1 = __webpack_require__(16);
const novel_service_1 = __webpack_require__(14);
const create_novel_dto_1 = __webpack_require__(19);
const update_novel_dto_1 = __webpack_require__(21);
const client_1 = __webpack_require__(12);
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
    (0, swagger_1.ApiOperation)({
        summary: '创建小说',
        description: '创建一个新的小说项目，支持设置标题、描述、类型、状态和复杂的世界观设置'
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: '小说创建成功',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'cm1234567890' },
                        title: { type: 'string', example: '魔法学院编年史' },
                        description: { type: 'string' },
                        genre: { type: 'string', example: '奇幻' },
                        status: { type: 'string', enum: ['DRAFT', 'WRITING', 'COMPLETED', 'PUBLISHED'] },
                        wordCount: { type: 'number', example: 0 },
                        chapterCount: { type: 'number', example: 0 },
                        user: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                username: { type: 'string' },
                                email: { type: 'string' }
                            }
                        },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '请求参数错误',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: false },
                error: {
                    type: 'object',
                    properties: {
                        code: { type: 'string', example: 'VALIDATION_ERROR' },
                        message: { type: 'string', example: '参数验证失败' }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: '未授权访问'
    }),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_b = typeof create_novel_dto_1.CreateNovelDto !== "undefined" && create_novel_dto_1.CreateNovelDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], NovelController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: '获取小说列表',
        description: '获取当前用户的所有小说，支持按状态、类型筛选和分页'
    }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: client_1.NovelStatus, description: '按状态筛选' }),
    (0, swagger_1.ApiQuery)({ name: 'genre', required: false, type: String, description: '按类型筛选' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: '页码，默认1' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: '每页数量，默认20' }),
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
                        novels: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    title: { type: 'string' },
                                    description: { type: 'string' },
                                    genre: { type: 'string' },
                                    status: { type: 'string' },
                                    wordCount: { type: 'number' },
                                    chapterCount: { type: 'number' },
                                    updatedAt: { type: 'string', format: 'date-time' }
                                }
                            }
                        },
                        pagination: {
                            type: 'object',
                            properties: {
                                page: { type: 'number' },
                                limit: { type: 'number' },
                                total: { type: 'number' },
                                totalPages: { type: 'number' }
                            }
                        }
                    }
                }
            }
        }
    }),
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
    (0, swagger_1.ApiOperation)({
        summary: '获取小说详情',
        description: '获取指定小说的详细信息，包括章节列表和记忆数据'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '小说ID' }),
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
                        id: { type: 'string' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        settings: { type: 'object' },
                        chapters: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    title: { type: 'string' },
                                    chapterNumber: { type: 'number' },
                                    wordCount: { type: 'number' },
                                    status: { type: 'string' }
                                }
                            }
                        },
                        memories: {
                            type: 'array',
                            description: '前10个最重要的记忆'
                        }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '小说不存在或无权访问' }),
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
    (0, swagger_1.ApiTags)('novels'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('novels'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof novel_service_1.NovelService !== "undefined" && novel_service_1.NovelService) === "function" ? _a : Object])
], NovelController);


/***/ }),
/* 16 */
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
__exportStar(__webpack_require__(17), exports);
__exportStar(__webpack_require__(18), exports);


/***/ }),
/* 17 */
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
/* 18 */
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
exports.CreateNovelDto = void 0;
const class_validator_1 = __webpack_require__(20);
const swagger_1 = __webpack_require__(4);
const client_1 = __webpack_require__(12);
class CreateNovelDto {
    constructor() {
        this.status = client_1.NovelStatus.DRAFT;
    }
}
exports.CreateNovelDto = CreateNovelDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '小说标题',
        example: '魔法学院编年史',
        maxLength: 200,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateNovelDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '小说描述',
        example: '这是一个关于年轻魔法师在学院中成长、冒险，最终拯救世界的故事。主角艾莉亚从一个普通的村庄女孩，成长为强大的魔法师。',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNovelDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '小说类型/题材',
        example: '奇幻',
        maxLength: 50,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateNovelDto.prototype, "genre", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '小说状态',
        enum: client_1.NovelStatus,
        example: client_1.NovelStatus.DRAFT,
        default: client_1.NovelStatus.DRAFT,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.NovelStatus),
    __metadata("design:type", typeof (_a = typeof client_1.NovelStatus !== "undefined" && client_1.NovelStatus) === "function" ? _a : Object)
], CreateNovelDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '封面图片URL',
        example: 'https://example.com/covers/novel-cover.jpg',
        maxLength: 500,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateNovelDto.prototype, "coverUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '小说设置(角色、世界观等JSON数据)',
        type: 'object',
        example: {
            characters: [
                {
                    name: '艾莉亚',
                    age: 18,
                    personality: '勇敢、聪明、好奇心强',
                    background: '来自北方小村庄的普通少女',
                    abilities: ['火系魔法天赋', '剑术基础', '治愈魔法'],
                    relationships: [
                        { name: '萨姆', relation: '青梅竹马', description: '最信任的伙伴' }
                    ]
                }
            ],
            worldview: {
                setting: '中世纪奇幻世界',
                continent: '阿尔卑斯大陆',
                kingdoms: ['北方王国', '南方帝国', '东方联邦'],
                magic_system: {
                    types: ['元素魔法', '治愈魔法', '黑暗魔法', '时空魔法'],
                    learning: '需要通过魔法学院系统学习',
                    restrictions: '每人只能精通2-3种魔法类型'
                },
                important_locations: [
                    '魔法学院：大陆最权威的魔法教育机构',
                    '北方村庄：艾莉亚的故乡',
                    '王都：政治中心',
                    '古老遗迹：隐藏着古代魔法秘密'
                ]
            },
            plot_structure: {
                act1: '发现魔法天赋，进入学院',
                act2: '学习成长，结识伙伴，面对挑战',
                act3: '揭开身世秘密，对抗黑暗势力',
                climax: '最终决战，拯救世界'
            },
            themes: ['成长', '友谊', '责任', '选择与牺牲'],
            tone: '轻松幽默中带有深刻思考'
        }
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateNovelDto.prototype, "settings", void 0);


/***/ }),
/* 20 */
/***/ ((module) => {

module.exports = require("class-validator");

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateNovelDto = void 0;
const mapped_types_1 = __webpack_require__(22);
const class_validator_1 = __webpack_require__(20);
const create_novel_dto_1 = __webpack_require__(19);
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
/* 22 */
/***/ ((module) => {

module.exports = require("@nestjs/mapped-types");

/***/ }),
/* 23 */
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
const chapter_service_1 = __webpack_require__(24);
const chapter_controller_1 = __webpack_require__(25);
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
exports.ChapterService = void 0;
const common_1 = __webpack_require__(3);
const database_1 = __webpack_require__(9);
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ChapterController = void 0;
const common_1 = __webpack_require__(3);
const guards_1 = __webpack_require__(16);
const chapter_service_1 = __webpack_require__(24);
const create_chapter_dto_1 = __webpack_require__(26);
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
exports.CreateChapterDto = void 0;
const class_validator_1 = __webpack_require__(20);
const swagger_1 = __webpack_require__(4);
const client_1 = __webpack_require__(12);
class CreateChapterDto {
    constructor() {
        this.status = client_1.ChapterStatus.DRAFT;
    }
}
exports.CreateChapterDto = CreateChapterDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '章节标题',
        example: '第一章：魔法的觉醒',
        maxLength: 200,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateChapterDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '章节内容',
        example: `夜幕降临，艾莉亚站在宿舍窗前，望着远方闪烁的星辰。今天是她进入魔法学院的第一天，心中既兴奋又忐忑。

"艾莉亚，你还不睡吗？"室友莉娜从床上探出头来，"明天还有早课呢。"

"我有些睡不着。"艾莉亚轻声回答，"总觉得有什么大事要发生。"

就在这时，她的手突然发出微弱的蓝光。艾莉亚吓了一跳，连忙握紧双手。

"这是什么？"她心中暗想，"难道这就是传说中的魔法力量觉醒？"

第二天一早，艾莉亚怀着忐忑的心情来到了第一堂课——魔法基础理论。老师是一位慈祥的老魔法师，名叫梅林教授。

"同学们，魔法不仅仅是力量，更是责任。"梅林教授的话语深深印在了艾莉亚心中，"每一位魔法师都肩负着保护这个世界的使命。"

课后，艾莉亚独自留在教室里练习基础法术。突然，门外传来急促的脚步声...`,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChapterDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '章节序号',
        example: 1,
        minimum: 1,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateChapterDto.prototype, "chapterNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '章节状态',
        enum: client_1.ChapterStatus,
        example: client_1.ChapterStatus.DRAFT,
        default: client_1.ChapterStatus.DRAFT,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ChapterStatus),
    __metadata("design:type", typeof (_a = typeof client_1.ChapterStatus !== "undefined" && client_1.ChapterStatus) === "function" ? _a : Object)
], CreateChapterDto.prototype, "status", void 0);


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
exports.MemoryModule = void 0;
const common_1 = __webpack_require__(3);
const memory_service_1 = __webpack_require__(28);
const memory_controller_1 = __webpack_require__(29);
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
exports.MemoryService = void 0;
const common_1 = __webpack_require__(3);
const database_1 = __webpack_require__(9);
const client_1 = __webpack_require__(12);
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MemoryController = void 0;
const common_1 = __webpack_require__(3);
const guards_1 = __webpack_require__(16);
const memory_service_1 = __webpack_require__(28);
const create_memory_dto_1 = __webpack_require__(30);
const client_1 = __webpack_require__(12);
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
exports.CreateMemoryDto = void 0;
const class_validator_1 = __webpack_require__(20);
const swagger_1 = __webpack_require__(4);
const client_1 = __webpack_require__(12);
class CreateMemoryDto {
    constructor() {
        this.importance = 0.5;
        this.tokenCost = 0;
    }
}
exports.CreateMemoryDto = CreateMemoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '记忆类型',
        enum: client_1.MemoryType,
        example: client_1.MemoryType.CORE,
        enumName: 'MemoryType'
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(client_1.MemoryType),
    __metadata("design:type", typeof (_a = typeof client_1.MemoryType !== "undefined" && client_1.MemoryType) === "function" ? _a : Object)
], CreateMemoryDto.prototype, "memoryType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '记忆内容(JSON对象，根据类型存储不同结构的数据)',
        type: 'object',
        examples: {
            core_character: {
                summary: '核心角色记忆示例',
                value: {
                    type: 'character_profile',
                    character: '艾莉亚',
                    details: {
                        name: '艾莉亚·晨光',
                        age: 18,
                        appearance: '长发飘逸，眼神坚定，身材修长',
                        personality: '勇敢、好奇心强、有强烈的正义感',
                        background: '北方小村庄的普通少女，在18岁时觉醒了强大的魔法能力',
                        abilities: ['火系魔法', '治愈术', '敏锐的直觉'],
                        relationships: {
                            '萨姆': '青梅竹马，最信任的伙伴',
                            '梅林教授': '魔法导师，亦师亦父'
                        },
                        goals: ['掌握自己的魔法力量', '保护所爱的人', '寻找生命的真谛'],
                        fears: ['失控的力量伤害他人', '辜负大家的期望']
                    }
                }
            },
            summary_plot: {
                summary: '情节摘要记忆示例',
                value: {
                    type: 'plot_summary',
                    chapters: '1-3',
                    summary: '艾莉亚觉醒魔法能力后进入学院学习，结识了室友莉娜和导师梅林教授，在第一次魔法课上展现出惊人天赋，但也引起了同学的嫉妒',
                    key_events: [
                        '魔法觉醒',
                        '进入魔法学院',
                        '遇见室友莉娜',
                        '梅林教授的第一课',
                        '展现魔法天赋'
                    ],
                    character_development: '从紧张不安到逐渐适应学院生活',
                    conflicts: ['同学的嫉妒和排斥', '对自己力量的恐惧'],
                    resolutions: ['通过努力获得认可', '学会控制魔法力量']
                }
            },
            context_world: {
                summary: '世界观上下文记忆示例',
                value: {
                    type: 'world_context',
                    location: '魔法学院',
                    description: '大陆最权威的魔法教育机构，坐落在圣山之巅，建筑宏伟，充满魔法气息',
                    atmosphere: '庄严神圣，但又充满活力和希望',
                    important_npcs: [
                        {
                            name: '梅林教授',
                            role: '魔法基础理论教师',
                            personality: '慈祥睿智，对学生要求严格但关爱有加'
                        },
                        {
                            name: '院长',
                            role: '学院最高管理者',
                            mystery: '传说中的大魔法师，很少露面'
                        }
                    ],
                    rules_and_customs: [
                        '学院内禁止私斗',
                        '每周进行魔法测试',
                        '优秀学生可获得特殊指导'
                    ],
                    secrets: '学院地下隐藏着古代魔法遗迹'
                }
            }
        }
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateMemoryDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '记忆重要性权重(0.0-1.0，越高越重要)',
        example: 0.8,
        minimum: 0,
        maximum: 1,
        default: 0.5
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], CreateMemoryDto.prototype, "importance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'AI处理此记忆消耗的Token数量',
        example: 150,
        minimum: 0,
        default: 0
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateMemoryDto.prototype, "tokenCost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '相关章节范围',
        example: '1-5',
        examples: {
            single: { value: '3', summary: '单个章节' },
            range: { value: '1-5', summary: '章节范围' },
            multiple: { value: '1,3,5', summary: '多个章节' }
        }
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMemoryDto.prototype, "chapterRange", void 0);


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
exports.MaterialModule = void 0;
const common_1 = __webpack_require__(3);
const material_controller_1 = __webpack_require__(32);
const material_service_1 = __webpack_require__(33);
const database_1 = __webpack_require__(9);
let MaterialModule = class MaterialModule {
};
exports.MaterialModule = MaterialModule;
exports.MaterialModule = MaterialModule = __decorate([
    (0, common_1.Module)({
        imports: [database_1.DatabaseModule],
        controllers: [material_controller_1.MaterialController],
        providers: [material_service_1.MaterialService],
        exports: [material_service_1.MaterialService],
    })
], MaterialModule);


/***/ }),
/* 32 */
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
exports.MaterialController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(4);
const material_service_1 = __webpack_require__(33);
const material_dto_1 = __webpack_require__(34);
const guards_1 = __webpack_require__(16);
let MaterialController = class MaterialController {
    constructor(materialService) {
        this.materialService = materialService;
    }
    async create(req, dto) {
        return this.materialService.create(req.user.userId, dto);
    }
    async findAll(req, query) {
        return this.materialService.findAll(req.user.userId, query);
    }
    async getCategories(req) {
        return this.materialService.getCategories(req.user.userId);
    }
    async getTags(req) {
        return this.materialService.getTags(req.user.userId);
    }
    async getStats(req) {
        return this.materialService.getStats(req.user.userId);
    }
    async findOne(req, id) {
        return this.materialService.findOne(req.user.userId, id);
    }
    async update(req, id, dto) {
        return this.materialService.update(req.user.userId, id, dto);
    }
    async remove(req, id) {
        return this.materialService.remove(req.user.userId, id);
    }
};
exports.MaterialController = MaterialController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '创建素材' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_b = typeof material_dto_1.CreateMaterialDto !== "undefined" && material_dto_1.CreateMaterialDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], MaterialController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '获取素材列表' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_c = typeof material_dto_1.QueryMaterialDto !== "undefined" && material_dto_1.QueryMaterialDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], MaterialController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOperation)({ summary: '获取素材分类列表' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MaterialController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)('tags'),
    (0, swagger_1.ApiOperation)({ summary: '获取素材标签列表' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MaterialController.prototype, "getTags", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: '获取素材统计' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MaterialController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '获取素材详情' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MaterialController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '更新素材' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, typeof (_d = typeof material_dto_1.UpdateMaterialDto !== "undefined" && material_dto_1.UpdateMaterialDto) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], MaterialController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '删除素材' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MaterialController.prototype, "remove", null);
exports.MaterialController = MaterialController = __decorate([
    (0, swagger_1.ApiTags)('素材管理'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, common_1.Controller)('materials'),
    __metadata("design:paramtypes", [typeof (_a = typeof material_service_1.MaterialService !== "undefined" && material_service_1.MaterialService) === "function" ? _a : Object])
], MaterialController);


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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MaterialService = void 0;
const common_1 = __webpack_require__(3);
const database_1 = __webpack_require__(9);
let MaterialService = class MaterialService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        const material = await this.prisma.material.create({
            data: {
                userId,
                name: dto.name,
                type: dto.type,
                category: dto.category,
                fileUrl: dto.fileUrl,
                fileSize: dto.fileSize,
                description: dto.description,
                tags: dto.tags || [],
            },
        });
        return material;
    }
    async findAll(userId, query) {
        const { type, category, keyword, tags, page = 1, pageSize = 20 } = query;
        const where = {
            userId,
            ...(type && { type }),
            ...(category && { category }),
            ...(keyword && {
                OR: [
                    { name: { contains: keyword } },
                    { description: { contains: keyword } },
                ],
            }),
        };
        const [allItems, total] = await Promise.all([
            this.prisma.material.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize * 2,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.material.count({ where }),
        ]);
        let items = allItems;
        let filteredTotal = total;
        if (tags) {
            const tagArray = tags.split(',').map(t => t.trim());
            items = allItems.filter(item => {
                if (!item.tags || !Array.isArray(item.tags))
                    return false;
                return tagArray.some(tag => item.tags.includes(tag));
            });
            items = items.slice(0, pageSize);
            filteredTotal = items.length;
        }
        return {
            items,
            total: filteredTotal,
            page,
            pageSize,
            totalPages: Math.ceil(filteredTotal / pageSize),
        };
    }
    async findOne(userId, id) {
        const material = await this.prisma.material.findUnique({
            where: { id },
        });
        if (!material) {
            throw new common_1.NotFoundException('素材不存在');
        }
        if (material.userId !== userId) {
            throw new common_1.ForbiddenException('无权访问此素材');
        }
        await this.prisma.material.update({
            where: { id },
            data: { usageCount: { increment: 1 } },
        });
        return material;
    }
    async update(userId, id, dto) {
        const material = await this.prisma.material.findUnique({
            where: { id },
        });
        if (!material) {
            throw new common_1.NotFoundException('素材不存在');
        }
        if (material.userId !== userId) {
            throw new common_1.ForbiddenException('无权修改此素材');
        }
        const updated = await this.prisma.material.update({
            where: { id },
            data: {
                ...(dto.name && { name: dto.name }),
                ...(dto.category !== undefined && { category: dto.category }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.tags !== undefined && { tags: dto.tags }),
            },
        });
        return updated;
    }
    async remove(userId, id) {
        const material = await this.prisma.material.findUnique({
            where: { id },
        });
        if (!material) {
            throw new common_1.NotFoundException('素材不存在');
        }
        if (material.userId !== userId) {
            throw new common_1.ForbiddenException('无权删除此素材');
        }
        await this.prisma.material.delete({
            where: { id },
        });
        return { message: '删除成功' };
    }
    async getCategories(userId) {
        const materials = await this.prisma.material.findMany({
            where: { userId },
            select: { category: true },
            distinct: ['category'],
        });
        const categories = materials
            .map((m) => m.category)
            .filter((c) => c !== null && c !== '');
        return categories;
    }
    async getTags(userId) {
        const materials = await this.prisma.material.findMany({
            where: { userId },
            select: { tags: true },
        });
        const tagsSet = new Set();
        materials.forEach((m) => {
            if (Array.isArray(m.tags)) {
                m.tags.forEach((tag) => tagsSet.add(tag));
            }
        });
        return Array.from(tagsSet);
    }
    async getStats(userId) {
        const stats = await this.prisma.material.groupBy({
            by: ['type'],
            where: { userId },
            _count: { id: true },
            _sum: { fileSize: true },
        });
        const total = await this.prisma.material.count({ where: { userId } });
        return {
            total,
            byType: stats.map((s) => ({
                type: s.type,
                count: s._count.id,
                totalSize: s._sum.fileSize || 0,
            })),
        };
    }
};
exports.MaterialService = MaterialService;
exports.MaterialService = MaterialService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], MaterialService);


/***/ }),
/* 34 */
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
exports.QueryMaterialDto = exports.UpdateMaterialDto = exports.CreateMaterialDto = exports.MaterialType = void 0;
const class_validator_1 = __webpack_require__(20);
const class_transformer_1 = __webpack_require__(35);
const swagger_1 = __webpack_require__(4);
var MaterialType;
(function (MaterialType) {
    MaterialType["IMAGE"] = "IMAGE";
    MaterialType["DOCUMENT"] = "DOCUMENT";
    MaterialType["AUDIO"] = "AUDIO";
    MaterialType["VIDEO"] = "VIDEO";
    MaterialType["TEXT"] = "TEXT";
})(MaterialType || (exports.MaterialType = MaterialType = {}));
class CreateMaterialDto {
}
exports.CreateMaterialDto = CreateMaterialDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '素材名称', maxLength: 200 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateMaterialDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '素材类型', enum: MaterialType }),
    (0, class_validator_1.IsEnum)(MaterialType),
    __metadata("design:type", String)
], CreateMaterialDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '分类', required: false, maxLength: 50 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateMaterialDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '文件URL', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMaterialDto.prototype, "fileUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '文件大小(字节)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateMaterialDto.prototype, "fileSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '描述', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMaterialDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '标签', required: false, type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateMaterialDto.prototype, "tags", void 0);
class UpdateMaterialDto {
}
exports.UpdateMaterialDto = UpdateMaterialDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '素材名称', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], UpdateMaterialDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '分类', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], UpdateMaterialDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '描述', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMaterialDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '标签', required: false, type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateMaterialDto.prototype, "tags", void 0);
class QueryMaterialDto {
    constructor() {
        this.page = 1;
        this.pageSize = 20;
    }
}
exports.QueryMaterialDto = QueryMaterialDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '素材类型', required: false, enum: MaterialType }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(MaterialType),
    __metadata("design:type", String)
], QueryMaterialDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '分类', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryMaterialDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '搜索关键词', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryMaterialDto.prototype, "keyword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '标签(逗号分隔)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryMaterialDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '页码', required: false, default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], QueryMaterialDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '每页数量', required: false, default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], QueryMaterialDto.prototype, "pageSize", void 0);


/***/ }),
/* 35 */
/***/ ((module) => {

module.exports = require("class-transformer");

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
exports.PromptModule = void 0;
const common_1 = __webpack_require__(3);
const prompt_controller_1 = __webpack_require__(37);
const prompt_service_1 = __webpack_require__(38);
const database_1 = __webpack_require__(9);
let PromptModule = class PromptModule {
};
exports.PromptModule = PromptModule;
exports.PromptModule = PromptModule = __decorate([
    (0, common_1.Module)({
        imports: [database_1.DatabaseModule],
        controllers: [prompt_controller_1.PromptController],
        providers: [prompt_service_1.PromptService],
        exports: [prompt_service_1.PromptService],
    })
], PromptModule);


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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PromptController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(4);
const prompt_service_1 = __webpack_require__(38);
const prompt_dto_1 = __webpack_require__(39);
const guards_1 = __webpack_require__(16);
let PromptController = class PromptController {
    constructor(promptService) {
        this.promptService = promptService;
    }
    async create(req, dto) {
        return this.promptService.create(req.user.userId, dto);
    }
    async findAll(req, query) {
        const userId = req.user?.userId;
        return this.promptService.findAll(userId, query);
    }
    async getCategories(req) {
        const userId = req.user?.userId;
        return this.promptService.getCategories(userId);
    }
    async getTags(req) {
        const userId = req.user?.userId;
        return this.promptService.getTags(userId);
    }
    async getPopular(limit) {
        return this.promptService.getPopular(limit || 10);
    }
    async getRecommended(req, limit) {
        return this.promptService.getRecommended(req.user.userId, limit || 10);
    }
    async findOne(req, id) {
        const userId = req.user?.userId;
        return this.promptService.findOne(id, userId);
    }
    async update(req, id, dto) {
        return this.promptService.update(id, req.user.userId, dto);
    }
    async remove(req, id) {
        return this.promptService.remove(id, req.user.userId);
    }
    async rate(req, id, dto) {
        return this.promptService.rate(id, req.user.userId, dto.rating);
    }
};
exports.PromptController = PromptController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: '创建提示词' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_b = typeof prompt_dto_1.CreatePromptDto !== "undefined" && prompt_dto_1.CreatePromptDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], PromptController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '获取提示词列表' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_c = typeof prompt_dto_1.QueryPromptDto !== "undefined" && prompt_dto_1.QueryPromptDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], PromptController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOperation)({ summary: '获取提示词分类列表' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PromptController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)('tags'),
    (0, swagger_1.ApiOperation)({ summary: '获取提示词标签列表' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PromptController.prototype, "getTags", null);
__decorate([
    (0, common_1.Get)('popular'),
    (0, swagger_1.ApiOperation)({ summary: '获取热门提示词' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PromptController.prototype, "getPopular", null);
__decorate([
    (0, common_1.Get)('recommended'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: '获取推荐提示词' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], PromptController.prototype, "getRecommended", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '获取提示词详情' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PromptController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: '更新提示词' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, typeof (_d = typeof prompt_dto_1.UpdatePromptDto !== "undefined" && prompt_dto_1.UpdatePromptDto) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], PromptController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: '删除提示词' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PromptController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/rate'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: '评分提示词' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, typeof (_e = typeof prompt_dto_1.RatePromptDto !== "undefined" && prompt_dto_1.RatePromptDto) === "function" ? _e : Object]),
    __metadata("design:returntype", Promise)
], PromptController.prototype, "rate", null);
exports.PromptController = PromptController = __decorate([
    (0, swagger_1.ApiTags)('提示词管理'),
    (0, common_1.Controller)('prompts'),
    __metadata("design:paramtypes", [typeof (_a = typeof prompt_service_1.PromptService !== "undefined" && prompt_service_1.PromptService) === "function" ? _a : Object])
], PromptController);


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
exports.PromptService = void 0;
const common_1 = __webpack_require__(3);
const database_1 = __webpack_require__(9);
let PromptService = class PromptService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        const prompt = await this.prisma.prompt.create({
            data: {
                userId,
                title: dto.title,
                content: dto.content,
                category: dto.category,
                tags: dto.tags || [],
                isPublic: dto.isPublic || false,
            },
        });
        return prompt;
    }
    async findAll(userId, query) {
        const { category, keyword, publicOnly, page = 1, pageSize = 20 } = query;
        const where = {
            ...(publicOnly
                ? { isPublic: true }
                : userId
                    ? {
                        OR: [
                            { userId },
                            { isPublic: true }
                        ]
                    }
                    : { isPublic: true }),
            ...(category && { category }),
            ...(keyword && {
                OR: [
                    { title: { contains: keyword } },
                    { content: { contains: keyword } },
                ],
            }),
        };
        const [items, total] = await Promise.all([
            this.prisma.prompt.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: [
                    { rating: 'desc' },
                    { usageCount: 'desc' },
                    { createdAt: 'desc' }
                ],
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            nickname: true
                        }
                    }
                }
            }),
            this.prisma.prompt.count({ where }),
        ]);
        return {
            items,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }
    async findOne(id, userId) {
        const prompt = await this.prisma.prompt.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        nickname: true
                    }
                }
            }
        });
        if (!prompt) {
            throw new common_1.NotFoundException('提示词不存在');
        }
        if (!prompt.isPublic && prompt.userId !== userId) {
            throw new common_1.ForbiddenException('无权访问此提示词');
        }
        await this.prisma.prompt.update({
            where: { id },
            data: { usageCount: { increment: 1 } },
        });
        return prompt;
    }
    async update(id, userId, dto) {
        const prompt = await this.prisma.prompt.findUnique({
            where: { id },
        });
        if (!prompt) {
            throw new common_1.NotFoundException('提示词不存在');
        }
        if (prompt.userId !== userId) {
            throw new common_1.ForbiddenException('无权修改此提示词');
        }
        const updated = await this.prisma.prompt.update({
            where: { id },
            data: {
                ...(dto.title && { title: dto.title }),
                ...(dto.content && { content: dto.content }),
                ...(dto.category !== undefined && { category: dto.category }),
                ...(dto.tags !== undefined && { tags: dto.tags }),
                ...(dto.isPublic !== undefined && { isPublic: dto.isPublic }),
            },
        });
        return updated;
    }
    async remove(id, userId) {
        const prompt = await this.prisma.prompt.findUnique({
            where: { id },
        });
        if (!prompt) {
            throw new common_1.NotFoundException('提示词不存在');
        }
        if (prompt.userId !== userId) {
            throw new common_1.ForbiddenException('无权删除此提示词');
        }
        await this.prisma.prompt.delete({
            where: { id },
        });
        return { message: '删除成功' };
    }
    async rate(id, userId, rating) {
        const prompt = await this.prisma.prompt.findUnique({
            where: { id },
        });
        if (!prompt) {
            throw new common_1.NotFoundException('提示词不存在');
        }
        const newRating = (Number(prompt.rating) * prompt.usageCount + rating) / (prompt.usageCount + 1);
        const updated = await this.prisma.prompt.update({
            where: { id },
            data: {
                rating: newRating,
                usageCount: { increment: 1 }
            },
        });
        return updated;
    }
    async getCategories(userId) {
        const where = userId
            ? {
                OR: [
                    { userId },
                    { isPublic: true }
                ]
            }
            : { isPublic: true };
        const prompts = await this.prisma.prompt.findMany({
            where,
            select: { category: true },
            distinct: ['category'],
        });
        const categories = prompts
            .map((p) => p.category)
            .filter((c) => c !== null && c !== '');
        return categories;
    }
    async getTags(userId) {
        const where = userId
            ? {
                OR: [
                    { userId },
                    { isPublic: true }
                ]
            }
            : { isPublic: true };
        const prompts = await this.prisma.prompt.findMany({
            where,
            select: { tags: true },
        });
        const tagsSet = new Set();
        prompts.forEach((p) => {
            if (Array.isArray(p.tags)) {
                p.tags.forEach((tag) => tagsSet.add(tag));
            }
        });
        return Array.from(tagsSet);
    }
    async getPopular(limit = 10) {
        const prompts = await this.prisma.prompt.findMany({
            where: { isPublic: true },
            take: limit,
            orderBy: [
                { rating: 'desc' },
                { usageCount: 'desc' }
            ],
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        nickname: true
                    }
                }
            }
        });
        return prompts;
    }
    async getRecommended(userId, limit = 10) {
        const userPrompts = await this.prisma.prompt.findMany({
            where: { userId },
            select: { category: true },
            orderBy: { createdAt: 'desc' },
            take: 5
        });
        const userCategories = [...new Set(userPrompts.map(p => p.category).filter(Boolean))];
        if (userCategories.length === 0) {
            return this.getPopular(limit);
        }
        const recommended = await this.prisma.prompt.findMany({
            where: {
                isPublic: true,
                userId: { not: userId },
                category: { in: userCategories }
            },
            take: limit,
            orderBy: [
                { rating: 'desc' },
                { usageCount: 'desc' }
            ],
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        nickname: true
                    }
                }
            }
        });
        return recommended;
    }
};
exports.PromptService = PromptService;
exports.PromptService = PromptService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], PromptService);


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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RatePromptDto = exports.QueryPromptDto = exports.UpdatePromptDto = exports.CreatePromptDto = void 0;
const class_validator_1 = __webpack_require__(20);
const swagger_1 = __webpack_require__(4);
class CreatePromptDto {
}
exports.CreatePromptDto = CreatePromptDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '提示词标题', maxLength: 200 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreatePromptDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '提示词内容' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePromptDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '分类', required: false, maxLength: 50 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreatePromptDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '标签', required: false, type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreatePromptDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否公开', required: false, default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePromptDto.prototype, "isPublic", void 0);
class UpdatePromptDto {
}
exports.UpdatePromptDto = UpdatePromptDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '提示词标题', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], UpdatePromptDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '提示词内容', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePromptDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '分类', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], UpdatePromptDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '标签', required: false, type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdatePromptDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否公开', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePromptDto.prototype, "isPublic", void 0);
class QueryPromptDto {
    constructor() {
        this.page = 1;
        this.pageSize = 20;
    }
}
exports.QueryPromptDto = QueryPromptDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '分类', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPromptDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '搜索关键词', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPromptDto.prototype, "keyword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否仅查询公开提示词', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], QueryPromptDto.prototype, "publicOnly", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '页码', required: false, default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], QueryPromptDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '每页数量', required: false, default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], QueryPromptDto.prototype, "pageSize", void 0);
class RatePromptDto {
}
exports.RatePromptDto = RatePromptDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '评分 (0-5)', minimum: 0, maximum: 5 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], RatePromptDto.prototype, "rating", void 0);


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
exports.CollaborationModule = void 0;
const common_1 = __webpack_require__(3);
const collaboration_controller_1 = __webpack_require__(41);
const collaboration_service_1 = __webpack_require__(42);
const database_1 = __webpack_require__(9);
let CollaborationModule = class CollaborationModule {
};
exports.CollaborationModule = CollaborationModule;
exports.CollaborationModule = CollaborationModule = __decorate([
    (0, common_1.Module)({
        imports: [database_1.DatabaseModule],
        controllers: [collaboration_controller_1.CollaborationController],
        providers: [collaboration_service_1.CollaborationService],
        exports: [collaboration_service_1.CollaborationService],
    })
], CollaborationModule);


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
exports.CollaborationController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(4);
const collaboration_service_1 = __webpack_require__(42);
const collaboration_dto_1 = __webpack_require__(43);
const common_2 = __webpack_require__(44);
let CollaborationController = class CollaborationController {
    constructor(collaborationService) {
        this.collaborationService = collaborationService;
    }
    async createCollaboration(dto) {
        return this.collaborationService.createCollaboration(dto);
    }
    async getCollaborators(novelId) {
        return this.collaborationService.getCollaborators(novelId);
    }
    async updateCollaboration(id, dto) {
        return this.collaborationService.updateCollaboration(id, dto);
    }
    async acceptCollaboration(id, req) {
        return this.collaborationService.acceptCollaboration(id, req.user.userId);
    }
    async revokeCollaboration(id, req) {
        return this.collaborationService.revokeCollaboration(id, req.user.userId);
    }
    async checkPermission(novelId, userId, role) {
        const hasPermission = await this.collaborationService.checkCollaborationPermission(novelId, userId, role);
        return { hasPermission };
    }
    async lockChapter(dto) {
        return this.collaborationService.lockChapter(dto);
    }
    async unlockChapter(dto) {
        return this.collaborationService.unlockChapter(dto);
    }
    async getChapterLockStatus(chapterId) {
        return this.collaborationService.getChapterLockStatus(chapterId);
    }
    async recordEditEvent(dto) {
        return this.collaborationService.recordEditEvent(dto);
    }
    async getChapterEditHistory(chapterId, limit, after) {
        return this.collaborationService.getChapterEditHistory(chapterId, limit ? parseInt(limit.toString()) : 50, after ? new Date(after) : undefined);
    }
};
exports.CollaborationController = CollaborationController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '创建协作邀请' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof collaboration_dto_1.CreateCollaborationDto !== "undefined" && collaboration_dto_1.CreateCollaborationDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], CollaborationController.prototype, "createCollaboration", null);
__decorate([
    (0, common_1.Get)('novel/:novelId'),
    (0, swagger_1.ApiOperation)({ summary: '获取小说的协作者列表' }),
    __param(0, (0, common_1.Param)('novelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CollaborationController.prototype, "getCollaborators", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '更新协作状态' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_c = typeof collaboration_dto_1.UpdateCollaborationDto !== "undefined" && collaboration_dto_1.UpdateCollaborationDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], CollaborationController.prototype, "updateCollaboration", null);
__decorate([
    (0, common_1.Post)(':id/accept'),
    (0, swagger_1.ApiOperation)({ summary: '接受协作邀请' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CollaborationController.prototype, "acceptCollaboration", null);
__decorate([
    (0, common_1.Post)(':id/revoke'),
    (0, swagger_1.ApiOperation)({ summary: '撤销协作' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CollaborationController.prototype, "revokeCollaboration", null);
__decorate([
    (0, common_1.Get)('novel/:novelId/permission/:userId'),
    (0, swagger_1.ApiOperation)({ summary: '检查用户协作权限' }),
    __param(0, (0, common_1.Param)('novelId')),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Query)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CollaborationController.prototype, "checkPermission", null);
__decorate([
    (0, common_1.Post)('chapter/lock'),
    (0, swagger_1.ApiOperation)({ summary: '锁定章节（开始编辑）' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof collaboration_dto_1.LockChapterDto !== "undefined" && collaboration_dto_1.LockChapterDto) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], CollaborationController.prototype, "lockChapter", null);
__decorate([
    (0, common_1.Post)('chapter/unlock'),
    (0, swagger_1.ApiOperation)({ summary: '解锁章节（结束编辑）' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof collaboration_dto_1.UnlockChapterDto !== "undefined" && collaboration_dto_1.UnlockChapterDto) === "function" ? _e : Object]),
    __metadata("design:returntype", Promise)
], CollaborationController.prototype, "unlockChapter", null);
__decorate([
    (0, common_1.Get)('chapter/:chapterId/lock-status'),
    (0, swagger_1.ApiOperation)({ summary: '获取章节锁定状态' }),
    __param(0, (0, common_1.Param)('chapterId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CollaborationController.prototype, "getChapterLockStatus", null);
__decorate([
    (0, common_1.Post)('edit-event'),
    (0, swagger_1.ApiOperation)({ summary: '记录编辑事件' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof collaboration_dto_1.EditEventDto !== "undefined" && collaboration_dto_1.EditEventDto) === "function" ? _f : Object]),
    __metadata("design:returntype", Promise)
], CollaborationController.prototype, "recordEditEvent", null);
__decorate([
    (0, common_1.Get)('chapter/:chapterId/edit-history'),
    (0, swagger_1.ApiOperation)({ summary: '获取章节编辑历史' }),
    __param(0, (0, common_1.Param)('chapterId')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('after')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", Promise)
], CollaborationController.prototype, "getChapterEditHistory", null);
exports.CollaborationController = CollaborationController = __decorate([
    (0, swagger_1.ApiTags)('Collaboration'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, common_1.Controller)('collaboration'),
    __metadata("design:paramtypes", [typeof (_a = typeof collaboration_service_1.CollaborationService !== "undefined" && collaboration_service_1.CollaborationService) === "function" ? _a : Object])
], CollaborationController);


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
exports.CollaborationService = void 0;
const common_1 = __webpack_require__(3);
const database_1 = __webpack_require__(9);
const collaboration_dto_1 = __webpack_require__(43);
let CollaborationService = class CollaborationService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createCollaboration(dto) {
        const novel = await this.prisma.novel.findUnique({
            where: { id: dto.novelId },
        });
        if (!novel) {
            throw new common_1.NotFoundException('小说不存在');
        }
        const existing = await this.prisma.novelCollaboration.findFirst({
            where: {
                novelId: dto.novelId,
                userId: dto.userId,
                status: collaboration_dto_1.CollaborationStatus.ACTIVE,
            },
        });
        if (existing) {
            throw new common_1.ConflictException('该用户已是协作者');
        }
        return this.prisma.novelCollaboration.create({
            data: {
                novelId: dto.novelId,
                userId: dto.userId,
                role: dto.role,
                status: collaboration_dto_1.CollaborationStatus.PENDING,
                inviteMessage: dto.message,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: {
                                nickname: true,
                                avatar: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async getCollaborators(novelId) {
        return this.prisma.novelCollaboration.findMany({
            where: {
                novelId,
                status: collaboration_dto_1.CollaborationStatus.ACTIVE,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: {
                                nickname: true,
                                avatar: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateCollaboration(collaborationId, dto) {
        return this.prisma.novelCollaboration.update({
            where: { id: collaborationId },
            data: dto,
        });
    }
    async acceptCollaboration(collaborationId, userId) {
        const collaboration = await this.prisma.novelCollaboration.findUnique({
            where: { id: collaborationId },
        });
        if (!collaboration) {
            throw new common_1.NotFoundException('协作邀请不存在');
        }
        if (collaboration.userId !== userId) {
            throw new common_1.ForbiddenException('无权接受此邀请');
        }
        return this.prisma.novelCollaboration.update({
            where: { id: collaborationId },
            data: { status: collaboration_dto_1.CollaborationStatus.ACTIVE },
        });
    }
    async revokeCollaboration(collaborationId, userId) {
        const collaboration = await this.prisma.novelCollaboration.findUnique({
            where: { id: collaborationId },
        });
        if (!collaboration) {
            throw new common_1.NotFoundException('协作记录不存在');
        }
        return this.prisma.novelCollaboration.update({
            where: { id: collaborationId },
            data: { status: collaboration_dto_1.CollaborationStatus.REVOKED },
        });
    }
    async checkCollaborationPermission(novelId, userId, requiredRole) {
        const novel = await this.prisma.novel.findUnique({
            where: { id: novelId },
        });
        if (novel?.userId === userId) {
            return true;
        }
        const collaboration = await this.prisma.novelCollaboration.findFirst({
            where: {
                novelId,
                userId,
                status: collaboration_dto_1.CollaborationStatus.ACTIVE,
            },
        });
        if (!collaboration) {
            return false;
        }
        if (requiredRole) {
            const roleHierarchy = {
                [collaboration_dto_1.CollaborationRole.OWNER]: 4,
                [collaboration_dto_1.CollaborationRole.EDITOR]: 3,
                [collaboration_dto_1.CollaborationRole.COMMENTER]: 2,
                [collaboration_dto_1.CollaborationRole.VIEWER]: 1,
            };
            return (roleHierarchy[collaboration.role] >= roleHierarchy[requiredRole]);
        }
        return true;
    }
    async lockChapter(dto) {
        const existingLock = await this.prisma.chapterLock.findFirst({
            where: {
                chapterId: dto.chapterId,
                isLocked: true,
            },
        });
        if (existingLock && existingLock.userId !== dto.userId) {
            const lockAge = Date.now() - existingLock.lockedAt.getTime();
            if (lockAge < 30 * 60 * 1000) {
                const user = await this.prisma.user.findUnique({
                    where: { id: existingLock.userId },
                    include: { profile: true },
                });
                throw new common_1.ConflictException(`章节正在被 ${user?.profile?.nickname || user?.email} 编辑中`);
            }
        }
        return this.prisma.chapterLock.upsert({
            where: { chapterId: dto.chapterId },
            update: {
                userId: dto.userId,
                isLocked: true,
                lockedAt: new Date(),
            },
            create: {
                chapterId: dto.chapterId,
                userId: dto.userId,
                isLocked: true,
                lockedAt: new Date(),
            },
        });
    }
    async unlockChapter(dto) {
        const lock = await this.prisma.chapterLock.findFirst({
            where: {
                chapterId: dto.chapterId,
            },
        });
        if (!lock) {
            return null;
        }
        if (lock.userId !== dto.userId) {
            throw new common_1.ForbiddenException('只有锁定者本人可以解锁');
        }
        return this.prisma.chapterLock.update({
            where: { chapterId: dto.chapterId },
            data: { isLocked: false },
        });
    }
    async getChapterLockStatus(chapterId) {
        const lock = await this.prisma.chapterLock.findFirst({
            where: {
                chapterId,
                isLocked: true,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: {
                                nickname: true,
                                avatar: true,
                            },
                        },
                    },
                },
            },
        });
        if (!lock) {
            return { isLocked: false, lockedBy: null };
        }
        const lockAge = Date.now() - lock.lockedAt.getTime();
        if (lockAge >= 30 * 60 * 1000) {
            await this.prisma.chapterLock.update({
                where: { chapterId },
                data: { isLocked: false },
            });
            return { isLocked: false, lockedBy: null };
        }
        return {
            isLocked: true,
            lockedBy: {
                id: lock.user.id,
                email: lock.user.email,
                nickname: lock.user.profile?.nickname,
                avatar: lock.user.profile?.avatar,
            },
            lockedAt: lock.lockedAt,
        };
    }
    async recordEditEvent(dto) {
        return this.prisma.chapterEditEvent.create({
            data: {
                chapterId: dto.chapterId,
                userId: dto.userId,
                eventType: dto.eventType,
                eventData: dto.data,
            },
        });
    }
    async getChapterEditHistory(chapterId, limit = 50, afterTimestamp) {
        return this.prisma.chapterEditEvent.findMany({
            where: {
                chapterId,
                ...(afterTimestamp && { createdAt: { gt: afterTimestamp } }),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: {
                                nickname: true,
                                avatar: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
};
exports.CollaborationService = CollaborationService;
exports.CollaborationService = CollaborationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], CollaborationService);


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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EditEventDto = exports.UnlockChapterDto = exports.LockChapterDto = exports.UpdateCollaborationDto = exports.CreateCollaborationDto = exports.CollaborationStatus = exports.CollaborationRole = void 0;
const class_validator_1 = __webpack_require__(20);
var CollaborationRole;
(function (CollaborationRole) {
    CollaborationRole["OWNER"] = "OWNER";
    CollaborationRole["EDITOR"] = "EDITOR";
    CollaborationRole["VIEWER"] = "VIEWER";
    CollaborationRole["COMMENTER"] = "COMMENTER";
})(CollaborationRole || (exports.CollaborationRole = CollaborationRole = {}));
var CollaborationStatus;
(function (CollaborationStatus) {
    CollaborationStatus["ACTIVE"] = "ACTIVE";
    CollaborationStatus["PENDING"] = "PENDING";
    CollaborationStatus["REVOKED"] = "REVOKED";
})(CollaborationStatus || (exports.CollaborationStatus = CollaborationStatus = {}));
class CreateCollaborationDto {
}
exports.CreateCollaborationDto = CreateCollaborationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCollaborationDto.prototype, "novelId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCollaborationDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(CollaborationRole),
    __metadata("design:type", String)
], CreateCollaborationDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCollaborationDto.prototype, "message", void 0);
class UpdateCollaborationDto {
}
exports.UpdateCollaborationDto = UpdateCollaborationDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(CollaborationRole),
    __metadata("design:type", String)
], UpdateCollaborationDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(CollaborationStatus),
    __metadata("design:type", String)
], UpdateCollaborationDto.prototype, "status", void 0);
class LockChapterDto {
}
exports.LockChapterDto = LockChapterDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LockChapterDto.prototype, "chapterId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LockChapterDto.prototype, "userId", void 0);
class UnlockChapterDto {
}
exports.UnlockChapterDto = UnlockChapterDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UnlockChapterDto.prototype, "chapterId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UnlockChapterDto.prototype, "userId", void 0);
class EditEventDto {
}
exports.EditEventDto = EditEventDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EditEventDto.prototype, "chapterId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EditEventDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EditEventDto.prototype, "eventType", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], EditEventDto.prototype, "data", void 0);


/***/ }),
/* 44 */
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
__exportStar(__webpack_require__(45), exports);
__exportStar(__webpack_require__(16), exports);
__exportStar(__webpack_require__(48), exports);
__exportStar(__webpack_require__(49), exports);
__exportStar(__webpack_require__(50), exports);
__exportStar(__webpack_require__(51), exports);


/***/ }),
/* 45 */
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
__exportStar(__webpack_require__(46), exports);
__exportStar(__webpack_require__(47), exports);


/***/ }),
/* 46 */
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
/* 47 */
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
/* 48 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 49 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 50 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 51 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 52 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VersionModule = void 0;
const common_1 = __webpack_require__(3);
const version_controller_1 = __webpack_require__(53);
const version_service_1 = __webpack_require__(54);
const database_1 = __webpack_require__(9);
let VersionModule = class VersionModule {
};
exports.VersionModule = VersionModule;
exports.VersionModule = VersionModule = __decorate([
    (0, common_1.Module)({
        imports: [database_1.DatabaseModule],
        controllers: [version_controller_1.VersionController],
        providers: [version_service_1.VersionService],
        exports: [version_service_1.VersionService],
    })
], VersionModule);


/***/ }),
/* 53 */
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
exports.VersionController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(4);
const version_service_1 = __webpack_require__(54);
const version_dto_1 = __webpack_require__(55);
const common_2 = __webpack_require__(44);
let VersionController = class VersionController {
    constructor(versionService) {
        this.versionService = versionService;
    }
    async createVersion(dto) {
        return this.versionService.createVersion(dto);
    }
    async getChapterVersionHistory(chapterId, limit) {
        return this.versionService.getChapterVersionHistory(chapterId, limit ? parseInt(limit.toString()) : 50);
    }
    async getVersion(chapterId, versionNumber) {
        return this.versionService.getVersion(chapterId, parseInt(versionNumber));
    }
    async compareVersions(dto) {
        return this.versionService.compareVersions(dto);
    }
    async restoreVersion(dto) {
        return this.versionService.restoreVersion(dto);
    }
    async cleanupOldVersions(chapterId, keepCount) {
        return this.versionService.cleanupOldVersions(chapterId, keepCount ? parseInt(keepCount.toString()) : 100);
    }
    async getVersionStats(chapterId) {
        return this.versionService.getVersionStats(chapterId);
    }
};
exports.VersionController = VersionController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '创建章节版本快照' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof version_dto_1.CreateVersionDto !== "undefined" && version_dto_1.CreateVersionDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], VersionController.prototype, "createVersion", null);
__decorate([
    (0, common_1.Get)('chapter/:chapterId/history'),
    (0, swagger_1.ApiOperation)({ summary: '获取章节版本历史' }),
    __param(0, (0, common_1.Param)('chapterId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], VersionController.prototype, "getChapterVersionHistory", null);
__decorate([
    (0, common_1.Get)('chapter/:chapterId/version/:versionNumber'),
    (0, swagger_1.ApiOperation)({ summary: '获取特定版本' }),
    __param(0, (0, common_1.Param)('chapterId')),
    __param(1, (0, common_1.Param)('versionNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], VersionController.prototype, "getVersion", null);
__decorate([
    (0, common_1.Post)('compare'),
    (0, swagger_1.ApiOperation)({ summary: '对比两个版本' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof version_dto_1.CompareVersionsDto !== "undefined" && version_dto_1.CompareVersionsDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], VersionController.prototype, "compareVersions", null);
__decorate([
    (0, common_1.Post)('restore'),
    (0, swagger_1.ApiOperation)({ summary: '回滚到指定版本' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof version_dto_1.RestoreVersionDto !== "undefined" && version_dto_1.RestoreVersionDto) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], VersionController.prototype, "restoreVersion", null);
__decorate([
    (0, common_1.Delete)('chapter/:chapterId/cleanup'),
    (0, swagger_1.ApiOperation)({ summary: '清理旧版本' }),
    __param(0, (0, common_1.Param)('chapterId')),
    __param(1, (0, common_1.Query)('keepCount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], VersionController.prototype, "cleanupOldVersions", null);
__decorate([
    (0, common_1.Get)('chapter/:chapterId/stats'),
    (0, swagger_1.ApiOperation)({ summary: '获取版本统计信息' }),
    __param(0, (0, common_1.Param)('chapterId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VersionController.prototype, "getVersionStats", null);
exports.VersionController = VersionController = __decorate([
    (0, swagger_1.ApiTags)('Version Control'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, common_1.Controller)('versions'),
    __metadata("design:paramtypes", [typeof (_a = typeof version_service_1.VersionService !== "undefined" && version_service_1.VersionService) === "function" ? _a : Object])
], VersionController);


/***/ }),
/* 54 */
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
exports.VersionService = void 0;
const common_1 = __webpack_require__(3);
const database_1 = __webpack_require__(9);
let VersionService = class VersionService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createVersion(dto) {
        const chapter = await this.prisma.chapter.findUnique({
            where: { id: dto.chapterId },
        });
        if (!chapter) {
            throw new common_1.NotFoundException('章节不存在');
        }
        const latestVersion = await this.prisma.chapterVersion.findFirst({
            where: { chapterId: dto.chapterId },
            orderBy: { versionNumber: 'desc' },
        });
        const nextVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;
        return this.prisma.chapterVersion.create({
            data: {
                chapterId: dto.chapterId,
                versionNumber: nextVersionNumber,
                title: chapter.title,
                content: chapter.content,
                wordCount: chapter.wordCount,
                userId: dto.userId,
                changeLog: dto.changeLog,
            },
        });
    }
    async getChapterVersionHistory(chapterId, limit = 50) {
        return this.prisma.chapterVersion.findMany({
            where: { chapterId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: {
                                nickname: true,
                                avatar: true,
                            },
                        },
                    },
                },
            },
            orderBy: { versionNumber: 'desc' },
            take: limit,
        });
    }
    async getVersion(chapterId, versionNumber) {
        const version = await this.prisma.chapterVersion.findUnique({
            where: {
                chapterId_versionNumber: {
                    chapterId,
                    versionNumber,
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: {
                                nickname: true,
                                avatar: true,
                            },
                        },
                    },
                },
            },
        });
        if (!version) {
            throw new common_1.NotFoundException('版本不存在');
        }
        return version;
    }
    async compareVersions(dto) {
        const version1 = await this.getVersion(dto.chapterId, dto.version1);
        const version2 = await this.getVersion(dto.chapterId, dto.version2);
        const content1 = version1.content || '';
        const content2 = version2.content || '';
        const wordCountDiff = version2.wordCount - version1.wordCount;
        const contentLengthDiff = content2.length - content1.length;
        return {
            version1: {
                versionNumber: version1.versionNumber,
                title: version1.title,
                wordCount: version1.wordCount,
                createdAt: version1.createdAt,
                userId: version1.userId,
            },
            version2: {
                versionNumber: version2.versionNumber,
                title: version2.title,
                wordCount: version2.wordCount,
                createdAt: version2.createdAt,
                userId: version2.userId,
            },
            diff: {
                wordCountDiff,
                contentLengthDiff,
                titleChanged: version1.title !== version2.title,
            },
            content1,
            content2,
        };
    }
    async restoreVersion(dto) {
        const version = await this.getVersion(dto.chapterId, dto.versionNumber);
        const updatedChapter = await this.prisma.chapter.update({
            where: { id: dto.chapterId },
            data: {
                title: version.title,
                content: version.content,
                wordCount: version.wordCount,
            },
        });
        const newVersion = await this.createVersion({
            chapterId: dto.chapterId,
            userId: dto.userId,
            changeLog: `回滚到版本 ${dto.versionNumber}`,
        });
        return {
            chapter: updatedChapter,
            newVersion,
            restoredFrom: version,
        };
    }
    async cleanupOldVersions(chapterId, keepCount = 100) {
        const totalCount = await this.prisma.chapterVersion.count({
            where: { chapterId },
        });
        if (totalCount <= keepCount) {
            return { deleted: 0, message: '无需清理' };
        }
        const versionsToDelete = await this.prisma.chapterVersion.findMany({
            where: { chapterId },
            orderBy: { versionNumber: 'asc' },
            take: totalCount - keepCount,
            select: { id: true },
        });
        const deleteResult = await this.prisma.chapterVersion.deleteMany({
            where: {
                id: {
                    in: versionsToDelete.map(v => v.id),
                },
            },
        });
        return {
            deleted: deleteResult.count,
            message: `清理了 ${deleteResult.count} 个旧版本`,
        };
    }
    async getVersionStats(chapterId) {
        const versions = await this.prisma.chapterVersion.findMany({
            where: { chapterId },
            orderBy: { versionNumber: 'asc' },
        });
        if (versions.length === 0) {
            return {
                totalVersions: 0,
                firstVersion: null,
                latestVersion: null,
                totalWordCountChange: 0,
            };
        }
        const firstVersion = versions[0];
        const latestVersion = versions[versions.length - 1];
        const totalWordCountChange = latestVersion.wordCount - firstVersion.wordCount;
        return {
            totalVersions: versions.length,
            firstVersion: {
                versionNumber: firstVersion.versionNumber,
                createdAt: firstVersion.createdAt,
                wordCount: firstVersion.wordCount,
            },
            latestVersion: {
                versionNumber: latestVersion.versionNumber,
                createdAt: latestVersion.createdAt,
                wordCount: latestVersion.wordCount,
            },
            totalWordCountChange,
        };
    }
};
exports.VersionService = VersionService;
exports.VersionService = VersionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], VersionService);


/***/ }),
/* 55 */
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
exports.RestoreVersionDto = exports.CompareVersionsDto = exports.CreateVersionDto = void 0;
const class_validator_1 = __webpack_require__(20);
class CreateVersionDto {
}
exports.CreateVersionDto = CreateVersionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVersionDto.prototype, "chapterId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVersionDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVersionDto.prototype, "changeLog", void 0);
class CompareVersionsDto {
}
exports.CompareVersionsDto = CompareVersionsDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompareVersionsDto.prototype, "chapterId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CompareVersionsDto.prototype, "version1", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CompareVersionsDto.prototype, "version2", void 0);
class RestoreVersionDto {
}
exports.RestoreVersionDto = RestoreVersionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RestoreVersionDto.prototype, "chapterId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], RestoreVersionDto.prototype, "versionNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RestoreVersionDto.prototype, "userId", void 0);


/***/ }),
/* 56 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommentModule = void 0;
const common_1 = __webpack_require__(3);
const comment_controller_1 = __webpack_require__(57);
const comment_service_1 = __webpack_require__(58);
const database_1 = __webpack_require__(9);
let CommentModule = class CommentModule {
};
exports.CommentModule = CommentModule;
exports.CommentModule = CommentModule = __decorate([
    (0, common_1.Module)({
        imports: [database_1.DatabaseModule],
        controllers: [comment_controller_1.CommentController],
        providers: [comment_service_1.CommentService],
        exports: [comment_service_1.CommentService],
    })
], CommentModule);


/***/ }),
/* 57 */
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
exports.CommentController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(4);
const comment_service_1 = __webpack_require__(58);
const comment_dto_1 = __webpack_require__(59);
const common_2 = __webpack_require__(44);
let CommentController = class CommentController {
    constructor(commentService) {
        this.commentService = commentService;
    }
    async createComment(dto, req) {
        dto.userId = req.user.userId;
        return this.commentService.createComment(dto);
    }
    async getChapterComments(chapterId, status, userId) {
        return this.commentService.getChapterComments({
            chapterId,
            status,
            userId,
        });
    }
    async getComment(id) {
        return this.commentService.getComment(id);
    }
    async updateComment(id, dto, req) {
        return this.commentService.updateComment(id, req.user.userId, dto);
    }
    async deleteComment(id, req) {
        return this.commentService.deleteComment(id, req.user.userId);
    }
    async resolveComment(id, req) {
        return this.commentService.resolveComment(id, req.user.userId);
    }
    async getUserComments(userId, limit) {
        return this.commentService.getUserComments(userId, limit ? parseInt(limit.toString()) : 50);
    }
    async getCommentStats(chapterId) {
        return this.commentService.getCommentStats(chapterId);
    }
};
exports.CommentController = CommentController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '创建评论' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof comment_dto_1.CreateCommentDto !== "undefined" && comment_dto_1.CreateCommentDto) === "function" ? _b : Object, Object]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "createComment", null);
__decorate([
    (0, common_1.Get)('chapter/:chapterId'),
    (0, swagger_1.ApiOperation)({ summary: '获取章节评论列表' }),
    __param(0, (0, common_1.Param)('chapterId')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_c = typeof comment_dto_1.CommentStatusEnum !== "undefined" && comment_dto_1.CommentStatusEnum) === "function" ? _c : Object, String]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "getChapterComments", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '获取单个评论' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "getComment", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '更新评论' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_d = typeof comment_dto_1.UpdateCommentDto !== "undefined" && comment_dto_1.UpdateCommentDto) === "function" ? _d : Object, Object]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "updateComment", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '删除评论' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "deleteComment", null);
__decorate([
    (0, common_1.Post)(':id/resolve'),
    (0, swagger_1.ApiOperation)({ summary: '解决评论' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "resolveComment", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, swagger_1.ApiOperation)({ summary: '获取用户的评论列表' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "getUserComments", null);
__decorate([
    (0, common_1.Get)('chapter/:chapterId/stats'),
    (0, swagger_1.ApiOperation)({ summary: '获取评论统计' }),
    __param(0, (0, common_1.Param)('chapterId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "getCommentStats", null);
exports.CommentController = CommentController = __decorate([
    (0, swagger_1.ApiTags)('Comments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, common_1.Controller)('comments'),
    __metadata("design:paramtypes", [typeof (_a = typeof comment_service_1.CommentService !== "undefined" && comment_service_1.CommentService) === "function" ? _a : Object])
], CommentController);


/***/ }),
/* 58 */
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
exports.CommentService = void 0;
const common_1 = __webpack_require__(3);
const database_1 = __webpack_require__(9);
const comment_dto_1 = __webpack_require__(59);
let CommentService = class CommentService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createComment(dto) {
        const chapter = await this.prisma.chapter.findUnique({
            where: { id: dto.chapterId },
        });
        if (!chapter) {
            throw new common_1.NotFoundException('章节不存在');
        }
        if (dto.parentId) {
            const parentComment = await this.prisma.chapterComment.findUnique({
                where: { id: dto.parentId },
            });
            if (!parentComment) {
                throw new common_1.NotFoundException('父评论不存在');
            }
            if (parentComment.chapterId !== dto.chapterId) {
                throw new common_1.ForbiddenException('父评论不属于该章节');
            }
        }
        return this.prisma.chapterComment.create({
            data: {
                chapterId: dto.chapterId,
                userId: dto.userId,
                content: dto.content,
                position: dto.position,
                parentId: dto.parentId,
                status: comment_dto_1.CommentStatusEnum.ACTIVE,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: {
                                nickname: true,
                                avatar: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async getChapterComments(dto) {
        const where = {
            chapterId: dto.chapterId,
        };
        if (dto.status) {
            where.status = dto.status;
        }
        if (dto.userId) {
            where.userId = dto.userId;
        }
        where.parentId = null;
        return this.prisma.chapterComment.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: {
                                nickname: true,
                                avatar: true,
                            },
                        },
                    },
                },
                replies: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                profile: {
                                    select: {
                                        nickname: true,
                                        avatar: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getComment(commentId) {
        const comment = await this.prisma.chapterComment.findUnique({
            where: { id: commentId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: {
                                nickname: true,
                                avatar: true,
                            },
                        },
                    },
                },
                replies: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                profile: {
                                    select: {
                                        nickname: true,
                                        avatar: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!comment) {
            throw new common_1.NotFoundException('评论不存在');
        }
        return comment;
    }
    async updateComment(commentId, userId, dto) {
        const comment = await this.prisma.chapterComment.findUnique({
            where: { id: commentId },
        });
        if (!comment) {
            throw new common_1.NotFoundException('评论不存在');
        }
        if (comment.userId !== userId) {
            throw new common_1.ForbiddenException('无权修改此评论');
        }
        return this.prisma.chapterComment.update({
            where: { id: commentId },
            data: dto,
        });
    }
    async deleteComment(commentId, userId) {
        const comment = await this.prisma.chapterComment.findUnique({
            where: { id: commentId },
        });
        if (!comment) {
            throw new common_1.NotFoundException('评论不存在');
        }
        if (comment.userId !== userId) {
            throw new common_1.ForbiddenException('无权删除此评论');
        }
        return this.prisma.chapterComment.update({
            where: { id: commentId },
            data: { status: comment_dto_1.CommentStatusEnum.DELETED },
        });
    }
    async resolveComment(commentId, userId) {
        const comment = await this.prisma.chapterComment.findUnique({
            where: { id: commentId },
        });
        if (!comment) {
            throw new common_1.NotFoundException('评论不存在');
        }
        return this.prisma.chapterComment.update({
            where: { id: commentId },
            data: { status: comment_dto_1.CommentStatusEnum.RESOLVED },
        });
    }
    async getUserComments(userId, limit = 50) {
        return this.prisma.chapterComment.findMany({
            where: {
                userId,
                status: { not: comment_dto_1.CommentStatusEnum.DELETED },
            },
            include: {
                chapter: {
                    select: {
                        id: true,
                        title: true,
                        novel: {
                            select: {
                                id: true,
                                title: true,
                            },
                        },
                    },
                },
                user: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: {
                                nickname: true,
                                avatar: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async getCommentStats(chapterId) {
        const total = await this.prisma.chapterComment.count({
            where: { chapterId },
        });
        const active = await this.prisma.chapterComment.count({
            where: {
                chapterId,
                status: comment_dto_1.CommentStatusEnum.ACTIVE,
            },
        });
        const resolved = await this.prisma.chapterComment.count({
            where: {
                chapterId,
                status: comment_dto_1.CommentStatusEnum.RESOLVED,
            },
        });
        return {
            total,
            active,
            resolved,
            deleted: total - active - resolved,
        };
    }
};
exports.CommentService = CommentService;
exports.CommentService = CommentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], CommentService);


/***/ }),
/* 59 */
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
exports.QueryCommentsDto = exports.UpdateCommentDto = exports.CreateCommentDto = exports.CommentStatusEnum = void 0;
const class_validator_1 = __webpack_require__(20);
var CommentStatusEnum;
(function (CommentStatusEnum) {
    CommentStatusEnum["ACTIVE"] = "ACTIVE";
    CommentStatusEnum["RESOLVED"] = "RESOLVED";
    CommentStatusEnum["DELETED"] = "DELETED";
})(CommentStatusEnum || (exports.CommentStatusEnum = CommentStatusEnum = {}));
class CreateCommentDto {
}
exports.CreateCommentDto = CreateCommentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCommentDto.prototype, "chapterId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCommentDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCommentDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateCommentDto.prototype, "position", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCommentDto.prototype, "parentId", void 0);
class UpdateCommentDto {
}
exports.UpdateCommentDto = UpdateCommentDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCommentDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(CommentStatusEnum),
    __metadata("design:type", String)
], UpdateCommentDto.prototype, "status", void 0);
class QueryCommentsDto {
}
exports.QueryCommentsDto = QueryCommentsDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryCommentsDto.prototype, "chapterId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(CommentStatusEnum),
    __metadata("design:type", String)
], QueryCommentsDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryCommentsDto.prototype, "userId", void 0);


/***/ }),
/* 60 */
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
const health_controller_1 = __webpack_require__(61);
const health_service_1 = __webpack_require__(62);
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
/* 61 */
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
const health_service_1 = __webpack_require__(62);
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
/* 62 */
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
/* 63 */
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
const config_1 = __webpack_require__(6);
const passport_1 = __webpack_require__(8);
const passport_jwt_1 = __webpack_require__(64);
const database_1 = __webpack_require__(9);
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
/* 64 */
/***/ ((module) => {

module.exports = require("passport-jwt");

/***/ }),
/* 65 */
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
/* 66 */
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
const operators_1 = __webpack_require__(67);
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
/* 67 */
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
const app_module_1 = __webpack_require__(5);
const all_exceptions_filter_1 = __webpack_require__(65);
const response_interceptor_1 = __webpack_require__(66);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    app.useGlobalInterceptors(new response_interceptor_1.ResponseInterceptor());
    app.setGlobalPrefix('api/v1');
    app.enableCors({
        origin: process.env.NODE_ENV === 'production'
            ? ['https://91writing.com', 'https://www.91writing.com']
            : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:7520'],
        credentials: true,
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('91Writing Novel Service API')
        .setDescription(`
      91Writing 小说服务API文档
      
      ## 功能模块
      
      ### 🔐 认证说明
      - 所有API都需要JWT认证
      - 请在请求头中添加: Authorization: Bearer <token>
      - 用户只能操作自己的数据
      
      ### 📚 小说管理
      - 创建、编辑、删除小说
      - 小说设置管理(角色、世界观等)
      - 统计信息自动计算
      
      ### 📝 章节管理  
      - 章节内容的CRUD操作
      - 章节排序和状态管理
      - 大文本内容优化处理
      
      ### 🧠 记忆系统
      - AI辅助创作的上下文管理
      - 按重要性分级存储
      - 支持多种记忆类型
      
      ## 数据模型
      - Novel: 小说主体信息
      - Chapter: 章节内容
      - NovelMemory: 记忆数据
      
      ## 版本信息
      - 服务版本: v1.0
      - API版本: v1
      - 更新时间: 2024年12月
    `)
        .setVersion('1.0')
        .addTag('novels', '小说管理')
        .addTag('chapters', '章节管理')
        .addTag('memories', '记忆系统')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
    }, 'JWT-auth')
        .addServer('http://localhost:3003', '开发环境')
        .addServer('https://api.91writing.com', '生产环境')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api-docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            tagsSorter: 'alpha',
            operationsSorter: 'alpha',
        },
        customfavIcon: 'https://91writing.com/favicon.ico',
        customSiteTitle: '91Writing API文档',
        customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .info h1 { color: #2c5aa0; }
    `,
    });
    const port = process.env.NOVEL_SERVICE_PORT || process.env.PORT || 3003;
    await app.listen(port);
    console.log(`Novel Service is running on: http://localhost:${port}`);
    console.log(`API Documentation: http://localhost:${port}/api-docs`);
}
bootstrap();

})();

/******/ })()
;