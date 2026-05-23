<template>
  <div class="stats-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><DataLine /></el-icon>
          <span>访问统计</span>
          <el-tag class="code-tag" type="info">{{ code }}</el-tag>
          <el-button link type="primary" @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
        </div>
      </template>

      <div class="summary">
        <el-statistic title="总点击数" :value="totalCount" />
      </div>

      <el-divider />

      <div class="days-selector">
        <span>选择时间范围：</span>
        <el-radio-group v-model="days" size="small" @change="fetchStats">
          <el-radio-button :value="7">近 7 天</el-radio-button>
          <el-radio-button :value="14">近 14 天</el-radio-button>
          <el-radio-button :value="30">近 30 天</el-radio-button>
        </el-radio-group>
      </div>

      <div v-loading="loading" class="chart-wrapper">
        <v-chart
          v-if="chartOption"
          class="chart"
          :option="chartOption"
          autoresize
        />
        <el-empty v-else description="暂无数据" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components'
import request from '../utils/request'

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
])

const route = useRoute()
const router = useRouter()
const code = computed(() => route.params.code || '')

const days = ref(7)
const totalCount = ref(0)
const statsData = ref([])
const loading = ref(false)

const chartOption = computed(() => {
  if (!statsData.value || statsData.value.length === 0) return null
  const dates = statsData.value.map((i) => i.day)
  const counts = statsData.value.map((i) => i.cnt)
  return {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: {
      type: 'value',
      minInterval: 1
    },
    series: [
      {
        name: '点击数',
        type: 'line',
        smooth: true,
        data: counts,
        areaStyle: {
          opacity: 0.2
        },
        lineStyle: {
          width: 2
        },
        itemStyle: {
          color: '#409EFF'
        }
      }
    ]
  }
})

const fetchStats = async () => {
  loading.value = true
  try {
    const res = await request.get(`/short/stats/${code.value}`, {
      params: { days: days.value }
    })
    totalCount.value = res.data?.total || 0
    statsData.value = res.data?.daily || []
  } catch (e) {
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

onMounted(fetchStats)
</script>

<style scoped>
.stats-container {
  padding: 24px;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
}
.code-tag {
  margin-left: auto;
}
.summary {
  padding: 16px 0;
}
.days-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.chart-wrapper {
  width: 100%;
  min-height: 360px;
}
.chart {
  width: 100%;
  height: 360px;
}
</style>
