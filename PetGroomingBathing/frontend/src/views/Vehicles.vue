<template>
  <div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 20px">
      <h2>车辆调度管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增车辆
      </el-button>
    </div>

    <el-form :inline="true" style="margin-bottom: 20px">
      <el-form-item label="车辆状态">
        <el-select v-model="filterStatus" placeholder="全部状态" clearable style="width: 150px" @change="loadVehicles">
          <el-option label="空闲" value="idle" />
          <el-option label="行驶中" value="travelling" />
          <el-option label="维修中" value="maintenance" />
        </el-select>
      </el-form-item>
    </el-form>

    <el-table :data="vehicles" border stripe>
      <el-table-column prop="plateNumber" label="车牌号" width="120" />
      <el-table-column prop="model" label="车型" width="150" />
      <el-table-column prop="color" label="颜色" width="100" />
      <el-table-column prop="driverName" label="司机" width="120" />
      <el-table-column prop="driverPhone" label="司机电话" width="130" />
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.status)">
            {{ getStatusLabel(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="currentLocation" label="当前位置" />
      <el-table-column label="油量" width="100">
        <template #default="scope">
          <el-progress :percentage="scope.row.fuelLevel" :stroke-width="10" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="scope">
          <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑车辆' : '新增车辆'"
      width="600px"
    >
      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="车牌号" prop="plateNumber">
              <el-input v-model="form.plateNumber" placeholder="请输入车牌号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="车型" prop="model">
              <el-input v-model="form.model" placeholder="请输入车型" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="颜色">
              <el-input v-model="form.color" placeholder="请输入颜色" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="空闲" value="idle" />
                <el-option label="行驶中" value="travelling" />
                <el-option label="维修中" value="maintenance" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="司机姓名">
              <el-input v-model="form.driverName" placeholder="请输入司机姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="司机电话">
              <el-input v-model="form.driverPhone" placeholder="请输入司机电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="当前位置">
              <el-input v-model="form.currentLocation" placeholder="请输入当前位置" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="油量">
              <el-slider v-model="form.fuelLevel" :min="0" :max="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="form.notes" type="textarea" :rows="2" placeholder="备注信息" />
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '@/api/vehicle'

const vehicles = ref([])
const filterStatus = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const form = reactive({
  id: '',
  plateNumber: '',
  model: '',
  color: '',
  driverName: '',
  driverPhone: '',
  status: 'idle',
  currentLocation: '',
  fuelLevel: 100,
  notes: ''
})

const rules = {
  plateNumber: [{ required: true, message: '请输入车牌号', trigger: 'blur' }],
  model: [{ required: true, message: '请输入车型', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const getStatusLabel = (status) => {
  const map = { idle: '空闲', travelling: '行驶中', maintenance: '维修中' }
  return map[status] || status
}

const getStatusTagType = (status) => {
  const map = { idle: 'success', travelling: 'primary', maintenance: 'danger' }
  return map[status] || 'info'
}

const resetForm = () => {
  Object.assign(form, {
    id: '',
    plateNumber: '',
    model: '',
    color: '',
    driverName: '',
    driverPhone: '',
    status: 'idle',
    currentLocation: '',
    fuelLevel: 100,
    notes: ''
  })
}

const loadVehicles = async () => {
  const data = await getVehicles(filterStatus.value || undefined)
  vehicles.value = data
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该车辆吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteVehicle(row.id)
    ElMessage.success('删除成功')
    loadVehicles()
  }).catch(() => {})
}

const submitForm = async () => {
  await formRef.value.validate()
  if (isEdit.value) {
    await updateVehicle(form.id, form)
    ElMessage.success('更新成功')
  } else {
    await createVehicle(form)
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
  loadVehicles()
}

onMounted(() => {
  loadVehicles()
})
</script>
