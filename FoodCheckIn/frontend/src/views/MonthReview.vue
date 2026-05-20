<template>
  <div class="page-container">
    <div class="page-header">
      <h2>月度回顾</h2>
      <el-date-picker
        v-model="selectedMonth"
        type="month"
        placeholder="选择月份"
        value-format="YYYY-MM"
        @change="loadReview"
      />
    </div>

    <div v-loading="loading">
      <div v-if="review" class="review-container">
        <div class="stats-row">
          <el-card class="stat-card card-shadow">
            <div class="stat-icon checkins">
              <el-icon><EditPen /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ review.totalCheckins }}</div>
              <div class="stat-label">打卡次数</div>
            </div>
          </el-card>

          <el-card class="stat-card card-shadow">
            <div class="stat-icon restaurants">
              <el-icon><Shop /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ review.totalRestaurants }}</div>
              <div class="stat-label">餐厅数量</div>
            </div>
          </el-card>

          <el-card class="stat-card card-shadow">
            <div class="stat-icon amount">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">¥{{ review.totalAmount || 0 }}</div>
              <div class="stat-label">总消费</div>
            </div>
          </el-card>

          <el-card class="stat-card card-shadow">
            <div class="stat-icon rating">
              <el-icon><Star /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ review.avgRating || 0 }}</div>
              <div class="stat-label">平均评分</div>
            </div>
          </el-card>
        </div>

        <div class="charts-row">
          <el-card class="chart-card card-shadow">
            <template #header>
              <span>每日打卡趋势</span>
            </template>
            <div ref="dailyChart" class="chart"></div>
          </el-card>

          <el-card class="chart-card card-shadow">
            <template #header>
              <span>菜系分布</span>
            </template>
            <div ref="cuisineChart" class="chart"></div>
          </el-card>
        </div>

        <div class="lists-row">
          <el-card class="list-card card-shadow">
            <template #header>
              <span>最常去餐厅</span>
            </template>
            <div v-if="review.topRestaurants && review.topRestaurants.length > 0" class="rank-list">
              <div v-for="(item, index) in review.topRestaurants" :key="item.restaurantId" class="rank-item">
                <div class="rank" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
                <div class="rank-info">
                  <div class="name">{{ item.restaurantName }}</div>
                  <div class="sub">打卡 {{ item.checkinCount }} 次</div>
                </div>
                <el-rate v-model="item.avgRating" disabled :max="5" size="small" />
              </div>
            </div>
            <el-empty v-else description="暂无数据" />
          </el-card>

          <el-card class="list-card card-shadow">
            <template #header>
              <span>最高评分菜品</span>
            </template>
            <div v-if="review.topDishes && review.topDishes.length > 0" class="rank-list">
              <div v-for="(item, index) in review.topDishes" :key="item.dishId" class="rank-item">
                <div class="rank" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
                <div class="rank-info">
                  <div class="name">{{ item.dishName }}</div>
                  <div class="sub">{{ item.restaurantName }}</div>
                </div>
                <el-rate v-model="item.avgRating" disabled :max="5" size="small" />
              </div>
            </div>
            <el-empty v-else description="暂无数据" />
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { checkinApi } from '@/api'
import * as echarts from 'echarts'
import dayjs from 'dayjs'

const loading = ref(false)
const review = ref(null)
const selectedMonth = ref(dayjs().format('YYYY-MM'))
const dailyChart = ref(null)
const cuisineChart = ref(null)
let dailyChartInstance = null
let cuisineChartInstance = null

const loadReview = async () => {
  if (!selectedMonth.value) return

  loading.value = true
  try {
    const [year, month] = selectedMonth.value.split('-').map(Number)
    review.value = await checkinApi.monthReview(year, month)
    await nextTick()
    renderCharts()
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const renderCharts = () => {
  if (dailyChart.value && review.value) {
    if (!dailyChartInstance) {
      dailyChartInstance = echarts.init(dailyChart.value)
    }

    const dailyData = review.value.dailyCheckins || []
    const dates = []
    const counts = []
    const [year, month] = selectedMonth.value.split('-').map(Number)
    const daysInMonth = dayjs(`${year}-${month}`).daysInMonth()
    
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      dates.push(String(i))
      const found = dailyData.find(d => d.date === dateStr)
      counts.push(found ? found.count : 0)
    }

    dailyChartInstance.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: { fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        minInterval: 1
      },
      series: [{
        data: counts,
        type: 'bar',
        itemStyle: { color: '#409eff' },
        barWidth: '60%'
      }]
    })
  }

  if (cuisineChart.value && review.value) {
    if (!cuisineChartInstance) {
      cuisineChartInstance = echarts.init(cuisineChart.value)
    }

    const cuisineData = review.value.cuisineDistribution || {}
    const pieData = Object.entries(cuisineData).map(([name, value]) => ({ name, value }))

    cuisineChartInstance.setOption({
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 16, fontWeight: 'bold' }
        },
        data: pieData,
        color: ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#9c27b0', '#00bcd4']
      }]
    })
  }
}

const handleResize = () => {
  dailyChartInstance?.resize()
  cuisineChartInstance?.resize()
}

onMounted(() => {
  loadReview()
  window.addEventListener('resize', handleResize)
})

watch(selectedMonth, () => {
  loadReview()
})
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    margin: 0;
  }
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;

  .stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 28px;

    &.checkins { background: linear-gradient(135deg, #667eea, #764ba2); }
    &.restaurants { background: linear-gradient(135deg, #f093fb, #f5576c); }
    &.amount { background: linear-gradient(135deg, #4facfe, #00f2fe); }
    &.rating { background: linear-gradient(135deg, #fa709a, #fee140); }
  }

  .stat-content {
    .stat-value {
      font-size: 28px;
      font-weight: bold;
      color: #303133;
    }

    .stat-label {
      font-size: 14px;
      color: #909399;
    }
  }
}

.charts-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 20px;

  .chart-card {
    .chart {
      height: 300px;
    }
  }
}

.lists-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  .list-card {
    .rank-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .rank-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f5f7fa;
      border-radius: 6px;

      .rank {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-weight: bold;
        font-size: 14px;

        &.rank-1 { background: #f56c6c; }
        &.rank-2 { background: #e6a23c; }
        &.rank-3 { background: #67c23a; }
        &.rank-4, &.rank-5 { background: #909399; }
      }

      .rank-info {
        flex: 1;

        .name {
          font-weight: bold;
        }

        .sub {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts-row,
  .lists-row {
    grid-template-columns: 1fr;
  }
}
</style>
