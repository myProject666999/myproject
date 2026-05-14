<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>票种管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增票种
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="票种名称">
          <el-input v-model="searchForm.name" placeholder="请输入名称" clearable />
        </el-form-item>
        <el-form-item label="票种类型">
          <el-select v-model="searchForm.type" placeholder="请选择类型" clearable>
            <el-option label="半日票" value="half_day" />
            <el-option label="全日票" value="full_day" />
            <el-option label="夜场票" value="night" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="票种名称" />
        <el-table-column prop="type" label="票种类型">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)">{{ getTypeName(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="票价(元)" width="120">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: bold">¥{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="validTime" label="有效时间" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '在售' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="mt-20"
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        background
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="票种名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入票种名称" />
        </el-form-item>
        <el-form-item label="票种类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择票种类型" style="width: 100%">
            <el-option label="半日票" value="half_day" />
            <el-option label="全日票" value="full_day" />
            <el-option label="夜场票" value="night" />
          </el-select>
        </el-form-item>
        <el-form-item label="票价" prop="price">
          <el-input-number v-model="formData.price" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="有效时间">
          <el-input v-model="formData.validTime" placeholder="请输入有效时间段" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增票种')
const formRef = ref(null)

const searchForm = reactive({
  name: '',
  type: ''
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([
  { id: 1, name: '周末半日票', type: 'half_day', price: 158, validTime: '周末 08:00-12:00/13:00-17:00', status: 1 },
  { id: 2, name: '平日全日票', type: 'full_day', price: 288, validTime: '周一至周五 08:00-17:00', status: 1 },
  { id: 3, name: '周末全日票', type: 'full_day', price: 388, validTime: '周六周日 08:00-17:00', status: 1 },
  { id: 4, name: '节日全日票', type: 'full_day', price: 488, validTime: '节假日 08:00-17:00', status: 1 },
  { id: 5, name: '夜场票', type: 'night', price: 98, validTime: '18:00-22:00', status: 1 }
])

const formData = reactive({
  id: null,
  name: '',
  type: '',
  price: 0,
  validTime: '',
  status: 1,
  description: ''
})

const formRules = {
  name: [{ required: true, message: '请输入票种名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择票种类型', trigger: 'change' }],
  price: [{ required: true, message: '请输入票价', trigger: 'blur' }]
}

const getTypeName = (type) => {
  const map = { half_day: '半日票', full_day: '全日票', night: '夜场票' }
  return map[type] || type
}

const getTypeTag = (type) => {
  const map = { half_day: 'success', full_day: 'primary', night: 'warning' }
  return map[type] || 'info'
}

const handleSearch = () => {
  ElMessage.success('查询成功')
}

const resetSearch = () => {
  searchForm.name = ''
  searchForm.type = ''
  handleSearch()
}

const handleAdd = () => {
  dialogTitle.value = '新增票种'
  Object.assign(formData, { id: null, name: '', type: '', price: 0, validTime: '', status: 1, description: '' })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑票种'
  Object.assign(formData, row)
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该票种吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = tableData.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      tableData.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (formData.id) {
        const index = tableData.value.findIndex(item => item.id === formData.id)
        if (index > -1) {
          tableData.value[index] = { ...formData }
        }
      } else {
        tableData.value.push({ ...formData, id: tableData.value.length + 1 })
      }
      dialogVisible.value = false
      ElMessage.success('操作成功')
    }
  })
}
</script>
