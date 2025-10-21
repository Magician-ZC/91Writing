<template>
  <div class="feature-list">
    <el-empty v-if="features.length === 0" :description="`暂无${getFeatureTypeLabel(featureType)}特征`">
      <el-button size="small" type="primary" @click="$parent.showExtractDialog">
        提取特征
      </el-button>
    </el-empty>

    <div v-else class="features-container">
      <div
        v-for="feature in features"
        :key="feature.id"
        class="feature-item"
        :class="{ 'confirmed': feature.isConfirmed }"
      >
        <div class="feature-header">
          <div class="feature-info">
            <el-tag :type="feature.isConfirmed ? 'success' : 'warning'" size="small">
              {{ feature.isConfirmed ? '已确认' : '待确认' }}
            </el-tag>
            <span class="feature-name">{{ feature.featureName }}</span>
          </div>
          
          <div class="feature-actions">
            <el-button
              v-if="!feature.isConfirmed"
              size="small"
              type="success"
              text
              @click="$emit('confirm', feature.id)"
            >
              确认
            </el-button>
            <el-button
              size="small"
              type="danger"
              text
              @click="handleDelete(feature)"
            >
              删除
            </el-button>
          </div>
        </div>

        <div class="feature-content">
          <div class="feature-value">{{ feature.featureValue }}</div>
          
          <div class="feature-meta">
            <el-space :size="8" wrap>
              <el-tag size="small" type="info">
                <el-icon><Location /></el-icon>
                来源: 第{{ feature.sourceChapter?.chapterNumber || '?' }}章
              </el-tag>
              
              <el-tag size="small" type="info">
                <el-icon><TrendCharts /></el-icon>
                置信度: {{ Math.round(feature.confidence * 100) }}%
              </el-tag>
              
              <el-tag size="small" type="info">
                <el-icon><Clock /></el-icon>
                {{ formatDate(feature.firstMentioned) }}
              </el-tag>
            </el-space>
          </div>

          <div v-if="feature.locationInText" class="feature-location">
            <el-text size="small" type="info">
              文本位置: "{{ feature.locationInText }}"
            </el-text>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ElMessageBox, ElMessage } from 'element-plus'
import { Location, TrendCharts, Clock } from '@element-plus/icons-vue'

const props = defineProps({
  features: {
    type: Array,
    default: () => []
  },
  featureType: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['confirm', 'delete'])

const handleDelete = async (feature) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除特征"${feature.featureName}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    emit('delete', feature.id)
  } catch {
    // 用户取消
  }
}

const getFeatureTypeLabel = (type) => {
  const labels = {
    appearance: '外貌',
    personality: '性格',
    behavior: '行为',
    speech: '说话'
  }
  return labels[type] || type
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.feature-list {
  padding: 16px 0;
  min-height: 300px;
}

.features-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.feature-item {
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s;
  background: white;
}

.feature-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
}

.feature-item.confirmed {
  border-color: #67c23a;
  background: #f0f9ff;
}

.feature-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.feature-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.feature-name {
  font-weight: 600;
  font-size: 15px;
  color: #303133;
}

.feature-content {
  margin-top: 12px;
}

.feature-value {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
}

.feature-meta {
  margin-top: 12px;
}

.feature-location {
  margin-top: 8px;
  padding: 8px;
  background: #fff8dc;
  border-radius: 4px;
  border-left: 3px solid #e6a23c;
}
</style>

