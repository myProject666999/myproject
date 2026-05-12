<template>
  <div class="profile-page page-container">
    <div class="profile-header" v-if="riderInfo">
      <div class="avatar">{{ (riderInfo.real_name || riderInfo.username)[0] }}</div>
      <div class="user-info">
        <h3>{{ riderInfo.real_name || riderInfo.username }}</h3>
        <p>余额：<span class="price-highlight">¥{{ riderInfo.balance?.toFixed(2) || '0.00' }}</span></p>
        <p>评分：{{ riderInfo.rating?.toFixed(1) || '5.0' }} / 5.0</p>
      </div>
    </div>

    <van-cell-group inset style="margin-top: 20px">
      <van-cell
        title="今日订单"
        :value="todayStats.todayOrders.toString()"
        is-link
      />
      <van-cell
        title="今日收入"
        :value="`¥${todayStats.todayIncome.toFixed(2)}`"
        is-link
      />
    </van-cell-group>

    <van-cell-group inset style="margin-top: 20px">
      <van-cell
        title="我的订单"
        is-link
        @click="$router.push('/order')"
      >
        <template #icon>
          <van-icon name="orders-o" />
        </template>
      </van-cell>
      <van-cell
        title="异常工单"
        is-link
        @click="$router.push('/exception')"
      >
        <template #icon>
          <van-icon name="warning-o" />
        </template>
      </van-cell>
    </van-cell-group>

    <van-cell-group inset style="margin-top: 20px">
      <van-cell
        title="个人信息"
        is-link
      >
        <template #icon>
          <van-icon name="user-o" />
        </template>
      </van-cell>
    </van-cell-group>

    <div style="margin: 30px 16px">
      <van-button round block type="danger" @click="logout">
        退出登录
      </van-button>
    </div>

    <van-tabbar v-model="active" route>
      <van-tabbar-item to="/" icon="orders-o">接单大厅</van-tabbar-item>
      <van-tabbar-item to="/order" icon="todo-list-o">我的订单</van-tabbar-item>
      <van-tabbar-item to="/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog } from 'vant'
import { useRiderStore } from '@/stores/rider'
import { getRiderOrders } from '@/api/order'

const router = useRouter()
const riderStore = useRiderStore()

const active = ref(2)
const riderInfo = computed(() => riderStore.riderInfo)

const todayStats = reactive({
  todayOrders: 0,
  todayIncome: 0
})

function logout() {
  showConfirmDialog({
    title: '提示',
    message: '确定要退出登录吗？'
  }).then(() => {
    riderStore.logout()
    router.push('/login')
  }).catch(() => {
    // 用户取消
  })
}

async function loadTodayStats() {
  try {
    const res = await getRiderOrders({ page: 1, page_size: 100 })
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let orders = 0
    let income = 0

    for (const order of (res.orders || [])) {
      const orderTime = new Date(order.created_at)
      if (orderTime >= today) {
        if (order.status === 6) {
          orders++
          income += order.rider_income || 0
        }
      }
    }

    todayStats.todayOrders = orders
    todayStats.todayIncome = income
  } catch (error) {
    console.error('加载今日统计失败', error)
  }
}

onMounted(() => {
  if (riderStore.isLoggedIn) {
    riderStore.fetchProfile()
    loadTodayStats()
  }
})
</script>

<style scoped>
.profile-page {
  padding-bottom: 60px;
}

.profile-header {
  background: linear-gradient(135deg, #00b09b 0%, #96c93d 100%);
  padding: 40px 20px;
  display: flex;
  align-items: center;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
  font-weight: 600;
  margin-right: 15px;
}

.user-info {
  color: #fff;
}

.user-info h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 5px;
}

.user-info p {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 3px;
}
</style>
