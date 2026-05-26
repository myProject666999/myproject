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

      <div v-else-if="tx">
        <div class="detail-header">
          <h1 class="detail-title">交易详情</h1>
          <span class="detail-badge">{{ source.toUpperCase() }}</span>
        </div>

        <div class="detail-section">
          <div class="detail-section-header">交易信息</div>
          <div class="detail-section-body">
            <div class="detail-row">
              <div class="detail-label">交易哈希</div>
              <div class="detail-value text-mono">{{ tx.hash }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">状态</div>
              <div class="detail-value">
                <span v-if="receipt && receipt.status === '0x1'" class="text-green">成功</span>
                <span v-else-if="receipt && receipt.status === '0x0'" class="text-red">失败</span>
                <span v-else>未知</span>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-label">区块</div>
              <router-link
                :to="`/block/${parseInt(tx.blockNumber, 16)}`"
                class="detail-value text-accent"
              >#{{ parseInt(tx.blockNumber, 16) }}</router-link>
            </div>
            <div class="detail-row" v-if="tx.blockHash">
              <div class="detail-label">区块哈希</div>
              <div class="detail-value text-mono">{{ tx.blockHash }}</div>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-section-header">交易参与方</div>
          <div class="detail-section-body">
            <div class="detail-row">
              <div class="detail-label">发送方</div>
              <router-link :to="`/address/${tx.from}`" class="detail-value text-mono text-accent">
                {{ tx.from }}
              </router-link>
            </div>
            <div class="detail-row" v-if="tx.to">
              <div class="detail-label">接收方</div>
              <router-link :to="`/address/${tx.to}`" class="detail-value text-mono text-accent">
                {{ tx.to }}
              </router-link>
            </div>
            <div class="detail-row" v-else-if="receipt && receipt.contractAddress">
              <div class="detail-label">合约创建</div>
              <router-link
                :to="`/address/${receipt.contractAddress}`"
                class="detail-value text-mono text-accent text-purple"
              >
                {{ receipt.contractAddress }}
              </router-link>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-section-header">金额与费用</div>
          <div class="detail-section-body">
            <div class="detail-row">
              <div class="detail-label">转账金额</div>
              <div class="detail-value text-accent">{{ formatEther(tx.value) }} ETH</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Gas 价格</div>
              <div class="detail-value">{{ formatGwei(tx.gasPrice) }} gwei</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Gas 限额</div>
              <div class="detail-value">{{ parseInt(tx.gas, 16).toLocaleString() }}</div>
            </div>
            <div class="detail-row" v-if="receipt && receipt.gasUsed">
              <div class="detail-label">Gas 用量</div>
              <div class="detail-value">{{ parseInt(receipt.gasUsed, 16).toLocaleString() }}</div>
            </div>
            <div class="detail-row" v-if="receipt && receipt.gasUsed && tx.gasPrice">
              <div class="detail-label">手续费</div>
              <div class="detail-value">{{ formatFee(tx.gasPrice, receipt.gasUsed) }} ETH</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Nonce</div>
              <div class="detail-value">{{ parseInt(tx.nonce, 16) }}</div>
            </div>
          </div>
        </div>

        <div class="detail-section" v-if="tx.input && tx.input.length > 2">
          <div class="detail-section-header">交易输入数据</div>
          <div class="detail-section-body">
            <div class="detail-row">
              <div class="detail-label">数据大小</div>
              <div class="detail-value">{{ (tx.input.length - 2) / 2 }} bytes</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">输入数据</div>
              <div class="detail-value text-mono" style="word-break: break-all;">{{ tx.input }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getTransaction } from '../api'

const route = useRoute()
const loading = ref(true)
const error = ref(null)
const tx = ref(null)
const receipt = ref(null)
const source = ref('')

onMounted(async () => {
  await loadTransaction()
})

async function loadTransaction() {
  loading.value = true
  error.value = null
  tx.value = null
  receipt.value = null

  try {
    const res = await getTransaction(route.params.hash)
    if (res && res.success && res.data) {
      tx.value = res.data.transaction
      receipt.value = res.data.receipt
      source.value = res.source || 'rpc'
    } else {
      error.value = res?.error || '交易未找到'
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

function formatGwei(hex) {
  if (!hex) return '0'
  const wei = parseInt(hex, 16)
  return (wei / 1e9).toFixed(4)
}

function formatFee(gasPriceHex, gasUsedHex) {
  if (!gasPriceHex || !gasUsedHex) return '0'
  const fee = parseInt(gasPriceHex, 16) * parseInt(gasUsedHex, 16)
  return (fee / 1e18).toFixed(8)
}
</script>