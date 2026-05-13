<template>
  <div>
    <div class="page-header">
      <div class="page-title">用户管理</div>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增用户
      </el-button>
    </div>

    <div class="search-form">
      <el-input v-model="searchForm.keyword" placeholder="用户名/姓名/手机号" style="width: 200px;" clearable></el-input>
      <el-select v-model="searchForm.status" placeholder="状态" style="width: 120px;" clearable>
        <el-option label="正常" :value="1"></el-option>
        <el-option label="禁用" :value="0"></el-option>
      </el-select>
      <el-button type="primary" @click="loadData">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <div class="table-container">
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="realName" label="姓名"></el-table-column>
        <el-table-column prop="phone" label="手机号"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="roleName" label="角色"></el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleEdit(row)">编辑</el-button>
            <el-button 
              :type="row.status === 1 ? 'danger' : 'success'" 
              size="small" 
              link 
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" size="small" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px" class="form-dialog">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" :disabled="!!form.id"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" show-password></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="form.realName"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="roleId">
          <el-select v-model="form.roleId" placeholder="请选择角色" style="width: 100%;">
            <el-option 
              v-for="role in roles" 
              :key="role.id" 
              :label="role.roleName" 
              :value="role.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserPage, createUser, updateUser, deleteUser, updateUserStatus, getRoles } from '@/api/user'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const formRef = ref()

const searchForm = reactive({
  keyword: '',
  status: null
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const tableData = ref([])
const roles = ref([])

const form = reactive({
  id: null,
  username: '',
  password: '',
  realName: '',
  phone: '',
  email: '',
  roleId: null
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  roleId: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const dialogTitle = computed(() => form.id ? '编辑用户' : '新增用户')

const loadData = async () => {
  loading.value = true
  try {
    const res = await getUserPage({
      pageNum: pagination.current,
      pageSize: pagination.size,
      ...searchForm
    })
    tableData.value = res.data.records || []
    pagination.total = res.data.total || 0
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const loadRoles = async () => {
  try {
    const res = await getRoles()
    roles.value = res.data || []
  } catch (error) {
    console.error(error)
  }
}

const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.status = null
  loadData()
}

const handleAdd = () => {
  Object.assign(form, {
    id: null,
    username: '',
    password: '',
    realName: '',
    phone: '',
    email: '',
    roleId: null
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  Object.assign(form, {
    id: row.id,
    username: row.username,
    password: '',
    realName: row.realName,
    phone: row.phone,
    email: row.email,
    roleId: null
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    if (form.id) {
      await updateUser(form.id, form)
      ElMessage.success('更新成功')
    } else {
      if (!form.password) {
        ElMessage.warning('请输入密码')
        return
      }
      await createUser(form)
      ElMessage.success('创建成功')
    }
    
    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error(error)
  } finally {
    submitLoading.value = false
  }
}

const handleToggleStatus = (row) => {
  ElMessageBox.confirm(`确定要${row.status === 1 ? '禁用' : '启用'}该用户吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    await updateUserStatus(row.id, row.status === 1 ? 0 : 1)
    ElMessage.success('操作成功')
    loadData()
  }).catch(() => {})
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    await deleteUser(row.id)
    ElMessage.success('删除成功')
    loadData()
  }).catch(() => {})
}

onMounted(() => {
  loadData()
  loadRoles()
})
</script>
