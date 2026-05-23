<template>
  <div class="view">
    <header class="view-header">
      <h2>🔗 共享链接</h2>
      <div class="actions">
        <button class="btn" @click="loadList">🔄 刷新</button>
      </div>
    </header>

    <table class="share-table">
      <thead>
        <tr>
          <th>路径</th>
          <th>类型</th>
          <th>令牌</th>
          <th>访问次数</th>
          <th>过期时间</th>
          <th>创建时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in shares" :key="s.id">
          <td class="mono">{{ s.path }}</td>
          <td>{{ s.is_dir ? '📁 目录' : '📄 文件' }}</td>
          <td class="mono">{{ s.token }}</td>
          <td>
            {{ s.access_count }}
            <span v-if="s.max_access > 0"> / {{ s.max_access }}</span>
          </td>
          <td>
            <span v-if="s.expire_at">{{ formatTime(s.expire_at) }}</span>
            <span v-else>永久</span>
          </td>
          <td>{{ formatTime(s.created_at) }}</td>
          <td class="col-actions">
            <button class="btn-sm" @click="copyUrl(s)">复制</button>
            <a :href="shareUrl(s)" target="_blank" class="btn-sm">打开</a>
            <button class="btn-sm btn-danger" @click="onRemove(s)">删除</button>
          </td>
        </tr>
        <tr v-if="shares.length === 0">
          <td colspan="7" class="empty">暂无共享，在文件管理中分享文件或目录。</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { sharesApi } from '@/api'

const shares = ref([])

function loadList() {
  sharesApi.list().then((res) => {
    shares.value = res.data.shares || []
  })
}

function shareUrl(s) {
  return `/#/share/${s.token}`
}

function copyUrl(s) {
  const url = location.origin + shareUrl(s)
  navigator.clipboard?.writeText(url).then(() => alert('已复制：' + url))
}

function onRemove(s) {
  if (!confirm(`删除共享 "${s.path}"？`)) return
  sharesApi.remove(s.id).then(loadList)
}

function formatTime(t) {
  if (!t) return '-'
  const d = new Date(t)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

onMounted(loadList)
</script>

<style scoped>
.view { padding: 8px 0; }
.view-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px;
}
.view-header h2 { font-size: 20px; }
.share-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,.06);
}
.share-table th, .share-table td {
  padding: 10px 14px;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
  font-size: 14px;
}
.share-table th { background: #f8f9fb; font-weight: 600; color: #7f8c8d; }
.share-table tr:last-child td { border-bottom: none; }
.mono { font-family: 'Courier New', monospace; font-size: 13px; color: #2c3e50; word-break: break-all; }
.col-actions { display: flex; gap: 4px; }
.btn { padding: 8px 14px; background: #ecf0f1; border: 1px solid #dfe6e9; border-radius: 6px; font-size: 14px; }
.btn-sm { padding: 4px 10px; font-size: 12px; background: #ecf0f1; border: 1px solid #dfe6e9; border-radius: 4px; text-decoration: none; color: #2c3e50; display: inline-block; cursor: pointer; }
.btn-danger { background: #ffe0e0; border-color: #ffb3b3; color: #c0392b; }
.empty { text-align: center; color: #95a5a6; padding: 40px !important; }
</style>
