<template>
  <div class="tavern-voting-results">
    <div class="results-header">
      <h5>
        <el-icon><Trophy /></el-icon>
        投票结果
      </h5>
      <p>经过 {{ results.totalVotes }} 位作者的投票，以下是最终结果：</p>
    </div>

    <div class="results-list">
      <div 
        v-for="(proposal, index) in results.topProposals" 
        :key="proposal.index"
        class="result-item"
        :class="getRankClass(index)"
      >
        <!-- 排名标志 -->
        <div class="rank-badge">
          <div class="rank-number">{{ index + 1 }}</div>
          <div class="rank-icon">
            <el-icon v-if="index === 0"><Trophy /></el-icon>
            <el-icon v-else-if="index === 1"><Medal /></el-icon>
            <el-icon v-else><Star /></el-icon>
          </div>
        </div>

        <!-- 方案内容 -->
        <div class="proposal-content">
          <div class="proposal-header">
            <h6>{{ proposal.title }}</h6>
            <div class="score-info">
              <el-tag :type="getScoreTagType(index)" size="large">
                {{ proposal.score }} 分
              </el-tag>
            </div>
          </div>
          
          <div class="proposal-core">
            <strong>核心思路：</strong>{{ proposal.core }}
          </div>
          
          <div class="proposal-details">
            <strong>具体内容：</strong>
            <p>{{ proposal.details }}</p>
          </div>
          
          <div class="proposal-advantages">
            <strong>优势特点：</strong>{{ proposal.advantages }}
          </div>

          <!-- 投票分布 -->
          <div class="vote-distribution">
            <div class="distribution-title">投票详情：</div>
            <div class="distribution-stats">
              <el-tag type="success" size="small" v-if="proposal.votes.first > 0">
                第一名 {{ proposal.votes.first }} 人
              </el-tag>
              <el-tag type="primary" size="small" v-if="proposal.votes.second > 0">
                第二名 {{ proposal.votes.second }} 人  
              </el-tag>
              <el-tag type="info" size="small" v-if="proposal.votes.third > 0">
                第三名 {{ proposal.votes.third }} 人
              </el-tag>
            </div>
          </div>
        </div>

        <!-- 选择按钮 -->
        <div class="action-buttons">
          <el-button 
            type="primary"
            size="small"
            @click="selectProposal(proposal, index)"
            :disabled="selectedProposal?.index === proposal.index"
          >
            {{ selectedProposal?.index === proposal.index ? '已选择' : '采用此方案' }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 已选择的方案提示 -->
    <div v-if="selectedProposal" class="selected-proposal-alert">
      <el-alert
        :title="`已选择方案：${selectedProposal.title}`"
        type="success"
        :closable="false"
        show-icon
      >
        <template #default>
          <div class="selected-details">
            <p><strong>核心：</strong>{{ selectedProposal.core }}</p>
            <p><strong>得分：</strong>{{ selectedProposal.score }} 分</p>
          </div>
        </template>
      </el-alert>
    </div>

    <!-- 统计信息 -->
    <div class="statistics-section">
      <el-card class="statistics-card" shadow="never">
        <template #header>
          <div class="statistics-header">
            <el-icon><DataBoard /></el-icon>
            <span>讨论统计</span>
          </div>
        </template>
        
        <div class="statistics-grid">
          <div class="stat-item">
            <div class="stat-value">{{ results.totalVotes }}</div>
            <div class="stat-label">参与投票</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ results.topProposals.length }}</div>
            <div class="stat-label">候选方案</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ results.topProposals[0]?.score || 0 }}</div>
            <div class="stat-label">最高得分</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ getDiscussionDuration() }}</div>
            <div class="stat-label">讨论耗时</div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  Trophy, 
  Medal, 
  Star, 
  DataBoard 
} from '@element-plus/icons-vue'

const props = defineProps({
  results: {
    type: Object,
    required: true
  },
  topic: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['select-proposal'])

const selectedProposal = ref(null)

function getRankClass(index) {
  const classes = ['first-place', 'second-place', 'third-place']
  return classes[index] || 'other-place'
}

function getScoreTagType(index) {
  const types = ['success', 'primary', 'info']
  return types[index] || 'info'
}

function selectProposal(proposal, index) {
  selectedProposal.value = { ...proposal, rank: index + 1 }
  emit('select-proposal', selectedProposal.value)
}

function getDiscussionDuration() {
  // 这里可以根据实际的讨论时间来计算
  // 目前返回一个示例值
  return '2分30秒'
}

// 计算总投票数
const totalVotes = computed(() => {
  return props.results.topProposals.reduce((sum, proposal) => {
    return sum + (proposal.votes.first + proposal.votes.second + proposal.votes.third)
  }, 0)
})
</script>

<style scoped>
.tavern-voting-results {
  margin-top: 20px;
}

.results-header h5 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 18px;
}

.results-header p {
  margin: 0 0 16px 0;
  color: #606266;
  font-size: 14px;
}

.results-list {
  margin-bottom: 20px;
}

.result-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
  padding: 20px;
  border-radius: 12px;
  border: 2px solid transparent;
  background: #fff;
  transition: all 0.3s ease;
}

.result-item.first-place {
  background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
  border-color: #ffb300;
  box-shadow: 0 4px 12px rgba(255, 179, 0, 0.15);
}

.result-item.second-place {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
  border-color: #ab47bc;
  box-shadow: 0 4px 12px rgba(171, 71, 188, 0.1);
}

.result-item.third-place {
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
  border-color: #66bb6a;
  box-shadow: 0 4px 12px rgba(102, 187, 106, 0.1);
}

.rank-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.rank-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
}

.first-place .rank-number {
  background: #ffb300;
}

.second-place .rank-number {
  background: #ab47bc;
}

.third-place .rank-number {
  background: #66bb6a;
}

.rank-icon {
  font-size: 20px;
  opacity: 0.7;
}

.first-place .rank-icon {
  color: #ffb300;
}

.second-place .rank-icon {
  color: #ab47bc;
}

.third-place .rank-icon {
  color: #66bb6a;
}

.proposal-content {
  flex: 1;
}

.proposal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.proposal-header h6 {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.proposal-core {
  margin-bottom: 10px;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.proposal-details {
  margin-bottom: 10px;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.proposal-details p {
  margin: 4px 0 0 0;
  padding-left: 12px;
  border-left: 3px solid #e4e7ed;
}

.proposal-advantages {
  margin-bottom: 12px;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.vote-distribution {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.distribution-title {
  font-size: 12px;
  color: #909399;
  margin-bottom: 6px;
}

.distribution-stats {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.action-buttons {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  padding-top: 8px;
}

.selected-proposal-alert {
  margin: 20px 0;
}

.selected-details p {
  margin: 4px 0;
  font-size: 14px;
}

.statistics-section {
  margin-top: 24px;
}

.statistics-card {
  border: 1px solid #ebeef5;
}

.statistics-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  text-align: center;
}

.stat-item {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #409eff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .result-item {
    flex-direction: column;
    gap: 12px;
  }
  
  .rank-badge {
    flex-direction: row;
    justify-content: center;
  }
  
  .proposal-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .statistics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>