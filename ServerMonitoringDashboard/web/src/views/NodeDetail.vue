<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">🖥️ 节点详情 - {{ node?.name || '加载中...' }}</h1>
        <div style="margin-top: 4px; font-size: 13px; color: var(--text-secondary)">
          <span v-if="node">IP: {{ node.ip }}</span>
          <span v-if="node?.group" style="margin-left: 12px">分组: {{ node.group }}</span>
          <span v-if="node" style="margin-left: 12px">Token: <code style="background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px">{{ node.token }}</code></span>
          <span v-if="node" style="margin-left: 12px">
            状态: <span :class="['status-badge', node.status === 'online' ? 'status-online' : 'status-offline']">{{ node.status === 'online' ? '在线' : '离线' }}</span>
          </span>
        </div>
      </div>
      <div>
        <button class="btn" @click="$router.back()">← 返回</button>
      </div>
    </div>

    <div v-if="latest" class="stats-row">
      <div class="stat-card">
        <div class="stat-label">CPU 使用率</div>
        <div class="stat-value" :style="{ color: latest.cpu > 80 ? 'var(--accent-red)' : 'var(--accent-green)' }">{{ latest.cpu.toFixed(1) }}%</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">内存使用率</div>
        <div class="stat-value" :style="{ color: latest.memory > 80 ? 'var(--accent-red)' : 'var(--accent-blue)' }">{{ latest.memory.toFixed(1) }}%</div>
        <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px">{{ formatBytes(latest.mem_used) }} / {{ formatBytes(latest.mem_total) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">磁盘使用率</div>
        <div class="stat-value" :style="{ color: latest.disk > 80 ? 'var(--accent-red)' : 'var(--accent-purple)' }">{{ latest.disk.toFixed(1) }}%</div>
        <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px">{{ formatBytes(latest.disk_used) }} / {{ formatBytes(latest.disk_total) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">最近上报</div>
        <div class="stat-value" style="font-size: 18px">{{ formatTime(latest.created_at) }}</div>
      </div>
    </div>

    <div class="card" style="margin-top: 20px">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px">
        <h3 style="font-size: 16px">历史趋势</h3>
        <div>
          <span style="font-size: 13px; color: var(--text-secondary); margin-right: 8px">时间范围：</span>
          <select v-model="hours" @change="loadMetrics" class="form-input" style="width: auto; display: inline-block; padding: 4px 8px">
            <option :value="1">近1小时</option>
            <option :value="6">近6小时</option>
            <option :value="24">近24小时</option>
            <option :value="72">近3天</option>
            <option :value="168">近7天</option>
          </select>
        </div>
      </div>
      <div ref="chartEl" style="height: 320px"></div>
    </div>

    <div class="card" style="margin-top: 20px">
      <h3 style="margin-bottom: 16px; font-size: 16px">最近指标记录</h3>
      <table>
        <thead>
          <tr>
            <th>时间</th>
            <th>CPU</th>
            <th>内存</th>
            <th>磁盘</th>
            <th>内存已用</th>
            <th>磁盘已用</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in recentMetrics" :key="m.id">
            <td style="font-size: 12px">{{ formatTime(m.created_at) }}</td>
            <td>{{ m.cpu.toFixed(1) }}%</td>
            <td>{{ m.memory.toFixed(1) }}%</td>
            <td>{{ m.disk.toFixed(1) }}%</td>
            <td>{{ formatBytes(m.mem_used) }}</td>
            <td>{{ formatBytes(m.disk_used) }}</td>
          </tr>
          <tr v-if="recentMetrics.length === 0">
            <td colspan="6" class="empty-state">暂无数据</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../api'
import * as echarts from 'echarts'

const route = useRoute()
const nodeId = route.params.id

const node = ref(null)
const latest = ref(null)
const metrics = ref([])
const hours = ref(24)
let chart = null
const chartEl = ref(null)

const recentMetrics = computed(() => metrics.value.slice(-20).reverse())

async function loadAll() {
  try {
    const [n, l] = await Promise.all([
      api.getNode(nodeId),
      api.getLatestNodeMetric(nodeId)
    ])
    node.value = n
    latest.value = l
    await loadMetrics()
  } catch (e) {
    console.error(e)
  }
}

async function loadMetrics() {
  try {
    metrics.value = await api.getNodeMetrics(nodeId, hours.value)
    await nextTick()
    renderChart()
  } catch (e) {
    console.error(e)
  }
}

function renderChart() {
  if (!chartEl.value) return
  if (chart) chart.dispose()

  const times = metrics.value.map(m => new Date(m.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }))
  const cpuData = metrics.value.map(m => +m.cpu.toFixed(1))
  const memData = metrics.value.map(m => +m.memory.toFixed(1))
  const diskData = metrics.value.map(m => +m.disk.toFixed(1))

  chart = echarts.init(chartEl.value, 'dark')
  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    legend: { data: ['CPU', '内存', '磁盘'], textStyle: { color: '#e6edf3' } },
    grid: { left: 50, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: times, axisLabel: { fontSize: 10, interval: Math.floor(times.length / 10) } },
    yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
    series: [
      { name: 'CPU', type: 'line', data: cpuData, smooth: true, lineStyle: { color: '#3fb950' }, itemStyle: { color: '#3fb950' }, areaStyle: { color: 'rgba(63,185,80,0.1)' } },
      { name: '内存', type: 'line', data: memData, smooth: true, lineStyle: { color: '#58a6ff' }, itemStyle: { color: '#58a6ff' }, areaStyle: { color: 'rgba(88,166,255,0.1)' } },
      { name: '磁盘', type: 'line', data: diskData, smooth: true, lineStyle: { color: '#a371f7' }, itemStyle: { color: '#a371f7' }, areaStyle: { color: 'rgba(163,113,247,0.1)' } }
    ]
  })
}

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024
    i++
  }
  return bytes.toFixed(1) + ' ' + units[i]
}

function formatTime(t) {
  if (!t) return '-'
  const d = new Date(t)
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 60) return Math.floor(diff) + '秒前'
  if (diff < 3600) return Math.floor(diff / 60) + '分钟前'
  if (diff < 86400) return Math.floor(diff / 3600) + '小时前'
  return d.toLocaleString('zh-CN')
}

onMounted(() => {
  loadAll()
  window.addEventListener('resize', renderChart)
})

onUnmounted(() => {
  window.removeEventListener('resize', renderChart)
  if (chart) chart.dispose()
})
</script>

<style scoped>
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 4px;
}
.stat-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
}
.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}
.stat-value {
  font-size: 28px;
  font-weight: 700;
}
</style>
