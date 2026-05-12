<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>患者管理</span>
          <el-button type="primary" @click="openDialog()">
            <el-icon><Plus /></el-icon>新增患者
          </el-button>
        </div>
      </template>

      <div class="search-bar">
        <el-input v-model="searchKeyword" placeholder="搜索患者姓名或电话" clearable style="width: 300px">
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="loadData">搜索</el-button>
      </div>

      <el-table :data="tableData" border stripe>
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">
            {{ row.gender === 1 ? '男' : '女' }}
          </template>
        </el-table-column>
        <el-table-column prop="age" label="年龄" width="80" />
        <el-table-column prop="phone" label="电话" width="150" />
        <el-table-column prop="address" label="住址" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="formData.id ? '编辑患者' : '新增患者'" width="500px">
      <el-form :model="formData" label-width="80px">
        <el-form-item label="姓名">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="formData.gender">
            <el-radio :value="1">男</el-radio>
            <el-radio :value="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="年龄">
          <el-input-number v-model="formData.age" :min="0" :max="150" />
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="formData.phone" />
        </el-form-item>
        <el-form-item label="身份证">
          <el-input v-model="formData.idCard" />
        </el-form-item>
        <el-form-item label="住址">
          <el-input v-model="formData.address" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { patientApi } from '../api'

const searchKeyword = ref('')
const tableData = ref([])
const dialogVisible = ref(false)
const formData = ref({
  id: null,
  name: '',
  gender: 1,
  age: 0,
  phone: '',
  idCard: '',
  address: ''
})

const loadData = async () => {
  const data = await patientApi.list(searchKeyword.value)
  tableData.value = data || []
}

const openDialog = (row = null) => {
  if (row) {
    formData.value = { ...row }
  } else {
    formData.value = {
      id: null,
      name: '',
      gender: 1,
      age: 0,
      phone: '',
      idCard: '',
      address: ''
    }
  }
  dialogVisible.value = true
}

const handleSave = async () => {
  if (!formData.value.name) {
    ElMessage.warning('请输入患者姓名')
    return
  }
  if (formData.value.id) {
    await patientApi.update(formData.value)
    ElMessage.success('更新成功')
  } else {
    await patientApi.save(formData.value)
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
  loadData()
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该患者吗？', '提示', { type: 'warning' }).then(async () => {
    await patientApi.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  }).catch(() => {})
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.page-container { padding-bottom: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.search-bar { margin-bottom: 20px; display: flex; gap: 10px; }
</style>
