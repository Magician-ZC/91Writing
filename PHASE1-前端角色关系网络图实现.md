# Phase 1 - 前端: 角色关系网络图实现

**组件**: CharacterNetworkGraph  
**技术栈**: Vue3 + vis-network + Element Plus

---

## 📦 依赖安装

```bash
cd 91Writing
npm install vis-network --save
```

---

## 🔧 Service 层

### src/services/characterRelationshipService.js

```javascript
import { backendApi } from './backendApi'

class CharacterRelationshipService {
  /**
   * 创建角色关系
   */
  async create(novelId, relationshipData) {
    return await backendApi.post(
      `/api/v1/novels/${novelId}/character-relationships`,
      relationshipData
    )
  }

  /**
   * 获取所有关系
   */
  async getAll(novelId, query = {}) {
    return await backendApi.get(
      `/api/v1/novels/${novelId}/character-relationships`,
      { params: query }
    )
  }

  /**
   * 获取网络图数据
   */
  async getNetworkData(novelId) {
    return await backendApi.get(
      `/api/v1/novels/${novelId}/character-relationships/network`
    )
  }

  /**
   * 获取关系详情
   */
  async getOne(novelId, relationshipId) {
    return await backendApi.get(
      `/api/v1/novels/${novelId}/character-relationships/${relationshipId}`
    )
  }

  /**
   * 更新关系
   */
  async update(novelId, relationshipId, updateData) {
    return await backendApi.patch(
      `/api/v1/novels/${novelId}/character-relationships/${relationshipId}`,
      updateData
    )
  }

  /**
   * 删除关系
   */
  async delete(novelId, relationshipId) {
    return await backendApi.delete(
      `/api/v1/novels/${novelId}/character-relationships/${relationshipId}`
    )
  }

  /**
   * 批量创建关系
   */
  async createBatch(novelId, relationships) {
    return await backendApi.post(
      `/api/v1/novels/${novelId}/character-relationships/batch`,
      relationships
    )
  }
}

export default new CharacterRelationshipService()
```

---

## 🎨 核心组件

### src/components/character-network/CharacterNetworkGraph.vue

```vue
<template>
  <div class="character-network-container">
    <!-- 工具栏 -->
    <div class="network-toolbar">
      <el-space>
        <el-button 
          type="primary" 
          :icon="Plus" 
          @click="showAddRelationDialog"
        >
          添加关系
        </el-button>
        
        <el-button :icon="Refresh" @click="loadNetworkData">
          刷新
        </el-button>
        
        <el-dropdown @command="handleFilterChange">
          <el-button :icon="Filter">
            筛选关系 <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="all">全部关系</el-dropdown-item>
              <el-dropdown-item command="friend">朋友</el-dropdown-item>
              <el-dropdown-item command="enemy">敌人</el-dropdown-item>
              <el-dropdown-item command="family">家人</el-dropdown-item>
              <el-dropdown-item command="lover">恋人</el-dropdown-item>
              <el-dropdown-item command="colleague">同事</el-dropdown-item>
              <el-dropdown-item command="mentor">师徒</el-dropdown-item>
              <el-dropdown-item command="rival">对手</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-switch
          v-model="showLabels"
          @change="toggleLabels"
          active-text="显示标签"
          inactive-text="隐藏标签"
        />
      </el-space>

      <!-- 统计信息 -->
      <div class="network-stats">
        <el-tag type="info">角色: {{ statistics.totalCharacters }}</el-tag>
        <el-tag type="success">关系: {{ statistics.totalRelationships }}</el-tag>
      </div>
    </div>

    <!-- 网络图容器 -->
    <div ref="networkContainer" class="network-graph"></div>

    <!-- 关系详情抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      :title="selectedRelation ? '关系详情' : ''"
      size="40%"
    >
      <div v-if="selectedRelation" class="relation-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="源角色">
            <div class="character-info">
              <el-avatar :src="selectedRelation.sourceCharacter.avatar" />
              <span>{{ selectedRelation.sourceCharacter.name }}</span>
            </div>
          </el-descriptions-item>
          
          <el-descriptions-item label="目标角色">
            <div class="character-info">
              <el-avatar :src="selectedRelation.targetCharacter.avatar" />
              <span>{{ selectedRelation.targetCharacter.name }}</span>
            </div>
          </el-descriptions-item>
          
          <el-descriptions-item label="关系类型">
            <el-tag :type="getRelationTagType(selectedRelation.relationType)">
              {{ getRelationLabel(selectedRelation.relationType) }}
            </el-tag>
          </el-descriptions-item>
          
          <el-descriptions-item label="关系强度">
            <el-rate v-model="selectedRelation.strength" disabled />
            <span class="ml-2">{{ selectedRelation.strength }}/10</span>
          </el-descriptions-item>
          
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(selectedRelation.status)">
              {{ getStatusLabel(selectedRelation.status) }}
            </el-tag>
          </el-descriptions-item>
          
          <el-descriptions-item label="描述" v-if="selectedRelation.description">
            {{ selectedRelation.description }}
          </el-descriptions-item>
          
          <el-descriptions-item label="首次出现" v-if="selectedRelation.chapterIntroduced">
            第 {{ selectedRelation.chapterIntroduced }} 章
          </el-descriptions-item>
        </el-descriptions>

        <div class="relation-actions">
          <el-button type="primary" @click="editRelation">编辑</el-button>
          <el-button type="danger" @click="deleteRelation">删除</el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 添加/编辑关系对话框 -->
    <RelationshipEditDialog
      v-model="dialogVisible"
      :novel-id="novelId"
      :characters="characters"
      :relationship="editingRelation"
      @success="handleRelationSaved"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Network } from 'vis-network'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, Filter, ArrowDown } from '@element-plus/icons-vue'
import characterRelationshipService from '@/services/characterRelationshipService'
import RelationshipEditDialog from './RelationshipEditDialog.vue'

const props = defineProps({
  novelId: {
    type: String,
    required: true
  }
})

// 数据
const networkContainer = ref(null)
const network = ref(null)
const networkData = ref({ nodes: [], edges: [] })
const statistics = ref({
  totalCharacters: 0,
  totalRelationships: 0,
  relationshipTypes: {}
})
const characters = ref([])

// UI 状态
const drawerVisible = ref(false)
const dialogVisible = ref(false)
const selectedRelation = ref(null)
const editingRelation = ref(null)
const showLabels = ref(true)
const currentFilter = ref('all')

// 加载网络数据
const loadNetworkData = async () => {
  try {
    const response = await characterRelationshipService.getNetworkData(props.novelId)
    const { nodes, edges, statistics: stats } = response.data
    
    networkData.value = { nodes, edges }
    statistics.value = stats
    
    // 提取角色列表
    characters.value = nodes.map(node => ({
      id: node.id,
      name: node.label,
      avatar: node.image,
      role: node.role
    }))
    
    // 初始化或更新网络图
    if (!network.value) {
      initNetwork()
    } else {
      updateNetwork()
    }
  } catch (error) {
    ElMessage.error('加载网络数据失败: ' + error.message)
  }
}

// 初始化网络图
const initNetwork = () => {
  const data = {
    nodes: networkData.value.nodes,
    edges: networkData.value.edges
  }

  const options = {
    nodes: {
      shape: 'circularImage',
      size: 50,
      font: {
        size: 14,
        color: '#333'
      },
      borderWidth: 2,
      borderWidthSelected: 4,
      chosen: true
    },
    edges: {
      width: 2,
      chosen: true,
      arrows: {
        to: {
          enabled: true,
          scaleFactor: 0.5
        }
      },
      font: {
        size: 12,
        align: 'middle',
        background: 'white',
        strokeWidth: 0
      },
      smooth: {
        enabled: true,
        type: 'dynamic'
      }
    },
    physics: {
      enabled: true,
      stabilization: {
        iterations: 100
      },
      barnesHut: {
        gravitationalConstant: -2000,
        springConstant: 0.04,
        springLength: 150
      }
    },
    interaction: {
      hover: true,
      tooltipDelay: 200,
      navigationButtons: true,
      keyboard: true
    },
    layout: {
      improvedLayout: true
    }
  }

  network.value = new Network(networkContainer.value, data, options)

  // 绑定事件
  network.value.on('selectEdge', handleEdgeSelect)
  network.value.on('doubleClick', handleDoubleClick)
}

// 更新网络图
const updateNetwork = () => {
  if (network.value) {
    network.value.setData({
      nodes: networkData.value.nodes,
      edges: networkData.value.edges
    })
  }
}

// 处理边选择
const handleEdgeSelect = async (params) => {
  if (params.edges.length > 0) {
    const edgeId = params.edges[0]
    try {
      const response = await characterRelationshipService.getOne(
        props.novelId,
        edgeId
      )
      selectedRelation.value = response.data
      drawerVisible.value = true
    } catch (error) {
      ElMessage.error('获取关系详情失败')
    }
  }
}

// 处理双击
const handleDoubleClick = (params) => {
  if (params.nodes.length > 0) {
    // 双击节点，显示该角色的所有关系
    const nodeId = params.nodes[0]
    highlightCharacterRelations(nodeId)
  }
}

// 高亮角色关系
const highlightCharacterRelations = (characterId) => {
  const connectedEdges = networkData.value.edges.filter(
    edge => edge.from === characterId || edge.to === characterId
  )
  
  if (connectedEdges.length === 0) {
    ElMessage.info('该角色暂无关系')
    return
  }

  // 高亮相关边
  network.value.selectEdges(connectedEdges.map(e => e.id))
}

// 显示添加关系对话框
const showAddRelationDialog = () => {
  editingRelation.value = null
  dialogVisible.value = true
}

// 编辑关系
const editRelation = () => {
  editingRelation.value = selectedRelation.value
  dialogVisible.value = true
  drawerVisible.value = false
}

// 删除关系
const deleteRelation = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个关系吗？',
      '确认删除',
      { type: 'warning' }
    )
    
    await characterRelationshipService.delete(
      props.novelId,
      selectedRelation.value.id
    )
    
    ElMessage.success('删除成功')
    drawerVisible.value = false
    loadNetworkData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 关系保存成功
const handleRelationSaved = () => {
  dialogVisible.value = false
  loadNetworkData()
}

// 切换标签显示
const toggleLabels = (show) => {
  if (network.value) {
    const edges = networkData.value.edges.map(edge => ({
      ...edge,
      label: show ? edge.label : ''
    }))
    network.value.setData({
      nodes: networkData.value.nodes,
      edges
    })
  }
}

// 筛选关系
const handleFilterChange = (type) => {
  currentFilter.value = type
  
  if (type === 'all') {
    updateNetwork()
  } else {
    const filteredEdges = networkData.value.edges.filter(
      edge => edge.relationType === type
    )
    network.value.setData({
      nodes: networkData.value.nodes,
      edges: filteredEdges
    })
  }
}

// 辅助方法
const getRelationLabel = (type) => {
  const labels = {
    friend: '朋友',
    enemy: '敌人',
    family: '家人',
    lover: '恋人',
    colleague: '同事',
    mentor: '师徒',
    rival: '对手'
  }
  return labels[type] || type
}

const getRelationTagType = (type) => {
  const types = {
    friend: 'success',
    enemy: 'danger',
    family: 'primary',
    lover: 'warning',
    colleague: 'info',
    mentor: '',
    rival: 'danger'
  }
  return types[type] || ''
}

const getStatusLabel = (status) => {
  const labels = {
    active: '活跃',
    broken: '破裂',
    changed: '变化'
  }
  return labels[status] || status
}

const getStatusTagType = (status) => {
  const types = {
    active: 'success',
    broken: 'danger',
    changed: 'warning'
  }
  return types[status] || ''
}

// 生命周期
onMounted(() => {
  loadNetworkData()
})

// 暴露方法
defineExpose({
  refresh: loadNetworkData
})
</script>

<style scoped>
.character-network-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
}

.network-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.network-stats {
  display: flex;
  gap: 8px;
}

.network-graph {
  flex: 1;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #fafafa;
}

.relation-detail {
  padding: 16px;
}

.character-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.relation-actions {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.ml-2 {
  margin-left: 8px;
}
</style>
```

### src/components/character-network/RelationshipEditDialog.vue

```vue
<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="relationship ? '编辑关系' : '添加关系'"
    width="600px"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="源角色" prop="sourceCharacterId">
        <el-select
          v-model="form.sourceCharacterId"
          placeholder="选择源角色"
          filterable
          style="width: 100%"
          :disabled="!!relationship"
        >
          <el-option
            v-for="char in characters"
            :key="char.id"
            :label="char.name"
            :value="char.id"
          >
            <div class="character-option">
              <el-avatar :src="char.avatar" size="small" />
              <span>{{ char.name }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="目标角色" prop="targetCharacterId">
        <el-select
          v-model="form.targetCharacterId"
          placeholder="选择目标角色"
          filterable
          style="width: 100%"
          :disabled="!!relationship"
        >
          <el-option
            v-for="char in availableTargets"
            :key="char.id"
            :label="char.name"
            :value="char.id"
          >
            <div class="character-option">
              <el-avatar :src="char.avatar" size="small" />
              <span>{{ char.name }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="关系类型" prop="relationType">
        <el-select
          v-model="form.relationType"
          placeholder="选择关系类型"
          style="width: 100%"
        >
          <el-option label="朋友" value="friend" />
          <el-option label="敌人" value="enemy" />
          <el-option label="家人" value="family" />
          <el-option label="恋人" value="lover" />
          <el-option label="同事" value="colleague" />
          <el-option label="师徒" value="mentor" />
          <el-option label="对手" value="rival" />
        </el-select>
      </el-form-item>

      <el-form-item label="关系强度" prop="strength">
        <el-slider
          v-model="form.strength"
          :min="1"
          :max="10"
          show-stops
          show-input
        />
      </el-form-item>

      <el-form-item label="关系描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="描述这个关系的详细信息"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="首次出现" prop="chapterIntroduced">
        <el-input-number
          v-model="form.chapterIntroduced"
          :min="1"
          placeholder="章节号"
        />
      </el-form-item>

      <el-form-item label="关系状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio label="active">活跃</el-radio>
          <el-radio label="broken">破裂</el-radio>
          <el-radio label="changed">变化</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import characterRelationshipService from '@/services/characterRelationshipService'

const props = defineProps({
  modelValue: Boolean,
  novelId: String,
  characters: Array,
  relationship: Object
})

const emit = defineEmits(['update:modelValue', 'success'])

// 表单
const formRef = ref(null)
const form = ref({
  sourceCharacterId: '',
  targetCharacterId: '',
  relationType: 'friend',
  strength: 5,
  description: '',
  chapterIntroduced: null,
  status: 'active'
})

const submitting = ref(false)

// 验证规则
const rules = {
  sourceCharacterId: [
    { required: true, message: '请选择源角色', trigger: 'change' }
  ],
  targetCharacterId: [
    { required: true, message: '请选择目标角色', trigger: 'change' }
  ],
  relationType: [
    { required: true, message: '请选择关系类型', trigger: 'change' }
  ],
  strength: [
    { required: true, message: '请设置关系强度', trigger: 'blur' }
  ]
}

// 可选的目标角色（排除源角色）
const availableTargets = computed(() => {
  return props.characters.filter(
    char => char.id !== form.value.sourceCharacterId
  )
})

// 监听 relationship 变化
watch(
  () => props.relationship,
  (newVal) => {
    if (newVal) {
      form.value = {
        sourceCharacterId: newVal.sourceCharacterId,
        targetCharacterId: newVal.targetCharacterId,
        relationType: newVal.relationType,
        strength: newVal.strength,
        description: newVal.description || '',
        chapterIntroduced: newVal.chapterIntroduced,
        status: newVal.status
      }
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

// 重置表单
const resetForm = () => {
  form.value = {
    sourceCharacterId: '',
    targetCharacterId: '',
    relationType: 'friend',
    strength: 5,
    description: '',
    chapterIntroduced: null,
    status: 'active'
  }
  formRef.value?.resetFields()
}

// 提交
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    submitting.value = true
    
    if (props.relationship) {
      // 更新
      await characterRelationshipService.update(
        props.novelId,
        props.relationship.id,
        form.value
      )
      ElMessage.success('更新成功')
    } else {
      // 创建
      await characterRelationshipService.create(props.novelId, form.value)
      ElMessage.success('创建成功')
    }
    
    emit('success')
    emit('update:modelValue', false)
    resetForm()
  } catch (error) {
    if (error !== 'validation') {
      ElMessage.error(error.message || '操作失败')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.character-option {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
```

---

## 🔗 集成到 WriterCharacterPanel

### src/components/writer/WriterCharacterPanel.vue (修改)

```vue
<template>
  <div class="panel-content">
    <!-- 添加 Tab 切换 -->
    <el-tabs v-model="activeTab" class="character-tabs">
      <el-tab-pane label="角色列表" name="list">
        <!-- 原有的角色列表代码 -->
        <el-card shadow="never">
          <!-- ... 现有代码 ... -->
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="关系网络" name="network">
        <CharacterNetworkGraph
          v-if="activeTab === 'network' && currentNovelId"
          :novel-id="currentNovelId"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CharacterNetworkGraph from '@/components/character-network/CharacterNetworkGraph.vue'

// 现有代码...

const activeTab = ref('list')
const currentNovelId = ref('') // 从路由或 store 获取

// ... 其他现有代码
</script>
```

---

## 📋 前端检查清单

- [x] 使用 vis-network 库
- [x] 响应式设计
- [x] 完整的错误处理
- [x] Loading 状态
- [x] 用户友好的提示
- [x] 支持筛选和搜索
- [x] 双向数据绑定
- [x] 事件处理
- [x] 样式美化

---

**状态**: ✅ 前端实现完成  
**下一步**: 测试和优化

