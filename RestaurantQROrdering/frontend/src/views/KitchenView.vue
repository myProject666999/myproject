<template>
  <div class="kitchen-view">
    <div class="header">
      <h2>后厨看板</h2>
      <div class="tabs">
        <span :class="['tab', { active: activeTab === 'all' }]" @click="activeTab = 'all'">
          全部 ({{ orders.length }})
        </span>
        <span :class="['tab', { active: activeTab === 'pending' }]" @click="activeTab = 'pending'">
          待制作 ({{ pendingCount }})
        </span>
        <span :class="['tab', { active: activeTab === 'cooking' }]" @click="activeTab = 'cooking'">
          制作中 ({{ cookingCount }})
        </span>
      </div>
    </div>

    <div class="order-list" v-if="filteredOrders.length > 0">
      <div v-for="order in filteredOrders" :key="order.id" class="order-card">
        <div class="order-header">
          <span class="order-no">#{{ order.orderNo }}</span>
          <span class="table-no">{{ order.tableNo }}号桌</span>
        </div>

        <div class="order-info">
          <span :class="['order-status', order.orderStatus]">{{ getOrderStatusText(order.orderStatus) }}</span>
          <span class="order-time">{{ formatTime(order.createTime) }}</span>
        </div>

        <div class="order-items">
          <div
            v-for="item in order.items"
            :key="item.id"
            :class="['order-item', item.dishStatus]"
          >
            <div class="item-info">
              <span class="item-name">{{ item.dishName }}</span>
              <span class="item-qty">x{{ item.quantity }}</span>
            </div>
            <div class="item-actions">
              <button
                v-if="item.dishStatus === 'PENDING'"
                class="btn-cook"
                @click="startCooking(item.id)"
              >
                开始制作
              </button>
              <button
                v-if="item.dishStatus === 'COOKING'"
                class="btn-serve"
                @click="serveDish(item.id)"
              >
                出餐
              </button>
              <span
                v-if="item.dishStatus === 'SERVED'"
                class="served-badge"
              >
                ✓ 已出餐
              </span>
            </div>
          </div>
        </div>

        <div class="order-footer">
          <span>{{ order.items.length }}道菜</span>
          <button
            class="btn-complete"
            v-if="canComplete(order)"
            @click="completeOrder(order.id)"
          >
            完成订单
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty">
      <div class="empty-icon">🍳</div>
      <p>暂无待处理订单</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { showToast } from 'vant'
import { getActiveOrders, startCooking as startCookingApi, serveDish as serveDishApi, completeOrder as completeOrderApi } from '../api/order'

const orders = ref([])
const activeTab = ref('all')
let ws = null

const pendingCount = computed(() => {
  return orders.value.filter(order =>
    order.items.some(item => item.dishStatus === 'PENDING')
  ).length
})

const cookingCount = computed(() => {
  return orders.value.filter(order =>
    order.items.some(item => item.dishStatus === 'COOKING')
  ).length
})

const filteredOrders = computed(() => {
  if (activeTab.value === 'pending') {
    return orders.value.filter(order =>
      order.items.some(item => item.dishStatus === 'PENDING')
    )
  }
  if (activeTab.value === 'cooking') {
    return orders.value.filter(order =>
      order.items.some(item => item.dishStatus === 'COOKING')
    )
  }
  return orders.value
})

const canComplete = (order) => {
  return order.items.every(item => item.dishStatus === 'SERVED') &&
         order.orderStatus !== 'COMPLETED'
}

const getOrderStatusText = (status) => {
  const map = {
    PENDING: '待确认',
    CONFIRMED: '已确认',
    COOKING: '制作中',
    SERVED: '已出餐',
    COMPLETED: '已完成',
    CANCELLED: '已取消'
  }
  return map[status] || status
}

const formatTime = (time) => {
  if (!time) return ''
  const d = new Date(time)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

const loadOrders = async () => {
  orders.value = await getActiveOrders()
}

const startCooking = async (itemId) => {
  try {
    await startCookingApi(itemId)
    showToast('已开始制作')
    await loadOrders()
  } catch (e) {
    console.error(e)
  }
}

const serveDish = async (itemId) => {
  try {
    await serveDishApi(itemId)
    showToast('已出餐')
    await loadOrders()
  } catch (e) {
    console.error(e)
  }
}

const completeOrder = async (orderId) => {
  try {
    await completeOrderApi(orderId)
    showToast('订单已完成')
    await loadOrders()
  } catch (e) {
    console.error(e)
  }
}

const initWebSocket = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  ws = new WebSocket(`${protocol}//${window.location.host}/ws/orders`)

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.type === 'NEW_ORDER' || data.type === 'ORDER_UPDATE') {
      loadOrders()
    }
  }

  ws.onclose = () => {
    console.log('WebSocket连接关闭')
  }
}

onMounted(() => {
  loadOrders()
  initWebSocket()
})

onUnmounted(() => {
  if (ws) {
    ws.close()
  }
})
</script>

<style scoped>
.kitchen-view {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: #fff;
  padding: 16px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.header h2 {
  margin: 0 0 12px;
  font-size: 20px;
  text-align: center;
}

.tabs {
  display: flex;
  gap: 12px;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.tab.active {
  background: #ff6b6b;
  color: white;
  box-shadow: 0 2px 6px rgba(255,107,107,0.3);
}

.order-list {
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
}

.order-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s;
}

.order-card:hover {
  transform: translateY(-2px);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 12px;
  border-bottom: 2px solid #ff6b6b;
}

.order-no {
  font-size: 16px;
  font-weight: 600;
  color: #ff6b6b;
}

.table-no {
  font-size: 14px;
  color: #666;
  background: #f5f5f5;
  padding: 4px 12px;
  border-radius: 12px;
}

.order-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 12px;
}

.order-status {
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
}

.order-status.PENDING { background: #fff3e0; color: #ff9800; }
.order-status.CONFIRMED { background: #e3f2fd; color: #2196f3; }
.order-status.COOKING { background: #fce4ec; color: #e91e63; }
.order-status.SERVED { background: #e8f5e9; color: #4caf50; }

.order-time {
  color: #999;
}

.order-items {
  margin-bottom: 12px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  background: #fafafa;
  transition: background 0.2s;
}

.order-item.COOKING {
  background: #fff3e0;
  border-left: 3px solid #ff9800;
}

.order-item.SERVED {
  background: #e8f5e9;
  border-left: 3px solid #4caf50;
}

.order-item.PENDING {
  border-left: 3px solid #999;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-name {
  font-size: 15px;
  font-weight: 500;
}

.item-qty {
  font-size: 13px;
  color: #999;
}

.item-actions {
  display: flex;
  gap: 8px;
}

.btn-cook {
  background: #ff9800;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cook:hover {
  background: #f57c00;
}

.btn-serve {
  background: #4caf50;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-serve:hover {
  background: #388e3c;
}

.served-badge {
  color: #4caf50;
  font-size: 12px;
  font-weight: 500;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f5f5f5;
  color: #666;
  font-size: 14px;
  margin-top: auto;
}

.btn-complete {
  background: #2196f3;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-complete:hover {
  background: #1976d2;
}

.empty {
  text-align: center;
  padding: 80px 20px;
  color: #999;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}
</style>
