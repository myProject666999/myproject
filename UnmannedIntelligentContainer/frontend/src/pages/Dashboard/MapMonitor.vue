<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, RefreshCw, Package, AlertTriangle, CheckCircle, Clock } from 'lucide-vue-next'
import { getAllContainers } from '@/api/container'
import { getLowStockItems } from '@/api/inventory'
import type { Container, LowStockItem } from '@/types'
import StatusTag from '@/components/StatusTag.vue'

const loading = ref(false)
const containers = ref<Container[]>([])
const lowStockItems = ref<LowStockItem[]>([])
const searchKeyword = ref('')
const filterArea = ref('')
const filterStatus = ref<number | ''>('')
const selectedContainer = ref<Container | null>(null)

const areaOptions = computed(() => {
  const areas = [...new Set(containers.value.map(c => c.area))]
  return areas.map(area => ({ label: area, value: area }))
})

const statusOptions = [
  { label: '正常', value: 1 },
  { label: '异常', value: 0 }
]

const stats = computed(() => {
  const total = containers.value.length
  const normal = containers.value.filter(c => c.status === 1).length
  const warning = containers.value.filter(c => c.status === 0).length
  const lowStock = lowStockItems.value.length
  return { total, normal, warning, lowStock }
})

const filteredContainers = computed(() => {
  return containers.value.filter(container => {
    const matchKeyword = !searchKeyword.value ||
      container.container_no.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      container.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      container.address.toLowerCase().includes(searchKeyword.value.toLowerCase())
    const matchArea = !filterArea.value || container.area === filterArea.value
    const matchStatus = filterStatus.value === '' || container.status === filterStatus.value
    return matchKeyword && matchArea && matchStatus
  })
})

const mapBounds = computed(() => {
  if (containers.value.length === 0) {
    return { minLng: 116, maxLng: 117, minLat: 39, maxLat: 40 }
  }
  const lngs = containers.value.map(c => c.longitude)
  const lats = containers.value.map(c => c.latitude)
  const padding = 0.1
  return {
    minLng: Math.min(...lngs) - padding,
    maxLng: Math.max(...lngs) + padding,
    minLat: Math.min(...lats) - padding,
    maxLat: Math.max(...lats) + padding
  }
})

function getMarkerPosition(container: Container) {
  const { minLng, maxLng, minLat, maxLat } = mapBounds.value
  const x = ((container.longitude - minLng) / (maxLng - minLng)) * 100
  const y = ((maxLat - container.latitude) / (maxLat - minLat)) * 100
  return { left: `${x}%`, top: `${y}%` }
}

type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'default'

function getStatusInfo(status: number): { label: string; type: StatusType } {
  return status === 1
    ? { label: '正常', type: 'success' }
    : { label: '异常', type: 'warning' }
}

function hasLowStock(containerId: number) {
  return lowStockItems.value.some(item => item.container_id === containerId)
}

async function fetchData() {
  loading.value = true
  try {
    const [containerRes, lowStockRes] = await Promise.all([
      getAllContainers(),
      getLowStockItems()
    ])
    containers.value = containerRes || []
    lowStockItems.value = lowStockRes || []
  } catch (error) {
    ElMessage.error('获取数据失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

function handleRefresh() {
  fetchData()
  ElMessage.success('数据已刷新')
}

function handleContainerClick(container: Container) {
  selectedContainer.value = container
}

function formatCoordinate(value: number) {
  return value.toFixed(6)
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="space-y-6 p-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">集装箱地图监控</h1>
      <el-button type="primary" :icon="RefreshCw" @click="handleRefresh" :loading="loading">
        刷新数据
      </el-button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <el-card shadow="hover" class="stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">总集装箱数</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white mt-1">{{ stats.total }}</p>
          </div>
          <div class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Package class="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">正常运行</p>
            <p class="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{{ stats.normal }}</p>
          </div>
          <div class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle class="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">异常告警</p>
            <p class="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{{ stats.warning }}</p>
          </div>
          <div class="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
            <AlertTriangle class="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">库存不足</p>
            <p class="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">{{ stats.lowStock }}</p>
          </div>
          <div class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Clock class="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </el-card>
    </div>

    <el-card shadow="hover">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold text-gray-900 dark:text-white">集装箱分布地图</span>
          <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span class="flex items-center gap-1">
              <span class="w-3 h-3 rounded-full bg-green-500"></span> 正常
            </span>
            <span class="flex items-center gap-1">
              <span class="w-3 h-3 rounded-full bg-yellow-500"></span> 异常
            </span>
            <span class="flex items-center gap-1">
              <span class="w-3 h-3 rounded-full bg-red-500"></span> 库存不足
            </span>
          </div>
        </div>
      </template>

      <div class="map-container relative">
        <div class="map-grid">
          <div v-for="i in 10" :key="'h-' + i" class="grid-line-h" :style="{ top: `${i * 10}%` }"></div>
          <div v-for="i in 10" :key="'v-' + i" class="grid-line-v" :style="{ left: `${i * 10}%` }"></div>
        </div>

        <div
          v-for="container in containers"
          :key="container.id"
          class="map-marker absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125 z-10"
          :style="getMarkerPosition(container)"
          @click="handleContainerClick(container)"
        >
          <div
            class="marker-pin w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
            :class="{
              'bg-green-500': container.status === 1 && !hasLowStock(container.id),
              'bg-yellow-500': container.status === 0,
              'bg-red-500': hasLowStock(container.id)
            }"
          >
            <span class="text-white text-xs font-bold">{{ container.container_no.slice(-2) }}</span>
          </div>
          <div
            class="pulse-ring absolute inset-0 rounded-full animate-ping opacity-60"
            :class="{
              'bg-green-400': container.status === 1 && !hasLowStock(container.id),
              'bg-yellow-400': container.status === 0,
              'bg-red-400': hasLowStock(container.id)
            }"
          ></div>
          <div class="marker-tooltip absolute -top-16 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-800 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
            <p class="font-semibold">{{ container.name }}</p>
            <p class="text-gray-300">{{ container.container_no }}</p>
            <p class="text-gray-400">经纬度: {{ formatCoordinate(container.longitude) }}, {{ formatCoordinate(container.latitude) }}</p>
            <div class="tooltip-arrow absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-800 rotate-45"></div>
          </div>
        </div>

        <div v-if="selectedContainer" class="selected-info absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-xs">
          <div class="flex items-start justify-between mb-2">
            <h3 class="font-semibold text-gray-900 dark:text-white">{{ selectedContainer.name }}</h3>
            <el-button size="small" text @click="selectedContainer = null">关闭</el-button>
          </div>
          <div class="space-y-1 text-sm text-gray-600 dark:text-gray-300">
            <p><span class="text-gray-500 dark:text-gray-400">编号:</span> {{ selectedContainer.container_no }}</p>
            <p><span class="text-gray-500 dark:text-gray-400">地址:</span> {{ selectedContainer.address }}</p>
            <p><span class="text-gray-500 dark:text-gray-400">区域:</span> {{ selectedContainer.area }}</p>
            <p><span class="text-gray-500 dark:text-gray-400">容量:</span> {{ selectedContainer.capacity }}</p>
            <p><span class="text-gray-500 dark:text-gray-400">经纬度:</span> {{ formatCoordinate(selectedContainer.longitude) }}, {{ formatCoordinate(selectedContainer.latitude) }}</p>
            <p class="flex items-center gap-1">
              <span class="text-gray-500 dark:text-gray-400">状态:</span>
              <StatusTag
                :status="getStatusInfo(selectedContainer.status).type"
                :label="getStatusInfo(selectedContainer.status).label"
              />
            </p>
            <p v-if="hasLowStock(selectedContainer.id)" class="text-red-500 font-medium">
              ⚠️ 存在库存不足商品
            </p>
          </div>
        </div>
      </div>
    </el-card>

    <el-card shadow="hover">
      <template #header>
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <span class="font-semibold text-gray-900 dark:text-white">集装箱列表</span>
          <div class="flex flex-wrap items-center gap-3">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索编号/名称/地址"
              :prefix-icon="Search"
              clearable
              class="w-64"
            />
            <el-select
              v-model="filterArea"
              placeholder="选择区域"
              clearable
              class="w-40"
            >
              <el-option
                v-for="option in areaOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
            <el-select
              v-model="filterStatus"
              placeholder="选择状态"
              clearable
              class="w-32"
            >
              <el-option
                v-for="option in statusOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </div>
        </div>
      </template>

      <el-table
        :data="filteredContainers"
        v-loading="loading"
        stripe
        style="width: 100%"
        @row-click="handleContainerClick"
        class="cursor-pointer"
      >
        <el-table-column prop="container_no" label="集装箱编号" min-width="120" />
        <el-table-column prop="name" label="名称" min-width="150" />
        <el-table-column prop="area" label="区域" min-width="100">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.area }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="地址" min-width="200" show-overflow-tooltip />
        <el-table-column label="经纬度" min-width="250">
          <template #default="{ row }">
            <span class="text-sm text-gray-600 dark:text-gray-300 font-mono">
              {{ formatCoordinate(row.longitude) }}, {{ formatCoordinate(row.latitude) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="capacity" label="容量" width="100" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <StatusTag
              :status="getStatusInfo(row.status).type"
              :label="getStatusInfo(row.status).label"
            />
          </template>
        </el-table-column>
        <el-table-column label="库存状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag
              v-if="hasLowStock(row.id)"
              size="small"
              type="danger"
              effect="light"
            >
              库存不足
            </el-tag>
            <span v-else class="text-green-600 dark:text-green-400 text-sm">正常</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.stat-card :deep(.el-card__body) {
  padding: 20px;
}

.map-container {
  height: 480px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.dark .map-container {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}

.map-grid {
  position: absolute;
  inset: 0;
}

.grid-line-h {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(59, 130, 246, 0.1);
}

.grid-line-v {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(59, 130, 246, 0.1);
}

.dark .grid-line-h,
.dark .grid-line-v {
  background: rgba(59, 130, 246, 0.2);
}

.map-marker {
  width: 24px;
  height: 24px;
}

.map-marker:hover .marker-tooltip {
  opacity: 1;
}

.marker-pin {
  position: relative;
  z-index: 2;
}

.pulse-ring {
  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  75%, 100% {
    transform: scale(2.5);
    opacity: 0;
  }
}

.marker-tooltip {
  z-index: 30;
}

.marker-tooltip::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 8px;
  height: 8px;
  background: inherit;
}
</style>
