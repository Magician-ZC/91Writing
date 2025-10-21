<template>
  <div class="package-management-complete">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="header-title">
            <el-icon><Box /></el-icon>
            套餐管理 - 完整功能配置
          </span>
          <el-button type="primary" :icon="Plus" @click="showCreateDialog">
            新增套餐
          </el-button>
        </div>
      </template>

      <!-- 套餐列表 -->
      <el-table :data="packages" v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="套餐名称" width="150" />
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">
            <el-text type="primary" style="font-weight: 600">¥{{ row.price }}</el-text>
          </template>
        </el-table-column>
        
        <!-- 功能概览 -->
        <el-table-column label="功能启用状态" min-width="400">
          <template #default="{ row }">
            <div class="features-overview">
              <el-tag v-if="getFeat(row, 'videoGeneration', 'enabled')" type="success" size="small">
                📹 视频{{ getFeat(row, 'videoGeneration', 'dailyQuota') }}/天
              </el-tag>
              <el-tag v-else type="info" size="small">📹 视频-</el-tag>
              
              <el-tag v-if="getFeat(row, 'aiWriting', 'enabled')" type="success" size="small">
                ✍️ 写作{{ formatQuota(getFeat(row, 'aiWriting', 'dailyQuota')) }}
              </el-tag>
              
              <el-tag v-if="getFeat(row, 'aiAssistant', 'enabled')" type="success" size="small">
                🤖 助手{{ formatQuota(getFeat(row, 'aiAssistant', 'dailyQuota')) }}
              </el-tag>
              
              <el-tag v-if="getFeat(row, 'materialGeneration', 'enabled')" type="success" size="small">
                📦 素材{{ formatQuota(getFeat(row, 'materialGeneration', 'dailyQuota')) }}
              </el-tag>
              
              <el-tag type="info" size="small">
                💾 {{ getFeat(row, 'storage', 'quotaGB') || 10 }}GB
              </el-tag>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'">
              {{ row.status === 'ACTIVE' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="editPackage(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="deletePackage(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建/编辑套餐对话框 -->
    <el-dialog
      v-model="showDialog"
      :title="editingPackage ? '编辑套餐' : '新增套餐'"
      width="1000px"
      @close="resetForm"
      :close-on-click-modal="false"
    >
      <el-scrollbar max-height="70vh">
        <el-form :model="packageForm" label-width="140px">
          <!-- 基础信息 -->
          <el-divider content-position="left">
            <el-icon><InfoFilled /></el-icon>
            基础信息
          </el-divider>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="套餐名称" required>
                <el-input v-model="packageForm.name" placeholder="例如：专业版" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="价格（元/月）" required>
                <el-input-number v-model="packageForm.price" :min="0" :precision="2" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="套餐描述">
            <el-input v-model="packageForm.description" type="textarea" :rows="2" 
              placeholder="介绍套餐的核心价值和适用人群" />
          </el-form-item>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="有效期（天）" required>
                <el-input-number v-model="packageForm.durationDays" :min="1" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="排序权重">
                <el-input-number v-model="packageForm.sortOrder" :min="0" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="套餐状态">
            <el-radio-group v-model="packageForm.status">
              <el-radio label="ACTIVE">启用</el-radio>
              <el-radio label="INACTIVE">禁用</el-radio>
            </el-radio-group>
          </el-form-item>

          <!-- 功能配置 Tabs -->
          <el-divider content-position="left">
            <el-icon><Setting /></el-icon>
            功能权限配置
          </el-divider>

          <el-tabs type="border-card" class="features-tabs">
            <!-- Tab 1: 视频生成权限 -->
            <el-tab-pane>
              <template #label>
                <span class="tab-label">
                  <el-icon><VideoCamera /></el-icon>
                  视频生成
                </span>
              </template>

              <el-form label-width="160px">
                <el-form-item label="启用视频生成">
                  <el-switch v-model="features.videoGeneration.enabled" />
                  <div class="form-tip" v-if="!features.videoGeneration.enabled">
                    关闭后，该套餐用户无法使用视频生成功能
                  </div>
                </el-form-item>

                <div v-if="features.videoGeneration.enabled" class="feature-config">
                  <el-form-item label="每日配额">
                    <el-input-number v-model="features.videoGeneration.dailyQuota" :min="0" :max="100" />
                    <span class="unit">个视频/天</span>
                    <div class="form-tip">0表示不限制，-1表示禁用</div>
                  </el-form-item>

                  <el-form-item label="每月配额">
                    <el-input-number v-model="features.videoGeneration.monthlyQuota" :min="0" :max="1000" />
                    <span class="unit">个视频/月</span>
                  </el-form-item>

                  <el-form-item label="最大分镜数">
                    <el-slider v-model="features.videoGeneration.maxSceneCount" :min="3" :max="10" 
                      :marks="{3:'3',5:'5',8:'8',10:'10'}" show-stops />
                  </el-form-item>

                  <el-form-item label="最大视频时长">
                    <el-input-number v-model="features.videoGeneration.maxVideoDuration" :min="15" :max="120" />
                    <span class="unit">秒</span>
                  </el-form-item>

                  <el-form-item label="允许的图片质量">
                    <el-checkbox-group v-model="features.videoGeneration.allowedQualities">
                      <el-checkbox label="standard">标准质量（基础）</el-checkbox>
                      <el-checkbox label="high">高质量（专业）</el-checkbox>
                      <el-checkbox label="ultra">超高质量（企业）</el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>

                  <el-form-item label="允许的分辨率">
                    <el-checkbox-group v-model="features.videoGeneration.allowedResolutions">
                      <el-checkbox label="1024x576">1024x576 (标准16:9)</el-checkbox>
                      <el-checkbox label="1280x720">1280x720 (HD)</el-checkbox>
                      <el-checkbox label="1920x1080">1920x1080 (Full HD)</el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>

                  <el-form-item label="高级参数配置">
                    <el-switch v-model="features.videoGeneration.enableAdvancedParams" 
                      active-text="允许" inactive-text="不允许" />
                    <div class="form-tip">
                      高级参数：采样步数、CFG Scale、自定义负向提示词等
                    </div>
                  </el-form-item>

                  <el-form-item label="自定义提示词">
                    <el-switch v-model="features.videoGeneration.enableCustomPrompts" 
                      active-text="允许" inactive-text="不允许" />
                    <div class="form-tip">
                      仅企业版建议开启，允许用户完全自定义AI提示词
                    </div>
                  </el-form-item>

                  <el-form-item label="队列优先级">
                    <el-select v-model="features.videoGeneration.priority" style="width: 200px">
                      <el-option label="低优先级" value="low" />
                      <el-option label="普通优先级" value="normal" />
                      <el-option label="高优先级" value="high" />
                    </el-select>
                  </el-form-item>
                </div>
              </el-form>
            </el-tab-pane>

            <!-- Tab 2: AI写作权限 -->
            <el-tab-pane>
              <template #label>
                <span class="tab-label">
                  <el-icon><EditPen /></el-icon>
                  AI写作
                </span>
              </template>

              <el-form label-width="160px">
                <el-form-item label="启用AI写作">
                  <el-switch v-model="features.aiWriting.enabled" />
                </el-form-item>

                <div v-if="features.aiWriting.enabled" class="feature-config">
                  <el-form-item label="每日配额">
                    <el-input-number v-model="features.aiWriting.dailyQuota" :min="-1" :max="10000" />
                    <span class="unit">次/天</span>
                    <div class="form-tip">-1表示不限制</div>
                  </el-form-item>

                  <el-form-item label="每月配额">
                    <el-input-number v-model="features.aiWriting.monthlyQuota" :min="-1" :max="100000" />
                    <span class="unit">次/月</span>
                  </el-form-item>

                  <el-form-item label="单次最大字数">
                    <el-input-number v-model="features.aiWriting.maxWordsPerRequest" :min="500" :max="5000" :step="500" />
                    <span class="unit">字</span>
                  </el-form-item>

                  <el-form-item label="可用AI模型">
                    <el-checkbox-group v-model="features.aiWriting.models">
                      <el-checkbox label="gpt-3.5">GPT-3.5（基础）</el-checkbox>
                      <el-checkbox label="gpt-4">GPT-4（高级）</el-checkbox>
                      <el-checkbox label="claude-3">Claude-3（高级）</el-checkbox>
                      <el-checkbox label="deepseek">DeepSeek（专业）</el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>
                </div>
              </el-form>
            </el-tab-pane>

            <!-- Tab 3: AI助手权限 -->
            <el-tab-pane>
              <template #label>
                <span class="tab-label">
                  <el-icon><ChatDotRound /></el-icon>
                  AI助手
                </span>
              </template>

              <el-form label-width="160px">
                <el-form-item label="启用AI助手">
                  <el-switch v-model="features.aiAssistant.enabled" />
                </el-form-item>

                <div v-if="features.aiAssistant.enabled" class="feature-config">
                  <el-form-item label="每日对话次数">
                    <el-input-number v-model="features.aiAssistant.dailyQuota" :min="-1" :max="10000" />
                    <span class="unit">次/天</span>
                    <div class="form-tip">-1表示不限制</div>
                  </el-form-item>

                  <el-form-item label="每月对话次数">
                    <el-input-number v-model="features.aiAssistant.monthlyQuota" :min="-1" :max="100000" />
                    <span class="unit">次/月</span>
                  </el-form-item>

                  <el-form-item label="同时会话数">
                    <el-input-number v-model="features.aiAssistant.maxConcurrentSessions" :min="1" :max="10" />
                    <span class="unit">个</span>
                  </el-form-item>

                  <el-form-item label="会话历史保留">
                    <el-input-number v-model="features.aiAssistant.historyRetentionDays" :min="7" :max="365" />
                    <span class="unit">天</span>
                  </el-form-item>
                </div>
              </el-form>
            </el-tab-pane>

            <!-- Tab 4: 素材生成权限 -->
            <el-tab-pane>
              <template #label>
                <span class="tab-label">
                  <el-icon><Collection /></el-icon>
                  素材生成
                </span>
              </template>

              <el-form label-width="160px">
                <el-form-item label="启用素材生成">
                  <el-switch v-model="features.materialGeneration.enabled" />
                </el-form-item>

                <div v-if="features.materialGeneration.enabled" class="feature-config">
                  <el-form-item label="每日配额">
                    <el-input-number v-model="features.materialGeneration.dailyQuota" :min="-1" :max="1000" />
                    <span class="unit">次/天</span>
                  </el-form-item>

                  <el-form-item label="每月配额">
                    <el-input-number v-model="features.materialGeneration.monthlyQuota" :min="-1" :max="10000" />
                    <span class="unit">次/月</span>
                  </el-form-item>

                  <el-form-item label="允许生成类型">
                    <el-checkbox-group v-model="features.materialGeneration.allowedTypes">
                      <el-checkbox label="character">角色设定</el-checkbox>
                      <el-checkbox label="scene">场景描述</el-checkbox>
                      <el-checkbox label="plot">情节大纲</el-checkbox>
                      <el-checkbox label="dialogue">对话生成</el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>
                </div>
              </el-form>
            </el-tab-pane>

            <!-- Tab 5: 存储空间 -->
            <el-tab-pane>
              <template #label>
                <span class="tab-label">
                  <el-icon><FolderOpened /></el-icon>
                  存储空间
                </span>
              </template>

              <el-form label-width="160px">
                <el-form-item label="存储配额">
                  <el-input-number v-model="features.storage.quotaGB" :min="1" :max="1000" />
                  <span class="unit">GB</span>
                  <div class="form-tip">用户可上传的素材总大小</div>
                </el-form-item>

                <el-form-item label="单文件大小限制">
                  <el-input-number v-model="features.storage.maxFileSizeMB" :min="1" :max="500" />
                  <span class="unit">MB</span>
                </el-form-item>

                <el-form-item label="允许的文件类型">
                  <el-checkbox-group v-model="features.storage.allowedFileTypes">
                    <el-checkbox label="image">图片</el-checkbox>
                    <el-checkbox label="document">文档</el-checkbox>
                    <el-checkbox label="audio">音频</el-checkbox>
                    <el-checkbox label="video">视频</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <!-- Tab 6: 协作功能 -->
            <el-tab-pane>
              <template #label>
                <span class="tab-label">
                  <el-icon><UserFilled /></el-icon>
                  协作功能
                </span>
              </template>

              <el-form label-width="160px">
                <el-form-item label="启用协作">
                  <el-switch v-model="features.collaboration.enabled" />
                </el-form-item>

                <div v-if="features.collaboration.enabled" class="feature-config">
                  <el-form-item label="最大协作者数">
                    <el-input-number v-model="features.collaboration.maxCollaborators" :min="0" :max="50" />
                    <span class="unit">人</span>
                    <div class="form-tip">可以邀请多少人协作编辑</div>
                  </el-form-item>

                  <el-form-item label="允许的角色">
                    <el-checkbox-group v-model="features.collaboration.allowedRoles">
                      <el-checkbox label="EDITOR">编辑者（可编辑）</el-checkbox>
                      <el-checkbox label="COMMENTER">评论者（可评论）</el-checkbox>
                      <el-checkbox label="VIEWER">查看者（只读）</el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>
                </div>
              </el-form>
            </el-tab-pane>

            <!-- Tab 7: 其他功能 -->
            <el-tab-pane>
              <template #label>
                <span class="tab-label">
                  <el-icon><MoreFilled /></el-icon>
                  其他功能
                </span>
              </template>

              <el-form label-width="160px">
                <el-form-item label="数据导出">
                  <el-switch v-model="features.other.enableExport" 
                    active-text="允许" inactive-text="不允许" />
                </el-form-item>

                <el-form-item label="数据备份">
                  <el-switch v-model="features.other.enableBackup" 
                    active-text="允许" inactive-text="不允许" />
                </el-form-item>

                <el-form-item label="API访问">
                  <el-switch v-model="features.other.enableAPI" 
                    active-text="允许" inactive-text="不允许" />
                </el-form-item>

                <el-form-item label="优先支持">
                  <el-switch v-model="features.other.prioritySupport" 
                    active-text="VIP支持" inactive-text="普通支持" />
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>

          <!-- 快速配置模板 -->
          <el-divider content-position="left">
            <el-icon><MagicStick /></el-icon>
            快速配置
          </el-divider>

          <el-form-item label="使用模板">
            <el-select v-model="selectedTemplate" placeholder="选择模板快速配置" @change="applyTemplate" style="width: 300px">
              <el-option label="免费套餐模板" value="free" />
              <el-option label="基础套餐模板（¥50）" value="basic" />
              <el-option label="专业套餐模板（¥200）" value="professional" />
              <el-option label="企业套餐模板（¥500）" value="enterprise" />
              <el-option label="自定义（清空）" value="custom" />
            </el-select>
            <div class="form-tip">选择模板后可以在此基础上微调</div>
          </el-form-item>
        </el-form>
      </el-scrollbar>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showDialog = false">取消</el-button>
          <el-button type="primary" @click="savePackage" :loading="saving">
            {{ editingPackage ? '保存' : '创建' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, Box, VideoCamera, Edit as EditPen, ChatDotRound, Collection, 
  FolderOpened, User as UserFilled, MoreFilled, Edit, Delete, InfoFilled,
  Setting, MagicStick
} from '@element-plus/icons-vue'
import { adminService } from '@/services/adminService'

const loading = ref(false)
const saving = ref(false)
const packages = ref([])
const showDialog = ref(false)
const editingPackage = ref(null)
const selectedTemplate = ref('')

// 套餐基础信息
const packageForm = reactive({
  name: '',
  description: '',
  price: 0,
  durationDays: 30,
  sortOrder: 0,
  status: 'ACTIVE'
})

// 功能配置（完整结构）
const features = reactive({
  videoGeneration: {
    enabled: false,
    dailyQuota: 5,
    monthlyQuota: 50,
    maxSceneCount: 5,
    maxVideoDuration: 30,
    allowedQualities: ['standard'],
    allowedResolutions: ['1024x576'],
    enableAdvancedParams: false,
    enableCustomPrompts: false,
    priority: 'normal'
  },
  aiWriting: {
    enabled: true,
    dailyQuota: 100,
    monthlyQuota: 1000,
    maxWordsPerRequest: 2000,
    models: ['gpt-3.5']
  },
  aiAssistant: {
    enabled: true,
    dailyQuota: 50,
    monthlyQuota: 500,
    maxConcurrentSessions: 3,
    historyRetentionDays: 30
  },
  materialGeneration: {
    enabled: true,
    dailyQuota: 10,
    monthlyQuota: 100,
    allowedTypes: ['character', 'scene', 'plot']
  },
  storage: {
    quotaGB: 10,
    maxFileSizeMB: 50,
    allowedFileTypes: ['image', 'document']
  },
  collaboration: {
    enabled: false,
    maxCollaborators: 0,
    allowedRoles: []
  },
  other: {
    enableExport: true,
    enableBackup: false,
    enableAPI: false,
    prioritySupport: false
  }
})

// 套餐模板
const templates = {
  free: {
    name: '免费套餐',
    price: 0,
    features: {
      videoGeneration: { enabled: false, dailyQuota: 0, monthlyQuota: 0 },
      aiWriting: { enabled: true, dailyQuota: 100, monthlyQuota: 1000, maxWordsPerRequest: 1000, models: ['gpt-3.5'] },
      aiAssistant: { enabled: true, dailyQuota: 50, monthlyQuota: 500, maxConcurrentSessions: 2, historyRetentionDays: 7 },
      materialGeneration: { enabled: true, dailyQuota: 10, monthlyQuota: 100, allowedTypes: ['character'] },
      storage: { quotaGB: 5, maxFileSizeMB: 10, allowedFileTypes: ['image'] },
      collaboration: { enabled: false, maxCollaborators: 0, allowedRoles: [] },
      other: { enableExport: false, enableBackup: false, enableAPI: false, prioritySupport: false }
    }
  },
  basic: {
    name: '基础套餐',
    price: 50,
    features: {
      videoGeneration: { enabled: true, dailyQuota: 2, monthlyQuota: 10, maxSceneCount: 5, maxVideoDuration: 30, 
        allowedQualities: ['standard'], allowedResolutions: ['1024x576'], enableAdvancedParams: false, enableCustomPrompts: false, priority: 'low' },
      aiWriting: { enabled: true, dailyQuota: 500, monthlyQuota: 5000, maxWordsPerRequest: 2000, models: ['gpt-3.5', 'gpt-4'] },
      aiAssistant: { enabled: true, dailyQuota: 200, monthlyQuota: 2000, maxConcurrentSessions: 5, historyRetentionDays: 30 },
      materialGeneration: { enabled: true, dailyQuota: 50, monthlyQuota: 500, allowedTypes: ['character', 'scene', 'plot'] },
      storage: { quotaGB: 20, maxFileSizeMB: 50, allowedFileTypes: ['image', 'document'] },
      collaboration: { enabled: true, maxCollaborators: 3, allowedRoles: ['VIEWER', 'COMMENTER'] },
      other: { enableExport: true, enableBackup: false, enableAPI: false, prioritySupport: false }
    }
  },
  professional: {
    name: '专业套餐',
    price: 200,
    features: {
      videoGeneration: { enabled: true, dailyQuota: 5, monthlyQuota: 50, maxSceneCount: 8, maxVideoDuration: 60,
        allowedQualities: ['standard', 'high'], allowedResolutions: ['1024x576', '1280x720'], enableAdvancedParams: true, enableCustomPrompts: false, priority: 'normal' },
      aiWriting: { enabled: true, dailyQuota: 2000, monthlyQuota: 20000, maxWordsPerRequest: 3000, models: ['gpt-3.5', 'gpt-4', 'claude-3'] },
      aiAssistant: { enabled: true, dailyQuota: -1, monthlyQuota: -1, maxConcurrentSessions: 10, historyRetentionDays: 90 },
      materialGeneration: { enabled: true, dailyQuota: 200, monthlyQuota: 2000, allowedTypes: ['character', 'scene', 'plot', 'dialogue'] },
      storage: { quotaGB: 100, maxFileSizeMB: 100, allowedFileTypes: ['image', 'document', 'audio'] },
      collaboration: { enabled: true, maxCollaborators: 10, allowedRoles: ['VIEWER', 'COMMENTER', 'EDITOR'] },
      other: { enableExport: true, enableBackup: true, enableAPI: false, prioritySupport: true }
    }
  },
  enterprise: {
    name: '企业套餐',
    price: 500,
    features: {
      videoGeneration: { enabled: true, dailyQuota: 20, monthlyQuota: 200, maxSceneCount: 10, maxVideoDuration: 120,
        allowedQualities: ['standard', 'high', 'ultra'], allowedResolutions: ['1024x576', '1280x720', '1920x1080'], 
        enableAdvancedParams: true, enableCustomPrompts: true, priority: 'high' },
      aiWriting: { enabled: true, dailyQuota: -1, monthlyQuota: -1, maxWordsPerRequest: 5000, models: ['gpt-3.5', 'gpt-4', 'claude-3', 'deepseek'] },
      aiAssistant: { enabled: true, dailyQuota: -1, monthlyQuota: -1, maxConcurrentSessions: 20, historyRetentionDays: 365 },
      materialGeneration: { enabled: true, dailyQuota: -1, monthlyQuota: -1, allowedTypes: ['character', 'scene', 'plot', 'dialogue'] },
      storage: { quotaGB: 500, maxFileSizeMB: 500, allowedFileTypes: ['image', 'document', 'audio', 'video'] },
      collaboration: { enabled: true, maxCollaborators: 50, allowedRoles: ['VIEWER', 'COMMENTER', 'EDITOR'] },
      other: { enableExport: true, enableBackup: true, enableAPI: true, prioritySupport: true }
    }
  }
}

// 方法
const loadPackages = async () => {
  loading.value = true
  try {
    const response = await adminService.getPackages()
    packages.value = response.data || []
  } catch (error) {
    ElMessage.error(error.message || '加载套餐失败')
  } finally {
    loading.value = false
  }
}

const showCreateDialog = () => {
  editingPackage.value = null
  resetForm()
  showDialog.value = true
}

const editPackage = (pkg) => {
  editingPackage.value = pkg
  
  // 加载基础信息
  Object.assign(packageForm, {
    name: pkg.name,
    description: pkg.description || '',
    price: pkg.price,
    durationDays: pkg.durationDays,
    sortOrder: pkg.sortOrder || 0,
    status: pkg.status
  })

  // 加载features
  const pkgFeatures = typeof pkg.features === 'string' ? JSON.parse(pkg.features) : pkg.features
  
  // 深度合并features
  Object.keys(features).forEach(key => {
    if (pkgFeatures[key]) {
      Object.assign(features[key], pkgFeatures[key])
    }
  })

  showDialog.value = true
}

const applyTemplate = (templateName) => {
  if (!templateName || templateName === 'custom') {
    return
  }

  const template = templates[templateName]
  if (template) {
    // 应用模板
    packageForm.name = template.name
    packageForm.price = template.price
    
    // 深度复制features
    Object.keys(template.features).forEach(key => {
      Object.assign(features[key], template.features[key])
    })

    ElMessage.success(`已应用${template.name}模板，可以在此基础上微调`)
  }
}

const savePackage = async () => {
  if (!packageForm.name || packageForm.price === null) {
    ElMessage.warning('请填写套餐名称和价格')
    return
  }

  saving.value = true
  try {
    const data = {
      ...packageForm,
      features: JSON.parse(JSON.stringify(features))  // 深度复制
    }

    if (editingPackage.value) {
      await adminService.updatePackage(editingPackage.value.id, data)
      ElMessage.success('套餐更新成功')
    } else {
      await adminService.createPackage(data)
      ElMessage.success('套餐创建成功')
    }

    showDialog.value = false
    await loadPackages()
  } catch (error) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const deletePackage = async (pkg) => {
  try {
    await ElMessageBox.confirm(
      `确定删除套餐"${pkg.name}"吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await adminService.deletePackage(pkg.id)
    ElMessage.success('删除成功')
    await loadPackages()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const resetForm = () => {
  Object.assign(packageForm, {
    name: '',
    description: '',
    price: 0,
    durationDays: 30,
    sortOrder: 0,
    status: 'ACTIVE'
  })

  // 重置为默认features
  Object.assign(features, {
    videoGeneration: { enabled: false, dailyQuota: 0, monthlyQuota: 0, maxSceneCount: 5, maxVideoDuration: 30, 
      allowedQualities: [], allowedResolutions: [], enableAdvancedParams: false, enableCustomPrompts: false, priority: 'normal' },
    aiWriting: { enabled: true, dailyQuota: 100, monthlyQuota: 1000, maxWordsPerRequest: 2000, models: ['gpt-3.5'] },
    aiAssistant: { enabled: true, dailyQuota: 50, monthlyQuota: 500, maxConcurrentSessions: 3, historyRetentionDays: 30 },
    materialGeneration: { enabled: true, dailyQuota: 10, monthlyQuota: 100, allowedTypes: ['character'] },
    storage: { quotaGB: 10, maxFileSizeMB: 50, allowedFileTypes: ['image'] },
    collaboration: { enabled: false, maxCollaborators: 0, allowedRoles: [] },
    other: { enableExport: true, enableBackup: false, enableAPI: false, prioritySupport: false }
  })

  selectedTemplate.value = ''
}

// 辅助函数
const getFeat = (row, feature, field) => {
  const features = typeof row.features === 'string' ? JSON.parse(row.features) : row.features
  return features?.[feature]?.[field]
}

const getVideoFeatures = (row) => {
  const features = typeof row.features === 'string' ? JSON.parse(row.features) : row.features
  return features?.videoGeneration || { enabled: false }
}

const formatQuota = (quota) => {
  if (quota === -1) return '不限'
  if (quota === 0) return '0'
  return quota + '/天'
}

// 生命周期
onMounted(() => {
  loadPackages()
})
</script>

<style scoped lang="scss">
.package-management-complete {
  padding: 20px;

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
  }

  .features-overview {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .features-tabs {
    margin-top: 16px;
  }

  .tab-label {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .feature-config {
    background: #f5f7fa;
    padding: 20px;
    border-radius: 4px;
    margin-top: 16px;
  }

  .unit {
    margin-left: 8px;
    color: #606266;
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}
</style>

