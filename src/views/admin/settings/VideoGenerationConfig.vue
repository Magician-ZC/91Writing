<template>
  <div class="video-generation-config">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="header-title">
            <el-icon><VideoCamera /></el-icon>
            视频生成完整配置
          </span>
          <el-tag type="success">管理员配置</el-tag>
        </div>
      </template>

      <el-tabs v-model="activeTab" type="border-card">
        <!-- Tab 1: API密钥配置 -->
        <el-tab-pane label="API密钥" name="keys">
          <el-form :model="apiKeysForm" label-width="200px" style="max-width: 900px">
            <!-- 火山引擎 -->
            <el-divider content-position="left">
              <el-icon><Connection /></el-icon>
              火山引擎（文生图Provider）
            </el-divider>
            
            <el-form-item label="Access Key ID">
              <el-input v-model="apiKeysForm.volcengineAccessKeyId" clearable />
            </el-form-item>
            
            <el-form-item label="Secret Access Key">
              <el-input v-model="apiKeysForm.volcengineSecretAccessKey" type="password" show-password clearable />
              <div class="form-tip">注意：密钥将使用AES-256加密后存储</div>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :icon="Connection" @click="testConnection('volcengine')" :loading="testingConnection === 'volcengine'">
                测试火山引擎连接
              </el-button>
            </el-form-item>

            <!-- 即梦 -->
            <el-divider content-position="left">
              <el-icon><Connection /></el-icon>
              即梦（图生视频Provider）
            </el-divider>
            
            <el-form-item label="API Key">
              <el-input v-model="apiKeysForm.jimengApiKey" type="password" show-password clearable />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :icon="Connection" @click="testConnection('jimeng')" :loading="testingConnection === 'jimeng'">
                测试即梦连接
              </el-button>
            </el-form-item>

            <!-- 可灵 -->
            <el-divider content-position="left">
              <el-icon><Connection /></el-icon>
              可灵（图生视频Provider备选）
            </el-divider>
            
            <el-form-item label="API Key">
              <el-input v-model="apiKeysForm.klingApiKey" type="password" show-password clearable />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :icon="Connection" @click="testConnection('kling')" :loading="testingConnection === 'kling'">
                测试可灵连接
              </el-button>
            </el-form-item>

            <!-- Provider选择 -->
            <el-divider content-position="left">Provider选择</el-divider>
            <el-form-item label="图生视频Provider">
              <el-radio-group v-model="apiKeysForm.videoProvider">
                <el-radio label="jimeng">即梦（推荐）</el-radio>
                <el-radio label="kling">可灵（备选）</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- Tab 2: 文生图配置 -->
        <el-tab-pane label="文生图配置" name="text-to-image">
          <el-form :model="imageGenForm" label-width="200px" style="max-width: 900px">
            <el-alert title="文生图参数配置" type="info" :closable="false" show-icon class="mb-4">
              这些参数将作为系统默认值，用户生成视频时可以覆盖
            </el-alert>

            <!-- 基础参数 -->
            <el-divider content-position="left">基础参数</el-divider>

            <el-form-item label="默认分辨率">
              <el-select v-model="imageGenForm.defaultResolution">
                <el-option label="1024x576 (16:9推荐)" value="1024x576" />
                <el-option label="1024x1024 (1:1)" value="1024x1024" />
                <el-option label="1280x720 (HD)" value="1280x720" />
                <el-option label="1920x1080 (Full HD)" value="1920x1080" />
                <el-option label="768x1024 (3:4竖屏)" value="768x1024" />
              </el-select>
              <div class="form-tip">16:9适合短视频，建议使用1024x576</div>
            </el-form-item>

            <el-form-item label="图片质量">
              <el-select v-model="imageGenForm.quality">
                <el-option label="标准质量（推荐）" value="standard" />
                <el-option label="高质量" value="high" />
                <el-option label="超高质量" value="ultra" />
              </el-select>
              <div class="form-tip">质量越高成本越高，标准质量已足够</div>
            </el-form-item>

            <el-form-item label="生成数量">
              <el-input-number v-model="imageGenForm.batchSize" :min="1" :max="4" />
              <span class="unit-label">张/场景</span>
              <div class="form-tip">每个场景生成多少张图片（建议1张）</div>
            </el-form-item>

            <el-form-item label="采样步数">
              <el-slider v-model="imageGenForm.samplingSteps" :min="20" :max="50" :step="5" show-stops />
              <div class="form-tip">步数越多质量越好但耗时越长（建议30）</div>
            </el-form-item>

            <el-form-item label="CFG Scale">
              <el-slider v-model="imageGenForm.cfgScale" :min="1" :max="20" :step="0.5" show-input />
              <div class="form-tip">提示词引导强度（建议7-12）</div>
            </el-form-item>

            <!-- 风格参数 -->
            <el-divider content-position="left">风格参数</el-divider>

            <el-form-item label="默认风格">
              <el-select v-model="imageGenForm.defaultStyle">
                <el-option label="写实风格" value="realistic" />
                <el-option label="动漫风格" value="anime" />
                <el-option label="奇幻风格" value="fantasy" />
                <el-option label="科幻风格" value="scifi" />
                <el-option label="水墨风格" value="ink-painting" />
                <el-option label="油画风格" value="oil-painting" />
              </el-select>
            </el-form-item>

            <el-form-item label="全局负向提示词">
              <el-input
                v-model="imageGenForm.globalNegativePrompt"
                type="textarea"
                :rows="4"
                placeholder="blurry, low quality, distorted, deformed"
              />
              <div class="form-tip">所有生成都会使用的负向提示词</div>
            </el-form-item>

            <el-form-item label="启用一致性控制">
              <el-switch v-model="imageGenForm.enableConsistency" />
              <div class="form-tip">使用参考图保持角色一致性</div>
            </el-form-item>

            <!-- 高级参数 -->
            <el-divider content-position="left">高级参数</el-divider>

            <el-form-item label="种子随机化">
              <el-switch v-model="imageGenForm.randomSeed" active-text="随机" inactive-text="固定" />
              <div class="form-tip">随机种子每次生成不同，固定种子结果可复现</div>
            </el-form-item>

            <el-form-item label="固定种子值" v-if="!imageGenForm.randomSeed">
              <el-input-number v-model="imageGenForm.seedValue" :min="0" />
            </el-form-item>

            <el-form-item label="超时时间">
              <el-input-number v-model="imageGenForm.timeout" :min="30" :max="300" />
              <span class="unit-label">秒</span>
              <div class="form-tip">单张图片生成超时时间</div>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- Tab 3: 图生视频配置 -->
        <el-tab-pane label="图生视频配置" name="image-to-video">
          <el-form :model="videoGenForm" label-width="200px" style="max-width: 900px">
            <el-alert title="图生视频参数配置" type="info" :closable="false" show-icon class="mb-4">
              这些参数将作为系统默认值，用户生成视频时可以覆盖
            </el-alert>

            <!-- 基础参数 -->
            <el-divider content-position="left">基础参数</el-divider>

            <el-form-item label="默认视频时长">
              <el-slider v-model="videoGenForm.defaultDuration" :min="3" :max="30" :marks="durationMarks" show-stops />
              <div class="form-tip">单个场景的视频时长（秒）</div>
            </el-form-item>

            <el-form-item label="视频分辨率">
              <el-select v-model="videoGenForm.resolution">
                <el-option label="1024x576 (16:9推荐)" value="1024x576" />
                <el-option label="720x1280 (9:16竖屏)" value="720x1280" />
                <el-option label="1280x720 (HD)" value="1280x720" />
                <el-option label="1920x1080 (Full HD)" value="1920x1080" />
              </el-select>
              <div class="form-tip">与文生图分辨率保持一致</div>
            </el-form-item>

            <el-form-item label="帧率（FPS）">
              <el-select v-model="videoGenForm.fps">
                <el-option label="24 FPS（电影标准）" :value="24" />
                <el-option label="30 FPS（推荐）" :value="30" />
                <el-option label="60 FPS（高流畅）" :value="60" />
              </el-select>
            </el-form-item>

            <el-form-item label="默认运动幅度">
              <el-radio-group v-model="videoGenForm.defaultMotionIntensity">
                <el-radio label="low">低运动（适合静态场景）</el-radio>
                <el-radio label="medium">中运动（推荐）</el-radio>
                <el-radio label="high">高运动（适合动作场景）</el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- 质量控制 -->
            <el-divider content-position="left">质量控制</el-divider>

            <el-form-item label="视频质量">
              <el-select v-model="videoGenForm.quality">
                <el-option label="标准质量" value="standard" />
                <el-option label="高质量（推荐）" value="high" />
                <el-option label="超高质量" value="ultra" />
              </el-select>
              <div class="form-tip">质量越高文件越大，成本越高</div>
            </el-form-item>

            <el-form-item label="压缩级别">
              <el-select v-model="videoGenForm.compressionLevel">
                <el-option label="低压缩（文件大，质量好）" value="low" />
                <el-option label="中压缩（推荐）" value="medium" />
                <el-option label="高压缩（文件小，质量略降）" value="high" />
              </el-select>
            </el-form-item>

            <!-- 转场效果 -->
            <el-divider content-position="left">转场效果</el-divider>

            <el-form-item label="默认转场效果">
              <el-select v-model="videoGenForm.transitionEffect">
                <el-option label="无转场" value="none" />
                <el-option label="淡入淡出（推荐）" value="fade" />
                <el-option label="交叉溶解" value="crossfade" />
                <el-option label="滑动" value="slide" />
                <el-option label="缩放" value="zoom" />
              </el-select>
            </el-form-item>

            <el-form-item label="转场时长">
              <el-slider v-model="videoGenForm.transitionDuration" :min="0.5" :max="2" :step="0.1" show-input />
              <span class="unit-label">秒</span>
            </el-form-item>

            <!-- 高级参数 -->
            <el-divider content-position="left">高级参数</el-divider>

            <el-form-item label="超时时间">
              <el-input-number v-model="videoGenForm.timeout" :min="60" :max="600" />
              <span class="unit-label">秒</span>
              <div class="form-tip">单个视频生成超时时间</div>
            </el-form-item>

            <el-form-item label="最大重试次数">
              <el-input-number v-model="videoGenForm.maxRetries" :min="0" :max="5" />
              <div class="form-tip">生成失败后的自动重试次数</div>
            </el-form-item>

            <el-form-item label="启用人物一致性">
              <el-switch v-model="videoGenForm.enableCharacterConsistency" />
              <div class="form-tip">使用AI提取的角色特征保持人物一致性</div>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- Tab 4: 默认生成配置 -->
        <el-tab-pane label="默认生成配置" name="defaults">
          <el-form :model="defaultsForm" label-width="200px" style="max-width: 900px">
            <el-alert title="用户默认配置" type="info" :closable="false" show-icon class="mb-4">
              用户点击"生成视频"时的默认配置，用户可以在生成对话框中修改
            </el-alert>

            <!-- 分镜配置 -->
            <el-divider content-position="left">分镜配置</el-divider>

            <el-form-item label="默认分镜数量">
              <el-slider v-model="defaultsForm.defaultSceneCount" :min="3" :max="10" :marks="sceneMarks" show-stops />
              <div class="form-tip">建议3-8个场景</div>
            </el-form-item>

            <el-form-item label="分镜最小字数">
              <el-input-number v-model="defaultsForm.minSceneWords" :min="50" :max="500" />
              <span class="unit-label">字</span>
              <div class="form-tip">每个分镜场景至少包含的字数</div>
            </el-form-item>

            <!-- 视频配置 -->
            <el-divider content-position="left">视频配置</el-divider>

            <el-form-item label="默认视频总时长">
              <el-slider v-model="defaultsForm.defaultTotalDuration" :min="15" :max="60" :marks="totalDurationMarks" show-stops />
              <span class="unit-label">秒</span>
              <div class="form-tip">整个视频的总时长</div>
            </el-form-item>

            <el-form-item label="添加标题帧">
              <el-switch v-model="defaultsForm.addTitleFrame" active-text="添加" inactive-text="不添加" />
              <div class="form-tip">在视频开头添加章节标题</div>
            </el-form-item>

            <el-form-item label="标题帧时长" v-if="defaultsForm.addTitleFrame">
              <el-slider v-model="defaultsForm.titleFrameDuration" :min="1" :max="5" show-input />
              <span class="unit-label">秒</span>
            </el-form-item>

            <!-- 背景音乐 -->
            <el-divider content-position="left">背景音乐</el-divider>

            <el-form-item label="启用背景音乐">
              <el-switch v-model="defaultsForm.enableBackgroundMusic" />
              <div class="form-tip">自动添加背景音乐（开发中）</div>
            </el-form-item>

            <el-form-item label="音乐类型" v-if="defaultsForm.enableBackgroundMusic">
              <el-select v-model="defaultsForm.musicType">
                <el-option label="轻音乐" value="light" />
                <el-option label="史诗音乐" value="epic" />
                <el-option label="悬疑音乐" value="suspense" />
                <el-option label="浪漫音乐" value="romantic" />
                <el-option label="动作音乐" value="action" />
              </el-select>
            </el-form-item>

            <el-form-item label="音量">
              <el-slider v-model="defaultsForm.musicVolume" :min="0" :max="100" show-input />
              <span class="unit-label">%</span>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- Tab 5: 成本和配额 -->
        <el-tab-pane label="成本和配额" name="cost">
          <el-form :model="costForm" label-width="200px" style="max-width: 900px">
            <!-- 配额设置 -->
            <el-divider content-position="left">用户配额</el-divider>

            <el-form-item label="免费用户每日配额">
              <el-input-number v-model="costForm.freeDailyQuota" :min="0" :max="10" />
              <span class="unit-label">个视频/天</span>
            </el-form-item>

            <el-form-item label="免费用户每月配额">
              <el-input-number v-model="costForm.freeMonthlyQuota" :min="0" :max="30" />
              <span class="unit-label">个视频/月</span>
            </el-form-item>

            <el-form-item label="付费用户每日配额">
              <el-input-number v-model="costForm.paidDailyQuota" :min="0" :max="100" />
              <span class="unit-label">个视频/天</span>
            </el-form-item>

            <el-form-item label="付费用户每月配额">
              <el-input-number v-model="costForm.paidMonthlyQuota" :min="0" :max="1000" />
              <span class="unit-label">个视频/月</span>
            </el-form-item>

            <!-- 成本控制 -->
            <el-divider content-position="left">成本控制</el-divider>

            <el-form-item label="单图片成本">
              <el-input-number v-model="costForm.costPerImage" :min="0" :max="1" :step="0.01" :precision="2" />
              <span class="unit-label">元/张</span>
              <div class="form-tip">火山引擎文生图单价</div>
            </el-form-item>

            <el-form-item label="单视频成本">
              <el-input-number v-model="costForm.costPerVideo" :min="0" :max="10" :step="0.1" :precision="2" />
              <span class="unit-label">元/段</span>
              <div class="form-tip">即梦/可灵图生视频单价</div>
            </el-form-item>

            <el-form-item label="月度预算">
              <el-input-number v-model="costForm.monthlyBudget" :min="0" :step="100" :precision="2" />
              <span class="unit-label">元</span>
            </el-form-item>

            <el-form-item label="成本警报阈值">
              <el-input-number v-model="costForm.costAlertThreshold" :min="0" :step="50" :precision="2" />
              <span class="unit-label">元</span>
            </el-form-item>

            <!-- 实时成本统计 -->
            <el-divider content-position="left">本月成本统计</el-divider>
            
            <el-row :gutter="20" class="statistics-row">
              <el-col :span="6">
                <el-statistic title="已使用成本" :value="costStats.totalCost" suffix="元" />
              </el-col>
              <el-col :span="6">
                <el-statistic title="剩余预算" :value="costStats.remainingBudget" suffix="元" />
              </el-col>
              <el-col :span="6">
                <el-statistic title="图片生成" :value="costStats.imagesGenerated" />
              </el-col>
              <el-col :span="6">
                <el-statistic title="视频生成" :value="costStats.videosGenerated" />
              </el-col>
            </el-row>

            <el-progress 
              :percentage="costStats.budgetUsagePercentage" 
              :color="progressColor"
              :stroke-width="20"
              class="budget-progress"
            >
              <template #default="{ percentage }">
                <span class="percentage-value">预算使用: {{ percentage }}%</span>
              </template>
            </el-progress>
          </el-form>
        </el-tab-pane>

        <!-- Tab 6: 路径和存储 -->
        <el-tab-pane label="路径和存储" name="paths">
          <el-form :model="pathsForm" label-width="200px" style="max-width: 900px">
            <!-- FFmpeg -->
            <el-divider content-position="left">FFmpeg配置</el-divider>

            <el-form-item label="FFmpeg路径">
              <el-input v-model="pathsForm.ffmpegPath">
                <template #append>
                  <el-button :icon="Search" @click="detectFFmpeg">自动检测</el-button>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="FFmpeg质量预设">
              <el-select v-model="pathsForm.ffmpegPreset">
                <el-option label="ultrafast（最快）" value="ultrafast" />
                <el-option label="fast（快速）" value="fast" />
                <el-option label="medium（推荐）" value="medium" />
                <el-option label="slow（高质量）" value="slow" />
                <el-option label="veryslow（最高质量）" value="veryslow" />
              </el-select>
              <div class="form-tip">速度与质量的平衡，medium适合大多数情况</div>
            </el-form-item>

            <!-- 存储路径 -->
            <el-divider content-position="left">存储路径</el-divider>

            <el-form-item label="视频存储路径">
              <el-input v-model="pathsForm.videoStoragePath" placeholder="/data/videos" />
              <div class="form-tip">生成的最终视频存储路径</div>
            </el-form-item>

            <el-form-item label="临时文件路径">
              <el-input v-model="pathsForm.tempStoragePath" placeholder="/tmp/video-generation" />
              <div class="form-tip">生成过程中的临时文件路径</div>
            </el-form-item>

            <el-form-item label="自动清理临时文件">
              <el-switch v-model="pathsForm.autoCleanTemp" active-text="开启" inactive-text="关闭" />
              <div class="form-tip">生成完成后自动删除临时文件</div>
            </el-form-item>

            <el-form-item label="临时文件保留时间" v-if="!pathsForm.autoCleanTemp">
              <el-input-number v-model="pathsForm.tempFileRetention" :min="1" :max="72" />
              <span class="unit-label">小时</span>
            </el-form-item>

            <!-- CDN配置 -->
            <el-divider content-position="left">CDN配置（可选）</el-divider>

            <el-form-item label="启用CDN上传">
              <el-switch v-model="pathsForm.enableCDN" />
              <div class="form-tip">生成后自动上传到CDN</div>
            </el-form-item>

            <el-form-item label="CDN类型" v-if="pathsForm.enableCDN">
              <el-select v-model="pathsForm.cdnProvider">
                <el-option label="阿里云OSS" value="aliyun-oss" />
                <el-option label="腾讯云COS" value="tencent-cos" />
                <el-option label="七牛云" value="qiniu" />
                <el-option label="AWS S3" value="aws-s3" />
              </el-select>
            </el-form-item>

            <el-form-item label="CDN访问域名" v-if="pathsForm.enableCDN">
              <el-input v-model="pathsForm.cdnDomain" placeholder="https://cdn.example.com" />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- Tab 7: 并发和性能 -->
        <el-tab-pane label="并发和性能" name="performance">
          <el-form :model="performanceForm" label-width="200px" style="max-width: 900px">
            <!-- 并发控制 -->
            <el-divider content-position="left">并发控制</el-divider>

            <el-form-item label="最大并发任务数">
              <el-input-number v-model="performanceForm.maxConcurrentTasks" :min="1" :max="10" />
              <div class="form-tip">同时进行的视频生成任务数量</div>
            </el-form-item>

            <el-form-item label="图片生成并发数">
              <el-input-number v-model="performanceForm.imageGenConcurrency" :min="1" :max="5" />
              <div class="form-tip">单个任务内同时生成图片的数量</div>
            </el-form-item>

            <el-form-item label="视频生成并发数">
              <el-input-number v-model="performanceForm.videoGenConcurrency" :min="1" :max="3" />
              <div class="form-tip">单个任务内同时生成视频片段的数量</div>
            </el-form-item>

            <!-- 性能优化 -->
            <el-divider content-position="left">性能优化</el-divider>

            <el-form-item label="启用缓存">
              <el-switch v-model="performanceForm.enableCache" />
              <div class="form-tip">缓存生成结果，相同参数直接返回</div>
            </el-form-item>

            <el-form-item label="缓存过期时间" v-if="performanceForm.enableCache">
              <el-input-number v-model="performanceForm.cacheExpiration" :min="1" :max="168" />
              <span class="unit-label">小时</span>
            </el-form-item>

            <el-form-item label="启用队列系统">
              <el-switch v-model="performanceForm.enableQueue" />
              <div class="form-tip">使用Bull队列管理任务</div>
            </el-form-item>

            <el-form-item label="队列优先级策略" v-if="performanceForm.enableQueue">
              <el-select v-model="performanceForm.queuePriority">
                <el-option label="先进先出（FIFO）" value="fifo" />
                <el-option label="会员优先" value="vip-first" />
                <el-option label="付费优先" value="paid-first" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <!-- 底部操作按钮 -->
      <div class="action-buttons">
        <el-button 
          type="primary" 
          size="large" 
          :icon="Check" 
          @click="saveAllConfigs"
          :loading="saving"
        >
          保存所有配置
        </el-button>
        <el-button 
          size="large" 
          :icon="Refresh" 
          @click="loadAllConfigs"
        >
          重新加载
        </el-button>
        <el-button 
          size="large" 
          :icon="Download" 
          @click="exportConfig"
        >
          导出配置
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  VideoCamera, 
  Connection, 
  Search, 
  Check, 
  Refresh, 
  Download 
} from '@element-plus/icons-vue'
import apiManager from '@/services/apiManager'

// 状态
const activeTab = ref('keys')
const loading = ref(false)
const saving = ref(false)
const testingConnection = ref(null)

// API密钥表单
const apiKeysForm = reactive({
  volcengineAccessKeyId: '',
  volcengineSecretAccessKey: '',
  jimengApiKey: '',
  klingApiKey: '',
  videoProvider: 'jimeng'
})

// 文生图配置
const imageGenForm = reactive({
  defaultResolution: '1024x576',
  quality: 'standard',
  batchSize: 1,
  samplingSteps: 30,
  cfgScale: 7.5,
  defaultStyle: 'realistic',
  globalNegativePrompt: 'blurry, low quality, distorted, deformed, disfigured, ugly, bad anatomy, bad proportions, duplicate, watermark, signature, text',
  enableConsistency: true,
  randomSeed: true,
  seedValue: 42,
  timeout: 60
})

// 图生视频配置
const videoGenForm = reactive({
  defaultDuration: 5,
  resolution: '1024x576',
  fps: 30,
  defaultMotionIntensity: 'medium',
  quality: 'high',
  compressionLevel: 'medium',
  transitionEffect: 'fade',
  transitionDuration: 0.5,
  timeout: 120,
  maxRetries: 2,
  enableCharacterConsistency: true
})

// 默认生成配置
const defaultsForm = reactive({
  defaultSceneCount: 5,
  minSceneWords: 100,
  defaultTotalDuration: 30,
  addTitleFrame: true,
  titleFrameDuration: 2,
  enableBackgroundMusic: false,
  musicType: 'light',
  musicVolume: 30
})

// 成本和配额
const costForm = reactive({
  freeDailyQuota: 2,
  freeMonthlyQuota: 10,
  paidDailyQuota: 10,
  paidMonthlyQuota: 100,
  costPerImage: 0.02,
  costPerVideo: 1.5,
  monthlyBudget: 1000,
  costAlertThreshold: 800
})

// 路径配置
const pathsForm = reactive({
  ffmpegPath: '/usr/bin/ffmpeg',
  ffmpegPreset: 'medium',
  videoStoragePath: '/data/videos',
  tempStoragePath: '/tmp/video-generation',
  autoCleanTemp: true,
  tempFileRetention: 24,
  enableCDN: false,
  cdnProvider: 'aliyun-oss',
  cdnDomain: ''
})

// 性能配置
const performanceForm = reactive({
  maxConcurrentTasks: 3,
  imageGenConcurrency: 2,
  videoGenConcurrency: 1,
  enableCache: false,
  cacheExpiration: 24,
  enableQueue: true,
  queuePriority: 'fifo'
})

// 成本统计
const costStats = reactive({
  totalCost: 0,
  remainingBudget: 1000,
  budgetUsagePercentage: 0,
  imagesGenerated: 0,
  videosGenerated: 0
})

// 滑块标记
const sceneMarks = {
  3: '3个',
  5: '5个',
  8: '8个',
  10: '10个'
}

const durationMarks = {
  3: '3秒',
  5: '5秒',
  10: '10秒',
  15: '15秒'
}

const totalDurationMarks = {
  15: '15秒',
  30: '30秒',
  45: '45秒',
  60: '60秒'
}

// 计算属性
const progressColor = computed(() => {
  const percentage = costStats.budgetUsagePercentage
  if (percentage >= 90) return '#f56c6c'
  if (percentage >= 80) return '#e6a23c'
  return '#67c23a'
})

// 方法
const loadAllConfigs = async () => {
  loading.value = true
  try {
    // 加载API配置
    const apiResponse = await apiManager.get('/api/v1/admin/video-api-config')
    if (apiResponse.data) {
      Object.assign(apiKeysForm, apiResponse.data)
    }

    // 加载统计数据
    await loadStatistics()

    // TODO: 加载其他配置（从SystemConfig表）
    
    ElMessage.success('配置加载成功')
  } catch (error) {
    ElMessage.error(error.message || '加载配置失败')
  } finally {
    loading.value = false
  }
}

const saveAllConfigs = async () => {
  saving.value = true
  try {
    // 保存API密钥配置
    await apiManager.put('/api/v1/admin/video-api-config', {
      ...apiKeysForm,
      userDailyQuota: costForm.paidDailyQuota,
      userMonthlyQuota: costForm.paidMonthlyQuota,
      monthlyBudget: costForm.monthlyBudget,
      costAlertThreshold: costForm.costAlertThreshold,
      ffmpegPath: pathsForm.ffmpegPath,
      videoStoragePath: pathsForm.videoStoragePath,
      tempStoragePath: pathsForm.tempStoragePath
    })

    // TODO: 保存其他配置到SystemConfig表
    // 包括文生图配置、图生视频配置、默认配置等

    ElMessage.success('配置保存成功')
    await loadAllConfigs()
  } catch (error) {
    ElMessage.error(error.message || '保存配置失败')
  } finally {
    saving.value = false
  }
}

const loadStatistics = async () => {
  try {
    const response = await apiManager.get('/api/v1/admin/video-api-config/statistics')
    if (response.data) {
      Object.assign(costStats, response.data)
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const testConnection = async (provider) => {
  testingConnection.value = provider
  try {
    const response = await apiManager.post(`/api/v1/admin/video-api-config/test/${provider}`)
    if (response.data.success) {
      ElMessage.success(response.data.message)
    } else {
      ElMessage.warning(response.data.message)
    }
  } catch (error) {
    ElMessage.error(error.message || '连接测试失败')
  } finally {
    testingConnection.value = null
  }
}

const detectFFmpeg = async () => {
  try {
    ElMessage.info('正在检测FFmpeg路径...')
    // TODO: 调用后端API检测FFmpeg
    setTimeout(() => {
      pathsForm.ffmpegPath = '/usr/bin/ffmpeg'
      ElMessage.success('FFmpeg检测完成')
    }, 1000)
  } catch (error) {
    ElMessage.error('检测失败')
  }
}

const exportConfig = () => {
  const config = {
    apiKeys: apiKeysForm,
    imageGeneration: imageGenForm,
    videoGeneration: videoGenForm,
    defaults: defaultsForm,
    cost: costForm,
    paths: pathsForm,
    performance: performanceForm,
    exportedAt: new Date()
  }

  const dataStr = JSON.stringify(config, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `video-generation-config-${new Date().getTime()}.json`
  link.click()
  
  URL.revokeObjectURL(url)
  ElMessage.success('配置已导出')
}

// 生命周期
onMounted(() => {
  loadAllConfigs()
})
</script>

<style scoped lang="scss">
.video-generation-config {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 500;
    }
  }

  .mb-4 {
    margin-bottom: 16px;
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }

  .unit-label {
    margin-left: 8px;
    color: #606266;
  }

  .statistics-row {
    margin: 20px 0;
  }

  .budget-progress {
    margin: 20px 0;

    .percentage-value {
      font-size: 14px;
      font-weight: 500;
    }
  }

  .action-buttons {
    display: flex;
    gap: 12px;
    justify-content: center;
    padding: 30px 0;
    margin-top: 20px;
    border-top: 1px solid #ebeef5;
  }
}
</style>

