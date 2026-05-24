<template>
  <div class="stats-page" v-loading="loading">
    <el-row :gutter="16" class="stats-row">
      <el-col :xs="24" :sm="12" :md="8" :lg="4" v-for="item in cards" :key="item.key">
        <el-card class="stat-card" shadow="hover" :body-style="{ padding: '20px' }">
          <div class="stat-inner">
            <div class="stat-icon" :style="{ background: item.color }">
              <el-icon :size="24" color="#fff">
                <component :is="item.icon" />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ item.value }}</div>
              <div class="stat-label">{{ item.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :xs="24" :md="12">
        <el-card shadow="never">
          <template #header>
            <div class="chart-header">
              <el-icon :size="20" color="#409EFF"><PieChart /></el-icon>
              <span>按分类统计</span>
            </div>
          </template>
          <div ref="categoryChartRef" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="never">
          <template #header>
            <div class="chart-header">
              <el-icon :size="20" color="#409EFF"><Histogram /></el-icon>
              <span>按区域统计</span>
            </div>
          </template>
          <div ref="areaChartRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, computed } from 'vue'
import * as echarts from 'echarts'
import { getStatistics } from '../api'

const loading = ref(false)
const data = ref({})
const categoryChartRef = ref(null)
const areaChartRef = ref(null)
let categoryChart = null
let areaChart = null

const cards = computed(() => {
  const d = data.value || {}
  return [
    { key: 'total', label: '投诉总数', value: d.total ?? 0, color: '#409EFF', icon: 'DataBoard' },
    { key: 'pending', label: '待受理', value: d.pending ?? 0, color: '#E6A23C', icon: 'Clock' },
    { key: 'processing', label: '处理中', value: d.processing ?? 0, color: '#67C23A', icon: 'Loading' },
    { key: 'completed', label: '已完成', value: d.completed ?? 0, color: '#606266', icon: 'CircleCheck' },
    { key: 'satisfaction', label: '平均满意度', value: d.avgRating ? d.avgRating.toFixed(1) + ' 分' : '-', color: '#F56C6C', icon: 'Star' }
  ]
})

const resizeHandler = () => {
  categoryChart && categoryChart.resize()
  areaChart && areaChart.resize()
}

const initCategoryChart = () => {
  if (!categoryChartRef.value) return
  categoryChart = echarts.init(categoryChartRef.value)
  const list = (data.value && data.value.byCategory) || []
  categoryChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, type: 'scroll' },
    series: [
      {
        name: '分类',
        type: 'pie',
        radius: ['45%', '70%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: true, formatter: '{b}\n{c}' },
        data: list.map((item) => ({ name: item.name, value: item.value }))
      }
    ]
  })
}

const initAreaChart = () => {
  if (!areaChartRef.value) return
  areaChart = echarts.init(areaChartRef.value)
  const list = (data.value && data.value.byArea) || []
  areaChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 40, right: 20, top: 20, bottom: 40, containLabel: true },
    xAxis: {
      type: 'category',
      data: list.map((i) => i.name),
      axisLabel: { rotate: 20 }
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '数量',
        type: 'bar',
        barMaxWidth: 40,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#409EFF' },
            { offset: 1, color: '#79bbff' }
          ])
        },
        data: list.map((i) => i.value)
      }
    ]
  })
}

const loadData = async () => {
  loading.value = true
  try {
    const d = await getStatistics()
    data.value = d || {}
  } catch (e) {
    data.value = {}
  } finally {
    loading.value = false
    initCategoryChart()
    initAreaChart()
  }
}

onMounted(() => {
  window.addEventListener('resize', resizeHandler)
  loadData()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeHandler)
  categoryChart && categoryChart.dispose()
  areaChart && areaChart.dispose()
})
</script>

<style scoped>
.stats-page {
  max-width: 1400px;
  margin: 0 auto;
}

.stat-card {
  border-radius: 8px;
}

.stat-inner {
  display: flex;
  align-items: center;
  gap: 14px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.chart-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
}

.chart {
  width: 100%;
  height: 360px;
}
</style>
