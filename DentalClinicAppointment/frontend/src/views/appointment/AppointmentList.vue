<template>
  <div class="appointment-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>预约管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新建预约
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 150px">
            <el-option label="待确认" value="PENDING" />
            <el-option label="已确认" value="CONFIRMED" />
            <el-option label="已完成" value="COMPLETED" />
            <el-option label="已取消" value="CANCELLED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="appointmentNo" label="预约号" width="150" />
        <el-table-column prop="patientId" label="患者ID" width="80" />
        <el-table-column prop="doctorId" label="医生ID" width="80" />
        <el-table-column prop="appointmentDate" label="预约日期" width="120" />
        <el-table-column prop="appointmentTime" label="预约时间" width="100" />
        <el-table-column prop="serviceType" label="服务类型" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)" :disabled="scope.row.status !== 'PENDING'">编辑</el-button>
            <el-button type="danger" link @click="handleCancel(scope.row)" :disabled="scope.row.status === 'CANCELLED'">取消</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="患者" prop="patientId">
          <el-select v-model="form.patientId" placeholder="请选择患者" filterable style="width: 100%">
            <el-option v-for="patient in patients" :key="patient.id" :label="patient.name" :value="patient.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="医生" prop="doctorId">
          <el-select v-model="form.doctorId" placeholder="请选择医生" style="width: 100%" @change="handleDoctorChange">
            <el-option v-for="doctor in doctors" :key="doctor.id" :label="doctor.name" :value="doctor.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="排班" prop="scheduleId">
          <el-select v-model="form.scheduleId" placeholder="请选择排班" style="width: 100%" :disabled="!form.doctorId || !form.appointmentDate">
            <el-option
              v-for="schedule in schedules"
              :key="schedule.id"
              :label="`${schedule.startTime}-${schedule.endTime} (余${schedule.totalSlots - schedule.bookedSlots}号)`"
              :value="schedule.id"
              :disabled="schedule.bookedSlots >= schedule.totalSlots"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="预约日期" prop="appointmentDate">
          <el-date-picker
            v-model="form.appointmentDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
            @change="loadSchedules"
          />
        </el-form-item>
        <el-form-item label="预约时间" prop="appointmentTime">
          <el-time-picker
            v-model="form.appointmentTime"
            placeholder="选择时间"
            style="width: 100%"
            value-format="HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="服务类型" prop="serviceType">
          <el-select v-model="form.serviceType" placeholder="请选择服务类型" style="width: 100%">
            <el-option label="初诊检查" value="初诊检查" />
            <el-option label="洗牙" value="洗牙" />
            <el-option label="补牙" value="补牙" />
            <el-option label="根管治疗" value="根管治疗" />
            <el-option label="拔牙" value="拔牙" />
            <el-option label="种植牙" value="种植牙" />
            <el-option label="正畸" value="正畸" />
            <el-option label="修复" value="修复" />
            <el-option label="复诊" value="复诊" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入预约描述"
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
import { getAppointments, createAppointment, updateAppointment, cancelAppointment, getPatients, getDoctors, getDoctorSchedules } from '../../api'
import { useUserStore } from '../../store/user'
import dayjs from 'dayjs'

const userStore = useUserStore()
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新建预约')
const isEdit = ref(false)
const formRef = ref()

const searchForm = reactive({
  status: ''
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const tableData = ref([])
const patients = ref([])
const doctors = ref([])
const schedules = ref([])

const form = reactive({
  id: null,
  patientId: null,
  doctorId: null,
  scheduleId: null,
  clinicId: userStore.clinicId ? parseInt(userStore.clinicId) : 1,
  appointmentDate: '',
  appointmentTime: '',
  serviceType: '',
  description: ''
})

const rules = {
  patientId: [{ required: true, message: '请选择患者', trigger: 'change' }],
  doctorId: [{ required: true, message: '请选择医生', trigger: 'change' }],
  scheduleId: [{ required: true, message: '请选择排班', trigger: 'change' }],
  appointmentDate: [{ required: true, message: '请选择预约日期', trigger: 'change' }],
  appointmentTime: [{ required: true, message: '请选择预约时间', trigger: 'change' }],
  serviceType: [{ required: true, message: '请选择服务类型', trigger: 'change' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      current: pagination.current,
      size: pagination.size,
      status: searchForm.status,
      clinicId: userStore.clinicId ? parseInt(userStore.clinicId) : 1
    }
    const res = await getAppointments(params)
    tableData.value = res.data.records
    pagination.total = res.data.total
  } finally {
    loading.value = false
  }
}

const loadPatients = async () => {
  try {
    const res = await getPatients({ current: 1, size: 1000, clinicId: userStore.clinicId ? parseInt(userStore.clinicId) : 1 })
    patients.value = res.data.records
  } catch (e) {
    console.error(e)
  }
}

const loadDoctors = async () => {
  try {
    const res = await getDoctors(userStore.clinicId ? parseInt(userStore.clinicId) : 1)
    doctors.value = res.data
  } catch (e) {
    console.error(e)
  }
}

const loadSchedules = async () => {
  if (!form.doctorId || !form.appointmentDate) {
    schedules.value = []
    return
  }
  try {
    const res = await getDoctorSchedules(form.doctorId, form.appointmentDate)
    schedules.value = res.data || []
  } catch (e) {
    console.error(e)
    schedules.value = []
  }
}

const resetSearch = () => {
  searchForm.status = ''
  pagination.current = 1
  loadData()
}

const handleDoctorChange = () => {
  form.scheduleId = null
  loadSchedules()
}

const handleAdd = () => {
  dialogTitle.value = '新建预约'
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑预约'
  isEdit.value = true
  Object.assign(form, row)
  form.appointmentDate = dayjs(row.appointmentDate).format('YYYY-MM-DD')
  form.appointmentTime = row.appointmentTime
  dialogVisible.value = true
}

const handleCancel = async (row) => {
  await ElMessageBox.confirm('确定要取消该预约吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  await cancelAppointment(row.id)
  ElMessage.success('取消成功')
  loadData()
}

const resetForm = () => {
  Object.assign(form, {
    id: null,
    patientId: null,
    doctorId: null,
    scheduleId: null,
    clinicId: userStore.clinicId ? parseInt(userStore.clinicId) : 1,
    appointmentDate: '',
    appointmentTime: '',
    serviceType: '',
    description: ''
  })
  schedules.value = []
}

const handleSubmit = async () => {
  await formRef.value.validate()
  if (isEdit.value) {
    await updateAppointment(form)
    ElMessage.success('更新成功')
  } else {
    await createAppointment(form)
    ElMessage.success('预约成功')
  }
  dialogVisible.value = false
  loadData()
}

const getStatusType = (status) => {
  const map = {
    PENDING: 'warning',
    CONFIRMED: 'primary',
    COMPLETED: 'success',
    CANCELLED: 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    PENDING: '待确认',
    CONFIRMED: '已确认',
    COMPLETED: '已完成',
    CANCELLED: '已取消'
  }
  return map[status] || status
}

onMounted(() => {
  loadData()
  loadPatients()
  loadDoctors()
})
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
