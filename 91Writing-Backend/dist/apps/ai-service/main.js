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
const database_1 = __webpack_require__(5);
const assistant_module_1 = __webpack_require__(10);
const generation_module_1 = __webpack_require__(19);
const suggestion_module_1 = __webpack_require__(22);
const wizard_module_1 = __webpack_require__(26);
const health_module_1 = __webpack_require__(27);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            database_1.DatabaseModule,
            assistant_module_1.AssistantModule,
            generation_module_1.GenerationModule,
            suggestion_module_1.SuggestionModule,
            wizard_module_1.WizardModule,
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
const common_1 = __webpack_require__(2);
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
const common_1 = __webpack_require__(2);
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
exports.AssistantModule = void 0;
const common_1 = __webpack_require__(2);
const assistant_service_1 = __webpack_require__(11);
const assistant_controller_1 = __webpack_require__(14);
let AssistantModule = class AssistantModule {
};
exports.AssistantModule = AssistantModule;
exports.AssistantModule = AssistantModule = __decorate([
    (0, common_1.Module)({
        controllers: [assistant_controller_1.AssistantController],
        providers: [assistant_service_1.AssistantService],
        exports: [assistant_service_1.AssistantService],
    })
], AssistantModule);


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
exports.AssistantService = void 0;
const common_1 = __webpack_require__(2);
const database_1 = __webpack_require__(5);
const conversation_dto_1 = __webpack_require__(12);
let AssistantService = class AssistantService {
    constructor(prisma) {
        this.prisma = prisma;
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
};
exports.AssistantService = AssistantService;
exports.AssistantService = AssistantService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], AssistantService);


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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GenerateContentDto = exports.ConversationDto = exports.InitializeSessionDto = exports.ConversationIntent = void 0;
const class_validator_1 = __webpack_require__(13);
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
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateContentDto.prototype, "novelId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateContentDto.prototype, "prompt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['continuation', 'scene', 'dialogue', 'description', 'opening', 'ending']),
    __metadata("design:type", String)
], GenerateContentDto.prototype, "contentType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['short', 'medium', 'long']),
    __metadata("design:type", String)
], GenerateContentDto.prototype, "length", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['current', 'formal', 'casual', 'dramatic', 'humorous']),
    __metadata("design:type", String)
], GenerateContentDto.prototype, "style", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], GenerateContentDto.prototype, "context", void 0);


/***/ }),
/* 13 */
/***/ ((module) => {

module.exports = require("class-validator");

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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AssistantController = void 0;
const common_1 = __webpack_require__(2);
const guards_1 = __webpack_require__(15);
const assistant_service_1 = __webpack_require__(11);
const conversation_dto_1 = __webpack_require__(12);
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
};
exports.AssistantController = AssistantController;
__decorate([
    (0, common_1.Post)('sessions'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_b = typeof conversation_dto_1.InitializeSessionDto !== "undefined" && conversation_dto_1.InitializeSessionDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], AssistantController.prototype, "initializeSession", null);
__decorate([
    (0, common_1.Post)('chat'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_c = typeof conversation_dto_1.ConversationDto !== "undefined" && conversation_dto_1.ConversationDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], AssistantController.prototype, "handleConversation", null);
__decorate([
    (0, common_1.Get)('sessions/:sessionId/history'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AssistantController.prototype, "getConversationHistory", null);
__decorate([
    (0, common_1.Post)('sessions/cleanup'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AssistantController.prototype, "cleanupSessions", null);
exports.AssistantController = AssistantController = __decorate([
    (0, common_1.Controller)('assistant'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof assistant_service_1.AssistantService !== "undefined" && assistant_service_1.AssistantService) === "function" ? _a : Object])
], AssistantController);


/***/ }),
/* 15 */
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
__exportStar(__webpack_require__(16), exports);
__exportStar(__webpack_require__(18), exports);


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
exports.JwtAuthGuard = void 0;
const common_1 = __webpack_require__(2);
const passport_1 = __webpack_require__(17);
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
/* 17 */
/***/ ((module) => {

module.exports = require("@nestjs/passport");

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
/* 19 */
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
const generation_service_1 = __webpack_require__(20);
const generation_controller_1 = __webpack_require__(21);
let GenerationModule = class GenerationModule {
};
exports.GenerationModule = GenerationModule;
exports.GenerationModule = GenerationModule = __decorate([
    (0, common_1.Module)({
        controllers: [generation_controller_1.GenerationController],
        providers: [generation_service_1.GenerationService],
        exports: [generation_service_1.GenerationService],
    })
], GenerationModule);


/***/ }),
/* 20 */
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
exports.GenerationService = void 0;
const common_1 = __webpack_require__(2);
const database_1 = __webpack_require__(5);
let GenerationService = class GenerationService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateContent(userId, dto) {
        const novel = await this.prisma.novel.findFirst({
            where: { id: dto.novelId, userId },
        });
        if (!novel) {
            throw new Error('小说不存在或无权访问');
        }
        const mockContent = this.generateMockContent(dto);
        await this.logContentGeneration(userId, dto.prompt.length, mockContent.length);
        return {
            content: mockContent,
            metadata: {
                type: dto.contentType,
                length: dto.length,
                style: dto.style,
                wordCount: this.calculateWordCount(mockContent),
            }
        };
    }
    generateMockContent(dto) {
        const templates = {
            continuation: '故事继续发展，主角面临了新的挑战...',
            scene: '场景描写：阳光透过窗棂洒在房间里...',
            dialogue: '"这真的是你想要的结果吗？"她轻声问道。',
            description: '环境描写：古老的城堡在月光下显得格外神秘...',
            opening: '开头：那是一个改变一切的夜晚...',
            ending: '结尾：当一切尘埃落定，他们终于明白了真相...',
        };
        return templates[dto.contentType] || templates.continuation;
    }
    calculateWordCount(content) {
        const chineseChars = (content.match(/[\u4e00-\u9fff]/g) || []).length;
        const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
        return chineseChars + englishWords;
    }
    async logContentGeneration(userId, inputLength, outputLength) {
        try {
            await this.prisma.aIUsageLog.create({
                data: {
                    userId,
                    model: 'content-generator',
                    functionType: 'content_generation',
                    inputTokens: Math.ceil(inputLength / 4),
                    outputTokens: Math.ceil(outputLength / 4),
                    success: true,
                },
            });
        }
        catch (error) {
            console.error('Log content generation error:', error);
        }
    }
};
exports.GenerationService = GenerationService;
exports.GenerationService = GenerationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], GenerationService);


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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GenerationController = void 0;
const common_1 = __webpack_require__(2);
const guards_1 = __webpack_require__(15);
const generation_service_1 = __webpack_require__(20);
const conversation_dto_1 = __webpack_require__(12);
let GenerationController = class GenerationController {
    constructor(generationService) {
        this.generationService = generationService;
    }
    async generateContent(req, dto) {
        return this.generationService.generateContent(req.user.id, dto);
    }
};
exports.GenerationController = GenerationController;
__decorate([
    (0, common_1.Post)('content'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_b = typeof conversation_dto_1.GenerateContentDto !== "undefined" && conversation_dto_1.GenerateContentDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], GenerationController.prototype, "generateContent", null);
exports.GenerationController = GenerationController = __decorate([
    (0, common_1.Controller)('generation'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof generation_service_1.GenerationService !== "undefined" && generation_service_1.GenerationService) === "function" ? _a : Object])
], GenerationController);


/***/ }),
/* 22 */
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
const suggestion_service_1 = __webpack_require__(23);
const suggestion_controller_1 = __webpack_require__(25);
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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SuggestionService = void 0;
const common_1 = __webpack_require__(2);
const database_1 = __webpack_require__(5);
const suggestion_dto_1 = __webpack_require__(24);
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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApplySuggestionDto = exports.AnalyzeTextDto = exports.GenerateSuggestionsDto = exports.SuggestionPriority = exports.SuggestionType = void 0;
const class_validator_1 = __webpack_require__(13);
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
exports.SuggestionController = void 0;
const common_1 = __webpack_require__(2);
const guards_1 = __webpack_require__(15);
const suggestion_service_1 = __webpack_require__(23);
const suggestion_dto_1 = __webpack_require__(24);
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
    (0, common_1.Post)('generate'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_b = typeof suggestion_dto_1.GenerateSuggestionsDto !== "undefined" && suggestion_dto_1.GenerateSuggestionsDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], SuggestionController.prototype, "generateSuggestions", null);
__decorate([
    (0, common_1.Post)('analyze'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_c = typeof suggestion_dto_1.AnalyzeTextDto !== "undefined" && suggestion_dto_1.AnalyzeTextDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], SuggestionController.prototype, "analyzeText", null);
__decorate([
    (0, common_1.Post)('apply'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_d = typeof suggestion_dto_1.ApplySuggestionDto !== "undefined" && suggestion_dto_1.ApplySuggestionDto) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], SuggestionController.prototype, "applySuggestion", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SuggestionController.prototype, "getStats", null);
exports.SuggestionController = SuggestionController = __decorate([
    (0, common_1.Controller)('suggestions'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof suggestion_service_1.SuggestionService !== "undefined" && suggestion_service_1.SuggestionService) === "function" ? _a : Object])
], SuggestionController);


/***/ }),
/* 26 */
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
/* 27 */
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
const health_controller_1 = __webpack_require__(28);
const health_service_1 = __webpack_require__(29);
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
exports.HealthController = void 0;
const common_1 = __webpack_require__(2);
const health_service_1 = __webpack_require__(29);
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
/* 29 */
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