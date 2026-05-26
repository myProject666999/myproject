<template>
  <div class="page-container">
    <el-card shadow="never">
      <div class="filter-bar">
        <el-form :inline="true" :model="filter">
          <el-form-item label="关键字">
            <el-input v-model="filter.keyword" placeholder="抬头/税号" clearable style="width: 220px" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadData">查询</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增抬头
        </el-button>
      </div>

      <el-table :data="titles" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="抬头名称" min-width="200" />
        <el-table-column prop="tax_number" label="税号" min-width="200" />
        <el-table-column prop="address" label="地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="phone" label="电话" width="150" />
        <el-table-column prop="bank_account" label="银行账户" min-width="250" show-overflow-tooltip />
        <el-table-column prop="created_at" label="创建时间" width="170">
          <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" :close-on-click-modal="false">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="抬头名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入抬头名称" />
        </el-form-item>
        <el-form-item label="税号" prop="tax_number">
          <el-input v-model="form.tax_number" placeholder="请输入纳税人识别号" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入注册地址(可选)" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入电话(可选)" />
        </el-form-item>
        <el-form-item label="银行账户" prop="bank_account">
          <el-input v-model="form.bank_account" placeholder="请输入开户银行及账号(可选)" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { titleApi } from '../api'

const loading = ref(false)
const titles = ref([])
const filter = ref({ keyword: '' })
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const form = ref({
  id: null,
  name: '',
  tax_number: '',
  address: '',
  phone: '',
  bank_account: ''
})

const rules = {
  name: [{ required: true, message: '请输入抬头名称', trigger: 'blur' }],
  tax_number: [{ required: true, message: '请输入税号', trigger: 'blur' }]
}

const dialogTitle = ref('')

const loadData = async () => {
  loading.value = true
  try {
    const res = await titleApi.list(filter.value.keyword)
    titles.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const resetFilter = () => {
  filter.value = { keyword: '' }
  loadData()
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增抬头'
  form.value = {
    id: null,
    name: '',
    tax_number: '',
    address: '',
    phone: '',
    bank_account: ''
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑抬头'
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除抬头 "${row.name}"？此操作不可恢复。`, '删除确认', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await titleApi.remove(row.id)
      ElMessage.success('删除成功')
      loadData()
    } catch (e) {
      console.error(e)
    }
  }).catch(() => {})
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          await titleApi.update(form.value.id, form.value)
          ElMessage.success('更新成功')
        } else {
          await titleApi.create(form.value)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        loadData()
      } catch (e) {
        console.error(e)
      }
    }
  })
}

const formatDate = (d) => {
  if (!d) return '-'
  return new Date(d).toLocaleString('zh-CN', { hour12: false })
}

onMounted(loadData)
</script>

<style scoped>
.page-container {
  padding: 0;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.filter-bar .el-form {
  margin-bottom: 0;
}
</style>