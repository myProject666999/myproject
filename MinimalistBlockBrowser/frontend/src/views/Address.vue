<template>
  <div class="detail-page">
    <div class="container">
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <div class="loading-text">加载中...</div>
      </div>

      <div v-else-if="error" class="error-box">
        <div class="error-title">加载失败</div>
        <div class="error-message">{{ error }}</div>
      </div>

      <div v-else-if="address">
        <div class="address-header">
          <div class="address-icon">{{ address.isContract ? 'C' : 'A' }}</div>
          <div>
            <h1 class="detail-title">{{ address.address }}</h1>
            <span v-if="address.isContract" class="detail-badge" style="background: var(--accent-purple);">合约</span>
            <span v-else class="detail-badge">普通账户</span>
          </div>
        </div>

        <div class="stats-grid" style="margin-bottom: 32px;">
          <div class="stat-card">
            <div class="stat-label">ETH 余额</div>
            <div class="stat-value text-accent">{{ formatEther(address.balance) }}</div>
            <div class="stat-badge">ETH</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">交易数量</div>
            <div class="stat-value">{{ address.txCount || 0 }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Nonce</div>
            <div class="stat-value">{{ address.nonce || 0 }}</div>
          </div>
          <div class="stat-card" v-if="address.isContract && address.codeSize">
            <div class="stat-label">代码大小</div>
            <div class="stat-value">{{ address.codeSize }}</div>
            <div class="stat-badge">bytes</div>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-section-header">地址信息</div>
          <div class="detail-section-body">
            <div class="detail-row">
              <div class="detail-label">地址</div>
              <div class="detail-value text-mono">{{ address.address }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">账户类型</div>
              <div class="detail-value">
                <span v-if="address.isContract" class="text-purple">合约账户</span>
                <span v-else>普通账户 (EOA)</span>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-label">ETH 余额</div>
              <div class="detail-value text-accent">{{ formatEther(address.balance) }} ETH</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">交易数量</div>
              <div class="detail-value">{{ address.txCount || 0 }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Nonce</div>
              <div class="detail-value">{{ address.nonce || 0 }}</div>
            </div>
            <div class="detail-row" v-if="address.isContract">
              <div class="detail-label">合约代码</div>
              <div class="detail-value text-green">已部署</div>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-section-header">数据来源</div>
          <div class="detail-section-body">
            <div class="detail-row">
              <div class="detail-label">来源</div>
              <div class="detail-value">
                <span class="detail-badge" :style="sourceStyle">{{ source.toUpperCase() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getAddress } from '../api'

const route = useRoute()
const loading = ref(true)
const error = ref(null)
const address = ref(null)
const source = ref('')

const sourceStyle = computed(() => {
  if (source.value === 'cache') {
    return { background: 'var(--accent-green)' }
  }
  return { background: 'var(--accent-orange)' }
})

onMounted(async () => {
  await loadAddress()
})

async function loadAddress() {
  loading.value = true
  error.value = null
  address.value = null

  try {
    const res = await getAddress(route.params.address)
    if (res && res.success && res.data) {
      address.value = res.data
      source.value = res.source || 'rpc'
    } else {
      error.value = res?.error || '地址未找到'
    }
  } catch (e) {
    error.value = e.message || '加载失败'
  } finally {
    loading.value = false
  }
}

function formatEther(hex) {
  if (!hex) return '0'
  const wei = parseInt(hex, 16)
  return (wei / 1e18).toFixed(8)
}
</script>