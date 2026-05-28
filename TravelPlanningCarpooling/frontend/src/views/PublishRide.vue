<template>
  <div class="publish-ride-container">
    <el-card shadow="never" class="main-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#409EFF"><Car /></el-icon>
          <span>发布行程</span>
        </div>
      </template>
      <el-row :gutter="24">
        <el-col :xs="24" :md="12" class="map-column">
          <div class="map-section">
            <div class="section-title">
              <el-icon :size="16"><Position /></el-icon>
              <span>选择位置</span>
            </div>
            <div class="map-hint">
              <el-tag size="small" type="info">点击地图设置出发地（蓝）和目的地（橙）</el-tag>
            </div>
            <div class="mock-map-wrapper">
              <div class="mock-map">
                <canvas
                  ref="canvasRef"
                  width="800"
                  height="400"
                  @click="handleMapClick"
                ></canvas>
                <div
                  v-if="departureMarker"
                  class="map-marker departure-marker"
                  :style="departureMarker.style"
                >
                  <el-icon :size="32" color="#409EFF"><Location /></el-icon>
                  <div class="marker-label">出发</div>
                </div>
                <div
                  v-if="destinationMarker"
                  class="map-marker destination-marker"
                  :style="destinationMarker.style"
                >
                  <el-icon :size="32" color="#E6A23C"><Location /></el-icon>
                  <div class="marker-label">目的</div>
                </div>
                <svg v-if="departureMarker && destinationMarker" class="route-line">
                  <line
                    :x1="departureMarker.x"
                    :y1="departureMarker.y"
                    :x2="destinationMarker.x"
                    :y2="destinationMarker.y"
                    stroke="#409EFF"
                    stroke-width="3"
                    stroke-dasharray="8,4"
                  />
                </svg>
              </div>
            </div>
            <div class="coordinates-display">
              <div class="coord-item">
                <el-tag type="primary" size="small">出发地坐标</el-tag>
                <span class="coord-value">
                  {{ form.departure_lng ? `经度: ${form.departure_lng.toFixed(4)}` : '--' }}
                  {{ form.departure_lat ? `纬度: ${form.departure_lat.toFixed(4)}` : '--' }}
                </span>
              </div>
              <div class="coord-item">
                <el-tag type="warning" size="small">目的地坐标</el-tag>
                <span class="coord-value">
                  {{ form.destination_lng ? `经度: ${form.destination_lng.toFixed(4)}` : '--' }}
                  {{ form.destination_lat ? `纬度: ${form.destination_lat.toFixed(4)}` : '--' }}
                </span>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :md="12" class="form-column">
          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-position="top"
            class="ride-form"
          >
            <el-form-item label="选择车辆" prop="vehicle_id">
              <el-select
                v-model="form.vehicle_id"
                placeholder="请选择车辆"
                style="width: 100%"
                :loading="vehiclesLoading"
              >
                <el-option
                  v-for="vehicle in vehicles"
                  :key="vehicle.id"
                  :label="`${vehicle.brand} ${vehicle.model} (${vehicle.plate_number}) - ${vehicle.seats}座`"
                  :value="vehicle.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="出发地" prop="departure">
              <el-input
                v-model="form.departure"
                placeholder="请输入出发地名称"
                :prefix-icon="Location"
                clearable
              />
            </el-form-item>
            <el-form-item label="目的地" prop="destination">
              <el-input
                v-model="form.destination"
                placeholder="请输入目的地名称"
                :prefix-icon="Location"
                clearable
              />
            </el-form-item>
            <el-row :gutter="12">
              <el-col :span="12">
                <el-form-item label="出发时间" prop="departure_time">
                  <el-date-picker
                    v-model="form.departure_time"
                    type="datetime"
                    placeholder="选择出发时间"
                    style="width: 100%"
                    format="YYYY-MM-DD HH:mm"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    :disabled-date="disabledDate"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="可用座位" prop="available_seats">
                  <el-input-number
                    v-model="form.available_seats"
                    :min="1"
                    :max="20"
                    :controls="true"
                    placeholder="座位数"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="价格 (元/人)" prop="price_per_person">
              <el-input-number
                v-model="form.price_per_person"
                :min="0"
                :step="5"
                :precision="0"
                placeholder="请输入价格"
                style="width: 100%"
              >
                <template #prepend>
                  <el-icon><Price /></el-icon>
                </template>
              </el-input-number>
            </el-form-item>
            <el-form-item label="行程说明" prop="description">
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="4"
                placeholder="请输入行程说明，如：行李要求、是否可带宠物等"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                style="width: 100%"
                :loading="submitting"
                @click="handleSubmit"
              >
                <el-icon><Plus /></el-icon>
                发布行程
              </el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import {
  Location,
  Price,
  Car,
  Map,
  Plus
} from '@element-plus/icons-vue'
import { rideApi, vehicleApi } from '../api'
import type { Vehicle } from '../types'

const router = useRouter()
const formRef = ref<FormInstance>()
const canvasRef = ref<HTMLCanvasElement>()
const submitting = ref(false)
const vehiclesLoading = ref(false)
const vehicles = ref<Vehicle[]>([])
const clickMode = ref<'departure' | 'destination'>('departure')

const departureMarker = ref<{ x: number; y: number; style: string } | null>(null)
const destinationMarker = ref<{ x: number; y: number; style: string } | null>(null)

const form = reactive({
  vehicle_id: undefined as number | undefined,
  departure: '',
  departure_lng: undefined as number | undefined,
  departure_lat: undefined as number | undefined,
  destination: '',
  destination_lng: undefined as number | undefined,
  destination_lat: undefined as number | undefined,
  departure_time: '',
  available_seats: undefined as number | undefined,
  price_per_person: undefined as number | undefined,
  description: ''
})

const rules: FormRules = {
  vehicle_id: [{ required: true, message: '请选择车辆', trigger: 'change' }],
  departure: [{ required: true, message: '请输入出发地', trigger: 'blur' }],
  destination: [{ required: true, message: '请输入目的地', trigger: 'blur' }],
  departure_time: [{ required: true, message: '请选择出发时间', trigger: 'change' }],
  available_seats: [{ required: true, message: '请输入可用座位数', trigger: 'blur' }],
  price_per_person: [{ required: true, message: '请输入价格', trigger: 'blur' }]
}

onMounted(() => {
  fetchVehicles()
  nextTick(() => {
    drawMockMap()
  })
})

async function fetchVehicles() {
  vehiclesLoading.value = true
  try {
    const res = await vehicleApi.getList()
    if (res.code === 0 && res.data) {
      vehicles.value = res.data.list || res.data || []
    }
  } catch (error) {
    console.error('Failed to fetch vehicles:', error)
  } finally {
    vehiclesLoading.value = false
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
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(80, 120)
  ctx.quadraticCurveTo(400, 60, 720, 180)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(60, 280)
  ctx.quadraticCurveTo(350, 360, 680, 260)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(120, 360)
  ctx.quadraticCurveTo(420, 180, 760, 360)
  ctx.stroke()

  ctx.fillStyle = '#d3d4d6'
  for (let i = 0; i < 12; i++) {
    const x = Math.random() * 650 + 75
    const y = Math.random() * 280 + 60
    const w = Math.random() * 70 + 50
    const h = Math.random() * 50 + 35
    ctx.fillRect(x, y, w, h)
  }

  ctx.fillStyle = '#67c23a'
  ctx.font = 'bold 14px sans-serif'
  ctx.fillText('N', 770, 30)
  ctx.beginPath()
  ctx.moveTo(775, 35)
  ctx.lineTo(770, 55)
  ctx.lineTo(780, 55)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = '#909399'
  ctx.font = '12px sans-serif'
  ctx.fillText('点击设置出发地 →', 20, 30)
  ctx.fillText('再点击设置目的地 →', 20, 50)
}

function handleMapClick(e: MouseEvent) {
  const rect = canvasRef.value?.getBoundingClientRect()
  if (!rect) return

  const scaleX = 800 / rect.width
  const scaleY = 400 / rect.height
  const x = (e.clientX - rect.left) * scaleX
  const y = (e.clientY - rect.top) * scaleY

  const lng = 116.3 + (x / 800) * 0.15
  const lat = 39.95 - (y / 400) * 0.1

  if (clickMode.value === 'departure') {
    form.departure_lng = lng
    form.departure_lat = lat
    departureMarker.value = {
      x,
      y,
      style: `left: ${(x / 800) * 100}%; top: ${(y / 400) * 100}%;`
    }
    clickMode.value = 'destination'
    ElMessage.success('出发地已设置，请点击设置目的地')
  } else {
    form.destination_lng = lng
    form.destination_lat = lat
    destinationMarker.value = {
      x,
      y,
      style: `left: ${(x / 800) * 100}%; top: ${(y / 400) * 100}%;`
    }
    clickMode.value = 'departure'
    ElMessage.success('目的地已设置')
  }
}

function disabledDate(time: Date) {
  return time.getTime() < Date.now() - 86400000
}

async function handleSubmit() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      if (!form.departure_lng || !form.departure_lat) {
        ElMessage.warning('请在地图上点击设置出发地')
        return
      }
      if (!form.destination_lng || !form.destination_lat) {
        ElMessage.warning('请在地图上点击设置目的地')
        return
      }

      submitting.value = true
      try {
        const res = await rideApi.create({
          ...form,
          vehicle_id: form.vehicle_id,
          available_seats: form.available_seats,
          price_per_person: form.price_per_person
        })

        if (res.code === 0) {
          ElMessage.success('行程发布成功')
          router.push('/')
        }
      } catch (error) {
        ElMessage.error('发布失败，请稍后重试')
      } finally {
        submitting.value = false
      }
    }
  })
}
</script>

<style scoped>
.publish-ride-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.main-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
}

.map-column,
.form-column {
  padding: 10px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.map-hint {
  margin-bottom: 16px;
}

.mock-map-wrapper {
  margin-bottom: 16px;
}

.mock-map {
  position: relative;
  width: 100%;
  max-width: 800px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #dcdfe6;
  cursor: crosshair;
}

.mock-map canvas {
  display: block;
  width: 100%;
  height: auto;
}

.map-marker {
  position: absolute;
  transform: translate(-50%, -100%);
  z-index: 10;
  pointer-events: none;
}

.marker-label {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  color: #fff;
  white-space: nowrap;
}

.departure-marker .marker-label {
  background: #409EFF;
}

.destination-marker .marker-label {
  background: #E6A23C;
}

.route-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
}

.coordinates-display {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
}

.coord-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.coord-item:last-child {
  margin-bottom: 0;
}

.coord-value {
  font-size: 13px;
  color: #606266;
  font-family: 'Courier New', monospace;
}

.ride-form {
  padding: 10px;
}

:deep(.el-input-number) {
  width: 100%;
}
</style>
