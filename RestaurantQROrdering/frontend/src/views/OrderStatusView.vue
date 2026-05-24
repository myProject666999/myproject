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

        <div class="progress-bar">
          <div
            :class="['progress-step', { active: isStepActive(order.orderStatus, 0) }]"
          >
            <div class="dot">
              <span v-if="isStepDone(order.orderStatus, 0)">✓</span>
              <span v-else>1</span>
            </div>
            <span>下单</span>
          </div>
          <div class="progress-line" :class="{ active: isStepDone(order.orderStatus, 0) }"></div>
          <div
            :class="['progress-step', { active: isStepActive(order.orderStatus, 1) }]"
          >
            <div class="dot">
              <span v-if="isStepDone(order.orderStatus, 1)">✓</span>
              <span v-else>2</span>
            </div>
            <span>制作</span>
          </div>
          <div class="progress-line" :class="{ active: isStepDone(order.orderStatus, 1) }"></div>
          <div
            :class="['progress-step', { active: isStepActive(order.orderStatus, 2) }]"
          >
            <div class="dot">
              <span v-if="isStepDone(order.orderStatus, 2)">✓</span>
              <span v-else>3</span>
            </div>
            <span>出餐</span>
          </div>
          <div class="progress-line" :class="{ active: isStepDone(order.orderStatus, 2) }"></div>
          <div
            :class="['progress-step', { active: isStepActive(order.orderStatus, 3) }]"
          >
            <div class="dot">
              <span v-if="isStepDone(order.orderStatus, 3)">✓</span>
              <span v-else>4</span>
            </div>
            <span>完成</span>
          </div>
        </div>

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
          <span :class="['pay-status', order.payStatus]">{{ getPayStatusText(order.payStatus) }}</span>
        </div>

        <div class="order-actions">
          <button
            v-if="order.orderStatus === 'PENDING'"
            class="btn-cancel"
            @click="cancelOrder(order.id)"
          >
            取消订单
          </button>
          <button
            v-if="order.payStatus === 'UNPAID' && order.orderStatus !== 'CANCELLED'"
            class="btn-pay"
            @click="payOrder(order.id)"
          >
            去支付
          </button>
          <button
            class="btn-menu"
            @click="goToMenu"
          >
            继续点餐
          </button>
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
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { getOrdersByTable, cancelOrder as cancelOrderApi, payOrder as payOrderApi } from '../api/order'
import { useTableStore } from '../store/table'

const router = useRouter()
const tableStore = useTableStore()

const orders = ref([])
let ws = null

const STATUS_ORDER = ['PENDING', 'CONFIRMED', 'COOKING', 'SERVED', 'COMPLETED']

const isStepDone = (status, step) => {
  if (status === 'CANCELLED') return false
  const idx = STATUS_ORDER.indexOf(status)
  return idx > step
}

const isStepActive = (status, step) => {
  if (status === 'CANCELLED') return false
  const idx = STATUS_ORDER.indexOf(status)
  return idx >= step
}

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

const payOrder = async (orderId) => {
  try {
    await showConfirmDialog({
      title: '确认支付',
      message: '确认完成支付？',
      confirmButtonText: '确认支付',
      cancelButtonText: '取消'
    })
    await payOrderApi(orderId)
    showToast('支付成功')
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
  font-weight: 500;
}

.pay-status.UNPAID {
  color: #ff9800;
}

.pay-status.PAID {
  color: #4caf50;
}

.pay-status.REFUNDED {
  color: #9e9e9e;
}

.progress-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 12px 0;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #999;
  font-size: 12px;
}

.progress-step.active {
  color: #ff6b6b;
  font-weight: 500;
}

.progress-step .dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e0e0e0;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  margin-bottom: 6px;
}

.progress-step.active .dot {
  background: #ff6b6b;
  color: white;
}

.progress-line {
  flex: 1;
  height: 2px;
  background: #e0e0e0;
  margin: 0 4px;
  transform: translateY(-10px);
}

.progress-line.active {
  background: #ff6b6b;
}

.order-actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-cancel, .btn-pay, .btn-menu {
  border: none;
  padding: 8px 16px;
  border-radius: 16px;
  font-size: 14px;
  cursor: pointer;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-pay {
  background: #ff6b6b;
  color: white;
}

.btn-menu {
  background: #3498db;
  color: white;
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
