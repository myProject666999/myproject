<template>
  <div class="statistics-page">
    <el-card class="filter-card">
      <el-radio-group v-model="periodType" @change="onPeriodChange">
        <el-radio-button value="daily">日</el-radio-button>
        <el-radio-button value="weekly">周</el-radio-button>
        <el-radio-button value="monthly">月</el-radio-button>
      </el-radio-group>
      <el-date-picker
        v-model="selectedDate"
        :type="pickerType"
        placeholder="选择日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        style="margin-left: 12px;"
        @change="loadStatistics"
      />
      <el-button type="primary" @click="exportReport" style="margin-left: 12px;">
        <el-icon><Download /></el-icon>
        导出报表
      </el-button>
    </el-card>

    <el-row :gutter="16">
      <el-col :span="12">
        <el-card class="chart-card">
          <template v-slot:header>时间分配饼图</template>
          <div ref="pieChartRef" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template v-slot:header>每日时长趋势</template>
          <div ref="lineChartRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="summary-card">
      <template v-slot:header>统计汇总</template>
      <el-row :gutter="16">
        <el-col :span="6" v-for="item in categoryStats" :key="item.categoryId">
          <el-statistic :title="getCategoryName(item.categoryId)" :value="item.totalMinutes" suffix="分钟">
            <template v-slot:prefix>
              <el-icon :color="getCategoryColor(item.categoryId)"><Clock /></el-icon>
            </template>
          </el-statistic>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="goal-card">
      <template v-slot:header>目标完成情况</template>
      <el-table :data="goalProgress">
        <el-table-column label="类别">
          <template #default="{ row }">
            <el-tag :color="getCategoryColor(row.categoryId)">
              {{ row.categoryName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="目标时长">
          <template #default="{ row }">
            {{ formatDuration(row.targetMinutes) }}
          </template>
        </el-table-column>
        <el-table-column label="已完成">
          <template #default="{ row }">
            {{ formatDuration(row.actualMinutes) }}
          </template>
        </el-table-column>
        <el-table-column label="完成率">
          <template #default="{ row }">
            <el-progress :percentage="row.percentage" :status="row.percentage >= 100 ? 'success' : 'active'" />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { getCategories } from '../api/category'
import { getStatisticsByCategory, getStatisticsByDate } from '../api/record'
import { getGoals } from '../api/goal'

const periodType = ref('daily')
const pickerType = ref('date')
const selectedDate = ref(dayjs().format('YYYY-MM-DD'))
const categories = ref([])
const categoryStats = ref([])
const dateStats = ref([])
const goals = ref([])
const pieChartRef = ref(null)
const lineChartRef = ref(null)
let pieChart = null
let lineChart = null

const onPeriodChange = () => {
  if (periodType.value === 'daily') {
    pickerType.value = 'date'
  } else if (periodType.value === 'weekly') {
    pickerType.value = 'week'
  } else {
    pickerType.value = 'month'
  }
}

const getDateRange = () => {
  let startDate, endDate
  if (periodType.value === 'daily') {
    startDate = selectedDate.value
    endDate = selectedDate.value
  } else if (periodType.value === 'weekly') {
    startDate = dayjs(selectedDate.value).startOf('week').format('YYYY-MM-DD')
    endDate = dayjs(selectedDate.value).endOf('week').format('YYYY-MM-DD')
  } else {
    startDate = dayjs(selectedDate.value).startOf('month').format('YYYY-MM-DD')
    endDate = dayjs(selectedDate.value).endOf('month').format('YYYY-MM-DD')
  }
  return { startDate, endDate }
}

const getCategoryName = (id) => {
  if (id === null) return '总计'
  const cat = categories.value.find(c => c.id === id)
  return cat ? cat.name : '未知'
}

const getCategoryColor = (id) => {
  if (id === null) return '#1890ff'
  const cat = categories.value.find(c => c.id === id)
  return cat ? cat.color : '#8c8c8c'
}

const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`
}

const goalProgress = ref([])

const calculateGoalProgress = () => {
  const dailyGoals = goals.value.filter(g => g.goalType === 'daily')
  goalProgress.value = dailyGoals.map(goal => {
    const stat = categoryStats.value.find(s => s.categoryId === goal.categoryId)
    const actualMinutes = stat ? stat.totalMinutes : 0
    const percentage = Math.min(Math.round((actualMinutes / goal.targetMinutes) * 100), 100)
    return {
      categoryId: goal.categoryId,
      categoryName: getCategoryName(goal.categoryId),
      targetMinutes: goal.targetMinutes,
      actualMinutes,
      percentage
    }
  })
}

const loadStatistics = async () => {
  const { startDate, endDate } = getDateRange()
  const [catStats, dateStatsData] = await Promise.all([
    getStatisticsByCategory(startDate, endDate),
    getStatisticsByDate(startDate, endDate)
  ])
  categoryStats.value = catStats
  dateStats.value = dateStatsData
  calculateGoalProgress()
  nextTick(() => {
    renderPieChart()
    renderLineChart()
  })
}

const renderPieChart = () => {
  if (!pieChartRef.value) return
  if (!pieChart) {
    pieChart = echarts.init(pieChartRef.value)
  }
  const data = categoryStats.value.map(item => ({
    value: item.totalMinutes,
    name: getCategoryName(item.categoryId),
    itemStyle: { color: getCategoryColor(item.categoryId) }
  }))
  pieChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c}分钟 ({d}%)' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      type: 'pie',
      radius: '60%',
      center: ['50%', '50%'],
      data,
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
    }]
  })
}

const renderLineChart = () => {
  if (!lineChartRef.value) return
  if (!lineChart) {
    lineChart = echarts.init(lineChartRef.value)
  }
  const dates = dateStats.value.map(item => item.date)
  const values = dateStats.value.map(item => item.totalMinutes)
  lineChart.setOption({
    tooltip: { trigger: 'axis', formatter: '{b}<br/>时长: {c}分钟' },
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value', name: '分钟' },
    series: [{
      type: 'line',
      data: values,
      smooth: true,
      areaStyle: { opacity: 0.3 },
      lineStyle: { color: '#1890ff' },
      itemStyle: { color: '#1890ff' }
    }]
  })
}

const exportReport = () => {
  const { startDate, endDate } = getDateRange()
  let report = `时间统计报表 (${startDate} ~ ${endDate})\n\n`
  report += '类别统计：\n'
  categoryStats.value.forEach(item => {
    report += `${getCategoryName(item.categoryId)}: ${item.totalMinutes}分钟\n`
  })
  report += '\n每日统计：\n'
  dateStats.value.forEach(item => {
    report += `${item.date}: ${item.totalMinutes}分钟\n`
  })
  const blob = new Blob([report], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `时间统计_${startDate}_${endDate}.txt`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}

const handleResize = () => {
  pieChart?.resize()
  lineChart?.resize()
}

onMounted(async () => {
  await Promise.all([loadCategories(), loadGoals()])
  loadStatistics()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  pieChart?.dispose()
  lineChart?.dispose()
})

const loadCategories = async () => {
  categories.value = await getCategories()
}

const loadGoals = async () => {
  goals.value = await getGoals()
}
</script>

<style scoped>
.statistics-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-card {
  display: flex;
  align-items: center;
}

.chart-card {
  margin-bottom: 16px;
}

.chart {
  height: 350px;
}

.summary-card :deep(.el-statistic__head) {
  font-size: 14px;
}
</style>
