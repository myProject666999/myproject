<template>
  <div class="statistics">
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
              <div class="stat-value">{{ overview.resolvedTickets || 0 }}</div>
              <div class="stat-label">已解决</div>
            </div>
            <el-icon :size="48" color="#67C23A"><CircleCheck /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-value">{{ (overview.resolutionRate || 0).toFixed(1) }}%</div>
              <div class="stat-label">解决率</div>
            </div>
            <el-icon :size="48" color="#F56C6C"><TrendCharts /></el-icon>
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
              <el-select v-model="trendDays" size="small" style="width: 120px" @change="loadTrend">
                <el-option :value="7" label="近7天" />
                <el-option :value="14" label="近14天" />
                <el-option :value="30" label="近30天" />
              </el-select>
            </div>
          </template>
          <div ref="trendChartRef" style="height: 350px"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <span>分类统计</span>
          </template>
          <div ref="categoryChartRef" style="height: 350px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>客服工作量</span>
              <el-date-picker
                v-model="workloadDate"
                type="date"
                placeholder="选择日期"
                size="small"
                :clearable="false"
                @change="loadWorkload"
              />
            </div>
          </template>
          <el-table :data="workloadList" stripe>
            <el-table-column prop="agentName" label="客服" width="120" />
            <el-table-column prop="onlineDuration" label="在线时长(秒)" width="120" />
            <el-table-column prop="ticketCount" label="工单数" width="100" />
            <el-table-column prop="resolvedCount" label="已解决" width="100" />
            <el-table-column prop="avgResponseTime" label="平均响应(秒)" width="120" />
            <el-table-column prop="avgResolveTime" label="平均解决(秒)" width="120" />
            <el-table-column prop="satisfactionAvg" label="满意度" width="100">
              <template #default="{ row }">
                <el-rate :model-value="row.satisfactionAvg / 2" disabled show-score text-color="#ff9900" />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getStatsOverview, getTicketTrend, getCategoryStats, getAgentWorkload } from '@/api/stats'
import dayjs from 'dayjs'

const overview = reactive({})
const trendDays = ref(7)
const workloadDate = ref(dayjs().format('YYYY-MM-DD'))
const workloadList = ref([])
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

async function loadWorkload() {
  const res = await getAgentWorkload({ date: workloadDate.value })
  if (res.code === 0) {
    workloadList.value = res.data || []
  }
}

onMounted(() => {
  loadOverview()
  
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
  
  loadWorkload()
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
</style>
