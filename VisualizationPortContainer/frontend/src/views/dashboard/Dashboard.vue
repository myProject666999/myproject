<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <div class="header-title">
        <el-icon :size="28" color="#409eff"><DataAnalysis /></el-icon>
        <span>堆场可视化大屏</span>
      </div>
      <div class="header-time">{{ currentTime }}</div>
    </div>

    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-icon inbound">
          <el-icon><Upload /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">今日进场</div>
          <div class="stat-value">{{ stats.todayInbound || 0 }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon outbound">
          <el-icon><Download /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">今日出场</div>
          <div class="stat-value">{{ stats.todayOutbound || 0 }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon present">
          <el-icon><Box /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">在场箱数</div>
          <div class="stat-value">{{ stats.presentCount || 0 }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon relocation">
          <el-icon><Switch /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">翻箱率</div>
          <div class="stat-value">{{ stats.relocationRate || '0%' }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon crane">
          <el-icon><Tools /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">吊机利用率</div>
          <div class="stat-value">{{ stats.craneUtilization || '0%' }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon slot">
          <el-icon><Grid /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">箱位利用率</div>
          <div class="stat-value">{{ stats.slotUtilization || '0%' }}</div>
        </div>
      </div>
    </div>

    <div class="dashboard-main">
      <div class="main-left">
        <div class="view-switch">
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button label="2D">2D视图</el-radio-button>
            <el-radio-button label="3D">3D视图</el-radio-button>
          </el-radio-group>
          <el-select v-model="selectedYard" size="small" style="width: 120px;">
            <el-option label="A堆场" value="A" />
            <el-option label="B堆场" value="B" />
            <el-option label="C堆场" value="C" />
          </el-select>
        </div>
        
        <div class="yard-visualization">
          <YardSlotGrid
            v-if="viewMode === '2D'"
            :yard-name="selectedYard + '堆场'"
            :grid-data="gridData2D"
            @slot-click="handleSlotClick"
          />
          <YardSlot3D
            v-else
            :yard-name="selectedYard + '堆场'"
            :grid-data="gridData3D"
            @slot-click="handleSlotClick"
          />
        </div>
        
        <SlotLegend style="margin-top: 16px;" />
      </div>

      <div class="main-right">
        <el-card class="crane-status">
          <template #header>
            <div class="card-header">
              <el-icon><Tools /></el-icon>
              <span>吊机实时状态</span>
            </div>
          </template>
          <div class="crane-list">
            <div v-for="crane in craneList" :key="crane.id" class="crane-item">
              <div class="crane-info">
                <span class="crane-name">{{ crane.name }}</span>
                <el-tag :type="getCraneStatusType(crane.status)" size="small">
                  {{ getCraneStatusText(crane.status) }}
                </el-tag>
              </div>
              <div class="crane-progress">
                <el-progress 
                  :percentage="crane.workload || 0" 
                  :stroke-width="8"
                  :color="getProgressColor(crane.workload)"
                />
              </div>
              <div class="crane-task">
                <span v-if="crane.currentTask">当前任务: {{ crane.currentTask }}</span>
                <span v-else style="color: #6b7280;">空闲中</span>
              </div>
            </div>
          </div>
        </el-card>

        <el-card class="throughput-chart">
          <template #header>
            <div class="card-header">
              <el-icon><TrendCharts /></el-icon>
              <span>吞吐量趋势</span>
            </div>
          </template>
          <LineChart :option="throughputOption" height="200px" />
        </el-card>
      </div>
    </div>

    <el-card class="task-queue">
      <template #header>
        <div class="card-header">
          <el-icon><Tickets /></el-icon>
          <span>实时任务队列</span>
          <el-badge :value="taskQueue.length" class="ml-2" />
        </div>
      </template>
      <el-table :data="taskQueue" size="small" max-height="180">
        <el-table-column prop="id" label="任务ID" width="100" />
        <el-table-column prop="type" label="任务类型" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ getTaskTypeText(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="containerNo" label="箱号" width="140" />
        <el-table-column prop="targetSlot" label="目标位置" width="140" />
        <el-table-column prop="craneName" label="分配吊机" width="120" />
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)" size="small">
              {{ getPriorityText(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getTaskStatusType(row.status)" size="small">
              {{ getTaskStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import {
  DataAnalysis,
  Upload,
  Download,
  Box,
  Switch,
  Tools,
  Grid,
  TrendCharts,
  Tickets
} from '@element-plus/icons-vue'
import YardSlotGrid from '@/components/yard/YardSlotGrid.vue'
import YardSlot3D from '@/components/yard/YardSlot3D.vue'
import SlotLegend from '@/components/yard/SlotLegend.vue'
import LineChart from '@/components/chart/LineChart.vue'
import { getDashboardStatistics } from '@/api/statistics'
import { getCraneStatus } from '@/api/crane'
import { getTaskQueue } from '@/api/task'
import { getThroughputTrend } from '@/api/statistics'
import { formatDateTime } from '@/utils/date'
import { useNow } from '@vueuse/core'

const now = useNow({ interval: 1000 })
const currentTime = ref('')

const viewMode = ref('2D')
const selectedYard = ref('A')

const stats = reactive({
  todayInbound: 0,
  todayOutbound: 0,
  presentCount: 0,
  relocationRate: '0%',
  craneUtilization: '0%',
  slotUtilization: '0%'
})

const craneList = ref([])
const taskQueue = ref([])

const gridData2D = ref([])
const gridData3D = ref([])

const throughputOption = ref({
  series: [
    {
      name: '进场',
      type: 'line',
      smooth: true,
      data: [120, 132, 101, 134, 90, 230, 210],
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0)' }
          ]
        }
      },
      lineStyle: { color: '#409eff', width: 2 }
    },
    {
      name: '出场',
      type: 'line',
      smooth: true,
      data: [100, 82, 91, 124, 70, 180, 160],
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
            { offset: 1, color: 'rgba(103, 194, 58, 0)' }
          ]
        }
      },
      lineStyle: { color: '#67c23a', width: 2 }
    }
  ],
  xAxis: {
    data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00']
  },
  legend: {
    data: ['进场', '出场']
  }
})

let timer = null

function updateTime() {
  currentTime.value = formatDateTime(now.value, 'YYYY-MM-DD HH:mm:ss')
}

function generateMockGridData() {
  const rows = 10
  const cols = 20
  const layers = 5
  
  const data2D = []
  const data3D = []
  
  for (let r = 0; r < rows; r++) {
    const row2D = []
    const row3D = []
    
    for (let c = 0; c < cols; c++) {
      const rand = Math.random()
      const status = rand > 0.4 ? 'OCCUPIED' : 'EMPTY'
      const isDanger = status === 'OCCUPIED' && Math.random() > 0.9
      const isReefer = status === 'OCCUPIED' && !isDanger && Math.random() > 0.85
      
      row2D.push({
        id: `${r}-${c}`,
        yardCode: selectedYard.value,
        row: r + 1,
        col: c + 1,
        layer: 1,
        status,
        isDanger,
        isReefer,
        containerNo: status === 'OCCUPIED' ? `MSKU${Math.floor(Math.random() * 1000000)}` : null,
        containerType: status === 'OCCUPIED' ? '20GP' : null
      })
      
      const col3D = []
      for (let l = 0; l < layers; l++) {
        const layerRand = Math.random()
        const layerStatus = layerRand > 0.5 ? 'OCCUPIED' : 'EMPTY'
        const layerIsDanger = layerStatus === 'OCCUPIED' && Math.random() > 0.9
        const layerIsReefer = layerStatus === 'OCCUPIED' && !layerIsDanger && Math.random() > 0.85
        
        col3D.push({
          id: `${r}-${c}-${l}`,
          yardCode: selectedYard.value,
          row: r + 1,
          col: c + 1,
          layer: l + 1,
          status: layerStatus,
          isDanger: layerIsDanger,
          isReefer: layerIsReefer,
          containerNo: layerStatus === 'OCCUPIED' ? `MSKU${Math.floor(Math.random() * 1000000)}` : null
        })
      }
      row3D.push(col3D)
    }
    data2D.push(row2D)
    data3D.push(row3D)
  }
  
  gridData2D.value = data2D
  gridData3D.value = data3D
}

async function fetchDashboardData() {
  try {
    const [statsRes, craneRes, taskRes] = await Promise.all([
      getDashboardStatistics(),
      getCraneStatus(),
      getTaskQueue()
    ])
    
    Object.assign(stats, statsRes.data)
    craneList.value = craneRes.data || []
    taskQueue.value = taskRes.data || []
  } catch (error) {
    console.error('获取大屏数据失败:', error)
  }
}

function getCraneStatusType(status) {
  const map = { IDLE: 'success', WORKING: 'primary', MAINTENANCE: 'warning', ERROR: 'danger' }
  return map[status] || 'info'
}

function getCraneStatusText(status) {
  const map = { IDLE: '空闲', WORKING: '工作中', MAINTENANCE: '维护中', ERROR: '故障' }
  return map[status] || status
}

function getProgressColor(workload) {
  if (workload >= 80) return '#f56c6c'
  if (workload >= 60) return '#e6a23c'
  return '#67c23a'
}

function getTaskTypeText(type) {
  const map = { INBOUND: '进场', OUTBOUND: '出场', RELOCATION: '翻箱', MAINTENANCE: '维护' }
  return map[type] || type
}

function getPriorityType(priority) {
  const map = { HIGH: 'danger', NORMAL: 'warning', LOW: 'info' }
  return map[priority] || 'info'
}

function getPriorityText(priority) {
  const map = { HIGH: '高', NORMAL: '中', LOW: '低' }
  return map[priority] || priority
}

function getTaskStatusType(status) {
  const map = { PENDING: 'warning', ASSIGNED: 'primary', PROCESSING: 'success', COMPLETED: 'success' }
  return map[status] || 'info'
}

function getTaskStatusText(status) {
  const map = { PENDING: '待分配', ASSIGNED: '已分配', PROCESSING: '执行中', COMPLETED: '已完成' }
  return map[status] || status
}

function handleSlotClick(slot) {
  console.log('选中箱位:', slot)
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
  generateMockGridData()
  fetchDashboardData()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.dashboard {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 22px;
  font-weight: 700;
  color: #409eff;
}

.header-time {
  font-size: 16px;
  color: #a8b2c1;
  font-family: 'Courier New', monospace;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

.stat-card {
  background: linear-gradient(135deg, rgba(20, 28, 48, 0.9) 0%, rgba(20, 28, 48, 0.7) 100%);
  border: 1px solid rgba(64, 158, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(64, 158, 255, 0.2);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
}

.stat-icon.inbound {
  background: linear-gradient(135deg, #409eff 0%, #1c7ed6 100%);
}

.stat-icon.outbound {
  background: linear-gradient(135deg, #67c23a 0%, #52c41a 100%);
}

.stat-icon.present {
  background: linear-gradient(135deg, #e6a23c 0%, #d48806 100%);
}

.stat-icon.relocation {
  background: linear-gradient(135deg, #f56c6c 0%, #dc3545 100%);
}

.stat-icon.crane {
  background: linear-gradient(135deg, #909399 0%, #606266 100%);
}

.stat-icon.slot {
  background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
}

.stat-info .stat-label {
  font-size: 13px;
  color: #a8b2c1;
  margin-bottom: 4px;
}

.stat-info .stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #409eff;
}

.dashboard-main {
  flex: 1;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  min-height: 0;
}

.main-left {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.view-switch {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.yard-visualization {
  flex: 1;
  min-height: 0;
}

.main-right {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.crane-status,
.throughput-chart {
  flex: 1;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #409eff;
  font-weight: 600;
}

.crane-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.crane-item {
  padding: 12px;
  background: rgba(64, 158, 255, 0.05);
  border-radius: 8px;
  border-left: 3px solid #409eff;
}

.crane-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.crane-name {
  font-weight: 600;
  color: #e0e6ed;
}

.crane-progress {
  margin-bottom: 8px;
}

.crane-task {
  font-size: 12px;
  color: #a8b2c1;
}

.task-queue {
  height: 240px;
}

.ml-2 {
  margin-left: 8px;
}
</style>
