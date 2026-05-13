<template>
  <div class="page-container">
    <van-nav-bar title="我的钱包" fixed placeholder />

    <div class="wallet-card">
      <div class="wallet-header">
        <span class="label">账户余额</span>
        <van-icon name="eye-o" size="20" @click="showBalance = !showBalance" />
      </div>
      <div class="wallet-balance">
        <span class="currency">¥</span>
        <span class="amount">{{ showBalance ? (wallet?.balance || 0) : '****' }}</span>
      </div>
      <div class="wallet-stats">
        <div class="stat-item">
          <span class="stat-label">累计收入</span>
          <span class="stat-value">¥{{ wallet?.totalIncome || 0 }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">累计提现</span>
          <span class="stat-value">¥{{ wallet?.totalWithdraw || 0 }}</span>
        </div>
      </div>
    </div>

    <div class="action-row">
      <van-button type="primary" round @click="showWithdraw = true">
        提现
      </van-button>
    </div>

    <div class="section-title">交易记录</div>
    <van-tabs v-model:active="activeTab">
      <van-tab title="全部" name="">
        <div class="transaction-list">
          <transaction-item
            v-for="item in filteredTransactions('')"
            :key="item.id"
            :item="item"
          />
          <van-empty v-if="filteredTransactions('').length === 0" description="暂无记录" />
        </div>
      </van-tab>
      <van-tab title="收入" name="INCOME">
        <div class="transaction-list">
          <transaction-item
            v-for="item in filteredTransactions('INCOME')"
            :key="item.id"
            :item="item"
          />
          <van-empty v-if="filteredTransactions('INCOME').length === 0" description="暂无收入记录" />
        </div>
      </van-tab>
      <van-tab title="支出" name="WITHDRAW">
        <div class="transaction-list">
          <transaction-item
            v-for="item in filteredTransactions('WITHDRAW')"
            :key="item.id"
            :item="item"
          />
          <van-empty v-if="filteredTransactions('WITHDRAW').length === 0" description="暂无支出记录" />
        </div>
      </van-tab>
    </van-tabs>

    <van-tabbar v-model="tabbarActive" route fixed>
      <van-tabbar-item to="/home" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/category" icon="apps-o">品类</van-tabbar-item>
      <van-tabbar-item to="/orders" icon="todo-list-o">订单</van-tabbar-item>
      <van-tabbar-item to="/wallet" icon="wallet-o">钱包</van-tabbar-item>
    </van-tabbar>

    <van-popup v-model:show="showWithdraw" position="bottom" round>
      <div class="withdraw-dialog">
        <div class="dialog-title">申请提现</div>
        <van-field
          v-model="withdrawAmount"
          type="number"
          label="提现金额"
          placeholder="请输入提现金额"
        />
        <div class="dialog-tip">可提现金额：¥{{ wallet?.balance || 0 }}</div>
        <div class="dialog-actions">
          <van-button plain block @click="showWithdraw = false">取消</van-button>
          <van-button type="primary" block @click="confirmWithdraw">确认</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted, defineComponent, h } from 'vue'
import { showToast } from 'vant'
import { walletApi } from '@/api'
import dayjs from 'dayjs'

const showBalance = ref(true)
const tabbarActive = ref(3)
const activeTab = ref('')
const wallet = ref(null)
const transactions = ref([])
const showWithdraw = ref(false)
const withdrawAmount = ref('')

const TransactionItem = defineComponent({
  props: ['item'],
  setup(props) {
    const isIncome = props.item.type === 'INCOME'
    const amount = isIncome ? `+¥${props.item.amount}` : `-¥${Math.abs(props.item.amount)}`
    const color = isIncome ? '#07c160' : '#ff6034'
    
    return () => h('div', { class: 'transaction-item' }, [
      h('div', { class: 'icon', style: { background: isIncome ? '#e8f5e9' : '#ffebee' } }, [
        h('span', isIncome ? '💰' : '💸')
      ]),
      h('div', { class: 'info' }, [
        h('div', { class: 'title' }, props.item.remark || (isIncome ? '回收收入' : '提现')),
        h('div', { class: 'time' }, dayjs(props.item.createTime).format('YYYY-MM-DD HH:mm'))
      ]),
      h('div', { class: 'amount', style: { color } }, amount)
    ])
  }
})

const loadWallet = async () => {
  try {
    const res = await walletApi.get()
    wallet.value = res.data
  } catch (e) {
    showToast('加载失败')
  }
}

const loadTransactions = async () => {
  try {
    const res = await walletApi.transactions()
    transactions.value = res.data || []
  } catch (e) {
    transactions.value = []
  }
}

const filteredTransactions = (type) => {
  if (!type) return transactions.value
  return transactions.value.filter(t => t.type === type)
}

const confirmWithdraw = async () => {
  if (!withdrawAmount.value || Number(withdrawAmount.value) <= 0) {
    showToast('请输入有效金额')
    return
  }
  try {
    await walletApi.withdraw(Number(withdrawAmount.value))
    showToast('申请成功')
    showWithdraw.value = false
    withdrawAmount.value = ''
    loadWallet()
    loadTransactions()
  } catch {}
}

onMounted(() => {
  loadWallet()
  loadTransactions()
})
</script>

<style lang="less" scoped>
.wallet-card {
  background: linear-gradient(135deg, #07c160 0%, #69d17c 100%);
  margin: 12px;
  padding: 24px;
  border-radius: 16px;
  color: white;
  
  .wallet-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 14px;
    opacity: 0.9;
  }
  
  .wallet-balance {
    display: flex;
    align-items: baseline;
    margin-bottom: 24px;
    
    .currency {
      font-size: 18px;
      margin-right: 4px;
    }
    
    .amount {
      font-size: 36px;
      font-weight: 700;
    }
  }
  
  .wallet-stats {
    display: flex;
    gap: 32px;
    
    .stat-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      
      .stat-label {
        font-size: 12px;
        opacity: 0.8;
      }
      
      .stat-value {
        font-size: 16px;
        font-weight: 600;
      }
    }
  }
}

.action-row {
  padding: 0 12px 16px;
}

.section-title {
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 600;
}

.transaction-list {
  background: white;
  min-height: 300px;
}

.transaction-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ebedf0;
  
  .icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    font-size: 20px;
  }
  
  .info {
    flex: 1;
    
    .title {
      font-size: 15px;
      margin-bottom: 4px;
    }
    
    .time {
      font-size: 12px;
      color: #969799;
    }
  }
  
  .amount {
    font-size: 16px;
    font-weight: 600;
  }
}

.withdraw-dialog {
  padding: 20px;
  
  .dialog-title {
    text-align: center;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 20px;
  }
  
  .dialog-tip {
    text-align: center;
    color: #969799;
    font-size: 13px;
    margin: 12px 0;
  }
  
  .dialog-actions {
    display: flex;
    gap: 12px;
    margin-top: 20px;
  }
}
</style>
