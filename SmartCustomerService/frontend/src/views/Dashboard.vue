<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-value">{{ overview.totalTickets || 0 }}</div>
              <div class="stat-label">工单总数</div>
            </div>
            <el-icon :size="48" color="#409EFF"><Tickets /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-value">{{ overview.pendingTickets || 0 }}</div>
              <div class="stat-label">待处理</div>
            </div>
            <el-icon :size="48" color="#E6A23C"><Clock /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-value">{{ overview.processingTickets || 0 }}</div>
              <div class="stat-label">处理中</div>
            </div>
            <el-icon :size="48" color="#F56C6C"><Loading /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-value">{{ overview.resolvedTickets || 0 }}</div>
              <div class="stat-label">已解决</div>
            </div>
            <el-icon :size="48" color="#67C23A"><CircleCheck /></el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>工单趋势</span>
              <el-select v-model="trendDays" size="small" style="width: 120px">
                <el-option :value="7" label="近7天" />
                <el-option :value="14" label="近14天" />
                <el-option :value="30" label="近30天" />
              </el-select>
            </div>
          </template>
          <div ref="trendChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <span>快捷操作</span>
          </template>
          <div class="quick-actions">
            <el-button type="primary" size="large" @click="$router.push('/ticket/create')">
              <el-icon><EditPen /></el-icon>
              提交工单
            </el-button>
            <el-button size="large" @click="$router.push('/ticket/list')">
              <el-icon><Tickets /></el-icon>
              查看工单
            </el-button>
            <el-button size="large" @click="$router.push('/kb/list')">
              <el-icon><Reading /></el-icon>
              知识库
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>最新工单</span>
          </template>
          <el-table :data="recentTickets" stripe style="width: 100%">
            <el-table-column prop="ticketNo" label="工单号" width="160" />
            <el-table-column prop="title" label="标题" show-overflow-tooltip />
            <el-table-column prop="statusName" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :color="row.statusColor" effect="dark">{{ row.statusName }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{ row }">
                <el-button type="primary" link @click="$router.push(`/ticket/detail/${row.id}`)">
                  查看
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>分类统计</span>
          </template>
          <div ref="categoryChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { getStatsOverview, getTicketTrend, getCategoryStats } from '@/api/stats'
import { getTicketList } from '@/api/ticket'

const router = useRouter()
const trendDays = ref(7)
const overview = reactive({})
const recentTickets = ref([])
const trendChartRef = ref(null)
const categoryChartRef = ref(null)
let trendChart = null
let categoryChart = null

async function loadOverview() {
  const res = await getStatsOverview()
  if (res.code === 0) {
    Object.assign(overview, res.data)
  }
}

async function loadTrend() {
  const res = await getTicketTrend({ days: trendDays.value })
  if (res.code === 0 && trendChart) {
    const dates = res.data.map(item => item.date)
    const counts = res.data.map(item => item.count)
    
    trendChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: dates },
      yAxis: { type: 'value' },
      series: [{
        name: '工单数量',
        type: 'line',
        smooth: true,
        areaStyle: {},
        data: counts,
        itemStyle: { color: '#409EFF' }
      }]
    })
  }
}

async function loadCategoryStats() {
  const res = await getCategoryStats()
  if (res.code === 0 && categoryChart) {
    categoryChart.setOption({
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
      series: [{
        name: '工单分类',
        type: 'pie',
        radius: '60%',
        data: res.data.map(item => ({
          name: item.categoryName,
          value: item.count
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    })
  }
}

async function loadRecentTickets() {
  const res = await getTicketList({ page: 1, pageSize: 5 })
  if (res.code === 0) {
    recentTickets.value = res.data.list || []
  }
}

watch(trendDays, () => {
  loadTrend()
})

onMounted(() => {
  loadOverview()
  loadRecentTickets()
  
  nextTick(() => {
    if (trendChartRef.value) {
      trendChart = echarts.init(trendChartRef.value)
      loadTrend()
    }
    if (categoryChartRef.value) {
      categoryChart = echarts.init(categoryChartRef.value)
      loadCategoryStats()
    }
  })
})
</script>

<style lang="scss" scoped>
.stat-card {
  .stat-content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .stat-info {
      .stat-value {
        font-size: 32px;
        font-weight: bold;
        color: #303133;
      }
      .stat-label {
        font-size: 14px;
        color: #909399;
        margin-top: 4px;
      }
    }
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .el-button {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
