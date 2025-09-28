<template>
  <div class="invite-center">
    <div class="container">
      <!-- 页面标题 -->
      <div class="header-section">
        <h1 class="page-title">邀请中心</h1>
        <p class="page-subtitle">邀请好友，一起享受智能写作的乐趣</p>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card primary">
          <div class="stat-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ inviteStats.totalInvites || 0 }}</div>
            <div class="stat-label">已邀请好友</div>
          </div>
        </div>

        <div class="stat-card success">
          <div class="stat-icon">
            <el-icon><Trophy /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ rewardSummary.totalCount || 0 }}</div>
            <div class="stat-label">获得奖励</div>
          </div>
        </div>

        <div class="stat-card warning">
          <div class="stat-icon">
            <el-icon><Calendar /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ rewardSummary.totalDays || 0 }}</div>
            <div class="stat-label">奖励天数</div>
          </div>
        </div>

        <div class="stat-card info">
          <div class="stat-icon">
            <el-icon><Star /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ nextMilestone?.remaining || 0 }}</div>
            <div class="stat-label">距离下个里程碑</div>
          </div>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="main-content">
        <div class="left-panel">
          <!-- 我的邀请码 -->
          <el-card class="invite-code-card">
            <template #header>
              <div class="card-header">
                <h3>我的专属邀请码</h3>
                <el-tag type="success">{{ userInviteInfo.inviteCode }}</el-tag>
              </div>
            </template>
            
            <div class="invite-code-content">
              <div class="invite-url">
                <el-input
                  v-model="shareUrl"
                  readonly
                  class="url-input"
                >
                  <template #append>
                    <el-button @click="copyInviteUrl" type="primary">
                      复制链接
                    </el-button>
                  </template>
                </el-input>
              </div>

              <div class="share-actions">
                <el-button-group>
                  <el-button @click="shareToWechat" icon="ChatDotRound">
                    微信分享
                  </el-button>
                  <el-button @click="shareToQQ" icon="ChatRound">
                    QQ分享
                  </el-button>
                  <el-button @click="shareToWeibo" icon="Share">
                    微博分享
                  </el-button>
                </el-button-group>
              </div>

              <div class="qr-code-section">
                <div class="qr-code">
                  <img v-if="qrCodeUrl" :src="qrCodeUrl" alt="邀请二维码">
                </div>
                <p class="qr-tip">扫码快速注册</p>
              </div>
            </div>
          </el-card>

          <!-- 奖励规则 -->
          <el-card class="reward-rules-card">
            <template #header>
              <h3>奖励规则</h3>
            </template>
            
            <div class="reward-rules">
              <div class="rule-item">
                <el-icon class="rule-icon success"><CircleCheck /></el-icon>
                <div class="rule-content">
                  <h4>邀请成功奖励</h4>
                  <p>邀请好友注册成功，您可获得 <strong>7天</strong> 会员奖励</p>
                  <p>被邀请好友可获得 <strong>3天</strong> 会员奖励</p>
                </div>
              </div>

              <div class="rule-item">
                <el-icon class="rule-icon primary"><Crown /></el-icon>
                <div class="rule-content">
                  <h4>订阅奖励</h4>
                  <p>被邀请好友订阅付费套餐，您可额外获得 <strong>15天</strong> 会员奖励</p>
                </div>
              </div>

              <div class="rule-item">
                <el-icon class="rule-icon warning"><Trophy /></el-icon>
                <div class="rule-content">
                  <h4>里程碑奖励</h4>
                  <ul class="milestone-list">
                    <li>邀请 5 人：获得 30天 会员</li>
                    <li>邀请 10 人：获得 60天 会员</li>
                    <li>邀请 20 人：获得 90天 会员</li>
                    <li>邀请 50 人：获得 180天 会员</li>
                  </ul>
                </div>
              </div>
            </div>
          </el-card>
        </div>

        <div class="right-panel">
          <!-- 里程碑进度 -->
          <el-card class="milestone-card" v-if="nextMilestone">
            <template #header>
              <h3>里程碑进度</h3>
            </template>
            
            <div class="milestone-progress">
              <div class="progress-info">
                <span class="current">{{ inviteStats.totalInvites }}</span>
                <span class="total">/ {{ nextMilestone.inviteCount }}</span>
              </div>
              
              <el-progress
                :percentage="milestoneProgress"
                :stroke-width="12"
                :color="progressColor"
                class="progress-bar"
              />
              
              <div class="progress-text">
                <span>还需邀请 {{ nextMilestone.remaining }} 人</span>
                <span v-if="nextMilestone.rewards" class="reward-preview">
                  奖励：{{ nextMilestone.rewards[0].description }}
                </span>
              </div>
            </div>
          </el-card>

          <!-- 我的奖励 -->
          <el-card class="rewards-card">
            <template #header>
              <div class="card-header">
                <h3>我的奖励</h3>
                <el-tag v-if="pendingRewards > 0" type="warning">
                  {{ pendingRewards }}个待领取
                </el-tag>
              </div>
            </template>
            
            <div class="rewards-list" v-loading="rewardsLoading">
              <div v-if="rewards.length === 0" class="empty-rewards">
                <el-empty description="暂无奖励记录">
                  <el-button type="primary" @click="inviteFriends">
                    立即邀请好友
                  </el-button>
                </el-empty>
              </div>
              
              <div
                v-for="reward in rewards.slice(0, 5)"
                :key="reward.id"
                class="reward-item"
                :class="{ 'pending': reward.status === 'PENDING' }"
              >
                <div class="reward-icon">
                  <el-icon v-if="reward.status === 'GRANTED'" class="success">
                    <CircleCheck />
                  </el-icon>
                  <el-icon v-else class="warning">
                    <Clock />
                  </el-icon>
                </div>
                
                <div class="reward-info">
                  <div class="reward-desc">{{ reward.description }}</div>
                  <div class="reward-meta">
                    <span class="reward-amount">+{{ reward.amount }}天</span>
                    <span class="reward-time">
                      {{ formatDate(reward.createdAt) }}
                    </span>
                  </div>
                </div>
                
                <div class="reward-action">
                  <el-button
                    v-if="reward.status === 'PENDING'"
                    type="primary"
                    size="small"
                    @click="claimReward(reward.id)"
                  >
                    立即领取
                  </el-button>
                  <el-tag
                    v-else
                    type="success"
                    size="small"
                  >
                    已领取
                  </el-tag>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 邀请的好友 -->
          <el-card class="invitees-card">
            <template #header>
              <h3>我邀请的好友</h3>
            </template>
            
            <div class="invitees-list" v-loading="inviteesLoading">
              <div v-if="invitees.length === 0" class="empty-invitees">
                <p>还没有邀请好友</p>
              </div>
              
              <div
                v-for="invitee in invitees.slice(0, 5)"
                :key="invitee.id"
                class="invitee-item"
              >
                <div class="invitee-avatar">
                  <el-avatar :size="32">
                    {{ invitee.nickname?.[0] || invitee.email[0] }}
                  </el-avatar>
                </div>
                
                <div class="invitee-info">
                  <div class="invitee-name">
                    {{ invitee.nickname || invitee.email }}
                  </div>
                  <div class="invitee-time">
                    {{ formatDate(invitee.createdAt) }} 加入
                  </div>
                </div>
                
                <div class="invitee-status">
                  <el-tag :type="getStatusType(invitee.status)">
                    {{ formatStatus(invitee.status) }}
                  </el-tag>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 分享文案选择对话框 -->
      <el-dialog
        v-model="shareDialogVisible"
        title="选择分享文案"
        width="600px"
      >
        <div class="share-texts">
          <div
            v-for="(text, index) in shareTexts"
            :key="index"
            class="share-text-item"
            @click="selectShareText(index)"
            :class="{ 'selected': selectedTextIndex === index }"
          >
            <div class="text-content">{{ text }}</div>
            <div class="text-actions">
              <el-button size="small" @click="copyText(text)">
                复制
              </el-button>
            </div>
          </div>
        </div>
        
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="shareDialogVisible = false">取消</el-button>
            <el-button
              type="primary"
              @click="confirmShare"
              :disabled="selectedTextIndex === -1"
            >
              确定分享
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  User,
  Trophy,
  Calendar,
  Star,
  CircleCheck,
  Crown,
  Clock,
  Share,
  ChatDotRound,
  ChatRound
} from '@element-plus/icons-vue'
import { inviteService } from '@/services/inviteService'

export default {
  name: 'InviteCenter',
  components: {
    User,
    Trophy,
    Calendar,
    Star,
    CircleCheck,
    Crown,
    Clock,
    Share,
    ChatDotRound,
    ChatRound
  },
  setup() {
    const inviteStats = ref({})
    const rewards = ref([])
    const invitees = ref([])
    const userInviteInfo = ref({})
    const rewardSummary = ref({})
    const expectedRewards = ref({})
    const shareMaterials = ref({})
    
    const rewardsLoading = ref(false)
    const inviteesLoading = ref(false)
    const shareDialogVisible = ref(false)
    const selectedTextIndex = ref(-1)

    // 计算属性
    const shareUrl = computed(() => shareMaterials.value.shareUrl || '')
    const qrCodeUrl = computed(() => shareMaterials.value.qrCodeUrl || '')
    const shareTexts = computed(() => shareMaterials.value.shareTexts || [])
    const nextMilestone = computed(() => expectedRewards.value.nextMilestone)
    const pendingRewards = computed(() => 
      rewards.value.filter(r => r.status === 'PENDING').length
    )

    const milestoneProgress = computed(() => {
      if (!nextMilestone.value) return 100
      const current = inviteStats.value.totalInvites || 0
      const target = nextMilestone.value.inviteCount
      return Math.min(Math.round((current / target) * 100), 100)
    })

    const progressColor = computed(() => {
      const progress = milestoneProgress.value
      if (progress < 30) return '#f56c6c'
      if (progress < 70) return '#e6a23c'
      return '#67c23a'
    })

    // 加载数据
    const loadInviteStats = async () => {
      try {
        const response = await inviteService.getInviteStats()
        if (response.success) {
          inviteStats.value = response.data
        }
      } catch (error) {
        console.error('加载邀请统计失败:', error)
      }
    }

    const loadRewards = async () => {
      try {
        rewardsLoading.value = true
        const response = await inviteService.getInviteRewards()
        if (response.success) {
          rewards.value = response.data.rewards
          rewardSummary.value = {
            ...response.data.summary,
            totalDays: response.data.rewards
              .filter(r => r.status === 'GRANTED')
              .reduce((sum, r) => sum + Number(r.amount), 0)
          }
        }
      } catch (error) {
        console.error('加载奖励记录失败:', error)
      } finally {
        rewardsLoading.value = false
      }
    }

    const loadInvitees = async () => {
      try {
        inviteesLoading.value = true
        const response = await inviteService.getInvitees()
        if (response.success) {
          invitees.value = response.data.invitees
        }
      } catch (error) {
        console.error('加载邀请好友列表失败:', error)
      } finally {
        inviteesLoading.value = false
      }
    }

    const loadExpectedRewards = async () => {
      try {
        const response = await inviteService.getExpectedRewards()
        if (response.success) {
          expectedRewards.value = response.data
        }
      } catch (error) {
        console.error('加载预期奖励失败:', error)
      }
    }

    const loadShareMaterials = async () => {
      try {
        const response = await inviteService.getShareMaterials()
        if (response.success) {
          shareMaterials.value = response.data
          userInviteInfo.value = {
            inviteCode: response.data.inviteCode
          }
        }
      } catch (error) {
        console.error('加载分享素材失败:', error)
      }
    }

    // 复制邀请链接
    const copyInviteUrl = async () => {
      try {
        await navigator.clipboard.writeText(shareUrl.value)
        ElMessage.success('邀请链接已复制到剪贴板')
      } catch (error) {
        ElMessage.error('复制失败，请手动复制')
      }
    }

    // 复制文本
    const copyText = async (text) => {
      try {
        await navigator.clipboard.writeText(text)
        ElMessage.success('文案已复制')
      } catch (error) {
        ElMessage.error('复制失败')
      }
    }

    // 分享到各平台
    const shareToWechat = () => {
      shareDialogVisible.value = true
    }

    const shareToQQ = () => {
      const url = shareMaterials.value.socialShares?.qq
      if (url) {
        window.open(url, '_blank')
      } else {
        shareDialogVisible.value = true
      }
    }

    const shareToWeibo = () => {
      const url = shareMaterials.value.socialShares?.weibo
      if (url) {
        window.open(url, '_blank')
      } else {
        shareDialogVisible.value = true
      }
    }

    const selectShareText = (index) => {
      selectedTextIndex.value = index
    }

    const confirmShare = () => {
      const selectedText = shareTexts.value[selectedTextIndex.value]
      copyText(selectedText)
      shareDialogVisible.value = false
      selectedTextIndex.value = -1
    }

    // 领取奖励
    const claimReward = async (rewardId) => {
      try {
        const response = await inviteService.claimReward(rewardId)
        if (response.success) {
          ElMessage.success('奖励领取成功')
          await loadRewards()
        }
      } catch (error) {
        console.error('领取奖励失败:', error)
        ElMessage.error('领取失败，请重试')
      }
    }

    const inviteFriends = () => {
      copyInviteUrl()
    }

    // 工具函数
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('zh-CN')
    }

    const formatStatus = (status) => {
      const statusMap = {
        'ACTIVE': '活跃',
        'INACTIVE': '未激活',
        'BANNED': '已禁用'
      }
      return statusMap[status] || '未知'
    }

    const getStatusType = (status) => {
      const typeMap = {
        'ACTIVE': 'success',
        'INACTIVE': 'warning',
        'BANNED': 'danger'
      }
      return typeMap[status] || 'info'
    }

    onMounted(() => {
      loadInviteStats()
      loadRewards()
      loadInvitees()
      loadExpectedRewards()
      loadShareMaterials()
    })

    return {
      inviteStats,
      rewards,
      invitees,
      userInviteInfo,
      rewardSummary,
      expectedRewards,
      shareMaterials,
      rewardsLoading,
      inviteesLoading,
      shareDialogVisible,
      selectedTextIndex,
      shareUrl,
      qrCodeUrl,
      shareTexts,
      nextMilestone,
      pendingRewards,
      milestoneProgress,
      progressColor,
      copyInviteUrl,
      copyText,
      shareToWechat,
      shareToQQ,
      shareToWeibo,
      selectShareText,
      confirmShare,
      claimReward,
      inviteFriends,
      formatDate,
      formatStatus,
      getStatusType
    }
  }
}
</script>

<style scoped>
.invite-center {
  padding: 2rem;
  background: #f5f7fa;
  min-height: 100vh;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

.header-section {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 1rem 0;
}

.page-subtitle {
  font-size: 1.2rem;
  color: #666;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-card.primary {
  border-left: 4px solid #409eff;
}

.stat-card.success {
  border-left: 4px solid #67c23a;
}

.stat-card.warning {
  border-left: 4px solid #e6a23c;
}

.stat-card.info {
  border-left: 4px solid #909399;
}

.stat-icon {
  font-size: 2rem;
  opacity: 0.8;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  line-height: 1;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.5rem;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
}

.left-panel,
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  color: #333;
}

.invite-code-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.url-input {
  width: 100%;
}

.share-actions {
  display: flex;
  justify-content: center;
}

.qr-code-section {
  text-align: center;
}

.qr-code img {
  width: 120px;
  height: 120px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.qr-tip {
  color: #666;
  font-size: 0.9rem;
  margin: 0.5rem 0 0 0;
}

.reward-rules {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.rule-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.rule-icon {
  font-size: 1.5rem;
  margin-top: 0.25rem;
  flex-shrink: 0;
}

.rule-icon.success {
  color: #67c23a;
}

.rule-icon.primary {
  color: #409eff;
}

.rule-icon.warning {
  color: #e6a23c;
}

.rule-content h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.rule-content p {
  margin: 0 0 0.5rem 0;
  color: #666;
  line-height: 1.5;
}

.milestone-list {
  margin: 0;
  padding-left: 1.5rem;
}

.milestone-list li {
  color: #666;
  margin-bottom: 0.5rem;
}

.milestone-progress {
  text-align: center;
}

.progress-info {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1rem;
}

.progress-info .total {
  color: #999;
}

.progress-bar {
  margin-bottom: 1rem;
}

.progress-text {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #666;
}

.reward-preview {
  color: #67c23a;
  font-weight: 500;
}

.empty-rewards,
.empty-invitees {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.rewards-list,
.invitees-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reward-item,
.invitee-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.reward-item.pending {
  border-left: 3px solid #e6a23c;
}

.reward-icon,
.invitee-avatar {
  flex-shrink: 0;
}

.reward-icon .el-icon {
  font-size: 1.5rem;
}

.reward-icon .success {
  color: #67c23a;
}

.reward-icon .warning {
  color: #e6a23c;
}

.reward-info,
.invitee-info {
  flex: 1;
}

.reward-desc,
.invitee-name {
  font-weight: 500;
  color: #333;
}

.reward-meta,
.invitee-time {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.25rem;
}

.reward-amount {
  color: #67c23a;
  font-weight: 500;
}

.share-texts {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.share-text-item {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.share-text-item:hover {
  border-color: #409eff;
}

.share-text-item.selected {
  border-color: #409eff;
  background: #ecf5ff;
}

.text-content {
  color: #333;
  line-height: 1.5;
  margin-bottom: 0.5rem;
}

.text-actions {
  text-align: right;
}

@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

@media (max-width: 768px) {
  .invite-center {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 1rem;
  }
}
</style>
