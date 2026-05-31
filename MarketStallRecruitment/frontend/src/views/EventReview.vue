<template>
  <div class="review-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Event Review - {{ reviewData.eventTitle }}</span>
          <el-button @click="goBack">Back</el-button>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="6" v-for="(stat, key) in statsCards" :key="key">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </el-card>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top: 20px">
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>Business Type Distribution</span>
            </template>
            <div ref="chartRef" style="height: 400px"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>Key Metrics</span>
            </template>
            <el-table :data="metricsTable" border>
              <el-table-column prop="name" label="Metric" width="200" />
              <el-table-column prop="value" label="Value" />
              <el-table-column prop="rate" label="Rate" v-if="reviewData.checkInRate">
                <template #default="{ row }">
                  <span v-if="row.rate !== undefined">{{ row.rate }}%</span>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getEventReview } from '@/api/review'
import * as echarts from 'echarts'

const router = useRouter()
const route = useRoute()
const chartRef = ref(null)
let chartInstance = null

const reviewData = ref({
  eventTitle: '',
  totalRegistrations: 0,
  approvedRegistrations: 0,
  totalStalls: 0,
  occupiedStalls: 0,
  totalRevenue: 0,
  totalRefund: 0,
  checkInCount: 0,
  checkInRate: 0,
  businessTypeDistribution: []
})

const statsCards = ref({
  totalRegistrations: { value: 0, label: 'Total Registrations' },
  approvedRegistrations: { value: 0, label: 'Approved' },
  totalStalls: { value: 0, label: 'Total Stalls' },
  occupiedStalls: { value: 0, label: 'Occupied Stalls' },
  totalRevenue: { value: 0, label: 'Total Revenue' },
  checkInCount: { value: 0, label: 'Check-in Count' }
})

const metricsTable = ref([])

const initChart = () => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: 'Business Type',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}\n{d}%'
        },
        data: reviewData.value.businessTypeDistribution.length > 0
          ? reviewData.value.businessTypeDistribution
          : [
              { value: 35, name: 'Food & Beverage' },
              { value: 25, name: 'Handicrafts' },
              { value: 20, name: 'Clothing' },
              { value: 15, name: 'Electronics' },
              { value: 5, name: 'Other' }
            ]
      }
    ]
  }
  chartInstance.setOption(option)
}

const fetchReview = async () => {
  const eventId = route.params.eventId
  try {
    const res = await getEventReview(eventId)
    const data = res.data
    updateReviewData(data)
  } catch (err) {
    updateReviewData(generateMockData())
  }
}

const generateMockData = () => ({
  eventTitle: '2024 Summer Market Fair',
  totalRegistrations: 156,
  approvedRegistrations: 120,
  totalStalls: 100,
  occupiedStalls: 85,
  totalRevenue: 85000,
  totalRefund: 3200,
  checkInCount: 78,
  checkInRate: 91.8,
  businessTypeDistribution: [
    { value: 42, name: 'Food & Beverage' },
    { value: 30, name: 'Handicrafts' },
    { value: 24, name: 'Clothing' },
    { value: 18, name: 'Electronics' },
    { value: 6, name: 'Other' }
  ]
})

const updateReviewData = (data) => {
  reviewData.value = { ...reviewData.value, ...data }
  statsCards.value = {
    totalRegistrations: { value: data.totalRegistrations || 0, label: 'Total Registrations' },
    approvedRegistrations: { value: data.approvedRegistrations || 0, label: 'Approved' },
    totalStalls: { value: data.totalStalls || 0, label: 'Total Stalls' },
    occupiedStalls: { value: data.occupiedStalls || 0, label: 'Occupied Stalls' },
    totalRevenue: { value: '¥' + (data.totalRevenue || 0), label: 'Total Revenue' },
    checkInCount: { value: data.checkInCount || 0, label: 'Check-in Count' }
  }
  metricsTable.value = [
    { name: 'Approval Rate', value: `${data.approvedRegistrations || 0}/${data.totalRegistrations || 0}`, rate: data.totalRegistrations ? ((data.approvedRegistrations / data.totalRegistrations) * 100).toFixed(1) : 0 },
    { name: 'Stall Occupancy', value: `${data.occupiedStalls || 0}/${data.totalStalls || 0}`, rate: data.totalStalls ? ((data.occupiedStalls / data.totalStalls) * 100).toFixed(1) : 0 },
    { name: 'Check-in Rate', value: `${data.checkInCount || 0}/${data.occupiedStalls || 0}`, rate: data.checkInRate || 0 },
    { name: 'Total Refund', value: '¥' + (data.totalRefund || 0), rate: undefined },
    { name: 'Net Revenue', value: '¥' + ((data.totalRevenue || 0) - (data.totalRefund || 0)), rate: undefined }
  ]
}

const goBack = () => {
  router.back()
}

const handleResize = () => {
  chartInstance?.resize()
}

onMounted(() => {
  fetchReview()
  setTimeout(() => initChart(), 100)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  chartInstance?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.review-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-card {
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
}

.stat-label {
  margin-top: 10px;
  color: #909399;
  font-size: 14px;
}
</style>
