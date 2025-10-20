<template>
  <div class="novel-list-test">
    <div class="page-header">
      <h1>📚 小说列表测试页面</h1>
      <p>测试 novelCloudStore 的基本功能</p>
    </div>

    <!-- 操作按钮 -->
    <div class="actions">
      <el-button type="primary" @click="loadNovels" :loading="novelStore.loading">
        <el-icon><Refresh /></el-icon>
        刷新列表
      </el-button>
      <el-button type="success" @click="showCreateDialog">
        <el-icon><Plus /></el-icon>
        创建测试小说
      </el-button>
      <el-button @click="clearFilters">
        清除筛选
      </el-button>
    </div>

    <!-- 筛选区域 -->
    <el-card shadow="never" class="filter-card">
      <div class="filters">
        <el-select 
          v-model="filterStatus" 
          placeholder="状态筛选"
          @change="updateFilters"
          clearable
        >
          <el-option label="草稿" value="DRAFT" />
          <el-option label="创作中" value="WRITING" />
          <el-option label="已完成" value="COMPLETED" />
          <el-option label="已发布" value="PUBLISHED" />
        </el-select>

        <el-input
          v-model="searchKeyword"
          placeholder="搜索标题或简介..."
          @input="updateFilters"
          clearable
          style="width: 300px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </el-card>

    <!-- 统计信息 -->
    <el-card shadow="never" class="stats-card">
      <div class="stats">
        <div class="stat-item">
          <div class="stat-label">总小说数</div>
          <div class="stat-value">{{ novelStore.novels.length }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">筛选结果</div>
          <div class="stat-value">{{ novelStore.filteredNovels.length }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">当前页</div>
          <div class="stat-value">{{ novelStore.pagination.page }}</div>
        </div>
      </div>
    </el-card>

    <!-- 小说列表 -->
    <div v-loading="novelStore.loading" class="novels-container">
      <el-empty v-if="novelStore.filteredNovels.length === 0" description="暂无小说" />
      
      <el-card 
        v-for="novel in novelStore.filteredNovels" 
        :key="novel.id"
        shadow="hover"
        class="novel-card"
      >
        <div class="novel-content">
          <div class="novel-header">
            <h3>{{ novel.title }}</h3>
            <el-tag :type="getStatusType(novel.status)">
              {{ getStatusText(novel.status) }}
            </el-tag>
          </div>
          
          <p class="novel-description">{{ novel.description || '暂无简介' }}</p>
          
          <div class="novel-meta">
            <span><el-icon><Document /></el-icon> {{ novel.chapterCount || 0 }} 章</span>
            <span><el-icon><EditPen /></el-icon> {{ novel.wordCount || 0 }} 字</span>
            <span><el-icon><Calendar /></el-icon> {{ formatDate(novel.updatedAt) }}</span>
          </div>

          <div class="novel-actions">
            <el-button type="primary" size="small" @click="viewNovel(novel)">
              查看详情
            </el-button>
            <el-button size="small" @click="editNovel(novel)">
              编辑
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="deleteNovel(novel)"
              :loading="novelStore.loading"
            >
              删除
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 创建小说对话框 -->
    <el-dialog 
      v-model="createDialogVisible" 
      title="创建测试小说"
      width="500px"
    >
      <el-form :model="createForm" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="createForm.title" placeholder="输入小说标题" />
        </el-form-item>
        
        <el-form-item label="简介">
          <el-input 
            v-model="createForm.description" 
            type="textarea"
            :rows="3"
            placeholder="输入小说简介"
          />
        </el-form-item>
        
        <el-form-item label="类型">
          <el-select v-model="createForm.genre" placeholder="选择类型">
            <el-option label="玄幻" value="xuanhuan" />
            <el-option label="都市" value="urban" />
            <el-option label="科幻" value="scifi" />
            <el-option label="历史" value="history" />
            <el-option label="悬疑" value="mystery" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select v-model="createForm.status" placeholder="选择状态">
            <el-option label="草稿" value="DRAFT" />
            <el-option label="创作中" value="WRITING" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="createNovel"
          :loading="novelStore.loading"
        >
          创建
        </el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog 
      v-model="detailDialogVisible" 
      title="小说详情"
      width="600px"
    >
      <div v-if="novelStore.currentNovel" class="novel-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="ID">
            {{ novelStore.currentNovel.id }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(novelStore.currentNovel.status)">
              {{ getStatusText(novelStore.currentNovel.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="标题" :span="2">
            {{ novelStore.currentNovel.title }}
          </el-descriptions-item>
          <el-descriptions-item label="简介" :span="2">
            {{ novelStore.currentNovel.description || '暂无' }}
          </el-descriptions-item>
          <el-descriptions-item label="类型">
            {{ novelStore.currentNovel.genre || '未分类' }}
          </el-descriptions-item>
          <el-descriptions-item label="字数">
            {{ novelStore.currentNovel.wordCount || 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="章节数">
            {{ novelStore.currentNovel.chapterCount || 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDate(novelStore.currentNovel.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间" :span="2">
            {{ formatDate(novelStore.currentNovel.updatedAt) }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="chapter-section" v-if="novelStore.chapters.length > 0">
          <h4>章节列表 ({{ novelStore.chapters.length }})</h4>
          <el-table :data="novelStore.chapters" stripe>
            <el-table-column prop="chapterNumber" label="序号" width="80" />
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="wordCount" label="字数" width="100" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag size="small" :type="getStatusType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useNovelCloudStore } from '@/stores/novelCloudStore'
import { ElMessage } from 'element-plus'
import {
  Refresh,
  Plus,
  Search,
  Document,
  EditPen,
  Calendar
} from '@element-plus/icons-vue'

const novelStore = useNovelCloudStore()

// 筛选条件
const filterStatus = ref('')
const searchKeyword = ref('')

// 对话框
const createDialogVisible = ref(false)
const detailDialogVisible = ref(false)

// 创建表单
const createForm = ref({
  title: '',
  description: '',
  genre: '',
  status: 'DRAFT'
})

// 加载小说列表
const loadNovels = async () => {
  const success = await novelStore.fetchNovels()
  if (success) {
    ElMessage.success(`加载成功，共 ${novelStore.novels.length} 部小说`)
  }
}

// 更新筛选
const updateFilters = () => {
  novelStore.setFilters({
    status: filterStatus.value || null,
    searchKeyword: searchKeyword.value
  })
}

// 清除筛选
const clearFilters = () => {
  filterStatus.value = ''
  searchKeyword.value = ''
  novelStore.resetFilters()
}

// 显示创建对话框
const showCreateDialog = () => {
  createForm.value = {
    title: `测试小说 ${Date.now()}`,
    description: '这是一个测试小说',
    genre: 'xuanhuan',
    status: 'DRAFT'
  }
  createDialogVisible.value = true
}

// 创建小说
const createNovel = async () => {
  if (!createForm.value.title) {
    ElMessage.warning('请输入标题')
    return
  }

  const novel = await novelStore.createNovel(createForm.value)
  
  if (novel) {
    createDialogVisible.value = false
    ElMessage.success('创建成功！')
  }
}

// 查看详情
const viewNovel = async (novel) => {
  await novelStore.fetchNovel(novel.id)
  detailDialogVisible.value = true
}

// 编辑小说
const editNovel = async (novel) => {
  const newTitle = prompt('输入新标题:', novel.title)
  if (newTitle && newTitle !== novel.title) {
    await novelStore.updateNovel(novel.id, { title: newTitle })
  }
}

// 删除小说
const deleteNovel = async (novel) => {
  await novelStore.deleteNovel(novel.id)
}

// 状态类型
const getStatusType = (status) => {
  const map = {
    'DRAFT': 'info',
    'WRITING': 'warning',
    'COMPLETED': 'success',
    'PUBLISHED': 'success'
  }
  return map[status] || 'info'
}

// 状态文本
const getStatusText = (status) => {
  const map = {
    'DRAFT': '草稿',
    'WRITING': '创作中',
    'COMPLETED': '已完成',
    'PUBLISHED': '已发布'
  }
  return map[status] || status
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleString('zh-CN')
}

// 初始化
onMounted(() => {
  loadNovels()
})
</script>

<style scoped>
.novel-list-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.page-header p {
  margin: 0;
  color: #7f8c8d;
}

.actions {
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
}

.filter-card {
  margin-bottom: 16px;
}

.filters {
  display: flex;
  gap: 16px;
  align-items: center;
}

.stats-card {
  margin-bottom: 24px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
}

.novels-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 16px;
  min-height: 200px;
}

.novel-card {
  transition: all 0.3s;
}

.novel-card:hover {
  transform: translateY(-4px);
}

.novel-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.novel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.novel-header h3 {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
}

.novel-description {
  color: #606266;
  font-size: 14px;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.novel-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #909399;
}

.novel-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.novel-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.novel-detail {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.chapter-section h4 {
  margin: 0 0 12px 0;
  color: #2c3e50;
}

@media (max-width: 768px) {
  .novels-container {
    grid-template-columns: 1fr;
  }
  
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filters {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

