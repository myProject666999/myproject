<template>
  <div class="match-result-page">
    <div class="page-header">
      <el-button :icon="ArrowLeft" text @click="goBack">
        返回
      </el-button>
      <h2 class="page-title">匹配结果</h2>
      <div></div>
    </div>

    <el-card v-if="request" class="request-card" shadow="never">
      <div class="request-info">
        <div class="route">
          <el-icon :size="20" color="#4F6EF7"><LocationFilled /></el-icon>
          <span class="departure">{{ request.departure }}</span>
          <el-icon :size="16" color="#909399"><Right /></el-icon>
          <span class="destination">{{ request.destination }}</span>
        </div>
        <div class="meta">
          <span>
            <el-icon><Clock /></el-icon>
            {{ formatTime(request.earliest_time) }} - {{ formatTime(request.latest_time) }}
          </span>
          <span>
            <el-icon><User /></el-icon>
            {{ request.passengers_count }}人
          </span>
          <span>
            <el-icon><Money /></el-icon>
            ¥{{ request.max_price }}/人
          </span>
        </div>
      </div>
    </el-card>

    <div v-else class="loading-container">
      <el-skeleton :rows="3" animated />
    </div>

    <div class="match-stats" v-if="sortedRides.length > 0">
      <el-tag type="primary" effect="light">
        共找到 {{ sortedRides.length }} 个匹配行程
      </el-tag>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>

    <div v-else-if="sortedRides.length === 0" class="empty-container">
      <el-empty description="暂无匹配的行程">
        <el-button type="primary" @click="goBack">返回重新发布</el-button>
      </el-empty>
    </div>

    <div v-else class="rides-list">
      <el-card
        v-for="ride in sortedRides"
        :key="ride.id"
        class="ride-card"
        shadow="hover"
      >
        <div class="ride-header">
          <div class="match-score">
            <span class="score-label">匹配度</span>
            <el-progress
              :percentage="ride.match_score || 0"
              :color="getScoreColor(ride.match_score || 0)"
              :stroke-width="8"
              :show-text="false"
            />
            <span class="score-value">{{ ride.match_score || 0 }}%</span>
          </div>
        </div>

        <div class="ride-route">
          <div class="route-point">
            <span class="dot departure-dot"></span>
            <span class="address">{{ ride.departure }}</span>
          </div>
          <div class="route-line"></div>
          <div class="route-point">
            <span class="dot destination-dot"></span>
            <span class="address">{{ ride.destination }}</span>
          </div>
        </div>

        <div class="ride-meta">
          <span class="meta-item">
            <el-icon :size="14"><Clock /></el-icon>
            {{ formatDateTime(ride.departure_time) }}
          </span>
          <span class="meta-item">
            <el-icon :size="14"><Money /></el-icon>
            <span class="price">¥{{ ride.price_per_person }}/人</span>
          </span>
          <span class="meta-item">
            <el-icon :size="14"><User /></el-icon>
            {{ ride.available_seats }}座
          </span>
        </div>

        <div class="ride-owner" v-if="ride.owner">
          <el-avatar :size="36" :src="ride.owner.avatar">
            {{ ride.owner.nickname?.charAt(0) }}
          </el-avatar>
          <div class="owner-info">
            <div class="owner-name">
              {{ ride.owner.nickname }}
              <el-tag v-if="ride.owner.is_verified" type="success" size="small" effect="light">
                已认证
              </el-tag>
            </div>
            <div class="owner-stats">
              信用分 {{ ride.owner.credit_score }} · 完成 {{ ride.owner.completed_rides }} 单
            </div>
          </div>
        </div>

        <div class="ride-actions">
          <el-button type="primary" @click="handleApply(ride)">
            申请拼车
          </el-button>
        </div>
      </el-card>
    </div>

    <el-dialog
      v-model="applyDialogVisible"
      title="确认申请"
      width="420px"
    >
      <div v-if="selectedRide" class="apply-content">
        <p>确定要申请以下行程吗？</p>
        <div class="apply-route">
          <strong>{{ selectedRide.departure }}</strong>
          <el-icon :size="14"><Right /></el-icon>
          <strong>{{ selectedRide.destination }}</strong>
        </div>
        <div class="apply-price">
          费用：<span class="price-highlight">¥{{ selectedRide.price_per_person * (request?.passengers_count || 1) }}</span>
          （{{ request?.passengers_count || 1 }}人 × ¥{{ selectedRide.price_per_person }}/人）
        </div>
      </div>
      <template #footer>
        <el-button @click="applyDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="applying" @click="confirmApply">
          确认申请
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  LocationFilled,
  Right,
  Clock,
  User,
  Money
} from '@element-plus/icons-vue'
import { requestApi, orderApi } from '../api'
import type { Ride, RideRequest } from '../types'
import { useUserStore } from '../stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const requestId = Number(route.params.requestId)
const request = ref<RideRequest | null>(null)
const rides = ref<Ride[]>([])
const loading = ref(false)
const applyDialogVisible = ref(false)
const selectedRide = ref<Ride | null>(null)
const applying = ref(false)

const sortedRides = computed(() => {
  return [...rides.value].sort((a, b) => (b.match_score || 0) - (a.match_score || 0))
})

function getScoreColor(score: number) {
  if (score >= 80) return '#67C23A'
  if (score >= 60) return '#E6A23C'
  return '#F56C6C'
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

async function fetchMatches() {
  loading.value = true
  try {
    const res = await requestApi.getMatches(requestId)
    if (res.code === 0 && res.data) {
      request.value = res.data.request
      rides.value = res.data.rides || []
    }
  } catch (error) {
    console.error('Failed to fetch matches:', error)
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push('/')
}

function handleApply(ride: Ride) {
  if (!userStore.user) {
    router.push('/login')
    return
  }
  selectedRide.value = ride
  applyDialogVisible.value = true
}

async function confirmApply() {
  if (!selectedRide.value || !request.value) return

  applying.value = true
  try {
    const res = await orderApi.create({
      ride_id: selectedRide.value.id,
      request_id: request.value.id,
      passengers_count: request.value.passengers_count,
      price: selectedRide.value.price_per_person * request.value.passengers_count,
      pickup_address: request.value.departure,
      dropoff_address: request.value.destination
    })
    if (res.code === 0) {
      ElMessage.success('申请成功')
      applyDialogVisible.value = false
      router.push(`/order/${res.data?.id || res.data}`)
    }
  } catch (error) {
    console.error('Failed to create order:', error)
  } finally {
    applying.value = false
  }
}

onMounted(() => {
  fetchMatches()
})
</script>

<style scoped>
.match-result-page {
  max-width: 800px;
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

.request-card {
  margin-bottom: 20px;
  border-radius: 12px;
}

.request-card :deep(.el-card__body) {
  padding: 20px;
}

.request-info .route {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 500;
}

.departure, .destination {
  color: #303133;
}

.meta {
  display: flex;
  gap: 20px;
  color: #606266;
  font-size: 14px;
}

.meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.match-stats {
  margin-bottom: 16px;
}

.loading-container {
  margin-bottom: 20px;
}

.empty-container {
  padding: 60px 0;
}

.rides-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ride-card {
  border-radius: 12px;
}

.ride-card :deep(.el-card__body) {
  padding: 20px;
}

.ride-header {
  margin-bottom: 16px;
}

.match-score {
  display: flex;
  align-items: center;
  gap: 12px;
}

.score-label {
  font-size: 14px;
  color: #606266;
  min-width: 50px;
}

.match-score :deep(.el-progress) {
  flex: 1;
  max-width: 200px;
}

.score-value {
  font-size: 16px;
  font-weight: 600;
  color: #4F6EF7;
  min-width: 45px;
}

.ride-route {
  margin-bottom: 16px;
}

.route-point {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dot {
  width: 10px;
  height: 10px;
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
  font-size: 15px;
  color: #303133;
  font-weight: 500;
}

.route-line {
  width: 2px;
  height: 20px;
  background: #E4E7ED;
  margin-left: 4px;
}

.ride-meta {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  padding: 12px 0;
  border-top: 1px solid #EBEEF5;
  border-bottom: 1px solid #EBEEF5;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #606266;
}

.price {
  color: #F56C6C;
  font-weight: 600;
}

.ride-owner {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.owner-info {
  flex: 1;
}

.owner-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.owner-stats {
  font-size: 12px;
  color: #909399;
}

.ride-actions {
  display: flex;
  justify-content: flex-end;
}

.apply-content {
  font-size: 14px;
}

.apply-content p {
  margin: 0 0 16px 0;
  color: #606266;
}

.apply-route {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 12px;
  background: #F5F7FA;
  border-radius: 8px;
}

.apply-price {
  color: #606266;
}

.price-highlight {
  color: #F56C6C;
  font-size: 18px;
  font-weight: 600;
}
</style>
