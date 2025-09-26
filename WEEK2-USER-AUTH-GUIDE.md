# Week 2 用户认证系统使用指南

> **创建日期**: 2024年12月19日  
> **适用版本**: Week 2 开发版本  
> **系统状态**: 开发环境就绪

## 🚀 快速开始

### 1. 启动开发环境

```bash
# 1. 启动前端开发服务器
npm run dev

# 2. 启动后端服务 (在91Writing-Backend目录)
cd 91Writing-Backend
npm run start:dev
```

### 2. 访问系统

- **前端地址**: http://localhost:5173
- **后端API**: http://localhost:3001
- **API文档**: http://localhost:3001/api/docs (Swagger)

## 🔐 认证功能使用

### 用户注册

1. 访问注册页面: `/auth/register`
2. 填写必要信息:
   - 邮箱地址 (必填)
   - 密码 (至少8位，包含大小写字母和数字)
   - 昵称 (可选)
   - 邀请码 (可选)
3. 同意服务条款和隐私政策
4. 点击"立即注册"

### 用户登录

1. 访问登录页面: `/auth/login`
2. 输入邮箱和密码
3. 可选择"记住登录状态"
4. 点击"登录"

### 演示账户体验

如果您想快速体验系统功能:

1. 在登录页面点击"体验演示账户"
2. 系统会自动填入演示账户信息
3. 确认后即可体验完整功能

### 用户资料管理

登录后，点击右上角头像可以:

- **个人资料**: 查看和编辑个人信息
- **我的订阅**: 查看订阅状态 (如有)
- **退出登录**: 安全退出系统

## 🛠️ 开发环境配置

### 环境变量配置

创建 `.env.development` 文件 (如果不存在):

```env
# API基础URL
VITE_API_BASE_URL=http://localhost:3001

# 应用信息
VITE_APP_TITLE=91Writing - 智能写作平台
VITE_APP_VERSION=1.0.0
```

### 后端API配置

确保后端服务已启动并配置正确:

```javascript
// 后端服务端口: 3001
// 数据库: MySQL (已配置)
// 认证方式: JWT Token
```

## 🔧 技术架构说明

### 前端技术栈

- **框架**: Vue 3.3.8 + Composition API
- **状态管理**: Pinia 2.1.7
- **路由**: Vue Router 4.x
- **UI库**: Element Plus 2.4.2
- **HTTP客户端**: Axios
- **构建工具**: Vite 4.x

### 认证流程

```
前端页面 ↔ AuthStore ↔ AuthService ↔ 后端API
    ↓         ↓          ↓         ↓
  用户交互   状态管理    HTTP请求   JWT认证
```

### 数据流

```
用户操作 → 表单验证 → API请求 → 状态更新 → 界面刷新
```

## 📱 功能特性

### 已实现功能

- ✅ 用户注册/登录/登出
- ✅ JWT Token自动刷新
- ✅ 路由权限控制
- ✅ 用户状态持久化
- ✅ 密码强度检测
- ✅ 表单实时验证
- ✅ 错误统一处理
- ✅ 响应式界面设计
- ✅ 用户资料管理
- ✅ 忘记密码功能

### 安全特性

- ✅ JWT Token认证
- ✅ 自动Token刷新
- ✅ 路由权限守卫
- ✅ XSS防护
- ✅ CSRF保护
- ✅ 密码加密存储

## 🐛 常见问题

### 1. 登录失败

**问题**: 输入正确账号密码但登录失败

**解决方案**:
- 检查后端服务是否启动
- 检查API接口地址配置
- 查看浏览器控制台错误信息
- 检查网络连接

### 2. Token过期

**问题**: 操作过程中提示Token过期

**解决方案**:
- 系统会自动刷新Token，等待几秒重试
- 如果自动刷新失败，请重新登录
- 检查系统时间是否正确

### 3. 页面无法访问

**问题**: 访问某些页面时跳转到登录页

**解决方案**:
- 这是正常的权限控制行为
- 请先登录再访问需要认证的页面
- 检查用户权限等级

### 4. 样式显示异常

**问题**: 界面样式不正常

**解决方案**:
- 清除浏览器缓存
- 检查Element Plus是否正确加载
- 使用开发者工具检查CSS加载

## 🔍 调试技巧

### 开发者工具

1. **Network面板**: 查看API请求响应
2. **Application面板**: 查看localStorage中的用户数据
3. **Console面板**: 查看错误日志和调试信息

### Vue DevTools

安装Vue DevTools浏览器扩展可以:
- 查看Pinia状态
- 监控组件状态变化
- 调试路由跳转

### 常用调试命令

```javascript
// 在浏览器控制台中使用

// 查看当前用户状态
console.log(window.__VUE_APP__?.appContext?.provides?.authStore)

// 查看路由信息
console.log(window.__VUE_APP__?.appContext?.provides?.router)

// 手动清除认证状态
localStorage.removeItem('auth-tokens')
localStorage.removeItem('auth-user')
```

## 📚 开发文档

### 相关文档

- [商业化升级方案](./91Writing-Commercial-Upgrade-Plan.md)
- [实施路线图](./91Writing-Implementation-Roadmap.md)
- [Week 2完成报告](./TASK-2.1-2.4-COMPLETION-REPORT.md)
- [NestJS实施指南](./91Writing-NestJS-Implementation-Guide.md)

### API文档

后端API文档可通过Swagger访问:
- URL: http://localhost:3001/api/docs
- 包含完整的接口定义和测试功能

## 💡 使用建议

### 开发建议

1. **保持代码规范**: 使用ESLint检查代码质量
2. **及时提交代码**: 完成功能后及时commit
3. **测试功能**: 每次修改后测试相关功能
4. **查看日志**: 遇到问题时查看控制台日志

### 测试建议

1. **多浏览器测试**: 在不同浏览器中测试功能
2. **响应式测试**: 测试移动端和桌面端显示
3. **网络测试**: 测试网络断线重连情况
4. **边界测试**: 测试各种边界条件

## 🎯 下一步发展

### Week 3 计划

- [ ] 现有功能API化改造
- [ ] 数据迁移脚本开发
- [ ] 云端同步功能
- [ ] 双模式兼容

### 长期规划

- [ ] 多语言支持
- [ ] 主题切换
- [ ] 社交登录
- [ ] 单点登录(SSO)

---

**文档版本**: v1.0  
**最后更新**: 2024年12月19日  
**维护团队**: 91Writing开发团队

如有任何问题，请查看开发文档或联系开发团队。
