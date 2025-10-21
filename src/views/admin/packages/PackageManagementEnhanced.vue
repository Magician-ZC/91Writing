<template>
  <div class="package-management-enhanced">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="header-title">
            <el-icon><Box /></el-icon>
            套餐管理（含视频生成权限）
          </span>
          <el-button type="primary" :icon="Plus" @click="showCreateDialog">
            新增套餐
          </el-button>
        </div>
      </template>

      <!-- 套餐列表 -->
      <el-table :data="packages" v-loading="loading">
        <el-table-column prop="name" label="套餐名称" width="150" />
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">
            <el-text type="primary">¥{{ row.price }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="视频生成权限" width="350">
          <template #default="{ row }">
            <div class="video-limits" v-if="getVideoFeatures(row).enabled">
              <el-tag type="success" size="small">✅ 已启用</el-tag>
              <el-tag type="info" size="small">{{ getVideoFeatures(row).dailyQuota }}/天</el-tag>
              <el-tag type="info" size="small">{{ getVideoFeatures(row).monthlyQuota }}/月</el-tag>
              <el-tag type="warning" size="small">{{ getVideoFeatures(row).maxSceneCount }}个分镜</el-tag>
              <el-tag size="small">{{ getVideoFeatures(row).allowedQualities.join(',') }}</el-tag>
            </div>
            <el-tag v-else type="info" size="small">❌ 未启用</el-tag>
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
            <el-button type="primary" size="small" @click="editPackage(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="deletePackage(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建/编辑套餐对话框 -->
    <el-dialog
      v-model="showDialog"
      :title="editingPackage ? '编辑套餐' : '新增套餐'"
      width="900px"
      @close="resetForm"
    >
      <el-form :model="packageForm" label-width="120px">
        <!-- 基础信息 -->
        <el-divider content-position="left">基础信息</el-divider>
        
        <el-form-item label="套餐名称" required>
          <el-input v-model="packageForm.name" placeholder="例如：专业版" />
        </el-form-item>

        <el-form-item label="套餐描述">
          <el-input v-model="packageForm.description" type="textarea" :rows="2" />
        </el-form-item>

        <el-form-item label="价格" required>
          <el-input-number v-model="packageForm.price" :min="0" :precision="2" />
          <span class="unit">元/月</span>
        </el-form-item>

        <el-form-item label="有效期" required>
          <el-input-number v-model="packageForm.durationDays" :min="1" />
          <span class="unit">天</span>
        </el-form-item>

        <!-- 视频生成权限配置 -->
        <el-divider content-position="left">
          <el-icon><VideoCamera /></el-icon>
          视频生成权限
        </el-divider>

        <el-form-item label="启用视频生成">
          <el-switch v-model="videoFeatures.enabled" />
          <div class="form-tip" v-if="!videoFeatures.enabled">
            禁用后，该套餐用户无法使用视频生成功能
          </div>
        </el-form-item>

        <div v-if="videoFeatures.enabled" class="video-features-config">
          <el-form-item label="每日配额">
            <el-input-number v-model="videoFeatures.dailyQuota" :min="0" :max="100" />
            <span class="unit">个视频/天</span>
          </el-form-item>

          <el-form-item label="每月配额">
            <el-input-number v-model="videoFeatures.monthlyQuota" :min="0" :max="1000" />
            <span class="unit">个视频/月</span>
          </el-form-item>

          <el-form-item label="最大分镜数">
            <el-slider v-model="videoFeatures.maxSceneCount" :min="3" :max="10" :marks="{3:'3',5:'5',8:'8',10:'10'}" show-stops />
            <div class="form-tip">限制用户最多可选择的分镜数量</div>
          </el-form-item>

          <el-form-item label="最大视频时长">
            <el-input-number v-model="videoFeatures.maxVideoDuration" :min="15" :max="120" />
            <span class="unit">秒</span>
          </el-form-item>

          <el-form-item label="允许的图片质量">
            <el-checkbox-group v-model="videoFeatures.allowedQualities">
              <el-checkbox label="standard">标准质量（基础）</el-checkbox>
              <el-checkbox label="high">高质量（专业）</el-checkbox>
              <el-checkbox label="ultra">超高质量（企业）</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="允许的分辨率">
            <el-checkbox-group v-model="videoFeatures.allowedResolutions">
              <el-checkbox label="1024x576">1024x576 (16:9标准)</el-checkbox>
              <el-checkbox label="1280x720">1280x720 (HD)</el-checkbox>
              <el-checkbox label="1920x1080">1920x1080 (Full HD)</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="高级参数配置">
            <el-switch 
              v-model="videoFeatures.enableAdvancedParams"
              active-text="允许"
              inactive-text="不允许"
            />
            <div class="form-tip">
              高级参数包括：采样步数、CFG Scale、自定义负向提示词等
            </div>
          </el-form-item>

          <el-form-item label="自定义提示词">
            <el-switch 
              v-model="videoFeatures.enableCustomPrompts"
              active-text="允许"
              inactive-text="不允许"
            />
            <div class="form-tip">
              仅企业版建议开启，允许用户完全自定义AI提示词
            </div>
          </el-form-item>

          <el-form-item label="队列优先级">
            <el-select v-model="videoFeatures.priority">
              <el-option label="低优先级" value="low" />
              <el-option label="普通优先级" value="normal" />
              <el-option label="高优先级" value="high" />
            </el-select>
            <div class="form-tip">
              高优先级用户的任务会优先处理
            </div>
          </el-form-item>
        </div>

        <!-- AI写作权限 -->
        <el-divider content-position="left">
          <el-icon><EditPen /></el-icon>
          AI写作权限
        </el-divider>

        <el-form-item label="启用AI写作">
          <el-switch v-model="aiFeatures.enabled" />
        </el-form-item>

        <div v-if="aiFeatures.enabled">
          <el-form-item label="每日配额">
            <el-input-number v-model="aiFeatures.dailyQuota" :min="0" />
            <span class="unit">次/天</span>
          </el-form-item>

          <el-form-item label="可用模型">
            <el-checkbox-group v-model="aiFeatures.models">
              <el-checkbox label="gpt-3.5">GPT-3.5</el-checkbox>
              <el-checkbox label="gpt-4">GPT-4</el-checkbox>
              <el-checkbox label="claude-3">Claude-3</el-checkbox>
              <el-checkbox label="deepseek">DeepSeek</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </div>

        <!-- 存储空间 -->
        <el-divider content-position="left">
          <el-icon><FolderOpened /></el-icon>
          存储空间
        </el-divider>

        <el-form-item label="存储配额">
          <el-input-number v-model="storageFeatures.quotaGB" :min="1" :max="1000" />
          <span class="unit">GB</span>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="savePackage" :loading="saving">
          {{ editingPackage ? '保存' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Box, VideoCamera, EditPen, FolderOpened } from '@element-plus/icons-vue'
import { adminService } from '@/services/adminService'

const loading = ref(false)
const saving = ref(false)
const packages = ref([])
const showDialog = ref(false)
const editingPackage = ref(null)

// 视频生成权限
const videoFeatures = reactive({
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
})

// AI写作权限
const aiFeatures = reactive({
  enabled: true,
  dailyQuota: 1000,
  models: ['gpt-3.5']
})

// 存储权限
const storageFeatures = reactive({
  quotaGB: 10
})

const packageForm = reactive({
  name: '',
  description: '',
  price: 0,
  durationDays: 30,
  sortOrder: 0,
  status: 'ACTIVE'
})

const loadPackages = async () => {
  loading.value = true
  try {
    const response = await adminService.getPackages()
    packages.value = response.data || []
  } catch (error) {
    ElMessage.error('加载套餐失败')
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
    description: pkg.description,
    price: pkg.price,
    durationDays: pkg.durationDays,
    sortOrder: pkg.sortOrder || 0,
    status: pkg.status
  })

  // 加载features
  const features = typeof pkg.features === 'string' ? JSON.parse(pkg.features) : pkg.features
  
  if (features.videoGeneration) {
    Object.assign(videoFeatures, features.videoGeneration)
  }
  if (features.aiWriting) {
    Object.assign(aiFeatures, features.aiWriting)
  }
  if (features.storage) {
    storageFeatures.quotaGB = features.storage.quotaGB || 10
  }

  showDialog.value = true
}

const savePackage = async () => {
  if (!packageForm.name || packageForm.price === null) {
    ElMessage.warning('请填写必填项')
    return
  }

  saving.value = true
  try {
    const features = {
      videoGeneration: { ...videoFeatures },
      aiWriting: { ...aiFeatures },
      storage: {
        quotaGB: storageFeatures.quotaGB,
        quotaBytes: storageFeatures.quotaGB * 1024 * 1024 * 1024
      }
    }

    const data = {
      ...packageForm,
      features
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
    await ElMessageBox.confirm(`确定删除套餐"${pkg.name}"吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await adminService.deletePackage(pkg.id)
    ElMessage.success('删除成功')
    await loadPackages()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const getVideoFeatures = (pkg) => {
  const features = typeof pkg.features === 'string' ? JSON.parse(pkg.features) : pkg.features
  return features?.videoGeneration || { enabled: false }
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

  Object.assign(videoFeatures, {
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
  })

  Object.assign(aiFeatures, {
    enabled: true,
    dailyQuota: 1000,
    models: ['gpt-3.5']
  })

  storageFeatures.quotaGB = 10
}

onMounted(() => {
  loadPackages()
})
</script>

<style scoped lang="scss">
.package-management-enhanced {
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

  .video-limits {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .video-features-config {
    background: #f5f7fa;
    padding: 20px;
    border-radius: 4px;
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
}
</style>

