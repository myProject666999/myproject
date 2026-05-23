<template>
  <div class="kitchen-view">
    <div class="header">
      <h2>后厨看板</h2>
      <div class="tabs">
        <span :class="['tab', { active: activeTab === 'all' }]" @click="activeTab = 'all'">全部</span>
        <span :class="['tab', { active: activeTab === 'pending' }]" @click="activeTab = 'pending'">待制作</span>
        <span :class="['tab', { active: activeTab === 'cooking' }]" @click="activeTab = 'cooking'">制作中</span>
      </div>
    </div>
    
    <div class="order-list" v-if="filteredOrders.length > 0">
      <div v-for="order in filteredOrders" :key="order.id" class="order-card">
        <div class="order-header">
          <span class="order-no">#{{ order.orderNo }}</span>
          <span class="table-no">{{ order.tableNo }}号桌</span>
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
  padding: 8px;
  background: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.tab.active {
  background: #ff6b6b;
  color: white;
}

.order-list {
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}

.order-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
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
}

.order-item.COOKING {
  background: #fff3e0;
}

.order-item.SERVED {
  background: #e8f5e9;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-name {
  font-size: 16px;
  font-weight: 500;
}

.item-qty {
  font-size: 14px;
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
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
}

.btn-serve {
  background: #4caf50;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
}

.served-badge {
  color: #4caf50;
  font-size: 12px;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f5f5f5;
  color: #666;
  font-size: 14px;
}

.btn-complete {
  background: #2196f3;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 14px;
  cursor: pointer;
}

.empty {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}
</style>
