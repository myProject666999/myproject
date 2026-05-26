<template>
  <div class="doctor-schedule">
    <el-button @click="router.back()" type="primary" plain style="margin-bottom: 20px;">
      <el-icon><ArrowLeft /></el-icon> 返回
    </el-button>

    <el-card v-if="doctor" class="doctor-card">
      <div class="doctor-header">
        <div class="avatar">👨‍⚕️</div>
        <div class="info">
          <h2>
            {{ doctor.name }}
            <el-tag size="small" type="primary">{{ doctor.title }}</el-tag>
          </h2>
          <p class="dept">{{ doctor.department?.name }}</p>
          <p class="intro">{{ doctor.introduction }}</p>
          <p class="skill">擅长：{{ doctor.skill }}</p>
        </div>
      </div>
    </el-card>

    <h3 class="section-title">排班信息</h3>
    <div class="schedule-list">
      <el-card
        v-for="schedule in schedules"
        :key="schedule.id"
        class="schedule-card"
        :class="{ disabled: schedule.remainingCount <= 0 }"
      >
        <div class="schedule-info">
          <div class="date-info">
            <div class="date">{{ formatDate(schedule.scheduleDate) }}</div>
            <div class="period">
              <el-tag :type="getPeriodType(schedule.timePeriod)">
                {{ schedule.timePeriod }}
              </el-tag>
            </div>
          </div>
          <div class="time">{{ schedule.startTime }} - {{ schedule.endTime }}</div>
          <div class="fee">挂号费：¥{{ schedule.consultFee }}</div>
          <div class="count">
            剩余号源：
            <span :class="{ full: schedule.remainingCount <= 0 }">
              {{ schedule.remainingCount }}/{{ schedule.totalCount }}
            </span>
          </div>
        </div>
        <el-button
          type="primary"
          :disabled="schedule.remainingCount <= 0"
          @click="goToAppointment(schedule.id)"
        >
          {{ schedule.remainingCount > 0 ? '立即预约' : '已约满' }}
        </el-button>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getDoctorById, getSchedules } from '@/api'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const doctor = ref(null)
const schedules = ref([])

const loadData = async () => {
  const id = route.params.id
  try {
    doctor.value = await getDoctorById(id)
    schedules.value = await getSchedules({ doctorId: id })
  } catch (e) {
    ElMessage.error('加载数据失败')
  }
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`
}

const getPeriodType = (period) => {
  const types = { '上午': 'success', '下午': 'warning', '晚上': 'info' }
  return types[period] || ''
}

const goToAppointment = (scheduleId) => {
  router.push(`/appointment/${scheduleId}`)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.doctor-schedule {
  max-width: 1000px;
  margin: 0 auto;
}

.doctor-card {
  margin-bottom: 20px;
}

.doctor-header {
  display: flex;
  gap: 20px;
}

.avatar {
  font-size: 80px;
}

.info h2 {
  margin-bottom: 10px;
}

.dept {
  color: #409eff;
  margin-bottom: 10px;
}

.intro, .skill {
  color: #606266;
  margin-bottom: 5px;
  line-height: 1.6;
}

.section-title {
  font-size: 18px;
  margin-bottom: 15px;
  color: #303133;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.schedule-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.schedule-card.disabled {
  opacity: 0.6;
}

.schedule-info {
  flex: 1;
}

.date-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 8px;
}

.date {
  font-size: 18px;
  font-weight: bold;
}

.time, .fee, .count {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.count .full {
  color: #f56c6c;
  font-weight: bold;
}
</style>
