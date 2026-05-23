<template>
  <div class="share-page">
    <header class="share-header">
      <h1>🔗 文件分享</h1>
      <span class="token-badge">令牌: {{ token }}</span>
    </header>

    <div v-if="error" class="error-box">
      <p>❌ {{ error }}</p>
    </div>

    <div v-else-if="loading" class="loading">
      <p>⏳ 加载中...</p>
    </div>

    <div v-else-if="isDir" class="share-content">
      <div class="share-info">
        <p>📁 <strong>{{ sharePath }}</strong></p>
        <p v-if="subPath" class="sub-path">当前位置：{{ subPath }}</p>
      </div>

      <nav class="breadcrumb" v-if="subBreadcrumbs.length > 0">
        <span class="crumb" @click="goToRoot">根目录</span>
        <template v-for="(part, idx) in subBreadcrumbs" :key="idx">
          <span class="sep">/</span>
          <span class="crumb" @click="goToSub(idx + 1)">{{ part }}</span>
        </template>
      </nav>

      <table class="file-table">
        <thead>
          <tr>
            <th>名称</th>
            <th class="col-size">大小</th>
            <th class="col-time">修改时间</th>
            <th class="col-actions">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="subPath !== ''">
            <td class="clickable" @click="goUp">⬆ ..</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr v-for="item in items" :key="item.path">
            <td class="clickable" @click="handleItemClick(item)">
              <span class="icon">{{ item.is_dir ? '📁' : '📄' }}</span>
              {{ item.name }}
            </td>
            <td class="col-size">{{ item.is_dir ? '-' : formatSize(item.size) }}</td>
            <td class="col-time">{{ formatTime(item.mod_time) }}</td>
            <td class="col-actions">
              <button v-if="!item.is_dir" class="btn-sm" @click.stop="onDownload(item)">下载</button>
            </td>
          </tr>
          <tr v-if="items.length === 0 && subPath === ''">
            <td colspan="4" class="empty">目录为空</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="share-file">
      <p>📄 <strong>{{ fileName }}</strong></p>
      <p class="file-size">大小：{{ formatSize(fileSize) }}</p>
      <button class="btn btn-primary" @click="downloadFile">⬇ 下载文件</button>
    </div>

    <footer class="share-footer">
      <small>SimpleHomeNAS · Powered by Raspberry Pi</small>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const token = computed(() => route.params.token || '')

const loading = ref(true)
const error = ref('')
const isDir = ref(false)
const sharePath = ref('')
const items = ref([])
const subPath = ref('')
const fileName = ref('')
const fileSize = ref(0)

const subBreadcrumbs = computed(() =>
  subPath.value ? subPath.value.split('/').filter(Boolean) : []
)

async function loadShare(sub = '') {
  loading.value = true
  error.value = ''
  try {
    const url = sub
      ? `/api/shares/access/${token.value}?sub=${encodeURIComponent(sub)}`
      : `/api/shares/access/${token.value}`
    const res = await axios.get(url)
    const data = res.data

    if (data.items !== undefined) {
      isDir.value = true
      sharePath.value = data.path || ''
      subPath.value = sub
      items.value = data.items || []
    } else {
      isDir.value = false
      const cd = res.headers['content-disposition'] || ''
      const match = cd.match(/filename="?([^"]+)"?/)
      fileName.value = match ? match[1] : sharePath.value.split('/').pop() || 'download'
      fileSize.value = parseInt(res.headers['content-length'] || '0', 10)
    }
  } catch (e) {
    const msg = e.response?.data?.error || e.message || '加载失败'
    error.value = msg
  } finally {
    loading.value = false
  }
}

function handleItemClick(item) {
  if (item.is_dir) {
    const newSub = subPath.value ? subPath.value + '/' + item.path : item.path
    loadShare(newSub)
  } else {
    onDownload(item)
  }
}

function onDownload(item) {
  const sub = subPath.value ? subPath.value + '/' + item.path : item.path
  const url = `/api/shares/access/${token.value}?sub=${encodeURIComponent(sub)}`
  const a = document.createElement('a')
  a.href = url
  a.download = item.name
  a.click()
}

function downloadFile() {
  const url = `/api/shares/access/${token.value}`
  const a = document.createElement('a')
  a.href = url
  a.download = fileName.value
  a.click()
}

function goToRoot() {
  loadShare('')
}

function goToSub(depth) {
  const parts = subBreadcrumbs.value.slice(0, depth)
  loadShare(parts.join('/'))
}

function goUp() {
  const parts = subPath.value.split('/').filter(Boolean)
  parts.pop()
  loadShare(parts.join('/'))
}

function formatSize(s) {
  if (!s) return '0 B'
  if (s < 1024) return s + ' B'
  if (s < 1024 ** 2) return (s / 1024).toFixed(1) + ' KB'
  if (s < 1024 ** 3) return (s / 1024 ** 2).toFixed(1) + ' MB'
  return (s / 1024 ** 3).toFixed(2) + ' GB'
}

function formatTime(t) {
  if (!t) return ''
  const d = new Date(t)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

onMounted(() => loadShare())
</script>

<style scoped>
.share-page {
  max-width: 860px;
  margin: 0 auto;
  padding: 32px 24px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.share-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid #ecf0f1;
  margin-bottom: 24px;
}
.share-header h1 {
  font-size: 22px;
  color: #2c3e50;
}
.token-badge {
  font-size: 12px;
  font-family: 'Courier New', monospace;
  background: #ecf0f1;
  padding: 4px 10px;
  border-radius: 4px;
  color: #7f8c8d;
}
.error-box {
  background: #fadbd8;
  border: 1px solid #f1948a;
  border-radius: 8px;
  padding: 16px 20px;
  color: #922b21;
  margin-bottom: 16px;
}
.loading {
  text-align: center;
  padding: 60px;
  color: #7f8c8d;
  font-size: 16px;
}
.share-content {
  flex: 1;
}
.share-info {
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #f8f9fb;
  border-radius: 6px;
}
.share-info p {
  margin: 2px 0;
  font-size: 14px;
}
.sub-path {
  color: #7f8c8d;
  font-size: 13px !important;
}
.breadcrumb {
  margin-bottom: 12px;
  font-size: 14px;
  color: #7f8c8d;
}
.crumb {
  cursor: pointer;
  color: #3498db;
}
.crumb:hover {
  text-decoration: underline;
}
.sep {
  margin: 0 6px;
  color: #bdc3c7;
}
.file-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, .06);
}
.file-table th,
.file-table td {
  padding: 10px 14px;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
  font-size: 14px;
}
.file-table th {
  background: #f8f9fb;
  font-weight: 600;
  color: #7f8c8d;
}
.file-table tr:last-child td {
  border-bottom: none;
}
.clickable {
  cursor: pointer;
}
.clickable:hover {
  background: #f5f9fc;
}
.icon {
  margin-right: 6px;
}
.col-size,
.col-time {
  color: #7f8c8d;
}
.col-actions {
  display: flex;
  gap: 4px;
}
.btn-sm {
  padding: 4px 10px;
  font-size: 12px;
  background: #ecf0f1;
  border: 1px solid #dfe6e9;
  border-radius: 4px;
  color: #2c3e50;
  cursor: pointer;
}
.btn-sm:hover {
  background: #dfe6e9;
}
.empty {
  text-align: center;
  color: #95a5a6;
  padding: 40px !important;
}
.share-file {
  flex: 1;
  text-align: center;
  padding: 60px 20px;
}
.share-file p {
  margin: 8px 0;
  font-size: 16px;
}
.file-size {
  color: #7f8c8d;
  font-size: 14px !important;
}
.btn {
  padding: 10px 20px;
  border: 1px solid #dfe6e9;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 12px;
}
.btn-primary {
  background: #3498db;
  color: #fff;
  border-color: #3498db;
}
.btn-primary:hover {
  background: #2980b9;
}
.share-footer {
  margin-top: auto;
  padding-top: 24px;
  text-align: center;
  color: #bdc3c7;
}
</style>
