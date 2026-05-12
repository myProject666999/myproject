<template>
  <div class="home-page page-container">
    <div class="header">
      <div class="welcome">
        <h3>您好，{{ riderInfo?.real_name || riderInfo?.username || '骑手' }}</h3>
        <div class="stats">
          <div class="stat-item">
            <span class="stat-value">{{ riderInfo?.order_count || 0 }}</span>
            <span class="stat-label">总订单</span>
          </div>
          <div class="stat-item">
            <span class="stat-value price-highlight">¥{{ riderInfo?.income?.toFixed(2) || '0.00' }}</span>
            <span class="stat-label">总收入</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ riderInfo?.rating?.toFixed(1) || '5.0' }}</span>
            <span class="stat-label">评分</span>
          </div>
        </div>
      </div>
      <div class="online-switch">
        <span>{{ isOnline ? '接单中' : '已下线' }}</span>
        <van-switch v-model="isOnline" active-color="#07c160" inactive-color="#dcdee0" @change="onOnlineChange" />
      </div>
    </div>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div
          v-for="order in orders"
          :key="order.id"
          class="order-card"
          @click="goToDetail(order.id)"
        >
          <div class="order-header">
            <span class="item-type">{{ getItemTypeText(order.item_type) }}</span>
            <span class="income price-highlight">+¥{{ order.rider_income }}</span>
          </div>
          <div class="order-route">
            <div class="route-item">
              <span class="dot pickup"></span>
              <span class="address">{{ order.pickup_address }}</span>
            </div>
            <div class="route-line"></div>
            <div class="route-item">
              <span class="dot delivery"></span>
              <span class="address">{{ order.delivery_address }}</span>
            </div>
          </div>
          <div class="order-info">
            <span>{{ order.distance?.toFixed(1) }}km</span>
            <span>预计 {{ order.estimated_time }}分钟</span>
            <van-button type="primary" size="small" @click.stop="acceptOrder(order.id)">
              抢单
            </van-button>
          </div>
        </div>

        <van-empty v-if="orders.length === 0 && !loading" description="暂无可用订单" />
      </van-list>
    </van-pull-refresh>

    <van-tabbar v-model="active" route>
      <van-tabbar-item to="/" icon="orders-o">接单大厅</van-tabbar-item>
      <van-tabbar-item to="/order" icon="todo-list-o">我的订单</van-tabbar-item>
      <van-tabbar-item to="/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { useRiderStore } from '@/stores/rider'
import { getAvailableOrders, acceptOrder as acceptOrderApi } from '@/api/order'
import { updateOnlineStatus, updateLocation } from '@/api/rider'

const router = useRouter()
const riderStore = useRiderStore()

const active = ref(0)
const orders = ref<any[]>([])
const page = ref(1)
const pageSize = 20
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const isOnline = ref(false)

const riderInfo = computed(() => riderStore.riderInfo)

const itemTypeMap: Record<number, string> = {
  1: '文件',
  2: '鲜花',
  3: '食品',
  4: '其他'
}

function getItemTypeText(type: number) {
  return itemTypeMap[type] || '其他'
}

function goToDetail(id: number) {
  router.push(`/order/${id}`)
}

async function acceptOrder(orderId: number) {
  showLoadingToast({ message: '抢单中...', forbidClick: true })
  try {
    await acceptOrderApi(orderId)
    showToast('抢单成功')
    router.push(`/order/${orderId}`)
  } catch (error: any) {
    showToast(error.message || '抢单失败')
  } finally {
    closeToast()
  }
}

async function onOnlineChange(value: boolean) {
  try {
    await updateOnlineStatus(value ? 1 : 0)
    showToast(value ? '已上线' : '已下线')
    if (value) {
      startLocationUpdate()
    } else {
      stopLocationUpdate()
    }
  } catch (error: any) {
    isOnline.value = !value
    showToast(error.message || '操作失败')
  }
}

let locationInterval: number | null = null

function startLocationUpdate() {
  if (navigator.geolocation) {
    locationInterval = window.setInterval(async () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await updateLocation(position.coords.longitude, position.coords.latitude)
          } catch (error) {
            console.error('更新位置失败', error)
          }
        },
        (error) => {
          console.error('获取位置失败', error)
        }
      )
    }, 10000)
  }
}

function stopLocationUpdate() {
  if (locationInterval) {
    clearInterval(locationInterval)
    locationInterval = null
  }
}

async function onLoad() {
  if (loading.value) return

  loading.value = true
  try {
    const params = {
      page: page.value,
      page_size: pageSize,
      longitude: 116.397428,
      latitude: 39.90923
    }

    const res = await getAvailableOrders(params)
    orders.value = [...orders.value, ...(res.orders || [])]

    if ((res.orders || []).length < pageSize) {
      finished.value = true
    } else {
      page.value++
    }
  } catch (error) {
    console.error('加载订单失败', error)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

async function onRefresh() {
  page.value = 1
  orders.value = []
  finished.value = false
  await onLoad()
}

onMounted(async () => {
  if (riderStore.isLoggedIn) {
    await riderStore.fetchProfile()
    if (riderInfo.value) {
      isOnline.value = riderInfo.value.online_status === 1
    }
    onLoad()
  }
})

onUnmounted(() => {
  stopLocationUpdate()
})
</script>

<style scoped>
.home-page {
  padding-bottom: 60px;
}

.header {
  background: linear-gradient(135deg, #00b09b 0%, #96c93d 100%);
  padding: 30px 20px;
  color: #fff;
}

.welcome h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
}

.stats {
  display: flex;
  justify-content: space-between;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
}

.stat-label {
  font-size: 12px;
  opacity: 0.9;
  margin-top: 3px;
}

.online-switch {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.order-card {
  background: #fff;
  margin: 10px 15px;
  border-radius: 12px;
  padding: 15px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.item-type {
  font-size: 14px;
  color: #1989fa;
  font-weight: 600;
}

.income {
  font-size: 18px;
  font-weight: 600;
}

.order-route {
  position: relative;
  padding-left: 20px;
  margin-bottom: 12px;
}

.route-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.route-item:last-child {
  margin-bottom: 0;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  position: absolute;
  left: 0;
}

.dot.pickup {
  background: #07c160;
  top: 5px;
}

.dot.delivery {
  background: #1989fa;
  bottom: 5px;
}

.route-line {
  position: absolute;
  left: 3px;
  top: 16px;
  bottom: 16px;
  width: 2px;
  background: #ebedf0;
}

.address {
  flex: 1;
  font-size: 14px;
  color: #323233;
  margin-left: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #ebedf0;
  font-size: 13px;
  color: #969799;
}
</style>
