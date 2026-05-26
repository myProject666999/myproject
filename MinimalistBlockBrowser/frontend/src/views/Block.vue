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

      <div v-else-if="block">
        <div class="detail-header">
          <h1 class="detail-title">区块 #{{ formatBlockNumber(block.number) }}</h1>
          <span class="detail-badge">{{ source.toUpperCase() }}</span>
        </div>

        <div class="detail-section">
          <div class="detail-section-header">区块信息</div>
          <div class="detail-section-body">
            <div class="detail-row">
              <div class="detail-label">区块哈希</div>
              <div class="detail-value text-mono">{{ block.hash }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">父区块</div>
              <router-link
                v-if="block.parentHash"
                :to="`/block/hash/${block.parentHash}`"
                class="detail-value text-mono text-accent"
              >{{ block.parentHash }}</router-link>
              <div v-else class="detail-value">--</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">区块高度</div>
              <div class="detail-value">{{ formatBlockNumber(block.number) }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">时间</div>
              <div class="detail-value">{{ formatFullTime(block.timestamp) }}</div>
            </div>
            <div class="detail-row" v-if="block.miner">
              <div class="detail-label">矿工</div>
              <router-link :to="`/address/${block.miner}`" class="detail-value text-mono text-accent">
                {{ block.miner }}
              </router-link>
            </div>
            <div class="detail-row">
              <div class="detail-label">交易数量</div>
              <div class="detail-value">{{ (block.transactions || []).length }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Gas 用量</div>
              <div class="detail-value">{{ formatHexToDecimal(block.gasUsed) }} / {{ formatHexToDecimal(block.gasLimit) }}</div>
            </div>
            <div class="detail-row" v-if="block.baseFeePerGas">
              <div class="detail-label">基础手续费</div>
              <div class="detail-value">{{ formatGwei(block.baseFeePerGas) }} gwei</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">难度</div>
              <div class="detail-value">{{ formatHexToDecimal(block.difficulty) }}</div>
            </div>
            <div class="detail-row" v-if="block.size">
              <div class="detail-label">区块大小</div>
              <div class="detail-value">{{ formatHexToDecimal(block.size) }} bytes</div>
            </div>
            <div class="detail-row" v-if="block.nonce">
              <div class="detail-label">Nonce</div>
              <div class="detail-value text-mono">{{ block.nonce }}</div>
            </div>
          </div>
        </div>

        <div class="detail-section" v-if="block.transactions && block.transactions.length">
          <div class="detail-section-header">交易列表 ({{ block.transactions.length }})</div>
          <div class="detail-section-body">
            <div class="tx-list">
              <router-link
                v-for="tx in displayTransactions"
                :key="tx.hash || tx"
                :to="`/transaction/${tx.hash || tx}`"
                class="tx-item"
              >
                <div class="tx-hash">{{ tx.hash || tx }}</div>
                <div class="tx-value" v-if="tx.value">{{ formatEther(tx.value) }} ETH</div>
                <div class="tx-time" v-if="tx.from">{{ truncateHash(tx.from) }}</div>
              </router-link>
            </div>
            <div v-if="block.transactions.length > 50" class="text-center mt-16 text-muted">
              仅显示前 50 笔交易
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getBlockByNumber, getBlockByHash } from '../api'

const route = useRoute()
const loading = ref(true)
const error = ref(null)
const block = ref(null)
const source = ref('')

onMounted(() => {
  loadBlock()
})

watch(() => route.params, () => {
  loadBlock()
})

async function loadBlock() {
  loading.value = true
  error.value = null
  block.value = null

  try {
    const hash = route.params.hash
    const number = route.params.number

    let res
    if (hash) {
      res = await getBlockByHash(hash)
    } else if (number) {
      res = await getBlockByNumber(number)
    }

    if (res && res.success && res.data) {
      block.value = res.data
      source.value = res.source || 'rpc'
    } else {
      error.value = res?.error || '区块未找到'
    }
  } catch (e) {
    error.value = e.message || '加载失败'
  } finally {
    loading.value = false
  }
}

const displayTransactions = computed(() => {
  if (!block.value?.transactions) return []
  return block.value.transactions.slice(0, 50)
})

function formatBlockNumber(hex) {
  if (!hex) return '0'
  return parseInt(hex, 16)
}

function formatHexToDecimal(hex) {
  if (!hex) return '0'
  return parseInt(hex, 16).toLocaleString()
}

function formatFullTime(hexTs) {
  if (!hexTs) return '--'
  const ts = parseInt(hexTs, 16)
  return new Date(ts * 1000).toLocaleString('zh-CN')
}

function truncateHash(hash) {
  if (!hash) return ''
  return hash.slice(0, 10) + '...' + hash.slice(-8)
}

function formatGwei(hex) {
  if (!hex) return '0'
  const wei = parseInt(hex, 16)
  return (wei / 1e9).toFixed(4)
}

function formatEther(hex) {
  if (!hex) return '0'
  const wei = parseInt(hex, 16)
  return (wei / 1e18).toFixed(6)
}
</script>