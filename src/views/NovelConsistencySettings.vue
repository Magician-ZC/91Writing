<template>
  <div class="consistency-settings">
    <el-page-header @back="goBack" title="返回">
      <template #content>
        <span class="page-title">视觉一致性配置 - {{ novel?.title }}</span>
      </template>
    </el-page-header>

    <el-card class="main-card" v-loading="loading">
      <!-- 工具栏 -->
      <div class="toolbar">
        <el-button type="primary" :icon="MagicStick" @click="autoExtract">
          自动提取特征
        </el-button>
        <el-button :icon="Upload" @click="importConfig">导入配置</el-button>
        <el-button :icon="Download" @click="exportConfig">导出配置</el-button>
        <el-button 
          type="success" 
          :icon="Check" 
          @click="saveConfig"
          :loading="saving"
        >
          保存配置
        </el-button>
      </div>

      <el-tabs v-model="activeTab" class="settings-tabs">
        <!-- 角色配置 -->
        <el-tab-pane label="角色特征" name="characters">
          <div class="tab-content">
            <div class="section-header">
              <span>角色列表 ({{ profile.characters.length }})</span>
              <el-button type="primary" size="small" :icon="Plus" @click="addCharacter">
                添加角色
              </el-button>
            </div>

            <el-empty v-if="profile.characters.length === 0" description="暂无角色配置">
              <el-button type="primary" @click="addCharacter">添加第一个角色</el-button>
            </el-empty>

            <el-collapse v-else v-model="activeCharacters" accordion>
              <el-collapse-item 
                v-for="(char, index) in profile.characters" 
                :key="index"
                :name="index"
              >
                <template #title>
                  <div class="character-title">
                    <el-avatar :size="32">{{ char.name[0] }}</el-avatar>
                    <span class="char-name">{{ char.name }}</span>
                    <el-tag v-if="char.importance >= 80" type="danger" size="small">主角</el-tag>
                    <el-tag v-else-if="char.importance >= 60" type="warning" size="small">重要</el-tag>
                    <el-tag v-else type="info" size="small">配角</el-tag>
                  </div>
                </template>

                <el-form :model="char" label-width="120px" class="character-form">
                  <el-form-item label="角色名称">
                    <el-input v-model="char.name" placeholder="输入角色名称" />
                  </el-form-item>

                  <el-form-item label="基础外貌">
                    <el-input
                      v-model="char.baseAppearance"
                      type="textarea"
                      :rows="3"
                      placeholder="描述角色的基本外貌特征（不会改变的部分）"
                    />
                    <div class="form-tip">
                      例如：黑发蓝眼，身高约180cm，五官轮廓分明的年轻男子
                    </div>
                  </el-form-item>

                  <el-form-item label="视觉关键词">
                    <el-tag
                      v-for="(keyword, kidx) in char.keywords"
                      :key="kidx"
                      closable
                      @close="removeKeyword(char, kidx)"
                      class="keyword-tag"
                    >
                      {{ keyword }}
                    </el-tag>
                    <el-input
                      v-if="char.showKeywordInput"
                      v-model="char.newKeyword"
                      size="small"
                      @keyup.enter="addKeyword(char)"
                      @blur="addKeyword(char)"
                      class="keyword-input"
                    />
                    <el-button
                      v-else
                      size="small"
                      @click="char.showKeywordInput = true"
                    >
                      + 添加关键词
                    </el-button>
                    <div class="form-tip">
                      关键词用于视觉一致性控制，例如：黑发、蓝眼、黑袍、佩剑
                    </div>
                  </el-form-item>

                  <el-form-item label="参考图">
                    <el-upload
                      :action="uploadUrl"
                      :headers="uploadHeaders"
                      :show-file-list="false"
                      :on-success="(res) => handleImageUpload(char, res)"
                      accept="image/*"
                    >
                      <el-image
                        v-if="char.referenceImageUrl"
                        :src="char.referenceImageUrl"
                        fit="cover"
                        class="reference-image"
                      >
                        <template #error>
                          <div class="image-slot">
                            <el-icon><Picture /></el-icon>
                          </div>
                        </template>
                      </el-image>
                      <el-button v-else :icon="Upload">上传参考图</el-button>
                    </el-upload>
                    <div class="form-tip">
                      上传角色参考图可以提高生成一致性
                    </div>
                  </el-form-item>

                  <el-form-item label="重要性">
                    <el-slider v-model="char.importance" :min="0" :max="100" show-stops />
                  </el-form-item>

                  <el-form-item label="动态状态">
                    <el-button size="small" @click="showStateDialog(char)">
                      管理章节状态 ({{ Object.keys(char.dynamicState || {}).length }})
                    </el-button>
                    <div class="form-tip">
                      为不同章节设置特殊状态，如受伤、换装等
                    </div>
                  </el-form-item>

                  <el-form-item>
                    <el-button type="danger" @click="deleteCharacter(index)">
                      删除角色
                    </el-button>
                  </el-form-item>
                </el-form>
              </el-collapse-item>
            </el-collapse>
          </div>
        </el-tab-pane>

        <!-- 环境配置 -->
        <el-tab-pane label="环境场景" name="environments">
          <div class="tab-content">
            <div class="section-header">
              <span>环境列表 ({{ profile.environments.length }})</span>
              <el-button type="primary" size="small" :icon="Plus" @click="addEnvironment">
                添加环境
              </el-button>
            </div>

            <el-empty v-if="profile.environments.length === 0" description="暂无环境配置" />

            <el-space direction="vertical" :size="16" style="width: 100%">
              <el-card 
                v-for="(env, index) in profile.environments" 
                :key="index"
                class="env-card"
              >
                <template #header>
                  <div class="card-header">
                    <span>{{ env.name }}</span>
                    <el-button 
                      type="danger" 
                      size="small" 
                      text 
                      @click="deleteEnvironment(index)"
                    >
                      删除
                    </el-button>
                  </div>
                </template>

                <el-form :model="env" label-width="100px">
                  <el-form-item label="场景名称">
                    <el-input v-model="env.name" />
                  </el-form-item>
                  <el-form-item label="场景描述">
                    <el-input v-model="env.description" type="textarea" :rows="2" />
                  </el-form-item>
                  <el-form-item label="视觉风格">
                    <el-input v-model="env.visualStyle" />
                  </el-form-item>
                  <el-form-item label="关键词">
                    <el-tag
                      v-for="(kw, kidx) in env.keywords"
                      :key="kidx"
                      closable
                      @close="env.keywords.splice(kidx, 1)"
                    >
                      {{ kw }}
                    </el-tag>
                  </el-form-item>
                </el-form>
              </el-card>
            </el-space>
          </div>
        </el-tab-pane>

        <!-- 视觉风格 -->
        <el-tab-pane label="视觉风格" name="visualStyle">
          <div class="tab-content">
            <el-form :model="profile.visualStyle" label-width="120px">
              <el-form-item label="整体风格">
                <el-select v-model="profile.visualStyle.overall">
                  <el-option label="写实风格" value="realistic" />
                  <el-option label="动漫风格" value="anime" />
                  <el-option label="奇幻风格" value="fantasy" />
                  <el-option label="科幻风格" value="scifi" />
                  <el-option label="水墨画风格" value="ink-painting" />
                  <el-option label="油画风格" value="oil-painting" />
                </el-select>
              </el-form-item>

              <el-form-item label="色调">
                <el-select v-model="profile.visualStyle.colorTone">
                  <el-option label="自然色调" value="natural" />
                  <el-option label="暖色调" value="warm" />
                  <el-option label="冷色调" value="cold" />
                  <el-option label="高对比" value="high-contrast" />
                  <el-option label="低饱和" value="low-saturation" />
                </el-select>
              </el-form-item>

              <el-form-item label="艺术风格">
                <el-select v-model="profile.visualStyle.artStyle">
                  <el-option label="电影感" value="cinematic" />
                  <el-option label="插画风格" value="illustration" />
                  <el-option label="概念艺术" value="concept-art" />
                  <el-option label="漫画风格" value="comic" />
                </el-select>
              </el-form-item>

              <el-form-item label="光照">
                <el-select v-model="profile.visualStyle.lighting">
                  <el-option label="自然光" value="natural" />
                  <el-option label="戏剧光" value="dramatic" />
                  <el-option label="柔和光" value="soft" />
                  <el-option label="背光" value="backlight" />
                  <el-option label="侧光" value="sidelight" />
                </el-select>
              </el-form-item>

              <el-form-item label="附加标签">
                <el-tag
                  v-for="(tag, index) in profile.visualStyle.additionalTags"
                  :key="index"
                  closable
                  @close="profile.visualStyle.additionalTags.splice(index, 1)"
                  class="style-tag"
                >
                  {{ tag }}
                </el-tag>
                <el-button size="small" @click="addStyleTag">+ 添加标签</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 自动提取对话框 -->
    <el-dialog
      v-model="showExtractDialog"
      title="自动提取角色特征"
      width="500px"
    >
      <el-form :model="extractForm" label-width="100px">
        <el-form-item label="起始章节">
          <el-input-number v-model="extractForm.startChapter" :min="1" />
        </el-form-item>
        <el-form-item label="结束章节">
          <el-input-number v-model="extractForm.endChapter" :min="1" />
        </el-form-item>
        <el-form-item label="覆盖现有">
          <el-switch v-model="extractForm.overwrite" />
          <div class="form-tip">
            如果开启，将覆盖现有的角色配置；否则合并
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showExtractDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmExtract" :loading="extracting">
          开始提取
        </el-button>
      </template>
    </el-dialog>

    <!-- 状态管理对话框 -->
    <el-dialog
      v-model="showStateManager"
      title="管理角色状态"
      width="600px"
    >
      <div v-if="currentCharacter">
        <el-button type="primary" size="small" @click="addState">添加状态</el-button>
        <el-table :data="stateList" style="margin-top: 16px">
          <el-table-column prop="chapter" label="章节" width="100" />
          <el-table-column prop="state" label="状态描述" />
          <el-table-column label="操作" width="100">
            <template #default="{ $index }">
              <el-button type="danger" size="small" text @click="deleteState($index)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  MagicStick,
  Upload,
  Download,
  Check,
  Plus,
  Picture
} from '@element-plus/icons-vue'
import { consistencyService } from '@/services/consistencyService'
import { novelService } from '@/services/novelService'

const route = useRoute()
const router = useRouter()

const novelId = route.params.novelId
const novel = ref(null)
const loading = ref(false)
const saving = ref(false)
const extracting = ref(false)

const activeTab = ref('characters')
const activeCharacters = ref([0])
const showExtractDialog = ref(false)
const showStateManager = ref(false)
const currentCharacter = ref(null)

// 配置数据
const profile = reactive({
  characters: [],
  environments: [],
  objects: [],
  visualStyle: {
    overall: 'realistic',
    colorTone: 'natural',
    artStyle: 'cinematic',
    lighting: 'natural',
    additionalTags: []
  }
})

// 提取表单
const extractForm = reactive({
  startChapter: 1,
  endChapter: 3,
  overwrite: false
})

// 上传配置
const uploadUrl = computed(() => `${import.meta.env.VITE_API_BASE_URL}/upload/image`)
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
}))

// 状态列表
const stateList = computed(() => {
  if (!currentCharacter.value?.dynamicState) return []
  return Object.entries(currentCharacter.value.dynamicState).map(([chapter, state]) => ({
    chapter: `第${chapter}章`,
    state
  }))
})

// 方法
const loadProfile = async () => {
  loading.value = true
  try {
    const data = await consistencyService.getProfile(novelId)
    Object.assign(profile, data)
  } catch (error) {
    // 如果没有配置，使用默认值
    console.log('使用默认配置')
  } finally {
    loading.value = false
  }
}

const loadNovel = async () => {
  try {
    novel.value = await novelService.getNovel(novelId)
  } catch (error) {
    ElMessage.error('加载小说信息失败')
  }
}

const saveConfig = async () => {
  // 验证配置
  const validation = consistencyService.validateProfile(profile)
  if (!validation.valid) {
    ElMessage.error(validation.errors[0])
    return
  }

  saving.value = true
  try {
    await consistencyService.updateProfile(novelId, profile)
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    saving.value = false
  }
}

const autoExtract = () => {
  showExtractDialog.value = true
}

const confirmExtract = async () => {
  extracting.value = true
  try {
    const data = await consistencyService.autoExtract({
      novelId,
      ...extractForm
    })
    Object.assign(profile, data)
    ElMessage.success('自动提取完成')
    showExtractDialog.value = false
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    extracting.value = false
  }
}

const addCharacter = () => {
  profile.characters.push({
    name: '',
    baseAppearance: '',
    keywords: [],
    dynamicState: {},
    importance: 50,
    showKeywordInput: false,
    newKeyword: ''
  })
  activeCharacters.value = [profile.characters.length - 1]
}

const deleteCharacter = async (index) => {
  try {
    await ElMessageBox.confirm('确定要删除这个角色吗？', '确认删除', {
      type: 'warning'
    })
    profile.characters.splice(index, 1)
  } catch {}
}

const addKeyword = (char) => {
  if (char.newKeyword && char.newKeyword.trim()) {
    char.keywords.push(char.newKeyword.trim())
    char.newKeyword = ''
  }
  char.showKeywordInput = false
}

const removeKeyword = (char, index) => {
  char.keywords.splice(index, 1)
}

const handleImageUpload = (char, response) => {
  char.referenceImageUrl = response.url
  ElMessage.success('上传成功')
}

const showStateDialog = (char) => {
  currentCharacter.value = char
  showStateManager.value = true
}

const addState = async () => {
  try {
    const { value: chapter } = await ElMessageBox.prompt('请输入章节号', '添加状态', {
      inputPattern: /^\d+$/,
      inputErrorMessage: '请输入有效的章节号'
    })

    const { value: state } = await ElMessageBox.prompt('请输入状态描述', '添加状态')

    if (!currentCharacter.value.dynamicState) {
      currentCharacter.value.dynamicState = {}
    }
    currentCharacter.value.dynamicState[chapter] = state
  } catch {}
}

const deleteState = (index) => {
  const chapter = Object.keys(currentCharacter.value.dynamicState)[index]
  delete currentCharacter.value.dynamicState[chapter]
}

const addEnvironment = () => {
  profile.environments.push({
    name: '',
    description: '',
    visualStyle: '',
    keywords: []
  })
}

const deleteEnvironment = (index) => {
  profile.environments.splice(index, 1)
}

const addStyleTag = async () => {
  try {
    const { value } = await ElMessageBox.prompt('请输入标签', '添加标签')
    if (value) {
      profile.visualStyle.additionalTags.push(value)
    }
  } catch {}
}

const exportConfig = () => {
  consistencyService.exportProfile(profile, 'json')
  ElMessage.success('导出成功')
}

const importConfig = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'application/json'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    try {
      const imported = await consistencyService.importProfile(file)
      Object.assign(profile, imported)
      ElMessage.success('导入成功')
    } catch (error) {
      ElMessage.error(error.message)
    }
  }
  input.click()
}

const goBack = () => {
  router.back()
}

// 生命周期
onMounted(async () => {
  await loadNovel()
  await loadProfile()
})
</script>

<style scoped lang="scss">
.consistency-settings {
  padding: 20px;

  .page-title {
    font-size: 18px;
    font-weight: 500;
  }

  .main-card {
    margin-top: 20px;
  }

  .toolbar {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
  }

  .tab-content {
    padding: 20px 0;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    font-size: 16px;
    font-weight: 500;
  }

  .character-title {
    display: flex;
    align-items: center;
    gap: 12px;

    .char-name {
      font-weight: 500;
    }
  }

  .character-form {
    padding: 20px;
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 8px;
  }

  .keyword-tag {
    margin-right: 8px;
    margin-bottom: 8px;
  }

  .keyword-input {
    width: 120px;
  }

  .reference-image {
    width: 200px;
    height: 200px;
    cursor: pointer;

    .image-slot {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background: #f5f7fa;
    }
  }

  .env-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .style-tag {
    margin-right: 8px;
    margin-bottom: 8px;
  }
}
</style>

