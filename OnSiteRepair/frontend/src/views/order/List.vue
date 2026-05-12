<template>
  <div class="page-container">
    <van-nav-bar title="我的订单" left-text="返回" @click-left="onClickLeft" />
    
    <van-tabs v-model:active="activeTab" @change="onChangeTab">
      <van-tab title="全部" name="null" />
      <van-tab title="待接单" name="0" />
      <van-tab title="进行中" name="1,2" />
      <van-tab title="待确认" name="3" />
      <van-tab title="待支付" name="4" />
      <van-tab title="已完成" name="5" />
    </van-tabs>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-cell-group v-for="order in orders" :key="order.id" class="order-card">
          <van-cell
            :title="order.category + ' - ' + order.faultType"
            :value="getStatusText(order.status)"
            is-link
            @click="goDetail(order.id)"
          >
            <template #label>
              <div class="order-info">
                <van-icon name="location-o" />
                <span>{{ order.address }}</span>
              </div>
              <div class="order-info">
                <van-icon name="clock-o" />
                <span>{{ order.createTime }}</span>
              </div>
              <div v-if="order.totalAmount > 0" class="order-info amount">
                <span>¥ {{ order.totalAmount }}</span>
              </div>
            </template>
          </van-cell>
          
          <div class="order-actions">
            <van-button
              v-if="order.status === 0 && userStore.userType === 1"
              size="small"
              type="danger"
              plain
              @click="cancelOrder(order)"
            >
              取消订单
            </van-button>
            
            <van-button
              v-if="order.status === 1 && userStore.userType === 2"
              size="small"
              type="primary"
              @click="startService(order)"
            >
              开始服务
            </van-button>
            
            <van-button
              v-if="order.status === 2 && userStore.userType === 2"
              size="small"
              type="primary"
              @click="goNavigate(order)"
            >
              导航
            </van-button>
            
            <van-button
              v-if="order.status === 2 && userStore.userType === 2"
              size="small"
              type="success"
              @click="addParts(order)"
            >
              添加配件
            </van-button>
            
            <van-button
              v-if="order.status === 3 && userStore.userType === 1"
              size="small"
              type="primary"
              @click="confirmPrice(order)"
            >
              确认价格
            </van-button>
            
            <van-button
              v-if="order.status === 4 && userStore.userType === 1"
              size="small"
              type="danger"
              @click="payOrder(order)"
            >
              立即支付
            </van-button>
            
            <van-button
              v-if="order.status === 5 && userStore.userType === 1 && !order.reviewed"
              size="small"
              type="warning"
              @click="goReview(order)"
            >
              去评价
            </van-button>
          </div>
        </van-cell-group>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { getUserOrders, getWorkerOrders, cancelOrder as cancelOrderApi, payOrder as payOrderApi } from '@/api/order'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('null')
const orders = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

const statusMap = {
  0: '待接单',
  1: '已接单',
  2: '服务中',
  3: '待确认',
  4: '待支付',
  5: '已完成',
  6: '已取消',
  7: '已关闭'
}

const getStatusText = (status) => statusMap[status] || '未知'

const onClickLeft = () => {
  router.back()
}

const goDetail = (id) => {
  router.push(`/order/${id}`)
}

const loadOrders = async () => {
  try {
    const status = activeTab.value === 'null' ? null : activeTab.value
    const api = userStore.userType === 1 ? getUserOrders : getWorkerOrders
    const data = await api(status)
    orders.value = data || []
    finished.value = true
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const onRefresh = () => {
  refreshing.value = true
  finished.value = false
  loadOrders().then(() => {
    refreshing.value = false
  })
}

const onLoad = () => {
  loadOrders()
}

const onChangeTab = () => {
  finished.value = false
  orders.value = []
  loadOrders()
}

const cancelOrder = async (order) => {
  try {
    await showConfirmDialog({
      title: '确认取消',
      message: '确定要取消该订单吗？'
    })
    await cancelOrderApi(order.id, '用户取消')
    showToast('取消成功')
    onRefresh()
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e)
    }
  }
}

const startService = async (order) => {
  router.push(`/map/navigate/${order.id}`)
}

const goNavigate = (order) => {
  router.push(`/map/navigate/${order.id}`)
}

const addParts = (order) => {
  router.push({ path: '/order/' + order.id, query: { showParts: 'true' } })
}

const confirmPrice = (order) => {
  router.push('/order/' + order.id)
}

const payOrder = async (order) => {
  try {
    await showConfirmDialog({
      title: '确认支付',
      message: `确认支付 ¥${order.totalAmount}？`
    })
    await payOrderApi(order.id)
    showToast('支付成功')
    onRefresh()
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e)
    }
  }
}

const goReview = (order) => {
  router.push(`/review/${order.id}`)
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.order-card {
  margin: 10px;
  border-radius: 8px;
}

.order-info {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #969799;
  margin-top: 5px;
}

.order-info.amount {
  color: #ff6034;
  font-size: 14px;
  font-weight: bold;
}

.order-actions {
  padding: 10px 15px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
</style>
