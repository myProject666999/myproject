<template>
  <div class="page-container">
    <div class="app-header" @click="$router.back()" style="cursor: pointer;">← 订单详情</div>
    
    <div v-if="order" style="padding: 12px;">
      <div class="order-card">
        <div class="order-header">
          <span class="order-no">{{ order.order_no }}</span>
          <span class="order-status" :class="`status-${order.status}`">
            {{ statusMap[order.status] }}
          </span>
        </div>
        
        <div class="checkout-row" style="padding: 8px 0;">
          <span class="checkout-label">配送地址</span>
          <span class="checkout-value">{{ order.delivery_address }}</span>
        </div>
        <div class="checkout-row" style="padding: 8px 0;">
          <span class="checkout-label">联系人</span>
          <span class="checkout-value">{{ order.contact_name }} {{ order.contact_phone }}</span>
        </div>
        <div class="checkout-row" style="padding: 8px 0;">
          <span class="checkout-label">配送时段</span>
          <span class="checkout-value">
            {{ order.delivery_slot?.start_time }} - {{ order.delivery_slot?.end_time }}
          </span>
        </div>
        <div v-if="order.remark" class="checkout-row" style="padding: 8px 0;">
          <span class="checkout-label">备注</span>
          <span class="checkout-value">{{ order.remark }}</span>
        </div>
      </div>
      
      <div class="order-card">
        <div class="section-title" style="padding: 0 0 12px 0;">商品清单</div>
        <div
          v-for="item in order.items"
          :key="item.id"
          style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;"
        >
          <div>
            <div style="font-size: 14px;">{{ item.product_name }}</div>
            <div style="font-size: 12px; color: #999;">
              ¥{{ item.unit_price.toFixed(2) }}/{{ item.price_unit === 'weight' ? 'kg' : '份' }}
               x {{ item.quantity }}{{ item.price_unit === 'weight' ? 'kg' : '份' }}
            </div>
          </div>
          <span>¥{{ item.subtotal.toFixed(2) }}</span>
        </div>
        
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #eee;">
          <div class="checkout-row">
            <span class="checkout-label">商品金额</span>
            <span class="checkout-value">¥{{ order.total_amount.toFixed(2) }}</span>
          </div>
          <div class="checkout-row">
            <span class="checkout-label">配送费</span>
            <span class="checkout-value">¥{{ order.delivery_fee.toFixed(2) }}</span>
          </div>
          <div class="checkout-row">
            <span class="checkout-label" style="font-weight: bold;">应付金额</span>
            <span class="checkout-value" style="color: #4CAF50; font-weight: bold; font-size: 16px;">
              ¥{{ order.payable_amount.toFixed(2) }}
            </span>
          </div>
        </div>
      </div>
      
      <div v-if="deliveryRecords.length > 0" class="order-card">
        <div class="section-title" style="padding: 0 0 12px 0;">配送跟踪</div>
        <div
          v-for="record in deliveryRecords"
          :key="record.id"
          style="padding: 12px 0; border-bottom: 1px solid #eee; display: flex; gap: 12px;"
        >
          <div style="width: 8px; height: 8px; background: #4CAF50; border-radius: 50%; margin-top: 6px; flex-shrink: 0;"></div>
          <div style="flex: 1;">
            <div style="font-size: 13px; color: #333;">{{ deliveryActionMap[record.action] }}</div>
            <div v-if="record.description" style="font-size: 12px; color: #999; margin-top: 4px;">
              {{ record.description }}
            </div>
            <div style="font-size: 11px; color: #bbb; margin-top: 4px;">
              {{ formatTime(record.created_at) }}
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="order.status === 'pending'" style="margin-top: 16px;">
        <van-button block type="primary" @click="handlePay">模拟支付</van-button>
      </div>
    </div>
    
    <TabBar />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { showToast } from 'vant'
import { orderApi } from '../api'
import TabBar from '../components/TabBar.vue'

const route = useRoute()

const order = ref(null)
const deliveryRecords = ref([])

const statusMap = {
  pending: '待支付',
  paid: '已支付',
  preparing: '备货中',
  delivering: '配送中',
  completed: '已完成',
  cancelled: '已取消',
  refunded: '已退款',
}

const deliveryActionMap = {
  assigned: '订单已分配',
  picked_up: '已取货',
  en_route: '配送中',
  delivered: '已送达',
  failed: '配送失败',
}

function formatTime(timeStr) {
  if (!timeStr) return ''
  return new Date(timeStr).toLocaleString('zh-CN')
}

async function loadOrder() {
  try {
    const res = await orderApi.getOrder(route.params.id)
    order.value = res.order
    deliveryRecords.value = res.delivery_records || []
  } catch (e) {}
}

async function handlePay() {
  try {
    await orderApi.updateOrderStatus(route.params.id, { status: 'paid' })
    showToast('支付成功')
    loadOrder()
  } catch (e) {}
}

onMounted(loadOrder)
</script>
