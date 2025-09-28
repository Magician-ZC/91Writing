<template>
  <div class="user-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>用户管理</h1>
      <div class="header-actions">
        <el-button type="primary" @click="refreshData" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="search-card">
      <el-form :model="searchParams" inline @submit.prevent="searchUsers">
        <el-form-item label="搜索用户">
          <el-input
            v-model="searchParams.search"
            placeholder="输入邮箱或昵称"
            clearable
            style="width: 250px;"
            @keyup.enter="searchUsers"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="用户角色">
          <el-select v-model="searchParams.role" placeholder="选择角色" clearable style="width: 150px;">
            <el-option label="普通用户" value="USER" />
            <el-option label="管理员" value="ADMIN" />
            <el-option label="版主" value="MODERATOR" />
          </el-select>
        </el-form-item>

        <el-form-item label="用户状态">
          <el-select v-model="searchParams.status" placeholder="选择状态" clearable style="width: 150px;">
            <el-option label="正常" value="ACTIVE" />
            <el-option label="未激活" value="INACTIVE" />
            <el-option label="已封禁" value="BANNED" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="searchUsers">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 用户列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="table-header">
          <h3>用户列表</h3>
          <div class="table-actions">
            <el-text type="info">
              共 {{ pagination.total }} 个用户
            </el-text>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="users"
        style="width: 100%"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="email" label="邮箱" min-width="200" sortable="custom">
          <template #default="{ row }">
            <div class="user-email">
              <el-text>{{ row.email }}</el-text>
              <el-tag v-if="row.role === 'ADMIN'" type="danger" size="small">管理员</el-tag>
              <el-tag v-else-if="row.role === 'MODERATOR'" type="warning" size="small">版主</el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="nickname" label="昵称" min-width="120">
          <template #default="{ row }">
            <el-text>{{ row.nickname || '未设置' }}</el-text>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getUserStatusColor(row.status)" size="small">
              {{ formatUserStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="订阅信息" min-width="150">
          <template #default="{ row }">
            <div v-if="row.currentSubscription" class="subscription-info">
              <el-tag type="success" size="small">
                {{ row.currentSubscription.package?.name || '未知套餐' }}
              </el-tag>
              <div class="subscription-date">
                <el-text type="info" size="small">
                  {{ formatDate(row.currentSubscription.endDate) }} 到期
                </el-text>
              </div>
            </div>
            <el-text v-else type="info" size="small">无订阅</el-text>
          </template>
        </el-table-column>

        <el-table-column prop="lastLoginAt" label="最后登录" min-width="150" sortable="custom">
          <template #default="{ row }">
            <el-text type="info" size="small">
              {{ row.lastLoginAt ? formatDate(row.lastLoginAt) : '从未登录' }}
            </el-text>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="注册时间" min-width="150" sortable="custom">
          <template #default="{ row }">
            <el-text type="info" size="small">
              {{ formatDate(row.createdAt) }}
            </el-text>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button type="primary" size="small" @click="viewUserDetail(row)">
                查看详情
              </el-button>
              
              <el-dropdown @command="(command) => handleUserAction(command, row)">
                <el-button size="small">
                  更多
                  <el-icon><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="edit">编辑信息</el-dropdown-item>
                    <el-dropdown-item 
                      v-if="row.status !== 'BANNED'" 
                      command="ban"
                      divided
                      style="color: #f56c6c;"
                    >
                      封禁用户
                    </el-dropdown-item>
                    <el-dropdown-item 
                      v-if="row.status === 'BANNED'" 
                      command="unban"
                      divided
                      style="color: #67c23a;"
                    >
                      解封用户
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="loadUsers"
          @size-change="loadUsers"
        />
      </div>
    </el-card>

    <!-- 用户详情对话框 -->
    <el-dialog
      v-model="showUserDetail"
      title="用户详情"
      width="800px"
      @close="selectedUser = null"
    >
      <UserDetailDialog
        v-if="selectedUser"
        :user="selectedUser"
        @refresh="loadUsers"
        @close="showUserDetail = false"
      />
    </el-dialog>

    <!-- 编辑用户对话框 -->
    <el-dialog
      v-model="showEditUser"
      title="编辑用户信息"
      width="600px"
      @close="editForm = {}"
    >
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="邮箱">
          <el-input v-model="editForm.email" disabled />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="editForm.nickname" placeholder="用户昵称" />
        </el-form-item>
        <el-form-item label="用户角色">
          <el-select v-model="editForm.role" style="width: 100%;">
            <el-option label="普通用户" value="USER" />
            <el-option label="版主" value="MODERATOR" />
            <el-option label="管理员" value="ADMIN" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户状态">
          <el-select v-model="editForm.status" style="width: 100%;">
            <el-option label="正常" value="ACTIVE" />
            <el-option label="未激活" value="INACTIVE" />
            <el-option label="已封禁" value="BANNED" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showEditUser = false">取消</el-button>
          <el-button type="primary" @click="updateUser" :loading="updating">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 封禁用户对话框 -->
    <el-dialog
      v-model="showBanUser"
      title="封禁用户"
      width="500px"
      @close="banForm = {}"
    >
      <el-form :model="banForm" label-width="100px">
        <el-form-item label="封禁原因" required>
          <el-input
            v-model="banForm.reason"
            type="textarea"
            rows="3"
            placeholder="请输入封禁原因"
          />
        </el-form-item>
        <el-form-item label="封禁时长">
          <el-select v-model="banForm.duration" placeholder="选择封禁时长" style="width: 100%;">
            <el-option label="永久封禁" :value="null" />
            <el-option label="1天" :value="1" />
            <el-option label="3天" :value="3" />
            <el-option label="7天" :value="7" />
            <el-option label="30天" :value="30" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showBanUser = false">取消</el-button>
          <el-button type="danger" @click="banUser" :loading="banning">确定封禁</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh,
  Search,
  ArrowDown
} from '@element-plus/icons-vue'
import { adminService } from '@/services/adminService'
import UserDetailDialog from './components/UserDetailDialog.vue'

// 响应式数据
const loading = ref(false)
const updating = ref(false)
const banning = ref(false)
const users = ref([])

const searchParams = reactive({
  search: '',
  role: '',
  status: '',
  sortBy: 'createdAt',
  sortOrder: 'desc'
})

const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

// 对话框控制
const showUserDetail = ref(false)
const showEditUser = ref(false)
const showBanUser = ref(false)

const selectedUser = ref(null)
const editForm = reactive({})
const banForm = reactive({})

// 方法
const loadUsers = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...searchParams
    }

    const response = await adminService.getUsers(params)
    
    if (response.success) {
      users.value = response.data.data
      pagination.total = response.data.pagination.total
    } else {
      ElMessage.error('获取用户列表失败')
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

const searchUsers = () => {
  pagination.page = 1
  loadUsers()
}

const resetSearch = () => {
  Object.assign(searchParams, {
    search: '',
    role: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  pagination.page = 1
  loadUsers()
}

const refreshData = () => {
  loadUsers()
}

const handleSortChange = ({ prop, order }) => {
  searchParams.sortBy = prop
  searchParams.sortOrder = order === 'ascending' ? 'asc' : 'desc'
  loadUsers()
}

const viewUserDetail = async (user) => {
  try {
    const response = await adminService.getUserDetail(user.id)
    if (response.success) {
      selectedUser.value = response.data
      showUserDetail.value = true
    } else {
      ElMessage.error('获取用户详情失败')
    }
  } catch (error) {
    console.error('获取用户详情失败:', error)
    ElMessage.error('获取用户详情失败')
  }
}

const handleUserAction = (command, user) => {
  selectedUser.value = user
  
  switch (command) {
    case 'edit':
      Object.assign(editForm, {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
        status: user.status
      })
      showEditUser.value = true
      break
    
    case 'ban':
      banForm.reason = ''
      banForm.duration = null
      showBanUser.value = true
      break
    
    case 'unban':
      unbanUser(user)
      break
  }
}

const updateUser = async () => {
  if (!editForm.id) return
  
  updating.value = true
  try {
    const updateData = {
      nickname: editForm.nickname,
      role: editForm.role,
      status: editForm.status
    }
    
    const response = await adminService.updateUser(editForm.id, updateData)
    
    if (response.success) {
      ElMessage.success('用户信息更新成功')
      showEditUser.value = false
      loadUsers()
    } else {
      ElMessage.error('更新用户信息失败')
    }
  } catch (error) {
    console.error('更新用户信息失败:', error)
    ElMessage.error('更新用户信息失败')
  } finally {
    updating.value = false
  }
}

const banUser = async () => {
  if (!selectedUser.value || !banForm.reason.trim()) {
    ElMessage.warning('请填写封禁原因')
    return
  }
  
  banning.value = true
  try {
    const response = await adminService.banUser(selectedUser.value.id, {
      reason: banForm.reason,
      duration: banForm.duration
    })
    
    if (response.success) {
      ElMessage.success('用户封禁成功')
      showBanUser.value = false
      loadUsers()
    } else {
      ElMessage.error('封禁用户失败')
    }
  } catch (error) {
    console.error('封禁用户失败:', error)
    ElMessage.error('封禁用户失败')
  } finally {
    banning.value = false
  }
}

const unbanUser = async (user) => {
  try {
    await ElMessageBox.confirm(
      `确定要解封用户 ${user.email} 吗？`,
      '解封用户',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const response = await adminService.unbanUser(user.id)
    
    if (response.success) {
      ElMessage.success('用户解封成功')
      loadUsers()
    } else {
      ElMessage.error('解封用户失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('解封用户失败:', error)
      ElMessage.error('解封用户失败')
    }
  }
}

// 格式化方法
const formatUserStatus = (status) => {
  return adminService.formatUserStatus(status)
}

const getUserStatusColor = (status) => {
  return adminService.getUserStatusColor(status)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.user-management {
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

.search-card {
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: none;
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

.user-email {
  display: flex;
  align-items: center;
  gap: 8px;
}

.subscription-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.subscription-date {
  font-size: 12px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-management {
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
  
  .search-card .el-form {
    flex-direction: column;
  }
  
  .search-card .el-form-item {
    width: 100%;
  }
  
  .action-buttons {
    flex-direction: column;
    width: 100%;
  }
}
</style>