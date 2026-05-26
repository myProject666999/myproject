<template>
  <div class="order-list page-container">
    <van-nav-bar title="我的订单" left-arrow @click-left="onBack" />

    <van-tabs v-model:active="activeTab" sticky offset-top="46" @change="onTabChange">
      <van-tab v-for="tab in tabs" :key="tab.value" :title="tab.label" :name="tab.value" />
    </van-tabs>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
        class="order-list-content"
      >
        <div
          v-for="order in orders"
          :key="order.id"
          class="order-card card"
          @click="goToDetail(order.id)"
        >
          <div class="order-header flex-between">
            <span class="order-no">订单号: {{ order.orderNo }}</span>
            <van-tag :type="getStatusTagType(order.status)">{{ getStatusText(order.status) }}</van-tag>
          </div>

          <div class="order-service flex mt-12">
            <van-image
              :src="order.serviceImage || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'"
              width="80"
              height="80"
              radius="8"
            />
            <div class="service-info flex-1 ml-12">
              <h4 class="service-name">{{ order.serviceName }}</h4>
              <p class="service-worker text-muted mt-4">服务人员: {{ order.workerName }}</p>
              <p class="service-time text-muted mt-4">{{ order.appointmentDate }} {{ order.appointmentTime }}</p>
            </div>
            <div class="service-price text-right">
              <span class="price">¥{{ order.totalAmount }}</span>
              <p class="text-muted mt-4">x{{ order.quantity }}</p>
            </div>
          </div>

          <div class="order-actions flex-end mt-12" @click.stop>
            <template v-if="order.status === 'pending'">
              <van-button size="small" type="default" @click="cancelOrder(order.id)">取消订单</van-button>
              <van-button size="small" type="primary" class="ml-8" @click="goToPay(order.id)">去支付</van-button>
            </template>
            <template v-else-if="order.status === 'accepted' || order.status === 'in_service'">
              <van-button size="small" type="default" @click="contactWorker(order)">联系师傅</van-button>
            </template>
            <template v-else-if="order.status === 'to_review'">
              <van-button size="small" type="primary" @click="goToReview(order.id)">去评价</van-button>
            </template>
            <template v-else-if="order.status === 'completed'">
              <van-button size="small" type="default" @click="goToDetail(order.id)">查看详情</van-button>
              <van-button size="small" type="primary" class="ml-8" @click="rebook(order)">再次预约</van-button>
            </template>
          </div>
        </div>

        <van-empty v-if="orders.length === 0 && !loading" description="暂无订单" />
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showDialog } from 'vant'
import { getOrderList, cancelOrder as cancelOrderApi } from '@/api/order'
import { createPayment } from '@/api/payment'
import { useOrderStore } from '@/stores/order'

const router = useRouter()
const route = useRoute()
const orderStore = useOrderStore()

const tabs = [
  { label: '全部', value: 'all' },
  { label: '待支付', value: 'pending' },
  { label: '已接单', value: 'accepted' },
  { label: '服务中', value: 'in_service' },
  { label: '待评价', value: 'to_review' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' }
]

const activeTab = ref(route.query.status || 'all')
const orders = ref([])
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const page = ref(1)
const pageSize = 10

const getStatusText = (status) => {
  const map = {
    pending: '待支付',
    accepted: '已接单',
    in_service: '服务中',
    to_review: '待评价',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || status
}

const getStatusTagType = (status) => {
  const map = {
    pending: 'warning',
    accepted: 'primary',
    in_service: 'primary',
    to_review: 'warning',
    completed: 'success',
    cancelled: 'default'
  }
  return map[status] || 'default'
}

const onBack = () => {
  router.back()
}

const onTabChange = () => {
  page.value = 1
  orders.value = []
  finished.value = false
  fetchOrders()
}

const onRefresh = () => {
  page.value = 1
  orders.value = []
  finished.value = false
  fetchOrders().finally(() => {
    refreshing.value = false
  })
}

const onLoad = () => {
  fetchOrders()
}

const fetchOrders = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value
    }
    if (activeTab.value !== 'all') {
      params.status = activeTab.value
    }

    const res = await getOrderList(params)
    const list = res.list || res.orders || []
    
    if (page.value === 1) {
      orders.value = list
    } else {
      orders.value.push(...list)
    }

    if (list.length < pageSize.value) {
      finished.value = true
    } else {
      page.value++
    }
  } catch (e) {
    showToast('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

const goToDetail = (id) => {
  router.push(`/order/${id}`)
}

const cancelOrder = async (id) => {
  try {
    await showDialog({
      title: '提示',
      message: '确定要取消该订单吗？'
    })
    
    await cancelOrderApi(id, '用户取消')
    showToast('订单已取消')
    
    const index = orders.value.findIndex(o => o.id === id)
    if (index !== -1) {
      orders.value[index].status = 'cancelled'
    }
  } catch (e) {
    if (e !== 'cancel') {
      console.error('取消订单失败', e)
    }
  }
}

const goToPay = async (id) => {
  try {
    const payment = await createPayment(id, 'wechat')
    if (payment) {
      showToast('支付成功')
      const index = orders.value.findIndex(o => o.id === id)
      if (index !== -1) {
        orders.value[index].status = 'accepted'
      }
    }
  } catch (e) {
    console.error('支付失败', e)
  }
}

const contactWorker = (order) => {
  showToast(`联系电话: ${order.workerPhone || '暂无'}`)
}

const goToReview = (id) => {
  router.push(`/review/${id}`)
}

const rebook = (order) => {
  router.push(`/service/${order.serviceId}`)
}

onMounted(() => {
  fetchOrders()
})
</script>

<style lang="scss" scoped>
.order-list-content {
  padding: 12px;
}

.order-card {
  padding: 12px;

  .order-header {
    font-size: 12px;
    color: #969799;
  }

  .order-no {
    color: #646566;
  }

  .service-info {
    .service-name {
      font-size: 15px;
      font-weight: 500;
      color: #323233;
    }

    .service-worker,
    .service-time {
      font-size: 12px;
    }
  }

  .service-price {
    .price {
      font-size: 16px;
    }
  }

  .order-actions {
    padding-top: 12px;
    border-top: 1px solid #ebedf0;
  }
}

.ml-8 {
  margin-left: 8px;
}

.ml-12 {
  margin-left: 12px;
}

.flex-end {
  display: flex;
  justify-content: flex-end;
}
</style>
