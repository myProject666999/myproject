<template>
  <div class="page-container">
    <div class="app-header">📦 我的订单</div>
    
    <div style="display: flex; padding: 12px; gap: 8px; overflow-x: auto;">
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
    
    <div v-if="orders.length > 0" style="padding: 0 12px;">
      <div
        v-for="order in orders"
        :key="order.id"
        class="order-card"
        @click="goToDetail(order.id)"
      >
        <div class="order-header">
          <span class="order-no">{{ order.order_no }}</span>
          <span class="order-status" :class="`status-${order.status}`">
            {{ statusMap[order.status] }}
          </span>
        </div>
        
        <div
          v-for="item in order.items?.slice(0, 2)"
          :key="item.id"
          class="order-item"
        >
          <span>{{ item.product_name }} x {{ item.quantity }}{{ item.price_unit === 'weight' ? 'kg' : '份' }}</span>
          <span>¥{{ item.subtotal.toFixed(2) }}</span>
        </div>
        <div v-if="order.items?.length > 2" class="order-item" style="color: #999;">
          <span>...共 {{ order.items.length }} 件商品</span>
          <span></span>
        </div>
        
        <div class="order-footer">
          <span class="order-total">合计: </span>
          <span class="order-amount">¥{{ order.payable_amount.toFixed(2) }}</span>
        </div>
      </div>
    </div>
    
    <div v-else-if="!loading" class="empty-state">
      <div class="empty-icon">📦</div>
      <div>暂无订单</div>
      <van-button style="margin-top: 16px;" type="primary" @click="$router.push('/')">
        去下单
      </van-button>
    </div>
    
    <TabBar />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { orderApi } from '../api'
import TabBar from '../components/TabBar.vue'

const router = useRouter()

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

const orders = ref([])
const currentStatus = ref('')
const loading = ref(false)

async function loadOrders() {
  loading.value = true
  try {
    const params = { page: 1, page_size: 20 }
    if (currentStatus.value) {
      params.status = currentStatus.value
    }
    const res = await orderApi.getOrders(params)
    orders.value = res.orders || []
  } catch (e) {}
  loading.value = false
}

function switchTab(status) {
  currentStatus.value = status
  loadOrders()
}

function goToDetail(id) {
  router.push(`/orders/${id}`)
}

onMounted(loadOrders)
</script>
