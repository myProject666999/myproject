<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">📊 监控大屏</h1>
      <div>
        <span style="margin-right: 16px; font-size: 13px; color: var(--text-secondary)">
          自动刷新：
          <select v-model="refreshInterval" @change="setupAutoRefresh" class="form-input" style="width: auto; display: inline-block; padding: 4px 8px; margin-left: 4px">
            <option :value="0">关闭</option>
            <option :value="5">5秒</option>
            <option :value="10">10秒</option>
            <option :value="30">30秒</option>
            <option :value="60">1分钟</option>
          </select>
        </span>
        <button class="btn" @click="loadData">🔄 刷新</button>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-label">节点总数</div>
        <div class="stat-value">{{ summary.total }}</div>
      </div>
      <div class="stat-card stat-online">
        <div class="stat-label">在线</div>
        <div class="stat-value">{{ summary.online }}</div>
      </div>
      <div class="stat-card stat-offline">
        <div class="stat-label">离线</div>
        <div class="stat-value">{{ summary.offline }}</div>
      </div>
      <div class="stat-card stat-alert">
        <div class="stat-label">告警中</div>
        <div class="stat-value">{{ summary.alerting }}</div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px">
      <div class="card">
        <h3 style="margin-bottom: 16px; font-size: 16px">CPU 使用率</h3>
        <div ref="cpuChartEl" style="height: 220px"></div>
      </div>
      <div class="card">
        <h3 style="margin-bottom: 16px; font-size: 16px">内存使用率</h3>
        <div ref="memChartEl" style="height: 220px"></div>
      </div>
    </div>

    <div class="card">
      <h3 style="margin-bottom: 16px; font-size: 16px">节点状态</h3>
      <table>
        <thead>
          <tr>
            <th>节点</th>
            <th>IP</th>
            <th>分组</th>
            <th>状态</th>
            <th>CPU</th>
            <th>内存</th>
            <th>磁盘</th>
            <th>最近上报</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in metrics" :key="m.node_id">
            <td><strong>{{ m.node_name }}</strong></td>
            <td style="font-family: monospace">{{ getNodeIP(m.node_id) }}</td>
            <td>{{ getNodeGroup(m.node_id) }}</td>
            <td><span :class="['status-badge', m.status === 'online' ? 'status-online' : 'status-offline']">{{ m.status === 'online' ? '在线' : '离线' }}</span></td>
            <td :style="{ color: m.cpu > 80 ? 'var(--accent-red)' : m.cpu > 60 ? 'var(--accent-yellow)' : 'var(--accent-green)' }">{{ m.cpu.toFixed(1) }}%</td>
            <td :style="{ color: m.memory > 80 ? 'var(--accent-red)' : m.memory > 60 ? 'var(--accent-yellow)' : 'var(--accent-blue)' }">{{ m.memory.toFixed(1) }}%</td>
            <td :style="{ color: m.disk > 80 ? 'var(--accent-red)' : m.disk > 60 ? 'var(--accent-yellow)' : 'var(--accent-purple)' }">{{ m.disk.toFixed(1) }}%</td>
            <td style="font-size: 12px; color: var(--text-secondary)">{{ formatTime(m.created_at) }}</td>
            <td>
              <button class="btn btn-sm" @click="$router.push(`/nodes/${m.node_id}`)">详情</button>
            </td>
          </tr>
          <tr v-if="metrics.length === 0">
            <td colspan="9" class="empty-state">暂无节点数据</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { api } from '../api'
import * as echarts from 'echarts'

const metrics = ref([])
const nodes = ref([])
const refreshInterval = ref(10)
let timer = null
let cpuChart = null
let memChart = null
const cpuChartEl = ref(null)
const memChartEl = ref(null)

const summary = ref({ total: 0, online: 0, offline: 0, alerting: 0 })

async function loadData() {
  try {
    const [m, n] = await Promise.all([
      api.getLatestMetrics(),
      api.getNodes()
    ])
    metrics.value = m || []
    nodes.value = n || []
    computeSummary()
    await nextTick()
    renderCharts()
  } catch (e) {
    console.error(e)
  }
}

function computeSummary() {
  const s = { total: nodes.value.length, online: 0, offline: 0, alerting: 0 }
  nodes.value.forEach(n => {
    if (n.status === 'online') s.online++
    else s.offline++
  })
  metrics.value.forEach(m => {
    if (m.cpu > 80 || m.memory > 80 || m.disk > 80) s.alerting++
  })
  summary.value = s
}

function getNodeIP(nodeId) {
  const n = nodes.value.find(n => n.id === nodeId)
  return n ? n.ip : '-'
}

function getNodeGroup(nodeId) {
  const n = nodes.value.find(n => n.id === nodeId)
  return n ? (n.group || '-') : '-'
}

function formatTime(t) {
  if (!t) return '-'
  const d = new Date(t)
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 60) return Math.floor(diff) + '秒前'
  if (diff < 3600) return Math.floor(diff / 60) + '分钟前'
  return d.toLocaleString('zh-CN')
}

function renderCharts() {
  if (!cpuChartEl.value || !memChartEl.value) return

  const names = metrics.value.map(m => m.node_name)
  const cpuData = metrics.value.map(m => +m.cpu.toFixed(1))
  const memData = metrics.value.map(m => +m.memory.toFixed(1))

  if (cpuChart) cpuChart.dispose()
  if (memChart) memChart.dispose()

  cpuChart = echarts.init(cpuChartEl.value, 'dark')
  cpuChart.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: names, axisLabel: { fontSize: 11 } },
    yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
    series: [{
      type: 'bar',
      data: cpuData.map(v => ({
        value: v,
        itemStyle: { color: v > 80 ? '#f85149' : v > 60 ? '#d29922' : '#3fb950' }
      })),
      barWidth: '40%'
    }]
  })

  memChart = echarts.init(memChartEl.value, 'dark')
  memChart.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: names, axisLabel: { fontSize: 11 } },
    yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
    series: [{
      type: 'bar',
      data: memData.map(v => ({
        value: v,
        itemStyle: { color: v > 80 ? '#f85149' : v > 60 ? '#d29922' : '#58a6ff' }
      })),
      barWidth: '40%'
    }]
  })
}

function setupAutoRefresh() {
  if (timer) clearInterval(timer)
  if (refreshInterval.value > 0) {
    timer = setInterval(loadData, refreshInterval.value * 1000)
  }
}

onMounted(() => {
  loadData()
  setupAutoRefresh()
  window.addEventListener('resize', renderCharts)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  window.removeEventListener('resize', renderCharts)
  if (cpuChart) cpuChart.dispose()
  if (memChart) memChart.dispose()
})
</script>

<style scoped>
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
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
  font-size: 32px;
  font-weight: 700;
}
.stat-online .stat-value { color: var(--accent-green); }
.stat-offline .stat-value { color: var(--accent-red); }
.stat-alert .stat-value { color: var(--accent-yellow); }
</style>
