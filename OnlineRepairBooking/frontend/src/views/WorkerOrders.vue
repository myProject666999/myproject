<template>
  <div class="worker-orders">
    <van-nav-bar
      title="订单管理"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
      fixed
      placeholder
    />
    
    <van-tabs v-model:active="activeTab" sticky offset-top="46px" line-width="40px">
      <van-tab title="待抢订单" name="pending_grab">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <van-list
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="onLoadPending"
          >
            <van-empty v-if="pendingOrders.length === 0 && !loading" description="暂无待抢订单" />
            <div
              v-for="order in pendingOrders"
              :key="order.id"
              class="order-card"
            >
              <div class="order-header">
                <span class="order-id">订单号: {{ order.orderNo }}</span>
                <van-tag type="warning">待接单</van-tag>
              </div>
              <div class="order-content">
                <div class="service-name">{{ order.serviceName }}</div>
                <div class="order-info">
                  <van-icon name="location-o" />
                  <span>{{ order.address }}</span>
                </div>
                <div class="order-info">
                  <van-icon name="clock-o" />
                  <span>{{ order.appointmentTime }}</span>
                </div>
                <div class="order-price">
                  <span>预估金额</span>
                  <span class="price">¥{{ order.price }}</span>
                </div>
              </div>
              <div class="order-footer">
                <van-button type="primary" size="small" @click="handleGrabOrder(order.id)">
                  立即抢单
                </van-button>
              </div>
            </div>
          </van-list>
        </van-pull-refresh>
      </van-tab>
      
      <van-tab title="我的订单" name="my_orders">
        <van-pull-refresh v-model="myRefreshing" @refresh="onMyRefresh">
          <van-list
            v-model:loading="myLoading"
            :finished="myFinished"
            finished-text="没有更多了"
            @load="onLoadMyOrders"
          >
            <van-empty v-if="myOrders.length === 0 && !myLoading" description="暂无订单" />
            <div
              v-for="order in myOrders"
              :key="order.id"
              class="order-card"
            >
              <div class="order-header">
                <span class="order-id">订单号: {{ order.orderNo }}</span>
                <van-tag :type="getStatusType(order.status)">{{ getStatusText(order.status) }}</van-tag>
              </div>
              <div class="order-content">
                <div class="service-name">{{ order.serviceName }}</div>
                <div class="order-info">
                  <van-icon name="location-o" />
                  <span>{{ order.address }}</span>
                </div>
                <div class="order-info">
                  <van-icon name="clock-o" />
                  <span>{{ order.appointmentTime }}</span>
                </div>
                <div class="order-price">
                  <span>金额</span>
                  <span class="price">¥{{ order.price }}</span>
                </div>
              </div>
              <div class="order-footer" v-if="order.status === 'pending_accept'">
                <van-button type="primary" size="small" @click="handleAccept(order.id)">
                  确认接单
                </van-button>
              </div>
              <div class="order-footer" v-else-if="order.status === 'accepted'">
                <van-button type="primary" size="small" @click="handleStart(order.id)">
                  开始服务
                </van-button>
              </div>
              <div class="order-footer" v-else-if="order.status === 'servicing'">
                <van-button type="primary" size="small" @click="handleComplete(order.id)">
                  完成服务
                </van-button>
              </div>
            </div>
          </van-list>
        </van-pull-refresh>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showNotify } from 'vant'
import { getPendingOrders, getWorkerOrders, grabOrder, acceptOrder, startService, completeService } from '@/api/order'

const route = useRoute()
const router = useRouter()

const activeTab = ref(route.query.tab || 'pending_grab')

const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)
const pendingOrders = ref([])
let pendingPage = 1

const myRefreshing = ref(false)
const myLoading = ref(false)
const myFinished = ref(false)
const myOrders = ref([])
let myPage = 1

const mockPendingOrders = [
  { id: 1, orderNo: '202401150001', serviceName: '空调维修', address: '北京市朝阳区建国路88号', appointmentTime: '今天 14:00', price: 199 },
  { id: 2, orderNo: '202401150002', serviceName: '水电维修', address: '北京市海淀区中关村大街1号', appointmentTime: '今天 16:00', price: 129 },
  { id: 3, orderNo: '202401150003', serviceName: '家具安装', address: '北京市西城区金融街15号', appointmentTime: '明天 10:00', price: 299 }
]

const mockMyOrders = [
  { id: 101, orderNo: '202401150101', serviceName: '洗衣机维修', address: '北京市朝阳区望京SOHO', appointmentTime: '今天 09:00', price: 259, status: 'pending_accept' },
  { id: 102, orderNo: '202401150102', serviceName: '管道疏通', address: '北京市东城区王府井大街', appointmentTime: '今天 11:00', price: 159, status: 'accepted' },
  { id: 103, orderNo: '202401150103', serviceName: '灯具安装', address: '北京市丰台区丽泽商务区', appointmentTime: '昨天 15:00', price: 189, status: 'servicing' },
  { id: 104, orderNo: '202401150104', serviceName: '电路维修', address: '北京市通州区新华大街', appointmentTime: '1月10日', price: 229, status: 'completed' }
]

const onClickLeft = () => {
  router.back()
}

const getStatusText = (status) => {
  const statusMap = {
    pending_accept: '待确认',
    accepted: '已接单',
    servicing: '服务中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

const getStatusType = (status) => {
  const typeMap = {
    pending_accept: 'warning',
    accepted: 'primary',
    servicing: 'success',
    completed: 'info',
    cancelled: 'danger'
  }
  return typeMap[status] || 'default'
}

const onRefresh = () => {
  pendingPage = 1
  finished.value = false
  loadPendingOrders(true)
}

const onLoadPending = () => {
  loadPendingOrders(false)
}

const loadPendingOrders = async (isRefresh = false) => {
  try {
    const res = await getPendingOrders({ page: pendingPage, pageSize: 10 })
    if (isRefresh) {
      pendingOrders.value = res?.list || mockPendingOrders
      refreshing.value = false
    } else {
      pendingOrders.value = [...pendingOrders.value, ...(res?.list || [])]
    }
    pendingPage++
    if (!res || res.list.length < 10) {
      finished.value = true
    }
  } catch (e) {
    if (isRefresh) {
      pendingOrders.value = mockPendingOrders
      refreshing.value = false
    }
    finished.value = true
  } finally {
    loading.value = false
  }
}

const onMyRefresh = () => {
  myPage = 1
  myFinished.value = false
  loadMyOrders(true)
}

const onLoadMyOrders = () => {
  loadMyOrders(false)
}

const loadMyOrders = async (isRefresh = false) => {
  try {
    const res = await getWorkerOrders({ page: myPage, pageSize: 10 })
    if (isRefresh) {
      myOrders.value = res?.list || mockMyOrders
      myRefreshing.value = false
    } else {
      myOrders.value = [...myOrders.value, ...(res?.list || [])]
    }
    myPage++
    if (!res || res.list.length < 10) {
      myFinished.value = true
    }
  } catch (e) {
    if (isRefresh) {
      myOrders.value = mockMyOrders
      myRefreshing.value = false
    }
    myFinished.value = true
  } finally {
    myLoading.value = false
  }
}

const handleGrabOrder = async (orderId) => {
  try {
    await grabOrder(orderId)
    showNotify({ type: 'success', message: '抢单成功' })
    pendingOrders.value = pendingOrders.value.filter(o => o.id !== orderId)
  } catch (e) {
    showToast('抢单失败，请重试')
  }
}

const handleAccept = async (orderId) => {
  try {
    await acceptOrder(orderId)
    showNotify({ type: 'success', message: '接单成功' })
    const order = myOrders.value.find(o => o.id === orderId)
    if (order) order.status = 'accepted'
  } catch (e) {
    showToast('操作失败')
  }
}

const handleStart = async (orderId) => {
  try {
    await startService(orderId)
    showNotify({ type: 'success', message: '已开始服务' })
    const order = myOrders.value.find(o => o.id === orderId)
    if (order) order.status = 'servicing'
  } catch (e) {
    showToast('操作失败')
  }
}

const handleComplete = async (orderId) => {
  try {
    await completeService(orderId, { actualPrice: 0 })
    showNotify({ type: 'success', message: '服务已完成' })
    const order = myOrders.value.find(o => o.id === orderId)
    if (order) order.status = 'completed'
  } catch (e) {
    showToast('操作失败')
  }
}

watch(() => route.query.tab, (newTab) => {
  if (newTab) {
    activeTab.value = newTab
  }
})

onMounted(() => {
  if (activeTab.value === 'pending_grab') {
    loadPendingOrders(true)
  } else {
    loadMyOrders(true)
  }
})
</script>

<style lang="scss" scoped>
.worker-orders {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.order-card {
  background-color: #fff;
  margin: 12px;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebedf0;
}

.order-id {
  font-size: 13px;
  color: #969799;
}

.order-content {
  margin-bottom: 12px;
}

.service-name {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 8px;
}

.order-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #646566;
  margin-bottom: 6px;
  
  .van-icon {
    color: #969799;
  }
}

.order-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #ebedf0;
  font-size: 13px;
  color: #646566;
  
  .price {
    font-size: 18px;
    font-weight: 600;
    color: #ff6034;
  }
}

.order-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid #ebedf0;
}
</style>
