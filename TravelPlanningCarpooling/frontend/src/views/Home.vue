<template>
  <div class="home-container">
    <el-card class="filter-card" shadow="never">
      <div class="filter-header" @click="filterCollapsed = !filterCollapsed">
        <div class="filter-title">
          <el-icon><Filter /></el-icon>
          <span>筛选条件</span>
        </div>
        <el-icon :class="{ 'rotate-180': filterCollapsed }">
          <ArrowDown />
        </el-icon>
      </div>
      <el-collapse-transition>
        <div v-show="!filterCollapsed">
          <el-form :model="filters" inline class="filter-form">
            <el-form-item label="出发地">
              <el-input
                v-model="filters.departure"
                placeholder="请输入出发地"
                :prefix-icon="Location"
                clearable
              />
            </el-form-item>
            <el-form-item label="目的地">
              <el-input
                v-model="filters.destination"
                placeholder="请输入目的地"
                :prefix-icon="Location"
                clearable
              />
            </el-form-item>
            <el-form-item label="出发日期">
              <el-date-picker
                v-model="filters.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
            <el-form-item label="价格范围">
              <el-input-number
                v-model="filters.minPrice"
                :min="0"
                placeholder="最低"
                style="width: 100px"
              />
              <span class="price-separator">-</span>
              <el-input-number
                v-model="filters.maxPrice"
                :min="0"
                placeholder="最高"
                style="width: 100px"
              />
            </el-form-item>
            <el-form-item label="最少座位">
              <el-input-number
                v-model="filters.minSeats"
                :min="1"
                :max="10"
                placeholder="座位数"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="Search" @click="fetchRides">
                搜索
              </el-button>
              <el-button :icon="Refresh" @click="resetFilters">
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-collapse-transition>
    </el-card>

    <div class="view-toggle">
      <el-radio-group v-model="viewMode" size="large">
        <el-radio-button value="list">
          <el-icon><List /></el-icon>
          <span class="toggle-label">列表</span>
        </el-radio-button>
        <el-radio-button value="map">
          <el-icon><Map /></el-icon>
          <span class="toggle-label">地图</span>
        </el-radio-button>
      </el-radio-group>
    </div>

    <div v-if="viewMode === 'list'" class="ride-list">
      <el-empty v-if="rides.length === 0 && !loading" description="暂无行程数据" />
      <el-row :gutter="20">
        <el-col
          v-for="ride in rides"
          :key="ride.id"
          :xs="24"
          :sm="12"
          :md="12"
          :lg="8"
          :xl="8"
        >
          <el-card
            class="ride-card"
            shadow="hover"
            @click="showRideDetail(ride)"
          >
            <div class="ride-header">
              <el-tag :type="getRideStatusType(ride.status)" effect="light" size="small">
                {{ RideStatusText[ride.status] }}
              </el-tag>
              <div class="ride-price">
                <span class="price-symbol">¥</span>
                <span class="price-value">{{ ride.price_per_person }}</span>
                <span class="price-unit">/人</span>
              </div>
            </div>
            <div class="ride-route">
              <div class="route-point">
                <el-icon class="departure-icon"><Location /></el-icon>
                <span class="location-text">{{ ride.departure }}</span>
              </div>
              <div class="route-line"></div>
              <div class="route-point">
                <el-icon class="destination-icon"><Location /></el-icon>
                <span class="location-text">{{ ride.destination }}</span>
              </div>
            </div>
            <div class="ride-info">
              <div class="info-item">
                <el-icon><Calendar /></el-icon>
                <span>{{ formatDate(ride.departure_time) }}</span>
              </div>
              <div class="info-item">
                <el-icon><User /></el-icon>
                <span>{{ ride.available_seats }} 座</span>
              </div>
            </div>
            <div class="ride-footer">
              <div class="owner-info">
                <el-avatar :size="24" :src="ride.owner?.avatar">
                  {{ ride.owner?.nickname?.charAt(0) || 'U' }}
                </el-avatar>
                <span class="owner-name">{{ ride.owner?.nickname || '车主' }}</span>
                <el-rate
                  v-model="ownerRating"
                  disabled
                  :max="5"
                  :show-text="false"
                  size="small"
                />
                <span class="credit-score">信用 {{ ride.owner?.credit_score || 0 }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div v-else class="map-container">
      <div class="mock-map" ref="mapRef">
        <canvas ref="canvasRef" width="800" height="400" @click="handleMapClick"></canvas>
        <div
          v-for="ride in rides"
          :key="ride.id"
          class="map-marker"
          :style="getMarkerStyle(ride)"
          @click.stop="showRideDetail(ride)"
        >
          <el-icon :size="28" color="#409EFF"><Location /></el-icon>
          <div class="marker-tooltip">
            <div class="tooltip-title">{{ ride.departure }} → {{ ride.destination }}</div>
            <div class="tooltip-price">¥{{ ride.price_per_person }}/人</div>
          </div>
        </div>
      </div>
      <div class="map-legend">
        <el-tag type="primary" size="small">
          <el-icon><Location /></el-icon>
          行程位置
        </el-tag>
        <span class="legend-hint">点击标记查看详情</span>
      </div>
    </div>

    <el-dialog
      v-model="detailDialogVisible"
      title="行程详情"
      width="500px"
      :close-on-click-modal="false"
    >
      <div v-if="selectedRide" class="ride-detail">
        <div class="detail-route">
          <div class="detail-point">
            <el-icon class="departure-icon"><Location /></el-icon>
            <div>
              <div class="point-label">出发地</div>
              <div class="point-value">{{ selectedRide.departure }}</div>
            </div>
          </div>
          <div class="detail-line"></div>
          <div class="detail-point">
            <el-icon class="destination-icon"><Location /></el-icon>
            <div>
              <div class="point-label">目的地</div>
              <div class="point-value">{{ selectedRide.destination }}</div>
            </div>
          </div>
        </div>
        <el-divider />
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="出发时间">
            {{ selectedRide.departure_time }}
          </el-descriptions-item>
          <el-descriptions-item label="价格">
            <span class="detail-price">¥{{ selectedRide.price_per_person }}/人</span>
          </el-descriptions-item>
          <el-descriptions-item label="可用座位">
            {{ selectedRide.available_seats }} 座
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getRideStatusType(selectedRide.status)">
              {{ RideStatusText[selectedRide.status] }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="车主" v-if="selectedRide.owner">
            <div class="owner-detail">
              <el-avatar :size="24" :src="selectedRide.owner.avatar">
                {{ selectedRide.owner.nickname?.charAt(0) || 'U' }}
              </el-avatar>
              <span>{{ selectedRide.owner.nickname }}</span>
              <span class="credit-score">信用 {{ selectedRide.owner.credit_score }}</span>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="车辆" v-if="selectedRide.vehicle">
            {{ selectedRide.vehicle.brand }} {{ selectedRide.vehicle.model }}
            ({{ selectedRide.vehicle.color }})
          </el-descriptions-item>
        </el-descriptions>
        <div v-if="selectedRide.description" class="detail-description">
          <div class="desc-label">行程说明</div>
          <div class="desc-content">{{ selectedRide.description }}</div>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="orderLoading"
          :disabled="selectedRide?.status !== 1"
          @click="handleApply"
        >
          立即预订
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Location,
  Calendar,
  User,
  Search,
  Filter,
  Map,
  List,
  Refresh,
  ArrowDown
} from '@element-plus/icons-vue'
import { rideApi, orderApi } from '../api'
import type { Ride } from '../types'
import { RideStatusText } from '../types'

const router = useRouter()
const canvasRef = ref<HTMLCanvasElement>()
const mapRef = ref<HTMLDivElement>()
const loading = ref(false)
const orderLoading = ref(false)
const filterCollapsed = ref(false)
const viewMode = ref<'list' | 'map'>('list')
const detailDialogVisible = ref(false)
const selectedRide = ref<Ride | null>(null)
const rides = ref<Ride[]>([])
const ownerRating = ref(4)

const filters = reactive({
  departure: '',
  destination: '',
  dateRange: [] as string[],
  minPrice: undefined as number | undefined,
  maxPrice: undefined as number | undefined,
  minSeats: undefined as number | undefined
})

const mockCoordinates = [
  { lng: 116.397, lat: 39.908 },
  { lng: 116.417, lat: 39.918 },
  { lng: 116.377, lat: 39.898 },
  { lng: 116.427, lat: 39.888 },
  { lng: 116.367, lat: 39.928 },
  { lng: 116.407, lat: 39.878 }
]

onMounted(() => {
  fetchRides()
  nextTick(() => {
    drawMockMap()
  })
})

async function fetchRides() {
  loading.value = true
  try {
    const params: any = {
      page: 1,
      page_size: 20
    }
    if (filters.departure) params.departure = filters.departure
    if (filters.destination) params.destination = filters.destination
    if (filters.dateRange && filters.dateRange.length === 2) {
      params.start_date = filters.dateRange[0]
      params.end_date = filters.dateRange[1]
    }
    if (filters.minPrice !== undefined) params.min_price = filters.minPrice
    if (filters.maxPrice !== undefined) params.max_price = filters.maxPrice
    if (filters.minSeats !== undefined) params.min_seats = filters.minSeats

    const res = await rideApi.getList(params)
    if (res.code === 0 && res.data) {
      rides.value = (res.data.list || res.data || []).map((ride: Ride, index: number) => ({
        ...ride,
        departure_lng: ride.departure_lng || mockCoordinates[index % mockCoordinates.length].lng,
        departure_lat: ride.departure_lat || mockCoordinates[index % mockCoordinates.length].lat
      }))
      nextTick(() => {
        if (viewMode.value === 'map') {
          drawMockMap()
        }
      })
    }
  } catch (error) {
    console.error('Failed to fetch rides:', error)
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  filters.departure = ''
  filters.destination = ''
  filters.dateRange = []
  filters.minPrice = undefined
  filters.maxPrice = undefined
  filters.minSeats = undefined
  fetchRides()
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getRideStatusType(status: number) {
  switch (status) {
    case 1: return 'success'
    case 2: return 'warning'
    case 3: return 'info'
    case 4: return 'danger'
    default: return 'info'
  }
}

function drawMockMap() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const gradient = ctx.createLinearGradient(0, 0, 800, 400)
  gradient.addColorStop(0, '#f0f2f5')
  gradient.addColorStop(0.5, '#e4e7ed')
  gradient.addColorStop(1, '#dcdfe6')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 800, 400)

  ctx.strokeStyle = '#c0c4cc'
  ctx.lineWidth = 1
  for (let i = 0; i < 800; i += 50) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, 400)
    ctx.stroke()
  }
  for (let i = 0; i < 400; i += 50) {
    ctx.beginPath()
    ctx.moveTo(0, i)
    ctx.lineTo(800, i)
    ctx.stroke()
  }

  ctx.strokeStyle = '#909399'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(100, 100)
  ctx.quadraticCurveTo(400, 50, 700, 150)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(50, 250)
  ctx.quadraticCurveTo(300, 350, 600, 280)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(150, 350)
  ctx.quadraticCurveTo(450, 200, 750, 350)
  ctx.stroke()

  ctx.fillStyle = '#d3d4d6'
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * 700 + 50
    const y = Math.random() * 300 + 50
    const w = Math.random() * 60 + 40
    const h = Math.random() * 40 + 30
    ctx.fillRect(x, y, w, h)
  }

  ctx.fillStyle = '#67c23a'
  ctx.font = '12px sans-serif'
  ctx.fillText('N', 770, 30)
  ctx.beginPath()
  ctx.moveTo(775, 35)
  ctx.lineTo(770, 50)
  ctx.lineTo(780, 50)
  ctx.closePath()
  ctx.fill()
}

function getMarkerStyle(ride: Ride) {
  const lng = ride.departure_lng || 116.4
  const lat = ride.departure_lat || 39.9
  const x = ((lng - 116.3) / 0.15) * 700 + 50
  const y = ((39.95 - lat) / 0.1) * 300 + 50
  return {
    left: `${Math.max(10, Math.min(760, x))}px`,
    top: `${Math.max(10, Math.min(360, y))}px`
  }
}

function handleMapClick(e: MouseEvent) {
  console.log('Map clicked at:', e.offsetX, e.offsetY)
}

function showRideDetail(ride: Ride) {
  selectedRide.value = ride
  detailDialogVisible.value = true
}

async function handleApply() {
  if (!selectedRide.value) return

  try {
    await ElMessageBox.confirm(
      `确认预订该行程？\n${selectedRide.value.departure} → ${selectedRide.value.destination}\n价格: ¥${selectedRide.value.price_per_person}/人`,
      '预订确认',
      {
        confirmButtonText: '确认预订',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    orderLoading.value = true
    const res = await orderApi.create({
      ride_id: selectedRide.value.id,
      passengers_count: 1,
      price: selectedRide.value.price_per_person,
      pickup_address: selectedRide.value.departure,
      dropoff_address: selectedRide.value.destination
    })

    if (res.code === 0) {
      ElMessage.success('预订成功')
      detailDialogVisible.value = false
      if (res.data?.id) {
        router.push(`/order/${res.data.id}`)
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('预订失败，请稍后重试')
    }
  } finally {
    orderLoading.value = false
  }
}
</script>

<style scoped>
.home-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.filter-card {
  margin-bottom: 20px;
  border-radius: 12px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 16px;
}

.filter-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.filter-title .el-icon {
  color: #409eff;
}

.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.price-separator {
  margin: 0 8px;
  color: #909399;
}

.view-toggle {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.toggle-label {
  margin-left: 6px;
}

.ride-list {
  min-height: 400px;
}

.ride-card {
  margin-bottom: 20px;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.ride-card:hover {
  transform: translateY(-4px);
}

.ride-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.ride-price {
  display: flex;
  align-items: baseline;
  color: #f56c6c;
}

.price-symbol {
  font-size: 14px;
}

.price-value {
  font-size: 24px;
  font-weight: 700;
  margin: 0 2px;
}

.price-unit {
  font-size: 12px;
  color: #909399;
}

.ride-route {
  margin-bottom: 16px;
}

.route-point {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.departure-icon {
  color: #67c23a;
}

.destination-icon {
  color: #f56c6c;
}

.location-text {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.route-line {
  width: 2px;
  height: 20px;
  background: linear-gradient(to bottom, #67c23a, #f56c6c);
  margin-left: 6px;
}

.ride-info {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
  padding-top: 12px;
  border-top: 1px dashed #ebeef5;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
}

.info-item .el-icon {
  color: #909399;
}

.ride-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.owner-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.owner-name {
  font-size: 13px;
  color: #606266;
}

.credit-score {
  font-size: 12px;
  color: #e6a23c;
  margin-left: 4px;
}

.map-container {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.mock-map {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #dcdfe6;
}

.mock-map canvas {
  display: block;
  width: 100%;
  height: auto;
}

.map-marker {
  position: absolute;
  transform: translate(-50%, -100%);
  cursor: pointer;
  z-index: 10;
  transition: transform 0.2s ease;
}

.map-marker:hover {
  transform: translate(-50%, -100%) scale(1.2);
}

.map-marker:hover .marker-tooltip {
  opacity: 1;
  visibility: visible;
}

.marker-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 8px 12px;
  border-radius: 6px;
  white-space: nowrap;
  margin-bottom: 8px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  font-size: 12px;
  z-index: 20;
}

.tooltip-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.tooltip-price {
  color: #67c23a;
}

.map-legend {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  justify-content: center;
}

.legend-hint {
  font-size: 13px;
  color: #909399;
}

.ride-detail {
  padding: 10px 0;
}

.detail-route {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.detail-point {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.detail-point .el-icon {
  margin-top: 4px;
}

.point-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 2px;
}

.point-value {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.detail-line {
  width: 2px;
  height: 24px;
  background: linear-gradient(to bottom, #67c23a, #f56c6c);
  margin-left: 7px;
  margin: 8px 0 8px 7px;
}

.detail-price {
  color: #f56c6c;
  font-weight: 600;
  font-size: 16px;
}

.owner-detail {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-description {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #ebeef5;
}

.desc-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
}

.desc-content {
  color: #606266;
  line-height: 1.6;
}

:deep(.el-descriptions__label) {
  width: 100px;
}
</style>
