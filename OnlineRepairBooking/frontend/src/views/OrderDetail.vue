<template>
  <div class="order-detail page-container">
    <van-nav-bar title="订单详情" left-arrow @click-left="onBack" />

    <div v-if="order" class="page-content">
      <div class="status-card card">
        <div class="status-header">
          <div class="status-icon">
            <van-icon :name="getStatusIcon(order.status)" size="32" :color="getStatusColor(order.status)" />
          </div>
          <div class="status-info">
            <h3 class="status-title" :style="{ color: getStatusColor(order.status) }">
              {{ getStatusText(order.status) }}
            </h3>
            <p class="status-desc text-muted mt-4">{{ getStatusDesc(order.status) }}</p>
          </div>
        </div>

        <van-steps :active="getStepIndex(order.status)" active-color="#1989fa" class="mt-16">
          <van-step>已下单</van-step>
          <van-step>已接单</van-step>
          <van-step>服务中</van-step>
          <van-step>已完成</van-step>
        </van-steps>
      </div>

      <div class="card mt-12">
        <h4 class="section-title mb-12">服务信息</h4>
        <div class="service-item flex">
          <van-image
            :src="order.serviceImage || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'"
            width="80"
            height="80"
            radius="8"
          />
          <div class="flex-1 ml-12">
            <h5 class="service-name">{{ order.serviceName }}</h5>
            <p class="service-desc text-muted mt-4">{{ order.serviceDescription || '' }}</p>
            <div class="service-price flex-between mt-8">
              <span class="price">¥{{ order.servicePrice || order.totalAmount }}</span>
              <span class="text-muted">x{{ order.quantity }}</span>
            </div>
          </div>
        </div>
        <div v-if="order.remark" class="remark mt-12">
          <span class="text-muted">备注: </span>
          <span>{{ order.remark }}</span>
        </div>
      </div>

      <div v-if="order.workerName" class="card mt-12">
        <h4 class="section-title mb-12">服务人员</h4>
        <div class="worker-item flex">
          <van-image
            :src="order.workerAvatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'"
            width="50"
            height="50"
            radius="25"
          />
          <div class="flex-1 ml-12">
            <h5 class="worker-name">{{ order.workerName }}</h5>
            <p class="worker-skill text-muted mt-4">{{ order.workerSkill || '专业技师' }}</p>
          </div>
          <van-button size="small" type="default" @click="contactWorker">联系师傅</van-button>
        </div>
      </div>

      <div class="card mt-12">
        <h4 class="section-title mb-12">服务地址</h4>
        <div class="address-item">
          <p class="address-contact">
            <span>{{ order.addressName }}</span>
            <span class="ml-12">{{ order.addressPhone }}</span>
          </p>
          <p class="address-detail text-muted mt-4">
            {{ order.addressProvince }}{{ order.addressCity }}{{ order.addressDistrict }}{{ order.addressDetail }}
          </p>
        </div>
      </div>

      <div class="card mt-12">
        <h4 class="section-title mb-12">预约时间</h4>
        <p class="appointment-time">{{ order.appointmentDate }} {{ order.appointmentTime }}</p>
      </div>

      <div class="card mt-12">
        <h4 class="section-title mb-12">费用明细</h4>
        <div class="price-item flex-between">
          <span class="text-muted">服务费用</span>
          <span>¥{{ order.servicePrice || order.totalAmount }} x {{ order.quantity }}</span>
        </div>
        <div class="price-item flex-between mt-8">
          <span class="text-muted">上门费</span>
          <span>¥{{ order.visitFee || '0.00' }}</span>
        </div>
        <div class="price-item flex-between mt-8" v-if="order.discountAmount && order.discountAmount > 0">
          <span class="text-muted">优惠</span>
          <span class="text-success">-¥{{ order.discountAmount }}</span>
        </div>
        <div class="price-total flex-between mt-12 pt-12" style="border-top: 1px solid #ebedf0;">
          <span>合计</span>
          <span class="price">¥{{ order.totalAmount }}</span>
        </div>
      </div>

      <div class="card mt-12">
        <h4 class="section-title mb-12">订单信息</h4>
        <div class="order-info-item flex-between">
          <span class="text-muted">订单编号</span>
          <span>{{ order.orderNo }}</span>
        </div>
        <div class="order-info-item flex-between mt-8">
          <span class="text-muted">创建时间</span>
          <span>{{ order.createTime }}</span>
        </div>
        <div class="order-info-item flex-between mt-8" v-if="order.payTime">
          <span class="text-muted">支付时间</span>
          <span>{{ order.payTime }}</span>
        </div>
      </div>

      <div v-if="order.logs && order.logs.length > 0" class="card mt-12">
        <h4 class="section-title mb-12">订单日志</h4>
        <div v-for="log in order.logs" :key="log.id" class="log-item">
          <div class="log-dot"></div>
          <div class="log-content">
            <p class="log-text">{{ log.description }}</p>
            <p class="log-time text-muted mt-4">{{ log.createTime }}</p>
          </div>
        </div>
      </div>

      <div style="height: 80px;"></div>
    </div>

    <div v-if="order" class="action-bar">
      <template v-if="order.status === 'pending'">
        <van-button block type="default" @click="cancelOrder">取消订单</van-button>
        <van-button block type="primary" class="ml-8" @click="goToPay">去支付</van-button>
      </template>
      <template v-else-if="order.status === 'accepted'">
        <van-button block type="default" @click="contactWorker">联系师傅</van-button>
        <van-button block type="primary" class="ml-8" @click="startService">开始服务</van-button>
      </template>
      <template v-else-if="order.status === 'in_service'">
        <van-button block type="default" @click="contactWorker">联系师傅</van-button>
        <van-button block type="primary" class="ml-8" @click="completeService">完成服务</van-button>
      </template>
      <template v-else-if="order.status === 'to_review'">
        <van-button block type="default" @click="goToDetail">查看详情</van-button>
        <van-button block type="primary" class="ml-8" @click="goToReview">去评价</van-button>
      </template>
      <template v-else-if="order.status === 'completed'">
        <van-button block type="default" @click="rebook">再次预约</van-button>
      </template>
    </div>

    <van-loading v-if="loading" class="loading" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'
import { getOrderDetail, cancelOrder as cancelOrderApi, startService as startServiceApi, completeService as completeServiceApi } from '@/api/order'
import { createPayment } from '@/api/payment'
import { useOrderStore } from '@/stores/order'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()

const orderId = computed(() => route.params.id)
const order = ref(null)
const loading = ref(false)

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

const getStatusDesc = (status) => {
  const map = {
    pending: '请尽快完成支付',
    accepted: '师傅已接单，正在前往服务地址',
    in_service: '师傅正在为您服务',
    to_review: '服务已完成，请对服务进行评价',
    completed: '感谢您的信任，期待再次为您服务',
    cancelled: '订单已取消'
  }
  return map[status] || ''
}

const getStatusIcon = (status) => {
  const map = {
    pending: 'clock-o',
    accepted: 'passed',
    in_service: 'service-o',
    to_review: 'comment-o',
    completed: 'checked',
    cancelled: 'close'
  }
  return map[status] || 'info-o'
}

const getStatusColor = (status) => {
  const map = {
    pending: '#ff976a',
    accepted: '#1989fa',
    in_service: '#1989fa',
    to_review: '#ff976a',
    completed: '#07c160',
    cancelled: '#969799'
  }
  return map[status] || '#1989fa'
}

const getStepIndex = (status) => {
  const map = {
    pending: 0,
    accepted: 1,
    in_service: 2,
    to_review: 3,
    completed: 3,
    cancelled: 0
  }
  return map[status] || 0
}

const onBack = () => {
  router.back()
}

const fetchOrderDetail = async () => {
  loading.value = true
  try {
    const res = await orderStore.fetchOrderDetail(orderId.value)
    order.value = res
  } catch (e) {
    showToast('获取订单详情失败')
  } finally {
    loading.value = false
  }
}

const cancelOrder = async () => {
  try {
    await showDialog({
      title: '提示',
      message: '确定要取消该订单吗？'
    })
    
    await cancelOrderApi(orderId.value, '用户取消')
    showToast('订单已取消')
    order.value.status = 'cancelled'
    orderStore.updateOrderStatus(orderId.value, 'cancelled')
  } catch (e) {
    if (e !== 'cancel') {
      console.error('取消订单失败', e)
    }
  }
}

const goToPay = async () => {
  try {
    const payment = await createPayment(orderId.value, 'wechat')
    if (payment) {
      showToast('支付成功')
      order.value.status = 'accepted'
      order.value.payTime = new Date().toLocaleString()
      orderStore.updateOrderStatus(orderId.value, 'accepted')
      fetchOrderDetail()
    }
  } catch (e) {
    console.error('支付失败', e)
  }
}

const contactWorker = () => {
  showToast(`联系电话: ${order.value.workerPhone || '暂无'}`)
}

const startService = async () => {
  try {
    await showDialog({
      title: '提示',
      message: '确定开始服务吗？'
    })
    
    await startServiceApi(orderId.value)
    showToast('服务已开始')
    order.value.status = 'in_service'
    orderStore.updateOrderStatus(orderId.value, 'in_service')
  } catch (e) {
    if (e !== 'cancel') {
      console.error('开始服务失败', e)
    }
  }
}

const completeService = async () => {
  try {
    await showDialog({
      title: '提示',
      message: '确定完成服务吗？'
    })
    
    await completeServiceApi(orderId.value, {})
    showToast('服务已完成')
    order.value.status = 'to_review'
    orderStore.updateOrderStatus(orderId.value, 'to_review')
  } catch (e) {
    if (e !== 'cancel') {
      console.error('完成服务失败', e)
    }
  }
}

const goToReview = () => {
  router.push(`/review/${orderId.value}`)
}

const goToDetail = () => {
  fetchOrderDetail()
}

const rebook = () => {
  router.push(`/service/${order.value.serviceId}`)
}

onMounted(() => {
  fetchOrderDetail()
})
</script>

<style lang="scss" scoped>
.loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.status-card {
  .status-header {
    display: flex;
    align-items: center;

    .status-icon {
      width: 60px;
      height: 60px;
      background: #f7f8fa;
      border-radius: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .status-info {
      flex: 1;
      margin-left: 16px;

      .status-title {
        font-size: 18px;
        font-weight: bold;
      }

      .status-desc {
        font-size: 13px;
      }
    }
  }
}

.section-title {
  font-size: 15px;
  font-weight: bold;
  color: #323233;
}

.service-item {
  .service-name {
    font-size: 15px;
    font-weight: 500;
    color: #323233;
  }

  .service-desc {
    font-size: 12px;
  }

  .service-price {
    font-size: 14px;
  }
}

.remark {
  font-size: 13px;
  color: #646566;
  padding-top: 8px;
  border-top: 1px solid #ebedf0;
}

.worker-item {
  align-items: center;

  .worker-name {
    font-size: 15px;
    font-weight: 500;
    color: #323233;
  }

  .worker-skill {
    font-size: 12px;
  }
}

.address-item {
  .address-contact {
    font-size: 14px;
    font-weight: 500;
    color: #323233;
  }

  .address-detail {
    font-size: 13px;
  }
}

.appointment-time {
  font-size: 14px;
  color: #323233;
}

.price-item {
  font-size: 14px;
  color: #323233;
}

.price-total {
  font-size: 16px;
  font-weight: bold;
}

.order-info-item {
  font-size: 13px;
  color: #323233;
}

.log-item {
  display: flex;
  padding-bottom: 16px;
  position: relative;

  &:last-child {
    padding-bottom: 0;
  }

  .log-dot {
    width: 10px;
    height: 10px;
    background: #1989fa;
    border-radius: 50%;
    margin-top: 6px;
    margin-right: 12px;
    flex-shrink: 0;
  }

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    left: 4px;
    top: 20px;
    bottom: 0;
    width: 2px;
    background: #ebedf0;
  }

  .log-content {
    flex: 1;

    .log-text {
      font-size: 14px;
      color: #323233;
    }

    .log-time {
      font-size: 12px;
    }
  }
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  padding: 12px;
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);

  :deep(.van-button) {
    flex: 1;
  }
}

.ml-8 {
  margin-left: 8px;
}

.ml-12 {
  margin-left: 12px;
}

.mt-4 {
  margin-top: 4px;
}

.mt-8 {
  margin-top: 8px;
}

.mt-12 {
  margin-top: 12px;
}

.mt-16 {
  margin-top: 16px;
}

.pt-12 {
  padding-top: 12px;
}
</style>
