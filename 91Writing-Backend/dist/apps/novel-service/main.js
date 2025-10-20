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
const memory_module_1 = __webpack_require__(28);
const suggestion_module_1 = __webpack_require__(33);
const character_module_1 = __webpack_require__(37);
const world_module_1 = __webpack_require__(41);
const material_module_1 = __webpack_require__(45);
const migration_module_1 = __webpack_require__(49);
const prompt_module_1 = __webpack_require__(53);
const collaboration_module_1 = __webpack_require__(57);
const version_module_1 = __webpack_require__(69);
const comment_module_1 = __webpack_require__(73);
const health_module_1 = __webpack_require__(77);
const jwt_strategy_1 = __webpack_require__(80);
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
            suggestion_module_1.SuggestionModule,
            character_module_1.CharacterModule,
            world_module_1.WorldModule,
            material_module_1.MaterialModule,
            migration_module_1.MigrationModule,
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
    async updateWithConflictDetection(id, userId, updateDto) {
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
        const clientLastKnownUpdate = new Date(updateDto.lastKnownUpdatedAt);
        const serverLastUpdate = new Date(chapter.updatedAt);
        const hasConflict = serverLastUpdate > clientLastKnownUpdate;
        if (hasConflict && !updateDto.forceUpdate) {
            const conflictResponse = {
                hasConflict: true,
                serverVersion: {
                    updatedAt: serverLastUpdate,
                    title: chapter.title,
                    content: chapter.content,
                    wordCount: chapter.wordCount,
                },
                clientVersion: {
                    updatedAt: clientLastKnownUpdate,
                    title: updateDto.title,
                    content: updateDto.content,
                },
                message: '检测到数据冲突：服务器端的内容已被其他设备或用户修改',
                suggestedActions: [
                    'keep-server: 放弃本地修改，使用服务器版本',
                    'keep-client: 用本地版本覆盖服务器版本',
                    'merge: 尝试合并两个版本（需手动处理）',
                ],
            };
            throw new common_1.ConflictException({
                ...conflictResponse,
                statusCode: 409,
            });
        }
        let finalData = {};
        if (updateDto.conflictStrategy) {
            switch (updateDto.conflictStrategy) {
                case 'keep-server':
                    return {
                        resolved: true,
                        strategy: 'keep-server',
                        chapter,
                        message: '已保留服务器版本',
                    };
                case 'keep-client':
                    finalData = {
                        title: updateDto.title !== undefined ? updateDto.title : chapter.title,
                        content: updateDto.content !== undefined ? updateDto.content : chapter.content,
                        status: updateDto.status !== undefined ? updateDto.status : chapter.status,
                    };
                    break;
                case 'merge':
                    finalData = {
                        title: updateDto.title || chapter.title,
                        content: this.mergeContent(chapter.content, updateDto.content || ''),
                        status: updateDto.status || chapter.status,
                    };
                    break;
            }
        }
        else {
            finalData = {
                title: updateDto.title,
                content: updateDto.content,
                status: updateDto.status,
            };
        }
        let wordCount = chapter.wordCount;
        if (finalData.content !== undefined) {
            wordCount = this.calculateWordCount(finalData.content);
        }
        const updatedChapter = await this.prisma.chapter.update({
            where: { id },
            data: {
                ...finalData,
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
        return {
            resolved: hasConflict,
            strategy: updateDto.conflictStrategy,
            chapter: updatedChapter,
            message: hasConflict ? '冲突已解决，章节已更新' : '章节已更新',
        };
    }
    mergeContent(serverContent, clientContent) {
        if (clientContent.length > serverContent.length) {
            return clientContent;
        }
        return serverContent;
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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ChapterController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(4);
const guards_1 = __webpack_require__(16);
const chapter_service_1 = __webpack_require__(24);
const create_chapter_dto_1 = __webpack_require__(26);
const update_chapter_with_conflict_dto_1 = __webpack_require__(27);
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
    async updateWithConflictCheck(id, req, updateDto) {
        return this.chapterService.updateWithConflictDetection(id, req.user.id, updateDto);
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
    (0, swagger_1.ApiOperation)({
        summary: '创建章节',
        description: '在指定小说中创建新的章节'
    }),
    (0, swagger_1.ApiParam)({ name: 'novelId', description: '小说ID' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: '章节创建成功',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'cm1234567890' },
                        title: { type: 'string', example: '第一章：开端' },
                        chapterNumber: { type: 'number', example: 1 },
                        content: { type: 'string', example: '章节内容...' },
                        wordCount: { type: 'number', example: 2500 },
                        status: { type: 'string', enum: ['DRAFT', 'PUBLISHED'], example: 'DRAFT' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '未授权访问' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '小说不存在' }),
    __param(0, (0, common_1.Param)('novelId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, typeof (_b = typeof create_chapter_dto_1.CreateChapterDto !== "undefined" && create_chapter_dto_1.CreateChapterDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], ChapterController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: '获取章节列表',
        description: '获取指定小说的所有章节列表'
    }),
    (0, swagger_1.ApiParam)({ name: 'novelId', description: '小说ID' }),
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
                            title: { type: 'string' },
                            chapterNumber: { type: 'number' },
                            wordCount: { type: 'number' },
                            status: { type: 'string' },
                            createdAt: { type: 'string', format: 'date-time' }
                        }
                    }
                }
            }
        }
    }),
    __param(0, (0, common_1.Param)('novelId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChapterController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: '获取章节详情',
        description: '获取指定章节的详细信息'
    }),
    (0, swagger_1.ApiParam)({ name: 'novelId', description: '小说ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '章节ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取成功',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '章节不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChapterController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/content'),
    (0, swagger_1.ApiOperation)({
        summary: '获取章节内容',
        description: '获取指定章节的完整内容'
    }),
    (0, swagger_1.ApiParam)({ name: 'novelId', description: '小说ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '章节ID' }),
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
                        content: { type: 'string', example: '章节完整内容...' },
                        wordCount: { type: 'number' }
                    }
                }
            }
        }
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChapterController.prototype, "getContent", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: '更新章节信息',
        description: '更新章节的标题、状态等基本信息'
    }),
    (0, swagger_1.ApiParam)({ name: 'novelId', description: '小说ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '章节ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '更新成功',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '章节不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, typeof (_c = typeof Partial !== "undefined" && Partial) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], ChapterController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/content'),
    (0, swagger_1.ApiOperation)({
        summary: '更新章节内容',
        description: '更新章节的正文内容，自动计算字数'
    }),
    (0, swagger_1.ApiParam)({ name: 'novelId', description: '小说ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '章节ID' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                content: { type: 'string', example: '更新后的章节内容...' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '内容更新成功',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)('content')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], ChapterController.prototype, "updateContent", null);
__decorate([
    (0, common_1.Patch)(':id/update-with-conflict-check'),
    (0, swagger_1.ApiOperation)({
        summary: '带冲突检测的章节更新',
        description: '更新章节时检测多设备数据冲突，支持冲突解决策略'
    }),
    (0, swagger_1.ApiParam)({ name: 'novelId', description: '小说ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '章节ID' }),
    (0, swagger_1.ApiBody)({ type: update_chapter_with_conflict_dto_1.UpdateChapterWithConflictDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '更新成功或冲突已解决',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        resolved: { type: 'boolean', example: false, description: '是否解决了冲突' },
                        strategy: { type: 'string', example: 'keep-client', description: '使用的冲突解决策略' },
                        chapter: {
                            type: 'object',
                            description: '更新后的章节'
                        },
                        message: { type: 'string', example: '章节已更新' }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: '检测到数据冲突',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: false },
                error: {
                    type: 'object',
                    properties: {
                        hasConflict: { type: 'boolean', example: true },
                        serverVersion: {
                            type: 'object',
                            properties: {
                                updatedAt: { type: 'string', format: 'date-time' },
                                title: { type: 'string' },
                                content: { type: 'string' },
                                wordCount: { type: 'number' }
                            }
                        },
                        clientVersion: {
                            type: 'object',
                            properties: {
                                updatedAt: { type: 'string', format: 'date-time' },
                                title: { type: 'string' },
                                content: { type: 'string' }
                            }
                        },
                        message: { type: 'string', example: '检测到数据冲突' },
                        suggestedActions: {
                            type: 'array',
                            items: { type: 'string' }
                        }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '参数验证失败' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '未授权访问' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '章节不存在' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, typeof (_d = typeof update_chapter_with_conflict_dto_1.UpdateChapterWithConflictDto !== "undefined" && update_chapter_with_conflict_dto_1.UpdateChapterWithConflictDto) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], ChapterController.prototype, "updateWithConflictCheck", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: '删除章节',
        description: '删除指定的章节'
    }),
    (0, swagger_1.ApiParam)({ name: 'novelId', description: '小说ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '章节ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '删除成功',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '章节不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChapterController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)('status'),
    (0, swagger_1.ApiOperation)({
        summary: '批量更新章节状态',
        description: '批量更新多个章节的状态'
    }),
    (0, swagger_1.ApiParam)({ name: 'novelId', description: '小说ID' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                chapterIds: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['cm123', 'cm456']
                },
                status: {
                    type: 'string',
                    enum: ['DRAFT', 'PUBLISHED'],
                    example: 'PUBLISHED'
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '状态更新成功',
    }),
    __param(0, (0, common_1.Param)('novelId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ChapterController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)('reorder'),
    (0, swagger_1.ApiOperation)({
        summary: '重新排序章节',
        description: '调整章节的顺序编号'
    }),
    (0, swagger_1.ApiParam)({ name: 'novelId', description: '小说ID' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                chapterOrders: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', example: 'cm123' },
                            chapterNumber: { type: 'number', example: 1 }
                        }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '排序成功',
    }),
    __param(0, (0, common_1.Param)('novelId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ChapterController.prototype, "reorder", null);
exports.ChapterController = ChapterController = __decorate([
    (0, swagger_1.ApiTags)('chapters'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateChapterWithConflictDto = void 0;
const class_validator_1 = __webpack_require__(20);
const swagger_1 = __webpack_require__(4);
const client_1 = __webpack_require__(12);
class UpdateChapterWithConflictDto {
    constructor() {
        this.forceUpdate = false;
    }
}
exports.UpdateChapterWithConflictDto = UpdateChapterWithConflictDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '章节标题',
        example: '第一章：新的开始',
        maxLength: 200
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '标题必须是字符串' }),
    (0, class_validator_1.MinLength)(1, { message: '标题不能为空' }),
    (0, class_validator_1.MaxLength)(200, { message: '标题不能超过200个字符' }),
    __metadata("design:type", String)
], UpdateChapterWithConflictDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '章节内容',
        example: '章节正文内容...'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '内容必须是字符串' }),
    __metadata("design:type", String)
], UpdateChapterWithConflictDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '章节状态',
        enum: ['DRAFT', 'PUBLISHED'],
        example: 'DRAFT'
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", typeof (_a = typeof client_1.ChapterStatus !== "undefined" && client_1.ChapterStatus) === "function" ? _a : Object)
], UpdateChapterWithConflictDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '客户端最后已知的更新时间（用于冲突检测）',
        example: '2025-01-08T10:30:00.000Z',
        type: String,
        format: 'date-time'
    }),
    (0, class_validator_1.IsDateString)({}, { message: '最后更新时间格式不正确' }),
    __metadata("design:type", String)
], UpdateChapterWithConflictDto.prototype, "lastKnownUpdatedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '是否强制更新（忽略冲突）',
        default: false,
        type: Boolean
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: '强制更新标志必须是布尔值' }),
    __metadata("design:type", Boolean)
], UpdateChapterWithConflictDto.prototype, "forceUpdate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '冲突解决策略：keep-server(保留服务器)、keep-client(保留客户端)、merge(合并)',
        enum: ['keep-server', 'keep-client', 'merge'],
        example: 'keep-client'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateChapterWithConflictDto.prototype, "conflictStrategy", void 0);


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
exports.MemoryModule = void 0;
const common_1 = __webpack_require__(3);
const memory_controller_1 = __webpack_require__(29);
const memory_service_1 = __webpack_require__(30);
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
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MemoryController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(4);
const guards_1 = __webpack_require__(16);
const memory_service_1 = __webpack_require__(30);
const memory_dto_1 = __webpack_require__(31);
let MemoryController = class MemoryController {
    constructor(memoryService) {
        this.memoryService = memoryService;
    }
    async createMemory(req, dto) {
        return this.memoryService.createMemory(req.user.id, dto);
    }
    async getMemories(req, novelId, query) {
        return this.memoryService.getMemories(req.user.id, novelId, query);
    }
    async getMemory(req, id) {
        return this.memoryService.getMemory(req.user.id, id);
    }
    async updateMemory(req, id, dto) {
        return this.memoryService.updateMemory(req.user.id, id, dto);
    }
    async deleteMemory(req, id) {
        return this.memoryService.deleteMemory(req.user.id, id);
    }
    async extractMemories(req, dto) {
        return this.memoryService.extractMemories(req.user.id, dto);
    }
    async updateImportance(req, id, dto) {
        return this.memoryService.updateImportance(req.user.id, id, dto.importance);
    }
    async searchMemories(req, novelId, keywords) {
        const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k);
        return this.memoryService.searchMemories(req.user.id, novelId, keywordArray);
    }
    async getMemoryStats(req, novelId) {
        return this.memoryService.getMemoryStats(req.user.id, novelId);
    }
};
exports.MemoryController = MemoryController;
__decorate([
    (0, common_1.Post)('memories'),
    (0, swagger_1.ApiOperation)({
        summary: '创建记忆',
        description: '为小说创建新的记忆条目'
    }),
    (0, swagger_1.ApiBody)({ type: memory_dto_1.CreateMemoryDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: '记忆创建成功',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        novelId: { type: 'string' },
                        memoryType: { type: 'string', example: 'CORE' },
                        content: { type: 'object' },
                        importance: { type: 'number', example: 0.8 },
                        chapterRange: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '参数验证失败' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '未授权访问' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '小说不存在' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_b = typeof memory_dto_1.CreateMemoryDto !== "undefined" && memory_dto_1.CreateMemoryDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "createMemory", null);
__decorate([
    (0, common_1.Get)('memories/novel/:novelId'),
    (0, swagger_1.ApiOperation)({
        summary: '获取小说记忆列表',
        description: '获取指定小说的所有记忆，支持筛选和分页'
    }),
    (0, swagger_1.ApiParam)({ name: 'novelId', description: '小说ID' }),
    (0, swagger_1.ApiQuery)({ name: 'memoryType', required: false, description: '记忆类型' }),
    (0, swagger_1.ApiQuery)({ name: 'keyword', required: false, description: '关键词搜索' }),
    (0, swagger_1.ApiQuery)({ name: 'minImportance', required: false, description: '最小重要性' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: '页码' }),
    (0, swagger_1.ApiQuery)({ name: 'pageSize', required: false, description: '每页数量' }),
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
                        items: {
                            type: 'array',
                            items: {
                                type: 'object'
                            }
                        },
                        pagination: {
                            type: 'object',
                            properties: {
                                page: { type: 'number' },
                                pageSize: { type: 'number' },
                                total: { type: 'number' },
                                totalPages: { type: 'number' }
                            }
                        }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '未授权访问' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '小说不存在' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('novelId')),
    __param(2, (0, common_1.Query)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, typeof (_c = typeof memory_dto_1.QueryMemoriesDto !== "undefined" && memory_dto_1.QueryMemoriesDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "getMemories", null);
__decorate([
    (0, common_1.Get)('memories/:id'),
    (0, swagger_1.ApiOperation)({
        summary: '获取单个记忆',
        description: '获取指定ID的记忆详情'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '记忆ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取成功'
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '未授权访问' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '无权访问' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '记忆不存在' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "getMemory", null);
__decorate([
    (0, common_1.Put)('memories/:id'),
    (0, swagger_1.ApiOperation)({
        summary: '更新记忆',
        description: '更新指定记忆的内容和属性'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '记忆ID' }),
    (0, swagger_1.ApiBody)({ type: memory_dto_1.UpdateMemoryDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '更新成功'
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '参数验证失败' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '未授权访问' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '无权修改' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '记忆不存在' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, typeof (_d = typeof memory_dto_1.UpdateMemoryDto !== "undefined" && memory_dto_1.UpdateMemoryDto) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "updateMemory", null);
__decorate([
    (0, common_1.Delete)('memories/:id'),
    (0, swagger_1.ApiOperation)({
        summary: '删除记忆',
        description: '删除指定的记忆条目'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '记忆ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '删除成功'
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '未授权访问' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '无权删除' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '记忆不存在' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "deleteMemory", null);
__decorate([
    (0, common_1.Post)('memories/extract'),
    (0, swagger_1.ApiOperation)({
        summary: '智能提取记忆',
        description: '从指定章节中自动提取核心记忆'
    }),
    (0, swagger_1.ApiBody)({ type: memory_dto_1.ExtractMemoriesDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: '提取成功',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        extracted: { type: 'number', example: 5 },
                        memories: {
                            type: 'array',
                            items: { type: 'object' }
                        }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '参数验证失败' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '未授权访问' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '小说或章节不存在' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_e = typeof memory_dto_1.ExtractMemoriesDto !== "undefined" && memory_dto_1.ExtractMemoriesDto) === "function" ? _e : Object]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "extractMemories", null);
__decorate([
    (0, common_1.Post)('memories/:id/score'),
    (0, swagger_1.ApiOperation)({
        summary: '更新记忆重要性',
        description: '更新记忆的重要性评分'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '记忆ID' }),
    (0, swagger_1.ApiBody)({ type: memory_dto_1.ScoreMemoryDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '评分更新成功'
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '参数验证失败' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '未授权访问' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '记忆不存在' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, typeof (_f = typeof memory_dto_1.ScoreMemoryDto !== "undefined" && memory_dto_1.ScoreMemoryDto) === "function" ? _f : Object]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "updateImportance", null);
__decorate([
    (0, common_1.Get)('memories/novel/:novelId/search'),
    (0, swagger_1.ApiOperation)({
        summary: '搜索相关记忆',
        description: '根据关键词搜索相关记忆，按相关性排序'
    }),
    (0, swagger_1.ApiParam)({ name: 'novelId', description: '小说ID' }),
    (0, swagger_1.ApiQuery)({
        name: 'keywords',
        required: true,
        description: '搜索关键词（逗号分隔）',
        example: '主角,背景,设定'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '搜索成功',
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
                            content: { type: 'object' },
                            importance: { type: 'number' },
                            relevanceScore: { type: 'number', example: 15.6 }
                        }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '未授权访问' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '小说不存在' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('novelId')),
    __param(2, (0, common_1.Query)('keywords')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "searchMemories", null);
__decorate([
    (0, common_1.Get)('memories/novel/:novelId/stats'),
    (0, swagger_1.ApiOperation)({
        summary: '获取记忆统计',
        description: '获取小说记忆的统计信息'
    }),
    (0, swagger_1.ApiParam)({ name: 'novelId', description: '小说ID' }),
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
                        total: { type: 'number', example: 42 },
                        byType: {
                            type: 'object',
                            properties: {
                                CORE: { type: 'number' },
                                SUMMARY: { type: 'number' },
                                CONTEXT: { type: 'number' }
                            }
                        },
                        averageImportance: { type: 'number', example: 0.73 }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '未授权访问' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '小说不存在' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('novelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "getMemoryStats", null);
exports.MemoryController = MemoryController = __decorate([
    (0, swagger_1.ApiTags)('记忆管理'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)(),
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
exports.MemoryService = void 0;
const common_1 = __webpack_require__(3);
const database_1 = __webpack_require__(9);
const client_1 = __webpack_require__(12);
let MemoryService = class MemoryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createMemory(userId, dto) {
        const novel = await this.prisma.novel.findFirst({
            where: {
                id: dto.novelId,
                userId,
            },
        });
        if (!novel) {
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.NOT_FOUND,
                message: '小说不存在或无权访问',
                error: 'NOVEL_NOT_FOUND',
            }, common_1.HttpStatus.NOT_FOUND);
        }
        const memory = await this.prisma.novelMemory.create({
            data: {
                novelId: dto.novelId,
                memoryType: dto.memoryType,
                content: dto.content,
                importance: dto.importance !== undefined ? dto.importance : 0.5,
                chapterRange: dto.chapterRange,
            },
        });
        return {
            success: true,
            data: this.formatMemory(memory),
        };
    }
    async getMemories(userId, novelId, query) {
        await this.validateNovelAccess(userId, novelId);
        const where = {
            novelId,
        };
        if (query.memoryType) {
            where.memoryType = query.memoryType;
        }
        if (query.minImportance !== undefined) {
            where.importance = {
                gte: query.minImportance,
            };
        }
        if (query.keyword) {
            where.OR = [
                {
                    content: {
                        path: 'title',
                        string_contains: query.keyword,
                    },
                },
                {
                    content: {
                        path: 'description',
                        string_contains: query.keyword,
                    },
                },
            ];
        }
        const page = query.page || 1;
        const pageSize = query.pageSize || 20;
        const skip = (page - 1) * pageSize;
        const [memories, total] = await Promise.all([
            this.prisma.novelMemory.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: [
                    { importance: 'desc' },
                    { updatedAt: 'desc' },
                ],
            }),
            this.prisma.novelMemory.count({ where }),
        ]);
        return {
            success: true,
            data: {
                items: memories.map(m => this.formatMemory(m)),
                pagination: {
                    page,
                    pageSize,
                    total,
                    totalPages: Math.ceil(total / pageSize),
                },
            },
        };
    }
    async getMemory(userId, memoryId) {
        const memory = await this.prisma.novelMemory.findUnique({
            where: { id: memoryId },
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
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.NOT_FOUND,
                message: '记忆不存在',
                error: 'MEMORY_NOT_FOUND',
            }, common_1.HttpStatus.NOT_FOUND);
        }
        if (memory.novel.userId !== userId) {
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.FORBIDDEN,
                message: '无权访问此记忆',
                error: 'FORBIDDEN',
            }, common_1.HttpStatus.FORBIDDEN);
        }
        return {
            success: true,
            data: this.formatMemory(memory),
        };
    }
    async updateMemory(userId, memoryId, dto) {
        const existing = await this.prisma.novelMemory.findUnique({
            where: { id: memoryId },
            include: {
                novel: {
                    select: {
                        userId: true,
                    },
                },
            },
        });
        if (!existing) {
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.NOT_FOUND,
                message: '记忆不存在',
                error: 'MEMORY_NOT_FOUND',
            }, common_1.HttpStatus.NOT_FOUND);
        }
        if (existing.novel.userId !== userId) {
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.FORBIDDEN,
                message: '无权修改此记忆',
                error: 'FORBIDDEN',
            }, common_1.HttpStatus.FORBIDDEN);
        }
        const memory = await this.prisma.novelMemory.update({
            where: { id: memoryId },
            data: {
                memoryType: dto.memoryType,
                content: dto.content,
                importance: dto.importance,
                chapterRange: dto.chapterRange,
            },
        });
        return {
            success: true,
            data: this.formatMemory(memory),
        };
    }
    async deleteMemory(userId, memoryId) {
        const existing = await this.prisma.novelMemory.findUnique({
            where: { id: memoryId },
            include: {
                novel: {
                    select: {
                        userId: true,
                    },
                },
            },
        });
        if (!existing) {
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.NOT_FOUND,
                message: '记忆不存在',
                error: 'MEMORY_NOT_FOUND',
            }, common_1.HttpStatus.NOT_FOUND);
        }
        if (existing.novel.userId !== userId) {
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.FORBIDDEN,
                message: '无权删除此记忆',
                error: 'FORBIDDEN',
            }, common_1.HttpStatus.FORBIDDEN);
        }
        await this.prisma.novelMemory.delete({
            where: { id: memoryId },
        });
        return {
            success: true,
            message: '记忆已删除',
        };
    }
    async extractMemories(userId, dto) {
        await this.validateNovelAccess(userId, dto.novelId);
        const chapters = await this.prisma.chapter.findMany({
            where: {
                id: {
                    in: dto.chapterIds,
                },
                novelId: dto.novelId,
                isDeleted: false,
            },
            select: {
                id: true,
                title: true,
                content: true,
                orderNum: true,
            },
            orderBy: {
                orderNum: 'asc',
            },
        });
        if (chapters.length === 0) {
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.NOT_FOUND,
                message: '未找到指定的章节',
                error: 'CHAPTERS_NOT_FOUND',
            }, common_1.HttpStatus.NOT_FOUND);
        }
        const extractedMemories = await this.extractMemoriesFromChapters(chapters, dto.extractType || client_1.MemoryType.CORE);
        const createdMemories = await Promise.all(extractedMemories.map(memory => this.prisma.novelMemory.create({
            data: {
                novelId: dto.novelId,
                memoryType: memory.memoryType,
                content: memory.content,
                importance: memory.importance,
                chapterRange: memory.chapterRange,
            },
        })));
        return {
            success: true,
            data: {
                extracted: createdMemories.length,
                memories: createdMemories.map(m => this.formatMemory(m)),
            },
        };
    }
    async updateImportance(userId, memoryId, importance) {
        const existing = await this.prisma.novelMemory.findUnique({
            where: { id: memoryId },
            include: {
                novel: {
                    select: {
                        userId: true,
                    },
                },
            },
        });
        if (!existing) {
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.NOT_FOUND,
                message: '记忆不存在',
                error: 'MEMORY_NOT_FOUND',
            }, common_1.HttpStatus.NOT_FOUND);
        }
        if (existing.novel.userId !== userId) {
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.FORBIDDEN,
                message: '无权修改此记忆',
                error: 'FORBIDDEN',
            }, common_1.HttpStatus.FORBIDDEN);
        }
        const memory = await this.prisma.novelMemory.update({
            where: { id: memoryId },
            data: {
                importance,
            },
        });
        return {
            success: true,
            data: this.formatMemory(memory),
        };
    }
    async searchMemories(userId, novelId, keywords) {
        await this.validateNovelAccess(userId, novelId);
        const memories = await this.prisma.novelMemory.findMany({
            where: {
                novelId,
            },
            orderBy: [
                { importance: 'desc' },
                { updatedAt: 'desc' },
            ],
        });
        const scoredMemories = memories.map(memory => {
            const score = this.calculateRelevanceScore(memory, keywords);
            return {
                ...this.formatMemory(memory),
                relevanceScore: score,
            };
        });
        scoredMemories.sort((a, b) => b.relevanceScore - a.relevanceScore);
        return {
            success: true,
            data: scoredMemories.filter(m => m.relevanceScore > 0),
        };
    }
    async getMemoryStats(userId, novelId) {
        await this.validateNovelAccess(userId, novelId);
        const [total, byType, avgImportance] = await Promise.all([
            this.prisma.novelMemory.count({
                where: { novelId },
            }),
            this.prisma.novelMemory.groupBy({
                by: ['memoryType'],
                where: { novelId },
                _count: true,
            }),
            this.prisma.novelMemory.aggregate({
                where: { novelId },
                _avg: {
                    importance: true,
                },
            }),
        ]);
        return {
            success: true,
            data: {
                total,
                byType: byType.reduce((acc, item) => {
                    acc[item.memoryType] = item._count;
                    return acc;
                }, {}),
                averageImportance: avgImportance._avg.importance || 0,
            },
        };
    }
    async validateNovelAccess(userId, novelId) {
        const novel = await this.prisma.novel.findFirst({
            where: {
                id: novelId,
                userId,
            },
        });
        if (!novel) {
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.NOT_FOUND,
                message: '小说不存在或无权访问',
                error: 'NOVEL_NOT_FOUND',
            }, common_1.HttpStatus.NOT_FOUND);
        }
        return novel;
    }
    async extractMemoriesFromChapters(chapters, extractType) {
        const memories = [];
        for (const chapter of chapters) {
            const content = chapter.content || '';
            const summary = content.slice(0, 500);
            const keywords = this.extractKeywords(content);
            memories.push({
                memoryType: extractType,
                content: {
                    title: `${chapter.title} - 核心记忆`,
                    description: summary,
                    keywords,
                    source: chapter.title,
                },
                importance: 0.7,
                chapterRange: chapter.orderNum.toString(),
            });
        }
        return memories;
    }
    extractKeywords(text) {
        const cleanText = text.replace(/[，。！？；：""''（）【】《》、]/g, ' ');
        const words = cleanText.split(/\s+/).filter(w => w.length > 1);
        const wordCount = words.reduce((acc, word) => {
            acc[word] = (acc[word] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(wordCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([word]) => word);
    }
    calculateRelevanceScore(memory, keywords) {
        if (!keywords || keywords.length === 0) {
            return 0;
        }
        const content = JSON.stringify(memory.content).toLowerCase();
        let score = 0;
        for (const keyword of keywords) {
            const lowerKeyword = keyword.toLowerCase();
            const occurrences = (content.match(new RegExp(lowerKeyword, 'g')) || []).length;
            score += occurrences;
        }
        const importanceWeight = parseFloat(memory.importance.toString());
        score = score * (1 + importanceWeight);
        return score;
    }
    formatMemory(memory) {
        return {
            id: memory.id,
            novelId: memory.novelId,
            memoryType: memory.memoryType,
            content: memory.content,
            importance: parseFloat(memory.importance.toString()),
            chapterRange: memory.chapterRange,
            tokenCost: memory.tokenCost,
            createdAt: memory.createdAt,
            updatedAt: memory.updatedAt,
        };
    }
};
exports.MemoryService = MemoryService;
exports.MemoryService = MemoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], MemoryService);


/***/ }),
/* 31 */
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
exports.ScoreMemoryDto = exports.ExtractMemoriesDto = exports.QueryMemoriesDto = exports.UpdateMemoryDto = exports.CreateMemoryDto = void 0;
const class_validator_1 = __webpack_require__(20);
const swagger_1 = __webpack_require__(4);
const client_1 = __webpack_require__(12);
const class_transformer_1 = __webpack_require__(32);
class CreateMemoryDto {
}
exports.CreateMemoryDto = CreateMemoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '小说ID',
        example: 'cm1234567890'
    }),
    (0, class_validator_1.IsString)({ message: '小说ID必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: '小说ID不能为空' }),
    __metadata("design:type", String)
], CreateMemoryDto.prototype, "novelId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '记忆类型',
        enum: client_1.MemoryType,
        example: 'CORE'
    }),
    (0, class_validator_1.IsEnum)(client_1.MemoryType, { message: '记忆类型无效' }),
    __metadata("design:type", typeof (_a = typeof client_1.MemoryType !== "undefined" && client_1.MemoryType) === "function" ? _a : Object)
], CreateMemoryDto.prototype, "memoryType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '记忆内容（JSON格式）',
        example: {
            title: '主角背景设定',
            description: '主角出生在一个小村庄...',
            tags: ['主角', '背景']
        }
    }),
    (0, class_validator_1.IsObject)({ message: '内容必须是对象' }),
    __metadata("design:type", typeof (_b = typeof Record !== "undefined" && Record) === "function" ? _b : Object)
], CreateMemoryDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '重要性评分（0-1）',
        example: 0.8,
        minimum: 0,
        maximum: 1
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: '重要性必须是数字' }),
    (0, class_validator_1.Min)(0, { message: '重要性不能小于0' }),
    (0, class_validator_1.Max)(1, { message: '重要性不能大于1' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateMemoryDto.prototype, "importance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '章节范围（如：1-5）',
        example: '1-5'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '章节范围必须是字符串' }),
    __metadata("design:type", String)
], CreateMemoryDto.prototype, "chapterRange", void 0);
class UpdateMemoryDto {
}
exports.UpdateMemoryDto = UpdateMemoryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '记忆类型',
        enum: client_1.MemoryType
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.MemoryType, { message: '记忆类型无效' }),
    __metadata("design:type", typeof (_c = typeof client_1.MemoryType !== "undefined" && client_1.MemoryType) === "function" ? _c : Object)
], UpdateMemoryDto.prototype, "memoryType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '记忆内容（JSON格式）'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)({ message: '内容必须是对象' }),
    __metadata("design:type", typeof (_d = typeof Record !== "undefined" && Record) === "function" ? _d : Object)
], UpdateMemoryDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '重要性评分（0-1）',
        minimum: 0,
        maximum: 1
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: '重要性必须是数字' }),
    (0, class_validator_1.Min)(0, { message: '重要性不能小于0' }),
    (0, class_validator_1.Max)(1, { message: '重要性不能大于1' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateMemoryDto.prototype, "importance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '章节范围'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '章节范围必须是字符串' }),
    __metadata("design:type", String)
], UpdateMemoryDto.prototype, "chapterRange", void 0);
class QueryMemoriesDto {
    constructor() {
        this.page = 1;
        this.pageSize = 20;
    }
}
exports.QueryMemoriesDto = QueryMemoriesDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '记忆类型筛选',
        enum: client_1.MemoryType
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.MemoryType, { message: '记忆类型无效' }),
    __metadata("design:type", typeof (_e = typeof client_1.MemoryType !== "undefined" && client_1.MemoryType) === "function" ? _e : Object)
], QueryMemoriesDto.prototype, "memoryType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '关键词搜索'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '关键词必须是字符串' }),
    __metadata("design:type", String)
], QueryMemoriesDto.prototype, "keyword", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '最小重要性',
        minimum: 0,
        maximum: 1
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: '最小重要性必须是数字' }),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryMemoriesDto.prototype, "minImportance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '页码',
        example: 1,
        minimum: 1
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: '页码必须是数字' }),
    (0, class_validator_1.Min)(1, { message: '页码不能小于1' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryMemoriesDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '每页数量',
        example: 20,
        minimum: 1,
        maximum: 100
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: '每页数量必须是数字' }),
    (0, class_validator_1.Min)(1, { message: '每页数量不能小于1' }),
    (0, class_validator_1.Max)(100, { message: '每页数量不能大于100' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryMemoriesDto.prototype, "pageSize", void 0);
class ExtractMemoriesDto {
}
exports.ExtractMemoriesDto = ExtractMemoriesDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '小说ID',
        example: 'cm1234567890'
    }),
    (0, class_validator_1.IsString)({ message: '小说ID必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: '小说ID不能为空' }),
    __metadata("design:type", String)
], ExtractMemoriesDto.prototype, "novelId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '章节ID列表',
        example: ['cm111', 'cm222']
    }),
    (0, class_validator_1.IsString)({ each: true, message: '章节ID必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: '章节ID列表不能为空' }),
    __metadata("design:type", Array)
], ExtractMemoriesDto.prototype, "chapterIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '提取类型',
        enum: client_1.MemoryType
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.MemoryType),
    __metadata("design:type", typeof (_f = typeof client_1.MemoryType !== "undefined" && client_1.MemoryType) === "function" ? _f : Object)
], ExtractMemoriesDto.prototype, "extractType", void 0);
class ScoreMemoryDto {
}
exports.ScoreMemoryDto = ScoreMemoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '记忆ID',
        example: 'cm1234567890'
    }),
    (0, class_validator_1.IsString)({ message: '记忆ID必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: '记忆ID不能为空' }),
    __metadata("design:type", String)
], ScoreMemoryDto.prototype, "memoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '新的重要性评分',
        example: 0.9,
        minimum: 0,
        maximum: 1
    }),
    (0, class_validator_1.IsNumber)({}, { message: '评分必须是数字' }),
    (0, class_validator_1.Min)(0, { message: '评分不能小于0' }),
    (0, class_validator_1.Max)(1, { message: '评分不能大于1' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], ScoreMemoryDto.prototype, "importance", void 0);


/***/ }),
/* 32 */
/***/ ((module) => {

module.exports = require("class-transformer");

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
exports.SuggestionModule = void 0;
const common_1 = __webpack_require__(3);
const suggestion_controller_1 = __webpack_require__(34);
const suggestion_service_1 = __webpack_require__(35);
let SuggestionModule = class SuggestionModule {
};
exports.SuggestionModule = SuggestionModule;
exports.SuggestionModule = SuggestionModule = __decorate([
    (0, common_1.Module)({
        controllers: [suggestion_controller_1.SuggestionController],
        providers: [suggestion_service_1.SuggestionService],
        exports: [suggestion_service_1.SuggestionService],
    })
], SuggestionModule);


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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SuggestionController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(4);
const guards_1 = __webpack_require__(16);
const suggestion_service_1 = __webpack_require__(35);
const suggestion_dto_1 = __webpack_require__(36);
let SuggestionController = class SuggestionController {
    constructor(suggestionService) {
        this.suggestionService = suggestionService;
    }
    async createSuggestion(req, dto) {
        return this.suggestionService.createSuggestion(req.user.id, dto);
    }
    async generateSuggestions(req, dto) {
        return this.suggestionService.generateSuggestions(req.user.id, dto);
    }
    async getSuggestions(req, novelId, query) {
        return this.suggestionService.getSuggestions(req.user.id, novelId, query);
    }
    async getSuggestion(req, id) {
        return this.suggestionService.getSuggestion(req.user.id, id);
    }
    async adoptSuggestion(req, dto) {
        return this.suggestionService.adoptSuggestion(req.user.id, dto);
    }
    async rateSuggestion(req, dto) {
        return this.suggestionService.rateSuggestion(req.user.id, dto);
    }
    async deleteSuggestion(req, id) {
        return this.suggestionService.deleteSuggestion(req.user.id, id);
    }
    async bulkDeleteSuggestions(req, novelId, dto) {
        return this.suggestionService.bulkDeleteSuggestions(req.user.id, novelId, dto.suggestionIds);
    }
    async getSuggestionStats(req, novelId) {
        return this.suggestionService.getSuggestionStats(req.user.id, novelId);
    }
};
exports.SuggestionController = SuggestionController;
__decorate([
    (0, common_1.Post)('suggestions'),
    (0, swagger_1.ApiOperation)({
        summary: '创建写作建议',
        description: '手动创建一条写作建议'
    }),
    (0, swagger_1.ApiBody)({ type: suggestion_dto_1.CreateSuggestionDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: '建议创建成功',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        title: { type: 'string' },
                        content: { type: 'string' },
                        dimension: { type: 'string', example: 'PLOT' },
                        priority: { type: 'number', example: 75 }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '参数验证失败' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '未授权访问' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '小说不存在' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_b = typeof suggestion_dto_1.CreateSuggestionDto !== "undefined" && suggestion_dto_1.CreateSuggestionDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], SuggestionController.prototype, "createSuggestion", null);
__decorate([
    (0, common_1.Post)('suggestions/generate'),
    (0, swagger_1.ApiOperation)({
        summary: 'AI生成写作建议',
        description: '使用AI分析小说内容并生成多维度的写作建议'
    }),
    (0, swagger_1.ApiBody)({ type: suggestion_dto_1.GenerateSuggestionsDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: '建议生成成功',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        generated: { type: 'number', example: 5 },
                        suggestions: {
                            type: 'array',
                            items: { type: 'object' }
                        }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '参数验证失败' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '未授权访问' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '小说不存在' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_c = typeof suggestion_dto_1.GenerateSuggestionsDto !== "undefined" && suggestion_dto_1.GenerateSuggestionsDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], SuggestionController.prototype, "generateSuggestions", null);
__decorate([
    (0, common_1.Get)('suggestions/novel/:novelId'),
    (0, swagger_1.ApiOperation)({
        summary: '获取小说的建议列表',
        description: '获取指定小说的所有写作建议，支持筛选和分页'
    }),
    (0, swagger_1.ApiParam)({ name: 'novelId', description: '小说ID' }),
    (0, swagger_1.ApiQuery)({ name: 'suggestionType', required: false, description: '建议类型' }),
    (0, swagger_1.ApiQuery)({ name: 'dimension', required: false, description: '建议维度' }),
    (0, swagger_1.ApiQuery)({ name: 'onlyPending', required: false, description: '只显示未采纳' }),
    (0, swagger_1.ApiQuery)({ name: 'minPriority', required: false, description: '最小优先级' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: '页码' }),
    (0, swagger_1.ApiQuery)({ name: 'pageSize', required: false, description: '每页数量' }),
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
                        items: {
                            type: 'array',
                            items: { type: 'object' }
                        },
                        pagination: {
                            type: 'object',
                            properties: {
                                page: { type: 'number' },
                                pageSize: { type: 'number' },
                                total: { type: 'number' },
                                totalPages: { type: 'number' }
                            }
                        }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '未授权访问' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '小说不存在' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('novelId')),
    __param(2, (0, common_1.Query)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, typeof (_d = typeof suggestion_dto_1.QuerySuggestionsDto !== "undefined" && suggestion_dto_1.QuerySuggestionsDto) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], SuggestionController.prototype, "getSuggestions", null);
__decorate([
    (0, common_1.Get)('suggestions/:id'),
    (0, swagger_1.ApiOperation)({
        summary: '获取单个建议',
        description: '获取指定ID的建议详情'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '建议ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取成功'
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '未授权访问' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '无权访问' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '建议不存在' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SuggestionController.prototype, "getSuggestion", null);
__decorate([
    (0, common_1.Post)('suggestions/adopt'),
    (0, swagger_1.ApiOperation)({
        summary: '采纳建议',
        description: '标记建议为已采纳，并可以提供反馈和评分'
    }),
    (0, swagger_1.ApiBody)({ type: suggestion_dto_1.AdoptSuggestionDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '采纳成功'
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '参数验证失败' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '未授权访问' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '建议不存在' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_e = typeof suggestion_dto_1.AdoptSuggestionDto !== "undefined" && suggestion_dto_1.AdoptSuggestionDto) === "function" ? _e : Object]),
    __metadata("design:returntype", Promise)
], SuggestionController.prototype, "adoptSuggestion", null);
__decorate([
    (0, common_1.Post)('suggestions/rate'),
    (0, swagger_1.ApiOperation)({
        summary: '评价建议',
        description: '对建议进行评分和反馈'
    }),
    (0, swagger_1.ApiBody)({ type: suggestion_dto_1.RateSuggestionDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '评价成功'
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '参数验证失败' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '未授权访问' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '建议不存在' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_f = typeof suggestion_dto_1.RateSuggestionDto !== "undefined" && suggestion_dto_1.RateSuggestionDto) === "function" ? _f : Object]),
    __metadata("design:returntype", Promise)
], SuggestionController.prototype, "rateSuggestion", null);
__decorate([
    (0, common_1.Delete)('suggestions/:id'),
    (0, swagger_1.ApiOperation)({
        summary: '删除建议',
        description: '删除指定的建议'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '建议ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '删除成功'
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '未授权访问' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '无权删除' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '建议不存在' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SuggestionController.prototype, "deleteSuggestion", null);
__decorate([
    (0, common_1.Post)('suggestions/novel/:novelId/bulk-delete'),
    (0, swagger_1.ApiOperation)({
        summary: '批量删除建议',
        description: '批量删除指定小说的多条建议'
    }),
    (0, swagger_1.ApiParam)({ name: 'novelId', description: '小说ID' }),
    (0, swagger_1.ApiBody)({ type: suggestion_dto_1.BulkSuggestionDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '批量删除成功',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        deleted: { type: 'number', example: 5 }
                    }
                },
                message: { type: 'string', example: '成功删除5条建议' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '参数验证失败' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '未授权访问' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '小说不存在' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('novelId')),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, typeof (_g = typeof suggestion_dto_1.BulkSuggestionDto !== "undefined" && suggestion_dto_1.BulkSuggestionDto) === "function" ? _g : Object]),
    __metadata("design:returntype", Promise)
], SuggestionController.prototype, "bulkDeleteSuggestions", null);
__decorate([
    (0, common_1.Get)('suggestions/novel/:novelId/stats'),
    (0, swagger_1.ApiOperation)({
        summary: '获取建议统计',
        description: '获取小说建议的统计信息'
    }),
    (0, swagger_1.ApiParam)({ name: 'novelId', description: '小说ID' }),
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
                        total: { type: 'number', example: 42 },
                        adopted: { type: 'number', example: 15 },
                        pending: { type: 'number', example: 27 },
                        adoptionRate: { type: 'string', example: '35.71%' },
                        byDimension: {
                            type: 'object',
                            properties: {
                                PLOT: { type: 'number' },
                                CHARACTER: { type: 'number' },
                                PACING: { type: 'number' }
                            }
                        },
                        averageRating: { type: 'number', example: 4.2 }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '未授权访问' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '小说不存在' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('novelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SuggestionController.prototype, "getSuggestionStats", null);
exports.SuggestionController = SuggestionController = __decorate([
    (0, swagger_1.ApiTags)('写作建议'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof suggestion_service_1.SuggestionService !== "undefined" && suggestion_service_1.SuggestionService) === "function" ? _a : Object])
], SuggestionController);


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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SuggestionService = void 0;
const common_1 = __webpack_require__(3);
const database_1 = __webpack_require__(9);
const client_1 = __webpack_require__(12);
let SuggestionService = class SuggestionService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createSuggestion(userId, dto) {
        await this.validateNovelAccess(userId, dto.novelId);
        if (dto.chapterId) {
            await this.validateChapterAccess(userId, dto.chapterId, dto.novelId);
        }
        const suggestion = await this.prisma.writingSuggestion.create({
            data: {
                novelId: dto.novelId,
                chapterId: dto.chapterId,
                userId,
                suggestionType: dto.suggestionType,
                dimension: dto.dimension,
                title: dto.title,
                content: dto.content,
                priority: dto.priority || 50,
                context: dto.context,
            },
        });
        return {
            success: true,
            data: this.formatSuggestion(suggestion),
        };
    }
    async generateSuggestions(userId, dto) {
        const novel = await this.validateNovelAccess(userId, dto.novelId);
        let chapters = [];
        if (dto.chapterIds && dto.chapterIds.length > 0) {
            chapters = await this.prisma.chapter.findMany({
                where: {
                    id: { in: dto.chapterIds },
                    novelId: dto.novelId,
                    isDeleted: false,
                },
                select: {
                    id: true,
                    title: true,
                    content: true,
                    wordCount: true,
                    chapterNumber: true,
                },
                orderBy: {
                    chapterNumber: 'asc',
                },
            });
        }
        else {
            chapters = await this.prisma.chapter.findMany({
                where: {
                    novelId: dto.novelId,
                    isDeleted: false,
                },
                select: {
                    id: true,
                    title: true,
                    content: true,
                    wordCount: true,
                    chapterNumber: true,
                },
                orderBy: {
                    chapterNumber: 'desc',
                },
                take: 5,
            });
        }
        const generatedSuggestions = await this.generateSuggestionsForNovel(novel, chapters, dto.dimensions, dto.count || 5);
        const savedSuggestions = await Promise.all(generatedSuggestions.map(suggestion => this.prisma.writingSuggestion.create({
            data: {
                novelId: dto.novelId,
                userId,
                suggestionType: client_1.SuggestionType.AUTO,
                dimension: suggestion.dimension,
                title: suggestion.title,
                content: suggestion.content,
                priority: suggestion.priority,
                context: suggestion.context,
                aiModel: 'analysis-engine-v1',
            },
        })));
        return {
            success: true,
            data: {
                generated: savedSuggestions.length,
                suggestions: savedSuggestions.map(s => this.formatSuggestion(s)),
            },
        };
    }
    async getSuggestions(userId, novelId, query) {
        await this.validateNovelAccess(userId, novelId);
        const where = {
            novelId,
            userId,
        };
        if (query.suggestionType) {
            where.suggestionType = query.suggestionType;
        }
        if (query.dimension) {
            where.dimension = query.dimension;
        }
        if (query.onlyPending) {
            where.isAdopted = false;
        }
        if (query.minPriority !== undefined) {
            where.priority = {
                gte: query.minPriority,
            };
        }
        const page = query.page || 1;
        const pageSize = query.pageSize || 20;
        const skip = (page - 1) * pageSize;
        const [suggestions, total] = await Promise.all([
            this.prisma.writingSuggestion.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: [
                    { priority: 'desc' },
                    { createdAt: 'desc' },
                ],
                include: {
                    chapter: {
                        select: {
                            id: true,
                            title: true,
                            chapterNumber: true,
                        },
                    },
                },
            }),
            this.prisma.writingSuggestion.count({ where }),
        ]);
        return {
            success: true,
            data: {
                items: suggestions.map(s => this.formatSuggestion(s)),
                pagination: {
                    page,
                    pageSize,
                    total,
                    totalPages: Math.ceil(total / pageSize),
                },
            },
        };
    }
    async getSuggestion(userId, suggestionId) {
        const suggestion = await this.prisma.writingSuggestion.findUnique({
            where: { id: suggestionId },
            include: {
                novel: {
                    select: {
                        id: true,
                        title: true,
                        userId: true,
                    },
                },
                chapter: {
                    select: {
                        id: true,
                        title: true,
                        chapterNumber: true,
                    },
                },
            },
        });
        if (!suggestion) {
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.NOT_FOUND,
                message: '建议不存在',
                error: 'SUGGESTION_NOT_FOUND',
            }, common_1.HttpStatus.NOT_FOUND);
        }
        if (suggestion.novel.userId !== userId) {
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.FORBIDDEN,
                message: '无权访问此建议',
                error: 'FORBIDDEN',
            }, common_1.HttpStatus.FORBIDDEN);
        }
        return {
            success: true,
            data: this.formatSuggestion(suggestion),
        };
    }
    async adoptSuggestion(userId, dto) {
        const suggestion = await this.prisma.writingSuggestion.findUnique({
            where: { id: dto.suggestionId },
            include: {
                novel: {
                    select: {
                        userId: true,
                    },
                },
            },
        });
        if (!suggestion) {
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.NOT_FOUND,
                message: '建议不存在',
                error: 'SUGGESTION_NOT_FOUND',
            }, common_1.HttpStatus.NOT_FOUND);
        }
        if (suggestion.novel.userId !== userId) {
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.FORBIDDEN,
                message: '无权操作此建议',
                error: 'FORBIDDEN',
            }, common_1.HttpStatus.FORBIDDEN);
        }
        const updated = await this.prisma.writingSuggestion.update({
            where: { id: dto.suggestionId },
            data: {
                isAdopted: true,
                adoptedAt: new Date(),
                feedback: dto.feedback,
                rating: dto.rating,
            },
        });
        return {
            success: true,
            data: this.formatSuggestion(updated),
            message: '建议已采纳',
        };
    }
    async rateSuggestion(userId, dto) {
        const suggestion = await this.prisma.writingSuggestion.findUnique({
            where: { id: dto.suggestionId },
            include: {
                novel: {
                    select: {
                        userId: true,
                    },
                },
            },
        });
        if (!suggestion) {
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.NOT_FOUND,
                message: '建议不存在',
                error: 'SUGGESTION_NOT_FOUND',
            }, common_1.HttpStatus.NOT_FOUND);
        }
        if (suggestion.novel.userId !== userId) {
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.FORBIDDEN,
                message: '无权操作此建议',
                error: 'FORBIDDEN',
            }, common_1.HttpStatus.FORBIDDEN);
        }
        const updated = await this.prisma.writingSuggestion.update({
            where: { id: dto.suggestionId },
            data: {
                rating: dto.rating,
                feedback: dto.feedback,
            },
        });
        return {
            success: true,
            data: this.formatSuggestion(updated),
            message: '评价已保存',
        };
    }
    async deleteSuggestion(userId, suggestionId) {
        const suggestion = await this.prisma.writingSuggestion.findUnique({
            where: { id: suggestionId },
            include: {
                novel: {
                    select: {
                        userId: true,
                    },
                },
            },
        });
        if (!suggestion) {
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.NOT_FOUND,
                message: '建议不存在',
                error: 'SUGGESTION_NOT_FOUND',
            }, common_1.HttpStatus.NOT_FOUND);
        }
        if (suggestion.novel.userId !== userId) {
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.FORBIDDEN,
                message: '无权删除此建议',
                error: 'FORBIDDEN',
            }, common_1.HttpStatus.FORBIDDEN);
        }
        await this.prisma.writingSuggestion.delete({
            where: { id: suggestionId },
        });
        return {
            success: true,
            message: '建议已删除',
        };
    }
    async bulkDeleteSuggestions(userId, novelId, suggestionIds) {
        await this.validateNovelAccess(userId, novelId);
        const result = await this.prisma.writingSuggestion.deleteMany({
            where: {
                id: { in: suggestionIds },
                novelId,
                userId,
            },
        });
        return {
            success: true,
            data: {
                deleted: result.count,
            },
            message: `成功删除${result.count}条建议`,
        };
    }
    async getSuggestionStats(userId, novelId) {
        await this.validateNovelAccess(userId, novelId);
        const [total, adopted, byDimension, avgRating] = await Promise.all([
            this.prisma.writingSuggestion.count({
                where: { novelId, userId },
            }),
            this.prisma.writingSuggestion.count({
                where: { novelId, userId, isAdopted: true },
            }),
            this.prisma.writingSuggestion.groupBy({
                by: ['dimension'],
                where: { novelId, userId },
                _count: true,
            }),
            this.prisma.writingSuggestion.aggregate({
                where: { novelId, userId, rating: { not: null } },
                _avg: {
                    rating: true,
                },
            }),
        ]);
        return {
            success: true,
            data: {
                total,
                adopted,
                pending: total - adopted,
                adoptionRate: total > 0 ? ((adopted / total) * 100).toFixed(2) + '%' : '0%',
                byDimension: byDimension.reduce((acc, item) => {
                    acc[item.dimension] = item._count;
                    return acc;
                }, {}),
                averageRating: avgRating._avg.rating || 0,
            },
        };
    }
    async validateNovelAccess(userId, novelId) {
        const novel = await this.prisma.novel.findFirst({
            where: {
                id: novelId,
                userId,
            },
        });
        if (!novel) {
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.NOT_FOUND,
                message: '小说不存在或无权访问',
                error: 'NOVEL_NOT_FOUND',
            }, common_1.HttpStatus.NOT_FOUND);
        }
        return novel;
    }
    async validateChapterAccess(userId, chapterId, novelId) {
        const chapter = await this.prisma.chapter.findFirst({
            where: {
                id: chapterId,
                novelId,
                novel: {
                    userId,
                },
            },
        });
        if (!chapter) {
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.NOT_FOUND,
                message: '章节不存在或无权访问',
                error: 'CHAPTER_NOT_FOUND',
            }, common_1.HttpStatus.NOT_FOUND);
        }
        return chapter;
    }
    async generateSuggestionsForNovel(novel, chapters, dimensions, count) {
        const suggestions = [];
        for (const dimension of dimensions) {
            const dimensionSuggestions = await this.generateSuggestionsByDimension(novel, chapters, dimension);
            suggestions.push(...dimensionSuggestions);
            if (suggestions.length >= count) {
                break;
            }
        }
        return suggestions.slice(0, count);
    }
    async generateSuggestionsByDimension(novel, chapters, dimension) {
        const suggestions = [];
        switch (dimension) {
            case client_1.SuggestionDimension.PLOT:
                suggestions.push({
                    dimension,
                    title: '加强故事主线',
                    content: '建议在当前章节中明确故事的核心冲突，增强主线的吸引力。可以考虑引入一个关键的转折点或揭示重要信息。',
                    priority: 80,
                    context: {
                        分析范围: `前${chapters.length}章`,
                        当前字数: novel.wordCount,
                    },
                });
                break;
            case client_1.SuggestionDimension.CHARACTER:
                suggestions.push({
                    dimension,
                    title: '深化角色塑造',
                    content: '主要角色的性格特征可以更加立体。建议通过具体的行为、对话和内心独白来展现角色的复杂性，避免脸谱化。',
                    priority: 75,
                    context: {
                        建议章节: chapters.map(c => c.title).join('、'),
                    },
                });
                break;
            case client_1.SuggestionDimension.PACING:
                suggestions.push({
                    dimension,
                    title: '调整叙事节奏',
                    content: '当前章节的叙事节奏可能略显平缓。建议在关键情节点加快节奏，在情感场景适当放慢，形成张弛有度的节奏感。',
                    priority: 70,
                    context: {
                        分析章节数: chapters.length,
                    },
                });
                break;
            case client_1.SuggestionDimension.DIALOGUE:
                suggestions.push({
                    dimension,
                    title: '优化对话质量',
                    content: '对话可以更加生动自然。建议每个角色的说话方式都要有各自的特点，避免所有角色用同一种语气说话。',
                    priority: 65,
                    context: {},
                });
                break;
            case client_1.SuggestionDimension.SCENE:
                suggestions.push({
                    dimension,
                    title: '丰富场景描写',
                    content: '场景描写可以更具画面感。建议运用五感描写（视觉、听觉、触觉、嗅觉、味觉）来增强场景的真实性和代入感。',
                    priority: 60,
                    context: {},
                });
                break;
            default:
                suggestions.push({
                    dimension,
                    title: `${dimension}相关建议`,
                    content: '建议关注这个维度的表现，可以进一步优化和提升。',
                    priority: 50,
                    context: {},
                });
        }
        return suggestions;
    }
    formatSuggestion(suggestion) {
        return {
            id: suggestion.id,
            novelId: suggestion.novelId,
            chapterId: suggestion.chapterId,
            userId: suggestion.userId,
            suggestionType: suggestion.suggestionType,
            dimension: suggestion.dimension,
            title: suggestion.title,
            content: suggestion.content,
            priority: suggestion.priority,
            context: suggestion.context,
            aiModel: suggestion.aiModel,
            isAdopted: suggestion.isAdopted,
            adoptedAt: suggestion.adoptedAt,
            feedback: suggestion.feedback,
            rating: suggestion.rating,
            chapter: suggestion.chapter,
            createdAt: suggestion.createdAt,
            updatedAt: suggestion.updatedAt,
        };
    }
};
exports.SuggestionService = SuggestionService;
exports.SuggestionService = SuggestionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], SuggestionService);


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
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BulkSuggestionDto = exports.RateSuggestionDto = exports.AdoptSuggestionDto = exports.QuerySuggestionsDto = exports.GenerateSuggestionsDto = exports.CreateSuggestionDto = void 0;
const class_validator_1 = __webpack_require__(20);
const swagger_1 = __webpack_require__(4);
const client_1 = __webpack_require__(12);
const class_transformer_1 = __webpack_require__(32);
class CreateSuggestionDto {
}
exports.CreateSuggestionDto = CreateSuggestionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '小说ID',
        example: 'cm1234567890'
    }),
    (0, class_validator_1.IsString)({ message: '小说ID必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: '小说ID不能为空' }),
    __metadata("design:type", String)
], CreateSuggestionDto.prototype, "novelId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '章节ID（可选，为空表示针对整部小说）',
        example: 'cm1234567890'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '章节ID必须是字符串' }),
    __metadata("design:type", String)
], CreateSuggestionDto.prototype, "chapterId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '建议类型',
        enum: client_1.SuggestionType,
        example: 'REQUESTED'
    }),
    (0, class_validator_1.IsEnum)(client_1.SuggestionType, { message: '建议类型无效' }),
    __metadata("design:type", typeof (_a = typeof client_1.SuggestionType !== "undefined" && client_1.SuggestionType) === "function" ? _a : Object)
], CreateSuggestionDto.prototype, "suggestionType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '建议维度',
        enum: client_1.SuggestionDimension,
        example: 'PLOT'
    }),
    (0, class_validator_1.IsEnum)(client_1.SuggestionDimension, { message: '建议维度无效' }),
    __metadata("design:type", typeof (_b = typeof client_1.SuggestionDimension !== "undefined" && client_1.SuggestionDimension) === "function" ? _b : Object)
], CreateSuggestionDto.prototype, "dimension", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '建议标题',
        example: '加强主线剧情冲突'
    }),
    (0, class_validator_1.IsString)({ message: '标题必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: '标题不能为空' }),
    __metadata("design:type", String)
], CreateSuggestionDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '建议内容',
        example: '当前剧情发展较为平缓，建议在第5章引入更强烈的冲突...'
    }),
    (0, class_validator_1.IsString)({ message: '内容必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: '内容不能为空' }),
    __metadata("design:type", String)
], CreateSuggestionDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '优先级（0-100）',
        example: 75,
        minimum: 0,
        maximum: 100
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: '优先级必须是数字' }),
    (0, class_validator_1.Min)(0, { message: '优先级不能小于0' }),
    (0, class_validator_1.Max)(100, { message: '优先级不能大于100' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateSuggestionDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '上下文信息（JSON格式）',
        example: {
            章节范围: '1-5',
            相关角色: ['主角', '反派']
        }
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)({ message: '上下文必须是对象' }),
    __metadata("design:type", typeof (_c = typeof Record !== "undefined" && Record) === "function" ? _c : Object)
], CreateSuggestionDto.prototype, "context", void 0);
class GenerateSuggestionsDto {
}
exports.GenerateSuggestionsDto = GenerateSuggestionsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '小说ID',
        example: 'cm1234567890'
    }),
    (0, class_validator_1.IsString)({ message: '小说ID必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: '小说ID不能为空' }),
    __metadata("design:type", String)
], GenerateSuggestionsDto.prototype, "novelId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '章节ID列表（为空则分析整部小说）',
        example: ['cm111', 'cm222']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: '章节ID必须是数组' }),
    (0, class_validator_1.IsString)({ each: true, message: '每个章节ID必须是字符串' }),
    __metadata("design:type", Array)
], GenerateSuggestionsDto.prototype, "chapterIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '建议维度列表',
        enum: client_1.SuggestionDimension,
        isArray: true,
        example: ['PLOT', 'CHARACTER', 'PACING']
    }),
    (0, class_validator_1.IsArray)({ message: '建议维度必须是数组' }),
    (0, class_validator_1.IsEnum)(client_1.SuggestionDimension, { each: true, message: '建议维度无效' }),
    __metadata("design:type", Array)
], GenerateSuggestionsDto.prototype, "dimensions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '生成建议数量',
        example: 5,
        minimum: 1,
        maximum: 20
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: '数量必须是数字' }),
    (0, class_validator_1.Min)(1, { message: '数量不能小于1' }),
    (0, class_validator_1.Max)(20, { message: '数量不能大于20' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], GenerateSuggestionsDto.prototype, "count", void 0);
class QuerySuggestionsDto {
    constructor() {
        this.page = 1;
        this.pageSize = 20;
    }
}
exports.QuerySuggestionsDto = QuerySuggestionsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '建议类型筛选',
        enum: client_1.SuggestionType
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.SuggestionType, { message: '建议类型无效' }),
    __metadata("design:type", typeof (_d = typeof client_1.SuggestionType !== "undefined" && client_1.SuggestionType) === "function" ? _d : Object)
], QuerySuggestionsDto.prototype, "suggestionType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '建议维度筛选',
        enum: client_1.SuggestionDimension
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.SuggestionDimension, { message: '建议维度无效' }),
    __metadata("design:type", typeof (_e = typeof client_1.SuggestionDimension !== "undefined" && client_1.SuggestionDimension) === "function" ? _e : Object)
], QuerySuggestionsDto.prototype, "dimension", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '是否只显示未采纳的建议',
        example: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: '必须是布尔值' }),
    (0, class_transformer_1.Type)(() => Boolean),
    __metadata("design:type", Boolean)
], QuerySuggestionsDto.prototype, "onlyPending", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '最小优先级',
        minimum: 0,
        maximum: 100
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: '优先级必须是数字' }),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QuerySuggestionsDto.prototype, "minPriority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '页码',
        example: 1,
        minimum: 1
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: '页码必须是数字' }),
    (0, class_validator_1.Min)(1, { message: '页码不能小于1' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QuerySuggestionsDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '每页数量',
        example: 20,
        minimum: 1,
        maximum: 100
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: '每页数量必须是数字' }),
    (0, class_validator_1.Min)(1, { message: '每页数量不能小于1' }),
    (0, class_validator_1.Max)(100, { message: '每页数量不能大于100' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QuerySuggestionsDto.prototype, "pageSize", void 0);
class AdoptSuggestionDto {
}
exports.AdoptSuggestionDto = AdoptSuggestionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '建议ID',
        example: 'cm1234567890'
    }),
    (0, class_validator_1.IsString)({ message: '建议ID必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: '建议ID不能为空' }),
    __metadata("design:type", String)
], AdoptSuggestionDto.prototype, "suggestionId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '用户反馈',
        example: '这个建议很有帮助，已经按照建议修改了剧情'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '反馈必须是字符串' }),
    __metadata("design:type", String)
], AdoptSuggestionDto.prototype, "feedback", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '用户评分（1-5星）',
        example: 5,
        minimum: 1,
        maximum: 5
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: '评分必须是数字' }),
    (0, class_validator_1.Min)(1, { message: '评分不能小于1' }),
    (0, class_validator_1.Max)(5, { message: '评分不能大于5' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], AdoptSuggestionDto.prototype, "rating", void 0);
class RateSuggestionDto {
}
exports.RateSuggestionDto = RateSuggestionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '建议ID',
        example: 'cm1234567890'
    }),
    (0, class_validator_1.IsString)({ message: '建议ID必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: '建议ID不能为空' }),
    __metadata("design:type", String)
], RateSuggestionDto.prototype, "suggestionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '评分（1-5星）',
        example: 4,
        minimum: 1,
        maximum: 5
    }),
    (0, class_validator_1.IsNumber)({}, { message: '评分必须是数字' }),
    (0, class_validator_1.Min)(1, { message: '评分不能小于1' }),
    (0, class_validator_1.Max)(5, { message: '评分不能大于5' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], RateSuggestionDto.prototype, "rating", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '评价反馈',
        example: '建议很有针对性，但实施难度较大'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '反馈必须是字符串' }),
    __metadata("design:type", String)
], RateSuggestionDto.prototype, "feedback", void 0);
class BulkSuggestionDto {
}
exports.BulkSuggestionDto = BulkSuggestionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '建议ID列表',
        example: ['cm111', 'cm222', 'cm333']
    }),
    (0, class_validator_1.IsArray)({ message: '建议ID必须是数组' }),
    (0, class_validator_1.IsString)({ each: true, message: '每个建议ID必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: '建议ID列表不能为空' }),
    __metadata("design:type", Array)
], BulkSuggestionDto.prototype, "suggestionIds", void 0);


/***/ }),
/* 37 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CharacterModule = void 0;
const common_1 = __webpack_require__(3);
const character_controller_1 = __webpack_require__(38);
const character_service_1 = __webpack_require__(39);
let CharacterModule = class CharacterModule {
};
exports.CharacterModule = CharacterModule;
exports.CharacterModule = CharacterModule = __decorate([
    (0, common_1.Module)({
        controllers: [character_controller_1.CharacterController],
        providers: [character_service_1.CharacterService],
        exports: [character_service_1.CharacterService],
    })
], CharacterModule);


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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CharacterController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(4);
const guards_1 = __webpack_require__(16);
const character_service_1 = __webpack_require__(39);
const character_dto_1 = __webpack_require__(40);
let CharacterController = class CharacterController {
    constructor(characterService) {
        this.characterService = characterService;
    }
    async createCharacter(req, dto) {
        return this.characterService.createCharacter(req.user.id, dto);
    }
    async getCharacters(req, novelId, query) {
        return this.characterService.getCharacters(req.user.id, novelId, query);
    }
    async getCharacter(req, id) {
        return this.characterService.getCharacter(req.user.id, id);
    }
    async updateCharacter(req, id, dto) {
        return this.characterService.updateCharacter(req.user.id, id, dto);
    }
    async deleteCharacter(req, id) {
        return this.characterService.deleteCharacter(req.user.id, id);
    }
};
exports.CharacterController = CharacterController;
__decorate([
    (0, common_1.Post)('characters'),
    (0, swagger_1.ApiOperation)({ summary: '创建角色' }),
    (0, swagger_1.ApiBody)({ type: character_dto_1.CreateCharacterDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '创建成功' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_b = typeof character_dto_1.CreateCharacterDto !== "undefined" && character_dto_1.CreateCharacterDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], CharacterController.prototype, "createCharacter", null);
__decorate([
    (0, common_1.Get)('characters/novel/:novelId'),
    (0, swagger_1.ApiOperation)({ summary: '获取小说角色列表' }),
    (0, swagger_1.ApiParam)({ name: 'novelId', description: '小说ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('novelId')),
    __param(2, (0, common_1.Query)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, typeof (_c = typeof character_dto_1.QueryCharactersDto !== "undefined" && character_dto_1.QueryCharactersDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], CharacterController.prototype, "getCharacters", null);
__decorate([
    (0, common_1.Get)('characters/:id'),
    (0, swagger_1.ApiOperation)({ summary: '获取角色详情' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '角色ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CharacterController.prototype, "getCharacter", null);
__decorate([
    (0, common_1.Put)('characters/:id'),
    (0, swagger_1.ApiOperation)({ summary: '更新角色' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '角色ID' }),
    (0, swagger_1.ApiBody)({ type: character_dto_1.UpdateCharacterDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '更新成功' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, typeof (_d = typeof character_dto_1.UpdateCharacterDto !== "undefined" && character_dto_1.UpdateCharacterDto) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], CharacterController.prototype, "updateCharacter", null);
__decorate([
    (0, common_1.Delete)('characters/:id'),
    (0, swagger_1.ApiOperation)({ summary: '删除角色' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '角色ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '删除成功' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CharacterController.prototype, "deleteCharacter", null);
exports.CharacterController = CharacterController = __decorate([
    (0, swagger_1.ApiTags)('角色管理'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof character_service_1.CharacterService !== "undefined" && character_service_1.CharacterService) === "function" ? _a : Object])
], CharacterController);


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
exports.CharacterService = void 0;
const common_1 = __webpack_require__(3);
const database_1 = __webpack_require__(9);
let CharacterService = class CharacterService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createCharacter(userId, dto) {
        await this.validateNovelAccess(userId, dto.novelId);
        const character = await this.prisma.character.create({
            data: {
                novelId: dto.novelId,
                name: dto.name,
                aliases: dto.aliases,
                role: dto.role,
                importance: dto.importance || 50,
                age: dto.age,
                gender: dto.gender,
                occupation: dto.occupation,
                appearance: dto.appearance,
                personality: dto.personality,
                traits: dto.traits,
                strengths: dto.strengths,
                weaknesses: dto.weaknesses,
                background: dto.background,
                motivation: dto.motivation,
                arc: dto.arc,
                abilities: dto.abilities,
                equipment: dto.equipment,
                customFields: dto.customFields,
            },
        });
        return { success: true, data: character };
    }
    async getCharacters(userId, novelId, query) {
        await this.validateNovelAccess(userId, novelId);
        const where = { novelId };
        if (query.role)
            where.role = query.role;
        if (query.minImportance !== undefined)
            where.importance = { gte: query.minImportance };
        if (query.keyword) {
            where.OR = [
                { name: { contains: query.keyword } },
            ];
        }
        const page = query.page || 1;
        const pageSize = query.pageSize || 20;
        const skip = (page - 1) * pageSize;
        const [characters, total] = await Promise.all([
            this.prisma.character.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: [{ importance: 'desc' }, { createdAt: 'desc' }],
            }),
            this.prisma.character.count({ where }),
        ]);
        return {
            success: true,
            data: {
                items: characters,
                pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
            },
        };
    }
    async getCharacter(userId, characterId) {
        const character = await this.prisma.character.findUnique({
            where: { id: characterId },
            include: { novel: { select: { userId: true } } },
        });
        if (!character || character.novel.userId !== userId) {
            throw new common_1.HttpException('角色不存在或无权访问', common_1.HttpStatus.NOT_FOUND);
        }
        return { success: true, data: character };
    }
    async updateCharacter(userId, characterId, dto) {
        const existing = await this.prisma.character.findUnique({
            where: { id: characterId },
            include: { novel: { select: { userId: true } } },
        });
        if (!existing || existing.novel.userId !== userId) {
            throw new common_1.HttpException('角色不存在或无权访问', common_1.HttpStatus.NOT_FOUND);
        }
        const character = await this.prisma.character.update({
            where: { id: characterId },
            data: {
                name: dto.name,
                aliases: dto.aliases,
                role: dto.role,
                importance: dto.importance,
                age: dto.age,
                gender: dto.gender,
                occupation: dto.occupation,
                appearance: dto.appearance,
                personality: dto.personality,
                traits: dto.traits,
                strengths: dto.strengths,
                weaknesses: dto.weaknesses,
                background: dto.background,
                motivation: dto.motivation,
                arc: dto.arc,
                abilities: dto.abilities,
                equipment: dto.equipment,
                customFields: dto.customFields,
            },
        });
        return { success: true, data: character };
    }
    async deleteCharacter(userId, characterId) {
        const existing = await this.prisma.character.findUnique({
            where: { id: characterId },
            include: { novel: { select: { userId: true } } },
        });
        if (!existing || existing.novel.userId !== userId) {
            throw new common_1.HttpException('角色不存在或无权访问', common_1.HttpStatus.NOT_FOUND);
        }
        await this.prisma.character.delete({ where: { id: characterId } });
        return { success: true, message: '角色已删除' };
    }
    async validateNovelAccess(userId, novelId) {
        const novel = await this.prisma.novel.findFirst({
            where: { id: novelId, userId },
        });
        if (!novel) {
            throw new common_1.HttpException('小说不存在或无权访问', common_1.HttpStatus.NOT_FOUND);
        }
        return novel;
    }
};
exports.CharacterService = CharacterService;
exports.CharacterService = CharacterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], CharacterService);


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
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QueryCharactersDto = exports.UpdateCharacterDto = exports.CreateCharacterDto = void 0;
const class_validator_1 = __webpack_require__(20);
const swagger_1 = __webpack_require__(4);
const client_1 = __webpack_require__(12);
const class_transformer_1 = __webpack_require__(32);
class CreateCharacterDto {
}
exports.CreateCharacterDto = CreateCharacterDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '小说ID',
        example: 'cm1234567890'
    }),
    (0, class_validator_1.IsString)({ message: '小说ID必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: '小说ID不能为空' }),
    __metadata("design:type", String)
], CreateCharacterDto.prototype, "novelId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '角色名称',
        example: '张三'
    }),
    (0, class_validator_1.IsString)({ message: '角色名称必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: '角色名称不能为空' }),
    __metadata("design:type", String)
], CreateCharacterDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '别名/称号列表',
        example: ['小三', '三哥']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: '别名必须是数组' }),
    (0, class_validator_1.IsString)({ each: true, message: '每个别名必须是字符串' }),
    __metadata("design:type", Array)
], CreateCharacterDto.prototype, "aliases", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '角色定位',
        enum: client_1.CharacterRole,
        example: 'PROTAGONIST'
    }),
    (0, class_validator_1.IsEnum)(client_1.CharacterRole, { message: '角色定位无效' }),
    __metadata("design:type", typeof (_a = typeof client_1.CharacterRole !== "undefined" && client_1.CharacterRole) === "function" ? _a : Object)
], CreateCharacterDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '重要性评分（0-100）',
        example: 90,
        minimum: 0,
        maximum: 100
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: '重要性必须是数字' }),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateCharacterDto.prototype, "importance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '年龄',
        example: '25岁'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCharacterDto.prototype, "age", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '性别',
        example: '男'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCharacterDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '职业',
        example: '剑客'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCharacterDto.prototype, "occupation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '外貌描写',
        example: '身材高大，剑眉星目...'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCharacterDto.prototype, "appearance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '性格描写',
        example: '沉稳冷静，深思熟虑...'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCharacterDto.prototype, "personality", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '性格特质标签',
        example: ['勇敢', '智慧', '正义']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateCharacterDto.prototype, "traits", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '优点列表',
        example: ['忠诚', '坚韧']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateCharacterDto.prototype, "strengths", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '缺点列表',
        example: ['固执', '过于理想化']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateCharacterDto.prototype, "weaknesses", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '背景故事'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCharacterDto.prototype, "background", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '动机目标'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCharacterDto.prototype, "motivation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '角色弧光'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCharacterDto.prototype, "arc", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '能力/技能',
        example: ['剑术', '轻功']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateCharacterDto.prototype, "abilities", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '装备/道具',
        example: ['青锋剑', '护心镜']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateCharacterDto.prototype, "equipment", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '自定义字段'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_b = typeof Record !== "undefined" && Record) === "function" ? _b : Object)
], CreateCharacterDto.prototype, "customFields", void 0);
class UpdateCharacterDto {
}
exports.UpdateCharacterDto = UpdateCharacterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '角色名称'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCharacterDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '别名/称号列表'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateCharacterDto.prototype, "aliases", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '角色定位',
        enum: client_1.CharacterRole
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.CharacterRole),
    __metadata("design:type", typeof (_c = typeof client_1.CharacterRole !== "undefined" && client_1.CharacterRole) === "function" ? _c : Object)
], UpdateCharacterDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '重要性评分（0-100）',
        minimum: 0,
        maximum: 100
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateCharacterDto.prototype, "importance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '年龄' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCharacterDto.prototype, "age", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '性别' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCharacterDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '职业' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCharacterDto.prototype, "occupation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '外貌描写' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCharacterDto.prototype, "appearance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '性格描写' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCharacterDto.prototype, "personality", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '性格特质标签' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateCharacterDto.prototype, "traits", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '优点列表' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateCharacterDto.prototype, "strengths", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '缺点列表' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateCharacterDto.prototype, "weaknesses", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '背景故事' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCharacterDto.prototype, "background", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '动机目标' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCharacterDto.prototype, "motivation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '角色弧光' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCharacterDto.prototype, "arc", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '能力/技能' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateCharacterDto.prototype, "abilities", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '装备/道具' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateCharacterDto.prototype, "equipment", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '自定义字段' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_d = typeof Record !== "undefined" && Record) === "function" ? _d : Object)
], UpdateCharacterDto.prototype, "customFields", void 0);
class QueryCharactersDto {
    constructor() {
        this.page = 1;
        this.pageSize = 20;
    }
}
exports.QueryCharactersDto = QueryCharactersDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '角色定位筛选',
        enum: client_1.CharacterRole
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.CharacterRole),
    __metadata("design:type", typeof (_e = typeof client_1.CharacterRole !== "undefined" && client_1.CharacterRole) === "function" ? _e : Object)
], QueryCharactersDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '关键词搜索（搜索名称、别名）'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryCharactersDto.prototype, "keyword", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '最小重要性',
        minimum: 0,
        maximum: 100
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryCharactersDto.prototype, "minImportance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '页码',
        example: 1,
        minimum: 1
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryCharactersDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '每页数量',
        example: 20,
        minimum: 1,
        maximum: 100
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryCharactersDto.prototype, "pageSize", void 0);


/***/ }),
/* 41 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WorldModule = void 0;
const common_1 = __webpack_require__(3);
const world_controller_1 = __webpack_require__(42);
const world_service_1 = __webpack_require__(43);
let WorldModule = class WorldModule {
};
exports.WorldModule = WorldModule;
exports.WorldModule = WorldModule = __decorate([
    (0, common_1.Module)({
        controllers: [world_controller_1.WorldController],
        providers: [world_service_1.WorldService],
        exports: [world_service_1.WorldService],
    })
], WorldModule);


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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WorldController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(4);
const guards_1 = __webpack_require__(16);
const world_service_1 = __webpack_require__(43);
const world_dto_1 = __webpack_require__(44);
let WorldController = class WorldController {
    constructor(worldService) {
        this.worldService = worldService;
    }
    async createWorldSetting(req, dto) {
        return this.worldService.createWorldSetting(req.user.id, dto);
    }
    async getWorldSettings(req, novelId, query) {
        return this.worldService.getWorldSettings(req.user.id, novelId, query);
    }
    async getWorldSetting(req, id) {
        return this.worldService.getWorldSetting(req.user.id, id);
    }
    async updateWorldSetting(req, id, dto) {
        return this.worldService.updateWorldSetting(req.user.id, id, dto);
    }
    async deleteWorldSetting(req, id) {
        return this.worldService.deleteWorldSetting(req.user.id, id);
    }
};
exports.WorldController = WorldController;
__decorate([
    (0, common_1.Post)('world-settings'),
    (0, swagger_1.ApiOperation)({ summary: '创建世界观设定' }),
    (0, swagger_1.ApiBody)({ type: world_dto_1.CreateWorldSettingDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '创建成功' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_b = typeof world_dto_1.CreateWorldSettingDto !== "undefined" && world_dto_1.CreateWorldSettingDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], WorldController.prototype, "createWorldSetting", null);
__decorate([
    (0, common_1.Get)('world-settings/novel/:novelId'),
    (0, swagger_1.ApiOperation)({ summary: '获取小说世界观设定列表' }),
    (0, swagger_1.ApiParam)({ name: 'novelId', description: '小说ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('novelId')),
    __param(2, (0, common_1.Query)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, typeof (_c = typeof world_dto_1.QueryWorldSettingsDto !== "undefined" && world_dto_1.QueryWorldSettingsDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], WorldController.prototype, "getWorldSettings", null);
__decorate([
    (0, common_1.Get)('world-settings/:id'),
    (0, swagger_1.ApiOperation)({ summary: '获取世界观设定详情' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '设定ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WorldController.prototype, "getWorldSetting", null);
__decorate([
    (0, common_1.Put)('world-settings/:id'),
    (0, swagger_1.ApiOperation)({ summary: '更新世界观设定' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '设定ID' }),
    (0, swagger_1.ApiBody)({ type: world_dto_1.UpdateWorldSettingDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '更新成功' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, typeof (_d = typeof world_dto_1.UpdateWorldSettingDto !== "undefined" && world_dto_1.UpdateWorldSettingDto) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], WorldController.prototype, "updateWorldSetting", null);
__decorate([
    (0, common_1.Delete)('world-settings/:id'),
    (0, swagger_1.ApiOperation)({ summary: '删除世界观设定' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '设定ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '删除成功' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WorldController.prototype, "deleteWorldSetting", null);
exports.WorldController = WorldController = __decorate([
    (0, swagger_1.ApiTags)('世界观管理'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof world_service_1.WorldService !== "undefined" && world_service_1.WorldService) === "function" ? _a : Object])
], WorldController);


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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WorldService = void 0;
const common_1 = __webpack_require__(3);
const database_1 = __webpack_require__(9);
let WorldService = class WorldService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createWorldSetting(userId, dto) {
        await this.validateNovelAccess(userId, dto.novelId);
        const setting = await this.prisma.worldSetting.create({
            data: {
                novelId: dto.novelId,
                category: dto.category,
                name: dto.name,
                description: dto.description,
                details: dto.details,
                location: dto.location,
                coordinates: dto.coordinates,
                leadership: dto.leadership,
                members: dto.members,
                power: dto.power,
                tags: dto.tags,
                references: dto.references,
                customFields: dto.customFields,
            },
        });
        return { success: true, data: setting };
    }
    async getWorldSettings(userId, novelId, query) {
        await this.validateNovelAccess(userId, novelId);
        const where = { novelId };
        if (query.category)
            where.category = query.category;
        if (query.keyword) {
            where.OR = [
                { name: { contains: query.keyword } },
                { description: { contains: query.keyword } },
            ];
        }
        const page = query.page || 1;
        const pageSize = query.pageSize || 20;
        const skip = (page - 1) * pageSize;
        const [settings, total] = await Promise.all([
            this.prisma.worldSetting.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.worldSetting.count({ where }),
        ]);
        return {
            success: true,
            data: {
                items: settings,
                pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
            },
        };
    }
    async getWorldSetting(userId, settingId) {
        const setting = await this.prisma.worldSetting.findUnique({
            where: { id: settingId },
            include: { novel: { select: { userId: true } } },
        });
        if (!setting || setting.novel.userId !== userId) {
            throw new common_1.HttpException('世界观设定不存在或无权访问', common_1.HttpStatus.NOT_FOUND);
        }
        return { success: true, data: setting };
    }
    async updateWorldSetting(userId, settingId, dto) {
        const existing = await this.prisma.worldSetting.findUnique({
            where: { id: settingId },
            include: { novel: { select: { userId: true } } },
        });
        if (!existing || existing.novel.userId !== userId) {
            throw new common_1.HttpException('世界观设定不存在或无权访问', common_1.HttpStatus.NOT_FOUND);
        }
        const setting = await this.prisma.worldSetting.update({
            where: { id: settingId },
            data: {
                category: dto.category,
                name: dto.name,
                description: dto.description,
                details: dto.details,
                location: dto.location,
                coordinates: dto.coordinates,
                leadership: dto.leadership,
                members: dto.members,
                power: dto.power,
                tags: dto.tags,
                references: dto.references,
                customFields: dto.customFields,
            },
        });
        return { success: true, data: setting };
    }
    async deleteWorldSetting(userId, settingId) {
        const existing = await this.prisma.worldSetting.findUnique({
            where: { id: settingId },
            include: { novel: { select: { userId: true } } },
        });
        if (!existing || existing.novel.userId !== userId) {
            throw new common_1.HttpException('世界观设定不存在或无权访问', common_1.HttpStatus.NOT_FOUND);
        }
        await this.prisma.worldSetting.delete({ where: { id: settingId } });
        return { success: true, message: '世界观设定已删除' };
    }
    async validateNovelAccess(userId, novelId) {
        const novel = await this.prisma.novel.findFirst({
            where: { id: novelId, userId },
        });
        if (!novel) {
            throw new common_1.HttpException('小说不存在或无权访问', common_1.HttpStatus.NOT_FOUND);
        }
        return novel;
    }
};
exports.WorldService = WorldService;
exports.WorldService = WorldService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], WorldService);


/***/ }),
/* 44 */
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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QueryWorldSettingsDto = exports.UpdateWorldSettingDto = exports.CreateWorldSettingDto = void 0;
const class_validator_1 = __webpack_require__(20);
const swagger_1 = __webpack_require__(4);
const client_1 = __webpack_require__(12);
const class_transformer_1 = __webpack_require__(32);
class CreateWorldSettingDto {
}
exports.CreateWorldSettingDto = CreateWorldSettingDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '小说ID',
        example: 'cm1234567890'
    }),
    (0, class_validator_1.IsString)({ message: '小说ID必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: '小说ID不能为空' }),
    __metadata("design:type", String)
], CreateWorldSettingDto.prototype, "novelId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '世界观类别',
        enum: client_1.WorldCategory,
        example: 'LOCATION'
    }),
    (0, class_validator_1.IsEnum)(client_1.WorldCategory, { message: '世界观类别无效' }),
    __metadata("design:type", typeof (_a = typeof client_1.WorldCategory !== "undefined" && client_1.WorldCategory) === "function" ? _a : Object)
], CreateWorldSettingDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '名称',
        example: '长安城'
    }),
    (0, class_validator_1.IsString)({ message: '名称必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: '名称不能为空' }),
    __metadata("design:type", String)
], CreateWorldSettingDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '描述'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWorldSettingDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '详细设定（结构化数据）',
        example: {
            '气候': '四季分明',
            '人口': '百万',
            '特色': '繁华的都城'
        }
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_b = typeof Record !== "undefined" && Record) === "function" ? _b : Object)
], CreateWorldSettingDto.prototype, "details", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '位置信息（针对地点类）'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWorldSettingDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '坐标/位置关系'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_c = typeof Record !== "undefined" && Record) === "function" ? _c : Object)
], CreateWorldSettingDto.prototype, "coordinates", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '领导层（针对组织/势力类）'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWorldSettingDto.prototype, "leadership", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '成员信息'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_d = typeof Record !== "undefined" && Record) === "function" ? _d : Object)
], CreateWorldSettingDto.prototype, "members", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '势力强度（0-100）',
        minimum: 0,
        maximum: 100
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateWorldSettingDto.prototype, "power", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '标签'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_e = typeof Record !== "undefined" && Record) === "function" ? _e : Object)
], CreateWorldSettingDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '相关引用'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_f = typeof Record !== "undefined" && Record) === "function" ? _f : Object)
], CreateWorldSettingDto.prototype, "references", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '自定义字段'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_g = typeof Record !== "undefined" && Record) === "function" ? _g : Object)
], CreateWorldSettingDto.prototype, "customFields", void 0);
class UpdateWorldSettingDto {
}
exports.UpdateWorldSettingDto = UpdateWorldSettingDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '世界观类别',
        enum: client_1.WorldCategory
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.WorldCategory),
    __metadata("design:type", typeof (_h = typeof client_1.WorldCategory !== "undefined" && client_1.WorldCategory) === "function" ? _h : Object)
], UpdateWorldSettingDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '名称' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateWorldSettingDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '描述' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateWorldSettingDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '详细设定' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_j = typeof Record !== "undefined" && Record) === "function" ? _j : Object)
], UpdateWorldSettingDto.prototype, "details", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '位置信息' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateWorldSettingDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '坐标' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_k = typeof Record !== "undefined" && Record) === "function" ? _k : Object)
], UpdateWorldSettingDto.prototype, "coordinates", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '领导层' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateWorldSettingDto.prototype, "leadership", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '成员信息' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_l = typeof Record !== "undefined" && Record) === "function" ? _l : Object)
], UpdateWorldSettingDto.prototype, "members", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '势力强度' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateWorldSettingDto.prototype, "power", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '标签' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_m = typeof Record !== "undefined" && Record) === "function" ? _m : Object)
], UpdateWorldSettingDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '相关引用' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_o = typeof Record !== "undefined" && Record) === "function" ? _o : Object)
], UpdateWorldSettingDto.prototype, "references", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '自定义字段' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_p = typeof Record !== "undefined" && Record) === "function" ? _p : Object)
], UpdateWorldSettingDto.prototype, "customFields", void 0);
class QueryWorldSettingsDto {
    constructor() {
        this.page = 1;
        this.pageSize = 20;
    }
}
exports.QueryWorldSettingsDto = QueryWorldSettingsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '类别筛选',
        enum: client_1.WorldCategory
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.WorldCategory),
    __metadata("design:type", typeof (_q = typeof client_1.WorldCategory !== "undefined" && client_1.WorldCategory) === "function" ? _q : Object)
], QueryWorldSettingsDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '关键词搜索'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryWorldSettingsDto.prototype, "keyword", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '页码',
        example: 1,
        minimum: 1
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryWorldSettingsDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '每页数量',
        example: 20,
        minimum: 1,
        maximum: 100
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryWorldSettingsDto.prototype, "pageSize", void 0);


/***/ }),
/* 45 */
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
const material_controller_1 = __webpack_require__(46);
const material_service_1 = __webpack_require__(47);
const database_1 = __webpack_require__(9);
const guards_1 = __webpack_require__(16);
let MaterialModule = class MaterialModule {
};
exports.MaterialModule = MaterialModule;
exports.MaterialModule = MaterialModule = __decorate([
    (0, common_1.Module)({
        imports: [database_1.DatabaseModule],
        controllers: [material_controller_1.MaterialController],
        providers: [material_service_1.MaterialService, guards_1.JwtAuthGuard],
        exports: [material_service_1.MaterialService],
    })
], MaterialModule);


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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MaterialController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(4);
const guards_1 = __webpack_require__(16);
const material_service_1 = __webpack_require__(47);
const material_dto_1 = __webpack_require__(48);
let MaterialController = class MaterialController {
    constructor(materialService) {
        this.materialService = materialService;
    }
    async getMaterials(req, query) {
        console.log('getMaterials called, user:', req.user, 'query:', query);
        if (!req.user || !req.user.id) {
            throw new common_1.HttpException('用户未认证', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.materialService.getMaterials(req.user.id, query);
    }
    async getMaterialStats(req) {
        console.log('getMaterialStats called, user:', req.user);
        if (!req.user || !req.user.id) {
            throw new common_1.HttpException('用户未认证', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.materialService.getMaterialStats(req.user.id);
    }
    async getMaterialCategories(req) {
        console.log('getMaterialCategories called, user:', req.user);
        if (!req.user || !req.user.id) {
            throw new common_1.HttpException('用户未认证', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.materialService.getMaterialCategories(req.user.id);
    }
    async getMaterialTags(req) {
        console.log('getMaterialTags called, user:', req.user);
        if (!req.user || !req.user.id) {
            throw new common_1.HttpException('用户未认证', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.materialService.getMaterialTags(req.user.id);
    }
    async getStorageQuota(req) {
        return this.materialService.getStorageQuota(req.user.id);
    }
    async createMaterial(req, dto) {
        return this.materialService.createMaterial(req.user.id, dto);
    }
    async batchDeleteMaterials(req, dto) {
        return this.materialService.batchDeleteMaterials(req.user.id, dto);
    }
    async batchUpdateCategory(req, dto) {
        return this.materialService.batchUpdateCategory(req.user.id, dto);
    }
    async getMaterial(req, id) {
        return this.materialService.getMaterial(req.user.id, id);
    }
    async updateMaterial(req, id, dto) {
        return this.materialService.updateMaterial(req.user.id, id, dto);
    }
    async deleteMaterial(req, id) {
        return this.materialService.deleteMaterial(req.user.id, id);
    }
    async addMaterialReference(req, id, dto) {
        return this.materialService.addMaterialReference(req.user.id, id, dto);
    }
    async getMaterialReferences(req, id) {
        return this.materialService.getMaterialReferences(req.user.id, id);
    }
    async deleteMaterialReference(req, referenceId) {
        return this.materialService.deleteMaterialReference(req.user.id, referenceId);
    }
    async analyzeMaterialStyle(req, id, dto) {
        return this.materialService.analyzeMaterialStyle(req.user.id, id, dto.analysisType);
    }
    async analyzeMaterialStructure(req, id, dto) {
        return this.materialService.analyzeMaterialStyle(req.user.id, id, 'structure');
    }
    async analyzeMaterialCharacters(req, id, dto) {
        return this.materialService.analyzeMaterialStyle(req.user.id, id, 'characters');
    }
    async checkSimilarity(req, id, dto) {
        return this.materialService.checkSimilarity(req.user.id, id, dto.content, dto.threshold || 0.7);
    }
    async getRecommendedMaterials(req, limit) {
        return this.materialService.getRecommendedMaterials(req.user.id, limit || 10);
    }
    async searchWizardMaterials(req, query) {
        return this.materialService.searchWizardMaterials(req.user.id, query.stepType, query.keyword, query.limit || 5);
    }
};
exports.MaterialController = MaterialController;
__decorate([
    (0, common_1.Get)('materials'),
    (0, swagger_1.ApiOperation)({ summary: '获取素材列表' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_b = typeof material_dto_1.QueryMaterialsDto !== "undefined" && material_dto_1.QueryMaterialsDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], MaterialController.prototype, "getMaterials", null);
__decorate([
    (0, common_1.Get)('materials/stats'),
    (0, swagger_1.ApiOperation)({ summary: '获取素材统计' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MaterialController.prototype, "getMaterialStats", null);
__decorate([
    (0, common_1.Get)('materials/categories'),
    (0, swagger_1.ApiOperation)({ summary: '获取素材分类列表' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MaterialController.prototype, "getMaterialCategories", null);
__decorate([
    (0, common_1.Get)('materials/tags'),
    (0, swagger_1.ApiOperation)({ summary: '获取素材标签列表' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MaterialController.prototype, "getMaterialTags", null);
__decorate([
    (0, common_1.Get)('materials/storage/quota'),
    (0, swagger_1.ApiOperation)({ summary: '获取存储配额信息' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MaterialController.prototype, "getStorageQuota", null);
__decorate([
    (0, common_1.Post)('materials'),
    (0, swagger_1.ApiOperation)({ summary: '创建素材' }),
    (0, swagger_1.ApiBody)({ type: material_dto_1.CreateMaterialDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '创建成功' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_c = typeof material_dto_1.CreateMaterialDto !== "undefined" && material_dto_1.CreateMaterialDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], MaterialController.prototype, "createMaterial", null);
__decorate([
    (0, common_1.Post)('materials/batch-delete'),
    (0, swagger_1.ApiOperation)({ summary: '批量删除素材' }),
    (0, swagger_1.ApiBody)({ type: material_dto_1.BatchDeleteMaterialsDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '批量删除成功' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_d = typeof material_dto_1.BatchDeleteMaterialsDto !== "undefined" && material_dto_1.BatchDeleteMaterialsDto) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], MaterialController.prototype, "batchDeleteMaterials", null);
__decorate([
    (0, common_1.Post)('materials/batch-update-category'),
    (0, swagger_1.ApiOperation)({ summary: '批量更新素材分类' }),
    (0, swagger_1.ApiBody)({ type: material_dto_1.BatchUpdateCategoryDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '批量更新成功' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_e = typeof material_dto_1.BatchUpdateCategoryDto !== "undefined" && material_dto_1.BatchUpdateCategoryDto) === "function" ? _e : Object]),
    __metadata("design:returntype", Promise)
], MaterialController.prototype, "batchUpdateCategory", null);
__decorate([
    (0, common_1.Get)('materials/:id'),
    (0, swagger_1.ApiOperation)({ summary: '获取素材详情' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '素材ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MaterialController.prototype, "getMaterial", null);
__decorate([
    (0, common_1.Put)('materials/:id'),
    (0, swagger_1.ApiOperation)({ summary: '更新素材' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '素材ID' }),
    (0, swagger_1.ApiBody)({ type: material_dto_1.UpdateMaterialDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '更新成功' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, typeof (_f = typeof material_dto_1.UpdateMaterialDto !== "undefined" && material_dto_1.UpdateMaterialDto) === "function" ? _f : Object]),
    __metadata("design:returntype", Promise)
], MaterialController.prototype, "updateMaterial", null);
__decorate([
    (0, common_1.Delete)('materials/:id'),
    (0, swagger_1.ApiOperation)({ summary: '删除素材' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '素材ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '删除成功' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MaterialController.prototype, "deleteMaterial", null);
__decorate([
    (0, common_1.Post)('materials/:id/references'),
    (0, swagger_1.ApiOperation)({ summary: '添加素材引用记录' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '素材ID' }),
    (0, swagger_1.ApiBody)({ type: material_dto_1.AddMaterialReferenceDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '添加成功' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, typeof (_g = typeof material_dto_1.AddMaterialReferenceDto !== "undefined" && material_dto_1.AddMaterialReferenceDto) === "function" ? _g : Object]),
    __metadata("design:returntype", Promise)
], MaterialController.prototype, "addMaterialReference", null);
__decorate([
    (0, common_1.Get)('materials/:id/references'),
    (0, swagger_1.ApiOperation)({ summary: '获取素材引用列表' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '素材ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MaterialController.prototype, "getMaterialReferences", null);
__decorate([
    (0, common_1.Delete)('materials/references/:referenceId'),
    (0, swagger_1.ApiOperation)({ summary: '删除素材引用记录' }),
    (0, swagger_1.ApiParam)({ name: 'referenceId', description: '引用记录ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '删除成功' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('referenceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MaterialController.prototype, "deleteMaterialReference", null);
__decorate([
    (0, common_1.Post)('materials/:id/analyze/style'),
    (0, swagger_1.ApiOperation)({ summary: '分析素材写作风格' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '素材ID' }),
    (0, swagger_1.ApiBody)({ type: material_dto_1.AnalyzeMaterialDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '分析成功' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, typeof (_h = typeof material_dto_1.AnalyzeMaterialDto !== "undefined" && material_dto_1.AnalyzeMaterialDto) === "function" ? _h : Object]),
    __metadata("design:returntype", Promise)
], MaterialController.prototype, "analyzeMaterialStyle", null);
__decorate([
    (0, common_1.Post)('materials/:id/analyze/structure'),
    (0, swagger_1.ApiOperation)({ summary: '分析素材情节结构' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '素材ID' }),
    (0, swagger_1.ApiBody)({ type: material_dto_1.AnalyzeMaterialDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '分析成功' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, typeof (_j = typeof material_dto_1.AnalyzeMaterialDto !== "undefined" && material_dto_1.AnalyzeMaterialDto) === "function" ? _j : Object]),
    __metadata("design:returntype", Promise)
], MaterialController.prototype, "analyzeMaterialStructure", null);
__decorate([
    (0, common_1.Post)('materials/:id/analyze/characters'),
    (0, swagger_1.ApiOperation)({ summary: '分析素材角色特征' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '素材ID' }),
    (0, swagger_1.ApiBody)({ type: material_dto_1.AnalyzeMaterialDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '分析成功' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, typeof (_k = typeof material_dto_1.AnalyzeMaterialDto !== "undefined" && material_dto_1.AnalyzeMaterialDto) === "function" ? _k : Object]),
    __metadata("design:returntype", Promise)
], MaterialController.prototype, "analyzeMaterialCharacters", null);
__decorate([
    (0, common_1.Post)('materials/:id/check-similarity'),
    (0, swagger_1.ApiOperation)({ summary: '检测内容相似度' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '素材ID' }),
    (0, swagger_1.ApiBody)({ type: material_dto_1.CheckSimilarityDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '检测成功' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, typeof (_l = typeof material_dto_1.CheckSimilarityDto !== "undefined" && material_dto_1.CheckSimilarityDto) === "function" ? _l : Object]),
    __metadata("design:returntype", Promise)
], MaterialController.prototype, "checkSimilarity", null);
__decorate([
    (0, common_1.Get)('materials/recommendations'),
    (0, swagger_1.ApiOperation)({ summary: '获取推荐素材' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], MaterialController.prototype, "getRecommendedMaterials", null);
__decorate([
    (0, common_1.Get)('materials/search-for-wizard'),
    (0, swagger_1.ApiOperation)({ summary: '搜索适用于向导的素材' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '搜索成功' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_m = typeof material_dto_1.SearchWizardMaterialsDto !== "undefined" && material_dto_1.SearchWizardMaterialsDto) === "function" ? _m : Object]),
    __metadata("design:returntype", Promise)
], MaterialController.prototype, "searchWizardMaterials", null);
exports.MaterialController = MaterialController = __decorate([
    (0, swagger_1.ApiTags)('素材管理'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof material_service_1.MaterialService !== "undefined" && material_service_1.MaterialService) === "function" ? _a : Object])
], MaterialController);


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
exports.MaterialService = void 0;
const common_1 = __webpack_require__(3);
const database_1 = __webpack_require__(9);
let MaterialService = class MaterialService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createMaterial(userId, dto) {
        const material = await this.prisma.material.create({
            data: {
                userId,
                name: dto.name,
                type: dto.type,
                category: dto.category,
                fileUrl: dto.fileUrl,
                fileSize: dto.fileSize,
                description: dto.description,
                tags: dto.tags,
            },
        });
        await this.updateStorageQuota(userId, dto.fileSize || 0, 1);
        return { success: true, data: material };
    }
    async getMaterials(userId, query) {
        try {
            const where = { userId };
            if (query.type)
                where.type = query.type;
            if (query.category)
                where.category = query.category;
            if (query.keyword) {
                where.OR = [
                    { name: { contains: query.keyword } },
                    { description: { contains: query.keyword } },
                ];
            }
            const page = query.page || 1;
            const pageSize = query.pageSize || 20;
            const skip = (page - 1) * pageSize;
            const [materials, total] = await Promise.all([
                this.prisma.material.findMany({
                    where,
                    skip,
                    take: pageSize,
                    orderBy: { createdAt: 'desc' },
                }),
                this.prisma.material.count({ where }),
            ]);
            return {
                success: true,
                data: {
                    items: materials,
                    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
                },
            };
        }
        catch (error) {
            console.error('获取素材列表失败:', error);
            throw new common_1.HttpException(`获取素材列表失败: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getMaterial(userId, materialId) {
        const material = await this.prisma.material.findUnique({
            where: { id: materialId },
        });
        if (!material || material.userId !== userId) {
            throw new common_1.HttpException('素材不存在或无权访问', common_1.HttpStatus.NOT_FOUND);
        }
        return { success: true, data: material };
    }
    async updateMaterial(userId, materialId, dto) {
        const existing = await this.prisma.material.findUnique({
            where: { id: materialId },
        });
        if (!existing || existing.userId !== userId) {
            throw new common_1.HttpException('素材不存在或无权访问', common_1.HttpStatus.NOT_FOUND);
        }
        const material = await this.prisma.material.update({
            where: { id: materialId },
            data: {
                name: dto.name,
                type: dto.type,
                category: dto.category,
                fileUrl: dto.fileUrl,
                fileSize: dto.fileSize,
                description: dto.description,
                tags: dto.tags,
            },
        });
        return { success: true, data: material };
    }
    async deleteMaterial(userId, materialId) {
        const existing = await this.prisma.material.findUnique({
            where: { id: materialId },
        });
        if (!existing || existing.userId !== userId) {
            throw new common_1.HttpException('素材不存在或无权访问', common_1.HttpStatus.NOT_FOUND);
        }
        await this.prisma.material.delete({ where: { id: materialId } });
        await this.updateStorageQuota(userId, -(existing.fileSize || 0), -1);
        return { success: true, message: '素材已删除' };
    }
    async getMaterialStats(userId) {
        try {
            const [total, byType, totalSize] = await Promise.all([
                this.prisma.material.count({ where: { userId } }),
                this.prisma.material.groupBy({
                    by: ['type'],
                    where: { userId },
                    _count: true,
                }),
                this.prisma.material.aggregate({
                    where: { userId },
                    _sum: { fileSize: true },
                }),
            ]);
            return {
                success: true,
                data: {
                    total,
                    byType: byType.map(item => ({
                        type: item.type,
                        count: item._count,
                    })),
                    totalSize: totalSize._sum.fileSize || 0,
                },
            };
        }
        catch (error) {
            console.error('获取素材统计失败:', error);
            return {
                success: true,
                data: {
                    total: 0,
                    byType: [],
                    totalSize: 0,
                },
            };
        }
    }
    async getMaterialCategories(userId) {
        try {
            const materials = await this.prisma.material.findMany({
                where: { userId },
                select: { category: true },
                distinct: ['category'],
            });
            const categories = materials
                .map(m => m.category)
                .filter(c => c && c.trim() !== '')
                .sort();
            return {
                success: true,
                data: categories,
            };
        }
        catch (error) {
            console.error('获取素材分类失败:', error);
            return {
                success: true,
                data: [],
            };
        }
    }
    async getMaterialTags(userId) {
        try {
            const materials = await this.prisma.material.findMany({
                where: { userId },
                select: { tags: true },
            });
            const tagsSet = new Set();
            materials.forEach(m => {
                if (m.tags) {
                    const tagArray = Array.isArray(m.tags) ? m.tags : [];
                    tagArray.forEach((tag) => {
                        if (tag && typeof tag === 'string' && tag.trim() !== '') {
                            tagsSet.add(tag);
                        }
                    });
                }
            });
            const tags = Array.from(tagsSet).sort();
            return {
                success: true,
                data: tags,
            };
        }
        catch (error) {
            console.error('获取素材标签失败:', error);
            return {
                success: true,
                data: [],
            };
        }
    }
    async batchDeleteMaterials(userId, dto) {
        const materials = await this.prisma.material.findMany({
            where: {
                id: { in: dto.materialIds },
                userId,
            },
        });
        if (materials.length !== dto.materialIds.length) {
            throw new common_1.HttpException('部分素材不存在或无权访问', common_1.HttpStatus.BAD_REQUEST);
        }
        const result = await this.prisma.material.deleteMany({
            where: {
                id: { in: dto.materialIds },
                userId,
            },
        });
        const totalSize = materials.reduce((sum, m) => sum + (m.fileSize || 0), 0);
        await this.updateStorageQuota(userId, -totalSize, -materials.length);
        return {
            success: true,
            message: `成功删除${result.count}个素材`,
            data: { deletedCount: result.count },
        };
    }
    async batchUpdateCategory(userId, dto) {
        const count = await this.prisma.material.count({
            where: {
                id: { in: dto.materialIds },
                userId,
            },
        });
        if (count !== dto.materialIds.length) {
            throw new common_1.HttpException('部分素材不存在或无权访问', common_1.HttpStatus.BAD_REQUEST);
        }
        const result = await this.prisma.material.updateMany({
            where: {
                id: { in: dto.materialIds },
                userId,
            },
            data: {
                category: dto.category,
            },
        });
        return {
            success: true,
            message: `成功更新${result.count}个素材的分类`,
            data: { updatedCount: result.count },
        };
    }
    async addMaterialReference(userId, materialId, dto) {
        const material = await this.prisma.material.findUnique({
            where: { id: materialId },
        });
        if (!material || material.userId !== userId) {
            throw new common_1.HttpException('素材不存在或无权访问', common_1.HttpStatus.NOT_FOUND);
        }
        const reference = await this.prisma.materialReference.create({
            data: {
                materialId,
                chapterId: dto.chapterId,
                novelId: dto.novelId,
                userId,
                context: dto.context,
                position: dto.position,
            },
        });
        await this.prisma.material.update({
            where: { id: materialId },
            data: {
                usageCount: {
                    increment: 1,
                },
            },
        });
        return { success: true, data: reference };
    }
    async getMaterialReferences(userId, materialId) {
        const material = await this.prisma.material.findUnique({
            where: { id: materialId },
        });
        if (!material || material.userId !== userId) {
            throw new common_1.HttpException('素材不存在或无权访问', common_1.HttpStatus.NOT_FOUND);
        }
        const references = await this.prisma.materialReference.findMany({
            where: { materialId, userId },
            orderBy: { createdAt: 'desc' },
        });
        return { success: true, data: references };
    }
    async getStorageQuota(userId) {
        let quota = await this.prisma.userStorageQuota.findUnique({
            where: { userId },
        });
        if (!quota) {
            quota = await this.prisma.userStorageQuota.create({
                data: {
                    userId,
                    totalQuota: 1073741824,
                    usedSpace: 0,
                    materialCount: 0,
                },
            });
        }
        const stats = await this.prisma.material.aggregate({
            where: { userId },
            _sum: { fileSize: true },
            _count: true,
        });
        const actualUsedSpace = BigInt(stats._sum.fileSize || 0);
        const actualMaterialCount = stats._count;
        if (quota.usedSpace !== actualUsedSpace || quota.materialCount !== actualMaterialCount) {
            quota = await this.prisma.userStorageQuota.update({
                where: { userId },
                data: {
                    usedSpace: actualUsedSpace,
                    materialCount: actualMaterialCount,
                },
            });
        }
        return {
            success: true,
            data: {
                ...quota,
                usagePercentage: ((Number(quota.usedSpace) / Number(quota.totalQuota)) * 100).toFixed(2),
                remainingSpace: Number(quota.totalQuota) - Number(quota.usedSpace),
            },
        };
    }
    async updateStorageQuota(userId, sizeDelta, countDelta) {
        const quota = await this.prisma.userStorageQuota.findUnique({
            where: { userId },
        });
        if (!quota) {
            await this.prisma.userStorageQuota.create({
                data: {
                    userId,
                    usedSpace: Math.max(0, sizeDelta),
                    materialCount: Math.max(0, countDelta),
                },
            });
        }
        else {
            await this.prisma.userStorageQuota.update({
                where: { userId },
                data: {
                    usedSpace: Math.max(0, Number(quota.usedSpace) + sizeDelta),
                    materialCount: Math.max(0, quota.materialCount + countDelta),
                },
            });
        }
    }
    async analyzeMaterialStyle(userId, materialId, analysisType) {
        const material = await this.prisma.material.findUnique({
            where: { id: materialId },
        });
        if (!material || material.userId !== userId) {
            throw new common_1.HttpException('素材不存在或无权访问', common_1.HttpStatus.NOT_FOUND);
        }
        if (material.type === 'TEXT' || material.type === 'DOCUMENT') {
            return {
                success: true,
                data: {
                    materialId,
                    materialName: material.name,
                    analysisType,
                    features: {
                        narrative: '叙事视角特征...',
                        dialogue: '对话风格特征...',
                        description: '描写风格特征...',
                        pacing: '节奏特点...'
                    },
                    summary: '该素材采用第三人称全知视角，叙事节奏较快...',
                    recommendations: [
                        '适合用于快节奏的动作场景',
                        '对话简洁有力，适合紧张场面',
                    ]
                }
            };
        }
        throw new common_1.HttpException('只能分析文本类型的素材', common_1.HttpStatus.BAD_REQUEST);
    }
    async checkSimilarity(userId, materialId, content, threshold = 0.7) {
        const material = await this.prisma.material.findUnique({
            where: { id: materialId },
        });
        if (!material || material.userId !== userId) {
            throw new common_1.HttpException('素材不存在或无权访问', common_1.HttpStatus.NOT_FOUND);
        }
        const similarity = this.calculateSimpleSimilarity(content, material.fileUrl || '');
        return {
            success: true,
            data: {
                materialId,
                similarity,
                isSimilar: similarity > threshold,
                threshold,
                warning: similarity > threshold ? '内容与素材相似度较高，建议修改' : null,
            }
        };
    }
    calculateSimpleSimilarity(text1, text2) {
        const words1 = new Set(text1.toLowerCase().split(/\s+/));
        const words2 = new Set(text2.toLowerCase().split(/\s+/));
        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        return union.size > 0 ? intersection.size / union.size : 0;
    }
    async searchWizardMaterials(userId, stepType, keyword, limit = 5) {
        try {
            const categoryMap = {
                outline: ['大纲', '结构', '情节'],
                character: ['角色', '人物', '角色设定'],
                worldview: ['世界观', '设定', '背景'],
                scene: ['场景', '描写', '环境'],
                dialogue: ['对话', '台词']
            };
            const categories = categoryMap[stepType] || [];
            const where = { userId };
            where.type = 'TEXT';
            if (keyword) {
                where.OR = [
                    { name: { contains: keyword } },
                    { description: { contains: keyword } },
                    { category: { in: categories } }
                ];
            }
            else if (categories.length > 0) {
                where.category = { in: categories };
            }
            const materials = await this.prisma.material.findMany({
                where,
                take: limit,
                orderBy: [
                    { usageCount: 'desc' },
                    { createdAt: 'desc' }
                ],
                select: {
                    id: true,
                    name: true,
                    type: true,
                    category: true,
                    description: true,
                    tags: true,
                    usageCount: true,
                    createdAt: true,
                }
            });
            return {
                success: true,
                data: {
                    stepType,
                    materials,
                    total: materials.length,
                }
            };
        }
        catch (error) {
            console.error('搜索向导素材失败:', error);
            return {
                success: true,
                data: {
                    stepType,
                    materials: [],
                    total: 0,
                }
            };
        }
    }
    async deleteMaterialReference(userId, referenceId) {
        const reference = await this.prisma.materialReference.findUnique({
            where: { id: referenceId },
            include: { material: true }
        });
        if (!reference) {
            throw new common_1.HttpException('引用记录不存在', common_1.HttpStatus.NOT_FOUND);
        }
        if (reference.userId !== userId) {
            throw new common_1.HttpException('无权删除此引用记录', common_1.HttpStatus.FORBIDDEN);
        }
        await this.prisma.materialReference.delete({
            where: { id: referenceId }
        });
        if (reference.material && reference.material.usageCount > 0) {
            await this.prisma.material.update({
                where: { id: reference.materialId },
                data: {
                    usageCount: {
                        decrement: 1
                    }
                }
            });
        }
        return {
            success: true,
            message: '引用记录已删除'
        };
    }
    async getRecommendedMaterials(userId, limit = 10) {
        try {
            const recentReferences = await this.prisma.materialReference.findMany({
                where: { userId },
                take: 20,
                orderBy: { createdAt: 'desc' },
                select: { materialId: true }
            });
            const recentMaterialIds = recentReferences.map(r => r.materialId);
            let recommendedCategories = [];
            if (recentMaterialIds.length > 0) {
                const recentMaterials = await this.prisma.material.findMany({
                    where: {
                        id: { in: recentMaterialIds },
                        userId
                    },
                    select: { category: true }
                });
                recommendedCategories = recentMaterials
                    .map(m => m.category)
                    .filter((c) => c !== null);
            }
            const materials = await this.prisma.material.findMany({
                where: {
                    userId,
                    id: { notIn: recentMaterialIds },
                    ...(recommendedCategories.length > 0 ? {
                        category: { in: recommendedCategories }
                    } : {})
                },
                take: limit,
                orderBy: { createdAt: 'desc' }
            });
            return {
                success: true,
                data: materials
            };
        }
        catch (error) {
            console.error('获取推荐素材失败:', error);
            return {
                success: true,
                data: []
            };
        }
    }
};
exports.MaterialService = MaterialService;
exports.MaterialService = MaterialService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], MaterialService);


/***/ }),
/* 48 */
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
exports.SearchWizardMaterialsDto = exports.CheckSimilarityDto = exports.AnalyzeMaterialDto = exports.AddMaterialReferenceDto = exports.BatchUpdateCategoryDto = exports.BatchDeleteMaterialsDto = exports.QueryMaterialsDto = exports.UpdateMaterialDto = exports.CreateMaterialDto = void 0;
const class_validator_1 = __webpack_require__(20);
const swagger_1 = __webpack_require__(4);
const client_1 = __webpack_require__(12);
const class_transformer_1 = __webpack_require__(32);
class CreateMaterialDto {
}
exports.CreateMaterialDto = CreateMaterialDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '素材名称',
        example: '主角立绘.png'
    }),
    (0, class_validator_1.IsString)({ message: '名称必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: '名称不能为空' }),
    __metadata("design:type", String)
], CreateMaterialDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '素材类型',
        enum: client_1.MaterialType,
        example: 'IMAGE'
    }),
    (0, class_validator_1.IsEnum)(client_1.MaterialType, { message: '素材类型无效' }),
    __metadata("design:type", typeof (_a = typeof client_1.MaterialType !== "undefined" && client_1.MaterialType) === "function" ? _a : Object)
], CreateMaterialDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '分类',
        example: '角色设定'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMaterialDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '文件URL',
        example: 'https://example.com/file.png'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMaterialDto.prototype, "fileUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '文件大小（字节）',
        example: 102400
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateMaterialDto.prototype, "fileSize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '描述'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMaterialDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '标签列表',
        example: ['角色', '主角', '设定']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateMaterialDto.prototype, "tags", void 0);
class UpdateMaterialDto {
}
exports.UpdateMaterialDto = UpdateMaterialDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '素材名称' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMaterialDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '素材类型', enum: client_1.MaterialType }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.MaterialType),
    __metadata("design:type", typeof (_b = typeof client_1.MaterialType !== "undefined" && client_1.MaterialType) === "function" ? _b : Object)
], UpdateMaterialDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '分类' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMaterialDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '文件URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMaterialDto.prototype, "fileUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '文件大小' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateMaterialDto.prototype, "fileSize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '描述' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMaterialDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '标签列表' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateMaterialDto.prototype, "tags", void 0);
class QueryMaterialsDto {
    constructor() {
        this.page = 1;
        this.pageSize = 20;
    }
}
exports.QueryMaterialsDto = QueryMaterialsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '素材类型筛选',
        enum: client_1.MaterialType
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.MaterialType),
    __metadata("design:type", typeof (_c = typeof client_1.MaterialType !== "undefined" && client_1.MaterialType) === "function" ? _c : Object)
], QueryMaterialsDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '分类筛选'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryMaterialsDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '关键词搜索'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryMaterialsDto.prototype, "keyword", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '标签筛选（逗号分隔）',
        example: '角色,主角'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryMaterialsDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '页码',
        example: 1,
        minimum: 1
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryMaterialsDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '每页数量',
        example: 20,
        minimum: 1,
        maximum: 100
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryMaterialsDto.prototype, "pageSize", void 0);
class BatchDeleteMaterialsDto {
}
exports.BatchDeleteMaterialsDto = BatchDeleteMaterialsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '素材ID列表',
        example: ['id1', 'id2', 'id3']
    }),
    (0, class_validator_1.IsArray)({ message: 'materialIds必须是数组' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'materialIds不能为空' }),
    __metadata("design:type", Array)
], BatchDeleteMaterialsDto.prototype, "materialIds", void 0);
class BatchUpdateCategoryDto {
}
exports.BatchUpdateCategoryDto = BatchUpdateCategoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '素材ID列表',
        example: ['id1', 'id2']
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Array)
], BatchUpdateCategoryDto.prototype, "materialIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '新分类',
        example: '角色设定'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BatchUpdateCategoryDto.prototype, "category", void 0);
class AddMaterialReferenceDto {
}
exports.AddMaterialReferenceDto = AddMaterialReferenceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '章节ID',
        example: 'chapter_xxx'
    }),
    (0, class_validator_1.IsString)({ message: '章节ID必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: '章节ID不能为空' }),
    __metadata("design:type", String)
], AddMaterialReferenceDto.prototype, "chapterId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '小说ID',
        example: 'novel_xxx'
    }),
    (0, class_validator_1.IsString)({ message: '小说ID必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: '小说ID不能为空' }),
    __metadata("design:type", String)
], AddMaterialReferenceDto.prototype, "novelId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '引用上下文',
        example: '在第三章中描述主角外貌时使用'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddMaterialReferenceDto.prototype, "context", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '在章节中的位置',
        example: 100
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], AddMaterialReferenceDto.prototype, "position", void 0);
class AnalyzeMaterialDto {
}
exports.AnalyzeMaterialDto = AnalyzeMaterialDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '分析类型',
        enum: ['style', 'structure', 'characters', 'themes'],
        example: 'style'
    }),
    (0, class_validator_1.IsEnum)(['style', 'structure', 'characters', 'themes'], { message: '分析类型无效' }),
    __metadata("design:type", String)
], AnalyzeMaterialDto.prototype, "analysisType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '提取文本长度',
        example: 500,
        default: 500
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(100),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], AnalyzeMaterialDto.prototype, "extractLength", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '目标用途',
        enum: ['reference', 'inspiration', 'template'],
        example: 'reference'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['reference', 'inspiration', 'template']),
    __metadata("design:type", String)
], AnalyzeMaterialDto.prototype, "targetUse", void 0);
class CheckSimilarityDto {
}
exports.CheckSimilarityDto = CheckSimilarityDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '待检测内容',
        example: '这是一段需要检测的文本...'
    }),
    (0, class_validator_1.IsString)({ message: '内容必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: '内容不能为空' }),
    __metadata("design:type", String)
], CheckSimilarityDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '相似度阈值',
        example: 0.7,
        minimum: 0,
        maximum: 1
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CheckSimilarityDto.prototype, "threshold", void 0);
class SearchWizardMaterialsDto {
}
exports.SearchWizardMaterialsDto = SearchWizardMaterialsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '向导步骤类型',
        enum: ['outline', 'character', 'worldview', 'scene', 'dialogue'],
        example: 'character'
    }),
    (0, class_validator_1.IsEnum)(['outline', 'character', 'worldview', 'scene', 'dialogue'], { message: '步骤类型无效' }),
    __metadata("design:type", String)
], SearchWizardMaterialsDto.prototype, "stepType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '用户输入的关键词',
        example: '主角 性格'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchWizardMaterialsDto.prototype, "keyword", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '返回数量限制',
        example: 5,
        default: 5
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SearchWizardMaterialsDto.prototype, "limit", void 0);


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
exports.MigrationModule = void 0;
const common_1 = __webpack_require__(3);
const migration_controller_1 = __webpack_require__(50);
const migration_service_1 = __webpack_require__(51);
const database_1 = __webpack_require__(9);
const guards_1 = __webpack_require__(16);
let MigrationModule = class MigrationModule {
};
exports.MigrationModule = MigrationModule;
exports.MigrationModule = MigrationModule = __decorate([
    (0, common_1.Module)({
        imports: [database_1.DatabaseModule],
        controllers: [migration_controller_1.MigrationController],
        providers: [migration_service_1.MigrationService, guards_1.JwtAuthGuard],
        exports: [migration_service_1.MigrationService],
    })
], MigrationModule);


/***/ }),
/* 50 */
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
exports.MigrationController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(4);
const guards_1 = __webpack_require__(16);
const migration_service_1 = __webpack_require__(51);
const migration_dto_1 = __webpack_require__(52);
let MigrationController = class MigrationController {
    constructor(migrationService) {
        this.migrationService = migrationService;
    }
    async startMigration(req, dto) {
        return this.migrationService.startMigration(req.user.id, dto);
    }
    async batchImportNovels(req, dto) {
        return this.migrationService.batchImportNovels(req.user.id, dto);
    }
    async validateData(req, dto) {
        return this.migrationService.validateMigrationData(req.user.id, dto);
    }
    async getMigrationHistory(req) {
        return this.migrationService.getMigrationHistory(req.user.id);
    }
    async getMigrationDetail(req, id) {
        return this.migrationService.getMigrationDetail(req.user.id, id);
    }
    async rollbackMigration(req, id) {
        return this.migrationService.rollbackMigration(req.user.id, id);
    }
};
exports.MigrationController = MigrationController;
__decorate([
    (0, common_1.Post)('migrations/start'),
    (0, swagger_1.ApiOperation)({
        summary: '开始数据迁移',
        description: '从本地数据迁移到云端'
    }),
    (0, swagger_1.ApiBody)({ type: migration_dto_1.StartMigrationDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '迁移开始' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_b = typeof migration_dto_1.StartMigrationDto !== "undefined" && migration_dto_1.StartMigrationDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], MigrationController.prototype, "startMigration", null);
__decorate([
    (0, common_1.Post)('migrations/batch-import-novels'),
    (0, swagger_1.ApiOperation)({
        summary: '批量导入小说',
        description: '一次性导入多部小说及其章节'
    }),
    (0, swagger_1.ApiBody)({ type: migration_dto_1.BatchImportNovelsDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '导入成功' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_c = typeof migration_dto_1.BatchImportNovelsDto !== "undefined" && migration_dto_1.BatchImportNovelsDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], MigrationController.prototype, "batchImportNovels", null);
__decorate([
    (0, common_1.Post)('migrations/validate'),
    (0, swagger_1.ApiOperation)({
        summary: '验证迁移数据',
        description: '在迁移前验证数据格式和完整性'
    }),
    (0, swagger_1.ApiBody)({ type: migration_dto_1.ValidateMigrationDataDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '验证完成' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_d = typeof migration_dto_1.ValidateMigrationDataDto !== "undefined" && migration_dto_1.ValidateMigrationDataDto) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], MigrationController.prototype, "validateData", null);
__decorate([
    (0, common_1.Get)('migrations/history'),
    (0, swagger_1.ApiOperation)({
        summary: '获取迁移历史',
        description: '查看历史迁移记录'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MigrationController.prototype, "getMigrationHistory", null);
__decorate([
    (0, common_1.Get)('migrations/:id'),
    (0, swagger_1.ApiOperation)({
        summary: '获取迁移详情',
        description: '查看单次迁移的详细信息'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '迁移ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MigrationController.prototype, "getMigrationDetail", null);
__decorate([
    (0, common_1.Post)('migrations/:id/rollback'),
    (0, swagger_1.ApiOperation)({
        summary: '回滚迁移',
        description: '回滚指定的迁移操作'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '迁移ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '回滚成功' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MigrationController.prototype, "rollbackMigration", null);
exports.MigrationController = MigrationController = __decorate([
    (0, swagger_1.ApiTags)('数据迁移'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof migration_service_1.MigrationService !== "undefined" && migration_service_1.MigrationService) === "function" ? _a : Object])
], MigrationController);


/***/ }),
/* 51 */
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
exports.MigrationService = void 0;
const common_1 = __webpack_require__(3);
const database_1 = __webpack_require__(9);
const client_1 = __webpack_require__(12);
let MigrationService = class MigrationService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async startMigration(userId, dto) {
        const migration = await this.prisma.dataMigration.create({
            data: {
                userId,
                migrationType: dto.migrationType,
                status: client_1.MigrationStatus.PENDING,
                sourceData: dto.sourceData,
                metadata: dto.metadata,
                startedAt: new Date(),
            },
        });
        try {
            const result = await this.processMigration(userId, migration.id, dto);
            return { success: true, data: { migrationId: migration.id, ...result } };
        }
        catch (error) {
            await this.prisma.dataMigration.update({
                where: { id: migration.id },
                data: {
                    status: client_1.MigrationStatus.FAILED,
                    errorLog: { error: error.message },
                    completedAt: new Date(),
                },
            });
            throw error;
        }
    }
    async processMigration(userId, migrationId, dto) {
        let totalItems = 0;
        let successItems = 0;
        let failedItems = 0;
        const errors = [];
        await this.prisma.dataMigration.update({
            where: { id: migrationId },
            data: { status: client_1.MigrationStatus.PROCESSING },
        });
        try {
            switch (dto.migrationType) {
                case client_1.MigrationType.NOVELS:
                case client_1.MigrationType.FULL:
                    const novelResult = await this.migrateNovels(userId, dto.sourceData);
                    totalItems += novelResult.total;
                    successItems += novelResult.success;
                    failedItems += novelResult.failed;
                    errors.push(...novelResult.errors);
                    break;
                case client_1.MigrationType.MATERIALS:
                    const materialResult = await this.migrateMaterials(userId, dto.sourceData);
                    totalItems += materialResult.total;
                    successItems += materialResult.success;
                    failedItems += materialResult.failed;
                    errors.push(...materialResult.errors);
                    break;
                default:
                    throw new common_1.HttpException('不支持的迁移类型', common_1.HttpStatus.BAD_REQUEST);
            }
            await this.prisma.dataMigration.update({
                where: { id: migrationId },
                data: {
                    status: client_1.MigrationStatus.COMPLETED,
                    totalItems,
                    processedItems: totalItems,
                    successItems,
                    failedItems,
                    errorLog: errors.length > 0 ? errors : undefined,
                    completedAt: new Date(),
                },
            });
            return { totalItems, successItems, failedItems, errors };
        }
        catch (error) {
            throw error;
        }
    }
    async migrateNovels(userId, sourceData) {
        const novels = sourceData.novels || [];
        let success = 0;
        let failed = 0;
        const errors = [];
        for (const novelData of novels) {
            try {
                const novel = await this.prisma.novel.create({
                    data: {
                        userId,
                        title: novelData.title || '未命名小说',
                        description: novelData.description,
                        genre: novelData.genre,
                        status: novelData.status || 'DRAFT',
                        wordCount: novelData.wordCount || 0,
                        chapterCount: novelData.chapters?.length || 0,
                    },
                });
                if (novelData.chapters && novelData.chapters.length > 0) {
                    for (let i = 0; i < novelData.chapters.length; i++) {
                        const chapterData = novelData.chapters[i];
                        await this.prisma.chapter.create({
                            data: {
                                novelId: novel.id,
                                title: chapterData.title || `第${i + 1}章`,
                                content: chapterData.content || '',
                                chapterNumber: chapterData.chapterNumber || i + 1,
                                wordCount: chapterData.content?.length || 0,
                                status: chapterData.status || 'DRAFT',
                            },
                        });
                    }
                }
                success++;
            }
            catch (error) {
                failed++;
                errors.push({ novel: novelData.title, error: error.message });
            }
        }
        return { total: novels.length, success, failed, errors };
    }
    async migrateMaterials(userId, sourceData) {
        const materials = sourceData.materials || [];
        let success = 0;
        let failed = 0;
        const errors = [];
        for (const materialData of materials) {
            try {
                await this.prisma.material.create({
                    data: {
                        userId,
                        name: materialData.name,
                        type: materialData.type || 'TEXT',
                        category: materialData.category,
                        fileUrl: materialData.fileUrl,
                        fileSize: materialData.fileSize,
                        description: materialData.description,
                        tags: materialData.tags,
                    },
                });
                success++;
            }
            catch (error) {
                failed++;
                errors.push({ material: materialData.name, error: error.message });
            }
        }
        return { total: materials.length, success, failed, errors };
    }
    async batchImportNovels(userId, dto) {
        const results = [];
        let successCount = 0;
        let failedCount = 0;
        for (const novelData of dto.novels) {
            try {
                const novel = await this.prisma.novel.create({
                    data: {
                        userId,
                        title: novelData.title,
                        description: novelData.description,
                        genre: novelData.genre,
                        status: 'DRAFT',
                        chapterCount: novelData.chapters?.length || 0,
                    },
                });
                if (novelData.chapters && novelData.chapters.length > 0) {
                    for (let i = 0; i < novelData.chapters.length; i++) {
                        const chapterData = novelData.chapters[i];
                        await this.prisma.chapter.create({
                            data: {
                                novelId: novel.id,
                                title: chapterData.title,
                                content: chapterData.content,
                                chapterNumber: chapterData.chapterNumber || i + 1,
                                wordCount: chapterData.content.length,
                                status: 'DRAFT',
                            },
                        });
                    }
                }
                results.push({ title: novelData.title, status: 'success', novelId: novel.id });
                successCount++;
            }
            catch (error) {
                results.push({ title: novelData.title, status: 'failed', error: error.message });
                failedCount++;
            }
        }
        return {
            success: true,
            data: { results, successCount, failedCount, total: dto.novels.length },
        };
    }
    async validateMigrationData(userId, dto) {
        const errors = [];
        let isValid = true;
        switch (dto.migrationType) {
            case client_1.MigrationType.NOVELS:
                if (!dto.data.novels || !Array.isArray(dto.data.novels)) {
                    errors.push({ field: 'novels', message: '小说数据必须是数组' });
                    isValid = false;
                }
                else {
                    dto.data.novels.forEach((novel, index) => {
                        if (!novel.title) {
                            errors.push({ index, field: 'title', message: '小说标题不能为空' });
                            isValid = false;
                        }
                    });
                }
                break;
            case client_1.MigrationType.MATERIALS:
                if (!dto.data.materials || !Array.isArray(dto.data.materials)) {
                    errors.push({ field: 'materials', message: '素材数据必须是数组' });
                    isValid = false;
                }
                break;
            default:
                errors.push({ message: '不支持的迁移类型' });
                isValid = false;
        }
        return { success: true, data: { isValid, errors } };
    }
    async getMigrationHistory(userId) {
        const migrations = await this.prisma.dataMigration.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        return { success: true, data: migrations };
    }
    async getMigrationDetail(userId, migrationId) {
        const migration = await this.prisma.dataMigration.findUnique({
            where: { id: migrationId },
        });
        if (!migration || migration.userId !== userId) {
            throw new common_1.HttpException('迁移记录不存在', common_1.HttpStatus.NOT_FOUND);
        }
        return { success: true, data: migration };
    }
    async rollbackMigration(userId, migrationId) {
        const migration = await this.prisma.dataMigration.findUnique({
            where: { id: migrationId },
        });
        if (!migration || migration.userId !== userId) {
            throw new common_1.HttpException('迁移记录不存在', common_1.HttpStatus.NOT_FOUND);
        }
        if (migration.status !== client_1.MigrationStatus.COMPLETED) {
            throw new common_1.HttpException('只能回滚已完成的迁移', common_1.HttpStatus.BAD_REQUEST);
        }
        await this.prisma.dataMigration.update({
            where: { id: migrationId },
            data: { status: client_1.MigrationStatus.ROLLED_BACK },
        });
        return { success: true, message: '迁移已回滚' };
    }
};
exports.MigrationService = MigrationService;
exports.MigrationService = MigrationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], MigrationService);


/***/ }),
/* 52 */
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
exports.RollbackMigrationDto = exports.ValidateMigrationDataDto = exports.BatchImportNovelsDto = exports.StartMigrationDto = void 0;
const class_validator_1 = __webpack_require__(20);
const swagger_1 = __webpack_require__(4);
const client_1 = __webpack_require__(12);
class StartMigrationDto {
}
exports.StartMigrationDto = StartMigrationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '迁移类型',
        enum: client_1.MigrationType,
        example: 'NOVELS'
    }),
    (0, class_validator_1.IsEnum)(client_1.MigrationType, { message: '迁移类型无效' }),
    __metadata("design:type", typeof (_a = typeof client_1.MigrationType !== "undefined" && client_1.MigrationType) === "function" ? _a : Object)
], StartMigrationDto.prototype, "migrationType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '源数据',
        example: {
            novels: [
                { title: '测试小说', description: '测试描述', chapters: [] }
            ]
        }
    }),
    (0, class_validator_1.IsNotEmpty)({ message: '源数据不能为空' }),
    (0, class_validator_1.IsObject)({ message: '源数据必须是对象' }),
    __metadata("design:type", typeof (_b = typeof Record !== "undefined" && Record) === "function" ? _b : Object)
], StartMigrationDto.prototype, "sourceData", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '元数据',
        example: { source: 'localStorage', version: '1.0' }
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_c = typeof Record !== "undefined" && Record) === "function" ? _c : Object)
], StartMigrationDto.prototype, "metadata", void 0);
class BatchImportNovelsDto {
}
exports.BatchImportNovelsDto = BatchImportNovelsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '小说数据列表',
        example: [
            {
                title: '小说标题',
                description: '小说简介',
                genre: '玄幻',
                chapters: [
                    { title: '第一章', content: '章节内容' }
                ]
            }
        ]
    }),
    (0, class_validator_1.IsArray)({ message: '小说数据必须是数组' }),
    (0, class_validator_1.IsNotEmpty)({ message: '小说数据不能为空' }),
    __metadata("design:type", typeof (_d = typeof Array !== "undefined" && Array) === "function" ? _d : Object)
], BatchImportNovelsDto.prototype, "novels", void 0);
class ValidateMigrationDataDto {
}
exports.ValidateMigrationDataDto = ValidateMigrationDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '迁移类型',
        enum: client_1.MigrationType
    }),
    (0, class_validator_1.IsEnum)(client_1.MigrationType),
    __metadata("design:type", typeof (_e = typeof client_1.MigrationType !== "undefined" && client_1.MigrationType) === "function" ? _e : Object)
], ValidateMigrationDataDto.prototype, "migrationType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '待验证数据'
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", typeof (_f = typeof Record !== "undefined" && Record) === "function" ? _f : Object)
], ValidateMigrationDataDto.prototype, "data", void 0);
class RollbackMigrationDto {
}
exports.RollbackMigrationDto = RollbackMigrationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '迁移ID'
    }),
    (0, class_validator_1.IsNotEmpty)({ message: '迁移ID不能为空' }),
    __metadata("design:type", String)
], RollbackMigrationDto.prototype, "migrationId", void 0);


/***/ }),
/* 53 */
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
const prompt_controller_1 = __webpack_require__(54);
const prompt_service_1 = __webpack_require__(55);
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PromptController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(4);
const prompt_service_1 = __webpack_require__(55);
const prompt_dto_1 = __webpack_require__(56);
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
/* 56 */
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
/* 57 */
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
const collaboration_controller_1 = __webpack_require__(58);
const collaboration_service_1 = __webpack_require__(59);
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CollaborationController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(4);
const collaboration_service_1 = __webpack_require__(59);
const collaboration_dto_1 = __webpack_require__(60);
const common_2 = __webpack_require__(61);
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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CollaborationService = void 0;
const common_1 = __webpack_require__(3);
const database_1 = __webpack_require__(9);
const collaboration_dto_1 = __webpack_require__(60);
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
/* 60 */
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
/* 61 */
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
__exportStar(__webpack_require__(62), exports);
__exportStar(__webpack_require__(16), exports);
__exportStar(__webpack_require__(65), exports);
__exportStar(__webpack_require__(66), exports);
__exportStar(__webpack_require__(67), exports);
__exportStar(__webpack_require__(68), exports);


/***/ }),
/* 62 */
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
__exportStar(__webpack_require__(63), exports);
__exportStar(__webpack_require__(64), exports);


/***/ }),
/* 63 */
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
/* 64 */
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
/* 65 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 66 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 67 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 68 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 69 */
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
const version_controller_1 = __webpack_require__(70);
const version_service_1 = __webpack_require__(71);
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
/* 70 */
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
const version_service_1 = __webpack_require__(71);
const version_dto_1 = __webpack_require__(72);
const common_2 = __webpack_require__(61);
let VersionController = class VersionController {
    constructor(versionService) {
        this.versionService = versionService;
    }
    async createVersion(req, dto) {
        dto.userId = req.user.id;
        return this.versionService.createVersion(dto);
    }
    async getChapterVersionHistory(chapterId, limit, req) {
        return this.versionService.getChapterVersionHistory(chapterId, limit ? parseInt(limit.toString()) : 50);
    }
    async getVersion(chapterId, versionNumber, req) {
        return this.versionService.getVersion(chapterId, parseInt(versionNumber));
    }
    async compareVersions(req, dto) {
        return this.versionService.compareVersions(dto);
    }
    async restoreVersion(req, dto) {
        dto.userId = req.user.id;
        return this.versionService.restoreVersion(dto);
    }
    async cleanupOldVersions(chapterId, keepCount, req) {
        return this.versionService.cleanupOldVersions(chapterId, keepCount ? parseInt(keepCount.toString()) : 100);
    }
    async getVersionStats(chapterId, req) {
        return this.versionService.getVersionStats(chapterId);
    }
};
exports.VersionController = VersionController;
__decorate([
    (0, common_1.Post)('versions'),
    (0, swagger_1.ApiOperation)({
        summary: '创建章节版本快照',
        description: '为章节创建一个版本快照，用于后续回滚或对比'
    }),
    (0, swagger_1.ApiBody)({ type: version_dto_1.CreateVersionDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: '版本创建成功',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'cm1234567890' },
                        versionNumber: { type: 'number', example: 1 },
                        title: { type: 'string', example: '第一章：开端' },
                        wordCount: { type: 'number', example: 2500 },
                        changeLog: { type: 'string', example: '修改了角色对话' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '参数验证失败' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '未授权访问' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '章节不存在' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_b = typeof version_dto_1.CreateVersionDto !== "undefined" && version_dto_1.CreateVersionDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], VersionController.prototype, "createVersion", null);
__decorate([
    (0, common_1.Get)('versions/chapter/:chapterId/history'),
    (0, swagger_1.ApiOperation)({
        summary: '获取章节版本历史',
        description: '获取指定章节的所有版本历史记录'
    }),
    (0, swagger_1.ApiParam)({ name: 'chapterId', description: '章节ID' }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: '限制返回的版本数量',
        example: 50
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
                            versionNumber: { type: 'number' },
                            title: { type: 'string' },
                            wordCount: { type: 'number' },
                            changeLog: { type: 'string' },
                            createdAt: { type: 'string', format: 'date-time' },
                            user: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    email: { type: 'string' },
                                    profile: {
                                        type: 'object',
                                        properties: {
                                            nickname: { type: 'string' },
                                            avatar: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '未授权访问' }),
    __param(0, (0, common_1.Param)('chapterId')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object]),
    __metadata("design:returntype", Promise)
], VersionController.prototype, "getChapterVersionHistory", null);
__decorate([
    (0, common_1.Get)('versions/chapter/:chapterId/version/:versionNumber'),
    (0, swagger_1.ApiOperation)({
        summary: '获取特定版本',
        description: '获取指定版本号的完整版本内容'
    }),
    (0, swagger_1.ApiParam)({ name: 'chapterId', description: '章节ID' }),
    (0, swagger_1.ApiParam)({ name: 'versionNumber', description: '版本号' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取成功'
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '版本不存在' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '未授权访问' }),
    __param(0, (0, common_1.Param)('chapterId')),
    __param(1, (0, common_1.Param)('versionNumber')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], VersionController.prototype, "getVersion", null);
__decorate([
    (0, common_1.Post)('versions/compare'),
    (0, swagger_1.ApiOperation)({
        summary: '对比两个版本',
        description: '对比两个版本之间的差异，包括内容、字数等'
    }),
    (0, swagger_1.ApiBody)({ type: version_dto_1.CompareVersionsDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '对比成功',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        version1: {
                            type: 'object',
                            properties: {
                                versionNumber: { type: 'number' },
                                title: { type: 'string' },
                                wordCount: { type: 'number' },
                                createdAt: { type: 'string', format: 'date-time' }
                            }
                        },
                        version2: {
                            type: 'object',
                            properties: {
                                versionNumber: { type: 'number' },
                                title: { type: 'string' },
                                wordCount: { type: 'number' },
                                createdAt: { type: 'string', format: 'date-time' }
                            }
                        },
                        diff: {
                            type: 'object',
                            properties: {
                                wordCountDiff: { type: 'number', example: 500 },
                                contentLengthDiff: { type: 'number', example: 1500 },
                                titleChanged: { type: 'boolean', example: false }
                            }
                        },
                        content1: { type: 'string' },
                        content2: { type: 'string' }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '参数验证失败' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '版本不存在' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '未授权访问' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_c = typeof version_dto_1.CompareVersionsDto !== "undefined" && version_dto_1.CompareVersionsDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], VersionController.prototype, "compareVersions", null);
__decorate([
    (0, common_1.Post)('versions/restore'),
    (0, swagger_1.ApiOperation)({
        summary: '回滚到指定版本',
        description: '将章节内容回滚到指定的历史版本，并创建新的版本记录'
    }),
    (0, swagger_1.ApiBody)({ type: version_dto_1.RestoreVersionDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '回滚成功',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        chapter: {
                            type: 'object',
                            description: '更新后的章节'
                        },
                        newVersion: {
                            type: 'object',
                            description: '回滚操作创建的新版本'
                        },
                        restoredFrom: {
                            type: 'object',
                            description: '回滚的源版本'
                        }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '参数验证失败' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '版本不存在' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '未授权访问' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_d = typeof version_dto_1.RestoreVersionDto !== "undefined" && version_dto_1.RestoreVersionDto) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], VersionController.prototype, "restoreVersion", null);
__decorate([
    (0, common_1.Delete)('versions/chapter/:chapterId/cleanup'),
    (0, swagger_1.ApiOperation)({
        summary: '清理旧版本',
        description: '清理章节的旧版本记录，保留指定数量的最新版本'
    }),
    (0, swagger_1.ApiParam)({ name: 'chapterId', description: '章节ID' }),
    (0, swagger_1.ApiQuery)({
        name: 'keepCount',
        required: false,
        type: Number,
        description: '保留的版本数量',
        example: 100
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '清理成功',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        deleted: { type: 'number', example: 10 },
                        message: { type: 'string', example: '清理了 10 个旧版本' }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '未授权访问' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('chapterId')),
    __param(1, (0, common_1.Query)('keepCount')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object]),
    __metadata("design:returntype", Promise)
], VersionController.prototype, "cleanupOldVersions", null);
__decorate([
    (0, common_1.Get)('versions/chapter/:chapterId/stats'),
    (0, swagger_1.ApiOperation)({
        summary: '获取版本统计信息',
        description: '获取章节的版本数量、字数变化等统计信息'
    }),
    (0, swagger_1.ApiParam)({ name: 'chapterId', description: '章节ID' }),
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
                        totalVersions: { type: 'number', example: 15 },
                        firstVersion: {
                            type: 'object',
                            properties: {
                                versionNumber: { type: 'number', example: 1 },
                                createdAt: { type: 'string', format: 'date-time' },
                                wordCount: { type: 'number', example: 2000 }
                            }
                        },
                        latestVersion: {
                            type: 'object',
                            properties: {
                                versionNumber: { type: 'number', example: 15 },
                                createdAt: { type: 'string', format: 'date-time' },
                                wordCount: { type: 'number', example: 2500 }
                            }
                        },
                        totalWordCountChange: { type: 'number', example: 500 }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '未授权访问' }),
    __param(0, (0, common_1.Param)('chapterId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VersionController.prototype, "getVersionStats", null);
exports.VersionController = VersionController = __decorate([
    (0, swagger_1.ApiTags)('章节版本控制'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof version_service_1.VersionService !== "undefined" && version_service_1.VersionService) === "function" ? _a : Object])
], VersionController);


/***/ }),
/* 71 */
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
/* 72 */
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
const swagger_1 = __webpack_require__(4);
const class_transformer_1 = __webpack_require__(32);
class CreateVersionDto {
}
exports.CreateVersionDto = CreateVersionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '章节ID',
        example: 'cm1234567890'
    }),
    (0, class_validator_1.IsString)({ message: '章节ID必须是字符串' }),
    __metadata("design:type", String)
], CreateVersionDto.prototype, "chapterId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '用户ID',
        example: 'cm0987654321'
    }),
    (0, class_validator_1.IsString)({ message: '用户ID必须是字符串' }),
    __metadata("design:type", String)
], CreateVersionDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '版本变更说明',
        example: '修改了角色对话，调整了故事节奏',
        maxLength: 500
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '变更说明必须是字符串' }),
    (0, class_validator_1.MaxLength)(500, { message: '变更说明不能超过500个字符' }),
    __metadata("design:type", String)
], CreateVersionDto.prototype, "changeLog", void 0);
class CompareVersionsDto {
}
exports.CompareVersionsDto = CompareVersionsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '章节ID',
        example: 'cm1234567890'
    }),
    (0, class_validator_1.IsString)({ message: '章节ID必须是字符串' }),
    __metadata("design:type", String)
], CompareVersionsDto.prototype, "chapterId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '第一个版本号',
        example: 1,
        minimum: 1
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: '版本号必须是整数' }),
    __metadata("design:type", Number)
], CompareVersionsDto.prototype, "version1", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '第二个版本号',
        example: 2,
        minimum: 1
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: '版本号必须是整数' }),
    __metadata("design:type", Number)
], CompareVersionsDto.prototype, "version2", void 0);
class RestoreVersionDto {
}
exports.RestoreVersionDto = RestoreVersionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '章节ID',
        example: 'cm1234567890'
    }),
    (0, class_validator_1.IsString)({ message: '章节ID必须是字符串' }),
    __metadata("design:type", String)
], RestoreVersionDto.prototype, "chapterId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '要回滚到的版本号',
        example: 5,
        minimum: 1
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: '版本号必须是整数' }),
    __metadata("design:type", Number)
], RestoreVersionDto.prototype, "versionNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '用户ID',
        example: 'cm0987654321'
    }),
    (0, class_validator_1.IsString)({ message: '用户ID必须是字符串' }),
    __metadata("design:type", String)
], RestoreVersionDto.prototype, "userId", void 0);


/***/ }),
/* 73 */
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
const comment_controller_1 = __webpack_require__(74);
const comment_service_1 = __webpack_require__(75);
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
/* 74 */
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
const comment_service_1 = __webpack_require__(75);
const comment_dto_1 = __webpack_require__(76);
const common_2 = __webpack_require__(61);
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
/* 75 */
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
const comment_dto_1 = __webpack_require__(76);
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
/* 76 */
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
/* 77 */
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
const health_controller_1 = __webpack_require__(78);
const health_service_1 = __webpack_require__(79);
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
/* 78 */
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
const health_service_1 = __webpack_require__(79);
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
/* 79 */
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
/* 80 */
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
const passport_jwt_1 = __webpack_require__(81);
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
        try {
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
        catch (error) {
            console.error('JWT validation error:', error);
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.UnauthorizedException('Token验证失败');
        }
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _b : Object])
], JwtStrategy);


/***/ }),
/* 81 */
/***/ ((module) => {

module.exports = require("passport-jwt");

/***/ }),
/* 82 */
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
            fullException: exception,
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
/* 83 */
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
const operators_1 = __webpack_require__(84);
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
/* 84 */
/***/ ((module) => {

module.exports = require("rxjs/operators");

/***/ }),
/* 85 */
/***/ ((module) => {

module.exports = require("express");

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
const all_exceptions_filter_1 = __webpack_require__(82);
const response_interceptor_1 = __webpack_require__(83);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bodyParser: true,
    });
    const express = __webpack_require__(85);
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));
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