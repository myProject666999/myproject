<template>
  <div class="order-list-page">
    <div class="page-header">
      <h2 class="page-title">我的订单</h2>
    </div>

    <el-card class="tabs-card" shadow="never">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="全部" name="0" />
        <el-tab-pane label="待确认" name="1" />
        <el-tab-pane label="已确认" name="2" />
        <el-tab-pane label="已出发" name="3" />
        <el-tab-pane label="已完成" name="4" />
        <el-tab-pane label="已取消" name="5" />
      </el-tabs>
    </el-card>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="4" animated />
    </div>

    <div v-else-if="orders.length === 0" class="empty-container">
      <el-empty description="暂无订单">
        <el-button type="primary" @click="goHome">去发布行程</el-button>
      </el-empty>
    </div>

    <div v-else class="orders-list">
      <el-card
        v-for="order in orders"
        :key="order.id"
        class="order-card"
        shadow="hover"
        @click="goToDetail(order.id)"
      >
        <div class="order-header">
          <el-tag :type="getStatusType(order.status)" effect="light" size="small">
            {{ OrderStatusText[order.status] }}
          </el-tag>
          <span class="order-time">{{ formatDate(order.created_at) }}</span>
        </div>

        <div class="order-route">
          <div class="route-point">
            <span class="dot departure-dot"></span>
            <span class="address">{{ order.pickup_address }}</span>
          </div>
          <div class="route-line"></div>
          <div class="route-point">
            <span class="dot destination-dot"></span>
            <span class="address">{{ order.dropoff_address }}</span>
          </div>
        </div>

        <div class="order-info">
          <div class="info-row">
            <span class="info-label">乘车人数</span>
            <span class="info-value">{{ order.passengers_count }}人</span>
          </div>
          <div class="info-row">
            <span class="info-label">费用</span>
            <span class="info-value price">¥{{ order.price }}</span>
          </div>
          <div class="info-row" v-if="order.ride">
            <span class="info-label">出发时间</span>
            <span class="info-value">{{ formatDateTime(order.ride.departure_time) }}</span>
          </div>
        </div>

        <div class="order-people" v-if="order.owner || order.passenger">
          <el-avatar
            v-if="order.owner"
            :size="28"
            :src="order.owner.avatar"
          >
            {{ order.owner.nickname?.charAt(0) }}
          </el-avatar>
          <span class="people-text">
            {{ isOwner(order) ? '乘客：' : '车主：' }}
            {{ isOwner(order) ? order.passenger?.nickname : order.owner?.nickname }}
          </span>
        </div>

        <div class="order-actions">
          <el-button type="primary" plain size="small" @click.stop="goToDetail(order.id)">
            查看详情
          </el-button>
        </div>
      </el-card>
    </div>

    <div class="pagination-container" v-if="total > pageSize">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        background
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { orderApi } from '../api'
import type { Order } from '../types'
import { OrderStatusText } from '../types'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('0')
const orders = ref<Order[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

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

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function isOwner(order: Order) {
  return userStore.user?.id === order.owner_id
}

async function fetchOrders() {
  loading.value = true
  try {
    const status = Number(activeTab.value)
    const params: { page: number; page_size: number; status?: number } = {
      page: currentPage.value,
      page_size: pageSize.value
    }
    if (status > 0) {
      params.status = status
    }
    const res = await orderApi.getList(params)
    if (res.code === 0 && res.data) {
      orders.value = res.data.list || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    console.error('Failed to fetch orders:', error)
  } finally {
    loading.value = false
  }
}

function handleTabChange() {
  currentPage.value = 1
  fetchOrders()
}

function handlePageChange() {
  fetchOrders()
}

function goToDetail(orderId: number) {
  router.push(`/order/${orderId}`)
}

function goHome() {
  router.push('/')
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.order-list-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.tabs-card {
  margin-bottom: 16px;
  border-radius: 12px;
}

.tabs-card :deep(.el-card__body) {
  padding: 0 20px;
}

.tabs-card :deep(.el-tabs__header) {
  margin: 0;
}

.loading-container {
  margin-bottom: 20px;
}

.empty-container {
  padding: 60px 0;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-card {
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s;
}

.order-card:hover {
  transform: translateY(-2px);
}

.order-card :deep(.el-card__body) {
  padding: 16px 20px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.order-time {
  font-size: 13px;
  color: #909399;
}

.order-route {
  margin-bottom: 12px;
}

.route-point {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.departure-dot {
  background: #67C23A;
}

.destination-dot {
  background: #F56C6C;
}

.address {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.route-line {
  width: 2px;
  height: 16px;
  background: #E4E7ED;
  margin-left: 3px;
}

.order-info {
  display: flex;
  gap: 30px;
  margin-bottom: 12px;
  padding: 12px 0;
  border-top: 1px solid #EBEEF5;
  border-bottom: 1px solid #EBEEF5;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-label {
  font-size: 12px;
  color: #909399;
}

.info-value {
  font-size: 14px;
  color: #303133;
}

.info-value.price {
  color: #F56C6C;
  font-weight: 600;
}

.order-people {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.people-text {
  font-size: 13px;
  color: #606266;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
