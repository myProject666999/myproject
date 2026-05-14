<template>
  <div class="order-list">
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多订单了"
      @load="onLoad"
    >
      <div
        v-for="item in orders"
        :key="item.id"
        class="order-card"
        @click="$emit('click', item)"
      >
        <div class="order-header">
          <span class="order-no">订单号: {{ item.order_no }}</span>
          <van-tag :type="getStatusType(item.status)" size="medium">
            {{ getStatusLabel(item.status) }}
          </van-tag>
        </div>
        
        <van-cell
          :title="item.campsite_name"
          :value="'共' + getNights(item) + '晚'"
          center
        >
          <template #label>
            {{ item.checkin_date }} 至 {{ item.checkout_date }}
          </template>
          <template #icon>
            <van-icon name="location-o" color="#07c160" />
          </template>
        </van-cell>
        
        <div class="order-footer">
          <span class="total-price">
            实付: <span class="price">¥{{ item.total_amount }}</span>
          </span>
          <van-button 
            size="mini" 
            type="primary" 
            v-if="item.status === 'pending'"
            @click.stop="onPayClick(item)"
          >
            去支付
          </van-button>
          <van-button 
            size="mini" 
            type="primary" 
            plain 
            v-if="item.status === 'checked_out'"
            @click.stop="onReviewClick(item)"
          >
            去评价
          </van-button>
        </div>
      </div>
    </van-list>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

defineProps({
  orders: {
    type: Array,
    default: () => []
  }
})

defineEmits(['click'])

const loading = ref(false)
const finished = ref(true)

const onLoad = () => {
  loading.value = false
}

const onPayClick = (item) => {
  console.log('去支付:', item.order_no)
  alert('支付功能正在开发中')
}

const onReviewClick = (item) => {
  console.log('去评价:', item.order_no)
  router.push({
    path: '/create-review',
    query: {
      orderId: item.id,
      campsiteName: item.campsite_name,
      checkin: item.checkin_date,
      checkout: item.checkout_date
    }
  })
}

const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    paid: 'primary',
    checked_in: 'success',
    checked_out: 'default',
    cancelled: 'danger'
  }
  return types[status] || 'default'
}

const getStatusLabel = (status) => {
  const labels = {
    pending: '待支付',
    paid: '已支付',
    checked_in: '已签到',
    checked_out: '已离店',
    cancelled: '已取消'
  }
  return labels[status] || '未知'
}

const getNights = (item) => {
  const start = new Date(item.checkin_date)
  const end = new Date(item.checkout_date)
  const diff = end.getTime() - start.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
</script>

<style scoped>
.order-list {
  padding: 8px;
}

.order-card {
  background: #fff;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #ebedf0;
}

.order-no {
  font-size: 12px;
  color: #969799;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid #ebedf0;
}

.total-price {
  font-size: 14px;
  color: #646566;
}

.price {
  font-size: 18px;
  font-weight: 600;
  color: #ee0a24;
}
</style>
