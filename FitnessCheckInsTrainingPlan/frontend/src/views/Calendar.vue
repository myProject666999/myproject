<template>
  <div class="page-container">
    <div class="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-6 pb-12 rounded-b-3xl">
      <div class="flex justify-between items-center mb-2">
        <button @click="prevMonth" class="p-2">←</button>
        <h1 class="text-xl font-bold">{{ currentYear }}年{{ currentMonth }}月</h1>
        <button @click="nextMonth" class="p-2">→</button>
      </div>
      <p class="text-primary-100 text-sm text-center">本月打卡 {{ monthCheckIns }} 天</p>
    </div>

    <div class="px-4 -mt-8">
      <div class="card animate-slide-up">
        <div class="grid grid-cols-7 gap-1 mb-2">
          <div v-for="day in weekDays" :key="day" class="text-center text-xs text-gray-400 py-2">
            {{ day }}
          </div>
        </div>
        
        <div class="grid grid-cols-7 gap-1">
          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            class="aspect-square flex flex-col items-center justify-center rounded-lg cursor-pointer"
            :class="getDayClass(day)"
            @click="day.date && selectDay(day)"
          >
            <span class="text-sm">{{ day.day || '' }}</span>
            <span v-if="day.checkedIn" class="text-xs text-primary-500">✓</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedDayData" class="px-4 mt-4">
      <div class="card">
        <h3 class="font-bold mb-3">{{ selectedDay }} 训练记录</h3>
        <div class="space-y-2">
          <div
            v-for="(ex, index) in selectedDayData.exercises"
            :key="index"
            class="flex justify-between text-sm py-2 border-b border-gray-100 last:border-0"
          >
            <span>{{ ex.exercise }}</span>
            <span class="text-gray-500">{{ ex.sets }}×{{ ex.reps }} @ {{ ex.weight }}kg</span>
          </div>
        </div>
        <div v-if="selectedDayData.note" class="mt-3 text-sm text-gray-500">
          备注：{{ selectedDayData.note }}
        </div>
      </div>
    </div>

    <div class="px-4 mt-6">
      <div class="card">
        <h3 class="font-bold mb-3">打卡统计</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="text-center p-3 bg-gray-50 rounded-xl">
            <div class="text-2xl font-bold text-primary-500">{{ totalCheckIns }}</div>
            <div class="text-xs text-gray-500">累计打卡</div>
          </div>
          <div class="text-center p-3 bg-gray-50 rounded-xl">
            <div class="text-2xl font-bold text-accent-500">{{ currentStreak }}</div>
            <div class="text-xs text-gray-500">连续打卡</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { checkInApi, statsApi } from '../api'

const weekDays = ['日', '一', '二', '三', '四', '五', '六']
const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth() + 1)
const checkIns = ref([])
const selectedDay = ref('')
const selectedDayData = ref(null)
const totalCheckIns = ref(0)
const currentStreak = ref(0)

const calendarDays = computed(() => {
  const days = []
  const firstDay = new Date(currentYear.value, currentMonth.value - 1, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value, 0)
  const startWeekDay = firstDay.getDay()
  
  for (let i = 0; i < startWeekDay; i++) {
    days.push({ day: null, date: null, checkedIn: false })
  }
  
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const dateStr = `${currentYear.value}-${String(currentMonth.value).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    const checkedIn = checkIns.value.some(ci => ci.date === dateStr)
    days.push({ day: i, date: dateStr, checkedIn })
  }
  
  return days
})

const monthCheckIns = computed(() => {
  return checkIns.value.filter(ci => {
    const [y, m] = ci.date.split('-')
    return parseInt(y) === currentYear.value && parseInt(m) === currentMonth.value
  }).length
})

const prevMonth = () => {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value--
  } else {
    currentMonth.value--
  }
  loadCheckIns()
}

const nextMonth = () => {
  if (currentMonth.value === 12) {
    currentMonth.value = 1
    currentYear.value++
  } else {
    currentMonth.value++
  }
  loadCheckIns()
}

const getDayClass = (day) => {
  if (!day.date) return 'text-gray-300'
  const isToday = day.date === new Date().toISOString().split('T')[0]
  if (day.checkedIn && isToday) return 'bg-primary-500 text-white'
  if (day.checkedIn) return 'bg-primary-100 text-primary-700'
  if (isToday) return 'ring-2 ring-primary-500'
  return 'hover:bg-gray-100'
}

const selectDay = (day) => {
  selectedDay.value = day.date
  selectedDayData.value = checkIns.value.find(ci => ci.date === day.date) || null
}

const loadCheckIns = async () => {
  try {
    const res = await checkInApi.getAll(currentYear.value, String(currentMonth.value).padStart(2, '0'))
    checkIns.value = res.data
  } catch (e) {
    console.error(e)
  }
}

const loadStats = async () => {
  try {
    const res = await statsApi.get()
    totalCheckIns.value = res.data.totalCheckIns
    currentStreak.value = res.data.currentStreak
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadCheckIns()
  loadStats()
})
</script>
