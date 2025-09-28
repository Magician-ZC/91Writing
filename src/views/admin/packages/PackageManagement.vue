<template>
  <div class="package-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>套餐管理</h1>
      <div class="header-actions">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          新增套餐
        </el-button>
        <el-button @click="refreshData" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 套餐列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="table-header">
          <h3>套餐列表</h3>
          <div class="table-actions">
            <el-text type="info">
              共 {{ packages.length }} 个套餐
            </el-text>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="packages"
        style="width: 100%"
      >
        <el-table-column prop="name" label="套餐名称" min-width="120" />

        <el-table-column prop="description" label="套餐描述" min-width="200">
          <template #default="{ row }">
            <el-text>{{ row.description || '暂无描述' }}</el-text>
          </template>
        </el-table-column>

        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">
            <el-text type="primary">¥{{ row.price }}</el-text>
          </template>
        </el-table-column>

        <el-table-column prop="durationDays" label="有效期" width="100">
          <template #default="{ row }">
            <el-text>{{ row.durationDays }}天</el-text>
          </template>
        </el-table-column>

        <el-table-column prop="sortOrder" label="排序" width="80" />

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'">
              {{ row.status === 'ACTIVE' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="功能特性" min-width="200">
          <template #default="{ row }">
            <div class="features-list">
              <el-tag
                v-for="feature in getFeatures(row.features)"
                :key="feature"
                size="small"
                style="margin: 2px;"
              >
                {{ feature }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="创建时间" min-width="150">
          <template #default="{ row }">
            <el-text type="info" size="small">
              {{ formatDate(row.createdAt) }}
            </el-text>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button type="primary" size="small" @click="editPackage(row)">
                编辑
              </el-button>
              
              <el-button
                :type="row.status === 'ACTIVE' ? 'warning' : 'success'"
                size="small"
                @click="togglePackageStatus(row)"
              >
                {{ row.status === 'ACTIVE' ? '禁用' : '启用' }}
              </el-button>
              
              <el-button
                type="danger"
                size="small"
                @click="deletePackage(row)"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建/编辑套餐对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingPackage ? '编辑套餐' : '新增套餐'"
      width="700px"
      @close="resetForm"
    >
      <el-form :model="packageForm" :rules="packageRules" ref="packageFormRef" label-width="100px">
        <el-form-item label="套餐名称" prop="name">
          <el-input v-model="packageForm.name" placeholder="输入套餐名称" />
        </el-form-item>

        <el-form-item label="套餐描述" prop="description">
          <el-input
            v-model="packageForm.description"
            type="textarea"
            rows="3"
            placeholder="输入套餐描述"
          />
        </el-form-item>

        <el-form-item label="价格" prop="price">
          <el-input-number
            v-model="packageForm.price"
            :min="0"
            :precision="2"
            style="width: 100%;"
          />
        </el-form-item>

        <el-form-item label="有效期(天)" prop="durationDays">
          <el-input-number
            v-model="packageForm.durationDays"
            :min="1"
            style="width: 100%;"
          />
        </el-form-item>

        <el-form-item label="排序权重" prop="sortOrder">
          <el-input-number
            v-model="packageForm.sortOrder"
            :min="0"
            style="width: 100%;"
          />
        </el-form-item>

        <el-form-item label="套餐状态" prop="status">
          <el-radio-group v-model="packageForm.status">
            <el-radio label="ACTIVE">启用</el-radio>
            <el-radio label="INACTIVE">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="功能特性">
          <div class="features-editor">
            <el-input
              v-model="newFeature"
              placeholder="输入功能特性，按Enter添加"
              @keyup.enter="addFeature"
              style="margin-bottom: 10px;"
            >
              <template #suffix>
                <el-button type="text" @click="addFeature">
                  <el-icon><Plus /></el-icon>
                </el-button>
              </template>
            </el-input>
            
            <div class="features-list">
              <el-tag
                v-for="(feature, index) in packageForm.features"
                :key="index"
                closable
                @close="removeFeature(index)"
                style="margin: 2px;"
              >
                {{ feature }}
              </el-tag>
            </div>
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="savePackage" :loading="saving">
            {{ editingPackage ? '更新' : '创建' }}
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
  Plus,
  Refresh
} from '@element-plus/icons-vue'
import { adminService } from '@/services/adminService'

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const packages = ref([])

// 对话框控制
const showCreateDialog = ref(false)
const editingPackage = ref(null)

// 表单相关
const packageFormRef = ref()
const newFeature = ref('')

const packageForm = reactive({
  name: '',
  description: '',
  price: 0,
  durationDays: 30,
  sortOrder: 0,
  status: 'ACTIVE',
  features: []
})

const packageRules = {
  name: [
    { required: true, message: '请输入套餐名称', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入套餐价格', trigger: 'blur' }
  ],
  durationDays: [
    { required: true, message: '请输入有效期天数', trigger: 'blur' }
  ]
}

// 方法
const loadPackages = async () => {
  loading.value = true
  try {
    const response = await adminService.getPackages()
    
    if (response.success) {
      packages.value = response.data
    } else {
      ElMessage.error('获取套餐列表失败')
    }
  } catch (error) {
    console.error('加载套餐列表失败:', error)
    ElMessage.error('加载套餐列表失败')
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadPackages()
}

const editPackage = (pkg) => {
  editingPackage.value = pkg
  Object.assign(packageForm, {
    id: pkg.id,
    name: pkg.name,
    description: pkg.description || '',
    price: pkg.price,
    durationDays: pkg.durationDays,
    sortOrder: pkg.sortOrder || 0,
    status: pkg.status,
    features: pkg.features ? JSON.parse(pkg.features) : []
  })
  showCreateDialog.value = true
}

const savePackage = async () => {
  if (!packageFormRef.value) return
  
  try {
    const valid = await packageFormRef.value.validate()
    if (!valid) return
    
    saving.value = true
    
    const packageData = {
      name: packageForm.name,
      description: packageForm.description,
      price: packageForm.price,
      durationDays: packageForm.durationDays,
      sortOrder: packageForm.sortOrder,
      status: packageForm.status,
      features: JSON.stringify(packageForm.features)
    }
    
    let response
    if (editingPackage.value) {
      response = await adminService.updatePackage(editingPackage.value.id, packageData)
    } else {
      response = await adminService.createPackage(packageData)
    }
    
    if (response.success) {
      ElMessage.success(editingPackage.value ? '套餐更新成功' : '套餐创建成功')
      showCreateDialog.value = false
      loadPackages()
    } else {
      ElMessage.error(editingPackage.value ? '套餐更新失败' : '套餐创建失败')
    }
  } catch (error) {
    console.error('保存套餐失败:', error)
    ElMessage.error('保存套餐失败')
  } finally {
    saving.value = false
  }
}

const togglePackageStatus = async (pkg) => {
  try {
    const newStatus = pkg.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    const response = await adminService.updatePackage(pkg.id, { status: newStatus })
    
    if (response.success) {
      ElMessage.success('套餐状态更新成功')
      loadPackages()
    } else {
      ElMessage.error('套餐状态更新失败')
    }
  } catch (error) {
    console.error('更新套餐状态失败:', error)
    ElMessage.error('更新套餐状态失败')
  }
}

const deletePackage = async (pkg) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除套餐 "${pkg.name}" 吗？此操作不可恢复。`,
      '删除套餐',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const response = await adminService.deletePackage(pkg.id)
    
    if (response.success) {
      ElMessage.success('套餐删除成功')
      loadPackages()
    } else {
      ElMessage.error(response.message || '套餐删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除套餐失败:', error)
      ElMessage.error('删除套餐失败')
    }
  }
}

const addFeature = () => {
  if (newFeature.value.trim() && !packageForm.features.includes(newFeature.value.trim())) {
    packageForm.features.push(newFeature.value.trim())
    newFeature.value = ''
  }
}

const removeFeature = (index) => {
  packageForm.features.splice(index, 1)
}

const resetForm = () => {
  editingPackage.value = null
  Object.assign(packageForm, {
    name: '',
    description: '',
    price: 0,
    durationDays: 30,
    sortOrder: 0,
    status: 'ACTIVE',
    features: []
  })
  newFeature.value = ''
  
  if (packageFormRef.value) {
    packageFormRef.value.clearValidate()
  }
}

const getFeatures = (featuresJson) => {
  if (!featuresJson) return []
  try {
    return JSON.parse(featuresJson)
  } catch {
    return []
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadPackages()
})
</script>

<style scoped>
.package-management {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.page-header h1 {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.table-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: none;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-header h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.features-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.features-editor {
  width: 100%;
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .package-management {
    padding: 12px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .action-buttons {
    flex-direction: column;
    width: 100%;
  }
}
</style>