<template>
  <div class="heatmap-page">
    <div class="header">
      <div>
        <h1>打卡热力图</h1>
        <p class="subtitle">查看你的打卡记录</p>
      </div>
      <div class="date-selector">
        <el-button-group>
          <el-button @click="changeMonth(-1)">
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
          <el-button>{{ currentYear }}年{{ currentMonth }}月</el-button>
          <el-button @click="changeMonth(1)">
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </el-button-group>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :span="18">
        <el-card class="heatmap-card" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>📅 月历热力图</span>
            </div>
          </template>
          <div class="calendar-container">
            <div class="calendar-header">
              <div v-for="day in weekDays" :key="day" class="week-day">
                {{ day }}
              </div>
            </div>
            <div class="calendar-grid">
              <div
                v-for="(day, index) in calendarDays"
                :key="index"
                class="calendar-day"
                :class="{
                  empty: !day.date,
                  today: day.isToday,
                  checked: day.count > 0
                }"
                :style="getDayStyle(day)"
              >
                <div class="day-number">{{ day.day || '' }}</div>
                <div v-if="day.count" class="day-count">{{ day.count }}项</div>
              </div>
            </div>
            <div class="legend">
              <span>少</span>
              <div class="legend-colors">
                <span v-for="level in 5" :key="level" :style="getLegendStyle(level)"></span>
              </div>
              <span>多</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>📊 本月统计</span>
            </div>
          </template>
          <div class="stats-content">
            <div class="stat-item">
              <div class="stat-label">打卡天数</div>
              <div class="stat-value">{{ monthStats.checkedDays }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">总打卡次数</div>
              <div class="stat-value">{{ monthStats.totalCheckins }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">月完成率</div>
              <div class="stat-value">{{ monthStats.completionRate }}%</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">最长连续</div>
              <div class="stat-value">{{ monthStats.maxStreak }}天</div>
            </div>
          </div>
        </el-card>

        <el-card class="tips-card">
          <template #header>
            <div class="card-header">
              <span>💡 小贴士</span>
            </div>
          </template>
          <div class="tips-content">
            <p>• 每天坚持打卡，养成好习惯</p>
            <p>• 连续21天即可形成稳定习惯</p>
            <p>• 颜色越深表示当天完成的习惯越多</p>
            <p>• 点击今日打卡开始你的坚持之旅</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { getHeatmap } from '../api/habit'

const loading = ref(false)
const heatmapData = ref([])
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const maxCount = computed(() => {
  if (heatmapData.value.length === 0) return 4
  return Math.max(...heatmapData.value.map(d => d.count), 1)
})

const calendarDays = computed(() => {
  const days = []
  const firstDay = new Date(currentYear.value, currentMonth.value - 1, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const firstDayOfWeek = firstDay.getDay()
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push({ date: null, day: null, count: 0, isToday: false })
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    const dateStr = `${currentYear.value}-${String(currentMonth.value).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    const currentDate = new Date(currentYear.value, currentMonth.value - 1, i)
    const data = heatmapData.value.find(d => d.date === dateStr)
    days.push({
      date: dateStr,
      day: i,
      count: data ? data.count : 0,
      isToday: currentDate.getTime() === today.getTime()
    })
  }

  return days
})

const monthStats = computed(() => {
  const days = calendarDays.value.filter(d => d.date)
  const checkedDays = days.filter(d => d.count > 0).length
  const totalCheckins = days.reduce((sum, d) => sum + d.count, 0)
  const totalDays = days.length

  let maxStreak = 0
  let currentStreak = 0
  for (const day of days) {
    if (day.count > 0) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  }

  return {
    checkedDays,
    totalCheckins,
    completionRate: totalDays > 0 ? Math.round(checkedDays * 100 / totalDays) : 0,
    maxStreak
  }
})

const loadData = async () => {
  loading.value = true
  try {
    heatmapData.value = await getHeatmap(currentYear.value, currentMonth.value)
  } catch (error) {
    console.error('加载热力图数据失败:', error)
  } finally {
    loading.value = false
  }
}

const changeMonth = (delta) => {
  currentMonth.value += delta
  if (currentMonth.value > 12) {
    currentMonth.value = 1
    currentYear.value++
  } else if (currentMonth.value < 1) {
    currentMonth.value = 12
    currentYear.value--
  }
}

const getDayStyle = (day) => {
  if (!day.date || day.count === 0) return {}
  const intensity = Math.min(day.count / maxCount.value, 1)
  const alpha = 0.2 + intensity * 0.8
  return {
    backgroundColor: `rgba(82, 196, 26, ${alpha})`
  }
}

const getLegendStyle = (level) => {
  const alpha = level * 0.2
  return {
    backgroundColor: `rgba(82, 196, 26, ${alpha})`
  }
}

watch([currentYear, currentMonth], () => {
  loadData()
})

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.heatmap-page {
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h1 {
  font-size: 28px;
  color: #303133;
  margin: 0 0 8px 0;
}

.subtitle {
  color: #909399;
  margin: 0;
}

.heatmap-card,
.stats-card,
.tips-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
}

.calendar-container {
  padding: 10px;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 8px;
}

.week-day {
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #606266;
  padding: 8px 0;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.calendar-day {
  aspect-ratio: 1;
  border-radius: 8px;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  min-height: 70px;
}

.calendar-day:not(.empty):hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.calendar-day.empty {
  background: transparent;
  cursor: default;
}

.calendar-day.today {
  border: 2px solid #409eff;
}

.calendar-day.checked {
  color: white;
}

.day-number {
  font-size: 16px;
  font-weight: 500;
}

.day-count {
  font-size: 11px;
  margin-top: 2px;
}

.legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
  font-size: 12px;
  color: #909399;
}

.legend-colors {
  display: flex;
  gap: 4px;
}

.legend-colors span {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: #fafafa;
  border-radius: 10px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.tips-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tips-content p {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}
</style>
