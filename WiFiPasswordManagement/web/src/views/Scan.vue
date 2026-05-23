<template>
  <div>
    <h2 class="title">扫码共享</h2>
    <div class="card">
      <p class="muted">输入或粘贴分享链接中的 token，查看对应的 Wi-Fi 信息。</p>
      <div class="row" style="gap: 8px;">
        <input v-model="token" placeholder="token" style="flex: 1;" />
        <button class="btn" @click="load">查询</button>
      </div>
      <div v-if="err" class="muted" style="margin-top: 8px; color: var(--danger);">{{ err }}</div>
    </div>

    <div v-if="network" class="card">
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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getByShare } from '../api'

const token = ref('')
const network = ref(null)
const err = ref('')
const showPwd = ref(false)

async function load() {
  err.value = ''
  if (!token.value) return
  const data = await getByShare(token.value)
  if (data.error) {
    err.value = data.error
    network.value = null
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
</script>
