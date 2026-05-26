<template>
  <div>
    <div style="display: flex; gap: 8px; margin-bottom: 16px;">
      <div
        v-for="tab in tabs"
        :key="tab.value"
        class="category-tab"
        :class="{ active: currentStatus === tab.value }"
        @click="switchTab(tab.value)"
      >
        {{ tab.label }}
      </div>
    </div>
    
    <div class="merchant-table">
      <table>
        <thead>
          <tr>
            <th>订单号</th>
            <th>用户</th>
            <th>金额</th>
            <th>状态</th>
            <th>配送状态</th>
            <th>下单时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td>{{ order.order_no }}</td>
            <td>{{ order.user?.username || '-' }}</td>
            <td>¥{{ order.payable_amount.toFixed(2) }}</td>
            <td>
              <span :class="`order-status status-${order.status}`">
                {{ statusMap[order.status] }}
              </span>
            </td>
            <td>
              <span :class="`order-status status-${order.delivery_status === 'delivered' ? 'completed' : 'delivering'}`">
                {{ deliveryStatusMap[order.delivery_status] }}
              </span>
            </td>
            <td>{{ formatTime(order.created_at) }}</td>
            <td>
              <button class="merchant-action-btn btn-primary" @click="viewOrder(order)">详情</button>
              <template v-if="order.status === 'paid'">
                <button class="merchant-action-btn btn-warning" @click="updateStatus(order, 'preparing')">备货</button>
              </template>
              <template v-if="order.status === 'preparing'">
                <button class="merchant-action-btn btn-warning" @click="updateStatus(order, 'delivering')">发货</button>
              </template>
              <template v-if="order.status === 'delivering'">
                <button class="merchant-action-btn btn-primary" @click="updateStatus(order, 'completed')">完成</button>
              </template>
              <template v-if="order.status === 'pending'">
                <button class="merchant-action-btn btn-danger" @click="updateStatus(order, 'cancelled')">取消</button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <van-popup v-model:show="showDetail" position="right" round style="width: 70%; padding: 20px; max-height: 100vh; overflow-y: auto;">
      <div v-if="selectedOrder">
        <h3 style="margin-bottom: 16px;">订单详情</h3>
        <div class="checkout-row"><span class="checkout-label">订单号</span><span class="checkout-value">{{ selectedOrder.order_no }}</span></div>
        <div class="checkout-row"><span class="checkout-label">收货地址</span><span class="checkout-value">{{ selectedOrder.delivery_address }}</span></div>
        <div class="checkout-row"><span class="checkout-label">联系人</span><span class="checkout-value">{{ selectedOrder.contact_name }} {{ selectedOrder.contact_phone }}</span></div>
        <div class="checkout-row"><span class="checkout-label">配送时段</span><span class="checkout-value">{{ selectedOrder.delivery_slot?.start_time }} - {{ selectedOrder.delivery_slot?.end_time }}</span></div>
        
        <div class="section-title" style="padding: 16px 0 8px 0;">商品列表</div>
        <div
          v-for="item in selectedOrder.items"
          :key="item.id"
          style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;"
        >
          <span>{{ item.product_name }} x {{ item.quantity }}{{ item.price_unit === 'weight' ? 'kg' : '份' }}</span>
          <span>¥{{ item.subtotal.toFixed(2) }}</span>
        </div>
        
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #eee;">
          <div class="checkout-row"><span class="checkout-label">商品金额</span><span class="checkout-value">¥{{ selectedOrder.total_amount.toFixed(2) }}</span></div>
          <div class="checkout-row"><span class="checkout-label">配送费</span><span class="checkout-value">¥{{ selectedOrder.delivery_fee.toFixed(2) }}</span></div>
          <div class="checkout-row"><span class="checkout-label">应付金额</span><span class="checkout-value" style="color: #4CAF50; font-weight: bold;">¥{{ selectedOrder.payable_amount.toFixed(2) }}</span></div>
        </div>
        
        <div style="margin-top: 16px;">
          <button class="merchant-action-btn btn-default" @click="showDetail = false">关闭</button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { showConfirmDialog, showToast } from 'vant'
import { orderApi } from '../../api'

const tabs = [
  { label: '全部', value: '' },
  { label: '待支付', value: 'pending' },
  { label: '待配送', value: 'paid' },
  { label: '配送中', value: 'delivering' },
  { label: '已完成', value: 'completed' },
]

const statusMap = {
  pending: '待支付',
  paid: '已支付',
  preparing: '备货中',
  delivering: '配送中',
  completed: '已完成',
  cancelled: '已取消',
  refunded: '已退款',
}

const deliveryStatusMap = {
  pending: '待配送',
  picked_up: '已取货',
  delivering: '配送中',
  delivered: '已送达',
  failed: '配送失败',
}

const orders = ref([])
const currentStatus = ref('')
const showDetail = ref(false)
const selectedOrder = ref(null)

function formatTime(timeStr) {
  if (!timeStr) return '-'
  return new Date(timeStr).toLocaleString('zh-CN')
}

async function loadOrders() {
  try {
    const params = { page: 1, page_size: 50 }
    if (currentStatus.value) {
      params.status = currentStatus.value
    }
    const res = await orderApi.getOrders(params)
    orders.value = res.orders || []
  } catch (e) {}
}

function switchTab(status) {
  currentStatus.value = status
  loadOrders()
}

async function viewOrder(order) {
  try {
    const res = await orderApi.getOrder(order.id)
    selectedOrder.value = res.order
    showDetail.value = true
  } catch (e) {}
}

async function updateStatus(order, status) {
  try {
    await showConfirmDialog({
      title: '确认操作',
      message: `确定将订单状态更新为"${statusMap[status]}"吗？`,
    })
    await orderApi.updateOrderStatus(order.id, { status })
    showToast('操作成功')
    loadOrders()
  } catch (e) {}
}

onMounted(loadOrders)
</script>
