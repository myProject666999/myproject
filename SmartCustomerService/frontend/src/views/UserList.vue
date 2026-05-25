<template>
  <div class="user-list">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><Avatar /></el-icon>
          <span>用户管理</span>
          <el-button type="primary" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            新增用户
          </el-button>
        </div>
      </template>

      <el-form :inline="true" class="search-form">
        <el-form-item label="角色">
          <el-select v-model="searchForm.role" placeholder="全部" clearable @change="loadUsers">
            <el-option label="客户" :value="1" />
            <el-option label="客服" :value="2" />
            <el-option label="管理员" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable @change="loadUsers">
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="搜索用户" clearable @keyup.enter="loadUsers" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadUsers">搜索</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="userList" stripe>
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="realName" label="姓名" width="120" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column prop="role" label="角色" width="80">
          <template #default="{ row }">
            <el-tag :type="row.role === 3 ? 'danger' : row.role === 2 ? 'primary' : 'info'">
              {{ row.role === 3 ? '管理员' : row.role === 2 ? '客服' : '客户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="department" label="部门" width="120">
          <template #default="{ row }">
            {{ row.department || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="onlineStatus" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.onlineStatus === 1 ? 'success' : 'info'" size="small">
              {{ row.onlineStatus === 1 ? '在线' : '离线' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="启用" width="80">
          <template #default="{ row }">
            <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadUsers"
          @current-change="loadUsers"
        />
      </div>
    </el-card>

    <el-dialog v-model="showCreateDialog" title="新增用户" width="500px">
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="createForm.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="createForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="createForm.realName" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="createForm.email" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="createForm.phone" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="createForm.role" style="width: 100%">
            <el-option label="客户" :value="1" />
            <el-option label="客服" :value="2" />
            <el-option label="管理员" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="部门">
          <el-input v-model="createForm.department" />
        </el-form-item>
        <el-form-item label="技能标签">
          <el-input v-model="createForm.skillTags" placeholder="多个标签用逗号分隔" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showEditDialog" title="编辑用户" width="500px">
      <el-form ref="editFormRef" :model="editForm" label-width="80px">
        <el-form-item label="姓名">
          <el-input v-model="editForm.realName" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editForm.email" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="editForm.phone" />
        </el-form-item>
        <el-form-item label="部门">
          <el-input v-model="editForm.department" />
        </el-form-item>
        <el-form-item label="技能标签">
          <el-input v-model="editForm.skillTags" placeholder="多个标签用逗号分隔" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpdate">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserList, createUser, updateUser, deleteUser } from '@/api/user'

const searchForm = reactive({
  role: '',
  status: '',
  keyword: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const userList = ref([])
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const createFormRef = ref(null)
const editFormRef = ref(null)

const createForm = reactive({
  username: '',
  password: '',
  realName: '',
  email: '',
  phone: '',
  role: 1,
  department: '',
  skillTags: ''
})

const createRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const editForm = reactive({
  id: '',
  realName: '',
  email: '',
  phone: '',
  department: '',
  skillTags: ''
})

async function loadUsers() {
  const params = {
    page: pagination.page,
    pageSize: pagination.pageSize,
    ...searchForm
  }
  
  const res = await getUserList(params)
  if (res.code === 0) {
    userList.value = res.data.list || []
    pagination.total = res.data.total || 0
  }
}

async function handleCreate() {
  if (!createFormRef.value) return
  
  await createFormRef.value.validate(async (valid) => {
    if (valid) {
      const res = await createUser(createForm)
      if (res.code === 0) {
        ElMessage.success('创建成功')
        showCreateDialog.value = false
        loadUsers()
      } else {
        ElMessage.error(res.message || '创建失败')
      }
    }
  })
}

function handleEdit(row) {
  Object.assign(editForm, {
    id: row.id,
    realName: row.realName,
    email: row.email,
    phone: row.phone,
    department: row.department,
    skillTags: row.skillTags
  })
  showEditDialog.value = true
}

async function handleUpdate() {
  const res = await updateUser(editForm)
  if (res.code === 0) {
    ElMessage.success('更新成功')
    showEditDialog.value = false
    loadUsers()
  } else {
    ElMessage.error(res.message || '更新失败')
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm('确定要删除此用户吗？', '提示', { type: 'warning' })
    const res = await deleteUser(row.id)
    if (res.code === 0) {
      ElMessage.success('删除成功')
      loadUsers()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (e) {}
}

async function handleStatusChange(row) {
  const res = await updateUser({
    id: row.id,
    realName: row.realName,
    email: row.email,
    phone: row.phone,
    department: row.department,
    skillTags: row.skillTags,
    status: row.status
  })
  if (res.code !== 0) {
    ElMessage.error('更新失败')
    row.status = row.status === 1 ? 0 : 1
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>
