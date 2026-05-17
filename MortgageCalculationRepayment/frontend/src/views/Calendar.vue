<template>
  <div class="calendar-page">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card>
          <template #header>
            <span class="card-header">选择贷款方案</span>
          </template>
          <el-radio-group v-model="selectedSchemeId" @change="handleSchemeChange">
            <el-radio
              v-for="scheme in schemes"
              :key="scheme.id"
              :value="scheme.id"
              style="display: block; margin-bottom: 15px;"
            >
              <div class="scheme-item">
                <div class="scheme-name">{{ scheme.name }}</div>
                <div class="scheme-info">
                  {{ (scheme.loanAmount / 10000).toFixed(0) }}万 · {{ Math.round(scheme.loanTermMonths / 12) }}年
                </div>
              </div>
            </el-radio>
          </el-radio-group>
        </el-card>
      </el-col>
      <el-col :span="18">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>还款日历</span>
              <div class="header-actions">
                <el-button-group>
                  <el-button @click="prevMonth">
                    <el-icon><ArrowLeft /></el-icon>
                  </el-button>
                  <span class="month-display">{{ currentYear }}年{{ currentMonth }}月</span>
                  <el-button @click="nextMonth">
                    <el-icon><ArrowRight /></el-icon>
                  </el-button>
                </el-button-group>
              </div>
            </div>
          </template>

          <div v-if="repaymentEvents.length > 0" class="calendar-container">
            <div class="calendar-header">
              <div class="weekday" v-for="day in weekDays" :key="day">{{ day }}</div>
            </div>
            <div class="calendar-body">
              <div
                v-for="(day, index) in calendarDays"
                :key="index"
                class="calendar-day"
                :class="{
                  'other-month': !day.isCurrentMonth,
                  'has-repayment': day.hasRepayment,
                  'paid': day.isPaid,
                  'today': day.isToday
                }"
              >
                <div class="day-number">{{ day.day }}</div>
                <div v-if="day.event" class="day-event">
                  <div class="event-dot"></div>
                  <div class="event-amount">{{ formatMoney(day.event.monthlyPayment) }}</div>
                </div>
              </div>
            </div>
          </div>

          <el-empty v-else description="请先选择贷款方案" />
        </el-card>

        <el-card v-if="monthlyRepayments.length > 0" style="margin-top: 20px;">
          <template #header>
            <span class="card-header">本月还款明细</span>
          </template>
          <el-table :data="monthlyRepayments" border>
            <el-table-column prop="period" label="期数" width="80" align="center" />
            <el-table-column prop="repaymentDate" label="还款日期" width="140" align="center">
              <template #default="{ row }">
                {{ formatDate(row.repaymentDate) }}
              </template>
            </el-table-column>
            <el-table-column prop="monthlyPayment" label="月供(元)" width="140" align="right">
              <template #default="{ row }">
                {{ formatMoney(row.monthlyPayment) }}
              </template>
            </el-table-column>
            <el-table-column prop="principal" label="本金(元)" width="140" align="right">
              <template #default="{ row }">
                {{ formatMoney(row.principal) }}
              </template>
            </el-table-column>
            <el-table-column prop="interest" label="利息(元)" width="140" align="right">
              <template #default="{ row }">
                {{ formatMoney(row.interest) }}
              </template>
            </el-table-column>
            <el-table-column prop="remainingPrincipal" label="剩余本金(元)" align="right">
              <template #default="{ row }">
                {{ formatMoney(row.remainingPrincipal) }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.paidPrincipal > 0" type="success" size="small">已还</el-tag>
                <el-tag v-else type="warning" size="small">待还</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { listSchemes, getRepaymentPlans } from '../api'

const schemes = ref([])
const selectedSchemeId = ref(null)
const repaymentPlans = ref([])
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const formatMoney = (value) => {
  if (!value && value !== 0) return '-'
  return Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const loadSchemes = async () => {
  try {
    schemes.value = await listSchemes()
    if (schemes.value.length > 0) {
      selectedSchemeId.value = schemes.value[0].id
      loadRepaymentPlans()
    }
  } catch (error) {
    ElMessage.error('加载方案失败')
  }
}

const loadRepaymentPlans = async () => {
  if (!selectedSchemeId.value) return
  try {
    repaymentPlans.value = await getRepaymentPlans(selectedSchemeId.value)
  } catch (error) {
    ElMessage.error('加载还款计划失败')
  }
}

const handleSchemeChange = () => {
  loadRepaymentPlans()
}

const repaymentEvents = computed(() => {
  return repaymentPlans.value.filter(plan => {
    const date = new Date(plan.repaymentDate)
    return date.getFullYear() === currentYear.value && (date.getMonth() + 1) === currentMonth.value
  })
})

const monthlyRepayments = computed(() => {
  return repaymentEvents.value
})

const calendarDays = computed(() => {
  const days = []
  const firstDay = new Date(currentYear.value, currentMonth.value - 1, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value, 0)
  const startDayOfWeek = firstDay.getDay()
  const daysInMonth = lastDay.getDate()
  const today = new Date()

  const prevMonthLastDay = new Date(currentYear.value, currentMonth.value - 1, 0).getDate()
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    days.push({
      day: prevMonthLastDay - i,
      isCurrentMonth: false,
      hasRepayment: false,
      isPaid: false,
      isToday: false,
      event: null
    })
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const event = repaymentEvents.value.find(e => {
      const date = new Date(e.repaymentDate)
      return date.getDate() === i
    })

    const isToday = today.getFullYear() === currentYear.value &&
                    today.getMonth() === currentMonth.value - 1 &&
                    today.getDate() === i

    days.push({
      day: i,
      isCurrentMonth: true,
      hasRepayment: !!event,
      isPaid: event && event.paidPrincipal > 0,
      isToday,
      event
    })
  }

  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      day: i,
      isCurrentMonth: false,
      hasRepayment: false,
      isPaid: false,
      isToday: false,
      event: null
    })
  }

  return days
})

const prevMonth = () => {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 12) {
    currentMonth.value = 1
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

onMounted(() => {
  loadSchemes()
})
</script>

<style scoped>
.calendar-page {
  max-width: 1600px;
  margin: 0 auto;
}

.card-header {
  font-weight: 600;
}

.scheme-item {
  padding: 8px 0;
}

.scheme-name {
  font-weight: 500;
  color: #303133;
}

.scheme-info {
  font-size: 12px;
  color: #909399;
  margin-top: 3px;
}

.header-actions {
  display: flex;
  align-items: center;
}

.month-display {
  margin: 0 15px;
  font-weight: 500;
  font-size: 16px;
}

.calendar-container {
  user-select: none;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 10px;
}

.weekday {
  padding: 10px;
  text-align: center;
  font-weight: 500;
  color: #606266;
}

.calendar-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day {
  min-height: 80px;
  padding: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  position: relative;
  transition: all 0.2s;
}

.calendar-day:hover {
  background: #f5f7fa;
}

.calendar-day.other-month {
  color: #c0c4cc;
  background: #fafafa;
}

.calendar-day.has-repayment {
  border-color: #409eff;
  background: #ecf5ff;
}

.calendar-day.has-repayment.paid {
  border-color: #67c23a;
  background: #f0f9eb;
}

.calendar-day.today {
  border-color: #e6a23c;
}

.calendar-day.today::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-top: 12px solid #e6a23c;
  border-left: 12px solid transparent;
}

.day-number {
  font-weight: 500;
  font-size: 14px;
}

.day-event {
  margin-top: 5px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.event-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #409eff;
}

.calendar-day.paid .event-dot {
  background: #67c23a;
}

.event-amount {
  font-size: 11px;
  color: #409eff;
  font-weight: 500;
}

.calendar-day.paid .event-amount {
  color: #67c23a;
}
</style>
