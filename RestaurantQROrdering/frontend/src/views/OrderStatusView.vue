<template>
  <div class="order-status-view">
    <div class="header">
      <h2>订单状态</h2>
    </div>
    
    <div class="order-list" v-if="orders.length > 0">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <span class="order-no">订单号: {{ order.orderNo }}</span>
          <span :class="['status-badge', order.orderStatus]">{{ getStatusText(order.orderStatus) }}</span>
        </div>
        
        <div class="table-info">桌台: {{ order.tableNo }}</div>
        
        <div class="order-items">
          <div v-for="item in order.items" :key="item.id" class="order-item">
            <span>{{ item.dishName }}</span>
            <span>x{{ item.quantity }}</span>
            <span>¥{{ item.subtotal }}</span>
            <span :class="['item-status', item.dishStatus]">{{ getItemStatusText(item.dishStatus) }}</span>
          </div>
        </div>
        
        <div class="order-footer">
          <span>合计: ¥{{ order.totalAmount }}</span>
          <span class="pay-status">{{ getPayStatusText(order.payStatus) }}</span>
        </div>
        
        <div class="order-actions" v-if="order.orderStatus === 'PENDING'">
          <button class="btn-cancel" @click="cancelOrder(order.id)">取消订单</button>
        </div>
      </div>
    </div>
    
    <div v-else class="empty">
      <div class="empty-icon">📋</div>
      <p>暂无订单</p>
      <button class="back-btn" @click="goToMenu">去点餐</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { getOrdersByTable, cancelOrder as cancelOrderApi } from '../api/order'
import { useTableStore } from '../store/table'

const router = useRouter()
const route = useRoute()
const tableStore = useTableStore()

const orders = ref([])
let ws = null

const getStatusText = (status) => {
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

const getItemStatusText = (status) => {
  const map = {
    PENDING: '待制作',
    COOKING: '制作中',
    SERVED: '已出餐'
  }
  return map[status] || status
}

const getPayStatusText = (status) => {
  const map = {
    UNPAID: '未支付',
    PAID: '已支付',
    REFUNDED: '已退款'
  }
  return map[status] || status
}

const loadOrders = async () => {
  if (tableStore.tableId) {
    orders.value = await getOrdersByTable(tableStore.tableId)
  }
}

const cancelOrder = async (orderId) => {
  try {
    await showConfirmDialog({
      title: '确认取消',
      message: '确定要取消这个订单吗？',
      confirmButtonText: '确认取消',
      cancelButtonText: '再想想'
    })
    await cancelOrderApi(orderId)
    showToast('订单已取消')
    await loadOrders()
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e)
    }
  }
}

const goToMenu = () => {
  router.push('/menu')
}

const initWebSocket = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  ws = new WebSocket(`${protocol}//${window.location.host}/ws/orders`)
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.type === 'ORDER_UPDATE' || data.type === 'NEW_ORDER') {
      loadOrders()
    }
  }
  
  ws.onclose = () => {
    console.log('WebSocket连接关闭')
  }
}

onMounted(async () => {
  await tableStore.loadCurrentTable()
  await loadOrders()
  initWebSocket()
})

onUnmounted(() => {
  if (ws) {
    ws.close()
  }
})
</script>

<style scoped>
.order-status-view {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: #fff;
  padding: 16px;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.header h2 {
  margin: 0;
  font-size: 18px;
}

.order-list {
  padding: 12px;
}

.order-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.order-no {
  font-size: 14px;
  color: #666;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.status-badge.PENDING { background: #fff3e0; color: #ff9800; }
.status-badge.CONFIRMED { background: #e3f2fd; color: #2196f3; }
.status-badge.COOKING { background: #fce4ec; color: #e91e63; }
.status-badge.SERVED { background: #e8f5e9; color: #4caf50; }
.status-badge.COMPLETED { background: #e0e0e0; color: #9e9e9e; }
.status-badge.CANCELLED { background: #ffebee; color: #f44336; }

.table-info {
  color: #666;
  font-size: 14px;
  margin-bottom: 12px;
}

.order-items {
  border-top: 1px solid #f5f5f5;
  border-bottom: 1px solid #f5f5f5;
  padding: 12px 0;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
}

.item-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 8px;
}

.item-status.PENDING { background: #fff3e0; color: #ff9800; }
.item-status.COOKING { background: #fce4ec; color: #e91e63; }
.item-status.SERVED { background: #e8f5e9; color: #4caf50; }

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.pay-status {
  color: #4caf50;
  font-weight: 500;
}

.order-actions {
  margin-top: 12px;
  text-align: right;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
  border: none;
  padding: 8px 16px;
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

.back-btn {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 20px;
  font-size: 16px;
  margin-top: 16px;
  cursor: pointer;
}
</style>
