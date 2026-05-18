<template>
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">情绪趋势</h1>
      <p class="page-subtitle">查看你的情绪变化曲线</p>
    </div>

    <div class="controls-row">
      <el-date-picker
        v-model="selectedMonth"
        type="month"
        placeholder="选择月份"
        format="YYYY年MM月"
        value-format="YYYY-MM"
        @change="loadData"
      />
    </div>

    <el-row :gutter="20" style="margin-bottom: 24px;">
      <el-col :span="8">
        <div class="stats-card">
          <div class="stats-value">{{ statistics.totalDiaries || 0 }}</div>
          <div class="stats-label">本月日记数</div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="stats-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
          <div class="stats-value">{{ statistics.averageMoodScore || '0.0' }}</div>
          <div class="stats-label">平均情绪分</div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="stats-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
          <div class="stats-value">{{ positiveRate }}%</div>
          <div class="stats-label">积极情绪占比</div>
        </div>
      </el-col>
    </el-row>

    <el-card style="margin-bottom: 24px;">
      <template #header>
        <div style="font-weight: 600;">月度情绪曲线</div>
      </template>
      <div ref="chartRef" style="height: 400px;"></div>
    </el-card>

    <el-card>
      <template #header>
        <div style="font-weight: 600;">情绪分布</div>
      </template>
      <div style="display: flex; justify-content: space-around; align-items: center;">
        <div ref="pieChartRef" style="width: 400px; height: 300px;"></div>
        <div class="mood-legend">
          <div class="legend-item">
            <span class="legend-dot" style="background: #67c23a;"></span>
            <span class="legend-label">积极 (≥7分)</span>
            <span class="legend-count">{{ statistics.moodDistribution?.['积极'] || 0 }} 天</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot" style="background: #e6a23c;"></span>
            <span class="legend-label">中性 (4-6分)</span>
            <span class="legend-count">{{ statistics.moodDistribution?.['中性'] || 0 }} 天</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot" style="background: #f56c6c;"></span>
            <span class="legend-label">消极 (≤3分)</span>
            <span class="legend-count">{{ statistics.moodDistribution?.['消极'] || 0 }} 天</span>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { getMonthlyMoodTrend, getMoodStatistics } from '../api/diary'

const chartRef = ref(null)
const pieChartRef = ref(null)
let chartInstance = null
let pieChartInstance = null

const selectedMonth = ref(dayjs().format('YYYY-MM'))
const trendData = ref([])
const statistics = ref({})

const positiveRate = computed(() => {
  const dist = statistics.value.moodDistribution
  if (!dist) return '0'
  const total = (dist['积极'] || 0) + (dist['中性'] || 0) + (dist['消极'] || 0)
  if (total === 0) return '0'
  return Math.round((dist['积极'] || 0) / total * 100)
})

const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
  }
  if (pieChartRef.value) {
    pieChartInstance = echarts.init(pieChartRef.value)
  }
}

const updateChart = () => {
  if (!chartInstance || !trendData.value.length) return

  const dates = trendData.value.map(item => item.date.slice(5))
  const scores = trendData.value.map(item => item.moodScore)

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const data = trendData.value[params[0].dataIndex]
        let html = `<div>${data.date}</div>`
        if (data.hasDiary) {
          html += `<div>情绪分: ${data.moodScore}</div>`
          if (data.moodSummary) {
            html += `<div style="max-width: 200px;">${data.moodSummary}</div>`
          }
        } else {
          html += `<div>无日记</div>`
        }
        return html
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#e4e7ed' } },
      axisLabel: { color: '#909399' }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 10,
      interval: 2,
      axisLine: { lineStyle: { color: '#e4e7ed' } },
      axisLabel: { color: '#909399' },
      splitLine: { lineStyle: { color: '#f2f6fc' } }
    },
    series: [
      {
        name: '情绪分',
        type: 'line',
        smooth: true,
        data: scores,
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#667eea' },
            { offset: 1, color: '#764ba2' }
          ])
        },
        itemStyle: {
          color: (params) => {
            const val = params.value
            if (val == null) return '#dcdfe6'
            if (val >= 7) return '#67c23a'
            if (val >= 4) return '#e6a23c'
            return '#f56c6c'
          }
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
            { offset: 1, color: 'rgba(102, 126, 234, 0.05)' }
          ])
        },
        connectNulls: false
      }
    ]
  }

  chartInstance.setOption(option)
}

const updatePieChart = () => {
  if (!pieChartInstance) return

  const dist = statistics.value.moodDistribution || {}
  const data = [
    { value: dist['积极'] || 0, name: '积极', itemStyle: { color: '#67c23a' } },
    { value: dist['中性'] || 0, name: '中性', itemStyle: { color: '#e6a23c' } },
    { value: dist['消极'] || 0, name: '消极', itemStyle: { color: '#f56c6c' } }
  ].filter(item => item.value > 0)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} 天 ({d}%)'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: true,
          formatter: '{b}\n{d}%'
        },
        data: data
      }
    ]
  }

  pieChartInstance.setOption(option)
}

const loadData = async () => {
  if (!selectedMonth.value) return

  const [year, month] = selectedMonth.value.split('-').map(Number)

  try {
    const [trendRes, statsRes] = await Promise.all([
      getMonthlyMoodTrend({ userId: 1, year, month }),
      getMoodStatistics({ userId: 1, year, month })
    ])

    if (trendRes.data.code === 200) {
      trendData.value = trendRes.data.data
      await nextTick()
      updateChart()
    }

    if (statsRes.data.code === 200) {
      statistics.value = statsRes.data.data
      await nextTick()
      updatePieChart()
    }
  } catch (e) {
    console.error(e)
  }
}

const handleResize = () => {
  chartInstance?.resize()
  pieChartInstance?.resize()
}

onMounted(() => {
  initChart()
  loadData()
  window.addEventListener('resize', handleResize)
})

watch(selectedMonth, () => {
  loadData()
})
</script>

<style scoped>
.controls-row {
  margin-bottom: 24px;
}

.mood-legend {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.legend-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.legend-label {
  min-width: 100px;
  color: #606266;
}

.legend-count {
  font-weight: 600;
  color: #303133;
}
</style>
