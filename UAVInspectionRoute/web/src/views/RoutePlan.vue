<template>
  <div class="route-plan-container">
    <div class="map-area" id="mapContainer"></div>
    <div class="panel-area">
      <el-card shadow="never">
        <template #header>
          <div class="panel-header">
            <span>航线规划</span>
            <div>
              <el-button size="small" @click="handleNew">新建</el-button>
              <el-button size="small" type="primary" :loading="saving" @click="handleSave">保存</el-button>
            </div>
          </div>
        </template>

        <el-form ref="routeFormRef" :model="routeForm" :rules="routeRules" label-width="80px" size="small">
          <el-form-item label="航线名称" prop="name">
            <el-input v-model="routeForm.name" placeholder="请输入航线名称" />
          </el-form-item>
          <el-form-item label="巡检区域" prop="areaId">
            <el-select v-model="routeForm.areaId" placeholder="选择区域" style="width: 100%" @change="loadNoFlyZones">
              <el-option v-for="a in areaList" :key="a.id" :label="a.name" :value="a.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="飞行高度" prop="altitude">
            <el-input-number v-model="routeForm.altitude" :min="10" :max="500" :step="10" style="width: 100%" />
          </el-form-item>
          <el-form-item label="飞行速度" prop="speed">
            <el-input-number v-model="routeForm.speed" :min="1" :max="20" :step="1" style="width: 100%" />
          </el-form-item>
          <el-form-item label="重叠率" prop="overlapRate">
            <el-slider v-model="routeForm.overlapRate" :min="0" :max="90" :step="5" show-input size="small" />
          </el-form-item>
        </el-form>
      </el-card>

      <el-card shadow="never" style="margin-top: 12px">
        <template #header>
          <div class="panel-header">
            <span>航线点（{{ waypoints.length }}）</span>
            <el-button size="small" type="danger" @click="clearWaypoints" :disabled="waypoints.length === 0">清空</el-button>
          </div>
        </template>
        <div class="waypoint-tip">点击地图添加航线点，拖拽点位调整位置</div>
        <el-table :data="waypoints" size="small" max-height="280" border>
          <el-table-column type="index" label="序号" width="55" />
          <el-table-column label="经度" prop="lng" width="100">
            <template #default="{ row }">{{ row.lng.toFixed(6) }}</template>
          </el-table-column>
          <el-table-column label="纬度" prop="lat" width="100">
            <template #default="{ row }">{{ row.lat.toFixed(6) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="90">
            <template #default="{ $index }">
              <el-button type="danger" link size="small" @click="removeWaypoint($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-button size="small" style="margin-top: 8px; width: 100%" type="warning" @click="handleCheckNoFlyZone" :loading="checking">禁飞区校验</el-button>
      </el-card>

      <el-card v-if="conflictResult" shadow="never" style="margin-top: 12px">
        <template #header><span>校验结果</span></template>
        <el-alert v-if="conflictResult.conflict" type="error" :closable="false" :description="conflictResult.message" show-icon />
        <el-alert v-else type="success" :closable="false" description="航线未与禁飞区冲突" show-icon />
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import L from 'leaflet'
import * as turf from '@turf/turf'
import { getAreaList } from '../api/area'
import { getNoFlyZoneList } from '../api/noFlyZone'
import { createRoute, updateRoute, checkNoFlyZoneConflict } from '../api/route'

let map = null
let routeLine = null
let markerGroup = null
let noFlyZoneLayer = null

const saving = ref(false)
const checking = ref(false)
const conflictResult = ref(null)
const areaList = ref([])
const waypoints = ref([])
const routeFormRef = ref(null)

const routeForm = reactive({
  name: '',
  areaId: null,
  altitude: 100,
  speed: 5,
  overlapRate: 60
})

const routeRules = {
  name: [{ required: true, message: '请输入航线名称', trigger: 'blur' }],
  areaId: [{ required: true, message: '请选择巡检区域', trigger: 'change' }]
}

function initMap() {
  map = L.map('mapContainer', {
    center: [31.23, 121.47],
    zoom: 13,
    zoomControl: true
  })
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map)
  markerGroup = L.layerGroup().addTo(map)
  noFlyZoneLayer = L.layerGroup().addTo(map)
  map.on('click', onMapClick)
}

function onMapClick(e) {
  const { lat, lng } = e.latlng
  waypoints.value.push({ lat, lng })
  drawRoute()
}

function drawRoute() {
  markerGroup.clearLayers()
  if (routeLine) {
    map.removeLayer(routeLine)
    routeLine = null
  }
  waypoints.value.forEach((wp, idx) => {
    const marker = L.marker([wp.lat, wp.lng], { draggable: true })
      .bindTooltip(`点${idx + 1}`, { permanent: true, direction: 'top', className: 'waypoint-tooltip' })
    marker.on('dragend', (e) => {
      const pos = e.target.getLatLng()
      waypoints.value[idx] = { lat: pos.lat, lng: pos.lng }
      drawRouteLine()
    })
    markerGroup.addLayer(marker)
  })
  drawRouteLine()
}

function drawRouteLine() {
  if (routeLine) {
    map.removeLayer(routeLine)
    routeLine = null
  }
  if (waypoints.value.length < 2) return
  const latlngs = waypoints.value.map(wp => [wp.lat, wp.lng])
  routeLine = L.polyline(latlngs, { color: '#1a73e8', weight: 3, dashArray: '8 4' }).addTo(map)
}

function removeWaypoint(index) {
  waypoints.value.splice(index, 1)
  drawRoute()
}

function clearWaypoints() {
  waypoints.value = []
  drawRoute()
  conflictResult.value = null
}

async function loadNoFlyZones() {
  noFlyZoneLayer.clearLayers()
  if (!routeForm.areaId) return
  try {
    const res = await getNoFlyZoneList({ areaId: routeForm.areaId })
    const zones = res.data.list || res.data || []
    zones.forEach(zone => {
      if (zone.shape === 'circle' && zone.center && zone.radius) {
        L.circle([zone.center.lat, zone.center.lng], {
          radius: zone.radius,
          color: '#f44336',
          fillColor: '#f44336',
          fillOpacity: 0.15,
          weight: 2
        }).addTo(noFlyZoneLayer).bindTooltip(zone.name || '禁飞区')
      } else if (zone.shape === 'polygon' && zone.coordinates) {
        const latlngs = zone.coordinates.map(c => [c.lat, c.lng])
        L.polygon(latlngs, {
          color: '#f44336',
          fillColor: '#f44336',
          fillOpacity: 0.15,
          weight: 2
        }).addTo(noFlyZoneLayer).bindTooltip(zone.name || '禁飞区')
      }
    })
  } catch {}
}

async function handleCheckNoFlyZone() {
  if (waypoints.value.length < 2) {
    ElMessage.warning('请至少添加2个航线点')
    return
  }
  checking.value = true
  try {
    const res = await checkNoFlyZoneConflict({
      areaId: routeForm.areaId,
      points: waypoints.value
    })
    conflictResult.value = res.data
    if (res.data.conflict && res.data.conflictSegments) {
      highlightConflict(res.data.conflictSegments)
    }
  } catch {
    conflictResult.value = { conflict: false }
  } finally {
    checking.value = false
  }
}

function highlightConflict(segments) {
  if (routeLine) {
    map.removeLayer(routeLine)
  }
  const latlngs = waypoints.value.map(wp => [wp.lat, wp.lng])
  routeLine = L.polyline(latlngs, { color: '#1a73e8', weight: 3, dashArray: '8 4' }).addTo(map)
  if (segments && segments.length > 0) {
    segments.forEach(seg => {
      const conflictLatLngs = [
        [waypoints.value[seg.from].lat, waypoints.value[seg.from].lng],
        [waypoints.value[seg.to].lat, waypoints.value[seg.to].lng]
      ]
      L.polyline(conflictLatLngs, { color: '#f44336', weight: 5 }).addTo(map)
    })
  }
}

function handleNew() {
  waypoints.value = []
  conflictResult.value = null
  Object.assign(routeForm, { name: '', areaId: null, altitude: 100, speed: 5, overlapRate: 60 })
  noFlyZoneLayer.clearLayers()
  drawRoute()
}

async function handleSave() {
  const valid = await routeFormRef.value.validate().catch(() => false)
  if (!valid) return
  if (waypoints.value.length < 2) {
    ElMessage.warning('请至少添加2个航线点')
    return
  }
  let hasGap = false
  for (let i = 0; i < waypoints.value.length; i++) {
    if (!waypoints.value[i].lat || !waypoints.value[i].lng) {
      hasGap = true
      break
    }
  }
  if (hasGap) {
    ElMessage.warning('航线点数据不完整')
    return
  }
  saving.value = true
  try {
    const data = {
      ...routeForm,
      points: waypoints.value.map((wp, idx) => ({ seq: idx + 1, lat: wp.lat, lng: wp.lng }))
    }
    await createRoute(data)
    ElMessage.success('航线保存成功')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await nextTick()
  initMap()
  try {
    const res = await getAreaList({ pageSize: 100 })
    areaList.value = res.data.list || res.data || []
  } catch {}
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style scoped>
.route-plan-container {
  display: flex;
  height: calc(100vh - 120px);
  gap: 12px;
}

.map-area {
  flex: 1;
  border-radius: 4px;
  overflow: hidden;
}

.panel-area {
  width: 380px;
  overflow-y: auto;
  padding-right: 4px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.waypoint-tip {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}
</style>

<style>
.waypoint-tooltip {
  background: #1a73e8 !important;
  color: #fff !important;
  border: none !important;
  font-size: 11px !important;
  padding: 2px 6px !important;
}
</style>
