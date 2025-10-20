<template>
  <div class="migration-wizard">
    <el-card class="wizard-container" shadow="always">
      <template #header>
        <div class="wizard-header">
          <h2>📦 数据迁移向导</h2>
          <p class="subtitle">将你的本地数据迁移到云端，享受多设备同步</p>
        </div>
      </template>

      <!-- 步骤指示器 -->
      <el-steps :active="currentStep" align-center finish-status="success">
        <el-step title="检测数据" description="扫描本地数据" />
        <el-step title="选择内容" description="选择要迁移的数据" />
        <el-step title="开始迁移" description="上传到云端" />
        <el-step title="完成" description="迁移完成" />
      </el-steps>

      <!-- 步骤内容 -->
      <div class="step-content">
        <!-- 步骤1: 检测数据 -->
        <div v-if="currentStep === 0" class="step-panel">
          <div class="detect-panel">
            <el-icon :size="80" color="#409eff"><FolderOpened /></el-icon>
            <h3>检测本地数据</h3>
            <p>我们将扫描你的浏览器本地存储，查找可迁移的数据</p>
            
            <div v-if="!detecting && !detected" class="action-area">
              <el-button type="primary" size="large" @click="detectLocalData">
                <el-icon><Search /></el-icon>
                开始检测
              </el-button>
            </div>

            <div v-if="detecting" class="loading-area">
              <el-icon class="is-loading" :size="40"><Loading /></el-icon>
              <p>正在扫描本地数据...</p>
            </div>

            <div v-if="detected && localDataStats" class="stats-area">
              <el-descriptions title="检测结果" :column="2" border>
                <el-descriptions-item label="小说数量">
                  <el-tag type="success">{{ localDataStats.novelsCount }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="章节数量">
                  <el-tag type="primary">{{ localDataStats.chaptersCount }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="角色数量">
                  <el-tag type="warning">{{ localDataStats.charactersCount }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="世界观设定">
                  <el-tag type="info">{{ localDataStats.worldSettingsCount }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="数据大小">
                  <el-tag>{{ formatFileSize(localDataStats.totalSize) }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="预计时间">
                  <el-tag>{{ estimateTime(localDataStats.totalSize) }}</el-tag>
                </el-descriptions-item>
              </el-descriptions>

              <el-alert
                v-if="localDataStats.novelsCount === 0"
                title="未检测到本地数据"
                type="warning"
                description="没有找到可迁移的数据。如果你已经迁移过，可以直接使用云端功能。"
                show-icon
                :closable="false"
                style="margin-top: 20px;"
              />

              <div class="action-buttons" v-if="localDataStats.novelsCount > 0">
                <el-button @click="currentStep = 0; detected = false">重新检测</el-button>
                <el-button type="primary" @click="currentStep = 1">下一步</el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 步骤2: 选择内容 -->
        <div v-if="currentStep === 1" class="step-panel">
          <h3>选择要迁移的数据</h3>
          <p class="hint">建议全选，确保数据完整性</p>

          <el-checkbox-group v-model="selectedTypes" class="type-checkboxes">
            <el-checkbox label="novels" :disabled="!localDataStats.novelsCount">
              小说及章节 ({{ localDataStats.novelsCount }}部)
            </el-checkbox>
            <el-checkbox label="characters" :disabled="!localDataStats.charactersCount">
              角色设定 ({{ localDataStats.charactersCount }}个)
            </el-checkbox>
            <el-checkbox label="worldSettings" :disabled="!localDataStats.worldSettingsCount">
              世界观设定 ({{ localDataStats.worldSettingsCount }}个)
            </el-checkbox>
          </el-checkbox-group>

          <el-alert
            title="注意事项"
            type="info"
            :closable="false"
            style="margin-top: 20px;"
          >
            <ul>
              <li>迁移过程中请保持网络连接</li>
              <li>迁移完成后，本地数据不会被删除</li>
              <li>如果云端已有同名小说，将创建副本</li>
            </ul>
          </el-alert>

          <div class="action-buttons">
            <el-button @click="currentStep = 0">上一步</el-button>
            <el-button 
              type="primary" 
              @click="currentStep = 2"
              :disabled="selectedTypes.length === 0"
            >
              下一步
            </el-button>
          </div>
        </div>

        <!-- 步骤3: 开始迁移 -->
        <div v-if="currentStep === 2" class="step-panel">
          <h3>准备迁移</h3>
          
          <div v-if="!migrating && !migrationComplete" class="pre-migration">
            <el-descriptions title="迁移清单" :column="1" border>
              <el-descriptions-item label="迁移内容">
                {{ selectedTypes.map(t => typeNames[t]).join('、') }}
              </el-descriptions-item>
              <el-descriptions-item label="数据量">
                约 {{ formatFileSize(localDataStats.totalSize) }}
              </el-descriptions-item>
              <el-descriptions-item label="预计时间">
                {{ estimateTime(localDataStats.totalSize) }}
              </el-descriptions-item>
            </el-descriptions>

            <div class="action-buttons">
              <el-button @click="currentStep = 1">上一步</el-button>
              <el-button type="primary" size="large" @click="startMigration">
                <el-icon><Upload /></el-icon>
                开始迁移
              </el-button>
            </div>
          </div>

          <div v-if="migrating" class="migrating-panel">
            <div class="progress-area">
              <el-icon class="is-loading" :size="60" color="#409eff"><Loading /></el-icon>
              <h3>正在迁移数据...</h3>
              <p>{{ migrationStatus }}</p>
              
              <el-progress
                :percentage="migrationProgress"
                :stroke-width="20"
                :text-inside="true"
                striped
                striped-flow
              />

              <div class="migration-details">
                <p>已处理: {{ processedCount }} / {{ totalCount }}</p>
                <p v-if="currentMigratingItem">当前: {{ currentMigratingItem }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 步骤4: 完成 -->
        <div v-if="currentStep === 3" class="step-panel">
          <div class="complete-panel">
            <el-result
              icon="success"
              title="迁移完成"
              sub-title="你的数据已成功迁移到云端"
            >
              <template #extra>
                <el-descriptions title="迁移结果" :column="2" border>
                  <el-descriptions-item label="成功">
                    <el-tag type="success">{{ migrationResult.success }}</el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="失败">
                    <el-tag type="danger">{{ migrationResult.failed }}</el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="总耗时">
                    {{ formatDuration(migrationResult.duration) }}
                  </el-descriptions-item>
                  <el-descriptions-item label="数据大小">
                    {{ formatFileSize(migrationResult.totalSize) }}
                  </el-descriptions-item>
                </el-descriptions>

                <div class="action-buttons" style="margin-top: 30px;">
                  <el-button @click="viewMigrationHistory">查看迁移历史</el-button>
                  <el-button type="primary" @click="goToNovels">
                    前往我的小说
                  </el-button>
                </div>
              </template>
            </el-result>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { FolderOpened, Search, Loading, Upload } from '@element-plus/icons-vue'
import apiManager from '@/services/apiManager'
import localStorageManager from '@/services/localStorageManager'

const router = useRouter()

// 数据
const currentStep = ref(0)
const detecting = ref(false)
const detected = ref(false)
const migrating = ref(false)
const migrationComplete = ref(false)

const localDataStats = ref(null)
const selectedTypes = ref([])
const migrationStatus = ref('')
const migrationProgress = ref(0)
const processedCount = ref(0)
const totalCount = ref(0)
const currentMigratingItem = ref('')

const migrationResult = reactive({
  success: 0,
  failed: 0,
  duration: 0,
  totalSize: 0
})

const typeNames = {
  novels: '小说及章节',
  characters: '角色设定',
  worldSettings: '世界观设定'
}

// 方法
const detectLocalData = async () => {
  detecting.value = true
  
  try {
    // 模拟检测延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 从localStorage读取数据
    const novels = localStorageManager.getAllNovels() || []
    let chaptersCount = 0
    let charactersCount = 0
    let worldSettingsCount = 0
    
    novels.forEach(novel => {
      chaptersCount += (novel.chapters || []).length
      charactersCount += (novel.characters || []).length
      worldSettingsCount += (novel.worldSettings || []).length
    })

    const stats = {
      novelsCount: novels.length,
      chaptersCount,
      charactersCount,
      worldSettingsCount,
      totalSize: calculateDataSize(novels)
    }

    localDataStats.value = stats
    detected.value = true

    // 自动选中有数据的类型
    if (stats.novelsCount > 0) selectedTypes.value.push('novels')
    if (stats.charactersCount > 0) selectedTypes.value.push('characters')
    if (stats.worldSettingsCount > 0) selectedTypes.value.push('worldSettings')
  } catch (error) {
    console.error('检测本地数据失败:', error)
    ElMessage.error('检测失败，请重试')
  } finally {
    detecting.value = false
  }
}

const calculateDataSize = (data) => {
  try {
    return new Blob([JSON.stringify(data)]).size
  } catch (error) {
    return 0
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const estimateTime = (bytes) => {
  const seconds = Math.ceil(bytes / (100 * 1024)) // 假设100KB/s
  if (seconds < 60) return `约${seconds}秒`
  const minutes = Math.ceil(seconds / 60)
  return `约${minutes}分钟`
}

const formatDuration = (ms) => {
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}秒`
  const minutes = Math.floor(seconds / 60)
  const remainSeconds = seconds % 60
  return `${minutes}分${remainSeconds}秒`
}

const startMigration = async () => {
  migrating.value = true
  migrationStatus.value = '准备开始迁移...'
  migrationProgress.value = 0
  
  const startTime = Date.now()
  let successCount = 0
  let failedCount = 0

  try {
    const novels = localStorageManager.getAllNovels() || []
    totalCount.value = novels.length

    for (let i = 0; i < novels.length; i++) {
      const novel = novels[i]
      currentMigratingItem.value = novel.title
      migrationStatus.value = `正在迁移小说: ${novel.title}`

      try {
        // 调用批量导入API
        const response = await apiManager.request('/api/v1/migrations/batch-import-novels', {
          method: 'POST',
          data: {
            novels: [novel],
            options: {
              skipDuplicates: false,
              createCopies: true
            }
          }
        })

        if (response.success) {
          successCount++
        } else {
          failedCount++
        }
      } catch (error) {
        console.error(`迁移小说失败: ${novel.title}`, error)
        failedCount++
      }

      processedCount.value = i + 1
      migrationProgress.value = Math.round(((i + 1) / totalCount.value) * 100)
      
      // 模拟延迟，避免请求过快
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    migrationResult.success = successCount
    migrationResult.failed = failedCount
    migrationResult.duration = Date.now() - startTime
    migrationResult.totalSize = localDataStats.value.totalSize

    migrating.value = false
    migrationComplete.value = true
    currentStep.value = 3

    ElMessage.success('迁移完成！')
  } catch (error) {
    console.error('迁移过程失败:', error)
    ElMessage.error('迁移失败，请重试')
    migrating.value = false
  }
}

const viewMigrationHistory = () => {
  // TODO: 跳转到迁移历史页面
  router.push('/migration-history')
}

const goToNovels = () => {
  router.push('/novels')
}
</script>

<style scoped>
.migration-wizard {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wizard-container {
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
}

.wizard-header h2 {
  margin: 0 0 8px 0;
  font-size: 28px;
  color: #303133;
}

.subtitle {
  margin: 0;
  color: #909399;
  font-size: 15px;
}

.step-content {
  margin-top: 40px;
  min-height: 400px;
}

.step-panel {
  padding: 20px;
}

.detect-panel {
  text-align: center;
}

.detect-panel h3 {
  margin: 20px 0 10px;
  font-size: 22px;
}

.detect-panel p {
  color: #606266;
  margin-bottom: 30px;
}

.action-area, .loading-area {
  margin: 40px 0;
}

.stats-area {
  margin-top: 30px;
  text-align: left;
}

.action-buttons {
  margin-top: 30px;
  text-align: center;
}

.action-buttons .el-button {
  margin: 0 10px;
}

.type-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 30px 0;
}

.type-checkboxes .el-checkbox {
  font-size: 16px;
}

.hint {
  color: #909399;
  margin: 10px 0 20px;
}

.pre-migration {
  max-width: 600px;
  margin: 0 auto;
}

.migrating-panel {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.progress-area h3 {
  margin: 20px 0 10px;
}

.progress-area p {
  color: #606266;
  margin-bottom: 20px;
}

.migration-details {
  margin-top: 20px;
  font-size: 14px;
  color: #909399;
}

.complete-panel {
  max-width: 700px;
  margin: 0 auto;
}

.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

:deep(.el-steps) {
  margin: 30px 0;
}

:deep(.el-alert ul) {
  margin: 10px 0;
  padding-left: 20px;
}

:deep(.el-alert li) {
  margin: 5px 0;
}
</style>
