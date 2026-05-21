<template>
  <div class="stats-view">
    <div class="card">
      <div class="tab-switcher">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'daily' }"
          @click="activeTab = 'daily'"
        >
          📅 日报
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'weekly' }"
          @click="activeTab = 'weekly'"
        >
          📆 周报
        </button>
      </div>

      <div class="date-selector">
        <button class="btn btn-secondary" @click="changeDate(-1)">←</button>
        <input
          type="date"
          v-model="selectedDate"
          @change="loadData"
          class="date-input"
        />
        <button class="btn btn-secondary" @click="changeDate(1)">→</button>
        <button class="btn btn-secondary" @click="goToToday">今天</button>
      </div>
    </div>

    <div v-if="activeTab === 'daily' && dailyData" class="card">
      <h3 class="section-title">📊 今日营养摄入</h3>
      <div class="nutrition-grid">
        <div class="nutrition-card calories-card">
          <div class="card-icon">🔥</div>
          <div class="card-info">
            <div class="card-value">{{ dailyData.totalCalories }}</div>
            <div class="card-label">热量 (kcal)</div>
            <div v-if="dailyData.goalCompare" class="card-target">
              目标: {{ dailyData.goalCompare.targetCalories }}
              <span class="percentage" :class="getPercentClass(dailyData.goalCompare.caloriesPercentage)">
                {{ dailyData.goalCompare.caloriesPercentage }}%
              </span>
            </div>
          </div>
        </div>
        <div class="nutrition-card protein-card">
          <div class="card-icon">🥩</div>
          <div class="card-info">
            <div class="card-value">{{ dailyData.totalProtein }}</div>
            <div class="card-label">蛋白质 (g)</div>
            <div v-if="dailyData.goalCompare" class="card-target">
              目标: {{ dailyData.goalCompare.targetProtein }}
              <span class="percentage" :class="getPercentClass(dailyData.goalCompare.proteinPercentage)">
                {{ dailyData.goalCompare.proteinPercentage }}%
              </span>
            </div>
          </div>
        </div>
        <div class="nutrition-card fat-card">
          <div class="card-icon">🥑</div>
          <div class="card-info">
            <div class="card-value">{{ dailyData.totalFat }}</div>
            <div class="card-label">脂肪 (g)</div>
            <div v-if="dailyData.goalCompare" class="card-target">
              目标: {{ dailyData.goalCompare.targetFat }}
              <span class="percentage" :class="getPercentClass(dailyData.goalCompare.fatPercentage)">
                {{ dailyData.goalCompare.fatPercentage }}%
              </span>
            </div>
          </div>
        </div>
        <div class="nutrition-card carbs-card">
          <div class="card-icon">🍚</div>
          <div class="card-info">
            <div class="card-value">{{ dailyData.totalCarbs }}</div>
            <div class="card-label">碳水 (g)</div>
            <div v-if="dailyData.goalCompare" class="card-target">
              目标: {{ dailyData.goalCompare.targetCarbs }}
              <span class="percentage" :class="getPercentClass(dailyData.goalCompare.carbsPercentage)">
                {{ dailyData.goalCompare.carbsPercentage }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-container" style="margin-top: 24px;">
        <h4 class="chart-title">营养分布</h4>
        <div ref="pieChartRef" class="pie-chart"></div>
      </div>
    </div>

    <div v-if="activeTab === 'weekly' && weeklyData" class="card">
      <h3 class="section-title">📆 周报告 ({{ weeklyData.startDate }} ~ {{ weeklyData.endDate }})</h3>

      <div class="weekly-summary">
        <div class="summary-grid">
          <div class="summary-item">
            <div class="sum-icon">🔥</div>
            <div class="sum-content">
              <div class="sum-value">{{ weeklyData.avgCalories }}</div>
              <div class="sum-label">日均热量 (kcal)</div>
            </div>
          </div>
          <div class="summary-item">
            <div class="sum-icon">🥩</div>
            <div class="sum-content">
              <div class="sum-value">{{ weeklyData.avgProtein }}</div>
              <div class="sum-label">日均蛋白 (g)</div>
            </div>
          </div>
          <div class="summary-item">
            <div class="sum-icon">🥑</div>
            <div class="sum-content">
              <div class="sum-value">{{ weeklyData.avgFat }}</div>
              <div class="sum-label">日均脂肪 (g)</div>
            </div>
          </div>
          <div class="summary-item">
            <div class="sum-icon">🍚</div>
            <div class="sum-content">
              <div class="sum-value">{{ weeklyData.avgCarbs }}</div>
              <div class="sum-label">日均碳水 (g)</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="weeklyData.goalCompare" class="goal-compare">
        <h4 class="sub-title">🎯 本周目标达成情况</h4>
        <div class="compare-list">
          <div class="compare-item" v-for="item in compareItems" :key="item.key">
            <div class="compare-header">
              <span class="compare-label">{{ item.label }}</span>
              <span class="compare-value">
                {{ weeklyData.goalCompare[item.currentKey] }} / {{ weeklyData.goalCompare[item.targetKey] }} {{ item.unit }}
              </span>
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{
                  width: Math.min(weeklyData.goalCompare[item.percentKey], 100) + '%',
                  background: item.color
                }"
              ></div>
            </div>
            <span class="percent-text" :class="getPercentClass(weeklyData.goalCompare[item.percentKey])">
              {{ weeklyData.goalCompare[item.percentKey] }}%
            </span>
          </div>
        </div>
      </div>

      <div class="chart-container" style="margin-top: 24px;">
        <h4 class="chart-title">本周每日趋势</h4>
        <div ref="lineChartRef" class="line-chart"></div>
      </div>

      <div class="daily-summaries" style="margin-top: 24px;">
        <h4 class="sub-title">📋 每日详情</h4>
        <div class="daily-list">
          <div v-for="summary in weeklyData.dailySummaries" :key="summary.date" class="daily-item">
            <div class="daily-date">{{ formatDate(summary.date) }}</div>
            <div class="daily-nutrition">
              <span class="nutrition-badge badge-calories">🔥 {{ summary.totalCalories }}</span>
              <span class="nutrition-badge badge-protein">🥩 {{ summary.totalProtein }}g</span>
              <span class="nutrition-badge badge-fat">🥑 {{ summary.totalFat }}g</span>
              <span class="nutrition-badge badge-carbs">🍚 {{ summary.totalCarbs }}g</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'weekly' && weeklyData?.dailySummaries?.length === 0" class="card">
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <p>本周暂无记录</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getDailyNutrition, getWeeklyReport } from '../api/meal'

const activeTab = ref('daily')
const selectedDate = ref(new Date().toISOString().split('T')[0])
const dailyData = ref(null)
const weeklyData = ref(null)
const pieChartRef = ref(null)
const lineChartRef = ref(null)
let pieChart = null
let lineChart = null

const compareItems = [
  { key: 'calories', label: '热量', currentKey: 'currentCalories', targetKey: 'targetCalories', percentKey: 'caloriesPercentage', unit: 'kcal', color: '#f57c00' },
  { key: 'protein', label: '蛋白质', currentKey: 'currentProtein', targetKey: 'targetProtein', percentKey: 'proteinPercentage', unit: 'g', color: '#388e3c' },
  { key: 'fat', label: '脂肪', currentKey: 'currentFat', targetKey: 'targetFat', percentKey: 'fatPercentage', unit: 'g', color: '#1976d2' },
  { key: 'carbs', label: '碳水', currentKey: 'currentCarbs', targetKey: 'targetCarbs', percentKey: 'carbsPercentage', unit: 'g', color: '#c2185b' }
]

function changeDate(delta) {
  const d = new Date(selectedDate.value)
  d.setDate(d.getDate() + delta)
  selectedDate.value = d.toISOString().split('T')[0]
}

function goToToday() {
  selectedDate.value = new Date().toISOString().split('T')[0]
}

function getPercentClass(percent) {
  if (percent >= 100) return 'success'
  if (percent >= 80) return 'warning'
  return 'danger'
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${d.getMonth() + 1}月${d.getDate()}日 ${weekdays[d.getDay()]}`
}

async function loadDailyData() {
  dailyData.value = await getDailyNutrition(selectedDate.value)
  await nextTick()
  renderPieChart()
}

async function loadWeeklyData() {
  weeklyData.value = await getWeeklyReport(selectedDate.value)
  await nextTick()
  renderLineChart()
}

async function loadData() {
  if (activeTab.value === 'daily') {
    loadDailyData()
  } else {
    loadWeeklyData()
  }
}

function renderPieChart() {
  if (!pieChartRef.value || !dailyData.value) return

  if (!pieChart) {
    pieChart = echarts.init(pieChartRef.value)
  }

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}g ({d}%)'
    },
    legend: {
      bottom: '0',
      left: 'center'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: dailyData.value.totalProtein, name: '蛋白质', itemStyle: { color: '#388e3c' } },
          { value: dailyData.value.totalFat, name: '脂肪', itemStyle: { color: '#1976d2' } },
          { value: dailyData.value.totalCarbs, name: '碳水', itemStyle: { color: '#c2185b' } }
        ]
      }
    ]
  }

  pieChart.setOption(option)
}

function renderLineChart() {
  if (!lineChartRef.value || !weeklyData.value?.dailySummaries) return

  if (!lineChart) {
    lineChart = echarts.init(lineChartRef.value)
  }

  const dates = weeklyData.value.dailySummaries.map(s => s.date.slice(5))
  const calories = weeklyData.value.dailySummaries.map(s => s.totalCalories)
  const protein = weeklyData.value.dailySummaries.map(s => s.totalProtein)
  const fat = weeklyData.value.dailySummaries.map(s => s.totalFat)
  const carbs = weeklyData.value.dailySummaries.map(s => s.totalCarbs)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['热量(kcal)', '蛋白(g)', '脂肪(g)', '碳水(g)'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '热量(kcal)',
        type: 'line',
        smooth: true,
        data: calories,
        itemStyle: { color: '#f57c00' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(245, 124, 0, 0.3)' },
              { offset: 1, color: 'rgba(245, 124, 0, 0.05)' }
            ]
          }
        }
      },
      {
        name: '蛋白(g)',
        type: 'line',
        smooth: true,
        data: protein,
        itemStyle: { color: '#388e3c' }
      },
      {
        name: '脂肪(g)',
        type: 'line',
        smooth: true,
        data: fat,
        itemStyle: { color: '#1976d2' }
      },
      {
        name: '碳水(g)',
        type: 'line',
        smooth: true,
        data: carbs,
        itemStyle: { color: '#c2185b' }
      }
    ]
  }

  lineChart.setOption(option)
}

watch(activeTab, () => {
  loadData()
})

watch(selectedDate, () => {
  loadData()
})

onMounted(() => {
  loadData()
  window.addEventListener('resize', () => {
    pieChart?.resize()
    lineChart?.resize()
  })
})
</script>

<style scoped>
.tab-switcher {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tab-btn {
  flex: 1;
  padding: 12px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.date-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.date-input {
  padding: 8px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.sub-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.chart-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.nutrition-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.nutrition-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 14px;
  color: white;
}

.calories-card {
  background: linear-gradient(135deg, #ff9a56 0%, #ff6b35 100%);
}

.protein-card {
  background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%);
}

.fat-card {
  background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%);
}

.carbs-card {
  background: linear-gradient(135deg, #ec407a 0%, #c2185b 100%);
}

.card-icon {
  font-size: 40px;
}

.card-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.card-label {
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 4px;
}

.card-target {
  font-size: 12px;
  opacity: 0.9;
}

.percentage {
  margin-left: 8px;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.25);
  font-weight: 600;
}

.percentage.success {
  background: rgba(76, 175, 80, 0.6);
}

.percentage.warning {
  background: rgba(255, 193, 7, 0.6);
}

.percentage.danger {
  background: rgba(244, 67, 54, 0.6);
}

.pie-chart {
  width: 100%;
  height: 320px;
}

.line-chart {
  width: 100%;
  height: 320px;
}

.weekly-summary {
  margin-bottom: 24px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9ff;
  border-radius: 12px;
}

.sum-icon {
  font-size: 28px;
}

.sum-value {
  font-size: 22px;
  font-weight: 700;
  color: #333;
}

.sum-label {
  font-size: 12px;
  color: #666;
}

.goal-compare {
  background: #f8f9ff;
  padding: 20px;
  border-radius: 14px;
}

.compare-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.compare-item {
  position: relative;
}

.compare-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 14px;
}

.compare-label {
  font-weight: 500;
  color: #333;
}

.compare-value {
  color: #666;
}

.percent-text {
  position: absolute;
  right: 0;
  top: 0;
  font-size: 13px;
  font-weight: 600;
  margin-left: 10px;
}

.percent-text.success {
  color: #388e3c;
}

.percent-text.warning {
  color: #f57c00;
}

.percent-text.danger {
  color: #d32f2f;
}

.daily-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.daily-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px;
  background: #fafafa;
  border-radius: 10px;
  flex-wrap: wrap;
}

.daily-date {
  font-weight: 600;
  color: #333;
  min-width: 100px;
}

.daily-nutrition {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
</style>
