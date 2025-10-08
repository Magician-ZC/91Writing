<template>
  <div class="mindmap-view">
    <div class="mindmap-header">
      <div class="header-left">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ name: 'NovelManagement' }">作品管理</el-breadcrumb-item>
          <el-breadcrumb-item>{{ novelTitle }}</el-breadcrumb-item>
          <el-breadcrumb-item>思维导图</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="header-right">
        <el-button size="small" @click="createDefault">创建默认导图</el-button>
        <el-button size="small" @click="showImportOutline = true">从大纲生成</el-button>
        <el-button size="small" @click="exportMarkdown">导出Markdown</el-button>
      </div>
    </div>

    <div class="mindmap-content" v-loading="loading">
      <MindMapEditor
        ref="mindMapEditor"
        :novel-id="novelId"
        :initial-data="mindMapData"
        @save="handleSave"
        @update="handleUpdate"
      />
    </div>

    <!-- 从大纲生成对话框 -->
    <el-dialog
      v-model="showImportOutline"
      title="从大纲生成思维导图"
      width="600px"
    >
      <el-form label-width="80px">
        <el-form-item label="根节点">
          <el-input v-model="outlineForm.rootLabel" placeholder="输入根节点标题" />
        </el-form-item>
        <el-form-item label="大纲内容">
          <el-input
            v-model="outlineForm.content"
            type="textarea"
            :rows="15"
            placeholder="输入大纲内容，使用缩进表示层级关系&#10;示例：&#10;主题&#10;  分支1&#10;    叶子1&#10;    叶子2&#10;  分支2&#10;    叶子3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showImportOutline = false">取消</el-button>
        <el-button type="primary" @click="generateFromOutline">生成</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import MindMapEditor from '@/components/mindmap/MindMapEditor.vue'
import mindMapService from '@/services/mindMapService'
import apiManager from '@/services/apiManager'

const route = useRoute()
const novelId = ref(route.params.novelId || route.query.novelId)
const novelTitle = ref('思维导图')
const loading = ref(false)
const mindMapData = ref({ nodes: [], edges: [] })
const mindMapEditor = ref(null)
const showImportOutline = ref(false)

const outlineForm = ref({
  rootLabel: '主题',
  content: ''
})

onMounted(async () => {
  await loadNovelInfo()
  await loadMindMap()
})

/**
 * 加载小说信息
 */
const loadNovelInfo = async () => {
  try {
    const response = await apiManager.getNovel(novelId.value)
    if (response.success && response.data) {
      novelTitle.value = response.data.title
    }
  } catch (error) {
    console.error('加载小说信息失败:', error)
  }
}

/**
 * 加载思维导图
 */
const loadMindMap = async () => {
  loading.value = true
  try {
    const data = await mindMapService.loadMindMap(novelId.value)
    if (mindMapService.validateMindMapData(data)) {
      mindMapData.value = data
    } else {
      // 如果没有有效数据，创建默认思维导图
      mindMapData.value = mindMapService.createDefaultMindMap(novelTitle.value)
    }
  } catch (error) {
    console.error('加载思维导图失败:', error)
    ElMessage.error('加载思维导图失败')
  } finally {
    loading.value = false
  }
}

/**
 * 保存思维导图
 */
const handleSave = async (data) => {
  try {
    await mindMapService.saveMindMap(novelId.value, data)
    mindMapData.value = data
  } catch (error) {
    throw error
  }
}

/**
 * 更新思维导图（实时更新，不保存到服务器）
 */
const handleUpdate = (data) => {
  mindMapData.value = data
}

/**
 * 创建默认思维导图
 */
const createDefault = () => {
  const defaultData = mindMapService.createDefaultMindMap(novelTitle.value)
  mindMapData.value = defaultData
  if (mindMapEditor.value) {
    mindMapEditor.value.loadData(defaultData)
  }
  ElMessage.success('已创建默认思维导图')
}

/**
 * 从大纲生成思维导图
 */
const generateFromOutline = () => {
  if (!outlineForm.value.content.trim()) {
    ElMessage.warning('请输入大纲内容')
    return
  }

  try {
    const data = mindMapService.generateFromOutline(
      outlineForm.value.content,
      outlineForm.value.rootLabel || '主题'
    )
    
    mindMapData.value = data
    if (mindMapEditor.value) {
      mindMapEditor.value.loadData(data)
    }
    
    showImportOutline.value = false
    ElMessage.success('思维导图生成成功')
  } catch (error) {
    ElMessage.error('生成失败：' + error.message)
  }
}

/**
 * 导出为Markdown
 */
const exportMarkdown = () => {
  try {
    const data = mindMapEditor.value?.getData() || mindMapData.value
    const markdown = mindMapService.exportToMarkdown(data)
    
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${novelTitle.value}_mindmap.md`
    link.click()
    URL.revokeObjectURL(url)
    
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}
</script>

<style scoped>
.mindmap-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f7fa;
}

.mindmap-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.header-left {
  flex: 1;
}

.header-right {
  display: flex;
  gap: 10px;
}

.mindmap-content {
  flex: 1;
  padding: 20px;
  overflow: hidden;
}
</style>
