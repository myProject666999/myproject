<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Connection, VideoPause, VideoPlay, Refresh } from '@element-plus/icons-vue'
import { getNetworks, startScan, stopScan, getScanStreamUrl } from '../api/scan'
import { useScanStore } from '../stores/scan'
import type { ScanEvent } from '../types'

const store = useScanStore()
const cidrInput = ref('')
const eventSource = ref<EventSource | null>(null)
const commonCidrs = ref<string[]>(['192.168.1.0/24', '192.168.0.0/24', '10.0.0.0/24', '172.16.0.0/24'])

async function loadNetworks() {
  try {
    const res = await getNetworks()
    store.networks = res.data
    if (store.networks.length > 0 && !store.selectedCidr) {
      store.selectedCidr = store.networks[0].cidr
      cidrInput.value = store.selectedCidr
    }
  } catch (e) {
    console.error('加载网段失败', e)
  }
}

function selectCidr(cidr: string) {
  cidrInput.value = cidr
  store.selectedCidr = cidr
}

async function handleStart() {
  const cidr = cidrInput.value.trim()
  if (!cidr) {
    ElMessage.warning('请输入 CIDR 网段')
    return
  }

  store.reset()
  store.scanning = true
  store.selectedCidr = cidr

  try {
    await startScan(cidr)
    connectSSE()
  } catch (e: any) {
    store.scanning = false
    store.error = e.response?.data?.error || e.message || '启动扫描失败'
    ElMessage.error(store.error)
  }
}

function connectSSE() {
  if (eventSource.value) {
    eventSource.value.close()
  }

  const url = getScanStreamUrl()
  eventSource.value = new EventSource(url)

  eventSource.value.onmessage = (event) => {
    try {
      const data: ScanEvent = JSON.parse(event.data)
      handleEvent(data)
    } catch (e) {
      console.error('SSE 解析失败', e)
    }
  }

  eventSource.value.onerror = () => {
    if (eventSource.value) {
      eventSource.value.close()
      eventSource.value = null
    }
  }
}

function handleEvent(data: ScanEvent) {
  switch (data.type) {
    case 'progress':
      store.progress = data.percent ?? 0
      store.currentIp = data.current ?? ''
      store.done = data.done ?? 0
      store.total = data.total ?? 0
      break
    case 'device':
      if (data.device) {
        const exists = store.discovered.some((d) => d.ip === data.device!.ip && d.mac === data.device!.mac)
        if (!exists) {
          store.discovered.push(data.device)
        }
      }
      break
    case 'finish':
      store.scanning = false
      store.summary = data.summary ?? null
      if (eventSource.value) {
        eventSource.value.close()
        eventSource.value = null
      }
      ElMessage.success('扫描完成')
      break
    case 'error':
      store.scanning = false
      store.error = data.message || '扫描错误'
      if (eventSource.value) {
        eventSource.value.close()
        eventSource.value = null
      }
      ElMessage.error(store.error)
      break
  }
}

async function handleStop() {
  try {
    await ElMessageBox.confirm('确定停止当前扫描任务？', '提示', {
      confirmButtonText: '停止',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await stopScan()
    store.scanning = false
    if (eventSource.value) {
      eventSource.value.close()
      eventSource.value = null
    }
    ElMessage.info('扫描已停止')
  } catch {
    // user cancelled
  }
}

onMounted(() => {
  loadNetworks()
})

onUnmounted(() => {
  if (eventSource.value) {
    eventSource.value.close()
  }
})

watch(
  () => store.scanning,
  (val) => {
    if (!val && eventSource.value) {
      eventSource.value.close()
      eventSource.value = null
    }
  }
)
</script>

<template>
  <div class="scan-view">
    <div class="scan-header">
      <div class="scan-status">
        <el-tag :type="store.scanning ? 'primary' : 'info'" effect="dark" size="large">
          {{ store.scanning ? '扫描中' : '空闲' }}
        </el-tag>
      </div>
    </div>

    <el-card class="config-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><Connection /></el-icon>
          <span>网段配置</span>
        </div>
      </template>

      <el-form :inline="true" class="cidr-form">
        <el-form-item label="目标网段">
          <el-input
            v-model="cidrInput"
            placeholder="例如：192.168.1.0/24"
            style="width: 280px"
            :disabled="store.scanning"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :icon="VideoPlay"
            size="large"
            :loading="store.scanning"
            @click="handleStart"
          >
            开始扫描
          </el-button>
          <el-button
            v-if="store.scanning"
            type="danger"
            :icon="VideoPause"
            size="large"
            @click="handleStop"
          >
            停止
          </el-button>
          <el-button :icon="Refresh" size="large" @click="loadNetworks">刷新网段</el-button>
        </el-form-item>
      </el-form>

      <div class="cidr-tags" v-if="store.networks.length > 0">
        <span class="tags-label">检测到的网段：</span>
        <el-tag
          v-for="net in store.networks"
          :key="net.cidr"
          :type="store.selectedCidr === net.cidr ? 'primary' : 'info'"
          effect="plain"
          class="cidr-tag"
          @click="selectCidr(net.cidr)"
        >
          {{ net.cidr }}
          <span class="tag-sub">（{{ net.name }}）</span>
        </el-tag>
      </div>

      <div class="cidr-tags">
        <span class="tags-label">常用网段：</span>
        <el-tag
          v-for="c in commonCidrs"
          :key="c"
          :type="cidrInput === c ? 'primary' : 'info'"
          effect="plain"
          class="cidr-tag"
          @click="selectCidr(c)"
        >
          {{ c }}
        </el-tag>
      </div>
    </el-card>

    <el-card v-if="store.scanning || store.discovered.length > 0" class="progress-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><Loading v-if="store.scanning" :size="16" class="spin" /></el-icon>
          <span>扫描进度</span>
          <span class="progress-text">
            {{ store.done }} / {{ store.total }} （{{ store.progress.toFixed(1) }}%）
          </span>
        </div>
      </template>

      <el-progress
        :percentage="store.progress"
        :stroke-width="10"
        :show-text="false"
        status="success"
      />

      <div v-if="store.currentIp" class="current-ip">
        <span class="label">当前扫描：</span>
        <span class="ip mono">{{ store.currentIp }}</span>
      </div>

      <div v-if="store.summary" class="summary">
        <el-tag type="success" effect="dark">
          扫描完成 · 共 {{ store.summary.total }} 台 · 新发现 {{ store.summary.newFound }} 台
        </el-tag>
      </div>
    </el-card>

    <el-card v-if="store.discovered.length > 0" class="results-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><CircleCheck /></el-icon>
          <span>发现设备（{{ store.discovered.length }}）</span>
        </div>
      </template>

      <div class="device-grid">
        <div v-for="device in store.discovered" :key="device.mac" class="device-card">
          <div class="device-card-header">
            <span class="status-dot online"></span>
            <span class="ip mono">{{ device.ip }}</span>
          </div>
          <div class="device-info">
            <div class="row">
              <span class="label">MAC</span>
              <span class="value mono">{{ device.mac }}</span>
            </div>
            <div class="row">
              <span class="label">厂商</span>
              <span class="value">{{ device.vendor || '未知' }}</span>
            </div>
            <div v-if="device.hostname" class="row">
              <span class="label">主机名</span>
              <span class="value">{{ device.hostname }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <el-empty v-if="!store.scanning && store.discovered.length === 0" description="尚未扫描，选择网段开始扫描" />
  </div>
</template>

<style scoped>
.scan-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.scan-header {
  margin-bottom: 4px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 15px;
}

.card-header .progress-text {
  margin-left: auto;
  font-size: 13px;
  font-weight: normal;
  color: var(--text-secondary);
}

.config-card :deep(.el-card__body) {
  padding-top: 16px;
}

.cidr-form {
  margin-bottom: 12px;
}

.cidr-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.tags-label {
  color: var(--text-muted);
  font-size: 13px;
  margin-right: 4px;
}

.cidr-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.cidr-tag:hover {
  transform: translateY(-1px);
}

.tag-sub {
  color: var(--text-muted);
  font-size: 12px;
}

.progress-card :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.current-ip {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.current-ip .label {
  color: var(--text-muted);
}

.current-ip .ip {
  color: var(--accent);
  font-weight: 500;
}

.summary {
  margin-top: 4px;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.device-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.device-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s;
  animation: fadeIn 0.3s ease;
}

.device-card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
}

.device-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-light);
}

.device-card-header .ip {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot.online {
  background: var(--success);
  box-shadow: 0 0 6px var(--success);
}

.device-info .row {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  font-size: 13px;
}

.device-info .row:last-child {
  margin-bottom: 0;
}

.device-info .label {
  width: 56px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.device-info .value {
  color: var(--text-secondary);
  word-break: break-all;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
