<template>
  <div>
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>营业报表</span>
          <div style="display: flex; gap: 10px; align-items: center">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
            />
            <el-button type="primary" @click="loadReport">查询</el-button>
          </div>
        </div>
      </template>

      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="8">
          <el-card style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white">
            <div style="font-size: 14px; opacity: 0.9">订单总数</div>
            <div style="font-size: 32px; font-weight: bold; margin-top: 10px">{{ summary.orderCount || 0 }}</div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white">
            <div style="font-size: 14px; opacity: 0.9">营业收入</div>
            <div style="font-size: 32px; font-weight: bold; margin-top: 10px">¥{{ (summary.totalAmount || 0).toFixed(2) }}</div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white">
            <div style="font-size: 14px; opacity: 0.9">平均消费</div>
            <div style="font-size: 32px; font-weight: bold; margin-top: 10px">¥{{ (summary.avgAmount || 0).toFixed(2) }}</div>
          </el-card>
        </el-col>
      </el-row>

      <el-card>
        <template #header>
          <span>每日明细</span>
        </template>
        <el-table :data="dailyData" border>
          <el-table-column prop="date" label="日期" />
          <el-table-column prop="orderCount" label="订单数" />
          <el-table-column label="营业额">
            <template #default="{ row }">
              ¥{{ (row.totalAmount || 0).toFixed(2) }}
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDailyReport, getSummaryReport } from '../api'

const dateRange = ref([])
const summary = ref({})
const dailyData = ref([])

function formatDate(date) {
  const d = new Date(date)
  const pad = n => String(n).padStart(2, '0')
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
}

function getDefaultRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  return [formatDate(start), formatDate(now)]
}

async function loadReport() {
  try {
    let [start, end] = dateRange.value || getDefaultRange()
    const startTime = start + ' 00:00:00'
    const endTime = end + ' 23:59:59'

    summary.value = await getSummaryReport(startTime, endTime)
    dailyData.value = await getDailyReport(startTime, endTime)
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  dateRange.value = getDefaultRange()
  loadReport()
})
</script>
