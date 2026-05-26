<template>
  <div class="my-appointments">
    <h2 class="page-title">我的预约</h2>

    <el-card v-if="!patientId" class="login-card">
      <h4>请输入手机号查询预约记录</h4>
      <el-input
        v-model="searchPhone"
        placeholder="请输入手机号"
        maxlength="11"
        style="width: 300px; margin-right: 10px;"
      />
      <el-button type="primary" @click="searchAppointments">查询</el-button>
    </el-card>

    <div v-else>
      <el-button @click="patientId = null" style="margin-bottom: 20px;">
        <el-icon><Refresh /></el-icon> 切换手机号
      </el-button>

      <el-table :data="appointments" style="width: 100%;" v-loading="loading">
        <el-table-column prop="appointmentNo" label="预约单号" width="200" />
        <el-table-column label="科室" prop="department.name" />
        <el-table-column label="医生">
          <template #default="{ row }">
            {{ row.doctor?.name }}（{{ row.doctor?.title }}）
          </template>
        </el-table-column>
        <el-table-column prop="scheduleDate" label="日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.scheduleDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="timePeriod" label="时段" width="80" />
        <el-table-column prop="queueNumber" label="排队号" width="80" />
        <el-table-column prop="consultFee" label="挂号费" width="100">
          <template #default="{ row }">
            ¥{{ row.consultFee }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 1"
              type="danger"
              size="small"
              @click="cancelAppointment(row)"
            >
              取消预约
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && appointments.length === 0" description="暂无预约记录" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAppointmentsByPatient, cancelAppointment as cancelApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const patientId = ref(null)
const searchPhone = ref('')
const appointments = ref([])
const loading = ref(false)

const getStatusType = (status) => {
  const types = { 1: 'primary', 2: 'success', 3: 'info', 4: 'danger' }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = { 1: '待就诊', 2: '已就诊', 3: '已取消', 4: '已爽约' }
  return texts[status] || '未知'
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const searchAppointments = async () => {
  if (!/^1[3-9]\d{9}$/.test(searchPhone.value)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }

  const savedId = localStorage.getItem('patientId_' + searchPhone.value)
  if (savedId) {
    patientId.value = savedId
    loadAppointments()
  } else {
    ElMessage.warning('未找到该手机号的预约记录，请先进行预约')
  }
}

const loadAppointments = async () => {
  if (!patientId.value) return
  loading.value = true
  try {
    appointments.value = await getAppointmentsByPatient(patientId.value)
  } catch (e) {
    ElMessage.error('加载预约记录失败')
  } finally {
    loading.value = false
  }
}

const cancelAppointment = async (row) => {
  try {
    await ElMessageBox.confirm('确定要取消该预约吗？', '取消确认', { type: 'warning' })
    await cancelApi(row.id, '用户主动取消')
    ElMessage.success('取消成功')
    loadAppointments()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error(e.message || '取消失败')
    }
  }
}

onMounted(() => {
  const savedPatientId = localStorage.getItem('currentPatientId')
  if (savedPatientId) {
    patientId.value = savedPatientId
    loadAppointments()
  }
})
</script>

<style scoped>
.my-appointments {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #303133;
}

.login-card {
  padding: 30px;
  text-align: center;
}

.login-card h4 {
  margin-bottom: 20px;
}
</style>
