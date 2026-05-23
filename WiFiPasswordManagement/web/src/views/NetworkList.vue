<template>
  <div>
    <div class="row" style="margin-bottom: 16px;">
      <h2 style="margin: 0;">Wi-Fi 网络</h2>
      <button class="btn" @click="showForm = !showForm">
        {{ showForm ? '取消' : '+ 新增' }}
      </button>
    </div>

    <div v-if="showForm" class="card">
      <h3 class="title">新增网络</h3>
      <form @submit.prevent="onCreate">
        <div class="grid">
          <div>
            <label>SSID</label>
            <input v-model="form.ssid" required />
          </div>
          <div>
            <label>加密方式</label>
            <select v-model="form.security">
              <option value="WPA">WPA/WPA2/WPA3</option>
              <option value="WEP">WEP</option>
              <option value="nopass">无密码</option>
            </select>
          </div>
          <div>
            <label>密码</label>
            <input v-model="form.password" type="password" required />
          </div>
          <div>
            <label>所有者</label>
            <input v-model="form.owner" />
          </div>
          <div>
            <label>过期时间（可选）</label>
            <input v-model="form.expiresAt" type="datetime-local" />
          </div>
          <div style="grid-column: span 2;">
            <label>备注</label>
            <textarea v-model="form.notes" rows="2"></textarea>
          </div>
        </div>
        <div style="margin-top: 12px;">
          <button class="btn" type="submit">保存</button>
        </div>
      </form>
    </div>

    <div v-if="!networks.length && !showForm" class="card muted">
      暂无数据，点击“新增”录入第一个 Wi-Fi 网络。
    </div>

    <div v-for="n in networks" :key="n.id" class="card">
      <div class="row">
        <div>
          <div>
            <span class="title">{{ n.ssid }}</span>
            <span class="badge" :class="{ expired: n.expired }">
              {{ n.security }}{{ n.expired ? ' · 已过期' : '' }}
            </span>
          </div>
          <div class="muted">{{ n.owner || '未设置所有者' }} · 创建于 {{ formatTime(n.createdAt) }}</div>
          <div v-if="n.expiresAt" class="muted">过期：{{ formatTime(n.expiresAt) }}</div>
          <div v-if="n.notes" class="muted">备注：{{ n.notes }}</div>
        </div>
        <div style="display: flex; gap: 8px;">
          <router-link :to="'/networks/' + n.id" class="btn ghost">详情</router-link>
          <button class="btn danger" @click="onDelete(n.id)">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { listNetworks, createNetwork, deleteNetwork } from '../api'

const networks = ref([])
const showForm = ref(false)
const form = ref({ ssid: '', security: 'WPA', password: '', owner: '', notes: '', expiresAt: '' })

async function load() {
  networks.value = await listNetworks()
}

async function onCreate() {
  const payload = { ...form.value }
  if (!payload.expiresAt) payload.expiresAt = null
  else payload.expiresAt = new Date(payload.expiresAt).toISOString()
  await createNetwork(payload)
  showForm.value = false
  form.value = { ssid: '', security: 'WPA', password: '', owner: '', notes: '', expiresAt: '' }
  load()
}

async function onDelete(id) {
  if (!confirm('确认删除该网络？')) return
  await deleteNetwork(id)
  load()
}

function formatTime(v) {
  if (!v) return ''
  try { return new Date(v).toLocaleString() } catch { return v }
}

onMounted(load)
</script>
