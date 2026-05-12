<template>
  <div class="order-list-page page-container">
    <van-nav-bar title="我的订单" />

    <van-tabs v-model:active="activeTab" @change="onTabChange">
      <van-tab title="全部" />
      <van-tab title="待取件" />
      <van-tab title="配送中" />
      <van-tab title="已完成" />
    </van-tabs>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div v-for="order in orders" :key="order.id" class="order-card" @click="goToDetail(order.id)">
          <div class="order-header">
            <span class="order-no">订单号：{{ order.order_no }}</span>
            <span :class="['status-tag', getStatusClass(order.status)]">{{ getStatusText(order.status) }}</span>
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
            <span>{{ getItemTypeText(order.item_type) }} · {{ order.distance?.toFixed(1) }}km</span>
            <span class="price-highlight">¥{{ order.rider_income }}</span>
          </div>
        </div>

        <van-empty v-if="orders.length === 0 && !loading" description="暂无订单" />
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getRiderOrders } from '@/api/order'

const router = useRouter()
const active = ref(1)
const activeTab = ref(0)
const orders = ref<any[]>([])
const page = ref(1)
const pageSize = 20
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

const statusMap = [
  { status: null, text: '全部' },
  { status: 1, text: '待取件' },
  { status: 4, text: '配送中' },
  { status: 6, text: '已完成' }
]

const currentStatus = computed(() => {
  return statusMap[activeTab.value].status
})

const itemTypeMap: Record<number, string> = {
  1: '文件',
  2: '鲜花',
  3: '食品',
  4: '其他'
}

const statusTextMap: Record<number, string> = {
  1: '已接单',
  2: '取件中',
  3: '已取件',
  4: '配送中',
  5: '待签收',
  6: '已完成',
  7: '已取消',
  8: '异常'
}

function getStatusText(status: number) {
  return statusTextMap[status] || '未知'
}

function getStatusClass(status: number) {
  const classMap: Record<number, string> = {
    1: 'status-accepted',
    2: 'status-accepted',
    3: 'status-delivering',
    4: 'status-delivering',
    5: 'status-delivering',
    6: 'status-completed',
    7: 'status-cancelled',
    8: 'status-cancelled'
  }
  return classMap[status] || ''
}

function getItemTypeText(type: number) {
  return itemTypeMap[type] || '其他'
}

function goToDetail(id: number) {
  router.push(`/order/${id}`)
}

function onTabChange(index: number) {
  page.value = 1
  orders.value = []
  finished.value = false
  onLoad()
}

async function onLoad() {
  if (loading.value) return

  loading.value = true
  try {
    const params: any = {
      page: page.value,
      page_size: pageSize
    }
    if (currentStatus.value !== null) {
      params.status = currentStatus.value
    }

    const res = await getRiderOrders(params)
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

onMounted(() => {
  onLoad()
})
</script>

<style scoped>
.order-list-page {
  padding-bottom: 60px;
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
  font-size: 12px;
  color: #969799;
}

.order-no {
  color: #323233;
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
