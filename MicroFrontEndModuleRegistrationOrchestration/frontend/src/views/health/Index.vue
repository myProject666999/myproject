<template>
  <div class="page-container health-page">
    <PageHeader title="健康监控" description="监控微前端应用的健康状态，支持自动检查和自动下线">
      <template #actions>
        <el-button :icon="Refresh" @click="fetchData">刷新</el-button>
        <el-button type="primary" :icon="VideoPlay" @click="triggerAllCheck">手动检查全部</el-button>
      </template>
    </PageHeader>

    <el-row :gutter="16" class="stat-row">
      <el-col :span="6">
        <div class="stat-card info">
          <div class="stat-icon">
            <el-icon :size="32"><Grid /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ summary?.total || 0 }}</div>
            <div class="stat-label">应用总数</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card success">
          <div class="stat-icon">
            <el-icon :size="32"><CircleCheck /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ summary?.healthy || 0 }}</div>
            <div class="stat-label">健康</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card danger">
          <div class="stat-icon">
            <el-icon :size="32"><CircleClose /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ summary?.unhealthy || 0 }}</div>
            <div class="stat-label">异常</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card warning">
          <div class="stat-icon">
            <el-icon :size="32"><Warning /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ summary?.unknown || 0 }}</div>
            <div class="stat-label">未知</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-card class="chart-card">
      <template #header>
        <div class="card-header">
          <span>健康状态趋势（近24小时）</span>
          <el-select v-model="trendAppId" placeholder="选择应用" clearable style="width: 200px" @change="fetchTrend">
            <el-option
              v-for="app in apps"
              :key="app.id"
              :label="`${app.appName} (${app.appCode})`"
              :value="app.id"
            />
          </el-select>
        </div>
      </template>
      <v-chart class="trend-chart" :option="chartOption" autoresize />
    </el-card>

    <div class="table-toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索应用编码"
          :prefix-icon="Search"
          clearable
          style="width: 240px"
          @keyup.enter="fetchHealthList"
          @clear="fetchHealthList"
        />
        <el-select v-model="statusFilter" placeholder="健康状态" clearable style="width: 140px">
          <el-option label="健康" :value="1" />
          <el-option label="异常" :value="0" />
          <el-option label="未知" :value="2" />
        </el-select>
      </div>
    </div>

    <el-table
      v-loading="loading"
      :data="healthList"
      border
      stripe
      style="width: 100%"
    >
      <el-table-column prop="appCode" label="应用编码" width="140" />
      <el-table-column prop="checkUrl" label="检查URL" min-width="240" show-overflow-tooltip />
      <el-table-column prop="interval" label="间隔(秒)" width="100" />
      <el-table-column prop="timeout" label="超时(毫秒)" width="120" />
      <el-table-column label="健康状态" width="100">
        <template #default="{ row }">
          <StatusTag :status="row.healthStatus" type="health" show-icon />
        </template>
      </el-table-column>
      <el-table-column label="响应时间" width="120">
        <template #default="{ row }">
          <span :class="{ 'text-danger': row.responseTime > 2000 }">
            {{ row.responseTime ? row.responseTime + 'ms' : '-' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="最后检查时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.lastCheckTime) }}
        </template>
      </el-table-column>
      <el-table-column label="自动下线" width="100">
        <template #default="{ row }">
          <el-switch
            v-model="row.autoOffline"
            :active-value="1"
            :inactive-value="0"
            @change="(val: number) => handleAutoOffline(row, val)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleTriggerCheck(row)">检查</el-button>
          <el-button type="primary" link @click="viewHistory(row)">历史记录</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.size"
      :total="pagination.total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      class="pagination"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <el-dialog v-model="historyDialogVisible" title="健康检查历史" width="800px">
      <el-table :data="historyList" border>
        <el-table-column label="健康状态" width="100">
          <template #default="{ row }">
            <StatusTag :status="row.healthStatus" type="health" />
          </template>
        </el-table-column>
        <el-table-column label="响应时间" width="120">
          <template #default="{ row }">
            {{ row.responseTime ? row.responseTime + 'ms' : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="checkTime" label="检查时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.checkTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="errorMessage" label="错误信息" min-width="200" show-overflow-tooltip />
      </el-table>
      <el-pagination
        v-model:current-page="historyPagination.current"
        v-model:page-size="historyPagination.size"
        :total="historyPagination.total"
        layout="prev, pager, next, total"
        class="history-pagination"
        @current-change="handleHistoryPageChange"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { Search, Refresh, VideoPlay, Grid, CircleCheck, CircleClose, Warning } from '@element-plus/icons-vue'
import * as healthApi from '@/api/health'
import * as appApi from '@/api/app'
import { formatDate } from '@/utils/format'
import { subscribe } from '@/utils/websocket'
import type { HealthCheck, HealthCheckHistory, MicroApp } from '@/types'

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent
])

const loading = ref(false)
const searchKeyword = ref('')
const statusFilter = ref<number | null>(null)
const trendAppId = ref<number | null>(null)
const healthList = ref<HealthCheck[]>([])
const apps = ref<MicroApp[]>([])
const historyList = ref<HealthCheckHistory[]>([])
const historyDialogVisible = ref(false)
const currentCheckId = ref<number | null>(null)
const summary = ref<any>(null)
const trendData = ref<any>(null)
let unsubscribe: (() => void) | null = null
let refreshTimer: ReturnType<typeof setTimeout> | null = null

function debouncedRefresh() {
  if (refreshTimer) clearTimeout(refreshTimer)
  refreshTimer = setTimeout(() => {
    fetchHealthList()
    fetchSummary()
    fetchTrend()
  }, 3000)
}

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const historyPagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const chartOption = computed(() => {
  if (!trendData.value) {
    return {
      title: { text: '暂无数据', left: 'center', top: 'center', textStyle: { color: '#909399', fontSize: 16, fontWeight: 'normal' } }
    }
  }
  
  return {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['健康', '异常', '平均响应时间'],
      top: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trendData.value.times
    },
    yAxis: [
      {
        type: 'value',
        name: '数量',
        position: 'left'
      },
      {
        type: 'value',
        name: '响应时间(ms)',
        position: 'right',
        axisLine: { lineStyle: { color: '#909399' } }
      }
    ],
    series: [
      {
        name: '健康',
        type: 'line',
        smooth: true,
        data: trendData.value.healthyCounts,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
              { offset: 1, color: 'rgba(103, 194, 58, 0.05)' }
            ]
          }
        },
        lineStyle: { color: '#67c23a', width: 2 }
      },
      {
        name: '异常',
        type: 'line',
        smooth: true,
        data: trendData.value.unhealthyCounts,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(245, 108, 108, 0.3)' },
              { offset: 1, color: 'rgba(245, 108, 108, 0.05)' }
            ]
          }
        },
        lineStyle: { color: '#f56c6c', width: 2 }
      },
      {
        name: '平均响应时间',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: trendData.value.avgResponseTimes,
        lineStyle: { color: '#409eff', width: 2, type: 'dashed' }
      }
    ]
  }
})

async function fetchData() {
  await Promise.all([
    fetchApps(),
    fetchSummary(),
    fetchHealthList(),
    fetchTrend()
  ])
}

async function fetchApps() {
  apps.value = await appApi.getAllApps()
}

async function fetchSummary() {
  summary.value = await healthApi.getHealthSummary()
}

async function fetchHealthList() {
  loading.value = true
  try {
    const result = await healthApi.getHealthList({
      current: pagination.current,
      size: pagination.size,
      keyword: searchKeyword.value,
      healthStatus: statusFilter.value ?? undefined
    }) as any
    healthList.value = result.records
    pagination.total = result.total
    pagination.current = result.current
    pagination.size = result.size
  } finally {
    loading.value = false
  }
}

async function fetchTrend() {
  trendData.value = await healthApi.getHealthTrend(trendAppId.value ?? undefined, 24)
}

function handleSizeChange(size: number) {
  pagination.size = size
  pagination.current = 1
  fetchHealthList()
}

function handleCurrentChange(page: number) {
  pagination.current = page
  fetchHealthList()
}

async function handleTriggerCheck(row: HealthCheck) {
  try {
    await healthApi.triggerCheck(row.id)
    ElMessage.success('检查已触发')
    setTimeout(() => {
      fetchHealthList()
      fetchSummary()
    }, 2000)
  } catch (e: any) {
    ElMessage.error(e.message || '检查失败')
  }
}

async function triggerAllCheck() {
  try {
    await healthApi.triggerAllCheck()
    ElMessage.success('全部检查已触发')
    setTimeout(() => {
      fetchHealthList()
      fetchSummary()
      fetchTrend()
    }, 2000)
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败')
  }
}

async function handleAutoOffline(row: HealthCheck, val: number) {
  try {
    await healthApi.toggleAutoOffline(row.id, val)
    ElMessage.success(val === 1 ? '已开启自动下线' : '已关闭自动下线')
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败')
    row.autoOffline = val === 1 ? 0 : 1
  }
}

async function viewHistory(row: HealthCheck) {
  currentCheckId.value = row.id
  historyPagination.current = 1
  historyPagination.total = 0
  await fetchHistory()
  historyDialogVisible.value = true
}

async function fetchHistory() {
  if (!currentCheckId.value) return
  const result = await healthApi.getHealthHistory(currentCheckId.value, {
    current: historyPagination.current,
    size: historyPagination.size
  }) as any
  historyList.value = result.records
  historyPagination.total = result.total
  historyPagination.current = result.current
  historyPagination.size = result.size
}

function handleHistoryPageChange(page: number) {
  historyPagination.current = page
  fetchHistory()
}

function handleWebSocketMessage(message: any) {
  if (message.type === 'HEALTH_CHECK_RESULT' || message.type === 'HEALTH_ALERT') {
    debouncedRefresh()
  }
}

watch(trendAppId, () => {
  fetchTrend()
})

onMounted(() => {
  fetchData()
  unsubscribe = subscribe('/topic/health', handleWebSocketMessage)
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
  if (refreshTimer) {
    clearTimeout(refreshTimer)
    refreshTimer = null
  }
})
</script>

<style lang="scss" scoped>
.stat-row {
  margin-bottom: 20px;

  .stat-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    border-radius: 8px;
    color: #fff;

    .stat-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-content {
      .stat-number {
        font-size: 28px;
        font-weight: 600;
        line-height: 1.2;
      }

      .stat-label {
        font-size: 14px;
        opacity: 0.9;
        margin-top: 4px;
      }
    }

    &.info {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    &.success {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    }

    &.danger {
      background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
    }

    &.warning {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }
  }
}

.chart-card {
  margin-bottom: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }

  .trend-chart {
    height: 300px;
  }
}

.pagination,
.history-pagination {
  margin-top: 20px;
  justify-content: flex-end;
}

.text-danger {
  color: #f56c6c;
  font-weight: 600;
}
</style>
