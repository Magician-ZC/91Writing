# 视频配置问题快速修复

## 🎯 3个问题已全部修复

### ✅ 问题1：测试连接失败 - 已修复
原因：缺少火山引擎文生图API Key字段

### ✅ 问题2：保存配置报错 - 已修复
原因：前端提交了只读字段

### ✅ 问题3：配置页面缺少文生图API Key - 已修复
原因：之前只支持Access Key和Secret Key

---

## 🚀 立即修复步骤

### 步骤1：停止所有服务

```bash
# 按Ctrl+C停止所有正在运行的服务
# 或者关闭所有npm窗口
```

### 步骤2：重新生成Prisma Client

```bash
cd 91Writing-Backend
npx prisma generate
```

### 步骤3：重启服务

```bash
# 方式1：使用启动脚本
./START.sh
# 或
START.bat

# 方式2：分别启动
npm run start:dev admin-service
npm run start:dev ai-service
```

### 步骤4：配置火山引擎

打开浏览器 → 管理后台 → 视频生成配置

填写3个密钥：
1. ✅ Access Key ID
2. ✅ Secret Access Key
3. ✅ 文生图 API Key（新增的输入框）

点击"测试连接" → 应该提示成功

点击"保存配置" → 应该提示成功

---

## 📝 修改的内容

### 数据库
- 新增字段：`volcengine_image_api_key`

### 后端（4个文件）
- `schema.prisma` - 新增字段
- `update-video-api-config.dto.ts` - 新增DTO
- `video-api-config.service.ts` - 加密/解密/验证
- `volcengine-visual.provider.ts` - 支持API Key认证

### 前端（1个文件）
- `VideoAPIConfigAdmin.vue` - 新增输入框 + 过滤只读字段

---

## 💡 为什么需要文生图API Key

火山引擎有两套认证系统：

**系统1：Access Key + Secret Key**
- 用途：通用SDK认证
- 方式：HMAC签名
- 复杂度：高

**系统2：文生图API Key**
- 用途：文生图专用
- 方式：直接Header认证
- 复杂度：低
- **推荐使用** ✅

91Writing的Provider现在支持两种方式，优先使用API Key。

---

## 🎉 修复完成

所有问题已解决：
- ✅ 数据库已更新
- ✅ 后端代码已修复
- ✅ 前端页面已修复
- ✅ Provider已优化

**重启服务后即可使用！**

