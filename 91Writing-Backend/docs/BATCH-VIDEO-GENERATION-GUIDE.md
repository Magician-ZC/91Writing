# 批量视频生成使用指南

## 概述

本指南介绍如何使用91Writing平台的批量视频生成功能，支持两种模式：
1. **手动批量模式**：用户选择章节，系统批量生成视频
2. **AI智能规划模式**：AI自动计算需要多少章节才能达到目标视频时长

---

## 核心功能

### ✨ 功能亮点

- **批量处理**：一次性为多个章节生成视频
- **AI智能规划**：自动计算章节组合以达到目标时长
- **长视频合成**：自动将多个短视频合并为一个完整视频
- **进度追踪**：实时监控每个章节的生成状态
- **并发控制**：避免API限流，智能控制并发任务数

---

## 使用场景

### 场景1：用户已创建小说，需要批量生成视频

**流程**：
```
1. 用户创建小说 ✅ (手动)
2. AI生成多个章节内容 ✅ (已有功能)
3. 批量选择章节，生成视频 🆕 (本功能)
4. 可选：合并为一个长视频 🆕 (本功能)
```

### 场景2：用户想生成5-10分钟的短剧视频

**流程**：
```
1. 用户创建小说 ✅ (手动)
2. AI生成多个章节内容 ✅ (已有功能)
3. 用户设置目标时长（如600秒=10分钟）
4. AI智能计算需要几个章节 🆕 (本功能)
5. 批量生成并自动合成 🆕 (本功能)
```

---

## API接口说明

### 模式1：手动批量生成

#### 接口：POST /api/video-generation/batch/generate-by-chapters

**请求参数**：
```typescript
{
  "novelId": "小说ID",
  "chapterIds": [
    "chapter-id-1",
    "chapter-id-2",
    "chapter-id-3"
  ],
  "options": {
    "parallelTasks": 2,        // 并发任务数，默认2
    "mergeIntoOne": true,       // 是否合并为一个长视频
    "videoSettings": {
      "sceneCount": 5,          // 每章分镜数
      "videoDuration": 15       // 每章预期时长(秒)
    }
  }
}
```

**响应示例**：
```json
{
  "batchId": "batch-xxx",
  "totalChapters": 3,
  "estimatedDuration": 45,        // 预估总时长(秒)
  "estimatedScenes": 15,          // 预估总分镜数
  "jobs": [
    {
      "chapterId": "chapter-id-1",
      "jobId": "job-1"
    },
    {
      "chapterId": "chapter-id-2",
      "jobId": "job-2"
    },
    {
      "chapterId": "chapter-id-3",
      "jobId": "job-3"
    }
  ],
  "message": "已提交3个章节的视频生成任务，预计总时长0.8分钟"
}
```

---

### 模式2：AI智能规划

#### 接口：POST /api/video-generation/batch/smart-generate

**请求参数**：
```typescript
{
  "novelId": "小说ID",
  "startChapter": 1,             // 从第几章开始
  "targetDuration": 600,         // 目标时长(秒)，如600=10分钟
  "options": {
    "maxChapters": 10,           // 最多使用多少章节
    "autoMerge": true,            // 自动合并为长视频
    "videoSettings": {
      "sceneCount": 5,
      "videoDuration": 15
    }
  }
}
```

**响应示例**：
```json
{
  "batchId": "batch-xxx",
  "recommendedChapters": [1, 2, 3, 4, 5],  // AI推荐的章节
  "totalChapters": 5,
  "estimatedDuration": 600,                // 预估总时长
  "estimatedScenes": 25,                   // 预估总分镜数
  "breakdown": [
    {
      "chapterNumber": 1,
      "chapterTitle": "第一章 开端",
      "wordCount": 2000,
      "estimatedScenes": 5,
      "estimatedDuration": 120,
      "aiReasoning": "包含2个重要场景转换和1个对话场景"
    },
    {
      "chapterNumber": 2,
      "chapterTitle": "第二章 发展",
      "wordCount": 1800,
      "estimatedScenes": 4,
      "estimatedDuration": 100,
      "aiReasoning": "情节较为紧凑，适合4个分镜"
    }
    // ... 更多章节
  ],
  "reasoning": "根据智能分析，推荐使用第1-5章（共5章）生成视频。\n\n预估信息：\n- 总分镜数：25个\n- 预估总时长：600秒（约10.0分钟）\n- 平均每章：5.0个分镜\n\n✅ 预估时长符合目标（目标：10.0分钟）。",
  "jobs": [...]
}
```

**AI智能计算说明**：

系统会综合考虑：
1. **字数分析**：每600字约1个分镜
2. **内容分析**：AI分析章节内容，识别关键场景
3. **时长计算**：每个分镜约3秒
4. **智能推荐**：自动选择章节组合，达到目标时长

---

### 查询批量生成状态

#### 接口：GET /api/video-generation/batch/status/:batchId

**响应示例**：
```json
{
  "batchId": "batch-xxx",
  "status": "PROCESSING",           // PENDING | PROCESSING | COMPLETED | FAILED | CANCELLED
  "totalChapters": 5,
  "completedChapters": 3,            // 已完成
  "failedChapters": 0,               // 失败
  "processingChapters": 2,           // 进行中
  "progress": 60,                    // 整体进度 0-100
  "estimatedDuration": 600,          // 预估总时长
  "actualDuration": 580,             // 实际总时长（完成后）
  "chapters": [
    {
      "chapterId": "ch-1",
      "chapterNumber": 1,
      "status": "COMPLETED",
      "videoUrl": "https://cdn.example.com/ch-1.mp4"
    },
    {
      "chapterId": "ch-2",
      "chapterNumber": 2,
      "status": "COMPLETED",
      "videoUrl": "https://cdn.example.com/ch-2.mp4"
    },
    {
      "chapterId": "ch-3",
      "chapterNumber": 3,
      "status": "COMPLETED",
      "videoUrl": "https://cdn.example.com/ch-3.mp4"
    },
    {
      "chapterId": "ch-4",
      "chapterNumber": 4,
      "status": "GENERATING"
    },
    {
      "chapterId": "ch-5",
      "chapterNumber": 5,
      "status": "PENDING"
    }
  ],
  "mergedVideoUrl": "https://cdn.example.com/merged-video.mp4"  // 合并后的视频
}
```

---

### 合并视频为长视频

#### 接口：POST /api/video-generation/batch/merge/:batchId

**请求参数**：
```typescript
{
  "options": {
    "addChapterTitles": true,      // 添加章节标题
    "addOpening": true,             // 添加片头
    "addEnding": true,              // 添加片尾
    "titleDuration": 2,             // 章节标题显示时长(秒)
    "transitionDuration": 0.3,      // 转场时长(秒)
    "quality": "medium"             // 压缩质量: low | medium | high
  }
}
```

**响应示例**：
```json
{
  "mergedVideoUrl": "https://cdn.example.com/merged-final.mp4",
  "totalDuration": 620,               // 总时长(秒)
  "fileSize": 125000000,              // 文件大小(字节)
  "resolution": "1920x1080",
  "chapterCount": 5
}
```

---

## 使用示例

### 示例1：批量生成3个章节的视频

```typescript
// 1. 提交批量生成任务
const batchResponse = await fetch('/api/video-generation/batch/generate-by-chapters', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    novelId: 'novel-123',
    chapterIds: ['ch-1', 'ch-2', 'ch-3'],
    options: {
      parallelTasks: 2,
      mergeIntoOne: true,
      videoSettings: {
        sceneCount: 5,
        videoDuration: 15
      }
    }
  })
});

const batch = await batchResponse.json();
console.log('批次ID:', batch.batchId);
console.log('预估时长:', batch.estimatedDuration, '秒');

// 2. 轮询查询状态
const statusInterval = setInterval(async () => {
  const statusResponse = await fetch(`/api/video-generation/batch/status/${batch.batchId}`, {
    headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
  });
  
  const status = await statusResponse.json();
  console.log('进度:', status.progress, '%');
  
  if (status.status === 'COMPLETED') {
    clearInterval(statusInterval);
    console.log('完成！合并视频:', status.mergedVideoUrl);
  }
}, 5000); // 每5秒查询一次
```

---

### 示例2：AI智能生成10分钟视频

```typescript
// 1. 让AI智能规划
const smartResponse = await fetch('/api/video-generation/batch/smart-generate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    novelId: 'novel-123',
    startChapter: 1,
    targetDuration: 600,        // 10分钟
    options: {
      maxChapters: 10,
      autoMerge: true
    }
  })
});

const result = await smartResponse.json();

console.log('AI推荐使用章节:', result.recommendedChapters);
console.log('预估时长:', result.estimatedDuration, '秒');
console.log('AI分析:', result.reasoning);

// 查看每章详情
result.breakdown.forEach(chapter => {
  console.log(`第${chapter.chapterNumber}章: ${chapter.estimatedScenes}个分镜, ${chapter.estimatedDuration}秒`);
  console.log(`  AI分析: ${chapter.aiReasoning}`);
});

// 2. 等待完成...
// 3. 下载最终视频
console.log('最终视频:', result.mergedVideoUrl);
```

---

## 完整工作流

### 推荐工作流：从小说创建到视频生成

```typescript
// ========== 第1步：用户创建小说 ==========
const novel = await createNovel({
  title: '时间旅行者',
  description: '一个关于时间旅行的科幻故事',
  genre: '科幻'
});

// ========== 第2步：AI批量生成章节内容 ==========
// 方式A：逐章生成（现有功能）
for (let i = 1; i <= 10; i++) {
  const content = await generateChapterContent({
    novelId: novel.id,
    chapterNumber: i,
    contentType: 'continuation',
    length: 'medium'
  });
  
  await createChapter({
    novelId: novel.id,
    chapterNumber: i,
    title: `第${i}章`,
    content: content.content
  });
}

// 方式B：批量生成（未来可实现）
// await batchGenerateChapters({ novelId: novel.id, count: 10 });

// ========== 第3步：AI智能规划视频生成 ==========
const videoResult = await smartGenerateVideo({
  novelId: novel.id,
  startChapter: 1,
  targetDuration: 600,  // 10分钟短剧
  options: {
    maxChapters: 10,
    autoMerge: true       // 自动合并为一个长视频
  }
});

console.log('🎬 视频生成任务已提交');
console.log('📊 使用章节:', videoResult.recommendedChapters);
console.log('⏱️  预计时长:', (videoResult.estimatedDuration / 60).toFixed(1), '分钟');

// ========== 第4步：监控进度 ==========
async function waitForCompletion(batchId) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const status = await getBatchStatus(batchId);
        
        console.log(`进度: ${status.progress}% (${status.completedChapters}/${status.totalChapters})`);
        
        if (status.status === 'COMPLETED') {
          clearInterval(interval);
          resolve(status);
        } else if (status.status === 'FAILED') {
          clearInterval(interval);
          reject(new Error('视频生成失败'));
        }
      } catch (error) {
        clearInterval(interval);
        reject(error);
      }
    }, 5000);
  });
}

const finalStatus = await waitForCompletion(videoResult.batchId);

// ========== 第5步：获取最终视频 ==========
console.log('🎉 视频生成完成！');
console.log('📹 视频地址:', finalStatus.mergedVideoUrl);
console.log('⏱️  实际时长:', (finalStatus.actualDuration / 60).toFixed(1), '分钟');
console.log('🎬 包含章节:', finalStatus.chapterCount, '章');

// 返回给用户
return {
  videoUrl: finalStatus.mergedVideoUrl,
  duration: finalStatus.actualDuration,
  chapters: finalStatus.chapters
};
```

---

## 性能与限制

### 并发控制

- **默认并发数**：2个任务同时处理
- **推荐并发数**：
  - 免费用户：1个
  - 付费用户：2-3个
  - 企业用户：5个

### API限流保护

系统自动控制调用频率：
- 图片生成API：每秒1次
- 视频生成API：每秒0.5次（每2秒1次）
- 自动重试机制：失败后指数退避重试

### 时长限制

- **单个短视频**：3-5秒/分镜
- **单章视频**：15-30秒（3-8个分镜）
- **长视频**：5-15分钟（多章合成）
- **最大章节数**：建议不超过20章/批次

### 文件大小

- **单个分镜**：约5-10MB
- **单章视频**：约30-50MB
- **长视频**：约100-500MB（压缩后）

---

## 最佳实践

### ✅ 推荐做法

1. **分批处理**：每次处理5-10章，避免任务过多
2. **使用AI规划**：让AI自动计算章节组合，更准确
3. **开启自动合并**：自动生成完整的长视频
4. **监控进度**：定期查询状态，及时发现问题
5. **错误重试**：失败的章节可以单独重新生成

### ❌ 避免做法

1. **不要一次提交过多章节**：超过20章可能导致超时
2. **不要频繁查询状态**：建议每5秒查询一次
3. **不要取消已完成的任务**：浪费资源
4. **不要在视频生成中修改章节**：可能导致不一致

---

## 故障排查

### 问题1：视频生成失败

**可能原因**：
- 章节内容过短（字数<500）
- 章节内容包含敏感词
- API调用失败

**解决方案**：
1. 检查章节内容是否完整
2. 查看错误日志，定位具体原因
3. 单独重新生成失败的章节

### 问题2：合并视频失败

**可能原因**：
- 部分章节视频未完成
- 视频格式不兼容
- 磁盘空间不足

**解决方案**：
1. 确保所有章节视频都已完成
2. 检查服务器磁盘空间
3. 联系技术支持

### 问题3：预估时长不准确

**可能原因**：
- AI分析偏差
- 章节内容复杂度差异大

**解决方案**：
1. 增加maxChapters参数，给AI更多选择空间
2. 手动调整章节选择
3. 查看breakdown详情，了解每章的估算依据

---

## 高级功能

### 自定义片头片尾

```typescript
await mergeBatchVideos(batchId, {
  addOpening: true,   // 自动添加小说标题和简介
  addEnding: true,    // 自动添加结束语
  titleDuration: 2,
  transitionDuration: 0.5
});
```

### 章节标题自定义

```typescript
// 每个章节视频前自动添加标题帧
// 标题格式："第X章 标题名"
// 显示时长：2秒
await mergeBatchVideos(batchId, {
  addChapterTitles: true,
  titleDuration: 2
});
```

### 视频质量控制

```typescript
await mergeBatchVideos(batchId, {
  quality: 'high'  // low | medium | high
});

// low: 快速压缩，文件小，质量一般（适合预览）
// medium: 均衡压缩，文件适中，质量良好（推荐）
// high: 高质量压缩，文件大，质量优秀（发布版）
```

---

## 总结

### 核心优势

✅ **全自动化**：一键提交，自动完成所有步骤
✅ **AI智能**：自动计算最佳章节组合
✅ **批量处理**：大幅提升效率，节省时间
✅ **长视频合成**：自动合并为完整短剧
✅ **实时监控**：随时查看生成进度

### 适用场景

- ✅ 短剧创作者：快速生成5-10分钟短剧
- ✅ 小说作者：为小说生成配套视频
- ✅ 内容创作者：批量生产视频内容
- ✅ 自媒体运营：自动化内容生产

### 下一步

1. 查看 [API完整文档](./API-DOCUMENTATION.md)
2. 了解 [视频生成流程](./AI-AUTOMATION-WORKFLOW-ANALYSIS.md)
3. 学习 [提示词优化](./PROMPT-QUICK-REFERENCE.md)

---

**联系支持**：如有问题，请联系技术支持团队。

