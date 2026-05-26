<template>
  <div>
    <section class="hero">
      <div class="container">
        <h1 class="hero-title">极简区块浏览器</h1>
        <p class="hero-subtitle">快速查询以太坊区块、交易、地址信息</p>
        <div class="search-wrapper">
          <div class="search-bar">
            <input
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="输入区块号 / 交易哈希 / 地址 ..."
              @keyup.enter="handleSearch"
            />
            <button class="search-btn" @click="handleSearch">搜索</button>
          </div>
          <p class="hero-hint">支持查询: 区块号、区块哈希、交易哈希、钱包地址</p>
        </div>
      </div>
    </section>

    <section class="stats-section">
      <div class="container">
        <div class="stats-grid" v-if="stats">
          <div class="stat-card">
            <div class="stat-label">最新区块</div>
            <div class="stat-value">{{ formatNumber(stats.latestBlock) }}</div>
            <div class="stat-badge" v-if="stats.network">{{ stats.network }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">区块交易数</div>
            <div class="stat-value">{{ stats.txCount }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Gas 价格</div>
            <div class="stat-value text-orange">{{ stats.gasPrice || '--' }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">缓存命中率</div>
            <div class="stat-value text-green">{{ formatPercent(stats.cacheHitRate) }}</div>
            <div class="stat-badge">缓存: {{ stats.cacheSize }} 项</div>
          </div>
        </div>
        <div v-else class="loading">
          <div class="loading-spinner"></div>
          <div class="loading-text">加载中...</div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">最新区块</h2>
          <router-link to="/block/0" class="section-link" v-if="stats">查看更多 →</router-link>
        </div>
        <div class="block-list" v-if="blocks.length">
          <router-link
            v-for="block in blocks"
            :key="block.hash"
            :to="`/block/${formatBlockNumber(block.number)}`"
            class="block-item"
          >
            <div class="block-number">#{{ formatBlockNumber(block.number) }}</div>
            <div class="block-info">
              <span class="block-tx-count">{{ (block.transactions || []).length }} 笔交易</span>
              <span class="block-miner" v-if="block.miner">矿工: {{ truncateHash(block.miner) }}</span>
            </div>
            <div class="block-meta">
              <span class="block-time">{{ formatTime(block.timestamp) }}</span>
            </div>
          </router-link>
        </div>
        <div v-else class="loading">
          <div class="loading-spinner"></div>
          <div class="loading-text">加载中...</div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Gas 追踪</h2>
          <router-link to="/gas" class="section-link">详细数据 →</router-link>
        </div>
        <div class="gas-grid" v-if="gasData">
          <div class="gas-card low">
            <div class="gas-label">低</div>
            <div class="gas-value text-green">{{ formatGas(gasData.low) }}</div>
            <div class="gas-unit">gwei</div>
          </div>
          <div class="gas-card average">
            <div class="gas-label">平均</div>
            <div class="gas-value text-orange">{{ formatGas(gasData.average) }}</div>
            <div class="gas-unit">gwei</div>
          </div>
          <div class="gas-card high">
            <div class="gas-label">高</div>
            <div class="gas-value text-red">{{ formatGas(gasData.high) }}</div>
            <div class="gas-unit">gwei</div>
          </div>
        </div>
        <div v-else class="loading">
          <div class="loading-spinner"></div>
          <div class="loading-text">加载中...</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getStats, getRecentBlocks, getGasTracker, search } from '../api'

const router = useRouter()
const searchQuery = ref('')
const stats = ref(null)
const blocks = ref([])
const gasData = ref(null)

onMounted(async () => {
  await loadData()
})

async function loadData() {
  try {
    const results = await Promise.allSettled([
      getStats(),
      getRecentBlocks(10),
      getGasTracker()
    ])

    const statsRes = results[0].status === 'fulfilled' ? results[0].value : null
    const blocksRes = results[1].status === 'fulfilled' ? results[1].value : null
    const gasRes = results[2].status === 'fulfilled' ? results[2].value : null

    if (statsRes && statsRes.success && statsRes.data) {
      stats.value = statsRes.data
    }
    if (blocksRes && blocksRes.success && blocksRes.data) {
      blocks.value = blocksRes.data.blocks || []
    }
    if (gasRes && gasRes.success && gasRes.data) {
      gasData.value = gasRes.data
    }
  } catch (e) {
    console.error('Failed to load data:', e)
  }
}

async function handleSearch() {
  if (!searchQuery.value.trim()) return

  try {
    const result = await search(searchQuery.value.trim())
    if (result.success && result.data && result.data.redirect) {
      router.push(result.data.redirect)
    } else {
      alert('无法识别的查询格式，请输入有效的区块号/交易哈希/地址')
    }
  } catch (e) {
    console.error('Search error:', e)
  }
}

function formatNumber(n) {
  if (!n) return '0'
  return Number(n).toLocaleString()
}

function formatBlockNumber(hex) {
  if (!hex) return '0'
  return parseInt(hex, 16)
}

function formatTime(hexTs) {
  if (!hexTs) return '--'
  const ts = parseInt(hexTs, 16)
  const date = new Date(ts * 1000)
  const diff = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diff < 60) return `${diff}秒前`
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  return `${Math.floor(diff / 86400)}天前`
}

function truncateHash(hash) {
  if (!hash) return ''
  if (hash.length <= 12) return hash
  return hash.slice(0, 6) + '...' + hash.slice(-4)
}

function formatPercent(v) {
  if (v === undefined || v === null) return '0%'
  return Number(v).toFixed(1) + '%'
}

function formatGas(str) {
  if (!str) return '--'
  const num = parseFloat(str)
  return num.toFixed(1)
}
</script>