<template>
  <div class="page-container">
    <div class="filter-bar">
      <el-select v-model="filter.userId" placeholder="选择员工" clearable style="width: 200px" @change="fetchCalendar">
        <el-option
          v-for="u in staff"
          :key="u.id"
          :label="`${u.name} (${getRoleText(u.role)})`"
          :value="u.id"
        />
      </el-select>
      <el-button type="primary" @click="fetchCalendar">
        <el-icon><Search /></el-icon>
        查询
      </el-button>
    </div>

    <div style="margin-top: 20px;">
      <el-calendar v-model="currentDate">
        <template #date-cell="{ data }">
          <div class="calendar-cell">
            <strong>{{ data.day }}</strong>
            <div v-if="getSchedulesForDate(data.isCurrentMonth, data.date).length > 0">
              <div
                v-for="item in getSchedulesForDate(data.isCurrentMonth, data.date)"
                :key="item.id"
                class="schedule-item"
                :style="{ backgroundColor: getScheduleColor(item.status) }"
              >
                <span v-if="item.timeSlot">{{ item.timeSlot }}</span>
                <span>{{ getScheduleTypeText(item.type) }}</span>
              </div>
            </div>
          </div>
        </template>
      </el-calendar>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import dayjs from 'dayjs'
import { getStaff, getCalendarData } from '@/api'

const staff = ref([])
const schedules = ref([])
const currentDate = ref(new Date())

const filter = reactive({
  userId: ''
})

const getRoleText = (role) => {
  const map = { admin: '管理员', photographer: '摄影师', stylist: '化妆师', staff: '员工' }
  return map[role] || role
}

const getScheduleTypeText = (type) => {
  const map = { shooting: '拍摄', selection: '选片', rest: '休息', other: '其他' }
  return map[type] || type
}

const getScheduleColor = (status) => {
  const map = {
    available: '#67c23a',
    busy: '#f56c6c',
    leave: '#e6a23c'
  }
  return map[status] || '#909399'
}

const getSchedulesForDate = (isCurrentMonth, date) => {
  if (!isCurrentMonth) return []
  const targetDate = dayjs(date).format('YYYY-MM-DD')
  return schedules.value.filter(s => dayjs(s.date).format('YYYY-MM-DD') === targetDate)
}

const fetchStaff = async () => {
  try {
    const data = await getStaff()
    staff.value = data
  } catch (error) {
    console.error(error)
  }
}

const fetchCalendar = async () => {
  try {
    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth() + 1
    const params = { year, month }
    if (filter.userId) {
      params.userId = filter.userId
    }
    const data = await getCalendarData(params)
    schedules.value = data
  } catch (error) {
    console.error(error)
  }
}

watch(currentDate, () => {
  fetchCalendar()
})

onMounted(() => {
  fetchStaff()
  fetchCalendar()
})
</script>
