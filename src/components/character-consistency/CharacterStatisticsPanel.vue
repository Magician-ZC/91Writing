<template>
  <div class="statistics-panel">
    <el-card shadow="never" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>📊 角色出场统计</span>
          <el-button size="small" @click="loadStatistics">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
      </template>

      <div v-if="statistics" class="stats-content">
        <!-- 总体统计 -->
        <div class="summary-stats">
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="stat-box">
                <div class="stat-value">{{ statistics.totalAppearances }}</div>
                <div class="stat-label">出场章节</div>
              </div>
            </el-col>
            
            <el-col :span="6">
              <div class="stat-box">
                <div class="stat-value">{{ statistics.totalMentions }}</div>
                <div class="stat-label">提及次数</div>
              </div>
            </el-col>
            
            <el-col :span="6">
              <div class="stat-box">
                <div class="stat-value">{{ statistics.totalDialogues }}</div>
                <div class="stat-label">对话次数</div>
              </div>
            </el-col>
            
            <el-col :span="6">
              <div class="stat-box">
                <div class="stat-value">{{ Math.round(statistics.appearanceRate * 100) }}%</div>
                <div class="stat-label">出场率</div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 出场范围 -->
        <el-divider />
        
        <div class="appearance-range">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="首次出场">
              {{ statistics.firstAppearance ? `第${statistics.firstAppearance}章` : '未知' }}
            </el-descriptions-item>
            <el-descriptions-item label="最后出场">
              {{ statistics.lastAppearance ? `第${statistics.lastAppearance}章` : '未知' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 出场趋势图 -->
        <div v-if="statistics.appearanceChart && statistics.appearanceChart.length > 0" class="chart-section">
          <h4>📈 出场趋势</h4>
          <div ref="chartRef" class="chart-container"></div>
        </div>
      </div>

      <el-empty v-else description="暂无统计数据" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import characterConsistencyService from '@/services/characterConsistencyService'
import * as echarts from 'echarts'

const props = defineProps({
  characterId: {
    type: String,
    required: true
  }
})

const loading = ref(false)
const statistics = ref(null)
const chartRef = ref(null)
let chartInstance = null

// 加载统计数据
const loadStatistics = async () => {
  loading.value = true
  
  try {
    const response = await characterConsistencyService.getStatistics(props.characterId)
    statistics.value = response.data

    // 渲染图表
    await nextTick()
    renderChart()
  } catch (error) {
    ElMessage.error('加载统计失败')
  } finally {
    loading.value = false
  }
}

// 渲染图表
const renderChart = () => {
  if (!chartRef.value || !statistics.value?.appearanceChart) {
    return
  }

  if (chartInstance) {
    chartInstance.dispose()
  }

  chartInstance = echarts.init(chartRef.value)

  const option = {
    title: {
      text: '章节出场分析',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['提及次数', '对话次数', '动作次数'],
      bottom: 0
    },
    xAxis: {
      type: 'category',
      data: statistics.value.appearanceChart.map(d => `第${d.chapterNumber}章`),
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '提及次数',
        type: 'bar',
        data: statistics.value.appearanceChart.map(d => d.mentionCount),
        itemStyle: {
          color: '#409eff'
        }
      },
      {
        name: '对话次数',
        type: 'bar',
        data: statistics.value.appearanceChart.map(d => d.dialogueCount),
        itemStyle: {
          color: '#67c23a'
        }
      },
      {
        name: '动作次数',
        type: 'bar',
        data: statistics.value.appearanceChart.map(d => d.actionCount),
        itemStyle: {
          color: '#e6a23c'
        }
      }
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    }
  }

  chartInstance.setOption(option)
}

// 监听角色变化
watch(() => props.characterId, () => {
  loadStatistics()
})

// 生命周期
onMounted(() => {
  loadStatistics()
})

// 暴露方法
defineExpose({
  refresh: loadStatistics
})
</script>

<style scoped>
.statistics-panel {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-content {
  padding: 16px 0;
}

.summary-stats {
  margin-bottom: 24px;
}

.stat-box {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.appearance-range {
  margin: 20px 0;
}

.chart-section {
  margin-top: 24px;
}

.chart-section h4 {
  margin-bottom: 16px;
  color: #303133;
  font-size: 16px;
}

.chart-container {
  height: 300px;
  width: 100%;
}
</style>

