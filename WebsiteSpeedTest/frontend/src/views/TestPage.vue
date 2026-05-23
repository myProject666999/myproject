<template>
  <div class="test-page">
    <div class="card test-header">
      <h1 class="page-title">网站速度测试</h1>
      <p class="page-desc">输入要测试的网站 URL，选择测试区域，系统将从多个节点测试加载速度</p>

      <div class="test-form">
        <div class="url-input-group">
          <input
            v-model="url"
            type="text"
            class="input-field url-input"
            placeholder="请输入网站 URL，例如：https://www.example.com"
            @keyup.enter="handleTest"
          />
          <button class="btn btn-primary test-btn" :disabled="loading" @click="handleTest">
            <span v-if="loading" class="loading"></span>
            <span v-else>开始测试</span>
          </button>
        </div>

        <div class="region-selector">
          <div class="section-label">选择测试区域</div>
          <div class="region-chips">
            <label
              v-for="region in regions"
              :key="region.code"
              class="region-chip"
              :class="{ selected: selectedRegions.includes(region.code) }"
            >
              <input
                type="checkbox"
                :value="region.code"
                v-model="selectedRegions"
                style="display: none"
              />
              <span class="region-flag">📍</span>
              <span class="region-name">{{ region.name }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <div v-if="results.length > 0" class="results-section">
      <h2 class="section-title">测试结果</h2>
      <div class="results-grid">
        <div v-for="result in results" :key="result.id" class="card result-card">
          <div class="result-header">
            <span class="tag tag-blue">{{ result.regionName }}</span>
            <span v-if="result.error" class="tag tag-red">失败</span>
            <span v-else-if="result.statusCode >= 200 && result.statusCode < 400" class="tag tag-green">
              {{ result.statusCode }}
            </span>
            <span v-else class="tag tag-red">{{ result.statusCode }}</span>
          </div>

          <div v-if="result.error" class="error-msg">
            错误: {{ result.error }}
          </div>

          <div v-else class="timeline">
            <div class="timeline-item">
              <div class="timeline-label">DNS 解析</div>
              <div class="timeline-bar-wrap">
                <div class="timeline-bar dns" :style="{ width: getBarWidth(result.dnsLookup) + '%' }"></div>
              </div>
              <div class="timeline-value">{{ result.dnsLookup }} ms</div>
            </div>
            <div class="timeline-item">
              <div class="timeline-label">TCP 连接</div>
              <div class="timeline-bar-wrap">
                <div class="timeline-bar tcp" :style="{ width: getBarWidth(result.tcpConnect) + '%' }"></div>
              </div>
              <div class="timeline-value">{{ result.tcpConnect }} ms</div>
            </div>
            <div class="timeline-item">
              <div class="timeline-label">TLS 握手</div>
              <div class="timeline-bar-wrap">
                <div class="timeline-bar tls" :style="{ width: getBarWidth(result.tlsHandshake) + '%' }"></div>
              </div>
              <div class="timeline-value">{{ result.tlsHandshake }} ms</div>
            </div>
            <div class="timeline-item highlight">
              <div class="timeline-label">TTFB</div>
              <div class="timeline-bar-wrap">
                <div class="timeline-bar ttfb" :style="{ width: getBarWidth(result.ttfb) + '%' }"></div>
              </div>
              <div class="timeline-value">{{ result.ttfb }} ms</div>
            </div>
            <div class="timeline-item">
              <div class="timeline-label">内容下载</div>
              <div class="timeline-bar-wrap">
                <div class="timeline-bar content" :style="{ width: getBarWidth(result.contentDownload) + '%' }"></div>
              </div>
              <div class="timeline-value">{{ result.contentDownload }} ms</div>
            </div>
            <div class="timeline-item highlight">
              <div class="timeline-label">DOM Ready</div>
              <div class="timeline-bar-wrap">
                <div class="timeline-bar dom" :style="{ width: getBarWidth(result.domReady) + '%' }"></div>
              </div>
              <div class="timeline-value">{{ result.domReady }} ms</div>
            </div>
            <div class="timeline-item total">
              <div class="timeline-label">总耗时</div>
              <div class="timeline-bar-wrap">
                <div class="timeline-bar total-bar" :style="{ width: getBarWidth(result.totalTime) + '%' }"></div>
              </div>
              <div class="timeline-value">{{ result.totalTime }} ms</div>
            </div>
          </div>

          <div class="result-footer">
            <span class="result-url">{{ result.url }}</span>
            <span class="result-time">{{ formatTime(result.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getRegions, runTest } from '../api/index.js'

const url = ref('')
const regions = ref([])
const selectedRegions = ref([])
const results = ref([])
const loading = ref(false)

onMounted(async () => {
  try {
    const res = await getRegions()
    regions.value = res.data.regions
    if (regions.value.length > 0) {
      selectedRegions.value = regions.value.slice(0, 4).map(r => r.code)
    }
  } catch (e) {
    console.error(e)
  }
})

const handleTest = async () => {
  if (!url.value.trim()) {
    alert('请输入要测试的 URL')
    return
  }
  if (selectedRegions.value.length === 0) {
    alert('请至少选择一个测试区域')
    return
  }

  loading.value = true
  results.value = []

  try {
    const res = await runTest(url.value.trim(), selectedRegions.value)
    results.value = res.data.results
  } catch (e) {
    console.error(e)
    alert('测试失败：' + (e.response?.data?.error || e.message))
  } finally {
    loading.value = false
  }
}

const getBarWidth = (ms) => {
  const max = 3000
  return Math.min((ms / max) * 100, 100)
}

const formatTime = (t) => {
  if (!t) return ''
  const d = new Date(t)
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

.test-header {
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.url-input-group {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.url-input {
  flex: 1;
  font-size: 16px;
  padding: 14px 18px;
}

.test-btn {
  padding: 14px 32px;
  font-size: 16px;
  white-space: nowrap;
}

.section-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.region-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.region-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.region-chip:hover {
  border-color: #667eea;
}

.region-chip.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
}

.region-name {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.section-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin: 30px 0 20px;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
}

.result-card {
  padding: 20px;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.error-msg {
  color: #ef4444;
  padding: 16px;
  background: #fee2e2;
  border-radius: 8px;
  margin-bottom: 12px;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.timeline-item {
  display: grid;
  grid-template-columns: 80px 1fr 80px;
  align-items: center;
  gap: 12px;
}

.timeline-label {
  font-size: 13px;
  color: #6b7280;
}

.timeline-bar-wrap {
  height: 20px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
}

.timeline-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.timeline-bar.dns { background: #60a5fa; }
.timeline-bar.tcp { background: #a78bfa; }
.timeline-bar.tls { background: #f472b6; }
.timeline-bar.ttfb { background: #f59e0b; }
.timeline-bar.content { background: #34d399; }
.timeline-bar.dom { background: #667eea; }
.timeline-bar.total-bar { background: linear-gradient(90deg, #667eea, #764ba2); }

.timeline-item.highlight .timeline-label {
  color: #667eea;
  font-weight: 600;
}

.timeline-item.total .timeline-label {
  color: #1f2937;
  font-weight: 700;
  font-size: 14px;
}

.timeline-item.total .timeline-value {
  font-weight: 700;
  font-size: 14px;
}

.timeline-value {
  text-align: right;
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}

.result-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
  font-size: 12px;
  color: #9ca3af;
}

.result-url {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
