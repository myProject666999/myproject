
<template>
  <div class="page-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: bold;">技师排班管理</span>
              <div>
                <el-button icon="ArrowLeft" @click="prevWeek">上一周</el-button>
                <el-date-picker
                  v-model="currentDate"
                  type="date"
                  placeholder="选择日期"
                  value-format="YYYY-MM-DD"
                  style="width: 150px; margin: 0 10px;"
                />
                <el-button icon="ArrowRight" @click="nextWeek">下一周</el-button>
                <el-button type="success" icon="Plus" style="margin-left: 20px;">新增排班</el-button>
              </div>
            </div>
          </template>
          <el-table :data="scheduleData" border>
            <el-table-column label="技师" width="120" fixed="left">
              <template #default="{ row }">
                <div style="font-weight: bold;">{{ row.technicianName }}</div>
                <div style="font-size: 12px; color: #909399;">{{ row.level }}</div>
              </template>
            </el-table-column>
            <el-table-column
              v-for="day in weekDays"
              :key="day.date"
              :label="`${day.weekday} ${day.date.slice(5)}`"
              align="center"
              min-width="100"
            >
              <template #default="{ row }">
                <div v-for="slot in row[day.date]" :key="slot.time">
                  <el-tag :type="slot.status === 1 ? 'success' : 'info'" size="small" style="margin-bottom: 5px; display: block;">
                    {{ slot.time }} - {{ slot.status === 1 ? '上班' : '休息' }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import dayjs from 'dayjs'

const currentDate = ref(dayjs().format('YYYY-MM-DD'))

const weekDays = computed(() => {
  const startOfWeek = dayjs(currentDate.value).startOf('week')
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return Array.from({ length: 7 }, (_, i) => ({
    date: startOfWeek.add(i, 'day').format('YYYY-MM-DD'),
    weekday: weekdays[i]
  }))
})

const scheduleData = ref([
  {
    id: 1,
    technicianName: '王技师',
    level: '高级技师',
    ...generateRandomSchedule()
  },
  {
    id: 2,
    technicianName: '李技师',
    level: '首席技师',
    ...generateRandomSchedule()
  },
  {
    id: 3,
    technicianName: '张技师',
    level: '中级技师',
    ...generateRandomSchedule()
  },
  {
    id: 4,
    technicianName: '刘技师',
    level: '高级技师',
    ...generateRandomSchedule()
  }
])

function generateRandomSchedule() {
  const schedule = {}
  const times = ['09:00-12:00', '13:00-18:00']
  weekDays.value.forEach(day => {
    schedule[day.date] = times.map(time => ({
      time,
      status: Math.random() > 0.2 ? 1 : 0
    }))
  })
  return schedule
}

const prevWeek = () => {
  currentDate.value = dayjs(currentDate.value).subtract(1, 'week').format('YYYY-MM-DD')
}

const nextWeek = () => {
  currentDate.value = dayjs(currentDate.value).add(1, 'week').format('YYYY-MM-DD')
}
</script>
