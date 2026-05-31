<template>
  <div class="monitor-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>实时监控 - {{ task?.name || '加载中...' }}</span>
          <div>
            <el-tag :type="getStatusType(task?.status)" size="large">
              {{ getStatusText(task?.status) }}
            </el-tag>
            <el-button style="margin-left: 10px" @click="goBack">返回</el-button>
          </div>
        </div>
      </template>

      <el-row :gutter="20" class="stat-row">
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">当前QPS</div>
            <div class="stat-value qps">{{ currentMetrics.qps || 0 }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">平均响应时间</div>
            <div class="stat-value rt">{{ currentMetrics.avg_rt || 0 }} ms</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">P95响应时间</div>
            <div class="stat-value p95">{{ currentMetrics.p95_rt || 0 }} ms</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">错误率</div>
            <div class="stat-value err">{{ currentMetrics.error_rate || 0 }}%</div>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px">
        <el-col :span="12">
          <el-card>
            <template #header><span>QPS 趋势</span></template>
            <div ref="qpsChartRef" class="chart"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <template #header><span>响应时间趋势</span></template>
            <div ref="rtChartRef" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px">
        <el-col :span="12">
          <el-card>
            <template #header><span>成功/失败请求数</span></template>
            <div ref="countChartRef" class="chart"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <template #header><span>响应时间分布 (P50/P95/P99)</span></template>
            <div ref="percentileChartRef" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>

      <el-row style="margin-top: 20px">
        <el-col :span="24">
          <el-card>
            <template #header><span>实时指标明细</span></template>
            <el-table :data="metricsData" size="small" max-height="300">
              <el-table-column prop="timestamp" label="时间" width="180">
                <template #default="{ row }">
                  {{ formatTime(row.timestamp) }}
                </template>
              </el-table-column>
              <el-table-column prop="qps" label="QPS" width="100" />
              <el-table-column prop="avg_rt" label="Avg RT(ms)" width="120" />
              <el-table-column prop="p50_rt" label="P50(ms)" width="100" />
              <el-table-column prop="p95_rt" label="P95(ms)" width="100" />
              <el-table-column prop="p99_rt" label="P99(ms)" width="100" />
              <el-table-column prop="min_rt" label="Min(ms)" width="100" />
              <el-table-column prop="max_rt" label="Max(ms)" width="100" />
              <el-table-column prop="success_count" label="成功数" width="100" />
              <el-table-column prop="error_count" label="失败数" width="100" />
              <el-table-column prop="error_rate" label="错误率(%)" width="120" />
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { taskApi, metricsApi } from '@/api'

const route = useRoute()
const router = useRouter()

const taskId = route.params.id

const task = ref(null)
const metricsData = ref([])
const currentMetrics = ref({})

const qpsChartRef = ref(null)
const rtChartRef = ref(null)
const countChartRef = ref(null)
const percentileChartRef = ref(null)

let qpsChart = null
let rtChart = null
let countChart = null
let percentileChart = null
let timer = null

const getStatusType = (status) => {
  const types = ['info', 'success', '', 'warning', 'danger']
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = ['待执行', '执行中', '已完成', '已中止', '失败']
  return texts[status] || '未知'
}

const formatTime = (time) => {
  if (!time) return ''
  const d = new Date(time)
  return d.toLocaleTimeString('zh-CN', { hour12: false })
}

const initCharts = () => {
  const commonOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: [] },
    yAxis: { type: 'value' },
    series: []
  }

  qpsChart = echarts.init(qpsChartRef.value)
  qpsChart.setOption({ ...commonOption, series: [{ name: 'QPS', type: 'line', smooth: true, areaStyle: {} }] })

  rtChart = echarts.init(rtChartRef.value)
  rtChart.setOption({ ...commonOption, series: [{ name: 'Avg RT', type: 'line', smooth: true, color: '#67c23a' }] })

  countChart = echarts.init(countChartRef.value)
  countChart.setOption({
    ...commonOption,
    legend: { data: ['成功数', '失败数'] },
    series: [
      { name: '成功数', type: 'line', smooth: true, stack: 'count', areaStyle: {}, color: '#67c23a' },
      { name: '失败数', type: 'line', smooth: true, stack: 'count', areaStyle: {}, color: '#f56c6c' }
    ]
  })

  percentileChart = echarts.init(percentileChartRef.value)
  percentileChart.setOption({
    ...commonOption,
    legend: { data: ['P50', 'P95', 'P99'] },
    series: [
      { name: 'P50', type: 'line', smooth: true, color: '#409EFF' },
      { name: 'P95', type: 'line', smooth: true, color: '#E6A23C' },
      { name: 'P99', type: 'line', smooth: true, color: '#F56C6C' }
    ]
  })
}

const updateCharts = () => {
  const timestamps = metricsData.value.map(m => formatTime(m.timestamp))
  const qps = metricsData.value.map(m => m.qps)
  const avgRt = metricsData.value.map(m => m.avg_rt)
  const p50 = metricsData.value.map(m => m.p50_rt)
  const p95 = metricsData.value.map(m => m.p95_rt)
  const p99 = metricsData.value.map(m => m.p99_rt)
  const success = metricsData.value.map(m => m.success_count)
  const errors = metricsData.value.map(m => m.error_count)

  qpsChart.setOption({ xAxis: { data: timestamps }, series: [{ data: qps }] })
  rtChart.setOption({ xAxis: { data: timestamps }, series: [{ data: avgRt }] })
  countChart.setOption({
    xAxis: { data: timestamps },
    series: [
      { data: success },
      { data: errors }
    ]
  })
  percentileChart.setOption({
    xAxis: { data: timestamps },
    series: [
      { data: p50 },
      { data: p95 },
      { data: p99 }
    ]
  })

  if (metricsData.value.length > 0) {
    currentMetrics.value = metricsData.value[metricsData.value.length - 1]
  }
}

const loadTask = async () => {
  try {
    task.value = await taskApi.get(taskId)
  } catch (e) {
    console.error(e)
  }
}

const loadMetrics = async () => {
  try {
    const data = await metricsApi.getTaskMetrics(taskId, 120)
    if (data && data.length > 0) {
      metricsData.value = data
      updateCharts()
    }
  } catch (e) {
    console.error(e)
  }
}

const startPolling = () => {
  timer = setInterval(async () => {
    await loadTask()
    if (task.value?.status === 1) {
      await loadMetrics()
    } else if (task.value?.status >= 2) {
      await loadMetrics()
      stopPolling()
    }
  }, 2000)
}

const stopPolling = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const goBack = () => {
  router.back()
}

onMounted(async () => {
  await loadTask()
  await loadMetrics()
  await nextTick()
  initCharts()
  updateCharts()
  if (task.value?.status === 1) {
    startPolling()
  }
})

onUnmounted(() => {
  stopPolling()
  qpsChart?.dispose()
  rtChart?.dispose()
  countChart?.dispose()
  percentileChart?.dispose()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-row {
  margin-bottom: 20px;
}

.stat-item {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  border-radius: 8px;
  color: white;
  text-align: center;
}

.stat-item:nth-child(2) {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.stat-item:nth-child(3) {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-item:nth-child(4) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  margin-top: 8px;
}

.chart {
  height: 300px;
}
</style>
