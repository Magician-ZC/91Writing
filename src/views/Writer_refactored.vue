<template>
  <div class="writer-container">
    <!-- 顶部标题栏 -->
    <WriterTitleBar 
      :novel-title="currentNovel?.title"
      @go-back="goBack"
    />

    <!-- 标签栏 -->
    <WriterTabsBar 
      v-model:active-tab="activeTab"
      @tab-change="onTabChange"
    />

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧面板 -->
      <div class="left-panel">
        <!-- 章节列表面板 -->
        <WriterChapterPanel
          v-show="activeTab === 'editor'"
          :chapters="chapters"
          :current-chapter="currentChapter"
          @select-chapter="selectChapter"
          @chapter-action="handleChapterAction"
          @add-chapter="addNewChapter"
          @chapter-command="handleChapterCommand"
        />

        <!-- 人物管理面板 -->
        <WriterCharacterPanel
          v-show="activeTab === 'characters'"
          :characters="characters"
          @add-character="addCharacter"
          @batch-generate="showBatchGenerateDialog"
          @edit-character="editCharacter"
          @character-action="handleCharacterAction"
        />

        <!-- 世界观管理面板 -->
        <WriterWorldviewPanel
          v-show="activeTab === 'worldview'"
          :world-settings="worldSettings"
          @add-worldview="addWorldSetting"
          @generate-worldview="openWorldGenerateDialog"
          @edit-worldview="editWorldSetting"
          @worldview-action="handleWorldSettingAction"
        />

        <!-- 语料库面板 -->
        <WriterCorpusPanel
          v-show="activeTab === 'corpus'"
          :corpus-data="corpusData"
          @add-corpus="addCorpus"
          @edit-corpus="editCorpus"
          @delete-corpus="deleteCorpus"
        />

        <!-- 事件线面板 -->
        <WriterEventPanel
          v-show="activeTab === 'events'"
          :events="events"
          @add-event="addEvent"
          @event-action="handleEventAction"
        />
      </div>

      <!-- 右侧编辑器区域 -->
      <WriterEditor
        v-show="activeTab === 'editor'"
        :current-chapter="currentChapter"
        v-model:content="content"
        :is-saving="isSaving"
        :toolbar-config="toolbarConfig"
        :editor-config="editorConfig"
        @update-status="updateChapterStatus"
        @generate-from-outline="generateFromOutline"
        @open-continue-dialog="openContinueDialog"
        @enhance-content="enhanceContent"
        @add-new-chapter="addNewChapter"
        @editor-created="handleCreated"
        @content-change="onContentChange"
      />
    </div>

    <!-- 角色编辑对话框 -->
    <CharacterEditDialog
      v-model="showCharacterDialog"
      :character="editingCharacter"
      :novel-id="novelId"
      @success="handleCharacterSuccess"
    />

    <!-- 世界观编辑对话框 -->
    <WorldSettingEditDialog
      v-model="showWorldDialog"
      :setting="editingWorldSetting"
      :novel-id="novelId"
      @success="handleWorldSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { storeToRefs } from 'pinia'
import { useNovelCloudStore } from '@/stores/novelCloudStore'
import { useCharacterStore } from '@/stores/characterStore'
import { useWorldStore } from '@/stores/worldStore'

// 导入拆分的组件
import WriterTitleBar from '@/components/writer/WriterTitleBar.vue'
import WriterTabsBar from '@/components/writer/WriterTabsBar.vue'
import WriterChapterPanel from '@/components/writer/WriterChapterPanel.vue'
import WriterCharacterPanel from '@/components/writer/WriterCharacterPanel.vue'
import WriterWorldviewPanel from '@/components/writer/WriterWorldviewPanel.vue'
import WriterCorpusPanel from '@/components/writer/WriterCorpusPanel.vue'
import WriterEventPanel from '@/components/writer/WriterEventPanel.vue'
import WriterEditor from '@/components/writer/WriterEditor.vue'
import CharacterEditDialog from '@/components/writer/CharacterEditDialog.vue'
import WorldSettingEditDialog from '@/components/writer/WorldSettingEditDialog.vue'

const router = useRouter()
const route = useRoute()

// ✅ 使用云端Stores
const novelCloudStore = useNovelCloudStore()
const characterStore = useCharacterStore()
const worldStore = useWorldStore()

// 从stores获取响应式数据
const { currentNovel, chapters } = storeToRefs(novelCloudStore)
const { characters } = storeToRefs(characterStore)
const { settings: worldSettings } = storeToRefs(worldStore)

// 本地响应式数据
const activeTab = ref('editor')
const currentChapter = ref(null)
const corpusData = ref([])
const events = ref([])
const content = ref('')
const isSaving = ref(false)

// 对话框状态
const showCharacterDialog = ref(false)
const showWorldDialog = ref(false)
const editingCharacter = ref(null)
const editingWorldSetting = ref(null)

// 计算小说ID
const novelId = computed(() => route.params.id || currentNovel.value?.id)

// 编辑器配置
const toolbarConfig = reactive({
  // 工具栏配置
})

const editorConfig = reactive({
  // 编辑器配置
  placeholder: '请输入内容...',
  MENU_CONF: {}
})

// 方法定义
const goBack = () => {
  router.go(-1)
}

const onTabChange = (tabName) => {
  activeTab.value = tabName
}

const selectChapter = (chapter) => {
  currentChapter.value = chapter
  content.value = chapter.content || ''
}

const handleChapterAction = (action, chapter) => {
  // 处理章节操作
  console.log('章节操作:', action, chapter)
}

const handleChapterCommand = (command) => {
  // 处理章节命令
  console.log('章节命令:', command)
}

const addNewChapter = () => {
  console.log('添加新章节')
}

// ===== 角色管理方法 =====
const addCharacter = () => {
  editingCharacter.value = null
  showCharacterDialog.value = true
}

const showBatchGenerateDialog = async () => {
  try {
    // TODO: 显示批量生成对话框
    // 临时实现：生成3个示例角色
    const config = {
      count: 3,
      role: 'SUPPORTING'
    }
    await characterStore.batchGenerateCharacters(novelId.value, config)
  } catch (error) {
    console.error('批量生成角色失败:', error)
  }
}

const editCharacter = (character) => {
  editingCharacter.value = character
  showCharacterDialog.value = true
}

const handleCharacterSuccess = () => {
  // 刷新角色列表
  characterStore.loadCharacters(novelId.value)
}

const handleCharacterAction = async (action, character) => {
  switch (action) {
    case 'edit':
      editCharacter(character)
      break
    case 'delete':
      try {
        await ElMessageBox.confirm('确定要删除这个角色吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await characterStore.deleteCharacter(character.id)
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除角色失败:', error)
        }
      }
      break
  }
}

// ===== 世界观管理方法 =====
const addWorldSetting = () => {
  editingWorldSetting.value = null
  showWorldDialog.value = true
}

const openWorldGenerateDialog = async () => {
  try {
    // TODO: 显示世界观生成对话框
    // 临时实现：生成几个示例设定
    const config = {
      count: 3,
      includeGeography: true,
      includeCulture: true,
      includeHistory: true
    }
    await worldStore.batchGenerateSettings(novelId.value, config)
  } catch (error) {
    console.error('批量生成世界观设定失败:', error)
  }
}

const editWorldSetting = (setting) => {
  editingWorldSetting.value = setting
  showWorldDialog.value = true
}

const handleWorldSuccess = () => {
  // 刷新世界观列表
  worldStore.loadSettings(novelId.value)
}

const handleWorldSettingAction = async (action, setting) => {
  switch (action) {
    case 'edit':
      editWorldSetting(setting)
      break
    case 'delete':
      try {
        await ElMessageBox.confirm('确定要删除这个世界观设定吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await worldStore.deleteSetting(setting.id)
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除世界观设定失败:', error)
        }
      }
      break
    case 'duplicate':
      try {
        const duplicateData = {
          ...setting,
          id: undefined,
          title: `${setting.title} (副本)`,
          createdAt: undefined,
          updatedAt: undefined
        }
        await worldStore.createSetting(duplicateData)
        ElMessage.success('复制成功')
      } catch (error) {
        console.error('复制世界观设定失败:', error)
      }
      break
  }
}

const addCorpus = () => {
  console.log('添加语料')
}

const editCorpus = (corpus) => {
  console.log('编辑语料', corpus)
}

const deleteCorpus = (corpus) => {
  console.log('删除语料', corpus)
}

const addEvent = () => {
  console.log('添加事件')
}

const handleEventAction = (action, event) => {
  console.log('事件操作:', action, event)
}

const updateChapterStatus = (status) => {
  if (currentChapter.value) {
    currentChapter.value.status = status
    saveCurrentChapter()
  }
}

const generateFromOutline = () => {
  console.log('根据大纲生成内容')
}

const openContinueDialog = () => {
  console.log('打开续写对话框')
}

const enhanceContent = () => {
  console.log('优化内容')
}

const handleCreated = (editor) => {
  console.log('编辑器创建完成', editor)
}

const onContentChange = (html, editor) => {
  if (currentChapter.value) {
    currentChapter.value.content = html
    autoSave()
  }
}

const saveCurrentChapter = () => {
  if (currentChapter.value) {
    isSaving.value = true
    setTimeout(() => {
      isSaving.value = false
    }, 1000)
  }
}

const autoSave = () => {
  clearTimeout(autoSaveTimer)
  autoSaveTimer = setTimeout(() => {
    saveCurrentChapter()
  }, 2000)
}

let autoSaveTimer = null

// 生命周期
onMounted(() => {
  loadNovelData()
})

onUnmounted(() => {
  // 清理自动保存定时器
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }
})

// 监听小说ID变化
watch(novelId, (newId) => {
  if (newId) {
    loadNovelData()
  }
}, { immediate: true })

// ===== 数据加载方法 =====
const loadNovelData = async () => {
  if (!novelId.value) {
    ElMessage.warning('未找到小说ID')
    return
  }

  try {
    // 并行加载小说数据、章节、角色、世界观
    await Promise.all([
      novelCloudStore.loadNovel(novelId.value),
      novelCloudStore.loadChapters(novelId.value),
      characterStore.loadCharacters(novelId.value),
      worldStore.loadSettings(novelId.value)
    ])

    ElMessage.success('数据加载成功')
  } catch (error) {
    console.error('加载小说数据失败:', error)
    ElMessage.error('加载数据失败，请刷新页面重试')
  }
}
</script>

<style scoped>
.writer-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.left-panel {
  width: 350px;
  background: white;
  border-right: 1px solid #e4e7ed;
  overflow: hidden;
}
</style> 