<template>
  <div class="statistics-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span><el-icon><DataAnalysis /></el-icon> 统计报表</span>
        </div>
      </template>
      
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="个人统计" name="personal">
          <el-row :gutter="20" class="stats-row">
            <el-col :span="6">
              <el-card shadow="hover" class="stat-card draft">
                <div class="stat-label">草稿数量</div>
                <div class="stat-value">{{ personalStats.draftCount || 0 }}</div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" class="stat-card pending">
                <div class="stat-label">审批中数量</div>
                <div class="stat-value">{{ personalStats.pendingCount || 0 }}</div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" class="stat-card approved">
                <div class="stat-label">已通过数量</div>
                <div class="stat-value">{{ personalStats.approvedCount || 0 }}</div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" class="stat-card rejected">
                <div class="stat-label">已驳回数量</div>
                <div class="stat-value">{{ personalStats.rejectedCount || 0 }}</div>
              </el-card>
            </el-col>
          </el-row>
          
          <el-row :gutter="20" class="stats-row">
            <el-col :span="12">
              <el-card shadow="hover" class="stat-card total">
                <div class="stat-label">报销总金额</div>
                <div class="stat-value amount">¥{{ formatAmount(personalStats.totalAmount) }}</div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card shadow="hover" class="stat-card total">
                <div class="stat-label">报销总次数</div>
                <div class="stat-value">{{ personalStats.totalCount || 0 }}</div>
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>
        
        <el-tab-pane label="部门统计" name="department">
          <el-row :gutter="20" class="stats-row">
            <el-col :span="8">
              <el-card shadow="hover" class="stat-card total">
                <div class="stat-label">部门报销总数</div>
                <div class="stat-value">{{ deptStats.totalCount || 0 }}</div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="hover" class="stat-card approved">
                <div class="stat-label">已通过金额</div>
                <div class="stat-value amount">¥{{ formatAmount(deptStats.approvedAmount) }}</div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="hover" class="stat-card pending">
                <div class="stat-label">审批中数量</div>
                <div class="stat-value">{{ deptStats.pendingCount || 0 }}</div>
              </el-card>
            </el-col>
          </el-row>
          
          <el-card shadow="never" class="chart-card">
            <template #header>部门报销类型分布</template>
            <div ref="typeChartRef" class="chart-container"></div>
          </el-card>
        </el-tab-pane>
        
        <el-tab-pane label="月度统计" name="monthly">
          <div class="year-selector">
            <span>选择年份：</span>
            <el-select v-model="selectedYear" @change="loadMonthlyStats" style="width: 150px; margin-left: 10px;">
              <el-option v-for="year in availableYears" :key="year" :label="year" :value="year" />
            </el-select>
          </div>
          
          <el-card shadow="never" class="chart-card">
            <template #header>月度报销金额趋势</template>
            <div ref="monthlyChartRef" class="chart-container"></div>
          </el-card>
          
          <el-card shadow="never" style="margin-top: 20px;">
            <template #header>月度数据明细</template>
            <el-table :data="monthlyData" border stripe>
              <el-table-column prop="month" label="月份" width="100" />
              <el-table-column prop="count" label="报销次数" width="120" />
              <el-table-column prop="amount" label="报销金额">
                <template #default="{ row }">
                  <span class="amount-text">¥{{ formatAmount(row.amount) }}</span>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useUserStore } from '@/stores/user'
import { getPersonalStats, getDepartmentStats, getMonthlyStats } from '@/api/statistics'
import * as echarts from 'echarts'
import { DataAnalysis } from '@element-plus/icons-vue'

const userStore = useUserStore()
const activeTab = ref('personal')

const personalStats = reactive({})
const deptStats = reactive({})
const monthlyData = ref([])
const selectedYear = ref(new Date().getFullYear())
const availableYears = ref([2024, 2025, 2026])

const monthlyChartRef = ref(null)
const typeChartRef = ref(null)
let monthlyChart = null
let typeChart = null

const formatAmount = (amount) => {
  if (!amount) return '0.00'
  return Number(amount).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const loadPersonalStats = async () => {
  try {
    const res = await getPersonalStats()
    if (res.code === 200 && res.data) {
      Object.assign(personalStats, res.data)
    }
  } catch (error) {
    console.error('Load personal stats failed:', error)
  }
}

const loadDepartmentStats = async () => {
  try {
    const res = await getDepartmentStats()
    if (res.code === 200 && res.data) {
      Object.assign(deptStats, res.data)
    }
    await nextTick()
    initTypeChart()
  } catch (error) {
    console.error('Load department stats failed:', error)
  }
}

const loadMonthlyStats = async () => {
  try {
    const res = await getMonthlyStats(selectedYear.value)
    if (res.code === 200 && res.data) {
      monthlyData.value = res.data.map(item => ({
        month: `${item.month}月`,
        count: item.count || 0,
        amount: item.amount || 0
      }))
    }
    await nextTick()
    initMonthlyChart()
  } catch (error) {
    console.error('Load monthly stats failed:', error)
  }
}

const initTypeChart = () => {
  if (!typeChartRef.value) return
  if (typeChart) typeChart.dispose()
  
  typeChart = echarts.init(typeChartRef.value)
  
  const option = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      name: '报销类型',
      type: 'pie',
      radius: '60%',
      data: deptStats.typeDistribution || [
        { value: 1048, name: '差旅费' },
        { value: 735, name: '办公用品' },
        { value: 580, name: '业务招待费' },
        { value: 484, name: '培训费' },
        { value: 300, name: '其他费用' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }
  
  typeChart.setOption(option)
}

const initMonthlyChart = () => {
  if (!monthlyChartRef.value) return
  if (monthlyChart) monthlyChart.dispose()
  
  monthlyChart = echarts.init(monthlyChartRef.value)
  
  const months = monthlyData.value.map(d => d.month)
  const amounts = monthlyData.value.map(d => d.amount)
  const counts = monthlyData.value.map(d => d.count)
  
  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['报销金额', '报销次数'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: months },
    yAxis: [
      { type: 'value', name: '金额(元)', position: 'left' },
      { type: 'value', name: '次数', position: 'right' }
    ],
    series: [
      {
        name: '报销金额',
        type: 'line',
        smooth: true,
        areaStyle: { opacity: 0.3 },
        data: amounts,
        itemStyle: { color: '#409EFF' }
      },
      {
        name: '报销次数',
        type: 'bar',
        yAxisIndex: 1,
        data: counts,
        itemStyle: { color: '#67C23A' }
      }
    ]
  }
  
  monthlyChart.setOption(option)
}

const handleTabChange = (tab) => {
  if (tab === 'department') {
    loadDepartmentStats()
  } else if (tab === 'monthly') {
    loadMonthlyStats()
  }
}

onMounted(() => {
  loadPersonalStats()
  
  window.addEventListener('resize', () => {
    if (monthlyChart) monthlyChart.resize()
    if (typeChart) typeChart.resize()
  })
})
</script>

<style scoped>
.statistics-page {
  padding: 20px;
}

.card-header {
  font-size: 18px;
  font-weight: 600;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.stat-value.amount {
  color: #F56C6C;
  font-size: 24px;
}

.stat-card.draft {
  border-left: 4px solid #909399;
}

.stat-card.pending {
  border-left: 4px solid #E6A23C;
}

.stat-card.approved {
  border-left: 4px solid #67C23A;
}

.stat-card.rejected {
  border-left: 4px solid #F56C6C;
}

.stat-card.total {
  border-left: 4px solid #409EFF;
}

.year-selector {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.chart-card {
  margin-top: 20px;
}

.chart-container {
  height: 350px;
  width: 100%;
}

.amount-text {
  color: #F56C6C;
  font-weight: 500;
}
</style>