<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  RotateCcw,
  Users,
  User,
  Mail,
  Phone,
  Shield,
  Building2,
  Clock,
  RefreshCw
} from 'lucide-vue-next'
import dayjs from 'dayjs'
import { getUsers, createUser, updateUser, deleteUser } from '@/api/user'
import Empty from '@/components/Empty.vue'
import type { User as UserType } from '@/types'

const loading = ref(false)
const users = ref<UserType[]>([])
const total = ref(0)
const checkingUsername = ref(false)

const filters = reactive({
  keyword: '',
  role: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10
})

const roleOptions = [
  { label: '全部角色', value: '' },
  { label: '管理员', value: 'admin' },
  { label: '巡店员', value: 'inspector' },
  { label: '门店经理', value: 'manager' }
]

const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '正常', value: '1' },
  { label: '禁用', value: '0' }
]

const departmentOptions = [
  { label: '运营部', value: '运营部' },
  { label: '质量部', value: '质量部' },
  { label: '门店管理部', value: '门店管理部' },
  { label: '人力资源部', value: '人力资源部' },
  { label: '财务部', value: '财务部' },
  { label: '技术部', value: '技术部' }
]

const roleConfig: Record<string, { label: string; type: string; color: string }> = {
  admin: { label: '管理员', type: 'danger', color: '#EF4444' },
  inspector: { label: '巡店员', type: 'primary', color: '#165DFF' },
  manager: { label: '门店经理', type: 'success', color: '#10B981' }
}

const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const formRef = ref<FormInstance>()
const formData = reactive({
  id: null as number | null,
  username: '',
  realName: '',
  phone: '',
  email: '',
  role: 'inspector' as 'admin' | 'inspector' | 'manager',
  department: '',
  password: '',
  confirmPassword: '',
  status: 1
})

const validateUsername = async (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入用户名'))
    return
  }
  if (value.length < 3 || value.length > 20) {
    callback(new Error('用户名长度为3-20个字符'))
    return
  }
  if (!/^[a-zA-Z0-9_]+$/.test(value)) {
    callback(new Error('用户名只能包含字母、数字和下划线'))
    return
  }
  
  if (dialogMode.value === 'create') {
    checkingUsername.value = true
    try {
      const response = await getUsers({ pageSize: 100 })
      if (response.code === 0) {
        const exists = response.data.list.some((u: UserType) => u.username === value)
        if (exists) {
          callback(new Error('用户名已存在'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    } catch {
      callback()
    } finally {
      checkingUsername.value = false
    }
  } else {
    callback()
  }
}

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (dialogMode.value === 'create' && !value) {
    callback(new Error('请确认密码'))
    return
  }
  if (value && value !== formData.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const formRules: FormRules = {
  username: [{ required: true, validator: validateUsername, trigger: 'blur' }],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
  password: [
    {
      required: dialogMode.value === 'create',
      message: '请输入密码',
      trigger: 'blur'
    },
    {
      min: 6,
      max: 20,
      message: '密码长度为6-20个字符',
      trigger: 'blur'
    }
  ],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const fetchUsers = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: filters.keyword || undefined,
      role: filters.role || undefined,
      status: filters.status || undefined
    }
    const response = await getUsers(params)
    if (response.code === 0) {
      users.value = response.data.list
      total.value = response.data.total
    }
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchUsers()
}

const handleReset = () => {
  filters.keyword = ''
  filters.role = ''
  filters.status = ''
  pagination.page = 1
  fetchUsers()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchUsers()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchUsers()
}

const openCreateDialog = () => {
  dialogMode.value = 'create'
  formData.id = null
  formData.username = ''
  formData.realName = ''
  formData.phone = ''
  formData.email = ''
  formData.role = 'inspector'
  formData.department = ''
  formData.password = ''
  formData.confirmPassword = ''
  formData.status = 1
  dialogVisible.value = true
}

const openEditDialog = (row: UserType) => {
  dialogMode.value = 'edit'
  formData.id = row.id
  formData.username = row.username
  formData.realName = row.realName
  formData.phone = row.phone
  formData.email = row.email
  formData.role = row.role
  formData.department = row.department || ''
  formData.password = ''
  formData.confirmPassword = ''
  formData.status = row.status
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const submitData: any = {
          username: formData.username,
          realName: formData.realName,
          phone: formData.phone,
          email: formData.email,
          role: formData.role,
          department: formData.department,
          status: formData.status
        }

        if (dialogMode.value === 'create') {
          submitData.password = formData.password
        } else if (formData.password) {
          submitData.password = formData.password
        }

        let response
        if (dialogMode.value === 'create') {
          response = await createUser(submitData)
        } else {
          response = await updateUser(formData.id!, submitData)
        }

        if (response.code === 0) {
          ElMessage.success(dialogMode.value === 'create' ? '新增用户成功' : '编辑用户成功')
          dialogVisible.value = false
          fetchUsers()
        }
      } catch (error) {
        ElMessage.error(dialogMode.value === 'create' ? '新增用户失败' : '编辑用户失败')
      }
    }
  })
}

const handleDelete = async (row: UserType) => {
  try {
    await ElMessageBox.confirm(`确定要删除用户「${row.realName}」吗？删除后数据无法恢复。`, '删除确认', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    })
    const response = await deleteUser(row.id)
    if (response.code === 0) {
      ElMessage.success('删除用户成功')
      fetchUsers()
    }
  } catch {
    // 用户取消
  }
}

const handleResetPassword = async (row: UserType) => {
  try {
    const { value: password } = await ElMessageBox.prompt(
      `请为用户「${row.realName}」设置新密码`,
      '重置密码',
      {
        confirmButtonText: '确定重置',
        cancelButtonText: '取消',
        inputPattern: /^.{6,20}$/,
        inputErrorMessage: '密码长度为6-20个字符',
        inputType: 'password',
        inputPlaceholder: '请输入新密码'
      }
    )

    const response = await updateUser(row.id, { password })
    if (response.code === 0) {
      ElMessage.success('密码重置成功')
    }
  } catch {
    // 用户取消
  }
}

const getStatusTag = (status: number) => {
  return status === 1
    ? { label: '正常', type: 'success' }
    : { label: '禁用', type: 'info' }
}

const formatDate = (date?: string) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

watch(
  () => dialogVisible.value,
  (val) => {
    if (!val && formRef.value) {
      formRef.value.clearValidate()
    }
  }
)

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div class="user-management-container">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">
          <Users class="title-icon" />
          用户管理
        </h2>
        <p class="page-desc">管理系统用户账号，配置角色权限</p>
      </div>
      <el-button type="primary" size="large" class="create-btn" @click="openCreateDialog">
        <Plus :size="18" />
        新增用户
      </el-button>
    </div>

    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" class="filter-form">
        <el-form-item label="角色">
          <el-select v-model="filters.role" placeholder="全部角色" style="width: 140px">
            <el-option v-for="item in roleOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部状态" style="width: 140px">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <div class="search-box">
            <el-input
              v-model="filters.keyword"
              placeholder="搜索用户名/真实姓名/手机"
              clearable
              style="width: 280px"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <Search :size="16" />
              </template>
            </el-input>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <Filter :size="16" />
            筛选
          </el-button>
          <el-button @click="handleReset">
            <RefreshCw :size="16" />
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never" v-loading="loading">
      <el-table
        :data="users"
        class="user-table"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column label="用户名" min-width="130">
          <template #default="{ row }">
            <div class="user-cell">
              <div class="user-avatar">
                <User :size="18" />
              </div>
              <div class="user-info">
                <div class="username">{{ row.username }}</div>
                <div class="real-name">{{ row.realName }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="手机号" width="130" min-width="130">
          <template #default="{ row }">
            <div class="info-cell">
              <Phone :size="14" class="info-icon" />
              <span>{{ row.phone }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="邮箱" min-width="180">
          <template #default="{ row }">
            <div class="info-cell">
              <Mail :size="14" class="info-icon" />
              <span class="email-text">{{ row.email }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="角色" width="110" min-width="110">
          <template #default="{ row }">
            <div class="role-cell">
              <Shield :size="14" :style="{ color: roleConfig[row.role]?.color }" />
              <el-tag :type="roleConfig[row.role]?.type as any" effect="light" round size="small">
                {{ roleConfig[row.role]?.label }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="部门" width="120" min-width="120">
          <template #default="{ row }">
            <div class="info-cell">
              <Building2 :size="14" class="info-icon" />
              <span>{{ row.department || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" min-width="90">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status).type as any" effect="light" round size="small">
              {{ getStatusTag(row.status).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="最后登录" width="160" min-width="160">
          <template #default="{ row }">
            <div class="info-cell">
              <Clock :size="14" class="info-icon" />
              <span>{{ formatDate(row.lastLoginTime) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button type="primary" link size="small" @click="openEditDialog(row)">
                <Edit :size="14" />
                编辑
              </el-button>
              <el-button type="warning" link size="small" @click="handleResetPassword(row)">
                <RotateCcw :size="14" />
                重置密码
              </el-button>
              <el-button type="danger" link size="small" @click="handleDelete(row)">
                <Trash2 :size="14" />
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
        <template #empty>
          <Empty description="暂无用户数据" />
        </template>
      </el-table>

      <div class="pagination-wrapper" v-if="total > 0">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新增用户' : '编辑用户'"
      width="600px"
      class="user-dialog"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        class="user-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="formData.username"
                placeholder="请输入用户名"
                :disabled="dialogMode === 'edit'"
                maxlength="20"
                show-word-limit
              >
                <template #suffix v-if="checkingUsername">
                  <span class="checking-text">检查中...</span>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="真实姓名" prop="realName">
              <el-input v-model="formData.realName" placeholder="请输入真实姓名" maxlength="20" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="formData.phone" placeholder="请输入手机号" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="formData.email" placeholder="请输入邮箱" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="角色" prop="role">
              <el-select v-model="formData.role" placeholder="请选择角色" style="width: 100%">
                <el-option
                  v-for="item in roleOptions.slice(1)"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门" prop="department">
              <el-select v-model="formData.department" placeholder="请选择部门" style="width: 100%">
                <el-option v-for="item in departmentOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="formData.password"
                type="password"
                :placeholder="dialogMode === 'create' ? '请输入密码' : '不修改请留空'"
                maxlength="20"
                show-password
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="formData.confirmPassword"
                type="password"
                :placeholder="dialogMode === 'create' ? '请再次输入密码' : '不修改请留空'"
                maxlength="20"
                show-password
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="checkingUsername">
          {{ dialogMode === 'create' ? '确定新增' : '确定修改' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.user-management-container {
  padding: 24px;
  min-height: calc(100vh - 64px);
  background: #F8FAFC;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 24px;
  font-weight: 700;
  color: #1E293B;
  margin: 0;
}

.title-icon {
  color: #165DFF;
  width: 28px;
  height: 28px;
}

.page-desc {
  font-size: 14px;
  color: #64748B;
  margin: 0;
}

.create-btn {
  height: 40px;
  padding: 0 24px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.filter-card {
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  margin-bottom: 24px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.search-box {
  display: flex;
  align-items: center;
}

.table-card {
  border-radius: 16px;
  border: 1px solid #E2E8F0;
}

.user-table {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table__header) {
  background: #F8FAFC;
}

:deep(.el-table__header th) {
  background: #F8FAFC;
  color: #475569;
  font-weight: 600;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #E8F0FF 0%, #D1E2FF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #165DFF;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.username {
  font-family: 'SF Mono', monospace;
  font-size: 13px;
  font-weight: 500;
  color: #165DFF;
}

.real-name {
  font-size: 14px;
  font-weight: 600;
  color: #1E293B;
}

.info-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #475569;
}

.info-icon {
  color: #94A3B8;
  flex-shrink: 0;
}

.email-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 180px;
}

.role-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.checking-text {
  font-size: 12px;
  color: #94A3B8;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0 0;
}

:deep(.el-dialog) {
  border-radius: 16px;
}

:deep(.el-dialog__header) {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #F1F5F9;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px 20px;
  border-top: 1px solid #F1F5F9;
}

.user-form {
  padding: 8px 0;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #334155;
}

@media (max-width: 1200px) {
  .filter-form {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-form .el-form-item {
    margin-right: 0 !important;
    margin-bottom: 12px;
  }

  .search-box :deep(.el-input) {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .user-management-container {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>
