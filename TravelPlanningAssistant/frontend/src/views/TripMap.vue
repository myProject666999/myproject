<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" link @click="goBack">返回</el-button>
        <h2>{{ trip?.name || '地图展示' }}</h2>
      </div>
      <el-select v-model="selectedDayId" placeholder="筛选日期" style="width: 200px" clearable>
        <el-option
          v-for="day in days"
          :key="day.id"
          :label="`Day ${day.order_index + 1} - ${formatDate(day.date)}`"
          :value="day.id"
        />
      </el-select>
    </div>

    <div v-loading="loading" class="map-container">
      <div ref="mapRef" class="map"></div>
      <div v-if="mapPoints.length === 0" class="map-empty">
        <el-icon><LocationFilled /></el-icon>
        <p>还没有添加带坐标的景点</p>
      </div>
    </div>

    <div v-if="mapPoints.length > 0" class="points-list">
      <h3 class="section-title">地点列表</h3>
      <div class="points-grid">
        <div
          v-for="(point, index) in filteredPoints"
          :key="index"
          class="point-card card"
          @click="focusPoint(point)"
        >
          <div class="point-header">
            <span class="point-type" :class="`type-${point.type}`">
              {{ getTypeText(point.type) }}
            </span>
            <span class="point-name">{{ point.name }}</span>
          </div>
          <div class="point-info">
            <span><el-icon><Calendar /></el-icon> {{ point.date }}</span>
            <span v-if="point.start_time">
              <el-icon><Clock /></el-icon> {{ point.start_time }} - {{ point.end_time }}
            </span>
          </div>
          <p v-if="point.address" class="point-address">
            <el-icon><LocationFilled /></el-icon> {{ point.address }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, LocationFilled, Calendar, Clock } from '@element-plus/icons-vue'
import L from 'leaflet'
import { tripApi } from '../api'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const trip = ref(null)
const days = ref([])
const mapPoints = ref([])
const selectedDayId = ref(null)
const mapRef = ref(null)

let map = null
let markers = []

const filteredPoints = computed(() => {
  if (!selectedDayId.value) return mapPoints.value
  return mapPoints.value.filter(p => p.day_id === selectedDayId.value)
})

onMounted(async () => {
  await loadData()
  initMap()
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})

async function loadData() {
  loading.value = true
  try {
    const [tripRes, mapRes] = await Promise.all([
      tripApi.getTrip(route.params.id),
      tripApi.getTripMapData(route.params.id)
    ])
    trip.value = tripRes.data
    days.value = trip.value.days || []
    mapPoints.value = mapRes.data || []
    renderMarkers()
  } finally {
    loading.value = false
  }
}

function initMap() {
  map = L.map(mapRef.value).setView([39.9042, 116.4074], 5)
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map)
}

function renderMarkers() {
  if (!map) return
  
  markers.forEach(m => m.remove())
  markers = []

  const points = filteredPoints.value
  if (points.length === 0) return

  const bounds = []

  points.forEach((point, index) => {
    if (point.latitude && point.longitude) {
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-pin type-${point.type}">${index + 1}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30]
      })

      const marker = L.marker([point.latitude, point.longitude], { icon })
        .addTo(map)
        .bindPopup(createPopupContent(point))

      markers.push(marker)
      bounds.push([point.latitude, point.longitude])
    }
  })

  if (bounds.length > 0) {
    map.fitBounds(bounds, { padding: [50, 50] })
  }
}

function createPopupContent(point) {
  return `
    <div class="popup-content">
      <h4>${point.name}</h4>
      <p><strong>类型:</strong> ${getTypeText(point.type)}</p>
      <p><strong>日期:</strong> ${point.date}</p>
      ${point.start_time ? `<p><strong>时间:</strong> ${point.start_time} - ${point.end_time}</p>` : ''}
      ${point.cost ? `<p><strong>费用:</strong> ¥${point.cost}</p>` : ''}
      ${point.address ? `<p><strong>地址:</strong> ${point.address}</p>` : ''}
    </div>
  `
}

function focusPoint(point) {
  if (map && point.latitude && point.longitude) {
    map.setView([point.latitude, point.longitude], 14)
    const marker = markers[filteredPoints.value.indexOf(point)]
    if (marker) {
      marker.openPopup()
    }
  }
}

watch(selectedDayId, () => {
  renderMarkers()
})

function formatDate(date) {
  return dayjs(date).format('YYYY-MM-DD')
}

function getTypeText(type) {
  const map = { attraction: '景点', food: '餐饮', hotel: '住宿', transport: '交通' }
  return map[type] || type
}

function goBack() {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.map-container {
  position: relative;
  height: 500px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;

  .map {
    width: 100%;
    height: 100%;
  }

  .map-empty {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: #909399;

    .el-icon {
      font-size: 48px;
      margin-bottom: 12px;
      opacity: 0.5;
    }
  }
}

.points-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.point-card {
  padding: 16px;
  cursor: pointer;

  .point-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;

    .point-type {
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 4px;
      color: #fff;

      &.type-attraction { background: #409eff; }
      &.type-food { background: #67c23a; }
      &.type-hotel { background: #e6a23c; }
      &.type-transport { background: #f56c6c; }
    }

    .point-name {
      font-size: 15px;
      font-weight: 500;
      color: #303133;
    }
  }

  .point-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 13px;
    color: #909399;
    margin-bottom: 8px;

    span {
      display: flex;
      align-items: center;
      gap: 4px;

      .el-icon {
        font-size: 12px;
      }
    }
  }

  .point-address {
    font-size: 12px;
    color: #606266;
    display: flex;
    align-items: center;
    gap: 4px;

    .el-icon {
      font-size: 12px;
      color: #409eff;
    }
  }
}
</style>

<style>
.custom-marker {
  background: transparent !important;
  border: none !important;
}

.marker-pin {
  width: 30px;
  height: 30px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

  &.type-attraction { background: #409eff; }
  &.type-food { background: #67c23a; }
  &.type-hotel { background: #e6a23c; }
  &.type-transport { background: #f56c6c; }

  span {
    transform: rotate(45deg);
  }
}

.popup-content {
  h4 {
    margin: 0 0 8px 0;
    font-size: 16px;
    color: #303133;
  }

  p {
    margin: 4px 0;
    font-size: 13px;
    color: #606266;

    strong {
      color: #303133;
    }
  }
}
</style>
