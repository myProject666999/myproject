<template>
  <div class="calendar-page">
    <el-row :gutter="20">
      <el-col :span="18">
        <el-card class="calendar-card">
          <div class="calendar-header">
            <el-button-group>
              <el-button @click="prevMonth">
                <el-icon><ArrowLeft /></el-icon>
              </el-button>
              <span class="current-month">{{ currentMonthLabel }}</span>
              <el-button @click="nextMonth">
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </el-button-group>
            <el-button type="primary" @click="goToday">今天</el-button>
            <el-button type="success" @click="showAddDialog = true">
              <el-icon><Plus /></el-icon>
              记一笔
            </el-button>
          </div>

          <div class="month-stats" v-if="monthStats">
            <el-row :gutter="20">
              <el-col :span="8">
                <div class="stat-item income">
                  <div class="stat-label">本月收入</div>
                  <div class="stat-value">¥{{ monthStats.totalIncome }}</div>
                  <div class="stat-count">{{ monthStats.incomeCount }} 笔</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item expense">
                  <div class="stat-label">本月支出</div>
                  <div class="stat-value">¥{{ monthStats.totalExpense }}</div>
                  <div class="stat-count">{{ monthStats.expenseCount }} 笔</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item balance">
                  <div class="stat-label">本月结余</div>
                  <div class="stat-value" :class="monthStats.balance >= 0 ? 'positive' : 'negative'">
                    ¥{{ monthStats.balance }}
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>

          <div class="calendar-grid">
            <div class="weekday-header">
              <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
            </div>
            <div class="days-grid">
              <div
                v-for="(day, index) in calendarDays"
                :key="index"
                class="day-cell"
                :class="{
                  'other-month': day.isOtherMonth,
                  'today': day.isToday,
                  'has-record': day.hasRecord,
                  'holiday': day.isHoliday
                }"
                :style="{ backgroundColor: day.bgColor }"
                @click="goToDayDetail(day)"
              >
                <div class="day-number">{{ day.day }}</div>
                <div class="day-holiday" v-if="day.holidayName">{{ day.holidayName }}</div>
                <div class="day-expense" v-if="day.expense > 0">
                  支 ¥{{ day.expense }}
                </div>
                <div class="day-income" v-if="day.income > 0">
                  收 ¥{{ day.income }}
                </div>
              </div>
            </div>
          </div>

          <div class="color-legend">
            <span class="legend-label">消费强度：</span>
            <span class="legend-item" v-for="(color, index) in colorLegend" :key="index" :style="{ backgroundColor: color.color }">
              {{ color.label }}
            </span>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="ranking-card">
          <template #header>
            <div class="card-header">
              <el-icon><Trophy /></el-icon>
              <span>日消费排行</span>
            </div>
          </template>
          <div class="ranking-list" v-if="topExpenseDays.length > 0">
            <div
              v-for="(item, index) in topExpenseDays"
              :key="index"
              class="ranking-item"
              @click="goToDayDetailByDate(item.date)"
            >
              <div class="rank" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
              <div class="ranking-info">
                <div class="ranking-date">{{ formatDate(item.date) }}</div>
                <div class="ranking-holiday" v-if="item.holidayName">{{ item.holidayName }}</div>
              </div>
              <div class="ranking-amount">¥{{ item.expense }}</div>
            </div>
          </div>
          <el-empty v-else description="暂无数据" />
        </el-card>

        <el-card class="tips-card" style="margin-top: 20px">
          <template #header>
            <div class="card-header">
              <el-icon><InfoFilled /></el-icon>
              <span>使用说明</span>
            </div>
          </template>
          <div class="tips-content">
            <p>• 点击日期查看当日详细记录</p>
            <p>• 颜色深浅表示当日消费金额</p>
            <p>• 红色标记为节假日</p>
            <p>• 在设置中可自定义颜色阈值</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="showAddDialog" title="添加记录" width="500px">
      <el-form :model="recordForm" label-width="80px">
        <el-form-item label="类型">
          <el-radio-group v-model="recordForm.type">
            <el-radio :label="2">支出</el-radio>
            <el-radio :label="1">收入</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="recordForm.categoryId" placeholder="请选择分类">
            <el-option
              v-for="cat in currentCategories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="金额">
          <el-input-number v-model="recordForm.amount" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="recordForm.date"
            type="date"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="recordForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="submitRecord">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import {
  getDailyStats,
  getMonthStats,
  getTopExpenseDays,
  getCategories,
  getSettings,
  addRecord
} from '../api'

const router = useRouter()
const weekDays = ['日', '一', '二', '三', '四', '五', '六']
const currentDate = ref(dayjs())
const dailyStats = ref([])
const monthStats = ref(null)
const topExpenseDays = ref([])
const holidays = ref([])
const categories = ref([])
const settings = ref(null)
const showAddDialog = ref(false)
const recordForm = ref({
  type: 2,
  categoryId: null,
  amount: 0,
  date: dayjs().format('YYYY-MM-DD'),
  remark: ''
})

const currentMonthLabel = computed(() => {
  return currentDate.value.format('YYYY年MM月')
})

const currentCategories = computed(() => {
  return categories.value.filter(c => c.type === recordForm.value.type)
})

const colorLegend = computed(() => {
  if (!settings.value) return []
  return [
    { color: '#fff', label: '无消费' },
    { color: settings.value.color1, label: `0 - ${settings.value.colorThreshold1}` },
    { color: settings.value.color2, label: `${settings.value.colorThreshold1} - ${settings.value.colorThreshold2}` },
    { color: settings.value.color3, label: `${settings.value.colorThreshold2} - ${settings.value.colorThreshold3}` },
    { color: settings.value.color4, label: `${settings.value.colorThreshold3} 以上` }
  ]
})

const calendarDays = computed(() => {
  const year = currentDate.value.year()
  const month = currentDate.value.month()
  const firstDay = dayjs(new Date(year, month, 1))
  const startDay = firstDay.subtract(firstDay.day(), 'day')
  const days = []
  
  const statsMap = new Map()
  dailyStats.value.forEach(s => {
    statsMap.set(dayjs(s.date).format('YYYY-MM-DD'), s)
  })

  const holidayMap = new Map()
  holidays.value.forEach(h => {
    holidayMap.set(dayjs(h.date).format('YYYY-MM-DD'), h)
  })

  for (let i = 0; i < 42; i++) {
    const day = startDay.add(i, 'day')
    const dateStr = day.format('YYYY-MM-DD')
    const stat = statsMap.get(dateStr)
    const holiday = holidayMap.get(dateStr)
    
    const expense = stat?.expense || 0
    const income = stat?.income || 0
    
    let bgColor = '#ffffff'
    if (expense > 0 && settings.value) {
      if (expense >= settings.value.colorThreshold3) {
        bgColor = settings.value.color4
      } else if (expense >= settings.value.colorThreshold2) {
        bgColor = settings.value.color3
      } else if (expense >= settings.value.colorThreshold1) {
        bgColor = settings.value.color2
      } else {
        bgColor = settings.value.color1
      }
    }

    days.push({
      date: dateStr,
      day: day.date(),
      isOtherMonth: day.month() !== month,
      isToday: day.isSame(dayjs(), 'day'),
      hasRecord: !!stat,
      expense: expense,
      income: income,
      isHoliday: !!holiday && holiday.type === 1,
      holidayName: holiday?.name,
      bgColor: bgColor
    })
  }
  return days
})

const getExpenseColor = (expense) => {
  if (!settings.value || expense <= 0) return '#ffffff'
  if (expense >= settings.value.colorThreshold3) return settings.value.color4
  if (expense >= settings.value.colorThreshold2) return settings.value.color3
  if (expense >= settings.value.colorThreshold1) return settings.value.color2
  return settings.value.color1
}

const prevMonth = () => {
  currentDate.value = currentDate.value.subtract(1, 'month')
}

const nextMonth = () => {
  currentDate.value = currentDate.value.add(1, 'month')
}

const goToday = () => {
  currentDate.value = dayjs()
}

const goToDayDetail = (day) => {
  router.push(`/day/${day.date}`)
}

const goToDayDetailByDate = (date) => {
  router.push(`/day/${dayjs(date).format('YYYY-MM-DD')}`)
}

const formatDate = (date) => {
  return dayjs(date).format('MM月DD日')
}

const loadData = async () => {
  const year = currentDate.value.year()
  const month = currentDate.value.month()
  const startDate = dayjs(new Date(year, month, 1)).format('YYYY-MM-DD')
  const endDate = dayjs(new Date(year, month + 1, 0)).format('YYYY-MM-DD')

  try {
    const [stats, monthData, topExpense, cats, setting] = await Promise.all([
      getDailyStats(startDate, endDate),
      getMonthStats(startDate, endDate),
      getTopExpenseDays(startDate, endDate, 10),
      getCategories(),
      getSettings()
    ])
    dailyStats.value = stats
    monthStats.value = monthData
    topExpenseDays.value = topExpense
    categories.value = cats
    settings.value = setting
  } catch (error) {
    console.error('加载数据失败', error)
  }
}

const submitRecord = async () => {
  if (!recordForm.value.categoryId || !recordForm.value.amount) {
    ElMessage.warning('请填写完整信息')
    return
  }
  try {
    await addRecord(recordForm.value)
    ElMessage.success('添加成功')
    showAddDialog.value = false
    recordForm.value = {
      type: 2,
      categoryId: null,
      amount: 0,
      date: dayjs().format('YYYY-MM-DD'),
      remark: ''
    }
    loadData()
  } catch (error) {
    console.error('添加失败', error)
  }
}

watch(currentDate, () => {
  loadData()
})

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.calendar-page {
  width: 100%;
}

.calendar-card {
  margin-bottom: 20px;
}

.calendar-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.current-month {
  font-size: 18px;
  font-weight: 600;
  padding: 0 15px;
}

.month-stats {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
}

.stat-item {
  text-align: center;
  padding: 10px;
}

.stat-label {
  color: #909399;
  font-size: 14px;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 5px;
}

.stat-item.income .stat-value {
  color: #67c23a;
}

.stat-item.expense .stat-value {
  color: #f56c6c;
}

.stat-value.positive {
  color: #67c23a;
}

.stat-value.negative {
  color: #f56c6c;
}

.stat-count {
  color: #909399;
  font-size: 12px;
}

.weekday-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f5f7fa;
  border-radius: 8px 8px 0 0;
}

.weekday {
  text-align: center;
  padding: 12px;
  font-weight: 600;
  color: #606266;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border: 1px solid #ebeef5;
  border-top: none;
  border-radius: 0 0 8px 8px;
}

.day-cell {
  min-height: 90px;
  padding: 8px;
  border-right: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.day-cell:nth-child(7n) {
  border-right: none;
}

.day-cell:hover {
  background-color: #ecf5ff !important;
}

.day-cell.other-month {
  opacity: 0.4;
}

.day-cell.today {
  border: 2px solid #409eff;
}

.day-cell.holiday {
  color: #f56c6c;
}

.day-number {
  font-weight: 600;
  font-size: 14px;
}

.day-holiday {
  font-size: 11px;
  color: #f56c6c;
  margin-top: 2px;
}

.day-expense {
  font-size: 11px;
  color: #f56c6c;
  margin-top: 4px;
}

.day-income {
  font-size: 11px;
  color: #67c23a;
}

.color-legend {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

.legend-label {
  color: #909399;
  font-size: 12px;
}

.legend-item {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid #ebeef5;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.ranking-list {
  max-height: 400px;
  overflow-y: auto;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 8px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.ranking-item:hover {
  background-color: #f5f7fa;
}

.rank {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #c0c4cc;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.rank-1 {
  background: #f56c6c;
}

.rank-2 {
  background: #e6a23c;
}

.rank-3 {
  background: #67c23a;
}

.ranking-info {
  flex: 1;
}

.ranking-date {
  font-weight: 500;
}

.ranking-holiday {
  font-size: 12px;
  color: #f56c6c;
}

.ranking-amount {
  font-weight: 600;
  color: #f56c6c;
}

.tips-content {
  line-height: 2;
  color: #606266;
}

.tips-content p {
  margin: 0;
}
</style>
