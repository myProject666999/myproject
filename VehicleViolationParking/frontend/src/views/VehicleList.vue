<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">车辆管理</h2>
      <el-button type="primary" :icon="Plus" @click="handleAdd">新增车辆</el-button>
    </div>

    <div class="search-bar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="车牌号">
          <el-input v-model="searchForm.plate_number" placeholder="请输入车牌号" clearable @clear="fetchList" />
        </el-form-item>
        <el-form-item label="卡片类型">
          <el-select v-model="searchForm.card_type" placeholder="全部" clearable @change="fetchList">
            <el-option label="临时车" :value="1" />
            <el-option label="月卡车" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable @change="fetchList">
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="fetchList">查询</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table :data="tableData" stripe style="width: 100%" v-loading="loading">
      <el-table-column prop="plate_number" label="车牌号" width="120" />
      <el-table-column label="车辆类型" width="100">
        <template #default="{ row }">
          <el-tag :type="row.vehicle_type === 1 ? 'info' : row.vehicle_type === 2 ? 'warning' : 'danger'">
            {{ row.vehicle_type === 1 ? '小型车' : row.vehicle_type === 2 ? '中型车' : '大型车' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="owner_name" label="车主姓名" width="100" />
      <el-table-column prop="owner_phone" label="联系电话" width="130" />
      <el-table-column label="卡片类型" width="100">
        <template #default="{ row }">
          <el-tag :type="row.card_type === 2 ? 'success' : 'info'">
            {{ row.card_type === 2 ? '月卡车' : '临时车' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="月卡到期" width="120">
        <template #default="{ row }">
          {{ row.card_expire_time ? formatDateDisplay(row.card_expire_time) : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.page_size"
      :page-sizes="[10, 20, 50]"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="fetchList"
      @current-change="fetchList"
      style="margin-top: 20px; justify-content: flex-end"
    />

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="车牌号" prop="plate_number">
          <el-input v-model="form.plate_number" placeholder="请输入车牌号" />
        </el-form-item>
        <el-form-item label="车辆类型" prop="vehicle_type">
          <el-select v-model="form.vehicle_type">
            <el-option label="小型车" :value="1" />
            <el-option label="中型车" :value="2" />
            <el-option label="大型车" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="车主姓名">
          <el-input v-model="form.owner_name" placeholder="请输入车主姓名" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.owner_phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="卡片类型" prop="card_type">
          <el-select v-model="form.card_type">
            <el-option label="临时车" :value="1" />
            <el-option label="月卡车" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="月卡到期">
          <el-date-picker
            v-model="form.card_expire_time"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="2">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getVehicleList,
  createVehicle,
  updateVehicle,
  deleteVehicle
} from '@/api'

const loading = ref(false)
const tableData = ref([])
const pagination = reactive({
  page: 1,
  page_size: 10,
  total: 0
})

const searchForm = reactive({
  plate_number: '',
  card_type: '',
  status: ''
})

const dialogVisible = ref(false)
const dialogTitle = ref('新增车辆')
const submitting = ref(false)
const formRef = ref(null)
const isEdit = ref(false)
const editId = ref(null)

const form = reactive({
  plate_number: '',
  vehicle_type: 1,
  owner_name: '',
  owner_phone: '',
  card_type: 1,
  card_expire_time: '',
  status: 1,
  remark: ''
})

const rules = {
  plate_number: [{ required: true, message: '请输入车牌号', trigger: 'blur' }],
  vehicle_type: [{ required: true, message: '请选择车辆类型', trigger: 'change' }],
  card_type: [{ required: true, message: '请选择卡片类型', trigger: 'change' }]
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatDateDisplay = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('zh-CN')
}

const fetchList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      page_size: pagination.page_size,
      ...searchForm
    }
    const res = await getVehicleList(params)
    if (res.code === 0) {
      tableData.value = res.data.list || []
      pagination.total = res.data.total || 0
    }
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchForm.plate_number = ''
  searchForm.card_type = ''
  searchForm.status = ''
  pagination.page = 1
  fetchList()
}

const resetForm = () => {
  Object.assign(form, {
    plate_number: '',
    vehicle_type: 1,
    owner_name: '',
    owner_phone: '',
    card_type: 1,
    card_expire_time: '',
    status: 1,
    remark: ''
  })
  formRef.value?.resetFields()
}

const handleAdd = () => {
  isEdit.value = false
  editId.value = null
  dialogTitle.value = '新增车辆'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  editId.value = row.id
  dialogTitle.value = '编辑车辆'
  Object.assign(form, {
    plate_number: row.plate_number,
    vehicle_type: row.vehicle_type,
    owner_name: row.owner_name || '',
    owner_phone: row.owner_phone || '',
    card_type: row.card_type,
    card_expire_time: row.card_expire_time ? formatDate(row.card_expire_time) : '',
    status: row.status,
    remark: row.remark || ''
  })
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除车辆 ${row.plate_number} 吗？`, '提示', {
      type: 'warning'
    })
    const res = await deleteVehicle(row.id)
    if (res.code === 0) {
      ElMessage.success('删除成功')
      fetchList()
    }
  } catch {}
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        let res
        const submitData = { ...form }
        if (!submitData.card_expire_time) {
          delete submitData.card_expire_time
        }
        
        if (isEdit.value) {
          res = await updateVehicle(editId.value, submitData)
        } else {
          res = await createVehicle(submitData)
        }
        
        if (res.code === 0) {
          ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
          dialogVisible.value = false
          fetchList()
        }
      } finally {
        submitting.value = false
      }
    }
  })
}

onMounted(() => {
  fetchList()
})
</script>
