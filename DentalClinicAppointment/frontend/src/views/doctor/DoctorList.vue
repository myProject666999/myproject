<template>
  <div class="doctor-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>医生管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新增医生
          </el-button>
        </div>
      </template>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column label="头像" width="80">
          <template #default="scope">
            <el-avatar :src="scope.row.avatar" size="small">
              <el-icon><User /></el-icon>
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="title" label="职称" width="120" />
        <el-table-column prop="specialty" label="专长" show-overflow-tooltip />
        <el-table-column prop="licenseNumber" label="执业证号" width="150" />
        <el-table-column prop="phone" label="电话" width="140" />
        <el-table-column prop="sortOrder" label="排序" width="80" />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="职称" prop="title">
          <el-input v-model="form.title" placeholder="请输入职称" />
        </el-form-item>
        <el-form-item label="专长" prop="specialty">
          <el-input v-model="form.specialty" placeholder="请输入专长" />
        </el-form-item>
        <el-form-item label="执业证号" prop="licenseNumber">
          <el-input v-model="form.licenseNumber" placeholder="请输入执业证号" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入电话" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="简介">
          <el-input
            v-model="form.introduction"
            type="textarea"
            :rows="3"
            placeholder="请输入简介"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDoctors, createDoctor, updateDoctor, deleteDoctor } from '../../api'
import { useUserStore } from '../../store/user'

const userStore = useUserStore()
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增医生')
const isEdit = ref(false)
const formRef = ref()

const tableData = ref([])

const form = reactive({
  id: null,
  name: '',
  title: '',
  specialty: '',
  licenseNumber: '',
  phone: '',
  sortOrder: 0,
  status: 1,
  introduction: '',
  clinicId: userStore.clinicId ? parseInt(userStore.clinicId) : 1
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  title: [{ required: true, message: '请输入职称', trigger: 'blur' }],
  specialty: [{ required: true, message: '请输入专长', trigger: 'blur' }],
  licenseNumber: [{ required: true, message: '请输入执业证号', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入电话', trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getDoctors(userStore.clinicId ? parseInt(userStore.clinicId) : 1)
    tableData.value = res.data
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  dialogTitle.value = '新增医生'
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑医生'
  isEdit.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除该医生吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  await deleteDoctor(row.id)
  ElMessage.success('删除成功')
  loadData()
}

const resetForm = () => {
  Object.assign(form, {
    id: null,
    name: '',
    title: '',
    specialty: '',
    licenseNumber: '',
    phone: '',
    sortOrder: 0,
    status: 1,
    introduction: '',
    clinicId: userStore.clinicId ? parseInt(userStore.clinicId) : 1
  })
}

const handleSubmit = async () => {
  await formRef.value.validate()
  if (isEdit.value) {
    await updateDoctor(form)
    ElMessage.success('更新成功')
  } else {
    await createDoctor(form)
    ElMessage.success('创建成功')
  }
  dialogVisible.value = false
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
