<template>
  <div class="statistics-page">
    <div class="page-title">
      <el-icon :size="24"><DataAnalysis /></el-icon>
      <span>统计分析</span>
    </div>

    <el-tabs v-model="activeTab" type="card" class="statistics-tabs">
      <el-tab-pane label="翻箱率分析" name="relocation">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-card>
              <template #header>
                <div class="card-header">
                  <el-icon><TrendCharts /></el-icon>
                  <span>月度翻箱率趋势</span>
                  <el-date-picker
                    v-model="relocationDateRange"
                    type="monthrange"
                    size="small"
                    class="ml-auto"
                    @change="fetchRelocationData"
                  />
                </div>
              </template>
              <LineChart :option="relocationTrendOption" height="300px" />
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card>
              <template #header>
                <div class="card-header">
                  <el-icon><PieChartIcon /></el-icon>
                  <span>翻箱原因分布</span>
                </div>
              </template>
              <PieChart :option="relocationReasonOption" height="300px" />
            </el-card>
          </el-col>
        </el-row>
        <el-row :gutter="16" style="margin-top: 16px;">
          <el-col :span="24">
            <el-card>
              <template #header>
                <div class="card-header">
                  <el-icon><List /></el-icon>
                  <span>翻箱明细记录</span>
                </div>
              </template>
              <el-table :data="relocationList" size="small">
                <el-table-column prop="containerNo" label="箱号" width="140" />
                <el-table-column prop="fromSlot" label="原位置" width="140" />
                <el-table-column prop="toSlot" label="新位置" width="140" />
                <el-table-column prop="reason" label="原因" width="200" />
                <el-table-column prop="operator" label="操作人" width="120" />
                <el-table-column prop="createTime" label="时间" width="180">
                  <template #default="{ row }">
                    {{ formatDateTime(row.createTime) }}
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <el-tab-pane label="吞吐量统计" name="throughput">
        <el-row :gutter="16">
          <el-col :span="16">
            <el-card>
              <template #header>
                <div class="card-header">
                  <el-icon><TrendCharts /></el-icon>
                  <span>吞吐量趋势</span>
                  <div class="ml-auto">
                    <el-radio-group v-model="throughputType" size="small" @change="fetchThroughputData">
                      <el-radio-button label="day">按日</el-radio-button>
                      <el-radio-button label="month">按月</el-radio-button>
                    </el-radio-group>
                  </div>
                </div>
              </template>
              <BarChart :option="throughputBarOption" height="350px" />
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card>
              <template #header>
                <div class="card-header">
                  <el-icon><DataLine /></el-icon>
                  <span>箱型分布</span>
                </div>
              </template>
              <PieChart :option="containerTypeOption" height="350px" />
            </el-card>
          </el-col>
        </el-row>
        <el-row :gutter="16" style="margin-top: 16px;">
          <el-col :span="6">
            <div class="stat-card total">
              <div class="stat-label">总进场量</div>
              <div class="stat-value">{{ stats.totalInbound || 0 }}</div>
              <div class="stat-unit">TEU</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card total">
              <div class="stat-label">总出场量</div>
              <div class="stat-value">{{ stats.totalOutbound || 0 }}</div>
              <div class="stat-unit">TEU</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card total">
              <div class="stat-label">月均吞吐量</div>
              <div class="stat-value">{{ stats.avgMonthly || 0 }}</div>
              <div class="stat-unit">TEU</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card total">
              <div class="stat-label">同比增长</div>
              <div class="stat-value" :class="stats.yoyGrowth >= 0 ? 'up' : 'down'">
                {{ stats.yoyGrowth >= 0 ? '+' : '' }}{{ stats.yoyGrowth || 0 }}%
              </div>
              <div class="stat-unit">YoY</div>
            </div>
          </el-col>
        </el-row>
      </el-tab-pane>

      <el-tab-pane label="吊机利用率" name="crane">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-card>
              <template #header>
                <div class="card-header">
                  <el-icon><Tools /></el-icon>
                  <span>各吊机利用率对比</span>
                  <el-date-picker
                    v-model="craneDateRange"
                    type="daterange"
                    size="small"
                    class="ml-auto"
                    @change="fetchCraneData"
                  />
                </div>
              </template>
              <BarChart :option="craneUtilizationOption" height="300px" />
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card>
              <template #header>
                <div class="card-header">
                  <el-icon><TrendCharts /></el-icon>
                  <span>吊机利用率趋势</span>
                </div>
              </template>
              <LineChart :option="craneTrendOption" height="300px" />
            </el-card>
          </el-col>
        </el-row>
        <el-row :gutter="16" style="margin-top: 16px;">
          <el-col :span="24">
            <el-card>
              <template #header>
                <div class="card-header">
                  <el-icon><List /></el-icon>
                  <span>吊机运行统计</span>
                </div>
              </template>
              <el-table :data="craneStatsList" size="small">
                <el-table-column prop="craneName" label="吊机名称" width="120" />
                <el-table-column prop="totalTasks" label="总任务数" width="100" />
                <el-table-column prop="completedTasks" label="完成任务" width="100" />
                <el-table-column prop="workingHours" label="工作时长(h)" width="120" />
                <el-table-column prop="idleHours" label="空闲时长(h)" width="120" />
                <el-table-column prop="utilizationRate" label="利用率" width="120">
                  <template #default="{ row }">
                    <el-progress
                      :percentage="row.utilizationRate || 0"
                      :color="getUtilizationColor(row.utilizationRate)"
                      :stroke-width="10"
                    />
                  </template>
                </el-table-column>
                <el-table-column prop="avgTaskTime" label="平均作业时长(min)" width="140" />
                <el-table-column prop="errorCount" label="故障次数" width="100" />
              </el-table>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <el-tab-pane label="箱位利用率趋势" name="slot">
        <el-row :gutter="16">
          <el-col :span="16">
            <el-card>
              <template #header>
                <div class="card-header">
                  <el-icon><TrendCharts /></el-icon>
                  <span>箱位利用率趋势</span>
                  <el-select v-model="selectedYard" size="small" class="ml-auto" @change="fetchSlotData">
                    <el-option label="全部堆场" value="all" />
                    <el-option label="A堆场" value="A" />
                    <el-option label="B堆场" value="B" />
                    <el-option label="C堆场" value="C" />
                  </el-select>
                </div>
              </template>
              <LineChart :option="slotUtilizationOption" height="400px" />
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card>
              <template #header>
                <div class="card-header">
                  <el-icon><PieChart /></el-icon>
                  <span>当前箱位使用情况</span>
                </div>
              </template>
              <PieChart :option="slotUsageOption" height="400px" />
            </el-card>
          </el-col>
        </el-row>
        <el-row :gutter="16" style="margin-top: 16px;">
          <el-col :span="8">
            <div class="stat-card slot">
              <div class="stat-label">总箱位数</div>
              <div class="stat-value">{{ slotStats.totalSlots || 0 }}</div>
              <div class="stat-unit">个</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-card slot">
              <div class="stat-label">已使用</div>
              <div class="stat-value">{{ slotStats.usedSlots || 0 }}</div>
              <div class="stat-unit">个</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-card slot">
              <div class="stat-label">当前利用率</div>
              <div class="stat-value">{{ slotStats.utilization || '0%' }}</div>
              <div class="stat-unit">使用率</div>
            </div>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
  DataAnalysis,
  TrendCharts,
  PieChart as PieChartIcon,
  List,
  DataLine,
  Tools
} from '@element-plus/icons-vue'
import BarChart from '@/components/chart/BarChart.vue'
import LineChart from '@/components/chart/LineChart.vue'
import PieChart from '@/components/chart/PieChart.vue'
import {
  getRelocationAnalysis,
  getThroughputTrend,
  getCraneUtilizationReport,
  getSlotUtilizationTrend,
  getContainerTypeDistribution,
  getMonthlyStatistics
} from '@/api/statistics'
import { formatDateTime } from '@/utils/date'

const activeTab = ref('relocation')
const loading = ref(false)

const relocationDateRange = ref([])
const craneDateRange = ref([])
const throughputType = ref('month')
const selectedYard = ref('all')

const stats = reactive({
  totalInbound: 0,
  totalOutbound: 0,
  avgMonthly: 0,
  yoyGrowth: 0
})

const slotStats = reactive({
  totalSlots: 0,
  usedSlots: 0,
  utilization: '0%'
})

const relocationList = ref([])
const craneStatsList = ref([])

const relocationTrendOption = ref({
  series: [{ name: '翻箱率', type: 'line', smooth: true, data: [] }],
  xAxis: { data: [] }
})

const relocationReasonOption = ref({
  series: [{ type: 'pie', radius: ['40%', '70%'], data: [] }]
})

const throughputBarOption = ref({
  series: [
    { name: '进场', type: 'bar', data: [], itemStyle: { color: '#409eff' } },
    { name: '出场', type: 'bar', data: [], itemStyle: { color: '#67c23a' } }
  ],
  legend: { data: ['进场', '出场'] },
  xAxis: { data: [] }
})

const containerTypeOption = ref({
  series: [{ type: 'pie', radius: ['40%', '70%'], data: [] }]
})

const craneUtilizationOption = ref({
  series: [{ name: '利用率', type: 'bar', data: [], itemStyle: { color: '#409eff' } }],
  xAxis: { data: [], type: 'category' },
  yAxis: { max: 100, axisLabel: { formatter: '{value}%' } }
})

const craneTrendOption = ref({
  series: [],
  xAxis: { data: [] }
})

const slotUtilizationOption = ref({
  series: [],
  xAxis: { data: [] }
})

const slotUsageOption = ref({
  series: [{
    type: 'pie',
    radius: ['40%', '70%'],
    data: [
      { value: 65, name: '已使用', itemStyle: { color: '#409eff' } },
      { value: 35, name: '空闲', itemStyle: { color: '#6b7280' } }
    ]
  }]
})

function getUtilizationColor(rate) {
  if (rate >= 80) return '#67c23a'
  if (rate >= 60) return '#e6a23c'
  return '#f56c6c'
}

async function fetchRelocationData() {
  try {
    const res = await getRelocationAnalysis()
    relocationList.value = res.data.list || []
    
    const months = res.data.months || ['1月', '2月', '3月', '4月', '5月', '6月']
    const rates = res.data.rates || [5.2, 4.8, 6.1, 5.5, 4.9, 5.8]
    
    relocationTrendOption.value = {
      series: [{
        name: '翻箱率',
        type: 'line',
        smooth: true,
        data: rates,
        lineStyle: { color: '#f56c6c', width: 3 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(245, 108, 108, 0.3)' },
              { offset: 1, color: 'rgba(245, 108, 108, 0)' }
            ]
          }
        }
      }],
      xAxis: { data: months },
      yAxis: { axisLabel: { formatter: '{value}%' } }
    }
    
    relocationReasonOption.value = {
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        data: res.data.reasons || [
          { value: 35, name: '出场需要', itemStyle: { color: '#409eff' } },
          { value: 28, name: '优化堆存', itemStyle: { color: '#67c23a' } },
          { value: 22, name: '危险品隔离', itemStyle: { color: '#f56c6c' } },
          { value: 15, name: '其他原因', itemStyle: { color: '#909399' } }
        ]
      }]
    }
  } catch (error) {
    console.error('获取翻箱率数据失败:', error)
  }
}

async function fetchThroughputData() {
  try {
    const res = await getThroughputTrend({ type: throughputType.value })
    
    const xData = res.data.xAxis || []
    const inboundData = res.data.inbound || []
    const outboundData = res.data.outbound || []
    
    throughputBarOption.value = {
      series: [
        { name: '进场', type: 'bar', data: inboundData, itemStyle: { color: '#409eff' } },
        { name: '出场', type: 'bar', data: outboundData, itemStyle: { color: '#67c23a' } }
      ],
      legend: { data: ['进场', '出场'] },
      xAxis: { data: xData }
    }
    
    const typeRes = await getContainerTypeDistribution()
    containerTypeOption.value = {
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        data: typeRes.data || [
          { value: 45, name: '20GP', itemStyle: { color: '#409eff' } },
          { value: 30, name: '40GP', itemStyle: { color: '#67c23a' } },
          { value: 20, name: '40HQ', itemStyle: { color: '#e6a23c' } },
          { value: 5, name: '其他', itemStyle: { color: '#909399' } }
        ]
      }]
    }
    
    Object.assign(stats, {
      totalInbound: res.data.totalInbound || 12580,
      totalOutbound: res.data.totalOutbound || 12100,
      avgMonthly: res.data.avgMonthly || 2056,
      yoyGrowth: res.data.yoyGrowth || 8.5
    })
  } catch (error) {
    console.error('获取吞吐量数据失败:', error)
  }
}

async function fetchCraneData() {
  try {
    const res = await getCraneUtilizationReport()
    
    const craneNames = res.data.cranes || ['吊机1号', '吊机2号', '吊机3号', '吊机4号']
    const utilizationRates = res.data.utilization || [75, 82, 68, 78]
    
    craneUtilizationOption.value = {
      series: [{
        name: '利用率',
        type: 'bar',
        data: utilizationRates,
        itemStyle: {
          color: (params) => {
            if (params.value >= 80) return '#67c23a'
            if (params.value >= 60) return '#e6a23c'
            return '#f56c6c'
          }
        }
      }],
      xAxis: { data: craneNames, type: 'category' },
      yAxis: { max: 100, axisLabel: { formatter: '{value}%' } }
    }
    
    craneTrendOption.value = {
      series: craneNames.map((name, i) => ({
        name,
        type: 'line',
        smooth: true,
        data: res.data.trends?.[i] || [70, 72, 75, 78, 80, 76, 74]
      })),
      legend: { data: craneNames },
      xAxis: { data: res.data.days || ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] }
    }
    
    craneStatsList.value = res.data.stats || [
      { craneName: '吊机1号', totalTasks: 450, completedTasks: 445, workingHours: 180, idleHours: 60, utilizationRate: 75, avgTaskTime: 24, errorCount: 2 },
      { craneName: '吊机2号', totalTasks: 520, completedTasks: 515, workingHours: 196, idleHours: 44, utilizationRate: 82, avgTaskTime: 22, errorCount: 1 },
      { craneName: '吊机3号', totalTasks: 380, completedTasks: 375, workingHours: 163, idleHours: 77, utilizationRate: 68, avgTaskTime: 26, errorCount: 3 },
      { craneName: '吊机4号', totalTasks: 480, completedTasks: 478, workingHours: 187, idleHours: 53, utilizationRate: 78, avgTaskTime: 23, errorCount: 1 }
    ]
  } catch (error) {
    console.error('获取吊机利用率数据失败:', error)
  }
}

async function fetchSlotData() {
  try {
    const res = await getSlotUtilizationTrend({ yard: selectedYard.value })
    
    const dates = res.data.dates || ['1月', '2月', '3月', '4月', '5月', '6月']
    const yards = res.data.yards || ['A堆场', 'B堆场', 'C堆场']
    const seriesData = res.data.series || [
      [72, 75, 78, 76, 80, 82],
      [68, 70, 72, 75, 77, 79],
      [65, 67, 70, 72, 74, 76]
    ]
    const colors = ['#409eff', '#67c23a', '#e6a23c']
    
    slotUtilizationOption.value = {
      series: yards.map((name, i) => ({
        name,
        type: 'line',
        smooth: true,
        data: seriesData[i],
        lineStyle: { color: colors[i], width: 2 }
      })),
      legend: { data: yards },
      xAxis: { data: dates },
      yAxis: { max: 100, axisLabel: { formatter: '{value}%' } }
    }
    
    Object.assign(slotStats, {
      totalSlots: res.data.totalSlots || 5000,
      usedSlots: res.data.usedSlots || 3250,
      utilization: res.data.utilization || '65%'
    })
  } catch (error) {
    console.error('获取箱位利用率数据失败:', error)
  }
}

onMounted(() => {
  fetchRelocationData()
  fetchThroughputData()
  fetchCraneData()
  fetchSlotData()
})
</script>

<style scoped>
.statistics-page {
  height: 100%;
  overflow-y: auto;
}

.statistics-tabs {
  flex: 1;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #409eff;
  font-weight: 600;
}

.ml-auto {
  margin-left: auto;
}

.stat-card {
  background: linear-gradient(135deg, rgba(20, 28, 48, 0.9) 0%, rgba(20, 28, 48, 0.7) 100%);
  border: 1px solid rgba(64, 158, 255, 0.2);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(64, 158, 255, 0.2);
}

.stat-card.total::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, #409eff 0%, #1c7ed6 100%);
}

.stat-card.slot::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, #9b59b6 0%, #8e44ad 100%);
}

.stat-label {
  font-size: 14px;
  color: #a8b2c1;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #409eff;
  margin-bottom: 4px;
}

.stat-value.up {
  color: #67c23a;
}

.stat-value.down {
  color: #f56c6c;
}

.stat-unit {
  font-size: 12px;
  color: #6b7280;
}
</style>
