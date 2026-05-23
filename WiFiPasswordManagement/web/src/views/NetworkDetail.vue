<template>
  <div>
    <router-link to="/" class="muted">← 返回列表</router-link>
    <div v-if="network" class="card">
      <div class="row">
        <h2 class="title" style="margin: 0;">{{ network.ssid }}</h2>
        <div>
          <span class="badge" :class="{ expired: network.expired }">
            {{ network.security }}{{ network.expired ? ' · 已过期' : '' }}
          </span>
        </div>
      </div>

      <div class="grid" style="margin-top: 12px;">
        <div>
          <label>密码</label>
          <div class="row">
            <input :type="showPwd ? 'text' : 'password'" :value="network.password" readonly />
            <button class="btn ghost" @click="showPwd = !showPwd">{{ showPwd ? '隐藏' : '显示' }}</button>
          </div>
        </div>
        <div>
          <label>所有者</label>
          <input :value="network.owner || ''" readonly />
        </div>
        <div>
          <label>过期时间</label>
          <input :value="network.expiresAt ? formatTime(network.expiresAt) : '永不过期'" readonly />
        </div>
        <div>
          <label>备注</label>
          <input :value="network.notes || ''" readonly />
        </div>
      </div>

      <div class="row" style="margin-top: 16px;">
        <div>
          <img :src="qrUrl" alt="QR" style="width: 180px; height: 180px; border: 1px solid var(--border); border-radius: 8px;" />
          <div class="muted" style="margin-top: 4px;">手机扫码可直接连接</div>
        </div>
        <div style="flex: 1;">
          <h3 class="title">共享链接</h3>
          <button class="btn" @click="onCreateShare" style="margin-bottom: 8px;">生成共享链接</button>
          <div v-if="!shares.length" class="muted">暂无共享记录</div>
          <div v-for="s in shares" :key="s.id" class="card" style="padding: 10px; margin-bottom: 8px;">
            <div class="row">
              <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">
                <a :href="'#/s/' + s.token" target="_blank">/s/{{ s.token }}</a>
                <div class="muted">访问次数：{{ s.visitCount }} · 创建：{{ formatTime(s.createdAt) }}</div>
                <div v-if="s.expiresAt" class="muted">过期：{{ formatTime(s.expiresAt) }}</div>
              </div>
              <div style="display: flex; gap: 8px;">
                <button class="btn ghost" @click="copyShare(s.token)">复制</button>
                <button class="btn danger" @click="onDeleteShare(s.id)">删除</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getNetwork, listShares, createShare, deleteShare } from '../api'

const props = defineProps({ id: { type: String, required: true } })
const network = ref(null)
const shares = ref([])
const showPwd = ref(false)
const qrUrl = ref('')

async function load() {
  network.value = await getNetwork(props.id)
  qrUrl.value = `/api/networks/${props.id}/qr`
  shares.value = await listShares(props.id)
}

async function onCreateShare() {
  await createShare(props.id, {})
  shares.value = await listShares(props.id)
}

async function onDeleteShare(id) {
  await deleteShare(id)
  shares.value = await listShares(props.id)
}

function copyShare(token) {
  const url = location.origin + location.pathname + '#/s/' + token
  navigator.clipboard.writeText(url)
}

function formatTime(v) {
  if (!v) return ''
  try { return new Date(v).toLocaleString() } catch { return v }
}

onMounted(load)
</script>
