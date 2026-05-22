<template>
  <div class="today-page">
    <div class="page-header">
      <h2>今日用药</h2>
      <span class="date">{{ todayStr }}</span>
    </div>

    <div v-if="lowStockList.length > 0" class="alert-banner">
      <el-alert
        v-for="(item, idx) in lowStockList.slice(0, 3)"
        :key="idx"
        :title="`${item.medicineName} 库存不足：剩余 ${item.quantity}${item.unit}`"
        type="warning"
        show-icon
        :closable="false"
        class="alert-item"
      />
    </div>

    <div v-if="loading" class="loading">
      <el-skeleton :rows="5" animated />
    </div>

    <div v-else-if="schedules.length === 0" class="empty">
      <el-empty description="今日暂无用药计划" />
    </div>

    <div v-else class="schedule-list">
      <el-card
        v-for="(item, idx) in groupedSchedules"
        :key="idx"
        class="schedule-card"
        :class="{ 'is-past': isPast(item.time) }"
      >
        <div class="card-header">
          <el-tag :type="getTimeStatus(item.time)" effect="dark" size="large">
            <el-icon><Clock /></el-icon>
            {{ item.time }}
          </el-tag>
          <span class="user-name">{{ item.userName }}</span>
        </div>
        <div class="card-body">
          <div class="medicine-info">
            <span class="medicine-name">{{ item.medicineName }}</span>
            <span class="specification">{{ item.specification }}</span>
          </div>
          <div class="dosage">
            <el-icon><MedicineBox /></el-icon>
            <span>{{ item.dosage }}</span>
          </div>
          <div class="frequency">
            <el-tag type="info" size="small">{{ item.frequencyDesc }}</el-tag>
          </div>
        </div>
        <div class="card-footer">
          <el-button
            v-if="!isPast(item.time)"
            type="success"
            size="small"
            @click="markTaken(item)"
          >
            <el-icon><Check /></el-icon>
            标记已服药
          </el-button>
          <el-button
            v-else
            type="info"
            size="small"
            disabled
          >
            已过时间
          </el-button>
          <span v-if="item.remark" class="remark">备注：{{ item.remark }}</span>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { getTodaySchedulesByUser } from '@/api/schedule'
import { getLowStockByUser } from '@/api/inventory'
import { ElMessage } from 'element-plus'

const props = defineProps({
  userId: { type: Number, default: 1 }
})

const loading = ref(false)
const schedules = ref([])
const lowStockList = ref([])

const todayStr = computed(() => {
  const now = new Date()
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${weekDays[now.getDay()]}`
})

const groupedSchedules = computed(() => {
  const list = []
  schedules.value.forEach(schedule => {
    if (schedule.timeSlots) {
      schedule.timeSlots.split(',').forEach(time => {
        list.push({
          ...schedule,
          time: time.trim()
        })
      })
    }
  })
  return list.sort((a, b) => a.time.localeCompare(b.time))
})

const isPast = (time) => {
  const now = new Date()
  const [h, m] = time.split(':').map(Number)
  const scheduleTime = new Date()
  scheduleTime.setHours(h, m, 0, 0)
  return now > scheduleTime
}

const getTimeStatus = (time) => {
  if (isPast(time)) return 'info'
  const now = new Date()
  const [h, m] = time.split(':').map(Number)
  const scheduleTime = new Date()
  scheduleTime.setHours(h, m, 0, 0)
  const diff = scheduleTime - now
  if (diff < 30 * 60 * 1000) return 'warning'
  return 'success'
}

const markTaken = (item) => {
  ElMessage.success(`已标记 ${item.medicineName} 为已服药`)
}

const handleUserChange = (e) => {
  fetchData(e.detail.userId)
}

const fetchData = async (userId) => {
  loading.value = true
  try {
    const [scheduleRes, stockRes] = await Promise.all([
      getTodaySchedulesByUser(userId || props.userId),
      getLowStockByUser(userId || props.userId)
    ])
    schedules.value = scheduleRes.data || []
    lowStockList.value = stockRes.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData(props.userId)
  window.addEventListener('user-change', handleUserChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('user-change', handleUserChange)
})
</script>

<style scoped>
.today-page {
  max-width: 900px;
}
.page-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 20px;
}
.page-header h2 {
  color: #303133;
  margin: 0;
}
.date {
  color: #909399;
  font-size: 14px;
}
.alert-banner {
  margin-bottom: 16px;
}
.alert-item {
  margin-bottom: 8px;
}
.loading {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
}
.empty {
  background: #fff;
  padding: 60px 0;
  border-radius: 8px;
}
.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.schedule-card {
  transition: all 0.3s;
}
.schedule-card.is-past {
  opacity: 0.65;
}
.schedule-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.card-header .el-tag {
  font-size: 16px;
  padding: 4px 12px;
}
.user-name {
  color: #909399;
  font-size: 13px;
}
.card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.medicine-info {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.medicine-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}
.specification {
  color: #909399;
  font-size: 13px;
}
.dosage {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #606266;
  font-size: 15px;
}
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}
.remark {
  color: #909399;
  font-size: 12px;
}
</style>
