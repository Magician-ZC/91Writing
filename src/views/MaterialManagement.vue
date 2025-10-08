<template>
  <div class="material-management">
    <div class="header">
      <h2>素材管理</h2>
      <el-button type="primary" @click="showUploadDialog = true">
        <el-icon><upload /></el-icon>
        上传素材
      </el-button>
    </div>

    <!-- 统计信息 -->
    <div class="stats-cards">
      <el-card class="stat-card">
        <div class="stat-content">
          <el-icon class="stat-icon" color="#409eff"><folder /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">总素材数</div>
          </div>
        </div>
      </el-card>
      <el-card v-for="typeStat in stats.byType" :key="typeStat.type" class="stat-card">
        <div class="stat-content">
          <el-icon class="stat-icon" :color="getTypeColor(typeStat.type)">
            <component :is="getTypeIcon(typeStat.type)" />
          </el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ typeStat.count }}</div>
            <div class="stat-label">{{ getTypeLabel(typeStat.type) }}</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-section">
      <el-input
        v-model="searchQuery.keyword"
        placeholder="搜索素材名称或描述..."
        class="search-input"
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><search /></el-icon>
        </template>
      </el-input>

      <el-select
        v-model="searchQuery.type"
        placeholder="素材类型"
        clearable
        @change="handleSearch"
        style="width: 150px"
      >
        <el-option label="图片" value="IMAGE" />
        <el-option label="视频" value="VIDEO" />
        <el-option label="音频" value="AUDIO" />
        <el-option label="文档" value="DOCUMENT" />
        <el-option label="文本" value="TEXT" />
      </el-select>

      <el-select
        v-model="searchQuery.category"
        placeholder="分类"
        clearable
        @change="handleSearch"
        style="width: 150px"
      >
        <el-option
          v-for="cat in categories"
          :key="cat"
          :label="cat"
          :value="cat"
        />
      </el-select>

      <el-select
        v-model="selectedTags"
        placeholder="标签"
        multiple
        clearable
        @change="handleSearch"
        style="width: 200px"
      >
        <el-option
          v-for="tag in tags"
          :key="tag"
          :label="tag"
          :value="tag"
        />
      </el-select>
    </div>

    <!-- 素材列表 -->
    <div class="material-list" v-loading="loading">
      <el-empty v-if="materials.length === 0" description="暂无素材" />
      <div v-else class="material-grid">
        <el-card
          v-for="material in materials"
          :key="material.id"
          class="material-card"
          :body-style="{ padding: '0' }"
          shadow="hover"
        >
          <div class="material-preview" @click="viewMaterial(material)">
            <template v-if="material.type === 'IMAGE'">
              <img :src="material.fileUrl" :alt="material.name" />
            </template>
            <template v-else>
              <div class="file-icon">
                <el-icon :size="60" :color="getTypeColor(material.type)">
                  <component :is="getTypeIcon(material.type)" />
                </el-icon>
              </div>
            </template>
          </div>
          <div class="material-info">
            <div class="material-name" :title="material.name">{{ material.name }}</div>
            <div class="material-meta">
              <el-tag size="small" type="info">{{ getTypeLabel(material.type) }}</el-tag>
              <span class="file-size">{{ formatSize(material.fileSize) }}</span>
            </div>
            <div v-if="material.category" class="material-category">
              <el-icon><folder /></el-icon>
              {{ material.category }}
            </div>
            <div v-if="material.tags && material.tags.length > 0" class="material-tags">
              <el-tag
                v-for="tag in material.tags.slice(0, 3)"
                :key="tag"
                size="small"
                type="success"
                class="tag-item"
              >
                {{ tag }}
              </el-tag>
              <span v-if="material.tags.length > 3" class="more-tags">
                +{{ material.tags.length - 3 }}
              </span>
            </div>
            <div class="material-actions">
              <el-button size="small" text @click="editMaterial(material)">
                <el-icon><edit /></el-icon>
                编辑
              </el-button>
              <el-button size="small" text type="danger" @click="deleteMaterial(material)">
                <el-icon><delete /></el-icon>
                删除
              </el-button>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 分页 -->
      <el-pagination
        v-if="total > 0"
        class="pagination"
        v-model:current-page="searchQuery.page"
        v-model:page-size="searchQuery.pageSize"
        :total="total"
        :page-sizes="[12, 24, 48, 96]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="loadMaterials"
        @size-change="loadMaterials"
      />
    </div>

    <!-- 上传对话框 -->
    <el-dialog
      v-model="showUploadDialog"
      title="上传素材"
      width="600px"
      :close-on-click-modal="false"
    >
      <MaterialUpload
        @upload-success="handleUploadSuccess"
        @upload-complete="handleUploadComplete"
      />
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑素材"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="分类">
          <el-input v-model="editForm.category" placeholder="输入分类名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editForm.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="标签">
          <el-select
            v-model="editForm.tags"
            multiple
            filterable
            allow-create
            placeholder="选择或输入标签"
            style="width: 100%"
          >
            <el-option
              v-for="tag in tags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveEdit" :loading="saving">保存</el-button>
      </template>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="showPreviewDialog"
      :title="previewMaterial?.name"
      width="800px"
    >
      <div class="preview-content" v-if="previewMaterial">
        <template v-if="previewMaterial.type === 'IMAGE'">
          <img :src="previewMaterial.fileUrl" style="max-width: 100%" />
        </template>
        <template v-else-if="previewMaterial.type === 'VIDEO'">
          <video :src="previewMaterial.fileUrl" controls style="max-width: 100%" />
        </template>
        <template v-else-if="previewMaterial.type === 'AUDIO'">
          <audio :src="previewMaterial.fileUrl" controls style="width: 100%" />
        </template>
        <template v-else>
          <div class="file-preview">
            <el-icon :size="80" :color="getTypeColor(previewMaterial.type)">
              <component :is="getTypeIcon(previewMaterial.type)" />
            </el-icon>
            <p>{{ previewMaterial.name }}</p>
            <p>{{ getTypeLabel(previewMaterial.type) }} - {{ formatSize(previewMaterial.fileSize) }}</p>
          </div>
        </template>
        <div class="preview-info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="类型">
              {{ getTypeLabel(previewMaterial.type) }}
            </el-descriptions-item>
            <el-descriptions-item label="大小">
              {{ formatSize(previewMaterial.fileSize) }}
            </el-descriptions-item>
            <el-descriptions-item label="分类" v-if="previewMaterial.category">
              {{ previewMaterial.category }}
            </el-descriptions-item>
            <el-descriptions-item label="使用次数">
              {{ previewMaterial.usageCount }}
            </el-descriptions-item>
            <el-descriptions-item label="上传时间" :span="2">
              {{ formatDate(previewMaterial.createdAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="描述" :span="2" v-if="previewMaterial.description">
              {{ previewMaterial.description }}
            </el-descriptions-item>
            <el-descriptions-item label="标签" :span="2" v-if="previewMaterial.tags?.length">
              <el-tag
                v-for="tag in previewMaterial.tags"
                :key="tag"
                size="small"
                style="margin-right: 5px"
              >
                {{ tag }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Upload, Search, Folder, Edit, Delete,
  Picture, VideoCamera, Headset, Document as DocIcon, Files
} from '@element-plus/icons-vue'
import MaterialUpload from '@/components/material/MaterialUpload.vue'
import materialService from '@/services/materialService'

const loading = ref(false)
const materials = ref([])
const total = ref(0)
const stats = ref({ total: 0, byType: [] })
const categories = ref([])
const tags = ref([])

const searchQuery = reactive({
  keyword: '',
  type: '',
  category: '',
  page: 1,
  pageSize: 12
})

const selectedTags = ref([])

const showUploadDialog = ref(false)
const showEditDialog = ref(false)
const showPreviewDialog = ref(false)
const saving = ref(false)

const editForm = reactive({
  id: '',
  name: '',
  category: '',
  description: '',
  tags: []
})

const previewMaterial = ref(null)

onMounted(() => {
  loadMaterials()
  loadStats()
  loadCategories()
  loadTags()
})

/**
 * 加载素材列表
 */
const loadMaterials = async () => {
  loading.value = true
  try {
    const params = {
      ...searchQuery,
      tags: selectedTags.value.length > 0 ? selectedTags.value.join(',') : undefined
    }
    const result = await materialService.getMaterials(params)
    materials.value = result.items || []
    total.value = result.total || 0
  } catch (error) {
    console.error('加载素材列表失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 加载统计信息
 */
const loadStats = async () => {
  try {
    stats.value = await materialService.getStats()
  } catch (error) {
    console.error('加载统计信息失败:', error)
  }
}

/**
 * 加载分类列表
 */
const loadCategories = async () => {
  try {
    categories.value = await materialService.getCategories()
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

/**
 * 加载标签列表
 */
const loadTags = async () => {
  try {
    tags.value = await materialService.getTags()
  } catch (error) {
    console.error('加载标签失败:', error)
  }
}

/**
 * 搜索素材
 */
const handleSearch = () => {
  searchQuery.page = 1
  loadMaterials()
}

/**
 * 查看素材
 */
const viewMaterial = (material) => {
  previewMaterial.value = material
  showPreviewDialog.value = true
}

/**
 * 编辑素材
 */
const editMaterial = (material) => {
  editForm.id = material.id
  editForm.name = material.name
  editForm.category = material.category || ''
  editForm.description = material.description || ''
  editForm.tags = material.tags || []
  showEditDialog.value = true
}

/**
 * 保存编辑
 */
const saveEdit = async () => {
  saving.value = true
  try {
    await materialService.updateMaterial(editForm.id, {
      name: editForm.name,
      category: editForm.category || null,
      description: editForm.description,
      tags: editForm.tags
    })
    showEditDialog.value = false
    loadMaterials()
    loadCategories()
    loadTags()
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    saving.value = false
  }
}

/**
 * 删除素材
 */
const deleteMaterial = async (material) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除素材"${material.name}"吗？`,
      '删除确认',
      {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消'
      }
    )

    await materialService.deleteMaterial(material.id)
    loadMaterials()
    loadStats()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

/**
 * 上传成功回调
 */
const handleUploadSuccess = (material) => {
  console.log('上传成功:', material)
}

/**
 * 上传完成回调
 */
const handleUploadComplete = ({ success, fail }) => {
  showUploadDialog.value = false
  loadMaterials()
  loadStats()
  loadCategories()
  loadTags()
}

/**
 * 获取类型图标
 */
const getTypeIcon = (type) => {
  const icons = {
    IMAGE: Picture,
    VIDEO: VideoCamera,
    AUDIO: Headset,
    DOCUMENT: DocIcon,
    TEXT: Files
  }
  return icons[type] || Files
}

/**
 * 获取类型颜色
 */
const getTypeColor = (type) => {
  const colors = {
    IMAGE: '#67c23a',
    VIDEO: '#409eff',
    AUDIO: '#e6a23c',
    DOCUMENT: '#f56c6c',
    TEXT: '#909399'
  }
  return colors[type] || '#909399'
}

/**
 * 获取类型标签
 */
const getTypeLabel = (type) => {
  const labels = {
    IMAGE: '图片',
    VIDEO: '视频',
    AUDIO: '音频',
    DOCUMENT: '文档',
    TEXT: '文本'
  }
  return labels[type] || type
}

/**
 * 格式化文件大小
 */
const formatSize = (bytes) => {
  return materialService.formatFileSize(bytes || 0)
}

/**
 * 格式化日期
 */
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}
</script>

<style scoped>
.material-management {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 40px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.filter-section {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
}

.material-list {
  min-height: 400px;
}

.material-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.material-card {
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.material-card:hover {
  transform: translateY(-5px);
}

.material-preview {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  overflow: hidden;
}

.material-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.material-info {
  padding: 15px;
}

.material-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.material-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.file-size {
  font-size: 12px;
  color: #909399;
}

.material-category {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
}

.material-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 10px;
}

.tag-item {
  font-size: 12px;
}

.more-tags {
  font-size: 12px;
  color: #909399;
}

.material-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.preview-content {
  text-align: center;
}

.file-preview {
  padding: 40px;
}

.file-preview p {
  margin: 10px 0;
  color: #606266;
}

.preview-info {
  margin-top: 20px;
}
</style>
