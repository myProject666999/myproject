<template>
  <div class="order-detail-page">
    <div class="page-header">
      <el-button :icon="ArrowLeft" text @click="goBack">
        返回
      </el-button>
      <h2 class="page-title">订单详情</h2>
      <div></div>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <div v-else-if="order" class="order-content">
      <el-card class="status-card" shadow="never">
        <div class="status-header">
          <el-tag :type="getStatusType(order.status)" size="large" effect="light">
            {{ OrderStatusText[order.status] }}
          </el-tag>
          <span class="order-no">订单号：{{ order.id }}</span>
        </div>

        <el-steps :active="order.status" finish-status="success" class="status-timeline">
          <el-step title="待确认" icon="Clock" />
          <el-step title="已确认" icon="CircleCheck" />
          <el-step title="已出发" icon="Van" />
          <el-step title="已完成" icon="SuccessFilled" />
        </el-steps>
      </el-card>

      <el-card class="route-card" shadow="never">
        <div class="route-info">
          <div class="route-point">
            <span class="dot departure-dot"></span>
            <div class="point-content">
              <span class="address">{{ order.pickup_address }}</span>
              <span class="time" v-if="order.ride">出发：{{ formatDateTime(order.ride.departure_time) }}</span>
            </div>
          </div>
          <div class="route-line"></div>
          <div class="route-point">
            <span class="dot destination-dot"></span>
            <div class="point-content">
              <span class="address">{{ order.dropoff_address }}</span>
            </div>
          </div>
        </div>

        <div class="route-meta">
          <div class="meta-item">
            <span class="meta-label">乘客人数</span>
            <span class="meta-value">{{ order.passengers_count }}人</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">费用</span>
            <span class="meta-value price">¥{{ order.price }}</span>
          </div>
        </div>
      </el-card>

      <el-card v-if="order.status === OrderStatus.STARTED" class="map-card" shadow="never">
        <div class="card-header">
          <h3 class="card-title">实时位置</h3>
          <span class="live-badge">
            <span class="live-dot"></span>
            实时更新中
          </span>
        </div>
        <div class="map-container">
          <canvas ref="mapCanvas" width="800" height="400" class="map-canvas"></canvas>
          <div class="map-legend">
            <div class="legend-item">
              <span class="legend-dot owner"></span>
              <span>车主</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot passenger"></span>
              <span>乘客</span>
            </div>
          </div>
        </div>
        <div class="map-stats">
          <div class="stat-item">
            <el-icon :size="20" color="#4F6EF7"><Location /></el-icon>
            <div>
              <span class="stat-label">预计到达</span>
              <span class="stat-value">{{ estimatedArrival }}</span>
            </div>
          </div>
          <div class="stat-item">
            <el-icon :size="20" color="#67C23A"><Position /></el-icon>
            <div>
              <span class="stat-label">剩余距离</span>
              <span class="stat-value">{{ remainingDistance }} km</span>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="users-card" shadow="never">
        <h3 class="card-title">参与人员</h3>
        <div class="users-list">
          <div class="user-item" v-if="order.owner">
            <el-avatar :size="48" :src="order.owner.avatar">
              {{ order.owner.nickname?.charAt(0) }}
            </el-avatar>
            <div class="user-info">
              <div class="user-name">
                {{ order.owner.nickname }}
                <el-tag type="warning" size="small" effect="light">车主</el-tag>
                <el-tag v-if="order.owner.is_verified" type="success" size="small" effect="light">已认证</el-tag>
              </div>
              <div class="user-stats">
                信用分 {{ order.owner.credit_score }} · 完成 {{ order.owner.completed_rides }} 单
              </div>
            </div>
          </div>
          <div class="user-divider"></div>
          <div class="user-item" v-if="order.passenger">
            <el-avatar :size="48" :src="order.passenger.avatar">
              {{ order.passenger.nickname?.charAt(0) }}
            </el-avatar>
            <div class="user-info">
              <div class="user-name">
                {{ order.passenger.nickname }}
                <el-tag type="primary" size="small" effect="light">乘客</el-tag>
                <el-tag v-if="order.passenger.is_verified" type="success" size="small" effect="light">已认证</el-tag>
              </div>
              <div class="user-stats">
                信用分 {{ order.passenger.credit_score }} · 完成 {{ order.passenger.completed_rides }} 单
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <el-card v-if="order.status === OrderStatus.COMPLETED && !hasReviewed" class="review-card" shadow="never">
        <h3 class="card-title">评价订单</h3>
        <el-form :model="reviewForm" label-position="top">
          <el-form-item label="评分">
            <el-rate v-model="reviewForm.rating" :max="5" show-text :texts="ratingTexts" />
          </el-form-item>
          <el-form-item label="评价内容">
            <el-input
              v-model="reviewForm.content"
              type="textarea"
              :rows="4"
              placeholder="请输入您的评价..."
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="标签">
            <el-checkbox-group v-model="reviewForm.tags">
              <el-checkbox v-for="tag in availableTags" :key="tag" :label="tag" border>
                {{ tag }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="submittingReview" @click="submitReview">
              提交评价
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card v-if="order.status === OrderStatus.COMPLETED && hasReviewed" class="reviewed-card" shadow="never">
        <h3 class="card-title">我的评价</h3>
        <div class="review-content">
          <el-rate :model-value="submittedReview.rating" disabled show-text :texts="ratingTexts" />
          <p class="review-text">{{ submittedReview.content }}</p>
          <div class="review-tags" v-if="submittedReview.tags.length > 0">
            <el-tag v-for="tag in submittedReview.tags" :key="tag" size="small" effect="light">
              {{ tag }}
            </el-tag>
          </div>
        </div>
      </el-card>

      <div class="action-buttons">
        <template v-if="order.status === OrderStatus.PENDING">
          <template v-if="isOwner">
            <el-button type="danger" :loading="actionLoading" @click="handleReject">
              拒绝
            </el-button>
            <el-button type="success" :loading="actionLoading" @click="handleConfirm">
              确认
            </el-button>
          </template>
          <template v-else>
            <el-button type="danger" :loading="actionLoading" @click="handleCancel">
              取消订单
            </el-button>
          </template>
        </template>

        <template v-if="order.status === OrderStatus.CONFIRMED && isOwner">
          <el-button type="danger" :loading="actionLoading" @click="handleCancel">
            取消订单
          </el-button>
          <el-button type="primary" :loading="actionLoading" @click="handleStart">
            开始行程
          </el-button>
        </template>

        <template v-if="order.status === OrderStatus.STARTED">
          <el-button type="primary" :loading="actionLoading" @click="handleComplete">
            完成行程
          </el-button>
        </template>

        <template v-if="order.status === OrderStatus.CONFIRMED && !isOwner">
          <el-button type="danger" :loading="actionLoading" @click="handleCancel">
            取消订单
          </el-button>
        </template>
      </div>
    </div>

    <el-dialog
      v-model="cancelDialogVisible"
      title="取消订单"
      width="420px"
    >
      <el-form label-position="top">
        <el-form-item label="取消原因">
          <el-input
            v-model="cancelReason"
            type="textarea"
            :rows="3"
            placeholder="请输入取消原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelDialogVisible = false">返回</el-button>
        <el-button type="danger" :loading="actionLoading" @click="confirmCancel">
          确认取消
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  Location,
  Position
} from '@element-plus/icons-vue'
import { orderApi, locationApi, reviewApi } from '../api'
import type { Order } from '../types'
import { OrderStatus, OrderStatusText } from '../types'
import { useUserStore } from '../stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const orderId = Number(route.params.id)
const order = ref<Order | null>(null)
const loading = ref(false)
const actionLoading = ref(false)
const cancelDialogVisible = ref(false)
const cancelReason = ref('')
const mapCanvas = ref<HTMLCanvasElement | null>(null)
const locationUpdateInterval = ref<number | null>(null)
const ownerPosition = ref({ lng: 116.397, lat: 39.908 })
const passengerPosition = ref({ lng: 116.407, lat: 39.918 })
const estimatedArrival = ref('15分钟')
const remainingDistance = ref(5.2)
const hasReviewed = ref(false)
const submittingReview = ref(false)

const reviewForm = ref({
  rating: 5,
  content: '',
  tags: [] as string[]
})

const submittedReview = ref({
  rating: 5,
  content: '',
  tags: [] as string[]
})

const ratingTexts = ['极差', '失望', '一般', '满意', '惊喜']
const availableTags = ['准时', '整洁', '驾驶平稳', '热情好客', '沟通顺畅', '车况良好']

const isOwner = computed(() => {
  return userStore.user?.id === order.value?.owner_id
})

function getStatusType(status: number) {
  const typeMap: Record<number, string> = {
    1: 'warning',
    2: 'primary',
    3: 'success',
    4: 'success',
    5: 'info',
    6: 'danger'
  }
  return typeMap[status] || 'info'
}

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

async function fetchOrderDetail() {
  loading.value = true
  try {
    const res = await orderApi.getDetail(orderId)
    if (res.code === 0 && res.data) {
      order.value = res.data
    }
  } catch (error) {
    console.error('Failed to fetch order:', error)
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.back()
}

function drawMap() {
  const canvas = mapCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = canvas.width
  const height = canvas.height

  ctx.clearRect(0, 0, width, height)

  ctx.fillStyle = '#F5F7FA'
  ctx.fillRect(0, 0, width, height)

  ctx.strokeStyle = '#E4E7ED'
  ctx.lineWidth = 1
  for (let i = 0; i < width; i += 40) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, height)
    ctx.stroke()
  }
  for (let i = 0; i < height; i += 40) {
    ctx.beginPath()
    ctx.moveTo(0, i)
    ctx.lineTo(width, i)
    ctx.stroke()
  }

  const startX = 80
  const startY = height - 80
  const endX = width - 80
  const endY = 80

  ctx.beginPath()
  ctx.moveTo(startX, startY)
  ctx.bezierCurveTo(startX + 200, startY - 100, endX - 200, endY + 100, endX, endY)
  ctx.strokeStyle = '#4F6EF7'
  ctx.lineWidth = 4
  ctx.setLineDash([])
  ctx.stroke()

  ctx.fillStyle = '#67C23A'
  ctx.beginPath()
  ctx.arc(startX, startY, 8, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.font = '10px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('起', startX, startY)

  ctx.fillStyle = '#F56C6C'
  ctx.beginPath()
  ctx.arc(endX, endY, 8, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.fillText('终', endX, endY)

  const progress = Math.min(0.7, (Date.now() % 10000) / 10000)
  const ownerX = startX + (endX - startX) * progress + Math.sin(progress * Math.PI * 2) * 30
  const ownerY = startY + (endY - startY) * progress - Math.sin(progress * Math.PI) * 40

  const t = 0.3
  const passengerX = startX + (endX - startX) * t
  const passengerY = startY + (endY - startY) * t

  ownerPosition.value = { lng: 116.397 + progress * 0.02, lat: 39.908 + progress * 0.01 }
  passengerPosition.value = { lng: 116.397 + t * 0.02, lat: 39.908 + t * 0.01 }

  ctx.fillStyle = '#409EFF'
  ctx.beginPath()
  ctx.arc(ownerX, ownerY, 12, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.fillText('车', ownerX, ownerY)

  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(ownerX, ownerY, 14, 0, Math.PI * 2)
  ctx.strokeStyle = '#409EFF'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = '#FF9800'
  ctx.beginPath()
  ctx.arc(passengerX, passengerY, 12, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.fillText('客', passengerX, passengerY)

  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(passengerX, passengerY, 14, 0, Math.PI * 2)
  ctx.strokeStyle = '#FF9800'
  ctx.lineWidth = 2
  ctx.stroke()

  remainingDistance.value = Math.max(0.5, 5.2 - progress * 5).toFixed(1) as unknown as number
  const etaMinutes = Math.max(3, Math.round(15 - progress * 12))
  estimatedArrival.value = `${etaMinutes}分钟`
}

async function reportLocation() {
  if (!order.value?.ride_id) return
  try {
    await locationApi.report({
      ride_id: order.value.ride_id,
      lng: ownerPosition.value.lng,
      lat: ownerPosition.value.lat,
      speed: 30 + Math.random() * 20,
      heading: Math.random() * 360
    })
  } catch (error) {
    console.error('Failed to report location:', error)
  }
}

function startLocationUpdates() {
  drawMap()
  locationUpdateInterval.value = window.setInterval(() => {
    drawMap()
    reportLocation()
  }, 5000)
}

function stopLocationUpdates() {
  if (locationUpdateInterval.value) {
    clearInterval(locationUpdateInterval.value)
    locationUpdateInterval.value = null
  }
}

async function handleConfirm() {
  actionLoading.value = true
  try {
    const res = await orderApi.confirm(orderId)
    if (res.code === 0) {
      ElMessage.success('已确认订单')
      fetchOrderDetail()
    }
  } catch (error) {
    console.error('Failed to confirm:', error)
  } finally {
    actionLoading.value = false
  }
}

async function handleReject() {
  actionLoading.value = true
  try {
    const res = await orderApi.reject(orderId)
    if (res.code === 0) {
      ElMessage.success('已拒绝订单')
      fetchOrderDetail()
    }
  } catch (error) {
    console.error('Failed to reject:', error)
  } finally {
    actionLoading.value = false
  }
}

async function handleStart() {
  actionLoading.value = true
  try {
    const res = await orderApi.start(orderId)
    if (res.code === 0) {
      ElMessage.success('行程已开始')
      fetchOrderDetail()
    }
  } catch (error) {
    console.error('Failed to start:', error)
  } finally {
    actionLoading.value = false
  }
}

async function handleComplete() {
  actionLoading.value = true
  try {
    const res = await orderApi.complete(orderId)
    if (res.code === 0) {
      ElMessage.success('行程已完成')
      stopLocationUpdates()
      fetchOrderDetail()
    }
  } catch (error) {
    console.error('Failed to complete:', error)
  } finally {
    actionLoading.value = false
  }
}

function handleCancel() {
  cancelDialogVisible.value = true
}

async function confirmCancel() {
  if (!cancelReason.value.trim()) {
    ElMessage.warning('请输入取消原因')
    return
  }
  actionLoading.value = true
  try {
    const res = await orderApi.cancel(orderId, cancelReason.value)
    if (res.code === 0) {
      ElMessage.success('订单已取消')
      cancelDialogVisible.value = false
      fetchOrderDetail()
    }
  } catch (error) {
    console.error('Failed to cancel:', error)
  } finally {
    actionLoading.value = false
  }
}

async function submitReview() {
  if (!order.value || reviewForm.value.rating === 0) {
    ElMessage.warning('请选择评分')
    return
  }

  const revieweeId = isOwner.value ? order.value.passenger_id : order.value.owner_id

  submittingReview.value = true
  try {
    const res = await reviewApi.create({
      order_id: order.value.id,
      ride_id: order.value.ride_id,
      reviewee_id: revieweeId,
      rating: reviewForm.value.rating,
      content: reviewForm.value.content,
      tags: reviewForm.value.tags.join(',')
    })
    if (res.code === 0) {
      ElMessage.success('评价提交成功')
      hasReviewed.value = true
      submittedReview.value = { ...reviewForm.value }
    }
  } catch (error) {
    console.error('Failed to submit review:', error)
  } finally {
    submittingReview.value = false
  }
}

watch(() => order.value?.status, (newStatus) => {
  if (newStatus === OrderStatus.STARTED) {
    nextTick(() => {
      startLocationUpdates()
    })
  } else {
    stopLocationUpdates()
  }
})

onMounted(() => {
  fetchOrderDetail()
})

onUnmounted(() => {
  stopLocationUpdates()
})
</script>

<style scoped>
.order-detail-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.loading-container {
  margin-bottom: 20px;
}

.status-card, .route-card, .map-card, .users-card, .review-card, .reviewed-card {
  margin-bottom: 16px;
  border-radius: 12px;
}

.status-card :deep(.el-card__body),
.route-card :deep(.el-card__body),
.map-card :deep(.el-card__body),
.users-card :deep(.el-card__body),
.review-card :deep(.el-card__body),
.reviewed-card :deep(.el-card__body) {
  padding: 20px;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.status-header :deep(.el-tag) {
  font-size: 14px;
  padding: 6px 14px;
}

.order-no {
  font-size: 13px;
  color: #909399;
}

.status-timeline {
  padding: 10px 0;
}

.route-info {
  margin-bottom: 16px;
}

.route-point {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 6px;
}

.departure-dot {
  background: #67C23A;
}

.destination-dot {
  background: #F56C6C;
}

.point-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.address {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.time {
  font-size: 13px;
  color: #909399;
}

.route-line {
  width: 2px;
  height: 24px;
  background: #E4E7ED;
  margin-left: 4px;
}

.route-meta {
  display: flex;
  gap: 40px;
  padding-top: 16px;
  border-top: 1px solid #EBEEF5;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  font-size: 13px;
  color: #909399;
}

.meta-value {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.meta-value.price {
  color: #F56C6C;
  font-size: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.card-header .card-title {
  margin: 0;
}

.live-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #F56C6C;
}

.live-dot {
  width: 8px;
  height: 8px;
  background: #F56C6C;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.map-container {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}

.map-canvas {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 8px;
}

.map-legend {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 12px;
  border-radius: 6px;
  display: flex;
  gap: 16px;
  font-size: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-dot.owner {
  background: #409EFF;
}

.legend-dot.passenger {
  background: #FF9800;
}

.map-stats {
  display: flex;
  gap: 40px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-item div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.stat-value {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.users-list {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.user-stats {
  font-size: 12px;
  color: #909399;
}

.user-divider {
  width: 1px;
  height: 40px;
  background: #EBEEF5;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding: 16px 0;
  position: sticky;
  bottom: 0;
  background: #fff;
}

.review-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-text {
  margin: 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

.review-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
