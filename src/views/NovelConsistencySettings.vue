<template>
  <div class="novel-consistency-settings">
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">
            <el-icon><Connection /></el-icon>
            人物一致性配置
          </span>
          <div class="header-actions">
            <el-tag type="success" v-if="profile?.autoExtracted">
              <el-icon><MagicStick /></el-icon>
              AI自动管理
            </el-tag>
            <el-button type="primary" :icon="Refresh" @click="autoExtract">
              自动提取角色
            </el-button>
          </div>
        </div>
      </template>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>

      <!-- 空状态 -->
      <el-empty v-else-if="!profile" description="尚未配置人物一致性">
        <el-button type="primary" :icon="MagicStick" @click="autoExtract">
          AI自动提取角色特征
        </el-button>
      </el-empty>

      <!-- 配置内容 -->
      <div v-else class="settings-content">
        <!-- 自动更新开关 -->
        <el-alert
          title="智能自动管理"
          type="info"
          :closable="false"
          show-icon
          class="auto-alert"
        >
          <div class="alert-content">
            <div>系统会自动从每章内容中提取角色特征，无需手动配置</div>
            <div>生成视频时自动保持人物视觉一致性</div>
            <el-switch 
              v-model="profile.autoUpdate"
              active-text="自动更新：开启（推荐）"
              inactive-text="自动更新：关闭"
              @change="toggleAutoUpdate"
              class="auto-switch"
            />
          </div>
        </el-alert>

        <!-- 角色列表 -->
        <el-divider content-position="left">
          <el-icon><User /></el-icon>
          角色列表
        </el-divider>

        <div class="characters-grid">
          <el-card 
            v-for="char in characters" 
            :key="char.name"
            class="character-card"
            shadow="hover"
          >
            <template #header>
              <div class="char-header">
                <span class="char-name">{{ char.name }}</span>
                <el-dropdown @command="(cmd) => handleCharAction(cmd, char)">
                  <el-icon class="more-icon"><MoreFilled /></el-icon>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item :icon="Edit" command="edit">编辑</el-dropdown-item>
                      <el-dropdown-item :icon="View" command="view">查看详情</el-dropdown-item>
                      <el-dropdown-item :icon="Delete" command="delete">删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>

            <!-- 参考图 -->
            <div class="char-reference" v-if="char.referenceImages && char.referenceImages.length">
              <el-image 
                :src="char.referenceImages[0]" 
                fit="cover"
                class="reference-image"
                :preview-src-list="char.referenceImages"
              >
                <template #error>
                  <div class="image-placeholder">
                    <el-icon><Picture /></el-icon>
                    <span>暂无参考图</span>
                  </div>
                </template>
              </el-image>
            </div>
            <div v-else class="char-reference">
              <div class="image-placeholder">
                <el-icon><Picture /></el-icon>
                <span>首次生成视频后自动获取</span>
              </div>
            </div>

            <!-- 基础信息 -->
            <div class="char-info">
              <div class="info-item">
                <span class="label">外貌:</span>
                <p class="value">{{ char.baseAppearance || '待自动提取' }}</p>
              </div>
              
              <div class="info-item">
                <span class="label">关键词:</span>
                <div class="keywords">
                  <el-tag 
                    v-for="keyword in (char.keywords || [])" 
                    :key="keyword"
                    size="small"
                    class="keyword-tag"
                  >
                    {{ keyword }}
                  </el-tag>
                  <span v-if="!char.keywords || char.keywords.length === 0" class="no-data">
                    待自动提取
                  </span>
                </div>
              </div>

              <!-- 章节动态状态 -->
              <div class="info-item" v-if="char.dynamicState && Object.keys(char.dynamicState).length">
                <span class="label">章节状态:</span>
                <el-scrollbar height="80px">
                  <div class="dynamic-states">
                    <el-tag 
                      v-for="(state, chapter) in char.dynamicState" 
                      :key="chapter"
                      type="info"
                      size="small"
                    >
                      第{{ chapter }}章: {{ state }}
                    </el-tag>
                  </div>
                </el-scrollbar>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 视觉风格配置 -->
        <el-divider content-position="left">
          <el-icon><Brush /></el-icon>
          视觉风格
        </el-divider>

        <el-form :model="visualStyleForm" label-width="120px" class="visual-style-form">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="整体风格">
                <el-select v-model="visualStyleForm.overall" style="width: 100%">
                  <el-option label="写实风格" value="realistic" />
                  <el-option label="动漫风格" value="anime" />
                  <el-option label="奇幻风格" value="fantasy" />
                  <el-option label="科幻风格" value="scifi" />
                  <el-option label="水墨风格" value="ink" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="色调">
                <el-select v-model="visualStyleForm.colorTone" style="width: 100%">
                  <el-option label="自然色调" value="natural" />
                  <el-option label="暖色调" value="warm" />
                  <el-option label="冷色调" value="cold" />
                  <el-option label="高饱和" value="vibrant" />
                  <el-option label="黑白" value="monochrome" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="艺术风格">
                <el-select v-model="visualStyleForm.artStyle" style="width: 100%">
                  <el-option label="电影级" value="cinematic" />
                  <el-option label="油画" value="oil-painting" />
                  <el-option label="水彩" value="watercolor" />
                  <el-option label="漫画" value="comic" />
                  <el-option label="素描" value="sketch" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="光照">
                <el-select v-model="visualStyleForm.lighting" style="width: 100%">
                  <el-option label="自然光" value="natural" />
                  <el-option label="戏剧光" value="dramatic" />
                  <el-option label="柔和光" value="soft" />
                  <el-option label="背光" value="backlight" />
                  <el-option label="黄金时刻" value="golden-hour" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button 
            type="primary" 
            size="large" 
            :icon="Check" 
            @click="saveProfile"
            :loading="saving"
          >
            保存配置
          </el-button>
          <el-button 
            size="large" 
            :icon="Refresh" 
            @click="loadProfile"
          >
            重新加载
          </el-button>
          <el-button 
            size="large" 
            :icon="Download" 
            @click="exportProfile"
          >
            导出配置
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 编辑角色对话框 -->
    <el-dialog
      v-model="showEditCharDialog"
      title="编辑角色特征"
      width="700px"
    >
      <el-form :model="editCharForm" label-width="100px">
        <el-form-item label="角色名称">
          <el-input v-model="editCharForm.name" disabled />
        </el-form-item>

        <el-form-item label="外貌描述">
          <el-input
            v-model="editCharForm.baseAppearance"
            type="textarea"
            :rows="4"
            placeholder="详细的外貌描述"
          />
        </el-form-item>

        <el-form-item label="关键词">
          <el-tag
            v-for="keyword in editCharForm.keywords"
            :key="keyword"
            closable
            @close="removeKeyword(keyword)"
            class="keyword-tag"
          >
            {{ keyword }}
          </el-tag>
          <el-input
            v-model="newKeyword"
            size="small"
            style="width: 100px"
            @keyup.enter="addKeyword"
          >
            <template #append>
              <el-button :icon="Plus" @click="addKeyword" />
            </template>
          </el-input>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showEditCharDialog = false">取消</el-button>
        <el-button type="primary" @click="saveCharacter">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Connection, 
  MagicStick, 
  Refresh, 
  User, 
  MoreFilled, 
  Edit, 
  View, 
  Delete, 
  Picture, 
  Brush,
  Check,
  Download,
  Plus
} from '@element-plus/icons-vue'
import { consistencyService } from '@/services/consistencyService'

const route = useRoute()
const novelId = computed(() => route.params.novelId || route.query.novelId)

// 状态
const loading = ref(false)
const saving = ref(false)
const profile = ref(null)
const showEditCharDialog = ref(false)

// 编辑角色表单
const editCharForm = reactive({
  name: '',
  baseAppearance: '',
  keywords: [],
  referenceImages: []
})
const newKeyword = ref('')

// 视觉风格表单
const visualStyleForm = reactive({
  overall: 'realistic',
  colorTone: 'natural',
  artStyle: 'cinematic',
  lighting: 'natural'
})

// 计算属性
const characters = computed(() => {
  if (!profile.value || !profile.value.characters) {
    return []
  }
  
  // 兼容两种格式
  if (Array.isArray(profile.value.characters)) {
    return profile.value.characters
  } else if (profile.value.characters.characters) {
    return profile.value.characters.characters
  }
  
  return []
})

// 方法
const loadProfile = async () => {
  if (!novelId.value) {
    ElMessage.warning('未指定小说ID')
    return
  }

  loading.value = true
  try {
    const data = await consistencyService.getProfile(novelId.value)
    profile.value = data
    
    // 加载视觉风格
    if (data.visualStyle) {
      Object.assign(visualStyleForm, data.visualStyle)
    }
  } catch (error) {
    // 如果没有配置，显示空状态
    if (error.message.includes('不存在')) {
      profile.value = null
    } else {
      ElMessage.error(error.message || '加载配置失败')
    }
  } finally {
    loading.value = false
  }
}

const autoExtract = async () => {
  if (!novelId.value) {
    ElMessage.warning('未指定小说ID')
    return
  }

  try {
    await ElMessageBox.confirm(
      'AI将自动分析小说内容，提取所有角色的外貌特征。是否继续？',
      '自动提取角色',
      {
        confirmButtonText: '开始提取',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    loading.value = true
    const data = await consistencyService.autoExtract({
      novelId: novelId.value,
      startChapter: 1,
      endChapter: 10,  // 分析前10章
      overwrite: false
    })
    
    profile.value = data
    ElMessage.success('角色特征提取成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '自动提取失败')
    }
  } finally {
    loading.value = false
  }
}

const toggleAutoUpdate = async (value) => {
  try {
    await consistencyService.updateProfile(novelId.value, {
      autoUpdate: value
    })
    ElMessage.success(value ? '已开启自动更新' : '已关闭自动更新')
  } catch (error) {
    ElMessage.error('更新设置失败')
    profile.value.autoUpdate = !value  // 回滚
  }
}

const saveProfile = async () => {
  if (!novelId.value) return

  saving.value = true
  try {
    await consistencyService.updateProfile(novelId.value, {
      visualStyle: visualStyleForm
    })
    ElMessage.success('配置保存成功')
    await loadProfile()
  } catch (error) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const handleCharAction = (command, char) => {
  switch (command) {
    case 'edit':
      editCharacter(char)
      break
    case 'view':
      viewCharacter(char)
      break
    case 'delete':
      deleteCharacter(char)
      break
  }
}

const editCharacter = (char) => {
  Object.assign(editCharForm, {
    name: char.name,
    baseAppearance: char.baseAppearance || '',
    keywords: [...(char.keywords || [])],
    referenceImages: [...(char.referenceImages || [])]
  })
  showEditCharDialog.value = true
}

const saveCharacter = async () => {
  try {
    await consistencyService.updateCharacter(
      novelId.value,
      editCharForm.name,
      {
        baseAppearance: editCharForm.baseAppearance,
        keywords: editCharForm.keywords
      }
    )
    ElMessage.success('角色特征已更新')
    showEditCharDialog.value = false
    await loadProfile()
  } catch (error) {
    ElMessage.error(error.message || '更新失败')
  }
}

const viewCharacter = (char) => {
  ElMessageBox.alert(
    `<div style="line-height: 1.8">
      <p><strong>角色名称:</strong> ${char.name}</p>
      <p><strong>外貌描述:</strong> ${char.baseAppearance || '待提取'}</p>
      <p><strong>关键词:</strong> ${(char.keywords || []).join(', ')}</p>
      <p><strong>参考图数量:</strong> ${(char.referenceImages || []).length}</p>
      <p><strong>章节状态记录:</strong> ${Object.keys(char.dynamicState || {}).length}个</p>
    </div>`,
    '角色详情',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '关闭'
    }
  )
}

const deleteCharacter = async (char) => {
  try {
    await ElMessageBox.confirm(
      `确定删除角色"${char.name}"的一致性配置吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await consistencyService.deleteCharacter(novelId.value, char.name)
    ElMessage.success('角色已删除')
    await loadProfile()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const addKeyword = () => {
  if (newKeyword.value.trim() && !editCharForm.keywords.includes(newKeyword.value)) {
    editCharForm.keywords.push(newKeyword.value.trim())
    newKeyword.value = ''
  }
}

const removeKeyword = (keyword) => {
  const index = editCharForm.keywords.indexOf(keyword)
  if (index > -1) {
    editCharForm.keywords.splice(index, 1)
  }
}

const exportProfile = () => {
  if (profile.value) {
    consistencyService.exportProfile(profile.value)
    ElMessage.success('配置已导出')
  }
}

// 生命周期
onMounted(() => {
  loadProfile()
})
</script>

<style scoped lang="scss">
.novel-consistency-settings {
  padding: 20px;

  .settings-card {
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

      .header-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    }
  }

  .loading-container {
    padding: 40px;
  }

  .auto-alert {
    margin-bottom: 20px;

    .alert-content {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .auto-switch {
        margin-top: 8px;
      }
    }
  }

  .characters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
    margin: 20px 0;

    .character-card {
      .char-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .char-name {
          font-size: 16px;
          font-weight: 500;
        }

        .more-icon {
          cursor: pointer;
          font-size: 18px;
          
          &:hover {
            color: #409eff;
          }
        }
      }

      .char-reference {
        margin-bottom: 16px;

        .reference-image {
          width: 100%;
          height: 200px;
          border-radius: 4px;
        }

        .image-placeholder {
          width: 100%;
          height: 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #f5f7fa;
          border-radius: 4px;
          color: #909399;
          gap: 8px;

          .el-icon {
            font-size: 40px;
          }

          span {
            font-size: 12px;
          }
        }
      }

      .char-info {
        .info-item {
          margin-bottom: 12px;

          .label {
            font-weight: 500;
            color: #606266;
            font-size: 13px;
          }

          .value {
            margin: 4px 0;
            color: #303133;
            font-size: 13px;
            line-height: 1.6;
          }

          .keywords {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 4px;

            .keyword-tag {
              margin: 0;
            }

            .no-data {
              color: #909399;
              font-size: 12px;
            }
          }

          .dynamic-states {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            padding: 8px;
          }
        }
      }
    }
  }

  .visual-style-form {
    max-width: 800px;
    margin: 20px 0;
  }

  .action-buttons {
    display: flex;
    gap: 12px;
    justify-content: center;
    padding: 30px 0;
    border-top: 1px solid #ebeef5;
  }
}
</style>
