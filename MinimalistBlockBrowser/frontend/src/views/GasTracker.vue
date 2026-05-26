<template>
  <div class="detail-page">
    <div class="container">
      <div class="detail-header">
        <h1 class="detail-title">Gas 追踪器</h1>
        <span v-if="currentGas" class="detail-badge">实时</span>
      </div>

      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <div class="loading-text">加载中...</div>
      </div>

      <div v-else>
        <div v-if="currentGasError" class="error-box" style="margin-bottom: 24px;">
          <div class="error-title">当前 Gas 加载失败</div>
          <div class="error-message">{{ currentGasError }}</div>
        </div>

        <div class="gas-grid">
          <div class="gas-card low">
            <div class="gas-label">慢速</div>
            <div class="gas-value text-green">{{ formatGasValue(currentGas?.low) }}</div>
            <div class="gas-unit">gwei</div>
          </div>
          <div class="gas-card average">
            <div class="gas-label">标准</div>
            <div class="gas-value text-orange">{{ formatGasValue(currentGas?.average) }}</div>
            <div class="gas-unit">gwei</div>
          </div>
          <div class="gas-card high">
            <div class="gas-label">快速</div>
            <div class="gas-value text-red">{{ formatGasValue(currentGas?.high) }}</div>
            <div class="gas-unit">gwei</div>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-section-header">当前 Gas 详情</div>
          <div class="detail-section-body">
            <div class="detail-row">
              <div class="detail-label">基础手续费</div>
              <div class="detail-value">{{ currentGas?.baseFee || '--' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">当前 Gas 价格</div>
              <div class="detail-value text-orange">{{ currentGas?.gasPrice || '--' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">更新时间</div>
              <div class="detail-value">{{ formatTimestamp(currentGas?.timestamp) }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">数据来源</div>
              <div class="detail-value">
                <span class="detail-badge" :style="sourceStyle">{{ source.toUpperCase() }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-section-header">
            Gas 历史记录
            <select
              v-model="selectedHours"
              @change="loadHistory"
              style="margin-left: auto; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 6px; padding: 6px 12px; color: var(--text-primary); font-size: 14px;"
            >
              <option :value="1">最近 1 小时</option>
              <option :value="6">最近 6 小时</option>
              <option :value="24">最近 24 小时</option>
              <option :value="72">最近 3 天</option>
              <option :value="168">最近 7 天</option>
            </select>
          </div>
          <div class="detail-section-body">
            <div v-if="historyError" class="error-box">
              <div class="error-title">历史记录加载失败</div>
              <div class="error-message">{{ historyError }}</div>
            </div>
            <div v-else-if="history.length" class="gas-history-chart">
              <div class="chart-container">
                <svg
                  :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
                  width="100%"
                  height="200"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="gasGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="var(--accent-orange)" stop-opacity="0.3" />
                      <stop offset="100%" stop-color="var(--accent-orange)" stop-opacity="0.05" />
                    </linearGradient>
                  </defs>
                  <path :d="areaPath" fill="url(#gasGradient)" />
                  <path :d="linePath" fill="none" stroke="var(--accent-orange)" stroke-width="2" />
                </svg>
              </div>
              <div class="chart-labels">
                <span class="text-muted">{{ selectedHours }}小时前</span>
                <span class="text-muted">现在</span>
              </div>
            </div>
            <div v-else class="loading">
              <div class="loading-spinner"></div>
              <div class="loading-text">加载历史数据中...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getGasTracker, getGasHistory } from '../api'

const loading = ref(true)
const error = ref(null)
const currentGasError = ref(null)
const historyError = ref(null)
const currentGas = ref(null)
const history = ref([])
const source = ref('')
const selectedHours = ref(24)

const chartWidth = 800
const chartHeight = 200

const linePath = computed(() => {
  if (!history.value.length) return ''
  const values = history.value.map(h => parseFloat(h.baseFee) || 0)
  const maxVal = Math.max(...values, 1)
  const minVal = Math.min(...values, 0)
  const range = maxVal - minVal || 1

  const points = history.value.map((h, i) => {
    const x = (i / (history.value.length - 1)) * chartWidth
    const y = chartHeight - ((parseFloat(h.baseFee) - minVal) / range) * (chartHeight - 20) - 10
    return `${x},${y}`
  })

  return 'M' + points.join(' L')
})

const areaPath = computed(() => {
  if (!history.value.length) return ''
  const baseLine = `M0,${chartHeight} L${chartWidth},${chartHeight}`
  return linePath.value + ' L' + baseLine.slice(1)
})

const sourceStyle = computed(() => {
  if (source.value === 'cache') {
    return { background: 'var(--accent-green)' }
  }
  return { background: 'var(--accent-orange)' }
})

onMounted(async () => {
  await loadCurrentGas()
  await loadHistory()
  loading.value = false
})

async function loadCurrentGas() {
  try {
    currentGasError.value = null
    const res = await getGasTracker()
    if (res && res.success && res.data) {
      currentGas.value = res.data
      source.value = res.source || 'rpc'
    }
  } catch (e) {
    currentGasError.value = e.message
    console.error('Failed to load current gas:', e)
  }
}

async function loadHistory() {
  try {
    historyError.value = null
    const res = await getGasHistory(selectedHours.value)
    if (res && res.success && res.data) {
      history.value = res.data.history || []
    }
  } catch (e) {
    historyError.value = e.message
    console.error('Failed to load history:', e)
  }
}

function formatGasValue(str) {
  if (!str) return '--'
  const num = parseFloat(str)
  return num.toFixed(1)
}

function formatTimestamp(ts) {
  if (!ts) return '--'
  return new Date(ts * 1000).toLocaleString('zh-CN')
}
</script>

<style scoped>
.gas-history-chart {
  width: 100%;
}

.chart-container {
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  padding: 16px;
  overflow: hidden;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
}
</style>