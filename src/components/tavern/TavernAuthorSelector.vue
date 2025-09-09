<template>
  <div class="tavern-author-selector">
    <div class="selector-header">
      <h4>
        <el-icon><Avatar /></el-icon>
        选择参与讨论的作者
      </h4>
      <p class="selector-desc">根据小说类型选择合适的大神作者参与讨论</p>
    </div>

    <div class="author-controls">
      <div class="control-buttons">
        <el-button 
          type="primary" 
          size="small" 
          @click="selectAll"
          :disabled="isAllSelected"
        >
          <el-icon><Check /></el-icon>
          一键全选
        </el-button>
        <el-button 
          size="small" 
          @click="clearAll"
          :disabled="selectedAuthors.length === 0"
        >
          <el-icon><Close /></el-icon>
          清空选择
        </el-button>
        <el-button 
          size="small" 
          @click="selectRecommended"
        >
          <el-icon><Star /></el-icon>
          推荐选择
        </el-button>
      </div>
      <div class="selection-info">
        已选择 <strong>{{ selectedAuthors.length }}</strong> / {{ availableAuthors.length }} 位作者
      </div>
    </div>

    <div class="authors-grid">
      <div 
        v-for="author in availableAuthors" 
        :key="author.id"
        class="author-card"
        :class="{ selected: selectedAuthors.includes(author.id) }"
        @click="toggleAuthor(author.id)"
      >
        <div class="author-avatar">{{ author.avatar }}</div>
        <div class="author-info">
          <div class="author-name">{{ author.name }}</div>
          <div class="author-specialties">
            <el-tag 
              v-for="specialty in author.specialties.slice(0, 2)" 
              :key="specialty"
              size="small"
              type="info"
            >
              {{ specialty }}
            </el-tag>
          </div>
          <div class="author-style">{{ author.style }}</div>
          <div class="author-masterworks">
            代表作：{{ author.masterworks.slice(0, 2).join('、') }}
          </div>
        </div>
        <div class="selection-indicator" v-if="selectedAuthors.includes(author.id)">
          <el-icon><Check /></el-icon>
        </div>
      </div>
    </div>

    <div class="selector-footer" v-if="selectedAuthors.length > 0">
      <el-alert
        :title="`已选择 ${selectedAuthors.length} 位作者，他们将共同参与讨论`"
        type="success"
        :closable="false"
        show-icon
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Avatar, Check, Close, Star } from '@element-plus/icons-vue'

const props = defineProps({
  authors: {
    type: Array,
    default: () => []
  },
  modelValue: {
    type: Array,
    default: () => []
  },
  maxSelection: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits(['update:modelValue'])

const selectedAuthors = ref([...props.modelValue])
const availableAuthors = computed(() => props.authors)

const isAllSelected = computed(() => 
  selectedAuthors.value.length === availableAuthors.value.length
)

// 监听选择变化
watch(selectedAuthors, (newVal) => {
  emit('update:modelValue', newVal)
}, { deep: true })

// 监听外部变化
watch(() => props.modelValue, (newVal) => {
  selectedAuthors.value = [...newVal]
})

function toggleAuthor(authorId) {
  const index = selectedAuthors.value.indexOf(authorId)
  if (index > -1) {
    selectedAuthors.value.splice(index, 1)
  } else {
    if (selectedAuthors.value.length < props.maxSelection) {
      selectedAuthors.value.push(authorId)
    } else {
      ElMessage.warning(`最多只能选择 ${props.maxSelection} 位作者`)
    }
  }
}

function selectAll() {
  const maxCount = Math.min(availableAuthors.value.length, props.maxSelection)
  selectedAuthors.value = availableAuthors.value.slice(0, maxCount).map(a => a.id)
}

function clearAll() {
  selectedAuthors.value = []
}

function selectRecommended() {
  // 选择前5个作者作为推荐
  const recommendedCount = Math.min(5, props.maxSelection, availableAuthors.value.length)
  selectedAuthors.value = availableAuthors.value.slice(0, recommendedCount).map(a => a.id)
}
</script>

<style scoped>
.tavern-author-selector {
  margin: 20px 0;
}

.selector-header h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 16px;
}

.selector-desc {
  margin: 0 0 16px 0;
  color: #606266;
  font-size: 14px;
}

.author-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.control-buttons {
  display: flex;
  gap: 8px;
}

.selection-info {
  color: #606266;
  font-size: 14px;
}

.authors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.author-card {
  position: relative;
  padding: 16px;
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  gap: 12px;
}

.author-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.author-card.selected {
  border-color: #67c23a;
  background: #f0f9ff;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.15);
}

.author-avatar {
  font-size: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 50%;
  flex-shrink: 0;
}

.author-info {
  flex: 1;
}

.author-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
}

.author-specialties {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.author-style {
  font-size: 12px;
  color: #909399;
  margin-bottom: 6px;
  line-height: 1.4;
}

.author-masterworks {
  font-size: 12px;
  color: #606266;
  line-height: 1.4;
}

.selection-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: #67c23a;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.selector-footer {
  margin-top: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .authors-grid {
    grid-template-columns: 1fr;
  }
  
  .author-controls {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .control-buttons {
    justify-content: center;
  }
}
</style>