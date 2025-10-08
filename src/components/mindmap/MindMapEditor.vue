<template>
  <div class="mindmap-editor">
    <div class="mindmap-toolbar">
      <el-button-group>
        <el-button size="small" @click="addNode" :icon="Plus">添加节点</el-button>
        <el-button size="small" @click="deleteSelected" :icon="Delete">删除</el-button>
        <el-button size="small" @click="editSelected" :icon="Edit">编辑</el-button>
      </el-button-group>
      
      <el-divider direction="vertical" />
      
      <el-button-group>
        <el-button size="small" @click="autoLayout('hierarchical')">层次布局</el-button>
        <el-button size="small" @click="autoLayout('radial')">辐射布局</el-button>
        <el-button size="small" @click="fitView" :icon="FullScreen">适应视图</el-button>
      </el-button-group>
      
      <el-divider direction="vertical" />
      
      <el-button-group>
        <el-button size="small" @click="exportMindMap" :icon="Download">导出</el-button>
        <el-button size="small" @click="importMindMap" :icon="Upload">导入</el-button>
        <el-button size="small" @click="saveMindMap" type="primary" :loading="saving">保存</el-button>
      </el-button-group>
    </div>

    <div ref="networkContainer" class="network-container"></div>

    <!-- 节点编辑对话框 -->
    <el-dialog
      v-model="showEditDialog"
      :title="editMode === 'add' ? '添加节点' : '编辑节点'"
      width="500px"
    >
      <el-form :model="nodeForm" label-width="80px">
        <el-form-item label="节点标题">
          <el-input v-model="nodeForm.label" placeholder="输入节点标题" />
        </el-form-item>
        <el-form-item label="节点类型">
          <el-select v-model="nodeForm.type" placeholder="选择节点类型">
            <el-option label="主题" value="main" />
            <el-option label="分支" value="branch" />
            <el-option label="叶子" value="leaf" />
            <el-option label="注释" value="note" />
          </el-select>
        </el-form-item>
        <el-form-item label="节点颜色">
          <el-color-picker v-model="nodeForm.color" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="nodeForm.description"
            type="textarea"
            :rows="3"
            placeholder="输入节点描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveNode">保存</el-button>
      </template>
    </el-dialog>

    <!-- 导入文件选择 -->
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      style="display: none"
      @change="handleFileImport"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Edit, FullScreen, Download, Upload } from '@element-plus/icons-vue'
import { Network } from 'vis-network/standalone'

const props = defineProps({
  novelId: {
    type: String,
    required: true
  },
  initialData: {
    type: Object,
    default: () => ({
      nodes: [],
      edges: []
    })
  }
})

const emit = defineEmits(['save', 'update'])

const networkContainer = ref(null)
const fileInput = ref(null)
const network = ref(null)
const showEditDialog = ref(false)
const saving = ref(false)
const editMode = ref('add')
const selectedNode = ref(null)

const nodeForm = ref({
  label: '',
  type: 'branch',
  color: '#409EFF',
  description: ''
})

const nodes = ref([])
const edges = ref([])

// 节点类型配置
const nodeTypeConfig = {
  main: { color: '#409EFF', shape: 'ellipse', size: 30 },
  branch: { color: '#67C23A', shape: 'box', size: 25 },
  leaf: { color: '#E6A23C', shape: 'circle', size: 20 },
  note: { color: '#909399', shape: 'text', size: 15 }
}

onMounted(() => {
  initNetwork()
  loadData(props.initialData)
})

onBeforeUnmount(() => {
  if (network.value) {
    network.value.destroy()
  }
})

watch(() => props.initialData, (newData) => {
  loadData(newData)
}, { deep: true })

/**
 * 初始化网络图
 */
const initNetwork = () => {
  const container = networkContainer.value
  
  const data = {
    nodes: nodes.value,
    edges: edges.value
  }

  const options = {
    nodes: {
      font: {
        size: 14,
        color: '#333'
      },
      borderWidth: 2,
      shadow: true
    },
    edges: {
      width: 2,
      color: { color: '#848484' },
      smooth: {
        type: 'cubicBezier',
        forceDirection: 'horizontal',
        roundness: 0.4
      },
      arrows: {
        to: { enabled: true, scaleFactor: 0.5 }
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
        springLength: 95
      }
    },
    interaction: {
      hover: true,
      tooltipDelay: 200,
      zoomView: true,
      dragView: true
    },
    manipulation: {
      enabled: false
    }
  }

  network.value = new Network(container, data, options)

  // 监听节点双击事件
  network.value.on('doubleClick', (params) => {
    if (params.nodes.length > 0) {
      selectedNode.value = params.nodes[0]
      editNode(selectedNode.value)
    }
  })

  // 监听节点选择
  network.value.on('selectNode', (params) => {
    selectedNode.value = params.nodes[0]
  })
}

/**
 * 加载数据
 */
const loadData = (data) => {
  if (data && data.nodes && data.edges) {
    nodes.value = data.nodes.map(node => ({
      id: node.id,
      label: node.label,
      ...nodeTypeConfig[node.type || 'branch'],
      color: node.color || nodeTypeConfig[node.type || 'branch'].color,
      title: node.description || node.label
    }))
    
    edges.value = data.edges

    if (network.value) {
      network.value.setData({
        nodes: nodes.value,
        edges: edges.value
      })
    }
  }
}

/**
 * 添加节点
 */
const addNode = () => {
  editMode.value = 'add'
  nodeForm.value = {
    label: '',
    type: 'branch',
    color: '#67C23A',
    description: ''
  }
  showEditDialog.value = true
}

/**
 * 编辑节点
 */
const editNode = (nodeId) => {
  const nodeData = nodes.value.find(n => n.id === nodeId)
  if (!nodeData) return

  editMode.value = 'edit'
  const originalNode = props.initialData.nodes.find(n => n.id === nodeId)
  
  nodeForm.value = {
    label: nodeData.label,
    type: originalNode?.type || 'branch',
    color: nodeData.color,
    description: originalNode?.description || ''
  }
  showEditDialog.value = true
}

/**
 * 编辑选中节点
 */
const editSelected = () => {
  if (!selectedNode.value) {
    ElMessage.warning('请先选择一个节点')
    return
  }
  editNode(selectedNode.value)
}

/**
 * 保存节点
 */
const saveNode = () => {
  if (!nodeForm.value.label) {
    ElMessage.warning('请输入节点标题')
    return
  }

  if (editMode.value === 'add') {
    const newNodeId = `node_${Date.now()}`
    const typeConfig = nodeTypeConfig[nodeForm.value.type]
    
    const newNode = {
      id: newNodeId,
      label: nodeForm.value.label,
      type: nodeForm.value.type,
      description: nodeForm.value.description,
      ...typeConfig,
      color: nodeForm.value.color
    }

    nodes.value.push(newNode)

    // 如果有选中的节点，创建连接
    if (selectedNode.value) {
      edges.value.push({
        from: selectedNode.value,
        to: newNodeId
      })
    }

    network.value.setData({
      nodes: nodes.value,
      edges: edges.value
    })

    emit('update', { nodes: getNodesData(), edges: edges.value })
  } else {
    // 编辑模式
    const nodeIndex = nodes.value.findIndex(n => n.id === selectedNode.value)
    if (nodeIndex !== -1) {
      const typeConfig = nodeTypeConfig[nodeForm.value.type]
      nodes.value[nodeIndex] = {
        ...nodes.value[nodeIndex],
        label: nodeForm.value.label,
        type: nodeForm.value.type,
        description: nodeForm.value.description,
        ...typeConfig,
        color: nodeForm.value.color
      }

      network.value.setData({
        nodes: nodes.value,
        edges: edges.value
      })

      emit('update', { nodes: getNodesData(), edges: edges.value })
    }
  }

  showEditDialog.value = false
}

/**
 * 删除选中节点
 */
const deleteSelected = async () => {
  if (!selectedNode.value) {
    ElMessage.warning('请先选择一个节点')
    return
  }

  try {
    await ElMessageBox.confirm('确定要删除这个节点吗？', '删除确认', {
      type: 'warning'
    })

    nodes.value = nodes.value.filter(n => n.id !== selectedNode.value)
    edges.value = edges.value.filter(e => 
      e.from !== selectedNode.value && e.to !== selectedNode.value
    )

    network.value.setData({
      nodes: nodes.value,
      edges: edges.value
    })

    emit('update', { nodes: getNodesData(), edges: edges.value })
    selectedNode.value = null
  } catch (error) {
    // 用户取消
  }
}

/**
 * 自动布局
 */
const autoLayout = (layoutType) => {
  let options = {}

  if (layoutType === 'hierarchical') {
    options = {
      layout: {
        hierarchical: {
          direction: 'LR',
          sortMethod: 'directed',
          nodeSpacing: 150,
          levelSeparation: 200
        }
      },
      physics: {
        enabled: false
      }
    }
  } else if (layoutType === 'radial') {
    options = {
      layout: {
        hierarchical: false
      },
      physics: {
        enabled: true,
        solver: 'forceAtlas2Based',
        forceAtlas2Based: {
          gravitationalConstant: -50,
          centralGravity: 0.01,
          springLength: 100,
          springConstant: 0.08
        }
      }
    }
  }

  network.value.setOptions(options)
  setTimeout(() => {
    network.value.fit()
  }, 500)
}

/**
 * 适应视图
 */
const fitView = () => {
  network.value.fit({
    animation: {
      duration: 500,
      easingFunction: 'easeInOutQuad'
    }
  })
}

/**
 * 导出思维导图
 */
const exportMindMap = () => {
  const data = {
    nodes: getNodesData(),
    edges: edges.value
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  })
  
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `mindmap_${Date.now()}.json`
  link.click()
  URL.revokeObjectURL(url)

  ElMessage.success('导出成功')
}

/**
 * 导入思维导图
 */
const importMindMap = () => {
  fileInput.value.click()
}

/**
 * 处理文件导入
 */
const handleFileImport = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      loadData(data)
      emit('update', data)
      ElMessage.success('导入成功')
    } catch (error) {
      ElMessage.error('导入失败：文件格式错误')
    }
  }
  reader.readAsText(file)
  
  // 重置input
  event.target.value = ''
}

/**
 * 保存思维导图
 */
const saveMindMap = async () => {
  saving.value = true
  try {
    const data = {
      nodes: getNodesData(),
      edges: edges.value
    }
    await emit('save', data)
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

/**
 * 获取节点数据（不含vis配置）
 */
const getNodesData = () => {
  return nodes.value.map(node => ({
    id: node.id,
    label: node.label,
    type: node.type,
    color: node.color,
    description: node.title
  }))
}

// 暴露方法给父组件
defineExpose({
  getData: () => ({
    nodes: getNodesData(),
    edges: edges.value
  }),
  loadData
})
</script>

<style scoped>
.mindmap-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.mindmap-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.network-container {
  flex: 1;
  min-height: 500px;
  background: #fafafa;
}
</style>
