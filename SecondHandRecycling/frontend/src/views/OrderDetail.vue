<template>
  <div class="page-container">
    <van-nav-bar title="订单详情" left-arrow @click-left="router.back()" fixed placeholder />

    <div class="content-wrapper" v-if="order">
      <div class="status-card" :style="{ background: statusBg }">
        <van-icon :name="statusIcon" size="40" color="white" />
        <div class="status-info">
          <div class="status-text">{{ statusInfo.text }}</div>
          <div class="status-time">{{ order.appointmentTime }}</div>
        </div>
      </div>

      <van-cell-group inset title="订单信息">
        <van-cell title="订单号" :value="order.orderNo" />
        <van-cell title="品类" :value="category?.name" />
        <van-cell title="预估数量" :value="order.quantity" />
        <van-cell title="预估价格">
          <template #value>
            <span class="price">¥{{ order.estimatedPrice }}</span>
          </template>
        </van-cell>
        <van-cell title="最终价格" v-if="order.finalPrice">
          <template #value>
            <span class="price final">¥{{ order.finalPrice }}</span>
          </template>
        </van-cell>
        <van-cell title="物品描述" :value="order.description || '无'" />
      </van-cell-group>

      <van-cell-group inset title="预约地址" v-if="address">
        <van-cell>
          <template #default>
            <div class="address-info">
              <div class="address-name">{{ address.name }} {{ address.phone }}</div>
              <div class="address-detail">
                {{ address.province }}{{ address.city }}{{ address.district }}{{ address.detailAddress }}
              </div>
            </div>
          </template>
        </van-cell>
      </van-cell-group>

      <div class="button-group" v-if="order.status === 'PENDING'">
        <van-button type="danger" block round @click="cancelOrder">
          取消订单
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { orderApi, categoryApi, addressApi } from '@/api'

const route = useRoute()
const router = useRouter()

const order = ref(null)
const category = ref(null)
const address = ref(null)

const statusMap = {
  PENDING: { text: '等待回收员接单', icon: 'clock-o', bg: 'linear-gradient(135deg, #ff976a 0%, #ff6034 100%)' },
  ACCEPTED: { text: '回收员已接单', icon: 'checked', bg: 'linear-gradient(135deg, #07c160 0%, #69d17c 100%)' },
  ONWAY: { text: '回收员上门中', icon: 'location-o', bg: 'linear-gradient(135deg, #1989fa 0%, #5fb7ff 100%)' },
  NEGOTIATING: { text: '议价中', icon: 'balance-o', bg: 'linear-gradient(135deg, #ff976a 0%, #ff6034 100%)' },
  COMPLETED: { text: '订单已完成', icon: 'success', bg: 'linear-gradient(135deg, #07c160 0%, #69d17c 100%)' },
  CANCELLED: { text: '订单已取消', icon: 'close', bg: 'linear-gradient(135deg, #969799 0%, #c8c9cc 100%)' }
}

const statusInfo = computed(() => {
  return statusMap[order.value?.status] || statusMap.PENDING
})

const statusBg = computed(() => statusInfo.value.bg)
const statusIcon = computed(() => statusInfo.value.icon)

const loadDetail = async () => {
  try {
    const res = await orderApi.detail(route.params.id)
    order.value = res.data
    
    if (order.value.categoryId) {
      const catRes = await categoryApi.getById(order.value.categoryId)
      category.value = catRes.data
    }
    
    if (order.value.addressId) {
      const addrRes = await addressApi.list()
      address.value = addrRes.data?.find(a => a.id === order.value.addressId)
    }
  } catch (e) {
    showToast('加载失败')
  }
}

const cancelOrder = async () => {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确定要取消此订单吗？'
    })
    await orderApi.cancel(order.value.id, '用户取消')
    showToast('取消成功')
    router.back()
  } catch {}
}

onMounted(() => {
  loadDetail()
})
</script>

<style lang="less" scoped>
.status-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 16px;
  color: white;
  
  .status-text {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  .status-time {
    font-size: 13px;
    opacity: 0.9;
  }
}

.price {
  color: #07c160;
  font-weight: 600;
  
  &.final {
    color: #ff6034;
  }
}

.address-info {
  .address-name {
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  .address-detail {
    font-size: 13px;
    color: #969799;
  }
}

.button-group {
  padding: 24px 0;
}
</style>
