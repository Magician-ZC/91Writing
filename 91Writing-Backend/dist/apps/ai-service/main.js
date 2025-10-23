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
const jwt_1 = __webpack_require__(6);
const passport_1 = __webpack_require__(7);
const microservices_1 = __webpack_require__(8);
const database_1 = __webpack_require__(9);
const assistant_module_1 = __webpack_require__(13);
const generation_module_1 = __webpack_require__(46);
const suggestion_module_1 = __webpack_require__(51);
const wizard_module_1 = __webpack_require__(55);
const health_module_1 = __webpack_require__(56);
const video_generation_module_1 = __webpack_require__(59);
const jwt_strategy_1 = __webpack_require__(83);
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
                    secret: configService.get('JWT_SECRET'),
                    signOptions: {
                        expiresIn: '7d',
                    },
                }),
                inject: [config_1.ConfigService],
            }),
            database_1.DatabaseModule,
            microservices_1.ClientsModule.register([
                {
                    name: 'USER_SERVICE',
                    transport: microservices_1.Transport.TCP,
                    options: {
                        host: process.env.USER_SERVICE_HOST || 'localhost',
                        port: parseInt(process.env.USER_SERVICE_PORT) || 3004,
                    },
                },
            ]),
            assistant_module_1.AssistantModule,
            generation_module_1.GenerationModule,
            suggestion_module_1.SuggestionModule,
            wizard_module_1.WizardModule,
            health_module_1.HealthModule,
            video_generation_module_1.VideoGenerationModule,
        ],
        providers: [jwt_strategy_1.JwtStrategy],
        exports: [microservices_1.ClientsModule, jwt_strategy_1.JwtStrategy, passport_1.PassportModule],
    })
], AppModule);


/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),
/* 7 */
/***/ ((module) => {

module.exports = require("@nestjs/passport");

/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("@nestjs/microservices");

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
const common_1 = __webpack_require__(2);
const config_1 = __webpack_require__(5);
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
const common_1 = __webpack_require__(2);
const config_1 = __webpack_require__(5);
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
exports.AssistantModule = void 0;
const common_1 = __webpack_require__(2);
const microservices_1 = __webpack_require__(8);
const database_1 = __webpack_require__(9);
const assistant_service_1 = __webpack_require__(14);
const assistant_controller_1 = __webpack_require__(26);
const ai_caller_service_1 = __webpack_require__(17);
const context_manager_service_1 = __webpack_require__(45);
const common_2 = __webpack_require__(28);
const claude_provider_1 = __webpack_require__(22);
const deepseek_provider_1 = __webpack_require__(23);
const openai_provider_1 = __webpack_require__(19);
let AssistantModule = class AssistantModule {
};
exports.AssistantModule = AssistantModule;
exports.AssistantModule = AssistantModule = __decorate([
    (0, common_1.Module)({
        imports: [
            database_1.DatabaseModule,
            microservices_1.ClientsModule.register([
                {
                    name: 'USER_SERVICE',
                    transport: microservices_1.Transport.TCP,
                    options: {
                        host: process.env.USER_SERVICE_HOST || 'localhost',
                        port: parseInt(process.env.USER_SERVICE_PORT) || 3002,
                    },
                },
            ]),
        ],
        controllers: [assistant_controller_1.AssistantController],
        providers: [
            assistant_service_1.AssistantService,
            ai_caller_service_1.AICallerService,
            context_manager_service_1.ContextManagerService,
            common_2.FeatureQuotaService,
            claude_provider_1.ClaudeProvider,
            deepseek_provider_1.DeepSeekProvider,
            openai_provider_1.OpenAIProvider,
        ],
        exports: [assistant_service_1.AssistantService],
    })
], AssistantModule);


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
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AssistantService = void 0;
const common_1 = __webpack_require__(2);
const database_1 = __webpack_require__(9);
const conversation_dto_1 = __webpack_require__(15);
const ai_caller_service_1 = __webpack_require__(17);
let AssistantService = class AssistantService {
    constructor(prisma, aiCallerService) {
        this.prisma = prisma;
        this.aiCallerService = aiCallerService;
        this.activeSessions = new Map();
    }
    async initializeSession(userId, initDto) {
        const novel = await this.prisma.novel.findFirst({
            where: {
                id: initDto.novelId,
                userId
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
            },
        });
        if (!novel) {
            throw new common_1.NotFoundException('小说不存在或无权访问');
        }
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const session = {
            sessionId,
            userId,
            novelId: initDto.novelId,
            novel,
            currentContext: {
                novel: novel,
                currentChapter: initDto.currentChapter,
                writingGoals: initDto.writingGoals || [],
                userPreferences: initDto.userPreferences || {},
            },
            conversationHistory: [],
            createdAt: new Date(),
            lastActivity: new Date(),
        };
        this.activeSessions.set(sessionId, session);
        const currentStatus = this.analyzeWritingStatus(novel);
        const welcomeMessage = this.generateWelcomeMessage(novel, currentStatus);
        this.addToHistory(sessionId, {
            type: 'assistant',
            content: welcomeMessage,
            timestamp: new Date().toISOString(),
            metadata: { event: 'session_start', status: currentStatus }
        });
        return {
            sessionId,
            welcome: welcomeMessage,
            status: currentStatus,
            suggestions: this.getInitialSuggestions(currentStatus),
            novelInfo: {
                id: novel.id,
                title: novel.title,
                genre: novel.genre,
                wordCount: novel.wordCount,
                chapterCount: novel.chapterCount,
            },
        };
    }
    async handleConversation(userId, conversationDto) {
        let session;
        if (conversationDto.sessionId) {
            session = this.activeSessions.get(conversationDto.sessionId);
            if (!session || session.userId !== userId) {
                throw new common_1.NotFoundException('会话不存在或无权访问');
            }
        }
        else if (conversationDto.novelId) {
            const sessionResult = await this.initializeSession(userId, {
                novelId: conversationDto.novelId,
            });
            session = this.activeSessions.get(sessionResult.sessionId);
        }
        else {
            throw new common_1.BadRequestException('需要提供会话ID或小说ID');
        }
        session.lastActivity = new Date();
        this.addToHistory(session.sessionId, {
            type: 'user',
            content: conversationDto.message,
            timestamp: new Date().toISOString(),
            context: conversationDto.context || {}
        });
        const intent = this.analyzeUserIntent(conversationDto.message, conversationDto.context);
        const response = await this.generateResponse(session, intent, conversationDto.message, conversationDto.context);
        this.addToHistory(session.sessionId, {
            type: 'assistant',
            content: response.message,
            timestamp: new Date().toISOString(),
            metadata: { intent, actions: response.actions }
        });
        await this.logAIUsage(userId, 'conversation', {
            intent: intent.intent,
            inputLength: conversationDto.message.length,
            outputLength: response.message.length,
        });
        return {
            sessionId: session.sessionId,
            ...response
        };
    }
    async getConversationHistory(userId, sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (!session || session.userId !== userId) {
            throw new common_1.NotFoundException('会话不存在或无权访问');
        }
        return {
            sessionId,
            conversationHistory: session.conversationHistory,
            novelInfo: {
                id: session.novel.id,
                title: session.novel.title,
            },
        };
    }
    cleanupSessions() {
        const now = new Date();
        const sessionTimeout = 2 * 60 * 60 * 1000;
        for (const [sessionId, session] of this.activeSessions) {
            if (now.getTime() - session.lastActivity.getTime() > sessionTimeout) {
                this.activeSessions.delete(sessionId);
            }
        }
    }
    analyzeUserIntent(message, context = {}) {
        const intents = {
            writing_request: [
                '帮我写', '续写', '完成', '生成', '创作',
                '写一段', '写几句', '写个开头', '写个结尾'
            ],
            revision_request: [
                '修改', '润色', '优化', '改进', '完善',
                '重写', '调整', '美化', '精简'
            ],
            plot_consultation: [
                '情节', '剧情', '故事', '发展', '转折',
                '冲突', '高潮', '结局', '接下来怎么写'
            ],
            character_consultation: [
                '角色', '人物', '性格', '对话', '行为',
                '主角', '配角', '反派', '人物关系'
            ],
            technique_consultation: [
                '技巧', '方法', '怎么写', '如何', '建议',
                '风格', '节奏', '描写', '叙述'
            ],
            analysis_request: [
                '分析', '评价', '看看', '检查', '评估',
                '怎么样', '问题', '不足', '优缺点'
            ]
        };
        let detectedIntent = conversation_dto_1.ConversationIntent.GENERAL_CHAT;
        let confidence = 0;
        for (const [intent, keywords] of Object.entries(intents)) {
            const matches = keywords.filter(keyword => message.toLowerCase().includes(keyword)).length;
            const currentConfidence = matches / keywords.length;
            if (currentConfidence > confidence) {
                confidence = currentConfidence;
                detectedIntent = intent;
            }
        }
        return {
            intent: detectedIntent,
            confidence,
            keywords: this.extractKeywords(message),
            entities: this.extractEntities(message, context)
        };
    }
    async generateResponse(session, intent, userMessage, context = {}) {
        try {
            switch (intent.intent) {
                case conversation_dto_1.ConversationIntent.WRITING_REQUEST:
                    return await this.handleWritingRequest(session, intent, userMessage, context);
                case conversation_dto_1.ConversationIntent.REVISION_REQUEST:
                    return await this.handleRevisionRequest(session, intent, userMessage, context);
                case conversation_dto_1.ConversationIntent.PLOT_CONSULTATION:
                    return await this.handlePlotConsultation(session, intent, userMessage, context);
                case conversation_dto_1.ConversationIntent.CHARACTER_CONSULTATION:
                    return await this.handleCharacterConsultation(session, intent, userMessage, context);
                case conversation_dto_1.ConversationIntent.TECHNIQUE_CONSULTATION:
                    return await this.handleTechniqueConsultation(session, intent, userMessage, context);
                case conversation_dto_1.ConversationIntent.ANALYSIS_REQUEST:
                    return await this.handleAnalysisRequest(session, intent, userMessage, context);
                default:
                    return await this.handleGeneralChat(session, intent, userMessage, context);
            }
        }
        catch (error) {
            console.error('Generate response error:', error);
            return this.handleError('处理失败，请重新描述您的需求', error);
        }
    }
    async handleWritingRequest(session, intent, userMessage, context) {
        const requirement = this.parseWritingRequirement(userMessage);
        const mockContent = this.generateMockContent(requirement, session.novel);
        return {
            message: `为您生成了以下内容：\n\n${mockContent}\n\n💡 建议：可以根据需要进一步调整内容的风格和长度。`,
            actions: [
                { type: 'insert_content', content: mockContent },
                { type: 'show_suggestions', suggestions: ['增加细节描写', '调整段落结构', '润色语言表达'] }
            ],
            metadata: { type: 'writing_assistance', requirement }
        };
    }
    async handleRevisionRequest(session, intent, userMessage, context) {
        const targetText = context.selectedText || context.currentParagraph || '';
        if (!targetText) {
            return {
                message: '请选择需要修改的文本，或者告诉我您想要优化的具体内容。',
                actions: [{ type: 'request_text_selection' }]
            };
        }
        const mockRevisions = this.generateMockRevisions(targetText);
        return {
            message: this.formatRevisionResponse(mockRevisions),
            actions: [
                { type: 'show_revisions', revisions: mockRevisions },
                { type: 'highlight_issues', issues: [] }
            ],
            metadata: { type: 'revision_assistance', originalText: targetText }
        };
    }
    async handlePlotConsultation(session, intent, userMessage, context) {
        const advice = `基于您的小说《${session.novel.title}》当前发展，我建议：

1. 考虑在当前章节引入新的冲突点，推动情节发展
2. 可以通过角色的内心独白来展现其成长变化
3. 适当设置悬念，为下一章节做好铺垫

您希望我针对哪个具体方面提供更详细的建议？`;
        return {
            message: advice,
            actions: [
                { type: 'show_plot_suggestions', suggestions: ['冲突升级', '角色发展', '悬念设置'] }
            ],
            metadata: { type: 'plot_consultation' }
        };
    }
    async handleCharacterConsultation(session, intent, userMessage, context) {
        const advice = `关于角色塑造，我有以下建议：

1. **性格一致性**：确保角色的行为符合其设定的性格特点
2. **成长弧线**：让角色在故事中有所成长和变化
3. **对话个性**：每个角色都应该有独特的说话方式
4. **动机清晰**：角色的每个行动都应该有明确的动机

您想要讨论哪个角色的具体问题？`;
        return {
            message: advice,
            actions: [
                { type: 'show_character_suggestions', suggestions: ['性格分析', '对话优化', '关系梳理'] }
            ],
            metadata: { type: 'character_consultation' }
        };
    }
    async handleTechniqueConsultation(session, intent, userMessage, context) {
        const advice = `关于写作技巧，我来为您详细解答：

**叙述技巧**：
- 合理运用第一人称和第三人称视角
- 通过细节描写来营造氛围
- 使用对话推进情节发展

**节奏控制**：
- 适当的快慢节奏交替
- 重要情节前的铺垫和悬念
- 适时的留白让读者思考

有什么具体的写作困惑吗？`;
        return {
            message: advice,
            actions: [
                { type: 'show_examples', examples: ['叙述示例', '对话技巧', '描写方法'] },
                { type: 'suggest_exercises', exercises: ['练习题1', '练习题2'] }
            ],
            metadata: { type: 'technique_consultation' }
        };
    }
    async handleAnalysisRequest(session, intent, userMessage, context) {
        const targetText = context.selectedText || context.currentChapter || '';
        if (!targetText) {
            return {
                message: '请提供需要分析的文本内容。',
                actions: [{ type: 'request_text_input' }]
            };
        }
        const analysis = this.generateMockAnalysis(targetText);
        return {
            message: this.formatAnalysisResponse(analysis),
            actions: [
                { type: 'show_detailed_analysis', analysis },
                { type: 'show_improvement_plan', plan: analysis.improvementPlan || [] }
            ],
            metadata: { type: 'text_analysis', analysis }
        };
    }
    async handleGeneralChat(session, intent, userMessage, context) {
        return {
            message: '我理解您的问题。作为您的写作助手，我可以帮助您进行内容创作、文本润色、情节规划、角色设计等各种写作相关的工作。请告诉我您需要什么帮助？',
            actions: [],
            metadata: { type: 'general_chat' }
        };
    }
    analyzeWritingStatus(novel) {
        return {
            hasProject: true,
            novel,
            wordCount: novel.wordCount || 0,
            chaptersCount: novel.chapters?.length || 0,
            lastModified: novel.updatedAt,
            completionRate: this.calculateCompletionRate(novel),
            currentPhase: this.identifyWritingPhase(novel),
            momentum: 'medium',
        };
    }
    generateWelcomeMessage(novel, status) {
        let greeting = `欢迎回来！很高兴继续与您一起创作《${novel.title}》。\n\n`;
        greeting += `📖 当前状态：${this.getPhaseDescription(status.currentPhase)}\n`;
        greeting += `📝 已完成：${status.wordCount} 字\n`;
        greeting += `📚 章节数：${status.chaptersCount} 章\n\n`;
        greeting += `我可以帮助您：续写情节、完善角色、润色文本、解决写作难题。有什么需要协助的吗？`;
        return greeting;
    }
    getInitialSuggestions(status) {
        const suggestions = [
            { text: '继续创作', action: 'continue_writing' },
            { text: '分析文本质量', action: 'analyze_quality' },
            { text: '获取写作建议', action: 'get_suggestions' }
        ];
        return suggestions.slice(0, 3);
    }
    addToHistory(sessionId, message) {
        const session = this.activeSessions.get(sessionId);
        if (session) {
            session.conversationHistory.push(message);
            if (session.conversationHistory.length > 100) {
                session.conversationHistory = session.conversationHistory.slice(-50);
            }
        }
    }
    extractKeywords(text) {
        const keywords = text.match(/[\u4e00-\u9fa5]{2,}|[a-zA-Z]{3,}/g) || [];
        return [...new Set(keywords)].slice(0, 10);
    }
    extractEntities(text, context) {
        return [];
    }
    parseWritingRequirement(message) {
        const requirement = {
            type: 'continuation',
            length: 'medium',
            style: 'current',
            focus: 'story',
        };
        if (/对话|说话|谈话/.test(message))
            requirement.type = 'dialogue';
        if (/描写|描述|环境|场景/.test(message))
            requirement.type = 'description';
        if (/开头|开始/.test(message))
            requirement.type = 'opening';
        if (/结尾|结束|收尾/.test(message))
            requirement.type = 'ending';
        if (/简短|几句|一点/.test(message))
            requirement.length = 'short';
        if (/详细|长一点|多写/.test(message))
            requirement.length = 'long';
        return requirement;
    }
    generateMockContent(requirement, novel) {
        const contentTypes = {
            continuation: `她缓缓推开门，房间里的一切都和记忆中的一样。阳光透过窗棂洒在地板上，形成斑驳的光影。这个地方承载着太多的回忆，每一件物品都在诉说着过往的故事。`,
            dialogue: `"你真的决定了吗？"他的声音有些颤抖。\n\n"是的，我想了很久。"她回答得很轻，但语气中透着坚定。\n\n"那我尊重你的选择。"`,
            description: `古老的图书馆笼罩在朦胧的光晕中，书架高耸入云，仿佛直达天穹。空气中弥漫着纸张和墨水的清香，偶尔传来翻书的沙沙声。`,
            opening: `那是一个平凡无奇的星期二早晨，直到那封意料之外的信件改变了一切。`,
            ending: `当最后一缕阳光消失在地平线上时，她知道这段旅程终于结束了。但另一段新的故事，正在悄悄开始。`
        };
        return contentTypes[requirement.type] || contentTypes.continuation;
    }
    generateMockRevisions(text) {
        return [
            {
                type: 'readability',
                issue: '可读性可以提升',
                suggestion: '建议简化部分句子结构',
                example: '优化后的文本示例...'
            },
            {
                type: 'style',
                issue: '语言风格可以更统一',
                suggestion: '保持一致的叙述风格',
                example: '统一风格后的文本...'
            }
        ];
    }
    generateMockAnalysis(text) {
        return {
            overallScore: 78,
            readability: { score: 75 },
            style: { consistency: 80 },
            emotion: { intensity: 65 },
            coherence: { score: 82 },
            keyFindings: [
                '整体质量良好',
                '情感表达可以加强',
                '逻辑结构清晰'
            ],
            improvementPlan: [
                '增加情感词汇',
                '调整段落结构',
                '优化语言表达'
            ]
        };
    }
    formatRevisionResponse(revisions) {
        let response = `我分析了您的文本，发现以下可以改进的地方：\n\n`;
        revisions.forEach((revision, index) => {
            response += `${index + 1}. **${revision.issue}**\n`;
            response += `   ${revision.suggestion}\n\n`;
        });
        return response;
    }
    formatAnalysisResponse(analysis) {
        let response = `📊 文本分析结果：\n\n`;
        response += `总体评分：${analysis.overallScore}/100\n\n`;
        response += `各项指标：\n`;
        response += `• 可读性：${analysis.readability.score}分\n`;
        response += `• 风格一致性：${analysis.style.consistency}分\n`;
        response += `• 情感强度：${analysis.emotion.intensity}分\n`;
        response += `• 逻辑连贯性：${analysis.coherence.score}分\n\n`;
        if (analysis.keyFindings) {
            response += `🔍 主要发现：\n`;
            analysis.keyFindings.forEach(finding => {
                response += `• ${finding}\n`;
            });
        }
        return response;
    }
    calculateCompletionRate(novel) {
        return Math.min(Math.round((novel.wordCount || 0) / 50000 * 100), 100);
    }
    identifyWritingPhase(novel) {
        const wordCount = novel.wordCount || 0;
        const chapterCount = novel.chapters?.length || 0;
        if (wordCount > 40000)
            return 'revision';
        if (chapterCount > 0)
            return 'writing';
        return 'planning';
    }
    getPhaseDescription(phase) {
        const descriptions = {
            planning: '规划阶段',
            writing: '创作阶段',
            revision: '修改阶段'
        };
        return descriptions[phase] || '未知阶段';
    }
    handleError(message, error) {
        console.error('AI Assistant Error:', error);
        return {
            message: `抱歉，${message}。请稍后重试或重新表达您的需求。`,
            actions: [],
            metadata: { type: 'error', error: error.message }
        };
    }
    async logAIUsage(userId, functionType, details) {
        try {
            await this.prisma.aIUsageLog.create({
                data: {
                    userId,
                    model: 'assistant-service',
                    functionType,
                    inputTokens: Math.ceil((details.inputLength || 0) / 4),
                    outputTokens: Math.ceil((details.outputLength || 0) / 4),
                    cost: 0,
                    success: true,
                },
            });
        }
        catch (error) {
            console.error('Log AI usage error:', error);
        }
    }
    async generalChat(userId, chatDto) {
        const messages = [
            {
                role: 'system',
                content: '你是一位专业的小说创作助手，擅长题材分析、创意生成、写作指导等。'
            },
            {
                role: 'user',
                content: chatDto.message
            }
        ];
        const response = await this.aiCallerService.callAI({
            userId,
            messages,
            configId: chatDto.aiConfigId,
            parameters: {
                temperature: chatDto.parameters?.temperature || 0.7,
                maxTokens: chatDto.parameters?.maxTokens || 4000,
            },
        });
        return {
            content: response.content,
            model: response.model,
            provider: response.provider,
            tokensUsed: response.totalTokens,
        };
    }
    async *generalChatStream(userId, chatDto) {
        const messages = [
            {
                role: 'system',
                content: '你是一位专业的小说创作助手，擅长题材分析、创意生成、写作指导等。'
            },
            {
                role: 'user',
                content: chatDto.message
            }
        ];
        for await (const chunk of this.aiCallerService.callAIStream({
            userId,
            messages,
            configId: chatDto.aiConfigId,
            parameters: {
                temperature: chatDto.parameters?.temperature || 0.7,
                maxTokens: chatDto.parameters?.maxTokens || 4000,
            },
            stream: true,
        })) {
            yield chunk;
        }
    }
};
exports.AssistantService = AssistantService;
exports.AssistantService = AssistantService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof ai_caller_service_1.AICallerService !== "undefined" && ai_caller_service_1.AICallerService) === "function" ? _b : Object])
], AssistantService);


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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GenerateContentDto = exports.ConversationDto = exports.InitializeSessionDto = exports.ConversationIntent = void 0;
const class_validator_1 = __webpack_require__(16);
const swagger_1 = __webpack_require__(3);
var ConversationIntent;
(function (ConversationIntent) {
    ConversationIntent["WRITING_REQUEST"] = "writing_request";
    ConversationIntent["REVISION_REQUEST"] = "revision_request";
    ConversationIntent["PLOT_CONSULTATION"] = "plot_consultation";
    ConversationIntent["CHARACTER_CONSULTATION"] = "character_consultation";
    ConversationIntent["TECHNIQUE_CONSULTATION"] = "technique_consultation";
    ConversationIntent["ANALYSIS_REQUEST"] = "analysis_request";
    ConversationIntent["GENERAL_CHAT"] = "general_chat";
})(ConversationIntent || (exports.ConversationIntent = ConversationIntent = {}));
class InitializeSessionDto {
}
exports.InitializeSessionDto = InitializeSessionDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InitializeSessionDto.prototype, "novelId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InitializeSessionDto.prototype, "currentChapter", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Array)
], InitializeSessionDto.prototype, "writingGoals", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], InitializeSessionDto.prototype, "userPreferences", void 0);
class ConversationDto {
}
exports.ConversationDto = ConversationDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConversationDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConversationDto.prototype, "novelId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConversationDto.prototype, "sessionId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ConversationDto.prototype, "context", void 0);
class GenerateContentDto {
    constructor() {
        this.contentType = 'continuation';
        this.length = 'medium';
        this.style = 'current';
    }
}
exports.GenerateContentDto = GenerateContentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '小说ID',
        example: 'cm1234567890'
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateContentDto.prototype, "novelId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '生成内容的提示词/要求',
        example: '请续写一段主角和反派的对决场景'
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateContentDto.prototype, "prompt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '内容类型',
        enum: ['continuation', 'scene', 'dialogue', 'description', 'opening', 'ending'],
        default: 'continuation',
        example: 'continuation'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['continuation', 'scene', 'dialogue', 'description', 'opening', 'ending']),
    __metadata("design:type", String)
], GenerateContentDto.prototype, "contentType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '生成类型（用于内部路由）',
        enum: ['continuation', 'rewrite', 'expansion'],
        example: 'continuation'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['continuation', 'rewrite', 'expansion']),
    __metadata("design:type", String)
], GenerateContentDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '内容长度',
        enum: ['short', 'medium', 'long'],
        default: 'medium',
        example: 'medium'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['short', 'medium', 'long']),
    __metadata("design:type", String)
], GenerateContentDto.prototype, "length", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '写作风格',
        enum: ['current', 'formal', 'casual', 'poetic'],
        default: 'current',
        example: 'current'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['current', 'formal', 'casual', 'poetic']),
    __metadata("design:type", String)
], GenerateContentDto.prototype, "style", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'AI配置ID（格式：system:id 或 user:id，不提供则使用默认配置）',
        example: 'user:cm1234567890'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateContentDto.prototype, "aiConfigId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '上下文信息（如当前章节内容、前文等）',
        type: 'string'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateContentDto.prototype, "context", void 0);


/***/ }),
/* 16 */
/***/ ((module) => {

module.exports = require("class-validator");

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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AICallerService = void 0;
const common_1 = __webpack_require__(2);
const database_1 = __webpack_require__(9);
const microservices_1 = __webpack_require__(8);
const common_2 = __webpack_require__(2);
const provider_factory_1 = __webpack_require__(18);
const crypto = __webpack_require__(25);
let AICallerService = class AICallerService {
    constructor(prisma, userServiceClient) {
        this.prisma = prisma;
        this.userServiceClient = userServiceClient;
        this.algorithm = 'aes-256-cbc';
        this.encryptionKey =
            process.env.AI_CONFIG_ENCRYPTION_KEY || 'your-32-character-encryption-key!!';
        if (Buffer.from(this.encryptionKey).length !== 32) {
            console.warn('⚠️  ENCRYPTION_KEY长度不是32字节，将进行填充/截断');
            this.encryptionKey = this.encryptionKey.padEnd(32, '0').slice(0, 32);
        }
    }
    async callAI(request) {
        const maxRetries = 3;
        const baseDelay = 1000;
        let lastError;
        let attempt = 0;
        while (attempt < maxRetries) {
            try {
                attempt++;
                const config = await this.getAIConfig(request.userId, request.configId);
                const finalParameters = {
                    ...config.parameters,
                    ...request.parameters,
                    stream: request.stream || false,
                };
                const callConfig = {
                    provider: config.provider,
                    model: config.model,
                    apiUrl: config.apiUrl,
                    apiKey: config.apiKey,
                    parameters: finalParameters,
                };
                const provider = provider_factory_1.AIProviderFactory.getProvider(config.provider);
                const startTime = Date.now();
                const response = await provider.chat(request.messages, callConfig);
                await this.logAIUsage(request.userId, config.model, response.inputTokens, response.outputTokens, true, Date.now() - startTime);
                return response;
            }
            catch (error) {
                lastError = error;
                console.error(`[AI调用] 第${attempt}次尝试失败:`, error.message);
                if (attempt < maxRetries) {
                    const delay = baseDelay * Math.pow(2, attempt - 1);
                    console.log(`[AI调用] 等待${delay}ms后重试...`);
                    await this.sleep(delay);
                    continue;
                }
                if (attempt >= maxRetries) {
                    console.log('[AI调用] 重试次数用完，尝试降级策略...');
                    try {
                        const fallbackResponse = await this.tryFallbackStrategy(request.userId, request.messages);
                        if (fallbackResponse) {
                            return fallbackResponse;
                        }
                    }
                    catch (fallbackError) {
                        console.error('[AI调用] 降级策略也失败:', fallbackError.message);
                    }
                }
            }
        }
        await this.logAIUsage(request.userId, 'unknown', 0, 0, false, 0, lastError?.message || '未知错误');
        throw new common_1.HttpException({
            statusCode: common_1.HttpStatus.SERVICE_UNAVAILABLE,
            message: `AI调用失败，已重试${maxRetries}次: ${lastError?.message || '未知错误'}`,
            error: 'AI_SERVICE_UNAVAILABLE',
        }, common_1.HttpStatus.SERVICE_UNAVAILABLE);
    }
    async tryFallbackStrategy(userId, messages) {
        const availableConfigs = await this.getAllAvailableConfigs(userId);
        if (availableConfigs.length === 0) {
            return null;
        }
        for (const config of availableConfigs) {
            try {
                console.log(`[降级策略] 尝试使用备用配置: ${config.provider}/${config.model}`);
                const callConfig = {
                    provider: config.provider,
                    model: config.model,
                    apiUrl: config.apiUrl,
                    apiKey: config.apiKey,
                    parameters: config.parameters,
                };
                const provider = provider_factory_1.AIProviderFactory.getProvider(config.provider);
                const startTime = Date.now();
                const response = await provider.chat(messages, callConfig);
                await this.logAIUsage(userId, config.model, response.inputTokens, response.outputTokens, true, Date.now() - startTime);
                console.log(`[降级策略] 成功使用备用配置: ${config.provider}/${config.model}`);
                return response;
            }
            catch (error) {
                console.error(`[降级策略] 备用配置失败: ${error.message}`);
                continue;
            }
        }
        return null;
    }
    async getAllAvailableConfigs(userId) {
        const configs = [];
        const userConfigs = await this.prisma.userAIConfig.findMany({
            where: {
                userId,
                enabled: true,
            },
            orderBy: {
                isDefault: 'desc',
            },
        });
        for (const config of userConfigs) {
            configs.push({
                provider: config.provider,
                model: config.model,
                apiUrl: config.apiUrl,
                apiKey: this.decrypt(config.apiKey),
                parameters: config.parameters,
            });
        }
        try {
            const systemConfigRecord = await this.prisma.systemConfig.findFirst({
                where: {
                    configKey: 'ai_models',
                },
            });
            if (systemConfigRecord) {
                const models = systemConfigRecord.configValue;
                for (const model of models) {
                    if (model.enabled) {
                        configs.push({
                            provider: model.provider,
                            model: model.model,
                            apiUrl: model.apiUrl,
                            apiKey: model.apiKey,
                            parameters: model.parameters || {},
                        });
                    }
                }
            }
        }
        catch (error) {
            console.error('获取系统配置失败:', error);
        }
        return configs;
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async *callAIStream(request) {
        const config = await this.getAIConfig(request.userId, request.configId);
        const finalParameters = {
            ...config.parameters,
            ...request.parameters,
            stream: true,
        };
        const callConfig = {
            provider: config.provider,
            model: config.model,
            apiUrl: config.apiUrl,
            apiKey: config.apiKey,
            parameters: finalParameters,
        };
        const provider = provider_factory_1.AIProviderFactory.getProvider(config.provider);
        const startTime = Date.now();
        let success = true;
        let errorMessage;
        try {
            for await (const chunk of provider.chatStream(request.messages, callConfig)) {
                yield chunk;
            }
        }
        catch (error) {
            success = false;
            errorMessage = error.message;
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.BAD_REQUEST,
                message: `AI流式调用失败: ${error.message}`,
                error: 'AI_STREAM_CALL_FAILED',
            }, common_1.HttpStatus.BAD_REQUEST);
        }
        finally {
            await this.logAIUsage(request.userId, config.model, 0, 0, success, Date.now() - startTime, errorMessage);
        }
    }
    async testAIConfig(provider, model, apiUrl, apiKey, parameters) {
        const config = {
            provider,
            model,
            apiUrl,
            apiKey,
            parameters,
        };
        const providerInstance = provider_factory_1.AIProviderFactory.getProvider(provider);
        return providerInstance.testConnection(config);
    }
    async getAIConfig(userId, configId) {
        if (!configId) {
            return this.getDefaultConfig(userId);
        }
        const [type, id] = configId.split(':');
        if (type === 'user') {
            return this.getUserConfig(userId, id);
        }
        else if (type === 'system') {
            return this.getSystemConfig(id);
        }
        else {
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.BAD_REQUEST,
                message: '无效的配置ID格式',
                error: 'INVALID_CONFIG_ID',
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getDefaultConfig(userId) {
        const userConfig = await this.prisma.userAIConfig.findFirst({
            where: {
                userId,
                enabled: true,
                isDefault: true,
            },
        });
        if (userConfig) {
            return {
                provider: userConfig.provider,
                model: userConfig.model,
                apiUrl: userConfig.apiUrl,
                apiKey: this.decrypt(userConfig.apiKey),
                parameters: userConfig.parameters,
            };
        }
        const systemConfig = await this.getSystemDefaultConfig();
        if (systemConfig) {
            return systemConfig;
        }
        throw new common_1.HttpException({
            statusCode: common_1.HttpStatus.NOT_FOUND,
            message: '未找到可用的AI配置，请先配置AI服务',
            error: 'NO_AI_CONFIG_AVAILABLE',
        }, common_1.HttpStatus.NOT_FOUND);
    }
    async getUserConfig(userId, configId) {
        const config = await this.prisma.userAIConfig.findFirst({
            where: {
                id: configId,
                userId,
                enabled: true,
            },
        });
        if (!config) {
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.NOT_FOUND,
                message: '未找到指定的AI配置或配置已禁用',
                error: 'CONFIG_NOT_FOUND',
            }, common_1.HttpStatus.NOT_FOUND);
        }
        return {
            provider: config.provider,
            model: config.model,
            apiUrl: config.apiUrl,
            apiKey: this.decrypt(config.apiKey),
            parameters: config.parameters,
        };
    }
    async getSystemConfig(configId) {
        const systemConfigRecord = await this.prisma.systemConfig.findFirst({
            where: {
                configKey: 'ai_models',
            },
        });
        if (!systemConfigRecord) {
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.NOT_FOUND,
                message: '系统AI配置不存在',
                error: 'SYSTEM_CONFIG_NOT_FOUND',
            }, common_1.HttpStatus.NOT_FOUND);
        }
        const models = systemConfigRecord.configValue;
        const config = models.find(m => m.id === configId && m.enabled);
        if (!config) {
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.NOT_FOUND,
                message: '未找到指定的系统AI配置或配置已禁用',
                error: 'SYSTEM_CONFIG_NOT_FOUND',
            }, common_1.HttpStatus.NOT_FOUND);
        }
        return {
            provider: config.provider,
            model: config.model,
            apiUrl: config.apiUrl,
            apiKey: config.apiKey,
            parameters: config.parameters || {},
        };
    }
    async getSystemDefaultConfig() {
        const systemConfigRecord = await this.prisma.systemConfig.findFirst({
            where: {
                configKey: 'ai_models',
            },
        });
        if (!systemConfigRecord) {
            return null;
        }
        const models = systemConfigRecord.configValue;
        const defaultConfig = models.find(m => m.enabled && m.isDefault);
        if (!defaultConfig) {
            return null;
        }
        return {
            provider: defaultConfig.provider,
            model: defaultConfig.model,
            apiUrl: defaultConfig.apiUrl,
            apiKey: defaultConfig.apiKey,
            parameters: defaultConfig.parameters || {},
        };
    }
    async logAIUsage(userId, model, inputTokens, outputTokens, success, responseTime, errorMessage) {
        try {
            await this.prisma.aIUsageLog.create({
                data: {
                    userId,
                    model,
                    functionType: 'content_generation',
                    inputTokens,
                    outputTokens,
                    success,
                    responseTime,
                },
            });
        }
        catch (error) {
            console.error('记录AI使用日志失败:', error);
        }
    }
    decrypt(encryptedText) {
        try {
            const [ivHex, encryptedHex] = encryptedText.split(':');
            const iv = Buffer.from(ivHex, 'hex');
            const encrypted = Buffer.from(encryptedHex, 'hex');
            const decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(this.encryptionKey), iv);
            let decrypted = decipher.update(encrypted);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return decrypted.toString();
        }
        catch (error) {
            console.error('解密API密钥失败:', error);
            throw new Error('API密钥解密失败');
        }
    }
};
exports.AICallerService = AICallerService;
exports.AICallerService = AICallerService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_2.Inject)('USER_SERVICE')),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _b : Object])
], AICallerService);


/***/ }),
/* 18 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AIProviderFactory = void 0;
const client_1 = __webpack_require__(12);
const openai_provider_1 = __webpack_require__(19);
const claude_provider_1 = __webpack_require__(22);
const deepseek_provider_1 = __webpack_require__(23);
const generic_provider_1 = __webpack_require__(24);
class AIProviderFactory {
    static getProvider(provider) {
        if (!this.providerInstances.has(provider)) {
            let instance;
            switch (provider) {
                case client_1.AIProvider.OPENAI:
                    instance = new openai_provider_1.OpenAIProvider();
                    break;
                case client_1.AIProvider.CLAUDE:
                    instance = new claude_provider_1.ClaudeProvider();
                    break;
                case client_1.AIProvider.DEEPSEEK:
                    instance = new deepseek_provider_1.DeepSeekProvider();
                    break;
                case client_1.AIProvider.WENXIN:
                case client_1.AIProvider.QWEN:
                case client_1.AIProvider.ZHIPU:
                case client_1.AIProvider.CUSTOM:
                    instance = new generic_provider_1.GenericProvider(provider);
                    break;
                default:
                    throw new Error(`不支持的AI提供商: ${provider}`);
            }
            this.providerInstances.set(provider, instance);
        }
        return this.providerInstances.get(provider);
    }
    static clearCache() {
        this.providerInstances.clear();
    }
}
exports.AIProviderFactory = AIProviderFactory;
AIProviderFactory.providerInstances = new Map();


/***/ }),
/* 19 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OpenAIProvider = void 0;
const axios_1 = __webpack_require__(20);
const client_1 = __webpack_require__(12);
const base_provider_1 = __webpack_require__(21);
class OpenAIProvider extends base_provider_1.BaseAIProvider {
    constructor() {
        super();
        this.provider = client_1.AIProvider.OPENAI;
        this.httpClient = axios_1.default.create({
            timeout: 60000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    async chat(messages, config) {
        try {
            const parameters = this.mergeParameters(config.parameters);
            const requestBody = {
                model: config.model,
                messages: messages.map(msg => ({
                    role: msg.role,
                    content: msg.content,
                })),
                temperature: parameters.temperature,
                top_p: parameters.topP,
                frequency_penalty: parameters.frequencyPenalty,
                presence_penalty: parameters.presencePenalty,
                max_tokens: parameters.maxTokens,
                stream: false,
            };
            const response = await this.httpClient.post(`${config.apiUrl}/chat/completions`, requestBody, {
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`,
                },
                timeout: (parameters.timeout || 30) * 1000,
            });
            const data = response.data;
            const choice = data.choices[0];
            const usage = data.usage || {};
            return {
                content: choice.message.content,
                model: data.model,
                provider: this.provider,
                inputTokens: usage.prompt_tokens || 0,
                outputTokens: usage.completion_tokens || 0,
                totalTokens: usage.total_tokens || 0,
                finishReason: choice.finish_reason || 'stop',
            };
        }
        catch (error) {
            this.handleAPIError(error, this.provider);
        }
    }
    async *chatStream(messages, config) {
        try {
            const parameters = this.mergeParameters(config.parameters);
            const requestBody = {
                model: config.model,
                messages: messages.map(msg => ({
                    role: msg.role,
                    content: msg.content,
                })),
                temperature: parameters.temperature,
                top_p: parameters.topP,
                frequency_penalty: parameters.frequencyPenalty,
                presence_penalty: parameters.presencePenalty,
                max_tokens: parameters.maxTokens,
                stream: true,
            };
            const response = await this.httpClient.post(`${config.apiUrl}/chat/completions`, requestBody, {
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`,
                },
                timeout: (parameters.timeout || 30) * 1000,
                responseType: 'stream',
            });
            for await (const chunk of response.data) {
                const lines = chunk.toString().split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();
                        if (data === '[DONE]') {
                            return;
                        }
                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices[0]?.delta?.content;
                            if (content) {
                                yield content;
                            }
                        }
                        catch (e) {
                        }
                    }
                }
            }
        }
        catch (error) {
            this.handleAPIError(error, this.provider);
        }
    }
    async testConnection(config) {
        try {
            const testMessages = [
                { role: 'user', content: 'Hello' },
            ];
            await this.chat(testMessages, {
                ...config,
                parameters: {
                    ...config.parameters,
                    maxTokens: 10,
                },
            });
            return true;
        }
        catch (error) {
            console.error('[OpenAI] Connection test failed:', error);
            return false;
        }
    }
}
exports.OpenAIProvider = OpenAIProvider;


/***/ }),
/* 20 */
/***/ ((module) => {

module.exports = require("axios");

/***/ }),
/* 21 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseAIProvider = void 0;
class BaseAIProvider {
    getDefaultParameters() {
        return {
            temperature: 0.7,
            topP: 1.0,
            frequencyPenalty: 0,
            presencePenalty: 0,
            maxTokens: 2000,
            timeout: 30,
            stream: false,
        };
    }
    mergeParameters(userParams) {
        return {
            ...this.getDefaultParameters(),
            ...userParams,
        };
    }
    handleAPIError(error, provider) {
        console.error(`[${provider}] API Error:`, error);
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
            if (status === 401) {
                throw new Error(`[${provider}] API密钥无效或已过期`);
            }
            else if (status === 429) {
                throw new Error(`[${provider}] 请求频率超限，请稍后重试`);
            }
            else if (status === 500) {
                throw new Error(`[${provider}] 服务器内部错误`);
            }
            else if (status === 503) {
                throw new Error(`[${provider}] 服务暂时不可用`);
            }
            else {
                throw new Error(`[${provider}] API调用失败: ${data?.error?.message || data?.message || '未知错误'}`);
            }
        }
        else if (error.request) {
            throw new Error(`[${provider}] 网络请求失败，请检查API地址和网络连接`);
        }
        else {
            throw new Error(`[${provider}] 请求配置错误: ${error.message}`);
        }
    }
}
exports.BaseAIProvider = BaseAIProvider;


/***/ }),
/* 22 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ClaudeProvider = void 0;
const axios_1 = __webpack_require__(20);
const client_1 = __webpack_require__(12);
const base_provider_1 = __webpack_require__(21);
class ClaudeProvider extends base_provider_1.BaseAIProvider {
    constructor() {
        super();
        this.provider = client_1.AIProvider.CLAUDE;
        this.httpClient = axios_1.default.create({
            timeout: 60000,
            headers: {
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01',
            },
        });
    }
    convertMessages(messages) {
        const systemMessage = messages.find(msg => msg.role === 'system');
        const userMessages = messages.filter(msg => msg.role !== 'system');
        return {
            system: systemMessage?.content,
            messages: userMessages.map(msg => ({
                role: msg.role === 'assistant' ? 'assistant' : 'user',
                content: msg.content,
            })),
        };
    }
    async chat(messages, config) {
        try {
            const parameters = this.mergeParameters(config.parameters);
            const { system, messages: claudeMessages } = this.convertMessages(messages);
            const requestBody = {
                model: config.model,
                messages: claudeMessages,
                max_tokens: parameters.maxTokens || 2000,
                temperature: parameters.temperature,
                top_p: parameters.topP,
                stream: false,
            };
            if (system) {
                requestBody.system = system;
            }
            const response = await this.httpClient.post(`${config.apiUrl}/messages`, requestBody, {
                headers: {
                    'x-api-key': config.apiKey,
                },
                timeout: (parameters.timeout || 30) * 1000,
            });
            const data = response.data;
            const usage = data.usage || {};
            return {
                content: data.content[0]?.text || '',
                model: data.model,
                provider: this.provider,
                inputTokens: usage.input_tokens || 0,
                outputTokens: usage.output_tokens || 0,
                totalTokens: (usage.input_tokens || 0) + (usage.output_tokens || 0),
                finishReason: data.stop_reason || 'end_turn',
            };
        }
        catch (error) {
            this.handleAPIError(error, this.provider);
        }
    }
    async *chatStream(messages, config) {
        try {
            const parameters = this.mergeParameters(config.parameters);
            const { system, messages: claudeMessages } = this.convertMessages(messages);
            const requestBody = {
                model: config.model,
                messages: claudeMessages,
                max_tokens: parameters.maxTokens || 2000,
                temperature: parameters.temperature,
                top_p: parameters.topP,
                stream: true,
            };
            if (system) {
                requestBody.system = system;
            }
            const response = await this.httpClient.post(`${config.apiUrl}/messages`, requestBody, {
                headers: {
                    'x-api-key': config.apiKey,
                },
                timeout: (parameters.timeout || 30) * 1000,
                responseType: 'stream',
            });
            for await (const chunk of response.data) {
                const lines = chunk.toString().split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();
                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.type === 'content_block_delta') {
                                const content = parsed.delta?.text;
                                if (content) {
                                    yield content;
                                }
                            }
                        }
                        catch (e) {
                        }
                    }
                }
            }
        }
        catch (error) {
            this.handleAPIError(error, this.provider);
        }
    }
    async testConnection(config) {
        try {
            const testMessages = [
                { role: 'user', content: 'Hello' },
            ];
            await this.chat(testMessages, {
                ...config,
                parameters: {
                    ...config.parameters,
                    maxTokens: 10,
                },
            });
            return true;
        }
        catch (error) {
            console.error('[Claude] Connection test failed:', error);
            return false;
        }
    }
}
exports.ClaudeProvider = ClaudeProvider;


/***/ }),
/* 23 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DeepSeekProvider = void 0;
const axios_1 = __webpack_require__(20);
const client_1 = __webpack_require__(12);
const base_provider_1 = __webpack_require__(21);
class DeepSeekProvider extends base_provider_1.BaseAIProvider {
    constructor() {
        super();
        this.provider = client_1.AIProvider.DEEPSEEK;
        this.httpClient = axios_1.default.create({
            timeout: 60000,
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            headers: {
                'Content-Type': 'application/json',
            },
            validateStatus: (status) => status >= 200 && status < 300,
        });
    }
    async chat(messages, config) {
        try {
            const parameters = this.mergeParameters(config.parameters);
            const requestBody = {
                model: config.model,
                messages: messages.map(msg => ({
                    role: msg.role,
                    content: msg.content,
                })),
                temperature: parameters.temperature,
                top_p: parameters.topP,
                frequency_penalty: parameters.frequencyPenalty,
                presence_penalty: parameters.presencePenalty,
                max_tokens: parameters.maxTokens,
                stream: false,
            };
            console.log('[DEEPSEEK] 发送请求到:', `${config.apiUrl}/chat/completions`);
            console.log('[DEEPSEEK] 请求参数:', { model: requestBody.model, max_tokens: requestBody.max_tokens });
            const response = await this.httpClient.post(`${config.apiUrl}/chat/completions`, requestBody, {
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`,
                },
                timeout: 60000,
            });
            console.log('[DEEPSEEK] 响应状态:', response.status);
            console.log('[DEEPSEEK] 内容长度:', response.data?.choices?.[0]?.message?.content?.length || 0);
            const data = response.data;
            const choice = data.choices[0];
            const usage = data.usage || {};
            return {
                content: choice.message.content,
                model: data.model,
                provider: this.provider,
                inputTokens: usage.prompt_tokens || 0,
                outputTokens: usage.completion_tokens || 0,
                totalTokens: usage.total_tokens || 0,
                finishReason: choice.finish_reason || 'stop',
            };
        }
        catch (error) {
            this.handleAPIError(error, this.provider);
        }
    }
    async *chatStream(messages, config) {
        try {
            const parameters = this.mergeParameters(config.parameters);
            const requestBody = {
                model: config.model,
                messages: messages.map(msg => ({
                    role: msg.role,
                    content: msg.content,
                })),
                temperature: parameters.temperature,
                top_p: parameters.topP,
                frequency_penalty: parameters.frequencyPenalty,
                presence_penalty: parameters.presencePenalty,
                max_tokens: parameters.maxTokens,
                stream: true,
            };
            console.log('[DEEPSEEK] 发送流式请求到:', `${config.apiUrl}/chat/completions`);
            const response = await this.httpClient.post(`${config.apiUrl}/chat/completions`, requestBody, {
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`,
                },
                timeout: 0,
                responseType: 'stream',
            });
            console.log('[DEEPSEEK] 流式响应开始，逐字符接收...');
            for await (const chunk of response.data) {
                const lines = chunk.toString().split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();
                        if (data === '[DONE]') {
                            return;
                        }
                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices[0]?.delta?.content;
                            if (content) {
                                yield content;
                            }
                        }
                        catch (e) {
                        }
                    }
                }
            }
        }
        catch (error) {
            this.handleAPIError(error, this.provider);
        }
    }
    async testConnection(config) {
        try {
            const testMessages = [
                { role: 'user', content: 'Hello' },
            ];
            await this.chat(testMessages, {
                ...config,
                parameters: {
                    ...config.parameters,
                    maxTokens: 10,
                },
            });
            return true;
        }
        catch (error) {
            console.error('[DeepSeek] Connection test failed:', error);
            return false;
        }
    }
}
exports.DeepSeekProvider = DeepSeekProvider;


/***/ }),
/* 24 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GenericProvider = void 0;
const axios_1 = __webpack_require__(20);
const client_1 = __webpack_require__(12);
const base_provider_1 = __webpack_require__(21);
class GenericProvider extends base_provider_1.BaseAIProvider {
    constructor(provider) {
        super();
        this.provider = provider;
        this.httpClient = axios_1.default.create({
            timeout: 60000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    async chat(messages, config) {
        try {
            const parameters = this.mergeParameters(config.parameters);
            const requestBody = {
                model: config.model,
                messages: messages.map(msg => ({
                    role: msg.role,
                    content: msg.content,
                })),
                temperature: parameters.temperature,
                top_p: parameters.topP,
                max_tokens: parameters.maxTokens,
                stream: false,
            };
            const headers = {};
            if (this.provider === client_1.AIProvider.WENXIN) {
                headers['Authorization'] = `Bearer ${config.apiKey}`;
            }
            else if (this.provider === client_1.AIProvider.QWEN) {
                headers['Authorization'] = `Bearer ${config.apiKey}`;
            }
            else if (this.provider === client_1.AIProvider.ZHIPU) {
                headers['Authorization'] = `Bearer ${config.apiKey}`;
            }
            else {
                headers['Authorization'] = `Bearer ${config.apiKey}`;
            }
            const response = await this.httpClient.post(`${config.apiUrl}/chat/completions`, requestBody, {
                headers,
                timeout: (parameters.timeout || 30) * 1000,
            });
            const data = response.data;
            const choice = data.choices[0];
            const usage = data.usage || {};
            return {
                content: choice.message?.content || choice.text || '',
                model: data.model || config.model,
                provider: this.provider,
                inputTokens: usage.prompt_tokens || 0,
                outputTokens: usage.completion_tokens || 0,
                totalTokens: usage.total_tokens || 0,
                finishReason: choice.finish_reason || 'stop',
            };
        }
        catch (error) {
            this.handleAPIError(error, this.provider);
        }
    }
    async *chatStream(messages, config) {
        try {
            const parameters = this.mergeParameters(config.parameters);
            const requestBody = {
                model: config.model,
                messages: messages.map(msg => ({
                    role: msg.role,
                    content: msg.content,
                })),
                temperature: parameters.temperature,
                top_p: parameters.topP,
                max_tokens: parameters.maxTokens,
                stream: true,
            };
            const headers = {};
            if (this.provider === client_1.AIProvider.WENXIN) {
                headers['Authorization'] = `Bearer ${config.apiKey}`;
            }
            else if (this.provider === client_1.AIProvider.QWEN) {
                headers['Authorization'] = `Bearer ${config.apiKey}`;
            }
            else if (this.provider === client_1.AIProvider.ZHIPU) {
                headers['Authorization'] = `Bearer ${config.apiKey}`;
            }
            else {
                headers['Authorization'] = `Bearer ${config.apiKey}`;
            }
            const response = await this.httpClient.post(`${config.apiUrl}/chat/completions`, requestBody, {
                headers,
                timeout: (parameters.timeout || 30) * 1000,
                responseType: 'stream',
            });
            for await (const chunk of response.data) {
                const lines = chunk.toString().split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();
                        if (data === '[DONE]') {
                            return;
                        }
                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices[0]?.delta?.content || parsed.choices[0]?.text;
                            if (content) {
                                yield content;
                            }
                        }
                        catch (e) {
                        }
                    }
                }
            }
        }
        catch (error) {
            this.handleAPIError(error, this.provider);
        }
    }
    async testConnection(config) {
        try {
            const testMessages = [
                { role: 'user', content: 'Hello' },
            ];
            await this.chat(testMessages, {
                ...config,
                parameters: {
                    ...config.parameters,
                    maxTokens: 10,
                },
            });
            return true;
        }
        catch (error) {
            console.error(`[${this.provider}] Connection test failed:`, error);
            return false;
        }
    }
}
exports.GenericProvider = GenericProvider;


/***/ }),
/* 25 */
/***/ ((module) => {

module.exports = require("crypto");

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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AssistantController = void 0;
const common_1 = __webpack_require__(2);
const express_1 = __webpack_require__(27);
const swagger_1 = __webpack_require__(3);
const common_2 = __webpack_require__(28);
const assistant_service_1 = __webpack_require__(14);
const conversation_dto_1 = __webpack_require__(15);
const general_chat_dto_1 = __webpack_require__(43);
const general_chat_stream_dto_1 = __webpack_require__(44);
let AssistantController = class AssistantController {
    constructor(assistantService) {
        this.assistantService = assistantService;
    }
    async initializeSession(req, initDto) {
        return this.assistantService.initializeSession(req.user.id, initDto);
    }
    async handleConversation(req, conversationDto) {
        return this.assistantService.handleConversation(req.user.id, conversationDto);
    }
    async getConversationHistory(req, sessionId) {
        return this.assistantService.getConversationHistory(req.user.id, sessionId);
    }
    async cleanupSessions() {
        this.assistantService.cleanupSessions();
        return { message: '会话清理完成' };
    }
    async generalChat(req, chatDto) {
        return this.assistantService.generalChat(req.user.id, chatDto);
    }
    async generalChatStream(req, chatDto, res) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.status(common_1.HttpStatus.OK);
        try {
            for await (const chunk of this.assistantService.generalChatStream(req.user.id, chatDto)) {
                res.write(chunk);
            }
            res.end();
        }
        catch (error) {
            res.write(`\n\nERROR: ${error.message}`);
            res.end();
        }
    }
};
exports.AssistantController = AssistantController;
__decorate([
    (0, common_1.Post)('assistant/sessions'),
    (0, common_2.RequireFeature)('aiAssistant'),
    (0, common_2.RequireQuota)('daily'),
    (0, swagger_1.ApiOperation)({ summary: '初始化AI助手会话' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '会话初始化成功' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '无权限或配额不足' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_b = typeof conversation_dto_1.InitializeSessionDto !== "undefined" && conversation_dto_1.InitializeSessionDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], AssistantController.prototype, "initializeSession", null);
__decorate([
    (0, common_1.Post)('assistant/chat'),
    (0, common_2.RequireFeature)('aiAssistant'),
    (0, common_2.RequireQuota)('daily'),
    (0, swagger_1.ApiOperation)({ summary: 'AI助手对话' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '对话成功' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '无权限或配额不足' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_c = typeof conversation_dto_1.ConversationDto !== "undefined" && conversation_dto_1.ConversationDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], AssistantController.prototype, "handleConversation", null);
__decorate([
    (0, common_1.Get)('assistant/sessions/:sessionId/history'),
    (0, swagger_1.ApiOperation)({ summary: '获取会话历史' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AssistantController.prototype, "getConversationHistory", null);
__decorate([
    (0, common_1.Post)('assistant/sessions/cleanup'),
    (0, swagger_1.ApiOperation)({ summary: '清理会话' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '清理成功' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AssistantController.prototype, "cleanupSessions", null);
__decorate([
    (0, common_1.Post)('assistant/general'),
    (0, common_2.RequireFeature)('aiWriting'),
    (0, common_2.RequireQuota)('daily'),
    (0, swagger_1.ApiOperation)({
        summary: '通用AI对话',
        description: '不关联具体小说的通用AI对话，用于题材分析、创意生成等场景'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'AI响应成功',
        schema: {
            type: 'object',
            properties: {
                content: { type: 'string', example: 'AI的回复内容...' },
                model: { type: 'string', example: 'deepseek-chat' },
                provider: { type: 'string', example: 'DEEPSEEK' },
                tokensUsed: { type: 'number', example: 1250 }
            }
        }
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_d = typeof general_chat_dto_1.GeneralChatDto !== "undefined" && general_chat_dto_1.GeneralChatDto) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], AssistantController.prototype, "generalChat", null);
__decorate([
    (0, common_1.Post)('assistant/general/stream'),
    (0, common_2.RequireFeature)('aiWriting'),
    (0, common_2.RequireQuota)('daily'),
    (0, swagger_1.ApiOperation)({
        summary: '通用AI对话（流式）',
        description: '流式输出，实时返回AI生成的内容，逐字符推送'
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_e = typeof general_chat_stream_dto_1.GeneralChatStreamDto !== "undefined" && general_chat_stream_dto_1.GeneralChatStreamDto) === "function" ? _e : Object, typeof (_f = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _f : Object]),
    __metadata("design:returntype", Promise)
], AssistantController.prototype, "generalChatStream", null);
exports.AssistantController = AssistantController = __decorate([
    (0, swagger_1.ApiTags)('AI助手'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard, common_2.PackageFeatureGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof assistant_service_1.AssistantService !== "undefined" && assistant_service_1.AssistantService) === "function" ? _a : Object])
], AssistantController);


/***/ }),
/* 27 */
/***/ ((module) => {

module.exports = require("express");

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
__exportStar(__webpack_require__(32), exports);
__exportStar(__webpack_require__(35), exports);
__exportStar(__webpack_require__(36), exports);
__exportStar(__webpack_require__(37), exports);
__exportStar(__webpack_require__(38), exports);
__exportStar(__webpack_require__(39), exports);
__exportStar(__webpack_require__(40), exports);
__exportStar(__webpack_require__(41), exports);
__exportStar(__webpack_require__(42), exports);


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
/* 31 */
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
/* 32 */
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
__exportStar(__webpack_require__(33), exports);
__exportStar(__webpack_require__(34), exports);


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
exports.JwtAuthGuard = void 0;
const common_1 = __webpack_require__(2);
const passport_1 = __webpack_require__(7);
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
/* 34 */
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
/* 35 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 36 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 37 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 38 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


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
var PackagePermissionService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PackagePermissionService = void 0;
const common_1 = __webpack_require__(2);
const database_1 = __webpack_require__(9);
let PackagePermissionService = PackagePermissionService_1 = class PackagePermissionService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(PackagePermissionService_1.name);
    }
    async checkVideoGenerationPermission(userId) {
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId },
            include: {
                package: true,
            },
        });
        if (!subscription || subscription.status !== 'ACTIVE') {
            this.logger.log(`用户${userId}无有效订阅，使用免费限制`);
            return {
                allowed: false,
                limits: this.getFreeLimits(),
                packageName: '免费套餐',
                message: '请升级套餐以使用视频生成功能'
            };
        }
        const features = subscription.package.features;
        const videoFeatures = features?.videoGeneration;
        if (!videoFeatures || !videoFeatures.enabled) {
            this.logger.log(`用户${userId}套餐不包含视频生成功能`);
            return {
                allowed: false,
                limits: this.getFreeLimits(),
                packageName: subscription.package.name,
                message: '当前套餐不包含视频生成功能'
            };
        }
        this.logger.log(`用户${userId}套餐: ${subscription.package.name}, 视频配额: ${videoFeatures.dailyQuota}/${videoFeatures.monthlyQuota}`);
        return {
            allowed: true,
            limits: {
                dailyQuota: videoFeatures.dailyQuota || 5,
                monthlyQuota: videoFeatures.monthlyQuota || 50,
                maxSceneCount: videoFeatures.maxSceneCount || 5,
                maxVideoDuration: videoFeatures.maxVideoDuration || 30,
                allowedQualities: videoFeatures.allowedQualities || ['standard'],
                allowedResolutions: videoFeatures.allowedResolutions || ['1024x576'],
                enableAdvancedParams: videoFeatures.enableAdvancedParams || false,
                enableCustomPrompts: videoFeatures.enableCustomPrompts || false,
                priority: videoFeatures.priority || 'normal'
            },
            packageName: subscription.package.name
        };
    }
    validateUserParams(userParams, limits) {
        const errors = [];
        if (userParams.sceneCount && userParams.sceneCount > limits.maxSceneCount) {
            errors.push(`分镜数量超出限制（最多${limits.maxSceneCount}个，请升级套餐）`);
        }
        const totalDuration = (userParams.sceneCount || 5) * (userParams.videoDuration || 5);
        if (totalDuration > limits.maxVideoDuration) {
            errors.push(`视频总时长超出限制（最多${limits.maxVideoDuration}秒，请升级套餐）`);
        }
        if (userParams.imageQuality && !limits.allowedQualities.includes(userParams.imageQuality)) {
            errors.push(`图片质量"${userParams.imageQuality}"不在允许范围内（允许：${limits.allowedQualities.join(', ')}），请升级套餐`);
        }
        if (userParams.imageResolution && !limits.allowedResolutions.includes(userParams.imageResolution)) {
            errors.push(`图片分辨率不在允许范围内（允许：${limits.allowedResolutions.join(', ')}），请升级套餐`);
        }
        if (!limits.enableAdvancedParams) {
            const advancedParams = ['samplingSteps', 'cfgScale', 'negativePrompt'];
            const usedAdvanced = advancedParams.filter(param => userParams[param] !== undefined);
            if (usedAdvanced.length > 0) {
                errors.push(`当前套餐不支持高级参数配置（${usedAdvanced.join(', ')}），请升级到专业版或企业版`);
            }
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
    getFreeLimits() {
        return {
            dailyQuota: 0,
            monthlyQuota: 0,
            maxSceneCount: 0,
            maxVideoDuration: 0,
            allowedQualities: [],
            allowedResolutions: [],
            enableAdvancedParams: false,
            enableCustomPrompts: false,
            priority: 'low'
        };
    }
};
exports.PackagePermissionService = PackagePermissionService;
exports.PackagePermissionService = PackagePermissionService = PackagePermissionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], PackagePermissionService);


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
var FeatureQuotaService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FeatureQuotaService = void 0;
const common_1 = __webpack_require__(2);
const database_1 = __webpack_require__(9);
let FeatureQuotaService = FeatureQuotaService_1 = class FeatureQuotaService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(FeatureQuotaService_1.name);
    }
    async checkAndConsumeQuota(userId, feature, quotaType = 'daily') {
        this.logger.log(`检查用户${userId}的${feature}配额（${quotaType}）`);
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId },
            include: { package: true },
        });
        let limit = 0;
        let packageName = '免费套餐';
        if (subscription && subscription.status === 'ACTIVE') {
            packageName = subscription.package.name;
            const features = subscription.package.features;
            const featureConfig = features?.[feature];
            if (featureConfig && featureConfig.enabled) {
                limit = quotaType === 'daily' ? (featureConfig.dailyQuota || 0) : (featureConfig.monthlyQuota || 0);
                if (limit === -1) {
                    this.logger.log(`用户${userId}套餐${packageName}的${feature}不限配额`);
                    return {
                        allowed: true,
                        remaining: -1,
                        limit: -1,
                    };
                }
            }
        }
        else {
            const freeLimit = this.getFreeFunctionLimit(feature, quotaType);
            limit = freeLimit;
            if (limit === 0) {
                this.logger.log(`免费用户不允许使用${feature}`);
                return {
                    allowed: false,
                    remaining: 0,
                    limit: 0,
                    message: `${this.getFeatureName(feature)}功能需要订阅套餐，请升级`
                };
            }
        }
        const date = quotaType === 'daily' ? this.getTodayDate() : this.getMonthStartDate();
        let quota = await this.prisma.featureQuota.findUnique({
            where: {
                userId_feature_quotaType_date: {
                    userId,
                    feature,
                    quotaType,
                    date,
                },
            },
        });
        if (!quota) {
            quota = await this.prisma.featureQuota.create({
                data: {
                    userId,
                    feature,
                    quotaType,
                    date,
                    usedCount: 0,
                    limit,
                },
            });
        }
        const remaining = Math.max(0, limit - quota.usedCount);
        if (remaining <= 0) {
            this.logger.log(`用户${userId}的${feature}配额已用尽（${quota.usedCount}/${limit}）`);
            return {
                allowed: false,
                remaining: 0,
                limit,
                message: `已达${quotaType === 'daily' ? '每日' : '每月'}配额限制（${limit}次），请升级套餐`
            };
        }
        await this.prisma.featureQuota.update({
            where: { id: quota.id },
            data: {
                usedCount: { increment: 1 },
                lastUsedAt: new Date(),
            },
        });
        this.logger.log(`用户${userId}消费${feature}配额，剩余${remaining - 1}/${limit}`);
        return {
            allowed: true,
            remaining: remaining - 1,
            limit,
        };
    }
    async getQuotaStatus(userId, feature) {
        const daily = await this.getQuotaRemaining(userId, feature, 'daily');
        const monthly = await this.getQuotaRemaining(userId, feature, 'monthly');
        return {
            daily,
            monthly,
        };
    }
    async getQuotaRemaining(userId, feature, quotaType) {
        const date = quotaType === 'daily' ? this.getTodayDate() : this.getMonthStartDate();
        const quota = await this.prisma.featureQuota.findUnique({
            where: {
                userId_feature_quotaType_date: {
                    userId,
                    feature,
                    quotaType,
                    date,
                },
            },
        });
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId },
            include: { package: true },
        });
        let limit = 0;
        if (subscription && subscription.status === 'ACTIVE') {
            const features = subscription.package.features;
            const featureConfig = features?.[feature];
            if (featureConfig && featureConfig.enabled) {
                limit = quotaType === 'daily' ? (featureConfig.dailyQuota || 0) : (featureConfig.monthlyQuota || 0);
            }
        }
        else {
            limit = this.getFreeFunctionLimit(feature, quotaType);
        }
        const usedCount = quota?.usedCount || 0;
        const remaining = limit === -1 ? -1 : Math.max(0, limit - usedCount);
        return {
            used: usedCount,
            remaining,
            limit,
        };
    }
    getFreeFunctionLimit(feature, quotaType) {
        const freeLimits = {
            aiWriting: { daily: 100, monthly: 1000 },
            aiAssistant: { daily: 50, monthly: 500 },
            videoGeneration: { daily: 0, monthly: 0 },
            materialGeneration: { daily: 10, monthly: 100 },
        };
        const featureLimits = freeLimits[feature];
        if (!featureLimits) {
            return 0;
        }
        return quotaType === 'daily' ? featureLimits.daily : featureLimits.monthly;
    }
    getFeatureName(feature) {
        const names = {
            videoGeneration: '视频生成',
            aiWriting: 'AI写作',
            aiAssistant: 'AI写作助手',
            materialGeneration: '素材生成',
        };
        return names[feature] || feature;
    }
    getTodayDate() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    }
    getMonthStartDate() {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
};
exports.FeatureQuotaService = FeatureQuotaService;
exports.FeatureQuotaService = FeatureQuotaService = FeatureQuotaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], FeatureQuotaService);


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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PackageFeatureGuard = void 0;
const common_1 = __webpack_require__(2);
const core_1 = __webpack_require__(1);
const database_1 = __webpack_require__(9);
const feature_quota_service_1 = __webpack_require__(40);
let PackageFeatureGuard = class PackageFeatureGuard {
    constructor(reflector, prisma, featureQuotaService) {
        this.reflector = reflector;
        this.prisma = prisma;
        this.featureQuotaService = featureQuotaService;
    }
    async canActivate(context) {
        const requiredFeature = this.reflector.get('feature', context.getHandler());
        const quotaType = this.reflector.get('quotaType', context.getHandler()) || 'daily';
        if (!requiredFeature) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.userId || request.user?.id;
        if (!userId) {
            throw new common_1.ForbiddenException('未登录或token无效');
        }
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId },
            include: { package: true },
        });
        let featureConfig = null;
        let packageName = '免费套餐';
        if (subscription && subscription.status === 'ACTIVE') {
            packageName = subscription.package.name;
            const features = subscription.package.features;
            featureConfig = features?.[requiredFeature];
            if (!featureConfig || !featureConfig.enabled) {
                throw new common_1.ForbiddenException({
                    message: `当前套餐（${packageName}）不包含${this.getFeatureName(requiredFeature)}功能`,
                    feature: requiredFeature,
                    packageName,
                    upgradeRequired: true,
                });
            }
        }
        else {
            const allowed = await this.checkFreeUserAccess(requiredFeature);
            if (!allowed) {
                throw new common_1.ForbiddenException({
                    message: `${this.getFeatureName(requiredFeature)}功能需要订阅套餐，请升级`,
                    feature: requiredFeature,
                    packageName: '免费套餐',
                    upgradeRequired: true,
                });
            }
        }
        const quotaResult = await this.featureQuotaService.checkAndConsumeQuota(userId, requiredFeature, quotaType);
        if (!quotaResult.allowed) {
            throw new common_1.ForbiddenException({
                message: quotaResult.message,
                feature: requiredFeature,
                packageName,
                quotaType,
                used: quotaResult.limit,
                limit: quotaResult.limit,
                upgradeRequired: quotaResult.limit > 0,
            });
        }
        request.packageLimits = featureConfig;
        request.packageName = packageName;
        request.quotaRemaining = {
            [quotaType]: quotaResult.remaining,
        };
        return true;
    }
    async checkFreeUserAccess(feature) {
        const freeFunctions = ['aiWriting', 'aiAssistant', 'materialGeneration'];
        return freeFunctions.includes(feature);
    }
    getFeatureName(feature) {
        const names = {
            videoGeneration: '视频生成',
            aiWriting: 'AI写作',
            aiAssistant: 'AI写作助手',
            materialGeneration: '素材生成',
            suggestion: '写作建议',
        };
        return names[feature] || feature;
    }
};
exports.PackageFeatureGuard = PackageFeatureGuard;
exports.PackageFeatureGuard = PackageFeatureGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object, typeof (_b = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _b : Object, typeof (_c = typeof feature_quota_service_1.FeatureQuotaService !== "undefined" && feature_quota_service_1.FeatureQuotaService) === "function" ? _c : Object])
], PackageFeatureGuard);


/***/ }),
/* 42 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RequireQuota = exports.RequireFeature = exports.QUOTA_TYPE_KEY = exports.FEATURE_KEY = void 0;
const common_1 = __webpack_require__(2);
exports.FEATURE_KEY = 'feature';
exports.QUOTA_TYPE_KEY = 'quotaType';
const RequireFeature = (feature) => (0, common_1.SetMetadata)(exports.FEATURE_KEY, feature);
exports.RequireFeature = RequireFeature;
const RequireQuota = (quotaType = 'daily') => (0, common_1.SetMetadata)(exports.QUOTA_TYPE_KEY, quotaType);
exports.RequireQuota = RequireQuota;


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
exports.GeneralChatDto = void 0;
const swagger_1 = __webpack_require__(3);
const class_validator_1 = __webpack_require__(16);
class GeneralChatDto {
}
exports.GeneralChatDto = GeneralChatDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '用户消息',
        example: '请帮我分析一下玄幻小说的市场潜力'
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GeneralChatDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'AI配置ID（格式：system:id 或 user:id，不提供则使用默认配置）',
        example: 'user:cm1234567890'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GeneralChatDto.prototype, "aiConfigId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '额外参数',
        example: { temperature: 0.7, maxTokens: 4000 }
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], GeneralChatDto.prototype, "parameters", void 0);


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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GeneralChatStreamDto = void 0;
const swagger_1 = __webpack_require__(3);
const class_validator_1 = __webpack_require__(16);
class GeneralChatStreamDto {
}
exports.GeneralChatStreamDto = GeneralChatStreamDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '用户消息',
        example: '请帮我分析一下玄幻小说的市场潜力'
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GeneralChatStreamDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'AI配置ID',
        example: 'user:cm1234567890'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GeneralChatStreamDto.prototype, "aiConfigId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '额外参数'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], GeneralChatStreamDto.prototype, "parameters", void 0);


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
exports.ContextManagerService = void 0;
const common_1 = __webpack_require__(2);
const database_1 = __webpack_require__(9);
let ContextManagerService = class ContextManagerService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSmartContext(request) {
        const novel = await this.prisma.novel.findFirst({
            where: {
                id: request.novelId,
                userId: request.userId,
            },
        });
        if (!novel) {
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.NOT_FOUND,
                message: '小说不存在或无权访问',
                error: 'NOVEL_NOT_FOUND',
            }, common_1.HttpStatus.NOT_FOUND);
        }
        const context = {
            novel: {
                title: novel.title,
                description: novel.description || undefined,
                genre: novel.genre || undefined,
            },
        };
        if (request.includeCharacters) {
            context.characters = await this.getRelevantCharacters(request.novelId, request.keywords);
        }
        if (request.maxMemories && request.maxMemories > 0) {
            context.memories = await this.getRelevantMemories(request.novelId, request.keywords, request.maxMemories);
        }
        if (request.maxChapters && request.maxChapters > 0) {
            context.chapters = await this.getRelevantChapters(request.novelId, request.chapterId, request.keywords, request.maxChapters);
        }
        if (request.chapterId) {
            context.currentChapter = await this.getCurrentChapter(request.chapterId, request.userId);
        }
        return context;
    }
    async getRelevantCharacters(novelId, keywords) {
        const characters = await this.prisma.character.findMany({
            where: {
                novelId,
            },
            select: {
                name: true,
                background: true,
                personality: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
            take: 10,
        });
        if (keywords && keywords.length > 0) {
            return characters
                .map(char => ({
                ...char,
                relevance: this.calculateRelevance(char.name + ' ' + (char.background || '') + ' ' + (char.personality || ''), keywords),
            }))
                .filter(char => char.relevance > 0)
                .sort((a, b) => b.relevance - a.relevance)
                .map(({ relevance, ...char }) => char);
        }
        return characters;
    }
    async getRelevantMemories(novelId, keywords, maxCount = 5) {
        const memories = await this.prisma.novelMemory.findMany({
            where: {
                novelId,
            },
            select: {
                content: true,
                memoryType: true,
            },
            orderBy: {
                importance: 'desc',
            },
            take: maxCount * 3,
        });
        const memoriesWithRelevance = memories.map(memory => {
            const contentStr = typeof memory.content === 'string'
                ? memory.content
                : JSON.stringify(memory.content);
            return {
                title: memory.memoryType || '记忆',
                content: contentStr,
                relevance: keywords && keywords.length > 0
                    ? this.calculateRelevance(contentStr, keywords)
                    : 1,
            };
        });
        return memoriesWithRelevance
            .sort((a, b) => b.relevance - a.relevance)
            .slice(0, maxCount);
    }
    async getRelevantChapters(novelId, currentChapterId, keywords, maxCount = 3) {
        if (currentChapterId) {
            const currentChapter = await this.prisma.chapter.findUnique({
                where: { id: currentChapterId },
                select: { chapterNumber: true },
            });
            if (currentChapter) {
                const previousChapters = await this.prisma.chapter.findMany({
                    where: {
                        novelId,
                        chapterNumber: {
                            lt: currentChapter.chapterNumber,
                        },
                    },
                    select: {
                        title: true,
                        content: true,
                    },
                    orderBy: {
                        chapterNumber: 'desc',
                    },
                    take: maxCount,
                });
                return previousChapters.reverse();
            }
        }
        const recentChapters = await this.prisma.chapter.findMany({
            where: {
                novelId,
            },
            select: {
                title: true,
                content: true,
            },
            orderBy: {
                chapterNumber: 'desc',
            },
            take: maxCount,
        });
        return recentChapters.reverse();
    }
    async getCurrentChapter(chapterId, userId) {
        const chapter = await this.prisma.chapter.findFirst({
            where: {
                id: chapterId,
                novel: {
                    userId,
                },
                isDeleted: false,
            },
            select: {
                title: true,
                content: true,
            },
        });
        if (!chapter) {
            return undefined;
        }
        return {
            title: chapter.title,
            content: chapter.content || '',
        };
    }
    calculateRelevance(text, keywords) {
        if (!text || !keywords || keywords.length === 0) {
            return 0;
        }
        const lowerText = text.toLowerCase();
        let score = 0;
        for (const keyword of keywords) {
            const lowerKeyword = keyword.toLowerCase();
            const occurrences = (lowerText.match(new RegExp(lowerKeyword, 'g')) || []).length;
            score += occurrences;
        }
        return score;
    }
    formatContextForAI(context) {
        let text = '';
        text += `【小说信息】\n`;
        text += `标题：${context.novel.title}\n`;
        if (context.novel.description) {
            text += `简介：${context.novel.description}\n`;
        }
        if (context.novel.genre) {
            text += `类型：${context.novel.genre}\n`;
        }
        text += '\n';
        if (context.outline) {
            text += `【故事大纲】\n${context.outline.content}\n\n`;
        }
        if (context.characters && context.characters.length > 0) {
            text += `【主要角色】\n`;
            for (const char of context.characters) {
                text += `- ${char.name}`;
                if (char.description) {
                    text += `：${char.description}`;
                }
                if (char.personality) {
                    text += `（性格：${char.personality}）`;
                }
                text += '\n';
            }
            text += '\n';
        }
        if (context.memories && context.memories.length > 0) {
            text += `【相关设定】\n`;
            for (const memory of context.memories) {
                text += `- ${memory.title}：${memory.content}\n`;
            }
            text += '\n';
        }
        if (context.chapters && context.chapters.length > 0) {
            text += `【前文内容】\n`;
            for (const chapter of context.chapters) {
                text += `《${chapter.title}》\n`;
                if (chapter.summary) {
                    text += `概要：${chapter.summary}\n`;
                }
                else {
                    const preview = chapter.content.slice(0, 200);
                    text += `${preview}${chapter.content.length > 200 ? '...' : ''}\n`;
                }
                text += '\n';
            }
        }
        if (context.currentChapter) {
            text += `【当前章节】\n`;
            text += `《${context.currentChapter.title}》\n`;
            text += `${context.currentChapter.content}\n`;
        }
        return text;
    }
};
exports.ContextManagerService = ContextManagerService;
exports.ContextManagerService = ContextManagerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], ContextManagerService);


/***/ }),
/* 46 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GenerationModule = void 0;
const common_1 = __webpack_require__(2);
const microservices_1 = __webpack_require__(8);
const generation_service_1 = __webpack_require__(47);
const generation_controller_1 = __webpack_require__(48);
const ai_caller_service_1 = __webpack_require__(17);
const context_manager_service_1 = __webpack_require__(45);
const common_2 = __webpack_require__(28);
let GenerationModule = class GenerationModule {
};
exports.GenerationModule = GenerationModule;
exports.GenerationModule = GenerationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            microservices_1.ClientsModule.register([
                {
                    name: 'USER_SERVICE',
                    transport: microservices_1.Transport.TCP,
                    options: {
                        host: process.env.USER_SERVICE_HOST || 'localhost',
                        port: parseInt(process.env.USER_SERVICE_PORT) || 3004,
                    },
                },
            ]),
        ],
        controllers: [generation_controller_1.GenerationController],
        providers: [generation_service_1.GenerationService, ai_caller_service_1.AICallerService, context_manager_service_1.ContextManagerService, common_2.FeatureQuotaService],
        exports: [generation_service_1.GenerationService],
    })
], GenerationModule);


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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GenerationService = void 0;
const common_1 = __webpack_require__(2);
const database_1 = __webpack_require__(9);
const ai_caller_service_1 = __webpack_require__(17);
const context_manager_service_1 = __webpack_require__(45);
let GenerationService = class GenerationService {
    constructor(prisma, aiCallerService, contextManager) {
        this.prisma = prisma;
        this.aiCallerService = aiCallerService;
        this.contextManager = contextManager;
    }
    async generateContent(userId, dto) {
        const novel = await this.prisma.novel.findFirst({
            where: { id: dto.novelId, userId },
        });
        if (!novel) {
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.NOT_FOUND,
                message: '小说不存在或无权访问',
                error: 'NOVEL_NOT_FOUND',
            }, common_1.HttpStatus.NOT_FOUND);
        }
        const messages = await this.buildPrompt(userId, dto, novel);
        const response = await this.aiCallerService.callAI({
            userId,
            messages,
            configId: dto.aiConfigId,
            parameters: {
                temperature: this.getTemperatureByStyle(dto.style),
                maxTokens: this.getMaxTokensByLength(dto.length),
            },
        });
        return {
            content: response.content,
            metadata: {
                type: dto.contentType,
                length: dto.length,
                style: dto.style,
                wordCount: this.calculateWordCount(response.content),
                model: response.model,
                provider: response.provider,
                tokensUsed: response.totalTokens,
            },
        };
    }
    async *generateContentStream(userId, dto) {
        const novel = await this.prisma.novel.findFirst({
            where: { id: dto.novelId, userId },
        });
        if (!novel) {
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.NOT_FOUND,
                message: '小说不存在或无权访问',
                error: 'NOVEL_NOT_FOUND',
            }, common_1.HttpStatus.NOT_FOUND);
        }
        const messages = await this.buildPrompt(userId, dto, novel);
        for await (const chunk of this.aiCallerService.callAIStream({
            userId,
            messages,
            configId: dto.aiConfigId,
            parameters: {
                temperature: this.getTemperatureByStyle(dto.style),
                maxTokens: this.getMaxTokensByLength(dto.length),
            },
            stream: true,
        })) {
            yield chunk;
        }
    }
    async buildPrompt(userId, dto, novel) {
        const messages = [];
        let systemPrompt = '你是一位专业的小说创作助手。';
        if (dto.style === 'formal') {
            systemPrompt += '请使用正式、严谨的文学风格进行创作。';
        }
        else if (dto.style === 'casual') {
            systemPrompt += '请使用轻松、活泼的叙事风格进行创作。';
        }
        else if (dto.style === 'poetic') {
            systemPrompt += '请使用富有诗意、优美的文学风格进行创作。';
        }
        messages.push({
            role: 'system',
            content: systemPrompt,
        });
        let contextText = '';
        if (dto.context) {
            contextText = dto.context;
        }
        else {
            try {
                const keywords = this.extractKeywords(dto.prompt);
                const smartContext = await this.contextManager.getSmartContext({
                    userId,
                    novelId: dto.novelId,
                    keywords,
                    maxMemories: 5,
                    maxChapters: 2,
                    includeOutline: true,
                    includeCharacters: true,
                });
                contextText = this.contextManager.formatContextForAI(smartContext);
            }
            catch (error) {
                console.error('获取智能上下文失败:', error);
                contextText = `【小说信息】\n`;
                contextText += `标题：${novel.title}\n`;
                if (novel.description) {
                    contextText += `简介：${novel.description}\n`;
                }
                if (novel.outline?.content) {
                    contextText += `\n【故事大纲】\n${novel.outline.content}\n`;
                }
            }
        }
        messages.push({
            role: 'user',
            content: contextText,
        });
        let taskPrompt = '';
        switch (dto.contentType) {
            case 'continuation':
                taskPrompt = `请基于以上信息，续写${this.getLengthDescription(dto.length)}的内容。`;
                break;
            case 'scene':
                taskPrompt = `请基于以上信息，创作${this.getLengthDescription(dto.length)}的场景描写。`;
                break;
            case 'dialogue':
                taskPrompt = `请基于以上信息，创作${this.getLengthDescription(dto.length)}的对话内容。`;
                break;
            case 'description':
                taskPrompt = `请基于以上信息，创作${this.getLengthDescription(dto.length)}的环境/人物描写。`;
                break;
            case 'opening':
                taskPrompt = `请基于以上信息，创作${this.getLengthDescription(dto.length)}的开头内容。`;
                break;
            case 'ending':
                taskPrompt = `请基于以上信息，创作${this.getLengthDescription(dto.length)}的结尾内容。`;
                break;
            default:
                taskPrompt = `请基于以上信息，续写${this.getLengthDescription(dto.length)}的内容。`;
        }
        if (dto.prompt) {
            taskPrompt += `\n\n用户要求：${dto.prompt}`;
        }
        messages.push({
            role: 'user',
            content: taskPrompt,
        });
        return messages;
    }
    extractKeywords(text) {
        const cleanText = text.replace(/[，。！？；：""''（）【】《》、]/g, ' ');
        const words = cleanText.split(/\s+/).filter(w => w.length > 1);
        return words.slice(0, 5);
    }
    getTemperatureByStyle(style) {
        switch (style) {
            case 'formal':
                return 0.5;
            case 'casual':
                return 0.8;
            case 'poetic':
                return 0.9;
            default:
                return 0.7;
        }
    }
    getMaxTokensByLength(length) {
        switch (length) {
            case 'short':
                return 500;
            case 'medium':
                return 1000;
            case 'long':
                return 2000;
            default:
                return 1000;
        }
    }
    getLengthDescription(length) {
        switch (length) {
            case 'short':
                return '200-300字';
            case 'medium':
                return '400-600字';
            case 'long':
                return '800-1200字';
            default:
                return '400-600字';
        }
    }
    calculateWordCount(content) {
        const chineseChars = (content.match(/[\u4e00-\u9fff]/g) || []).length;
        const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
        return chineseChars + englishWords;
    }
    async generateWithMaterials(userId, dto) {
        try {
            const materials = await this.prisma.material.findMany({
                where: {
                    id: { in: dto.materialIds },
                    userId,
                },
                select: {
                    id: true,
                    name: true,
                    type: true,
                    fileUrl: true,
                    description: true,
                }
            });
            if (materials.length === 0) {
                throw new common_1.HttpException('未找到可用的素材', common_1.HttpStatus.NOT_FOUND);
            }
            const materialContext = materials.map(m => {
                return `素材《${m.name}》${m.description ? `：${m.description}` : ''}
内容摘要：${m.fileUrl ? m.fileUrl.substring(0, 500) : '（无内容）'}`;
            }).join('\n\n');
            const usageTypeMap = {
                style: '参考其写作风格和叙事手法',
                structure: '借鉴其情节结构和故事架构',
                character: '学习其角色塑造技巧和人物刻画方式',
                scene: '参考其场景描写和氛围营造手法',
                technique: '吸收其创作技巧和表现手法',
            };
            const usageDesc = usageTypeMap[dto.usageType] || '作为创作参考';
            const messages = [
                {
                    role: 'system',
                    content: `你是一位专业的小说创作助手。你需要${usageDesc}，但绝不直接抄袭或照搬原文。
要求：
1. 理解素材的精髓和特点
2. 用自己的方式重新表达和创作
3. 保持原创性，相似度控制在${dto.preventSimilarity ? '20%以下' : '50%以下'}
4. 生成约${dto.targetLength || 1000}字的内容
5. 创意度：${(dto.creativity || 0.8) * 100}%`
                },
                {
                    role: 'user',
                    content: `参考素材：
${materialContext}

创作需求：${dto.prompt}
${dto.additionalContext ? `\n额外上下文：${dto.additionalContext}` : ''}

请基于以上素材和需求，创作出高质量的原创内容。`
                }
            ];
            const response = await this.aiCallerService.callAI({
                userId,
                messages,
                parameters: {
                    temperature: dto.creativity || 0.8,
                    maxTokens: Math.ceil((dto.targetLength || 1000) * 2),
                },
            });
            const materialUsage = materials.map(m => ({
                materialId: m.id,
                materialName: m.name,
                usageType: dto.usageType,
                similarity: 0.15,
            }));
            return {
                success: true,
                data: {
                    content: response.content,
                    materialUsage,
                    usage: response.usage,
                    model: response.model,
                    warnings: dto.preventSimilarity ? ['已启用防抄袭保护'] : [],
                }
            };
        }
        catch (error) {
            console.error('基于素材生成内容失败:', error);
            throw new common_1.HttpException(error.message || '生成失败', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async extractStyle(dto) {
        const messages = [
            {
                role: 'system',
                content: '你是一位专业的文学分析师，擅长提取和分析文本的写作风格特征。'
            },
            {
                role: 'user',
                content: `请分析以下文本的写作风格，重点提取：${(dto.features || []).join('、')}

文本内容：
${dto.content}

请以结构化的方式描述这段文本的风格特征。`
            }
        ];
        const response = await this.aiCallerService.callAI({
            userId: 'system',
            messages,
            parameters: {
                temperature: 0.3,
                maxTokens: 1000,
            },
        });
        return {
            success: true,
            data: {
                analysis: response.content,
                materialId: dto.materialId,
                features: dto.features || ['narrative', 'dialogue', 'description'],
            }
        };
    }
    async analyzePlot(dto) {
        const messages = [
            {
                role: 'system',
                content: '你是一位专业的故事结构分析师，擅长分析情节发展和叙事架构。'
            },
            {
                role: 'user',
                content: `请分析以下故事的情节结构，分析深度：${dto.depth || 'basic'}

故事内容：
${dto.content}

请识别：开端、发展、高潮、结局，以及关键转折点。`
            }
        ];
        const response = await this.aiCallerService.callAI({
            userId: 'system',
            messages,
            parameters: {
                temperature: 0.3,
                maxTokens: 1500,
            },
        });
        return {
            success: true,
            data: {
                structure: response.content,
                depth: dto.depth || 'basic',
            }
        };
    }
    async analyzeCharacter(dto) {
        const messages = [
            {
                role: 'system',
                content: '你是一位专业的角色分析师，擅长分析人物性格、动机和发展弧线。'
            },
            {
                role: 'user',
                content: `请分析${dto.characterName ? `角色"${dto.characterName}"` : '文本中角色'}的特征，分析维度：${(dto.dimensions || []).join('、')}

文本内容：
${dto.content}

请提供详细的角色分析。`
            }
        ];
        const response = await this.aiCallerService.callAI({
            userId: 'system',
            messages,
            parameters: {
                temperature: 0.3,
                maxTokens: 1500,
            },
        });
        return {
            success: true,
            data: {
                analysis: response.content,
                characterName: dto.characterName,
                dimensions: dto.dimensions || ['personality', 'background'],
            }
        };
    }
    async checkSimilarity(dto) {
        const text1 = dto.content1.toLowerCase();
        const text2 = dto.content2.toLowerCase();
        const words1 = new Set(text1.split(/\s+/));
        const words2 = new Set(text2.split(/\s+/));
        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        const similarity = union.size > 0 ? intersection.size / union.size : 0;
        const threshold = dto.threshold || 0.7;
        return {
            success: true,
            data: {
                similarity: parseFloat(similarity.toFixed(4)),
                threshold,
                isSimilar: similarity > threshold,
                warning: similarity > threshold ? '内容相似度较高，建议修改' : null,
                details: {
                    commonWords: intersection.size,
                    totalWords: union.size,
                    text1Length: words1.size,
                    text2Length: words2.size,
                }
            }
        };
    }
};
exports.GenerationService = GenerationService;
exports.GenerationService = GenerationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof ai_caller_service_1.AICallerService !== "undefined" && ai_caller_service_1.AICallerService) === "function" ? _b : Object, typeof (_c = typeof context_manager_service_1.ContextManagerService !== "undefined" && context_manager_service_1.ContextManagerService) === "function" ? _c : Object])
], GenerationService);


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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GenerationController = void 0;
const common_1 = __webpack_require__(2);
const swagger_1 = __webpack_require__(3);
const common_2 = __webpack_require__(28);
const generation_service_1 = __webpack_require__(47);
const conversation_dto_1 = __webpack_require__(15);
const material_generation_dto_1 = __webpack_require__(49);
let GenerationController = class GenerationController {
    constructor(generationService) {
        this.generationService = generationService;
    }
    async generateContent(req, dto) {
        return this.generationService.generateContent(req.user.id, dto);
    }
    async generateWithMaterials(req, dto) {
        return this.generationService.generateWithMaterials(req.user.id, dto);
    }
    async continueContent(req, dto) {
        return this.generationService.generateContent(req.user.id, { ...dto, type: 'continuation' });
    }
    async rewriteContent(req, dto) {
        return this.generationService.generateContent(req.user.id, { ...dto, type: 'rewrite' });
    }
    async expandContent(req, dto) {
        return this.generationService.generateContent(req.user.id, { ...dto, type: 'expansion' });
    }
    async extractStyle(req, dto) {
        return this.generationService.extractStyle(dto);
    }
    async analyzePlot(req, dto) {
        return this.generationService.analyzePlot(dto);
    }
    async analyzeCharacter(req, dto) {
        return this.generationService.analyzeCharacter(dto);
    }
    async checkSimilarity(req, dto) {
        return this.generationService.checkSimilarity(dto);
    }
};
exports.GenerationController = GenerationController;
__decorate([
    (0, common_1.Post)('generation/content'),
    (0, common_2.RequireFeature)('aiWriting'),
    (0, common_2.RequireQuota)('daily'),
    (0, swagger_1.ApiOperation)({
        summary: 'AI内容生成',
        description: '使用AI生成小说内容，支持续写、场景、对话、描写、开头、结尾等多种内容类型'
    }),
    (0, swagger_1.ApiBody)({
        type: conversation_dto_1.GenerateContentDto,
        description: '生成参数'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'AI生成成功',
        schema: {
            type: 'object',
            properties: {
                content: { type: 'string', example: '主角终于走到了宫殿的大门前...' },
                metadata: {
                    type: 'object',
                    properties: {
                        type: { type: 'string', example: 'continuation' },
                        length: { type: 'string', example: 'medium' },
                        style: { type: 'string', example: 'current' },
                        wordCount: { type: 'number', example: 520 },
                        model: { type: 'string', example: 'gpt-4' },
                        provider: { type: 'string', example: 'OPENAI' },
                        tokensUsed: { type: 'number', example: 1250 }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '参数错误或AI服务异常',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: '未授权访问',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: '小说不存在或无权访问',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_b = typeof conversation_dto_1.GenerateContentDto !== "undefined" && conversation_dto_1.GenerateContentDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], GenerationController.prototype, "generateContent", null);
__decorate([
    (0, common_1.Post)('generation/with-materials'),
    (0, common_2.RequireFeature)('materialGeneration'),
    (0, common_2.RequireQuota)('daily'),
    (0, swagger_1.ApiOperation)({
        summary: '基于素材生成内容',
        description: '使用素材库作为参考和灵感生成内容，支持风格、结构、角色、场景等多种引用方式'
    }),
    (0, swagger_1.ApiBody)({ type: material_generation_dto_1.GenerateWithMaterialsDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '生成成功' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '无权限或配额不足' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_c = typeof material_generation_dto_1.GenerateWithMaterialsDto !== "undefined" && material_generation_dto_1.GenerateWithMaterialsDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], GenerationController.prototype, "generateWithMaterials", null);
__decorate([
    (0, common_1.Post)('generation/continue'),
    (0, common_2.RequireFeature)('aiWriting'),
    (0, common_2.RequireQuota)('daily'),
    (0, swagger_1.ApiOperation)({ summary: '续写内容' }),
    (0, swagger_1.ApiBody)({ type: conversation_dto_1.GenerateContentDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '续写成功' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '无权限或配额不足' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_d = typeof conversation_dto_1.GenerateContentDto !== "undefined" && conversation_dto_1.GenerateContentDto) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], GenerationController.prototype, "continueContent", null);
__decorate([
    (0, common_1.Post)('generation/rewrite'),
    (0, common_2.RequireFeature)('aiWriting'),
    (0, common_2.RequireQuota)('daily'),
    (0, swagger_1.ApiOperation)({ summary: '改写内容' }),
    (0, swagger_1.ApiBody)({ type: conversation_dto_1.GenerateContentDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '改写成功' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '无权限或配额不足' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_e = typeof conversation_dto_1.GenerateContentDto !== "undefined" && conversation_dto_1.GenerateContentDto) === "function" ? _e : Object]),
    __metadata("design:returntype", Promise)
], GenerationController.prototype, "rewriteContent", null);
__decorate([
    (0, common_1.Post)('generation/expand'),
    (0, common_2.RequireFeature)('aiWriting'),
    (0, common_2.RequireQuota)('daily'),
    (0, swagger_1.ApiOperation)({ summary: '扩展内容' }),
    (0, swagger_1.ApiBody)({ type: conversation_dto_1.GenerateContentDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '扩展成功' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '无权限或配额不足' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_f = typeof conversation_dto_1.GenerateContentDto !== "undefined" && conversation_dto_1.GenerateContentDto) === "function" ? _f : Object]),
    __metadata("design:returntype", Promise)
], GenerationController.prototype, "expandContent", null);
__decorate([
    (0, common_1.Post)('analysis/extract-style'),
    (0, swagger_1.ApiOperation)({ summary: '提取写作风格' }),
    (0, swagger_1.ApiBody)({ type: material_generation_dto_1.ExtractStyleDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '提取成功' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_g = typeof material_generation_dto_1.ExtractStyleDto !== "undefined" && material_generation_dto_1.ExtractStyleDto) === "function" ? _g : Object]),
    __metadata("design:returntype", Promise)
], GenerationController.prototype, "extractStyle", null);
__decorate([
    (0, common_1.Post)('analysis/plot-structure'),
    (0, swagger_1.ApiOperation)({ summary: '分析情节结构' }),
    (0, swagger_1.ApiBody)({ type: material_generation_dto_1.AnalyzePlotDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '分析成功' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_h = typeof material_generation_dto_1.AnalyzePlotDto !== "undefined" && material_generation_dto_1.AnalyzePlotDto) === "function" ? _h : Object]),
    __metadata("design:returntype", Promise)
], GenerationController.prototype, "analyzePlot", null);
__decorate([
    (0, common_1.Post)('analysis/character-traits'),
    (0, swagger_1.ApiOperation)({ summary: '分析角色特征' }),
    (0, swagger_1.ApiBody)({ type: material_generation_dto_1.AnalyzeCharacterDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '分析成功' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_j = typeof material_generation_dto_1.AnalyzeCharacterDto !== "undefined" && material_generation_dto_1.AnalyzeCharacterDto) === "function" ? _j : Object]),
    __metadata("design:returntype", Promise)
], GenerationController.prototype, "analyzeCharacter", null);
__decorate([
    (0, common_1.Post)('analysis/similarity'),
    (0, swagger_1.ApiOperation)({ summary: '检测内容相似度' }),
    (0, swagger_1.ApiBody)({ type: material_generation_dto_1.SimilarityCheckDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '检测成功' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_k = typeof material_generation_dto_1.SimilarityCheckDto !== "undefined" && material_generation_dto_1.SimilarityCheckDto) === "function" ? _k : Object]),
    __metadata("design:returntype", Promise)
], GenerationController.prototype, "checkSimilarity", null);
exports.GenerationController = GenerationController = __decorate([
    (0, swagger_1.ApiTags)('AI内容生成'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard, common_2.PackageFeatureGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof generation_service_1.GenerationService !== "undefined" && generation_service_1.GenerationService) === "function" ? _a : Object])
], GenerationController);


/***/ }),
/* 49 */
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
exports.SimilarityCheckDto = exports.AnalyzeCharacterDto = exports.AnalyzePlotDto = exports.ExtractStyleDto = exports.GenerateWithMaterialsDto = void 0;
const class_validator_1 = __webpack_require__(16);
const swagger_1 = __webpack_require__(3);
const class_transformer_1 = __webpack_require__(50);
class GenerateWithMaterialsDto {
}
exports.GenerateWithMaterialsDto = GenerateWithMaterialsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '用户创作需求/提示词',
        example: '创作一个主角登场的场景，要有气势'
    }),
    (0, class_validator_1.IsString)({ message: '提示词必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: '提示词不能为空' }),
    __metadata("design:type", String)
], GenerateWithMaterialsDto.prototype, "prompt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '引用的素材ID列表',
        example: ['material_id_1', 'material_id_2']
    }),
    (0, class_validator_1.IsArray)({ message: 'materialIds必须是数组' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'materialIds不能为空' }),
    __metadata("design:type", Array)
], GenerateWithMaterialsDto.prototype, "materialIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '素材使用类型',
        enum: ['style', 'structure', 'character', 'scene', 'technique'],
        example: 'style'
    }),
    (0, class_validator_1.IsEnum)(['style', 'structure', 'character', 'scene', 'technique'], { message: '使用类型无效' }),
    __metadata("design:type", String)
], GenerateWithMaterialsDto.prototype, "usageType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '目标生成长度（字符数）',
        example: 1000,
        minimum: 100,
        maximum: 5000
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(100),
    (0, class_validator_1.Max)(5000),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], GenerateWithMaterialsDto.prototype, "targetLength", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '创意度（0-1，越高越有创新性）',
        example: 0.8,
        minimum: 0,
        maximum: 1
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], GenerateWithMaterialsDto.prototype, "creativity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '是否开启防抄袭保护',
        example: true,
        default: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], GenerateWithMaterialsDto.prototype, "preventSimilarity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '额外上下文信息',
        example: '这是一部现代都市小说，主角是商业精英'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateWithMaterialsDto.prototype, "additionalContext", void 0);
class ExtractStyleDto {
}
exports.ExtractStyleDto = ExtractStyleDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '文本内容（用于提取风格）',
        example: '这是一段示例文本...'
    }),
    (0, class_validator_1.IsString)({ message: '内容必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: '内容不能为空' }),
    __metadata("design:type", String)
], ExtractStyleDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '素材ID（如果是从素材提取）'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExtractStyleDto.prototype, "materialId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '要提取的风格特征',
        example: ['narrative', 'dialogue', 'description', 'pacing'],
        default: ['narrative', 'dialogue', 'description']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], ExtractStyleDto.prototype, "features", void 0);
class AnalyzePlotDto {
}
exports.AnalyzePlotDto = AnalyzePlotDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '故事文本',
        example: '完整的故事或章节内容...'
    }),
    (0, class_validator_1.IsString)({ message: '内容必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: '内容不能为空' }),
    __metadata("design:type", String)
], AnalyzePlotDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '分析深度',
        enum: ['basic', 'detailed', 'comprehensive'],
        example: 'basic'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['basic', 'detailed', 'comprehensive']),
    __metadata("design:type", String)
], AnalyzePlotDto.prototype, "depth", void 0);
class AnalyzeCharacterDto {
}
exports.AnalyzeCharacterDto = AnalyzeCharacterDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '包含角色的文本片段',
        example: '主角李明是一个...'
    }),
    (0, class_validator_1.IsString)({ message: '内容必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: '内容不能为空' }),
    __metadata("design:type", String)
], AnalyzeCharacterDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '角色名称（可选，用于精准提取）',
        example: '李明'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnalyzeCharacterDto.prototype, "characterName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '提取维度',
        example: ['personality', 'background', 'motivation', 'arc'],
        default: ['personality', 'background']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], AnalyzeCharacterDto.prototype, "dimensions", void 0);
class SimilarityCheckDto {
}
exports.SimilarityCheckDto = SimilarityCheckDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '待检测文本1',
        example: '这是第一段文本...'
    }),
    (0, class_validator_1.IsString)({ message: '文本1必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: '文本1不能为空' }),
    __metadata("design:type", String)
], SimilarityCheckDto.prototype, "content1", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '参考文本2',
        example: '这是第二段文本...'
    }),
    (0, class_validator_1.IsString)({ message: '文本2必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: '文本2不能为空' }),
    __metadata("design:type", String)
], SimilarityCheckDto.prototype, "content2", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '相似度阈值（0-1）',
        example: 0.7,
        minimum: 0,
        maximum: 1,
        default: 0.7
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SimilarityCheckDto.prototype, "threshold", void 0);


/***/ }),
/* 50 */
/***/ ((module) => {

module.exports = require("class-transformer");

/***/ }),
/* 51 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SuggestionModule = void 0;
const common_1 = __webpack_require__(2);
const suggestion_service_1 = __webpack_require__(52);
const suggestion_controller_1 = __webpack_require__(54);
const common_2 = __webpack_require__(28);
let SuggestionModule = class SuggestionModule {
};
exports.SuggestionModule = SuggestionModule;
exports.SuggestionModule = SuggestionModule = __decorate([
    (0, common_1.Module)({
        controllers: [suggestion_controller_1.SuggestionController],
        providers: [suggestion_service_1.SuggestionService, common_2.FeatureQuotaService],
        exports: [suggestion_service_1.SuggestionService],
    })
], SuggestionModule);


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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SuggestionService = void 0;
const common_1 = __webpack_require__(2);
const database_1 = __webpack_require__(9);
const suggestion_dto_1 = __webpack_require__(53);
let SuggestionService = class SuggestionService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateRealtimeSuggestions(userId, dto) {
        if (!dto.content || dto.content.trim().length < 5) {
            return this.getWelcomeSuggestions();
        }
        const analysis = await this.performBasicTextAnalysis(dto.content);
        const suggestions = [];
        const basicSuggestions = this.generateBasicSuggestions(dto.content, analysis);
        suggestions.push(...basicSuggestions);
        const qualitySuggestions = this.generateQualitySuggestions(analysis);
        suggestions.push(...qualitySuggestions);
        const styleSuggestions = this.generateStyleSuggestions(dto.content);
        suggestions.push(...styleSuggestions);
        const optimizationSuggestions = this.generateOptimizationSuggestions(dto.content);
        suggestions.push(...optimizationSuggestions);
        const filteredSuggestions = this.rankAndFilterSuggestions(suggestions, {
            maxCount: dto.maxSuggestions || 8,
            requestedTypes: dto.suggestionTypes
        });
        await this.logSuggestionGeneration(userId, dto.content.length, filteredSuggestions.length);
        return {
            suggestions: filteredSuggestions,
            analysis: {
                wordCount: this.calculateWordCount(dto.content),
                readability: analysis.readability,
                complexity: analysis.complexity,
            },
            context: dto.context || {}
        };
    }
    async analyzeText(userId, dto) {
        const analysis = await this.performDetailedAnalysis(dto.content, dto.options);
        await this.logTextAnalysis(userId, dto.content.length);
        return analysis;
    }
    async applySuggestion(userId, dto) {
        await this.recordUserInteraction(userId, dto.suggestionId, dto.action, true);
        const result = this.processApplySuggestion(dto.content, dto.action, dto.options);
        return result;
    }
    async getSuggestionStats(userId) {
        const stats = await this.prisma.aIUsageLog.aggregate({
            where: {
                userId,
                functionType: 'suggestion_generation',
            },
            _count: { id: true },
            _avg: { responseTime: true },
        });
        return {
            totalSuggestions: stats._count.id || 0,
            averageResponseTime: stats._avg.responseTime || 0,
        };
    }
    generateBasicSuggestions(content, analysis) {
        const suggestions = [];
        const wordCount = this.calculateWordCount(content);
        if (wordCount < 50) {
            suggestions.push(this.createSuggestion({
                id: 'word_count_low',
                type: suggestion_dto_1.SuggestionType.BASIC,
                priority: suggestion_dto_1.SuggestionPriority.MEDIUM,
                title: '增加内容',
                content: '内容较少，可以增加更多细节描述、人物对话或环境描写',
                icon: '📝',
                actionable: true,
                actions: [
                    { text: '添加描述', action: 'add_description' },
                    { text: '扩展对话', action: 'expand_dialogue' }
                ]
            }));
        }
        if (analysis.readability < 60) {
            suggestions.push(this.createSuggestion({
                id: 'readability_improve',
                type: suggestion_dto_1.SuggestionType.BASIC,
                priority: suggestion_dto_1.SuggestionPriority.HIGH,
                title: '提高可读性',
                content: '文章较难阅读，建议简化句子结构，使用更常见的词汇',
                icon: '👁️',
                actionable: true,
                actions: [
                    { text: '简化句子', action: 'simplify_sentence' },
                    { text: '替换词汇', action: 'replace_complex_words' }
                ]
            }));
        }
        return suggestions;
    }
    generateQualitySuggestions(analysis) {
        const suggestions = [];
        if (analysis.score < 60) {
            suggestions.push(this.createSuggestion({
                id: 'quality_overall',
                type: suggestion_dto_1.SuggestionType.QUALITY,
                priority: suggestion_dto_1.SuggestionPriority.HIGH,
                title: '整体质量提升',
                content: '文章质量有提升空间，建议关注语言表达和逻辑结构',
                icon: '⭐',
                actionable: true,
                actions: [
                    { text: '语言润色', action: 'polish_language' },
                    { text: '结构调整', action: 'adjust_structure' }
                ]
            }));
        }
        return suggestions;
    }
    generateStyleSuggestions(content) {
        const suggestions = [];
        const hasDialogue = /["'""''「」『』]/.test(content);
        if (!hasDialogue && content.length > 200) {
            suggestions.push(this.createSuggestion({
                id: 'add_dialogue',
                type: suggestion_dto_1.SuggestionType.STYLE,
                priority: suggestion_dto_1.SuggestionPriority.MEDIUM,
                title: '增加对话',
                content: '文章缺少对话，适当的对话可以增强故事的生动性',
                icon: '💬',
                actionable: true,
                actions: [
                    { text: '插入对话', action: 'add_dialogue' }
                ]
            }));
        }
        return suggestions;
    }
    generateOptimizationSuggestions(content) {
        const suggestions = [];
        const issues = this.detectCommonIssues(content);
        issues.forEach(issue => {
            suggestions.push(this.createSuggestion({
                id: `optimize_${issue.type}`,
                type: suggestion_dto_1.SuggestionType.OPTIMIZATION,
                priority: issue.severity,
                title: issue.title,
                content: issue.description,
                icon: '🔧',
                actionable: true,
                actions: issue.actions || []
            }));
        });
        return suggestions;
    }
    getWelcomeSuggestions() {
        return {
            suggestions: [
                this.createSuggestion({
                    id: 'welcome_start',
                    type: suggestion_dto_1.SuggestionType.BASIC,
                    priority: suggestion_dto_1.SuggestionPriority.MEDIUM,
                    title: '开始写作',
                    content: '开始输入您的文章内容，我将实时为您提供写作建议',
                    icon: '🚀',
                    actionable: false
                })
            ],
            analysis: { wordCount: 0, readability: 0, complexity: 0 },
            context: {}
        };
    }
    createSuggestion(options) {
        return {
            id: options.id,
            type: options.type,
            priority: options.priority,
            title: options.title,
            content: options.content,
            icon: options.icon || '💡',
            actionable: options.actionable || false,
            actions: options.actions || [],
            timestamp: Date.now(),
            applied: false
        };
    }
    rankAndFilterSuggestions(suggestions, options = {}) {
        const { maxCount = 8, requestedTypes } = options;
        let filtered = suggestions;
        if (requestedTypes && requestedTypes.length > 0) {
            filtered = filtered.filter(s => requestedTypes.includes(s.type));
        }
        const priority = { [suggestion_dto_1.SuggestionPriority.HIGH]: 3, [suggestion_dto_1.SuggestionPriority.MEDIUM]: 2, [suggestion_dto_1.SuggestionPriority.LOW]: 1 };
        filtered.sort((a, b) => {
            const priorityDiff = priority[b.priority] - priority[a.priority];
            if (priorityDiff !== 0)
                return priorityDiff;
            if (a.actionable && !b.actionable)
                return -1;
            if (!a.actionable && b.actionable)
                return 1;
            return 0;
        });
        return filtered.slice(0, maxCount);
    }
    async performBasicTextAnalysis(content) {
        const wordCount = this.calculateWordCount(content);
        const sentences = content.split(/[。！？.!?]/).filter(s => s.trim().length > 0);
        return {
            wordCount,
            sentenceCount: sentences.length,
            readability: this.calculateReadability(content),
            complexity: this.calculateComplexity(content),
            score: this.calculateOverallScore(content)
        };
    }
    async performDetailedAnalysis(content, options = {}) {
        const basicAnalysis = await this.performBasicTextAnalysis(content);
        return {
            ...basicAnalysis,
            readability: {
                score: basicAnalysis.readability,
                level: basicAnalysis.readability > 70 ? 'easy' : basicAnalysis.readability > 40 ? 'medium' : 'hard'
            },
            style: {
                consistency: this.calculateStyleConsistency(content),
                tone: this.detectTone(content)
            },
            emotion: {
                intensity: this.calculateEmotionIntensity(content),
                dominant: this.detectDominantEmotion(content)
            },
            coherence: {
                score: this.calculateCoherence(content)
            },
            issues: this.detectCommonIssues(content),
            suggestions: this.generateImprovementSuggestions(content)
        };
    }
    calculateWordCount(content) {
        if (!content)
            return 0;
        const cleanContent = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        const chineseChars = (cleanContent.match(/[\u4e00-\u9fff]/g) || []).length;
        const englishWords = (cleanContent.match(/[a-zA-Z]+/g) || []).length;
        return chineseChars + englishWords;
    }
    calculateReadability(content) {
        const sentences = content.split(/[。！？.!?]/).filter(s => s.trim().length > 0);
        const avgSentenceLength = this.calculateWordCount(content) / Math.max(sentences.length, 1);
        return Math.max(0, 100 - avgSentenceLength * 2);
    }
    calculateComplexity(content) {
        const complexWords = (content.match(/[\u4e00-\u9fff]{4,}/g) || []).length;
        const totalWords = this.calculateWordCount(content);
        return Math.min(100, (complexWords / Math.max(totalWords, 1)) * 100);
    }
    calculateOverallScore(content) {
        const readability = this.calculateReadability(content);
        const complexity = this.calculateComplexity(content);
        return Math.round((readability * 0.6 + (100 - complexity) * 0.4));
    }
    calculateStyleConsistency(content) {
        return Math.floor(Math.random() * 30) + 70;
    }
    detectTone(content) {
        const tones = ['neutral', 'positive', 'negative', 'formal', 'casual'];
        return tones[Math.floor(Math.random() * tones.length)];
    }
    calculateEmotionIntensity(content) {
        const emotionWords = content.match(/[激动|高兴|悲伤|愤怒|恐惧|惊讶]/g) || [];
        return Math.min(100, emotionWords.length * 10);
    }
    detectDominantEmotion(content) {
        const emotions = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'neutral'];
        return emotions[Math.floor(Math.random() * emotions.length)];
    }
    calculateCoherence(content) {
        return Math.floor(Math.random() * 30) + 65;
    }
    detectCommonIssues(content) {
        const issues = [];
        const words = content.match(/[\u4e00-\u9fa5]{2,}/g) || [];
        const wordCount = {};
        words.forEach(word => {
            wordCount[word] = (wordCount[word] || 0) + 1;
        });
        const repeatedWords = Object.entries(wordCount)
            .filter(([word, count]) => count > 3 && word.length > 2)
            .map(([word]) => word);
        if (repeatedWords.length > 0) {
            issues.push({
                type: 'repetition',
                severity: suggestion_dto_1.SuggestionPriority.MEDIUM,
                title: '词汇重复',
                description: `检测到重复使用的词汇：${repeatedWords.slice(0, 3).join('、')}`,
                actions: [
                    { text: '查看重复词', action: 'show_repeated_words' },
                    { text: '同义词替换', action: 'replace_synonyms' }
                ]
            });
        }
        return issues;
    }
    generateImprovementSuggestions(content) {
        return [
            '增加更多细节描写',
            '优化句子结构',
            '加强逻辑连接',
            '丰富词汇表达'
        ];
    }
    processApplySuggestion(content, action, options) {
        const actionHandlers = {
            add_description: () => content + '\n\n[建议：在此处添加环境或人物描写]',
            simplify_sentence: () => content.replace(/，(?=[^，]{20,})/g, '。'),
            add_dialogue: () => content + '\n\n[建议：在此处添加对话内容]',
            polish_language: () => `[AI润色建议]\n${content}\n[建议：使用AI工具进一步润色]`,
        };
        const handler = actionHandlers[action];
        if (handler) {
            return {
                content: handler(),
                message: `已应用建议：${action}`,
                success: true
            };
        }
        return {
            content,
            message: '未知的建议动作',
            success: false
        };
    }
    async logSuggestionGeneration(userId, inputLength, suggestionsCount) {
        try {
            await this.prisma.aIUsageLog.create({
                data: {
                    userId,
                    model: 'suggestion-engine',
                    functionType: 'suggestion_generation',
                    inputTokens: Math.ceil(inputLength / 4),
                    outputTokens: suggestionsCount * 10,
                    success: true,
                },
            });
        }
        catch (error) {
            console.error('Log suggestion generation error:', error);
        }
    }
    async logTextAnalysis(userId, inputLength) {
        try {
            await this.prisma.aIUsageLog.create({
                data: {
                    userId,
                    model: 'text-analyzer',
                    functionType: 'text_analysis',
                    inputTokens: Math.ceil(inputLength / 4),
                    outputTokens: 50,
                    success: true,
                },
            });
        }
        catch (error) {
            console.error('Log text analysis error:', error);
        }
    }
    async recordUserInteraction(userId, suggestionId, action, applied) {
        try {
            await this.prisma.userActivity.create({
                data: {
                    userId,
                    action: 'suggestion_applied',
                    targetType: 'suggestion',
                    targetId: suggestionId,
                    details: {
                        suggestionId,
                        action,
                        applied,
                        timestamp: new Date().toISOString()
                    }
                },
            });
        }
        catch (error) {
            console.error('Record user interaction error:', error);
        }
    }
};
exports.SuggestionService = SuggestionService;
exports.SuggestionService = SuggestionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], SuggestionService);


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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApplySuggestionDto = exports.AnalyzeTextDto = exports.GenerateSuggestionsDto = exports.SuggestionPriority = exports.SuggestionType = void 0;
const class_validator_1 = __webpack_require__(16);
var SuggestionType;
(function (SuggestionType) {
    SuggestionType["BASIC"] = "basic";
    SuggestionType["QUALITY"] = "quality";
    SuggestionType["STYLE"] = "style";
    SuggestionType["PERSONAL"] = "personal";
    SuggestionType["OPTIMIZATION"] = "optimization";
    SuggestionType["STRUCTURE"] = "structure";
    SuggestionType["LANGUAGE"] = "language";
    SuggestionType["PLOT"] = "plot";
    SuggestionType["CHARACTER"] = "character";
    SuggestionType["DIALOGUE"] = "dialogue";
})(SuggestionType || (exports.SuggestionType = SuggestionType = {}));
var SuggestionPriority;
(function (SuggestionPriority) {
    SuggestionPriority["HIGH"] = "high";
    SuggestionPriority["MEDIUM"] = "medium";
    SuggestionPriority["LOW"] = "low";
})(SuggestionPriority || (exports.SuggestionPriority = SuggestionPriority = {}));
class GenerateSuggestionsDto {
    constructor() {
        this.maxSuggestions = 8;
    }
}
exports.GenerateSuggestionsDto = GenerateSuggestionsDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateSuggestionsDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateSuggestionsDto.prototype, "novelId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], GenerateSuggestionsDto.prototype, "context", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(SuggestionType, { each: true }),
    __metadata("design:type", Array)
], GenerateSuggestionsDto.prototype, "suggestionTypes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(20),
    __metadata("design:type", Number)
], GenerateSuggestionsDto.prototype, "maxSuggestions", void 0);
class AnalyzeTextDto {
}
exports.AnalyzeTextDto = AnalyzeTextDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnalyzeTextDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnalyzeTextDto.prototype, "novelId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], AnalyzeTextDto.prototype, "options", void 0);
class ApplySuggestionDto {
}
exports.ApplySuggestionDto = ApplySuggestionDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApplySuggestionDto.prototype, "suggestionId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApplySuggestionDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApplySuggestionDto.prototype, "action", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ApplySuggestionDto.prototype, "options", void 0);


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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SuggestionController = void 0;
const common_1 = __webpack_require__(2);
const swagger_1 = __webpack_require__(3);
const common_2 = __webpack_require__(28);
const suggestion_service_1 = __webpack_require__(52);
const suggestion_dto_1 = __webpack_require__(53);
let SuggestionController = class SuggestionController {
    constructor(suggestionService) {
        this.suggestionService = suggestionService;
    }
    async generateSuggestions(req, dto) {
        return this.suggestionService.generateRealtimeSuggestions(req.user.id, dto);
    }
    async analyzeText(req, dto) {
        return this.suggestionService.analyzeText(req.user.id, dto);
    }
    async applySuggestion(req, dto) {
        return this.suggestionService.applySuggestion(req.user.id, dto);
    }
    async getStats(req) {
        return this.suggestionService.getSuggestionStats(req.user.id);
    }
};
exports.SuggestionController = SuggestionController;
__decorate([
    (0, common_1.Post)('suggestions/generate'),
    (0, common_2.RequireFeature)('aiWriting'),
    (0, common_2.RequireQuota)('daily'),
    (0, swagger_1.ApiOperation)({ summary: '生成写作建议' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '建议生成成功' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '无权限或配额不足' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_b = typeof suggestion_dto_1.GenerateSuggestionsDto !== "undefined" && suggestion_dto_1.GenerateSuggestionsDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], SuggestionController.prototype, "generateSuggestions", null);
__decorate([
    (0, common_1.Post)('suggestions/analyze'),
    (0, common_2.RequireFeature)('aiWriting'),
    (0, swagger_1.ApiOperation)({ summary: '分析文本' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '分析成功' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '无权限或配额不足' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_c = typeof suggestion_dto_1.AnalyzeTextDto !== "undefined" && suggestion_dto_1.AnalyzeTextDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], SuggestionController.prototype, "analyzeText", null);
__decorate([
    (0, common_1.Post)('suggestions/apply'),
    (0, swagger_1.ApiOperation)({ summary: '应用建议' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '应用成功' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_d = typeof suggestion_dto_1.ApplySuggestionDto !== "undefined" && suggestion_dto_1.ApplySuggestionDto) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], SuggestionController.prototype, "applySuggestion", null);
__decorate([
    (0, common_1.Get)('suggestions/stats'),
    (0, swagger_1.ApiOperation)({ summary: '获取建议统计' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SuggestionController.prototype, "getStats", null);
exports.SuggestionController = SuggestionController = __decorate([
    (0, swagger_1.ApiTags)('写作建议'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard, common_2.PackageFeatureGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof suggestion_service_1.SuggestionService !== "undefined" && suggestion_service_1.SuggestionService) === "function" ? _a : Object])
], SuggestionController);


/***/ }),
/* 55 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WizardModule = void 0;
const common_1 = __webpack_require__(2);
let WizardModule = class WizardModule {
};
exports.WizardModule = WizardModule;
exports.WizardModule = WizardModule = __decorate([
    (0, common_1.Module)({})
], WizardModule);


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
exports.HealthModule = void 0;
const common_1 = __webpack_require__(2);
const health_controller_1 = __webpack_require__(57);
const health_service_1 = __webpack_require__(58);
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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HealthController = void 0;
const common_1 = __webpack_require__(2);
const health_service_1 = __webpack_require__(58);
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
/* 58 */
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
            service: 'ai-service',
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
/* 59 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VideoGenerationModule = void 0;
const common_1 = __webpack_require__(2);
const bull_1 = __webpack_require__(60);
const database_1 = __webpack_require__(9);
const jwt_1 = __webpack_require__(6);
const passport_1 = __webpack_require__(7);
const video_generation_controller_1 = __webpack_require__(61);
const batch_video_generation_controller_1 = __webpack_require__(75);
const video_generation_service_1 = __webpack_require__(62);
const storyboard_agent_service_1 = __webpack_require__(63);
const image_generation_agent_service_1 = __webpack_require__(64);
const video_generation_agent_service_1 = __webpack_require__(65);
const batch_video_generation_service_1 = __webpack_require__(76);
const video_duration_calculator_service_1 = __webpack_require__(78);
const long_video_merger_service_1 = __webpack_require__(79);
const volcengine_visual_provider_1 = __webpack_require__(66);
const jimeng_video_provider_1 = __webpack_require__(69);
const kling_video_provider_1 = __webpack_require__(70);
const ffmpeg_service_1 = __webpack_require__(71);
const ai_caller_service_1 = __webpack_require__(17);
const video_generation_queue_1 = __webpack_require__(81);
const video_generation_processor_1 = __webpack_require__(82);
const microservices_1 = __webpack_require__(8);
const common_2 = __webpack_require__(28);
let VideoGenerationModule = class VideoGenerationModule {
};
exports.VideoGenerationModule = VideoGenerationModule;
exports.VideoGenerationModule = VideoGenerationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            database_1.DatabaseModule,
            passport_1.PassportModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'your-secret-key',
                signOptions: { expiresIn: '7d' },
            }),
            bull_1.BullModule.registerQueue({
                name: 'video-generation',
                redis: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT || '6379'),
                    password: process.env.REDIS_PASSWORD || undefined,
                },
                defaultJobOptions: {
                    removeOnComplete: 100,
                    removeOnFail: 50,
                },
            }),
            microservices_1.ClientsModule.register([
                {
                    name: 'USER_SERVICE',
                    transport: microservices_1.Transport.TCP,
                    options: {
                        host: process.env.USER_SERVICE_HOST || 'localhost',
                        port: parseInt(process.env.USER_SERVICE_PORT || '3001'),
                    },
                },
            ]),
        ],
        controllers: [
            video_generation_controller_1.VideoGenerationController,
            batch_video_generation_controller_1.BatchVideoGenerationController,
        ],
        providers: [
            video_generation_service_1.VideoGenerationService,
            video_generation_queue_1.VideoGenerationQueue,
            video_generation_processor_1.VideoGenerationProcessor,
            storyboard_agent_service_1.StoryboardAgentService,
            image_generation_agent_service_1.ImageGenerationAgentService,
            video_generation_agent_service_1.VideoGenerationAgentService,
            batch_video_generation_service_1.BatchVideoGenerationService,
            video_duration_calculator_service_1.VideoDurationCalculatorService,
            long_video_merger_service_1.LongVideoMergerService,
            volcengine_visual_provider_1.VolcengineVisualProvider,
            jimeng_video_provider_1.JimengVideoProvider,
            kling_video_provider_1.KlingVideoProvider,
            ffmpeg_service_1.FFmpegService,
            ai_caller_service_1.AICallerService,
            common_2.FeatureQuotaService,
        ],
        exports: [
            video_generation_service_1.VideoGenerationService,
            video_generation_queue_1.VideoGenerationQueue,
            batch_video_generation_service_1.BatchVideoGenerationService,
            long_video_merger_service_1.LongVideoMergerService,
        ],
    })
], VideoGenerationModule);


/***/ }),
/* 60 */
/***/ ((module) => {

module.exports = require("@nestjs/bull");

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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VideoGenerationController = void 0;
const common_1 = __webpack_require__(2);
const swagger_1 = __webpack_require__(3);
const common_2 = __webpack_require__(28);
const video_generation_service_1 = __webpack_require__(62);
const video_generation_dto_1 = __webpack_require__(74);
let VideoGenerationController = class VideoGenerationController {
    constructor(videoGenerationService) {
        this.videoGenerationService = videoGenerationService;
    }
    async generateVideo(req, dto) {
        const userId = req.user.userId || req.user.id;
        return this.videoGenerationService.generateChapterVideo(userId, dto);
    }
    async getPermissions(req) {
        const userId = req.user.userId || req.user.id;
        const subscription = await this.videoGenerationService['prisma'].subscription.findUnique({
            where: { userId },
            include: { package: true },
        });
        if (!subscription || subscription.status !== 'ACTIVE') {
            return {
                allowed: false,
                limits: {
                    dailyQuota: 0,
                    monthlyQuota: 0,
                    maxSceneCount: 0,
                    allowedQualities: [],
                    allowedResolutions: [],
                    enableAdvancedParams: false
                },
                message: '请订阅套餐以使用视频生成功能'
            };
        }
        const features = subscription.package.features;
        const videoFeatures = features?.videoGeneration;
        if (!videoFeatures || !videoFeatures.enabled) {
            return {
                allowed: false,
                limits: {},
                message: '当前套餐不包含视频生成功能'
            };
        }
        return {
            allowed: true,
            limits: videoFeatures,
            packageName: subscription.package.name
        };
    }
    async getStatus(chapterId) {
        return this.videoGenerationService.getVideoGenerationStatus(chapterId);
    }
};
exports.VideoGenerationController = VideoGenerationController;
__decorate([
    (0, common_1.Post)('generate'),
    (0, common_2.RequireFeature)('videoGeneration'),
    (0, common_2.RequireQuota)('daily'),
    (0, swagger_1.ApiOperation)({ summary: '生成章节视频' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '视频生成任务已提交', type: video_generation_dto_1.VideoGenerationStatusDto }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '无权限或配额不足' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '章节不存在' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_b = typeof video_generation_dto_1.GenerateVideoDto !== "undefined" && video_generation_dto_1.GenerateVideoDto) === "function" ? _b : Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], VideoGenerationController.prototype, "generateVideo", null);
__decorate([
    (0, common_1.Get)('permissions'),
    (0, swagger_1.ApiOperation)({ summary: '获取当前用户的视频生成权限' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回权限信息' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VideoGenerationController.prototype, "getPermissions", null);
__decorate([
    (0, common_1.Get)('status/:chapterId'),
    (0, swagger_1.ApiOperation)({ summary: '查询视频生成状态' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回生成状态', type: video_generation_dto_1.VideoGenerationStatusDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '章节不存在' }),
    __param(0, (0, common_1.Param)('chapterId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], VideoGenerationController.prototype, "getStatus", null);
exports.VideoGenerationController = VideoGenerationController = __decorate([
    (0, swagger_1.ApiTags)('视频生成'),
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard, common_2.PackageFeatureGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [typeof (_a = typeof video_generation_service_1.VideoGenerationService !== "undefined" && video_generation_service_1.VideoGenerationService) === "function" ? _a : Object])
], VideoGenerationController);


/***/ }),
/* 62 */
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
var VideoGenerationService_1;
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VideoGenerationService = void 0;
const common_1 = __webpack_require__(2);
const database_1 = __webpack_require__(9);
const storyboard_agent_service_1 = __webpack_require__(63);
const image_generation_agent_service_1 = __webpack_require__(64);
const video_generation_agent_service_1 = __webpack_require__(65);
const volcengine_visual_provider_1 = __webpack_require__(66);
const jimeng_video_provider_1 = __webpack_require__(69);
const kling_video_provider_1 = __webpack_require__(70);
const ffmpeg_service_1 = __webpack_require__(71);
const path = __webpack_require__(68);
const fs = __webpack_require__(67);
let VideoGenerationService = VideoGenerationService_1 = class VideoGenerationService {
    constructor(prisma, storyboardAgent, imageAgent, videoAgent, volcengineProvider, jimengProvider, klingProvider, ffmpegService) {
        this.prisma = prisma;
        this.storyboardAgent = storyboardAgent;
        this.imageAgent = imageAgent;
        this.videoAgent = videoAgent;
        this.volcengineProvider = volcengineProvider;
        this.jimengProvider = jimengProvider;
        this.klingProvider = klingProvider;
        this.ffmpegService = ffmpegService;
        this.logger = new common_1.Logger(VideoGenerationService_1.name);
        this.videoStoragePath = process.env.VIDEO_STORAGE_PATH || '/data/videos';
        this.videoProvider = process.env.VIDEO_PROVIDER || 'jimeng';
        if (!fs.existsSync(this.videoStoragePath)) {
            fs.mkdirSync(this.videoStoragePath, { recursive: true });
        }
    }
    async generateChapterVideo(userId, dto) {
        this.logger.log(`开始生成章节视频，章节ID: ${dto.chapterId}`);
        const chapter = await this.prisma.chapter.findFirst({
            where: { id: dto.chapterId },
            include: {
                novel: {
                    select: {
                        id: true,
                        userId: true,
                        title: true,
                    },
                },
            },
        });
        if (!chapter) {
            throw new common_1.NotFoundException('章节不存在');
        }
        if (chapter.novel.userId !== userId) {
            throw new common_1.NotFoundException('无权访问该章节');
        }
        if (!dto.forceRegenerate && chapter.videoStatus === 'COMPLETED' && chapter.videoUrl) {
            return {
                chapterId: dto.chapterId,
                status: 'COMPLETED',
                stage: 'COMPLETED',
                progress: 100,
                videoUrl: chapter.videoUrl,
            };
        }
        await this.prisma.chapter.update({
            where: { id: dto.chapterId },
            data: {
                videoStatus: 'GENERATING',
                storyboardScript: null,
                generatedImages: null,
                videoUrl: null,
            },
        });
        const log = await this.prisma.videoGenerationLog.create({
            data: {
                chapterId: dto.chapterId,
                stage: 'SCRIPT',
                status: 'PROCESSING',
                startedAt: new Date(),
                progress: 0,
            },
        });
        this.executeGenerationPipeline(chapter, dto, log.id).catch(error => {
            this.logger.error(`视频生成失败: ${error.message}`, error.stack);
        });
        return {
            chapterId: dto.chapterId,
            status: 'GENERATING',
            stage: 'SCRIPT',
            progress: 0,
            startedAt: new Date(),
        };
    }
    async executeGenerationPipeline(chapter, dto, logId) {
        const startTime = Date.now();
        try {
            this.logger.log(`[阶段1] 开始生成分镜脚本`);
            await this.updateLog(logId, 'SCRIPT', 'PROCESSING', 10);
            const consistencyProfile = await this.getConsistencyProfile(chapter.novel.id);
            const storyboard = await this.storyboardAgent.generateStoryboard(chapter.id, consistencyProfile, {
                sceneCount: dto.sceneCount || 5,
                totalDuration: dto.videoDuration || 15,
            });
            await this.prisma.chapter.update({
                where: { id: chapter.id },
                data: { storyboardScript: storyboard },
            });
            await this.updateLog(logId, 'SCRIPT', 'COMPLETED', 20, {
                sceneCount: storyboard.scenes.length,
            });
            this.logger.log(`[阶段2] 开始生成图片`);
            await this.updateLog(logId, 'IMAGE', 'PROCESSING', 30);
            const imagePrompts = await this.imageAgent.generateImagePromptBatch(storyboard.scenes, consistencyProfile, chapter.chapterNumber);
            const imageUrls = [];
            for (let i = 0; i < imagePrompts.length; i++) {
                const prompt = imagePrompts[i];
                const result = await this.volcengineProvider.generateImage({
                    prompt: prompt.positivePrompt,
                    negativePrompt: prompt.negativePrompt,
                    width: 1024,
                    height: 576,
                    seed: prompt.seed,
                    referenceImage: prompt.referenceImageUrl,
                });
                if (result.success && result.images.length > 0) {
                    const imagePath = path.join(this.videoStoragePath, `${chapter.id}-scene-${i + 1}.png`);
                    await this.volcengineProvider.downloadImage(result.images[0], imagePath);
                    imageUrls.push(imagePath);
                }
                else {
                    throw new Error(`场景${i + 1}图片生成失败: ${result.error}`);
                }
                const progress = 30 + Math.floor((i + 1) / imagePrompts.length * 30);
                await this.updateLog(logId, 'IMAGE', 'PROCESSING', progress);
            }
            await this.prisma.chapter.update({
                where: { id: chapter.id },
                data: { generatedImages: imageUrls },
            });
            await this.updateLog(logId, 'IMAGE', 'COMPLETED', 60, {
                imageCount: imageUrls.length,
            });
            this.logger.log(`[阶段3] 开始生成视频`);
            await this.updateLog(logId, 'VIDEO', 'PROCESSING', 65);
            const videoPrompts = await this.videoAgent.generateVideoPromptBatch(storyboard.scenes, imageUrls, consistencyProfile);
            const videoUrls = [];
            const videoProvider = this.videoProvider === 'jimeng'
                ? this.jimengProvider
                : this.klingProvider;
            for (let i = 0; i < videoPrompts.length; i++) {
                const prompt = videoPrompts[i];
                const submitResult = await videoProvider.submitVideoTask({
                    imageUrl: imageUrls[i],
                    motionPrompt: prompt.motionPrompt,
                    duration: prompt.duration,
                    motionIntensity: prompt.motionIntensity,
                    fps: 24,
                    characterId: prompt.characterConsistencyId,
                });
                if (!submitResult.success || !submitResult.taskId) {
                    throw new Error(`场景${i + 1}视频任务提交失败`);
                }
                const videoResult = await videoProvider.waitForTaskCompletion(submitResult.taskId, 600000);
                if (!videoResult.success || !videoResult.videoUrl) {
                    throw new Error(`场景${i + 1}视频生成失败`);
                }
                const videoPath = path.join(this.videoStoragePath, `${chapter.id}-scene-${i + 1}.mp4`);
                await videoProvider.downloadVideo(videoResult.videoUrl, videoPath);
                videoUrls.push(videoPath);
                const progress = 65 + Math.floor((i + 1) / videoPrompts.length * 20);
                await this.updateLog(logId, 'VIDEO', 'PROCESSING', progress);
            }
            await this.updateLog(logId, 'VIDEO', 'COMPLETED', 85, {
                videoCount: videoUrls.length,
            });
            this.logger.log(`[阶段4] 开始合成视频`);
            await this.updateLog(logId, 'MERGE', 'PROCESSING', 90);
            const finalVideoPath = path.join(this.videoStoragePath, `${chapter.id}-final.mp4`);
            await this.ffmpegService.mergeVideosWithTransitions(videoUrls, finalVideoPath, 0.3);
            const withTitlePath = path.join(this.videoStoragePath, `${chapter.id}-with-title.mp4`);
            await this.ffmpegService.addTitleFrame(finalVideoPath, `第${chapter.chapterNumber}章 ${chapter.title}`, 2, withTitlePath);
            const compressedPath = path.join(this.videoStoragePath, `${chapter.id}-compressed.mp4`);
            await this.ffmpegService.compressVideo(withTitlePath, compressedPath, 'medium');
            const metadata = await this.ffmpegService.getVideoMetadata(compressedPath);
            await this.updateLog(logId, 'MERGE', 'COMPLETED', 95);
            this.logger.log(`[阶段5] 上传视频`);
            await this.updateLog(logId, 'UPLOAD', 'PROCESSING', 97);
            const videoUrl = this.getVideoUrl(compressedPath);
            await this.prisma.chapter.update({
                where: { id: chapter.id },
                data: {
                    videoStatus: 'COMPLETED',
                    videoUrl: videoUrl,
                    videoMetadata: metadata,
                },
            });
            const duration = (Date.now() - startTime) / 1000;
            await this.updateLog(logId, 'COMPLETED', 'COMPLETED', 100, {
                finalVideoUrl: videoUrl,
                totalDuration: duration,
            });
            this.logger.log(`视频生成完成，总耗时: ${duration}秒`);
            this.cleanupTempFiles([...imageUrls, ...videoUrls, finalVideoPath, withTitlePath]);
        }
        catch (error) {
            this.logger.error(`视频生成失败: ${error.message}`, error.stack);
            await this.prisma.chapter.update({
                where: { id: chapter.id },
                data: {
                    videoStatus: 'FAILED',
                    videoGenerationLog: error.message,
                },
            });
            await this.updateLog(logId, 'COMPLETED', 'FAILED', 0, null, error.message);
        }
    }
    async getVideoGenerationStatus(chapterId) {
        const chapter = await this.prisma.chapter.findUnique({
            where: { id: chapterId },
        });
        if (!chapter) {
            throw new common_1.NotFoundException('章节不存在');
        }
        const log = await this.prisma.videoGenerationLog.findFirst({
            where: { chapterId },
            orderBy: { createdAt: 'desc' },
        });
        return {
            chapterId,
            status: chapter.videoStatus || 'PENDING',
            stage: log?.stage || 'SCRIPT',
            progress: log?.progress || 0,
            videoUrl: chapter.videoUrl || undefined,
            errorMessage: log?.errorMessage || undefined,
            startedAt: log?.startedAt || undefined,
            completedAt: log?.completedAt || undefined,
            generatedImages: chapter.generatedImages || undefined,
        };
    }
    async getConsistencyProfile(novelId) {
        const profile = await this.prisma.consistencyProfile.findUnique({
            where: { novelId },
        });
        if (!profile) {
            return await this.createDefaultConsistencyProfile(novelId);
        }
        return {
            characters: profile.characters,
            environments: profile.environments,
            objects: profile.objects,
            visualStyle: profile.visualStyle,
        };
    }
    async createDefaultConsistencyProfile(novelId) {
        const defaultProfile = {
            characters: {},
            environments: {},
            objects: {},
            visualStyle: {
                overall: 'realistic',
                colorTone: 'natural',
                artStyle: 'cinematic',
                lighting: 'natural',
            },
        };
        await this.prisma.consistencyProfile.create({
            data: {
                novelId,
                characters: defaultProfile.characters,
                environments: defaultProfile.environments,
                objects: defaultProfile.objects,
                visualStyle: defaultProfile.visualStyle,
            },
        });
        return defaultProfile;
    }
    async updateLog(logId, stage, status, progress, details, errorMessage) {
        const updateData = {
            stage,
            status,
            progress,
            updatedAt: new Date(),
        };
        if (details) {
            updateData.details = details;
        }
        if (errorMessage) {
            updateData.errorMessage = errorMessage;
        }
        if (status === 'COMPLETED') {
            updateData.completedAt = new Date();
            const log = await this.prisma.videoGenerationLog.findUnique({
                where: { id: logId },
            });
            if (log?.startedAt) {
                updateData.duration = Math.floor((Date.now() - log.startedAt.getTime()) / 1000);
            }
        }
        await this.prisma.videoGenerationLog.update({
            where: { id: logId },
            data: updateData,
        });
    }
    getVideoUrl(localPath) {
        const cdnUrl = process.env.VIDEO_CDN_URL || 'http://localhost:3000/videos';
        const filename = path.basename(localPath);
        return `${cdnUrl}/${filename}`;
    }
    cleanupTempFiles(files) {
        files.forEach(file => {
            try {
                if (fs.existsSync(file)) {
                    fs.unlinkSync(file);
                    this.logger.debug(`已删除临时文件: ${file}`);
                }
            }
            catch (error) {
                this.logger.warn(`删除临时文件失败: ${file}`, error.message);
            }
        });
    }
};
exports.VideoGenerationService = VideoGenerationService;
exports.VideoGenerationService = VideoGenerationService = VideoGenerationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof storyboard_agent_service_1.StoryboardAgentService !== "undefined" && storyboard_agent_service_1.StoryboardAgentService) === "function" ? _b : Object, typeof (_c = typeof image_generation_agent_service_1.ImageGenerationAgentService !== "undefined" && image_generation_agent_service_1.ImageGenerationAgentService) === "function" ? _c : Object, typeof (_d = typeof video_generation_agent_service_1.VideoGenerationAgentService !== "undefined" && video_generation_agent_service_1.VideoGenerationAgentService) === "function" ? _d : Object, typeof (_e = typeof volcengine_visual_provider_1.VolcengineVisualProvider !== "undefined" && volcengine_visual_provider_1.VolcengineVisualProvider) === "function" ? _e : Object, typeof (_f = typeof jimeng_video_provider_1.JimengVideoProvider !== "undefined" && jimeng_video_provider_1.JimengVideoProvider) === "function" ? _f : Object, typeof (_g = typeof kling_video_provider_1.KlingVideoProvider !== "undefined" && kling_video_provider_1.KlingVideoProvider) === "function" ? _g : Object, typeof (_h = typeof ffmpeg_service_1.FFmpegService !== "undefined" && ffmpeg_service_1.FFmpegService) === "function" ? _h : Object])
], VideoGenerationService);


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
var StoryboardAgentService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StoryboardAgentService = void 0;
const common_1 = __webpack_require__(2);
const database_1 = __webpack_require__(9);
const ai_caller_service_1 = __webpack_require__(17);
let StoryboardAgentService = StoryboardAgentService_1 = class StoryboardAgentService {
    constructor(prisma, aiCaller) {
        this.prisma = prisma;
        this.aiCaller = aiCaller;
        this.logger = new common_1.Logger(StoryboardAgentService_1.name);
    }
    async generateStoryboard(chapterId, consistencyProfile, options = {}) {
        this.logger.log(`开始生成分镜脚本，章节ID: ${chapterId}`);
        const chapter = await this.prisma.chapter.findUnique({
            where: { id: chapterId },
            include: {
                novel: {
                    select: {
                        id: true,
                        userId: true,
                        title: true,
                        genre: true,
                        settings: true,
                    },
                },
            },
        });
        if (!chapter) {
            throw new Error('章节不存在');
        }
        const agentConfig = await this.getAgentConfig('SCRIPT_GENERATOR');
        const systemPrompt = this.buildSystemPrompt(agentConfig);
        const userPrompt = this.buildUserPrompt(chapter, consistencyProfile, options);
        const response = await this.aiCaller.callAI({
            userId: chapter.novel.userId || 'system',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            parameters: {
                temperature: 0.7,
                maxTokens: 2000,
            },
        });
        const storyboard = this.parseStoryboardResponse(response.content, options);
        const optimizedStoryboard = await this.optimizeStoryboard(storyboard, consistencyProfile);
        this.logger.log(`分镜脚本生成完成，共${optimizedStoryboard.scenes.length}个场景`);
        return optimizedStoryboard;
    }
    buildSystemPrompt(agentConfig) {
        if (agentConfig && agentConfig.systemPrompt) {
            return agentConfig.systemPrompt;
        }
        return `# 角色
你是一名专业的短剧导演，具备丰富的视频创作经验和专业知识，能够精准理解用户输入，并将其转化为内容丰富的分镜、运镜、角色、配音旁白等，分镜的首帧图提示词将用于seedream生图模型，分镜的视频提示词将用于seedance生视频模型。

# 技能
## 技能 1: 理解剧本并规划分镜
1. 根据用户的剧本、人物角色信息、画面风格、提示词中的参考内容规划分镜。每集包含至少20个分镜，需要关注前后剧情的连贯性、人物的一致性。所有分镜输出内容不得超过2万字，达到2万字时结束输出。

## 技能 2: 生成视频的多个分镜提示词
1. 针对剧集内容拆分编写分镜内容：
- img_details：首帧图提示词
详细描述：景别（全景/中景/近景/特写）、时间、地点、场景环境描述、画面描述、物体和细节（如形状/颜色/大小/位置）、风格描述、角色站位位置/角色动作/角色表情/说话人的角色名称（不要旁白内容）。
将画面中的物体细节都描述清楚，重点关注**多个分镜见前后的内容和效果连贯性**，明确画面主体的位置和状态，不要用"这个""那个"等词指代。
内容60字以上。

- video_details: 视频动作提示词
详细描述：镜头运镜方式与镜头变化、角色站位/角色动作/角色表情/说话人的角色名称（说话人的嘴有动作）、场景环境的变化描述、画面变化描述、物体和细节变化描述、参考本分镜的首帧画面提示词进行风格描述、。
将画面中的物体细节的变化都描述清楚，重点**结合首帧图提示词进行画面动态过程的描述**，重点考虑**多个分镜见前后的内容和效果连贯性**，特别明确画面主体的具体位置和详细状态，不要用"这个""那个"等词指代。内容100字以上。

- scriptLine: 语音内容
信息包括：说话人角色名speaker（如用户要求第一人称解说则始终同一人读文案）、text口播文案、合适的角色音色voice_id、适当语速voice_speed、合理的说话情感emotion（emotion必须从音色库参考值或用户给到的范围中取，不可自己编造，无则为空）。
**每个分镜的说话内容约15至40字，无text口播则为"空镜"，无角色名时角色为"旁白"，旁白音色优先用户输入（默认：7468512265134932019），无emotion时则为空。**

- role_info: 角色信息
基于角色信息，补全role和role_image。

- ref_img: 参考图
默认为空数组，分镜剧本中提供图片链接则按格式补充。

3. 检查生成的提示词是否包含敏感信息，如有则进行调整：
- 反复检查提示词，识别其中可能存在的敏感信息，包括涉政、涉黄、与民政局等相关涉政实体、军区等内容、低俗、不良画面、谩骂、引人不适、宗教、极端服饰、赌博、领导人、烈士陵园等信息。
- 将识别出的敏感信息进行替换或调整，确保新生成的提示词不包含任何敏感信息，同时尽量保持原始提示词的核心内容和风格。
- 最终输出优化后提示词，不包含任何其他内容。
- 第一要务是去除敏感信息，第二要求才是保留原始内容。

# 参考内容库
## 可参考的风格词库
1. 风格词
绘本风格、古风插画、lo-fi插画、宫崎骏动漫、日漫风格、赛璐璐风格、儿童画、2D Cartoon、欧美动画、2D动画风格、国漫风格、中国风、Ancient China Illustration、新艺术派风、美漫风格、厚涂风格、半厚涂风格、奇幻风、奇幻风格、侘寂风、中式恐怖、日杂风、民国风、老钱风、森系、欧美杂志封面插画、拼贴风、小清新、Springtime Aesthetic、野性美、甜酷辣妹风、复古风、American retro style、波西米亚风、像素风、宫崎骏、京剧风格、乐高风格、Lowbrow art、丁丁历险记、flat style、轻酸性设计、扁平渐变风格、盲盒风格、Barbie style、港风、敦煌美学、Pastoral style、wasteland、老照片、国家地理风格、国画风格、水墨风、山水画、绢本画、工笔风格、花鸟画、版画、色粉画、后印象派、连环画、皮影、剪纸、极简主义、弥散风格、晕染风格、漆画风格

## 生图提示词参考库
1. 推文通用
2d漫画，细线条，厚涂，简洁，柔和的灯光，平面插画，动漫美感，数字技术技艺，
2. 新二次元
二次元，平面插画，光影质感，原神
3. 二次元漫画
阴郁，灰暗的氛围，Anime, vibrant colors, anime aesthetic, digital illustration, masterpiece,sfw,highres,delicate
4. 二次元经典
阴郁，灰暗的环境，Anime, vibrant colors, anime aesthetic, digital illustration, masterpiece,sfw,highres,delicate,
5. 国风漫画
中国古风二次元风格, 参考苏摩画风, 赛璐珞着色，厚涂漫画, 散点透视
6. 都市气质
Josei, (modern:1.4) (modern city:1.3), modern and fashionable, cool_theme, metropolis, sumptuous, mature, painting, 动漫风格，灵活的构图，成熟，
7. 现代都市
动漫，配图，厚涂，韩国网络漫画风格，数字技术技艺，简洁的笔触，
8. 2D古风
女性向漫画，小说配图，平面插画，简洁的笔触，古风，2d，
9. 仙侠古风
仙侠古风，古风动漫，数字插画，
10. 仙侠古风2
2d漫画，细线条，柔和的灯光，平面插画，动漫美感，数字技术技艺，游戏CG，影视级画面，高质感，仙侠古风，古风
11. 女频古风
古风，动漫，动漫美学，数字插画，光影质感
12. 水墨国风
2.5D,bloom,ink washing,watercolor,realistic,gentle,Chinese painting, blush soft tones, ink, abstract ink, high saturation, niji, ((martial arts)),ink and watercolor, highly saturated tones, ultra-fine, gray smoke,gufeng,beauty,dramatic light,small_eyes,floating hair,ancient China, , 动漫风格，灵活的构图，成熟
13. 国风水墨
中国传统水墨风格,水墨风格插画, 参考张大千/吴冠中意境, 焦浓重淡清五色, 飞白笔触,  诗意留白, 手工宣纸纹理, 墨韵单色美学
14. 恐怖悬疑
平面插画，动漫，黑暗诡异风格，诡异氛围，惊悚，
15. 恐怖漫画
horror film, animate,  black background, anime inspired, niji, Gloomy atmosphere, dark, 动漫风格，灵活的构图，成熟

## 音色和情感参考库
| voice_id | emotion情感范围 |
| 7524987545197756435 | angry,fear,neutral |
| 7524987545197772819 | happy,sad,angry,surprised,fear,hate,excited,coldness,neutral |
| 7524987545197789203 | coldness,angry,surprised,neutral |
| 7524987545197805587 | happy,sad,angry,surprised,excited,coldness,neutral |
| 7524987545197821971 | happy,sad,angry,surprised,fear,hate,excited,coldness,neutral |
| 7524987545197838355 | happy,sad,angry,surprised,fear,hate,excited,coldness,neutral |
| 7524987545197854739 | happy,angry,hate,neutral |
| 7524987545197871123 | happy,sad,angry,surprised,fear,neutral |
| 7524987545197887507 | sad,fear,neutral |
| 7524987545197903891 | sad,fear,neutral |
| 7524987545197920275 | sad,fear,neutral |
| 7524987545197936659 | happy,sad,angry,fear,hate,excited,neutral |
| 7524987545197953043 | happy,angry,hate,neutral |
| 7524987545197969427 | angry,surprised,fear,excited,coldness,neutral |
| 7468512265134932019 |  |
| 7468512265151528987 |  |
| 7468512265151561755 |  |
| 7468512265151594523 |  |
| 7481299960424792118 |  |
| 7481299960424808502 |  |
| 7468512265134817331 |  |
| 7468512265134833715 |  |
| 7468512265134850099 |  |
| 7468512265134866483 |  |
| 7468512265134882867 |  |
| 7468512265134948403 |  |
| 7426720361753968677 |  |
| 7481299960428855335 |  |
| 7481299960428871719 |  |
| 7481299960428888103 |  |
| 7481299960428904487 |  |
| 7481299960428920871 |  |
| 7468512265151741979 |  |

# 输出要求
将所有内容按 json 格式输出。

# 注意
- role_info需要把对应分镜内的相关角色信息都输出。
- 选择音色的情感emotion时，一定要在该音色支持情感的范围内，否则会导致错误。
- 每个剧集的分镜数量至少20个以上，每个分镜中的旁白文案字数介于15到40个字，提示词内容需要描述细节至少60字以上。
- 检查生成的提示词文本是否包含敏感信息，如有则进行调整。
- 严格按照给定的 json 格式进行输出，不能偏离框架要求。
- 需确保分镜风格保持一致，分镜与分镜间的视频运镜和视频动画保持一致，保持前后分镜剧情的连贯性。`;
    }
    buildUserPrompt(chapter, consistencyProfile, options) {
        const sceneCount = options.sceneCount || 5;
        const totalDuration = options.totalDuration || 15;
        const avgDuration = Math.floor(totalDuration / sceneCount);
        let prompt = `请为以下章节内容生成${sceneCount}个分镜场景，总时长约${totalDuration}秒。

【小说信息】
标题：${chapter.novel.title}
类型：${chapter.novel.genre || '未知'}

【章节信息】
章节号：第${chapter.chapterNumber}章
标题：${chapter.title}
内容：
${chapter.content}

【一致性要求】`;
        if (consistencyProfile?.characters) {
            const characters = Object.values(consistencyProfile.characters);
            prompt += `\n\n已知角色特征：\n`;
            characters.forEach((char) => {
                prompt += `- ${char.name}: ${char.baseAppearance}\n`;
                const dynamicState = char.dynamicState?.[chapter.chapterNumber];
                if (dynamicState) {
                    prompt += `  当前状态: ${dynamicState}\n`;
                }
            });
        }
        if (consistencyProfile?.visualStyle) {
            const style = consistencyProfile.visualStyle;
            prompt += `\n\n视觉风格：\n`;
            prompt += `- 整体风格: ${style.overall}\n`;
            prompt += `- 色调: ${style.colorTone}\n`;
            prompt += `- 艺术风格: ${style.artStyle}\n`;
        }
        prompt += `\n\n请生成JSON格式的分镜脚本，每个场景平均${avgDuration}秒。确保：
1. 场景描述具体、视觉化，适合生成图片
2. 准确识别角色并应用一致性特征
3. 镜头角度多样化（特写、中景、全景等）
4. 情节连贯，时间分配合理

JSON格式示例：
{
  "scenes": [
    {
      "sceneNumber": 1,
      "description": "详细的视觉化场景描述",
      "characters": ["角色名"],
      "environment": "环境描述",
      "duration": ${avgDuration},
      "keyMoment": "关键情节点",
      "cameraAngle": "镜头角度"
    }
  ],
  "totalDuration": ${totalDuration},
  "mainCharacters": ["主要角色列表"],
  "summary": "整体摘要"
}`;
        return prompt;
    }
    parseStoryboardResponse(content, options) {
        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('无法从响应中提取JSON');
            }
            const parsed = JSON.parse(jsonMatch[0]);
            if (!parsed.scenes || !Array.isArray(parsed.scenes)) {
                throw new Error('响应格式错误：缺少scenes数组');
            }
            const scenes = parsed.scenes.map((scene, index) => ({
                sceneNumber: scene.sceneNumber || index + 1,
                description: scene.description || '',
                characters: scene.characters || [],
                environment: scene.environment || '',
                duration: scene.duration || 3,
                keyMoment: scene.keyMoment || '',
                cameraAngle: scene.cameraAngle || 'medium',
                specialEffects: scene.specialEffects,
            }));
            return {
                scenes,
                totalDuration: parsed.totalDuration || scenes.reduce((sum, s) => sum + s.duration, 0),
                mainCharacters: parsed.mainCharacters || [],
                summary: parsed.summary || '',
            };
        }
        catch (error) {
            this.logger.error(`解析分镜脚本失败: ${error.message}`);
            return this.generateFallbackStoryboard(options);
        }
    }
    async optimizeStoryboard(storyboard, consistencyProfile) {
        const knownCharacters = consistencyProfile?.characters
            ? Object.keys(consistencyProfile.characters)
            : [];
        storyboard.scenes.forEach((scene) => {
            scene.characters = scene.characters.filter((char) => knownCharacters.includes(char));
        });
        const totalDuration = storyboard.totalDuration;
        let currentTotal = storyboard.scenes.reduce((sum, s) => sum + s.duration, 0);
        if (currentTotal !== totalDuration) {
            const ratio = totalDuration / currentTotal;
            storyboard.scenes.forEach((scene) => {
                scene.duration = Math.max(2, Math.round(scene.duration * ratio));
            });
        }
        storyboard.scenes.forEach((scene, index) => {
            scene.sceneNumber = index + 1;
        });
        return storyboard;
    }
    async getAgentConfig(agentType) {
        try {
            const config = await this.prisma.agentPromptConfig.findFirst({
                where: {
                    agentType: agentType,
                    isActive: true,
                },
                orderBy: {
                    version: 'desc',
                },
            });
            return config;
        }
        catch (error) {
            this.logger.warn(`获取Agent配置失败: ${error.message}`);
            return null;
        }
    }
    generateFallbackStoryboard(options) {
        const sceneCount = options.sceneCount || 5;
        const totalDuration = options.totalDuration || 15;
        const sceneDuration = Math.floor(totalDuration / sceneCount);
        const scenes = Array.from({ length: sceneCount }, (_, i) => ({
            sceneNumber: i + 1,
            description: `场景${i + 1}描述`,
            characters: [],
            environment: '默认环境',
            duration: sceneDuration,
            keyMoment: `关键情节${i + 1}`,
            cameraAngle: 'medium',
        }));
        return {
            scenes,
            totalDuration,
            mainCharacters: [],
            summary: '自动生成的兜底分镜脚本',
        };
    }
};
exports.StoryboardAgentService = StoryboardAgentService;
exports.StoryboardAgentService = StoryboardAgentService = StoryboardAgentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof ai_caller_service_1.AICallerService !== "undefined" && ai_caller_service_1.AICallerService) === "function" ? _b : Object])
], StoryboardAgentService);


/***/ }),
/* 64 */
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
var ImageGenerationAgentService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ImageGenerationAgentService = void 0;
const common_1 = __webpack_require__(2);
const database_1 = __webpack_require__(9);
const ai_caller_service_1 = __webpack_require__(17);
let ImageGenerationAgentService = ImageGenerationAgentService_1 = class ImageGenerationAgentService {
    constructor(prisma, aiCaller) {
        this.prisma = prisma;
        this.aiCaller = aiCaller;
        this.logger = new common_1.Logger(ImageGenerationAgentService_1.name);
    }
    async generateImagePrompt(scene, consistencyProfile, chapterNumber) {
        this.logger.log(`生成图片提示词，场景: ${scene.sceneNumber}`);
        const basePrompt = await this.generateBasePrompt(scene, consistencyProfile, chapterNumber);
        const optimizedPrompt = await this.optimizePrompt(basePrompt, scene);
        const negativePrompt = this.buildNegativePrompt();
        const referenceImageUrl = await this.getConsistencyReference(scene.characters, consistencyProfile);
        return {
            sceneNumber: scene.sceneNumber,
            positivePrompt: optimizedPrompt,
            negativePrompt,
            size: '1024x576',
            seed: this.generateConsistentSeed(scene.sceneNumber),
            referenceImageUrl,
        };
    }
    async generateImagePromptBatch(scenes, consistencyProfile, chapterNumber) {
        this.logger.log(`批量生成图片提示词，数量: ${scenes.length}`);
        const prompts = [];
        for (const scene of scenes) {
            const prompt = await this.generateImagePrompt(scene, consistencyProfile, chapterNumber);
            prompts.push(prompt);
            await this.delay(500);
        }
        return prompts;
    }
    async generateBasePrompt(scene, consistencyProfile, chapterNumber) {
        const agentConfig = await this.getAgentConfig('IMAGE_OPTIMIZER');
        const systemPrompt = this.buildSystemPrompt(agentConfig);
        const userPrompt = this.buildUserPrompt(scene, consistencyProfile, chapterNumber);
        const response = await this.aiCaller.callAI({
            userId: 'system',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            parameters: {
                temperature: 0.8,
                maxTokens: 500,
            },
        });
        return response.content.trim();
    }
    async optimizePrompt(basePrompt, scene) {
        const systemPrompt = `你是一个AI绘图提示词优化专家。你的任务是优化现有提示词，使其更加精确、视觉化，适合seedream等AI绘图模型。

优化要点：
1. 增强视觉细节描述（景别、环境、物体细节）
2. 添加艺术风格和质量标签
3. 优化描述顺序（景别→场景→角色→动作→环境→风格→质量）
4. 确保描述具体，不使用指代词
5. 保持原意不变
6. 检查并移除敏感词汇

输出优化后的提示词（中文），详细且具体，至少60字。`;
        const userPrompt = `请优化以下提示词：

${basePrompt}

场景描述：${scene.description}
镜头角度：${scene.cameraAngle}
环境：${scene.environment}

请输出优化后的中文提示词，确保：
- 明确描述景别（全景/中景/近景/特写）
- 详细描述场景环境
- 清晰描述角色站位、动作、表情
- 包含风格描述
- 至少60字`;
        try {
            const response = await this.aiCaller.callAI({
                userId: 'system',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                parameters: {
                    temperature: 0.7,
                    maxTokens: 500,
                },
            });
            return response.content.trim();
        }
        catch (error) {
            this.logger.error(`优化提示词失败: ${error.message}`);
            return basePrompt;
        }
    }
    buildSystemPrompt(agentConfig) {
        if (agentConfig && agentConfig.systemPrompt) {
            return agentConfig.systemPrompt;
        }
        return `你是一个专业的AI绘图提示词生成专家。你的任务是将场景描述转化为详细的视觉化提示词，用于seedream生图模型。

# 技能要求
1. 详细描述场景要素：
   - 景别（全景/中景/近景/特写）
   - 时间、地点
   - 场景环境描述
   - 画面描述
   - 物体和细节（如形状/颜色/大小/位置）
   - 风格描述
   - 角色站位位置/角色动作/角色表情

2. 准确描述角色外貌和特征（确保一致性）
3. 详细描述环境、氛围、光线
4. 添加艺术风格、色调、质量标签
5. 根据镜头角度调整构图描述
6. 使用具体的视觉化词汇

# 风格词库参考
绘本风格、古风插画、lo-fi插画、宫崎骏动漫、日漫风格、赛璐璐风格、儿童画、2D Cartoon、欧美动画、2D动画风格、国漫风格、中国风、Ancient China Illustration、新艺术派风、美漫风格、厚涂风格、半厚涂风格、奇幻风、奇幻风格、侘寂风、中式恐怖、日杂风、民国风、老钱风、森系、欧美杂志封面插画、拼贴风、小清新、Springtime Aesthetic、野性美、甜酷辣妹风、复古风、American retro style、波西米亚风、像素风、宫崎骏、京剧风格、乐高风格、Lowbrow art、丁丁历险记、flat style、轻酸性设计、扁平渐变风格、盲盒风格、Barbie style、港风、敦煌美学、Pastoral style、wasteland、老照片、国家地理风格、国画风格、水墨风、山水画、绢本画、工笔风格、花鸟画、版画、色粉画、后印象派、连环画、皮影、剪纸、极简主义、弥散风格、晕染风格、漆画风格

# 生图提示词参考
1. 推文通用: 2d漫画，细线条，厚涂，简洁，柔和的灯光，平面插画，动漫美感，数字技术技艺
2. 新二次元: 二次元，平面插画，光影质感，原神
3. 国风漫画: 中国古风二次元风格, 参考苏摩画风, 赛璐珞着色，厚涂漫画, 散点透视
4. 都市气质: Josei, modern, modern city, modern and fashionable, cool_theme, metropolis, sumptuous, mature, painting, 动漫风格，灵活的构图，成熟
5. 仙侠古风: 2d漫画，细线条，柔和的灯光，平面插画，动漫美感，数字技术技艺，游戏CG，影视级画面，高质感，仙侠古风，古风
6. 水墨国风: 2.5D,bloom,ink washing,watercolor,realistic,gentle,Chinese painting, blush soft tones, ink, abstract ink, high saturation, niji, martial arts,ink and watercolor, highly saturated tones, ultra-fine, gray smoke,gufeng,beauty,dramatic light,small_eyes,floating hair,ancient China, 动漫风格，灵活的构图，成熟
7. 恐怖悬疑: 平面插画，动漫，黑暗诡异风格，诡异氛围，惊悚

# 注意事项
- 将画面中的物体细节都描述清楚
- 重点关注多个分镜间前后的内容和效果连贯性
- 明确画面主体的位置和状态，不要用"这个""那个"等词指代
- 内容60字以上
- 检查并移除敏感词汇（涉政、涉黄、暴力、血腥等）
- 输出中文描述，详细且具体`;
    }
    buildUserPrompt(scene, consistencyProfile, chapterNumber) {
        let prompt = `请为以下场景生成详细的AI绘图提示词：

【场景描述】
${scene.description}

【镜头角度】
${scene.cameraAngle}

【环境】
${scene.environment}`;
        if (scene.characters.length > 0 && consistencyProfile?.characters) {
            prompt += `\n\n【角色信息（必须严格遵守）】`;
            scene.characters.forEach((charName) => {
                const char = consistencyProfile.characters[charName];
                if (char) {
                    prompt += `\n\n角色: ${char.name}`;
                    prompt += `\n基础外貌: ${char.baseAppearance}`;
                    const dynamicState = char.dynamicState?.[chapterNumber];
                    if (dynamicState) {
                        prompt += `\n当前状态: ${dynamicState}`;
                    }
                    if (char.keywords && char.keywords.length > 0) {
                        prompt += `\n视觉关键词: ${char.keywords.join(', ')}`;
                    }
                }
            });
        }
        if (consistencyProfile?.visualStyle) {
            const style = consistencyProfile.visualStyle;
            prompt += `\n\n【视觉风格】`;
            prompt += `\n整体风格: ${style.overall}`;
            prompt += `\n色调: ${style.colorTone}`;
            prompt += `\n艺术风格: ${style.artStyle}`;
            prompt += `\n光照: ${style.lighting}`;
        }
        prompt += `\n\n请生成英文提示词，用逗号分隔。格式：角色描述, 环境描述, 氛围描述, 风格标签, 质量标签`;
        return prompt;
    }
    buildNegativePrompt() {
        return `low quality, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, bad proportions, extra limbs, disfigured, deformed`;
    }
    async getConsistencyReference(characters, consistencyProfile) {
        if (!characters.length || !consistencyProfile?.characters) {
            return undefined;
        }
        const mainCharName = characters[0];
        const char = consistencyProfile.characters[mainCharName];
        return char?.referenceImageUrl;
    }
    generateConsistentSeed(sceneNumber) {
        return 1000000 + sceneNumber * 1000;
    }
    async getAgentConfig(agentType) {
        try {
            const config = await this.prisma.agentPromptConfig.findFirst({
                where: {
                    agentType: agentType,
                    isActive: true,
                },
                orderBy: {
                    version: 'desc',
                },
            });
            return config;
        }
        catch (error) {
            this.logger.warn(`获取Agent配置失败: ${error.message}`);
            return null;
        }
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
};
exports.ImageGenerationAgentService = ImageGenerationAgentService;
exports.ImageGenerationAgentService = ImageGenerationAgentService = ImageGenerationAgentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof ai_caller_service_1.AICallerService !== "undefined" && ai_caller_service_1.AICallerService) === "function" ? _b : Object])
], ImageGenerationAgentService);


/***/ }),
/* 65 */
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
var VideoGenerationAgentService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VideoGenerationAgentService = void 0;
const common_1 = __webpack_require__(2);
const database_1 = __webpack_require__(9);
const ai_caller_service_1 = __webpack_require__(17);
let VideoGenerationAgentService = VideoGenerationAgentService_1 = class VideoGenerationAgentService {
    constructor(prisma, aiCaller) {
        this.prisma = prisma;
        this.aiCaller = aiCaller;
        this.logger = new common_1.Logger(VideoGenerationAgentService_1.name);
    }
    async generateVideoPrompt(scene, imageUrl, consistencyProfile) {
        this.logger.log(`生成视频提示词，场景: ${scene.sceneNumber}`);
        const motionPrompt = await this.generateMotionPrompt(scene, consistencyProfile);
        const motionIntensity = this.determineMotionIntensity(scene);
        const characterConsistencyId = await this.getCharacterConsistencyId(scene.characters, consistencyProfile);
        return {
            sceneNumber: scene.sceneNumber,
            motionPrompt,
            duration: scene.duration,
            motionIntensity,
            characterConsistencyId,
        };
    }
    async generateVideoPromptBatch(scenes, imageUrls, consistencyProfile) {
        this.logger.log(`批量生成视频提示词，数量: ${scenes.length}`);
        const prompts = [];
        for (let i = 0; i < scenes.length; i++) {
            const prompt = await this.generateVideoPrompt(scenes[i], imageUrls[i], consistencyProfile);
            prompts.push(prompt);
        }
        return prompts;
    }
    async generateMotionPrompt(scene, consistencyProfile) {
        const agentConfig = await this.getAgentConfig('VIDEO_OPTIMIZER');
        const systemPrompt = this.buildSystemPrompt(agentConfig);
        const userPrompt = this.buildUserPrompt(scene, consistencyProfile);
        try {
            const response = await this.aiCaller.callAI({
                userId: 'system',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                parameters: {
                    temperature: 0.7,
                    maxTokens: 200,
                },
            });
            return response.content.trim();
        }
        catch (error) {
            this.logger.error(`生成运动提示词失败: ${error.message}`);
            return this.generateFallbackMotionPrompt(scene);
        }
    }
    buildSystemPrompt(agentConfig) {
        if (agentConfig && agentConfig.systemPrompt) {
            return agentConfig.systemPrompt;
        }
        return `你是一个专业的视频运动描述专家。你的任务是为静态图片生成合适的运动提示词，使其转化为流畅的视频片段，用于seedance生视频模型。

# 技能要求
1. 视频动作提示词详细描述：
   - 镜头运镜方式与镜头变化
   - 角色站位/角色动作/角色表情
   - 说话人的角色名称（说话人的嘴有动作）
   - 场景环境的变化描述
   - 画面变化描述
   - 物体和细节变化描述
   - 参考首帧画面提示词进行风格描述

2. 根据场景描述生成自然的运动效果
3. 考虑镜头运动（推拉摇移升降）
4. 考虑主体运动（角色动作、表情变化）
5. 考虑环境动态（风吹、光影变化等）
6. 保持运动幅度适中，避免过于夸张

# 注意事项
- 将画面中的物体细节的变化都描述清楚
- 重点结合首帧图提示词进行画面动态过程的描述
- 重点考虑多个分镜间前后的内容和效果连贯性
- 特别明确画面主体的具体位置和详细状态
- 不要用"这个""那个"等词指代
- 内容100字以上
- 检查并移除敏感词汇

输出中文运动描述，详细且具体，至少100字。`;
    }
    buildUserPrompt(scene, consistencyProfile) {
        let prompt = `请为以下场景生成详细的视频运动描述：

【场景描述】
${scene.description}

【关键情节】
${scene.keyMoment}

【镜头角度】
${scene.cameraAngle}

【环境】
${scene.environment}

【时长】
${scene.duration}秒`;
        if (scene.characters.length > 0) {
            prompt += `\n\n【角色】\n${scene.characters.join(', ')}`;
            if (consistencyProfile?.characters) {
                prompt += `\n\n【角色详细信息】`;
                scene.characters.forEach((charName) => {
                    const char = consistencyProfile.characters[charName];
                    if (char) {
                        prompt += `\n- ${char.name}: ${char.baseAppearance}`;
                    }
                });
            }
        }
        if (scene.specialEffects) {
            prompt += `\n\n【特殊效果】\n${scene.specialEffects}`;
        }
        prompt += `\n\n请生成详细的中文运动描述，确保：
- 描述镜头运镜方式与镜头变化
- 描述角色站位、角色动作、角色表情
- 如有说话人，明确说话人的嘴部动作
- 描述场景环境的变化
- 描述画面整体变化和物体细节变化
- 结合首帧画面提示词进行风格描述
- 内容至少100字
- 不使用指代词，明确具体位置和状态`;
        return prompt;
    }
    determineMotionIntensity(scene) {
        const description = scene.description.toLowerCase() + ' ' + scene.keyMoment.toLowerCase();
        const highIntensityKeywords = ['战斗', '爆炸', '追逐', 'fight', 'explosion', 'chase', 'run', 'jump'];
        const lowIntensityKeywords = ['静坐', '思考', '对话', 'sit', 'think', 'dialogue', 'talk', 'calm'];
        if (highIntensityKeywords.some(keyword => description.includes(keyword))) {
            return 'high';
        }
        if (lowIntensityKeywords.some(keyword => description.includes(keyword))) {
            return 'low';
        }
        return 'medium';
    }
    async getCharacterConsistencyId(characters, consistencyProfile) {
        if (!characters.length || !consistencyProfile?.characters) {
            return undefined;
        }
        const mainCharName = characters[0];
        const char = consistencyProfile.characters[mainCharName];
        return char ? mainCharName : undefined;
    }
    generateFallbackMotionPrompt(scene) {
        const cameraMotions = {
            'close-up': 'slow zoom in, subtle movement',
            'medium': 'gentle camera pan, natural motion',
            'wide': 'slow camera dolly, establishing shot',
            'full': 'smooth tracking shot, wide angle',
        };
        const cameraAngle = scene.cameraAngle.toLowerCase();
        return cameraMotions[cameraAngle] || 'smooth camera movement, natural motion';
    }
    async getAgentConfig(agentType) {
        try {
            const config = await this.prisma.agentPromptConfig.findFirst({
                where: {
                    agentType: agentType,
                    isActive: true,
                },
                orderBy: {
                    version: 'desc',
                },
            });
            return config;
        }
        catch (error) {
            this.logger.warn(`获取Agent配置失败: ${error.message}`);
            return null;
        }
    }
};
exports.VideoGenerationAgentService = VideoGenerationAgentService;
exports.VideoGenerationAgentService = VideoGenerationAgentService = VideoGenerationAgentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof ai_caller_service_1.AICallerService !== "undefined" && ai_caller_service_1.AICallerService) === "function" ? _b : Object])
], VideoGenerationAgentService);


/***/ }),
/* 66 */
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
var VolcengineVisualProvider_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VolcengineVisualProvider = void 0;
const common_1 = __webpack_require__(2);
const axios_1 = __webpack_require__(20);
const crypto = __webpack_require__(25);
let VolcengineVisualProvider = VolcengineVisualProvider_1 = class VolcengineVisualProvider {
    constructor() {
        this.logger = new common_1.Logger(VolcengineVisualProvider_1.name);
        this.config = {
            accessKeyId: process.env.VOLCENGINE_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.VOLCENGINE_SECRET_ACCESS_KEY || '',
            region: process.env.VOLCENGINE_VISUAL_REGION || 'cn-beijing',
            endpoint: process.env.VOLCENGINE_VISUAL_ENDPOINT || 'https://visual.volcengineapi.com',
            model: process.env.VOLCENGINE_VISUAL_MODEL || 'general-v2',
        };
        this.client = axios_1.default.create({
            baseURL: this.config.endpoint,
            timeout: 120000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        this.client.interceptors.request.use((config) => {
            const signature = this.generateSignature(config);
            config.headers['Authorization'] = signature;
            config.headers['X-Date'] = new Date().toISOString();
            return config;
        });
    }
    generateSignature(config) {
        const stringToSign = `${config.method}\n${config.url}\n${JSON.stringify(config.data || {})}`;
        const signature = crypto
            .createHmac('sha256', this.config.secretAccessKey)
            .update(stringToSign)
            .digest('hex');
        return `HMAC-SHA256 Credential=${this.config.accessKeyId}, Signature=${signature}`;
    }
    async generateImage(request) {
        const startTime = Date.now();
        try {
            this.logger.log(`开始生成图片，提示词: ${request.prompt.substring(0, 50)}...`);
            const requestBody = {
                model: this.config.model,
                prompt: request.prompt,
                negative_prompt: request.negativePrompt,
                width: request.width || 1024,
                height: request.height || 576,
                seed: request.seed || Math.floor(Math.random() * 1000000),
                steps: request.steps || 20,
                cfg_scale: request.cfgScale || 7.5,
                sampler: request.sampler || 'euler_a',
                num_images: request.batchSize || 1,
            };
            if (request.referenceImage) {
                requestBody['reference_image'] = request.referenceImage;
                requestBody['reference_weight'] = request.referenceWeight || 0.5;
            }
            const response = await this.client.post('/api/v1/text2img', requestBody);
            const duration = (Date.now() - startTime) / 1000;
            if (response.data && response.data.code === 0) {
                const images = response.data.data.images || [];
                this.logger.log(`图片生成成功，耗时: ${duration}秒，生成数量: ${images.length}`);
                return {
                    success: true,
                    images: images,
                    seed: response.data.data.seed,
                    duration,
                    metadata: {
                        model: this.config.model,
                        resolution: `${requestBody.width}x${requestBody.height}`,
                        steps: requestBody.steps,
                    },
                };
            }
            else {
                throw new Error(response.data?.message || '图片生成失败');
            }
        }
        catch (error) {
            const duration = (Date.now() - startTime) / 1000;
            this.logger.error(`图片生成失败: ${error.message}`, error.stack);
            return {
                success: false,
                images: [],
                duration,
                error: error.message,
            };
        }
    }
    async generateImageBatch(requests) {
        this.logger.log(`开始批量生成图片，数量: ${requests.length}`);
        const concurrency = 3;
        const results = [];
        for (let i = 0; i < requests.length; i += concurrency) {
            const batch = requests.slice(i, i + concurrency);
            const batchResults = await Promise.all(batch.map((req) => this.generateImage(req)));
            results.push(...batchResults);
            if (i + concurrency < requests.length) {
                await this.delay(1000);
            }
        }
        this.logger.log(`批量生成完成，成功: ${results.filter(r => r.success).length}/${requests.length}`);
        return results;
    }
    async checkHealth() {
        try {
            const testPrompt = 'test';
            const response = await this.client.post('/api/v1/text2img', {
                model: this.config.model,
                prompt: testPrompt,
                width: 256,
                height: 256,
                steps: 1,
            });
            return response.status === 200;
        }
        catch (error) {
            this.logger.error(`健康检查失败: ${error.message}`);
            return false;
        }
    }
    async downloadImage(imageUrl, savePath) {
        try {
            const response = await axios_1.default.get(imageUrl, {
                responseType: 'arraybuffer',
            });
            const fs = __webpack_require__(67);
            const path = __webpack_require__(68);
            const dir = path.dirname(savePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(savePath, response.data);
            this.logger.log(`图片已下载到: ${savePath}`);
            return savePath;
        }
        catch (error) {
            this.logger.error(`图片下载失败: ${error.message}`);
            throw error;
        }
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
};
exports.VolcengineVisualProvider = VolcengineVisualProvider;
exports.VolcengineVisualProvider = VolcengineVisualProvider = VolcengineVisualProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], VolcengineVisualProvider);


/***/ }),
/* 67 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 68 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 69 */
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
var JimengVideoProvider_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JimengVideoProvider = void 0;
const common_1 = __webpack_require__(2);
const axios_1 = __webpack_require__(20);
let JimengVideoProvider = JimengVideoProvider_1 = class JimengVideoProvider {
    constructor() {
        this.logger = new common_1.Logger(JimengVideoProvider_1.name);
        this.apiKey = process.env.JIMENG_API_KEY || '';
        this.apiUrl = process.env.JIMENG_API_URL || 'https://api.jimeng.ai';
        this.client = axios_1.default.create({
            baseURL: this.apiUrl,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
            },
        });
    }
    async submitVideoTask(request) {
        try {
            this.logger.log(`提交图生视频任务，图片: ${request.imageUrl}`);
            const requestBody = {
                image_url: request.imageUrl,
                motion_prompt: request.motionPrompt,
                duration: request.duration,
                motion_intensity: request.motionIntensity || 'medium',
                fps: request.fps || 24,
                resolution: request.resolution || '1024x576',
                seed: request.seed,
                character_id: request.characterId,
            };
            const response = await this.client.post('/v1/image-to-video', requestBody);
            if (response.data && response.data.code === 200) {
                const taskId = response.data.data.task_id;
                this.logger.log(`视频生成任务已提交，任务ID: ${taskId}`);
                return {
                    success: true,
                    taskId: taskId,
                    status: 'pending',
                    metadata: {
                        model: 'jimeng-v1',
                        resolution: request.resolution || '1024x576',
                        fps: request.fps || 24,
                        duration: request.duration,
                    },
                };
            }
            else {
                throw new Error(response.data?.message || '任务提交失败');
            }
        }
        catch (error) {
            this.logger.error(`提交视频任务失败: ${error.message}`, error.stack);
            return {
                success: false,
                status: 'failed',
                error: error.message,
            };
        }
    }
    async queryTaskStatus(taskId) {
        try {
            const response = await this.client.get(`/v1/tasks/${taskId}`);
            if (response.data && response.data.code === 200) {
                const data = response.data.data;
                return {
                    taskId: taskId,
                    status: this.mapStatus(data.status),
                    progress: data.progress || 0,
                    result: data.status === 'completed' ? {
                        videoUrl: data.video_url,
                    } : undefined,
                    error: data.error,
                    createdAt: new Date(data.created_at),
                    updatedAt: new Date(data.updated_at),
                    estimatedTimeRemaining: data.estimated_time_remaining,
                };
            }
            else {
                throw new Error(response.data?.message || '查询任务状态失败');
            }
        }
        catch (error) {
            this.logger.error(`查询任务状态失败: ${error.message}`);
            throw error;
        }
    }
    async waitForTaskCompletion(taskId, timeout = 600000) {
        const startTime = Date.now();
        const pollInterval = 5000;
        this.logger.log(`开始等待任务完成，任务ID: ${taskId}`);
        while (Date.now() - startTime < timeout) {
            try {
                const status = await this.queryTaskStatus(taskId);
                if (status.status === 'completed') {
                    this.logger.log(`任务完成，任务ID: ${taskId}`);
                    return {
                        success: true,
                        taskId: taskId,
                        videoUrl: status.result?.videoUrl,
                        status: 'completed',
                        duration: (Date.now() - startTime) / 1000,
                    };
                }
                if (status.status === 'failed') {
                    this.logger.error(`任务失败，任务ID: ${taskId}，错误: ${status.error}`);
                    return {
                        success: false,
                        taskId: taskId,
                        status: 'failed',
                        error: status.error,
                    };
                }
                this.logger.debug(`任务处理中，进度: ${status.progress}%`);
                await this.delay(pollInterval);
            }
            catch (error) {
                this.logger.error(`轮询任务状态出错: ${error.message}`);
                await this.delay(pollInterval);
            }
        }
        this.logger.warn(`任务等待超时，任务ID: ${taskId}`);
        return {
            success: false,
            taskId: taskId,
            status: 'failed',
            error: '任务等待超时',
        };
    }
    async cancelTask(taskId) {
        try {
            const response = await this.client.post(`/v1/tasks/${taskId}/cancel`);
            if (response.data && response.data.code === 200) {
                this.logger.log(`任务已取消，任务ID: ${taskId}`);
                return true;
            }
            return false;
        }
        catch (error) {
            this.logger.error(`取消任务失败: ${error.message}`);
            return false;
        }
    }
    async checkHealth() {
        try {
            const response = await this.client.get('/v1/health');
            return response.status === 200;
        }
        catch (error) {
            this.logger.error(`健康检查失败: ${error.message}`);
            return false;
        }
    }
    mapStatus(status) {
        const statusMap = {
            'pending': 'pending',
            'queued': 'pending',
            'processing': 'processing',
            'running': 'processing',
            'completed': 'completed',
            'success': 'completed',
            'failed': 'failed',
            'error': 'failed',
            'cancelled': 'failed',
        };
        return statusMap[status.toLowerCase()] || 'pending';
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    async downloadVideo(videoUrl, savePath) {
        try {
            const response = await axios_1.default.get(videoUrl, {
                responseType: 'stream',
            });
            const fs = __webpack_require__(67);
            const path = __webpack_require__(68);
            const dir = path.dirname(savePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            const writer = fs.createWriteStream(savePath);
            response.data.pipe(writer);
            return new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    this.logger.log(`视频已下载到: ${savePath}`);
                    resolve(savePath);
                });
                writer.on('error', reject);
            });
        }
        catch (error) {
            this.logger.error(`视频下载失败: ${error.message}`);
            throw error;
        }
    }
};
exports.JimengVideoProvider = JimengVideoProvider;
exports.JimengVideoProvider = JimengVideoProvider = JimengVideoProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], JimengVideoProvider);


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
var KlingVideoProvider_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.KlingVideoProvider = void 0;
const common_1 = __webpack_require__(2);
const axios_1 = __webpack_require__(20);
let KlingVideoProvider = KlingVideoProvider_1 = class KlingVideoProvider {
    constructor() {
        this.logger = new common_1.Logger(KlingVideoProvider_1.name);
        this.apiKey = process.env.KLING_API_KEY || '';
        this.apiUrl = process.env.KLING_API_URL || 'https://api.kuaishou.com/kling';
        this.client = axios_1.default.create({
            baseURL: this.apiUrl,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': this.apiKey,
            },
        });
    }
    async submitVideoTask(request) {
        try {
            this.logger.log(`可灵: 提交图生视频任务`);
            const requestBody = {
                image_url: request.imageUrl,
                prompt: request.motionPrompt,
                duration: request.duration,
                motion_level: this.mapMotionIntensity(request.motionIntensity),
                fps: request.fps || 24,
                resolution: request.resolution || '1024x576',
                character_reference: request.characterId,
                seed: request.seed,
            };
            const response = await this.client.post('/v1/video/generate', requestBody);
            if (response.data && response.data.success) {
                const taskId = response.data.task_id;
                this.logger.log(`可灵: 任务已提交，ID: ${taskId}`);
                return {
                    success: true,
                    taskId: taskId,
                    status: 'pending',
                    metadata: {
                        model: 'kling-v1',
                        resolution: request.resolution || '1024x576',
                        fps: request.fps || 24,
                        duration: request.duration,
                    },
                };
            }
            else {
                throw new Error(response.data?.error || '任务提交失败');
            }
        }
        catch (error) {
            this.logger.error(`可灵: 提交任务失败: ${error.message}`);
            return {
                success: false,
                status: 'failed',
                error: error.message,
            };
        }
    }
    async queryTaskStatus(taskId) {
        try {
            const response = await this.client.get(`/v1/video/status/${taskId}`);
            if (response.data && response.data.success) {
                const data = response.data.data;
                return {
                    taskId: taskId,
                    status: this.mapStatus(data.status),
                    progress: data.progress || 0,
                    result: data.status === 'succeeded' ? {
                        videoUrl: data.result.video_url,
                    } : undefined,
                    error: data.error_message,
                    createdAt: new Date(data.created_time * 1000),
                    updatedAt: new Date(data.updated_time * 1000),
                    estimatedTimeRemaining: data.eta,
                };
            }
            else {
                throw new Error(response.data?.error || '查询失败');
            }
        }
        catch (error) {
            this.logger.error(`可灵: 查询任务状态失败: ${error.message}`);
            throw error;
        }
    }
    async waitForTaskCompletion(taskId, timeout = 600000) {
        const startTime = Date.now();
        const pollInterval = 5000;
        this.logger.log(`可灵: 开始等待任务完成，ID: ${taskId}`);
        while (Date.now() - startTime < timeout) {
            try {
                const status = await this.queryTaskStatus(taskId);
                if (status.status === 'completed') {
                    this.logger.log(`可灵: 任务完成，ID: ${taskId}`);
                    return {
                        success: true,
                        taskId: taskId,
                        videoUrl: status.result?.videoUrl,
                        status: 'completed',
                        duration: (Date.now() - startTime) / 1000,
                    };
                }
                if (status.status === 'failed') {
                    this.logger.error(`可灵: 任务失败，ID: ${taskId}`);
                    return {
                        success: false,
                        taskId: taskId,
                        status: 'failed',
                        error: status.error,
                    };
                }
                this.logger.debug(`可灵: 任务处理中，进度: ${status.progress}%`);
                await this.delay(pollInterval);
            }
            catch (error) {
                this.logger.error(`可灵: 轮询出错: ${error.message}`);
                await this.delay(pollInterval);
            }
        }
        this.logger.warn(`可灵: 任务等待超时，ID: ${taskId}`);
        return {
            success: false,
            taskId: taskId,
            status: 'failed',
            error: '任务等待超时',
        };
    }
    async cancelTask(taskId) {
        try {
            const response = await this.client.delete(`/v1/video/${taskId}`);
            if (response.data && response.data.success) {
                this.logger.log(`可灵: 任务已取消，ID: ${taskId}`);
                return true;
            }
            return false;
        }
        catch (error) {
            this.logger.error(`可灵: 取消任务失败: ${error.message}`);
            return false;
        }
    }
    async checkHealth() {
        try {
            const response = await this.client.get('/v1/health');
            return response.status === 200 && response.data?.success;
        }
        catch (error) {
            this.logger.error(`可灵: 健康检查失败: ${error.message}`);
            return false;
        }
    }
    mapMotionIntensity(intensity) {
        const intensityMap = {
            'low': 1,
            'medium': 2,
            'high': 3,
        };
        return intensityMap[intensity || 'medium'] || 2;
    }
    mapStatus(status) {
        const statusMap = {
            'pending': 'pending',
            'submitted': 'pending',
            'processing': 'processing',
            'running': 'processing',
            'succeeded': 'completed',
            'completed': 'completed',
            'failed': 'failed',
            'error': 'failed',
            'cancelled': 'failed',
        };
        return statusMap[status.toLowerCase()] || 'pending';
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    async downloadVideo(videoUrl, savePath) {
        try {
            const response = await axios_1.default.get(videoUrl, {
                responseType: 'stream',
            });
            const fs = __webpack_require__(67);
            const path = __webpack_require__(68);
            const dir = path.dirname(savePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            const writer = fs.createWriteStream(savePath);
            response.data.pipe(writer);
            return new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    this.logger.log(`可灵: 视频已下载到: ${savePath}`);
                    resolve(savePath);
                });
                writer.on('error', reject);
            });
        }
        catch (error) {
            this.logger.error(`可灵: 视频下载失败: ${error.message}`);
            throw error;
        }
    }
};
exports.KlingVideoProvider = KlingVideoProvider;
exports.KlingVideoProvider = KlingVideoProvider = KlingVideoProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], KlingVideoProvider);


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
var FFmpegService_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FFmpegService = void 0;
const common_1 = __webpack_require__(2);
const util_1 = __webpack_require__(72);
const child_process_1 = __webpack_require__(73);
const fs = __webpack_require__(67);
const path = __webpack_require__(68);
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let FFmpegService = FFmpegService_1 = class FFmpegService {
    constructor() {
        this.logger = new common_1.Logger(FFmpegService_1.name);
        this.ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';
        this.tempDir = process.env.VIDEO_TEMP_DIR || '/tmp/video-generation';
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }
    async mergeVideos(videoPaths, outputPath) {
        this.logger.log(`开始合并视频，数量: ${videoPaths.length}`);
        try {
            const listFilePath = path.join(this.tempDir, `merge-list-${Date.now()}.txt`);
            const listContent = videoPaths.map(p => `file '${p}'`).join('\n');
            fs.writeFileSync(listFilePath, listContent);
            const command = `${this.ffmpegPath} -f concat -safe 0 -i "${listFilePath}" -c copy "${outputPath}"`;
            const { stdout, stderr } = await execAsync(command);
            this.logger.debug(`FFmpeg输出: ${stderr}`);
            fs.unlinkSync(listFilePath);
            if (!fs.existsSync(outputPath)) {
                throw new Error('视频合并失败：输出文件不存在');
            }
            const stats = fs.statSync(outputPath);
            this.logger.log(`视频合并成功，文件大小: ${(stats.size / 1024 / 1024).toFixed(2)}MB`);
            return outputPath;
        }
        catch (error) {
            this.logger.error(`视频合并失败: ${error.message}`, error.stack);
            throw error;
        }
    }
    async mergeVideosWithTransitions(videoPaths, outputPath, transitionDuration = 0.5) {
        this.logger.log(`开始合并视频（带转场），数量: ${videoPaths.length}`);
        try {
            let filterComplex = '';
            let currentLabel = '[0:v]';
            for (let i = 1; i < videoPaths.length; i++) {
                const nextLabel = i === videoPaths.length - 1 ? '[outv]' : `[v${i}]`;
                filterComplex += `${currentLabel}[${i}:v]xfade=transition=fade:duration=${transitionDuration}:offset=0${nextLabel};`;
                currentLabel = nextLabel;
            }
            const inputs = videoPaths.map(p => `-i "${p}"`).join(' ');
            const command = `${this.ffmpegPath} ${inputs} -filter_complex "${filterComplex}" -map "[outv]" "${outputPath}"`;
            const { stderr } = await execAsync(command, { maxBuffer: 10 * 1024 * 1024 });
            this.logger.debug(`FFmpeg输出: ${stderr}`);
            if (!fs.existsSync(outputPath)) {
                throw new Error('视频合并失败：输出文件不存在');
            }
            this.logger.log(`视频合并成功（带转场）`);
            return outputPath;
        }
        catch (error) {
            this.logger.error(`视频合并失败: ${error.message}`);
            this.logger.warn('降级为无转场合并');
            return this.mergeVideos(videoPaths, outputPath);
        }
    }
    async addTitleFrame(videoPath, title, duration, outputPath) {
        this.logger.log(`添加标题帧: ${title}`);
        try {
            const titleImagePath = await this.createTitleImage(title);
            const titleVideoPath = path.join(this.tempDir, `title-${Date.now()}.mp4`);
            await this.imageToVideo(titleImagePath, titleVideoPath, duration);
            await this.mergeVideos([titleVideoPath, videoPath], outputPath);
            fs.unlinkSync(titleImagePath);
            fs.unlinkSync(titleVideoPath);
            return outputPath;
        }
        catch (error) {
            this.logger.error(`添加标题帧失败: ${error.message}`);
            throw error;
        }
    }
    async createTitleImage(title) {
        const imagePath = path.join(this.tempDir, `title-${Date.now()}.png`);
        const command = `${this.ffmpegPath} -f lavfi -i color=c=black:s=1024x576:d=1 -vf "drawtext=text='${title}':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2" -frames:v 1 "${imagePath}"`;
        await execAsync(command);
        return imagePath;
    }
    async imageToVideo(imagePath, videoPath, duration) {
        const command = `${this.ffmpegPath} -loop 1 -i "${imagePath}" -c:v libx264 -t ${duration} -pix_fmt yuv420p -vf "scale=1024:576" "${videoPath}"`;
        await execAsync(command);
        return videoPath;
    }
    async compressVideo(inputPath, outputPath, quality = 'medium') {
        this.logger.log(`压缩视频，质量: ${quality}`);
        const crfMap = {
            high: 18,
            medium: 23,
            low: 28,
        };
        const crf = crfMap[quality];
        try {
            const command = `${this.ffmpegPath} -i "${inputPath}" -c:v libx264 -crf ${crf} -preset medium -c:a aac -b:a 128k "${outputPath}"`;
            const { stderr } = await execAsync(command);
            this.logger.debug(`FFmpeg输出: ${stderr}`);
            const inputStats = fs.statSync(inputPath);
            const outputStats = fs.statSync(outputPath);
            const compressionRatio = ((1 - outputStats.size / inputStats.size) * 100).toFixed(2);
            this.logger.log(`视频压缩完成，压缩率: ${compressionRatio}%`);
            return outputPath;
        }
        catch (error) {
            this.logger.error(`视频压缩失败: ${error.message}`);
            throw error;
        }
    }
    async normalizeResolution(inputPath, outputPath, width = 1024, height = 576) {
        this.logger.log(`统一视频分辨率: ${width}x${height}`);
        try {
            const command = `${this.ffmpegPath} -i "${inputPath}" -vf "scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2" -c:a copy "${outputPath}"`;
            await execAsync(command);
            return outputPath;
        }
        catch (error) {
            this.logger.error(`统一分辨率失败: ${error.message}`);
            throw error;
        }
    }
    async addFadeEffect(inputPath, outputPath, fadeInDuration = 0.5, fadeOutDuration = 0.5) {
        this.logger.log(`添加淡入淡出效果`);
        try {
            const duration = await this.getVideoDuration(inputPath);
            const fadeOutStart = duration - fadeOutDuration;
            const command = `${this.ffmpegPath} -i "${inputPath}" -vf "fade=t=in:st=0:d=${fadeInDuration},fade=t=out:st=${fadeOutStart}:d=${fadeOutDuration}" -c:a copy "${outputPath}"`;
            await execAsync(command);
            return outputPath;
        }
        catch (error) {
            this.logger.error(`添加淡入淡出失败: ${error.message}`);
            throw error;
        }
    }
    async getVideoDuration(videoPath) {
        try {
            const command = `${this.ffmpegPath} -i "${videoPath}" 2>&1 | grep "Duration"`;
            const { stdout } = await execAsync(command);
            const match = stdout.match(/Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})/);
            if (match) {
                const hours = parseInt(match[1]);
                const minutes = parseInt(match[2]);
                const seconds = parseFloat(match[3]);
                return hours * 3600 + minutes * 60 + seconds;
            }
            return 0;
        }
        catch (error) {
            this.logger.error(`获取视频时长失败: ${error.message}`);
            return 0;
        }
    }
    async checkFFmpegAvailability() {
        try {
            const { stdout } = await execAsync(`${this.ffmpegPath} -version`);
            this.logger.log(`FFmpeg版本: ${stdout.split('\n')[0]}`);
            return true;
        }
        catch (error) {
            this.logger.error(`FFmpeg不可用: ${error.message}`);
            return false;
        }
    }
    async createTitleVideo(title, duration, outputPath, options) {
        const width = options?.width || 1920;
        const height = options?.height || 1080;
        const fontSize = options?.fontSize || 60;
        const fontColor = options?.fontColor || 'white';
        const backgroundColor = options?.backgroundColor || 'black';
        this.logger.log(`创建标题视频: ${title}, 时长: ${duration}秒`);
        try {
            const escapedTitle = title.replace(/'/g, "'\\''").replace(/:/g, '\\:');
            const command = `${this.ffmpegPath} -f lavfi -i color=c=${backgroundColor}:s=${width}x${height}:d=${duration} -vf "drawtext=text='${escapedTitle}':fontsize=${fontSize}:fontcolor=${fontColor}:x=(w-text_w)/2:y=(h-text_h)/2" -c:v libx264 -pix_fmt yuv420p "${outputPath}"`;
            await execAsync(command);
            if (!fs.existsSync(outputPath)) {
                throw new Error('标题视频创建失败');
            }
            this.logger.log(`标题视频创建成功: ${outputPath}`);
            return outputPath;
        }
        catch (error) {
            this.logger.error(`创建标题视频失败: ${error.message}`);
            throw error;
        }
    }
    async getVideoMetadata(videoPath) {
        try {
            const command = `${this.ffmpegPath} -i "${videoPath}" -f ffmetadata - 2>&1`;
            const { stdout, stderr } = await execAsync(command);
            const output = stderr + stdout;
            const durationMatch = output.match(/Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})/);
            const resolutionMatch = output.match(/(\d{3,4})x(\d{3,4})/);
            const fpsMatch = output.match(/(\d+(?:\.\d+)?) fps/);
            const bitrateMatch = output.match(/bitrate: (\d+) kb\/s/);
            let duration = 0;
            if (durationMatch) {
                const hours = parseInt(durationMatch[1]);
                const minutes = parseInt(durationMatch[2]);
                const seconds = parseFloat(durationMatch[3]);
                duration = hours * 3600 + minutes * 60 + seconds;
            }
            const width = resolutionMatch ? parseInt(resolutionMatch[1]) : 0;
            const height = resolutionMatch ? parseInt(resolutionMatch[2]) : 0;
            return {
                duration,
                width,
                height,
                resolution: resolutionMatch ? `${resolutionMatch[1]}x${resolutionMatch[2]}` : 'unknown',
                fps: fpsMatch ? parseFloat(fpsMatch[1]) : 0,
                bitrate: bitrateMatch ? parseInt(bitrateMatch[1]) : 0,
                fileSize: fs.existsSync(videoPath) ? fs.statSync(videoPath).size : 0,
                format: path.extname(videoPath).slice(1),
            };
        }
        catch (error) {
            this.logger.error(`获取视频元数据失败: ${error.message}`);
            return {
                duration: 0,
                width: 0,
                height: 0,
                resolution: 'unknown',
                fps: 0,
                bitrate: 0,
                fileSize: 0,
                format: 'unknown',
            };
        }
    }
};
exports.FFmpegService = FFmpegService;
exports.FFmpegService = FFmpegService = FFmpegService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], FFmpegService);


/***/ }),
/* 72 */
/***/ ((module) => {

module.exports = require("util");

/***/ }),
/* 73 */
/***/ ((module) => {

module.exports = require("child_process");

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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VideoGenerationResultDto = exports.VideoGenerationStatusDto = exports.VideoPromptDto = exports.ImagePromptDto = exports.StoryboardScriptDto = exports.StoryboardSceneDto = exports.GenerateVideoDto = void 0;
const class_validator_1 = __webpack_require__(16);
const swagger_1 = __webpack_require__(3);
const class_transformer_1 = __webpack_require__(50);
class GenerateVideoDto {
}
exports.GenerateVideoDto = GenerateVideoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '章节ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateVideoDto.prototype, "chapterId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '是否强制重新生成', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], GenerateVideoDto.prototype, "forceRegenerate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '分镜数量', minimum: 3, maximum: 10, default: 5 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(3),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], GenerateVideoDto.prototype, "sceneCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '视频时长(秒)', minimum: 5, maximum: 30, default: 15 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(5),
    (0, class_validator_1.Max)(30),
    __metadata("design:type", Number)
], GenerateVideoDto.prototype, "videoDuration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '视觉风格', enum: ['realistic', 'anime', 'fantasy', 'scifi', 'ink-painting', 'oil-painting'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateVideoDto.prototype, "visualStyle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '图片分辨率', example: '1024x576' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateVideoDto.prototype, "imageResolution", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '图片质量', enum: ['standard', 'high', 'ultra'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateVideoDto.prototype, "imageQuality", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '采样步数', minimum: 20, maximum: 50 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(20),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], GenerateVideoDto.prototype, "samplingSteps", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'CFG Scale', minimum: 1, maximum: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(20),
    __metadata("design:type", Number)
], GenerateVideoDto.prototype, "cfgScale", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '负向提示词' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateVideoDto.prototype, "negativePrompt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '视频分辨率', example: '1024x576' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateVideoDto.prototype, "videoResolution", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '帧率（FPS）', enum: [24, 30, 60] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], GenerateVideoDto.prototype, "fps", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '运动幅度', enum: ['low', 'medium', 'high'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateVideoDto.prototype, "motionIntensity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '视频质量', enum: ['standard', 'high', 'ultra'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateVideoDto.prototype, "videoQuality", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '压缩级别', enum: ['low', 'medium', 'high'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateVideoDto.prototype, "compressionLevel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '转场效果', enum: ['none', 'fade', 'crossfade', 'slide', 'zoom'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateVideoDto.prototype, "transitionEffect", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '是否添加标题帧', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], GenerateVideoDto.prototype, "addTitleFrame", void 0);
class StoryboardSceneDto {
}
exports.StoryboardSceneDto = StoryboardSceneDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '场景编号' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], StoryboardSceneDto.prototype, "sceneNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '场景描述' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StoryboardSceneDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '出现的角色', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], StoryboardSceneDto.prototype, "characters", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '环境/场景' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StoryboardSceneDto.prototype, "environment", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '预计时长(秒)' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], StoryboardSceneDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '关键情节点' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StoryboardSceneDto.prototype, "keyMoment", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '镜头角度建议' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StoryboardSceneDto.prototype, "cameraAngle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '特殊效果' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StoryboardSceneDto.prototype, "specialEffects", void 0);
class StoryboardScriptDto {
}
exports.StoryboardScriptDto = StoryboardScriptDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '分镜场景列表', type: [StoryboardSceneDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => StoryboardSceneDto),
    __metadata("design:type", Array)
], StoryboardScriptDto.prototype, "scenes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '总时长(秒)' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], StoryboardScriptDto.prototype, "totalDuration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '主要角色列表', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], StoryboardScriptDto.prototype, "mainCharacters", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '场景总结' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StoryboardScriptDto.prototype, "summary", void 0);
class ImagePromptDto {
}
exports.ImagePromptDto = ImagePromptDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '场景编号' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ImagePromptDto.prototype, "sceneNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '正向提示词' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImagePromptDto.prototype, "positivePrompt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '负向提示词' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImagePromptDto.prototype, "negativePrompt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '图片尺寸', example: '1024x576' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImagePromptDto.prototype, "size", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '种子值' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ImagePromptDto.prototype, "seed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '一致性参考图URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImagePromptDto.prototype, "referenceImageUrl", void 0);
class VideoPromptDto {
}
exports.VideoPromptDto = VideoPromptDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '场景编号' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], VideoPromptDto.prototype, "sceneNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '运动提示词' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VideoPromptDto.prototype, "motionPrompt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '视频时长(秒)' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], VideoPromptDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '运动幅度', enum: ['low', 'medium', 'high'], default: 'medium' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VideoPromptDto.prototype, "motionIntensity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '人物一致性ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VideoPromptDto.prototype, "characterConsistencyId", void 0);
class VideoGenerationStatusDto {
}
exports.VideoGenerationStatusDto = VideoGenerationStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '章节ID' }),
    __metadata("design:type", String)
], VideoGenerationStatusDto.prototype, "chapterId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '当前状态', enum: ['PENDING', 'GENERATING', 'COMPLETED', 'FAILED', 'CANCELLED'] }),
    __metadata("design:type", String)
], VideoGenerationStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '当前阶段', enum: ['SCRIPT', 'IMAGE', 'VIDEO', 'MERGE', 'UPLOAD', 'COMPLETED'] }),
    __metadata("design:type", String)
], VideoGenerationStatusDto.prototype, "stage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '进度百分比', minimum: 0, maximum: 100 }),
    __metadata("design:type", Number)
], VideoGenerationStatusDto.prototype, "progress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '视频URL' }),
    __metadata("design:type", String)
], VideoGenerationStatusDto.prototype, "videoUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '错误信息' }),
    __metadata("design:type", String)
], VideoGenerationStatusDto.prototype, "errorMessage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '预计剩余时间(秒)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], VideoGenerationStatusDto.prototype, "estimatedTimeRemaining", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '已生成的图片URL列表', type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], VideoGenerationStatusDto.prototype, "generatedImages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '开始时间' }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], VideoGenerationStatusDto.prototype, "startedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '完成时间' }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], VideoGenerationStatusDto.prototype, "completedAt", void 0);
class VideoGenerationResultDto {
}
exports.VideoGenerationResultDto = VideoGenerationResultDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '章节ID' }),
    __metadata("design:type", String)
], VideoGenerationResultDto.prototype, "chapterId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '视频URL' }),
    __metadata("design:type", String)
], VideoGenerationResultDto.prototype, "videoUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '视频元数据' }),
    __metadata("design:type", Object)
], VideoGenerationResultDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '生成的图片URL列表', type: [String] }),
    __metadata("design:type", Array)
], VideoGenerationResultDto.prototype, "generatedImages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '分镜脚本' }),
    __metadata("design:type", StoryboardScriptDto)
], VideoGenerationResultDto.prototype, "storyboardScript", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '总耗时(秒)' }),
    __metadata("design:type", Number)
], VideoGenerationResultDto.prototype, "totalDuration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '完成时间' }),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], VideoGenerationResultDto.prototype, "completedAt", void 0);


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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BatchVideoGenerationController = void 0;
const common_1 = __webpack_require__(2);
const swagger_1 = __webpack_require__(3);
const common_2 = __webpack_require__(28);
const batch_video_generation_service_1 = __webpack_require__(76);
const long_video_merger_service_1 = __webpack_require__(79);
const batch_video_generation_dto_1 = __webpack_require__(80);
let BatchVideoGenerationController = class BatchVideoGenerationController {
    constructor(batchVideoService, videoMergerService) {
        this.batchVideoService = batchVideoService;
        this.videoMergerService = videoMergerService;
    }
    async batchGenerateByChapters(req, dto) {
        const userId = req.user.userId || req.user.id;
        return this.batchVideoService.batchGenerateByChapters(userId, dto.novelId, dto.chapterIds, dto.options);
    }
    async smartGenerate(req, dto) {
        const userId = req.user.userId || req.user.id;
        return this.batchVideoService.smartGenerateForTargetDuration(userId, dto.novelId, dto.startChapter, dto.targetDuration, dto.options);
    }
    async getBatchStatus(batchId) {
        return this.batchVideoService.getBatchStatus(batchId);
    }
    async cancelBatch(batchId) {
        return this.batchVideoService.cancelBatch(batchId);
    }
    async mergeBatchVideos(batchId, dto) {
        return this.videoMergerService.mergeBatchVideos(batchId, dto.options);
    }
    async getMergeStatus(batchId) {
        return this.videoMergerService.getMergeStatus(batchId);
    }
};
exports.BatchVideoGenerationController = BatchVideoGenerationController;
__decorate([
    (0, common_1.Post)('generate-by-chapters'),
    (0, common_2.RequireFeature)('videoGeneration'),
    (0, common_2.RequireQuota)('daily'),
    (0, swagger_1.ApiOperation)({
        summary: '批量生成指定章节的视频',
        description: '用户手动选择多个章节，系统批量生成视频并可选合并为长视频'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '批量任务已提交',
        schema: {
            example: {
                batchId: 'batch-xxx',
                totalChapters: 3,
                estimatedDuration: 45,
                estimatedScenes: 15,
                jobs: [
                    { chapterId: 'ch-1', jobId: 'job-1' },
                    { chapterId: 'ch-2', jobId: 'job-2' },
                    { chapterId: 'ch-3', jobId: 'job-3' }
                ],
                message: '已提交3个章节的视频生成任务，预计总时长0.8分钟'
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数错误' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '无权限或配额不足' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '章节不存在' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_c = typeof batch_video_generation_dto_1.BatchGenerateByChaptersDto !== "undefined" && batch_video_generation_dto_1.BatchGenerateByChaptersDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], BatchVideoGenerationController.prototype, "batchGenerateByChapters", null);
__decorate([
    (0, common_1.Post)('smart-generate'),
    (0, common_2.RequireFeature)('videoGeneration'),
    (0, common_2.RequireQuota)('daily'),
    (0, swagger_1.ApiOperation)({
        summary: 'AI智能规划生成目标时长视频',
        description: 'AI自动计算需要多少章节才能生成指定时长（如5-10分钟）的视频'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'AI规划任务已提交',
        schema: {
            example: {
                batchId: 'batch-xxx',
                recommendedChapters: [1, 2, 3, 4, 5],
                totalChapters: 5,
                estimatedDuration: 600,
                estimatedScenes: 25,
                breakdown: [
                    {
                        chapterNumber: 1,
                        chapterTitle: '第一章 开端',
                        wordCount: 2000,
                        estimatedScenes: 5,
                        estimatedDuration: 120,
                        aiReasoning: '包含2个重要场景转换和1个对话场景'
                    }
                ],
                reasoning: '根据智能分析，推荐使用第1-5章（共5章）生成视频...',
                jobs: []
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数错误' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '无权限或配额不足' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '章节不存在' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_d = typeof batch_video_generation_dto_1.SmartGenerateVideoDto !== "undefined" && batch_video_generation_dto_1.SmartGenerateVideoDto) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], BatchVideoGenerationController.prototype, "smartGenerate", null);
__decorate([
    (0, common_1.Get)('status/:batchId'),
    (0, swagger_1.ApiOperation)({ summary: '查询批量生成状态' }),
    (0, swagger_1.ApiParam)({ name: 'batchId', description: '批次ID', example: 'batch-xxx' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '返回批量生成状态',
        schema: {
            example: {
                batchId: 'batch-xxx',
                status: 'PROCESSING',
                totalChapters: 5,
                completedChapters: 3,
                failedChapters: 0,
                processingChapters: 2,
                progress: 60,
                estimatedDuration: 600,
                actualDuration: 580,
                chapters: [
                    {
                        chapterId: 'ch-1',
                        chapterNumber: 1,
                        status: 'COMPLETED',
                        videoUrl: 'https://cdn.example.com/ch-1.mp4'
                    }
                ],
                mergedVideoUrl: 'https://cdn.example.com/merged-video.mp4'
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '批次不存在' }),
    __param(0, (0, common_1.Param)('batchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BatchVideoGenerationController.prototype, "getBatchStatus", null);
__decorate([
    (0, common_1.Post)('cancel/:batchId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '取消批量生成任务' }),
    (0, swagger_1.ApiParam)({ name: 'batchId', description: '批次ID', example: 'batch-xxx' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '任务已取消',
        schema: {
            example: {
                message: '已取消批量任务，共取消3个待处理任务'
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '批次不存在' }),
    __param(0, (0, common_1.Param)('batchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BatchVideoGenerationController.prototype, "cancelBatch", null);
__decorate([
    (0, common_1.Post)('merge/:batchId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '合并批量生成的视频为一个长视频',
        description: '将多个章节的短视频合并为一个完整的长视频，可添加片头片尾和章节标题'
    }),
    (0, swagger_1.ApiParam)({ name: 'batchId', description: '批次ID', example: 'batch-xxx' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '视频合并成功',
        schema: {
            example: {
                mergedVideoUrl: 'https://cdn.example.com/merged-final.mp4',
                totalDuration: 620,
                fileSize: 125000000,
                resolution: '1920x1080',
                chapterCount: 5
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数错误' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '批次不存在' }),
    __param(0, (0, common_1.Param)('batchId')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_e = typeof batch_video_generation_dto_1.MergeBatchVideosDto !== "undefined" && batch_video_generation_dto_1.MergeBatchVideosDto) === "function" ? _e : Object]),
    __metadata("design:returntype", Promise)
], BatchVideoGenerationController.prototype, "mergeBatchVideos", null);
__decorate([
    (0, common_1.Get)('merge/status/:batchId'),
    (0, swagger_1.ApiOperation)({ summary: '查询长视频合成状态' }),
    (0, swagger_1.ApiParam)({ name: 'batchId', description: '批次ID', example: 'batch-xxx' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '返回合成状态',
        schema: {
            example: {
                status: 'COMPLETED',
                progress: 100,
                mergedVideoUrl: 'https://cdn.example.com/merged-final.mp4'
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '批次不存在' }),
    __param(0, (0, common_1.Param)('batchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BatchVideoGenerationController.prototype, "getMergeStatus", null);
exports.BatchVideoGenerationController = BatchVideoGenerationController = __decorate([
    (0, swagger_1.ApiTags)('批量视频生成'),
    (0, common_1.Controller)('batch'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard, common_2.PackageFeatureGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [typeof (_a = typeof batch_video_generation_service_1.BatchVideoGenerationService !== "undefined" && batch_video_generation_service_1.BatchVideoGenerationService) === "function" ? _a : Object, typeof (_b = typeof long_video_merger_service_1.LongVideoMergerService !== "undefined" && long_video_merger_service_1.LongVideoMergerService) === "function" ? _b : Object])
], BatchVideoGenerationController);


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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var BatchVideoGenerationService_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BatchVideoGenerationService = void 0;
const common_1 = __webpack_require__(2);
const bull_1 = __webpack_require__(60);
const bull_2 = __webpack_require__(77);
const database_1 = __webpack_require__(9);
const video_duration_calculator_service_1 = __webpack_require__(78);
let BatchVideoGenerationService = BatchVideoGenerationService_1 = class BatchVideoGenerationService {
    constructor(prisma, durationCalculator, videoQueue) {
        this.prisma = prisma;
        this.durationCalculator = durationCalculator;
        this.videoQueue = videoQueue;
        this.logger = new common_1.Logger(BatchVideoGenerationService_1.name);
    }
    async batchGenerateByChapters(userId, novelId, chapterIds, options) {
        this.logger.log(`批量生成视频，章节数: ${chapterIds.length}`);
        await this.validateChapters(novelId, userId, chapterIds);
        const estimation = await this.durationCalculator.quickEstimate(novelId, chapterIds);
        const batch = await this.prisma.videoBatchGeneration.create({
            data: {
                novelId,
                userId,
                chapterIds,
                totalChapters: chapterIds.length,
                estimatedDuration: estimation.totalDuration,
                estimatedScenes: estimation.totalScenes,
                status: 'PENDING',
                mergeIntoOne: options?.mergeIntoOne || false,
                settings: options?.videoSettings || {},
            },
        });
        const jobs = [];
        const parallelTasks = options?.parallelTasks || 2;
        for (let i = 0; i < chapterIds.length; i++) {
            const chapterId = chapterIds[i];
            const job = await this.videoQueue.add('generate-chapter-video', {
                userId,
                chapterId,
                batchId: batch.id,
                sceneCount: options?.videoSettings?.sceneCount,
                videoDuration: options?.videoSettings?.videoDuration,
            }, {
                priority: i + 1,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
                jobId: `batch-${batch.id}-chapter-${chapterId}`,
            });
            jobs.push({
                chapterId,
                jobId: job.id.toString(),
            });
            if (i < chapterIds.length - 1) {
                await this.delay(100);
            }
        }
        await this.prisma.videoBatchGeneration.update({
            where: { id: batch.id },
            data: {
                status: 'PROCESSING',
                startedAt: new Date(),
            },
        });
        return {
            batchId: batch.id,
            totalChapters: chapterIds.length,
            estimatedDuration: estimation.totalDuration,
            estimatedScenes: estimation.totalScenes,
            jobs,
            message: `已提交${chapterIds.length}个章节的视频生成任务，预计总时长${(estimation.totalDuration / 60).toFixed(1)}分钟`,
        };
    }
    async smartGenerateForTargetDuration(userId, novelId, startChapter, targetDuration, options) {
        this.logger.log(`智能规划视频生成，目标时长: ${targetDuration}秒`);
        const novel = await this.prisma.novel.findFirst({
            where: { id: novelId, userId },
        });
        if (!novel) {
            throw new Error('小说不存在或无权访问');
        }
        const calculation = await this.durationCalculator.calculateChapterGroupForTargetDuration(novelId, startChapter, targetDuration, options?.maxChapters);
        const chapters = await this.prisma.chapter.findMany({
            where: {
                novelId,
                chapterNumber: { in: calculation.recommendedChapters },
            },
            select: { id: true, chapterNumber: true },
            orderBy: { chapterNumber: 'asc' },
        });
        const chapterIds = chapters.map(c => c.id);
        const batch = await this.prisma.videoBatchGeneration.create({
            data: {
                novelId,
                userId,
                chapterIds,
                totalChapters: chapters.length,
                estimatedDuration: calculation.totalDuration,
                estimatedScenes: calculation.totalScenes,
                status: 'PENDING',
                mergeIntoOne: options?.autoMerge !== false,
                settings: {
                    ...options?.videoSettings,
                    targetDuration,
                    aiPlanned: true,
                },
                aiReasoning: calculation.reasoning,
            },
        });
        const jobs = [];
        for (const chapter of chapters) {
            const job = await this.videoQueue.add('generate-chapter-video', {
                userId,
                chapterId: chapter.id,
                batchId: batch.id,
                ...options?.videoSettings,
            }, {
                priority: chapter.chapterNumber,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
                jobId: `smart-batch-${batch.id}-chapter-${chapter.id}`,
            });
            jobs.push({
                chapterId: chapter.id,
                chapterNumber: chapter.chapterNumber,
                jobId: job.id.toString(),
            });
        }
        await this.prisma.videoBatchGeneration.update({
            where: { id: batch.id },
            data: {
                status: 'PROCESSING',
                startedAt: new Date(),
            },
        });
        return {
            batchId: batch.id,
            recommendedChapters: calculation.recommendedChapters,
            totalChapters: chapters.length,
            estimatedDuration: calculation.totalDuration,
            estimatedScenes: calculation.totalScenes,
            breakdown: calculation.breakdown,
            reasoning: calculation.reasoning,
            jobs,
        };
    }
    async getBatchStatus(batchId) {
        const batch = await this.prisma.videoBatchGeneration.findUnique({
            where: { id: batchId },
            include: {
                novel: {
                    include: {
                        chapters: {
                            where: {
                                id: { in: [] },
                            },
                            select: {
                                id: true,
                                chapterNumber: true,
                                videoStatus: true,
                                videoUrl: true,
                            },
                        },
                    },
                },
            },
        });
        if (!batch) {
            throw new Error('批量任务不存在');
        }
        const chapters = await this.prisma.chapter.findMany({
            where: { id: { in: batch.chapterIds } },
            select: {
                id: true,
                chapterNumber: true,
                videoStatus: true,
                videoUrl: true,
                videoGenerationLog: true,
            },
            orderBy: { chapterNumber: 'asc' },
        });
        const chapterStatus = chapters.map(chapter => ({
            chapterId: chapter.id,
            chapterNumber: chapter.chapterNumber,
            status: chapter.videoStatus || 'PENDING',
            videoUrl: chapter.videoUrl || undefined,
            errorMessage: chapter.videoGenerationLog ? String(chapter.videoGenerationLog) : undefined,
        }));
        const completedChapters = chapterStatus.filter(c => c.status === 'COMPLETED').length;
        const failedChapters = chapterStatus.filter(c => c.status === 'FAILED').length;
        const processingChapters = chapterStatus.filter(c => c.status === 'GENERATING').length;
        const progress = Math.floor((completedChapters / batch.totalChapters) * 100);
        return {
            batchId: batch.id,
            status: batch.status,
            totalChapters: batch.totalChapters,
            completedChapters,
            failedChapters,
            processingChapters,
            progress,
            estimatedDuration: batch.estimatedDuration,
            actualDuration: batch.actualDuration || undefined,
            chapters: chapterStatus,
            mergedVideoUrl: batch.mergedVideoUrl || undefined,
        };
    }
    async cancelBatch(batchId) {
        await this.prisma.videoBatchGeneration.update({
            where: { id: batchId },
            data: { status: 'CANCELLED' },
        });
        const jobs = await this.videoQueue.getJobs(['waiting', 'delayed', 'active']);
        const batchJobs = jobs.filter(job => job.data.batchId === batchId);
        for (const job of batchJobs) {
            await job.remove();
        }
        return {
            message: `已取消批量任务，共取消${batchJobs.length}个待处理任务`,
        };
    }
    async validateChapters(novelId, userId, chapterIds) {
        const novel = await this.prisma.novel.findFirst({
            where: { id: novelId, userId },
        });
        if (!novel) {
            throw new Error('小说不存在或无权访问');
        }
        const chapters = await this.prisma.chapter.findMany({
            where: {
                id: { in: chapterIds },
                novelId,
            },
        });
        if (chapters.length !== chapterIds.length) {
            throw new Error('部分章节不存在或不属于该小说');
        }
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
exports.BatchVideoGenerationService = BatchVideoGenerationService;
exports.BatchVideoGenerationService = BatchVideoGenerationService = BatchVideoGenerationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, bull_1.InjectQueue)('video-generation')),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof video_duration_calculator_service_1.VideoDurationCalculatorService !== "undefined" && video_duration_calculator_service_1.VideoDurationCalculatorService) === "function" ? _b : Object, typeof (_c = typeof bull_2.Queue !== "undefined" && bull_2.Queue) === "function" ? _c : Object])
], BatchVideoGenerationService);


/***/ }),
/* 77 */
/***/ ((module) => {

module.exports = require("bull");

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
var VideoDurationCalculatorService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VideoDurationCalculatorService = void 0;
const common_1 = __webpack_require__(2);
const database_1 = __webpack_require__(9);
const ai_caller_service_1 = __webpack_require__(17);
let VideoDurationCalculatorService = VideoDurationCalculatorService_1 = class VideoDurationCalculatorService {
    constructor(prisma, aiCaller) {
        this.prisma = prisma;
        this.aiCaller = aiCaller;
        this.logger = new common_1.Logger(VideoDurationCalculatorService_1.name);
        this.AVG_WORDS_PER_SECOND = 4;
        this.AVG_SCENE_DURATION = 3;
        this.MIN_SCENES_PER_CHAPTER = 3;
        this.MAX_SCENES_PER_CHAPTER = 8;
    }
    async calculateChapterGroupForTargetDuration(novelId, startChapter, targetDuration, maxChapters) {
        this.logger.log(`计算视频时长，小说ID: ${novelId}, 目标时长: ${targetDuration}秒`);
        const maxChaptersToCheck = maxChapters || 10;
        const chapters = await this.prisma.chapter.findMany({
            where: {
                novelId,
                chapterNumber: {
                    gte: startChapter,
                    lte: startChapter + maxChaptersToCheck - 1,
                },
            },
            orderBy: { chapterNumber: 'asc' },
            select: {
                id: true,
                chapterNumber: true,
                title: true,
                content: true,
                wordCount: true,
            },
        });
        if (chapters.length === 0) {
            throw new Error('没有找到可用的章节');
        }
        const breakdown = [];
        let accumulatedDuration = 0;
        let selectedChapters = [];
        for (const chapter of chapters) {
            const estimatedScenesByWords = Math.ceil(chapter.wordCount / (this.AVG_WORDS_PER_SECOND * this.AVG_SCENE_DURATION * 50));
            const aiEstimation = await this.analyzeChapterForSceneCount(chapter.content);
            const estimatedScenes = Math.max(this.MIN_SCENES_PER_CHAPTER, Math.min(this.MAX_SCENES_PER_CHAPTER, Math.round((estimatedScenesByWords + aiEstimation.sceneCount) / 2)));
            const estimatedDuration = estimatedScenes * this.AVG_SCENE_DURATION;
            breakdown.push({
                chapterNumber: chapter.chapterNumber,
                chapterTitle: chapter.title,
                wordCount: chapter.wordCount,
                estimatedScenes,
                estimatedDuration,
                aiReasoning: aiEstimation.reasoning,
            });
            accumulatedDuration += estimatedDuration;
            selectedChapters.push(chapter.chapterNumber);
            if (accumulatedDuration >= targetDuration) {
                break;
            }
        }
        const reasoning = this.generateReasoning(selectedChapters, accumulatedDuration, targetDuration, breakdown);
        return {
            recommendedChapters: selectedChapters,
            totalDuration: accumulatedDuration,
            totalScenes: breakdown.reduce((sum, b) => sum + b.estimatedScenes, 0),
            breakdown,
            reasoning,
        };
    }
    async analyzeChapterForSceneCount(content) {
        const contentPreview = content.length > 2000
            ? content.substring(0, 2000) + '...'
            : content;
        const prompt = `
请分析以下章节内容，估算需要多少个分镜场景才能完整呈现这个章节。

【章节内容】
${contentPreview}

【评估标准】
- 每个关键场景转换需要1个分镜
- 每个主要情节点需要1个分镜
- 重要的对话场景需要1个分镜
- 动作场景可能需要2-3个分镜
- 环境描写需要1个分镜

【限制】
- 最少3个分镜
- 最多8个分镜
- 优先选择最关键、最有视觉冲击力的场景

请以JSON格式返回：
{
  "sceneCount": 5,
  "reasoning": "简要说明为什么需要这么多分镜"
}
`;
        try {
            const response = await this.aiCaller.callAI({
                userId: 'system',
                messages: [
                    {
                        role: 'system',
                        content: '你是一个专业的视频分镜规划专家，擅长分析文本内容并规划视频分镜。',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                parameters: {
                    temperature: 0.3,
                    maxTokens: 500,
                },
            });
            const jsonMatch = response.content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0]);
                return {
                    sceneCount: Math.max(this.MIN_SCENES_PER_CHAPTER, Math.min(this.MAX_SCENES_PER_CHAPTER, result.sceneCount)),
                    reasoning: result.reasoning || '基于AI分析',
                };
            }
        }
        catch (error) {
            this.logger.warn(`AI分析章节分镜数失败: ${error.message}`);
        }
        return {
            sceneCount: this.MIN_SCENES_PER_CHAPTER,
            reasoning: '使用默认估算',
        };
    }
    generateReasoning(selectedChapters, totalDuration, targetDuration, breakdown) {
        const chapterCount = selectedChapters.length;
        const totalScenes = breakdown.reduce((sum, b) => sum + b.estimatedScenes, 0);
        const avgScenesPerChapter = (totalScenes / chapterCount).toFixed(1);
        let reasoning = `根据智能分析，推荐使用第${selectedChapters[0]}-${selectedChapters[selectedChapters.length - 1]}章（共${chapterCount}章）生成视频。\n\n`;
        reasoning += `预估信息：\n`;
        reasoning += `- 总分镜数：${totalScenes}个\n`;
        reasoning += `- 预估总时长：${totalDuration}秒（约${(totalDuration / 60).toFixed(1)}分钟）\n`;
        reasoning += `- 平均每章：${avgScenesPerChapter}个分镜\n\n`;
        if (totalDuration < targetDuration * 0.8) {
            reasoning += `⚠️ 注意：预估时长略低于目标时长${(targetDuration / 60).toFixed(1)}分钟，但已达到${(totalDuration / targetDuration * 100).toFixed(0)}%。\n`;
        }
        else if (totalDuration > targetDuration * 1.2) {
            reasoning += `⚠️ 注意：预估时长略高于目标时长${(targetDuration / 60).toFixed(1)}分钟，达到${(totalDuration / targetDuration * 100).toFixed(0)}%。\n`;
        }
        else {
            reasoning += `✅ 预估时长符合目标（目标：${(targetDuration / 60).toFixed(1)}分钟）。\n`;
        }
        return reasoning;
    }
    async quickEstimate(novelId, chapterIds) {
        const chapters = await this.prisma.chapter.findMany({
            where: { id: { in: chapterIds } },
            select: {
                id: true,
                chapterNumber: true,
                wordCount: true,
            },
        });
        const perChapter = chapters.map(chapter => {
            const estimatedScenes = Math.max(this.MIN_SCENES_PER_CHAPTER, Math.min(this.MAX_SCENES_PER_CHAPTER, Math.ceil(chapter.wordCount / 600)));
            return {
                chapterId: chapter.id,
                chapterNumber: chapter.chapterNumber,
                estimatedScenes,
                estimatedDuration: estimatedScenes * this.AVG_SCENE_DURATION,
            };
        });
        return {
            totalDuration: perChapter.reduce((sum, c) => sum + c.estimatedDuration, 0),
            totalScenes: perChapter.reduce((sum, c) => sum + c.estimatedScenes, 0),
            perChapter,
        };
    }
    calculateMergedVideoDuration(chapterVideos) {
        const transitionDuration = 0.3;
        const totalContentDuration = chapterVideos.reduce((sum, v) => sum + v.duration, 0);
        const totalTransitionDuration = (chapterVideos.length - 1) * transitionDuration;
        const titleDuration = 2;
        return totalContentDuration + totalTransitionDuration + titleDuration;
    }
};
exports.VideoDurationCalculatorService = VideoDurationCalculatorService;
exports.VideoDurationCalculatorService = VideoDurationCalculatorService = VideoDurationCalculatorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof ai_caller_service_1.AICallerService !== "undefined" && ai_caller_service_1.AICallerService) === "function" ? _b : Object])
], VideoDurationCalculatorService);


/***/ }),
/* 79 */
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
var LongVideoMergerService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LongVideoMergerService = void 0;
const common_1 = __webpack_require__(2);
const database_1 = __webpack_require__(9);
const ffmpeg_service_1 = __webpack_require__(71);
const path = __webpack_require__(68);
const fs = __webpack_require__(67);
let LongVideoMergerService = LongVideoMergerService_1 = class LongVideoMergerService {
    constructor(prisma, ffmpegService) {
        this.prisma = prisma;
        this.ffmpegService = ffmpegService;
        this.logger = new common_1.Logger(LongVideoMergerService_1.name);
        this.videoStoragePath = process.env.VIDEO_STORAGE_PATH || '/data/videos';
        if (!fs.existsSync(this.videoStoragePath)) {
            fs.mkdirSync(this.videoStoragePath, { recursive: true });
        }
    }
    async mergeBatchVideos(batchId, options) {
        this.logger.log(`开始合并批量视频，批次ID: ${batchId}`);
        const batch = await this.prisma.videoBatchGeneration.findUnique({
            where: { id: batchId },
        });
        if (!batch) {
            throw new Error('批量任务不存在');
        }
        if (batch.status !== 'COMPLETED' && batch.status !== 'PROCESSING') {
            throw new Error(`批量任务状态为${batch.status}，无法合并视频`);
        }
        const chapters = await this.prisma.chapter.findMany({
            where: {
                id: { in: batch.chapterIds },
                videoStatus: 'COMPLETED',
            },
            select: {
                id: true,
                chapterNumber: true,
                title: true,
                videoUrl: true,
                videoMetadata: true,
            },
            orderBy: { chapterNumber: 'asc' },
        });
        if (chapters.length === 0) {
            throw new Error('没有已完成的章节视频');
        }
        this.logger.log(`找到${chapters.length}个已完成的章节视频`);
        const videoSegments = [];
        const defaultTitleDuration = options?.titleDuration || 2;
        const defaultTransitionDuration = options?.transitionDuration || 0.3;
        for (let i = 0; i < chapters.length; i++) {
            const chapter = chapters[i];
            if (options?.addChapterTitles !== false) {
                videoSegments.push({
                    type: 'chapter-title',
                    title: `第${chapter.chapterNumber}章 ${chapter.title}`,
                    duration: defaultTitleDuration,
                });
            }
            const videoPath = this.convertUrlToPath(chapter.videoUrl);
            if (!fs.existsSync(videoPath)) {
                this.logger.warn(`章节${chapter.chapterNumber}的视频文件不存在: ${videoPath}`);
                continue;
            }
            videoSegments.push({
                type: 'video',
                path: videoPath,
            });
            if (i < chapters.length - 1) {
                videoSegments.push({
                    type: 'transition',
                    duration: defaultTransitionDuration,
                });
            }
        }
        const tempVideos = [];
        for (let i = 0; i < videoSegments.length; i++) {
            const segment = videoSegments[i];
            if (segment.type === 'chapter-title') {
                const titleVideoPath = path.join(this.videoStoragePath, `${batchId}-title-${i}.mp4`);
                await this.ffmpegService.createTitleVideo(segment.title, segment.duration, titleVideoPath, { width: 1920, height: 1080 });
                tempVideos.push(titleVideoPath);
            }
            else if (segment.type === 'video') {
                tempVideos.push(segment.path);
            }
        }
        const mergedPath = path.join(this.videoStoragePath, `${batchId}-merged.mp4`);
        await this.ffmpegService.mergeVideosWithTransitions(tempVideos, mergedPath, options?.transitionDuration || 0.3);
        let finalPath = mergedPath;
        if (options?.addOpening) {
            const withOpeningPath = path.join(this.videoStoragePath, `${batchId}-with-opening.mp4`);
            await this.addOpening(mergedPath, withOpeningPath, batch.novelId);
            finalPath = withOpeningPath;
        }
        if (options?.addEnding) {
            const withEndingPath = path.join(this.videoStoragePath, `${batchId}-with-ending.mp4`);
            await this.addEnding(finalPath, withEndingPath);
            finalPath = withEndingPath;
        }
        const compressedPath = path.join(this.videoStoragePath, `${batchId}-final.mp4`);
        await this.ffmpegService.compressVideo(finalPath, compressedPath, options?.quality || 'medium');
        const metadata = await this.ffmpegService.getVideoMetadata(compressedPath);
        const videoUrl = this.getVideoUrl(compressedPath);
        const fileStats = fs.statSync(compressedPath);
        const fileSize = fileStats.size;
        await this.prisma.videoBatchGeneration.update({
            where: { id: batchId },
            data: {
                status: 'COMPLETED',
                mergedVideoUrl: videoUrl,
                actualDuration: metadata.duration,
                completedAt: new Date(),
            },
        });
        this.cleanupTempFiles([
            ...tempVideos.filter(p => p.includes(batchId)),
            mergedPath,
            ...(options?.addOpening ? [finalPath] : []),
        ]);
        this.logger.log(`长视频合成完成: ${videoUrl}, 时长: ${metadata.duration}秒`);
        return {
            mergedVideoUrl: videoUrl,
            totalDuration: metadata.duration,
            fileSize,
            resolution: `${metadata.width}x${metadata.height}`,
            chapterCount: chapters.length,
        };
    }
    async addOpening(inputPath, outputPath, novelId) {
        const novel = await this.prisma.novel.findUnique({
            where: { id: novelId },
            select: { title: true, description: true },
        });
        const openingPath = path.join(this.videoStoragePath, `opening-${novelId}.mp4`);
        const openingText = `
《${novel?.title || '未知小说'}》

${novel?.description?.substring(0, 100) || ''}

————————————————
`;
        await this.ffmpegService.createTitleVideo(openingText, 5, openingPath, { width: 1920, height: 1080, fontSize: 48 });
        await this.ffmpegService.mergeVideosWithTransitions([openingPath, inputPath], outputPath, 0.5);
        if (fs.existsSync(openingPath)) {
            fs.unlinkSync(openingPath);
        }
    }
    async addEnding(inputPath, outputPath) {
        const endingPath = path.join(this.videoStoragePath, `ending-${Date.now()}.mp4`);
        const endingText = `
————————————————

感谢观看

更多精彩内容，敬请期待
`;
        await this.ffmpegService.createTitleVideo(endingText, 3, endingPath, { width: 1920, height: 1080, fontSize: 40 });
        await this.ffmpegService.mergeVideosWithTransitions([inputPath, endingPath], outputPath, 0.5);
        if (fs.existsSync(endingPath)) {
            fs.unlinkSync(endingPath);
        }
    }
    convertUrlToPath(url) {
        const filename = path.basename(url);
        return path.join(this.videoStoragePath, filename);
    }
    getVideoUrl(localPath) {
        const cdnUrl = process.env.VIDEO_CDN_URL || 'http://localhost:3000/videos';
        const filename = path.basename(localPath);
        return `${cdnUrl}/${filename}`;
    }
    cleanupTempFiles(files) {
        files.forEach(file => {
            try {
                if (fs.existsSync(file)) {
                    fs.unlinkSync(file);
                    this.logger.debug(`已删除临时文件: ${file}`);
                }
            }
            catch (error) {
                this.logger.warn(`删除临时文件失败: ${file}`, error.message);
            }
        });
    }
    async getMergeStatus(batchId) {
        const batch = await this.prisma.videoBatchGeneration.findUnique({
            where: { id: batchId },
            select: {
                status: true,
                mergedVideoUrl: true,
            },
        });
        if (!batch) {
            throw new Error('批量任务不存在');
        }
        let progress = 0;
        if (batch.status === 'COMPLETED')
            progress = 100;
        else if (batch.status === 'PROCESSING')
            progress = 50;
        else if (batch.status === 'FAILED')
            progress = 0;
        return {
            status: batch.status,
            progress,
            mergedVideoUrl: batch.mergedVideoUrl || undefined,
        };
    }
};
exports.LongVideoMergerService = LongVideoMergerService;
exports.LongVideoMergerService = LongVideoMergerService = LongVideoMergerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof ffmpeg_service_1.FFmpegService !== "undefined" && ffmpeg_service_1.FFmpegService) === "function" ? _b : Object])
], LongVideoMergerService);


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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MergeBatchVideosDto = exports.VideoMergeOptionsDto = exports.SmartGenerateVideoDto = exports.SmartGenerationOptionsDto = exports.BatchGenerateByChaptersDto = exports.BatchGenerationOptionsDto = exports.VideoSettingsDto = void 0;
const swagger_1 = __webpack_require__(3);
const class_validator_1 = __webpack_require__(16);
const class_transformer_1 = __webpack_require__(50);
class VideoSettingsDto {
}
exports.VideoSettingsDto = VideoSettingsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '每章分镜数',
        example: 5,
        minimum: 3,
        maximum: 8,
        default: 5
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: '分镜数必须是数字' }),
    (0, class_validator_1.Min)(3, { message: '分镜数最少3个' }),
    (0, class_validator_1.Max)(8, { message: '分镜数最多8个' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], VideoSettingsDto.prototype, "sceneCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '每章预期时长(秒)',
        example: 15,
        minimum: 5,
        maximum: 30,
        default: 15
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: '时长必须是数字' }),
    (0, class_validator_1.Min)(5, { message: '时长最少5秒' }),
    (0, class_validator_1.Max)(30, { message: '时长最多30秒' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], VideoSettingsDto.prototype, "videoDuration", void 0);
class BatchGenerationOptionsDto {
}
exports.BatchGenerationOptionsDto = BatchGenerationOptionsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '并发任务数',
        example: 2,
        minimum: 1,
        maximum: 5,
        default: 2
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: '并发数必须是数字' }),
    (0, class_validator_1.Min)(1, { message: '并发数最少1个' }),
    (0, class_validator_1.Max)(5, { message: '并发数最多5个' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], BatchGenerationOptionsDto.prototype, "parallelTasks", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '是否合并为一个长视频',
        example: true,
        default: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: '合并选项必须是布尔值' }),
    __metadata("design:type", Boolean)
], BatchGenerationOptionsDto.prototype, "mergeIntoOne", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '视频生成设置',
        type: VideoSettingsDto
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => VideoSettingsDto),
    __metadata("design:type", VideoSettingsDto)
], BatchGenerationOptionsDto.prototype, "videoSettings", void 0);
class BatchGenerateByChaptersDto {
}
exports.BatchGenerateByChaptersDto = BatchGenerateByChaptersDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '小说ID',
        example: 'clxxxxx'
    }),
    (0, class_validator_1.IsString)({ message: '小说ID必须是字符串' }),
    __metadata("design:type", String)
], BatchGenerateByChaptersDto.prototype, "novelId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '章节ID数组',
        example: ['ch-1', 'ch-2', 'ch-3'],
        type: [String]
    }),
    (0, class_validator_1.IsArray)({ message: '章节ID必须是数组' }),
    (0, class_validator_1.ArrayMinSize)(1, { message: '至少选择1个章节' }),
    (0, class_validator_1.IsString)({ each: true, message: '章节ID必须是字符串' }),
    __metadata("design:type", Array)
], BatchGenerateByChaptersDto.prototype, "chapterIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '批量生成选项',
        type: BatchGenerationOptionsDto
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => BatchGenerationOptionsDto),
    __metadata("design:type", BatchGenerationOptionsDto)
], BatchGenerateByChaptersDto.prototype, "options", void 0);
class SmartGenerationOptionsDto {
}
exports.SmartGenerationOptionsDto = SmartGenerationOptionsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '最多使用多少章节',
        example: 10,
        minimum: 1,
        maximum: 20,
        default: 10
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: '最大章节数必须是数字' }),
    (0, class_validator_1.Min)(1, { message: '最少1个章节' }),
    (0, class_validator_1.Max)(20, { message: '最多20个章节' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SmartGenerationOptionsDto.prototype, "maxChapters", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '是否自动合并为长视频',
        example: true,
        default: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: '自动合并选项必须是布尔值' }),
    __metadata("design:type", Boolean)
], SmartGenerationOptionsDto.prototype, "autoMerge", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '视频生成设置',
        type: VideoSettingsDto
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => VideoSettingsDto),
    __metadata("design:type", VideoSettingsDto)
], SmartGenerationOptionsDto.prototype, "videoSettings", void 0);
class SmartGenerateVideoDto {
}
exports.SmartGenerateVideoDto = SmartGenerateVideoDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '小说ID',
        example: 'clxxxxx'
    }),
    (0, class_validator_1.IsString)({ message: '小说ID必须是字符串' }),
    __metadata("design:type", String)
], SmartGenerateVideoDto.prototype, "novelId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '起始章节号',
        example: 1,
        minimum: 1
    }),
    (0, class_validator_1.IsNumber)({}, { message: '起始章节号必须是数字' }),
    (0, class_validator_1.Min)(1, { message: '起始章节号最少为1' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SmartGenerateVideoDto.prototype, "startChapter", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '目标视频时长(秒)',
        example: 600,
        minimum: 60,
        maximum: 1800
    }),
    (0, class_validator_1.IsNumber)({}, { message: '目标时长必须是数字' }),
    (0, class_validator_1.Min)(60, { message: '目标时长最少60秒(1分钟)' }),
    (0, class_validator_1.Max)(1800, { message: '目标时长最多1800秒(30分钟)' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SmartGenerateVideoDto.prototype, "targetDuration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'AI智能规划选项',
        type: SmartGenerationOptionsDto
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SmartGenerationOptionsDto),
    __metadata("design:type", SmartGenerationOptionsDto)
], SmartGenerateVideoDto.prototype, "options", void 0);
class VideoMergeOptionsDto {
}
exports.VideoMergeOptionsDto = VideoMergeOptionsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '是否添加章节标题',
        example: true,
        default: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: '章节标题选项必须是布尔值' }),
    __metadata("design:type", Boolean)
], VideoMergeOptionsDto.prototype, "addChapterTitles", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '是否添加片头',
        example: true,
        default: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: '片头选项必须是布尔值' }),
    __metadata("design:type", Boolean)
], VideoMergeOptionsDto.prototype, "addOpening", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '是否添加片尾',
        example: true,
        default: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: '片尾选项必须是布尔值' }),
    __metadata("design:type", Boolean)
], VideoMergeOptionsDto.prototype, "addEnding", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '章节标题显示时长(秒)',
        example: 2,
        minimum: 1,
        maximum: 5,
        default: 2
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: '标题时长必须是数字' }),
    (0, class_validator_1.Min)(1, { message: '标题时长最少1秒' }),
    (0, class_validator_1.Max)(5, { message: '标题时长最多5秒' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], VideoMergeOptionsDto.prototype, "titleDuration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '转场时长(秒)',
        example: 0.3,
        minimum: 0.1,
        maximum: 2,
        default: 0.3
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: '转场时长必须是数字' }),
    (0, class_validator_1.Min)(0.1, { message: '转场时长最少0.1秒' }),
    (0, class_validator_1.Max)(2, { message: '转场时长最多2秒' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], VideoMergeOptionsDto.prototype, "transitionDuration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '压缩质量',
        example: 'medium',
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['low', 'medium', 'high'], { message: '质量必须是 low, medium 或 high' }),
    __metadata("design:type", String)
], VideoMergeOptionsDto.prototype, "quality", void 0);
class MergeBatchVideosDto {
}
exports.MergeBatchVideosDto = MergeBatchVideosDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '视频合并选项',
        type: VideoMergeOptionsDto
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => VideoMergeOptionsDto),
    __metadata("design:type", VideoMergeOptionsDto)
], MergeBatchVideosDto.prototype, "options", void 0);


/***/ }),
/* 81 */
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
var VideoGenerationQueue_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VideoGenerationQueue = void 0;
const common_1 = __webpack_require__(2);
const bull_1 = __webpack_require__(77);
const bull_2 = __webpack_require__(60);
let VideoGenerationQueue = VideoGenerationQueue_1 = class VideoGenerationQueue {
    constructor(videoQueue) {
        this.videoQueue = videoQueue;
        this.logger = new common_1.Logger(VideoGenerationQueue_1.name);
    }
    async addVideoGenerationJob(userId, dto, priority = 0) {
        this.logger.log(`添加视频生成任务到队列: ${dto.chapterId}`);
        const job = await this.videoQueue.add('generate-chapter-video', {
            userId,
            ...dto,
        }, {
            priority,
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 60000,
            },
            removeOnComplete: false,
            removeOnFail: false,
            timeout: 600000,
        });
        this.logger.log(`任务已添加，Job ID: ${job.id}`);
        return job;
    }
    async getJobStatus(jobId) {
        const job = await this.videoQueue.getJob(jobId);
        if (!job) {
            return null;
        }
        const state = await job.getState();
        const progress = job.progress();
        return {
            id: job.id,
            state,
            progress,
            data: job.data,
            returnValue: job.returnvalue,
            failedReason: job.failedReason,
            attemptsMade: job.attemptsMade,
            processedOn: job.processedOn,
            finishedOn: job.finishedOn,
        };
    }
    async cancelJob(jobId) {
        try {
            const job = await this.videoQueue.getJob(jobId);
            if (!job) {
                return false;
            }
            await job.remove();
            this.logger.log(`任务已取消: ${jobId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`取消任务失败: ${error.message}`);
            return false;
        }
    }
    async getQueueStats() {
        const [waiting, active, completed, failed, delayed] = await Promise.all([
            this.videoQueue.getWaitingCount(),
            this.videoQueue.getActiveCount(),
            this.videoQueue.getCompletedCount(),
            this.videoQueue.getFailedCount(),
            this.videoQueue.getDelayedCount(),
        ]);
        return {
            waiting,
            active,
            completed,
            failed,
            delayed,
            total: waiting + active + completed + failed + delayed,
        };
    }
    async cleanOldJobs(ageInHours = 24) {
        this.logger.log(`清理${ageInHours}小时前的已完成任务...`);
        const jobs = await this.videoQueue.getCompleted();
        const now = Date.now();
        const cutoffTime = now - ageInHours * 60 * 60 * 1000;
        let cleanedCount = 0;
        for (const job of jobs) {
            if (job.finishedOn && job.finishedOn < cutoffTime) {
                await job.remove();
                cleanedCount++;
            }
        }
        this.logger.log(`清理完成，共清理${cleanedCount}个任务`);
        return cleanedCount;
    }
    async pauseQueue() {
        await this.videoQueue.pause();
        this.logger.log('队列已暂停');
    }
    async resumeQueue() {
        await this.videoQueue.resume();
        this.logger.log('队列已恢复');
    }
};
exports.VideoGenerationQueue = VideoGenerationQueue;
exports.VideoGenerationQueue = VideoGenerationQueue = VideoGenerationQueue_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bull_2.InjectQueue)('video-generation')),
    __metadata("design:paramtypes", [typeof (_a = typeof bull_1.Queue !== "undefined" && bull_1.Queue) === "function" ? _a : Object])
], VideoGenerationQueue);


/***/ }),
/* 82 */
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
var VideoGenerationProcessor_1;
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VideoGenerationProcessor = void 0;
const bull_1 = __webpack_require__(60);
const common_1 = __webpack_require__(2);
const bull_2 = __webpack_require__(77);
const video_generation_service_1 = __webpack_require__(62);
let VideoGenerationProcessor = VideoGenerationProcessor_1 = class VideoGenerationProcessor {
    constructor(videoGenerationService) {
        this.videoGenerationService = videoGenerationService;
        this.logger = new common_1.Logger(VideoGenerationProcessor_1.name);
    }
    async handleVideoGeneration(job) {
        this.logger.log(`开始处理视频生成任务: ${job.id}`);
        const { userId, chapterId, ...options } = job.data;
        try {
            await job.progress(0);
            const result = await this.videoGenerationService.generateChapterVideo(userId, { chapterId, ...options });
            await job.progress(100);
            this.logger.log(`视频生成任务完成: ${job.id}`);
            return result;
        }
        catch (error) {
            this.logger.error(`视频生成任务失败: ${job.id}`, error.stack);
            throw error;
        }
    }
    onActive(job) {
        this.logger.log(`任务开始执行: ${job.id}, 章节: ${job.data.chapterId}`);
    }
    onCompleted(job, result) {
        this.logger.log(`任务执行完成: ${job.id}`);
    }
    onFailed(job, error) {
        this.logger.error(`任务执行失败: ${job.id}, 尝试次数: ${job.attemptsMade}/${job.opts.attempts}`, error.stack);
    }
};
exports.VideoGenerationProcessor = VideoGenerationProcessor;
__decorate([
    (0, bull_1.Process)('generate-chapter-video'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof bull_2.Job !== "undefined" && bull_2.Job) === "function" ? _b : Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], VideoGenerationProcessor.prototype, "handleVideoGeneration", null);
__decorate([
    (0, bull_1.OnQueueActive)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof bull_2.Job !== "undefined" && bull_2.Job) === "function" ? _d : Object]),
    __metadata("design:returntype", void 0)
], VideoGenerationProcessor.prototype, "onActive", null);
__decorate([
    (0, bull_1.OnQueueCompleted)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof bull_2.Job !== "undefined" && bull_2.Job) === "function" ? _e : Object, Object]),
    __metadata("design:returntype", void 0)
], VideoGenerationProcessor.prototype, "onCompleted", null);
__decorate([
    (0, bull_1.OnQueueFailed)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof bull_2.Job !== "undefined" && bull_2.Job) === "function" ? _f : Object, typeof (_g = typeof Error !== "undefined" && Error) === "function" ? _g : Object]),
    __metadata("design:returntype", void 0)
], VideoGenerationProcessor.prototype, "onFailed", null);
exports.VideoGenerationProcessor = VideoGenerationProcessor = VideoGenerationProcessor_1 = __decorate([
    (0, bull_1.Processor)('video-generation'),
    __metadata("design:paramtypes", [typeof (_a = typeof video_generation_service_1.VideoGenerationService !== "undefined" && video_generation_service_1.VideoGenerationService) === "function" ? _a : Object])
], VideoGenerationProcessor);


/***/ }),
/* 83 */
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
const config_1 = __webpack_require__(5);
const passport_1 = __webpack_require__(7);
const passport_jwt_1 = __webpack_require__(84);
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(configService) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET'),
        });
        this.configService = configService;
    }
    async validate(payload) {
        if (!payload) {
            throw new common_1.UnauthorizedException('Invalid token payload');
        }
        return {
            id: payload.sub || payload.id,
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
/* 84 */
/***/ ((module) => {

module.exports = require("passport-jwt");

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
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.enableCors({
        origin: process.env.NODE_ENV === 'production'
            ? ['https://91writing.com', 'https://www.91writing.com']
            : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:7520', 'http://localhost:4173'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        credentials: true,
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('91Writing AI服务API')
        .setDescription('91Writing AI服务API文档')
        .setVersion('1.0')
        .addTag('ai', 'AI服务')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
    }, 'JWT-auth')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs/ai', app, document);
    const port = process.env.AI_SERVICE_PORT || 3004;
    await app.listen(port);
    console.log(`🤖 AI服务运行在: http://localhost:${port}`);
    console.log(`📖 API文档地址: http://localhost:${port}/api/docs/ai`);
}
bootstrap();

})();

/******/ })()
;