<template>
  <div class="report-page">
    <div class="card report-header">
      <h1 class="page-title">测试报告</h1>
      <p class="page-desc">查看历史测试数据，对比不同区域和时间点的性能表现</p>

      <div class="filter-bar">
        <div class="filter-item">
          <label>URL</label>
          <input v-model="filterUrl" class="input-field" placeholder="输入 URL 筛选" />
        </div>
        <div class="filter-item">
          <label>区域</label>
          <select v-model="filterRegion" class="input-field">
            <option value="">全部区域</option>
            <option v-for="r in regions" :key="r.code" :value="r.code">{{ r.name }}</option>
          </select>
        </div>
        <div class="filter-item">
          <button class="btn btn-primary" @click="loadHistory">查询</button>
        </div>
      </div>
    </div>

    <div v-if="history.length > 0" class="report-content">
      <div class="card chart-section">
        <h2 class="section-title">TTFB 趋势</h2>
        <div class="chart-container">
          <canvas ref="ttfbChart"></canvas>
        </div>
      </div>

      <div class="card chart-section">
        <h2 class="section-title">DOM Ready 趋势</h2>
        <div class="chart-container">
          <canvas ref="domChart"></canvas>
        </div>
      </div>

      <div class="card chart-section">
        <h2 class="section-title">各阶段耗时对比（最新测试）</h2>
        <div class="chart-container">
          <canvas ref="phaseChart"></canvas>
        </div>
      </div>

      <div class="card table-section">
        <h2 class="section-title">历史记录</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>时间</th>
              <th>URL</th>
              <th>区域</th>
              <th>DNS</th>
              <th>TCP</th>
              <th>TLS</th>
              <th>TTFB</th>
              <th>DOM</th>
              <th>总计</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in history" :key="item.id">
              <td>{{ formatTime(item.createdAt) }}</td>
              <td class="url-cell" :title="item.url">{{ item.url }}</td>
              <td>{{ item.regionName }}</td>
              <td>{{ item.dnsLookup }}ms</td>
              <td>{{ item.tcpConnect }}ms</td>
              <td>{{ item.tlsHandshake }}ms</td>
              <td class="highlight-cell">{{ item.ttfb }}ms</td>
              <td class="highlight-cell">{{ item.domReady }}ms</td>
              <td class="total-cell">{{ item.totalTime }}ms</td>
              <td>
                <span v-if="item.error" class="tag tag-red">失败</span>
                <span v-else class="tag tag-green">{{ item.statusCode }}</span>
              </td>
              <td>
                <button class="btn btn-secondary btn-sm" @click="viewDetail(item)">详情</button>
                <button class="btn btn-danger btn-sm" @click="deleteRecord(item)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="card empty-state">
      <p>暂无测试记录，前往 <router-link to="/test">速度测试</router-link> 页面开始测试</p>
    </div>

    <div v-if="showDetail" class="modal-overlay" @click="showDetail = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>测试详情</h3>
          <button class="modal-close" @click="showDetail = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="detail-row"><span>URL:</span><span>{{ detailItem?.url }}</span></div>
          <div class="detail-row"><span>区域:</span><span>{{ detailItem?.regionName }}</span></div>
          <div class="detail-row"><span>DNS 解析:</span><span>{{ detailItem?.dnsLookup }} ms</span></div>
          <div class="detail-row"><span>TCP 连接:</span><span>{{ detailItem?.tcpConnect }} ms</span></div>
          <div class="detail-row"><span>TLS 握手:</span><span>{{ detailItem?.tlsHandshake }} ms</span></div>
          <div class="detail-row"><span>TTFB:</span><span>{{ detailItem?.ttfb }} ms</span></div>
          <div class="detail-row"><span>内容下载:</span><span>{{ detailItem?.contentDownload }} ms</span></div>
          <div class="detail-row"><span>DOM Ready:</span><span>{{ detailItem?.domReady }} ms</span></div>
          <div class="detail-row"><span>加载完成:</span><span>{{ detailItem?.loadComplete }} ms</span></div>
          <div class="detail-row"><span>总耗时:</span><span>{{ detailItem?.totalTime }} ms</span></div>
          <div class="detail-row"><span>状态码:</span><span>{{ detailItem?.statusCode }}</span></div>
          <div v-if="detailItem?.error" class="detail-row"><span>错误:</span><span>{{ detailItem.error }}</span></div>
          <div class="detail-row"><span>测试时间:</span><span>{{ formatTime(detailItem?.createdAt) }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import { getRegions, getTestHistory, deleteTest } from '../api/index.js'

Chart.register(...registerables)

const regions = ref([])
const filterUrl = ref('')
const filterRegion = ref('')
const history = ref([])
const showDetail = ref(false)
const detailItem = ref(null)

const ttfbChart = ref(null)
const domChart = ref(null)
const phaseChart = ref(null)

let ttfbChartInstance = null
let domChartInstance = null
let phaseChartInstance = null

onMounted(async () => {
  try {
    const res = await getRegions()
    regions.value = res.data.regions
  } catch (e) {
    console.error(e)
  }
  loadHistory()
})

const loadHistory = async () => {
  try {
    const params = { limit: 100 }
    if (filterUrl.value) params.url = filterUrl.value
    if (filterRegion.value) params.region = filterRegion.value
    const res = await getTestHistory(params)
    history.value = res.data.results
    await nextTick()
    renderCharts()
  } catch (e) {
    console.error(e)
  }
}

const renderCharts = () => {
  const sorted = [...history.value].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  const labels = sorted.map(r => formatTime(r.createdAt, true))

  if (ttfbChartInstance) ttfbChartInstance.destroy()
  if (domChartInstance) domChartInstance.destroy()
  if (phaseChartInstance) phaseChartInstance.destroy()

  ttfbChartInstance = new Chart(ttfbChart.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'TTFB (ms)',
        data: sorted.map(r => r.ttfb),
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        fill: true,
        tension: 0.3,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'ms' } }
      }
    }
  })

  domChartInstance = new Chart(domChart.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'DOM Ready (ms)',
        data: sorted.map(r => r.domReady),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.3,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'ms' } }
      }
    }
  })

  if (sorted.length > 0) {
    const latest = sorted[sorted.length - 1]
    phaseChartInstance = new Chart(phaseChart.value, {
      type: 'bar',
      data: {
        labels: ['DNS', 'TCP', 'TLS', 'TTFB', '下载', 'DOM'],
        datasets: [{
          label: '耗时 (ms)',
          data: [latest.dnsLookup, latest.tcpConnect, latest.tlsHandshake, latest.ttfb, latest.contentDownload, latest.domReady],
          backgroundColor: ['#60a5fa', '#a78bfa', '#f472b6', '#f59e0b', '#34d399', '#667eea'],
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'ms' } }
        }
      }
    })
  }
}

const viewDetail = (item) => {
  detailItem.value = item
  showDetail.value = true
}

const deleteRecord = async (item) => {
  if (!confirm('确定删除这条记录吗？')) return
  try {
    await deleteTest(item.id)
    history.value = history.value.filter(r => r.id !== item.id)
    renderCharts()
  } catch (e) {
    console.error(e)
  }
}

const formatTime = (t, short = false) => {
  if (!t) return ''
  const d = new Date(t)
  if (short) {
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  }
  return d.toLocaleString('zh-CN')
}
</script>

<style scoped>
.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.page-desc {
  color: #6b7280;
  margin-bottom: 24px;
}

.filter-bar {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-item label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.filter-item .input-field {
  min-width: 200px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 16px;
}

.chart-section {
  padding: 24px;
}

.chart-container {
  height: 300px;
  position: relative;
}

.table-section {
  padding: 24px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table th {
  text-align: left;
  padding: 12px 10px;
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
}

.data-table td {
  padding: 12px 10px;
  border-bottom: 1px solid #f3f4f6;
  color: #4b5563;
  white-space: nowrap;
}

.data-table tr:hover {
  background: #f9fafb;
}

.url-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.highlight-cell {
  color: #667eea;
  font-weight: 600;
}

.total-cell {
  font-weight: 700;
  color: #1f2937;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
  margin-right: 4px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
}

.empty-state a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #fff;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 700;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #9ca3af;
}

.modal-body {
  padding: 20px 24px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row span:first-child {
  color: #6b7280;
}

.detail-row span:last-child {
  color: #1f2937;
  font-weight: 500;
}
</style>
