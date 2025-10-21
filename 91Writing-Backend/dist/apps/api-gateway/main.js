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
const throttler_1 = __webpack_require__(7);
const cache_manager_1 = __webpack_require__(8);
const auth_module_1 = __webpack_require__(9);
const proxy_module_1 = __webpack_require__(15);
const health_module_1 = __webpack_require__(18);
const payment_module_1 = __webpack_require__(21);
const admin_module_1 = __webpack_require__(25);
const novel_module_1 = __webpack_require__(28);
const users_module_1 = __webpack_require__(31);
const ai_module_1 = __webpack_require__(34);
const database_1 = __webpack_require__(37);
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
            throttler_1.ThrottlerModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => [
                    {
                        name: 'short',
                        ttl: 1000,
                        limit: 3,
                    },
                    {
                        name: 'medium',
                        ttl: 10000,
                        limit: 20,
                    },
                    {
                        name: 'long',
                        ttl: 60000,
                        limit: 100,
                    },
                ],
            }),
            cache_manager_1.CacheModule.registerAsync({
                isGlobal: true,
                inject: [config_1.ConfigService],
                useFactory: async (config) => ({
                    ttl: 300,
                    max: 1000,
                }),
            }),
            database_1.DatabaseModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            novel_module_1.NovelModule,
            ai_module_1.AiModule,
            proxy_module_1.ProxyModule,
            payment_module_1.PaymentModule,
            admin_module_1.AdminModule,
            health_module_1.HealthModule,
        ],
        controllers: [],
        providers: [],
    })
], AppModule);


/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),
/* 7 */
/***/ ((module) => {

module.exports = require("@nestjs/throttler");

/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("@nestjs/cache-manager");

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
exports.AuthModule = void 0;
const common_1 = __webpack_require__(3);
const axios_1 = __webpack_require__(10);
const auth_controller_1 = __webpack_require__(11);
const auth_service_1 = __webpack_require__(13);
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule.register({
                timeout: 10000,
                maxRedirects: 5,
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService],
        exports: [auth_service_1.AuthService],
    })
], AuthModule);


/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("@nestjs/axios");

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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(4);
const express_1 = __webpack_require__(12);
const auth_service_1 = __webpack_require__(13);
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async proxyToAuthService(req, res) {
        try {
            const response = await this.authService.proxyRequest(req);
            Object.keys(response.headers).forEach(key => {
                if (key.toLowerCase() !== 'content-encoding') {
                    res.set(key, response.headers[key]);
                }
            });
            res.status(response.status).send(response.data);
        }
        catch (error) {
            console.error('认证服务代理错误:', error);
            if (error.response) {
                res.status(error.response.status).json(error.response.data);
            }
            else {
                throw new common_1.HttpException({
                    message: '认证服务暂时不可用',
                    error: 'Auth Service Unavailable',
                }, common_1.HttpStatus.SERVICE_UNAVAILABLE);
            }
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.All)('*'),
    (0, swagger_1.ApiExcludeEndpoint)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _b : Object, typeof (_c = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "proxyToAuthService", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('认证代理'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object])
], AuthController);


/***/ }),
/* 12 */
/***/ ((module) => {

module.exports = require("express");

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
var AuthService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthService = void 0;
const common_1 = __webpack_require__(3);
const config_1 = __webpack_require__(6);
const axios_1 = __webpack_require__(10);
const rxjs_1 = __webpack_require__(14);
let AuthService = AuthService_1 = class AuthService {
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.logger = new common_1.Logger(AuthService_1.name);
        this.authServiceUrl = this.configService.get('AUTH_SERVICE_URL', 'http://localhost:3002');
    }
    async proxyRequest(req) {
        const { method, url, headers, body } = req;
        let targetPath = url;
        const prefixes = ['/api/v1/auth', '/auth'];
        for (const prefix of prefixes) {
            if (targetPath.startsWith(prefix)) {
                targetPath = targetPath.substring(prefix.length);
                break;
            }
        }
        if (!targetPath.startsWith('/')) {
            targetPath = '/' + targetPath;
        }
        const targetUrl = `${this.authServiceUrl}${targetPath}`;
        const cleanHeaders = this.cleanHeaders(headers);
        this.logger.log(`代理请求: ${method} ${targetUrl} (原始URL: ${url})`);
        try {
            const requestConfig = {
                method: method,
                url: targetUrl,
                headers: cleanHeaders,
                timeout: 30000,
                validateStatus: () => true,
            };
            if (method !== 'GET' && method !== 'DELETE' && body !== undefined) {
                requestConfig.data = body;
            }
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.request(requestConfig));
            return response;
        }
        catch (error) {
            this.logger.error(`代理请求失败: ${method} ${targetUrl}`, error);
            throw error;
        }
    }
    cleanHeaders(headers) {
        const cleanHeaders = { ...headers };
        const headersToRemove = [
            'host',
            'connection',
            'content-length',
            'transfer-encoding',
            'x-forwarded-for',
            'x-forwarded-proto',
            'x-forwarded-host',
        ];
        headersToRemove.forEach(header => {
            delete cleanHeaders[header];
            delete cleanHeaders[header.toLowerCase()];
        });
        cleanHeaders['x-forwarded-by'] = 'api-gateway';
        cleanHeaders['x-original-host'] = headers.host;
        return cleanHeaders;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object, typeof (_b = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _b : Object])
], AuthService);


/***/ }),
/* 14 */
/***/ ((module) => {

module.exports = require("rxjs");

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
exports.ProxyModule = void 0;
const common_1 = __webpack_require__(3);
const proxy_controller_1 = __webpack_require__(16);
const proxy_service_1 = __webpack_require__(17);
let ProxyModule = class ProxyModule {
};
exports.ProxyModule = ProxyModule;
exports.ProxyModule = ProxyModule = __decorate([
    (0, common_1.Module)({
        controllers: [proxy_controller_1.ProxyController],
        providers: [proxy_service_1.ProxyService],
    })
], ProxyModule);


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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProxyController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(4);
const proxy_service_1 = __webpack_require__(17);
let ProxyController = class ProxyController {
    constructor(proxyService) {
        this.proxyService = proxyService;
    }
    getProxyStatus() {
        return this.proxyService.getStatus();
    }
};
exports.ProxyController = ProxyController;
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({ summary: '代理服务状态' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProxyController.prototype, "getProxyStatus", null);
exports.ProxyController = ProxyController = __decorate([
    (0, swagger_1.ApiTags)('proxy'),
    (0, common_1.Controller)('proxy'),
    __metadata("design:paramtypes", [typeof (_a = typeof proxy_service_1.ProxyService !== "undefined" && proxy_service_1.ProxyService) === "function" ? _a : Object])
], ProxyController);


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
exports.ProxyService = void 0;
const common_1 = __webpack_require__(3);
let ProxyService = class ProxyService {
    getStatus() {
        return {
            status: 'active',
            service: 'proxy',
            timestamp: new Date().toISOString(),
            message: '代理服务运行正常',
            services: {
                authService: 'http://localhost:3002',
                userService: 'http://localhost:3001',
                novelService: 'http://localhost:3003',
                aiService: 'http://localhost:3004',
                paymentService: 'http://localhost:3005',
            },
        };
    }
};
exports.ProxyService = ProxyService;
exports.ProxyService = ProxyService = __decorate([
    (0, common_1.Injectable)()
], ProxyService);


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
exports.HealthModule = void 0;
const common_1 = __webpack_require__(3);
const health_controller_1 = __webpack_require__(19);
const health_service_1 = __webpack_require__(20);
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
exports.HealthController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(4);
const health_service_1 = __webpack_require__(20);
let HealthController = class HealthController {
    constructor(healthService) {
        this.healthService = healthService;
    }
    getHealth() {
        return this.healthService.getHealthStatus();
    }
    getReadiness() {
        return this.healthService.getReadinessStatus();
    }
    getLiveness() {
        return this.healthService.getLivenessStatus();
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '健康检查' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '服务健康状态',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'healthy' },
                timestamp: { type: 'string', example: '2024-12-19T10:30:00Z' },
                uptime: { type: 'number', example: 3600 },
                version: { type: 'string', example: '1.0.0' },
                environment: { type: 'string', example: 'development' },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('ready'),
    (0, swagger_1.ApiOperation)({ summary: '就绪检查' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '服务就绪状态',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getReadiness", null);
__decorate([
    (0, common_1.Get)('live'),
    (0, swagger_1.ApiOperation)({ summary: '存活检查' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '服务存活状态',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getLiveness", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('health'),
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [typeof (_a = typeof health_service_1.HealthService !== "undefined" && health_service_1.HealthService) === "function" ? _a : Object])
], HealthController);


/***/ }),
/* 20 */
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
    constructor() {
        this.startTime = Date.now();
    }
    getHealthStatus() {
        const now = Date.now();
        const uptime = Math.floor((now - this.startTime) / 1000);
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime,
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            service: 'api-gateway',
            memoryUsage: process.memoryUsage(),
        };
    }
    getReadinessStatus() {
        const checks = {
            database: true,
            redis: true,
            services: {
                userService: true,
                novelService: true,
                aiService: true,
                paymentService: true,
            },
        };
        const allReady = Object.values(checks).every((check) => {
            if (typeof check === 'object') {
                return Object.values(check).every(Boolean);
            }
            return check;
        });
        return {
            status: allReady ? 'ready' : 'not_ready',
            checks,
            timestamp: new Date().toISOString(),
        };
    }
    getLivenessStatus() {
        return {
            status: 'alive',
            timestamp: new Date().toISOString(),
            uptime: Math.floor((Date.now() - this.startTime) / 1000),
        };
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = __decorate([
    (0, common_1.Injectable)()
], HealthService);


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
exports.PaymentModule = void 0;
const common_1 = __webpack_require__(3);
const payment_controller_1 = __webpack_require__(22);
const payment_service_1 = __webpack_require__(23);
let PaymentModule = class PaymentModule {
};
exports.PaymentModule = PaymentModule;
exports.PaymentModule = PaymentModule = __decorate([
    (0, common_1.Module)({
        controllers: [payment_controller_1.PaymentsController, payment_controller_1.SubscriptionsController, payment_controller_1.PackagesController],
        providers: [payment_service_1.PaymentService],
    })
], PaymentModule);


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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PaymentController = exports.PackagesController = exports.SubscriptionsController = exports.PaymentsController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(4);
const express_1 = __webpack_require__(12);
const payment_service_1 = __webpack_require__(23);
let PaymentsController = class PaymentsController {
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    async forwardRequest(req, res) {
        try {
            const path = req.path;
            const result = await this.paymentService.forwardRequest(path, req.method, req.body, req.headers);
            res.json(result);
        }
        catch (error) {
            res.status(error.status || 500).json(error.response || { message: 'Internal server error' });
        }
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.All)('*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _b : Object, typeof (_c = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "forwardRequest", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)('payments'),
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [typeof (_a = typeof payment_service_1.PaymentService !== "undefined" && payment_service_1.PaymentService) === "function" ? _a : Object])
], PaymentsController);
let SubscriptionsController = class SubscriptionsController {
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    async forwardRequest(req, res) {
        try {
            const path = req.path;
            const result = await this.paymentService.forwardRequest(path, req.method, req.body, req.headers);
            res.json(result);
        }
        catch (error) {
            res.status(error.status || 500).json(error.response || { message: 'Internal server error' });
        }
    }
};
exports.SubscriptionsController = SubscriptionsController;
__decorate([
    (0, common_1.All)('*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _e : Object, typeof (_f = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _f : Object]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "forwardRequest", null);
exports.SubscriptionsController = SubscriptionsController = __decorate([
    (0, swagger_1.ApiTags)('subscriptions'),
    (0, common_1.Controller)('subscriptions'),
    __metadata("design:paramtypes", [typeof (_d = typeof payment_service_1.PaymentService !== "undefined" && payment_service_1.PaymentService) === "function" ? _d : Object])
], SubscriptionsController);
let PackagesController = class PackagesController {
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    async forwardRequest(req, res) {
        try {
            const path = req.path;
            const result = await this.paymentService.forwardRequest(path, req.method, req.body, req.headers);
            res.json(result);
        }
        catch (error) {
            res.status(error.status || 500).json(error.response || { message: 'Internal server error' });
        }
    }
};
exports.PackagesController = PackagesController;
__decorate([
    (0, common_1.All)('*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_h = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _h : Object, typeof (_j = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _j : Object]),
    __metadata("design:returntype", Promise)
], PackagesController.prototype, "forwardRequest", null);
exports.PackagesController = PackagesController = __decorate([
    (0, swagger_1.ApiTags)('packages'),
    (0, common_1.Controller)('packages'),
    __metadata("design:paramtypes", [typeof (_g = typeof payment_service_1.PaymentService !== "undefined" && payment_service_1.PaymentService) === "function" ? _g : Object])
], PackagesController);
class PaymentController extends PaymentsController {
}
exports.PaymentController = PaymentController;


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
exports.PaymentService = void 0;
const common_1 = __webpack_require__(3);
const axios_1 = __webpack_require__(24);
let PaymentService = class PaymentService {
    constructor() {
        this.paymentServiceUrl = 'http://localhost:3005';
    }
    async forwardRequest(path, method, data, headers) {
        try {
            const requestConfig = {
                method,
                url: `${this.paymentServiceUrl}${path}`,
                headers,
            };
            if (method !== 'GET' && method !== 'DELETE' && data !== undefined) {
                requestConfig.data = data;
            }
            const response = await (0, axios_1.default)(requestConfig);
            return response.data;
        }
        catch (error) {
            if (error.response) {
                throw new common_1.HttpException(error.response.data, error.response.status);
            }
            throw new common_1.HttpException('Payment service unavailable', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)()
], PaymentService);


/***/ }),
/* 24 */
/***/ ((module) => {

module.exports = require("axios");

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
exports.AdminModule = void 0;
const common_1 = __webpack_require__(3);
const axios_1 = __webpack_require__(10);
const admin_controller_1 = __webpack_require__(26);
const admin_service_1 = __webpack_require__(27);
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule.register({
                timeout: 10000,
                maxRedirects: 5,
            }),
        ],
        controllers: [admin_controller_1.AdminController],
        providers: [admin_service_1.AdminService],
    })
], AdminModule);


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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(4);
const express_1 = __webpack_require__(12);
const admin_service_1 = __webpack_require__(27);
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    async proxyToAdminService(req, res) {
        try {
            const response = await this.adminService.proxyRequest(req);
            Object.keys(response.headers).forEach(key => {
                if (key.toLowerCase() !== 'content-encoding') {
                    res.set(key, response.headers[key]);
                }
            });
            res.status(response.status).send(response.data);
        }
        catch (error) {
            console.error('管理后台代理错误:', error);
            if (error.response) {
                res.status(error.response.status).json(error.response.data);
            }
            else {
                throw new common_1.HttpException({
                    message: '管理后台服务暂时不可用',
                    error: 'Admin Service Unavailable',
                }, common_1.HttpStatus.SERVICE_UNAVAILABLE);
            }
        }
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.All)('*'),
    (0, swagger_1.ApiExcludeEndpoint)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _b : Object, typeof (_c = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "proxyToAdminService", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('管理后台代理'),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [typeof (_a = typeof admin_service_1.AdminService !== "undefined" && admin_service_1.AdminService) === "function" ? _a : Object])
], AdminController);


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
var AdminService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminService = void 0;
const common_1 = __webpack_require__(3);
const config_1 = __webpack_require__(6);
const axios_1 = __webpack_require__(10);
const rxjs_1 = __webpack_require__(14);
let AdminService = AdminService_1 = class AdminService {
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.logger = new common_1.Logger(AdminService_1.name);
        this.adminServiceUrl = this.configService.get('ADMIN_SERVICE_URL', 'http://localhost:3006');
    }
    async proxyRequest(req) {
        const { method, url, headers, body } = req;
        let targetPath = url;
        const prefixes = ['/api/v1/admin', '/admin'];
        for (const prefix of prefixes) {
            if (targetPath.startsWith(prefix)) {
                targetPath = targetPath.substring(prefix.length);
                break;
            }
        }
        if (!targetPath.startsWith('/')) {
            targetPath = '/' + targetPath;
        }
        const targetUrl = `${this.adminServiceUrl}${targetPath}`;
        const cleanHeaders = this.cleanHeaders(headers);
        this.logger.log(`代理请求: ${method} ${targetUrl} (原始URL: ${url})`);
        try {
            const requestConfig = {
                method: method,
                url: targetUrl,
                headers: cleanHeaders,
                timeout: 30000,
                validateStatus: () => true,
            };
            if (method !== 'GET' && method !== 'DELETE' && body !== undefined) {
                requestConfig.data = body;
            }
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.request(requestConfig));
            return response;
        }
        catch (error) {
            this.logger.error(`代理请求失败: ${method} ${targetUrl}`, error);
            throw error;
        }
    }
    cleanHeaders(headers) {
        const cleanHeaders = { ...headers };
        const headersToRemove = [
            'host',
            'connection',
            'content-length',
            'transfer-encoding',
            'x-forwarded-for',
            'x-forwarded-proto',
            'x-forwarded-host',
        ];
        headersToRemove.forEach(header => {
            delete cleanHeaders[header];
            delete cleanHeaders[header.toLowerCase()];
        });
        cleanHeaders['x-forwarded-by'] = 'api-gateway';
        cleanHeaders['x-original-host'] = headers.host;
        return cleanHeaders;
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = AdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object, typeof (_b = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _b : Object])
], AdminService);


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
exports.NovelModule = void 0;
const common_1 = __webpack_require__(3);
const axios_1 = __webpack_require__(10);
const novel_controller_1 = __webpack_require__(29);
const novel_service_1 = __webpack_require__(30);
let NovelModule = class NovelModule {
};
exports.NovelModule = NovelModule;
exports.NovelModule = NovelModule = __decorate([
    (0, common_1.Module)({
        imports: [axios_1.HttpModule],
        controllers: [novel_controller_1.NovelController],
        providers: [novel_service_1.NovelService],
    })
], NovelModule);


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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NovelController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(4);
const express_1 = __webpack_require__(12);
const novel_service_1 = __webpack_require__(30);
let NovelController = class NovelController {
    constructor(novelService) {
        this.novelService = novelService;
    }
    async proxyNovels(req, res) {
        return this.proxyToNovelService(req, res);
    }
    async proxyChapters(req, res) {
        return this.proxyToNovelService(req, res);
    }
    async proxyMemories(req, res) {
        return this.proxyToNovelService(req, res);
    }
    async proxyMaterials(req, res) {
        return this.proxyToNovelService(req, res);
    }
    async proxyPrompts(req, res) {
        return this.proxyToNovelService(req, res);
    }
    async proxyCollaboration(req, res) {
        return this.proxyToNovelService(req, res);
    }
    async proxyVersions(req, res) {
        return this.proxyToNovelService(req, res);
    }
    async proxyComments(req, res) {
        return this.proxyToNovelService(req, res);
    }
    async proxyConsistency(req, res) {
        return this.proxyToNovelService(req, res);
    }
    async proxyToNovelService(req, res) {
        try {
            const path = req.path;
            const result = await this.novelService.proxyRequest(path, req.method, req.headers, req.body, req.query);
            return res.status(200).json(result);
        }
        catch (error) {
            const status = error.statusCode || error.status || 500;
            console.error('Novel service proxy error:', {
                path: req.path,
                method: req.method,
                status,
                error: error.message || error,
            });
            return res.status(status).json(error);
        }
    }
};
exports.NovelController = NovelController;
__decorate([
    (0, common_1.All)('novels*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _b : Object, typeof (_c = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], NovelController.prototype, "proxyNovels", null);
__decorate([
    (0, common_1.All)('chapters*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _d : Object, typeof (_e = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _e : Object]),
    __metadata("design:returntype", Promise)
], NovelController.prototype, "proxyChapters", null);
__decorate([
    (0, common_1.All)('memories*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _f : Object, typeof (_g = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _g : Object]),
    __metadata("design:returntype", Promise)
], NovelController.prototype, "proxyMemories", null);
__decorate([
    (0, common_1.All)('materials*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_h = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _h : Object, typeof (_j = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _j : Object]),
    __metadata("design:returntype", Promise)
], NovelController.prototype, "proxyMaterials", null);
__decorate([
    (0, common_1.All)('prompts*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_k = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _k : Object, typeof (_l = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _l : Object]),
    __metadata("design:returntype", Promise)
], NovelController.prototype, "proxyPrompts", null);
__decorate([
    (0, common_1.All)('collaboration*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_m = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _m : Object, typeof (_o = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _o : Object]),
    __metadata("design:returntype", Promise)
], NovelController.prototype, "proxyCollaboration", null);
__decorate([
    (0, common_1.All)('versions*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_p = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _p : Object, typeof (_q = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _q : Object]),
    __metadata("design:returntype", Promise)
], NovelController.prototype, "proxyVersions", null);
__decorate([
    (0, common_1.All)('comments*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_r = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _r : Object, typeof (_s = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _s : Object]),
    __metadata("design:returntype", Promise)
], NovelController.prototype, "proxyComments", null);
__decorate([
    (0, common_1.All)('consistency*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_t = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _t : Object, typeof (_u = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _u : Object]),
    __metadata("design:returntype", Promise)
], NovelController.prototype, "proxyConsistency", null);
exports.NovelController = NovelController = __decorate([
    (0, swagger_1.ApiTags)('Novel Service Proxy'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof novel_service_1.NovelService !== "undefined" && novel_service_1.NovelService) === "function" ? _a : Object])
], NovelController);


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
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NovelService = void 0;
const common_1 = __webpack_require__(3);
const axios_1 = __webpack_require__(10);
const config_1 = __webpack_require__(6);
const rxjs_1 = __webpack_require__(14);
let NovelService = class NovelService {
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.novelServiceUrl = this.configService.get('NOVEL_SERVICE_URL', 'http://localhost:3003');
    }
    async proxyRequest(path, method, headers, body, query) {
        const url = `${this.novelServiceUrl}${path}`;
        try {
            const requestConfig = {
                url,
                method,
                headers: {
                    ...headers,
                    host: undefined,
                    'if-none-match': undefined,
                    'if-modified-since': undefined,
                },
                params: query,
                validateStatus: (status) => status >= 200 && status < 500,
            };
            if (method !== 'GET' && method !== 'DELETE' && body !== undefined) {
                requestConfig.data = body;
            }
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.request(requestConfig));
            if (response.status === 304) {
                return {
                    success: true,
                    data: null,
                    message: 'Not Modified',
                    cached: true,
                };
            }
            return response.data;
        }
        catch (error) {
            console.error('Novel service request failed:', {
                url,
                method,
                error: error.message,
                response: error.response?.data,
                status: error.response?.status,
            });
            if (error.response) {
                throw error.response.data;
            }
            throw error;
        }
    }
};
exports.NovelService = NovelService;
exports.NovelService = NovelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object, typeof (_b = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _b : Object])
], NovelService);


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
exports.UsersModule = void 0;
const common_1 = __webpack_require__(3);
const axios_1 = __webpack_require__(10);
const users_controller_1 = __webpack_require__(32);
const users_service_1 = __webpack_require__(33);
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [axios_1.HttpModule],
        controllers: [users_controller_1.UsersController],
        providers: [users_service_1.UsersService],
    })
], UsersModule);


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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UsersController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(4);
const express_1 = __webpack_require__(12);
const users_service_1 = __webpack_require__(33);
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async proxyToUserService(req, res) {
        try {
            const response = await this.usersService.proxyRequest(req);
            Object.keys(response.headers).forEach(key => {
                if (key.toLowerCase() !== 'content-encoding') {
                    res.set(key, response.headers[key]);
                }
            });
            res.status(response.status).send(response.data);
        }
        catch (error) {
            console.error('用户服务代理错误:', error);
            if (error.response) {
                res.status(error.response.status).json(error.response.data);
            }
            else {
                throw new common_1.HttpException({
                    message: '用户服务暂时不可用',
                    error: 'User Service Unavailable',
                }, common_1.HttpStatus.SERVICE_UNAVAILABLE);
            }
        }
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.All)('*'),
    (0, swagger_1.ApiExcludeEndpoint)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _b : Object, typeof (_c = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "proxyToUserService", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('用户服务代理'),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [typeof (_a = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _a : Object])
], UsersController);


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
var UsersService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UsersService = void 0;
const common_1 = __webpack_require__(3);
const config_1 = __webpack_require__(6);
const axios_1 = __webpack_require__(10);
const rxjs_1 = __webpack_require__(14);
let UsersService = UsersService_1 = class UsersService {
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.logger = new common_1.Logger(UsersService_1.name);
        this.userServiceUrl = this.configService.get('USER_SERVICE_URL', 'http://localhost:3001');
    }
    async proxyRequest(req) {
        const { method, url, headers, body } = req;
        let targetPath = url;
        const prefixes = ['/api/v1/users', '/users'];
        for (const prefix of prefixes) {
            if (targetPath.startsWith(prefix)) {
                targetPath = targetPath.substring(prefix.length);
                break;
            }
        }
        if (!targetPath.startsWith('/')) {
            targetPath = '/' + targetPath;
        }
        const targetUrl = `${this.userServiceUrl}/api/v1/users${targetPath}`;
        const cleanHeaders = this.cleanHeaders(headers);
        this.logger.log(`代理请求: ${method} ${targetUrl} (原始URL: ${url})`);
        try {
            const requestConfig = {
                method: method,
                url: targetUrl,
                headers: cleanHeaders,
                timeout: 30000,
                validateStatus: () => true,
            };
            if (method !== 'GET' && method !== 'DELETE' && body !== undefined) {
                requestConfig.data = body;
            }
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.request(requestConfig));
            return response;
        }
        catch (error) {
            this.logger.error(`代理请求失败: ${method} ${targetUrl}`, error);
            throw error;
        }
    }
    cleanHeaders(headers) {
        const cleanHeaders = { ...headers };
        const headersToRemove = [
            'host',
            'connection',
            'content-length',
            'transfer-encoding',
            'x-forwarded-for',
            'x-forwarded-proto',
            'x-forwarded-host',
        ];
        headersToRemove.forEach(header => {
            delete cleanHeaders[header];
            delete cleanHeaders[header.toLowerCase()];
        });
        cleanHeaders['x-forwarded-by'] = 'api-gateway';
        cleanHeaders['x-original-host'] = headers.host;
        return cleanHeaders;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object, typeof (_b = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _b : Object])
], UsersService);


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
exports.AiModule = void 0;
const common_1 = __webpack_require__(3);
const ai_controller_1 = __webpack_require__(35);
const ai_service_1 = __webpack_require__(36);
let AiModule = class AiModule {
};
exports.AiModule = AiModule;
exports.AiModule = AiModule = __decorate([
    (0, common_1.Module)({
        controllers: [ai_controller_1.AiController],
        providers: [ai_service_1.AiService],
        exports: [ai_service_1.AiService],
    })
], AiModule);


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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AiController = void 0;
const common_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(4);
const express_1 = __webpack_require__(12);
const ai_service_1 = __webpack_require__(36);
let AiController = class AiController {
    constructor(aiService) {
        this.aiService = aiService;
    }
    async proxyToAiService(req, res) {
        return this.aiService.forwardRequest(req, res);
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.All)('*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _b : Object, typeof (_c = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "proxyToAiService", null);
exports.AiController = AiController = __decorate([
    (0, swagger_1.ApiTags)('ai'),
    (0, swagger_1.ApiExcludeController)(),
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [typeof (_a = typeof ai_service_1.AiService !== "undefined" && ai_service_1.AiService) === "function" ? _a : Object])
], AiController);


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
var AiService_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AiService = void 0;
const common_1 = __webpack_require__(3);
const axios_1 = __webpack_require__(24);
let AiService = AiService_1 = class AiService {
    constructor() {
        this.logger = new common_1.Logger(AiService_1.name);
        const host = process.env.AI_SERVICE_HOST || 'localhost';
        const port = process.env.AI_SERVICE_PORT || '3004';
        this.aiServiceUrl = `http://${host}:${port}`;
    }
    async forwardRequest(req, res) {
        try {
            const targetPath = req.url.replace(/^\/ai/, '');
            const targetUrl = `${this.aiServiceUrl}${targetPath}`;
            this.logger.debug(`转发请求到AI Service: ${targetUrl}`);
            const response = await (0, axios_1.default)({
                method: req.method,
                url: targetUrl,
                headers: {
                    ...req.headers,
                    host: undefined,
                },
                data: req.body,
                params: req.query,
                responseType: 'stream',
            });
            Object.keys(response.headers).forEach((key) => {
                res.setHeader(key, response.headers[key]);
            });
            res.status(response.status);
            response.data.pipe(res);
        }
        catch (error) {
            this.logger.error(`转发到AI Service失败: ${error.message}`);
            if (error.response) {
                res.status(error.response.status).json(error.response.data);
            }
            else {
                res.status(500).json({
                    success: false,
                    message: 'AI服务不可用',
                    error: error.message,
                });
            }
        }
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AiService);


/***/ }),
/* 37 */
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
__exportStar(__webpack_require__(38), exports);
__exportStar(__webpack_require__(39), exports);


/***/ }),
/* 38 */
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
const prisma_service_1 = __webpack_require__(39);
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
var PrismaService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PrismaService = void 0;
const common_1 = __webpack_require__(3);
const config_1 = __webpack_require__(6);
const client_1 = __webpack_require__(40);
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
/* 40 */
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),
/* 41 */
/***/ ((module) => {

module.exports = require("compression");

/***/ }),
/* 42 */
/***/ ((module) => {

module.exports = require("helmet");

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
const compression = __webpack_require__(41);
const helmet_1 = __webpack_require__(42);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
        bodyParser: true,
    });
    const express = __webpack_require__(12);
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));
    app.use((0, helmet_1.default)());
    app.use(compression());
    app.enableCors({
        origin: process.env.NODE_ENV === 'production'
            ? ['https://91writing.com', 'https://www.91writing.com']
            : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:7520'],
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.setGlobalPrefix('api/v1');
    const config = new swagger_1.DocumentBuilder()
        .setTitle('91Writing API Gateway')
        .setDescription('91Writing 商业化平台API网关')
        .setVersion('1.0')
        .addTag('auth', '用户认证')
        .addTag('users', '用户管理')
        .addTag('novels', '小说管理')
        .addTag('ai', 'AI服务')
        .addTag('payments', '支付服务')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
    const port = process.env.API_GATEWAY_PORT || process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 API Gateway is running on: http://localhost:${port}`);
    console.log(`📖 Swagger docs available at: http://localhost:${port}/api/docs`);
}
bootstrap().catch((error) => {
    console.error('❌ Error starting API Gateway:', error);
    process.exit(1);
});

})();

/******/ })()
;