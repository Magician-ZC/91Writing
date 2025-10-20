<template>
  <div class="novel-management-cloud">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>📚 我的小说</h1>
        <p class="subtitle">云端同步，多设备访问</p>
      </div>
      <div class="header-actions">
        <el-button @click="refreshNovels" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          创建新小说
        </el-button>
      </div>
    </div>

    <!-- 筛选和搜索栏 -->
    <el-card shadow="never" class="filter-card">
      <div class="filter-content">
        <div class="filter-left">
          <el-select 
            v-model="localFilters.status" 
            placeholder="状态筛选" 
            clearable
            style="width: 140px;"
            @change="applyFilters"
          >
            <el-option label="全部状态" value="" />
            <el-option label="草稿" value="DRAFT" />
            <el-option label="创作中" value="WRITING" />
            <el-option label="已完成" value="COMPLETED" />
            <el-option label="已发布" value="PUBLISHED" />
          </el-select>

          <el-select 
            v-model="localFilters.genre" 
            placeholder="类型筛选"
            clearable
            style="width: 140px;"
            @change="applyFilters"
          >
            <el-option label="全部类型" value="" />
            <el-option label="玄幻" value="FANTASY" />
            <el-option label="武侠" value="WUXIA" />
            <el-option label="都市" value="URBAN" />
            <el-option label="科幻" value="SCIFI" />
            <el-option label="历史" value="HISTORY" />
            <el-option label="游戏" value="GAME" />
            <el-option label="其他" value="OTHER" />
          </el-select>

          <el-input
            v-model="localFilters.searchKeyword"
            placeholder="搜索小说标题、简介..."
            clearable
            style="width: 300px;"
            @input="applyFilters"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <div class="filter-right">
          <el-tag v-if="filteredNovels.length > 0">
            共 {{ filteredNovels.length }} 部小说
          </el-tag>
        </div>
      </div>
    </el-card>

    <!-- 小说列表 -->
    <div class="novels-container">
      <el-empty 
        v-if="!loading && filteredNovels.length === 0" 
        description="暂无小说"
      >
        <el-button type="primary" @click="showCreateDialog = true">
          创建第一部小说
        </el-button>
      </el-empty>

      <div v-else-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>

      <div v-else class="novels-grid">
        <el-card 
          v-for="novel in filteredNovels" 
          :key="novel.id"
          class="novel-card"
          shadow="hover"
        >
          <!-- 封面 -->
          <div class="novel-cover">
            <img 
              :src="novel.cover || '/default-cover.jpg'" 
              :alt="novel.title"
              @error="handleImageError"
            />
            <div class="novel-status-badge">
              <el-tag :type="getStatusType(novel.status)" size="small">
                {{ getStatusText(novel.status) }}
              </el-tag>
            </div>
          </div>

          <!-- 信息 -->
          <div class="novel-info">
            <h3 class="novel-title" :title="novel.title">{{ novel.title }}</h3>
            <p class="novel-description">{{ novel.description || '暂无简介' }}</p>

            <!-- 元数据 -->
            <div class="novel-meta">
              <div class="meta-item">
                <el-icon><Document /></el-icon>
                <span>{{ novel.chapterCount || 0 }}章</span>
              </div>
              <div class="meta-item">
                <el-icon><EditPen /></el-icon>
                <span>{{ formatNumber(novel.wordCount || 0) }}字</span>
              </div>
              <div class="meta-item">
                <el-icon><Calendar /></el-icon>
                <span>{{ formatDate(novel.updatedAt) }}</span>
              </div>
            </div>

            <!-- 类型标签 -->
            <div class="novel-genre">
              <el-tag size="small" type="info">{{ getGenreText(novel.genre) }}</el-tag>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="novel-actions">
            <el-button 
              type="primary" 
              size="small"
              @click="openWriter(novel)"
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button 
              size="small"
              @click="editNovel(novel)"
            >
              <el-icon><Setting /></el-icon>
              设置
            </el-button>
            <el-dropdown @command="(cmd) => handleNovelAction(cmd, novel)">
              <el-button size="small" type="text">
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="duplicate">
                    <el-icon><CopyDocument /></el-icon>
                    复制
                  </el-dropdown-item>
                  <el-dropdown-item command="export">
                    <el-icon><Download /></el-icon>
                    导出
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided>
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 创建/编辑小说对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingNovel ? '编辑小说' : '创建新小说'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="novelForm" :rules="novelRules" ref="novelFormRef" label-width="100px">
        <el-form-item label="小说标题" prop="title">
          <el-input 
            v-model="novelForm.title" 
            placeholder="输入小说标题"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="小说类型" prop="genre">
          <el-select v-model="novelForm.genre" placeholder="选择类型" style="width: 100%;">
            <el-option label="玄幻" value="FANTASY" />
            <el-option label="武侠" value="WUXIA" />
            <el-option label="都市" value="URBAN" />
            <el-option label="科幻" value="SCIFI" />
            <el-option label="历史" value="HISTORY" />
            <el-option label="游戏" value="GAME" />
            <el-option label="其他" value="OTHER" />
          </el-select>
        </el-form-item>

        <el-form-item label="小说简介" prop="description">
          <el-input
            v-model="novelForm.description"
            type="textarea"
            :rows="4"
            placeholder="输入小说简介..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="封面地址">
          <el-input 
            v-model="novelForm.cover" 
            placeholder="输入封面图片URL（可选）"
          />
        </el-form-item>

        <el-form-item label="状态" v-if="editingNovel">
          <el-select v-model="novelForm.status" placeholder="选择状态">
            <el-option label="草稿" value="DRAFT" />
            <el-option label="创作中" value="WRITING" />
            <el-option label="已完成" value="COMPLETED" />
            <el-option label="已发布" value="PUBLISHED" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="saveNovel" :loading="saving">
          {{ editingNovel ? '保存' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, Refresh, Search, Document, EditPen, Calendar, 
  Edit, Setting, MoreFilled, CopyDocument, Download, Delete 
} from '@element-plus/icons-vue'
import { useNovelCloudStore } from '@/stores/novelCloudStore'

const router = useRouter()
const novelCloudStore = useNovelCloudStore()

// 从store获取响应式数据
const { novels, loading, filteredNovels } = storeToRefs(novelCloudStore)

// 本地状态
const showCreateDialog = ref(false)
const editingNovel = ref(null)
const saving = ref(false)
const novelFormRef = ref(null)

// 筛选条件（本地副本）
const localFilters = reactive({
  status: '',
  genre: '',
  searchKeyword: ''
})

// 表单数据
const novelForm = reactive({
  title: '',
  description: '',
  genre: 'FANTASY',
  cover: '',
  status: 'DRAFT'
})

// 表单验证规则
const novelRules = {
  title: [
    { required: true, message: '请输入小说标题', trigger: 'blur' },
    { min: 2, max: 50, message: '标题长度在2-50个字符', trigger: 'blur' }
  ],
  genre: [
    { required: true, message: '请选择小说类型', trigger: 'change' }
  ]
}

// 方法
const refreshNovels = async () => {
  await novelCloudStore.fetchNovels()
}

const applyFilters = () => {
  novelCloudStore.setFilters(localFilters)
}

const openWriter = (novel) => {
  router.push(`/writer/${novel.id}`)
}

const editNovel = (novel) => {
  editingNovel.value = novel
  Object.assign(novelForm, {
    title: novel.title,
    description: novel.description || '',
    genre: novel.genre,
    cover: novel.cover || '',
    status: novel.status
  })
  showCreateDialog.value = true
}

const saveNovel = async () => {
  if (!novelFormRef.value) return

  await novelFormRef.value.validate(async (valid) => {
    if (!valid) return

    saving.value = true
    try {
      if (editingNovel.value) {
        // 更新小说
        await novelCloudStore.updateNovel(editingNovel.value.id, novelForm)
      } else {
        // 创建小说
        const newNovel = await novelCloudStore.createNovel(novelForm)
        if (newNovel) {
          // 创建成功后直接进入编辑
          router.push(`/writer/${newNovel.id}`)
        }
      }
      closeDialog()
    } catch (error) {
      console.error('保存小说失败:', error)
    } finally {
      saving.value = false
    }
  })
}

const closeDialog = () => {
  showCreateDialog.value = false
  editingNovel.value = null
  resetForm()
}

const resetForm = () => {
  Object.assign(novelForm, {
    title: '',
    description: '',
    genre: 'FANTASY',
    cover: '',
    status: 'DRAFT'
  })
  novelFormRef.value?.resetFields()
}

const handleNovelAction = async (command, novel) => {
  switch (command) {
    case 'duplicate':
      await duplicateNovel(novel)
      break
    case 'export':
      exportNovel(novel)
      break
    case 'delete':
      await deleteNovel(novel)
      break
  }
}

const duplicateNovel = async (novel) => {
  try {
    const newNovelData = {
      title: `${novel.title} (副本)`,
      description: novel.description,
      genre: novel.genre,
      cover: novel.cover,
      status: 'DRAFT'
    }
    await novelCloudStore.createNovel(newNovelData)
  } catch (error) {
    console.error('复制小说失败:', error)
  }
}

const exportNovel = (novel) => {
  // TODO: 实现导出功能
  ElMessage.info('导出功能开发中...')
}

const deleteNovel = async (novel) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除《${novel.title}》吗？删除后无法恢复！`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await novelCloudStore.deleteNovel(novel.id)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除小说失败:', error)
    }
  }
}

const handleImageError = (e) => {
  e.target.src = '/default-cover.jpg'
}

// 辅助方法
const getStatusType = (status) => {
  const map = {
    'DRAFT': 'info',
    'WRITING': 'primary',
    'COMPLETED': 'success',
    'PUBLISHED': 'warning'
  }
  return map[status] || ''
}

const getStatusText = (status) => {
  const map = {
    'DRAFT': '草稿',
    'WRITING': '创作中',
    'COMPLETED': '已完成',
    'PUBLISHED': '已发布'
  }
  return map[status] || status
}

const getGenreText = (genre) => {
  const map = {
    'FANTASY': '玄幻',
    'WUXIA': '武侠',
    'URBAN': '都市',
    'SCIFI': '科幻',
    'HISTORY': '历史',
    'GAME': '游戏',
    'OTHER': '其他'
  }
  return map[genre] || genre
}

const formatNumber = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  
  // 1小时内
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  }
  // 24小时内
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  }
  // 7天内
  if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)}天前`
  }
  // 其他显示日期
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// 生命周期
onMounted(() => {
  refreshNovels()
})
</script>

<style scoped>
.novel-management-cloud {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-content h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  color: #303133;
}

.subtitle {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-left {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.novels-container {
  margin-top: 20px;
}

.loading-container {
  padding: 40px;
  background: white;
  border-radius: 8px;
}

.novels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.novel-card {
  transition: all 0.3s;
  cursor: pointer;
}

.novel-card:hover {
  transform: translateY(-4px);
}

.novel-cover {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  border-radius: 4px;
  margin-bottom: 12px;
}

.novel-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.novel-status-badge {
  position: absolute;
  top: 8px;
  right: 8px;
}

.novel-info {
  margin-bottom: 12px;
}

.novel-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.novel-description {
  font-size: 14px;
  color: #606266;
  margin: 0 0 12px 0;
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.novel-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #909399;
}

.meta-item .el-icon {
  font-size: 14px;
}

.novel-genre {
  margin-bottom: 12px;
}

.novel-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.novel-actions .el-button {
  flex: 1;
}
</style>
