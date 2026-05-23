<template>
  <div>
    <h2 class="title">分享查看</h2>
    <div v-if="err" class="card" style="color: var(--danger);">{{ err }}</div>
    <div v-else-if="network" class="card">
      <div class="row">
        <div>
          <div class="title">{{ network.ssid }}
            <span class="badge">{{ network.security }}</span>
          </div>
          <div class="muted">所有者：{{ network.owner || '未设置' }}</div>
          <div v-if="network.notes" class="muted">备注：{{ network.notes }}</div>
          <div v-if="network.expiresAt" class="muted">过期：{{ formatTime(network.expiresAt) }}</div>
        </div>
        <img :src="'/api/networks/' + network.id + '/qr'" alt="QR" style="width: 160px; height: 160px; border: 1px solid var(--border); border-radius: 8px;" />
      </div>
      <div class="row" style="margin-top: 12px;">
        <label style="margin: 0;">密码</label>
        <div style="display: flex; gap: 8px;">
          <input :type="showPwd ? 'text' : 'password'" :value="network.password" readonly />
          <button class="btn ghost" @click="showPwd = !showPwd">{{ showPwd ? '隐藏' : '显示' }}</button>
          <button class="btn ghost" @click="copyPwd">复制</button>
        </div>
      </div>
    </div>
    <div v-else class="card muted">加载中...</div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getByShare } from '../api'

const props = defineProps({ token: { type: String, required: true } })
const network = ref(null)
const err = ref('')
const showPwd = ref(false)

async function load() {
  const data = await getByShare(props.token)
  if (data.error) {
    err.value = data.error
    return
  }
  network.value = data
}

function copyPwd() {
  if (network.value) navigator.clipboard.writeText(network.value.password)
}

function formatTime(v) {
  if (!v) return ''
  try { return new Date(v).toLocaleString() } catch { return v }
}

onMounted(load)
</script>
