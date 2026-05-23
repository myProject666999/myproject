<template>
  <div class="view">
    <header class="view-header">
      <h2>📊 系统状态</h2>
      <div class="actions">
        <button class="btn" @click="loadAll">🔄 刷新</button>
      </div>
    </header>

    <div class="cards">
      <div class="card">
        <h3>💽 磁盘使用</h3>
        <div v-if="disk.total" class="disk-info">
          <div class="bar">
            <div class="bar-fill" :style="{ width: disk.used_pct + '%' }"></div>
          </div>
          <div class="disk-numbers">
            <span>已用：{{ formatSize(disk.used) }}</span>
            <span>总计：{{ formatSize(disk.total) }}</span>
            <span>可用：{{ formatSize(disk.free) }}</span>
          </div>
          <div class="disk-pct">{{ disk.used_pct.toFixed(1) }}%</div>
          <div class="disk-path">路径：{{ disk.path }}</div>
        </div>
        <div v-else class="no-data">暂无数据</div>
      </div>

      <div class="card">
        <h3>🖥️ Samba 状态</h3>
        <div class="samba-status">
          <div class="status-badge" :class="samba.running ? 'running' : 'stopped'">
            {{ samba.running ? '运行中' : '未运行' }}
          </div>
          <div class="samba-detail">
            <p>服务：<strong>{{ samba.service }}</strong></p>
            <p>状态：{{ samba.status_text || '-' }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <h3>⚙️ 系统信息</h3>
        <div v-if="system.os" class="system-info">
          <p><span>操作系统</span><strong>{{ system.os }}</strong></p>
          <p><span>架构</span><strong>{{ system.arch }}</strong></p>
          <p><span>主机名</span><strong>{{ system.hostname }}</strong></p>
          <p><span>CPU 核数</span><strong>{{ system.num_cpu }}</strong></p>
          <p><span>Go 版本</span><strong>{{ system.go_version }}</strong></p>
          <p><span>服务器时间</span><strong>{{ system.server_time }}</strong></p>
        </div>
        <div v-else class="no-data">暂无数据</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { statusApi } from '@/api'

const disk = ref({})
const samba = ref({})
const system = ref({})

function loadAll() {
  statusApi.disk().then((r) => (disk.value = r.data))
  statusApi.samba().then((r) => (samba.value = r.data))
  statusApi.system().then((r) => (system.value = r.data))
}

function formatSize(s) {
  if (!s) return '0 B'
  if (s < 1024) return s + ' B'
  if (s < 1024 ** 2) return (s / 1024).toFixed(1) + ' KB'
  if (s < 1024 ** 3) return (s / 1024 ** 2).toFixed(1) + ' MB'
  if (s < 1024 ** 4) return (s / 1024 ** 3).toFixed(2) + ' GB'
  return (s / 1024 ** 4).toFixed(2) + ' TB'
}

onMounted(loadAll)
</script>

<style scoped>
.view { padding: 8px 0; }
.view-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.view-header h2 { font-size: 20px; }
.btn { padding: 8px 14px; background: #ecf0f1; border: 1px solid #dfe6e9; border-radius: 6px; font-size: 14px; }
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}
.card {
  background: #fff;
  border-radius: 8px;
  padding: 18px 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,.06);
}
.card h3 { font-size: 16px; margin-bottom: 12px; color: #2c3e50; }
.bar {
  height: 16px;
  background: #ecf0f1;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
}
.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #9b59b6);
  transition: width .3s;
}
.disk-info { position: relative; }
.disk-numbers {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #7f8c8d;
  margin-bottom: 4px;
}
.disk-pct {
  text-align: right;
  font-size: 18px;
  font-weight: 600;
  color: #3498db;
}
.disk-path {
  margin-top: 6px;
  font-size: 12px;
  color: #95a5a6;
  word-break: break-all;
}
.samba-status { display: flex; align-items: center; gap: 16px; }
.status-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}
.status-badge.running { background: #d5f5e3; color: #196f3d; }
.status-badge.stopped { background: #fadbd8; color: #922b21; }
.samba-detail p { margin: 4px 0; font-size: 14px; }
.system-info p {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px dashed #ecf0f1;
  font-size: 14px;
}
.system-info p:last-child { border-bottom: none; }
.system-info span { color: #7f8c8d; }
.no-data { color: #95a5a6; font-size: 14px; padding: 20px 0; text-align: center; }
</style>
