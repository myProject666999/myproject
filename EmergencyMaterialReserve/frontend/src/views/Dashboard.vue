<template>
  <div class="dashboard">
    <div class="stats-row">
      <div class="stat-card" v-for="item in statsCards" :key="item.label">
        <div class="stat-icon" :style="{ background: item.iconBg }">
          <el-icon :size="28"><component :is="item.icon" /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ item.value }}</div>
          <div class="stat-label">{{ item.label }}</div>
        </div>
      </div>
    </div>

    <el-row :gutter="16" class="chart-row">
      <el-col :span="14">
        <el-card class="dark-card" shadow="never">
          <template #header>
            <span class="card-title">各仓库库存汇总</span>
          </template>
          <div ref="barChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card class="dark-card" shadow="never">
          <template #header>
            <span class="card-title">物资分类分布</span>
          </template>
          <div ref="pieChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="chart-row">
      <el-col :span="14">
        <el-card class="dark-card" shadow="never">
          <template #header>
            <span class="card-title">预警统计</span>
          </template>
          <div class="alert-cards">
            <div class="alert-card alert-red">
              <div class="alert-num">{{ expiryStats.red || 0 }}</div>
              <div class="alert-text">红色效期预警</div>
              <div class="alert-desc">7天内到期</div>
            </div>
            <div class="alert-card alert-orange">
              <div class="alert-num">{{ expiryStats.orange || 0 }}</div>
              <div class="alert-text">橙色效期预警</div>
              <div class="alert-desc">15天内到期</div>
            </div>
            <div class="alert-card alert-yellow">
              <div class="alert-num">{{ expiryStats.yellow || 0 }}</div>
              <div class="alert-text">黄色效期预警</div>
              <div class="alert-desc">30天内到期</div>
            </div>
            <div class="alert-card alert-stock">
              <div class="alert-num">{{ expiryStats.belowWarning || 0 }}</div>
              <div class="alert-text">库存低于预警线</div>
              <div class="alert-desc">需及时补充</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card class="dark-card" shadow="never">
          <template #header>
            <span class="card-title">待处理单据</span>
          </template>
          <div class="pending-cards">
            <div class="pending-card">
              <el-icon :size="36" color="#409EFF"><Switch /></el-icon>
              <div class="pending-info">
                <div class="pending-num">{{ pendingStats.transferPending || 0 }}</div>
                <div class="pending-text">调拨单待处理</div>
              </div>
            </div>
            <div class="pending-card">
              <el-icon :size="36" color="#E6A23C"><Document /></el-icon>
              <div class="pending-info">
                <div class="pending-num">{{ pendingStats.demandPending || 0 }}</div>
                <div class="pending-text">需求单待处理</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick, getCurrentInstance } from 'vue'
import { dashboardApi } from '@/api'

const { proxy } = getCurrentInstance()

const barChartRef = ref(null)
const pieChartRef = ref(null)
let barChart = null
let pieChart = null
let timer = null

const overview = reactive({
  warehouseCount: 0,
  materialCount: 0,
  totalStock: 0,
  totalValue: 0
})

const expiryStats = reactive({
  red: 0,
  orange: 0,
  yellow: 0,
  belowWarning: 0
})

const pendingStats = reactive({
  transferPending: 0,
  demandPending: 0
})

const statsCards = ref([])

function buildStatsCards() {
  statsCards.value = [
    {
      label: '仓库总数',
      value: overview.warehouseCount,
      icon: 'OfficeBuilding',
      iconBg: 'linear-gradient(135deg, #409EFF, #337ecc)'
    },
    {
      label: '物资总数',
      value: overview.materialCount,
      icon: 'Box',
      iconBg: 'linear-gradient(135deg, #67C23A, #529b2e)'
    },
    {
      label: '库存总量',
      value: overview.totalStock,
      icon: 'Goods',
      iconBg: 'linear-gradient(135deg, #E6A23C, #cf8e24)'
    },
    {
      label: '库存总价值（元）',
      value: overview.totalValue.toLocaleString(),
      icon: 'Money',
      iconBg: 'linear-gradient(135deg, #F56C6C, #c45656)'
    }
  ]
}

async function fetchData() {
  try {
    const [overviewRes, warehouseRes, distributionRes, expiryRes] = await Promise.all([
      dashboardApi.getOverview(),
      dashboardApi.getWarehouseStatus(),
      dashboardApi.getMaterialDistribution(),
      dashboardApi.getExpiryStats()
    ])

    const overviewData = overviewRes.data || overviewRes
    Object.assign(overview, {
      warehouseCount: overviewData.warehouseCount || 0,
      materialCount: overviewData.materialCount || 0,
      totalStock: overviewData.totalStock || 0,
      totalValue: overviewData.totalValue || 0
    })
    buildStatsCards()

    const expiryData = expiryRes.data || expiryRes
    Object.assign(expiryStats, {
      red: expiryData.red || 0,
      orange: expiryData.orange || 0,
      yellow: expiryData.yellow || 0,
      belowWarning: expiryData.belowWarning || 0
    })

    const pendingData = overviewData.pending || {}
    Object.assign(pendingStats, {
      transferPending: pendingData.transferPending || 0,
      demandPending: pendingData.demandPending || 0
    })

    await nextTick()
    renderBarChart(warehouseRes.data || warehouseRes)
    renderPieChart(distributionRes.data || distributionRes)
  } catch (e) {
    console.error('Dashboard数据加载失败', e)
  }
}

function renderBarChart(data) {
  if (!barChartRef.value) return
  if (!barChart) {
    barChart = proxy.$echarts.init(barChartRef.value)
  }
  const list = data.list || data || []
  const names = list.map(i => i.name || i.warehouseName)
  const totalStocks = list.map(i => i.totalStock || i.totalQuantity || 0)
  const availables = list.map(i => i.availableStock || i.availableQuantity || 0)
  const lockeds = list.map(i => i.lockedStock || i.lockedQuantity || 0)

  barChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['总库存', '可用', '锁定'], textStyle: { color: '#ccc' } },
    grid: { left: 60, right: 20, top: 40, bottom: 30 },
    xAxis: {
      type: 'category',
      data: names,
      axisLabel: { color: '#ccc', rotate: names.length > 5 ? 20 : 0 }
    },
    yAxis: { type: 'value', axisLabel: { color: '#ccc' }, splitLine: { lineStyle: { color: '#ffffff1a' } } },
    series: [
      { name: '总库存', type: 'bar', data: totalStocks, itemStyle: { color: '#409EFF' } },
      { name: '可用', type: 'bar', data: availables, itemStyle: { color: '#67C23A' } },
      { name: '锁定', type: 'bar', data: lockeds, itemStyle: { color: '#E6A23C' } }
    ]
  })
}

function renderPieChart(data) {
  if (!pieChartRef.value) return
  if (!pieChart) {
    pieChart = proxy.$echarts.init(pieChartRef.value)
  }
  const list = data.list || data || []
  const pieData = list.map(i => ({
    name: i.name || i.categoryName,
    value: i.value || i.quantity || i.count || 0
  }))

  pieChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { color: '#ccc' } },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: '#1a1a2e', borderWidth: 2 },
        label: { show: true, color: '#ccc' },
        data: pieData
      }
    ]
  })
}

function handleResize() {
  barChart?.resize()
  pieChart?.resize()
}

onMounted(() => {
  fetchData()
  timer = setInterval(fetchData, 30000)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  clearInterval(timer)
  window.removeEventListener('resize', handleResize)
  barChart?.dispose()
  pieChart?.dispose()
})
</script>

<style scoped>
.dashboard {
  background: #0d1117;
  min-height: calc(100vh - 100px);
  padding: 20px;
  color: #e0e0e0;
  margin: -20px;
}

.stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.stat-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: #161b22;
  border-radius: 8px;
  border: 1px solid #30363d;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #8b949e;
  margin-top: 4px;
}

.chart-row {
  margin-bottom: 16px;
}

.dark-card {
  background: #161b22 !important;
  border-color: #30363d !important;
}

.dark-card :deep(.el-card__header) {
  border-bottom-color: #30363d;
  padding: 12px 20px;
}

.dark-card :deep(.el-card__body) {
  padding: 16px 20px;
}

.card-title {
  color: #e0e0e0;
  font-size: 15px;
  font-weight: 600;
}

.chart-container {
  height: 320px;
  width: 100%;
}

.alert-cards {
  display: flex;
  gap: 16px;
  height: 280px;
  align-items: center;
  justify-content: center;
}

.alert-card {
  flex: 1;
  text-align: center;
  padding: 24px 16px;
  border-radius: 8px;
  height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.alert-red {
  background: linear-gradient(135deg, #f56c6c22, #f56c6c44);
  border: 1px solid #f56c6c66;
}

.alert-orange {
  background: linear-gradient(135deg, #e6a23c22, #e6a23c44);
  border: 1px solid #e6a23c66;
}

.alert-yellow {
  background: linear-gradient(135deg, #fbe06a22, #fbe06a44);
  border: 1px solid #fbe06a66;
}

.alert-stock {
  background: linear-gradient(135deg, #409eff22, #409eff44);
  border: 1px solid #409eff66;
}

.alert-num {
  font-size: 36px;
  font-weight: 700;
  color: #fff;
}

.alert-red .alert-num { color: #F56C6C; }
.alert-orange .alert-num { color: #E6A23C; }
.alert-yellow .alert-num { color: #FBE06A; }
.alert-stock .alert-num { color: #409EFF; }

.alert-text {
  font-size: 14px;
  color: #e0e0e0;
  margin-top: 8px;
}

.alert-desc {
  font-size: 12px;
  color: #8b949e;
  margin-top: 4px;
}

.pending-cards {
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
  justify-content: center;
  height: 280px;
}

.pending-card {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 24px 32px;
  background: #1c2333;
  border-radius: 8px;
  border: 1px solid #30363d;
  width: 80%;
  justify-content: center;
}

.pending-num {
  font-size: 32px;
  font-weight: 700;
  color: #fff;
}

.pending-text {
  font-size: 14px;
  color: #8b949e;
  margin-top: 4px;
}
</style>
