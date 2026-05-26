<template>
  <div class="appointment-page">
    <el-button @click="router.back()" type="primary" plain style="margin-bottom: 20px;">
      <el-icon><ArrowLeft /></el-icon> 返回
    </el-button>

    <el-card v-if="schedule" class="appointment-card">
      <h3>预约确认</h3>
      <div class="info-row">
        <span class="label">科室：</span>
        <span class="value">{{ schedule.department?.name }}</span>
      </div>
      <div class="info-row">
        <span class="label">医生：</span>
        <span class="value">{{ schedule.doctor?.name }}（{{ schedule.doctor?.title }}）</span>
      </div>
      <div class="info-row">
        <span class="label">日期：</span>
        <span class="value">{{ formatDate(schedule.scheduleDate) }}</span>
      </div>
      <div class="info-row">
        <span class="label">时段：</span>
        <span class="value">{{ schedule.timePeriod }} {{ schedule.startTime }} - {{ schedule.endTime }}</span>
      </div>
      <div class="info-row">
        <span class="label">挂号费：</span>
        <span class="value price">¥{{ schedule.consultFee }}</span>
      </div>
      <div class="info-row">
        <span class="label">剩余号源：</span>
        <span class="value">{{ schedule.remainingCount }}/{{ schedule.totalCount }}</span>
      </div>

      <el-divider />

      <h4>患者信息</h4>
      <el-form :model="form" label-width="80px" style="max-width: 400px;">
        <el-form-item label="姓名" required>
          <el-input v-model="form.patientName" placeholder="请输入患者姓名" />
        </el-form-item>
        <el-form-item label="手机号" required>
          <el-input v-model="form.patientPhone" placeholder="请输入手机号" maxlength="11" />
        </el-form-item>
      </el-form>

      <el-button
        type="primary"
        size="large"
        :loading="submitting"
        @click="submitAppointment"
        style="margin-top: 20px;"
      >
        确认预约
      </el-button>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getScheduleById, createAppointment } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const schedule = ref(null)
const submitting = ref(false)
const form = reactive({
  patientName: '',
  patientPhone: ''
})

const loadData = async () => {
  const id = route.params.scheduleId
  try {
    schedule.value = await getScheduleById(id)
  } catch (e) {
    ElMessage.error('加载排班信息失败')
  }
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`
}

const submitAppointment = async () => {
  if (!form.patientName.trim()) {
    ElMessage.warning('请输入患者姓名')
    return
  }
  if (!/^1[3-9]\d{9}$/.test(form.patientPhone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确认预约 ${schedule.value.doctor?.name} 医生 ${formatDate(schedule.value.scheduleDate)} ${schedule.value.timePeriod} 的号源？`,
      '预约确认',
      { type: 'info' }
    )

    submitting.value = true
    const result = await createAppointment({
      scheduleId: route.params.scheduleId,
      patientName: form.patientName,
      patientPhone: form.patientPhone
    })

    ElMessage.success('预约成功！')
    localStorage.setItem('currentPatientId', result.patientId)
    router.push('/my-appointments')
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error(e.message || '预约失败')
    }
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.appointment-page {
  max-width: 800px;
  margin: 0 auto;
}

.appointment-card h3 {
  margin-bottom: 20px;
  color: #303133;
}

.info-row {
  display: flex;
  margin-bottom: 12px;
  font-size: 14px;
}

.label {
  width: 100px;
  color: #909399;
}

.value {
  flex: 1;
  color: #303133;
}

.value.price {
  color: #f56c6c;
  font-weight: bold;
  font-size: 18px;
}
</style>
