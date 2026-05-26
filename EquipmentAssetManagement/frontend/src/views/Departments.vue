<template>
  <div class="departments-page">
    <div class="page-header">
      <h2 class="page-title">部门管理</h2>
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon>
        新增部门
      </el-button>
    </div>

    <el-card class="table-card">
      <el-table :data="departments" v-loading="loading">
        <el-table-column prop="name" label="部门名称" min-width="150" />
        <el-table-column prop="description" label="部门描述" min-width="200" />
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEditDialog(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" link @click="deleteDepartment(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="departmentForm" :rules="rules" ref="departmentFormRef" label-width="100px">
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="departmentForm.name" />
        </el-form-item>
        <el-form-item label="部门描述">
          <el-input v-model="departmentForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveDepartment">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { departments as departmentsApi } from '../api'

const loading = ref(false)
const departments = ref([])

const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const departmentFormRef = ref(null)
const departmentForm = reactive({
  id: null,
  name: '',
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }]
}

const loadDepartments = async () => {
  loading.value = true
  try {
    const res = await departmentsApi.getList()
    if (res.code === 200) {
      departments.value = res.data
    }
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const openAddDialog = () => {
  isEdit.value = false
  dialogTitle.value = '新增部门'
  Object.keys(departmentForm).forEach(key => departmentForm[key] = '')
  dialogVisible.value = true
}

const openEditDialog = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑部门'
  Object.assign(departmentForm, row)
  dialogVisible.value = true
}

const saveDepartment = async () => {
  if (!departmentFormRef.value) return
  await departmentFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        let res
        if (isEdit.value) {
          res = await departmentsApi.update(departmentForm.id, departmentForm)
        } else {
          res = await departmentsApi.create(departmentForm)
        }
        if (res.code === 200) {
          ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
          dialogVisible.value = false
          loadDepartments()
        }
      } catch (error) {
        ElMessage.error(error.message || '保存失败')
      }
    }
  })
}

const deleteDepartment = (row) => {
  ElMessageBox.confirm('确定要删除该部门吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await departmentsApi.delete(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        loadDepartments()
      }
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  loadDepartments()
})
</script>

<style scoped>
.departments-page {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.table-card {
  margin-bottom: 20px;
}
</style>
