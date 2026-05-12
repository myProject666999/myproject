<template>
  <div>
    <h2 class="mb-20">打卡签到</h2>

    <el-card>
      <div class="clock-section">
        <div class="clock-display">
          <div class="time">{{ currentTime }}</div>
          <div class="date">{{ currentDate }}</div>
        </div>

        <div class="clock-actions">
          <el-select v-model="selectedOrder" placeholder="请选择订单" style="width: 250px; margin-right: 20px">
            <el-option v-for="order in orders" :key="order.id" :label="order.order_no" :value="order.id" />
          </el-select>

          <el-button type="primary" size="large" @click="handleCheckIn" :disabled="!selectedOrder || hasCheckedIn">
            <el-icon><Plus /></el-icon>
            签到
          </el-button>
          <el-button type="success" size="large" @click="handleCheckOut" :disabled="!selectedOrder || !hasCheckedIn">
            <el-icon><Check /></el-icon>
            签退
          </el-button>
        </div>

        <div class="today-status" v-if="todayAttendance">
          <el-tag :type="todayAttendance.status === 'checked_out' ? 'success' : 'primary'">
            {{ todayAttendance.status === 'checked_out' ? '已完成打卡' : '已签到，待签退' }}
          </el-tag>
          <div class="time-info">
            <span>签到时间: {{ formatTime(todayAttendance.check_in) }}</span>
            <span v-if="todayAttendance.check_out">签退时间: {{ formatTime(todayAttendance.check_out) }}</span>
          </div>
        </div>
      </div>

      <el-divider />

      <h3>打卡记录</h3>
      <el-table :data="attendanceList">
        <el-table-column label="日期">
          <template #default="{ row }">
            {{ formatDate(row.date) }}
          </template>
        </el-table-column>
        <el-table-column label="订单ID" prop="order_id" />
        <el-table-column label="签到时间">
          <template #default="{ row }">
            {{ formatTime(row.check_in) }}
          </template>
        </el-table-column>
        <el-table-column label="签退时间">
          <template #default="{ row }">
            {{ formatTime(row.check_out) || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="地点" prop="location" />
        <el-table-column label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 'checked_out' ? 'success' : 'primary'">
              {{ row.status === 'checked_out' ? '已完成' : '进行中' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getMyOrders, getAttendance, checkIn, checkOut } from '@/api'

const currentTime = ref('')
const currentDate = ref('')
const selectedOrder = ref(null)
const orders = ref([])
const attendanceList = ref([])
const todayAttendance = ref(null)
const hasCheckedIn = ref(false)
let timer = null

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString()
  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

const loadOrders = async () => {
  try {
    const res = await getMyOrders()
    orders.value = res.data.filter(o => o.status === 'active')
  } catch (error) {
    console.error(error)
  }
}

const loadAttendance = async () => {
  try {
    const res = await getAttendance()
    attendanceList.value = res.data

    const today = new Date().toDateString()
    todayAttendance.value = attendanceList.value.find(a =>
      new Date(a.date).toDateString() === today
    )
    hasCheckedIn.value = !!todayAttendance.value?.check_in
  } catch (error) {
    console.error(error)
  }
}

const handleCheckIn = async () => {
  try {
    await checkIn({ order_id: selectedOrder.value, location: '客户家中' })
    ElMessage.success('签到成功')
    loadAttendance()
  } catch (error) {
    console.error(error)
  }
}

const handleCheckOut = async () => {
  try {
    await checkOut({ order_id: selectedOrder.value })
    ElMessage.success('签退成功')
    loadAttendance()
  } catch (error) {
    console.error(error)
  }
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleTimeString()
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString()
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
  loadOrders()
  loadAttendance()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.clock-section {
  text-align: center;
  padding: 30px 0;
}

.clock-display {
  margin-bottom: 30px;
}

.time {
  font-size: 48px;
  font-weight: bold;
  color: #409eff;
}

.date {
  font-size: 16px;
  color: #909399;
  margin-top: 10px;
}

.clock-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.today-status {
  margin-top: 30px;
}

.today-status .el-tag {
  font-size: 16px;
  padding: 8px 20px;
}

.time-info {
  margin-top: 15px;
  color: #606266;
}

.time-info span {
  margin: 0 20px;
}
</style>
